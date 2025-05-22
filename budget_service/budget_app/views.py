from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import AuthenticationFailed
from .models import Budget, UserReference
from .serializers import BudgetSerializer
from .utils import send_user_fetch_request
from kafka_app.producer import KafkaProducer
from kafka_app.constants import KafkaTopics

kafka_producer = KafkaProducer()

def emit_budget_event(topic, payload, user_id):
    payload['user'] = user_id
    kafka_producer.emit_event(
        topic=topic,
        payload=payload
    )

class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_admin:
            return Budget.objects.all()
        return Budget.objects.filter(user_id=self.request.user.id)

    def perform_create(self, serializer):
        user_id = self.request.user.id
        if not UserReference.objects.filter(id=user_id).exists():
            user_ref = send_user_fetch_request(user_id)
            if not user_ref:
                raise AuthenticationFailed('User not found')
        serializer.save(user_id=user_id)

        emit_budget_event(
            topic=KafkaTopics.BUDGET_CREATED,
            payload=serializer.data,
            user_id=user_id
        )

    def perform_update(self, serializer):
        serializer.save()
        emit_budget_event(
            topic=KafkaTopics.BUDGET_UPDATED,
            payload=serializer.data,
            user_id=self.request.user.id
        )

    def perform_destroy(self, instance):
        instance.delete()
        emit_budget_event(
            topic=KafkaTopics.BUDGET_DELETED,
            payload=instance,
            user_id=self.request.user.id
        )

