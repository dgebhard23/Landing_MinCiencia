/**
 * Recepción de la ficha de insumos · Reglamentos de la Ley N° 21.838
 *
 * Aplicación web de Google Apps Script vinculada a una Google Sheet del Ministerio.
 * Recibe los envíos del formulario de la landing (botón «Participa»), agrega una fila por ficha
 * en la hoja «Fichas» y guarda los adjuntos en una carpeta de Drive.
 *
 * Instalación: ver INSTRUCCIONES.md en esta misma carpeta.
 */

const CONFIG = {
  HOJA: 'Fichas',
  CARPETA_ADJUNTOS: 'Fichas Ley 21.838 · Adjuntos', // se crea al ejecutar configurar()
  NOTIFICAR: 'contacto@minciencia.gob.cl',                                    // correo que recibe un aviso por cada ficha; vacío = sin aviso
  CIERRE: '2026-12-12T00:00:00-03:00',              // desde esta fecha las fichas se reciben marcadas «Fuera de plazo» (cierra el 11 dic a medianoche)
  MAX_ADJUNTO_MB: 10,
  EXTENSIONES: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'odt', 'ppt', 'pptx'],
  MAX_CELDA: 45000,                                 // Sheets admite hasta 50.000 caracteres por celda
};

// Columnas de la hoja: [campo que envía el formulario, encabezado]
const COLUMNAS = [
  ['_fecha', 'Fecha de recepción'],
  ['reglamento', 'Reglamento N°'],
  ['reglamento_nombre', 'Reglamento'],
  ['institucion', 'A · Institución u organización'],
  ['tipo_actor', 'A · Tipo de actor'],
  ['region', 'A · Región'],
  ['contacto', 'A · Nombre de contacto'],
  ['correo', 'A · Correo electrónico'],
  ['presenta', 'A · A nombre propio o de una red'],
  ['problema', 'C · El problema'],
  ['practica', 'D · La práctica actual'],
  ['propuestas', 'E · Criterios, umbrales y plazos propuestos'],
  ['riesgos', 'F · Riesgos'],
  ['abordar', 'G · Materias que debería abordar'],
  ['dejar_fuera', 'H · Materias que debería dejar fuera'],
  ['antecedentes', 'I · Antecedentes'],
  ['_adjunto', 'I · Documento adjunto'],
  ['acepta_aviso', 'Leyó el aviso de datos personales'],
  ['_plazo', 'Plazo'],
];
const OBLIGATORIOS = ['reglamento', 'institucion', 'tipo_actor', 'region', 'contacto', 'correo', 'presenta', 'problema'];

/** Ejecutar una vez desde el editor: crea la hoja con sus encabezados y la carpeta de adjuntos. */
function configurar() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getSheetByName(CONFIG.HOJA) || ss.insertSheet(CONFIG.HOJA);
  hoja.getRange(1, 1, 1, COLUMNAS.length).setValues([COLUMNAS.map((c) => c[1])]).setFontWeight('bold').setWrap(true);
  hoja.setFrozenRows(1);
  const props = PropertiesService.getScriptProperties();
  props.setProperty('HOJA_ID', ss.getId());
  if (!props.getProperty('CARPETA_ID')) props.setProperty('CARPETA_ID', DriveApp.createFolder(CONFIG.CARPETA_ADJUNTOS).getId());
  Logger.log('Listo. Hoja: %s · Carpeta de adjuntos: %s', ss.getUrl(), DriveApp.getFolderById(props.getProperty('CARPETA_ID')).getUrl());
}

/** Al abrir la URL de la aplicación en el navegador: sirve para comprobar que está publicada. */
function doGet() {
  return ContentService.createTextOutput('Recepción de fichas de la Ley N° 21.838: activa.');
}

/** Recibe cada ficha que envía el formulario. */
function doPost(e) {
  try {
    return responder(recibir((e && e.parameter) || {}, new Date()));
  } catch (err) {
    console.error(err);
    return responder({ ok: false, error: 'interno' });
  }
}

function recibir(p, ahora) {
  if (p.sitio_web) return { ok: true };                                   // trampa para robots: se descarta sin avisar
  const faltan = OBLIGATORIOS.filter((k) => !String(p[k] || '').trim());
  if (faltan.length || p.acepta_aviso !== 'sí') return { ok: false, error: 'faltan_datos', campos: faltan };

  // Las fichas que llegan después del cierre se registran igual, marcadas (se consideran si el calendario lo permite)
  const fueraDePlazo = ahora >= new Date(CONFIG.CIERRE);

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const adjunto = p.archivo_base64 ? guardarAdjunto(p, ahora) : '';
    const valores = { _fecha: ahora, _adjunto: adjunto, _plazo: fueraDePlazo ? 'Fuera de plazo' : 'Dentro de plazo' };
    const fila = COLUMNAS.map(([k]) => (k in valores ? valores[k] : texto(p[k])));
    SpreadsheetApp.openById(prop('HOJA_ID')).getSheetByName(CONFIG.HOJA).appendRow(fila);
  } finally {
    lock.releaseLock();
  }

  if (CONFIG.NOTIFICAR) {
    MailApp.sendEmail(CONFIG.NOTIFICAR, `${fueraDePlazo ? '[Fuera de plazo] ' : ''}Nueva ficha · Reglamento N° ${texto(p.reglamento)} · ${texto(p.institucion)}`,
      `Llegó una ficha de ${texto(p.institucion)} (${texto(p.tipo_actor)}, ${texto(p.region)}) sobre el reglamento N° ${texto(p.reglamento)}.\n\n` +
      `Hoja: ${SpreadsheetApp.openById(prop('HOJA_ID')).getUrl()}`);
  }
  return { ok: true };
}

/** Guarda el adjunto en la carpeta de Drive y devuelve su enlace. */
function guardarAdjunto(p, ahora) {
  const nombre = String(p.archivo_nombre || 'adjunto').replace(/[\\/:*?"<>|]+/g, '_').slice(0, 120);
  const ext = (nombre.split('.').pop() || '').toLowerCase();
  if (CONFIG.EXTENSIONES.indexOf(ext) < 0) return `No guardado: tipo de archivo no permitido (${nombre})`;
  const bytes = Utilities.base64Decode(p.archivo_base64);
  if (bytes.length > CONFIG.MAX_ADJUNTO_MB * 1024 * 1024) return `No guardado: supera ${CONFIG.MAX_ADJUNTO_MB} MB (${nombre})`;
  const fecha = Utilities.formatDate(ahora, 'America/Santiago', 'yyyyMMdd-HHmmss');
  const inst = String(p.institucion || '').replace(/[\\/:*?"<>|]+/g, '_').slice(0, 60);
  const blob = Utilities.newBlob(bytes, p.archivo_tipo || 'application/octet-stream', `${fecha} · R${texto(p.reglamento)} · ${inst} · ${nombre}`);
  return DriveApp.getFolderById(prop('CARPETA_ID')).createFile(blob).getUrl();
}

/**
 * Texto seguro para una celda: recorta al máximo de Sheets y antepone un apóstrofo
 * a lo que empieza con = + - @, para que la hoja no lo interprete como fórmula.
 */
function texto(v) {
  const s = String(v == null ? '' : v).slice(0, CONFIG.MAX_CELDA);
  return /^[=+\-@]/.test(s) ? `'${s}` : s;
}

function prop(k) {
  const v = PropertiesService.getScriptProperties().getProperty(k);
  if (!v) throw new Error(`Falta ${k}: ejecuta configurar() una vez desde el editor.`);
  return v;
}

function responder(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Prueba desde el editor, sin publicar: agrega una fila de ejemplo a la hoja (bórrala después). */
function probarRecepcion() {
  const r = recibir({
    reglamento: '2', reglamento_nombre: 'Reglamento N° 2 · Artículo 6 · Repositorio Nacional (PRUEBA)', institucion: 'PRUEBA · borrar esta fila',
    tipo_actor: 'Universidad', region: 'Valparaíso', contacto: 'Prueba', correo: 'prueba@ejemplo.cl', presenta: 'A nombre propio',
    problema: '=fila de prueba: el signo igual inicial no debe convertirse en fórmula', acepta_aviso: 'sí',
  }, new Date('2026-11-10T12:00:00-03:00'));
  Logger.log(JSON.stringify(r));
}
