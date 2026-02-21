import { Search, Loader2 } from 'lucide-react';
import type { Client } from '../../types';

interface BillingClientSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
  loading: boolean;
  filteredClients: Client[];
  selectedClient: Client | null;
  onSelectClient: (client: Client | null) => void;
}

const BillingClientSearch = ({
  searchTerm,
  setSearchTerm,
  isSearching,
  setIsSearching,
  loading,
  filteredClients,
  selectedClient,
  onSelectClient
}: BillingClientSearchProps) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Search className="h-5 w-5 mr-2 text-primary" />
        Buscar Cliente
      </h2>
      
      {!selectedClient ? (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Nombre o Teléfono..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsSearching(e.target.value.length > 0);
              }}
            />
          </div>
          
          {/* Dropdown Results */}
          {isSearching && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              {loading && <div className="p-4 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>}
              {!loading && filteredClients.length === 0 && (
                <div className="p-3 text-sm text-gray-500">No se encontraron clientes.</div>
              )}
              {!loading && filteredClients.map(client => (
                <div 
                  key={client.id}
                  onClick={() => {
                    onSelectClient(client);
                    setSearchTerm('');
                    setIsSearching(false);
                  }}
                  className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{client.nombre}</p>
                    <p className="text-xs text-gray-500">{client.telefono}</p>
                  </div>
                  {client.bono_estado === 'pendiente' && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded-full">
                      Tiene Bono Activo
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <div>
            <p className="text-sm font-semibold text-gray-900">Cliente Seleccionado:</p>
            <p className="text-lg text-primary font-bold">{selectedClient.nombre}</p>
            <p className="text-xs text-gray-500">{selectedClient.email} • {selectedClient.telefono}</p>
          </div>
          <button 
            onClick={() => onSelectClient(null)}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors underline"
          >
             Cambiar
          </button>
        </div>
      )}
    </div>
  );
};

export default BillingClientSearch;
