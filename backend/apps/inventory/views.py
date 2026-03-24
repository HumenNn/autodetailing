from django.utils import timezone
from django.db import transaction
from django.db.models import F
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import ProductCategory, Product, StockMovement, Expense
from .serializers import (
    ProductCategorySerializer, ProductSerializer,
    StockMovementSerializer, ExpenseSerializer,
    ProductStockUpdateSerializer
)


class ProductCategoryListView(generics.ListAPIView):
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Product.objects.all()
        needs_reorder = self.request.query_params.get('needs_reorder')
        if needs_reorder == 'true':
            queryset = queryset.filter(current_stock__lte=F('min_stock'))
        return queryset

    def get_permissions(self):
        if self.request.user.is_owner() or self.request.user.is_admin():
            return [permissions.IsAuthenticated()]
        return [permissions.DenyAll()]


class ProductDetailView(generics.RetrieveUpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.user.is_owner() or self.request.user.is_admin():
            return [permissions.IsAuthenticated()]
        return [permissions.DenyAll()]


class ProductStockUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        if not (request.user.is_owner() or request.user.is_admin()):
            return Response(
                {'error': 'Недостаточно прав'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            product = Product.objects.get(pk=pk)
            serializer = ProductStockUpdateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            quantity = serializer.validated_data['quantity']
            notes = serializer.validated_data.get('notes', '')
            
            previous_stock = product.current_stock
            product.current_stock += quantity
            new_stock = product.current_stock
            product.save()
            
            StockMovement.objects.create(
                product=product,
                movement_type='receipt' if quantity > 0 else 'usage',
                quantity=abs(quantity),
                previous_stock=previous_stock,
                new_stock=new_stock,
                notes=notes,
                performed_by=request.user
            )
            
            return Response(ProductSerializer(product).data)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Товар не найден'},
                status=status.HTTP_404_NOT_FOUND
            )


class StockMovementListView(generics.ListAPIView):
    serializer_class = StockMovementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        product_id = self.request.query_params.get('product_id')
        queryset = StockMovement.objects.all()
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset.select_related('product', 'performed_by')

    def get_permissions(self):
        if self.request.user.is_owner() or self.request.user.is_admin():
            return [permissions.IsAuthenticated()]
        return [permissions.DenyAll()]


class ExpenseListView(generics.ListCreateAPIView):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.user.is_owner() or self.request.user.is_admin():
            return [permissions.IsAuthenticated()]
        return [permissions.DenyAll()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.user.is_owner() or self.request.user.is_admin():
            return [permissions.IsAuthenticated()]
        return [permissions.DenyAll()]
