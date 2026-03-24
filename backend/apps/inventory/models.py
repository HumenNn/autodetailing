from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedModel


class ProductCategory(TimeStampedModel):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'product_categories'
        verbose_name = 'Категория товаров'
        verbose_name_plural = 'Категории товаров'

    def __str__(self):
        return self.name


class Product(TimeStampedModel):
    category = models.ForeignKey(
        ProductCategory,
        on_delete=models.CASCADE,
        related_name='products',
        verbose_name='Категория'
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    unit = models.CharField(max_length=20, help_text='Ед. измерения (мл, г, шт)')
    min_stock = models.DecimalField(
        max_digits=10, 
        decimal_places=3,
        help_text='Минимальный остаток'
    )
    current_stock = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'products'
        verbose_name = 'Товар'
        verbose_name_plural = 'Товары'

    def __str__(self):
        return f"{self.name} ({self.current_stock} {self.unit})"

    @property
    def needs_reorder(self):
        return self.current_stock <= self.min_stock


class StockMovement(TimeStampedModel):
    movement_type = models.TextChoices(
        'MovementType',
        'receipt usage adjustment return'
    )
    
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='movements'
    )
    movement_type = models.CharField(
        max_length=20,
        choices=movement_type.choices
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=3)
    previous_stock = models.DecimalField(max_digits=10, decimal_places=3)
    new_stock = models.DecimalField(max_digits=10, decimal_places=3)
    notes = models.TextField(blank=True)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='stock_movements'
    )

    class Meta:
        db_table = 'stock_movements'
        ordering = ['-created_at']
        verbose_name = 'Движение склада'
        verbose_name_plural = 'Движения склада'

    def __str__(self):
        return f"{self.product.name} - {self.movement_type} ({self.quantity})"


class Expense(TimeStampedModel):
    expense_category = models.TextChoices(
        'ExpenseCategory',
        'supplies utilities salary rent marketing equipment other'
    )
    
    category = models.CharField(
        max_length=30,
        choices=expense_category.choices
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField()
    date = models.DateField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )

    class Meta:
        db_table = 'expenses'
        ordering = ['-date', '-created_at']
        verbose_name = 'Расход'
        verbose_name_plural = 'Расходы'

    def __str__(self):
        return f"{self.get_category_display()} - {self.amount} ₽"
