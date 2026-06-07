const fs = require("node:fs");
const path = require("node:path");

// Loads build/similar-groups.json (produced by `npm run find-similar`).
// Returns an empty payload if the file doesn't exist — review template
// renders a "no data, run the script" message in that case.
module.exports = function () {
  const file = path.join(__dirname, "..", "..", "build", "similar-groups.json");
  if (!fs.existsSync(file)) {
    return { generated: null, threshold: null, total_images: 0, groups: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return { generated: null, threshold: null, total_images: 0, groups: [] };
  }
};
