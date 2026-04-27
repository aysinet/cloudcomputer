(function(Vue) {
  const { ref, computed, watch, onMounted, onUnmounted } = Vue;

  const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

  const I18N = {
    tr: { newGame: 'Yeni Oyun', blackTurn: 'Siyah oynuyor', whiteTurn: 'Beyaz oynuyor', blackWins: 'Siyah kazandı!', whiteWins: 'Beyaz kazandı!', draw: 'Berabere!', vsAI: 'Bilgisayara karşı', passed: 'Pas geçildi' },
    en: { newGame: 'New Game', blackTurn: 'Black\'s turn', whiteTurn: 'White\'s turn', blackWins: 'Black wins!', whiteWins: 'White wins!', draw: 'Draw!', vsAI: 'vs Computer', passed: 'Passed' },
    de: { newGame: 'Neues Spiel', blackTurn: 'Schwarz am Zug', whiteTurn: 'Weiß am Zug', blackWins: 'Schwarz gewinnt!', whiteWins: 'Weiß gewinnt!', draw: 'Unentschieden!', vsAI: 'Gegen Computer', passed: 'Gepasst' },
    fr: { newGame: 'Nouvelle partie', blackTurn: 'Tour des noirs', whiteTurn: 'Tour des blancs', blackWins: 'Les noirs gagnent!', whiteWins: 'Les blancs gagnent!', draw: 'Égalité!', vsAI: 'Contre l\'ordi', passed: 'Passé' },
    es: { newGame: 'Nuevo juego', blackTurn: 'Turno negro', whiteTurn: 'Turno blanco', blackWins: '¡Negro gana!', whiteWins: '¡Blanco gana!', draw: '¡Empate!', vsAI: 'vs Computadora', passed: 'Pasado' },
    ru: { newGame: 'Новая игра', blackTurn: 'Ход чёрных', whiteTurn: 'Ход белых', blackWins: 'Чёрные победили!', whiteWins: 'Белые победили!', draw: 'Ничья!', vsAI: 'Против ПК', passed: 'Пас' }
  };

  function getLocale() {
    try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; }
  }

  return {
    setup() {
      const locale = ref(getLocale());
      const board = ref([]);
      const turn = ref('black');
      const gameOver = ref(false);
      const lastMove = ref(null);
      const vsAI = ref(true);
      const passMessage = ref('');

      function t(key) {
        return (I18N[locale.value] || I18N.tr)[key] || key;
      }

      function initBoard() {
        const b = Array.from({ length: 8 }, () => Array(8).fill(null));
        b[3][3] = 'white'; b[3][4] = 'black';
        b[4][3] = 'black'; b[4][4] = 'white';
        return b;
      }

      function opponent(color) { return color === 'black' ? 'white' : 'black'; }

      function getFlips(b, x, y, color) {
        if (b[y][x]) return [];
        const flips = [];
        for (const [dy, dx] of DIRS) {
          const line = [];
          let cx = x + dx, cy = y + dy;
          while (cx >= 0 && cx < 8 && cy >= 0 && cy < 8 && b[cy][cx] === opponent(color)) {
            line.push([cx, cy]);
            cx += dx; cy += dy;
          }
          if (line.length > 0 && cx >= 0 && cx < 8 && cy >= 0 && cy < 8 && b[cy][cx] === color) {
            flips.push(...line);
          }
        }
        return flips;
      }

      function getValidMoves(b, color) {
        const moves = [];
        for (let y = 0; y < 8; y++)
          for (let x = 0; x < 8; x++)
            if (getFlips(b, x, y, color).length > 0) moves.push([x, y]);
        return moves;
      }

      function isValid(x, y) {
        if (gameOver.value || board.value[y][x]) return false;
        return getFlips(board.value, x, y, turn.value).length > 0;
      }

      function applyMove(b, x, y, color) {
        const flips = getFlips(b, x, y, color);
        if (flips.length === 0) return false;
        b[y][x] = color;
        for (const [fx, fy] of flips) b[fy][fx] = color;
        return true;
      }

      function place(x, y) {
        if (gameOver.value) return;
        if (vsAI.value && turn.value === 'white') return;
        if (!applyMove(board.value, x, y, turn.value)) return;
        lastMove.value = [x, y];
        advanceTurn();
      }

      function advanceTurn() {
        const next = opponent(turn.value);
        if (getValidMoves(board.value, next).length > 0) {
          turn.value = next;
        } else if (getValidMoves(board.value, turn.value).length > 0) {
          // next player has no moves, current keeps turn (pass)
          passMessage.value = t('passed');
          setTimeout(() => passMessage.value = '', 1200);
        } else {
          gameOver.value = true;
          return;
        }

        if (vsAI.value && turn.value === 'white' && !gameOver.value) {
          setTimeout(aiMove, 300);
        }
      }

      // Simple AI: weighted positional evaluation
      const WEIGHTS = [
        [120,-20, 20,  5,  5, 20,-20,120],
        [-20,-40, -5, -5, -5, -5,-40,-20],
        [ 20, -5, 15,  3,  3, 15, -5, 20],
        [  5, -5,  3,  3,  3,  3, -5,  5],
        [  5, -5,  3,  3,  3,  3, -5,  5],
        [ 20, -5, 15,  3,  3, 15, -5, 20],
        [-20,-40, -5, -5, -5, -5,-40,-20],
        [120,-20, 20,  5,  5, 20,-20,120]
      ];

      function aiMove() {
        if (gameOver.value || turn.value !== 'white') return;
        const moves = getValidMoves(board.value, 'white');
        if (moves.length === 0) return;

        let bestScore = -Infinity, bestMove = moves[0];
        for (const [mx, my] of moves) {
          const sim = board.value.map(r => [...r]);
          applyMove(sim, mx, my, 'white');
          let score = WEIGHTS[my][mx];
          // Look one move ahead for opponent
          const oppMoves = getValidMoves(sim, 'black');
          if (oppMoves.length > 0) {
            const worstOpp = Math.max(...oppMoves.map(([ox, oy]) => WEIGHTS[oy][ox]));
            score -= worstOpp * 0.5;
          }
          // Disc differential
          const wc = sim.flat().filter(c => c === 'white').length;
          const bc = sim.flat().filter(c => c === 'black').length;
          score += (wc - bc) * 0.3;
          if (score > bestScore) { bestScore = score; bestMove = [mx, my]; }
        }
        applyMove(board.value, bestMove[0], bestMove[1], 'white');
        lastMove.value = bestMove;
        advanceTurn();
      }

      const blackCount = computed(() => board.value.flat().filter(c => c === 'black').length);
      const whiteCount = computed(() => board.value.flat().filter(c => c === 'white').length);

      const turnLabel = computed(() => turn.value === 'black' ? t('blackTurn') : t('whiteTurn'));

      const resultLabel = computed(() => {
        if (blackCount.value > whiteCount.value) return t('blackWins');
        if (whiteCount.value > blackCount.value) return t('whiteWins');
        return t('draw');
      });

      function reset() {
        board.value = initBoard();
        turn.value = 'black';
        gameOver.value = false;
        lastMove.value = null;
        passMessage.value = '';
      }

      watch(vsAI, () => reset());

      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }
      onMounted(() => { window.addEventListener('locale-changed', onLocaleChanged); });
      onUnmounted(() => { window.removeEventListener('locale-changed', onLocaleChanged); });

      reset();

      return {
        board, turn, gameOver, lastMove, vsAI,
        blackCount, whiteCount, turnLabel, resultLabel, passMessage,
        isValid, place, reset, t
      };
    }
  };
})(Vue);
