module.exports = function(ctx) {
  const { authMiddleware, DATA_DIR, fs, path } = ctx;
  const UglifyJS = require('uglify-js');

  function getUserFilesRoot(username) {
    const safe = username.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(DATA_DIR, safe, 'files');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
  }

  function safePath(root, rel) {
    const resolved = path.resolve(root, rel || '');
    if (!resolved.startsWith(root)) return null;
    return resolved;
  }

  return {
    routes: [
      // ── Minify a JS file ──
      {
        method: 'post',
        path: '/api/uglifyjs/minify',
        handlers: [authMiddleware, (req, res) => {
          const { filePath: fp, outputPath: op, options } = req.body;
          if (!fp || typeof fp !== 'string') return res.status(400).json({ error: 'filePath required' });

          const root = getUserFilesRoot(req.user.username);
          const resolved = safePath(root, fp);
          if (!resolved) return res.status(403).json({ error: 'Invalid path' });
          if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
            return res.status(404).json({ error: 'File not found' });
          }

          const ext = path.extname(resolved).toLowerCase();
          if (ext !== '.js') return res.status(400).json({ error: 'Only .js files are supported' });

          const originalSize = fs.statSync(resolved).size;
          let src;
          try { src = fs.readFileSync(resolved, 'utf-8'); } catch (e) {
            return res.status(500).json({ error: 'Cannot read file: ' + e.message });
          }

          // Build UglifyJS options from request (sanitized)
          const uglifyOpts = {};

          // Parse options
          if (options && options.parse) {
            uglifyOpts.parse = {};
            if (options.parse.bare_returns === true) uglifyOpts.parse.bare_returns = true;
            if (options.parse.shebang === false) uglifyOpts.parse.shebang = false;
          }

          // Compress options
          if (options && options.compress === false) {
            uglifyOpts.compress = false;
          } else if (options && typeof options.compress === 'object') {
            const c = options.compress;
            uglifyOpts.compress = {};
            const boolCompress = [
              'arrows', 'booleans', 'collapse_vars', 'comparisons', 'conditionals',
              'dead_code', 'drop_console', 'drop_debugger', 'evaluate', 'hoist_funs',
              'hoist_vars', 'hoist_props', 'if_return', 'join_vars', 'keep_fargs',
              'keep_infinity', 'loops', 'merge_vars', 'negate_iife', 'properties',
              'reduce_vars', 'reduce_funcs', 'sequences', 'side_effects', 'switches',
              'toplevel', 'typeofs', 'unused', 'varify',
              'unsafe', 'unsafe_comps', 'unsafe_Function', 'unsafe_math',
              'unsafe_proto', 'unsafe_regexp', 'unsafe_undefined'
            ];
            for (const k of boolCompress) {
              if (typeof c[k] === 'boolean') uglifyOpts.compress[k] = c[k];
            }
            if (typeof c.passes === 'number' && c.passes >= 1 && c.passes <= 10) {
              uglifyOpts.compress.passes = c.passes;
            }
            if (Array.isArray(c.pure_funcs)) {
              uglifyOpts.compress.pure_funcs = c.pure_funcs.filter(f => typeof f === 'string').slice(0, 50);
            }
            if (typeof c.global_defs === 'object' && c.global_defs !== null) {
              const defs = {};
              const keys = Object.keys(c.global_defs).slice(0, 50);
              for (const k of keys) {
                if (typeof k === 'string' && k.length <= 100) {
                  const v = c.global_defs[k];
                  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
                    defs[k] = v;
                  }
                }
              }
              uglifyOpts.compress.global_defs = defs;
            }
            if (typeof c.top_retain === 'string' && c.top_retain.length <= 500) {
              uglifyOpts.compress.top_retain = c.top_retain;
            }
          }

          // Mangle options
          if (options && options.mangle === false) {
            uglifyOpts.mangle = false;
          } else if (options && typeof options.mangle === 'object') {
            const m = options.mangle;
            uglifyOpts.mangle = {};
            if (typeof m.eval === 'boolean') uglifyOpts.mangle.eval = m.eval;
            if (typeof m.toplevel === 'boolean') uglifyOpts.mangle.toplevel = m.toplevel;
            if (Array.isArray(m.reserved)) {
              uglifyOpts.mangle.reserved = m.reserved.filter(r => typeof r === 'string').slice(0, 100);
            }
            if (typeof m.properties === 'object' && m.properties !== null) {
              uglifyOpts.mangle.properties = {};
              if (typeof m.properties.builtins === 'boolean') uglifyOpts.mangle.properties.builtins = m.properties.builtins;
              if (typeof m.properties.debug === 'boolean' || typeof m.properties.debug === 'string') uglifyOpts.mangle.properties.debug = m.properties.debug;
              if (typeof m.properties.keep_quoted === 'boolean') uglifyOpts.mangle.properties.keep_quoted = m.properties.keep_quoted;
              if (typeof m.properties.domprops === 'boolean') uglifyOpts.mangle.properties.domprops = m.properties.domprops;
              if (Array.isArray(m.properties.reserved)) {
                uglifyOpts.mangle.properties.reserved = m.properties.reserved.filter(r => typeof r === 'string').slice(0, 100);
              }
              if (typeof m.properties.regex === 'string' && m.properties.regex.length <= 200) {
                try { uglifyOpts.mangle.properties.regex = new RegExp(m.properties.regex); } catch {}
              }
            }
          }

          // Output options
          if (options && typeof options.output === 'object') {
            const o = options.output;
            uglifyOpts.output = {};
            const boolOutput = [
              'ascii_only', 'beautify', 'braces', 'inline_script',
              'keep_quoted_props', 'preserve_line', 'quote_keys',
              'semicolons', 'shebang', 'wrap_iife'
            ];
            for (const k of boolOutput) {
              if (typeof o[k] === 'boolean') uglifyOpts.output[k] = o[k];
            }
            if (typeof o.indent_level === 'number' && o.indent_level >= 0 && o.indent_level <= 16) {
              uglifyOpts.output.indent_level = o.indent_level;
            }
            if (typeof o.max_line_len === 'number' && o.max_line_len >= 0) {
              uglifyOpts.output.max_line_len = o.max_line_len;
            }
            if (typeof o.quote_style === 'number' && o.quote_style >= 0 && o.quote_style <= 3) {
              uglifyOpts.output.quote_style = o.quote_style;
            }
            if (typeof o.width === 'number' && o.width >= 0 && o.width <= 500) {
              uglifyOpts.output.width = o.width;
            }
            if (typeof o.preamble === 'string' && o.preamble.length <= 2000) {
              uglifyOpts.output.preamble = o.preamble;
            }
            if (o.comments === true || o.comments === false || o.comments === 'all' || o.comments === 'some') {
              uglifyOpts.output.comments = o.comments;
            }
          }

          // Toplevel
          if (options && typeof options.toplevel === 'boolean') uglifyOpts.toplevel = options.toplevel;
          // Keep fnames / fargs
          if (options && typeof options.keep_fnames === 'boolean') uglifyOpts.keep_fnames = options.keep_fnames;
          if (options && typeof options.keep_fargs === 'boolean') uglifyOpts.keep_fargs = options.keep_fargs;
          // Module
          if (options && typeof options.module === 'boolean') uglifyOpts.module = options.module;
          // IE
          if (options && typeof options.ie === 'boolean') uglifyOpts.ie = options.ie;
          // Webkit
          if (options && typeof options.webkit === 'boolean') uglifyOpts.webkit = options.webkit;
          // V8
          if (options && typeof options.v8 === 'boolean') uglifyOpts.v8 = options.v8;
          // Source map
          if (options && options.sourceMap === true) {
            uglifyOpts.sourceMap = { url: 'inline' };
          }

          // Run minification
          const fileName = path.basename(resolved);
          const result = UglifyJS.minify({ [fileName]: src }, uglifyOpts);
          if (result.error) {
            return res.json({
              ok: false,
              error: result.error.message || String(result.error),
              line: result.error.line,
              col: result.error.col
            });
          }

          // Determine output path
          let outResolved;
          if (op && typeof op === 'string') {
            outResolved = safePath(root, op);
          } else {
            const dir = path.dirname(resolved);
            const baseName = path.basename(resolved, '.js');
            outResolved = path.join(dir, baseName + '.min.js');
          }
          if (!outResolved) return res.status(403).json({ error: 'Invalid output path' });

          try {
            const outDir = path.dirname(outResolved);
            if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
            fs.writeFileSync(outResolved, result.code, 'utf-8');
          } catch (e) {
            return res.status(500).json({ error: 'Cannot write output: ' + e.message });
          }

          const minifiedSize = Buffer.byteLength(result.code, 'utf-8');
          const relOut = path.relative(root, outResolved).replace(/\\/g, '/');

          const resp = {
            ok: true,
            originalSize,
            minifiedSize,
            outputPath: relOut
          };
          if (result.warnings && result.warnings.length) {
            resp.warnings = result.warnings.slice(0, 50);
          }
          res.json(resp);
        }]
      },

      // ── Preview minification (no file write) ──
      {
        method: 'post',
        path: '/api/uglifyjs/preview',
        handlers: [authMiddleware, (req, res) => {
          const { code, options } = req.body;
          if (!code || typeof code !== 'string') return res.status(400).json({ error: 'code required' });
          if (code.length > 5 * 1024 * 1024) return res.status(400).json({ error: 'Code too large (max 5MB)' });

          const uglifyOpts = {};
          if (options && options.compress === false) uglifyOpts.compress = false;
          if (options && options.mangle === false) uglifyOpts.mangle = false;

          const result = UglifyJS.minify(code, uglifyOpts);
          if (result.error) {
            return res.json({
              ok: false,
              error: result.error.message || String(result.error),
              line: result.error.line,
              col: result.error.col
            });
          }
          res.json({
            ok: true,
            originalSize: Buffer.byteLength(code, 'utf-8'),
            minifiedSize: Buffer.byteLength(result.code, 'utf-8'),
            code: result.code.slice(0, 500000)
          });
        }]
      }
    ]
  };
};
