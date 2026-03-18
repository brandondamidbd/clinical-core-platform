import { useParams, Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { usePatientStore } from '@/stores/patientStore';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { useDoctorStore } from '@/stores/doctorStore';
import { useTreatmentStore, usePaymentStore, usePrescriptionStore, useBudgetStore, useCertificateStore, useConsentStore, useMedicalRecordStore } from '@/stores/catalogStores';
import { ArrowLeft, Calendar, FileText, CreditCard, Pill, AlertTriangle, Stethoscope, Activity, ShieldCheck, FileCheck, ClipboardList, CircleDot, Heart } from 'lucide-react';
import { format } from 'date-fns';

type DetailTab = 'overview' | 'appointments' | 'treatments' | 'prescriptions' | 'certificates' | 'consents' | 'budgets' | 'payments' | 'diagnoses' | 'notes' | 'vitals';

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const patient = usePatientStore(s => s.patients.find(p => p.id === id));
  const allAppointments = useAppointmentStore(s => s.appointments);
  const doctors = useDoctorStore(s => s.doctors);
  const allTreatments = useTreatmentStore(s => s.treatments);
  const allPayments = usePaymentStore(s => s.payments);
  const allPrescriptions = usePrescriptionStore(s => s.prescriptions);
  const allBudgets = useBudgetStore(s => s.budgets);
  const allCertificates = useCertificateStore(s => s.certificates);
  const allConsents = useConsentStore(s => s.consents);
  const allRecords = useMedicalRecordStore(s => s.records);

  const [tab, setTab] = useState<DetailTab>('overview');

  const appointments = useMemo(() => allAppointments.filter(a => a.patientId === id).sort((a, b) => `${b.date} ${b.startTime}`.localeCompare(`${a.date} ${a.startTime}`)), [allAppointments, id]);
  const treatments = useMemo(() => allTreatments.filter(t => t.patientId === id), [allTreatments, id]);
  const payments = useMemo(() => allPayments.filter(p => p.patientId === id), [allPayments, id]);
  const prescriptions = useMemo(() => allPrescriptions.filter(p => p.patientId === id), [allPrescriptions, id]);
  const budgets = useMemo(() => allBudgets.filter(b => b.patientId === id), [allBudgets, id]);
  const certificates = useMemo(() => allCertificates.filter(c => c.patientId === id), [allCertificates, id]);
  const consents = useMemo(() => allConsents.filter(c => c.patientId === id), [allConsents, id]);
  const records = useMemo(() => allRecords.filter(r => r.patientId === id), [allRecords, id]);

  if (!patient) return <div className="p-8 text-center text-muted-foreground">Paciente no encontrado</div>;

  const age = patient.dateOfBirth ? Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / 31557600000) : null;
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const primaryDoc = doctors.find(d => d.id === patient.primaryDoctorId);
  const lastRecord = records[0];
  const lastVitals = lastRecord?.physicalExam;
  const allDiagnoses = records.flatMap(r => r.diagnoses || []);
  const allNotes = records.flatMap(r => (r.notes || []).map(n => ({ ...n, patientId: r.patientId })));

  const TABS: { id: DetailTab; label: string; count?: number; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Resumen', icon: Heart },
    { id: 'appointments', label: 'Citas', count: appointments.length, icon: Calendar },
    { id: 'treatments', label: 'Tratamientos', count: treatments.length, icon: Activity },
    { id: 'prescriptions', label: 'Recetas', count: prescriptions.length, icon: Pill },
    { id: 'certificates', label: 'Certificados', count: certificates.length, icon: FileCheck },
    { id: 'consents', label: 'Consentimientos', count: consents.length, icon: ShieldCheck },
    { id: 'budgets', label: 'Presupuestos', count: budgets.length, icon: CreditCard },
    { id: 'payments', label: 'Pagos', count: payments.length, icon: CreditCard },
    { id: 'diagnoses', label: 'Diagnósticos', count: allDiagnoses.length, icon: Stethoscope },
    { id: 'notes', label: 'Notas', count: allNotes.length, icon: ClipboardList },
    { id: 'vitals', label: 'Signos Vitales', icon: Heart },
  ];

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
        <div className="flex gap-2">
          <Link to={`/expediente?patientId=${id}`} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90"><FileText className="w-3.5 h-3.5" /> Expediente</Link>
          <Link to={`/odontograma?patientId=${id}`} className="flex items-center gap-1.5 border text-xs px-3 py-1.5 rounded-md hover:bg-muted"><CircleDot className="w-3.5 h-3.5" /> Odontograma</Link>
          <Link to={`/consulta?patientId=${id}`} className="flex items-center gap-1.5 border text-xs px-3 py-1.5 rounded-md hover:bg-muted"><Stethoscope className="w-3.5 h-3.5" /> Consulta</Link>
        </div>
      </div>

      {patient.allergies.length > 0 && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">
          <AlertTriangle className="w-4 h-4" /> Alergias: {patient.allergies.join(', ')}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === t.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {t.count !== undefined && t.count > 0 && <span className="text-[10px] bg-muted rounded-full px-1.5">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-3">
          <div className="card-clinical p-4">
            <h2 className="section-title">Ficha de Identificación</h2>
            <div className="space-y-2 text-xs">
              {[
                ['Correo', patient.email || '—'], ['Domicilio', patient.address || '—'],
                ['Estado civil', patient.maritalStatus || '—'], ['Tipo de sangre', patient.bloodType || '—'],
                ['Fecha nac.', patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'dd/MM/yyyy') : '—'],
                ['Lugar de origen', patient.birthPlace || '—'], ['Escolaridad', patient.education || '—'],
                ['Ocupación', patient.occupation || '—'],
                ['Médico tratante', primaryDoc?.fullName || '—'],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between"><span className="text-muted-foreground">{l}</span><span className="font-medium text-right">{v}</span></div>
              ))}
              {patient.guardianName && (
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between"><span className="text-muted-foreground">Tutor</span><span className="font-medium">{patient.guardianName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Tel. tutor</span><span className="font-mono">{patient.guardianPhone || '—'}</span></div>
                </div>
              )}
            </div>
          </div>
          <div className="card-clinical p-4">
            <h2 className="section-title">Últimas Citas</h2>
            {appointments.length === 0 ? <p className="meta-text text-center py-4">Sin citas</p> : (
              <div className="space-y-1">
                {appointments.slice(0, 5).map(a => (
                  <div key={a.id} className="flex justify-between text-xs p-1.5 rounded hover:bg-muted/50">
                    <span className="font-mono">{a.date} {a.startTime}</span>
                    <span className={`capitalize ${a.status === 'attended' ? 'text-success' : a.status === 'cancelled' ? 'text-destructive' : 'text-muted-foreground'}`}>{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="card-clinical p-4">
            <h2 className="section-title">Resumen</h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Tratamientos activos</span><span className="font-medium">{treatments.filter(t => !['completed', 'paid', 'historical'].includes(t.status)).length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total pagado</span><span className="font-semibold text-success">${totalPaid.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Recetas</span><span className="font-medium">{prescriptions.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Certificados</span><span className="font-medium">{certificates.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Consentimientos</span><span className="font-medium">{consents.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Presupuestos</span><span className="font-medium">{budgets.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Diagnósticos</span><span className="font-medium">{allDiagnoses.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Consultas</span><span className="font-medium">{records.length}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* History tabs */}
      {tab === 'appointments' && (
        <div className="card-clinical overflow-hidden">
          <table className="w-full table-clinical text-xs">
            <thead><tr className="border-b"><th className="p-2 text-left">Fecha</th><th className="p-2 text-left">Hora</th><th className="p-2 text-left">Motivo</th><th className="p-2 text-left">Médico</th><th className="p-2 text-left">Estado</th></tr></thead>
            <tbody>
              {appointments.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Sin citas</td></tr> :
                appointments.map(a => (
                  <tr key={a.id} className="border-b last:border-0">
                    <td className="p-2 font-mono">{a.date}</td>
                    <td className="p-2 font-mono">{a.startTime}–{a.endTime}</td>
                    <td className="p-2">{a.reason}</td>
                    <td className="p-2 text-muted-foreground">{doctors.find(d => d.id === a.doctorId)?.fullName || '—'}</td>
                    <td className="p-2 capitalize">{a.status}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'treatments' && (
        <div className="card-clinical overflow-hidden">
          <table className="w-full table-clinical text-xs">
            <thead><tr className="border-b"><th className="p-2 text-left">Tratamiento</th><th className="p-2 text-left">Médico</th><th className="p-2 text-right">Precio</th><th className="p-2 text-left">Pieza</th><th className="p-2 text-left">Estado</th></tr></thead>
            <tbody>
              {treatments.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Sin tratamientos</td></tr> :
                treatments.map(t => (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="p-2 font-medium">{t.description}</td>
                    <td className="p-2 text-muted-foreground">{doctors.find(d => d.id === t.doctorId)?.fullName || '—'}</td>
                    <td className="p-2 text-right font-mono">${t.price.toLocaleString()}</td>
                    <td className="p-2">{t.toothNumber || '—'}</td>
                    <td className="p-2"><span className={`text-[10px] px-1.5 py-0.5 rounded ${t.status === 'completed' || t.status === 'paid' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{t.status}</span></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'prescriptions' && (
        <div className="card-clinical overflow-hidden">
          <table className="w-full table-clinical text-xs">
            <thead><tr className="border-b"><th className="p-2 text-left">Folio</th><th className="p-2 text-left">Fecha</th><th className="p-2 text-left">Diagnóstico</th><th className="p-2 text-left">Medicamentos</th><th className="p-2 text-left">Estado</th></tr></thead>
            <tbody>
              {prescriptions.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Sin recetas</td></tr> :
                [...prescriptions].reverse().map(rx => (
                  <tr key={rx.id} className="border-b last:border-0">
                    <td className="p-2 font-mono">{rx.folio}</td>
                    <td className="p-2 font-mono">{format(new Date(rx.date), 'dd/MM/yyyy')}</td>
                    <td className="p-2">{rx.diagnosis || '—'}</td>
                    <td className="p-2 text-muted-foreground">{rx.medications.map(m => m.name).join(', ')}</td>
                    <td className="p-2"><span className={`text-[10px] px-1.5 py-0.5 rounded ${rx.status === 'issued' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{rx.status === 'issued' ? 'Emitida' : 'Borrador'}</span></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'certificates' && (
        <div className="card-clinical overflow-hidden">
          <table className="w-full table-clinical text-xs">
            <thead><tr className="border-b"><th className="p-2 text-left">Folio</th><th className="p-2 text-left">Fecha</th><th className="p-2 text-left">Procedimiento</th><th className="p-2 text-right">Reposo</th></tr></thead>
            <tbody>
              {certificates.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Sin certificados</td></tr> :
                [...certificates].reverse().map(c => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="p-2 font-mono">{c.folio}</td><td className="p-2 font-mono">{c.date}</td><td className="p-2">{c.procedure || '—'}</td><td className="p-2 text-right">{c.restDays > 0 ? `${c.restDays} días` : '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'consents' && (
        <div className="card-clinical overflow-hidden">
          <table className="w-full table-clinical text-xs">
            <thead><tr className="border-b"><th className="p-2 text-left">Fecha</th><th className="p-2 text-left">Procedimiento</th><th className="p-2 text-left">Médico</th></tr></thead>
            <tbody>
              {consents.length === 0 ? <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">Sin consentimientos</td></tr> :
                [...consents].reverse().map(c => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="p-2 font-mono">{c.date}</td><td className="p-2">{c.procedure}</td><td className="p-2 text-muted-foreground">{doctors.find(d => d.id === c.doctorId)?.fullName || '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'budgets' && (
        <div className="card-clinical overflow-hidden">
          <table className="w-full table-clinical text-xs">
            <thead><tr className="border-b"><th className="p-2 text-left">Folio</th><th className="p-2 text-left">Fecha</th><th className="p-2 text-right">Total</th><th className="p-2 text-left">Estado</th></tr></thead>
            <tbody>
              {budgets.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Sin presupuestos</td></tr> :
                [...budgets].reverse().map(b => (
                  <tr key={b.id} className="border-b last:border-0">
                    <td className="p-2 font-mono">{b.folio}</td><td className="p-2 font-mono">{format(new Date(b.date), 'dd/MM/yyyy')}</td><td className="p-2 text-right font-mono">${b.total.toLocaleString()}</td><td className="p-2 capitalize">{b.status}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'payments' && (
        <div className="card-clinical overflow-hidden">
          <table className="w-full table-clinical text-xs">
            <thead><tr className="border-b"><th className="p-2 text-left">Fecha</th><th className="p-2 text-right">Monto</th><th className="p-2 text-left">Método</th><th className="p-2 text-left">Notas</th></tr></thead>
            <tbody>
              {payments.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Sin pagos</td></tr> :
                [...payments].reverse().map(p => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="p-2 font-mono">{format(new Date(p.date), 'dd/MM/yy')}</td>
                    <td className="p-2 text-right font-mono font-semibold text-success">${p.amount.toLocaleString()}</td>
                    <td className="p-2 capitalize">{p.method === 'cash' ? 'Efectivo' : p.method === 'card' ? 'Tarjeta' : p.method === 'transfer' ? 'Transferencia' : 'Otro'}</td>
                    <td className="p-2 text-muted-foreground">{p.notes || '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          {payments.length > 0 && (
            <div className="p-3 border-t bg-muted/50 text-xs font-semibold flex justify-between">
              <span>Total pagado</span><span className="font-mono">${totalPaid.toLocaleString()}</span>
            </div>
          )}
        </div>
      )}

      {tab === 'diagnoses' && (
        <div className="card-clinical overflow-hidden">
          <table className="w-full table-clinical text-xs">
            <thead><tr className="border-b"><th className="p-2 text-left">Diagnóstico</th><th className="p-2 text-left">CIE-10</th><th className="p-2 text-left">Fecha</th><th className="p-2 text-center">Primario</th></tr></thead>
            <tbody>
              {allDiagnoses.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Sin diagnósticos</td></tr> :
                allDiagnoses.map(d => (
                  <tr key={d.id} className="border-b last:border-0">
                    <td className="p-2 font-medium">{d.name}</td><td className="p-2 font-mono text-muted-foreground">{d.code || '—'}</td><td className="p-2 font-mono">{d.date}</td>
                    <td className="p-2 text-center">{d.isPrimary ? <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Sí</span> : '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'notes' && (
        <div className="space-y-2">
          {allNotes.length === 0 ? <div className="card-clinical p-8 text-center text-muted-foreground text-sm">Sin notas clínicas</div> :
            [...allNotes].sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)).map(n => (
              <div key={n.id} className="card-clinical p-4 text-xs">
                <div className="flex justify-between mb-1"><span className="font-medium">{n.authorName}</span><span className="font-mono text-muted-foreground">{n.date} {n.time}</span></div>
                <p className="whitespace-pre-wrap">{n.content}</p>
              </div>
            ))}
        </div>
      )}

      {tab === 'vitals' && (
        <div className="card-clinical p-4">
          <h2 className="section-title">Últimos Signos Vitales</h2>
          {lastVitals && Object.keys(lastVitals).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {lastVitals.weight && <div className="p-3 bg-muted rounded-md"><span className="text-muted-foreground block">Peso</span><span className="font-semibold text-sm">{lastVitals.weight} kg</span></div>}
              {lastVitals.height && <div className="p-3 bg-muted rounded-md"><span className="text-muted-foreground block">Estatura</span><span className="font-semibold text-sm">{lastVitals.height} cm</span></div>}
              {lastVitals.bmi && <div className="p-3 bg-muted rounded-md"><span className="text-muted-foreground block">IMC</span><span className="font-semibold text-sm">{lastVitals.bmi}</span></div>}
              {lastVitals.heartRate && <div className="p-3 bg-muted rounded-md"><span className="text-muted-foreground block">FC</span><span className="font-semibold text-sm">{lastVitals.heartRate} lpm</span></div>}
              {lastVitals.bloodPressureSystolic && <div className="p-3 bg-muted rounded-md"><span className="text-muted-foreground block">T/A</span><span className="font-semibold text-sm">{lastVitals.bloodPressureSystolic}/{lastVitals.bloodPressureDiastolic}</span></div>}
              {lastVitals.temperature && <div className="p-3 bg-muted rounded-md"><span className="text-muted-foreground block">Temp</span><span className="font-semibold text-sm">{lastVitals.temperature} °C</span></div>}
              {lastVitals.oxygenSaturation && <div className="p-3 bg-muted rounded-md"><span className="text-muted-foreground block">SpO₂</span><span className="font-semibold text-sm">{lastVitals.oxygenSaturation}%</span></div>}
              {lastVitals.respiratoryRate && <div className="p-3 bg-muted rounded-md"><span className="text-muted-foreground block">FR</span><span className="font-semibold text-sm">{lastVitals.respiratoryRate} rpm</span></div>}
            </div>
          ) : <p className="meta-text text-center py-6">Sin signos vitales registrados. Captura desde Nueva Consulta o Expediente.</p>}
          <p className="meta-text mt-2">Registrado: {lastRecord ? format(new Date(lastRecord.metadata.updatedAt), 'dd/MM/yyyy HH:mm') : '—'}</p>
        </div>
      )}
    </div>
  );
}
