/* Gráficos: <canvas data-grafico="barras|dona|lineas" data-etiquetas='[..]' data-valores='[[..],[..]]' data-series='[..]'>.
   Requiere Chart.js 4 cargado antes. Se dibujan al entrar en pantalla. */
(() => {
  const iniciar = () => {
    if (!window.Chart) return setTimeout(iniciar, 150);
    const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
    const paleta = [1, 2, 3, 4, 5, 6].map((n) => css(`--serie-${n}`));
    Chart.defaults.font.family = css('--f-texto'); Chart.defaults.color = css('--c-texto-suave');
    Chart.defaults.locale = 'es-CL'; Chart.defaults.plugins.legend.labels.usePointStyle = true;
    const tipo = { barras: 'bar', dona: 'doughnut', lineas: 'line' };
    const dibujar = (cv) => {
      const t = cv.dataset.grafico, et = JSON.parse(cv.dataset.etiquetas), vals = JSON.parse(cv.dataset.valores), series = JSON.parse(cv.dataset.series || '[]');
      new Chart(cv, {
        type: tipo[t],
        data: { labels: et, datasets: vals.map((v, i) => ({ label: series[i] || '', data: v,
          backgroundColor: t === 'dona' ? paleta : paleta[i], borderColor: t === 'lineas' ? paleta[i] : (t === 'dona' ? css('--c-superficie') : paleta[i]),
          borderRadius: t === 'barras' ? 8 : 0, tension: .35, pointRadius: 4, borderWidth: t === 'lineas' ? 3 : 2 })) },
        options: { responsive: true, maintainAspectRatio: false, cutout: t === 'dona' ? '62%' : undefined,
          plugins: { legend: { display: t === 'dona' || series.length > 1, position: 'bottom' } },
          scales: t === 'dona' ? {} : { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: css('--c-borde') } } } },
      });
      cv.parentElement.style.height = cv.parentElement.style.height || '400px';
    };
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { dibujar(e.target); io.unobserve(e.target); } }), { threshold: .2 });
    document.querySelectorAll('canvas[data-grafico]').forEach((c) => io.observe(c));
  };
  iniciar();
})();
