from rest_framework import serializers
from .models import ServiceCategory, Service, ServiceProduct


class ServiceProductSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_unit = serializers.CharField(source='product.unit', read_only=True)

    class Meta:
        model = ServiceProduct
        fields = ('id', 'product', 'product_name', 'product_unit', 'quantity', 'unit')


class ServiceSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    required_products = ServiceProductSerializer(many=True, read_only=True)

    class Meta:
        model = Service
        fields = ('id', 'category', 'category_name', 'name', 'description', 
                  'price', 'duration_minutes', 'image', 'is_active', 
                  'order', 'required_products', 'created_at', 'updated_at')


class ServiceCategorySerializer(serializers.ModelSerializer):
    services = ServiceSerializer(many=True, read_only=True)

    class Meta:
        model = ServiceCategory
        fields = ('id', 'name', 'description', 'icon', 'order', 'services', 
                  'created_at', 'updated_at')


class ServiceCategoryListSerializer(serializers.ModelSerializer):
    services_count = serializers.IntegerField(source='services.count', read_only=True)

    class Meta:
        model = ServiceCategory
        fields = ('id', 'name', 'description', 'icon', 'order', 'services_count')
