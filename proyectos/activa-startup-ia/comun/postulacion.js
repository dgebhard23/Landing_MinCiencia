/* Formulario de postulación de Activa Startup con IA. Cada campo sale de las bases (numerales 4, 6 y 8).
   Usa los estilos del módulo 15 (.fx) y requiere comun/convocatoria.js antes.
   Configuración en el <script> que lo carga:
     data-endpoint  URL /exec del Apps Script (apps-script/Codigo.gs). Vacío = modo demostración, no envía nada.
   Se abre con cualquier [data-abrir-ficha] o con #postular en la URL. API: Postulacion.abrir(elementoOrigen). */
(() => {
  const A = window.ACTIVA;
  const yo = document.currentScript;
  const ENDPOINT = yo?.dataset.endpoint || '';
  const CLAVE = 'activa-startup-ia-borrador';
  const MB = 1024 * 1024, MAX_MB = 5, TOTAL_MB = 25;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const REGIONES = ['Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso', 'Metropolitana de Santiago', "Libertador General Bernardo O'Higgins", 'Maule', 'Ñuble', 'Biobío', 'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén del General Carlos Ibáñez del Campo', 'Magallanes y de la Antártica Chilena'];
  const RM = 'Metropolitana de Santiago';
  const crit = Object.fromEntries(A.criterios.map((c) => [c.id, c]));
  // Las opciones guardan el nivel de la tabla de las bases como valor, pero no se muestra ningún puntaje
  const niveles = (id) => crit[id].niveles.map(([p, l]) => ({ v: String(p), l }));

  // ---------- Validaciones ----------
  const limpiaRut = (s) => s.replace(/[^0-9kK]/g, '').toUpperCase();
  const rutOk = (s) => {
    const r = limpiaRut(s); if (r.length < 8 || r.length > 9) return false;
    const cuerpo = r.slice(0, -1); let suma = 0, m = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) { suma += Number(cuerpo[i]) * m; m = m === 7 ? 2 : m + 1; }
    const dv = 11 - (suma % 11);
    return (dv === 11 ? '0' : dv === 10 ? 'K' : String(dv)) === r.slice(-1);
  };
  const rutFmt = (s) => { const r = limpiaRut(s); return r.length < 2 ? r : `${r.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${r.slice(-1)}`; };
  const vRut = (x) => (rutOk(x) ? '' : 'Revisa el RUT y su dígito verificador.');
  const vUrl = (x) => (!x || /^https?:\/\/[^\s.]+\.[^\s]+$/i.test(x) ? '' : 'Escribe un enlace completo, que empiece con https://');
  const vTel = (x) => (/^\+?[\d\s()-]{8,16}$/.test(x) ? '' : 'Escribe un teléfono con código, por ejemplo +56 9 1234 5678.');
  // Inicio de actividades: entre 6 meses y 10 años al cierre (16-11-2026)
  const vInicio = (x) => (!x ? '' : x > '2026-05-16' ? 'Debe tener al menos 6 meses al cierre: inicio de actividades hasta el 16 de mayo de 2026.'
    : x < '2016-11-16' ? 'No puede tener más de 10 años al cierre: inicio de actividades desde el 16 de noviembre de 2016.' : '');

  // ---------- Definición de los pasos ----------
  // Tipos: text, email, url, tel, date, number, select, radio, checks, textarea, archivo, equipo, html.
  // req: true o función (v) => boolean. si: (v) => boolean muestra el campo solo cuando corresponde.
  const PASOS = [
    { titulo: 'Empresa', sec: 'A · Datos de la empresa', campos: [
      { fila: [
        { n: 'razon_social', l: 'Razón social', t: 'text', req: true },
        { n: 'rut', l: 'RUT de la empresa', t: 'text', req: true, valida: vRut, ph: '76.123.456-7', fmt: rutFmt },
      ] },
      { fila: [
        { n: 'fantasia', l: 'Nombre de fantasía o marca', t: 'text' },
        { n: 'inicio', l: 'Fecha de inicio de actividades ante el SII', t: 'date', req: true, valida: vInicio, ayuda: 'Debe tener entre 6 meses y 10 años al 16 de noviembre de 2026.' },
      ] },
      { n: 'tipo', l: '¿Qué tipo de empresa es?', t: 'radio', req: true, opts: [
        { v: 'Startup', l: 'Startup', d: 'Empresa innovadora con un modelo de negocio escalable.' },
        { v: 'EBCT', l: 'EBCT', d: 'Empresa cuyo producto o servicio se basa en conocimiento científico o tecnológico.' }] },
      { fila: [
        { n: 'region', l: 'Región de la casa matriz', t: 'select', req: true, opts: REGIONES, ayuda: 'Según el domicilio registrado en el SII.' },
        { n: 'trabajadores', l: 'Número de trabajadores', t: 'number', req: true, min: 0, max: 25, ayuda: 'Máximo 25. Si no tienes trabajadores contratados, escribe 0.' },
      ] },
      { n: 'direccion', l: 'Domicilio de la casa matriz', t: 'text', req: true, ph: 'Calle, número y comuna' },
      { fila: [
        { n: 'web', l: 'Sitio web', t: 'url', valida: vUrl, ph: 'https://', ayuda: 'Si no tienes sitio web, tendrás que adjuntar una presentación en PDF.' },
        { n: 'correo_licencia', l: 'Correo corporativo para la licencia', t: 'email', req: true, ayuda: 'ElevenLabs asociará la licencia a este correo.' },
      ] },
      { n: 'ambito', l: 'Ámbito de aplicación de la propuesta', t: 'select', req: true, opts: [...A.ambitos.map((a) => a.nombre), 'Otro'], ayuda: 'Elige el que mejor describe tu propuesta.' },
      { n: 'ambito_otro', l: '¿Cuál?', t: 'text', req: true, si: (v) => v.ambito === 'Otro' },
      { n: 'aviso_menores', t: 'html', si: (v) => v.ambito === 'Educación', html: '<p class="fx__aviso fx__aviso--rojo">Recuerda: no son elegibles los productos dirigidos a menores de 18 años, incluidos los educativos.</p>' },
    ] },
    { titulo: 'Personas', sec: 'B · Representante legal y equipo responsable', campos: [
      { bloque: 'Representante legal', campos: [
        { fila: [{ n: 'rep_nombre', l: 'Nombre completo', t: 'text', req: true, ac: 'name' }, { n: 'rep_rut', l: 'RUT', t: 'text', req: true, valida: vRut, fmt: rutFmt }] },
        { fila: [{ n: 'rep_correo', l: 'Correo', t: 'email', req: true, ac: 'email' }, { n: 'rep_tel', l: 'Teléfono', t: 'tel', req: true, valida: vTel, ph: '+56 9 1234 5678' }] },
      ] },
      { bloque: 'Persona responsable de la implementación técnica', ayuda: 'Es un requisito de las bases (numeral 4).', campos: [
        { fila: [{ n: 'tec_nombre', l: 'Nombre completo', t: 'text', req: true }, { n: 'tec_cargo', l: 'Cargo', t: 'text', req: true }] },
        { fila: [{ n: 'tec_perfil', l: 'Enlace al perfil profesional o CV breve', t: 'url', req: true, valida: vUrl, ph: 'https://' }, { n: 'tec_correo', l: 'Correo', t: 'email', req: true }] },
      ] },
      { n: 'contacto_otro', t: 'checks', opts: ['La persona de contacto de esta postulación no es el representante legal'] },
      { si: (v) => v.contacto_otro?.length, bloque: 'Persona de contacto', campos: [
        { fila: [{ n: 'contacto_nombre', l: 'Nombre completo', t: 'text', req: true }, { n: 'contacto_correo', l: 'Correo', t: 'email', req: true }] },
      ] },
    ] },
    { titulo: 'Antecedentes', sec: 'C · Antecedentes de la startup/EBCT', campos: [
      { n: 'intro_ant', t: 'html', html: '<p class="fx__ayuda">Declara solo lo que puedas acreditar y adjunta su respaldo cuando se pida (numeral 6 de las bases).</p>' },
      { n: 'producto', l: crit.producto.nombre, t: 'radio', req: true, opts: niveles('producto') },
      { si: (v) => Number(v.producto) > 0, fila: [
        { n: 'producto_enlace', l: 'Enlace al producto', t: 'url', valida: vUrl, ph: 'https://' },
        { n: 'producto_doc', l: 'Carta del cliente o socio, o factura (PDF)', t: 'archivo', req: (v) => !v.producto_enlace, ayuda: 'Adjunta el documento o, si el producto está en el mercado, el enlace.' },
      ] },
      { n: 'financiamiento', l: crit.financiamiento.nombre, t: 'radio', req: true, opts: niveles('financiamiento') },
      { si: (v) => Number(v.financiamiento) > 0, campos: [
        { n: 'fin_detalle', l: 'Instrumento, institución y año de cada adjudicación', t: 'text', req: true, ph: 'Ej.: Semilla Inicia, CORFO, 2024' },
        { n: 'fin_doc', l: 'Resolución de adjudicación, convenio o certificado (PDF)', t: 'archivo', req: true },
      ] },
      { n: 'equipo', l: `${crit.equipo.nombre}: personas técnicas adicionales a la responsable`, t: 'equipo', ayuda: 'Personas de desarrollo, datos o IA con contrato en la startup/EBCT. Si no hay, deja la lista vacía.' },
      { n: 'ventas', l: crit.ventas.nombre, t: 'radio', req: true, opts: niveles('ventas'), ayuda: 'Se verifica con la Carpeta Tributaria que adjuntas en el paso 5.' },
      { n: 'mujeres', l: crit.mujeres.nombre, t: 'radio', req: true, opts: [
        { v: 'No', l: 'Ninguna de las dos' },
        { v: 'Representante legal mujer', l: 'La representante legal es mujer', d: 'Se verifica con el certificado de vigencia.' },
        { v: 'Propiedad 50 % o más', l: 'Al menos el 50 % de la propiedad está en manos de mujeres' }] },
      { n: 'mujeres_doc', l: 'Estatutos o certificado de socios (PDF)', t: 'archivo', req: true, si: (v) => v.mujeres === 'Propiedad 50 % o más' },
    ] },
    { titulo: 'Propuesta', sec: 'D · Propuesta de uso', campos: [
      { n: 'intro_prop', t: 'html', html: '<p class="fx__ayuda">Las tres preguntas son obligatorias, con hasta 1.000 caracteres cada una. Describe el componente de ElevenLabs que usarás, cómo lo implementarás y un indicador cuantificable para medir el resultado.</p>' },
      { n: 'p1', l: '¿Qué problema u oportunidad abordarán con IA de voz?', t: 'textarea', req: true, max: 1000 },
      { n: 'p2', l: '¿Qué harán con ElevenLabs y cómo lo integrarán a su producto u operación?', t: 'textarea', req: true, max: 1000, ayuda: 'Qué funcionalidad usarán y cómo se conecta con su producto: API, flujo, tipo de usuarios.' },
      { n: 'p3', l: '¿Qué resultado esperan y con qué indicador se medirán?', t: 'textarea', req: true, max: 1000, ayuda: 'Ej.: «bajar de 6 a 2 minutos el tiempo de espera en la línea de atención, medido con el registro de llamadas, a los 6 meses».' },
      { n: 'funciones', l: 'Funcionalidades de ElevenLabs que usarán', t: 'checks', opts: ['Síntesis de voz', 'Transcripción', 'Agentes conversacionales de voz', 'Generación de música'] },
      { n: 'demo', l: 'Enlace a la demostración del producto o a un video de hasta 2 minutos', t: 'url', req: true, valida: vUrl, ph: 'https://', ayuda: 'Acredita que tienes un MVP, prototipo funcional o software en operación.' },
    ] },
    { titulo: 'Documentos', sec: 'E · Documentos obligatorios', campos: [
      { n: 'intro_docs', t: 'html', html: `<p class="fx__ayuda">Solo PDF, hasta ${MAX_MB} MB cada uno y ${TOTAL_MB} MB en total. Los archivos no quedan en el borrador: si cierras la página, tendrás que adjuntarlos de nuevo.</p>` },
      { n: 'doc_vigencia', l: 'Certificado de vigencia de la sociedad', t: 'archivo', req: true, ayuda: 'Del Registro de Empresas y Sociedades o del Conservador. Emitido hasta 60 días antes de postular.' },
      { n: 'doc_carpeta', l: 'Carpeta Tributaria Electrónica del SII', t: 'archivo', req: true, ayuda: 'Generada hasta 30 días antes de postular, en PDF sin modificar.' },
      { n: 'doc_f30', l: 'Certificado de Antecedentes Laborales y Previsionales (F30)', t: 'archivo', req: true, ayuda: 'Vigente, de la Dirección del Trabajo.' },
      { n: 'doc_cotizaciones', l: 'Planilla de cotizaciones previsionales del último mes', t: 'archivo', req: true, si: (v) => Number(v.trabajadores) > 0, ayuda: 'Por ejemplo, de Previred.' },
      { n: 'doc_presentacion', l: 'Presentación de la empresa (máximo 10 láminas)', t: 'archivo', req: true, si: (v) => !v.web, ayuda: 'Se pide porque no informaste sitio web. Debe describir el producto o servicio y su base científica o tecnológica.' },
      { n: 'doc_anexo', l: 'Anexo N° 1: declaración jurada simple firmada por el representante legal', t: 'archivo', req: true,
        ayuda: 'Descarga el Anexo con tus datos, revísalo, fírmalo y súbelo en PDF. <button class="fx__link" type="button" data-anexo>Descargar Anexo N° 1 (Word)</button>' },
    ] },
    { titulo: 'Enviar', sec: 'F · Revisa y envía', final: true, campos: [
      { n: 'resumen', t: 'html', html: '<div class="fx__resumen" data-resumen></div>' },
      { n: 'acepta', t: 'checks', req: true, todas: true, opts: [
        'Leí las bases y la startup/EBCT cumple los requisitos del numeral 4 y no está en ninguna de las exclusiones.',
        'La startup/EBCT no desarrolla productos que compitan con los de ElevenLabs.',
        'La startup/EBCT no es cliente enterprise vigente de ElevenLabs ni ha recibido antes un grant de ElevenLabs.',
        'La información y los documentos son fidedignos y están vigentes. Entiendo que, una vez enviada, la postulación no se puede modificar y que se admite una por empresa.',
        'Usaremos la licencia conforme a los Términos de Servicio y la Política de Uso Prohibido de ElevenLabs: sin clonar voces sin consentimiento expreso, sin suplantar identidades ni generar contenido engañoso.',
        'Recibí la información sobre el tratamiento de datos personales: el Ministerio los usa para gestionar esta convocatoria y podrá comunicar a ElevenLabs los estrictamente necesarios para habilitar la licencia, lo que puede implicar una transferencia internacional (numeral 12).'] },
      { n: 'cerrado', t: 'html', html: '<p class="fx__aviso fx__aviso--rojo" data-cerrado hidden>El plazo de postulación cerró el lunes 16 de noviembre de 2026 a las 15:00. Ya no se reciben postulaciones.</p>' },
      { n: 'error', t: 'html', html: '<p class="fx__error" data-error-envio hidden></p>' },
    ] },
  ];

  // ---------- Marcado ----------
  const id = (n) => `pf-${n}`;
  const ayuda = (c) => (c.ayuda ? `<p class="fx__ayuda" id="${id(c.n)}-a">${c.ayuda}</p>` : '');
  const campo = (c) => {
    if (c.fila) return `<div class="fx__fila2" ${c.si ? 'data-si-grupo' : ''}>${c.fila.map(campo).join('')}</div>`;
    if (c.bloque !== undefined || c.campos) return `<div class="${c.bloque ? 'fx__bloque' : 'fx__grupo'}" ${c.si ? 'data-si-grupo' : ''} style="display:grid;gap:16px">${c.bloque ? `<h4>${c.bloque}</h4>` : ''}${c.bloque && c.ayuda ? `<p class="fx__ayuda">${c.ayuda}</p>` : ''}${c.campos.map(campo).join('')}</div>`;
    if (c.t === 'html') return `<div class="fx__campo" data-campo="${c.n}">${c.html}</div>`;
    const req = c.req ? ' *' : '', desc = c.ayuda ? ` aria-describedby="${id(c.n)}-a"` : '';
    let control;
    if (c.t === 'radio') control = `<div class="fx__opciones" role="radiogroup" aria-labelledby="${id(c.n)}-l">${c.opts.map((o) => `<label class="fx__op"><input type="radio" name="${c.n}" value="${esc(o.v)}"><span><b>${o.l}</b>${o.d ? `<small>${o.d}</small>` : ''}</span></label>`).join('')}</div>`;
    else if (c.t === 'checks') control = `<div class="fx__opciones">${c.opts.map((o) => `<label class="fx__op"><input type="checkbox" name="${c.n}" value="${esc(o)}"><span>${o}</span></label>`).join('')}</div>`;
    else if (c.t === 'select') control = `<select id="${id(c.n)}" name="${c.n}"${desc}><option value="">Elige una opción</option>${c.opts.map((o) => `<option>${esc(o)}</option>`).join('')}</select>`;
    else if (c.t === 'textarea') control = `<textarea id="${id(c.n)}" name="${c.n}" rows="5" maxlength="${c.max}"${desc}></textarea><small class="fx__cont" data-cont="${c.n}">0 / ${c.max.toLocaleString('es-CL')}</small>`;
    else if (c.t === 'archivo') control = `<div class="fx__archivo" data-archivo="${c.n}"><span>Archivo PDF, hasta ${MAX_MB} MB</span><label class="btn btn--linea btn--chico" for="${id(c.n)}">Elegir archivo</label><input class="sr-only" type="file" id="${id(c.n)}" name="${c.n}" accept="application/pdf,.pdf"${desc}><span class="fx__archivo-nom" data-nom></span></div>`;
    else if (c.t === 'equipo') control = `<div class="fx__equipo" data-equipo></div><button class="fx__link" type="button" data-agregar-equipo>+ Agregar persona</button><template data-equipo-tpl><div class="fx__equipo-fila"><input name="eq_nombre" placeholder="Nombre" aria-label="Nombre"><input name="eq_rol" placeholder="Rol (desarrollo, datos, IA…)" aria-label="Rol"><input name="eq_perfil" type="url" placeholder="Enlace al perfil (https://)" aria-label="Enlace al perfil"><button class="fx__link" type="button" data-quitar-equipo>Quitar</button></div></template>`;
    else control = `<input id="${id(c.n)}" name="${c.n}" type="${c.t}"${c.ph ? ` placeholder="${esc(c.ph)}"` : ''}${c.min !== undefined ? ` min="${c.min}"` : ''}${c.max !== undefined ? ` max="${c.max}"` : ''}${c.ac ? ` autocomplete="${c.ac}"` : ''}${c.t === 'number' ? ' inputmode="numeric"' : ''}${desc}>`;
    const etiqueta = c.l ? (['radio', 'checks', 'equipo'].includes(c.t) ? `<p class="fx__lab" id="${id(c.n)}-l">${c.l}${req}</p>` : `<label for="${id(c.n)}">${c.l}${req}</label>`) : '';
    return `<div class="fx__campo" data-campo="${c.n}">${etiqueta}${c.t === 'archivo' ? ayuda(c) + control : control + ayuda(c)}</div>`;
  };
  const dlg = document.createElement('dialog');
  dlg.className = 'fx'; dlg.id = 'postulacion'; dlg.setAttribute('aria-labelledby', 'pf-titulo');
  dlg.innerHTML = `<button class="fx__x" type="button" data-cerrar aria-label="Cerrar">×</button>
    <form novalidate>
      <div class="fx__cab"><p class="etiqueta">Postulación · ${A.nombre}</p><h3 id="pf-titulo">Formulario de postulación</h3>
        <ol class="fx__pasos">${PASOS.map((p) => `<li>${p.titulo}</li>`).join('')}</ol><p class="fx__cuenta" data-cuenta-paso></p></div>
      <div class="fx__cuerpo"><p class="fx__ayuda" style="margin-bottom:12px">Los campos con * son obligatorios.</p><p class="fx__aviso fx__aviso--rojo" role="alert" data-problemas hidden style="margin-bottom:14px"></p>${PASOS.map((p, i) => `<fieldset data-paso ${i ? 'hidden' : ''}><legend class="fx__sec" tabindex="-1">${p.sec}</legend>
        ${p.campos.map(campo).join('')}</fieldset>`).join('')}
        <input class="fx__trampa" name="sitio_web_hp" tabindex="-1" autocomplete="off" aria-hidden="true"></div>
      <div class="fx__pie"><p class="fx__nota" data-nota></p><div class="fx__botones">
        <button class="btn btn--linea" type="button" data-atras>Atrás</button>
        <button class="btn" type="button" data-siguiente>Siguiente</button>
        <button class="btn btn--linea" type="button" data-copia hidden>Descargar copia</button>
        <button class="btn btn--acento" type="submit" data-enviar hidden><span>Enviar postulación</span></button></div></div>
    </form>
    <div class="fx__listo" data-listo hidden></div>`;
  document.body.appendChild(dlg);

  const form = dlg.querySelector('form'), $ = (s) => dlg.querySelector(s);
  const pasosEl = [...form.querySelectorAll('[data-paso]')], marcas = [...dlg.querySelectorAll('.fx__pasos li')];
  const todos = [];
  const aplanar = (cs, grupo, bloque) => cs.forEach((c) => {
    const g = c.si || grupo, b = c.bloque || bloque;
    if (c.fila) aplanar(c.fila, g, b); else if (c.campos) aplanar(c.campos, g, b); else todos.push({ ...c, si: c.si || grupo, bloque: b });
  });
  PASOS.forEach((p, i) => { const antes = todos.length; aplanar(p.campos); todos.slice(antes).forEach((c) => { c.paso = i; }); });
  // Los grupos condicionales llevan la condición en su primer campo; se guarda para ocultar el contenedor
  const gruposSi = [];
  PASOS.forEach((p, i) => { const rec = (cs) => cs.forEach((c) => { if ((c.fila || c.campos) && c.si) gruposSi.push(c); if (c.campos) rec(c.campos); }); rec(p.campos); });
  form.querySelectorAll('[data-si-grupo]').forEach((el, k) => { gruposSi[k].el = el; });

  // ---------- Valores ----------
  const archivos = {};
  const equipo = () => [...form.querySelectorAll('.fx__equipo-fila')].map((f) => ({ nombre: f.querySelector('[name=eq_nombre]').value.trim(), rol: f.querySelector('[name=eq_rol]').value.trim(), perfil: f.querySelector('[name=eq_perfil]').value.trim() })).filter((p) => p.nombre || p.rol || p.perfil);
  const valores = () => {
    const v = {};
    todos.forEach((c) => {
      if (c.t === 'html' || c.t === 'equipo') return;
      if (c.t === 'checks') v[c.n] = [...form.querySelectorAll(`[name="${c.n}"]:checked`)].map((x) => x.value);
      else if (c.t === 'radio') v[c.n] = form.querySelector(`[name="${c.n}"]:checked`)?.value || '';
      else if (c.t === 'archivo') v[c.n] = archivos[c.n]?.name || '';
      else v[c.n] = (form.elements.namedItem(c.n)?.value || '').trim();
    });
    v.equipo = equipo();
    return v;
  };
  const visible = (c, v) => !c.si || !!c.si(v);

  // ---------- Sincronizar condicionales y contadores ----------
  const sync = () => {
    const v = valores();
    todos.forEach((c) => { const el = form.querySelector(`[data-campo="${c.n}"]`); if (el && c.si) el.hidden = !visible(c, v); });
    gruposSi.forEach((g) => { if (g.el) g.el.hidden = !g.si(v); });
    form.querySelectorAll('[data-cont]').forEach((s) => { const n = (form.elements.namedItem(s.dataset.cont).value || '').length, max = 1000; s.textContent = `${n.toLocaleString('es-CL')} / ${max.toLocaleString('es-CL')}`; s.classList.toggle('is-excede', n >= max); });
    $('[data-agregar-equipo]').hidden = form.querySelectorAll('.fx__equipo-fila').length >= 8;
  };

  // ---------- Equipo técnico (filas) ----------
  const cajaEq = $('[data-equipo]'), tplEq = $('[data-equipo-tpl]');
  const filaEq = (d = {}) => { const f = tplEq.content.firstElementChild.cloneNode(true); f.querySelector('[name=eq_nombre]').value = d.nombre || ''; f.querySelector('[name=eq_rol]').value = d.rol || ''; f.querySelector('[name=eq_perfil]').value = d.perfil || ''; cajaEq.appendChild(f); return f; };
  $('[data-agregar-equipo]').addEventListener('click', () => { filaEq().querySelector('input').focus(); sync(); guardar(); });
  cajaEq.addEventListener('click', (e) => { if (e.target.closest('[data-quitar-equipo]')) { e.target.closest('.fx__equipo-fila').remove(); sync(); guardar(); } });

  // ---------- Archivos ----------
  form.addEventListener('change', (e) => {
    const inp = e.target; if (inp.type !== 'file') return;
    const caja = inp.closest('[data-archivo]'), f = inp.files[0], nom = caja.querySelector('[data-nom]');
    const c = inp.closest('.fx__campo'); limpiar(c);
    if (!f) return;
    const malo = !/\.pdf$/i.test(f.name) ? 'Sube el documento en PDF.' : f.size > MAX_MB * MB ? `El archivo pesa más de ${MAX_MB} MB.`
      : Object.entries(archivos).reduce((s, [k, x]) => s + (k === inp.name ? 0 : x.size), 0) + f.size > TOTAL_MB * MB ? `Entre todos los archivos no pueden pasar de ${TOTAL_MB} MB.` : '';
    if (malo) { inp.value = ''; marcar(c, malo); return; }
    archivos[inp.name] = f; caja.classList.add('is-listo');
    nom.textContent = `${f.name} · ${f.size < MB ? `${Math.round(f.size / 1024)} KB` : `${(f.size / MB).toFixed(1)} MB`}`;
    caja.querySelector('label').textContent = 'Cambiar';
    sync();
  });

  // ---------- Borrador en el navegador ----------
  const nota = $('[data-nota]');
  let tg;
  const guardar = () => { clearTimeout(tg); tg = setTimeout(() => {
    const v = valores(); todos.filter((c) => c.t === 'archivo').forEach((c) => delete v[c.n]); delete v.acepta;
    try { localStorage.setItem(CLAVE, JSON.stringify(v)); nota.textContent = `Borrador guardado en este navegador · ${new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`; }
    catch { nota.textContent = 'Este navegador no permite guardar el borrador: no cierres la ventana hasta terminar.'; } }, 400); };
  const restaurar = (v) => {
    todos.forEach((c) => {
      const x = v[c.n]; if (x === undefined || ['html', 'archivo', 'equipo'].includes(c.t)) return;
      if (c.t === 'checks') form.querySelectorAll(`[name="${c.n}"]`).forEach((el) => { el.checked = x.includes(el.value); });
      else if (c.t === 'radio') form.querySelectorAll(`[name="${c.n}"]`).forEach((el) => { el.checked = el.value === x; });
      else if (form.elements.namedItem(c.n)) form.elements.namedItem(c.n).value = x;
    });
    (v.equipo || []).forEach(filaEq);
  };
  try { const b = JSON.parse(localStorage.getItem(CLAVE) || 'null'); if (b) { restaurar(b); nota.textContent = 'Recuperamos tu borrador guardado en este navegador.'; } } catch { /* sin borrador */ }

  // ---------- Validación ----------
  const limpiar = (c) => { if (!c) return; c.classList.remove('is-invalido'); const e = c.querySelector('.fx__err'); if (e) { c.querySelectorAll('[aria-describedby]').forEach((el) => { const r = el.getAttribute('aria-describedby').split(' ').filter((x) => x !== e.id).join(' '); r ? el.setAttribute('aria-describedby', r) : el.removeAttribute('aria-describedby'); }); e.remove(); }
    c.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid')); };
  const marcar = (c, msg) => { c.classList.add('is-invalido'); const eid = `e-${c.dataset.campo}`; c.insertAdjacentHTML('beforeend', `<p class="fx__err" id="${eid}">${msg}</p>`);
    c.querySelectorAll('input, select, textarea').forEach((el) => { el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', [el.getAttribute('aria-describedby'), eid].filter(Boolean).join(' ')); }); };
  const problema = (c, v) => {
    if (c.t === 'html' || !visible(c, v)) return '';
    const req = typeof c.req === 'function' ? c.req(v) : c.req, x = v[c.n];
    if (c.t === 'equipo') return v.equipo.some((p) => !p.nombre || !p.rol || !p.perfil) ? 'Completa nombre, rol y enlace de cada persona, o quita la fila vacía.' : v.equipo.map((p) => vUrl(p.perfil)).find(Boolean) || '';
    if (c.t === 'checks') return req && (c.todas ? x.length < c.opts.length : !x.length) ? (c.todas ? 'Marca todas las casillas para enviar.' : 'Marca al menos una opción.') : '';
    if (c.t === 'radio') return req && !x ? 'Elige una opción.' : '';
    if (c.t === 'archivo') return req && !x ? 'Adjunta este documento en PDF.' : '';
    if (c.t === 'select' && req && !x) return 'Elige una opción.';
    if (req && !x) return 'Completa este campo.';
    if (!x) return '';
    if (c.t === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x)) return 'Escribe un correo válido, por ejemplo nombre@empresa.cl.';
    if (c.t === 'number' && (!/^\d+$/.test(x) || Number(x) < c.min || Number(x) > c.max)) return c.n === 'trabajadores' && Number(x) > 25 ? 'La convocatoria es para empresas con un máximo de 25 trabajadores.' : `Escribe un número entre ${c.min} y ${c.max}.`;
    if (c.max && c.t === 'textarea' && x.length > c.max) return `Máximo ${c.max.toLocaleString('es-CL')} caracteres.`;
    return c.valida ? c.valida(x, v) : '';
  };
  const revisar = (i) => {
    const v = valores(); let primero = null;
    pasosEl[i].querySelectorAll('.fx__campo.is-invalido').forEach(limpiar);
    todos.filter((c) => c.paso === i).forEach((c) => {
      const msg = problema(c, v); if (!msg) return;
      const el = form.querySelector(`[data-campo="${c.n}"]`); marcar(el, msg);
      primero ||= el.querySelector('input, select, textarea');
    });
    primero?.focus(); return !primero;
  };
  form.addEventListener('input', (e) => {
    sync();
    const c = e.target.closest('.fx__campo.is-invalido');
    if (c) { const def = todos.find((x) => x.n === c.dataset.campo); if (def && !problema(def, valores())) limpiar(c); }
    if (e.target.type !== 'file') guardar();
  });
  form.addEventListener('focusout', (e) => { const def = todos.find((x) => x.n === e.target.name); if (def?.fmt && e.target.value) { e.target.value = def.fmt(e.target.value); guardar(); } });

  // ---------- Resumen por sección ----------
  const muestra = (c, v) => {
    const x = v[c.n];
    if (c.t === 'checks') return x.join(' · ');
    if (c.t === 'radio') { const o = c.opts.find((o) => o.v === x); return o ? o.l : ''; }
    if (c.t === 'date' && x) return A.fmt(x, { day: 'numeric', month: 'long', year: 'numeric' });
    return x;
  };
  const rotulo = (c) => (c.bloque ? `${c.bloque} · ${c.l}` : c.l);
  const secciones = () => {
    const v = valores();
    return PASOS.slice(0, -1).map((paso, i) => {
      const items = todos.filter((c) => c.paso === i && c.t !== 'html' && visible(c, v) && c.l).map((c) => c.t === 'equipo'
        ? [c.l, v.equipo.length ? v.equipo.map((x) => `${x.nombre} (${x.rol}) ${x.perfil}`).join('\n') : 'Sin personas adicionales']
        : [rotulo(c), muestra(c, v)]);
      return [paso.sec, i, items];
    });
  };
  const pintarResumen = () => {
    $('[data-resumen]').innerHTML = secciones().map(([t, i, items]) => `<section><h5>${t} <button class="fx__link" type="button" data-ir="${i}">Editar</button></h5>${
      items.map(([q, x]) => `<p><b>${esc(q)}</b><br>${x ? esc(x).replace(/\n/g, '<br>') : '<span class="vacio">Sin respuesta</span>'}</p>`).join('')}</section>`).join('');
  };
  $('[data-resumen]').addEventListener('click', (e) => { const b = e.target.closest('[data-ir]'); if (b) mostrar(Number(b.dataset.ir)); });

  // ---------- Documentos Word (HTML que Word abre como .doc) ----------
  const word = (nombre, cuerpo) => {
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(nombre)}</title>
<style>body{font-family:Arial,sans-serif;font-size:11pt;line-height:1.45}h1{font-size:14pt;text-align:center}h2{font-size:11.5pt;margin:16pt 0 6pt;text-transform:uppercase}table{border-collapse:collapse;width:100%}th,td{border:1px solid #bbb;padding:6pt;vertical-align:top;text-align:left}th{width:36%;background:#eef2f8}</style></head><body>${cuerpo}</body></html>`;
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob(['﻿', html], { type: 'application/msword' })), download: `${nombre}.doc` });
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };
  const slug = (s) => (s || 'empresa').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\W+/g, '_').slice(0, 40);
  const copia = () => { const v = valores(); word(`Postulacion_${slug(v.razon_social)}`, `<h1>${A.nombre} · Copia de la postulación</h1><p>Generada el ${new Date().toLocaleString('es-CL')}</p>${
    secciones().map(([t, , items]) => `<h2>${esc(t)}</h2><table>${items.map(([q, x]) => `<tr><th>${esc(q)}</th><td>${esc(x || '—').replace(/\n/g, '<br>')}</td></tr>`).join('')}</table>`).join('')}`); };
  const anexo = () => {
    const v = valores(), h = new Date(), mes = h.toLocaleDateString('es-CL', { month: 'long' }), _ = (x, ph) => esc(x) || `[${ph}]`;
    const puntos = [
      'La información y los documentos entregados en la postulación son fidedignos y están vigentes.',
      'La empresa no ha sido condenada conforme a la Ley N°20.393, que establece la responsabilidad penal de las personas jurídicas.',
      'Ni la empresa, ni sus socios, ni su representante legal han sido condenados por delitos económicos, fraude, estafa, lavado de activos o delitos informáticos.',
      'La empresa no registra término anticipado de convenios por incumplimiento, ni rendiciones pendientes, con ANID, CORFO u otro organismo público de fomento en los últimos 3 años.',
      'La empresa no presenta otra postulación a esta convocatoria, directamente ni a través de otra sociedad con los mismos socios mayoritarios o el mismo representante legal.',
      'Entre los socios, administradores y representantes de la empresa no hay funcionarios del Ministerio de Ciencia, Tecnología, Conocimiento e Innovación que participen en esta convocatoria, ni sus cónyuges, convivientes civiles o parientes hasta el tercer grado de consanguinidad y segundo de afinidad inclusive.',
      'La empresa usará la licencia conforme a los Términos de Servicio y la Política de Uso Prohibido de ElevenLabs, sin clonar voces sin consentimiento expreso de su titular, suplantar identidades ni generar contenido engañoso.',
      'Declaro haber recibido la información relativa al tratamiento de datos personales asociado a la convocatoria. Los datos estrictamente necesarios podrán ser comunicados a ElevenLabs para verificar la elegibilidad y habilitar la licencia, con sujeción a la normativa aplicable y a las condiciones informadas en las bases.',
      'La empresa tiene un máximo de 25 trabajadores a la fecha de postulación.',
      'La empresa no desarrolla proyectos ni productos dirigidos a personas menores de 18 años (incluidos los del ámbito educativo); no es agencia, consultora ni pyme sin desarrollo tecnológico propio; no desarrolla productos que compitan con los de ElevenLabs; no es cliente enterprise vigente de ElevenLabs y no ha recibido antes un grant de ElevenLabs.',
      `La empresa no registra deudas laborales exigibles e impagas ni deudas previsionales a la fecha de postulación.${Number(v.trabajadores) === 0 ? ' La empresa no cuenta con trabajadores contratados, lo que declaro para los efectos de los medios de verificación que correspondan.' : ' Si no cuenta con trabajadores contratados, así lo declaro para los efectos de los medios de verificación que correspondan.'}`,
    ];
    word(`Anexo_1_${slug(v.razon_social)}`, `<p style="text-align:center"><b>ANEXO N°1</b><br><b>DECLARACIÓN JURADA SIMPLE</b><br>Convocatoria "${A.nombre}"</p>
<p>En [ciudad], a ${h.getDate()} de ${mes} de ${h.getFullYear()}, ${_(v.rep_nombre, 'nombre completo')}, cédula nacional de identidad N° ${_(v.rep_rut, 'RUT')}, en representación de ${_(v.razon_social, 'razón social')}, RUT N° ${_(v.rut, 'RUT empresa')}, ambos domiciliados en ${_(v.direccion, 'domicilio')}, declaro bajo juramento que:</p>
${puntos.map((p, i) => `<p>${i + 1}. ${p}</p>`).join('')}
<p>Declaro conocer que la falsedad de esta declaración podrá ocasionar la inadmisibilidad de la postulación o la revocación del beneficio, sin perjuicio de las responsabilidades legales que puedan corresponder conforme a la normativa vigente.</p>
<p><br><br><br>______________________________<br>${_(v.rep_nombre, 'Nombre')}, ${_(v.rep_rut, 'RUT')}<br>Firma del representante legal</p>`);
  };
  dlg.addEventListener('click', (e) => { if (e.target.closest('[data-anexo]')) anexo(); if (e.target.closest('[data-copia]')) copia(); });

  // ---------- Navegación entre pasos ----------
  let paso = 0;
  const ultimo = PASOS.length - 1, cuerpo = $('.fx__cuerpo');
  const atras = $('[data-atras]'), sig = $('[data-siguiente]'), enviar = $('[data-enviar]'), btnCopia = $('[data-copia]');
  const mostrar = (i) => {
    paso = i;
    pasosEl.forEach((p, k) => { p.hidden = k !== i; });
    marcas.forEach((m, k) => { m.classList.toggle('is-hecho', k < i); k === i ? m.setAttribute('aria-current', 'step') : m.removeAttribute('aria-current'); });
    $('[data-cuenta-paso]').textContent = `Paso ${i + 1} de ${PASOS.length} · ${PASOS[i].titulo}`;
    atras.hidden = i === 0; sig.hidden = i === ultimo; enviar.hidden = btnCopia.hidden = i !== ultimo;
    if (i === ultimo) { pintarResumen(); const cerrada = A.cerrada(); $('[data-cerrado]').hidden = !cerrada; enviar.disabled = cerrada; }
    cuerpo.scrollTop = 0; pasosEl[i].querySelector('.fx__sec')?.focus({ preventScroll: true });
  };
  // Aviso que dice dónde están los problemas cuando no se puede avanzar o enviar
  const avisoProblemas = (txt) => { const a = $('[data-problemas]'); a.textContent = txt || ''; a.hidden = !txt; if (txt) cuerpo.scrollTop = 0; };
  const cuantos = () => pasosEl[paso].querySelectorAll('.fx__campo.is-invalido').length;
  const noAvanza = () => avisoProblemas(`No puedes continuar: ${cuantos() === 1 ? 'hay 1 campo' : `hay ${cuantos()} campos`} con problemas en este paso, marcados en rojo.`);
  sig.addEventListener('click', () => { if (revisar(paso)) { avisoProblemas(''); mostrar(paso + 1); } else noAvanza(); });
  atras.addEventListener('click', () => mostrar(paso - 1));

  // ---------- Envío ----------
  const listo = $('[data-listo]');
  const terminar = (folio) => {
    form.hidden = true; listo.hidden = false;
    listo.innerHTML = folio
      ? `<h3 tabindex="-1">Recibimos tu postulación</h3><p>Tu número de folio es</p><p class="fx__folio">${esc(folio)}</p>
         <p>Te enviaremos un aviso de recepción al correo del representante legal. Los resultados se publican el ${A.fmt(A.resultados)}. Consultas en <a href="${A.contacto}" target="_blank" rel="noopener">siac.minciencia.gob.cl</a>.</p>
         <p><button class="btn btn--linea" type="button" data-copia>Descargar copia</button></p>`
      : `<h3 tabindex="-1">Modo demostración</h3><p>El envío está desconectado: no se mandó ningún dato. Al publicar la landing, aquí aparecerá el folio de la postulación.</p>
         <p><button class="btn btn--linea" type="button" data-copia>Descargar copia</button> <button class="btn btn--linea" type="button" data-volver>Volver al formulario</button></p>`;
    listo.querySelector('[data-volver]')?.addEventListener('click', () => { listo.hidden = true; form.hidden = false; mostrar(ultimo); });
    listo.querySelector('h3').focus();
  };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (paso !== ultimo) { if (revisar(paso)) { avisoProblemas(''); mostrar(paso + 1); } else noAvanza(); return; }
    if (A.cerrada()) return;
    if (!revisar(paso)) { avisoProblemas('No pudimos enviar: marca todas las declaraciones de este paso.'); return; }
    if (form.elements.namedItem('sitio_web_hp').value) return; // trampa anti-spam
    const v0 = valores(), malos = PASOS.slice(0, ultimo).map((_, i) => i).filter((i) => todos.some((c) => c.paso === i && problema(c, v0)));
    if (malos.length) { mostrar(malos[0]); revisar(malos[0]); avisoProblemas(`No pudimos enviar: faltan datos o hay errores en ${malos.map((i) => `el paso ${i + 1} (${PASOS[i].titulo})`).join(', ')}. Te llevamos al primero; los campos con problemas están marcados en rojo.`); return; }
    avisoProblemas('');
    if (!ENDPOINT) { terminar(''); return; }
    const err = $('[data-error-envio]'); err.hidden = true;
    const v = valores(), datos = new URLSearchParams();
    secciones().forEach(([, , items]) => items.forEach(([q, x]) => { if (!todos.find((c) => rotulo(c) === q && c.t === 'archivo')) datos.append(q, x); }));
    datos.append('Enviado (navegador)', new Date().toISOString());
    const leer = (n, f) => new Promise((ok, ko) => { const r = new FileReader(); r.onload = () => ok({ campo: todos.find((c) => c.n === n).l, nombre: f.name, tipo: 'application/pdf', datos: String(r.result).split(',')[1] }); r.onerror = ko; r.readAsDataURL(f); });
    enviar.disabled = true; enviar.firstElementChild.textContent = 'Enviando…';
    try {
      const vigentes = Object.entries(archivos).filter(([n]) => visible(todos.find((c) => c.n === n), v));
      datos.append('adjuntos', JSON.stringify(await Promise.all(vigentes.map(([n, f]) => leer(n, f)))));
      const r = await fetch(ENDPOINT, { method: 'POST', body: datos }); // urlencoded: Apps Script lo recibe sin preflight CORS
      const res = await r.json().catch(() => ({}));
      if (!r.ok || res.ok === false) throw new Error(res.error || r.status);
      try { localStorage.removeItem(CLAVE); } catch { /* */ }
      terminar(res.folio || 'Recibida');
    } catch (x) { err.textContent = `No pudimos enviar la postulación (${x.message}). Revisa tu conexión e inténtalo otra vez. Si el problema sigue, descarga la copia y escríbenos a ${A.contacto}.`; err.hidden = false; }
    enviar.disabled = false; enviar.firstElementChild.textContent = 'Enviar postulación';
  });

  // ---------- Abrir y cerrar ----------
  const abrir = (desde) => {
    if (dlg.open) return;
    if (form.hidden) { listo.hidden = true; form.hidden = false; mostrar(0); }
    dlg.showModal(); cuerpo.scrollTop = 0;
    if (reduce || !desde) return;
    const a = desde.getBoundingClientRect(), b = dlg.getBoundingClientRect();
    dlg.animate([{ transform: `translate(${a.left + a.width / 2 - b.left - b.width / 2}px, ${a.top + a.height / 2 - b.top - b.height / 2}px) scale(.15)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)' });
  };
  const cerrar = () => { if (reduce) return dlg.close(); dlg.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(24px) scale(.96)' }], { duration: 220, easing: 'ease-in' }).finished.then(() => dlg.close()); };
  dlg.addEventListener('click', (e) => { if (e.target.closest('[data-cerrar]')) cerrar(); });
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); cerrar(); });
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-abrir-ficha]'); if (b && !dlg.contains(b)) { e.preventDefault(); abrir(b); } });
  window.Postulacion = { abrir };
  sync(); mostrar(0);
  if (location.hash === '#postular') abrir();
})();
