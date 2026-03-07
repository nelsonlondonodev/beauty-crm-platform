import { useState, useMemo, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Client } from '../types';
import { procesarFactura } from '../services/billingService';
import { validateBonoCode } from '../services/bonoService';
import { useClients } from './useClients';
import { useStaff } from './useStaff';
import { useTenant } from '../contexts/TenantContext';
import { billingFormSchema, type BillingFormValues } from '../schemas/billingSchema';
import type { InvoiceReceiptData } from '../components/billing/BillingReceiptModal';

export const useBilling = () => {
  const { clients, loading: clientsLoading } = useClients();
  const { staff } = useStaff();
  const { config } = useTenant();

  // Search & Navigation State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState<InvoiceReceiptData | null>(null);

  // Zod & React Hook Form Initialization
  const form = useForm<BillingFormValues>({
    resolver: zodResolver(billingFormSchema),
    defaultValues: {
      cliente_id: '',
      metodo_pago: 'efectivo',
      bono_id: '',
      items: [],
      descuento_manual: 0,
    },
  });

  // Items Field Array management
  const { fields: items, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Watch form values for calculations
  const watchedItems = form.watch('items') || [];
  const discount = form.watch('descuento_manual') || 0;

  // New Item Draft State (before adding to the actual array)
  const [newItem, setNewItem] = useState({
    description: '',
    quantity: 1,
    price: '',
    empleado_id: '',
  });

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
    return watchedItems.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
  }, [watchedItems]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount);
  }, [subtotal, discount]);

  // Automatic discount calculator based on Bonus type
  useEffect(() => {
    if (appliedBonus) {
      let percentage = 0;
      const tipoLower = appliedBonus.tipo.toLowerCase();
      if (tipoLower.includes('cumpleaños')) {
        percentage = 15;
      } else if (tipoLower.includes('bienvenida')) {
        percentage = 10;
      }

      if (percentage > 0) {
        const calculatedDiscount = (subtotal * percentage) / 100;
        form.setValue('descuento_manual', calculatedDiscount);
      }
    } else {
      // Si se remueve el bono, se reinicia el descuento
      form.setValue('descuento_manual', 0);
    }
  }, [appliedBonus, subtotal, form]);

  // Handlers
  const handleSelectClient = (client: Client | null) => {
    setSelectedClient(client);
    form.setValue('cliente_id', client ? client.id : '');
  };

  const handleAddItem = () => {
    if (!newItem.description || !newItem.price) return;
    
    appendItem({
      id: Math.random().toString(36).substr(2, 9),
      description: newItem.description,
      quantity: Number(newItem.quantity),
      price: Number(newItem.price),
      empleado_id: newItem.empleado_id || '',
    });
    
    setNewItem({ description: '', quantity: 1, price: '', empleado_id: '' });
  };

  const handleApplyClientBonus = (bonoId: string, tipo: string, codigo?: string) => {
    setAppliedBonus({ id: bonoId, tipo, codigo });
    form.setValue('bono_id', bonoId);
  };

  const resetFormulario = () => {
    form.reset({
      cliente_id: selectedClient?.id || '',
      metodo_pago: 'efectivo',
      bono_id: '',
      items: [],
      descuento_manual: 0,
    });
    setNewItem({ description: '', quantity: 1, price: '', empleado_id: '' });
    setSelectedClient(null);
    setCouponCode('');
    setAppliedBonus(null);
  };

  // Submit Handler
  const onSubmit = async (data: BillingFormValues) => {
    setIsProcessing(true);
    try {
      const response = await procesarFactura({
        cliente_id: selectedClient?.id || null, // Priority to selectedClient to ensure sync
        subtotal,
        descuento: data.descuento_manual,
        total,
        items: data.items.map(item => ({
          ...item,
          id: item.id || Math.random().toString(36).substr(2, 9),
          empleado_id: item.empleado_id || undefined,
        })),
        bono_id: appliedBonus?.id || undefined,
        commissionPolicy: config.commissionPolicy,
      });

      // Show receipt modal
      setCompletedInvoice({
        id: response.factura_id,
        fecha: new Date().toISOString(),
        cliente: selectedClient ? { nombre: selectedClient.nombre, telefono: selectedClient.telefono } : null,
        metodo_pago: data.metodo_pago,
        items: data.items.map(i => ({ description: i.description, quantity: Number(i.quantity), price: Number(i.price) })),
        subtotal,
        descuento: data.descuento_manual,
        total
      });

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
      const bono = await validateBonoCode(code);
      handleApplyClientBonus(bono.id, bono.tipo, bono.codigo);

      // Select client if implicit
      if (!selectedClient && bono.client_id) {
        const foundClient = clients.find((c) => c.id === bono.client_id);
        if (foundClient) handleSelectClient(foundClient);
      }

      alert(`Cupón de ${bono.tipo} validado y aplicado.`);
      setCouponCode('');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error al validar cupón.';
      alert(message);
    } finally {
      setValidatingCoupon(false);
    }
  };

  return {
    form, // The main React Hook Form object
    onSubmit: form.handleSubmit(onSubmit),
    
    // Data
    clientsLoading,
    staff,
    filteredClients,
    
    // UI selections
    searchTerm,
    setSearchTerm,
    selectedClient,
    handleSelectClient,
    isSearching,
    setIsSearching,

    // Array logic
    items,
    newItem,
    setNewItem,
    handleAddItem,
    removeItem,

    // Math
    subtotal,
    discount,
    total,

    // Coupons
    couponCode,
    setCouponCode,
    validatingCoupon,
    appliedBonus,
    setAppliedBonus,
    handleValidateCoupon,
    handleApplyClientBonus,

    // State
    isProcessing,
    completedInvoice,
    setCompletedInvoice,
    resetFormulario,
  };
};
