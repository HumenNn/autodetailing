from django.urls import path
from .views import (
    ServiceCategoryListView, ServiceCategoryDetailView,
    ServiceListView, ServiceDetailView, ServiceListByCategoryView,
    ServiceManagementView, ServiceManageDetailView
)

urlpatterns = [
    path('categories/', ServiceCategoryListView.as_view(), name='category_list'),
    path('categories/<int:pk>/', ServiceCategoryDetailView.as_view(), name='category_detail'),
    path('', ServiceListView.as_view(), name='service_list'),
    path('<int:pk>/', ServiceDetailView.as_view(), name='service_detail'),
    path('category/<int:category_id>/', ServiceListByCategoryView.as_view(), name='service_by_category'),
    path('manage/', ServiceManagementView.as_view(), name='service_manage_list'),
    path('manage/<int:pk>/', ServiceManageDetailView.as_view(), name='service_manage_detail'),
]
