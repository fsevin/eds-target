import { readBlockConfig, createOptimizedPicture } from '../../scripts/aem.js';
import { getSiteNameFromDAM } from '../../scripts/utils.js';

export default function decorate(block) {
  const config = readBlockConfig(block);
  const picture = createOptimizedPicture(config.image, config.imagedescription);

  const blockId = `teaser-${Math.random().toString(36).substr(2, 9)}`;

  const content = document.createRange().createContextualFragment(`
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <!-- Image Section -->
          <div id="${blockId}-image" class="relative rounded-2xl overflow-hidden shadow-2xl">
            ${picture.outerHTML}
          </div>

          <!-- Content Section -->
          <div class="space-y-6">
            <h2 id="${blockId}-title" data-aue-label="Title" data-aue-prop="title" data-aue-type="text" class="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              ${config.title}
            </h2>
            <p id="${blockId}-description" data-aue-label="Description" data-aue-prop="description" data-aue-type="richtext" class="text-lg text-gray-600 leading-relaxed">
              ${config.description}
            </p>
            <div>
              <a id="${blockId}-button" data-aue-label="Call to Action" data-aue-prop="buttonText" data-aue-type="text" href="${config.buttonlink}" class="inline-block px-8 py-4 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition shadow-lg hover:shadow-xl">
                ${config.buttontext}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `);

  block.textContent = '';
  block.append(content);

  // Apply image styling
  const teaserImage = document.querySelector(`#${blockId}-image picture img`);
  if (teaserImage) {
    teaserImage.style.width = '100%';
    teaserImage.style.height = 'auto';
    teaserImage.style.display = 'block';
    teaserImage.style.margin = '0';
  }

  if (config.offerzone) {
    if (typeof adobe !== 'undefined' && adobe.target) {
      handleOffer();
    } else {
      document.addEventListener('at-library-loaded', handleOffer);
    }

    function handleOffer() {
      adobe.target.getOffer({
        "mbox": config.offerzone,
        "params": {
          "logged": localStorage.getItem('logged'),
          "profileType": localStorage.getItem('profileType')
        },
        "success": function (offer) {
          if (!offer.length) return;

          const offerContent = offer[0].content[0].data.offerByPath.item;

          const titleElement = document.getElementById(`${blockId}-title`);
          titleElement.innerHTML = offerContent.title;

          const descriptionElement = document.getElementById(`${blockId}-description`);
          descriptionElement.innerHTML = offerContent.description.html;

          const buttonElement = document.getElementById(`${blockId}-button`);
          buttonElement.innerHTML = offerContent.buttonText;
          buttonElement.href = offerContent.buttonLink['_path'];

          const imageElement = document.getElementById(`${blockId}-image`);
          const imagePath = offerContent.image['_path'];
          const siteName = getSiteNameFromDAM(imagePath);
          const picture = createOptimizedPicture(imagePath.substring(`/content/dam/${siteName}`.length), offerContent.imageDescription);
          imageElement.innerHTML = picture.outerHTML;

          // Reapply image styling for the new image
          const newImage = imageElement.querySelector('picture img');
          if (newImage) {
            newImage.style.width = '100%';
            newImage.style.height = 'auto';
            newImage.style.display = 'block';
            newImage.style.margin = '0';
          }
        },
        "error": function (status, error) {
          console.log('Error', status, error);
        }
      });
    }
  }
}