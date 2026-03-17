import { useTreatmentStore, useServiceStore } from '@/stores/catalogStores';
import { usePatientStore } from '@/stores/patientStore';
import { useDoctorStore } from '@/stores/doctorStore';
import { useState, useMemo } from 'react';
import { Plus, X } from 'lucide-react';
import type { TreatmentStatus } from '@/types';

const STATUS_LABELS: Record<TreatmentStatus, string> = { recommended: 'Recomendado', budgeted: 'Presupuestado', approved: 'Aprobado', in_progress: 'En proceso', completed: 'Completado', paid: 'Pagado', historical: 'Histórico' };

export default function TreatmentsPage() {
  const treatments = useTreatmentStore(s => s.treatments);
  const addTreatment = useTreatmentStore(s => s.addTreatment);
  const updateTreatment = useTreatmentStore(s => s.updateTreatment);
  const allPatients = usePatientStore(s => s.patients);
  const allDoctors = useDoctorStore(s => s.doctors);
  const allServices = useServiceStore(s => s.services);
  const patients = useMemo(() => allPatients.filter(p => !p.metadata.isArchived), [allPatients]);
  const doctors = useMemo(() => allDoctors.filter(d => d.isActive), [allDoctors]);
  const services = useMemo(() => allServices.filter(s => s.isActive), [allServices]);
  const services = useServiceStore(s => s.services.filter(s => s.isActive));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patientId: '', doctorId: doctors[0]?.id || '', description: '', price: '', observations: '' });

  const handleSubmit = () => {
    if (!form.patientId || !form.description || !form.price) return;
    addTreatment({ patientId: form.patientId, doctorId: form.doctorId, description: form.description, price: parseFloat(form.price), observations: form.observations, status: 'recommended' });
    setShowForm(false); setForm({ patientId: '', doctorId: doctors[0]?.id || '', description: '', price: '', observations: '' });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Tratamientos</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90"><Plus className="w-3.5 h-3.5" /> Nuevo</button>
      </div>
      <div className="card-clinical overflow-hidden">
        <table className="w-full table-clinical text-xs">
          <thead><tr className="border-b"><th className="p-2 text-left">Paciente</th><th className="p-2 text-left">Tratamiento</th><th className="p-2 text-right">Precio</th><th className="p-2 text-left">Estado</th></tr></thead>
          <tbody>
            {treatments.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Sin tratamientos</td></tr> :
              treatments.map(t => {
                const pt = patients.find(p => p.id === t.patientId);
                return (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="p-2 font-medium">{pt ? `${pt.firstName} ${pt.lastName}` : '—'}</td>
                    <td className="p-2">{t.description}</td>
                    <td className="p-2 text-right font-mono">${t.price.toLocaleString()}</td>
                    <td className="p-2"><select value={t.status} onChange={e => updateTreatment(t.id, { status: e.target.value as TreatmentStatus })} className="text-[10px] border rounded px-1.5 py-0.5 bg-card">
                      {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select></td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-foreground/20 z-50 flex justify-end">
          <div className="w-full max-w-md bg-card h-full overflow-auto shadow-elevated animate-slide-in p-5">
            <div className="flex items-center justify-between mb-4"><h2 className="text-sm font-semibold">Nuevo Tratamiento</h2><button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button></div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium mb-1 block">Paciente *</label><select value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))} className="input-clinical h-9"><option value="">Seleccionar</option>{patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}</select></div>
              <div><label className="text-xs font-medium mb-1 block">Médico</label><select value={form.doctorId} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))} className="input-clinical h-9">{doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}</select></div>
              <div><label className="text-xs font-medium mb-1 block">Descripción / Servicio *</label>
                <select onChange={e => { const s = services.find(sv => sv.id === e.target.value); if (s) setForm(f => ({ ...f, description: s.name, price: String(s.price) })); }} className="input-clinical h-8 text-[11px] mb-1"><option value="">Del catálogo...</option>{services.map(s => <option key={s.id} value={s.id}>{s.name} — ${s.price}</option>)}</select>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-clinical h-9" />
              </div>
              <div><label className="text-xs font-medium mb-1 block">Precio *</label><input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="input-clinical h-9" /></div>
              <div><label className="text-xs font-medium mb-1 block">Observaciones</label><textarea value={form.observations} onChange={e => setForm(f => ({ ...f, observations: e.target.value }))} className="input-clinical min-h-[60px] py-2" /></div>
              <button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground text-xs py-2 rounded-md hover:bg-primary/90 font-medium">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
