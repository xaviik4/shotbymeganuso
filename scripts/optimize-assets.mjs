import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceRoot = path.resolve("originals/portfolio");
const outputRoot = path.resolve("public/images-optimized");
const widths = [640, 1280, 2000];

async function walk(dir) {
  const items = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const item of items) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) files.push(...await walk(full));
    else if (/\.(jpe?g|png)$/i.test(item.name)) files.push(full);
  }
  return files;
}

await fs.mkdir(outputRoot, { recursive: true });
let sourceFiles = [];
try {
  sourceFiles = await walk(sourceRoot);
} catch (error) {
  if (error.code !== "ENOENT") throw error;
  console.log("Original photos are unavailable; using the committed optimized WebP files.");
}

for (const file of sourceFiles) {
  const relative = path.relative(sourceRoot, file);
  const dir = path.join(outputRoot, path.dirname(relative));
  const base = path.basename(relative, path.extname(relative));
  await fs.mkdir(dir, { recursive: true });
  for (const width of widths) {
    const target = path.join(dir, `${base}-${width}.webp`);
    try {
      const [sourceStat, targetStat] = await Promise.all([fs.stat(file), fs.stat(target)]);
      if (targetStat.mtimeMs >= sourceStat.mtimeMs && targetStat.size > 0) continue;
    } catch { /* generate missing or stale image */ }
    await sharp(file).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 72, effort: 5 }).toFile(target);
  }
}

const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="630" fill="#0a0a0a"/><rect x="72" y="72" width="14" height="14" rx="7" fill="#FF4D00"/><text x="110" y="93" fill="#F2F0EB" font-family="Arial,sans-serif" font-size="28" letter-spacing="5">MEGANUSOPR</text><text x="72" y="330" fill="#F2F0EB" font-family="Arial,sans-serif" font-weight="700" font-size="78">ADS · VIDEO · PHOTO</text><text x="76" y="397" fill="#A0A0A0" font-family="Arial,sans-serif" font-size="25">For brands that refuse to blend in.</text><text x="76" y="555" fill="#A0A0A0" font-family="Arial,sans-serif" font-size="18">OREGON · AVAILABLE EVERYWHERE</text></svg>`;
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path.resolve("public/og-meganusopr.png"));
console.log(`Processed ${sourceFiles.length} original portfolio photos at ${widths.join(", ")}px; generated OG image.`);
