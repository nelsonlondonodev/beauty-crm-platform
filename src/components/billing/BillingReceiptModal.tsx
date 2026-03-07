import { useState } from 'react';
import { X, Printer, Mail, Send, Leaf } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';

export interface InvoiceReceiptData {
  id: string;
  fecha: string;
  cliente: { nombre: string; telefono?: string; email?: string } | null;
  metodo_pago: string;
  items: Array<{ description: string; quantity: number; price: number }>;
  subtotal: number;
  descuento: number;
  total: number;
}

interface BillingReceiptModalProps {
  invoice: InvoiceReceiptData;
  onClose: () => void;
}

const BillingReceiptModal = ({ invoice, onClose }: BillingReceiptModalProps) => {
  const { config } = useTenant();
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = async () => {
    if (!invoice.cliente || !invoice.cliente.email) {
      alert('Este usuario no tiene un correo electrónico registrado en su perfil (Aún).');
      return;
    }

    setIsSendingEmail(true);
    try {
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL_RECEIPT || 'https://n8n.srv1033442.hstgr.cloud/webhook/send-eco-receipt';
      
      const payload = {
        cliente_nombre: invoice.cliente.nombre,
        cliente_email: invoice.cliente.email,
        tenant_name: config.brandName || 'nuestro local',
        factura_id: invoice.id.split('-')[0].toUpperCase(),
        items: invoice.items,
        subtotal: invoice.subtotal.toLocaleString(),
        descuento: invoice.descuento.toLocaleString(),
        total: invoice.total.toLocaleString()
      };

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Network response was not ok');

      alert('¡Recibo digital ecológico enviado con éxito al cliente! 🌿');
    } catch (e) {
      console.error('Error enviando email vía webhook:', e);
      alert('Hubo un problema de conexión al enviar el correo. Por favor revisa n8n.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleWhatsApp = () => {
    // Si tuviéramos el teléfono en invoice.cliente.telefono podríamos prellenarlo
    const msg = `Hola${invoice.cliente?.nombre ? ' ' + invoice.cliente.nombre : ''}, aquí está el recibo digital de tu servicio en ${config.brandName || 'nuestro local'} por un total de $${invoice.total.toLocaleString()}. ¡Gracias por tu visita y por ayudar a salvar el planeta! 🌿`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 print:bg-white print:p-0 print:absolute print:inset-0 print:block">
      
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl print:shadow-none print:w-full print:h-full print:rounded-none">
        
        {/* Header Modal (No Print) */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 print:hidden">
          <h3 className="text-lg font-bold text-gray-900">Venta Exitosa</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENIDO DEL TICKET (Sí se imprime) */}
        <div className="p-6 md:p-8 space-y-6 print:p-0 print:text-black" id="printable-receipt">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black uppercase text-gray-900">{config.brandName || 'Beauty CRM'}</h2>
            <p className="text-sm text-gray-500">Comprobante de Venta Electrónico</p>
            <p className="text-xs text-gray-500">Recibo #{invoice.id.split('-')[0].toUpperCase()}</p>
            <p className="text-xs text-gray-500">{new Date(invoice.fecha).toLocaleString()}</p>
          </div>

          <div className="border-t border-b border-dashed border-gray-300 py-4 space-y-1 text-sm">
            {invoice.cliente ? (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cliente:</span>
                  <span className="font-semibold">{invoice.cliente.nombre}</span>
                </div>
                {invoice.cliente.telefono && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tel:</span>
                    <span className="font-semibold">{invoice.cliente.telefono}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-between">
                <span className="text-gray-500">Cliente:</span>
                <span className="font-semibold uppercase">Consumidor Final</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Método Pago:</span>
              <span className="font-semibold capitalize">{invoice.metodo_pago}</span>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <table className="w-full text-sm text-left relative">
              <thead className="text-xs text-gray-400 border-b border-gray-200">
                <tr>
                  <th className="py-2 font-medium">Cant</th>
                  <th className="py-2 font-medium">Descripción</th>
                  <th className="py-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 text-gray-600 align-top">{item.quantity}</td>
                    <td className="py-2 font-medium text-gray-900 pr-2">{item.description}</td>
                    <td className="py-2 text-right font-semibold text-gray-900 align-top">
                      ${(item.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 pt-4 space-y-2 text-sm text-right">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>${invoice.subtotal.toLocaleString()}</span>
            </div>
            {invoice.descuento > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento:</span>
                <span>-${invoice.descuento.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-black text-gray-900 border-t border-gray-200 mt-2 pt-2">
              <span>TOTAL:</span>
              <span>${invoice.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Footer del Recibo */}
          <div className="text-center pt-6 pb-2 print:pb-0">
            <p className="text-xs text-gray-400">¡Gracias por su visita!</p>
          </div>
        </div>

        {/* Acciones del Modal (No Print) */}
        <div className="p-6 bg-gray-50 rounded-b-xl space-y-3 border-t border-gray-100 print:hidden">
            <div className="mb-4 text-center rounded-lg bg-emerald-50 border border-emerald-100 p-3 shadow-sm">
                <p className="text-xs font-semibold text-emerald-800 flex items-center justify-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    Ayudemos al planeta. ¡No lo imprimas si no es necesario!
                </p>
                <p className="text-xs text-emerald-600 mt-1">Elige las opciones digitales abajo para enviar por celular.</p>
            </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center p-3 text-sm font-semibold !bg-[#25D366] !text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4 mr-2" />
              WhatsApp
            </button>
            <button
              onClick={handleEmail}
              disabled={isSendingEmail}
              className="flex items-center justify-center p-3 text-sm font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <Mail className="w-4 h-4 mr-2" />
              {isSendingEmail ? 'Enviando...' : 'Correo Ecológico'}
            </button>
            <button
              onClick={handlePrint}
              className="col-span-2 flex items-center justify-center p-3 text-sm font-semibold bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir Físico
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingReceiptModal;
