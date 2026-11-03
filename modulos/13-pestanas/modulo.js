/* Pestañas: [data-pestanas] con role="tablist"/"tab"/"tabpanel". Dispara el evento "pestana:mostrar" en el panel visible. */
(() => {
  document.querySelectorAll('[data-pestanas]').forEach((caja) => {
    const tabs = [...caja.querySelectorAll('[role="tab"]')];
    const mostrar = (tab, foco) => {
      tabs.forEach((t) => {
        const on = t === tab, panel = document.getElementById(t.getAttribute('aria-controls'));
        t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; panel.hidden = !on;
        if (on) panel.dispatchEvent(new CustomEvent('pestana:mostrar', { bubbles: true }));
      });
      if (foco) tab.focus();
      history.replaceState(null, '', `#${tab.id}`);
    };
    caja.addEventListener('click', (e) => { const t = e.target.closest('[role="tab"]'); if (t) mostrar(t); });
    caja.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(document.activeElement); if (i < 0) return;
      const d = { ArrowRight: 1, ArrowLeft: -1, Home: -i, End: tabs.length - 1 - i }[e.key];
      if (d !== undefined) { e.preventDefault(); mostrar(tabs[(i + d + tabs.length) % tabs.length], true); }
    });
    mostrar(tabs.find((t) => `#${t.id}` === location.hash) || tabs[0]);
  });
})();
