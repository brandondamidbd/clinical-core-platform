import { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePatientStore } from '@/stores/patientStore';
import { useDoctorStore } from '@/stores/doctorStore';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { useMedicalRecordStore, useTreatmentStore, usePrescriptionStore, usePaymentStore, useMedicationStore, useServiceStore } from '@/stores/catalogStores';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Search, User, Heart, FileText, Stethoscope, Activity, Pill, CreditCard,
  Check, ChevronRight, X, Plus, Save, CheckCircle2, Trash2, UserPlus
} from 'lucide-react';
import { generateId } from '@/stores/helpers';
import { toast } from 'sonner';

type ConsultaStep = 'vitals' | 'motive' | 'notes' | 'diagnosis' | 'treatment' | 'prescription' | 'payment';

const STEPS: { key: ConsultaStep; label: string; icon: React.ElementType }[] = [
  { key: 'vitals', label: 'Signos Vitales', icon: Heart },
  { key: 'motive', label: 'Motivo de Consulta', icon: FileText },
  { key: 'notes', label: 'Nota Clínica', icon: FileText },
  { key: 'diagnosis', label: 'Diagnósticos', icon: Stethoscope },
  { key: 'treatment', label: 'Tratamientos', icon: Activity },
  { key: 'prescription', label: 'Receta', icon: Pill },
  { key: 'payment', label: 'Pago', icon: CreditCard },
];

interface DiagnosisEntry {
  id: string; name: string; code: string; description: string; isPrimary: boolean;
}
interface TreatmentEntry {
  id: string; description: string; price: string; observations: string; toothNumber: string; serviceId?: string;
}
interface MedEntry {
  name: string; presentation: string; dose: string; route: string; frequency: string; duration: string; specificInstructions: string; catalogId?: string;
}

export default function ConsultaPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const allPatients = usePatientStore((s) => s.patients);
  const addPatient = usePatientStore((s) => s.addPatient);
  const patients = useMemo(() => allPatients.filter(p => !p.metadata.isArchived), [allPatients]);
  const doctors = useDoctorStore((s) => s.doctors);
  const activeDoctors = useMemo(() => doctors.filter(d => d.isActive), [doctors]);
  const setAppointmentStatus = useAppointmentStore((s) => s.setStatus);
  const addRecord = useMedicalRecordStore((s) => s.addRecord);
  const addTreatment = useTreatmentStore((s) => s.addTreatment);
  const addPrescription = usePrescriptionStore((s) => s.addPrescription);
  const addPayment = usePaymentStore((s) => s.addPayment);
  const catalogMeds = useMedicationStore((s) => s.medications).filter(m => m.isActive);
  const catalogServices = useServiceStore((s) => s.services).filter(s => s.isActive);

  const prePatientId = searchParams.get('patientId') || '';
  const preAppointmentId = searchParams.get('appointmentId') || '';

  const [selectedPatientId, setSelectedPatientId] = useState(prePatientId);
  const [selectedDoctorId, setSelectedDoctorId] = useState(activeDoctors[0]?.id || '');
  const [patientSearch, setPatientSearch] = useState('');
  const [activeStep, setActiveStep] = useState<ConsultaStep>('vitals');
  const [completedSteps, setCompletedSteps] = useState<Set<ConsultaStep>>(new Set());
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({ firstName: '', lastName: '', phone: '', dateOfBirth: '', sex: 'M' as 'M' | 'F' | 'other' });

  // Form states
  const [vitals, setVitals] = useState({
    weight: '', height: '', heartRate: '', bloodPressureSystolic: '', bloodPressureDiastolic: '',
    temperature: '', oxygenSaturation: '', respiratoryRate: ''
  });
  const [motive, setMotive] = useState('');
  const [clinicalNote, setClinicalNote] = useState('');
  
  // Multiple diagnoses
  const [diagnoses, setDiagnoses] = useState<DiagnosisEntry[]>([
    { id: generateId(), name: '', code: '', description: '', isPrimary: true }
  ]);
  
  // Multiple treatments
  const [treatments, setTreatments] = useState<TreatmentEntry[]>([
    { id: generateId(), description: '', price: '', observations: '', toothNumber: '' }
  ]);

  const [prescription, setPrescription] = useState({
    diagnosis: '', additionalInstructions: '',
    medications: [{ name: '', presentation: '', dose: '', route: 'Oral', frequency: '', duration: '', specificInstructions: '', catalogId: '' }] as MedEntry[]
  });
  const [medSearch, setMedSearch] = useState<Record<number, string>>({});
  const [showMedDropdown, setShowMedDropdown] = useState<number | null>(null);
  
  const [payment, setPayment] = useState({ amount: '', method: 'cash' as 'cash' | 'card' | 'transfer' | 'other', notes: '' });

  const selectedPatient = useMemo(() => patients.find(p => p.id === selectedPatientId), [patients, selectedPatientId]);
  const selectedDoctor = useMemo(() => doctors.find(d => d.id === selectedDoctorId), [doctors, selectedDoctorId]);
  const filteredPatients = useMemo(() => {
    if (!patientSearch) return patients.slice(0, 8);
    const q = patientSearch.toLowerCase();
    return patients.filter(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) || p.phone.includes(q));
  }, [patients, patientSearch]);

  // IMC calculation
  const bmi = useMemo(() => {
    const w = parseFloat(vitals.weight);
    const h = parseFloat(vitals.height);
    if (w > 0 && h > 0) return (w / ((h / 100) ** 2)).toFixed(1);
    return null;
  }, [vitals.weight, vitals.height]);

  const bmiCategory = useMemo(() => {
    if (!bmi) return '';
    const v = parseFloat(bmi);
    if (v < 18.5) return 'Bajo peso';
    if (v < 25) return 'Normal';
    if (v < 30) return 'Sobrepeso';
    return 'Obesidad';
  }, [bmi]);

  // Total treatments price
  const totalTreatmentsPrice = useMemo(() => 
    treatments.reduce((sum, t) => sum + (parseFloat(t.price) || 0), 0), [treatments]);

  const markStepDone = useCallback((step: ConsultaStep) => {
    setCompletedSteps(prev => new Set([...prev, step]));
    toast.success(`${STEPS.find(s => s.key === step)?.label} guardado`);
  }, []);

  // --- Create patient inline ---
  const handleCreatePatient = () => {
    if (!newPatient.firstName || !newPatient.lastName || !newPatient.phone) {
      toast.error('Nombre, apellidos y teléfono son obligatorios');
      return;
    }
    const p = addPatient({
      firstName: newPatient.firstName,
      lastName: newPatient.lastName,
      phone: newPatient.phone,
      dateOfBirth: newPatient.dateOfBirth || '2000-01-01',
      sex: newPatient.sex,
      allergies: [],
    });
    setSelectedPatientId(p.id);
    setShowNewPatient(false);
    toast.success('Paciente creado');
  };

  // --- Diagnosis helpers ---
  const addDiagnosis = () => {
    setDiagnoses(prev => [...prev, { id: generateId(), name: '', code: '', description: '', isPrimary: false }]);
  };
  const updateDiagnosis = (id: string, field: keyof DiagnosisEntry, value: any) => {
    setDiagnoses(prev => prev.map(d => {
      if (d.id !== id) return field === 'isPrimary' && value ? { ...d, isPrimary: false } : d;
      return { ...d, [field]: value };
    }));
  };
  const removeDiagnosis = (id: string) => {
    if (diagnoses.length <= 1) return;
    setDiagnoses(prev => prev.filter(d => d.id !== id));
  };

  // --- Treatment helpers ---
  const addTreatmentEntry = () => {
    setTreatments(prev => [...prev, { id: generateId(), description: '', price: '', observations: '', toothNumber: '' }]);
  };
  const updateTreatmentEntry = (id: string, field: keyof TreatmentEntry, value: string) => {
    setTreatments(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };
  const removeTreatmentEntry = (id: string) => {
    if (treatments.length <= 1) return;
    setTreatments(prev => prev.filter(t => t.id !== id));
  };
  const applyServiceToTreatment = (treatId: string, serviceId: string) => {
    const svc = catalogServices.find(s => s.id === serviceId);
    if (!svc) return;
    setTreatments(prev => prev.map(t => t.id === treatId ? { ...t, description: svc.name, price: String(svc.price), serviceId } : t));
  };

  // --- Medication helpers with catalog ---
  const addMedication = () => {
    setPrescription(p => ({
      ...p,
      medications: [...p.medications, { name: '', presentation: '', dose: '', route: 'Oral', frequency: '', duration: '', specificInstructions: '', catalogId: '' }]
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
  const applyMedFromCatalog = (index: number, medId: string) => {
    const med = catalogMeds.find(m => m.id === medId);
    if (!med) return;
    setPrescription(p => ({
      ...p,
      medications: p.medications.map((m, i) => i === index ? { ...m, name: med.name, presentation: med.presentation, dose: med.usualDose, catalogId: med.id } : m)
    }));
    setShowMedDropdown(null);
    setMedSearch({});
  };
  const getFilteredMeds = (index: number) => {
    const q = (medSearch[index] || '').toLowerCase();
    if (!q) return catalogMeds.slice(0, 5);
    return catalogMeds.filter(m => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)).slice(0, 8);
  };

  // --- Save handlers ---
  const handleSaveVitals = () => { markStepDone('vitals'); setActiveStep('motive'); };
  const handleSaveMotive = () => { markStepDone('motive'); setActiveStep('notes'); };
  const handleSaveNote = () => { markStepDone('notes'); setActiveStep('diagnosis'); };

  const handleSaveDiagnosis = () => {
    const valid = diagnoses.filter(d => d.name);
    if (valid.length === 0) { toast.error('Agrega al menos un diagnóstico'); return; }
    markStepDone('diagnosis');
    setActiveStep('treatment');
  };

  const handleSaveTreatment = () => {
    const valid = treatments.filter(t => t.description);
    if (valid.length === 0) { toast.error('Agrega al menos un tratamiento'); return; }
    valid.forEach(t => {
      addTreatment({
        patientId: selectedPatientId,
        doctorId: selectedDoctorId,
        description: t.description,
        price: parseFloat(t.price) || 0,
        observations: t.observations,
        status: 'in_progress',
        toothNumber: t.toothNumber ? parseInt(t.toothNumber) : undefined,
      });
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
      diagnosis: prescription.diagnosis || diagnoses.find(d => d.isPrimary)?.name || diagnoses[0]?.name || '',
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
    const validDiagnoses = diagnoses.filter(d => d.name);
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
        bmi: bmi ? parseFloat(bmi) : undefined,
        heartRate: parseFloat(vitals.heartRate) || undefined,
        bloodPressureSystolic: parseFloat(vitals.bloodPressureSystolic) || undefined,
        bloodPressureDiastolic: parseFloat(vitals.bloodPressureDiastolic) || undefined,
        temperature: parseFloat(vitals.temperature) || undefined,
        oxygenSaturation: parseFloat(vitals.oxygenSaturation) || undefined,
        respiratoryRate: parseFloat(vitals.respiratoryRate) || undefined,
      },
      auxiliaryStudies: [],
      diagnoses: validDiagnoses.map(d => ({ id: d.id, name: d.name, code: d.code, description: d.description, isPrimary: d.isPrimary, date: format(new Date(), 'yyyy-MM-dd') })),
      treatments: [],
      notes: clinicalNote ? [{ id: generateId(), date: format(new Date(), 'yyyy-MM-dd'), time: format(new Date(), 'HH:mm'), authorId: selectedDoctorId, authorName: selectedDoctor?.fullName || '', content: clinicalNote, isLocked: false }] : [],
    });
    if (preAppointmentId) setAppointmentStatus(preAppointmentId, 'attended');
    toast.success('Consulta finalizada y guardada');
    navigate('/');
  };

  // ========================= PATIENT SELECTION =========================
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
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title flex items-center gap-2 mb-0"><User className="w-4 h-4" /> Seleccionar Paciente</h2>
              <button onClick={() => setShowNewPatient(!showNewPatient)} className="flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                <UserPlus className="w-3.5 h-3.5" /> Nuevo Paciente
              </button>
            </div>

            {showNewPatient && (
              <div className="p-4 mb-4 rounded-lg border border-primary/20 bg-primary/5 space-y-3">
                <p className="text-xs font-semibold text-primary">Registro rápido de paciente</p>
                <div className="grid grid-cols-2 gap-2">
                  <input value={newPatient.firstName} onChange={e => setNewPatient(p => ({ ...p, firstName: e.target.value }))} placeholder="Nombre(s) *" className="input-clinical text-xs" />
                  <input value={newPatient.lastName} onChange={e => setNewPatient(p => ({ ...p, lastName: e.target.value }))} placeholder="Apellidos *" className="input-clinical text-xs" />
                  <input value={newPatient.phone} onChange={e => setNewPatient(p => ({ ...p, phone: e.target.value }))} placeholder="Teléfono *" className="input-clinical text-xs" />
                  <input type="date" value={newPatient.dateOfBirth} onChange={e => setNewPatient(p => ({ ...p, dateOfBirth: e.target.value }))} className="input-clinical text-xs" />
                  <select value={newPatient.sex} onChange={e => setNewPatient(p => ({ ...p, sex: e.target.value as any }))} className="input-clinical text-xs">
                    <option value="M">Masculino</option><option value="F">Femenino</option><option value="other">Otro</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleCreatePatient} className="flex items-center gap-1 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90 font-medium">
                    <Plus className="w-3 h-3" /> Crear y Seleccionar
                  </button>
                  <button onClick={() => setShowNewPatient(false)} className="text-xs text-muted-foreground hover:underline">Cancelar</button>
                </div>
              </div>
            )}

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
              <p className="meta-text text-center py-8">No se encontraron pacientes.</p>
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
              <select value={selectedDoctorId} onChange={e => setSelectedDoctorId(e.target.value)} className="input-clinical">
                {activeDoctors.map(d => <option key={d.id} value={d.id}>{d.fullName} — {d.specialty}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========================= CONSULTATION FLOW =========================
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
              {selectedPatient?.firstName} {selectedPatient?.lastName}
              {selectedPatient?.allergies?.length ? <span className="text-destructive font-semibold"> · Alergias: {selectedPatient.allergies.join(', ')}</span> : ''}
              {' · '}{selectedDoctor?.fullName} · {format(new Date(), "d MMM yyyy HH:mm", { locale: es })}
            </p>
          </div>
        </div>
        <button onClick={handleFinalize} className="flex items-center gap-2 bg-success text-success-foreground text-xs px-4 py-2 rounded-md hover:bg-success/90 font-medium">
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
          {/* ===== VITALS ===== */}
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
                      type="number" step="0.1"
                      value={vitals[field.key as keyof typeof vitals]}
                      onChange={e => setVitals(v => ({ ...v, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="input-clinical"
                    />
                  </div>
                ))}
              </div>
              {/* IMC Display */}
              {bmi && (
                <div className="mt-3 p-3 rounded-lg bg-muted/50 flex items-center gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground">IMC calculado:</span>
                    <span className="ml-2 text-sm font-bold">{bmi}</span>
                  </div>
                  <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    bmiCategory === 'Normal' ? 'bg-success/10 text-success' :
                    bmiCategory === 'Bajo peso' ? 'bg-warning/10 text-warning' :
                    'bg-destructive/10 text-destructive'
                  }`}>{bmiCategory}</div>
                </div>
              )}
              <div className="flex justify-end mt-4">
                <button onClick={handleSaveVitals} className="flex items-center gap-2 bg-primary text-primary-foreground text-xs px-4 py-2 rounded-md hover:bg-primary/90 font-medium">
                  <Save className="w-3.5 h-3.5" /> Guardar y Continuar
                </button>
              </div>
            </div>
          )}

          {/* ===== MOTIVE ===== */}
          {activeStep === 'motive' && (
            <div>
              <h2 className="section-title">Motivo de Consulta</h2>
              <textarea value={motive} onChange={e => setMotive(e.target.value)} placeholder="Describa el motivo principal de la consulta del paciente..." className="input-clinical min-h-[120px] resize-y" rows={5} />
              <div className="flex justify-end mt-4">
                <button onClick={handleSaveMotive} className="flex items-center gap-2 bg-primary text-primary-foreground text-xs px-4 py-2 rounded-md hover:bg-primary/90 font-medium">
                  <Save className="w-3.5 h-3.5" /> Guardar y Continuar
                </button>
              </div>
            </div>
          )}

          {/* ===== CLINICAL NOTE ===== */}
          {activeStep === 'notes' && (
            <div>
              <h2 className="section-title">Nota Clínica</h2>
              <textarea value={clinicalNote} onChange={e => setClinicalNote(e.target.value)} placeholder="Exploración física, hallazgos relevantes, evolución del padecimiento..." className="input-clinical min-h-[200px] resize-y" rows={8} />
              <div className="flex justify-end mt-4">
                <button onClick={handleSaveNote} className="flex items-center gap-2 bg-primary text-primary-foreground text-xs px-4 py-2 rounded-md hover:bg-primary/90 font-medium">
                  <Save className="w-3.5 h-3.5" /> Guardar y Continuar
                </button>
              </div>
            </div>
          )}

          {/* ===== DIAGNOSES (MULTIPLE) ===== */}
          {activeStep === 'diagnosis' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="section-title flex items-center gap-2 mb-0"><Stethoscope className="w-4 h-4" /> Diagnósticos</h2>
                <button onClick={addDiagnosis} className="flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                  <Plus className="w-3 h-3" /> Agregar diagnóstico
                </button>
              </div>
              <div className="space-y-4">
                {diagnoses.map((dx, idx) => (
                  <div key={dx.id} className="p-3 rounded-lg border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-muted-foreground">Diagnóstico {idx + 1}</span>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-[10px]">
                          <input type="radio" name="primaryDx" checked={dx.isPrimary} onChange={() => updateDiagnosis(dx.id, 'isPrimary', true)} className="accent-primary" />
                          Primario
                        </label>
                        {diagnoses.length > 1 && (
                          <button onClick={() => removeDiagnosis(dx.id)} className="text-destructive hover:underline text-[10px]">Quitar</button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <input value={dx.name} onChange={e => updateDiagnosis(dx.id, 'name', e.target.value)} placeholder="Nombre del diagnóstico *" className="input-clinical text-xs" />
                      </div>
                      <input value={dx.code} onChange={e => updateDiagnosis(dx.id, 'code', e.target.value)} placeholder="CIE-10 (K02.1)" className="input-clinical text-xs" />
                    </div>
                    <textarea value={dx.description} onChange={e => updateDiagnosis(dx.id, 'description', e.target.value)} placeholder="Descripción / notas" className="input-clinical text-xs min-h-[50px] resize-y" rows={2} />
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={handleSaveDiagnosis} className="flex items-center gap-2 bg-primary text-primary-foreground text-xs px-4 py-2 rounded-md hover:bg-primary/90 font-medium">
                  <Save className="w-3.5 h-3.5" /> Guardar y Continuar
                </button>
              </div>
            </div>
          )}

          {/* ===== TREATMENTS (MULTIPLE + SERVICE CATALOG) ===== */}
          {activeStep === 'treatment' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="section-title flex items-center gap-2 mb-0"><Activity className="w-4 h-4" /> Tratamientos</h2>
                <button onClick={addTreatmentEntry} className="flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                  <Plus className="w-3 h-3" /> Agregar tratamiento
                </button>
              </div>
              <div className="space-y-4">
                {treatments.map((tx, idx) => (
                  <div key={tx.id} className="p-3 rounded-lg border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-muted-foreground">Tratamiento {idx + 1}</span>
                      {treatments.length > 1 && (
                        <button onClick={() => removeTreatmentEntry(tx.id)} className="text-destructive hover:underline text-[10px]">Quitar</button>
                      )}
                    </div>
                    {catalogServices.length > 0 && (
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Desde catálogo de servicios:</label>
                        <select
                          value={tx.serviceId || ''}
                          onChange={e => applyServiceToTreatment(tx.id, e.target.value)}
                          className="input-clinical text-xs"
                        >
                          <option value="">— Seleccionar servicio (opcional) —</option>
                          {catalogServices.map(s => <option key={s.id} value={s.id}>{s.name} — ${s.price}</option>)}
                        </select>
                      </div>
                    )}
                    <input value={tx.description} onChange={e => updateTreatmentEntry(tx.id, 'description', e.target.value)} placeholder="Descripción del tratamiento *" className="input-clinical text-xs" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" value={tx.price} onChange={e => updateTreatmentEntry(tx.id, 'price', e.target.value)} placeholder="Precio ($)" className="input-clinical text-xs" />
                      <input type="number" value={tx.toothNumber} onChange={e => updateTreatmentEntry(tx.id, 'toothNumber', e.target.value)} placeholder="No. diente (opc)" className="input-clinical text-xs" />
                    </div>
                    <textarea value={tx.observations} onChange={e => updateTreatmentEntry(tx.id, 'observations', e.target.value)} placeholder="Observaciones" className="input-clinical text-xs min-h-[40px] resize-y" rows={2} />
                  </div>
                ))}
              </div>
              {totalTreatmentsPrice > 0 && (
                <div className="mt-3 p-2 rounded-lg bg-muted/50 text-right">
                  <span className="text-xs text-muted-foreground">Total tratamientos: </span>
                  <span className="text-sm font-bold">${totalTreatmentsPrice.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-end mt-4">
                <button onClick={handleSaveTreatment} className="flex items-center gap-2 bg-primary text-primary-foreground text-xs px-4 py-2 rounded-md hover:bg-primary/90 font-medium">
                  <Save className="w-3.5 h-3.5" /> Guardar y Continuar
                </button>
              </div>
            </div>
          )}

          {/* ===== PRESCRIPTION (WITH CATALOG AUTOCOMPLETE) ===== */}
          {activeStep === 'prescription' && (
            <div>
              <h2 className="section-title flex items-center gap-2"><Pill className="w-4 h-4" /> Receta Médica</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">Diagnóstico en receta</label>
                  <input
                    value={prescription.diagnosis || diagnoses.find(d => d.isPrimary)?.name || diagnoses[0]?.name || ''}
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
                        
                        {/* Catalog search */}
                        {catalogMeds.length > 0 && (
                          <div className="relative">
                            <label className="text-[10px] text-muted-foreground mb-1 block">Buscar en catálogo:</label>
                            <input
                              value={medSearch[i] || ''}
                              onChange={e => { setMedSearch(ms => ({ ...ms, [i]: e.target.value })); setShowMedDropdown(i); }}
                              onFocus={() => setShowMedDropdown(i)}
                              placeholder="Buscar medicamento del catálogo..."
                              className="input-clinical text-xs"
                            />
                            {showMedDropdown === i && (
                              <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-40 overflow-y-auto">
                                {getFilteredMeds(i).map(cm => (
                                  <button
                                    key={cm.id}
                                    onClick={() => applyMedFromCatalog(i, cm.id)}
                                    className="w-full text-left px-3 py-2 hover:bg-muted text-xs border-b last:border-0"
                                  >
                                    <span className="font-medium">{cm.name}</span>
                                    <span className="text-muted-foreground ml-1">· {cm.presentation} · {cm.usualDose}</span>
                                  </button>
                                ))}
                                {getFilteredMeds(i).length === 0 && <p className="text-xs text-muted-foreground p-2">Sin resultados</p>}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <input value={med.name} onChange={e => updateMedication(i, 'name', e.target.value)} placeholder="Nombre *" className="input-clinical text-xs" />
                          <input value={med.presentation} onChange={e => updateMedication(i, 'presentation', e.target.value)} placeholder="Presentación" className="input-clinical text-xs" />
                          <input value={med.dose} onChange={e => updateMedication(i, 'dose', e.target.value)} placeholder="Dosis" className="input-clinical text-xs" />
                          <select value={med.route} onChange={e => updateMedication(i, 'route', e.target.value)} className="input-clinical text-xs">
                            <option>Oral</option><option>Tópica</option><option>IM</option><option>IV</option><option>Sublingual</option><option>Inhalada</option>
                          </select>
                          <input value={med.frequency} onChange={e => updateMedication(i, 'frequency', e.target.value)} placeholder="Frecuencia (c/8h)" className="input-clinical text-xs" />
                          <input value={med.duration} onChange={e => updateMedication(i, 'duration', e.target.value)} placeholder="Duración (7 días)" className="input-clinical text-xs" />
                        </div>
                        <input value={med.specificInstructions} onChange={e => updateMedication(i, 'specificInstructions', e.target.value)} placeholder="Instrucciones específicas" className="input-clinical text-xs" />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">Indicaciones adicionales</label>
                  <textarea value={prescription.additionalInstructions} onChange={e => setPrescription(p => ({ ...p, additionalInstructions: e.target.value }))} placeholder="Indicaciones generales, próxima cita, etc." className="input-clinical min-h-[60px] resize-y" rows={2} />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={handleSavePrescription} className="flex items-center gap-2 bg-primary text-primary-foreground text-xs px-4 py-2 rounded-md hover:bg-primary/90 font-medium">
                  <Save className="w-3.5 h-3.5" /> Guardar Receta y Continuar
                </button>
              </div>
            </div>
          )}

          {/* ===== PAYMENT ===== */}
          {activeStep === 'payment' && (
            <div>
              <h2 className="section-title flex items-center gap-2"><CreditCard className="w-4 h-4" /> Registro de Pago</h2>
              {totalTreatmentsPrice > 0 && (
                <div className="mb-3 p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground">Total tratamientos esta consulta: </span>
                  <span className="text-sm font-bold">${totalTreatmentsPrice.toLocaleString()}</span>
                </div>
              )}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block text-muted-foreground">Monto ($) *</label>
                    <input type="number" value={payment.amount} onChange={e => setPayment(p => ({ ...p, amount: e.target.value }))} placeholder={totalTreatmentsPrice ? String(totalTreatmentsPrice) : '0.00'} className="input-clinical" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block text-muted-foreground">Método de pago</label>
                    <select value={payment.method} onChange={e => setPayment(p => ({ ...p, method: e.target.value as any }))} className="input-clinical">
                      <option value="cash">Efectivo</option><option value="card">Tarjeta</option><option value="transfer">Transferencia</option><option value="other">Otro</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">Notas</label>
                  <input value={payment.notes} onChange={e => setPayment(p => ({ ...p, notes: e.target.value }))} placeholder="Notas del pago (opcional)" className="input-clinical" />
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
