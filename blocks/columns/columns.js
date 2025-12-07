
export default function decorate(block) {
  block.classList.add('py-20', 'bg-white');

  const container = document.createElement('div');
  container.classList.add('container', 'mx-auto', 'px-4');

  const row = block.querySelector(':scope > div');
  if (row) {
    row.classList.add('flex', 'flex-col', 'md:flex-row', 'gap-6');

    const columns = row.querySelectorAll(':scope > div');
    columns.forEach((col) => {
      // Check if this column contains a picture
      const hasPicture = col.querySelector('picture');

      if (hasPicture) {
        // Image column - no gap, stretch to fill
        col.classList.add('flex-1');
      } else {
        // Text column - with gap for spacing
        col.classList.add('flex-1', 'flex', 'flex-col', 'gap-4');
      }

      // Style picture containers like teaser
      const pictures = col.querySelectorAll('picture');
      pictures.forEach((picture) => {
        const parent = picture.parentElement;
        parent.classList.add('relative', 'rounded-2xl', 'overflow-hidden', 'shadow-2xl', 'h-full');

        // Make picture element fill the container
        picture.classList.add('h-full', 'w-full', 'block');
      });

      // Style buttons like teaser
      const buttons = col.querySelectorAll('a.button');
      buttons.forEach((button) => {
        button.classList.add('inline-flex', 'items-center', 'px-8', 'py-4', 'bg-brand-600', 'text-white', 'font-semibold', 'rounded-2xl', 'hover:bg-brand-700', 'transition', 'shadow-lg', 'hover:shadow-xl');
      });
    });

    const images = block.querySelectorAll('img');
    images.forEach((img) => {
      img.classList.add('w-full', 'h-full', 'object-cover');
    });

    container.appendChild(row);
    block.innerHTML = '';
    block.appendChild(container);
  }
}
