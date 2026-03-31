import { APP_CONFIG } from '../../config/brand';

interface DashboardHeaderProps {
  fullName?: string | null;
}

const DashboardHeader = ({ fullName }: DashboardHeaderProps) => {
  const userName = fullName?.split(' ')[0] || APP_CONFIG.defaults.userName;

  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-500">
          Bienvenido de nuevo, {userName}. Aquí está lo que sucede hoy en tu negocio.
        </p>
      </div>
      <div className="flex items-center gap-2">
        {/* Espacio para acciones rápidas globales si se requieren en el futuro */}
      </div>
    </header>
  );
};

export default DashboardHeader;
