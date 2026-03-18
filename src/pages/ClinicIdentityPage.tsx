import { useState } from 'react';
import { useClinicStore } from '@/stores/clinicStore';
import { Save, Image, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function ClinicIdentityPage() {
  const clinic = useClinicStore(s => s.clinic);
  const updateClinic = useClinicStore(s => s.updateClinic);
  const [name, setName] = useState(clinic?.name || '');
  const [address, setAddress] = useState(clinic?.address || '');
  const [phone, setPhone] = useState(clinic?.phone || '');
  const [email, setEmail] = useState(clinic?.email || '');
  const [fiscalAddress, setFiscalAddress] = useState(clinic?.fiscalAddress || '');
  const [logo, setLogo] = useState(clinic?.logo || '');
  const [secondaryLogo, setSecondaryLogo] = useState(clinic?.secondaryLogo || '');
  const [palette, setPalette] = useState(clinic?.documentPalette || { primary: '#1e40af', secondary: '#374151', accent: '#059669' });
  const [showPreview, setShowPreview] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'primary' | 'secondary') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { toast.error('El logo no debe exceder 500KB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result as string;
      if (type === 'primary') setLogo(data);
      else setSecondaryLogo(data);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateClinic({ name, address, phone, email, fiscalAddress, logo: logo || undefined, secondaryLogo: secondaryLogo || undefined, documentPalette: palette });
    toast.success('Identidad clínica guardada');
  };

  return (
    <div className="space-y-4 animate-fade-in max-w-3xl">
      <div className="page-header">
        <h1 className="page-title">Identidad del Consultorio</h1>
        <button onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-1.5 border text-xs px-3 py-1.5 rounded-md hover:bg-muted">
          <Eye className="w-3.5 h-3.5" /> Vista previa documental
        </button>
      </div>

      <div className="card-clinical p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className="text-xs font-medium mb-1 block">Nombre de la clínica</label><input value={name} onChange={e => setName(e.target.value)} className="input-clinical h-9" /></div>
          <div className="col-span-2"><label className="text-xs font-medium mb-1 block">Dirección del consultorio</label><input value={address} onChange={e => setAddress(e.target.value)} className="input-clinical h-9" /></div>
          <div className="col-span-2"><label className="text-xs font-medium mb-1 block">Dirección fiscal</label><input value={fiscalAddress} onChange={e => setFiscalAddress(e.target.value)} className="input-clinical h-9" /></div>
          <div><label className="text-xs font-medium mb-1 block">Teléfono</label><input value={phone} onChange={e => setPhone(e.target.value)} className="input-clinical h-9" /></div>
          <div><label className="text-xs font-medium mb-1 block">Correo</label><input value={email} onChange={e => setEmail(e.target.value)} className="input-clinical h-9" /></div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-xs font-semibold mb-3">Logotipos</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Logo principal</label>
              <div className="border rounded-md p-3 text-center">
                {logo ? <img src={logo} alt="Logo" className="max-h-16 mx-auto mb-2 object-contain" /> : <Image className="w-8 h-8 mx-auto text-muted-foreground mb-2" />}
                <input type="file" accept="image/*" onChange={e => handleLogoUpload(e, 'primary')} className="text-[10px] w-full" />
                {logo && <button onClick={() => setLogo('')} className="text-[10px] text-destructive hover:underline mt-1">Eliminar</button>}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Logo secundario / institucional</label>
              <div className="border rounded-md p-3 text-center">
                {secondaryLogo ? <img src={secondaryLogo} alt="Logo" className="max-h-16 mx-auto mb-2 object-contain" /> : <Image className="w-8 h-8 mx-auto text-muted-foreground mb-2" />}
                <input type="file" accept="image/*" onChange={e => handleLogoUpload(e, 'secondary')} className="text-[10px] w-full" />
                {secondaryLogo && <button onClick={() => setSecondaryLogo('')} className="text-[10px] text-destructive hover:underline mt-1">Eliminar</button>}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-xs font-semibold mb-3">Paleta Documental</h3>
          <p className="meta-text mb-2">Colores utilizados en recetas, certificados y presupuestos.</p>
          <div className="flex gap-4">
            {[
              { label: 'Primario', key: 'primary' },
              { label: 'Secundario', key: 'secondary' },
              { label: 'Acento', key: 'accent' },
            ].map(c => (
              <div key={c.key} className="flex items-center gap-2">
                <input type="color" value={(palette as any)[c.key]} onChange={e => setPalette(p => ({ ...p, [c.key]: e.target.value }))} className="w-8 h-8 rounded cursor-pointer border-0" />
                <span className="text-xs text-muted-foreground">{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSave} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-4 py-2 rounded-md hover:bg-primary/90 font-medium">
          <Save className="w-3.5 h-3.5" /> Guardar Cambios
        </button>
      </div>

      {/* Document Preview */}
      {showPreview && (
        <div className="card-clinical p-6">
          <h3 className="text-xs font-semibold mb-4">Vista previa de encabezado documental</h3>
          <div className="border rounded-lg p-6 bg-card max-w-xl mx-auto">
            <div className="flex items-start justify-between mb-4 pb-3" style={{ borderBottom: `2px solid ${palette.primary}` }}>
              <div className="flex items-center gap-3">
                {logo && <img src={logo} alt="Logo" className="h-12 object-contain" />}
                <div>
                  <h2 className="text-sm font-bold" style={{ color: palette.primary }}>{name || 'Nombre de la Clínica'}</h2>
                  <p className="text-[10px] text-muted-foreground">{address || 'Dirección'}</p>
                  <p className="text-[10px] text-muted-foreground">{phone} · {email}</p>
                </div>
              </div>
              {secondaryLogo && <img src={secondaryLogo} alt="Logo 2" className="h-10 object-contain" />}
            </div>
            <div className="text-center py-4">
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: palette.secondary }}>Receta Médica</h3>
              <p className="text-[10px] text-muted-foreground">Folio: RX-00001</p>
            </div>
            <div className="text-[10px] text-muted-foreground space-y-1">
              <p>Paciente: <span className="font-medium text-foreground">Nombre del Paciente</span></p>
              <p>Fecha: <span className="font-mono">dd/mm/aaaa</span></p>
              <p className="pt-2">Diagnóstico: <span className="text-foreground">Ejemplo de diagnóstico</span></p>
            </div>
            <div className="mt-6 pt-4 border-t text-center">
              <div className="border-t w-40 mx-auto pt-1 text-[10px]">
                <span className="text-muted-foreground">Firma del médico</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
