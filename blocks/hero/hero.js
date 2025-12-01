import { readBlockConfig, createOptimizedPicture } from '../../scripts/aem.js';
import { getSiteNameFromDAM, createPlaceholderSVG, isAuthorMode } from '../../scripts/utils.js';

function createHeroContent(source, isOffer = false) {
  if (!source) return null;

  let imagePath = source.image?._path || source.image;

  if (isOffer && imagePath) {
    const siteName = getSiteNameFromDAM(imagePath);
    imagePath = imagePath.substring(`/content/dam/${siteName}`.length);
  }

  return {
    title: source.title,
    description: source.description?.html || source.description,
    buttonText: source.buttonText || source.buttontext,
    buttonLink: source.buttonLink || source.buttonlink,
    image: imagePath,
    imageDescription: source.imageDescription || source.imagedescription || 'Hero image'
  };
}

function updateHeroContent(heroContent, elements) {
  if (!heroContent) return;

  if (elements.title && heroContent.title) {
    elements.title.innerHTML = heroContent.title;
  }
  if (elements.description && heroContent.description) {
    elements.description.innerHTML = heroContent.description;
  }
  if (elements.button) {
    if (heroContent.buttonText) elements.button.innerHTML = heroContent.buttonText;
    if (heroContent.buttonLink) elements.button.href = heroContent.buttonLink;
  }

  if (elements.image && heroContent.image) {
    const picture = createOptimizedPicture(heroContent.image, heroContent.imageDescription);
    elements.image.innerHTML = picture.outerHTML;
    applyBackgroundImageStyling(elements.image);
  }
}

function applyBackgroundImageStyling(imageContainer) {
  if (!imageContainer) return;

  Object.assign(imageContainer.style, {
    overflow: 'hidden',
    contain: 'layout'
  });

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

  const title = 'Hero Title';
  const buttonlink = '#';
  const buttontext = 'Get Started';
  const descriptionHTML = '<p>Add your hero description here.</p>';
  const pictureHTML = createPlaceholderSVG('image', '16:9');

  const content = document.createRange().createContextualFragment(`
    <section class="relative py-12 md:py-20 bg-cover bg-center bg-no-repeat" style="min-height: 500px; contain: layout;">
      <div id="${blockId}-image" class="absolute inset-0 z-0" style="contain: layout;">${pictureHTML}</div>
      <div class="absolute inset-0 bg-black/50 z-10"></div>
      <div class="container mx-auto px-4 relative z-20">
        <div class="max-w-4xl mx-auto text-center">
          <h1 id="${blockId}-title" data-aue-label="Title" data-aue-prop="title" data-aue-type="text" class="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" style="min-height: 4rem;">
            ${title}
          </h1>
          <div id="${blockId}-description" data-aue-label="Description" data-aue-prop="description" data-aue-type="richtext" class="text-lg md:text-xl text-gray-200 mb-8 max-w-3xl mx-auto" style="min-height: 6rem;">
            ${descriptionHTML}
          </div>
          <div class="flex items-center justify-center" style="min-height: 3.5rem;">
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

  const elements = {
    section: block.querySelector('section'),
    title: document.getElementById(`${blockId}-title`),
    description: document.getElementById(`${blockId}-description`),
    button: document.getElementById(`${blockId}-button`),
    image: document.getElementById(`${blockId}-image`),
  };

  applyBackgroundImageStyling(elements.image);

  const heroContent = createHeroContent(config, false);
  updateHeroContent(heroContent, elements);

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
        const offerHeroContent = createHeroContent(offerContent, true);
        updateHeroContent(offerHeroContent, elements);
      });
    });
  }
}
