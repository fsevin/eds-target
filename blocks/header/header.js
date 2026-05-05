import { loadFragment } from '../fragment/fragment.js';
import {
  isAuthorMode, getPagePath, getIconPath, getCurrentLocale,
} from '../../scripts/utils.js';

function getLocaleUrl(targetLang) {
  const currentLocale = getCurrentLocale();
  const currentPath = window.location.pathname;
  const currentCountry = currentLocale.split('/')[0];

  let newLocale;
  // If current is language-masters, keep it and only change the language
  if (currentCountry === 'language-masters') {
    newLocale = `language-masters/${targetLang}`;
  // Otherwise, build locale from language (en -> us/en, fr -> fr/fr, es -> es/es)
  } else {
    newLocale = targetLang === 'en' ? `us/${targetLang}` : `${targetLang}/${targetLang}`;
  }

  return currentPath.replace(`/${currentLocale}/`, `/${newLocale}/`);
}

function buildLanguageSwitcherHTML(currentLang) {
  const languages = [
    { code: 'en', flag: '🇺🇸', label: 'EN' },
    { code: 'fr', flag: '🇫🇷', label: 'FR' },
  ];

  const currentLanguage = languages.find((lang) => lang.code === currentLang) || languages[0];
  const otherLanguages = languages.filter((lang) => lang.code !== currentLang);

  const dropdownItems = otherLanguages.map((lang) => `<a href="${getLocaleUrl(lang.code)}" class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-brand-600 transition">${lang.flag} ${lang.label}</a>`).join('');

  return `
    <div class="relative language-dropdown">
      <button type="button" class="flex items-center gap-1 text-sm px-3 py-2 h-10 border border-brand-600 text-brand-600 rounded-md hover:bg-brand-50 transition" aria-expanded="false" aria-haspopup="true">
        <span>${currentLanguage.flag} ${currentLanguage.label}</span>
      </button>
      <div class="absolute right-0 mt-1 w-20 bg-white rounded-md shadow-lg border border-gray-200 py-1 hidden z-50 language-dropdown-menu">
        ${dropdownItems}
      </div>
    </div>
  `;
}

function extractMenuItems(fragment) {
  const menuItems = [];
  const menuBlock = fragment.querySelector('.menu');

  if (menuBlock) {
    const items = menuBlock.querySelectorAll(':scope > div');
    items.forEach((item) => {
      const labelEl = item.querySelector('div:first-child');
      const linkEl = item.querySelector('div:nth-child(2) a');

      if (labelEl && linkEl) {
        menuItems.push({
          label: labelEl.textContent.trim(),
          path: linkEl.getAttribute('href'),
        });
      }
    });
  }

  if (!isAuthorMode) {
    menuItems.forEach((item) => {
      item.path = item.path.replace(/\/templates\//, '/pages/');
    });
  }

  return menuItems;
}

function buildNavigationHTML(menuItems) {
  const currentPath = window.location.pathname;

  return menuItems.map((item) => {
    const isActive = currentPath === item.path || currentPath.startsWith(`${item.path}/`);
    const activeClass = isActive ? 'text-brand-600 font-semibold' : 'text-gray-700 hover:text-brand-600';

    return `
      <a href="${item.path}" class="${activeClass} transition">
        ${item.label}
      </a>
    `;
  }).join('');
}

function extractLoginModalData(fragment) {
  const loginModalBlock = fragment.querySelector('.login-modal');
  if (!loginModalBlock) {
    return {
      title: 'Login',
      usernameLabel: 'Username',
      profileTypeLabel: 'Profile Type',
      profileOptions: [],
      cancelButtonLabel: 'Cancel',
    };
  }

  const items = loginModalBlock.querySelectorAll(':scope > div');
  const title = items[0]?.querySelector('div:nth-child(2)')?.textContent.trim() || 'Login';
  const usernameLabel = items[1]?.querySelector('div:nth-child(2)')?.textContent.trim() || 'Username';
  const profileTypeLabel = items[2]?.querySelector('div:nth-child(2)')?.textContent.trim() || 'Profile Type';
  const optionsText = items[3]?.querySelector('div:nth-child(2)')?.textContent.trim() || '';
  const cancelButtonLabel = items[4]?.querySelector('div:nth-child(2)')?.textContent.trim() || 'Cancel';

  const profileOptions = optionsText.split(',').map((option) => {
    const trimmedOption = option.trim();
    // Check if format is "Label=value"
    if (trimmedOption.includes('=')) {
      const [label, value] = trimmedOption.split('=').map((s) => s.trim());
      return { value, label };
    }
    // Otherwise use the old format (label and value are the same)
    return { value: trimmedOption.toLowerCase(), label: trimmedOption };
  }).filter((opt) => opt.value);

  return {
    title, usernameLabel, profileTypeLabel, profileOptions, cancelButtonLabel,
  };
}

export default async function decorate(block) {
  const headerPath = `/${getCurrentLocale()}/header`;
  const fragment = await loadFragment(headerPath);

  const currentLocale = getCurrentLocale();
  const currentLang = currentLocale.split('/')[1];
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
          <div class="flex items-center space-x-3" aria-label="Select language">
            ${buildLanguageSwitcherHTML(currentLang)}
          </div>
          <button class="px-3 py-2 h-10 text-white bg-brand-600 rounded-md hover:bg-brand-700 transition flex items-center justify-center" id="loginBtn" aria-label="Login">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
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
          <div class="flex items-center gap-3">
            <div class="flex items-center space-x-3 flex-1" aria-label="Select language">
              ${buildLanguageSwitcherHTML(currentLang)}
            </div>
            <button class="px-3 py-2 h-10 text-white bg-brand-600 rounded-md hover:bg-brand-700 transition flex items-center justify-center" id="loginBtnMobile" aria-label="Login">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </button>
          </div>
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
                ${loginModalData.profileOptions.map((opt) => `<option value="${opt.value}">${opt.label}</option>`).join('')}
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
  const loginBtnMobile = document.getElementById('loginBtnMobile');
  const loginModal = document.getElementById('loginModal');
  const closeModal = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  const userIconSVG = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
  </svg>`;

  const username = localStorage.getItem('username');
  if (username) {
    loginBtn.innerHTML = `<span class="text-sm">${username}</span>`;
    loginBtnMobile.innerHTML = `<span class="text-sm">${username}</span>`;
  }

  // Open modal function
  function openLoginModal() {
    if (localStorage.getItem('logged')) {
      localStorage.removeItem('logged');
      localStorage.removeItem('username');
      localStorage.removeItem('profileType');
      loginBtn.innerHTML = userIconSVG;
      loginBtnMobile.innerHTML = userIconSVG;
    } else {
      loginModal.classList.remove('hidden');
      loginModal.classList.add('flex');
    }
  }

  // Open modal
  loginBtn.addEventListener('click', openLoginModal);
  loginBtnMobile.addEventListener('click', openLoginModal);

  // Close modal methods
  function closeLoginModal() {
    loginModal.classList.add('hidden');
    loginModal.classList.remove('flex');
  }

  closeModal.addEventListener('click', closeLoginModal);
  cancelBtn.addEventListener('click', closeLoginModal);

  // Close modal when clicking outside
  loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
      closeLoginModal();
    }
  });

  // Mobile menu toggle
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

  // Form submission
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const loginUsername = document.getElementById('username').value;
    const profileType = document.getElementById('profileType').value;

    localStorage.setItem('logged', true);
    localStorage.setItem('username', loginUsername);
    localStorage.setItem('profileType', profileType);
    loginBtn.innerHTML = `<span class="text-sm">${loginUsername}</span>`;
    loginBtnMobile.innerHTML = `<span class="text-sm">${loginUsername}</span>`;
    closeLoginModal();
  });

  // Language dropdown toggle
  document.querySelectorAll('.language-dropdown').forEach((dropdown) => {
    const button = dropdown.querySelector('button');
    const menu = dropdown.querySelector('.language-dropdown-menu');
    const chevron = button.querySelector('svg');

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !menu.classList.contains('hidden');

      // Close all other dropdowns first
      document.querySelectorAll('.language-dropdown-menu').forEach((m) => m.classList.add('hidden'));
      document.querySelectorAll('.language-dropdown button svg').forEach((c) => c.classList.remove('rotate-180'));

      if (!isOpen) {
        menu.classList.remove('hidden');
        chevron.classList.add('rotate-180');
        button.setAttribute('aria-expanded', 'true');
      } else {
        button.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.language-dropdown-menu').forEach((menu) => menu.classList.add('hidden'));
    document.querySelectorAll('.language-dropdown button svg').forEach((chevron) => chevron.classList.remove('rotate-180'));
    document.querySelectorAll('.language-dropdown button').forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
  });
}
