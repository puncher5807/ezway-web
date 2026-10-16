// Tlačítko "Uložit offline": uloží stránky země do Cache Storage (cache "ezway-saved").
// Obecný vzhled webu (CSS, JS, písma, úvodní stránky) uloží service worker sám při první návštěvě.
(() => {
  const root = document.querySelector('[data-offline]');
  if (!root || !('caches' in window)) return; // bez podpory zůstane blok skrytý
  const CACHE = 'ezway-saved';
  const urls = JSON.parse(root.dataset.urls || '[]');
  const probe = root.dataset.probe;

  const show = (state) => {
    root.querySelectorAll('[data-state]').forEach((el) => {
      el.hidden = el.dataset.state !== state;
    });
  };

  async function save() {
    show('busy');
    try {
      const cache = await caches.open(CACHE);
      await cache.addAll(urls.map((url) => new Request(url, { cache: 'reload' })));
      try {
        if (navigator.storage && navigator.storage.persist) await navigator.storage.persist();
      } catch (error) {
        /* prohlížeč o trvalé úložiště nepožádal, uložení přesto proběhlo */
      }
      show('saved');
    } catch (error) {
      show('error');
    }
  }

  async function remove() {
    try {
      const cache = await caches.open(CACHE);
      await Promise.all(urls.map((url) => cache.delete(url)));
    } finally {
      show('idle');
    }
  }

  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-act]');
    if (!button) return;
    if (button.dataset.act === 'save' || button.dataset.act === 'retry') save();
    if (button.dataset.act === 'remove') remove();
  });

  root.hidden = false;
  caches
    .open(CACHE)
    .then((cache) => cache.match(probe))
    .then((hit) => show(hit ? 'saved' : 'idle'))
    .catch(() => show('idle'));
})();
