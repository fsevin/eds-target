import { getTranslation, getLanguageFromUrl } from '../../scripts/utils.js';

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

function buildProductCard(product) {
  const blockId = `product-${product.index}`;

  return `
    <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-full">
      <div id="${blockId}-image" class="relative aspect-[5/3] overflow-hidden bg-gray-100">
        ${product.picture}
      </div>
      <div class="p-6 flex flex-col flex-grow">
        <h3 id="${blockId}-title" class="text-xl font-bold text-gray-900 mb-2">${product.title}</h3>
        ${product.description ? `<p id="${blockId}-description" class="text-gray-600 leading-relaxed mb-4 flex-grow">${product.description}</p>` : ''}
        <div class="flex items-center justify-between pt-4 border-t border-gray-200">
          <span id="${blockId}-price" class="text-2xl font-bold text-brand-600">${product.price}</span>
          <button class="px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition shadow-md hover:shadow-lg" data-sku="${product.sku}">${product.viewDetailsLabel}</button>
        </div>
      </div>
    </div>
  `;
}

export default async function decorate(block) {
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

  // Fetch translation for "Results"
  const lang = getLanguageFromUrl();
  const resultsText = await getTranslation('Results', lang);

  const productsHTML = products.map(product => buildProductCard(product)).join('');

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
  allProductCards.forEach(card => {
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