import React from 'react';

interface SettingsLinkProps {
  icon: React.ElementType;
  title: string;
  description: string;
  badge?: string;
  colorClass: string;
  onClick?: () => void;
}

const SettingsLink = ({ icon: Icon, title, description, badge, colorClass, onClick }: SettingsLinkProps) => {
  return (
    <button onClick={onClick} className="flex items-center justify-between p-4 w-full rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/10 transition-all group text-left">
      <div className="flex items-center gap-4">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">{title}</h4>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      {badge && (
        <span className="px-2 py-1 rounded bg-gray-50 text-[10px] font-bold text-gray-400">{badge}</span>
      )}
    </button>
  );
};

export default SettingsLink;
