const AUTHOR_DOMAIN = 'https://author-p34570-e1263228.adobeaemcloud.com';
const PUBLISH_DOMAIN = 'https://publish-p34570-e1263228.adobeaemcloud.com';
const DELIVERY_DOMAIN = 'https://delivery-p34570-e1263228.adobeaemcloud.com';

function getSiteName() {
  const path = window.location.pathname;
  const match = path.match(/^\/content\/([^/]+)\//);
  return match ? match[1] : '/';
}

export function getCurrentLocale() {
  const path = window.location.pathname;
  const parts = path.split('/').filter(part => part !== '');

  const hasLaunches = path.startsWith('/content/launches/');
  const launchOffset = (isAuthorMode && hasLaunches) ? 6 : 0;

  const countryIndex = (isAuthorMode ? 2 : 0) + launchOffset;
  const langIndex = (isAuthorMode ? 3 : 1) + launchOffset;

  return `${parts[countryIndex]}/${parts[langIndex]}`;
}

export function getPagePath(path){
  return isAuthorMode ? `/content/${getSiteName()}${path}.html` : path;
};

export function getIconPath(imageName) {
  return `${isAuthorMode ? `/content/${getSiteName()}.resource/icons/` : '/icons/'}${imageName}`;
}

function getSiteNameFromDamPath(fragmentPath) {
  const match = fragmentPath.match(/^\/content\/dam\/([^/]+)\//);
  return match ? match[1] : '/';
}

export function getButtonIcon() {
  return `<svg class="inline-block w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/>
  </svg>`;
}

export const isAuthorMode = window.location.href.includes('.html');

export function parseConfigBoolean(value) {
  return value === 'true' || value === true;
}

export function extractFieldFromBlock(block, fieldName) {
  const rows = block.querySelectorAll(':scope > div');

  for (const row of rows) {
    const firstDiv = row.querySelector('div:first-child');
    if (firstDiv && firstDiv.textContent.trim().toLowerCase() === fieldName.toLowerCase()) {
      const contentDiv = row.querySelector('div:nth-child(2)');
      if (contentDiv) {
        return contentDiv.innerHTML;
      }
    }
  }

  return '';
}

export function applyImageStyling(imageContainer, { cover = true, absolute = false } = {}) {
  if (!imageContainer) return;

  const picture = imageContainer.querySelector('picture');
  const img = picture?.querySelector('img');

  if (picture) {
    Object.assign(picture.style, {
      width: '100%',
      height: '100%',
      display: 'block',
      ...(absolute && {
        position: 'absolute',
        top: '0',
        left: '0',
        margin: '0',
        padding: '0',
      }),
    });
  }

  if (img) {
    Object.assign(img.style, {
      width: '100%',
      height: '100%',
      objectFit: cover ? 'cover' : 'contain',
      objectPosition: 'center',
      display: 'block',
      margin: '0',
      padding: '0',
      ...(absolute && { verticalAlign: 'top' }),
    });
  }
}

export function getLanguageFromPath() {
  const path = window.location.pathname;
  const parts = path.split('/').filter(part => part !== '');
  return parts.length >= 2 ? parts[1] : 'en';
}

export async function getTranslation(key, lang) {
  try {
    const response = await fetch('/i18n.json');
    const data = await response.json();

    const item = data.data.find((entry) => entry.key === key);
    if (item) {
      return item[lang] || item.en || key;
    }
    return key;
  } catch (error) {
    console.error('Error fetching translation:', error);
    return key;
  }
}

export const SERVICE_ICONS = {
  'ideas': `<svg class="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/>
  </svg>`,

  'technical-services': `<svg class="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"/>
  </svg>`,

  'security': `<svg class="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"/>
  </svg>`,

  'growth': `<svg class="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/>
  </svg>`,

  'performance': `<svg class="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"/>
  </svg>`,

  'support': `<svg class="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"/>
  </svg>`,
};

export async function fetchContentFragmentByPath(fragmentPath) {
  const siteName = getSiteNameFromDamPath(fragmentPath);
  try {
    const apiUrl = isAuthorMode
      ? `${AUTHOR_DOMAIN}/adobe/sites/cf/fragments?path=${fragmentPath}&references=direct`
      : `${PUBLISH_DOMAIN}/graphql/execute.json/${siteName}/offer-by-path;offerPath=${fragmentPath}`;

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    if (isAuthorMode) {
      const item = data.items?.[0];
      if (!item) return null;

      const fields = Object.fromEntries(
        item.fields?.map(f => [f.name, f.values?.[0] || '']) || []
      );
      const imageRef = item.references?.find(ref => ref.path === fields.image);
      const imageAssetId = imageRef?.assetId?.replace('urn:aaid:aem:', '') || null;

      return {
        title: fields.title || '',
        description: fields.description || '',
        buttonText: fields.buttonText || '',
        buttonLink: fields.buttonLink || '#',
        image: { _id: imageAssetId, _path: fields.image } || null,
        imageDescription: fields.imageDescription || '',
      };
    }

    const item = data?.data?.offerByPath?.item;
    if (!item) return null;

    return {
      title: item.title || '',
      description: item.description?.html || item.description || '',
      buttonText: item.buttonText || '',
      buttonLink: item.buttonLink || '#',
      image: item.image || null,
      imageDescription: item.imageDescription || '',
    };
  } catch (error) {
    console.error('Error fetching content fragment:', error);
    return null;
  }
}

export function createPlaceholderSVG(type = 'image', aspectRatio = '4:3') {
  const dimensionsMap = {
    '16:9': { width: 800, height: 450 },
    '5:3': { width: 800, height: 480 },
    '4:3': { width: 800, height: 600 },
  };
  const dimensions = dimensionsMap[aspectRatio] || dimensionsMap['4:3'];
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;

  const icons = {
    image: `<path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/>`,
    video: `<path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"/>`
  };

  const labels = {
    image: 'Add Image',
    video: 'Add Video URL'
  };

  const iconPath = icons[type] || icons.image;
  const label = labels[type] || labels.image;
  const textY = centerY + 50;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dimensions.width} ${dimensions.height}" class="w-full h-full">
      <rect width="${dimensions.width}" height="${dimensions.height}" fill="#e5e7eb"/>
      <g transform="translate(${centerX}, ${centerY})">
        <svg xmlns="http://www.w3.org/2000/svg" x="-40" y="-40" width="80" height="80" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#9ca3af">
          ${iconPath}
        </svg>
      </g>
      <text x="${centerX}" y="${textY}" text-anchor="middle" fill="#9ca3af" font-family="system-ui, -apple-system, sans-serif" font-size="16">${label}</text>
    </svg>
  `;
}

export function createDynamicMediaPicture(
  assetId,
  alt = '',
  eager = false,
  smartCrop,
) {
  const picture = document.createElement('picture');
  const baseUrl = `${DELIVERY_DOMAIN}/adobe/assets/urn:aaid:aem:${assetId}/as`;
  const smartCropParam = smartCrop ? `&smartcrop=${smartCrop}` : '';

  // large screens (>=600px)
  const sourceLarge = document.createElement('source');
  sourceLarge.setAttribute('media', '(min-width: 600px)');
  sourceLarge.setAttribute('srcset', `${baseUrl}/image.jpeg?${smartCropParam}`);
  picture.appendChild(sourceLarge);

  // small screens (<600px)
  const sourceSmall = document.createElement('source');
  sourceSmall.setAttribute('srcset', `${baseUrl}/image.jpeg?width=500${smartCropParam}`);
  picture.appendChild(sourceSmall);

  // fallback img
  const img = document.createElement('img');
  img.setAttribute('loading', eager ? 'eager' : 'lazy');
  img.setAttribute('alt', alt);
  img.setAttribute('src', `${baseUrl}/image.jpeg?width=500${smartCropParam}`);
  picture.appendChild(img);

  return picture;
}

export function setAueAttributes(elements, fragmentPath) {
  if (!fragmentPath) return;

  if (elements.section) {
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