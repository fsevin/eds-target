import { readBlockConfig, createOptimizedPicture } from '../../scripts/aem.js';
import { getSiteNameFromDAM, createPlaceholderSVG, isAuthorMode, getButtonIcon } from '../../scripts/utils.js';

function updateHeroContent(source, elements, showButtonIcon = false) {
  if (!source) return;

  if (elements.title && source.title) {
    elements.title.innerHTML = source.title;
  }

  const description = source.description?.html || source.description;
  if (elements.description && description) {
    elements.description.innerHTML = description;
  }

  const buttonText = source.buttonText || source.buttontext;
  const buttonLink = source.buttonLink || source.buttonlink;
  if (elements.button) {
    const icon = showButtonIcon ? getButtonIcon() : '';
    if (buttonText) elements.button.innerHTML = buttonText + icon;
    if (buttonLink) elements.button.href = buttonLink;
  }

  let imagePath = source.image?._path || source.image;
  if (elements.image && imagePath) {
    if (imagePath.includes('/content/dam/')) {
      const siteName = getSiteNameFromDAM(imagePath);
      imagePath = imagePath.substring(`/content/dam/${siteName}`.length);
    }
    const imageDescription = source.imageDescription || source.imagedescription || 'Hero image';
    const picture = createOptimizedPicture(imagePath, imageDescription, true);
    elements.image.innerHTML = picture.outerHTML;
    applyBackgroundImageStyling(elements.image);
  }
}

function applyBackgroundImageStyling(imageContainer) {
  if (!imageContainer) return;

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

  const title = config.title || 'Hero Title';
  const buttonlink = config.buttonlink || config.buttonLink || '#';
  const buttontext = config.buttontext || config.buttonText || 'Get Started';
  const descriptionHTML = config.description || '<p>Add your hero description here.</p>';
  const showButtonIcon = config.showbuttonicon === 'true' || config.showbuttonicon === true;

  const icon = showButtonIcon ? getButtonIcon() : '';

  let pictureHTML;
  if (config.image) {
    const picture = createOptimizedPicture(config.image, config.imagedescription || 'Hero image', true);
    pictureHTML = picture.outerHTML;
  } else {
    pictureHTML = createPlaceholderSVG('image', '16:9');
  }

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
              ${buttontext}${icon}
            </a>
          </div>
        </div>
      </div>
    </section>
  `);

  block.textContent = '';
  block.append(content);

  const elements = {
    section: block.querySelector('section'),
    title: document.getElementById(`${blockId}-title`),
    description: document.getElementById(`${blockId}-description`),
    button: document.getElementById(`${blockId}-button`),
    image: document.getElementById(`${blockId}-image`),
  };

  applyBackgroundImageStyling(elements.image);

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
        updateHeroContent(offerContent, elements, showButtonIcon);
      });
    });
  }
}
