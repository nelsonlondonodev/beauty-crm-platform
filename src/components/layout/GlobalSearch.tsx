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
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Open dropdown when typing
  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [searchTerm]);

  const filteredClients = React.useMemo(() => {
    if (!searchTerm.trim()) return [];
    const lowerSearch = searchTerm.toLowerCase();
    
    return clients.filter(client => 
      client.nombre.toLowerCase().includes(lowerSearch) || 
      (client.telefono && client.telefono.includes(lowerSearch)) ||
      (client.email && client.email.toLowerCase().includes(lowerSearch))
    ).slice(0, 5); // Render max 5 results for performance and clean UI
  }, [clients, searchTerm]);

  const handleResultClick = () => {
    setIsOpen(false);
    setSearchTerm('');
    // Ideally we would go to a specific client profile page, e.g., /clientes/id
    // But since the current behavior is a general list in /clients, we navigate there.
    // If you plan to add a detailed client page later, this is the perfect spot.
    navigate('/clients');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente': return 'bg-green-100 text-green-800';
      case 'alerta_5_meses': return 'bg-yellow-100 text-yellow-800';
      case 'vencido': return 'bg-red-100 text-red-800';
      case 'reclamado': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'pendiente': return 'Bono Activo';
      case 'alerta_5_meses': return 'Bono por Vencer';
      case 'vencido': return 'Inactivo / Vencido';
      case 'reclamado': return 'Bono Canjeado';
      default: return 'No definido';
    }
  };

  return (
    <div className="relative hidden md:block" ref={searchContainerRef}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
      <input
        type="search"
        placeholder="Buscar cliente, tel, email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => { if (searchTerm.trim()) setIsOpen(true); }}
        className="h-9 w-64 lg:w-80 rounded-md border border-gray-200 bg-gray-50 pl-9 pr-4 sm:text-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:outline-none transition-all"
      />

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2">
            {loading ? (
              <div className="flex items-center justify-center py-4 space-x-2 text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Buscando...</span>
              </div>
            ) : filteredClients.length > 0 ? (
              <ul className="space-y-1">
                {filteredClients.map((client) => (
                  <li key={client.id}>
                    <button
                      onClick={() => handleResultClick()}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {client.nombre}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {client.telefono || client.email || 'Sin datos de contacto'}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                         <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", getStatusColor(client.bono_estado))}>
                            {formatStatus(client.bono_estado)}
                          </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-gray-500 font-medium">No se encontraron resultados</p>
                <p className="text-xs text-gray-400 mt-1">Verifica el nombre o número tel.</p>
              </div>
            )}
          </div>
          {filteredClients.length > 0 && (
             <div className="border-t border-gray-100 p-2 bg-gray-50/50">
               <button 
                 onClick={() => navigate('/clients')}
                 className="w-full text-center text-xs text-primary font-medium p-1 hover:underline"
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
