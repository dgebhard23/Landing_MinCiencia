/* Formulario por pasos. Configuración en el <form data-ficha>:
   data-endpoint  URL de la aplicación web de Apps Script (vacío = modo respaldo: descargar + correo)
   data-correo    correo del proceso (para el respaldo y el enlace mailto)
   data-clave     nombre del borrador en localStorage
   Marcado: cada paso es [data-paso]; campos condicionales con data-si="campo=valor"; guías con data-guia="valor de 'tema'";
   contadores con data-max-palabras + <small data-palabras-de="id">; filas con [data-filas] + <template data-fila-tpl>. */
(() => {
  const dlg = document.getElementById('ficha'), form = dlg?.querySelector('[data-ficha]');
  if (!form) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s) => form.querySelector(s);
  const pasos = [...form.querySelectorAll('[data-paso]')], marcas = [...form.querySelectorAll('.fx__pasos li')];
  const cuerpo = $('.fx__cuerpo'), filas = $('[data-filas]'), tpl = $('[data-fila-tpl]');
  const atras = $('[data-atras]'), sig = $('[data-siguiente]'), enviar = $('[data-enviar]'), descargarBtn = $('[data-descargar]');
  const listo = dlg.querySelector('[data-listo]');
  const campo = (n) => form.elements.namedItem(n);
  const val = (n) => { const f = campo(n); return (f instanceof RadioNodeList ? f.value : f?.value || '').trim(); };
  const palabras = (s) => s.trim().split(/\s+/).filter(Boolean).length;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const CLAVE = form.dataset.clave || 'ficha-borrador';
  let paso = 0;

  // Filas que se agregan o quitan
  const renumerar = () => { [...filas.children].forEach((f, i) => { f.querySelector('.fx__filax-n').textContent = `Propuesta ${i + 1}`; }); $('[data-agregar-fila]').hidden = filas.children.length >= 10; };
  const agregarFila = () => { filas.appendChild(tpl.content.firstElementChild.cloneNode(true)); renumerar(); };
  $('[data-agregar-fila]')?.addEventListener('click', () => { agregarFila(); filas.lastElementChild.querySelector('input').focus(); guardar(); });
  filas?.addEventListener('click', (e) => { if (e.target.closest('[data-quitar-fila]')) { e.target.closest('.fx__filax').remove(); renumerar(); guardar(); } });
  if (filas) agregarFila();

  // Condicionales, guías y contadores
  const sync = () => {
    form.querySelectorAll('[data-si]').forEach((el) => { const [n, v] = el.dataset.si.split('='); el.hidden = !(el.required = val(n) === v); });
    form.querySelectorAll('[data-guia]').forEach((g) => { g.hidden = g.dataset.guia !== val('tema'); });
    form.querySelectorAll('[data-max-palabras]').forEach((t) => {
      const n = palabras(t.value), max = Number(t.dataset.maxPalabras), out = form.querySelector(`[data-palabras-de="${t.id}"]`);
      if (out) { out.textContent = `${n} de ${max} palabras`; out.classList.toggle('is-excede', n > max); }
    });
  };

  // Borrador en el navegador
  const nota = $('[data-nota-borrador]');
  const foto = () => { const o = {}; new FormData(form).forEach((v, k) => { if (typeof v === 'string' && k !== 'acepto' && k !== 'sitio_web') (o[k] ||= []).push(v); }); return o; };
  const restaurar = (o) => {
    while (filas && filas.children.length < (o.prop_materia?.length || 1)) agregarFila();
    const els = [...form.elements];
    els.forEach((el) => {
      if (!el.name || el.type === 'file' || el.name === 'acepto') return;
      const vs = o[el.name] || [];
      if (el.type === 'radio' || el.type === 'checkbox') el.checked = vs.includes(el.value);
      else el.value = vs[els.filter((x) => x.name === el.name).indexOf(el)] ?? '';
    });
    sync();
  };
  let t;
  const guardar = () => { clearTimeout(t); t = setTimeout(() => {
    try { localStorage.setItem(CLAVE, JSON.stringify(foto())); nota.textContent = `Borrador guardado en este navegador · ${new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`; }
    catch { nota.textContent = 'Este navegador no permite guardar el borrador: no cierres la ventana hasta terminar.'; } }, 400); };
  try { const b = JSON.parse(localStorage.getItem(CLAVE) || 'null'); if (b) { restaurar(b); nota.textContent = 'Recuperamos tu borrador guardado en este navegador.'; } } catch { /* sin borrador */ }

  // Validación por paso
  const problema = (el) => {
    if (el.hidden || el.disabled || el.name === 'sitio_web') return '';
    if (el.type === 'radio') return el.required && !campo(el.name).value ? 'Elige una opción.' : '';
    if (el.type === 'checkbox') return el.required && !el.checked ? 'Marca esta casilla para continuar.' : '';
    if (el.type === 'file') return el.files[0]?.size > 10 * 1024 * 1024 ? 'El archivo supera los 10 MB.' : '';
    if (el.required && !el.value.trim()) return 'Completa este campo.';
    if (el.validity.typeMismatch) return 'Escribe un correo válido, por ejemplo nombre@institucion.cl.';
    if (el.dataset.maxPalabras && palabras(el.value) > Number(el.dataset.maxPalabras)) return `Resume en ${el.dataset.maxPalabras} palabras como máximo.`;
    return '';
  };
  const limpiar = (c) => { c.classList.remove('is-invalido'); c.querySelector('.fx__err')?.remove(); };
  const revisar = (p) => {
    p.querySelectorAll('.fx__campo.is-invalido').forEach(limpiar);
    let primero = null;
    p.querySelectorAll('input, select, textarea').forEach((el) => {
      const msg = problema(el), c = el.closest('.fx__campo');
      if (!msg || !c || c.classList.contains('is-invalido')) return;
      c.classList.add('is-invalido'); c.insertAdjacentHTML('beforeend', `<p class="fx__err">${msg}</p>`);
      primero ||= el;
    });
    primero?.focus(); return !primero;
  };
  form.addEventListener('input', (e) => {
    sync();
    const c = e.target.closest('.fx__campo.is-invalido');
    if (c && ![...c.querySelectorAll('input, select, textarea')].some(problema)) limpiar(c);
    if (e.target.type !== 'file') guardar();
  });

  // Datos ordenados por sección: [letra, título, paso, [[pregunta, respuesta], ...]]
  const recolectar = () => {
    const props = filas ? [...filas.children].map((f) => [f.querySelector('[name=prop_materia]').value.trim(), f.querySelector('[name=prop_texto]').value.trim()]).filter((r) => r.some(Boolean)) : [];
    return [
      ['A', 'Tus datos', 0, [['Institución', val('institucion')], ['Tipo de actor', val('actor') === 'Otro' ? `Otro: ${val('actor_otro')}` : val('actor')], ['Contacto', val('contacto')], ['Correo', val('correo')]]],
      ['B', 'Tema', 1, [['Tema', val('tema') ? `Tema ${val('tema')}` : '']]],
      ['C', 'Tu aporte', 2, [['Problema', val('problema')], ...props.map((p, i) => [`Propuesta ${i + 1}`, `${p[0]}: ${p[1]}`])]],
    ];
  };
  const resumen = () => {
    $('[data-resumen]').innerHTML = recolectar().map(([k, tit, p, items]) => `<section><h5>${k} · ${tit} <button class="fx__link" type="button" data-ir="${p}">Editar</button></h5>${
      items.map(([q, v]) => `<p><b>${esc(q)}</b><br>${v ? esc(v) : '<span class="vacio">Sin respuesta</span>'}</p>`).join('')}</section>`).join('');
  };
  $('[data-resumen]').addEventListener('click', (e) => { const b = e.target.closest('[data-ir]'); if (b) mostrar(Number(b.dataset.ir)); });

  // Copia en Word (HTML que Word abre como .doc)
  const descargar = () => {
    const filasDoc = (items) => items.map(([q, v]) => `<tr><th>${esc(q)}</th><td>${esc(v || '—').replace(/\n/g, '<br>')}</td></tr>`).join('');
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>Ficha</title>
<style>body{font-family:Arial,sans-serif;font-size:11pt}h1{font-size:15pt}h2{font-size:11.5pt;margin:16pt 0 6pt;text-transform:uppercase}table{border-collapse:collapse;width:100%}th,td{border:1px solid #bbb;padding:6pt;vertical-align:top;text-align:left}th{width:34%;background:#eef2f8}</style></head><body>
<h1>Ficha de aportes</h1><p>Copia generada el ${new Date().toLocaleDateString('es-CL')}</p>
${recolectar().map(([k, tit, , items]) => `<h2>${k} · ${esc(tit)}</h2><table>${filasDoc(items)}</table>`).join('')}</body></html>`;
    const slug = (val('institucion') || 'ficha').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\W+/g, '_').slice(0, 40);
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob(['\ufeff', html], { type: 'application/msword' })), download: `Ficha_${slug}.doc` });
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };
  dlg.querySelectorAll('[data-descargar]').forEach((b) => b.addEventListener('click', descargar));

  // Navegación
  const ultimo = pasos.length - 1;
  const mostrar = (i) => {
    paso = i;
    pasos.forEach((p, k) => { p.hidden = k !== i; });
    marcas.forEach((m, k) => { m.classList.toggle('is-hecho', k < i); k === i ? m.setAttribute('aria-current', 'step') : m.removeAttribute('aria-current'); });
    $('[data-cuenta-paso]').textContent = `Paso ${i + 1} de ${pasos.length} · ${marcas[i]?.textContent || ''}`;
    atras.hidden = i === 0; sig.hidden = i === ultimo; enviar.hidden = descargarBtn.hidden = i !== ultimo;
    if (i === ultimo) resumen();
    cuerpo.scrollTop = 0; pasos[i].querySelector('.fx__sec')?.focus({ preventScroll: true });
  };
  sig.addEventListener('click', () => { if (revisar(pasos[paso])) mostrar(paso + 1); });
  atras.addEventListener('click', () => mostrar(paso - 1));

  // Envío
  const terminar = (enviado) => {
    form.hidden = true; listo.hidden = false;
    const correo = form.dataset.correo, enlace = listo.querySelector('[data-correo-enlace]');
    listo.querySelector('[data-listo-titulo]').textContent = enviado ? '¡Gracias! Recibimos tu ficha' : 'Tu ficha está lista';
    listo.querySelector('[data-listo-texto]').textContent = enviado ? 'Te llegará un aviso de recepción. Si quieres aportar otro tema, envía otra ficha: tus datos ya quedan ingresados.'
      : `Descarga la copia y envíala a ${correo}.`;
    enlace.hidden = enviado || !correo;
    if (correo) enlace.href = `mailto:${correo}?subject=${encodeURIComponent(`Ficha de aportes · ${val('institucion')}`)}`;
    listo.querySelector('[data-otra]').hidden = !enviado;
    listo.querySelector('h3').focus();
  };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (paso !== ultimo) { if (revisar(pasos[paso])) mostrar(paso + 1); return; }
    if (!revisar(pasos[paso])) return;
    if (val('sitio_web')) return; // trampa anti-spam: un humano no ve este campo
    const err = $('[data-error-envio]'); err.hidden = true;
    const endpoint = form.dataset.endpoint;
    if (!endpoint) { terminar(false); return; }
    // application/x-www-form-urlencoded: Apps Script lo recibe sin preflight CORS
    const cuerpoEnvio = new URLSearchParams();
    recolectar().forEach(([, , , items]) => items.forEach(([q, v]) => cuerpoEnvio.append(q, v)));
    const archivo = form.querySelector('input[type=file]')?.files[0];
    const b64 = (f) => new Promise((ok, ko) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.onerror = ko; r.readAsDataURL(f); });
    enviar.disabled = true; enviar.firstElementChild.textContent = 'Enviando…';
    try {
      if (archivo) { cuerpoEnvio.append('archivo_nombre', archivo.name); cuerpoEnvio.append('archivo_tipo', archivo.type || 'application/octet-stream'); cuerpoEnvio.append('archivo_base64', await b64(archivo)); }
      const r = await fetch(endpoint, { method: 'POST', body: cuerpoEnvio });
      const res = await r.json().catch(() => ({}));
      if (!r.ok || res.ok === false) throw new Error(res.error || r.status);
      try { localStorage.removeItem(CLAVE); } catch { /* */ }
      terminar(true);
    } catch { err.hidden = false; }
    enviar.disabled = false; enviar.firstElementChild.textContent = 'Enviar';
  });
  listo.querySelector('[data-otra]').addEventListener('click', () => {
    pasos.slice(1).forEach((p) => p.querySelectorAll('input, textarea').forEach((el) => { if (el.type === 'radio' || el.type === 'checkbox') el.checked = false; else el.value = ''; }));
    campo('acepto').checked = false; if (filas) { filas.textContent = ''; agregarFila(); }
    sync(); guardar(); listo.hidden = true; form.hidden = false; mostrar(1);
  });

  // Abrir (crece desde el botón) y cerrar
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
  document.querySelectorAll('[data-abrir-ficha]').forEach((b) => b.addEventListener('click', () => abrir(b)));
  sync(); mostrar(0);
  if (location.hash === '#ficha') abrir();
})();
