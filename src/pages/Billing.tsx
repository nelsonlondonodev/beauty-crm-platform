import { useState } from 'react';
import DashboardHeader from '../components/layout/DashboardHeader';
import { useClients } from '../hooks/useClients';
import { Printer } from 'lucide-react';
import type { Client, InvoiceItem } from '../types';
import BillingClientSearch from '../components/billing/BillingClientSearch';
import BillingItemTable from '../components/billing/BillingItemTable';
import BillingCheckoutSummary from '../components/billing/BillingCheckoutSummary';

const Billing = () => {
  const { clients, loading } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Invoice State
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [newItem, setNewItem] = useState({ description: '', quantity: 1, price: '' });
  const [discount, setDiscount] = useState<number>(0);

  // Client Search Logic
  const filteredClients = clients.filter(client => 
      client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (client.telefono && client.telefono.includes(searchTerm))
  ).slice(0, 5); // Max 5 results

  const handleSelectClient = (client: Client | null) => {
      setSelectedClient(client);
  };

  const handleAddItem = () => {
      if (!newItem.description || !newItem.price) return;
      
      setItems([...items, {
          id: Math.random().toString(36).substr(2, 9),
          description: newItem.description,
          quantity: Number(newItem.quantity),
          price: Number(newItem.price)
      }]);
      setNewItem({ description: '', quantity: 1, price: '' });
  };

  const removeItem = (id: string) => {
      setItems(items.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = Math.max(0, subtotal - discount);

  return (
    <div className="space-y-6 pb-20">
      <DashboardHeader 
        title="Facturación (Punto de Venta)" 
        subtitle="Crea facturas, registra servicios y aplica los bonos de tus clientes."
        actions={
          <button 
            onClick={() => window.print()}
            className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 transition-colors"
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimir Recibo
          </button>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column: Form & Items */}
          <div className="xl:col-span-2 space-y-6">
              <BillingClientSearch
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                isSearching={isSearching}
                setIsSearching={setIsSearching}
                loading={loading}
                filteredClients={filteredClients}
                selectedClient={selectedClient}
                onSelectClient={handleSelectClient}
              />

              <BillingItemTable
                items={items}
                newItem={newItem}
                setNewItem={setNewItem}
                onAddItem={handleAddItem}
                onRemoveItem={removeItem}
              />
          </div>

          {/* Right Column: Checkout Summary */}
          <div className="xl:col-span-1 space-y-6">
              <BillingCheckoutSummary
                selectedClient={selectedClient}
                items={items}
                subtotal={subtotal}
                discount={discount}
                setDiscount={setDiscount}
                total={total}
              />
          </div>
      </div>
    </div>
  );
};

export default Billing;
