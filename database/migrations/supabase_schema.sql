-- Drop table if it exists (assuming it is empty or safe to recreate)
DROP TABLE IF EXISTS public.appointments CASCADE;

-- Create appointments table with correct FK type (bigint for clientes_fidelizacion)
CREATE TABLE public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    fecha_cita TIMESTAMP WITH TIME ZONE NOT NULL,
    cliente_id BIGINT REFERENCES public.clientes_fidelizacion(id) ON DELETE CASCADE, -- Changed UUID to BIGINT
    servicio TEXT NOT NULL,
    estado TEXT DEFAULT 'programada' CHECK (estado IN ('programada', 'confirmada', 'completada', 'cancelada')),
    pago_estado TEXT DEFAULT 'pendiente' CHECK (pago_estado IN ('pendiente', 'pagado')),
    nota TEXT
);

-- Re-enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Re-apply policy
CREATE POLICY "Enable all access for all users" ON public.appointments
    FOR ALL USING (true) WITH CHECK (true);
