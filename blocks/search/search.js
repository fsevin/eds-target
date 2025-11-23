import { readBlockConfig } from '../../scripts/aem.js';

export default async function decorate(block) {
  const config = readBlockConfig(block);


  const title = config.title || 'Search';
  const subtitle = config.subtitle || 'Enter keywords to find what you\'re looking for';

  const filters = config.filters ? config.filters.split(',').map(f => f.trim()).filter(f => f) : [];
  const filterButtons = filters.map((filter, index) =>
    `<button type="button" class="search-filter-btn ${index === 0 ? 'active' : ''}">${filter}</button>`
  ).join('');

  const searchHTML = `
    <div class="search-container">
      <h3 class="search-title" data-aue-label="Title" data-aue-prop="title" data-aue-type="text">${title}</h3>
      <p class="search-subtitle" data-aue-label="Subtitle" data-aue-prop="subtitle" data-aue-type="text">${subtitle}</p>

      <form class="search-form" role="search">
        <div class="search-wrapper">
          <svg class="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="search"
            class="search-input"
            placeholder="Search..."
            aria-label="Search"
            autocomplete="off"
          />
        </div>
      </form>

      ${filterButtons ? `<div class="search-filters">${filterButtons}</div>` : ''}
    </div>
  `;

  const content = document.createRange().createContextualFragment(searchHTML);
  block.textContent = '';
  block.append(content);

  const searchForm = block.querySelector('.search-form');
  const searchInput = block.querySelector('.search-input');
  const filterBtns = block.querySelectorAll('.search-filter-btn');

  // Function to dispatch search event
  function dispatchSearchEvent() {
    const activeFilter = block.querySelector('.search-filter-btn.active');
    const searchTerm = searchInput.value;
    const filterText = activeFilter ? activeFilter.textContent : '';
    const category = filterText.toUpperCase() === 'ALL' ? '' : filterText;

    const event = new CustomEvent('search-filter-change', {
      detail: {
        searchTerm,
        category
      },
      bubbles: true
    });
    block.dispatchEvent(event);
  }

  // Handle filter selection only if filters exist
  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        dispatchSearchEvent();
      });
    });
  }

  // Handle search input
  searchInput.addEventListener('input', () => {
    dispatchSearchEvent();
  });

}
