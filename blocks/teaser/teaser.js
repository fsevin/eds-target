import { readBlockConfig, createOptimizedPicture } from '../../scripts/aem.js';
import { getSiteNameFromDAM, createPlaceholderSVG, isAuthorMode } from '../../scripts/utils.js';

/**
 * Fetch content fragment data from GraphQL endpoint or AEM API
 * @param {string} fragmentPath Content fragment path
 * @returns {Promise<Object>} Content fragment data
 */
async function fetchContentFragment(fragmentPath) {
  const cleanPath = fragmentPath.replace(/^https?:\/\/[^/]+/, '');
  const domain = isAuthorMode ? 'author-p34570-e1263228' : 'publish-p34570-e1263228';

  try {
    if (isAuthorMode) {
      // In author mode, fetch via AEM API
      // Step 1: Get jcr:uuid from the fragment JSON
      const jsonUrl = `https://${domain}.adobeaemcloud.com${cleanPath}.json`;
      const jsonResponse = await fetch(jsonUrl);
      if (!jsonResponse.ok) throw new Error(`HTTP error! status: ${jsonResponse.status}`);
      const jsonData = await jsonResponse.json();
      const uuid = jsonData['jcr:uuid'];

      if (!uuid) throw new Error('jcr:uuid not found in fragment JSON');

      // Step 2: Fetch fragment data using the UUID
      const fragmentUrl = `https://${domain}.adobeaemcloud.com/adobe/sites/cf/fragments/${uuid}`;
      const fragmentResponse = await fetch(fragmentUrl);
      if (!fragmentResponse.ok) throw new Error(`HTTP error! status: ${fragmentResponse.status}`);
      const fragmentData = await fragmentResponse.json();

      // Transform API response to match GraphQL structure
      const fields = {};
      fragmentData.fields?.forEach(field => {
        fields[field.name] = field.values?.[0] || '';
      });

      return {
        _path: fragmentData.path,
        title: fields.title || '',
        description: { html: fields.description || '' },
        buttonText: fields.buttonText || '',
        buttonLink: { _path: fields.buttonLink || '#' },
        image: fields.image ? { _path: fields.image } : null,
        imageDescription: fields.imageDescription || '',
      };
    } else {
      // In publish mode, use GraphQL
      const graphqlUrl = `https://${domain}.adobeaemcloud.com/graphql/execute.json/3ds/offer-by-path;offerPath=${cleanPath}`;
      const response = await fetch(graphqlUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data?.data?.offerByPath?.item || null;
    }
  } catch (error) {
    console.error('Error fetching content fragment:', error);
    return null;
  }
}

/**
 * Update teaser content with offer data
 * @param {Object} offerContent Offer content from fragment or alloy
 * @param {Object} elements DOM element references
 */
function updateTeaserContent(offerContent, elements) {
  if (!offerContent) return;

  // Update text content
  if (elements.title) elements.title.innerHTML = offerContent.title;
  if (elements.description) elements.description.innerHTML = offerContent.description?.html;
  if (elements.button) {
    elements.button.innerHTML = offerContent.buttonText;
    elements.button.href = offerContent.buttonLink || '#';
  }

  // Update image content
  if (elements.image && offerContent.image?._path) {
    const imagePath = offerContent.image._path;
    const siteName = getSiteNameFromDAM(imagePath);
    const picture = createOptimizedPicture(
      imagePath.substring(`/content/dam/${siteName}`.length),
      offerContent.imageDescription
    );
    elements.image.innerHTML = picture.outerHTML;
    applyImageStyling(elements.image);
  }
}

/**
 * Apply optimized styling to image elements
 * @param {Element} imageContainer The container element
 */
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

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const blockId = `teaser-${Math.random().toString(36).substr(2, 9)}`;

  // Default values
  let title = 'Teaser Title';
  let imagePath = '';
  let imagedescription = 'Teaser image';
  let buttonlink = '#';
  let buttontext = 'Learn More';
  let descriptionHTML = '<p>Add your teaser description here.</p>';

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

  const style = config.style || '';
  const sectionClasses = style.includes('highlight') ? 'py-20 bg-gray-50' : 'py-20 bg-white';

  // Build Universal Editor resource attribute for content fragment reference
  let ueResource = '';
  if (config.contentfragmentpath) {
    const cleanPath = config.contentfragmentpath.replace(/\.html$/, '').replace(/^https?:\/\/[^/]+/, '');
    ueResource = `data-aue-resource="urn:aemconnection:${cleanPath}/jcr:content/data/master"`;
  }

  // Render teaser HTML
  const content = document.createRange().createContextualFragment(`
    <section class="${sectionClasses}" ${ueResource} data-aue-type="reference" data-aue-filter="cf" data-aue-label="Content Fragment">
      <div class="container mx-auto px-4">
        <div class="grid lg:grid-cols-5 gap-12 items-center">
          <div id="${blockId}-image" data-aue-label="Image" data-aue-prop="image" data-aue-type="media" class="relative rounded-2xl overflow-hidden shadow-2xl lg:col-span-3">
            ${pictureHTML}
          </div>
          <div class="space-y-6 lg:col-span-2">
            <h2 id="${blockId}-title" data-aue-label="Title" data-aue-prop="title" data-aue-type="text" class="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              ${title}
            </h2>
            <div id="${blockId}-description" data-aue-label="Description" data-aue-prop="description" data-aue-type="richtext" class="text-lg text-gray-600 leading-relaxed">
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

  // Cache element references for updates
  const elements = {
    section: block.querySelector('section'),
    title: document.getElementById(`${blockId}-title`),
    description: document.getElementById(`${blockId}-description`),
    button: document.getElementById(`${blockId}-button`),
    image: document.getElementById(`${blockId}-image`),
  };

  // Apply initial image styling
  applyImageStyling(elements.image);

  // Handle offer zone if configured (only in non-author mode)
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
        updateTeaserContent(offerContent, elements);
      });
    });
  }
}
