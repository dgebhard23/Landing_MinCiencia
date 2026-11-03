/* Aparición escalonada: los elementos que entran juntos se animan con 90 ms de desfase entre ellos. */
(() => {
  const els = document.querySelectorAll('[data-aparecer]');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { els.forEach((e) => e.classList.add('is-visible')); return; }
  const io = new IntersectionObserver((entradas) => {
    entradas.filter((e) => e.isIntersecting).forEach((e, i) => {
      e.target.style.transitionDelay = `${i * 90}ms`;
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  els.forEach((e) => io.observe(e));
})();
