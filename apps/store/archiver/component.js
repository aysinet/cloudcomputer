({
  setup() {
    const { ref, onMounted, onUnmounted } = Vue;

    const LANGS = {
      tr: {
        title:'Arşivleyici',
        tabCompress:'Sıkıştır',
        tabExtract:'Aç',
        format:'Format',
        selectFiles:'Dosya / Klasör Seç',
        selectArchive:'Arşiv Dosyası Seç',
        compress:'Sıkıştır',
        extract:'Çıkart',
        archiveName:'Arşiv Adı',
        extractTo:'Çıkart Hedefi',
        archiveContents:'Arşiv İçeriği',
        emptyDir:'Klasör boş',
        itemsSelected:'öğe seçili',
        gzipHint:'GZIP yalnızca tek dosya sıkıştırır',
        compressing:'Sıkıştırılıyor...',
        extracting:'Çıkartılıyor...',
        success:'Başarılı',
        error:'Hata',
        compressDone:'Arşiv oluşturuldu',
        extractDone:'Çıkartma tamamlandı',
        noSelection:'Lütfen dosya seçin',
        noArchive:'Lütfen bir arşiv dosyası seçin',
        invalidFormat:'Desteklenmeyen dosya formatı'
      },
      en: {
        title:'Archiver',
        tabCompress:'Compress',
        tabExtract:'Extract',
        format:'Format',
        selectFiles:'Select Files / Folders',
        selectArchive:'Select Archive',
        compress:'Compress',
        extract:'Extract',
        archiveName:'Archive Name',
        extractTo:'Extract To',
        archiveContents:'Archive Contents',
        emptyDir:'Folder is empty',
        itemsSelected:'items selected',
        gzipHint:'GZIP compresses a single file only',
        compressing:'Compressing...',
        extracting:'Extracting...',
        success:'Success',
        error:'Error',
        compressDone:'Archive created',
        extractDone:'Extraction completed',
        noSelection:'Please select files',
        noArchive:'Please select an archive file',
        invalidFormat:'Unsupported file format'
      },
      de: {
        title:'Archivierer',
        tabCompress:'Komprimieren',
        tabExtract:'Entpacken',
        format:'Format',
        selectFiles:'Dateien / Ordner wählen',
        selectArchive:'Archivdatei wählen',
        compress:'Komprimieren',
        extract:'Entpacken',
        archiveName:'Archivname',
        extractTo:'Entpacken nach',
        archiveContents:'Archivinhalt',
        emptyDir:'Ordner ist leer',
        itemsSelected:'Elemente ausgewählt',
        gzipHint:'GZIP komprimiert nur eine einzelne Datei',
        compressing:'Komprimierung...',
        extracting:'Entpacken...',
        success:'Erfolgreich',
        error:'Fehler',
        compressDone:'Archiv erstellt',
        extractDone:'Entpacken abgeschlossen',
        noSelection:'Bitte Dateien wählen',
        noArchive:'Bitte eine Archivdatei wählen',
        invalidFormat:'Nicht unterstütztes Dateiformat'
      },
      fr: {
        title:'Archiveur',
        tabCompress:'Compresser',
        tabExtract:'Extraire',
        format:'Format',
        selectFiles:'Sélectionner des fichiers',
        selectArchive:'Sélectionner une archive',
        compress:'Compresser',
        extract:'Extraire',
        archiveName:'Nom de l\'archive',
        extractTo:'Extraire vers',
        archiveContents:'Contenu de l\'archive',
        emptyDir:'Dossier vide',
        itemsSelected:'éléments sélectionnés',
        gzipHint:'GZIP ne compresse qu\'un seul fichier',
        compressing:'Compression...',
        extracting:'Extraction...',
        success:'Succès',
        error:'Erreur',
        compressDone:'Archive créée',
        extractDone:'Extraction terminée',
        noSelection:'Veuillez sélectionner des fichiers',
        noArchive:'Veuillez sélectionner une archive',
        invalidFormat:'Format de fichier non pris en charge'
      },
      es: {
        title:'Archivador',
        tabCompress:'Comprimir',
        tabExtract:'Extraer',
        format:'Formato',
        selectFiles:'Seleccionar archivos',
        selectArchive:'Seleccionar archivo',
        compress:'Comprimir',
        extract:'Extraer',
        archiveName:'Nombre del archivo',
        extractTo:'Extraer en',
        archiveContents:'Contenido del archivo',
        emptyDir:'Carpeta vacía',
        itemsSelected:'elementos seleccionados',
        gzipHint:'GZIP solo comprime un archivo',
        compressing:'Comprimiendo...',
        extracting:'Extrayendo...',
        success:'Éxito',
        error:'Error',
        compressDone:'Archivo creado',
        extractDone:'Extracción completada',
        noSelection:'Seleccione archivos',
        noArchive:'Seleccione un archivo',
        invalidFormat:'Formato de archivo no compatible'
      },
      ru: {
        title:'Архиватор',
        tabCompress:'Сжать',
        tabExtract:'Извлечь',
        format:'Формат',
        selectFiles:'Выберите файлы',
        selectArchive:'Выберите архив',
        compress:'Сжать',
        extract:'Извлечь',
        archiveName:'Имя архива',
        extractTo:'Извлечь в',
        archiveContents:'Содержимое архива',
        emptyDir:'Папка пуста',
        itemsSelected:'элементов выбрано',
        gzipHint:'GZIP сжимает только один файл',
        compressing:'Сжатие...',
        extracting:'Извлечение...',
        success:'Успешно',
        error:'Ошибка',
        compressDone:'Архив создан',
        extractDone:'Извлечение завершено',
        noSelection:'Выберите файлы',
        noArchive:'Выберите архивный файл',
        invalidFormat:'Неподдерживаемый формат файла'
      },
      zh: {
        title:'归档工具',
        tabCompress:'压缩',
        tabExtract:'解压',
        format:'格式',
        selectFiles:'选择文件/文件夹',
        selectArchive:'选择归档文件',
        compress:'压缩',
        extract:'解压',
        archiveName:'归档名称',
        extractTo:'解压到',
        archiveContents:'归档内容',
        emptyDir:'文件夹为空',
        itemsSelected:'个项目已选',
        gzipHint:'GZIP仅压缩单个文件',
        compressing:'压缩中...',
        extracting:'解压中...',
        success:'成功',
        error:'错误',
        compressDone:'归档已创建',
        extractDone:'解压完成',
        noSelection:'请选择文件',
        noArchive:'请选择归档文件',
        invalidFormat:'不支持的文件格式'
      },
      ja: {
        title:'アーカイバ',
        tabCompress:'圧縮',
        tabExtract:'展開',
        format:'形式',
        selectFiles:'ファイル/フォルダを選択',
        selectArchive:'アーカイブを選択',
        compress:'圧縮',
        extract:'展開',
        archiveName:'アーカイブ名',
        extractTo:'展開先',
        archiveContents:'アーカイブ内容',
        emptyDir:'フォルダは空です',
        itemsSelected:'個選択中',
        gzipHint:'GZIPは単一ファイルのみ圧縮',
        compressing:'圧縮中...',
        extracting:'展開中...',
        success:'成功',
        error:'エラー',
        compressDone:'アーカイブ作成完了',
        extractDone:'展開完了',
        noSelection:'ファイルを選択してください',
        noArchive:'アーカイブファイルを選択してください',
        invalidFormat:'未対応のファイル形式'
      },
      it: {
        title:'Archiviatore',
        tabCompress:'Comprimi',
        tabExtract:'Estrai',
        format:'Formato',
        selectFiles:'Seleziona file/cartelle',
        selectArchive:'Seleziona archivio',
        compress:'Comprimi',
        extract:'Estrai',
        archiveName:'Nome archivio',
        extractTo:'Estrai in',
        archiveContents:'Contenuto archivio',
        emptyDir:'Cartella vuota',
        itemsSelected:'elementi selezionati',
        gzipHint:'GZIP comprime solo un file',
        compressing:'Compressione...',
        extracting:'Estrazione...',
        success:'Successo',
        error:'Errore',
        compressDone:'Archivio creato',
        extractDone:'Estrazione completata',
        noSelection:'Seleziona dei file',
        noArchive:'Seleziona un file archivio',
        invalidFormat:'Formato non supportato'
      },
      ar: {
        title:'أرشيف',
        tabCompress:'Compress',
        tabExtract:'Extract',
        format:'تنسيق',
        selectFiles:'Select Files / Folders',
        selectArchive:'Select Archive',
        compress:'Compress',
        extract:'Extract',
        archiveName:'Archive Name',
        extractTo:'Extract To',
        archiveContents:'Archive Contents',
        emptyDir:'Folder is empty',
        itemsSelected:'items selected',
        gzipHint:'GZIP compresses a single file only',
        compressing:'Compressing...',
        extracting:'Extracting...',
        success:'نجاح',
        error:'خطأ',
        compressDone:'Archive created',
        extractDone:'Extraction completed',
        noSelection:'Please select files',
        noArchive:'Please select an archive file',
        invalidFormat:'تنسيق ملف غير مدعوم'
      },
      ko: {
        title:'압축기',
        tabCompress:'Compress',
        tabExtract:'Extract',
        format:'정렬',
        selectFiles:'Select Files / Folders',
        selectArchive:'Select Archive',
        compress:'Compress',
        extract:'Extract',
        archiveName:'Archive Name',
        extractTo:'Extract To',
        archiveContents:'Archive Contents',
        emptyDir:'Folder is empty',
        itemsSelected:'items selected',
        gzipHint:'GZIP compresses a single file only',
        compressing:'Compressing...',
        extracting:'Extracting...',
        success:'성공',
        error:'오류',
        compressDone:'Archive created',
        extractDone:'Extraction completed',
        noSelection:'Please select files',
        noArchive:'Please select an archive file',
        invalidFormat:'지원되지 않는 파일 형식'
      },
      hi: {
        title:'आर्काइवर',
        tabCompress:'Compress',
        tabExtract:'Extract',
        format:'फॉर्मेट',
        selectFiles:'Select Files / Folders',
        selectArchive:'Select Archive',
        compress:'Compress',
        extract:'Extract',
        archiveName:'Archive Name',
        extractTo:'Extract To',
        archiveContents:'Archive Contents',
        emptyDir:'Folder is empty',
        itemsSelected:'items selected',
        gzipHint:'GZIP compresses a single file only',
        compressing:'Compressing...',
        extracting:'Extracting...',
        success:'सफल',
        error:'त्रुटि',
        compressDone:'Archive created',
        extractDone:'Extraction completed',
        noSelection:'Please select files',
        noArchive:'Please select an archive file',
        invalidFormat:'असमर्थित फ़ाइल प्रारूप'
      },
      pt: {
        title:'Arquivador',
        tabCompress:'Compress',
        tabExtract:'Extract',
        format:'Formatar',
        selectFiles:'Select Files / Folders',
        selectArchive:'Select Archive',
        compress:'Compress',
        extract:'Extract',
        archiveName:'Archive Name',
        extractTo:'Extract To',
        archiveContents:'Archive Contents',
        emptyDir:'Folder is empty',
        itemsSelected:'items selected',
        gzipHint:'GZIP compresses a single file only',
        compressing:'Compressing...',
        extracting:'Extracting...',
        success:'Sucesso',
        error:'Erro',
        compressDone:'Archive created',
        extractDone:'Extraction completed',
        noSelection:'Please select files',
        noArchive:'Please select an archive file',
        invalidFormat:'Formato de arquivo não suportado'
      }
  };

    function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }
    const locale = ref(getLocale());
    function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

    function getToken() { try { return localStorage.getItem('auth_token') || ''; } catch { return ''; } }
    function authHeaders() { return { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }

    const tab = ref('compress');
    const format = ref('zip');
    const busy = ref(false);
    const busyText = ref('');
    const statusMsg = ref('');
    const statusType = ref('');

    // Compress state
    const compressPath = ref('');
    const compressFiles = ref([]);
    const selectedItems = ref([]);
    const archiveName = ref('');

    // Extract state
    const extractPath = ref('');
    const extractFiles = ref([]);
    const selectedArchive = ref('');
    const archiveContents = ref([]);
    const extractDest = ref('');

    function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

    function showStatus(msg, type) {
      statusMsg.value = msg;
      statusType.value = type;
      setTimeout(() => { statusMsg.value = ''; }, 4000);
    }

    function formatSize(bytes) {
      if (!bytes && bytes !== 0) return '';
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }

    // ── Compress: file browsing ──
    async function loadCompressDir() {
      try {
        const r = await fetch('/api/fs/list?path=' + encodeURIComponent(compressPath.value), { headers: authHeaders() });
        if (r.ok) compressFiles.value = await r.json();
      } catch (e) { console.error('List error', e); }
    }

    function isSelected(f) {
      return selectedItems.value.some(s => s.path === f.path);
    }

    function toggleSelect(f) {
      const idx = selectedItems.value.findIndex(s => s.path === f.path);
      if (idx >= 0) selectedItems.value.splice(idx, 1);
      else selectedItems.value.push(f);
    }

    function enterDir(dirPath) {
      compressPath.value = dirPath;
      selectedItems.value = [];
      loadCompressDir();
    }

    function navigateUp() {
      const parts = compressPath.value.split('/').filter(Boolean);
      parts.pop();
      compressPath.value = parts.join('/');
      selectedItems.value = [];
      loadCompressDir();
    }

    // ── Extract: file browsing ──
    async function loadExtractDir() {
      try {
        const r = await fetch('/api/fs/list?path=' + encodeURIComponent(extractPath.value), { headers: authHeaders() });
        if (r.ok) {
          const all = await r.json();
          extractFiles.value = all;
        }
      } catch (e) { console.error('List error', e); }
    }

    function enterExtractDir(dirPath) {
      extractPath.value = dirPath;
      selectedArchive.value = '';
      archiveContents.value = [];
      loadExtractDir();
    }

    function extractNavigateUp() {
      const parts = extractPath.value.split('/').filter(Boolean);
      parts.pop();
      extractPath.value = parts.join('/');
      selectedArchive.value = '';
      archiveContents.value = [];
      loadExtractDir();
    }

    function archiveIcon(name) {
      const n = name.toLowerCase();
      if (n.endsWith('.zip')) return '📦';
      if (n.endsWith('.gz') || n.endsWith('.gzip')) return '🗜️';
      return '📄';
    }

    async function selectArchive(filePath) {
      selectedArchive.value = filePath;
      archiveContents.value = [];
      // Preview contents
      try {
        const r = await fetch('/api/archiver/preview', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({ filePath })
        });
        if (r.ok) {
          const data = await r.json();
          archiveContents.value = data.entries || [];
        }
      } catch (e) { console.error('Preview error', e); }
    }

    // ── Compress action ──
    async function doCompress() {
      if (!selectedItems.value.length) { showStatus(L('noSelection'), 'error'); return; }
      if (busy.value) return;
      busy.value = true;
      busyText.value = L('compressing');
      statusMsg.value = '';
      try {
        const name = archiveName.value.trim() || (format.value === 'zip' ? 'archive.zip' : 'archive.gz');
        const r = await fetch('/api/archiver/compress', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({
            format: format.value,
            items: selectedItems.value.map(i => i.path),
            outputName: name,
            outputDir: compressPath.value
          })
        });
        const data = await r.json();
        if (r.ok) {
          showStatus(L('compressDone') + ' — ' + (data.filename || name), 'success');
          selectedItems.value = [];
          archiveName.value = '';
          loadCompressDir();
        } else {
          showStatus(data.error || L('error'), 'error');
        }
      } catch (e) {
        showStatus(e.message || L('error'), 'error');
      } finally {
        busy.value = false;
      }
    }

    // ── Extract action ──
    async function doExtract() {
      if (!selectedArchive.value) { showStatus(L('noArchive'), 'error'); return; }
      if (busy.value) return;
      busy.value = true;
      busyText.value = L('extracting');
      statusMsg.value = '';
      try {
        const r = await fetch('/api/archiver/extract', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({
            filePath: selectedArchive.value,
            outputDir: extractDest.value.trim() || ''
          })
        });
        const data = await r.json();
        if (r.ok) {
          showStatus(L('extractDone'), 'success');
          archiveContents.value = [];
          selectedArchive.value = '';
          extractDest.value = '';
          loadExtractDir();
        } else {
          showStatus(data.error || L('error'), 'error');
        }
      } catch (e) {
        showStatus(e.message || L('error'), 'error');
      } finally {
        busy.value = false;
      }
    }

    onMounted(() => {
      loadCompressDir();
      loadExtractDir();
      window.addEventListener('locale-changed', onLocaleChanged);
    });
    onUnmounted(() => { window.removeEventListener('locale-changed', onLocaleChanged); });

    return {
      tab, format, busy, busyText, statusMsg, statusType, L,
      compressPath, compressFiles, selectedItems, archiveName,
      extractPath, extractFiles, selectedArchive, archiveContents, extractDest,
      loadCompressDir, isSelected, toggleSelect, enterDir, navigateUp,
      loadExtractDir, enterExtractDir, extractNavigateUp,
      archiveIcon, selectArchive,
      doCompress, doExtract, formatSize
    };
  }
})
