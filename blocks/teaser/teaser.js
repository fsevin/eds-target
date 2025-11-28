import { readBlockConfig, createOptimizedPicture } from '../../scripts/aem.js';
import { getSiteNameFromDAM, extractFieldFromBlock } from '../../scripts/utils.js';

/**
 * Apply optimized styling to image elements
 * @param {Element} imageContainer The container element
 */
function applyImageStyling(imageContainer) {
  const picture = imageContainer?.querySelector('picture');
  const img = picture?.querySelector('img');

  if (picture) {
    Object.assign(picture.style, {
      width: '100%',
      height: '100%',
      display: 'block',
    });
  }

  if (img) {
    Object.assign(img.style, {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'center',
      display: 'block',
      margin: '0',
    });
  }
}

export default function decorate(block) {
  const config = readBlockConfig(block);
  const style = config.style || '';
  const title = config.title || 'Teaser Title';
  const image = config.image || '';
  const imagedescription = config.imagedescription || 'Teaser image';
  const buttonlink = config.buttonlink || '#';
  const buttontext = config.buttontext || 'Learn More';

  // Create picture element or placeholder SVG
  let pictureHTML;
  if (image) {
    const picture = createOptimizedPicture(image, imagedescription);
    pictureHTML = picture.outerHTML;
  } else {
    // Embedded SVG placeholder
    pictureHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" class="w-full h-full">
        <rect width="800" height="600" fill="#e5e7eb"/>
        <g transform="translate(400, 300)">
          <svg xmlns="http://www.w3.org/2000/svg" x="-40" y="-40" width="80" height="80" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#9ca3af">
            <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/>
          </svg>
        </g>
        <text x="400" y="350" text-anchor="middle" fill="#9ca3af" font-family="system-ui, -apple-system, sans-serif" font-size="16">Add Image</text>
      </svg>
    `;
  }

  const descriptionHTML = extractFieldFromBlock(block, 'description') || '<p>Add your teaser description here.</p>';
  const blockId = `teaser-${Math.random().toString(36).substr(2, 9)}`;
  const sectionClasses = style.includes('highlight') ? 'py-20 bg-gray-50' : 'py-20 bg-white';

  const content = document.createRange().createContextualFragment(`
    <section class="${sectionClasses}">
      <div class="container mx-auto px-4">
        <div class="grid lg:grid-cols-5 gap-12 items-center">
          <!-- Image Section (60% width) -->
          <div id="${blockId}-image" data-aue-label="Image" data-aue-prop="image" data-aue-type="media" class="relative rounded-2xl overflow-hidden shadow-2xl lg:col-span-3">
            ${pictureHTML}
          </div>

          <!-- Content Section (40% width) -->
          <div class="space-y-6 lg:col-span-2">
            <h2 id="${blockId}-title" data-aue-label="Title" data-aue-prop="title" data-aue-type="text" class="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              ${title}
            </h2>
            <div id="${blockId}-description" data-aue-label="Description" data-aue-prop="description" data-aue-type="richtext" class="text-lg text-gray-600 leading-relaxed">
              ${descriptionHTML}
            </div>
            <div>
              <a id="${blockId}-button" data-aue-label="Call to Action" data-aue-prop="buttonText" data-aue-type="text" href="${buttonlink}" class="inline-block px-8 py-4 bg-brand-600 text-white font-semibold rounded-2xl hover:bg-brand-700 transition shadow-lg hover:shadow-xl">
                ${buttontext}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `);

  block.textContent = '';
  block.append(content);

  // Apply initial image styling
  const imageContainer = document.getElementById(`${blockId}-image`);
  applyImageStyling(imageContainer);

  // Handle offer zone if configured
  if (config.offerzone) {
    alloy('sendEvent', {
      decisionScopes: [config.offerzone],
    }).then((result) => {
      const { propositions } = result;

      propositions?.forEach((proposition) => {
        const offerContent = proposition.items[0]?.data?.content?.data?.offerByPath?.item;
        if (!offerContent) return;

        // Update text content
        const elements = {
          title: document.getElementById(`${blockId}-title`),
          description: document.getElementById(`${blockId}-description`),
          button: document.getElementById(`${blockId}-button`),
          image: document.getElementById(`${blockId}-image`),
        };

        if (elements.title) elements.title.innerHTML = offerContent.title;
        if (elements.description) elements.description.innerHTML = offerContent.description.html;

        if (elements.button) {
          elements.button.innerHTML = offerContent.buttonText;
          elements.button.href = offerContent.buttonLink._path;
        }

        // Update image
        if (elements.image && offerContent.image) {
          const imagePath = offerContent.image._path;
          const siteName = getSiteNameFromDAM(imagePath);
          const newPicture = createOptimizedPicture(
            imagePath.substring(`/content/dam/${siteName}`.length),
            offerContent.imageDescription
          );
          elements.image.innerHTML = newPicture.outerHTML;
          applyImageStyling(elements.image);
        }
      });
    });
  }
}
