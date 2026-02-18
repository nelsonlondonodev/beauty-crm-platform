# Beauty CRM Platform

CRM B2B moderno para el sector de la belleza (Peluquerías, Barberías, Spas).

## Stack Tecnológico

- **Frontend:** React, Vite, TypeScript
- **Estilos:** Tailwind CSS
- **Iconos:** Lucide React
- **Router:** React Router v7 (compatible)

## Estructura del Proyecto

```
src/
├── components/       # Componentes reutilizables
│   ├── dashboard/    # Componentes específicos del dashboard
│   └── layout/       # Componentes de estructura (Sidebar, Topbar)
├── hooks/            # Custom React Hooks
├── lib/              # Utilidades y funciones helper
├── pages/            # Vistas principales de la aplicación
├── services/         # Servicios de API (Supabase, etc.)
├── types/            # Definiciones de tipos TypeScript
└── utils/            # Utilidades generales
```

## Características Implementadas

1.  **Layout Principal:** Sidebar de navegación y Topbar con diseño moderno.
2.  **Dashboard:** Vista principal con tarjetas de estadísticas y listas de actividad reciente.
3.  **Gestión de Clientes:** CRUD completo conectado a Supabase (`clientes_fidelizacion`).
4.  **Agenda:** Calendario interactivo para gestión de citas (`appointments`).
5.  **Configuración:** Módulo base para ajustes del sistema.
6.  **Tipado Estricto:** Uso de interfaces TypeScript para todos los modelos de datos.
7.  **Autenticación**:
    - Login con Correo y Contraseña.
    - Login con Google (OAuth).
    - Protección de Rutas (Middleware en Frontend).
    - Lista Blanca de Correos (Whitelist) para seguridad.

## Módulos e Integraciones Completadas

### 1. Gestión de Clientes (Supabase)
-   **Conexión Real:** Integrada con la tabla `clientes_fidelizacion` del proyecto de producción `Fidelizacion Narbo's Pro`.
-   **Adaptadores:** Lógica de negocio personalizada para transformar datos (`whatsapp` -> `telefono`, cálculo de vencimiento de bonos).
-   **Funcionalidad:** CRUD completo (Crear, Leer, Actualizar, Eliminar) con soporte para IDs numéricos.

### 2. Agenda (Calendario)
-   **Tabla:** Nueva tabla `appointments` creada y vinculada mediante `client_id` (BigInt) a `clientes_fidelizacion`.
-   **Interfaz:** Calendario interactivo con vistas mensuales y gestión de citas por día.
-   **Características:**
    -   Visualización de citas programadas/completadas/canceladas.
    -   Creación de nuevas citas seleccionando clientes existentes.
    -   **Integración con n8n**: Webhook automático al crear cita para notificaciones.

### 3. Autenticación y Seguridad
-   Implementación de `AuthContext` con Supabase Auth.
-   Página de Login con diseño "Glassmorphism".
-   Restricción de acceso mediante `ALLOWED_EMAILS` (Lista Blanca).

## Pendientes (WIP)

-   [ ] Ajustar configuración del nodo HTML en n8n para renderizar correctamente las variables del correo de confirmación.
-   [ ] Implementar sistema de roles (RBAC) más robusto en el futuro.

## Comandos

-   `npm install`: Instalar dependencias
-   `npm run dev`: Iniciar servidor de desarrollo
-   `npm run build`: Construir para producción
