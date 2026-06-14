# Gestor de Finanzas Personales

## Descripción

Aplicación web para la gestión de finanzas personales.

El objetivo es reemplazar una planilla Excel utilizada actualmente para el control de ingresos, gastos, presupuestos y estadísticas financieras.

Cada usuario tendrá acceso únicamente a su propia información mediante autenticación.

---

# Objetivos del Proyecto

* Registrar ingresos.
* Registrar gastos.
* Gestionar categorías y subcategorías.
* Definir presupuestos por período.
* Comparar presupuesto proyectado vs gasto real.
* Gestionar gastos recurrentes.
* Visualizar estadísticas y tendencias.
* Exportar e importar datos en futuras versiones.
* Servir como proyecto de portafolio Full Stack.

---

# Tecnologías

## Frontend

* React
* TypeScript
* Vite
* React Router
* React Query
* TailwindCSS
* shadcn/ui
* Recharts

## Backend

* Django
* Django REST Framework
* JWT Authentication

## Base de Datos

* SQLite

## Despliegue

Por definir.

---

# Funcionalidades

## Autenticación

### Registro

Campos:

* Nombre
* Correo electrónico
* Contraseña

### Inicio de sesión

* Inicio de sesión mediante correo electrónico y contraseña.
* Autenticación JWT.

### Futuro

* Recuperación de contraseña.
* Verificación por correo electrónico.

---

## Ingresos

Permite registrar todo dinero recibido por el usuario.

Campos:

* Fecha
* Monto
* Categoría
* Descripción

Categorías iniciales sugeridas:

* Sueldo
* Trabajo independiente
* Inversiones
* Ventas
* Otros

---

## Gastos

Permite registrar cada gasto realizado.

Campos:

* Fecha
* Monto
* Categoría
* Subcategoría
* Descripción

Ejemplo:

Categoría:

* Transporte

Subcategoría:

* Bencina

---

## Categorías

Los usuarios podrán:

* Crear categorías.
* Editar categorías.
* Eliminar categorías.

Ejemplos:

### Alimentación

* Supermercado
* Restaurante
* Delivery

### Transporte

* Bencina
* TAG
* Estacionamiento

### Entretenimiento

* Streaming
* Videojuegos
* Cine

---

## Subcategorías

Cada categoría podrá tener múltiples subcategorías.

Ejemplo:

Alimentación

* Supermercado
* Delivery
* Restaurante

---

## Presupuestos

Permite definir montos proyectados por período.

Ejemplo:

| Categoría       | Presupuesto |
| --------------- | ----------- |
| Alimentación    | 200000      |
| Transporte      | 100000      |
| Entretenimiento | 80000       |

El sistema calculará automáticamente:

* Total gastado.
* Saldo disponible.
* Porcentaje utilizado.

---

## Gastos Recurrentes

Permite registrar gastos automáticos.

Ejemplos:

* Netflix
* Spotify
* Mantención de tarjeta
* Seguro automotriz
* Gimnasio

Frecuencias:

* Semanal
* Mensual
* Trimestral
* Semestral
* Anual

Los gastos podrán generarse automáticamente según la frecuencia configurada.

---

## Panel Principal

### Resumen General

Mostrar:

* Ingresos del período
* Gastos del período
* Balance
* Porcentaje de presupuesto utilizado

### Indicadores

* Total ingresado
* Total gastado
* Diferencia entre ingresos y gastos
* Categoría con mayor gasto

---

## Estadísticas

### Evolución Mensual

Gráfico de líneas para visualizar:

* Gastos por mes
* Ingresos por mes
* Balance mensual

### Distribución de Gastos

Gráfico de dona para visualizar:

* Gastos por categoría
* Porcentaje de participación

### Presupuesto vs Gasto Real

Gráfico de barras comparando:

* Presupuesto definido
* Gasto real

### Comparación de Períodos

Futuro:

* Comparar mes actual con meses anteriores.
* Detectar aumentos o disminuciones de gasto.

---

## Reportes

Filtros:

* Fecha
* Mes
* Año
* Categoría
* Subcategoría

Exportaciones futuras:

* PDF
* Excel
* CSV

---

# Modelo de Datos Inicial

## Usuario

* id
* nombre
* correo
* contraseña

## Ingreso

* id
* usuario
* monto
* categoría
* descripción
* fecha

## Gasto

* id
* usuario
* monto
* categoría
* subcategoría
* descripción
* fecha

## Categoría

* id
* usuario
* nombre

## Subcategoría

* id
* categoría
* nombre

## Presupuesto

* id
* usuario
* categoría
* monto
* período

## Gasto Recurrente

* id
* usuario
* monto
* frecuencia
* categoría
* descripción

---

# Pantallas

## Públicas

* Inicio de sesión
* Registro

## Privadas

* Panel principal
* Ingresos
* Gastos
* Categorías
* Presupuestos
* Gastos recurrentes
* Reportes
* Configuración de usuario

---

# Roadmap

## MVP

### Backend

* [x] Crear proyecto Django
* [x] Configurar SQLite
* [x] Configurar Django REST Framework
* [x] Configurar autenticación JWT

### Frontend

* [ ] Crear proyecto React + TypeScript
* [ ] Configurar TailwindCSS
* [ ] Configurar React Router
* [ ] Configurar React Query

### Funcionalidades

* [x] Registro de usuarios (Backend)
* [x] Inicio de sesión (Backend)
* [x] CRUD de ingresos (Backend)
* [x] CRUD de gastos (Backend)
* [x] CRUD de categorías (Backend)
* [ ] Panel principal básico
* [ ] Estadísticas básicas

---

## Versión 1.1

* [x] CRUD de subcategorías (Backend)
* [x] Presupuestos por período (Backend)
* [ ] Comparación presupuesto vs gasto real
* [ ] Filtros avanzados

---

## Versión 1.2

* [x] Gastos recurrentes (Backend)
* [ ] Alertas de presupuesto
* [ ] Reportes exportables

---

## Versión 2.0

* [ ] Metas de ahorro
* [ ] Adjuntar comprobantes
* [ ] Comparación avanzada de períodos
* [ ] Multi-moneda

---

# Funcionalidades Futuras

## Importación desde Excel

Objetivo:

Permitir que los usuarios descarguen una plantilla Excel oficial, la completen externamente y posteriormente la importen al sistema.

Características:

* Descargar plantilla Excel.
* Validar estructura del archivo.
* Detectar errores de formato.
* Importar ingresos.
* Importar gastos.
* Asociar categorías automáticamente.
* Mostrar resumen previo antes de importar.

Esta funcionalidad tiene como objetivo demostrar integración con múltiples fuentes de datos y procesamiento de archivos.

Estado actual:

* No iniciar implementación hasta finalizar el MVP.

---

# Notas de Desarrollo

## Principios

* Mantener el proyecto simple durante el MVP.
* Priorizar funcionalidades antes que diseño avanzado.
* Mantener separación clara entre frontend y backend.
* Documentar cada avance importante.

## Objetivo de Portafolio

El proyecto debe demostrar experiencia en:

* React + TypeScript
* Django REST Framework
* SQLite
* Autenticación JWT
* Diseño de APIs REST
* Gestión de estados
* Visualización de datos
* Procesamiento de archivos Excel (futuro)
* Despliegue de aplicaciones Full Stack
