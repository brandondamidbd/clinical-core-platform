// ============================================================
// Core Clinical OS Types
// All entities anchored to clinicId for future multi-tenancy
// ============================================================

export interface Metadata {
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;
  version: number;
  isArchived: boolean;
}

export interface Clinic {
  id: string;
  organizationId: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  secondaryLogo?: string;
  fiscalAddress?: string;
  specialty: ClinicSpecialty;
  timezone: string;
  documentPalette?: { primary: string; secondary: string; accent: string };
  metadata: Metadata;
}

export type ClinicSpecialty = 'odontologia' | 'medicina_general' | 'psicologia' | 'psiquiatria';

export interface SubscriptionState {
  status: 'trial' | 'active' | 'grace' | 'expired' | 'restricted' | 'cancelled';
  planId: string;
  planName: string;
  trialStartDate?: string;
  trialEndDate?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  limits: PlanLimits;
  hadTrial: boolean;
  processedEventIds: string[];
}

export interface PlanLimits {
  maxDoctors: number;
  maxUsers: number;
  maxBranches: number;
  maxStorageMB: number;
  availableModules: string[];
}

export interface Branch {
  id: string;
  clinicId: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  metadata: Metadata;
}

export type UserRole = 'admin' | 'doctor' | 'receptionist' | 'assistant' | 'billing' | 'readonly' | 'demo';

export interface Permission {
  module: string;
  actions: ('view' | 'create' | 'edit' | 'delete' | 'export' | 'configure')[];
}

export interface User {
  id: string;
  clinicId: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  metadata: Metadata;
}

export interface Doctor {
  id: string;
  clinicId: string;
  fullName: string;
  specialty: string;
  licenseNumber: string;
  phone: string;
  email: string;
  university?: string;
  officeAddress?: string;
  signature?: string;
  isActive: boolean;
  agendaColor: string;
  schedule?: WeekSchedule;
  metadata: Metadata;
}

export interface WeekSchedule {
  [day: string]: { start: string; end: string; enabled: boolean }[];
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'attended' | 'cancelled' | 'rescheduled' | 'no_show';

export interface Appointment {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId: string;
  branchId?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  reason: string;
  status: AppointmentStatus;
  phone?: string;
  notes?: string;
  metadata: Metadata;
}

export interface Patient {
  id: string;
  clinicId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age?: number;
  sex: 'M' | 'F' | 'other';
  maritalStatus?: string;
  birthPlace?: string;
  bloodType?: string;
  education?: string;
  address?: string;
  phone: string;
  email?: string;
  guardianName?: string;
  guardianPhone?: string;
  primaryDoctorId?: string;
  allergies: string[];
  metadata: Metadata;
}

export interface MedicalRecord {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId: string;
  familyHistory: FamilyHistoryEntry[];
  personalNonPathHistory: Record<string, any>;
  personalPathHistory: Record<string, any>;
  currentCondition: CurrentCondition;
  systemsReview: Record<string, SystemReview>;
  physicalExam: PhysicalExam;
  occlusalAnalysis?: Record<string, any>;
  periodontalExam?: PeriodontalEntry[];
  extraoralExam?: Record<string, any>;
  softTissueExam?: Record<string, any>;
  hardTissueExam?: Record<string, any>;
  auxiliaryStudies: AuxiliaryStudy[];
  diagnoses: Diagnosis[];
  treatments: Treatment[];
  notes: ClinicalNote[];
  metadata: Metadata;
}

export interface FamilyHistoryEntry {
  id: string;
  relationship: string;
  disease: string;
  comments?: string;
  isActive: boolean;
  onsetAge?: number;
}

export interface CurrentCondition {
  chiefComplaint: string;
  painSemiology?: {
    onset?: string;
    location?: string;
    radiation?: string;
    type?: string;
    intensity?: number;
    duration?: string;
    frequency?: string;
    aggravating?: string;
    alleviating?: string;
    associated?: string;
  };
  accompanyingSymptoms?: Record<string, any>;
}

export interface SystemReview {
  system: string;
  hasAlterations: boolean;
  description?: string;
  evolution?: string;
  currentTreatment?: string;
}

export interface PhysicalExam {
  weight?: number;
  height?: number;
  bmi?: number;
  oxygenSaturation?: number;
  heartRate?: number;
  respiratoryRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  temperature?: number;
}

export interface PeriodontalEntry {
  id: string;
  toothNumber: number;
  finding: string;
  location?: string;
  severity?: string;
  comment?: string;
  date: string;
}

export interface AuxiliaryStudy {
  id: string;
  type: string;
  description: string;
  date: string;
  links: string[];
  isCurrent: boolean;
}

export interface Diagnosis {
  id: string;
  code?: string;
  name: string;
  description?: string;
  isPrimary: boolean;
  date: string;
}

export type TreatmentStatus = 'recommended' | 'budgeted' | 'approved' | 'in_progress' | 'completed' | 'paid' | 'historical';

export interface Treatment {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId: string;
  description: string;
  price: number;
  observations?: string;
  status: TreatmentStatus;
  diagnosisId?: string;
  toothNumber?: number;
  metadata: Metadata;
}

export interface ClinicalNote {
  id: string;
  date: string;
  time: string;
  authorId: string;
  authorName: string;
  content: string;
  isLocked: boolean;
}

export type OdontogramSurface = 'distal' | 'mesial' | 'occlusal' | 'vestibular' | 'palatal';
export type ToothStatus = 'sano' | 'caries' | 'obturado' | 'fracturado' | 'ausente' | 'extraccion_indicada' | 'endodoncia' | 'corona' | 'sellador' | 'movilidad' | 'remanente_radicular' | 'protesis' | 'implante' | 'otro';

export interface OdontogramFinding {
  id: string;
  clinicId: string;
  patientId: string;
  recordId: string;
  toothNumber: number;
  surface?: OdontogramSurface;
  status: ToothStatus;
  comment?: string;
  date: string;
  metadata: Metadata;
}

export interface Prescription {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId: string;
  folio: string;
  date: string;
  vitalSigns: PhysicalExam;
  diagnosis: string;
  medications: PrescriptionMedication[];
  additionalInstructions?: string;
  nextAppointment?: string;
  status: 'draft' | 'issued';
  metadata: Metadata;
}

export interface PrescriptionMedication {
  id: string;
  name: string;
  presentation: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
  specificInstructions?: string;
}

export interface Certificate {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId: string;
  folio: string;
  date: string;
  place: string;
  diagnosis?: string;
  genericText?: string;
  omitDiagnosis: boolean;
  procedure: string;
  restDays: number;
  restFrom?: string;
  restTo?: string;
  patientSignature?: string;
  doctorSignature?: string;
  metadata: Metadata;
}

export interface ConsentForm {
  id: string;
  clinicId: string;
  patientId?: string;
  doctorId?: string;
  templateId?: string;
  procedure: string;
  description: string;
  risks: string;
  complications: string;
  patientSignature?: string;
  doctorSignature?: string;
  date: string;
  metadata: Metadata;
}

export interface ConsentTemplate {
  id: string;
  clinicId: string;
  procedure: string;
  description: string;
  risks: string;
  complications: string;
  metadata: Metadata;
}

export interface Budget {
  id: string;
  clinicId: string;
  patientId?: string;
  prospectName?: string;
  folio: string;
  date: string;
  items: BudgetItem[];
  discountPercent: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  validUntil: string;
  notes?: string;
  status: 'draft' | 'issued' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  metadata: Metadata;
}

export interface BudgetItem {
  id: string;
  serviceId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Payment {
  id: string;
  clinicId: string;
  patientId: string;
  treatmentId?: string;
  budgetId?: string;
  amount: number;
  method: 'cash' | 'card' | 'transfer' | 'other';
  type: 'full' | 'partial';
  notes?: string;
  date: string;
  metadata: Metadata;
}

export interface Service {
  id: string;
  clinicId: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  isActive: boolean;
  metadata: Metadata;
}

export interface Medication {
  id: string;
  clinicId: string;
  name: string;
  category: string;
  mainUse: string;
  presentation: string;
  usualDose: string;
  warnings?: string;
  isActive: boolean;
  metadata: Metadata;
}

export interface SyncState {
  lastSyncDate?: string;
  pendingChanges: number;
  conflictsDetected: number;
  syncMode: 'local' | 'hybrid' | 'cloud';
  entities: Record<string, { pending: number; lastSync?: string }>;
}

export interface BackupRecord {
  id: string;
  date: string;
  size: number;
  encrypted: boolean;
  type: 'manual' | 'auto';
  version: string;
}

export interface OnboardingState {
  completed: boolean;
  currentStep: number;
  steps: {
    clinicIdentity: boolean;
    primaryDoctor: boolean;
    services: boolean;
    schedule: boolean;
    users: boolean;
  };
}
