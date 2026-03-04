-- 1. Eliminar todo el esquema actual (tablas existentes)
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.clientes_fidelizacion CASCADE;

-- 2. Crear tabla de CLIENTES con UUID como Primary Key
CREATE TABLE public.clientes_fidelizacion (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nombre TEXT NOT NULL,
    email TEXT,
    whatsapp TEXT NOT NULL,  -- Usado como teléfono
    birthday DATE,
    codigo_descuento TEXT UNIQUE,
    canjeado BOOLEAN DEFAULT FALSE,
    fecha_canje TIMESTAMP WITH TIME ZONE
);

-- 3. Crear tabla de CITAS (appointments) vinculada con UUID
CREATE TABLE public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    fecha_cita TIMESTAMP WITH TIME ZONE NOT NULL,
    client_id UUID NOT NULL REFERENCES public.clientes_fidelizacion(id) ON DELETE CASCADE,
    servicio TEXT NOT NULL,
    estado TEXT DEFAULT 'programada' CHECK (estado IN ('programada', 'confirmada', 'completada', 'cancelada')),
    pago_estado TEXT DEFAULT 'pendiente' CHECK (pago_estado IN ('pendiente', 'pagado')),
    nota TEXT
);

-- 4. Habilitar Row Level Security (RLS) - Opcional pero recomendado
ALTER TABLE public.clientes_fidelizacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas de acceso (Permitir todo temporalmente para desarrollo)
CREATE POLICY "Enable all access for clients" ON public.clientes_fidelizacion FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);
