import { parseConfigBoolean } from '../../scripts/utils.js';
import { readBlockConfig } from '../../scripts/aem.js';

function getMetaContent(name, attr = 'property') {
  const meta = document.querySelector(`meta[${attr}="${name}"]`);
  return meta?.getAttribute('content') || '';
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const showBackgroundImage = parseConfigBoolean(config.showbackgroundimage);

  const ogTitle = getMetaContent('og:title');
  const ogDescription = getMetaContent('og:description');

  const hasImage = showBackgroundImage && !!config.image;

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
