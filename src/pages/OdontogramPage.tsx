import { useState, useMemo } from 'react';
import { useOdontogramStore } from '@/stores/catalogStores';
import { usePatientStore } from '@/stores/patientStore';
import { generateId } from '@/stores/helpers';
import type { ToothStatus, OdontogramSurface } from '@/types';
import { Search, RotateCcw } from 'lucide-react';

const STATUS_COLORS: Record<ToothStatus, string> = {
  sano: 'transparent', caries: '#ef4444', obturado: '#3b82f6', fracturado: '#f97316',
  ausente: '#d1d5db', extraccion_indicada: '#dc2626', endodoncia: '#8b5cf6',
  corona: '#eab308', sellador: '#06b6d4', movilidad: '#f59e0b',
  remanente_radicular: '#6b7280', protesis: '#14b8a6', implante: '#6366f1', otro: '#9ca3af',
};

const STATUS_LABELS: Record<ToothStatus, string> = {
  sano: 'Sano', caries: 'Caries', obturado: 'Obturado', fracturado: 'Fracturado',
  ausente: 'Ausente', extraccion_indicada: 'Extracción indicada', endodoncia: 'Endodoncia',
  corona: 'Corona', sellador: 'Sellador', movilidad: 'Movilidad',
  remanente_radicular: 'Remanente radicular', protesis: 'Prótesis', implante: 'Implante', otro: 'Otro',
};

const SURFACES: OdontogramSurface[] = ['vestibular', 'palatal', 'mesial', 'distal', 'occlusal'];

const PERMANENT_TEETH = {
  q1: [18,17,16,15,14,13,12,11],
  q2: [21,22,23,24,25,26,27,28],
  q4: [48,47,46,45,44,43,42,41],
  q3: [31,32,33,34,35,36,37,38],
};

const TEMPORARY_TEETH = {
  q5: [55,54,53,52,51],
  q6: [61,62,63,64,65],
  q8: [85,84,83,82,81],
  q7: [71,72,73,74,75],
};

function ToothSVG({ number, findings, onSurfaceClick, selectedStatus }: {
  number: number; findings: any[]; onSurfaceClick: (surface: OdontogramSurface) => void; selectedStatus: ToothStatus;
}) {
  const size = 40;
  const c = size / 2;
  const r = size / 2 - 2;
  const ir = r * 0.4;

  const getColor = (surface: OdontogramSurface) => {
    const f = findings.find(f => f.surface === surface);
    return f ? STATUS_COLORS[f.status as ToothStatus] || '#9ca3af' : 'transparent';
  };

  const wholeToothFinding = findings.find(f => !f.surface);
  const isAbsent = wholeToothFinding?.status === 'ausente';
  const opacity = isAbsent ? 0.2 : 1;

  return (
    <div className="flex flex-col items-center gap-0.5" style={{ opacity }}>
      <span className="text-[9px] font-mono text-muted-foreground">{number}</span>
      <svg width={size} height={size} className="cursor-pointer">
        {/* Vestibular (top) */}
        <path d={`M ${c-ir} ${c-ir} L ${2} ${2} L ${size-2} ${2} L ${c+ir} ${c-ir} Z`}
          fill={getColor('vestibular')} stroke="hsl(var(--border))" strokeWidth="1"
          onClick={() => onSurfaceClick('vestibular')} className="hover:opacity-70" />
        {/* Palatal (bottom) */}
        <path d={`M ${c-ir} ${c+ir} L ${2} ${size-2} L ${size-2} ${size-2} L ${c+ir} ${c+ir} Z`}
          fill={getColor('palatal')} stroke="hsl(var(--border))" strokeWidth="1"
          onClick={() => onSurfaceClick('palatal')} className="hover:opacity-70" />
        {/* Mesial (right) */}
        <path d={`M ${c+ir} ${c-ir} L ${size-2} ${2} L ${size-2} ${size-2} L ${c+ir} ${c+ir} Z`}
          fill={getColor('mesial')} stroke="hsl(var(--border))" strokeWidth="1"
          onClick={() => onSurfaceClick('mesial')} className="hover:opacity-70" />
        {/* Distal (left) */}
        <path d={`M ${c-ir} ${c-ir} L ${2} ${2} L ${2} ${size-2} L ${c-ir} ${c+ir} Z`}
          fill={getColor('distal')} stroke="hsl(var(--border))" strokeWidth="1"
          onClick={() => onSurfaceClick('distal')} className="hover:opacity-70" />
        {/* Occlusal (center) */}
        <rect x={c-ir} y={c-ir} width={ir*2} height={ir*2}
          fill={getColor('occlusal')} stroke="hsl(var(--border))" strokeWidth="1"
          onClick={() => onSurfaceClick('occlusal')} className="hover:opacity-70" />
      </svg>
    </div>
  );
}

export default function OdontogramPage() {
  const patients = usePatientStore((s) => s.patients.filter(p => !p.metadata.isArchived));
  const findings = useOdontogramStore((s) => s.findings);
  const addFinding = useOdontogramStore((s) => s.addFinding);
  const removeFinding = useOdontogramStore((s) => s.removeFinding);

  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ToothStatus>('caries');
  const [comment, setComment] = useState('');
  const [dentition, setDentition] = useState<'permanent' | 'temporary'>('permanent');

  const patientFindings = useMemo(() => findings.filter(f => f.patientId === selectedPatient), [findings, selectedPatient]);

  const handleSurfaceClick = (toothNumber: number, surface: OdontogramSurface) => {
    if (!selectedPatient) return;
    // Check existing
    const existing = patientFindings.find(f => f.toothNumber === toothNumber && f.surface === surface);
    if (existing) {
      removeFinding(existing.id);
      if (existing.status === selectedStatus) return; // toggle off
    }
    addFinding({
      patientId: selectedPatient, recordId: '', toothNumber, surface, status: selectedStatus,
      comment, date: new Date().toISOString(),
    });
  };

  const teeth = dentition === 'permanent' ? PERMANENT_TEETH : TEMPORARY_TEETH;
  const upperLeft = dentition === 'permanent' ? teeth.q1 : (teeth as any).q5;
  const upperRight = dentition === 'permanent' ? teeth.q2 : (teeth as any).q6;
  const lowerLeft = dentition === 'permanent' ? teeth.q4 : (teeth as any).q8;
  const lowerRight = dentition === 'permanent' ? teeth.q3 : (teeth as any).q7;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Odontograma</h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border text-xs">
            <button onClick={() => setDentition('permanent')} className={`px-3 py-1.5 ${dentition === 'permanent' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>Permanente</button>
            <button onClick={() => setDentition('temporary')} className={`px-3 py-1.5 ${dentition === 'temporary' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>Temporal</button>
          </div>
        </div>
      </div>

      {/* Patient selector */}
      <div className="card-clinical p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-medium mb-1 block">Paciente</label>
            <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} className="input-clinical h-9">
              <option value="">Seleccionar paciente</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Estado a aplicar</label>
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value as ToothStatus)} className="input-clinical h-9">
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs font-medium mb-1 block">Comentario</label>
            <input value={comment} onChange={e => setComment(e.target.value)} className="input-clinical h-9" placeholder="Opcional" />
          </div>
        </div>

        {/* Color legend */}
        <div className="flex flex-wrap gap-2 mt-3">
          {Object.entries(STATUS_LABELS).filter(([k]) => k !== 'sano').map(([k, v]) => (
            <div key={k} className="flex items-center gap-1 text-[10px]">
              <div className="w-3 h-3 rounded-sm border" style={{ backgroundColor: STATUS_COLORS[k as ToothStatus] }} />
              {v}
            </div>
          ))}
        </div>
      </div>

      {/* Odontogram */}
      {selectedPatient ? (
        <div className="card-clinical p-6">
          <div className="flex flex-col items-center gap-6">
            {/* Upper */}
            <div className="flex gap-1 items-end">
              <div className="flex gap-0.5">
                {upperLeft.map((t: number) => (
                  <ToothSVG key={t} number={t} findings={patientFindings.filter(f => f.toothNumber === t)}
                    onSurfaceClick={(s) => handleSurfaceClick(t, s)} selectedStatus={selectedStatus} />
                ))}
              </div>
              <div className="w-px h-12 bg-border mx-2" />
              <div className="flex gap-0.5">
                {upperRight.map((t: number) => (
                  <ToothSVG key={t} number={t} findings={patientFindings.filter(f => f.toothNumber === t)}
                    onSurfaceClick={(s) => handleSurfaceClick(t, s)} selectedStatus={selectedStatus} />
                ))}
              </div>
            </div>
            <div className="w-full h-px bg-border" />
            {/* Lower */}
            <div className="flex gap-1 items-start">
              <div className="flex gap-0.5">
                {lowerLeft.map((t: number) => (
                  <ToothSVG key={t} number={t} findings={patientFindings.filter(f => f.toothNumber === t)}
                    onSurfaceClick={(s) => handleSurfaceClick(t, s)} selectedStatus={selectedStatus} />
                ))}
              </div>
              <div className="w-px h-12 bg-border mx-2" />
              <div className="flex gap-0.5">
                {lowerRight.map((t: number) => (
                  <ToothSVG key={t} number={t} findings={patientFindings.filter(f => f.toothNumber === t)}
                    onSurfaceClick={(s) => handleSurfaceClick(t, s)} selectedStatus={selectedStatus} />
                ))}
              </div>
            </div>
          </div>

          {/* Findings table */}
          {patientFindings.length > 0 && (
            <div className="mt-6">
              <h3 className="section-title">Hallazgos Registrados</h3>
              <table className="w-full table-clinical text-xs">
                <thead><tr className="border-b"><th className="p-2 text-left">Pieza</th><th className="p-2 text-left">Cara</th><th className="p-2 text-left">Estado</th><th className="p-2 text-left">Comentario</th><th className="p-2 text-left">Fecha</th><th className="p-2"></th></tr></thead>
                <tbody>
                  {patientFindings.map(f => (
                    <tr key={f.id} className="border-b last:border-0">
                      <td className="p-2 font-mono">{f.toothNumber}</td>
                      <td className="p-2 capitalize">{f.surface || '—'}</td>
                      <td className="p-2"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[f.status] }} />{STATUS_LABELS[f.status]}</span></td>
                      <td className="p-2 text-muted-foreground">{f.comment || '—'}</td>
                      <td className="p-2 font-mono">{f.date.split('T')[0]}</td>
                      <td className="p-2"><button onClick={() => removeFinding(f.id)} className="text-destructive hover:underline">Eliminar</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="card-clinical p-12 text-center text-muted-foreground text-sm">
          Selecciona un paciente para usar el odontograma
        </div>
      )}
    </div>
  );
}
