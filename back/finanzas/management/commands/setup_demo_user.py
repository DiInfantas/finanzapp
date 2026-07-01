import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from finanzas.models import Categoria, Subcategoria, Ingreso, Gasto, Presupuesto, GastoRecurrente

Usuario = get_user_model()

class Command(BaseCommand):
    help = 'Restablece o crea la cuenta demo con datos ficticios iniciales'

    def handle(self, *args, **options):
        correo_demo = 'demo@finanzapp.local'
        nombre_demo = 'Usuario Demo'
        password_demo = 'demo12345'

        self.stdout.write(self.style.WARNING(f'Borrando usuario demo anterior ({correo_demo}) si existe...'))
        Usuario.objects.filter(correo=correo_demo).delete()

        self.stdout.write(self.style.MIGRATE_LABEL('Creando nuevo usuario demo...'))
        user = Usuario.objects.create_user(
            correo=correo_demo,
            nombre=nombre_demo,
            password=password_demo
        )

        self.stdout.write(self.style.MIGRATE_LABEL('Creando estructura de categorías y subcategorías...'))
        
        # Categorías de ingreso
        cat_sueldo = Categoria.objects.create(usuario=user, nombre='Sueldo', tipo='ingreso')
        cat_freelance = Categoria.objects.create(usuario=user, nombre='Freelance', tipo='ingreso')
        cat_inversiones = Categoria.objects.create(usuario=user, nombre='Inversiones', tipo='ingreso')
        cat_otros_ing = Categoria.objects.create(usuario=user, nombre='Otros Ingresos', tipo='ingreso')

        # Categorías de gasto con subcategorías
        # 1. Alimentación
        cat_alimentacion = Categoria.objects.create(usuario=user, nombre='Alimentación', tipo='gasto')
        sub_supermercado = Subcategoria.objects.create(categoria=cat_alimentacion, nombre='Supermercado')
        sub_restaurante = Subcategoria.objects.create(categoria=cat_alimentacion, nombre='Restaurante')
        sub_delivery = Subcategoria.objects.create(categoria=cat_alimentacion, nombre='Delivery')

        # 2. Transporte
        cat_transporte = Categoria.objects.create(usuario=user, nombre='Transporte', tipo='gasto')
        sub_combustible = Subcategoria.objects.create(categoria=cat_transporte, nombre='Combustible')
        sub_publico = Subcategoria.objects.create(categoria=cat_transporte, nombre='Transporte Público')
        sub_uber = Subcategoria.objects.create(categoria=cat_transporte, nombre='Uber / Didi')

        # 3. Vivienda y Servicios
        cat_vivienda = Categoria.objects.create(usuario=user, nombre='Vivienda', tipo='gasto')
        sub_arriendo = Subcategoria.objects.create(categoria=cat_vivienda, nombre='Arriendo / Dividendo')
        sub_gastos_comunes = Subcategoria.objects.create(categoria=cat_vivienda, nombre='Gastos Comunes')
        sub_servicios = Subcategoria.objects.create(categoria=cat_vivienda, nombre='Luz / Agua / Gas')
        sub_internet = Subcategoria.objects.create(categoria=cat_vivienda, nombre='Internet / TV')

        # 4. Entretenimiento
        cat_entretenimiento = Categoria.objects.create(usuario=user, nombre='Entretenimiento', tipo='gasto')
        sub_streaming = Subcategoria.objects.create(categoria=cat_entretenimiento, nombre='Suscripciones/Streaming')
        sub_cine = Subcategoria.objects.create(categoria=cat_entretenimiento, nombre='Cine y Conciertos')
        sub_salidas = Subcategoria.objects.create(categoria=cat_entretenimiento, nombre='Salidas con Amigos')

        # 5. Salud y Bienestar
        cat_salud = Categoria.objects.create(usuario=user, nombre='Salud', tipo='gasto')
        sub_farmacia = Subcategoria.objects.create(categoria=cat_salud, nombre='Farmacia')
        sub_medicos = Subcategoria.objects.create(categoria=cat_salud, nombre='Consultas y Exámenes')
        sub_gimnasio = Subcategoria.objects.create(categoria=cat_salud, nombre='Deporte / Gimnasio')

        # 6. Otros Gastos
        cat_otros_gas = Categoria.objects.create(usuario=user, nombre='Otros Gastos', tipo='gasto')
        sub_compras = Subcategoria.objects.create(categoria=cat_otros_gas, nombre='Ropa / Compras')
        sub_regalos = Subcategoria.objects.create(categoria=cat_otros_gas, nombre='Regalos')

        self.stdout.write(self.style.MIGRATE_LABEL('Creando presupuestos...'))
        hoy = datetime.date.today()
        este_mes_1 = hoy.replace(day=1)
        
        # Presupuestos para el mes actual
        Presupuesto.objects.create(usuario=user, categoria=cat_alimentacion, monto=350000.00, periodo=este_mes_1)
        Presupuesto.objects.create(usuario=user, categoria=cat_transporte, monto=100000.00, periodo=este_mes_1)
        Presupuesto.objects.create(usuario=user, categoria=cat_vivienda, monto=650000.00, periodo=este_mes_1)
        Presupuesto.objects.create(usuario=user, categoria=cat_entretenimiento, monto=80000.00, periodo=este_mes_1)
        Presupuesto.objects.create(usuario=user, categoria=cat_salud, monto=60000.00, periodo=este_mes_1)

        # Presupuestos para el mes anterior (para consistencia histórica)
        anterior_mes_1 = (este_mes_1 - datetime.timedelta(days=15)).replace(day=1)
        Presupuesto.objects.create(usuario=user, categoria=cat_alimentacion, monto=350000.00, periodo=anterior_mes_1)
        Presupuesto.objects.create(usuario=user, categoria=cat_transporte, monto=100000.00, periodo=anterior_mes_1)
        Presupuesto.objects.create(usuario=user, categoria=cat_vivienda, monto=650000.00, periodo=anterior_mes_1)
        Presupuesto.objects.create(usuario=user, categoria=cat_entretenimiento, monto=80000.00, periodo=anterior_mes_1)

        self.stdout.write(self.style.MIGRATE_LABEL('Creando gastos recurrentes (suscripciones)...'))
        GastoRecurrente.objects.create(
            usuario=user,
            monto=10990.00,
            frecuencia='mensual',
            categoria=cat_entretenimiento,
            descripcion='Netflix Plan Premium',
            activo=True,
            ultimo_generado=hoy - datetime.timedelta(days=20)
        )
        GastoRecurrente.objects.create(
            usuario=user,
            monto=6990.00,
            frecuencia='mensual',
            categoria=cat_entretenimiento,
            descripcion='Spotify Family',
            activo=True,
            ultimo_generado=hoy - datetime.timedelta(days=10)
        )
        GastoRecurrente.objects.create(
            usuario=user,
            monto=32000.00,
            frecuencia='mensual',
            categoria=cat_salud,
            descripcion='Membresía Gimnasio Smartfit',
            activo=True,
            ultimo_generado=hoy - datetime.timedelta(days=25)
        )
        GastoRecurrente.objects.create(
            usuario=user,
            monto=21500.00,
            frecuencia='mensual',
            categoria=cat_vivienda,
            descripcion='Plan Internet Fibra',
            activo=True,
            ultimo_generado=hoy - datetime.timedelta(days=5)
        )

        self.stdout.write(self.style.MIGRATE_LABEL('Creando historial de transacciones (ingresos)...'))
        # Ingresos Mes Anterior
        Ingreso.objects.create(usuario=user, monto=2200000.00, categoria=cat_sueldo, descripcion='Sueldo Mayo 2026', fecha=anterior_mes_1)
        Ingreso.objects.create(usuario=user, monto=350000.00, categoria=cat_freelance, descripcion='Proyecto Web Freelance', fecha=anterior_mes_1 + datetime.timedelta(days=14))
        Ingreso.objects.create(usuario=user, monto=45000.00, categoria=cat_inversiones, descripcion='Dividendos Fintual', fecha=anterior_mes_1 + datetime.timedelta(days=24))

        # Ingresos Mes Actual
        Ingreso.objects.create(usuario=user, monto=2200000.00, categoria=cat_sueldo, descripcion='Sueldo Junio 2026', fecha=este_mes_1)
        # Si hoy es posterior al día 15, agregar un freelance
        if hoy.day >= 15:
            Ingreso.objects.create(usuario=user, monto=400000.00, categoria=cat_freelance, descripcion='Asesoría TI', fecha=este_mes_1 + datetime.timedelta(days=14))
        if hoy.day >= 22:
            Ingreso.objects.create(usuario=user, monto=55000.00, categoria=cat_inversiones, descripcion='Retornos Depósito a Plazo', fecha=este_mes_1 + datetime.timedelta(days=21))

        self.stdout.write(self.style.MIGRATE_LABEL('Creando historial de transacciones (gastos)...'))
        
        # Gastos Fijos Mes Anterior (Mayo)
        Gasto.objects.create(usuario=user, monto=450000.00, categoria=cat_vivienda, subcategoria=sub_arriendo, descripcion='Pago Arriendo Mayo', fecha=anterior_mes_1 + datetime.timedelta(days=1))
        Gasto.objects.create(usuario=user, monto=98000.00, categoria=cat_vivienda, subcategoria=sub_gastos_comunes, descripcion='Gastos Comunes Edificio', fecha=anterior_mes_1 + datetime.timedelta(days=4))
        Gasto.objects.create(usuario=user, monto=38500.00, categoria=cat_vivienda, subcategoria=sub_servicios, descripcion='Boleta Luz Enel', fecha=anterior_mes_1 + datetime.timedelta(days=9))
        Gasto.objects.create(usuario=user, monto=21500.00, categoria=cat_vivienda, subcategoria=sub_internet, descripcion='Internet Movistar', fecha=anterior_mes_1 + datetime.timedelta(days=9))
        Gasto.objects.create(usuario=user, monto=32000.00, categoria=cat_salud, subcategoria=sub_gimnasio, descripcion='[Recurrente] Membresía Gimnasio Smartfit', fecha=anterior_mes_1 + datetime.timedelta(days=4))
        
        # Gastos Variables Mes Anterior (Mayo)
        # Semana 1 Mayo
        Gasto.objects.create(usuario=user, monto=75000.00, categoria=cat_alimentacion, subcategoria=sub_supermercado, descripcion='Jumbo Semanal', fecha=anterior_mes_1 + datetime.timedelta(days=2))
        Gasto.objects.create(usuario=user, monto=22500.00, categoria=cat_transporte, subcategoria=sub_combustible, descripcion='Carga Bencina Shell', fecha=anterior_mes_1 + datetime.timedelta(days=3))
        Gasto.objects.create(usuario=user, monto=15990.00, categoria=cat_entretenimiento, subcategoria=sub_streaming, descripcion='Netflix', fecha=anterior_mes_1 + datetime.timedelta(days=5))
        Gasto.objects.create(usuario=user, monto=18000.00, categoria=cat_alimentacion, subcategoria=sub_delivery, descripcion='Pizza Hut Delivery', fecha=anterior_mes_1 + datetime.timedelta(days=5))
        
        # Semana 2 Mayo
        Gasto.objects.create(usuario=user, monto=82000.00, categoria=cat_alimentacion, subcategoria=sub_supermercado, descripcion='Supermercado Líder', fecha=anterior_mes_1 + datetime.timedelta(days=9))
        Gasto.objects.create(usuario=user, monto=14000.00, categoria=cat_transporte, subcategoria=sub_publico, descripcion='Carga Tarjeta BIP', fecha=anterior_mes_1 + datetime.timedelta(days=10))
        Gasto.objects.create(usuario=user, monto=35000.00, categoria=cat_alimentacion, subcategoria=sub_restaurante, descripcion='Almuerzo con colega', fecha=anterior_mes_1 + datetime.timedelta(days=12))
        Gasto.objects.create(usuario=user, monto=12000.00, categoria=cat_salud, subcategoria=sub_farmacia, descripcion='Medicamentos e Ibuprofeno', fecha=anterior_mes_1 + datetime.timedelta(days=13))
        
        # Semana 3 Mayo
        Gasto.objects.create(usuario=user, monto=68000.00, categoria=cat_alimentacion, subcategoria=sub_supermercado, descripcion='Jumbo Semanal', fecha=anterior_mes_1 + datetime.timedelta(days=16))
        Gasto.objects.create(usuario=user, monto=25000.00, categoria=cat_transporte, subcategoria=sub_combustible, descripcion='Carga Bencina Copec', fecha=anterior_mes_1 + datetime.timedelta(days=17))
        Gasto.objects.create(usuario=user, monto=29000.00, categoria=cat_otros_gas, subcategoria=sub_compras, descripcion='Polera Zara', fecha=anterior_mes_1 + datetime.timedelta(days=19))
        Gasto.objects.create(usuario=user, monto=18000.00, categoria=cat_entretenimiento, subcategoria=sub_cine, descripcion='Entradas Cinehoyts 2D', fecha=anterior_mes_1 + datetime.timedelta(days=20))
        
        # Semana 4 Mayo
        Gasto.objects.create(usuario=user, monto=71000.00, categoria=cat_alimentacion, subcategoria=sub_supermercado, descripcion='Supermercado Líder', fecha=anterior_mes_1 + datetime.timedelta(days=23))
        Gasto.objects.create(usuario=user, monto=12500.00, categoria=cat_transporte, subcategoria=sub_uber, descripcion='Viaje Uber al Centro', fecha=anterior_mes_1 + datetime.timedelta(days=24))
        Gasto.objects.create(usuario=user, monto=45000.00, categoria=cat_alimentacion, subcategoria=sub_restaurante, descripcion='Cena familiar fin de semana', fecha=anterior_mes_1 + datetime.timedelta(days=26))
        Gasto.objects.create(usuario=user, monto=20000.00, categoria=cat_otros_gas, subcategoria=sub_regalos, descripcion='Regalo cumpleaños amigo', fecha=anterior_mes_1 + datetime.timedelta(days=28))


        # Gastos Fijos Mes Actual (Junio)
        # Siempre crear arriendo y gastos fijos a inicio de mes
        Gasto.objects.create(usuario=user, monto=450000.00, categoria=cat_vivienda, subcategoria=sub_arriendo, descripcion='Pago Arriendo Junio', fecha=este_mes_1 + datetime.timedelta(days=1))
        
        if hoy.day >= 4:
            Gasto.objects.create(usuario=user, monto=102000.00, categoria=cat_vivienda, subcategoria=sub_gastos_comunes, descripcion='Gastos Comunes Edificio', fecha=este_mes_1 + datetime.timedelta(days=3))
            Gasto.objects.create(usuario=user, monto=32000.00, categoria=cat_salud, subcategoria=sub_gimnasio, descripcion='[Recurrente] Membresía Gimnasio Smartfit', fecha=este_mes_1 + datetime.timedelta(days=3))
        if hoy.day >= 9:
            Gasto.objects.create(usuario=user, monto=42000.00, categoria=cat_vivienda, subcategoria=sub_servicios, descripcion='Boleta Luz Enel', fecha=este_mes_1 + datetime.timedelta(days=8))
            Gasto.objects.create(usuario=user, monto=21500.00, categoria=cat_vivienda, subcategoria=sub_internet, descripcion='Internet Movistar', fecha=este_mes_1 + datetime.timedelta(days=8))

        # Gastos Variables Mes Actual (Junio) - Dinámicos según la fecha de hoy
        gastos_semanales_junio = [
            # (días desde el día 1, monto, categoria, subcategoria, descripcion)
            (2, 79000.00, cat_alimentacion, sub_supermercado, 'Jumbo Semanal'),
            (3, 23000.00, cat_transporte, sub_combustible, 'Carga Bencina Shell'),
            (5, 10990.00, cat_entretenimiento, sub_streaming, '[Recurrente] Netflix Plan Premium'),
            (6, 16000.00, cat_alimentacion, sub_delivery, 'Sushibar Delivery'),
            (9, 81000.00, cat_alimentacion, sub_supermercado, 'Supermercado Líder'),
            (10, 6990.00, cat_entretenimiento, sub_streaming, '[Recurrente] Spotify Family'),
            (12, 28000.00, cat_alimentacion, sub_restaurante, 'Almuerzo Viernes'),
            (13, 24500.00, cat_salud, sub_farmacia, 'Remedios e Insumos Médicos'),
            (15, 12000.00, cat_transporte, sub_publico, 'Carga BIP Boletería'),
            (16, 73000.00, cat_alimentacion, sub_supermercado, 'Jumbo Semanal'),
            (18, 25000.00, cat_transporte, sub_combustible, 'Carga Bencina Copec'),
            (19, 34000.00, cat_entretenimiento, sub_salidas, 'Bar con amigos'),
            (21, 21500.00, cat_vivienda, sub_internet, '[Recurrente] Plan Internet Fibra'),
            (23, 67000.00, cat_alimentacion, sub_supermercado, 'Supermercado Líder'),
            (24, 9800.00, cat_transporte, sub_uber, 'Viaje Uber al Trabajo'),
            (25, 42000.00, cat_otros_gas, sub_compras, 'Zapatillas H&M'),
        ]

        for dia_offset, monto, cat, subcat, desc in gastos_semanales_junio:
            gasto_fecha = este_mes_1 + datetime.timedelta(days=dia_offset-1)
            # Solo crear si la fecha del gasto es anterior o igual a hoy
            if gasto_fecha <= hoy:
                Gasto.objects.create(
                    usuario=user,
                    monto=monto,
                    categoria=cat,
                    subcategoria=subcat,
                    descripcion=desc,
                    fecha=gasto_fecha
                )

        self.stdout.write(self.style.SUCCESS('¡Usuario demo inicializado correctamente con datos de prueba realistas!'))
