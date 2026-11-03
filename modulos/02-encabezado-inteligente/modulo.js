/* Encabezado inteligente: sólido tras 40 px, se oculta al bajar (pasado 400 px), menú móvil,
   sección activa (IntersectionObserver) y desplazamiento suave con compensación del encabezado. */
(() => {
  const cab = document.querySelector('[data-cab]');
  if (!cab) return;
  const burger = cab.querySelector('[data-burger]'), menu = cab.querySelector('[data-menu-movil]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ultimoY = scrollY;
  const abierto = () => burger?.getAttribute('aria-expanded') === 'true';
  const alDesplazar = () => {
    const y = scrollY;
    cab.classList.toggle('is-solido', y > 40 || abierto());
    cab.classList.toggle('is-oculto', !abierto() && y > 400 && y > ultimoY);
    ultimoY = y;
  };
  addEventListener('scroll', alDesplazar, { passive: true });
  alDesplazar();

  const menuMovil = (abrir) => {
    burger.setAttribute('aria-expanded', String(abrir));
    burger.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
    menu.hidden = !abrir; alDesplazar();
  };
  burger?.addEventListener('click', () => menuMovil(!abierto()));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && abierto()) { menuMovil(false); burger.focus(); } });

  // Sección activa en el menú
  const enlaces = [...cab.querySelectorAll('nav a')];
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    enlaces.forEach((a) => (a.getAttribute('href') === `#${e.target.id}` ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
  }), { rootMargin: '-45% 0px -50% 0px' });
  enlaces.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean).forEach((s) => io.observe(s));

  // Anclajes con desplazamiento suave (descuenta la altura del encabezado al subir)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const destino = document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
    if (!destino) return;
    e.preventDefault();
    if (abierto()) menuMovil(false);
    const y = destino.getBoundingClientRect().top + scrollY;
    scrollTo({ top: Math.max(0, y - (y < scrollY ? cab.offsetHeight + 16 : 0)), behavior: reduce ? 'auto' : 'smooth' });
    history.pushState(null, '', a.getAttribute('href'));
    destino.setAttribute('tabindex', '-1'); destino.focus({ preventScroll: true });
  });
})();
