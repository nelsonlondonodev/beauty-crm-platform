import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface ProfileHeaderProps {
  clientName: string;
}

const ProfileHeader = ({ clientName }: ProfileHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => navigate('/clients')}
        className="hover:bg-primary/5 hover:text-primary flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition-colors"
        aria-label="Volver a Clientes"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Perfil del Cliente
        </h1>
        <p className="text-sm text-gray-500">
          Historial de fidelización y detalles técnicos de {clientName}
        </p>
      </div>
    </div>
  );
};

export default ProfileHeader;
