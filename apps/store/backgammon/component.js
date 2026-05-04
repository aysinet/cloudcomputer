(function(Vue) {
  const { ref, computed, watch, onMounted, onUnmounted, nextTick } = Vue;

  /* ── i18n ── */
  const I18N = {
    tr: { title:'Tavla', vsAI:'Bilgisayara Karşı', vs2P:'2 Kişilik', subtitle:'Klasik tavla deneyimi', black:'Siyah', white:'Beyaz', you:'Sen', computer:'Bilgisayar', roll:'Zar At', selectChecker:'Bir taş seç ve hamle yap', noMoves:'Hamle yok — tur atlanıyor...', newGame:'Yeni Oyun', menu:'Menü', endTurn:'Turu Bitir', blackWins:'Siyah kazandı!', whiteWins:'Beyaz kazandı!', player1:'Oyuncu 1', player2:'Oyuncu 2' },
    en: { title:'Backgammon', vsAI:'vs Computer', vs2P:'2 Players', subtitle:'Classic backgammon experience', black:'Black', white:'White', you:'You', computer:'Computer', roll:'Roll Dice', selectChecker:'Select a checker and make your move', noMoves:'No moves available — skipping turn...', newGame:'New Game', menu:'Menu', endTurn:'End Turn', blackWins:'Black wins!', whiteWins:'White wins!', player1:'Player 1', player2:'Player 2' },
    de: { title:'Backgammon', vsAI:'Gegen Computer', vs2P:'2 Spieler', subtitle:'Klassisches Backgammon', black:'Schwarz', white:'Weiß', you:'Du', computer:'Computer', roll:'Würfeln', selectChecker:'Wähle einen Stein', noMoves:'Keine Züge — Runde überspringen...', newGame:'Neues Spiel', menu:'Menü', endTurn:'Zug beenden', blackWins:'Schwarz gewinnt!', whiteWins:'Weiß gewinnt!', player1:'Spieler 1', player2:'Spieler 2' },
    fr: { title:'Backgammon', vsAI:'Contre l\'ordi', vs2P:'2 Joueurs', subtitle:'Backgammon classique', black:'Noir', white:'Blanc', you:'Vous', computer:'Ordinateur', roll:'Lancer', selectChecker:'Sélectionnez un pion', noMoves:'Aucun mouvement — tour passé...', newGame:'Nouvelle partie', menu:'Menu', endTurn:'Fin du tour', blackWins:'Noir gagne!', whiteWins:'Blanc gagne!', player1:'Joueur 1', player2:'Joueur 2' },
    es: { title:'Backgammon', vsAI:'vs Computadora', vs2P:'2 Jugadores', subtitle:'Backgammon clásico', black:'Negro', white:'Blanco', you:'Tú', computer:'Computadora', roll:'Tirar dados', selectChecker:'Selecciona una ficha', noMoves:'Sin movimientos — saltando turno...', newGame:'Nuevo juego', menu:'Menú', endTurn:'Terminar turno', blackWins:'¡Negro gana!', whiteWins:'¡Blanco gana!', player1:'Jugador 1', player2:'Jugador 2' },
    ru: { title:'Нарды', vsAI:'Против ПК', vs2P:'2 Игрока', subtitle:'Классические нарды', black:'Чёрные', white:'Белые', you:'Вы', computer:'Компьютер', roll:'Бросить', selectChecker:'Выберите шашку', noMoves:'Нет ходов — пропуск...', newGame:'Новая игра', menu:'Меню', endTurn:'Конец хода', blackWins:'Чёрные победили!', whiteWins:'Белые победили!', player1:'Игрок 1', player2:'Игрок 2' }
  };

  I18N.zh = { ...I18N.en, title:'西洋双陆棋' };
  I18N.ja = { ...I18N.en, title:'バックギャモン' };
  I18N.it = { ...I18N.en, title:'Backgammon' };
  I18N.ar = { ...I18N.en, title:'طاولة زهر' };
  I18N.ko = { ...I18N.en, title:'백개먼' };
  I18N.hi = { ...I18N.en, title:'बैकगैमन' };
  I18N.pt = { ...I18N.en, title:'Gamão' };

  function getLocale() {
    try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; }
  }

  /* ── Dice unicode faces ── */
  const DICE_FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  /* ── Initial board setup ──
     Points 0-23. Black moves from 23→0 (decreasing), White moves from 0→23 (increasing).
     Positive = black checkers, negative = white checkers.
     Standard backgammon initial position:
  */
  function initialBoard() {
    const b = new Array(24).fill(0);
    // Black checkers (positive)
    b[0] = 2;   // point 1
    b[11] = 5;  // point 12
    b[16] = 3;  // point 17
    b[18] = 5;  // point 19
    // White checkers (negative)
    b[23] = -2;  // point 24
    b[12] = -5;  // point 13
    b[7] = -3;   // point 8
    b[5] = -5;   // point 6
    return b;
  }

  return {
    setup() {
      const locale = ref(getLocale());
      const screen = ref('menu'); // 'menu' | 'game'
      const mode = ref('ai');     // 'ai' | 'pvp'

      // Board state
      const points = ref(initialBoard());
      const bar = ref({ black: 0, white: 0 });
      const borneOff = ref({ black: 0, white: 0 });
      const currentPlayer = ref('black'); // 'black' | 'white'
      const dice = ref([]);
      const usedDice = ref([]);
      const rolled = ref(false);
      const selectedPoint = ref(null); // currently selected source point, or 'bar'
      const gameOver = ref(false);
      const validTargets = ref([]);

      function t(key) {
        return (I18N[locale.value] || I18N.tr)[key] || key;
      }

      function diceUnicode(val) {
        return DICE_FACES[val] || val;
      }

      /* ── Helpers ── */
      function isOwn(pointIdx, player) {
        if (player === 'black') return points.value[pointIdx] > 0;
        return points.value[pointIdx] < 0;
      }

      function checkerCount(pointIdx, player) {
        const v = points.value[pointIdx];
        if (player === 'black') return v > 0 ? v : 0;
        return v < 0 ? -v : 0;
      }

      function opponent(p) { return p === 'black' ? 'white' : 'black'; }

      function direction(player) { return player === 'black' ? -1 : 1; }

      // Get available (unused) dice values
      function availableDice() {
        const avail = [];
        for (let i = 0; i < dice.value.length; i++) {
          if (!usedDice.value[i]) avail.push({ value: dice.value[i], index: i });
        }
        return avail;
      }

      /* ── Move legality ── */
      function canLandOn(pointIdx, player) {
        if (pointIdx < 0 || pointIdx > 23) return false;
        const v = points.value[pointIdx];
        if (player === 'black') return v >= -1; // can land if <= 1 opponent
        return v <= 1;
      }

      function allInHomeBoard(player) {
        const barCount = bar.value[player];
        if (barCount > 0) return false;
        if (player === 'black') {
          // Home board for black: points 0-5
          for (let i = 6; i < 24; i++) {
            if (checkerCount(i, 'black') > 0) return false;
          }
          return true;
        } else {
          // Home board for white: points 18-23
          for (let i = 0; i < 18; i++) {
            if (checkerCount(i, 'white') > 0) return false;
          }
          return true;
        }
      }

      function canBearOff(fromPoint, dieValue, player) {
        if (!allInHomeBoard(player)) return false;
        if (player === 'black') {
          const target = fromPoint - dieValue;
          if (target === -1) return true; // exact bear off
          if (target < -1) {
            // Can only bear off if no checker on a higher point
            for (let i = fromPoint + 1; i <= 5; i++) {
              if (checkerCount(i, 'black') > 0) return false;
            }
            return true;
          }
          return false;
        } else {
          const target = fromPoint + dieValue;
          if (target === 24) return true;
          if (target > 24) {
            for (let i = fromPoint - 1; i >= 18; i--) {
              if (checkerCount(i, 'white') > 0) return false;
            }
            return true;
          }
          return false;
        }
      }

      function getMovesFrom(fromPoint, player, isFromBar) {
        const moves = [];
        const avail = availableDice();
        const dir = direction(player);

        for (const d of avail) {
          if (isFromBar) {
            // Enter from bar
            const entry = player === 'black' ? (24 - d.value) : (d.value - 1);
            if (canLandOn(entry, player)) {
              moves.push({ from: 'bar', to: entry, dieIndex: d.index, bearOff: false });
            }
          } else {
            const target = fromPoint + dir * d.value;
            if (target >= 0 && target <= 23 && canLandOn(target, player)) {
              moves.push({ from: fromPoint, to: target, dieIndex: d.index, bearOff: false });
            }
            // Bear off
            if (canBearOff(fromPoint, d.value, player)) {
              moves.push({ from: fromPoint, to: -1, dieIndex: d.index, bearOff: true });
            }
          }
        }
        return moves;
      }

      function getAllLegalMoves(player) {
        const moves = [];
        if (bar.value[player] > 0) {
          // Must move from bar first
          return getMovesFrom(null, player, true);
        }
        for (let i = 0; i < 24; i++) {
          if (checkerCount(i, player) > 0) {
            moves.push(...getMovesFrom(i, player, false));
          }
        }
        return moves;
      }

      const canMove = computed(() => {
        return getAllLegalMoves(currentPlayer.value).length > 0;
      });

      const allDiceUsed = computed(() => {
        return availableDice().length === 0;
      });

      /* ── Execute move ── */
      function executeMove(move) {
        const player = currentPlayer.value;
        const opp = opponent(player);
        const newPoints = [...points.value];

        // Remove from source
        if (move.from === 'bar') {
          bar.value[player]--;
        } else {
          if (player === 'black') newPoints[move.from]--;
          else newPoints[move.from]++;
        }

        if (move.bearOff) {
          borneOff.value[player]++;
        } else {
          // Check for hit
          if (player === 'black' && newPoints[move.to] === -1) {
            newPoints[move.to] = 0;
            bar.value[opp]++;
          } else if (player === 'white' && newPoints[move.to] === 1) {
            newPoints[move.to] = 0;
            bar.value[opp]++;
          }
          // Place checker
          if (player === 'black') newPoints[move.to]++;
          else newPoints[move.to]--;
        }

        points.value = newPoints;
        usedDice.value[move.dieIndex] = true;
        usedDice.value = [...usedDice.value];

        // Check for win
        if (borneOff.value[player] >= 15) {
          gameOver.value = true;
        }
      }

      /* ── UI interaction ── */
      function getPointCheckers(i) {
        const v = points.value[i];
        const count = Math.abs(v);
        if (count === 0) return [];
        const color = v > 0 ? 'black' : 'white';
        const result = [];
        const show = Math.min(count, 5);
        for (let j = 0; j < show; j++) {
          const isLast = j === show - 1;
          result.push({ idx: j, color, extra: isLast && count > 5, total: count });
        }
        return result;
      }

      function barCheckers(color) {
        return Array.from({ length: bar.value[color] }, (_, i) => i);
      }

      function computeValidTargets(fromPoint, isFromBar) {
        const moves = getMovesFrom(fromPoint, currentPlayer.value, isFromBar);
        return moves.map(m => m.to);
      }

      function isValidTarget(pointIdx) {
        if (selectedPoint.value === null) return false;
        return validTargets.value.includes(pointIdx);
      }

      function onBarClick() {
        if (gameOver.value || !rolled.value) return;
        if (mode.value === 'ai' && currentPlayer.value === 'white') return;
        const player = currentPlayer.value;
        if (bar.value[player] <= 0) return;

        if (selectedPoint.value === 'bar') {
          selectedPoint.value = null;
          validTargets.value = [];
        } else {
          selectedPoint.value = 'bar';
          validTargets.value = computeValidTargets(null, true);
        }
      }

      function onPointClick(pointIdx) {
        if (gameOver.value || !rolled.value) return;
        if (mode.value === 'ai' && currentPlayer.value === 'white') return;
        const player = currentPlayer.value;

        // If must enter from bar first
        if (bar.value[player] > 0) {
          if (selectedPoint.value === 'bar' && validTargets.value.includes(pointIdx)) {
            // Execute bar entry move
            const moves = getMovesFrom(null, player, true);
            const move = moves.find(m => m.to === pointIdx);
            if (move) {
              executeMove(move);
              selectedPoint.value = null;
              validTargets.value = [];
              checkAutoEndTurn();
            }
          } else {
            // Must click bar first
            selectedPoint.value = 'bar';
            validTargets.value = computeValidTargets(null, true);
          }
          return;
        }

        // If a point is selected and this is a valid target
        if (selectedPoint.value !== null && selectedPoint.value !== 'bar' && validTargets.value.includes(pointIdx)) {
          const moves = getMovesFrom(selectedPoint.value, player, false);
          const move = moves.find(m => m.to === pointIdx);
          if (move) {
            executeMove(move);
            selectedPoint.value = null;
            validTargets.value = [];
            checkAutoEndTurn();
          }
          return;
        }

        // If clicking on a point is a bear-off target (-1)
        if (selectedPoint.value !== null && selectedPoint.value !== 'bar' && validTargets.value.includes(-1)) {
          // Check if they clicked the same point (bear off)
          if (pointIdx === selectedPoint.value) {
            const moves = getMovesFrom(selectedPoint.value, player, false);
            const move = moves.find(m => m.bearOff);
            if (move) {
              executeMove(move);
              selectedPoint.value = null;
              validTargets.value = [];
              checkAutoEndTurn();
            }
            return;
          }
        }

        // Select a new source point
        if (isOwn(pointIdx, player) && checkerCount(pointIdx, player) > 0) {
          selectedPoint.value = pointIdx;
          validTargets.value = computeValidTargets(pointIdx, false);
        } else {
          selectedPoint.value = null;
          validTargets.value = [];
        }
      }

      function checkAutoEndTurn() {
        if (gameOver.value) return;
        if (allDiceUsed.value || !canMove.value) {
          setTimeout(() => endTurn(), 400);
        }
      }

      /* ── Dice ── */
      function rollDice() {
        if (rolled.value || gameOver.value) return;
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        if (d1 === d2) {
          dice.value = [d1, d1, d1, d1]; // doubles
          usedDice.value = [false, false, false, false];
        } else {
          dice.value = [d1, d2];
          usedDice.value = [false, false];
        }
        rolled.value = true;
        selectedPoint.value = null;
        validTargets.value = [];

        // Auto skip if no moves
        if (!canMove.value) {
          setTimeout(() => endTurn(), 1200);
        }
      }

      function endTurn() {
        rolled.value = false;
        dice.value = [];
        usedDice.value = [];
        selectedPoint.value = null;
        validTargets.value = [];
        currentPlayer.value = opponent(currentPlayer.value);

        if (mode.value === 'ai' && currentPlayer.value === 'white' && !gameOver.value) {
          setTimeout(aiTurn, 500);
        }
      }

      /* ── AI ── */
      function aiTurn() {
        if (gameOver.value || currentPlayer.value !== 'white') return;

        // Roll dice for AI
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        if (d1 === d2) {
          dice.value = [d1, d1, d1, d1];
          usedDice.value = [false, false, false, false];
        } else {
          dice.value = [d1, d2];
          usedDice.value = [false, false];
        }
        rolled.value = true;

        // Execute AI moves with delays
        aiExecuteMoves(0);
      }

      function aiExecuteMoves(step) {
        if (gameOver.value || currentPlayer.value !== 'white') return;
        const moves = getAllLegalMoves('white');
        if (moves.length === 0 || allDiceUsed.value) {
          setTimeout(() => endTurn(), 600);
          return;
        }

        const best = aiBestMove(moves);
        if (best) {
          executeMove(best);
          if (!gameOver.value) {
            setTimeout(() => aiExecuteMoves(step + 1), 400);
          }
        } else {
          setTimeout(() => endTurn(), 600);
        }
      }

      // AI strategy: weighted positional scoring
      function aiBestMove(moves) {
        if (moves.length === 0) return null;

        let bestScore = -Infinity;
        let bestMove = moves[0];

        for (const move of moves) {
          let score = 0;

          // Prefer bearing off
          if (move.bearOff) {
            score += 100;
          }

          if (!move.bearOff) {
            // Prefer hitting opponent
            const targetVal = points.value[move.to];
            if (targetVal === 1) { // hit black blot
              score += 30;
            }

            // Prefer making points (landing where already have one)
            if (targetVal <= -1) {
              score += 15;
            }

            // Prefer advancing toward home board
            score += move.to * 2;

            // Avoid leaving blots
            const simPoints = [...points.value];
            if (move.from === 'bar') {
              // simulate bar entry
            } else {
              simPoints[move.from]++;
              if (simPoints[move.from] === -1) {
                // left a blot at source — penalty
                score -= 20;
              }
            }

            // Prefer home board positions
            if (move.to >= 18) score += 10;

            // Prefer being safe (making a point)
            if (points.value[move.to] <= -1) score += 10;
          }

          // Entering from bar priority
          if (move.from === 'bar') score += 50;

          // Small randomness for variety
          score += Math.random() * 3;

          if (score > bestScore) {
            bestScore = score;
            bestMove = move;
          }
        }
        return bestMove;
      }

      /* ── Win text ── */
      const winnerText = computed(() => {
        if (!gameOver.value) return '';
        if (borneOff.value.black >= 15) return t('blackWins');
        return t('whiteWins');
      });

      /* ── Game start / reset ── */
      function startGame(gameMode) {
        mode.value = gameMode;
        points.value = initialBoard();
        bar.value = { black: 0, white: 0 };
        borneOff.value = { black: 0, white: 0 };
        currentPlayer.value = 'black';
        dice.value = [];
        usedDice.value = [];
        rolled.value = false;
        selectedPoint.value = null;
        validTargets.value = [];
        gameOver.value = false;
        screen.value = 'game';
      }

      /* ── Locale watch ── */
      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }
      onMounted(() => { window.addEventListener('locale-changed', onLocaleChanged); });
      onUnmounted(() => { window.removeEventListener('locale-changed', onLocaleChanged); });

      return {
        screen, mode, points, bar, borneOff, currentPlayer,
        dice, usedDice, rolled, selectedPoint, validTargets,
        gameOver, canMove, allDiceUsed, winnerText,
        t, diceUnicode, getPointCheckers, barCheckers,
        isValidTarget, onPointClick, onBarClick,
        rollDice, endTurn, startGame
      };
    }
  };
})(Vue);
