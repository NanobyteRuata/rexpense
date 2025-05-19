from rest_framework import serializers
from .models import Budget
import calendar
from datetime import date, timedelta
from .utils import get_sum_spent

def get_month_start_end(year, month):
    start = date(year, month, 1)
    end = date(year, month, calendar.monthrange(year, month)[1])
    return start, end

class BudgetSerializer(serializers.ModelSerializer):
    period_start = serializers.DateField(required=False, allow_null=True)
    period_end = serializers.DateField(required=False, allow_null=True)
    spent = serializers.SerializerMethodField()
    remaining = serializers.SerializerMethodField()
    thresholds_crossed = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = ['id', 'name', 'amount', 'created_at', 'updated_at', 'category', 'description', 'period_type', 'period_start', 'period_end', 'thresholds', 'rollover', 'spent', 'remaining', 'thresholds_crossed']

    def get_spent(self, obj):
        return get_sum_spent(
            obj.user_id,
            obj.category,
            obj.period_start,
            obj.period_end
        )

    def get_remaining(self, obj):
        return float(obj.amount) - self.get_spent(obj)

    def get_thresholds_crossed(self, obj):
        spent = self.get_spent(obj)
        crossed = []
        for th in obj.thresholds or []:
            if spent >= float(obj.amount) * th:
                crossed.append(th)
        return crossed

    def validate(self, data):
        period_type = data.get('period_type', 'monthly')
        if period_type == 'monthly':
            today = date.today()
            data['period_start'], data['period_end'] = get_month_start_end(today.year, today.month)
        elif period_type == 'weekly':
            today = date.today()
            start = today - timedelta(days=today.weekday())
            end = start + timedelta(days=6)
            data['period_start'], data['period_end'] = start, end
        elif period_type == 'custom':
            if not data.get('period_start') or not data.get('period_end'):
                raise serializers.ValidationError("Custom period requires both start and end dates.")
        return data