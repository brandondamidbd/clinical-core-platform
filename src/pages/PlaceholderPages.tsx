// Placeholder pages for modules that share patterns
export function DiagnosticsPage() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header"><h1 className="page-title">Diagnósticos</h1></div>
      <div className="card-clinical p-6 text-center text-sm text-muted-foreground">
        Módulo de diagnósticos integrado al expediente clínico. Accede desde Expediente → pestaña de Diagnóstico y Tratamiento para asociar diagnósticos CIE-10 a pacientes.
      </div>
    </div>
  );
}

export function ClinicalNotesPage() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header"><h1 className="page-title">Notas Médicas</h1></div>
      <div className="card-clinical p-6 text-center text-sm text-muted-foreground">
        Las notas médicas se registran dentro del expediente clínico de cada paciente. Accede desde Expediente → Notas Médicas.
      </div>
    </div>
  );
}

export function AuxStudiesPage() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header"><h1 className="page-title">Estudios Auxiliares de Diagnóstico</h1></div>
      <div className="card-clinical p-6 text-center text-sm text-muted-foreground">
        Los estudios auxiliares se registran dentro del expediente clínico. Soporte para enlaces externos a imágenes, PDF y documentos. Preparado para carga directa de archivos en futuras versiones.
      </div>
    </div>
  );
}

export function CertificatesPage() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header"><h1 className="page-title">Certificados Médicos</h1></div>
      <div className="card-clinical p-6 text-center text-sm text-muted-foreground">
        Módulo de certificados médicos/odontológicos con datos del paciente, diagnóstico, procedimiento, días de reposo y espacios para firma digital. Preparado para generación e impresión PDF.
      </div>
    </div>
  );
}

export function ConsentPage() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header"><h1 className="page-title">Consentimientos Informados</h1></div>
      <div className="card-clinical p-6 text-center text-sm text-muted-foreground">
        Biblioteca de plantillas de consentimiento informado reutilizables. Cada consentimiento incluye procedimiento, descripción, riesgos, complicaciones, vinculación a paciente y firma digital.
      </div>
    </div>
  );
}
