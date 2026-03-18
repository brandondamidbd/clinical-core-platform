import { useState, useMemo, useEffect, useCallback } from 'react';
import { usePatientStore } from '@/stores/patientStore';
import { useMedicalRecordStore, useTreatmentStore, usePaymentStore, usePrescriptionStore, useCertificateStore, useConsentStore } from '@/stores/catalogStores';
import { useDoctorStore } from '@/stores/doctorStore';
import { useSearchParams } from 'react-router-dom';
import { Plus, Save, Trash2, ChevronDown, ChevronRight, Edit2, Lock } from 'lucide-react';
import type { MedicalRecord, PhysicalExam, ClinicalNote, FamilyHistoryEntry, SystemReview, Diagnosis } from '@/types';
import { generateId } from '@/stores/helpers';
import { format } from 'date-fns';
import { toast } from 'sonner';

const SYSTEMS = ['Digestivo','Cardiovascular','Respiratorio','Nervioso','Músculo-esquelético','Hematológico','Endócrino','Genitourinario','Órganos de los sentidos'];
const FAMILY_RELATIONSHIPS = ['Padre','Madre','Abuelo paterno','Abuela paterna','Abuelo materno','Abuela materna','Hermano/a','Tío/a','Otro'];
const PATH_CATEGORIES = ['Enfermedades de la infancia','Enfermedades sistémicas actuales','Neoplasias','Quirúrgicos y hospitalizaciones','Farmacológicos','Traumáticos','Transfusionales','Alergias','Otras enfermedades'];
const NON_PATH_SECTIONS = [
  { key: 'oralHygiene', label: 'Hábitos de higiene oral', fields: ['Frecuencia de cepillado','Uso de hilo dental','Enjuague bucal','Última limpieza dental'] },
  { key: 'diet', label: 'Hábitos alimenticios', fields: ['Comidas al día','Consumo de azúcares','Consumo de agua','Dieta especial','Observaciones'] },
  { key: 'substances', label: 'Consumo de sustancias', fields: ['Tabaco','Alcohol','Otras sustancias','Frecuencia','Tiempo de consumo'] },
  { key: 'housing', label: 'Vivienda y medio ambiente', fields: ['Tipo de vivienda','Servicios básicos','Mascotas','Zona','Observaciones'] },
  { key: 'occupational', label: 'Antecedentes laborales', fields: ['Ocupación actual','Exposición a riesgos','Tiempo en puesto','Observaciones'] },
  { key: 'physical', label: 'Actividad física y descanso', fields: ['Tipo de actividad','Frecuencia semanal','Horas de sueño','Calidad del sueño','Observaciones'] },
  { key: 'immunizations', label: 'Inmunizaciones', fields: ['Esquema completo','Última vacuna','Vacunas pendientes','Observaciones'] },
];

export default function MedicalRecordPage() {
  const [params] = useSearchParams();
  const allPatients = usePatientStore(s => s.patients);
  const allDoctors = useDoctorStore(s => s.doctors);
  const patients = useMemo(() => allPatients.filter(p => !p.metadata.isArchived), [allPatients]);
  const doctors = useMemo(() => allDoctors.filter(d => d.isActive), [allDoctors]);
  const records = useMedicalRecordStore(s => s.records);
  const addRecord = useMedicalRecordStore(s => s.addRecord);
  const updateRecord = useMedicalRecordStore(s => s.updateRecord);
  const allTreatments = useTreatmentStore(s => s.treatments);
  const allPayments = usePaymentStore(s => s.payments);
  const allPrescriptions = usePrescriptionStore(s => s.prescriptions);
  const allCertificates = useCertificateStore(s => s.certificates);
  const allConsents = useConsentStore(s => s.consents);

  const [selectedPatient, setSelectedPatient] = useState(params.get('patientId') || '');
  const [selectedDoctor, setSelectedDoctor] = useState(doctors[0]?.id || '');
  const [tab, setTab] = useState('identification');

  const patient = patients.find(p => p.id === selectedPatient);
  const patientRecords = useMemo(() => records.filter(r => r.patientId === selectedPatient), [records, selectedPatient]);
  const activeRecord = patientRecords[0];

  // Reset state when patient changes
  const [vitals, setVitals] = useState<PhysicalExam>({});
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [noteText, setNoteText] = useState('');
  const [painSemiology, setPainSemiology] = useState<any>({});
  const [accompanyingSymptoms, setAccompanyingSymptoms] = useState<Record<string, { present: boolean; detail: string }>>({});
  const [familyEntries, setFamilyEntries] = useState<FamilyHistoryEntry[]>([]);
  const [nonPathData, setNonPathData] = useState<Record<string, Record<string, string>>>({});
  const [pathEntries, setPathEntries] = useState<Record<string, { entries: { id: string; description: string; date?: string; notes?: string }[] }>>({});
  const [systemsReview, setSystemsReview] = useState<Record<string, SystemReview>>({});
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  // Dental exams
  const [occlusalAnalysis, setOcclusalAnalysis] = useState<Record<string, string>>({});
  const [extraoralExam, setExtraoralExam] = useState<Record<string, string>>({});
  const [softTissueExam, setSoftTissueExam] = useState<Record<string, string>>({});
  const [hardTissueExam, setHardTissueExam] = useState<Record<string, string>>({});

  useEffect(() => {
    if (activeRecord) {
      setVitals(activeRecord.physicalExam || {});
      setChiefComplaint(activeRecord.currentCondition?.chiefComplaint || '');
      setPainSemiology(activeRecord.currentCondition?.painSemiology || {});
      setAccompanyingSymptoms(activeRecord.currentCondition?.accompanyingSymptoms || {});
      setFamilyEntries(activeRecord.familyHistory || []);
      setNonPathData(activeRecord.personalNonPathHistory || {});
      setPathEntries(activeRecord.personalPathHistory || {});
      setSystemsReview(activeRecord.systemsReview || {});
      setOcclusalAnalysis(activeRecord.occlusalAnalysis || {});
      setExtraoralExam(activeRecord.extraoralExam || {});
      setSoftTissueExam(activeRecord.softTissueExam || {});
      setHardTissueExam(activeRecord.hardTissueExam || {});
    } else {
      setVitals({}); setChiefComplaint(''); setPainSemiology({}); setAccompanyingSymptoms({});
      setFamilyEntries([]); setNonPathData({}); setPathEntries({}); setSystemsReview({});
      setOcclusalAnalysis({}); setExtraoralExam({}); setSoftTissueExam({}); setHardTissueExam({});
    }
  }, [activeRecord, selectedPatient]);

  const ensureRecord = useCallback(() => {
    if (!selectedPatient || !selectedDoctor) return null;
    if (activeRecord) return activeRecord;
    return addRecord({
      patientId: selectedPatient, doctorId: selectedDoctor,
      familyHistory: [], personalNonPathHistory: {}, personalPathHistory: {},
      currentCondition: { chiefComplaint: '' }, systemsReview: {}, physicalExam: {},
      auxiliaryStudies: [], diagnoses: [], treatments: [], notes: [],
    });
  }, [selectedPatient, selectedDoctor, activeRecord, addRecord]);

  const saveSection = useCallback((updates: Partial<MedicalRecord>) => {
    const record = ensureRecord();
    if (!record) return;
    updateRecord(record.id, updates);
    toast.success('Guardado');
  }, [ensureRecord, updateRecord]);

  const TABS = [
    { id: 'identification', label: 'Identificación' },
    { id: 'family_history', label: 'Ant. Heredofamiliares' },
    { id: 'personal_non_path', label: 'Ant. Pers. No Patológicos' },
    { id: 'personal_path', label: 'Ant. Pers. Patológicos' },
    { id: 'current_condition', label: 'Padecimiento Actual' },
    { id: 'systems_review', label: 'Interrog. por Aparatos' },
    { id: 'physical_exam', label: 'Exploración Física' },
    { id: 'occlusal', label: 'Análisis Oclusal' },
    { id: 'periodontal', label: 'Examen Parodontal' },
    { id: 'extraoral', label: 'Exploración Extraoral' },
    { id: 'soft_tissue', label: 'Tejidos Blandos' },
    { id: 'hard_tissue', label: 'Tejidos Duros' },
    { id: 'diagnoses', label: 'Diagnósticos' },
    { id: 'treatments_hist', label: 'Tratamientos' },
    { id: 'notes', label: 'Notas Médicas' },
    { id: 'payments_hist', label: 'Historial de Pagos' },
    { id: 'documents_hist', label: 'Documentos' },
    { id: 'consultations', label: 'Consultas/Evoluciones' },
  ];

  const patientTreatments = useMemo(() => allTreatments.filter(t => t.patientId === selectedPatient), [allTreatments, selectedPatient]);
  const patientPayments = useMemo(() => allPayments.filter(p => p.patientId === selectedPatient), [allPayments, selectedPatient]);
  const patientPrescriptions = useMemo(() => allPrescriptions.filter(p => p.patientId === selectedPatient), [allPrescriptions, selectedPatient]);
  const patientCertificates = useMemo(() => allCertificates.filter(c => c.patientId === selectedPatient), [allCertificates, selectedPatient]);
  const patientConsents = useMemo(() => allConsents.filter(c => c.patientId === selectedPatient), [allConsents, selectedPatient]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header"><h1 className="page-title">Expediente Clínico</h1></div>

      <div className="card-clinical p-4">
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-medium mb-1 block">Paciente</label>
            <select value={selectedPatient} onChange={e => { setSelectedPatient(e.target.value); setTab('identification'); }} className="input-clinical h-9">
              <option value="">Seleccionar paciente</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
            </select>
          </div>
          <div className="w-64">
            <label className="text-xs font-medium mb-1 block">Médico Tratante</label>
            <select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)} className="input-clinical h-9">
              {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
            </select>
          </div>
        </div>
      </div>

      {selectedPatient && patient ? (
        <div className="flex gap-4">
          <div className="w-52 flex-shrink-0 space-y-0.5 max-h-[calc(100vh-12rem)] overflow-y-auto">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === t.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 card-clinical p-4 min-h-[400px]">
            {/* ===== IDENTIFICATION ===== */}
            {tab === 'identification' && (
              <div>
                <h2 className="section-title">Ficha de Identificación</h2>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    ['Nombre', `${patient.firstName} ${patient.lastName}`],
                    ['Fecha nac.', patient.dateOfBirth],
                    ['Sexo', patient.sex === 'M' ? 'Masculino' : patient.sex === 'F' ? 'Femenino' : 'Otro'],
                    ['Teléfono', patient.phone],
                    ['Correo', patient.email || '—'],
                    ['Domicilio', patient.address || '—'],
                    ['Tipo de sangre', patient.bloodType || '—'],
                    ['Estado civil', patient.maritalStatus || '—'],
                    ['Lugar de origen', patient.birthPlace || '—'],
                    ['Escolaridad', patient.education || '—'],
                    ['Ocupación', patient.occupation || '—'],
                    ['Tutor', patient.guardianName || '—'],
                    ['Alergias', patient.allergies.length > 0 ? patient.allergies.join(', ') : 'Ninguna conocida'],
                  ].map(([l, v]) => (
                    <div key={l}><span className="text-muted-foreground block">{l}</span><span className="font-medium">{v}</span></div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== FAMILY HISTORY ===== */}
            {tab === 'family_history' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="section-title mb-0">Antecedentes Heredofamiliares</h2>
                  <button onClick={() => setFamilyEntries(prev => [...prev, { id: generateId(), relationship: '', disease: '', comments: '', isActive: true }])}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"><Plus className="w-3 h-3" /> Agregar</button>
                </div>
                {familyEntries.length === 0 ? (
                  <p className="meta-text text-center py-8">Sin antecedentes heredofamiliares registrados. Haz clic en "Agregar" para comenzar.</p>
                ) : (
                  <div className="space-y-2">
                    {familyEntries.map((entry, idx) => (
                      <div key={entry.id} className="p-3 border rounded-md space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-muted-foreground">Entrada {idx + 1}</span>
                          <button onClick={() => setFamilyEntries(prev => prev.filter(e => e.id !== entry.id))} className="text-destructive text-[10px] hover:underline">Eliminar</button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-muted-foreground">Parentesco</label>
                            <select value={entry.relationship} onChange={e => setFamilyEntries(prev => prev.map(en => en.id === entry.id ? { ...en, relationship: e.target.value } : en))} className="input-clinical h-8 text-xs">
                              <option value="">Seleccionar</option>
                              {FAMILY_RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground">Enfermedad</label>
                            <input value={entry.disease} onChange={e => setFamilyEntries(prev => prev.map(en => en.id === entry.id ? { ...en, disease: e.target.value } : en))} className="input-clinical h-8 text-xs" placeholder="Ej: Diabetes tipo 2" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground">Comentarios</label>
                          <input value={entry.comments || ''} onChange={e => setFamilyEntries(prev => prev.map(en => en.id === entry.id ? { ...en, comments: e.target.value } : en))} className="input-clinical h-8 text-xs" placeholder="Observaciones..." />
                        </div>
                        <label className="flex items-center gap-1.5 text-xs">
                          <input type="checkbox" checked={entry.isActive} onChange={e => setFamilyEntries(prev => prev.map(en => en.id === entry.id ? { ...en, isActive: e.target.checked } : en))} className="rounded" />
                          Activo / vigente
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={() => saveSection({ familyHistory: familyEntries })} className="mt-3 flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90">
                  <Save className="w-3.5 h-3.5" /> Guardar
                </button>
              </div>
            )}

            {/* ===== PERSONAL NON-PATHOLOGICAL ===== */}
            {tab === 'personal_non_path' && (
              <div>
                <h2 className="section-title">Antecedentes Personales No Patológicos</h2>
                <div className="space-y-2">
                  {NON_PATH_SECTIONS.map(section => {
                    const isExpanded = expandedSection === section.key;
                    const data = nonPathData[section.key] || {};
                    return (
                      <div key={section.key} className="border rounded-md">
                        <button onClick={() => setExpandedSection(isExpanded ? null : section.key)} className="w-full flex items-center justify-between p-3 hover:bg-muted/50 text-xs font-medium">
                          <span>{section.label}</span>
                          <div className="flex items-center gap-2">
                            {Object.values(data).some(v => v) && <span className="text-[10px] bg-success/10 text-success px-1.5 py-0.5 rounded">Registrado</span>}
                            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="p-3 pt-0 space-y-2 border-t">
                            {section.fields.map(field => (
                              <div key={field}>
                                <label className="text-[10px] text-muted-foreground block">{field}</label>
                                <input value={data[field] || ''} onChange={e => setNonPathData(prev => ({ ...prev, [section.key]: { ...prev[section.key], [field]: e.target.value } }))} className="input-clinical h-8 text-xs" />
                              </div>
                            ))}
                            <div>
                              <label className="text-[10px] text-muted-foreground block">Notas adicionales</label>
                              <textarea value={data['_notes'] || ''} onChange={e => setNonPathData(prev => ({ ...prev, [section.key]: { ...prev[section.key], '_notes': e.target.value } }))} className="input-clinical text-xs min-h-[50px] py-1.5" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <button onClick={() => saveSection({ personalNonPathHistory: nonPathData })} className="mt-3 flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90">
                  <Save className="w-3.5 h-3.5" /> Guardar Todo
                </button>
              </div>
            )}

            {/* ===== PERSONAL PATHOLOGICAL ===== */}
            {tab === 'personal_path' && (
              <div>
                <h2 className="section-title">Antecedentes Personales Patológicos</h2>
                <div className="space-y-2">
                  {PATH_CATEGORIES.map(cat => {
                    const isExpanded = expandedSection === `path_${cat}`;
                    const catData = pathEntries[cat] || { entries: [] };
                    return (
                      <div key={cat} className="border rounded-md">
                        <button onClick={() => setExpandedSection(isExpanded ? null : `path_${cat}`)} className="w-full flex items-center justify-between p-3 hover:bg-muted/50 text-xs font-medium">
                          <span>{cat}</span>
                          <div className="flex items-center gap-2">
                            {catData.entries.length > 0 && <span className="text-[10px] bg-warning/10 text-warning px-1.5 py-0.5 rounded">{catData.entries.length}</span>}
                            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="p-3 pt-0 space-y-2 border-t">
                            {catData.entries.map((entry, idx) => (
                              <div key={entry.id} className="flex gap-2 items-start">
                                <div className="flex-1 space-y-1">
                                  <input value={entry.description} onChange={e => {
                                    const newEntries = [...catData.entries]; newEntries[idx] = { ...entry, description: e.target.value };
                                    setPathEntries(prev => ({ ...prev, [cat]: { entries: newEntries } }));
                                  }} className="input-clinical h-7 text-xs" placeholder="Descripción..." />
                                  <input value={entry.notes || ''} onChange={e => {
                                    const newEntries = [...catData.entries]; newEntries[idx] = { ...entry, notes: e.target.value };
                                    setPathEntries(prev => ({ ...prev, [cat]: { entries: newEntries } }));
                                  }} className="input-clinical h-7 text-xs" placeholder="Notas/observaciones..." />
                                </div>
                                <button onClick={() => setPathEntries(prev => ({ ...prev, [cat]: { entries: catData.entries.filter((_, i) => i !== idx) } }))} className="text-destructive mt-1"><Trash2 className="w-3 h-3" /></button>
                              </div>
                            ))}
                            <button onClick={() => setPathEntries(prev => ({ ...prev, [cat]: { entries: [...catData.entries, { id: generateId(), description: '' }] } }))}
                              className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Agregar entrada</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <button onClick={() => saveSection({ personalPathHistory: pathEntries })} className="mt-3 flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90">
                  <Save className="w-3.5 h-3.5" /> Guardar Todo
                </button>
              </div>
            )}

            {/* ===== CURRENT CONDITION ===== */}
            {tab === 'current_condition' && (
              <div>
                <h2 className="section-title">Padecimiento Actual</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Motivo de Consulta</label>
                    <textarea value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)} className="input-clinical min-h-[80px] py-2" placeholder="Describa el motivo principal..." />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold mb-2">Semiología del Dolor</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'onset', label: 'Inicio', placeholder: 'Hace 3 días' },
                        { key: 'location', label: 'Localización', placeholder: 'Cuadrante inferior derecho' },
                        { key: 'radiation', label: 'Irradiación', placeholder: 'Hacia el oído' },
                        { key: 'type', label: 'Tipo', placeholder: 'Punzante, sordo, ardoroso...' },
                        { key: 'duration', label: 'Duración', placeholder: 'Continuo / intermitente' },
                        { key: 'frequency', label: 'Frecuencia', placeholder: 'Constante, cada hora...' },
                        { key: 'aggravating', label: 'Factores agravantes', placeholder: 'Frío, masticación...' },
                        { key: 'alleviating', label: 'Factores atenuantes', placeholder: 'Analgésicos, calor...' },
                        { key: 'associated', label: 'Síntomas asociados', placeholder: 'Fiebre, inflamación...' },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="text-[10px] text-muted-foreground block">{f.label}</label>
                          <input value={painSemiology[f.key] || ''} onChange={e => setPainSemiology((prev: any) => ({ ...prev, [f.key]: e.target.value }))} className="input-clinical h-8 text-xs" placeholder={f.placeholder} />
                        </div>
                      ))}
                      <div>
                        <label className="text-[10px] text-muted-foreground block">Intensidad (1-10)</label>
                        <input type="number" min={1} max={10} value={painSemiology.intensity || ''} onChange={e => setPainSemiology((prev: any) => ({ ...prev, intensity: parseInt(e.target.value) || undefined }))} className="input-clinical h-8 text-xs" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold mb-2">Síntomas Acompañantes</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {['Fiebre','Náuseas/vómito','Cefalea','Diarrea','Insomnio','Sangrado','Inflamación','Otro'].map(symptom => {
                        const data = accompanyingSymptoms[symptom] || { present: false, detail: '' };
                        return (
                          <div key={symptom} className="flex items-start gap-2 p-2 border rounded text-xs">
                            <input type="checkbox" checked={data.present} onChange={e => setAccompanyingSymptoms(prev => ({ ...prev, [symptom]: { ...data, present: e.target.checked } }))} className="mt-0.5 rounded" />
                            <div className="flex-1">
                              <span className="font-medium">{symptom}</span>
                              {data.present && <input value={data.detail} onChange={e => setAccompanyingSymptoms(prev => ({ ...prev, [symptom]: { ...data, detail: e.target.value } }))} className="input-clinical h-7 text-xs mt-1" placeholder="Detalle..." />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <button onClick={() => saveSection({ currentCondition: { chiefComplaint, painSemiology, accompanyingSymptoms } })}
                    className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90">
                    <Save className="w-3.5 h-3.5" /> Guardar
                  </button>
                </div>
              </div>
            )}

            {/* ===== SYSTEMS REVIEW ===== */}
            {tab === 'systems_review' && (
              <div>
                <h2 className="section-title">Interrogatorio por Aparatos y Sistemas</h2>
                <div className="space-y-2">
                  {SYSTEMS.map(sys => {
                    const review = systemsReview[sys] || { system: sys, hasAlterations: false };
                    return (
                      <div key={sys} className="border rounded-md p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">{sys}</span>
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1 text-[10px]">
                              <input type="radio" name={`sys_${sys}`} checked={!review.hasAlterations} onChange={() => setSystemsReview(prev => ({ ...prev, [sys]: { ...review, system: sys, hasAlterations: false } }))} className="accent-success" />
                              Sin alteraciones
                            </label>
                            <label className="flex items-center gap-1 text-[10px]">
                              <input type="radio" name={`sys_${sys}`} checked={review.hasAlterations} onChange={() => setSystemsReview(prev => ({ ...prev, [sys]: { ...review, system: sys, hasAlterations: true } }))} className="accent-warning" />
                              Con alteraciones
                            </label>
                          </div>
                        </div>
                        {review.hasAlterations && (
                          <div className="mt-2 space-y-1.5">
                            <input value={review.description || ''} onChange={e => setSystemsReview(prev => ({ ...prev, [sys]: { ...review, description: e.target.value } }))} className="input-clinical h-7 text-xs" placeholder="Descripción de alteraciones..." />
                            <div className="grid grid-cols-2 gap-2">
                              <input value={review.evolution || ''} onChange={e => setSystemsReview(prev => ({ ...prev, [sys]: { ...review, evolution: e.target.value } }))} className="input-clinical h-7 text-xs" placeholder="Tiempo de evolución" />
                              <input value={review.currentTreatment || ''} onChange={e => setSystemsReview(prev => ({ ...prev, [sys]: { ...review, currentTreatment: e.target.value } }))} className="input-clinical h-7 text-xs" placeholder="Tratamiento actual" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <button onClick={() => saveSection({ systemsReview })} className="mt-3 flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90">
                  <Save className="w-3.5 h-3.5" /> Guardar
                </button>
              </div>
            )}

            {/* ===== PHYSICAL EXAM ===== */}
            {tab === 'physical_exam' && (
              <div>
                <h2 className="section-title">Exploración Física – Signos Vitales</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { key: 'weight', label: 'Peso (kg)' }, { key: 'height', label: 'Estatura (cm)' },
                    { key: 'temperature', label: 'Temperatura (°C)' }, { key: 'heartRate', label: 'Frec. Cardiaca' },
                    { key: 'respiratoryRate', label: 'Frec. Respiratoria' }, { key: 'oxygenSaturation', label: 'SpO₂ (%)' },
                    { key: 'bloodPressureSystolic', label: 'T/A Sistólica' }, { key: 'bloodPressureDiastolic', label: 'T/A Diastólica' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs font-medium mb-1 block">{f.label}</label>
                      <input type="number" value={(vitals as any)[f.key] || ''} onChange={e => setVitals(v => ({ ...v, [f.key]: parseFloat(e.target.value) || undefined }))} className="input-clinical h-9" />
                    </div>
                  ))}
                </div>
                {vitals.weight && vitals.height && (
                  <div className="mt-2 p-2 rounded-md bg-muted/50 text-xs">
                    <span className="text-muted-foreground">IMC: </span>
                    <span className="font-semibold">{(vitals.weight / ((vitals.height / 100) ** 2)).toFixed(1)}</span>
                    <span className="ml-2 text-muted-foreground">
                      {(() => { const v = vitals.weight / ((vitals.height / 100) ** 2); return v < 18.5 ? 'Bajo peso' : v < 25 ? 'Normal' : v < 30 ? 'Sobrepeso' : 'Obesidad'; })()}
                    </span>
                  </div>
                )}
                <button onClick={() => { const bmi = vitals.weight && vitals.height ? +(vitals.weight / ((vitals.height / 100) ** 2)).toFixed(1) : undefined; saveSection({ physicalExam: { ...vitals, bmi } }); }}
                  className="mt-3 flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90">
                  <Save className="w-3.5 h-3.5" /> Guardar
                </button>
              </div>
            )}

            {/* ===== DENTAL EXAMS (occlusal, periodontal, extraoral, soft tissue, hard tissue) ===== */}
            {['occlusal', 'extraoral', 'soft_tissue', 'hard_tissue'].includes(tab) && (
              <div>
                <h2 className="section-title">
                  {tab === 'occlusal' ? 'Análisis de Oclusión y Función' : tab === 'extraoral' ? 'Exploración Extraoral' : tab === 'soft_tissue' ? 'Exploración de Tejidos Blandos' : 'Exploración de Tejidos Duros'}
                </h2>
                {(() => {
                  const fields = tab === 'occlusal'
                    ? ['Clase molar derecha','Clase molar izquierda','Clase canina derecha','Clase canina izquierda','Línea media','Overjet','Overbite','Mordida cruzada','Bruxismo','ATM','Observaciones']
                    : tab === 'extraoral'
                    ? ['Cráneo','Cara','Perfil','Ganglios cervicales','ATM palpación','Labios','Simetría facial','Piel','Observaciones']
                    : tab === 'soft_tissue'
                    ? ['Labios (mucosa)','Carrillos','Paladar duro','Paladar blando','Piso de boca','Lengua','Encía','Frenillos','Observaciones']
                    : ['Dientes presentes','Dientes ausentes','Caries visibles','Restauraciones','Prótesis','Fracturas','Movilidad','Observaciones'];
                  const [state, setter] = tab === 'occlusal' ? [occlusalAnalysis, setOcclusalAnalysis] : tab === 'extraoral' ? [extraoralExam, setExtraoralExam] : tab === 'soft_tissue' ? [softTissueExam, setSoftTissueExam] : [hardTissueExam, setHardTissueExam];
                  const saveKey = tab === 'occlusal' ? 'occlusalAnalysis' : tab === 'extraoral' ? 'extraoralExam' : tab === 'soft_tissue' ? 'softTissueExam' : 'hardTissueExam';
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        {fields.map(f => (
                          <div key={f} className={f === 'Observaciones' ? 'col-span-2' : ''}>
                            <label className="text-[10px] text-muted-foreground block">{f}</label>
                            {f === 'Observaciones' ? (
                              <textarea value={(state as any)[f] || ''} onChange={e => (setter as any)((prev: any) => ({ ...prev, [f]: e.target.value }))} className="input-clinical text-xs min-h-[60px] py-1.5" />
                            ) : (
                              <input value={(state as any)[f] || ''} onChange={e => (setter as any)((prev: any) => ({ ...prev, [f]: e.target.value }))} className="input-clinical h-8 text-xs" />
                            )}
                          </div>
                        ))}
                      </div>
                      <button onClick={() => saveSection({ [saveKey]: state })} className="mt-3 flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90">
                        <Save className="w-3.5 h-3.5" /> Guardar
                      </button>
                    </>
                  );
                })()}
              </div>
            )}

            {/* ===== PERIODONTAL ===== */}
            {tab === 'periodontal' && (
              <div>
                <h2 className="section-title">Examen Parodontal</h2>
                <p className="meta-text mb-3">Registra hallazgos parodontales por pieza dental.</p>
                {(activeRecord?.periodontalExam || []).length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">Sin hallazgos parodontales registrados.</p>
                ) : (
                  <div className="space-y-1">
                    {(activeRecord?.periodontalExam || []).map(e => (
                      <div key={e.id} className="flex justify-between text-xs p-2 border rounded">
                        <span>Pieza {e.toothNumber}: {e.finding}</span>
                        <span className="text-muted-foreground">{e.date}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-3 p-3 border rounded-md space-y-2">
                  <p className="text-xs font-medium">Agregar hallazgo parodontal</p>
                  <div className="grid grid-cols-3 gap-2" id="perio-form">
                    <input type="number" placeholder="No. pieza" className="input-clinical h-8 text-xs" id="perio-tooth" />
                    <input placeholder="Hallazgo (ej: bolsa 5mm)" className="input-clinical h-8 text-xs" id="perio-finding" />
                    <input placeholder="Comentario" className="input-clinical h-8 text-xs" id="perio-comment" />
                  </div>
                  <button onClick={() => {
                    const tooth = (document.getElementById('perio-tooth') as HTMLInputElement)?.value;
                    const finding = (document.getElementById('perio-finding') as HTMLInputElement)?.value;
                    const comment = (document.getElementById('perio-comment') as HTMLInputElement)?.value;
                    if (!tooth || !finding) return;
                    const entry = { id: generateId(), toothNumber: parseInt(tooth), finding, comment, date: format(new Date(), 'yyyy-MM-dd') };
                    saveSection({ periodontalExam: [...(activeRecord?.periodontalExam || []), entry] });
                  }} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Agregar</button>
                </div>
              </div>
            )}

            {/* ===== DIAGNOSES ===== */}
            {tab === 'diagnoses' && (
              <div>
                <h2 className="section-title">Diagnósticos</h2>
                {(activeRecord?.diagnoses || []).length === 0 ? (
                  <p className="meta-text text-center py-6">Sin diagnósticos registrados. Agrégalos desde Nueva Consulta.</p>
                ) : (
                  <div className="space-y-2">
                    {(activeRecord?.diagnoses || []).map(d => (
                      <div key={d.id} className="p-3 border rounded-md text-xs">
                        <div className="flex justify-between">
                          <span className="font-medium">{d.name}</span>
                          <div className="flex items-center gap-2">
                            {d.isPrimary && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Primario</span>}
                            <span className="font-mono text-muted-foreground">{d.code || '—'}</span>
                          </div>
                        </div>
                        {d.description && <p className="text-muted-foreground mt-1">{d.description}</p>}
                        <span className="text-[10px] text-muted-foreground">{d.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===== TREATMENTS HISTORY ===== */}
            {tab === 'treatments_hist' && (
              <div>
                <h2 className="section-title">Tratamientos</h2>
                {patientTreatments.length === 0 ? (
                  <p className="meta-text text-center py-6">Sin tratamientos registrados.</p>
                ) : (
                  <div className="space-y-1">
                    {patientTreatments.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-2 border rounded text-xs">
                        <div>
                          <span className="font-medium">{t.description}</span>
                          {t.toothNumber && <span className="text-muted-foreground ml-1">(pieza {t.toothNumber})</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">${t.price.toLocaleString()}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${t.status === 'completed' || t.status === 'paid' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{t.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===== NOTES ===== */}
            {tab === 'notes' && (
              <div>
                <h2 className="section-title">Notas Médicas</h2>
                <div className="flex gap-2 mb-3">
                  <textarea value={noteText} onChange={e => setNoteText(e.target.value)} className="input-clinical min-h-[60px] py-2 flex-1 text-xs" placeholder="Escriba la nota clínica..." />
                  <button onClick={() => {
                    const record = ensureRecord();
                    if (!record || !noteText.trim()) return;
                    const note: ClinicalNote = { id: generateId(), date: format(new Date(), 'yyyy-MM-dd'), time: format(new Date(), 'HH:mm'), authorId: selectedDoctor, authorName: doctors.find(d => d.id === selectedDoctor)?.fullName || 'Médico', content: noteText, isLocked: false };
                    updateRecord(record.id, { notes: [...(record.notes || []), note] });
                    setNoteText(''); toast.success('Nota agregada');
                  }} className="self-end bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90 h-9">Agregar</button>
                </div>
                {activeRecord?.notes && activeRecord.notes.length > 0 ? (
                  <div className="space-y-2">
                    {[...activeRecord.notes].reverse().map(n => (
                      <div key={n.id} className="p-3 border rounded-md text-xs">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{n.authorName}</span>
                          <span className="font-mono text-muted-foreground">{n.date} {n.time}</span>
                        </div>
                        <p className="text-foreground whitespace-pre-wrap">{n.content}</p>
                        {n.isLocked && <span className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><Lock className="w-3 h-3" /> Nota bloqueada</span>}
                      </div>
                    ))}
                  </div>
                ) : <p className="meta-text text-center py-4">Sin notas registradas</p>}
              </div>
            )}

            {/* ===== PAYMENTS HISTORY ===== */}
            {tab === 'payments_hist' && (
              <div>
                <h2 className="section-title">Historial de Pagos</h2>
                {patientPayments.length === 0 ? (
                  <p className="meta-text text-center py-6">Sin pagos registrados.</p>
                ) : (
                  <div className="space-y-1">
                    {[...patientPayments].reverse().map(p => (
                      <div key={p.id} className="flex justify-between p-2 border rounded text-xs">
                        <div>
                          <span className="font-mono">{format(new Date(p.date), 'dd/MM/yyyy')}</span>
                          <span className="ml-2 capitalize">{p.method === 'cash' ? 'Efectivo' : p.method === 'card' ? 'Tarjeta' : p.method === 'transfer' ? 'Transferencia' : 'Otro'}</span>
                        </div>
                        <span className="font-mono font-semibold text-success">${p.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="p-2 bg-muted rounded text-xs font-semibold flex justify-between">
                      <span>Total pagado</span>
                      <span className="font-mono">${patientPayments.reduce((s, p) => s + p.amount, 0).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===== DOCUMENTS HISTORY ===== */}
            {tab === 'documents_hist' && (
              <div>
                <h2 className="section-title">Documentos Generados</h2>
                <div className="space-y-3">
                  {patientPrescriptions.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold mb-1">Recetas ({patientPrescriptions.length})</h3>
                      {patientPrescriptions.map(rx => (
                        <div key={rx.id} className="flex justify-between p-2 border rounded text-xs mb-1">
                          <span className="font-mono">{rx.folio}</span>
                          <span className="text-muted-foreground">{format(new Date(rx.date), 'dd/MM/yyyy')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {patientCertificates.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold mb-1">Certificados ({patientCertificates.length})</h3>
                      {patientCertificates.map(c => (
                        <div key={c.id} className="flex justify-between p-2 border rounded text-xs mb-1">
                          <span className="font-mono">{c.folio}</span>
                          <span className="text-muted-foreground">{c.date}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {patientConsents.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold mb-1">Consentimientos ({patientConsents.length})</h3>
                      {patientConsents.map(c => (
                        <div key={c.id} className="flex justify-between p-2 border rounded text-xs mb-1">
                          <span>{c.procedure}</span>
                          <span className="text-muted-foreground">{c.date}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {patientPrescriptions.length === 0 && patientCertificates.length === 0 && patientConsents.length === 0 && (
                    <p className="meta-text text-center py-6">Sin documentos generados para este paciente.</p>
                  )}
                </div>
              </div>
            )}

            {/* ===== CONSULTATIONS HISTORY ===== */}
            {tab === 'consultations' && (
              <div>
                <h2 className="section-title">Historial de Consultas / Evoluciones</h2>
                {patientRecords.length === 0 ? (
                  <p className="meta-text text-center py-6">Sin registros de consulta.</p>
                ) : (
                  <div className="space-y-2">
                    {patientRecords.map((r, idx) => (
                      <div key={r.id} className="p-3 border rounded-md text-xs">
                        <div className="flex justify-between mb-1">
                          <span className="font-semibold">Consulta {patientRecords.length - idx}</span>
                          <span className="font-mono text-muted-foreground">{format(new Date(r.metadata.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                        </div>
                        <div className="space-y-0.5 text-muted-foreground">
                          {r.currentCondition?.chiefComplaint && <p>Motivo: {r.currentCondition.chiefComplaint}</p>}
                          <p>Diagnósticos: {r.diagnoses?.length || 0} · Notas: {r.notes?.length || 0}</p>
                          <p>Médico: {doctors.find(d => d.id === r.doctorId)?.fullName || '—'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card-clinical p-12 text-center text-muted-foreground text-sm">
          Selecciona un paciente para abrir o crear su expediente
        </div>
      )}
    </div>
  );
}
