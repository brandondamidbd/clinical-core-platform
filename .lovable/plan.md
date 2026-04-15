

# REPORTE ULTRA-DETALLADO — CLINICAL OS
## Estado completo del sistema al 14 de abril 2026

---

## ARQUITECTURA GENERAL

- **Framework**: React 18 + Vite 5 + TypeScript 5 + Tailwind CSS v3
- **Estado global**: 14 stores Zustand con middleware `persist` (localStorage)
- **Routing**: React Router v6, 23 rutas dentro de `AppLayout`
- **Multi-tenancy**: todos los tipos incluyen `clinicId` y `organizationId`
- **Autenticacion**: Ninguna. Acceso directo. Onboarding wizard al primer ingreso
- **Backend**: Ninguno. Todo local en navegador

### Stores persistidos (localStorage keys):
1. `clinical-os-clinic` — clinica, suscripcion, onboarding, backups
2. `clinical-os-role` — rol activo del usuario
3. `clinical-os-sidebar` — estado pinned/collapsed del sidebar
4. `clinical-os-doctors` — medicos
5. `clinical-os-patients` — pacientes
6. `clinical-os-appointments` — citas
7. `clinical-os-services` — servicios
8. `clinical-os-medications` — medicamentos
9. `clinical-os-payments` — pagos
10. `clinical-os-budgets` — presupuestos
11. `clinical-os-prescriptions` — recetas
12. `clinical-os-certificates` — certificados
13. `clinical-os-consents` — consentimientos + plantillas
14. `clinical-os-odontogram` — hallazgos odontograma
15. `clinical-os-medical-records` — expedientes
16. `clinical-os-treatments` — tratamientos
17. `clinical-os-users` — usuarios
18. `clinical-os-agenda-config` — configuracion de agenda

---

## PROCESO DE INICIO / ONBOARDING

### Flujo de entrada:
1. App carga → verifica `onboarding.completed` en clinicStore
2. Si `false` → muestra `OnboardingWizard` (pantalla completa, sin sidebar)
3. Si `true` → muestra `AppLayout` con sidebar + rutas

### OnboardingWizard — 5 pasos:

| Paso | ID | Campos/Acciones |
|------|----|-----------------|
| 1 | clinicIdentity | Nombre clinica, Direccion, Telefono, Correo. Boton "Guardar" |
| 2 | primaryDoctor | Texto informativo: "Registra tu primer medico desde el modulo de Medicos" + Boton "Continuar" |
| 3 | services | Texto informativo: "Configura tus servicios desde el catalogo" + Boton "Continuar" |
| 4 | schedule | Texto informativo: "Define horarios desde Ajustes" + Boton "Continuar" |
| 5 | users | Texto informativo: "Agrega usuarios desde Usuarios y Permisos" + Boton "Completar" |

**Boton "Cargar Demo y Omitir"**: disponible en todos los pasos, ejecuta `seedDemoData` + `seedDemoAppointments`, marca onboarding como completado y entra al sistema con datos de ejemplo.

**Observaciones**: Los pasos 2-5 no tienen formularios reales, solo texto guia. Solo el paso 1 captura datos.

---

## HEADER (Barra superior)

### Elementos de izquierda a derecha:
1. **Buscador global**: campo de texto con placeholder "Buscar paciente, cita, folio... (Ctrl+K)" — NO FUNCIONAL, es solo visual
2. **Badge de suscripcion**: muestra estado (Trial, Gracia, Restringida, Vencida) segun `subscription.status`
3. **Campana de notificaciones**: icono con punto rojo — NO FUNCIONAL, es solo visual
4. **Selector de rol**: dropdown con 7 roles

### Selector de rol — opciones:

| Rol | Iniciales | Label |
|-----|-----------|-------|
| admin | AD | Administrador |
| doctor | DR | Doctor |
| receptionist | RC | Recepcionista |
| assistant | AS | Asistente |
| billing | CJ | Caja / Contabilidad |
| readonly | SL | Solo Lectura |
| demo | DM | Demo (Admin) |

Muestra nombre de clinica debajo del label. El cambio de rol se persiste en localStorage pero **NO afecta** navegacion ni visibilidad de modulos en esta fase.

---

## SIDEBAR — Navegacion principal

### Comportamiento:
- **Pinable**: boton pin/unpin en header del sidebar
- **Colapsable**: cuando no pinado, se contrae a 56px de ancho y se expande al hover
- **Secciones colapsables**: cada seccion tiene chevron para plegar/desplegar, estado persistido
- **Store**: `useSidebarStore` (Zustand + persist)

### Estructura completa (5 secciones, 22 items):

```text
OPERATIVA
  ├── Inicio (/)                    [LayoutDashboard]
  ├── Nueva Consulta (/consulta)    [PlusCircle] [HIGHLIGHT: fondo primario]
  ├── Agenda (/agenda)              [Calendar]
  └── Pacientes (/pacientes)        [Users]

CLINICA
  ├── Expediente (/expediente)      [FileText]
  ├── Odontograma (/odontograma)    [CircleDot]
  ├── Diagnosticos (/diagnosticos)  [Stethoscope]
  ├── Tratamientos (/tratamientos)  [Activity]
  ├── Notas Medicas (/notas)        [ClipboardList]
  └── Estudios Aux. (/estudios)     [FlaskConical]

DOCUMENTOS
  ├── Recetas (/recetas)            [Pill]
  ├── Certificados (/certificados)  [FileCheck]
  ├── Consentimientos (/consentimientos) [ShieldCheck]
  └── Presupuestos (/presupuestos)  [Receipt]

ADMINISTRATIVA
  ├── Pagos (/pagos)                [CreditCard]
  ├── Medicos (/medicos)            [UserCog]
  ├── Servicios (/servicios)        [ScrollText]
  └── Medicamentos (/medicamentos)  [Pill]

CONFIGURACION
  ├── Identidad Clinica (/identidad) [Building2]
  ├── Usuarios y Permisos (/usuarios) [Users]
  ├── Ajustes (/ajustes)            [Settings]
  └── Soporte (/soporte)            [HelpCircle]
```

---

## 1. INICIO — Dashboard (/)

### Contenido visible:
- **Header**: titulo "Resumen de Operacion Diaria", fecha en espanol, nombre clinica, badge plan
- **Alertas**: onboarding incompleto, sin respaldos, sin medicos (condicionales)
- **4 Stats con link**: Citas Hoy → /agenda, Pacientes → /pacientes, Tratamientos Pend. → /tratamientos, Cobrado Total → /pagos
- **Citas de Hoy**: max 5, con hora, nombre, motivo, estado (badge color), link "Ver agenda"
- **Accesos Rapidos**: 4 botones — Nueva Consulta, Nueva Cita, Nuevo Paciente, Recibir Pago
- **Pacientes Recientes**: max 4 con link a detalle
- **Estado Local**: Modo (Local Offline), ultimo respaldo, cambios sin respaldar
- **Limites del Plan**: Medicos X/Y, Usuarios X/Y, Sucursales X/Y
- **Licencia/Suscripcion**: Plan, Estado, Vencimiento

### Problemas detectados:
- Pacientes recientes se ordenan por posicion en array, no por actividad real
- No hay acceso rapido a "Nuevo Medico" ni "Nuevo Servicio"

---

## 2. NUEVA CONSULTA (/consulta)

### Fase 1 — Seleccion de paciente (pantalla completa):
- **Busqueda**: campo de texto, filtra por nombre o telefono
- **Lista**: max 8 pacientes sin busqueda, muestra nombre, telefono, email, edad, sexo, alergias
- **Crear paciente rapido**: panel expandible con Nombre*, Apellidos*, Telefono*, Fecha nac, Sexo [M/F/Otro]
- **Selector de medico**: solo aparece si hay >1 doctor activo. Select con nombre+especialidad
- **Parametros precargados**: acepta `?patientId=` y `?appointmentId=` desde URL

### Fase 2 — Flujo guiado con 7 pasos (sidebar izquierdo):

| Paso | Campos | Acciones |
|------|--------|----------|
| **Signos Vitales** | Peso (kg), Talla (cm), FC (lpm), FR (rpm), PA Sistolica, PA Diastolica, Temp (°C), SpO2 (%). **IMC calculado automaticamente** con categoria (Bajo peso/Normal/Sobrepeso/Obesidad) | Guardar y Continuar |
| **Motivo de Consulta** | Textarea libre | Guardar y Continuar |
| **Nota Clinica** | Textarea libre | Guardar y Continuar |
| **Diagnosticos** | Multiples entradas. Cada una: Nombre*, Codigo CIE-10, Descripcion, Radio "Primario". Botones: Agregar diagnostico, Quitar | Guardar y Continuar |
| **Tratamientos** | Multiples entradas. Cada una: Select "Desde catalogo de servicios" (opcional, autorrellena descripcion+precio), Descripcion*, Precio, No. diente, Observaciones. Total calculado. Botones: Agregar, Quitar | Guardar y Continuar |
| **Receta** | Diagnostico (precargado del primario), Medicamentos con **autocompletado del catalogo** (busqueda, dropdown), cada med: Nombre, Presentacion, Dosis, Via [Oral/Topica/IM/IV/Sublingual/Inhalada], Frecuencia, Duracion, Instrucciones. Indicaciones adicionales | Guardar Receta y Continuar |
| **Pago** | Monto, Metodo [Efectivo/Tarjeta/Transferencia/Otro], Notas. Muestra total tratamientos | Registrar Pago |

### Finalizacion:
- Boton "Finalizar Consulta" (verde) en header
- Guarda MedicalRecord completo (signos, motivo, diagnosticos, notas)
- Guarda Treatments individualmente
- Guarda Prescription si se creo
- Guarda Payment si se registro
- Si vino de agenda, marca cita como "attended"
- Navega al dashboard

### Header durante consulta:
- Nombre paciente, alergias (en rojo), nombre medico, fecha/hora
- Boton X para cancelar y volver a seleccion

### Funcionalidades que SI tiene:
- Autocompletado de medicamentos del catalogo
- IMC automatico
- Multiples diagnosticos
- Multiples tratamientos
- Autocompletado de servicios del catalogo
- Creacion de paciente inline
- Link pieza dental

### Funcionalidades que NO tiene:
- No permite emitir certificado dentro de la consulta
- No permite emitir consentimiento dentro de la consulta
- No permite emitir presupuesto dentro de la consulta
- No tiene padecimiento actual/semiologia del dolor
- No tiene resumen final antes de cerrar
- No hay guardado parcial persistente entre pasos

---

## 3. AGENDA (/agenda)

### Vistas (4 botones toggle):

**Vista Dia**: Franjas horarias 07:00-19:00, citas en su franja con:
- Nombre paciente, horario, motivo, medico
- Selector de estado inline
- Boton reagendar (icono RefreshCw)
- Link a consulta (icono Stethoscope, solo si confirmada/atendida)

**Vista Semana**: Grid 7 dias, cada dia muestra fecha, primeras 3 citas con hora+nombre, click abre vista dia

**Vista Mes**: Calendario completo tipo grid, cada dia muestra primeras 2 citas con hora, click abre vista dia. Dias fuera del mes con opacidad reducida. Hoy resaltado con circulo primario

**Vista Lista**: Tabla con Hora, Paciente, Motivo, Medico, Estado (selector), boton Reagendar

### Navegacion:
- Flechas anterior/siguiente (dia, semana o mes segun vista)
- Boton "Hoy"
- Boton "Nueva Cita" (abre panel lateral)

### Formulario Nueva Cita (panel slide-in derecho):
- **Paciente**: Busqueda por nombre/telefono con listado. Boton "Nuevo" para crear paciente rapido (Nombre, Apellidos, Telefono, Fecha nac)
- **Medico**: Select
- **Tipo de consulta**: Select desde `agendaConfig.appointmentTypes` (autorrellena duracion y motivo)
- **Fecha**: input date
- **Hora**: input time
- **Duracion**: Select [15/20/30/40/45/60/90 min]
- **Motivo/Tratamiento**: input texto obligatorio
- **Notas internas**: textarea
- Validacion de solapamiento por medico
- Boton "Agendar Cita"

### Estados de cita (6):
Pendiente, Confirmada, Atendida, Cancelada, Reagendada, No asistio

### Modal Reagendar:
- Nueva fecha (date), Nueva hora (time)
- Valida solapamiento
- Boton "Reagendar"

### Modal Cancelar:
- Motivo de cancelacion (select desde `agendaConfig.cancellationReasons`):
  - Paciente cancelo, No asistio, Emergencia medica, Reagendamiento solicitado, Doctor no disponible, Condiciones climaticas, Otro
- Boton "Confirmar Cancelacion"

---

## 4. PACIENTES (/pacientes)

### Lista:
- Busqueda por nombre, telefono o correo
- Tabla: Nombre, Telefono, Correo, Edad (calculada), Sexo, Alergias (en rojo si existen), link "Ver"
- Boton "Nuevo Paciente"
- Filtra archivados automaticamente

### Formulario Nuevo Paciente (panel slide-in):
Campos: Nombre*, Apellidos*, Fecha nac*, Sexo [M/F/Otro], Telefono*, Correo, Domicilio, Estado civil, Tipo sangre [O+/O-/A+/A-/B+/B-/AB+/AB-], Lugar de origen, Escolaridad, Ocupacion, Tutor nombre, Tutor telefono, Alergias (texto separado por comas), Medico tratante (select de doctores activos)
- Deteccion de duplicados (nombre+telefono o correo)
- Aviso con segundo click para confirmar

### NO tiene: edicion de paciente existente, archivado/baja logica

---

## 5. DETALLE DE PACIENTE (/pacientes/:id)

### Header:
- Nombre, edad, sexo, telefono
- Botones: Expediente, Odontograma, Consulta

### Alerta de alergias (banner rojo si existen)

### 11 pestanas (tabs horizontales):

| Tab | Contenido |
|-----|-----------|
| **Resumen** | 3 cards: Ficha (correo, domicilio, estado civil, tipo sangre, fecha nac, lugar origen, escolaridad, ocupacion, medico tratante, tutor), Ultimas 5 citas (fecha+hora+estado), Resumen numerico (tratamientos activos, total pagado, recetas, certificados, consentimientos, presupuestos, diagnosticos, consultas) |
| **Citas** | Tabla: Fecha, Hora, Motivo, Medico, Estado |
| **Tratamientos** | Tabla: Tratamiento, Medico, Precio, Pieza, Estado |
| **Recetas** | Tabla: Folio, Fecha, Diagnostico, Medicamentos, Estado |
| **Certificados** | Tabla: Folio, Fecha, Procedimiento, Reposo |
| **Consentimientos** | Tabla: Fecha, Procedimiento, Medico |
| **Presupuestos** | Tabla: Folio, Fecha, Total, Estado |
| **Pagos** | Tabla: Fecha, Monto, Metodo, Notas + Total pagado al fondo |
| **Diagnosticos** | Tabla: Diagnostico, CIE-10, Fecha, Primario |
| **Notas** | Cards cronologicas: autor, fecha/hora, contenido |
| **Signos Vitales** | Grid de cards con ultimo registro: Peso, Estatura, IMC, FC, T/A, Temp, SpO2, FR |

---

## 6. EXPEDIENTE CLINICO (/expediente)

### Seleccion:
- Paciente (select)
- Medico tratante (select)
- Acepta `?patientId=` desde URL

### 18 pestanas (sidebar vertical izquierdo):

#### Tab 1: Identificacion (solo lectura)
Campos: Nombre, Fecha nac, Sexo, Telefono, Correo, Domicilio, Tipo sangre, Estado civil, Lugar de origen, Escolaridad, Ocupacion, Tutor, Alergias

#### Tab 2: Antecedentes Heredofamiliares
- Formulario dinamico con multiples entradas
- Cada entrada: Parentesco (select: Padre, Madre, Abuelo paterno/materno, Abuela paterna/materna, Hermano/a, Tio/a, Otro), Enfermedad (texto), Comentarios (texto), Checkbox Activo/vigente
- Botones: Agregar, Eliminar, Guardar

#### Tab 3: Antecedentes Personales No Patologicos
7 secciones colapsables (accordion):

| Seccion | Campos |
|---------|--------|
| Habitos de higiene oral | Frecuencia de cepillado, Uso de hilo dental, Enjuague bucal, Ultima limpieza dental, Notas adicionales |
| Habitos alimenticios | Comidas al dia, Consumo de azucares, Consumo de agua, Dieta especial, Observaciones, Notas adicionales |
| Consumo de sustancias | Tabaco, Alcohol, Otras sustancias, Frecuencia, Tiempo de consumo, Notas adicionales |
| Vivienda y medio ambiente | Tipo de vivienda, Servicios basicos, Mascotas, Zona, Observaciones, Notas adicionales |
| Antecedentes laborales | Ocupacion actual, Exposicion a riesgos, Tiempo en puesto, Observaciones, Notas adicionales |
| Actividad fisica y descanso | Tipo de actividad, Frecuencia semanal, Horas de sueno, Calidad del sueno, Observaciones, Notas adicionales |
| Inmunizaciones | Esquema completo, Ultima vacuna, Vacunas pendientes, Observaciones, Notas adicionales |

Cada seccion muestra badge "Registrado" si tiene datos. Boton "Guardar Todo"

#### Tab 4: Antecedentes Personales Patologicos
9 categorias colapsables:
- Enfermedades de la infancia
- Enfermedades sistemicas actuales
- Neoplasias
- Quirurgicos y hospitalizaciones
- Farmacologicos
- Traumaticos
- Transfusionales
- Alergias
- Otras enfermedades

Cada categoria permite multiples entradas con Descripcion + Notas. Badge con contador. Boton "Guardar Todo"

#### Tab 5: Padecimiento Actual
- **Motivo de consulta**: textarea
- **Semiologia del dolor** (10 campos): Inicio, Localizacion, Irradiacion, Tipo, Intensidad (1-10 numerico), Duracion, Frecuencia, Factores agravantes, Factores atenuantes, Sintomas asociados
- **Sintomas acompanantes** (8 checkboxes con detalle): Fiebre, Nauseas/vomito, Cefalea, Diarrea, Insomnio, Sangrado, Inflamacion, Otro — cada uno con checkbox + campo detalle condicional
- Boton "Guardar"

#### Tab 6: Interrogatorio por Aparatos y Sistemas
9 sistemas editables:
- Digestivo, Cardiovascular, Respiratorio, Nervioso, Musculo-esqueletico, Hematologico, Endocrino, Genitourinario, Organos de los sentidos
- Cada uno: Radio "Sin alteraciones" / "Con alteraciones"
- Si con alteraciones: Descripcion, Tiempo de evolucion, Tratamiento actual
- Boton "Guardar"

#### Tab 7: Exploracion Fisica — Signos Vitales
Campos: Peso, Estatura, Temperatura, FC, FR, SpO2, T/A Sistolica, T/A Diastolica
- IMC calculado automaticamente con categoria
- Boton "Guardar"

#### Tabs 8-11: Examenes Dentales Especializados

| Tab | Campos |
|-----|--------|
| **Analisis Oclusal** | Clase molar der/izq, Clase canina der/izq, Linea media, Overjet, Overbite, Mordida cruzada, Bruxismo, ATM, Observaciones |
| **Examen Parodontal** | Lista de hallazgos existentes. Formulario agregar: No. pieza, Hallazgo, Comentario. Nota: usa DOM getElementById (anti-patron) |
| **Exploracion Extraoral** | Craneo, Cara, Perfil, Ganglios cervicales, ATM palpacion, Labios, Simetria facial, Piel, Observaciones |
| **Tejidos Blandos** | Labios (mucosa), Carrillos, Paladar duro/blando, Piso de boca, Lengua, Encia, Frenillos, Observaciones |
| **Tejidos Duros** | Dientes presentes, Dientes ausentes, Caries visibles, Restauraciones, Protesis, Fracturas, Movilidad, Observaciones |

Cada tab dental tiene formulario con campos de texto + textarea Observaciones + Boton Guardar

#### Tab 12: Diagnosticos
- Lista read-only de diagnosticos del expediente
- Muestra Nombre, badge "Primario", codigo CIE-10, descripcion, fecha
- Mensaje: "Agregalos desde Nueva Consulta"

#### Tab 13: Tratamientos
- Lista read-only con descripcion, pieza dental, precio, estado (badge)

#### Tab 14: Notas Medicas
- Textarea + boton "Agregar" para nueva nota
- Lista cronologica inversa con autor, fecha/hora, contenido, icono candado si bloqueada

#### Tab 15: Historial de Pagos
- Lista cronologica inversa: fecha, metodo (Efectivo/Tarjeta/Transferencia/Otro), monto
- Total pagado al fondo

#### Tab 16: Documentos
- Agrupados por tipo:
  - Recetas: folio + fecha
  - Certificados: folio + fecha
  - Consentimientos: procedimiento + fecha
- Mensaje si no hay documentos

#### Tab 17: Consultas/Evoluciones
- Lista de MedicalRecords: numero de consulta, fecha/hora, motivo, contadores diagnosticos/notas, medico

### Reactividad:
- useEffect recarga datos cuando cambia `activeRecord` o `selectedPatient`
- Resetea todos los estados al cambiar paciente

---

## 7. ODONTOGRAMA (/odontograma)

### Controles:
- Toggle Permanente/Temporal
- Select paciente (acepta `?patientId=`)
- Select "Estado a aplicar" (14 estados)
- Campo comentario
- Leyenda de colores

### Dientes:
- **Permanente**: Q1(18-11), Q2(21-28), Q4(48-41), Q3(31-38) = 32 piezas
- **Temporal**: Q5(55-51), Q6(61-65), Q8(85-81), Q7(71-75) = 20 piezas

### SVG por pieza:
5 caras clickeables: vestibular, palatal, mesial, distal, occlusal
- Click aplica estado seleccionado
- Re-click del mismo estado elimina
- Piezas ausentes con opacidad reducida

### 14 estados disponibles:
Sano, Caries, Obturado, Fracturado, Ausente, Extraccion indicada, Endodoncia, Corona, Sellador, Movilidad, Remanente radicular, Protesis, Implante, Otro

### Tabla de hallazgos:
Pieza, Cara, Estado (con color), Comentario, Fecha, boton Eliminar

### Problemas: No vincula con expediente, no vincula con medico, no conecta con tratamientos

---

## 8. DIAGNOSTICOS (/diagnosticos)

### Vista funcional (no placeholder):
- Busqueda por nombre o CIE-10
- Filtro por paciente (select)
- Tabla: Diagnostico, CIE-10, Paciente, Medico, Fecha, Primario (badge)
- Datos extraidos de todos los MedicalRecords
- Ordenados por fecha descendente

---

## 9. TRATAMIENTOS (/tratamientos)

### Lista:
- Tabla: Paciente, Tratamiento, Precio, Estado (selector inline)
- Boton "Nuevo"

### 7 estados:
Recomendado, Presupuestado, Aprobado, En proceso, Completado, Pagado, Historico

### Formulario Nuevo:
- Paciente (select), Medico (select), Descripcion/Servicio (select del catalogo O input manual), Precio, Observaciones

### Problemas: No tiene filtro por paciente, no busqueda, no muestra medico ni pieza dental en tabla

---

## 10. NOTAS MEDICAS (/notas)

### Vista funcional (no placeholder):
- Busqueda en contenido
- Filtro por paciente (select)
- Cards cronologicas: icono usuario, nombre paciente, "por [autor]", fecha/hora, contenido, badge "Nota bloqueada"
- Datos extraidos de todos los MedicalRecords

---

## 11. ESTUDIOS AUXILIARES (/estudios)

### Vista funcional (no placeholder):
- Filtro por paciente (select)
- Tabla: Tipo, Descripcion, Paciente, Fecha, Enlaces (links clickeables)
- Datos extraidos de `auxiliaryStudies` en MedicalRecords

---

## 12. RECETAS (/recetas)

### Lista:
- Tabla: Folio, Fecha, Paciente, Medico, Estado (Emitida/Borrador), link "Ver"

### Formulario Nueva Receta (panel slide-in):
- Paciente (select), Medico (select)
- Alerta de alergias (banner rojo condicional)
- Signos vitales: Peso, Estatura, T/A, Temperatura
- Diagnostico (texto libre)
- Medicamentos (max 10): cada uno con select "Del catalogo" (autorrellena nombre+presentacion+dosis) + campos manuales: Nombre, Presentacion, Dosis, Via, Frecuencia, Duracion
- Indicaciones adicionales, Proxima cita
- Botones: "Guardar Borrador" / "Emitir Receta"

### Vista previa (modal A4):
- Header clinica (nombre, direccion, telefono, logo si existe)
- Titulo "Receta Medica" + Folio
- Datos paciente, fecha, medico, cedula
- Diagnostico, listado de medicamentos numerado, indicaciones
- Linea de firma con cedula
- Boton "Imprimir" (window.print)

---

## 13. CERTIFICADOS (/certificados)

### Lista:
- Tabla: Folio, Fecha, Paciente, Medico, Procedimiento, Reposo (dias), link "Ver"

### Formulario Nuevo Certificado (panel slide-in):
- Paciente (select), Medico (select)
- Diagnostico (texto), Checkbox "Omitir diagnostico"
- Texto generico (textarea)
- Procedimiento, Dias de reposo, Fecha inicio reposo, Fecha fin reposo
- Lugar de expedicion (prellenado con direccion clinica)

### Vista previa (modal A4):
- Header clinica con logo y paleta documental
- Titulo "Certificado Medico" + Folio
- Cuerpo: "Certifico que [paciente] fue atendido..." con diagnostico (si no omitido), procedimiento, reposo
- Lugar y fecha
- Lineas de firma (medico con cedula + paciente)
- Boton "Imprimir"

---

## 14. CONSENTIMIENTOS (/consentimientos)

### 2 sub-tabs: Consentimientos / Plantillas

### Plantillas:
- Lista de plantillas existentes: procedimiento, descripcion, riesgos, complicaciones
- Formulario nueva plantilla: Procedimiento, Descripcion, Riesgos, Complicaciones

### Consentimientos:
- Tabla: Fecha, Paciente, Procedimiento, Medico, link "Ver"
- Formulario nuevo: Paciente (select), Medico (select), Plantilla (select, autorrellena campos), Procedimiento*, Descripcion, Riesgos, Complicaciones

### Vista previa (modal A4):
- Header clinica con logo
- Titulo "Consentimiento Informado"
- Procedimiento, descripcion, riesgos, complicaciones
- Declaracion del paciente
- Lineas de firma (paciente + medico con cedula)
- Fecha
- Boton "Imprimir"

---

## 15. PRESUPUESTOS (/presupuestos)

### Lista:
- Tabla: Folio, Fecha, Paciente/Prospecto, Total, Estado (selector inline)

### 7 estados:
Borrador, Emitido, Enviado, Aceptado, Rechazado, Vencido, Convertido

### Formulario Nuevo (panel slide-in):
- Paciente (select) o Prospecto externo (input nombre)
- Partidas: select servicio del catalogo + boton "Agregar manual"
  - Cada linea: Descripcion, Cantidad, Precio unitario, Total calculado, boton Eliminar
- Descuento %, Vigencia en dias
- Resumen: subtotal, descuento, total
- Notas
- Botones: "Borrador" / "Emitir"

### Problemas: No tiene vista previa imprimible, no exporta, no convierte a tratamiento, no permite editar items existentes

---

## 16. PAGOS (/pagos)

### Header: Total cobrado global

### Lista:
- Tabla: Fecha, Paciente, Monto, Metodo (Efectivo/Tarjeta/Transferencia/Otro), Tipo (Total/Parcial), Notas

### Formulario Recibir Pago (panel slide-in):
- Paciente (select)
- Tratamiento pendiente (select, solo tratamientos no completados/pagados del paciente)
- Resumen: total tratamiento, pagado, saldo restante
- Monto a cobrar, Metodo [4 opciones], Tipo [Total/Parcial], Notas
- Si el pago cubre el saldo → marca tratamiento como "Pagado"

### Problemas: No tiene filtro por fecha ni por paciente, no tiene descuento, no tiene comprobante

---

## 17. MEDICOS (/medicos)

### Vista: Cards en grid 2 columnas con:
- Circulo de color (agendaColor) con iniciales
- Nombre, Especialidad, Cedula, Telefono, Email, Universidad
- Estado activo/inactivo (opacidad si inactivo)
- Boton Editar, Boton Activar/Desactivar

### Busqueda por nombre o especialidad

### Formulario Crear/Editar (panel slide-in):
- Nombre*, Especialidad, Cedula*, Telefono, Correo, Universidad, Direccion consultorio, Color de agenda (color picker), Firma digital (texto, no imagen)

### CRUD completo: Crear, Editar, Activar/Desactivar

---

## 18. SERVICIOS (/servicios)

### Vista: Agrupados por categoria, tabla por grupo:
- Servicio, Descripcion, Precio, Estado (badge Activo/Inactivo), botones Editar + Activar/Desactivar

### Busqueda por nombre o categoria

### Formulario Crear/Editar (panel slide-in):
- Nombre*, Precio*, Descripcion, Categoria

### CRUD completo: Crear, Editar, Activar/Desactivar

---

## 19. MEDICAMENTOS (/medicamentos)

### Vista: Tabla con busqueda
- Medicamento, Categoria, Presentacion, Dosis habitual, Advertencias, Estado, botones Editar + Activar/Desactivar

### Formulario Crear/Editar (panel slide-in):
- Nombre*, Categoria*, Uso principal, Presentacion, Dosis habitual, Advertencias

### CRUD completo: Crear, Editar, Activar/Desactivar

---

## 20. IDENTIDAD CLINICA (/identidad)

### Campos:
- Nombre de la clinica
- Direccion del consultorio
- Direccion fiscal
- Telefono
- Correo

### Logotipos:
- Logo principal (upload imagen, max 500KB, Base64, preview, boton eliminar)
- Logo secundario/institucional (misma logica)

### Paleta Documental:
- 3 color pickers: Primario, Secundario, Acento
- Alimenta documentos (recetas, certificados, presupuestos)

### Vista previa documental:
- Boton "Vista previa documental" toggle
- Muestra encabezado simulado con logo, nombre, direccion, telefono, email
- Linea de color primario
- Titulo "Receta Medica" con folio ejemplo
- Datos paciente y diagnostico ejemplo
- Linea de firma

### Boton "Guardar Cambios"

---

## 21. USUARIOS Y PERMISOS (/usuarios)

### Header: Contador X/Y usuarios activos vs limite del plan

### Lista: Cards con:
- Circulo con iniciales
- Nombre, Correo, Rol (badge), Estado (Activo/Inactivo)
- Badges de permisos (primeros 8 modulos)
- Botones: Editar, Activar/Desactivar

### Formulario Crear/Editar:
- Nombre*, Correo*, Rol [7 opciones]
- Permisos auto-asignados segun rol

### Roles disponibles:
Admin (todas las acciones), Medico, Recepcionista, Enfermera/Asistente, Caja/Contabilidad, Solo lectura (solo view), Demo

### 16 modulos de permisos:
dashboard, agenda, patients, records, odontogram, prescriptions, certificates, budgets, payments, services, medications, doctors, consent, users, settings, support

### 6 acciones por modulo:
view, create, edit, delete, export, configure

### Limite: No permite crear mas usuarios si `users.activos >= subscription.limits.maxUsers`

---

## 22. AJUSTES (/ajustes)

### 6 secciones:

#### 1. Configuracion de Agenda
- Duracion predeterminada: select [15/20/30/40/45/60 min]
- Horarios por dia: 7 dias (lun-dom), cada uno con checkbox habilitado + bloques horarios editables (hora inicio + hora fin)
- Tipos de consulta: lista con nombre+duracion+color, boton agregar (nombre+minutos), boton quitar

#### 2. Exportar Respaldo
- Contrasena opcional (input password)
- Boton "Exportar" → descarga JSON (con btoa si contrasena)
- Muestra ultimo respaldo y total

#### 3. Importar Respaldo
- Input file (.json)
- Boton "Importar" → valida estructura, crea backup previo, restaura, recarga pagina

#### 4. Simulador de Suscripcion
- Select [Trial/Activa/Gracia/Vencida/Restringida]
- Boton "Aplicar"

#### 5. Estado de Sincronizacion
- Modo: Local (Offline)
- Sincronizacion nube: No configurada
- Conflictos: 0

#### 6. Zona de Peligro
- Aviso rojo
- Input "Escribe ELIMINAR para confirmar"
- Boton "Reiniciar" → borra todos los `clinical-os-*` de localStorage y recarga

---

## 23. SOPORTE (/soporte)

### 3 secciones estaticas:

1. **Estado del Sistema**: Almacenamiento (Local), Modo (Offline-first), Sync nube (No disponible)
2. **5 FAQs**: Donde se guardan datos, Como hacer respaldo, Multiples dispositivos, Borrar cache, Restaurar respaldo
3. **Tips de Seguridad**: 4 bullets sobre respaldos y contrasenas

---

## DATOS DEMO (seedDemoData + seedDemoAppointments)

### Cargados via OnboardingWizard "Cargar Demo":
- Medicos, Pacientes, Servicios, Medicamentos, Usuarios, Citas de ejemplo
- Datos coherentes para probar flujos basicos

---

## RESUMEN DE ESTADO DE CADA MODULO

| # | Modulo | Estado | CRUD | Vista previa/Impresion | Conectado |
|---|--------|--------|------|----------------------|-----------|
| 1 | Dashboard | Funcional | N/A | N/A | Si |
| 2 | Nueva Consulta | Funcional (7 pasos) | Crea records/tx/rx/pagos | No | Si |
| 3 | Agenda | Funcional (4 vistas) | CRUD citas | N/A | Si |
| 4 | Pacientes | Funcional | Solo crear (no editar) | N/A | Si |
| 5 | Detalle Paciente | Funcional (11 tabs) | N/A (read-only) | N/A | Si |
| 6 | Expediente | Funcional (18 tabs) | CRUD secciones clinicas | N/A | Si |
| 7 | Odontograma | Funcional | CRUD hallazgos | N/A | Parcial |
| 8 | Diagnosticos | Funcional | Read-only | N/A | Si |
| 9 | Tratamientos | Funcional | Crear + cambiar estado | N/A | Parcial |
| 10 | Notas Medicas | Funcional | Read-only | N/A | Si |
| 11 | Estudios Aux. | Funcional | Read-only | N/A | Si |
| 12 | Recetas | Funcional | Crear (no editar) | Si (A4 + Imprimir) | Si |
| 13 | Certificados | Funcional | Crear (no editar) | Si (A4 + Imprimir) | Si |
| 14 | Consentimientos | Funcional | Crear + plantillas | Si (A4 + Imprimir) | Si |
| 15 | Presupuestos | Funcional | Crear + estado | No (falta) | Parcial |
| 16 | Pagos | Funcional | Crear | No | Si |
| 17 | Medicos | Funcional | CRUD completo | N/A | Si |
| 18 | Servicios | Funcional | CRUD completo | N/A | Si |
| 19 | Medicamentos | Funcional | CRUD completo | N/A | Si |
| 20 | Identidad Clinica | Funcional | Editar | Vista previa basica | Si |
| 21 | Usuarios | Funcional | CRUD completo | N/A | Si |
| 22 | Ajustes | Funcional | Config + Backup | N/A | Si |
| 23 | Soporte | Estatico | N/A | N/A | N/A |

---

## PROBLEMAS Y VACIOS CRITICOS DETECTADOS

1. **Pacientes**: No se puede editar paciente existente
2. **Nueva Consulta**: Falta certificado, consentimiento, presupuesto y resumen final dentro del flujo
3. **Presupuestos**: Falta vista previa imprimible y conversion a tratamiento
4. **Pagos**: Sin filtros por fecha/paciente, sin descuento, sin comprobante
5. **Tratamientos**: Sin filtro por paciente, sin busqueda, no muestra medico ni pieza en tabla
6. **Odontograma**: Aislado (no vincula medico, expediente, ni sugiere tratamiento)
7. **Buscador global**: Solo decorativo, no funciona
8. **Notificaciones**: Solo decorativas, no funcionan
9. **Recetas**: No permite editar borradores, sin filtro por fecha
10. **Expediente parodontal**: Usa `document.getElementById` (anti-patron React)
11. **Onboarding**: Pasos 2-5 son solo texto informativo sin formularios
12. **Backup**: Cifrado es solo Base64 (no real)
13. **Roles**: Estructura existe pero no aplica restricciones a la UI
14. **Sucursales**: Tipo `Branch` existe pero no hay UI ni gestion

