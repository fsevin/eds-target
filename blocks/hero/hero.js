import { readBlockConfig, createOptimizedPicture } from '../../scripts/aem.js';
import { getSiteNameFromDAM, extractFieldFromBlock } from '../../scripts/utils.js';

export default function decorate(block) {
  const config = readBlockConfig(block);
  const picture = createOptimizedPicture(config.image, config.imagedescription);
  const descriptionHTML = extractFieldFromBlock(block, 'description');

  const blockId = `hero-${Math.random().toString(36).substr(2, 9)}`;

  const content = document.createRange().createContextualFragment(`
    <section class="relative py-12 md:py-20 bg-cover bg-center bg-no-repeat">
      <!-- Background Image -->
      <div id="${blockId}-image" class="absolute inset-0 z-0">
        ${picture.outerHTML}
      </div>

      <!-- Black Overlay -->
      <div class="absolute inset-0 bg-black/50 z-10"></div>

      <!-- Content -->
      <div class="container mx-auto px-4 relative z-20">
        <div class="max-w-4xl mx-auto text-center">
          <!-- Main Heading -->
          <h1 id="${blockId}-title" data-aue-label="Title" data-aue-prop="title" data-aue-type="text" class="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            ${config.title}
          </h1>

          <!-- Description -->
          <div id="${blockId}-description" data-aue-label="Description" data-aue-prop="description" data-aue-type="richtext" class="text-lg md:text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            ${descriptionHTML}
          </div>

          <!-- CTA Button -->
          <div class="flex items-center justify-center">
            <a id="${blockId}-button" data-aue-label="Call to Action" data-aue-prop="buttonText" data-aue-type="text" href="${config.buttonlink}" class="px-8 py-4 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition shadow-lg hover:shadow-xl">
              ${config.buttontext}
            </a>
          </div>
        </div>
      </div>
    </section>
  `);

  block.textContent = '';
  block.append(content);

  // Apply background-like styling to the image
  const imageContainer = document.getElementById(`${blockId}-image`);
  if (imageContainer) {
    imageContainer.style.overflow = 'hidden';
  }

  const heroPicture = document.querySelector(`#${blockId}-image picture`);
  if (heroPicture) {
    heroPicture.style.position = 'absolute';
    heroPicture.style.top = '0';
    heroPicture.style.left = '0';
    heroPicture.style.width = '100%';
    heroPicture.style.height = '100%';
    heroPicture.style.margin = '0';
    heroPicture.style.padding = '0';
    heroPicture.style.display = 'block';
  }

  const heroImage = document.querySelector(`#${blockId}-image picture img`);
  if (heroImage) {
    heroImage.style.width = '100%';
    heroImage.style.height = '100%';
    heroImage.style.objectFit = 'cover';
    heroImage.style.objectPosition = 'center';
    heroImage.style.margin = '0';
    heroImage.style.padding = '0';
    heroImage.style.display = 'block';
    heroImage.style.verticalAlign = 'top';
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

          // Reapply background-like styling for the new image
          const newPicture = imageElement.querySelector('picture');
          if (newPicture) {
            newPicture.style.position = 'absolute';
            newPicture.style.top = '0';
            newPicture.style.left = '0';
            newPicture.style.width = '100%';
            newPicture.style.height = '100%';
            newPicture.style.margin = '0';
            newPicture.style.padding = '0';
            newPicture.style.display = 'block';
          }

          const newImage = imageElement.querySelector('picture img');
          if (newImage) {
            newImage.style.width = '100%';
            newImage.style.height = '100%';
            newImage.style.objectFit = 'cover';
            newImage.style.objectPosition = 'center';
            newImage.style.margin = '0';
            newImage.style.padding = '0';
            newImage.style.display = 'block';
            newImage.style.verticalAlign = 'top';
          }

        },
        "error": function (status, error) {
          console.log('Error', status, error);
        }
      });
    }
  }
}