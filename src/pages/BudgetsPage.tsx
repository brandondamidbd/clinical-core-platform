import { useState, useMemo } from 'react';
import { useBudgetStore, useServiceStore } from '@/stores/catalogStores';
import { usePatientStore } from '@/stores/patientStore';
import { Plus, X, Printer } from 'lucide-react';
import { generateId } from '@/stores/helpers';
import type { BudgetItem, Budget } from '@/types';
import { format, addDays } from 'date-fns';

export default function BudgetsPage() {
  const budgets = useBudgetStore((s) => s.budgets);
  const addBudget = useBudgetStore((s) => s.addBudget);
  const updateBudget = useBudgetStore((s) => s.updateBudget);
  const allPatients = usePatientStore((s) => s.patients);
  const allServices = useServiceStore((s) => s.services);
  const patients = useMemo(() => allPatients.filter(p => !p.metadata.isArchived), [allPatients]);
  const services = useMemo(() => allServices.filter(s => s.isActive), [allServices]);

  const [showForm, setShowForm] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [prospectName, setProspectName] = useState('');
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [validDays, setValidDays] = useState(30);
  const [notes, setNotes] = useState('');

  const addItem = (serviceId?: string) => {
    const svc = serviceId ? services.find(s => s.id === serviceId) : null;
    setItems(prev => [...prev, {
      id: generateId(), serviceId, description: svc?.name || '', quantity: 1, unitPrice: svc?.price || 0, total: svc?.price || 0,
    }]);
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
    addBudget({
      patientId: patientId || undefined, prospectName: prospectName || undefined,
      date: new Date().toISOString(), items, discountPercent, subtotal, discountAmount, total,
      validUntil: addDays(new Date(), validDays).toISOString(), notes, status,
    });
    setShowForm(false);
    setPatientId(''); setProspectName(''); setItems([]); setDiscountPercent(0); setNotes('');
  };

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
          <thead><tr className="border-b"><th className="p-2 text-left">Folio</th><th className="p-2 text-left">Fecha</th><th className="p-2 text-left">Paciente</th><th className="p-2 text-right">Total</th><th className="p-2 text-left">Estado</th></tr></thead>
          <tbody>
            {budgets.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Sin presupuestos</td></tr>
            ) : [...budgets].reverse().map(b => {
              const pt = patients.find(p => p.id === b.patientId);
              const statusLabels: Record<string, string> = { draft: 'Borrador', issued: 'Emitido', sent: 'Enviado', accepted: 'Aceptado', rejected: 'Rechazado', expired: 'Vencido', converted: 'Convertido' };
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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
                {items.map((item, i) => (
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
