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
//   [36] landing           ('' / 'si') — habilitado para la landing pública
//
//   SpeakerManual — [nombre, notas, fecha]
//   Ideas         — [titulo, prop, detalle, categoria]
// ═══════════════════════════════════════════════════════════════════

const SHEET_ID        = '1QkhngaOt2rnh1r4KrERrPI1163COxrxFWK-BM7REWEY';
const PHOTO_FOLDER_ID = '14pa1CpZr2ao5yoqIGPiAfaaUrDR5RcL9';
const TG_CHAT_ID      = '-5505014894'; // grupo LABITCONF_bot

function notificarTelegram(d, counter, idioma) {
  try {
    const token = PropertiesService.getScriptProperties().getProperty('telegram_bot_token');
    if (!token) return;

    const nombre   = [String(d.nombre||''), String(d.apellido||'')].filter(Boolean).join(' ');
    const confname = String(d.confname||nombre).trim();
    const pais     = String(d.pais||'').trim();
    const cargo    = String(d.cargo||'').trim();
    const empresa  = String(d.empresa||'').trim();
    const mail     = String(d.mail||'').trim();
    const bio      = String(d.bio||'').trim();
    const wa       = String(d.whatsapp||'').trim();
    const tg       = String(d.telegram||'').trim();
    const x        = String(d.x||'').trim().replace(/^@/,'');
    const li       = String(d.linkedin||'').trim();
    const gh       = String(d.github||'').trim();
    const web      = String(d.website||'').trim();
    const ig       = String(d.instagram||'').trim();
    const primera  = String(d.primera_vez||'').trim();
    const podcast  = String(d.disponible_podcast||'').trim();
    const temas    = Array.isArray(d.temas) ? d.temas.filter(t=>(t.titulo||'').trim()) : [];
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/edit#gid=1070281154';
    const bandera  = idioma === 'en' ? '🇺🇸' : '🇦🇷';

    let lines = [];
    lines.push('🎤 <b>Nuevo Speaker #' + String(counter).padStart(3,'0') + '</b> ' + bandera);
    lines.push('');
    lines.push('👤 <b>' + nombre + '</b>' + (confname !== nombre ? ' (' + confname + ')' : ''));
    if (cargo || empresa) lines.push('🏢 ' + [cargo, empresa].filter(Boolean).join(' | '));
    if (pais) lines.push('🌍 ' + pais);
    lines.push('');
    lines.push('📧 <code>' + mail + '</code>');
    if (wa)  lines.push('📱 WhatsApp: ' + wa);
    if (tg)  lines.push('💬 Telegram: ' + (tg.startsWith('@') ? tg : '@' + tg));
    if (primera === 'si') lines.push('⭐ Primera vez en LABITCONF');
    if (podcast === 'si') lines.push('🎙️ Disponible para podcast');
    lines.push('');

    if (bio) {
      lines.push('📝 <b>Bio:</b>');
      lines.push('<i>' + bio.slice(0,400) + (bio.length > 400 ? '...' : '') + '</i>');
      lines.push('');
    }

    if (temas.length > 0) {
      lines.push('🎯 <b>Tema' + (temas.length > 1 ? 's' : '') + ':</b>');
      temas.forEach((t, i) => {
        lines.push((i+1) + '. <b>' + t.titulo + '</b>');
        if (t.abstract) lines.push('   ' + t.abstract.slice(0,200));
        const meta = [t.formatos, t.duracion ? t.duracion+'min' : '', t.nivel].filter(Boolean).join(' · ');
        if (meta) lines.push('   📌 ' + meta);
      });
      lines.push('');
    }

    const redes = [];
    if (x)   redes.push('𝕏 <a href="https://x.com/' + x + '">@' + x + '</a>');
    if (li)  redes.push('💼 <a href="' + li + '">LinkedIn</a>');
    if (ig)  redes.push('📸 <a href="https://instagram.com/' + ig.replace(/^@/,'') + '">Instagram</a>');
    if (gh)  redes.push('💻 <a href="https://github.com/' + gh.replace(/^@/,'') + '">GitHub</a>');
    if (web) redes.push('🌐 <a href="' + web + '">Web</a>');
    if (redes.length > 0) { lines.push('🔗 <b>Redes:</b> ' + redes.join(' · ')); }

    const text = lines.join('\n');
    const payload = JSON.stringify({ chat_id: TG_CHAT_ID, text: text, parse_mode: 'HTML', disable_web_page_preview: true });
    UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST',
      contentType: 'application/json',
      payload: payload,
      muteHttpExceptions: true
    });
  } catch(e) { Logger.log('Telegram error: ' + e.message); }
}

// Sube una foto (base64 data URL) a Drive via REST API y devuelve URL de miniatura
function savePhotoToDrive(base64DataUrl, counter, confname) {
  try {
    const match = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return '';
    const mimeType = match[1];
    const b64Data  = match[2];
    const ext      = mimeType.includes('png') ? 'png' : 'jpg';
    const safeName = String(confname||'speaker').replace(/[^a-zA-Z0-9\-_]/g,'_').slice(0,40);
    const filename = String(counter).padStart(4,'0') + '-' + safeName + '.' + ext;
    const token    = ScriptApp.getOAuthToken();
    const bytes    = Utilities.base64Decode(b64Data);

    // 1. Subir contenido del archivo
    const uploadRes = UrlFetchApp.fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=media&fields=id',
      {
        method: 'POST',
        contentType: mimeType,
        payload: bytes,
        headers: { Authorization: 'Bearer ' + token },
        muteHttpExceptions: true
      }
    );
    const uploadJson = JSON.parse(uploadRes.getContentText());
    if (!uploadJson.id) { Logger.log('Upload error: ' + uploadRes.getContentText()); return ''; }
    const fileId = uploadJson.id;

    // 2. Actualizar nombre y mover a la carpeta
    UrlFetchApp.fetch(
      'https://www.googleapis.com/drive/v3/files/' + fileId +
      '?addParents=' + PHOTO_FOLDER_ID + '&fields=id',
      {
        method: 'PATCH',
        contentType: 'application/json',
        payload: JSON.stringify({ name: filename }),
        headers: { Authorization: 'Bearer ' + token },
        muteHttpExceptions: true
      }
    );

    // 3. Hacer público
    UrlFetchApp.fetch(
      'https://www.googleapis.com/drive/v3/files/' + fileId + '/permissions',
      {
        method: 'POST',
        contentType: 'application/json',
        payload: JSON.stringify({ role: 'reader', type: 'anyone' }),
        headers: { Authorization: 'Bearer ' + token },
        muteHttpExceptions: true
      }
    );

    return 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w400';
  } catch(e) {
    Logger.log('Error saving photo: ' + e.message);
    return '';
  }
}

// ── GET ─────────────────────────────────────────────────────────────
function doGet(e) {
  try {
    const sheet = (e.parameter.sheet || 'Principal').trim();

    // ── LANDING API (público, sin clave) ──────────────────────────
    if (e.parameter.action === 'landing') {
      return respondCors(buildLandingPayload());
    }

    if (e.parameter.action === 'get_version') {
      const props = PropertiesService.getScriptProperties();
      return respond({ ok:true, sheet, version: props.getProperty('version_'+sheet)||'0' });
    }
    if (e.parameter.action === 'get_config') {
      const props = PropertiesService.getScriptProperties();
      const raw = props.getProperty('config_stageNames');
      return respond({ ok:true, stageNames: raw ? JSON.parse(raw) : null,
        apertura: props.getProperty('config_apertura')||'',
        cierre:   props.getProperty('config_cierre')||'' });
    }
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const validSheets = [
      'Principal','Principal_D1','Principal_D2','Principal_D3','Principal_D4',
      'Stage_1','Stage_2','Stage_3','Stage_4','Stage_5','Stage_6','Stage_7','Stage_8','Stage_9',
      'Speakers','SpeakerManual','Ideas','MKT'
    ];
    if (!validSheets.includes(sheet)) return respond({ error:'Hoja no permitida: '+sheet }, 400);
    const ws = ss.getSheetByName(sheet);
    if (!ws) {
      if (sheet === 'SpeakerManual') return respond({ ok:true, sheet, data:[['nombre','notas','fecha']], version:'0' });
      if (sheet.startsWith('Principal_D')) return respond({ ok:true, sheet, data:[], version:'0' });
      if (sheet.startsWith('Stage_')) return respond({ ok:true, sheet, data:[], version:'0' });
      return respond({ error:'Hoja no encontrada: '+sheet }, 404);
    }
    const props = PropertiesService.getScriptProperties();
    return respond({ ok:true, sheet, data: ws.getDataRange().getValues(), version: props.getProperty('version_'+sheet)||'0' });
  } catch(err) { return respond({ error:err.message }, 500); }
}

// ── LANDING BUILDER ──────────────────────────────────────────────────
function buildLandingPayload() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const props = PropertiesService.getScriptProperties();

  // Stage names guardados en config
  let stageNames = ['Stage 1','Stage 2','Stage 3','Stage 4','Stage 5','Stage 6','Stage 7','Stage 8','Stage 9'];
  try {
    const raw = props.getProperty('config_stageNames');
    if (raw) stageNames = JSON.parse(raw);
  } catch(e) {}

  // Leer Speakers — filtrar confirmados con landing=si
  const spSheet = ss.getSheetByName('Speakers');
  if (!spSheet) return { ok:false, error:'Sin hoja Speakers' };
  const spData = spSheet.getDataRange().getValues();
  const spHeaders = spData[0];

  const confirmed = [];
  for (let i = 1; i < spData.length; i++) {
    const r = spData[i];
    const estado  = String(r[31]||'').trim().toLowerCase();
    const landing = String(r[36]||'').trim().toLowerCase();
    if (estado !== 'confirmado' || landing !== 'si') continue;

    let temas = [];
    try { temas = JSON.parse(String(r[29]||'[]')); } catch(e) {}
    const temasEstado = String(r[30]||'').split(',').map(x=>x.trim());
    // Solo temas confirmados
    const temasConf = temas.filter((_,idx) => (temasEstado[idx]||'disponible') === 'confirmado');

    confirmed.push({
      _nombre: String(r[1]||'').trim(),
      nombre:      String(r[1]||'').trim(),
      apellido:    String(r[2]||'').trim(),
      confname:    String(r[3]||'').trim(),
      tipo:        String(r[4]||'').trim(),
      cargo:       String(r[5]||'').trim(),
      pais:        String(r[6]||'').trim(),
      idioma:      String(r[7]||'').trim(),
      foto:        String(r[10]||'').trim(),
      linkedin:    String(r[14]||'').trim(),
      x:           String(r[15]||'').trim(),
      instagram:   String(r[16]||'').trim(),
      github:      String(r[17]||'').trim(),
      nostr:       String(r[18]||'').trim(),
      empresa:     String(r[19]||'').trim(),
      bio:         String(r[21]||'').trim(),
      website:     String(r[9]||'').trim(),
      temas:       temasConf,
      bloques:     []
    });
  }

  if (!confirmed.length) return { ok:true, speakers:[], generated_at: new Date().toISOString() };

  // Indexar speakers por nombre para lookup rápido
  const byName = {};
  confirmed.forEach(sp => { byName[sp._nombre.toLowerCase()] = sp; });

  // Leer Stage_1..Stage_9 y extraer bloques
  const DIA_LABEL = { D2:'Oct 30', D3:'Oct 31' };
  for (let si = 1; si <= 9; si++) {
    const ws = ss.getSheetByName('Stage_'+si);
    if (!ws) continue;
    const rows = ws.getDataRange().getValues();
    const stageName = stageNames[si-1] || ('Stage '+si);
    const stageKey  = 's'+si;
    let currentDia  = '';

    for (let ri = 1; ri < rows.length; ri++) {
      const row = rows[ri];
      const tipo    = String(row[0]||'').trim();
      if (tipo === 'DIA') { currentDia = String(row[1]||'').trim(); continue; }
      const speakerRaw = String(row[1]||'').trim();
      if (!speakerRaw) continue;
      // Puede ser multi-speaker separado por |
      speakerRaw.split('|').map(n=>n.trim()).filter(Boolean).forEach(nombre => {
        const sp = byName[nombre.toLowerCase()];
        if (!sp) return;
        sp.bloques.push({
          stage_key:   stageKey,
          stage_name:  stageName,
          dia:         currentDia,
          dia_label:   DIA_LABEL[currentDia] || currentDia,
          tipo:        tipo,
          tema:        String(row[2]||'').trim(),
          inicio:      String(row[4]||'').trim(),
          fin:         String(row[5]||'').trim()
        });
      });
    }
  }

  // Limpiar campo interno _nombre antes de devolver
  confirmed.forEach(sp => { delete sp._nombre; });

  return {
    ok: true,
    generated_at: new Date().toISOString(),
    speakers: confirmed
  };
}

function respondCors(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── BOT TELEGRAM POLLING ─────────────────────────────────────────────
// Ejecutar setupTelegramPolling UNA VEZ para activar el trigger cada minuto
function setupTelegramPolling() {
  // Eliminar triggers previos de pollTelegram
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'pollTelegram')
    .forEach(t => ScriptApp.deleteTrigger(t));
  // Crear trigger cada minuto
  ScriptApp.newTrigger('pollTelegram').timeBased().everyMinutes(1).create();
  Logger.log('✅ Polling activado — el bot responderá comandos cada ~1 minuto');
}

function pollTelegram() {
  const token = PropertiesService.getScriptProperties().getProperty('telegram_bot_token');
  if (!token) return;

  const props  = PropertiesService.getScriptProperties();
  const offset = Number(props.getProperty('tg_offset') || '0');

  const r = UrlFetchApp.fetch(
    `https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=0&limit=20`,
    { muteHttpExceptions: true }
  );
  const data = JSON.parse(r.getContentText());
  if (!data.ok || !data.result.length) return;

  for (const update of data.result) {
    handleTelegramCommand(update);
    props.setProperty('tg_offset', String(update.update_id + 1));
  }
}

// ── BOT TELEGRAM COMMANDS ────────────────────────────────────────────
function handleTelegramCommand(update) {
  const msg   = update.message || update.channel_post;
  if (!msg || !msg.text) return;
  const chatId = String(msg.chat.id);
  const text   = msg.text.trim();
  const token  = PropertiesService.getScriptProperties().getProperty('telegram_bot_token');
  if (!token) return;

  const ss   = SpreadsheetApp.openById(SHEET_ID);
  const ws   = ss.getSheetByName('Speakers');
  const rows = ws.getDataRange().getValues().slice(1).filter(r => r[0]);

  function tgSend(txt) {
    UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST', contentType: 'application/json; charset=utf-8',
      payload: JSON.stringify({ chat_id: chatId, text: txt, parse_mode: 'HTML' }),
      muteHttpExceptions: true
    });
  }

  if (text.startsWith('/stats')) {
    const total = rows.length;
    const confirmados = rows.filter(r => String(r[31]||'').toLowerCase() === 'confirmado').length;
    const pendientes  = total - confirmados;
    tgSend(`📊 <b>LABITCONF 2026 — Stats</b>\n\n👥 Total speakers: <b>${total}</b>\n✅ Confirmados: <b>${confirmados}</b>\n⏳ Pendientes: <b>${pendientes}</b>`);

  } else if (text.startsWith('/lista')) {
    const lines = rows.map(r => `#${String(r[0]).padStart(3,'0')} ${r[3]||r[1]+' '+r[2]} — ${r[19]||'—'}`);
    const chunks = [];
    let chunk = '📋 <b>Speakers LABITCONF 2026</b>\n\n';
    for (const l of lines) {
      if ((chunk + l + '\n').length > 3800) { chunks.push(chunk); chunk = ''; }
      chunk += l + '\n';
    }
    if (chunk) chunks.push(chunk);
    chunks.forEach(c => tgSend(c));

  } else if (text.startsWith('/speaker')) {
    const num = text.split(' ')[1];
    const row = rows.find(r => String(r[0]) === String(num));
    if (!row) { tgSend('❌ Speaker #' + num + ' no encontrado'); return; }
    const nombre = row[3] || row[1] + ' ' + row[2];
    const x  = row[15] ? `\n𝕏 @${String(row[15]).replace(/^@/,'')}` : '';
    const li = row[14] ? `\n💼 ${row[14]}` : '';
    tgSend(`👤 <b>#${String(row[0]).padStart(3,'0')} ${nombre}</b>\n${row[5]||''} @ ${row[19]||''}\n📍 ${row[6]||''}\n📧 ${row[8]||''}${x}${li}\n\n${String(row[21]||'').slice(0,400)}`);

  } else if (text.startsWith('/pendientes')) {
    const pend = rows.filter(r => String(r[31]||'').toLowerCase() !== 'confirmado');
    const lines = pend.map(r => `#${String(r[0]).padStart(3,'0')} ${r[3]||r[1]+' '+r[2]}`);
    tgSend(`⏳ <b>Pendientes (${lines.length})</b>\n\n` + lines.join('\n'));

  } else if (text.startsWith('/buscar')) {
    const q = text.slice(7).trim().toLowerCase();
    if (!q) { tgSend('Uso: /buscar nombre'); return; }
    const found = rows.filter(r => `${r[1]} ${r[2]} ${r[3]} ${r[19]}`.toLowerCase().includes(q));
    if (!found.length) { tgSend('🔍 No se encontró "' + q + '"'); return; }
    const lines = found.map(r => `#${String(r[0]).padStart(3,'0')} ${r[3]||r[1]+' '+r[2]} — ${r[19]||'—'}`);
    tgSend(`🔍 Resultados para "<b>${q}</b>":\n\n` + lines.join('\n'));

  } else if (text.startsWith('/ayuda') || text.startsWith('/start')) {
    tgSend(`🤖 <b>LABITCONF Bot — Comandos</b>\n\n/stats — Totales y confirmados\n/lista — Todos los speakers\n/speaker 25 — Datos de un speaker\n/pendientes — Sin confirmar\n/buscar Bruno — Buscar por nombre`);
  }
}

// ── POST ────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);

    // Detectar si es un update de Telegram
    if (payload.update_id !== undefined) {
      handleTelegramCommand(payload);
      return ContentService.createTextOutput('ok');
    }

    const { sheet, action, data, rowIndex, key } = payload;
    const ss = SpreadsheetApp.openById(SHEET_ID);

    if (action === 'speaker_form_submit') return handleFormSubmit(ss, payload.data || {});

    const props = PropertiesService.getScriptProperties();
    const writeKey = props.getProperty('write_key');
    if (writeKey && key !== writeKey) return respond({ error:'Clave incorrecta', code:401 });

    if (action === 'set_config') {
      if (data && Array.isArray(data.stageNames)) props.setProperty('config_stageNames', JSON.stringify(data.stageNames));
      if (data && data.apertura) props.setProperty('config_apertura', data.apertura);
      if (data && data.cierre)   props.setProperty('config_cierre',   data.cierre);
      return respond({ ok:true });
    }

    const validSheets = [
      'Principal','Principal_D1','Principal_D2','Principal_D3','Principal_D4',
      'Stage_1','Stage_2','Stage_3','Stage_4','Stage_5','Stage_6','Stage_7','Stage_8','Stage_9',
      'Speakers','SpeakerManual','Ideas','MKT'
    ];
    if (!validSheets.includes(sheet)) return respond({ error:'Hoja no permitida: '+sheet }, 400);

    let ws = ss.getSheetByName(sheet);
    if (!ws) {
      if (sheet === 'SpeakerManual') { ws = ss.insertSheet(sheet); ws.appendRow(['nombre','notas','fecha']); }
      else if (sheet === 'MKT') { ws = ss.insertSheet(sheet); ws.appendRow(['num','publicado','plataforma','fecha','notas']); }
      else if (sheet.startsWith('Stage_')) { ws = ss.insertSheet(sheet); ws.appendRow(['tipo','speaker','tema','dur','inicio','fin','durExt','descripcion','empresa','moderador','nivel','tags','visible_web','notas']); }
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

  const mail = String(d.mail || '').trim().toLowerCase();

  // ── 1. Temas → JSON (definir ANTES de usarlo en el merge) ──
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
  const temasEstado = Array(temasArr.length || 1).fill('disponible').join(',');

  // ── 2. Número correlativo ──
  const counter = parseInt(PropertiesService.getScriptProperties().getProperty('postulacion_counter')||'0') + 1;
  PropertiesService.getScriptProperties().setProperty('postulacion_counter', String(counter));

  // ── 3. Días ──
  const diasArr = String(d.dias||'').split(',').map(x=>x.trim());
  const hasDia = key => diasArr.includes(key) ? 'si' : '';

  // ── 4. Flodesk + Telegram PRIMERO — antes de cualquier operación lenta (foto/Drive) ──
  if (mail) {
    const textoDetectar = [
      String(d.bio || ''),
      String(d.temas && d.temas[0] ? d.temas[0].abstract || d.temas[0].titulo : '')
    ].join(' ').trim();
    const idioma = detectarIdioma(textoDetectar);
    llamarFlodesk(mail, nombre, String(d.apellido || '').trim(), idioma === 'en' ? FLODESK_SEGMENT_EN : FLODESK_SEGMENT_ES);
    notificarTelegram(d, counter, idioma);
  }

  // ── 5. Foto a Drive (puede ser lenta — va después de Flodesk) ──
  const fotoRaw = String(d.foto||'').trim();
  const confnameForFile = String(d.confname||d.nombre||'speaker').trim();
  const fotoUrl = fotoRaw.startsWith('data:') ? savePhotoToDrive(fotoRaw, counter, confnameForFile) : fotoRaw;

  // ── 6. Row completo ──
  const row = [
    counter,                                                                              // [0]  postulacion_num
    nombre,                                                                               // [1]  nombre
    String(d.apellido          ||'').trim(),                                              // [2]  apellido
    (String(d.confname||'').trim() || (nombre+' '+String(d.apellido||'').trim()).trim()), // [3]  confname
    'speaker',                                                                            // [4]  tipo
    String(d.cargo             ||'').trim(),                                              // [5]  cargo
    String(d.pais              ||'').trim(),                                              // [6]  pais
    String(d.idioma            ||'es').trim(),                                            // [7]  idioma
    mail,                                                                                 // [8]  mail
    String(d.website           ||'').trim(),                                              // [9]  website
    fotoUrl,                                                                              // [10] foto
    String(d.whatsapp          ||'').trim(),                                              // [11] whatsapp
    String(d.telegram          ||'').trim(),                                              // [12] telegram
    String(d.signal            ||'').trim(),                                              // [13] signal
    String(d.linkedin          ||'').trim(),                                              // [14] linkedin
    String(d.x                 ||'').trim().replace(/^@/,''),                             // [15] x
    String(d.instagram         ||'').trim().replace(/^@/,''),                             // [16] instagram
    String(d.github            ||'').trim(),                                              // [17] github
    String(d.nostr             ||'').trim(),                                              // [18] nostr
    String(d.empresa           ||'').trim(),                                              // [19] empresa
    '',                                                                                   // [20] notas
    String(d.bio               ||'').trim(),                                              // [21] bio
    String(d.eventos_anteriores||'').trim(),                                              // [22] eventos_anteriores
    String(d.primera_vez       ||'').trim(),                                              // [23] primera_vez
    String(d.disponible_podcast||'').trim(),                                              // [24] disponible_podcast
    String(d.trae_empresa      ||'').trim(),                                              // [25] trae_empresa
    String(d.dias              ||'').trim(),                                              // [26] dias_asiste CSV
    String(d.disponible_desde  ||'').trim(),                                              // [27] disponible_desde
    String(d.disponible_hasta  ||'').trim(),                                              // [28] disponible_hasta
    temasJson,                                                                            // [29] temas JSON
    temasEstado,                                                                          // [30] temas_estado
    'disponible',                                                                         // [31] estado
    hasDia('oct29'),                                                                      // [32]
    hasDia('oct30'),                                                                      // [33]
    hasDia('oct31'),                                                                      // [34]
    hasDia('nov1'),                                                                       // [35]
  ];

  // ── 7. Anti-duplicado por mail: fusionar si ya existe ──
  if (mail) {
    const allData = spSheet.getDataRange().getValues();
    for (let i = 1; i < allData.length; i++) {
      if (String(allData[i][8]||'').trim().toLowerCase() === mail) {
        const existing = allData[i];
        let existingTemas = [];
        try { existingTemas = JSON.parse(String(existing[29]||'[]')); } catch(e) {}
        const existingTitles = existingTemas.map(t => String(t.titulo||'').toLowerCase());
        temasArr.forEach(t => {
          const titulo = String(t.titulo||'').trim();
          if (titulo && !existingTitles.includes(titulo.toLowerCase())) existingTemas.push(t);
        });
        let temasEstadoArr = String(existing[30]||'').split(',').map(x=>x.trim()).filter(Boolean);
        while (temasEstadoArr.length < existingTemas.length) temasEstadoArr.push('disponible');
        const merged = [...existing];
        [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,21,22,23,24,25,26,27,28].forEach(col => {
          if (!String(merged[col]||'').trim() && String(row[col]||'').trim()) merged[col] = row[col];
        });
        merged[29] = JSON.stringify(existingTemas);
        merged[30] = temasEstadoArr.join(',');
        spSheet.getRange(i+1, 1, 1, merged.length).setValues([merged]);
        PropertiesService.getScriptProperties().setProperty('version_Speakers', Date.now().toString());
        return respond({ ok:true, actualizado:true, msg:'Tus datos fueron actualizados. ¡Gracias!' });
      }
    }
  }

  // ── 8. Nuevo speaker ──
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

// ── TEST DRIVE ──────────────────────────────────────────────────────
function testDriveAccess() {
  const fotoTest = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAARC' +
    'AACAAQMBEQACEQEDEQH/xABIAAEAAAAAAAAAAAAAAAAAAAAHEAEAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAAAAAAAAAAAAAAAAAgEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k=';
  const url = savePhotoToDrive(fotoTest, 9999, 'test-drive');
  if (url) {
    Logger.log('✅ Foto subida OK: ' + url);
  } else {
    Logger.log('❌ savePhotoToDrive devolvió vacío — revisar logs anteriores');
  }
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

// ── FLODESK ─────────────────────────────────────────────────────────
const FLODESK_SEGMENT_ES = '6a46ec15f305fe60db28f7fd';
const FLODESK_SEGMENT_EN = '6a46ed923ef4b125b4d45e6d';

function llamarFlodesk(email, nombre, apellido, segmentoId) {
  try {
    const apiKey = PropertiesService.getScriptProperties().getProperty('flodesk_api_key');
    if (!apiKey || !email) return;

    const b64 = Utilities.base64Encode(apiKey + ':');
    const headers = { Authorization: 'Basic ' + b64, 'Content-Type': 'application/json' };

    // Remover del segmento primero (para que el workflow se dispare de nuevo)
    UrlFetchApp.fetch('https://api.flodesk.com/v1/subscribers/' + encodeURIComponent(email) + '/segments/remove', {
      method: 'POST',
      headers: headers,
      payload: JSON.stringify({ segment_ids: [segmentoId] }),
      muteHttpExceptions: true
    });

    // Upsert subscriber + agregar al segmento (dispara el workflow)
    UrlFetchApp.fetch('https://api.flodesk.com/v1/subscribers', {
      method: 'POST',
      headers: headers,
      payload: JSON.stringify({ email: email, first_name: nombre || '', last_name: apellido || '', segment_ids: [segmentoId] }),
      muteHttpExceptions: true
    });

    Logger.log('Flodesk OK: ' + email + ' → ' + segmentoId);
  } catch(e) {
    Logger.log('Flodesk error: ' + e.message);
  }
}

function detectarIdioma(texto) {
  try {
    const lang = LanguageApp.detectLanguage(texto || '');
    return lang === 'en' ? 'en' : 'es';
  } catch(e) {
    return 'es';
  }
}

// ── NOTIFICACIÓN TELEGRAM MANUAL ────────────────────────────────────
// Cambiar NUM por el número del speaker y ejecutar desde el editor GAS
function notificarTelegramManual() {
  const NUM = 25; // ← cambiar por el número de speaker deseado (Bruno = 25)

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const ws = ss.getSheetByName('Speakers');
  const data = ws.getDataRange().getValues();

  const row = data.find(r => String(r[0]) === String(NUM));
  if (!row) { Logger.log('Speaker #' + NUM + ' no encontrado'); return; }

  const d = {
    nombre:   row[1], apellido: row[2], confname: row[3],
    cargo:    row[5], pais:     row[6], idioma:   row[7],
    mail:     row[8], website:  row[9],
    whatsapp: row[11], telegram: row[12],
    linkedin: row[14], x:        row[15], instagram: row[16],
    empresa:  row[19], bio:      row[21],
    temas:    (() => { try { return JSON.parse(row[29] || '[]'); } catch(e) { return []; } })()
  };

  const textoDetectar = [String(d.bio || ''), String(d.temas && d.temas[0] ? d.temas[0].abstract || d.temas[0].titulo : '')].join(' ').trim();
  const idioma = detectarIdioma(textoDetectar);

  notificarTelegram(d, NUM, idioma);
  Logger.log('✅ Notificación enviada para #' + NUM + ' ' + (d.confname || d.nombre));
}

// ── FOTOS DESDE REDES SOCIALES (unavatar.io) ────────────────────────
// Ejecutar manualmente desde el editor GAS: Run → rellenarFotosDesdePerfil
// Busca foto en orden: X → LinkedIn → Instagram. Descarga, guarda en Drive, actualiza Sheet.
function rellenarFotosDesdePerfil() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const ws = ss.getSheetByName('Speakers');
  const data = ws.getDataRange().getValues();
  const token = ScriptApp.getOAuthToken();

  let actualizados = 0;
  let sinFuente = 0;

  for (let i = 1; i < data.length; i++) {
    const row    = data[i];
    const num    = row[0];
    const foto   = String(row[10] || '').trim();
    const nombre = String(row[3] || row[1] || 'speaker').trim();

    if (foto) { Logger.log('#' + num + ' ' + nombre + ' — ya tiene foto ✓'); continue; }

    // Extraer handles/slugs de cada red
    const xRaw  = String(row[15] || '').trim();
    const liRaw = String(row[14] || '').trim();
    const igRaw = String(row[16] || '').trim();

    const xHandle = xRaw.replace(/^@/,'').replace(/^https?:\/\/(x|twitter)\.com\//,'').split(/[/?]/)[0];
    const liSlug  = liRaw.replace(/^https?:\/\/(www\.|[a-z]{2}\.)?linkedin\.com\/in\//,'').split(/[/?]/)[0];
    const igHandle = igRaw.replace(/^@/,'').replace(/^https?:\/\/(www\.)?instagram\.com\//,'').split(/[/?]/)[0];

    // Orden de prioridad
    const fuentes = [];
    if (xHandle)  fuentes.push({ red: 'x',        handle: xHandle });
    if (liSlug)   fuentes.push({ red: 'linkedin',  handle: liSlug });
    if (igHandle) fuentes.push({ red: 'instagram', handle: igHandle });

    if (!fuentes.length) {
      Logger.log('#' + num + ' ' + nombre + ' — sin redes sociales, no se puede obtener foto');
      sinFuente++;
      continue;
    }

    let fotoGuardada = '';

    for (const { red, handle } of fuentes) {
      try {
        const avatarUrl = 'https://unavatar.io/' + red + '/' + encodeURIComponent(handle) + '?fallback=404';
        Logger.log('#' + num + ' ' + nombre + ' — probando ' + red + '/@' + handle + '...');

        const imgRes = UrlFetchApp.fetch(avatarUrl, { muteHttpExceptions: true, followRedirects: true });
        if (imgRes.getResponseCode() !== 200) {
          Logger.log('  HTTP ' + imgRes.getResponseCode() + ' en ' + red + ', probando siguiente...');
          continue;
        }

        const contentType = imgRes.getHeaders()['Content-Type'] || 'image/jpeg';
        // Descartar si devuelve un placeholder SVG o HTML (no es imagen real)
        if (contentType.includes('svg') || contentType.includes('html')) {
          Logger.log('  Respuesta no es imagen (' + contentType + '), probando siguiente...');
          continue;
        }

        const bytes    = imgRes.getContent();
        const ext      = contentType.includes('png') ? 'png' : 'jpg';
        const safeName = String(nombre).replace(/[^a-zA-Z0-9\-_]/g,'_').slice(0,40);
        const filename = String(num).padStart(4,'0') + '-' + safeName + '.' + ext;

        // Subir a Drive
        const uploadRes = UrlFetchApp.fetch(
          'https://www.googleapis.com/upload/drive/v3/files?uploadType=media&fields=id',
          { method:'POST', contentType: contentType, payload: bytes, headers:{ Authorization:'Bearer '+token }, muteHttpExceptions:true }
        );
        const uploadJson = JSON.parse(uploadRes.getContentText());
        if (!uploadJson.id) { Logger.log('  Error subiendo a Drive: ' + uploadRes.getContentText()); continue; }
        const fileId = uploadJson.id;

        // Mover a carpeta y renombrar
        UrlFetchApp.fetch(
          'https://www.googleapis.com/drive/v3/files/' + fileId + '?addParents=' + PHOTO_FOLDER_ID + '&fields=id',
          { method:'PATCH', contentType:'application/json', payload: JSON.stringify({ name: filename }), headers:{ Authorization:'Bearer '+token }, muteHttpExceptions:true }
        );

        // Hacer pública
        UrlFetchApp.fetch(
          'https://www.googleapis.com/drive/v3/files/' + fileId + '/permissions',
          { method:'POST', contentType:'application/json', payload: JSON.stringify({ role:'reader', type:'anyone' }), headers:{ Authorization:'Bearer '+token }, muteHttpExceptions:true }
        );

        fotoGuardada = 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w400';
        ws.getRange(i + 1, 11).setValue(fotoGuardada);
        Logger.log('  ✅ Foto guardada desde ' + red + ': ' + fotoGuardada);
        actualizados++;
        break; // no seguir buscando en otras redes

      } catch(e) {
        Logger.log('  Error con ' + red + ': ' + e.message);
      }
    }

    if (!fotoGuardada) Logger.log('  ⚠️ No se encontró foto para #' + num + ' ' + nombre);
    Utilities.sleep(1200); // pausa entre speakers
  }

  Logger.log('════ Resultado: ' + actualizados + ' fotos guardadas | ' + sinFuente + ' sin redes sociales ════');
}

// ── HELPER ──────────────────────────────────────────────────────────
function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
