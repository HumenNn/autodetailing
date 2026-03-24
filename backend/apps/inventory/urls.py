from django.urls import path
from .views import (
    ProductCategoryListView, ProductListView, ProductDetailView,
    ProductStockUpdateView, StockMovementListView,
    ExpenseListView, ExpenseDetailView
)

urlpatterns = [
    path('categories/', ProductCategoryListView.as_view(), name='product_category_list'),
    path('products/', ProductListView.as_view(), name='product_list'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product_detail'),
    path('products/<int:pk>/stock/', ProductStockUpdateView.as_view(), name='product_stock_update'),
    path('movements/', StockMovementListView.as_view(), name='stock_movement_list'),
    path('expenses/', ExpenseListView.as_view(), name='expense_list'),
    path('expenses/<int:pk>/', ExpenseDetailView.as_view(), name='expense_detail'),
]
