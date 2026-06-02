// ═══════════════════════════════════════════════════════════════════
// LABITCONF-speakers — Google Apps Script Backend
// Pegar en: Extensions > Apps Script > Deploy > Web App
// Execute as: Me | Who has access: Anyone
//
// Hojas requeridas en el Sheet:
//   Principal / Principal_D1..D4
//     [tipo, s1_speaker, s1_tema, s1_dur, s1_inicio, s1_fin, s1_durExt, …, s9_durExt]
//     Total: 1 + 9×6 = 55 columnas
//
//   Speakers (31 columnas — campos fijos + JSON para expansivos):
//   [0]  nombre
//   [1]  apellido
//   [2]  tipo              (Speaker/Moderador/Panelista/Empresa/Sponsor)
//   [3]  apodo
//   [4]  cargo
//   [5]  pais
//   [6]  idioma            (es | en | es,en)
//   [7]  mail
//   [8]  website
//   [9]  foto              (URL)
//   [10] whatsapp
//   [11] telegram
//   [12] signal
//   [13] linkedin
//   [14] x
//   [15] instagram
//   [16] empresa
//   [17] notas             (uso interno)
//   [18] bio
//   [19] eventos_anteriores
//   [20] primera_vez       (si/no)
//   [21] disponible_podcast(si/no)
//   [22] trae_empresa      (si/no)
//   [23] dias_asiste       (CSV: oct29,oct30,oct31,nov1)
//   [24] temas             ← JSON array de objetos:
//                            [{titulo, abstract, descripcion, tags,
//                              nivel, formatos, duracion, panel}, ...]
//   [25] temas_estado      (CSV alineado con temas: disponible,confirmado,…)
//   [26] estado            (disponible/rechazado/revisar/manual/confirmado)
//   [27] oct29             ('' / 'si' / 'no')
//   [28] oct30
//   [29] oct31
//   [30] nov1
//
//   SpeakerManual — [nombre, notas, fecha]
//   Ideas         — [titulo, prop, detalle]
// ═══════════════════════════════════════════════════════════════════

const SHEET_ID = '1QkhngaOt2rnh1r4KrERrPI1163COxrxFWK-BM7REWEY';

// ── GET ─────────────────────────────────────────────────────────────
function doGet(e) {
  try {
    const sheet = (e.parameter.sheet || 'Principal').trim();
    if (e.parameter.action === 'get_version') {
      const props = PropertiesService.getScriptProperties();
      return respond({ ok:true, sheet, version: props.getProperty('version_'+sheet)||'0' });
    }
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const validSheets = [
      'Principal','Principal_D1','Principal_D2','Principal_D3','Principal_D4',
      'Speakers','SpeakerManual','Ideas'
    ];
    if (!validSheets.includes(sheet)) return respond({ error:'Hoja no permitida: '+sheet }, 400);
    const ws = ss.getSheetByName(sheet);
    if (!ws) {
      if (sheet === 'SpeakerManual') return respond({ ok:true, sheet, data:[['nombre','notas','fecha']], version:'0' });
      if (sheet.startsWith('Principal_D')) return respond({ ok:true, sheet, data:[], version:'0' });
      return respond({ error:'Hoja no encontrada: '+sheet }, 404);
    }
    const props = PropertiesService.getScriptProperties();
    return respond({ ok:true, sheet, data: ws.getDataRange().getValues(), version: props.getProperty('version_'+sheet)||'0' });
  } catch(err) { return respond({ error:err.message }, 500); }
}

// ── POST ────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const { sheet, action, data, rowIndex, key } = payload;
    const ss = SpreadsheetApp.openById(SHEET_ID);

    if (action === 'speaker_form_submit') return handleFormSubmit(ss, payload.data || {});

    const props = PropertiesService.getScriptProperties();
    const writeKey = props.getProperty('write_key');
    if (writeKey && key !== writeKey) return respond({ error:'Clave incorrecta', code:401 });

    const validSheets = [
      'Principal','Principal_D1','Principal_D2','Principal_D3','Principal_D4',
      'Speakers','SpeakerManual','Ideas'
    ];
    if (!validSheets.includes(sheet)) return respond({ error:'Hoja no permitida: '+sheet }, 400);

    let ws = ss.getSheetByName(sheet);
    if (!ws) {
      if (sheet === 'SpeakerManual') { ws = ss.insertSheet(sheet); ws.appendRow(['nombre','notas','fecha']); }
      else if (sheet.startsWith('Principal_D')) {
        ws = ss.insertSheet(sheet);
        const src = ss.getSheetByName('Principal');
        if (src) { const h = src.getRange(1,1,1,src.getLastColumn()).getValues(); ws.getRange(1,1,1,h[0].length).setValues(h); }
      } else return respond({ error:'Hoja no encontrada: '+sheet }, 404);
    }

    const newVersion = Date.now().toString();
    if      (action === 'append')      { ws.appendRow(data); }
    else if (action === 'update')      { ws.getRange(rowIndex,1,1,data.length).setValues([data]); }
    else if (action === 'delete')      { ws.deleteRow(rowIndex); }
    else if (action === 'replace_all') {
      const last = ws.getLastRow();
      if (last > 1) ws.deleteRows(2, last-1);
      if (data && data.length > 0) ws.getRange(2,1,data.length,data[0].length).setValues(data);
    } else return respond({ error:'Acción desconocida: '+action }, 400);

    props.setProperty('version_'+sheet, newVersion);
    return respond({ ok:true, action, version:newVersion });
  } catch(err) { return respond({ error:err.message }, 500); }
}

// ── FORM SUBMIT PÚBLICO ─────────────────────────────────────────────
function handleFormSubmit(ss, d) {
  const nombre = String(d.nombre || '').trim();
  if (!nombre) return respond({ ok:false, error:'El nombre es requerido.' });

  const spSheet = ss.getSheetByName('Speakers');
  if (!spSheet) return respond({ ok:false, error:'No existe la pestaña "Speakers".' });

  // Buscar por mail — si existe, fusionar en lugar de duplicar
  const mail = String(d.mail || '').trim().toLowerCase();
  if (mail) {
    const allData = spSheet.getDataRange().getValues();
    for (let i = 1; i < allData.length; i++) {
      if (String(allData[i][8]||'').trim().toLowerCase() === mail) {
        // ── FUSIONAR con fila existente ──
        const existing = allData[i];

        // Temas existentes
        let existingTemas = [];
        const col24 = String(existing[24]||'').trim();
        if (col24.startsWith('[')) {
          try { existingTemas = JSON.parse(col24); } catch(e) { existingTemas = []; }
        }

        // Temas nuevos del form — agregar solo los que no existen (por título)
        const existingTitles = existingTemas.map(t => String(t.titulo||'').trim().toLowerCase());
        temasArr.forEach(t => {
          const titulo = String(t.titulo||'').trim();
          if (titulo && !existingTitles.includes(titulo.toLowerCase())) {
            existingTemas.push(t);
          }
        });

        // temas_estado: extender para nuevos temas
        let temasEstadoArr = String(existing[25]||'').split(',').map(x=>x.trim()).filter(Boolean);
        while (temasEstadoArr.length < existingTemas.length) temasEstadoArr.push('disponible');

        // Fusionar campos simples: actualizar solo si estaba vacío
        const merged = [...existing];
        const newRow = row; // el row ya construido
        [0,1,2,3,4,5,6,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,27,28,29,30].forEach(col => {
          if (!String(merged[col]||'').trim() && String(newRow[col]||'').trim()) {
            merged[col] = newRow[col];
          }
        });
        // Siempre actualizar temas (fusionados) y temas_estado
        merged[24] = JSON.stringify(existingTemas);
        merged[25] = temasEstadoArr.join(',');

        // Actualizar la fila en el sheet (fila i+1 en Sheets es 1-based)
        spSheet.getRange(i+1, 1, 1, merged.length).setValues([merged]);
        PropertiesService.getScriptProperties().setProperty('version_Speakers', Date.now().toString());
        return respond({ ok:true, actualizado:true, msg:'Tus datos fueron actualizados. ¡Gracias!' });
      }
    }
  }

  // Temas → JSON array
  const temasArr = Array.isArray(d.temas) ? d.temas.slice(0,4).filter(t=>(t.titulo||'').trim()) : [];
  const temasJson = JSON.stringify(temasArr.map(t => ({
    titulo:      String(t.titulo      ||'').trim(),
    abstract:    String(t.abstract    ||'').trim(),
    descripcion: String(t.descripcion ||'').trim(),
    tags:        String(t.tags        ||'').trim(),
    nivel:       String(t.nivel       ||'').trim(),
    formatos:    String(t.formatos    ||'').trim(),
    duracion:    String(t.duracion    ||'30').trim(),
    panel:       String(t.panel       ||'no').trim(),
  })));

  // temas_estado: un 'disponible' por tema
  const temasEstado = Array(temasArr.length || 1).fill('disponible').join(',');

  // Días del form → columnas oct29..nov1
  const diasArr = String(d.dias||'').split(',').map(x=>x.trim());
  const hasDia = d => diasArr.includes(d) ? 'si' : '';

  const row = [
    counter,                                         // [0]  postulacion_num
    nombre,                                          // [1]  nombre
    String(d.apellido          ||'').trim(),         // [2]  apellido
    (String(d.confname||'').trim() || (nombre+' '+String(d.apellido||'').trim()).trim()), // [3] confname (default nombre+apellido)
    'speaker',                                       // [4]  tipo (siempre speaker)
    String(d.cargo             ||'').trim(),         // [5]  cargo
    String(d.pais              ||'').trim(),         // [6]  pais
    String(d.idioma            ||'es').trim(),       // [7]  idioma
    mail,                                            // [8]  mail
    String(d.website           ||'').trim(),         // [9]  website
    String(d.foto              ||'').trim(),         // [10] foto
    String(d.whatsapp          ||'').trim(),         // [11] whatsapp (ya viene como wa.me/...)
    String(d.telegram          ||'').trim(),         // [12] telegram (ya viene como t.me/...)
    String(d.signal            ||'').trim(),         // [13] signal
    String(d.linkedin          ||'').trim(),         // [14] linkedin
    String(d.x                 ||'').trim().replace(/^@/,''), // [15] x
    String(d.instagram         ||'').trim().replace(/^@/,''), // [16] instagram
    String(d.github            ||'').trim(),         // [17] github
    String(d.nostr             ||'').trim(),         // [18] nostr
    String(d.empresa           ||'').trim(),         // [19] empresa
    '',                                              // [20] notas — vacío
    String(d.bio               ||'').trim(),         // [21] bio
    String(d.eventos_anteriores||'').trim(),         // [22] eventos_anteriores
    String(d.primera_vez       ||'').trim(),         // [23] primera_vez
    String(d.disponible_podcast||'').trim(),         // [24] disponible_podcast
    String(d.trae_empresa      ||'').trim(),         // [25] trae_empresa
    String(d.dias              ||'').trim(),         // [26] dias_asiste CSV
    String(d.disponible_desde  ||'').trim(),         // [27] disponible_desde
    String(d.disponible_hasta  ||'').trim(),         // [28] disponible_hasta
    temasJson,                                       // [29] temas JSON
    temasEstado,                                     // [30] temas_estado
    'disponible',                                    // [31] estado
    hasDia('oct29'),                                 // [32]
    hasDia('oct30'),                                 // [33]
    hasDia('oct31'),                                 // [34]
    hasDia('nov1'),                                  // [35]
  ];

  // Número correlativo de postulación
  const counter = parseInt(PropertiesService.getScriptProperties().getProperty('postulacion_counter')||'0') + 1;
  PropertiesService.getScriptProperties().setProperty('postulacion_counter', String(counter));

  // Asegurar fila de headers si el sheet está vacío
  if (spSheet.getLastRow() === 0) {
    spSheet.appendRow([
      'postulacion_num','nombre','apellido','confname','tipo','cargo','pais','idioma','mail',
      'website','foto','whatsapp','telegram','signal','linkedin','x','instagram',
      'github','nostr','empresa','notas','bio','eventos_anteriores',
      'primera_vez','disponible_podcast','trae_empresa','dias_asiste',
      'disponible_desde','disponible_hasta',
      'temas','temas_estado','estado','oct29','oct30','oct31','nov1'
    ]);
  }

  spSheet.appendRow(row);
  PropertiesService.getScriptProperties().setProperty('version_Speakers', Date.now().toString());
  return respond({ ok:true, msg:'Speaker registrado. ¡Gracias por inscribirte!' });
}

// ── BACKUP DIARIO ───────────────────────────────────────────────────
function backupPrincipal() {
  const ss  = SpreadsheetApp.openById(SHEET_ID);
  const src = ss.getSheetByName('Principal');
  if (!src) return;
  const fecha = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm');
  ss.getSheets().forEach(sh => {
    if (!sh.getName().startsWith('Backup_')) return;
    const d = new Date(sh.getName().replace('Backup_','').split('_')[0]);
    if ((new Date()-d)/86400000 > 7) ss.deleteSheet(sh);
  });
  src.copyTo(ss).setName('Backup_'+fecha);
}
function installBackupTrigger() {
  ScriptApp.getProjectTriggers().filter(t=>t.getHandlerFunction()==='backupPrincipal').forEach(t=>ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('backupPrincipal').timeBased().everyDays(1).atHour(3).create();
}

// ── HELPER ──────────────────────────────────────────────────────────
function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
