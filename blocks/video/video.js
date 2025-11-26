import { readBlockConfig } from '../../scripts/aem.js';
import { getSiteNameFromDAM } from '../../scripts/utils.js';

export default function decorate(block) {
  const config = readBlockConfig(block);

  const content = document.createRange().createContextualFragment(`
    <section class="py-20 bg-white">
      <div class="container mx-auto px-4">
        <div class="max-w-5xl mx-auto">
          <!-- Section Header -->
          <div class="text-center mb-12">
            <h2 data-aue-label="Title" data-aue-prop="title" data-aue-type="text" class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ${config.title}
            </h2>
            <p data-aue-label="Description" data-aue-prop="description" data-aue-type="richtext" class="text-lg text-gray-600 max-w-2xl mx-auto">
              ${config.description}
            </p>
          </div>

          <!-- Video Container -->
          <div class="relative rounded-lg overflow-hidden shadow-2xl">
            <div class="aspect-video bg-gray-900">
              <video
                class="w-full h-full"
                controls
                preload="metadata"
                data-aue-label="Video"
                data-aue-prop="url"
                data-aue-type="media">
                <source src="${config.url}" type="video/mp4">
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  `);

  block.textContent = '';
  block.append(content);
}
