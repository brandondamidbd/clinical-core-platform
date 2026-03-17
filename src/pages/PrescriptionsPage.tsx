import { useState } from 'react';
import { usePrescriptionStore, useMedicationStore } from '@/stores/catalogStores';
import { usePatientStore } from '@/stores/patientStore';
import { useDoctorStore } from '@/stores/doctorStore';
import { useClinicStore } from '@/stores/clinicStore';
import { Plus, X, Printer, AlertTriangle, Save } from 'lucide-react';
import { generateId } from '@/stores/helpers';
import type { PrescriptionMedication, PhysicalExam } from '@/types';
import { format } from 'date-fns';

export default function PrescriptionsPage() {
  const prescriptions = usePrescriptionStore((s) => s.prescriptions);
  const addPrescription = usePrescriptionStore((s) => s.addPrescription);
  const patients = usePatientStore((s) => s.patients.filter(p => !p.metadata.isArchived));
  const doctors = useDoctorStore((s) => s.doctors.filter(d => d.isActive));
  const medications = useMedicationStore((s) => s.medications.filter(m => m.isActive));
  const clinic = useClinicStore((s) => s.clinic);

  const [showForm, setShowForm] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || '');
  const [diagnosis, setDiagnosis] = useState('');
  const [meds, setMeds] = useState<PrescriptionMedication[]>([]);
  const [additionalInstr, setAdditionalInstr] = useState('');
  const [nextAppt, setNextAppt] = useState('');
  const [vitals, setVitals] = useState<PhysicalExam>({});

  const patient = patients.find(p => p.id === patientId);

  const addMed = () => {
    if (meds.length >= 10) return;
    setMeds(m => [...m, { id: generateId(), name: '', presentation: '', dose: '', route: 'Oral', frequency: '', duration: '', specificInstructions: '' }]);
  };

  const updateMed = (id: string, updates: Partial<PrescriptionMedication>) => {
    setMeds(m => m.map(med => med.id === id ? { ...med, ...updates } : med));
  };

  const removeMed = (id: string) => setMeds(m => m.filter(med => med.id !== id));

  const selectFromCatalog = (medId: string, rxMedId: string) => {
    const med = medications.find(m => m.id === medId);
    if (!med) return;
    updateMed(rxMedId, { name: med.name, presentation: med.presentation, dose: med.usualDose });
  };

  const handleSave = (status: 'draft' | 'issued') => {
    if (!patientId || !doctorId || meds.length === 0) return;
    const bmi = vitals.weight && vitals.height ? +(vitals.weight / ((vitals.height / 100) ** 2)).toFixed(1) : undefined;
    addPrescription({
      patientId, doctorId, date: new Date().toISOString(), status,
      vitalSigns: { ...vitals, bmi }, diagnosis, medications: meds,
      additionalInstructions: additionalInstr, nextAppointment: nextAppt,
    });
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setPatientId(''); setDiagnosis(''); setMeds([]); setAdditionalInstr(''); setNextAppt(''); setVitals({});
  };

  const previewRx = previewId ? prescriptions.find(p => p.id === previewId) : null;
  const previewPatient = previewRx ? patients.find(p => p.id === previewRx.patientId) : null;
  const previewDoctor = previewRx ? doctors.find(d => d.id === previewRx.doctorId) : null;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Recetas Médicas</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90">
          <Plus className="w-3.5 h-3.5" /> Nueva Receta
        </button>
      </div>

      {doctors.length === 0 && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-warning/10 text-warning text-xs"><AlertTriangle className="w-4 h-4" /> No hay médicos registrados. Registra al menos uno antes de emitir recetas.</div>
      )}

      {/* List */}
      <div className="card-clinical overflow-hidden">
        <table className="w-full table-clinical text-xs">
          <thead><tr className="border-b"><th className="p-2 text-left">Folio</th><th className="p-2 text-left">Fecha</th><th className="p-2 text-left">Paciente</th><th className="p-2 text-left">Médico</th><th className="p-2 text-left">Estado</th><th className="p-2"></th></tr></thead>
          <tbody>
            {prescriptions.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Sin recetas emitidas</td></tr>
            ) : [...prescriptions].reverse().map(rx => {
              const pt = patients.find(p => p.id === rx.patientId);
              const doc = doctors.find(d => d.id === rx.doctorId);
              return (
                <tr key={rx.id} className="border-b last:border-0">
                  <td className="p-2 font-mono">{rx.folio}</td>
                  <td className="p-2 font-mono">{format(new Date(rx.date), 'dd/MM/yyyy')}</td>
                  <td className="p-2 font-medium">{pt ? `${pt.firstName} ${pt.lastName}` : '—'}</td>
                  <td className="p-2">{doc?.fullName || '—'}</td>
                  <td className="p-2"><span className={`text-[10px] px-1.5 py-0.5 rounded ${rx.status === 'issued' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{rx.status === 'issued' ? 'Emitida' : 'Borrador'}</span></td>
                  <td className="p-2"><button onClick={() => setPreviewId(rx.id)} className="text-primary hover:underline">Ver</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* New prescription form */}
      {showForm && (
        <div className="fixed inset-0 bg-foreground/20 z-50 flex justify-end">
          <div className="w-full max-w-lg bg-card h-full overflow-auto shadow-elevated animate-slide-in p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">Nueva Receta</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>

            {patient?.allergies && patient.allergies.length > 0 && (
              <div className="flex items-center gap-2 p-2 rounded bg-destructive/10 text-destructive text-xs mb-3">
                <AlertTriangle className="w-3.5 h-3.5" /> Alergias: {patient.allergies.join(', ')}
              </div>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-medium mb-1 block">Paciente *</label>
                  <select value={patientId} onChange={e => setPatientId(e.target.value)} className="input-clinical h-9">
                    <option value="">Seleccionar</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-medium mb-1 block">Médico *</label>
                  <select value={doctorId} onChange={e => setDoctorId(e.target.value)} className="input-clinical h-9">
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div><label className="text-xs font-medium mb-1 block">Peso (kg)</label><input type="number" value={vitals.weight || ''} onChange={e => setVitals(v => ({ ...v, weight: parseFloat(e.target.value) || undefined }))} className="input-clinical h-9" /></div>
                <div><label className="text-xs font-medium mb-1 block">Estatura (cm)</label><input type="number" value={vitals.height || ''} onChange={e => setVitals(v => ({ ...v, height: parseFloat(e.target.value) || undefined }))} className="input-clinical h-9" /></div>
                <div><label className="text-xs font-medium mb-1 block">T/A</label><input value={vitals.bloodPressureSystolic ? `${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic}` : ''} onChange={e => { const [s, d] = e.target.value.split('/'); setVitals(v => ({ ...v, bloodPressureSystolic: parseInt(s) || undefined, bloodPressureDiastolic: parseInt(d) || undefined })); }} className="input-clinical h-9" placeholder="120/80" /></div>
                <div><label className="text-xs font-medium mb-1 block">Temp (°C)</label><input type="number" value={vitals.temperature || ''} onChange={e => setVitals(v => ({ ...v, temperature: parseFloat(e.target.value) || undefined }))} className="input-clinical h-9" /></div>
              </div>

              <div><label className="text-xs font-medium mb-1 block">Diagnóstico</label><input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className="input-clinical h-9" /></div>

              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold">Medicamentos ({meds.length}/10)</span>
                  <button onClick={addMed} disabled={meds.length >= 10} className="text-xs text-primary hover:underline disabled:opacity-50">+ Agregar</button>
                </div>
                {meds.map((med, i) => (
                  <div key={med.id} className="border rounded-md p-2 mb-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-muted-foreground">Medicamento {i + 1}</span>
                      <button onClick={() => removeMed(med.id)} className="text-destructive text-[10px] hover:underline">Quitar</button>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div>
                        <select onChange={e => selectFromCatalog(e.target.value, med.id)} className="input-clinical h-8 text-[11px] mb-1">
                          <option value="">Del catálogo...</option>
                          {medications.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                        <input value={med.name} onChange={e => updateMed(med.id, { name: e.target.value })} className="input-clinical h-8 text-[11px]" placeholder="Nombre *" />
                      </div>
                      <input value={med.presentation} onChange={e => updateMed(med.id, { presentation: e.target.value })} className="input-clinical h-8 text-[11px]" placeholder="Presentación" />
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      <input value={med.dose} onChange={e => updateMed(med.id, { dose: e.target.value })} className="input-clinical h-8 text-[11px]" placeholder="Dosis" />
                      <input value={med.route} onChange={e => updateMed(med.id, { route: e.target.value })} className="input-clinical h-8 text-[11px]" placeholder="Vía" />
                      <input value={med.frequency} onChange={e => updateMed(med.id, { frequency: e.target.value })} className="input-clinical h-8 text-[11px]" placeholder="Frecuencia" />
                      <input value={med.duration} onChange={e => updateMed(med.id, { duration: e.target.value })} className="input-clinical h-8 text-[11px]" placeholder="Duración" />
                    </div>
                  </div>
                ))}
              </div>

              <div><label className="text-xs font-medium mb-1 block">Indicaciones adicionales</label><textarea value={additionalInstr} onChange={e => setAdditionalInstr(e.target.value)} className="input-clinical min-h-[50px] py-2" /></div>
              <div><label className="text-xs font-medium mb-1 block">Próxima cita</label><input value={nextAppt} onChange={e => setNextAppt(e.target.value)} className="input-clinical h-9" placeholder="Ej: 2 semanas" /></div>

              <div className="flex gap-2">
                <button onClick={() => handleSave('draft')} className="flex-1 border text-xs py-2 rounded-md hover:bg-muted font-medium">Guardar Borrador</button>
                <button onClick={() => handleSave('issued')} className="flex-1 bg-primary text-primary-foreground text-xs py-2 rounded-md hover:bg-primary/90 font-medium">Emitir Receta</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {previewRx && (
        <div className="fixed inset-0 bg-foreground/30 z-50 flex items-center justify-center p-4">
          <div className="bg-card max-w-2xl w-full max-h-[90vh] overflow-auto rounded-xl shadow-elevated p-8" style={{ aspectRatio: '210/297' }}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-base font-bold">{clinic?.name || 'Clínica Demo'}</h2>
                <p className="meta-text">{clinic?.address}</p>
                <p className="meta-text">{clinic?.phone}</p>
              </div>
              <button onClick={() => setPreviewId(null)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="text-center mb-4"><h3 className="text-sm font-bold uppercase tracking-wider">Receta Médica</h3><p className="meta-text">Folio: {previewRx.folio}</p></div>
            <div className="grid grid-cols-2 gap-4 text-xs mb-4 border-t border-b py-3">
              <div><span className="text-muted-foreground">Paciente:</span> <span className="font-medium">{previewPatient ? `${previewPatient.firstName} ${previewPatient.lastName}` : '—'}</span></div>
              <div><span className="text-muted-foreground">Fecha:</span> <span className="font-mono">{format(new Date(previewRx.date), 'dd/MM/yyyy')}</span></div>
              <div><span className="text-muted-foreground">Médico:</span> <span className="font-medium">{previewDoctor?.fullName}</span></div>
              <div><span className="text-muted-foreground">Cédula:</span> <span className="font-mono">{previewDoctor?.licenseNumber}</span></div>
            </div>
            {previewRx.diagnosis && <div className="mb-3 text-xs"><span className="text-muted-foreground">Diagnóstico:</span> {previewRx.diagnosis}</div>}
            <div className="space-y-2 mb-4">
              {previewRx.medications.map((m, i) => (
                <div key={m.id} className="text-xs p-2 border rounded">
                  <span className="font-bold">{i + 1}. {m.name}</span> ({m.presentation}) — {m.dose}, {m.route}, {m.frequency}, {m.duration}
                  {m.specificInstructions && <div className="text-muted-foreground mt-0.5">{m.specificInstructions}</div>}
                </div>
              ))}
            </div>
            {previewRx.additionalInstructions && <div className="text-xs mb-4"><span className="font-medium">Indicaciones:</span> {previewRx.additionalInstructions}</div>}
            <div className="mt-12 flex justify-between text-xs">
              <div className="text-center"><div className="border-t w-40 pt-1">{previewDoctor?.fullName}<br/><span className="text-muted-foreground">Cédula: {previewDoctor?.licenseNumber}</span></div></div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => window.print()} className="flex items-center gap-1 text-xs text-primary hover:underline"><Printer className="w-3 h-3" /> Imprimir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
