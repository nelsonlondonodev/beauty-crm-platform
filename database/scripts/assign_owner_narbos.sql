-- ==============================================================================
-- SCRIPT DE ONBOARDING: ASIGNACIÓN DE OWNER (PROPIETARIO)
-- ==============================================================================
-- Instrucciones de uso:
-- 1. Asegúrate de que la propietaria ("narbosspa@gmail.com") ya haya hecho clic en 
--    "Acceder con Google" al menos una vez en el CRM para que exista en "auth.users".
-- 2. Copia todo este código.
-- 3. Ve al SQL Editor de tu proyecto "Fidelizacion Narbo's Pro" en Supabase.
-- 4. Pega el código y presiona "RUN".
-- ==============================================================================

DO $$
DECLARE
    nuevo_owner_id UUID;
    narbo_tenant_id UUID;
BEGIN
    -- 1. Buscamos el ID interno que Supabase le asignó a su cuenta de Gmail
    SELECT id INTO nuevo_owner_id FROM auth.users WHERE email = 'narbosspa@gmail.com';
    
    -- Validamos si de verdad ya intentó entrar al sistema
    IF nuevo_owner_id IS NULL THEN
        RAISE EXCEPTION 'Error: narbosspa@gmail.com aún no ha intentado iniciar sesión. Pídele que haga click en "Acceder con Google" primero.';
    END IF;

    -- 2. Buscamos el Tenant ID de Narbo's (Asumiendo que es la instancia 1.0)
    SELECT id INTO narbo_tenant_id FROM public.tenant_config LIMIT 1;

    -- 3. Insertamos o actualizamos su acceso como dueña de ese Tenant
    INSERT INTO public.user_roles (user_id, role, tenant_id)
    VALUES (nuevo_owner_id, 'owner', narbo_tenant_id)
    ON CONFLICT (user_id) DO UPDATE 
    SET role = 'owner', tenant_id = EXCLUDED.tenant_id;
    
    RAISE NOTICE '¡Éxito! narbosspa@gmail.com ahora es OWNER total del sistema.';
END $$;
