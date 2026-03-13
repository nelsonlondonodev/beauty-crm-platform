-- ==============================================================================
-- PARCHE DE SEGURIDAD: ENDURECIMIENTO DE FUNCIONES (SEARCH PATH)
-- Objetivo: Resolver las advertencias "Function Search Path Mutable" de Supabase.
-- Aplicar SET search_path = public asegura que las funciones siempre usen
-- los esquemas correctos y sean resistentes a ataques de inyección.
-- ==============================================================================

-- 1. Asegurar la función is_superadmin()
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'superadmin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Asegurar la función get_my_tenant_id()
CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.user_roles WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- NOTA SOBRE "Leaked Password Protection Disabled":
-- Esta advertencia se resuelve en la interfaz de Supabase:
-- Ve a Authentication > Settings > Auth Metadata y activa "Leaked password protection".
-- No se puede activar mediante SQL directo en esquemas públicos.
