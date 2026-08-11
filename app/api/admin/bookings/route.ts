import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sendCancellationEmail } from '@/lib/email/mailer';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    include: { boat: true },
    orderBy: { date: 'asc' },
  });

  return NextResponse.json({ bookings });
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { bookingId, status } = await request.json();
  if (!bookingId || !['CONFIRMED', 'CANCELLED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
    include: { boat: true },
  });

  if (status === 'CANCELLED') {
    try {
      await sendCancellationEmail({
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
        depositPaid: booking.depositPaid,
        locale: booking.customerLocale,
      });
    } catch (err) {
      console.error('Error sending cancellation email:', err);
    }
  }

  return NextResponse.json({ booking });
}
