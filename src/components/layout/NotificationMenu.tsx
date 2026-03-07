import { useState, useRef, useEffect } from 'react';
import { Bell, Gift, AlertTriangle, Calendar, User, DollarSign, CheckCircle } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'appointment': return <Calendar className="h-4 w-4 text-blue-500" />;
    case 'client': return <User className="h-4 w-4 text-green-500" />;
    case 'sale': return <DollarSign className="h-4 w-4 text-purple-500" />;
    case 'bonus': return <CheckCircle className="h-4 w-4 text-orange-500" />;
    default: return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const NotificationMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, loading } = useNotifications();
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Track if user has seen current alerts
  const [hasSeenAlerts, setHasSeenAlerts] = useState(false);

  const hasCriticalAlerts = notifications.upcomingBirthdays > 0 || notifications.expiringBonuses > 0;
  const showPing = hasCriticalAlerts && !hasSeenAlerts;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && hasCriticalAlerts) {
      setHasSeenAlerts(true);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleOpen}
        className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors active:scale-95 ${isOpen ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:bg-gray-100'}`}
        title="Notificaciones"
      >
        <Bell className="h-5 w-5" />
        {showPing && (
          <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-[22rem] origin-top-right overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in duration-200 z-50">
          <div className="border-b border-gray-50 bg-gray-50/50 px-5 py-3">
            <h3 className="text-sm font-bold text-gray-900">Notificaciones</h3>
          </div>

          <div className="max-h-[400px] overflow-y-auto w-full custom-scrollbar">
            {loading ? (
              <div className="p-8 text-center text-sm font-medium text-gray-500 flex flex-col items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
                Cargando alertas...
              </div>
            ) : (
              <>
                {/* Alertas Críticas */}
                {hasCriticalAlerts && (
                  <div className="p-2 border-b border-gray-50">
                    <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-gray-400 uppercase">Alertas Críticas</div>
                    
                    {notifications.upcomingBirthdays > 0 && (
                      <button
                        onClick={() => { setIsOpen(false); navigate('/clients'); }}
                        className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 transition-all outline-none hover:bg-orange-50 group text-left"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 shadow-sm border border-orange-200/50 relative overflow-hidden">
                           <div className="absolute inset-0 bg-white/20"></div>
                          <Gift className="h-4 w-4 relative z-10" />
                        </div>
                        <div className="flex flex-col flex-1 pl-1">
                          <span className="text-sm font-bold text-gray-900 group-hover:text-orange-700 transition-colors">Cumpleaños próximos</span>
                          <span className="text-xs text-gray-500 font-medium leading-relaxed mt-0.5">Tienes <span className="text-orange-600 font-bold">{notifications.upcomingBirthdays}</span> cumpleaños agendados para este mes.</span>
                        </div>
                      </button>
                    )}

                    {notifications.expiringBonuses > 0 && (
                      <button
                        onClick={() => { setIsOpen(false); navigate('/clients'); }}
                        className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 transition-all outline-none hover:bg-red-50 group text-left mt-1"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 shadow-sm border border-red-200/50 relative overflow-hidden">
                           <div className="absolute inset-0 bg-white/20"></div>
                          <AlertTriangle className="h-4 w-4 relative z-10" />
                        </div>
                        <div className="flex flex-col flex-1 pl-1">
                          <span className="text-sm font-bold text-gray-900 group-hover:text-red-700 transition-colors">Bonos por vencer</span>
                          <span className="text-xs text-gray-500 font-medium leading-relaxed mt-0.5">Hay <span className="text-red-600 font-bold">{notifications.expiringBonuses}</span> bonos o cortesías por vencer pronto.</span>
                        </div>
                      </button>
                    )}
                  </div>
                )}

                {/* Actividad Reciente */}
                <div className="p-2">
                  <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-gray-400 uppercase">Actividad Reciente</div>
                  {notifications.recentActivity.length === 0 ? (
                    <div className="px-3 py-6 flex flex-col items-center justify-center text-center gap-2">
                       <Bell className="h-8 w-8 text-gray-200" />
                       <span className="text-xs font-medium text-gray-400">No hay actividad reciente en el sistema.</span>
                    </div>
                  ) : (
                    notifications.recentActivity.slice(0, 4).map((activity) => {
                      let relativeTime = '';
                      try {
                        if (activity.timestamp) {
                          relativeTime = formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: es });
                        }
                      } catch (e) {}

                      return (
                        <div key={activity.id} className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 transition-all outline-none hover:bg-gray-50 text-left cursor-default">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex flex-col min-w-0 flex-1 pl-1">
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-sm font-bold text-gray-900 truncate">{activity.title}</span>
                              <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap mt-0.5">{relativeTime}</span>
                            </div>
                            <span className="text-xs text-gray-500 leading-relaxed mt-0.5 line-clamp-2 pr-2">{activity.description}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
          
          <div className="border-t border-gray-50 bg-gray-50/50 p-2 text-center">
            <button 
              onClick={() => { setIsOpen(false); navigate('/'); }}
              className="text-xs font-bold text-gray-600 hover:text-purple-700 transition-colors py-1.5 px-4 rounded-full hover:bg-purple-50"
            >
              Ir al Panel Principal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationMenu;
