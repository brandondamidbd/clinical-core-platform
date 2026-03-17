import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { useClinicStore } from '@/stores/clinicStore';
import { useCurrentRole } from '@/hooks/useCurrentRole';
import { Bell, Search } from 'lucide-react';
import type { UserRole } from '@/types';

const AVAILABLE_ROLES: UserRole[] = ['admin', 'doctor', 'receptionist', 'billing', 'readonly'];

export function AppLayout() {
  const clinic = useClinicStore((s) => s.clinic);
  const subscription = useClinicStore((s) => s.subscription);
  const { currentRole, setCurrentRole, label, ROLE_LABELS } = useCurrentRole();

  return (
    <div className="flex w-full min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-12 flex items-center justify-between px-4 border-b bg-card flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Buscar paciente, cita, folio... (Ctrl+K)"
                className="input-clinical pl-8 w-72 h-8 text-xs"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Demo role switcher */}
            <select
              value={currentRole}
              onChange={e => setCurrentRole(e.target.value as UserRole)}
              className="text-[10px] font-medium border rounded px-2 py-1 bg-card text-foreground"
            >
              {AVAILABLE_ROLES.map(r => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>

            {subscription.status !== 'active' && subscription.status !== 'trial' && (
              <span className="text-[10px] font-medium bg-warning/10 text-warning px-2 py-0.5 rounded">
                {subscription.status === 'grace' ? 'Período de gracia' : subscription.status === 'restricted' ? 'Acceso restringido' : 'Suscripción vencida'}
              </span>
            )}
            {subscription.status === 'trial' && (
              <span className="text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">
                Demo / Trial
              </span>
            )}
            <button className="relative p-1.5 rounded-md hover:bg-muted transition-colors">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-destructive rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-[10px] font-semibold text-primary">{label.slice(0, 2).toUpperCase()}</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-medium leading-none">{label}</div>
                <div className="text-[10px] text-muted-foreground leading-none mt-0.5">{clinic?.name || 'Sin clínica'}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
