import { isAuthorMode, createPlaceholderSVG } from '../../scripts/utils.js';

export default async function decorate(block) {
  const rows = [...block.children];

  // Extract header configuration from first 3 rows
  const title = rows[0]?.querySelector('div')?.textContent?.trim() || 'Our Portfolio';
  const description = rows[1]?.querySelector('div')?.children[0]?.innerHTML.trim() || '<p>Explore our collection of creative projects and successful collaborations.</p>';
  const styleValue = rows[2]?.querySelector('div')?.textContent?.trim().toLowerCase() || '';

  // Determine background color based on style
  const sectionClasses = styleValue.includes('highlight') ? 'bg-gray-50' : 'bg-white';

  // Create header section
  const headerSection = document.createElement('div');
  headerSection.className = `${sectionClasses} py-12 md:py-16`;

  const container = document.createElement('div');
  container.className = 'container mx-auto px-4';

  const headerContent = document.createElement('div');
  headerContent.className = 'text-center max-w-3xl mx-auto mb-12';

  const titleElement = document.createElement('h2');
  titleElement.className = 'text-3xl md:text-4xl font-bold text-gray-900 mb-4';
  titleElement.textContent = title;

  const descriptionElement = document.createElement('div');
  descriptionElement.className = 'text-lg text-gray-600';
  descriptionElement.innerHTML = description;

  headerContent.appendChild(titleElement);
  if (description) {
    headerContent.appendChild(descriptionElement);
  }

  // Create portfolio grid
  const portfolioGrid = document.createElement('div');
  portfolioGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0';

  // Extract portfolio items from remaining rows (starting at row 3)
  for (let i = 3; i < rows.length; i += 1) {
    const row = rows[i];
    const cells = [...row.children];

    if (cells.length < 3) continue;

    // Extract data-aue attributes for AEM Universal Editor
    const attributes = {};
    Array.from(row.attributes).forEach((attr) => {
      if (attr.name.startsWith('data-aue-')) {
        attributes[attr.name] = attr.value;
      }
    });

    // Extract portfolio item data
    const imageElement = cells[0]?.querySelector('picture') || cells[0]?.querySelector('img');
    const itemTitle = cells[1]?.querySelector('div')?.textContent?.trim() || 'Portfolio Item Title';
    const linkHref = cells[2]?.querySelector('div')?.textContent?.trim() || '#';

    // Create portfolio item card
    const portfolioItem = document.createElement('div');
    portfolioItem.className = 'group relative overflow-hidden';

    // Apply AEM Universal Editor attributes
    Object.entries(attributes).forEach(([key, value]) => {
      portfolioItem.setAttribute(key, value);
    });

    // Create link wrapper
    const link = document.createElement('a');
    link.href = linkHref;
    link.className = 'block relative';
    link.setAttribute('aria-label', itemTitle);

    // Image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'relative aspect-[4/3] overflow-hidden bg-gray-200';

    if (imageElement) {
      const clonedImage = imageElement.cloneNode(true);

      // Add responsive image classes
      if (clonedImage.tagName === 'PICTURE') {
        const img = clonedImage.querySelector('img');
        if (img) {
          img.className = 'w-full h-full object-cover group-hover:scale-110 transition-transform duration-300';
        }
      } else {
        clonedImage.className = 'w-full h-full object-cover group-hover:scale-110 transition-transform duration-300';
      }

      imageContainer.appendChild(clonedImage);
    } else {
      // Create placeholder image if no image is provided
      const placeholderImg = document.createElement('img');
      placeholderImg.src = `data:image/svg+xml,${encodeURIComponent(createPlaceholderSVG('image', '4:3'))}`;
      placeholderImg.alt = 'Portfolio placeholder image';
      placeholderImg.className = 'w-full h-full object-cover group-hover:scale-110 transition-transform duration-300';
      imageContainer.appendChild(placeholderImg);
    }

    // Overlay with title
    const overlay = document.createElement('div');
    const overlayOpacity = isAuthorMode() ? 'opacity-100' : 'opacity-0 group-hover:opacity-100';
    overlay.className = `absolute inset-0 bg-brand-900/80 ${overlayOpacity} transition-opacity duration-300 flex items-center justify-center p-6`;

    const titleElement = document.createElement('span');
    titleElement.className = 'text-white font-semibold text-lg flex items-center gap-2';
    titleElement.innerHTML = `${itemTitle} <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>`;

    overlay.appendChild(titleElement);
    link.appendChild(imageContainer);
    link.appendChild(overlay);
    portfolioItem.appendChild(link);
    portfolioGrid.appendChild(portfolioItem);
  }

  // Assemble the block
  container.appendChild(headerContent);
  container.appendChild(portfolioGrid);
  headerSection.appendChild(container);

  block.textContent = '';
  block.appendChild(headerSection);
}
