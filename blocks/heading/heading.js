import { readBlockConfig } from '../../scripts/aem.js';

function getOGMetaContent(property) {
  const meta = document.querySelector(`meta[property="${property}"]`);
  return meta ? meta.getAttribute('content') : '';
}

export default async function decorate(block) {
  const config = readBlockConfig(block);

  // Get title and description from OG meta tags, fallback to config
  const ogTitle = getOGMetaContent('og:title');
  const ogDescription = getOGMetaContent('og:description');

  const title = config.title || ogTitle || document.title || 'Welcome';
  const description = config.description || ogDescription || '';

  // Generate unique ID for this block instance
  const blockId = `heading-${Math.random().toString(36).substr(2, 9)}`;

  const headingHTML = `
    <div class="w-full">
      <h1
        id="${blockId}-title"
        data-aue-label="Title"
        data-aue-prop="title"
        data-aue-type="text"
      >
        ${title}
      </h1>
      ${description ? `
        <p
          id="${blockId}-description"
          data-aue-label="Description"
          data-aue-prop="description"
          data-aue-type="text"
          class="text-left text-xl md:text-2xl leading-relaxed text-gray-600 px-20 md:px-20 m-0 max-w-full"
        >
          ${description}
        </p>
      ` : ''}
    </div>
  `;

  const content = document.createRange().createContextualFragment(headingHTML);
  block.textContent = '';
  block.append(content);
}
