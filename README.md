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

## Integraciones

-   **Supabase (Producción):** Base de datos real conectada (Proyecto: `Fidelizacion Narbo's Pro`).
-   **Adaptadores:** Servicios personalizados para transformar datos de n8n/Supabase al frontend.

## Comandos

-   `npm install`: Instalar dependencias
-   `npm run dev`: Iniciar servidor de desarrollo
-   `npm run build`: Construir para producción
