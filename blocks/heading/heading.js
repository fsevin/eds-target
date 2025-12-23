import { isAuthorMode } from '../../scripts/utils.js';

function getMetaContent(name, attr = 'property') {
  const meta = document.querySelector(`meta[${attr}="${name}"]`);
  return meta?.getAttribute('content') || '';
}

function getImageUrl(ogImage) {
  // In author mode, check imagePath first to determine if there's an image
  if (isAuthorMode) {
    const imagePath = getMetaContent('image', 'name');
    if (!imagePath || imagePath.includes('default-meta-image.png')) return '';

    try {
      return `${new URL(ogImage).origin}${imagePath}`.replace('https://localhost', 'http://localhost');
    } catch {
      return '';
    }
  }

  if (!ogImage || ogImage.includes('default-meta-image.png')) return '';

  return ogImage.replace('https://localhost', 'http://localhost');
}

export default async function decorate(block) {
  const ogTitle = getMetaContent('og:title');
  const ogDescription = getMetaContent('og:description');
  const ogImage = getImageUrl(getMetaContent('og:image'));

  const hasImage = !!ogImage;

  const headingHTML = `
    <section class="relative w-full py-12 md:py-16 px-4 bg-white bg-cover bg-center bg-no-repeat">
      ${hasImage ? `<div class="absolute inset-0 z-0">
        <img src="${ogImage}" alt="" class="w-full h-full object-cover" />
      </div>
      <div class="absolute inset-0 bg-black/50 z-10"></div>` : ''}
      <div class="container mx-auto max-w-7xl flex items-center min-h-[120px] relative z-20">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold ${hasImage ? 'text-white' : 'text-black'} mb-4 text-left !p-0">
            ${ogTitle}
          </h1>
          <p class="text-lg md:text-xl ${hasImage ? 'text-gray-200' : 'text-gray-600'} max-w-2xl leading-relaxed">
            ${ogDescription}
          </p>
        </div>
      </div>
    </section>
  `;

  block.textContent = '';
  block.append(document.createRange().createContextualFragment(headingHTML));
}
