import { readBlockConfig, createOptimizedPicture } from '../../scripts/aem.js';
import { getSiteNameFromDAM, createPlaceholderSVG, isAuthorMode } from '../../scripts/utils.js';

function updateHeroContent(offerContent, elements) {
  if (!offerContent) return;

  // Update text content
  if (elements.title && (offerContent.title)) {
    elements.title.innerHTML = offerContent.title;
  }
  if (elements.description) {
    // Handle both offer format (description.html) and config format (description)
    const descHTML = offerContent.description?.html || offerContent.description;
    if (descHTML) elements.description.innerHTML = descHTML;
  }
  if (elements.button) {
    // Handle both offer format (buttonText) and config format (buttontext)
    const btnText = offerContent.buttonText || offerContent.buttontext;
    const btnLink = offerContent.buttonLink || offerContent.buttonlink;
    if (btnText) elements.button.innerHTML = btnText;
    if (btnLink) elements.button.href = btnLink;
  }

  // Update background image
  // Handle both offer format (image._path) and config format (image as string)
  const imagePath = offerContent.image?._path || offerContent.image;
  if (elements.image && imagePath) {
    const siteName = getSiteNameFromDAM(imagePath);
    const imageDesc = offerContent.imageDescription || offerContent.imagedescription || 'Hero image';
    const picture = createOptimizedPicture(
      imagePath.substring(`/content/dam/${siteName}`.length),
      imageDesc
    );
    elements.image.innerHTML = picture.outerHTML;
    applyBackgroundImageStyling(elements.image);
  }
}

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
  const blockId = `hero-${Math.random().toString(36).substr(2, 9)}`;

  // Default placeholder values for instant render
  const title = 'Hero Title';
  const buttonlink = '#';
  const buttontext = 'Get Started';
  const descriptionHTML = '<p>Add your hero description here.</p>';
  const pictureHTML = createPlaceholderSVG('image', '16:9');

  // Render hero HTML immediately with placeholders
  const content = document.createRange().createContextualFragment(`
    <section class="relative py-12 md:py-20 bg-cover bg-center bg-no-repeat">
      <div id="${blockId}-image" class="absolute inset-0 z-0">${pictureHTML}</div>
      <div class="absolute inset-0 bg-black/50 z-10"></div>
      <div class="container mx-auto px-4 relative z-20">
        <div class="max-w-4xl mx-auto text-center">
          <h1 id="${blockId}-title" data-aue-label="Title" data-aue-prop="title" data-aue-type="text" class="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            ${title}
          </h1>
          <div id="${blockId}-description" data-aue-label="Description" data-aue-prop="description" data-aue-type="richtext" class="text-lg md:text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            ${descriptionHTML}
          </div>
          <div class="flex items-center justify-center">
            <a id="${blockId}-button" data-aue-label="Call to Action" data-aue-prop="buttonText" data-aue-type="text" href="${buttonlink}" class="px-8 py-4 bg-brand-600 text-white font-semibold rounded-2xl hover:bg-brand-700 transition shadow-lg hover:shadow-xl">
              ${buttontext}
            </a>
          </div>
        </div>
      </div>
    </section>
  `);

  block.textContent = '';
  block.append(content);

  // Cache element references for updates
  const elements = {
    section: block.querySelector('section'),
    title: document.getElementById(`${blockId}-title`),
    description: document.getElementById(`${blockId}-description`),
    button: document.getElementById(`${blockId}-button`),
    image: document.getElementById(`${blockId}-image`),
  };

  // Apply initial background image styling
  applyBackgroundImageStyling(elements.image);
  updateHeroContent(config, elements);
  
  // Handle offer zone if configured (only in non-author mode)
  if (config.offerzone && !isAuthorMode) {
    alloy('sendEvent', {
      decisionScopes: [config.offerzone],
      data: {
        "__adobe": {
          target: {
            logged: localStorage.getItem('logged'),
            profileType: localStorage.getItem('profileType'),
          }
        }
      },
    }).then((result) => {
      result.propositions?.forEach((proposition) => {
        const offerContent = proposition.items[0]?.data?.content?.data?.offerByPath?.item;
        updateHeroContent(offerContent, elements);
      });
    });
  }
}
