const fs = require("node:fs");
const path = require("node:path");

const PROJECT_ROOT = path.join(__dirname, "..", "..");
const GALLERY_ROOT = path.join(__dirname, "..", "images", "gallery");
const DESCRIPTIONS_FILE = path.join(PROJECT_ROOT, "build", "category_descriptions.json");
const EMPTY_REPORT_FILE = path.join(PROJECT_ROOT, "archive", "EMPTY_CATEGORIES.md");

const AREA_META = {
  residential: {
    title: "Residential",
    subtitle: "Awnings, covers, and shade structures for the home.",
    order: 1,
  },
  commercial: {
    title: "Commercial",
    subtitle: "Storefront, restaurant, and industrial canvas work.",
    order: 2,
  },
  marine: {
    title: "Marine",
    subtitle: "Custom canvas for boats: enclosures, covers, bimini tops, and upholstery.",
    order: 3,
  },
};

function titleCase(slug) {
  return slug
    .split("-")
    .map((w) => (w === "bbq" ? "BBQ" : w[0].toUpperCase() + w.slice(1)))
    .join(" ")
    .replace(/\bAnd\b/g, "&");
}

function loadDescriptions() {
  try {
    return JSON.parse(fs.readFileSync(DESCRIPTIONS_FILE, "utf8"));
  } catch {
    return {};
  }
}

function listImages(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f))
    .sort()
    .map((file) => {
      const full = path.join(dir, file);
      return {
        file,
        src: "/" + path.relative(path.join(__dirname, ".."), full).split(path.sep).join("/"),
        alt: "",
      };
    });
}

function writeEmptyReport(empty) {
  const header = `# Empty gallery categories

Generated automatically on every build by \`src/_data/gallery.js\`.

These category directories exist under \`src/images/gallery/\` but contain no images. They are silently skipped during the build: no page is generated, and they don't appear in area listings.

**Why this report exists:** so empty directories don't disappear unnoticed. If a category was emptied by curation (e.g. all photos archived) you may want to either repopulate it, delete the folder, or document why it's kept empty.
`;

  let body;
  if (empty.length === 0) {
    body = "\n## Current state: none\n\nAll categories under `src/images/gallery/` contain at least one image.\n";
  } else {
    body = `\n## Currently empty: ${empty.length}\n\n`;
    body += "| Category path | Notes |\n|---|---|\n";
    for (const c of empty) {
      body += `| \`${c.relPath}\` | ${c.note} |\n`;
    }
    body += "\n### What to do\n\n";
    body += "- **Add photos** — drop JPGs into the folder; the next build will pick them up.\n";
    body += "- **Delete the folder** — if the category is no longer relevant: `rm -rf src/images/gallery/<area>/<category>/`.\n";
    body += "- **Restore from archive** — check `archive/ARCHIVE_LOG.md` for previously-removed images and `mv` them back into the folder.\n";
  }

  const content = header + body;

  // Only write if changed — avoid touching the file on every build when nothing differs.
  let existing = "";
  try { existing = fs.readFileSync(EMPTY_REPORT_FILE, "utf8"); } catch {}
  if (existing !== content) {
    fs.mkdirSync(path.dirname(EMPTY_REPORT_FILE), { recursive: true });
    fs.writeFileSync(EMPTY_REPORT_FILE, content);
  }
}

module.exports = function () {
  if (!fs.existsSync(GALLERY_ROOT)) return { areas: [], categories: [], empty: [] };
  const descriptions = loadDescriptions();
  const areas = [];
  const categories = [];
  const empty = [];

  for (const areaSlug of fs.readdirSync(GALLERY_ROOT)) {
    const areaDir = path.join(GALLERY_ROOT, areaSlug);
    if (!fs.statSync(areaDir).isDirectory()) continue;
    const meta = AREA_META[areaSlug] || { title: titleCase(areaSlug), subtitle: "", order: 99 };
    const areaCategories = [];

    for (const catSlug of fs.readdirSync(areaDir)) {
      const catDir = path.join(areaDir, catSlug);
      if (!fs.statSync(catDir).isDirectory()) continue;
      const images = listImages(catDir);
      const relPath = `src/images/gallery/${areaSlug}/${catSlug}/`;

      if (images.length === 0) {
        // See if it was previously archived so we can hint at recovery
        const archived = path.join(PROJECT_ROOT, "archive", "low-resolution", areaSlug, catSlug);
        const note = fs.existsSync(archived)
          ? `${fs.readdirSync(archived).length} file(s) in \`archive/low-resolution/${areaSlug}/${catSlug}/\``
          : "no archived files found";
        empty.push({ area: areaSlug, slug: catSlug, relPath, note });
        continue;
      }
      const key = `${areaSlug}/${catSlug}`;
      const desc = (descriptions[key] && descriptions[key].description) || "";
      const cat = {
        slug: catSlug,
        title: titleCase(catSlug),
        area: areaSlug,
        areaTitle: meta.title,
        description: desc,
        images,
        imageCount: images.length,
        thumb: images[0] ? images[0].src : null,
        permalink: `/${areaSlug}/${catSlug}/`,
      };
      areaCategories.push(cat);
      categories.push(cat);
    }

    areaCategories.sort((a, b) => a.title.localeCompare(b.title));
    areas.push({
      slug: areaSlug,
      title: meta.title,
      subtitle: meta.subtitle,
      order: meta.order,
      categories: areaCategories,
      totalImages: areaCategories.reduce((n, c) => n + c.imageCount, 0),
    });
  }

  areas.sort((a, b) => a.order - b.order);
  const areasBySlug = Object.fromEntries(areas.map((a) => [a.slug, a]));

  writeEmptyReport(empty);

  return { areas, areasBySlug, categories, empty };
};
