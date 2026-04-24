(function(Vue) {
  const { ref, computed, watch } = Vue;

  const SUITS = ['♠','♥','♦','♣'];
  const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const RED_SUITS = new Set(['♥','♦']);

  function rankValue(r) { return RANKS.indexOf(r); }

  function makeDeck() {
    const deck = [];
    let id = 0;
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({ id: id++, suit, rank, value: rankValue(rank) });
      }
    }
    return deck;
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function isRed(card) { return RED_SUITS.has(card.suit); }

  function canStackOnTableau(card, target) {
    return isRed(card) !== isRed(target) && card.value === target.value - 1;
  }

  function canMoveToFoundation(card, pile) {
    if (pile.length === 0) return card.value === 0; // Ace
    const top = pile[pile.length - 1];
    return card.suit === top.suit && card.value === top.value + 1;
  }

  return {
    setup() {
      const columns = ref([]);
      const freeCells = ref([null, null, null, null]);
      const foundations = ref([[], [], [], []]);
      const selectedSource = ref(null);
      const moves = ref(0);
      const won = ref(false);

      function deal() {
        const deck = shuffle(makeDeck());
        const cols = [[], [], [], [], [], [], [], []];
        for (let i = 0; i < 52; i++) {
          cols[i % 8].push(deck[i]);
        }
        columns.value = cols;
        freeCells.value = [null, null, null, null];
        foundations.value = [[], [], [], []];
        selectedSource.value = null;
        moves.value = 0;
        won.value = false;
      }

      function newGame() { deal(); }

      function cardColor(card) {
        return isRed(card) ? 'fc-red' : 'fc-black';
      }

      // Max movable sequence length
      function maxMovable(emptyColsCount) {
        const freeSlotsCount = freeCells.value.filter(c => c === null).length;
        return (1 + freeSlotsCount) * Math.pow(2, emptyColsCount);
      }

      // Check if a run of cards from index ri in column ci forms a valid descending alternate-color sequence
      function getMovableRun(ci, ri) {
        const col = columns.value[ci];
        const cards = [];
        for (let i = ri; i < col.length; i++) {
          if (i > ri) {
            const prev = col[i - 1];
            const curr = col[i];
            if (!canStackOnTableau(curr, prev)) return null;
          }
          cards.push(col[i]);
        }
        return cards;
      }

      function isMovable(ci, ri) {
        return getMovableRun(ci, ri) !== null;
      }

      function isSelected(ci, ri) {
        if (!selectedSource.value) return false;
        const s = selectedSource.value;
        if (s.type !== 'column') return false;
        return s.colIndex === ci && ri >= s.cardIndex;
      }

      function tryAutoFoundation(card, removeFrom) {
        for (let fi = 0; fi < 4; fi++) {
          if (canMoveToFoundation(card, foundations.value[fi])) {
            removeFrom();
            foundations.value[fi].push(card);
            moves.value++;
            checkWin();
            return true;
          }
        }
        return false;
      }

      function autoMoveAll() {
        let moved = true;
        while (moved) {
          moved = false;
          // From columns
          for (let ci = 0; ci < 8; ci++) {
            const col = columns.value[ci];
            if (col.length === 0) continue;
            const card = col[col.length - 1];
            if (isSafeAutoMove(card)) {
              for (let fi = 0; fi < 4; fi++) {
                if (canMoveToFoundation(card, foundations.value[fi])) {
                  col.pop();
                  foundations.value[fi].push(card);
                  moves.value++;
                  moved = true;
                  break;
                }
              }
            }
          }
          // From free cells
          for (let i = 0; i < 4; i++) {
            const card = freeCells.value[i];
            if (!card) continue;
            if (isSafeAutoMove(card)) {
              for (let fi = 0; fi < 4; fi++) {
                if (canMoveToFoundation(card, foundations.value[fi])) {
                  freeCells.value[i] = null;
                  foundations.value[fi].push(card);
                  moves.value++;
                  moved = true;
                  break;
                }
              }
            }
          }
        }
        checkWin();
      }

      function isSafeAutoMove(card) {
        // Safe to auto-move if both cards of opposite color with value-1 are already in foundations
        if (card.value <= 1) return true; // A and 2 always safe
        const neededValue = card.value - 1;
        for (const s of SUITS) {
          if (isRed({ suit: s }) === isRed(card)) continue; // same color, skip
          const fPile = foundations.value.find(f => f.length > 0 && f[0].suit === s);
          if (!fPile || fPile[fPile.length - 1].value < neededValue) return false;
        }
        return true;
      }

      function clickCard(ci, ri) {
        const col = columns.value[ci];
        const card = col[ri];

        if (selectedSource.value) {
          // Try to place selection onto this column
          const s = selectedSource.value;

          if (s.type === 'free') {
            const srcCard = freeCells.value[s.index];
            if (canStackOnTableau(srcCard, col[col.length - 1]) || (ri === col.length - 1 && canStackOnTableau(srcCard, card))) {
              // Actually place on bottom of column
              const target = col[col.length - 1];
              if (canStackOnTableau(srcCard, target)) {
                col.push(srcCard);
                freeCells.value[s.index] = null;
                moves.value++;
                selectedSource.value = null;
                autoMoveAll();
                return;
              }
            }
            selectedSource.value = null;
            return;
          }

          if (s.type === 'column') {
            if (s.colIndex === ci) {
              // Clicking same column - deselect or re-select
              selectedSource.value = null;
              // Try double-click = send to foundation
              if (ri === col.length - 1) {
                tryAutoFoundation(card, () => col.pop());
                autoMoveAll();
              }
              return;
            }

            const run = getMovableRun(s.colIndex, s.cardIndex);
            if (!run) { selectedSource.value = null; return; }

            const target = col[col.length - 1];
            if (canStackOnTableau(run[0], target)) {
              const emptyCols = columns.value.filter((c, idx) => c.length === 0 && idx !== ci && idx !== s.colIndex).length;
              if (run.length <= maxMovable(emptyCols)) {
                columns.value[s.colIndex].splice(s.cardIndex);
                col.push(...run);
                moves.value++;
                selectedSource.value = null;
                autoMoveAll();
                return;
              }
            }
            selectedSource.value = null;
            return;
          }
        }

        // No selection - select this card
        const run = getMovableRun(ci, ri);
        if (run) {
          // Double click last card → try foundation
          if (ri === col.length - 1) {
            for (let fi = 0; fi < 4; fi++) {
              if (canMoveToFoundation(card, foundations.value[fi])) {
                col.pop();
                foundations.value[fi].push(card);
                moves.value++;
                selectedSource.value = null;
                autoMoveAll();
                return;
              }
            }
          }
          selectedSource.value = { type: 'column', colIndex: ci, cardIndex: ri };
        }
      }

      function clickFreeCell(i) {
        const card = freeCells.value[i];

        if (selectedSource.value) {
          const s = selectedSource.value;
          if (s.type === 'free' && s.index === i) {
            // Deselect
            selectedSource.value = null;
            // Try auto foundation
            if (card) {
              tryAutoFoundation(card, () => { freeCells.value[i] = null; });
              autoMoveAll();
            }
            return;
          }

          // Place selected card into this free cell
          if (card !== null) { selectedSource.value = null; return; } // occupied

          if (s.type === 'free') {
            freeCells.value[i] = freeCells.value[s.index];
            freeCells.value[s.index] = null;
            moves.value++;
            selectedSource.value = null;
            return;
          }

          if (s.type === 'column') {
            const run = getMovableRun(s.colIndex, s.cardIndex);
            if (run && run.length === 1) {
              freeCells.value[i] = run[0];
              columns.value[s.colIndex].pop();
              moves.value++;
              selectedSource.value = null;
              autoMoveAll();
              return;
            }
            selectedSource.value = null;
            return;
          }
        }

        // Select free cell card
        if (card) {
          // Try auto foundation first
          for (let fi = 0; fi < 4; fi++) {
            if (canMoveToFoundation(card, foundations.value[fi])) {
              freeCells.value[i] = null;
              foundations.value[fi].push(card);
              moves.value++;
              autoMoveAll();
              return;
            }
          }
          selectedSource.value = { type: 'free', index: i };
        }
      }

      function clickFoundation(fi) {
        if (!selectedSource.value) return;
        const s = selectedSource.value;
        let card, removeFn;

        if (s.type === 'free') {
          card = freeCells.value[s.index];
          removeFn = () => { freeCells.value[s.index] = null; };
        } else if (s.type === 'column') {
          const col = columns.value[s.colIndex];
          if (s.cardIndex !== col.length - 1) { selectedSource.value = null; return; }
          card = col[col.length - 1];
          removeFn = () => col.pop();
        }

        if (card && canMoveToFoundation(card, foundations.value[fi])) {
          removeFn();
          foundations.value[fi].push(card);
          moves.value++;
          selectedSource.value = null;
          autoMoveAll();
        } else {
          selectedSource.value = null;
        }
      }

      function clickEmptyColumn(ci) {
        if (columns.value[ci].length > 0) return;
        if (!selectedSource.value) return;
        const s = selectedSource.value;

        if (s.type === 'free') {
          const card = freeCells.value[s.index];
          if (card) {
            columns.value[ci].push(card);
            freeCells.value[s.index] = null;
            moves.value++;
          }
          selectedSource.value = null;
          return;
        }

        if (s.type === 'column') {
          const run = getMovableRun(s.colIndex, s.cardIndex);
          if (run) {
            const emptyCols = columns.value.filter((c, idx) => c.length === 0 && idx !== ci && idx !== s.colIndex).length;
            if (run.length <= maxMovable(emptyCols)) {
              columns.value[s.colIndex].splice(s.cardIndex);
              columns.value[ci].push(...run);
              moves.value++;
            }
          }
          selectedSource.value = null;
        }
      }

      function checkWin() {
        const total = foundations.value.reduce((s, f) => s + f.length, 0);
        if (total === 52) won.value = true;
      }

      // Is card covered (not the last card in its column)?
      function isCovered(ci, ri) {
        return ri < columns.value[ci].length - 1;
      }

      // Hint system
      const hintCards = ref([]);
      let hintTimer = null;

      function showHint() {
        const hints = [];
        // Check columns → foundation
        for (let ci = 0; ci < 8; ci++) {
          const col = columns.value[ci];
          if (!col.length) continue;
          const card = col[col.length - 1];
          for (let fi = 0; fi < 4; fi++) {
            if (canMoveToFoundation(card, foundations.value[fi])) {
              hints.push({ fromType: 'col', fromCol: ci, fromRow: col.length - 1, toType: 'foundation', toIndex: fi, priority: 3 });
            }
          }
        }
        // Check free cells → foundation
        for (let i = 0; i < 4; i++) {
          const card = freeCells.value[i];
          if (!card) continue;
          for (let fi = 0; fi < 4; fi++) {
            if (canMoveToFoundation(card, foundations.value[fi])) {
              hints.push({ fromType: 'free', fromIndex: i, toType: 'foundation', toIndex: fi, priority: 3 });
            }
          }
        }
        // Check columns → columns (single card or runs)
        for (let ci = 0; ci < 8; ci++) {
          const col = columns.value[ci];
          if (!col.length) continue;
          for (let ri = 0; ri < col.length; ri++) {
            const run = getMovableRun(ci, ri);
            if (!run) continue;
            for (let tj = 0; tj < 8; tj++) {
              if (tj === ci) continue;
              const tcol = columns.value[tj];
              if (tcol.length === 0) {
                if (ri === 0) continue; // no point moving whole stack to empty
                const emptyCols = columns.value.filter((c, idx) => c.length === 0 && idx !== tj && idx !== ci).length;
                if (run.length <= maxMovable(emptyCols)) {
                  hints.push({ fromType: 'col', fromCol: ci, fromRow: ri, toType: 'col', toCol: tj, priority: 1 });
                }
              } else {
                const target = tcol[tcol.length - 1];
                if (canStackOnTableau(run[0], target)) {
                  const emptyCols = columns.value.filter((c, idx) => c.length === 0 && idx !== tj && idx !== ci).length;
                  if (run.length <= maxMovable(emptyCols)) {
                    hints.push({ fromType: 'col', fromCol: ci, fromRow: ri, toType: 'col', toCol: tj, priority: 2 });
                  }
                }
              }
            }
          }
        }
        // Check free cells → columns
        for (let i = 0; i < 4; i++) {
          const card = freeCells.value[i];
          if (!card) continue;
          for (let tj = 0; tj < 8; tj++) {
            const tcol = columns.value[tj];
            if (tcol.length === 0) {
              hints.push({ fromType: 'free', fromIndex: i, toType: 'col', toCol: tj, priority: 1 });
            } else if (canStackOnTableau(card, tcol[tcol.length - 1])) {
              hints.push({ fromType: 'free', fromIndex: i, toType: 'col', toCol: tj, priority: 2 });
            }
          }
        }

        if (!hints.length) return;
        // Pick highest priority hint
        hints.sort((a, b) => b.priority - a.priority);
        const best = hints[0];

        // Build highlight card IDs
        const ids = new Set();
        if (best.fromType === 'col') {
          const col = columns.value[best.fromCol];
          for (let i = best.fromRow; i < col.length; i++) ids.add(col[i].id);
        } else if (best.fromType === 'free') {
          ids.add(freeCells.value[best.fromIndex].id);
        }
        hintCards.value = [...ids];

        if (hintTimer) clearTimeout(hintTimer);
        hintTimer = setTimeout(() => { hintCards.value = []; }, 2500);
      }

      function isHinted(cardId) {
        return hintCards.value.includes(cardId);
      }

      deal();

      return {
        columns, freeCells, foundations, selectedSource, moves, won,
        newGame, cardColor, isMovable, isSelected, isCovered, isHinted, showHint,
        clickCard, clickFreeCell, clickFoundation, clickEmptyColumn
      };
    }
  };
})(Vue)
