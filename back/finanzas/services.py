import datetime
from .models import Categoria, Subcategoria, GastoRecurrente, Gasto

def crear_categorias_iniciales(usuario):
    """
    Crea las categorías e ingresos por defecto para un nuevo usuario.
    """
    # Categorías de ingreso iniciales
    categorias_ingreso = ['Sueldo', 'Trabajo independiente', 'Inversiones', 'Ventas', 'Otros']
    for nombre in categorias_ingreso:
        Categoria.objects.get_or_create(usuario=usuario, nombre=nombre, tipo='ingreso')
        
    # Categorías de gasto con subcategorías
    gastos_estructura = {
        'Alimentación': ['Supermercado', 'Restaurante', 'Delivery'],
        'Transporte': ['Bencina', 'TAG', 'Estacionamiento'],
        'Entretenimiento': ['Streaming', 'Videojuegos', 'Cine']
    }
    
    for nombre_cat, subcats in gastos_estructura.items():
        categoria, created = Categoria.objects.get_or_create(
            usuario=usuario, 
            nombre=nombre_cat, 
            tipo='gasto'
        )
        for nombre_sub in subcats:
            Subcategoria.objects.get_or_create(categoria=categoria, nombre=nombre_sub)

def agregar_meses(fecha, meses):
    """
    Suma meses a una fecha considerando meses de diferente duración y años bisiestos.
    """
    mes = fecha.month - 1 + meses
    anio = fecha.year + mes // 12
    mes = mes % 12 + 1
    
    # Calcular días máximos del mes
    bisiesto = (anio % 4 == 0 and (anio % 100 != 0 or anio % 400 == 0))
    max_dias = [31, 29 if bisiesto else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    
    dia = min(fecha.day, max_dias[mes - 1])
    return datetime.date(anio, mes, dia)

def procesar_gastos_recurrentes():
    """
    Evalúa y genera los Gastos físicos correspondientes a los GastosRecurrentes vencidos.
    """
    hoy = datetime.date.today()
    gastos_creados = 0
    
    # Obtener gastos recurrentes activos
    recurrentes = GastoRecurrente.objects.filter(activo=True)
    
    for rec in recurrentes:
        ultimo = rec.ultimo_generado
        debe_generar = False
        
        if ultimo is None:
            # Primera generación (hoy)
            debe_generar = True
        else:
            # Calcular próxima fecha de cobro según frecuencia
            if rec.frecuencia == 'semanal':
                proximo = ultimo + datetime.timedelta(days=7)
            elif rec.frecuencia == 'mensual':
                proximo = agregar_meses(ultimo, 1)
            elif rec.frecuencia == 'trimestral':
                proximo = agregar_meses(ultimo, 3)
            elif rec.frecuencia == 'semestral':
                proximo = agregar_meses(ultimo, 6)
            elif rec.frecuencia == 'anual':
                proximo = agregar_meses(ultimo, 12)
            else:
                continue
            
            if hoy >= proximo:
                debe_generar = True
        
        if debe_generar:
            # Generar el gasto físico
            descripcion_gasto = f"[Recurrente] {rec.descripcion}".strip()
            Gasto.objects.create(
                usuario=rec.usuario,
                monto=rec.monto,
                categoria=rec.categoria,
                descripcion=descripcion_gasto,
                fecha=hoy
            )
            # Actualizar último cobro a la fecha de hoy
            rec.ultimo_generado = hoy
            rec.save()
            gastos_creados += 1
            
    return gastos_creados
