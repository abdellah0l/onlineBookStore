from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('api/v1/auth/signup', views.auth_signup, name='auth_signup'),
    path('api/v1/auth/signin', views.auth_signin, name='auth_signin'),
    path('api/v1/auth/me', views.auth_me, name='auth_me'),
    path('api/v1/auth/logout', views.auth_logout, name='auth_logout'),
    
    # Books
    path('api/v1/recent-books', views.recent_books, name='recent_books'),
    path('api/v1/genres', views.genres_list, name='genres_list'),
    path('api/v1/books', views.books_list, name='books_list'),
    path('api/v1/books/<uuid:book_id>', views.get_book, name='get_book'),
    path('api/v1/books/<uuid:book_id>/read', views.books_read, name='books_read'),
    
    # Orders
    path('api/v1/orders/checkout', views.orders_checkout, name='orders_checkout'),
    path('api/v1/orders/wishlist', views.orders_wishlist, name='orders_wishlist'),
    
    # Me
    path('api/v1/me', views.me_profile, name='me_profile'),
    path('api/v1/webhooks/chargily', views.chargily_webhook, name='chargily_webhook'),
    
    # Admin
    path('api/v1/admin/dashboard', views.admin_dashboard, name='admin_dashboard'),
    path('api/v1/admin/books', views.admin_books, name='admin_books'),
    path('api/v1/admin/books/<uuid:book_id>', views.admin_book_detail, name='admin_book_detail'),
    path('api/v1/admin/genres', views.admin_genres, name='admin_genres'),
    path('api/v1/admin/genres/<uuid:genre_id>', views.admin_genre_detail, name='admin_genre_detail'),
    path('api/v1/admin/users', views.admin_users, name='admin_users'),
    path('api/v1/admin/users/<uuid:user_id>', views.admin_user_update, name='admin_user_update'),
    path('api/v1/admin/orders', views.admin_orders, name='admin_orders'),
    path('api/v1/admin/reviews', views.admin_reviews, name='admin_reviews'),
    path('api/v1/admin/analytics', views.admin_analytics, name='admin_analytics'),
]