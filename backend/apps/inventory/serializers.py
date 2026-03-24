from rest_framework import serializers
from .models import ProductCategory, Product, StockMovement, Expense


class ProductCategorySerializer(serializers.ModelSerializer):
    products_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = ProductCategory
        fields = ('id', 'name', 'description', 'products_count', 
                  'created_at', 'updated_at')


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    needs_reorder = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = ('id', 'category', 'category_name', 'name', 'description',
                  'unit', 'min_stock', 'current_stock', 'price_per_unit',
                  'image', 'is_active', 'needs_reorder', 'created_at', 'updated_at')


class ProductStockUpdateSerializer(serializers.Serializer):
    quantity = serializers.DecimalField(max_digits=10, decimal_places=3)
    notes = serializers.CharField(required=False, allow_blank=True)


class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    movement_type_display = serializers.CharField(
        source='get_movement_type_display', 
        read_only=True
    )
    performed_by_name = serializers.CharField(
        source='performed_by.username', 
        read_only=True
    )

    class Meta:
        model = StockMovement
        fields = ('id', 'product', 'product_name', 'movement_type',
                  'movement_type_display', 'quantity', 'previous_stock',
                  'new_stock', 'notes', 'performed_by', 'performed_by_name',
                  'created_at')


class ExpenseSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(
        source='get_category_display', 
        read_only=True
    )
    created_by_name = serializers.CharField(
        source='created_by.username', 
        read_only=True
    )

    class Meta:
        model = Expense
        fields = ('id', 'category', 'category_display', 'amount',
                  'description', 'date', 'created_by', 'created_by_name',
                  'created_at', 'updated_at')
