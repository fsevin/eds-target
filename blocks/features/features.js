/**
 * Services block
 * @param {Element} block The services block element
 */
export default async function decorate(block) {
  const services = [
    {
      icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>`,
      title: 'Lorem Ipsum Dolor',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.'
    },
    {
      icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>`,
      title: 'Consectetur Adipiscing',
      description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.'
    },
    {
      icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>`,
      title: 'Sed Do Eiusmod',
      description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla.'
    }
  ];

  const servicesHTML = services.map(service => `
    <div class="service-item">
      <div class="service-icon">${service.icon}</div>
      <h3 class="service-title">${service.title}</h3>
      <p class="service-description">${service.description}</p>
    </div>
  `).join('');

  const content = document.createRange().createContextualFragment(`
    <div class="services-container">
      ${servicesHTML}
    </div>
  `);

  block.textContent = '';
  block.append(content);
}
