import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

// Public: powers the boat cards on the static site (js/main.js fetches this
// instead of the old data/boats.json, so admin-edited prices go live
// immediately without a redeploy).
export async function GET() {
  const boats = await prisma.boat.findMany({
    where: { active: true },
    orderBy: { priceHalfDay: 'asc' },
  });

  return NextResponse.json(
    boats.map((b) => ({
      slug: b.slug,
      name: b.name,
      type: b.type,
      location: b.location,
      capacity: b.capacity,
      hp: b.hp,
      lengthM: b.lengthM,
      licenseRequired: b.licenseRequired,
      fuelIncluded: b.fuelIncluded,
      priceHalfDay: b.priceHalfDay,
      priceFullDay: b.priceFullDay,
      skipperHalfDay: b.skipperHalfDay,
      skipperFullDay: b.skipperFullDay,
      securityDeposit: b.securityDeposit,
      priceFrom: b.priceHalfDay,
      image: b.imageUrl,
    }))
  );
}
