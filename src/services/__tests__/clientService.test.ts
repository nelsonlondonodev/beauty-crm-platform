import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getClientById } from '../clientService';
import { supabase } from '../../lib/supabase';

// Mocking dependencies
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}));

vi.mock('../../lib/utils', () => ({
  fetchWithTimeout: vi.fn((promise) => promise)
}));

describe('clientService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getClientById', () => {
    it('should fetch and map a client successfully', async () => {
      const mockDbRow = {
        id: '123',
        nombre: 'Nelson Test',
        email: 'nelson@test.com',
        whatsapp: '573001234567',
        birthday: '1990-01-01',
        notas: 'Test notes',
        bonos: [
          {
            id: 'b1',
            tipo: 'Bienvenida',
            estado: 'Pendiente',
            created_at: new Date().toISOString(),
          }
        ]
      };

      // Configuration of the mock chain
      const mockSingle = vi.fn().mockResolvedValue({ data: mockDbRow, error: null });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      const client = await getClientById('123');

      expect(supabase.from).toHaveBeenCalledWith('clientes_fidelizacion');
      expect(client.nombre).toBe('Nelson Test');
      expect(client.id).toBe('123');
      expect(client.bono_estado).toBe('pendiente');
    });

    it('should throw an error if client is not found', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      await expect(getClientById('non-existent')).rejects.toThrow('Not found');
    });
  });
});
