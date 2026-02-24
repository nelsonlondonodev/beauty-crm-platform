import DashboardHeader from '../components/layout/DashboardHeader';
import { Printer } from 'lucide-react';
import BillingClientSearch from '../components/billing/BillingClientSearch';
import BillingItemTable from '../components/billing/BillingItemTable';
import BillingCheckoutSummary from '../components/billing/BillingCheckoutSummary';
import { useBilling } from '../hooks/useBilling';

const Billing = () => {
  const {
    clientsLoading,
    staff,
    filteredClients,
    searchTerm,
    setSearchTerm,
    selectedClient,
    handleSelectClient,
    isSearching,
    setIsSearching,
    items,
    newItem,
    setNewItem,
    handleAddItem,
    removeItem,
    subtotal,
    discount,
    setDiscount,
    total,
    isProcessing,
    handleCheckout
  } = useBilling();

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
                loading={clientsLoading}
                filteredClients={filteredClients}
                selectedClient={selectedClient}
                onSelectClient={handleSelectClient}
              />

              <BillingItemTable
                items={items}
                empleados={staff}
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
                onCheckout={handleCheckout}
                isProcessing={isProcessing}
              />
          </div>
      </div>
    </div>
  );
};

export default Billing;
