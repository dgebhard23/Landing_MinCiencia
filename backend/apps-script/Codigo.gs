/**
 * Recepción de formularios de landing → Google Sheets + Drive + aviso por correo.
 * Genérico: guarda TODOS los campos que lleguen, creando las columnas que falten.
 *
 * Funciona con el módulo 15 (formulario por pasos), que envía
 * application/x-www-form-urlencoded (sin preflight CORS) y, si hay adjunto:
 * archivo_nombre, archivo_tipo, archivo_base64.
 *
 * Configuración: edita CONFIG y ejecuta una vez la función `configurar`.
 * Publicación: Implementar → Nueva implementación → Aplicación web
 *   - Ejecutar como: yo
 *   - Quién tiene acceso: cualquier persona
 * Pega la URL /exec en data-endpoint del formulario.
 * Si cambias el código: Administrar implementaciones → editar → Nueva versión (así la URL no cambia).
 */
const CONFIG = {
  HOJA: 'Respuestas',                       // nombre de la pestaña
  CARPETA_ADJUNTOS: 'Landing · Adjuntos',   // carpeta de Drive (se crea si no existe)
  CORREO_AVISO: 'contacto@ejemplo.cl',      // a quién avisar en cada envío ('' = sin aviso)
  ASUNTO: 'Nueva respuesta desde la landing',
  CIERRE: '2026-12-11',                     // después de esta fecha la fila se marca «Fuera de plazo» ('' = sin plazo)
  MAX_MB: 10,
};

function configurar() {
  const hoja = obtenerHoja_();
  if (hoja.getLastRow() === 0) hoja.appendRow(['Fecha de recepción', 'Plazo', 'Adjunto']);
  hoja.setFrozenRows(1);
  carpeta_();
  Logger.log('Listo. Hoja: ' + SpreadsheetApp.getActive().getUrl());
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const p = Object.assign({}, e.parameter);
    if (p.sitio_web) return json_({ ok: true }); // trampa anti-spam: se descarta en silencio

    // Adjunto
    let enlace = '';
    if (p.archivo_base64) {
      const bytes = Utilities.base64Decode(p.archivo_base64);
      if (bytes.length > CONFIG.MAX_MB * 1024 * 1024) return json_({ ok: false, error: 'El archivo supera el tamaño máximo.' });
      const blob = Utilities.newBlob(bytes, p.archivo_tipo || 'application/octet-stream', p.archivo_nombre || 'adjunto');
      enlace = carpeta_().createFile(blob).getUrl();
    }
    delete p.archivo_base64; delete p.archivo_tipo; delete p.archivo_nombre; delete p.sitio_web;

    // Fila: crea columnas nuevas si llegan campos que la hoja no tiene
    const hoja = obtenerHoja_();
    if (hoja.getLastRow() === 0) hoja.appendRow(['Fecha de recepción', 'Plazo', 'Adjunto']);
    let cab = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
    Object.keys(p).forEach((k) => { if (cab.indexOf(k) === -1) { hoja.getRange(1, cab.length + 1).setValue(k); cab.push(k); } });
    const ahora = new Date();
    const fuera = CONFIG.CIERRE && ahora > new Date(CONFIG.CIERRE + 'T23:59:59-03:00');
    const fila = cab.map((c) => c === 'Fecha de recepción' ? ahora : c === 'Plazo' ? (fuera ? 'Fuera de plazo' : 'En plazo') : c === 'Adjunto' ? enlace : (p[c] || ''));
    hoja.appendRow(fila);

    // Aviso
    if (CONFIG.CORREO_AVISO) {
      const cuerpo = Object.keys(p).map((k) => k + ': ' + p[k]).join('\n') + (enlace ? '\n\nAdjunto: ' + enlace : '');
      MailApp.sendEmail(CONFIG.CORREO_AVISO, (fuera ? '[Fuera de plazo] ' : '') + CONFIG.ASUNTO, cuerpo);
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() { return json_({ ok: true, servicio: 'recepción de formularios' }); }

function obtenerHoja_() {
  const ss = SpreadsheetApp.getActive();
  return ss.getSheetByName(CONFIG.HOJA) || ss.insertSheet(CONFIG.HOJA);
}
function carpeta_() {
  const it = DriveApp.getFoldersByName(CONFIG.CARPETA_ADJUNTOS);
  return it.hasNext() ? it.next() : DriveApp.createFolder(CONFIG.CARPETA_ADJUNTOS);
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
