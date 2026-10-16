// Zapamatuje si zvolený jazyk, aby ho úvodní adresa "/" příště nabídla rovnou.
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[data-lang]');
  if (!link) return;
  try {
    localStorage.setItem('ezway:lang', link.dataset.lang);
  } catch (error) {
    /* úložiště může být zablokované, web funguje i bez něj */
  }
});
