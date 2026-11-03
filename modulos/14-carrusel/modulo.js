/* Carrusel: [data-carrusel] > [data-pista] con hijos .carrusel__item. data-intervalo en ms (0 = sin avance automático).
   Helper: Carrusel.urlDrive(enlace) convierte un enlace de Google Drive en una imagen mostrable. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.Carrusel = { urlDrive: (u, ancho = 1200) => { const m = (u || '').match(/\/d\/([\w-]+)|id=([\w-]+)/); return m ? `https://drive.google.com/thumbnail?id=${m[1] || m[2]}&sz=w${ancho}` : u; } };
  document.querySelectorAll('[data-carrusel]').forEach((c) => {
    const pista = c.querySelector('[data-pista]'), items = [...pista.children], puntos = c.querySelector('[data-puntos]');
    let i = 0, timer = null, pausa = false;
    const ir = (k) => { i = (k + items.length) % items.length; pista.scrollTo({ left: items[i].offsetLeft - pista.offsetLeft, behavior: reduce ? 'auto' : 'smooth' }); };
    puntos.innerHTML = items.map((_, k) => `<button type="button" aria-label="Ir a ${k + 1}"></button>`).join('');
    const marcar = () => [...puntos.children].forEach((b, k) => b.setAttribute('aria-current', String(k === i)));
    puntos.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) ir([...puntos.children].indexOf(b)); });
    c.querySelector('[data-ant]').addEventListener('click', () => ir(i - 1));
    c.querySelector('[data-sig]').addEventListener('click', () => ir(i + 1));
    pista.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') ir(i + 1); if (e.key === 'ArrowLeft') ir(i - 1); });
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { i = items.indexOf(e.target); marcar(); } }), { root: pista, threshold: .6 });
    items.forEach((it) => io.observe(it)); marcar();
    const ms = Number(c.dataset.intervalo || 0);
    if (ms && !reduce) {
      timer = setInterval(() => { if (!pausa && !document.hidden) ir(i + 1); }, ms);
      ['mouseenter', 'focusin', 'touchstart'].forEach((ev) => c.addEventListener(ev, () => { pausa = true; }, { passive: true }));
      ['mouseleave', 'focusout'].forEach((ev) => c.addEventListener(ev, () => { pausa = false; }));
    }
  });
})();
