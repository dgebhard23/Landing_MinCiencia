/* Gráficos generados para Activa Startup con IA, sin imágenes externas.
   - <canvas data-chladni data-color="#97A9FC">: partículas que se ordenan sobre las líneas nodales de una placa
     de Chladni (el motivo gráfico de ElevenLabs) y cambian de modo cada pocos segundos.
     Con data-fijo no cambia solo; se cambia con canvas.cambiarModo(n).
   - <div class="orbe" data-orbe>: orbe de voz en CSS (ver activa.css · .orbe-css). Con data-orbe="pulso" late.
   - <div class="cuadros" data-cuadros="100" data-on="100" style="--cols:20">: grilla de cuadros que se
     encienden al aparecer (la barra «16 de 16 regiones» del Home MINCTCI).
   Respeta prefers-reduced-motion y se pausa fuera de pantalla. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const visible = (el, cb, umbral = .15) => new IntersectionObserver(([e]) => cb(e.isIntersecting), { threshold: umbral }).observe(el);

  // ---------- Chladni ----------
  const MODOS = [[1, 4], [2, 5], [3, 5], [1, 6], [3, 7], [2, 7], [4, 7]];
  document.querySelectorAll('[data-chladni]').forEach((cv) => {
    const ctx = cv.getContext('2d');
    const color = cv.dataset.color || '#97A9FC';
    let w = 0, h = 0, raf = 0, on = false, modo = Number(cv.dataset.modo || 0), t0 = performance.now();
    const N = Number(cv.dataset.particulas || (innerWidth < 700 ? 1400 : 2600));
    const P = Array.from({ length: N }, () => [Math.random(), Math.random()]);
    const f = (x, y, [n, m]) => Math.cos(n * Math.PI * x) * Math.cos(m * Math.PI * y) - Math.cos(m * Math.PI * x) * Math.cos(n * Math.PI * y);
    const medir = () => { const d = Math.min(devicePixelRatio || 1, 2); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * d; cv.height = h * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    const paso = (k) => {
      const m = MODOS[modo % MODOS.length];
      for (const p of P) {
        const v = Math.abs(f(p[0], p[1], m));
        // Las partículas vibran más donde la placa se mueve más y se quedan quietas en las líneas nodales
        const a = v * k;
        p[0] += (Math.random() - .5) * a; p[1] += (Math.random() - .5) * a;
        if (p[0] < 0 || p[0] > 1) p[0] = Math.random();
        if (p[1] < 0 || p[1] > 1) p[1] = Math.random();
      }
    };
    const dibujar = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      const s = Math.min(w, h), ox = (w - s) / 2, oy = (h - s) / 2, r = s < 400 ? 1 : 1.3;
      for (const p of P) ctx.fillRect(ox + p[0] * s, oy + p[1] * s, r, r);
    };
    const asentar = () => { for (let i = 0; i < 700; i++) paso(.05); };
    const fijo = cv.hasAttribute('data-fijo');
    const sacudir = () => P.forEach((p) => { p[0] += (Math.random() - .5) * .25; p[1] += (Math.random() - .5) * .25; });
    // Cambiar de figura desde afuera: canvas.cambiarModo(n)
    cv.cambiarModo = (k) => { if (k === modo) return; modo = k; sacudir(); if (reduce) { asentar(); dibujar(); } };
    const bucle = (t) => {
      if (!fijo && t - t0 > 6500) { modo++; t0 = t; sacudir(); }
      paso(.02); dibujar();
      raf = on ? requestAnimationFrame(bucle) : 0;
    };
    medir(); asentar(); dibujar();
    addEventListener('resize', () => { medir(); dibujar(); });
    if (reduce) return;
    visible(cv, (v) => { on = v; if (on && !raf) { t0 = performance.now(); raf = requestAnimationFrame(bucle); } });
  });

  // ---------- Grilla de cuadros ----------
  document.querySelectorAll('[data-cuadros]').forEach((g) => {
    const n = Number(g.dataset.cuadros), on = Math.min(n, Number(g.dataset.on ?? n));
    g.innerHTML = '<i></i>'.repeat(n);
    g.setAttribute('aria-hidden', 'true');
    const encender = () => [...g.children].slice(0, on).forEach((c, i) => setTimeout(() => c.classList.add('on'), reduce ? 0 : i * (900 / Math.max(on, 1))));
    if (reduce) { encender(); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { encender(); io.disconnect(); } }, { threshold: .4 });
    io.observe(g);
  });

  // ---------- Orbe: late mientras suena un ejemplo ----------
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-escuchar]')) return;
    document.querySelectorAll('[data-orbe="pulso"]').forEach((o) => { o.classList.add('is-hablando'); });
    const fin = () => document.querySelectorAll('[data-orbe="pulso"]').forEach((o) => o.classList.remove('is-hablando'));
    const t = setInterval(() => { if (!window.ACTIVA?.sonando) { clearInterval(t); fin(); } }, 400);
  });
})();
