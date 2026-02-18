-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    fecha_cita TIMESTAMP WITH TIME ZONE NOT NULL,
    cliente_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    servicio TEXT NOT NULL,
    estado TEXT DEFAULT 'programada' CHECK (estado IN ('programada', 'confirmada', 'completada', 'cancelada')),
    pago_estado TEXT DEFAULT 'pendiente' CHECK (pago_estado IN ('pendiente', 'pagado')),
    nota TEXT
);

-- Habilitar RLS (Row Level Security) para seguridad básica
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir acceso público (ajustar según necesidad real)
-- Para MVP/Demo permitimos todo. En prod idealmente autenticado.
CREATE POLICY "Enable all access for all users" ON public.appointments
    FOR ALL USING (true) WITH CHECK (true);
