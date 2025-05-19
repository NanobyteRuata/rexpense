from django.db import models

class UserReference(models.Model):
    """Proxy model to represent users from the user service"""
    id = models.IntegerField(primary_key=True)
    email = models.EmailField(null=True, blank=True)
    name = models.CharField(max_length=100, null=True, blank=True)
    is_admin = models.BooleanField(default=False)
    
    class Meta:
        managed = True  # We need to create this table
        
    def __str__(self):
        return f"User {self.id}"

class Budget(models.Model):
    PERIOD_TYPE_CHOICES = [
        ('monthly', 'Monthly'),
        ('weekly', 'Weekly'),
        ('custom', 'Custom'),
    ]

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    user = models.ForeignKey(UserReference, on_delete=models.CASCADE)
    category = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    period_type = models.CharField(max_length=10, choices=PERIOD_TYPE_CHOICES, default='monthly')
    period_start = models.DateField()
    period_end = models.DateField()
    thresholds = models.JSONField(default=list, blank=True)
    rollover = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
