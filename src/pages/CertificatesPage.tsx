import { useState, useMemo } from 'react';
import { useCertificateStore } from '@/stores/catalogStores';
import { usePatientStore } from '@/stores/patientStore';
import { useDoctorStore } from '@/stores/doctorStore';
import { useClinicStore } from '@/stores/clinicStore';
import { Plus, X, Printer, FileCheck, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function CertificatesPage() {
  const certificates = useCertificateStore((s) => s.certificates);
  const addCertificate = useCertificateStore((s) => s.addCertificate);
  const patients = usePatientStore((s) => s.patients).filter(p => !p.metadata.isArchived);
  const doctors = useDoctorStore((s) => s.doctors).filter(d => d.isActive);
  const clinic = useClinicStore((s) => s.clinic);

  const [showForm, setShowForm] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [form, setForm] = useState({
    patientId: '', doctorId: doctors[0]?.id || '', diagnosis: '', genericText: '',
    omitDiagnosis: false, procedure: '', restDays: 0, restFrom: '', restTo: '', place: clinic?.address || '',
  });

  const handleSubmit = () => {
    if (!form.patientId || !form.doctorId) return;
    addCertificate({
      patientId: form.patientId, doctorId: form.doctorId,
      date: format(new Date(), 'yyyy-MM-dd'), place: form.place,
      diagnosis: form.omitDiagnosis ? undefined : form.diagnosis,
      genericText: form.genericText, omitDiagnosis: form.omitDiagnosis,
      procedure: form.procedure, restDays: form.restDays,
      restFrom: form.restFrom || undefined, restTo: form.restTo || undefined,
    });
    setShowForm(false);
    setForm({ patientId: '', doctorId: doctors[0]?.id || '', diagnosis: '', genericText: '', omitDiagnosis: false, procedure: '', restDays: 0, restFrom: '', restTo: '', place: clinic?.address || '' });
  };

  const preview = previewId ? certificates.find(c => c.id === previewId) : null;
  const previewPt = preview ? patients.find(p => p.id === preview.patientId) : null;
  const previewDoc = preview ? doctors.find(d => d.id === preview.doctorId) : null;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2"><FileCheck className="w-5 h-5" /> Certificados Médicos</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90">
          <Plus className="w-3.5 h-3.5" /> Nuevo Certificado
        </button>
      </div>

      <div className="card-clinical overflow-hidden">
        <table className="w-full table-clinical text-xs">
          <thead><tr className="border-b"><th className="p-2 text-left">Folio</th><th className="p-2 text-left">Fecha</th><th className="p-2 text-left">Paciente</th><th className="p-2 text-left">Médico</th><th className="p-2 text-left">Procedimiento</th><th className="p-2 text-right">Reposo</th><th className="p-2"></th></tr></thead>
          <tbody>
            {certificates.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Sin certificados emitidos</td></tr>
            ) : [...certificates].reverse().map(c => {
              const pt = patients.find(p => p.id === c.patientId);
              const doc = doctors.find(d => d.id === c.doctorId);
              return (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="p-2 font-mono">{c.folio}</td>
                  <td className="p-2 font-mono">{c.date}</td>
                  <td className="p-2 font-medium">{pt ? `${pt.firstName} ${pt.lastName}` : '—'}</td>
                  <td className="p-2">{doc?.fullName || '—'}</td>
                  <td className="p-2 text-muted-foreground">{c.procedure || '—'}</td>
                  <td className="p-2 text-right">{c.restDays > 0 ? `${c.restDays} día(s)` : '—'}</td>
                  <td className="p-2"><button onClick={() => setPreviewId(c.id)} className="text-primary hover:underline">Ver</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Form */}
      {showForm && (
        <div className="fixed inset-0 bg-foreground/20 z-50 flex justify-end">
          <div className="w-full max-w-lg bg-card h-full overflow-auto shadow-elevated animate-slide-in p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">Nuevo Certificado Médico</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-medium mb-1 block">Paciente *</label>
                  <select value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))} className="input-clinical h-9">
                    <option value="">Seleccionar</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-medium mb-1 block">Médico *</label>
                  <select value={form.doctorId} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))} className="input-clinical h-9">
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="text-xs font-medium mb-1 block">Lugar de expedición</label>
                <input value={form.place} onChange={e => setForm(f => ({ ...f, place: e.target.value }))} className="input-clinical h-9" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.omitDiagnosis} onChange={e => setForm(f => ({ ...f, omitDiagnosis: e.target.checked }))} className="rounded" />
                <label className="text-xs">Omitir diagnóstico (a petición del paciente)</label>
              </div>
              {!form.omitDiagnosis && (
                <div><label className="text-xs font-medium mb-1 block">Diagnóstico</label>
                  <input value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} className="input-clinical h-9" />
                </div>
              )}
              <div><label className="text-xs font-medium mb-1 block">Procedimiento realizado</label>
                <textarea value={form.procedure} onChange={e => setForm(f => ({ ...f, procedure: e.target.value }))} className="input-clinical min-h-[60px] py-2" />
              </div>
              <div><label className="text-xs font-medium mb-1 block">Texto genérico / observaciones</label>
                <textarea value={form.genericText} onChange={e => setForm(f => ({ ...f, genericText: e.target.value }))} className="input-clinical min-h-[60px] py-2" placeholder="Por medio de la presente hago constar que..." />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div><label className="text-xs font-medium mb-1 block">Días de reposo</label>
                  <input type="number" value={form.restDays} onChange={e => setForm(f => ({ ...f, restDays: parseInt(e.target.value) || 0 }))} className="input-clinical h-9" min={0} />
                </div>
                <div><label className="text-xs font-medium mb-1 block">Desde</label>
                  <input type="date" value={form.restFrom} onChange={e => setForm(f => ({ ...f, restFrom: e.target.value }))} className="input-clinical h-9" />
                </div>
                <div><label className="text-xs font-medium mb-1 block">Hasta</label>
                  <input type="date" value={form.restTo} onChange={e => setForm(f => ({ ...f, restTo: e.target.value }))} className="input-clinical h-9" />
                </div>
              </div>
              <button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground text-xs py-2 rounded-md hover:bg-primary/90 font-medium">Emitir Certificado</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="fixed inset-0 bg-foreground/30 z-50 flex items-center justify-center p-4">
          <div className="bg-card max-w-2xl w-full max-h-[90vh] overflow-auto rounded-xl shadow-elevated p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-base font-bold">{clinic?.name || 'Clínica'}</h2>
                <p className="meta-text">{clinic?.address}</p>
                <p className="meta-text">{clinic?.phone}</p>
              </div>
              <button onClick={() => setPreviewId(null)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="text-center mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider">Certificado Médico</h3>
              <p className="meta-text">Folio: {preview.folio}</p>
            </div>
            <div className="text-xs space-y-3 mb-8">
              <p>{preview.place}, a {format(new Date(preview.date), 'dd/MM/yyyy')}</p>
              <p className="font-medium">A QUIEN CORRESPONDA:</p>
              {preview.genericText && <p>{preview.genericText}</p>}
              <p>
                Por medio de la presente certifico que <strong>{previewPt ? `${previewPt.firstName} ${previewPt.lastName}` : '—'}</strong>
                {!preview.omitDiagnosis && preview.diagnosis && <span> presenta el diagnóstico de: <strong>{preview.diagnosis}</strong></span>}
                {preview.procedure && <span>. Procedimiento realizado: <strong>{preview.procedure}</strong></span>}
                {preview.restDays > 0 && <span>. Se le otorgan <strong>{preview.restDays} día(s)</strong> de reposo{preview.restFrom && ` del ${preview.restFrom}`}{preview.restTo && ` al ${preview.restTo}`}</span>}
                .
              </p>
              <p>Se extiende el presente certificado para los fines que al interesado convengan.</p>
            </div>
            <div className="mt-16 flex justify-center">
              <div className="text-center text-xs"><div className="border-t w-48 pt-1">{previewDoc?.fullName}<br/><span className="text-muted-foreground">Cédula: {previewDoc?.licenseNumber}</span></div></div>
            </div>
            <div className="mt-4">
              <button onClick={() => window.print()} className="flex items-center gap-1 text-xs text-primary hover:underline"><Printer className="w-3 h-3" /> Imprimir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
