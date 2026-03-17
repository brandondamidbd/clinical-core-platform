import { useState } from 'react';
import { usePaymentStore, useTreatmentStore, useServiceStore } from '@/stores/catalogStores';
import { usePatientStore } from '@/stores/patientStore';
import { Plus, X, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

export default function PaymentsPage() {
  const payments = usePaymentStore((s) => s.payments);
  const addPayment = usePaymentStore((s) => s.addPayment);
  const patients = usePatientStore((s) => s.patients.filter(p => !p.metadata.isArchived));
  const treatments = useTreatmentStore((s) => s.treatments);
  const updateTreatment = useTreatmentStore((s) => s.updateTreatment);
  const services = useServiceStore((s) => s.services);

  const [showForm, setShowForm] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [treatmentId, setTreatmentId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'cash' | 'card' | 'transfer' | 'other'>('cash');
  const [type, setType] = useState<'full' | 'partial'>('full');
  const [notes, setNotes] = useState('');
  const [manualService, setManualService] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [discount, setDiscount] = useState('0');

  const patientTreatments = treatments.filter(t => t.patientId === patientId && !['completed', 'paid', 'historical'].includes(t.status));
  const selectedTreatment = treatments.find(t => t.id === treatmentId);
  const paidForTreatment = payments.filter(p => p.treatmentId === treatmentId).reduce((s, p) => s + p.amount, 0);
  const remaining = selectedTreatment ? selectedTreatment.price - paidForTreatment : 0;

  const handleSubmit = () => {
    const payAmount = parseFloat(amount);
    if (!patientId || !payAmount) return;
    addPayment({ patientId, treatmentId: treatmentId || undefined, amount: payAmount, method, type, notes, date: new Date().toISOString() });
    if (treatmentId && selectedTreatment && payAmount >= remaining) {
      updateTreatment(treatmentId, { status: 'paid' });
    }
    setShowForm(false);
    setPatientId(''); setTreatmentId(''); setAmount(''); setNotes('');
  };

  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pagos</h1>
          <p className="meta-text">Total cobrado: <span className="font-semibold text-success">${totalCollected.toLocaleString()}</span></p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90">
          <Plus className="w-3.5 h-3.5" /> Recibir Pago
        </button>
      </div>

      <div className="card-clinical overflow-hidden">
        <table className="w-full table-clinical text-xs">
          <thead><tr className="border-b"><th className="p-2 text-left">Fecha</th><th className="p-2 text-left">Paciente</th><th className="p-2 text-right">Monto</th><th className="p-2 text-left">Método</th><th className="p-2 text-left">Tipo</th><th className="p-2 text-left">Notas</th></tr></thead>
          <tbody>
            {payments.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Sin pagos registrados</td></tr>
            ) : [...payments].reverse().map(p => {
              const pt = patients.find(pa => pa.id === p.patientId);
              return (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="p-2 font-mono">{format(new Date(p.date), 'dd/MM/yy HH:mm')}</td>
                  <td className="p-2 font-medium">{pt ? `${pt.firstName} ${pt.lastName}` : '—'}</td>
                  <td className="p-2 text-right font-mono font-semibold text-success">${p.amount.toLocaleString()}</td>
                  <td className="p-2 capitalize">{p.method === 'cash' ? 'Efectivo' : p.method === 'card' ? 'Tarjeta' : p.method === 'transfer' ? 'Transferencia' : 'Otro'}</td>
                  <td className="p-2">{p.type === 'full' ? 'Total' : 'Parcial'}</td>
                  <td className="p-2 text-muted-foreground">{p.notes || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-foreground/20 z-50 flex justify-end">
          <div className="w-full max-w-md bg-card h-full overflow-auto shadow-elevated animate-slide-in p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">Recibir Pago</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium mb-1 block">Paciente *</label>
                <select value={patientId} onChange={e => { setPatientId(e.target.value); setTreatmentId(''); }} className="input-clinical h-9">
                  <option value="">Seleccionar</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                </select>
              </div>
              {patientId && patientTreatments.length > 0 && (
                <div><label className="text-xs font-medium mb-1 block">Tratamiento pendiente</label>
                  <select value={treatmentId} onChange={e => { setTreatmentId(e.target.value); const t = treatments.find(t => t.id === e.target.value); if (t) setAmount(String(t.price - payments.filter(p => p.treatmentId === t.id).reduce((s, p) => s + p.amount, 0))); }} className="input-clinical h-9">
                    <option value="">Pago manual</option>
                    {patientTreatments.map(t => <option key={t.id} value={t.id}>{t.description} — ${t.price.toLocaleString()}</option>)}
                  </select>
                </div>
              )}
              {selectedTreatment && (
                <div className="text-xs p-2 bg-muted rounded space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-mono">${selectedTreatment.price.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Pagado</span><span className="font-mono">${paidForTreatment.toLocaleString()}</span></div>
                  <div className="flex justify-between font-semibold"><span>Saldo</span><span className="font-mono">${remaining.toLocaleString()}</span></div>
                </div>
              )}
              <div><label className="text-xs font-medium mb-1 block">Monto a cobrar *</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="input-clinical h-9" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-medium mb-1 block">Método</label>
                  <select value={method} onChange={e => setMethod(e.target.value as any)} className="input-clinical h-9">
                    <option value="cash">Efectivo</option><option value="card">Tarjeta</option><option value="transfer">Transferencia</option><option value="other">Otro</option>
                  </select>
                </div>
                <div><label className="text-xs font-medium mb-1 block">Tipo</label>
                  <select value={type} onChange={e => setType(e.target.value as any)} className="input-clinical h-9">
                    <option value="full">Total</option><option value="partial">Parcial</option>
                  </select>
                </div>
              </div>
              <div><label className="text-xs font-medium mb-1 block">Notas</label><input value={notes} onChange={e => setNotes(e.target.value)} className="input-clinical h-9" /></div>
              <button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground text-xs py-2 rounded-md hover:bg-primary/90 font-medium flex items-center justify-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Procesar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
