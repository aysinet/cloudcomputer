(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, nextTick } = Vue;

  const MAX_POINTS = 60;

  const LANGS = {
    tr: {
      server:'Sunucu',
      client:'İstemci',
      cpu:'CPU',
      memory:'Bellek',
      cores:'Çekirdek',
      model:'Model',
      total:'Toplam',
      used:'Kullanılan',
      free:'Boş',
      uptime:'Çalışma Süresi',
      platform:'Platform',
      hostname:'Sunucu Adı',
      arch:'Mimari',
      usage:'Kullanım',
      days:'gün',
      hours:'saat',
      mins:'dk',
      paused:'Duraklatıldı',
      resume:'Devam',
      pause:'Duraklat',
      interval:'Aralık',
      clientNotSupported:'Tarayıcı performans API desteklenmiyor'
    },
    en: {
      server:'Server',
      client:'Client',
      cpu:'CPU',
      memory:'Memory',
      cores:'Cores',
      model:'Model',
      total:'Total',
      used:'Used',
      free:'Free',
      uptime:'Uptime',
      platform:'Platform',
      hostname:'Hostname',
      arch:'Architecture',
      usage:'Usage',
      days:'d',
      hours:'h',
      mins:'m',
      paused:'Paused',
      resume:'Resume',
      pause:'Pause',
      interval:'Interval',
      clientNotSupported:'Browser performance API not supported'
    },
    de: {
      server:'Server',
      client:'Client',
      cpu:'CPU',
      memory:'Speicher',
      cores:'Kerne',
      model:'Modell',
      total:'Gesamt',
      used:'Belegt',
      free:'Frei',
      uptime:'Laufzeit',
      platform:'Plattform',
      hostname:'Hostname',
      arch:'Architektur',
      usage:'Nutzung',
      days:'T',
      hours:'Std',
      mins:'Min',
      paused:'Pausiert',
      resume:'Fortsetzen',
      pause:'Pause',
      interval:'Intervall',
      clientNotSupported:'Browser-Performance-API nicht unterstützt'
    },
    fr: {
      server:'Serveur',
      client:'Client',
      cpu:'CPU',
      memory:'Mémoire',
      cores:'Cœurs',
      model:'Modèle',
      total:'Total',
      used:'Utilisé',
      free:'Libre',
      uptime:'Durée',
      platform:'Plateforme',
      hostname:'Nom d\'hôte',
      arch:'Architecture',
      usage:'Utilisation',
      days:'j',
      hours:'h',
      mins:'min',
      paused:'En pause',
      resume:'Reprendre',
      pause:'Pause',
      interval:'Intervalle',
      clientNotSupported:'API de performance du navigateur non prise en charge'
    },
    es: {
      server:'Servidor',
      client:'Cliente',
      cpu:'CPU',
      memory:'Memoria',
      cores:'Núcleos',
      model:'Modelo',
      total:'Total',
      used:'Usado',
      free:'Libre',
      uptime:'Tiempo activo',
      platform:'Plataforma',
      hostname:'Nombre de host',
      arch:'Arquitectura',
      usage:'Uso',
      days:'d',
      hours:'h',
      mins:'min',
      paused:'Pausado',
      resume:'Reanudar',
      pause:'Pausar',
      interval:'Intervalo',
      clientNotSupported:'API de rendimiento del navegador no compatible'
    },
    ru: {
      server:'Сервер',
      client:'Клиент',
      cpu:'CPU',
      memory:'Память',
      cores:'Ядра',
      model:'Модель',
      total:'Всего',
      used:'Используется',
      free:'Свободно',
      uptime:'Время работы',
      platform:'Платформа',
      hostname:'Имя хоста',
      arch:'Архитектура',
      usage:'Использование',
      days:'д',
      hours:'ч',
      mins:'мин',
      paused:'Пауза',
      resume:'Продолжить',
      pause:'Пауза',
      interval:'Интервал',
      clientNotSupported:'API производительности браузера не поддерживается'
    },
    zh: {
      server:'服务器',
      client:'客户端',
      cpu:'CPU',
      memory:'内存',
      cores:'核心',
      model:'型号',
      total:'总计',
      used:'已用',
      free:'空闲',
      uptime:'运行时间',
      platform:'平台',
      hostname:'主机名',
      arch:'架构',
      usage:'使用率',
      days:'天',
      hours:'时',
      mins:'分',
      paused:'已暂停',
      resume:'继续',
      pause:'暂停',
      interval:'间隔',
      clientNotSupported:'浏览器性能API不受支持'
    },
    ja: {
      server:'サーバー',
      client:'クライアント',
      cpu:'CPU',
      memory:'メモリ',
      cores:'コア',
      model:'モデル',
      total:'合計',
      used:'使用中',
      free:'空き',
      uptime:'稼働時間',
      platform:'プラットフォーム',
      hostname:'ホスト名',
      arch:'アーキテクチャ',
      usage:'使用率',
      days:'日',
      hours:'時',
      mins:'分',
      paused:'一時停止',
      resume:'再開',
      pause:'一時停止',
      interval:'間隔',
      clientNotSupported:'ブラウザのパフォーマンスAPIがサポートされていません'
    },
    it: {
      server:'Server',
      client:'Client',
      cpu:'CPU',
      memory:'Memoria',
      cores:'Core',
      model:'Modello',
      total:'Totale',
      used:'Usato',
      free:'Libero',
      uptime:'Tempo attivo',
      platform:'Piattaforma',
      hostname:'Nome host',
      arch:'Architettura',
      usage:'Utilizzo',
      days:'g',
      hours:'h',
      mins:'min',
      paused:'In pausa',
      resume:'Riprendi',
      pause:'Pausa',
      interval:'Intervallo',
      clientNotSupported:'API delle prestazioni del browser non supportata'
    },
    ar: {
      server:'Server',
      client:'Client',
      cpu:'CPU',
      memory:'Memory',
      cores:'Cores',
      model:'النموذج',
      total:'المجموع',
      used:'Used',
      free:'Free',
      uptime:'Uptime',
      platform:'Platform',
      hostname:'Hostname',
      arch:'Architecture',
      usage:'Usage',
      days:'d',
      hours:'h',
      mins:'m',
      paused:'Paused',
      resume:'استئناف',
      pause:'إيقاف',
      interval:'Interval',
      clientNotSupported:'Browser performance API not supported'
    },
    ko: {
      server:'Server',
      client:'Client',
      cpu:'CPU',
      memory:'Memory',
      cores:'Cores',
      model:'모델',
      total:'합계',
      used:'Used',
      free:'Free',
      uptime:'Uptime',
      platform:'Platform',
      hostname:'Hostname',
      arch:'Architecture',
      usage:'Usage',
      days:'d',
      hours:'h',
      mins:'m',
      paused:'Paused',
      resume:'재개',
      pause:'Pause',
      interval:'Interval',
      clientNotSupported:'Browser performance API not supported'
    },
    hi: {
      server:'Server',
      client:'Client',
      cpu:'CPU',
      memory:'Memory',
      cores:'Cores',
      model:'मॉडल',
      total:'कुल',
      used:'Used',
      free:'Free',
      uptime:'Uptime',
      platform:'Platform',
      hostname:'Hostname',
      arch:'Architecture',
      usage:'Usage',
      days:'d',
      hours:'h',
      mins:'m',
      paused:'Paused',
      resume:'जारी',
      pause:'Pause',
      interval:'Interval',
      clientNotSupported:'Browser performance API not supported'
    },
    pt: {
      server:'Server',
      client:'Client',
      cpu:'CPU',
      memory:'Memory',
      cores:'Cores',
      model:'Modelo',
      total:'Total',
      used:'Used',
      free:'Free',
      uptime:'Uptime',
      platform:'Platform',
      hostname:'Hostname',
      arch:'Architecture',
      usage:'Usage',
      days:'d',
      hours:'h',
      mins:'m',
      paused:'Paused',
      resume:'Continuar',
      pause:'Pause',
      interval:'Interval',
      clientNotSupported:'Browser performance API not supported'
    }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  function formatBytes(bytes) {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(0) + ' MB';
    return (bytes / 1024).toFixed(0) + ' KB';
  }

  function drawGraph(canvas, dataArray, color, maxVal, label) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
    var h = canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (var i = 1; i <= 4; i++) {
      var y = (h / 5) * i;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Data
    if (dataArray.length < 2) return;
    var step = w / (MAX_POINTS - 1);
    var startIdx = Math.max(0, dataArray.length - MAX_POINTS);

    // Fill
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (var j = startIdx; j < dataArray.length; j++) {
      var x = (j - startIdx) * step;
      var val = Math.min(dataArray[j], maxVal);
      var yy = h - (val / maxVal) * h;
      if (j === startIdx) ctx.lineTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.lineTo((dataArray.length - 1 - startIdx) * step, h);
    ctx.closePath();
    ctx.fillStyle = color.replace('1)', '0.15)');
    ctx.fill();

    // Line
    ctx.beginPath();
    for (var k = startIdx; k < dataArray.length; k++) {
      var xx = (k - startIdx) * step;
      var val2 = Math.min(dataArray[k], maxVal);
      var yy2 = h - (val2 / maxVal) * h;
      if (k === startIdx) ctx.moveTo(xx, yy2);
      else ctx.lineTo(xx, yy2);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 * (window.devicePixelRatio || 1);
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Current value label
    var lastVal = dataArray[dataArray.length - 1];
    ctx.font = (12 * (window.devicePixelRatio || 1)) + 'px sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'right';
    ctx.fillText(lastVal.toFixed(1) + '%', w - 6 * (window.devicePixelRatio || 1), 16 * (window.devicePixelRatio || 1));

    // Label
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.textAlign = 'left';
    ctx.fillText(label, 6 * (window.devicePixelRatio || 1), 16 * (window.devicePixelRatio || 1));
  }

  return {
    setup() {
      var locale = ref(getLocale());
      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }
      function t(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      // ── State ──
      var activeTab = ref('server');
      var paused = ref(false);
      var pollInterval = ref(2000);
      var timer = null;

      // Server data
      var serverCpu = ref(0);
      var serverMem = ref(0);
      var serverInfo = ref(null);
      var serverCpuHistory = ref([]);
      var serverMemHistory = ref([]);

      // Client data
      var clientCpuSupported = ref(false);
      var clientMem = ref(0);
      var clientMemTotal = ref(0);
      var clientCpuHistory = ref([]);
      var clientMemHistory = ref([]);
      var clientInfo = ref({});

      // Canvas refs
      var serverCpuCanvas = ref(null);
      var serverMemCanvas = ref(null);
      var clientCpuCanvas = ref(null);
      var clientMemCanvas = ref(null);

      // ── Server fetch ──
      async function fetchServerStats() {
        try {
          var token = localStorage.getItem('token') || '';
          var res = await fetch('/api/system/stats', { headers: { 'Authorization': 'Bearer ' + token } });
          if (!res.ok) return;
          var data = await res.json();
          serverCpu.value = data.cpu.usage;
          serverMem.value = data.memory.usagePercent;
          serverInfo.value = data;
          serverCpuHistory.value.push(data.cpu.usage);
          serverMemHistory.value.push(data.memory.usagePercent);
          if (serverCpuHistory.value.length > MAX_POINTS) serverCpuHistory.value.shift();
          if (serverMemHistory.value.length > MAX_POINTS) serverMemHistory.value.shift();
        } catch (e) {}
      }

      // ── Client metrics ──
      function collectClientStats() {
        // Memory via performance.memory (Chrome/Edge)
        if (performance.memory) {
          var mem = performance.memory;
          clientMemTotal.value = mem.jsHeapSizeLimit;
          var usedMem = mem.usedJSHeapSize;
          var pct = clientMemTotal.value > 0 ? (usedMem / clientMemTotal.value) * 100 : 0;
          clientMem.value = Math.round(pct * 100) / 100;
          clientMemHistory.value.push(clientMem.value);
          if (clientMemHistory.value.length > MAX_POINTS) clientMemHistory.value.shift();
        }

        // deviceMemory provides approximate total RAM
        if (navigator.deviceMemory) {
          clientInfo.value.deviceMemory = navigator.deviceMemory + ' GB';
        }
        clientInfo.value.cores = navigator.hardwareConcurrency || '?';
        clientInfo.value.userAgent = navigator.userAgent.substring(0, 80);

        // Estimate CPU from frame timing
        if (clientCpuSupported.value) {
          measureClientCpu();
        }
      }

      var lastFrameTime = 0;
      var frameSamples = [];
      function measureClientCpu() {
        var now = performance.now();
        if (lastFrameTime > 0) {
          var delta = now - lastFrameTime;
          frameSamples.push(delta);
          if (frameSamples.length > 30) frameSamples.shift();
        }
        lastFrameTime = now;

        if (frameSamples.length > 5) {
          var avg = frameSamples.reduce(function(a, b) { return a + b; }, 0) / frameSamples.length;
          // 16.67ms = 60fps = low CPU usage, higher = more CPU
          var cpuEst = Math.min(100, Math.max(0, ((avg - 8) / 50) * 100));
          cpuEst = Math.round(cpuEst * 100) / 100;
          clientCpuHistory.value.push(cpuEst);
          if (clientCpuHistory.value.length > MAX_POINTS) clientCpuHistory.value.shift();
        }
      }

      var rafId = null;
      function rafLoop() {
        if (!paused.value && clientCpuSupported.value) {
          measureClientCpu();
        }
        rafId = requestAnimationFrame(rafLoop);
      }

      // ── Draw ──
      function redrawGraphs() {
        nextTick(function() {
          if (activeTab.value === 'server') {
            drawGraph(serverCpuCanvas.value, serverCpuHistory.value, 'rgba(0,184,148,1)', 100, t('cpu'));
            drawGraph(serverMemCanvas.value, serverMemHistory.value, 'rgba(9,132,227,1)', 100, t('memory'));
          } else {
            drawGraph(clientCpuCanvas.value, clientCpuHistory.value, 'rgba(253,203,110,1)', 100, t('cpu'));
            drawGraph(clientMemCanvas.value, clientMemHistory.value, 'rgba(108,92,231,1)', 100, t('memory'));
          }
        });
      }

      // ── Poll loop ──
      async function tick() {
        if (paused.value) return;
        await fetchServerStats();
        collectClientStats();
        redrawGraphs();
      }

      function startPolling() {
        if (timer) clearInterval(timer);
        timer = setInterval(tick, pollInterval.value);
      }

      function togglePause() {
        paused.value = !paused.value;
        if (!paused.value) {
          tick();
          startPolling();
        } else {
          if (timer) clearInterval(timer);
        }
      }

      function setInterval2(val) {
        pollInterval.value = val;
        if (!paused.value) startPolling();
      }

      function formatUptime(seconds) {
        if (!seconds) return '-';
        var d = Math.floor(seconds / 86400);
        var h = Math.floor((seconds % 86400) / 3600);
        var m = Math.floor((seconds % 3600) / 60);
        var parts = [];
        if (d > 0) parts.push(d + t('days'));
        parts.push(h + t('hours'));
        parts.push(m + t('mins'));
        return parts.join(' ');
      }

      // ── Lifecycle ──
      onMounted(function() {
        window.addEventListener('locale-changed', onLocaleChanged);
        clientCpuSupported.value = typeof requestAnimationFrame === 'function';
        tick();
        startPolling();
        if (clientCpuSupported.value) rafLoop();
      });

      onUnmounted(function() {
        window.removeEventListener('locale-changed', onLocaleChanged);
        if (timer) clearInterval(timer);
        if (rafId) cancelAnimationFrame(rafId);
      });

      return {
        t, activeTab, paused, pollInterval,
        serverCpu, serverMem, serverInfo, serverCpuHistory, serverMemHistory,
        clientCpuSupported, clientMem, clientMemTotal, clientCpuHistory, clientMemHistory, clientInfo,
        serverCpuCanvas, serverMemCanvas, clientCpuCanvas, clientMemCanvas,
        togglePause, setInterval2, formatUptime, formatBytes, redrawGraphs
      };
    }
  };
})(Vue);
