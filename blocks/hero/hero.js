import { readBlockConfig, createOptimizedPicture } from '../../scripts/aem.js';
import { getSiteNameFromDAM, createPlaceholderSVG, isAuthorMode } from '../../scripts/utils.js';

/**
 * Fetch content fragment data from GraphQL endpoint
 * @param {string} fragmentPath Content fragment path
 * @returns {Promise<Object>} Content fragment data
 */
async function fetchContentFragment(fragmentPath) {
  const cleanPath = fragmentPath.replace(/^https?:\/\/[^/]+/, '');
  const domain = isAuthorMode ? 'author-p34570-e1263228' : 'publish-p34570-e1263228';
  const graphqlUrl = `https://${domain}.adobeaemcloud.com/graphql/execute.json/3ds/offer-by-path;offerPath=${cleanPath}`;

  try {
    const response = await fetch(graphqlUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data?.data?.offerByPath?.item || null;
  } catch (error) {
    console.error('Error fetching content fragment:', error);
    return null;
  }
}

function updateHeroContent(offerContent, elements) {
  if (!offerContent) return;

  // Update text content
  if (elements.title) elements.title.innerHTML = offerContent.title;
  if (elements.description) elements.description.innerHTML = offerContent.description?.html;
  if (elements.button) {
    elements.button.innerHTML = offerContent.buttonText;
    elements.button.href = offerContent.buttonLink?._path;
  }

  // Update background image
  if (elements.image && offerContent.image?._path) {
    const imagePath = offerContent.image._path;
    const siteName = getSiteNameFromDAM(imagePath);
    const picture = createOptimizedPicture(
      imagePath.substring(`/content/dam/${siteName}`.length),
      offerContent.imageDescription
    );
    elements.image.innerHTML = picture.outerHTML;
    applyBackgroundImageStyling(elements.image);
  }

  // Update Universal Editor resource attribute if section element exists
  if (elements.section && offerContent._path) {
    const cleanPath = offerContent._path.replace(/\.html$/, '').replace(/^https?:\/\/[^/]+/, '');
    elements.section.setAttribute('data-aue-resource', `urn:aemconnection:${cleanPath}/jcr:content/data/master`);
    elements.section.setAttribute('data-aue-label', `Hero Content Fragment: ${offerContent.title}`);
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

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const blockId = `hero-${Math.random().toString(36).substr(2, 9)}`;

  // Default values
  let title = 'Hero Title';
  let imagePath = '';
  let imagedescription = 'Hero image';
  let buttonlink = '#';
  let buttontext = 'Get Started';
  let descriptionHTML = '<p>Add your hero description here.</p>';

  // Fetch content fragment data if path is provided
  if (config.contentfragmentpath) {
    const cleanPath = config.contentfragmentpath.replace(/\.html$/, '');
    const fragmentData = await fetchContentFragment(cleanPath);
    if (fragmentData) {
      title = fragmentData.title || title;
      descriptionHTML = fragmentData.description?.html || descriptionHTML;
      buttontext = fragmentData.buttonText || buttontext;
      buttonlink = fragmentData.buttonLink?._path || buttonlink;
      imagedescription = fragmentData.imageDescription || imagedescription;
      imagePath = fragmentData.image?._path || imagePath;
    }
  }

  // Create picture element or placeholder SVG
  let pictureHTML;
  if (imagePath) {
    const siteName = getSiteNameFromDAM(imagePath);
    const picture = createOptimizedPicture(
      imagePath.substring(`/content/dam/${siteName}`.length),
      imagedescription
    );
    pictureHTML = picture.outerHTML;
  } else {
    pictureHTML = createPlaceholderSVG('image', '4:3');
  }

  // Build Universal Editor attributes for content fragment reference
  let ueAttributes = '';
  if (config.contentfragmentpath) {
    const cleanPath = config.contentfragmentpath.replace(/\.html$/, '').replace(/^https?:\/\/[^/]+/, '');
    ueAttributes = `data-aue-resource="urn:aemconnection:${cleanPath}/jcr:content/data/master" data-aue-type="reference" data-aue-filter="cf" data-aue-label="Hero Content Fragment"`;
  }

  // Render hero HTML
  const content = document.createRange().createContextualFragment(`
    <section class="relative py-12 md:py-20 bg-cover bg-center bg-no-repeat" ${ueAttributes}>
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

  // Handle offer zone if configured
  if (config.offerzone) {
    alloy('sendEvent', {
      decisionScopes: [config.offerzone],
    }).then((result) => {
      result.propositions?.forEach((proposition) => {
        const offerContent = proposition.items[0]?.data?.content?.data?.offerByPath?.item;
        updateHeroContent(offerContent, elements);
      });
    });
  }
}
