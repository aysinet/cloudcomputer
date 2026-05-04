({
  setup() {
    const { ref, reactive, computed, onMounted, onUnmounted } = Vue;

    const LANGS = {
      tr: {
        title:'Oran Oyunu',
        round:'Tur',
        next:'İleri',
        results:'Sonuçlar',
        resultsTitle:'Sonuçlar',
        bestCut:'En iyi kesim',
        avgBias:'Ortalama sapma',
        playAgain:'Tekrar Oyna',
        howToPlay:'Nasıl oynanır',
        helpText:'10 tur var. Kesim çizgisini dairedeki hedef kesre göre ayarlayın, sonra tıklayarak dilimleyin.',
        moveAndSlice:'Kesim çizgisini hareket ettir. Tıkla ve dilimle.',
        viewResults:'Sonuçları görüntüle.',
        clickNext:'İleri\'ye tıklayın.',
        youCut:'Kesiminiz',
        offBy:'Sapma'
      },
      en: {
        title:'Ratio Game',
        round:'Round',
        next:'Next',
        results:'Results',
        resultsTitle:'Results',
        bestCut:'Best cut',
        avgBias:'Average bias',
        playAgain:'Play again',
        howToPlay:'How to play',
        helpText:'There are 10 rounds. Match the target fraction by moving the cut line around the circle, then click to slice.',
        moveAndSlice:'Move the cut line. Click to slice.',
        viewResults:'View your results.',
        clickNext:'Click Next to continue.',
        youCut:'You cut',
        offBy:'Off by'
      },
      de: {
        title:'Bruch-Spiel',
        round:'Runde',
        next:'Weiter',
        results:'Ergebnis',
        resultsTitle:'Ergebnisse',
        bestCut:'Bester Schnitt',
        avgBias:'Durchschn. Abweichung',
        playAgain:'Nochmal',
        howToPlay:'Spielanleitung',
        helpText:'10 Runden. Bewege die Schnittlinie und klicke zum Schneiden.',
        moveAndSlice:'Schnittlinie bewegen. Klicken zum Schneiden.',
        viewResults:'Ergebnisse anzeigen.',
        clickNext:'Klicke Weiter.',
        youCut:'Dein Schnitt',
        offBy:'Abweichung'
      },
      fr: {
        title:'Jeu de Fractions',
        round:'Tour',
        next:'Suivant',
        results:'Résultats',
        resultsTitle:'Résultats',
        bestCut:'Meilleure coupe',
        avgBias:'Biais moyen',
        playAgain:'Rejouer',
        howToPlay:'Comment jouer',
        helpText:'10 tours. Déplacez la ligne de coupe et cliquez pour couper.',
        moveAndSlice:'Déplacez la ligne. Cliquez pour couper.',
        viewResults:'Voir les résultats.',
        clickNext:'Cliquez sur Suivant.',
        youCut:'Votre coupe',
        offBy:'Écart'
      },
      es: {
        title:'Juego de Fracciones',
        round:'Ronda',
        next:'Siguiente',
        results:'Resultados',
        resultsTitle:'Resultados',
        bestCut:'Mejor corte',
        avgBias:'Sesgo promedio',
        playAgain:'Jugar de nuevo',
        howToPlay:'Cómo jugar',
        helpText:'10 rondas. Mueve la línea de corte y haz clic para cortar.',
        moveAndSlice:'Mueve la línea. Haz clic para cortar.',
        viewResults:'Ver resultados.',
        clickNext:'Haz clic en Siguiente.',
        youCut:'Tu corte',
        offBy:'Desviación'
      },
      ru: {
        title:'Игра дробей',
        round:'Раунд',
        next:'Далее',
        results:'Результаты',
        resultsTitle:'Результаты',
        bestCut:'Лучший разрез',
        avgBias:'Средн. смещение',
        playAgain:'Играть снова',
        howToPlay:'Как играть',
        helpText:'10 раундов. Двигайте линию разреза и кликните, чтобы разрезать.',
        moveAndSlice:'Двигайте линию. Кликните для разреза.',
        viewResults:'Посмотреть результаты.',
        clickNext:'Нажмите Далее.',
        youCut:'Ваш разрез',
        offBy:'Отклонение'
      },
      zh: {
        title:'分数游戏',
        round:'轮',
        next:'下一轮',
        results:'结果',
        resultsTitle:'结果',
        bestCut:'最佳切割',
        avgBias:'平均偏差',
        playAgain:'再玩一次',
        howToPlay:'玩法',
        helpText:'共10轮。移动切割线并点击切割。',
        moveAndSlice:'移动切割线，点击切割。',
        viewResults:'查看结果。',
        clickNext:'点击下一轮。',
        youCut:'你的切割',
        offBy:'偏差'
      },
      ja: {
        title:'分数ゲーム',
        round:'ラウンド',
        next:'次へ',
        results:'結果',
        resultsTitle:'結果',
        bestCut:'最高カット',
        avgBias:'平均バイアス',
        playAgain:'もう一度',
        howToPlay:'遊び方',
        helpText:'全10ラウンド。カットラインを動かしてクリックで切断。',
        moveAndSlice:'カットラインを動かしてクリック。',
        viewResults:'結果を見る。',
        clickNext:'次へをクリック。',
        youCut:'カット',
        offBy:'誤差'
      },
      it: {
        title:'Gioco Frazioni',
        round:'Turno',
        next:'Avanti',
        results:'Risultati',
        resultsTitle:'Risultati',
        bestCut:'Miglior taglio',
        avgBias:'Bias medio',
        playAgain:'Gioca ancora',
        howToPlay:'Come si gioca',
        helpText:'10 turni. Muovi la linea di taglio e clicca per tagliare.',
        moveAndSlice:'Muovi la linea. Clicca per tagliare.',
        viewResults:'Vedi i risultati.',
        clickNext:'Clicca Avanti.',
        youCut:'Il tuo taglio',
        offBy:'Scarto'
      },
      ar: {
        title:'لعبة النسب',
        round:'Round',
        next:'التالي',
        results:'Results',
        resultsTitle:'Results',
        bestCut:'Best cut',
        avgBias:'Average bias',
        playAgain:'العب مجدداً',
        howToPlay:'How to play',
        helpText:'There are 10 rounds. Match the target fraction by moving the cut line around the circle, then click to slice.',
        moveAndSlice:'Move the cut line. Click to slice.',
        viewResults:'View your results.',
        clickNext:'Click Next to continue.',
        youCut:'You cut',
        offBy:'Off by'
      },
      ko: {
        title:'비율 게임',
        round:'Round',
        next:'다음',
        results:'Results',
        resultsTitle:'Results',
        bestCut:'Best cut',
        avgBias:'Average bias',
        playAgain:'다시 하기',
        howToPlay:'How to play',
        helpText:'There are 10 rounds. Match the target fraction by moving the cut line around the circle, then click to slice.',
        moveAndSlice:'Move the cut line. Click to slice.',
        viewResults:'View your results.',
        clickNext:'Click Next to continue.',
        youCut:'You cut',
        offBy:'Off by'
      },
      hi: {
        title:'अनुपात गेम',
        round:'Round',
        next:'अगला',
        results:'Results',
        resultsTitle:'Results',
        bestCut:'Best cut',
        avgBias:'Average bias',
        playAgain:'Play again',
        howToPlay:'How to play',
        helpText:'There are 10 rounds. Match the target fraction by moving the cut line around the circle, then click to slice.',
        moveAndSlice:'Move the cut line. Click to slice.',
        viewResults:'View your results.',
        clickNext:'Click Next to continue.',
        youCut:'You cut',
        offBy:'Off by'
      },
      pt: {
        title:'Jogo de Proporção',
        round:'Round',
        next:'Próximo',
        results:'Results',
        resultsTitle:'Results',
        bestCut:'Best cut',
        avgBias:'Average bias',
        playAgain:'Jogar de Novo',
        howToPlay:'How to play',
        helpText:'There are 10 rounds. Match the target fraction by moving the cut line around the circle, then click to slice.',
        moveAndSlice:'Move the cut line. Click to slice.',
        viewResults:'View your results.',
        clickNext:'Click Next to continue.',
        youCut:'You cut',
        offBy:'Off by'
      }
    };

    function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }
    const locale = ref(getLocale());
    function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

    const TARGETS = [
      { numerator:1, denominator:2 }, { numerator:1, denominator:3 },
      { numerator:1, denominator:4 }, { numerator:1, denominator:5 },
      { numerator:2, denominator:5 }, { numerator:1, denominator:6 },
      { numerator:1, denominator:7 }, { numerator:2, denominator:7 },
      { numerator:1, denominator:8 }, { numerator:3, denominator:8 }
    ];
    const TAU = Math.PI * 2;
    const R = 132;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    const svgEl = ref(null);
    const partsEl = ref(null);
    const showHelp = ref(false);

    const round = ref(0);
    const target = reactive({ numerator:1, denominator:2 });
    const turn = ref(0.2);
    const locked = ref(false);
    const lastIdx = ref(-1);
    const history = ref([]);
    const summaryVisible = ref(false);
    const partsVisible = ref(false);

    const instruction = ref('');
    const cutResultText = ref('');
    const scoreText = ref('');

    const userSliceD = ref('');
    const targetSliceD = ref('');
    const userSliceTx = ref('translate(0,0)');
    const partPaths = ref([]);

    function polar(t, r = R) {
      const a = t * TAU;
      return { x: Math.sin(a) * r, y: -Math.cos(a) * r };
    }

    function wedgePath(start, amount, dir = 1, r = R) {
      const safe = clamp(amount, 0.001, 0.999);
      const end = start + safe * dir;
      const s = polar(start, r);
      const e = polar(end, r);
      const lg = safe > 0.5 ? 1 : 0;
      const sw = dir > 0 ? 1 : 0;
      return `M 0 0 L ${s.x.toFixed(3)} ${s.y.toFixed(3)} A ${r} ${r} 0 ${lg} ${sw} ${e.x.toFixed(3)} ${e.y.toFixed(3)} Z`;
    }

    const cutEnd = computed(() => polar(clamp(turn.value, -0.5, 0.5)));

    function getNextIdx() {
      let i = Math.floor(Math.random() * TARGETS.length);
      while (i === lastIdx.value) i = Math.floor(Math.random() * TARGETS.length);
      return i;
    }

    function startGame() {
      round.value = 0;
      history.value = [];
      summaryVisible.value = false;
      nextRound();
    }

    function nextRound() {
      const idx = getNextIdx();
      round.value++;
      Object.assign(target, TARGETS[idx]);
      lastIdx.value = idx;
      turn.value = Math.random() > 0.5 ? 0.2 : -0.2;
      locked.value = false;
      partsVisible.value = false;
      partPaths.value = [];
      userSliceD.value = '';
      targetSliceD.value = '';
      userSliceTx.value = 'translate(0,0)';
      instruction.value = L('moveAndSlice');
      cutResultText.value = '';
      scoreText.value = '';
    }

    function nextStep() {
      if (!locked.value) return;
      if (round.value >= 10) { showSummary(); return; }
      nextRound();
    }

    function pointFromEvent(e) {
      const svg = svgEl.value;
      if (!svg) return { x: 0, y: 0 };
      const pt = svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    }

    function turnFromPoint(p) {
      const a = Math.atan2(p.y, p.x) + Math.PI / 2;
      const raw = (((a % TAU) + TAU) % TAU) / TAU;
      return raw > 0.5 ? raw - 1 : raw;
    }

    function positionCut(e) {
      if (locked.value) return;
      const p = pointFromEvent(e);
      if (Math.hypot(p.x, p.y) < 22) return;
      turn.value = clamp(turnFromPoint(p), -0.5, 0.5);
    }

    function makeSlice(e) {
      if (locked.value) return;
      positionCut(e);
      locked.value = true;

      const side = turn.value < 0 ? -1 : 1;
      const tv = target.numerator / target.denominator;
      const uv = Math.abs(turn.value);
      const signedErr = (uv - tv) * 100;
      const err = Math.abs(signedErr);
      const pct = uv * 100;
      const lift = polar(turn.value / 2, 15);

      userSliceD.value = wedgePath(0, uv, side);
      targetSliceD.value = wedgePath(0, tv, side);
      userSliceTx.value = `translate(${lift.x.toFixed(3)}px, ${lift.y.toFixed(3)}px)`;

      // proof parts
      const unit = 1 / target.denominator;
      const pp = [];
      for (let i = 0; i < target.denominator; i++) {
        pp.push({ d: wedgePath(i * unit * side, unit, side), isTarget: i < target.numerator });
      }
      partPaths.value = pp;
      requestAnimationFrame(() => { partsVisible.value = true; });

      history.value.push({ round: round.value, side, userValue: uv, targetValue: tv, signedError: signedErr, error: err, numerator: target.numerator, denominator: target.denominator });

      const isFinal = round.value >= 10;
      instruction.value = isFinal ? L('viewResults') : L('clickNext');
      cutResultText.value = `${L('youCut')} ${pct.toFixed(1)}%`;
      scoreText.value = `${L('offBy')} ${err.toFixed(1)} pts`;
    }

    const avgError = computed(() => {
      if (!history.value.length) return '0.0';
      return (history.value.reduce((s, h) => s + h.error, 0) / history.value.length).toFixed(1);
    });
    const bestCutText = computed(() => {
      if (!history.value.length) return '—';
      return history.value.reduce((b, h) => h.error < b.error ? h : b, history.value[0]).error.toFixed(1);
    });
    const biasText = computed(() => {
      if (!history.value.length) return '—';
      const avg = history.value.reduce((s, h) => s + h.signedError, 0) / history.value.length;
      return (avg >= 0 ? '+' : '') + avg.toFixed(1);
    });
    const analysisText = computed(() => {
      if (!history.value.length) return '';
      const avg = history.value.reduce((s, h) => s + h.error, 0) / history.value.length;
      const sAvg = history.value.reduce((s, h) => s + h.signedError, 0) / history.value.length;
      if (avg <= 2) return L('locale') === 'en' ? 'Very accurate overall.' : 'Çok isabetli kesimler!';
      if (Math.abs(sAvg) > avg * 0.55) {
        return sAvg > 0 ? (locale.value === 'tr' ? 'Çok büyük kesme eğiliminiz var.' : 'You tended to cut too large.') : (locale.value === 'tr' ? 'Çok küçük kesme eğiliminiz var.' : 'You tended to cut too small.');
      }
      return locale.value === 'tr' ? 'Dengeli ama tutarsız kesimler.' : 'Balanced but inconsistent cuts.';
    });

    function showSummary() { summaryVisible.value = true; }
    function miniWedge(start, amount, dir, r) { return wedgePath(start, amount, dir, r); }

    function onKey(e) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); nextStep(); }
      if (e.key === 'Escape') showHelp.value = false;
    }
    function onLocaleChanged() { locale.value = getLocale(); }

    onMounted(() => {
      window.addEventListener('keydown', onKey);
      window.addEventListener('locale-changed', onLocaleChanged);
      startGame();
    });
    onUnmounted(() => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('locale-changed', onLocaleChanged);
    });

    return {
      L, svgEl, partsEl, showHelp,
      round, target, turn, locked, history, summaryVisible, partsVisible,
      instruction, cutResultText, scoreText,
      cutEnd, userSliceD, targetSliceD, userSliceTx, partPaths,
      avgError, bestCutText, biasText, analysisText,
      positionCut, makeSlice, nextStep, startGame, miniWedge
    };
  }
})
