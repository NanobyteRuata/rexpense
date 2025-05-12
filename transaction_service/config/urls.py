from django.urls import path, include
from rest_framework.routers import DefaultRouter
from transaction.views import TransactionViewSet, CategoryViewSet

router = DefaultRouter()
router.register(r'transaction', TransactionViewSet)
router.register(r'category', CategoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
