function extractFAQs(block) {
  const rows = [...block.children];
  const faqs = [];

  // Skip first three rows (title, description, style), process from fourth row onwards
  for (let i = 3; i < rows.length; i += 1) {
    const row = rows[i];
    const cells = [...row.children];

    const question = cells[0]?.textContent?.trim() || 'FAQ Question';
    const answer = cells[1]?.textContent?.trim() || 'FAQ Answer';

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

  // Build FAQ items HTML (all expanded by default)
  const faqsHTML = faqs.map((faq, index) => {
    // Convert attributes object to HTML attribute string
    const attributesStr = Object.entries(faq.attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    return `
    <div class="border-b border-gray-200 last:border-b-0" ${attributesStr}>
      <button class="w-full flex items-center justify-between py-6 text-left group" data-faq-toggle="${index}">
        <h3 class="text-lg font-semibold text-gray-900 pr-8 group-hover:text-brand-600 transition-colors" data-aue-prop="question" data-aue-type="text" data-aue-label="Question">
          ${faq.question}
        </h3>
        <svg class="w-6 h-6 text-brand-600 transform transition-transform duration-200 flex-shrink-0" data-faq-icon="${index}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      <div class="pb-6 overflow-hidden transition-all duration-200" data-faq-content="${index}">
        <p class="text-gray-600 leading-relaxed" data-aue-prop="answer" data-aue-type="text" data-aue-label="Answer">
          ${faq.answer}
        </p>
      </div>
    </div>
  `;
  }).join('');

  // Build complete HTML structure
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
        <div class="max-w-3xl mx-auto bg-white rounded-xl shadow-lg">
          <div class="px-8">
            ${faqsHTML}
          </div>
        </div>
      </div>
    </section>
  `);

  // Replace block content with new structure
  block.textContent = '';
  block.append(content);

  // Add click handlers for all FAQ toggles
  faqs.forEach((faq, index) => {
    const toggle = block.querySelector(`[data-faq-toggle="${index}"]`);
    const content = block.querySelector(`[data-faq-content="${index}"]`);
    const icon = block.querySelector(`[data-faq-icon="${index}"]`);

    if (toggle && content && icon) {
      toggle.addEventListener('click', () => {
        const isExpanded = content.style.maxHeight && content.style.maxHeight !== '0px';

        if (isExpanded) {
          // Collapse
          content.style.maxHeight = '0';
          content.style.paddingBottom = '0';
          icon.style.transform = 'rotate(-90deg)';
        } else {
          // Expand
          content.style.maxHeight = content.scrollHeight + 'px';
          content.style.paddingBottom = '1.5rem';
          icon.style.transform = 'rotate(0deg)';
        }
      });

      // Set initial state to expanded
      content.style.maxHeight = content.scrollHeight + 'px';
      icon.style.transform = 'rotate(0deg)';
    }
  });
}
