# Perino's CanvasMan — Website

Static website built with [Eleventy](https://www.11ty.dev/). Source content lives in Markdown + a single YAML data file; everything compiles to plain HTML that can be hosted on any web server.

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

See `CANVAS_MAN_PLAN.md` for the full conversion plan and open questions.
