from rest_framework import serializers
from .models import Transaction, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']

class TransactionReadSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Transaction
        fields = ['id', 'transaction_type', 'amount', 'category', 'date', 'description']

class TransactionWriteSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Transaction
        fields = ['id', 'transaction_type', 'amount', 'category', 'date', 'description']
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero")
        return value
    
    def validate(self, data):
        request = self.context.get('request')
        if request and request.user:
            category = data.get('category')
            if category and category.user_id and category.user_id != request.user.id:
                raise serializers.ValidationError({'category': 'You cannot use categories created by other users'})

        return data
