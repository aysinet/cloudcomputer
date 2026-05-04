(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, nextTick, watch } = Vue;

  const LANGS = {
    tr: {
      moves:'Hamle',
      pairs:'Eşleşme',
      time:'Süre',
      best:'En İyi',
      start:'Başla',
      restart:'Tekrar Oyna',
      difficulty:'Zorluk',
      easy:'Kolay',
      medium:'Orta',
      hard:'Zor',
      congrats:'Tebrikler!',
      complete:'Oyunu tamamladınız!',
      newBest:'Yeni Rekor!',
      movesCount:'{n} hamle',
      timeCount:'{t}s',
      singlePlayer:'1 Oyuncu',
      twoPlayer:'2 Oyuncu',
      player1:'1. Oyuncu',
      player2:'2. Oyuncu',
      playerTurn:'{p} Sırası',
      p1Wins:'1. Oyuncu Kazandı!',
      p2Wins:'2. Oyuncu Kazandı!',
      draw:'Berabere!',
      score:'Skor',
      computer:'Bilgisayar',
      vsComputer:'Bilgisayara Karşı'
    },
    en: {
      moves:'Moves',
      pairs:'Pairs',
      time:'Time',
      best:'Best',
      start:'Start',
      restart:'Play Again',
      difficulty:'Difficulty',
      easy:'Easy',
      medium:'Medium',
      hard:'Hard',
      congrats:'Congratulations!',
      complete:'You completed the game!',
      newBest:'New Record!',
      movesCount:'{n} moves',
      timeCount:'{t}s',
      singlePlayer:'1 Player',
      twoPlayer:'2 Players',
      player1:'Player 1',
      player2:'Player 2',
      playerTurn:'{p}\'s Turn',
      p1Wins:'Player 1 Wins!',
      p2Wins:'Player 2 Wins!',
      draw:'Draw!',
      score:'Score',
      computer:'Computer',
      vsComputer:'vs Computer'
    },
    de: {
      moves:'Züge',
      pairs:'Paare',
      time:'Zeit',
      best:'Beste',
      start:'Start',
      restart:'Nochmal',
      difficulty:'Schwierigkeit',
      easy:'Leicht',
      medium:'Mittel',
      hard:'Schwer',
      congrats:'Glückwunsch!',
      complete:'Spiel abgeschlossen!',
      newBest:'Neuer Rekord!',
      movesCount:'{n} Züge',
      timeCount:'{t}s',
      singlePlayer:'1 Spieler',
      twoPlayer:'2 Spieler',
      player1:'Spieler 1',
      player2:'Spieler 2',
      playerTurn:'{p} ist dran',
      p1Wins:'Spieler 1 gewinnt!',
      p2Wins:'Spieler 2 gewinnt!',
      draw:'Unentschieden!',
      score:'Punkte',
      computer:'Computer',
      vsComputer:'gegen Computer'
    },
    fr: {
      moves:'Coups',
      pairs:'Paires',
      time:'Temps',
      best:'Meilleur',
      start:'Démarrer',
      restart:'Rejouer',
      difficulty:'Difficulté',
      easy:'Facile',
      medium:'Moyen',
      hard:'Difficile',
      congrats:'Félicitations !',
      complete:'Jeu terminé !',
      newBest:'Nouveau record !',
      movesCount:'{n} coups',
      timeCount:'{t}s',
      singlePlayer:'1 Joueur',
      twoPlayer:'2 Joueurs',
      player1:'Joueur 1',
      player2:'Joueur 2',
      playerTurn:'Tour de {p}',
      p1Wins:'Joueur 1 gagne !',
      p2Wins:'Joueur 2 gagne !',
      draw:'Égalité !',
      score:'Score',
      computer:'Ordinateur',
      vsComputer:'contre Ordinateur'
    },
    es: {
      moves:'Jugadas',
      pairs:'Pares',
      time:'Tiempo',
      best:'Mejor',
      start:'Iniciar',
      restart:'Rejugar',
      difficulty:'Dificultad',
      easy:'Fácil',
      medium:'Medio',
      hard:'Difícil',
      congrats:'¡Felicidades!',
      complete:'¡Juego completado!',
      newBest:'¡Nuevo récord!',
      movesCount:'{n} jugadas',
      timeCount:'{t}s',
      singlePlayer:'1 Jugador',
      twoPlayer:'2 Jugadores',
      player1:'Jugador 1',
      player2:'Jugador 2',
      playerTurn:'Turno de {p}',
      p1Wins:'¡Jugador 1 gana!',
      p2Wins:'¡Jugador 2 gana!',
      draw:'¡Empate!',
      score:'Puntos',
      computer:'Computadora',
      vsComputer:'contra Computadora'
    },
    ru: {
      moves:'Ходы',
      pairs:'Пары',
      time:'Время',
      best:'Лучший',
      start:'Старт',
      restart:'Заново',
      difficulty:'Сложность',
      easy:'Лёгкий',
      medium:'Средний',
      hard:'Сложный',
      congrats:'Поздравляем!',
      complete:'Игра завершена!',
      newBest:'Новый рекорд!',
      movesCount:'{n} ходов',
      timeCount:'{t}s',
      singlePlayer:'1 Игрок',
      twoPlayer:'2 Игрока',
      player1:'Игрок 1',
      player2:'Игрок 2',
      playerTurn:'Ход {p}',
      p1Wins:'Игрок 1 победил!',
      p2Wins:'Игрок 2 победил!',
      draw:'Ничья!',
      score:'Счёт',
      computer:'Компьютер',
      vsComputer:'против Компьютера'
    },
    zh: {
      moves:'步数',
      pairs:'配对',
      time:'时间',
      best:'最佳',
      start:'开始',
      restart:'重玩',
      difficulty:'难度',
      easy:'简单',
      medium:'中等',
      hard:'困难',
      congrats:'恭喜！',
      complete:'游戏完成！',
      newBest:'新纪录！',
      movesCount:'{n}步',
      timeCount:'{t}秒',
      singlePlayer:'单人',
      twoPlayer:'双人',
      player1:'玩家1',
      player2:'玩家2',
      playerTurn:'{p}的回合',
      p1Wins:'玩家1获胜！',
      p2Wins:'玩家2获胜！',
      draw:'平局！',
      score:'得分',
      computer:'电脑',
      vsComputer:'对战电脑'
    },
    ja: {
      moves:'手数',
      pairs:'ペア',
      time:'時間',
      best:'ベスト',
      start:'スタート',
      restart:'もう一度',
      difficulty:'難易度',
      easy:'易しい',
      medium:'普通',
      hard:'難しい',
      congrats:'おめでとう！',
      complete:'ゲームクリア！',
      newBest:'新記録！',
      movesCount:'{n}手',
      timeCount:'{t}秒',
      singlePlayer:'1人',
      twoPlayer:'2人',
      player1:'プレイヤー1',
      player2:'プレイヤー2',
      playerTurn:'{p}のターン',
      p1Wins:'プレイヤー1の勝ち！',
      p2Wins:'プレイヤー2の勝ち！',
      draw:'引き分け！',
      score:'スコア',
      computer:'コンピュータ',
      vsComputer:'対コンピュータ'
    },
    it: {
      moves:'Mosse',
      pairs:'Coppie',
      time:'Tempo',
      best:'Migliore',
      start:'Inizia',
      restart:'Rigioca',
      difficulty:'Difficoltà',
      easy:'Facile',
      medium:'Medio',
      hard:'Difficile',
      congrats:'Complimenti!',
      complete:'Gioco completato!',
      newBest:'Nuovo record!',
      movesCount:'{n} mosse',
      timeCount:'{t}s',
      singlePlayer:'1 Giocatore',
      twoPlayer:'2 Giocatori',
      player1:'Giocatore 1',
      player2:'Giocatore 2',
      playerTurn:'Turno di {p}',
      p1Wins:'Giocatore 1 vince!',
      p2Wins:'Giocatore 2 vince!',
      draw:'Pareggio!',
      score:'Punti',
      computer:'Computer',
      vsComputer:'contro Computer'
    },
    ar: {
      moves:'Moves',
      pairs:'Pairs',
      time:'الوقت',
      best:'Best',
      start:'بدء',
      restart:'العب مجدداً',
      difficulty:'Difficulty',
      easy:'Easy',
      medium:'متوسط',
      hard:'Hard',
      congrats:'Congratulations!',
      complete:'You completed the game!',
      newBest:'New Record!',
      movesCount:'{n} moves',
      timeCount:'{t}s',
      singlePlayer:'1 Player',
      twoPlayer:'2 Players',
      player1:'Player 1',
      player2:'Player 2',
      playerTurn:'{p}\'s Turn',
      p1Wins:'Player 1 Wins!',
      p2Wins:'Player 2 Wins!',
      draw:'تعادل!',
      score:'Score',
      computer:'Computer',
      vsComputer:'vs Computer'
    },
    ko: {
      moves:'Moves',
      pairs:'Pairs',
      time:'Time',
      best:'Best',
      start:'시작',
      restart:'다시 하기',
      difficulty:'Difficulty',
      easy:'Easy',
      medium:'중형',
      hard:'Hard',
      congrats:'Congratulations!',
      complete:'You completed the game!',
      newBest:'New Record!',
      movesCount:'{n} moves',
      timeCount:'{t}s',
      singlePlayer:'1 Player',
      twoPlayer:'2 Players',
      player1:'Player 1',
      player2:'Player 2',
      playerTurn:'{p}\'s Turn',
      p1Wins:'Player 1 Wins!',
      p2Wins:'Player 2 Wins!',
      draw:'무승부!',
      score:'Score',
      computer:'Computer',
      vsComputer:'vs Computer'
    },
    hi: {
      moves:'Moves',
      pairs:'Pairs',
      time:'Time',
      best:'Best',
      start:'शुरू करें',
      restart:'Play Again',
      difficulty:'Difficulty',
      easy:'Easy',
      medium:'मध्यम',
      hard:'Hard',
      congrats:'Congratulations!',
      complete:'You completed the game!',
      newBest:'New Record!',
      movesCount:'{n} moves',
      timeCount:'{t}s',
      singlePlayer:'1 Player',
      twoPlayer:'2 Players',
      player1:'Player 1',
      player2:'Player 2',
      playerTurn:'{p}\'s Turn',
      p1Wins:'Player 1 Wins!',
      p2Wins:'Player 2 Wins!',
      draw:'ड्रॉ!',
      score:'Score',
      computer:'Computer',
      vsComputer:'vs Computer'
    },
    pt: {
      moves:'Moves',
      pairs:'Pairs',
      time:'Time',
      best:'Best',
      start:'Iniciar',
      restart:'Jogar de Novo',
      difficulty:'Difficulty',
      easy:'Easy',
      medium:'Médio',
      hard:'Hard',
      congrats:'Congratulations!',
      complete:'You completed the game!',
      newBest:'New Record!',
      movesCount:'{n} moves',
      timeCount:'{t}s',
      singlePlayer:'1 Player',
      twoPlayer:'2 Players',
      player1:'Player 1',
      player2:'Player 2',
      playerTurn:'{p}\'s Turn',
      p1Wins:'Player 1 Wins!',
      p2Wins:'Player 2 Wins!',
      draw:'Empate!',
      score:'Score',
      computer:'Computer',
      vsComputer:'vs Computer'
    }
  };

  const EMOJI_POOL = [
    '🍎','🍊','🍋','🍇','🍉','🍓','🍒','🥝',
    '🌸','🌻','🌺','🍀','🌈','⭐','🌙','❄️',
    '🐶','🐱','🐸','🦊','🐻','🐼','🐨','🦁',
    '🎸','🎹','🎺','🥁','🎯','🎲','🏀','⚽'
  ];

  const DIFFICULTIES = {
    easy:   { cols: 4, rows: 3 },
    medium: { cols: 4, rows: 4 },
    hard:   { cols: 6, rows: 4 }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  return {
    setup() {
      const locale = ref(getLocale());
      const L = (k) => (LANGS[locale.value] || LANGS.en)[k] || k;

      const difficulty = ref('medium');
      const state = ref('idle'); // idle | playing | complete | turnSwitch
      const moves = ref(0);
      const matchedPairs = ref(0);
      const elapsedTime = ref(0);
      const bestTime = ref(null);
      const isNewBest = ref(false);
      const cards = ref([]);
      const flippedIndices = ref([]);
      const lockBoard = ref(false);

      // 2-player mode
      const gameMode = ref('single'); // single | two
      const vsComputer = ref(false);
      const currentPlayer = ref(1);
      const p1Score = ref(0);
      const p2Score = ref(0);
      const turnBannerPlayer = ref(1);

      // Computer AI memory: remembers cards it has seen
      const computerMemory = ref({}); // { emoji: [index, ...] }

      let timerInterval = null;

      const gridConfig = computed(() => DIFFICULTIES[difficulty.value]);
      const totalPairs = computed(() => (gridConfig.value.cols * gridConfig.value.rows) / 2);

      function loadBest() {
        try {
          const val = localStorage.getItem('memory_match_best_' + difficulty.value);
          bestTime.value = val ? parseInt(val, 10) : null;
        } catch { bestTime.value = null; }
      }

      function saveBest(time) {
        try { localStorage.setItem('memory_match_best_' + difficulty.value, time); } catch {}
      }

      function generateCards() {
        const count = totalPairs.value;
        const emojis = shuffle(EMOJI_POOL).slice(0, count);
        const pairs = shuffle([...emojis, ...emojis]);
        cards.value = pairs.map((emoji, i) => ({
          id: i,
          emoji,
          flipped: false,
          matched: false
        }));
      }

      function startGame() {
        stopTimer();
        moves.value = 0;
        matchedPairs.value = 0;
        elapsedTime.value = 0;
        isNewBest.value = false;
        flippedIndices.value = [];
        lockBoard.value = false;
        currentPlayer.value = 1;
        p1Score.value = 0;
        p2Score.value = 0;
        loadBest();
        generateCards();
        computerMemory.value = {};
        if (gameMode.value === 'two') {
          turnBannerPlayer.value = 1;
          state.value = 'turnSwitch';
          setTimeout(() => { state.value = 'playing'; startTimer(); }, 1200);
        } else {
          state.value = 'playing';
          startTimer();
        }
      }

      function startTimer() {
        timerInterval = setInterval(() => { elapsedTime.value++; }, 1000);
      }

      function stopTimer() {
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
      }

      function flipCard(index) {
        if (lockBoard.value) return;
        const card = cards.value[index];
        if (card.flipped || card.matched) return;

        card.flipped = true;
        flippedIndices.value.push(index);

        // Computer remembers every card it sees
        if (gameMode.value === 'two' && vsComputer.value) {
          const mem = computerMemory.value;
          if (!mem[card.emoji]) mem[card.emoji] = [];
          if (!mem[card.emoji].includes(index)) mem[card.emoji].push(index);
        }

        if (flippedIndices.value.length === 2) {
          moves.value++;
          lockBoard.value = true;

          const [i1, i2] = flippedIndices.value;
          const c1 = cards.value[i1];
          const c2 = cards.value[i2];

          if (c1.emoji === c2.emoji) {
            c1.matched = true;
            c2.matched = true;
            matchedPairs.value++;
            if (gameMode.value === 'two') {
              if (currentPlayer.value === 1) p1Score.value++;
              else p2Score.value++;
            }
            flippedIndices.value = [];
            lockBoard.value = false;

            if (matchedPairs.value === totalPairs.value) {
              stopTimer();
              state.value = 'complete';
              if (gameMode.value === 'single') {
                if (bestTime.value === null || elapsedTime.value < bestTime.value) {
                  bestTime.value = elapsedTime.value;
                  isNewBest.value = true;
                  saveBest(elapsedTime.value);
                }
              }
            } else if (gameMode.value === 'two' && vsComputer.value && currentPlayer.value === 2) {
              // Computer matched — gets another turn
              setTimeout(() => { computerPlay(); }, 800);
            }
          } else {
            setTimeout(() => {
              c1.flipped = false;
              c2.flipped = false;
              flippedIndices.value = [];
              if (gameMode.value === 'two') {
                currentPlayer.value = currentPlayer.value === 1 ? 2 : 1;
                turnBannerPlayer.value = currentPlayer.value;
                state.value = 'turnSwitch';
                setTimeout(() => {
                  state.value = 'playing';
                  lockBoard.value = false;
                  if (vsComputer.value && currentPlayer.value === 2) {
                    setTimeout(() => { computerPlay(); }, 600);
                  }
                }, 1200);
              } else {
                lockBoard.value = false;
              }
            }, 800);
          }
        }
      }

      function changeDifficulty(d) {
        difficulty.value = d;
        state.value = 'idle';
        stopTimer();
        loadBest();
        generateCards();
      }

      function setGameMode(m) {
        gameMode.value = m;
        if (m === 'single') vsComputer.value = false;
        state.value = 'idle';
        stopTimer();
        loadBest();
        generateCards();
      }

      function toggleVsComputer() {
        vsComputer.value = !vsComputer.value;
        if (vsComputer.value && gameMode.value !== 'two') gameMode.value = 'two';
        state.value = 'idle';
        stopTimer();
        loadBest();
        generateCards();
      }

      function computerPlay() {
        if (state.value !== 'playing' || currentPlayer.value !== 2) return;
        const mem = computerMemory.value;
        const available = cards.value
          .map((c, i) => (!c.flipped && !c.matched) ? i : -1)
          .filter(i => i !== -1);
        if (available.length < 2) return;

        // Check if computer remembers a matching pair
        let knownPair = null;
        for (const emoji in mem) {
          const indices = mem[emoji].filter(i => !cards.value[i].matched && !cards.value[i].flipped);
          if (indices.length >= 2) {
            knownPair = [indices[0], indices[1]];
            break;
          }
        }

        let pick1, pick2;
        if (knownPair) {
          pick1 = knownPair[0];
          pick2 = knownPair[1];
        } else {
          // Pick randomly
          const shuffled = shuffle(available);
          pick1 = shuffled[0];
          pick2 = shuffled[1];
        }

        // Flip first card
        setTimeout(() => {
          flipCard(pick1);
          // Flip second card after a short delay
          setTimeout(() => {
            flipCard(pick2);
          }, 700);
        }, 500);
      }

      function winnerText() {
        if (p1Score.value > p2Score.value) return L('p1Wins');
        if (p2Score.value > p1Score.value) return L('p2Wins');
        return L('draw');
      }

      function formatTime(s) {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return m > 0 ? m + ':' + String(sec).padStart(2, '0') : sec + 's';
      }

      onMounted(() => {
        loadBest();
        generateCards();
      });

      onUnmounted(() => { stopTimer(); });

      return {
        L, state, difficulty, moves, matchedPairs, totalPairs, elapsedTime,
        bestTime, isNewBest, cards, gridConfig,
        gameMode, vsComputer, currentPlayer, p1Score, p2Score, turnBannerPlayer,
        flipCard, startGame, changeDifficulty, setGameMode, toggleVsComputer, formatTime, winnerText
      };
    }
  };
})(Vue);
