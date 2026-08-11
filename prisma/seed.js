// Seeds/upserts the Boat table from public/data/boats.json — the same file
// the static site's card rendering used before the API took over. Safe to
// re-run: it upserts by slug, so editing boats.json and re-seeding won't
// duplicate rows, but it also won't overwrite prices an admin already
// changed in the DB unless you pass --force.
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const force = process.argv.includes('--force');

function mapFuel(fuelIncluded) {
  if (fuelIncluded === 'zone') return 'zone_included';
  return fuelIncluded ? 'included' : 'not_included';
}

async function main() {
  const boatsPath = path.join(__dirname, '..', 'public', 'data', 'boats.json');
  const boats = JSON.parse(fs.readFileSync(boatsPath, 'utf8'));

  for (const boat of boats) {
    const data = {
      name: boat.name,
      type: boat.type,
      location: boat.location,
      capacity: boat.capacity,
      hp: boat.hp,
      lengthM: boat.lengthM,
      licenseRequired: boat.licenseRequired,
      fuelIncluded: mapFuel(boat.fuelIncluded),
      priceHalfDay: boat.priceHalfDay,
      priceFullDay: boat.priceFullDay,
      securityDeposit: boat.deposit ?? null,
      imageUrl: boat.image,
    };

    const existing = await prisma.boat.findUnique({ where: { slug: boat.slug } });
    if (existing && !force) {
      console.log(`↷ ${boat.slug} already exists, skipping (use --force to overwrite prices)`);
      continue;
    }

    await prisma.boat.upsert({
      where: { slug: boat.slug },
      create: { slug: boat.slug, ...data },
      update: data,
    });
    console.log(`${existing ? '↻' : '+'} ${boat.slug}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
