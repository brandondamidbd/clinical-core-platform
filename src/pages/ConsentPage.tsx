import { useState, useMemo } from 'react';
import { useConsentStore } from '@/stores/catalogStores';
import { usePatientStore } from '@/stores/patientStore';
import { useDoctorStore } from '@/stores/doctorStore';
import { useClinicStore } from '@/stores/clinicStore';
import { Plus, X, Printer, ShieldCheck, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

export default function ConsentPage() {
  const { consents, templates, addConsent, addTemplate } = useConsentStore();
  const patients = usePatientStore((s) => s.patients).filter(p => !p.metadata.isArchived);
  const doctors = useDoctorStore((s) => s.doctors).filter(d => d.isActive);
  const clinic = useClinicStore((s) => s.clinic);

  const [tab, setTab] = useState<'consents' | 'templates'>('consents');
  const [showForm, setShowForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const [form, setForm] = useState({
    patientId: '', doctorId: doctors[0]?.id || '', templateId: '',
    procedure: '', description: '', risks: '', complications: '',
  });
  const [tplForm, setTplForm] = useState({ procedure: '', description: '', risks: '', complications: '' });

  const applyTemplate = (tplId: string) => {
    const tpl = templates.find(t => t.id === tplId);
    if (tpl) setForm(f => ({ ...f, templateId: tplId, procedure: tpl.procedure, description: tpl.description, risks: tpl.risks, complications: tpl.complications }));
  };

  const handleSubmit = () => {
    if (!form.patientId || !form.doctorId || !form.procedure) return;
    addConsent({
      patientId: form.patientId, doctorId: form.doctorId, templateId: form.templateId || undefined,
      procedure: form.procedure, description: form.description, risks: form.risks, complications: form.complications,
      date: format(new Date(), 'yyyy-MM-dd'),
    });
    setShowForm(false);
    setForm({ patientId: '', doctorId: doctors[0]?.id || '', templateId: '', procedure: '', description: '', risks: '', complications: '' });
  };

  const handleTemplateSubmit = () => {
    if (!tplForm.procedure) return;
    addTemplate(tplForm);
    setShowTemplateForm(false);
    setTplForm({ procedure: '', description: '', risks: '', complications: '' });
  };

  const preview = previewId ? consents.find(c => c.id === previewId) : null;
  const previewPt = preview ? patients.find(p => p.id === preview.patientId) : null;
  const previewDoc = preview ? doctors.find(d => d.id === preview.doctorId) : null;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Consentimientos Informados</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowTemplateForm(true)} className="flex items-center gap-1.5 border text-xs px-3 py-1.5 rounded-md hover:bg-muted">
            <BookOpen className="w-3.5 h-3.5" /> Nueva Plantilla
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90">
            <Plus className="w-3.5 h-3.5" /> Nuevo Consentimiento
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-md border text-xs w-fit">
        <button onClick={() => setTab('consents')} className={`px-3 py-1.5 ${tab === 'consents' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>Consentimientos ({consents.length})</button>
        <button onClick={() => setTab('templates')} className={`px-3 py-1.5 ${tab === 'templates' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>Plantillas ({templates.length})</button>
      </div>

      {tab === 'consents' && (
        <div className="card-clinical overflow-hidden">
          <table className="w-full table-clinical text-xs">
            <thead><tr className="border-b"><th className="p-2 text-left">Fecha</th><th className="p-2 text-left">Paciente</th><th className="p-2 text-left">Procedimiento</th><th className="p-2 text-left">Médico</th><th className="p-2"></th></tr></thead>
            <tbody>
              {consents.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Sin consentimientos</td></tr>
              ) : [...consents].reverse().map(c => {
                const pt = patients.find(p => p.id === c.patientId);
                const doc = doctors.find(d => d.id === c.doctorId);
                return (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="p-2 font-mono">{c.date}</td>
                    <td className="p-2 font-medium">{pt ? `${pt.firstName} ${pt.lastName}` : '—'}</td>
                    <td className="p-2">{c.procedure}</td>
                    <td className="p-2 text-muted-foreground">{doc?.fullName || '—'}</td>
                    <td className="p-2"><button onClick={() => setPreviewId(c.id)} className="text-primary hover:underline">Ver</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'templates' && (
        <div className="grid md:grid-cols-2 gap-3">
          {templates.length === 0 ? (
            <div className="card-clinical p-8 text-center text-muted-foreground text-sm col-span-2">Sin plantillas. Crea una para reutilizar en consentimientos futuros.</div>
          ) : templates.map(t => (
            <div key={t.id} className="card-clinical p-4">
              <h3 className="text-sm font-semibold mb-1">{t.procedure}</h3>
              <p className="text-xs text-muted-foreground mb-2">{t.description.slice(0, 100)}{t.description.length > 100 ? '...' : ''}</p>
              <div className="text-[10px] text-muted-foreground">Riesgos: {t.risks.slice(0, 60)}...</div>
            </div>
          ))}
        </div>
      )}

      {/* Consent form */}
      {showForm && (
        <div className="fixed inset-0 bg-foreground/20 z-50 flex justify-end">
          <div className="w-full max-w-lg bg-card h-full overflow-auto shadow-elevated animate-slide-in p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">Nuevo Consentimiento Informado</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-medium mb-1 block">Paciente *</label>
                  <select value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))} className="input-clinical h-9">
                    <option value="">Seleccionar</option>{patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-medium mb-1 block">Médico *</label>
                  <select value={form.doctorId} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))} className="input-clinical h-9">
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                  </select>
                </div>
              </div>
              {templates.length > 0 && (
                <div><label className="text-xs font-medium mb-1 block">Aplicar plantilla</label>
                  <select onChange={e => applyTemplate(e.target.value)} className="input-clinical h-9">
                    <option value="">— Sin plantilla —</option>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.procedure}</option>)}
                  </select>
                </div>
              )}
              <div><label className="text-xs font-medium mb-1 block">Procedimiento *</label>
                <input value={form.procedure} onChange={e => setForm(f => ({ ...f, procedure: e.target.value }))} className="input-clinical h-9" />
              </div>
              <div><label className="text-xs font-medium mb-1 block">Descripción del procedimiento</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-clinical min-h-[80px] py-2" />
              </div>
              <div><label className="text-xs font-medium mb-1 block">Riesgos</label>
                <textarea value={form.risks} onChange={e => setForm(f => ({ ...f, risks: e.target.value }))} className="input-clinical min-h-[60px] py-2" />
              </div>
              <div><label className="text-xs font-medium mb-1 block">Complicaciones posibles</label>
                <textarea value={form.complications} onChange={e => setForm(f => ({ ...f, complications: e.target.value }))} className="input-clinical min-h-[60px] py-2" />
              </div>
              <button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground text-xs py-2 rounded-md hover:bg-primary/90 font-medium">Emitir Consentimiento</button>
            </div>
          </div>
        </div>
      )}

      {/* Template form */}
      {showTemplateForm && (
        <div className="fixed inset-0 bg-foreground/20 z-50 flex justify-end">
          <div className="w-full max-w-md bg-card h-full overflow-auto shadow-elevated animate-slide-in p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">Nueva Plantilla</h2>
              <button onClick={() => setShowTemplateForm(false)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium mb-1 block">Procedimiento *</label><input value={tplForm.procedure} onChange={e => setTplForm(f => ({ ...f, procedure: e.target.value }))} className="input-clinical h-9" /></div>
              <div><label className="text-xs font-medium mb-1 block">Descripción</label><textarea value={tplForm.description} onChange={e => setTplForm(f => ({ ...f, description: e.target.value }))} className="input-clinical min-h-[80px] py-2" /></div>
              <div><label className="text-xs font-medium mb-1 block">Riesgos</label><textarea value={tplForm.risks} onChange={e => setTplForm(f => ({ ...f, risks: e.target.value }))} className="input-clinical min-h-[60px] py-2" /></div>
              <div><label className="text-xs font-medium mb-1 block">Complicaciones</label><textarea value={tplForm.complications} onChange={e => setTplForm(f => ({ ...f, complications: e.target.value }))} className="input-clinical min-h-[60px] py-2" /></div>
              <button onClick={handleTemplateSubmit} className="w-full bg-primary text-primary-foreground text-xs py-2 rounded-md hover:bg-primary/90 font-medium">Guardar Plantilla</button>
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
              </div>
              <button onClick={() => setPreviewId(null)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="text-center mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider">Consentimiento Informado</h3>
            </div>
            <div className="text-xs space-y-3 mb-6">
              <p>Fecha: {preview.date}</p>
              <p>Yo, <strong>{previewPt ? `${previewPt.firstName} ${previewPt.lastName}` : '—'}</strong>, manifiesto que he sido informado(a) de manera clara y comprensible sobre el siguiente procedimiento:</p>
              <p><strong>Procedimiento:</strong> {preview.procedure}</p>
              {preview.description && <p><strong>Descripción:</strong> {preview.description}</p>}
              {preview.risks && <p><strong>Riesgos:</strong> {preview.risks}</p>}
              {preview.complications && <p><strong>Complicaciones posibles:</strong> {preview.complications}</p>}
              <p>Declaro que he comprendido la información proporcionada, he podido formular preguntas y he recibido respuestas satisfactorias. Otorgo mi consentimiento para la realización del procedimiento descrito.</p>
            </div>
            <div className="mt-12 flex justify-between text-xs">
              <div className="text-center"><div className="border-t w-48 pt-1">Firma del paciente / responsable</div></div>
              <div className="text-center"><div className="border-t w-48 pt-1">{previewDoc?.fullName}<br/><span className="text-muted-foreground">Cédula: {previewDoc?.licenseNumber}</span></div></div>
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
