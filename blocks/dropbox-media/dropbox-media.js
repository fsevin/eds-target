import { readBlockConfig } from '../../scripts/aem.js';

export default async function decorate(block) {
  const config = readBlockConfig(block);

  const dropboxMedia = config.dropboxmedia;

  const content = document.createRange().createContextualFragment(`
    <img
      src="${dropboxMedia}"
      alt="Dropbox Media"
      class="dropbox-media-image"
    />
  `);

  block.textContent = '';
  block.append(content);
}
