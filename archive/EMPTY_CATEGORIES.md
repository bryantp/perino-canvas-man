# Empty gallery categories

Generated automatically on every build by `src/_data/gallery.js`.

These category directories exist under `src/images/gallery/` but contain no images. They are silently skipped during the build: no page is generated, and they don't appear in area listings.

**Why this report exists:** so empty directories don't disappear unnoticed. If a category was emptied by curation (e.g. all photos archived) you may want to either repopulate it, delete the folder, or document why it's kept empty.

## Currently empty: 1

| Category path | Notes |
|---|---|
| `src/images/gallery/commercial/protect-covers/` | 3 file(s) in `archive/low-resolution/commercial/protect-covers/` |

### What to do

- **Add photos** — drop JPGs into the folder; the next build will pick them up.
- **Delete the folder** — if the category is no longer relevant: `rm -rf src/images/gallery/<area>/<category>/`.
- **Restore from archive** — check `archive/ARCHIVE_LOG.md` for previously-removed images and `mv` them back into the folder.
