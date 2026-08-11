import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { stripe, generateBookingRef } from '@/lib/stripe/client';
import { computeBookingPrice } from '@/lib/pricing';
import { isBoatAvailable } from '@/lib/availability';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      boatSlug,
      date, // "YYYY-MM-DD"
      period, // "HALF_DAY" | "FULL_DAY"
      withSkipper,
      customerName,
      customerEmail,
      customerPhone,
      customerLocale,
      notes,
    } = body;

    if (!boatSlug || !date || !period || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    if (period !== 'HALF_DAY' && period !== 'FULL_DAY') {
      return NextResponse.json({ error: 'Invalid period' }, { status: 400 });
    }

    const boat = await prisma.boat.findUnique({ where: { slug: boatSlug } });
    if (!boat || !boat.active) {
      return NextResponse.json({ error: 'Boat not found' }, { status: 404 });
    }

    const bookingDate = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(bookingDate.getTime()) || bookingDate.getTime() < Date.now() - 86400000) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
    }

    const available = await isBoatAvailable(boat.id, bookingDate, period);
    if (!available) {
      return NextResponse.json({ error: 'Boat not available on that date' }, { status: 409 });
    }

    // Price is always computed server-side from the current Boat row —
    // whatever the client displayed is a preview, not the source of truth.
    const price = computeBookingPrice(boat, period, Boolean(withSkipper));
    const bookingRef = generateBookingRef();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const locale = ['ca', 'es', 'fr', 'en'].includes(customerLocale) ? customerLocale : 'ca';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Dipòsit - ${boat.name}`,
              description: `${period === 'HALF_DAY' ? 'Mig dia' : 'Dia complet'} · ${date} · Ref: ${bookingRef}`,
            },
            unit_amount: Math.round(price.depositPaid * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingRef,
        boatId: boat.id,
        date,
        period,
        withSkipper: String(Boolean(withSkipper)),
        customerName,
        customerEmail,
        customerPhone,
        customerLocale: locale,
        notes: notes || '',
        boatPrice: String(price.boatPrice),
        skipperPrice: String(price.skipperPrice),
        totalPrice: String(price.totalPrice),
        depositPaid: String(price.depositPaid),
        remainingAmount: String(price.remainingAmount),
        securityDeposit: String(boat.securityDeposit ?? ''),
      },
      success_url: `${appUrl}/booking-success.html?ref=${bookingRef}&remaining=${price.remainingAmount}&locale=${locale}`,
      cancel_url: `${appUrl}/vaixells/${boat.slug}/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
