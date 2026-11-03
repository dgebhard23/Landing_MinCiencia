/* Cifras: data-contar="N" cuenta de 0 a N al aparecer; data-dias-hasta="AAAA-MM-DD" calcula los días restantes. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = new Intl.NumberFormat('es-CL');
  document.querySelectorAll('[data-dias-hasta]').forEach((b) => {
    const t = new Date(`${b.dataset.diasHasta}T00:00:00-03:00`).getTime();
    b.dataset.contar = Math.max(0, Math.ceil((t - Date.now()) / 864e5));
  });
  const contar = (b) => {
    const fin = Number(b.dataset.contar), suf = b.dataset.sufijo || '';
    if (reduce) { b.textContent = fmt.format(fin) + suf; return; }
    const t0 = performance.now(), dur = 1400;
    const paso = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      b.textContent = fmt.format(Math.round(fin * e)) + suf;
      if (k < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  };
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { contar(e.target); io.unobserve(e.target); } }), { threshold: .6 });
  document.querySelectorAll('[data-contar]').forEach((b) => { b.textContent = '0'; io.observe(b); });
})();
