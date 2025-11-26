import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { getCurrentLocale } from '../../scripts/utils.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const currentLocale = getCurrentLocale();
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : `/${currentLocale}/footer`;
  const fragment = await loadFragment(footerPath);

  const copyright = fragment.querySelector('p').innerHTML;

  const footerHTML = `
    <!-- Footer -->
    <div class="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <!-- Company Info -->
          <div>
            <h3 class="text-white text-2xl font-bold mb-4">
              <span class="text-blue-500">Startup</span>
            </h3>
            <p class="mb-4">
              Our support team will get back to you ASAP via email.
            </p>
            <p class="text-sm text-gray-400">
              Lorem ipsum dolor sited Sed ullam corper consectur adipiscing Mae ornare massa quis lectus.
            </p>
          </div>

          <!-- Quick Links -->
          <div>
            <h4 class="text-white font-semibold mb-4">Quick Links</h4>
            <ul class="space-y-2">
              <li><a href="#" class="hover:text-blue-500 transition">Home</a></li>
              <li><a href="#" class="hover:text-blue-500 transition">About</a></li>
              <li><a href="#" class="hover:text-blue-500 transition">Features</a></li>
              <li><a href="#" class="hover:text-blue-500 transition">Pricing</a></li>
            </ul>
          </div>

          <!-- Support -->
          <div>
            <h4 class="text-white font-semibold mb-4">Support</h4>
            <ul class="space-y-2">
              <li><a href="#" class="hover:text-blue-500 transition">Documentation</a></li>
              <li><a href="#" class="hover:text-blue-500 transition">Support</a></li>
              <li><a href="#" class="hover:text-blue-500 transition">Contact</a></li>
              <li><a href="#" class="hover:text-blue-500 transition">FAQ</a></li>
            </ul>
          </div>

          <!-- Newsletter -->
          <div>
            <h4 class="text-white font-semibold mb-4">Newsletter</h4>
            <p class="mb-4 text-sm">
              No spam guaranteed, So please don't send any spam mail.
            </p>
            <form class="flex">
              <input
                type="email"
                placeholder="Enter your email"
                class="flex-1 px-4 py-2 rounded-l-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                class="px-6 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="border-t border-gray-800 pt-8">
          <div class="flex flex-col md:flex-row items-center justify-between">
            <p class="text-sm text-gray-400 mb-4 md:mb-0">
              ${copyright}
            </p>
            <div class="flex space-x-6">
              <a href="#" class="text-gray-400 hover:text-blue-500 transition" aria-label="Facebook">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-blue-500 transition" aria-label="Twitter">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-blue-500 transition" aria-label="GitHub">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const content = document.createRange().createContextualFragment(footerHTML);

  block.textContent = '';
  block.append(content);
}
