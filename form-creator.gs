/**
 * form-creator.gs — Crea el Google Form de inscripción de Speakers LABITCONF 2026
 *
 * INSTRUCCIONES (una sola vez):
 *   1. Ir a script.google.com → Nuevo proyecto → "labitconf-form-creator"
 *   2. Pegar este código → Guardar
 *   3. Ejecutar createSpeakerForm() → aceptar permisos
 *   4. El log da la URL pública para compartir con speakers
 *
 * Las respuestas van a un Sheet INDEPENDIENTE.
 * Para importar al LABITCONF Sheet: botón "📥 Importar del Form" en la pestaña Speakers.
 */

const LAB_SHEET_ID = '1QkhngaOt2rnh1r4KrERrPI1163COxrxFWK-BM7REWEY';

// Tipos que NO son charlas (se excluyen del desplegable de temas)
const TIPOS_EXCLUIDOS = ['Kahoot', 'Break', 'Almuerzo', 'Apertura', 'Cierre', 'Premios', 'Sorteo', 'Concurso'];

// Nombres de los stages (editar si se personalizaron en la app)
const STAGE_NAMES = [
  'Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Stage 5',
  'Stage 6', 'Stage 7', 'Stage 8', 'Stage 9'
];

// ═══════════════════════════════════════════════════════════════
// CREAR EL FORM (ejecutar una sola vez)
// ═══════════════════════════════════════════════════════════════
function createSpeakerForm() {

  // ── Leer temas reales desde la hoja Principal ────────────────
  const temas = getTemasDesdeSheet();
  if (temas.length === 0) {
    Logger.log('⚠️  No se encontraron temas en el Sheet. El desplegable quedará vacío.');
    Logger.log('    Verificá que la hoja "Principal" tenga datos en la columna Tema.');
  }

  // ── Crear el Form ────────────────────────────────────────────
  const form = FormApp.create('LABITCONF 2026 — Inscripción de Speaker');
  form.setDescription(
    'Completá este formulario para participar como speaker en el LABITCONF 2026.\n' +
    'Fecha del evento: 1 de noviembre de 2026.\n' +
    'El equipo organizador te contactará para confirmar tu participación.'
  );
  form.setCollectEmail(false);
  form.setAllowResponseEdits(true);
  form.setConfirmationMessage('✅ ¡Gracias! Recibimos tu inscripción. Te contactamos pronto.');

  // ── Campo 1: Nombre ──────────────────────────────────────────
  form.addTextItem()
    .setTitle('Nombre completo')
    .setRequired(true);

  // ── Campo 2: Tipo ────────────────────────────────────────────
  form.addMultipleChoiceItem()
    .setTitle('Tipo')
    .setRequired(true)
    .setChoiceValues(['Speaker', 'Empresa', 'Sponsor']);

  // ── Campo 3: Contacto ────────────────────────────────────────
  form.addTextItem()
    .setTitle('Contacto (mail / móvil)')
    .setHelpText('Ej: nombre@mail.com / +54 9 11 1234-5678')
    .setRequired(true);

  // ── Campo 4: X (Twitter) ─────────────────────────────────────
  form.addTextItem()
    .setTitle('X (Twitter)')
    .setHelpText('Ej: @usuario')
    .setRequired(false);

  // ── Campo 5: Instagram ───────────────────────────────────────
  form.addTextItem()
    .setTitle('Instagram')
    .setHelpText('Ej: @usuario')
    .setRequired(false);

  // ── Campo 6: Empresa / Referencia ────────────────────────────
  form.addTextItem()
    .setTitle('Empresa / Referencia')
    .setHelpText('Proyecto, empresa o rol actual.')
    .setRequired(false);

  // ── Campo 7: Stage(s) ────────────────────────────────────────
  form.addCheckboxItem()
    .setTitle('Stage(s) en los que podés participar')
    .setHelpText('Podés seleccionar más de uno.')
    .setRequired(true)
    .setChoiceValues(STAGE_NAMES);

  // ── Campo 8: Tema — desplegable con los temas del Sheet ──────
  const temaItem = form.addListItem()
    .setTitle('Tema que vas a cubrir')
    .setHelpText('Seleccioná el tema principal de tu charla.')
    .setRequired(true);

  const opciones = temas.length > 0
    ? temas
    : ['(Sin temas cargados aún — completar manualmente)'];
  temaItem.setChoiceValues(opciones);

  // ── Campo 9: Notas ───────────────────────────────────────────
  form.addParagraphTextItem()
    .setTitle('Notas / Comentarios')
    .setHelpText('Disponibilidad, restricciones horarias, necesidades técnicas, lo que quieras aclarar.')
    .setRequired(false);

  // ── Linkear respuestas a un Sheet NUEVO e independiente ──────
  const respSheet = SpreadsheetApp.create('LABITCONF2026 — Respuestas Speakers');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, respSheet.getId());

  PropertiesService.getScriptProperties().setProperty('FORM_RESP_SHEET_ID', respSheet.getId());
  PropertiesService.getScriptProperties().setProperty('SPEAKER_FORM_URL', form.getPublishedUrl());
  PropertiesService.getScriptProperties().setProperty('form_last_imported_row', '1');

  Logger.log('');
  Logger.log('✅ Form creado exitosamente');
  Logger.log('');
  Logger.log('🔗 URL para compartir con speakers:');
  Logger.log('   ' + form.getPublishedUrl());
  Logger.log('');
  Logger.log('📊 Sheet de respuestas (independiente):');
  Logger.log('   https://docs.google.com/spreadsheets/d/' + respSheet.getId());
  Logger.log('');
  Logger.log('⚠️  Copiá el ID del Sheet de respuestas en apps-script.js → FORM_RESP_SHEET_ID');
  Logger.log('   y volvé a deployar el Apps Script del LABITCONF.');
  Logger.log('');
  Logger.log('Cuando quieras importar, usá el botón "📥 Importar del Form" en la app.');
}

// ═══════════════════════════════════════════════════════════════
// LEER TEMAS DESDE EL SHEET LABITCONF
// Lee columna Tipo (col 0) y Tema (col 4), excluye tipos no-charla
// ═══════════════════════════════════════════════════════════════
function getTemasDesdeSheet() {
  try {
    const ss    = SpreadsheetApp.openById(LAB_SHEET_ID);
    const sheet = ss.getSheetByName('Principal');
    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();

    const temas = data.slice(1) // saltar header
      .filter(r => {
        const tipo  = String(r[0] || '').trim();
        const tema  = String(r[4] || '').trim();
        return tema.length > 0 && !TIPOS_EXCLUIDOS.includes(tipo);
      })
      .map(r => String(r[4]).trim());

    return [...new Set(temas)];
  } catch(e) {
    Logger.log('Error leyendo temas: ' + e.message);
    return [];
  }
}
