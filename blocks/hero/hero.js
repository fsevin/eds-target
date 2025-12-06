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

function setAueAttributes(elements, fragmentPath) {
  if (!fragmentPath) return;

  if (aueContainer) {
    elements.section.setAttribute('data-aue-resource', `urn:aemconnection:${fragmentPath}/jcr:content/data/master`);
    elements.section.setAttribute('data-aue-type', 'reference');
    elements.section.setAttribute('data-aue-filter', 'cf');
    elements.section.setAttribute('data-aue-label', 'Content Fragment');
  }

  if (elements.image) {
    elements.image.setAttribute('data-aue-label', 'Image');
    elements.image.setAttribute('data-aue-prop', 'image');
    elements.image.setAttribute('data-aue-type', 'media');
  }
  if (elements.title) {
    elements.title.setAttribute('data-aue-label', 'Title');
    elements.title.setAttribute('data-aue-prop', 'title');
    elements.title.setAttribute('data-aue-type', 'text');
  }
  if (elements.description) {
    elements.description.setAttribute('data-aue-label', 'Description');
    elements.description.setAttribute('data-aue-prop', 'description');
    elements.description.setAttribute('data-aue-type', 'richtext');
  }
  if (elements.button) {
    elements.button.setAttribute('data-aue-label', 'Call to Action');
    elements.button.setAttribute('data-aue-prop', 'buttonText');
    elements.button.setAttribute('data-aue-type', 'text');
  }
}

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

  const imageId = source.image?._id;
  const imagePath = source.image?._path;
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

  // Initialize with empty values (will be populated by content sources)
  const title = '';
  const buttonlink = '';
  const buttontext = '';
  const descriptionHTML = '';
  const pictureHTML = createPlaceholderSVG('image', '16:9');
  const showButtonIcon = parseConfigBoolean(config.showbuttonicon);
  const useDynamicMedia = parseConfigBoolean(config.dynamicmediadelivery);

  const icon = showButtonIcon ? getButtonIcon() : '';

  const content = document.createRange().createContextualFragment(`
    <section class="relative py-12 md:py-20 bg-cover bg-center bg-no-repeat" >
      <div id="${blockId}-image" class="absolute inset-0 z-0">${pictureHTML}</div>
      <div class="absolute inset-0 bg-black/50 z-10"></div>
      <div class="container mx-auto px-4 relative z-20">
        <div class="max-w-4xl mx-auto text-center">
          <h1 id="${blockId}-title" class="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            ${title}
          </h1>
          <div id="${blockId}-description" class="text-lg md:text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            ${descriptionHTML}
          </div>
          <div class="flex items-center justify-center">
            <a id="${blockId}-button" href="${buttonlink}" class="px-8 py-4 bg-brand-600 text-white font-semibold rounded-2xl hover:bg-brand-700 transition shadow-lg hover:shadow-xl">
              ${buttontext}${icon}
            </a>
          </div>
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

  applyImageStyling(elements.image, { absolute: true });

  // Update with alloy content first (personalization takes priority)
  if (alloyContent) {
    setAueAttributes(elements, fragmentPath);
    updateHeroContent(alloyContent, elements, showButtonIcon, useDynamicMedia);
  } else if (fragmentPromise) {
    // Fall back to fragment data if no alloy content
    const fragmentData = await fragmentPromise;
    if (fragmentData) {
      setAueAttributes(elements, fragmentPath);
      updateHeroContent(fragmentData, elements, showButtonIcon, useDynamicMedia);
    }
  }
}
