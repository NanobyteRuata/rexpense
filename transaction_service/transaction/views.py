from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum, Q
from .models import Transaction, Category
from .serializers import TransactionReadSerializer, TransactionWriteSerializer, CategorySerializer
from rest_framework.permissions import IsAuthenticated
from .mixin import ReadWriteSerializerMixin
from rest_framework.exceptions import AuthenticationFailed
from .permissions import AllowInternalOrAuthenticated
from .utils import send_user_fetch_request
from .models import UserReference
from kafka_app.producer import KafkaProducer
from kafka_app.constants import KafkaTopics
import logging

logger = logging.getLogger(__name__)

kafka_producer = KafkaProducer()

def emit_transaction_event(topic, payload, user_id):
    payload['user'] = user_id
    kafka_producer.emit_event(
        topic=topic,
        payload=payload
    )

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
        user_id = self.request.user.id
        if not UserReference.objects.filter(id=user_id).exists():
            send_user_fetch_request(user_id)

        if self.request.user.is_admin:
            serializer.save()
        else:
            serializer.save(user_id=user_id)
        
        payload = serializer.data
        emit_transaction_event(
            topic=KafkaTopics.TRANSACTION_CREATED,
            payload=payload,
            user_id=user_id
        )

    def perform_update(self, serializer):
        serializer.save()
        payload = serializer.data
        emit_transaction_event(
            topic=KafkaTopics.TRANSACTION_UPDATED,
            payload=payload,
            user_id=self.request.user.id
        )

    def perform_destroy(self, instance):
        payload = TransactionReadSerializer(instance).data
        instance.delete()
        emit_transaction_event(
            topic=KafkaTopics.TRANSACTION_DELETED,
            payload=payload,
            user_id=self.request.user.id
        )

    @action(detail=False, methods=['get'])
    def balance(self, request):
        totals = Transaction.objects.filter(user_id=request.user.id).values('transaction_type').annotate(
            total=Sum('amount')
        ).order_by('transaction_type')
        
        income = next((item['total'] for item in totals if item['transaction_type'] == 'income'), 0)
        expense = next((item['total'] for item in totals if item['transaction_type'] == 'expense'), 0)
        
        return Response({'income': income, 'expense': expense, 'balance': income - expense})
    
    @action(detail=False, methods=['get'], permission_classes=[AllowInternalOrAuthenticated])
    def sum(self, request):
        user_id = request.GET.get('user_id') or self.request.user.id
        category_id = request.GET.get('category')
        start = request.GET.get('start')
        end = request.GET.get('end')

        if not (user_id and category_id and start and end):
            return Response({"error": "Missing required parameters."}, status=400)

        try:
            # Convert category_id to int if needed
            category_id = int(category_id)
        except ValueError:
            return Response({"error": "Invalid category id."}, status=400)

        qs = Transaction.objects.filter(
            user_id=user_id,
            category_id=category_id,
            transaction_type="expense",
            date__gte=start,
            date__lte=end
        )
        total = qs.aggregate(sum=Sum('amount'))['sum'] or 0
        return Response({"sum": float(total)})

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
