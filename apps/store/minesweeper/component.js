(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, watch } = Vue;

  const PRESETS = {
    easy:   { rows: 9,  cols: 9,  mines: 10 },
    medium: { rows: 16, cols: 16, mines: 40 },
    hard:   { rows: 16, cols: 30, mines: 99 }
  };

  return {
    setup() {
      const difficulty = ref('easy');
      const board = ref([]);
      const gameState = ref('playing'); // playing | won | lost
      const timer = ref(0);
      const firstClick = ref(true);
      let timerInterval = null;

      const preset = computed(() => PRESETS[difficulty.value]);

      const remainingMines = computed(() => {
        const flagged = board.value.flat().filter(c => c.flagged).length;
        return preset.value.mines - flagged;
      });

      function createBoard() {
        const { rows, cols } = preset.value;
        const b = [];
        for (let y = 0; y < rows; y++) {
          const row = [];
          for (let x = 0; x < cols; x++) {
            row.push({ mine: false, revealed: false, flagged: false, adjacent: 0 });
          }
          b.push(row);
        }
        return b;
      }

      function placeMines(excludeX, excludeY) {
        const { rows, cols, mines } = preset.value;
        let placed = 0;
        while (placed < mines) {
          const x = Math.floor(Math.random() * cols);
          const y = Math.floor(Math.random() * rows);
          if (board.value[y][x].mine) continue;
          if (Math.abs(x - excludeX) <= 1 && Math.abs(y - excludeY) <= 1) continue;
          board.value[y][x].mine = true;
          placed++;
        }
        calcAdjacent();
      }

      function calcAdjacent() {
        const { rows, cols } = preset.value;
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            if (board.value[y][x].mine) continue;
            let count = 0;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const ny = y + dy, nx = x + dx;
                if (ny >= 0 && ny < rows && nx >= 0 && nx < cols && board.value[ny][nx].mine) count++;
              }
            }
            board.value[y][x].adjacent = count;
          }
        }
      }

      function reveal(x, y) {
        if (gameState.value !== 'playing') return;
        const cell = board.value[y][x];
        if (cell.revealed || cell.flagged) return;

        if (firstClick.value) {
          firstClick.value = false;
          placeMines(x, y);
          startTimer();
        }

        cell.revealed = true;

        if (cell.mine) {
          gameState.value = 'lost';
          stopTimer();
          revealAll();
          return;
        }

        if (cell.adjacent === 0) {
          floodReveal(x, y);
        }

        checkWin();
      }

      function floodReveal(x, y) {
        const { rows, cols } = preset.value;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = y + dy, nx = x + dx;
            if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
              const c = board.value[ny][nx];
              if (!c.revealed && !c.mine && !c.flagged) {
                c.revealed = true;
                if (c.adjacent === 0) floodReveal(nx, ny);
              }
            }
          }
        }
      }

      function flag(x, y) {
        if (gameState.value !== 'playing') return;
        const cell = board.value[y][x];
        if (cell.revealed) return;
        cell.flagged = !cell.flagged;
      }

      function revealAll() {
        board.value.flat().forEach(c => { if (c.mine) c.revealed = true; });
      }

      function checkWin() {
        const cells = board.value.flat();
        const unrevealed = cells.filter(c => !c.revealed).length;
        if (unrevealed === preset.value.mines) {
          gameState.value = 'won';
          stopTimer();
          cells.filter(c => c.mine).forEach(c => c.flagged = true);
        }
      }

      function startTimer() {
        stopTimer();
        timer.value = 0;
        timerInterval = setInterval(() => { timer.value++; }, 1000);
      }

      function stopTimer() {
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
      }

      function reset() {
        stopTimer();
        timer.value = 0;
        gameState.value = 'playing';
        firstClick.value = true;
        board.value = createBoard();
      }

      reset();

      onUnmounted(() => stopTimer());

      return { board, gameState, timer, remainingMines, difficulty, reveal, flag, reset };
    }
  };
})(Vue);
