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
  subMonths,
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

const CalendarView = ({
  currentDate,
  onDateChange,
  appointments,
  onAddAppointment,
}: CalendarViewProps) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = 'd';

  const nextMonth = () => onDateChange(addMonths(currentDate, 1));
  const prevMonth = () => onDateChange(subMonths(currentDate, 1));

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Generate days
  const allDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-800 capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDateChange(new Date())}
            className="text-primary hover:bg-primary/5 rounded-md px-3 py-1 text-sm font-medium transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={nextMonth}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
        {weekDays.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid auto-rows-fr grid-cols-7 gap-px border-b border-gray-200 bg-gray-200">
        {allDays.map((dayItem) => {
          const isCurrentMonth = isSameMonth(dayItem, monthStart);
          const isToday = isSameDay(dayItem, new Date());

          // Filter appointments for this day
          const dayAppointments = appointments.filter((apt) =>
            isSameDay(new Date(apt.fecha_cita), dayItem)
          );

          return (
            <div
              key={dayItem.toString()}
              className={`group relative flex min-h-[120px] flex-col gap-1 bg-white p-2 transition-colors hover:bg-gray-50 ${
                !isCurrentMonth
                  ? 'bg-gray-50/30 text-gray-400'
                  : 'text-gray-900'
              }`}
              onClick={() => onAddAppointment(dayItem)}
            >
              <div className="flex items-start justify-between">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                    isToday ? 'bg-primary text-white shadow-sm' : ''
                  }`}
                >
                  {format(dayItem, dateFormat)}
                </span>
                <button
                  className="hover:bg-primary/10 text-primary rounded p-1 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddAppointment(dayItem);
                  }}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              <div className="scrollbar-thin flex max-h-[80px] flex-1 flex-col gap-1 overflow-y-auto">
                {dayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className={`cursor-pointer truncate rounded border border-l-2 p-1.5 text-xs shadow-sm transition-transform hover:scale-[1.02] ${
                      apt.estado === 'completada'
                        ? 'border-green-200 border-l-green-500 bg-green-50 text-green-700'
                        : apt.estado === 'cancelada'
                          ? 'decoration-line-through border-red-200 border-l-red-500 bg-red-50 text-red-700 opacity-70'
                          : 'border-blue-200 border-l-blue-500 bg-blue-50 text-blue-700'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    title={`${format(new Date(apt.fecha_cita), 'HH:mm')} - ${apt.servicio}`}
                  >
                    <span className="font-semibold">
                      {format(new Date(apt.fecha_cita), 'HH:mm')}
                    </span>{' '}
                    {apt.servicio}
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
