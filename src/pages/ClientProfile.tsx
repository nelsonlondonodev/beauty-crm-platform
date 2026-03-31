import { useParams, useNavigate } from 'react-router-dom';
import { useClientProfile } from '../hooks/useClientProfile';
import ProfileHeader from '../components/clients/profile/ProfileHeader';
import ClientInfoCard from '../components/clients/profile/ClientInfoCard';
import ProfileNotes from '../components/clients/profile/ProfileNotes';
import ProfileKPIs from '../components/clients/profile/ProfileKPIs';
import ProfileLoyaltyStatus from '../components/clients/profile/ProfileLoyaltyStatus';
import ProfileFinancialHistory from '../components/clients/profile/ProfileFinancialHistory';

const ClientProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { client, invoices, loading, isSavingNotes, saveNotes } = useClientProfile(id);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-primary h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-gray-500">
        <p>Cliente no encontrado.</p>
        <button onClick={() => navigate('/clients')} className="text-primary underline">
          Volver a Clientes
        </button>
      </div>
    );
  }

  // Cálculos derivados
  const totalSpent = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
  const totalVisits = invoices.length;

  const allServices: string[] = invoices.flatMap(inv => 
    inv.factura_items?.map(item => item.descripcion) ?? []
  );
  
  const serviceCounts = allServices.reduce((acc: Record<string, number>, s: string) => {
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const topServices = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-20">
      <ProfileHeader clientName={client.nombre} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Columna Izquierda: Info & Notas */}
        <div className="space-y-6 lg:col-span-1">
          <ClientInfoCard client={client} />
          <ProfileNotes 
            initialNotes={client.notas || ''} 
            onSave={saveNotes} 
            isSaving={isSavingNotes} 
          />
        </div>

        {/* Columna Derecha: KPIs, Servicios & Historial */}
        <div className="space-y-6 lg:col-span-2">
          <ProfileKPIs totalSpent={totalSpent} totalVisits={totalVisits} />
          <ProfileLoyaltyStatus client={client} topServices={topServices} />
          <ProfileFinancialHistory invoices={invoices} />
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
