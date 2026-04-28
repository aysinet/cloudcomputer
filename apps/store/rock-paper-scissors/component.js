(function(Vue) {
  const { ref, computed, onUnmounted } = Vue;

  const EMOJIS = { rock: '✊', paper: '✋', scissors: '✌️' };
  const CHOICES = ['rock', 'paper', 'scissors'];

  const LANGS = {
    tr: {
      you:'Sen', cpu:'Bilgisayar', draw:'Berabere', rock:'Taş', paper:'Kağıt', scissors:'Makas',
      win:'Kazandın!', lose:'Kaybettin!', tied:'Berabere!',
      round:'Tur', bestOf:'Tur Sayısı', newGame:'Yeni Oyun', resetAll:'Sıfırla',
      winMatch:'Maçı Kazandın! 🎉', loseMatch:'Maçı Kaybettin!', tiedMatch:'Maç Berabere!'
    },
    en: {
      you:'You', cpu:'Computer', draw:'Draw', rock:'Rock', paper:'Paper', scissors:'Scissors',
      win:'You Win!', lose:'You Lose!', tied:'Draw!',
      round:'Round', bestOf:'Rounds', newGame:'New Game', resetAll:'Reset All',
      winMatch:'You Won the Match! 🎉', loseMatch:'You Lost the Match!', tiedMatch:'Match Tied!'
    },
    de: {
      you:'Du', cpu:'Computer', draw:'Unentschieden', rock:'Stein', paper:'Papier', scissors:'Schere',
      win:'Gewonnen!', lose:'Verloren!', tied:'Unentschieden!',
      round:'Runde', bestOf:'Runden', newGame:'Neues Spiel', resetAll:'Zurücksetzen',
      winMatch:'Du hast gewonnen! 🎉', loseMatch:'Du hast verloren!', tiedMatch:'Unentschieden!'
    },
    fr: {
      you:'Vous', cpu:'Ordinateur', draw:'Égalité', rock:'Pierre', paper:'Feuille', scissors:'Ciseaux',
      win:'Gagné !', lose:'Perdu !', tied:'Égalité !',
      round:'Manche', bestOf:'Manches', newGame:'Nouvelle Partie', resetAll:'Réinitialiser',
      winMatch:'Vous avez gagné ! 🎉', loseMatch:'Vous avez perdu !', tiedMatch:'Match nul !'
    },
    es: {
      you:'Tú', cpu:'Computadora', draw:'Empate', rock:'Piedra', paper:'Papel', scissors:'Tijera',
      win:'¡Ganaste!', lose:'¡Perdiste!', tied:'¡Empate!',
      round:'Ronda', bestOf:'Rondas', newGame:'Nuevo Juego', resetAll:'Reiniciar',
      winMatch:'¡Ganaste el partido! 🎉', loseMatch:'¡Perdiste el partido!', tiedMatch:'¡Partido empatado!'
    },
    ru: {
      you:'Вы', cpu:'Компьютер', draw:'Ничья', rock:'Камень', paper:'Бумага', scissors:'Ножницы',
      win:'Победа!', lose:'Поражение!', tied:'Ничья!',
      round:'Раунд', bestOf:'Раунды', newGame:'Новая игра', resetAll:'Сброс',
      winMatch:'Вы выиграли матч! 🎉', loseMatch:'Вы проиграли матч!', tiedMatch:'Матч ничья!'
    },
    zh: {
      you:'你', cpu:'电脑', draw:'平局', rock:'石头', paper:'布', scissors:'剪刀',
      win:'你赢了！', lose:'你输了！', tied:'平局！',
      round:'回合', bestOf:'回合数', newGame:'新游戏', resetAll:'重置',
      winMatch:'你赢得了比赛！🎉', loseMatch:'你输了比赛！', tiedMatch:'比赛平局！'
    },
    ja: {
      you:'あなた', cpu:'コンピュータ', draw:'引き分け', rock:'グー', paper:'パー', scissors:'チョキ',
      win:'勝ち！', lose:'負け！', tied:'引き分け！',
      round:'ラウンド', bestOf:'ラウンド数', newGame:'新しいゲーム', resetAll:'リセット',
      winMatch:'試合に勝ちました！🎉', loseMatch:'試合に負けました！', tiedMatch:'試合引き分け！'
    },
    it: {
      you:'Tu', cpu:'Computer', draw:'Pareggio', rock:'Sasso', paper:'Carta', scissors:'Forbice',
      win:'Hai vinto!', lose:'Hai perso!', tied:'Pareggio!',
      round:'Round', bestOf:'Round', newGame:'Nuova Partita', resetAll:'Reset',
      winMatch:'Hai vinto la partita! 🎉', loseMatch:'Hai perso la partita!', tiedMatch:'Partita pareggiata!'
    }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  function getWinner(player, cpu) {
    if (player === cpu) return 'tied';
    if (
      (player === 'rock' && cpu === 'scissors') ||
      (player === 'paper' && cpu === 'rock') ||
      (player === 'scissors' && cpu === 'paper')
    ) return 'win';
    return 'lose';
  }

  return {
    setup() {
      const locale = ref(getLocale());
      const L = (k) => (LANGS[locale.value] || LANGS.en)[k] || k;

      const rootEl = ref(null);

      const playerScore = ref(0);
      const cpuScore = ref(0);
      const draws = ref(0);
      const round = ref(0);
      const totalRounds = ref(5);

      const playerChoice = ref(null);
      const cpuChoice = ref(null);
      const result = ref(null);      // 'win' | 'lose' | 'tied' | null
      const cpuResult = ref(null);    // inverse for cpu styling
      const shaking = ref(false);
      const matchResult = ref(null);  // 'win' | 'lose' | 'tied' | null

      let shakeTimer = null;
      let resultTimer = null;

      const playerEmoji = computed(() => {
        if (shaking.value) return '✊';
        return playerChoice.value ? EMOJIS[playerChoice.value] : '❓';
      });

      const cpuEmoji = computed(() => {
        if (shaking.value) return '✊';
        return cpuChoice.value ? EMOJIS[cpuChoice.value] : '❓';
      });

      function play(choice) {
        if (shaking.value || matchResult.value) return;

        playerChoice.value = null;
        cpuChoice.value = null;
        result.value = null;
        cpuResult.value = null;
        shaking.value = true;

        const cpu = CHOICES[Math.floor(Math.random() * 3)];

        shakeTimer = setTimeout(() => {
          shaking.value = false;
          playerChoice.value = choice;
          cpuChoice.value = cpu;

          const res = getWinner(choice, cpu);
          result.value = res;
          cpuResult.value = res === 'win' ? 'lose' : res === 'lose' ? 'win' : 'tied';

          round.value++;
          if (res === 'win') playerScore.value++;
          else if (res === 'lose') cpuScore.value++;
          else draws.value++;

          checkMatchEnd();
        }, 800);
      }

      function checkMatchEnd() {
        const winsNeeded = Math.ceil(totalRounds.value / 2);
        if (playerScore.value >= winsNeeded) {
          matchResult.value = 'win';
        } else if (cpuScore.value >= winsNeeded) {
          matchResult.value = 'lose';
        } else if (round.value >= totalRounds.value) {
          if (playerScore.value > cpuScore.value) matchResult.value = 'win';
          else if (cpuScore.value > playerScore.value) matchResult.value = 'lose';
          else matchResult.value = 'tied';
        }
      }

      function resetMatch() {
        clearTimeout(shakeTimer);
        clearTimeout(resultTimer);
        playerScore.value = 0;
        cpuScore.value = 0;
        draws.value = 0;
        round.value = 0;
        playerChoice.value = null;
        cpuChoice.value = null;
        result.value = null;
        cpuResult.value = null;
        shaking.value = false;
        matchResult.value = null;
      }

      function resetAll() {
        resetMatch();
        totalRounds.value = 5;
      }

      function onKeyDown(e) {
        if (shaking.value || matchResult.value) return;
        const key = e.key.toLowerCase();
        if (key === '1' || key === 'r') { e.preventDefault(); play('rock'); }
        else if (key === '2' || key === 'p') { e.preventDefault(); play('paper'); }
        else if (key === '3' || key === 's') { e.preventDefault(); play('scissors'); }
      }

      onUnmounted(() => {
        clearTimeout(shakeTimer);
        clearTimeout(resultTimer);
      });

      return {
        L, rootEl,
        playerScore, cpuScore, draws,
        round, totalRounds,
        playerChoice, cpuChoice,
        result, cpuResult,
        shaking, matchResult,
        playerEmoji, cpuEmoji,
        play, resetMatch, resetAll, onKeyDown
      };
    }
  };
})(Vue);
