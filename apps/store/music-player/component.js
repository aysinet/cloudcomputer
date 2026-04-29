(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, watch, nextTick } = Vue;
  const { useVolumeStore } = window.__volumeStore || {};

  const LANGS = {
    tr: { loading:'Yükleniyor...', selectTrack:'Parça seçin', prev:'Önceki', next:'Sonraki', visualizer:'Görselleştirici', urlPlaceholder:'Ses URL\'si yapıştır (mp3, wav, ogg...)', add:'+ Ekle', playlist:'Çalma Listesi', myLists:'Listelerim', files:'Dosyalar', save:'Kaydet', emptyPlaylist:'Çalma listesi boş', addFromFiles:'Dosyalar sekmesinden parça ekleyin', newListPlaceholder:'Yeni liste adı...', create:'Oluştur', noSavedLists:'Kayıtlı çalma listesi yok', tracks:'parça', emptyList:'Boş liste', publicMusic:'Ortak Müzikler', myFiles:'Dosyalarım', noPublic:'Ortak müzik dosyası yok', noUser:'Henüz dosya yüklenmedi', uploading:'Yükleniyor...', upload:'Yükle', up:'Yukarı', down:'Aşağı', remove:'Çıkar', load:'Yükle', rename:'Yeniden adlandır', delete:'Sil', urlTrack:'URL Parça' },
    en: { loading:'Loading...', selectTrack:'Select a track', prev:'Previous', next:'Next', visualizer:'Visualizer', urlPlaceholder:'Paste audio URL (mp3, wav, ogg...)', add:'+ Add', playlist:'Playlist', myLists:'My Lists', files:'Files', save:'Save', emptyPlaylist:'Playlist is empty', addFromFiles:'Add tracks from Files tab', newListPlaceholder:'New list name...', create:'Create', noSavedLists:'No saved playlists', tracks:'tracks', emptyList:'Empty list', publicMusic:'Public Music', myFiles:'My Files', noPublic:'No public music files', noUser:'No files uploaded yet', uploading:'Uploading...', upload:'Upload', up:'Up', down:'Down', remove:'Remove', load:'Load', rename:'Rename', delete:'Delete', urlTrack:'URL Track' },
    de: { loading:'Laden...', selectTrack:'Titel auswählen', prev:'Vorheriger', next:'Nächster', visualizer:'Visualisierung', urlPlaceholder:'Audio-URL einfügen (mp3, wav, ogg...)', add:'+ Hinzufügen', playlist:'Wiedergabeliste', myLists:'Meine Listen', files:'Dateien', save:'Speichern', emptyPlaylist:'Wiedergabeliste ist leer', addFromFiles:'Titel aus Dateien hinzufügen', newListPlaceholder:'Neuer Listenname...', create:'Erstellen', noSavedLists:'Keine gespeicherten Listen', tracks:'Titel', emptyList:'Leere Liste', publicMusic:'Öffentliche Musik', myFiles:'Meine Dateien', noPublic:'Keine öffentliche Musik', noUser:'Noch keine Dateien', uploading:'Wird hochgeladen...', upload:'Hochladen', up:'Hoch', down:'Runter', remove:'Entfernen', load:'Laden', rename:'Umbenennen', delete:'Löschen', urlTrack:'URL-Titel' },
    fr: { loading:'Chargement...', selectTrack:'Sélectionner un morceau', prev:'Précédent', next:'Suivant', visualizer:'Visualiseur', urlPlaceholder:'Coller l\'URL audio (mp3, wav, ogg...)', add:'+ Ajouter', playlist:'Playlist', myLists:'Mes listes', files:'Fichiers', save:'Enregistrer', emptyPlaylist:'Playlist vide', addFromFiles:'Ajoutez des morceaux depuis Fichiers', newListPlaceholder:'Nom de la liste...', create:'Créer', noSavedLists:'Aucune playlist sauvegardée', tracks:'morceaux', emptyList:'Liste vide', publicMusic:'Musique publique', myFiles:'Mes fichiers', noPublic:'Pas de musique publique', noUser:'Aucun fichier téléchargé', uploading:'Téléchargement...', upload:'Télécharger', up:'Haut', down:'Bas', remove:'Retirer', load:'Charger', rename:'Renommer', delete:'Supprimer', urlTrack:'URL Morceau' },
    es: { loading:'Cargando...', selectTrack:'Seleccionar pista', prev:'Anterior', next:'Siguiente', visualizer:'Visualizador', urlPlaceholder:'Pegar URL de audio (mp3, wav, ogg...)', add:'+ Añadir', playlist:'Lista de reproducción', myLists:'Mis listas', files:'Archivos', save:'Guardar', emptyPlaylist:'Lista vacía', addFromFiles:'Agregue pistas desde Archivos', newListPlaceholder:'Nombre de la lista...', create:'Crear', noSavedLists:'Sin listas guardadas', tracks:'pistas', emptyList:'Lista vacía', publicMusic:'Música pública', myFiles:'Mis archivos', noPublic:'Sin música pública', noUser:'Sin archivos', uploading:'Subiendo...', upload:'Subir', up:'Arriba', down:'Abajo', remove:'Quitar', load:'Cargar', rename:'Renombrar', delete:'Eliminar', urlTrack:'Pista URL' },
    ru: { loading:'Загрузка...', selectTrack:'Выберите трек', prev:'Предыдущий', next:'Следующий', visualizer:'Визуализатор', urlPlaceholder:'Вставьте URL аудио (mp3, wav, ogg...)', add:'+ Добавить', playlist:'Плейлист', myLists:'Мои списки', files:'Файлы', save:'Сохранить', emptyPlaylist:'Плейлист пуст', addFromFiles:'Добавьте треки из вкладки Файлы', newListPlaceholder:'Имя списка...', create:'Создать', noSavedLists:'Нет сохранённых списков', tracks:'треков', emptyList:'Пустой список', publicMusic:'Общая музыка', myFiles:'Мои файлы', noPublic:'Нет общей музыки', noUser:'Файлы не загружены', uploading:'Загрузка...', upload:'Загрузить', up:'Вверх', down:'Вниз', remove:'Убрать', load:'Загрузить', rename:'Переименовать', delete:'Удалить', urlTrack:'URL Трек' },
    zh: { loading:'加载中...', selectTrack:'选择曲目', prev:'上一首', next:'下一首', visualizer:'可视化', urlPlaceholder:'粘贴音频URL (mp3, wav, ogg...)', add:'+ 添加', playlist:'播放列表', myLists:'我的列表', files:'文件', save:'保存', emptyPlaylist:'播放列表为空', addFromFiles:'从文件选项卡添加', newListPlaceholder:'新列表名称...', create:'创建', noSavedLists:'无已保存列表', tracks:'首曲目', emptyList:'空列表', publicMusic:'公共音乐', myFiles:'我的文件', noPublic:'无公共音乐', noUser:'尚未上传文件', uploading:'上传中...', upload:'上传', up:'上移', down:'下移', remove:'移除', load:'加载', rename:'重命名', delete:'删除', urlTrack:'URL曲目' },
    ja: { loading:'読み込み中...', selectTrack:'トラックを選択', prev:'前へ', next:'次へ', visualizer:'ビジュアライザー', urlPlaceholder:'音声URLを貼り付け (mp3, wav, ogg...)', add:'+ 追加', playlist:'プレイリスト', myLists:'マイリスト', files:'ファイル', save:'保存', emptyPlaylist:'プレイリストが空です', addFromFiles:'ファイルタブから追加', newListPlaceholder:'新しいリスト名...', create:'作成', noSavedLists:'保存済みリストなし', tracks:'曲', emptyList:'空のリスト', publicMusic:'公開音楽', myFiles:'マイファイル', noPublic:'公開音楽なし', noUser:'ファイル未アップロード', uploading:'アップロード中...', upload:'アップロード', up:'上へ', down:'下へ', remove:'削除', load:'読込', rename:'名前変更', delete:'削除', urlTrack:'URLトラック' },
    it: { loading:'Caricamento...', selectTrack:'Seleziona un brano', prev:'Precedente', next:'Successivo', visualizer:'Visualizzatore', urlPlaceholder:'Incolla URL audio (mp3, wav, ogg...)', add:'+ Aggiungi', playlist:'Playlist', myLists:'Le mie liste', files:'File', save:'Salva', emptyPlaylist:'Playlist vuota', addFromFiles:'Aggiungi brani dalla scheda File', newListPlaceholder:'Nome nuova lista...', create:'Crea', noSavedLists:'Nessuna playlist salvata', tracks:'brani', emptyList:'Lista vuota', publicMusic:'Musica pubblica', myFiles:'I miei file', noPublic:'Nessuna musica pubblica', noUser:'Nessun file caricato', uploading:'Caricamento...', upload:'Carica', up:'Su', down:'Giù', remove:'Rimuovi', load:'Carica', rename:'Rinomina', delete:'Elimina', urlTrack:'Brano URL' },
    ar: { loading:'جارٍ التحميل...', selectTrack:'اختر مقطوعة', prev:'السابق', next:'التالي', visualizer:'مرئيات', urlPlaceholder:'الصق رابط صوتي (mp3, wav, ogg...)', add:'+ إضافة', playlist:'قائمة التشغيل', myLists:'قوائمي', files:'الملفات', save:'حفظ', emptyPlaylist:'قائمة التشغيل فارغة', addFromFiles:'أضف مقاطع من الملفات', newListPlaceholder:'اسم القائمة الجديدة...', create:'إنشاء', noSavedLists:'لا توجد قوائم محفوظة', tracks:'مقاطع', emptyList:'قائمة فارغة', publicMusic:'موسيقى عامة', myFiles:'ملفاتي', noPublic:'لا توجد موسيقى عامة', noUser:'لم يتم رفع ملفات', uploading:'جارٍ الرفع...', upload:'رفع', up:'أعلى', down:'أسفل', remove:'إزالة', load:'تحميل', rename:'إعادة تسمية', delete:'حذف', urlTrack:'مقطوعة URL' },
    ko: { loading:'로딩 중...', selectTrack:'트랙 선택', prev:'이전', next:'다음', visualizer:'시각화', urlPlaceholder:'오디오 URL 붙여넣기 (mp3, wav, ogg...)', add:'+ 추가', playlist:'재생목록', myLists:'내 목록', files:'파일', save:'저장', emptyPlaylist:'재생목록이 비어있습니다', addFromFiles:'파일 탭에서 트랙 추가', newListPlaceholder:'새 목록 이름...', create:'만들기', noSavedLists:'저장된 목록 없음', tracks:'트랙', emptyList:'빈 목록', publicMusic:'공개 음악', myFiles:'내 파일', noPublic:'공개 음악 없음', noUser:'업로드된 파일 없음', uploading:'업로드 중...', upload:'업로드', up:'위로', down:'아래로', remove:'제거', load:'불러오기', rename:'이름 변경', delete:'삭제', urlTrack:'URL 트랙' },
    hi: { loading:'लोड हो रहा है...', selectTrack:'ट्रैक चुनें', prev:'पिछला', next:'अगला', visualizer:'विज़ुअलाइज़र', urlPlaceholder:'ऑडियो URL चिपकाएं (mp3, wav, ogg...)', add:'+ जोड़ें', playlist:'प्लेलिस्ट', myLists:'मेरी सूचियां', files:'फ़ाइलें', save:'सहेजें', emptyPlaylist:'प्लेलिस्ट खाली है', addFromFiles:'फ़ाइलें टैब से ट्रैक जोड़ें', newListPlaceholder:'नई सूची का नाम...', create:'बनाएं', noSavedLists:'कोई सहेजी गई सूची नहीं', tracks:'ट्रैक', emptyList:'खाली सूची', publicMusic:'सार्वजनिक संगीत', myFiles:'मेरी फ़ाइलें', noPublic:'कोई सार्वजनिक संगीत नहीं', noUser:'कोई फ़ाइल अपलोड नहीं', uploading:'अपलोड हो रहा है...', upload:'अपलोड', up:'ऊपर', down:'नीचे', remove:'हटाएं', load:'लोड', rename:'नाम बदलें', delete:'हटाएं', urlTrack:'URL ट्रैक' },
    pt: { loading:'Carregando...', selectTrack:'Selecione uma faixa', prev:'Anterior', next:'Próximo', visualizer:'Visualizador', urlPlaceholder:'Colar URL de áudio (mp3, wav, ogg...)', add:'+ Adicionar', playlist:'Playlist', myLists:'Minhas listas', files:'Arquivos', save:'Salvar', emptyPlaylist:'Playlist vazia', addFromFiles:'Adicione faixas da aba Arquivos', newListPlaceholder:'Nome da nova lista...', create:'Criar', noSavedLists:'Nenhuma playlist salva', tracks:'faixas', emptyList:'Lista vazia', publicMusic:'Música pública', myFiles:'Meus arquivos', noPublic:'Sem música pública', noUser:'Nenhum arquivo enviado', uploading:'Enviando...', upload:'Enviar', up:'Acima', down:'Abaixo', remove:'Remover', load:'Carregar', rename:'Renomear', delete:'Excluir', urlTrack:'Faixa URL' }
  };
  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  return {
    setup() {
      const locale = ref(getLocale());
      function t(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

      const volStore = typeof useVolumeStore === 'function' ? useVolumeStore() : null;
      const tracks = ref([]);
      const index = ref(-1);
      const playing = ref(false);
      const elapsed = ref(0);
      const duration = ref(0);
      const volume = ref(volStore ? volStore.level : parseInt(localStorage.getItem('mp_volume') ?? '80', 10));
      const loading = ref(true);
      const tab = ref('playlist'); // playlist | files
      const availableFiles = ref({ public: [], user: [] });
      const uploading = ref(false);

      // ── Multi-playlist state ──
      const playlists = ref([]);
      const activePlaylistId = ref(null);
      const showPlaylists = ref(false);
      const newPlName = ref('');

      // Visualizer state
      const vizActive = ref(false);
      const vizMode = ref('bars'); // bars | wave | circle
      const vizModes = ['bars', 'wave', 'circle'];
      let audioCtx = null;
      let analyser = null;
      let sourceNode = null;
      let vizRafId = null;
      let vizCanvas = null;
      let vizCtx = null;

      let audio = null;
      let rafId = null;

      const currentTrack = computed(() => index.value >= 0 && index.value < tracks.value.length ? tracks.value[index.value] : null);
      const progress = computed(() => duration.value > 0 ? (elapsed.value / duration.value) * 100 : 0);

      function createAudio() {
        if (audio) { audio.pause(); audio.src = ''; }
        audio = new Audio();
        audio.volume = volume.value / 100;
        audio.addEventListener('loadedmetadata', () => { duration.value = audio.duration; });
        audio.addEventListener('ended', () => { next(); });
        audio.addEventListener('error', () => { playing.value = false; });
      }

      function updateTime() {
        if (audio && !audio.paused) {
          elapsed.value = audio.currentTime;
          rafId = requestAnimationFrame(updateTime);
        }
      }

      function play(i) {
        if (i < 0 || i >= tracks.value.length) return;
        index.value = i;
        const track = tracks.value[i];
        if (!audio) createAudio();
        audio.src = track.url;
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        audio.play().then(() => {
          playing.value = true;
          rafId = requestAnimationFrame(updateTime);
        }).catch(() => {});
      }

      function toggle() {
        if (!audio || index.value < 0) {
          if (tracks.value.length) play(0);
          return;
        }
        if (audio.paused) {
          audio.play().then(() => {
            playing.value = true;
            rafId = requestAnimationFrame(updateTime);
          }).catch(() => {});
        } else {
          audio.pause();
          playing.value = false;
          if (rafId) cancelAnimationFrame(rafId);
        }
      }

      function next() {
        if (!tracks.value.length) return;
        play((index.value + 1) % tracks.value.length);
      }

      function prev() {
        if (!tracks.value.length) return;
        if (audio && audio.currentTime > 3) {
          audio.currentTime = 0;
          elapsed.value = 0;
          return;
        }
        play((index.value - 1 + tracks.value.length) % tracks.value.length);
      }

      function seek(e) {
        if (!audio || !duration.value) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        audio.currentTime = pct * duration.value;
        elapsed.value = audio.currentTime;
      }

      function setVolume(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        volume.value = Math.round(pct * 100);
        if (audio) audio.volume = volume.value / 100;
        localStorage.setItem('mp_volume', volume.value);
        if (volStore) volStore.setLevel(volume.value);
      }

      // Watch system volume store
      if (volStore) {
        watch(() => volStore.effectiveLevel, (lvl) => {
          volume.value = lvl;
          if (audio) audio.volume = lvl / 100;
        });
      }

      // ── Media source registration ──
      const mediaHandlers = volStore ? {
        toggle,
        next,
        prev,
        seekFwd(sec) { if (audio && isFinite(audio.duration)) { audio.currentTime = Math.min(audio.duration, audio.currentTime + sec); elapsed.value = audio.currentTime; } },
        seekBack(sec) { if (audio) { audio.currentTime = Math.max(0, audio.currentTime - sec); elapsed.value = audio.currentTime; } }
      } : null;

      function syncMediaState() {
        if (!volStore) return;
        const title = currentTrack.value ? currentTrack.value.title : '';
        volStore.updateMediaState(playing.value, title);
      }

      // Sync media state to volume store whenever playing or track changes
      if (volStore) {
        watch([playing, index], () => { syncMediaState(); });
      }

      function formatTime(s) {
        if (!s || !isFinite(s)) return '0:00';
        const m = Math.floor(s / 60);
        return m + ':' + String(Math.floor(s % 60)).padStart(2, '0');
      }

      // ── Playlist management ──
      async function loadPlaylist() {
        try {
          const res = await fetch('/api/music/playlist');
          if (res.ok) tracks.value = await res.json();
        } catch {}
      }

      async function savePlaylist() {
        try {
          await fetch('/api/music/playlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playlist: tracks.value })
          });
        } catch {}
        // Also sync to active multi-playlist
        if (activePlaylistId.value) {
          try {
            await fetch('/api/music/playlists/' + activePlaylistId.value, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tracks: tracks.value })
            });
            const pl = playlists.value.find(p => p.id === activePlaylistId.value);
            if (pl) pl.tracks = [...tracks.value];
          } catch {}
        }
      }

      // ── Multi-playlist management ──
      async function loadPlaylists() {
        try {
          const res = await fetch('/api/music/playlists');
          if (res.ok) playlists.value = await res.json();
        } catch {}
      }

      async function createPlaylist(name) {
        if (!name || !name.trim()) return;
        try {
          const res = await fetch('/api/music/playlists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name.trim(), tracks: [] })
          });
          if (res.ok) {
            const pl = await res.json();
            playlists.value.push(pl);
          }
        } catch {}
      }

      async function renamePlaylist(pl) {
        const name = prompt('', pl.name);
        if (!name || !name.trim() || name === pl.name) return;
        try {
          await fetch('/api/music/playlists/' + pl.id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name.trim() })
          });
          pl.name = name.trim();
        } catch {}
      }

      async function deletePlaylist(pl) {
        try {
          await fetch('/api/music/playlists/' + pl.id, { method: 'DELETE' });
          playlists.value = playlists.value.filter(p => p.id !== pl.id);
          if (activePlaylistId.value === pl.id) activePlaylistId.value = null;
        } catch {}
      }

      function switchPlaylist(pl) {
        // Stop playback
        if (audio) { audio.pause(); audio.src = ''; }
        playing.value = false;
        index.value = -1;
        elapsed.value = 0;
        duration.value = 0;
        // Load playlist tracks
        tracks.value = pl.tracks ? [...pl.tracks] : [];
        activePlaylistId.value = pl.id;
        showPlaylists.value = false;
        // Also save as current active playlist
        savePlaylist();
      }

      async function saveCurrentAsPlaylist() {
        if (!tracks.value.length) return;
        const name = prompt('');
        if (!name || !name.trim()) return;
        try {
          const res = await fetch('/api/music/playlists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name.trim(), tracks: [...tracks.value] })
          });
          if (res.ok) {
            const pl = await res.json();
            playlists.value.push(pl);
            activePlaylistId.value = pl.id;
          }
        } catch {}
      }

      async function loadFiles() {
        try {
          const res = await fetch('/api/music/files');
          if (res.ok) availableFiles.value = await res.json();
        } catch {}
      }

      function addToPlaylist(file, source) {
        const exists = tracks.value.some(t => t.url === file.url);
        if (exists) return;
        tracks.value.push({
          title: file.name,
          filename: file.filename,
          url: file.url,
          source,
          icon: source === 'public' ? '🌐' : '👤'
        });
        savePlaylist();
      }

      function removeFromPlaylist(i) {
        const wasPlaying = i === index.value;
        tracks.value.splice(i, 1);
        if (wasPlaying) {
          if (audio) { audio.pause(); audio.src = ''; }
          playing.value = false;
          index.value = -1;
          elapsed.value = 0;
          duration.value = 0;
        } else if (i < index.value) {
          index.value--;
        }
        savePlaylist();
      }

      function moveTrack(from, to) {
        if (to < 0 || to >= tracks.value.length) return;
        const item = tracks.value.splice(from, 1)[0];
        tracks.value.splice(to, 0, item);
        if (index.value === from) index.value = to;
        else if (from < index.value && to >= index.value) index.value--;
        else if (from > index.value && to <= index.value) index.value++;
        savePlaylist();
      }

      // ── File upload ──
      function triggerUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.mp3,.wav,.ogg,.flac,.aac,.m4a,.webm';
        input.multiple = true;
        input.onchange = async () => {
          if (!input.files.length) return;
          uploading.value = true;
          const formData = new FormData();
          for (const f of input.files) formData.append('files', f);
          try {
            const res = await fetch('/api/music/upload', { method: 'POST', body: formData });
            if (res.ok) {
              await loadFiles();
            }
          } catch {}
          uploading.value = false;
        };
        input.click();
      }

      async function deleteFile(file) {
        try {
          await fetch('/api/music/file/' + encodeURIComponent(file.filename), { method: 'DELETE' });
          // Remove from playlist if present
          tracks.value = tracks.value.filter(t => t.url !== file.url);
          savePlaylist();
          await loadFiles();
        } catch {}
      }

      function isInPlaylist(file) {
        return tracks.value.some(t => t.url === file.url);
      }

      // ── Visualizer ──
      function ensureAudioContext() {
        if (audioCtx) return;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.8;
        if (audio) {
          sourceNode = audioCtx.createMediaElementSource(audio);
          sourceNode.connect(analyser);
          analyser.connect(audioCtx.destination);
        }
      }

      function toggleVisualizer() {
        vizActive.value = !vizActive.value;
        if (vizActive.value) {
          ensureAudioContext();
          if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
          nextTick(() => {
            const el = document.querySelector('.mp-viz-canvas');
            if (el) {
              vizCanvas = el;
              vizCtx = el.getContext('2d');
              resizeVizCanvas();
              drawViz();
            }
          });
        } else {
          if (vizRafId) { cancelAnimationFrame(vizRafId); vizRafId = null; }
        }
      }

      function cycleVizMode() {
        const i = vizModes.indexOf(vizMode.value);
        vizMode.value = vizModes[(i + 1) % vizModes.length];
      }

      function resizeVizCanvas() {
        if (!vizCanvas) return;
        const parent = vizCanvas.parentElement;
        if (!parent) return;
        vizCanvas.width = parent.clientWidth;
        vizCanvas.height = parent.clientHeight;
      }

      function drawViz() {
        if (!vizActive.value || !analyser || !vizCtx || !vizCanvas) return;
        vizRafId = requestAnimationFrame(drawViz);
        const w = vizCanvas.width;
        const h = vizCanvas.height;
        const bufLen = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufLen);

        vizCtx.clearRect(0, 0, w, h);

        if (vizMode.value === 'bars') {
          analyser.getByteFrequencyData(dataArray);
          const barCount = Math.min(bufLen, 128);
          const barW = w / barCount;
          for (let i = 0; i < barCount; i++) {
            const val = dataArray[i] / 255;
            const barH = val * h * 0.9;
            const hue = (i / barCount) * 120 + 140;
            vizCtx.fillStyle = `hsla(${hue}, 85%, 55%, 0.85)`;
            vizCtx.fillRect(i * barW, h - barH, barW - 1, barH);
            // Mirror glow on top
            vizCtx.fillStyle = `hsla(${hue}, 85%, 55%, 0.15)`;
            vizCtx.fillRect(i * barW, h - barH - barH * 0.08, barW - 1, barH * 0.08);
          }
        } else if (vizMode.value === 'wave') {
          analyser.getByteTimeDomainData(dataArray);
          vizCtx.lineWidth = 2.5;
          vizCtx.strokeStyle = '#38ef7d';
          vizCtx.shadowColor = '#38ef7d';
          vizCtx.shadowBlur = 12;
          vizCtx.beginPath();
          const sliceW = w / bufLen;
          for (let i = 0; i < bufLen; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * h) / 2;
            if (i === 0) vizCtx.moveTo(0, y);
            else vizCtx.lineTo(i * sliceW, y);
          }
          vizCtx.lineTo(w, h / 2);
          vizCtx.stroke();
          vizCtx.shadowBlur = 0;
        } else if (vizMode.value === 'circle') {
          analyser.getByteFrequencyData(dataArray);
          const cx = w / 2, cy = h / 2;
          const radius = Math.min(w, h) * 0.25;
          const bars = Math.min(bufLen, 180);
          for (let i = 0; i < bars; i++) {
            const val = dataArray[i] / 255;
            const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
            const len = val * radius * 0.9 + 4;
            const x1 = cx + Math.cos(angle) * radius;
            const y1 = cy + Math.sin(angle) * radius;
            const x2 = cx + Math.cos(angle) * (radius + len);
            const y2 = cy + Math.sin(angle) * (radius + len);
            const hue = (i / bars) * 360;
            vizCtx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.8)`;
            vizCtx.lineWidth = 2;
            vizCtx.beginPath();
            vizCtx.moveTo(x1, y1);
            vizCtx.lineTo(x2, y2);
            vizCtx.stroke();
          }
          // Inner circle
          vizCtx.beginPath();
          vizCtx.arc(cx, cy, radius - 2, 0, Math.PI * 2);
          vizCtx.strokeStyle = 'rgba(56,239,125,0.3)';
          vizCtx.lineWidth = 1.5;
          vizCtx.stroke();
        }
      }

      let vizResizeHandler = null;

      onMounted(async () => {
        createAudio();
        await loadPlaylist();
        await loadFiles();
        await loadPlaylists();
        loading.value = false;
        if (volStore && mediaHandlers) volStore.registerMedia(mediaHandlers);
        vizResizeHandler = () => resizeVizCanvas();
        window.addEventListener('resize', vizResizeHandler);
        window.addEventListener('locale-changed', onLocaleChanged);
      });

      // ── URL link ──
      const linkUrl = ref('');

      function addFromUrl() {
        const url = linkUrl.value.trim();
        if (!url) return;
        if (tracks.value.some(t => t.url === url)) { linkUrl.value = ''; return; }
        let name = url;
        try { name = decodeURIComponent(url.split('/').pop().split('?')[0].replace(/\.[^.]+$/, '')); } catch {}
        tracks.value.push({ title: name || t('urlTrack'), filename: '', url, source: 'url', icon: '🔗' });
        linkUrl.value = '';
        savePlaylist();
      }

      onUnmounted(() => {
        if (audio) { audio.pause(); audio.src = ''; audio = null; }
        if (rafId) cancelAnimationFrame(rafId);
        if (vizRafId) cancelAnimationFrame(vizRafId);
        if (vizResizeHandler) window.removeEventListener('resize', vizResizeHandler);
        if (audioCtx) { audioCtx.close().catch(() => {}); audioCtx = null; }
        if (volStore && mediaHandlers) volStore.unregisterMedia(mediaHandlers);
        window.removeEventListener('locale-changed', onLocaleChanged);
      });

      return {
        tracks, index, playing, elapsed, duration, volume, loading,
        tab, availableFiles, uploading, linkUrl,
        currentTrack, progress, t,
        vizActive, vizMode,
        playlists, activePlaylistId, showPlaylists, newPlName,
        play, toggle, next, prev, seek, setVolume, formatTime,
        addToPlaylist, removeFromPlaylist, moveTrack,
        triggerUpload, deleteFile, isInPlaylist, addFromUrl,
        toggleVisualizer, cycleVizMode,
        loadPlaylists, createPlaylist, renamePlaylist, deletePlaylist,
        switchPlaylist, saveCurrentAsPlaylist
      };
    }
  };
})(Vue);
