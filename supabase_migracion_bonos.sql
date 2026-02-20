-- 1. Crear la nueva tabla de bonos separada de los clientes
CREATE TABLE public.bonos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    client_id UUID NOT NULL REFERENCES public.clientes_fidelizacion(id) ON DELETE CASCADE,
    codigo TEXT UNIQUE NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'Bienvenida' CHECK (tipo IN ('Bienvenida', 'Cumpleaños', 'Reactivacion', 'Especial')), 
    estado TEXT NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Canjeado', 'Expirado')),
    fecha_vencimiento TIMESTAMP WITH TIME ZONE,
    fecha_canje TIMESTAMP WITH TIME ZONE
);

-- 2. Migrar inteligentemente los bonos que ya tenías en la tabla de clientes hacia la nueva tabla
-- De este modo no pierdes el código de Nelson Londoño ni de ningún otro cliente existente.
INSERT INTO public.bonos (created_at, client_id, codigo, tipo, estado, fecha_canje)
SELECT 
    created_at,
    id as client_id,
    codigo_descuento,
    'Bienvenida' as tipo,
    CASE WHEN canjeado = true THEN 'Canjeado' ELSE 'Pendiente' END as estado,
    fecha_canje
FROM public.clientes_fidelizacion
WHERE codigo_descuento IS NOT NULL;

-- 3. Limpiar la tabla de clientes (Eliminar las columnas viejas que ya no usaremos ahí)
ALTER TABLE public.clientes_fidelizacion 
DROP COLUMN IF EXISTS codigo_descuento,
DROP COLUMN IF EXISTS canjeado,
DROP COLUMN IF EXISTS fecha_canje;

-- 4. Habilitar seguridad (RLS) en la nueva tabla de bonos
ALTER TABLE public.bonos ENABLE ROW LEVEL SECURITY;

-- 5. Crear política de acceso (permitir todo temporalmente para desarrollo B2B)
CREATE POLICY "Enable all access for bonos" ON public.bonos FOR ALL USING (true) WITH CHECK (true);
