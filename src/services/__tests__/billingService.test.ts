import { describe, it, expect, vi, beforeEach } from 'vitest';
import { procesarFactura, getFacturas } from '../billingService';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn()
      }))
    })),
    rpc: vi.fn()
  }
}));

vi.mock('../../lib/utils', () => ({
  fetchWithTimeout: vi.fn((promise) => promise)
}));

describe('billingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('procesarFactura', () => {
    it('should call the RPC function with correct payload', async () => {
      const payload = {
        cliente_id: 'cl-123',
        subtotal: 100,
        descuento: 10,
        total: 90,
        metodo_pago: 'Efectivo',
        items: [{
          id: 'item-1',
          description: 'Corte',
          quantity: 1,
          price: 100,
          empleado_id: 'emp-1',
          commission_rate: 0
        }]
      };

      const mockResponse = { data: { success: true, factura_id: 'f-456' }, error: null };
      (supabase.rpc as any).mockResolvedValue(mockResponse);

      const result = await procesarFactura(payload);

      expect(supabase.rpc).toHaveBeenCalledWith('procesar_factura_completa', {
        p_cliente_id: 'cl-123',
        p_subtotal: 100,
        p_descuento: 10,
        p_total: 90,
        p_metodo_pago: 'Efectivo',
        p_items: [{
          description: 'Corte',
          quantity: 1,
          price: 100,
          empleado_id: 'emp-1'
        }],
        p_bono_id: null
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.success).toBe(true);
      }
    });

    it('should handle RPC error', async () => {
      (supabase.rpc as any).mockResolvedValue({ data: null, error: { message: 'Database error' } });
      const payload = { items: [], subtotal: 0, descuento: 0, total: 0 } as any;
      const result = await procesarFactura(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Database error');
      }
    });
  });

  describe('getFacturas', () => {
    it('should return a list of invoices', async () => {
      const mockFacturas = [{ id: '1', total: 100 }];
      const mockOrder = vi.fn().mockResolvedValue({ data: mockFacturas, error: null });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      const result = await getFacturas();
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].total).toBe(100);
      }
    });
  });
});
