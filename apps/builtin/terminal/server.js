module.exports = function(ctx) {
  const { spawn } = require('child_process');

  return {
    wsHandlers: {
      'terminal-exec': (ws, msg) => {
        const data = msg.data || {};
        const { id, command } = data;
        if (!command || !id) return;
        const isWin = process.platform === 'win32';
        const shell = isWin ? 'cmd.exe' : '/bin/sh';
        const shellArgs = isWin ? ['/c', command] : ['-c', command];
        const child = spawn(shell, shellArgs, {
          cwd: process.env.HOME || process.env.USERPROFILE || __dirname,
          env: { ...process.env, TERM: 'dumb', LANG: 'en_US.UTF-8' },
          timeout: 30000,
          stdio: ['ignore', 'pipe', 'pipe']
        });
        child.stdout.on('data', (chunk) => {
          if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'terminal-stdout', data: { id, text: chunk.toString() } }));
        });
        child.stderr.on('data', (chunk) => {
          if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'terminal-stderr', data: { id, text: chunk.toString() } }));
        });
        child.on('close', (code) => {
          if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'terminal-exit', data: { id, code } }));
        });
        child.on('error', (err) => {
          if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'terminal-stderr', data: { id, text: err.message } }));
          if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'terminal-exit', data: { id, code: 1 } }));
        });
      }
    }
  };
};
