/* Haces de luz en canvas. Colores: --serie-1 (base), --c-primario-suave (brillo) y --c-acento (haz tenue).
   Uso: <canvas data-haces></canvas> dentro de un contenedor con tamaño. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  document.querySelectorAll('[data-haces]').forEach((canvas) => {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, raf = 0, visible = true;
    const t0 = performance.now();
    const fondo = css('--c-oscuro-fondo') || '#0d1018';
    const haces = [
      { y0: 1.10, y1: .50, curva: .44, ancho: .20, lineas: 54, col: [fondo, css('--serie-1'), '#ffffff'], vel: .00006, fase: 0 },
      { y0: 1.28, y1: .66, curva: .32, ancho: .15, lineas: 44, col: [fondo, css('--c-primario'), css('--c-primario-suave')], vel: .00008, fase: 2 },
      { y0: 1.46, y1: .84, curva: .22, ancho: .13, lineas: 40, col: [fondo, css('--c-acento'), css('--c-acento-suave')], vel: .00005, fase: 4 },
    ];
    const medir = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduce) dibujar(0);
    };
    const dibujar = (t) => {
      ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = fondo; ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      const movil = w < 768, tenue = movil ? .5 : 1;
      for (const b of haces) {
        const g = ctx.createLinearGradient(0, h, w, 0);
        g.addColorStop(0, b.col[0]); g.addColorStop(.55, b.col[1]); g.addColorStop(1, b.col[2]);
        ctx.strokeStyle = g;
        for (let i = 0; i < b.lineas; i++) {
          const k = i / b.lineas, nucleo = Math.pow(Math.sin(Math.PI * k), 4);
          const ola = Math.sin(t * b.vel * 6 + k * 5 + b.fase) * .025, off = (k - .5) * b.ancho + ola;
          ctx.beginPath();
          ctx.moveTo(w * (movil ? -.6 : -.15), h * (b.y0 + off));
          ctx.bezierCurveTo(w * (.28 + off), h * (b.y0 - b.curva + off * 1.4 + ola), w * (.62 + off * .5), h * (b.y1 + off * 1.8 - ola), w * 1.15, h * (b.y1 - .12 + off * 2.4));
          ctx.globalAlpha = (.025 + .05 * nucleo) * tenue; ctx.lineWidth = 14 + 26 * nucleo; ctx.stroke();
          ctx.globalAlpha = (.10 + .55 * nucleo) * tenue; ctx.lineWidth = .8 + 3.2 * nucleo; ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    };
    const bucle = (t) => { dibujar(t - t0); raf = visible ? requestAnimationFrame(bucle) : 0; };
    medir(); addEventListener('resize', medir);
    if (reduce) return;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(bucle); }).observe(canvas);
    document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (visible && !raf) raf = requestAnimationFrame(bucle); });
  });
})();
