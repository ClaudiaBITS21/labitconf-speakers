// ═══════════════════════════════════════════════════════════════════
// LABITCONF-speakers — Google Apps Script Backend
// Pegar en: Extensions > Apps Script > pegar todo > Deploy > Web App
// Execute as: Me | Who has access: Anyone
//
// Hojas requeridas en el Sheet:
//   Principal / Principal_D1..D4
//     [tipo, s1_speaker, s1_tema, s1_dur, s1_inicio, s1_fin, s1_durExt, s2_speaker, …, s9_durExt]
//     Total: 1 + 9×6 = 55 columnas por fila
//
//   Speakers (62 columnas):
//   ── Datos personales ──
//   [0]  nombre
//   [1]  tipo              (Speaker/Moderador/Panelista/Empresa/Sponsor)
//   [2]  apodo
//   [3]  pais
//   [4]  idioma            (es | en | es,en)
//   [5]  mail
//   [6]  whatsapp
//   [7]  telegram
//   [8]  signal
//   [9]  linkedin
//   [10] x
//   [11] instagram
//   [12] empresa
//   [13] notas             (uso interno)
//   [14] bio
//   [15] eventos_anteriores
//   ── Estado / scheduling ──
//   [16] tema1
//   [17] detalle1
//   [18] tema2
//   [19] detalle2
//   [20] tema3
//   [21] detalle3
//   [22] tema4
//   [23] detalle4
//   [24] temas_estado      (CSV: disponible,confirmado,…)
//   [25] estado            (disponible/rechazado/revisar/manual/confirmado)
//   [26] oct29
//   [27] oct30
//   [28] oct31
//   [29] nov1
//   ── Campos nuevos del form (agregados al final para no romper índices) ──
//   [30] apellido
//   [31] cargo
//   [32] website
//   [33] foto              (URL)
//   [34] primera_vez       (si/no)
//   [35] disponible_podcast(si/no)
//   [36] trae_empresa      (si/no)
//   [37] dias_asiste       (CSV: oct29,oct30,oct31,nov1)
//   ── Por tema: abstract, tags, nivel, formatos, duracion, panel ──
//   [38] abstract1
//   [39] tags1
//   [40] nivel1
//   [41] formatos1
//   [42] duracion1
//   [43] panel1
//   [44] abstract2
//   [45] tags2
//   [46] nivel2
//   [47] formatos2
//   [48] duracion2
//   [49] panel2
//   [50] abstract3
//   [51] tags3
//   [52] nivel3
//   [53] formatos3
//   [54] duracion3
//   [55] panel3
//   [56] abstract4
//   [57] tags4
//   [58] nivel4
//   [59] formatos4
//   [60] duracion4
//   [61] panel4
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
      return respond({ ok: true, sheet, version: props.getProperty('version_' + sheet) || '0' });
    }
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const validSheets = [
      'Principal','Principal_D1','Principal_D2','Principal_D3','Principal_D4',
      'Speakers','SpeakerManual','Ideas'
    ];
    if (!validSheets.includes(sheet)) return respond({ error: 'Hoja no permitida: ' + sheet }, 400);
    const ws = ss.getSheetByName(sheet);
    if (!ws) {
      if (sheet === 'SpeakerManual') return respond({ ok:true, sheet, data:[['nombre','notas','fecha']], version:'0' });
      if (sheet.startsWith('Principal_D')) return respond({ ok:true, sheet, data:[], version:'0' });
      return respond({ error: 'Hoja no encontrada: ' + sheet }, 404);
    }
    const props = PropertiesService.getScriptProperties();
    return respond({ ok:true, sheet, data: ws.getDataRange().getValues(), version: props.getProperty('version_'+sheet)||'0' });
  } catch(err) { return respond({ error: err.message }, 500); }
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
    if (action === 'append')      { ws.appendRow(data); }
    else if (action === 'update') { ws.getRange(rowIndex,1,1,data.length).setValues([data]); }
    else if (action === 'delete') { ws.deleteRow(rowIndex); }
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

  // Anti-duplicado por mail
  const mail = String(d.mail || '').trim().toLowerCase();
  if (mail) {
    const allData = spSheet.getDataRange().getValues();
    for (let i = 1; i < allData.length; i++) {
      if (String(allData[i][5]||'').trim().toLowerCase() === mail) {
        return respond({ ok:true, duplicado:true, msg:'Ya existe un speaker con ese mail.' });
      }
    }
  }

  // Parsear temas (hasta 4)
  const temas = Array.isArray(d.temas) ? d.temas.slice(0,4) : [];
  const t = i => temas[i] || {};
  const nTemas = temas.filter(x => (x.titulo||'').trim()).length || 1;
  const temasEstado = Array(nTemas).fill('disponible').join(',');

  // Parsear días del form → columnas oct29..nov1
  const diasArr = String(d.dias || '').split(',').map(x=>x.trim());
  const hasDia = d => diasArr.includes(d) ? 'si' : '';

  const row = [
    // ── Cols 0-15 ──
    nombre,
    String(d.tipo||'speaker').trim(),
    String(d.apodo||'').trim(),
    String(d.pais||'').trim(),
    String(d.idioma||'es').trim(),
    mail,
    String(d.whatsapp||'').trim(),
    String(d.telegram||'').trim(),
    String(d.signal||'').trim(),
    String(d.linkedin||'').trim(),
    String(d.x||'').trim().replace(/^@/,''),
    String(d.instagram||'').trim().replace(/^@/,''),
    '',                                          // [12] empresa — vacío al inscribirse
    '',                                          // [13] notas — vacío al inscribirse
    String(d.bio||'').trim(),
    String(d.eventos_anteriores||'').trim(),
    // ── Cols 16-29 (temas + estado + días) ──
    String(t(0).titulo||'').trim(),              // [16] tema1
    String(t(0).descripcion||'').trim(),         // [17] detalle1
    String(t(1).titulo||'').trim(),              // [18] tema2
    String(t(1).descripcion||'').trim(),         // [19] detalle2
    String(t(2).titulo||'').trim(),              // [20] tema3
    String(t(2).descripcion||'').trim(),         // [21] detalle3
    String(t(3).titulo||'').trim(),              // [22] tema4
    String(t(3).descripcion||'').trim(),         // [23] detalle4
    temasEstado,                                  // [24] temas_estado
    'disponible',                                 // [25] estado
    hasDia('oct29'),                              // [26] oct29
    hasDia('oct30'),                              // [27] oct30
    hasDia('oct31'),                              // [28] oct31
    hasDia('nov1'),                               // [29] nov1
    // ── Cols 30-37 (nuevos campos personales) ──
    String(d.apellido||'').trim(),               // [30] apellido
    String(d.cargo||'').trim(),                  // [31] cargo
    String(d.website||'').trim(),                // [32] website
    String(d.foto||'').trim(),                   // [33] foto (URL)
    String(d.primera_vez||'').trim(),            // [34] primera_vez
    String(d.disponible_podcast||'').trim(),     // [35] disponible_podcast
    String(d.trae_empresa||'').trim(),           // [36] trae_empresa
    String(d.dias||'').trim(),                   // [37] dias_asiste (CSV)
    // ── Cols 38-61 (nuevos campos por tema) ──
    String(t(0).abstract||'').trim(),            // [38] abstract1
    String(t(0).tags||'').trim(),                // [39] tags1
    String(t(0).nivel||'').trim(),               // [40] nivel1
    String(t(0).formatos||'').trim(),            // [41] formatos1
    String(t(0).duracion||'30').trim(),          // [42] duracion1
    String(t(0).panel||'no').trim(),             // [43] panel1
    String(t(1).abstract||'').trim(),            // [44] abstract2
    String(t(1).tags||'').trim(),                // [45] tags2
    String(t(1).nivel||'').trim(),               // [46] nivel2
    String(t(1).formatos||'').trim(),            // [47] formatos2
    String(t(1).duracion||'').trim(),            // [48] duracion2
    String(t(1).panel||'').trim(),               // [49] panel2
    String(t(2).abstract||'').trim(),            // [50] abstract3
    String(t(2).tags||'').trim(),                // [51] tags3
    String(t(2).nivel||'').trim(),               // [52] nivel3
    String(t(2).formatos||'').trim(),            // [53] formatos3
    String(t(2).duracion||'').trim(),            // [54] duracion3
    String(t(2).panel||'').trim(),               // [55] panel3
    String(t(3).abstract||'').trim(),            // [56] abstract4
    String(t(3).tags||'').trim(),                // [57] tags4
    String(t(3).nivel||'').trim(),               // [58] nivel4
    String(t(3).formatos||'').trim(),            // [59] formatos4
    String(t(3).duracion||'').trim(),            // [60] duracion4
    String(t(3).panel||'').trim(),               // [61] panel4
  ];

  spSheet.appendRow(row);
  PropertiesService.getScriptProperties().setProperty('version_Speakers', Date.now().toString());
  return respond({ ok:true, msg:'Speaker registrado. ¡Gracias por inscribirte!' });
}

// ── BACKUP DIARIO ───────────────────────────────────────────────────
function backupPrincipal() {
  const ss  = SpreadsheetApp.openById(SHEET_ID);
  const src = ss.getSheetByName('Principal');
  if (!src) return;
  const fecha  = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm');
  ss.getSheets().forEach(sh => {
    if (!sh.getName().startsWith('Backup_')) return;
    const d = new Date(sh.getName().replace('Backup_','').split('_')[0]);
    if ((new Date() - d) / 86400000 > 7) ss.deleteSheet(sh);
  });
  src.copyTo(ss).setName('Backup_' + fecha);
}
function installBackupTrigger() {
  ScriptApp.getProjectTriggers().filter(t=>t.getHandlerFunction()==='backupPrincipal').forEach(t=>ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('backupPrincipal').timeBased().everyDays(1).atHour(3).create();
}

// ── HELPER ──────────────────────────────────────────────────────────
function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
