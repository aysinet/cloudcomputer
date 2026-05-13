# UglifyJS — AI Skill

## Capability
JavaScript minification, compression, and mangling using the UglifyJS engine. Supports full UglifyJS 3 options: compress, mangle, output formatting, source maps, and property mangling.

## Auth
JWT token required (`Authorization: Bearer <token>`).

## API Endpoints

### POST /api/uglifyjs/minify
Minifies a JavaScript file on the server and writes the output.

- **Body**:
  ```json
  {
    "filePath": "path/to/file.js",
    "outputPath": "path/to/output.min.js",
    "options": {
      "compress": {
        "dead_code": true,
        "drop_console": false,
        "drop_debugger": true,
        "unused": true,
        "conditionals": true,
        "sequences": true,
        "booleans": true,
        "loops": true,
        "passes": 1,
        "toplevel": false,
        "pure_funcs": ["Math.floor"],
        "unsafe": false,
        "global_defs": { "DEBUG": false }
      },
      "mangle": {
        "eval": false,
        "toplevel": false,
        "reserved": ["$", "require"],
        "properties": {
          "keep_quoted": false,
          "regex": "^_",
          "reserved": ["foo"]
        }
      },
      "output": {
        "beautify": false,
        "semicolons": true,
        "comments": false,
        "quote_style": 0,
        "indent_level": 4,
        "max_line_len": 0,
        "wrap_iife": false,
        "preamble": "/* Copyright */",
        "ascii_only": false
      },
      "keep_fnames": false,
      "keep_fargs": false,
      "module": false,
      "toplevel": false,
      "ie": false,
      "webkit": false,
      "v8": false,
      "sourceMap": true
    }
  }
  ```
- **filePath** (required): Relative path to a `.js` file within the user's files directory.
- **outputPath** (optional): Relative path for the output file. Defaults to `{basename}.min.js` next to the source file.
- **options** (optional): UglifyJS minification options object. All sub-options are optional and default to UglifyJS defaults.
  - Set `"compress": false` to skip compression entirely.
  - Set `"mangle": false` to skip name mangling.
- **Response (success)**:
  ```json
  {
    "ok": true,
    "originalSize": 15230,
    "minifiedSize": 5120,
    "outputPath": "scripts/app.min.js",
    "warnings": ["Dropping unused variable x [file.js:10,4]"]
  }
  ```
- **Response (parse error)**:
  ```json
  {
    "ok": false,
    "error": "Unexpected token: keyword (else)",
    "line": 1,
    "col": 7
  }
  ```

### POST /api/uglifyjs/preview
Minifies JavaScript code in-memory without writing any file. Useful for quick previews.

- **Body**:
  ```json
  {
    "code": "function add(a, b) { return a + b; }",
    "options": {
      "compress": true,
      "mangle": true
    }
  }
  ```
- **code** (required): JavaScript source code string (max 5MB).
- **options** (optional): Simplified options — `compress` and `mangle` can be `true`/`false`.
- **Response**:
  ```json
  {
    "ok": true,
    "originalSize": 36,
    "minifiedSize": 22,
    "code": "function add(d,n){return d+n}"
  }
  ```

## Compress Options Reference
Key compress options that can be set:
- `dead_code` — remove unreachable code
- `drop_console` — discard `console.*` calls
- `drop_debugger` — remove `debugger` statements
- `unused` — drop unreferenced functions/variables
- `conditionals` — optimize if-statements
- `sequences` — join consecutive statements with comma
- `booleans` — boolean context optimizations
- `loops` — loop optimizations
- `passes` (1-10) — number of compression passes
- `toplevel` — drop unused top-level vars/funcs
- `pure_funcs` — array of side-effect-free function names
- `global_defs` — compile-time constants
- `unsafe` — enable potentially unsafe transforms

## Mangle Options Reference
- `eval` — mangle in eval/with scopes
- `toplevel` — mangle top-level names
- `reserved` — array of names to preserve
- `properties` — object for property mangling:
  - `keep_quoted` — only mangle unquoted props
  - `regex` — only mangle matching prop names
  - `reserved` — property names to preserve

## Output Options Reference
- `beautify` — format output readably
- `semicolons` — use semicolons as separators
- `comments` — `false`, `"all"`, or `"some"` (keep licensed)
- `quote_style` — 0 (auto), 1 (single), 2 (double), 3 (original)
- `indent_level` — spaces per indent (when beautified)
- `max_line_len` — max output line length
- `wrap_iife` — wrap IIFEs in parens
- `preamble` — prepend comment (e.g. license)
- `ascii_only` — escape non-ASCII characters

## Notes
- Only `.js` files are supported.
- Operates on user file system under `data/users/{username}/files/`.
- Path traversal is prevented (paths must resolve within user's root).
- The `preview` endpoint does not write files; use `minify` for persistent output.
- Property mangling (`mangle.properties`) can break code — use with caution.
- For fast minification (whitespace + mangle only), set `compress: false`.
