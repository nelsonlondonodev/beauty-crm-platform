import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { Appointment } from '../../types';

interface CalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  appointments: Appointment[];
  onAddAppointment: (date: Date) => void;
}

const CalendarView = ({ currentDate, onDateChange, appointments, onAddAppointment }: CalendarViewProps) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "d";

  const nextMonth = () => onDateChange(addMonths(currentDate, 1));
  const prevMonth = () => onDateChange(subMonths(currentDate, 1));

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Generate days
  const allDays = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 capitalize">
                {format(currentDate, 'MMMM yyyy', { locale: es })}
            </h2>
            <div className="flex items-center gap-2">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => onDateChange(new Date())} className="px-3 py-1 text-sm font-medium text-primary hover:bg-primary/5 rounded-md transition-colors">
                    Hoy
                </button>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
            {weekDays.map((d) => (
                <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {d}
                </div>
            ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 auto-rows-fr bg-gray-200 gap-px border-b border-gray-200">
            {allDays.map((dayItem) => {
                const isCurrentMonth = isSameMonth(dayItem, monthStart);
                const isToday = isSameDay(dayItem, new Date());
                
                // Filter appointments for this day
                const dayAppointments = appointments.filter(apt => 
                    isSameDay(new Date(apt.fecha_cita), dayItem)
                );

                return (
                    <div 
                        key={dayItem.toString()} 
                        className={`min-h-[120px] bg-white p-2 transition-colors hover:bg-gray-50 flex flex-col gap-1 relative group ${
                            !isCurrentMonth ? 'bg-gray-50/30 text-gray-400' : 'text-gray-900'
                        }`}
                        onClick={() => onAddAppointment(dayItem)}
                    >
                        <div className="flex justify-between items-start">
                             <span className={`text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full ${
                                isToday ? 'bg-primary text-white shadow-sm' : ''
                            }`}>
                                {format(dayItem, dateFormat)}
                            </span>
                             <button 
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary/10 rounded text-primary transition-opacity"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddAppointment(dayItem);
                                }}
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                       
                        <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[80px] scrollbar-thin">
                            {dayAppointments.map((apt) => (
                                <div 
                                    key={apt.id}
                                    className={`text-xs p-1.5 rounded border border-l-2 truncate cursor-pointer shadow-sm transition-transform hover:scale-[1.02] ${
                                        apt.estado === 'completada' ? 'bg-green-50 border-green-200 border-l-green-500 text-green-700' :
                                        apt.estado === 'cancelada' ? 'bg-red-50 border-red-200 border-l-red-500 text-red-700 decoration-line-through opacity-70' :
                                        'bg-blue-50 border-blue-200 border-l-blue-500 text-blue-700'
                                    }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // TODO: Open edit modal
                                        console.log('Edit', apt);
                                    }}
                                    title={`${format(new Date(apt.fecha_cita), 'HH:mm')} - ${apt.servicio}`}
                                >
                                    <span className="font-semibold">{format(new Date(apt.fecha_cita), 'HH:mm')}</span> {apt.servicio}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default CalendarView;
