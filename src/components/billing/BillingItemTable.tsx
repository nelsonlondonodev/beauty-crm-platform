import { Receipt, Trash2 } from 'lucide-react';
import type { InvoiceItem, Empleado } from '../../types';

interface BillingItemTableProps {
  items: InvoiceItem[];
  empleados: Empleado[];
  newItem: {
    description: string;
    quantity: number;
    price: string;
    empleado_id: string;
  };
  setNewItem: (item: {
    description: string;
    quantity: number;
    price: string;
    empleado_id: string;
  }) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
}

const BillingItemTable = ({
  items,
  empleados,
  newItem,
  setNewItem,
  onAddItem,
  onRemoveItem,
}: BillingItemTableProps) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
        <Receipt className="text-primary mr-2 h-5 w-5" />
        Detalle de Servicios
      </h2>

      {/* Add Item Form */}
      <div className="mb-6 flex flex-col items-end gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4 lg:flex-row">
        <div className="w-full shrink-0 lg:w-48 xl:w-56">
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Colaborador
          </label>
          <select
            className="focus:border-primary focus:ring-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-1"
            value={newItem.empleado_id}
            onChange={(e) =>
              setNewItem({ ...newItem, empleado_id: e.target.value })
            }
          >
            <option value="">(Ninguno)</option>
            {empleados
              .filter((e) => e.activo)
              .map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre}
                </option>
              ))}
          </select>
        </div>
        <div className="w-full min-w-[200px] flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Concepto / Servicio
          </label>
          <input
            type="text"
            placeholder="Ej. Corte de Cabello"
            className="focus:border-primary focus:ring-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-1"
            value={newItem.description}
            onChange={(e) =>
              setNewItem({ ...newItem, description: e.target.value })
            }
          />
        </div>
        <div className="flex w-full gap-3 lg:w-auto">
          <div className="w-20 shrink-0">
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Cant.
            </label>
            <input
              type="number"
              min="1"
              className="focus:border-primary focus:ring-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-1"
              value={newItem.quantity}
              onChange={(e) =>
                setNewItem({ ...newItem, quantity: Number(e.target.value) })
              }
            />
          </div>
          <div className="w-32 shrink-0">
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Precio Unit.
            </label>
            <input
              type="number"
              placeholder="0.00"
              className="focus:border-primary focus:ring-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-1"
              value={newItem.price}
              onChange={(e) =>
                setNewItem({ ...newItem, price: e.target.value })
              }
            />
          </div>
        </div>
        <div className="w-full shrink-0 lg:w-auto">
          <button
            type="button"
            onClick={onAddItem}
            className="h-[38px] w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 md:w-auto"
          >
            Agregar
          </button>
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Descripción</th>
              <th className="px-4 py-3 font-medium">Colaborador</th>
              <th className="px-4 py-3 text-center font-medium">Cant.</th>
              <th className="px-4 py-3 text-right font-medium">Precio</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="w-10 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No hay servicios agregados. Busca un servicio o agrégalo
                  arriba.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {item.description}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {empleados.find((e) => e.id === item.empleado_id)?.nombre ||
                      '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    ${Number(item.price).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    ${(Number(item.price) * Number(item.quantity)).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(index)}
                      className="text-gray-400 transition-colors hover:text-red-500"
                    >
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
