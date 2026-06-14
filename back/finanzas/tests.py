from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.test import TestCase
from .models import Categoria, Subcategoria, Ingreso, Gasto, Presupuesto, GastoRecurrente
from .services import procesar_gastos_recurrentes, agregar_meses
import datetime

class FinanzasAPITests(APITestCase):
    def setUp(self):
        Usuario = get_user_model()
        
        # Crear Usuario A
        self.user_a = Usuario.objects.create_user(
            correo='usuario_a@example.com',
            nombre='Usuario A',
            password='PasswordA123!'
        )
        # Crear Usuario B
        self.user_b = Usuario.objects.create_user(
            correo='usuario_b@example.com',
            nombre='Usuario B',
            password='PasswordB123!'
        )
        
        # Categoría propia para A (borramos categorías por defecto previas para evitar colisiones en tests manuales)
        Categoria.objects.filter(usuario=self.user_a).delete()
        self.cat_a_gasto = Categoria.objects.create(
            usuario=self.user_a,
            nombre='Alimentos A',
            tipo='gasto'
        )
        self.cat_a_ingreso = Categoria.objects.create(
            usuario=self.user_a,
            nombre='Sueldo A',
            tipo='ingreso'
        )
        
        # Categoría propia para B
        Categoria.objects.filter(usuario=self.user_b).delete()
        self.cat_b = Categoria.objects.create(
            usuario=self.user_b,
            nombre='Transporte B',
            tipo='gasto'
        )

        # Autenticar cliente como Usuario A por defecto
        self.client.force_authenticate(user=self.user_a)

    def test_categoria_crud_y_aislamiento(self):
        url = reverse('categoria-list')
        
        # Crear categoría como A
        data = {'nombre': 'Diversión', 'tipo': 'gasto'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['nombre'], 'Diversión')

        # Listar categorías como A (Alimentos A, Sueldo A y la nueva)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Filtramos para contar las creadas específicamente en este test
        nombres = [item['nombre'] for item in response.data]
        self.assertIn('Diversión', nombres)
        self.assertIn('Alimentos A', nombres)

        # Listar categorías como B
        self.client.force_authenticate(user=self.user_b)
        response = self.client.get(url)
        nombres_b = [item['nombre'] for item in response.data]
        self.assertIn('Transporte B', nombres_b)
        self.assertNotIn('Alimentos A', nombres_b)

        # Intentar modificar categoría de A desde B (debe retornar 404)
        cat_a_id = self.cat_a_gasto.id
        detail_url = reverse('categoria-detail', args=[cat_a_id])
        response = self.client.patch(detail_url, {'nombre': 'Hackeado'})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_subcategoria_validacion_cruzada(self):
        url = reverse('subcategoria-list')
        data = {
            'categoria': self.cat_b.id,
            'nombre': 'Taxi'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        data = {
            'categoria': self.cat_a_gasto.id,
            'nombre': 'Supermercado'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_ingreso_validacion_y_crud(self):
        url = reverse('ingreso-list')
        
        # Categoria tipo gasto (invalida para ingreso)
        data = {
            'monto': '500.00',
            'categoria': self.cat_a_gasto.id,
            'descripcion': 'Ingreso inválido',
            'fecha': datetime.date.today().isoformat()
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Categoria de otro usuario
        data['categoria'] = self.cat_b.id
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Categoria ingreso valida
        data['categoria'] = self.cat_a_ingreso.id
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_gasto_validacion(self):
        url = reverse('gasto-list')
        
        # Categoria ajena
        data = {
            'monto': '150.00',
            'categoria': self.cat_b.id,
            'descripcion': 'Gasto ajeno',
            'fecha': datetime.date.today().isoformat()
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Subcategoria de otra categoria
        sub_a = Subcategoria.objects.create(categoria=self.cat_a_gasto, nombre='Sub A')
        cat_b_new = Categoria.objects.create(usuario=self.user_b, nombre='Cat B New', tipo='gasto')
        sub_b = Subcategoria.objects.create(categoria=cat_b_new, nombre='Sub B')

        data = {
            'monto': '12.50',
            'categoria': self.cat_a_gasto.id,
            'subcategoria': sub_b.id,
            'fecha': datetime.date.today().isoformat()
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        data['subcategoria'] = sub_a.id
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_presupuesto_validacion(self):
        url = reverse('presupuesto-list')
        
        # Categoria ingreso
        data = {
            'categoria': self.cat_a_ingreso.id,
            'monto': '1000.00',
            'periodo': '2026-06-01'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Valido
        data['categoria'] = self.cat_a_gasto.id
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_creacion_categorias_iniciales_al_registrar_usuario(self):
        # Desautenticamos para simular registro publico
        self.client.force_authenticate(user=None)
        url = reverse('auth_registro')
        data = {
            'correo': 'nuevo_seeding@example.com',
            'nombre': 'Seeded User',
            'password': 'StrongPassword123!'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        Usuario = get_user_model()
        nuevo_usuario = Usuario.objects.get(correo='nuevo_seeding@example.com')
        
        # Validar categorías de ingreso
        cats_ingreso = Categoria.objects.filter(usuario=nuevo_usuario, tipo='ingreso')
        self.assertTrue(cats_ingreso.filter(nombre='Sueldo').exists())
        self.assertEqual(cats_ingreso.count(), 5)
        
        # Validar categorías de gasto y subcategorías
        cat_alimentos = Categoria.objects.get(usuario=nuevo_usuario, nombre='Alimentación', tipo='gasto')
        subcats = Subcategoria.objects.filter(categoria=cat_alimentos)
        self.assertTrue(subcats.filter(nombre='Supermercado').exists())
        self.assertEqual(subcats.count(), 3)


class GastosRecurrentesLogicTests(TestCase):
    def setUp(self):
        Usuario = get_user_model()
        self.user = Usuario.objects.create_user(
            correo='usuario_recurrentes@example.com',
            nombre='Usuario Rec',
            password='Password123!'
        )
        self.cat = Categoria.objects.create(
            usuario=self.user,
            nombre='Hogar',
            tipo='gasto'
        )

    def test_procesamiento_primera_vez(self):
        # Crear gasto recurrente sin ultimo_generado (None)
        rec = GastoRecurrente.objects.create(
            usuario=self.user,
            monto=45000.00,
            frecuencia='mensual',
            categoria=self.cat,
            descripcion='Arriendo',
            activo=True
        )
        self.assertIsNone(rec.ultimo_generado)
        
        # Ejecutar procesamiento
        creados = procesar_gastos_recurrentes()
        self.assertEqual(creados, 1)
        
        # Verificar que se generó el Gasto
        self.assertEqual(Gasto.objects.filter(usuario=self.user).count(), 1)
        gasto = Gasto.objects.first()
        self.assertEqual(gasto.monto, 45000.00)
        self.assertEqual(gasto.descripcion, '[Recurrente] Arriendo')
        
        # Verificar actualización de ultimo_generado
        rec.refresh_from_db()
        self.assertEqual(rec.ultimo_generado, datetime.date.today())

    def test_procesamiento_vencido_mensual(self):
        # Crear gasto recurrente con ultimo_generado hace 35 días
        hace_35_dias = datetime.date.today() - datetime.timedelta(days=35)
        rec = GastoRecurrente.objects.create(
            usuario=self.user,
            monto=5000.00,
            frecuencia='mensual',
            categoria=self.cat,
            descripcion='Spotify',
            activo=True,
            ultimo_generado=hace_35_dias
        )
        
        # Procesar
        creados = procesar_gastos_recurrentes()
        self.assertEqual(creados, 1)
        
        rec.refresh_from_db()
        self.assertEqual(rec.ultimo_generado, datetime.date.today())
        self.assertEqual(Gasto.objects.filter(usuario=self.user).count(), 1)

    def test_procesamiento_no_vencido(self):
        # Crear gasto recurrente con ultimo_generado hace 10 días (mensual, no le corresponde cobrar aún)
        hace_10_dias = datetime.date.today() - datetime.timedelta(days=10)
        rec = GastoRecurrente.objects.create(
            usuario=self.user,
            monto=12000.00,
            frecuencia='mensual',
            categoria=self.cat,
            descripcion='Gimnasio',
            activo=True,
            ultimo_generado=hace_10_dias
        )
        
        # Procesar
        creados = procesar_gastos_recurrentes()
        self.assertEqual(creados, 0)
        
        rec.refresh_from_db()
        self.assertEqual(rec.ultimo_generado, hace_10_dias) # No cambia
        self.assertEqual(Gasto.objects.filter(usuario=self.user).count(), 0)

    def test_procesamiento_inactivo(self):
        # Crear gasto recurrente inactivo
        rec = GastoRecurrente.objects.create(
            usuario=self.user,
            monto=15000.00,
            frecuencia='mensual',
            categoria=self.cat,
            descripcion='Seguro',
            activo=False
        )
        
        # Procesar
        creados = procesar_gastos_recurrentes()
        self.assertEqual(creados, 0)
        self.assertEqual(Gasto.objects.filter(usuario=self.user).count(), 0)
