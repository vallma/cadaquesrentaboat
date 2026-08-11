import { prisma } from '@/lib/db/prisma';

// A boat is booked whole for a given day+period — no per-slot capacity like
// the diving activities have. Only CONFIRMED bookings block a date: rows are
// only ever inserted by the Stripe webhook after payment succeeds, so there
// are no lingering PENDING_PAYMENT rows to worry about.
//
// Known limitation: two customers starting checkout for the same boat/date
// at the same moment can both complete payment, since availability is only
// checked when the checkout session is created, not with a DB lock. Fine at
// this scale (9 boats); revisit if booking volume grows.
export async function isBoatAvailable(
  boatId: string,
  date: Date,
  period: 'HALF_DAY' | 'FULL_DAY'
): Promise<boolean> {
  const dayStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  const conflicting = await prisma.booking.findFirst({
    where: {
      boatId,
      status: 'CONFIRMED',
      date: { gte: dayStart, lt: dayEnd },
      // a FULL_DAY booking blocks the whole day either way; two HALF_DAY
      // bookings on the same date are still treated as a conflict since we
      // don't track AM/PM separately — keeps the model simple for now.
      OR: [{ period: 'FULL_DAY' }, { period }],
    },
  });

  return !conflicting;
}

export async function listBookedDates(boatId: string, monthStart: Date, monthEnd: Date) {
  const bookings = await prisma.booking.findMany({
    where: {
      boatId,
      status: 'CONFIRMED',
      date: { gte: monthStart, lt: monthEnd },
    },
    select: { date: true, period: true },
  });

  return bookings.map((b) => ({
    date: b.date.toISOString().slice(0, 10),
    period: b.period,
  }));
}
