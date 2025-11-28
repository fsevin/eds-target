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

function extractServices(block) {
  const rows = [...block.children];
  const services = [];

  // Skip first two rows (title and description), process from third row onwards
  for (let i = 2; i < rows.length; i += 1) {
    const row = rows[i];
    const cells = [...row.children];

    if (cells.length >= 2) {
      const iconValue = cells[0]?.textContent?.trim().toLowerCase() || '';
      const text = cells[1]?.textContent?.trim() || '';
      const description = cells[2]?.textContent?.trim() || '';

      services.push({
        icon: ICON_MAP[iconValue],
        text: text,
        description,
      }); 
    }
  }

  return services;
}

export default async function decorate(block) {
  /*const config = readBlockConfig(block);
  const descriptionHTML = extractFieldFromBlock(block, 'description');
  const style = config.style || '';
  const sectionClasses = style.includes('highlight') ? 'py-20 bg-gray-50' : 'py-20 bg-white';

  // Extract services from block
  const services = extractServices(block);

  const servicesHTML = services.map(service => `
    <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300" data-aue-type="component" data-aue-model="service-item" data-aue-label="Service Item">
      <div class="text-brand-600 mb-4">
        ${service.icon}
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-3" data-aue-label="Text" data-aue-prop="text" data-aue-type="text">${service.text}</h3>
      <p class="text-gray-600 leading-relaxed" data-aue-label="Description" data-aue-prop="description" data-aue-type="text">${service.description}</p>
    </div>
  `).join('');

  const content = document.createRange().createContextualFragment(`
    <section class="${sectionClasses}">
      <div class="container mx-auto px-4">
        <!-- Section Header -->
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4" data-aue-label="Title" data-aue-prop="title" data-aue-type="text">${config.title}</h2>
          <div class="text-xl text-gray-600 max-w-3xl mx-auto" data-aue-label="Description" data-aue-prop="description" data-aue-type="richtext">${descriptionHTML}</div>
        </div>

        <!-- Services Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          ${servicesHTML}
        </div>
      </div>
    </section>
  `);*/


  var element = document.createElement('div');
  element.innerHTML = `
        <div>
         <div>
            <p>title</p>
         </div>
         <div>
            <p>t</p>
         </div>
      </div>
      <div>
         <div>
            <p>description</p>
         </div>
         <div>
            <p>d</p>
         </div>
      </div>
      <div data-aue-resource="urn:aemconnection:/content/3ds/us/en/pages/support/jcr:content/root/section/block_450104975/item" data-aue-type="component" data-aue-model="service-item" data-aue-label="Service Item">
         <div>
            <p>ideas</p>
         </div>
         <div>
            <p>t1</p>
         </div>
         <div>
            <p>d1</p>
         </div>
      </div>
   </div>
    `;


  
  block.textContent = '';
  block.append(titleElement);
}
