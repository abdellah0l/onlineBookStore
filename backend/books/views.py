import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from .models import User, Book, Order, Genre
from .utils import hash_password, verify_password, create_jwt_token, verify_jwt_token
from django.db import IntegrityError
from django.db.models import Q
from django.core.paginator import Paginator
from django.utils import timezone
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
    
    try:
        user = User.objects.get(email=email, status='activated')
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
    
    user = get_user_from_request(request)
    if not user:
        return JsonResponse({'success': False, 'message': 'Unauthorized'}, status=401)
    
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
    
    user = get_user_from_request(request)
    if not user:
        return JsonResponse({'success': False, 'message': 'Unauthorized'}, status=401)
    
    data = get_request_data(request)
    book_id = data.get('book_id')
    if not book_id:
        return JsonResponse({'success': False, 'message': 'book_id is required'}, status=400)
    
    try:
        book = Book.objects.get(id=book_id)
    except Book.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Book not found'}, status=404)
    
    # Here, integrate with Chargily API to create checkout session
    # For now, mock it
    checkout_url = f"https://chargily.com/checkout/{uuid.uuid4()}"
    chargily_payment_id = str(uuid.uuid4())
    
    Order.objects.create(
        user=user,
        book=book,
        status='pending',  # will be updated by webhook
        amount=book.price,
        chargily_payment_id=chargily_payment_id
    )
    
    return JsonResponse({
        'success': True,
        'checkout_url': checkout_url,
        'chargily_payment_id': chargily_payment_id
    })


@csrf_exempt
def orders_wishlist(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)
    
    user = get_user_from_request(request)
    if not user:
        return JsonResponse({'success': False, 'message': 'Unauthorized'}, status=401)
    
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
        return JsonResponse({'success': False, 'message': 'Book already in orders'}, status=400)
    
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
    
    user = get_user_from_request(request)
    if not user:
        return JsonResponse({'success': False, 'message': 'Unauthorized'}, status=401)
    
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


def books_read(request, book_id):
    if request.method != 'GET':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)
    
    user = get_user_from_request(request)
    if not user:
        return JsonResponse({'success': False, 'message': 'Unauthorized'}, status=401)
    
    try:
        book = Book.objects.get(id=book_id)
    except Book.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Book not found'}, status=404)
    
    # Check if user has purchased
    if not Order.objects.filter(user=user, book=book, status='finished').exists():
        return JsonResponse({'success': False, 'message': 'Book not purchased'}, status=403)
    
    # Generate signed URL (mock for now)
    pdf_signed_url = f"https://s3.amazonaws.com/bucket/{book.pdf_url}?signature=mock&expires=1h"
    
    return JsonResponse({
        'success': True,
        'pdf_signed_url': pdf_signed_url,
        'title': book.title
    })
