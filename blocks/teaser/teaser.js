import { readBlockConfig, createOptimizedPicture } from '../../scripts/aem.js';
import { getSiteNameFromDAM, createPlaceholderSVG, isAuthorMode, getButtonIcon } from '../../scripts/utils.js';

async function fetchContentFragmentByPath(fragmentUrl) {
  if (!fragmentUrl) return null;

  try {
    // Remove domain and extension from URL
    let path = fragmentUrl.replace(/^https?:\/\/[^/]+/, '');
    path = path.replace(/\.(html|json)$/, '');

    const apiUrl = `https://author-p34570-e1263228.adobeaemcloud.com/adobe/sites/cf/fragments?path=${path}`;
    const response = await fetch(apiUrl);

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    const item = data.items?.[0];

    if (!item) return null;

    // Transform fields array into object
    const fields = {};
    item.fields?.forEach(field => {
      fields[field.name] = field.values?.[0] || '';
    });

    return {
      title: fields.title || '',
      description: fields.description || '',
      buttonText: fields.buttonText || '',
      buttonLink: fields.buttonLink || '#',
      image: fields.image || null,
      imageDescription: fields.imageDescription || '',
    };
  } catch (error) {
    console.error('Error fetching content fragment:', error);
    return null;
  }
}

function updateTeaserContent(source, elements, showButtonIcon = false) {
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
    const imageDescription = source.imageDescription || source.imagedescription || 'Teaser image';
    const picture = createOptimizedPicture(imagePath, imageDescription, true);
    elements.image.innerHTML = picture.outerHTML;
    applyImageStyling(elements.image);
  }
}

function applyImageStyling(imageContainer) {
  if (!imageContainer) return;

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

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const blockId = `teaser-${Math.random().toString(36).substr(2, 9)}`;

  // Fetch content fragment if specified
  let fragmentData = null;
  if (config.contentfragment) {
    fragmentData = await fetchContentFragmentByPath(config.contentfragment);
  }

  // Use fragment data or fall back to config
  const source = fragmentData || config;
  const title = source.title || 'Teaser Title';
  const buttonlink = source.buttonLink || source.buttonlink || '#';
  const buttontext = source.buttonText || source.buttontext || 'Learn More';
  const descriptionHTML = source.description || '<p>Add your teaser description here.</p>';

  let pictureHTML;
  const imageSource = source.image || config.image;
  const imageDesc = source.imageDescription || config.imagedescription || 'Teaser image';

  if (imageSource) {
    let imagePath = imageSource;
    // Remove DAM prefix if present
    if (imagePath.includes('/content/dam/')) {
      const siteName = getSiteNameFromDAM(imagePath);
      imagePath = imagePath.substring(`/content/dam/${siteName}`.length);
    }
    const picture = createOptimizedPicture(imagePath, imageDesc);
    pictureHTML = picture.outerHTML;
  } else {
    pictureHTML = createPlaceholderSVG('image', '4:3');
  }

  const flipLayout = config.fliplayout === 'true' || config.fliplayout === true;
  const showButtonIcon = config.showbuttonicon === 'true' || config.showbuttonicon === true;

  const icon = showButtonIcon ? getButtonIcon() : '';

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
      <div class="container mx-auto px-4">
        <div class="grid lg:grid-cols-5 gap-12 items-center">
          ${flipLayout ? textBlock + imageBlock : imageBlock + textBlock}
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
        updateTeaserContent(offerContent, elements, showButtonIcon);
      });
    });
  }
}
