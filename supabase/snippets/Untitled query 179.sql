-- 1. Creamos la configuración del salón vinculado a tu ID
INSERT INTO public.tenant_config (user_id, brand_name, tagline)
VALUES ('feb7b59f-bb63-4165-acac-4b6290149dba', 'Londy Local Dev', 'Salón de Prueba');

-- 2. Te asignamos el rol de admin vinculado a ese mismo salón
INSERT INTO public.user_roles (user_id, role, tenant_id)
VALUES ('feb7b59f-bb63-4165-acac-4b6290149dba', 'admin', 'feb7b59f-bb63-4165-acac-4b6290149dba');
