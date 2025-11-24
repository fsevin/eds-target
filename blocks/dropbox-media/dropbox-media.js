import { readBlockConfig } from '../../scripts/aem.js';

export default async function decorate(block) {
  const config = readBlockConfig(block);

  const dropboxMedia = config.dropboxmedia || '';
  const title = config.title || 'Lorem Ipsum Dolor Sit';
  const description = config.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
  const inverted = config.inverted === 'true' || config.inverted === true;

  const content = document.createRange().createContextualFragment(`
    <div class="dropbox-media${inverted ? ' inverted' : ''}">
      <div class="dropbox-media-content">
        <h2 class="dropbox-media-title" data-aue-label="Title" data-aue-prop="title" data-aue-type="text">${title}</h2>
        <p class="dropbox-media-description" data-aue-label="Description" data-aue-prop="description" data-aue-type="text">${description}</p>
      </div>
      <div class="dropbox-media-image-wrapper">
        ${dropboxMedia ? `
          <img
            src="${dropboxMedia}"
            alt="${title}"
            class="dropbox-media-image"
          />` : `
          <div class="dropbox-media-placeholder">No image provided</div>`}
      </div>
    </div>
  `);

  block.textContent = '';
  block.append(content);
}
