import { readBlockConfig, createOptimizedPicture } from '../../scripts/aem.js';
import { getSiteNameFromDAM, createPlaceholderSVG, isAuthorMode } from '../../scripts/utils.js';

function createTeaserContent(source, isOffer = false) {
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
    imageDescription: source.imageDescription || source.imagedescription || 'Teaser image'
  };
}

function updateTeaserContent(teaserContent, elements) {
  if (!teaserContent) return;

  if (elements.title && teaserContent.title) {
    elements.title.innerHTML = teaserContent.title;
  }
  if (elements.description && teaserContent.description) {
    elements.description.innerHTML = teaserContent.description;
  }
  if (elements.button) {
    if (teaserContent.buttonText) elements.button.innerHTML = teaserContent.buttonText;
    if (teaserContent.buttonLink) elements.button.href = teaserContent.buttonLink;
  }

  if (elements.image && teaserContent.image) {
    const picture = createOptimizedPicture(
      teaserContent.image,
      teaserContent.imageDescription
    );
    elements.image.innerHTML = picture.outerHTML;
    applyImageStyling(elements.image);
  }
}

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
  const blockId = `teaser-${Math.random().toString(36).substr(2, 9)}`;

  const title = 'Teaser Title';
  const buttonlink = '#';
  const buttontext = 'Learn More';
  const descriptionHTML = '<p>Add your teaser description here.</p>';
  const pictureHTML = createPlaceholderSVG('image', '4:3');

  const style = config.style || '';
  const sectionClasses = style.includes('highlight') ? 'py-20 bg-gray-50' : 'py-20 bg-white';

  const content = document.createRange().createContextualFragment(`
    <section class="${sectionClasses}">
      <div class="container mx-auto px-4">
        <div class="grid lg:grid-cols-5 gap-12 items-center">
          <div id="${blockId}-image" data-aue-label="Image" data-aue-prop="image" data-aue-type="media" class="relative rounded-2xl overflow-hidden shadow-2xl lg:col-span-3" style="min-height: 400px; aspect-ratio: 4/3;">
            ${pictureHTML}
          </div>
          <div class="space-y-6 lg:col-span-2">
            <h2 id="${blockId}-title" data-aue-label="Title" data-aue-prop="title" data-aue-type="text" class="text-4xl md:text-5xl font-bold text-gray-900 leading-tight" style="min-height: 3em;">
              ${title}
            </h2>
            <div id="${blockId}-description" data-aue-label="Description" data-aue-prop="description" data-aue-type="richtext" class="text-lg text-gray-600 leading-relaxed" style="min-height: 5em;">
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

  const elements = {
    section: block.querySelector('section'),
    title: document.getElementById(`${blockId}-title`),
    description: document.getElementById(`${blockId}-description`),
    button: document.getElementById(`${blockId}-button`),
    image: document.getElementById(`${blockId}-image`),
  };

  applyImageStyling(elements.image);

  const teaserContent = createTeaserContent(config, false);
  updateTeaserContent(teaserContent, elements);

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
        const offerTeaserContent = createTeaserContent(offerContent, true);
        updateTeaserContent(offerTeaserContent, elements);
      });
    });
  }
}
