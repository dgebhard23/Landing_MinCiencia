/* Logos: <li data-logo="ruta.png" data-nombre="Nombre">. Si data-logo está vacío o falla, se muestra el nombre. */
(() => {
  document.querySelectorAll('[data-logo]').forEach((li) => {
    const pastilla = () => li.insertAdjacentHTML('afterbegin', `<span class="pastilla">${li.dataset.nombre}</span>`);
    if (!li.dataset.logo) return pastilla();
    const img = new Image(); img.alt = li.dataset.nombre; img.src = li.dataset.logo; img.loading = 'lazy';
    img.onerror = () => { img.remove(); pastilla(); };
    li.prepend(img);
  });
})();
