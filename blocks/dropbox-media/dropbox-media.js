import { readBlockConfig } from '../../scripts/aem.js';

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const dropboxMedia = config.dropboxmedia;

  const content = document.createRange().createContextualFragment(`
    ${dropboxMedia} ? 
      <img
        src="${dropboxMedia}"
        alt="Dropbox Media"
        class="dropbox-media-image"
      /> :
      <div>No Dropbox media provided.</div>
  `);

  block.textContent = '';
  block.append(content);
}
