import { useState, useMemo } from 'react';
import type { Client, InvoiceItem } from '../types';
import { procesarFactura } from '../services/billingService';
import { useClients } from './useClients';
import { useStaff } from './useStaff';
import { supabase } from '../lib/supabase';

export const useBilling = () => {
  const { clients, loading: clientsLoading } = useClients();
  const { staff } = useStaff();

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Invoice Form State
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [newItem, setNewItem] = useState({
    description: '',
    quantity: 1,
    price: '',
    empleado_id: '',
  });
  const [discount, setDiscount] = useState<number>(0);

  // Bonos State
  const [couponCode, setCouponCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedBonus, setAppliedBonus] = useState<{ id: string; codigo?: string; tipo: string } | null>(null);

  // Derived Logic
  const filteredClients = useMemo(() => {
    return clients
      .filter(
        (client) =>
          client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (client.telefono && client.telefono.includes(searchTerm))
      )
      .slice(0, 5); // Max 5 results
  }, [clients, searchTerm]);

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount);
  }, [subtotal, discount]);

  // Handlers
  const handleSelectClient = (client: Client | null) => {
    setSelectedClient(client);
  };

  const handleAddItem = () => {
    if (!newItem.description || !newItem.price) return;

    setItems([
      ...items,
      {
        id: Math.random().toString(36).substr(2, 9),
        description: newItem.description,
        quantity: Number(newItem.quantity),
        price: Number(newItem.price),
        empleado_id: newItem.empleado_id || undefined,
      },
    ]);
    setNewItem({ description: '', quantity: 1, price: '', empleado_id: '' });
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    try {
      await procesarFactura({
        cliente_id: selectedClient?.id,
        subtotal,
        descuento: discount,
        total,
        items,
        bono_id: appliedBonus?.id,
      });

      alert('¡Factura guardada con éxito!');
      resetForm();
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(`Error al procesar el cobro: ${error.message}`);
      } else {
        alert('Ha ocurrido un error inesperado al procesar el cobro.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleValidateCoupon = async (code: string) => {
    if (!code) return;
    setValidatingCoupon(true);
    try {
      const { data, error } = await supabase
        .from('bonos')
        .select(`
          id, codigo, tipo, estado,
          client_id
        `)
        .eq('codigo', code)
        .single();
      
      if (error || !data) throw new Error('Cupón no encontrado o código incorrecto.');
      if (data.estado !== 'Pendiente') throw new Error(`El cupón no puede ser canjeado. Estado: ${data.estado}`);
      
      setAppliedBonus({
        id: data.id,
        codigo: data.codigo,
        tipo: data.tipo,
      });

      // Si no hay cliente seleccionado, autoseleccionarlo guiado por el owner del bono
      if (!selectedClient && data.client_id) {
        const foundClient = clients.find(c => c.id === data.client_id);
        if (foundClient) setSelectedClient(foundClient);
      }
      
      alert(`Cupón de ${data.tipo} listo para aplicar.`);
      setCouponCode('');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleApplyClientBonus = (bonoId: string, tipo: string, codigo?: string) => {
    setAppliedBonus({ id: bonoId, tipo, codigo });
  };

  const resetForm = () => {
    setItems([]);
    setDiscount(0);
    setSelectedClient(null);
    setCouponCode('');
    setAppliedBonus(null);
  };

  return {
    // Data & Loading State
    clientsLoading,
    staff,
    filteredClients,

    // Form & Selections
    searchTerm,
    setSearchTerm,
    selectedClient,
    handleSelectClient,
    isSearching,
    setIsSearching,

    // Cart Logic
    items,
    newItem,
    setNewItem,
    handleAddItem,
    removeItem,
    subtotal,
    discount,
    setDiscount,
    total,

    // Coupons
    couponCode,
    setCouponCode,
    validatingCoupon,
    appliedBonus,
    setAppliedBonus,
    handleValidateCoupon,
    handleApplyClientBonus,

    // Submission
    isProcessing,
    handleCheckout,
  };
};
