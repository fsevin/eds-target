import { readBlockConfig } from '../../scripts/aem.js';

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const dropboxMedia = config.dropboxmedia || '';
  const inverted = config.inverted === 'true' || config.inverted === true;
  const style = config.style || '';
  const sectionClasses = style.includes('highlight') ? 'py-20 bg-gray-50' : 'py-20 bg-white';

  const imageSection = `
    <!-- Image Section (60% width) -->
    <div class="relative rounded-2xl overflow-hidden shadow-2xl lg:col-span-3 h-[500px]" data-aue-label="Image" data-aue-prop="dropboxmedia" data-aue-type="text">
      ${dropboxMedia ? `
        <img
          src="${dropboxMedia}"
          alt="Dropbox Media Image"
          class="w-full h-full object-cover object-center"
        />` : `
        <div class="flex items-center justify-center h-full bg-gray-200 text-gray-500">No image provided</div>`}
    </div>
  `;

  const contentSection = `
    <!-- Content Section (40% width) -->
    <div class="lg:col-span-2">
      <div data-aue-label="Description" data-aue-prop="description" data-aue-type="richtext" class="text-lg text-gray-600 leading-relaxed space-y-8">
        <div>
          <h3 class="text-2xl font-bold text-black mb-3">Lorem Ipsum Dolor</h3>
          <p class="text-gray-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris.</p>
        </div>

        <div>
          <h3 class="text-2xl font-bold text-black mb-3">Consectetur Adipiscing</h3>
          <p class="text-gray-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.</p>
        </div>

        <div>
          <h3 class="text-2xl font-bold text-black mb-3">Tempor Incididunt</h3>
          <p class="text-gray-400">Lorem ipsum dolor sit amet, sed do eiusmod tempor incididunt consectetur adipiscing elit setim. Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia.</p>
        </div>
      </div>
    </div>
  `;

  const content = document.createRange().createContextualFragment(`
    <section class="${sectionClasses}">
      <div class="container mx-auto px-4">
        <div class="grid lg:grid-cols-5 gap-12 items-start">
          ${inverted ? contentSection + imageSection : imageSection + contentSection}
        </div>
      </div>
    </section>
  `);

  block.textContent = '';
  block.append(content);
}
