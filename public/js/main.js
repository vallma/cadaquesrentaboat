// ── Site behaviour: nav, FAQ accordion, boat cards, filters ────────────────

const WHATSAPP_NUMBER = '34620288126';

const ICONS = {
  person: '<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>',
  engine: '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M3 12h4l2-3h6l2 3h4"/><path d="M7 12v5h10v-5"/><path d="M12 3v6"/></svg>',
  pin: '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  boat: '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M3 15h18l-2 5H5l-2-5z"/><path d="M6 15V5l6 2 6-2v10"/></svg>',
};

function t(key) {
  const lang = (typeof getLang === 'function') ? getLang() : 'ca';
  const dict = window.TRANSLATIONS && window.TRANSLATIONS[lang];
  return (dict && dict[key]) || key;
}

// ── Mobile nav ───────────────────────────────────────────────────────────
function initNavToggle() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => links.classList.remove('open')));
}

// ── FAQ accordion ────────────────────────────────────────────────────────
function initFaqAccordion() {
  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.closest('.faq-item').classList.toggle('open');
    });
  });
}

// ── Boats data ───────────────────────────────────────────────────────────
let BOATS_CACHE = null;

async function loadBoats() {
  if (BOATS_CACHE) return BOATS_CACHE;
  // /api/boats reflects live admin-edited prices; data/boats.json is the
  // static fallback used before the database is provisioned, or if the API
  // is briefly unavailable.
  try {
    const res = await fetch('/api/boats');
    if (!res.ok) throw new Error('API unavailable');
    BOATS_CACHE = await res.json();
  } catch {
    const res = await fetch('/data/boats.json');
    BOATS_CACHE = await res.json();
  }
  return BOATS_CACHE;
}

function boatCardHtml(boat) {
  const detailHref = `/vaixells/${boat.slug}/`;
  return `
    <article class="boat-card">
      <a href="${detailHref}" class="boat-card-media">
        <img src="${boat.image}" alt="${boat.name}" loading="lazy" />
        <span class="boat-card-badge">${t('search.type.' + boat.type)}</span>
      </a>
      <div class="boat-card-body">
        <h3><a href="${detailHref}">${boat.name}</a></h3>
        <div class="boat-card-location">${ICONS.pin} ${boat.location}</div>
        <div class="boat-specs">
          <span>${ICONS.person} ${boat.capacity} ${t('common.pers')}</span>
          ${boat.hp ? `<span>${ICONS.engine} ${boat.hp} cv</span>` : ''}
          ${!boat.licenseRequired ? `<span>${t('common.noLicense')}</span>` : ''}
        </div>
        <div class="boat-card-footer">
          <div class="boat-price"><small>${t('common.from')}</small>${boat.priceFrom}€</div>
          <span class="btn btn-outline">${t('common.viewDetails')}</span>
        </div>
      </div>
    </article>`;
}

function renderBoatGrid(target, boats) {
  target.innerHTML = boats.length
    ? boats.map(boatCardHtml).join('')
    : `<p class="filter-count">${t('common.noResults')}</p>`;
}

// ── Listing page filters ────────────────────────────────────────────────
function applyFilters(boats, filters) {
  return boats.filter((b) => {
    if (filters.type && filters.type !== 'all' && b.type !== filters.type) return false;
    if (filters.capacity && b.capacity < Number(filters.capacity)) return false;
    if (filters.maxPrice && b.priceFrom > Number(filters.maxPrice)) return false;
    if (filters.license === 'no' && b.licenseRequired) return false;
    if (filters.license === 'yes' && !b.licenseRequired) return false;
    return true;
  });
}

function readQueryFilters() {
  const params = new URLSearchParams(window.location.search);
  return {
    type: params.get('type') || 'all',
    capacity: params.get('capacity') || '',
    maxPrice: params.get('maxPrice') || '',
    license: params.get('license') || 'all',
  };
}

async function initBoatListing() {
  const grid = document.querySelector('[data-boat-grid="all"]');
  if (!grid) return;

  const boats = await loadBoats();
  const form = document.getElementById('filterForm');
  const countEl = document.querySelector('[data-filter-count]');

  function refresh() {
    const filters = form
      ? Object.fromEntries(new FormData(form).entries())
      : readQueryFilters();
    const result = applyFilters(boats, filters);
    renderBoatGrid(grid, result);
    if (countEl) countEl.textContent = `${result.length} ${t('common.boatsFound')}`;
  }

  if (form) {
    const initial = readQueryFilters();
    if (initial.type) form.type.value = initial.type;
    form.addEventListener('input', refresh);
    form.addEventListener('change', refresh);
  }

  document.addEventListener('crb:langchange', refresh);
  refresh();
}

async function initFeaturedBoats() {
  const grid = document.querySelector('[data-boat-grid="featured"]');
  if (!grid) return;
  const boats = await loadBoats();
  const featured = boats.slice(0, 6);
  renderBoatGrid(grid, featured);
  document.addEventListener('crb:langchange', () => renderBoatGrid(grid, featured));
}

// ── Home search widget → redirects to listing with filters ────────────────
function initSearchWidget() {
  const form = document.getElementById('searchWidget');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const params = new URLSearchParams();
    if (data.get('type') && data.get('type') !== 'all') params.set('type', data.get('type'));
    if (data.get('date')) params.set('date', data.get('date'));
    window.location.href = `/vaixells/?${params.toString()}`;
  });
}

// ── WhatsApp deep links ─────────────────────────────────────────────────
function buildWhatsappLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function initWhatsappCtas() {
  document.querySelectorAll('[data-whatsapp-message]').forEach((el) => {
    const key = el.getAttribute('data-whatsapp-message');
    const setHref = () => { el.href = buildWhatsappLink(t(key)); };
    setHref();
    document.addEventListener('crb:langchange', setHref);
  });

  document.querySelectorAll('[data-whatsapp-boat]').forEach((el) => {
    const boatName = el.getAttribute('data-whatsapp-boat');
    const setHref = () => { el.href = buildWhatsappLink(t('whatsapp.boat').replace('{boat}', boatName)); };
    setHref();
    document.addEventListener('crb:langchange', setHref);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initFaqAccordion();
  initSearchWidget();
  initFeaturedBoats();
  initBoatListing();
  initWhatsappCtas();
});
