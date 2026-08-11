// ── Booking widget: lives on each boat detail page ──────────────────────
// Reads the boat's pricing from a JSON <script> tag baked in at generation
// time (see scripts/generate-boat-pages.js), shows a live price estimate,
// checks availability for the picked date, then hands off to Stripe
// Checkout via /api/bookings/create-checkout. The server always recomputes
// the price and re-validates availability — this widget's numbers are a
// preview, not the source of truth.

function initBookingWidget() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  const boatData = JSON.parse(document.getElementById('bookingBoatData').textContent);
  const dateInput = form.querySelector('[name="date"]');
  const periodInputs = form.querySelectorAll('[name="period"]');
  const skipperInput = form.querySelector('[name="withSkipper"]');
  const totalEl = form.querySelector('[data-total]');
  const depositEl = form.querySelector('[data-deposit]');
  const availabilityMsg = form.querySelector('[data-availability-msg]');
  const submitBtn = form.querySelector('button[type="submit"]');
  const formError = form.querySelector('[data-form-error]');

  const today = new Date().toISOString().slice(0, 10);
  dateInput.min = today;

  let availabilityCache = {}; // month -> [{date, period}]
  let dateIsAvailable = true;

  function selectedPeriod() {
    const checked = [...periodInputs].find((i) => i.checked);
    return checked ? checked.value : 'HALF_DAY';
  }

  function updatePriceEstimate() {
    const period = selectedPeriod();
    const boatPrice = period === 'HALF_DAY' ? boatData.priceHalfDay : boatData.priceFullDay;
    const skipperPrice = skipperInput.checked
      ? (period === 'HALF_DAY' ? boatData.skipperHalfDay : boatData.skipperFullDay)
      : 0;
    const total = boatPrice + skipperPrice;
    const deposit = Math.round(total * 0.2 * 100) / 100;
    totalEl.textContent = `${total}€`;
    depositEl.textContent = `${deposit.toFixed(2)}€`;
  }

  async function checkAvailability() {
    const date = dateInput.value;
    if (!date) return;
    const month = date.slice(0, 7);

    availabilityMsg.textContent = t('booking.checking');
    availabilityMsg.style.color = 'var(--ink-soft)';

    if (!availabilityCache[month]) {
      try {
        const res = await fetch(`/api/availability?boatSlug=${boatData.slug}&month=${month}`);
        const data = await res.json();
        availabilityCache[month] = data.booked || [];
      } catch {
        availabilityCache[month] = [];
      }
    }

    const period = selectedPeriod();
    const booked = availabilityCache[month];
    const conflict = booked.some((b) => b.date === date && (b.period === 'FULL_DAY' || b.period === period));
    dateIsAvailable = !conflict;

    if (conflict) {
      availabilityMsg.textContent = t('booking.unavailable');
      availabilityMsg.style.color = 'var(--coral)';
    } else {
      availabilityMsg.textContent = '';
    }
  }

  periodInputs.forEach((input) => input.addEventListener('change', () => {
    updatePriceEstimate();
    checkAvailability();
  }));
  skipperInput.addEventListener('change', updatePriceEstimate);
  dateInput.addEventListener('change', checkAvailability);

  updatePriceEstimate();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.textContent = '';

    if (!dateInput.value) return;
    await checkAvailability();
    if (!dateIsAvailable) return;

    const data = new FormData(form);
    submitBtn.disabled = true;
    submitBtn.textContent = t('booking.redirecting');

    try {
      const res = await fetch('/api/bookings/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boatSlug: boatData.slug,
          date: data.get('date'),
          period: data.get('period'),
          withSkipper: data.get('withSkipper') === 'on',
          customerName: data.get('customerName'),
          customerEmail: data.get('customerEmail'),
          customerPhone: data.get('customerPhone'),
          customerLocale: (typeof getLang === 'function') ? getLang() : 'ca',
          notes: data.get('notes'),
        }),
      });

      const result = await res.json();
      if (res.ok && result.url) {
        window.location.href = result.url;
        return;
      }

      formError.textContent = res.status === 409 ? t('booking.unavailable') : t('booking.error');
    } catch {
      formError.textContent = t('booking.error');
    }

    submitBtn.disabled = false;
    submitBtn.textContent = t('booking.submit');
  });
}

document.addEventListener('DOMContentLoaded', initBookingWidget);
