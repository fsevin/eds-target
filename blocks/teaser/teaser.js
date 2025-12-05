import { readBlockConfig, createOptimizedPicture } from '../../scripts/aem.js';
import {
  createDynamicMediaPicture,
  createPlaceholderSVG,
  isAuthorMode,
  getButtonIcon,
  fetchContentFragmentByPath,
  parseConfigBoolean,
  applyImageStyling,
  getLanguageFromUrl
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

  const buttonText = source.buttonText;
  const buttonLink = source.buttonLink;
  if (elements.button) {
    const icon = showButtonIcon ? getButtonIcon() : '';
    if (buttonText) elements.button.innerHTML = buttonText + icon;
    if (buttonLink) elements.button.href = buttonLink;
  }

  const imageId = source.image?.['_id'];
  const imagePath = source.image?.['_path'];
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

  // Fetch content fragment if specified
  let fragmentData = null;
  let fragmentPath = null;
  if (config.contentfragment) {
    fragmentPath = config.contentfragment.replace(/^https?:\/\/[^/]+/, '');
    fragmentPath = fragmentPath.replace(/\.(html|json)$/, '');
    fragmentData = await fetchContentFragmentByPath(fragmentPath);
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

  // Build AUE attributes for section if using content fragment
  const aueAttrs = fragmentPath
    ? `data-aue-resource="urn:aemconnection:${fragmentPath}/jcr:content/data/master" data-aue-type="reference" data-aue-filter="cf" data-aue-label="Content Fragment"`
    : '';

  const imageBlock = `<div id="${blockId}-image" data-aue-label="Image" data-aue-prop="image" data-aue-type="media" class="relative rounded-2xl overflow-hidden shadow-2xl lg:col-span-3">
    ${pictureHTML}
  </div>`;

  const textBlock = `<div class="space-y-6 lg:col-span-2">
    <h2 id="${blockId}-title" data-aue-label="Title" data-aue-prop="title" data-aue-type="text" class="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
      ${title}
    </h2>
    <div id="${blockId}-description" data-aue-label="Description" data-aue-prop="description" data-aue-type="richtext" class="text-lg text-gray-600 leading-relaxed">
      ${descriptionHTML}
    </div>
    <div>
      <a id="${blockId}-button" data-aue-label="Call to Action" data-aue-prop="buttonText" data-aue-type="text" href="${buttonlink}" class="inline-flex items-center px-8 py-4 bg-brand-600 text-white font-semibold rounded-2xl hover:bg-brand-700 transition shadow-lg hover:shadow-xl">
        ${buttontext}${icon}
      </a>
    </div>
  </div>`;

  const content = document.createRange().createContextualFragment(`
    <section class="py-20 py-20 bg-white">
      <div ${aueAttrs}>
      <div class="container mx-auto px-4">
        <div class="grid lg:grid-cols-5 gap-12 items-center">
          ${flipLayout ? textBlock + imageBlock : imageBlock + textBlock}
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

  // Update with fragment data if available
  if (fragmentData) {
    updateTeaserContent(fragmentData, elements, showButtonIcon, useDynamicMedia);
  }

  const lang = getLanguageFromUrl();

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
        updateTeaserContent(offerContent, elements, showButtonIcon, useDynamicMedia);
      });
    });
  }
}
