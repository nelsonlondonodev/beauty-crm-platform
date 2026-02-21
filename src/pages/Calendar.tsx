import { useState, useEffect } from 'react';
import DashboardHeader from '../components/layout/DashboardHeader';
import CalendarView from '../components/calendar/CalendarView';
import NewAppointmentModal from '../components/calendar/NewAppointmentModal';
import { useAppointments } from '../hooks/useAppointments';
import { Plus } from 'lucide-react';
import type { Appointment } from '../types';

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDateForNew, setSelectedDateForNew] = useState<Date | null>(null);
    const { appointments, fetchAppointments, addAppointment } = useAppointments();

    useEffect(() => {
        fetchAppointments(currentDate);
    }, [currentDate, fetchAppointments]);

    const handleAddClick = (date?: Date) => {
        setSelectedDateForNew(date || new Date());
        setIsModalOpen(true);
    };

    const handleSaveAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
        await addAppointment(appointmentData);
        // Refresh appointments logic is handled by state update in hook, but we might want to ensure date range match 
        // For simple UX, adding to state in hook is enough if date matches current view.
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            <DashboardHeader 
                title="Agenda" 
                subtitle="Gestiona tus citas y disponibilidad."
                actions={
                    <button 
                        onClick={() => handleAddClick()}
                        className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Cita
                    </button>
                }
            />

            <div className="flex-1 overflow-auto">
                <CalendarView 
                    currentDate={currentDate}
                    onDateChange={setCurrentDate}
                    appointments={appointments}
                    onAddAppointment={handleAddClick}
                />
            </div>

            <NewAppointmentModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveAppointment}
                selectedDate={selectedDateForNew}
            />
        </div>
    );
};

export default Calendar;
