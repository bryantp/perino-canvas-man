# Archived gallery images

Images moved out of the live site are stored here, organized by reason.

**Why archive instead of delete?** Source material from the original site is irreplaceable. If a customer asks about an old project or we want to revisit a category later, we still have the files.

---

## Low-resolution images (archived 2026-06-06)

Images with a minimum dimension below 500px were moved out of `src/images/gallery/` because they look poor when viewed at full size in the lightbox. Thumbnails would have been fine, but the gallery lets users click to view originals — a 400px image stretched to fill a desktop screen is visibly low-quality.

**Total archived:** 24 files

All files are preserved at their original path under `archive/low-resolution/` so they can be restored by moving back into `src/images/gallery/`.

### Files

| Category | Filename | Dimensions | Min dim | Size |
|---|---|---|---|---|
| `commercial/awnings` | `hpscands91231103238.jpg` | 800×490 | 490px | 63.4KB |
| `commercial/awnings` | `hpscands9123112595.jpg` | 800×481 | 481px | 60.1KB |
| `commercial/protect-covers` | `display-cart-cover-2.jpg` | 452×600 | 452px | 26.7KB |
| `commercial/protect-covers` | `display-cart-cover-3.jpg` | 452×600 | 452px | 45.1KB |
| `commercial/protect-covers` | `display-cart-cover.jpg` | 452×600 | 452px | 36.6KB |
| `marine/bimini-tops-and-enclosures` | `hpscands91231149383.jpg` | 502×323 | 323px | 29.9KB |
| `marine/bimini-tops-and-enclosures` | `hpscands912311532813.jpg` | 800×481 | 481px | 77.5KB |
| `marine/bimini-tops-and-enclosures` | `hpscands91231156438.jpg` | 616×318 | 318px | 40.4KB |
| `marine/bimini-tops-and-enclosures` | `hpscands912311565430.jpg` | 645×468 | 468px | 71.0KB |
| `marine/bimini-tops-and-enclosures` | `hpscands912311595656.jpg` | 683×455 | 455px | 37.5KB |
| `marine/bimini-tops-and-enclosures` | `p1010038.jpg` | 800×456 | 456px | 61.4KB |
| `marine/camper-backs` | `hpscands912311471538.jpg` | 568×294 | 294px | 31.7KB |
| `marine/enclosures` | `p1010054.jpg` | 800×488 | 488px | 53.1KB |
| `marine/upholstery` | `hpscands912311324014.jpg` | 733×470 | 470px | 51.8KB |
| `marine/upholstery` | `hpscands912311365733.jpg` | 721×476 | 476px | 50.1KB |
| `marine/upholstery` | `hpscands91231211756.jpg` | 445×507 | 445px | 28.5KB |
| `marine/upholstery` | `hpscands91231244613.jpg` | 571×345 | 345px | 30.9KB |
| `marine/upholstery` | `hpscands91231262517.jpg` | 603×434 | 434px | 43.3KB |
| `marine/upholstery` | `upholstery1.jpg` | 400×267 | 267px | 27.2KB |
| `residential/enclosures` | `hpscands9123115911.jpg` | 800×492 | 492px | 64.2KB |
| `residential/enclosures` | `hpscands9123118149.jpg` | 800×474 | 474px | 53.2KB |
| `residential/patio-awnings` | `p1000492.jpg` | 800×477 | 477px | 44.8KB |
| `residential/patio-awnings` | `p1000520.jpg` | 800×435 | 435px | 50.6KB |
| `residential/pool-cabana-covers` | `hpscands91231210125.jpg` | 498×474 | 474px | 59.6KB |

### Restoring

To bring an image back into the site:

```sh
# Example: restore one image
mv archive/low-resolution/marine/upholstery/upholstery1.jpg \
   src/images/gallery/marine/upholstery/
npm run build
```
