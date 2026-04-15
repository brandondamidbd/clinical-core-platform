import { useState, useMemo } from 'react';
import { useBudgetStore, useServiceStore } from '@/stores/catalogStores';
import { usePatientStore } from '@/stores/patientStore';
import { useDoctorStore } from '@/stores/doctorStore';
import { useClinicStore } from '@/stores/clinicStore';
import { Plus, X, Printer, Eye } from 'lucide-react';
import { generateId } from '@/stores/helpers';
import type { BudgetItem, Budget } from '@/types';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

export default function BudgetsPage() {
  const budgets = useBudgetStore((s) => s.budgets);
  const addBudget = useBudgetStore((s) => s.addBudget);
  const updateBudget = useBudgetStore((s) => s.updateBudget);
  const allPatients = usePatientStore((s) => s.patients);
  const allServices = useServiceStore((s) => s.services);
  const allDoctors = useDoctorStore((s) => s.doctors);
  const clinic = useClinicStore((s) => s.clinic);
  const patients = useMemo(() => allPatients.filter(p => !p.metadata.isArchived), [allPatients]);
  const services = useMemo(() => allServices.filter(s => s.isActive), [allServices]);

  const [showForm, setShowForm] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [patientId, setPatientId] = useState('');
  const [prospectName, setProspectName] = useState('');
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [validDays, setValidDays] = useState(30);
  const [notes, setNotes] = useState('');

  const addItem = (serviceId?: string) => {
    const svc = serviceId ? services.find(s => s.id === serviceId) : null;
    setItems(prev => [...prev, { id: generateId(), serviceId, description: svc?.name || '', quantity: 1, unitPrice: svc?.price || 0, total: svc?.price || 0 }]);
  };

  const updateItem = (id: string, updates: Partial<BudgetItem>) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, ...updates };
      updated.total = updated.quantity * updated.unitPrice;
      return updated;
    }));
  };

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const total = subtotal - discountAmount;

  const handleSave = (status: Budget['status']) => {
    if (items.length === 0) return;
    addBudget({ patientId: patientId || undefined, prospectName: prospectName || undefined, date: new Date().toISOString(), items, discountPercent, subtotal, discountAmount, total, validUntil: addDays(new Date(), validDays).toISOString(), notes, status });
    setShowForm(false);
    setPatientId(''); setProspectName(''); setItems([]); setDiscountPercent(0); setNotes('');
  };

  const statusLabels: Record<string, string> = { draft: 'Borrador', issued: 'Emitido', sent: 'Enviado', accepted: 'Aceptado', rejected: 'Rechazado', expired: 'Vencido', converted: 'Convertido' };

  const previewBudget = previewId ? budgets.find(b => b.id === previewId) : null;
  const previewPatient = previewBudget?.patientId ? patients.find(p => p.id === previewBudget.patientId) : null;
  const palette = clinic?.documentPalette;
  const primaryColor = palette?.primary || '#1e40af';

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Presupuestos</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90">
          <Plus className="w-3.5 h-3.5" /> Nuevo Presupuesto
        </button>
      </div>

      <div className="card-clinical overflow-hidden">
        <table className="w-full table-clinical text-xs">
          <thead><tr className="border-b"><th className="p-2 text-left">Folio</th><th className="p-2 text-left">Fecha</th><th className="p-2 text-left">Paciente</th><th className="p-2 text-right">Total</th><th className="p-2 text-left">Estado</th><th className="p-2"></th></tr></thead>
          <tbody>
            {budgets.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Sin presupuestos</td></tr>
            ) : [...budgets].reverse().map(b => {
              const pt = patients.find(p => p.id === b.patientId);
              return (
                <tr key={b.id} className="border-b last:border-0">
                  <td className="p-2 font-mono">{b.folio}</td>
                  <td className="p-2 font-mono">{format(new Date(b.date), 'dd/MM/yyyy')}</td>
                  <td className="p-2 font-medium">{pt ? `${pt.firstName} ${pt.lastName}` : b.prospectName || '—'}</td>
                  <td className="p-2 text-right font-mono font-semibold">${b.total.toLocaleString()}</td>
                  <td className="p-2">
                    <select value={b.status} onChange={e => updateBudget(b.id, { status: e.target.value as Budget['status'] })} className="text-[10px] border rounded px-1.5 py-0.5 bg-card">
                      {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                  <td className="p-2">
                    <button onClick={() => setPreviewId(b.id)} className="text-primary hover:underline flex items-center gap-1 text-[10px]">
                      <Eye className="w-3 h-3" /> Ver
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Print preview modal */}
      {previewBudget && (
        <div className="fixed inset-0 bg-foreground/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white text-black w-full max-w-2xl rounded-lg shadow-2xl overflow-auto max-h-[90vh]">
            <div className="p-8 space-y-5" style={{ fontFamily: 'Georgia, serif' }}>
              {/* Header */}
              <div className="flex items-start justify-between border-b pb-4" style={{ borderColor: primaryColor }}>
                <div className="flex items-center gap-3">
                  {clinic?.logo && <img src={clinic.logo} alt="Logo" className="h-12" />}
                  <div>
                    <h3 className="font-bold text-base">{clinic?.name || 'Clínica'}</h3>
                    <p className="text-[10px] text-gray-500">{clinic?.address}</p>
                    <p className="text-[10px] text-gray-500">{clinic?.phone} · {clinic?.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: primaryColor + '15', color: primaryColor }}>
                    {statusLabels[previewBudget.status]}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <h4 className="font-bold text-sm uppercase tracking-widest" style={{ color: primaryColor }}>Presupuesto</h4>
                <p className="text-xs text-gray-500">Folio: {previewBudget.folio}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div><span className="text-gray-500">Paciente:</span> <strong>{previewPatient ? `${previewPatient.firstName} ${previewPatient.lastName}` : previewBudget.prospectName || '—'}</strong></div>
                <div><span className="text-gray-500">Fecha:</span> {format(new Date(previewBudget.date), "d 'de' MMMM, yyyy", { locale: es })}</div>
                <div><span className="text-gray-500">Vigencia:</span> {format(new Date(previewBudget.validUntil), "d 'de' MMMM, yyyy", { locale: es })}</div>
              </div>

              {/* Items table */}
              <table className="w-full text-[11px] border-collapse">
                <thead>
                  <tr style={{ backgroundColor: primaryColor + '10' }}>
                    <th className="text-left p-2 border-b">#</th>
                    <th className="text-left p-2 border-b">Descripción</th>
                    <th className="text-center p-2 border-b">Cant.</th>
                    <th className="text-right p-2 border-b">P. Unit.</th>
                    <th className="text-right p-2 border-b">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {previewBudget.items.map((item, i) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2">{i + 1}</td>
                      <td className="p-2">{item.description}</td>
                      <td className="p-2 text-center">{item.quantity}</td>
                      <td className="p-2 text-right font-mono">${item.unitPrice.toLocaleString()}</td>
                      <td className="p-2 text-right font-mono">${item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end">
                <div className="w-48 space-y-1 text-[11px]">
                  <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">${previewBudget.subtotal.toLocaleString()}</span></div>
                  {previewBudget.discountPercent > 0 && (
                    <div className="flex justify-between text-red-600"><span>Descuento ({previewBudget.discountPercent}%)</span><span className="font-mono">-${previewBudget.discountAmount.toLocaleString()}</span></div>
                  )}
                  <div className="flex justify-between font-bold text-sm border-t pt-1" style={{ borderColor: primaryColor }}>
                    <span>Total</span><span className="font-mono">${previewBudget.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {previewBudget.notes && <p className="text-[11px] text-gray-600"><strong>Notas:</strong> {previewBudget.notes}</p>}
              <p className="text-[9px] text-gray-400 text-center border-t pt-3">Este presupuesto tiene vigencia hasta la fecha indicada. Sujeto a cambios sin previo aviso.</p>
            </div>
            <div className="flex gap-2 p-3 border-t bg-gray-50 print:hidden">
              <button onClick={() => window.print()} className="flex-1 bg-primary text-white text-xs py-2 rounded-md hover:bg-primary/90 font-medium flex items-center justify-center gap-1.5">
                <Printer className="w-3.5 h-3.5" /> Imprimir
              </button>
              <button onClick={() => setPreviewId(null)} className="flex-1 border text-xs py-2 rounded-md hover:bg-gray-100 font-medium">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-foreground/20 z-50 flex justify-end">
          <div className="w-full max-w-lg bg-card h-full overflow-auto shadow-elevated animate-slide-in p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">Nuevo Presupuesto</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium mb-1 block">Paciente (o prospecto)</label>
                <select value={patientId} onChange={e => setPatientId(e.target.value)} className="input-clinical h-9">
                  <option value="">Prospecto externo</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                </select>
              </div>
              {!patientId && <div><label className="text-xs font-medium mb-1 block">Nombre del prospecto</label><input value={prospectName} onChange={e => setProspectName(e.target.value)} className="input-clinical h-9" /></div>}

              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold">Servicios</span>
                  <div className="flex gap-1">
                    <select onChange={e => { if (e.target.value) addItem(e.target.value); e.target.value = ''; }} className="input-clinical h-7 text-[11px] w-40">
                      <option value="">+ Del catálogo</option>
                      {services.map(s => <option key={s.id} value={s.id}>{s.name} — ${s.price}</option>)}
                    </select>
                    <button onClick={() => addItem()} className="text-xs text-primary hover:underline">+ Manual</button>
                  </div>
                </div>
                {items.map((item) => (
                  <div key={item.id} className="flex gap-1 items-center mb-1">
                    <input value={item.description} onChange={e => updateItem(item.id, { description: e.target.value })} className="input-clinical h-7 text-[11px] flex-1" placeholder="Descripción" />
                    <input type="number" value={item.quantity} onChange={e => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })} className="input-clinical h-7 text-[11px] w-12 text-center" />
                    <input type="number" value={item.unitPrice} onChange={e => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })} className="input-clinical h-7 text-[11px] w-20 text-right" />
                    <span className="text-[11px] font-mono w-20 text-right">${item.total.toLocaleString()}</span>
                    <button onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))} className="text-destructive text-[10px]">×</button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-medium mb-1 block">Descuento (%)</label><input type="number" value={discountPercent} onChange={e => setDiscountPercent(parseFloat(e.target.value) || 0)} className="input-clinical h-9" min={0} max={100} /></div>
                <div><label className="text-xs font-medium mb-1 block">Vigencia (días)</label><input type="number" value={validDays} onChange={e => setValidDays(parseInt(e.target.value) || 30)} className="input-clinical h-9" /></div>
              </div>

              <div className="bg-muted p-3 rounded-md space-y-1 text-xs">
                <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">${subtotal.toLocaleString()}</span></div>
                {discountPercent > 0 && <div className="flex justify-between text-destructive"><span>Descuento ({discountPercent}%)</span><span className="font-mono">-${discountAmount.toLocaleString()}</span></div>}
                <div className="flex justify-between font-bold text-sm border-t pt-1"><span>Total</span><span className="font-mono">${total.toLocaleString()}</span></div>
              </div>

              <div><label className="text-xs font-medium mb-1 block">Notas</label><textarea value={notes} onChange={e => setNotes(e.target.value)} className="input-clinical min-h-[50px] py-2" /></div>

              <div className="flex gap-2">
                <button onClick={() => handleSave('draft')} className="flex-1 border text-xs py-2 rounded-md hover:bg-muted font-medium">Borrador</button>
                <button onClick={() => handleSave('issued')} className="flex-1 bg-primary text-primary-foreground text-xs py-2 rounded-md hover:bg-primary/90 font-medium">Emitir</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
