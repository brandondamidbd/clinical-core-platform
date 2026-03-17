import { useState } from 'react';
import { usePatientStore } from '@/stores/patientStore';
import { Link } from 'react-router-dom';
import { Plus, Search, X, AlertTriangle } from 'lucide-react';
import type { Patient } from '@/types';

export default function PatientsPage() {
  const patients = usePatientStore((s) => s.patients);
  const addPatient = usePatientStore((s) => s.addPatient);
  const checkDuplicate = usePatientStore((s) => s.checkDuplicate);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [dupWarning, setDupWarning] = useState('');

  const filtered = patients.filter(p => !p.metadata.isArchived && (
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search) || (p.email && p.email.toLowerCase().includes(search.toLowerCase()))
  ));

  const [form, setForm] = useState({
    firstName: '', lastName: '', dateOfBirth: '', sex: 'M' as 'M' | 'F' | 'other',
    phone: '', email: '', address: '', maritalStatus: '', bloodType: '',
    guardianName: '', guardianPhone: '',
  });

  const handleSubmit = () => {
    setFormError(''); setDupWarning('');
    if (!form.firstName || !form.lastName || !form.phone || !form.dateOfBirth) { setFormError('Nombre, apellido, teléfono y fecha de nacimiento son obligatorios'); return; }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setFormError('Correo electrónico inválido'); return; }
    const dup = checkDuplicate(form.firstName, form.lastName, form.phone, form.email);
    if (dup && !dupWarning) { setDupWarning(`Posible duplicado: ${dup.firstName} ${dup.lastName} (${dup.phone}). Guarda de nuevo para confirmar.`); return; }
    addPatient({ ...form, allergies: [] });
    setShowForm(false);
    setForm({ firstName: '', lastName: '', dateOfBirth: '', sex: 'M', phone: '', email: '', address: '', maritalStatus: '', bloodType: '', guardianName: '', guardianPhone: '' });
    setDupWarning('');
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Pacientes</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90">
          <Plus className="w-3.5 h-3.5" /> Nuevo Paciente
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, teléfono o correo..." className="input-clinical pl-8 h-8 text-xs" />
      </div>

      <div className="card-clinical overflow-hidden">
        <table className="w-full table-clinical text-xs">
          <thead><tr className="border-b"><th className="p-2 text-left">Nombre</th><th className="p-2 text-left">Teléfono</th><th className="p-2 text-left">Correo</th><th className="p-2 text-left">Edad</th><th className="p-2 text-left">Sexo</th><th className="p-2 text-left">Alergias</th><th className="p-2"></th></tr></thead>
          <tbody>
            {filtered.map(p => {
              const age = p.dateOfBirth ? Math.floor((Date.now() - new Date(p.dateOfBirth).getTime()) / 31557600000) : '—';
              return (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="p-2 font-medium">{p.firstName} {p.lastName}</td>
                  <td className="p-2 font-mono">{p.phone}</td>
                  <td className="p-2 text-muted-foreground">{p.email || '—'}</td>
                  <td className="p-2">{age}</td>
                  <td className="p-2">{p.sex}</td>
                  <td className="p-2">{p.allergies.length > 0 ? <span className="text-destructive font-medium">{p.allergies.join(', ')}</span> : '—'}</td>
                  <td className="p-2"><Link to={`/pacientes/${p.id}`} className="text-primary hover:underline">Ver</Link></td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Sin resultados</td></tr>}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-foreground/20 z-50 flex justify-end">
          <div className="w-full max-w-md bg-card h-full overflow-auto shadow-elevated animate-slide-in p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">Nuevo Paciente</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            {formError && <div className="text-xs text-destructive bg-destructive/10 p-2 rounded mb-3">{formError}</div>}
            {dupWarning && <div className="text-xs text-warning bg-warning/10 p-2 rounded mb-3 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{dupWarning}</div>}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-medium mb-1 block">Nombre(s) *</label><input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="input-clinical h-9" /></div>
                <div><label className="text-xs font-medium mb-1 block">Apellidos *</label><input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="input-clinical h-9" /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-medium mb-1 block">Fecha de nacimiento *</label><input type="date" value={form.dateOfBirth} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} className="input-clinical h-9" /></div>
                <div><label className="text-xs font-medium mb-1 block">Sexo</label>
                  <select value={form.sex} onChange={e => setForm(f => ({ ...f, sex: e.target.value as any }))} className="input-clinical h-9">
                    <option value="M">Masculino</option><option value="F">Femenino</option><option value="other">Otro</option>
                  </select>
                </div>
              </div>
              <div><label className="text-xs font-medium mb-1 block">Teléfono *</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-clinical h-9" placeholder="+52..." /></div>
              <div><label className="text-xs font-medium mb-1 block">Correo electrónico</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-clinical h-9" /></div>
              <div><label className="text-xs font-medium mb-1 block">Domicilio</label><input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="input-clinical h-9" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-medium mb-1 block">Estado civil</label><input value={form.maritalStatus} onChange={e => setForm(f => ({ ...f, maritalStatus: e.target.value }))} className="input-clinical h-9" /></div>
                <div><label className="text-xs font-medium mb-1 block">Tipo de sangre</label>
                  <select value={form.bloodType} onChange={e => setForm(f => ({ ...f, bloodType: e.target.value }))} className="input-clinical h-9">
                    <option value="">—</option>{['O+','O-','A+','A-','B+','B-','AB+','AB-'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs font-medium mb-2 text-muted-foreground">Tutor / Responsable (menores)</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs font-medium mb-1 block">Nombre</label><input value={form.guardianName} onChange={e => setForm(f => ({ ...f, guardianName: e.target.value }))} className="input-clinical h-9" /></div>
                  <div><label className="text-xs font-medium mb-1 block">Teléfono</label><input value={form.guardianPhone} onChange={e => setForm(f => ({ ...f, guardianPhone: e.target.value }))} className="input-clinical h-9" /></div>
                </div>
              </div>
              <button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground text-xs py-2 rounded-md hover:bg-primary/90 font-medium mt-2">
                Registrar Paciente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
