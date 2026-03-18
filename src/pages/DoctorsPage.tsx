import { useState } from 'react';
import { useDoctorStore } from '@/stores/doctorStore';
import { Plus, X, Edit2, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function DoctorsPage() {
  const doctors = useDoctorStore(s => s.doctors);
  const addDoctor = useDoctorStore(s => s.addDoctor);
  const updateDoctor = useDoctorStore(s => s.updateDoctor);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ fullName: '', specialty: '', licenseNumber: '', phone: '', email: '', university: '', officeAddress: '', agendaColor: '#3b82f6', signature: '' });

  const filtered = doctors.filter(d => !d.metadata.isArchived && (d.fullName.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase())));

  const openEdit = (id: string) => {
    const d = doctors.find(doc => doc.id === id);
    if (d) { setForm({ fullName: d.fullName, specialty: d.specialty, licenseNumber: d.licenseNumber, phone: d.phone, email: d.email, university: d.university || '', officeAddress: d.officeAddress || '', agendaColor: d.agendaColor, signature: d.signature || '' }); setEditId(id); setShowForm(true); }
  };

  const handleSubmit = () => {
    if (!form.fullName || !form.licenseNumber) return;
    if (editId) {
      updateDoctor(editId, form);
      toast.success('Médico actualizado');
    } else {
      addDoctor({ ...form, isActive: true });
      toast.success('Médico registrado');
    }
    setShowForm(false); setEditId(null);
    setForm({ fullName: '', specialty: '', licenseNumber: '', phone: '', email: '', university: '', officeAddress: '', agendaColor: '#3b82f6', signature: '' });
  };

  const toggleActive = (id: string) => {
    const d = doctors.find(doc => doc.id === id);
    if (d) { updateDoctor(id, { isActive: !d.isActive }); toast.success(d.isActive ? 'Médico desactivado' : 'Médico activado'); }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Perfiles Médicos</h1>
        <button onClick={() => { setEditId(null); setForm({ fullName: '', specialty: '', licenseNumber: '', phone: '', email: '', university: '', officeAddress: '', agendaColor: '#3b82f6', signature: '' }); setShowForm(true); }} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90">
          <Plus className="w-3.5 h-3.5" /> Nuevo Médico
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar médico..." className="input-clinical pl-8 h-8 text-xs" />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {filtered.map(d => (
          <div key={d.id} className={`card-clinical p-4 ${!d.isActive ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: d.agendaColor + '20', color: d.agendaColor }}>
                <span className="text-xs font-bold">{d.fullName.split(' ').map(w => w[0]).slice(0, 2).join('')}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{d.fullName}</div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(d.id)} className="p-1 rounded hover:bg-muted"><Edit2 className="w-3 h-3 text-muted-foreground" /></button>
                  </div>
                </div>
                <div className="meta-text">{d.specialty}</div>
                <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                  <div><span className="text-muted-foreground">Cédula:</span> <span className="font-mono">{d.licenseNumber}</span></div>
                  <div><span className="text-muted-foreground">Tel:</span> {d.phone}</div>
                  <div><span className="text-muted-foreground">Email:</span> {d.email}</div>
                  <div><span className="text-muted-foreground">Universidad:</span> {d.university || '—'}</div>
                </div>
                {d.signature && <div className="mt-2 text-[10px] text-muted-foreground">Firma digital registrada</div>}
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => toggleActive(d.id)} className={`text-[10px] px-1.5 py-0.5 rounded cursor-pointer ${d.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {d.isActive ? 'Activo' : 'Inactivo'}
                  </button>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.agendaColor }} title="Color de agenda" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-foreground/20 z-50 flex justify-end">
          <div className="w-full max-w-md bg-card h-full overflow-auto shadow-elevated animate-slide-in p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">{editId ? 'Editar Médico' : 'Nuevo Médico'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium mb-1 block">Nombre completo *</label><input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} className="input-clinical h-9" /></div>
              <div><label className="text-xs font-medium mb-1 block">Especialidad</label><input value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} className="input-clinical h-9" /></div>
              <div><label className="text-xs font-medium mb-1 block">Cédula Profesional *</label><input value={form.licenseNumber} onChange={e => setForm(f => ({ ...f, licenseNumber: e.target.value }))} className="input-clinical h-9" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-medium mb-1 block">Teléfono</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-clinical h-9" /></div>
                <div><label className="text-xs font-medium mb-1 block">Correo</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-clinical h-9" /></div>
              </div>
              <div><label className="text-xs font-medium mb-1 block">Universidad</label><input value={form.university} onChange={e => setForm(f => ({ ...f, university: e.target.value }))} className="input-clinical h-9" /></div>
              <div><label className="text-xs font-medium mb-1 block">Dirección del consultorio</label><input value={form.officeAddress} onChange={e => setForm(f => ({ ...f, officeAddress: e.target.value }))} className="input-clinical h-9" /></div>
              <div><label className="text-xs font-medium mb-1 block">Color de agenda</label><input type="color" value={form.agendaColor} onChange={e => setForm(f => ({ ...f, agendaColor: e.target.value }))} className="w-10 h-9 border rounded cursor-pointer" /></div>
              <div>
                <label className="text-xs font-medium mb-1 block">Firma digital (texto)</label>
                <input value={form.signature} onChange={e => setForm(f => ({ ...f, signature: e.target.value }))} className="input-clinical h-9" placeholder="Nombre para firma en documentos" />
                <p className="text-[10px] text-muted-foreground mt-0.5">Se usará como firma en recetas y certificados</p>
              </div>
              <button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground text-xs py-2 rounded-md hover:bg-primary/90 font-medium">{editId ? 'Actualizar' : 'Registrar'} Médico</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
