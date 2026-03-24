from django.contrib.auth.models import AbstractUser
from django.db import models


class UserRole(models.TextChoices):
    CUSTOMER = 'customer', 'Клиент'
    EMPLOYEE = 'employee', 'Сотрудник'
    ADMIN = 'admin', 'Администратор'
    OWNER = 'owner', 'Владелец'


class User(AbstractUser):
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.CUSTOMER,
    )
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    
    class Meta:
        db_table = 'users'

    def is_customer(self):
        return self.role == UserRole.CUSTOMER

    def is_employee(self):
        return self.role == UserRole.EMPLOYEE

    def is_admin(self):
        return self.role == UserRole.ADMIN

    def is_owner(self):
        return self.role == UserRole.OWNER
