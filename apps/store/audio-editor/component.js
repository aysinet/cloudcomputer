({
  setup() {
    const { ref, computed, onMounted, onUnmounted, watch, nextTick } = Vue;
    const ElMessageBox = (window.ElementPlus && window.ElementPlus.ElMessageBox) || { confirm: () => Promise.resolve() };
    const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success: console.log, error: console.error, warning: console.warn };

    // ── i18n ──
    const LANGS = {
      tr: {
        title:'Ses Düzenleyici', open:'Aç', export:'Dışa Aktar', cut:'Kes', copy:'Kopyala',
        paste:'Yapıştır', delete:'Sil', effects:'Efektler', apply:'Uygula',
        duration:'Süre', selection:'Seçim', cursor:'İmleç',
        loadAudio:'Ses dosyası yüklemek için tıklayın', openFile:'Dosya Aç',
        musicFiles:'Müzik Dosyaları', recordings:'Kayıtlar', browse:'Gözat',
        noFiles:'Dosya bulunamadı', cancel:'İptal',
        exportTitle:'WAV Dışa Aktar', filename:'Dosya Adı', saveLocation:'Kayıt Yeri',
        musicFolder:'Müzik Klasörü', recordingsFolder:'Kayıtlar Klasörü', downloadLocal:'Bilgisayara İndir',
        success:'Başarılı', error:'Hata', exported:'Dosya kaydedildi',
        loading:'Yükleniyor...', processing:'İşleniyor...', exporting:'Dışa aktarılıyor...',
        gainDb:'Kazanç (dB)', noSelection:'Lütfen bir bölge seçin',
        fx_gain:'Ses Kazancı', fx_fadeIn:'Fade In', fx_fadeOut:'Fade Out',
        fx_normalize:'Normalize', fx_reverse:'Ters Çevir', fx_silence:'Sessizlik',
        fx_amplify:'Yükselt', fx_invert:'Faz Ters Çevir',
        deleteConfirm:'Seçili bölgeyi silmek istediğinize emin misiniz?',
        undone:'Geri alındı', redone:'Yinelendi'
      },
      en: {
        title:'Audio Editor', open:'Open', export:'Export', cut:'Cut', copy:'Copy',
        paste:'Paste', delete:'Delete', effects:'Effects', apply:'Apply',
        duration:'Duration', selection:'Selection', cursor:'Cursor',
        loadAudio:'Click to load an audio file', openFile:'Open File',
        musicFiles:'Music Files', recordings:'Recordings', browse:'Browse',
        noFiles:'No files found', cancel:'Cancel',
        exportTitle:'Export WAV', filename:'File Name', saveLocation:'Save Location',
        musicFolder:'Music Folder', recordingsFolder:'Recordings Folder', downloadLocal:'Download to Computer',
        success:'Success', error:'Error', exported:'File saved',
        loading:'Loading...', processing:'Processing...', exporting:'Exporting...',
        gainDb:'Gain (dB)', noSelection:'Please select a region',
        fx_gain:'Gain', fx_fadeIn:'Fade In', fx_fadeOut:'Fade Out',
        fx_normalize:'Normalize', fx_reverse:'Reverse', fx_silence:'Silence',
        fx_amplify:'Amplify', fx_invert:'Invert Phase',
        deleteConfirm:'Are you sure you want to delete the selected region?',
        undone:'Undone', redone:'Redone'
      },
      de: {
        title:'Audio-Editor', open:'Öffnen', export:'Exportieren', cut:'Ausschneiden', copy:'Kopieren',
        paste:'Einfügen', delete:'Löschen', effects:'Effekte', apply:'Anwenden',
        duration:'Dauer', selection:'Auswahl', cursor:'Cursor',
        loadAudio:'Klicken um Audiodatei zu laden', openFile:'Datei öffnen',
        musicFiles:'Musikdateien', recordings:'Aufnahmen', browse:'Durchsuchen',
        noFiles:'Keine Dateien gefunden', cancel:'Abbrechen',
        exportTitle:'WAV exportieren', filename:'Dateiname', saveLocation:'Speicherort',
        musicFolder:'Musikordner', recordingsFolder:'Aufnahmenordner', downloadLocal:'Auf Computer herunterladen',
        success:'Erfolgreich', error:'Fehler', exported:'Datei gespeichert',
        loading:'Laden...', processing:'Verarbeitung...', exporting:'Exportieren...',
        gainDb:'Verstärkung (dB)', noSelection:'Bitte wählen Sie einen Bereich',
        fx_gain:'Verstärkung', fx_fadeIn:'Einblenden', fx_fadeOut:'Ausblenden',
        fx_normalize:'Normalisieren', fx_reverse:'Umkehren', fx_silence:'Stille',
        fx_amplify:'Verstärken', fx_invert:'Phase umkehren',
        deleteConfirm:'Möchten Sie den ausgewählten Bereich wirklich löschen?',
        undone:'Rückgängig', redone:'Wiederholt'
      },
      fr: {
        title:'Éditeur Audio', open:'Ouvrir', export:'Exporter', cut:'Couper', copy:'Copier',
        paste:'Coller', delete:'Supprimer', effects:'Effets', apply:'Appliquer',
        duration:'Durée', selection:'Sélection', cursor:'Curseur',
        loadAudio:'Cliquez pour charger un fichier audio', openFile:'Ouvrir un fichier',
        musicFiles:'Fichiers musique', recordings:'Enregistrements', browse:'Parcourir',
        noFiles:'Aucun fichier trouvé', cancel:'Annuler',
        exportTitle:'Exporter WAV', filename:'Nom du fichier', saveLocation:'Emplacement',
        musicFolder:'Dossier Musique', recordingsFolder:'Dossier Enregistrements', downloadLocal:'Télécharger sur l\'ordinateur',
        success:'Succès', error:'Erreur', exported:'Fichier enregistré',
        loading:'Chargement...', processing:'Traitement...', exporting:'Exportation...',
        gainDb:'Gain (dB)', noSelection:'Veuillez sélectionner une région',
        fx_gain:'Gain', fx_fadeIn:'Fondu d\'entrée', fx_fadeOut:'Fondu de sortie',
        fx_normalize:'Normaliser', fx_reverse:'Inverser', fx_silence:'Silence',
        fx_amplify:'Amplifier', fx_invert:'Inverser la phase',
        deleteConfirm:'Êtes-vous sûr de vouloir supprimer la région sélectionnée ?',
        undone:'Annulé', redone:'Refait'
      },
      es: {
        title:'Editor de Audio', open:'Abrir', export:'Exportar', cut:'Cortar', copy:'Copiar',
        paste:'Pegar', delete:'Eliminar', effects:'Efectos', apply:'Aplicar',
        duration:'Duración', selection:'Selección', cursor:'Cursor',
        loadAudio:'Haga clic para cargar un archivo de audio', openFile:'Abrir archivo',
        musicFiles:'Archivos de música', recordings:'Grabaciones', browse:'Explorar',
        noFiles:'No se encontraron archivos', cancel:'Cancelar',
        exportTitle:'Exportar WAV', filename:'Nombre del archivo', saveLocation:'Ubicación',
        musicFolder:'Carpeta de Música', recordingsFolder:'Carpeta de Grabaciones', downloadLocal:'Descargar al ordenador',
        success:'Éxito', error:'Error', exported:'Archivo guardado',
        loading:'Cargando...', processing:'Procesando...', exporting:'Exportando...',
        gainDb:'Ganancia (dB)', noSelection:'Seleccione una región',
        fx_gain:'Ganancia', fx_fadeIn:'Fundido de entrada', fx_fadeOut:'Fundido de salida',
        fx_normalize:'Normalizar', fx_reverse:'Invertir', fx_silence:'Silencio',
        fx_amplify:'Amplificar', fx_invert:'Invertir fase',
        deleteConfirm:'¿Estás seguro de que deseas eliminar la región seleccionada?',
        undone:'Deshecho', redone:'Rehecho'
      },
      ru: {
        title:'Аудиоредактор', open:'Открыть', export:'Экспорт', cut:'Вырезать', copy:'Копировать',
        paste:'Вставить', delete:'Удалить', effects:'Эффекты', apply:'Применить',
        duration:'Длительность', selection:'Выделение', cursor:'Курсор',
        loadAudio:'Нажмите для загрузки аудиофайла', openFile:'Открыть файл',
        musicFiles:'Музыкальные файлы', recordings:'Записи', browse:'Обзор',
        noFiles:'Файлы не найдены', cancel:'Отмена',
        exportTitle:'Экспорт WAV', filename:'Имя файла', saveLocation:'Место сохранения',
        musicFolder:'Папка Музыки', recordingsFolder:'Папка Записей', downloadLocal:'Скачать на компьютер',
        success:'Успешно', error:'Ошибка', exported:'Файл сохранён',
        loading:'Загрузка...', processing:'Обработка...', exporting:'Экспорт...',
        gainDb:'Усиление (дБ)', noSelection:'Выберите область',
        fx_gain:'Усиление', fx_fadeIn:'Нарастание', fx_fadeOut:'Затухание',
        fx_normalize:'Нормализация', fx_reverse:'Реверс', fx_silence:'Тишина',
        fx_amplify:'Усилить', fx_invert:'Инверсия фазы',
        deleteConfirm:'Вы уверены, что хотите удалить выделенную область?',
        undone:'Отменено', redone:'Повторено'
      }
    };

    function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }
    const locale = ref(getLocale());
    function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
    function getToken() { try { return localStorage.getItem('auth_token') || ''; } catch { return ''; } }
    function authHeaders() { return { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }
    function authHeadersRaw() { return { 'Authorization': 'Bearer ' + getToken() }; }

    // ── State ──
    const waveCanvas = ref(null);
    const waveWrap = ref(null);
    const busy = ref(false);
    const busyText = ref('');
    const statusMsg = ref('');
    const statusType = ref('');
    const volume = ref(80);

    // Audio data
    let audioCtx = null;
    let audioBuffer = null;
    let sourceNode = null;
    let gainNode = null;
    const hasAudio = ref(false);
    const audioDuration = ref(0);
    const sampleRate = ref(44100);
    const channels = ref(1);
    const isPlaying = ref(false);
    let playStartTime = 0;
    let playOffset = 0;
    let animFrame = null;

    // Selection
    const selectionStart = ref(0);
    const selectionEnd = ref(0);
    const cursorPos = ref(0);
    const hasSelection = computed(() => hasAudio.value && selectionStart.value !== selectionEnd.value);
    let isDragging = false;
    let dragStart = 0;

    // Zoom & scroll
    let zoom = 1;
    let scrollOffset = 0;

    // Clipboard & undo
    const clipboardBuffer = ref(null);
    const undoStack = ref([]);
    const redoStack = ref([]);
    const canUndo = computed(() => undoStack.value.length > 0);
    const canRedo = computed(() => redoStack.value.length > 0);

    // Effects
    const effectList = ['gain', 'fadeIn', 'fadeOut', 'normalize', 'reverse', 'silence', 'invert'];
    const selectedEffect = ref('');
    const showGainDialog = ref(false);
    const gainDb = ref(0);

    // File picker
    const showFilePicker = ref(false);
    const fpTab = ref('music');
    const fpFiles = ref([]);

    // Export
    const showExportDialog = ref(false);
    const exportFilename = ref('edited_audio.wav');
    const exportLocation = ref('music');

    let localeTimer = null;

    function showStatus(msg, type) {
      statusMsg.value = msg; statusType.value = type;
      setTimeout(() => { statusMsg.value = ''; }, 4000);
    }

    function formatTime(sec) {
      if (!sec || isNaN(sec)) return '0:00.0';
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return m + ':' + s.toFixed(1).padStart(4, '0');
    }

    function formatSize(bytes) {
      if (!bytes) return '';
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / 1048576).toFixed(1) + ' MB';
    }

    // ── Audio Buffer Management ──
    function setAudioBuffer(buf) {
      audioBuffer = buf;
      hasAudio.value = true;
      audioDuration.value = buf.duration;
      sampleRate.value = buf.sampleRate;
      channels.value = buf.numberOfChannels;
      selectionStart.value = 0;
      selectionEnd.value = 0;
      cursorPos.value = 0;
      zoom = 1;
      scrollOffset = 0;
      drawWaveform();
    }

    function pushUndo() {
      const chData = [];
      for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
        chData.push(new Float32Array(audioBuffer.getChannelData(c)));
      }
      undoStack.value.push({ chData, sr: audioBuffer.sampleRate, ch: audioBuffer.numberOfChannels });
      if (undoStack.value.length > 30) undoStack.value.shift();
      redoStack.value = [];
    }

    function undo() {
      if (!undoStack.value.length) return;
      // Save current to redo
      const chNow = [];
      for (let c = 0; c < audioBuffer.numberOfChannels; c++) chNow.push(new Float32Array(audioBuffer.getChannelData(c)));
      redoStack.value.push({ chData: chNow, sr: audioBuffer.sampleRate, ch: audioBuffer.numberOfChannels });
      const state = undoStack.value.pop();
      restoreState(state);
      ElMessage.success(L('undone'));
    }

    function redo() {
      if (!redoStack.value.length) return;
      const chNow = [];
      for (let c = 0; c < audioBuffer.numberOfChannels; c++) chNow.push(new Float32Array(audioBuffer.getChannelData(c)));
      undoStack.value.push({ chData: chNow, sr: audioBuffer.sampleRate, ch: audioBuffer.numberOfChannels });
      const state = redoStack.value.pop();
      restoreState(state);
      ElMessage.success(L('redone'));
    }

    function restoreState(state) {
      if (isPlaying.value) stopPlay();
      const ctx = getAudioCtx();
      const newBuf = ctx.createBuffer(state.ch, state.chData[0].length, state.sr);
      for (let c = 0; c < state.ch; c++) newBuf.getChannelData(c).set(state.chData[c]);
      setAudioBuffer(newBuf);
    }

    function getAudioCtx() {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      return audioCtx;
    }

    // ── File Loading ──
    async function loadFromUrl(url, name) {
      showFilePicker.value = false;
      busy.value = true;
      busyText.value = L('loading');
      try {
        let arrayBuf;
        if (url.startsWith('__fs__:')) {
          // Load via filesystem read-binary (returns base64 JSON)
          const fsPath = url.slice(7);
          const resp = await fetch('/api/fs/read-binary?path=' + encodeURIComponent(fsPath), { headers: authHeaders() });
          if (!resp.ok) throw new Error('Failed to fetch');
          const data = await resp.json();
          const binary = atob(data.content);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          arrayBuf = bytes.buffer;
        } else {
          const resp = await fetch(url, { headers: authHeadersRaw() });
          if (!resp.ok) throw new Error('Failed to fetch');
          arrayBuf = await resp.arrayBuffer();
        }
        const ctx = getAudioCtx();
        const decoded = await ctx.decodeAudioData(arrayBuf);
        undoStack.value = [];
        redoStack.value = [];
        setAudioBuffer(decoded);
        exportFilename.value = (name || 'audio').replace(/\.[^.]+$/, '') + '_edited.wav';
      } catch (e) {
        showStatus(e.message || L('error'), 'error');
      } finally {
        busy.value = false;
      }
    }

    function openFilePicker() {
      showFilePicker.value = true;
      fpTab.value = 'music';
      loadMusicFiles();
    }

    async function loadMusicFiles() {
      fpFiles.value = [];
      try {
        const r = await fetch('/api/music/files', { headers: authHeaders() });
        if (!r.ok) return;
        const data = await r.json();
        const all = [
          ...(data.public || []).map(f => ({ ...f, icon: '🎵' })),
          ...(data.user || []).map(f => ({ ...f, icon: '🎵' }))
        ];
        fpFiles.value = all.filter(f => ['.wav','.mp3','.ogg','.flac','.aac','.m4a','.webm'].includes(f.ext));
      } catch {}
    }

    async function loadRecordings() {
      fpFiles.value = [];
      try {
        const r = await fetch('/api/audio-recorder/list', { headers: authHeaders() });
        if (!r.ok) return;
        const list = await r.json();
        fpFiles.value = list.map(f => ({
          filename: f.filename, size: f.size, icon: '🎙️',
          url: '/api/audio-recorder/stream/' + encodeURIComponent(f.filename)
        }));
      } catch {}
    }

    async function loadFsDir() {
      fpFiles.value = [];
      try {
        const r = await fetch('/api/fs/list?path=', { headers: authHeaders() });
        if (!r.ok) return;
        const list = await r.json();
        const audioExts = ['.wav','.mp3','.ogg','.flac','.aac','.m4a','.webm'];
        fpFiles.value = list
          .filter(f => !f.isDir && audioExts.includes((f.ext || '').toLowerCase()))
          .map(f => ({
            filename: f.name, name: f.name, size: f.size, icon: '📄',
            url: '__fs__:' + f.path
          }));
      } catch {}
    }

    // ── Waveform Drawing ──
    function drawWaveform() {
      const canvas = waveCanvas.value;
      if (!canvas || !audioBuffer) return;
      const wrap = waveWrap.value;
      canvas.width = wrap ? wrap.clientWidth : 780;
      canvas.height = wrap ? wrap.clientHeight : 220;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      const data = audioBuffer.getChannelData(0);
      const totalSamples = data.length;
      const visibleSamples = Math.floor(totalSamples / zoom);
      const startSamp = Math.floor(scrollOffset);
      const endSamp = Math.min(startSamp + visibleSamples, totalSamples);

      // Background
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const y = (h / 4) * i;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      // Center line
      ctx.strokeStyle = '#2a2a4e';
      ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();

      // Time markers
      ctx.fillStyle = '#444';
      ctx.font = '10px monospace';
      const secPerPixel = (endSamp - startSamp) / sampleRate.value / w;
      const markerInterval = secPerPixel < 0.001 ? 0.1 : secPerPixel < 0.01 ? 1 : secPerPixel < 0.1 ? 5 : 30;
      const startSec = startSamp / sampleRate.value;
      const firstMark = Math.ceil(startSec / markerInterval) * markerInterval;
      for (let t = firstMark; t < (endSamp / sampleRate.value); t += markerInterval) {
        const x = ((t * sampleRate.value) - startSamp) / (endSamp - startSamp) * w;
        ctx.fillText(formatTime(t), x + 2, 12);
        ctx.strokeStyle = '#1e1e3a';
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }

      // Selection highlight
      if (selectionStart.value !== selectionEnd.value) {
        const selS = Math.max(selectionStart.value, startSamp);
        const selE = Math.min(selectionEnd.value, endSamp);
        if (selE > selS) {
          const x1 = ((selS - startSamp) / (endSamp - startSamp)) * w;
          const x2 = ((selE - startSamp) / (endSamp - startSamp)) * w;
          ctx.fillStyle = 'rgba(100, 130, 255, 0.2)';
          ctx.fillRect(x1, 0, x2 - x1, h);
          ctx.strokeStyle = 'rgba(100, 130, 255, 0.6)';
          ctx.beginPath(); ctx.moveTo(x1, 0); ctx.lineTo(x1, h); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x2, 0); ctx.lineTo(x2, h); ctx.stroke();
        }
      }

      // Waveform
      const step = Math.max(1, Math.floor((endSamp - startSamp) / w));
      ctx.beginPath();
      ctx.strokeStyle = '#4fc3f7';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x++) {
        const idx = startSamp + Math.floor(x * (endSamp - startSamp) / w);
        let min = 1, max = -1;
        for (let j = 0; j < step && (idx + j) < totalSamples; j++) {
          const v = data[idx + j];
          if (v < min) min = v;
          if (v > max) max = v;
        }
        const y1 = (1 - max) * h / 2;
        const y2 = (1 - min) * h / 2;
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
      }
      ctx.stroke();

      // Cursor
      if (cursorPos.value >= startSamp && cursorPos.value <= endSamp) {
        const cx = ((cursorPos.value - startSamp) / (endSamp - startSamp)) * w;
        ctx.strokeStyle = '#ff5252';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
      }
    }

    // ── Waveform Interaction ──
    function pixelToSample(px) {
      if (!audioBuffer) return 0;
      const canvas = waveCanvas.value;
      if (!canvas) return 0;
      const totalSamples = audioBuffer.length;
      const visibleSamples = Math.floor(totalSamples / zoom);
      const startSamp = Math.floor(scrollOffset);
      const sample = startSamp + Math.floor((px / canvas.width) * visibleSamples);
      return Math.max(0, Math.min(sample, totalSamples));
    }

    function onWaveMouseDown(e) {
      if (!hasAudio.value) return;
      const rect = waveCanvas.value.getBoundingClientRect();
      const px = e.clientX - rect.left;
      dragStart = pixelToSample(px);
      isDragging = true;
      selectionStart.value = dragStart;
      selectionEnd.value = dragStart;
      cursorPos.value = dragStart;
      drawWaveform();
    }

    function onWaveMouseMove(e) {
      if (!isDragging || !hasAudio.value) return;
      const rect = waveCanvas.value.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const sample = pixelToSample(px);
      if (sample < dragStart) {
        selectionStart.value = sample;
        selectionEnd.value = dragStart;
      } else {
        selectionStart.value = dragStart;
        selectionEnd.value = sample;
      }
      cursorPos.value = sample;
      drawWaveform();
    }

    function onWaveMouseUp() { isDragging = false; }

    function selectAll() {
      if (!hasAudio.value) return;
      selectionStart.value = 0;
      selectionEnd.value = audioBuffer.length;
      drawWaveform();
    }

    // ── Zoom ──
    function zoomIn() { zoom = Math.min(zoom * 1.5, 100); drawWaveform(); }
    function zoomOut() { zoom = Math.max(zoom / 1.5, 1); scrollOffset = Math.max(0, scrollOffset); drawWaveform(); }
    function zoomFit() { zoom = 1; scrollOffset = 0; drawWaveform(); }

    // ── Playback ──
    function togglePlay() {
      if (isPlaying.value) stopPlay();
      else startPlay();
    }

    function startPlay() {
      if (!audioBuffer) return;
      const ctx = getAudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      sourceNode = ctx.createBufferSource();
      sourceNode.buffer = audioBuffer;
      gainNode = ctx.createGain();
      gainNode.gain.value = volume.value / 100;
      sourceNode.connect(gainNode);
      gainNode.connect(ctx.destination);

      const startSample = hasSelection.value ? selectionStart.value : cursorPos.value;
      playOffset = startSample / sampleRate.value;
      const endTime = hasSelection.value ? selectionEnd.value / sampleRate.value : audioDuration.value;
      const duration = endTime - playOffset;

      sourceNode.start(0, playOffset, duration);
      playStartTime = ctx.currentTime;
      isPlaying.value = true;

      sourceNode.onended = () => { isPlaying.value = false; cancelAnimationFrame(animFrame); };
      animatePlayCursor();
    }

    function stopPlay() {
      if (sourceNode) { try { sourceNode.stop(); } catch {} sourceNode = null; }
      isPlaying.value = false;
      if (animFrame) cancelAnimationFrame(animFrame);
    }

    function animatePlayCursor() {
      if (!isPlaying.value) return;
      const ctx = getAudioCtx();
      const elapsed = ctx.currentTime - playStartTime;
      cursorPos.value = Math.floor((playOffset + elapsed) * sampleRate.value);
      drawWaveform();
      animFrame = requestAnimationFrame(animatePlayCursor);
    }

    function skipToStart() { cursorPos.value = 0; selectionStart.value = 0; selectionEnd.value = 0; drawWaveform(); }
    function skipToEnd() { if (audioBuffer) { cursorPos.value = audioBuffer.length; drawWaveform(); } }

    watch(volume, (v) => { if (gainNode) gainNode.gain.value = v / 100; });

    // ── Edit Operations ──
    function getSelectionRange() {
      const s = Math.min(selectionStart.value, selectionEnd.value);
      const e = Math.max(selectionStart.value, selectionEnd.value);
      return { start: s, end: e };
    }

    function buildNewBuffer(channelArrays, sr) {
      const ctx = getAudioCtx();
      const len = channelArrays[0].length;
      const newBuf = ctx.createBuffer(channelArrays.length, len, sr);
      for (let c = 0; c < channelArrays.length; c++) newBuf.getChannelData(c).set(channelArrays[c]);
      return newBuf;
    }

    function cutSelection() {
      if (!hasSelection.value) return;
      pushUndo();
      const { start, end } = getSelectionRange();
      // Copy to clipboard
      const clipCh = [];
      for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
        clipCh.push(audioBuffer.getChannelData(c).slice(start, end));
      }
      clipboardBuffer.value = { channels: clipCh, sr: audioBuffer.sampleRate };
      // Remove selection
      removeRange(start, end);
    }

    function copySelection() {
      if (!hasSelection.value) return;
      const { start, end } = getSelectionRange();
      const clipCh = [];
      for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
        clipCh.push(audioBuffer.getChannelData(c).slice(start, end));
      }
      clipboardBuffer.value = { channels: clipCh, sr: audioBuffer.sampleRate };
      ElMessage.success(L('copy') + ' ✓');
    }

    function pasteClipboard() {
      if (!clipboardBuffer.value || !audioBuffer) return;
      pushUndo();
      if (isPlaying.value) stopPlay();
      const pos = cursorPos.value;
      const clip = clipboardBuffer.value;
      const newCh = [];
      for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
        const orig = audioBuffer.getChannelData(c);
        const ins = clip.channels[Math.min(c, clip.channels.length - 1)];
        const arr = new Float32Array(orig.length + ins.length);
        arr.set(orig.subarray(0, pos), 0);
        arr.set(ins, pos);
        arr.set(orig.subarray(pos), pos + ins.length);
        newCh.push(arr);
      }
      setAudioBuffer(buildNewBuffer(newCh, audioBuffer.sampleRate));
      cursorPos.value = pos + clip.channels[0].length;
      drawWaveform();
    }

    async function deleteSelection() {
      if (!hasSelection.value) return;
      try { await ElMessageBox.confirm(L('deleteConfirm'), { confirmButtonText: 'OK', cancelButtonText: L('cancel'), type: 'warning' }); } catch { return; }
      pushUndo();
      const { start, end } = getSelectionRange();
      removeRange(start, end);
    }

    function removeRange(start, end) {
      if (isPlaying.value) stopPlay();
      const newCh = [];
      for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
        const orig = audioBuffer.getChannelData(c);
        const arr = new Float32Array(orig.length - (end - start));
        arr.set(orig.subarray(0, start), 0);
        arr.set(orig.subarray(end), start);
        newCh.push(arr);
      }
      setAudioBuffer(buildNewBuffer(newCh, audioBuffer.sampleRate));
      selectionStart.value = start;
      selectionEnd.value = start;
      cursorPos.value = start;
      drawWaveform();
    }

    // ── Effects ──
    function applyEffect() {
      if (!hasAudio.value || !selectedEffect.value) return;
      if (selectedEffect.value === 'gain') {
        showGainDialog.value = true;
        gainDb.value = 0;
        return;
      }
      const needsSel = ['fadeIn', 'fadeOut', 'silence', 'invert'];
      if (needsSel.includes(selectedEffect.value)) {
        if (!hasSelection.value) {
          selectionStart.value = 0;
          selectionEnd.value = audioBuffer.length;
        }
      }
      pushUndo();
      const { start, end } = hasSelection.value ? getSelectionRange() : { start: 0, end: audioBuffer.length };
      if (isPlaying.value) stopPlay();

      switch (selectedEffect.value) {
        case 'fadeIn': applyFadeIn(start, end); break;
        case 'fadeOut': applyFadeOut(start, end); break;
        case 'normalize': applyNormalize(start, end); break;
        case 'reverse': applyReverse(start, end); break;
        case 'silence': applySilence(start, end); break;
        case 'invert': applyInvert(start, end); break;
      }
      drawWaveform();
    }

    function confirmGain() {
      showGainDialog.value = false;
      if (!hasSelection.value) { selectionStart.value = 0; selectionEnd.value = audioBuffer.length; }
      pushUndo();
      const { start, end } = getSelectionRange();
      if (isPlaying.value) stopPlay();
      const factor = Math.pow(10, gainDb.value / 20);
      for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
        const d = audioBuffer.getChannelData(c);
        for (let i = start; i < end; i++) d[i] = Math.max(-1, Math.min(1, d[i] * factor));
      }
      drawWaveform();
    }

    function applyFadeIn(start, end) {
      const len = end - start;
      for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
        const d = audioBuffer.getChannelData(c);
        for (let i = 0; i < len; i++) d[start + i] *= i / len;
      }
    }

    function applyFadeOut(start, end) {
      const len = end - start;
      for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
        const d = audioBuffer.getChannelData(c);
        for (let i = 0; i < len; i++) d[start + i] *= 1 - (i / len);
      }
    }

    function applyNormalize(start, end) {
      let peak = 0;
      for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
        const d = audioBuffer.getChannelData(c);
        for (let i = start; i < end; i++) { const a = Math.abs(d[i]); if (a > peak) peak = a; }
      }
      if (peak === 0 || peak >= 1) return;
      const factor = 1 / peak;
      for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
        const d = audioBuffer.getChannelData(c);
        for (let i = start; i < end; i++) d[i] *= factor;
      }
    }

    function applyReverse(start, end) {
      for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
        const d = audioBuffer.getChannelData(c);
        const seg = d.slice(start, end);
        seg.reverse();
        d.set(seg, start);
      }
    }

    function applySilence(start, end) {
      for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
        const d = audioBuffer.getChannelData(c);
        for (let i = start; i < end; i++) d[i] = 0;
      }
    }

    function applyInvert(start, end) {
      for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
        const d = audioBuffer.getChannelData(c);
        for (let i = start; i < end; i++) d[i] = -d[i];
      }
    }

    // ── Export ──
    function exportWav() {
      exportFilename.value = exportFilename.value || 'edited_audio.wav';
      showExportDialog.value = true;
    }

    function audioBufferToWav(buffer) {
      const numCh = buffer.numberOfChannels;
      const sr = buffer.sampleRate;
      const bitsPerSample = 16;
      const length = buffer.length;
      const byteRate = sr * numCh * bitsPerSample / 8;
      const blockAlign = numCh * bitsPerSample / 8;
      const dataSize = length * blockAlign;
      const buf = new ArrayBuffer(44 + dataSize);
      const view = new DataView(buf);

      function writeStr(off, str) { for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i)); }
      writeStr(0, 'RIFF');
      view.setUint32(4, 36 + dataSize, true);
      writeStr(8, 'WAVE');
      writeStr(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numCh, true);
      view.setUint32(24, sr, true);
      view.setUint32(28, byteRate, true);
      view.setUint16(32, blockAlign, true);
      view.setUint16(34, bitsPerSample, true);
      writeStr(36, 'data');
      view.setUint32(40, dataSize, true);

      let offset = 44;
      const channels = [];
      for (let c = 0; c < numCh; c++) channels.push(buffer.getChannelData(c));
      for (let i = 0; i < length; i++) {
        for (let c = 0; c < numCh; c++) {
          const s = Math.max(-1, Math.min(1, channels[c][i]));
          view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
          offset += 2;
        }
      }
      return new Blob([buf], { type: 'audio/wav' });
    }

    async function confirmExport() {
      if (!audioBuffer) return;
      busy.value = true;
      busyText.value = L('exporting');
      showExportDialog.value = false;
      try {
        const wavBlob = audioBufferToWav(audioBuffer);
        const fname = exportFilename.value.trim() || 'edited_audio.wav';
        const finalName = fname.endsWith('.wav') ? fname : fname + '.wav';

        if (exportLocation.value === 'download') {
          const url = URL.createObjectURL(wavBlob);
          const a = document.createElement('a');
          a.href = url; a.download = finalName; a.click();
          URL.revokeObjectURL(url);
          showStatus(L('exported'), 'success');
        } else {
          const endpoint = exportLocation.value === 'recordings'
            ? '/api/audio-editor/save-recording'
            : '/api/audio-editor/save-music';
          const formData = new FormData();
          formData.append('file', wavBlob, finalName);
          const r = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + getToken() },
            body: formData
          });
          if (r.ok) showStatus(L('exported') + ' — ' + finalName, 'success');
          else { const d = await r.json(); showStatus(d.error || L('error'), 'error'); }
        }
      } catch (e) {
        showStatus(e.message || L('error'), 'error');
      } finally {
        busy.value = false;
      }
    }

    // ── Window resize handling ──
    function onResize() { if (hasAudio.value) drawWaveform(); }

    // ── Keyboard shortcuts ──
    function onKeydown(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
      else if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
      else if (e.ctrlKey && e.key === 'x') { e.preventDefault(); cutSelection(); }
      else if (e.ctrlKey && e.key === 'c') { e.preventDefault(); copySelection(); }
      else if (e.ctrlKey && e.key === 'v') { e.preventDefault(); pasteClipboard(); }
      else if (e.ctrlKey && e.key === 'a') { e.preventDefault(); selectAll(); }
      else if (e.key === ' ') { e.preventDefault(); togglePlay(); }
      else if (e.key === 'Home') { e.preventDefault(); skipToStart(); }
      else if (e.key === 'End') { e.preventDefault(); skipToEnd(); }
      else if (e.key === 'Delete' && hasSelection.value) { e.preventDefault(); deleteSelection(); }
    }

    // ── Scroll/zoom via wheel ──
    function onWheel(e) {
      if (!hasAudio.value || !audioBuffer) return;
      e.preventDefault();
      if (e.ctrlKey) {
        // Zoom
        if (e.deltaY < 0) zoomIn(); else zoomOut();
      } else {
        // Scroll
        const totalSamples = audioBuffer.length;
        const step = Math.floor(totalSamples / zoom / 10);
        scrollOffset = Math.max(0, Math.min(scrollOffset + (e.deltaY > 0 ? step : -step), totalSamples - totalSamples / zoom));
        drawWaveform();
      }
    }

    onMounted(() => {
      localeTimer = setInterval(() => { locale.value = getLocale(); }, 1000);
      window.addEventListener('resize', onResize);
      nextTick(() => {
        if (waveCanvas.value) {
          drawWaveform();
          waveCanvas.value.addEventListener('wheel', onWheel, { passive: false });
        }
        // Keyboard shortcuts scoped to the app container
        const appEl = waveWrap.value && waveWrap.value.closest('.aed-app');
        if (appEl) appEl.addEventListener('keydown', onKeydown);
      });
    });

    onUnmounted(() => {
      if (localeTimer) clearInterval(localeTimer);
      if (isPlaying.value) stopPlay();
      if (audioCtx) { audioCtx.close(); audioCtx = null; }
      window.removeEventListener('resize', onResize);
      if (animFrame) cancelAnimationFrame(animFrame);
    });

    return {
      waveCanvas, waveWrap, busy, busyText, statusMsg, statusType, volume,
      hasAudio, audioDuration, sampleRate, channels, isPlaying,
      selectionStart, selectionEnd, cursorPos, hasSelection,
      clipboardBuffer, canUndo, canRedo,
      effectList, selectedEffect, showGainDialog, gainDb,
      showFilePicker, fpTab, fpFiles,
      showExportDialog, exportFilename, exportLocation,
      L, formatTime, formatSize,
      openFilePicker, loadFromUrl, loadMusicFiles, loadRecordings, loadFsDir,
      undo, redo, cutSelection, copySelection, pasteClipboard, deleteSelection,
      applyEffect, confirmGain, exportWav, confirmExport,
      togglePlay, skipToStart, skipToEnd, selectAll,
      onWaveMouseDown, onWaveMouseMove, onWaveMouseUp,
      zoomIn, zoomOut, zoomFit
    };
  }
})
