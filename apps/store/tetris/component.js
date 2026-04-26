(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, nextTick, watch } = Vue;

  // Tetromino shapes (each rotation state)
  const SHAPES = {
    I: { color: '#00f0f0', cells: [
      [[0,0],[1,0],[2,0],[3,0]],
      [[1,0],[1,1],[1,2],[1,3]],
      [[0,1],[1,1],[2,1],[3,1]],
      [[2,0],[2,1],[2,2],[2,3]]
    ]},
    O: { color: '#f0f000', cells: [
      [[0,0],[1,0],[0,1],[1,1]],
      [[0,0],[1,0],[0,1],[1,1]],
      [[0,0],[1,0],[0,1],[1,1]],
      [[0,0],[1,0],[0,1],[1,1]]
    ]},
    T: { color: '#a000f0', cells: [
      [[0,0],[1,0],[2,0],[1,1]],
      [[1,0],[1,1],[1,2],[0,1]],
      [[1,0],[0,1],[1,1],[2,1]],
      [[0,0],[0,1],[0,2],[1,1]]
    ]},
    S: { color: '#00f000', cells: [
      [[1,0],[2,0],[0,1],[1,1]],
      [[0,0],[0,1],[1,1],[1,2]],
      [[1,0],[2,0],[0,1],[1,1]],
      [[0,0],[0,1],[1,1],[1,2]]
    ]},
    Z: { color: '#f00000', cells: [
      [[0,0],[1,0],[1,1],[2,1]],
      [[1,0],[0,1],[1,1],[0,2]],
      [[0,0],[1,0],[1,1],[2,1]],
      [[1,0],[0,1],[1,1],[0,2]]
    ]},
    J: { color: '#0000f0', cells: [
      [[0,0],[0,1],[1,1],[2,1]],
      [[1,0],[2,0],[1,1],[1,2]],
      [[0,0],[1,0],[2,0],[2,1]],
      [[1,0],[1,1],[0,2],[1,2]]
    ]},
    L: { color: '#f0a000', cells: [
      [[2,0],[0,1],[1,1],[2,1]],
      [[1,0],[1,1],[1,2],[2,2]],
      [[0,0],[1,0],[2,0],[0,1]],
      [[0,0],[1,0],[1,1],[1,2]]
    ]}
  };

  const SHAPE_KEYS = Object.keys(SHAPES);

  return {
    setup() {
      const COLS = 10;
      const ROWS = 20;
      const CELL = 26;

      const boardCanvas = ref(null);
      const nextCanvas = ref(null);
      const rootEl = ref(null);

      let boardCtx = null;
      let nextCtx = null;

      // Game state
      const score = ref(0);
      const level = ref(1);
      const lines = ref(0);
      const highScore = ref(0);
      const started = ref(false);
      const gameOver = ref(false);
      const paused = ref(false);

      let board = []; // ROWS x COLS grid, each cell null or color string
      let current = null; // { type, rotation, x, y }
      let nextPiece = null;
      let dropTimer = null;
      let dropInterval = 800;

      // Load high score
      try { highScore.value = parseInt(localStorage.getItem('tetris_high') || '0') || 0; } catch {}

      function saveHighScore() {
        if (score.value > highScore.value) {
          highScore.value = score.value;
          try { localStorage.setItem('tetris_high', String(highScore.value)); } catch {}
        }
      }

      function createBoard() {
        board = [];
        for (let r = 0; r < ROWS; r++) {
          board.push(new Array(COLS).fill(null));
        }
      }

      function randomPiece() {
        const key = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];
        return { type: key, rotation: 0, x: 3, y: 0 };
      }

      function getCells(piece) {
        const shape = SHAPES[piece.type];
        const cells = shape.cells[piece.rotation % shape.cells.length];
        return cells.map(([cx, cy]) => [piece.x + cx, piece.y + cy]);
      }

      function isValid(piece) {
        const cells = getCells(piece);
        for (const [cx, cy] of cells) {
          if (cx < 0 || cx >= COLS || cy >= ROWS) return false;
          if (cy >= 0 && board[cy][cx] !== null) return false;
        }
        return true;
      }

      function lockPiece() {
        const color = SHAPES[current.type].color;
        const cells = getCells(current);
        for (const [cx, cy] of cells) {
          if (cy >= 0 && cy < ROWS) {
            board[cy][cx] = color;
          }
        }
      }

      function clearLines() {
        let cleared = 0;
        for (let r = ROWS - 1; r >= 0; r--) {
          if (board[r].every(c => c !== null)) {
            board.splice(r, 1);
            board.unshift(new Array(COLS).fill(null));
            cleared++;
            r++; // recheck this row
          }
        }
        if (cleared > 0) {
          // Scoring: 1=100, 2=300, 3=500, 4=800
          const pts = [0, 100, 300, 500, 800];
          score.value += (pts[cleared] || cleared * 200) * level.value;
          lines.value += cleared;
          // Level up every 10 lines
          level.value = Math.floor(lines.value / 10) + 1;
          dropInterval = Math.max(80, 800 - (level.value - 1) * 70);
        }
      }

      function spawnPiece() {
        current = nextPiece || randomPiece();
        nextPiece = randomPiece();
        if (!isValid(current)) {
          // Game over
          gameOver.value = true;
          started.value = false;
          saveHighScore();
          stopLoop();
        }
        drawNext();
      }

      // Drawing
      function drawCell(ctx, x, y, color, cellSize) {
        const cs = cellSize || CELL;
        // Main fill
        ctx.fillStyle = color;
        ctx.fillRect(x * cs + 1, y * cs + 1, cs - 2, cs - 2);
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,.2)';
        ctx.fillRect(x * cs + 1, y * cs + 1, cs - 2, 3);
        ctx.fillRect(x * cs + 1, y * cs + 1, 3, cs - 2);
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,.25)';
        ctx.fillRect(x * cs + cs - 3, y * cs + 1, 2, cs - 2);
        ctx.fillRect(x * cs + 1, y * cs + cs - 3, cs - 2, 2);
      }

      function drawBoard() {
        if (!boardCtx) return;
        const ctx = boardCtx;
        ctx.clearRect(0, 0, COLS * CELL, ROWS * CELL);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,.04)';
        ctx.lineWidth = 1;
        for (let c = 0; c <= COLS; c++) {
          ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, ROWS * CELL); ctx.stroke();
        }
        for (let r = 0; r <= ROWS; r++) {
          ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(COLS * CELL, r * CELL); ctx.stroke();
        }

        // Board cells
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            if (board[r][c]) {
              drawCell(ctx, c, r, board[r][c]);
            }
          }
        }

        // Ghost piece
        if (current && !gameOver.value) {
          const ghost = { ...current };
          while (isValid({ ...ghost, y: ghost.y + 1 })) ghost.y++;
          const ghostCells = getCells(ghost);
          for (const [cx, cy] of ghostCells) {
            if (cy >= 0) {
              ctx.fillStyle = 'rgba(255,255,255,.08)';
              ctx.fillRect(cx * CELL + 1, cy * CELL + 1, CELL - 2, CELL - 2);
              ctx.strokeStyle = 'rgba(255,255,255,.15)';
              ctx.lineWidth = 1;
              ctx.strokeRect(cx * CELL + 1, cy * CELL + 1, CELL - 2, CELL - 2);
            }
          }
        }

        // Current piece
        if (current && !gameOver.value) {
          const color = SHAPES[current.type].color;
          const cells = getCells(current);
          for (const [cx, cy] of cells) {
            if (cy >= 0) {
              drawCell(ctx, cx, cy, color);
            }
          }
        }
      }

      function drawNext() {
        if (!nextCtx || !nextPiece) return;
        const ctx = nextCtx;
        const cs = CELL;
        ctx.clearRect(0, 0, 4 * cs, 4 * cs);
        const shape = SHAPES[nextPiece.type];
        const cells = shape.cells[0];
        // Center the piece
        let minX = 4, maxX = 0, minY = 4, maxY = 0;
        for (const [cx, cy] of cells) {
          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;
        }
        const pw = maxX - minX + 1, ph = maxY - minY + 1;
        const ox = Math.floor((4 - pw) / 2) - minX;
        const oy = Math.floor((4 - ph) / 2) - minY;
        for (const [cx, cy] of cells) {
          drawCell(ctx, cx + ox, cy + oy, shape.color, cs);
        }
      }

      // Game loop
      function tick() {
        if (paused.value || gameOver.value || !started.value) return;
        moveDown();
        drawBoard();
      }

      function startLoop() {
        stopLoop();
        dropTimer = setInterval(tick, dropInterval);
      }

      function stopLoop() {
        if (dropTimer) { clearInterval(dropTimer); dropTimer = null; }
      }

      function restartLoop() {
        stopLoop();
        startLoop();
      }

      // Movement
      function moveDown() {
        if (!current) return;
        const next = { ...current, y: current.y + 1 };
        if (isValid(next)) {
          current = next;
        } else {
          // Lock
          lockPiece();
          clearLines();
          spawnPiece();
        }
      }

      function moveLeft() {
        if (!current) return;
        const next = { ...current, x: current.x - 1 };
        if (isValid(next)) { current = next; drawBoard(); }
      }

      function moveRight() {
        if (!current) return;
        const next = { ...current, x: current.x + 1 };
        if (isValid(next)) { current = next; drawBoard(); }
      }

      function rotate() {
        if (!current) return;
        const shape = SHAPES[current.type];
        const nextRot = (current.rotation + 1) % shape.cells.length;
        const next = { ...current, rotation: nextRot };
        // Wall kick attempts
        const kicks = [0, -1, 1, -2, 2];
        for (const dx of kicks) {
          const kicked = { ...next, x: next.x + dx };
          if (isValid(kicked)) { current = kicked; drawBoard(); return; }
        }
      }

      function hardDrop() {
        if (!current) return;
        let dropCount = 0;
        while (isValid({ ...current, y: current.y + 1 })) {
          current = { ...current, y: current.y + 1 };
          dropCount++;
        }
        score.value += dropCount * 2;
        lockPiece();
        clearLines();
        spawnPiece();
        drawBoard();
      }

      function softDrop() {
        if (!current) return;
        const next = { ...current, y: current.y + 1 };
        if (isValid(next)) {
          current = next;
          score.value += 1;
          drawBoard();
        }
      }

      // Controls
      function startGame() {
        createBoard();
        score.value = 0;
        level.value = 1;
        lines.value = 0;
        dropInterval = 800;
        gameOver.value = false;
        paused.value = false;
        started.value = true;
        current = null;
        nextPiece = null;
        spawnPiece();
        drawBoard();
        startLoop();
        nextTick(() => { if (rootEl.value) rootEl.value.focus(); });
      }

      function togglePause() {
        if (!started.value || gameOver.value) return;
        paused.value = !paused.value;
        if (paused.value) stopLoop();
        else startLoop();
      }

      function onKey(e) {
        if (!started.value || gameOver.value) return;
        if (e.key === 'p' || e.key === 'P') { togglePause(); return; }
        if (paused.value) return;

        switch (e.key) {
          case 'ArrowLeft': e.preventDefault(); moveLeft(); break;
          case 'ArrowRight': e.preventDefault(); moveRight(); break;
          case 'ArrowUp': e.preventDefault(); rotate(); break;
          case 'ArrowDown': e.preventDefault(); softDrop(); break;
          case ' ': e.preventDefault(); hardDrop(); break;
        }
      }

      // Watch level for speed changes
      watch(level, () => {
        dropInterval = Math.max(80, 800 - (level.value - 1) * 70);
        if (started.value && !paused.value) restartLoop();
      });

      onMounted(() => {
        nextTick(() => {
          if (boardCanvas.value) boardCtx = boardCanvas.value.getContext('2d');
          if (nextCanvas.value) nextCtx = nextCanvas.value.getContext('2d');
          createBoard();
          drawBoard();
          if (rootEl.value) rootEl.value.focus();
        });
      });

      onUnmounted(() => {
        stopLoop();
      });

      return {
        COLS, ROWS, CELL,
        boardCanvas, nextCanvas, rootEl,
        score, level, lines, highScore,
        started, gameOver, paused,
        startGame, togglePause, onKey
      };
    }
  };
})(Vue);
