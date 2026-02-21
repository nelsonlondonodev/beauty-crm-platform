# Beauty CRM Platform

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

## Pendientes (WIP)

-   [ ] Implementar sistema de roles (RBAC) más robusto en el futuro.

## Comandos

-   `npm install`: Instalar dependencias
-   `npm run dev`: Iniciar servidor de desarrollo
-   `npm run build`: Construir para producción
