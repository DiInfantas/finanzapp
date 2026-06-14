from django.core.management.base import BaseCommand
from finanzas.services import procesar_gastos_recurrentes

class Command(BaseCommand):
    help = 'Procesa los gastos recurrentes y genera gastos reales cuando es necesario.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Iniciando procesamiento de gastos recurrentes...'))
        try:
            gastos_creados = procesar_gastos_recurrentes()
            self.stdout.write(self.style.SUCCESS(
                f'Procesamiento completado con éxito. Se generaron {gastos_creados} gastos nuevos.'
            ))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Error procesando gastos recurrentes: {str(e)}'))
