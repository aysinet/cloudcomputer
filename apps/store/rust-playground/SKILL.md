# Rust Playground — AI Skill

## Capability
Browser-based Rust code editor, compiler, and runner. Write, compile, execute, format, and share Rust code directly in the browser using the official Rust Playground backend API (`play.rust-lang.org`). Features a full Monaco editor with Rust syntax highlighting, multiple compiler channels (Stable/Beta/Nightly), edition selection (2015–2024), debug/release build modes, code formatting via `rustfmt`, Gist-based code sharing, and local file import/export.

## Type
Internal client-side app (no server-side endpoints). All compilation and formatting requests are sent directly from the browser to the official Rust Playground API at `https://play.rust-lang.org`. No Docker container, no local backend routes.

## Auth
No Cloud Computer JWT token required — this app has no server-side API endpoints. The official Rust Playground API is publicly accessible and requires no authentication.

## External API Endpoints (play.rust-lang.org)

### POST https://play.rust-lang.org/execute
Compiles and runs Rust code on the official Rust Playground server.
**Request Body**:
```json
{
  "channel": "stable|beta|nightly",
  "mode": "debug|release",
  "edition": "2015|2018|2021|2024",
  "crateType": "bin",
  "tests": false,
  "code": "fn main() { println!(\"Hello\"); }",
  "backtrace": false
}
```
**Response**:
```json
{
  "success": true,
  "stdout": "Hello\n",
  "stderr": ""
}
```
On compilation failure, `success` is `false` and `stderr` contains the compiler error messages with line numbers, error codes, and suggestions.

### POST https://play.rust-lang.org/format
Formats Rust code using `rustfmt` (the official Rust formatter).
**Request Body**:
```json
{
  "channel": "stable|beta|nightly",
  "edition": "2015|2018|2021|2024",
  "code": "fn main(){println!(\"Hello\");}"
}
```
**Response (success)**:
```json
{
  "success": true,
  "code": "fn main() {\n    println!(\"Hello\");\n}\n"
}
```
**Response (failure)**:
```json
{
  "success": false,
  "stderr": "error[E0308]: ..."
}
```

### POST https://play.rust-lang.org/meta/gist/
Creates a GitHub Gist with the provided Rust code for sharing.
**Request Body**:
```json
{
  "code": "fn main() { println!(\"Hello\"); }"
}
```
**Response**:
```json
{
  "id": "abc123def456",
  "url": "https://gist.github.com/abc123def456",
  "code": "fn main() { println!(\"Hello\"); }"
}
```
The generated share URL follows the pattern:
`https://play.rust-lang.org/?version={channel}&mode={mode}&edition={edition}&gist={id}`

## Editor
- **Engine**: Monaco Editor loaded from CDN (`cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2`)
- **Language**: Rust syntax highlighting, bracket pair colorization, code folding
- **Theme**: `vs-dark` (dark theme matching the app's color scheme)
- **Font**: Cascadia Code / Fira Code / Consolas monospace
- **Features**: Auto-layout, smooth scrolling, cursor blinking, quick suggestions, whitespace rendering

## Keyboard Shortcuts
| Shortcut | Action |
|---|---|
| `Ctrl+Enter` / `Cmd+Enter` | Compile and run the code |
| `Ctrl+Shift+F` / `Cmd+Shift+F` | Format code with rustfmt |
| `Ctrl+S` / `Cmd+S` | Save code as local `.rs` file |

## Compiler Options

### Channels
- **Stable** — Latest stable Rust release (default, recommended)
- **Beta** — Upcoming stable release candidate
- **Nightly** — Bleeding-edge features, unstable APIs, experimental syntax

### Editions
- **2021** — Current default edition (default selection)
- **2024** — Latest edition with newest language improvements
- **2018** — Legacy edition with NLL borrow checker
- **2015** — Original Rust edition

### Build Modes
- **Debug** — Unoptimized build with debug assertions and overflow checks (faster compilation)
- **Release** — Optimized build with `-O` flag (slower compilation, faster execution)

## Output Panel
The output panel displays compilation and execution results in tabbed sections:
- **Output** (`stdout`) — Standard output from the compiled program
- **Errors** (`stderr`) — Compiler warnings, errors, and diagnostic messages with error codes
- **ASM** — Assembly output (when available from compile-only operations)
- **LLVM IR** — LLVM intermediate representation
- **MIR** — Mid-level intermediate representation
- **WASM** — WebAssembly output

The panel includes execution time display and is resizable via drag handle.

## Features
- **Compile & Run**: Execute Rust code with full standard library support on the official Rust Playground server
- **Multi-Channel Compilation**: Switch between Stable, Beta, and Nightly Rust compilers
- **Edition Selection**: Choose Rust edition (2015, 2018, 2021, 2024) for language feature availability
- **Debug/Release Modes**: Toggle between unoptimized debug and optimized release builds
- **Code Formatting**: One-click `rustfmt` formatting via the Playground API
- **Gist Sharing**: Upload code as a GitHub Gist and generate a shareable Rust Playground link
- **Monaco Editor**: Full-featured code editor — syntax highlighting, bracket matching, code folding, minimap, search/replace
- **Local File Import**: Open `.rs` files from the local filesystem via file picker
- **Local File Export**: Save the current code as a `.rs` file download
- **Resizable Output Panel**: Drag to resize the output area between editor and console
- **Tabbed Output**: Separate tabs for stdout, stderr, ASM, LLVM IR, MIR, and WASM output
- **Execution Metrics**: Displays compilation + execution time for each run
- **Exit Code Display**: Shows success (✅) or failure (❌) with exit code in the status bar
- **Cursor Position Tracking**: Real-time line and column display in the status bar
- **13-Language Localization**: Full UI translations for tr, en, de, fr, es, ru, zh, ja, it, ar, ko, hi, pt
- **Keyboard Shortcuts**: Ctrl+Enter (run), Ctrl+Shift+F (format), Ctrl+S (save)

## Storage
No server-side storage. All code is ephemeral (in-editor memory only). Users can manually save code as local `.rs` files or share via Gist links for persistence.

## Notes
- This app requires an internet connection to compile and run code — all compilation happens on the official Rust Playground server (`play.rust-lang.org`)
- The Rust Playground API is rate-limited by Mozilla/Rust Foundation infrastructure; very frequent requests may be throttled
- Maximum code size accepted by the Playground API is approximately 50,000 characters
- Compilation timeout on the Playground server is typically 10–15 seconds; long-running programs may be killed
- The Playground server supports most of the Rust standard library but does not support network access, file I/O, or FFI from within compiled programs
- Popular crates from the top-100 on crates.io are pre-installed on the Playground server and can be used with `use` / `extern crate` statements
- The Monaco editor is loaded lazily from CDN on first mount — requires a one-time download of ~2 MB
- No Docker container or local Rust toolchain is needed — everything runs remotely on Mozilla's infrastructure
- Gist sharing creates a public GitHub Gist; shared code is publicly accessible to anyone with the link
