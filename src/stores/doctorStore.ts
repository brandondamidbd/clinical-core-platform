import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Doctor } from '@/types';
import { createMetadata, updateMetadata, generateId, DEMO_CLINIC_ID } from './helpers';

interface DoctorStore {
  doctors: Doctor[];
  addDoctor: (d: Omit<Doctor, 'id' | 'clinicId' | 'metadata'>) => Doctor;
  updateDoctor: (id: string, updates: Partial<Doctor>) => void;
  getDoctor: (id: string) => Doctor | undefined;
  getActiveDoctors: () => Doctor[];
}

export const useDoctorStore = create<DoctorStore>()(
  persist(
    (set, get) => ({
      doctors: [],
      addDoctor: (d) => {
        const doc: Doctor = { ...d, id: generateId(), clinicId: DEMO_CLINIC_ID, metadata: createMetadata() };
        set((s) => ({ doctors: [...s.doctors, doc] }));
        return doc;
      },
      updateDoctor: (id, updates) => set((s) => ({
        doctors: s.doctors.map(d => d.id === id ? { ...d, ...updates, metadata: updateMetadata(d.metadata) } : d)
      })),
      getDoctor: (id) => get().doctors.find(d => d.id === id),
      getActiveDoctors: () => get().doctors.filter(d => d.isActive && !d.metadata.isArchived),
    }),
    { name: 'clinical-os-doctors' }
  )
);
