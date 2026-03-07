-- =========================================================================================
-- MIGRACIÓN: Enlace Caja a Citas de la Agenda
-- =========================================================================================
-- Propósito: Mantener un flujo inquebrantable desde el calendario (Reserva) -> Caja (Pago)
-- de manera que una cita siempre sepa por cual factura fue liquidad y cerrada,
-- permitiendo analíticas en el futuro y anulando "doble cobros".

-- 1. Agregamos el identificador del turno agendado (Foreign Key)
ALTER TABLE public.facturas
ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL;

-- 2. Asegurar performance al cruzar ambas tablas para los resúmenes financieros del mes
CREATE INDEX IF NOT EXISTS idx_facturas_appointment_id ON public.facturas(appointment_id);

-- Documentación en DB
COMMENT ON COLUMN public.facturas.appointment_id IS 'ID de la cita reservada en el calendario, para cruce automático.';
