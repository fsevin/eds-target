function getSiteName() {
  const path = window.location.pathname;
  const match = path.match(/^\/content\/([^/]+)\//);
  return match ? match[1] : '/';
}

export function getSiteNameFromDAM(damPath) {
  const match = damPath.match(/^\/content\/dam\/([^/]+)/);
  return match[1];
}

export function getCurrentLocale() {
  const path = window.location.pathname;
  const parts = path.split('/').filter(part => part !== '');

  const countryIndex = isAuthorMode ? 2 : 0;
  const langIndex = isAuthorMode ? 3 : 1;

  return `${parts[countryIndex]}/${parts[langIndex]}`;
}

export function getPagePath(path){
  return isAuthorMode ? `/content/${getSiteName()}${path}.html` : path;
};

export function getIconPath(imageName) {
  return `${isAuthorMode ? `/content/${getSiteName()}.resource/icons/` : '/icons/'}${imageName}`;
}

export function getDeliveryUrl(url, smartCrop) {
  const processedUrl = url
    .replace(/original\//g, '')
    .replace(/jpeg|jpg|png/g, 'webp');
  
  return `${processedUrl}?format=webply&optimize=high&smartcrop=${smartCrop}&timestamp=${Date.now()}`;
}

export const isAuthorMode = window.location.href.includes('.html');

export function getLanguageFromUrl() {
  const path = window.location.pathname;
  const parts = path.split('/').filter(part => part !== '');
  return parts.length >= 2 ? parts[1] : 'en';
}

export async function getTranslation(key, lang) {
  try {
    const response = await fetch('/i18n.json');
    const data = await response.json();

    const item = data.data.find(entry => entry.key === key);
    if (item) {
      return item[lang] || item.en || key;
    }
    return key;
  } catch (error) {
    console.error('Error fetching translation:', error);
    return key;
  }
}

export function extractFieldFromBlock(block, fieldName) {
  const rows = block.querySelectorAll(':scope > div');

  for (const row of rows) {
    const firstDiv = row.querySelector('div:first-child');
    if (firstDiv && firstDiv.textContent.trim().toLowerCase() === fieldName.toLowerCase()) {
      const contentDiv = row.querySelector('div:nth-child(2)');
      if (contentDiv) {
        // Clone the content to avoid modifying the original
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = contentDiv.innerHTML;

        // Apply Tailwind styles to standard HTML tags
        tempDiv.querySelectorAll('h1').forEach(el => {
          el.className = 'text-4xl md:text-5xl font-bold mb-4';
        });
        tempDiv.querySelectorAll('h2').forEach(el => {
          el.className = 'text-3xl md:text-4xl font-bold mb-4';
        });
        tempDiv.querySelectorAll('h3').forEach(el => {
          el.className = 'text-2xl md:text-3xl font-bold mb-3';
        });
        tempDiv.querySelectorAll('h4').forEach(el => {
          el.className = 'text-xl md:text-2xl font-bold mb-3';
        });
        tempDiv.querySelectorAll('h5').forEach(el => {
          el.className = 'text-lg md:text-xl font-bold mb-2';
        });
        tempDiv.querySelectorAll('h6').forEach(el => {
          el.className = 'text-base md:text-lg font-bold mb-2';
        });
        tempDiv.querySelectorAll('p').forEach(el => {
          el.className = 'mb-4 leading-relaxed';
        });
        tempDiv.querySelectorAll('strong, b').forEach(el => {
          el.className = 'font-bold';
        });

        return tempDiv.innerHTML;
      }
    }
  }

  return '';
}
