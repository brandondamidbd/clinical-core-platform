import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, FileText, CircleDot,
  Stethoscope, ClipboardList, CreditCard, Receipt, Pill,
  ShieldCheck, Building2, Settings, HelpCircle, UserCog,
  FileCheck, ScrollText, FlaskConical, ChevronLeft, ChevronRight,
  Activity
} from 'lucide-react';
import { useState } from 'react';

const NAV_SECTIONS = [
  {
    label: 'Operativa',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Inicio' },
      { to: '/agenda', icon: Calendar, label: 'Agenda' },
      { to: '/pacientes', icon: Users, label: 'Pacientes' },
    ],
  },
  {
    label: 'Clínica',
    items: [
      { to: '/expediente', icon: FileText, label: 'Expediente' },
      { to: '/odontograma', icon: CircleDot, label: 'Odontograma' },
      { to: '/diagnosticos', icon: Stethoscope, label: 'Diagnósticos' },
      { to: '/tratamientos', icon: Activity, label: 'Tratamientos' },
      { to: '/notas', icon: ClipboardList, label: 'Notas Médicas' },
      { to: '/estudios', icon: FlaskConical, label: 'Estudios Aux.' },
    ],
  },
  {
    label: 'Documentos',
    items: [
      { to: '/recetas', icon: Pill, label: 'Recetas' },
      { to: '/certificados', icon: FileCheck, label: 'Certificados' },
      { to: '/consentimientos', icon: ShieldCheck, label: 'Consentimientos' },
      { to: '/presupuestos', icon: Receipt, label: 'Presupuestos' },
    ],
  },
  {
    label: 'Administrativa',
    items: [
      { to: '/pagos', icon: CreditCard, label: 'Pagos' },
      { to: '/medicos', icon: UserCog, label: 'Médicos' },
      { to: '/servicios', icon: ScrollText, label: 'Servicios' },
      { to: '/medicamentos', icon: Pill, label: 'Medicamentos' },
    ],
  },
  {
    label: 'Configuración',
    items: [
      { to: '/identidad', icon: Building2, label: 'Identidad Clínica' },
      { to: '/usuarios', icon: Users, label: 'Usuarios y Permisos' },
      { to: '/ajustes', icon: Settings, label: 'Ajustes' },
      { to: '/soporte', icon: HelpCircle, label: 'Soporte' },
    ],
  },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={`sidebar-clinical flex flex-col h-screen sticky top-0 transition-all duration-200 ${collapsed ? 'w-16' : 'w-60'} flex-shrink-0`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 h-12 border-b border-sidebar-border flex-shrink-0">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground font-bold text-xs">CO</span>
        </div>
        {!collapsed && (
          <div className="truncate">
            <div className="text-xs font-semibold text-sidebar-foreground leading-none">Clinical OS</div>
            <div className="text-[10px] text-sidebar-muted leading-none mt-0.5">Sistema Clínico</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-3">
            {!collapsed && (
              <div className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted px-2 mb-1">
                {section.label}
              </div>
            )}
            {section.items.map((item) => {
              const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-colors mb-0.5 ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-t border-sidebar-border text-sidebar-muted hover:text-sidebar-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
