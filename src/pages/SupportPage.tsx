import { HelpCircle, Database, Download, Shield, FileText } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="space-y-4 animate-fade-in max-w-3xl">
      <div className="page-header"><h1 className="page-title">Soporte y Documentación</h1></div>

      <div className="card-clinical p-4">
        <h2 className="section-title flex items-center gap-2"><Database className="w-4 h-4" /> Estado del Sistema</h2>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Almacenamiento</span><span className="font-medium">Local (navegador)</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Modo</span><span className="font-medium">Offline-first</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Sincronización nube</span><span className="text-muted-foreground">No disponible aún</span></div>
        </div>
      </div>

      <div className="card-clinical p-4">
        <h2 className="section-title flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Preguntas Frecuentes</h2>
        <div className="space-y-3">
          {[
            { q: '¿Dónde se guardan mis datos?', a: 'Todos los datos se almacenan localmente en tu navegador. No se envían a ningún servidor.' },
            { q: '¿Cómo hago un respaldo?', a: 'Ve a Ajustes → Exportar Respaldo. Puedes protegerlo con contraseña.' },
            { q: '¿Puedo usar el sistema en varios dispositivos?', a: 'Actualmente el sistema es local. En futuras versiones se habilitará sincronización en la nube.' },
            { q: '¿Qué pasa si borro el caché del navegador?', a: 'Se perderán los datos. Es importante exportar respaldos regularmente.' },
            { q: '¿Puedo restaurar un respaldo?', a: 'Sí, desde Ajustes → Importar Respaldo. El sistema crea una copia automática antes de restaurar.' },
          ].map((faq, i) => (
            <div key={i} className="text-xs">
              <div className="font-medium mb-0.5">{faq.q}</div>
              <div className="text-muted-foreground">{faq.a}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-clinical p-4">
        <h2 className="section-title flex items-center gap-2"><Shield className="w-4 h-4" /> Tips de Seguridad</h2>
        <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
          <li>Exporta respaldos regularmente, especialmente antes de limpiar el navegador.</li>
          <li>Usa contraseña al exportar si el archivo contiene información sensible.</li>
          <li>No compartas archivos de respaldo sin cifrar por canales inseguros.</li>
          <li>Cierra sesión en dispositivos compartidos (disponible en versiones futuras).</li>
        </ul>
      </div>
    </div>
  );
}
