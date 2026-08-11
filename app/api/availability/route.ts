import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { listBookedDates } from '@/lib/availability';

export const dynamic = 'force-dynamic';

// Public: GET /api/availability?boatSlug=talaia&month=2026-08
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const boatSlug = searchParams.get('boatSlug');
  const month = searchParams.get('month'); // "YYYY-MM"

  if (!boatSlug || !month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: 'Missing or invalid params' }, { status: 400 });
  }

  const boat = await prisma.boat.findUnique({ where: { slug: boatSlug } });
  if (!boat) {
    return NextResponse.json({ error: 'Boat not found' }, { status: 404 });
  }

  const [year, monthNum] = month.split('-').map(Number);
  const monthStart = new Date(Date.UTC(year, monthNum - 1, 1));
  const monthEnd = new Date(Date.UTC(year, monthNum, 1));

  const booked = await listBookedDates(boat.id, monthStart, monthEnd);
  return NextResponse.json({ booked });
}
