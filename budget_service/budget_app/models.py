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
  user = models.ForeignKey(UserReference, on_delete=models.CASCADE, null=True, blank=True)
  name = models.CharField(max_length=100)
  amount = models.DecimalField(max_digits=10, decimal_places=2)
  created_at = models.DateTimeField(auto_now_add=True)
