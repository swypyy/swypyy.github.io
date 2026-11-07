(() => {
  const search = document.getElementById('postSearch');
  const grid = document.getElementById('postGrid');
  const empty = document.getElementById('emptyState');
  if (!search || !grid) return;

  const cards = Array.from(grid.querySelectorAll('.post-card'));
  search.addEventListener('input', () => {
    const query = search.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const matches = (card.dataset.search || '').includes(query);
      card.hidden = !matches;
      if (matches) visible++;
    });
    if (empty) empty.hidden = visible !== 0;
  });
})();
