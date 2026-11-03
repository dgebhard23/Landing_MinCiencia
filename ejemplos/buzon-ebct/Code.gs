/**
 * ═══════════════════════════════════════════════════════════════════════
 *  BUZÓN DE DESAFÍOS REGULATORIOS PARA EBCT · Backend (Google Apps Script)
 *  Versión 2.0 — MinCiencia
 *
 *  Qué hace por cada caso recibido desde el HTML:
 *   1. Valida el payload y descarta spam (honeypot + tiempo de llenado).
 *   2. Genera un folio correlativo único (EBCT-AAAA-0001).
 *   3. Guarda los adjuntos en una subcarpeta de Drive con el nombre del folio.
 *   4. Agrega una fila a la hoja "Casos" de la planilla.
 *   5. Envía correo de confirmación a la empresa y aviso interno al equipo.
 *   6. Devuelve JSON {ok:true, folio:"EBCT-2026-0001"} al formulario.
 *
 *  INSTALACIÓN: ver README-implementacion.md (en resumen):
 *   a) Crear una planilla de Google y una carpeta en Drive.
 *   b) Extensiones → Apps Script → pegar este archivo.
 *   c) Completar CONFIG (abajo) con los IDs.
 *   d) Ejecutar una vez la función "configurar" (autoriza permisos y crea encabezados).
 *   e) Implementar → Nueva implementación → App web:
 *        - Ejecutar como: YO (tu cuenta)
 *        - Acceso: CUALQUIER PERSONA
 *   f) Copiar la URL /exec en CONFIG.APPS_SCRIPT_URL del HTML.
 * ═══════════════════════════════════════════════════════════════════════
 */

var CONFIG = {
  SPREADSHEET_ID: 'PEGA_AQUI_EL_ID_DE_TU_PLANILLA',   // planilla "Buzón EBCT"
  DRIVE_FOLDER_ID: '1DHvBaa9KTkmXfCvpGv8LWRqnG2bV1or5',             // carpeta de respaldos
  NOMBRE_HOJA: 'Casos',
  HOJA_ANALITICA: 'Analítica',             // hoja para eventos anónimos de avance/abandono
  HOJA_INCOMPLETOS: 'Incompletos',         // hoja para formularios a medio completar (separada de Casos)
  DIAS_RETENCION_INCOMPLETOS: 30,          // los incompletos se eliminan automáticamente tras N días
  EMAIL_EQUIPO: 'dgebhard@minciencia.gob.cl',  // recibe el aviso interno de cada caso nuevo
  NOMBRE_REMITENTE: 'Buzón Startups Científicas · MinCiencia',
  PREFIJO_FOLIO: 'EBCT',
  TIEMPO_MINIMO_SEG: 8                          // envíos más rápidos se marcan como posible spam
};

/** Encabezados de la hoja. El orden DEBE coincidir con construirFila(). */
var ENCABEZADOS = [
  'Marca temporal', 'Folio', 'Estado', 'Empresa', 'RUT', 'Nombre contacto', 'Email',
  'Teléfono', 'Región', 'Operación', 'Materia(s)', 'Título del caso', 'Descripción del desafío',
  'Impacto', 'Descripción producto/tecnología', 'País origen o destino', 'Etapa TRL',
  'Naturaleza del producto', 'Uso previsto', 'Documentos de referencia', 'Contacto previo',
  'Detalle contacto previo', 'Instituciones vinculadas', 'Orientación esperada',
  'Tiene respaldo', 'Archivos adjuntos', 'Carpeta Drive', 'Consentimientos',
  'Tiempo llenado (seg)', 'Página de origen', 'Posible spam',
  // ── Columnas de gestión (las llena el equipo / el agente de triaje en Fase 2) ──
  'Clasificación temática', 'Prioridad', 'Derivado a', 'Resumen ejecutivo',
  'Responsable seguimiento', 'Fecha mesa', 'Acuerdo / resolución', 'Publicado'
];

/** Encabezados de la hoja Incompletos (una fila por sesión, se actualiza con cada avance). */
var ENCABEZADOS_INCOMPLETOS = [
  'Última actualización', 'Sesión', 'Estado', 'Paso alcanzado', 'Empresa', 'RUT',
  'Nombre contacto', 'Email', 'Teléfono', 'Región', 'Operación', 'Materia(s)', 'Título del caso',
  'Descripción del desafío', 'Impacto', 'Descripción producto/tecnología',
  'País origen o destino', 'Etapa TRL', 'Contacto previo', 'Detalle contacto previo',
  'Instituciones vinculadas', 'Orientación esperada', 'Página de origen'
];

/* ─────────────────────────── ENDPOINTS WEB ─────────────────────────── */

/** Health-check: visitar la URL /exec en el navegador debe mostrar este JSON. */
function doGet() {
  return respuestaJSON({ ok: true, servicio: 'buzon-ebct', version: '2.0' });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return respuestaJSON({ ok: false, error: 'Sin contenido' });
    }
    var datos = JSON.parse(e.postData.contents);

    // Eventos anónimos de analítica (paso alcanzado / envío). No contienen datos del formulario.
    if (datos.tipo === 'evento') {
      registrarEvento(datos);
      return respuestaJSON({ ok: true });
    }

    // Avance parcial: se guarda/actualiza en la hoja Incompletos, NUNCA en Casos.
    if (datos.tipo === 'parcial') {
      guardarParcial(datos);
      return respuestaJSON({ ok: true });
    }

    // Anti-spam silencioso: se responde "ok" pero no se registra nada útil.
    var esSpam = Boolean(datos._sitio_referencia) ||
                 (Number(datos.tiempoSegundos) > 0 && Number(datos.tiempoSegundos) < CONFIG.TIEMPO_MINIMO_SEG);

    // Validación mínima de servidor (no confiar solo en el cliente).
    if (!esSpam && (!datos.empresa || !datos.email || !datos.titulo || !datos.descripcionDesafio)) {
      return respuestaJSON({ ok: false, error: 'Faltan campos obligatorios' });
    }

    var folio = generarFolio();

    var urlsArchivos = '', urlCarpeta = '';
    if (!esSpam && datos.archivos && datos.archivos.length) {
      var resultadoDrive = guardarAdjuntos(folio, datos.archivos);
      urlsArchivos = resultadoDrive.urls;
      urlCarpeta = resultadoDrive.carpeta;
    }

    var hoja = obtenerHoja();
    hoja.appendRow(construirFila(folio, datos, urlsArchivos, urlCarpeta, esSpam).map(celdaSegura));

    // Si esta sesión tenía un registro parcial, se marca como completado (no se duplica en Incompletos).
    if (!esSpam && datos.sesion) {
      try { marcarIncompletoCompletado(datos.sesion, folio); } catch (err) { Logger.log('Marcar completado falló: ' + err); }
    }
    try { limpiezaOportunista(); } catch (err) { Logger.log('Limpieza falló: ' + err); }

    if (!esSpam) {
      try { enviarConfirmacion(folio, datos); } catch (err) { Logger.log('Correo a empresa falló: ' + err); }
      try { avisarEquipo(folio, datos, urlCarpeta); } catch (err) { Logger.log('Aviso interno falló: ' + err); }
    }

    return respuestaJSON({ ok: true, folio: folio });

  } catch (error) {
    Logger.log('Error doPost: ' + error + (error && error.stack ? '\n' + error.stack : ''));
    return respuestaJSON({ ok: false, error: 'Error interno al registrar el caso' });
  }
}

/* ─────────────────────────── NÚCLEO ─────────────────────────── */

function respuestaJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function obtenerHoja() {
  var libro = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var hoja = libro.getSheetByName(CONFIG.NOMBRE_HOJA);
  if (!hoja) {
    hoja = libro.insertSheet(CONFIG.NOMBRE_HOJA);
  }
  if (hoja.getLastRow() === 0) {
    hoja.appendRow(ENCABEZADOS);
    hoja.getRange(1, 1, 1, ENCABEZADOS.length)
        .setFontWeight('bold').setBackground('#0f0f3d').setFontColor('#ffffff');
    hoja.setFrozenRows(1);
  }
  return hoja;
}

/** Folio correlativo por año, a prueba de envíos simultáneos (LockService). */
function generarFolio() {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var props = PropertiesService.getScriptProperties();
    var anio = String(new Date().getFullYear());
    var clave = 'CORRELATIVO_' + anio;
    var n = Number(props.getProperty(clave) || 0) + 1;
    props.setProperty(clave, String(n));
    return CONFIG.PREFIJO_FOLIO + '-' + anio + '-' + ('0000' + n).slice(-4);
  } finally {
    lock.releaseLock();
  }
}

function guardarAdjuntos(folio, archivos) {
  var raiz = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  var carpeta = raiz.createFolder(folio);
  var urls = [];
  archivos.forEach(function (a) {
    try {
      var blob = Utilities.newBlob(Utilities.base64Decode(a.datos), a.tipo || 'application/octet-stream', a.nombre);
      var archivo = carpeta.createFile(blob);
      urls.push(archivo.getUrl());
    } catch (err) {
      Logger.log('Adjunto «' + a.nombre + '» falló: ' + err);
    }
  });
  return { urls: urls.join('\n'), carpeta: carpeta.getUrl() };
}

function lista(v) { return Array.isArray(v) ? v.join('; ') : (v || ''); }

/**
 * Evita que Sheets interprete el valor como fórmula (#ERROR! en teléfonos "+56…")
 * y bloquea inyección de fórmulas desde el formulario (=, +, -, @ iniciales).
 */
function celdaSegura(v) {
  if (v instanceof Date || typeof v === 'number') return v;
  var s = String(v == null ? '' : v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

/** Registra eventos anónimos de avance (hoja "Analítica") para medir abandono por paso. */
function registrarEvento(d) {
  try {
    var libro = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    var hoja = libro.getSheetByName(CONFIG.HOJA_ANALITICA);
    if (!hoja) {
      hoja = libro.insertSheet(CONFIG.HOJA_ANALITICA);
      hoja.appendRow(['Marca temporal', 'Sesión', 'Evento', 'Paso', 'Página de origen']);
      hoja.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#0f0f3d').setFontColor('#ffffff');
      hoja.setFrozenRows(1);
    }
    hoja.appendRow([new Date(), celdaSegura(d.sesion || ''), celdaSegura(d.evento || ''),
                    Number(d.paso) || '', celdaSegura(d.origen || '')]);
  } catch (err) {
    Logger.log('Evento de analítica falló: ' + err);
  }
}

/* ───────────────── INCOMPLETOS (formularios a medio llenar) ───────────────── */

function obtenerHojaIncompletos() {
  var libro = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var hoja = libro.getSheetByName(CONFIG.HOJA_INCOMPLETOS);
  if (!hoja) {
    hoja = libro.insertSheet(CONFIG.HOJA_INCOMPLETOS);
    hoja.appendRow(ENCABEZADOS_INCOMPLETOS);
    hoja.getRange(1, 1, 1, ENCABEZADOS_INCOMPLETOS.length)
        .setFontWeight('bold').setBackground('#5f5e5a').setFontColor('#ffffff');
    hoja.setFrozenRows(1);
  }
  return hoja;
}

function buscarSesion(hoja, sesion) {
  var ult = hoja.getLastRow();
  if (ult < 2) return -1;
  var vals = hoja.getRange(2, 2, ult - 1, 1).getValues();
  for (var i = 0; i < vals.length; i++) {
    if (String(vals[i][0]) === String(sesion)) return i + 2;
  }
  return -1;
}

/** Inserta o actualiza la fila de la sesión en la hoja Incompletos. */
function guardarParcial(d) {
  if (!d.sesion) return;
  var hoja = obtenerHojaIncompletos();
  var fila = [
    new Date(), d.sesion, 'En curso', Number(d.pasoAlcanzado) || '',
    d.empresa || '', d.rut || '', d.nombreContacto || '', d.email || '',
    d.telefono || '', d.region || '', d.operacion || '', lista(d.materias), d.titulo || '',
    d.descripcionDesafio || '', lista(d.impactos), d.descripcionProducto || '',
    d.pais || '', d.etapaTRL || '', d.contactoPrevio || '', d.detalleContactoPrevio || '',
    lista(d.instituciones), lista(d.orientaciones), d.origen || ''
  ].map(celdaSegura);
  var idx = buscarSesion(hoja, d.sesion);
  if (idx > 0) hoja.getRange(idx, 1, 1, fila.length).setValues([fila]);
  else hoja.appendRow(fila);
}

/** Cuando el caso se envía completo, su registro parcial deja de estar "En curso". */
function marcarIncompletoCompletado(sesion, folio) {
  var hoja = obtenerHojaIncompletos();
  var idx = buscarSesion(hoja, sesion);
  if (idx > 0) {
    hoja.getRange(idx, 1).setValue(new Date());
    hoja.getRange(idx, 3).setValue('Completado (' + folio + ')');
  }
}

/** Corre la limpieza como máximo una vez al día, aprovechando el tráfico normal. */
function limpiezaOportunista() {
  var props = PropertiesService.getScriptProperties();
  var ultima = Number(props.getProperty('ULTIMA_LIMPIEZA') || 0);
  if (Date.now() - ultima < 24 * 3600 * 1000) return;
  props.setProperty('ULTIMA_LIMPIEZA', String(Date.now()));
  limpiarIncompletosAntiguos();
}

/** Elimina registros "En curso" con más de DIAS_RETENCION_INCOMPLETOS días (Ley 21.719: retención limitada). */
function limpiarIncompletosAntiguos() {
  var hoja = obtenerHojaIncompletos();
  var ult = hoja.getLastRow();
  if (ult < 2) return;
  var corte = Date.now() - CONFIG.DIAS_RETENCION_INCOMPLETOS * 24 * 3600 * 1000;
  var datos = hoja.getRange(2, 1, ult - 1, 3).getValues();
  for (var i = datos.length - 1; i >= 0; i--) {
    var fecha = datos[i][0], estado = String(datos[i][2] || '');
    if (estado === 'En curso' && fecha instanceof Date && fecha.getTime() < corte) {
      hoja.deleteRow(i + 2);
    }
  }
}

function construirFila(folio, d, urlsArchivos, urlCarpeta, esSpam) {
  return [
    new Date(), folio, esSpam ? 'Descartado (spam)' : 'Recibido',
    d.empresa || '', d.rut || '', d.nombreContacto || '', d.email || '',
    d.telefono || '', d.region || '',
    d.operacion || '', lista(d.materias), d.titulo || '', d.descripcionDesafio || '',
    lista(d.impactos), d.descripcionProducto || '', d.pais || '', d.etapaTRL || '',
    d.naturaleza || '', d.usoPrevisto || '', lista(d.documentosReferencia),
    d.contactoPrevio || '', d.detalleContactoPrevio || '',
    lista(d.instituciones), lista(d.orientaciones),
    d.tieneRespaldo || '', urlsArchivos, urlCarpeta,
    lista(d.consentimientos), d.tiempoSegundos || '', d.origen || '',
    esSpam ? 'SÍ' : 'No',
    // columnas de gestión vacías
    '', '', '', '', '', '', '', ''
  ];
}

/* ─────────────────────────── CORREOS ─────────────────────────── */

function enviarConfirmacion(folio, d) {
  if (!d.email || !/@/.test(d.email)) return;
  var html =
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#333;">' +
    '<div style="background:#0f0f3d;color:#fff;padding:18px 24px;border-radius:10px 10px 0 0;">' +
    '<h2 style="margin:0;font-size:17px;">Buzón de Desafíos Regulatorios para Startups Científicas</h2>' +
    '<p style="margin:4px 0 0;font-size:11px;color:#c7cbe8;letter-spacing:.4px;">Empresas de Base Científico-Tecnológica (EBCT)</p></div>' +
    '<div style="border:1px solid #e0e4ef;border-top:none;padding:24px;border-radius:0 0 10px 10px;">' +
    '<p>Estimado/a ' + sanear(d.nombreContacto || '') + ':</p>' +
    '<p>Hemos recibido el caso <strong>«' + sanear(d.titulo) + '»</strong> reportado por ' +
    '<strong>' + sanear(d.empresa) + '</strong>. Tu número de folio es:</p>' +
    '<p style="text-align:center;"><span style="display:inline-block;background:#f3f4ff;border:2px solid #2424b2;' +
    'color:#2424b2;font-size:20px;font-weight:bold;letter-spacing:2px;padding:10px 26px;border-radius:10px;">' +
    folio + '</span></p>' +
    '<p><strong>¿Qué sigue?</strong></p><ol style="line-height:1.7;">' +
    '<li>El equipo de MinCiencia revisa y clasifica tu caso.</li>' +
    '<li>Se deriva a las instituciones pertinentes de la Mesa Interinstitucional de Comercio Exterior de Startups Científicas (EBCT).</li>' +
    '<li>Los desafíos se abordan de manera agregada, como mejoras al ecosistema.</li>' +
    '<li>Los avances se publican periódicamente en el sitio de MinCiencia.</li></ol>' +
    '<p style="font-size:13px;color:#555;">Ten presente que este buzón no entrega respuestas ni resoluciones ' +
    'individuales: los casos se analizan de forma agregada para impulsar mejoras que beneficien a todo el ' +
    'ecosistema de EBCTs.</p>' +
    '<p style="font-size:12px;color:#777;">Si deseas complementar tu caso con más antecedentes, responde este correo ' +
    'manteniendo el folio en el asunto.</p><hr style="border:none;border-top:1px solid #eee;">' +
    '<p style="font-size:11px;color:#999;">Este buzón no constituye un canal oficial del Gobierno de Chile para la ' +
    'resolución de trámites o reclamos administrativos. Las orientaciones derivadas no sustituyen los procedimientos ' +
    'oficiales ni las decisiones de los organismos competentes. Tus datos serán tratados conforme a la Ley N° 19.628 ' +
    'sobre Protección de la Vida Privada.</p></div></div>';

  MailApp.sendEmail({
    to: d.email,
    subject: '[' + folio + '] Recibimos tu caso — Buzón Startups Científicas (EBCT) MinCiencia',
    htmlBody: html,
    name: CONFIG.NOMBRE_REMITENTE
  });
}

function avisarEquipo(folio, d, urlCarpeta) {
  if (!CONFIG.EMAIL_EQUIPO) return;
  var cuerpo =
    'Nuevo caso en el Buzón Startups Científicas (EBCT)\n' +
    '────────────────────────────\n' +
    'Folio:        ' + folio + '\n' +
    'Empresa:      ' + (d.empresa || '—') + '\n' +
    'Contacto:     ' + (d.nombreContacto || '—') + ' <' + (d.email || '—') + '>\n' +
    'Título:       ' + (d.titulo || '—') + '\n' +
    'Operación:    ' + (d.operacion || '—') + '\n' +
    'Materia(s):   ' + lista(d.materias) + '\n' +
    'Instituciones:' + lista(d.instituciones) + '\n' +
    'País:         ' + (d.pais || '—') + '\n' +
    (urlCarpeta ? 'Respaldos:    ' + urlCarpeta + '\n' : '') +
    '\nDescripción:\n' + (d.descripcionDesafio || '—') + '\n\n' +
    'Planilla: https://docs.google.com/spreadsheets/d/' + CONFIG.SPREADSHEET_ID;
  MailApp.sendEmail({
    to: CONFIG.EMAIL_EQUIPO,
    subject: '🔔 [' + folio + '] Nuevo caso: ' + (d.titulo || 'sin título'),
    body: cuerpo,
    name: CONFIG.NOMBRE_REMITENTE
  });
}

function sanear(s) {
  return String(s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ─────────────────────────── UTILIDADES ─────────────────────────── */

/**
 * Ejecutar UNA VEZ desde el editor (Ejecutar → configurar) después de
 * completar CONFIG: autoriza los permisos y deja la hoja con encabezados.
 */
function configurar() {
  var hoja = obtenerHoja();
  DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID); // valida acceso a la carpeta
  Logger.log('OK. Hoja lista: ' + hoja.getName() + ' (' + ENCABEZADOS.length + ' columnas).');
  Logger.log('Ahora: Implementar → Nueva implementación → App web (Ejecutar como YO / Acceso: Cualquier persona).');
}

/**
 * ⚠️ DESTRUCTIVA — ejecutar UNA VEZ al pasar a v0.3 (estructura Operación + Materia).
 * Borra el contenido de las hojas "Casos" e "Incompletos" (solo datos de prueba) y
 * reescribe los encabezados nuevos. NO usar una vez que haya casos reales.
 */
function reiniciarParaV3() {
  var libro = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  [[CONFIG.NOMBRE_HOJA, ENCABEZADOS], [CONFIG.HOJA_INCOMPLETOS, ENCABEZADOS_INCOMPLETOS]].forEach(function (par) {
    var hoja = libro.getSheetByName(par[0]);
    if (hoja) hoja.clear();
    else hoja = libro.insertSheet(par[0]);
    hoja.appendRow(par[1]);
    hoja.getRange(1, 1, 1, par[1].length).setFontWeight('bold').setBackground('#0f0f3d').setFontColor('#ffffff');
    hoja.setFrozenRows(1);
  });
  Logger.log('Hojas reiniciadas con la estructura v0.3 (Operación + Materia). Listo para casos reales.');
}

/** Prueba de extremo a extremo sin pasar por el HTML (Ejecutar → probarRegistro). */
function probarRegistro() {
  var e = { postData: { contents: JSON.stringify({
    empresa: 'Empresa de Prueba SpA', rut: '76.123.456-0', nombreContacto: 'Persona Prueba',
    email: CONFIG.EMAIL_EQUIPO, telefono: '+56 9 1234 5678', region: 'Metropolitana de Santiago',
    operacion: 'Importación', materias: ['Trámites aduaneros y clasificación arancelaria'],
    titulo: 'Caso de prueba del sistema', descripcionDesafio: 'Descripción de prueba del flujo completo del buzón, generada desde probarRegistro().',
    impactos: ['Retrasos en proyectos o hitos de I+D'], descripcionProducto: 'Reactivo de prueba',
    pais: 'Estados Unidos', etapaTRL: 'Etapa 3: Diseño y Prototipado (TRL 4-6)',
    instituciones: ['Instituto de Salud Pública (ISP)'], orientaciones: ['Sugerencia de ruta regulatoria'],
    contactoPrevio: 'No', tieneRespaldo: 'No', consentimientos: ['veracidad','caracter_informativo','comparticion_mesa'],
    tiempoSegundos: 120, origen: 'probarRegistro()', archivos: []
  })}};
  var salida = doPost(e);
  Logger.log(salida.getContent());
}
