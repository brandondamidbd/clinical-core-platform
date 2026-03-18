import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, FileText, CircleDot,
  Stethoscope, ClipboardList, CreditCard, Receipt, Pill,
  ShieldCheck, Building2, Settings, HelpCircle, UserCog,
  FileCheck, ScrollText, FlaskConical, ChevronLeft, ChevronRight,
  Activity, PlusCircle, Pin, PinOff, ChevronDown
} from 'lucide-react';
import { useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Sidebar state store (persisted)
interface SidebarState {
  pinned: boolean;
  setPinned: (v: boolean) => void;
  collapsedSections: Record<string, boolean>;
  toggleSection: (s: string) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      pinned: true,
      setPinned: (v) => set({ pinned: v }),
      collapsedSections: {},
      toggleSection: (s) => set((st) => ({
        collapsedSections: { ...st.collapsedSections, [s]: !st.collapsedSections[s] }
      })),
    }),
    { name: 'clinical-os-sidebar' }
  )
);

const NAV_SECTIONS = [
  {
    label: 'Operativa',
    section: 'operative',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Inicio' },
      { to: '/consulta', icon: PlusCircle, label: 'Nueva Consulta', highlight: true },
      { to: '/agenda', icon: Calendar, label: 'Agenda' },
      { to: '/pacientes', icon: Users, label: 'Pacientes' },
    ],
  },
  {
    label: 'Clínica',
    section: 'clinical',
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
    section: 'documents',
    items: [
      { to: '/recetas', icon: Pill, label: 'Recetas' },
      { to: '/certificados', icon: FileCheck, label: 'Certificados' },
      { to: '/consentimientos', icon: ShieldCheck, label: 'Consentimientos' },
      { to: '/presupuestos', icon: Receipt, label: 'Presupuestos' },
    ],
  },
  {
    label: 'Administrativa',
    section: 'admin',
    items: [
      { to: '/pagos', icon: CreditCard, label: 'Pagos' },
      { to: '/medicos', icon: UserCog, label: 'Médicos' },
      { to: '/servicios', icon: ScrollText, label: 'Servicios' },
      { to: '/medicamentos', icon: Pill, label: 'Medicamentos' },
    ],
  },
  {
    label: 'Configuración',
    section: 'config',
    items: [
      { to: '/identidad', icon: Building2, label: 'Identidad Clínica' },
      { to: '/usuarios', icon: Users, label: 'Usuarios y Permisos' },
      { to: '/ajustes', icon: Settings, label: 'Ajustes' },
      { to: '/soporte', icon: HelpCircle, label: 'Soporte' },
    ],
  },
];

export function AppSidebar() {
  const { pinned, setPinned, collapsedSections, toggleSection } = useSidebarStore();
  const [hovered, setHovered] = useState(false);
  const location = useLocation();

  const expanded = pinned || hovered;

  return (
    <aside
      onMouseEnter={() => !pinned && setHovered(true)}
      onMouseLeave={() => !pinned && setHovered(false)}
      className={`sidebar-clinical flex flex-col h-screen sticky top-0 transition-all duration-200 ${expanded ? 'w-60' : 'w-14'} flex-shrink-0 z-30`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 h-12 border-b border-sidebar-border flex-shrink-0">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground font-bold text-xs">CO</span>
        </div>
        {expanded && (
          <div className="truncate flex-1">
            <div className="text-xs font-semibold text-sidebar-foreground leading-none">Clinical OS</div>
            <div className="text-[10px] text-sidebar-muted leading-none mt-0.5">Sistema Clínico</div>
          </div>
        )}
        {expanded && (
          <button
            onClick={() => setPinned(!pinned)}
            className="p-1 rounded hover:bg-sidebar-accent text-sidebar-muted hover:text-sidebar-foreground transition-colors"
            title={pinned ? 'Desfijar sidebar' : 'Fijar sidebar'}
          >
            {pinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {NAV_SECTIONS.map((section) => {
          const isCollapsed = collapsedSections[section.section];
          return (
            <div key={section.label} className="mb-1">
              {expanded ? (
                <button
                  onClick={() => toggleSection(section.section)}
                  className="w-full flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted px-2 mb-1 hover:text-sidebar-foreground transition-colors"
                >
                  <span>{section.label}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                </button>
              ) : (
                <div className="h-px bg-sidebar-border mx-1 my-2" />
              )}
              {!isCollapsed && section.items.map((item) => {
                const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
                const isHighlight = 'highlight' in item && item.highlight;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-colors mb-0.5 ${
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : isHighlight
                          ? 'text-primary-foreground bg-primary/80 hover:bg-primary'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    }`}
                    title={!expanded ? item.label : undefined}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {expanded && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle for non-pinned */}
      {!expanded && (
        <button
          onClick={() => setPinned(true)}
          className="flex items-center justify-center h-10 border-t border-sidebar-border text-sidebar-muted hover:text-sidebar-foreground transition-colors"
          title="Fijar sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </aside>
  );
}
