from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoriaViewSet, SubcategoriaViewSet, IngresoViewSet, 
    GastoViewSet, PresupuestoViewSet, GastoRecurrenteViewSet
)

router = DefaultRouter()
router.register('categorias', CategoriaViewSet, basename='categoria')
router.register('subcategorias', SubcategoriaViewSet, basename='subcategoria')
router.register('ingresos', IngresoViewSet, basename='ingreso')
router.register('gastos', GastoViewSet, basename='gasto')
router.register('presupuestos', PresupuestoViewSet, basename='presupuesto')
router.register('gastos-recurrentes', GastoRecurrenteViewSet, basename='gastorecurrente')

urlpatterns = [
    path('', include(router.urls)),
]
