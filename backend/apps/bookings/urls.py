from django.urls import path
from .views import (
    BookingCreateView, CustomerBookingListView, CustomerBookingDetailView,
    BookingCancelView, BookingManagementView, BookingManageDetailView,
    BookingAssignView, BookingStartView, BookingCompleteView, OrderListView
)

urlpatterns = [
    path('create/', BookingCreateView.as_view(), name='booking_create'),
    path('my/', CustomerBookingListView.as_view(), name='customer_booking_list'),
    path('my/<int:pk>/', CustomerBookingDetailView.as_view(), name='customer_booking_detail'),
    path('my/<int:pk>/cancel/', BookingCancelView.as_view(), name='booking_cancel'),
    path('manage/', BookingManagementView.as_view(), name='booking_manage_list'),
    path('manage/<int:pk>/', BookingManageDetailView.as_view(), name='booking_manage_detail'),
    path('manage/<int:pk>/assign/', BookingAssignView.as_view(), name='booking_assign'),
    path('manage/<int:pk>/start/', BookingStartView.as_view(), name='booking_start'),
    path('manage/<int:pk>/complete/', BookingCompleteView.as_view(), name='booking_complete'),
    path('orders/', OrderListView.as_view(), name='order_list'),
]
