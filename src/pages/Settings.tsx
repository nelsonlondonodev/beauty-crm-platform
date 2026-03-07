import { useState } from 'react';
import DashboardHeader from '../components/layout/DashboardHeader';
import { Building, Shield, Bell, User } from 'lucide-react';
import SettingsLink from '../components/settings/SettingsLink';
import BrandConfigModal from '../components/settings/BrandConfigModal';
import { APP_CONFIG } from '../config/brand';

const Settings = () => {
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <DashboardHeader
        title="Configuración"
        subtitle="Administra tu perfil personal y las preferencias de tu negocio."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm ring-1 ring-black/5">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Building className="h-5 w-5 text-purple-600" />
              Gestión de Negocio
            </h3>
            
            <div className="grid gap-4">
              <SettingsLink 
                icon={Building}
                title="Marca y Apariencia"
                description="Personaliza el nombre de tu negocio y el logotipo."
                colorClass="bg-blue-50 text-blue-600"
                onClick={() => setIsBrandModalOpen(true)}
              />
              <SettingsLink 
                icon={Shield}
                title="Seguridad y Permisos"
                description="Cambiar contraseña y gestionar usuarios."
                badge="PRÓXIMAMENTE"
                colorClass="bg-indigo-50 text-indigo-600"
              />
              <SettingsLink 
                icon={Bell}
                title="Centro de Notificaciones"
                description="Alertas de citas y recordatorios por WhatsApp/Email."
                badge="PRÓXIMAMENTE"
                colorClass="bg-amber-50 text-amber-600"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">¿Necesitas ayuda con tu cuenta?</h4>
                <p className="text-sm text-gray-500 mt-1">
                  {APP_CONFIG.legal.supportText}
                </p>
                <a
                  href={APP_CONFIG.legal.supportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-sm font-bold text-purple-600 hover:text-purple-700"
                >
                  Contactar Soporte →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {isBrandModalOpen && (
        <BrandConfigModal onClose={() => setIsBrandModalOpen(false)} />
      )}
    </div>
  );
};

export default Settings;



