from rest_framework import serializers
from .models import Booking, Order, BookingProductUsage
from apps.services.serializers import ServiceSerializer
from apps.users.serializers import UserSerializer, EmployeeSerializer


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ('service', 'datetime', 'car_brand', 'car_model', 
                  'car_plate', 'notes')

    def create(self, validated_data):
        request = self.context.get('request')
        service = validated_data['service']
        
        booking = Booking.objects.create(
            customer=request.user,
            total_price=service.price,
            **validated_data
        )
        return booking


class BookingSerializer(serializers.ModelSerializer):
    service = ServiceSerializer(read_only=True)
    customer = UserSerializer(read_only=True)
    employee = UserSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Booking
        fields = ('id', 'customer', 'service', 'employee',
                  'datetime', 'status', 'status_display', 'car_brand',
                  'car_model', 'car_plate', 'notes', 'total_price',
                  'created_at', 'updated_at')
        read_only_fields = ('id', 'customer', 'service', 'employee', 'status', 
                            'total_price', 'created_at', 'updated_at')


class BookingAdminSerializer(serializers.ModelSerializer):
    service = ServiceSerializer(read_only=True)
    customer = UserSerializer(read_only=True)
    employee = EmployeeSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    service_id = serializers.IntegerField(write_only=True)
    employee_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Booking
        fields = ('id', 'customer', 'service', 'service_id', 'employee', 
                  'employee_id', 'datetime', 'status', 'status_display',
                  'car_brand', 'car_model', 'car_plate', 'notes', 
                  'total_price', 'created_at', 'updated_at')
        read_only_fields = ('id', 'customer', 'total_price', 'created_at', 'updated_at')


class OrderSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    booking = BookingSerializer(read_only=True)
    booking_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Order
        fields = ('id', 'customer', 'booking', 'booking_id', 'status',
                  'total_amount', 'paid_amount', 'is_paid', 'payment_date',
                  'created_at', 'updated_at')
        read_only_fields = ('id', 'customer', 'is_paid', 'payment_date',
                            'created_at', 'updated_at')


class BookingProductUsageSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = BookingProductUsage
        fields = ('id', 'booking', 'product', 'product_name', 
                  'quantity_used', 'unit', 'created_at')
