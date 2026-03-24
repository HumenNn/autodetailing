from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedModel
from apps.services.models import Service


class BookingStatus(models.TextChoices):
    PENDING = 'pending', 'Ожидает подтверждения'
    CONFIRMED = 'confirmed', 'Подтверждено'
    IN_PROGRESS = 'in_progress', 'В работе'
    COMPLETED = 'completed', 'Завершено'
    CANCELLED = 'cancelled', 'Отменено'
    NO_SHOW = 'no_show', 'Не явился'


class Booking(TimeStampedModel):
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings',
        verbose_name='Клиент'
    )
    service = models.ForeignKey(
        Service,
        on_delete=models.CASCADE,
        related_name='bookings',
        verbose_name='Услуга'
    )
    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_bookings',
        verbose_name='Сотрудник'
    )
    datetime = models.DateTimeField(verbose_name='Дата и время')
    status = models.CharField(
        max_length=20,
        choices=BookingStatus.choices,
        default=BookingStatus.PENDING
    )
    car_brand = models.CharField(max_length=100, verbose_name='Марка автомобиля')
    car_model = models.CharField(max_length=100, verbose_name='Модель автомобиля')
    car_plate = models.CharField(max_length=20, blank=True, verbose_name='Гос. номер')
    notes = models.TextField(blank=True, verbose_name='Комментарий')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        db_table = 'bookings'
        ordering = ['-datetime', '-created_at']
        verbose_name = 'Запись'
        verbose_name_plural = 'Записи'

    def __str__(self):
        return f"{self.customer.username} - {self.service.name} ({self.datetime})"


class Order(TimeStampedModel):
    order_status = models.TextChoices(
        'OrderStatus',
        'pending confirmed completed cancelled'
    )
    
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orders',
        verbose_name='Клиент'
    )
    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name='order',
        verbose_name='Запись'
    )
    status = models.CharField(
        max_length=20,
        choices=order_status.choices,
        default='pending'
    )
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_paid = models.BooleanField(default=False)
    payment_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'

    def __str__(self):
        return f"Заказ #{self.id} - {self.customer.username}"


class BookingProductUsage(TimeStampedModel):
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='product_usages'
    )
    product = models.ForeignKey(
        'inventory.Product',
        on_delete=models.CASCADE,
        related_name='usages'
    )
    quantity_used = models.DecimalField(max_digits=10, decimal_places=3)
    unit = models.CharField(max_length=20)
    
    class Meta:
        db_table = 'booking_product_usages'
        verbose_name = 'Использование расходника'
        verbose_name_plural = 'Использование расходников'
