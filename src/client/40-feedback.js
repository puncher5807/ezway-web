// "Funguje to ještě?": volba se zatím ukládá jen v prohlížeči, na server se nic neposílá.
(() => {
  const box = document.querySelector('[data-feedback]');
  if (!box) return;
  const key = `ezway:vote:${box.dataset.key}`;
  const note = box.querySelector('[data-note]');

  const apply = (vote) => {
    box.querySelectorAll('button[data-vote]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.vote === vote));
    });
    note.hidden = !vote;
  };

  let stored = null;
  try {
    stored = localStorage.getItem(key);
  } catch (error) {
    /* úložiště nedostupné */
  }
  apply(stored);

  box.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-vote]');
    if (!button) return;
    try {
      localStorage.setItem(key, button.dataset.vote);
    } catch (error) {
      /* úložiště nedostupné */
    }
    apply(button.dataset.vote);
  });
})();
