/* Tabla: [data-tabla] con <table>. Columnas numéricas: <th data-tipo="num">. Filtros: <select data-tabla-filtro="índiceColumna">. */
(() => {
  document.querySelectorAll('[data-tabla]').forEach((caja) => {
    const tabla = caja.querySelector('table'), cuerpo = tabla.tBodies[0], ths = [...tabla.tHead.rows[0].cells];
    const filas = [...cuerpo.rows], buscar = caja.querySelector('[data-tabla-buscar]'), sels = [...caja.querySelectorAll('[data-tabla-filtro]')];
    const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const nf = new Intl.NumberFormat('es-CL');
    ths.forEach((th) => th.setAttribute('aria-sort', 'none'));
    const filtrar = () => {
      const q = norm(buscar?.value || '');
      let n = 0, suma = 0;
      filas.forEach((tr) => {
        const ok = (!q || norm(tr.textContent).includes(q)) && sels.every((s) => !s.value || tr.cells[s.dataset.tablaFiltro].textContent.trim() === s.value);
        tr.hidden = !ok; if (ok) { n++; suma += Number(tr.cells[tr.cells.length - 1].textContent) || 0; }
      });
      caja.querySelector('[data-tabla-total]').textContent = `${n} de ${filas.length} registros`;
      const s = caja.querySelector('[data-tabla-suma]'); if (s) s.textContent = nf.format(suma);
    };
    ths.forEach((th, i) => th.addEventListener('click', () => {
      const asc = th.getAttribute('aria-sort') !== 'ascending', num = th.dataset.tipo === 'num';
      ths.forEach((x) => x.setAttribute('aria-sort', 'none')); th.setAttribute('aria-sort', asc ? 'ascending' : 'descending');
      filas.sort((a, b) => { const x = a.cells[i].textContent.trim(), y = b.cells[i].textContent.trim(); const r = num ? Number(x) - Number(y) : x.localeCompare(y, 'es'); return asc ? r : -r; })
        .forEach((tr) => cuerpo.appendChild(tr));
    }));
    caja.querySelector('[data-tabla-csv]')?.addEventListener('click', () => {
      const celda = (t) => `"${t.trim().replace(/"/g, '""')}"`;
      const lineas = [ths.map((t) => celda(t.textContent.replace(/[↕↑↓]/g, ''))).join(';'), ...filas.filter((f) => !f.hidden).map((f) => [...f.cells].map((c) => celda(c.textContent)).join(';'))];
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob(['\ufeff' + lineas.join('\r\n')], { type: 'text/csv;charset=utf-8' })), download: 'registros.csv' });
      a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    });
    buscar?.addEventListener('input', filtrar); sels.forEach((s) => s.addEventListener('change', filtrar)); filtrar();
  });
})();
