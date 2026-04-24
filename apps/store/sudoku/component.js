(function(Vue) {
  var ref = Vue.ref;
  var reactive = Vue.reactive;
  var computed = Vue.computed;
  var onMounted = Vue.onMounted;
  var onUnmounted = Vue.onUnmounted;

  return {
    setup: function() {
      var difficulty = ref('medium');
      var board = ref([]);
      var solution = [];
      var selectedRow = ref(-1);
      var selectedCol = ref(-1);
      var noteMode = ref(false);
      var mistakes = ref(0);
      var gameOver = ref(false);
      var won = ref(false);
      var hints = ref(3);
      var history = ref([]);
      var timer = ref(0);
      var timerInterval = null;

      var labels = reactive({
        easy: 'Kolay', medium: 'Orta', hard: 'Zor',
        newGame: 'Yeni', notes: 'Not', erase: 'Sil',
        undo: 'Geri', hint: 'İpucu', mistakes: 'Hata',
        congrats: 'Tebrikler!', gameOver: 'Oyun Bitti',
        playAgain: 'Tekrar Oyna'
      });

      var timerDisplay = computed(function() {
        var m = Math.floor(timer.value / 60);
        var s = timer.value % 60;
        return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
      });

      var selectedValue = computed(function() {
        if (selectedRow.value < 0 || selectedCol.value < 0) return 0;
        return board.value[selectedRow.value][selectedCol.value].value;
      });

      var numCounts = computed(function() {
        var counts = {};
        for (var n = 1; n <= 9; n++) counts[n] = 0;
        for (var r = 0; r < 9; r++) {
          for (var c = 0; c < 9; c++) {
            var v = board.value[r] && board.value[r][c] ? board.value[r][c].value : 0;
            if (v) counts[v]++;
          }
        }
        return counts;
      });

      function sameBox(r, c) {
        if (selectedRow.value < 0) return false;
        var br = Math.floor(selectedRow.value / 3);
        var bc = Math.floor(selectedCol.value / 3);
        return Math.floor(r / 3) === br && Math.floor(c / 3) === bc;
      }

      // --- Sudoku Generator ---
      function shuffle(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
        return arr;
      }

      function isValid(grid, row, col, num) {
        for (var i = 0; i < 9; i++) {
          if (grid[row][i] === num) return false;
          if (grid[i][col] === num) return false;
        }
        var br = Math.floor(row / 3) * 3;
        var bc = Math.floor(col / 3) * 3;
        for (var r = br; r < br + 3; r++) {
          for (var c = bc; c < bc + 3; c++) {
            if (grid[r][c] === num) return false;
          }
        }
        return true;
      }

      function solveSudoku(grid) {
        for (var r = 0; r < 9; r++) {
          for (var c = 0; c < 9; c++) {
            if (grid[r][c] === 0) {
              var nums = shuffle([1,2,3,4,5,6,7,8,9]);
              for (var i = 0; i < 9; i++) {
                if (isValid(grid, r, c, nums[i])) {
                  grid[r][c] = nums[i];
                  if (solveSudoku(grid)) return true;
                  grid[r][c] = 0;
                }
              }
              return false;
            }
          }
        }
        return true;
      }

      function generatePuzzle(diff) {
        // Create solved grid
        var grid = [];
        for (var i = 0; i < 9; i++) grid.push([0,0,0,0,0,0,0,0,0]);
        solveSudoku(grid);

        // Copy solution
        solution = [];
        for (var r = 0; r < 9; r++) solution.push(grid[r].slice());

        // Remove cells based on difficulty
        var remove = diff === 'easy' ? 35 : diff === 'medium' ? 45 : 55;
        var cells = [];
        for (var r2 = 0; r2 < 9; r2++) {
          for (var c = 0; c < 9; c++) cells.push([r2, c]);
        }
        shuffle(cells);
        for (var k = 0; k < remove && k < cells.length; k++) {
          grid[cells[k][0]][cells[k][1]] = 0;
        }

        // Build board
        var b = [];
        for (var r3 = 0; r3 < 9; r3++) {
          var row = [];
          for (var c2 = 0; c2 < 9; c2++) {
            row.push({
              value: grid[r3][c2],
              fixed: grid[r3][c2] !== 0,
              notes: [],
              error: false
            });
          }
          b.push(row);
        }
        return b;
      }

      function newGame() {
        board.value = generatePuzzle(difficulty.value);
        selectedRow.value = -1;
        selectedCol.value = -1;
        noteMode.value = false;
        mistakes.value = 0;
        gameOver.value = false;
        won.value = false;
        hints.value = 3;
        history.value = [];
        timer.value = 0;
        startTimer();
      }

      function setDifficulty(d) {
        difficulty.value = d;
        newGame();
      }

      function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(function() {
          if (!gameOver.value) timer.value++;
        }, 1000);
      }

      function selectCell(r, c) {
        if (gameOver.value) return;
        selectedRow.value = r;
        selectedCol.value = c;
      }

      function enterNumber(n) {
        if (gameOver.value) return;
        var r = selectedRow.value;
        var c = selectedCol.value;
        if (r < 0 || c < 0) return;
        var cell = board.value[r][c];
        if (cell.fixed) return;

        if (noteMode.value) {
          // Toggle note
          history.value.push({ r: r, c: c, value: cell.value, notes: cell.notes.slice(), error: cell.error });
          var idx = cell.notes.indexOf(n);
          if (idx >= 0) cell.notes.splice(idx, 1);
          else cell.notes.push(n);
          cell.value = 0;
        } else {
          history.value.push({ r: r, c: c, value: cell.value, notes: cell.notes.slice(), error: cell.error });
          cell.notes = [];
          if (n === solution[r][c]) {
            cell.value = n;
            cell.error = false;
            // Remove this number from notes in same row/col/box
            clearNotesFor(r, c, n);
            checkWin();
          } else {
            cell.value = n;
            cell.error = true;
            mistakes.value++;
            if (mistakes.value >= 3) {
              gameOver.value = true;
              won.value = false;
              if (timerInterval) clearInterval(timerInterval);
            }
          }
        }
      }

      function clearNotesFor(row, col, num) {
        for (var i = 0; i < 9; i++) {
          removeNote(board.value[row][i], num);
          removeNote(board.value[i][col], num);
        }
        var br = Math.floor(row / 3) * 3;
        var bc = Math.floor(col / 3) * 3;
        for (var r = br; r < br + 3; r++) {
          for (var c = bc; c < bc + 3; c++) {
            removeNote(board.value[r][c], num);
          }
        }
      }

      function removeNote(cell, num) {
        var idx = cell.notes.indexOf(num);
        if (idx >= 0) cell.notes.splice(idx, 1);
      }

      function eraseCell() {
        if (gameOver.value) return;
        var r = selectedRow.value;
        var c = selectedCol.value;
        if (r < 0 || c < 0) return;
        var cell = board.value[r][c];
        if (cell.fixed) return;
        history.value.push({ r: r, c: c, value: cell.value, notes: cell.notes.slice(), error: cell.error });
        cell.value = 0;
        cell.notes = [];
        cell.error = false;
      }

      function undoMove() {
        if (history.value.length === 0) return;
        var prev = history.value.pop();
        var cell = board.value[prev.r][prev.c];
        cell.value = prev.value;
        cell.notes = prev.notes;
        cell.error = prev.error;
      }

      function getHint() {
        if (hints.value <= 0 || gameOver.value) return;
        // Find empty cells
        var empty = [];
        for (var r = 0; r < 9; r++) {
          for (var c = 0; c < 9; c++) {
            if (!board.value[r][c].value || board.value[r][c].error) {
              empty.push([r, c]);
            }
          }
        }
        if (empty.length === 0) return;
        var pick = empty[Math.floor(Math.random() * empty.length)];
        var cell = board.value[pick[0]][pick[1]];
        cell.value = solution[pick[0]][pick[1]];
        cell.fixed = false;
        cell.error = false;
        cell.notes = [];
        hints.value--;
        clearNotesFor(pick[0], pick[1], cell.value);
        checkWin();
      }

      function toggleNoteMode() {
        noteMode.value = !noteMode.value;
      }

      function checkWin() {
        for (var r = 0; r < 9; r++) {
          for (var c = 0; c < 9; c++) {
            if (board.value[r][c].value !== solution[r][c]) return;
          }
        }
        gameOver.value = true;
        won.value = true;
        if (timerInterval) clearInterval(timerInterval);
      }

      function handleKeydown(e) {
        if (gameOver.value) return;
        var key = e.key;
        if (key >= '1' && key <= '9') {
          enterNumber(parseInt(key));
          e.preventDefault();
        } else if (key === 'Backspace' || key === 'Delete') {
          eraseCell();
          e.preventDefault();
        } else if (key === 'ArrowUp' && selectedRow.value > 0) { selectedRow.value--; e.preventDefault(); }
        else if (key === 'ArrowDown' && selectedRow.value < 8) { selectedRow.value++; e.preventDefault(); }
        else if (key === 'ArrowLeft' && selectedCol.value > 0) { selectedCol.value--; e.preventDefault(); }
        else if (key === 'ArrowRight' && selectedCol.value < 8) { selectedCol.value++; e.preventDefault(); }
        else if (key === 'n' || key === 'N') { toggleNoteMode(); e.preventDefault(); }
      }

      onMounted(function() {
        newGame();
        window.addEventListener('keydown', handleKeydown);
      });

      onUnmounted(function() {
        if (timerInterval) clearInterval(timerInterval);
        window.removeEventListener('keydown', handleKeydown);
      });

      return {
        difficulty: difficulty,
        board: board,
        selectedRow: selectedRow,
        selectedCol: selectedCol,
        noteMode: noteMode,
        mistakes: mistakes,
        gameOver: gameOver,
        won: won,
        hints: hints,
        history: history,
        timer: timer,
        labels: labels,
        timerDisplay: timerDisplay,
        selectedValue: selectedValue,
        numCounts: numCounts,
        sameBox: sameBox,
        newGame: newGame,
        setDifficulty: setDifficulty,
        selectCell: selectCell,
        enterNumber: enterNumber,
        eraseCell: eraseCell,
        undoMove: undoMove,
        getHint: getHint,
        toggleNoteMode: toggleNoteMode
      };
    }
  };
})(Vue);
