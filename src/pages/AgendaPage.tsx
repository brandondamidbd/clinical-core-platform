import { useState, useMemo } from 'react';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { usePatientStore } from '@/stores/patientStore';
import { useDoctorStore } from '@/stores/doctorStore';
import { useAgendaConfigStore } from '@/stores/agendaConfigStore';
import { format, addDays, addMonths, startOfWeek, startOfMonth, eachDayOfInterval, endOfMonth, isSameDay, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight, Plus, X, Stethoscope, Search, UserPlus, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import type { AppointmentStatus } from '@/types';

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Pendiente', confirmed: 'Confirmada', attended: 'Atendida',
  cancelled: 'Cancelada', rescheduled: 'Reagendada', no_show: 'No asistió',
};

const HOURS = Array.from({ length: 13 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);

export default function AgendaPage() {
  const [view, setView] = useState<'day' | 'week' | 'month' | 'list'>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [showReschedule, setShowReschedule] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const appointments = useAppointmentStore(s => s.appointments);
  const addAppointment = useAppointmentStore(s => s.addAppointment);
  const updateAppointment = useAppointmentStore(s => s.updateAppointment);
  const setStatus = useAppointmentStore(s => s.setStatus);
  const checkOverlap = useAppointmentStore(s => s.checkOverlap);
  const patients = usePatientStore(s => s.patients).filter(p => !p.metadata.isArchived);
  const addPatient = usePatientStore(s => s.addPatient);
  const doctors = useDoctorStore(s => s.doctors).filter(d => d.isActive);
  const agendaConfig = useAgendaConfigStore(s => s.config);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayAppts = useMemo(() => appointments.filter(a => a.date === dateStr && a.status !== 'cancelled').sort((a, b) => a.startTime.localeCompare(b.startTime)), [appointments, dateStr]);

  // Patient search
  const [patientSearch, setPatientSearch] = useState('');
  const filteredPatients = useMemo(() => {
    if (!patientSearch) return patients.slice(0, 10);
    const q = patientSearch.toLowerCase();
    return patients.filter(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) || p.phone.includes(q));
  }, [patients, patientSearch]);

  const [form, setForm] = useState({
    patientId: '', doctorId: doctors[0]?.id || '', date: dateStr, startTime: '09:00',
    duration: String(agendaConfig.defaultDuration), reason: '', phone: '',
    appointmentType: agendaConfig.appointmentTypes[0]?.id || '', notes: '',
  });
  const [formError, setFormError] = useState('');
  const [showQuickPatient, setShowQuickPatient] = useState(false);
  const [quickPt, setQuickPt] = useState({ firstName: '', lastName: '', phone: '', dateOfBirth: '', sex: 'M' as const });

  // Reschedule
  const [rescheduleData, setRescheduleData] = useState({ date: '', startTime: '' });
  const [cancelReason, setCancelReason] = useState('');

  const handleSubmit = () => {
    setFormError('');
    if (!form.patientId || !form.doctorId || !form.reason) { setFormError('Completa los campos obligatorios'); return; }
    const [h, m] = form.startTime.split(':').map(Number);
    const dur = parseInt(form.duration);
    const endM = h * 60 + m + dur;
    const endTime = `${String(Math.floor(endM / 60)).padStart(2, '0')}:${String(endM % 60).padStart(2, '0')}`;
    if (checkOverlap(form.doctorId, form.date, form.startTime, endTime)) {
      setFormError('Conflicto de horario: el médico ya tiene una cita en ese horario'); return;
    }
    addAppointment({ date: form.date, startTime: form.startTime, endTime, duration: dur, patientId: form.patientId, doctorId: form.doctorId, reason: form.reason, status: 'pending', phone: form.phone, notes: form.notes });
    setShowForm(false); toast.success('Cita agendada');
    setForm(f => ({ ...f, patientId: '', reason: '', phone: '', notes: '' }));
  };

  const handleReschedule = (apptId: string) => {
    if (!rescheduleData.date || !rescheduleData.startTime) return;
    const appt = appointments.find(a => a.id === apptId);
    if (!appt) return;
    const [h, m] = rescheduleData.startTime.split(':').map(Number);
    const endM = h * 60 + m + appt.duration;
    const endTime = `${String(Math.floor(endM / 60)).padStart(2, '0')}:${String(endM % 60).padStart(2, '0')}`;
    if (checkOverlap(appt.doctorId, rescheduleData.date, rescheduleData.startTime, endTime, apptId)) {
      toast.error('Conflicto de horario'); return;
    }
    updateAppointment(apptId, { date: rescheduleData.date, startTime: rescheduleData.startTime, endTime, status: 'rescheduled' as AppointmentStatus });
    setShowReschedule(null); toast.success('Cita reagendada');
  };

  const handleCancel = (apptId: string) => {
    updateAppointment(apptId, { status: 'cancelled' as AppointmentStatus, notes: cancelReason ? `Cancelación: ${cancelReason}` : undefined });
    setShowCancelModal(null); setCancelReason(''); toast.success('Cita cancelada');
  };

  const handleQuickPatient = () => {
    if (!quickPt.firstName || !quickPt.lastName || !quickPt.phone) { toast.error('Nombre, apellido y teléfono obligatorios'); return; }
    const p = addPatient({ ...quickPt, dateOfBirth: quickPt.dateOfBirth || '2000-01-01', allergies: [] });
    setForm(f => ({ ...f, patientId: p.id, phone: p.phone }));
    setShowQuickPatient(false); toast.success('Paciente creado');
  };

  const applyAppointmentType = (typeId: string) => {
    const type = agendaConfig.appointmentTypes.find(t => t.id === typeId);
    if (type) setForm(f => ({ ...f, appointmentType: typeId, duration: String(type.duration), reason: f.reason || type.name }));
  };

  // Month view
  const monthStart = startOfMonth(selectedDate);
  const monthDays = eachDayOfInterval({ start: startOfWeek(monthStart, { weekStartsOn: 1 }), end: addDays(startOfWeek(addDays(endOfMonth(monthStart), 6), { weekStartsOn: 1 }), 6) }).slice(0, 42);

  const renderApptCard = (appt: typeof dayAppts[0], compact = false) => {
    const patient = patients.find(p => p.id === appt.patientId);
    const doctor = doctors.find(d => d.id === appt.doctorId);
    return (
      <div key={appt.id} className="flex items-center gap-2 p-2 rounded-md bg-primary/5 border-l-2 border-primary group">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium truncate">{patient ? `${patient.firstName} ${patient.lastName}` : '—'}</div>
          {!compact && <div className="meta-text truncate">{appt.startTime}–{appt.endTime} · {appt.reason} · {doctor?.fullName || '—'}</div>}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <select value={appt.status} onChange={e => {
            if (e.target.value === 'cancelled') { setShowCancelModal(appt.id); return; }
            setStatus(appt.id, e.target.value as AppointmentStatus);
          }} className="text-[10px] border rounded px-1.5 py-0.5 bg-card">
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button onClick={() => { setRescheduleData({ date: appt.date, startTime: appt.startTime }); setShowReschedule(appt.id); }} className="text-[10px] text-muted-foreground hover:text-primary" title="Reagendar">
            <RefreshCw className="w-3 h-3" />
          </button>
          {(appt.status === 'confirmed' || appt.status === 'attended') && (
            <Link to={`/consulta?patientId=${appt.patientId}&appointmentId=${appt.id}`} className="flex items-center gap-1 text-[10px] font-medium text-primary hover:underline">
              <Stethoscope className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    );
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
            {(['day', 'week', 'month', 'list'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 ${view === v ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
                {v === 'day' ? 'Día' : v === 'week' ? 'Semana' : v === 'month' ? 'Mes' : 'Lista'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setSelectedDate(d => view === 'month' ? addMonths(d, -1) : addDays(d, view === 'week' ? -7 : -1))} className="p-1.5 rounded hover:bg-muted"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setSelectedDate(new Date())} className="text-xs px-2 py-1 rounded hover:bg-muted font-medium">Hoy</button>
            <button onClick={() => setSelectedDate(d => view === 'month' ? addMonths(d, 1) : addDays(d, view === 'week' ? 7 : 1))} className="p-1.5 rounded hover:bg-muted"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <button onClick={() => { setForm(f => ({ ...f, date: dateStr })); setShowForm(true); }} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90">
            <Plus className="w-3.5 h-3.5" /> Nueva Cita
          </button>
        </div>
      </div>

      {/* Day view */}
      {view === 'day' && (
        <div className="card-clinical p-4">
          {HOURS.map(hour => {
            const hourAppts = dayAppts.filter(a => a.startTime.startsWith(hour.split(':')[0]));
            return (
              <div key={hour} className="flex border-t min-h-[48px]">
                <div className="w-16 py-2 text-xs font-mono text-muted-foreground flex-shrink-0">{hour}</div>
                <div className="flex-1 py-1 space-y-1">{hourAppts.map(a => renderApptCard(a))}</div>
              </div>
            );
          })}
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
                      <div key={a.id} className="text-[9px] bg-primary/10 text-primary rounded px-1 py-0.5 truncate">{a.startTime} {patients.find(p => p.id === a.patientId)?.firstName || ''}</div>
                    ))}
                    {dayA.length > 3 && <div className="text-[9px] text-muted-foreground">+{dayA.length - 3} más</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Month view */}
      {view === 'month' && (
        <div className="card-clinical p-4">
          <div className="grid grid-cols-7 gap-px bg-border">
            {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => (
              <div key={d} className="bg-card p-2 text-center text-[10px] font-semibold text-muted-foreground">{d}</div>
            ))}
            {monthDays.map(day => {
              const d = format(day, 'yyyy-MM-dd');
              const dayA = appointments.filter(a => a.date === d && a.status !== 'cancelled');
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, selectedDate);
              return (
                <div key={d} onClick={() => { setSelectedDate(day); setView('day'); }}
                  className={`bg-card p-1.5 min-h-[70px] cursor-pointer hover:bg-muted/50 ${!isCurrentMonth ? 'opacity-40' : ''}`}>
                  <div className={`text-[11px] font-medium ${isToday ? 'bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center' : ''}`}>{format(day, 'd')}</div>
                  {dayA.slice(0, 2).map(a => (
                    <div key={a.id} className="text-[8px] bg-primary/10 text-primary rounded px-1 py-0.5 mt-0.5 truncate">{a.startTime}</div>
                  ))}
                  {dayA.length > 2 && <div className="text-[8px] text-muted-foreground mt-0.5">+{dayA.length - 2}</div>}
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
                      <select value={appt.status} onChange={e => setStatus(appt.id, e.target.value as AppointmentStatus)} className="text-[10px] border rounded px-1.5 py-0.5 bg-card">
                        {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </td>
                    <td className="p-2 flex gap-1">
                      <button onClick={() => { setRescheduleData({ date: appt.date, startTime: appt.startTime }); setShowReschedule(appt.id); }} className="text-[10px] text-primary hover:underline">Reagendar</button>
                    </td>
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
              {/* Patient search */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium">Paciente *</label>
                  <button onClick={() => setShowQuickPatient(!showQuickPatient)} className="text-[10px] text-primary hover:underline flex items-center gap-1"><UserPlus className="w-3 h-3" /> Nuevo</button>
                </div>
                {showQuickPatient && (
                  <div className="p-3 mb-2 rounded border border-primary/20 bg-primary/5 space-y-2">
                    <div className="grid grid-cols-2 gap-1">
                      <input value={quickPt.firstName} onChange={e => setQuickPt(p => ({ ...p, firstName: e.target.value }))} placeholder="Nombre *" className="input-clinical h-8 text-xs" />
                      <input value={quickPt.lastName} onChange={e => setQuickPt(p => ({ ...p, lastName: e.target.value }))} placeholder="Apellidos *" className="input-clinical h-8 text-xs" />
                      <input value={quickPt.phone} onChange={e => setQuickPt(p => ({ ...p, phone: e.target.value }))} placeholder="Teléfono *" className="input-clinical h-8 text-xs" />
                      <input type="date" value={quickPt.dateOfBirth} onChange={e => setQuickPt(p => ({ ...p, dateOfBirth: e.target.value }))} className="input-clinical h-8 text-xs" />
                    </div>
                    <button onClick={handleQuickPatient} className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded hover:bg-primary/90">Crear</button>
                  </div>
                )}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input value={patientSearch} onChange={e => setPatientSearch(e.target.value)} placeholder="Buscar por nombre o teléfono..." className="input-clinical pl-8 h-9 text-xs" />
                </div>
                {form.patientId ? (
                  <div className="mt-1 flex items-center justify-between p-2 bg-success/10 rounded text-xs">
                    <span className="font-medium text-success">{patients.find(p => p.id === form.patientId)?.firstName} {patients.find(p => p.id === form.patientId)?.lastName}</span>
                    <button onClick={() => setForm(f => ({ ...f, patientId: '' }))} className="text-muted-foreground hover:text-destructive"><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <div className="mt-1 max-h-32 overflow-y-auto border rounded">
                    {filteredPatients.map(p => (
                      <button key={p.id} onClick={() => { setForm(f => ({ ...f, patientId: p.id, phone: p.phone })); setPatientSearch(''); }}
                        className="w-full text-left px-3 py-1.5 hover:bg-muted text-xs border-b last:border-0">
                        {p.firstName} {p.lastName} <span className="text-muted-foreground">· {p.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div><label className="text-xs font-medium mb-1 block">Médico *</label>
                <select value={form.doctorId} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))} className="input-clinical h-9">
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                </select>
              </div>
              {agendaConfig.appointmentTypes.length > 0 && (
                <div><label className="text-xs font-medium mb-1 block">Tipo de consulta</label>
                  <select value={form.appointmentType} onChange={e => applyAppointmentType(e.target.value)} className="input-clinical h-9">
                    <option value="">— Seleccionar —</option>
                    {agendaConfig.appointmentTypes.map(t => <option key={t.id} value={t.id}>{t.name} ({t.duration} min)</option>)}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                <div><label className="text-xs font-medium mb-1 block">Fecha</label><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input-clinical h-9" /></div>
                <div><label className="text-xs font-medium mb-1 block">Hora</label><input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} className="input-clinical h-9" /></div>
                <div><label className="text-xs font-medium mb-1 block">Duración</label>
                  <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} className="input-clinical h-9">
                    {[15, 20, 30, 40, 45, 60, 90].map(d => <option key={d} value={d}>{d} min</option>)}
                  </select>
                </div>
              </div>
              <div><label className="text-xs font-medium mb-1 block">Motivo / Tratamiento *</label><input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} className="input-clinical h-9" placeholder="Ej: Limpieza dental" /></div>
              <div><label className="text-xs font-medium mb-1 block">Notas internas</label><textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input-clinical min-h-[50px] py-2 text-xs" placeholder="Notas para el equipo..." /></div>
              <button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground text-xs py-2 rounded-md hover:bg-primary/90 font-medium">Agendar Cita</button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule modal */}
      {showReschedule && (
        <div className="fixed inset-0 bg-foreground/20 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-elevated p-6 max-w-sm w-full">
            <h3 className="text-sm font-semibold mb-3">Reagendar Cita</h3>
            <div className="space-y-3">
              <div><label className="text-xs font-medium mb-1 block">Nueva fecha</label><input type="date" value={rescheduleData.date} onChange={e => setRescheduleData(d => ({ ...d, date: e.target.value }))} className="input-clinical h-9" /></div>
              <div><label className="text-xs font-medium mb-1 block">Nueva hora</label><input type="time" value={rescheduleData.startTime} onChange={e => setRescheduleData(d => ({ ...d, startTime: e.target.value }))} className="input-clinical h-9" /></div>
              <div className="flex gap-2">
                <button onClick={() => setShowReschedule(null)} className="flex-1 border text-xs py-2 rounded-md hover:bg-muted">Cancelar</button>
                <button onClick={() => handleReschedule(showReschedule)} className="flex-1 bg-primary text-primary-foreground text-xs py-2 rounded-md hover:bg-primary/90">Reagendar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-foreground/20 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-elevated p-6 max-w-sm w-full">
            <h3 className="text-sm font-semibold mb-3">Cancelar Cita</h3>
            <div className="space-y-3">
              <div><label className="text-xs font-medium mb-1 block">Motivo de cancelación</label>
                <select value={cancelReason} onChange={e => setCancelReason(e.target.value)} className="input-clinical h-9">
                  <option value="">— Seleccionar motivo —</option>
                  {agendaConfig.cancellationReasons.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowCancelModal(null)} className="flex-1 border text-xs py-2 rounded-md hover:bg-muted">Volver</button>
                <button onClick={() => handleCancel(showCancelModal)} className="flex-1 bg-destructive text-destructive-foreground text-xs py-2 rounded-md hover:bg-destructive/90">Confirmar Cancelación</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
