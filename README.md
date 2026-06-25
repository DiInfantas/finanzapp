# FinanzApp 💰

¡Bienvenido a **FinanzApp**! Una aplicación web Full-Stack moderna diseñada para la gestión, control y optimización de finanzas personales. 

Este proyecto nació con la idea de **reemplazar una planilla Excel** compleja y manual que utilizaba en el día a día para registrar mis ingresos y gastos. Lo que comenzó como una solución simple de control personal, hoy es una aplicación web intuitiva, segura y completamente funcional que me permite tomar control total de mi salud financiera en tiempo real.

---

## 🚀 Características Principales (Áreas que Cubre)

*   **Autenticación Segura (JWT):** Registro e inicio de sesión seguro para cada usuario. Toda la información financiera es privada y está aislada por cuenta.
*   **Gestión de Transacciones:** CRUD completo de **Ingresos** y **Gastos** con soporte para categorías y subcategorías personalizables.
*   **Presupuestos Inteligentes:** Define límites de presupuesto mensuales por categoría y visualiza el porcentaje consumido mediante barras de progreso dinámicas con alertas de colores según el nivel de gasto.
*   **Gastos Recurrentes (Suscripciones):** Registra pagos periódicos (Netflix, Spotify, seguros, etc.) con frecuencias configurables (semanal, mensual, anual, etc.).
*   **Dashboard Interactivo:** Panel principal con un resumen de ingresos, gastos, balance del período y accesos rápidos a las operaciones más comunes.
*   **Reportes & Gráficos:** Visualización clara de la distribución de gastos a través de gráficos interactivos, permitiendo identificar rápidamente los mayores consumos de dinero.

---

## 🛠️ Stack Tecnológico

El proyecto está diseñado bajo una arquitectura desacoplada utilizando prácticas modernas de desarrollo Full-Stack:

### Backend (API REST)
*   **Python 3.x**
*   **Django & Django REST Framework (DRF):** Implementación de los endpoints de la API REST que gestionan las transacciones, categorías, presupuestos y el procesamiento lógico de gastos recurrentes.
*   **JWT (JSON Web Tokens):** Manejo de sesiones y protección de endpoints privados mediante autenticación sin estado.
*   **PostgreSQL / SQLite:** Persistencia de datos financieros. PostgreSQL configurado para producción en contenedores y SQLite como base de datos por defecto para un inicio rápido en desarrollo local.
*   **Whitenoise & Gunicorn:** Utilizados en producción para servir archivos estáticos eficientemente y actuar como servidor de aplicaciones WSGI respectivamente.

### Frontend
*   **React (v18+):** Biblioteca principal sobre la que se estructura toda la interfaz SPA interactiva.
*   **TypeScript:** Garantiza la seguridad de tipos en la comunicación con los endpoints del backend y el paso de datos entre componentes de la UI.
*   **Vite:** Tooling y empaquetador para el entorno de desarrollo y compilación optimizada de producción.
*   **TailwindCSS:** Maquetación responsiva y estilo visual del dashboard y sus componentes sin sobrecargar el código de hojas de estilo externas.
*   **Recharts:** Generación de gráficos dinámicos (gráfico de líneas para tendencias, gráfico de dona para categorías) en la vista de reportes financieros.
*   **Axios:** Cliente HTTP para la comunicación directa y autenticada (añadiendo tokens JWT en las cabeceras) con la API de Django.

---

## 📦 Arquitectura de Despliegue

La aplicación se encuentra completamente dockerizada, lo que facilita enormemente su configuración y despliegue en cualquier entorno mediante contenedores aislados:

*   **Servicio `db`:** Base de datos PostgreSQL para el almacenamiento persistente de la información.
*   **Servicio `back`:** Servidor Django que expone la API REST en el puerto `8000`.
*   **Servicio `front`:** Servidor Nginx que compila y sirve la aplicación SPA de React y rutea las peticiones de la API de forma transparente en el puerto `80`.

---

## ⚙️ Cómo Ejecutar el Proyecto

### Opción A: Ejecución Rápida con Docker (Recomendado)

Asegúrate de tener instalado [Docker](https://www.docker.com/) y **Docker Compose**.

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/finanzapp.git
   cd finanzapp
   ```

2. Crea tu archivo de variables de entorno `.env` en la raíz del proyecto basándote en `.env.docker`:
   ```bash
   cp .env.docker .env
   ```

3. Levanta los contenedores:
   ```bash
   docker-compose up --build
   ```

4. ¡Listo! Abre tu navegador en [http://localhost](http://localhost) para acceder a la aplicación frontend. La API del backend se comunicará internamente.

---

### Opción B: Ejecución Local en Desarrollo (Sin Docker)

Si deseas realizar modificaciones y correr el código en modo de desarrollo:

#### 1. Backend (Django)
1. Dirígete a la carpeta backend:
   ```bash
   cd back
   ```
2. Crea e inicia un entorno virtual:
   ```bash
   python -m venv venv
   # En Windows:
   .\venv\Scripts\activate
   # En Linux/macOS:
   source venv/bin/activate
   ```
3. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```
4. Realiza las migraciones para crear la base de datos local (SQLite por defecto):
   ```bash
   python manage.py migrate
   ```
5. Inicia el servidor de desarrollo:
   ```bash
   python manage.py runserver
   ```
   *El backend estará disponible en [http://localhost:8000](http://localhost:8000).*

#### 2. Frontend (React + Vite)
1. Abre una nueva terminal en la carpeta frontend:
   ```bash
   cd front
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo Vite:
   ```bash
   npm run dev
   ```
   *El frontend estará disponible en [http://localhost:5173](http://localhost:5173).*

---

## 📈 Roadmap y Próximas Mejoras

*   [ ] Filtros avanzados de transacciones (por rango de fechas y categorías).
*   [ ] Alertas y notificaciones globales/correo de superación de límites de presupuesto.
*   [ ] Metas de ahorro con seguimiento de progreso.
*   [ ] Exportación de reportes a PDF, Excel y CSV.
*   [ ] Importación de datos directamente desde planillas de Excel históricas.
