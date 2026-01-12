import { readBlockConfig } from '../../scripts/aem.js';

export default function decorate(block) {
  const config = readBlockConfig(block);

  // Create container
  const container = document.createElement('div');
  container.className = 'relative w-full overflow-hidden bg-white';

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
  modelViewer.setAttribute('auto-rotate-delay', '3000');

  container.appendChild(modelViewer);

  // Load model-viewer script if not already loaded
  if (!document.querySelector('script[src*="model-viewer"]')) {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';
    document.head.appendChild(script);
  }

  block.textContent = '';
  block.append(container);
}