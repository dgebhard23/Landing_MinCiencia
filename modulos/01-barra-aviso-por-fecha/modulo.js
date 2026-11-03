/* Barra de aviso según la fecha. Lee data-abre / data-cierra (AAAA-MM-DD, hora de Santiago)
   y los textos data-antes / data-durante / data-despues. Si un texto está vacío, la barra se oculta. */
(() => {
  const DIA = 864e5;
  const inicio = (iso) => new Date(`${iso}T00:00:00-03:00`).getTime();
  const fin = (iso) => new Date(`${iso}T23:59:59-03:00`).getTime();
  const fLarga = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Santiago' });
  const fCorta = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long', timeZone: 'America/Santiago' });
  const larga = (iso) => fLarga.format(new Date(`${iso}T12:00:00-03:00`));
  const corta = (iso) => fCorta.format(new Date(`${iso}T12:00:00-03:00`));

  function pintar(barra, ahora = Date.now()) {
    const { abre, cierra, antes = '', durante = '', despues = '' } = barra.dataset;
    let txt;
    if (ahora < inicio(abre)) txt = antes;
    else if (ahora <= fin(cierra)) txt = durante;
    else txt = despues;
    const faltan = Math.max(0, Math.ceil((inicio(abre) - ahora) / DIA));
    const quedan = Math.max(0, Math.ceil((fin(cierra) - ahora) / DIA));
    txt = txt.replace('{abre}', corta(abre)).replace('{cierra}', larga(cierra))
      .replace('{faltan}', faltan === 0 ? 'hoy' : `faltan ${faltan} ${faltan === 1 ? 'día' : 'días'}`)
      .replace('{quedan}', quedan <= 1 ? 'último día' : `quedan ${quedan} días`);
    barra.textContent = txt;
    barra.hidden = !txt;
  }
  window.BarraAviso = { pintar };
  document.querySelectorAll('[data-aviso]').forEach((b) => pintar(b));
})();
