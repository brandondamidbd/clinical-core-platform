import { DEMO_CLINIC_ID, DEMO_USER_ID } from './helpers';
import type { Patient, Doctor, Service, Medication, User, Appointment, Treatment } from '@/types';
import { createMetadata, generateId } from './helpers';

const meta = () => createMetadata(DEMO_USER_ID);

export const DEMO_DOCTORS: Omit<Doctor, 'id' | 'clinicId' | 'metadata'>[] = [
  { fullName: 'Dr. Carlos Arreola Martínez', specialty: 'Odontología General', licenseNumber: '12345678', phone: '+52 55 9876 5432', email: 'c.arreola@clinicademo.mx', university: 'UNAM', officeAddress: 'Av. Reforma 123', isActive: true, agendaColor: '#3b82f6' },
  { fullName: 'Dra. María Fernanda López', specialty: 'Ortodoncia', licenseNumber: '87654321', phone: '+52 55 1111 2222', email: 'm.lopez@clinicademo.mx', university: 'UAM', officeAddress: 'Av. Reforma 123', isActive: true, agendaColor: '#10b981' },
];

export const DEMO_PATIENTS: Omit<Patient, 'id' | 'clinicId' | 'metadata'>[] = [
  { firstName: 'Ana', lastName: 'García Hernández', dateOfBirth: '1990-05-15', sex: 'F', phone: '+52 55 3333 4444', email: 'ana.garcia@email.com', address: 'Calle Madero 45, Col. Centro', maritalStatus: 'Soltera', bloodType: 'O+', allergies: ['Penicilina'] },
  { firstName: 'Roberto', lastName: 'Díaz Méndez', dateOfBirth: '1985-11-20', sex: 'M', phone: '+52 55 5555 6666', email: 'roberto.diaz@email.com', address: 'Av. Insurgentes 890', maritalStatus: 'Casado', bloodType: 'A+', allergies: [] },
  { firstName: 'Sofía', lastName: 'Martínez Ruiz', dateOfBirth: '2015-03-10', sex: 'F', phone: '+52 55 7777 8888', guardianName: 'Laura Ruiz', guardianPhone: '+52 55 7777 9999', address: 'Calle Hidalgo 23', allergies: [] },
  { firstName: 'Jorge', lastName: 'Pérez Sánchez', dateOfBirth: '1978-08-02', sex: 'M', phone: '+52 55 9999 0000', email: 'jorge.perez@email.com', address: 'Av. Universidad 567', maritalStatus: 'Divorciado', bloodType: 'B+', allergies: ['Sulfas', 'Ibuprofeno'] },
];

export const DEMO_SERVICES: Omit<Service, 'id' | 'clinicId' | 'metadata'>[] = [
  { name: 'Consulta General', price: 500, category: 'Consulta', isActive: true, description: 'Consulta odontológica de primera vez o subsecuente' },
  { name: 'Limpieza Dental', price: 800, category: 'Prevención', isActive: true, description: 'Profilaxis dental con ultrasonido' },
  { name: 'Resina (1 superficie)', price: 1200, category: 'Restauración', isActive: true, description: 'Restauración con resina compuesta' },
  { name: 'Resina (2+ superficies)', price: 1800, category: 'Restauración', isActive: true, description: 'Restauración con resina compuesta multisuperficie' },
  { name: 'Extracción Simple', price: 1500, category: 'Cirugía', isActive: true, description: 'Extracción dental no quirúrgica' },
  { name: 'Extracción Quirúrgica', price: 3500, category: 'Cirugía', isActive: true, description: 'Extracción dental quirúrgica' },
  { name: 'Endodoncia Anterior', price: 4000, category: 'Endodoncia', isActive: true, description: 'Tratamiento de conductos en diente anterior' },
  { name: 'Endodoncia Premolar', price: 5000, category: 'Endodoncia', isActive: true, description: 'Tratamiento de conductos en premolar' },
  { name: 'Corona de Porcelana', price: 6000, category: 'Prótesis', isActive: true, description: 'Corona dental de porcelana' },
  { name: 'Guardas Oclusales', price: 3000, category: 'Ortopedia', isActive: true, description: 'Guarda oclusal de acrílico' },
  { name: 'Blanqueamiento', price: 4500, category: 'Estética', isActive: true, description: 'Blanqueamiento dental en consultorio' },
  { name: 'Sellador de Fosetas', price: 600, category: 'Prevención', isActive: true, description: 'Aplicación de sellador por pieza' },
];

export const DEMO_MEDICATIONS: Omit<Medication, 'id' | 'clinicId' | 'metadata'>[] = [
  { name: 'Amoxicilina', category: 'Antibiótico', mainUse: 'Infecciones bacterianas', presentation: 'Cápsulas 500mg', usualDose: '500mg cada 8 horas', warnings: 'Alergia a penicilinas', isActive: true },
  { name: 'Ibuprofeno', category: 'AINE', mainUse: 'Dolor e inflamación', presentation: 'Tabletas 400mg', usualDose: '400mg cada 6-8 horas', warnings: 'Úlcera gástrica, alergia a AINEs', isActive: true },
  { name: 'Ketorolaco', category: 'AINE', mainUse: 'Dolor moderado a severo', presentation: 'Tabletas 10mg', usualDose: '10mg cada 6 horas (máx 5 días)', warnings: 'No más de 5 días, IR, úlcera', isActive: true },
  { name: 'Paracetamol', category: 'Analgésico', mainUse: 'Dolor leve a moderado', presentation: 'Tabletas 500mg', usualDose: '500-1000mg cada 6-8 horas', warnings: 'Hepatopatía', isActive: true },
  { name: 'Clindamicina', category: 'Antibiótico', mainUse: 'Infecciones dentales en alérgicos a penicilina', presentation: 'Cápsulas 300mg', usualDose: '300mg cada 8 horas', warnings: 'Colitis pseudomembranosa', isActive: true },
  { name: 'Metronidazol', category: 'Antibiótico/Antiparasitario', mainUse: 'Infecciones anaerobias', presentation: 'Tabletas 500mg', usualDose: '500mg cada 8 horas', warnings: 'No alcohol, neuropatía', isActive: true },
  { name: 'Clorhexidina 0.12%', category: 'Antiséptico', mainUse: 'Enjuague bucal antiséptico', presentation: 'Solución 250ml', usualDose: 'Enjuagues de 15ml por 30 seg, 2 veces/día', isActive: true },
  { name: 'Nimesulida', category: 'AINE', mainUse: 'Dolor e inflamación', presentation: 'Tabletas 100mg', usualDose: '100mg cada 12 horas', warnings: 'Hepatotoxicidad, no más de 15 días', isActive: true },
];

export const DEMO_USERS: Omit<User, 'id' | 'clinicId' | 'metadata'>[] = [
  { name: 'Administrador Demo', email: 'admin@clinicademo.mx', role: 'admin', isActive: true, permissions: [
    { module: 'dashboard', actions: ['view'] },
    { module: 'agenda', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'patients', actions: ['view', 'create', 'edit', 'delete', 'export'] },
    { module: 'records', actions: ['view', 'create', 'edit', 'delete', 'export'] },
    { module: 'odontogram', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'prescriptions', actions: ['view', 'create', 'edit', 'export'] },
    { module: 'certificates', actions: ['view', 'create', 'edit', 'export'] },
    { module: 'budgets', actions: ['view', 'create', 'edit', 'delete', 'export'] },
    { module: 'payments', actions: ['view', 'create', 'edit', 'export'] },
    { module: 'services', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'medications', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'doctors', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'consent', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'users', actions: ['view', 'create', 'edit', 'delete', 'configure'] },
    { module: 'settings', actions: ['view', 'configure', 'export'] },
    { module: 'support', actions: ['view'] },
  ]},
];

export function seedDemoData(stores: {
  doctorStore: any;
  patientStore: any;
  serviceStore: any;
  medicationStore: any;
  userStore: any;
}) {
  // Only seed if empty
  if (stores.doctorStore.getState().doctors.length > 0) return;

  DEMO_DOCTORS.forEach(d => stores.doctorStore.getState().addDoctor(d));
  DEMO_PATIENTS.forEach(p => stores.patientStore.getState().addPatient(p));
  DEMO_SERVICES.forEach(s => stores.serviceStore.getState().addService(s));
  DEMO_MEDICATIONS.forEach(m => stores.medicationStore.getState().addMedication(m));
  
  // Add demo admin user with fixed ID
  const adminUser = {
    ...DEMO_USERS[0],
    id: DEMO_USER_ID,
    clinicId: DEMO_CLINIC_ID,
    metadata: meta(),
  };
  if (stores.userStore.getState().users.length === 0) {
    stores.userStore.setState((s: any) => ({ users: [...s.users, adminUser] }));
  }

  // Seed some appointments for today
  const today = new Date().toISOString().split('T')[0];
  const patients = stores.patientStore.getState().patients;
  const doctors = stores.doctorStore.getState().doctors;
  
  if (patients.length >= 2 && doctors.length >= 1) {
    const { addAppointment } = require('./appointmentStore').useAppointmentStore.getState();
    const appts = require('./appointmentStore').useAppointmentStore.getState().appointments;
    if (appts.length === 0) {
      addAppointment({ date: today, startTime: '09:00', endTime: '09:30', duration: 30, patientId: patients[0].id, doctorId: doctors[0].id, reason: 'Consulta general - revisión', status: 'confirmed' as const, phone: patients[0].phone });
      addAppointment({ date: today, startTime: '10:00', endTime: '10:45', duration: 45, patientId: patients[1].id, doctorId: doctors[0].id, reason: 'Limpieza dental', status: 'pending' as const, phone: patients[1].phone });
      addAppointment({ date: today, startTime: '11:30', endTime: '12:15', duration: 45, patientId: patients[3].id, doctorId: doctors[1].id, reason: 'Valoración ortodoncia', status: 'confirmed' as const, phone: patients[3].phone });
    }
  }
}
