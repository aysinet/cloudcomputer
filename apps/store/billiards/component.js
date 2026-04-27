({
  setup() {
    const { ref, reactive, computed, onMounted, onUnmounted, nextTick } = Vue;

    /* ── i18n ── */
    const LANGS = {
      tr: { title:'Bilardo', newGame:'Yeni Oyun', player1:'Oyuncu', player2:'Bilgisayar', yourTurn:'Senin sıran', aiTurn:'Bilgisayar düşünüyor...', solids:'Düz', stripes:'Çizgili', foul:'Faul!', pocketed:'Cepe girdi', win:'Kazandın!', lose:'Kaybettin!', eightBall:'8-Top Bilardo', power:'Güç', aim:'Nişan al ve tıkla', restart:'Tekrar Oyna', score:'Skor', cueBall:'Beyaz top cebe girdi — faul', wrongBall:'Yanlış top — faul', gameOver:'Oyun Bitti', player:'Oyuncu', ai:'Bilgisayar' },
      en: { title:'Billiards', newGame:'New Game', player1:'Player', player2:'Computer', yourTurn:'Your turn', aiTurn:'Computer thinking...', solids:'Solids', stripes:'Stripes', foul:'Foul!', pocketed:'Pocketed', win:'You Win!', lose:'You Lose!', eightBall:'8-Ball Pool', power:'Power', aim:'Aim and click to shoot', restart:'Play Again', score:'Score', cueBall:'Cue ball pocketed — foul', wrongBall:'Wrong ball — foul', gameOver:'Game Over', player:'Player', ai:'Computer' },
      de: { title:'Billard', newGame:'Neues Spiel', player1:'Spieler', player2:'Computer', yourTurn:'Du bist dran', aiTurn:'Computer denkt...', solids:'Volle', stripes:'Halbe', foul:'Foul!', pocketed:'Eingelocht', win:'Du gewinnst!', lose:'Du verlierst!', eightBall:'8-Ball Billard', power:'Stärke', aim:'Zielen und klicken', restart:'Nochmal spielen', score:'Punkte', cueBall:'Weiße Kugel eingelocht — Foul', wrongBall:'Falsche Kugel — Foul', gameOver:'Spiel vorbei', player:'Spieler', ai:'Computer' },
      fr: { title:'Billard', newGame:'Nouvelle partie', player1:'Joueur', player2:'Ordinateur', yourTurn:'Votre tour', aiTurn:'L\'ordinateur réfléchit...', solids:'Pleines', stripes:'Rayées', foul:'Faute!', pocketed:'Empochée', win:'Vous gagnez!', lose:'Vous perdez!', eightBall:'Billard 8 boules', power:'Puissance', aim:'Visez et cliquez', restart:'Rejouer', score:'Score', cueBall:'Blanche empochée — faute', wrongBall:'Mauvaise boule — faute', gameOver:'Fin de partie', player:'Joueur', ai:'Ordinateur' },
      es: { title:'Billar', newGame:'Nueva partida', player1:'Jugador', player2:'Computadora', yourTurn:'Tu turno', aiTurn:'Computadora pensando...', solids:'Lisas', stripes:'Rayadas', foul:'Falta!', pocketed:'Embocada', win:'¡Ganaste!', lose:'¡Perdiste!', eightBall:'Billar 8 bolas', power:'Potencia', aim:'Apunta y haz clic', restart:'Jugar de nuevo', score:'Puntuación', cueBall:'Bola blanca embocada — falta', wrongBall:'Bola equivocada — falta', gameOver:'Fin del juego', player:'Jugador', ai:'Computadora' },
      ru: { title:'Бильярд', newGame:'Новая игра', player1:'Игрок', player2:'Компьютер', yourTurn:'Ваш ход', aiTurn:'Компьютер думает...', solids:'Цельные', stripes:'Полосатые', foul:'Фол!', pocketed:'В лузу', win:'Вы победили!', lose:'Вы проиграли!', eightBall:'Бильярд 8 шаров', power:'Сила', aim:'Прицельтесь и нажмите', restart:'Играть снова', score:'Счёт', cueBall:'Биток в лузе — фол', wrongBall:'Неверный шар — фол', gameOver:'Игра окончена', player:'Игрок', ai:'Компьютер' },
      zh: { title:'台球', newGame:'新游戏', player1:'玩家', player2:'电脑', yourTurn:'你的回合', aiTurn:'电脑思考中...', solids:'全色球', stripes:'花色球', foul:'犯规!', pocketed:'进袋', win:'你赢了!', lose:'你输了!', eightBall:'八球台球', power:'力度', aim:'瞄准并点击击球', restart:'再玩一次', score:'得分', cueBall:'白球进袋 — 犯规', wrongBall:'击错球 — 犯规', gameOver:'游戏结束', player:'玩家', ai:'电脑' },
      ja: { title:'ビリヤード', newGame:'新しいゲーム', player1:'プレイヤー', player2:'コンピュータ', yourTurn:'あなたの番', aiTurn:'コンピュータ思考中...', solids:'ソリッド', stripes:'ストライプ', foul:'ファウル!', pocketed:'ポケットイン', win:'勝利!', lose:'敗北!', eightBall:'エイトボール', power:'パワー', aim:'狙ってクリック', restart:'もう一度', score:'スコア', cueBall:'手球ポケットイン — ファウル', wrongBall:'間違った球 — ファウル', gameOver:'ゲームオーバー', player:'プレイヤー', ai:'コンピュータ' },
      it: { title:'Biliardo', newGame:'Nuova partita', player1:'Giocatore', player2:'Computer', yourTurn:'Il tuo turno', aiTurn:'Il computer pensa...', solids:'Piene', stripes:'Rigate', foul:'Fallo!', pocketed:'In buca', win:'Hai vinto!', lose:'Hai perso!', eightBall:'Biliardo 8 palle', power:'Potenza', aim:'Mira e clicca', restart:'Gioca ancora', score:'Punteggio', cueBall:'Palla bianca in buca — fallo', wrongBall:'Palla sbagliata — fallo', gameOver:'Fine partita', player:'Giocatore', ai:'Computer' }
    };
    function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }
    const locale = ref(getLocale());
    function t(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

    function onLocaleChanged() { locale.value = getLocale(); }
    onMounted(() => window.addEventListener('locale-changed', onLocaleChanged));
    onUnmounted(() => window.removeEventListener('locale-changed', onLocaleChanged));

    /* ── Constants ── */
    const TABLE_W = 800, TABLE_H = 400;
    const CUSHION = 30;
    const BALL_R = 10;
    const POCKET_R = 18;
    const FRICTION = 0.985;
    const MIN_VEL = 0.15;
    const MAX_POWER = 18;

    const POCKETS = [
      { x: CUSHION + 2, y: CUSHION + 2 },
      { x: TABLE_W / 2, y: CUSHION - 2 },
      { x: TABLE_W - CUSHION - 2, y: CUSHION + 2 },
      { x: CUSHION + 2, y: TABLE_H - CUSHION - 2 },
      { x: TABLE_W / 2, y: TABLE_H - CUSHION + 2 },
      { x: TABLE_W - CUSHION - 2, y: TABLE_H - CUSHION - 2 }
    ];

    const BALL_COLORS = [
      '#FFFFFF', // 0 cue
      '#FFD700', // 1 solid
      '#0000CD', // 2 solid
      '#DC143C', // 3 solid
      '#4B0082', // 4 solid
      '#FF4500', // 5 solid
      '#006400', // 6 solid
      '#8B0000', // 7 solid
      '#000000', // 8 eight-ball
      '#FFD700', // 9 stripe
      '#0000CD', // 10 stripe
      '#DC143C', // 11 stripe
      '#4B0082', // 12 stripe
      '#FF4500', // 13 stripe
      '#006400', // 14 stripe
      '#8B0000'  // 15 stripe
    ];

    /* ── State ── */
    const canvasRef = ref(null);
    let ctx = null;
    let animId = null;
    let balls = [];
    const gameState = ref('aiming'); // aiming, shooting, simulating, gameover
    const currentPlayer = ref(1); // 1=player, 2=ai
    const playerType = ref(null); // 'solids' or 'stripes'
    const aiType = ref(null);
    const playerScore = ref(0);
    const aiScore = ref(0);
    const message = ref('');
    const foulMsg = ref('');
    const winner = ref(0);
    const aimAngle = ref(0);
    const power = ref(10);
    let mouseX = 0, mouseY = 0;
    let isDragging = false;
    let dragStartX = 0, dragStartY = 0;
    let placingCue = false;

    /* ── Ball creation ── */
    function createBall(id, x, y) {
      return { id, x, y, vx: 0, vy: 0, pocketed: false };
    }

    function rackBalls() {
      const cx = TABLE_W * 0.7, cy = TABLE_H / 2;
      const d = BALL_R * 2.1;
      // Standard 8-ball rack pattern
      const rackOrder = [1, 9, 2, 10, 8, 11, 3, 12, 6, 14, 4, 13, 7, 15, 5];
      const positions = [];
      let idx = 0;
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col <= row; col++) {
          const bx = cx + row * d * Math.cos(Math.PI / 6);
          const by = cy + (col - row / 2) * d;
          positions.push({ id: rackOrder[idx], x: bx, y: by });
          idx++;
        }
      }
      return positions;
    }

    function initBalls() {
      balls = [];
      // Cue ball
      balls.push(createBall(0, TABLE_W * 0.25, TABLE_H / 2));
      // Rack
      const rack = rackBalls();
      for (const r of rack) {
        balls.push(createBall(r.id, r.x, r.y));
      }
    }

    function newGame() {
      initBalls();
      gameState.value = 'aiming';
      currentPlayer.value = 1;
      playerType.value = null;
      aiType.value = null;
      playerScore.value = 0;
      aiScore.value = 0;
      message.value = '';
      foulMsg.value = '';
      winner.value = 0;
      power.value = 10;
      placingCue = false;
    }

    /* ── Physics ── */
    function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

    function ballsMoving() {
      return balls.some(b => !b.pocketed && (Math.abs(b.vx) > MIN_VEL || Math.abs(b.vy) > MIN_VEL));
    }

    function checkPockets(b) {
      for (const p of POCKETS) {
        if (dist(b, p) < POCKET_R) {
          b.pocketed = true;
          b.vx = 0; b.vy = 0;
          return true;
        }
      }
      return false;
    }

    function collide(a, b) {
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.hypot(dx, dy);
      if (d === 0 || d > BALL_R * 2) return;
      // Separate overlapping
      const overlap = BALL_R * 2 - d;
      const nx = dx / d, ny = dy / d;
      a.x -= nx * overlap / 2;
      a.y -= ny * overlap / 2;
      b.x += nx * overlap / 2;
      b.y += ny * overlap / 2;
      // Elastic collision
      const dvx = a.vx - b.vx, dvy = a.vy - b.vy;
      const dot = dvx * nx + dvy * ny;
      if (dot <= 0) return;
      a.vx -= dot * nx;
      a.vy -= dot * ny;
      b.vx += dot * nx;
      b.vy += dot * ny;
    }

    function stepPhysics() {
      const active = balls.filter(b => !b.pocketed);
      // Move
      for (const b of active) {
        b.x += b.vx;
        b.y += b.vy;
        b.vx *= FRICTION;
        b.vy *= FRICTION;
        if (Math.abs(b.vx) < MIN_VEL) b.vx = 0;
        if (Math.abs(b.vy) < MIN_VEL) b.vy = 0;
        // Cushion bounce
        if (b.x - BALL_R < CUSHION) { b.x = CUSHION + BALL_R; b.vx = Math.abs(b.vx) * 0.8; }
        if (b.x + BALL_R > TABLE_W - CUSHION) { b.x = TABLE_W - CUSHION - BALL_R; b.vx = -Math.abs(b.vx) * 0.8; }
        if (b.y - BALL_R < CUSHION) { b.y = CUSHION + BALL_R; b.vy = Math.abs(b.vy) * 0.8; }
        if (b.y + BALL_R > TABLE_H - CUSHION) { b.y = TABLE_H - CUSHION - BALL_R; b.vy = -Math.abs(b.vy) * 0.8; }
      }
      // Ball-ball collisions
      for (let i = 0; i < active.length; i++) {
        for (let j = i + 1; j < active.length; j++) {
          collide(active[i], active[j]);
        }
      }
      // Pocket check
      const pocketed = [];
      for (const b of active) {
        if (checkPockets(b)) pocketed.push(b.id);
      }
      return pocketed;
    }

    /* ── Turn logic ── */
    function isSolid(id) { return id >= 1 && id <= 7; }
    function isStripe(id) { return id >= 9 && id <= 15; }

    function processTurnResult(pocketedIds) {
      let cuePocketed = pocketedIds.includes(0);
      let eightPocketed = pocketedIds.includes(8);
      let playerOwnPocketed = false;
      let wrongPocketed = false;
      const curType = currentPlayer.value === 1 ? playerType.value : aiType.value;

      for (const id of pocketedIds) {
        if (id === 0 || id === 8) continue;
        if (!playerType.value) {
          // First pocket assigns type
          if (currentPlayer.value === 1) {
            playerType.value = isSolid(id) ? 'solids' : 'stripes';
            aiType.value = playerType.value === 'solids' ? 'stripes' : 'solids';
          } else {
            aiType.value = isSolid(id) ? 'solids' : 'stripes';
            playerType.value = aiType.value === 'solids' ? 'stripes' : 'solids';
          }
          playerOwnPocketed = true;
        } else {
          const isOwn = curType === 'solids' ? isSolid(id) : isStripe(id);
          if (isOwn) playerOwnPocketed = true;
          else wrongPocketed = true;
        }

        if (currentPlayer.value === 1) playerScore.value++;
        else aiScore.value++;
      }

      // Eight ball pocketed
      if (eightPocketed) {
        const curT = currentPlayer.value === 1 ? playerType.value : aiType.value;
        const ownBalls = balls.filter(b => !b.pocketed && b.id !== 0 && b.id !== 8 &&
          (curT === 'solids' ? isSolid(b.id) : isStripe(b.id)));
        if (ownBalls.length === 0 && !cuePocketed) {
          winner.value = currentPlayer.value;
        } else {
          winner.value = currentPlayer.value === 1 ? 2 : 1;
        }
        gameState.value = 'gameover';
        message.value = winner.value === 1 ? t('win') : t('lose');
        return;
      }

      // Cue ball foul
      if (cuePocketed) {
        foulMsg.value = t('cueBall');
        const cue = balls.find(b => b.id === 0);
        cue.pocketed = false;
        cue.x = TABLE_W * 0.25;
        cue.y = TABLE_H / 2;
        cue.vx = 0; cue.vy = 0;
        // Avoid overlap
        for (const b of balls) {
          if (b.id !== 0 && !b.pocketed && dist(cue, b) < BALL_R * 2.5) {
            cue.y += BALL_R * 3;
          }
        }
        switchTurn();
        return;
      }

      if (wrongPocketed && !playerOwnPocketed) {
        foulMsg.value = t('wrongBall');
        switchTurn();
        return;
      }

      if (playerOwnPocketed) {
        // Player keeps turn
        foulMsg.value = '';
        startTurn();
      } else {
        foulMsg.value = '';
        switchTurn();
      }
    }

    function switchTurn() {
      currentPlayer.value = currentPlayer.value === 1 ? 2 : 1;
      startTurn();
    }

    function startTurn() {
      if (gameState.value === 'gameover') return;
      gameState.value = 'aiming';
      if (currentPlayer.value === 2) {
        setTimeout(aiShoot, 800);
      }
    }

    /* ── Shooting ── */
    function shoot(angle, pwr) {
      const cue = balls.find(b => b.id === 0);
      if (!cue || cue.pocketed) return;
      cue.vx = Math.cos(angle) * pwr;
      cue.vy = Math.sin(angle) * pwr;
      gameState.value = 'simulating';
      foulMsg.value = '';
      simulate();
    }

    function simulate() {
      const allPocketed = [];
      function step() {
        for (let i = 0; i < 2; i++) {
          const p = stepPhysics();
          allPocketed.push(...p);
        }
        draw();
        if (ballsMoving()) {
          animId = requestAnimationFrame(step);
        } else {
          // Remove duplicates
          const unique = [...new Set(allPocketed)];
          processTurnResult(unique);
        }
      }
      step();
    }

    /* ── AI ── */
    function aiShoot() {
      if (gameState.value === 'gameover') return;
      message.value = t('aiTurn');
      const cue = balls.find(b => b.id === 0);
      if (!cue || cue.pocketed) { switchTurn(); return; }

      // Find best target
      let bestAngle = 0, bestScore = -Infinity;
      const myType = aiType.value;
      const targets = balls.filter(b => !b.pocketed && b.id !== 0 && b.id !== 8);
      const myBalls = myType ? targets.filter(b => myType === 'solids' ? isSolid(b.id) : isStripe(b.id)) : targets;
      const aimBalls = myBalls.length > 0 ? myBalls : targets;

      // Check if AI should target 8-ball
      const ownRemaining = myType ? balls.filter(b => !b.pocketed && b.id !== 0 && b.id !== 8 &&
        (myType === 'solids' ? isSolid(b.id) : isStripe(b.id))) : [];
      if (myType && ownRemaining.length === 0) {
        const eight = balls.find(b => b.id === 8 && !b.pocketed);
        if (eight) aimBalls.push(eight);
      }

      for (const target of aimBalls) {
        for (const pocket of POCKETS) {
          // Angle from target to pocket
          const tp = Math.atan2(pocket.y - target.y, pocket.x - target.x);
          // Ghost ball position
          const gx = target.x - Math.cos(tp) * BALL_R * 2;
          const gy = target.y - Math.sin(tp) * BALL_R * 2;
          // Angle from cue to ghost
          const angle = Math.atan2(gy - cue.y, gx - cue.x);
          const distToGhost = Math.hypot(gx - cue.x, gy - cue.y);
          const distToPocket = Math.hypot(pocket.x - target.x, pocket.y - target.y);
          // Score: prefer close, clear shots
          let score = 1000 / (distToGhost + distToPocket);
          // Check for blockers
          let blocked = false;
          for (const ob of balls) {
            if (ob.pocketed || ob.id === 0 || ob.id === target.id) continue;
            const dx = ob.x - cue.x, dy = ob.y - cue.y;
            const proj = dx * Math.cos(angle) + dy * Math.sin(angle);
            if (proj > 0 && proj < distToGhost) {
              const perp = Math.abs(-dx * Math.sin(angle) + dy * Math.cos(angle));
              if (perp < BALL_R * 2.5) { blocked = true; break; }
            }
          }
          if (blocked) score *= 0.1;
          if (target.id === 8 && ownRemaining.length > 0) score *= 0.01;
          if (score > bestScore) {
            bestScore = score;
            bestAngle = angle;
          }
        }
      }
      // Add slight randomness
      bestAngle += (Math.random() - 0.5) * 0.12;
      const pwr = 8 + Math.random() * 6;
      setTimeout(() => {
        message.value = '';
        shoot(bestAngle, pwr);
      }, 500);
    }

    /* ── Drawing ── */
    function draw() {
      if (!ctx) return;
      const c = ctx;
      const W = TABLE_W, H = TABLE_H;

      // Background
      c.fillStyle = '#1a1a2e';
      c.fillRect(0, 0, W, H);

      // Table felt
      c.fillStyle = '#0d6b3d';
      c.fillRect(CUSHION, CUSHION, W - CUSHION * 2, H - CUSHION * 2);

      // Cushion rails
      c.fillStyle = '#5d3a1a';
      c.fillRect(0, 0, W, CUSHION);
      c.fillRect(0, H - CUSHION, W, CUSHION);
      c.fillRect(0, 0, CUSHION, H);
      c.fillRect(W - CUSHION, 0, CUSHION, H);

      // Rail inner edge highlight
      c.strokeStyle = '#3d8b37';
      c.lineWidth = 2;
      c.strokeRect(CUSHION, CUSHION, W - CUSHION * 2, H - CUSHION * 2);

      // Diamond markers on rails
      c.fillStyle = '#c0a060';
      const diamonds = [0.25, 0.5, 0.75];
      for (const d of diamonds) {
        c.beginPath(); c.arc(CUSHION + (W - CUSHION * 2) * d, CUSHION / 2, 3, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(CUSHION + (W - CUSHION * 2) * d, H - CUSHION / 2, 3, 0, Math.PI * 2); c.fill();
      }
      const vDiamonds = [0.25, 0.5, 0.75];
      for (const d of vDiamonds) {
        c.beginPath(); c.arc(CUSHION / 2, CUSHION + (H - CUSHION * 2) * d, 3, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(W - CUSHION / 2, CUSHION + (H - CUSHION * 2) * d, 3, 0, Math.PI * 2); c.fill();
      }

      // Pockets
      for (const p of POCKETS) {
        c.beginPath();
        c.arc(p.x, p.y, POCKET_R, 0, Math.PI * 2);
        c.fillStyle = '#111';
        c.fill();
        c.strokeStyle = '#333';
        c.lineWidth = 2;
        c.stroke();
      }

      // Head string line
      c.setLineDash([4, 4]);
      c.strokeStyle = 'rgba(255,255,255,0.15)';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(TABLE_W * 0.3, CUSHION);
      c.lineTo(TABLE_W * 0.3, H - CUSHION);
      c.stroke();
      c.setLineDash([]);

      // Foot spot
      c.beginPath();
      c.arc(TABLE_W * 0.7, H / 2, 3, 0, Math.PI * 2);
      c.fillStyle = 'rgba(255,255,255,0.3)';
      c.fill();

      // Balls
      for (const b of balls) {
        if (b.pocketed) continue;
        c.save();
        c.beginPath();
        c.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
        // Shadow
        c.shadowColor = 'rgba(0,0,0,0.5)';
        c.shadowBlur = 4;
        c.shadowOffsetX = 2;
        c.shadowOffsetY = 2;

        if (b.id === 0) {
          // Cue ball - white with sheen
          const cueGrad = c.createRadialGradient(b.x - 3, b.y - 3, 1, b.x, b.y, BALL_R);
          cueGrad.addColorStop(0, '#ffffff');
          cueGrad.addColorStop(1, '#d0d0d0');
          c.fillStyle = cueGrad;
        } else if (isStripe(b.id)) {
          // Stripe ball - white with colored band
          c.fillStyle = '#ffffff';
          c.fill();
          c.shadowColor = 'transparent';
          c.beginPath();
          c.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
          c.clip();
          c.fillStyle = BALL_COLORS[b.id];
          c.fillRect(b.x - BALL_R, b.y - BALL_R * 0.5, BALL_R * 2, BALL_R);
        } else {
          // Solid ball
          const grad = c.createRadialGradient(b.x - 3, b.y - 3, 1, b.x, b.y, BALL_R);
          grad.addColorStop(0, lighten(BALL_COLORS[b.id], 40));
          grad.addColorStop(1, BALL_COLORS[b.id]);
          c.fillStyle = grad;
        }
        c.fill();
        c.shadowColor = 'transparent';

        // Number on ball
        if (b.id > 0) {
          c.fillStyle = b.id === 8 ? '#fff' : (isStripe(b.id) ? BALL_COLORS[b.id] : '#fff');
          // Number circle for contrast
          c.beginPath();
          c.arc(b.x, b.y, 5, 0, Math.PI * 2);
          c.fillStyle = '#fff';
          c.fill();
          c.fillStyle = '#000';
          c.font = 'bold 8px Arial';
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillText(b.id, b.x, b.y + 0.5);
        }
        c.restore();
      }

      // Aiming line
      if (gameState.value === 'aiming' && currentPlayer.value === 1) {
        const cue = balls.find(b => b.id === 0);
        if (cue && !cue.pocketed) {
          const angle = Math.atan2(mouseY - cue.y, mouseX - cue.x);
          // Dotted aim line
          c.save();
          c.setLineDash([5, 5]);
          c.strokeStyle = 'rgba(255,255,255,0.5)';
          c.lineWidth = 1;
          c.beginPath();
          c.moveTo(cue.x, cue.y);
          c.lineTo(cue.x + Math.cos(angle) * 200, cue.y + Math.sin(angle) * 200);
          c.stroke();
          c.setLineDash([]);
          // Cue stick
          const stickLen = 150;
          const stickBack = 20 + power.value * 3;
          const sx = cue.x - Math.cos(angle) * (BALL_R + stickBack);
          const sy = cue.y - Math.sin(angle) * (BALL_R + stickBack);
          const ex = sx - Math.cos(angle) * stickLen;
          const ey = sy - Math.sin(angle) * stickLen;
          c.strokeStyle = '#d4a05a';
          c.lineWidth = 4;
          c.lineCap = 'round';
          c.beginPath();
          c.moveTo(sx, sy);
          c.lineTo(ex, ey);
          c.stroke();
          // Cue tip
          c.strokeStyle = '#e8d4a0';
          c.lineWidth = 5;
          c.beginPath();
          c.moveTo(sx, sy);
          c.lineTo(sx - Math.cos(angle) * 6, sy - Math.sin(angle) * 6);
          c.stroke();
          c.restore();
        }
      }
    }

    function lighten(hex, amt) {
      let r = parseInt(hex.slice(1, 3), 16);
      let g = parseInt(hex.slice(3, 5), 16);
      let b = parseInt(hex.slice(5, 7), 16);
      r = Math.min(255, r + amt);
      g = Math.min(255, g + amt);
      b = Math.min(255, b + amt);
      return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
    }

    /* ── Input handling ── */
    function onMouseMove(e) {
      const rect = canvasRef.value.getBoundingClientRect();
      const scaleX = TABLE_W / rect.width;
      const scaleY = TABLE_H / rect.height;
      mouseX = (e.clientX - rect.left) * scaleX;
      mouseY = (e.clientY - rect.top) * scaleY;
      if (gameState.value === 'aiming' && currentPlayer.value === 1) {
        draw();
      }
    }

    function onMouseDown(e) {
      if (gameState.value !== 'aiming' || currentPlayer.value !== 1) return;
      const cue = balls.find(b => b.id === 0);
      if (!cue || cue.pocketed) return;
      const rect = canvasRef.value.getBoundingClientRect();
      const scaleX = TABLE_W / rect.width;
      const scaleY = TABLE_H / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;
      const angle = Math.atan2(my - cue.y, mx - cue.x);
      shoot(angle, power.value);
    }

    /* ── Pocketed balls display ── */
    const playerPocketed = computed(() => {
      if (!playerType.value) return [];
      return balls.filter(b => b.pocketed && b.id !== 0 && b.id !== 8 &&
        (playerType.value === 'solids' ? isSolid(b.id) : isStripe(b.id)));
    });
    const aiPocketed = computed(() => {
      if (!aiType.value) return [];
      return balls.filter(b => b.pocketed && b.id !== 0 && b.id !== 8 &&
        (aiType.value === 'solids' ? isSolid(b.id) : isStripe(b.id)));
    });
    const playerTypeLabel = computed(() => playerType.value === 'solids' ? t('solids') : playerType.value === 'stripes' ? t('stripes') : '');
    const aiTypeLabel = computed(() => aiType.value === 'solids' ? t('solids') : aiType.value === 'stripes' ? t('stripes') : '');

    /* ── Game loop ── */
    function gameLoop() {
      draw();
      animId = requestAnimationFrame(gameLoop);
    }

    onMounted(() => {
      nextTick(() => {
        const canvas = canvasRef.value;
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        canvas.width = TABLE_W;
        canvas.height = TABLE_H;
        newGame();
        gameLoop();
      });
    });

    onUnmounted(() => {
      if (animId) cancelAnimationFrame(animId);
    });

    return {
      canvasRef, t, newGame, onMouseMove, onMouseDown,
      gameState, currentPlayer, message, foulMsg, winner,
      power, playerScore, aiScore,
      playerPocketed, aiPocketed, playerTypeLabel, aiTypeLabel,
      BALL_COLORS, isSolid, isStripe
    };
  }
})
