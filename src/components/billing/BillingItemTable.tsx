import { Receipt, Trash2 } from 'lucide-react';
import type { InvoiceItem, Empleado } from '../../types';

interface BillingItemTableProps {
  items: InvoiceItem[];
  empleados: Empleado[];
  newItem: { description: string; quantity: number; price: string; empleado_id: string };
  setNewItem: (item: { description: string; quantity: number; price: string; empleado_id: string }) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
}

const BillingItemTable = ({ items, empleados, newItem, setNewItem, onAddItem, onRemoveItem }: BillingItemTableProps) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Receipt className="h-5 w-5 mr-2 text-primary" />
        Detalle de Servicios
      </h2>

      {/* Add Item Form */}
      <div className="flex flex-col lg:flex-row gap-3 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100 items-end">
        <div className="w-full lg:w-48 xl:w-56 shrink-0">
          <label className="block text-xs font-medium text-gray-700 mb-1">Colaborador</label>
          <select
            className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            value={newItem.empleado_id}
            onChange={(e) => setNewItem({...newItem, empleado_id: e.target.value})}
          >
            <option value="">(Ninguno)</option>
            {empleados.filter(e => e.activo).map(emp => (
              <option key={emp.id} value={emp.id}>{emp.nombre}</option>
            ))}
          </select>
        </div>
        <div className="w-full flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-700 mb-1">Concepto / Servicio</label>
          <input 
            type="text" 
            placeholder="Ej. Corte de Cabello" 
            className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            value={newItem.description}
            onChange={(e) => setNewItem({...newItem, description: e.target.value})}
          />
        </div>
        <div className="flex w-full lg:w-auto gap-3">
          <div className="w-20 shrink-0">
            <label className="block text-xs font-medium text-gray-700 mb-1">Cant.</label>
            <input 
              type="number" 
              min="1"
              className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              value={newItem.quantity}
              onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})}
            />
          </div>
          <div className="w-32 shrink-0">
            <label className="block text-xs font-medium text-gray-700 mb-1">Precio Unit.</label>
            <input 
              type="number" 
              placeholder="0.00"
              className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              value={newItem.price}
              onChange={(e) => setNewItem({...newItem, price: e.target.value})}
            />
          </div>
        </div>
        <div className="w-full lg:w-auto shrink-0">
          <button 
            onClick={onAddItem}
            className="w-full md:w-auto px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors h-[38px]"
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
              <th className="px-4 py-3 font-medium">Colaborador</th>
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
                  <td className="px-4 py-3 text-gray-500">{empleados.find(e => e.id === item.empleado_id)?.nombre || '-'}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-gray-600">${item.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-gray-900 font-semibold">${(item.price * item.quantity).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => onRemoveItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
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
  );
};

export default BillingItemTable;
