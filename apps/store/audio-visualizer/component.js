(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, watch, nextTick } = Vue;

  const LANGS = {
    tr: {
      openFile:'Dosya Aç', mic:'Mikrofon', fromUrl:'URL\'den', fullscreen:'Tam Ekran',
      urlPlaceholder:'Ses URL\'si yapıştır (mp3, wav, ogg...)', load:'Yükle',
      dropOrOpen:'Dosya sürükleyin veya Dosya Aç\'a tıklayın',
      mode_bars:'Çubuklar', mode_wave:'Dalga', mode_circle:'Daire',
      mode_particles:'Parçacıklar', mode_spectrum:'Spektrum', mode_terrain:'Arazi'
    },
    en: {
      openFile:'Open File', mic:'Microphone', fromUrl:'From URL', fullscreen:'Fullscreen',
      urlPlaceholder:'Paste audio URL (mp3, wav, ogg...)', load:'Load',
      dropOrOpen:'Drop a file or click Open File',
      mode_bars:'Bars', mode_wave:'Wave', mode_circle:'Circle',
      mode_particles:'Particles', mode_spectrum:'Spectrum', mode_terrain:'Terrain'
    },
    de: {
      openFile:'Datei öffnen', mic:'Mikrofon', fromUrl:'Von URL', fullscreen:'Vollbild',
      urlPlaceholder:'Audio-URL einfügen (mp3, wav, ogg...)', load:'Laden',
      dropOrOpen:'Datei hierher ziehen oder Datei öffnen klicken',
      mode_bars:'Balken', mode_wave:'Welle', mode_circle:'Kreis',
      mode_particles:'Partikel', mode_spectrum:'Spektrum', mode_terrain:'Terrain'
    },
    fr: {
      openFile:'Ouvrir', mic:'Micro', fromUrl:'Depuis URL', fullscreen:'Plein écran',
      urlPlaceholder:'Coller URL audio (mp3, wav, ogg...)', load:'Charger',
      dropOrOpen:'Glissez un fichier ou cliquez Ouvrir',
      mode_bars:'Barres', mode_wave:'Onde', mode_circle:'Cercle',
      mode_particles:'Particules', mode_spectrum:'Spectre', mode_terrain:'Terrain'
    },
    es: {
      openFile:'Abrir', mic:'Micrófono', fromUrl:'Desde URL', fullscreen:'Pantalla completa',
      urlPlaceholder:'Pegar URL de audio (mp3, wav, ogg...)', load:'Cargar',
      dropOrOpen:'Arrastra un archivo o haz clic en Abrir',
      mode_bars:'Barras', mode_wave:'Onda', mode_circle:'Círculo',
      mode_particles:'Partículas', mode_spectrum:'Espectro', mode_terrain:'Terreno'
    },
    ru: {
      openFile:'Открыть', mic:'Микрофон', fromUrl:'Из URL', fullscreen:'На весь экран',
      urlPlaceholder:'Вставьте URL аудио (mp3, wav, ogg...)', load:'Загрузить',
      dropOrOpen:'Перетащите файл или нажмите Открыть',
      mode_bars:'Столбцы', mode_wave:'Волна', mode_circle:'Круг',
      mode_particles:'Частицы', mode_spectrum:'Спектр', mode_terrain:'Рельеф'
    },
    zh: {
      openFile:'打开文件', mic:'麦克风', fromUrl:'从URL', fullscreen:'全屏',
      urlPlaceholder:'粘贴音频URL (mp3, wav, ogg...)', load:'加载',
      dropOrOpen:'拖放文件或点击打开文件',
      mode_bars:'柱状', mode_wave:'波形', mode_circle:'圆形',
      mode_particles:'粒子', mode_spectrum:'频谱', mode_terrain:'地形'
    },
    ja: {
      openFile:'ファイルを開く', mic:'マイク', fromUrl:'URLから', fullscreen:'全画面',
      urlPlaceholder:'音声URLを貼り付け (mp3, wav, ogg...)', load:'読込',
      dropOrOpen:'ファイルをドロップまたはファイルを開くをクリック',
      mode_bars:'バー', mode_wave:'波形', mode_circle:'サークル',
      mode_particles:'パーティクル', mode_spectrum:'スペクトラム', mode_terrain:'テレイン'
    },
    it: {
      openFile:'Apri file', mic:'Microfono', fromUrl:'Da URL', fullscreen:'Schermo intero',
      urlPlaceholder:'Incolla URL audio (mp3, wav, ogg...)', load:'Carica',
      dropOrOpen:'Trascina un file o clicca Apri file',
      mode_bars:'Barre', mode_wave:'Onda', mode_circle:'Cerchio',
      mode_particles:'Particelle', mode_spectrum:'Spettro', mode_terrain:'Terreno'
    },
    ar: {
      openFile:'فتح ملف', mic:'ميكروفون', fromUrl:'من رابط', fullscreen:'ملء الشاشة',
      urlPlaceholder:'الصق رابط صوتي (mp3, wav, ogg...)', load:'تحميل',
      dropOrOpen:'اسحب ملفًا أو انقر فتح ملف',
      mode_bars:'أعمدة', mode_wave:'موجة', mode_circle:'دائرة',
      mode_particles:'جسيمات', mode_spectrum:'طيف', mode_terrain:'تضاريس'
    },
    ko: {
      openFile:'파일 열기', mic:'마이크', fromUrl:'URL에서', fullscreen:'전체 화면',
      urlPlaceholder:'오디오 URL 붙여넣기 (mp3, wav, ogg...)', load:'로드',
      dropOrOpen:'파일을 끌어다 놓거나 파일 열기를 클릭하세요',
      mode_bars:'막대', mode_wave:'파형', mode_circle:'원형',
      mode_particles:'파티클', mode_spectrum:'스펙트럼', mode_terrain:'지형'
    },
    hi: {
      openFile:'फ़ाइल खोलें', mic:'माइक्रोफ़ोन', fromUrl:'URL से', fullscreen:'पूर्ण स्क्रीन',
      urlPlaceholder:'ऑडियो URL पेस्ट करें (mp3, wav, ogg...)', load:'लोड',
      dropOrOpen:'फ़ाइल खींचें या फ़ाइल खोलें पर क्लिक करें',
      mode_bars:'बार्स', mode_wave:'वेव', mode_circle:'सर्कल',
      mode_particles:'पार्टिकल', mode_spectrum:'स्पेक्ट्रम', mode_terrain:'टेरेन'
    },
    pt: {
      openFile:'Abrir Arquivo', mic:'Microfone', fromUrl:'De URL', fullscreen:'Tela Cheia',
      urlPlaceholder:'Cole URL de áudio (mp3, wav, ogg...)', load:'Carregar',
      dropOrOpen:'Arraste um arquivo ou clique em Abrir Arquivo',
      mode_bars:'Barras', mode_wave:'Onda', mode_circle:'Círculo',
      mode_particles:'Partículas', mode_spectrum:'Espectro', mode_terrain:'Terreno'
    }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

      // Refs
      const canvasWrap = ref(null);
      const vizCanvas = ref(null);

      // State
      const vizMode = ref('bars');
      const vizModes = ['bars', 'wave', 'circle', 'particles', 'spectrum', 'terrain'];
      const colorTheme = ref('neon');
      const colorThemes = [
        { id: 'neon', name: 'Neon', preview: 'linear-gradient(90deg,#e040fb,#00e5ff)' },
        { id: 'fire', name: 'Fire', preview: 'linear-gradient(90deg,#ff4500,#ffd700)' },
        { id: 'ocean', name: 'Ocean', preview: 'linear-gradient(90deg,#0077b6,#00e5ff)' },
        { id: 'forest', name: 'Forest', preview: 'linear-gradient(90deg,#2d6a4f,#95d5b2)' },
        { id: 'sunset', name: 'Sunset', preview: 'linear-gradient(90deg,#f72585,#ffd60a)' },
        { id: 'mono', name: 'Mono', preview: 'linear-gradient(90deg,#ccc,#fff)' }
      ];

      const trackName = ref('');
      const isPlaying = ref(false);
      const hasSource = ref(false);
      const micActive = ref(false);
      const volume = ref(80);
      const elapsed = ref(0);
      const duration = ref(0);
      const isFullscreen = ref(false);
      const showUrlInput = ref(false);
      const audioUrl = ref('');

      const progressPct = computed(() => duration.value > 0 ? (elapsed.value / duration.value) * 100 : 0);

      // Audio
      let audioCtx = null;
      let analyser = null;
      let sourceNode = null;
      let audio = null;
      let micStream = null;
      let rafId = null;
      let ctx2d = null;
      let particles = [];

      function ensureAudioContext() {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 2048;
          analyser.smoothingTimeConstant = 0.82;
          analyser.connect(audioCtx.destination);
        }
        if (audioCtx.state === 'suspended') audioCtx.resume();
      }

      function getColors() {
        const themes = {
          neon:    ['#e040fb','#7c4dff','#00e5ff','#76ff03','#ffea00','#ff3d00'],
          fire:    ['#ff4500','#ff6a00','#ff8c00','#ffa500','#ffd700','#ffea00'],
          ocean:   ['#023e8a','#0077b6','#0096c7','#00b4d8','#48cae4','#90e0ef'],
          forest:  ['#1b4332','#2d6a4f','#40916c','#52b788','#74c69d','#95d5b2'],
          sunset:  ['#f72585','#b5179e','#7209b7','#560bad','#480ca8','#3a0ca3'],
          mono:    ['#ffffff','#e0e0e0','#bdbdbd','#9e9e9e','#757575','#616161']
        };
        return themes[colorTheme.value] || themes.neon;
      }

      function colorAt(i, total) {
        const colors = getColors();
        const idx = (i / total) * (colors.length - 1);
        const lo = Math.floor(idx);
        const hi = Math.min(lo + 1, colors.length - 1);
        const frac = idx - lo;
        return lerpColor(colors[lo], colors[hi], frac);
      }

      function lerpColor(a, b, t) {
        const ar = parseInt(a.slice(1, 3), 16), ag = parseInt(a.slice(3, 5), 16), ab = parseInt(a.slice(5, 7), 16);
        const br = parseInt(b.slice(1, 3), 16), bg = parseInt(b.slice(3, 5), 16), bb = parseInt(b.slice(5, 7), 16);
        const r = Math.round(ar + (br - ar) * t);
        const g = Math.round(ag + (bg - ag) * t);
        const bl = Math.round(ab + (bb - ab) * t);
        return `rgb(${r},${g},${bl})`;
      }

      function hexToRgba(hex, a) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${a})`;
      }

      // ---- Visualization renderers ----
      function drawBars(dataArray, bufLen, w, h) {
        const barW = Math.max(2, (w / bufLen) * 2.5);
        const gap = 1;
        let x = 0;
        for (let i = 0; i < bufLen && x < w; i++) {
          const v = dataArray[i] / 255;
          const barH = v * h * 0.9;
          const color = colorAt(i, bufLen);
          ctx2d.fillStyle = color;
          ctx2d.shadowColor = color;
          ctx2d.shadowBlur = 8;
          const radius = Math.min(barW / 2, 4);
          const bx = x, by = h - barH;
          ctx2d.beginPath();
          ctx2d.moveTo(bx + radius, by);
          ctx2d.lineTo(bx + barW - radius, by);
          ctx2d.quadraticCurveTo(bx + barW, by, bx + barW, by + radius);
          ctx2d.lineTo(bx + barW, h);
          ctx2d.lineTo(bx, h);
          ctx2d.lineTo(bx, by + radius);
          ctx2d.quadraticCurveTo(bx, by, bx + radius, by);
          ctx2d.fill();
          x += barW + gap;
        }
        ctx2d.shadowBlur = 0;
      }

      function drawWave(dataArray, bufLen, w, h) {
        const timeData = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(timeData);
        const colors = getColors();
        ctx2d.lineWidth = 2.5;
        for (let layer = 0; layer < 3; layer++) {
          ctx2d.beginPath();
          ctx2d.strokeStyle = hexToRgba(colors[layer * 2] || colors[0], 0.7 - layer * 0.15);
          ctx2d.shadowColor = colors[layer * 2] || colors[0];
          ctx2d.shadowBlur = 10;
          const sliceW = w / timeData.length;
          let x = 0;
          for (let i = 0; i < timeData.length; i++) {
            const v = timeData[i] / 128.0;
            const y = (v * h / 2) + (layer - 1) * 8;
            if (i === 0) ctx2d.moveTo(x, y);
            else ctx2d.lineTo(x, y);
            x += sliceW;
          }
          ctx2d.stroke();
        }
        ctx2d.shadowBlur = 0;
      }

      function drawCircle(dataArray, bufLen, w, h) {
        const cx = w / 2, cy = h / 2;
        const baseR = Math.min(w, h) * 0.2;
        const colors = getColors();

        // Inner glow
        let avg = 0;
        for (let i = 0; i < bufLen; i++) avg += dataArray[i];
        avg = avg / bufLen / 255;
        const grd = ctx2d.createRadialGradient(cx, cy, baseR * 0.2, cx, cy, baseR + avg * 80);
        grd.addColorStop(0, hexToRgba(colors[0], 0.3 * avg + 0.05));
        grd.addColorStop(1, 'transparent');
        ctx2d.fillStyle = grd;
        ctx2d.fillRect(0, 0, w, h);

        // Bars around circle
        for (let i = 0; i < bufLen; i++) {
          const angle = (i / bufLen) * Math.PI * 2 - Math.PI / 2;
          const v = dataArray[i] / 255;
          const barLen = v * baseR * 1.2;
          const x1 = cx + Math.cos(angle) * baseR;
          const y1 = cy + Math.sin(angle) * baseR;
          const x2 = cx + Math.cos(angle) * (baseR + barLen);
          const y2 = cy + Math.sin(angle) * (baseR + barLen);
          ctx2d.beginPath();
          ctx2d.moveTo(x1, y1);
          ctx2d.lineTo(x2, y2);
          ctx2d.strokeStyle = colorAt(i, bufLen);
          ctx2d.lineWidth = Math.max(1.5, (w / bufLen) * 0.8);
          ctx2d.shadowColor = colorAt(i, bufLen);
          ctx2d.shadowBlur = 6;
          ctx2d.stroke();
        }

        // Center circle
        ctx2d.beginPath();
        ctx2d.arc(cx, cy, baseR * 0.92, 0, Math.PI * 2);
        ctx2d.fillStyle = 'rgba(10,10,20,0.85)';
        ctx2d.fill();
        ctx2d.strokeStyle = hexToRgba(colors[0], 0.5);
        ctx2d.lineWidth = 2;
        ctx2d.stroke();
        ctx2d.shadowBlur = 0;
      }

      function drawParticles(dataArray, bufLen, w, h) {
        let avg = 0;
        for (let i = 0; i < bufLen; i++) avg += dataArray[i];
        avg = avg / bufLen / 255;

        const colors = getColors();
        // Spawn particles
        const spawnCount = Math.floor(avg * 6);
        for (let i = 0; i < spawnCount; i++) {
          particles.push({
            x: Math.random() * w,
            y: h + 5,
            vx: (Math.random() - 0.5) * 3,
            vy: -(Math.random() * 3 + 2 + avg * 5),
            r: Math.random() * 4 + 1.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1.0
          });
        }

        // Update & draw
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.03;
          p.life -= 0.012;
          if (p.life <= 0 || p.y < -10 || p.x < -10 || p.x > w + 10) {
            particles.splice(i, 1);
            continue;
          }
          ctx2d.beginPath();
          ctx2d.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
          ctx2d.fillStyle = hexToRgba(p.color, p.life * 0.85);
          ctx2d.shadowColor = p.color;
          ctx2d.shadowBlur = 8;
          ctx2d.fill();
        }
        if (particles.length > 600) particles.splice(0, particles.length - 600);
        ctx2d.shadowBlur = 0;
      }

      function drawSpectrum(dataArray, bufLen, w, h) {
        const colors = getColors();
        // Mirrored spectrum
        const half = Math.floor(bufLen / 2);
        ctx2d.lineWidth = 0;
        for (let i = 0; i < half; i++) {
          const v = dataArray[i] / 255;
          const barH = v * h * 0.85;
          const barW = w / half;
          const color = colorAt(i, half);
          // Right half
          ctx2d.fillStyle = hexToRgba(color, 0.8);
          ctx2d.fillRect(w / 2 + i * barW, h - barH, barW - 0.5, barH);
          // Left half (mirror)
          ctx2d.fillRect(w / 2 - (i + 1) * barW, h - barH, barW - 0.5, barH);
        }
        // Reflection effect
        ctx2d.save();
        ctx2d.globalAlpha = 0.15;
        ctx2d.scale(1, -1);
        ctx2d.translate(0, -h * 2);
        for (let i = 0; i < half; i++) {
          const v = dataArray[i] / 255;
          const barH = v * h * 0.3;
          const barW = w / half;
          const color = colorAt(i, half);
          ctx2d.fillStyle = color;
          ctx2d.fillRect(w / 2 + i * barW, h - barH, barW - 0.5, barH);
          ctx2d.fillRect(w / 2 - (i + 1) * barW, h - barH, barW - 0.5, barH);
        }
        ctx2d.restore();
      }

      function drawTerrain(dataArray, bufLen, w, h) {
        const colors = getColors();
        const layers = 5;
        for (let layer = 0; layer < layers; layer++) {
          const offset = layer * 0.12;
          ctx2d.beginPath();
          ctx2d.moveTo(0, h);
          for (let i = 0; i <= bufLen; i++) {
            const x = (i / bufLen) * w;
            const idx = Math.min(i, bufLen - 1);
            const v = dataArray[idx] / 255;
            const yBase = h - (h * 0.15 * (layer + 1));
            const y = yBase - v * h * 0.25 * (1 - offset);
            if (i === 0) ctx2d.lineTo(0, y);
            else ctx2d.lineTo(x, y);
          }
          ctx2d.lineTo(w, h);
          ctx2d.closePath();
          const color = colors[layer % colors.length];
          ctx2d.fillStyle = hexToRgba(color, 0.35 + layer * 0.08);
          ctx2d.fill();
          ctx2d.strokeStyle = hexToRgba(color, 0.5);
          ctx2d.lineWidth = 1;
          ctx2d.stroke();
        }
      }

      // ---- Main render loop ----
      function render() {
        if (!analyser || !ctx2d) return;
        const canvas = vizCanvas.value;
        if (!canvas) return;
        const w = canvas.width, h = canvas.height;

        // Background
        ctx2d.fillStyle = 'rgba(10, 10, 20, 0.25)';
        ctx2d.fillRect(0, 0, w, h);

        const bufLen = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufLen);
        analyser.getByteFrequencyData(dataArray);

        const mode = vizMode.value;
        if (mode === 'bars') drawBars(dataArray, bufLen, w, h);
        else if (mode === 'wave') drawWave(dataArray, bufLen, w, h);
        else if (mode === 'circle') drawCircle(dataArray, bufLen, w, h);
        else if (mode === 'particles') drawParticles(dataArray, bufLen, w, h);
        else if (mode === 'spectrum') drawSpectrum(dataArray, bufLen, w, h);
        else if (mode === 'terrain') drawTerrain(dataArray, bufLen, w, h);

        rafId = requestAnimationFrame(render);
      }

      function startRender() {
        cancelAnimationFrame(rafId);
        // Clear canvas fully before starting fresh
        if (ctx2d && vizCanvas.value) {
          ctx2d.clearRect(0, 0, vizCanvas.value.width, vizCanvas.value.height);
        }
        particles = [];
        rafId = requestAnimationFrame(render);
      }

      function stopRender() {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      // ---- Size handling ----
      function resizeCanvas() {
        const wrap = canvasWrap.value;
        const canvas = vizCanvas.value;
        if (!wrap || !canvas) return;
        canvas.width = wrap.clientWidth * (window.devicePixelRatio || 1);
        canvas.height = wrap.clientHeight * (window.devicePixelRatio || 1);
        canvas.style.width = wrap.clientWidth + 'px';
        canvas.style.height = wrap.clientHeight + 'px';
        ctx2d = canvas.getContext('2d');
      }

      // ---- Audio file loading ----
      function loadAudioElement(src, name) {
        ensureAudioContext();
        stopAudio();

        audio = new Audio();
        audio.crossOrigin = 'anonymous';
        audio.src = src;
        audio.volume = volume.value / 100;

        sourceNode = audioCtx.createMediaElementSource(audio);
        sourceNode.connect(analyser);

        audio.addEventListener('loadedmetadata', () => { duration.value = audio.duration || 0; });
        audio.addEventListener('ended', () => { isPlaying.value = false; stopRender(); });

        trackName.value = name || 'Unknown';
        hasSource.value = true;
        audio.play();
        isPlaying.value = true;
        startRender();
        updateTime();
      }

      function openFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'audio/*';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const url = URL.createObjectURL(file);
          loadAudioElement(url, file.name);
        };
        input.click();
      }

      function onDrop(e) {
        const file = e.dataTransfer.files[0];
        if (!file || !file.type.startsWith('audio/')) return;
        const url = URL.createObjectURL(file);
        loadAudioElement(url, file.name);
      }

      function loadUrl() {
        const url = audioUrl.value.trim();
        if (!url) return;
        loadAudioElement(url, url.split('/').pop() || 'Stream');
        showUrlInput.value = false;
      }

      // ---- Microphone ----
      async function toggleMic() {
        if (micActive.value) {
          stopMic();
          return;
        }
        try {
          ensureAudioContext();
          stopAudio();
          micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          sourceNode = audioCtx.createMediaStreamSource(micStream);
          sourceNode.connect(analyser);
          // Disconnect from destination to avoid feedback
          analyser.disconnect();
          analyser.connect(audioCtx.createGain()); // silent output
          micActive.value = true;
          hasSource.value = false;
          trackName.value = '';
          startRender();
        } catch (_e) {
          micActive.value = false;
        }
      }

      function stopMic() {
        if (micStream) {
          micStream.getTracks().forEach(t => t.stop());
          micStream = null;
        }
        if (sourceNode) { try { sourceNode.disconnect(); } catch(_e) {} sourceNode = null; }
        if (analyser && audioCtx) {
          try { analyser.disconnect(); } catch(_e) {}
          analyser.connect(audioCtx.destination);
        }
        micActive.value = false;
        stopRender();
      }

      // ---- Playback controls ----
      function togglePlay() {
        if (!audio) return;
        if (isPlaying.value) {
          audio.pause();
          isPlaying.value = false;
          stopRender();
        } else {
          audio.play();
          isPlaying.value = true;
          startRender();
          updateTime();
        }
      }

      function stop() {
        stopAudio();
      }

      function stopAudio() {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
          audio = null;
        }
        if (sourceNode && !micActive.value) { try { sourceNode.disconnect(); } catch(_e) {} sourceNode = null; }
        isPlaying.value = false;
        hasSource.value = false;
        elapsed.value = 0;
        duration.value = 0;
        trackName.value = '';
        stopRender();
      }

      let timeRaf = null;
      function updateTime() {
        if (!audio) return;
        elapsed.value = audio.currentTime || 0;
        if (isPlaying.value) timeRaf = requestAnimationFrame(updateTime);
      }

      function seek(e) {
        if (!audio || !duration.value) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        audio.currentTime = pct * duration.value;
        elapsed.value = audio.currentTime;
      }

      function formatTime(s) {
        if (!s || isNaN(s)) return '0:00';
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return m + ':' + (sec < 10 ? '0' : '') + sec;
      }

      // Volume watch
      watch(volume, (v) => { if (audio) audio.volume = v / 100; });

      // Mode change → clear particles & canvas
      watch(vizMode, () => {
        particles = [];
        if (ctx2d && vizCanvas.value) {
          ctx2d.clearRect(0, 0, vizCanvas.value.width, vizCanvas.value.height);
        }
      });

      function toggleFullscreen() {
        const el = canvasWrap.value;
        if (!el) return;
        if (!document.fullscreenElement) {
          el.requestFullscreen().then(() => { isFullscreen.value = true; nextTick(resizeCanvas); });
        } else {
          document.exitFullscreen().then(() => { isFullscreen.value = false; nextTick(resizeCanvas); });
        }
      }

      let resizeObserver = null;

      onMounted(() => {
        window.addEventListener('locale-changed', onLocaleChanged);
        nextTick(() => {
          resizeCanvas();
          resizeObserver = new ResizeObserver(() => resizeCanvas());
          if (canvasWrap.value) resizeObserver.observe(canvasWrap.value);
        });
        document.addEventListener('fullscreenchange', () => {
          isFullscreen.value = !!document.fullscreenElement;
          nextTick(resizeCanvas);
        });
      });

      onUnmounted(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
        stopAudio();
        stopMic();
        stopRender();
        cancelAnimationFrame(timeRaf);
        if (resizeObserver) resizeObserver.disconnect();
        if (audioCtx) { audioCtx.close(); audioCtx = null; }
      });

      return {
        locale, L,
        canvasWrap, vizCanvas,
        vizMode, vizModes, colorTheme, colorThemes,
        trackName, isPlaying, hasSource, micActive,
        volume, elapsed, duration, progressPct,
        isFullscreen, showUrlInput, audioUrl,
        openFile, onDrop, loadUrl,
        toggleMic, togglePlay, stop,
        seek, formatTime, toggleFullscreen
      };
    }
  };
})(Vue);
