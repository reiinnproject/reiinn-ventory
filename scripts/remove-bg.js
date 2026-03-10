/**
 * Remove solid color backgrounds from PNG images to create transparent versions.
 * Usage: node scripts/remove-bg.js
 */
import sharp from 'sharp';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const ASSETS = [
  {
    src: join(__dirname, '../public/logo-philippines-src.png'),
    out: join(__dirname, '../public/logo-philippines.png'),
    bgColor: { r: 15, g: 23, b: 42 }, // #0f172a - dark blue
    tolerance: 25,
  },
  {
    src: join(__dirname, '../public/logo-dost-src.png'),
    out: join(__dirname, '../public/logo-dost.png'),
    bgColor: { r: 255, g: 255, b: 255 }, // white
    tolerance: 30,
  },
  {
    src: join(__dirname, '../public/logo-reiinn-tech-src.png'),
    out: join(__dirname, '../public/logo-reiinn-tech.png'),
    bgColor: { r: 0, g: 0, b: 0 }, // black
    tolerance: 30,
  },
];

function colorMatch(pixel, bg, tolerance) {
  return (
    Math.abs(pixel[0] - bg.r) <= tolerance &&
    Math.abs(pixel[1] - bg.g) <= tolerance &&
    Math.abs(pixel[2] - bg.b) <= tolerance
  );
}

async function removeBackground({ src, out, bgColor, tolerance }) {
  const img = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { data, info } = img;
  const { width, height, channels } = info;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (colorMatch([r, g, b], bgColor, tolerance)) {
      data[i + 3] = 0; // set alpha to transparent
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(out);
  console.log('Created:', out);
}

async function main() {
  for (const config of ASSETS) {
    try {
      await removeBackground(config);
    } catch (err) {
      console.error('Error processing', config.src, err.message);
    }
  }
}

main();
