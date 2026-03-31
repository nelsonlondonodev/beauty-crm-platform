import { useState } from 'react';
import { cn } from '../../../lib/utils';

interface ProfileNotesProps {
  initialNotes: string;
  onSave: (notes: string) => Promise<boolean>;
  isSaving: boolean;
}

const ProfileNotes = ({ initialNotes, onSave, isSaving }: ProfileNotesProps) => {
  const [editing, setEditing] = useState(false);
  const [notesValue, setNotesValue] = useState(initialNotes);

  const handleSave = async () => {
    const success = await onSave(notesValue);
    if (success) {
      setEditing(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setNotesValue(initialNotes);
  };

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Ficha Técnica (Huella)
        </h3>
        {!editing && (
          <button 
            onClick={() => setEditing(true)}
            className="text-primary text-xs font-medium hover:underline"
          >
            Editar
          </button>
        )}
      </header>
      
      {editing ? (
        <div className="space-y-3">
          <textarea
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            className="focus:border-primary focus:ring-primary w-full rounded-lg border border-gray-200 p-3 text-sm focus:ring-1 focus:outline-none"
            rows={4}
            placeholder="Escribe preferencias, alergias, tintes..."
          />
          <div className="flex justify-end gap-2">
            <button 
              onClick={handleCancel}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary rounded-lg px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : 'Guardar Ficha'}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-gray-50 p-4">
          <p className={cn(
            "text-sm leading-relaxed",
            initialNotes ? "text-gray-700" : "italic text-gray-400"
          )}>
            {initialNotes || "No hay información técnica registrada aún para este cliente."}
          </p>
        </div>
      )}
    </section>
  );
};

export default ProfileNotes;
