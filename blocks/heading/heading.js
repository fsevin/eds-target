function getOGMetaContent(property) {
  const meta = document.querySelector(`meta[property="${property}"]`);
  return meta ? meta.getAttribute('content') : '';
}

export default async function decorate(block) {
  const ogTitle = getOGMetaContent('og:title');
  const ogDescription = getOGMetaContent('og:description');


  const headingHTML = `
    <section class="w-full py-12 md:py-16 px-4 bg-white">
      <div class="container mx-auto max-w-7xl flex items-center min-h-[120px]">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold text-black mb-4 text-left !p-0">
            ${ogTitle}
          </h1>
          <p class="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed">
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
