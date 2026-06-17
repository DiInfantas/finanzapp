from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .serializers import RegistroSerializer, UsuarioSerializer, CustomTokenObtainPairSerializer

Usuario = get_user_model()

class RegistroView(generics.CreateAPIView):
    serializer_class = RegistroSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Crear categorías por defecto
        try:
            from finanzas.models import Categoria
            default_categories = [
                ('Sueldo', 'ingreso'),
                ('Inversiones', 'ingreso'),
                ('Comida', 'gasto'),
                ('Transporte', 'gasto'),
                ('Hogar', 'gasto'),
                ('Salud', 'gasto'),
                ('Servicios', 'gasto'),
                ('Otros', 'gasto'),
            ]
            for nombre, tipo in default_categories:
                Categoria.objects.get_or_create(usuario=user, nombre=nombre, tipo=tipo)
        except Exception as e:
            print("Error al crear categorías por defecto:", e)
        
        # Generar tokens automáticamente tras el registro
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'usuario': UsuarioSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = (permissions.AllowAny,)
