import { readBlockConfig } from '../../scripts/aem.js';
import { extractFieldFromBlock } from '../../scripts/utils.js';

export default function decorate(block) {
  const config = readBlockConfig(block);
  const videoURL = config.url.split('/as/')[0];
  const videoThumbnail = config.url.split('/play/')[0];

  // Build video URL with optional autoplay
  const shouldAutoplay = config.autoplay === 'true';
  const autoplayParams = shouldAutoplay ? '?autoplay=1&muted=1' : '';
  const finalVideoURL = `${videoURL}${autoplayParams}`;

  const descriptionHTML = extractFieldFromBlock(block, 'description');

  const videoContainerHTML = shouldAutoplay ? `
    <!-- Video Container with Autoplay -->
    <div class="relative rounded-lg overflow-hidden shadow-2xl">
      <div class="aspect-video bg-gray-900">
        <iframe
          class="w-full h-full"
          src="${finalVideoURL}"
          title="Video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          data-aue-label="Video URL"
          data-aue-prop="url"
          data-aue-type="text">
        </iframe>
      </div>
    </div>
  ` : `
    <!-- Video Container with Thumbnail -->
    <div class="relative rounded-lg overflow-hidden shadow-2xl group cursor-pointer" id="video-container">
      <div class="aspect-video bg-gray-900 relative">
        <!-- Thumbnail -->
        <img
          src="${videoThumbnail}"
          alt="Video thumbnail"
          class="absolute inset-0 w-full h-full object-cover"
          id="video-thumbnail"
        />

        <!-- Play Button Overlay -->
        <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-40 transition" id="play-overlay">
          <div class="w-20 h-20 bg-brand-600 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition">
            <svg class="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        <!-- Video iframe (hidden initially) -->
        <iframe
          class="w-full h-full hidden"
          src=""
          title="Video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          data-aue-label="Video URL"
          data-aue-prop="url"
          data-aue-type="text"
          id="video-iframe">
        </iframe>
      </div>
    </div>
  `;

  const content = document.createRange().createContextualFragment(`
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="max-w-5xl mx-auto">
          <!-- Section Header -->
          <div class="text-center mb-12">
            <h2 data-aue-label="Title" data-aue-prop="title" data-aue-type="text" class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ${config.title}
            </h2>
            <p data-aue-label="Description" data-aue-prop="description" data-aue-type="richtext" class="text-lg text-gray-600 max-w-2xl mx-auto">
              ${descriptionHTML}
            </p>
          </div>
          ${videoContainerHTML}
        </div>
      </div>
    </section>
  `);

  block.textContent = '';
  block.append(content);

  // Add click handler for thumbnail mode
  if (!shouldAutoplay) {
    const videoContainer = block.querySelector('#video-container');
    const videoThumbnailEl = block.querySelector('#video-thumbnail');
    const playOverlay = block.querySelector('#play-overlay');
    const videoIframe = block.querySelector('#video-iframe');

    if (videoContainer && videoIframe) {
      videoContainer.addEventListener('click', () => {
        // Hide thumbnail and play button
        if (videoThumbnailEl) videoThumbnailEl.style.display = 'none';
        if (playOverlay) playOverlay.style.display = 'none';

        // Show and load video with autoplay
        videoIframe.classList.remove('hidden');
        videoIframe.src = `${videoURL}?autoplay=1`;

        // Remove cursor pointer from container
        videoContainer.style.cursor = 'default';
      });
    }
  }
}
