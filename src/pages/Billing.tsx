import { useState } from 'react';
import DashboardHeader from '../components/layout/DashboardHeader';
import { useClients } from '../hooks/useClients';
import { Trash2, Receipt, Search, Printer, DollarSign } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Client } from '../types';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

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

  const handleSelectClient = (client: Client) => {
      setSelectedClient(client);
      setSearchTerm('');
      setIsSearching(false);
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
                
              {/* Client Selection */}
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
                                  {loading && <div className="p-3 text-sm text-gray-500">Buscando...</div>}
                                  {!loading && filteredClients.length === 0 && (
                                      <div className="p-3 text-sm text-gray-500">No se encontraron clientes.</div>
                                  )}
                                  {!loading && filteredClients.map(client => (
                                      <div 
                                          key={client.id}
                                          onClick={() => handleSelectClient(client)}
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
                              onClick={() => setSelectedClient(null)}
                              className="text-sm text-gray-500 hover:text-red-600 transition-colors underline"
                          >
                              Cambiar
                          </button>
                      </div>
                  )}
              </div>

              {/* Items Section */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Receipt className="h-5 w-5 mr-2 text-primary" />
                      Detalle de Servicios
                  </h2>

                  {/* Add Item Form */}
                  <div className="flex flex-col md:flex-row gap-3 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Concepto / Servicio</label>
                          <input 
                              type="text" 
                              placeholder="Ej. Corte de Cabello" 
                              className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                              value={newItem.description}
                              onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                          />
                      </div>
                      <div className="w-full md:w-24">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Cant.</label>
                          <input 
                              type="number" 
                              min="1"
                              className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                              value={newItem.quantity}
                              onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})}
                          />
                      </div>
                      <div className="w-full md:w-32">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Precio Unit.</label>
                          <input 
                              type="number" 
                              placeholder="0.00"
                              className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                              value={newItem.price}
                              onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                          />
                      </div>
                      <div className="flex items-end">
                          <button 
                              onClick={handleAddItem}
                              className="w-full md:w-auto px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                          >
                              Agregar
                          </button>
                      </div>
                  </div>

                  {/* Items Table */}
                  <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                              <tr>
                                  <th className="px-4 py-3 font-medium">Descripción</th>
                                  <th className="px-4 py-3 font-medium text-center">Cant.</th>
                                  <th className="px-4 py-3 font-medium text-right">Precio</th>
                                  <th className="px-4 py-3 font-medium text-right">Total</th>
                                  <th className="px-4 py-3 w-10"></th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {items.length === 0 ? (
                                  <tr>
                                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                                          No hay servicios agregados. Busca un servicio o agrégalo arriba.
                                      </td>
                                  </tr>
                              ) : (
                                  items.map(item => (
                                      <tr key={item.id} className="hover:bg-gray-50/50">
                                          <td className="px-4 py-3 text-gray-900 font-medium">{item.description}</td>
                                          <td className="px-4 py-3 text-center text-gray-600">{item.quantity}</td>
                                          <td className="px-4 py-3 text-right text-gray-600">${item.price.toLocaleString()}</td>
                                          <td className="px-4 py-3 text-right text-gray-900 font-semibold">${(item.price * item.quantity).toLocaleString()}</td>
                                          <td className="px-4 py-3 text-center">
                                              <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                  <Trash2 className="h-4 w-4" />
                                              </button>
                                          </td>
                                      </tr>
                                  ))
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>

          {/* Right Column: Checkout Summary */}
          <div className="xl:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6">
                 <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <DollarSign className="h-5 w-5 mr-1 text-primary" />
                    Resumen de Cobro
                 </h3>

                 {/* Available Bonuses Widget (If Client Selected) */}
                 {selectedClient && selectedClient.bonos_historial && selectedClient.bonos_historial.some(b => b.estado === 'pendiente') && (
                     <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                         <h4 className="text-xs font-bold text-green-800 uppercase tracking-wider mb-2">Bonos Disponibles</h4>
                         <div className="space-y-2">
                             {selectedClient.bonos_historial.filter(b => b.estado === 'pendiente').map((bono, i) => (
                                 <div key={i} className="flex justify-between items-center bg-white p-2 rounded border border-green-100 shadow-sm">
                                     <span className="text-sm font-medium text-gray-800">{bono.tipo}</span>
                                     <button className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded font-medium transition-colors">
                                         Aplicar
                                     </button>
                                 </div>
                             ))}
                         </div>
                     </div>
                 )}

                 <div className="space-y-3 text-sm mb-6">
                     <div className="flex justify-between text-gray-600">
                         <span>Subtotal</span>
                         <span className="font-medium">${subtotal.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center text-gray-600">
                         <span>Descuento Manual</span>
                         <div className="flex items-center">
                            <span className="mr-1">$</span>
                            <input 
                                type="number" 
                                className="w-20 px-2 py-1 text-right border border-gray-300 rounded focus:border-primary outline-none"
                                value={discount || ''}
                                onChange={(e) => setDiscount(Number(e.target.value))}
                            />
                         </div>
                     </div>
                 </div>

                 <div className="border-t border-gray-200 pt-4 mb-8">
                     <div className="flex justify-between items-baseline">
                         <span className="text-base font-bold text-gray-900">Total a Pagar</span>
                         <span className="text-3xl font-black text-primary">${total.toLocaleString()}</span>
                     </div>
                 </div>

                 <button 
                     disabled={items.length === 0}
                     className={cn(
                        "w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all",
                        items.length === 0 
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none" 
                            : "bg-primary text-white hover:bg-primary/90 hover:shadow-primary/30"
                     )}
                 >
                     Liquidar y Cobrar
                 </button>
                 <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center">
                    Las facturas se guardan en el historial del CRM.
                 </p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Billing;
