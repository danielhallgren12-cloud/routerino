import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const svg = readFileSync('./public/icons/icon.svg');

async function generateIcons() {
  // Generate 192x192
  await sharp(svg)
    .resize(192, 192)
    .png()
    .toFile('./public/icons/icon-192.png');
  console.log('Created icon-192.png');

  // Generate 512x512
  await sharp(svg)
    .resize(512, 512)
    .png()
    .toFile('./public/icons/icon-512.png');
  console.log('Created icon-512.png');
  
  // Also create a favicon for browsers
  await sharp(svg)
    .resize(32, 32)
    .png()
    .toFile('./public/favicon.png');
  console.log('Created favicon.png');
}

generateIcons().catch(console.error);
