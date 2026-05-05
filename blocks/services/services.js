import { SERVICE_ICONS } from '../../scripts/utils.js';

function extractServices(block) {
  const rows = [...block.children];
  const services = [];

  // Skip first three rows (title, description, style), process from fourth row onwards
  for (let i = 3; i < rows.length; i += 1) {
    const row = rows[i];
    const cells = [...row.children];

    const iconValue = cells[0]?.textContent?.trim().toLowerCase() || '';
    const text = cells[1]?.textContent?.trim() || 'Service Title';
    const description = cells[2]?.textContent?.trim() || 'Add your service description here.';

    // Get icon from config if available, otherwise use default 'ideas' icon
    const icon = (iconValue && SERVICE_ICONS[iconValue])
      ? SERVICE_ICONS[iconValue]
      : SERVICE_ICONS.ideas;

    // Extract all data-aue-* attributes dynamically from row element
    const attributes = {};
    Array.from(row.attributes).forEach((attr) => {
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

  return services;
}

export default async function decorate(block) {
  const rows = [...block.children];

  // Extract data from block with placeholders
  const title = rows[0]?.querySelector('p')?.textContent?.trim() || 'Our Services';
  const description = rows[1]?.querySelector('p')?.innerHTML || '<p>Discover our comprehensive range of services designed to meet your needs.</p>';
  const styleValue = rows[2]?.querySelector('p')?.textContent?.trim().toLowerCase() || '';

  // Determine background class based on style
  const sectionClasses = styleValue.includes('highlight') ? 'bg-gray-50' : 'bg-white';

  // Extract services
  const services = extractServices(block);

  // Build service cards HTML
  const servicesHTML = services.map((service) => {
    // Convert attributes object to HTML attribute string
    const attributesStr = Object.entries(service.attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    return `
    <div class="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300" ${attributesStr}>
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
