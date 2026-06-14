from django.contrib import admin
from .models import Categoria, Subcategoria, Ingreso, Gasto, Presupuesto, GastoRecurrente

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'usuario', 'tipo')
    list_filter = ('tipo', 'usuario')
    search_fields = ('nombre', 'usuario__nombre', 'usuario__correo')
    ordering = ('usuario', 'nombre')

@admin.register(Subcategoria)
class SubcategoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'categoria')
    list_filter = ('categoria__usuario', 'categoria')
    search_fields = ('nombre', 'categoria__nombre')
    ordering = ('categoria', 'nombre')

@admin.register(Ingreso)
class IngresoAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'monto', 'categoria', 'fecha')
    list_filter = ('fecha', 'usuario', 'categoria')
    search_fields = ('descripcion', 'usuario__nombre', 'usuario__correo')
    ordering = ('-fecha',)

@admin.register(Gasto)
class GastoAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'monto', 'categoria', 'subcategoria', 'fecha')
    list_filter = ('fecha', 'usuario', 'categoria')
    search_fields = ('descripcion', 'usuario__nombre', 'usuario__correo')
    ordering = ('-fecha',)

@admin.register(Presupuesto)
class PresupuestoAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'categoria', 'monto', 'periodo')
    list_filter = ('periodo', 'usuario', 'categoria')
    search_fields = ('usuario__nombre', 'usuario__correo', 'categoria__nombre')
    ordering = ('-periodo', 'usuario')

@admin.register(GastoRecurrente)
class GastoRecurrenteAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'monto', 'frecuencia', 'categoria', 'activo', 'ultimo_generado')
    list_filter = ('frecuencia', 'activo', 'usuario', 'categoria')
    search_fields = ('descripcion', 'usuario__nombre', 'usuario__correo')
    ordering = ('usuario', 'descripcion')
