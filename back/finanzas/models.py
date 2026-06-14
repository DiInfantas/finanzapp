from django.db import models
from django.conf import settings

class Categoria(models.Model):
    TIPO_CHOICES = [
        ('ingreso', 'Ingreso'),
        ('gasto', 'Gasto'),
        ('ambos', 'Ambos'),
    ]
    
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='categorias',
        verbose_name='usuario'
    )
    nombre = models.CharField('nombre', max_length=100)
    tipo = models.CharField('tipo', max_length=10, choices=TIPO_CHOICES, default='ambos')

    class Meta:
        verbose_name = 'categoría'
        verbose_name_plural = 'categorías'
        unique_together = ('usuario', 'nombre', 'tipo')

    def __str__(self):
        return f"{self.nombre} ({self.get_tipo_display()})"

class Subcategoria(models.Model):
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.CASCADE,
        related_name='subcategorias',
        verbose_name='categoría'
    )
    nombre = models.CharField('nombre', max_length=100)

    class Meta:
        verbose_name = 'subcategoría'
        verbose_name_plural = 'subcategorías'
        unique_together = ('categoria', 'nombre')

    def __str__(self):
        return f"{self.categoria.nombre} > {self.nombre}"

class Ingreso(models.Model):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ingresos',
        verbose_name='usuario'
    )
    monto = models.DecimalField('monto', max_digits=12, decimal_places=2)
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ingresos',
        verbose_name='categoría'
    )
    descripcion = models.TextField('descripción', blank=True)
    fecha = models.DateField('fecha')

    class Meta:
        verbose_name = 'ingreso'
        verbose_name_plural = 'ingresos'
        ordering = ['-fecha']

    def __str__(self):
        return f"Ingreso {self.monto} - {self.fecha}"

class Gasto(models.Model):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='gastos',
        verbose_name='usuario'
    )
    monto = models.DecimalField('monto', max_digits=12, decimal_places=2)
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='gastos',
        verbose_name='categoría'
    )
    subcategoria = models.ForeignKey(
        Subcategoria,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='gastos',
        verbose_name='subcategoría'
    )
    descripcion = models.TextField('descripción', blank=True)
    fecha = models.DateField('fecha')

    class Meta:
        verbose_name = 'gasto'
        verbose_name_plural = 'gastos'
        ordering = ['-fecha']

    def __str__(self):
        return f"Gasto {self.monto} - {self.fecha}"

class Presupuesto(models.Model):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='presupuestos',
        verbose_name='usuario'
    )
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.CASCADE,
        related_name='presupuestos',
        verbose_name='categoría'
    )
    monto = models.DecimalField('monto', max_digits=12, decimal_places=2)
    periodo = models.DateField('período')

    class Meta:
        verbose_name = 'presupuesto'
        verbose_name_plural = 'presupuestos'
        unique_together = ('usuario', 'categoria', 'periodo')

    def __str__(self):
        return f"Presupuesto {self.categoria.nombre} - {self.monto} ({self.periodo.strftime('%m/%Y')})"

class GastoRecurrente(models.Model):
    FRECUENCIA_CHOICES = [
        ('semanal', 'Semanal'),
        ('mensual', 'Mensual'),
        ('trimestral', 'Trimestral'),
        ('semestral', 'Semestral'),
        ('anual', 'Anual'),
    ]

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='gastos_recurrentes',
        verbose_name='usuario'
    )
    monto = models.DecimalField('monto', max_digits=12, decimal_places=2)
    frecuencia = models.CharField('frecuencia', max_length=15, choices=FRECUENCIA_CHOICES)
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='gastos_recurrentes',
        verbose_name='categoría'
    )
    descripcion = models.TextField('descripción', blank=True)
    activo = models.BooleanField('activo', default=True)
    ultimo_generado = models.DateField('último generado', null=True, blank=True)

    class Meta:
        verbose_name = 'gasto recurrente'
        verbose_name_plural = 'gastos recurrentes'

    def __str__(self):
        return f"Recurrente: {self.descripcion or 'Gasto'} ({self.monto}) - {self.frecuencia}"
