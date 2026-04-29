(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, watch } = Vue;
  const { useVolumeStore } = window.__volumeStore || {};

  const LANGS = {
    tr: { loading:'Yükleniyor...', placeholder:'Video seçin veya dosya yükleyin', fullscreen:'Tam Ekran', pip:'Pencerede Oynat', urlPlaceholder:'Video URL\'si yapıştır (mp4, webm...)', add:'+ Ekle', playlist:'Liste', files:'Dosyalar', emptyList:'Liste boş — Dosyalar sekmesinden video ekleyin', publicVideos:'Ortak Videolar', myVideos:'Videolarım', noPublic:'Ortak video dosyası yok', noUser:'Henüz video yüklenmedi', uploading:'Yükleniyor...', upload:'Yükle' },
    en: { loading:'Loading...', placeholder:'Select a video or upload a file', fullscreen:'Fullscreen', pip:'Picture in Picture', urlPlaceholder:'Paste video URL (mp4, webm...)', add:'+ Add', playlist:'Playlist', files:'Files', emptyList:'Playlist empty — Add videos from Files tab', publicVideos:'Public Videos', myVideos:'My Videos', noPublic:'No public video files', noUser:'No videos uploaded yet', uploading:'Uploading...', upload:'Upload' },
    de: { loading:'Laden...', placeholder:'Video auswählen oder Datei hochladen', fullscreen:'Vollbild', pip:'Bild-in-Bild', urlPlaceholder:'Video-URL einfügen (mp4, webm...)', add:'+ Hinzufügen', playlist:'Liste', files:'Dateien', emptyList:'Liste leer — Videos aus Dateien hinzufügen', publicVideos:'Öffentliche Videos', myVideos:'Meine Videos', noPublic:'Keine öffentlichen Videos', noUser:'Noch keine Videos hochgeladen', uploading:'Wird hochgeladen...', upload:'Hochladen' },
    fr: { loading:'Chargement...', placeholder:'Sélectionner une vidéo ou télécharger', fullscreen:'Plein écran', pip:'Image dans l\'image', urlPlaceholder:'Coller l\'URL vidéo (mp4, webm...)', add:'+ Ajouter', playlist:'Liste', files:'Fichiers', emptyList:'Liste vide — Ajoutez des vidéos depuis Fichiers', publicVideos:'Vidéos publiques', myVideos:'Mes vidéos', noPublic:'Aucune vidéo publique', noUser:'Aucune vidéo téléchargée', uploading:'Téléchargement...', upload:'Télécharger' },
    es: { loading:'Cargando...', placeholder:'Seleccione un video o suba un archivo', fullscreen:'Pantalla completa', pip:'Imagen en imagen', urlPlaceholder:'Pegar URL de video (mp4, webm...)', add:'+ Añadir', playlist:'Lista', files:'Archivos', emptyList:'Lista vacía — Agregue videos desde Archivos', publicVideos:'Videos públicos', myVideos:'Mis videos', noPublic:'Sin videos públicos', noUser:'Aún no hay videos', uploading:'Subiendo...', upload:'Subir' },
    ru: { loading:'Загрузка...', placeholder:'Выберите видео или загрузите файл', fullscreen:'Полный экран', pip:'Картинка в картинке', urlPlaceholder:'Вставьте URL видео (mp4, webm...)', add:'+ Добавить', playlist:'Список', files:'Файлы', emptyList:'Список пуст — Добавьте видео из вкладки Файлы', publicVideos:'Общие видео', myVideos:'Мои видео', noPublic:'Нет общих видео', noUser:'Видео ещё не загружены', uploading:'Загрузка...', upload:'Загрузить' },
    zh: { loading:'加载中...', placeholder:'选择视频或上传文件', fullscreen:'全屏', pip:'画中画', urlPlaceholder:'粘贴视频URL (mp4, webm...)', add:'+ 添加', playlist:'播放列表', files:'文件', emptyList:'列表为空 — 从文件选项卡添加', publicVideos:'公共视频', myVideos:'我的视频', noPublic:'无公共视频', noUser:'尚未上传视频', uploading:'上传中...', upload:'上传' },
    ja: { loading:'読み込み中...', placeholder:'動画を選択またはアップロード', fullscreen:'全画面', pip:'ピクチャインピクチャ', urlPlaceholder:'動画URLを貼り付け (mp4, webm...)', add:'+ 追加', playlist:'プレイリスト', files:'ファイル', emptyList:'リストが空です — ファイルタブから追加', publicVideos:'公開動画', myVideos:'マイ動画', noPublic:'公開動画なし', noUser:'動画未アップロード', uploading:'アップロード中...', upload:'アップロード' },
    it: { loading:'Caricamento...', placeholder:'Seleziona un video o carica un file', fullscreen:'Schermo intero', pip:'Picture in Picture', urlPlaceholder:'Incolla URL video (mp4, webm...)', add:'+ Aggiungi', playlist:'Lista', files:'File', emptyList:'Lista vuota — Aggiungi video dalla scheda File', publicVideos:'Video pubblici', myVideos:'I miei video', noPublic:'Nessun video pubblico', noUser:'Nessun video caricato', uploading:'Caricamento...', upload:'Carica' },
    ar: { loading:'جارٍ التحميل...', placeholder:'اختر فيديو أو ارفع ملف', fullscreen:'ملء الشاشة', pip:'صورة في صورة', urlPlaceholder:'الصق رابط الفيديو (mp4, webm...)', add:'+ إضافة', playlist:'القائمة', files:'الملفات', emptyList:'القائمة فارغة — أضف فيديو من الملفات', publicVideos:'فيديوهات عامة', myVideos:'فيديوهاتي', noPublic:'لا توجد فيديوهات عامة', noUser:'لم يتم رفع فيديو بعد', uploading:'جارٍ الرفع...', upload:'رفع' },
    ko: { loading:'로딩 중...', placeholder:'비디오를 선택하거나 파일을 업로드하세요', fullscreen:'전체 화면', pip:'화면 속 화면', urlPlaceholder:'비디오 URL 붙여넣기 (mp4, webm...)', add:'+ 추가', playlist:'재생목록', files:'파일', emptyList:'목록이 비어있습니다 — 파일 탭에서 추가', publicVideos:'공개 비디오', myVideos:'내 비디오', noPublic:'공개 비디오 없음', noUser:'업로드된 비디오 없음', uploading:'업로드 중...', upload:'업로드' },
    hi: { loading:'लोड हो रहा है...', placeholder:'वीडियो चुनें या फ़ाइल अपलोड करें', fullscreen:'पूर्ण स्क्रीन', pip:'पिक्चर इन पिक्चर', urlPlaceholder:'वीडियो URL चिपकाएं (mp4, webm...)', add:'+ जोड़ें', playlist:'सूची', files:'फ़ाइलें', emptyList:'सूची खाली है — फ़ाइलें टैब से जोड़ें', publicVideos:'सार्वजनिक वीडियो', myVideos:'मेरे वीडियो', noPublic:'कोई सार्वजनिक वीडियो नहीं', noUser:'अभी तक कोई वीडियो अपलोड नहीं', uploading:'अपलोड हो रहा है...', upload:'अपलोड' },
    pt: { loading:'Carregando...', placeholder:'Selecione um vídeo ou envie um arquivo', fullscreen:'Tela cheia', pip:'Picture in Picture', urlPlaceholder:'Colar URL do vídeo (mp4, webm...)', add:'+ Adicionar', playlist:'Lista', files:'Arquivos', emptyList:'Lista vazia — Adicione vídeos da aba Arquivos', publicVideos:'Vídeos públicos', myVideos:'Meus vídeos', noPublic:'Sem vídeos públicos', noUser:'Nenhum vídeo enviado', uploading:'Enviando...', upload:'Enviar' }
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
      const volume = ref(volStore ? volStore.level : parseInt(localStorage.getItem('vp_volume') ?? '80', 10));
      const muted = ref(volStore ? volStore.muted : false);
      const loadingInit = ref(true);
      const tab = ref('playlist');
      const availableFiles = ref({ public: [], user: [] });
      const uploading = ref(false);
      const showControls = ref(true);
      const videoEl = ref(null);
      const isPip = ref(false);
      const pipSupported = ref(false);

      let hideTimer = null;

      const currentTrack = computed(() => index.value >= 0 && index.value < tracks.value.length ? tracks.value[index.value] : null);
      const progress = computed(() => duration.value > 0 ? (elapsed.value / duration.value) * 100 : 0);

      function onMeta() {
        if (videoEl.value) duration.value = videoEl.value.duration;
      }
      function onTime() {
        if (videoEl.value) elapsed.value = videoEl.value.currentTime;
      }
      function onError() { playing.value = false; }

      function play(i) {
        if (i < 0 || i >= tracks.value.length) return;
        index.value = i;
        const v = videoEl.value;
        if (!v) return;
        v.src = tracks.value[i].url;
        v.volume = volume.value / 100;
        v.muted = muted.value;
        v.play().then(() => { playing.value = true; startHideTimer(); }).catch(() => {});
      }

      function toggle() {
        const v = videoEl.value;
        if (!v || index.value < 0) {
          if (tracks.value.length) play(0);
          return;
        }
        if (v.paused) {
          v.play().then(() => { playing.value = true; startHideTimer(); }).catch(() => {});
        } else {
          v.pause();
          playing.value = false;
          showControls.value = true;
        }
      }

      function next() {
        if (!tracks.value.length) return;
        play((index.value + 1) % tracks.value.length);
      }

      function prev() {
        if (!tracks.value.length) return;
        const v = videoEl.value;
        if (v && v.currentTime > 3) { v.currentTime = 0; elapsed.value = 0; return; }
        play((index.value - 1 + tracks.value.length) % tracks.value.length);
      }

      function seek(e) {
        const v = videoEl.value;
        if (!v || !duration.value) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        v.currentTime = pct * duration.value;
        elapsed.value = v.currentTime;
      }

      function setVolume(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        volume.value = Math.round(pct * 100);
        if (videoEl.value) { videoEl.value.volume = volume.value / 100; videoEl.value.muted = false; }
        muted.value = false;
        localStorage.setItem('vp_volume', volume.value);
        if (volStore) volStore.setLevel(volume.value);
      }

      function toggleMute() {
        muted.value = !muted.value;
        if (videoEl.value) videoEl.value.muted = muted.value;
        if (volStore) { if (muted.value) volStore.muted = true; else volStore.muted = false; }
      }

      // Watch system volume store
      if (volStore) {
        watch(() => volStore.effectiveLevel, (lvl) => {
          volume.value = lvl;
          muted.value = volStore.muted;
          if (videoEl.value) { videoEl.value.volume = lvl / 100; videoEl.value.muted = volStore.muted; }
        });
      }

      // ── Media source registration ──
      const mediaHandlers = volStore ? {
        toggle,
        next,
        prev,
        seekFwd(sec) { const v = videoEl.value; if (v && isFinite(v.duration)) { v.currentTime = Math.min(v.duration, v.currentTime + sec); elapsed.value = v.currentTime; } },
        seekBack(sec) { const v = videoEl.value; if (v) { v.currentTime = Math.max(0, v.currentTime - sec); elapsed.value = v.currentTime; } }
      } : null;

      function syncMediaState() {
        if (!volStore) return;
        const title = currentTrack.value ? currentTrack.value.title : '';
        volStore.updateMediaState(playing.value, title);
      }

      if (volStore) {
        watch([playing, index], () => { syncMediaState(); });
      }

      function toggleFullscreen() {
        const el = videoEl.value?.closest('.vp-player');
        if (!el) return;
        if (document.fullscreenElement) document.exitFullscreen();
        else el.requestFullscreen().catch(() => {});
      }

      function togglePip() {
        const v = videoEl.value;
        if (!v) return;
        if (document.pictureInPictureElement) {
          document.exitPictureInPicture().catch(() => {});
        } else {
          v.requestPictureInPicture().catch(() => {});
        }
      }

      function onEnterPip() { isPip.value = true; }
      function onLeavePip() { isPip.value = false; }

      function startHideTimer() {
        showControls.value = true;
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(() => { if (playing.value) showControls.value = false; }, 3000);
      }

      function formatTime(s) {
        if (!s || !isFinite(s)) return '0:00';
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = Math.floor(s % 60);
        if (h > 0) return h + ':' + String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
        return m + ':' + String(sec).padStart(2, '0');
      }

      function formatSize(bytes) {
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
      }

      // Playlist
      async function loadPlaylist() {
        try {
          const res = await fetch('/api/video/playlist');
          if (res.ok) tracks.value = await res.json();
        } catch {}
      }

      async function savePlaylist() {
        try {
          await fetch('/api/video/playlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playlist: tracks.value })
          });
        } catch {}
      }

      async function loadFiles() {
        try {
          const res = await fetch('/api/video/files');
          if (res.ok) availableFiles.value = await res.json();
        } catch {}
      }

      function addToPlaylist(file, source) {
        if (tracks.value.some(t => t.url === file.url)) return;
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
          const v = videoEl.value;
          if (v) { v.pause(); v.src = ''; }
          playing.value = false;
          index.value = -1;
          elapsed.value = 0;
          duration.value = 0;
        } else if (i < index.value) { index.value--; }
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

      function isInPlaylist(file) { return tracks.value.some(t => t.url === file.url); }

      function triggerUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.mp4,.webm,.mkv,.avi,.mov,.ogv';
        input.multiple = true;
        input.onchange = async () => {
          if (!input.files.length) return;
          uploading.value = true;
          const fd = new FormData();
          for (const f of input.files) fd.append('files', f);
          try {
            const res = await fetch('/api/video/upload', { method: 'POST', body: fd });
            if (res.ok) await loadFiles();
          } catch {}
          uploading.value = false;
        };
        input.click();
      }

      async function deleteFile(file) {
        try {
          await fetch('/api/video/file/' + encodeURIComponent(file.filename), { method: 'DELETE' });
          tracks.value = tracks.value.filter(t => t.url !== file.url);
          savePlaylist();
          await loadFiles();
        } catch {}
      }

      // Mouse move shows controls
      function onMouseMove() { startHideTimer(); }

      onMounted(async () => {
        await loadPlaylist();
        await loadFiles();
        loadingInit.value = false;
        pipSupported.value = 'pictureInPictureEnabled' in document && document.pictureInPictureEnabled;
        if (volStore && mediaHandlers) volStore.registerMedia(mediaHandlers);
        window.addEventListener('locale-changed', onLocaleChanged);
        // PiP events
        const v = videoEl.value;
        if (v) {
          v.addEventListener('enterpictureinpicture', onEnterPip);
          v.addEventListener('leavepictureinpicture', onLeavePip);
        }
        // Add mousemove listener to player area
        setTimeout(() => {
          const el = videoEl.value?.closest('.vp-player');
          if (el) el.addEventListener('mousemove', onMouseMove);
        }, 100);
      });

      // ── URL link ──
      const linkUrl = ref('');

      function addFromUrl() {
        const url = linkUrl.value.trim();
        if (!url) return;
        if (tracks.value.some(t => t.url === url)) { linkUrl.value = ''; return; }
        let name = url;
        try { name = decodeURIComponent(url.split('/').pop().split('?')[0].replace(/\.[^.]+$/, '')); } catch {}
        tracks.value.push({ title: name || 'URL Video', filename: '', url, source: 'url', icon: '🔗' });
        linkUrl.value = '';
        savePlaylist();
      }

      onUnmounted(() => {
        const v = videoEl.value;
        if (v) {
          v.removeEventListener('enterpictureinpicture', onEnterPip);
          v.removeEventListener('leavepictureinpicture', onLeavePip);
          if (document.pictureInPictureElement === v) document.exitPictureInPicture().catch(() => {});
          v.pause(); v.src = '';
        }
        if (hideTimer) clearTimeout(hideTimer);
        const el = v?.closest('.vp-player');
        if (el) el.removeEventListener('mousemove', onMouseMove);
        if (volStore && mediaHandlers) volStore.unregisterMedia(mediaHandlers);
        window.removeEventListener('locale-changed', onLocaleChanged);
      });

      return {
        tracks, index, playing, elapsed, duration, volume, muted, loadingInit,
        tab, availableFiles, uploading, showControls, videoEl, linkUrl,
        isPip, pipSupported,
        currentTrack, progress, t,
        play, toggle, next, prev, seek, setVolume, toggleMute, toggleFullscreen, togglePip,
        onMeta, onTime, onError,
        formatTime, formatSize,
        addToPlaylist, removeFromPlaylist, moveTrack, isInPlaylist,
        triggerUpload, deleteFile, addFromUrl
      };
    }
  };
})(Vue);
