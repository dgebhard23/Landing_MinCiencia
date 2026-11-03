/* Hitos: cada <li data-fecha="AAAA-MM-DD"> se mueve a «Completado» si ya pasó. Muestra solo 6 próximos. */
(() => {
  const lista = document.querySelector('[data-hitos]'), hechos = document.querySelector('[data-hechos]');
  if (!lista || !hechos) return;
  const fin = (iso) => new Date(`${iso}T23:59:59-03:00`).getTime();
  const f = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Santiago' });
  const ahora = Date.now(), MAX = 6, proximos = [];
  [...lista.children].sort((a, b) => a.dataset.fecha.localeCompare(b.dataset.fecha)).forEach((li) => {
    li.querySelector('time').textContent = f.format(new Date(`${li.dataset.fecha}T12:00:00-03:00`));
    li.querySelector('time').dateTime = li.dataset.fecha;
    (ahora > fin(li.dataset.fecha) ? hechos : (proximos.push(li), lista)).appendChild(li);
  });
  [...hechos.children].reverse().forEach((li) => hechos.appendChild(li));
  document.querySelector('[data-n-hechos]').textContent = `(${hechos.children.length})`;
  const sig = proximos[0];
  if (sig) {
    sig.classList.add('is-proximo');
    const dias = Math.max(0, Math.ceil((new Date(`${sig.dataset.fecha}T00:00:00-03:00`) - ahora) / 864e5));
    document.querySelector('[data-proximo]').textContent = `Próximo hito: ${sig.querySelector('span').textContent} · ${dias === 0 ? 'hoy' : `en ${dias} días`}`;
  }
  const extra = proximos.slice(MAX);
  extra.forEach((li) => { li.hidden = true; });
  if (extra.length) lista.insertAdjacentHTML('afterend', `<p class="hitos__mas">y ${extra.length} ${extra.length === 1 ? 'hito más' : 'hitos más'} hasta el ${extra.at(-1).querySelector('time').textContent}.</p>`);
})();
