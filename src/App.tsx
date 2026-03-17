import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { useClinicStore } from "@/stores/clinicStore";
import OnboardingWizard from "@/components/OnboardingWizard";
import DashboardPage from "@/pages/DashboardPage";
import AgendaPage from "@/pages/AgendaPage";
import ConsultaPage from "@/pages/ConsultaPage";
import PatientsPage from "@/pages/PatientsPage";
import PatientDetailPage from "@/pages/PatientDetailPage";
import MedicalRecordPage from "@/pages/MedicalRecordPage";
import OdontogramPage from "@/pages/OdontogramPage";
import PrescriptionsPage from "@/pages/PrescriptionsPage";
import PaymentsPage from "@/pages/PaymentsPage";
import BudgetsPage from "@/pages/BudgetsPage";
import ServicesPage from "@/pages/ServicesPage";
import DoctorsPage from "@/pages/DoctorsPage";
import MedicationsPage from "@/pages/MedicationsPage";
import TreatmentsPage from "@/pages/TreatmentsPage";
import UsersPage from "@/pages/UsersPage";
import SettingsPage from "@/pages/SettingsPage";
import ClinicIdentityPage from "@/pages/ClinicIdentityPage";
import SupportPage from "@/pages/SupportPage";
import { DiagnosticsPage, ClinicalNotesPage, AuxStudiesPage, CertificatesPage, ConsentPage } from "@/pages/PlaceholderPages";
import NotFound from "@/pages/NotFound";
import { useState } from "react";

const queryClient = new QueryClient();

function AppContent() {
  const onboarding = useClinicStore((s) => s.onboarding);
  const [showOnboarding, setShowOnboarding] = useState(!onboarding.completed);

  if (showOnboarding) {
    return <OnboardingWizard onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/consulta" element={<ConsultaPage />} />
        <Route path="/agenda" element={<AgendaPage />} />
        <Route path="/pacientes" element={<PatientsPage />} />
        <Route path="/pacientes/:id" element={<PatientDetailPage />} />
        <Route path="/expediente" element={<MedicalRecordPage />} />
        <Route path="/odontograma" element={<OdontogramPage />} />
        <Route path="/diagnosticos" element={<DiagnosticsPage />} />
        <Route path="/tratamientos" element={<TreatmentsPage />} />
        <Route path="/notas" element={<ClinicalNotesPage />} />
        <Route path="/estudios" element={<AuxStudiesPage />} />
        <Route path="/recetas" element={<PrescriptionsPage />} />
        <Route path="/certificados" element={<CertificatesPage />} />
        <Route path="/consentimientos" element={<ConsentPage />} />
        <Route path="/presupuestos" element={<BudgetsPage />} />
        <Route path="/pagos" element={<PaymentsPage />} />
        <Route path="/medicos" element={<DoctorsPage />} />
        <Route path="/servicios" element={<ServicesPage />} />
        <Route path="/medicamentos" element={<MedicationsPage />} />
        <Route path="/identidad" element={<ClinicIdentityPage />} />
        <Route path="/usuarios" element={<UsersPage />} />
        <Route path="/ajustes" element={<SettingsPage />} />
        <Route path="/soporte" element={<SupportPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
