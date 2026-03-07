-- Migración para añadir políticas de facturación a la configuración del tenant
ALTER TABLE tenant_config 
ADD COLUMN IF NOT EXISTS commission_policy TEXT DEFAULT 'gross' 
CHECK (commission_policy IN ('gross', 'net'));

-- Comentario para documentación
COMMENT ON COLUMN tenant_config.commission_policy IS 'Define si las comisiones se calculan sobre el total bruto o sobre el neto después de descuentos.';
