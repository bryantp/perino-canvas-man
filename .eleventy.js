const path = require("node:path");
const fs = require("node:fs");
const Image = require("@11ty/eleventy-img");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/images/content": "images/content" });
  eleventyConfig.addPassthroughCopy({ "src/images/gallery": "images/gallery" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });

  eleventyConfig.addWatchTarget("src/images/gallery");
  eleventyConfig.addWatchTarget("src/assets");

  eleventyConfig.addFilter("titleCase", (slug) =>
    slug
      .split("-")
      .map((w) => (w.length <= 3 && w !== "bbq" ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
      .join(" "),
  );

  eleventyConfig.addNunjucksAsyncShortcode(
    "responsiveImage",
    async function (src, alt, sizes = "(min-width: 900px) 33vw, 100vw") {
      if (!src) return "";
      const inputPath = path.join("src", src.replace(/^\//, ""));
      if (!fs.existsSync(inputPath)) return "";
      const metadata = await Image(inputPath, {
        widths: [400, 800, 1600],
        formats: ["webp", "jpeg"],
        outputDir: "./_site/img/",
        urlPath: "/img/",
        filenameFormat(id, src, width, format) {
          const ext = format;
          const name = path.basename(src, path.extname(src));
          return `${name}-${width}.${ext}`;
        },
      });
      const imageAttributes = {
        alt: alt || "",
        sizes,
        loading: "lazy",
        decoding: "async",
      };
      return Image.generateHTML(metadata, imageAttributes);
    },
  );

  eleventyConfig.setDataDeepMerge(true);

  // After every build, surface any empty gallery categories.
  //
  // src/_data/gallery.js writes archive/EMPTY_CATEGORIES.md on each build
  // (single source of truth). The CI workflow already includes that file's
  // contents in the PR build report; this hook does the same for local
  // `npm run build` so dev environments aren't silent about it.
  //
  // Silent on clean builds — only prints when there's something to fix.
  eleventyConfig.on("eleventy.after", () => {
    const reportFile = path.join(__dirname, "archive", "EMPTY_CATEGORIES.md");
    if (!fs.existsSync(reportFile)) return;
    const content = fs.readFileSync(reportFile, "utf8");
    const countMatch = content.match(/^## Currently empty: (\d+)/m);
    if (!countMatch) return;
    const count = parseInt(countMatch[1], 10);
    if (count === 0) return;

    const paths = [];
    for (const line of content.split("\n")) {
      const m = line.match(/^\| `(src\/images\/gallery\/[^`]+)`/);
      if (m) paths.push(m[1]);
    }
    const noun = count === 1 ? "category" : "categories";
    console.warn(`\n[gallery] ⚠️  ${count} empty gallery ${noun}:`);
    for (const p of paths) console.warn(`[gallery]    ${p}`);
    console.warn(`[gallery] See archive/EMPTY_CATEGORIES.md for restore/cleanup steps.\n`);
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
};
