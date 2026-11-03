/* Títulos que suben: envuelve el contenido de cada <span> en <i> y lo anima al entrar en pantalla. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-lineas]').forEach((h) => {
    [...h.children].forEach((linea, i) => {
      const i_ = document.createElement('i');
      i_.innerHTML = linea.innerHTML; linea.innerHTML = ''; linea.appendChild(i_);
      i_.style.transitionDelay = `${i * 100}ms`;
    });
    if (reduce) { h.classList.add('is-visible'); return; }
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { h.classList.add('is-visible'); o.disconnect(); } }, { rootMargin: '0px 0px -15% 0px' }).observe(h);
  });
})();
