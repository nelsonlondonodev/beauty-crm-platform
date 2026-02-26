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
  onSelectClient,
}: BillingClientSearchProps) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
        <Search className="text-primary mr-2 h-5 w-5" />
        Buscar Cliente
      </h2>

      {!selectedClient ? (
        <div className="relative">
          <div className="relative">
            <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Nombre o Teléfono..."
              className="focus:ring-primary/20 focus:border-primary w-full rounded-lg border border-gray-300 py-2.5 pr-4 pl-9 transition-all outline-none focus:ring-2"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsSearching(e.target.value.length > 0);
              }}
            />
          </div>

          {/* Dropdown Results */}
          {isSearching && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
              {loading && (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              )}
              {!loading && filteredClients.length === 0 && (
                <div className="p-3 text-sm text-gray-500">
                  No se encontraron clientes.
                </div>
              )}
              {!loading &&
                filteredClients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => {
                      onSelectClient(client);
                      setSearchTerm('');
                      setIsSearching(false);
                    }}
                    className="flex cursor-pointer items-center justify-between border-b border-gray-50 p-3 last:border-0 hover:bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {client.nombre}
                      </p>
                      <p className="text-xs text-gray-500">{client.telefono}</p>
                    </div>
                    {client.bono_estado === 'pendiente' && (
                      <span className="bg-primary/10 text-primary rounded-full px-2 py-1 text-[10px] font-bold tracking-wider uppercase">
                        Tiene Bono Activo
                      </span>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Cliente Seleccionado:
            </p>
            <p className="text-primary text-lg font-bold">
              {selectedClient.nombre}
            </p>
            <p className="text-xs text-gray-500">
              {selectedClient.email} • {selectedClient.telefono}
            </p>
          </div>
          <button
            onClick={() => onSelectClient(null)}
            className="text-sm text-gray-500 underline transition-colors hover:text-red-600"
          >
            Cambiar
          </button>
        </div>
      )}
    </div>
  );
};

export default BillingClientSearch;
