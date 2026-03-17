import { useState } from 'react';
import { useUserStore } from '@/stores/catalogStores';
import { useClinicStore } from '@/stores/clinicStore';
import { Plus, X, Shield } from 'lucide-react';
import type { UserRole, Permission } from '@/types';

const ROLE_LABELS: Record<UserRole, string> = { admin: 'Administrador', doctor: 'Médico', receptionist: 'Recepcionista', assistant: 'Enfermera/Asistente', billing: 'Caja/Contabilidad', readonly: 'Solo lectura', demo: 'Demo' };
const MODULES = ['dashboard','agenda','patients','records','odontogram','prescriptions','certificates','budgets','payments','services','medications','doctors','consent','users','settings','support'];
const ACTIONS = ['view','create','edit','delete','export','configure'] as const;

export default function UsersPage() {
  const users = useUserStore(s => s.users);
  const addUser = useUserStore(s => s.addUser);
  const subscription = useClinicStore(s => s.subscription);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'receptionist' as UserRole });

  const atLimit = users.filter(u => u.isActive).length >= subscription.limits.maxUsers;

  const handleSubmit = () => {
    if (!form.name || !form.email || atLimit) return;
    const defaultPerms: Permission[] = MODULES.map(m => ({ module: m, actions: form.role === 'admin' ? [...ACTIONS] : form.role === 'readonly' ? ['view'] : ['view', 'create'] }));
    addUser({ name: form.name, email: form.email, role: form.role, isActive: true, permissions: defaultPerms });
    setShowForm(false);
    setForm({ name: '', email: '', role: 'receptionist' });
  };

  return (
    <div className="space-y-4 animate-fade-in max-w-4xl">
      <div className="page-header">
        <h1 className="page-title">Usuarios y Permisos</h1>
        <div className="flex items-center gap-2">
          <span className="meta-text">{users.filter(u => u.isActive).length} / {subscription.limits.maxUsers} usuarios</span>
          <button onClick={() => setShowForm(true)} disabled={atLimit} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90 disabled:opacity-50">
            <Plus className="w-3.5 h-3.5" /> Nuevo Usuario
          </button>
        </div>
      </div>
      {atLimit && <div className="text-xs text-warning bg-warning/10 p-2 rounded">Has alcanzado el límite de usuarios de tu plan ({subscription.limits.maxUsers}). Actualiza tu plan para agregar más.</div>}

      <div className="space-y-2">
        {users.filter(u => !u.metadata.isArchived).map(u => (
          <div key={u.id} className="card-clinical p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-xs font-bold text-primary">{u.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</span></div>
                <div>
                  <div className="text-sm font-medium">{u.name}</div>
                  <div className="meta-text">{u.email} · <span className="capitalize">{ROLE_LABELS[u.role]}</span></div>
                </div>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${u.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{u.isActive ? 'Activo' : 'Inactivo'}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {u.permissions.slice(0, 8).map(p => (
                <span key={p.module} className="text-[9px] bg-muted px-1.5 py-0.5 rounded">{p.module}: {p.actions.join(', ')}</span>
              ))}
              {u.permissions.length > 8 && <span className="text-[9px] text-muted-foreground">+{u.permissions.length - 8} más</span>}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-foreground/20 z-50 flex justify-end">
          <div className="w-full max-w-md bg-card h-full overflow-auto shadow-elevated animate-slide-in p-5">
            <div className="flex items-center justify-between mb-4"><h2 className="text-sm font-semibold">Nuevo Usuario</h2><button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button></div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium mb-1 block">Nombre *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-clinical h-9" /></div>
              <div><label className="text-xs font-medium mb-1 block">Correo *</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-clinical h-9" /></div>
              <div><label className="text-xs font-medium mb-1 block">Rol</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))} className="input-clinical h-9">
                  {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground text-xs py-2 rounded-md hover:bg-primary/90 font-medium">Crear Usuario</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
