import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const EDITABLE_FIELDS = [
  'priceHalfDay',
  'priceFullDay',
  'skipperHalfDay',
  'skipperFullDay',
  'securityDeposit',
  'active',
] as const;

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const boats = await prisma.boat.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json({ boats });
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { boatId, ...updates } = body;
  if (!boatId) {
    return NextResponse.json({ error: 'Missing boatId' }, { status: 400 });
  }

  const data: Record<string, number | boolean | null> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in updates) data[field] = updates[field];
  }

  const boat = await prisma.boat.update({ where: { id: boatId }, data });
  return NextResponse.json({ boat });
}
