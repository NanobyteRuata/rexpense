import requests
from django.conf import settings
from .models import UserReference
import logging

logger = logging.getLogger(__name__)

def send_user_fetch_request(user_id):
    USER_SERVICE_URL = getattr(settings, "USER_APP_URL", "http://user-service:3000")
    url = f"{USER_SERVICE_URL}/users/{user_id}/"
    headers = {"X-Internal-Secret": settings.INTERNAL_API_SECRET}
    try:
        resp = requests.get(url, headers=headers, timeout=5)
        resp.raise_for_status()
        user = resp.json().get('data')
        if not user:
            return None
        user_ref, _ = UserReference.objects.update_or_create(id=user_id, defaults={
            'email': user.get('email'),
            'name': user.get('name'),
            'is_admin': user.get('is_admin', False),
        })
        return user_ref
    except Exception as e:
        logger.error(f"Error fetching user data: {e}")
        return None