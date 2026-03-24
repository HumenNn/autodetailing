from django.utils import timezone
from django.db.models import Sum, Count, Avg, F
from datetime import timedelta
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.bookings.models import Booking, BookingStatus, Order
from apps.users.models import User, UserRole
from apps.inventory.models import Product, Expense


class OwnerDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.user.is_owner():
            return [permissions.IsAuthenticated()]
        return [permissions.DenyAll()]

    def get(self, request):
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)

        total_bookings = Booking.objects.count()
        pending_bookings = Booking.objects.filter(status=BookingStatus.PENDING).count()
        confirmed_bookings = Booking.objects.filter(status=BookingStatus.CONFIRMED).count()
        today_bookings = Booking.objects.filter(
            datetime__date=today
        ).count()

        completed_orders = Order.objects.filter(status='completed')
        total_revenue = completed_orders.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        month_revenue = completed_orders.filter(
            created_at__gte=month_ago
        ).aggregate(Sum('total_amount'))['total_amount__sum'] or 0

        total_expenses = Expense.objects.aggregate(Sum('amount'))['amount__sum'] or 0
        month_expenses = Expense.objects.filter(
            date__gte=month_ago
        ).aggregate(Sum('amount'))['amount__sum'] or 0

        total_clients = User.objects.filter(role=UserRole.CUSTOMER).count()
        total_employees = User.objects.filter(role=UserRole.EMPLOYEE).count()

        low_stock_products = Product.objects.filter(
            current_stock__lte=F('min_stock')
        ).count()

        return Response({
            'bookings': {
                'total': total_bookings,
                'pending': pending_bookings,
                'confirmed': confirmed_bookings,
                'today': today_bookings,
            },
            'revenue': {
                'total': float(total_revenue),
                'month': float(month_revenue),
            },
            'expenses': {
                'total': float(total_expenses),
                'month': float(month_expenses),
            },
            'profit': {
                'month': float(month_revenue - month_expenses),
            },
            'clients': total_clients,
            'employees': total_employees,
            'low_stock_products': low_stock_products,
        })


class AdminDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.user.is_admin() or self.request.user.is_owner():
            return [permissions.IsAuthenticated()]
        return [permissions.DenyAll()]

    def get(self, request):
        today = timezone.now().date()

        all_bookings = Booking.objects.select_related(
            'customer', 'service', 'employee'
        ).filter(datetime__date=today)

        employees_queue = {}
        for employee in User.objects.filter(role=UserRole.EMPLOYEE):
            employee_bookings = Booking.objects.filter(
                employee=employee,
                status__in=[BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]
            ).order_by('datetime')
            
            employees_queue[employee.id] = {
                'employee': {
                    'id': employee.id,
                    'name': f'{employee.first_name} {employee.last_name}',
                },
                'queue': [
                    {
                        'id': b.id,
                        'datetime': b.datetime.isoformat(),
                        'service': b.service.name,
                        'customer': f'{b.customer.first_name} {b.customer.last_name}',
                        'car': f'{b.car_brand} {b.car_model}',
                        'status': b.status,
                        'duration': b.service.duration_minutes,
                    }
                    for b in employee_bookings
                ]
            }

        all_products = Product.objects.all()
        products_low_stock = [
            {
                'id': p.id,
                'name': p.name,
                'current_stock': float(p.current_stock),
                'min_stock': float(p.min_stock),
                'unit': p.unit,
            }
            for p in all_products if p.current_stock <= p.min_stock
        ]

        return Response({
            'employees_queue': employees_queue,
            'today_bookings_count': all_bookings.count(),
            'products_low_stock': products_low_stock,
            'total_clients': User.objects.filter(role=UserRole.CUSTOMER).count(),
        })


class EmployeeDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.user.is_employee():
            return [permissions.IsAuthenticated()]
        return [permissions.DenyAll()]

    def get(self, request):
        employee = request.user
        
        my_bookings = Booking.objects.filter(
            employee=employee
        ).select_related('service', 'customer').order_by('datetime')

        pending = my_bookings.filter(status=BookingStatus.PENDING)
        confirmed = my_bookings.filter(status=BookingStatus.CONFIRMED)
        in_progress = my_bookings.filter(status=BookingStatus.IN_PROGRESS)

        current_booking = None
        if in_progress.exists():
            b = in_progress.first()
            current_booking = {
                'id': b.id,
                'service': b.service.name,
                'customer': f'{b.customer.first_name} {b.customer.last_name}',
                'car': f'{b.car_brand} {b.car_model}',
                'car_plate': b.car_plate,
                'duration_minutes': b.service.duration_minutes,
                'required_products': [
                    {
                        'name': sp.product.name,
                        'quantity': float(sp.quantity),
                        'unit': sp.unit,
                    }
                    for sp in b.service.required_products.all()
                ]
            }

        upcoming = []
        for b in confirmed:
            upcoming.append({
                'id': b.id,
                'datetime': b.datetime.isoformat(),
                'service': b.service.name,
                'customer': f'{b.customer.first_name} {b.customer.last_name}',
                'car': f'{b.car_brand} {b.car_model}',
                'duration_minutes': b.service.duration_minutes,
            })

        return Response({
            'current_booking': current_booking,
            'upcoming': upcoming,
            'pending_count': pending.count(),
            'confirmed_count': confirmed.count(),
        })


class CustomerDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        customer = request.user
        
        my_bookings = Booking.objects.filter(
            customer=customer
        ).select_related('service', 'employee').order_by('-datetime')

        active = my_bookings.filter(
            status__in=[BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]
        )
        completed = my_bookings.filter(status=BookingStatus.COMPLETED)

        active_bookings = [
            {
                'id': b.id,
                'service': b.service.name,
                'datetime': b.datetime.isoformat(),
                'status': b.status,
                'status_display': b.get_status_display(),
                'employee': f'{b.employee.first_name} {b.employee.last_name}' if b.employee else None,
                'car': f'{b.car_brand} {b.car_model}',
                'price': float(b.total_price),
            }
            for b in active
        ]

        history = [
            {
                'id': b.id,
                'service': b.service.name,
                'datetime': b.datetime.isoformat(),
                'status': b.status,
                'status_display': b.get_status_display(),
                'price': float(b.total_price),
            }
            for b in completed[:10]
        ]

        my_orders = Order.objects.filter(customer=customer)
        total_spent = my_orders.filter(is_paid=True).aggregate(Sum('paid_amount'))['paid_amount__sum'] or 0

        return Response({
            'active_bookings': active_bookings,
            'history': history,
            'total_spent': float(total_spent),
            'bookings_count': my_bookings.count(),
        })


class RevenueChartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.user.is_owner() or self.request.user.is_admin():
            return [permissions.IsAuthenticated()]
        return [permissions.DenyAll()]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now().date() - timedelta(days=days)

        orders = Order.objects.filter(
            is_paid=True,
            created_at__gte=start_date
        )

        daily_revenue = orders.extra(
            select={'date': 'CAST(created_at AS date)'}
        ).values('date').annotate(
            revenue=Sum('total_amount')
        ).order_by('date')

        labels = []
        data = []
        for item in daily_revenue:
            labels.append(str(item['date']))
            data.append(float(item['revenue']) if item['revenue'] else 0)

        return Response({
            'labels': labels,
            'data': data,
        })
