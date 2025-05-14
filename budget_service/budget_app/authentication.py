import jwt
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings

class User:
    def __init__(self, decoded_token):
        self.id = decoded_token.get('id')
        self.email = decoded_token.get('email')
        self.is_admin = decoded_token.get('is_admin')
        self.device_id = decoded_token.get('device_id')

        if not self.id or not self.email:
            raise AuthenticationFailed('User info not found in token')
        self.is_authenticated = True

    def __str__(self):
        return f"User(id={self.id})"

class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None  # This returns error
        
        try:
            parts = auth_header.split()
            
            if len(parts) != 2:
                raise AuthenticationFailed('Invalid Authorization header format. Use "Bearer <token>"')
            
            auth_scheme = parts[0].lower()
            if auth_scheme != 'bearer':
                raise AuthenticationFailed(f'Unsupported authorization scheme: {auth_scheme}. Use "Bearer"')

            token = parts[1]
            decoded_token = jwt.decode(token, settings.JWT_ACCESS_SECRET, algorithms=["HS256"])

            user = User(decoded_token)
            return (user, None)
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.DecodeError:
            raise AuthenticationFailed('Invalid token')
        except (IndexError, ValueError):
            raise AuthenticationFailed('Invalid Authorization header format')