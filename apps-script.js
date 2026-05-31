// ═══════════════════════════════════════════════════════════════════
// LABITCONF-speakers — Google Apps Script Backend
// Pegar en: Extensions > Apps Script > pegar todo > Deploy > Web App
// Execute as: Me | Who has access: Anyone
//
// Hojas requeridas en el Sheet:
//   Principal     — [tipo, s1_speaker, s1_tema, s1_dur, s1_inicio, s1_fin, s1_durExt, s2_speaker, …, s9_durExt]
//                    Total: 1 + 9×6 = 55 columnas por fila de datos
//   Principal_D1..D4 — misma estructura (4 días: Oct 29 / Oct 30 / Oct 31 / Nov 1)
//
//   Speakers (30 columnas):
//   [0]  nombre
//   [1]  tipo              (Speaker / Moderador / Panelista / Empresa / Sponsor)
//   [2]  apodo
//   [3]  pais
//   [4]  idioma            (es / en)
//   [5]  mail
//   [6]  whatsapp
//   [7]  telegram
//   [8]  signal
//   [9]  linkedin
//   [10] x                 (Twitter/X handle)
//   [11] instagram         (handle)
//   [12] empresa
//   [13] notas
//   [14] bio
//   [15] eventos_anteriores
//   [16] tema1
//   [17] detalle1
//   [18] tema2
//   [19] detalle2
//   [20] tema3
//   [21] detalle3
//   [22] tema4
//   [23] detalle4
//   [24] temas_estado      (CSV: 'disponible,disponible,…' — alineado con temas)
//   [25] estado            (disponible / rechazado / revisar / manual / confirmado)
//   [26] oct29             ('' / 'si' / 'no')
//   [27] oct30             ('' / 'si' / 'no')
//   [28] oct31             ('' / 'si' / 'no')
//   [29] nov1              ('' / 'si' / 'no')
//
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

    // Hojas válidas para lectura
    const validSheets = [
      'Principal', 'Principal_D1', 'Principal_D2', 'Principal_D3', 'Principal_D4',
      'Speakers', 'SpeakerManual', 'Ideas'
    ];
    if (!validSheets.includes(sheet)) {
      return respond({ error: 'Hoja no permitida: ' + sheet }, 400);
    }

    const ws = ss.getSheetByName(sheet);
    if (!ws) {
      if (sheet === 'SpeakerManual') {
        return respond({ ok: true, sheet, data: [['nombre', 'notas', 'fecha']], version: '0' });
      }
      // Para hojas de día opcionales devolver vacío en lugar de error
      if (sheet.startsWith('Principal_D')) {
        return respond({ ok: true, sheet, data: [], version: '0' });
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

    const ss = SpreadsheetApp.openById(SHEET_ID);

    // ── Endpoint público: inscripción desde el form HTML ──────────
    if (action === 'speaker_form_submit') {
      return handleFormSubmit(ss, payload.data || {});
    }

    // Verificar clave de escritura para todas las demás acciones
    const props = PropertiesService.getScriptProperties();
    const writeKey = props.getProperty('write_key');
    if (writeKey && key !== writeKey) {
      return respond({ error: 'Clave incorrecta', code: 401 });
    }

    // Hojas permitidas para escritura
    const validSheets = [
      'Principal', 'Principal_D1', 'Principal_D2', 'Principal_D3', 'Principal_D4',
      'Speakers', 'SpeakerManual', 'Ideas'
    ];
    if (!validSheets.includes(sheet)) {
      return respond({ error: 'Hoja no permitida: ' + sheet }, 400);
    }

    let ws = ss.getSheetByName(sheet);

    // Crear hoja si no existe (SpeakerManual y días)
    if (!ws) {
      if (sheet === 'SpeakerManual') {
        ws = ss.insertSheet(sheet);
        ws.appendRow(['nombre', 'notas', 'fecha']);
      } else if (sheet.startsWith('Principal_D')) {
        ws = ss.insertSheet(sheet);
        // Headers igual que Principal
        const src = ss.getSheetByName('Principal');
        if (src) {
          const headers = src.getRange(1, 1, 1, src.getLastColumn()).getValues();
          ws.getRange(1, 1, 1, headers[0].length).setValues(headers);
        }
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

// ── INSCRIPCIÓN DESDE FORM HTML PÚBLICO ────────────────────────────
function handleFormSubmit(ss, d) {
  const nombre = String(d.nombre || '').trim();
  if (!nombre) {
    return respond({ ok: false, error: 'El nombre es requerido.' });
  }

  const spSheet = ss.getSheetByName('Speakers');
  if (!spSheet) return respond({ ok: false, error: 'No existe la pestaña "Speakers".' });

  // Verificar duplicado por mail
  const mail = String(d.mail || '').trim().toLowerCase();
  if (mail) {
    const allData = spSheet.getDataRange().getValues();
    // Col [5] = mail en nuevo schema
    for (let i = 1; i < allData.length; i++) {
      const existingMail = String(allData[i][5] || '').trim().toLowerCase();
      if (existingMail && existingMail === mail) {
        return respond({
          ok: true,
          duplicado: true,
          msg: 'Ya existe un speaker registrado con ese mail. Tu inscripción fue recibida anteriormente.'
        });
      }
    }
  }

  // Extraer temas (hasta 4)
  const temas = Array.isArray(d.temas) ? d.temas.slice(0, 4) : [];
  const tema1 = temas[0] ? String(temas[0].titulo || '').trim() : '';
  const det1  = temas[0] ? String(temas[0].descripcion || '').trim() : '';
  const tema2 = temas[1] ? String(temas[1].titulo || '').trim() : '';
  const det2  = temas[1] ? String(temas[1].descripcion || '').trim() : '';
  const tema3 = temas[2] ? String(temas[2].titulo || '').trim() : '';
  const det3  = temas[2] ? String(temas[2].descripcion || '').trim() : '';
  const tema4 = temas[3] ? String(temas[3].titulo || '').trim() : '';
  const det4  = temas[3] ? String(temas[3].descripcion || '').trim() : '';

  // temas_estado: tantos 'disponible' como temas tenga
  const nTemas = temas.filter(t => (t.titulo || '').trim()).length || 1;
  const temasEstado = Array(nTemas).fill('disponible').join(',');

  // Fila nueva con schema de 30 columnas
  const row = [
    nombre,                                        // [0] nombre
    String(d.tipo || 'speaker').trim(),            // [1] tipo
    String(d.apodo || '').trim(),                  // [2] apodo
    String(d.pais || '').trim(),                   // [3] pais
    String(d.idioma || 'es').trim(),               // [4] idioma
    String(d.mail || '').trim(),                   // [5] mail
    String(d.whatsapp || '').trim(),               // [6] whatsapp
    String(d.telegram || '').trim(),               // [7] telegram
    String(d.signal || '').trim(),                 // [8] signal
    String(d.linkedin || '').trim(),               // [9] linkedin
    String(d.x || '').trim().replace(/^@/, ''),    // [10] x
    String(d.instagram || '').trim().replace(/^@/, ''), // [11] instagram
    String(d.empresa || '').trim(),                // [12] empresa
    '',                                            // [13] notas (vacío al inscribirse)
    String(d.bio || '').trim(),                    // [14] bio
    String(d.eventos_anteriores || '').trim(),     // [15] eventos_anteriores
    tema1, det1,                                   // [16-17] tema1, detalle1
    tema2, det2,                                   // [18-19] tema2, detalle2
    tema3, det3,                                   // [20-21] tema3, detalle3
    tema4, det4,                                   // [22-23] tema4, detalle4
    temasEstado,                                   // [24] temas_estado
    'disponible',                                  // [25] estado
    '', '', '', ''                                 // [26-29] oct29, oct30, oct31, nov1
  ];

  spSheet.appendRow(row);

  const props = PropertiesService.getScriptProperties();
  props.setProperty('version_Speakers', Date.now().toString());

  return respond({
    ok: true,
    msg: 'Speaker registrado correctamente. ¡Gracias por inscribirte!'
  });
}

// ── IMPORTAR RESPUESTAS DE FORM LEGACY (manual/backup) ─────────────
// El form HTML ahora postea directo vía speaker_form_submit.
// Esta función queda como importación manual desde un Google Form legacy.
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
    // Columnas esperadas (ajustar según form real):
    // [0] Timestamp [1] Nombre [2] Tipo [3] Mail [4] WhatsApp
    // [5] Telegram [6] Signal [7] LinkedIn [8] Empresa [9] Tema(s) [10] Notas
    const nombre = String(r[1] || '').trim();
    if (!nombre) return;

    const tema1   = String(r[9] || '').trim();
    const temasEstado = tema1 ? 'disponible' : '';

    const row = [
      nombre,
      String(r[2] || 'speaker').trim().toLowerCase(), // tipo
      '', '', 'es',                                    // apodo, pais, idioma
      String(r[3] || '').trim(),                       // mail
      String(r[4] || '').trim(),                       // whatsapp
      String(r[5] || '').trim(),                       // telegram
      String(r[6] || '').trim(),                       // signal
      String(r[7] || '').trim(),                       // linkedin
      '', '',                                          // x, instagram
      String(r[8] || '').trim(),                       // empresa
      String(r[10] || '').trim(),                      // notas
      '', '',                                          // bio, eventos_anteriores
      tema1, '', '', '', '', '', '', '',               // tema1..detalle4
      temasEstado,                                     // temas_estado
      'disponible',                                    // estado
      '', '', '', ''                                   // oct29..nov1
    ];

    spSheet.appendRow(row);
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
