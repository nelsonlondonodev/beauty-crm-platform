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
  } = useBilling();

  return (
    <div className="space-y-6 pb-20">
      <DashboardHeader
        title="Facturación (Punto de Venta)"
        subtitle="Crea facturas, registra servicios y aplica los bonos de tus clientes."
        actions={
          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800"
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimir Recibo
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left Column: Form & Items */}
        <div className="space-y-6 xl:col-span-2">
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
        <div className="space-y-6 xl:col-span-1">
          <BillingCheckoutSummary
            selectedClient={selectedClient}
            items={items}
            subtotal={subtotal}
            discount={discount}
            setDiscount={setDiscount}
            total={total}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            validatingCoupon={validatingCoupon}
            appliedBonus={appliedBonus}
            setAppliedBonus={setAppliedBonus}
            handleValidateCoupon={handleValidateCoupon}
            handleApplyClientBonus={handleApplyClientBonus}
            onCheckout={handleCheckout}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  );
};

export default Billing;
