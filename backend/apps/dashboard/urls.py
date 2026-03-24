from django.urls import path
from .views import (
    OwnerDashboardView, AdminDashboardView, 
    EmployeeDashboardView, CustomerDashboardView,
    RevenueChartView
)

urlpatterns = [
    path('owner/', OwnerDashboardView.as_view(), name='dashboard_owner'),
    path('admin/', AdminDashboardView.as_view(), name='dashboard_admin'),
    path('employee/', EmployeeDashboardView.as_view(), name='dashboard_employee'),
    path('customer/', CustomerDashboardView.as_view(), name='dashboard_customer'),
    path('revenue/', RevenueChartView.as_view(), name='dashboard_revenue'),
]
