import { readBlockConfig } from '../../scripts/aem.js';
import { applyImageStyling, createPlaceholderSVG, isAuthorMode } from '../../scripts/utils.js';

/**
 * Fetches the headings index
 */
async function fetchHeadingsIndex() {
  try {
    const response = await fetch('/headings-index.json');
    if (!response.ok) throw new Error('Failed to fetch headings index');
    const json = await response.json();
    return json;
  } catch (error) {
    console.error('Error fetching headings index:', error);
    return null;
  }
}

/**
 * Gets the current page path
 */
function getCurrentPath() {
  return window.location.pathname;
}

/**
 * Filters pages to get direct children of the current path
 */
function getChildPages(data, currentPath) {
  if (!data || !data.data) return [];

  // Normalize current path (remove trailing slash)
  const normalizedCurrentPath = currentPath.replace(/\/$/, '');

  // Filter pages that are direct children of current path
  const children = data.data.filter(page => {
    const pagePath = page.path.replace(/\/$/, '');

    // Check if page starts with current path
    if (!pagePath.startsWith(normalizedCurrentPath)) return false;

    // Get the remaining path after current path
    const remainingPath = pagePath.substring(normalizedCurrentPath.length);

    // Check if it's a direct child (only one more level deep)
    // Should start with / and have no additional / after that
    const parts = remainingPath.split('/').filter(p => p);
    return parts.length === 1;
  });

  return children;
}

/**
 * Creates an optimized picture element from image URL
 */
function createPictureFromUrl(imageUrl, alt = '') {
  if (!imageUrl) return '';

  // Fix localhost protocol issue
  let url = imageUrl;
  if (url.includes('https://localhost')) {
    url = url.replace('https://localhost', 'http://localhost');
  }

  // Extract base URL without query parameters
  const baseUrl = url.split('?')[0];

  return `
    <picture>
      <source type="image/webp" srcset="${baseUrl}?width=650&format=webply&optimize=medium" media="(min-width: 600px)">
      <source type="image/webp" srcset="${baseUrl}?width=2000&format=webply&optimize=medium">
      <source type="image/jpeg" srcset="${baseUrl}?width=650&format=pjpg&optimize=medium" media="(min-width: 600px)">
      <img loading="lazy" alt="${alt}" src="${baseUrl}?width=2000&format=pjpg&optimize=medium" width="650" height="366">
    </picture>
  `;
}

/**
 * Builds a page card HTML (default variant)
 */
function buildPageCard(page, index) {
  const blockId = `page-${index}`;
  const pictureHTML = page.image
    ? createPictureFromUrl(page.image, page.title)
    : `<img src="data:image/svg+xml,${encodeURIComponent(createPlaceholderSVG('image', '16:9'))}" alt="${page.title}" class="w-full h-full object-cover" />`;

  return `
    <a href="${page.path}" class="group bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
      <!-- Image Container -->
      <div class="relative aspect-video overflow-hidden">
        <div id="${blockId}-image" class="w-full h-full">
          ${pictureHTML}
        </div>
      </div>

      <!-- Content -->
      <div class="p-6 flex flex-col flex-grow">
        <h3 id="${blockId}-title" class="text-2xl font-bold text-gray-900 mb-3 group-hover:text-brand-600 transition-colors">${page.title}</h3>
        ${page.description ? `<p id="${blockId}-description" class="text-gray-600 leading-relaxed flex-grow">${page.description}</p>` : ''}
      </div>
    </a>
  `;
}

/**
 * Builds a page card HTML (overlay variant)
 */
function buildOverlayPageCard(page, index) {
  const blockId = `page-${index}`;
  const pictureHTML = page.image
    ? createPictureFromUrl(page.image, page.title)
    : `<img src="data:image/svg+xml,${encodeURIComponent(createPlaceholderSVG('image', '16:9'))}" alt="${page.title}" class="w-full h-full object-cover" />`;

  return `
    <a href="${page.path}" class="group relative overflow-hidden aspect-video block">
      <!-- Image Container with Opacity -->
      <div id="${blockId}-image" class="absolute inset-0">
        ${pictureHTML}
      </div>
      <div class="absolute inset-0 bg-black opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>

      <!-- Overlay Content -->
      <div class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
        <h3 id="${blockId}-title" class="text-2xl md:text-3xl font-bold text-white mb-3 drop-shadow-lg">${page.title}</h3>
        ${page.description ? `<p id="${blockId}-description" class="text-white text-sm md:text-base leading-relaxed max-w-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg">${page.description}</p>` : ''}
      </div>
    </a>
  `;
}

export default async function decorate(block) {
  // In author mode, show placeholder message
  if (isAuthorMode) {
    block.innerHTML = `
      <section class="py-20 bg-gray-100">
        <div class="container mx-auto px-4">
          <div class="text-center text-xl text-gray-500">
            <p class="font-semibold">Page List Block</p>
            <p class="text-base mt-2">Child pages will be inserted here</p>
          </div>
        </div>
      </section>
    `;
    return;
  }

  // Show loading state
  block.innerHTML = `
    <section class="py-20 bg-white">
      <div class="container mx-auto px-4">
        <div class="text-center text-xl text-gray-600">Loading pages...</div>
      </div>
    </section>
  `;

  // Fetch headings index
  const indexData = await fetchHeadingsIndex();

  if (!indexData) {
    block.innerHTML = `
      <section class="py-20 bg-white">
        <div class="container mx-auto px-4">
          <div class="text-center text-xl text-red-600">Failed to load pages.</div>
        </div>
      </section>
    `;
    return;
  }

  // Read block configuration
  const config = readBlockConfig(block);
  const variant = config.variant?.toLowerCase() || 'default';

  // Get current path and child pages
  const currentPath = getCurrentPath();
  const childPages = getChildPages(indexData, currentPath);

  // Choose the appropriate card builder based on variant
  const cardBuilder = variant === 'overlay' ? buildOverlayPageCard : buildPageCard;

  // Build page cards HTML
  const pagesHTML = childPages.length > 0
    ? childPages.map((page, index) => cardBuilder(page, index)).join('')
    : '<div class="col-span-full text-center text-xl text-gray-600">No child pages found.</div>';

  // Create content
  const content = document.createRange().createContextualFragment(`
    <section class="py-20 bg-white">
      <div class="container mx-auto px-4">
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          ${pagesHTML}
        </div>
      </div>
    </section>
  `);

  block.textContent = '';
  block.append(content);

  // Apply image styling to fill containers as backgrounds
  const pageCards = block.querySelectorAll('[id$="-image"]');
  pageCards.forEach(imageContainer => {
    applyImageStyling(imageContainer);
  });
}
