import { getTranslation, getLanguageFromUrl } from '../../scripts/utils.js';

function extractArticlesFromBlock(block) {
  const articles = [];
  const articleDivs = block.querySelectorAll(':scope > div');

  articleDivs.forEach((articleDiv, index) => {
    const children = articleDiv.querySelectorAll(':scope > div');

    if (children.length >= 4) {
      const title = children[0]?.querySelector('p')?.textContent.trim() || '';
      const category = children[1]?.querySelector('p')?.textContent.trim() || '';
      const description = children[2]?.querySelector('p')?.textContent.trim() || '';     
      const lastModified = children[3]?.querySelector('p')?.textContent.trim() || '';
      const picture = children[4]?.querySelector('picture');

      articles.push({
        title,
        category,
        description,
        picture: picture ? picture.outerHTML : '',
        lastModified,
        index
      });
    }
  });

  return articles;
}

function buildArticleCard(article) {
  const blockId = `article-${article.index}`;

  return `
    <div class="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
      <!-- Image Container -->
      <div class="relative aspect-video overflow-hidden">
        <div id="${blockId}-image" class="w-full h-full">
          ${article.picture}
        </div>
        <!-- Category Badge -->
        ${article.category ? `<span id="${blockId}-category" class="absolute top-4 right-4 px-4 py-2 bg-brand-600 text-white rounded-full font-semibold text-sm">${article.category}</span>` : ''}
      </div>

      <!-- Content -->
      <div class="p-6 flex flex-col flex-grow">
        <h3 id="${blockId}-title" class="text-2xl font-bold text-gray-900 mb-3 group-hover:text-brand-600 transition-colors">${article.title}</h3>
        ${article.description ? `<p id="${blockId}-description" class="text-gray-600 leading-relaxed mb-6 flex-grow">${article.description}</p>` : ''}

        <!-- Date -->
        ${article.lastModified ? `<div class="pt-4 border-t border-gray-200">
          <p class="text-sm font-bold text-gray-900 mb-1">Last Modified</p>
          <p class="text-sm text-gray-500">${article.lastModified}</p>
        </div>` : ''}
      </div>
    </div>
  `;
}

export default async function decorate(block) {
  let articles = extractArticlesFromBlock(block);

  if (articles.length === 0) {
    const emptyContent = document.createRange().createContextualFragment(`
      <section class="py-20 bg-white">
        <div class="container mx-auto px-4">
          <div class="text-center text-xl text-gray-600">No articles found.</div>
        </div>
      </section>
    `);
    block.textContent = '';
    block.append(emptyContent);
    return;
  }

  // Fetch translation for "Results"
  const lang = getLanguageFromUrl();
  const resultsText = await getTranslation('Results', lang);

  const articlesHTML = articles.map(article => buildArticleCard(article)).join('');

  const content = document.createRange().createContextualFragment(`
    <section class="py-20 bg-white">
      <div class="container mx-auto px-4">
        <div class="mb-6 text-lg font-semibold text-gray-700" data-results-count></div>
        <div class="grid md:grid-cols-2 gap-8 min-h-[400px]" data-articles-grid>
          ${articlesHTML}
        </div>
      </div>
    </section>
  `);

  block.textContent = '';
  block.append(content);

  // Get reference to article cards and results counter
  const articlesGrid = block.querySelector('[data-articles-grid]');
  const allArticleCards = [...articlesGrid.children];
  const resultsCount = block.querySelector('[data-results-count]');

  // Function to update results count
  function updateResultsCount(count) {
    resultsCount.textContent = `${count} ${resultsText}`;
  }

  // Initialize with total count
  updateResultsCount(allArticleCards.length);

  // Function to filter articles
  function filterArticles(searchTerm, category) {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const lowerCategory = category.toLowerCase();
    let visibleCount = 0;

    allArticleCards.forEach(card => {
      const cardCategory = card.querySelector('span[id*="-category"]')?.textContent.toLowerCase() || '';
      const cardTitle = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const cardDescription = card.querySelector('p')?.textContent.toLowerCase() || '';

      const matchesCategory = !lowerCategory || cardCategory.includes(lowerCategory);
      const matchesSearch = !lowerSearchTerm ||
        cardTitle.includes(lowerSearchTerm) ||
        cardDescription.includes(lowerSearchTerm) ||
        cardCategory.includes(lowerSearchTerm);

      if (matchesCategory && matchesSearch) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    updateResultsCount(visibleCount);
  }

  // Listen for search/filter events from search block
  document.addEventListener('search-filter-change', (event) => {
    const { searchTerm, category } = event.detail;
    filterArticles(searchTerm, category);
  });

  // Apply image styling to fill containers as backgrounds
  allArticleCards.forEach(card => {
    const picture = card.querySelector('picture');
    const img = card.querySelector('img');

    if (picture) {
      picture.style.width = '100%';
      picture.style.height = '100%';
      picture.style.display = 'block';
    }

    if (img) {
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.objectPosition = 'center';
      img.style.display = 'block';
    }
  });
}