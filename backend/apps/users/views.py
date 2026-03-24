from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .models import User, UserRole
from .serializers import (
    UserSerializer, UserCreateSerializer, 
    CustomTokenObtainPairSerializer, EmployeeSerializer
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [permissions.AllowAny]


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CustomTokenRefreshView(TokenRefreshView):
    pass


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class EmployeeListView(generics.ListAPIView):
    queryset = User.objects.filter(role=UserRole.EMPLOYEE)
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.user.is_owner() or self.request.user.is_admin():
            return [permissions.IsAuthenticated()]
        return [permissions.DenyAll()]
