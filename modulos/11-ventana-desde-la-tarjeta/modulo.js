/* Ventana desde la tarjeta: botones con data-abrir="idDelDialog"; dentro del <dialog>, [data-cerrar].
   El contenido animado en cascada es el de .ventana__in. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, EASE = 'cubic-bezier(.22, 1, .36, 1)';
  const abrir = (d, origen) => {
    d.showModal();
    if (reduce || !origen) return;
    const a = origen.getBoundingClientRect(), b = d.getBoundingClientRect();
    d.animate([
      { transform: `translate(${a.left + a.width / 2 - b.left - b.width / 2}px, ${a.top + a.height / 2 - b.top - b.height / 2}px) scale(${a.width / b.width}, ${a.height / b.height})`, opacity: .3 },
      { transform: 'none', opacity: 1 }], { duration: 560, easing: EASE });
    [...(d.querySelector('.ventana__in')?.children || [])].forEach((el, i) => el.animate(
      [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 480, delay: 160 + i * 45, easing: EASE, fill: 'backwards' }));
  };
  const cerrar = (d) => {
    if (reduce || d.classList.contains('is-cerrando')) { d.close(); return; }
    d.classList.add('is-cerrando');
    d.animate([{ opacity: 1 }, { transform: 'translateY(24px) scale(.96)', opacity: 0 }], { duration: 240, easing: 'ease-in' })
      .finished.then(() => { d.classList.remove('is-cerrando'); d.close(); });
  };
  document.querySelectorAll('[data-abrir]').forEach((b) => b.addEventListener('click', () => {
    const d = document.getElementById(b.dataset.abrir); if (d) abrir(d, b.closest('.tarjeta') || b);
  }));
  document.querySelectorAll('dialog.ventana').forEach((d) => {
    d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-cerrar]')) cerrar(d); });
    d.addEventListener('cancel', (e) => { e.preventDefault(); cerrar(d); });
  });
  window.Ventana = { abrir, cerrar };
})();
