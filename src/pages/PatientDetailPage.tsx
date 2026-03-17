import { useParams, Link } from 'react-router-dom';
import { useMemo } from 'react';
import { usePatientStore } from '@/stores/patientStore';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { useDoctorStore } from '@/stores/doctorStore';
import { useTreatmentStore, usePaymentStore, usePrescriptionStore, useBudgetStore } from '@/stores/catalogStores';
import { ArrowLeft, Calendar, FileText, CreditCard, Pill, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const patient = usePatientStore((s) => s.patients.find(p => p.id === id));
  const allAppointments = useAppointmentStore((s) => s.appointments);
  const doctors = useDoctorStore((s) => s.doctors);
  const allTreatments = useTreatmentStore((s) => s.treatments);
  const allPayments = usePaymentStore((s) => s.payments);
  const allPrescriptions = usePrescriptionStore((s) => s.prescriptions);
  const allBudgets = useBudgetStore((s) => s.budgets);
  const appointments = useMemo(() => allAppointments.filter(a => a.patientId === id), [allAppointments, id]);
  const treatments = useMemo(() => allTreatments.filter(t => t.patientId === id), [allTreatments, id]);
  const payments = useMemo(() => allPayments.filter(p => p.patientId === id), [allPayments, id]);
  const prescriptions = useMemo(() => allPrescriptions.filter(p => p.patientId === id), [allPrescriptions, id]);
  const budgets = useMemo(() => allBudgets.filter(b => b.patientId === id), [allBudgets, id]);

  if (!patient) return <div className="p-8 text-center text-muted-foreground">Paciente no encontrado</div>;

  const age = patient.dateOfBirth ? Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / 31557600000) : null;
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const primaryDoc = doctors.find(d => d.id === patient.primaryDoctorId);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Link to="/pacientes" className="p-1 rounded hover:bg-muted"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="page-title">{patient.firstName} {patient.lastName}</h1>
            <p className="meta-text">{age !== null ? `${age} años` : ''} · {patient.sex === 'M' ? 'Masculino' : patient.sex === 'F' ? 'Femenino' : 'Otro'} · {patient.phone}</p>
          </div>
        </div>
        <Link to={`/expediente?patientId=${id}`} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90">
          <FileText className="w-3.5 h-3.5" /> Expediente
        </Link>
      </div>

      {patient.allergies.length > 0 && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">
          <AlertTriangle className="w-4 h-4" /> Alergias: {patient.allergies.join(', ')}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-3">
        {/* Info */}
        <div className="card-clinical p-4">
          <h2 className="section-title">Ficha de Identificación</h2>
          <div className="space-y-2 text-xs">
            {[
              ['Correo', patient.email || '—'],
              ['Domicilio', patient.address || '—'],
              ['Estado civil', patient.maritalStatus || '—'],
              ['Tipo de sangre', patient.bloodType || '—'],
              ['Fecha nac.', patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'dd/MM/yyyy') : '—'],
              ['Médico tratante', primaryDoc?.fullName || '—'],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between"><span className="text-muted-foreground">{l}</span><span className="font-medium text-right">{v}</span></div>
            ))}
            {patient.guardianName && (
              <>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between"><span className="text-muted-foreground">Tutor</span><span className="font-medium">{patient.guardianName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Tel. tutor</span><span className="font-mono">{patient.guardianPhone || '—'}</span></div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Appointments */}
        <div className="card-clinical p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title mb-0">Citas</h2>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </div>
          {appointments.length === 0 ? <p className="meta-text text-center py-4">Sin citas registradas</p> : (
            <div className="space-y-1">
              {appointments.slice(-5).reverse().map(a => (
                <div key={a.id} className="flex justify-between text-xs p-1.5 rounded hover:bg-muted/50">
                  <span className="font-mono">{a.date} {a.startTime}</span>
                  <span className={`capitalize ${a.status === 'attended' ? 'text-success' : a.status === 'cancelled' ? 'text-destructive' : 'text-muted-foreground'}`}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Financial */}
        <div className="card-clinical p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title mb-0">Resumen Financiero</h2>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Tratamientos activos</span><span className="font-medium">{treatments.filter(t => !['completed', 'historical'].includes(t.status)).length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total pagado</span><span className="font-semibold text-success">${totalPaid.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Presupuestos</span><span className="font-medium">{budgets.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Recetas emitidas</span><span className="font-medium">{prescriptions.length}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
