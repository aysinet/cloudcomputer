({
  setup() {
    const { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } = Vue;
    const ElMessageBox = (window.ElementPlus && window.ElementPlus.ElMessageBox) || { confirm: () => Promise.resolve() };
    const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success: console.log, error: console.error };

    // ── i18n ──
    const LANGS = {
      tr: {
        title:'Video Düzenleyici', addMedia:'Medya Ekle', export:'Dışa Aktar',
        split:'Böl', delete:'Sil', addText:'Metin Ekle', properties:'Özellikler',
        clipName:'Klip Adı', trimStart:'Başlangıç Kırpma', trimEnd:'Bitiş Kırpma',
        speed:'Hız', volume:'Ses', timeline:'Zaman Çizelgesi', clips:'klip',
        emptyTimeline:'Medya eklemek için tıklayın', addMediaHint:'Video eklemek için tıklayın',
        videos:'Videolar', browse:'Gözat', noFiles:'Dosya bulunamadı',
        exportTitle:'Video Dışa Aktar', filename:'Dosya Adı', resolution:'Çözünürlük',
        saveLocation:'Kayıt Yeri', videoFolder:'Video Klasörü', downloadLocal:'Bilgisayara İndir',
        cancel:'İptal', enterText:'Metin girin', position:'Konum', fontSize:'Yazı Boyutu',
        textColor:'Yazı Rengi', add:'Ekle', textOverlays:'Metin Katmanları',
        posTop:'Üst', posCenter:'Orta', posBottom:'Alt',
        success:'Başarılı', error:'Hata', exported:'Video kaydedildi',
        exporting:'Dışa aktarılıyor...', loading:'Yükleniyor...',
        deleteConfirm:'Bu klibi silmek istediğinize emin misiniz?',
        undone:'Geri alındı', redone:'Yinelendi'
      },
      en: {
        title:'Video Editor', addMedia:'Add Media', export:'Export',
        split:'Split', delete:'Delete', addText:'Add Text', properties:'Properties',
        clipName:'Clip Name', trimStart:'Trim Start', trimEnd:'Trim End',
        speed:'Speed', volume:'Volume', timeline:'Timeline', clips:'clips',
        emptyTimeline:'Click to add media', addMediaHint:'Click to add a video',
        videos:'Videos', browse:'Browse', noFiles:'No files found',
        exportTitle:'Export Video', filename:'File Name', resolution:'Resolution',
        saveLocation:'Save Location', videoFolder:'Video Folder', downloadLocal:'Download to Computer',
        cancel:'Cancel', enterText:'Enter text', position:'Position', fontSize:'Font Size',
        textColor:'Text Color', add:'Add', textOverlays:'Text Overlays',
        posTop:'Top', posCenter:'Center', posBottom:'Bottom',
        success:'Success', error:'Error', exported:'Video saved',
        exporting:'Exporting...', loading:'Loading...',
        deleteConfirm:'Are you sure you want to delete this clip?',
        undone:'Undone', redone:'Redone'
      },
      de: {
        title:'Video-Editor', addMedia:'Medien hinzufügen', export:'Exportieren',
        split:'Teilen', delete:'Löschen', addText:'Text hinzufügen', properties:'Eigenschaften',
        clipName:'Clipname', trimStart:'Anfang trimmen', trimEnd:'Ende trimmen',
        speed:'Geschwindigkeit', volume:'Lautstärke', timeline:'Zeitachse', clips:'Clips',
        emptyTimeline:'Klicken um Medien hinzuzufügen', addMediaHint:'Klicken um Video hinzuzufügen',
        videos:'Videos', browse:'Durchsuchen', noFiles:'Keine Dateien',
        exportTitle:'Video exportieren', filename:'Dateiname', resolution:'Auflösung',
        saveLocation:'Speicherort', videoFolder:'Videoordner', downloadLocal:'Herunterladen',
        cancel:'Abbrechen', enterText:'Text eingeben', position:'Position', fontSize:'Schriftgröße',
        textColor:'Textfarbe', add:'Hinzufügen', textOverlays:'Textüberlagerungen',
        posTop:'Oben', posCenter:'Mitte', posBottom:'Unten',
        success:'Erfolgreich', error:'Fehler', exported:'Video gespeichert',
        exporting:'Exportieren...', loading:'Laden...',
        deleteConfirm:'Möchten Sie diesen Clip wirklich löschen?',
        undone:'Rückgängig', redone:'Wiederholt'
      },
      fr: {
        title:'Éditeur Vidéo', addMedia:'Ajouter un média', export:'Exporter',
        split:'Diviser', delete:'Supprimer', addText:'Ajouter du texte', properties:'Propriétés',
        clipName:'Nom du clip', trimStart:'Début du découpage', trimEnd:'Fin du découpage',
        speed:'Vitesse', volume:'Volume', timeline:'Chronologie', clips:'clips',
        emptyTimeline:'Cliquez pour ajouter un média', addMediaHint:'Cliquez pour ajouter une vidéo',
        videos:'Vidéos', browse:'Parcourir', noFiles:'Aucun fichier',
        exportTitle:'Exporter la vidéo', filename:'Nom du fichier', resolution:'Résolution',
        saveLocation:'Emplacement', videoFolder:'Dossier vidéo', downloadLocal:'Télécharger',
        cancel:'Annuler', enterText:'Entrez le texte', position:'Position', fontSize:'Taille de police',
        textColor:'Couleur du texte', add:'Ajouter', textOverlays:'Superpositions de texte',
        posTop:'Haut', posCenter:'Centre', posBottom:'Bas',
        success:'Succès', error:'Erreur', exported:'Vidéo enregistrée',
        exporting:'Exportation...', loading:'Chargement...',
        deleteConfirm:'Êtes-vous sûr de vouloir supprimer ce clip ?',
        undone:'Annulé', redone:'Refait'
      },
      es: {
        title:'Editor de Video', addMedia:'Agregar media', export:'Exportar',
        split:'Dividir', delete:'Eliminar', addText:'Agregar texto', properties:'Propiedades',
        clipName:'Nombre del clip', trimStart:'Inicio de recorte', trimEnd:'Fin de recorte',
        speed:'Velocidad', volume:'Volumen', timeline:'Línea de tiempo', clips:'clips',
        emptyTimeline:'Clic para agregar media', addMediaHint:'Clic para agregar un video',
        videos:'Videos', browse:'Explorar', noFiles:'No se encontraron archivos',
        exportTitle:'Exportar video', filename:'Nombre del archivo', resolution:'Resolución',
        saveLocation:'Ubicación', videoFolder:'Carpeta de video', downloadLocal:'Descargar',
        cancel:'Cancelar', enterText:'Ingrese texto', position:'Posición', fontSize:'Tamaño de fuente',
        textColor:'Color del texto', add:'Agregar', textOverlays:'Superposiciones de texto',
        posTop:'Arriba', posCenter:'Centro', posBottom:'Abajo',
        success:'Éxito', error:'Error', exported:'Video guardado',
        exporting:'Exportando...', loading:'Cargando...',
        deleteConfirm:'¿Estás seguro de que deseas eliminar este clip?',
        undone:'Deshecho', redone:'Rehecho'
      },
      ru: {
        title:'Видеоредактор', addMedia:'Добавить медиа', export:'Экспорт',
        split:'Разделить', delete:'Удалить', addText:'Добавить текст', properties:'Свойства',
        clipName:'Имя клипа', trimStart:'Начало обрезки', trimEnd:'Конец обрезки',
        speed:'Скорость', volume:'Громкость', timeline:'Таймлайн', clips:'клипов',
        emptyTimeline:'Нажмите для добавления медиа', addMediaHint:'Нажмите для добавления видео',
        videos:'Видео', browse:'Обзор', noFiles:'Файлы не найдены',
        exportTitle:'Экспорт видео', filename:'Имя файла', resolution:'Разрешение',
        saveLocation:'Место сохранения', videoFolder:'Папка видео', downloadLocal:'Скачать',
        cancel:'Отмена', enterText:'Введите текст', position:'Позиция', fontSize:'Размер шрифта',
        textColor:'Цвет текста', add:'Добавить', textOverlays:'Текстовые наложения',
        posTop:'Сверху', posCenter:'Центр', posBottom:'Снизу',
        success:'Успешно', error:'Ошибка', exported:'Видео сохранено',
        exporting:'Экспорт...', loading:'Загрузка...',
        deleteConfirm:'Вы уверены, что хотите удалить этот клип?',
        undone:'Отменено', redone:'Повторено'
      },
    zh: { title:'视频编辑器', addMedia:'添加媒体', export:'导出', split:'分割', delete:'删除', addText:'添加文本', properties:'属性', clipName:'片段名称', trimStart:'起始裁剪', trimEnd:'结束裁剪', speed:'速度', volume:'音量', timeline:'时间线', clips:'片段', emptyTimeline:'时间线为空', addMediaHint:'添加媒体开始编辑', videos:'视频', browse:'浏览', noFiles:'没有文件', exportTitle:'导出视频', filename:'文件名', resolution:'分辨率', saveLocation:'保存位置', videoFolder:'视频文件夹', downloadLocal:'下载到本地', cancel:'取消', enterText:'输入文本', position:'位置', fontSize:'字体大小', textColor:'文字颜色', add:'添加', textOverlays:'文字叠层', posTop:'顶部', posCenter:'中间', posBottom:'底部', success:'成功', error:'错误', exported:'已导出', exporting:'导出中', loading:'加载中', deleteConfirm:'确认删除？', undone:'已撤销', redone:'已重做' },
    ja: { title:'動画エディタ', addMedia:'メディア追加', export:'エクスポート', split:'分割', delete:'削除', addText:'テキスト追加', properties:'プロパティ', clipName:'クリップ名', trimStart:'開始トリム', trimEnd:'終了トリム', speed:'速度', volume:'音量', timeline:'タイムライン', clips:'クリップ', emptyTimeline:'タイムラインが空です', addMediaHint:'メディアを追加して編集開始', videos:'動画', browse:'参照', noFiles:'ファイルなし', exportTitle:'動画をエクスポート', filename:'ファイル名', resolution:'解像度', saveLocation:'保存先', videoFolder:'動画フォルダ', downloadLocal:'ローカルにダウンロード', cancel:'キャンセル', enterText:'テキストを入力', position:'位置', fontSize:'文字サイズ', textColor:'文字色', add:'追加', textOverlays:'テキストオーバーレイ', posTop:'上', posCenter:'中央', posBottom:'下', success:'成功', error:'エラー', exported:'エクスポート完了', exporting:'エクスポート中', loading:'読込中', deleteConfirm:'削除しますか？', undone:'元に戻しました', redone:'やり直しました' },
    it: { title:'Editor Video', addMedia:'Aggiungi media', export:'Esporta', split:'Dividi', delete:'Elimina', addText:'Aggiungi testo', properties:'Proprietà', clipName:'Nome clip', trimStart:'Inizio taglio', trimEnd:'Fine taglio', speed:'Velocità', volume:'Volume', timeline:'Timeline', clips:'Clip', emptyTimeline:'Timeline vuota', addMediaHint:'Aggiungi media per iniziare', videos:'Video', browse:'Sfoglia', noFiles:'Nessun file', exportTitle:'Esporta video', filename:'Nome file', resolution:'Risoluzione', saveLocation:'Posizione', videoFolder:'Cartella video', downloadLocal:'Scarica in locale', cancel:'Annulla', enterText:'Inserisci testo', position:'Posizione', fontSize:'Dimensione testo', textColor:'Colore testo', add:'Aggiungi', textOverlays:'Sovrapposizioni testo', posTop:'Alto', posCenter:'Centro', posBottom:'Basso', success:'Successo', error:'Errore', exported:'Esportato', exporting:'Esportazione', loading:'Caricamento', deleteConfirm:'Confermi eliminazione?', undone:'Annullato', redone:'Ripristinato' }
  };

    function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }
    const locale = ref(getLocale());
    function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
    function getToken() { try { return localStorage.getItem('auth_token') || ''; } catch { return ''; } }
    function authHeaders() { return { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }
    function authHeadersRaw() { return { 'Authorization': 'Bearer ' + getToken() }; }

    // ── State ──
    const previewVideo = ref(null);
    const previewContainer = ref(null);
    const rulerEl = ref(null);
    const trackEl = ref(null);
    const busy = ref(false);
    const busyText = ref('');
    const statusMsg = ref('');
    const statusType = ref('');
    const exportProgress = ref(0);
    const isPlaying = ref(false);
    const currentTime = ref(0);

    const clips = ref([]);
    const activeClipIndex = ref(-1);
    const activeClip = computed(() => activeClipIndex.value >= 0 ? clips.value[activeClipIndex.value] : null);

    // Undo/redo
    const undoStack = ref([]);
    const redoStack = ref([]);
    const canUndo = computed(() => undoStack.value.length > 0);
    const canRedo = computed(() => redoStack.value.length > 0);

    // File picker
    const showFilePicker = ref(false);
    const fpTab = ref('videos');
    const fpFiles = ref([]);

    // Export
    const showExportDialog = ref(false);
    const exportFilename = ref('edited_video.webm');
    const exportResolution = ref('720');
    const exportLocation = ref('server');

    // Text overlay dialog
    const showTextDialog = ref(false);
    const newTextOverlay = reactive({ text: '', position: 'bottom', fontSize: 32, color: '#ffffff' });

    function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }
    let playTimer = null;
    let clipIdCounter = 0;
    let dragSrcIndex = -1;

    // ── Helpers ──
    function showStatus(msg, type) {
      statusMsg.value = msg; statusType.value = type;
      setTimeout(() => { statusMsg.value = ''; }, 4000);
    }

    function formatTime(sec) {
      if (!sec || !isFinite(sec)) return '0:00';
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      const ms = Math.floor((sec % 1) * 10);
      return m + ':' + String(s).padStart(2, '0') + '.' + ms;
    }

    function formatSize(bytes) {
      if (!bytes) return '';
      if (bytes < 1048576) return (bytes / 1024).toFixed(0) + ' KB';
      return (bytes / 1048576).toFixed(1) + ' MB';
    }

    function genId() { return 'c' + (++clipIdCounter) + '_' + Date.now().toString(36); }

    // ── Clip management ──
    function clipDuration(c) {
      const dur = c.originalDuration - c.trimStart - (c.originalDuration - c.trimEnd);
      return Math.max(0.1, dur) / c.speed;
    }

    const totalDuration = computed(() => clips.value.reduce((s, c) => s + clipDuration(c), 0));

    function clipStartTime(index) {
      let t = 0;
      for (let i = 0; i < index; i++) t += clipDuration(clips.value[i]);
      return t;
    }

    function clipWidth(c) {
      const dur = clipDuration(c);
      const total = totalDuration.value;
      if (!total) return 120;
      const minW = 60;
      const maxW = 600;
      return Math.max(minW, Math.min(maxW, (dur / total) * 700));
    }

    // ── Playhead ──
    const playheadPercent = computed(() => {
      const total = totalDuration.value;
      if (!total) return 0;
      return Math.min(100, (currentTime.value / total) * 100);
    });

    const rulerMarks = computed(() => {
      const total = totalDuration.value;
      if (!total) return [];
      const marks = [];
      const interval = total < 10 ? 1 : total < 60 ? 5 : total < 300 ? 15 : 30;
      for (let t = 0; t <= total; t += interval) {
        marks.push({ sec: t, pct: (t / total) * 100 });
      }
      return marks;
    });

    // Active text overlays for preview
    const activeTextOverlays = computed(() => {
      if (!activeClip.value || !activeClip.value.texts) return [];
      return activeClip.value.texts.map(t => ({
        ...t,
        style: {
          position: 'absolute',
          left: '50%', transform: 'translateX(-50%)',
          [t.position === 'top' ? 'top' : t.position === 'center' ? 'top' : 'bottom']:
            t.position === 'center' ? '50%' : '10%',
          fontSize: t.fontSize + 'px',
          color: t.color || '#fff',
          textShadow: '2px 2px 6px rgba(0,0,0,0.8)',
          fontWeight: '700', pointerEvents: 'none', whiteSpace: 'nowrap'
        }
      }));
    });

    // ── Undo/Redo ──
    function pushUndo() {
      undoStack.value.push(JSON.stringify(clips.value));
      if (undoStack.value.length > 30) undoStack.value.shift();
      redoStack.value = [];
    }

    function undo() {
      if (!undoStack.value.length) return;
      redoStack.value.push(JSON.stringify(clips.value));
      clips.value = JSON.parse(undoStack.value.pop());
      activeClipIndex.value = Math.min(activeClipIndex.value, clips.value.length - 1);
      ElMessage.success(L('undone'));
    }

    function redo() {
      if (!redoStack.value.length) return;
      undoStack.value.push(JSON.stringify(clips.value));
      clips.value = JSON.parse(redoStack.value.pop());
      ElMessage.success(L('redone'));
    }

    // ── File loading ──
    function openFilePicker() {
      showFilePicker.value = true;
      fpTab.value = 'videos';
      loadVideoFiles();
    }

    async function loadVideoFiles() {
      fpFiles.value = [];
      try {
        const r = await fetch('/api/video/files', { headers: authHeaders() });
        if (!r.ok) return;
        const data = await r.json();
        fpFiles.value = [
          ...(data.public || []).map(f => ({ ...f, icon: '🎬' })),
          ...(data.user || []).map(f => ({ ...f, icon: '🎬' }))
        ];
      } catch {}
    }

    async function loadFsBrowse() {
      fpFiles.value = [];
      try {
        const r = await fetch('/api/fs/list?path=', { headers: authHeaders() });
        if (!r.ok) return;
        const list = await r.json();
        const videoExts = ['.mp4','.webm','.mkv','.avi','.mov','.ogv'];
        fpFiles.value = list
          .filter(f => !f.isDir && videoExts.includes((f.ext || '').toLowerCase()))
          .map(f => ({
            filename: f.name, size: f.size, icon: '📄',
            url: '__fs__:' + f.path
          }));
      } catch {}
    }

    async function addClipFromFile(f) {
      showFilePicker.value = false;
      busy.value = true;
      busyText.value = L('loading');
      try {
        let videoUrl = f.url;
        // Handle filesystem files
        if (videoUrl.startsWith('__fs__:')) {
          const fsPath = videoUrl.slice(7);
          const r = await fetch('/api/fs/read-binary?path=' + encodeURIComponent(fsPath), { headers: authHeaders() });
          if (!r.ok) throw new Error('Failed to fetch');
          const data = await r.json();
          const binary = atob(data.content);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          const blob = new Blob([bytes], { type: 'video/mp4' });
          videoUrl = URL.createObjectURL(blob);
        }

        // Probe duration using a hidden video element
        const dur = await probeDuration(videoUrl);
        pushUndo();
        clips.value.push({
          id: genId(),
          name: (f.filename || f.name || 'clip').replace(/\.[^.]+$/, ''),
          url: videoUrl,
          originalDuration: dur,
          trimStart: 0,
          trimEnd: dur,
          speed: 1,
          volume: 100,
          texts: []
        });
        activeClipIndex.value = clips.value.length - 1;
        loadClipToPreview(clips.value.length - 1);
      } catch (e) {
        showStatus(e.message || L('error'), 'error');
      } finally {
        busy.value = false;
      }
    }

    function probeDuration(url) {
      return new Promise((resolve, reject) => {
        const v = document.createElement('video');
        v.preload = 'metadata';
        v.onloadedmetadata = () => { resolve(v.duration || 10); v.remove(); };
        v.onerror = () => { reject(new Error('Cannot load video')); v.remove(); };
        v.src = url;
      });
    }

    // ── Preview ──
    function loadClipToPreview(index) {
      const v = previewVideo.value;
      const c = clips.value[index];
      if (!v || !c) return;
      v.src = c.url;
      v.currentTime = c.trimStart;
      v.volume = c.volume / 100;
      v.playbackRate = c.speed;
    }

    function selectClip(i) {
      activeClipIndex.value = i;
      loadClipToPreview(i);
      // Set currentTime to clip start in timeline
      currentTime.value = clipStartTime(i);
    }

    function onPreviewMeta() {}

    function onPreviewTime() {
      const v = previewVideo.value;
      const c = activeClip.value;
      if (!v || !c) return;
      // Stop at trimEnd
      if (v.currentTime >= c.trimEnd) {
        // Move to next clip
        const nextIdx = activeClipIndex.value + 1;
        if (nextIdx < clips.value.length && isPlaying.value) {
          activeClipIndex.value = nextIdx;
          loadClipToPreview(nextIdx);
          v.play();
        } else {
          v.pause();
          isPlaying.value = false;
        }
        return;
      }
      // Update timeline cursor
      const localTime = (v.currentTime - c.trimStart) / c.speed;
      currentTime.value = clipStartTime(activeClipIndex.value) + localTime;
    }

    function onPreviewEnded() {
      const nextIdx = activeClipIndex.value + 1;
      if (nextIdx < clips.value.length && isPlaying.value) {
        activeClipIndex.value = nextIdx;
        loadClipToPreview(nextIdx);
        previewVideo.value.play();
      } else {
        isPlaying.value = false;
      }
    }

    function togglePlay() {
      const v = previewVideo.value;
      if (!v || !clips.value.length) return;
      if (isPlaying.value) {
        v.pause();
        isPlaying.value = false;
      } else {
        if (activeClipIndex.value < 0) activeClipIndex.value = 0;
        loadClipToPreview(activeClipIndex.value);
        const c = clips.value[activeClipIndex.value];
        v.currentTime = c.trimStart;
        v.play();
        isPlaying.value = true;
      }
    }

    function skipToStart() {
      isPlaying.value = false;
      if (previewVideo.value) previewVideo.value.pause();
      activeClipIndex.value = 0;
      currentTime.value = 0;
      if (clips.value.length) loadClipToPreview(0);
    }

    function skipToEnd() {
      isPlaying.value = false;
      if (previewVideo.value) previewVideo.value.pause();
      currentTime.value = totalDuration.value;
    }

    function seekOnRuler(e) {
      const rect = rulerEl.value.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const seekTime = pct * totalDuration.value;
      currentTime.value = seekTime;
      // Find which clip this falls in
      let t = 0;
      for (let i = 0; i < clips.value.length; i++) {
        const d = clipDuration(clips.value[i]);
        if (seekTime <= t + d) {
          activeClipIndex.value = i;
          loadClipToPreview(i);
          const localTime = seekTime - t;
          const c = clips.value[i];
          previewVideo.value.currentTime = c.trimStart + localTime * c.speed;
          return;
        }
        t += d;
      }
    }

    function onTrimChange() {
      const c = activeClip.value;
      if (!c) return;
      if (c.trimStart >= c.trimEnd) c.trimEnd = Math.min(c.trimStart + 0.5, c.originalDuration);
    }

    // ── Clip operations ──
    function splitClip() {
      if (!activeClip.value) return;
      const v = previewVideo.value;
      if (!v) return;
      pushUndo();
      const c = activeClip.value;
      const splitTime = v.currentTime;
      if (splitTime <= c.trimStart || splitTime >= c.trimEnd) {
        ElMessage.error('Cannot split at this position');
        return;
      }
      const newClip = {
        id: genId(), name: c.name + ' (2)', url: c.url,
        originalDuration: c.originalDuration,
        trimStart: splitTime, trimEnd: c.trimEnd,
        speed: c.speed, volume: c.volume, texts: []
      };
      c.trimEnd = splitTime;
      clips.value.splice(activeClipIndex.value + 1, 0, newClip);
    }

    async function deleteClip() {
      if (!activeClip.value) return;
      try { await ElMessageBox.confirm(L('deleteConfirm'), { confirmButtonText: 'OK', cancelButtonText: L('cancel'), type: 'warning' }); } catch { return; }
      pushUndo();
      clips.value.splice(activeClipIndex.value, 1);
      activeClipIndex.value = Math.min(activeClipIndex.value, clips.value.length - 1);
      if (clips.value.length && activeClipIndex.value >= 0) loadClipToPreview(activeClipIndex.value);
    }

    // ── Text overlays ──
    function addTextOverlay() {
      if (!activeClip.value) return;
      newTextOverlay.text = '';
      newTextOverlay.position = 'bottom';
      newTextOverlay.fontSize = 32;
      newTextOverlay.color = '#ffffff';
      showTextDialog.value = true;
    }

    function confirmAddText() {
      if (!activeClip.value || !newTextOverlay.text.trim()) return;
      pushUndo();
      if (!activeClip.value.texts) activeClip.value.texts = [];
      activeClip.value.texts.push({
        id: genId(),
        text: newTextOverlay.text.trim(),
        position: newTextOverlay.position,
        fontSize: newTextOverlay.fontSize,
        color: newTextOverlay.color
      });
      showTextDialog.value = false;
    }

    function removeText(ti) {
      if (!activeClip.value) return;
      pushUndo();
      activeClip.value.texts.splice(ti, 1);
    }

    // ── Drag & drop reorder ──
    function onDragStart(i, e) {
      dragSrcIndex = i;
      e.dataTransfer.effectAllowed = 'move';
    }

    function onDrop(i) {
      if (dragSrcIndex < 0 || dragSrcIndex === i) return;
      pushUndo();
      const item = clips.value.splice(dragSrcIndex, 1)[0];
      clips.value.splice(i, 0, item);
      activeClipIndex.value = i;
      dragSrcIndex = -1;
    }

    // ── Export ──
    function exportVideo() {
      exportFilename.value = 'edited_video.webm';
      showExportDialog.value = true;
    }

    async function confirmExport() {
      if (!clips.value.length) return;
      showExportDialog.value = false;
      busy.value = true;
      busyText.value = L('exporting');
      exportProgress.value = 0;

      try {
        const resH = parseInt(exportResolution.value);
        const resW = Math.round(resH * 16 / 9);

        // Create offscreen canvas & video element for rendering
        const canvas = document.createElement('canvas');
        canvas.width = resW;
        canvas.height = resH;
        const ctx = canvas.getContext('2d');

        const captureStream = canvas.captureStream(30);
        // Create audio context for mixing
        const audioCtx = new AudioContext();
        const audioDest = audioCtx.createMediaStreamDestination();
        captureStream.addTrack(audioDest.stream.getAudioTracks()[0]);

        const recorder = new MediaRecorder(captureStream, {
          mimeType: 'video/webm;codecs=vp9,opus',
          videoBitsPerSecond: resH >= 1080 ? 8000000 : resH >= 720 ? 5000000 : 2500000
        });

        const chunks = [];
        recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };

        const exportDone = new Promise((resolve) => { recorder.onstop = resolve; });
        recorder.start(100);

        // Render each clip sequentially
        for (let ci = 0; ci < clips.value.length; ci++) {
          const clip = clips.value[ci];
          exportProgress.value = Math.round((ci / clips.value.length) * 90);

          await renderClipToCanvas(clip, ctx, canvas, audioCtx, audioDest, resW, resH);
        }

        recorder.stop();
        await exportDone;
        audioCtx.close();

        exportProgress.value = 95;

        const blob = new Blob(chunks, { type: 'video/webm' });
        const fname = (exportFilename.value.trim() || 'edited_video') + (exportFilename.value.endsWith('.webm') ? '' : '.webm');

        if (exportLocation.value === 'download') {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = fname; a.click();
          URL.revokeObjectURL(url);
        } else {
          const formData = new FormData();
          formData.append('file', blob, fname);
          const r = await fetch('/api/video-editor/save', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + getToken() },
            body: formData
          });
          if (!r.ok) throw new Error('Upload failed');
        }

        exportProgress.value = 100;
        showStatus(L('exported'), 'success');
      } catch (e) {
        showStatus(e.message || L('error'), 'error');
      } finally {
        busy.value = false;
        exportProgress.value = 0;
      }
    }

    function renderClipToCanvas(clip, ctx, canvas, audioCtx, audioDest, w, h) {
      return new Promise((resolve) => {
        const vid = document.createElement('video');
        vid.crossOrigin = 'anonymous';
        vid.src = clip.url;
        vid.volume = 0; // We handle audio via Web Audio API
        vid.playbackRate = clip.speed;
        vid.currentTime = clip.trimStart;

        let audioSource = null;
        let gainNode = null;

        vid.onloadeddata = () => {
          try {
            audioSource = audioCtx.createMediaElementSource(vid);
            gainNode = audioCtx.createGain();
            gainNode.gain.value = clip.volume / 100;
            audioSource.connect(gainNode);
            gainNode.connect(audioDest);
          } catch {}

          vid.play();
          drawFrame();
        };

        function drawFrame() {
          if (vid.currentTime >= clip.trimEnd || vid.ended) {
            vid.pause();
            vid.remove();
            resolve();
            return;
          }
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, w, h);
          // Draw video frame scaled to canvas
          const vw = vid.videoWidth || w;
          const vh = vid.videoHeight || h;
          const scale = Math.min(w / vw, h / vh);
          const dx = (w - vw * scale) / 2;
          const dy = (h - vh * scale) / 2;
          ctx.drawImage(vid, dx, dy, vw * scale, vh * scale);

          // Draw text overlays
          if (clip.texts) {
            clip.texts.forEach(t => {
              ctx.font = 'bold ' + t.fontSize + 'px sans-serif';
              ctx.fillStyle = t.color || '#fff';
              ctx.textAlign = 'center';
              ctx.shadowColor = 'rgba(0,0,0,0.8)';
              ctx.shadowBlur = 6;
              let ty = h * 0.1;
              if (t.position === 'center') ty = h / 2;
              else if (t.position === 'bottom') ty = h * 0.9;
              ctx.fillText(t.text, w / 2, ty);
              ctx.shadowBlur = 0;
            });
          }

          requestAnimationFrame(drawFrame);
        }

        vid.onerror = () => { vid.remove(); resolve(); };
      });
    }

    // ── Keyboard shortcuts ──
    function onKeydown(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
      else if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
      else if (e.key === ' ') { e.preventDefault(); togglePlay(); }
      else if (e.key === 'Delete' && activeClip.value) { e.preventDefault(); deleteClip(); }
    }

    onMounted(() => {
      window.addEventListener('locale-changed', onLocaleChanged);
    });

    onUnmounted(() => {
      window.removeEventListener('locale-changed', onLocaleChanged)if (isPlaying.value && previewVideo.value) previewVideo.value.pause();
    });

    return {
      previewVideo, previewContainer, rulerEl, trackEl,
      busy, busyText, statusMsg, statusType, exportProgress,
      isPlaying, currentTime, clips, activeClipIndex, activeClip,
      canUndo, canRedo, showFilePicker, fpTab, fpFiles,
      showExportDialog, exportFilename, exportResolution, exportLocation,
      showTextDialog, newTextOverlay,
      totalDuration, playheadPercent, rulerMarks, activeTextOverlays,
      L, formatTime, formatSize, clipDuration, clipWidth,
      openFilePicker, loadVideoFiles, loadFsBrowse, addClipFromFile,
      selectClip, togglePlay, skipToStart, skipToEnd, seekOnRuler,
      onPreviewMeta, onPreviewTime, onPreviewEnded, onTrimChange,
      splitClip, deleteClip, addTextOverlay, confirmAddText, removeText,
      onDragStart, onDrop, undo, redo,
      exportVideo, confirmExport, onKeydown
    };
  }
})
