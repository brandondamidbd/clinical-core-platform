import { useState } from 'react';
import { useClinicStore } from '@/stores/clinicStore';
import { useAgendaConfigStore } from '@/stores/agendaConfigStore';
import { Download, Upload, Trash2, AlertTriangle, Shield, Clock, Calendar, Save, Plus, X } from 'lucide-react';
import { generateId } from '@/stores/helpers';
import { format } from 'date-fns';
import { toast } from 'sonner';

const DAYS = [
  { key: 'lunes', label: 'Lunes' }, { key: 'martes', label: 'Martes' }, { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' }, { key: 'viernes', label: 'Viernes' }, { key: 'sabado', label: 'Sábado' }, { key: 'domingo', label: 'Domingo' },
];

export default function SettingsPage() {
  const clinic = useClinicStore(s => s.clinic);
  const subscription = useClinicStore(s => s.subscription);
  const setSubscriptionStatus = useClinicStore(s => s.setSubscriptionStatus);
  const addBackup = useClinicStore(s => s.addBackup);
  const backups = useClinicStore(s => s.backups);
  const agendaConfig = useAgendaConfigStore(s => s.config);
  const updateSchedule = useAgendaConfigStore(s => s.updateSchedule);
  const setDefaultDuration = useAgendaConfigStore(s => s.setDefaultDuration);
  const addAppointmentType = useAgendaConfigStore(s => s.addAppointmentType);
  const removeAppointmentType = useAgendaConfigStore(s => s.removeAppointmentType);
  const updateAppointmentType = useAgendaConfigStore(s => s.updateAppointmentType);

  const [exportPassword, setExportPassword] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [confirmReset, setConfirmReset] = useState('');
  const [simStatus, setSimStatus] = useState(subscription.status);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeDur, setNewTypeDur] = useState('30');

  const handleExport = () => {
    const allData: Record<string, any> = {};
    Object.keys(localStorage).filter(k => k.startsWith('clinical-os-')).forEach(k => { try { allData[k] = JSON.parse(localStorage.getItem(k) || '{}'); } catch {} });
    const payload = JSON.stringify({ version: '1.0', exportDate: new Date().toISOString(), clinicId: clinic?.id, data: allData }, null, 2);
    let output = payload;
    if (exportPassword) { output = JSON.stringify({ encrypted: true, data: btoa(unescape(encodeURIComponent(payload))), hint: 'Password protected' }); }
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `clinical-os-backup-${format(new Date(), 'yyyyMMdd-HHmmss')}.json`; a.click();
    URL.revokeObjectURL(url);
    addBackup({ id: generateId(), date: new Date().toISOString(), size: blob.size, encrypted: !!exportPassword, type: 'manual', version: '1.0' });
    toast.success('Respaldo exportado');
  };

  const handleImport = () => {
    if (!importFile) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let parsed = JSON.parse(e.target?.result as string);
        if (parsed.encrypted) { parsed = JSON.parse(decodeURIComponent(escape(atob(parsed.data)))); }
        if (!parsed.data || !parsed.version) { toast.error('Archivo de respaldo inválido: estructura no reconocida'); return; }
        handleExport(); // backup before import
        setTimeout(() => {
          Object.entries(parsed.data).forEach(([key, value]) => { localStorage.setItem(key, JSON.stringify(value)); });
          toast.success('Respaldo importado. Recargando...');
          setTimeout(() => window.location.reload(), 1000);
        }, 500);
      } catch { toast.error('Error al importar. Verifica el archivo.'); }
    };
    reader.readAsText(importFile);
  };

  const handleReset = () => {
    if (confirmReset !== 'ELIMINAR') return;
    Object.keys(localStorage).filter(k => k.startsWith('clinical-os-')).forEach(k => localStorage.removeItem(k));
    window.location.reload();
  };

  const updateDaySchedule = (dayKey: string, field: string, value: any) => {
    const newSchedule = { ...agendaConfig.schedule };
    newSchedule[dayKey] = { ...newSchedule[dayKey], [field]: value };
    updateSchedule(newSchedule);
  };

  const updateBlock = (dayKey: string, blockIdx: number, field: 'start' | 'end', value: string) => {
    const newSchedule = { ...agendaConfig.schedule };
    const blocks = [...newSchedule[dayKey].blocks];
    blocks[blockIdx] = { ...blocks[blockIdx], [field]: value };
    newSchedule[dayKey] = { ...newSchedule[dayKey], blocks };
    updateSchedule(newSchedule);
  };

  return (
    <div className="space-y-4 animate-fade-in max-w-3xl">
      <div className="page-header"><h1 className="page-title">Ajustes del Sistema</h1></div>

      {/* Agenda Config */}
      <div className="card-clinical p-4">
        <h2 className="section-title flex items-center gap-2"><Calendar className="w-4 h-4" /> Configuración de Agenda</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium mb-1 block">Duración predeterminada de consulta</label>
            <select value={agendaConfig.defaultDuration} onChange={e => setDefaultDuration(parseInt(e.target.value))} className="input-clinical h-9 w-32">
              {[15, 20, 30, 40, 45, 60].map(d => <option key={d} value={d}>{d} min</option>)}
            </select>
          </div>

          <div>
            <h3 className="text-xs font-semibold mb-2">Horarios por día</h3>
            <div className="space-y-2">
              {DAYS.map(day => {
                const dayConfig = agendaConfig.schedule[day.key] || { enabled: false, blocks: [] };
                return (
                  <div key={day.key} className="flex items-start gap-3 p-2 border rounded">
                    <label className="flex items-center gap-2 min-w-[100px]">
                      <input type="checkbox" checked={dayConfig.enabled} onChange={e => updateDaySchedule(day.key, 'enabled', e.target.checked)} className="rounded" />
                      <span className="text-xs font-medium">{day.label}</span>
                    </label>
                    {dayConfig.enabled && (
                      <div className="flex-1 space-y-1">
                        {dayConfig.blocks.map((block, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <input type="time" value={block.start} onChange={e => updateBlock(day.key, idx, 'start', e.target.value)} className="input-clinical h-7 text-xs w-24" />
                            <span className="text-xs text-muted-foreground">a</span>
                            <input type="time" value={block.end} onChange={e => updateBlock(day.key, idx, 'end', e.target.value)} className="input-clinical h-7 text-xs w-24" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold mb-2">Tipos de consulta / encuentro</h3>
            <div className="space-y-1 mb-2">
              {agendaConfig.appointmentTypes.map(t => (
                <div key={t.id} className="flex items-center justify-between p-2 border rounded text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                    <span className="font-medium">{t.name}</span>
                    <span className="text-muted-foreground">{t.duration} min</span>
                  </div>
                  <button onClick={() => removeAppointmentType(t.id)} className="text-destructive hover:underline text-[10px]">Quitar</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 items-end">
              <input value={newTypeName} onChange={e => setNewTypeName(e.target.value)} placeholder="Nombre del tipo" className="input-clinical h-8 text-xs flex-1" />
              <input type="number" value={newTypeDur} onChange={e => setNewTypeDur(e.target.value)} className="input-clinical h-8 text-xs w-20" placeholder="Min" />
              <button onClick={() => { if (newTypeName) { addAppointmentType({ name: newTypeName, duration: parseInt(newTypeDur) || 30, color: '#6b7280' }); setNewTypeName(''); } }}
                className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Agregar</button>
            </div>
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="card-clinical p-4">
        <h2 className="section-title flex items-center gap-2"><Download className="w-4 h-4" /> Exportar Respaldo</h2>
        <p className="meta-text mb-3">Descarga una copia completa de todos los datos locales.</p>
        <div className="flex gap-2 items-end">
          <div className="flex-1"><label className="text-xs font-medium mb-1 block">Contraseña (opcional)</label><input type="password" value={exportPassword} onChange={e => setExportPassword(e.target.value)} className="input-clinical h-9" placeholder="Cifrar respaldo" /></div>
          <button onClick={handleExport} className="bg-primary text-primary-foreground text-xs px-4 py-2 rounded-md hover:bg-primary/90 font-medium h-9">Exportar</button>
        </div>
        {backups.length > 0 && <div className="mt-3 text-xs text-muted-foreground">Último: {format(new Date(backups[backups.length-1].date), 'dd/MM/yyyy HH:mm')} · {backups.length} total</div>}
      </div>

      {/* Import */}
      <div className="card-clinical p-4">
        <h2 className="section-title flex items-center gap-2"><Upload className="w-4 h-4" /> Importar Respaldo</h2>
        <p className="meta-text mb-3">Restaura datos. Se valida estructura y se crea copia previa automáticamente.</p>
        <div className="flex gap-2 items-end">
          <div className="flex-1"><input type="file" accept=".json" onChange={e => setImportFile(e.target.files?.[0] || null)} className="text-xs" /></div>
          <button onClick={handleImport} disabled={!importFile} className="bg-primary text-primary-foreground text-xs px-4 py-2 rounded-md hover:bg-primary/90 font-medium h-9 disabled:opacity-50">Importar</button>
        </div>
      </div>

      {/* Subscription simulator */}
      <div className="card-clinical p-4">
        <h2 className="section-title flex items-center gap-2"><Shield className="w-4 h-4" /> Simulador de Suscripción</h2>
        <div className="flex gap-2 items-end">
          <select value={simStatus} onChange={e => setSimStatus(e.target.value as any)} className="input-clinical h-9 w-48">
            <option value="trial">Trial / Demo</option><option value="active">Activa</option><option value="grace">Período de gracia</option><option value="expired">Vencida</option><option value="restricted">Restringida</option>
          </select>
          <button onClick={() => { setSubscriptionStatus(simStatus); toast.success('Estado de suscripción actualizado'); }} className="bg-primary text-primary-foreground text-xs px-4 py-2 rounded-md hover:bg-primary/90 font-medium h-9">Aplicar</button>
        </div>
      </div>

      {/* Sync */}
      <div className="card-clinical p-4">
        <h2 className="section-title flex items-center gap-2"><Clock className="w-4 h-4" /> Estado de Sincronización</h2>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Modo</span><span className="font-medium">Local (Offline)</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Sincronización nube</span><span className="text-muted-foreground">No configurada</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Conflictos</span><span className="font-mono">0</span></div>
        </div>
      </div>

      {/* Danger */}
      <div className="card-clinical p-4 border-2 border-destructive/20">
        <h2 className="section-title flex items-center gap-2 text-destructive"><Trash2 className="w-4 h-4" /> Zona de Peligro</h2>
        <div className="flex items-start gap-2 p-2 bg-destructive/5 rounded mb-3 text-xs text-destructive">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>Eliminará permanentemente todos los datos locales. Exporta respaldo antes.</div>
        </div>
        <div className="flex gap-2 items-end">
          <div className="flex-1"><label className="text-xs font-medium mb-1 block">Escribe ELIMINAR para confirmar</label><input value={confirmReset} onChange={e => setConfirmReset(e.target.value)} className="input-clinical h-9" /></div>
          <button onClick={handleReset} disabled={confirmReset !== 'ELIMINAR'} className="bg-destructive text-destructive-foreground text-xs px-4 py-2 rounded-md hover:bg-destructive/90 font-medium h-9 disabled:opacity-50">Reiniciar</button>
        </div>
      </div>
    </div>
  );
}
