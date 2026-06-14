from rest_framework import serializers
from .models import Categoria, Subcategoria, Ingreso, Gasto, Presupuesto, GastoRecurrente

class CategoriaSerializer(serializers.ModelSerializer):
    usuario = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Categoria
        fields = ('id', 'nombre', 'tipo', 'usuario')

class SubcategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subcategoria
        fields = ('id', 'categoria', 'nombre')

    def validate_categoria(self, value):
        user = self.context['request'].user
        if value.usuario != user:
            raise serializers.ValidationError("La categoría seleccionada no te pertenece.")
        return value

class IngresoSerializer(serializers.ModelSerializer):
    usuario = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Ingreso
        fields = ('id', 'monto', 'categoria', 'descripcion', 'fecha', 'usuario')

    def validate(self, data):
        user = self.context['request'].user
        categoria = data.get('categoria')
        
        if categoria:
            if categoria.usuario != user:
                raise serializers.ValidationError({"categoria": "La categoría seleccionada no te pertenece."})
            if categoria.tipo not in ['ingreso', 'ambos']:
                raise serializers.ValidationError({"categoria": "La categoría seleccionada debe ser de tipo 'ingreso' o 'ambos'."})
        
        return data

class GastoSerializer(serializers.ModelSerializer):
    usuario = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Gasto
        fields = ('id', 'monto', 'categoria', 'subcategoria', 'descripcion', 'fecha', 'usuario')

    def validate(self, data):
        user = self.context['request'].user
        categoria = data.get('categoria')
        subcategoria = data.get('subcategoria')

        if categoria:
            if categoria.usuario != user:
                raise serializers.ValidationError({"categoria": "La categoría seleccionada no te pertenece."})
            if categoria.tipo not in ['gasto', 'ambos']:
                raise serializers.ValidationError({"categoria": "La categoría seleccionada debe ser de tipo 'gasto' o 'ambos'."})

        if subcategoria:
            if not categoria:
                raise serializers.ValidationError({"subcategoria": "Debes especificar una categoría para seleccionar una subcategoría."})
            if subcategoria.categoria != categoria:
                raise serializers.ValidationError({"subcategoria": "La subcategoría no pertenece a la categoría seleccionada."})

        return data

class PresupuestoSerializer(serializers.ModelSerializer):
    usuario = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Presupuesto
        fields = ('id', 'categoria', 'monto', 'periodo', 'usuario')

    def validate(self, data):
        user = self.context['request'].user
        categoria = data.get('categoria')

        if categoria:
            if categoria.usuario != user:
                raise serializers.ValidationError({"categoria": "La categoría seleccionada no te pertenece."})
            if categoria.tipo not in ['gasto', 'ambos']:
                raise serializers.ValidationError({"categoria": "Solo puedes presupuestar categorías de tipo 'gasto' o 'ambos'."})

        return data

class GastoRecurrenteSerializer(serializers.ModelSerializer):
    usuario = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = GastoRecurrente
        fields = ('id', 'monto', 'frecuencia', 'categoria', 'descripcion', 'activo', 'ultimo_generado', 'usuario')

    def validate_categoria(self, value):
        user = self.context['request'].user
        if value and value.usuario != user:
            raise serializers.ValidationError("La categoría seleccionada no te pertenece.")
        return value
