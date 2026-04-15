import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { useClinicStore } from '@/stores/clinicStore';
import { useCurrentRole } from '@/hooks/useCurrentRole';
import { Bell, Search, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const ROLE_INITIALS: Record<string, string> = {
  admin: 'AD', doctor: 'DR', receptionist: 'RC', assistant: 'AS', billing: 'CJ', readonly: 'SL', demo: 'DM'
};

export function AppLayout() {
  const clinic = useClinicStore((s) => s.clinic);
  const subscription = useClinicStore((s) => s.subscription);
  const { currentRole, setCurrentRole, label, ROLE_LABELS } = useCurrentRole();
  const [roleOpen, setRoleOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setRoleOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="flex w-full min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 flex items-center justify-between px-4 border-b bg-card flex-shrink-0">
          <div className="flex items-center gap-3">
            <GlobalSearch />
          </div>
          <div className="flex items-center gap-3">
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
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setRoleOpen(!roleOpen)}
                className="flex items-center gap-2 pl-3 border-l cursor-pointer hover:bg-muted/50 rounded-md pr-2 py-1 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-[10px] font-semibold text-primary">{ROLE_INITIALS[currentRole] || 'US'}</span>
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-medium leading-none">{label}</div>
                  <div className="text-[10px] text-muted-foreground leading-none mt-0.5">{clinic?.name || 'Sin clínica'}</div>
                </div>
                <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${roleOpen ? 'rotate-180' : ''}`} />
              </button>
              {roleOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-popover border rounded-lg shadow-lg z-50 py-1 animate-fade-in">
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Cambiar rol activo</div>
                  {Object.entries(ROLE_LABELS).map(([key, name]) => (
                    <button
                      key={key}
                      onClick={() => { setCurrentRole(key as any); setRoleOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-accent transition-colors ${currentRole === key ? 'bg-accent/50 font-semibold' : ''}`}
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[9px] font-bold text-primary">{ROLE_INITIALS[key] || '??'}</span>
                      </div>
                      <span>{name}</span>
                      {currentRole === key && <span className="ml-auto text-[9px] text-primary font-medium">Activo</span>}
                    </button>
                  ))}
                  <div className="border-t mt-1 pt-1 px-3 py-1.5">
                    <p className="text-[9px] text-muted-foreground">En esta fase todos los roles tienen acceso completo para facilitar pruebas.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
