// ═══════════════════════════════════════════════════════════════════
// LABITCONF-speakers — Google Apps Script Backend
// Pegar en: Extensions > Apps Script > pegar todo > Deploy > Web App
// Execute as: Me | Who has access: Anyone
//
// Hojas requeridas en el Sheet:
//   Principal     — [tipo, s1_speaker, s1_tema, s1_dur, s1_inicio, s1_fin, s1_durExt, s2_speaker, …, s9_durExt]
//                    Total: 1 + 9×6 = 55 columnas por fila de datos
//   Speakers      — [nombre, tipo, mail, whatsapp, telegram, signal, linkedin, stages, temas, empresa, notas, estado]
//   SpeakerManual — [nombre, notas, fecha]
//   Ideas         — [titulo, prop, detalle]
// ═══════════════════════════════════════════════════════════════════

const SHEET_ID = '1QkhngaOt2rnh1r4KrERrPI1163COxrxFWK-BM7REWEY';

// ── GET — Leer hojas / versiones ────────────────────────────────────
function doGet(e) {
  try {
    const sheet = (e.parameter.sheet || 'Principal').trim();

    // Acción especial: devolver versión actual de una hoja
    if (e.parameter.action === 'get_version') {
      const props = PropertiesService.getScriptProperties();
      const version = props.getProperty('version_' + sheet) || '0';
      return respond({ ok: true, sheet, version });
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);

    // Acción especial: importar respuestas del Form → Speakers
    if (e.parameter.action === 'import_form_speakers') {
      const result = importarFormSpeakers(ss);
      return respond(result);
    }

    // Hojas válidas
    const validSheets = ['Principal', 'Speakers', 'SpeakerManual', 'Ideas'];
    if (!validSheets.includes(sheet)) {
      return respond({ error: 'Hoja no permitida: ' + sheet }, 400);
    }

    const ws = ss.getSheetByName(sheet);
    if (!ws) {
      // Si es SpeakerManual y no existe, devolver estructura vacía (se crea al primer guardado)
      if (sheet === 'SpeakerManual') {
        return respond({ ok: true, sheet, data: [['nombre', 'notas', 'fecha']], version: '0' });
      }
      return respond({ error: 'Hoja no encontrada: ' + sheet }, 404);
    }

    const data = ws.getDataRange().getValues();
    const props = PropertiesService.getScriptProperties();
    const version = props.getProperty('version_' + sheet) || '0';

    return respond({ ok: true, sheet, data, version });
  } catch(err) {
    return respond({ error: err.message }, 500);
  }
}

// ── POST — Escribir / modificar hojas ──────────────────────────────
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const { sheet, action, data, rowIndex, key } = payload;

    // Verificar clave de escritura
    const props = PropertiesService.getScriptProperties();
    const writeKey = props.getProperty('write_key');
    if (writeKey && key !== writeKey) {
      return respond({ error: 'Clave incorrecta', code: 401 });
    }

    // Hojas permitidas para escritura
    const validSheets = ['Principal', 'Speakers', 'SpeakerManual', 'Ideas'];
    if (!validSheets.includes(sheet)) {
      return respond({ error: 'Hoja no permitida: ' + sheet }, 400);
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);
    let ws = ss.getSheetByName(sheet);

    // Crear hoja SpeakerManual si no existe
    if (!ws) {
      if (sheet === 'SpeakerManual') {
        ws = ss.insertSheet(sheet);
        ws.appendRow(['nombre', 'notas', 'fecha']);
      } else {
        return respond({ error: 'Hoja no encontrada: ' + sheet }, 404);
      }
    }

    if (action === 'append') {
      ws.appendRow(data);
      const newVersion = Date.now().toString();
      props.setProperty('version_' + sheet, newVersion);
      return respond({ ok: true, action, version: newVersion });
    }

    if (action === 'update') {
      // rowIndex es 1-based (fila 1 = headers, datos desde fila 2)
      const r = ws.getRange(rowIndex, 1, 1, data.length);
      r.setValues([data]);
      const newVersion = Date.now().toString();
      props.setProperty('version_' + sheet, newVersion);
      return respond({ ok: true, action, version: newVersion });
    }

    if (action === 'delete') {
      ws.deleteRow(rowIndex);
      const newVersion = Date.now().toString();
      props.setProperty('version_' + sheet, newVersion);
      return respond({ ok: true, action, version: newVersion });
    }

    if (action === 'replace_all') {
      // Reemplaza todos los datos (excepto headers) con el nuevo array
      const lastRow = ws.getLastRow();
      if (lastRow > 1) ws.deleteRows(2, lastRow - 1);
      if (data && data.length > 0) {
        ws.getRange(2, 1, data.length, data[0].length).setValues(data);
      }

      const newVersion = Date.now().toString();
      props.setProperty('version_' + sheet, newVersion);
      return respond({ ok: true, action, version: newVersion });
    }

    return respond({ error: 'Acción desconocida: ' + action }, 400);

  } catch(err) {
    return respond({ error: err.message }, 500);
  }
}

// ── IMPORTAR RESPUESTAS DEL FORM → SPEAKERS ────────────────────────
// Reemplazar con el ID del Sheet de respuestas del Form
const FORM_RESP_SHEET_ID = 'REEMPLAZAR_CON_ID_DEL_SHEET_DE_RESPUESTAS';

function importarFormSpeakers(labSS) {
  let respSS;
  try {
    respSS = SpreadsheetApp.openById(FORM_RESP_SHEET_ID);
  } catch(e) {
    return { ok: false, error: 'No puedo abrir el Sheet de respuestas: ' + e.message };
  }

  const respSheet  = respSS.getSheets()[0];
  const allData    = respSheet.getDataRange().getValues();
  const totalRows  = allData.length;

  const props        = PropertiesService.getScriptProperties();
  const lastImported = parseInt(props.getProperty('form_last_imported_row') || '1');

  if (totalRows <= lastImported) {
    return { ok: true, imported: 0, msg: 'No hay respuestas nuevas para importar.' };
  }

  const spSheet = labSS.getSheetByName('Speakers');
  if (!spSheet) return { ok: false, error: 'No existe la pestaña "Speakers".' };

  const newRows  = allData.slice(lastImported);
  const imported = [];

  newRows.forEach(r => {
    // Columnas esperadas del Google Form (ajustar según el form real):
    // [0] Timestamp
    // [1] Nombre completo
    // [2] Tipo (speaker / empresa / sponsor)
    // [3] Mail
    // [4] WhatsApp
    // [5] Telegram
    // [6] Signal
    // [7] LinkedIn
    // [8] Empresa / Referencia
    // [9] Tema(s)
    // [10] Notas / Comentarios
    const nombre    = String(r[1]  || '').trim();
    const tipo      = String(r[2]  || 'speaker').trim().toLowerCase();
    const mail      = String(r[3]  || '').trim();
    const whatsapp  = String(r[4]  || '').trim();
    const telegram  = String(r[5]  || '').trim();
    const signal    = String(r[6]  || '').trim();
    const linkedin  = String(r[7]  || '').trim();
    const empresa   = String(r[8]  || '').trim();
    const temas     = String(r[9]  || '').trim();
    const notas     = String(r[10] || '').trim();

    if (!nombre) return;

    // Formato fila Speakers (nuevo schema):
    // nombre, tipo, mail, whatsapp, telegram, signal, linkedin, stages(vacío), temas, empresa, notas, estado
    spSheet.appendRow([nombre, tipo, mail, whatsapp, telegram, signal, linkedin, '', temas, empresa, notas, '']);
    imported.push(nombre);
  });

  props.setProperty('form_last_imported_row', String(totalRows));
  props.setProperty('version_Speakers', Date.now().toString());

  return {
    ok: true,
    imported: imported.length,
    msg: imported.length > 0
      ? '✅ ' + imported.length + ' speaker(s) importados: ' + imported.join(', ')
      : 'No se importó nada (filas sin nombre).'
  };
}

// ── BACKUP DIARIO ───────────────────────────────────────────────────
function backupPrincipal() {
  const ss  = SpreadsheetApp.openById(SHEET_ID);
  const src = ss.getSheetByName('Principal');
  if (!src) return;

  const fecha  = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm');
  const nombre = 'Backup_' + fecha;

  // Borrar backups de más de 7 días
  ss.getSheets().forEach(sh => {
    if (!sh.getName().startsWith('Backup_')) return;
    const partes  = sh.getName().replace('Backup_', '').split('_');
    const fechaSh = new Date(partes[0]);
    const dias    = (new Date() - fechaSh) / 86400000;
    if (dias > 7) ss.deleteSheet(sh);
  });

  src.copyTo(ss).setName(nombre);
}

// Correr UNA vez desde el editor para instalar el trigger diario
function installBackupTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'backupPrincipal')
    .forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('backupPrincipal')
    .timeBased()
    .everyDays(1)
    .atHour(3)
    .create();
}

// ── HELPER ──────────────────────────────────────────────────────────
function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
