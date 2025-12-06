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
  setAueAttributes
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

  const imageId = source.image?._id;
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
        "__adobe": {
          target: {
            logged: localStorage.getItem('logged'),
            profileType: localStorage.getItem('profileType'),
            lang: lang
          }
        }
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

  const imageBlock = `<div id="${blockId}-image" class="relative rounded-2xl overflow-hidden shadow-2xl lg:col-span-3">
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
      <a id="${blockId}-button" href="${buttonlink}" class="inline-flex items-center px-8 py-4 bg-brand-600 text-white font-semibold rounded-2xl hover:bg-brand-700 transition shadow-lg hover:shadow-xl">
        ${buttontext}${icon}
      </a>
    </div>
  </div>`;

  const content = document.createRange().createContextualFragment(`

    <div class="teaser-wrapper"><div data-aue-resource="urn:aemconnection:/content/3ds/language-masters/en/pages/test/jcr:content/root/section/teaser" data-aue-type="component" data-aue-behavior="component" data-aue-model="teaser" data-aue-label="Teaser" class="teaser block" data-block-name="teaser" data-block-status="loaded">
    <section class="py-20 py-20 bg-white" data-aue-resource="urn:aemconnection:/content/dam/3ds/fragments/en/offers/3ds-sustainable-innovation/jcr:content/data/master" data-aue-type="reference" data-aue-filter="cf" data-aue-label="Content Fragment">
      <div class="container mx-auto px-4">
        <div class="grid lg:grid-cols-5 gap-12 items-center">
          <div id="teaser-15rvxhjm4-image" class="relative rounded-2xl overflow-hidden shadow-2xl lg:col-span-3" data-aue-label="Image" data-aue-prop="image" data-aue-type="media"><picture style="width: 100%; height: 100%; display: block;"><source media="(min-width: 600px)" type="image/webp" srcset="/content/dam/3ds/images/editorial/visual-16.jpeg?width=2000&amp;format=webply&amp;optimize=high"><source type="image/webp" srcset="/content/dam/3ds/images/editorial/visual-16.jpeg?width=750&amp;format=webply&amp;optimize=high"><source media="(min-width: 600px)" srcset="/content/dam/3ds/images/editorial/visual-16.jpeg?width=2000&amp;format=jpeg&amp;optimize=high"><img loading="eager" alt="Sustainable innovation through virtual twin technology" src="/content/dam/3ds/images/editorial/visual-16.jpeg?width=750&amp;format=jpeg&amp;optimize=high" style="width: 100%; height: 100%; object-fit: cover; object-position: center center; display: block; margin: 0px; padding: 0px;"></picture></div><div class="space-y-6 lg:col-span-2">
    <h2 id="teaser-15rvxhjm4-title" class="text-4xl md:text-5xl font-bold text-gray-900 leading-tight" data-aue-label="Title" data-aue-prop="title" data-aue-type="text">Accelerate Sustainable Innovation with Virtual Twins 4</h2>
    <div id="teaser-15rvxhjm4-description" class="text-lg text-gray-600 leading-relaxed" data-aue-label="Description" data-aue-prop="description" data-aue-type="richtext"><p>Reduce environmental impact while driving business growth. Our <strong>3D</strong>EXPERIENCE platform enables virtual prototyping, eliminating physical waste and optimizing resource efficiency across your entire value chain.</p></div>
    <div>
      <a id="teaser-15rvxhjm4-button" href="#" class="inline-flex items-center px-8 py-4 bg-brand-600 text-white font-semibold rounded-2xl hover:bg-brand-700 transition shadow-lg hover:shadow-xl" data-aue-label="Call to Action" data-aue-prop="buttonText" data-aue-type="text">Explore Sustainability Solutions<svg class="inline-block w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"></path>
  </svg></a>
    </div>
  </div>
        </div>
      </div>
    </section>
  </div></div>
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
