import { readBlockConfig } from '../../scripts/aem.js';
import { extractFieldFromBlock } from '../../scripts/utils.js';

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const descriptionHTML = extractFieldFromBlock(block, 'description');

  const services = [
    {
      icon: `<svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>`,
      title: 'Lorem Ipsum Dolor',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    },
    {
      icon: `<svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>`,
      title: 'Consectetur Adipiscing',
      description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
    },
    {
      icon: `<svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>`,
      title: 'Sed Do Eiusmod',
      description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
    },
    {
      icon: `<svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
      </svg>`,
      title: 'Tempor Incididunt',
      description: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    },
    {
      icon: `<svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>`,
      title: 'Magna Aliqua',
      description: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem.'
    },
    {
      icon: `<svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>`,
      title: 'Quis Nostrud',
      description: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.'
    }
  ];

  const servicesHTML = services.map(service => `
    <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div class="text-brand-600 mb-4">
        ${service.icon}
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-3">${service.title}</h3>
      <p class="text-gray-600 leading-relaxed">${service.description}</p>
    </div>
  `).join('');

  const content = document.createRange().createContextualFragment(`
    <section class="py-20 bg-gray-50">
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
  `);

  block.textContent = '';
  block.append(content);
}
