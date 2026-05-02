import json
import os
import requests
from decimal import Decimal, InvalidOperation
# simplified checkout uses `requests` directly
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from .models import User, Book, Order, Genre, Review
from .utils import hash_password, verify_password, create_jwt_token, verify_jwt_token
from django.db import IntegrityError
from django.db.models import Q, Sum, Count
from django.core.paginator import Paginator
from django.utils import timezone
from datetime import timedelta
import uuid


def get_request_data(request):
    try:
        return json.loads(request.body.decode("utf-8")) if request.body else {}
    except json.JSONDecodeError:
        return {}


def get_user_from_request(request):
    token = request.COOKIES.get('jwt')
    if not token:
        return None
    payload = verify_jwt_token(token)
    if not payload:
        return None
    try:
        user = User.objects.get(id=payload['user_id'], status='activated')
        return user
    except User.DoesNotExist:
        return None


def get_active_user_from_request(request):
    deactivated_message = "your account has been disactivated, you can't do this action"
    token = request.COOKIES.get('jwt')
    if not token:
        return None, JsonResponse({'success': False, 'message': 'Unauthorized'}, status=401)

    payload = verify_jwt_token(token)
    if not payload:
        return None, JsonResponse({'success': False, 'message': 'Unauthorized'}, status=401)

    try:
        user = User.objects.get(id=payload['user_id'])
    except User.DoesNotExist:
        return None, JsonResponse({'success': False, 'message': 'Unauthorized'}, status=401)

    if user.status != 'activated':
        return None, JsonResponse({'success': False, 'message': deactivated_message}, status=403)

    return user, None


@csrf_exempt
def auth_signup(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)
    
    data = get_request_data(request)
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()
    username = data.get('username', '').strip()
    
    if not email or not password or not username:
        return JsonResponse({'success': False, 'message': 'Email, password, and username are required'}, status=400)
    
    if User.objects.filter(email=email).exists():
        return JsonResponse({'success': False, 'message': 'Email already exists'}, status=400)
    
    if User.objects.filter(username=username).exists():
        return JsonResponse({'success': False, 'message': 'Username already exists'}, status=400)
    
    try:
        user = User.objects.create(
            username=username,
            email=email,
            password_hash=hash_password(password),
            role='user'
        )
        token = create_jwt_token(user.id, user.role)
        response = JsonResponse({
            'success': True,
            'message': 'User created successfully',
            'user': user.to_dict()
        })
        response.set_cookie('jwt', token, httponly=True, secure=False, samesite='Lax')  # secure=True in production
        return response
    except ValidationError as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)
    except IntegrityError:
        return JsonResponse({'success': False, 'message': 'Database integrity error'}, status=409)


@csrf_exempt
def auth_signin(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)
    
    data = get_request_data(request)
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()
    
    if not email or not password:
        return JsonResponse({'success': False, 'message': 'Email and password are required'}, status=400)

    deactivated_message = "your account has been disactivated, you can't do this action"
    
    try:
        user = User.objects.get(email=email)
        if user.status != 'activated':
            return JsonResponse({'success': False, 'message': deactivated_message}, status=403)

        if verify_password(password, user.password_hash):
            token = create_jwt_token(user.id, user.role)
            response = JsonResponse({
                'success': True,
                'message': 'Login successful',
                'user': user.to_dict()
            })
            response.set_cookie('jwt', token, httponly=True, secure=False, samesite='Lax')
            return response
        else:
            return JsonResponse({'success': False, 'message': 'Invalid credentials'}, status=401)
    except User.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Invalid credentials'}, status=401)


@csrf_exempt
def auth_me(request):
    if request.method != 'GET':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)
    
    user, error_response = get_active_user_from_request(request)
    if error_response:
        return error_response
    
    return JsonResponse({
        'success': True,
        'user': user.to_dict()
    })
@csrf_exempt
def auth_logout(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)
    
    response = JsonResponse({'success': True, 'message': 'Logged out'})
    response.delete_cookie('jwt')
    return response


def recent_books(request):
    if request.method != 'GET':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)
    
    books = Book.objects.prefetch_related('genres').all().order_by('-created_at')[:10]
    return JsonResponse({
        'success': True,
        'books': [book.to_dict() for book in books]
    })


def debug_checkout_state(book, amount, success_url, base_url):
    print(
        'Chargily checkout debug:',
        {
            'book_id': str(book.id),
            'book_title': book.title,
            'amount': amount,
            'currency': 'dzd',
            'success_url': success_url,
            'api_url': base_url,
        },
    )


def create_chargily_checkout(amount, book, user):
    secret_key = os.environ.get('CHARGILY_SECRET_KEY')
    if not secret_key:
        return None, None, {'success': False, 'message': 'CHARGILY_SECRET_KEY is not configured'}

    base_url = os.environ.get('CHARGILY_API_URL', 'https://pay.chargily.net/test/api/v2/checkouts').strip()
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173').strip().rstrip('/')
    success_url = os.environ.get('CHARGILY_SUCCESS_URL', f'{frontend_url}/profile').strip()
    
    payload = {
        'amount': amount,
        'currency': 'dzd',
        'success_url': success_url,
    }

    headers = {
        'Authorization': f'Bearer {secret_key}',
        'Content-Type': 'application/json',
    }

    try:
        resp = requests.post(base_url, json=payload, headers=headers, timeout=15)
        resp.raise_for_status()
        data = resp.json() if resp.text else {}
    except requests.RequestException as exc:
        return None, None, {'success': False, 'message': 'Chargily request failed', 'details': str(exc)}

    checkout_url = data.get('checkout_url') or data.get('url') or data.get('payment_url')
    payment_id = data.get('id') or data.get('checkout_id') or data.get('payment_id') or data.get('chargily_payment_id')

    if not checkout_url or not payment_id:
        return None, None, {'success': False, 'message': 'Chargily response missing checkout_url or id', 'details': data}

    return checkout_url, payment_id, None


def genres_list(request):
    if request.method != 'GET':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

    genres = Genre.objects.all().order_by('name')
    return JsonResponse({
        'success': True,
        'genres': [genre.to_dict() for genre in genres]
    })


def get_book(request, book_id):
    if request.method != 'GET':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)
    
    try:
        book = Book.objects.get(id=book_id)
        return JsonResponse({
            'success': True,
            'book': book.to_dict()
        })
    except Book.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Book not found'}, status=404)


@csrf_exempt
def orders_checkout(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

    user, error_response = get_active_user_from_request(request)
    if error_response:
        return error_response

    data = get_request_data(request)
    book_id = data.get('book_id')
    if not book_id:
        return JsonResponse({'success': False, 'message': 'book_id is required'}, status=400)

    try:
        book = Book.objects.get(id=book_id)
    except Book.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Book not found'}, status=404)

    try:
        amount = int(Decimal(str(book.price)).quantize(Decimal('1')))
    except (InvalidOperation, ValueError, TypeError):
        return JsonResponse({'success': False, 'message': 'Invalid book price'}, status=400)

    checkout_url, payment_id, err = create_chargily_checkout(amount, book, user)
    if err:
        return JsonResponse(err, status=502)

    Order.objects.create(
        user=user,
        book=book,
        status='pending',
        amount=book.price,
        chargily_payment_id=payment_id
    )

    return JsonResponse({'success': True, 'checkout_url': checkout_url, 'chargily_payment_id': payment_id})


@csrf_exempt
def orders_wishlist(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)
    
    user, error_response = get_active_user_from_request(request)
    if error_response:
        return error_response
    
    data = get_request_data(request)
    book_id = data.get('book_id')
    if not book_id:
        return JsonResponse({'success': False, 'message': 'book_id is required'}, status=400)
    
    try:
        book = Book.objects.get(id=book_id)
    except Book.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Book not found'}, status=404)
    
    # Check if already in wishlist or purchased
    if Order.objects.filter(user=user, book=book).exists():
        return JsonResponse({'success': False, 'message': 'Book already in wishlist'}, status=400)
    
    Order.objects.create(
        user=user,
        book=book,
        status='pending',
        amount=0  # wishlist
    )
    
    return JsonResponse({'success': True, 'message': 'Added to wishlist'})


def me_profile(request):
    if request.method != 'GET':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)
    
    user, error_response = get_active_user_from_request(request)
    if error_response:
        return error_response
    
    orders = Order.objects.filter(user=user).select_related('book')
    profile = {
        'id': str(user.id),
        'username': user.username,
        'email': user.email,
    }
    orders_data = [order.to_dict() for order in orders]
    
    return JsonResponse({
        'success': True,
        'profile': profile,
        'orders': orders_data
    })


def books_list(request):
    if request.method != 'GET':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)
    
    page = int(request.GET.get('page', 1))
    limit = int(request.GET.get('limit', 10))
    search = request.GET.get('search', '').strip()
    genre_id = request.GET.get('genre_id', '').strip()
    
    queryset = Book.objects.prefetch_related('genres').all()
    
    if search:
        queryset = queryset.filter(
            Q(title__icontains=search) | Q(author__icontains=search) | Q(description__icontains=search)
        )
    
    if genre_id:
        try:
            genre_uuid = uuid.UUID(genre_id)
            queryset = queryset.filter(genres__id=genre_uuid)
        except ValueError:
            pass
    
    paginator = Paginator(queryset, limit)
    books_page = paginator.get_page(page)
    
    books_data = []
    for book in books_page:
        book_dict = book.to_dict()
        books_data.append(book_dict)
    
    return JsonResponse({
        'success': True,
        'books': books_data,
        'pagination': {
            'page': page,
            'limit': limit,
            'total': paginator.count,
            'totalPages': paginator.num_pages
        }
    })


def book_to_admin_dict(book):
    data = book.to_dict()
    data['pdf_url'] = book.pdf_url
    return data


def _is_admin(user):
    return user and getattr(user, 'role', None) == 'admin'


def admin_dashboard(request):
    if request.method != 'GET':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

    user, error_response = get_active_user_from_request(request)
    if error_response:
        return error_response
    if not _is_admin(user):
        return JsonResponse({'success': False, 'message': 'Unauthorized'}, status=401)

    books_num = Book.objects.count()
    users_num = User.objects.count()
    total_money_amount = float(Order.objects.filter(status='finished').aggregate(total=Sum('amount'))['total'] or 0)

    top_selling = (
        Book.objects.filter(orders__status='finished')
        .annotate(sales_count=Count('orders'))
        .order_by('-sales_count', 'title')[:5]
    )

    latest_orders = Order.objects.filter(status='finished').select_related('book', 'user').order_by('-purchased_at')[:5]
    recent_reviews = Review.objects.select_related('user', 'book').order_by('-created_at')[:5]
    numbers_of_users_per_month = []
    today = timezone.now().date()
    for offset in range(2, -1, -1):
        month_anchor = (today.replace(day=1) - timedelta(days=offset * 31)).replace(day=1)
        next_month = (month_anchor + timedelta(days=32)).replace(day=1)
        count = User.objects.filter(created_at__date__gte=month_anchor, created_at__date__lt=next_month).count()
        numbers_of_users_per_month.append({'month': month_anchor.strftime('%Y-%m'), 'count': count})

    return JsonResponse({
        'success': True,
        'data': {
            'booksNum': books_num,
            'usersNum': users_num,
            'totalMoneyAmount': total_money_amount,
            'topSellingBooks': [
                {'id': str(book.id), 'title': book.title, 'author': book.author}
                for book in top_selling
            ],
            'latestOrders': [
                {
                    'id': str(order.id),
                    'book': {'id': str(order.book.id), 'title': order.book.title},
                    'user': {'id': str(order.user.id), 'username': order.user.username},
                    'purchased_at': order.purchased_at.isoformat() if order.purchased_at else None,
                    'amount': float(order.amount),
                }
                for order in latest_orders
            ],
            'recentReviews': [
                {
                    'id': str(review.id),
                    'user': {'id': str(review.user.id), 'username': review.user.username},
                    'rating': float(review.rating),
                    'content': review.content,
                }
                for review in recent_reviews
            ],
            'numbersOfUsersPerMonth': numbers_of_users_per_month,
        }
    })


def admin_books(request):
    if request.method == 'GET':
        user, error_response = get_active_user_from_request(request)
        if error_response:
            return error_response
        if not _is_admin(user):
            return JsonResponse({'success': False, 'message': 'Unauthorized'}, status=401)

        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 20))
        search = request.GET.get('search', '').strip()
        genre_id = request.GET.get('genre_id', '').strip()

        queryset = Book.objects.prefetch_related('genres').all()
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(author__icontains=search) | Q(description__icontains=search)
            )
        if genre_id:
            try:
                gid = uuid.UUID(genre_id)
                queryset = queryset.filter(genres__id=gid)
            except ValueError:
                pass

        paginator = Paginator(queryset, limit)
        books_page = paginator.get_page(page)

        return JsonResponse({
            'success': True,
            'books': [book_to_admin_dict(b) for b in books_page],
            'pagination': {
                'page': page,
                'limit': limit,
                'total': paginator.count,
                'totalPages': paginator.num_pages
            }
        })

    elif request.method == 'POST':
        user, error_response = get_active_user_from_request(request)
        if error_response:
            return error_response
        if not _is_admin(user):
            return JsonResponse({'success': False, 'message': 'Unauthorized'}, status=401)

        data = get_request_data(request)
        title = data.get('title')
        author = data.get('author')
        price = data.get('price')
        pdf_url = data.get('pdf_url')
        genres_ids = data.get('genresIds') or []

        if not title or not author or price is None or not pdf_url or not genres_ids:
            return JsonResponse({'success': False, 'message': 'Missing required fields'}, status=400)

        try:
            book = Book.objects.create(title=title, author=author, price=Decimal(str(price)), pdf_url=pdf_url)
            # attach genres
            for gid in genres_ids:
                try:
                    g = Genre.objects.get(id=uuid.UUID(gid))
                    book.genres.add(g)
                except Exception:
                    continue
            book.save()
        except Exception as exc:
            return JsonResponse({'success': False, 'message': 'Failed to create book', 'details': str(exc)}, status=500)

        return JsonResponse({'success': True, 'message': 'Book created', 'book': book_to_admin_dict(book)})


def admin_book_detail(request, book_id):
    user, error_response = get_active_user_from_request(request)
    if error_response:
        return error_response
    if not _is_admin(user):
        return JsonResponse({'success': False, 'message': 'Unauthorized'}, status=401)

    try:
        book = Book.objects.get(id=book_id)
    except Book.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Book not found'}, status=404)

    if request.method == 'PUT':
        data = get_request_data(request)
        for field in ('title', 'author', 'description', 'cover_image_url', 'pdf_url'):
            if field in data:
                setattr(book, field, data[field])
        if 'price' in data:
            try:
                book.price = Decimal(str(data['price']))
            except Exception:
                pass
        if 'genresIds' in data:
            book.genres.clear()
            for gid in data.get('genresIds', []):
                try:
                    g = Genre.objects.get(id=uuid.UUID(gid))
                    book.genres.add(g)
                except Exception:
                    continue
        book.save()
        return JsonResponse({'success': True, 'message': 'Book updated', 'book': book_to_admin_dict(book)})

    if request.method == 'DELETE':
        book.delete()
        return JsonResponse({'success': True, 'message': 'Book deleted'})

    return JsonResponse({'success': True, 'book': book_to_admin_dict(book)})


def admin_genres(request):
    user, error_response = get_active_user_from_request(request)
    if error_response:
        return error_response
    if not _is_admin(user):
        return JsonResponse({'success': False, 'message': 'Unauthorized'}, status=401)

    if request.method == 'GET':
        genres = Genre.objects.all().order_by('name')
        return JsonResponse({'success': True, 'genres': [g.to_dict() for g in genres]})

    if request.method == 'POST':
        data = get_request_data(request)
        name = data.get('name')
        if not name:
            return JsonResponse({'success': False, 'message': 'name is required'}, status=400)
        g = Genre.objects.create(name=name)
        return JsonResponse({'success': True, 'message': 'Genre created', 'genre': g.to_dict()})


def admin_genre_detail(request, genre_id):
    user, error_response = get_active_user_from_request(request)
    if error_response:
        return error_response
    if not _is_admin(user):
        return JsonResponse({'success': False, 'message': 'Unauthorized'}, status=401)

    try:
        genre = Genre.objects.get(id=genre_id)
    except Genre.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Genre not found'}, status=404)

    if request.method == 'PUT':
        data = get_request_data(request)
        name = data.get('name')
        if not name:
            return JsonResponse({'success': False, 'message': 'name is required'}, status=400)
        genre.name = name
        genre.save()
        return JsonResponse({'success': True, 'message': 'Genre updated', 'genre': genre.to_dict()})

    if request.method == 'DELETE':
        genre.delete()
        return JsonResponse({'success': True, 'message': 'Genre deleted'})

    return JsonResponse({'success': True, 'genre': genre.to_dict()})


def admin_users(request):
    user, error_response = get_active_user_from_request(request)
    if error_response:
        return error_response
    if not _is_admin(user):
        return JsonResponse({'success': False, 'message': 'Unauthorized'}, status=401)

    page = int(request.GET.get('page', 1))
    limit = int(request.GET.get('limit', 20))
    search = request.GET.get('search', '').strip()

    queryset = User.objects.all()
    if search:
        queryset = queryset.filter(Q(username__icontains=search) | Q(email__icontains=search))

    paginator = Paginator(queryset, limit)
    users_page = paginator.get_page(page)

    return JsonResponse({'success': True, 'users': [u.to_dict() for u in users_page], 'pagination': {'page': page, 'limit': limit, 'total': paginator.count, 'totalPages': paginator.num_pages}})


def admin_user_update(request, user_id):
    admin, error_response = get_active_user_from_request(request)
    if error_response:
        return error_response
    if not _is_admin(admin):
        return JsonResponse({'success': False, 'message': 'Unauthorized'}, status=401)

    try:
        u = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'User not found'}, status=404)

    if request.method != 'PUT':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

    data = get_request_data(request)
    status_val = data.get('status')
    if status_val not in ('activated', 'disactivated'):
        return JsonResponse({'success': False, 'message': 'Invalid status'}, status=400)
    u.status = status_val
    u.save()
    return JsonResponse({'success': True, 'message': 'User updated', 'user': u.to_dict()})


def admin_orders(request):
    admin, error_response = get_active_user_from_request(request)
    if error_response:
        return error_response
    if not _is_admin(admin):
        return JsonResponse({'success': False, 'message': 'Unauthorized'}, status=401)

    page = int(request.GET.get('page', 1))
    limit = int(request.GET.get('limit', 20))
    search = request.GET.get('search', '').strip()

    queryset = Order.objects.exclude(status='pending')
    if search:
        queryset = queryset.filter(
            Q(user__username__icontains=search) | Q(book__title__icontains=search) | Q(status__icontains=search)
        )

    paginator = Paginator(queryset.select_related('user', 'book'), limit)
    page_obj = paginator.get_page(page)

    return JsonResponse({
        'success': True,
        'orders': [
            {
                'id': str(order.id),
                'user': {
                    'id': str(order.user.id),
                    'username': order.user.username,
                },
                'book': {
                    'id': str(order.book.id),
                    'title': order.book.title,
                },
                'amount': float(order.amount),
                'status': order.status,
            }
            for order in page_obj
        ],
        'pagination': {
            'page': page,
            'limit': limit,
            'total': paginator.count,
            'totalPages': paginator.num_pages,
        }
    })


def admin_reviews(request):
    admin, error_response = get_active_user_from_request(request)
    if error_response:
        return error_response
    if not _is_admin(admin):
        return JsonResponse({'success': False, 'message': 'Unauthorized'}, status=401)

    page = int(request.GET.get('page', 1))
    limit = int(request.GET.get('limit', 20))
    search = request.GET.get('search', '').strip()

    queryset = Review.objects.select_related('user', 'book')
    if search:
        queryset = queryset.filter(
            Q(user__username__icontains=search)
            | Q(book__title__icontains=search)
            | Q(content__icontains=search)
        )

    paginator = Paginator(queryset.order_by('-created_at'), limit)
    page_obj = paginator.get_page(page)

    return JsonResponse({
        'success': True,
        'reviews': [
            {
                'id': str(review.id),
                'user': {
                    'id': str(review.user.id),
                    'username': review.user.username,
                },
                'book': {
                    'id': str(review.book.id),
                    'title': review.book.title,
                },
                'rating': float(review.rating),
                'content': review.content,
            }
            for review in page_obj
        ],
        'pagination': {
            'page': page,
            'limit': limit,
            'total': paginator.count,
            'totalPages': paginator.num_pages,
        }
    })


def admin_analytics(request):
    admin, error_response = get_active_user_from_request(request)
    if error_response:
        return error_response
    if not _is_admin(admin):
        return JsonResponse({'success': False, 'message': 'Unauthorized'}, status=401)

    period = request.GET.get('type', 'monthly')
    # Minimal analytics: return sales per day for last 7 days
    today = timezone.now().date()
    sales = []
    for i in range(7):
        day = today - timedelta(days=i)
        total = Order.objects.filter(status='finished', purchased_at__date=day).aggregate(total=Sum('amount'))['total'] or 0
        sales.append({'date': str(day), 'totalAmount': float(total)})

    return JsonResponse({'success': True, 'data': {'sales': sales, 'ordersCount': Order.objects.filter(status='finished').count()}})


def books_read(request, book_id):
    if request.method != 'GET':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)
    
    user, error_response = get_active_user_from_request(request)
    if error_response:
        return error_response
    
    try:
        book = Book.objects.get(id=book_id)
    except Book.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Book not found'}, status=404)
    
    # Check if user has purchased
    if not Order.objects.filter(user=user, book=book, status='finished').exists():
        return JsonResponse({'success': False, 'message': 'Book not purchased'}, status=403)

    
    return JsonResponse({
        'success': True,
        'pdf_signed_url': book.pdf_url,
        'title': book.title
    })


@csrf_exempt
def chargily_webhook(request):
    # Minimal webhook handler: expects JSON with chargily_payment_id and status
    # In production validate signature/header provided by Chargily
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

    data = get_request_data(request)
    payment_id = data.get('chargily_payment_id') or data.get('payment_id')
    status = data.get('status') or data.get('event')

    if not payment_id:
        return JsonResponse({'success': False, 'message': 'Missing payment id'}, status=400)

    try:
        order = Order.objects.get(chargily_payment_id=payment_id)
        if status in ('paid', 'checkout.paid', 'paid_success'):
            order.status = 'finished'
            order.purchased_at = timezone.now()
            order.save()
        elif status in ('cancelled', 'failed'):
            order.status = 'cancelled'
            order.save()
        # else: ignore other statuses
    except Order.DoesNotExist:
        # If order doesn't exist, we might create one or ignore; we'll ignore for now
        pass

    return JsonResponse({'success': True})
