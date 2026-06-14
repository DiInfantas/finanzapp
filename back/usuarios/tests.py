from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from finanzas.models import Categoria, Subcategoria, Ingreso, Gasto
from datetime import date

class UsuarioModelTests(TestCase):
    def test_crear_usuario(self):
        Usuario = get_user_model()
        user = Usuario.objects.create_user(
            correo='test@example.com',
            nombre='Juan Pérez',
            password='testpassword123'
        )
        self.assertEqual(user.correo, 'test@example.com')
        self.assertEqual(user.nombre, 'Juan Pérez')
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertTrue(user.check_password('testpassword123'))

    def test_crear_superusuario(self):
        Usuario = get_user_model()
        admin = Usuario.objects.create_superuser(
            correo='admin@example.com',
            nombre='Administrador',
            password='adminpassword123'
        )
        self.assertEqual(admin.correo, 'admin@example.com')
        self.assertEqual(admin.nombre, 'Administrador')
        self.assertTrue(admin.is_active)
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.check_password('adminpassword123'))

    def test_crear_usuario_sin_correo(self):
        Usuario = get_user_model()
        with self.assertRaises(ValueError):
            Usuario.objects.create_user(
                correo='',
                nombre='Juan Pérez',
                password='password'
            )

class FinanzasModelTests(TestCase):
    def setUp(self):
        Usuario = get_user_model()
        self.usuario = Usuario.objects.create_user(
            correo='usuario@finanzas.com',
            nombre='Diego Torres',
            password='password123'
        )

    def test_crear_categoria_y_subcategoria(self):
        categoria = Categoria.objects.create(
            usuario=self.usuario,
            nombre='Alimentación',
            tipo='gasto'
        )
        self.assertEqual(categoria.nombre, 'Alimentación')
        self.assertEqual(categoria.tipo, 'gasto')
        self.assertEqual(categoria.usuario, self.usuario)

        subcategoria = Subcategoria.objects.create(
            categoria=categoria,
            nombre='Supermercado'
        )
        self.assertEqual(subcategoria.nombre, 'Supermercado')
        self.assertEqual(subcategoria.categoria, categoria)

    def test_crear_ingreso_y_gasto(self):
        categoria_ingreso = Categoria.objects.create(
            usuario=self.usuario,
            nombre='Sueldo',
            tipo='ingreso'
        )
        ingreso = Ingreso.objects.create(
            usuario=self.usuario,
            monto=500000.00,
            categoria=categoria_ingreso,
            descripcion='Pago mensual',
            fecha=date.today()
        )
        self.assertEqual(ingreso.monto, 500000.00)
        self.assertEqual(ingreso.usuario, self.usuario)

        categoria_gasto = Categoria.objects.create(
            usuario=self.usuario,
            nombre='Transporte',
            tipo='gasto'
        )
        gasto = Gasto.objects.create(
            usuario=self.usuario,
            monto=15000.00,
            categoria=categoria_gasto,
            descripcion='Carga de tarjeta bip',
            fecha=date.today()
        )
        self.assertEqual(gasto.monto, 15000.00)
        self.assertEqual(gasto.usuario, self.usuario)

class AutenticacionAPITests(APITestCase):
    def setUp(self):
        self.registro_url = reverse('auth_registro')
        self.login_url = reverse('auth_login')
        self.refresh_url = reverse('auth_token_refresh')
        
        # Crear un usuario inicial para pruebas de login
        Usuario = get_user_model()
        self.user = Usuario.objects.create_user(
            correo='diego@example.com',
            nombre='Diego Torres',
            password='TestPassword123!'
        )

    def test_api_registro_exitoso(self):
        data = {
            'correo': 'nuevo@example.com',
            'nombre': 'Nuevo Usuario',
            'password': 'NewSecurePassword123!'
        }
        response = self.client.post(self.registro_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['usuario']['correo'], 'nuevo@example.com')
        self.assertEqual(response.data['usuario']['nombre'], 'Nuevo Usuario')

    def test_api_registro_correo_duplicado(self):
        data = {
            'correo': 'diego@example.com',
            'nombre': 'Diego Clonal',
            'password': 'SomePassword123!'
        }
        response = self.client.post(self.registro_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('correo', response.data)

    def test_api_login_exitoso(self):
        data = {
            'correo': 'diego@example.com',
            'password': 'TestPassword123!'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['usuario']['correo'], 'diego@example.com')
        self.assertEqual(response.data['usuario']['nombre'], 'Diego Torres')

    def test_api_login_credenciales_invalidas(self):
        data = {
            'correo': 'diego@example.com',
            'password': 'WrongPassword123'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_api_token_refresh(self):
        # Obtener token inicial de login
        login_data = {
            'correo': 'diego@example.com',
            'password': 'TestPassword123!'
        }
        login_response = self.client.post(self.login_url, login_data)
        refresh_token = login_response.data['refresh']

        # Intentar refrescar
        refresh_data = {
            'refresh': refresh_token
        }
        response = self.client.post(self.refresh_url, refresh_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
