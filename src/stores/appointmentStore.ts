import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Appointment, AppointmentStatus } from '@/types';
import { createMetadata, updateMetadata, generateId, DEMO_CLINIC_ID } from './helpers';

interface AppointmentStore {
  appointments: Appointment[];
  addAppointment: (a: Omit<Appointment, 'id' | 'clinicId' | 'metadata'>) => Appointment;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  setStatus: (id: string, status: AppointmentStatus) => void;
  getByDate: (date: string) => Appointment[];
  getByDoctor: (doctorId: string, date: string) => Appointment[];
  getByPatient: (patientId: string) => Appointment[];
  checkOverlap: (doctorId: string, date: string, startTime: string, endTime: string, excludeId?: string) => boolean;
}

export const useAppointmentStore = create<AppointmentStore>()(
  persist(
    (set, get) => ({
      appointments: [],
      addAppointment: (a) => {
        const appt: Appointment = { ...a, id: generateId(), clinicId: DEMO_CLINIC_ID, metadata: createMetadata() };
        set((s) => ({ appointments: [...s.appointments, appt] }));
        return appt;
      },
      updateAppointment: (id, updates) => set((s) => ({
        appointments: s.appointments.map(a => a.id === id ? { ...a, ...updates, metadata: updateMetadata(a.metadata) } : a)
      })),
      setStatus: (id, status) => set((s) => ({
        appointments: s.appointments.map(a => a.id === id ? { ...a, status, metadata: updateMetadata(a.metadata) } : a)
      })),
      getByDate: (date) => get().appointments.filter(a => a.date === date && !a.metadata.isArchived),
      getByDoctor: (doctorId, date) => get().appointments.filter(a => a.doctorId === doctorId && a.date === date && !a.metadata.isArchived),
      getByPatient: (patientId) => get().appointments.filter(a => a.patientId === patientId && !a.metadata.isArchived),
      checkOverlap: (doctorId, date, startTime, endTime, excludeId) => {
        const docAppts = get().appointments.filter(a => 
          a.doctorId === doctorId && a.date === date && !a.metadata.isArchived && 
          a.status !== 'cancelled' && a.id !== excludeId
        );
        return docAppts.some(a => startTime < a.endTime && endTime > a.startTime);
      },
    }),
    { name: 'clinical-os-appointments' }
  )
);
