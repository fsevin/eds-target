import { readBlockConfig } from '../../scripts/aem.js';
import { transformImageSrc } from '../../scripts/utils.js';

export default async function decorate(block) {
    const config = readBlockConfig(block);
    const content = document.createRange().createContextualFragment(config.content.replace(/\'/g, ''));

    block.textContent = '';
    block.append(content);

    const images = document.querySelectorAll('img');
    images.forEach(async image => {
        const src = image.getAttribute('src');
        const transformedSrc = await transformImageSrc(src);
        image.setAttribute('src', transformedSrc);
    });
}
