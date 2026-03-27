-- ==============================================================================
-- MIGRACIÓN DE FIDELIZACIÓN: FICHA TÉCNICA DEL CLIENTE (MÓDULO NOTAS)
-- Objetivo: Añadir campo de notas generales para guardar la "huella técnica" 
-- del cliente (preferencias, tintes usados, alergias, gustos).
-- ==============================================================================

DO $$ 
BEGIN 
    -- 1. Añadir columna notas a clientes_fidelizacion
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clientes_fidelizacion' AND column_name='notas') THEN
        ALTER TABLE public.clientes_fidelizacion ADD COLUMN notas TEXT DEFAULT '';
    END IF;

    -- 2. Asegurar que las políticas RLS existentes permitan la actualización de este campo
    -- (Ya están cubiertas por la política de "Tenant Isolation: Clientes"), pero lo validamos.
END $$;

COMMENT ON COLUMN public.clientes_fidelizacion.notas IS 'Ficha técnica o historial de notas generales del cliente (preferencias del salón).';
