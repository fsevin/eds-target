import { readBlockConfig, createOptimizedPicture } from '../../scripts/aem.js';
import { getSiteNameFromDAM, extractFieldFromBlock } from '../../scripts/utils.js';

export default function decorate(block) {
  const config = readBlockConfig(block);
  const style = config.style || '';
  const picture = createOptimizedPicture(config.image, config.imagedescription);

  const descriptionHTML = extractFieldFromBlock(block, 'description');

  const blockId = `teaser-${Math.random().toString(36).substr(2, 9)}`;
  const sectionClasses = style.includes('highlight') ? 'py-20 bg-gray-50' : 'py-20 bg-white';

  const content = document.createRange().createContextualFragment(`
    <section class="${sectionClasses}">
      <div class="container mx-auto px-4">
        <div class="grid lg:grid-cols-5 gap-12 items-center">
          <!-- Image Section (60% width) -->
          <div id="${blockId}-image" data-aue-label="Image" data-aue-prop="image" data-aue-type="media" class="relative rounded-2xl overflow-hidden shadow-2xl lg:col-span-3">
            ${picture.outerHTML}
          </div>

          <!-- Content Section (40% width) -->
          <div class="space-y-6 lg:col-span-2">
            <h2 id="${blockId}-title" data-aue-label="Title" data-aue-prop="title" data-aue-type="text" class="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              ${config.title}
            </h2>
            <div id="${blockId}-description" data-aue-label="Description" data-aue-prop="description" data-aue-type="richtext" class="text-lg text-gray-600 leading-relaxed">
              ${descriptionHTML}
            </div>
            <div>
              <a id="${blockId}-button" data-aue-label="Call to Action" data-aue-prop="buttonText" data-aue-type="text" href="${config.buttonlink}" class="inline-block px-8 py-4 bg-brand-600 text-white font-semibold rounded-2xl hover:bg-brand-700 transition shadow-lg hover:shadow-xl">
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

  // Apply image styling to fill container
  const teaserPicture = document.querySelector(`#${blockId}-image picture`);
  const teaserImage = document.querySelector(`#${blockId}-image picture img`);

  if (teaserPicture) {
    teaserPicture.style.width = '100%';
    teaserPicture.style.height = '100%';
    teaserPicture.style.display = 'block';
  }

  if (teaserImage) {
    teaserImage.style.width = '100%';
    teaserImage.style.height = '100%';
    teaserImage.style.objectFit = 'cover';
    teaserImage.style.objectPosition = 'center';
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
          const newPicture = imageElement.querySelector('picture');
          const newImage = imageElement.querySelector('picture img');

          if (newPicture) {
            newPicture.style.width = '100%';
            newPicture.style.height = '100%';
            newPicture.style.display = 'block';
          }

          if (newImage) {
            newImage.style.width = '100%';
            newImage.style.height = '100%';
            newImage.style.objectFit = 'cover';
            newImage.style.objectPosition = 'center';
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