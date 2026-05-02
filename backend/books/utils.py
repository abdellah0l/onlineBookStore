import random
import jwt
import os
from datetime import datetime, timedelta
from django.contrib.auth.hashers import make_password, check_password


def generate_confirmation_code(length=6):
    """Generate a random numeric confirmation code."""
    return ''.join(str(random.randint(0, 9)) for _ in range(length))


def hash_password(password):
    return make_password(password)


def verify_password(password, hashed):
    return check_password(password, hashed)


def create_jwt_token(user_id, role):
    payload = {
        'user_id': str(user_id),
        'role': role,
        'exp': datetime.utcnow() + timedelta(days=7),  # expires in 7 days
        'iat': datetime.utcnow(),
    }
    secret = os.getenv('JWT_SECRET') or os.getenv('DJANGO_SECRET_KEY') or 'please-change-this-to-a-long-random-secret-key'
    token = jwt.encode(payload, secret, algorithm='HS256')
    return token


def verify_jwt_token(token):
    secret = os.getenv('JWT_SECRET') or os.getenv('DJANGO_SECRET_KEY') or 'please-change-this-to-a-long-random-secret-key'
    try:
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None