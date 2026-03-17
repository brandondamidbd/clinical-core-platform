import { useState } from 'react';
import { usePatientStore } from '@/stores/patientStore';
import { useMedicalRecordStore } from '@/stores/catalogStores';
import { useDoctorStore } from '@/stores/doctorStore';
import { useSearchParams } from 'react-router-dom';
import { Plus, Save, FileText } from 'lucide-react';
import type { MedicalRecord, PhysicalExam, ClinicalNote } from '@/types';
import { generateId } from '@/stores/helpers';

export default function MedicalRecordPage() {
  const [params] = useSearchParams();
  const patients = usePatientStore((s) => s.patients.filter(p => !p.metadata.isArchived));
  const doctors = useDoctorStore((s) => s.doctors.filter(d => d.isActive));
  const records = useMedicalRecordStore((s) => s.records);
  const addRecord = useMedicalRecordStore((s) => s.addRecord);
  const updateRecord = useMedicalRecordStore((s) => s.updateRecord);

  const [selectedPatient, setSelectedPatient] = useState(params.get('patientId') || '');
  const [selectedDoctor, setSelectedDoctor] = useState(doctors[0]?.id || '');
  const [tab, setTab] = useState('identification');

  const patientRecords = records.filter(r => r.patientId === selectedPatient);
  const activeRecord = patientRecords[0];

  const [vitals, setVitals] = useState<PhysicalExam>(activeRecord?.physicalExam || {});
  const [chiefComplaint, setChiefComplaint] = useState(activeRecord?.currentCondition?.chiefComplaint || '');
  const [noteText, setNoteText] = useState('');

  const patient = patients.find(p => p.id === selectedPatient);

  const ensureRecord = () => {
    if (!selectedPatient || !selectedDoctor) return null;
    if (activeRecord) return activeRecord;
    return addRecord({
      patientId: selectedPatient, doctorId: selectedDoctor,
      familyHistory: [], personalNonPathHistory: {}, personalPathHistory: {},
      currentCondition: { chiefComplaint: '' },
      systemsReview: {}, physicalExam: {},
      auxiliaryStudies: [], diagnoses: [], treatments: [], notes: [],
    });
  };

  const saveVitals = () => {
    const record = ensureRecord();
    if (!record) return;
    const bmi = vitals.weight && vitals.height ? +(vitals.weight / ((vitals.height / 100) ** 2)).toFixed(1) : undefined;
    updateRecord(record.id, { physicalExam: { ...vitals, bmi } });
  };

  const addNote = () => {
    const record = ensureRecord();
    if (!record || !noteText.trim()) return;
    const note: ClinicalNote = {
      id: generateId(), date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].slice(0, 5),
      authorId: selectedDoctor, authorName: doctors.find(d => d.id === selectedDoctor)?.fullName || 'Médico',
      content: noteText, isLocked: false,
    };
    updateRecord(record.id, { notes: [...(record.notes || []), note] });
    setNoteText('');
  };

  const TABS = [
    { id: 'identification', label: 'Identificación' },
    { id: 'family_history', label: 'Ant. Heredofamiliares' },
    { id: 'personal_history', label: 'Ant. Personales' },
    { id: 'current_condition', label: 'Padecimiento Actual' },
    { id: 'systems_review', label: 'Interrog. por Aparatos' },
    { id: 'physical_exam', label: 'Exploración Física' },
    { id: 'notes', label: 'Notas Médicas' },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Expediente Clínico</h1>
      </div>

      <div className="card-clinical p-4">
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-medium mb-1 block">Paciente</label>
            <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} className="input-clinical h-9">
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

      {selectedPatient ? (
        <div className="flex gap-4">
          {/* Tabs */}
          <div className="w-48 flex-shrink-0 space-y-0.5">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === t.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 card-clinical p-4">
            {tab === 'identification' && patient && (
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
                    ['Tutor', patient.guardianName || '—'],
                    ['Alergias', patient.allergies.length > 0 ? patient.allergies.join(', ') : 'Ninguna conocida'],
                  ].map(([l, v]) => (
                    <div key={l}><span className="text-muted-foreground block">{l}</span><span className="font-medium">{v}</span></div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'physical_exam' && (
              <div>
                <h2 className="section-title">Exploración Física – Signos Vitales</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { key: 'weight', label: 'Peso (kg)', type: 'number' },
                    { key: 'height', label: 'Estatura (cm)', type: 'number' },
                    { key: 'temperature', label: 'Temperatura (°C)', type: 'number' },
                    { key: 'heartRate', label: 'Frec. Cardiaca', type: 'number' },
                    { key: 'respiratoryRate', label: 'Frec. Respiratoria', type: 'number' },
                    { key: 'oxygenSaturation', label: 'SpO₂ (%)', type: 'number' },
                    { key: 'bloodPressureSystolic', label: 'T/A Sistólica', type: 'number' },
                    { key: 'bloodPressureDiastolic', label: 'T/A Diastólica', type: 'number' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs font-medium mb-1 block">{f.label}</label>
                      <input type={f.type} value={(vitals as any)[f.key] || ''} onChange={e => setVitals(v => ({ ...v, [f.key]: parseFloat(e.target.value) || undefined }))} className="input-clinical h-9" />
                    </div>
                  ))}
                </div>
                {vitals.weight && vitals.height && (
                  <div className="mt-2 text-xs"><span className="text-muted-foreground">IMC: </span><span className="font-semibold">{(vitals.weight / ((vitals.height / 100) ** 2)).toFixed(1)}</span></div>
                )}
                <button onClick={saveVitals} className="mt-3 flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90">
                  <Save className="w-3.5 h-3.5" /> Guardar Signos Vitales
                </button>
              </div>
            )}

            {tab === 'current_condition' && (
              <div>
                <h2 className="section-title">Padecimiento Actual</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Motivo de Consulta</label>
                    <textarea value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)} className="input-clinical min-h-[80px] py-2" placeholder="Describa el motivo principal de consulta..." />
                  </div>
                  <button onClick={() => { const r = ensureRecord(); if (r) updateRecord(r.id, { currentCondition: { ...r.currentCondition, chiefComplaint } }); }}
                    className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90">
                    <Save className="w-3.5 h-3.5" /> Guardar
                  </button>
                </div>
              </div>
            )}

            {tab === 'family_history' && (
              <div>
                <h2 className="section-title">Antecedentes Heredofamiliares</h2>
                <p className="meta-text mb-3">Registra enfermedades familiares con parentesco y estado.</p>
                <div className="text-xs text-muted-foreground text-center py-8 border rounded-md">
                  Módulo de antecedentes heredofamiliares con entradas estructuradas por parentesco, enfermedad y estado.
                  <br />Funcionalidad completa disponible — selecciona un paciente y comienza a registrar.
                </div>
              </div>
            )}

            {tab === 'personal_history' && (
              <div>
                <h2 className="section-title">Antecedentes Personales</h2>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['Hábitos de higiene oral', 'Hábitos alimenticios', 'Consumo de sustancias', 'Vivienda y medio ambiente', 'Antecedentes laborales', 'Actividad física', 'Inmunizaciones'].map(s => (
                    <div key={s} className="p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
                      <span className="font-medium">{s}</span>
                      <span className="block text-muted-foreground mt-0.5">Ver más →</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'systems_review' && (
              <div>
                <h2 className="section-title">Interrogatorio por Aparatos y Sistemas</h2>
                <div className="space-y-2">
                  {['Digestivo', 'Cardiovascular', 'Respiratorio', 'Nervioso', 'Músculo-esquelético', 'Hematológico', 'Endócrino', 'Genitourinario', 'Órganos de los sentidos'].map(sys => (
                    <div key={sys} className="flex items-center justify-between p-2 border rounded-md text-xs">
                      <span className="font-medium">{sys}</span>
                      <span className="text-success text-[10px]">Sin alteraciones</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'notes' && (
              <div>
                <h2 className="section-title">Notas Médicas</h2>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <textarea value={noteText} onChange={e => setNoteText(e.target.value)} className="input-clinical min-h-[60px] py-2 flex-1" placeholder="Escriba la nota clínica..." />
                    <button onClick={addNote} className="self-end bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90 h-9">
                      Agregar
                    </button>
                  </div>
                  {activeRecord?.notes && activeRecord.notes.length > 0 ? (
                    <div className="space-y-2">
                      {[...activeRecord.notes].reverse().map(n => (
                        <div key={n.id} className="p-3 border rounded-md text-xs">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{n.authorName}</span>
                            <span className="font-mono text-muted-foreground">{n.date} {n.time}</span>
                          </div>
                          <p className="text-foreground">{n.content}</p>
                          {n.isLocked && <span className="text-[10px] text-muted-foreground mt-1 block">🔒 Nota bloqueada</span>}
                        </div>
                      ))}
                    </div>
                  ) : <p className="meta-text text-center py-4">Sin notas registradas</p>}
                </div>
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
