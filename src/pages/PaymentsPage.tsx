import { useState, useMemo } from 'react';
import { usePaymentStore, useTreatmentStore, useServiceStore } from '@/stores/catalogStores';
import { usePatientStore } from '@/stores/patientStore';
import { useClinicStore } from '@/stores/clinicStore';
import { useDoctorStore } from '@/stores/doctorStore';
import { Plus, X, CreditCard, Search, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PaymentsPage() {
  const payments = usePaymentStore((s) => s.payments);
  const addPayment = usePaymentStore((s) => s.addPayment);
  const allPatients = usePatientStore((s) => s.patients);
  const treatments = useTreatmentStore((s) => s.treatments);
  const updateTreatment = useTreatmentStore((s) => s.updateTreatment);
  const clinic = useClinicStore((s) => s.clinic);
  const patients = useMemo(() => allPatients.filter(p => !p.metadata.isArchived), [allPatients]);

  const [showForm, setShowForm] = useState(false);
  const [showReceipt, setShowReceipt] = useState<string | null>(null);
  const [patientId, setPatientId] = useState('');
  const [treatmentId, setTreatmentId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'cash' | 'card' | 'transfer' | 'other'>('cash');
  const [type, setType] = useState<'full' | 'partial'>('full');
  const [notes, setNotes] = useState('');

  // Filters
  const [filterPatient, setFilterPatient] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [search, setSearch] = useState('');

  const patientTreatments = treatments.filter(t => t.patientId === patientId && !['completed', 'paid', 'historical'].includes(t.status));
  const selectedTreatment = treatments.find(t => t.id === treatmentId);
  const paidForTreatment = payments.filter(p => p.treatmentId === treatmentId).reduce((s, p) => s + p.amount, 0);
  const remaining = selectedTreatment ? selectedTreatment.price - paidForTreatment : 0;

  const filtered = useMemo(() => {
    return [...payments].reverse().filter(p => {
      if (filterPatient && p.patientId !== filterPatient) return false;
      if (filterDateFrom && p.date < filterDateFrom) return false;
      if (filterDateTo && p.date > filterDateTo + 'T23:59:59') return false;
      if (search) {
        const q = search.toLowerCase();
        const pt = patients.find(pa => pa.id === p.patientId);
        const name = pt ? `${pt.firstName} ${pt.lastName}`.toLowerCase() : '';
        if (!name.includes(q) && !(p.notes || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [payments, filterPatient, filterDateFrom, filterDateTo, search, patients]);

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
  const filteredTotal = filtered.reduce((s, p) => s + p.amount, 0);

  const METHOD_LABELS: Record<string, string> = { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia', other: 'Otro' };

  const receiptPayment = showReceipt ? payments.find(p => p.id === showReceipt) : null;
  const receiptPatient = receiptPayment ? patients.find(p => p.id === receiptPayment.patientId) : null;

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

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar paciente o nota..." className="input-clinical pl-8 h-8 text-xs w-52" />
        </div>
        <select value={filterPatient} onChange={e => setFilterPatient(e.target.value)} className="input-clinical h-8 text-xs w-48">
          <option value="">Todos los pacientes</option>
          {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
        </select>
        <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} className="input-clinical h-8 text-xs w-36" title="Desde" />
        <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} className="input-clinical h-8 text-xs w-36" title="Hasta" />
        {(filterPatient || filterDateFrom || filterDateTo || search) && (
          <span className="text-[10px] text-muted-foreground">Filtrado: ${filteredTotal.toLocaleString()} en {filtered.length} pagos</span>
        )}
      </div>

      <div className="card-clinical overflow-hidden">
        <table className="w-full table-clinical text-xs">
          <thead><tr className="border-b"><th className="p-2 text-left">Fecha</th><th className="p-2 text-left">Paciente</th><th className="p-2 text-right">Monto</th><th className="p-2 text-left">Método</th><th className="p-2 text-left">Tipo</th><th className="p-2 text-left">Notas</th><th className="p-2"></th></tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Sin pagos registrados</td></tr>
            ) : filtered.map(p => {
              const pt = patients.find(pa => pa.id === p.patientId);
              return (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="p-2 font-mono">{format(new Date(p.date), 'dd/MM/yy HH:mm')}</td>
                  <td className="p-2 font-medium">{pt ? `${pt.firstName} ${pt.lastName}` : '—'}</td>
                  <td className="p-2 text-right font-mono font-semibold text-success">${p.amount.toLocaleString()}</td>
                  <td className="p-2 capitalize">{METHOD_LABELS[p.method]}</td>
                  <td className="p-2">{p.type === 'full' ? 'Total' : 'Parcial'}</td>
                  <td className="p-2 text-muted-foreground">{p.notes || '—'}</td>
                  <td className="p-2">
                    <button onClick={() => setShowReceipt(p.id)} className="text-primary hover:underline text-[10px]" title="Comprobante">
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Receipt modal */}
      {receiptPayment && receiptPatient && (
        <div className="fixed inset-0 bg-foreground/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white text-black w-full max-w-lg rounded-lg shadow-2xl overflow-auto max-h-[90vh]">
            <div className="p-6 space-y-4" id="payment-receipt">
              <div className="text-center border-b pb-3">
                {clinic?.logo && <img src={clinic.logo} alt="Logo" className="h-10 mx-auto mb-2" />}
                <h3 className="font-bold text-sm">{clinic?.name || 'Clínica'}</h3>
                <p className="text-[10px] text-gray-500">{clinic?.address}</p>
                <p className="text-[10px] text-gray-500">{clinic?.phone} · {clinic?.email}</p>
              </div>
              <h4 className="text-center font-bold text-xs uppercase tracking-wider">Comprobante de Pago</h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div><span className="text-gray-500">Paciente:</span> <strong>{receiptPatient.firstName} {receiptPatient.lastName}</strong></div>
                <div><span className="text-gray-500">Fecha:</span> {format(new Date(receiptPayment.date), "d 'de' MMMM, yyyy HH:mm", { locale: es })}</div>
                <div><span className="text-gray-500">Método:</span> {METHOD_LABELS[receiptPayment.method]}</div>
                <div><span className="text-gray-500">Tipo:</span> {receiptPayment.type === 'full' ? 'Pago Total' : 'Pago Parcial'}</div>
              </div>
              <div className="text-center py-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 text-xs">Monto</span>
                <div className="text-2xl font-bold">${receiptPayment.amount.toLocaleString()}</div>
              </div>
              {receiptPayment.notes && <p className="text-[11px]"><span className="text-gray-500">Notas:</span> {receiptPayment.notes}</p>}
              <p className="text-[9px] text-center text-gray-400 border-t pt-2">Este comprobante es informativo y no tiene validez fiscal.</p>
            </div>
            <div className="flex gap-2 p-3 border-t bg-gray-50 print:hidden">
              <button onClick={() => window.print()} className="flex-1 bg-primary text-white text-xs py-2 rounded-md hover:bg-primary/90 font-medium flex items-center justify-center gap-1.5">
                <Printer className="w-3.5 h-3.5" /> Imprimir
              </button>
              <button onClick={() => setShowReceipt(null)} className="flex-1 border text-xs py-2 rounded-md hover:bg-gray-100 font-medium">Cerrar</button>
            </div>
          </div>
        </div>
      )}

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
