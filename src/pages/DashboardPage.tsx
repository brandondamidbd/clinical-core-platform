import { useClinicStore } from '@/stores/clinicStore';
import { useDoctorStore } from '@/stores/doctorStore';
import { usePatientStore } from '@/stores/patientStore';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { useTreatmentStore, usePaymentStore } from '@/stores/catalogStores';
import { Calendar, Users, FileText, CreditCard, Clock, AlertTriangle, ArrowRight, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DashboardPage() {
  const clinic = useClinicStore((s) => s.clinic);
  const subscription = useClinicStore((s) => s.subscription);
  const onboarding = useClinicStore((s) => s.onboarding);
  const backups = useClinicStore((s) => s.backups);
  const patients = usePatientStore((s) => s.patients);
  const doctors = useDoctorStore((s) => s.doctors);
  const appointments = useAppointmentStore((s) => s.appointments);
  const treatments = useTreatmentStore((s) => s.treatments);
  const payments = usePaymentStore((s) => s.payments);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayAppts = appointments.filter(a => a.date === today && a.status !== 'cancelled');
  const pendingTreatments = treatments.filter(t => !['completed', 'paid', 'historical'].includes(t.status));
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const lastBackup = backups.length > 0 ? backups[backups.length - 1] : null;

  const alerts: { type: 'warning' | 'info'; message: string }[] = [];
  if (!onboarding.completed) alerts.push({ type: 'warning', message: 'Onboarding incompleto – configura tu clínica' });
  if (!lastBackup) alerts.push({ type: 'info', message: 'No se ha exportado ningún respaldo aún' });
  if (doctors.length === 0) alerts.push({ type: 'warning', message: 'No hay médicos registrados' });

  const stats = [
    { label: 'Citas Hoy', value: todayAppts.length, icon: Calendar, color: 'text-primary', to: '/agenda' },
    { label: 'Pacientes', value: patients.filter(p => !p.metadata.isArchived).length, icon: Users, color: 'text-success', to: '/pacientes' },
    { label: 'Tratamientos Pend.', value: pendingTreatments.length, icon: FileText, color: 'text-warning', to: '/tratamientos' },
    { label: 'Cobrado Total', value: `$${totalPaid.toLocaleString()}`, icon: CreditCard, color: 'text-primary', to: '/pagos' },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Resumen de Operación Diaria</h1>
          <p className="meta-text mt-0.5">
            {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })} · {clinic?.name || 'Clínica Demo'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium bg-primary/10 text-primary px-2 py-1 rounded">
            {subscription.planName}
          </span>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div key={i} className={`flex items-center gap-2 p-2.5 rounded-lg text-xs ${alert.type === 'warning' ? 'bg-warning/10 text-warning' : 'bg-primary/5 text-primary'}`}>
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.to} className="card-clinical p-3 hover:shadow-elevated transition-shadow group">
            <div className="flex items-center justify-between">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-2">
              <div className="text-lg font-semibold">{stat.value}</div>
              <div className="meta-text">{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Today's appointments */}
      <div className="grid lg:grid-cols-2 gap-3">
        <div className="card-clinical p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title mb-0">Citas de Hoy</h2>
            <Link to="/agenda" className="text-xs text-primary hover:underline">Ver agenda</Link>
          </div>
          {todayAppts.length === 0 ? (
            <p className="meta-text py-6 text-center">Sin citas programadas para hoy</p>
          ) : (
            <div className="space-y-2">
              {todayAppts.slice(0, 5).map((appt) => {
                const patient = patients.find(p => p.id === appt.patientId);
                const doctor = doctors.find(d => d.id === appt.doctorId);
                return (
                  <div key={appt.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <div className="font-mono text-xs text-muted-foreground w-12">{appt.startTime}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{patient ? `${patient.firstName} ${patient.lastName}` : 'Paciente'}</div>
                      <div className="meta-text truncate">{appt.reason}</div>
                    </div>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      appt.status === 'confirmed' ? 'status-confirmed' : appt.status === 'attended' ? 'status-attended' : appt.status === 'cancelled' ? 'status-cancelled' : 'status-pending'
                    }`}>
                      {appt.status === 'confirmed' ? 'Confirmada' : appt.status === 'attended' ? 'Atendida' : appt.status === 'pending' ? 'Pendiente' : appt.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="card-clinical p-4">
          <h2 className="section-title">Accesos Rápidos</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Nueva Consulta', to: '/consulta', icon: PlusCircle },
              { label: 'Nueva Cita', to: '/agenda', icon: Calendar },
              { label: 'Nuevo Paciente', to: '/pacientes', icon: Users },
              { label: 'Recibir Pago', to: '/pagos', icon: CreditCard },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className="flex items-center gap-2 p-2.5 rounded-md border hover:bg-muted/50 transition-colors text-xs font-medium"
              >
                <action.icon className="w-3.5 h-3.5 text-muted-foreground" />
                {action.label}
              </Link>
            ))}
          </div>

          {/* Recent patients */}
          <h2 className="section-title mt-4">Pacientes Recientes</h2>
          {patients.length === 0 ? (
            <p className="meta-text text-center py-4">Sin pacientes registrados</p>
          ) : (
            <div className="space-y-1">
              {patients.slice(0, 4).map(p => (
                <Link key={p.id} to={`/pacientes/${p.id}`} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-[9px] font-semibold text-muted-foreground">{p.firstName[0]}{p.lastName[0]}</span>
                  </div>
                  <div className="text-xs">{p.firstName} {p.lastName}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sync & Limits */}
      <div className="grid lg:grid-cols-3 gap-3">
        <div className="card-clinical p-4">
          <h2 className="section-title">Estado Local</h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Modo</span><span className="font-medium">Local (Offline)</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Último respaldo</span><span className="font-medium">{lastBackup ? format(new Date(lastBackup.date), 'dd/MM/yy HH:mm') : 'Ninguno'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Cambios sin respaldar</span><span className="font-medium font-mono">—</span></div>
          </div>
        </div>
        <div className="card-clinical p-4">
          <h2 className="section-title">Límites del Plan</h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Médicos</span><span className="font-medium">{doctors.filter(d=>d.isActive).length} / {subscription.limits.maxDoctors}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Usuarios</span><span className="font-medium">1 / {subscription.limits.maxUsers}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Sucursales</span><span className="font-medium">1 / {subscription.limits.maxBranches}</span></div>
          </div>
        </div>
        <div className="card-clinical p-4">
          <h2 className="section-title">Licencia / Suscripción</h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span className="font-medium">{subscription.planName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Estado</span><span className="font-medium capitalize">{subscription.status}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Vence</span><span className="font-mono">{subscription.trialEndDate ? format(new Date(subscription.trialEndDate), 'dd/MM/yyyy') : '—'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
