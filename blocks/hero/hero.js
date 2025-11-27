import { readBlockConfig, createOptimizedPicture } from '../../scripts/aem.js';
import { getSiteNameFromDAM, extractFieldFromBlock } from '../../scripts/utils.js';

/**
 * Apply background image styling
 * @param {Element} imageContainer The image container element
 */
function applyBackgroundImageStyling(imageContainer) {
  if (!imageContainer) return;

  imageContainer.style.overflow = 'hidden';

  const picture = imageContainer.querySelector('picture');
  const img = picture?.querySelector('img');

  if (picture) {
    Object.assign(picture.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      margin: '0',
      padding: '0',
      display: 'block',
    });
  }

  if (img) {
    Object.assign(img.style, {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'center',
      margin: '0',
      padding: '0',
      display: 'block',
      verticalAlign: 'top',
    });
  }
}

export default function decorate(block) {
  const config = readBlockConfig(block);
  const picture = createOptimizedPicture(config.image, config.imagedescription);
  const descriptionHTML = extractFieldFromBlock(block, 'description');
  const blockId = `hero-${Math.random().toString(36).substr(2, 9)}`;

  const content = document.createRange().createContextualFragment(`
    <section class="relative py-12 md:py-20 bg-cover bg-center bg-no-repeat">
      <!-- Background Image -->
      <div id="${blockId}-image" class="absolute inset-0 z-0">
        ${picture.outerHTML}
      </div>

      <!-- Black Overlay -->
      <div class="absolute inset-0 bg-black/50 z-10"></div>

      <!-- Content -->
      <div class="container mx-auto px-4 relative z-20">
        <div class="max-w-4xl mx-auto text-center">
          <!-- Main Heading -->
          <h1 id="${blockId}-title" data-aue-label="Title" data-aue-prop="title" data-aue-type="text" class="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            ${config.title}
          </h1>

          <!-- Description -->
          <div id="${blockId}-description" data-aue-label="Description" data-aue-prop="description" data-aue-type="richtext" class="text-lg md:text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            ${descriptionHTML}
          </div>

          <!-- CTA Button -->
          <div class="flex items-center justify-center">
            <a id="${blockId}-button" data-aue-label="Call to Action" data-aue-prop="buttonText" data-aue-type="text" href="${config.buttonlink}" class="px-8 py-4 bg-brand-600 text-white font-semibold rounded-2xl hover:bg-brand-700 transition shadow-lg hover:shadow-xl">
              ${config.buttontext}
            </a>
          </div>
        </div>
      </div>
    </section>
  `);

  block.textContent = '';
  block.append(content);

  // Apply initial background image styling
  const imageContainer = document.getElementById(`${blockId}-image`);
  applyBackgroundImageStyling(imageContainer);

  // Handle offer zone if configured
  if (config.offerzone) {
    alloy('sendEvent', {
      decisionScopes: [config.offerzone],
    }).then((result) => {
      const { propositions } = result;

      propositions?.forEach((proposition) => {
        const offerContent = proposition.items[0]?.data?.content?.data?.offerByPath?.item;
        if (!offerContent) return;

        // Cache element references
        const elements = {
          title: document.getElementById(`${blockId}-title`),
          description: document.getElementById(`${blockId}-description`),
          button: document.getElementById(`${blockId}-button`),
          image: document.getElementById(`${blockId}-image`),
        };

        // Update text content
        if (elements.title) elements.title.innerHTML = offerContent.title;
        if (elements.description) elements.description.innerHTML = offerContent.description.html;

        if (elements.button) {
          elements.button.innerHTML = offerContent.buttonText;
          elements.button.href = offerContent.buttonLink._path;
        }

        // Update background image
        if (elements.image && offerContent.image) {
          const imagePath = offerContent.image._path;
          const siteName = getSiteNameFromDAM(imagePath);
          const newPicture = createOptimizedPicture(
            imagePath.substring(`/content/dam/${siteName}`.length),
            offerContent.imageDescription
          );
          elements.image.innerHTML = newPicture.outerHTML;
          applyBackgroundImageStyling(elements.image);
        }
      });
    });
  }
}
