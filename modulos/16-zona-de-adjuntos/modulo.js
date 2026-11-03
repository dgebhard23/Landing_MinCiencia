/* Zona de adjuntos: [data-adjuntos] con data-tipos, data-max-mb, data-total-mb, data-max (cantidad).
   API: Adjuntos.base64(caja) -> Promise<[{nombre, tipo, tamano, datos}]> */
(() => {
  const MB = 1024 * 1024, peso = (b) => (b < MB ? `${Math.round(b / 1024)} KB` : `${(b / MB).toFixed(1)} MB`);
  const leer = (f) => new Promise((ok, ko) => { const r = new FileReader(); r.onload = () => ok({ nombre: f.name, tipo: f.type || 'application/octet-stream', tamano: f.size, datos: String(r.result).split(',')[1] }); r.onerror = ko; r.readAsDataURL(f); });
  window.Adjuntos = { base64: (caja) => Promise.all((caja._archivos || []).map(leer)) };
  document.querySelectorAll('[data-adjuntos]').forEach((caja) => {
    const input = caja.querySelector('[data-adj-input]'), zona = caja.querySelector('[data-adj-zona]'), lista = caja.querySelector('[data-adj-lista]'), err = caja.querySelector('[data-adj-err]');
    const tipos = (caja.dataset.tipos || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    const maxMb = Number(caja.dataset.maxMb || 10), totalMb = Number(caja.dataset.totalMb || 25), max = Number(caja.dataset.max || 10);
    caja._archivos = []; input.accept = tipos.join(',');
    const pintar = () => { lista.innerHTML = caja._archivos.map((f, i) => `<li><span>${f.name} · <small>${peso(f.size)}</small></span><button type="button" data-q="${i}">Quitar</button></li>`).join(''); };
    const sumar = (archivos) => {
      err.textContent = '';
      for (const f of archivos) {
        const ext = '.' + f.name.split('.').pop().toLowerCase();
        if (tipos.length && !tipos.includes(ext)) { err.textContent = `«${f.name}» no es un formato permitido.`; continue; }
        if (f.size > maxMb * MB) { err.textContent = `«${f.name}» supera los ${maxMb} MB.`; continue; }
        if (caja._archivos.length >= max) { err.textContent = `Puedes subir hasta ${max} archivos.`; break; }
        if (caja._archivos.reduce((s, x) => s + x.size, 0) + f.size > totalMb * MB) { err.textContent = `Entre todos los archivos no pueden pasar de ${totalMb} MB.`; break; }
        caja._archivos.push(f);
      }
      pintar(); caja.dispatchEvent(new CustomEvent('adjuntos:cambio', { bubbles: true }));
    };
    zona.addEventListener('click', () => input.click());
    zona.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
    input.addEventListener('change', () => { sumar([...input.files]); input.value = ''; });
    ['dragenter', 'dragover'].forEach((ev) => zona.addEventListener(ev, (e) => { e.preventDefault(); zona.classList.add('is-encima'); }));
    ['dragleave', 'drop'].forEach((ev) => zona.addEventListener(ev, (e) => { e.preventDefault(); zona.classList.remove('is-encima'); }));
    zona.addEventListener('drop', (e) => sumar([...e.dataTransfer.files]));
    lista.addEventListener('click', (e) => { const b = e.target.closest('[data-q]'); if (b) { caja._archivos.splice(Number(b.dataset.q), 1); pintar(); } });
  });
})();
