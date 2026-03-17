import { useState } from 'react';
import { useDoctorStore } from '@/stores/doctorStore';
import { Plus, X } from 'lucide-react';

export default function DoctorsPage() {
  const doctors = useDoctorStore((s) => s.doctors);
  const addDoctor = useDoctorStore((s) => s.addDoctor);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName: '', specialty: '', licenseNumber: '', phone: '', email: '', university: '', officeAddress: '', agendaColor: '#3b82f6' });

  const handleSubmit = () => {
    if (!form.fullName || !form.licenseNumber) return;
    addDoctor({ ...form, isActive: true });
    setShowForm(false);
    setForm({ fullName: '', specialty: '', licenseNumber: '', phone: '', email: '', university: '', officeAddress: '', agendaColor: '#3b82f6' });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Perfiles Médicos</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90">
          <Plus className="w-3.5 h-3.5" /> Nuevo Médico
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {doctors.filter(d => !d.metadata.isArchived).map(d => (
          <div key={d.id} className="card-clinical p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: d.agendaColor + '20', color: d.agendaColor }}>
                <span className="text-xs font-bold">{d.fullName.split(' ').map(w => w[0]).slice(0, 2).join('')}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{d.fullName}</div>
                <div className="meta-text">{d.specialty}</div>
                <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                  <div><span className="text-muted-foreground">Cédula:</span> <span className="font-mono">{d.licenseNumber}</span></div>
                  <div><span className="text-muted-foreground">Tel:</span> {d.phone}</div>
                  <div><span className="text-muted-foreground">Email:</span> {d.email}</div>
                  <div><span className="text-muted-foreground">Universidad:</span> {d.university || '—'}</div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${d.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {d.isActive ? 'Activo' : 'Inactivo'}
                  </span>
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
              <h2 className="text-sm font-semibold">Nuevo Médico</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium mb-1 block">Nombre completo *</label><input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} className="input-clinical h-9" /></div>
              <div><label className="text-xs font-medium mb-1 block">Especialidad</label><input value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} className="input-clinical h-9" /></div>
              <div><label className="text-xs font-medium mb-1 block">Cédula Profesional *</label><input value={form.licenseNumber} onChange={e => setForm(f => ({ ...f, licenseNumber: e.target.value }))} className="input-clinical h-9" /></div>
              <div><label className="text-xs font-medium mb-1 block">Teléfono</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-clinical h-9" /></div>
              <div><label className="text-xs font-medium mb-1 block">Correo</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-clinical h-9" /></div>
              <div><label className="text-xs font-medium mb-1 block">Universidad</label><input value={form.university} onChange={e => setForm(f => ({ ...f, university: e.target.value }))} className="input-clinical h-9" /></div>
              <div><label className="text-xs font-medium mb-1 block">Color de agenda</label><input type="color" value={form.agendaColor} onChange={e => setForm(f => ({ ...f, agendaColor: e.target.value }))} className="w-10 h-9 border rounded cursor-pointer" /></div>
              <button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground text-xs py-2 rounded-md hover:bg-primary/90 font-medium">Registrar Médico</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
