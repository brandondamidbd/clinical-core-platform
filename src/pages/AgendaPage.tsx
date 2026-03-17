import { useState } from 'react';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { usePatientStore } from '@/stores/patientStore';
import { useDoctorStore } from '@/stores/doctorStore';
import { format, addDays, startOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, X } from 'lucide-react';
import type { AppointmentStatus } from '@/types';

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Pendiente', confirmed: 'Confirmada', attended: 'Atendida',
  cancelled: 'Cancelada', rescheduled: 'Reagendada', no_show: 'No asistió',
};

const HOURS = Array.from({ length: 13 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);

export default function AgendaPage() {
  const [view, setView] = useState<'day' | 'week' | 'list'>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const appointments = useAppointmentStore((s) => s.appointments);
  const addAppointment = useAppointmentStore((s) => s.addAppointment);
  const setStatus = useAppointmentStore((s) => s.setStatus);
  const checkOverlap = useAppointmentStore((s) => s.checkOverlap);
  const patients = usePatientStore((s) => s.patients);
  const doctors = useDoctorStore((s) => s.doctors);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayAppts = appointments.filter(a => a.date === dateStr && a.status !== 'cancelled').sort((a, b) => a.startTime.localeCompare(b.startTime));

  const [form, setForm] = useState({ patientId: '', doctorId: doctors[0]?.id || '', date: dateStr, startTime: '09:00', duration: '30', reason: '', phone: '' });
  const [formError, setFormError] = useState('');

  const handleSubmit = () => {
    setFormError('');
    if (!form.patientId || !form.doctorId || !form.reason) { setFormError('Completa los campos obligatorios'); return; }
    const [h, m] = form.startTime.split(':').map(Number);
    const dur = parseInt(form.duration);
    const endM = h * 60 + m + dur;
    const endTime = `${String(Math.floor(endM / 60)).padStart(2, '0')}:${String(endM % 60).padStart(2, '0')}`;
    if (checkOverlap(form.doctorId, form.date, form.startTime, endTime)) {
      setFormError('Conflicto de horario: el médico ya tiene una cita en ese horario');
      return;
    }
    addAppointment({ date: form.date, startTime: form.startTime, endTime, duration: dur, patientId: form.patientId, doctorId: form.doctorId, reason: form.reason, status: 'pending', phone: form.phone });
    setShowForm(false);
    setForm({ patientId: '', doctorId: doctors[0]?.id || '', date: dateStr, startTime: '09:00', duration: '30', reason: '', phone: '' });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Agenda</h1>
          <p className="meta-text">{format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border text-xs">
            {(['day', 'week', 'list'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 ${view === v ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
                {v === 'day' ? 'Día' : v === 'week' ? 'Semana' : 'Lista'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setSelectedDate(d => addDays(d, -1))} className="p-1.5 rounded hover:bg-muted"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setSelectedDate(new Date())} className="text-xs px-2 py-1 rounded hover:bg-muted font-medium">Hoy</button>
            <button onClick={() => setSelectedDate(d => addDays(d, 1))} className="p-1.5 rounded hover:bg-muted"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <button onClick={() => { setForm(f => ({ ...f, date: dateStr })); setShowForm(true); }} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90">
            <Plus className="w-3.5 h-3.5" /> Nueva Cita
          </button>
        </div>
      </div>

      {/* Day view */}
      {view === 'day' && (
        <div className="card-clinical p-4">
          <div className="space-y-0">
            {HOURS.map(hour => {
              const hourAppts = dayAppts.filter(a => a.startTime.startsWith(hour.split(':')[0]));
              return (
                <div key={hour} className="flex border-t min-h-[48px]">
                  <div className="w-16 py-2 text-xs font-mono text-muted-foreground flex-shrink-0">{hour}</div>
                  <div className="flex-1 py-1 space-y-1">
                    {hourAppts.map(appt => {
                      const patient = patients.find(p => p.id === appt.patientId);
                      const doctor = doctors.find(d => d.id === appt.doctorId);
                      return (
                        <div key={appt.id} className="flex items-center gap-2 p-2 rounded-md bg-primary/5 border-l-2 border-primary group">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium">{patient ? `${patient.firstName} ${patient.lastName}` : '—'}</div>
                            <div className="meta-text">{appt.startTime}–{appt.endTime} · {appt.reason} · {doctor?.fullName || '—'}</div>
                          </div>
                          <select
                            value={appt.status}
                            onChange={(e) => setStatus(appt.id, e.target.value as AppointmentStatus)}
                            className="text-[10px] border rounded px-1.5 py-0.5 bg-card"
                          >
                            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week view */}
      {view === 'week' && (
        <div className="card-clinical p-4">
          <div className="grid grid-cols-7 gap-2">
            {eachDayOfInterval({ start: startOfWeek(selectedDate, { weekStartsOn: 1 }), end: addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), 6) }).map(day => {
              const d = format(day, 'yyyy-MM-dd');
              const dayA = appointments.filter(a => a.date === d && a.status !== 'cancelled');
              const isToday = isSameDay(day, new Date());
              return (
                <div key={d} className={`p-2 rounded-md border cursor-pointer hover:bg-muted/50 ${isToday ? 'border-primary bg-primary/5' : ''}`} onClick={() => { setSelectedDate(day); setView('day'); }}>
                  <div className="text-[10px] font-medium text-muted-foreground">{format(day, 'EEE', { locale: es })}</div>
                  <div className={`text-sm font-semibold ${isToday ? 'text-primary' : ''}`}>{format(day, 'd')}</div>
                  <div className="mt-1 space-y-0.5">
                    {dayA.slice(0, 3).map(a => (
                      <div key={a.id} className="text-[9px] bg-primary/10 text-primary rounded px-1 py-0.5 truncate">{a.startTime}</div>
                    ))}
                    {dayA.length > 3 && <div className="text-[9px] text-muted-foreground">+{dayA.length - 3} más</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="card-clinical overflow-hidden">
          <table className="w-full table-clinical text-xs">
            <thead><tr className="border-b"><th className="p-2 text-left">Hora</th><th className="p-2 text-left">Paciente</th><th className="p-2 text-left">Motivo</th><th className="p-2 text-left">Médico</th><th className="p-2 text-left">Estado</th><th className="p-2"></th></tr></thead>
            <tbody>
              {dayAppts.map(appt => {
                const patient = patients.find(p => p.id === appt.patientId);
                const doctor = doctors.find(d => d.id === appt.doctorId);
                return (
                  <tr key={appt.id} className="border-b last:border-0">
                    <td className="p-2 font-mono">{appt.startTime}–{appt.endTime}</td>
                    <td className="p-2 font-medium">{patient ? `${patient.firstName} ${patient.lastName}` : '—'}</td>
                    <td className="p-2 text-muted-foreground">{appt.reason}</td>
                    <td className="p-2">{doctor?.fullName || '—'}</td>
                    <td className="p-2">
                      <select value={appt.status} onChange={(e) => setStatus(appt.id, e.target.value as AppointmentStatus)} className="text-[10px] border rounded px-1.5 py-0.5 bg-card">
                        {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </td>
                    <td className="p-2"></td>
                  </tr>
                );
              })}
              {dayAppts.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Sin citas para esta fecha</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* New appointment form */}
      {showForm && (
        <div className="fixed inset-0 bg-foreground/20 z-50 flex justify-end">
          <div className="w-full max-w-md bg-card h-full overflow-auto shadow-elevated animate-slide-in p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">Nueva Cita</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            {formError && <div className="text-xs text-destructive bg-destructive/10 p-2 rounded mb-3">{formError}</div>}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Paciente *</label>
                <select value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))} className="input-clinical h-9">
                  <option value="">Seleccionar paciente</option>
                  {patients.filter(p => !p.metadata.isArchived).map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Médico *</label>
                <select value={form.doctorId} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))} className="input-clinical h-9">
                  {doctors.filter(d => d.isActive).map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium mb-1 block">Fecha</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input-clinical h-9" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Hora</label>
                  <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} className="input-clinical h-9" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium mb-1 block">Duración (min)</label>
                  <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} className="input-clinical h-9">
                    {[15, 30, 45, 60, 90].map(d => <option key={d} value={d}>{d} min</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Teléfono</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-clinical h-9" placeholder="Opcional" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Motivo / Tratamiento *</label>
                <input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} className="input-clinical h-9" placeholder="Ej: Limpieza dental" />
              </div>
              <button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground text-xs py-2 rounded-md hover:bg-primary/90 font-medium">
                Agendar Cita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
