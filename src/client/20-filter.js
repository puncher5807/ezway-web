// Filtr aplikací podle kategorie. Bez JavaScriptu se zobrazí všechny aplikace a filtr zůstane skrytý.
(() => {
  const group = document.querySelector('[data-filter]');
  if (!group) return;
  const cards = [...document.querySelectorAll('[data-app-card]')];
  const count = document.querySelector('[data-count]');
  const template = count ? count.dataset.template : '';

  function apply(category) {
    let shown = 0;
    cards.forEach((card) => {
      const visible = category === 'all' || card.dataset.cat === category;
      card.hidden = !visible;
      if (visible) shown += 1;
    });
    group.querySelectorAll('button[data-cat]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.cat === category));
    });
    if (count) count.textContent = template.replace('{n}', String(shown));
  }

  group.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-cat]');
    if (button) apply(button.dataset.cat);
  });
  group.hidden = false;
  if (count) count.hidden = false;
})();
