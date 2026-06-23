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

# Roadmap y Estado del Proyecto

A continuación se detalla el estado actual de las funcionalidades del proyecto, clasificadas en:
* **[x] Completado (Frontend y Backend conectados)**: La funcionalidad está operativa en el backend y tiene su correspondiente interfaz y lógica conectada en el frontend.
* **[/] Parcial (Frontend diseñado pero sin lógica o desconectado del Backend)**: Existe diseño visual en el frontend, pero no realiza peticiones reales al servidor o le falta lógica de negocio.
* **[ ] Pendiente (No implementado)**: No existe desarrollo ni en el frontend ni en el backend.

---

## MVP

### Estructura y Configuración Base
* [x] **Crear proyecto Django (Backend)**
* [x] **Configurar base de datos (PostgreSQL/SQLite)**
* [x] **Configurar Django REST Framework (Backend)**
* [x] **Configurar autenticación JWT (Backend)**
* [x] **Crear proyecto React + TypeScript (Frontend)**
* [x] **Configurar TailwindCSS (Frontend)**
* [/] **Configurar React Router**: *Instalado en package.json pero no se está usando activamente; la navegación se maneja mediante estado de pestañas en `Dashboard.tsx`.*
* [/] **Configurar React Query**: *Instalado en package.json pero no se está usando; las peticiones HTTP se manejan directamente con Axios en los componentes.*

### Funcionalidades MVP
* [x] **Registro de usuarios**
* [x] **Inicio de sesión**
* [x] **CRUD de Ingresos** (Crear, leer, editar, eliminar)
* [x] **CRUD de Gastos** (Crear, leer, editar, eliminar)
* [x] **CRUD de Categorías** (Crear, leer, eliminar)
* [x] **Panel principal básico (Dashboard)**: Visualización de ingresos, gastos, balance del período y accesos rápidos.
* [x] **Estadísticas básicas**: Distribución de gastos por categoría en la pestaña de Reportes.

---

## Versión 1.1 (Control de Presupuestos y Filtros)

* [x] **CRUD de Subcategorías** (Frontend y Backend conectados)
* [x] **Presupuestos por período** (Creación y eliminación de límites)
* [x] **Comparación presupuesto vs gasto real**: Visualizado mediante barras de progreso dinámicas con colores de alerta en la vista de presupuestos.
* [ ] **Filtros avanzados**: Filtros por fecha, mes/año, tipo y categorías en la lista de transacciones *(Actualmente solo hay buscador por texto)*.

---

## Versión 1.2 (Alertas y Reportes)

* [x] **Gastos recurrentes (Suscripciones)**: Creación y listado de gastos recurrentes conectado al backend.
* [/] **Alertas de presupuesto**: *Parcial. La barra de progreso de presupuesto cambia a color amarillo (>85%) y rojo (excedido), pero falta una alerta/notificación global en el Dashboard o por correo.*
* [/] **Configuración de Usuario / Perfil**: *Parcial. Existe la pantalla de perfil en el frontend con botones estáticos (Métodos de pago, Notificaciones, Privacidad), pero no tienen lógica ni interactúan con el backend.*
* [ ] **Reportes exportables (PDF, Excel, CSV)**

---

## Versión 2.0 (Características Avanzadas)

* [ ] **Metas de ahorro**
* [ ] **Adjuntar comprobantes** (Subida de archivos)
* [ ] **Comparación avanzada de períodos**
* [ ] **Multi-moneda**
* [ ] **Importación desde Excel**

---

# Notas de Desarrollo

El proyecto cuenta con una base sólida Full Stack:
1. El backend expone una API REST robusta y con persistencia configurable mediante Docker (PostgreSQL) o local (SQLite).
2. El frontend cuenta con un diseño premium y responsivo usando TailwindCSS y componentes limpios, integrando la mayor parte de las llamadas a la API a través de Axios de manera síncrona.

