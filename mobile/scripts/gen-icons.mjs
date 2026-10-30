// Generates ADL app icons + splash from the "عدل" wordmark (Amiri, white on black).
// Run: node scripts/gen-icons.mjs
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ASSETS = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
const WORD = 'عدل';
const BLACK = '#000000';
const WHITE = '#FFFFFF';

/** Build an SVG of the wordmark centered on a square canvas. */
function svg(size, { bg = BLACK, fill = WHITE, ratio = 0.42, transparentBg = false } = {}) {
  const fontSize = Math.round(size * ratio);
  const rect = transparentBg ? '' : `<rect width="${size}" height="${size}" fill="${bg}"/>`;
  return Buffer.from(`
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  ${rect}
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
        font-family="Amiri" font-weight="400" font-size="${fontSize}"
        fill="${fill}" direction="rtl">${WORD}</text>
</svg>`);
}

async function write(name, size, opts) {
  const out = join(ASSETS, name);
  await sharp(svg(size, opts)).png().toFile(out);
  console.log('✓', name, `${size}x${size}`);
}

async function main() {
  // iOS / general app icon — solid black square with white wordmark.
  await write('icon.png', 1024);
  // Splash logo — transparent background so Expo centers it on our black splash.
  await write('splash-icon.png', 1024, { transparentBg: true, ratio: 0.5 });
  // Web favicon.
  await write('favicon.png', 256, { ratio: 0.5 });
  // Android adaptive icon: foreground wordmark (transparent) + black background.
  await write('android-icon-foreground.png', 1024, { transparentBg: true, ratio: 0.36 });
  await write('android-icon-background.png', 1024, { bg: BLACK, fill: BLACK });
  await write('android-icon-monochrome.png', 1024, { transparentBg: true, fill: WHITE, ratio: 0.36 });
  console.log('All ADL icons generated.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
