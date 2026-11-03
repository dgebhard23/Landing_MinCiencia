/* Hoja de ruta en U. Datos: <script type="application/json" id="fases-ruta"> con n, nombre, texto, fechas,
   estado (done|live|next) y participa (true/false). Contenedores: [data-ruta] y [data-ruta-panel]. */
(() => {
  const ruta = document.querySelector('[data-ruta]'), panel = document.querySelector('[data-ruta-panel]');
  const fuente = document.getElementById('fases-ruta');
  if (!ruta || !panel || !fuente) return;
  const fases = JSON.parse(fuente.textContent);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const N = fases.length, ARRIBA = Math.ceil(N / 2) + (N % 2 ? 0 : 1); // paradas en la ida
  const ESTADO = { done: ['Realizado', 'estado--hecho'], live: ['En curso', 'estado--curso'], next: ['Próximo', 'estado--proximo'] };
  const DISPOSICION = {
    ancho: { w: 1200, h: 640,
      pt: (k) => k < ARRIBA ? [110 + k * (980 / Math.max(1, ARRIBA - 1)), 120 + (k % 2 ? -14 : 14)]
                            : [1000 - (k - ARRIBA) * (900 / Math.max(1, N - ARRIBA)), 520 + (k % 2 ? 14 : -14)],
      lado: (k) => (k < ARRIBA ? 'arriba' : 'abajo'), fin: [60, 520] },
    alto: { w: 360, h: 140 * N + 120, pt: (k) => [k % 2 ? 112 : 42, 80 + k * 132], lado: () => 'der', fin: [77, 132 * N + 80] },
  };
  const camino = (m, ultimo) => {
    const P = fases.slice(0, ultimo + 1).map((_, k) => DISPOSICION[m].pt(k));
    const [x0, y0] = P[0];
    let d = m === 'ancho' ? `M 20 ${y0} L ${x0} ${y0}` : `M ${x0} 10 L ${x0} ${y0}`;
    for (let k = 1; k < P.length; k++) {
      const [xa, ya] = P[k - 1], [xb, yb] = P[k];
      if (m === 'ancho' && k === ARRIBA) { d += ` C 1220 ${ya} 1220 ${yb} ${xb} ${yb}`; continue; }
      d += m === 'ancho' ? ` C ${(xa + xb) / 2} ${ya} ${(xa + xb) / 2} ${yb} ${xb} ${yb}` : ` C ${xa} ${(ya + yb) / 2} ${xb} ${(ya + yb) / 2} ${xb} ${yb}`;
    }
    if (ultimo === N - 1) {
      const [xe, ye] = P[P.length - 1], [fx, fy] = DISPOSICION[m].fin;
      d += m === 'ancho' ? ` C ${(xe + fx) / 2} ${ye} ${(xe + fx) / 2} ${fy} ${fx} ${fy}` : ` C ${xe} ${(ye + fy) / 2} ${fx} ${(ye + fy) / 2} ${fx} ${fy}`;
    }
    return d;
  };
  let sel = Math.max(0, fases.findIndex((f) => f.estado === 'live')), modo = null;
  const elegir = (i, foco) => {
    sel = i;
    ruta.querySelectorAll('.parada').forEach((p, k) => { p.classList.toggle('is-sel', k === i); p.querySelector('button').setAttribute('aria-pressed', String(k === i)); });
    const f = fases[i], [txt, cls] = ESTADO[f.estado];
    panel.classList.toggle('is-live', f.estado === 'live');
    panel.hidden = false;
    panel.innerHTML = `<span class="ruta-panel__n">${f.n}</span>
      <div><p class="ruta-panel__meta"><span>Fase ${f.n}</span><span>${f.fechas}</span><span class="estado ${cls}">${txt}</span></p>
      <h3>${f.nombre}</h3><p>${f.texto}</p></div>
      <div class="ruta-panel__nav"><button type="button" aria-label="Fase anterior" ${i === 0 ? 'disabled' : ''} data-ant>←</button><button type="button" aria-label="Fase siguiente" ${i === N - 1 ? 'disabled' : ''} data-sig>→</button></div>`;
    panel.querySelector('[data-ant]').onclick = () => elegir(i - 1, true);
    panel.querySelector('[data-sig]').onclick = () => elegir(i + 1, true);
    if (foco) ruta.querySelectorAll('.parada__pin')[i]?.focus({ preventScroll: true });
  };
  const armar = () => {
    const m = innerWidth < 768 ? 'alto' : 'ancho', clave = m + (innerWidth >= 1100 ? '+' : '');
    if (clave === modo) return; modo = clave;
    const D = DISPOSICION[m], todo = camino(m, N - 1);
    ruta.style.aspectRatio = `${D.w} / ${D.h}`;
    const alcanzado = fases.reduce((acc, f, k) => (f.estado !== 'next' ? k : acc), -1);
    ruta.innerHTML = `<svg viewBox="0 0 ${D.w} ${D.h}" aria-hidden="true"><path class="ruta__borde" d="${todo}"/><path class="ruta__via" d="${todo}"/>${alcanzado >= 0 ? `<path class="ruta__hecho" d="${camino(m, alcanzado)}"/>` : ''}<path class="ruta__trazo" d="${todo}"/></svg>`;
    fases.forEach((f, k) => {
      const [x, y] = D.pt(k), p = document.createElement('div');
      p.className = `parada is-${f.estado}`; p.style.left = `${(x / D.w) * 100}%`; p.style.top = `${(y / D.h) * 100}%`;
      p.innerHTML = `<button class="parada__pin" type="button" aria-pressed="false" aria-label="Fase ${f.n}: ${f.nombre}">${f.n}</button>
        <span class="parada__txt parada__txt--${D.lado(k)}">${f.participa ? '<em>Participa</em><br>' : ''}<small>${f.fechas}</small>${f.nombre}</span>`;
      p.querySelector('button').addEventListener('click', () => { elegir(k); if (m === 'alto') panel.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }); });
      ruta.appendChild(p);
    });
    const dentro = m === 'ancho' && innerWidth >= 1100;
    panel.classList.toggle('ruta-panel--dentro', dentro);
    if (dentro) ruta.appendChild(panel); else ruta.after(panel);
    const hecho = ruta.querySelector('.ruta__hecho');
    if (hecho) {
      const L = hecho.getTotalLength(); hecho.style.strokeDasharray = L; hecho.style.strokeDashoffset = L;
      const crecer = () => requestAnimationFrame(() => { hecho.style.strokeDashoffset = '0'; });
      if (reduce) crecer(); else new IntersectionObserver(([e], o) => { if (e.isIntersecting) { crecer(); o.disconnect(); } }, { threshold: .3 }).observe(ruta);
    }
    elegir(sel);
  };
  armar(); addEventListener('resize', armar);
  ruta.addEventListener('keydown', (e) => {
    if (!e.target.closest('.parada__pin')) return;
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (d && fases[sel + d]) { e.preventDefault(); elegir(sel + d, true); }
  });
})();
