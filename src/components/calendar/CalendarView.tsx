import { useRef, useEffect, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import type { EventClickArg, DateSelectArg, DatesSetArg } from '@fullcalendar/core';
import type { CalendarEvent, Empleado } from '../../types';
import { getStaffHexColor } from './StaffFilter';
import './calendarStyles.css';

// ── Types ───────────────────────────────────────────────────────────────────

type ViewType = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'resourceTimeGridDay';

interface CalendarViewProps {
  events: CalendarEvent[];
  staff: Empleado[];
  selectedStaffIds: string[];
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onDateRangeChange: (date: Date, view: ViewType) => void;
  onEventClick: (appointmentId: string) => void;
  onDateSelect: (start: Date, end: Date, staffId?: string) => void;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const buildResources = (staff: Empleado[], selectedIds: string[]) =>
  staff
    .filter((s) => s.activo && selectedIds.includes(s.id))
    .map((s, index) => ({
      id: s.id,
      title: s.nombre,
      eventColor: getStaffHexColor(index),
    }));

const STATUS_COLORS: Record<string, string> = {
  programada: '#3b82f6',
  completada: '#22c55e',
  cancelada: '#ef4444',
};

const buildEvents = (events: CalendarEvent[], selectedIds: string[], staffList: Empleado[]) =>
  events
    .filter((e) => {
      // If no staff assigned, show for all
      if (!e.resourceId) return true;
      return selectedIds.includes(e.resourceId);
    })
    .map((e) => {
      const staffIndex = staffList.findIndex((s) => s.id === e.resourceId);
      const hasStaffColor = staffIndex >= 0;

      return {
        ...e,
        backgroundColor: hasStaffColor
          ? getStaffHexColor(staffIndex)
          : STATUS_COLORS[e.extendedProps.status] || '#3b82f6',
        borderColor: 'transparent',
        textColor: '#1f2937',
        classNames: [`fc-event--${e.extendedProps.status}`],
      };
    });

// ── Component ───────────────────────────────────────────────────────────────

const CalendarView = ({
  events,
  staff,
  selectedStaffIds,
  currentView,
  onViewChange,
  onDateRangeChange,
  onEventClick,
  onDateSelect,
}: CalendarViewProps) => {
  const calendarRef = useRef<FullCalendar>(null);

  const isResourceView = currentView === 'resourceTimeGridDay';

  // Sync external view changes to FullCalendar API
  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (api && api.view.type !== currentView) {
      api.changeView(currentView);
    }
  }, [currentView]);

  const resources = useMemo(
    () => buildResources(staff, selectedStaffIds),
    [staff, selectedStaffIds]
  );

  const mappedEvents = useMemo(
    () => buildEvents(events, selectedStaffIds, staff),
    [events, selectedStaffIds, staff]
  );

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleEventClick = (info: EventClickArg) => {
    onEventClick(info.event.id);
  };

  const handleDateSelect = (info: DateSelectArg) => {
    const resourceId = (info as DateSelectArg & { resource?: { id: string } }).resource?.id;
    onDateSelect(info.start, info.end, resourceId);
  };

  const handleDatesSet = (info: DatesSetArg) => {
    const midDate = new Date((info.start.getTime() + info.end.getTime()) / 2);
    const viewType = info.view.type as ViewType;
    onDateRangeChange(midDate, viewType);
  };

  const handleViewChange = (info: { view: { type: string } }) => {
    onViewChange(info.view.type as ViewType);
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <FullCalendar
        ref={calendarRef}
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
          resourceTimeGridPlugin,
        ]}
        initialView={currentView}
        locale="es"
        firstDay={1}
        headerToolbar={{
          left: 'prev,today,next',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        buttonText={{
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          day: 'Día',
        }}
        /* Resources */
        resources={isResourceView ? resources : undefined}
        /* Events */
        events={mappedEvents}
        /* Interaction */
        editable={false}
        selectable={true}
        selectMirror={true}
        select={handleDateSelect}
        eventClick={handleEventClick}
        /* Date navigation */
        datesSet={handleDatesSet}
        viewDidMount={handleViewChange}
        /* Time config */
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
        slotDuration="00:30:00"
        allDaySlot={false}
        nowIndicator={true}
        /* Display */
        dayMaxEvents={3}
        eventDisplay="block"
        height="auto"
        contentHeight="auto"
        stickyHeaderDates={true}
        /* Event content */
        eventContent={(arg) => {
          const { status, clientName } = arg.event.extendedProps as CalendarEvent['extendedProps'];
          const isCancelled = status === 'cancelada';
          return (
            <div
              className={`flex flex-col gap-0.5 overflow-hidden px-1 py-0.5 ${
                isCancelled ? 'line-through opacity-60' : ''
              }`}
            >
              <span className="text-[11px] font-semibold">{arg.timeText}</span>
              <span className="truncate text-[11px] font-medium">{arg.event.title}</span>
              <span className="truncate text-[10px] opacity-75">{clientName}</span>
            </div>
          );
        }}
      />
    </div>
  );
};

export default CalendarView;
