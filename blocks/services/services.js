import { readBlockConfig } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { extractFieldFromBlock } from '../../scripts/utils.js';

/**
 * Icon mapping configuration
 */
const ICON_MAP = {
  'ideas': `<svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 18h6"/>
    <path d="M10 22h4"/>
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
  </svg>`,

  'technical-services': `<svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
  </svg>`,

  'security': `<svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>`,

  'growth': `<svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
  </svg>`,

  'performance': `<svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="20" x2="12" y2="10"/>
    <line x1="18" y1="20" x2="18" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="16"/>
  </svg>`,

  'support': `<svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>`,
};

/**
 * Service icons array for fallback cycling
 */
const SERVICE_ICONS = Object.values(ICON_MAP);

function extractServices(block) {
  const rows = [...block.children];
  const services = [];

  // Skip first three rows (title, description, style), process from fourth row onwards
  for (let i = 3; i < rows.length; i += 1) {
    const row = rows[i];
    const cells = [...row.children];

    if (cells.length >= 2) {
      const iconValue = cells[0]?.textContent?.trim().toLowerCase() || '';
      const text = cells[1]?.textContent?.trim() || '';
      const description = cells[2]?.textContent?.trim() || '';

      if (text && description) {
        // Try to get icon from config, otherwise use cyclic fallback
        let icon;
        if (iconValue && ICON_MAP[iconValue]) {
          icon = ICON_MAP[iconValue];
        } else {
          const iconIndex = (i - 3) % SERVICE_ICONS.length;
          icon = SERVICE_ICONS[iconIndex];
        }

        services.push({
          icon,
          text,
          description,
        });
      }
    }
  }

  return services;
}

export default async function decorate(block) {
  const rows = [...block.children];

  // First row contains title
  if (rows[0]) {
    const titleElement = rows[0].querySelector('p');
    if (titleElement) {
      titleElement.classList.add('text-4xl', 'md:text-5xl', 'font-bold', 'text-gray-900', 'mb-4', 'text-center');
    }
  }

  // Second row contains description
  if (rows[1]) {
    const descriptionElement = rows[1].querySelector('div');
    if (descriptionElement) {
      descriptionElement.classList.add('text-xl', 'text-gray-600', 'max-w-3xl', 'mx-auto', 'text-center', 'mb-16');
    }
  }

  // Third row contains optional style
  let styleValue = '';
  if (rows[2]) {
    const styleElement = rows[2].querySelector('p');
    if (styleElement) {
      styleValue = styleElement.textContent?.trim().toLowerCase() || '';
    }
    rows[2].style.display = 'none';
  }

  // Determine background class based on style
  const bgClass = styleValue.includes('highlight') ? 'bg-gray-50' : 'bg-white';

  // Extract and style service items (from row 3 onwards)
  const services = extractServices(block);

  // Hide original service item rows
  for (let i = 3; i < rows.length; i += 1) {
    rows[i].style.display = 'none';
  }

  // Create services grid container
  const servicesGrid = document.createElement('div');
  servicesGrid.className = 'grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8';

  // Build service cards
  services.forEach(service => {
    const serviceCard = document.createElement('div');
    serviceCard.className = 'bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300';

    // Icon container
    const iconContainer = document.createElement('div');
    iconContainer.className = 'text-brand-600 mb-4';
    if (service.icon) {
      iconContainer.innerHTML = service.icon;
    }

    // Service title
    const serviceTitle = document.createElement('h3');
    serviceTitle.className = 'text-xl font-bold text-gray-900 mb-3';
    serviceTitle.textContent = service.text;

    // Service description
    const serviceDesc = document.createElement('p');
    serviceDesc.className = 'text-gray-600 leading-relaxed';
    serviceDesc.textContent = service.description;

    // Append elements to card
    serviceCard.appendChild(iconContainer);
    serviceCard.appendChild(serviceTitle);
    serviceCard.appendChild(serviceDesc);

    // Append card to grid
    servicesGrid.appendChild(serviceCard);
  });

  // Append services grid to block
  block.appendChild(servicesGrid);

  // Add container styling to block with dynamic background
  block.classList.add('py-20', bgClass, 'container', 'mx-auto', 'px-4');
}
