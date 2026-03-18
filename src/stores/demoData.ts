import { DEMO_CLINIC_ID, DEMO_USER_ID } from './helpers';
import type { Patient, Doctor, Service, Medication, User, Appointment, Treatment } from '@/types';
import { createMetadata, generateId } from './helpers';
import { format, subDays, addDays } from 'date-fns';

const meta = () => createMetadata(DEMO_USER_ID);

export const DEMO_DOCTORS: Omit<Doctor, 'id' | 'clinicId' | 'metadata'>[] = [
  { fullName: 'Dr. Carlos Arreola Martínez', specialty: 'Odontología General', licenseNumber: '12345678', phone: '+52 55 9876 5432', email: 'c.arreola@clinicademo.mx', university: 'UNAM', officeAddress: 'Av. Reforma 123', isActive: true, agendaColor: '#3b82f6', signature: 'Dr. Carlos Arreola Martínez' },
  { fullName: 'Dra. María Fernanda López', specialty: 'Ortodoncia', licenseNumber: '87654321', phone: '+52 55 1111 2222', email: 'm.lopez@clinicademo.mx', university: 'UAM', officeAddress: 'Av. Reforma 123', isActive: true, agendaColor: '#10b981', signature: 'Dra. María F. López' },
  { fullName: 'Dr. Ricardo Sánchez Peña', specialty: 'Endodoncia', licenseNumber: '55667788', phone: '+52 55 3344 5566', email: 'r.sanchez@clinicademo.mx', university: 'IPN', officeAddress: 'Av. Reforma 123', isActive: true, agendaColor: '#f59e0b', signature: 'Dr. Ricardo Sánchez P.' },
];

export const DEMO_PATIENTS: Omit<Patient, 'id' | 'clinicId' | 'metadata'>[] = [
  { firstName: 'Ana', lastName: 'García Hernández', dateOfBirth: '1990-05-15', sex: 'F', phone: '+52 55 3333 4444', email: 'ana.garcia@email.com', address: 'Calle Madero 45, Col. Centro', maritalStatus: 'Soltera', bloodType: 'O+', allergies: ['Penicilina'], birthPlace: 'CDMX', education: 'Licenciatura', occupation: 'Abogada' },
  { firstName: 'Roberto', lastName: 'Díaz Méndez', dateOfBirth: '1985-11-20', sex: 'M', phone: '+52 55 5555 6666', email: 'roberto.diaz@email.com', address: 'Av. Insurgentes 890', maritalStatus: 'Casado', bloodType: 'A+', allergies: [], birthPlace: 'Guadalajara', education: 'Maestría', occupation: 'Ingeniero' },
  { firstName: 'Sofía', lastName: 'Martínez Ruiz', dateOfBirth: '2015-03-10', sex: 'F', phone: '+52 55 7777 8888', guardianName: 'Laura Ruiz', guardianPhone: '+52 55 7777 9999', address: 'Calle Hidalgo 23', allergies: [], birthPlace: 'CDMX' },
  { firstName: 'Jorge', lastName: 'Pérez Sánchez', dateOfBirth: '1978-08-02', sex: 'M', phone: '+52 55 9999 0000', email: 'jorge.perez@email.com', address: 'Av. Universidad 567', maritalStatus: 'Divorciado', bloodType: 'B+', allergies: ['Sulfas', 'Ibuprofeno'], birthPlace: 'Monterrey', education: 'Preparatoria', occupation: 'Comerciante' },
  { firstName: 'María Elena', lastName: 'Torres Vega', dateOfBirth: '1995-12-03', sex: 'F', phone: '+52 55 1212 3434', email: 'maelena@email.com', address: 'Calle Juárez 78', maritalStatus: 'Casada', bloodType: 'AB+', allergies: [], birthPlace: 'Puebla', education: 'Licenciatura', occupation: 'Diseñadora' },
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
  { name: 'Recepcionista Demo', email: 'recepcion@clinicademo.mx', role: 'receptionist', isActive: true, permissions: [
    { module: 'dashboard', actions: ['view'] },
    { module: 'agenda', actions: ['view', 'create', 'edit'] },
    { module: 'patients', actions: ['view', 'create', 'edit'] },
    { module: 'payments', actions: ['view', 'create'] },
  ]},
];

export function seedDemoData(stores: {
  doctorStore: any;
  patientStore: any;
  serviceStore: any;
  medicationStore: any;
  userStore: any;
}) {
  if (stores.doctorStore.getState().doctors.length > 0) return;

  DEMO_DOCTORS.forEach(d => stores.doctorStore.getState().addDoctor(d));
  DEMO_PATIENTS.forEach(p => stores.patientStore.getState().addPatient(p));
  DEMO_SERVICES.forEach(s => stores.serviceStore.getState().addService(s));
  DEMO_MEDICATIONS.forEach(m => stores.medicationStore.getState().addMedication(m));

  const adminUser = { ...DEMO_USERS[0], id: DEMO_USER_ID, clinicId: DEMO_CLINIC_ID, metadata: meta() };
  const receptionistUser = { ...DEMO_USERS[1], id: generateId(), clinicId: DEMO_CLINIC_ID, metadata: meta() };
  if (stores.userStore.getState().users.length === 0) {
    stores.userStore.setState((s: any) => ({ users: [...s.users, adminUser, receptionistUser] }));
  }
}

export function seedDemoAppointments(appointmentStore: any, patientStore: any, doctorStore: any) {
  if (appointmentStore.getState().appointments.length > 0) return;
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const patients = patientStore.getState().patients;
  const doctors = doctorStore.getState().doctors;
  if (patients.length >= 4 && doctors.length >= 2) {
    const { addAppointment } = appointmentStore.getState();
    // Yesterday (attended)
    addAppointment({ date: yesterday, startTime: '09:00', endTime: '09:40', duration: 40, patientId: patients[0].id, doctorId: doctors[0].id, reason: 'Consulta general - revisión', status: 'attended' as const, phone: patients[0].phone });
    addAppointment({ date: yesterday, startTime: '10:00', endTime: '10:45', duration: 45, patientId: patients[3].id, doctorId: doctors[0].id, reason: 'Limpieza dental', status: 'attended' as const, phone: patients[3].phone });
    // Today
    addAppointment({ date: today, startTime: '09:00', endTime: '09:40', duration: 40, patientId: patients[0].id, doctorId: doctors[0].id, reason: 'Seguimiento post-limpieza', status: 'confirmed' as const, phone: patients[0].phone });
    addAppointment({ date: today, startTime: '10:00', endTime: '10:45', duration: 45, patientId: patients[1].id, doctorId: doctors[0].id, reason: 'Resina en pieza 26', status: 'pending' as const, phone: patients[1].phone });
    addAppointment({ date: today, startTime: '11:30', endTime: '12:15', duration: 45, patientId: patients[3].id, doctorId: doctors[1].id, reason: 'Valoración ortodoncia', status: 'confirmed' as const, phone: patients[3].phone });
    addAppointment({ date: today, startTime: '15:00', endTime: '15:30', duration: 30, patientId: patients[2].id, doctorId: doctors[0].id, reason: 'Revisión pediátrica', status: 'pending' as const, phone: patients[2].phone });
    // Tomorrow
    addAppointment({ date: tomorrow, startTime: '09:00', endTime: '10:00', duration: 60, patientId: patients[1].id, doctorId: doctors[2].id, reason: 'Endodoncia pieza 14', status: 'confirmed' as const, phone: patients[1].phone });
    addAppointment({ date: tomorrow, startTime: '10:30', endTime: '11:15', duration: 45, patientId: patients[4].id, doctorId: doctors[0].id, reason: 'Blanqueamiento dental', status: 'pending' as const, phone: patients[4].phone });
  }
}

export function seedDemoTreatments(stores: { treatmentStore: any; patientStore: any; doctorStore: any }) {
  if (stores.treatmentStore.getState().treatments.length > 0) return;
  const patients = stores.patientStore.getState().patients;
  const doctors = stores.doctorStore.getState().doctors;
  if (patients.length >= 4 && doctors.length >= 2) {
    const { addTreatment } = stores.treatmentStore.getState();
    addTreatment({ patientId: patients[0].id, doctorId: doctors[0].id, description: 'Limpieza dental profilaxis', price: 800, status: 'completed', observations: 'Completada sin complicaciones' });
    addTreatment({ patientId: patients[0].id, doctorId: doctors[0].id, description: 'Resina pieza 16 (1 sup)', price: 1200, status: 'in_progress', toothNumber: 16, observations: 'Caries mesial' });
    addTreatment({ patientId: patients[1].id, doctorId: doctors[0].id, description: 'Resina pieza 26 (2 sup)', price: 1800, status: 'approved', toothNumber: 26 });
    addTreatment({ patientId: patients[1].id, doctorId: doctors[2].id, description: 'Endodoncia pieza 14', price: 5000, status: 'recommended', toothNumber: 14 });
    addTreatment({ patientId: patients[3].id, doctorId: doctors[0].id, description: 'Extracción simple pieza 48', price: 1500, status: 'paid', toothNumber: 48 });
    addTreatment({ patientId: patients[3].id, doctorId: doctors[1].id, description: 'Valoración ortodoncia', price: 500, status: 'in_progress' });
  }
}

export function seedDemoPayments(stores: { paymentStore: any; patientStore: any }) {
  if (stores.paymentStore.getState().payments.length > 0) return;
  const patients = stores.patientStore.getState().patients;
  if (patients.length >= 4) {
    const { addPayment } = stores.paymentStore.getState();
    addPayment({ patientId: patients[0].id, amount: 800, method: 'card', type: 'full', notes: 'Limpieza dental', date: format(subDays(new Date(), 5), "yyyy-MM-dd'T'HH:mm:ss") });
    addPayment({ patientId: patients[0].id, amount: 600, method: 'cash', type: 'partial', notes: 'Anticipo resina pieza 16', date: format(subDays(new Date(), 2), "yyyy-MM-dd'T'HH:mm:ss") });
    addPayment({ patientId: patients[3].id, amount: 1500, method: 'transfer', type: 'full', notes: 'Extracción pieza 48', date: format(subDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm:ss") });
    addPayment({ patientId: patients[3].id, amount: 500, method: 'cash', type: 'full', notes: 'Valoración ortodoncia', date: format(subDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss") });
  }
}

export function seedDemoRecords(stores: { recordStore: any; patientStore: any; doctorStore: any }) {
  if (stores.recordStore.getState().records.length > 0) return;
  const patients = stores.patientStore.getState().patients;
  const doctors = stores.doctorStore.getState().doctors;
  if (patients.length >= 2 && doctors.length >= 1) {
    const { addRecord } = stores.recordStore.getState();
    addRecord({
      patientId: patients[0].id, doctorId: doctors[0].id,
      familyHistory: [
        { id: generateId(), relationship: 'Padre', disease: 'Diabetes tipo 2', comments: 'Diagnosticado a los 50 años', isActive: true },
        { id: generateId(), relationship: 'Madre', disease: 'Hipertensión arterial', comments: 'En tratamiento', isActive: true },
      ],
      personalNonPathHistory: {
        oralHygiene: { 'Frecuencia de cepillado': '3 veces al día', 'Uso de hilo dental': 'Ocasional', 'Enjuague bucal': 'Sí', 'Última limpieza dental': 'Hace 6 meses' },
        diet: { 'Comidas al día': '3', 'Consumo de azúcares': 'Moderado' },
      },
      personalPathHistory: {
        'Alergias': { entries: [{ id: generateId(), description: 'Penicilina - reacción cutánea', notes: 'Documentada desde 2015' }] },
      },
      currentCondition: {
        chiefComplaint: 'Dolor en molar inferior derecho al masticar, desde hace 3 días',
        painSemiology: { onset: 'Hace 3 días', location: 'Molar inferior derecho', type: 'Punzante', intensity: 6, duration: 'Intermitente', aggravating: 'Masticación, frío', alleviating: 'Paracetamol' },
      },
      systemsReview: {
        'Digestivo': { system: 'Digestivo', hasAlterations: false },
        'Cardiovascular': { system: 'Cardiovascular', hasAlterations: false },
      },
      physicalExam: { weight: 62, height: 165, bmi: 22.8, heartRate: 72, bloodPressureSystolic: 110, bloodPressureDiastolic: 70, temperature: 36.5, oxygenSaturation: 98, respiratoryRate: 18 },
      auxiliaryStudies: [],
      diagnoses: [
        { id: generateId(), name: 'Caries dental pieza 46', code: 'K02.1', description: 'Caries en dentina, pieza 46 cara oclusal', isPrimary: true, date: format(subDays(new Date(), 5), 'yyyy-MM-dd') },
        { id: generateId(), name: 'Gingivitis localizada', code: 'K05.1', description: 'Inflamación gingival leve en sector posteroinferior', isPrimary: false, date: format(subDays(new Date(), 5), 'yyyy-MM-dd') },
      ],
      treatments: [],
      notes: [
        { id: generateId(), date: format(subDays(new Date(), 5), 'yyyy-MM-dd'), time: '09:30', authorId: doctors[0].id, authorName: doctors[0].fullName, content: 'Paciente refiere dolor en pieza 46 al masticar. Se observa caries en dentina cara oclusal. Se recomienda restauración con resina y profilaxis. Se programa cita para tratamiento.', isLocked: true },
        { id: generateId(), date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), time: '10:15', authorId: doctors[0].id, authorName: doctors[0].fullName, content: 'Se realizó profilaxis dental sin complicaciones. Paciente tolera bien el procedimiento. Se indica enjuague con clorhexidina por 5 días.', isLocked: false },
      ],
    });
    addRecord({
      patientId: patients[1].id, doctorId: doctors[0].id,
      familyHistory: [],
      personalNonPathHistory: {},
      personalPathHistory: {},
      currentCondition: { chiefComplaint: 'Revisión de rutina y valoración para resina en pieza 26' },
      systemsReview: {},
      physicalExam: { weight: 78, height: 175, bmi: 25.5, heartRate: 68, bloodPressureSystolic: 120, bloodPressureDiastolic: 80, temperature: 36.6, oxygenSaturation: 99 },
      auxiliaryStudies: [{ id: generateId(), type: 'Radiografía periapical', description: 'Rx periapical pieza 26, se observa lesión en esmalte', date: format(subDays(new Date(), 3), 'yyyy-MM-dd'), links: [], isCurrent: true }],
      diagnoses: [{ id: generateId(), name: 'Caries dental pieza 26', code: 'K02.0', description: 'Caries en esmalte', isPrimary: true, date: format(subDays(new Date(), 3), 'yyyy-MM-dd') }],
      treatments: [],
      notes: [{ id: generateId(), date: format(subDays(new Date(), 3), 'yyyy-MM-dd'), time: '11:00', authorId: doctors[0].id, authorName: doctors[0].fullName, content: 'Paciente acude a revisión. Se detecta caries incipiente en pieza 26. Se toma Rx periapical confirmatoria. Se agenda restauración.', isLocked: false }],
    });
  }
}
