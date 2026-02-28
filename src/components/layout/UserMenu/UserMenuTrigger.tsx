interface UserMenuTriggerProps {
  initials: string;
  avatarUrl?: string | null;
  isOpen: boolean;
  onClick: () => void;
}

const UserMenuTrigger = ({ initials, avatarUrl, onClick }: UserMenuTriggerProps) => {
  return (
    <button
      onClick={onClick}
      className="group relative flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden bg-gradient-to-tr from-purple-600 to-pink-500 font-bold text-white shadow-md transition-all hover:shadow-purple-200/50 hover:scale-105 active:scale-95"
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="User" className="h-full w-full object-cover" />
      ) : (
        <span className="relative z-10">{initials}</span>
      )}
      <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
};

export default UserMenuTrigger;
