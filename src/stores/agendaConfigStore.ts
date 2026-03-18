import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AgendaConfig, AppointmentType } from '@/types';
import { generateId } from './helpers';

const DEFAULT_SCHEDULE: AgendaConfig['schedule'] = {
  lunes: { enabled: true, blocks: [{ start: '09:00', end: '14:00' }, { start: '15:00', end: '18:00' }] },
  martes: { enabled: true, blocks: [{ start: '09:00', end: '14:00' }, { start: '15:00', end: '18:00' }] },
  miercoles: { enabled: true, blocks: [{ start: '09:00', end: '14:00' }, { start: '15:00', end: '18:00' }] },
  jueves: { enabled: true, blocks: [{ start: '09:00', end: '14:00' }, { start: '15:00', end: '18:00' }] },
  viernes: { enabled: true, blocks: [{ start: '09:00', end: '14:00' }, { start: '15:00', end: '18:00' }] },
  sabado: { enabled: false, blocks: [{ start: '09:00', end: '13:00' }] },
  domingo: { enabled: false, blocks: [] },
};

const DEFAULT_TYPES: AppointmentType[] = [
  { id: 'general', name: 'Consulta General', duration: 40, color: '#3b82f6' },
  { id: 'revision', name: 'Revisión', duration: 20, color: '#10b981' },
  { id: 'urgency', name: 'Urgencia', duration: 30, color: '#ef4444' },
  { id: 'followup', name: 'Seguimiento', duration: 15, color: '#8b5cf6' },
  { id: 'cleaning', name: 'Limpieza Dental', duration: 45, color: '#06b6d4' },
  { id: 'procedure', name: 'Procedimiento', duration: 60, color: '#f59e0b' },
];

interface AgendaConfigStore {
  config: AgendaConfig;
  updateSchedule: (schedule: AgendaConfig['schedule']) => void;
  setDefaultDuration: (d: number) => void;
  addAppointmentType: (t: Omit<AppointmentType, 'id'>) => void;
  updateAppointmentType: (id: string, updates: Partial<AppointmentType>) => void;
  removeAppointmentType: (id: string) => void;
  updateCancellationReasons: (reasons: string[]) => void;
}

export const useAgendaConfigStore = create<AgendaConfigStore>()(
  persist(
    (set) => ({
      config: {
        schedule: DEFAULT_SCHEDULE,
        defaultDuration: 40,
        appointmentTypes: DEFAULT_TYPES,
        cancellationReasons: [
          'Paciente canceló', 'Paciente no asistió', 'Emergencia médica',
          'Reagendamiento solicitado', 'Doctor no disponible', 'Condiciones climáticas', 'Otro'
        ],
      },
      updateSchedule: (schedule) => set((s) => ({ config: { ...s.config, schedule } })),
      setDefaultDuration: (d) => set((s) => ({ config: { ...s.config, defaultDuration: d } })),
      addAppointmentType: (t) => set((s) => ({
        config: { ...s.config, appointmentTypes: [...s.config.appointmentTypes, { ...t, id: generateId() }] }
      })),
      updateAppointmentType: (id, updates) => set((s) => ({
        config: { ...s.config, appointmentTypes: s.config.appointmentTypes.map(t => t.id === id ? { ...t, ...updates } : t) }
      })),
      removeAppointmentType: (id) => set((s) => ({
        config: { ...s.config, appointmentTypes: s.config.appointmentTypes.filter(t => t.id !== id) }
      })),
      updateCancellationReasons: (reasons) => set((s) => ({ config: { ...s.config, cancellationReasons: reasons } })),
    }),
    { name: 'clinical-os-agenda-config' }
  )
);
