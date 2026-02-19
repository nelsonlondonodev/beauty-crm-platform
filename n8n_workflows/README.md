# Flujos de Trabajo de n8n (Automatizaciones)

Esta carpeta contiene los archivos JSON de los flujos de trabajo de n8n utilizados en la plataforma. Estos archivos son genéricos y "Marca Blanca" para facilitar la escalabilidad y el mantenimiento del proyecto.

## Archivos de Flujo

| Archivo JSON | Descripción | Función Principal | Origen (Ejemplo) |
| :--- | :--- | :--- | :--- |
| **`gestion_citas.json`** | Confirmación de Cita | Envía correo de confirmación al agendar cita. | *Confirmación de Cita - Beauty CRM* |
| **`registro_cliente.json`** | Fidelización y Registro | Registra cliente en Supabase, genera cupón y QR, envía correo de bienvenida. | *Fidelización Narbos* |
| **`notificaciones_bonos_cumpleanos.json`** | Retención (Bonos/Cumpleaños) | Envía correos automáticos por cumpleaños y vencimiento de bonos (Cron). | *Narbo's Automatizaciones de Retención* |
| **`validacion_qr.json`** | Canje de QR | Webhook para validar y redimir cupones mediante escaneo de QR. | *Fidelización Narbo's - Canje QR* |

## Instrucciones de Importación

1.  Abre tu instancia de n8n.
2.  Crea un nuevo workflow.
3.  Ve al menú (tres puntos arriba a la derecha) -> Import from File.
4.  Selecciona uno de estos archivos `.json`.
5.  Configura las credenciales (Supabase, SMTP/Gmail) en los nodos correspondientes si es necesario.
