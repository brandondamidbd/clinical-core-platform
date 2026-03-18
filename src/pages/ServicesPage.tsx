import { useState } from 'react';
import { useServiceStore } from '@/stores/catalogStores';
import { Plus, X, Edit2, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function ServicesPage() {
  const services = useServiceStore(s => s.services);
  const addService = useServiceStore(s => s.addService);
  const updateService = useServiceStore(s => s.updateService);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', price: '', description: '', category: '' });

  const filtered = services.filter(s => !s.metadata.isArchived && (s.name.toLowerCase().includes(search.toLowerCase()) || (s.category || '').toLowerCase().includes(search.toLowerCase())));
  const categories = [...new Set(filtered.map(s => s.category).filter(Boolean))];

  const openEdit = (id: string) => {
    const s = services.find(sv => sv.id === id);
    if (s) { setForm({ name: s.name, price: String(s.price), description: s.description || '', category: s.category || '' }); setEditId(id); setShowForm(true); }
  };

  const handleSubmit = () => {
    if (!form.name || !form.price) return;
    if (editId) {
      updateService(editId, { name: form.name, price: parseFloat(form.price), description: form.description, category: form.category });
      toast.success('Servicio actualizado');
    } else {
      addService({ name: form.name, price: parseFloat(form.price), description: form.description, category: form.category, isActive: true });
      toast.success('Servicio creado');
    }
    setShowForm(false); setEditId(null);
    setForm({ name: '', price: '', description: '', category: '' });
  };

  const toggleActive = (id: string) => {
    const s = services.find(sv => sv.id === id);
    if (s) { updateService(id, { isActive: !s.isActive }); toast.success(s.isActive ? 'Servicio desactivado' : 'Servicio activado'); }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Catálogo de Servicios</h1>
        <button onClick={() => { setEditId(null); setForm({ name: '', price: '', description: '', category: '' }); setShowForm(true); }} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90">
          <Plus className="w-3.5 h-3.5" /> Nuevo Servicio
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar servicio..." className="input-clinical pl-8 h-8 text-xs" />
      </div>

      {categories.map(cat => (
        <div key={cat} className="card-clinical overflow-hidden">
          <div className="px-4 py-2 bg-muted/50 border-b"><span className="text-xs font-semibold">{cat}</span></div>
          <table className="w-full table-clinical text-xs">
            <thead><tr className="border-b"><th className="p-2 text-left">Servicio</th><th className="p-2 text-left">Descripción</th><th className="p-2 text-right">Precio</th><th className="p-2 text-center">Estado</th><th className="p-2"></th></tr></thead>
            <tbody>
              {filtered.filter(s => s.category === cat).map(s => (
                <tr key={s.id} className={`border-b last:border-0 ${!s.isActive ? 'opacity-50' : ''}`}>
                  <td className="p-2 font-medium">{s.name}</td>
                  <td className="p-2 text-muted-foreground">{s.description || '—'}</td>
                  <td className="p-2 text-right font-mono">${s.price.toLocaleString()}</td>
                  <td className="p-2 text-center">
                    <button onClick={() => toggleActive(s.id)} className={`text-[10px] px-1.5 py-0.5 rounded ${s.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {s.isActive ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="p-2"><button onClick={() => openEdit(s.id)} className="p-1 rounded hover:bg-muted"><Edit2 className="w-3 h-3 text-muted-foreground" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {filtered.filter(s => !s.category).length > 0 && (
        <div className="card-clinical overflow-hidden">
          <div className="px-4 py-2 bg-muted/50 border-b"><span className="text-xs font-semibold">Sin categoría</span></div>
          <table className="w-full table-clinical text-xs">
            <tbody>
              {filtered.filter(s => !s.category).map(s => (
                <tr key={s.id} className={`border-b last:border-0 ${!s.isActive ? 'opacity-50' : ''}`}>
                  <td className="p-2 font-medium">{s.name}</td><td className="p-2 text-right font-mono">${s.price.toLocaleString()}</td>
                  <td className="p-2"><button onClick={() => toggleActive(s.id)} className={`text-[10px] px-1.5 py-0.5 rounded ${s.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{s.isActive ? 'Activo' : 'Inactivo'}</button></td>
                  <td className="p-2"><button onClick={() => openEdit(s.id)} className="p-1 rounded hover:bg-muted"><Edit2 className="w-3 h-3 text-muted-foreground" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-foreground/20 z-50 flex justify-end">
          <div className="w-full max-w-md bg-card h-full overflow-auto shadow-elevated animate-slide-in p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">{editId ? 'Editar' : 'Nuevo'} Servicio</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium mb-1 block">Nombre *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-clinical h-9" /></div>
              <div><label className="text-xs font-medium mb-1 block">Categoría</label><input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-clinical h-9" placeholder="Ej: Prevención, Cirugía..." /></div>
              <div><label className="text-xs font-medium mb-1 block">Precio *</label><input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="input-clinical h-9" /></div>
              <div><label className="text-xs font-medium mb-1 block">Descripción</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-clinical min-h-[60px] py-2" /></div>
              <button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground text-xs py-2 rounded-md hover:bg-primary/90 font-medium">{editId ? 'Actualizar' : 'Guardar'} Servicio</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
