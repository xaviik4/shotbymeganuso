import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const originalsRoot = path.resolve("originals");
const portfolioRoot = path.join(originalsRoot, "portfolio");
const outputRoot = path.resolve("public/images-optimized");
const photoDataPath = path.resolve("src/data/photos.generated.json");
const gradeDataPath = path.resolve("src/data/grade-pairs.generated.json");
const aboutDataPath = path.resolve("src/data/about-image.generated.json");
const widths = [640, 1280, 2000];
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"]);
const rawExtensions = new Set([".cr3", ".arw", ".dng"]);
const expectedOutputs = new Set();

async function isDirectory(dir) {
  try { return (await fs.stat(dir)).isDirectory(); }
  catch (error) { if (error.code === "ENOENT") return false; throw error; }
}

async function walk(dir) {
  const result = [];
  for (const entry of (await fs.readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await walk(fullPath));
    else result.push(fullPath);
  }
  return result;
}

function slug(value) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "photo";
}

function titleFromFilename(file) {
  const rawName = path.basename(file, path.extname(file))
    .replace(/^\d+[\s_-]*/, "")
    .replace(/[-_]+/g, " ")
    .replace(/([A-Za-z]+)(\d+)$/, "$1 $2")
    .replace(/\s+/g, " ").trim();
  return rawName.split(" ").filter(Boolean).map((part) => `${part[0].toUpperCase()}${part.slice(1).toLowerCase()}`).join(" ") || "Photo";
}

function exifDateTimeOriginal(exif) {
  if (!exif?.length) return null;
  const marker = exif.indexOf(Buffer.from("Exif\0\0"));
  const tiffStart = marker >= 0 ? marker + 6 : 0;
  const tiff = exif.subarray(tiffStart);
  if (tiff.length < 8) return null;
  const little = tiff.toString("ascii", 0, 2) === "II";
  if (!little && tiff.toString("ascii", 0, 2) !== "MM") return null;
  const u16 = (offset) => offset + 2 <= tiff.length ? (little ? tiff.readUInt16LE(offset) : tiff.readUInt16BE(offset)) : null;
  const u32 = (offset) => offset + 4 <= tiff.length ? (little ? tiff.readUInt32LE(offset) : tiff.readUInt32BE(offset)) : null;
  if (u16(2) !== 42) return null;

  function findTag(ifdOffset, tagId) {
    const count = u16(ifdOffset);
    if (!Number.isInteger(count)) return null;
    for (let i = 0; i < count; i += 1) {
      const entry = ifdOffset + 2 + (i * 12);
      if (u16(entry) !== tagId) continue;
      const type = u16(entry + 2);
      const valueCount = u32(entry + 4);
      if (type !== 2 || !valueCount) return null;
      const valueStart = valueCount <= 4 ? entry + 8 : u32(entry + 8);
      if (!Number.isInteger(valueStart) || valueStart + valueCount > tiff.length) return null;
      return tiff.toString("ascii", valueStart, valueStart + valueCount).replace(/\0.*$/, "").trim();
    }
    return null;
  }

  const ifd0 = u32(4);
  const exifIfdPointer = (() => {
    const count = u16(ifd0);
    if (!Number.isInteger(count)) return null;
    for (let i = 0; i < count; i += 1) {
      const entry = ifd0 + 2 + (i * 12);
      if (u16(entry) === 0x8769) return u32(entry + 8);
    }
    return null;
  })();
  const value = findTag(exifIfdPointer, 0x9003) || findTag(ifd0, 0x0132);
  const match = value?.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, year, month, day, hour, minute, second] = match.map(Number);
  return Date.UTC(year, month - 1, day, hour, minute, second);
}

async function getPhotoMetadata(file) {
  const [metadata, stat] = await Promise.all([sharp(file).metadata(), fs.stat(file)]);
  const rotated = [5, 6, 7, 8].includes(metadata.orientation);
  const width = rotated ? metadata.height : metadata.width;
  const height = rotated ? metadata.width : metadata.height;
  const exifCapture = exifDateTimeOriginal(metadata.exif);
  return {
    width,
    height,
    capturedAt: new Date(exifCapture ?? stat.mtimeMs).toISOString(),
    dateSource: exifCapture ? "exif" : "file-modified",
  };
}

async function resizeSet(input, flatBase, crop) {
  const variants = [];
  for (const requestedWidth of widths) {
    const outputPath = path.join(outputRoot, `${flatBase}-${requestedWidth}.webp`);
    let pipeline = sharp(input).rotate();
    if (crop) pipeline = pipeline.extract(crop);
    const info = await pipeline.resize({ width: requestedWidth, withoutEnlargement: true })
      .webp({ quality: 78, effort: 5 }).toFile(outputPath);
    expectedOutputs.add(outputPath);
    variants.push({ path: `/images-optimized/${flatBase}-${requestedWidth}.webp`, width: info.width, height: info.height });
  }
  const source = variants.find((item) => item.path.endsWith("-1280.webp")) || variants.at(-1);
  const srcSet = [...new Map(variants.map((item) => [item.width, item])).values()]
    .map((item) => `${item.path} ${item.width}w`).join(", ");
  return { src: source.path, srcSet, width: source.width, height: source.height };
}

function centerCrop(width, height, targetRatio) {
  const ratio = width / height;
  let cropWidth = width;
  let cropHeight = height;
  if (ratio > targetRatio) cropWidth = Math.floor(height * targetRatio);
  else if (ratio < targetRatio) cropHeight = Math.floor(width / targetRatio);
  return {
    left: Math.floor((width - cropWidth) / 2),
    top: Math.floor((height - cropHeight) / 2),
    width: cropWidth,
    height: cropHeight,
  };
}

function isRaw(file) { return rawExtensions.has(path.extname(file).toLowerCase()); }
function isImage(file) { return imageExtensions.has(path.extname(file).toLowerCase()); }
function warnSkipped(file, reason) { console.warn(`[assets] Skipped ${path.relative(originalsRoot, file)}: ${reason}`); }

await fs.mkdir(outputRoot, { recursive: true });
const originalsAvailable = await isDirectory(originalsRoot);
let processedCount = 0;
const dateSourceCounts = { exif: 0, "file-modified": 0 };

if (!originalsAvailable) {
  console.log("Original photos are unavailable; preserving committed optimized assets and generated data.");
} else {
  const photos = [];
  const usedStems = new Set();
  if (await isDirectory(portfolioRoot)) {
    for (const file of await walk(portfolioRoot)) {
      if (isRaw(file)) { warnSkipped(file, "RAW camera format is not decoded by this build"); continue; }
      if (!isImage(file)) { warnSkipped(file, "unsupported or non-image file"); continue; }
      const relative = path.relative(portfolioRoot, file);
      const category = relative.split(path.sep)[0];
      if (!category || category.startsWith(".")) { warnSkipped(file, "file is not inside a category folder"); continue; }
      try {
        const metadata = await getPhotoMetadata(file);
        const categorySlug = slug(category);
        const filenameSlug = slug(path.basename(file, path.extname(file))
          .replace(/^\d+[\s_-]*/, "").replace(/[_\s]+/g, "-"));
        let flatBase = `portfolio-${categorySlug}-${filenameSlug}`;
        let collision = 2;
        while (usedStems.has(flatBase)) { flatBase = `portfolio-${categorySlug}-${filenameSlug}-${collision}`; collision += 1; }
        usedStems.add(flatBase);
        const optimized = await resizeSet(file, flatBase, null);
        dateSourceCounts[metadata.dateSource] += 1;
        photos.push({
          id: flatBase,
          cat: category,
          title: titleFromFilename(file),
          alt: `${titleFromFilename(file)}, ${category} photography by Alexander`,
          capturedAt: metadata.capturedAt,
          dateSource: metadata.dateSource,
          width: optimized.width,
          height: optimized.height,
          src: optimized.src,
          srcSet: optimized.srcSet,
        });
        processedCount += 1;
      } catch (error) {
        warnSkipped(file, `image processing failed (${error.message})`);
      }
    }
  }
  photos.sort((a, b) => Date.parse(b.capturedAt) - Date.parse(a.capturedAt) || a.id.localeCompare(b.id));
  const categoryEntries = await fs.readdir(portfolioRoot, { withFileTypes: true }).catch(() => []);
  const categories = categoryEntries.filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name).sort((a, b) => a.localeCompare(b));
  await fs.writeFile(photoDataPath, `${JSON.stringify({ photos, categories }, null, 2)}\n`);

  const gradeRoot = path.join(originalsRoot, "grade");
  const gradePairs = [];
  if (await isDirectory(gradeRoot)) {
    const gradeFiles = await walk(gradeRoot);
    const supported = [];
    for (const file of gradeFiles) {
      if (isRaw(file)) { warnSkipped(file, "RAW camera format is not decoded by this build"); continue; }
      if (!isImage(file)) { warnSkipped(file, "unsupported or non-image file"); continue; }
      supported.push(file);
    }
    if (supported.length) {
      const beforeLabel = /(?:^|[\s_-])(raw|sooc|before|original|unedited)(?:$|[\s_-])/i;
      const afterLabel = /(?:^|[\s_-])(graded|grade|edit|edited|after|final)(?:$|[\s_-])/i;
      const normalizedKey = (file) => path.basename(file, path.extname(file)).replace(/(?:^|[\s_-])(raw|sooc|before|original|unedited|graded|grade|edit|edited|after|final)(?:$|[\s_-])/ig, " ").replace(/\s+/g, " ").trim().toLowerCase();
      const groups = new Map();
      for (const file of supported) {
        const key = normalizedKey(file);
        groups.set(key, [...(groups.get(key) || []), file]);
      }
      const pairs = [];
      for (const [key, files] of groups) {
        const before = files.filter((file) => beforeLabel.test(path.basename(file, path.extname(file))));
        let after = files.filter((file) => afterLabel.test(path.basename(file, path.extname(file))));
        if (before.length === 1 && after.length === 0 && files.length === 2) after = files.filter((file) => file !== before[0]);
        if (before.length !== 1 || after.length !== 1 || before[0] === after[0] || files.length !== 2) {
          throw new Error(`Ambiguous grade image pair for "${key}". Files found: ${files.map((file) => path.basename(file)).join(", ")}`);
        }
        pairs.push({ key, before: before[0], after: after[0] });
      }
      if (pairs.length !== supported.length / 2) {
        throw new Error(`Ambiguous grade image pair. Files found: ${supported.map((file) => path.basename(file)).join(", ")}`);
      }
      for (const [index, pair] of pairs.entries()) {
        const [beforeMeta, afterMeta] = await Promise.all([getPhotoMetadata(pair.before), getPhotoMetadata(pair.after)]);
        const beforeRatio = beforeMeta.width / beforeMeta.height;
        const afterRatio = afterMeta.width / afterMeta.height;
        const targetRatio = Math.sqrt(beforeRatio * afterRatio);
        const beforeCrop = centerCrop(beforeMeta.width, beforeMeta.height, targetRatio);
        const afterCrop = centerCrop(afterMeta.width, afterMeta.height, targetRatio);
        const suffix = pairs.length === 1 ? "" : `-${slug(pair.key)}`;
        const beforeOptimized = await resizeSet(pair.before, `grade-before${suffix}`, beforeCrop);
        const afterOptimized = await resizeSet(pair.after, `grade-after${suffix}`, afterCrop);
        gradePairs.push({
          id: `grade-${index + 1}`,
          before: beforeOptimized,
          after: afterOptimized,
          width: beforeOptimized.width,
          height: beforeOptimized.height,
          aspectRatio: beforeOptimized.width / beforeOptimized.height,
          sourceFiles: [path.basename(pair.before), path.basename(pair.after)],
          normalization: {
            originalBefore: `${beforeMeta.width}x${beforeMeta.height}`,
            originalAfter: `${afterMeta.width}x${afterMeta.height}`,
            cropped: Boolean(beforeCrop.width !== beforeMeta.width || beforeCrop.height !== beforeMeta.height || afterCrop.width !== afterMeta.width || afterCrop.height !== afterMeta.height),
          },
        });
        processedCount += 2;
      }
    }
  }
  await fs.writeFile(gradeDataPath, `${JSON.stringify(gradePairs, null, 2)}\n`);

  const aboutRoot = path.join(originalsRoot, "about");
  let aboutImage = null;
  if (await isDirectory(aboutRoot)) {
    const aboutFiles = await walk(aboutRoot);
    const candidates = [];
    for (const file of aboutFiles) {
      if (isRaw(file)) { warnSkipped(file, "RAW camera format is not decoded by this build"); continue; }
      if (!isImage(file)) { warnSkipped(file, "unsupported or non-image file"); continue; }
      try { candidates.push({ file, ...(await getPhotoMetadata(file)) }); }
      catch (error) { warnSkipped(file, `image processing failed (${error.message})`); }
    }
    candidates.sort((a, b) => Date.parse(b.capturedAt) - Date.parse(a.capturedAt));
    if (candidates[0]) {
      const optimized = await resizeSet(candidates[0].file, "about-alexander", null);
      aboutImage = { ...optimized, alt: "Alexander, founder of meganusopr" };
      processedCount += 1;
    }
  }
  await fs.writeFile(aboutDataPath, `${JSON.stringify(aboutImage, null, 2)}\n`);

  const staleOutputs = (await walk(outputRoot)).filter((file) => file.endsWith(".webp") && !expectedOutputs.has(file));
  for (const file of staleOutputs) await fs.rm(file);
  console.log(`Portfolio processed: ${photos.length} image(s) across ${categories.length} category folder(s); DateTimeOriginal=${dateSourceCounts.exif}, file-modified fallback=${dateSourceCounts["file-modified"]}.`);
  console.log(`Grade pair: ${gradePairs.length ? gradePairs[0].sourceFiles.join(" => ") : "not supplied"}; About portrait: ${aboutImage ? "processed" : "not supplied"}.`);
  console.log(`Processed ${processedCount} source images at ${widths.join(", ")}px; stale optimized WebPs removed: ${staleOutputs.length}.`);
}

const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="630" fill="#0a0a0a"/><rect x="72" y="72" width="14" height="14" rx="7" fill="#FF4D00"/><text x="110" y="93" fill="#F2F0EB" font-family="Arial,sans-serif" font-size="28" letter-spacing="5">MEGANUSOPR</text><text x="72" y="330" fill="#F2F0EB" font-family="Arial,sans-serif" font-weight="700" font-size="78">ADS · VIDEO · PHOTO</text><text x="76" y="397" fill="#A0A0A0" font-family="Arial,sans-serif" font-size="25">For brands that refuse to blend in.</text><text x="76" y="555" fill="#A0A0A0" font-family="Arial,sans-serif" font-size="18">OREGON · AVAILABLE EVERYWHERE</text></svg>`;
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path.resolve("public/og-meganusopr.png"));
