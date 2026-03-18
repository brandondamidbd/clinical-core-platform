import { useState, useMemo } from 'react';
import { useMedicalRecordStore } from '@/stores/catalogStores';
import { usePatientStore } from '@/stores/patientStore';
import { useDoctorStore } from '@/stores/doctorStore';
import { Search, Stethoscope, User } from 'lucide-react';
import { format } from 'date-fns';

export function DiagnosticsPage() {
  const records = useMedicalRecordStore((s) => s.records);
  const patients = usePatientStore((s) => s.patients);
  const doctors = useDoctorStore((s) => s.doctors);
  const [search, setSearch] = useState('');
  const [filterPatient, setFilterPatient] = useState('');

  const allDiagnoses = useMemo(() => {
    const result: { id: string; name: string; code: string; description: string; isPrimary: boolean; date: string; patientId: string; doctorId: string }[] = [];
    records.forEach(r => {
      (r.diagnoses || []).forEach(d => {
        result.push({ ...d, patientId: r.patientId, doctorId: r.doctorId });
      });
    });
    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [records]);

  const filtered = useMemo(() => {
    let list = allDiagnoses;
    if (filterPatient) list = list.filter(d => d.patientId === filterPatient);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(d => d.name.toLowerCase().includes(q) || (d.code && d.code.toLowerCase().includes(q)));
    }
    return list;
  }, [allDiagnoses, filterPatient, search]);

  const activePatients = patients.filter(p => !p.metadata.isArchived);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2"><Stethoscope className="w-5 h-5" /> Diagnósticos</h1>
        <span className="meta-text">{allDiagnoses.length} diagnóstico(s) registrados</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar diagnóstico o CIE-10..." className="input-clinical pl-8 h-8 text-xs" />
        </div>
        <select value={filterPatient} onChange={e => setFilterPatient(e.target.value)} className="input-clinical h-8 text-xs w-56">
          <option value="">Todos los pacientes</option>
          {activePatients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
        </select>
      </div>

      <div className="card-clinical overflow-hidden">
        <table className="w-full table-clinical text-xs">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Diagnóstico</th>
              <th className="p-2 text-left">CIE-10</th>
              <th className="p-2 text-left">Paciente</th>
              <th className="p-2 text-left">Médico</th>
              <th className="p-2 text-left">Fecha</th>
              <th className="p-2 text-center">Primario</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">
                {allDiagnoses.length === 0 ? 'Sin diagnósticos. Registra diagnósticos desde Nueva Consulta o Expediente.' : 'Sin resultados para la búsqueda'}
              </td></tr>
            ) : filtered.map(d => {
              const pt = patients.find(p => p.id === d.patientId);
              const doc = doctors.find(dr => dr.id === d.doctorId);
              return (
                <tr key={d.id} className="border-b last:border-0">
                  <td className="p-2 font-medium">{d.name}</td>
                  <td className="p-2 font-mono text-muted-foreground">{d.code || '—'}</td>
                  <td className="p-2">{pt ? `${pt.firstName} ${pt.lastName}` : '—'}</td>
                  <td className="p-2 text-muted-foreground">{doc?.fullName || '—'}</td>
                  <td className="p-2 font-mono">{d.date}</td>
                  <td className="p-2 text-center">{d.isPrimary ? <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Primario</span> : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ClinicalNotesPage() {
  const records = useMedicalRecordStore((s) => s.records);
  const patients = usePatientStore((s) => s.patients);
  const [filterPatient, setFilterPatient] = useState('');
  const [search, setSearch] = useState('');

  const allNotes = useMemo(() => {
    const result: { id: string; date: string; time: string; authorName: string; content: string; isLocked: boolean; patientId: string }[] = [];
    records.forEach(r => {
      (r.notes || []).forEach(n => {
        result.push({ ...n, patientId: r.patientId });
      });
    });
    return result.sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
  }, [records]);

  const filtered = useMemo(() => {
    let list = allNotes;
    if (filterPatient) list = list.filter(n => n.patientId === filterPatient);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(n => n.content.toLowerCase().includes(q) || n.authorName.toLowerCase().includes(q));
    }
    return list;
  }, [allNotes, filterPatient, search]);

  const activePatients = patients.filter(p => !p.metadata.isArchived);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Notas Médicas</h1>
        <span className="meta-text">{allNotes.length} nota(s)</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar en contenido..." className="input-clinical pl-8 h-8 text-xs" />
        </div>
        <select value={filterPatient} onChange={e => setFilterPatient(e.target.value)} className="input-clinical h-8 text-xs w-56">
          <option value="">Todos los pacientes</option>
          {activePatients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="card-clinical p-8 text-center text-sm text-muted-foreground">
            {allNotes.length === 0 ? 'Sin notas médicas. Las notas se crean desde Nueva Consulta o Expediente.' : 'Sin resultados'}
          </div>
        ) : filtered.map(n => {
          const pt = patients.find(p => p.id === n.patientId);
          return (
            <div key={n.id} className="card-clinical p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium">{pt ? `${pt.firstName} ${pt.lastName}` : '—'}</span>
                  <span className="text-[10px] text-muted-foreground">por {n.authorName}</span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">{n.date} {n.time}</span>
              </div>
              <p className="text-xs text-foreground whitespace-pre-wrap">{n.content}</p>
              {n.isLocked && <span className="text-[10px] text-muted-foreground mt-1 block">Nota bloqueada</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AuxStudiesPage() {
  const records = useMedicalRecordStore((s) => s.records);
  const patients = usePatientStore((s) => s.patients);
  const [filterPatient, setFilterPatient] = useState('');

  const allStudies = useMemo(() => {
    const result: { id: string; type: string; description: string; date: string; links: string[]; isCurrent: boolean; patientId: string }[] = [];
    records.forEach(r => {
      (r.auxiliaryStudies || []).forEach(s => {
        result.push({ ...s, patientId: r.patientId });
      });
    });
    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [records]);

  const filtered = filterPatient ? allStudies.filter(s => s.patientId === filterPatient) : allStudies;
  const activePatients = patients.filter(p => !p.metadata.isArchived);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Estudios Auxiliares de Diagnóstico</h1>
        <span className="meta-text">{allStudies.length} estudio(s)</span>
      </div>

      <select value={filterPatient} onChange={e => setFilterPatient(e.target.value)} className="input-clinical h-8 text-xs w-56">
        <option value="">Todos los pacientes</option>
        {activePatients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
      </select>

      <div className="card-clinical overflow-hidden">
        <table className="w-full table-clinical text-xs">
          <thead>
            <tr className="border-b"><th className="p-2 text-left">Tipo</th><th className="p-2 text-left">Descripción</th><th className="p-2 text-left">Paciente</th><th className="p-2 text-left">Fecha</th><th className="p-2 text-left">Enlaces</th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">
                {allStudies.length === 0 ? 'Sin estudios auxiliares. Agrégalos desde Nueva Consulta o Expediente.' : 'Sin resultados'}
              </td></tr>
            ) : filtered.map(s => {
              const pt = patients.find(p => p.id === s.patientId);
              return (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="p-2 font-medium">{s.type}</td>
                  <td className="p-2 text-muted-foreground">{s.description}</td>
                  <td className="p-2">{pt ? `${pt.firstName} ${pt.lastName}` : '—'}</td>
                  <td className="p-2 font-mono">{s.date}</td>
                  <td className="p-2">
                    {s.links.length > 0 ? s.links.map((l, i) => (
                      <a key={i} href={l} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline block">{l.length > 30 ? l.slice(0, 30) + '...' : l}</a>
                    )) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
