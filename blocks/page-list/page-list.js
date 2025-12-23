import { readBlockConfig } from '../../scripts/aem.js';
import { applyImageStyling, createPlaceholderSVG, isAuthorMode } from '../../scripts/utils.js';

const HEADINGS_INDEX_URL = '/headings-index.json';

async function fetchHeadingsIndex() {
  try {
    const response = await fetch(HEADINGS_INDEX_URL);
    if (!response.ok) throw new Error('Failed to fetch headings index');
    return response.json();
  } catch (error) {
    console.error('Error fetching headings index:', error);
    return null;
  }
}

function getChildPages(data, currentPath) {
  if (!data?.data) return [];

  const normalizedCurrentPath = currentPath.replace(/\/$/, '');

  return data.data.filter((page) => {
    const pagePath = page.path.replace(/\/$/, '');
    if (!pagePath.startsWith(normalizedCurrentPath)) return false;

    const remainingPath = pagePath.substring(normalizedCurrentPath.length);
    const parts = remainingPath.split('/').filter(Boolean);
    return parts.length === 1;
  });
}

function createPictureFromUrl(imageUrl, alt = '') {
  if (!imageUrl) return '';

  const baseUrl = imageUrl.replace('https://localhost', 'http://localhost').split('?')[0];

  return `
    <picture>
      <source type="image/webp" srcset="${baseUrl}?width=650&format=webply&optimize=medium" media="(min-width: 600px)">
      <source type="image/webp" srcset="${baseUrl}?width=2000&format=webply&optimize=medium">
      <source type="image/jpeg" srcset="${baseUrl}?width=650&format=pjpg&optimize=medium" media="(min-width: 600px)">
      <img loading="lazy" alt="${alt}" src="${baseUrl}?width=2000&format=pjpg&optimize=medium" width="650" height="366">
    </picture>
  `;
}

function getCardElements(page, index) {
  const blockId = `page-${index}`;
  const pictureHTML = page.image
    ? createPictureFromUrl(page.image, page.title)
    : `<img src="data:image/svg+xml,${encodeURIComponent(createPlaceholderSVG('image', '16:9'))}" alt="${page.title}" class="w-full h-full object-cover" />`;

  return { blockId, pictureHTML };
}

function buildPageCard(page, index) {
  const { blockId, pictureHTML } = getCardElements(page, index);

  return `
    <a href="${page.path}" class="group bg-white rounded overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
      <div class="relative aspect-video overflow-hidden">
        <div id="${blockId}-image" class="w-full h-full">${pictureHTML}</div>
      </div>
      <div class="p-6 flex flex-col flex-grow">
        <h3 id="${blockId}-title" class="text-2xl font-bold text-gray-900 mb-3 group-hover:text-brand-600 transition-colors">${page.title}</h3>
        ${page.description ? `<p id="${blockId}-description" class="text-gray-600 leading-relaxed flex-grow">${page.description}</p>` : ''}
      </div>
    </a>
  `;
}

function buildOverlayPageCard(page, index) {
  const { blockId, pictureHTML } = getCardElements(page, index);

  return `
    <a href="${page.path}" class="group relative overflow-hidden aspect-video block rounded">
      <div id="${blockId}-image" class="absolute inset-0">${pictureHTML}</div>
      <div class="absolute inset-0 bg-black opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
      <div class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
        <h3 id="${blockId}-title" class="text-2xl md:text-3xl font-bold text-white mb-3 drop-shadow-lg">${page.title}</h3>
        ${page.description ? `<p id="${blockId}-description" class="text-white text-sm md:text-base leading-relaxed max-w-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg">${page.description}</p>` : ''}
      </div>
    </a>
  `;
}

function createSection(content, classes = 'py-20 bg-white') {
  return `
    <section class="${classes}">
      <div class="container mx-auto px-4">${content}</div>
    </section>
  `;
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const variant = config.variant || 'default';

  if (isAuthorMode) {
    block.innerHTML = createSection(`
      <div class="text-center text-xl text-gray-500">
        <p class="font-semibold">Page List Block</p>
        <p class="text-base mt-2">Child pages will be inserted here</p>
      </div>
    `, 'py-20 bg-gray-100');
    return;
  }

  block.innerHTML = createSection('<div class="text-center text-xl text-gray-600">Loading pages...</div>');

  const indexData = await fetchHeadingsIndex();

  if (!indexData) {
    block.innerHTML = createSection('<div class="text-center text-xl text-red-600">Failed to load pages.</div>');
    return;
  }

  const childPages = getChildPages(indexData, window.location.pathname);
  const cardBuilder = variant === 'overlay' ? buildOverlayPageCard : buildPageCard;

  const pagesHTML = childPages.length > 0
    ? childPages.map(cardBuilder).join('')
    : '<div class="col-span-full text-center text-xl text-gray-600">No child pages found.</div>';

  block.textContent = '';
  block.append(document.createRange().createContextualFragment(createSection(`
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">${pagesHTML}</div>
  `)));

  block.querySelectorAll('[id$="-image"]').forEach(applyImageStyling);
}
