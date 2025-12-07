import { createPlaceholderSVG } from '../../scripts/utils.js';

export default function decorate(block) {
  // Get the first child (row container)
  const row = block.querySelector(':scope > div');
  if (!row) return;

  // Get all columns (direct children divs of the row)
  const columns = row.querySelectorAll(':scope > div');

  // Wrap content in section with container for consistent padding
  const wrapper = document.createElement('section');
  wrapper.className = 'py-20 bg-white';

  const container = document.createElement('div');
  container.className = 'container mx-auto px-4';

  // Apply Tailwind classes to the row container for flex layout
  row.classList.add(
    'flex',
    'flex-col',
    'md:flex-row',
    'items-start',
    'gap-6',
    'md:gap-8',
  );

  // Apply Tailwind classes to each column
  columns.forEach((column, columnIndex) => {
    column.classList.add(
      'flex-1',
      'min-w-0',
    );

    // Style headings within columns
    column.querySelectorAll('h2').forEach((h) => {
      h.classList.add('text-3xl', 'md:text-4xl', 'font-bold', 'text-gray-900', 'mb-4', 'mt-0');
    });
    column.querySelectorAll('h3').forEach((h) => {
      h.classList.add('text-2xl', 'md:text-3xl', 'font-bold', 'text-gray-900', 'mb-3', 'mt-0');
    });
    column.querySelectorAll('h4').forEach((h) => {
      h.classList.add('text-xl', 'md:text-2xl', 'font-semibold', 'text-gray-900', 'mb-3', 'mt-0');
    });
    column.querySelectorAll('h5').forEach((h) => {
      h.classList.add('text-lg', 'md:text-xl', 'font-semibold', 'text-gray-900', 'mb-2', 'mt-0');
    });
    column.querySelectorAll('h6').forEach((h) => {
      h.classList.add('text-base', 'md:text-lg', 'font-semibold', 'text-gray-900', 'mb-2', 'mt-0');
    });

    column.querySelectorAll('p').forEach((p) => {
      p.classList.add('text-base', 'text-gray-600', 'leading-relaxed', 'mb-4', 'mt-0');
      // Add placeholder text if paragraph is empty or has image with empty src
      const img = p.querySelector('img');
      const hasValidImage = img && img.src && img.src.trim() !== '' && !img.src.includes('about:error');
      
      if (!p.textContent.trim() && !hasValidImage) {
        if (img) {
          // Replace invalid image with placeholder SVG
          p.innerHTML = createPlaceholderSVG('image', '4:3');
          p.removeAttribute('data-aue-behavior');
          p.setAttribute('data-aue-type', 'media');
          p.setAttribute('data-aue-prop', 'image');
        } else {
          // Add column index if p is a container type
          const placeholderText = p.getAttribute('data-aue-type') === 'container'
            ? `Column ${columnIndex + 1}`
            : 'Add your content here.';
          p.textContent = placeholderText;
          p.classList.add('italic', 'text-gray-400');
        }
      }
    });

    // Style images within columns
    const images = column.querySelectorAll('img');
    images.forEach((img) => {
      img.classList.add('w-full', 'h-auto', 'rounded-lg');
    });
  });

  // Build the structure
  container.appendChild(row);
  wrapper.appendChild(container);
  block.textContent = '';
  block.appendChild(wrapper);
}
