import { getMetadata } from '../../scripts/aem.js';
import { isAuthorMode } from '../../scripts/utils.js';

function getHeadMetaContent(property) {
  const meta = document.querySelector(`meta[property="${property}"]`);
  return meta ? meta.getAttribute('content') : '';
}

export default async function decorate(block) {
  const ogTitle = getHeadMetaContent('og:title');
  const ogDescription = getHeadMetaContent('og:description');
  let ogImage = getHeadMetaContent('og:image');

  // In author mode, construct image URL from og:image domain and image meta path
  if (isAuthorMode && ogImage) {
    const imagePath = getHeadMetaContent('image');
    if (imagePath) {
      try {
        const url = new URL(ogImage);
        ogImage = `${url.origin}${imagePath}`;
      } catch {
        // If URL parsing fails, keep original ogImage
      }
    }
  }

  if (ogImage && ogImage.includes('default-meta-image.png')) {
    ogImage = '';
  } else if (ogImage && ogImage.includes('https://localhost')) {
    ogImage = ogImage.replace('https://localhost', 'http://localhost');
  }

  const headingHTML = `
    <section class="relative w-full py-12 md:py-16 px-4 bg-white bg-cover bg-center bg-no-repeat">
      ${ogImage ? `<div class="absolute inset-0 z-0">
        <img src="${ogImage}" alt="" class="w-full h-full object-cover" />
      </div>
      <div class="absolute inset-0 bg-black/50 z-10"></div>` : ''}
      <div class="container mx-auto max-w-7xl flex items-center min-h-[120px] relative z-20">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold ${ogImage ? 'text-white' : 'text-black'} mb-4 text-left !p-0">
            ${ogTitle}
          </h1>
          <p class="text-lg md:text-xl ${ogImage ? 'text-gray-200' : 'text-gray-600'} max-w-2xl leading-relaxed">
            ${ogDescription}
          </p>
        </div>
      </div>
    </section>
  `;

  const content = document.createRange().createContextualFragment(headingHTML);
  block.textContent = '';
  block.append(content);
}
