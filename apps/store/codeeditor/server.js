/**
 * Code Editor — Plugin server.js
 *
 * Backend plugin for code execution: multi-language code runner with
 * compile/interpret support, sandboxed tmp directory, and timeout enforcement.
 */
module.exports = function(ctx) {
  const { authMiddleware, DATA_DIR, ensureDir, fs, path } = ctx;
  const { execFile } = require('child_process');

  const CODE_RUNNERS = {
    javascript: { cmd: 'node', ext: '.js' },
    python: { cmd: 'python', ext: '.py' },
    go: { cmd: 'go', ext: '.go', args: ['run'] },
    php: { cmd: 'php', ext: '.php' },
    c: { cmd: null, ext: '.c', compile: true, compiler: 'gcc', outExt: '.exe', compileArgs: ['-o'] },
    cpp: { cmd: null, ext: '.cpp', compile: true, compiler: 'g++', outExt: '.exe', compileArgs: ['-o'] },
    csharp: { cmd: 'dotnet-script', ext: '.csx' },
    java: { cmd: null, ext: '.java', compile: true, compiler: 'javac', javaRun: true },
    rust: { cmd: null, ext: '.rs', compile: true, compiler: 'rustc', outExt: '.exe', compileArgs: ['-o'] },
    typescript: { cmd: 'npx', ext: '.ts', args: ['ts-node'] },
    ruby: { cmd: 'ruby', ext: '.rb' },
    perl: { cmd: 'perl', ext: '.pl' },
    bash: { cmd: 'bash', ext: '.sh' },
    powershell: { cmd: 'powershell', ext: '.ps1', args: ['-ExecutionPolicy', 'Bypass', '-File'] }
  };

  return {
    routes: [
      {
        method: 'post',
        path: '/api/code/run',
        handlers: [authMiddleware, (req, res) => {
          const { code, language } = req.body;
          if (!code || !language) return res.status(400).json({ error: 'code and language required' });

          const runner = CODE_RUNNERS[language];
          if (!runner) return res.status(400).json({ error: 'Unsupported language: ' + language });

          const safe = req.user.username.replace(/[^a-zA-Z0-9_-]/g, '_');
          const tmpDir = path.join(DATA_DIR, safe, 'code-tmp');
          ensureDir(tmpDir);

          const fileBase = 'run_' + Date.now();
          const srcFile = path.join(tmpDir, fileBase + runner.ext);
          fs.writeFileSync(srcFile, code, 'utf-8');

          const cleanup = (files) => {
            for (const f of files) { try { fs.unlinkSync(f); } catch {} }
          };

          const timeout = 15000; // 15s max

          if (runner.compile) {
            // Compile then run
            const outFile = path.join(tmpDir, fileBase + (runner.outExt || ''));
            let compileCmd, compileArgs;

            if (runner.javaRun) {
              compileCmd = runner.compiler;
              compileArgs = [srcFile];
            } else {
              compileCmd = runner.compiler;
              compileArgs = [...(runner.compileArgs || []), outFile, srcFile];
            }

            execFile(compileCmd, compileArgs, { timeout, cwd: tmpDir }, (compErr, compOut, compStderr) => {
              if (compErr) {
                cleanup([srcFile]);
                return res.json({ output: '', error: (compStderr || compErr.message || '').slice(0, 5000), exitCode: compErr.code || 1 });
              }

              let runCmd, runArgs;
              if (runner.javaRun) {
                const className = (code.match(/public\s+class\s+(\w+)/) || [, fileBase])[1];
                runCmd = 'java';
                runArgs = ['-cp', tmpDir, className];
              } else {
                runCmd = outFile;
                runArgs = [];
              }

              execFile(runCmd, runArgs, { timeout, cwd: tmpDir }, (err, stdout, stderr) => {
                cleanup([srcFile, outFile, path.join(tmpDir, fileBase + '.class')]);
                res.json({
                  output: (stdout || '').slice(0, 10000),
                  error: (stderr || '').slice(0, 5000),
                  exitCode: err ? (err.code || 1) : 0
                });
              });
            });
          } else {
            // Interpret directly
            const cmd = runner.cmd;
            const args = [...(runner.args || []), srcFile];

            execFile(cmd, args, { timeout, cwd: tmpDir }, (err, stdout, stderr) => {
              cleanup([srcFile]);
              res.json({
                output: (stdout || '').slice(0, 10000),
                error: (stderr || '').slice(0, 5000),
                exitCode: err ? (err.code || 1) : 0
              });
            });
          }
        }]
      },
      {
        method: 'get',
        path: '/api/code/languages',
        handlers: [authMiddleware, (req, res) => {
          const langs = Object.keys(CODE_RUNNERS).map(lang => ({
            id: lang,
            name: lang.charAt(0).toUpperCase() + lang.slice(1),
            ext: CODE_RUNNERS[lang].ext
          }));
          res.json(langs);
        }]
      }
    ]
  };
};
