/* Activa Startup con IA: datos de la convocatoria (bases del 2 de noviembre de 2026) y componentes compartidos.
   Cárgalo ANTES de los modulo.js: calcula el estado de cada etapa y lo deja en el JSON que lee el módulo 09.
   Todo lo que cambia con las bases está en ACTIVA: fechas, criterios y textos. */
(() => {
  const ACTIVA = {
    nombre: 'Activa Startup con IA',
    abre: '2026-11-03',
    consultas: '2026-11-10',
    cierre: '2026-11-16T15:00:00-03:00',   // numeral 11: lunes 16 de noviembre, 15:00
    resultados: '2026-12-03',
    contacto: 'https://siac.minciencia.gob.cl/web',
    // Etapas del numeral 11. Fechas AAAA-MM-DD, hora de Chile.
    etapas: [
      { n: '1', nombre: 'Postulación', desde: '2026-11-03', hasta: '2026-11-16', texto: 'Completa el formulario en línea y adjunta los documentos. Cierra el lunes 16 de noviembre a las 15:00.', participa: true },
      { n: '2', nombre: 'Admisibilidad', desde: '2026-11-17', hasta: '2026-11-20', texto: 'Lista de chequeo del formulario y los documentos. Se puede pedir, por una sola vez, subsanar errores formales en 2 días hábiles.' },
      { n: '3', nombre: 'Evaluación', desde: '2026-11-23', hasta: '2026-12-02', texto: 'Pertinencia de la propuesta, puntaje según los 7 criterios y verificación documental. ElevenLabs revisa la nómina con su análisis de fraude.' },
      { n: '4', nombre: 'Resultados y activación', desde: '2026-12-03', hasta: '2026-12-31', texto: 'Publicación y aviso por correo el 3 de diciembre. Cada empresa seleccionada completa el formulario de activación de ElevenLabs y comienza sus 12 meses.', participa: true },
    ],
    // Numeral 8: criterios y niveles. La región se deduce de la casa matriz; la calidad la asigna el Ministerio.
    criterios: [
      { id: 'producto', nombre: 'Producto en el mercado o piloto con clientes', max: 20, niveles: [[0, 'MVP o prototipo funcional sin usuarios'], [10, 'Piloto con al menos 1 cliente o socio'], [20, 'Producto en el mercado con clientes que pagan']], prueba: 'Carta del cliente o socio del piloto; factura o enlace al producto.' },
      { id: 'financiamiento', nombre: 'Financiamiento público previo de I+D+i o emprendimiento', max: 20, niveles: [[0, 'Sin adjudicaciones'], [10, 'Una adjudicación de emprendimiento o innovación (CORFO Semilla, SERCOTEC, Start-Up Chile…)'], [20, 'Una adjudicación de I+D (ANID, CORFO I+D) o dos o más adjudicaciones']], prueba: 'Resolución de adjudicación, convenio o certificado de la institución.' },
      { id: 'equipo', nombre: 'Equipo técnico propio', max: 15, niveles: [[0, 'Solo la persona responsable técnica, o equipo externo'], [8, 'Una persona técnica propia adicional'], [15, 'Dos o más personas técnicas propias adicionales']], prueba: 'Nombre, rol y enlace al perfil de cada integrante, en el formulario.' },
      { id: 'ventas', nombre: 'Ventas en el último año tributario', max: 15, niveles: [[0, 'Sin ventas'], [8, 'Hasta 2.400 UF'], [15, 'Más de 2.400 UF']], prueba: 'Carpeta Tributaria Electrónica del SII.' },
      { id: 'calidad', nombre: 'Calidad de la propuesta', max: 10, niveles: [[5, 'Integración descrita en general, sin detalle técnico o sin indicador verificable'], [10, 'Identifica el componente de ElevenLabs, cómo se implementa y un indicador cuantificable']], prueba: 'La evalúa el Ministerio con las 3 respuestas de la propuesta de uso.' },
      { id: 'mujeres', nombre: 'Liderazgo femenino', max: 10, niveles: [[0, 'No cumple'], [10, 'Representante legal mujer o al menos 50 % de la propiedad en manos de mujeres']], prueba: 'Certificado de vigencia, estatutos o certificado de socios.' },
      { id: 'region', nombre: 'Casa matriz fuera de la Región Metropolitana', max: 10, niveles: [[0, 'Casa matriz en la Región Metropolitana'], [10, 'Casa matriz en otra región']], prueba: 'Carpeta Tributaria Electrónica del SII (domicilio registrado).' },
    ],
    ambitos: [
      { id: 'accesibilidad', nombre: 'Accesibilidad e inclusión', ej: 'Lectura en voz alta de documentos y sitios, interfaces habladas para personas ciegas o con baja visión, comunicación aumentativa para personas que perdieron el habla.', frase: 'Hola. Este documento tiene tres páginas. ¿Quieres que lo lea completo o solo el resumen?' },
      { id: 'salud', nombre: 'Salud y cuidados', ej: 'Agentes de voz que recuerdan tratamientos, siguen a pacientes crónicos o confirman horas médicas; transcripción de consultas para la ficha clínica.', frase: 'Buenos días. Le recuerdo que hoy a las ocho le toca su control de presión. ¿Lo pudo registrar?' },
      { id: 'educacion', nombre: 'Educación', ej: 'Tutorías por voz, doblaje de cursos y capacitaciones, audiolibros formativos. Solo para personas adultas: se excluyen los productos dirigidos a menores de 18 años.', frase: 'Retomemos la unidad tres. Antes de seguir, ¿me cuentas con tus palabras qué es una tasa de interés?' },
      { id: 'servicios', nombre: 'Servicios y atención automatizada', ej: 'Mesas de ayuda con agentes conversacionales en tiempo real, atención telefónica sin esperas, transcripción y análisis de llamadas.', frase: 'Gracias por llamar. Ya encontré su pedido: llega mañana entre las diez y las dos. ¿Necesita algo más?' },
      { id: 'creativas', nombre: 'Industrias creativas', ej: 'Doblaje multilingüe de series y documentales, narración de podcasts, efectos de sonido y música para videojuegos y producciones audiovisuales.', frase: 'Capítulo uno. En el extremo sur del mundo, donde el viento no se detiene, comienza esta historia.' },
    ],
    // Numeral 4: requisitos y exclusiones, como preguntas de sí o no. «ok» es la respuesta que cumple.
    elegibilidad: [
      { p: '¿Es una persona jurídica con fines de lucro constituida en Chile?', ok: 'si' },
      { p: '¿Es startup o EBCT?', d: 'Startup: empresa innovadora con modelo escalable. EBCT: producto o servicio basado en conocimiento científico o tecnológico.', ok: 'si' },
      { p: '¿Su inicio de actividades ante el SII tiene entre 6 meses y 10 años al 16 de noviembre de 2026?', ok: 'si' },
      { p: '¿Tiene 25 trabajadores o menos?', ok: 'si' },
      { p: '¿Tiene un MVP, prototipo funcional o software en operación donde integrar ElevenLabs?', ok: 'si' },
      { p: '¿Cuenta con al menos una persona responsable de la implementación técnica?', ok: 'si' },
      { p: '¿Está al día en obligaciones laborales y previsionales?', d: 'Se acredita con el certificado F30.', ok: 'si' },
      { p: '¿Su producto o proyecto está dirigido a menores de 18 años?', d: 'Incluye productos educativos para escolares.', ok: 'no' },
      { p: '¿Es agencia, consultora o pyme sin desarrollo tecnológico propio?', ok: 'no' },
      { p: '¿Desarrolla productos que compiten con los de ElevenLabs?', ok: 'no' },
      { p: '¿Es cliente enterprise vigente de ElevenLabs o recibió antes un grant de ElevenLabs?', d: 'Los clientes de pago de autoservicio sí pueden postular.', ok: 'no' },
    ],
    // Preguntas frecuentes: [tema, pregunta, respuesta]. Todo sale de las bases.
    faq: [
      ['beneficio', '¿Qué recibe cada empresa seleccionada?', 'Una licencia de la plataforma ElevenLabs de hasta 44.000.000 créditos (unos 54.000 minutos de procesamiento) para usar durante 12 meses desde la activación. Incluye síntesis de voz, transcripción, generación de música y agentes conversacionales de voz, según la licencia y las condiciones técnicas de ElevenLabs. Además, la cohorte recibe una sesión introductoria, un correo dedicado para consultas técnicas y una sesión trimestral de preguntas y respuestas.'],
      ['beneficio', '¿Se entrega dinero?', 'No. El beneficio es una licencia de uso: es intransferible y no se puede canjear por dinero.'],
      ['beneficio', '¿Cuántas empresas se seleccionan?', 'Hasta 100. Las postulaciones pertinentes que no queden entre las 100 primeras forman una lista de espera, en orden de puntaje, por si se libera un cupo.'],
      ['requisitos', '¿Quién puede postular?', 'Personas jurídicas con fines de lucro constituidas en Chile que sean startup o EBCT, con inicio de actividades de entre 6 meses y 10 años al cierre, hasta 25 trabajadores, una persona responsable de la implementación técnica, un MVP, prototipo funcional o software en operación, y sin deudas laborales ni previsionales.'],
      ['requisitos', '¿Mi empresa puede postular si no tiene trabajadores contratados?', 'Sí. En ese caso no se pide la planilla de cotizaciones: basta con lo declarado en el Anexo N° 1. Igual necesitas una persona responsable de la implementación técnica.'],
      ['requisitos', 'Ya pago ElevenLabs. ¿Puedo postular?', 'Sí, si eres cliente de pago de autoservicio. No pueden postular los clientes enterprise vigentes ni las empresas que ya recibieron un grant de ElevenLabs.'],
      ['requisitos', '¿Puedo postular con un producto educativo?', 'Sí, si está dirigido a personas mayores de 18 años. Se excluyen los proyectos y productos para menores de edad, incluidos los del ámbito educativo.'],
      ['requisitos', '¿Quiénes no pueden postular?', 'Las empresas con productos para menores de 18 años, las agencias, consultoras y pymes sin desarrollo tecnológico propio, las que desarrollan productos que compiten con ElevenLabs y los clientes enterprise o beneficiarios de un grant previo de ElevenLabs.'],
      ['postulación', '¿Cuántas postulaciones puede presentar una empresa?', 'Una. Tampoco se admiten postulaciones de dos o más empresas con los mismos socios mayoritarios o el mismo representante legal.'],
      ['postulación', '¿Qué documentos necesito?', 'Certificado de vigencia (de hasta 60 días), Carpeta Tributaria Electrónica (de hasta 30 días), certificado F30, planilla de cotizaciones del último mes (si tienes trabajadores), Anexo N° 1 firmado, presentación en PDF (si no tienes sitio web) y el enlace a la demo o a un video de hasta 2 minutos. Para sumar puntaje, también los respaldos de cada criterio que declares.'],
      ['postulación', '¿Qué pasa si me falta un documento?', 'Si es un documento obligatorio, la postulación es inadmisible. El Ministerio puede pedir, por una sola vez, corregir errores u omisiones formales en 2 días hábiles. Si falta el respaldo de un criterio de puntaje, ese criterio queda en 0 puntos y la postulación sigue en concurso.'],
      ['postulación', '¿Puedo cambiar mi postulación después de enviarla?', 'No. Una vez enviada no se puede modificar. Solo se aceptan las aclaraciones formales que pida el Ministerio. El formulario guarda un borrador en tu navegador para que no tengas que enviarla apurado.'],
      ['postulación', '¿Hasta cuándo puedo postular?', 'Hasta el lunes 16 de noviembre de 2026 a las 15:00, hora de Chile. Las consultas se reciben hasta el martes 10 de noviembre en siac.minciencia.gob.cl.'],
      ['evaluación', '¿Cómo se evalúan las postulaciones?', 'En tres pasos. Primero, el Ministerio califica la propuesta como pertinente o no pertinente: es pertinente si describe un uso concreto y realizable de la plataforma, vinculado al negocio de la empresa. Después, las pertinentes se ordenan por puntaje según 7 criterios, con un máximo de 100 puntos. Por último, las 100 primeras se verifican con sus documentos y ElevenLabs revisa la nómina con su propio análisis de fraude.'],
      ['evaluación', '¿Cómo se resuelven los empates?', 'En este orden: propuesta en un ámbito prioritario, mayor puntaje en calidad de la propuesta, mayor puntaje en financiamiento público previo, mayor puntaje en liderazgo femenino y, por último, la postulación enviada primero.'],
      ['resultados', '¿Cuándo se conocen los resultados?', 'El 3 de diciembre de 2026. Se publican en el sitio web y se avisa por correo a cada empresa.'],
      ['resultados', 'Si me seleccionan, ¿qué tengo que hacer?', 'Completar el formulario de activación de ElevenLabs y las gestiones a tu cargo dentro del plazo que fijan las bases desde la notificación (10 días hábiles según el numeral 3; plazo por confirmar). Si no lo haces, puedes perder el cupo. Después, debes usar la licencia según tu propuesta, participar en las sesiones de acompañamiento y, si se te pide, colaborar en una actividad de difusión.'],
      ['datos', '¿Qué pasa con mis datos?', 'El Ministerio los usa para gestionar la convocatoria. Para habilitar la licencia puede comunicar a ElevenLabs solo los datos necesarios: razón social, RUT, nombre, cargo y correo de las personas responsables, y la condición de seleccionada. El tratamiento se ajusta a la Ley N° 19.628 y a la Ley N° 21.719.'],
    ],
  };

  // ---------- Fechas en hora de Chile ----------
  const ini = (iso) => new Date(iso.length > 10 ? iso : `${iso}T00:00:00-03:00`).getTime();
  const fin = (iso) => new Date(iso.length > 10 ? iso : `${iso}T23:59:59-03:00`).getTime();
  const fmt = (iso, o = { day: 'numeric', month: 'long' }) => new Intl.DateTimeFormat('es-CL', { ...o, timeZone: 'America/Santiago' }).format(new Date(iso.length > 10 ? iso : `${iso}T12:00:00-03:00`));
  // ?hoy=AAAA-MM-DD permite revisar cómo se ve la página en otra fecha
  const param = new URLSearchParams(location.search).get('hoy');
  const ahora = () => (param ? ini(param) + 12 * 36e5 : Date.now());
  ACTIVA.ahora = ahora; ACTIVA.fmt = fmt;
  ACTIVA.abierta = () => ahora() >= ini(ACTIVA.abre) && ahora() <= fin(ACTIVA.cierre);
  ACTIVA.cerrada = () => ahora() > fin(ACTIVA.cierre);
  ACTIVA.estado = (e) => (ahora() > fin(e.hasta) ? 'done' : ahora() >= ini(e.desde) ? 'live' : 'next');
  ACTIVA.etapas.forEach((e) => { e.estado = ACTIVA.estado(e); e.fechas = e.desde === e.hasta ? fmt(e.desde) : `${fmt(e.desde, { day: 'numeric', month: 'short' })} – ${fmt(e.hasta, { day: 'numeric', month: 'short' })}`; });
  window.ACTIVA = ACTIVA;

  // JSON para la hoja de ruta (módulo 09) y estados de la carta Gantt (módulo 08)
  const ruta = document.getElementById('fases-ruta');
  if (ruta && !ruta.textContent.trim()) ruta.textContent = JSON.stringify(ACTIVA.etapas.map(({ n, nombre, texto, fechas, estado, participa }) => ({ n, nombre, texto, fechas, estado, participa: !!participa })));
  document.querySelectorAll('[data-gantt] .gantt__filas li').forEach((li) => { li.dataset.estado ||= ACTIVA.estado({ desde: li.dataset.desde, hasta: li.dataset.hasta }); });
  // ?hoy=… también mueve la marca de «Hoy» de la Gantt
  if (param) document.querySelectorAll('.gantt__marca[data-en="hoy"]').forEach((m) => { m.dataset.en = param; });

  // Textos que dependen de la fecha: [data-estado-convocatoria]
  const diasA = (iso) => Math.max(0, Math.ceil((fin(iso) - ahora()) / 864e5));
  document.querySelectorAll('[data-estado-convocatoria]').forEach((el) => {
    el.textContent = ACTIVA.cerrada() ? `Postulaciones cerradas. Resultados el ${fmt(ACTIVA.resultados)}.`
      : ACTIVA.abierta() ? `Postulaciones abiertas hasta el lunes ${fmt(ACTIVA.cierre)} a las 15:00 (${diasA(ACTIVA.cierre) <= 1 ? 'último día' : `quedan ${diasA(ACTIVA.cierre)} días`}).`
      : `Postulaciones desde el ${fmt(ACTIVA.abre)}.`;
  });
  document.querySelectorAll('[data-dias-cierre]').forEach((el) => { el.dataset.contar = diasA(ACTIVA.cierre); });
  if (param) document.querySelectorAll('[data-aviso]').forEach((b) => window.addEventListener('load', () => window.BarraAviso?.pintar(b, ahora())));

  // Etapa en curso: [data-etapa-actual]
  const actual = ACTIVA.etapas.find((e) => e.estado === 'live');
  document.querySelectorAll('[data-etapa-actual]').forEach((el) => { el.textContent = actual ? `Etapa en curso: ${actual.n} · ${actual.nombre}` : ''; });

  // ---------- Preguntas frecuentes: llena [data-faq] para el módulo 12 ----------
  document.querySelectorAll('[data-faq]:empty').forEach((caja) => {
    caja.innerHTML = ACTIVA.faq.map(([t, q, r]) => `<details data-tema="${t}"><summary>${q}</summary><p>${r}</p></details>`).join('');
  });

  // ---------- ¿Puedo postular? [data-elegible] ----------
  document.querySelectorAll('[data-elegible]').forEach((caja) => {
    const res = document.createElement('div');
    caja.classList.add('elegible');
    caja.innerHTML = ACTIVA.elegibilidad.map((q, i) => `<div class="elegible__p" data-i="${i}"><p>${q.p}${q.d ? `<small>${q.d}</small>` : ''}</p>
      <div class="elegible__si-no" role="group" aria-label="Respuesta"><button type="button" data-r="si" aria-pressed="false">Sí</button><button type="button" data-r="no" aria-pressed="false">No</button></div></div>`).join('');
    res.className = 'elegible__res'; res.setAttribute('aria-live', 'polite'); caja.appendChild(res);
    const resp = {};
    const pintar = () => {
      const n = Object.keys(resp).length, malas = ACTIVA.elegibilidad.filter((q, i) => resp[i] && resp[i] !== q.ok);
      res.classList.toggle('is-ok', n === ACTIVA.elegibilidad.length && !malas.length);
      res.classList.toggle('is-mal', malas.length > 0);
      res.innerHTML = malas.length ? `<b>Con estas respuestas no cumples los requisitos.</b> Revisa: ${malas.map((q) => q.p.replace(/^¿|\?$/g, '').toLowerCase()).join('; ')}.`
        : n < ACTIVA.elegibilidad.length ? `Responde las ${ACTIVA.elegibilidad.length} preguntas. Llevas ${n}.`
        : `<b>Cumples los requisitos para postular.</b> Ahora reúne los documentos y completa el formulario. <button class="btn btn--acento btn--chico" type="button" data-abrir-ficha>Postular <span class="btn__puntos" aria-hidden="true"></span></button>`;
    };
    caja.addEventListener('click', (e) => {
      const b = e.target.closest('[data-r]'); if (!b) return;
      const p = b.closest('.elegible__p'), i = Number(p.dataset.i);
      resp[i] = b.dataset.r;
      p.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      p.classList.toggle('is-ok', resp[i] === ACTIVA.elegibilidad[i].ok); p.classList.toggle('is-mal', resp[i] !== ACTIVA.elegibilidad[i].ok);
      pintar();
    });
    pintar();
  });

  // ---------- Simulador de puntaje [data-simulador] ----------
  document.querySelectorAll('[data-simulador]').forEach((caja) => {
    const sel = {};
    ACTIVA.criterios.forEach((c) => { sel[c.id] = c.niveles[0][0]; });
    caja.classList.add('sim');
    const colores = ['var(--blue-500)', 'var(--blue-400)', 'var(--blue-300)', '#7a9bd0', 'var(--red-400)', '#c98a12', '#6b7895'];
    caja.innerHTML = `<div class="sim__criterios">${ACTIVA.criterios.map((c) => `<div class="sim__c"><h3>${c.nombre}<span data-pts="${c.id}">0 / ${c.max}</span></h3>
      <div class="sim__ops" role="group" aria-label="${c.nombre}">${c.niveles.map(([p, t], k) => `<button type="button" data-c="${c.id}" data-p="${p}" aria-pressed="${k === 0}">${p} · ${t}</button>`).join('')}</div></div>`).join('')}</div>
      <aside class="sim__total" aria-live="polite"><p>Puntaje estimado</p><div class="sim__num"><span data-total>0</span><small> / 100</small></div>
      <div class="sim__barra">${ACTIVA.criterios.map((c, i) => `<i data-barra="${c.id}" style="background:${colores[i]};width:0"></i>`).join('')}</div>
      <p data-sim-nota></p></aside>`;
    const pintar = () => {
      let t = 0;
      ACTIVA.criterios.forEach((c) => { t += sel[c.id]; caja.querySelector(`[data-pts="${c.id}"]`).textContent = `${sel[c.id]} / ${c.max}`; caja.querySelector(`[data-barra="${c.id}"]`).style.width = `${sel[c.id]}%`; });
      caja.querySelector('[data-total]').textContent = t;
      caja.querySelector('[data-sim-nota]').textContent = 'Es una estimación: cada criterio vale solo si se acredita con su documento. Las 100 empresas con mayor puntaje pasan a verificación; las demás quedan en lista de espera.';
    };
    caja.addEventListener('click', (e) => {
      const b = e.target.closest('[data-c]'); if (!b) return;
      sel[b.dataset.c] = Number(b.dataset.p);
      caja.querySelectorAll(`[data-c="${b.dataset.c}"]`).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      pintar();
    });
    pintar();
  });

  // ---------- Tabla de criterios [data-tabla-criterios] ----------
  document.querySelectorAll('[data-tabla-criterios]').forEach((t) => {
    t.innerHTML = `<div class="tabla-wrap"><table class="tabla"><thead><tr><th>Criterio</th><th>Máx.</th><th>Cómo se asigna</th><th>Cómo se acredita</th></tr></thead><tbody>${
      ACTIVA.criterios.map((c) => `<tr><td>${c.nombre}</td><td class="pts">${c.max}</td><td>${c.niveles.map(([p, x]) => `<b>${p}</b> · ${x}`).join('<br>')}</td><td>${c.prueba}</td></tr>`).join('')}</tbody></table></div>`;
  });

  // ---------- Escuchar un ejemplo (voz del navegador, solo ilustrativa) [data-escuchar] ----------
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-escuchar]'); if (!b) return;
    if (!('speechSynthesis' in window)) { b.textContent = 'Tu navegador no puede leer en voz alta'; return; }
    if (speechSynthesis.speaking) { speechSynthesis.cancel(); return; }
    const u = new SpeechSynthesisUtterance(b.dataset.escuchar);
    u.lang = 'es-CL'; u.rate = 1;
    const voz = speechSynthesis.getVoices().find((v) => v.lang === 'es-CL') || speechSynthesis.getVoices().find((v) => v.lang.startsWith('es'));
    if (voz) u.voice = voz;
    b.classList.add('is-sonando'); u.onend = u.onerror = () => b.classList.remove('is-sonando');
    speechSynthesis.speak(u);
  });
})();
