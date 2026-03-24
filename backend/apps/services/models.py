from django.db import models
from apps.core.models import TimeStampedModel


class ServiceCategory(TimeStampedModel):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text='Icon class name')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'service_categories'
        ordering = ['order', 'name']
        verbose_name = 'Категория услуг'
        verbose_name_plural = 'Категории услуг'

    def __str__(self):
        return self.name


class Service(TimeStampedModel):
    category = models.ForeignKey(
        ServiceCategory, 
        on_delete=models.CASCADE,
        related_name='services',
        verbose_name='Категория'
    )
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_minutes = models.PositiveIntegerField(help_text='Длительность в минутах')
    image = models.ImageField(upload_to='services/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'services'
        ordering = ['order', 'name']
        verbose_name = 'Услуга'
        verbose_name_plural = 'Услуги'

    def __str__(self):
        return f"{self.name} - {self.price} ₽"


class ServiceProduct(TimeStampedModel):
    service = models.ForeignKey(
        Service,
        on_delete=models.CASCADE,
        related_name='required_products'
    )
    product = models.ForeignKey(
        'inventory.Product',
        on_delete=models.CASCADE,
        related_name='used_in_services'
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=3)
    unit = models.CharField(max_length=20, help_text='Ед. измерения (мл, г, шт)')

    class Meta:
        db_table = 'service_products'
        verbose_name = 'Расходник для услуги'
        verbose_name_plural = 'Расходники для услуг'

    def __str__(self):
        return f"{self.service.name} - {self.product.name}"
