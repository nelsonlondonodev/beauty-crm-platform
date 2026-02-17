-- Create Clients Table
CREATE TABLE public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE,
    telefono TEXT,
    fecha_nacimiento DATE,
    bono_estado TEXT DEFAULT 'pendiente' CHECK (bono_estado IN ('pendiente', 'reclamado', 'vencido', 'alerta_5_meses')),
    bono_fecha_vencimiento DATE
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create Policy: Allow read access to everyone (for now, will restrict later)
CREATE POLICY "Enable read access for all users" ON public.clients
    FOR SELECT USING (true);

-- Create Policy: Allow insert access to everyone (for now)
CREATE POLICY "Enable insert access for all users" ON public.clients
    FOR INSERT WITH CHECK (true);

-- Create Policy: Allow update access to everyone (for now)
CREATE POLICY "Enable update access for all users" ON public.clients
    FOR UPDATE USING (true);

-- Create Policy: Allow delete access to everyone (for now)
CREATE POLICY "Enable delete access for all users" ON public.clients
    FOR DELETE USING (true);
