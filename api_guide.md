# Guía de Referencia de la API - Gestor de Finanzas Personales

Esta guía detalla los endpoints, payloads y respuestas de la API del backend construida con Django REST Framework y autenticación JWT.

## Configuración Inicial
* **Base URL en Desarrollo:** `http://localhost:8000`
* **Autenticación:** Formato `Authorization: Bearer <access_token>` para todos los endpoints protegidos.

---

## 🔑 Autenticación (Público)

### 1. Registro de Usuario
Crea una cuenta e inicia sesión automáticamente. Configura además categorías y subcategorías iniciales por defecto.
* **POST** `/api/auth/registro/`
* **Payload:**
  ```json
  {
    "correo": "usuario@example.com",
    "nombre": "Diego",
    "password": "PasswordSegura123!"
  }
  ```
* **Respuesta (201 Created):**
  ```json
  {
    "usuario": {
      "id": 1,
      "correo": "usuario@example.com",
      "nombre": "Diego",
      "date_joined": "2026-06-13T19:20:00Z"
    },
    "refresh": "eyJhbGciOi...",
    "access": "eyJhbGciOi..."
  }
  ```

### 2. Inicio de Sesión (Obtener Tokens)
* **POST** `/api/auth/login/`
* **Payload:**
  ```json
  {
    "correo": "usuario@example.com",
    "password": "PasswordSegura123!"
  }
  ```
* **Respuesta (200 OK):**
  ```json
  {
    "refresh": "eyJhbGciOi...",
    "access": "eyJhbGciOi...",
    "usuario": {
      "id": 1,
      "nombre": "Diego",
      "correo": "usuario@example.com"
    }
  }
  ```

### 3. Refrescar Token de Acceso
* **POST** `/api/auth/token/refresh/`
* **Payload:**
  ```json
  {
    "refresh": "refresh_token_aqui"
  }
  ```
* **Respuesta (200 OK):**
  ```json
  {
    "access": "nuevo_access_token_aqui"
  }
  ```

---

## 📊 Endpoints de Finanzas (Protegidos)
Todos los endpoints soportan el estándar CRUD RESTful (`GET` para listar, `POST` para crear, `GET /<id>/` para detalle, `PUT /<id>/` o `PATCH /<id>/` para actualizar, y `DELETE /<id>/` para eliminar).

### 1. Categorías (`/api/categorias/`)
* **Modelo:**
  ```json
  {
    "id": 1,
    "nombre": "Alimentación",
    "tipo": "gasto" // Opciones: "ingreso", "gasto", "ambos"
  }
  ```
* **POST Payload:**
  ```json
  {
    "nombre": "Entretenimiento",
    "tipo": "gasto"
  }
  ```

### 2. Subcategorías (`/api/subcategorias/`)
* **Modelo:**
  ```json
  {
    "id": 1,
    "categoria": 1, // ID de la Categoría padre (debe pertenecer al usuario)
    "nombre": "Supermercado"
  }
  ```
* **POST Payload:**
  ```json
  {
    "categoria": 1,
    "nombre": "Supermercado"
  }
  ```

### 3. Ingresos (`/api/ingresos/`)
* **Modelo:**
  ```json
  {
    "id": 1,
    "monto": "1500000.00",
    "categoria": 2, // ID de categoría tipo "ingreso" o "ambos"
    "descripcion": "Sueldo mensual",
    "fecha": "2026-06-13"
  }
  ```
* **POST Payload:**
  ```json
  {
    "monto": "1500000.00",
    "categoria": 2,
    "descripcion": "Sueldo mensual",
    "fecha": "2026-06-13"
  }
  ```

### 4. Gastos (`/api/gastos/`)
* **Modelo:**
  ```json
  {
    "id": 1,
    "monto": "4500.00",
    "categoria": 1, // ID de categoría tipo "gasto" o "ambos"
    "subcategoria": 1, // Opcional. Debe pertenecer a la categoría seleccionada
    "descripcion": "Compra de almuerzo",
    "fecha": "2026-06-13"
  }
  ```

### 5. Presupuestos (`/api/presupuestos/`)
Establece límites de gasto para una categoría en un período determinado.
* **Modelo:**
  ```json
  {
    "id": 1,
    "categoria": 1, // Categoría a presupuestar (tipo "gasto" o "ambos")
    "monto": "200000.00",
    "periodo": "2026-06-01" // Primer día del mes presupuestado
  }
  ```

### 6. Gastos Recurrentes (`/api/gastos-recurrentes/`)
Gastos fijos que se generan periódicamente.
* **Modelo:**
  ```json
  {
    "id": 1,
    "monto": "9990.00",
    "frecuencia": "mensual", // Opciones: "semanal", "mensual", "trimestral", "semestral", "anual"
    "categoria": 3,
    "descripcion": "Spotify Family",
    "activo": true,
    "ultimo_generado": "2026-06-13"
  }
  ```
