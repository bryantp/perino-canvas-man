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
