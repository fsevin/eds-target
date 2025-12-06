import { readBlockConfig } from '../../scripts/aem.js';
import { getTranslation, getLanguageFromUrl, parseConfigBoolean, applyImageStyling } from '../../scripts/utils.js';

function extractProductsFromBlock(block) {
  const products = [];
  const productDivs = block.querySelectorAll(':scope > div');

  productDivs.forEach((productDiv, index) => {
    const children = productDiv.querySelectorAll(':scope > div');

    if (children.length >= 5) {
      const title = children[0]?.textContent.trim() || '';
      const sku = children[1]?.textContent.trim() || '';
      const description = children[2]?.textContent.trim() || '';

      // Price can be direct text or wrapped in <p>
      const priceElement = children[3]?.querySelector('p');
      const price = priceElement ? priceElement.textContent.trim() : children[3]?.textContent.trim() || '';

      const viewDetailsLabel = children[4]?.querySelector('p')?.textContent.trim() || '';
      let picture = children[5]?.querySelector('picture');

      // Resize picture to use width=500 instead of 750/2000
      let pictureHTML = '';
      if (picture) {
        pictureHTML = picture.outerHTML
          .replace(/width=750/g, 'width=500')
          .replace(/width=2000/g, 'width=500');
      }

      products.push({
        title,
        sku,
        description,
        price,
        viewDetailsLabel,
        picture: pictureHTML,
        index
      });
    }
  });

  return products;
}

function buildProductCard(product, showPrice = false, imageAspectRatio = '5/3') {
  const blockId = `product-${product.index}`;

  const priceHTML = showPrice
    ? `<span id="${blockId}-price" class="text-2xl font-bold text-brand-600">${product.price}</span>`
    : '';

  const aspectClass = imageAspectRatio === 'square' ? 'aspect-square' : 'aspect-[5/3]';

  return `
    <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-full">
      <div id="${blockId}-image" class="relative ${aspectClass} overflow-hidden bg-gray-100">
        ${product.picture}
      </div>
      <div class="p-6 flex flex-col flex-grow">
        <h3 id="${blockId}-title" class="text-xl font-bold text-gray-900 mb-2">${product.title}</h3>
        ${product.description ? `<p id="${blockId}-description" class="text-gray-600 leading-relaxed mb-4 flex-grow">${product.description}</p>` : ''}
        <div class="flex items-center ${showPrice ? 'justify-between' : 'justify-end'} pt-4 border-t border-gray-200">
          ${priceHTML}
          <button class="px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition shadow-md hover:shadow-lg" data-sku="${product.sku}">${product.viewDetailsLabel}</button>
        </div>
      </div>
    </div>
  `;
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const showPrice = parseConfigBoolean(config.showprice);
  const imageAspectRatio = config.imageaspectratio || '5/3';

  // Start fetching translation as early as possible (non-blocking)
  const lang = getLanguageFromUrl();
  const translationPromise = getTranslation('Results', lang);

  const products = extractProductsFromBlock(block);

  if (products.length === 0) {
    const emptyContent = document.createRange().createContextualFragment(`
      <section class="py-20 bg-white">
        <div class="container mx-auto px-4">
          <div class="text-center text-xl text-gray-600">Products inserted here.</div>
        </div>
      </section>
    `);
    block.textContent = '';
    block.append(emptyContent);
    return;
  }

  const productsHTML = products.map(product => buildProductCard(product, showPrice, imageAspectRatio)).join('');

  const content = document.createRange().createContextualFragment(`
    <section class="py-20 bg-white">
      <div class="container mx-auto px-4">
        <div class="mb-6 text-lg font-semibold text-gray-700" data-results-count></div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-products-grid>
          ${productsHTML}
        </div>
      </div>
    </section>
  `);

  block.textContent = '';
  block.append(content);

  // Get reference to product cards and results counter
  const productsGrid = block.querySelector('[data-products-grid]');
  const allProductCards = [...productsGrid.children];
  const resultsCount = block.querySelector('[data-results-count]');

  // Wait for translation before updating results count
  const resultsText = await translationPromise;

  // Function to update results count
  function updateResultsCount(count) {
    resultsCount.textContent = `${count} ${resultsText}`;
  }

  // Initialize with total count
  updateResultsCount(allProductCards.length);

  // Function to filter products (only by search term, no category filtering)
  function filterProducts(searchTerm) {
    const lowerSearchTerm = searchTerm.toLowerCase();
    let visibleCount = 0;

    allProductCards.forEach(card => {
      const cardTitle = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const cardDescription = card.querySelector('p')?.textContent.toLowerCase() || '';
      const cardPrice = card.querySelector('span')?.textContent.toLowerCase() || '';

      const matchesSearch = !lowerSearchTerm ||
        cardTitle.includes(lowerSearchTerm) ||
        cardDescription.includes(lowerSearchTerm) ||
        cardPrice.includes(lowerSearchTerm);

      if (matchesSearch) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    updateResultsCount(visibleCount);
  }

  // Listen for search events from search block
  document.addEventListener('search-filter-change', (event) => {
    const { searchTerm } = event.detail;
    filterProducts(searchTerm);
  });

  // Apply image styling to fill containers
  allProductCards.forEach((card) => {
    const imageContainer = card.querySelector('[id$="-image"]');
    applyImageStyling(imageContainer);
  });
}