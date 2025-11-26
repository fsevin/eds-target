import { readBlockConfig } from '../../scripts/aem.js';
import { extractFieldFromBlock } from '../../scripts/utils.js';

export default async function decorate(block) {
  const config = readBlockConfig(block);

  const dropboxMedia = config.dropboxmedia || '';
  const descriptionHTML = extractFieldFromBlock(block, 'description');

  const imageSection = `
    <!-- Image Section (60% width) -->
    <div class="relative rounded-2xl overflow-hidden shadow-2xl lg:col-span-3 min-h-[500px]" data-aue-label="Image" data-aue-prop="dropboxmedia" data-aue-type="text">
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
      <div data-aue-label="Description" data-aue-prop="description" data-aue-type="richtext" class="text-lg text-gray-600 leading-relaxed">
        ${descriptionHTML}
      </div>
    </div>
  `;

  const content = document.createRange().createContextualFragment(`
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="grid lg:grid-cols-5 gap-12 items-start">
          ${config.inverted ? contentSection + imageSection : imageSection + contentSection}
        </div>
      </div>
    </section>
  `);

  block.textContent = '';
  block.append(content);
}
