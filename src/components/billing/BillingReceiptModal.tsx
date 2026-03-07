import { useState } from 'react';
import { X, Printer, Mail, Send, Leaf, CheckCircle2, AlertCircle } from 'lucide-react';
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

type DeliveryStatus = 'idle' | 'sending' | 'success' | 'error';

const BillingReceiptModal = ({ invoice, onClose }: BillingReceiptModalProps) => {
  const { config } = useTenant();
  const [status, setStatus] = useState<DeliveryStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = async () => {
    if (!invoice.cliente || !invoice.cliente.email) {
      setErrorMessage('Este usuario no tiene un correo electrónico registrado.');
      setStatus('error');
      return;
    }

    setStatus('sending');
    setErrorMessage(null);
    try {
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL_RECEIPT || 'https://n8n.srv1033442.hstgr.cloud/webhook-test/send-eco-receipt';
      
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

      if (!res.ok) throw new Error('Error al conectar con el servidor de correos.');

      setStatus('success');
    } catch (e) {
      console.error('Error enviando email:', e);
      setStatus('error');
      setErrorMessage('No se pudo enviar el correo. Por favor intenta de nuevo.');
    } finally {
        setTimeout(() => {
            if (status !== 'idle') setStatus('idle');
        }, 3000);
    }
  };

  const handleWhatsApp = () => {
    const msg = `Hola${invoice.cliente?.nombre ? ' ' + invoice.cliente.nombre : ''}, aquí está el recibo digital de tu servicio en ${config.brandName || 'nuestro local'} por un total de $${invoice.total.toLocaleString()}. ¡Gracias por tu visita y por ayudar a salvar el planeta! 🌿`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm print:bg-white print:p-0 print:absolute print:inset-0 print:block">
      
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:w-full print:h-full print:rounded-none overflow-hidden">
        
        {/* Modal Header (No Print) */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 print:hidden shrink-0">
          <div>
            <h3 className="text-xl font-black text-gray-900">Venta Exitosa</h3>
            <p className="text-xs text-gray-500 font-medium">Documento generado correctamente</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* CONTENIDO DEL TICKET (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 print:overflow-visible print:p-0 print:text-black scrollbar-hide">
          
          {/* Status Feedback (Floating in Modal) */}
          {status === 'success' && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300 rounded-xl bg-green-50 border border-green-100 p-4 flex items-center gap-3 print:hidden shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <p className="text-sm font-bold text-green-800">¡Correo ecológico enviado con éxito! 🌿</p>
            </div>
          )}

          {status === 'error' && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300 rounded-xl bg-red-50 border border-red-100 p-4 flex items-center gap-3 print:hidden shadow-sm">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-sm font-bold text-red-800">{errorMessage}</p>
            </div>
          )}
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black uppercase text-gray-900 tracking-tight">{config.brandName || 'Beauty CRM'}</h2>
            <div className="h-0.5 w-12 bg-primary/20 mx-auto px-4" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] pt-1">Comprobante de Pago Electrónico</p>
            <p className="text-[10px] text-gray-400">Recibo #{invoice.id.split('-')[0].toUpperCase()} • {new Date(invoice.fecha).toLocaleString()}</p>
          </div>

          <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-5 space-y-3 text-sm">
            {invoice.cliente ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Cliente</span>
                  <span className="font-bold text-gray-900">{invoice.cliente.nombre}</span>
                </div>
                {invoice.cliente.telefono && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Teléfono</span>
                    <span className="font-semibold text-gray-700">{invoice.cliente.telefono}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Cliente</span>
                <span className="font-bold text-gray-900 uppercase">Consumidor Final</span>
              </div>
            )}
            <div className="flex justify-between items-center bg-white p-2 px-3 rounded-lg border border-gray-100 shadow-sm mt-2">
              <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Método Pago</span>
              <span className="font-black text-primary capitalize text-xs">{invoice.metodo_pago}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-4">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 font-black text-gray-400 uppercase text-[9px] tracking-widest w-8">Cnt</th>
                  <th className="pb-3 font-black text-gray-400 uppercase text-[9px] tracking-widest">Servicio / Producto</th>
                  <th className="pb-3 text-right font-black text-gray-400 uppercase text-[9px] tracking-widest">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                    <td className="py-4 text-gray-400 font-black">{item.quantity}</td>
                    <td className="py-4 font-bold text-gray-900">{item.description}</td>
                    <td className="py-4 text-right font-black text-gray-900 whitespace-nowrap">
                      ${(item.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t-2 border-dashed border-gray-100 pt-6 space-y-2">
            <div className="flex justify-between text-sm text-gray-500 font-medium tracking-tight">
              <span>Subtotal:</span>
              <span className="font-bold text-gray-700">${invoice.subtotal.toLocaleString()}</span>
            </div>
            {invoice.descuento > 0 && (
              <div className="flex justify-between text-sm font-bold text-emerald-600 tracking-tight">
                <span>Descuento Bono:</span>
                <span>-${invoice.descuento.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-4 mt-2">
              <span className="text-base font-black text-gray-900 uppercase tracking-tighter">Liquidado</span>
              <span className="text-3xl font-black text-gray-900 tracking-tighter">${invoice.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="text-center pt-8 opacity-40 print:opacity-100 border-t border-gray-50">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[6px]">¡Gracias por preferirnos!</p>
          </div>
        </div>

        {/* Acciones Finales (No Print) */}
        <div className="p-5 sm:p-6 bg-gray-50/80 backdrop-blur-md rounded-b-2xl border-t border-gray-100 space-y-4 print:hidden shrink-0">
          
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                onClick={handleWhatsApp}
                className="flex-[1.2] flex items-center justify-center p-3 text-[11px] font-black !bg-[#25D366] !text-white rounded-xl shadow-lg shadow-[#25D366]/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Send className="w-4 h-4 mr-2" />
                WhatsApp
              </button>
              <button
                onClick={handleEmail}
                disabled={status === 'sending'}
                className="flex-1 flex items-center justify-center p-3 text-[11px] font-black bg-gray-900 text-white rounded-xl shadow-lg shadow-gray-900/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                <Mail className="w-4 h-4 mr-2" />
                {status === 'sending' ? '...' : 'E-mail Eco'}
              </button>
            </div>
            
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center p-3 text-[11px] font-bold bg-white border-2 border-gray-200 text-gray-500 rounded-xl hover:bg-white hover:border-gray-400 hover:text-gray-900 transition-all shadow-sm"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir Papeleta física
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 bg-primary text-white text-sm font-black rounded-xl shadow-xl shadow-primary/30 hover:bg-primary/90 hover:scale-[1.01] active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
          >
            Finalizar y Nueva Venta
          </button>

          <p className="flex items-center justify-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
            <Leaf className="w-3.5 h-3.5" />
            Compromiso con el planeta
          </p>
        </div>
      </div>
    </div>
  );
};

export default BillingReceiptModal;
