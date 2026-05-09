# Photo Collage — AI Skill

## Capability
Photo collage maker with 12 predefined layout templates, canvas-based rendering, per-cell photo pan/zoom, adjustable spacing/border-radius/background, and PNG export. Fully client-side — no dedicated server endpoints.

## Architecture
Pure client-side Vue 3 Composition API app. All image processing happens on an HTML5 Canvas2D surface. No back-end routes are registered; the only server call is the generic filesystem write endpoint used when saving to files.

## Files
| File | Purpose |
|------|---------|
| `app.json` | Manifest — id `photo-collage`, category `productivity`, 13-language i18n |
| `component.js` | Vue component (IIFE), all logic: layouts, rendering, pan/zoom, export |
| `template.html` | Three-panel layout: photo list · canvas · template selector |
| `style.css` | Dark-theme styles, toolbar, panels, scrollbars |

## UI Layout (Three-Panel)
```
┌─────────────────────────────────────────────────────────┐
│  TOOLBAR  (Add Photos · Layout · Spacing · Radius ·     │
│            Background · Canvas Size · Download · Save)  │
├──────────┬──────────────────────────────┬───────────────┤
│  PHOTOS  │                              │  TEMPLATES    │
│  PANEL   │       CANVAS AREA            │  PANEL        │
│  180 px  │     (collage preview)        │  100 px       │
│          │                              │               │
├──────────┴──────────────────────────────┴───────────────┤
│  STATUS BAR  (photo count · canvas size · messages)     │
└─────────────────────────────────────────────────────────┘
```

## Layout Templates (12 Total)
Each layout is an array of cells with fractional `{x, y, w, h}` coordinates (0–1 range).

| Key | Name | Cells | Description |
|-----|------|-------|-------------|
| `grid2x2` | 2×2 Grid | 4 | Equal quadrants |
| `grid3x3` | 3×3 Grid | 9 | 3 rows × 3 columns |
| `grid2x1` | 2 Horizontal | 2 | Side-by-side vertical halves |
| `grid1x2` | 2 Vertical | 2 | Top-bottom horizontal halves |
| `grid2x3` | 2×3 Grid | 6 | 2 columns × 3 rows |
| `grid3x2` | 3×2 Grid | 6 | 3 columns × 2 rows |
| `gridBig1` | 1 Big + 2 | 3 | 60% left panel + 2 stacked right |
| `gridBig2` | 1 Big + 3 | 4 | 50% left panel + 3 stacked right |
| `mosaic1` | Mosaic A | 6 | Large top-left + 5 smaller tiles |
| `mosaic2` | Mosaic B | 5 | Asymmetric mosaic arrangement |
| `strip` | Strip | 4 | 4 equal vertical strips |
| `cross` | Cross | 5 | Plus/cross shape with center |

## Photo Management
- **Adding**: File input (`<input type="file" multiple accept="image/*">`) or drag-and-drop onto canvas/photo list.
- **Loading**: `FileReader.readAsDataURL()` → `new Image()` → stored as `{ id, img, thumb, name, panX, panY, zoom }`.
- **Reordering**: Drag-and-drop between photo list items; up/down arrow buttons.
- **Removal**: Per-photo delete button; "Clear All" resets everything.
- **Cell assignment**: Photos cycle through cells via `photos[i % photos.length]` — fewer photos repeat, excess photos are not shown.

## Canvas Rendering Pipeline
1. Fill entire canvas with `bgColor`.
2. For each cell in the selected layout:
   - Calculate pixel coordinates from fractional cell definition, applying `spacing` insets.
   - Clip to rounded rectangle (`borderRadius`).
   - Draw the assigned photo with **cover fit** (fills cell, crops overflow) + user pan/zoom offsets.
3. Triggered on every state change: layout switch, spacing/radius/bg change, photo add/remove/reorder, pan/zoom.

### Cover-Fit Algorithm
```
scale = max(cellWidth / imgWidth, cellHeight / imgHeight) × zoom
drawX = cellX + (cellWidth - imgWidth × scale) / 2 + panX
drawY = cellY + (cellHeight - imgHeight × scale) / 2 + panY
```

## User Interactions on Canvas
| Action | Behavior |
|--------|----------|
| **Mouse down + drag** | Pan the photo within its cell |
| **Mouse wheel** | Zoom the photo in its cell (0.3× to 5×) |
| **Click** | Select photo (highlights in photo list) |

Cell hit-detection iterates cells in reverse order to prioritize top-most overlapping cells.

## Canvas Configuration
| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| `spacing` | 0–30 px | 6 | Gap between cells and canvas edge |
| `borderRadius` | 0–30 px | 4 | Corner rounding of each cell |
| `bgColor` | Any color | `#1a1a2e` | Canvas background color |
| `canvasW` | 200–4000 px | 1200 | Output width in pixels |
| `canvasH` | 200–4000 px | 900 | Output height in pixels |

## Export / Save

### Download (PNG)
Creates an `<a>` element with `canvas.toDataURL('image/png')` as href and triggers click. Filename format: `collage-{timestamp}.png`.

### Save to Files
Uses the platform `FileDialog` API (if available) to let the user pick a save path:
```javascript
const result = await window.FileDialog.show({
  title: 'Save to Files',
  mode: 'save',
  filters: ['.png'],
  initialPath: '/photos'
});
```
Then writes via the generic filesystem endpoint:
```
POST /api/fs/write
Authorization: Bearer <token>
Content-Type: application/json
Body: { path: "<savePath>.png", content: "<base64>", encoding: "base64" }
```
Falls back to browser download if `FileDialog` is unavailable.

## Template Thumbnails
Each layout template has a 60×60 canvas preview rendered with color-coded cells (9 rotating colors, 70% opacity). Drawn on mount and re-drawn on locale change.

## Internationalization (i18n)
13 languages supported: `tr`, `en`, `de`, `fr`, `es`, `ru`, `zh`, `ja`, `it`, `ar`, `ko`, `hi`, `pt`.

Translation keys:
```
addPhotos, photos, layout, spacing, borderRadius, bgColor, canvasSize,
download, saveToFiles, clearAll, dropHint, emptyHint, templates,
saved, error, grid2x2, grid3x3, grid2x1, grid1x2, grid2x3, grid3x2,
gridBig1, gridBig2, mosaic1, mosaic2, strip, cross
```

Locale source: `localStorage.getItem('sys_locale')` (default: `tr`). Reacts to `locale-changed` window event.

## Reactive State (Vue refs)
| Ref | Type | Description |
|-----|------|-------------|
| `locale` | `string` | Current UI language |
| `layouts` | `Array` | All 12 layout definitions (rebuilt on locale change) |
| `selectedLayout` | `number` | Index of active layout |
| `photos` | `Array<{id, img, thumb, name, panX, panY, zoom}>` | Loaded photos |
| `selectedPhoto` | `number` | Index of highlighted photo (-1 = none) |
| `spacing` | `number` | Cell spacing in pixels |
| `borderRadius` | `number` | Cell corner radius in pixels |
| `bgColor` | `string` | Canvas background hex color |
| `canvasW` | `number` | Canvas width |
| `canvasH` | `number` | Canvas height |
| `statusMsg` | `string` | Temporary status message |

## CSS Class Prefix
All classes use `pc-` prefix (e.g., `pc-root`, `pc-toolbar`, `pc-canvas-area`, `pc-photos-panel`, `pc-templates-panel`).

## Key Design Decisions
- **No server dependency**: All processing is client-side; images never leave the browser until explicit save.
- **Canvas-based**: Uses Canvas2D instead of DOM elements for pixel-perfect rendering and easy PNG export.
- **Cover fit with pan/zoom**: Photos always fill their cell (no letterboxing) with user-adjustable positioning.
- **Cyclic photo assignment**: If there are fewer photos than cells, photos repeat cyclically to fill all cells.
- **Passive wheel prevention**: Mouse wheel listener added with `{ passive: false }` to prevent page scroll during zoom.

## Extending the App
- **Adding a new layout**: Push a new `{ name, cells: [{x,y,w,h}, ...] }` entry into the `buildLayouts()` return array. Add a translation key for the name in all 13 LANGS entries.
- **Adding export formats**: Extend `downloadCollage()` / `saveToFiles()` — use `canvas.toDataURL('image/jpeg', quality)` for JPEG or `canvas.toBlob()` for WebP.
- **Adding text overlays**: After the photo drawing loop in `renderCollage()`, use `ctx.fillText()` / `ctx.strokeText()` to draw text on top.
- **Adding filters**: Apply CSS-like filters via `ctx.filter` before drawing each photo (e.g., `ctx.filter = 'grayscale(1)'`).
