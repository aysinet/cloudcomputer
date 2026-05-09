# PDF Writer — AI Tool Skill

## App Info
- **ID**: `pdf-writer`
- **Type**: internal (Vue 3 component)
- **Icon**: 📝
- **Window Size**: 960×680
- **External Library**: jsPDF 2.5.2 (loaded from CDN at runtime)
- **Data Storage**: User files saved to `data/users/{username}/files/documents/`

## Capabilities
- **Rich Text Editing**: WYSIWYG editor with contenteditable, supports bold, italic, underline, strikethrough
- **Block Types**: Headings (H1, H2, H3), paragraphs
- **Font Customization**: 5 font families (Serif, Sans-serif, Monospace, Georgia, Verdana), 15 font sizes (8–72px), text color picker
- **Text Alignment**: Left, center, right, justify
- **Lists**: Bullet (unordered) and numbered (ordered) lists
- **Image Insertion**: Embed images from local file via base64 data URL
- **Table Insertion**: Configurable rows (1–20) and columns (1–10), rendered with borders
- **Horizontal Line**: Insert `<hr>` dividers
- **Multi-Page Documents**: Add/delete pages, page tab navigation
- **Page Settings**: Page size (A4, A3, Letter, Legal), orientation (portrait/landscape), configurable margins (top/bottom/left/right in mm)
- **Header & Footer**: Custom text rendered on every page of the PDF
- **PDF Preview**: In-app iframe preview of generated PDF (blob URL)
- **PDF Download**: Client-side PDF generation and browser download via jsPDF
- **Save to Server**: Saves generated PDF as base64 binary to server filesystem
- **New Document**: Reset editor to blank state
- **Internationalization**: 13 languages (tr, en, de, fr, es, ru, zh, ja, it, ar, ko, hi, pt)

## Architecture

### Client-Side Only (No Dedicated Server Endpoints)
This app does **not** have its own API routes on the server. It uses the shared filesystem API for saving PDFs.

### CDN Dependency Loading
jsPDF is loaded dynamically at runtime with fallback URLs:
1. `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js`
2. `https://unpkg.com/jspdf@2.5.2/dist/jspdf.umd.min.js`
3. `https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js`

AMD/RequireJS `define` and `require` globals are temporarily removed during script loading to avoid conflicts with Monaco Editor's AMD loader.

### PDF Generation Pipeline
1. User edits pages in contenteditable `<div>` elements
2. HTML content is parsed via `DOMParser`
3. DOM nodes are walked recursively (`processNode`) to convert to jsPDF draw calls
4. Supported HTML → PDF mappings:
   - `<h1>–<h3>` → sized/bold text
   - `<p>`, `<div>` → normal paragraphs
   - `<b>`, `<strong>` → bold font style
   - `<i>`, `<em>` → italic font style
   - `<u>` → underline (text only, no PDF underline)
   - `<img src="data:image/...">` → embedded JPEG image
   - `<table>` → cell grid with borders
   - `<ul>`, `<ol>` → bulleted/numbered list items
   - `<hr>` → horizontal line
   - Inline `style` attributes: `font-size`, `color`, `text-align`

## API Endpoints Used

### POST /api/fs/write-binary
Saves the generated PDF to the server filesystem.
- **Auth**: JWT token required (`Authorization: Bearer <token>`)
- **Body**:
  ```json
  {
    "filePath": "/documents/{filename}.pdf",
    "content": "<base64-encoded-pdf-data>"
  }
  ```
- **Response**: `{ ok: true, name: string, path: string, size: number }`
- **Storage**: `data/users/{username}/files/documents/{filename}.pdf`
- **Filename Sanitization**: Non-alphanumeric chars (except `_`, `-`, `.`, space) are replaced with `_`

## Component Structure

### Files
| File | Purpose |
|------|---------|
| `app.json` | App manifest — metadata, icon, multilingual names/descriptions |
| `component.js` | Vue 3 setup() component — all logic, state, PDF generation |
| `template.html` | Vue template — toolbar, format bar, editor, settings panel, dialogs |
| `style.css` | Catppuccin Mocha dark theme styles |

### Key Reactive State
| Variable | Type | Description |
|----------|------|-------------|
| `fileName` | `ref('')` | User-defined PDF filename |
| `pages` | `ref([{id, content}])` | Array of page objects with HTML content |
| `currentPage` | `ref(0)` | Active page index |
| `pageSize` | `ref('a4')` | Selected page size (a4/a3/letter/legal) |
| `orientation` | `ref('portrait')` | Page orientation |
| `margins` | `reactive({top,bottom,left,right})` | Margins in mm (default: 20/20/15/15) |
| `headerText` | `ref('')` | Header text for all pages |
| `footerText` | `ref('')` | Footer text for all pages |
| `mode` | `ref('edit')` | Current mode: `edit` or `preview` |
| `isSaving` | `ref(false)` | Save-in-progress flag |
| `currentFontSize` | `ref(14)` | Active font size in px |
| `currentFontFamily` | `ref('serif')` | Active font family |
| `currentTextColor` | `ref('#000000')` | Active text color |
| `showSettings` | `ref(false)` | Settings panel visibility |
| `showTableDialog` | `ref(false)` | Table insert dialog visibility |
| `tableRows` | `ref(3)` | Rows for table insertion |
| `tableCols` | `ref(3)` | Columns for table insertion |

### Key Methods
| Method | Description |
|--------|-------------|
| `loadJsPDF()` | Loads jsPDF from CDN with 3-URL fallback |
| `execCmd(cmd, val)` | Executes `document.execCommand` for formatting |
| `syncContent()` | Syncs contenteditable innerHTML to reactive page data |
| `buildPDF()` | Constructs jsPDF document from all pages |
| `savePDF()` | Generates PDF → base64 → POST to `/api/fs/write-binary` |
| `downloadPDF()` | Generates PDF → triggers browser download |
| `togglePreview()` | Switches between edit and preview (iframe with blob URL) |
| `newDocument()` | Resets all state to blank document |
| `addPage()` / `deletePage()` | Page management |
| `insertTable()` | Inserts HTML table into editor at cursor |
| `triggerImageInsert()` | Opens file picker for image insertion |
| `changeFontSize(size)` | Applies font size via execCommand + style override |
| `changeFontFamily(family)` | Applies font family via execCommand |
| `changeTextColor(color)` | Applies text color via execCommand |
| `setBlockType(tag)` | Changes block to h1/h2/h3/p via formatBlock |
| `insertBulletList()` | Inserts unordered list |
| `insertNumberedList()` | Inserts ordered list |
| `insertHR()` | Inserts horizontal rule |

## UI Layout

```
┌─────────────────────────────────────────────────────┐
│ [📄 New] [💾 Save to Server] [📥 Download] [👁/✏️] [⚙]│  ← Top Toolbar
├─────────────────────────────────────────────────────┤
│ [Block▾][Font▾][Size▾][🎨] │ B I U S │ ⫷≡⫸☰ │ •≡1≡│  ← Format Bar
│ [🖼][─][⊞]                                          │
├────────┬────────────────────────────────────────────┤
│ ⚙      │ [Page 1] [Page 2] [+] [🗑]                │  ← Page Tabs
│ Page   │┌──────────────────────────────────────────┐│
│ Size   ││                                          ││
│ Orient ││         White Paper Area                  ││
│ Margins││         (contenteditable)                 ││
│ Header ││                                          ││
│ Footer ││                                          ││
│ Name   ││                                          ││
│        │└──────────────────────────────────────────┘│
└────────┴────────────────────────────────────────────┘
```

## Page Size Constants (mm)
| Size | Width | Height |
|------|-------|--------|
| A4 | 210 | 297 |
| A3 | 297 | 420 |
| Letter | 215.9 | 279.4 |
| Legal | 215.9 | 355.6 |

## CSS Class Prefix
All CSS classes use the `pw-` prefix (PDF Writer):
- `.pw-root` — Root container (flex column, dark theme)
- `.pw-toolbar` — Top action toolbar
- `.pw-format-bar` — Text formatting toolbar
- `.pw-body` — Main content area (flex row)
- `.pw-settings-panel` — Left settings sidebar (200px)
- `.pw-editor-area` — Editor container
- `.pw-page-tabs` — Page tab strip
- `.pw-paper-scroll` — Scrollable paper viewport
- `.pw-paper` — White paper background (210mm width)
- `.pw-editor-page` — Contenteditable editor area per page
- `.pw-preview-wrap` / `.pw-preview-iframe` — PDF preview
- `.pw-dialog-overlay` / `.pw-dialog` — Modal dialog for table insertion
- `.pw-tbtn` — Toolbar buttons (`.pw-tbtn-accent` for primary actions)
- `.pw-fbtn` — Format bar buttons
- `.pw-select` — Dropdown selects
- `.pw-sinput` — Settings text inputs
- `.pw-num` — Numeric inputs
- `.pw-sep` — Vertical separator
- `.pw-color` — Color picker input

## Theme
Catppuccin Mocha palette:
- Background: `#1e1e2e` (base), `#181825` (mantle), `#11111b` (crust)
- Surface: `#313244` (surface0), `#45475a` (surface1)
- Text: `#cdd6f4` (text), `#a6adc8` (subtext)
- Accent: `#89b4fa` (blue), `#74c7ec` (sapphire)
- Error: `#f38ba8` (red)
- Success: `#a6e3a1` (green)

## Limitations & Notes
- PDF generation is entirely client-side using jsPDF — no server-side rendering
- Images must be base64 data URLs (no external URL fetch in PDF)
- Table rendering in PDF is simplified (no merged cells, no styling)
- Font embedding is limited to jsPDF built-in fonts (Helvetica family)
- `document.execCommand` is used for rich text editing (deprecated but functional)
- Undo/Redo relies on browser native contenteditable undo stack
- Preview mode generates a full PDF blob and displays in an iframe
- Page content overflow is not auto-paginated — user manages pages manually
- Footer always includes page numbers (`Page X/Y`) even if footer text is empty
