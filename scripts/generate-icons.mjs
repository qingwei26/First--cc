import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createPNG(width, height, r, g, b, a = 255) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  function createChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const typeBuffer = Buffer.from(type);
    const crc = crc32(Buffer.concat([typeBuffer, data]));
    const crcBuffer = Buffer.alloc(4);
    crcBuffer.writeUInt32BE(crc >>> 0);
    return Buffer.concat([length, typeBuffer, data, crcBuffer]);
  }

  function crc32(buffer) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buffer.length; i++) {
      crc ^= buffer[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
      }
    }
    return crc ^ 0xFFFFFFFF;
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0);
    for (let x = 0; x < width; x++) {
      rawData.push(r, g, b, a);
    }
  }
  const compressed = zlib.deflateSync(Buffer.from(rawData));

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createAppIcon(size) {
  const png = createPNG(size, size, 220, 38, 38);
  return png;
}

const sizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

const androidResDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

Object.entries(sizes).forEach(([folder, size]) => {
  const dirPath = path.join(androidResDir, folder);
  fs.mkdirSync(dirPath, { recursive: true });

  const icon = createAppIcon(size);

  fs.writeFileSync(path.join(dirPath, 'ic_launcher.png'), icon);
  fs.writeFileSync(path.join(dirPath, 'ic_launcher_round.png'), icon);

  console.log(`Created ${folder}/ic_launcher.png (${size}x${size})`);
});

const splashDirs = [
  'drawable-mdpi',
  'drawable-hdpi',
  'drawable-xhdpi',
  'drawable-xxhdpi',
  'drawable-xxxhdpi',
  'drawable-land-mdpi',
  'drawable-land-hdpi',
  'drawable-land-xhdpi',
  'drawable-land-xxhdpi',
  'drawable-land-xxxhdpi'
];

splashDirs.forEach(dir => {
  const dirPath = path.join(androidResDir, dir);
  fs.mkdirSync(dirPath, { recursive: true });

  const splash = createPNG(256, 256, 15, 15, 26);
  fs.writeFileSync(path.join(dirPath, 'splash.png'), splash);
  console.log(`Created ${dir}/splash.png`);
});

console.log('\n✓ All icons generated successfully!');
