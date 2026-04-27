(function(Vue) {
  const { ref, onMounted, onUnmounted, nextTick } = Vue;

  const LANGS = {
    tr: {
      score:'Skor', best:'En İyi', level:'Seviye', length:'Uzunluk',
      start:'Başla', restart:'Tekrar Oyna', pause:'Duraklat', resume:'Devam',
      reset:'Sıfırla', gameOver:'Oyun Bitti!', paused:'Duraklatıldı',
      controls:'Ok tuşları veya WASD ile yönlendir'
    },
    en: {
      score:'Score', best:'Best', level:'Level', length:'Length',
      start:'Start', restart:'Play Again', pause:'Pause', resume:'Resume',
      reset:'Reset', gameOver:'Game Over!', paused:'Paused',
      controls:'Use arrow keys or WASD to move'
    },
    de: {
      score:'Punkte', best:'Beste', level:'Level', length:'Länge',
      start:'Start', restart:'Nochmal', pause:'Pause', resume:'Weiter',
      reset:'Zurücksetzen', gameOver:'Spiel vorbei!', paused:'Pausiert',
      controls:'Pfeiltasten oder WASD zum Bewegen'
    },
    fr: {
      score:'Score', best:'Meilleur', level:'Niveau', length:'Longueur',
      start:'Démarrer', restart:'Rejouer', pause:'Pause', resume:'Reprendre',
      reset:'Réinitialiser', gameOver:'Partie terminée !', paused:'En pause',
      controls:'Utilisez les flèches ou WASD'
    },
    es: {
      score:'Puntos', best:'Mejor', level:'Nivel', length:'Largo',
      start:'Iniciar', restart:'Reiniciar', pause:'Pausa', resume:'Continuar',
      reset:'Resetear', gameOver:'¡Fin del juego!', paused:'Pausado',
      controls:'Usa las flechas o WASD'
    },
    ru: {
      score:'Счёт', best:'Лучший', level:'Уровень', length:'Длина',
      start:'Старт', restart:'Заново', pause:'Пауза', resume:'Продолжить',
      reset:'Сброс', gameOver:'Игра окончена!', paused:'Пауза',
      controls:'Стрелки или WASD для управления'
    },
    zh: {
      score:'得分', best:'最高', level:'等级', length:'长度',
      start:'开始', restart:'重玩', pause:'暂停', resume:'继续',
      reset:'重置', gameOver:'游戏结束！', paused:'已暂停',
      controls:'使用方向键或WASD移动'
    },
    ja: {
      score:'スコア', best:'ベスト', level:'レベル', length:'長さ',
      start:'スタート', restart:'もう一度', pause:'一時停止', resume:'再開',
      reset:'リセット', gameOver:'ゲームオーバー！', paused:'一時停止中',
      controls:'矢印キーまたはWASDで操作'
    },
    it: {
      score:'Punti', best:'Migliore', level:'Livello', length:'Lunghezza',
      start:'Inizia', restart:'Rigioca', pause:'Pausa', resume:'Riprendi',
      reset:'Reset', gameOver:'Game Over!', paused:'In pausa',
      controls:'Usa le frecce o WASD'
    }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  return {
    setup() {
      const locale = ref(getLocale());
      const L = (k) => (LANGS[locale.value] || LANGS.en)[k] || k;

      const COLS = 20;
      const ROWS = 20;
      const CELL = 22;

      const boardCanvas = ref(null);
      const rootEl = ref(null);

      const state = ref('idle'); // idle | playing | paused | over
      const score = ref(0);
      const bestScore = ref(0);
      const level = ref(1);
      const snake = ref([]);

      let ctx = null;
      let dir = { x: 1, y: 0 };
      let nextDir = { x: 1, y: 0 };
      let food = { x: 0, y: 0 };
      let timer = null;
      let baseSpeed = 150;

      // Load best score
      try { bestScore.value = parseInt(localStorage.getItem('snake_best') || '0', 10); } catch {}

      /* ---- Grid helpers ---- */
      function randomFood() {
        const occupied = new Set(snake.value.map(s => s.x + ',' + s.y));
        let pos;
        do {
          pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
        } while (occupied.has(pos.x + ',' + pos.y));
        return pos;
      }

      /* ---- Drawing ---- */
      function draw() {
        if (!ctx) return;
        const w = COLS * CELL;
        const h = ROWS * CELL;

        // Background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, w, h);

        // Grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= COLS; x++) {
          ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, h); ctx.stroke();
        }
        for (let y = 0; y <= ROWS; y++) {
          ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(w, y * CELL); ctx.stroke();
        }

        // Food
        const fx = food.x * CELL + CELL / 2;
        const fy = food.y * CELL + CELL / 2;
        const fr = CELL / 2 - 2;
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(fx, fy, fr, 0, Math.PI * 2);
        ctx.fill();
        // food glow
        ctx.shadowColor = '#e74c3c';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Snake
        const len = snake.value.length;
        snake.value.forEach((seg, i) => {
          const x = seg.x * CELL;
          const y = seg.y * CELL;
          const pad = 1;

          if (i === 0) {
            // Head
            ctx.fillStyle = '#2ecc71';
            ctx.shadowColor = '#2ecc71';
            ctx.shadowBlur = 6;
            roundRect(ctx, x + pad, y + pad, CELL - pad * 2, CELL - pad * 2, 5);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Eyes
            drawEyes(ctx, seg, x, y);
          } else {
            // Body gradient: green → teal
            const t = i / len;
            const r = Math.round(46 * (1 - t) + 30 * t);
            const g = Math.round(204 * (1 - t) + 150 * t);
            const b = Math.round(113 * (1 - t) + 130 * t);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            roundRect(ctx, x + pad, y + pad, CELL - pad * 2, CELL - pad * 2, 3);
            ctx.fill();
          }
        });
      }

      function drawEyes(c, head, hx, hy) {
        const eyeR = 3;
        const pupilR = 1.5;
        const off = CELL * 0.28;
        let e1x, e1y, e2x, e2y;

        if (dir.x === 1) { // right
          e1x = hx + CELL - off; e1y = hy + off;
          e2x = hx + CELL - off; e2y = hy + CELL - off;
        } else if (dir.x === -1) { // left
          e1x = hx + off; e1y = hy + off;
          e2x = hx + off; e2y = hy + CELL - off;
        } else if (dir.y === -1) { // up
          e1x = hx + off; e1y = hy + off;
          e2x = hx + CELL - off; e2y = hy + off;
        } else { // down
          e1x = hx + off; e1y = hy + CELL - off;
          e2x = hx + CELL - off; e2y = hy + CELL - off;
        }

        // White
        c.fillStyle = '#fff';
        c.beginPath(); c.arc(e1x, e1y, eyeR, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(e2x, e2y, eyeR, 0, Math.PI * 2); c.fill();
        // Pupil
        c.fillStyle = '#111';
        c.beginPath(); c.arc(e1x + dir.x, e1y + dir.y, pupilR, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(e2x + dir.x, e2y + dir.y, pupilR, 0, Math.PI * 2); c.fill();
      }

      function roundRect(c, x, y, w, h, r) {
        c.beginPath();
        c.moveTo(x + r, y);
        c.lineTo(x + w - r, y);
        c.quadraticCurveTo(x + w, y, x + w, y + r);
        c.lineTo(x + w, y + h - r);
        c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        c.lineTo(x + r, y + h);
        c.quadraticCurveTo(x, y + h, x, y + h - r);
        c.lineTo(x, y + r);
        c.quadraticCurveTo(x, y, x + r, y);
        c.closePath();
      }

      /* ---- Game logic ---- */
      function tick() {
        dir = { ...nextDir };

        const head = snake.value[0];
        const nx = head.x + dir.x;
        const ny = head.y + dir.y;

        // Wall collision
        if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) {
          gameOver(); return;
        }
        // Self collision
        if (snake.value.some(s => s.x === nx && s.y === ny)) {
          gameOver(); return;
        }

        snake.value.unshift({ x: nx, y: ny });

        // Eat food?
        if (nx === food.x && ny === food.y) {
          score.value += 10;
          level.value = Math.floor(score.value / 50) + 1;
          food = randomFood();
        } else {
          snake.value.pop();
        }

        draw();
      }

      function getSpeed() {
        return Math.max(50, baseSpeed - (level.value - 1) * 10);
      }

      function scheduleNext() {
        timer = setTimeout(() => {
          if (state.value !== 'playing') return;
          tick();
          scheduleNext();
        }, getSpeed());
      }

      function startGame() {
        // Init snake in center
        const cx = Math.floor(COLS / 2);
        const cy = Math.floor(ROWS / 2);
        snake.value = [
          { x: cx, y: cy },
          { x: cx - 1, y: cy },
          { x: cx - 2, y: cy }
        ];
        dir = { x: 1, y: 0 };
        nextDir = { x: 1, y: 0 };
        score.value = 0;
        level.value = 1;
        food = randomFood();
        state.value = 'playing';
        draw();
        scheduleNext();
        nextTick(() => rootEl.value && rootEl.value.focus());
      }

      function gameOver() {
        state.value = 'over';
        clearTimeout(timer);
        if (score.value > bestScore.value) {
          bestScore.value = score.value;
          try { localStorage.setItem('snake_best', String(bestScore.value)); } catch {}
        }
      }

      function togglePause() {
        if (state.value === 'playing') {
          state.value = 'paused';
          clearTimeout(timer);
        } else if (state.value === 'paused') {
          resumeGame();
        }
      }

      function resumeGame() {
        state.value = 'playing';
        scheduleNext();
        nextTick(() => rootEl.value && rootEl.value.focus());
      }

      function resetGame() {
        state.value = 'idle';
        clearTimeout(timer);
        score.value = 0;
        level.value = 1;
        snake.value = [];
        // Draw empty board
        draw();
      }

      /* ---- Input ---- */
      function setDir(dx, dy) {
        // Prevent 180° turn
        if (dir.x === -dx && dir.y === -dy) return;
        nextDir = { x: dx, y: dy };
      }

      function onKeyDown(e) {
        const map = {
          ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
          w: [0, -1], W: [0, -1], s: [0, 1], S: [0, 1],
          a: [-1, 0], A: [-1, 0], d: [1, 0], D: [1, 0]
        };
        if (map[e.key]) {
          e.preventDefault();
          if (state.value === 'playing') setDir(map[e.key][0], map[e.key][1]);
          return;
        }
        if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          if (state.value === 'playing' || state.value === 'paused') togglePause();
          else if (state.value === 'idle' || state.value === 'over') startGame();
        }
      }

      /* ---- Lifecycle ---- */
      onMounted(async () => {
        await nextTick();
        ctx = boardCanvas.value.getContext('2d');
        draw();
        if (rootEl.value) rootEl.value.focus();
      });

      onUnmounted(() => {
        clearTimeout(timer);
      });

      return {
        L, boardCanvas, rootEl,
        COLS, ROWS, CELL,
        state, score, bestScore, level, snake,
        startGame, togglePause, resumeGame, resetGame,
        setDir, onKeyDown
      };
    }
  };
})(Vue);
