import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Service, Medication, Payment, Budget, Prescription, Certificate, ConsentForm, ConsentTemplate, Treatment, OdontogramFinding, MedicalRecord, User } from '@/types';
import { createMetadata, updateMetadata, generateId, generateFolio, DEMO_CLINIC_ID } from './helpers';

// ===================== Services =====================
interface ServiceStore {
  services: Service[];
  addService: (s: Omit<Service, 'id' | 'clinicId' | 'metadata'>) => Service;
  updateService: (id: string, updates: Partial<Service>) => void;
  getActiveServices: () => Service[];
}

export const useServiceStore = create<ServiceStore>()(
  persist(
    (set, get) => ({
      services: [],
      addService: (s) => {
        const svc: Service = { ...s, id: generateId(), clinicId: DEMO_CLINIC_ID, metadata: createMetadata() };
        set((st) => ({ services: [...st.services, svc] }));
        return svc;
      },
      updateService: (id, updates) => set((s) => ({
        services: s.services.map(sv => sv.id === id ? { ...sv, ...updates, metadata: updateMetadata(sv.metadata) } : sv)
      })),
      getActiveServices: () => get().services.filter(s => s.isActive && !s.metadata.isArchived),
    }),
    { name: 'clinical-os-services' }
  )
);

// ===================== Medications =====================
interface MedicationStore {
  medications: Medication[];
  addMedication: (m: Omit<Medication, 'id' | 'clinicId' | 'metadata'>) => Medication;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  getActiveMedications: () => Medication[];
  searchMedications: (q: string) => Medication[];
}

export const useMedicationStore = create<MedicationStore>()(
  persist(
    (set, get) => ({
      medications: [],
      addMedication: (m) => {
        const med: Medication = { ...m, id: generateId(), clinicId: DEMO_CLINIC_ID, metadata: createMetadata() };
        set((s) => ({ medications: [...s.medications, med] }));
        return med;
      },
      updateMedication: (id, updates) => set((s) => ({
        medications: s.medications.map(m => m.id === id ? { ...m, ...updates, metadata: updateMetadata(m.metadata) } : m)
      })),
      getActiveMedications: () => get().medications.filter(m => m.isActive && !m.metadata.isArchived),
      searchMedications: (q) => {
        const lower = q.toLowerCase();
        return get().medications.filter(m => m.isActive && (m.name.toLowerCase().includes(lower) || m.category.toLowerCase().includes(lower)));
      },
    }),
    { name: 'clinical-os-medications' }
  )
);

// ===================== Payments =====================
interface PaymentStore {
  payments: Payment[];
  addPayment: (p: Omit<Payment, 'id' | 'clinicId' | 'metadata'>) => Payment;
  getByPatient: (patientId: string) => Payment[];
  getByTreatment: (treatmentId: string) => Payment[];
  getTotalPaidForTreatment: (treatmentId: string) => number;
}

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set, get) => ({
      payments: [],
      addPayment: (p) => {
        const pay: Payment = { ...p, id: generateId(), clinicId: DEMO_CLINIC_ID, metadata: createMetadata() };
        set((s) => ({ payments: [...s.payments, pay] }));
        return pay;
      },
      getByPatient: (patientId) => get().payments.filter(p => p.patientId === patientId),
      getByTreatment: (treatmentId) => get().payments.filter(p => p.treatmentId === treatmentId),
      getTotalPaidForTreatment: (treatmentId) => get().payments.filter(p => p.treatmentId === treatmentId).reduce((sum, p) => sum + p.amount, 0),
    }),
    { name: 'clinical-os-payments' }
  )
);

// ===================== Budgets =====================
interface BudgetStore {
  budgets: Budget[];
  addBudget: (b: Omit<Budget, 'id' | 'clinicId' | 'metadata' | 'folio'>) => Budget;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  getByPatient: (patientId: string) => Budget[];
}

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set, get) => ({
      budgets: [],
      addBudget: (b) => {
        const budget: Budget = { ...b, id: generateId(), clinicId: DEMO_CLINIC_ID, folio: generateFolio('PRE', get().budgets.length), metadata: createMetadata() };
        set((s) => ({ budgets: [...s.budgets, budget] }));
        return budget;
      },
      updateBudget: (id, updates) => set((s) => ({
        budgets: s.budgets.map(b => b.id === id ? { ...b, ...updates, metadata: updateMetadata(b.metadata) } : b)
      })),
      getByPatient: (patientId) => get().budgets.filter(b => b.patientId === patientId),
    }),
    { name: 'clinical-os-budgets' }
  )
);

// ===================== Prescriptions =====================
interface PrescriptionStore {
  prescriptions: Prescription[];
  addPrescription: (p: Omit<Prescription, 'id' | 'clinicId' | 'metadata' | 'folio'>) => Prescription;
  updatePrescription: (id: string, updates: Partial<Prescription>) => void;
  getByPatient: (patientId: string) => Prescription[];
}

export const usePrescriptionStore = create<PrescriptionStore>()(
  persist(
    (set, get) => ({
      prescriptions: [],
      addPrescription: (p) => {
        const rx: Prescription = { ...p, id: generateId(), clinicId: DEMO_CLINIC_ID, folio: generateFolio('RX', get().prescriptions.length), metadata: createMetadata() };
        set((s) => ({ prescriptions: [...s.prescriptions, rx] }));
        return rx;
      },
      updatePrescription: (id, updates) => set((s) => ({
        prescriptions: s.prescriptions.map(p => p.id === id ? { ...p, ...updates, metadata: updateMetadata(p.metadata) } : p)
      })),
      getByPatient: (patientId) => get().prescriptions.filter(p => p.patientId === patientId),
    }),
    { name: 'clinical-os-prescriptions' }
  )
);

// ===================== Certificates =====================
interface CertificateStore {
  certificates: Certificate[];
  addCertificate: (c: Omit<Certificate, 'id' | 'clinicId' | 'metadata' | 'folio'>) => Certificate;
  getByPatient: (patientId: string) => Certificate[];
}

export const useCertificateStore = create<CertificateStore>()(
  persist(
    (set, get) => ({
      certificates: [],
      addCertificate: (c) => {
        const cert: Certificate = { ...c, id: generateId(), clinicId: DEMO_CLINIC_ID, folio: generateFolio('CERT', get().certificates.length), metadata: createMetadata() };
        set((s) => ({ certificates: [...s.certificates, cert] }));
        return cert;
      },
      getByPatient: (patientId) => get().certificates.filter(c => c.patientId === patientId),
    }),
    { name: 'clinical-os-certificates' }
  )
);

// ===================== Consent =====================
interface ConsentStore {
  consents: ConsentForm[];
  templates: ConsentTemplate[];
  addConsent: (c: Omit<ConsentForm, 'id' | 'clinicId' | 'metadata'>) => ConsentForm;
  addTemplate: (t: Omit<ConsentTemplate, 'id' | 'clinicId' | 'metadata'>) => ConsentTemplate;
  getByPatient: (patientId: string) => ConsentForm[];
}

export const useConsentStore = create<ConsentStore>()(
  persist(
    (set, get) => ({
      consents: [],
      templates: [],
      addConsent: (c) => {
        const consent: ConsentForm = { ...c, id: generateId(), clinicId: DEMO_CLINIC_ID, metadata: createMetadata() };
        set((s) => ({ consents: [...s.consents, consent] }));
        return consent;
      },
      addTemplate: (t) => {
        const template: ConsentTemplate = { ...t, id: generateId(), clinicId: DEMO_CLINIC_ID, metadata: createMetadata() };
        set((s) => ({ templates: [...s.templates, template] }));
        return template;
      },
      getByPatient: (patientId) => get().consents.filter(c => c.patientId === patientId),
    }),
    { name: 'clinical-os-consent' }
  )
);

// ===================== Treatments =====================
interface TreatmentStore {
  treatments: Treatment[];
  addTreatment: (t: Omit<Treatment, 'id' | 'clinicId' | 'metadata'>) => Treatment;
  updateTreatment: (id: string, updates: Partial<Treatment>) => void;
  getByPatient: (patientId: string) => Treatment[];
  getPendingByPatient: (patientId: string) => Treatment[];
}

export const useTreatmentStore = create<TreatmentStore>()(
  persist(
    (set, get) => ({
      treatments: [],
      addTreatment: (t) => {
        const treatment: Treatment = { ...t, id: generateId(), clinicId: DEMO_CLINIC_ID, metadata: createMetadata() };
        set((s) => ({ treatments: [...s.treatments, treatment] }));
        return treatment;
      },
      updateTreatment: (id, updates) => set((s) => ({
        treatments: s.treatments.map(t => t.id === id ? { ...t, ...updates, metadata: updateMetadata(t.metadata) } : t)
      })),
      getByPatient: (patientId) => get().treatments.filter(t => t.patientId === patientId),
      getPendingByPatient: (patientId) => get().treatments.filter(t => t.patientId === patientId && !['completed', 'paid', 'historical'].includes(t.status)),
    }),
    { name: 'clinical-os-treatments' }
  )
);

// ===================== Odontogram =====================
interface OdontogramStore {
  findings: OdontogramFinding[];
  addFinding: (f: Omit<OdontogramFinding, 'id' | 'clinicId' | 'metadata'>) => OdontogramFinding;
  updateFinding: (id: string, updates: Partial<OdontogramFinding>) => void;
  removeFinding: (id: string) => void;
  getByPatient: (patientId: string) => OdontogramFinding[];
  getByRecord: (recordId: string) => OdontogramFinding[];
}

export const useOdontogramStore = create<OdontogramStore>()(
  persist(
    (set, get) => ({
      findings: [],
      addFinding: (f) => {
        const finding: OdontogramFinding = { ...f, id: generateId(), clinicId: DEMO_CLINIC_ID, metadata: createMetadata() };
        set((s) => ({ findings: [...s.findings, finding] }));
        return finding;
      },
      updateFinding: (id, updates) => set((s) => ({
        findings: s.findings.map(f => f.id === id ? { ...f, ...updates, metadata: updateMetadata(f.metadata) } : f)
      })),
      removeFinding: (id) => set((s) => ({ findings: s.findings.filter(f => f.id !== id) })),
      getByPatient: (patientId) => get().findings.filter(f => f.patientId === patientId),
      getByRecord: (recordId) => get().findings.filter(f => f.recordId === recordId),
    }),
    { name: 'clinical-os-odontogram' }
  )
);

// ===================== Medical Records =====================
interface MedicalRecordStore {
  records: MedicalRecord[];
  addRecord: (r: Omit<MedicalRecord, 'id' | 'clinicId' | 'metadata'>) => MedicalRecord;
  updateRecord: (id: string, updates: Partial<MedicalRecord>) => void;
  getByPatient: (patientId: string) => MedicalRecord[];
}

export const useMedicalRecordStore = create<MedicalRecordStore>()(
  persist(
    (set, get) => ({
      records: [],
      addRecord: (r) => {
        const record: MedicalRecord = { ...r, id: generateId(), clinicId: DEMO_CLINIC_ID, metadata: createMetadata() };
        set((s) => ({ records: [...s.records, record] }));
        return record;
      },
      updateRecord: (id, updates) => set((s) => ({
        records: s.records.map(r => r.id === id ? { ...r, ...updates, metadata: updateMetadata(r.metadata) } : r)
      })),
      getByPatient: (patientId) => get().records.filter(r => r.patientId === patientId),
    }),
    { name: 'clinical-os-records' }
  )
);

// ===================== Users =====================
interface UserStore {
  users: User[];
  currentUserId: string;
  addUser: (u: Omit<User, 'id' | 'clinicId' | 'metadata'>) => User;
  updateUser: (id: string, updates: Partial<User>) => void;
  getActiveUsers: () => User[];
  getCurrentUser: () => User | undefined;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      users: [],
      currentUserId: 'user-demo-admin',
      addUser: (u) => {
        const user: User = { ...u, id: generateId(), clinicId: DEMO_CLINIC_ID, metadata: createMetadata() };
        set((s) => ({ users: [...s.users, user] }));
        return user;
      },
      updateUser: (id, updates) => set((s) => ({
        users: s.users.map(u => u.id === id ? { ...u, ...updates, metadata: updateMetadata(u.metadata) } : u)
      })),
      getActiveUsers: () => get().users.filter(u => u.isActive && !u.metadata.isArchived),
      getCurrentUser: () => get().users.find(u => u.id === get().currentUserId),
    }),
    { name: 'clinical-os-users' }
  )
);
