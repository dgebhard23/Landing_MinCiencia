/* Contenido desde Google Sheets. [data-hoja] con data-csv (URL publicada como CSV; si está vacío usa
   <script type="text/csv" id="csv-ejemplo">), data-col-* (nombres de columna) y data-por-pagina. */
(() => {
  const parseCSV = (s) => {
    const filas = [[]]; let q = false, celda = '';
    for (let i = 0; i < s.length; i++) {
      const c = s[i], n = s[i + 1];
      if (c === '"' && q && n === '"') { celda += '"'; i++; }
      else if (c === '"') q = !q;
      else if (c === ',' && !q) { filas.at(-1).push(celda); celda = ''; }
      else if ((c === '\n' || c === '\r') && !q) { if (c === '\r' && n === '\n') i++; filas.at(-1).push(celda); celda = ''; filas.push([]); }
      else celda += c;
    }
    filas.at(-1).push(celda);
    return filas.filter((f) => f.some((x) => x.trim()));
  };
  const drive = (u) => { const m = (u || '').match(/\/d\/([\w-]+)|id=([\w-]+)/); return m ? `https://drive.google.com/thumbnail?id=${m[1] || m[2]}&sz=w800` : u; };
  const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  document.querySelectorAll('[data-hoja]').forEach(async (h) => {
    const D = h.dataset, estado = h.querySelector('[data-hoja-estado]'), grilla = h.querySelector('[data-hoja-grilla]');
    const filtros = h.querySelector('[data-hoja-filtros]'), pag = h.querySelector('[data-hoja-pag]'), buscar = h.querySelector('[data-hoja-buscar]');
    const porPag = Number(D.porPagina || 9);
    let texto;
    try {
      if (D.csv) texto = await (await fetch(D.csv + (D.csv.includes('?') ? '&' : '?') + '_t=' + Math.floor(Date.now() / 3e5))).text(); // caché de 5 min
      else texto = document.getElementById('csv-ejemplo').textContent.trim();
    } catch { estado.textContent = 'No pudimos cargar la información. Inténtalo más tarde.'; return; }
    const [cab, ...filas] = parseCSV(texto);
    const col = (n) => cab.findIndex((c) => norm(c.trim()) === norm(n || ''));
    const C = { cat: col(D.colCategoria), tit: col(D.colTitulo), txt: col(D.colTexto), url: col(D.colEnlace), img: col(D.colImagen) };
    const datos = filas.map((f) => ({ cat: f[C.cat]?.trim() || '', tit: f[C.tit]?.trim() || '', txt: f[C.txt]?.trim() || '', url: f[C.url]?.trim() || '', img: f[C.img]?.trim() || '' })).filter((d) => d.tit);
    let cat = 'todas', pagina = 1;
    const cuenta = datos.reduce((o, d) => ((o[d.cat] = (o[d.cat] || 0) + 1), o), {});
    filtros.innerHTML = [['todas', 'Todas', datos.length], ...Object.entries(cuenta).sort().map(([c, n]) => [c, c, n])]
      .map(([v, t, n]) => `<button type="button" data-c="${esc(v)}" aria-pressed="${v === 'todas'}">${esc(t)}<b>${n}</b></button>`).join('');
    const pintar = () => {
      const q = norm(buscar?.value || '');
      const vis = datos.filter((d) => (cat === 'todas' || d.cat === cat) && (!q || norm(`${d.tit} ${d.txt} ${d.cat}`).includes(q)));
      const paginas = Math.max(1, Math.ceil(vis.length / porPag)); pagina = Math.min(pagina, paginas);
      grilla.innerHTML = vis.slice((pagina - 1) * porPag, pagina * porPag).map((d) => `<a class="hoja__card" href="${esc(d.url || '#')}" target="_blank" rel="noopener">
        ${d.img ? `<img src="${esc(drive(d.img))}" alt="" loading="lazy">` : ''}<small>${esc(d.cat)}</small><h3>${esc(d.tit)}</h3><p>${esc(d.txt)}</p></a>`).join('');
      estado.textContent = vis.length ? `${vis.length} resultado${vis.length === 1 ? '' : 's'}` : 'No hay resultados para tu búsqueda.';
      pag.innerHTML = paginas > 1 ? Array.from({ length: paginas }, (_, i) => `<button type="button" aria-current="${i + 1 === pagina}">${i + 1}</button>`).join('') : '';
    };
    filtros.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; cat = b.dataset.c; pagina = 1; filtros.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); pintar(); });
    pag.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { pagina = Number(b.textContent); pintar(); h.scrollIntoView({ behavior: 'smooth', block: 'start' }); } });
    buscar?.addEventListener('input', () => { pagina = 1; pintar(); });
    pintar();
  });
})();
