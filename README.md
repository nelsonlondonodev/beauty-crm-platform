# Londy - Beauty Industry CRM

CRM B2B moderno para el sector de la belleza (Peluquerías, Barberías, Spas).

## Stack Tecnológico

- **Frontend:** React, Vite, TypeScript
- **Estilos:** Tailwind CSS
- **Iconos:** Lucide React
- **Router:** React Router v7 (compatible)

## Estructura del Proyecto

```
.
├── n8n_workflows/    # Flujos de automatización JSON (Marca Blanca)
└── src/
    ├── components/   # Componentes reutilizables
    │   ├── dashboard/# Componentes específicos del dashboard
    │   └── layout/   # Componentes de estructura (Sidebar, Topbar)
    ├── hooks/        # Custom React Hooks
    ├── lib/          # Utilidades y funciones helper
    ├── pages/        # Vistas principales de la aplicación
    ├── services/     # Servicios de API (Supabase, etc.)
    ├── types/        # Definiciones de tipos TypeScript
    └── utils/        # Utilidades generales
```

## Características Implementadas

1.  **Layout Principal (Londy):** Sidebar de navegación optimizada y Topbar con búsqueda global, campana de notificaciones interactiva y menú de usuario personalizado.
2.  **Dashboard Inteligente:** Vista principal con tarjetas de estadísticas en tiempo real, saludo dinámico ("Bienvenido de nuevo, [Nombre]") y filtros de base de datos optimizados para eficiencia.
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

### 3. Autenticación, Seguridad (RLS) y Roles (RBAC)
-   **Contexto Robusto**: `AuthContext` optimizado con un *Failsafe* (Timeout de 5s) para prevenir bloqueos de pantalla de carga infinita por condiciones de carrera (`INITIAL_SESSION`).
-   **Control de Acceso (RBAC)**: Nueva tabla estructural `user_roles` implementada en Supabase para gestionar permisos granulares (`owner`, `admin`, `staff`).
-   **Protección de Interfaz**: Componente `ProtectedRoute` y barra lateral (`Sidebar`) dinámicos que ocultan módulos sensibles financieros y configuraciones al personal base (`staff`), enviándolos directamente a sus vistas operativas (Agenda).
-   **Aislamiento de Datos (RLS)**: Integración total hacia un modelo Multi-Tenant mediante Row Level Security (`user_id = auth.uid()`), encapsulando la información a nivel de base de datos por tenante.

### 4. Automatizaciones con n8n
-   **Repositorio Local**: Carpeta `n8n_workflows/` con flujos JSON para replicabilidad.
-   **Confirmación de Cita**: Webhook para enviar email al cliente.
-   **Fidelización**: Registro, QR de descuento, y bienvenida.
    -   *Generador de Cupones robusto*, sanitizando nombres con espacios y tildes para código exacto.
    -   *Botón de Re-reserva* directo en WhatsApp precargado con variable en email.
-   **Retención Avanzada**: Cron jobs diarios para cumpleaños y vencimiento de bonos a 5 meses.
    -   *Inyección HTML directa* con variables dinámicas de Supabase.
    -   *Generación de códigos QR en tiempo real* (quickchart.io) sin necesidad de adjuntos (incluyendo `encodeURIComponent` para URIs seguras).
    -   *Filtros precisos de fecha* usando validaciones estrictas y formato Luxon (`toFormat('yyyy-MM-dd')` y comparaciones de Strings exactas para no enviar Spam).
-   **Canje QR**: Validación en tiempo real de cupones interactiva.
    -   *Pantalla Intermedia de Confirmación:* Flujo con Webhooks divididos para prevenir canjes accidentales por el escáner (Botón "Confirmar y Canjear" vs "Cancelar").
    -   *Manejo de Respuestas Limpias:* `alwaysOutputData` integrado al nodo de lectura Supabase y cierres JS puros para evitar bloqueos del móvil.

### 5. Arquitectura de Base de Datos (Escalabilidad de Bonos)
-   **Estructura Relacional Pro**: Se refactorizó la base de datos dividiendo `clientes_fidelizacion` y creando una tabla independiente `bonos`.
-   **Tabla `bonos`**: 
    - Guarda múltiples cupones por persona (Ej: `Bienvenida`, `Cumpleaños`, `Reactivacion`, `Especial`).
    - Rastrea estados individuales (`Pendiente`, `Canjeado`, `Expirado`) para evitar colisiones y mala experiencia de usuario.
-   **Migración Segura**: Uso de script SQL (`supabase_migracion_bonos.sql`) para transferir historial y limpiar tabla matriz.
-   **Integración n8n Actualizada**: Todos los flujos conectados a la DB (`registro_cliente.json`, `notificaciones_bonos_cumpleanos.json`, `validacion_qr.json`) ahora apuntan a la arquitectura desacoplada. Tests *End-to-End* aprobados exitosamente.

### 6. Punto de Venta (POS) y Facturación
-   **Interfaz Atómica**: Refactorización del componente principal `Billing.tsx` en subcomponentes modulares (`BillingClientSearch`, `BillingItemTable`, `BillingCheckoutSummary`).
-   **Tablas en Supabase**: Creación de la estructura relacional `facturas` y `factura_items`.
-   **Asignación de Servicios**: Capacidad de seleccionar al colaborador (empleado) que realizó cada servicio directamente en la caja, adaptando automáticamente la interfaz (`flex-grow`).
-   **Checkout Automático**: Botón interactivo "Liquidar y Cobrar" que calcula los totales, procesa y asigna las comisiones correspondientes a cada empleado, guardando todo de forma segura en la base de datos mediante `billingService.ts`.

### 7. Gestión de Personal (Staff) y Comisiones
-   **Administración en Tiempo Real**: Vista conectada a Supabase para gestionar al equipo y sus ganancias (`staffService.ts` / `useStaff.ts`).
-   **Tablas en Supabase**: Estructura sólida con tablas para `empleados` y el historial de `pagos_comisiones`.
-   **Cálculo Exacto de Saldos**: Motor matemático que procesa las "Ventas Acumuladas" y las "Comisiones Históricas" (desde las facturas), restando los pagos realizados para mostrar el "Saldo Pendiente" exacto de cada miembro.
-   **UX Avanzada**: Modal moderno (`NewStaffModal`) para la creación guiada de nuevos colaboradores y asignación de sus respectivos Porcentajes de Comisión (%).
-   **Botones de Liquidación**: Acciones de un solo click ("Pagar" individualmente o "Liquidar Todos") que registran los pagos en la base de datos localizando la deuda pendiente a $0.

### 8. Buscador Global Inteligente (Topbar)
-   **Componente Interactivo (`GlobalSearch.tsx`)**: Reemplazo del placeholder estático por un buscador real integrado en la barra de navegación superior.
-   **Typeahead en Tiempo Real**: Filtro instantáneo de la base de clientes almacenada en caché local (vía `useClients`), evitando sobrecargas en Supabase.
-   **Búsqueda Multi-campo**: Capacidad de buscar coincidencias por Nombre, Teléfono o Correo Electrónico.
-   **Dropdown UI (UX Mejorada)**:
    -   Muestra visualmente los top 5 resultados con información de contacto.
    -   Incluye *badges* indicando el estado del bono de fidelización (Bono Activo, Vencido, Canjeado, etc.).
    -   Cerrado automático inteligente al hacer click fuera del componente (`onClickOutside`).
-   **Redirección Fluida**: Los resultados y el botón de "Ver todos" navegan eficientemente al módulo correspondiente usando React Router (`/clients`).

### 9. Dashboard Dinámico y Reportes (Optimización Londy)
-   **Gráfico Evolutivo de Ingresos**: Componente `RevenueChart` refactorizado para consumir la información generada activamente en tiempo real en lugar de datos estáticos falsos. Motor relacional que consulta la tabla de `facturas` para graficar los últimos 7 periodos, reaccionando automáticamente a los nuevos ingresos y transacciones procesadas por el POS.
-   **Filtrado Server-Side**: Refactorización de `dashboardService.ts` para que el cálculo de próximos cumpleaños y bonos por vencer se realice directamente en Supabase (PostgreSQL), reduciendo drásticamente la carga de datos en el cliente.
-   **Resiliencia con Timeouts**: Implementación de `fetchWithTimeout` en todas las consultas críticas del dashboard para asegurar que la interfaz nunca se bloquee por latencia de red.
-   **Timeline Real de Actividades**: El feed de `Actividad Reciente` consolidado desde 4 tablas distintas (`appointments`, `clientes_fidelizacion`, `facturas`, `bonos`). Usa `date-fns` para cálculo de fechas relativas ("Hace 5 minutos") y ordena históricamente asegurando que todos los eventos del ecosistema beauty se reflejen de último momento sin estancamientos.

### 11. Interfaz de Usuario e Identidad (UX)
-   **Londy Branding**: Transición completa a la nueva identidad de marca, incluyendo logotipos, favicons, títulos y un diseño minimalista premium.
-   **UserMenu Interactivo**: Despliegue de un menú de perfil avanzado en el Topbar que muestra el nombre del usuario, su rol (Badge de seguridad) y opciones rápidas de navegación (Ajustes, Mi Perfil, Logout).
-   **Notificaciones Vivas**: Campana con efecto de "ping" animado para alertas críticas del negocio.

### 10. Estabilidad Estructural y Patrones Limpios (Strict Mode)
-   **Anti-Spaghetti AuthProvider**: Refactorización profunda y asíncrona del puente SDK para eliminar por completo cierres silenciosos o recargas en bucle de la aplicación.
-   **Failsafe Timeout de Seguridad**: Implementación de temporizadores estrictos (`fetchWithTimeout` de 5s) para promesas de Supabase, escudando a la UI de parálisis (`loading: true` infinito) originadas por fallos en red o consultas de bases de datos colgadas.
-   **Seguridad RLS Anti-Bucles (PostgreSQL)**: Refactorización en la base de datos empleando funciones `SECURITY DEFINER` (`is_admin`, `is_owner`) para romper dependencias de recursividad infinita durante validaciones escalonadas de roles (RBAC), evitando el ahogamiento del servidor de Supabase y de la aplicación concurrente.
-   **Separación de Responsabilidades (Clean Architecture)**: Refactorización del monolítico `dashboardService.ts` en funciones atómicas concurrentes (`Promise.all`) para agilizar tiempos de carga y mejorar mantenibilidad.
-   **Componentización UI**: Extracción de componentes complejos hacia módulos independientes (e.j., desacople de la tabla de comisiones a `<StaffTable />` e íconos SVG intrusivos a `<GoogleIcon />`).

## Pendientes (WIP) y Deuda Técnica

-   [x] **Sistema de Roles (RBAC):** Escalada de los correos "hardcodeados" a base de datos estructurada con tabla `user_roles`, permisos reactivos e interfaz condicionada para SaaS.
-   [x] **Seguridad de Base de Datos (RLS Multi-Tenant):** Se aislaron los datos mediante políticas de fila (`auth.uid() = user_id`) en las tablas transaccionales, preparando la aplicación para escalar a SaaS.

## Comandos

-   `npm install`: Instalar dependencias
-   `npm run dev`: Iniciar servidor de desarrollo
-   `npm run build`: Construir para producción
