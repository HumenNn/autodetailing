from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import ServiceCategory, Service
from .serializers import (
    ServiceCategorySerializer, ServiceCategoryListSerializer,
    ServiceSerializer
)


class ServiceCategoryListView(generics.ListAPIView):
    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategoryListSerializer
    permission_classes = [permissions.AllowAny]


class ServiceCategoryDetailView(generics.RetrieveAPIView):
    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.AllowAny]


class ServiceListView(generics.ListAPIView):
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]


class ServiceDetailView(generics.RetrieveAPIView):
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]


class ServiceListByCategoryView(generics.ListAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        category_id = self.kwargs.get('category_id')
        return Service.objects.filter(
            category_id=category_id, 
            is_active=True
        )


class ServiceManagementView(generics.ListCreateAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.user.is_owner() or self.request.user.is_admin():
            return [permissions.IsAuthenticated()]
        return [permissions.DenyAll()]


class ServiceManageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.user.is_owner() or self.request.user.is_admin():
            return [permissions.IsAuthenticated()]
        return [permissions.DenyAll()]
