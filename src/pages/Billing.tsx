import DashboardHeader from '../components/layout/DashboardHeader';
import BillingClientSearch from '../components/billing/BillingClientSearch';
import BillingItemTable from '../components/billing/BillingItemTable';
import BillingCheckoutSummary from '../components/billing/BillingCheckoutSummary';
import BillingReceiptModal from '../components/billing/BillingReceiptModal';
import { useBilling } from '../hooks/useBilling';

const Billing = () => {
  const {
    form,
    onSubmit,
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
    completedInvoice,
    setCompletedInvoice,
    resetFormulario,
  } = useBilling();

  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-20">
      <DashboardHeader
        title="Facturación (Punto de Venta)"
        subtitle="Crea facturas, registra servicios y aplica los bonos de tus clientes."
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
            form={form}
            selectedClient={selectedClient}
            items={items}
            subtotal={subtotal}
            total={total}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            validatingCoupon={validatingCoupon}
            appliedBonus={appliedBonus}
            setAppliedBonus={setAppliedBonus}
            handleValidateCoupon={handleValidateCoupon}
            handleApplyClientBonus={handleApplyClientBonus}
            isProcessing={isProcessing}
          />
        </div>
      </div>

      {/* Modal de Ticket de Compra (Se muestra tras el cobro) */}
      {completedInvoice && (
        <BillingReceiptModal
          invoice={completedInvoice}
          onClose={() => {
            setCompletedInvoice(null);
            resetFormulario();
          }}
        />
      )}
    </form>
  );
};

export default Billing;
