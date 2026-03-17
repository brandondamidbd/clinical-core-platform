import { useState } from 'react';
import { useMedicationStore } from '@/stores/catalogStores';
import { Plus, X, Search } from 'lucide-react';

export default function MedicationsPage() {
  const medications = useMedicationStore((s) => s.medications);
  const addMedication = useMedicationStore((s) => s.addMedication);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', category: '', mainUse: '', presentation: '', usualDose: '', warnings: '' });

  const filtered = medications.filter(m => !m.metadata.isArchived && (m.name.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase())));

  const handleSubmit = () => {
    if (!form.name || !form.category) return;
    addMedication({ ...form, isActive: true });
    setShowForm(false);
    setForm({ name: '', category: '', mainUse: '', presentation: '', usualDose: '', warnings: '' });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Catálogo de Medicamentos</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90">
          <Plus className="w-3.5 h-3.5" /> Nuevo Medicamento
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar medicamento..." className="input-clinical pl-8 h-8 text-xs" />
      </div>

      <div className="card-clinical overflow-hidden">
        <table className="w-full table-clinical text-xs">
          <thead><tr className="border-b"><th className="p-2 text-left">Medicamento</th><th className="p-2 text-left">Categoría</th><th className="p-2 text-left">Presentación</th><th className="p-2 text-left">Dosis habitual</th><th className="p-2 text-left">Advertencias</th></tr></thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} className="border-b last:border-0">
                <td className="p-2 font-medium">{m.name}</td>
                <td className="p-2 text-muted-foreground">{m.category}</td>
                <td className="p-2">{m.presentation}</td>
                <td className="p-2 font-mono text-[11px]">{m.usualDose}</td>
                <td className="p-2 text-destructive/80">{m.warnings || '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Sin resultados</td></tr>}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-foreground/20 z-50 flex justify-end">
          <div className="w-full max-w-md bg-card h-full overflow-auto shadow-elevated animate-slide-in p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">Nuevo Medicamento</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium mb-1 block">Nombre *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-clinical h-9" /></div>
              <div><label className="text-xs font-medium mb-1 block">Categoría *</label><input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-clinical h-9" placeholder="Ej: Antibiótico, AINE..." /></div>
              <div><label className="text-xs font-medium mb-1 block">Uso principal</label><input value={form.mainUse} onChange={e => setForm(f => ({ ...f, mainUse: e.target.value }))} className="input-clinical h-9" /></div>
              <div><label className="text-xs font-medium mb-1 block">Presentación</label><input value={form.presentation} onChange={e => setForm(f => ({ ...f, presentation: e.target.value }))} className="input-clinical h-9" /></div>
              <div><label className="text-xs font-medium mb-1 block">Dosis habitual</label><input value={form.usualDose} onChange={e => setForm(f => ({ ...f, usualDose: e.target.value }))} className="input-clinical h-9" /></div>
              <div><label className="text-xs font-medium mb-1 block">Advertencias</label><textarea value={form.warnings} onChange={e => setForm(f => ({ ...f, warnings: e.target.value }))} className="input-clinical min-h-[60px] py-2" /></div>
              <button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground text-xs py-2 rounded-md hover:bg-primary/90 font-medium">Guardar Medicamento</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
