import { useState } from 'react';
import { useClinicStore } from '@/stores/clinicStore';
import { Building2, Save } from 'lucide-react';

export default function ClinicIdentityPage() {
  const clinic = useClinicStore(s => s.clinic);
  const updateClinic = useClinicStore(s => s.updateClinic);
  const [name, setName] = useState(clinic?.name || '');
  const [address, setAddress] = useState(clinic?.address || '');
  const [phone, setPhone] = useState(clinic?.phone || '');
  const [email, setEmail] = useState(clinic?.email || '');
  const [fiscalAddress, setFiscalAddress] = useState(clinic?.fiscalAddress || '');

  const handleSave = () => { updateClinic({ name, address, phone, email, fiscalAddress }); };

  return (
    <div className="space-y-4 animate-fade-in max-w-2xl">
      <div className="page-header"><h1 className="page-title">Identidad del Consultorio</h1></div>
      <div className="card-clinical p-4 space-y-3">
        <div><label className="text-xs font-medium mb-1 block">Nombre de la clínica</label><input value={name} onChange={e => setName(e.target.value)} className="input-clinical h-9" /></div>
        <div><label className="text-xs font-medium mb-1 block">Dirección del consultorio</label><input value={address} onChange={e => setAddress(e.target.value)} className="input-clinical h-9" /></div>
        <div><label className="text-xs font-medium mb-1 block">Dirección fiscal</label><input value={fiscalAddress} onChange={e => setFiscalAddress(e.target.value)} className="input-clinical h-9" /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-xs font-medium mb-1 block">Teléfono</label><input value={phone} onChange={e => setPhone(e.target.value)} className="input-clinical h-9" /></div>
          <div><label className="text-xs font-medium mb-1 block">Correo</label><input value={email} onChange={e => setEmail(e.target.value)} className="input-clinical h-9" /></div>
        </div>
        <p className="meta-text">Los datos de identidad se utilizan en recetas, certificados y presupuestos.</p>
        <button onClick={handleSave} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-4 py-2 rounded-md hover:bg-primary/90 font-medium">
          <Save className="w-3.5 h-3.5" /> Guardar Cambios
        </button>
      </div>
    </div>
  );
}
