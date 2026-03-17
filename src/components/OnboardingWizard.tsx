import { useState } from 'react';
import { useClinicStore } from '@/stores/clinicStore';
import { useDoctorStore } from '@/stores/doctorStore';
import { useServiceStore } from '@/stores/catalogStores';
import { usePatientStore } from '@/stores/patientStore';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { useUserStore, useMedicationStore } from '@/stores/catalogStores';
import { seedDemoData, seedDemoAppointments } from '@/stores/demoData';
import { Building2, User, ClipboardList, Calendar, Users, Check, ChevronRight, SkipForward } from 'lucide-react';

const STEPS = [
  { id: 'clinicIdentity', label: 'Identidad Clínica', icon: Building2 },
  { id: 'primaryDoctor', label: 'Médico Principal', icon: User },
  { id: 'services', label: 'Servicios', icon: ClipboardList },
  { id: 'schedule', label: 'Horarios', icon: Calendar },
  { id: 'users', label: 'Usuarios', icon: Users },
];

export default function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const clinic = useClinicStore(s => s.clinic);
  const initDemo = useClinicStore(s => s.initDemo);
  const updateClinic = useClinicStore(s => s.updateClinic);
  const setOnboardingStep = useClinicStore(s => s.setOnboardingStep);
  const setOnboardingCompleted = useClinicStore(s => s.setOnboardingCompleted);
  const onboarding = useClinicStore(s => s.onboarding);
  const doctors = useDoctorStore(s => s.doctors);
  const services = useServiceStore(s => s.services);

  const [step, setStep] = useState(onboarding.currentStep);
  const [clinicName, setClinicName] = useState(clinic?.name || 'Clínica Dental Demo');
  const [clinicAddress, setClinicAddress] = useState(clinic?.address || 'Av. Reforma 123, Col. Centro, CDMX');
  const [clinicPhone, setClinicPhone] = useState(clinic?.phone || '+52 55 1234 5678');
  const [clinicEmail, setClinicEmail] = useState(clinic?.email || 'contacto@clinicademo.mx');

  const handleSeedAndSkip = () => {
    if (!clinic) initDemo();
    seedDemoData({
      doctorStore: useDoctorStore,
      patientStore: usePatientStore,
      serviceStore: useServiceStore,
      medicationStore: useMedicationStore,
      userStore: useUserStore,
    });
    seedDemoAppointments(useAppointmentStore, usePatientStore, useDoctorStore);
    setOnboardingCompleted(true);
    onComplete();
  };

  const saveClinicStep = () => {
    if (!clinic) initDemo();
    updateClinic({ name: clinicName, address: clinicAddress, phone: clinicPhone, email: clinicEmail });
    setOnboardingStep('clinicIdentity', true);
    setStep(1);
  };

  const nextStep = () => {
    const key = STEPS[step].id as keyof typeof onboarding.steps;
    setOnboardingStep(key, true);
    if (step < STEPS.length - 1) setStep(step + 1);
    else { setOnboardingCompleted(true); onComplete(); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
            <span className="text-primary-foreground font-bold text-lg">CO</span>
          </div>
          <h1 className="text-xl font-semibold">Configuración Inicial</h1>
          <p className="text-sm text-muted-foreground mt-1">Configura tu clínica para comenzar a usar el sistema</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-1 mb-6">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                i < step ? 'bg-success text-success-foreground' : i === step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-success' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        <div className="card-clinical p-6">
          <h2 className="text-sm font-semibold mb-4">{STEPS[step].label}</h2>

          {step === 0 && (
            <div className="space-y-3">
              <div><label className="text-xs font-medium mb-1 block">Nombre de la clínica</label><input value={clinicName} onChange={e => setClinicName(e.target.value)} className="input-clinical h-9" /></div>
              <div><label className="text-xs font-medium mb-1 block">Dirección</label><input value={clinicAddress} onChange={e => setClinicAddress(e.target.value)} className="input-clinical h-9" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-medium mb-1 block">Teléfono</label><input value={clinicPhone} onChange={e => setClinicPhone(e.target.value)} className="input-clinical h-9" /></div>
                <div><label className="text-xs font-medium mb-1 block">Correo</label><input value={clinicEmail} onChange={e => setClinicEmail(e.target.value)} className="input-clinical h-9" /></div>
              </div>
              <button onClick={saveClinicStep} className="w-full bg-primary text-primary-foreground text-xs py-2 rounded-md hover:bg-primary/90 font-medium flex items-center justify-center gap-1">Guardar y Continuar <ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
          )}

          {step >= 1 && step <= 4 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {step === 1 && `${doctors.length} médico(s) registrado(s). Puedes agregar más desde el módulo de Médicos.`}
                {step === 2 && `${services.length} servicio(s) registrado(s). Puedes administrarlos desde Catálogo de Servicios.`}
                {step === 3 && 'Los horarios se configuran por médico en el módulo de Perfiles Médicos.'}
                {step === 4 && 'Los usuarios se administran desde el módulo de Usuarios y Permisos.'}
              </p>
              <button onClick={nextStep} className="w-full bg-primary text-primary-foreground text-xs py-2 rounded-md hover:bg-primary/90 font-medium flex items-center justify-center gap-1">
                {step < 4 ? <>Continuar <ChevronRight className="w-3.5 h-3.5" /></> : 'Finalizar Configuración'}
              </button>
            </div>
          )}
        </div>

        <div className="text-center mt-4">
          <button onClick={handleSeedAndSkip} className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mx-auto">
            <SkipForward className="w-3 h-3" /> Omitir y cargar datos demo
          </button>
          <p className="text-[10px] text-muted-foreground mt-1">Se cargará una clínica demo con pacientes, médicos, servicios y medicamentos de ejemplo</p>
        </div>
      </div>
    </div>
  );
}
