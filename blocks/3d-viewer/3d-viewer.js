import { readBlockConfig } from '../../scripts/aem.js';

export default function decorate(block) {
  const config = readBlockConfig(block);

  // Create section wrapper matching teaser
  const section = document.createElement('section');
  section.className = 'py-20 bg-white';

  // Create container matching teaser
  const outerContainer = document.createElement('div');
  outerContainer.className = 'container mx-auto px-4';

  // Create inner container with border matching teaser
  const container = document.createElement('div');
  container.className = 'relative overflow-hidden border border-gray-200 p-8 bg-gray-50';

  // Create model viewer
  const modelViewer = document.createElement('model-viewer');
  modelViewer.className = 'w-full h-[600px]';
  modelViewer.setAttribute('src', config.asset);
  modelViewer.setAttribute('ar', '');
  modelViewer.setAttribute('shadow-intensity', '1');
  modelViewer.setAttribute('camera-controls', '');
  modelViewer.setAttribute('touch-action', 'pan-y');
  modelViewer.setAttribute('interaction-prompt', 'none');
  modelViewer.setAttribute('auto-rotate', '');
  modelViewer.setAttribute('auto-rotate-delay', '1000');
  modelViewer.setAttribute('camera-orbit', '45deg 115deg 80%');

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