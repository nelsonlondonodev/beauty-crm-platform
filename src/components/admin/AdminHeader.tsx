import { Store } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  subtitle: string;
  onRegisterNew?: () => void;
}

const AdminHeader = ({ title, subtitle, onRegisterNew }: AdminHeaderProps) => {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 text-sm">{subtitle}</p>
      </div>
      <button 
        onClick={onRegisterNew}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition-colors"
      >
        <Store className="h-4 w-4" />
        Registrar Nuevo Salón
      </button>
    </header>
  );
};

export default AdminHeader;
