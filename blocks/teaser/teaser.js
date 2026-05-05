/* global alloy */
import { readBlockConfig, createOptimizedPicture } from '../../scripts/aem.js';
import {
  createDynamicMediaPicture,
  createPlaceholderSVG,
  isAuthorMode,
  getButtonIcon,
  fetchContentFragmentByPath,
  parseConfigBoolean,
  applyImageStyling,
  getLanguageFromPath,
  setAueAttributes,
} from '../../scripts/utils.js';

function updateTeaserContent(source, elements, showButtonIcon = false, useDynamicMedia = true) {
  if (!source) return;

  if (elements.title && source.title) {
    elements.title.innerHTML = source.title;
  }

  const description = source.description?.html || source.description;
  if (elements.description && description) {
    elements.description.innerHTML = description;
  }

  const { buttonText } = source;
  const { buttonLink } = source;
  if (elements.button) {
    const icon = showButtonIcon ? getButtonIcon() : '';
    if (buttonText) elements.button.innerHTML = buttonText + icon;
    if (buttonLink) elements.button.href = buttonLink;
  }

  // eslint-disable-next-line no-underscore-dangle
  const imageId = source.image?._id;
  // eslint-disable-next-line no-underscore-dangle
  const imagePath = source.image?._path;
  const imageDescription = source.imageDescription || 'Teaser image';

  if (elements.image && useDynamicMedia && imageId) {
    const picture = createDynamicMediaPicture(imageId, imageDescription, true, '730x438');
    elements.image.innerHTML = picture.outerHTML;
    applyImageStyling(elements.image);
  } else if (elements.image && imagePath) {
    const picture = createOptimizedPicture(imagePath, imageDescription, true);
    elements.image.innerHTML = picture.outerHTML;
    applyImageStyling(elements.image);
  }
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const blockId = `teaser-${Math.random().toString(36).substr(2, 9)}`;

  // Start fetching content fragment as early as possible (non-blocking)
  let fragmentPromise = null;
  let fragmentPath = null;
  if (config.contentfragment) {
    fragmentPath = config.contentfragment.replace(/^https?:\/\/[^/]+/, '');
    fragmentPath = fragmentPath.replace(/\.(html|json)$/, '');
    fragmentPromise = fetchContentFragmentByPath(fragmentPath);
  }

  // Start alloy call as early as possible (non-blocking)
  const lang = getLanguageFromPath();
  let alloyPromise = null;
  if (config.offerzone && !isAuthorMode) {
    alloyPromise = alloy('sendEvent', {
      decisionScopes: [config.offerzone],
      data: {
        __adobe: {
          target: {
            logged: localStorage.getItem('logged'),
            profileType: localStorage.getItem('profileType'),
            lang,
          },
        },
      },
    });
  }

  // Initialize with default values
  const title = 'Teaser Title';
  const buttonlink = '#';
  const buttontext = 'Learn More';
  const descriptionHTML = '<p>Add your teaser description here.</p>';
  const pictureHTML = createPlaceholderSVG('image', '4:3');

  const flipLayout = parseConfigBoolean(config.fliplayout);
  const showButtonIcon = parseConfigBoolean(config.showbuttonicon);
  const useDynamicMedia = parseConfigBoolean(config.dynamicmediadelivery);

  const icon = showButtonIcon ? getButtonIcon() : '';

  const imageBlock = `<div id="${blockId}-image" class="relative rounded-lg overflow-hidden shadow-2xl lg:col-span-3">
    ${pictureHTML}
  </div>`;

  const textBlock = `<div class="space-y-6 lg:col-span-2">
    <h2 id="${blockId}-title" class="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
      ${title}
    </h2>
    <div id="${blockId}-description" class="text-lg text-gray-600 leading-relaxed">
      ${descriptionHTML}
    </div>
    <div>
      <a id="${blockId}-button" href="${buttonlink}" class="inline-flex items-center px-8 py-4 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition shadow-lg hover:shadow-xl">
        ${buttontext}${icon}
      </a>
    </div>
  </div>`;

  const content = document.createRange().createContextualFragment(`
    <section class="py-20 py-20 bg-white">
      <div class="container mx-auto px-4">
        <div class="grid lg:grid-cols-5 gap-12 items-center border border-gray-200 p-8 bg-gray-50">
          ${flipLayout ? textBlock + imageBlock : imageBlock + textBlock}
        </div>
      </div>
    </section>
  `);

  // Wait for alloy result before rendering
  let alloyContent = null;
  if (alloyPromise) {
    const result = await alloyPromise;
    result.propositions?.forEach((proposition) => {
      alloyContent = proposition.items[0]?.data?.content?.data?.offerByPath?.item;
    });
  }

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

  // Update with alloy content first (personalization takes priority)
  if (alloyContent) {
    setAueAttributes(elements, fragmentPath);
    updateTeaserContent(alloyContent, elements, showButtonIcon, useDynamicMedia);
  } else if (fragmentPromise) {
    // Fall back to fragment data if no alloy content
    const fragmentData = await fragmentPromise;
    if (fragmentData) {
      setAueAttributes(elements, fragmentPath);
      updateTeaserContent(fragmentData, elements, showButtonIcon, useDynamicMedia);
    }
  }
}
