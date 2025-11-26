import { loadFragment } from '../fragment/fragment.js';
import { isAuthorMode, getPagePath, getIconPath, getCurrentLocale } from '../../scripts/utils.js';

function switchLocale(targetLocale) {
  const currentLocale = getCurrentLocale();
  const currentPath = window.location.pathname;
  const newPath = currentPath.replace(`/${currentLocale}/`, `/${targetLocale}/`);
  window.location.href = newPath;
}

function extractMenuItems(fragment) {
  const menuItems = [];
  const menuBlock = fragment.querySelector('.menu');

  if (menuBlock) {
    const items = menuBlock.querySelectorAll(':scope > div');
    items.forEach(item => {
      const labelEl = item.querySelector('div:first-child');
      const linkEl = item.querySelector('div:nth-child(2) a');

      if (labelEl && linkEl) {
        menuItems.push({
          label: labelEl.textContent.trim(),
          path: linkEl.getAttribute('href')
        });
      }
    });
  }

  if (!isAuthorMode) {
    menuItems.forEach(item => {
      item.path = item.path.replace(/\/templates\//, '/pages/');
    });
  }

  return menuItems;
}

function buildNavigationHTML(menuItems) {
  return menuItems.map(item => `
    <a href="${item.path}" class="text-gray-700 hover:text-brand-600 transition">
      ${item.label}
    </a>
  `).join('');
}

function extractLoginModalData(fragment) {
  const loginModalBlock = fragment.querySelector('.login-modal');
  if (!loginModalBlock) {
    return {
      title: 'Login',
      usernameLabel: 'Username',
      profileTypeLabel: 'Profile Type',
      profileOptions: [],
      cancelButtonLabel: 'Cancel'
    };
  }

  const items = loginModalBlock.querySelectorAll(':scope > div');
  const title = items[0]?.querySelector('div:nth-child(2)')?.textContent.trim() || 'Login';
  const usernameLabel = items[1]?.querySelector('div:nth-child(2)')?.textContent.trim() || 'Username';
  const profileTypeLabel = items[2]?.querySelector('div:nth-child(2)')?.textContent.trim() || 'Profile Type';
  const optionsText = items[3]?.querySelector('div:nth-child(2)')?.textContent.trim() || '';
  const cancelButtonLabel = items[4]?.querySelector('div:nth-child(2)')?.textContent.trim() || 'Cancel';

  const profileOptions = optionsText.split(',').map(option => {
    const trimmedOption = option.trim();
    return { value: trimmedOption.toLowerCase(), label: trimmedOption };
  }).filter(opt => opt.value);

  return { title, usernameLabel, profileTypeLabel, profileOptions, cancelButtonLabel };
}

export default async function decorate(block) {
  const headerPath = `/${getCurrentLocale()}/header`;
  const fragment = await loadFragment(headerPath);

  const currentLocale = getCurrentLocale();
  const menuItems = extractMenuItems(fragment);
  const navigationHTML = buildNavigationHTML(menuItems);
  const loginModalData = extractLoginModalData(fragment);
  const content = document.createRange().createContextualFragment(`
    <!-- Header -->
    <nav class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center">
          <a href="${getPagePath(`/${currentLocale}/home`)}" class="text-2xl font-bold text-gray-900">
            <img src="${getIconPath('logo.svg')}" alt="Logo" class="h-10">
          </a>
        </div>

        <!-- Navigation Links -->
        <div class="hidden md:flex items-center space-x-8">
          ${navigationHTML}
        </div>

        <!-- Right Section -->
        <div class="hidden md:flex items-center space-x-4">
          <select class="px-4 py-2 h-10 border border-gray-300 rounded-md text-gray-700 text-sm focus:outline-none focus:border-brand-600 appearance-none cursor-pointer" id="localeSelect" aria-label="Select language">
            <option value="us/en" ${currentLocale === 'us/en' ? 'selected' : ''}>🇺🇸 EN</option>
            <option value="fr/fr" ${currentLocale === 'fr/fr' ? 'selected' : ''}>🇫🇷 FR</option>
            <option value="es/es" ${currentLocale === 'es/es' ? 'selected' : ''}>🇪🇸 ES</option>
          </select>
          <button class="px-6 py-2 h-10 text-white bg-brand-600 rounded-md hover:bg-brand-700 transition flex items-center gap-2" id="loginBtn">
            Login
          </button>
        </div>

        <!-- Mobile Menu Button -->
        <button class="md:hidden text-gray-700" id="mobileMenuBtn" aria-label="Toggle menu">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div class="hidden md:hidden mt-4 pb-4" id="mobileMenu">
        <div class="flex flex-col space-y-4">
          ${navigationHTML}
          <select class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 text-sm cursor-pointer" id="localeSelectMobile" aria-label="Select language">
            <option value="us/en" ${currentLocale === 'us/en' ? 'selected' : ''}>🇺🇸 EN</option>
            <option value="fr/fr" ${currentLocale === 'fr/fr' ? 'selected' : ''}>🇫🇷 FR</option>
            <option value="es/es" ${currentLocale === 'es/es' ? 'selected' : ''}>🇪🇸 ES</option>
          </select>
        </div>
      </div>
    </nav>

    <!-- Modal Overlay -->
    <div class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" id="loginModal">
      <!-- Modal -->
      <div class="bg-white rounded-xl max-w-md w-full shadow-2xl" role="dialog" aria-labelledby="loginModalTitle">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-2xl font-bold text-gray-900" id="loginModalTitle">${loginModalData.title}</h2>
          <button class="text-gray-400 hover:text-gray-600 text-3xl leading-none" id="closeModal" aria-label="Close modal">&times;</button>
        </div>

        <!-- Modal Body -->
        <div class="p-6">
          <form id="loginForm">
            <div class="mb-5">
              <label for="username" class="block text-sm font-semibold text-gray-700 mb-2">${loginModalData.usernameLabel}</label>
              <input
                type="text"
                id="username"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition"
                required
              >
            </div>
            <div class="mb-5">
              <label for="profileType" class="block text-sm font-semibold text-gray-700 mb-2">${loginModalData.profileTypeLabel}</label>
              <select
                id="profileType"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition"
                required
              >
                ${loginModalData.profileOptions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
              </select>
            </div>
          </form>
        </div>

        <!-- Modal Footer -->
        <div class="flex gap-3 p-6 border-t border-gray-200 justify-end">
          <button type="button" class="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold" id="cancelBtn">${loginModalData.cancelButtonLabel}</button>
          <button type="submit" form="loginForm" class="px-5 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition font-semibold">${loginModalData.title}</button>
        </div>
      </div>
    </div>
  `);

  block.textContent = '';
  block.append(content);

  const loginBtn = document.getElementById('loginBtn');
  const loginModal = document.getElementById('loginModal');
  const closeModal = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const localeSelect = document.getElementById('localeSelect');
  const localeSelectMobile = document.getElementById('localeSelectMobile');

  const username = localStorage.getItem('username');
  if (username) {
      loginBtn.innerHTML = `<span>${username}</span>`;
  }

  // Open modal
  loginBtn.addEventListener('click', function() {
    if (localStorage.getItem('logged')) {
        localStorage.removeItem('logged');
        localStorage.removeItem('username');
        localStorage.removeItem('profileType');
        loginBtn.innerHTML = `<span>Login</span>`;
    } else {
      loginModal.classList.remove('hidden');
      loginModal.classList.add('flex');
    }
  });

  // Close modal methods
  function closeLoginModal() {
    loginModal.classList.add('hidden');
    loginModal.classList.remove('flex');
  }

  closeModal.addEventListener('click', closeLoginModal);
  cancelBtn.addEventListener('click', closeLoginModal);

  // Close modal when clicking outside
  loginModal.addEventListener('click', function(e) {
    if (e.target === loginModal) {
      closeLoginModal();
    }
  });

  // Mobile menu toggle
  mobileMenuBtn.addEventListener('click', function() {
    mobileMenu.classList.toggle('hidden');
  });

  // Form submission
  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const profileType = document.getElementById('profileType').value;

    localStorage.setItem('logged', true);
    localStorage.setItem('username', username);
    localStorage.setItem('profileType', profileType);
    loginBtn.innerHTML = `<span>${username}</span>`;
    closeLoginModal();
  });

  // Locale switcher (desktop)
  localeSelect.addEventListener('change', function() {
    const targetLocale = this.value;
    if (targetLocale !== currentLocale) {
      switchLocale(targetLocale);
    }
  });

  // Locale switcher (mobile)
  localeSelectMobile.addEventListener('change', function() {
    const targetLocale = this.value;
    if (targetLocale !== currentLocale) {
      switchLocale(targetLocale);
    }
  });
}
