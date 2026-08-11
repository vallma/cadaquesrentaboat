import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import AdminDashboard from '@/components/admin/AdminDashboard';
import './admin.css';

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  const [bookings, boats] = await Promise.all([
    prisma.booking.findMany({
      include: { boat: true },
      orderBy: { date: 'desc' },
      take: 100,
    }),
    prisma.boat.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return (
    <AdminDashboard
      bookings={bookings.map((b) => ({
        id: b.id,
        bookingRef: b.bookingRef,
        customerName: b.customerName,
        customerEmail: b.customerEmail,
        customerPhone: b.customerPhone,
        status: b.status,
        date: b.date.toISOString(),
        period: b.period,
        withSkipper: b.withSkipper,
        totalPrice: b.totalPrice,
        depositPaid: b.depositPaid,
        remainingAmount: b.remainingAmount,
        boatName: b.boat.name,
        notes: b.notes,
      }))}
      boats={boats.map((b) => ({
        id: b.id,
        slug: b.slug,
        name: b.name,
        priceHalfDay: b.priceHalfDay,
        priceFullDay: b.priceFullDay,
        skipperHalfDay: b.skipperHalfDay,
        skipperFullDay: b.skipperFullDay,
        securityDeposit: b.securityDeposit,
        active: b.active,
      }))}
    />
  );
}
