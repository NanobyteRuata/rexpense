import requests
from django.conf import settings
from .models import UserReference
import logging

logger = logging.getLogger(__name__)

def get_sum_spent(user_id, category, period_start, period_end):
    TRANSACTION_SERVICE_URL = getattr(settings, "TRANSACTION_APP_URL", "http://transaction-service:8000")
    url = f"{TRANSACTION_SERVICE_URL}/transaction/sum/"
    params = {
        "user_id": user_id,
        "category": category,
        "start": period_start,
        "end": period_end,
    }
    headers = {
        "X-Internal-Secret": settings.INTERNAL_API_SECRET
    }
    try:
        resp = requests.get(url, params=params, headers=headers, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        return data.get("sum", 0)
    except Exception as e:
        return 0

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