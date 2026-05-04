({
  setup() {
    const { ref, computed, onMounted, onUnmounted, watch, nextTick } = Vue;

    const LANGS = {
      tr: {
        start:'Büyüteci Başlat',
        stop:'Durdur',
        size:'Boyut',
        freeze:'Dondur',
        hint:'Büyüteci başlatın, ardından fare imlecini ekranda gezdirin.',
        activeHint:'Büyüteç aktif — fare imlecini gezdirin',
        zoomIn:'Yakınlaştır',
        zoomOut:'Uzaklaştır',
        trayTitle:'Büyüteç'
      },
      en: {
        start:'Start Magnifier',
        stop:'Stop',
        size:'Size',
        freeze:'Freeze',
        hint:'Start the magnifier, then move your cursor around the screen.',
        activeHint:'Magnifier active — move your cursor',
        zoomIn:'Zoom In',
        zoomOut:'Zoom Out',
        trayTitle:'Magnifier'
      },
      de: {
        start:'Lupe starten',
        stop:'Stopp',
        size:'Größe',
        freeze:'Einfrieren',
        hint:'Starten Sie die Lupe und bewegen Sie den Cursor.',
        activeHint:'Lupe aktiv — Cursor bewegen',
        zoomIn:'Vergrößern',
        zoomOut:'Verkleinern',
        trayTitle:'Lupe'
      },
      fr: {
        start:'Démarrer la loupe',
        stop:'Arrêter',
        size:'Taille',
        freeze:'Geler',
        hint:'Démarrez la loupe puis déplacez le curseur.',
        activeHint:'Loupe active — déplacez le curseur',
        zoomIn:'Agrandir',
        zoomOut:'Réduire',
        trayTitle:'Loupe'
      },
      es: {
        start:'Iniciar lupa',
        stop:'Detener',
        size:'Tamaño',
        freeze:'Congelar',
        hint:'Inicie la lupa y mueva el cursor por la pantalla.',
        activeHint:'Lupa activa — mueva el cursor',
        zoomIn:'Acercar',
        zoomOut:'Alejar',
        trayTitle:'Lupa'
      },
      ru: {
        start:'Запустить лупу',
        stop:'Остановить',
        size:'Размер',
        freeze:'Заморозить',
        hint:'Запустите лупу и двигайте курсор по экрану.',
        activeHint:'Лупа активна — двигайте курсор',
        zoomIn:'Увеличить',
        zoomOut:'Уменьшить',
        trayTitle:'Лупа'
      },
      zh: {
        start:'启动放大镜',
        stop:'停止',
        size:'大小',
        freeze:'冻结',
        hint:'启动放大镜，然后在屏幕上移动光标。',
        activeHint:'放大镜已激活 — 移动光标',
        zoomIn:'放大',
        zoomOut:'缩小',
        trayTitle:'放大镜'
      },
      ja: {
        start:'拡大鏡を開始',
        stop:'停止',
        size:'サイズ',
        freeze:'フリーズ',
        hint:'拡大鏡を開始し、カーソルを動かしてください。',
        activeHint:'拡大鏡アクティブ — カーソルを動かす',
        zoomIn:'拡大',
        zoomOut:'縮小',
        trayTitle:'拡大鏡'
      },
      it: {
        start:'Avvia lente',
        stop:'Ferma',
        size:'Dimensione',
        freeze:'Congela',
        hint:'Avvia la lente e muovi il cursore sullo schermo.',
        activeHint:'Lente attiva — muovi il cursore',
        zoomIn:'Ingrandisci',
        zoomOut:'Riduci',
        trayTitle:'Lente'
      },
      ar: {
        start:'Start Magnifier',
        stop:'إيقاف',
        size:'الحجم',
        freeze:'تجميد',
        hint:'تلميح',
        activeHint:'Magnifier active — move your cursor',
        zoomIn:'تكبير',
        zoomOut:'تصغير',
        trayTitle:'Magnifier'
      },
      ko: {
        start:'시작',
        stop:'정지',
        size:'크기',
        freeze:'틀 고정',
        hint:'힌트',
        activeHint:'Magnifier active — move your cursor',
        zoomIn:'확대',
        zoomOut:'축소',
        trayTitle:'Magnifier'
      },
      hi: {
        start:'Start Magnifier',
        stop:'रोकें',
        size:'आकार',
        freeze:'फ्रीज',
        hint:'Start the magnifier, then move your cursor around the screen.',
        activeHint:'Magnifier active — move your cursor',
        zoomIn:'ज़ूम इन',
        zoomOut:'ज़ूम आउट',
        trayTitle:'Magnifier'
      },
      pt: {
        start:'Start Magnifier',
        stop:'Parar',
        size:'Porte',
        freeze:'Congelar',
        hint:'Dica',
        activeHint:'Magnifier active — move your cursor',
        zoomIn:'Ampliar',
        zoomOut:'Reduzir',
        trayTitle:'Magnifier'
      }
    };

    function getLocale() {
      try { return (window.Pinia && Pinia.getActivePinia()) ? Pinia.getActivePinia()._s.get('settings')?.locale || 'tr' : 'tr'; } catch { return 'tr'; }
    }
    const locale = ref(getLocale());
    const L = computed(() => LANGS[locale.value] || LANGS.tr);

    const zoom = ref(3);
    const lensSize = ref(220);
    const shape = ref('circle');
    const freeze = ref(false);
    const active = ref(false);
    const cursorX = ref(0);
    const cursorY = ref(0);
    const previewCanvas = ref(null);

    let rafId = null;
    let captureCanvas = null;
    let lastScreenshot = null;
    let screenshotInterval = null;

    function zoomIn() { if (zoom.value < 10) zoom.value = Math.round((zoom.value + 0.5) * 10) / 10; }
    function zoomOut() { if (zoom.value > 1.5) zoom.value = Math.round((zoom.value - 0.5) * 10) / 10; }

    function onMouseMove(e) {
      if (freeze.value) return;
      cursorX.value = e.clientX;
      cursorY.value = e.clientY;
    }

    async function captureScreen() {
      try {
        if (typeof html2canvas === 'undefined') return;
        const el = document.querySelector('#app') || document.body;
        captureCanvas = await html2canvas(el, {
          scale: 1,
          logging: false,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          ignoreElements: (element) => {
            return element.classList && element.classList.contains('mag-float-lens');
          }
        });
        lastScreenshot = captureCanvas;
      } catch {}
    }

    function renderLoop() {
      if (!active.value) return;
      const canvas = previewCanvas.value;
      if (!canvas || !lastScreenshot) {
        rafId = requestAnimationFrame(renderLoop);
        return;
      }
      const ctx = canvas.getContext('2d');
      const size = lensSize.value;
      canvas.width = size;
      canvas.height = size;

      const srcSize = size / zoom.value;
      const sx = cursorX.value - srcSize / 2;
      const sy = cursorY.value - srcSize / 2;

      ctx.clearRect(0, 0, size, size);

      if (shape.value === 'circle') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
      }

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(lastScreenshot, sx, sy, srcSize, srcSize, 0, 0, size, size);

      // Draw crosshair
      ctx.strokeStyle = 'rgba(255,100,100,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(size / 2, 0);
      ctx.lineTo(size / 2, size);
      ctx.moveTo(0, size / 2);
      ctx.lineTo(size, size / 2);
      ctx.stroke();

      if (shape.value === 'circle') {
        ctx.restore();
        // Draw circle border
        ctx.strokeStyle = 'rgba(108,99,255,0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
        ctx.stroke();
      }

      rafId = requestAnimationFrame(renderLoop);
    }

    async function startMagnifier() {
      active.value = true;
      document.addEventListener('mousemove', onMouseMove);
      await captureScreen();
      screenshotInterval = setInterval(captureScreen, 1500);
      rafId = requestAnimationFrame(renderLoop);
    }

    function stopMagnifier() {
      active.value = false;
      document.removeEventListener('mousemove', onMouseMove);
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      if (screenshotInterval) { clearInterval(screenshotInterval); screenshotInterval = null; }
      lastScreenshot = null;
    }

    function onLocaleChanged(e) { if (LANGS[e.detail]) locale.value = e.detail; }

    onMounted(() => {
      window.addEventListener('locale-changed', onLocaleChanged);
    });

    onUnmounted(() => {
      stopMagnifier();
      window.removeEventListener('locale-changed', onLocaleChanged);
    });

    return {
      zoom, lensSize, shape, freeze, active, cursorX, cursorY,
      previewCanvas, L,
      zoomIn, zoomOut, startMagnifier, stopMagnifier
    };
  }
})
