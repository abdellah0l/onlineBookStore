from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('api/v1/auth/signup/', views.auth_signup, name='auth_signup'),
    path('api/v1/auth/signin/', views.auth_signin, name='auth_signin'),
    path('api/v1/auth/me/', views.auth_me, name='auth_me'),
    path('api/v1/auth/logout/', views.auth_logout, name='auth_logout'),
    
    # Books
    path('api/v1/recent-books/', views.recent_books, name='recent_books'),
    path('api/v1/books/', views.books_list, name='books_list'),
    path('api/v1/books/<uuid:book_id>/', views.get_book, name='get_book'),
    path('api/v1/books/<uuid:book_id>/read/', views.books_read, name='books_read'),
    
    # Orders
    path('api/v1/orders/checkout/', views.orders_checkout, name='orders_checkout'),
    path('api/v1/orders/wishlist/', views.orders_wishlist, name='orders_wishlist'),
    
    # Me
    path('api/v1/me/', views.me_profile, name='me_profile'),
]