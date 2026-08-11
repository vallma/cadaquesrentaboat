// One-off generator: reads data/boats.json and writes a static
// vaixells/{slug}/index.html for each boat. Not part of the site runtime —
// re-run manually after editing data/boats.json, then delete the output
// review diff if content review is needed.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'public');
const boats = JSON.parse(fs.readFileSync(path.join(root, 'data/boats.json'), 'utf8'));

const HEADER = (activeHref) => `
  <header class="site-header">
    <nav class="nav">
      <a href="/" class="nav-logo">Rent A Boat <span>Cadaqués</span></a>
      <ul class="nav-links" id="navLinks">
        <li><a href="/vaixells/" class="${activeHref === '/vaixells/' ? 'active' : ''}" data-i18n="nav.boats">Embarcacions</a></li>
        <li><a href="/experiencies/" data-i18n="nav.experiences">Experiències</a></li>
        <li><a href="/preguntes-frequents/" data-i18n="nav.faq">FAQs</a></li>
        <li><a href="/contacte/" data-i18n="nav.contact">Contacte</a></li>
      </ul>
      <div class="nav-actions">
        <div class="lang-switcher">
          <button class="lang-btn" data-lang="ca">CA</button>
          <button class="lang-btn" data-lang="es">ES</button>
          <button class="lang-btn" data-lang="fr">FR</button>
          <button class="lang-btn" data-lang="en">EN</button>
        </div>
        <a href="#" class="btn btn-whatsapp" data-whatsapp-message="whatsapp.generic" target="_blank" rel="noopener" data-i18n="nav.book">Reservar</a>
        <button class="nav-toggle" id="navToggle" aria-label="Menú"><span></span><span></span><span></span></button>
      </div>
    </nav>
  </header>`;

const FOOTER = `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="footer-logo">Rent A Boat <span>Cadaqués</span></div>
          <p data-i18n="footer.tagline">Lloguer d'embarcacions a Cadaqués i Port Lligat, al cor del Parc Natural del Cap de Creus.</p>
          <div class="footer-social">
            <a href="https://wa.me/34620288126" target="_blank" rel="noopener" aria-label="WhatsApp"><svg class="icon-svg" viewBox="0 0 24 24" style="width:18px;height:18px;"><path d="M20 12a8 8 0 1 1-3.6-6.7L20 4l-1.2 3.7A7.9 7.9 0 0 1 20 12z"/><path d="M8.5 9.5c0 4 3 6.5 6 6.5"/></svg></a>
            <a href="https://www.instagram.com/cadaquesrentaboat/" target="_blank" rel="noopener" aria-label="Instagram"><svg class="icon-svg" viewBox="0 0 24 24" style="width:18px;height:18px;"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg></a>
          </div>
        </div>
        <div>
          <h4 data-i18n="footer.explore">Explora</h4>
          <div class="footer-links">
            <a href="/vaixells/" data-i18n="nav.boats">Embarcacions</a>
            <a href="/experiencies/" data-i18n="nav.experiences">Experiències</a>
            <a href="/preguntes-frequents/" data-i18n="nav.faq">FAQs</a>
            <a href="/contacte/" data-i18n="nav.contact">Contacte</a>
          </div>
        </div>
        <div>
          <h4 data-i18n="footer.contact">Contacte</h4>
          <div class="footer-links">
            <a href="https://wa.me/34620288126" target="_blank" rel="noopener">WhatsApp: +34 620 28 81 26</a>
            <a href="mailto:cdqrentsl@gmail.com">cdqrentsl@gmail.com</a>
            <span>Port Lligat, Cadaqués</span>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 Cadaqués Rent a Boat — <span data-i18n="footer.rights">Tots els drets reservats.</span></span>
      </div>
    </div>
  </footer>

  <script src="/js/translations.js"></script>
  <script src="/js/boat-translations.js"></script>
  <script src="/js/i18n.js"></script>
  <script src="/js/main.js"></script>`;

const SCRIPTS_HEAD = `
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Roboto+Slab:wght@600;700&display=swap" rel="stylesheet" />
  <link rel="icon" href="/img/logo.png" type="image/png" />
  <link rel="stylesheet" href="/css/style.css" />`;

function fuelKey(fuelIncluded) {
  if (fuelIncluded === 'zone') return 'common.fuelIncludedZone';
  return fuelIncluded ? 'common.fuelIncluded' : 'common.fuelNotIncluded';
}

function galleryHtml(boat) {
  const imgs = boat.images.slice(0, 3);
  while (imgs.length < 3) imgs.push(imgs[imgs.length - 1]);
  return `<div class="gallery">
        <img src="${imgs[0]}" alt="${boat.name}" />
        <img src="${imgs[1]}" alt="${boat.name}" />
        <img src="${imgs[2]}" alt="${boat.name}" />
      </div>`;
}

function includedHtml(boat) {
  const items = [];
  for (let i = 1; i <= 8; i += 1) {
    const key = `boat.${boat.slug}.inc${i}`;
    items.push(key);
  }
  // We don't know at generation time how many inc keys exist per boat in
  // translations.js, so we cap generously and let the template stop after
  // the boat's actual item count (tracked alongside boats.json below).
  return items;
}

const INCLUDED_COUNTS = {
  'beneteau-antares': 8,
  'chups-llaut-tradicional': 3,
  'llaut-junquet': 1,
  'llaut-passanella': 3,
  'minola': 4,
  'nurat-llaut-4m': 6,
  'ray': 4,
  'selva-470': 5,
  'talaia': 3,
};

boats.forEach((boat) => {
  const count = INCLUDED_COUNTS[boat.slug] || 0;
  const includedLis = Array.from({ length: count }, (_, i) =>
    `<li data-i18n="boat.${boat.slug}.inc${i + 1}"></li>`
  ).join('\n            ');

  const depositBlock = boat.deposit
    ? `<p class="booking-note"><strong data-i18n="detail.securityDeposit">Fiança de seguretat</strong>: ${boat.deposit}€</p>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="ca">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="description" content="${boat.name} — lloguer a ${boat.location}. ${boat.capacity} persones, ${boat.hp} cv." />
  <title>${boat.name} – Rent A Boat Cadaqués</title>
${SCRIPTS_HEAD}
</head>
<body>
${HEADER('/vaixells/')}

  <section class="boat-hero">
    <div class="container">
      <p class="breadcrumb"><a href="/vaixells/" data-i18n="detail.back">Totes les embarcacions</a> / ${boat.name}</p>
      ${galleryHtml(boat)}
      <div class="detail-layout">
        <div class="detail-main">
          <h1>${boat.name}</h1>
          <p class="detail-location">${boat.location} · <span data-i18n="boat.${boat.slug}.tagline"></span></p>

          <div class="detail-specs">
            <div class="detail-spec">
              <span class="label" data-i18n="common.capacity">Capacitat</span>
              <span class="value">${boat.capacity} <span data-i18n="common.pers">pers.</span></span>
            </div>
            <div class="detail-spec">
              <span class="label" data-i18n="common.power">Potència</span>
              <span class="value">${boat.hp} cv</span>
            </div>
            <div class="detail-spec">
              <span class="label" data-i18n="common.length">Eslora</span>
              <span class="value">${boat.lengthM} m</span>
            </div>
            <div class="detail-spec">
              <span class="label" data-i18n="common.license">Llicència</span>
              <span class="value" data-i18n="${boat.licenseRequired ? 'common.licenseYes' : 'common.licenseNo'}"></span>
            </div>
            <div class="detail-spec">
              <span class="label" data-i18n="common.fuel">Combustible</span>
              <span class="value" data-i18n="${fuelKey(boat.fuelIncluded)}"></span>
            </div>
          </div>

          <p data-i18n="boat.${boat.slug}.desc"></p>

          <h2 data-i18n="detail.included">Què inclou</h2>
          <ul class="included-list">
            ${includedLis}
          </ul>
        </div>

        <aside class="booking-card">
          <div class="price">${boat.priceHalfDay}€ <small data-i18n="common.halfDay">Mig dia</small></div>
          <div class="price" style="font-size:1.2rem; margin-top:.3rem;">${boat.priceFullDay}€ <small data-i18n="common.fullDay">Dia complet</small></div>
          ${depositBlock}
          <p class="booking-note" data-i18n="detail.skipperNote"></p>
          <p class="booking-note" data-i18n="detail.depositNote"></p>

          <h3 style="margin-top:1.2rem; font-size:1.05rem;" data-i18n="booking.title">Reserva aquesta barca</h3>
          <form id="bookingForm">
            <div class="field">
              <label for="bookingDate" data-i18n="booking.date">Data</label>
              <input type="date" id="bookingDate" name="date" required />
            </div>
            <div class="field">
              <label data-i18n="booking.period">Torn</label>
              <div class="radio-row">
                <label><input type="radio" name="period" value="HALF_DAY" checked /> <span data-i18n="common.halfDay">Mig dia</span></label>
                <label><input type="radio" name="period" value="FULL_DAY" /> <span data-i18n="common.fullDay">Dia complet</span></label>
              </div>
            </div>
            <div class="field">
              <label class="checkbox-label"><input type="checkbox" name="withSkipper" /> <span data-i18n="booking.skipper">Amb patró</span></label>
            </div>
            <p class="booking-note" data-availability-msg style="min-height:1.1em;"></p>

            <div class="field">
              <label for="bookingName" data-i18n="booking.name">Nom complet</label>
              <input type="text" id="bookingName" name="customerName" required />
            </div>
            <div class="field">
              <label for="bookingEmail" data-i18n="booking.email">Correu electrònic</label>
              <input type="email" id="bookingEmail" name="customerEmail" required />
            </div>
            <div class="field">
              <label for="bookingPhone" data-i18n="booking.phone">Telèfon</label>
              <input type="tel" id="bookingPhone" name="customerPhone" required />
            </div>
            <div class="field">
              <label for="bookingNotes" data-i18n="booking.notes">Comentaris (opcional)</label>
              <input type="text" id="bookingNotes" name="notes" />
            </div>

            <div class="booking-price-row">
              <span data-i18n="booking.totalLabel">Total</span>
              <strong data-total>${boat.priceHalfDay}€</strong>
            </div>
            <div class="booking-price-row">
              <span data-i18n="booking.depositLabel">Dipòsit a pagar ara (20%)</span>
              <strong data-deposit>${(boat.priceHalfDay * 0.2).toFixed(2)}€</strong>
            </div>

            <p class="form-error" data-form-error></p>
            <button type="submit" class="btn btn-accent btn-block" style="margin-top:0.6rem;" data-i18n="booking.submit">Reservar i pagar dipòsit</button>
          </form>

          <p class="booking-note">
            <a href="#" data-whatsapp-boat="${boat.name}" target="_blank" rel="noopener" data-i18n="booking.orWhatsapp">o escriu-nos per WhatsApp</a>
          </p>

          <script type="application/json" id="bookingBoatData">${JSON.stringify({
            slug: boat.slug,
            priceHalfDay: boat.priceHalfDay,
            priceFullDay: boat.priceFullDay,
            skipperHalfDay: 100,
            skipperFullDay: 180,
          })}</script>
        </aside>
      </div>

      <div style="margin-top:var(--space-xl); padding-top:var(--space-lg); border-top:1px solid var(--line); max-width:70ch;">
        <h2 data-i18n="detail.cancelTitle">Cancel·lació i garantia meteorològica</h2>
        <p data-i18n="detail.cancelText"></p>
      </div>
    </div>
  </section>
${FOOTER}
  <script src="/js/booking.js"></script>
</body>
</html>
`;

  const outDir = path.join(root, 'vaixells', boat.slug);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
  console.log(`→ vaixells/${boat.slug}/index.html`);
});

console.log(`Done. Generated ${boats.length} boat pages.`);
