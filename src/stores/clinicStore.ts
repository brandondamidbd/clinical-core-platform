import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Clinic, OnboardingState, SubscriptionState, SyncState, BackupRecord, PlanLimits } from '@/types';
import { createMetadata, DEMO_CLINIC_ID, DEMO_ORG_ID } from './helpers';

const DEFAULT_LIMITS: PlanLimits = {
  maxDoctors: 3,
  maxUsers: 5,
  maxBranches: 1,
  maxStorageMB: 500,
  availableModules: ['dashboard', 'agenda', 'patients', 'records', 'odontogram', 'prescriptions', 'certificates', 'budgets', 'payments', 'services', 'medications', 'doctors', 'consent', 'settings', 'users', 'support'],
};

interface ClinicStore {
  clinic: Clinic | null;
  subscription: SubscriptionState;
  onboarding: OnboardingState;
  syncState: SyncState;
  backups: BackupRecord[];
  
  setClinic: (clinic: Clinic) => void;
  updateClinic: (updates: Partial<Clinic>) => void;
  setOnboardingStep: (step: keyof OnboardingState['steps'], value: boolean) => void;
  setOnboardingCompleted: (v: boolean) => void;
  setOnboardingCurrentStep: (n: number) => void;
  setSubscriptionStatus: (status: SubscriptionState['status']) => void;
  addBackup: (backup: BackupRecord) => void;
  initDemo: () => void;
  resetAll: () => void;
}

export const useClinicStore = create<ClinicStore>()(
  persist(
    (set) => ({
      clinic: null,
      subscription: {
        status: 'trial',
        planId: 'trial',
        planName: 'Demo / Trial',
        trialStartDate: new Date().toISOString(),
        trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        limits: DEFAULT_LIMITS,
        hadTrial: false,
        processedEventIds: [],
      },
      onboarding: {
        completed: false,
        currentStep: 0,
        steps: { clinicIdentity: false, primaryDoctor: false, services: false, schedule: false, users: false },
      },
      syncState: {
        pendingChanges: 0,
        conflictsDetected: 0,
        syncMode: 'local',
        entities: {},
      },
      backups: [],

      setClinic: (clinic) => set({ clinic }),
      updateClinic: (updates) => set((s) => ({
        clinic: s.clinic ? { ...s.clinic, ...updates, metadata: { ...s.clinic.metadata, updatedAt: new Date().toISOString(), version: s.clinic.metadata.version + 1 } } : null
      })),
      setOnboardingStep: (step, value) => set((s) => ({
        onboarding: { ...s.onboarding, steps: { ...s.onboarding.steps, [step]: value } }
      })),
      setOnboardingCompleted: (v) => set((s) => ({ onboarding: { ...s.onboarding, completed: v } })),
      setOnboardingCurrentStep: (n) => set((s) => ({ onboarding: { ...s.onboarding, currentStep: n } })),
      setSubscriptionStatus: (status) => set((s) => ({
        subscription: { ...s.subscription, status }
      })),
      addBackup: (backup) => set((s) => ({ backups: [...s.backups, backup] })),
      initDemo: () => set({
        clinic: {
          id: DEMO_CLINIC_ID,
          organizationId: DEMO_ORG_ID,
          name: 'Clínica Dental Demo',
          address: 'Av. Reforma 123, Col. Centro, CDMX',
          phone: '+52 55 1234 5678',
          email: 'contacto@clinicademo.mx',
          specialty: 'odontologia',
          timezone: 'America/Mexico_City',
          metadata: createMetadata(),
        },
      }),
      resetAll: () => set({
        clinic: null,
        onboarding: { completed: false, currentStep: 0, steps: { clinicIdentity: false, primaryDoctor: false, services: false, schedule: false, users: false } },
        backups: [],
      }),
    }),
    { name: 'clinical-os-clinic' }
  )
);
