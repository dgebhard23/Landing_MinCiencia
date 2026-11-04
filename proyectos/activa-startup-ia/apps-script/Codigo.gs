/**
 * Activa Startup/EBCT con IA · recepción de postulaciones → Google Sheets + Drive + aviso por correo.
 *   1. Recibe varios adjuntos (campo «adjuntos», JSON con [{campo, nombre, tipo, datos}]) y los guarda
 *      en una subcarpeta por postulación, nombrada con el folio.
 *   2. Asigna un folio correlativo (AS-2026-0001…) y lo devuelve al formulario.
 *   3. Marca «Fuera de plazo» según la hora exacta de cierre (30-11-2026 15:00, hora de Chile).
 *      La fecha y hora de recepción es la que vale para el último criterio de desempate.
 *
 * Instalación: ver INSTRUCCIONES.md. La URL /exec va en data-endpoint del <script src="comun/postulacion.js">.
 */
const CONFIG = {
  HOJA: 'Postulaciones',
  CARPETA: 'Activa Startup-EBCT con IA · Postulaciones',
  CORREO_AVISO: 'contacto@minciencia.gob.cl',    // equipo que recibe el aviso de cada postulación ('' = sin aviso)
  AVISAR_POSTULANTE: true,                       // manda acuse de recibo al correo del representante legal
  CIERRE: '2026-11-30T15:00:00-03:00',
  PREFIJO_FOLIO: 'AS-2026-',
  MAX_MB_ARCHIVO: 5,
  MAX_MB_TOTAL: 25,
  MAX_COLUMNAS: 80,                              // tope contra envíos que intenten crear columnas sin fin
};
const FIJAS = ['Folio', 'Fecha de recepción', 'Plazo', 'Carpeta de documentos'];

function configurar() {
  const ss = SpreadsheetApp.getActive();
  ss.setSpreadsheetTimeZone('America/Santiago');
  const hoja = hoja_();
  if (hoja.getLastRow() === 0) hoja.appendRow(FIJAS);
  hoja.setFrozenRows(1);
  carpeta_();
  Logger.log('Listo. Hoja: ' + ss.getUrl());
}

function doPost(e) {
  const p = Object.assign({}, e.parameter);
  if (p.sitio_web_hp) return json_({ ok: true, folio: 'Recibida' }); // trampa anti-spam

  const ahora = new Date();
  const fuera = ahora > new Date(CONFIG.CIERRE);
  const lock = LockService.getScriptLock();
  let folio = '';
  let enlaceCarpeta = '';
  try {
    // 1. Adjuntos, sin bloqueo: subir archivos tarda y no debe frenar a quienes postulan al mismo tiempo.
    let adjuntos = [];
    try { adjuntos = JSON.parse(p.adjuntos || '[]'); } catch (err) { return json_({ ok: false, error: 'Adjuntos ilegibles' }); }
    const blobs = adjuntos.map((a) => ({ a: a, bytes: Utilities.base64Decode(a.datos) }));
    let total = 0;
    blobs.forEach((b) => {
      total += b.bytes.length;
      if (b.bytes.length > CONFIG.MAX_MB_ARCHIVO * 1024 * 1024) throw new Error('«' + b.a.nombre + '» supera ' + CONFIG.MAX_MB_ARCHIVO + ' MB');
    });
    if (total > CONFIG.MAX_MB_TOTAL * 1024 * 1024) throw new Error('Los archivos superan ' + CONFIG.MAX_MB_TOTAL + ' MB en total');

    const razon = p['Razón social'] || 'sin razón social';
    let sub = null;
    if (blobs.length) {
      sub = carpeta_().createFolder('Sin folio · ' + razon);
      blobs.forEach((b) => {
        const f = sub.createFile(Utilities.newBlob(b.bytes, 'application/pdf', b.a.campo + ' · ' + b.a.nombre));
        p['Archivo · ' + b.a.campo] = f.getUrl();
      });
      enlaceCarpeta = sub.getUrl();
    }
    delete p.adjuntos; delete p.sitio_web_hp;

    // 2. Folio y fila, con bloqueo: dos postulaciones simultáneas no pueden recibir el mismo folio.
    lock.waitLock(60000);
    const hoja = hoja_();
    if (hoja.getLastRow() === 0) hoja.appendRow(FIJAS);
    folio = CONFIG.PREFIJO_FOLIO + String(hoja.getLastRow()).padStart(4, '0');
    if (sub) sub.setName(folio + ' · ' + razon);

    const cab = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
    Object.keys(p).forEach((k) => {
      if (cab.indexOf(k) !== -1 || !claveValida_(k) || cab.length >= CONFIG.MAX_COLUMNAS) return;
      hoja.getRange(1, cab.length + 1).setValue(k);
      cab.push(k);
    });
    const fijo = { 'Folio': folio, 'Fecha de recepción': ahora, 'Plazo': fuera ? 'Fuera de plazo' : 'En plazo', 'Carpeta de documentos': enlaceCarpeta };
    hoja.appendRow(cab.map((c) => (c in fijo ? fijo[c] : texto_(p[c]))));
    SpreadsheetApp.flush();
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  } finally {
    lock.releaseLock();
  }

  // 3. Avisos: la postulación ya quedó guardada, así que un error de correo no debe hacerla reintentar.
  try { avisar_(p, folio, enlaceCarpeta, ahora, fuera); } catch (err) { console.error('Aviso no enviado · ' + folio + ' · ' + err); }
  return json_({ ok: true, folio: folio });
}

function doGet() { return json_({ ok: true, servicio: 'Activa Startup/EBCT con IA · postulaciones' }); }

function avisar_(p, folio, enlaceCarpeta, ahora, fuera) {
  const asunto = (fuera ? '[Fuera de plazo] ' : '') + 'Postulación ' + folio + ' · Activa Startup/EBCT con IA';
  if (CONFIG.CORREO_AVISO) MailApp.sendEmail(CONFIG.CORREO_AVISO, asunto, Object.keys(p).map((k) => k + ': ' + p[k]).join('\n') + '\n\nDocumentos: ' + enlaceCarpeta);
  const correo = p['Representante legal · Correo'];
  if (CONFIG.AVISAR_POSTULANTE && correo) {
    MailApp.sendEmail(correo, 'Recibimos tu postulación ' + folio + ' · Activa Startup/EBCT con IA',
      'Recibimos la postulación de ' + (p['Razón social'] || 'tu startup/EBCT') + ' el ' + Utilities.formatDate(ahora, 'America/Santiago', "dd-MM-yyyy 'a las' HH:mm") + '.\n\n' +
      'Folio: ' + folio + '\n\nLos resultados se publican el 17 de diciembre de 2026. Consultas en contacto@minciencia.gob.cl\n\n' +
      'ElevenLabs, en alianza con el Ministerio de Ciencia, Tecnología, Conocimiento e Innovación',
      { name: 'Activa Startup/EBCT con IA · ElevenLabs', replyTo: 'contacto@minciencia.gob.cl' });
  }
}

// Lo que escribe el público se guarda como texto: «=…» no se ejecuta como fórmula y «+569…» no se vuelve número.
function texto_(v) {
  if (v === undefined || v === null || v === '') return '';
  const s = String(v);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}
function claveValida_(k) { return k.length <= 200 && !/^[=+\-@\t\r]/.test(k); }

function hoja_() {
  const ss = SpreadsheetApp.getActive();
  return ss.getSheetByName(CONFIG.HOJA) || ss.insertSheet(CONFIG.HOJA);
}
function carpeta_() {
  const it = DriveApp.getFoldersByName(CONFIG.CARPETA);
  return it.hasNext() ? it.next() : DriveApp.createFolder(CONFIG.CARPETA);
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
