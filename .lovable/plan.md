

## Reporte Ultra-Detallado del Sistema Clinical OS

---

### SIDEBAR / NAVEGACION PRINCIPAL

5 secciones, 21 opciones totales:

```text
OPERATIVA
  - Inicio (Dashboard)
  - Nueva Consulta        [destacado en color primario]
  - Agenda
  - Pacientes

CLINICA
  - Expediente
  - Odontograma
  - Diagnosticos           [PLACEHOLDER - solo texto informativo]
  - Tratamientos
  - Notas Medicas          [PLACEHOLDER - solo texto informativo]
  - Estudios Aux.          [PLACEHOLDER - solo texto informativo]

DOCUMENTOS
  - Recetas
  - Certificados           [PLACEHOLDER - solo texto informativo]
  - Consentimientos        [PLACEHOLDER - solo texto informativo]
  - Presupuestos

ADMINISTRATIVA
  - Pagos
  - Medicos
  - Servicios
  - Medicamentos

CONFIGURACION
  - Identidad Clinica
  - Usuarios y Permisos
  - Ajustes
  - Soporte
```

Filtrado por rol: Admin=todo, Doctor=no config, Recepcionista=operativa+admin, Caja=pagos+presupuestos.

---

### 1. DASHBOARD (Inicio)

**Campos/datos visibles:**
- Fecha actual, nombre de clinica, badge de plan
- Alertas: onboarding incompleto, sin respaldos, sin medicos
- 4 stats con link: Citas Hoy, Pacientes, Tratamientos Pendientes, Cobrado Total
- Citas del dia (max 5): hora, nombre paciente, motivo, estado
- Accesos rapidos: Nueva Consulta, Nueva Cita, Nuevo Paciente, Recibir Pago
- Pacientes recientes (max 4)
- Estado Local: modo, ultimo respaldo, cambios pendientes
- Limites del Plan: medicos X/Y, usuarios, sucursales
- Licencia: plan, estado, vencimiento

**Problemas:** No hay acceso rapido a "Nuevo Medico" ni a "Nuevo Servicio". Los pacientes recientes no estan ordenados por actividad real, solo por orden de array.

---

### 2. NUEVA CONSULTA (/consulta)

**Paso 1 - Seleccion de paciente:**
- Busqueda por nombre o telefono
- Lista de pacientes (max 8 sin busqueda)
- Selector de medico tratante (solo si hay >1 doctor)
- NO permite crear paciente nuevo desde aqui

**Paso 2 - Flujo guiado con 7 pasos (sidebar lateral):**

| Paso | Campos |
|------|--------|
| Signos Vitales | Peso kg, Talla cm, FC lpm, FR rpm, PA Sistolica, PA Diastolica, Temp C, SpO2 % |
| Motivo de Consulta | Textarea libre |
| Nota Clinica | Textarea libre |
| Diagnostico | Nombre, Codigo CIE-10, checkbox Primario, Descripcion |
| Tratamiento | Descripcion, Precio, No. diente, Observaciones |
| Receta | Diagnostico, Medicamentos (nombre, presentacion, dosis, via [Oral/Topica/IM/IV/Sublingual/Inhalada], frecuencia, duracion, instrucciones), Indicaciones adicionales |
| Pago | Monto, Metodo [Efectivo/Tarjeta/Transferencia/Otro], Notas |

**Observaciones criticas:**
- NO hay autocompletado de medicamentos desde catalogo (a diferencia del modulo de Recetas que si lo tiene)
- NO calcula IMC automaticamente en signos vitales
- Solo permite 1 diagnostico y 1 tratamiento por consulta
- Al finalizar guarda record medico, marca cita como atendida si viene de agenda
- Los pasos se pueden saltar libremente clickeando el sidebar

---

### 3. AGENDA

**Vistas:** Dia, Semana, Lista
**Navegacion:** Flechas dia anterior/siguiente, boton "Hoy"

**Vista Dia:** Franjas horarias 07:00-19:00, citas con nombre, horario, motivo, medico, selector de estado, link "Consulta" (solo si confirmada o atendida)

**Vista Semana:** 7 dias desde lunes, cada dia muestra hora de primeras 3 citas, click abre vista dia

**Vista Lista:** Tabla con Hora, Paciente, Motivo, Medico, Estado

**Formulario Nueva Cita:**
- Paciente (select), Medico (select), Fecha, Hora, Duracion [15/30/45/60/90 min], Telefono, Motivo/Tratamiento
- Valida solapamiento por medico
- NO permite crear paciente nuevo desde aqui
- NO tiene busqueda de paciente, solo select

**Estados de cita:** Pendiente, Confirmada, Atendida, Cancelada, Reagendada, No asistio

**Faltante:** No hay funcion de reagendar (solo cambiar estado), no hay vista mensual.

---

### 4. PACIENTES

**Lista:**
- Busqueda por nombre, telefono o correo
- Tabla: Nombre, Telefono, Correo, Edad (calculada), Sexo, Alergias, link "Ver"
- Filtra archivados automaticamente

**Formulario Nuevo Paciente:**
- Nombre*, Apellidos*, Fecha nacimiento*, Sexo [M/F/Otro], Telefono*, Correo (valida formato), Domicilio, Estado civil, Tipo sangre [O+/O-/A+/A-/B+/B-/AB+/AB-], Tutor nombre, Tutor telefono
- Detecta duplicados por nombre+telefono o correo (aviso, segundo click confirma)
- NO tiene campo para alergias en el formulario de alta
- NO tiene campo para lugar de origen, educacion, ocupacion

**Detalle de paciente (/pacientes/:id):**
- Header: nombre, edad, sexo, telefono, link a expediente
- Alerta de alergias si existen
- Ficha: correo, domicilio, estado civil, tipo sangre, fecha nac, medico tratante, tutor
- Citas: ultimas 5, fecha+hora+estado
- Resumen financiero: tratamientos activos, total pagado, presupuestos, recetas
- NO muestra historial de notas, NO link a odontograma, NO historial de recetas detallado

---

### 5. EXPEDIENTE CLINICO (/expediente)

**Seleccion:** Paciente (select), Medico tratante (select)

**7 pestanas (sidebar vertical izquierdo):**

| Pestana | Contenido real |
|---------|---------------|
| Identificacion | Datos de solo lectura del paciente: nombre, fecha nac, sexo, telefono, correo, domicilio, tipo sangre, estado civil, tutor, alergias |
| Ant. Heredofamiliares | SOLO PLACEHOLDER - texto "Modulo de antecedentes heredofamiliares con entradas estructuradas..." |
| Ant. Personales | SOLO PLACEHOLDER - 7 tarjetas clickeables sin funcionalidad: Higiene oral, Alimenticios, Sustancias, Vivienda, Laborales, Actividad fisica, Inmunizaciones |
| Padecimiento Actual | Textarea "Motivo de consulta", boton guardar. Sin semiologia del dolor, sin sintomas acompanantes |
| Interrog. por Aparatos | SOLO DISPLAY - 9 sistemas listados con "Sin alteraciones" fijo, sin edicion |
| Exploracion Fisica | 8 campos numericos: Peso, Estatura, Temp, FC, FR, SpO2, TA Sistolica, TA Diastolica. Calcula IMC. Boton guardar |
| Notas Medicas | Textarea + boton agregar. Lista cronologica inversa con autor, fecha, hora, contenido, icono bloqueo |

**Problemas graves:**
- Antecedentes heredofamiliares: prometidos como estructurados (parentesco, enfermedad, comentarios, activo/inactivo) pero solo hay texto placeholder
- Antecedentes personales no patologicos: 7 secciones listadas pero ninguna tiene "ver mas" funcional ni formularios
- Antecedentes personales patologicos: NO EXISTE la pestana (no aparece en TABS)
- Padecimiento actual: solo tiene motivo de consulta, falta completamente semiologia del dolor (inicio, localizacion, irradiacion, tipo, intensidad 1-10, duracion, frecuencia, agravantes, atenuantes, asociados) y sintomas acompanantes
- Interrogatorio por aparatos: SOLO lectura estatica, no se puede marcar "con alteraciones" ni agregar descripcion
- NO hay pestanas para: analisis oclusion, examen parodontal, exploracion extraoral, tejidos blandos, tejidos duros, estudios auxiliares, diagnostico, tratamiento, historial pagos
- El expediente no carga datos previos guardados en los estados (vitals/chiefComplaint se inicializan del activeRecord pero no se actualizan al cambiar paciente)

---

### 6. ODONTOGRAMA

**Controles:**
- Toggle Permanente/Temporal
- Select paciente
- Select "Estado a aplicar" (14 estados)
- Campo comentario
- Leyenda de colores

**Dientes:**
- Permanente: Q1(18-11), Q2(21-28), Q4(48-41), Q3(31-38) = 32 piezas
- Temporal: Q5(55-51), Q6(61-65), Q8(85-81), Q7(71-75) = 20 piezas
- SVG por pieza con 5 caras clickeables: vestibular, palatal, mesial, distal, occlusal
- Click aplica estado seleccionado, re-click del mismo estado elimina
- Dientes ausentes se muestran con opacidad reducida

**Tabla de hallazgos:**
- Pieza, Cara, Estado (con color), Comentario, Fecha, boton Eliminar

**Problemas:**
- No hay selector de medico
- No vincula con expediente (recordId vacio)
- No conecta con tratamientos recomendados
- No advierte duplicados

---

### 7. DIAGNOSTICOS, NOTAS MEDICAS, ESTUDIOS AUX.

**Las 3 son paginas PLACEHOLDER** con un titulo y un parrafo de texto que dice "accede desde Expediente" pero el expediente tampoco tiene esos modulos funcionales. Son callejones sin salida.

---

### 8. TRATAMIENTOS

**Lista:** Tabla con Paciente, Tratamiento, Precio, Estado (selector inline)
**Estados:** Recomendado, Presupuestado, Aprobado, En proceso, Completado, Pagado, Historico

**Formulario Nuevo:**
- Paciente (select), Medico (select), Descripcion/Servicio (selector del catalogo O input manual), Precio, Observaciones
- Si seleccionas del catalogo, llena descripcion y precio automaticamente

**Problemas:** No tiene filtro por paciente, no tiene busqueda, no vincula a diagnostico, no vincula a pieza dental, no muestra medico en la tabla.

---

### 9. RECETAS MEDICAS

**Lista:** Tabla con Folio, Fecha, Paciente, Medico, Estado (Emitida/Borrador), link "Ver"

**Formulario Nueva Receta (panel lateral):**
- Paciente (select), Medico (select)
- Alerta de alergias si el paciente tiene
- Signos vitales: Peso, Estatura, T/A (formato 120/80), Temperatura
- Diagnostico (texto libre)
- Medicamentos (max 10): cada uno con select "Del catalogo" + campos manuales:
  - Nombre, Presentacion, Dosis, Via, Frecuencia, Duracion
  - Si seleccionas del catalogo: llena nombre, presentacion, dosis automaticamente
- Indicaciones adicionales, Proxima cita
- Dos botones: "Guardar Borrador" / "Emitir Receta"

**Vista previa (modal A4):**
- Header clinica (nombre, direccion, telefono)
- Titulo "Receta Medica" + Folio
- Datos paciente y fecha, medico y cedula
- Diagnostico, listado de medicamentos, indicaciones
- Firma del medico con cedula
- Boton Imprimir

**Problemas:**
- No calcula IMC en signos vitales de receta
- No hay busqueda de paciente, solo select
- No muestra campo "Uso principal" del catalogo
- No permite editar receta existente
- No hay filtro por fechas

---

### 10. CERTIFICADOS Y CONSENTIMIENTOS

**AMBOS SON PLACEHOLDER** - Solo titulo y texto descriptivo. No hay formularios, no hay generacion de documentos, no hay firma digital.

---

### 11. PRESUPUESTOS

**Lista:** Folio, Fecha, Paciente/Prospecto, Total, Estado (selector inline)
**Estados:** Borrador, Emitido, Enviado, Aceptado, Rechazado, Vencido, Convertido

**Formulario Nuevo:**
- Paciente (select) o Prospecto externo (input nombre)
- Servicios: selector del catalogo + boton manual
  - Cada linea: descripcion, cantidad, precio unitario, total calculado, boton eliminar
- Descuento %, Vigencia en dias
- Resumen: subtotal, descuento, total
- Notas
- Botones: Borrador / Emitir

**Problemas:** No tiene vista previa, no tiene exportacion/impresion, no vincula con tratamientos, no permite editar items de presupuestos existentes.

---

### 12. PAGOS

**Lista:** Fecha, Paciente, Monto, Metodo, Tipo (Total/Parcial), Notas
**Header:** Total cobrado global

**Formulario Recibir Pago:**
- Paciente (select)
- Tratamiento pendiente (select, solo si el paciente tiene) - calcula saldo
- Resumen: total del tratamiento, pagado, saldo
- Monto a cobrar, Metodo [Efectivo/Tarjeta/Transferencia/Otro], Tipo [Total/Parcial], Notas
- Si el pago cubre el saldo, marca tratamiento como "Pagado"

**Problemas:** No tiene filtro por fechas, no permite descuento, no muestra desglose por paciente.

---

### 13. MEDICOS

**Vista:** Tarjetas con iniciales, nombre, especialidad, cedula, telefono, email, universidad, estado activo/inactivo, color de agenda

**Formulario Nuevo:**
- Nombre completo*, Especialidad, Cedula Profesional*, Telefono, Correo, Universidad, Color de agenda (color picker)

**Faltante:** No tiene campo para domicilio del consultorio, no tiene firma digital, no tiene horarios/schedule, no tiene funcion de editar, no tiene funcion de desactivar.

---

### 14. SERVICIOS

**Vista:** Agrupados por categoria, tabla con Servicio, Descripcion, Precio, Estado

**Formulario Nuevo:**
- Nombre*, Categoria, Precio*, Descripcion

**Faltante:** No tiene edicion, no tiene baja logica (desactivar), no tiene busqueda.

---

### 15. MEDICAMENTOS

**Vista:** Tabla con busqueda. Columnas: Medicamento, Categoria, Presentacion, Dosis habitual, Advertencias

**Formulario Nuevo:**
- Nombre*, Categoria*, Uso principal, Presentacion, Dosis habitual, Advertencias

**Faltante:** No tiene edicion, no tiene baja logica, no tiene carga masiva JSON.

---

### 16. IDENTIDAD CLINICA

**Campos:** Nombre clinica, Direccion consultorio, Direccion fiscal, Telefono, Correo
**Nota:** "Se usan en recetas, certificados y presupuestos"

**Faltante:** No tiene logo, no tiene logo secundario, no tiene paleta documental, no tiene vista previa de documentos, no tiene campo de especialidad.

---

### 17. USUARIOS Y PERMISOS

**Vista:** Lista de usuarios con avatar, nombre, correo, rol, estado, badges de permisos (primeros 8 modulos)
**Header:** Contador X / Y usuarios, alerta si al limite

**Formulario Nuevo:**
- Nombre*, Correo*, Rol [Administrador/Medico/Recepcionista/Enfermera/Caja/Solo lectura/Demo]
- Permisos asignados automaticamente segun rol

**Roles y permisos por defecto:**
- Admin: todas las acciones en todos los modulos
- Solo lectura: solo "view" en todos
- Otros: "view" + "create" en todos

**Faltante:** No permite editar permisos granulares por usuario, no permite desactivar usuario, no permite editar rol, la asignacion de permisos es generica (no diferencia por modulo realmente).

---

### 18. AJUSTES

**4 secciones:**
1. Exportar Respaldo: password opcional, boton exportar, registro de backups
2. Importar Respaldo: file input JSON, crea copia previa antes de importar
3. Simulador Suscripcion: select [Trial/Activa/Gracia/Vencida/Restringida], boton aplicar
4. Estado Sincronizacion: modo local, sin cloud, 0 conflictos
5. Zona de Peligro: escribir "ELIMINAR", boton reiniciar base

**Problemas:** El cifrado es solo base64 (no real), la importacion no valida estructura, no hay CIE-10, no hay restauracion con password.

---

### 19. SOPORTE

**3 secciones:**
- Estado del sistema (modo, almacenamiento)
- 5 FAQs estaticas
- Tips de seguridad (4 bullets)

---

### RESUMEN: MODULOS SIN FUNCIONALIDAD REAL (SOLO PLACEHOLDER)

1. **Diagnosticos** - placeholder que dice "accede desde expediente"
2. **Notas Medicas** - placeholder que dice "accede desde expediente"
3. **Estudios Auxiliares** - placeholder
4. **Certificados Medicos** - placeholder, sin formulario ni firma
5. **Consentimientos Informados** - placeholder, sin formulario ni firma

### MODULOS CON FUNCIONALIDAD PARCIAL/INCOMPLETA

1. **Expediente** - 3 de 7 pestanas funcionales (Identificacion, Exploracion Fisica, Notas). Faltan antecedentes estructurados, padecimiento actual completo, interrogatorio editable, y todas las pestanas dentales
2. **Identidad Clinica** - sin logos, sin paleta, sin vista previa
3. **Medicos** - sin edicion, sin firma, sin horarios
4. **Servicios** - sin edicion, sin baja logica
5. **Medicamentos** - sin edicion, sin carga masiva
6. **Usuarios** - sin edicion de permisos granulares
7. **Consulta** - sin autocompletado de medicamentos del catalogo, sin IMC, solo 1 diagnostico/tratamiento

### FLUJO DE MEDICAMENTOS EN RECETA

- **Catalogo de Medicamentos** (/medicamentos): alta con nombre, categoria, presentacion, dosis, advertencias
- **Receta (standalone)**: SI conecta al catalogo, select "Del catalogo" que auto-rellena nombre+presentacion+dosis
- **Receta (dentro de consulta)**: NO conecta al catalogo, todo es captura manual
- Esto significa que si el doctor usa "Nueva Consulta", pierde el autocompletado de medicamentos

