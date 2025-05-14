from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Budget
from .serializers import BudgetSerializer


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
        send_user_fetch_request(user_id)
    serializer.save(user_id=user_id)
