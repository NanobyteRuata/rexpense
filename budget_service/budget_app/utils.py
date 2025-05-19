import requests
from django.conf import settings

def get_sum_spent(user_id, category, period_start, period_end):
    TRANSACTION_SERVICE_URL = getattr(settings, "TRANSACTION_SERVICE_URL", "http://transaction_service:8000")
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