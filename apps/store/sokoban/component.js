(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, nextTick, watch } = Vue;

  const LANGS = {
    tr: {
      title:'Sokoban',
      level:'Bölüm',
      moves:'Hamle',
      pushes:'İtme',
      restart:'Yeniden Başlat',
      undo:'Geri Al',
      prev:'Önceki',
      next:'Sonraki',
      selectLevel:'Bölüm Seç',
      completed:'Tebrikler! Bölüm tamamlandı!',
      allCompleted:'Tüm bölümleri tamamladınız! 🎉',
      nextLevel:'Sonraki Bölüm',
      best:'En İyi',
      na:'-',
      controls:'Kontroller',
      arrowKeys:'Ok tuşları veya WASD ile hareket',
      undoKey:'Z: Geri al',
      restartKey:'R: Yeniden başlat'
    },
    en: {
      title:'Sokoban',
      level:'Level',
      moves:'Moves',
      pushes:'Pushes',
      restart:'Restart',
      undo:'Undo',
      prev:'Previous',
      next:'Next',
      selectLevel:'Select Level',
      completed:'Congratulations! Level completed!',
      allCompleted:'You completed all levels! 🎉',
      nextLevel:'Next Level',
      best:'Best',
      na:'-',
      controls:'Controls',
      arrowKeys:'Arrow keys or WASD to move',
      undoKey:'Z: Undo',
      restartKey:'R: Restart'
    },
    de: {
      title:'Sokoban',
      level:'Level',
      moves:'Züge',
      pushes:'Schübe',
      restart:'Neustart',
      undo:'Rückgängig',
      prev:'Vorheriges',
      next:'Nächstes',
      selectLevel:'Level wählen',
      completed:'Gratulation! Level geschafft!',
      allCompleted:'Alle Level geschafft! 🎉',
      nextLevel:'Nächstes Level',
      best:'Bestzeit',
      na:'-',
      controls:'Steuerung',
      arrowKeys:'Pfeiltasten oder WASD',
      undoKey:'Z: Rückgängig',
      restartKey:'R: Neustart'
    },
    fr: {
      title:'Sokoban',
      level:'Niveau',
      moves:'Mouvements',
      pushes:'Poussées',
      restart:'Recommencer',
      undo:'Annuler',
      prev:'Précédent',
      next:'Suivant',
      selectLevel:'Choisir niveau',
      completed:'Félicitations ! Niveau terminé !',
      allCompleted:'Tous les niveaux terminés ! 🎉',
      nextLevel:'Niveau suivant',
      best:'Meilleur',
      na:'-',
      controls:'Contrôles',
      arrowKeys:'Flèches ou WASD pour se déplacer',
      undoKey:'Z: Annuler',
      restartKey:'R: Recommencer'
    },
    es: {
      title:'Sokoban',
      level:'Nivel',
      moves:'Movimientos',
      pushes:'Empujes',
      restart:'Reiniciar',
      undo:'Deshacer',
      prev:'Anterior',
      next:'Siguiente',
      selectLevel:'Elegir nivel',
      completed:'¡Felicidades! ¡Nivel completado!',
      allCompleted:'¡Completaste todos los niveles! 🎉',
      nextLevel:'Siguiente nivel',
      best:'Mejor',
      na:'-',
      controls:'Controles',
      arrowKeys:'Flechas o WASD para mover',
      undoKey:'Z: Deshacer',
      restartKey:'R: Reiniciar'
    },
    ru: {
      title:'Сокобан',
      level:'Уровень',
      moves:'Ходы',
      pushes:'Толчки',
      restart:'Заново',
      undo:'Отмена',
      prev:'Предыдущий',
      next:'Следующий',
      selectLevel:'Выбрать уровень',
      completed:'Поздравляем! Уровень пройден!',
      allCompleted:'Все уровни пройдены! 🎉',
      nextLevel:'Следующий уровень',
      best:'Лучший',
      na:'-',
      controls:'Управление',
      arrowKeys:'Стрелки или WASD для движения',
      undoKey:'Z: Отмена',
      restartKey:'R: Заново'
    },
    zh: {
      title:'推箱子',
      level:'关卡',
      moves:'步数',
      pushes:'推数',
      restart:'重新开始',
      undo:'撤销',
      prev:'上一关',
      next:'下一关',
      selectLevel:'选择关卡',
      completed:'通关！',
      allCompleted:'全部通关！',
      nextLevel:'下一关',
      best:'最佳',
      na:'-',
      controls:'操作说明',
      arrowKeys:'方向键',
      undoKey:'撤销键',
      Z:'Z',
      restartKey:'重启键',
      R:'R'
    },
    ja: {
      title:'倉庫番',
      level:'レベル',
      moves:'手数',
      pushes:'プッシュ',
      restart:'リスタート',
      undo:'元に戻す',
      prev:'前のレベル',
      next:'次のレベル',
      selectLevel:'レベル選択',
      completed:'クリア！',
      allCompleted:'全クリア！',
      nextLevel:'次のレベル',
      best:'ベスト',
      na:'-',
      controls:'操作方法',
      arrowKeys:'矢印キー',
      undoKey:'元に戻すキー',
      Z:'Z',
      restartKey:'リスタートキー',
      R:'R'
    },
    it: {
      title:'Sokoban',
      level:'Livello',
      moves:'Mosse',
      pushes:'Spinte',
      restart:'Ricomincia',
      undo:'Annulla',
      prev:'Livello precedente',
      next:'Livello successivo',
      selectLevel:'Seleziona livello',
      completed:'Completato!',
      allCompleted:'Tutto completato!',
      nextLevel:'Livello successivo',
      best:'Migliore',
      na:'-',
      controls:'Controlli',
      arrowKeys:'Tasti freccia',
      undoKey:'Tasto annulla',
      Z:'Z',
      restartKey:'Tasto riavvio',
      R:'R'
    },
    ar: {
      title:'سوكوبان',
      level:'Level',
      moves:'Moves',
      pushes:'Pushes',
      restart:'إعادة التشغيل',
      undo:'تراجع',
      prev:'السابق',
      next:'التالي',
      selectLevel:'Select Level',
      completed:'Congratulations! Level completed!',
      allCompleted:'You completed all levels! 🎉',
      nextLevel:'Next Level',
      best:'Best',
      na:'-',
      controls:'Controls',
      arrowKeys:'Arrow keys or WASD to move',
      undoKey:'Z: Undo',
      restartKey:'R: Restart'
    },
    ko: {
      title:'소코반',
      level:'Level',
      moves:'Moves',
      pushes:'Pushes',
      restart:'재시작',
      undo:'실행취소',
      prev:'이전',
      next:'다음',
      selectLevel:'Select Level',
      completed:'Congratulations! Level completed!',
      allCompleted:'You completed all levels! 🎉',
      nextLevel:'Next Level',
      best:'Best',
      na:'-',
      controls:'Controls',
      arrowKeys:'Arrow keys or WASD to move',
      undoKey:'Z: Undo',
      restartKey:'R: Restart'
    },
    hi: {
      title:'सोकोबन',
      level:'Level',
      moves:'Moves',
      pushes:'Pushes',
      restart:'पुनरारंभ',
      undo:'पूर्ववत',
      prev:'पिछला',
      next:'अगला',
      selectLevel:'Select Level',
      completed:'Congratulations! Level completed!',
      allCompleted:'You completed all levels! 🎉',
      nextLevel:'Next Level',
      best:'Best',
      na:'-',
      controls:'Controls',
      arrowKeys:'Arrow keys or WASD to move',
      undoKey:'Z: Undo',
      restartKey:'R: Restart'
    },
    pt: {
      title:'Sokoban',
      level:'Level',
      moves:'Moves',
      pushes:'Pushes',
      restart:'Reiniciar',
      undo:'Desfazer',
      prev:'Anterior',
      next:'Próximo',
      selectLevel:'Select Level',
      completed:'Congratulations! Level completed!',
      allCompleted:'You completed all levels! 🎉',
      nextLevel:'Next Level',
      best:'Best',
      na:'-',
      controls:'Controls',
      arrowKeys:'Arrow keys or WASD to move',
      undoKey:'Z: Undo',
      restartKey:'R: Restart'
    }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  /*
   * Level format: string rows separated by |
   * # = wall, @ = player, $ = box, . = target, + = player on target,
   * * = box on target, space = floor, - = floor (for clarity)
   */
  var LEVELS = [
    // 1 — Tutorial
    '####|#.@#|#$ #|#  #|####',
    // 2
    '######|#    #|# #$ #|# . @#|#    #|######',
    // 3
    '#####|#   #|#$  #|# .@#|#   #|#####',
    // 4
    '######|#    #|# $ .#|#@$ .#|#    #|######',
    // 5
    '  ####|###  #|# $ .#|# #$.#|# @  #|######',
    // 6
    '#####|#   ##|# $  #|##$  #|#. .@#|######',
    // 7
    '######|#    #|# ## #|# $. #|#  $.#|# @  #|######',
    // 8
    '  ####|  #  #|### .#|# $  #|# $#.#|# @  #|######',
    // 9
    '#######|#     #|# # # #|# $.$.#|#  @  #|#######',
    // 10
    '########|#   .  #|# $ #  #|#  $   #|# .# @ #|########',
    // 11
    '  #####|###   #|# $ # #|# . $ #|##.# @#|  #####',
    // 12
    '#######|#  .  #|# #$# #|#  $  #|# .#. #|#  @  #|#######',
    // 13
    '   ####|####  #|#   $ #|# #.# #|# $ . #|## #@ #|  #####',
    // 14
    '########|#  . . #|# $$   #|## # # #|#  $  @#|# ..   #|########',
    // 15
    '#######|#  .  #|# $#$ #|#. @ .#|# $#$ #|#  .  #|#######',
    // 16
    '  ######|  #    #|### $  #|# . $  #|# .#$@##|# .   #|#######',
    // 17
    '########|#      #|# $$$  #|# .#.  #|#  .#  #|#   @  #|########',
    // 18
    '  #####|###   ##|#  $  #|# #.#  #|# $ .$ #|##  #@ #|  ######',
    // 19
    '#######|#     #|# $$$ #|##.#.##|# ... #|# $$$ #|#  @  #|#######',
    // 20
    '########|#   .  #|# $#$  #|# .@.  #|# $#$  #|#   .  #|########',
    // 21
    '  ######|###    #|#   ## #|# $$.. #|## $ .@ #|  ######',
    // 22
    '#########|#   .   #|# $#$#$ #|# .   . #|# $#$#$ #|#   .  @#|#########',
    // 23
    '  ######|###    #|# $$ .#|# . $$#|# .#  @#|# .   #|#######',
    // 24
    '########|#  ..  #|# .$. @#|##$$$##|#  ..  #|#  $$  #|########',
    // 25
    '#########|#    .  #|# $#$   #|# . @ . #|# $#$   #|#    .  #|#########',
    // 26
    '  #####|  # . #|###$  #|# . $##|# $  .#|# @$  #|### . #|  #####',
    // 27
    '########|# ...  #|# $$$  #|## @ ###|# $$$ #|# ...  #|########',
    // 28
    '#########|#   .   #|# $$.$$ #|##  @  ##|# $$.$$ #|#   .   #|#########',
    // 29
    '  ######|###    #|#  $$  #|# .$$. #|# .  . #|## $$ ##|#  @   #|########',
    // 30
    '##########|#   ..   #|# $ $$ $ #|## .@@. ##|# $ $$ $ #|#   ..   #|##########'
  ];

  // Tile codes
  var FLOOR = 0, WALL = 1, BOX = 2, TARGET = 3, PLAYER = 4, BOX_ON_TARGET = 5, PLAYER_ON_TARGET = 6;

  function parseLevel(str) {
    var rows = str.split('|');
    var maxW = 0;
    rows.forEach(function(r) { if (r.length > maxW) maxW = r.length; });
    var grid = [];
    var playerPos = null;
    for (var y = 0; y < rows.length; y++) {
      var row = [];
      for (var x = 0; x < maxW; x++) {
        var ch = x < rows[y].length ? rows[y][x] : ' ';
        if (ch === '#') row.push(WALL);
        else if (ch === '@') { row.push(FLOOR); playerPos = { x: x, y: y }; }
        else if (ch === '+') { row.push(TARGET); playerPos = { x: x, y: y }; }
        else if (ch === '$') row.push(BOX);
        else if (ch === '.') row.push(TARGET);
        else if (ch === '*') row.push(BOX_ON_TARGET);
        else row.push(FLOOR);
      }
      grid.push(row);
    }
    return { grid: grid, player: playerPos, w: maxW, h: rows.length };
  }

  return {
    setup() {
      var locale = ref(getLocale());
      function t(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

      var currentLevel = ref(0);
      var grid = ref([]);
      var playerX = ref(0);
      var playerY = ref(0);
      var gridW = ref(0);
      var gridH = ref(0);
      var moves = ref(0);
      var pushes = ref(0);
      var levelComplete = ref(false);
      var allComplete = ref(false);
      var showLevelSelect = ref(false);
      var history = ref([]);
      var bestScores = ref({});
      var canvasEl = ref(null);
      var TILE = 40;

      // Load best scores
      function loadBest() {
        try {
          bestScores.value = JSON.parse(localStorage.getItem('sokoban_best') || '{}');
        } catch { bestScores.value = {}; }
      }

      function saveBest() {
        try { localStorage.setItem('sokoban_best', JSON.stringify(bestScores.value)); } catch {}
      }

      function initLevel(idx) {
        if (idx < 0 || idx >= LEVELS.length) return;
        currentLevel.value = idx;
        var parsed = parseLevel(LEVELS[idx]);
        grid.value = parsed.grid;
        playerX.value = parsed.player.x;
        playerY.value = parsed.player.y;
        gridW.value = parsed.w;
        gridH.value = parsed.h;
        moves.value = 0;
        pushes.value = 0;
        levelComplete.value = false;
        allComplete.value = false;
        history.value = [];
        showLevelSelect.value = false;
        nextTick(render);
      }

      function restart() { initLevel(currentLevel.value); }

      function prevLevel() { if (currentLevel.value > 0) initLevel(currentLevel.value - 1); }

      function nextLevel() {
        if (currentLevel.value < LEVELS.length - 1) initLevel(currentLevel.value + 1);
      }

      function goNextLevel() {
        if (currentLevel.value < LEVELS.length - 1) initLevel(currentLevel.value + 1);
        else allComplete.value = true;
      }

      function selectLevel(idx) { initLevel(idx); }

      // ── Grid helpers ──
      function getCell(x, y) {
        if (y < 0 || y >= grid.value.length) return WALL;
        if (x < 0 || x >= grid.value[y].length) return WALL;
        return grid.value[y][x];
      }

      function setCell(x, y, val) {
        if (y >= 0 && y < grid.value.length && x >= 0 && x < grid.value[y].length) {
          grid.value[y][x] = val;
        }
      }

      function isBox(cell) { return cell === BOX || cell === BOX_ON_TARGET; }
      function isTarget(cell) { return cell === TARGET || cell === BOX_ON_TARGET || cell === PLAYER_ON_TARGET; }
      function isWalkable(cell) { return cell === FLOOR || cell === TARGET; }

      // ── Move ──
      function move(dx, dy) {
        if (levelComplete.value) return;

        var px = playerX.value, py = playerY.value;
        var nx = px + dx, ny = py + dy;
        var cell = getCell(nx, ny);

        if (cell === WALL) return;

        // Save undo state
        var snapshot = {
          grid: grid.value.map(function(r) { return r.slice(); }),
          px: px, py: py, moves: moves.value, pushes: pushes.value
        };

        if (isBox(cell)) {
          // Check if box can be pushed
          var bx = nx + dx, by = ny + dy;
          var behind = getCell(bx, by);
          if (!isWalkable(behind)) return;

          // Push box
          history.value.push(snapshot);
          // Remove box from current pos
          setCell(nx, ny, cell === BOX_ON_TARGET ? TARGET : FLOOR);
          // Place box in new pos
          setCell(bx, by, behind === TARGET ? BOX_ON_TARGET : BOX);
          pushes.value++;
        } else if (isWalkable(cell)) {
          history.value.push(snapshot);
        } else {
          return;
        }

        // Move player
        playerX.value = nx;
        playerY.value = ny;
        moves.value++;

        // Trim history
        if (history.value.length > 500) history.value.shift();

        render();
        checkWin();
      }

      function undo() {
        if (!history.value.length || levelComplete.value) return;
        var snap = history.value.pop();
        grid.value = snap.grid;
        playerX.value = snap.px;
        playerY.value = snap.py;
        moves.value = snap.moves;
        pushes.value = snap.pushes;
        render();
      }

      function checkWin() {
        // All boxes must be on targets — no BOX (only BOX_ON_TARGET is OK)
        for (var y = 0; y < grid.value.length; y++) {
          for (var x = 0; x < grid.value[y].length; x++) {
            if (grid.value[y][x] === BOX) return;
          }
        }
        levelComplete.value = true;
        // Save best
        var key = '' + currentLevel.value;
        var prev = bestScores.value[key];
        if (!prev || moves.value < prev.moves) {
          bestScores.value[key] = { moves: moves.value, pushes: pushes.value };
          saveBest();
        }
      }

      // ── Render ──
      function render() {
        var c = canvasEl.value;
        if (!c) return;
        var ctx = c.getContext('2d');
        var w = gridW.value, h = gridH.value;
        c.width = w * TILE;
        c.height = h * TILE;

        // Background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, c.width, c.height);

        for (var y = 0; y < h; y++) {
          for (var x = 0; x < w; x++) {
            var cell = getCell(x, y);
            var tx = x * TILE, ty = y * TILE;

            if (cell === WALL) {
              ctx.fillStyle = '#4a4e69';
              ctx.fillRect(tx, ty, TILE, TILE);
              ctx.fillStyle = '#6c7086';
              ctx.fillRect(tx + 2, ty + 2, TILE - 4, TILE - 4);
              // Brick pattern
              ctx.strokeStyle = '#4a4e69';
              ctx.lineWidth = 1;
              ctx.strokeRect(tx + 2, ty + 2, TILE / 2 - 2, TILE / 2 - 2);
              ctx.strokeRect(tx + TILE / 2, ty + TILE / 2, TILE / 2 - 2, TILE / 2 - 2);
            } else if (cell === FLOOR) {
              ctx.fillStyle = '#16213e';
              ctx.fillRect(tx, ty, TILE, TILE);
            } else if (cell === TARGET) {
              ctx.fillStyle = '#16213e';
              ctx.fillRect(tx, ty, TILE, TILE);
              // Diamond marker
              ctx.fillStyle = 'rgba(243, 139, 168, 0.5)';
              ctx.beginPath();
              ctx.moveTo(tx + TILE / 2, ty + 8);
              ctx.lineTo(tx + TILE - 8, ty + TILE / 2);
              ctx.lineTo(tx + TILE / 2, ty + TILE - 8);
              ctx.lineTo(tx + 8, ty + TILE / 2);
              ctx.closePath();
              ctx.fill();
              ctx.strokeStyle = '#f38ba8';
              ctx.lineWidth = 1.5;
              ctx.stroke();
            } else if (cell === BOX) {
              ctx.fillStyle = '#16213e';
              ctx.fillRect(tx, ty, TILE, TILE);
              // Box
              ctx.fillStyle = '#fab387';
              roundRect(ctx, tx + 4, ty + 4, TILE - 8, TILE - 8, 4, true, false);
              ctx.strokeStyle = '#e17055';
              ctx.lineWidth = 2;
              roundRect(ctx, tx + 4, ty + 4, TILE - 8, TILE - 8, 4, false, true);
              // Cross on box
              ctx.strokeStyle = '#1e1e2e';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(tx + 10, ty + 10); ctx.lineTo(tx + TILE - 10, ty + TILE - 10);
              ctx.moveTo(tx + TILE - 10, ty + 10); ctx.lineTo(tx + 10, ty + TILE - 10);
              ctx.stroke();
            } else if (cell === BOX_ON_TARGET) {
              ctx.fillStyle = '#16213e';
              ctx.fillRect(tx, ty, TILE, TILE);
              // Box on target — green
              ctx.fillStyle = '#a6e3a1';
              roundRect(ctx, tx + 4, ty + 4, TILE - 8, TILE - 8, 4, true, false);
              ctx.strokeStyle = '#40916c';
              ctx.lineWidth = 2;
              roundRect(ctx, tx + 4, ty + 4, TILE - 8, TILE - 8, 4, false, true);
              // Checkmark
              ctx.strokeStyle = '#1e1e2e';
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.moveTo(tx + 12, ty + TILE / 2);
              ctx.lineTo(tx + TILE / 2 - 2, ty + TILE - 12);
              ctx.lineTo(tx + TILE - 10, ty + 12);
              ctx.stroke();
            }
          }
        }

        // Player
        var ppx = playerX.value * TILE, ppy = playerY.value * TILE;
        // Body circle
        ctx.fillStyle = '#89b4fa';
        ctx.beginPath();
        ctx.arc(ppx + TILE / 2, ppy + TILE / 2, TILE / 2 - 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1e1e2e';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Eyes
        ctx.fillStyle = '#1e1e2e';
        ctx.beginPath();
        ctx.arc(ppx + TILE / 2 - 5, ppy + TILE / 2 - 3, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ppx + TILE / 2 + 5, ppy + TILE / 2 - 3, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Smile
        ctx.strokeStyle = '#1e1e2e';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ppx + TILE / 2, ppy + TILE / 2 + 1, 6, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }

      function roundRect(ctx, x, y, w, h, r, fill, stroke) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        if (fill) ctx.fill();
        if (stroke) ctx.stroke();
      }

      // ── Keyboard ──
      function onKeyDown(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        var handled = true;
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') move(0, -1);
        else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') move(0, 1);
        else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') move(-1, 0);
        else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') move(1, 0);
        else if (e.key === 'z' || e.key === 'Z') undo();
        else if (e.key === 'r' || e.key === 'R') restart();
        else handled = false;
        if (handled) e.preventDefault();
      }

      // ── Touch support ──
      var touchStartX = 0, touchStartY = 0;

      function onTouchStart(e) {
        if (e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      }

      function onTouchEnd(e) {
        if (e.changedTouches.length === 1) {
          var dx = e.changedTouches[0].clientX - touchStartX;
          var dy = e.changedTouches[0].clientY - touchStartY;
          var absDx = Math.abs(dx), absDy = Math.abs(dy);
          if (absDx < 20 && absDy < 20) return;
          if (absDx > absDy) {
            move(dx > 0 ? 1 : -1, 0);
          } else {
            move(0, dy > 0 ? 1 : -1);
          }
          e.preventDefault();
        }
      }

      // ── Stats ──
      var currentBest = computed(function() {
        var b = bestScores.value['' + currentLevel.value];
        return b || null;
      });

      var completedLevels = computed(function() {
        return Object.keys(bestScores.value).length;
      });

      // ── Lifecycle ──
      onMounted(function() {
        loadBest();
        initLevel(0);
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('locale-changed', onLocaleChanged);
      });

      onUnmounted(function() {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('locale-changed', onLocaleChanged);
});

      return {
        t, canvasEl,
        currentLevel, moves, pushes, levelComplete, allComplete,
        showLevelSelect, currentBest, completedLevels,
        LEVELS: LEVELS,
        bestScores: bestScores,
        restart, undo, prevLevel, nextLevel, goNextLevel, selectLevel,
        onTouchStart, onTouchEnd
      };
    }
  };
})(Vue)
