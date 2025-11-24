import { readBlockConfig } from '../../scripts/aem.js';

export default async function decorate(block) {
  const config = readBlockConfig(block);

  const dropboxMedia = config.dropboxMedia;

  const content = document.createRange().createContextualFragment(`
    <div class="dropbox-media-container">
      <img
        src="${dropboxMedia}"
        alt="Dropbox Media"
        class="dropbox-media-image"
        data-aue-label="Dropbox Media URL"
        data-aue-prop="dropboxMedia"
        data-aue-type="text"
      />
    </div>
  `);

  block.textContent = '';
  block.append(content);
}
