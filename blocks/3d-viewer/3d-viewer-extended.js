import { readBlockConfig } from '../../scripts/aem.js';

export default function decorate(block) {
  const config = readBlockConfig(block);

  // Create section wrapper matching teaser
  const section = document.createElement('section');
  section.className = 'bg-white';

  // Create container matching teaser
  const outerContainer = document.createElement('div');
  outerContainer.className = 'container mx-auto px-4';

  // Create inner container with border matching teaser
  const container = document.createElement('div');
  container.className = 'relative overflow-hidden border border-gray-200 bg-gray-50';

  // Create fullscreen button
  const fullscreenBtn = document.createElement('button');
  fullscreenBtn.className = 'absolute top-4 right-4 z-10 p-3 bg-white/90 backdrop-blur rounded-lg shadow-md hover:bg-white hover:shadow-lg transition-all duration-200 border border-gray-200';
  fullscreenBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>`;
  fullscreenBtn.setAttribute('aria-label', 'Toggle fullscreen');

  // Fullscreen toggle handler
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  });

  // Update button icon on fullscreen change
  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement === container) {
      fullscreenBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9V4H4m0 0v5m0-5l5 5m6-5h5v5m0-5l-5 5m-6 6v5H4m0 0v-5m0 5l5-5m6 5h5v-5m0 5l-5-5" />
      </svg>`;
      container.classList.remove('border', 'border-gray-200', 'bg-gray-50');
      container.classList.add('bg-white');
    } else {
      fullscreenBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>`;
      container.classList.add('border', 'border-gray-200', 'bg-gray-50');
      container.classList.remove('bg-white');
    }
  });

  // Create model viewer
  const modelViewer = document.createElement('model-viewer');
  modelViewer.className = 'w-full h-[600px] fullscreen:h-screen';
  modelViewer.setAttribute('src', config.asset);
  modelViewer.setAttribute('ar', '');
  modelViewer.setAttribute('shadow-intensity', '1');
  modelViewer.setAttribute('camera-controls', '');
  modelViewer.setAttribute('touch-action', 'pan-y');
  modelViewer.setAttribute('interaction-prompt', 'none');
  modelViewer.setAttribute('auto-rotate', '');
  modelViewer.setAttribute('auto-rotate-delay', '1000');
  modelViewer.setAttribute('camera-orbit', '0deg 45deg 80%');

  container.appendChild(fullscreenBtn);
  container.appendChild(modelViewer);
  outerContainer.appendChild(container);
  section.appendChild(outerContainer);

  // Load model-viewer script if not already loaded
  if (!document.querySelector('script[src*="model-viewer"]')) {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';
    document.head.appendChild(script);
  }

  block.textContent = '';
  block.append(section);
}