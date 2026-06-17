from rest_framework import viewsets, permissions
from .models import Categoria, Subcategoria, Ingreso, Gasto, Presupuesto, GastoRecurrente
from .serializers import (
    CategoriaSerializer, SubcategoriaSerializer, IngresoSerializer, 
    GastoSerializer, PresupuestoSerializer, GastoRecurrenteSerializer
)

class CategoriaViewSet(viewsets.ModelViewSet):
    serializer_class = CategoriaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Categoria.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

class SubcategoriaViewSet(viewsets.ModelViewSet):
    serializer_class = SubcategoriaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Subcategoria.objects.filter(categoria__usuario=self.request.user)

class IngresoViewSet(viewsets.ModelViewSet):
    serializer_class = IngresoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Ingreso.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

class GastoViewSet(viewsets.ModelViewSet):
    serializer_class = GastoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Gasto.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

class PresupuestoViewSet(viewsets.ModelViewSet):
    serializer_class = PresupuestoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Presupuesto.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

class GastoRecurrenteViewSet(viewsets.ModelViewSet):
    serializer_class = GastoRecurrenteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return GastoRecurrente.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)
        # Generar inmediatamente el primer gasto físico para el usuario
        from .services import procesar_gastos_recurrentes
        try:
            procesar_gastos_recurrentes()
        except Exception as e:
            print("Error al procesar gastos recurrentes al crear:", e)
