import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientStore } from '@/stores/patientStore';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { usePrescriptionStore, useBudgetStore, useCertificateStore } from '@/stores/catalogStores';
import { useDoctorStore } from '@/stores/doctorStore';
import { Search, User, Calendar, FileText, Receipt, X } from 'lucide-react';
import { format } from 'date-fns';

interface SearchResult {
  id: string;
  type: 'patient' | 'appointment' | 'prescription' | 'budget' | 'certificate';
  title: string;
  subtitle: string;
  route: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const patients = usePatientStore(s => s.patients);
  const appointments = useAppointmentStore(s => s.appointments);
  const prescriptions = usePrescriptionStore(s => s.prescriptions);
  const budgets = useBudgetStore(s => s.budgets);
  const certificates = useCertificateStore(s => s.certificates);
  const doctors = useDoctorStore(s => s.doctors);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') { setOpen(false); setQuery(''); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const results = useMemo<SearchResult[]>(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    const res: SearchResult[] = [];

    patients.filter(p => !p.metadata.isArchived).forEach(p => {
      const name = `${p.firstName} ${p.lastName}`;
      if (name.toLowerCase().includes(q) || p.phone.includes(q) || p.email?.toLowerCase().includes(q)) {
        res.push({ id: p.id, type: 'patient', title: name, subtitle: `${p.phone}${p.email ? ` · ${p.email}` : ''}`, route: `/pacientes/${p.id}` });
      }
    });

    appointments.forEach(a => {
      const pt = patients.find(p => p.id === a.patientId);
      const name = pt ? `${pt.firstName} ${pt.lastName}` : '';
      if (name.toLowerCase().includes(q) || a.reason.toLowerCase().includes(q)) {
        res.push({ id: a.id, type: 'appointment', title: `${name} — ${a.reason}`, subtitle: `${a.date} ${a.startTime}`, route: '/agenda' });
      }
    });

    prescriptions.forEach(rx => {
      if (rx.folio.toLowerCase().includes(q)) {
        const pt = patients.find(p => p.id === rx.patientId);
        res.push({ id: rx.id, type: 'prescription', title: `Receta ${rx.folio}`, subtitle: pt ? `${pt.firstName} ${pt.lastName}` : '', route: '/recetas' });
      }
    });

    budgets.forEach(b => {
      if (b.folio.toLowerCase().includes(q)) {
        const pt = patients.find(p => p.id === b.patientId);
        res.push({ id: b.id, type: 'budget', title: `Presupuesto ${b.folio}`, subtitle: pt ? `${pt.firstName} ${pt.lastName}` : b.prospectName || '', route: '/presupuestos' });
      }
    });

    certificates.forEach(c => {
      if (c.folio.toLowerCase().includes(q)) {
        const pt = patients.find(p => p.id === c.patientId);
        res.push({ id: c.id, type: 'certificate', title: `Certificado ${c.folio}`, subtitle: pt ? `${pt.firstName} ${pt.lastName}` : '', route: '/certificados' });
      }
    });

    return res.slice(0, 12);
  }, [query, patients, appointments, prescriptions, budgets, certificates]);

  const icons: Record<string, React.ElementType> = { patient: User, appointment: Calendar, prescription: FileText, budget: Receipt, certificate: FileText };

  const handleSelect = (r: SearchResult) => {
    navigate(r.route);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); if (!open) setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar paciente, cita, folio... (Ctrl+K)"
          className="input-clinical pl-8 w-72 h-8 text-xs"
        />
        {query && (
          <button onClick={() => { setQuery(''); inputRef.current?.focus(); }} className="absolute right-2 top-1/2 -translate-y-1/2">
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        )}
      </div>

      {open && query.length >= 2 && (
        <div className="absolute top-full mt-1 left-0 w-96 bg-popover border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto animate-fade-in">
          {results.length === 0 ? (
            <p className="text-xs text-muted-foreground p-4 text-center">Sin resultados para "{query}"</p>
          ) : (
            results.map(r => {
              const Icon = icons[r.type] || FileText;
              return (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => handleSelect(r)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted text-left border-b last:border-0 transition-colors"
                >
                  <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium truncate">{r.title}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{r.subtitle}</div>
                  </div>
                  <span className="text-[9px] text-muted-foreground capitalize bg-muted px-1.5 py-0.5 rounded flex-shrink-0">
                    {r.type === 'patient' ? 'Paciente' : r.type === 'appointment' ? 'Cita' : r.type === 'prescription' ? 'Receta' : r.type === 'budget' ? 'Presupuesto' : 'Certificado'}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
