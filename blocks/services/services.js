import { readBlockConfig } from '../../scripts/aem.js';
/**
 * Icon mapping configuration - Using Heroicons
 * @see https://heroicons.com/
 */
const ICON_MAP = {
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

function extractServices(block) {
  const rows = [...block.children];
  const services = [];

  // Iterate through all rows and extract service items
  rows.forEach(row => {
    // Check if this is a service item row
    if (row.getAttribute('class') === 'services') {
      const cells = [...row.children];

      // Service items have 3 cells: icon value, text, description
      if (cells.length >= 3) {
        const iconValue = cells[0]?.textContent?.trim().toLowerCase() || '';
        const text = cells[1]?.textContent?.trim() || '';
        const description = cells[2]?.textContent?.trim() || '';

        // Only add service if text and description are present
        if (text && description) {
          // Get icon from config if available
          const icon = (iconValue && ICON_MAP[iconValue]) ? ICON_MAP[iconValue] : '';

          // Extract all data-aue-* attributes dynamically from row element
          const attributes = {};
          Array.from(row.attributes).forEach(attr => {
            if (attr.name.startsWith('data-aue-')) {
              attributes[attr.name] = attr.value;
            }
          });

          services.push({
            icon,
            text,
            description,
            attributes,
          });
        }
      }
    }
  });

  return services;
}

export default async function decorate(block) {
  console.log(block);
  const config = readBlockConfig(block);

  const title = config.title || '';
  const description = config.description || '';
  const styleValue = config.style ? config.style.toLowerCase() : '';

  // Determine background class based on style
  const sectionClasses = styleValue.includes('highlight') ? 'bg-gray-50' : 'bg-white';

  // Extract services
  const services = extractServices(block);

  // Build service cards HTML
  const servicesHTML = services.map(service => {
    // Convert attributes object to HTML attribute string
    const attributesStr = Object.entries(service.attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    return `
    <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300" ${attributesStr}>
      <div class="text-brand-600 mb-4">
        ${service.icon || ''}
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-3" data-aue-prop="text" data-aue-type="text" data-aue-label="Text">
        ${service.text}
      </h3>
      <p class="text-gray-600 leading-relaxed" data-aue-prop="description" data-aue-type="text" data-aue-label="Description">
        ${service.description}
      </p>
    </div>
  `;
  }).join('');

  // Build complete HTML structure
  const htmlStructure = `
    <section class="py-20 ${sectionClasses}">
      <div class="container mx-auto px-4">
        <!-- Section Header -->
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4" data-aue-prop="title" data-aue-type="text" data-aue-label="Title">
            ${title}
          </h2>
          <div class="text-xl text-gray-600 max-w-3xl mx-auto" data-aue-prop="description" data-aue-type="richtext" data-aue-label="Description">
            ${description}
          </div>
        </div>

        <!-- Services Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          ${servicesHTML}
        </div>
      </div>
    </section>
  `;

  // Replace block content with new structure
  block.innerHTML = htmlStructure;
}
