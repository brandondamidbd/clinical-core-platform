import { useState } from 'react';
import { useServiceStore } from '@/stores/catalogStores';
import { Plus, X, Pencil } from 'lucide-react';

export default function ServicesPage() {
  const services = useServiceStore((s) => s.services);
  const addService = useServiceStore((s) => s.addService);
  const updateService = useServiceStore((s) => s.updateService);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', description: '', category: '' });

  const handleSubmit = () => {
    if (!form.name || !form.price) return;
    addService({ name: form.name, price: parseFloat(form.price), description: form.description, category: form.category, isActive: true });
    setShowForm(false);
    setForm({ name: '', price: '', description: '', category: '' });
  };

  const categories = [...new Set(services.map(s => s.category).filter(Boolean))];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Catálogo de Servicios</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90">
          <Plus className="w-3.5 h-3.5" /> Nuevo Servicio
        </button>
      </div>

      {categories.map(cat => (
        <div key={cat} className="card-clinical overflow-hidden">
          <div className="px-4 py-2 bg-muted/50 border-b"><span className="text-xs font-semibold">{cat}</span></div>
          <table className="w-full table-clinical text-xs">
            <thead><tr className="border-b"><th className="p-2 text-left">Servicio</th><th className="p-2 text-left">Descripción</th><th className="p-2 text-right">Precio</th><th className="p-2 text-center">Estado</th></tr></thead>
            <tbody>
              {services.filter(s => s.category === cat).map(s => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="p-2 font-medium">{s.name}</td>
                  <td className="p-2 text-muted-foreground">{s.description || '—'}</td>
                  <td className="p-2 text-right font-mono">${s.price.toLocaleString()}</td>
                  <td className="p-2 text-center">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${s.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {s.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {services.filter(s => !s.category).length > 0 && (
        <div className="card-clinical overflow-hidden">
          <div className="px-4 py-2 bg-muted/50 border-b"><span className="text-xs font-semibold">Sin categoría</span></div>
          <table className="w-full table-clinical text-xs">
            <tbody>
              {services.filter(s => !s.category).map(s => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="p-2 font-medium">{s.name}</td>
                  <td className="p-2 text-right font-mono">${s.price.toLocaleString()}</td>
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
              <h2 className="text-sm font-semibold">Nuevo Servicio</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium mb-1 block">Nombre *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-clinical h-9" /></div>
              <div><label className="text-xs font-medium mb-1 block">Categoría</label><input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-clinical h-9" placeholder="Ej: Prevención, Cirugía..." /></div>
              <div><label className="text-xs font-medium mb-1 block">Precio *</label><input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="input-clinical h-9" /></div>
              <div><label className="text-xs font-medium mb-1 block">Descripción</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-clinical min-h-[60px] py-2" /></div>
              <button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground text-xs py-2 rounded-md hover:bg-primary/90 font-medium">Guardar Servicio</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
