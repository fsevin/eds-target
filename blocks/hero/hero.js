import { readBlockConfig, createOptimizedPicture } from '../../scripts/aem.js';
import {
  createDynamicMediaPicture,
  createPlaceholderSVG,
  isAuthorMode,
  getButtonIcon,
  fetchContentFragmentByPath,
  parseConfigBoolean,
  applyImageStyling,
  getLanguageFromPath
} from '../../scripts/utils.js';

function updateHeroContent(source, elements, showButtonIcon = false, useDynamicMedia = true) {
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

  const imageId = source.image?.['_id'];
  const imagePath = source.image?.['_path'];
  const imageDescription = source.imageDescription || source.imagedescription || 'Hero image';

  if (elements.image && useDynamicMedia && imageId) {
    const picture = createDynamicMediaPicture(imageId, imageDescription, true, '1500x450');
    elements.image.innerHTML = picture.outerHTML;
    applyImageStyling(elements.image, { absolute: true });
  } else if (elements.image && imagePath) {
    const picture = createOptimizedPicture(imagePath, imageDescription, true);
    elements.image.innerHTML = picture.outerHTML;
    applyImageStyling(elements.image, { absolute: true });
  }
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const blockId = `hero-${Math.random().toString(36).substr(2, 9)}`;

  // Start fetching content fragment as early as possible (non-blocking)
  let fragmentPromise = null;
  let fragmentPath = null;
  if (config.contentfragment) {
    fragmentPath = config.contentfragment.replace(/^https?:\/\/[^/]+/, '');
    fragmentPath = fragmentPath.replace(/\.(html|json)$/, '');
    fragmentPromise = fetchContentFragmentByPath(fragmentPath);
  }

  // Initialize with default values
  const title = 'Hero Title';
  const buttonlink = '#';
  const buttontext = 'Get Started';
  const descriptionHTML = '<p>Add your hero description here.</p>';
  const pictureHTML = createPlaceholderSVG('image', '16:9');
  const showButtonIcon = parseConfigBoolean(config.showbuttonicon);
  const useDynamicMedia = parseConfigBoolean(config.dynamicmediadelivery);

  const icon = showButtonIcon ? getButtonIcon() : '';

  // Build AUE attributes for section if using content fragment
  const aueAttrs = fragmentPath
    ? `data-aue-resource="urn:aemconnection:${fragmentPath}/jcr:content/data/master" data-aue-type="reference" data-aue-filter="cf" data-aue-label="Content Fragment"`
    : '';

  const content = document.createRange().createContextualFragment(`
    <section class="relative py-12 md:py-20 bg-cover bg-center bg-no-repeat" >
      <div ${aueAttrs}>
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

  applyImageStyling(elements.image, { absolute: true });

  // Wait for fragment data and update content if available
  if (fragmentPromise) {
    const fragmentData = await fragmentPromise;
    if (fragmentData) {
      updateHeroContent(fragmentData, elements, showButtonIcon, useDynamicMedia);
    }
  }

  const lang = getLanguageFromPath();

  if (config.offerzone && !isAuthorMode) {
    alloy('sendEvent', {
      decisionScopes: [config.offerzone],
      data: {
        "__adobe": {
          target: {
            logged: localStorage.getItem('logged'),
            profileType: localStorage.getItem('profileType'),
            lang: lang
          }
        }
      },
    }).then((result) => {
      result.propositions?.forEach((proposition) => {
        const offerContent = proposition.items[0]?.data?.content?.data?.offerByPath?.item;
        updateHeroContent(offerContent, elements, showButtonIcon, useDynamicMedia);
      });
    });
  }
}
