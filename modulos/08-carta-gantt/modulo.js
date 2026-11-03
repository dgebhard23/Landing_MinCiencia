/* Carta Gantt: cada <li> lleva data-desde / data-hasta (AAAA-MM-DD) y opcionalmente data-estado
   (hecho | curso | proximo; si falta, se deduce de la fecha). Las marcas usan data-en="hoy" o una fecha. */
(() => {
  const ini = (iso) => new Date(`${iso}T00:00:00-03:00`).getTime();
  const fin = (iso) => new Date(`${iso}T23:59:59-03:00`).getTime();
  const MAP = { done: 'hecho', live: 'curso', next: 'proximo' };
  document.querySelectorAll('[data-gantt]').forEach((g) => {
    const g0 = ini(g.dataset.inicio), g1 = fin(g.dataset.fin), ahora = Date.now();
    const pct = (t) => Math.min(100, Math.max(0, ((t - g0) / (g1 - g0)) * 100));
    // Meses
    const meses = g.querySelector('[data-meses]');
    if (meses) {
      const d = new Date(g0), lista = [];
      while (d.getTime() <= g1) { lista.push(d.toLocaleDateString('es-CL', { month: 'short' }).replace('.', '')); d.setMonth(d.getMonth() + 1); }
      meses.style.gridTemplateColumns = `repeat(${lista.length}, 1fr)`;
      meses.innerHTML = lista.map((m) => `<span>${m}</span>`).join('');
    }
    let enCurso = null;
    g.querySelectorAll('.gantt__filas li').forEach((li, i) => {
      const a = ini(li.dataset.desde), b = fin(li.dataset.hasta);
      const barra = li.querySelector('.gantt__barra');
      barra.style.setProperty('--l', `${pct(a)}%`); barra.style.setProperty('--w', `${Math.max(.8, pct(b) - pct(a))}%`);
      barra.style.transitionDelay = `${i * 80}ms`;
      const est = MAP[li.dataset.estado] || li.dataset.estado || (ahora > b ? 'hecho' : ahora >= a ? 'curso' : 'proximo');
      li.classList.add(`is-${est}`);
      if (est === 'curso' && !enCurso) enCurso = li;
    });
    g.querySelectorAll('.gantt__marca').forEach((m) => {
      const t = m.dataset.en === 'hoy' ? ahora : ini(m.dataset.en);
      if (t < g0 || t > g1) { m.hidden = true; return; }
      m.style.setProperty('--x', pct(t)); m.classList.toggle('is-borde', pct(t) > 75);
    });
    const txt = document.querySelector('[data-fase-actual]');
    if (txt) txt.textContent = enCurso ? `Fase en curso: ${enCurso.querySelector('.gantt__nom').textContent}` : '';
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { g.classList.add('is-visible'); o.disconnect(); } }, { threshold: .25 }).observe(g);
  });
})();
