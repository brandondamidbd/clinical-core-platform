import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Patient } from '@/types';
import { createMetadata, updateMetadata, generateId, DEMO_CLINIC_ID } from './helpers';

interface PatientStore {
  patients: Patient[];
  addPatient: (p: Omit<Patient, 'id' | 'clinicId' | 'metadata'>) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  archivePatient: (id: string) => void;
  getPatient: (id: string) => Patient | undefined;
  getActivePatients: () => Patient[];
  searchPatients: (query: string) => Patient[];
  checkDuplicate: (firstName: string, lastName: string, phone: string, email?: string) => Patient | undefined;
}

export const usePatientStore = create<PatientStore>()(
  persist(
    (set, get) => ({
      patients: [],
      addPatient: (p) => {
        const patient: Patient = { ...p, id: generateId(), clinicId: DEMO_CLINIC_ID, metadata: createMetadata() };
        set((s) => ({ patients: [...s.patients, patient] }));
        return patient;
      },
      updatePatient: (id, updates) => set((s) => ({
        patients: s.patients.map(p => p.id === id ? { ...p, ...updates, metadata: updateMetadata(p.metadata) } : p)
      })),
      archivePatient: (id) => set((s) => ({
        patients: s.patients.map(p => p.id === id ? { ...p, metadata: { ...updateMetadata(p.metadata), isArchived: true } } : p)
      })),
      getPatient: (id) => get().patients.find(p => p.id === id),
      getActivePatients: () => get().patients.filter(p => !p.metadata.isArchived),
      searchPatients: (q) => {
        const lower = q.toLowerCase();
        return get().patients.filter(p => !p.metadata.isArchived && (`${p.firstName} ${p.lastName}`.toLowerCase().includes(lower) || p.phone.includes(q) || p.email?.toLowerCase().includes(lower)));
      },
      checkDuplicate: (firstName, lastName, phone, email) => {
        return get().patients.find(p => !p.metadata.isArchived && (
          (p.firstName.toLowerCase() === firstName.toLowerCase() && p.lastName.toLowerCase() === lastName.toLowerCase() && p.phone === phone) ||
          (email && p.email && p.email.toLowerCase() === email.toLowerCase())
        ));
      },
    }),
    { name: 'clinical-os-patients' }
  )
);
