from rest_framework.permissions import BasePermission
from django.conf import settings

class AllowInternalOrAuthenticated(BasePermission):
    def has_permission(self, request, view):
        internal_secret = request.headers.get("X-Internal-Secret")
        if internal_secret == getattr(settings, "INTERNAL_API_SECRET", None):
            return True
        return bool(request.user and request.user.is_authenticated)