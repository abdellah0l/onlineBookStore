from django.db import models
from django.utils import timezone
import uuid


class User(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('user', 'User'),
    ]
    STATUS_CHOICES = [
        ('activated', 'Activated'),
        ('disactivated', 'Disactivated'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='activated')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "users"

    def to_dict(self):
        return {
            "id": str(self.id),
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "status": self.status,
        }


class Genre(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "genres"

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
        }


class Book(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    cover_image_url = models.TextField(blank=True, null=True)
    pdf_url = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    genres = models.ManyToManyField(Genre, through='BookGenre', related_name='books')

    class Meta:
        db_table = "books"

    def to_dict(self):
        return {
            "id": str(self.id),
            "title": self.title,
            "author": self.author,
            "rating": float(self.rating),
            "price": float(self.price),
            "description": self.description,
            "cover_image_url": self.cover_image_url,
            "genres": [
                {
                    "id": str(genre_id),
                    "name": genre_name,
                }
                for genre_id, genre_name in self.genres.values_list("id", "name")
            ],
        }


class BookGenre(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    genre = models.ForeignKey(Genre, on_delete=models.CASCADE)

    class Meta:
        db_table = "book_genres"
        unique_together = ('book', 'genre')


class Order(models.Model):
    STATUS_CHOICES = [
        ('finished', 'Finished'),
        ('pending', 'Pending'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    purchased_at = models.DateTimeField(blank=True, null=True)
    chargily_payment_id = models.CharField(max_length=255, unique=True, blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "orders"
        unique_together = ('user', 'book')

    def to_dict(self):
        return {
            "id": str(self.id),
            "book": {
                "id": str(self.book.id),
                "title": self.book.title,
                "cover_image_url": self.book.cover_image_url,
            },
            "purchased_at": self.purchased_at.isoformat() if self.purchased_at else None,
            "amount": float(self.amount),
            "status": self.status,
        }


class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='reviews')
    content = models.TextField(blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "reviews"
        unique_together = ('user', 'book')

    def to_dict(self):
        return {
            "id": str(self.id),
            "user": {
                "id": str(self.user.id),
                "username": self.user.username,
            },
            "rating": float(self.rating),
            "content": self.content,
        }