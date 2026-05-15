# IDEAS — LABITCONF 2026 Speaker Dashboard
> Documento generado con análisis del código existente + expertise en event management UX  
> Contexto: 3 días · 9 stages · ~8 hs/día · 400+ speakers  
> Stack: HTML/JS puro + Google Apps Script backend

---

## Sección 1: Ideas de UX/UI

### 1. Vista Kanban de estado de speakers (columnas por estado)
**Qué es:** Una vista alternativa a la tabla de speakers donde cada columna representa un estado del pipeline: Invitado / Pendiente / Confirmado / No Aprobado. Los speakers se muestran como tarjetas arrastrables (drag & drop).

**Por qué ayuda:** La tabla actual funciona bien para edición masiva, pero visualmente es difícil ver de un vistazo cuántos speakers están en cada etapa. Un Kanban convierte el "¿quién falta confirmar?" en algo instantáneo.

**Cómo implementarlo:** Agregar un tab `🗂️ Kanban` nuevo. Renderizar 4 columnas `div.kanban-col`. Cada tarjeta tiene nombre, tipo, temas. Usar la API de Drag and Drop HTML5 (`draggable="true"`, eventos `ondragstart`/`ondrop`). Al soltar en otra columna, actualizar `s.estado` en `state.speakers` y marcar dirty.

---

### 2. Vista de grilla horaria visual (timeline grid)
**Qué es:** En lugar de (o además de) la tabla actual por filas, mostrar una grilla donde el eje X son los horarios (9:00–20:00 en franjas de 30 min) y el eje Y son los 9 stages. Cada celda muestra el speaker asignado con color por tipo.

**Por qué ayuda:** Es la vista que usan Sessionize, Sched y Google I/O. De un vistazo se ve si quedan huecos en algún stage, si hay solapamientos, y cómo queda la densidad por hora del día.

**Cómo implementarlo:** Calcular columnas a partir de `horaApertura` en franjas de 15 o 30 min. Por cada franja, iterar `state.principal` y buscar qué fila cubre ese rango de tiempo. Renderizar un `<div>` con ancho proporcional a la duración. CSS Grid con `grid-template-columns: [time] repeat(N_franjas, 1fr)` y `grid-column: span X` según la duración.

---

### 3. Panel de búsqueda global con atajos (Command Palette)
**Qué es:** Un buscador flotante activable con `Ctrl+K` o `Cmd+K` que permite buscar speakers, temas, horarios y navegar directamente a cualquier celda de la agenda.

**Por qué ayuda:** Con 400+ speakers y 3 días de agenda, encontrar a "Martín López" o "la charla de DeFi del día 2 en Stage 3" requiere scrollear mucho. Un command palette como el de Notion/Linear reduce eso a 2 segundos.

**Cómo implementarlo:** Modal `position:fixed` con `input[type=text]`. Al escribir, filtrar en tiempo real sobre `state.speakers` y `state.principal` con un simple `Array.filter` + regex. Resultados con navegación por teclado (flechas + Enter). Al seleccionar un resultado, hacer `switchTab()` y `scrollIntoView()` sobre la fila correspondiente.

---

### 4. Indicador de cobertura por stage con semáforo
**Qué es:** En la barra de configuración superior (config-bar) o en el tab de Resumen, mostrar 9 mini-indicadores (uno por stage) con un color de semáforo: rojo (< 50% bloques con speaker), amarillo (50–80%), verde (> 80%).

**Por qué ayuda:** Actualmente el Resumen muestra las estadísticas por stage pero hay que hacer clic en el tab. Este widget siempre visible elimina la necesidad de ir a Resumen para saber qué stages necesitan atención urgente.

**Cómo implementarlo:** Función `calcCoverage()` que itera `state.principal` y cuenta bloques con speaker por stage key. Renderizar 9 pastillas `<span>` en el `config-bar`. Actualizar con cada `renderPrincipal()`.

---

### 5. Etiquetas/tags de temas con colores y filtro
**Qué es:** En la vista de speakers, los temas (Bitcoin, Lightning, DeFi, etc.) se muestran como chips coloridos en lugar de texto plano. Hacer clic en un chip filtra la tabla por ese tema.

**Por qué ayuda:** Cuando el equipo quiere equilibrar el contenido (¿tenemos muchas charlas de DeFi y pocas de Layer 2?), filtrar por tema es clave. Actualmente el campo "Temas" es texto libre sin filtro.

**Cómo implementarlo:** Al renderizar la tabla de speakers, hacer `s.temas.split(',')` y generar `<span class="tag">` por cada tema. Mapear temas a colores con un hash simple (`tema.charCodeAt(0) % palette.length`). Agregar al `spFilter` la key `tema` y conectarlo al `renderSpeakers()`.

---

### 6. Modo "briefing card" para imprimir / compartir por speaker
**Qué es:** Al hacer clic en un speaker, abrir un modal lateral (panel derecho, tipo "drawer") con todos sus datos: nombre, foto URL, bio, temas, stage asignado, horario, notas del equipo, links sociales. Con un botón "Imprimir" o "Copiar como texto".

**Por qué ayuda:** El equipo de producción necesita frecuentemente mandar información rápida a cada speaker sobre su slot. Actualmente requiere copiar a mano de la tabla.

**Cómo implementarlo:** Agregar campo `foto` y `bio` al objeto speaker. Renderizar un `div.drawer` en `position:fixed; right:0; top:50px` con `transform:translateX(100%)` y animación CSS. Al hacer clic en el nombre del speaker, abrir el drawer con `transform:translateX(0)`. Botón que hace `window.print()` con un `@media print` que solo muestra el drawer.

---

### 7. Filtros avanzados combinables en la Agenda
**Qué es:** Sobre la tabla de Agenda, agregar una barra de filtros: por Stage (dropdown), por Tipo (Charla, Panel, Taller…), por día (si se maneja multi-día), y un buscador de texto que filtra por tema/speaker.

**Por qué ayuda:** La agenda con 3 días × 8 hs × 9 stages puede tener fácilmente 200+ filas. Hoy no hay ningún filtro sobre la tabla principal.

**Cómo implementarlo:** Variable `principalFilters = {stage: 'all', tipo: 'all', q: ''}`. En `renderPrincipal()`, filtrar `state.principal` con esos criterios antes de renderizar. Los controles de filtro van en una segunda fila del `config-bar` (colapsable con un botón "Filtros").

---

### 8. Historial de cambios local (undo/redo)
**Qué es:** Implementar un stack de historial de los últimos 20 cambios, con atajos `Ctrl+Z` (deshacer) y `Ctrl+Y` (rehacer).

**Por qué ayuda:** Borrar accidentalmente un bloque de agenda o sobreescribir el speaker asignado son errores frecuentes cuando se trabaja rápido. Actualmente el único recovery es "Actualizar" (que pierde todos los cambios no guardados).

**Cómo implementarlo:** Array `history[]` y pointer `historyIdx`. En cada `updatePrincipal()` y `updateSpeaker()`, pushear un snapshot `JSON.stringify(state)`. Limitar a 20 entradas. Event listener global en `document.addEventListener('keydown')` para Ctrl+Z/Y. Restaurar con `state = JSON.parse(history[historyIdx])` + `refreshAll()`.

---

### 9. Modo multi-día con selector de fecha
**Qué es:** Agregar soporte para gestionar los 3 días del evento por separado, con un selector de día en el nav (Día 1 / Día 2 / Día 3, o fechas reales: 12 Nov / 13 Nov / 14 Nov). Cada día tiene su propio estado de agenda guardado en GAS.

**Por qué ayuda:** Actualmente la app maneja todo como un único bloque. Para un evento de 3 días con agendas distintas por día, esto genera una tabla gigante y confusa. Sessionize y Sched siempre tienen el selector de día como elemento central.

**Cómo implementarlo:** Agregar variable `currentDay = 1`. Modificar las funciones `gasGet/gasPost` para usar sheets `Principal_D1`, `Principal_D2`, `Principal_D3`. Botones de día en el nav junto al brand. Los speakers son compartidos entre días (una sola sheet `Speakers`).

---

### 10. Vista de ocupación horaria (heatmap de carga por hora)
**Qué es:** Una mini-visualización debajo de la barra de progreso que muestra una barra segmentada donde cada franja de 30 minutos está coloreada según cuántos stages tienen speaker en ese horario (0 = negro, 9 = verde brillante).

**Por qué ayuda:** Permite detectar "horas valle" donde muchos stages están vacíos, y "horas pico" donde hay máxima actividad. Útil para distribuir charlas ancla (keynotes, paneles grandes) en los momentos de mayor audiencia esperada.

**Cómo implementarlo:** Función `buildHeatmap()` que divide el día en franjas de 30 min y cuenta, por cada franja, cuántos stages tienen al menos un speaker en ese momento. Renderizar como un `div` con N celdas inline-block, coloreadas con interpolación de color (negro → verde) según el count.

---

## Sección 2: Ideas de lógica/negocio

### Reglas de negocio útiles

**RN-01: Buffer mínimo entre charlas del mismo speaker**
Un speaker no puede tener dos charlas con menos de 30 minutos de diferencia (tiempo de traslado entre stages, descanso, idas al baño). La app debe calcular automáticamente `fin_charla_A + 30 <= inicio_charla_B` para cada speaker y marcar en rojo las violaciones.

**RN-02: Speaker no puede estar en dos stages al mismo tiempo**
Ya existe detección de conflictos simultáneos, pero solo en el mismo bloque de agenda. Debe refinarse para detectar solapamientos parciales (una charla de 45 min en Stage 1 que arranca a las 14:00 y otra en Stage 3 que arranca a las 14:20).

**RN-03: Límite de charlas por speaker por día**
Un speaker no debería tener más de 3 intervenciones por día (salvo AMA y paneles donde comparte protagonismo). Alertar cuando un speaker supera ese umbral.

**RN-04: Speakers VIP / keynote no pueden estar en el primer o último slot**
Para garantizar que los keynotes tengan el slot "ancla" del día (ej: 10:00–10:30 o 18:00–18:30), crear una categoría `keynote` que sólo puede asignarse a ciertos slots marcados como "premium".

**RN-05: Balance de género y diversidad por stage**
Calcular el ratio de speakers por género/empresa/país por stage y alertar si un stage tiene más del 80% de un solo grupo. Requiere agregar campo `pais` y `genero` a los speakers.

**RN-06: Speaker confirmado ≠ speaker briefeado**
Distinguir entre "confirmó asistencia" y "recibió el briefing completo (logística, técnica, timing)". Agregar estado `briefeado` al pipeline y mostrar alerta si quedan speakers confirmados sin briefear a menos de 7 días del evento.

---

### Alertas automáticas

| Alerta | Disparador | Severidad |
|--------|-----------|-----------|
| Conflicto simultáneo | Mismo speaker en 2+ stages al mismo tiempo | Alta (rojo) |
| Buffer insuficiente | Menos de 30 min entre charlas del mismo speaker | Media (naranja) |
| Stage sin speaker | Bloque de agenda con stage vacío a menos de 14 días | Media (naranja) |
| Speaker sin contacto | Speaker confirmado sin email ni teléfono | Baja (amarillo) |
| Exceso de charlas | Speaker con 4+ charlas en un día | Media (naranja) |
| Agenda sin cerrar | Más del 20% de bloques libres 30 días antes del evento | Alta (rojo) |
| Duplicado de tema | Mismo tema exacto en dos charlas distintas | Baja (amarillo) |

Implementación: función `runAlerts()` que retorna array de `{msg, severity, link}`. Mostrar en un panel `🔔 Alertas` dentro del tab Resumen, o como badge en el nav.

---

### Métricas y KPIs del evento

**Métricas de agenda:**
- % de bloques asignados (total y por stage)
- % de bloques con speaker confirmado vs total de bloques
- Tiempo total de contenido vs tiempo disponible por día
- Distribución por tipo de contenido (Charlas / Paneles / Talleres / Breaks)
- Duración promedio de charlas por stage

**Métricas de speakers:**
- Total de speakers por estado (pipeline funnel)
- Ratio confirmados/invitados (tasa de conversión)
- Speakers con más de 1 charla asignada
- Speakers confirmados sin brief asignado (stage o tema vacío)
- Speakers sin datos de contacto
- Cobertura geográfica (si se agrega campo país)

**Visualizaciones recomendadas:**
- Funnel chart del pipeline de speakers (Invitado → Pendiente → Confirmado → Briefeado)
- Pie chart de tipos de contenido
- Bar chart de charlas por stage
- Timeline de actividad del equipo (quién editó qué y cuándo) — requiere audit log en GAS

---

## Sección 3: Ideas inspiradas en Trello/CRM

### Adaptación del concepto de tarjetas al contexto de speakers

Cada speaker es una "tarjeta" que contiene:
- **Header:** Nombre, foto, tipo (Speaker / Empresa / Sponsor)
- **Tags:** Temas como chips de color
- **Estado:** Badge de pipeline con color
- **Asignaciones:** Lista de slots con stage + horario + tema
- **Checklist:** Brief recibido / Viaje confirmado / Acceso al backstage / Material enviado
- **Historial:** Log de cambios del equipo (fecha + usuario + acción)
- **Adjuntos:** Link a foto de perfil, presentación, bio oficial

### Pipeline de gestión de speakers (estados)

```
📩 INVITADO
   └── Se envió invitación. Speaker fue contactado por primera vez.
       Campos clave: fecha de contacto, quién lo invitó.

⏳ PENDIENTE
   └── Speaker recibió la invitación pero aún no respondió.
       Acción: seguimiento automático a los 5 días.

✅ CONFIRMADO
   └── Speaker aceptó participar.
       Campos clave: fecha de confirmación, slot asignado.

📋 BRIEFEADO
   └── Recibió el documento de briefing (logística, timing, técnica).
       Acción: solicitar confirmación de lectura.

🎯 LISTO
   └── Todo en orden: confirmó briefing, envió bio, foto, presentación.
       Es el estado "verde" final para el equipo.

❌ NO APROBADO
   └── Se descartó (no cumplía perfil, no respondió, canceló).
       Mantener en lista para historial.
```

### Flujo de trabajo del equipo organizador

**Semana 1–8 antes del evento (fase de captación):**
1. Identificar speakers potenciales → agregar como "Invitado"
2. Enviar invitación → mover a "Pendiente"
3. Seguimiento cada 5 días con recordatorio automático (exportar lista de "Pendientes > 5 días")
4. Al confirmar → asignar stage y horario tentativo → mover a "Confirmado"

**Semana 1–4 antes del evento (fase de producción):**
5. Enviar briefing completo → mover a "Briefeado"
6. Solicitar bio, foto HD, presentación
7. Confirmar requerimientos técnicos (slides en PDF, video intro, etc.)
8. Al tener todo → mover a "Listo"

**Semana del evento:**
9. Dashboard de "Listos vs Confirmados" para ver gaps urgentes
10. Lista de speakers "en tránsito" con datos de vuelo/hotel
11. Check-in en el evento (botón "Llegó" en la tarjeta del speaker)

### Vistas recomendadas inspiradas en Trello

| Vista | Descripción | Eje X | Eje Y |
|-------|-------------|-------|-------|
| Pipeline | Kanban por estado | Columnas = estados | Tarjetas = speakers |
| Por Stage | Qué speakers van a cada stage | Columnas = stages | Tarjetas = speakers |
| Por Día | Agenda de un día específico | Columnas = stages | Filas = horarios |
| Mi lista | Speakers asignados a mí (para trabajo en equipo) | — | Lista personal |

---

## Sección 4: Ideas técnicas

### Optimizaciones para 400+ speakers

**Virtualización de lista (virtual scrolling)**
Con 400 speakers en la tabla, el DOM tiene 400 × 11 columnas = 4,400 elementos. Esto puede volverse lento.
- Implementar scroll virtual simple: calcular cuántas filas caben en el viewport (`clientHeight / rowHeight`), renderizar solo esas + buffer de 10 arriba/abajo.
- Librería sugerida (sin dependencias): implementar con `IntersectionObserver` o cálculo manual de `scrollTop`.
- Alternativa pragmática: paginación simple de 50 speakers por página con navegación.

**Debounce en búsqueda y filtros**
Cualquier input de búsqueda o filtro debe tener `debounce` de 200ms antes de re-renderizar la tabla, para evitar renders en cada keystroke.

```javascript
function debounce(fn, ms) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
const filterSpeakers = debounce(() => renderSpeakers(), 200);
```

**Índice de búsqueda pre-computado**
Al cargar los speakers, construir un índice plano:
```javascript
const spIndex = state.speakers.map(s =>
  [s.nombre, s.temas, s.empresa, s.notas].join(' ').toLowerCase()
);
```
Buscar sobre `spIndex[i].includes(q)` es mucho más rápido que re-evaluar cada campo en cada render.

**Lazy load de tabs**
Los tabs de Resumen, Kanban e Ideas no deben calcularse al cargar la página. Usar un flag `tabRendered.resumen = false` y calcularlo solo al primer `switchTab('resumen')`.

**Worker para detección de conflictos**
Para 400+ speakers y 200+ bloques de agenda, el algoritmo de detección de conflictos puede correr en un `Web Worker` para no bloquear el hilo principal:
```javascript
const worker = new Worker('conflicts-worker.js');
worker.postMessage({ speakers: state.speakers, agenda: state.principal });
worker.onmessage = e => renderConflicts(e.data);
```

---

### Exportación útil

**Export 1: PDF de agenda pública por día**
- Formato: grilla de 9 stages × horarios, con los nombres de los speakers y temas.
- Implementación: usar `window.print()` con un `@media print` específico que renderiza una tabla limpia (sin controles de edición).
- Agregar header con logo, fecha y nombre del stage.

**Export 2: CSV completo de speakers**
- Todos los campos: nombre, tipo, estado, stage, temas, contacto, redes, empresa, notas.
- Implementación: función `exportCSV()` que convierte `state.speakers` a CSV con `encodeURIComponent`.

```javascript
function exportCSV() {
  const headers = ['Nombre','Tipo','Estado','Stage','Temas','Contacto','X','IG','Empresa','Notas'];
  const rows = state.speakers.map(s =>
    [s.nombre,s.tipo,s.estado,s.stages,s.temas,s.contacto,s.x,s.ig,s.empresa,s.notas]
    .map(v => `"${String(v||'').replace(/"/g,'""')}"`)
  );
  const csv = [headers,...rows].map(r=>r.join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent('﻿' + csv);
  a.download = 'speakers_labitconf2026.csv';
  a.click();
}
```

**Export 3: JSON de agenda para app/web pública**
- Exportar `state.principal` + nombres de speakers completos (con bio, foto) como JSON estructurado.
- Útil para alimentar la web pública del evento o una app móvil.
- Formato: `{ days: [ { date, slots: [ { time, duration, stage, speaker, topic, bio } ] } ] }`

**Export 4: Lista de briefing por speaker (texto/WhatsApp)**
- Para cada speaker confirmado, generar un texto formateado:
  ```
  Hola [Nombre]! 🎙️
  Tu charla en LABITCONF 2026:
  📅 Día 1 — Viernes 13 Nov
  ⏰ 14:30 hs (30 min)
  🎪 Stage: Bitcoin Stage
  📝 Tema: Lightning Network para developers
  ```
- Botón "Copiar" por speaker o "Exportar todos" como archivo `.txt`.

**Export 5: Agenda en iCal (.ics)**
- Generar un archivo `.ics` con todos los slots como eventos de calendario.
- Permite que el equipo y los speakers importen la agenda a Google Calendar / Outlook.
- Implementación: construir el texto `.ics` manualmente (es un formato de texto simple).

---

### Shortcuts de teclado para navegación rápida

| Shortcut | Acción |
|----------|--------|
| `Ctrl+K` | Abrir command palette / búsqueda global |
| `Ctrl+S` | Guardar la sección activa (equivalente al botón 💾) |
| `Ctrl+Z` | Deshacer último cambio |
| `Ctrl+Y` | Rehacer |
| `Ctrl+1` | Ir a tab Agenda |
| `Ctrl+2` | Ir a tab Speakers |
| `Ctrl+3` | Ir a tab Resumen |
| `Ctrl+4` | Ir a tab Ideas |
| `Ctrl+N` | Agregar nueva fila en la tab activa |
| `Escape` | Cerrar cualquier dropdown o modal abierto |
| `Alt+↑/↓` | Mover la fila seleccionada de agenda hacia arriba/abajo |
| `F5` | Actualizar datos desde el servidor (sin recargar página) |

**Implementación base:**
```javascript
document.addEventListener('keydown', e => {
  const activeTab = document.querySelector('.tab-btn.active')?.textContent;
  if (e.ctrlKey || e.metaKey) {
    switch(e.key) {
      case 's': e.preventDefault(); 
        if (activeTab?.includes('Agenda')) savePrincipal();
        else if (activeTab?.includes('Speakers')) saveSpeakers();
        break;
      case 'k': e.preventDefault(); openCommandPalette(); break;
      case 'z': e.preventDefault(); undo(); break;
      case 'y': e.preventDefault(); redo(); break;
      case '1': e.preventDefault(); switchTab('principal'); break;
      case '2': e.preventDefault(); switchTab('speakers'); break;
      case '3': e.preventDefault(); switchTab('resumen'); break;
    }
  }
  if (e.key === 'Escape') closeAllDropdownsAndModals();
});
```

---

### Otras mejoras técnicas

**Auto-save cada 3 minutos**
```javascript
setInterval(() => {
  if (dirty.principal) savePrincipal();
  if (dirty.speakers) saveSpeakers();
}, 3 * 60 * 1000);
```
Mostrar un indicador "Guardado automáticamente a las 14:32" en el nav.

**Modo offline con localStorage como cache**
Si el fetch a GAS falla, cargar desde `localStorage.getItem('labitconf_cache_principal')`. Al reconectar, mostrar banner "Trabajando en modo offline — los cambios se sincronizarán al reconectar".

**Detección de conflictos en tiempo real**
Cada vez que se asigna un speaker a un slot, ejecutar inmediatamente la función de detección de conflictos y mostrar una advertencia inline (no solo en el tab Resumen). Ej: al seleccionar "Javier López" para Stage 3 a las 14:00, y ese speaker ya tiene Stage 7 a las 14:00, mostrar un tooltip rojo instantáneo.

**Importación desde Google Sheets / CSV**
Botón "Importar CSV" que acepta un archivo `.csv` con columnas definidas (nombre, email, tema, stage solicitado) y lo procesa con `FileReader` en el cliente, sin subir al servidor.

**Validación de campos en tiempo real**
- Email con regex simple al perder el foco en el campo contacto
- Tiempo de inicio/fin con formato HH:MM
- Nombre con mínimo 2 caracteres
- Mostrar borde rojo + tooltip de error en lugar de `alert()`

**Optimistic UI para guardado**
En lugar de esperar la respuesta de GAS para actualizar la UI (que puede tardar 1-2 segundos), asumir que el guardado fue exitoso y mostrar el toast de confirmación inmediatamente. Revertir solo si hay error real.

**Modo oscuro/claro toggle**
La app ya usa variables CSS para todos los colores. Agregar un botón 🌙/☀️ en el nav que cambie una clase `body.light` con las variables redefinidas para modo claro. Guardar preferencia en `localStorage`.

---

## Priorización sugerida

### Alta prioridad (impacto alto, esfuerzo medio)
1. Export CSV de speakers (1-2 hs de trabajo)
2. Atajos de teclado básicos: Ctrl+S, Ctrl+K, Ctrl+1/2/3 (2-3 hs)
3. Filtros de agenda por stage/tipo (2-3 hs)
4. Alertas automáticas básicas: conflictos con buffer de 30 min (3-4 hs)
5. Auto-save cada 3 minutos (1 hs)

### Media prioridad (impacto alto, esfuerzo alto)
6. Vista Kanban de speakers (4-6 hs)
7. Multi-día: selector Día 1/2/3 (6-8 hs)
8. Command palette Ctrl+K (4-5 hs)
9. Timeline visual / grilla horaria (8-12 hs)

### Baja prioridad (nice to have)
10. Export PDF agenda (3-4 hs)
11. Export iCal (2-3 hs)
12. Drawer de briefing por speaker (4-5 hs)
13. Historial undo/redo (4-6 hs)
14. Virtual scrolling (6-8 hs)
