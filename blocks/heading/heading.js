function getOGMetaContent(property) {
  const meta = document.querySelector(`meta[property="${property}"]`);
  return meta ? meta.getAttribute('content') : '';
}

export default async function decorate(block) {
  const ogTitle = getOGMetaContent('og:title');
  const ogDescription = getOGMetaContent('og:description');
  let ogImage = getOGMetaContent('og:image');

  if (ogImage.includes('https://localhost')) {
    ogImage = ogImage.replace('https://localhost', 'http://localhost');
  }

  const headingHTML = `
    <section class="relative w-full py-12 md:py-16 px-4 bg-cover bg-center bg-no-repeat">
      <div class="absolute inset-0 z-0">
        <img src="${ogImage}" alt="" class="w-full h-full object-cover" />
      </div>
      <div class="absolute inset-0 bg-black/50 z-10"></div>
      <div class="container mx-auto max-w-7xl flex items-center min-h-[120px] relative z-20">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold text-white mb-4 text-left !p-0">
            ${ogTitle}
          </h1>
          <p class="text-lg md:text-xl text-gray-200 max-w-2xl leading-relaxed">
            ${ogDescription}
          </p>
        </div>
      </div>
    </section>
  `;

  const content = document.createRange().createContextualFragment(headingHTML);
  block.textContent = '';
  block.append(content);
}
