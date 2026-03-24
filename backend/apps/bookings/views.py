from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Booking, Order, BookingStatus
from .serializers import (
    BookingSerializer, BookingCreateSerializer, 
    BookingAdminSerializer, OrderSerializer
)


class BookingCreateView(generics.CreateAPIView):
    serializer_class = BookingCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        booking = serializer.save()
        Order.objects.create(
            customer=self.request.user,
            booking=booking,
            total_amount=booking.total_price
        )


class CustomerBookingListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(customer=self.request.user)


class CustomerBookingDetailView(generics.RetrieveAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(customer=self.request.user)


class BookingCancelView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(
                pk=pk, 
                customer=request.user,
                status=BookingStatus.PENDING
            )
            booking.status = BookingStatus.CANCELLED
            booking.save()
            return Response({'status': 'cancelled'})
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Запись не найдена или уже подтверждена'},
                status=status.HTTP_404_NOT_FOUND
            )


class BookingManagementView(generics.ListAPIView):
    serializer_class = BookingAdminSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_owner() or user.is_admin():
            return Booking.objects.all()
        elif user.is_employee():
            return Booking.objects.filter(employee=user)
        return Booking.objects.none()

    def get_permissions(self):
        if self.request.user.is_owner() or self.request.user.is_admin():
            return [permissions.IsAuthenticated()]
        elif self.request.user.is_employee():
            return [permissions.IsAuthenticated()]
        return [permissions.DenyAll()]


class BookingManageDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = BookingAdminSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_owner() or user.is_admin():
            return Booking.objects.all()
        elif user.is_employee():
            return Booking.objects.filter(employee=user)
        return Booking.objects.none()


class BookingAssignView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if not (request.user.is_owner() or request.user.is_admin()):
            return Response(
                {'error': 'Недостаточно прав'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            booking = Booking.objects.get(pk=pk)
            employee_id = request.data.get('employee_id')
            
            if employee_id:
                from apps.users.models import User
                employee = User.objects.get(pk=employee_id, role='employee')
                booking.employee = employee
            
            booking.status = BookingStatus.CONFIRMED
            booking.save()
            
            return Response(BookingAdminSerializer(booking).data)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Запись не найдена'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class BookingStartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(
                pk=pk,
                employee=request.user
            )
            booking.status = BookingStatus.IN_PROGRESS
            booking.save()
            return Response({'status': 'started'})
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Запись не найдена'},
                status=status.HTTP_404_NOT_FOUND
            )


class BookingCompleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if not (request.user.is_owner() or request.user.is_admin()):
            return Response(
                {'error': 'Недостаточно прав'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            booking = Booking.objects.get(pk=pk)
            booking.status = BookingStatus.COMPLETED
            booking.save()
            
            order = booking.order
            order.status = 'completed'
            order.is_paid = True
            order.paid_amount = order.total_amount
            order.payment_date = timezone.now()
            order.save()
            
            return Response({'status': 'completed'})
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Запись не найдена'},
                status=status.HTTP_404_NOT_FOUND
            )


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user)
