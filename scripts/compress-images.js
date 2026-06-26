import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.join(process.cwd(), 'public');

const images = [
  { src: 'xiaozha.png', width: 128, format: 'webp', quality: 80 },
  { src: 'xiaozhalogo.png', width: 400, format: 'webp', quality: 80 },
  { src: 'default-og.jpg', width: 1200, format: 'webp', quality: 80 },
];

async function compressImage(image) {
  const srcPath = path.join(publicDir, image.src);
  const ext = path.extname(image.src);
  const name = path.basename(image.src, ext);
  const destPath = path.join(publicDir, `${name}.webp`);

  if (!fs.existsSync(srcPath)) {
    console.log(`File not found: ${srcPath}`);
    return;
  }

  const originalSize = fs.statSync(srcPath).size;

  await sharp(srcPath)
    .resize(image.width)
    .toFormat(image.format, { quality: image.quality })
    .toFile(destPath);

  const compressedSize = fs.statSync(destPath).size;
  const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

  console.log(`Compressed: ${image.src}`);
  console.log(`  Original: ${(originalSize / 1024).toFixed(2)} KB`);
  console.log(`  Compressed: ${(compressedSize / 1024).toFixed(2)} KB`);
  console.log(`  Savings: ${savings}%`);
}

async function run() {
  console.log('Compressing images...\n');
  for (const image of images) {
    await compressImage(image);
    console.log('');
  }
  console.log('Done!');
}

run().catch(console.error);
