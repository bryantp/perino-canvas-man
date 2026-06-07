#!/usr/bin/env node
// Apply a cuts.json produced by the contact-sheet review tool.
//
// Usage:
//   npm run apply-cuts -- path/to/cuts.json
//
// For each entry in cuts.json's `cuts` array (a path like
// "src/images/gallery/<area>/<cat>/<file>"), this script:
//   1. Moves the file to archive/manual-curated/<area>/<cat>/<file>
//   2. Appends a row to archive/ARCHIVE_LOG.md under a "Manual curation"
//      section dated today, so we have a permanent record of what was
//      cut, when, and where it went.
//
// Files are never deleted — only moved into archive/. To restore an
// image, `mv archive/manual-curated/<area>/<cat>/<file> src/images/gallery/<area>/<cat>/`
// and rebuild.

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const ARCHIVE_BASE = path.join(ROOT, "archive", "manual-curated");
const LOG_FILE = path.join(ROOT, "archive", "ARCHIVE_LOG.md");

function die(msg) {
  console.error(`apply-cuts: ${msg}`);
  process.exit(1);
}

const inputArg = process.argv[2];
if (!inputArg) {
  die("missing argument: path to cuts.json\nUsage: npm run apply-cuts -- path/to/cuts.json");
}
const inputPath = path.resolve(inputArg);
if (!fs.existsSync(inputPath)) die(`file not found: ${inputPath}`);

let payload;
try {
  payload = JSON.parse(fs.readFileSync(inputPath, "utf8"));
} catch (e) {
  die(`invalid JSON in ${inputPath}: ${e.message}`);
}
const cuts = Array.isArray(payload?.cuts) ? payload.cuts : null;
if (!cuts || cuts.length === 0) {
  die("no `cuts` array in payload, or it's empty");
}

console.log(`apply-cuts: processing ${cuts.length} file(s) from ${path.relative(process.cwd(), inputPath)}`);

const moved = [];
const skipped = [];
for (const rel of cuts) {
  // Defence: only allow paths under src/images/gallery/
  if (!rel.startsWith("src/images/gallery/")) {
    skipped.push({ rel, reason: "outside src/images/gallery/" });
    continue;
  }
  const src = path.join(ROOT, rel);
  if (!fs.existsSync(src)) {
    skipped.push({ rel, reason: "source does not exist (already cut?)" });
    continue;
  }
  const relInsideGallery = rel.slice("src/images/gallery/".length);
  const dest = path.join(ARCHIVE_BASE, relInsideGallery);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.renameSync(src, dest);
  moved.push({ rel, dest: path.relative(ROOT, dest), bytes: fs.statSync(dest).size });
}

// Append to ARCHIVE_LOG.md
const now = new Date().toISOString().slice(0, 10);
let logAddition = `\n## Manual curation (${now})\n\n`;
logAddition += `${moved.length} photo${moved.length === 1 ? "" : "s"} archived after contact-sheet review. `;
logAddition += `Files moved to \`archive/manual-curated/\` (preserving area/category structure). `;
logAddition += `Source of decision: subjective quality judgement during manual review (cuts.json exported from \`npm run review\`).\n\n`;
logAddition += "| Original path | Archived path | Size |\n|---|---|---|\n";
for (const m of moved) {
  logAddition += `| \`${m.rel}\` | \`${m.dest}\` | ${(m.bytes / 1024).toFixed(1)}KB |\n`;
}
fs.appendFileSync(LOG_FILE, logAddition);

console.log(`apply-cuts: moved ${moved.length} file(s).`);
if (skipped.length) {
  console.log(`apply-cuts: skipped ${skipped.length}:`);
  for (const s of skipped) console.log(`  - ${s.rel} (${s.reason})`);
}
console.log(`apply-cuts: appended log entry to ${path.relative(process.cwd(), LOG_FILE)}.`);
console.log(`apply-cuts: next steps:`);
console.log(`  1. npm run build   # confirm site builds cleanly`);
console.log(`  2. git add -A && git commit && git push`);
console.log(`  3. Open a PR (per the workflow rule).`);
