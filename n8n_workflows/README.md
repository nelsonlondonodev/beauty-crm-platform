# 🤖 Automatizaciones n8n - Beauty CRM

Este directorio contiene los flujos de trabajo (workflows) que impulsan la inteligencia del CRM de Narbo's Salón Spa. El sistema está diseñado para funcionar como un "reloj suizo", coordinando la base de datos de Supabase, el envío de correos (SMTP) y la interacción directa con el cliente.

## 📋 Resumen de Flujos

### 1. Gestión de Citas (`gestion_citas.json`)
- **Propósito**: Notificar al cliente inmediatamente después de agendar una cita.
- **Funcionamiento**: Recibe un Webhook POST del CRM -> Formatea la fecha a formato local legible (ej: "miércoles, 11 de marzo...") -> Envía email de confirmación.
- **Punto Clave**: Aplanamiento de datos para asegurar que el contenido del correo nunca llegue vacío.

### 2. Recordatorios de Citas (`recordatorios_citas.json`)
- **Propósito**: Reducir el ausentismo mediante notificaciones automáticas.
- **Frecuencia**: Se ejecuta cada 30 minutos.
- **Lógica**:
    - Rama 24h: Filtra citas programadas para el día siguiente.
    - Rama 2h: Filtra citas para las próximas 2 horas.
- **Interactividad**: Incluye botones dinámicos para Confirmar, Reprogramar (WhatsApp) o Cancelar.
- **Flags**: Utiliza las columnas `reminder_24h_sent` y `reminder_2h_sent` en DB para evitar envíos duplicados.

### 3. Gestión de Respuestas (`gestion_respuestas_citas.json`)
- **Propósito**: Procesar las acciones del cliente desde el correo.
- **Nodos**:
    - `/confirmar-cita`: Actualiza estado a `confirmada` y redirige a la web.
    - `/cancelar-cita`: Actualiza estado a `cancelada` y muestra mensaje HTML de éxito.

### 4. Notificación Diaria y Cumpleaños (`notificacion_diaria_feliz_cumpleanos.json`)
- **Propósito**: Fidelización diaria y recordatorios de bonos antiguos.
- **Ejecución**: 9:00 AM diariamente.
- **Lógica Cumpleaños**:
    - Si ya tiene bono (día 1): Envía recordatorio o felicitación.
    - Si es registro nuevo (sin bono): **Crea el bono al instante** con vencimiento a fin de mes y lo envía.
- **Lógica Vencimiento**: Busca bonos de bienvenida de hace 150 días (5 meses) y envía alerta de último chance.

### 5. Campaña Inicio de Mes (`campana_mes_cumpleanos.json`)
- **Propósito**: Generación masiva de beneficios el día 1 de cada mes.
- **Frecuencia**: Mensual (Día 1, 9:00 AM).

## 🛠️ Notas Técnicas para Mantenimiento
- **URLs de Webhook**: Asegurarse de que el CRM apunte siempre a la URL de producción de n8n.
- **Headers**: Los nodos de respuesta HTML deben incluir el header `Content-Type: text/html`.
- **Zonas Horarias**: El sistema utiliza la zona horaria de Colombia (`es-CO`) para el formateo de todas las fechas.

---
© 2026 Narbo's Salón Spa
