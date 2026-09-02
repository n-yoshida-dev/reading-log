(() => {
  document.querySelectorAll('[data-rating-count]').forEach((element) => {
    element.textContent = Number(element.textContent).toLocaleString('ja-JP');
  });

  const grid = document.querySelector('#all-books-grid');
  if (!grid) return;

  const search = document.querySelector('#book-search');
  const category = document.querySelector('#category-filter');
  const sort = document.querySelector('#book-sort');
  const count = document.querySelector('#book-result-count');
  const noResults = document.querySelector('#book-no-results');
  const cards = [...grid.querySelectorAll('[data-book-card]')];
  const collator = new Intl.Collator('ja', { numeric: true, sensitivity: 'base' });
  const normalize = (value) => value.normalize('NFKC').toLocaleLowerCase('ja');

  const compareTitle = (a, b) => collator.compare(a.dataset.title, b.dataset.title);
  const compareCategory = (a, b) => {
    const byCategory = collator.compare(a.dataset.category, b.dataset.category);
    return byCategory || compareTitle(a, b);
  };

  const compareCards = (a, b, mode) => {
    if (mode === 'title') return compareTitle(a, b);
    if (mode === 'rating') return Number(b.dataset.rating) - Number(a.dataset.rating) || compareTitle(a, b);
    if (mode === 'rating-count') return Number(b.dataset.ratingCount) - Number(a.dataset.ratingCount) || compareTitle(a, b);
    if (mode === 'published-new') return b.dataset.published.localeCompare(a.dataset.published) || compareTitle(a, b);
    if (mode === 'published-old') return a.dataset.published.localeCompare(b.dataset.published) || compareTitle(a, b);
    return compareCategory(a, b);
  };

  const updateShelf = () => {
    const query = normalize(search.value.trim());
    const selectedCategory = category.value;

    cards
      .sort((a, b) => compareCards(a, b, sort.value))
      .forEach((card) => grid.append(card));

    let visible = 0;
    cards.forEach((card) => {
      const searchable = normalize(`${card.dataset.title} ${card.dataset.author}`);
      const matchesSearch = !query || searchable.includes(query);
      const matchesCategory = selectedCategory === 'all' || card.dataset.category === selectedCategory;
      card.hidden = !(matchesSearch && matchesCategory);
      if (!card.hidden) visible += 1;
    });

    count.textContent = `${visible}冊`;
    noResults.hidden = visible !== 0;
  };

  search.addEventListener('input', updateShelf);
  category.addEventListener('change', updateShelf);
  sort.addEventListener('change', updateShelf);
  updateShelf();
})();
