import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { prisma } from '@/lib/db/prisma';
import { sendBookingConfirmation } from '@/lib/email/mailer';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature error:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata!;

    try {
      const securityDeposit = meta.securityDeposit ? Number(meta.securityDeposit) : null;

      const booking = await prisma.booking.create({
        data: {
          bookingRef: meta.bookingRef,
          boatId: meta.boatId,
          date: new Date(`${meta.date}T00:00:00.000Z`),
          period: meta.period,
          status: 'CONFIRMED',
          withSkipper: meta.withSkipper === 'true',
          boatPrice: Number(meta.boatPrice),
          skipperPrice: Number(meta.skipperPrice),
          totalPrice: Number(meta.totalPrice),
          depositPaid: Number(meta.depositPaid),
          remainingAmount: Number(meta.remainingAmount),
          securityDeposit,
          customerName: meta.customerName,
          customerEmail: meta.customerEmail,
          customerPhone: meta.customerPhone,
          customerLocale: meta.customerLocale,
          notes: meta.notes || null,
          stripeSessionId: session.id,
          stripePaymentId: session.payment_intent as string,
        },
        include: { boat: true },
      });

      await sendBookingConfirmation({
        bookingRef: booking.bookingRef,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        boatName: booking.boat.name,
        date: booking.date.toLocaleDateString('ca-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'UTC',
        }),
        period: booking.period as 'HALF_DAY' | 'FULL_DAY',
        withSkipper: booking.withSkipper,
        totalPrice: booking.totalPrice,
        depositPaid: booking.depositPaid,
        remainingAmount: booking.remainingAmount,
        securityDeposit: booking.securityDeposit,
        locale: booking.customerLocale,
      });

      console.log(`✅ Booking created: ${booking.bookingRef}`);
    } catch (error) {
      console.error('Error processing webhook:', error);
      return NextResponse.json({ error: 'Processing error' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
