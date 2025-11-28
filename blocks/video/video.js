import { readBlockConfig } from '../../scripts/aem.js';
import { extractFieldFromBlock } from '../../scripts/utils.js';

export default function decorate(block) {
  const config = readBlockConfig(block);
  const title = config.title || 'Video Title';
  const videoUrl = config.url || '';
  const videoURL = videoUrl ? videoUrl.split('/as/')[0] : '';
  const videoThumbnail = videoUrl ? videoUrl.split('/play/')[0] : '';

  // Build video URL with optional autoplay
  const shouldAutoplay = config.autoplay === 'true';
  const autoplayParams = shouldAutoplay ? '?autoplay=1&muted=1' : '';
  const finalVideoURL = videoURL ? `${videoURL}${autoplayParams}` : '';

  const descriptionHTML = extractFieldFromBlock(block, 'description') || '<p>Add your video description here.</p>';
  const style = config.style || '';
  const sectionClasses = style.includes('highlight') ? 'py-20 bg-gray-50' : 'py-20 bg-white';

  const videoContainerHTML = !videoUrl ? `
    <!-- Video Placeholder -->
    <div class="relative rounded-lg overflow-hidden shadow-2xl">
      <div class="aspect-video bg-gray-900 relative">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" class="w-full h-full">
          <rect width="800" height="450" fill="#e5e7eb"/>
          <g transform="translate(400, 225)">
            <svg xmlns="http://www.w3.org/2000/svg" x="-40" y="-40" width="80" height="80" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#9ca3af">
              <path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"/>
            </svg>
          </g>
          <text x="400" y="275" text-anchor="middle" fill="#9ca3af" font-family="system-ui, -apple-system, sans-serif" font-size="16">Add Video URL</text>
        </svg>
      </div>
    </div>
  ` : shouldAutoplay ? `
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
    <section class="${sectionClasses}">
      <div class="container mx-auto px-4">
        <div class="max-w-5xl mx-auto">
          <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4" data-aue-label="Title" data-aue-prop="title" data-aue-type="text">${title}</h2>
          <div class="text-xl text-gray-600 max-w-3xl mx-auto" data-aue-label="Description" data-aue-prop="description" data-aue-type="richtext">${descriptionHTML}</div>
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
