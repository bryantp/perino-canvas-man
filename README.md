# Perino's Canvas & Awnings — Website

[![Build](https://github.com/bryantp/perino-canvas-man/actions/workflows/deploy.yml/badge.svg)](https://github.com/bryantp/perino-canvas-man/actions/workflows/deploy.yml)
[![Site status](https://img.shields.io/uptimerobot/status/m803243866-7acd2181deed5fd179b43b6b?label=preview.canvasman.com)](https://preview.canvasman.com)
[![Uptime (30d)](https://img.shields.io/uptimerobot/ratio/30/m803243866-7acd2181deed5fd179b43b6b?label=uptime%20%2830d%29)](https://preview.canvasman.com)

Static website built with [Eleventy](https://www.11ty.dev/). Source content lives in Markdown + a single YAML data file; everything compiles to plain HTML that can be hosted on any web server.

## Current build state

<!-- empty-cats:start -->
⚠️ **1 empty gallery category:**

- `src/images/gallery/commercial/protect-covers/`

See [`archive/EMPTY_CATEGORIES.md`](archive/EMPTY_CATEGORIES.md) for restore/cleanup steps.
<!-- empty-cats:end -->

_The section above is automatically updated by `.github/workflows/deploy.yml` on every push to `main`. Don't edit it by hand — your edit will be overwritten._

## Quick start

```sh
npm install
npm run serve   # dev server with hot reload at http://localhost:8080
npm run build   # build production output into _site/
```

Deploy by copying the contents of `_site/` to your web host (rsync, SFTP, anywhere).

## How to update common things

| What you want to change | Where to edit |
|---|---|
| Phone, address, email, hours | `src/_data/site.yml` |
| Home page text | `src/index.njk` |
| About page | `src/about.md` |
| Contact page | `src/contact.njk` |
| Top navigation links | `nav:` section in `src/_data/site.yml` |
| Add a photo to a category | Drop a JPG/PNG into `src/images/gallery/<area>/<category>/` |
| Add a new gallery category | `mkdir src/images/gallery/<area>/<new-slug>` and add photos |
| Add a brand-new page | Create `src/<name>.md`, add to `nav:` in `site.yml` |

After any change, run `npm run build` and re-deploy `_site/`.

## Project layout

```
src/
├── _data/         # site-wide data (YAML/JS files)
├── _includes/     # layouts + partials
├── assets/        # CSS, JS
├── images/        # content and gallery photos
└── *.md, *.njk    # pages
```

## Curating gallery photos

Two complementary tools, both gated by `REVIEW_MODE=1` so they never ship to production:

**1. Find perceptually-similar groups (automated):**

```sh
npm run find-similar               # default threshold 8
# or: npm run find-similar -- --threshold 6   (stricter, fewer groups)
npm run review                     # boots http://localhost:8081/
# visit /review/similar/ to see the groups, click photos to mark cut
```

`find-similar` computes a 64-bit perceptual hash (sharp-phash) for every gallery photo, groups images whose pairwise Hamming distance is at most the threshold, and writes `build/similar-groups.json`. The `/review/similar/` page renders each group side-by-side; cross-category groups (same photo legitimately in two categories) and byte-identical groups (`max_distance = 0`) are surfaced with badges so they're easy to skip vs. cut.

**2. Manual contact-sheet review (per-category):**

```sh
npm run review                     # http://localhost:8081/review/
# click any photo in a category to mark for cut (selections persist across pages)
```

**Apply the cuts** (works the same for both tools):

```sh
# in the review UI, click "Export cuts.json" at the bottom
npm run apply-cuts -- ~/Downloads/cuts.json
```

`apply-cuts` moves the marked files from `src/images/gallery/<area>/<cat>/` to `archive/manual-curated/<area>/<cat>/`, never deletes them, and appends a dated entry to `archive/ARCHIVE_LOG.md`. To restore one, `mv` it back into `src/images/gallery/` and rebuild.

## Operations

- **Deploys** run automatically on every push to `main` via `.github/workflows/deploy.yml` and publish to `https://preview.canvasman.com/` (GitHub Pages, custom domain).
- **Branch protection:** `main` is protected by the `main_protect` ruleset — every change requires a PR with a passing `build` check and a code-owner review.
- **Uptime monitoring:** [UptimeRobot](https://uptimerobot.com) pings the site every 5 minutes from multiple regions and emails on downtime. Deliberately external to GitHub so it survives a GitHub outage. Dashboard + settings live in the UptimeRobot account, not in this repo.

See `CANVAS_MAN_PLAN.md` for the full conversion plan, deferred curation passes, and open questions.
