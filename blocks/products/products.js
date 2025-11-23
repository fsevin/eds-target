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

      // Picture can be direct <picture> or wrapped in <p>
      let picture = children[4]?.querySelector('picture');
      if (!picture) {
        const pictureWrapper = children[4]?.querySelector('p');
        picture = pictureWrapper?.querySelector('picture');
      }

      products.push({
        title,
        sku,
        description,
        price,
        picture: picture ? picture.outerHTML : '',
        index
      });
    }
  });

  return products;
}

function buildProductCard(product) {
  const blockId = `product-${product.index}`;

  return `
    <div class="product-card">
      <div id="${blockId}-image" class="product-image">
        ${product.picture}
      </div>
      <div class="product-content">
        <h3 id="${blockId}-title" class="product-title">${product.title}</h3>
        ${product.description ? `<p id="${blockId}-description" class="product-description">${product.description}</p>` : ''}
        <div class="product-footer">
          <span id="${blockId}-price" class="product-price">${product.price}</span>
          <button class="product-btn" data-sku="${product.sku}">View Details</button>
        </div>
      </div>
    </div>
  `;
}

export default async function decorate(block) {
  const products = extractProductsFromBlock(block);

  if (products.length === 0) {
    const emptyContent = document.createRange().createContextualFragment(`
      <div class="products-empty">No products found.</div>
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
    <div class="products-results-count"></div>
    <div class="products-grid">
      ${productsHTML}
    </div>
  `);

  block.textContent = '';
  block.append(content);

  // Get reference to product cards and results counter
  const productsGrid = block.querySelector('.products-grid');
  const allProductCards = [...productsGrid.children];
  const resultsCount = block.querySelector('.products-results-count');

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
      const cardTitle = card.querySelector('.product-title')?.textContent.toLowerCase() || '';
      const cardDescription = card.querySelector('.product-description')?.textContent.toLowerCase() || '';
      const cardPrice = card.querySelector('.product-price')?.textContent.toLowerCase() || '';

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
}