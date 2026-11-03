/* FAQ: <details data-tema="..."> dentro de [data-faq]. Buscador [data-faq-buscar], temas [data-faq-temas]. */
(() => {
  const caja = document.querySelector('[data-faq]');
  if (!caja) return;
  const items = [...caja.querySelectorAll('details')];
  const buscar = document.querySelector('[data-faq-buscar]'), temasEl = document.querySelector('[data-faq-temas]'), vacio = document.querySelector('[data-faq-vacio]');
  const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  items.forEach((d) => { d._orig = d.innerHTML; });
  let tema = 'todos';
  // Una abierta a la vez
  caja.addEventListener('click', (e) => { const s = e.target.closest('summary'); if (s && !s.parentElement.open) items.forEach((d) => { d.open = false; }); });
  // Temas con contadores
  if (temasEl) {
    const cuenta = items.reduce((o, d) => ((o[d.dataset.tema] = (o[d.dataset.tema] || 0) + 1), o), {});
    temasEl.innerHTML = [['todos', 'Todas', items.length], ...Object.entries(cuenta).map(([t, n]) => [t, t[0].toUpperCase() + t.slice(1), n])]
      .map(([t, txt, n]) => `<button type="button" data-t="${t}" aria-pressed="${t === 'todos'}">${txt}<b>${n}</b></button>`).join('');
    temasEl.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; tema = b.dataset.t; temasEl.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); filtrar(); });
  }
  const resaltar = (html, q) => !q ? html : html.replace(/>([^<]+)</g, (m, t) => '>' + t.replace(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), '<mark>$1</mark>') + '<');
  const filtrar = () => {
    const q = (buscar?.value || '').trim();
    let visibles = 0;
    items.forEach((d) => {
      d.innerHTML = d._orig;
      const ok = (tema === 'todos' || d.dataset.tema === tema) && (!q || norm(d.textContent).includes(norm(q)));
      d.hidden = !ok; if (ok) { visibles++; if (q) { d.innerHTML = resaltar(d._orig, q); d.open = true; } else d.open = false; }
    });
    if (vacio) vacio.hidden = visibles > 0;
  };
  buscar?.addEventListener('input', filtrar);
})();
