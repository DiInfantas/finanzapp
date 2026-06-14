from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

Usuario = get_user_model()

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ('id', 'correo', 'nombre', 'date_joined')
        read_only_fields = ('id', 'date_joined')

class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = Usuario
        fields = ('correo', 'nombre', 'password')

    def validate_correo(self, value):
        if Usuario.objects.filter(correo=value).exists():
            raise serializers.ValidationError("Ya existe un usuario registrado con este correo electrónico.")
        return value

    def create(self, validated_data):
        user = Usuario.objects.create_user(
            correo=validated_data['correo'],
            nombre=validated_data['nombre'],
            password=validated_data['password']
        )
        # Inicializar categorías por defecto de forma segura
        from finanzas.services import crear_categorias_iniciales
        crear_categorias_iniciales(user)
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Agregar información del usuario a la respuesta JSON
        data['usuario'] = {
            'id': self.user.id,
            'nombre': self.user.nombre,
            'correo': self.user.correo
        }
        
        return data
