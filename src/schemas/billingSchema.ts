import { z } from 'zod';

// Esquema para un ítem individual de la factura (un servicio o producto)
export const invoiceItemSchema = z.object({
  id: z.string().optional(), // El ID puede ser generado temporalmente en el frontend
  description: z.string().min(2, 'La descripción debe tener al menos 2 caracteres'),
  quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1'),
  price: z.number().min(0, 'El precio no puede ser negativo'),
  empleado_id: z.string().uuid('ID de empleado inválido').optional().or(z.literal('')), 
  // Opcional o string vacío para permitir items "generales" sin comisión
});

// Tipos inferidos de Zod para TypeScript
export type InvoiceItemFormValues = z.infer<typeof invoiceItemSchema>;

// Esquema principal para el formulario de la factura
export const billingFormSchema = z.object({
  cliente_id: z.string().uuid('El cliente debe ser válido').optional().or(z.literal('')),
  metodo_pago: z.string().min(1, 'Selecciona un método de pago'),
  bono_id: z.string().uuid().optional().or(z.literal('')), // Si aplican un bono de fidelización
  items: z.array(invoiceItemSchema).min(1, 'La factura debe tener al menos un ítem'),
  descuento_manual: z.number().min(0, 'El descuento manual no puede ser negativo'),
  appointment_id: z.string().uuid('ID de cita inválido').optional().or(z.literal('')), // Vínculo futuro con la agenda
});

export type BillingFormValues = z.infer<typeof billingFormSchema>;
