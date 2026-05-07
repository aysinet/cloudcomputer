(function(Vue) {
  const { ref, computed, onMounted, watch } = Vue;

  const LANGS = {
    tr: {
      singleBoard: 'Tek Tahta',
      tripleBoard: '3 Tahta',
      vsComputer: 'Bilgisayara Karşı',
      twoPlayers: '2 Oyuncu',
      player1: 'Oyuncu 1',
      player2: 'Oyuncu 2',
      computer: 'Bilgisayar',
      turn: 'Sıra',
      wins: 'Kazandı!',
      draw: 'Berabere!',
      newGame: 'Yeni Oyun',
      back: 'Geri',
      board: 'Tahta',
      score: 'Skor',
      crossBoard: 'Tahtalar arası galibiyet!'
    },
    en: {
      singleBoard: 'Single Board',
      tripleBoard: '3 Boards',
      vsComputer: 'vs Computer',
      twoPlayers: '2 Players',
      player1: 'Player 1',
      player2: 'Player 2',
      computer: 'Computer',
      turn: 'Turn',
      wins: 'Wins!',
      draw: 'Draw!',
      newGame: 'New Game',
      back: 'Back',
      board: 'Board',
      score: 'Score',
      crossBoard: 'Cross-board victory!'
    },
    de: {
      singleBoard: 'Einzelbrett',
      tripleBoard: '3 Bretter',
      vsComputer: 'vs Computer',
      twoPlayers: '2 Spieler',
      player1: 'Spieler 1',
      player2: 'Spieler 2',
      computer: 'Computer',
      turn: 'Zug',
      wins: 'Gewinnt!',
      draw: 'Unentschieden!',
      newGame: 'Neues Spiel',
      back: 'Zurück',
      board: 'Brett',
      score: 'Punkte',
      crossBoard: 'Brett-übergreifender Sieg!'
    },
    fr: {
      singleBoard: 'Plateau unique',
      tripleBoard: '3 Plateaux',
      vsComputer: 'vs Ordinateur',
      twoPlayers: '2 Joueurs',
      player1: 'Joueur 1',
      player2: 'Joueur 2',
      computer: 'Ordinateur',
      turn: 'Tour',
      wins: 'Gagne!',
      draw: 'Match nul!',
      newGame: 'Nouveau jeu',
      back: 'Retour',
      board: 'Plateau',
      score: 'Score',
      crossBoard: 'Victoire inter-plateaux!'
    },
    es: {
      singleBoard: 'Tablero único',
      tripleBoard: '3 Tableros',
      vsComputer: 'vs Ordenador',
      twoPlayers: '2 Jugadores',
      player1: 'Jugador 1',
      player2: 'Jugador 2',
      computer: 'Ordenador',
      turn: 'Turno',
      wins: '¡Gana!',
      draw: '¡Empate!',
      newGame: 'Nuevo juego',
      back: 'Volver',
      board: 'Tablero',
      score: 'Puntos',
      crossBoard: '¡Victoria entre tableros!'
    }
  };

  const WIN_LINES = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  // Cross-board win lines: same position across 3 boards
  function getCrossBoardLines() {
    const lines = [];
    for (let i = 0; i < 9; i++) {
      lines.push([{b:0,c:i},{b:1,c:i},{b:2,c:i}]);
    }
    // Diagonal across boards: board index matches row
    // Row-based cross patterns
    for (let col = 0; col < 3; col++) {
      // Top-left to bottom-right diagonal across boards
      lines.push([{b:0,c:col},{b:1,c:col+3},{b:2,c:col+6}]);
      // Bottom-left to top-right diagonal across boards
      lines.push([{b:0,c:col+6},{b:1,c:col+3},{b:2,c:col}]);
    }
    return lines;
  }

  const CROSS_LINES = getCrossBoardLines();

  return {
    setup(props) {
      const lang = (props && props.lang) || 'tr';
      const L = (key) => (LANGS[lang] && LANGS[lang][key]) || (LANGS.en[key]) || key;

      const screen = ref('menu'); // menu, modeSelect, game
      const boardMode = ref('single'); // single, triple
      const playerMode = ref('2p'); // 2p, cpu
      const boards = ref([]);
      const currentPlayer = ref('X');
      const gameOver = ref(false);
      const winner = ref(null);
      const winLine = ref(null); // {board, cells} or {cross, cells}
      const scores = ref({ X: 0, O: 0 });
      const isCrossBoardWin = ref(false);

      function initBoards() {
        const count = boardMode.value === 'single' ? 1 : 3;
        boards.value = Array.from({length: count}, () => Array(9).fill(''));
        currentPlayer.value = 'X';
        gameOver.value = false;
        winner.value = null;
        winLine.value = null;
        isCrossBoardWin.value = false;
      }

      function checkBoardWin(board) {
        for (const line of WIN_LINES) {
          const [a, b, c] = line;
          if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a], cells: line };
          }
        }
        return null;
      }

      function checkCrossBoardWin() {
        if (boardMode.value === 'single') return null;
        for (const line of CROSS_LINES) {
          const vals = line.map(p => boards.value[p.b][p.c]);
          if (vals[0] && vals[0] === vals[1] && vals[0] === vals[2]) {
            return { winner: vals[0], cells: line };
          }
        }
        return null;
      }

      function checkDraw() {
        return boards.value.every(b => b.every(c => c !== ''));
      }

      function makeMove(boardIdx, cellIdx) {
        if (gameOver.value) return;
        if (boards.value[boardIdx][cellIdx]) return;

        boards.value[boardIdx][cellIdx] = currentPlayer.value;
        // Force reactivity
        boards.value = [...boards.value];

        // Check single-board win
        const bWin = checkBoardWin(boards.value[boardIdx]);
        if (bWin) {
          gameOver.value = true;
          winner.value = bWin.winner;
          winLine.value = { board: boardIdx, cells: bWin.cells };
          isCrossBoardWin.value = false;
          scores.value[bWin.winner]++;
          return;
        }

        // Check cross-board win
        const cWin = checkCrossBoardWin();
        if (cWin) {
          gameOver.value = true;
          winner.value = cWin.winner;
          winLine.value = { cross: true, cells: cWin.cells };
          isCrossBoardWin.value = true;
          scores.value[cWin.winner]++;
          return;
        }

        // Check draw
        if (checkDraw()) {
          gameOver.value = true;
          winner.value = null;
          return;
        }

        // Switch player
        currentPlayer.value = currentPlayer.value === 'X' ? 'O' : 'X';

        // Computer move
        if (playerMode.value === 'cpu' && currentPlayer.value === 'O' && !gameOver.value) {
          setTimeout(() => cpuMove(), 400);
        }
      }

      function cpuMove() {
        if (gameOver.value) return;
        const boardCount = boards.value.length;

        // Try to win
        for (let bi = 0; bi < boardCount; bi++) {
          const move = findBestMove(bi, 'O');
          if (move !== -1) { makeMove(bi, move); return; }
        }
        // Try to block
        for (let bi = 0; bi < boardCount; bi++) {
          const move = findBestMove(bi, 'X');
          if (move !== -1) { makeMove(bi, move); return; }
        }
        // Try cross-board win/block
        if (boardMode.value === 'triple') {
          const crossMove = findCrossBoardMove('O') || findCrossBoardMove('X');
          if (crossMove) { makeMove(crossMove.b, crossMove.c); return; }
        }
        // Take center
        for (let bi = 0; bi < boardCount; bi++) {
          if (!boards.value[bi][4]) { makeMove(bi, 4); return; }
        }
        // Take corner
        const corners = [0, 2, 6, 8];
        for (let bi = 0; bi < boardCount; bi++) {
          for (const c of corners) {
            if (!boards.value[bi][c]) { makeMove(bi, c); return; }
          }
        }
        // Take any
        for (let bi = 0; bi < boardCount; bi++) {
          for (let c = 0; c < 9; c++) {
            if (!boards.value[bi][c]) { makeMove(bi, c); return; }
          }
        }
      }

      function findBestMove(boardIdx, player) {
        const board = boards.value[boardIdx];
        for (const line of WIN_LINES) {
          const vals = line.map(i => board[i]);
          const pCount = vals.filter(v => v === player).length;
          const empty = vals.filter(v => v === '').length;
          if (pCount === 2 && empty === 1) {
            const idx = line[vals.indexOf('')];
            return idx;
          }
        }
        return -1;
      }

      function findCrossBoardMove(player) {
        for (const line of CROSS_LINES) {
          const vals = line.map(p => boards.value[p.b][p.c]);
          const pCount = vals.filter(v => v === player).length;
          const empty = vals.filter(v => v === '').length;
          if (pCount === 2 && empty === 1) {
            const emptyIdx = vals.indexOf('');
            const target = line[emptyIdx];
            if (!boards.value[target.b][target.c]) return target;
          }
        }
        return null;
      }

      function startGame(bMode, pMode) {
        boardMode.value = bMode;
        playerMode.value = pMode;
        scores.value = { X: 0, O: 0 };
        initBoards();
        screen.value = 'game';
      }

      function newGame() {
        initBoards();
      }

      function goBack() {
        screen.value = 'menu';
      }

      function selectBoardMode(mode) {
        boardMode.value = mode;
        screen.value = 'modeSelect';
      }

      function isWinCell(boardIdx, cellIdx) {
        if (!winLine.value) return false;
        if (winLine.value.cross) {
          return winLine.value.cells.some(p => p.b === boardIdx && p.c === cellIdx);
        }
        return winLine.value.board === boardIdx && winLine.value.cells.includes(cellIdx);
      }

      function getPlayerName(symbol) {
        if (symbol === 'X') return L('player1');
        if (playerMode.value === 'cpu') return L('computer');
        return L('player2');
      }

      return {
        L, screen, boardMode, playerMode,
        boards, currentPlayer, gameOver, winner, winLine,
        scores, isCrossBoardWin,
        makeMove, startGame, newGame, goBack, selectBoardMode,
        isWinCell, getPlayerName
      };
    }
  };
})(Vue);
