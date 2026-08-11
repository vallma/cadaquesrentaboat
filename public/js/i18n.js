// ── i18n engine ──────────────────────────────────────────────────────────
// Reads/writes the active language, applies TRANSLATIONS (defined per-page
// in js/translations.js) to any element carrying a data-i18n* attribute.

const LANGS = ['ca', 'es', 'fr', 'en'];
const DEFAULT_LANG = 'ca';
const LANG_STORAGE_KEY = 'crb-lang';

function detectInitialLang() {
  const stored = localStorage.getItem(LANG_STORAGE_KEY);
  if (stored && LANGS.includes(stored)) return stored;

  const browserLang = (navigator.language || '').slice(0, 2);
  return LANGS.includes(browserLang) ? browserLang : DEFAULT_LANG;
}

function applyTranslations(lang) {
  const dict = window.TRANSLATIONS && window.TRANSLATIONS[lang];
  if (!dict) return;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) el.textContent = dict[key];
  });

  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    if (dict[key] !== undefined) el.innerHTML = dict[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key] !== undefined) el.setAttribute('placeholder', dict[key]);
  });

  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria-label');
    if (dict[key] !== undefined) el.setAttribute('aria-label', dict[key]);
  });

  document.documentElement.setAttribute('lang', lang);
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  document.dispatchEvent(new CustomEvent('crb:langchange', { detail: { lang } }));
}

function setLang(lang) {
  if (!LANGS.includes(lang)) return;
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  applyTranslations(lang);
}

function getLang() {
  return localStorage.getItem(LANG_STORAGE_KEY) || DEFAULT_LANG;
}

function initI18n() {
  const lang = detectInitialLang();
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  applyTranslations(lang);

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
}

document.addEventListener('DOMContentLoaded', initI18n);
