function extractArticlesFromBlock(block) {
  const articles = [];
  const articleDivs = block.querySelectorAll(':scope > div');

  articleDivs.forEach((articleDiv, index) => {
    const children = articleDiv.querySelectorAll(':scope > div');

    if (children.length >= 4) {
      const title = children[0]?.querySelector('p')?.textContent.trim() || '';
      const category = children[1]?.querySelector('p')?.textContent.trim() || '';
      const description = children[2]?.querySelector('p')?.textContent.trim() || '';
      const picture = children[3]?.querySelector('picture');

      articles.push({
        title,
        category,
        description,
        picture: picture ? picture.outerHTML : '',
        index
      });
    }
  });

  return articles;
}

function buildArticleCard(article) {
  const blockId = `article-${article.index}`;

  return `
    <div class="article-card">
      <div id="${blockId}-image" class="article-background">
        ${article.picture}
      </div>
      <div class="bokeh-effect"></div>
      <div class="content-container">
        ${article.category ? `<span id="${blockId}-category" class="article-category">${article.category}</span>` : ''}
        <h3 id="${blockId}-title" class="article-title">${article.title}</h3>
        ${article.description ? `<p id="${blockId}-description" class="article-description">${article.description}</p>` : ''}
      </div>
    </div>
  `;
}

export default async function decorate(block) {
  let articles = extractArticlesFromBlock(block);

  if (articles.length === 0) {
    const emptyContent = document.createRange().createContextualFragment(`
      <div class="articles-empty">No articles found.</div>
    `);
    block.textContent = '';
    block.append(emptyContent);
    return;
  }

  const articlesHTML = articles.map(article => buildArticleCard(article)).join('');

  const content = document.createRange().createContextualFragment(`
    <div class="articles-grid">
      ${articlesHTML}
    </div>
  `);

  block.textContent = '';
  block.append(content);

  // Get reference to article cards
  const articlesGrid = block.querySelector('.articles-grid');
  const allArticleCards = [...articlesGrid.children];

  // Function to filter articles
  function filterArticles(searchTerm, category) {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const lowerCategory = category.toLowerCase();

    allArticleCards.forEach(card => {
      const cardCategory = card.querySelector('.article-category')?.textContent.toLowerCase() || '';
      const cardTitle = card.querySelector('.article-title')?.textContent.toLowerCase() || '';
      const cardDescription = card.querySelector('.article-description')?.textContent.toLowerCase() || '';

      const matchesCategory = !lowerCategory || cardCategory.includes(lowerCategory);
      const matchesSearch = !lowerSearchTerm ||
        cardTitle.includes(lowerSearchTerm) ||
        cardDescription.includes(lowerSearchTerm) ||
        cardCategory.includes(lowerSearchTerm);

      if (matchesCategory && matchesSearch) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  // Listen for search/filter events from search block
  document.addEventListener('search-filter-change', (event) => {
    const { searchTerm, category } = event.detail;
    filterArticles(searchTerm, category);
  });
}