// One-off script: shrinks img/boats/**/*.jpg in place (resize + re-encode).
// Not part of the site runtime. Re-run after adding new boat photos.
// Requires: npm install --no-save sharp
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const MAX_WIDTH = 1600;
const JPEG_QUALITY = 78;
const boatsDir = path.join(__dirname, '..', 'public', 'img', 'boats');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Windows Defender's real-time scan transiently locks freshly-written files,
// so a rename right after write can EPERM/EBUSY — retry with backoff.
async function renameWithRetry(from, to, attempts = 6) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      fs.renameSync(from, to);
      return;
    } catch (err) {
      if (i === attempts - 1) throw err;
      await sleep(150 * (i + 1));
    }
  }
}

async function compressOne(filePath) {
  const before = fs.statSync(filePath).size;
  const buffer = await sharp(filePath)
    .rotate() // respect EXIF orientation before stripping metadata
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, buffer);
  await renameWithRetry(tmpPath, filePath);
  const after = buffer.length;
  return { before, after };
}

async function main() {
  const boatDirs = fs.readdirSync(boatsDir, { withFileTypes: true }).filter((d) => d.isDirectory());
  let totalBefore = 0;
  let totalAfter = 0;

  for (const dir of boatDirs) {
    const folder = path.join(boatsDir, dir.name);
    const files = fs.readdirSync(folder).filter((f) => /\.(jpe?g)$/i.test(f));
    for (const file of files) {
      const filePath = path.join(folder, file);
      const { before, after } = await compressOne(filePath);
      totalBefore += before;
      totalAfter += after;
      console.log(`${dir.name}/${file}: ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB`);
    }
  }

  console.log(`\nTotal: ${(totalBefore / 1024 / 1024).toFixed(2)}MB → ${(totalAfter / 1024 / 1024).toFixed(2)}MB`);
}

main();
