/**
 * Activa Startup con IA · recepción de postulaciones → Google Sheets + Drive + aviso por correo.
 * Basado en backend/apps-script/Codigo.gs, con tres cambios:
 *   1. Recibe varios adjuntos (campo «adjuntos», JSON con [{campo, nombre, tipo, datos}]) y los guarda
 *      en una subcarpeta por postulación, nombrada con el folio.
 *   2. Asigna un folio correlativo (AS-2026-0001…) y lo devuelve al formulario.
 *   3. Marca «Fuera de plazo» según la hora exacta de cierre (16-11-2026 15:00, hora de Chile).
 *      La fecha y hora de recepción es la que vale para el último criterio de desempate.
 *
 * Instalación: ver INSTRUCCIONES.md. La URL /exec va en data-endpoint del <script src="comun/postulacion.js">.
 */
const CONFIG = {
  HOJA: 'Postulaciones',
  CARPETA: 'Activa Startup con IA · Postulaciones',
  CORREO_AVISO: '',                              // equipo que recibe el aviso de cada postulación ('' = sin aviso)
  AVISAR_POSTULANTE: true,                       // manda acuse de recibo al correo del representante legal
  CIERRE: '2026-11-16T15:00:00-03:00',
  PREFIJO_FOLIO: 'AS-2026-',
  MAX_MB_ARCHIVO: 5,
};
const FIJAS = ['Folio', 'Fecha de recepción', 'Plazo', 'Carpeta de documentos'];

function configurar() {
  const hoja = hoja_();
  if (hoja.getLastRow() === 0) hoja.appendRow(FIJAS);
  hoja.setFrozenRows(1);
  carpeta_();
  Logger.log('Listo. Hoja: ' + SpreadsheetApp.getActive().getUrl());
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const p = Object.assign({}, e.parameter);
    if (p.sitio_web_hp) return json_({ ok: true, folio: 'Recibida' }); // trampa anti-spam

    const ahora = new Date();
    const fuera = ahora > new Date(CONFIG.CIERRE);
    const hoja = hoja_();
    if (hoja.getLastRow() === 0) hoja.appendRow(FIJAS);
    const folio = CONFIG.PREFIJO_FOLIO + String(hoja.getLastRow()).padStart(4, '0');

    // Adjuntos: una subcarpeta por postulación
    let adjuntos = [];
    try { adjuntos = JSON.parse(p.adjuntos || '[]'); } catch (err) { return json_({ ok: false, error: 'Adjuntos ilegibles' }); }
    let enlaceCarpeta = '';
    if (adjuntos.length) {
      const sub = carpeta_().createFolder(folio + ' · ' + (p['Razón social'] || 'sin razón social'));
      adjuntos.forEach((a) => {
        const bytes = Utilities.base64Decode(a.datos);
        if (bytes.length > CONFIG.MAX_MB_ARCHIVO * 1024 * 1024) throw new Error('«' + a.nombre + '» supera ' + CONFIG.MAX_MB_ARCHIVO + ' MB');
        const f = sub.createFile(Utilities.newBlob(bytes, a.tipo || 'application/pdf', a.campo + ' · ' + a.nombre));
        p['Archivo · ' + a.campo] = f.getUrl();
      });
      enlaceCarpeta = sub.getUrl();
    }
    delete p.adjuntos; delete p.sitio_web_hp;

    // Fila: crea las columnas que falten
    let cab = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
    Object.keys(p).forEach((k) => { if (cab.indexOf(k) === -1) { hoja.getRange(1, cab.length + 1).setValue(k); cab.push(k); } });
    const fijo = { 'Folio': folio, 'Fecha de recepción': ahora, 'Plazo': fuera ? 'Fuera de plazo' : 'En plazo', 'Carpeta de documentos': enlaceCarpeta };
    hoja.appendRow(cab.map((c) => (c in fijo ? fijo[c] : (p[c] || ''))));

    // Avisos
    const asunto = (fuera ? '[Fuera de plazo] ' : '') + 'Postulación ' + folio + ' · Activa Startup con IA';
    if (CONFIG.CORREO_AVISO) MailApp.sendEmail(CONFIG.CORREO_AVISO, asunto, Object.keys(p).map((k) => k + ': ' + p[k]).join('\n') + '\n\nDocumentos: ' + enlaceCarpeta);
    const correo = p['Representante legal · Correo'];
    if (CONFIG.AVISAR_POSTULANTE && correo) {
      MailApp.sendEmail(correo, 'Recibimos tu postulación ' + folio + ' · Activa Startup con IA',
        'Recibimos la postulación de ' + (p['Razón social'] || 'tu empresa') + ' el ' + Utilities.formatDate(ahora, 'America/Santiago', "dd-MM-yyyy 'a las' HH:mm") + '.\n\n' +
        'Folio: ' + folio + '\n\nLos resultados se publican el 3 de diciembre de 2026. Consultas en https://siac.minciencia.gob.cl/web\n\n' +
        'Ministerio de Ciencia, Tecnología, Conocimiento e Innovación');
    }
    return json_({ ok: true, folio: folio });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() { return json_({ ok: true, servicio: 'Activa Startup con IA · postulaciones' }); }

function hoja_() {
  const ss = SpreadsheetApp.getActive();
  return ss.getSheetByName(CONFIG.HOJA) || ss.insertSheet(CONFIG.HOJA);
}
function carpeta_() {
  const it = DriveApp.getFoldersByName(CONFIG.CARPETA);
  return it.hasNext() ? it.next() : DriveApp.createFolder(CONFIG.CARPETA);
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
