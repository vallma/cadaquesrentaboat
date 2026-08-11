import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

type Locale = 'ca' | 'es' | 'fr' | 'en';

interface BookingEmailData {
  bookingRef: string;
  customerName: string;
  customerEmail: string;
  boatName: string;
  date: string;
  period: 'HALF_DAY' | 'FULL_DAY';
  withSkipper: boolean;
  totalPrice: number;
  depositPaid: number;
  remainingAmount: number;
  securityDeposit: number | null;
  locale: string;
}

const translations: Record<Locale, Record<string, string | ((...args: string[]) => string)>> = {
  ca: {
    subject: (ref: string) => `Reserva confirmada ${ref} - Rent A Boat Cadaqués`,
    greeting: (name: string) => `Hola ${name},`,
    confirmed: 'La teva reserva està confirmada!',
    boat: 'Embarcació',
    date: 'Data',
    period: 'Torn',
    halfDay: 'Mig dia',
    fullDay: 'Dia complet',
    skipper: 'Amb patró',
    totalPrice: 'Preu total',
    depositPaid: 'Dipòsit pagat',
    remaining: 'Resta a pagar abans de la sortida',
    securityDeposit: 'Fiança de seguretat (es paga al recollir la barca)',
    contact: 'Contacte',
    seeYou: 'Ens veiem al mar!',
    team: "L'equip de Rent A Boat Cadaqués",
    adminSubject: (ref: string) => `Nova reserva ${ref}`,
    adminTitle: 'Nova reserva rebuda',
  },
  es: {
    subject: (ref: string) => `Reserva confirmada ${ref} - Rent A Boat Cadaqués`,
    greeting: (name: string) => `Hola ${name},`,
    confirmed: '¡Tu reserva está confirmada!',
    boat: 'Embarcación',
    date: 'Fecha',
    period: 'Turno',
    halfDay: 'Medio día',
    fullDay: 'Día completo',
    skipper: 'Con patrón',
    totalPrice: 'Precio total',
    depositPaid: 'Depósito pagado',
    remaining: 'Resto a pagar antes de la salida',
    securityDeposit: 'Fianza de seguridad (se paga al recoger la barca)',
    contact: 'Contacto',
    seeYou: '¡Nos vemos en el mar!',
    team: 'El equipo de Rent A Boat Cadaqués',
    adminSubject: (ref: string) => `Nueva reserva ${ref}`,
    adminTitle: 'Nueva reserva recibida',
  },
  en: {
    subject: (ref: string) => `Booking confirmed ${ref} - Rent A Boat Cadaqués`,
    greeting: (name: string) => `Hello ${name},`,
    confirmed: 'Your booking is confirmed!',
    boat: 'Boat',
    date: 'Date',
    period: 'Slot',
    halfDay: 'Half day',
    fullDay: 'Full day',
    skipper: 'With skipper',
    totalPrice: 'Total price',
    depositPaid: 'Deposit paid',
    remaining: 'Remaining to pay before departure',
    securityDeposit: 'Security deposit (paid when picking up the boat)',
    contact: 'Contact',
    seeYou: 'See you at sea!',
    team: 'The Rent A Boat Cadaqués team',
    adminSubject: (ref: string) => `New booking ${ref}`,
    adminTitle: 'New booking received',
  },
  fr: {
    subject: (ref: string) => `Réservation confirmée ${ref} - Rent A Boat Cadaqués`,
    greeting: (name: string) => `Bonjour ${name},`,
    confirmed: 'Votre réservation est confirmée !',
    boat: 'Bateau',
    date: 'Date',
    period: 'Créneau',
    halfDay: 'Demi-journée',
    fullDay: 'Journée complète',
    skipper: 'Avec skipper',
    totalPrice: 'Prix total',
    depositPaid: 'Acompte payé',
    remaining: 'Reste à payer avant le départ',
    securityDeposit: 'Caution de sécurité (payée au retrait du bateau)',
    contact: 'Contact',
    seeYou: 'À bientôt en mer !',
    team: "L'équipe de Rent A Boat Cadaqués",
    adminSubject: (ref: string) => `Nouvelle réservation ${ref}`,
    adminTitle: 'Nouvelle réservation reçue',
  },
};

function t(locale: Locale, key: string, ...args: string[]): string {
  const entry = translations[locale]?.[key] ?? translations.ca[key];
  return typeof entry === 'function' ? entry(...args) : entry;
}

function buildEmailHtml(data: BookingEmailData, locale: Locale): string {
  const periodLabel = t(locale, data.period === 'HALF_DAY' ? 'halfDay' : 'fullDay');
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #012840, #023a5c); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; }
    .body { padding: 30px; }
    .greeting { font-size: 18px; color: #1e293b; margin-bottom: 8px; }
    .confirmed { font-size: 22px; font-weight: bold; color: #012840; margin-bottom: 24px; }
    .booking-card { background: #f5f1ea; border: 1px solid #e8e0d1; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .booking-ref { background: #012840; color: white; display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; margin-bottom: 16px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e8e0d1; }
    .row:last-child { border-bottom: none; }
    .label { color: #64748b; font-size: 14px; }
    .value { color: #1e293b; font-weight: 600; font-size: 14px; }
    .price-box { background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .price-total { font-size: 18px; font-weight: bold; color: #059669; }
    .price-deposit { color: #10b981; font-size: 14px; }
    .price-remaining { color: #cc3366; font-weight: 600; font-size: 14px; margin-top: 4px; }
    .contact-box { background: #fafafa; border-radius: 8px; padding: 16px; margin-top: 20px; font-size: 14px; color: #475569; }
    .footer { background: #f8fafc; padding: 20px 30px; text-align: center; font-size: 13px; color: #94a3b8; }
    .logo-text { font-size: 20px; font-weight: bold; color: white; letter-spacing: 1px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-text">⛵ RENT A BOAT CADAQUÉS</div>
      <p>Cap de Creus Natural Park · Cadaqués, España</p>
    </div>
    <div class="body">
      <p class="greeting">${t(locale, 'greeting', data.customerName)}</p>
      <p class="confirmed">✅ ${t(locale, 'confirmed')}</p>

      <div class="booking-card">
        <span class="booking-ref">${data.bookingRef}</span>
        <div class="row"><span class="label">${t(locale, 'boat')}</span><span class="value">${data.boatName}</span></div>
        <div class="row"><span class="label">${t(locale, 'date')}</span><span class="value">${data.date}</span></div>
        <div class="row"><span class="label">${t(locale, 'period')}</span><span class="value">${periodLabel}${data.withSkipper ? ` · ${t(locale, 'skipper')}` : ''}</span></div>
      </div>

      <div class="price-box">
        <div class="price-total">${t(locale, 'totalPrice')}: ${data.totalPrice.toFixed(2)}€</div>
        <div class="price-deposit">✅ ${t(locale, 'depositPaid')}: ${data.depositPaid.toFixed(2)}€</div>
        <div class="price-remaining">⚠️ ${t(locale, 'remaining')}: ${data.remainingAmount.toFixed(2)}€</div>
      </div>

      ${data.securityDeposit ? `<div class="contact-box">💶 ${t(locale, 'securityDeposit')}: <strong>${data.securityDeposit.toFixed(2)}€</strong></div>` : ''}

      <div class="contact-box">
        📍 Port Lligat, Cadaqués<br>
        📞 +34 620 28 81 26<br>
        📧 cdqrentsl@gmail.com
      </div>

      <p style="margin-top: 24px; color: #475569;">
        ${t(locale, 'seeYou')}<br><br>
        <strong>${t(locale, 'team')}</strong>
      </p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Rent A Boat Cadaqués · Cadaqués, España
    </div>
  </div>
</body>
</html>
  `;
}

export async function sendBookingConfirmation(data: BookingEmailData) {
  const locale = (['ca', 'es', 'en', 'fr'].includes(data.locale) ? data.locale : 'ca') as Locale;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: data.customerEmail,
    subject: t(locale, 'subject', data.bookingRef),
    html: buildEmailHtml(data, locale),
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_USER,
    subject: t('ca', 'adminSubject', data.bookingRef),
    html: `
      <h2>${t('ca', 'adminTitle')}</h2>
      <p><strong>Ref:</strong> ${data.bookingRef}</p>
      <p><strong>Client:</strong> ${data.customerName} (${data.customerEmail})</p>
      <p><strong>Embarcació:</strong> ${data.boatName}</p>
      <p><strong>Data:</strong> ${data.date} · ${data.period === 'HALF_DAY' ? 'Mig dia' : 'Dia complet'}${data.withSkipper ? ' · amb patró' : ''}</p>
      <p><strong>Total:</strong> ${data.totalPrice.toFixed(2)}€</p>
      <p><strong>Dipòsit cobrat:</strong> ${data.depositPaid.toFixed(2)}€</p>
      <p><strong>Pendent:</strong> ${data.remainingAmount.toFixed(2)}€</p>
      ${data.securityDeposit ? `<p><strong>Fiança a cobrar en persona:</strong> ${data.securityDeposit.toFixed(2)}€</p>` : ''}
    `,
  });
}

interface CancellationEmailData {
  bookingRef: string;
  customerName: string;
  customerEmail: string;
  boatName: string;
  date: string;
  depositPaid: number;
  locale: string;
}

const cancellationTranslations: Record<Locale, Record<string, string | ((ref: string) => string)>> = {
  ca: {
    subject: (ref: string) => `Reserva cancel·lada ${ref} - Rent A Boat Cadaqués`,
    title: 'La teva reserva ha estat cancel·lada',
    body: 'Lamentem informar-te que la teva reserva ha estat cancel·lada.',
    refund: "Si has pagat un dipòsit, ens posarem en contacte per gestionar el reemborsament.",
    contact: 'Si tens algun dubte, escriu-nos a cdqrentsl@gmail.com o al +34 620 28 81 26.',
    sorry: "Esperem veure't aviat,",
    team: "L'equip de Rent A Boat Cadaqués",
  },
  es: {
    subject: (ref: string) => `Reserva cancelada ${ref} - Rent A Boat Cadaqués`,
    title: 'Tu reserva ha sido cancelada',
    body: 'Lamentamos informarte de que tu reserva ha sido cancelada.',
    refund: 'Si has realizado un pago de depósito, nos pondremos en contacto para gestionar el reembolso.',
    contact: 'Si tienes alguna pregunta, contáctanos en cdqrentsl@gmail.com o al +34 620 28 81 26.',
    sorry: 'Esperamos verte pronto,',
    team: 'El equipo de Rent A Boat Cadaqués',
  },
  en: {
    subject: (ref: string) => `Booking cancelled ${ref} - Rent A Boat Cadaqués`,
    title: 'Your booking has been cancelled',
    body: 'We regret to inform you that your booking has been cancelled.',
    refund: 'If you paid a deposit, we will contact you to arrange a refund.',
    contact: 'If you have any questions, contact us at cdqrentsl@gmail.com or +34 620 28 81 26.',
    sorry: 'We hope to see you soon,',
    team: 'The Rent A Boat Cadaqués team',
  },
  fr: {
    subject: (ref: string) => `Réservation annulée ${ref} - Rent A Boat Cadaqués`,
    title: 'Votre réservation a été annulée',
    body: 'Nous regrettons de vous informer que votre réservation a été annulée.',
    refund: 'Si vous avez payé un acompte, nous vous contacterons pour organiser un remboursement.',
    contact: 'Pour toute question, contactez-nous à cdqrentsl@gmail.com ou au +34 620 28 81 26.',
    sorry: 'Nous espérons vous voir bientôt,',
    team: "L'équipe de Rent A Boat Cadaqués",
  },
};

export async function sendCancellationEmail(data: CancellationEmailData) {
  const locale = (['ca', 'es', 'en', 'fr'].includes(data.locale) ? data.locale : 'ca') as Locale;
  const c = cancellationTranslations[locale];
  const subject = typeof c.subject === 'function' ? c.subject(data.bookingRef) : '';

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: data.customerEmail,
    subject,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
  body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
  .header { background: linear-gradient(135deg, #64748b, #475569); padding: 40px 30px; text-align: center; }
  .logo-text { font-size: 20px; font-weight: bold; color: white; }
  .body { padding: 30px; }
  .title { font-size: 22px; font-weight: bold; color: #dc2626; margin-bottom: 16px; }
  .booking-ref { background: #f1f5f9; border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-family: monospace; font-size: 18px; font-weight: bold; color: #475569; }
  .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
  .contact { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin-top: 20px; font-size: 14px; color: #166534; }
  .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 13px; color: #94a3b8; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="logo-text">⛵ RENT A BOAT CADAQUÉS</div>
    <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px">Cap de Creus Natural Park · Cadaqués</p>
  </div>
  <div class="body">
    <div class="title">❌ ${c.title}</div>
    <p style="color:#475569;">${c.body}</p>
    <div class="booking-ref">${data.bookingRef}</div>
    <div class="info-row"><span style="color:#64748b">${t(locale, 'boat')}</span><span style="font-weight:600">${data.boatName}</span></div>
    <div class="info-row"><span style="color:#64748b">${t(locale, 'date')}</span><span style="font-weight:600">${data.date}</span></div>
    ${data.depositPaid > 0 ? `<p style="margin-top:16px;color:#b45309;font-size:14px;">💰 ${c.refund}</p>` : ''}
    <div class="contact">📞 ${c.contact}</div>
    <p style="margin-top:24px;color:#475569;font-size:14px;">${c.sorry}<br><br><strong>${c.team}</strong></p>
  </div>
  <div class="footer">© ${new Date().getFullYear()} Rent A Boat Cadaqués · Cadaqués, España</div>
</div>
</body>
</html>
    `,
  });
}
