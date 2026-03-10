-- Migración para añadir flags de recordatorios a la tabla de citas
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS reminder_24h_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reminder_2h_sent BOOLEAN DEFAULT FALSE;

-- También nos aseguramos de que el estado 'confirmada' sea válido (ya lo es, pero por seguridad)
-- El check original era: (estado IN ('programada', 'confirmada', 'completada', 'cancelada'))
