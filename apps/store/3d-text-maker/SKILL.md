# 3D Text Maker — AI Skill

## Capability
Client-side 3D text design and rendering application. Creates stylized 3D text with customizable fonts, ten distinct 3D effects, thirteen animation types, and multi-format export. Renders everything on HTML5 Canvas with real-time preview. Supports saving output as PNG, JPG, animated GIF, and WebM video to the server filesystem, or downloading locally.

## Type
Internal (client-side) Vue component app. No Docker container or backend service — runs entirely in the browser. Uses Canvas 2D API for rendering and `gif.js` (CDN-loaded) for GIF encoding, `MediaRecorder` API for video capture.

## App Metadata
- **ID**: `3d-text-maker`
- **Icon**: 🔤
- **Category**: `designer`
- **Default Window Size**: 1150 × 750
- **Global**: false

## Architecture

### Files
| File | Purpose |
|---|---|
| `app.json` | App manifest — ID, name, icon, category, size, multilingual labels |
| `component.js` | Vue 3 Composition API component — all logic, rendering, animation, export |
| `template.html` | Vue template — toolbar, left settings panel, canvas preview area |
| `style.css` | Scoped dark-theme styling (`.tdm-*` prefix) |

### Component Structure
Single Vue component using `setup()` with Composition API (`ref`, `reactive`, `computed`, `watch`, `onMounted`, `onUnmounted`). No external UI framework. All rendering performed via Canvas 2D context.

**Key reactive state groups:**
- **Text state**: `text`, `fontFamily`, `fontSize`, `textColor`, `bgColor`, `canvasW`, `canvasH`, `textAlign`, `bold`, `italic`
- **3D effect state**: `effect3d` (selected effect), plus per-effect params (`depthColor`, `depthLength`, `depthAngle`, `outlineColor`, `outlineWidth`, `shadowColor`, `shadowBlur`, `shadowOffX`, `shadowOffY`, `bevelLight`, `bevelDark`, `bevelSize`, `glossOpacity`, `neonGlow`, `neonBlur`, `retroLayers`, `retroSpread`, `embossStrength`)
- **Animation state**: `animEnabled`, `animType`, `animDuration`, `loopAnim`, `animEasing`
- **Export state**: `exportFormat`, `exportFps`, `exporting`, `exportProgress`

## Features

### Text Controls
- **Text input**: Multi-line textarea, renders any Unicode text
- **Font selection**: Opens shared `FontSelectDialog` for browsing and selecting fonts (system + Google Fonts)
- **Font size**: Range 12–300 px
- **Text color & background color**: Color picker inputs
- **Bold / Italic**: Toggle buttons
- **Text alignment**: Left, Center, Right

### 3D Effects (10 types)
Each effect has its own configurable parameters displayed conditionally in the left panel:

| Effect | Key | Parameters |
|---|---|---|
| 🧱 Depth / Extrude | `depth` | `depthLength` (1–30), `depthAngle` (0–360°), `depthColor` |
| 🌑 Drop Shadow | `shadow` | `shadowColor`, `shadowBlur` (0–50), `shadowOffX` (-30–30), `shadowOffY` (-30–30) |
| ✏️ Outline | `outline` | `outlineColor`, `outlineWidth` (1–20) |
| 🔲 Bevel | `bevel` | `bevelLight` color, `bevelDark` color, `bevelSize` (1–10) |
| ✨ Glossy | `gloss` | `glossOpacity` (0–1, step 0.05) |
| 💡 Neon Glow | `neon` | `neonGlow` color, `neonBlur` (5–60) |
| 🎞️ Retro / Layered | `retro` | `retroLayers` (2–12), `retroSpread` (1–10) |
| 🪨 Emboss | `emboss` | `embossStrength` (1–10) |
| 🪞 Chrome | `chrome` | No extra params — uses metallic gradient with outline |
| 🥇 Gold | `gold` | No extra params — uses gold gradient with dark extrusion |

### Animations (13 types)
Animations are toggled via an enable switch. When enabled, user selects an animation type:

| Animation | Key | Description |
|---|---|---|
| — None — | `none` | Static text only |
| 🔄 Rotate Y | `rotateY` | Horizontal flip via `scaleX(cos(...))` |
| 🔃 Rotate X | `rotateX` | Vertical flip via `scaleY(cos(...))` |
| 🌀 Rotate Z | `rotateZ` | Full spin rotation |
| 🌗 Fade In/Out | `fadeInOut` | Sinusoidal alpha oscillation |
| ⬅️ Slide from Left | `slideLeft` | Translate from off-screen left |
| ➡️ Slide from Right | `slideRight` | Translate from off-screen right |
| ⬆️ Slide from Top | `slideTop` | Translate from off-screen top |
| ⬇️ Slide from Bottom | `slideBottom` | Translate from off-screen bottom |
| 🔍 Zoom In | `zoomIn` | Scale from 0 to 1 |
| ⚾ Bounce | `bounce` | Bouncing vertical motion with damping |
| ⌨️ Typewriter | `typewriter` | Characters appear progressively |
| 🌊 Wave | `wave` | Per-character sinusoidal vertical offset |

**Animation parameters:**
- **Duration**: 0.5–10 seconds (step 0.5)
- **Easing**: `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`
- **Loop**: Toggle on/off
- **Preview controls**: Play / Stop buttons
- **FPS**: 5–30 (for GIF/Video export)

### Export
- **PNG**: Still image saved to server via `/api/fs/write-binary` — uses `FileDialog.save()` for path selection
- **JPG**: Still image (quality 0.92) saved to server
- **GIF**: Animated GIF — requires animation enabled; uses `gif.js` library loaded from CDN with Web Workers; frame-by-frame rendering
- **Video (WebM)**: Animated video — uses `MediaRecorder` API with `captureStream()`; supports VP9/VP8 codecs; frame-by-frame canvas rendering
- **Download**: Direct PNG download to local device via data URL + anchor click

**Export flow:**
1. User clicks export button → `FileDialog.save()` opens for path selection
2. Progress bar shows encoding progress (0–100%)
3. Rendered output is base64-encoded and sent to `/api/fs/write-binary`
4. Success/error shown via `ElMessage` toast

### Canvas
- **Configurable dimensions**: Width 200–2000 px, Height 100–1200 px
- **Default**: 800 × 400 px
- **Dual canvas system**: `previewCanvas` (displayed) and `captureCanvas` (for export frame rendering)
- **Real-time updates**: All property changes trigger `updatePreview()` via Vue watchers

## Rendering Pipeline

### `render3DText(ctx, w, h, progress)`
Main render function:
1. Clears canvas and fills background color
2. Sets font string: `[italic] [bold] {size}px "{family}"`
3. Calculates text position based on alignment
4. Applies animation transform based on `progress` (0–1):
   - Saves canvas state, translates to text origin
   - Applies geometric transforms (scale, rotate, translate) or adjusts alpha/charProgress/waveOffset
5. Calls `draw3DEffect()` or `drawWaveText()` (for wave animation, per-character rendering)
6. Restores canvas state

### `draw3DEffect(ctx, txt, x, y, eff, fStyle)`
Dispatches to specific drawing functions based on selected effect:
- `drawDepth()` — Iterates depth layers at angle offset, then draws front face
- `drawDropShadow()` — Uses Canvas `shadowColor/shadowBlur/shadowOffset`
- `drawOutline()` — `strokeText()` then `fillText()`
- `drawBevel()` — Light offset copies + dark offset copies + fill
- `drawGlossy()` — Shadow + `source-atop` composite linear gradient overlay
- `drawNeon()` — Triple-pass glow with increasing blur, white center
- `drawRetro()` — Multi-color layered offsets from a preset palette
- `drawEmboss()` — Light/dark offset copies + fill
- `drawChrome()` — Multi-stop grey gradient + outline + shadow
- `drawGold()` — Gold gradient + dark extrusion + stroke

## External Dependencies
- **gif.js** (v0.2.0): Loaded from CDN (`cdnjs.cloudflare.com`) on first GIF export. Uses Web Workers for encoding. Loaded via dynamic `<script>` injection with AMD `define` workaround.
- **FontSelectDialog**: Shared Cloud Computer utility for font browsing/selection (`window.FontSelectDialog`)
- **FileDialog**: Shared Cloud Computer utility for server-side file save dialog (`window.FileDialog`)
- **ElMessage**: Shared Cloud Computer toast notification utility (`window.ElMessage`)

## API Endpoints Used

### POST /api/fs/write-binary
Saves exported image/GIF/video to server filesystem.
**Headers**: `Authorization: Bearer {jwt_token}`, `Content-Type: application/json`
**Body**: `{ "filePath": "/path/to/file.png", "content": "<base64-encoded-data>" }`
**Response**: `{ ok: true }` on success

## UI Layout
- **Toolbar** (top): Font button + font name, export buttons (PNG, JPG, GIF, Video, Download), canvas size inputs, progress bar
- **Left Panel** (280px, scrollable): Three collapsible sections — Text, 3D Effect, Animation
- **Canvas Area** (flex, centered): Preview canvas with shadow wrapper, dark background (#12121e)

## CSS Naming Convention
All CSS classes use the `.tdm-` prefix (3D Text Maker). Dark theme with `#1e1e2e` base, `#6366f1` (indigo) accent color. Styled scrollbar, custom toggle switches, range sliders with accent color.

## Notes
- Fully client-side — no server round-trips for rendering; only export saving hits the API
- Canvas dimensions are customizable but preview auto-scales within the available area (`max-width/max-height: 100%`)
- Wave animation renders each character individually with `measureText()` for accurate per-character positioning
- Chrome and Gold effects use no user-configurable parameters — they apply preset gradient palettes
- GIF export quality is fixed at 10 (gif.js quality setting, lower = better), workers = 2
- Video export uses real-time frame delays (`setTimeout`) to feed `MediaRecorder`; actual export may take as long as the animation duration
- The `loadScript()` helper prevents AMD conflicts by temporarily undefining `window.define`
- All Vue watchers trigger `nextTick(updatePreview)` to ensure DOM is settled before canvas redraw
- Animation loop uses `requestAnimationFrame` for smooth 60fps preview playback
- The component properly cleans up by canceling animation frames on unmount
