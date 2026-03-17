import { useState } from 'react';
import { useClinicStore } from '@/stores/clinicStore';
import { usePatientStore } from '@/stores/patientStore';
import { useDoctorStore } from '@/stores/doctorStore';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { useServiceStore, useMedicationStore, usePaymentStore, usePrescriptionStore, useBudgetStore, useTreatmentStore, useOdontogramStore, useMedicalRecordStore, useConsentStore, useCertificateStore, useUserStore } from '@/stores/catalogStores';
import { Download, Upload, Trash2, AlertTriangle, Shield, Database, Clock } from 'lucide-react';
import { generateId } from '@/stores/helpers';
import { format } from 'date-fns';

export default function SettingsPage() {
  const clinic = useClinicStore(s => s.clinic);
  const subscription = useClinicStore(s => s.subscription);
  const setSubscriptionStatus = useClinicStore(s => s.setSubscriptionStatus);
  const addBackup = useClinicStore(s => s.addBackup);
  const backups = useClinicStore(s => s.backups);
  const resetAll = useClinicStore(s => s.resetAll);
  const [exportPassword, setExportPassword] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [confirmReset, setConfirmReset] = useState('');
  const [simStatus, setSimStatus] = useState(subscription.status);

  const handleExport = () => {
    const allData: Record<string, any> = {};
    const keys = Object.keys(localStorage).filter(k => k.startsWith('clinical-os-'));
    keys.forEach(k => { try { allData[k] = JSON.parse(localStorage.getItem(k) || '{}'); } catch {} });
    const payload = JSON.stringify({ version: '1.0', exportDate: new Date().toISOString(), clinicId: clinic?.id, data: allData }, null, 2);
    // Simple XOR "encryption" with password for demo
    let output = payload;
    if (exportPassword) {
      const encoded = btoa(unescape(encodeURIComponent(payload)));
      output = JSON.stringify({ encrypted: true, data: encoded, hint: 'Password protected backup' });
    }
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `clinical-os-backup-${format(new Date(), 'yyyyMMdd-HHmmss')}.json`; a.click();
    URL.revokeObjectURL(url);
    addBackup({ id: generateId(), date: new Date().toISOString(), size: blob.size, encrypted: !!exportPassword, type: 'manual', version: '1.0' });
  };

  const handleImport = () => {
    if (!importFile) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let parsed = JSON.parse(e.target?.result as string);
        if (parsed.encrypted) { parsed = JSON.parse(decodeURIComponent(escape(atob(parsed.data)))); }
        if (parsed.data) {
          Object.entries(parsed.data).forEach(([key, value]) => { localStorage.setItem(key, JSON.stringify(value)); });
          window.location.reload();
        }
      } catch (err) { alert('Error al importar respaldo. Verifica el archivo.'); }
    };
    reader.readAsText(importFile);
  };

  const handleReset = () => {
    if (confirmReset !== 'ELIMINAR') return;
    Object.keys(localStorage).filter(k => k.startsWith('clinical-os-')).forEach(k => localStorage.removeItem(k));
    window.location.reload();
  };

  return (
    <div className="space-y-4 animate-fade-in max-w-3xl">
      <div className="page-header"><h1 className="page-title">Ajustes del Sistema</h1></div>

      {/* Export */}
      <div className="card-clinical p-4">
        <h2 className="section-title flex items-center gap-2"><Download className="w-4 h-4" /> Exportar Respaldo</h2>
        <p className="meta-text mb-3">Descarga una copia completa de todos los datos locales.</p>
        <div className="flex gap-2 items-end">
          <div className="flex-1"><label className="text-xs font-medium mb-1 block">Contraseña (opcional)</label><input type="password" value={exportPassword} onChange={e => setExportPassword(e.target.value)} className="input-clinical h-9" placeholder="Cifrar respaldo" /></div>
          <button onClick={handleExport} className="bg-primary text-primary-foreground text-xs px-4 py-2 rounded-md hover:bg-primary/90 font-medium h-9">Exportar</button>
        </div>
        {backups.length > 0 && (
          <div className="mt-3 text-xs text-muted-foreground">Último respaldo: {format(new Date(backups[backups.length-1].date), 'dd/MM/yyyy HH:mm')} · {backups.length} respaldo(s) total(es)</div>
        )}
      </div>

      {/* Import */}
      <div className="card-clinical p-4">
        <h2 className="section-title flex items-center gap-2"><Upload className="w-4 h-4" /> Importar Respaldo</h2>
        <p className="meta-text mb-3">Restaura datos desde un archivo de respaldo. Se creará copia previa automáticamente.</p>
        <div className="flex gap-2 items-end">
          <div className="flex-1"><input type="file" accept=".json" onChange={e => setImportFile(e.target.files?.[0] || null)} className="text-xs" /></div>
          <button onClick={() => { handleExport(); setTimeout(handleImport, 500); }} disabled={!importFile} className="bg-primary text-primary-foreground text-xs px-4 py-2 rounded-md hover:bg-primary/90 font-medium h-9 disabled:opacity-50">Importar</button>
        </div>
      </div>

      {/* Subscription simulator */}
      <div className="card-clinical p-4">
        <h2 className="section-title flex items-center gap-2"><Shield className="w-4 h-4" /> Simulador de Suscripción</h2>
        <p className="meta-text mb-3">Prueba los diferentes estados de licencia del sistema.</p>
        <div className="flex gap-2 items-end">
          <select value={simStatus} onChange={e => setSimStatus(e.target.value as any)} className="input-clinical h-9 w-48">
            <option value="trial">Trial / Demo</option><option value="active">Activa</option><option value="grace">Período de gracia</option><option value="expired">Vencida</option><option value="restricted">Restringida</option>
          </select>
          <button onClick={() => setSubscriptionStatus(simStatus)} className="bg-primary text-primary-foreground text-xs px-4 py-2 rounded-md hover:bg-primary/90 font-medium h-9">Aplicar</button>
        </div>
      </div>

      {/* Sync state */}
      <div className="card-clinical p-4">
        <h2 className="section-title flex items-center gap-2"><Clock className="w-4 h-4" /> Estado de Sincronización</h2>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Modo</span><span className="font-medium">Local (Offline)</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Sincronización nube</span><span className="text-muted-foreground">No configurada</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Cambios pendientes</span><span className="font-mono">—</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Conflictos</span><span className="font-mono">0</span></div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card-clinical p-4 border-2 border-destructive/20">
        <h2 className="section-title flex items-center gap-2 text-destructive"><Trash2 className="w-4 h-4" /> Zona de Peligro</h2>
        <div className="flex items-start gap-2 p-2 bg-destructive/5 rounded mb-3 text-xs text-destructive">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>Esta acción eliminará permanentemente todos los datos locales del sistema. No se puede deshacer. Se recomienda exportar un respaldo antes de continuar. Solo un superadmin debería ejecutar esta acción.</div>
        </div>
        <div className="flex gap-2 items-end">
          <div className="flex-1"><label className="text-xs font-medium mb-1 block">Escribe ELIMINAR para confirmar</label><input value={confirmReset} onChange={e => setConfirmReset(e.target.value)} className="input-clinical h-9" placeholder="ELIMINAR" /></div>
          <button onClick={handleReset} disabled={confirmReset !== 'ELIMINAR'} className="bg-destructive text-destructive-foreground text-xs px-4 py-2 rounded-md hover:bg-destructive/90 font-medium h-9 disabled:opacity-50">Reiniciar Base</button>
        </div>
      </div>
    </div>
  );
}
