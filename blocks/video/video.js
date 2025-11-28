import { readBlockConfig } from '../../scripts/aem.js';
import { extractFieldFromBlock, createPlaceholderSVG } from '../../scripts/utils.js';

// Helper function to extract YouTube video ID
function getYouTubeVideoId(url) {
  return url.includes('watch?v=')
    ? url.split('watch?v=')[1].split('&')[0]
    : url.split('/').pop().split('?')[0];
}

export default function decorate(block) {
  const config = readBlockConfig(block);
  const title = config.title || 'Video Title';
  const deliveryUrl = config.deliveryurl || '';
  const youtubeUrl = config.youtubeurl || '';
  const videoUrl = deliveryUrl ? deliveryUrl.split('/as/')[0] : youtubeUrl;
  const shouldAutoplay = config.autoplay === 'true';

  // Get thumbnail URL and final video URL based on video type
  let videoThumbnail = '';
  let finalVideoURL = '';

  const autoplayParams = shouldAutoplay ? '?autoplay=1&mute=1' : '';
  if (youtubeUrl) {
    const videoId = getYouTubeVideoId(youtubeUrl);
    videoThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    finalVideoURL = `https://www.youtube.com/embed/${videoId}${autoplayParams}`;
  } else if (deliveryUrl) {
    videoThumbnail = deliveryUrl.split('/play/')[0];
    finalVideoURL = `${videoUrl}${autoplayParams}`;
  }

  const descriptionHTML = extractFieldFromBlock(block, 'description') || '<p>Add your video description here.</p>';
  const style = config.style || '';
  const sectionClasses = style.includes('highlight') ? 'py-20 bg-gray-50' : 'py-20 bg-white';

  // Create common iframe element
  const createIframe = (src = '', hidden = false) => {
    const isYouTube = src.includes('youtube.com/embed');
    const allowAttribute = isYouTube 
      ? "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      : "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    
    return `
      <iframe
        class="w-full h-full${hidden ? ' hidden' : ''}"
        src="${src}"
        title="Video player"
        frameborder="0"
        allow="${allowAttribute}"
        allowfullscreen
        data-aue-label="Video URL"
        data-aue-prop="url"
        data-aue-type="text"
        id="video-iframe">
      </iframe>
    `;
  };

  const videoContainerHTML = !videoUrl ? `
    <!-- Video Placeholder -->
    <div class="relative rounded-lg overflow-hidden shadow-2xl">
      <div class="aspect-video bg-gray-900 relative">
        ${createPlaceholderSVG('video', '16:9')}
      </div>
    </div>
  ` : shouldAutoplay ? `
    <!-- Video Container with Autoplay -->
    <div class="relative rounded-lg overflow-hidden shadow-2xl">
      <div class="aspect-video bg-gray-900">
        ${createIframe(finalVideoURL)}
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
        ${createIframe('', true)}
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
  if (!shouldAutoplay && videoUrl) {
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
        videoIframe.src = `${finalVideoURL}?autoplay=1`;

        // Remove cursor pointer from container
        videoContainer.style.cursor = 'default';
      }, { once: true });
    }
  }
}
