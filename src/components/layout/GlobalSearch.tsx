import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useClients } from '../../hooks/useClients';
import { cn } from '../../lib/utils';

const GlobalSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { clients, loading } = useClients();
  const navigate = useNavigate();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Open dropdown when typing — use derived state with manual close
  const shouldBeOpen = searchTerm.trim().length > 0;
  const isDropdownOpen = isOpen && shouldBeOpen;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.trim().length > 0) {
      setIsOpen(true);
    }
  };

  const filteredClients = React.useMemo(() => {
    if (!searchTerm.trim()) return [];
    const lowerSearch = searchTerm.toLowerCase();

    return clients
      .filter(
        (client) =>
          client.nombre.toLowerCase().includes(lowerSearch) ||
          (client.telefono && client.telefono.includes(lowerSearch)) ||
          (client.email && client.email.toLowerCase().includes(lowerSearch))
      )
      .slice(0, 5); // Render max 5 results for performance and clean UI
  }, [clients, searchTerm]);

  const handleResultClick = (clientName: string) => {
    setIsOpen(false);
    setSearchTerm('');
    navigate(`/clients?search=${encodeURIComponent(clientName)}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'bg-green-100 text-green-800';
      case 'alerta_5_meses':
        return 'bg-yellow-100 text-yellow-800';
      case 'vencido':
        return 'bg-red-100 text-red-800';
      case 'reclamado':
        return 'bg-blue-100 text-blue-800';
      case 'sin_bono':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'Bono Activo';
      case 'alerta_5_meses':
        return 'Bono por Vencer';
      case 'vencido':
        return 'Inactivo / Vencido';
      case 'reclamado':
        return 'Bono Canjeado';
      case 'sin_bono':
        return 'Sin bono';
      default:
        return 'No definido';
    }
  };

  return (
    <div className="relative hidden md:block" ref={searchContainerRef}>
      <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-500" />
      <input
        type="search"
        placeholder="Buscar cliente, tel, email..."
        value={searchTerm}
        onChange={(e) => handleSearchChange(e.target.value)}
        onFocus={() => {
          if (searchTerm.trim()) setIsOpen(true);
        }}
        className="focus-visible:ring-primary h-9 w-64 rounded-md border border-gray-200 bg-gray-50 pr-4 pl-9 transition-all focus-visible:ring-1 focus-visible:outline-none sm:text-sm lg:w-80"
      />

      {/* Dropdown Results */}
      {isDropdownOpen && (
        <div className="animate-in fade-in slide-in-from-top-2 absolute top-full left-0 z-50 mt-2 w-full max-w-md overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl duration-200">
          <div className="p-2">
            {loading ? (
              <div className="flex items-center justify-center space-x-2 py-4 text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Buscando...</span>
              </div>
            ) : filteredClients.length > 0 ? (
              <ul className="space-y-1">
                {filteredClients.map((client) => (
                  <li key={client.id}>
                    <button
                      onClick={() => handleResultClick(client.nombre)}
                      className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-gray-50"
                    >
                      <div className="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {client.nombre}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {client.telefono ||
                            client.email ||
                            'Sin datos de contacto'}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span
                          className={cn(
                            'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium',
                            getStatusColor(client.bono_estado)
                          )}
                        >
                          {formatStatus(client.bono_estado)}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm font-medium text-gray-500">
                  No se encontraron resultados
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Verifica el nombre o número tel.
                </p>
              </div>
            )}
          </div>
          {filteredClients.length > 0 && (
            <div className="border-t border-gray-100 bg-gray-50/50 p-2">
              <button
                onClick={() => navigate('/clients')}
                className="text-primary w-full p-1 text-center text-xs font-medium hover:underline"
              >
                Ver todos los clientes
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
