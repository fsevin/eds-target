import { readBlockConfig } from '../../scripts/aem.js';

export default async function decorate(block) {
  const config = readBlockConfig(block);

  const style = config.style || '';
  const sectionClasses = style.includes('highlight') ? 'py-20 bg-gray-50' : 'py-20 bg-white';

  const title = config.title || 'Search';
  const subtitle = config.subtitle || 'Enter keywords to find what you\'re looking for';

  const filters = config.filters ? config.filters.split(',').map(f => f.trim()).filter(f => f) : [];
  const filterButtons = filters.map((filter, index) =>
    `<button type="button" class="px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${index === 0 ? 'bg-brand-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}" data-filter="${filter}">${filter}</button>`
  ).join('');

  const searchHTML = `
    <section class="${sectionClasses}">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <h3 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4" data-aue-label="Title" data-aue-prop="title" data-aue-type="text">${title}</h3>
          <p class="text-xl text-gray-600 mb-8" data-aue-label="Subtitle" data-aue-prop="subtitle" data-aue-type="text">${subtitle}</p>

          <form class="mb-8" role="search">
            <div class="relative max-w-2xl mx-auto">
              <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="search"
                class="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-200 transition-all"
                placeholder="Search..."
                aria-label="Search"
                autocomplete="off"
              />
            </div>
          </form>

          ${filterButtons ? `<div class="flex flex-wrap justify-center gap-3">${filterButtons}</div>` : ''}
        </div>
      </div>
    </section>
  `;

  const content = document.createRange().createContextualFragment(searchHTML);
  block.textContent = '';
  block.append(content);

  const searchInput = block.querySelector('input[type="search"]');
  const filterBtns = block.querySelectorAll('button[data-filter]');

  // Function to dispatch search event
  function dispatchSearchEvent() {
    const activeFilter = Array.from(filterBtns).find(btn =>
      btn.classList.contains('bg-brand-600')
    );
    const searchTerm = searchInput.value;
    const filterText = activeFilter ? activeFilter.textContent : '';
    const category = (activeFilter && activeFilter === filterBtns[0]) ? '' : filterText;

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
        // Reset all buttons to inactive state
        filterBtns.forEach(b => {
          b.classList.remove('bg-brand-600', 'text-white', 'shadow-lg');
          b.classList.add('bg-white', 'text-gray-700', 'hover:bg-gray-100', 'border', 'border-gray-300');
        });
        // Set clicked button to active state
        btn.classList.remove('bg-white', 'text-gray-700', 'hover:bg-gray-100', 'border', 'border-gray-300');
        btn.classList.add('bg-brand-600', 'text-white', 'shadow-lg');
        dispatchSearchEvent();
      });
    });
  }

  // Handle search input
  searchInput.addEventListener('input', () => {
    dispatchSearchEvent();
  });

}
