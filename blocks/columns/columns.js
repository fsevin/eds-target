import { createPlaceholderSVG } from '../../scripts/utils.js';

// Heading styles configuration
const HEADING_STYLES = {
  h2: ['text-3xl', 'md:text-4xl', 'font-bold', 'text-gray-900', 'mb-4', 'mt-0'],
  h3: ['text-2xl', 'md:text-3xl', 'font-bold', 'text-gray-900', 'mb-3', 'mt-0'],
  h4: ['text-xl', 'md:text-2xl', 'font-semibold', 'text-gray-900', 'mb-3', 'mt-0'],
  h5: ['text-lg', 'md:text-xl', 'font-semibold', 'text-gray-900', 'mb-2', 'mt-0'],
  h6: ['text-base', 'md:text-lg', 'font-semibold', 'text-gray-900', 'mb-2', 'mt-0'],
};

function styleHeadings(column) {
  Object.entries(HEADING_STYLES).forEach(([tag, classes]) => {
    column.querySelectorAll(tag).forEach((h) => h.classList.add(...classes));
  });
}

function handleParagraph(p, columnIndex) {
  const link = p.querySelector('a');
  if (link) {
    link.classList.add(
      'inline-flex', 'items-center', 'px-6', 'py-2',
      'bg-brand-600', 'text-white', 'font-semibold', 'rounded-xl',
      'hover:bg-brand-700', 'transition', 'shadow-lg', 'hover:shadow-xl'
    );
    link.classList.remove('button');

    link.setAttribute('data-aue-prop', 'text');
    link.setAttribute('data-aue-type', 'text');
    link.setAttribute('data-aue-label', 'Text');
  }

  p.classList.add('text-lg', 'text-gray-600', 'leading-relaxed', 'mb-4', 'mt-0');

  const img = p.querySelector('img');
  const hasValidImage = img?.src?.trim() && !img.src.includes('about:error');

  if (img) {
    p.removeAttribute('data-aue-behavior');
    p.setAttribute('data-aue-prop', 'fileReference');
    p.setAttribute('data-aue-type', 'media');
  }

  if (!p.textContent.trim() && !hasValidImage) {
    if (img) {
      p.innerHTML = createPlaceholderSVG('image', '4:3');
    } else {
      const placeholderText = p.getAttribute('data-aue-type') === 'container'
        ? `Column ${columnIndex + 1}`
        : 'Add your content here.';
      p.textContent = placeholderText;
      p.classList.add('italic', 'text-gray-400');
    }
  }
}

export default function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;

  const columns = row.querySelectorAll(':scope > div');

  // Setup row layout
  row.classList.add('flex', 'flex-col', 'md:flex-row', 'items-start', 'gap-6', 'md:gap-8');

  // Process each column
  columns.forEach((column, columnIndex) => {
    column.classList.add('flex-1', 'min-w-0');

    // Style elements
    styleHeadings(column);
    column.querySelectorAll('p').forEach((p) => handleParagraph(p, columnIndex));
    column.querySelectorAll('img').forEach((img) => {
      img.classList.add('w-full', 'h-auto', 'rounded-lg');
    });
  });

  // Build structure
  const wrapper = document.createElement('section');
  wrapper.className = 'py-20 bg-white';

  const container = document.createElement('div');
  container.className = 'container mx-auto px-4';

  container.appendChild(row);
  wrapper.appendChild(container);
  block.replaceChildren(wrapper);
}
