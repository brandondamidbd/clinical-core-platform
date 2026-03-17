import { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePatientStore } from '@/stores/patientStore';
import { useDoctorStore } from '@/stores/doctorStore';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { useMedicalRecordStore, useTreatmentStore, usePrescriptionStore, usePaymentStore } from '@/stores/catalogStores';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Search, User, Heart, FileText, Stethoscope, Activity, Pill, CreditCard,
  Check, ChevronRight, X, Plus, Save, CheckCircle2
} from 'lucide-react';
import { generateId } from '@/stores/helpers';
import { toast } from 'sonner';

type ConsultaStep = 'vitals' | 'motive' | 'notes' | 'diagnosis' | 'treatment' | 'prescription' | 'payment';

const STEPS: { key: ConsultaStep; label: string; icon: React.ElementType }[] = [
  { key: 'vitals', label: 'Signos Vitales', icon: Heart },
  { key: 'motive', label: 'Motivo de Consulta', icon: FileText },
  { key: 'notes', label: 'Nota Clínica', icon: FileText },
  { key: 'diagnosis', label: 'Diagnóstico', icon: Stethoscope },
  { key: 'treatment', label: 'Tratamiento', icon: Activity },
  { key: 'prescription', label: 'Receta', icon: Pill },
  { key: 'payment', label: 'Pago', icon: CreditCard },
];

export default function ConsultaPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const allPatients = usePatientStore((s) => s.patients);
  const patients = useMemo(() => allPatients.filter(p => !p.metadata.isArchived), [allPatients]);
  const doctors = useDoctorStore((s) => s.doctors);
  const activeDoctors = useMemo(() => doctors.filter(d => d.isActive), [doctors]);
  const setAppointmentStatus = useAppointmentStore((s) => s.setStatus);
  const addRecord = useMedicalRecordStore((s) => s.addRecord);
  const addTreatment = useTreatmentStore((s) => s.addTreatment);
  const addPrescription = usePrescriptionStore((s) => s.addPrescription);
  const addPayment = usePaymentStore((s) => s.addPayment);

  const prePatientId = searchParams.get('patientId') || '';
  const preAppointmentId = searchParams.get('appointmentId') || '';

  const [selectedPatientId, setSelectedPatientId] = useState(prePatientId);
  const [selectedDoctorId, setSelectedDoctorId] = useState(activeDoctors[0]?.id || '');
  const [patientSearch, setPatientSearch] = useState('');
  const [activeStep, setActiveStep] = useState<ConsultaStep>('vitals');
  const [completedSteps, setCompletedSteps] = useState<Set<ConsultaStep>>(new Set());

  // Form states
  const [vitals, setVitals] = useState({
    weight: '', height: '', heartRate: '', bloodPressureSystolic: '', bloodPressureDiastolic: '',
    temperature: '', oxygenSaturation: '', respiratoryRate: ''
  });
  const [motive, setMotive] = useState('');
  const [clinicalNote, setClinicalNote] = useState('');
  const [diagnosis, setDiagnosis] = useState({ name: '', code: '', description: '', isPrimary: true });
  const [treatment, setTreatment] = useState({ description: '', price: '', observations: '', toothNumber: '' });
  const [prescription, setPrescription] = useState({
    diagnosis: '', additionalInstructions: '',
    medications: [{ name: '', presentation: '', dose: '', route: 'Oral', frequency: '', duration: '', specificInstructions: '' }]
  });
  const [payment, setPayment] = useState({ amount: '', method: 'cash' as 'cash' | 'card' | 'transfer' | 'other', notes: '' });

  const selectedPatient = useMemo(() => patients.find(p => p.id === selectedPatientId), [patients, selectedPatientId]);
  const selectedDoctor = useMemo(() => doctors.find(d => d.id === selectedDoctorId), [doctors, selectedDoctorId]);
  const filteredPatients = useMemo(() => {
    if (!patientSearch) return patients.slice(0, 8);
    const q = patientSearch.toLowerCase();
    return patients.filter(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) || p.phone.includes(q));
  }, [patients, patientSearch]);

  const markStepDone = useCallback((step: ConsultaStep) => {
    setCompletedSteps(prev => new Set([...prev, step]));
    toast.success(`${STEPS.find(s => s.key === step)?.label} guardado`);
  }, []);

  const handleSaveVitals = () => {
    markStepDone('vitals');
    const nextStep = STEPS[STEPS.findIndex(s => s.key === 'vitals') + 1];
    if (nextStep) setActiveStep(nextStep.key);
  };

  const handleSaveMotive = () => {
    markStepDone('motive');
    setActiveStep('notes');
  };

  const handleSaveNote = () => {
    markStepDone('notes');
    setActiveStep('diagnosis');
  };

  const handleSaveDiagnosis = () => {
    markStepDone('diagnosis');
    setActiveStep('treatment');
  };

  const handleSaveTreatment = () => {
    if (!treatment.description) { toast.error('Describe el tratamiento'); return; }
    addTreatment({
      patientId: selectedPatientId,
      doctorId: selectedDoctorId,
      description: treatment.description,
      price: parseFloat(treatment.price) || 0,
      observations: treatment.observations,
      status: 'in_progress',
      toothNumber: treatment.toothNumber ? parseInt(treatment.toothNumber) : undefined,
    });
    markStepDone('treatment');
    setActiveStep('prescription');
  };

  const handleSavePrescription = () => {
    const meds = prescription.medications.filter(m => m.name);
    if (meds.length === 0) { toast.error('Agrega al menos un medicamento'); return; }
    addPrescription({
      patientId: selectedPatientId,
      doctorId: selectedDoctorId,
      date: format(new Date(), 'yyyy-MM-dd'),
      vitalSigns: {
        weight: parseFloat(vitals.weight) || undefined,
        height: parseFloat(vitals.height) || undefined,
        heartRate: parseFloat(vitals.heartRate) || undefined,
        bloodPressureSystolic: parseFloat(vitals.bloodPressureSystolic) || undefined,
        bloodPressureDiastolic: parseFloat(vitals.bloodPressureDiastolic) || undefined,
        temperature: parseFloat(vitals.temperature) || undefined,
        oxygenSaturation: parseFloat(vitals.oxygenSaturation) || undefined,
        respiratoryRate: parseFloat(vitals.respiratoryRate) || undefined,
      },
      diagnosis: prescription.diagnosis || diagnosis.name,
      medications: meds.map(m => ({ ...m, id: generateId() })),
      additionalInstructions: prescription.additionalInstructions,
      status: 'issued',
    });
    markStepDone('prescription');
    setActiveStep('payment');
  };

  const handleSavePayment = () => {
    if (!payment.amount || parseFloat(payment.amount) <= 0) { toast.error('Ingresa un monto válido'); return; }
    addPayment({
      patientId: selectedPatientId,
      amount: parseFloat(payment.amount),
      method: payment.method,
      type: 'full',
      notes: payment.notes,
      date: format(new Date(), 'yyyy-MM-dd'),
    });
    markStepDone('payment');
  };

  const handleFinalize = () => {
    // Save medical record
    addRecord({
      patientId: selectedPatientId,
      doctorId: selectedDoctorId,
      familyHistory: [],
      personalNonPathHistory: {},
      personalPathHistory: {},
      currentCondition: { chiefComplaint: motive },
      systemsReview: {},
      physicalExam: {
        weight: parseFloat(vitals.weight) || undefined,
        height: parseFloat(vitals.height) || undefined,
        heartRate: parseFloat(vitals.heartRate) || undefined,
        bloodPressureSystolic: parseFloat(vitals.bloodPressureSystolic) || undefined,
        bloodPressureDiastolic: parseFloat(vitals.bloodPressureDiastolic) || undefined,
        temperature: parseFloat(vitals.temperature) || undefined,
        oxygenSaturation: parseFloat(vitals.oxygenSaturation) || undefined,
        respiratoryRate: parseFloat(vitals.respiratoryRate) || undefined,
      },
      auxiliaryStudies: [],
      diagnoses: diagnosis.name ? [{ id: generateId(), ...diagnosis, date: format(new Date(), 'yyyy-MM-dd') }] : [],
      treatments: [],
      notes: clinicalNote ? [{ id: generateId(), date: format(new Date(), 'yyyy-MM-dd'), time: format(new Date(), 'HH:mm'), authorId: selectedDoctorId, authorName: selectedDoctor?.fullName || '', content: clinicalNote, isLocked: false }] : [],
    });

    // Mark appointment as attended if came from agenda
    if (preAppointmentId) {
      setAppointmentStatus(preAppointmentId, 'attended');
    }

    toast.success('Consulta finalizada y guardada');
    navigate('/');
  };

  const addMedication = () => {
    setPrescription(p => ({
      ...p,
      medications: [...p.medications, { name: '', presentation: '', dose: '', route: 'Oral', frequency: '', duration: '', specificInstructions: '' }]
    }));
  };

  const updateMedication = (index: number, field: string, value: string) => {
    setPrescription(p => ({
      ...p,
      medications: p.medications.map((m, i) => i === index ? { ...m, [field]: value } : m)
    }));
  };

  const removeMedication = (index: number) => {
    setPrescription(p => ({ ...p, medications: p.medications.filter((_, i) => i !== index) }));
  };

  // Patient selection screen
  if (!selectedPatientId) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">Nueva Consulta</h1>
            <p className="meta-text">{format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          <div className="card-clinical p-6">
            <h2 className="section-title flex items-center gap-2"><User className="w-4 h-4" /> Seleccionar Paciente</h2>
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={patientSearch}
                onChange={e => setPatientSearch(e.target.value)}
                placeholder="Buscar por nombre o teléfono..."
                className="input-clinical pl-10"
                autoFocus
              />
            </div>
            {filteredPatients.length === 0 ? (
              <p className="meta-text text-center py-8">No se encontraron pacientes. Regístralos primero en la sección de Pacientes.</p>
            ) : (
              <div className="space-y-1">
                {filteredPatients.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatientId(p.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-primary">{p.firstName[0]}{p.lastName[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{p.firstName} {p.lastName}</div>
                      <div className="meta-text">{p.phone} {p.email ? `· ${p.email}` : ''}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {activeDoctors.length > 1 && (
            <div className="card-clinical p-6">
              <h2 className="section-title flex items-center gap-2"><Stethoscope className="w-4 h-4" /> Médico Tratante</h2>
              <select
                value={selectedDoctorId}
                onChange={e => setSelectedDoctorId(e.target.value)}
                className="input-clinical"
              >
                {activeDoctors.map(d => <option key={d.id} value={d.id}>{d.fullName} — {d.specialty}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Consultation flow
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-4">
          <button onClick={() => { setSelectedPatientId(''); setCompletedSteps(new Set()); setActiveStep('vitals'); }} className="p-1.5 rounded-md hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
          <div>
            <h1 className="page-title">Consulta en Curso</h1>
            <p className="meta-text">
              {selectedPatient?.firstName} {selectedPatient?.lastName} · {selectedDoctor?.fullName} · {format(new Date(), "d MMM yyyy HH:mm", { locale: es })}
            </p>
          </div>
        </div>
        <button
          onClick={handleFinalize}
          className="flex items-center gap-2 bg-success text-success-foreground text-xs px-4 py-2 rounded-md hover:bg-success/90 font-medium"
        >
          <CheckCircle2 className="w-4 h-4" /> Finalizar Consulta
        </button>
      </div>

      <div className="flex gap-4">
        {/* Step sidebar */}
        <div className="w-52 flex-shrink-0 space-y-1">
          {STEPS.map((step) => {
            const isActive = activeStep === step.key;
            const isDone = completedSteps.has(step.key);
            return (
              <button
                key={step.key}
                onClick={() => setActiveStep(step.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                  isActive ? 'bg-primary text-primary-foreground' : isDone ? 'bg-success/10 text-success hover:bg-success/20' : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 card-clinical p-6">
          {/* Vitals */}
          {activeStep === 'vitals' && (
            <div>
              <h2 className="section-title flex items-center gap-2"><Heart className="w-4 h-4 text-destructive" /> Signos Vitales</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: 'weight', label: 'Peso (kg)', placeholder: '70' },
                  { key: 'height', label: 'Talla (cm)', placeholder: '170' },
                  { key: 'heartRate', label: 'FC (lpm)', placeholder: '72' },
                  { key: 'respiratoryRate', label: 'FR (rpm)', placeholder: '18' },
                  { key: 'bloodPressureSystolic', label: 'PA Sistólica', placeholder: '120' },
                  { key: 'bloodPressureDiastolic', label: 'PA Diastólica', placeholder: '80' },
                  { key: 'temperature', label: 'Temp (°C)', placeholder: '36.5' },
                  { key: 'oxygenSaturation', label: 'SpO₂ (%)', placeholder: '98' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-xs font-medium mb-1 block text-muted-foreground">{field.label}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={vitals[field.key as keyof typeof vitals]}
                      onChange={e => setVitals(v => ({ ...v, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="input-clinical"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={handleSaveVitals} className="flex items-center gap-2 bg-primary text-primary-foreground text-xs px-4 py-2 rounded-md hover:bg-primary/90 font-medium">
                  <Save className="w-3.5 h-3.5" /> Guardar y Continuar
                </button>
              </div>
            </div>
          )}

          {/* Motive */}
          {activeStep === 'motive' && (
            <div>
              <h2 className="section-title">Motivo de Consulta</h2>
              <textarea
                value={motive}
                onChange={e => setMotive(e.target.value)}
                placeholder="Describa el motivo principal de la consulta del paciente..."
                className="input-clinical min-h-[120px] resize-y"
                rows={5}
              />
              <div className="flex justify-end mt-4">
                <button onClick={handleSaveMotive} className="flex items-center gap-2 bg-primary text-primary-foreground text-xs px-4 py-2 rounded-md hover:bg-primary/90 font-medium">
                  <Save className="w-3.5 h-3.5" /> Guardar y Continuar
                </button>
              </div>
            </div>
          )}

          {/* Clinical Note */}
          {activeStep === 'notes' && (
            <div>
              <h2 className="section-title">Nota Clínica</h2>
              <textarea
                value={clinicalNote}
                onChange={e => setClinicalNote(e.target.value)}
                placeholder="Exploración física, hallazgos relevantes, evolución del padecimiento..."
                className="input-clinical min-h-[200px] resize-y"
                rows={8}
              />
              <div className="flex justify-end mt-4">
                <button onClick={handleSaveNote} className="flex items-center gap-2 bg-primary text-primary-foreground text-xs px-4 py-2 rounded-md hover:bg-primary/90 font-medium">
                  <Save className="w-3.5 h-3.5" /> Guardar y Continuar
                </button>
              </div>
            </div>
          )}

          {/* Diagnosis */}
          {activeStep === 'diagnosis' && (
            <div>
              <h2 className="section-title flex items-center gap-2"><Stethoscope className="w-4 h-4" /> Diagnóstico</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">Diagnóstico *</label>
                  <input
                    value={diagnosis.name}
                    onChange={e => setDiagnosis(d => ({ ...d, name: e.target.value }))}
                    placeholder="Ej: Caries dental, Gingivitis, Pulpitis..."
                    className="input-clinical"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block text-muted-foreground">Código CIE-10 (opcional)</label>
                    <input
                      value={diagnosis.code}
                      onChange={e => setDiagnosis(d => ({ ...d, code: e.target.value }))}
                      placeholder="Ej: K02.1"
                      className="input-clinical"
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={diagnosis.isPrimary} onChange={e => setDiagnosis(d => ({ ...d, isPrimary: e.target.checked }))} className="rounded" />
                      Diagnóstico primario
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">Descripción</label>
                  <textarea
                    value={diagnosis.description}
                    onChange={e => setDiagnosis(d => ({ ...d, description: e.target.value }))}
                    placeholder="Notas adicionales sobre el diagnóstico..."
                    className="input-clinical min-h-[80px] resize-y"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={handleSaveDiagnosis} className="flex items-center gap-2 bg-primary text-primary-foreground text-xs px-4 py-2 rounded-md hover:bg-primary/90 font-medium">
                  <Save className="w-3.5 h-3.5" /> Guardar y Continuar
                </button>
              </div>
            </div>
          )}

          {/* Treatment */}
          {activeStep === 'treatment' && (
            <div>
              <h2 className="section-title flex items-center gap-2"><Activity className="w-4 h-4" /> Tratamiento</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">Descripción del tratamiento *</label>
                  <input
                    value={treatment.description}
                    onChange={e => setTreatment(t => ({ ...t, description: e.target.value }))}
                    placeholder="Ej: Resina compuesta, Extracción, Limpieza dental..."
                    className="input-clinical"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block text-muted-foreground">Precio ($)</label>
                    <input
                      type="number"
                      value={treatment.price}
                      onChange={e => setTreatment(t => ({ ...t, price: e.target.value }))}
                      placeholder="0.00"
                      className="input-clinical"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block text-muted-foreground">No. de diente (opcional)</label>
                    <input
                      type="number"
                      value={treatment.toothNumber}
                      onChange={e => setTreatment(t => ({ ...t, toothNumber: e.target.value }))}
                      placeholder="Ej: 36"
                      className="input-clinical"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">Observaciones</label>
                  <textarea
                    value={treatment.observations}
                    onChange={e => setTreatment(t => ({ ...t, observations: e.target.value }))}
                    placeholder="Observaciones adicionales..."
                    className="input-clinical min-h-[80px] resize-y"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={handleSaveTreatment} className="flex items-center gap-2 bg-primary text-primary-foreground text-xs px-4 py-2 rounded-md hover:bg-primary/90 font-medium">
                  <Save className="w-3.5 h-3.5" /> Guardar y Continuar
                </button>
              </div>
            </div>
          )}

          {/* Prescription */}
          {activeStep === 'prescription' && (
            <div>
              <h2 className="section-title flex items-center gap-2"><Pill className="w-4 h-4" /> Receta Médica</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">Diagnóstico en receta</label>
                  <input
                    value={prescription.diagnosis || diagnosis.name}
                    onChange={e => setPrescription(p => ({ ...p, diagnosis: e.target.value }))}
                    className="input-clinical"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold">Medicamentos</label>
                    <button onClick={addMedication} className="flex items-center gap-1 text-xs text-primary hover:underline">
                      <Plus className="w-3 h-3" /> Agregar
                    </button>
                  </div>

                  <div className="space-y-3">
                    {prescription.medications.map((med, i) => (
                      <div key={i} className="p-3 rounded-lg border bg-muted/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-muted-foreground">Medicamento {i + 1}</span>
                          {prescription.medications.length > 1 && (
                            <button onClick={() => removeMedication(i)} className="text-destructive hover:underline text-[10px]">Quitar</button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input value={med.name} onChange={e => updateMedication(i, 'name', e.target.value)} placeholder="Nombre del medicamento" className="input-clinical text-xs" />
                          <input value={med.presentation} onChange={e => updateMedication(i, 'presentation', e.target.value)} placeholder="Presentación (Tab 500mg)" className="input-clinical text-xs" />
                          <input value={med.dose} onChange={e => updateMedication(i, 'dose', e.target.value)} placeholder="Dosis (1 tableta)" className="input-clinical text-xs" />
                          <select value={med.route} onChange={e => updateMedication(i, 'route', e.target.value)} className="input-clinical text-xs">
                            <option>Oral</option><option>Tópica</option><option>IM</option><option>IV</option><option>Sublingual</option><option>Inhalada</option>
                          </select>
                          <input value={med.frequency} onChange={e => updateMedication(i, 'frequency', e.target.value)} placeholder="Frecuencia (c/8h)" className="input-clinical text-xs" />
                          <input value={med.duration} onChange={e => updateMedication(i, 'duration', e.target.value)} placeholder="Duración (7 días)" className="input-clinical text-xs" />
                        </div>
                        <input value={med.specificInstructions} onChange={e => updateMedication(i, 'specificInstructions', e.target.value)} placeholder="Instrucciones específicas (tomar después de alimentos)" className="input-clinical text-xs" />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">Indicaciones adicionales</label>
                  <textarea
                    value={prescription.additionalInstructions}
                    onChange={e => setPrescription(p => ({ ...p, additionalInstructions: e.target.value }))}
                    placeholder="Indicaciones generales, próxima cita, etc."
                    className="input-clinical min-h-[60px] resize-y"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={handleSavePrescription} className="flex items-center gap-2 bg-primary text-primary-foreground text-xs px-4 py-2 rounded-md hover:bg-primary/90 font-medium">
                  <Save className="w-3.5 h-3.5" /> Guardar Receta y Continuar
                </button>
              </div>
            </div>
          )}

          {/* Payment */}
          {activeStep === 'payment' && (
            <div>
              <h2 className="section-title flex items-center gap-2"><CreditCard className="w-4 h-4" /> Registro de Pago</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block text-muted-foreground">Monto ($) *</label>
                    <input
                      type="number"
                      value={payment.amount}
                      onChange={e => setPayment(p => ({ ...p, amount: e.target.value }))}
                      placeholder={treatment.price || '0.00'}
                      className="input-clinical"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block text-muted-foreground">Método de pago</label>
                    <select
                      value={payment.method}
                      onChange={e => setPayment(p => ({ ...p, method: e.target.value as any }))}
                      className="input-clinical"
                    >
                      <option value="cash">Efectivo</option>
                      <option value="card">Tarjeta</option>
                      <option value="transfer">Transferencia</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">Notas</label>
                  <input
                    value={payment.notes}
                    onChange={e => setPayment(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Notas del pago (opcional)"
                    className="input-clinical"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <button onClick={handleSavePayment} className="flex items-center gap-2 bg-primary text-primary-foreground text-xs px-4 py-2 rounded-md hover:bg-primary/90 font-medium">
                  <Save className="w-3.5 h-3.5" /> Registrar Pago
                </button>
                <span className="text-xs text-muted-foreground">o puedes omitir y finalizar la consulta</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
