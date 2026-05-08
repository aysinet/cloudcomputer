(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, watch, nextTick } = Vue;

  // ── i18n ──
  const LANGS = {
    tr: {
      title:'FFmpeg.wasm',
      loadEngine:'FFmpeg Motoru Yükle',
      loadingEngine:'FFmpeg motoru yükleniyor (~31 MB)...',
      engineReady:'Motor hazır',
      selectFile:'Dosya Seç',
      convert:'Dönüştür',
      download:'İndir',
      save:'Kaydet',
      converting:'Dönüştürülüyor...',
      progress:'İlerleme',
      done:'Tamamlandı',
      error:'Hata',
      outputFormat:'Çıkış Formatı',
      inputFile:'Giriş Dosyası',
      outputFile:'Çıkış Dosyası',
      noFile:'Lütfen bir dosya seçin',
      dragDrop:'Dosyayı buraya sürükleyin veya tıklayın',
      fileInfo:'Dosya Bilgisi',
      name:'Ad',
      size:'Boyut',
      type:'Tür',
      logs:'Günlük',
      clearLogs:'Temizle',
      preset:'Ön Ayar',
      custom:'Özel Komut',
      customArgs:'FFmpeg argümanları (-i input otomatik eklenir)',
      videoFormats:'Video Formatları',
      audioFormats:'Ses Formatları',
      imageFormats:'Görüntü Formatları',
      presets:'Ön Ayarlar',
      p_compress:'Video Sıkıştır',
      p_extractAudio:'Ses Çıkar (MP3)',
      p_toGif:'GIF\'e Dönüştür',
      p_resize720:'720p\'ye Boyutlandır',
      p_resize480:'480p\'ye Boyutlandır',
      p_trim:'Kes (ilk 10sn)',
      p_mute:'Sessiz Video',
      p_audioOnly:'Sadece Ses (AAC)',
      p_webm:'WebM\'e Dönüştür',
      browseServer:'Sunucudan Aç',
      videoFiles:'Video Dosyaları',
      allFiles:'Tüm Dosyalar',
      noFiles:'Dosya bulunamadı',
      cancel:'İptal',
      saveToServer:'Sunucuya Kaydet',
      savedOk:'Dosya kaydedildi',
      savePath:'Kayıt Yolu',
      downloads:'İndirilenler',
      videos:'Videolar'
    },
    en: {
      title:'FFmpeg.wasm',
      loadEngine:'Load FFmpeg Engine',
      loadingEngine:'Loading FFmpeg engine (~31 MB)...',
      engineReady:'Engine ready',
      selectFile:'Select File',
      convert:'Convert',
      download:'Download',
      save:'Save',
      converting:'Converting...',
      progress:'Progress',
      done:'Done',
      error:'Error',
      outputFormat:'Output Format',
      inputFile:'Input File',
      outputFile:'Output File',
      noFile:'Please select a file',
      dragDrop:'Drag file here or click to select',
      fileInfo:'File Info',
      name:'Name',
      size:'Size',
      type:'Type',
      logs:'Log',
      clearLogs:'Clear',
      preset:'Preset',
      custom:'Custom Command',
      customArgs:'FFmpeg arguments (-i input is added automatically)',
      videoFormats:'Video Formats',
      audioFormats:'Audio Formats',
      imageFormats:'Image Formats',
      presets:'Presets',
      p_compress:'Compress Video',
      p_extractAudio:'Extract Audio (MP3)',
      p_toGif:'Convert to GIF',
      p_resize720:'Resize to 720p',
      p_resize480:'Resize to 480p',
      p_trim:'Trim (first 10s)',
      p_mute:'Mute Video',
      p_audioOnly:'Audio Only (AAC)',
      p_webm:'Convert to WebM',
      browseServer:'Browse Server',
      videoFiles:'Video Files',
      allFiles:'All Files',
      noFiles:'No files found',
      cancel:'Cancel',
      saveToServer:'Save to Server',
      savedOk:'File saved',
      savePath:'Save Path',
      downloads:'Downloads',
      videos:'Videos'
    },
    de: {
      title:'FFmpeg.wasm',
      loadEngine:'FFmpeg-Engine laden',
      loadingEngine:'FFmpeg-Engine wird geladen (~31 MB)...',
      engineReady:'Engine bereit',
      selectFile:'Datei auswählen',
      convert:'Konvertieren',
      download:'Herunterladen',
      save:'Speichern',
      converting:'Konvertierung...',
      progress:'Fortschritt',
      done:'Fertig',
      error:'Fehler',
      outputFormat:'Ausgabeformat',
      inputFile:'Eingabedatei',
      outputFile:'Ausgabedatei',
      noFile:'Bitte wählen Sie eine Datei',
      dragDrop:'Datei hierher ziehen oder klicken',
      fileInfo:'Dateiinfo',
      name:'Name',
      size:'Größe',
      type:'Typ',
      logs:'Protokoll',
      clearLogs:'Löschen',
      preset:'Voreinstellung',
      custom:'Benutzerdefiniert',
      customArgs:'FFmpeg-Argumente (-i input wird automatisch hinzugefügt)',
      videoFormats:'Videoformate',
      audioFormats:'Audioformate',
      imageFormats:'Bildformate',
      presets:'Voreinstellungen',
      p_compress:'Video komprimieren',
      p_extractAudio:'Audio extrahieren (MP3)',
      p_toGif:'In GIF konvertieren',
      p_resize720:'Auf 720p skalieren',
      p_resize480:'Auf 480p skalieren',
      p_trim:'Schneiden (erste 10s)',
      p_mute:'Video stummschalten',
      p_audioOnly:'Nur Audio (AAC)',
      p_webm:'In WebM konvertieren',
      browseServer:'Server durchsuchen',
      videoFiles:'Videodateien',
      allFiles:'Alle Dateien',
      noFiles:'Keine Dateien gefunden',
      cancel:'Abbrechen',
      saveToServer:'Auf Server speichern',
      savedOk:'Datei gespeichert',
      savePath:'Speicherpfad',
      downloads:'Downloads',
      videos:'Videos'
    },
    fr: {
      title:'FFmpeg.wasm',
      loadEngine:'Charger le moteur FFmpeg',
      loadingEngine:'Chargement du moteur FFmpeg (~31 Mo)...',
      engineReady:'Moteur prêt',
      selectFile:'Sélectionner un fichier',
      convert:'Convertir',
      download:'Télécharger',
      save:'Enregistrer',
      converting:'Conversion...',
      progress:'Progression',
      done:'Terminé',
      error:'Erreur',
      outputFormat:'Format de sortie',
      inputFile:'Fichier d\'entrée',
      outputFile:'Fichier de sortie',
      noFile:'Veuillez sélectionner un fichier',
      dragDrop:'Glissez un fichier ici ou cliquez',
      fileInfo:'Infos fichier',
      name:'Nom',
      size:'Taille',
      type:'Type',
      logs:'Journal',
      clearLogs:'Effacer',
      preset:'Préréglage',
      custom:'Commande personnalisée',
      customArgs:'Arguments FFmpeg (-i input ajouté automatiquement)',
      videoFormats:'Formats vidéo',
      audioFormats:'Formats audio',
      imageFormats:'Formats image',
      presets:'Préréglages',
      p_compress:'Compresser la vidéo',
      p_extractAudio:'Extraire l\'audio (MP3)',
      p_toGif:'Convertir en GIF',
      p_resize720:'Redimensionner en 720p',
      p_resize480:'Redimensionner en 480p',
      p_trim:'Couper (10 premières sec)',
      p_mute:'Vidéo muette',
      p_audioOnly:'Audio uniquement (AAC)',
      p_webm:'Convertir en WebM',
      browseServer:'Parcourir le serveur',
      videoFiles:'Fichiers vidéo',
      allFiles:'Tous les fichiers',
      noFiles:'Aucun fichier trouvé',
      cancel:'Annuler',
      saveToServer:'Enregistrer sur le serveur',
      savedOk:'Fichier enregistré',
      savePath:'Chemin d\'enregistrement',
      downloads:'Téléchargements',
      videos:'Vidéos'
    },
    es: {
      title:'FFmpeg.wasm',
      loadEngine:'Cargar motor FFmpeg',
      loadingEngine:'Cargando motor FFmpeg (~31 MB)...',
      engineReady:'Motor listo',
      selectFile:'Seleccionar archivo',
      convert:'Convertir',
      download:'Descargar',
      save:'Guardar',
      converting:'Convirtiendo...',
      progress:'Progreso',
      done:'Hecho',
      error:'Error',
      outputFormat:'Formato de salida',
      inputFile:'Archivo de entrada',
      outputFile:'Archivo de salida',
      noFile:'Seleccione un archivo',
      dragDrop:'Arrastre un archivo aquí o haga clic',
      fileInfo:'Info del archivo',
      name:'Nombre',
      size:'Tamaño',
      type:'Tipo',
      logs:'Registro',
      clearLogs:'Limpiar',
      preset:'Preajuste',
      custom:'Comando personalizado',
      customArgs:'Argumentos FFmpeg (-i input se agrega automáticamente)',
      videoFormats:'Formatos de video',
      audioFormats:'Formatos de audio',
      imageFormats:'Formatos de imagen',
      presets:'Preajustes',
      p_compress:'Comprimir video',
      p_extractAudio:'Extraer audio (MP3)',
      p_toGif:'Convertir a GIF',
      p_resize720:'Redimensionar a 720p',
      p_resize480:'Redimensionar a 480p',
      p_trim:'Recortar (primeros 10s)',
      p_mute:'Video sin sonido',
      p_audioOnly:'Solo audio (AAC)',
      p_webm:'Convertir a WebM',
      browseServer:'Explorar servidor',
      videoFiles:'Archivos de video',
      allFiles:'Todos los archivos',
      noFiles:'No se encontraron archivos',
      cancel:'Cancelar',
      saveToServer:'Guardar en servidor',
      savedOk:'Archivo guardado',
      savePath:'Ruta de guardado',
      downloads:'Descargas',
      videos:'Videos'
    },
    ru: {
      title:'FFmpeg.wasm',
      loadEngine:'Загрузить движок FFmpeg',
      loadingEngine:'Загрузка движка FFmpeg (~31 МБ)...',
      engineReady:'Движок готов',
      selectFile:'Выбрать файл',
      convert:'Конвертировать',
      download:'Скачать',
      save:'Сохранить',
      converting:'Конвертация...',
      progress:'Прогресс',
      done:'Готово',
      error:'Ошибка',
      outputFormat:'Формат вывода',
      inputFile:'Входной файл',
      outputFile:'Выходной файл',
      noFile:'Выберите файл',
      dragDrop:'Перетащите файл сюда или нажмите',
      fileInfo:'Информация о файле',
      name:'Имя',
      size:'Размер',
      type:'Тип',
      logs:'Журнал',
      clearLogs:'Очистить',
      preset:'Пресет',
      custom:'Произвольная команда',
      customArgs:'Аргументы FFmpeg (-i input добавляется автоматически)',
      videoFormats:'Форматы видео',
      audioFormats:'Форматы аудио',
      imageFormats:'Форматы изображений',
      presets:'Пресеты',
      p_compress:'Сжать видео',
      p_extractAudio:'Извлечь аудио (MP3)',
      p_toGif:'Конвертировать в GIF',
      p_resize720:'Изменить размер до 720p',
      p_resize480:'Изменить размер до 480p',
      p_trim:'Обрезать (первые 10с)',
      p_mute:'Видео без звука',
      p_audioOnly:'Только аудио (AAC)',
      p_webm:'Конвертировать в WebM',
      browseServer:'Обзор сервера',
      videoFiles:'Видеофайлы',
      allFiles:'Все файлы',
      noFiles:'Файлы не найдены',
      cancel:'Отмена',
      saveToServer:'Сохранить на сервер',
      savedOk:'Файл сохранён',
      savePath:'Путь сохранения',
      downloads:'Загрузки',
      videos:'Видео'
    },
    zh: {
      title:'FFmpeg.wasm',
      loadEngine:'加载FFmpeg引擎',
      loadingEngine:'正在加载FFmpeg引擎（~31 MB）...',
      engineReady:'引擎就绪',
      selectFile:'选择文件',
      convert:'转换',
      download:'下载',
      save:'保存',
      converting:'转换中...',
      progress:'进度',
      done:'完成',
      error:'错误',
      outputFormat:'输出格式',
      inputFile:'输入文件',
      outputFile:'输出文件',
      noFile:'请选择一个文件',
      dragDrop:'拖放文件到此处或点击选择',
      fileInfo:'文件信息',
      name:'名称',
      size:'大小',
      type:'类型',
      logs:'日志',
      clearLogs:'清除',
      preset:'预设',
      custom:'自定义命令',
      customArgs:'FFmpeg参数（-i input自动添加）',
      videoFormats:'视频格式',
      audioFormats:'音频格式',
      imageFormats:'图像格式',
      presets:'预设',
      p_compress:'压缩视频',
      p_extractAudio:'提取音频 (MP3)',
      p_toGif:'转换为GIF',
      p_resize720:'调整为720p',
      p_resize480:'调整为480p',
      p_trim:'裁剪（前10秒）',
      p_mute:'静音视频',
      p_audioOnly:'仅音频 (AAC)',
      p_webm:'转换为WebM',
      browseServer:'浏览服务器',
      videoFiles:'视频文件',
      allFiles:'所有文件',
      noFiles:'未找到文件',
      cancel:'取消',
      saveToServer:'保存到服务器',
      savedOk:'文件已保存',
      savePath:'保存路径',
      downloads:'下载',
      videos:'视频'
    },
    ja: {
      title:'FFmpeg.wasm',
      loadEngine:'FFmpegエンジンを読み込む',
      loadingEngine:'FFmpegエンジンを読み込み中（~31 MB）...',
      engineReady:'エンジン準備完了',
      selectFile:'ファイルを選択',
      convert:'変換',
      download:'ダウンロード',
      save:'保存',
      converting:'変換中...',
      progress:'進捗',
      done:'完了',
      error:'エラー',
      outputFormat:'出力形式',
      inputFile:'入力ファイル',
      outputFile:'出力ファイル',
      noFile:'ファイルを選択してください',
      dragDrop:'ファイルをドラッグまたはクリックして選択',
      fileInfo:'ファイル情報',
      name:'名前',
      size:'サイズ',
      type:'タイプ',
      logs:'ログ',
      clearLogs:'クリア',
      preset:'プリセット',
      custom:'カスタムコマンド',
      customArgs:'FFmpeg引数（-i inputは自動的に追加されます）',
      videoFormats:'動画形式',
      audioFormats:'音声形式',
      imageFormats:'画像形式',
      presets:'プリセット',
      p_compress:'動画を圧縮',
      p_extractAudio:'音声を抽出 (MP3)',
      p_toGif:'GIFに変換',
      p_resize720:'720pにリサイズ',
      p_resize480:'480pにリサイズ',
      p_trim:'トリム（最初の10秒）',
      p_mute:'無音動画',
      p_audioOnly:'音声のみ (AAC)',
      p_webm:'WebMに変換',
      browseServer:'サーバーを参照',
      videoFiles:'動画ファイル',
      allFiles:'すべてのファイル',
      noFiles:'ファイルが見つかりません',
      cancel:'キャンセル',
      saveToServer:'サーバーに保存',
      savedOk:'ファイルが保存されました',
      savePath:'保存パス',
      downloads:'ダウンロード',
      videos:'ビデオ'
    }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  // ── Output formats & presets ──
  const OUTPUT_FORMATS = [
    { group: 'video', formats: ['mp4','webm','avi','mkv','mov','flv','wmv','ts','gif'] },
    { group: 'audio', formats: ['mp3','aac','wav','ogg','flac','m4a','wma'] },
    { group: 'image', formats: ['png','jpg','bmp','webp'] }
  ];

  const PRESETS = [
    { id: 'compress',     ext: 'mp4',  args: ['-c:v','libx264','-crf','28','-preset','fast','-c:a','aac','-b:a','128k'] },
    { id: 'extractAudio', ext: 'mp3',  args: ['-vn','-c:a','libmp3lame','-b:a','192k'] },
    { id: 'toGif',        ext: 'gif',  args: ['-vf','fps=10,scale=480:-1:flags=lanczos','-c:v','gif'] },
    { id: 'resize720',    ext: 'mp4',  args: ['-vf','scale=-2:720','-c:v','libx264','-crf','23','-c:a','aac'] },
    { id: 'resize480',    ext: 'mp4',  args: ['-vf','scale=-2:480','-c:v','libx264','-crf','23','-c:a','aac'] },
    { id: 'trim',         ext: 'mp4',  args: ['-t','10','-c:v','libx264','-c:a','aac'] },
    { id: 'mute',         ext: 'mp4',  args: ['-an','-c:v','copy'] },
    { id: 'audioOnly',    ext: 'aac',  args: ['-vn','-c:a','aac','-b:a','192k'] },
    { id: 'webm',         ext: 'webm', args: ['-c:v','libvpx','-crf','30','-b:v','0','-c:a','libvorbis'] }
  ];

  const FFMPEG_CDN = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd';

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
      function onLocaleChanged() { locale.value = getLocale(); }

      // ── State ──
      const ffmpegLoaded = ref(false);
      const ffmpegLoading = ref(false);
      const busy = ref(false);
      const busyText = ref('');
      const progressPct = ref(0);
      const inputFile = ref(null);
      const inputFileName = ref('');
      const inputFileSize = ref(0);
      const inputFileType = ref('');
      const inputPreviewUrl = ref('');
      const outputFormat = ref('mp4');
      const outputBlob = ref(null);
      const outputUrl = ref('');
      const outputFileName = ref('');
      const selectedPreset = ref('');
      const useCustom = ref(false);
      const customArgs = ref('');
      const logLines = ref([]);
      const showLogs = ref(false);
      const showFilePicker = ref(false);
      const fpFiles = ref([]);
      const fpLoading = ref(false);
      const showSaveDialog = ref(false);
      const savePath = ref('downloads');

      let ffmpeg = null;
      let inputFileData = null;

      // ── FFmpeg loader ──
      async function loadFFmpeg() {
        if (ffmpegLoaded.value || ffmpegLoading.value) return;
        ffmpegLoading.value = true;
        logLines.value = [];
        addLog('Loading FFmpeg core...');
        try {
          // Load scripts dynamically
          await loadScript('https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js');
          await loadScript('https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.1/dist/umd/util.js');

          const { FFmpeg } = FFmpegWASM;
          const { toBlobURL } = FFmpegUtil;
          ffmpeg = new FFmpeg();

          ffmpeg.on('log', ({ message }) => {
            addLog(message);
          });
          ffmpeg.on('progress', ({ progress }) => {
            progressPct.value = Math.round((progress || 0) * 100);
          });

          await ffmpeg.load({
            coreURL: await toBlobURL(FFMPEG_CDN + '/ffmpeg-core.js', 'text/javascript'),
            wasmURL: await toBlobURL(FFMPEG_CDN + '/ffmpeg-core.wasm', 'application/wasm'),
          });

          ffmpegLoaded.value = true;
          addLog('FFmpeg engine loaded successfully');
        } catch (e) {
          addLog('ERROR: ' + e.message);
          console.error('FFmpeg load error:', e);
        } finally {
          ffmpegLoading.value = false;
        }
      }

      function loadScript(src) {
        return new Promise((resolve, reject) => {
          if (document.querySelector('script[src="' + src + '"]')) return resolve();
          const s = document.createElement('script');
          s.src = src;
          s.onload = resolve;
          s.onerror = () => reject(new Error('Failed to load: ' + src));
          document.head.appendChild(s);
        });
      }

      function addLog(msg) {
        logLines.value.push({ t: new Date().toLocaleTimeString(), m: msg });
        if (logLines.value.length > 500) logLines.value.splice(0, 100);
      }

      // ── File input ──
      function onFileInput(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        setInputFile(file);
      }

      function setInputFile(file) {
        inputFile.value = file;
        inputFileName.value = file.name;
        inputFileSize.value = file.size;
        inputFileType.value = file.type || '?';
        // Revoke old preview
        if (inputPreviewUrl.value) { URL.revokeObjectURL(inputPreviewUrl.value); }
        inputPreviewUrl.value = URL.createObjectURL(file);
        // Reset output
        clearOutput();
        // Guess output format from extension
        const ext = file.name.split('.').pop().toLowerCase();
        if (ext === 'mp4') outputFormat.value = 'webm';
        else outputFormat.value = 'mp4';
        addLog('Input: ' + file.name + ' (' + formatSize(file.size) + ')');
      }

      function clearOutput() {
        if (outputUrl.value) URL.revokeObjectURL(outputUrl.value);
        outputBlob.value = null;
        outputUrl.value = '';
        outputFileName.value = '';
        progressPct.value = 0;
      }

      // ── Drag & drop ──
      function onDrop(e) {
        e.preventDefault();
        const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (file) setInputFile(file);
      }
      function onDragOver(e) { e.preventDefault(); }

      // ── Convert ──
      async function convert() {
        if (!inputFile.value) return;
        if (!ffmpegLoaded.value) { await loadFFmpeg(); if (!ffmpegLoaded.value) return; }

        busy.value = true;
        busyText.value = L('converting');
        progressPct.value = 0;
        clearOutput();

        try {
          const { fetchFile } = FFmpegUtil;
          const inputName = 'input_' + Date.now() + '.' + getExt(inputFileName.value);
          const ext = useCustom.value ? getOutputExtFromCustom() : (selectedPreset.value ? getPresetById(selectedPreset.value).ext : outputFormat.value);
          const outName = 'output_' + Date.now() + '.' + ext;

          addLog('Writing input file...');
          await ffmpeg.writeFile(inputName, await fetchFile(inputFile.value));

          let args;
          if (useCustom.value && customArgs.value.trim()) {
            args = ['-i', inputName, ...parseCustomArgs(customArgs.value), outName];
          } else if (selectedPreset.value) {
            const preset = getPresetById(selectedPreset.value);
            args = ['-i', inputName, ...preset.args, outName];
          } else {
            args = ['-i', inputName, outName];
          }

          addLog('Executing: ffmpeg ' + args.join(' '));
          await ffmpeg.exec(args);

          const data = await ffmpeg.readFile(outName);
          const mime = getMime(ext);
          const blob = new Blob([data.buffer], { type: mime });
          outputBlob.value = blob;
          outputUrl.value = URL.createObjectURL(blob);
          outputFileName.value = stripExt(inputFileName.value) + '.' + ext;
          progressPct.value = 100;
          addLog('Conversion complete: ' + outputFileName.value + ' (' + formatSize(blob.size) + ')');

          // Cleanup WASM FS
          try { await ffmpeg.deleteFile(inputName); } catch {}
          try { await ffmpeg.deleteFile(outName); } catch {}
        } catch (e) {
          addLog('ERROR: ' + e.message);
          console.error('Convert error:', e);
        } finally {
          busy.value = false;
          busyText.value = '';
        }
      }

      function getPresetById(id) { return PRESETS.find(p => p.id === id) || PRESETS[0]; }

      function getOutputExtFromCustom() {
        const parts = customArgs.value.trim().split(/\s+/);
        const last = parts[parts.length - 1];
        if (last && last.includes('.')) return last.split('.').pop();
        return outputFormat.value;
      }

      function parseCustomArgs(str) {
        return str.trim().split(/\s+/).filter(Boolean);
      }

      function onPresetChange(val) {
        if (val) {
          useCustom.value = false;
          const p = getPresetById(val);
          outputFormat.value = p.ext;
        }
      }

      function toggleCustom() {
        useCustom.value = !useCustom.value;
        if (useCustom.value) selectedPreset.value = '';
      }

      // ── Download ──
      function downloadOutput() {
        if (!outputUrl.value) return;
        const a = document.createElement('a');
        a.href = outputUrl.value;
        a.download = outputFileName.value;
        a.click();
      }

      // ── Save to server ──
      async function saveToServer() {
        if (!outputBlob.value) return;
        showSaveDialog.value = false;
        busy.value = true;
        busyText.value = L('save') + '...';
        try {
          const token = localStorage.getItem('auth_token') || '';
          const reader = new FileReader();
          const base64 = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(outputBlob.value);
          });
          const filePath = (savePath.value === 'videos' ? 'videos/' : 'downloads/') + outputFileName.value;
          const resp = await fetch('/api/fs/write', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: filePath, content: base64, encoding: 'base64' })
          });
          if (!resp.ok) throw new Error('Save failed: ' + resp.status);
          addLog('Saved to server: ' + filePath);
        } catch (e) {
          addLog('ERROR saving: ' + e.message);
        } finally {
          busy.value = false;
          busyText.value = '';
        }
      }

      // ── Server file picker ──
      async function openServerPicker() {
        showFilePicker.value = true;
        fpLoading.value = true;
        fpFiles.value = [];
        try {
          const token = localStorage.getItem('auth_token') || '';
          const resp = await fetch('/api/fs/list?path=videos', {
            headers: { 'Authorization': 'Bearer ' + token }
          });
          const data = await resp.json();
          const items = (data.files || data || []).filter(f => !f.isDir);
          // Also try downloads
          const resp2 = await fetch('/api/fs/list?path=downloads', {
            headers: { 'Authorization': 'Bearer ' + token }
          });
          const data2 = await resp2.json();
          const items2 = (data2.files || data2 || []).filter(f => !f.isDir);
          fpFiles.value = [...items.map(f => ({ ...f, folder: 'videos' })), ...items2.map(f => ({ ...f, folder: 'downloads' }))];
        } catch (e) {
          addLog('Error listing files: ' + e.message);
        } finally {
          fpLoading.value = false;
        }
      }

      async function loadServerFile(f) {
        showFilePicker.value = false;
        busy.value = true;
        busyText.value = L('loadingEngine').replace('FFmpeg', f.name);
        try {
          const token = localStorage.getItem('auth_token') || '';
          const filePath = (f.folder ? f.folder + '/' : '') + f.name;
          const resp = await fetch('/api/fs/read-binary?path=' + encodeURIComponent(filePath), {
            headers: { 'Authorization': 'Bearer ' + token }
          });
          if (!resp.ok) throw new Error('Read failed: ' + resp.status);
          const blob = await resp.blob();
          const file = new File([blob], f.name, { type: blob.type || 'video/mp4' });
          setInputFile(file);
        } catch (e) {
          addLog('Error loading file: ' + e.message);
        } finally {
          busy.value = false;
          busyText.value = '';
        }
      }

      // ── Helpers ──
      function getExt(name) { return (name || '').split('.').pop().toLowerCase() || 'bin'; }
      function stripExt(name) { const parts = (name || '').split('.'); if (parts.length > 1) parts.pop(); return parts.join('.'); }
      function formatSize(bytes) {
        if (!bytes) return '0 B';
        const u = ['B','KB','MB','GB'];
        let i = 0;
        let v = bytes;
        while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
        return v.toFixed(i ? 1 : 0) + ' ' + u[i];
      }
      function getMime(ext) {
        const map = { mp4:'video/mp4', webm:'video/webm', avi:'video/x-msvideo', mkv:'video/x-matroska',
          mov:'video/quicktime', flv:'video/x-flv', wmv:'video/x-ms-wmv', ts:'video/mp2t', gif:'image/gif',
          mp3:'audio/mpeg', aac:'audio/aac', wav:'audio/wav', ogg:'audio/ogg', flac:'audio/flac',
          m4a:'audio/mp4', wma:'audio/x-ms-wma', png:'image/png', jpg:'image/jpeg', bmp:'image/bmp', webp:'image/webp' };
        return map[ext] || 'application/octet-stream';
      }
      function isVideo(ext) { return ['mp4','webm','avi','mkv','mov','flv','wmv','ts'].includes(ext); }
      function isAudio(ext) { return ['mp3','aac','wav','ogg','flac','m4a','wma'].includes(ext); }
      function isImage(ext) { return ['png','jpg','bmp','webp','gif'].includes(ext); }

      function inputExt() { return getExt(inputFileName.value); }
      function outputExt() {
        if (useCustom.value) return getOutputExtFromCustom();
        if (selectedPreset.value) return getPresetById(selectedPreset.value).ext;
        return outputFormat.value;
      }

      const allFormats = computed(() => {
        const result = [];
        OUTPUT_FORMATS.forEach(g => {
          g.formats.forEach(f => result.push({ value: f, label: f.toUpperCase(), group: g.group }));
        });
        return result;
      });

      const presetList = computed(() => PRESETS.map(p => ({ value: p.id, label: L('p_' + p.id) })));

      // ── Lifecycle ──
      onMounted(() => {
        window.addEventListener('locale-changed', onLocaleChanged);
      });
      onUnmounted(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
        if (inputPreviewUrl.value) URL.revokeObjectURL(inputPreviewUrl.value);
        if (outputUrl.value) URL.revokeObjectURL(outputUrl.value);
      });

      return {
        locale, L,
        ffmpegLoaded, ffmpegLoading, busy, busyText, progressPct,
        inputFile, inputFileName, inputFileSize, inputFileType, inputPreviewUrl,
        outputFormat, outputBlob, outputUrl, outputFileName,
        selectedPreset, useCustom, customArgs,
        logLines, showLogs,
        showFilePicker, fpFiles, fpLoading,
        showSaveDialog, savePath,
        allFormats, presetList,
        loadFFmpeg, onFileInput, onDrop, onDragOver,
        convert, downloadOutput, saveToServer,
        openServerPicker, loadServerFile,
        onPresetChange, toggleCustom,
        formatSize, isVideo, isAudio, isImage,
        inputExt: computed(inputExt), outputExt: computed(outputExt),
        OUTPUT_FORMATS, PRESETS
      };
    }
  };
})(Vue);
