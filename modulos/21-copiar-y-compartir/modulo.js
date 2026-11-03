/* Copiar: data-copiar="selector" (copia el texto del elemento) o data-copiar-texto="...".
   Compartir: data-compartir con data-titulo/data-texto (usa la URL actual). Aviso: Avisar('texto'). */
(() => {
  const caja = document.querySelector('[data-aviso-flotante]');
  let t;
  window.Avisar = (msg) => { if (!caja) return; caja.textContent = msg; caja.classList.add('is-visible'); clearTimeout(t); t = setTimeout(() => caja.classList.remove('is-visible'), 2200); };
  const copiar = async (txt) => {
    try { await navigator.clipboard.writeText(txt); return true; }
    catch { const ta = Object.assign(document.createElement('textarea'), { value: txt }); document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok; }
  };
  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-copiar], [data-copiar-texto]');
    if (b) { const txt = b.dataset.copiarTexto || document.querySelector(b.dataset.copiar)?.textContent.trim() || ''; Avisar((await copiar(txt)) ? 'Copiado ✓' : 'Selecciona el texto y usa Ctrl+C'); }
    const s = e.target.closest('[data-compartir]');
    if (s) {
      const datos = { title: s.dataset.titulo || document.title, text: s.dataset.texto || '', url: location.href };
      if (navigator.share) { try { await navigator.share(datos); } catch { /* cancelado */ } return; }
      const redes = document.querySelector('[data-redes]'), u = encodeURIComponent(datos.url), tx = encodeURIComponent(`${datos.text} ${datos.url}`);
      redes.innerHTML = `<a class="btn btn--linea" target="_blank" rel="noopener" href="https://wa.me/?text=${tx}">WhatsApp</a>
        <a class="btn btn--linea" target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=${u}">LinkedIn</a>
        <a class="btn btn--linea" href="mailto:?subject=${encodeURIComponent(datos.title)}&body=${tx}">Correo</a>
        <button class="btn btn--linea" type="button" data-copiar-texto="${datos.url}">Copiar enlace</button>`;
      redes.hidden = false;
    }
  });
})();
