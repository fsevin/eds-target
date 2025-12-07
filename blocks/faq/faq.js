import { isAuthorMode } from '../../scripts/utils.js';

function extractFAQs(block) {
  const rows = [...block.children];
  const faqs = [];

  // Skip first three rows (title, description, style), process from fourth row onwards
  for (let i = 3; i < rows.length; i += 1) {
    const row = rows[i];
    const cells = [...row.children];

    const question = cells[0]?.textContent?.trim() || 'FAQ Question';
    const answer = cells[1]?.innerHTML?.trim() || 'FAQ Answer';

    // Extract all data-aue-* attributes dynamically from row element
    const attributes = {};
    Array.from(row.attributes).forEach(attr => {
      if (attr.name.startsWith('data-aue-')) {
        attributes[attr.name] = attr.value;
      }
    });

    faqs.push({
      question,
      answer,
      attributes,
    });
  }

  return faqs;
}

export default async function decorate(block) {
  const rows = [...block.children];

  // Extract data from block with placeholders
  const title = rows[0]?.querySelector('div')?.textContent?.trim() || 'Frequently Asked Questions';
  const description = rows[1]?.querySelector('div')?.innerHTML || '<p>Find answers to common questions about our services.</p>';
  const styleValue = rows[2]?.querySelector('div')?.textContent?.trim().toLowerCase() || '';

  // Determine background class based on style
  const sectionClasses = styleValue.includes('highlight') ? 'bg-gray-50' : 'bg-white';

  // Extract FAQs
  const faqs = extractFAQs(block);

  // Build FAQ items HTML
  const faqsHTML = faqs.map((faq, index) => {
    // Convert attributes object to HTML attribute string
    const attributesStr = Object.entries(faq.attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    const expandedByDefault = isAuthorMode;
    const hiddenClass = expandedByDefault ? '' : 'hidden';
    const rotateClass = expandedByDefault ? 'rotate-180' : '';

    return `
    <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 mb-6 last:mb-0" ${attributesStr}>
      <button type="button" class="faq-toggle w-full flex items-center justify-between p-8 text-left" aria-expanded="${expandedByDefault}" aria-controls="faq-answer-${index}">
        <h3 class="text-lg font-semibold text-gray-900" data-aue-prop="question" data-aue-type="text" data-aue-label="Question">
          ${faq.question}
        </h3>
        <svg class="faq-icon w-6 h-6 text-gray-500 transition-transform duration-300 flex-shrink-0 ml-4 ${rotateClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      <div id="faq-answer-${index}" class="faq-answer ${hiddenClass} px-8 pb-8">
        <p class="text-gray-600 leading-relaxed" data-aue-prop="answer" data-aue-type="richtext" data-aue-label="Answer">
          ${faq.answer}
        </p>
      </div>
    </div>
  `;
  }).join('');

  const content = document.createRange().createContextualFragment(`
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

        <!-- FAQ List -->
        <div class="max-w-3xl mx-auto">
          ${faqsHTML}
        </div>
      </div>
    </section>
  `);

  // Replace block content with new structure
  block.textContent = '';
  block.append(content);

  // Add click handlers for collapsible FAQ items
  block.querySelectorAll('.faq-toggle').forEach((toggle) => {
  
  });
}
