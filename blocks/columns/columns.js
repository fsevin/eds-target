
export default function decorate(block) {
  block.classList.add('py-20', 'bg-white');

  const container = document.createElement('div');
  container.classList.add('container', 'mx-auto', 'px-4');

  const row = block.querySelector(':scope > div');
  if (row) {
    row.classList.add('flex', 'flex-col', 'md:flex-row', 'gap-6');

    const columns = row.querySelectorAll(':scope > div');
    columns.forEach((col) => {
      const hasPicture = col.querySelector('picture');

      if (hasPicture) {
        col.classList.add('flex-1');
      } else {
        col.classList.add('flex-1', 'flex', 'flex-col', 'gap-4');
      }

      const pictures = col.querySelectorAll('picture');
      pictures.forEach((picture) => {
        const parent = picture.parentElement;
        parent.classList.add('relative', 'rounded-2xl', 'overflow-hidden', 'shadow-2xl', 'h-full');

        picture.classList.add('h-full', 'w-full', 'block');
      });

      const buttons = col.querySelectorAll('a.button');
      buttons.forEach((button) => {
        button.classList.add('inline-flex', 'items-center', 'px-8', 'py-4', 'bg-brand-600', 'text-white', 'font-semibold', 'rounded-2xl', 'hover:bg-brand-700', 'transition', 'shadow-lg', 'hover:shadow-xl');
      });

      const h2 = col.querySelectorAll('h2');
      h2.forEach((heading) => {
        heading.classList.add('text-4xl', 'md:text-5xl', 'font-bold', 'text-gray-900', 'leading-tight');
      });

      const h3 = col.querySelectorAll('h3');
      h3.forEach((heading) => {
        heading.classList.add('text-3xl', 'md:text-4xl', 'font-bold', 'text-gray-900', 'leading-tight');
      });

      const h4 = col.querySelectorAll('h4');
      h4.forEach((heading) => {
        heading.classList.add('text-2xl', 'md:text-3xl', 'font-bold', 'text-gray-900', 'leading-tight');
      });

      const h5 = col.querySelectorAll('h5');
      h5.forEach((heading) => {
        heading.classList.add('text-xl', 'md:text-2xl', 'font-bold', 'text-gray-900', 'leading-tight');
      });

      const h6 = col.querySelectorAll('h6');
      h6.forEach((heading) => {
        heading.classList.add('text-lg', 'md:text-xl', 'font-bold', 'text-gray-900', 'leading-tight');
      });

      const paragraphs = col.querySelectorAll('p');
      paragraphs.forEach((p) => {
        p.classList.add('text-lg', 'text-gray-600', 'leading-relaxed');
      });

      const aueImages = col.querySelectorAll('[data-aue-model="image"]');
      aueImages.forEach((element) => {
        element.setAttribute('data-aue-type', 'media');
        element.setAttribute('data-aue-prop', 'fileReference');
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
