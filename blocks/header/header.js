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
  const menuBlock = fragment.querySelector('.menu.block');

  if (menuBlock) {
    const items = menuBlock.querySelectorAll(':scope > div');
    items.forEach(item => {
      const labelEl = item.querySelector('div:first-child p');
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
    <div class="nav-item">
      <a href="${item.path}" class="nav-link" aria-haspopup="true" aria-expanded="false">
        ${item.label}
      </a>
    </div>
  `).join('');
}

function extractLoginModalData(fragment) {
  const loginModalBlock = fragment.querySelector('.login-modal.block');
  const items = loginModalBlock.querySelectorAll(':scope > div');
  const title = items[0]?.querySelector('p')?.textContent.trim() || 'Login';
  const usernameLabel = items[1]?.querySelector('p')?.textContent.trim() || 'Username';
  const profileTypeLabel = items[2]?.querySelector('p')?.textContent.trim() || 'Profile Type';
  const optionsText = items[3]?.querySelector('p')?.textContent.trim() || '';
  const cancelButtonLabel = items[4]?.querySelector('p')?.textContent.trim() || 'Cancel';

  const profileOptions = optionsText.split(',').map(option => {
    const [value, label] = option.split('=');
    return { value: value?.trim(), label: label?.trim() };
  }).filter(opt => opt.value && opt.label);

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
    <div class="header" role="banner" aria-label="Main Navigation">
      <button class="mobile-menu-btn" aria-expanded="false" aria-controls="main-navigation" aria-label="Toggle menu">
        <div class="mobile-menu-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      
      <a href="${getPagePath(`/${currentLocale}/home`)}" class="logo-link" aria-label="Home">
        <img src="${getIconPath('logo.svg')}" alt="Logo" class="logo">
      </a>
      
      <nav id="main-navigation" class="main-nav" role="navigation" aria-label="Main Navigation">
        ${navigationHTML}
      </nav>
      
      <div class="right-nav">
        <div class="locale-switcher">
          <select class="locale-select" id="localeSelect" aria-label="Select language">
            <option value="us/en" ${currentLocale === 'us/en' ? 'selected' : ''}>🇺🇸 EN</option>
            <option value="fr/fr" ${currentLocale === 'fr/fr' ? 'selected' : ''}>🇫🇷 FR</option>
            <option value="es/es" ${currentLocale === 'es/es' ? 'selected' : ''}>🇪🇸 ES</option>
          </select>
        </div>
        <button class="login-btn" id="loginBtn" aria-label="Login">
          <img src="${getIconPath('not-logged.svg')}" alt="User not logged"></img>
        </button>
      </div>
    </div>

    <div class="modal-overlay" id="loginModal">
    <div class="modal" role="dialog" aria-labelledby="loginModalTitle">
      <div class="modal-header">
        <h2 class="modal-title" id="loginModalTitle">${loginModalData.title}</h2>
        <button class="modal-close" id="closeModal" aria-label="Close modal">&times;</button>
      </div>
      <div class="modal-body">
        <form id="loginForm">
          <div class="form-group">
            <label for="username" class="form-label">${loginModalData.usernameLabel}</label>
            <input type="text" id="username" class="form-input" required>
          </div>
          <div class="form-group">
            <label for="profileType" class="form-label">${loginModalData.profileTypeLabel}</label>
            <select id="profileType" class="form-select" required>
              ${loginModalData.profileOptions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
            </select>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-cancel" id="cancelBtn">${loginModalData.cancelButtonLabel}</button>
        <button type="submit" form="loginForm" class="btn btn-login">${loginModalData.title}</button>
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
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mainNav = document.querySelector('.main-nav');
  const localeSelect = document.getElementById('localeSelect');

  const username = localStorage.getItem('username');
  if (username) { 
      loginBtn.innerHTML = `<img src="${getIconPath('logged.svg')}" alt="User logged"></img><span>${username}</span>`;
  }

  // Open modal
  loginBtn.addEventListener('click', function() {
    if (localStorage.getItem('logged')) {
        localStorage.removeItem('logged');
        localStorage.removeItem('username');
        localStorage.removeItem('profileType');
        loginBtn.innerHTML = `<img src="${getIconPath('not-logged.svg')}" alt="User not logged"></img>`;
    } else {
      loginModal.classList.add('active');
    }
  });
  
  // Close modal methods
  function closeLoginModal() {
    loginModal.classList.remove('active');
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
    mainNav.classList.toggle('active');
    const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
    mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
  });
  
  // Form submission
  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const profileType = document.getElementById('profileType').value;

    localStorage.setItem('logged', true);
    localStorage.setItem('username', username);
    localStorage.setItem('profileType', profileType);
    loginBtn.innerHTML = `<img src="${getIconPath('logged.svg')}" alt="User logged"></img><span>${username}</span>`;
    closeLoginModal();
  });

  // Locale switcher
  localeSelect.addEventListener('change', function() {
    const targetLocale = this.value;
    if (targetLocale !== currentLocale) {
      switchLocale(targetLocale);
    }
  });
}
