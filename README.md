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
-   **Tabla:** Tabla `appointments` vinculada a `clientes_fidelizacion` y `empleados` mediante llaves foráneas.
-   **Interfaz:** Calendario profesional con FullCalendar y múltiples vistas.
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

### 6. Punto de Venta (POS), Facturación y Recibos Ecológicos
-   **Transaccionalidad Atómica (Reloj Suizo)**: Implementación de una función RPC en PostgreSQL (`procesar_factura_completa`) que procesa cobros, liquida ítems, redime bonos y calcula comisiones en una única transacción atómica, garantizando integridad absoluta de los datos financieros.
-   **Cómputo de Comisiones Avanzado**: Motor de cálculo dinámico que respeta la política del tenante (`gross` vs `net`), calculando proporcionalmente las ganancias de los empleados incluso cuando se aplican bonos promocionales.
-   **Fidelización Inteligente**: Aplicación automática de descuentos para bonos de "Cumpleaños" (15%) y "Bienvenida" (10%) durante el checkout, reduciendo el error humano en caja.
-   **Recibo Digital Ecológico**: 
    -   **Modal Premium**: Interfaz moderna con soporte de scroll y feedback visual de estado (Éxito/Error).
    -   **Estrategia "Verde"**: Botones dedicados para envío instantáneo por **WhatsApp** y **Email Ecológico** (vía n8n), desincentivando el uso de papel.
    -   **Impresión Optimizada**: Función de impresión inmaculada que genera tickets físicos limpios solo en caso estrictamente necesario.
-   **Integración con Agenda**: Las facturas ahora se vinculan automáticamente con la tabla de `appointments`, permitiendo auditorías cruzadas entre citas y cobros reales.

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

### 10. Marca Blanca y Escalabilidad (White-Label Readiness)
-   **Configuración Centralizada**: Implementación de `src/config/brand.ts` como punto único de verdad para el nombre de la app, textos legales, logos y fallbacks de marca.
-   **Desacople de Identidad**: Eliminación de referencias hardcodeadas ("Londy", "Nelson") en todo el código fuente, preparándolo para ser renombrado instantáneamente por otros clientes.
-   **Seguridad de Integración**: Migración de URLs críticas (webhooks de n8n) a variables de entorno (`.env`).
-   **Logging Centralizado**: Implementación de `src/lib/logger.ts` con soporte para niveles (info, warn, error) y contextos, preparado para conectarse a servicios de monitoreo en producción (Sentry/LogRocket).
-   **Refactorización de Tipado**: Eliminación total del tipo `any` en servicios críticos y unificación de utilidades como `fetchWithTimeout` en `lib/utils.ts`.

### 11. Interfaz de Usuario e Identidad (UX)
-   **Londy Branding**: Transición completa a la nueva identidad de marca, incluyendo logotipos, favicons, títulos y un diseño minimalista premium.
-   **UserMenu Interactivo**: Despliegue de un menú de perfil avanzado en el Topbar que muestra el nombre del usuario, su avatar real y su rol (Badge de seguridad), con opciones rápidas de navegación a Ajustes.
-   **Gestión de Perfil Premium (`ProfileCard`)**: Implementación de una interfaz de perfil elegante con banner dinámico, subida de avatar a Supabase Storage con reemplazo automático (Upsert) y edición de nombre en tiempo real sincronizada con Supabase Auth.
-   **Notificaciones Vivas**: Campana con efecto de "ping" animado para alertas críticas del negocio.

### 12. Estabilidad Estructural y Patrones Limpios (Strict Mode)
-   **Anti-Spaghetti AuthProvider**: Refactorización profunda y asíncrona del puente SDK para eliminar por completo cierres silenciosos o recargas en bucle de la aplicación.
-   **Failsafe Timeout de Seguridad**: Implementación de temporizadores estrictos (`fetchWithTimeout` de 5s) para promesas de Supabase, escudando a la UI de parálisis (`loading: true` infinito) originadas por fallos en red o consultas de bases de datos colgadas.
-   **Seguridad RLS Anti-Bucles (PostgreSQL)**: Refactorización en la base de datos empleando funciones `SECURITY DEFINER` (`is_admin`, `is_owner`) para romper dependencias de recursividad infinita durante validaciones escalonadas de roles (RBAC), evitando el ahogamiento del servidor de Supabase y de la aplicación concurrente.
-   **Separación de Responsabilidades (Clean Architecture)**: Refactorización del monolítico `dashboardService.ts` en funciones atómicas concurrentes (`Promise.all`) para agilizar tiempos de carga y mejorar mantenibilidad.
-   **Componentización UI**: Extracción de componentes complejos hacia módulos independientes (e.j., desacople de la tabla de comisiones a `<StaffTable />` e íconos SVG intrusivos a `<GoogleIcon />`).
-   **TypeScript Estricto**: Eliminación total del tipo `any` en todo el codebase y configuración de `strict: true` para prevenir errores en tiempo de ejecución.

### 13. Validación de Bonos y UI Modular
-   **Módulo Independiente (`/bonuses`)**: Nueva interfaz interactiva y visual para la validación y canje manual de cupones de fidelización. Totalmente aislada del módulo de Facturación para uso exclusivo administrativo/operativo.
-   **Validación Estricta**: Consulta en tiempo real a Supabase comprobando el estado del bono (solo aplicable si está `Pendiente`) y descubriendo al `cliente_id` respectivo automáticamente, protegiendo al negocio contra canjes dobles.
-   **Seguridad de Tipado**: Interfaz desarrollada con TypeScript Strict-Mode sin uso de `any`, empleando coerciones explícitas e instancias nativas (`instanceof Error`) para máxima seguridad y evitando quiebres en el runtime (`ReferenceError`).

### 14. Auditoría de MVP y Estabilización (V0.2.0)
-   **Sincronización Multimódulo**: Implementación de un sistema de eventos ligero (`lib/events.ts`) que comunica cambios entre secciones. El canje de un bono ahora actualiza instantáneamente el Dashboard y la tabla de Clientes sin necesidad de recargar la página.
-   **Servicio de Bonos Centralizado**: Extracción de la lógica de negocio a `bonoService.ts`, unificando procesos y eliminando accesos directos redundantes a Supabase en los Hooks.
-   **Seguridad y Relaciones Precisas**: Corrección de ambigüedades en llaves foráneas causadas por RLS (`clientes_fidelizacion!client_id`), asegurando que las vistas JOIN se rendericen limpias sin emitir errores de estado restrictivo HTTP (`406 Not Acceptable`).
-   **Validación de Datos Robusta**:
    -   **Validación de Teléfono**: Sanitización de caracteres y comprobación de longitud mínima (9 dígitos) con feedback visual en tiempo real.
    -   **Vencimientos Automáticos**: Eliminación de campos manuales de fecha; el sistema ahora gestiona la expiración de bonos de manera automatizada (6 meses para bienvenida, mes completo para cumpleaños).
-   **Experiencia de Usuario (UX) Segura**:
    -   **Confirmación de Canje**: Interfaz de confirmación in-place antes de redimir bonos para evitar errores accidentales.
    -   **Diálogos Personalizados**: Implementación de `ConfirmDialog` para reemplazar alertas nativas del navegador, manteniendo una estética consistente y premium.
    -   **Manejo de Clientes Manuales**: Lógica mejorada para mostrar "Sin bono" en lugar de estados predeterminados incorrectos para registros manuales.
-   **Mantenibilidad y Código Limpio**:
    -   **Organización DB**: Migraciones SQL organizadas jerárquicamente en `database/migrations/`.
    -   **Depuración Consecuente**: Eliminación de scripts de depuración obsoletos y centralización de todos los logs mediante el servicio de `logger`.
    -   **Cero Deuda Técnica**: Eliminación completa de tipos `any` y advertencias de TypeScript en todo el proyecto.

### 15. Despliegue a Producción (Vercel)
-   **Hosting en Vercel**: Despliegue automático desde la rama `main` del repositorio GitHub. Cada push a `main` genera un nuevo deploy de producción sin intervención manual.
-   **SPA Routing (`vercel.json`)**: Configuración de rewrites para que todas las rutas de React Router (`/clients`, `/calendar`, `/billing`, etc.) funcionen correctamente sin errores 404 al recargar la página.
-   **Variables de Entorno en Producción**: Migración segura de `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `VITE_N8N_WEBHOOK_URL` al panel de Vercel, eliminando cualquier dependencia de archivos `.env` locales.
-   **Google OAuth en Producción**: Configuración de Supabase (Site URL + Redirect URLs) y Google Cloud Console (Authorized JavaScript Origins + Redirect URIs) para permitir autenticación con Google desde el dominio de producción.
-   **URL de Producción**: `https://beauty-crm-platform.vercel.app`
-   **Flujo de Onboarding de Clientes**: El cliente se loguea con Google OAuth → El administrador asigna el rol (`owner`, `admin`, `staff`) desde el SQL Editor de Supabase en la tabla `user_roles`.

### 16. SaaS Multi-Tenant y Marca Blanca Dinámica (MVP)
-   **Configuración por Inquilino (TenantConfig)**: Tabla dedicada en Supabase (`tenant_config`) segregada por RLS (`user_id`), garantizando que cada dueño de negocio solo lea y actualice su propia marca.
-   **Contexto Global (`TenantContext`)**: Proveedor reactivo de React que envuelve toda la aplicación, extrayendo silenciosamente las preferencias de marca en paralelo al login sin penalizar la velocidad de carga de la UI.
-   **Interfaz Totalmente Dinámica**: Reemplazo en crudo del nombre "Londy" y el logo estático por las preferencias personalizables cargadas remotamente. Soporta fallbacks automáticos hacia logotipos genéricos e iniciales para evadir bloqueos por URLs de imagen rotas o no válidas.
-   **Autogestión de Propietario (`BrandConfigModal`)**: Ventana flotante in-app (dentro de "Ajustes") donde el `owner` puede editar sin código el nombre comercial y el enlace de su logo para reflejar los cambios instantáneamente a nivel de todo el CRM.

### 17. Estabilización de Datos y Flujos Automáticos (Bug Fixing)
-   **Corrección de Migraciones RLS**: Eliminación de IDs en duro (hardcoded) en los scripts de migración SQL para prevenir el secuestro de datos y asegurar que el `user_id` asigne correctamente los nuevos registros al tenant activo (`auth.uid()`).
-   **Nodos Seguros en n8n**: Refactorización del flujo `registro_cliente.json` para inyectar explícitamente el `user_id` del salón mediante un nodo central de "Configuración Inicial".
-   **Saneamiento Preventivo**: Implementación de validaciones defensivas en JavaScript (`.trim()`) en las llamadas a Supabase desde n8n, garantizando que espacios ocultos en los UUIDs no provoquen rechazos de base de datos.
-   **Aislamiento Real**: Flujo End-to-End validado: el webhook capta al cliente, n8n asigna el Tenant ID de forma segura y Supabase aplica el Row Level Security (RLS) para mostrarlo instantáneamente en el Dashboard correcto.

### 18. Perfil Detallado del Cliente y Valor de Vida (LTV)
- **Vista de Perfil Individual (`/clients/:id`)**: Nueva interfaz dedicada que consolida toda la información de un cliente en un solo lugar.
- **Métricas de Fidelidad (LTV)**: Cálculo automático del "Valor de Vida" (Total gastado), "Total de Visitas" y "Ticket Promedio" directamente desde el historial de facturas.
- **Historial Financiero**: Pestaña dedicada para consultar todas las facturas pasadas asociadas al cliente, permitiendo un seguimiento preciso de sus preferencias y frecuencia.
- **Gestión de Bonos Personalizada**: Visualización de los cupones activos del cliente con acceso rápido para canje.

### 19. Historial de Ventas y Rendimiento de Colaboradores
- **Módulo de Auditoría de Ventas (`/invoices`)**: Repositorio central de todas las transacciones realizadas en el salón. Permite buscar y auditar facturas por ID o nombre de cliente.
- **Rendimiento de Colaboradores**: Cada integrante del staff cuenta con su propio historial de servicios prestados (`/staff/:id/sales`), permitiendo al administrador auditar su productividad, comisiones generadas y clientes atendidos.
- **Filtros de Seguridad**: El sistema de facturación ahora filtra automáticamente al personal inactivo, evitando errores en el punto de venta sin perder la integridad de los datos históricos.

### 20. Agenda Profesional Multi-Colaborador (FullCalendar)
-   **Motor de Calendario**: Migración completa del calendario artesanal a **FullCalendar** (`@fullcalendar/react`), ganando vistas profesionales (Mes, Semana, Día) con navegación fluida y locale en español.
-   **Vista por Colaborador (Resources)**: Implementación de `resourceTimeGridDay` que muestra columnas paralelas por cada miembro del staff, permitiendo gestionar agendas individuales simultáneamente sin colisiones.
-   **Filtro de Staff (`StaffFilter`)**: Panel lateral colapsable con paleta de colores determinística por colaborador (blue, purple, emerald, amber, etc.), permitiendo filtrar visualmente las citas por miembro del equipo.
-   **Modal Unificado (`AppointmentModal`)**: Interfaz única para crear y editar citas con soporte para:
    -   Asignación de **colaborador** responsable.
    -   Selección de **duración** configurable (30min, 45min, 1h, 1h30, 2h).
    -   Campo de **notas** (preparado para contexto de chatbot n8n).
    -   **Cambio de estado** visual (Programada / Completada / Cancelada) con eliminación segura.
-   **Theming Consistente (`calendarStyles.css`)**: Override estético completo de FullCalendar adaptado al design system del CRM (purple primary, Tailwind borders, shadows, responsive mobile). Incluye limpieza visual de advertencias de licencia para un acabado 100% profesional.
-   **Migración de Base de Datos**: Extensión de la tabla `appointments` con columnas `empleado_id` (FK a `empleados`), `duracion_minutos` y `notas`, incluyendo índice de rendimiento.
-   **Preparación para n8n/Chatbot**: Webhook payload extendido con `empleado_nombre` e interfaz `CreateAppointmentPayload` lista para integración directa con flujos de automatización.

### 21. Auditoría de Bonos y Control de Caja (UX Avanzada)
-   **Historial Detallado**: Nuevo módulo de auditoría integrado directamente en la pantalla de "Validar Bonos" para facilitar el flujo operativo.
-   **Filtros de Datos Inteligentes**: Sistema de filtrado por rango temporal (Día, Mes, Año, Histórico) y por tipo de campaña (Bienvenida, Cumpleaños, Reactivación, Especial).
-   **Sincronización Atómica**: El historial se actualiza en tiempo real sin recargar la página gracias a un sistema de eventos reactivo (`BONO_REDEEMED`).
-   **Módulo de Personal (Staff):** Refactorizar el componente para permitir la edición de datos de empleados (porcentajes de comisión) y su desactivación lógica, preservando así su historial de cobros y comisiones.

### 22. Optimización de Rendimiento y Cimientos SaaS (SuperAdmin)
-   **Optimización de Recordatorios (n8n)**:
    -   Refactorización del flujo `recordatorios_citas.json` para usar lógica de tiempo robusta en UTC.
    -   Saneamiento de tipos de datos en filtros (eliminación de comillas en valores numéricos y booleanos).
    -   **Server-side Filtering**: Optimización del nodo de búsqueda en Supabase para filtrar citas directamente en la base de datos (ventana de 26h), eliminando latencia y mejorando la escalabilidad.
-   **Tailwind CSS "Clean Code"**:
    -   Implementación de `safelist` mediante patrones `regex` para proteger dinámicamente las clases de colores de estados (Staff, Bonos, Alertas) y evitar que sean eliminadas durante el purgado del build.
-   **Performance (Code Splitting)**:
    -   Migración completa a **Carga Perezosa (`React.lazy`)** y **Suspense** en el enrutador principal.
    -   Reducción drástica del bundle inicial de JavaScript de **1.4MB a ~530KB** (reducción del 60%).
    -   Inclusión de un `PageLoader` premium con micro-animaciones para transiciones fluidas de página.
-   **Infraestructura SuperAdmin (Multitenancy Avanzado)**:
    -   Extensión del sistema de roles (RBAC) para incluir el rol **`superadmin`**.
    -   Creación del centro de mando global (`/admin`) con métricas de plataforma.
    -   Actualización de la lógica del Sidebar y `ProtectedRoute` para aislamiento de privilegios.

### 22. Jerarquía de Usuarios y Multi-Tenancy Compartido
- **Jerarquía Multinivel**: Implementación de roles estructurados: `superadmin` (Gestión Global), `owner` (Dueño de Salón), `admin` (Encargado) y `staff` (Operativo).
- **Vínculo Tenant ID**: Evolución del modelo de aislamiento permitiendo que múltiples usuarios (`staff`) compartan el acceso a los datos de un mismo salón (`owner`) mediante la columna `tenant_id` en la tabla de roles.
- **Seguridad SQL (Hardening)**: Blindaje de funciones de base de datos (`is_superadmin`, `get_my_tenant_id`) mediante la definición estricta de `search_path`, eliminando vulnerabilidades de inyección de esquemas.

## 🗺️ Roadmap de Desarrollo (Pendientes)

### Fase 3: Calidad y Continuidad (SaaS)
- [x] **Tests Automatizados:** Implementar Vitest (17 tests) para servicios críticos (Fechas, Roles, Comisiones).
- [x] **Despliegue a Producción:** Deploy en Vercel con CI/CD automático desde `main`.
- [x] **Optimización de Bundle:** Implementar Code Splitting para mejorar tiempos de carga (60% más ligero).
- [ ] **Monitoreo Real:** Integrar el Logger con un servicio de captura de excepciones en producción.
- [ ] **Documentación API:** Documentar los endpoints de Supabase y esquemas de tablas.

### Fase 4: SaaS Avanzado e Inteligencia Financiera
- [x] **Configuración de Políticas de Facturación:** Implementar toggle en `/settings` para permitir a cada negocio elegir si las comisiones de los empleados se calculan sobre el precio bruto o el precio neto (después de bonos promocionales).
- [x] **Historial Financiero del Cliente (LTV):** Implementar pestaña de "Facturación" en el perfil del cliente para visualizar su historial de pagos y valor de vida.
- [x] **Auditoría de Bonos y Control de Caja:** Implementar filtros avanzados y reporte de canjes para operativa diaria.
- [x] **Cimientos de Administrador Global (SuperAdmin):** Estructura RBAC y Dashboard global implementados con seguridad endurecida.
- [x] **Multi-Tenancy Compartido:** Capacidad para que el Staff acceda a los datos de su salón correspondiente.
- [x] **Sistema de Notificaciones (Toasts):** Reemplazar alertas nativas de navegador por un sistema de notificaciones premium (Sonner/Toast) en toda la plataforma.
- [ ] **Onboarding Wizard:** Guía interactiva para que nuevos clientes configuren sus servicios y empleados.
- [x] **Agenda Multi-Colaborador:** Implementar calendario profesional con FullCalendar, vistas por colaborador y preparación para integración con chatbot n8n.

### 22. Estabilización SaaS y Refactorización (v0.3.0)
- **Dashboard SuperAdmin corregido**: Reparación de la integridad referencial (FK) entre `user_roles` y `tenant_config`, eliminando errores 400.
- **Visibilidad Multi-tenant (n8n)**: Saneamiento de flujos de automatización para eliminar IDs obsoletos e inyectar correctamente el `tenant_id`, asegurando que los nuevos clientes sean visibles inmediatamente para sus respectivos dueños.
- **Refactorización de Servicios**: Estandarización de `clientService`, `billingService`, `appointmentService` y `dashboardService` bajo TypeScript estricto, eliminando tipos `any` y aplicando `fetchWithTimeout` para máxima resiliencia.
- **Auditoría n8n**: Repositorio de flujos (`n8n_workflows/`) actualizado con la lógica de segregación masiva para escalar a múltiples salones.

## Comandos

-   `npm install`: Instalar dependencias
-   `npm run dev`: Iniciar servidor de desarrollo
-   `npm run build`: Construir para producción
-   `npx tsc --noEmit`: Verificación de tipos estricta


