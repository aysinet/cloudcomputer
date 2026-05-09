(function(Vue) {
const { ref, computed, onMounted, onUnmounted, nextTick, watch } = Vue;

/* ═══════════════════════════════════════════════════════════════
   i18n — 13 languages
   ═══════════════════════════════════════════════════════════════ */
const LANGS = {
  tr: {
    title:'Futbol', startGame:'Oyuna Başla', gameMode:'Oyun Modu',
    vsAI:'Bilgisayara Karşı', vs2P:'2 Kişilik', difficulty:'Zorluk',
    easy:'Kolay', medium:'Orta', hard:'Zor',
    matchTime:'Maç Süresi', min:'dk',
    player1:'Oyuncu 1', player2:'Oyuncu 2', ai:'Bilgisayar',
    controls:'Kontrol', controlsP1:'W A S D', controlsP2:'↑ ← ↓ →',
    switchKey:'Oyuncu Değiştir', switchP1:'Q', switchP2:'/',
    shootKey:'Şut', passKey:'Pas', shootP1:'Z', passP1:'X', shootP2:'M', passP2:'N',
    goal:'GOL', pause:'Duraklat', resume:'Devam', paused:'Duraklatıldı',
    quit:'Çık', quitConfirm:'Maçtan çıkmak istediğine emin misin?',
    cancel:'İptal', yes:'Evet',
    playAgain:'Tekrar Oyna', mainMenu:'Ana Menü',
    win:'Kazandın!', lose:'Kaybettin!', draw:'Berabere!',
    teamLeft:'Kırmızı', teamRight:'Mavi',
    gameOver:'Maç Bitti', victory:'Zafer!', defeat:'Yenilgi!'
  },
  en: {
    title:'Soccer', startGame:'Start Game', gameMode:'Game Mode',
    vsAI:'vs Computer', vs2P:'2 Players', difficulty:'Difficulty',
    easy:'Easy', medium:'Medium', hard:'Hard',
    matchTime:'Match Time', min:'min',
    player1:'Player 1', player2:'Player 2', ai:'Computer',
    controls:'Controls', controlsP1:'W A S D', controlsP2:'↑ ← ↓ →',
    switchKey:'Switch Player', switchP1:'Q', switchP2:'/',
    shootKey:'Shoot', passKey:'Pass', shootP1:'Z', passP1:'X', shootP2:'M', passP2:'N',
    goal:'GOAL', pause:'Pause', resume:'Resume', paused:'Paused',
    quit:'Quit', quitConfirm:'Are you sure you want to quit the match?',
    cancel:'Cancel', yes:'Yes',
    playAgain:'Play Again', mainMenu:'Main Menu',
    win:'You Win!', lose:'You Lose!', draw:'Draw!',
    teamLeft:'Red', teamRight:'Blue',
    gameOver:'Game Over', victory:'Victory!', defeat:'Defeat!'
  },
  de: {
    title:'Fußball', startGame:'Spiel starten', gameMode:'Spielmodus',
    vsAI:'Gegen Computer', vs2P:'2 Spieler', difficulty:'Schwierigkeit',
    easy:'Leicht', medium:'Mittel', hard:'Schwer',
    matchTime:'Spielzeit', min:'Min',
    player1:'Spieler 1', player2:'Spieler 2', ai:'Computer',
    controls:'Steuerung', controlsP1:'W A S D', controlsP2:'↑ ← ↓ →',
    switchKey:'Spieler wechseln', switchP1:'Q', switchP2:'/',
    shootKey:'Schuss', passKey:'Pass', shootP1:'Z', passP1:'X', shootP2:'M', passP2:'N',
    goal:'TOR', pause:'Pause', resume:'Weiter', paused:'Pausiert',
    quit:'Beenden', quitConfirm:'Möchtest du das Spiel wirklich beenden?',
    cancel:'Abbrechen', yes:'Ja',
    playAgain:'Nochmal spielen', mainMenu:'Hauptmenü',
    win:'Du gewinnst!', lose:'Du verlierst!', draw:'Unentschieden!',
    teamLeft:'Rot', teamRight:'Blau',
    gameOver:'Spiel vorbei', victory:'Sieg!', defeat:'Niederlage!'
  },
  fr: {
    title:'Football', startGame:'Commencer', gameMode:'Mode de jeu',
    vsAI:'Contre l\'ordi', vs2P:'2 Joueurs', difficulty:'Difficulté',
    easy:'Facile', medium:'Moyen', hard:'Difficile',
    matchTime:'Durée du match', min:'min',
    player1:'Joueur 1', player2:'Joueur 2', ai:'Ordinateur',
    controls:'Contrôles', controlsP1:'W A S D', controlsP2:'↑ ← ↓ →',
    switchKey:'Changer joueur', switchP1:'Q', switchP2:'/',
    shootKey:'Tir', passKey:'Passe', shootP1:'Z', passP1:'X', shootP2:'M', passP2:'N',
    goal:'BUT', pause:'Pause', resume:'Reprendre', paused:'En pause',
    quit:'Quitter', quitConfirm:'Voulez-vous vraiment quitter le match ?',
    cancel:'Annuler', yes:'Oui',
    playAgain:'Rejouer', mainMenu:'Menu principal',
    win:'Vous gagnez !', lose:'Vous perdez !', draw:'Match nul !',
    teamLeft:'Rouge', teamRight:'Bleu',
    gameOver:'Fin du match', victory:'Victoire !', defeat:'Défaite !'
  },
  es: {
    title:'Fútbol', startGame:'Iniciar juego', gameMode:'Modo de juego',
    vsAI:'Contra PC', vs2P:'2 Jugadores', difficulty:'Dificultad',
    easy:'Fácil', medium:'Medio', hard:'Difícil',
    matchTime:'Duración', min:'min',
    player1:'Jugador 1', player2:'Jugador 2', ai:'Computadora',
    controls:'Controles', controlsP1:'W A S D', controlsP2:'↑ ← ↓ →',
    switchKey:'Cambiar jugador', switchP1:'Q', switchP2:'/',
    shootKey:'Tiro', passKey:'Pase', shootP1:'Z', passP1:'X', shootP2:'M', passP2:'N',
    goal:'GOL', pause:'Pausa', resume:'Reanudar', paused:'En pausa',
    quit:'Salir', quitConfirm:'¿Seguro que quieres salir del partido?',
    cancel:'Cancelar', yes:'Sí',
    playAgain:'Jugar de nuevo', mainMenu:'Menú principal',
    win:'¡Ganaste!', lose:'¡Perdiste!', draw:'¡Empate!',
    teamLeft:'Rojo', teamRight:'Azul',
    gameOver:'Fin del partido', victory:'¡Victoria!', defeat:'¡Derrota!'
  },
  ru: {
    title:'Футбол', startGame:'Начать игру', gameMode:'Режим игры',
    vsAI:'Против ПК', vs2P:'2 Игрока', difficulty:'Сложность',
    easy:'Лёгкий', medium:'Средний', hard:'Сложный',
    matchTime:'Время матча', min:'мин',
    player1:'Игрок 1', player2:'Игрок 2', ai:'Компьютер',
    controls:'Управление', controlsP1:'W A S D', controlsP2:'↑ ← ↓ →',
    switchKey:'Сменить игрока', switchP1:'Q', switchP2:'/',
    shootKey:'Удар', passKey:'Пас', shootP1:'Z', passP1:'X', shootP2:'M', passP2:'N',
    goal:'ГОЛ', pause:'Пауза', resume:'Продолжить', paused:'Пауза',
    quit:'Выход', quitConfirm:'Вы уверены, что хотите выйти?',
    cancel:'Отмена', yes:'Да',
    playAgain:'Играть снова', mainMenu:'Главное меню',
    win:'Вы победили!', lose:'Вы проиграли!', draw:'Ничья!',
    teamLeft:'Красные', teamRight:'Синие',
    gameOver:'Конец игры', victory:'Победа!', defeat:'Поражение!'
  },
  zh: {
    title:'足球', startGame:'开始游戏', gameMode:'游戏模式',
    vsAI:'对战电脑', vs2P:'双人模式', difficulty:'难度',
    easy:'简单', medium:'中等', hard:'困难',
    matchTime:'比赛时间', min:'分钟',
    player1:'玩家1', player2:'玩家2', ai:'电脑',
    controls:'控制', controlsP1:'W A S D', controlsP2:'↑ ← ↓ →',
    switchKey:'切换球员', switchP1:'Q', switchP2:'/',
    shootKey:'射门', passKey:'传球', shootP1:'Z', passP1:'X', shootP2:'M', passP2:'N',
    goal:'进球', pause:'暂停', resume:'继续', paused:'已暂停',
    quit:'退出', quitConfirm:'确定要退出比赛吗？',
    cancel:'取消', yes:'是',
    playAgain:'再来一局', mainMenu:'主菜单',
    win:'你赢了！', lose:'你输了！', draw:'平局！',
    teamLeft:'红队', teamRight:'蓝队',
    gameOver:'比赛结束', victory:'胜利！', defeat:'失败！'
  },
  ja: {
    title:'サッカー', startGame:'ゲーム開始', gameMode:'ゲームモード',
    vsAI:'CPU対戦', vs2P:'2人対戦', difficulty:'難易度',
    easy:'やさしい', medium:'ふつう', hard:'むずかしい',
    matchTime:'試合時間', min:'分',
    player1:'プレイヤー1', player2:'プレイヤー2', ai:'コンピュータ',
    controls:'操作', controlsP1:'W A S D', controlsP2:'↑ ← ↓ →',
    switchKey:'選手切替', switchP1:'Q', switchP2:'/',
    shootKey:'シュート', passKey:'パス', shootP1:'Z', passP1:'X', shootP2:'M', passP2:'N',
    goal:'ゴール', pause:'一時停止', resume:'再開', paused:'一時停止中',
    quit:'終了', quitConfirm:'試合を終了しますか？',
    cancel:'キャンセル', yes:'はい',
    playAgain:'もう一度', mainMenu:'メインメニュー',
    win:'勝利！', lose:'敗北！', draw:'引き分け！',
    teamLeft:'赤', teamRight:'青',
    gameOver:'試合終了', victory:'勝利！', defeat:'敗北！'
  },
  it: {
    title:'Calcio', startGame:'Inizia partita', gameMode:'Modalità',
    vsAI:'Contro PC', vs2P:'2 Giocatori', difficulty:'Difficoltà',
    easy:'Facile', medium:'Medio', hard:'Difficile',
    matchTime:'Durata partita', min:'min',
    player1:'Giocatore 1', player2:'Giocatore 2', ai:'Computer',
    controls:'Controlli', controlsP1:'W A S D', controlsP2:'↑ ← ↓ →',
    switchKey:'Cambia giocatore', switchP1:'Q', switchP2:'/',
    shootKey:'Tiro', passKey:'Passaggio', shootP1:'Z', passP1:'X', shootP2:'M', passP2:'N',
    goal:'GOL', pause:'Pausa', resume:'Riprendi', paused:'In pausa',
    quit:'Esci', quitConfirm:'Sei sicuro di voler uscire?',
    cancel:'Annulla', yes:'Sì',
    playAgain:'Rigioca', mainMenu:'Menu principale',
    win:'Hai vinto!', lose:'Hai perso!', draw:'Pareggio!',
    teamLeft:'Rosso', teamRight:'Blu',
    gameOver:'Fine partita', victory:'Vittoria!', defeat:'Sconfitta!'
  },
  ar: {
    title:'كرة القدم', startGame:'ابدأ اللعبة', gameMode:'وضع اللعب',
    vsAI:'ضد الكمبيوتر', vs2P:'لاعبان', difficulty:'الصعوبة',
    easy:'سهل', medium:'متوسط', hard:'صعب',
    matchTime:'وقت المباراة', min:'د',
    player1:'اللاعب 1', player2:'اللاعب 2', ai:'الكمبيوتر',
    controls:'التحكم', controlsP1:'W A S D', controlsP2:'↑ ← ↓ →',
    switchKey:'تبديل اللاعب', switchP1:'Q', switchP2:'/',
    shootKey:'تسديد', passKey:'تمرير', shootP1:'Z', passP1:'X', shootP2:'M', passP2:'N',
    goal:'هدف', pause:'إيقاف', resume:'استئناف', paused:'متوقف',
    quit:'خروج', quitConfirm:'هل تريد الخروج من المباراة؟',
    cancel:'إلغاء', yes:'نعم',
    playAgain:'إعادة اللعب', mainMenu:'القائمة الرئيسية',
    win:'فزت!', lose:'خسرت!', draw:'تعادل!',
    teamLeft:'أحمر', teamRight:'أزرق',
    gameOver:'انتهت المباراة', victory:'فوز!', defeat:'هزيمة!'
  },
  ko: {
    title:'축구', startGame:'게임 시작', gameMode:'게임 모드',
    vsAI:'컴퓨터 대전', vs2P:'2인 대전', difficulty:'난이도',
    easy:'쉬움', medium:'보통', hard:'어려움',
    matchTime:'경기 시간', min:'분',
    player1:'플레이어 1', player2:'플레이어 2', ai:'컴퓨터',
    controls:'조작', controlsP1:'W A S D', controlsP2:'↑ ← ↓ →',
    switchKey:'선수 교체', switchP1:'Q', switchP2:'/',
    shootKey:'슈팅', passKey:'패스', shootP1:'Z', passP1:'X', shootP2:'M', passP2:'N',
    goal:'골', pause:'일시정지', resume:'계속', paused:'일시정지',
    quit:'나가기', quitConfirm:'경기를 종료하시겠습니까?',
    cancel:'취소', yes:'예',
    playAgain:'다시 하기', mainMenu:'메인 메뉴',
    win:'승리!', lose:'패배!', draw:'무승부!',
    teamLeft:'레드', teamRight:'블루',
    gameOver:'경기 종료', victory:'승리!', defeat:'패배!'
  },
  hi: {
    title:'फ़ुटबॉल', startGame:'खेल शुरू करें', gameMode:'गेम मोड',
    vsAI:'कंप्यूटर के खिलाफ', vs2P:'2 खिलाड़ी', difficulty:'कठिनाई',
    easy:'आसान', medium:'मध्यम', hard:'कठिन',
    matchTime:'मैच का समय', min:'मिनट',
    player1:'खिलाड़ी 1', player2:'खिलाड़ी 2', ai:'कंप्यूटर',
    controls:'नियंत्रण', controlsP1:'W A S D', controlsP2:'↑ ← ↓ →',
    switchKey:'खिलाड़ी बदलें', switchP1:'Q', switchP2:'/',
    shootKey:'शॉट', passKey:'पास', shootP1:'Z', passP1:'X', shootP2:'M', passP2:'N',
    goal:'गोल', pause:'रोकें', resume:'जारी रखें', paused:'रुका हुआ',
    quit:'बाहर', quitConfirm:'क्या आप मैच छोड़ना चाहते हैं?',
    cancel:'रद्द', yes:'हाँ',
    playAgain:'फिर से खेलें', mainMenu:'मुख्य मेनू',
    win:'आप जीते!', lose:'आप हारे!', draw:'ड्रॉ!',
    teamLeft:'लाल', teamRight:'नीला',
    gameOver:'खेल समाप्त', victory:'जीत!', defeat:'हार!'
  },
  pt: {
    title:'Futebol', startGame:'Iniciar jogo', gameMode:'Modo de jogo',
    vsAI:'Contra PC', vs2P:'2 Jogadores', difficulty:'Dificuldade',
    easy:'Fácil', medium:'Médio', hard:'Difícil',
    matchTime:'Tempo de jogo', min:'min',
    player1:'Jogador 1', player2:'Jogador 2', ai:'Computador',
    controls:'Controles', controlsP1:'W A S D', controlsP2:'↑ ← ↓ →',
    switchKey:'Trocar jogador', switchP1:'Q', switchP2:'/',
    shootKey:'Chute', passKey:'Passe', shootP1:'Z', passP1:'X', shootP2:'M', passP2:'N',
    goal:'GOL', pause:'Pausar', resume:'Continuar', paused:'Pausado',
    quit:'Sair', quitConfirm:'Tem certeza que deseja sair da partida?',
    cancel:'Cancelar', yes:'Sim',
    playAgain:'Jogar novamente', mainMenu:'Menu principal',
    win:'Você venceu!', lose:'Você perdeu!', draw:'Empate!',
    teamLeft:'Vermelho', teamRight:'Azul',
    gameOver:'Fim de jogo', victory:'Vitória!', defeat:'Derrota!'
  }
};

function getLocale() {
  try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; }
}

return {
  setup() {
    const locale = ref(getLocale());
    function t(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

    /* ── state ── */
    const screen = ref('menu');           // menu | game | gameover
    const gameMode = ref('ai');           // ai | 2p
    const difficulty = ref('medium');      // easy | medium | hard
    const matchDuration = ref(120);       // seconds
    const scoreLeft = ref(0);
    const scoreRight = ref(0);
    const timeLeft = ref(120);
    const paused = ref(false);
    const goalScored = ref(false);
    const countdown = ref(0);
    const flashLeft = ref(false);
    const flashRight = ref(false);
    const showQuitDialog = ref(false);

    const canvasRef = ref(null);
    const canvasWrap = ref(null);

    /* ── computed ── */
    const timerDisplay = computed(() => {
      const m = Math.floor(timeLeft.value / 60);
      const s = timeLeft.value % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    });
    const teamLeftName = computed(() =>
      gameMode.value === 'ai' ? t('player1') : t('player1')
    );
    const teamRightName = computed(() =>
      gameMode.value === 'ai' ? t('ai') : t('player2')
    );
    const gameOverIcon = computed(() => {
      if (scoreLeft.value > scoreRight.value) return '🏆';
      if (scoreLeft.value < scoreRight.value) return gameMode.value === 'ai' ? '😞' : '🏆';
      return '🤝';
    });
    const gameOverTitle = computed(() => {
      if (scoreLeft.value > scoreRight.value) {
        return gameMode.value === 'ai' ? t('win') : t('player1') + ' ' + t('victory');
      }
      if (scoreLeft.value < scoreRight.value) {
        return gameMode.value === 'ai' ? t('lose') : t('player2') + ' ' + t('victory');
      }
      return t('draw');
    });

    /* ═══════════════════════════════════════════════════════════
       GAME ENGINE
       ═══════════════════════════════════════════════════════════ */

    // Field dimensions (virtual)
    const FW = 900, FH = 500;
    const GOAL_H = 130;
    const GOAL_DEPTH = 30;
    const BALL_R = 10;
    const PLAYER_R = 18;
    const PLAYER_SPEED_BASE = 2.4;
    const BALL_FRICTION = 0.985;
    const PLAYER_FRICTION = 0.78;
    const KICK_POWER = 9;
    const KICK_RANGE = 30;
    const GOAL_POST_R = 6;
    const DRIBBLE_DIST = PLAYER_R + BALL_R + 3; // ball follows player at this distance
    const DRIBBLE_GRAB_DIST = PLAYER_R + BALL_R + 6; // pickup range

    /* Selected player index (for manual switching) */
    let selectedIdxA = 1; // team A controlled player index (0=GK, 1-3=field)
    let selectedIdxB = 1; // team B controlled player index

    /* Ball possession: which player is dribbling (null = free ball) */
    let ballOwner = null;        // reference to player object
    let ballOwnerTeam = null;    // 'a' or 'b'
    let lastShootDir = { x: 0, y: 0 }; // direction of last shot (for auto-switch)

    let ctx = null;
    let W = FW, H = FH, scaleX = 1, scaleY = 1;
    let animFrame = null;
    let timerInterval = null;

    /* Ball */
    let ball = { x: FW/2, y: FH/2, vx: 0, vy: 0 };

    /* Players - each team has 4 players (1 GK + 3 field) */
    let teamA = []; // left (red)
    let teamB = []; // right (blue)

    /* Input */
    const keysDown = {};

    /* AI difficulty params */
    const AI_PARAMS = {
      easy:   { speed: 1.8, reaction: 0.5, shootPower: 5, accuracy: 0.6, gkSpeed: 2.0 },
      medium: { speed: 2.6, reaction: 0.7, shootPower: 7, accuracy: 0.8, gkSpeed: 2.8 },
      hard:   { speed: 3.4, reaction: 0.9, shootPower: 9, accuracy: 0.95, gkSpeed: 3.5 }
    };

    function createPlayers() {
      teamA = [
        { x: 50,       y: FH/2,       vx: 0, vy: 0, isGK: true  },
        { x: FW * 0.25, y: FH * 0.2,  vx: 0, vy: 0, isGK: false },
        { x: FW * 0.25, y: FH * 0.5,  vx: 0, vy: 0, isGK: false },
        { x: FW * 0.25, y: FH * 0.8,  vx: 0, vy: 0, isGK: false }
      ];
      teamB = [
        { x: FW - 50,   y: FH/2,      vx: 0, vy: 0, isGK: true  },
        { x: FW * 0.75, y: FH * 0.2,  vx: 0, vy: 0, isGK: false },
        { x: FW * 0.75, y: FH * 0.5,  vx: 0, vy: 0, isGK: false },
        { x: FW * 0.75, y: FH * 0.8,  vx: 0, vy: 0, isGK: false }
      ];
    }

    function resetPositions() {
      teamA[0].x = 50;       teamA[0].y = FH/2;
      teamA[1].x = FW*0.25;  teamA[1].y = FH*0.2;
      teamA[2].x = FW*0.25;  teamA[2].y = FH*0.5;
      teamA[3].x = FW*0.25;  teamA[3].y = FH*0.8;
      teamB[0].x = FW-50;    teamB[0].y = FH/2;
      teamB[1].x = FW*0.75;  teamB[1].y = FH*0.2;
      teamB[2].x = FW*0.75;  teamB[2].y = FH*0.5;
      teamB[3].x = FW*0.75;  teamB[3].y = FH*0.8;
      for (const p of [...teamA, ...teamB]) { p.vx = 0; p.vy = 0; }
      ball.x = FW/2; ball.y = FH/2; ball.vx = 0; ball.vy = 0;
      ballOwner = null;
      ballOwnerTeam = null;
    }

    /* ── Player input ── */
    function handlePlayerInput() {
      // Player 1 (Team A)
      const controlledA = getControlledPlayer(teamA, selectedIdxA);
      let ax = 0, ay = 0;
      if (keysDown['w'] || keysDown['W']) ay = -1;
      if (keysDown['s'] || keysDown['S']) ay = 1;
      if (keysDown['a'] || keysDown['A']) ax = -1;
      if (keysDown['d'] || keysDown['D']) ax = 1;
      if (ax || ay) {
        const len = Math.sqrt(ax*ax + ay*ay);
        controlledA.vx += (ax/len) * PLAYER_SPEED_BASE * 0.35;
        controlledA.vy += (ay/len) * PLAYER_SPEED_BASE * 0.35;
      }

      // Player 2 (Team B) or AI
      if (gameMode.value === '2p') {
        const controlledB = getControlledPlayer(teamB, selectedIdxB);
        let bx = 0, by = 0;
        if (keysDown['ArrowUp'])    by = -1;
        if (keysDown['ArrowDown'])  by = 1;
        if (keysDown['ArrowLeft'])  bx = -1;
        if (keysDown['ArrowRight']) bx = 1;
        if (bx || by) {
          const len = Math.sqrt(bx*bx + by*by);
          controlledB.vx += (bx/len) * PLAYER_SPEED_BASE * 0.35;
          controlledB.vy += (by/len) * PLAYER_SPEED_BASE * 0.35;
        }
      }
    }

    function getControlledPlayer(team, selectedIdx) {
      // Return manually selected player
      if (selectedIdx >= 0 && selectedIdx < team.length) return team[selectedIdx];
      return team[1];
    }

    /* Switch to next field player (skip GK) */
    function switchPlayer(team, currentIdx) {
      let next = currentIdx + 1;
      // cycle through field players (indices 1,2,3)
      if (next >= team.length) next = 1;
      if (next < 1) next = 1;
      return next;
    }

    /* Auto-switch: pick closest field player to ball */
    function autoSelectNearest(team) {
      let bestIdx = 1, bestD = Infinity;
      for (let i = 1; i < team.length; i++) {
        const d = dist(team[i], ball);
        if (d < bestD) { bestD = d; bestIdx = i; }
      }
      return bestIdx;
    }

    /* ── Shoot / Pass ── */
    function shootBall(team, isTeamA, dirX, dirY, power) {
      // Release ball from dribbler with given direction and power
      const owner = ballOwner;
      if (!owner) return;
      if ((isTeamA && !teamA.includes(owner)) || (!isTeamA && !teamB.includes(owner))) return;
      const d = Math.sqrt(dirX*dirX + dirY*dirY);
      if (d === 0) return;
      const nx = dirX / d, ny = dirY / d;
      ballOwner = null;
      ballOwnerTeam = null;
      ball.x = owner.x + nx * (PLAYER_R + BALL_R + 4);
      ball.y = owner.y + ny * (PLAYER_R + BALL_R + 4);
      ball.vx = nx * power;
      ball.vy = ny * power;
      lastShootDir = { x: nx, y: ny };

      // Auto-switch to teammate in the path of the ball
      autoSwitchToPassReceiver(team, isTeamA, owner, nx, ny);
    }

    function autoSwitchToPassReceiver(team, isTeamA, shooter, nx, ny) {
      // Find teammate closest to the ball's trajectory line (excluding shooter & GK)
      let bestIdx = -1, bestScore = Infinity;
      for (let i = 1; i < team.length; i++) {
        if (team[i] === shooter) continue;
        const p = team[i];
        // Project player onto shot direction line
        const dx = p.x - shooter.x, dy = p.y - shooter.y;
        const along = dx * nx + dy * ny; // distance along shot direction
        if (along < 40) continue; // must be ahead in shot direction
        const perp = Math.abs(dx * (-ny) + dy * nx); // perpendicular distance
        if (perp > 80) continue; // too far off-line
        const score = perp + Math.abs(along) * 0.2;
        if (score < bestScore) { bestScore = score; bestIdx = i; }
      }
      if (bestIdx > 0) {
        if (isTeamA) selectedIdxA = bestIdx;
        else selectedIdxB = bestIdx;
      }
    }

    /* Player shoot action triggered by key */
    function playerShoot(isTeamA) {
      const team = isTeamA ? teamA : teamB;
      const idx = isTeamA ? selectedIdxA : selectedIdxB;
      const p = getControlledPlayer(team, idx);
      if (ballOwner !== p) return; // must have the ball

      // Shoot toward opponent's goal
      const goalX = isTeamA ? FW : 0;
      const goalY = FH / 2;
      const dx = goalX - p.x, dy = goalY - p.y;
      shootBall(team, isTeamA, dx, dy, KICK_POWER);
    }

    /* Player pass action — toward nearest teammate */
    function playerPass(isTeamA) {
      const team = isTeamA ? teamA : teamB;
      const idx = isTeamA ? selectedIdxA : selectedIdxB;
      const p = getControlledPlayer(team, idx);
      if (ballOwner !== p) return;

      // Find nearest teammate (not GK, not self)
      let bestT = null, bestD = Infinity;
      for (let i = 1; i < team.length; i++) {
        if (team[i] === p) continue;
        const d = dist(team[i], p);
        if (d < bestD) { bestD = d; bestT = team[i]; }
      }
      if (!bestT) return;
      const dx = bestT.x - p.x, dy = bestT.y - p.y;
      shootBall(team, isTeamA, dx, dy, KICK_POWER * 0.7);
    }

    /* ── AI logic ── */
    function updateAI() {
      if (gameMode.value !== 'ai') return;
      const params = AI_PARAMS[difficulty.value] || AI_PARAMS.medium;

      // AI GK
      const gk = teamB[0];
      const goalCenterY = FH / 2;
      const targetY = ball.x > FW * 0.5 ? ball.y : goalCenterY;
      const dyGK = targetY - gk.y;
      if (Math.abs(dyGK) > 3) {
        gk.vy += (dyGK > 0 ? 1 : -1) * params.gkSpeed * 0.3;
      }
      // Keep GK near goal line
      const gkTargetX = FW - 40;
      gk.vx += (gkTargetX - gk.x) * 0.05;

      // AI field players
      for (let i = 1; i < teamB.length; i++) {
        const p = teamB[i];
        if (Math.random() > params.reaction) continue;

        const toBall = { x: ball.x - p.x, y: ball.y - p.y };
        const dBall = Math.sqrt(toBall.x*toBall.x + toBall.y*toBall.y);

        if (ballOwner === p) {
          // AI has the ball — decide: shoot or advance
          const distToGoal = Math.abs(p.x - 0);
          if (distToGoal < FW * 0.35) {
            // Close to goal — shoot
            const goalY = FH/2 + (Math.random() - 0.5) * GOAL_H * params.accuracy;
            shootBall(teamB, false, 0 - p.x, goalY - p.y, params.shootPower);
          } else {
            // Advance toward goal
            p.vx += (-1) * params.speed * 0.2;
            p.vy += (Math.random() - 0.5) * params.speed * 0.15;
          }
        } else if (dBall < DRIBBLE_GRAB_DIST * 1.5 && ballOwner === null) {
          // Near free ball — move toward it to grab
          if (dBall > 0) {
            p.vx += (toBall.x / dBall) * params.speed * 0.4;
            p.vy += (toBall.y / dBall) * params.speed * 0.4;
          }
        } else if (ballOwnerTeam === 'a' || ballOwner === null) {
          // Ball is with opponent or free — chase it
          if (dBall > 0) {
            p.vx += (toBall.x / dBall) * params.speed * 0.3;
            p.vy += (toBall.y / dBall) * params.speed * 0.3;
          }
        } else {
          // Own team has ball — position for pass
          const homeX = FW * 0.35 + i * 60;
          const homeY = FH * (0.2 + i * 0.25);
          p.vx += (homeX - p.x) * 0.02;
          p.vy += (homeY - p.y) * 0.02;
        }

        // Defensive positioning when ball is on left side
        if (ball.x < FW * 0.4 && ballOwnerTeam !== 'b') {
          const homeX = FW * 0.65 + i * 30;
          const homeY = FH * (0.2 + i * 0.25);
          p.vx += (homeX - p.x) * 0.02;
          p.vy += (homeY - p.y) * 0.02;
        }
      }
    }

    /* ── AI for team A (GK only — always auto) ── */
    function updateGK_A() {
      const gk = teamA[0];
      const goalCenterY = FH / 2;
      const targetY = ball.x < FW * 0.5 ? ball.y : goalCenterY;
      const dy = targetY - gk.y;
      if (Math.abs(dy) > 3) {
        gk.vy += (dy > 0 ? 1 : -1) * 2.5 * 0.3;
      }
      const gkTargetX = 40;
      gk.vx += (gkTargetX - gk.x) * 0.05;
      // GK auto-clear
      if (ballOwner === gk) {
        shootBall(teamA, true, FW - gk.x, (Math.random() - 0.5) * FH * 0.6, KICK_POWER * 0.8);
      }
    }

    /* ── AI for team B GK in 2P mode ── */
    function updateGK_B_2P() {
      const gk = teamB[0];
      const goalCenterY = FH / 2;
      const targetY = ball.x > FW * 0.5 ? ball.y : goalCenterY;
      const dy = targetY - gk.y;
      if (Math.abs(dy) > 3) {
        gk.vy += (dy > 0 ? 1 : -1) * 2.5 * 0.3;
      }
      const gkTargetX = FW - 40;
      gk.vx += (gkTargetX - gk.x) * 0.05;
      // GK auto-clear
      if (ballOwner === gk) {
        shootBall(teamB, false, -gk.x, (Math.random() - 0.5) * FH * 0.6, KICK_POWER * 0.8);
      }
    }

    /* ── Physics ── */
    function dist(a, b) {
      return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
    }

    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

    function updatePhysics() {
      // Ball-owner distance check — lose ball if too far
      if (ballOwner) {
        const dOwner = dist(ballOwner, ball);
        if (dOwner > DRIBBLE_DIST * 2.5) {
          ballOwner = null;
          ballOwnerTeam = null;
        }
      }

      // Ball movement (only when not being dribbled)
      if (!ballOwner) {
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vx *= BALL_FRICTION;
        ball.vy *= BALL_FRICTION;
        if (Math.abs(ball.vx) < 0.01) ball.vx = 0;
        if (Math.abs(ball.vy) < 0.01) ball.vy = 0;
      }

      // Goal areas
      const goalTop = (FH - GOAL_H) / 2;
      const goalBot = (FH + GOAL_H) / 2;

      // Check goals
      if (ball.x - BALL_R <= 0 && ball.y > goalTop && ball.y < goalBot) {
        onGoal('right');
        return;
      }
      if (ball.x + BALL_R >= FW && ball.y > goalTop && ball.y < goalBot) {
        onGoal('left');
        return;
      }

      // Ball wall bouncing
      // Top & bottom walls
      if (ball.y - BALL_R < 0)   { ball.y = BALL_R; ball.vy = Math.abs(ball.vy) * 0.8; }
      if (ball.y + BALL_R > FH)  { ball.y = FH - BALL_R; ball.vy = -Math.abs(ball.vy) * 0.8; }

      // Left wall (except goal area)
      if (ball.x - BALL_R < 0) {
        if (ball.y < goalTop || ball.y > goalBot) {
          ball.x = BALL_R; ball.vx = Math.abs(ball.vx) * 0.8;
        }
      }
      // Right wall (except goal area)
      if (ball.x + BALL_R > FW) {
        if (ball.y < goalTop || ball.y > goalBot) {
          ball.x = FW - BALL_R; ball.vx = -Math.abs(ball.vx) * 0.8;
        }
      }

      // Goal post collisions
      const posts = [
        { x: 0, y: goalTop }, { x: 0, y: goalBot },
        { x: FW, y: goalTop }, { x: FW, y: goalBot }
      ];
      for (const post of posts) {
        const d = dist(ball, post);
        if (d < BALL_R + GOAL_POST_R) {
          const nx = (ball.x - post.x) / d;
          const ny = (ball.y - post.y) / d;
          ball.x = post.x + nx * (BALL_R + GOAL_POST_R);
          ball.y = post.y + ny * (BALL_R + GOAL_POST_R);
          const dot = ball.vx * nx + ball.vy * ny;
          ball.vx -= 2 * dot * nx * 0.7;
          ball.vy -= 2 * dot * ny * 0.7;
        }
      }

      // Players movement & collision
      const allPlayers = [...teamA, ...teamB];
      for (const p of allPlayers) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= PLAYER_FRICTION;
        p.vy *= PLAYER_FRICTION;

        // Keep in bounds
        p.x = clamp(p.x, PLAYER_R, FW - PLAYER_R);
        p.y = clamp(p.y, PLAYER_R, FH - PLAYER_R);

        // GK constraints
        if (p.isGK) {
          if (teamA.includes(p)) {
            p.x = clamp(p.x, PLAYER_R, FW * 0.2);
          } else {
            p.x = clamp(p.x, FW * 0.8, FW - PLAYER_R);
          }
          const gTop = goalTop - 40;
          const gBot = goalBot + 40;
          p.y = clamp(p.y, gTop, gBot);
        }

        // Player-ball collision — dribbling system
        const dBall = dist(p, ball);
        const isControlledByHuman = (teamA.includes(p) && p === getControlledPlayer(teamA, selectedIdxA)) ||
                                    (teamB.includes(p) && gameMode.value === '2p' && p === getControlledPlayer(teamB, selectedIdxB));
        const isOnTeamA = teamA.includes(p);

        // If this player is already the ball owner, ball follows
        if (ballOwner === p) {
          // Ball follows player (dribble)
          const angle = Math.atan2(p.vy, p.vx);
          const speed = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
          if (speed > 0.2) {
            ball.x = p.x + Math.cos(angle) * DRIBBLE_DIST;
            ball.y = p.y + Math.sin(angle) * DRIBBLE_DIST;
          } else {
            // Standing still — keep ball in front (facing right for A, left for B)
            const faceDir = isOnTeamA ? 1 : -1;
            ball.x = p.x + faceDir * DRIBBLE_DIST;
            ball.y = p.y;
          }
          ball.vx = p.vx;
          ball.vy = p.vy;
        }
        // Try to grab ball if close enough and no one owns it, or steal from opponent
        else if (dBall < DRIBBLE_GRAB_DIST) {
          if (ballOwner === null) {
            // Free ball — grab it
            ballOwner = p;
            ballOwnerTeam = isOnTeamA ? 'a' : 'b';
          } else {
            // Ball owned by someone else
            const ownerIsTeamA = teamA.includes(ballOwner);
            const thisIsTeamA = isOnTeamA;
            if (ownerIsTeamA !== thisIsTeamA) {
              // Opponent — tackle/steal (probability-based)
              const stealChance = 0.04; // per frame
              if (Math.random() < stealChance) {
                ballOwner = p;
                ballOwnerTeam = isOnTeamA ? 'a' : 'b';
              }
            }
          }
          // Push ball away from overlap regardless
          if (ballOwner !== p && dBall < PLAYER_R + BALL_R) {
            const nx = (ball.x - p.x) / dBall;
            const ny = (ball.y - p.y) / dBall;
            ball.x = p.x + nx * (PLAYER_R + BALL_R + 1);
            ball.y = p.y + ny * (PLAYER_R + BALL_R + 1);
          }
        }
      }

      // Player-player collision
      for (let i = 0; i < allPlayers.length; i++) {
        for (let j = i + 1; j < allPlayers.length; j++) {
          const a = allPlayers[i], b = allPlayers[j];
          const d = dist(a, b);
          if (d < PLAYER_R * 2 && d > 0) {
            const nx = (b.x - a.x) / d;
            const ny = (b.y - a.y) / d;
            const overlap = PLAYER_R * 2 - d;
            a.x -= nx * overlap * 0.5;
            a.y -= ny * overlap * 0.5;
            b.x += nx * overlap * 0.5;
            b.y += ny * overlap * 0.5;
            // Bounce
            const relV = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
            a.vx -= relV * nx * 0.5;
            a.vy -= relV * ny * 0.5;
            b.vx += relV * nx * 0.5;
            b.vy += relV * ny * 0.5;
          }
        }
      }

      // Speed cap
      const maxBallSpeed = 10;
      const bs = Math.sqrt(ball.vx*ball.vx + ball.vy*ball.vy);
      if (bs > maxBallSpeed) {
        ball.vx = (ball.vx/bs) * maxBallSpeed;
        ball.vy = (ball.vy/bs) * maxBallSpeed;
      }
      for (const p of allPlayers) {
        const ps = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
        const maxPS = p.isGK ? 3 : 3.5;
        if (ps > maxPS) {
          p.vx = (p.vx/ps) * maxPS;
          p.vy = (p.vy/ps) * maxPS;
        }
      }

      // Stop near-zero velocities
      for (const p of allPlayers) {
        if (Math.abs(p.vx) < 0.05) p.vx = 0;
        if (Math.abs(p.vy) < 0.05) p.vy = 0;
      }
    }

    /* ── Goal handling ── */
    function onGoal(side) {
      goalScored.value = true;
      paused.value = true;
      ballOwner = null;
      ballOwnerTeam = null;

      if (side === 'left') {
        scoreLeft.value++;
        flashLeft.value = true;
        setTimeout(() => flashLeft.value = false, 1200);
      } else {
        scoreRight.value++;
        flashRight.value = true;
        setTimeout(() => flashRight.value = false, 1200);
      }

      setTimeout(() => {
        goalScored.value = false;
        resetPositions();
        startCountdown();
      }, 1500);
    }

    function startCountdown() {
      countdown.value = 3;
      const ci = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          clearInterval(ci);
          paused.value = false;
        }
      }, 700);
    }

    /* ── Rendering ── */
    function render() {
      if (!ctx) return;
      const c = ctx;
      c.clearRect(0, 0, W, H);

      c.save();
      c.scale(scaleX, scaleY);

      // Field background
      c.fillStyle = '#2d8a4e';
      c.fillRect(0, 0, FW, FH);

      // Field markings
      c.strokeStyle = 'rgba(255,255,255,0.35)';
      c.lineWidth = 2;

      // Center line
      c.beginPath();
      c.moveTo(FW/2, 0);
      c.lineTo(FW/2, FH);
      c.stroke();

      // Center circle
      c.beginPath();
      c.arc(FW/2, FH/2, 60, 0, Math.PI*2);
      c.stroke();

      // Center dot
      c.fillStyle = 'rgba(255,255,255,0.5)';
      c.beginPath();
      c.arc(FW/2, FH/2, 4, 0, Math.PI*2);
      c.fill();

      // Outer border
      c.strokeStyle = 'rgba(255,255,255,0.6)';
      c.lineWidth = 3;
      c.strokeRect(2, 2, FW-4, FH-4);

      // Penalty areas (proper proportions: ~16.5m deep, ~40m wide on 105x68 field)
      const penW = 130, penH = 300;
      c.strokeStyle = 'rgba(255,255,255,0.35)';
      c.lineWidth = 2;
      c.strokeRect(0, (FH-penH)/2, penW, penH);
      c.strokeRect(FW-penW, (FH-penH)/2, penW, penH);

      // Goal areas (6-yard box: ~5.5m deep, ~18m wide)
      const gaW = 50, gaH = 170;
      c.strokeRect(0, (FH-gaH)/2, gaW, gaH);
      c.strokeRect(FW-gaW, (FH-gaH)/2, gaW, gaH);

      // Penalty spots
      const penSpotX = 95;
      c.fillStyle = 'rgba(255,255,255,0.4)';
      c.beginPath(); c.arc(penSpotX, FH/2, 3, 0, Math.PI*2); c.fill();
      c.beginPath(); c.arc(FW - penSpotX, FH/2, 3, 0, Math.PI*2); c.fill();

      // Penalty arcs (D-shape outside penalty area)
      const arcR = 60;
      const arcAngle = Math.acos((penW - penSpotX) / arcR);
      c.strokeStyle = 'rgba(255,255,255,0.35)';
      c.lineWidth = 2;
      c.beginPath();
      c.arc(penSpotX, FH/2, arcR, -arcAngle, arcAngle);
      c.stroke();
      c.beginPath();
      c.arc(FW - penSpotX, FH/2, arcR, Math.PI - arcAngle, Math.PI + arcAngle);
      c.stroke();

      // Corner arcs
      const cornerR = 12;
      c.beginPath(); c.arc(0, 0, cornerR, 0, Math.PI/2); c.stroke();
      c.beginPath(); c.arc(FW, 0, cornerR, Math.PI/2, Math.PI); c.stroke();
      c.beginPath(); c.arc(0, FH, cornerR, -Math.PI/2, 0); c.stroke();
      c.beginPath(); c.arc(FW, FH, cornerR, Math.PI, Math.PI*1.5); c.stroke();

      // Goals
      const goalTop = (FH - GOAL_H) / 2;
      const goalBot = (FH + GOAL_H) / 2;

      // Left goal net
      c.fillStyle = 'rgba(255,255,255,0.08)';
      c.fillRect(-GOAL_DEPTH, goalTop, GOAL_DEPTH, GOAL_H);
      c.strokeStyle = 'rgba(255,255,255,0.5)';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(0, goalTop);
      c.lineTo(-GOAL_DEPTH, goalTop);
      c.lineTo(-GOAL_DEPTH, goalBot);
      c.lineTo(0, goalBot);
      c.stroke();
      // net lines
      c.strokeStyle = 'rgba(255,255,255,0.1)';
      c.lineWidth = 1;
      for (let ny = goalTop; ny <= goalBot; ny += 12) {
        c.beginPath(); c.moveTo(-GOAL_DEPTH, ny); c.lineTo(0, ny); c.stroke();
      }
      for (let nx = -GOAL_DEPTH; nx <= 0; nx += 10) {
        c.beginPath(); c.moveTo(nx, goalTop); c.lineTo(nx, goalBot); c.stroke();
      }

      // Right goal net
      c.fillStyle = 'rgba(255,255,255,0.08)';
      c.fillRect(FW, goalTop, GOAL_DEPTH, GOAL_H);
      c.strokeStyle = 'rgba(255,255,255,0.5)';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(FW, goalTop);
      c.lineTo(FW+GOAL_DEPTH, goalTop);
      c.lineTo(FW+GOAL_DEPTH, goalBot);
      c.lineTo(FW, goalBot);
      c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.1)';
      c.lineWidth = 1;
      for (let ny = goalTop; ny <= goalBot; ny += 12) {
        c.beginPath(); c.moveTo(FW, ny); c.lineTo(FW+GOAL_DEPTH, ny); c.stroke();
      }
      for (let nx = FW; nx <= FW+GOAL_DEPTH; nx += 10) {
        c.beginPath(); c.moveTo(nx, goalTop); c.lineTo(nx, goalBot); c.stroke();
      }

      // Goal posts
      c.fillStyle = '#fff';
      for (const post of [
        { x: 0, y: goalTop }, { x: 0, y: goalBot },
        { x: FW, y: goalTop }, { x: FW, y: goalBot }
      ]) {
        c.beginPath();
        c.arc(post.x, post.y, GOAL_POST_R, 0, Math.PI*2);
        c.fill();
      }

      // Field stripes (subtle)
      c.fillStyle = 'rgba(255,255,255,0.02)';
      for (let sx = 0; sx < FW; sx += 60) {
        if ((sx / 60) % 2 === 0) c.fillRect(sx, 0, 60, FH);
      }

      // Draw players
      function drawPlayer(p, color, outlineColor) {
        // Shadow
        c.fillStyle = 'rgba(0,0,0,0.25)';
        c.beginPath();
        c.ellipse(p.x + 2, p.y + 3, PLAYER_R * 0.8, PLAYER_R * 0.4, 0, 0, Math.PI*2);
        c.fill();

        // Body
        c.fillStyle = color;
        c.strokeStyle = outlineColor;
        c.lineWidth = 2.5;
        c.beginPath();
        c.arc(p.x, p.y, PLAYER_R, 0, Math.PI*2);
        c.fill();
        c.stroke();

        // Direction indicator
        if (p.vx || p.vy) {
          const speed = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
          if (speed > 0.3) {
            c.fillStyle = outlineColor;
            const angle = Math.atan2(p.vy, p.vx);
            c.beginPath();
            c.moveTo(p.x + Math.cos(angle) * PLAYER_R, p.y + Math.sin(angle) * PLAYER_R);
            c.lineTo(p.x + Math.cos(angle-0.5) * (PLAYER_R-5), p.y + Math.sin(angle-0.5) * (PLAYER_R-5));
            c.lineTo(p.x + Math.cos(angle+0.5) * (PLAYER_R-5), p.y + Math.sin(angle+0.5) * (PLAYER_R-5));
            c.closePath();
            c.fill();
          }
        }

        // GK star
        if (p.isGK) {
          c.fillStyle = '#fff';
          c.font = 'bold 12px sans-serif';
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillText('GK', p.x, p.y);
        }
      }

      // Controlled player indicator (highlighted with arrow)
      const controlledA = getControlledPlayer(teamA, selectedIdxA);
      c.setLineDash([]);
      c.strokeStyle = '#ffeb3b';
      c.lineWidth = 2.5;
      c.beginPath();
      c.arc(controlledA.x, controlledA.y, PLAYER_R + 6, 0, Math.PI*2);
      c.stroke();
      // Arrow above
      c.fillStyle = '#ffeb3b';
      c.beginPath();
      c.moveTo(controlledA.x, controlledA.y - PLAYER_R - 12);
      c.lineTo(controlledA.x - 6, controlledA.y - PLAYER_R - 6);
      c.lineTo(controlledA.x + 6, controlledA.y - PLAYER_R - 6);
      c.closePath();
      c.fill();

      if (gameMode.value === '2p') {
        const controlledB = getControlledPlayer(teamB, selectedIdxB);
        c.strokeStyle = '#80d8ff';
        c.lineWidth = 2.5;
        c.beginPath();
        c.arc(controlledB.x, controlledB.y, PLAYER_R + 6, 0, Math.PI*2);
        c.stroke();
        c.fillStyle = '#80d8ff';
        c.beginPath();
        c.moveTo(controlledB.x, controlledB.y - PLAYER_R - 12);
        c.lineTo(controlledB.x - 6, controlledB.y - PLAYER_R - 6);
        c.lineTo(controlledB.x + 6, controlledB.y - PLAYER_R - 6);
        c.closePath();
        c.fill();
      }

      // Team A (red)
      for (const p of teamA) drawPlayer(p, '#e53935', '#b71c1c');
      // Team B (blue)
      for (const p of teamB) drawPlayer(p, '#1e88e5', '#0d47a1');

      // Ball shadow
      c.fillStyle = 'rgba(0,0,0,0.3)';
      c.beginPath();
      c.ellipse(ball.x + 2, ball.y + 3, BALL_R * 0.9, BALL_R * 0.5, 0, 0, Math.PI*2);
      c.fill();

      // Ball
      c.fillStyle = '#fff';
      c.strokeStyle = '#333';
      c.lineWidth = 1.5;
      c.beginPath();
      c.arc(ball.x, ball.y, BALL_R, 0, Math.PI*2);
      c.fill();
      c.stroke();

      // Ball pentagons pattern
      c.fillStyle = '#333';
      const angles5 = [0, 1.256, 2.513, 3.77, 5.026];
      for (const a of angles5) {
        c.beginPath();
        c.arc(ball.x + Math.cos(a) * BALL_R * 0.55, ball.y + Math.sin(a) * BALL_R * 0.55, 2.5, 0, Math.PI*2);
        c.fill();
      }

      // Ball possession ring
      if (ballOwner) {
        c.strokeStyle = ballOwnerTeam === 'a' ? 'rgba(229,57,53,0.7)' : 'rgba(30,136,229,0.7)';
        c.lineWidth = 2;
        c.beginPath();
        c.arc(ball.x, ball.y, BALL_R + 4, 0, Math.PI*2);
        c.stroke();
      }

      c.restore();
    }

    /* ── Game loop ── */
    function gameLoop() {
      if (screen.value !== 'game') return;
      if (!paused.value) {
        handlePlayerInput();
        updateGK_A();
        if (gameMode.value === 'ai') {
          updateAI();
        } else {
          updateGK_B_2P();
        }
        updatePhysics();
      }
      render();
      animFrame = requestAnimationFrame(gameLoop);
    }

    /* ── Timer ── */
    function startTimer() {
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        if (paused.value) return;
        timeLeft.value--;
        if (timeLeft.value <= 0) {
          timeLeft.value = 0;
          endGame();
        }
      }, 1000);
    }

    function endGame() {
      if (timerInterval) clearInterval(timerInterval);
      if (animFrame) cancelAnimationFrame(animFrame);
      screen.value = 'gameover';
    }

    /* ── Canvas sizing ── */
    function resizeCanvas() {
      if (!canvasRef.value || !canvasWrap.value) return;
      const wrap = canvasWrap.value;
      const cw = wrap.clientWidth;
      const ch = wrap.clientHeight;
      const totalW = FW + GOAL_DEPTH * 2;
      const totalH = FH;
      const ratio = Math.min(cw / totalW, ch / totalH);
      W = Math.floor(totalW * ratio);
      H = Math.floor(totalH * ratio);
      canvasRef.value.width = W;
      canvasRef.value.height = H;
      scaleX = W / totalW;
      scaleY = H / totalH;
      // Offset for goal depth
      ctx = canvasRef.value.getContext('2d');
      ctx.setTransform(1, 0, 0, 1, GOAL_DEPTH * scaleX, 0);
    }

    /* ── Start / Stop ── */
    function startGame() {
      scoreLeft.value = 0;
      scoreRight.value = 0;
      timeLeft.value = matchDuration.value;
      paused.value = true;
      goalScored.value = false;
      screen.value = 'game';

      createPlayers();
      resetPositions();
      selectedIdxA = 1;
      selectedIdxB = 1;

      nextTick(() => {
        resizeCanvas();
        render();
        startCountdown();
        startTimer();
        gameLoop();
      });
    }

    function togglePause() {
      paused.value = !paused.value;
    }

    function confirmQuit() {
      paused.value = true;
      showQuitDialog.value = true;
    }

    function quitToMenu() {
      showQuitDialog.value = false;
      if (timerInterval) clearInterval(timerInterval);
      if (animFrame) cancelAnimationFrame(animFrame);
      screen.value = 'menu';
    }

    /* ── Mouse/Touch for kick boost ── */
    let mouseDown = false;
    function onMouseDown(e) {
      mouseDown = true;
      kickBallToward(e);
    }
    function onMouseUp() { mouseDown = false; }
    function onMouseMove(e) {
      if (mouseDown) kickBallToward(e);
    }

    function kickBallToward(e) {
      if (paused.value || screen.value !== 'game') return;
      const rect = canvasRef.value.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / scaleX) - GOAL_DEPTH;
      const my = (e.clientY - rect.top) / scaleY;

      // Find controlled player in team A
      const p = getControlledPlayer(teamA, selectedIdxA);
      if (ballOwner === p) {
        // Player has ball — shoot toward click position
        const dx = mx - p.x;
        const dy = my - p.y;
        shootBall(teamA, true, dx, dy, KICK_POWER);
      }
    }

    function onTouchStart(e) {
      if (e.touches.length > 0) {
        const fakeEvent = { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
        kickBallToward(fakeEvent);
      }
    }
    function onTouchMove(e) {}
    function onTouchEnd() {}

    /* ── Keyboard ── */
    function onKeyDown(e) {
      keysDown[e.key] = true;
      if (e.key === 'Escape' && screen.value === 'game') {
        togglePause();
      }
      if (screen.value !== 'game' || paused.value) return;

      // Team A: Z = shoot, X = pass
      if (e.key === 'z' || e.key === 'Z') {
        playerShoot(true);
      }
      if (e.key === 'x' || e.key === 'X') {
        playerPass(true);
      }

      // Team B (2P mode): M = shoot, N = pass
      if (gameMode.value === '2p') {
        if (e.key === 'm' || e.key === 'M') {
          playerShoot(false);
        }
        if (e.key === 'n' || e.key === 'N') {
          playerPass(false);
        }
      }

      // Player switch: Q or E for team A
      if (e.key === 'q' || e.key === 'Q' || e.key === 'e' || e.key === 'E') {
        if (e.key === 'q' || e.key === 'Q') {
          selectedIdxA = autoSelectNearest(teamA);
        } else {
          selectedIdxA = switchPlayer(teamA, selectedIdxA);
        }
      }
      // Player switch: / or . for team B (2P mode)
      if ((e.key === '/' || e.key === '.') && gameMode.value === '2p') {
        if (e.key === '/') {
          selectedIdxB = autoSelectNearest(teamB);
        } else {
          selectedIdxB = switchPlayer(teamB, selectedIdxB);
        }
      }
      // Prevent arrow key scrolling
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    }
    function onKeyUp(e) {
      keysDown[e.key] = false;
    }

    /* ── Locale ── */
    function onLocaleChanged(e) {
      if (e.detail && e.detail.locale) locale.value = e.detail.locale;
      else locale.value = getLocale();
    }

    /* ── Lifecycle ── */
    let resizeObs = null;
    onMounted(() => {
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      window.addEventListener('locale-changed', onLocaleChanged);

      // Watch for resize
      nextTick(() => {
        if (canvasWrap.value) {
          resizeObs = new ResizeObserver(() => {
            if (screen.value === 'game') {
              resizeCanvas();
              render();
            }
          });
          resizeObs.observe(canvasWrap.value);
        }
      });
    });

    onUnmounted(() => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('locale-changed', onLocaleChanged);
      if (timerInterval) clearInterval(timerInterval);
      if (animFrame) cancelAnimationFrame(animFrame);
      if (resizeObs) resizeObs.disconnect();
    });

    return {
      locale, t, screen,
      gameMode, difficulty, matchDuration,
      scoreLeft, scoreRight, timeLeft, timerDisplay,
      paused, goalScored, countdown,
      flashLeft, flashRight,
      showQuitDialog,
      teamLeftName, teamRightName,
      gameOverIcon, gameOverTitle,
      canvasRef, canvasWrap,
      startGame, togglePause, confirmQuit, quitToMenu,
      onMouseDown, onMouseUp, onMouseMove,
      onTouchStart, onTouchMove, onTouchEnd
    };
  }
};
})(Vue);
