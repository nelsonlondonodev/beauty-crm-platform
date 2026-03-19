-- ==============================================================================
-- SCRIPT DE RECUPERACIÓN: RESTAURACIÓN DE user_roles Y RLS
-- Fecha: 2026-03-19
-- Estado: EJECUTADO CON ÉXITO ✅
--
-- Problema: Gemini Flash eliminó registros de user_roles y deshabilitó RLS
--           en user_roles y tenant_config, causando timeouts generalizados.
--
-- Lecciones aprendidas:
--   1. user_roles.tenant_id tiene FK hacia tenant_config(user_id),
--      por lo que el tenant_config debe existir ANTES de insertar roles.
--   2. Los UUIDs deben copiarse directamente de auth.users, nunca de capturas.
-- ==============================================================================

-- FASE 1: Crear tenant_config del Owner (DEBE ejecutarse ANTES de user_roles)
INSERT INTO public.tenant_config (user_id, brand_name, tagline, commission_policy, updated_at)
VALUES (
    'dda1a738-a9cf-4a70-8343-bce886cf1fa2',  -- Owner (nelsonlo2682@gmail.com)
    'Narbo''s Salón Spa',
    'Tu salón de confianza',
    'gross',
    NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- FASE 2: Restaurar roles (UUIDs verificados desde auth.users)
INSERT INTO public.user_roles (user_id, role, tenant_id)
VALUES ('7de4c9ac-6897-4f0f-9989-e38ed9629bdc', 'superadmin', '7de4c9ac-6897-4f0f-9989-e38ed9629bdc')
ON CONFLICT (user_id) DO UPDATE SET role = 'superadmin', tenant_id = '7de4c9ac-6897-4f0f-9989-e38ed9629bdc';

INSERT INTO public.user_roles (user_id, role, tenant_id)
VALUES ('dda1a738-a9cf-4a70-8343-bce886cf1fa2', 'owner', 'dda1a738-a9cf-4a70-8343-bce886cf1fa2')
ON CONFLICT (user_id) DO UPDATE SET role = 'owner', tenant_id = 'dda1a738-a9cf-4a70-8343-bce886cf1fa2';

INSERT INTO public.user_roles (user_id, role, tenant_id)
VALUES ('8600441e-b7dd-4114-a59e-5ae37e774ddc', 'admin', 'dda1a738-a9cf-4a70-8343-bce886cf1fa2')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin', tenant_id = 'dda1a738-a9cf-4a70-8343-bce886cf1fa2';

INSERT INTO public.user_roles (user_id, role, tenant_id)
VALUES ('a703d5de-ef7a-4706-9c1b-edd8728e2d66', 'staff', 'dda1a738-a9cf-4a70-8343-bce886cf1fa2')
ON CONFLICT (user_id) DO UPDATE SET role = 'staff', tenant_id = 'dda1a738-a9cf-4a70-8343-bce886cf1fa2';

-- FASE 3: Habilitar RLS y restaurar políticas
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios pueden ver su propio rol" ON public.user_roles;
CREATE POLICY "Usuarios pueden ver su propio rol" ON public.user_roles
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "Tenant config access" ON public.tenant_config;
CREATE POLICY "Tenant config access" ON public.tenant_config
    FOR ALL TO authenticated
    USING (public.is_superadmin() OR user_id = public.get_my_tenant_id())
    WITH CHECK (public.is_superadmin() OR user_id = public.get_my_tenant_id());

-- FASE 4: Limpieza
DELETE FROM public.tenant_config WHERE user_id = '6b3f18e2-139b-483e-b9e9-f429d2cf9302';
DELETE FROM auth.users WHERE id = '6b3f18e2-139b-483e-b9e9-f429d2cf9302';
