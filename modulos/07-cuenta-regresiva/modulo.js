/* Cuenta regresiva: data-cuenta con fecha ISO completa; cada [data-u] es d, h, m o s. */
(() => {
  document.querySelectorAll('[data-cuenta]').forEach((reloj) => {
    const meta = new Date(reloj.dataset.cuenta).getTime();
    const unidades = [...reloj.querySelectorAll('[data-u]')];
    const armar = (b, n) => {
      b.textContent = ''; b.dataset.n = n;
      for (let i = 0; i < n; i++) {
        const d = document.createElement('span'); d.className = 'digito';
        d.innerHTML = `<span class="digito__rollo">${[...'0123456789'].map((x) => `<span>${x}</span>`).join('')}</span>`;
        b.appendChild(d);
      }
    };
    const poner = (b, v, n) => {
      const s = String(v).padStart(n, '0');
      if (Number(b.dataset.n) !== s.length) armar(b, s.length);
      [...b.children].forEach((d, i) => { d.firstChild.style.transform = `translateY(${-Number(s[i])}em)`; });
      b.setAttribute('aria-label', String(v));
    };
    const tic = () => {
      const t = Math.max(0, meta - Date.now());
      const v = { d: Math.floor(t / 864e5), h: Math.floor(t / 36e5) % 24, m: Math.floor(t / 6e4) % 60, s: Math.floor(t / 1e3) % 60 };
      unidades.forEach((b) => { const k = b.dataset.u; poner(b, v[k], k === 'd' ? Math.max(2, String(v.d).length) : 2); });
    };
    tic(); setInterval(tic, 1000);
  });
})();
