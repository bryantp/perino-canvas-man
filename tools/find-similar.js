#!/usr/bin/env node
// Find perceptually-similar (near-duplicate) images in src/images/gallery/.
//
// Different from the SHA256 dedup pass — that found byte-identical files.
// This one catches the same photo at different sizes, slight re-crops,
// re-encodes, or near-identical shots from the same shoot.
//
// Approach:
//   1. Compute a 64-bit perceptual hash (pHash via sharp-phash) for every
//      image in src/images/gallery/.
//   2. For each pair, compute the Hamming distance (number of differing bits).
//      Pairs with distance <= threshold are flagged as similar.
//   3. Use union-find to merge transitively-similar pairs into groups
//      (A~B and B~C produces group {A, B, C} even if A and C aren't a
//      direct pair).
//   4. Write build/similar-groups.json. The contact-sheet review tool reads
//      that file (via src/_data/similar.js) and renders the groups at
//      /review/similar/ for human keep/cut decisions.
//
// Usage:
//   npm run find-similar                  # default threshold 8
//   npm run find-similar -- --threshold 6 # stricter (fewer, more confident groups)
//   npm run find-similar -- --threshold 12 # looser (more groups, more false positives)
//
// Threshold guide (64-bit pHash, Hamming distance):
//    0-5   very likely the same image (different size, minor re-encode)
//    6-10  same shot, modest variation (color, slight crop)
//   11-15  same scene / subject, more variation
//   16+    likely different images
//
// Default of 8 is conservative: prefers under-clustering over false matches.

const fs = require("node:fs");
const path = require("node:path");
const phash = require("sharp-phash");

const ROOT = path.join(__dirname, "..");
const GALLERY = path.join(ROOT, "src/images/gallery");
const OUTPUT = path.join(ROOT, "build/similar-groups.json");

const argv = process.argv.slice(2);
let threshold = 8;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--threshold" || a === "-t") {
    threshold = parseInt(argv[++i], 10);
    if (Number.isNaN(threshold) || threshold < 0) {
      console.error("find-similar: --threshold must be a non-negative integer");
      process.exit(1);
    }
  } else if (a === "--help" || a === "-h") {
    console.log("Usage: npm run find-similar -- [--threshold N]");
    process.exit(0);
  }
}

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (/\.(jpe?g|png)$/i.test(entry.name)) yield p;
  }
}

function hamming(a, b) {
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
}

function relGallery(p) {
  // src/images/gallery/<area>/<category>/<file> → { area, category, file }
  const rel = path.relative(GALLERY, p);
  const parts = rel.split(path.sep);
  return { area: parts[0], category: parts[1], file: parts.slice(2).join("/") };
}

async function main() {
  const files = Array.from(walk(GALLERY));
  if (!files.length) {
    console.error("find-similar: no images found under src/images/gallery/");
    process.exit(1);
  }
  console.log(`find-similar: ${files.length} images, threshold ${threshold}. hashing...`);

  const t0 = Date.now();
  const hashes = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const h = await phash(f);
    hashes.push({ path: path.relative(ROOT, f), hash: h });
    if ((i + 1) % 50 === 0 || i === files.length - 1) {
      process.stdout.write(`\r  hashed ${i + 1}/${files.length}`);
    }
  }
  process.stdout.write("\n");
  console.log(`find-similar: hashes computed in ${((Date.now() - t0) / 1000).toFixed(1)}s. comparing...`);

  // O(n^2) pairwise — fine for a few thousand images.
  const edges = [];
  for (let i = 0; i < hashes.length; i++) {
    for (let j = i + 1; j < hashes.length; j++) {
      const d = hamming(hashes[i].hash, hashes[j].hash);
      if (d <= threshold) edges.push([i, j, d]);
    }
  }
  console.log(`find-similar: ${edges.length} similar pair(s) at threshold ${threshold}`);

  // Connected components via union-find.
  const parent = Array.from({ length: hashes.length }, (_, i) => i);
  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }
  function union(a, b) {
    parent[find(a)] = find(b);
  }
  for (const [i, j] of edges) union(i, j);

  const byRoot = new Map();
  for (let i = 0; i < hashes.length; i++) {
    const r = find(i);
    if (!byRoot.has(r)) byRoot.set(r, []);
    byRoot.get(r).push(i);
  }
  const groups = [...byRoot.values()].filter((g) => g.length > 1);

  // Within each group, also find the max pairwise distance for display.
  function maxDistance(indices) {
    let max = 0;
    for (let i = 0; i < indices.length; i++) {
      for (let j = i + 1; j < indices.length; j++) {
        const d = hamming(hashes[indices[i]].hash, hashes[indices[j]].hash);
        if (d > max) max = d;
      }
    }
    return max;
  }

  // Largest groups first (most actionable).
  groups.sort((a, b) => b.length - a.length);

  // Detect whether all filenames in a group differ only by an optional `-\d+`
  // suffix (e.g. `foo.jpg`, `foo-1.jpg`, `foo-2.jpg` → stem `foo`).
  // Catches the pool-cabana / `name-N.jpg` import pattern explicitly.
  function isSequencePattern(files) {
    const stems = files.map((f) =>
      f.replace(/(-\d+)?(\.[A-Za-z0-9]+)$/, "$2").replace(/\.[A-Za-z0-9]+$/, ""),
    );
    return new Set(stems).size === 1 && stems[0].length > 0;
  }

  let crossCategoryGroups = 0;
  let sequencePatternGroups = 0;
  const out = {
    generated: new Date().toISOString(),
    threshold,
    total_images: files.length,
    pairs_found: edges.length,
    groups: groups.map((indices, gi) => {
      const images = indices.map((i) => {
        const rg = relGallery(path.join(ROOT, hashes[i].path));
        return {
          path: hashes[i].path,
          area: rg.area,
          category: rg.category,
          file: rg.file,
          size: fs.statSync(path.join(ROOT, hashes[i].path)).size,
        };
      });

      // Mark the largest file(s) in the group. Skip marking when every file is
      // the same size — the badge would be on everyone, which carries no signal
      // (and the byte-identical badge already covers that case).
      const sizes = images.map((im) => im.size);
      const maxSize = Math.max(...sizes);
      const minSize = Math.min(...sizes);
      if (maxSize > minSize) {
        for (const im of images) im.largest = im.size === maxSize;
      }

      const cats = new Set(images.map((im) => `${im.area}/${im.category}`));
      const crossCategory = cats.size > 1;
      if (crossCategory) crossCategoryGroups++;

      const sequencePattern = isSequencePattern(images.map((im) => im.file));
      if (sequencePattern) sequencePatternGroups++;

      return {
        id: `group-${gi + 1}`,
        max_distance: maxDistance(indices),
        cross_category: crossCategory,
        sequence_pattern: sequencePattern,
        images,
      };
    }),
  };

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(out, null, 2));
  const involved = out.groups.reduce((n, g) => n + g.images.length, 0);
  console.log(
    `find-similar: ${out.groups.length} group(s), ${involved} image(s) involved, ${crossCategoryGroups} cross-category, ${sequencePatternGroups} sequence-pattern.`,
  );
  console.log(`find-similar: wrote ${path.relative(process.cwd(), OUTPUT)}`);
  console.log("");
  console.log("Next steps:");
  console.log("  1. npm run review");
  console.log("  2. open http://localhost:8081/review/similar/");
  console.log("  3. click images to mark cut, then Export cuts.json");
  console.log("  4. npm run apply-cuts -- ~/Downloads/cuts.json");
}

main().catch((e) => {
  console.error("find-similar:", e.message);
  process.exit(1);
});
