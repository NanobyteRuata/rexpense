from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum, Q
from .models import Transaction, Category
from .serializers import TransactionReadSerializer, TransactionWriteSerializer, CategorySerializer
from rest_framework.permissions import IsAuthenticated
from .mixin import ReadWriteSerializerMixin
from rest_framework.exceptions import AuthenticationFailed

class TransactionViewSet(ReadWriteSerializerMixin, viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    read_serializer_class = TransactionReadSerializer
    write_serializer_class = TransactionWriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_admin:
            return Transaction.objects.all()
        return Transaction.objects.filter(user_id=self.request.user.id)

    def perform_create(self, serializer):
        if self.request.user.is_admin:
            serializer.save()
        serializer.save(user_id=self.request.user.id)

    @action(detail=False, methods=['get'])
    def balance(self, request):
        totals = Transaction.objects.filter(user_id=request.user.id).values('transaction_type').annotate(
            total=Sum('amount')
        ).order_by('transaction_type')
        
        income = next((item['total'] for item in totals if item['transaction_type'] == 'income'), 0)
        expense = next((item['total'] for item in totals if item['transaction_type'] == 'expense'), 0)
        
        return Response({'income': income, 'expense': expense, 'balance': income - expense})

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(Q(user_id=self.request.user.id) | Q(user_id=None))
    
    def perform_create(self, serializer):
        serializer.save(user_id=self.request.user.id)
        
    def perform_update(self, serializer):
        instance = self.get_object()
        if instance.user_id != self.request.user.id:
            raise AuthenticationFailed('You are not authorized to update this transaction')
        serializer.save()
    
    def perform_destroy(self, instance):
        if instance.user_id != self.request.user.id:
            raise AuthenticationFailed('You are not authorized to delete this transaction')
        instance.delete()
