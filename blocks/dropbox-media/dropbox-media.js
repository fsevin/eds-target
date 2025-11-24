import { readBlockConfig } from '../../scripts/aem.js';

export default async function decorate(block) {
  const config = readBlockConfig(block);

  const dropboxMedia = config.dropboxmedia;

  const content = document.createRange().createContextualFragment(`
    <div class="dropbox-media-container">
      <img
        src="${dropboxMedia}"
        alt="Dropbox Media"
        class="dropbox-media-image"
      />
    </div>
  `);

  block.textContent = '';
  block.append(content);
}
