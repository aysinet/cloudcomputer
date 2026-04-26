({
  setup() {
    const { ref, computed, watch, onMounted, onUnmounted, nextTick } = Vue;
    const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success(){}, error(){}, warning(){}, info(){} };

    /* ── i18n ── */
    const LANGS = {
      tr: {
        title:'Metin Karşılaştırma', compare:'Karşılaştır', textMode:'Metin',
        fileMode:'Dosya', folderMode:'Klasör', original:'Orijinal (Sol)',
        modified:'Değiştirilmiş (Sağ)', openLeft:'Sol Dosya Aç', openRight:'Sağ Dosya Aç',
        pasteLeft:'Sol Yapıştır', pasteRight:'Sağ Yapıştır', swap:'Takas',
        clear:'Temizle', sideBySide:'Yan Yana', inline:'Satır İçi',
        leftFolder:'Sol Klasör', rightFolder:'Sağ Klasör', browseLeft:'Sol Seç',
        browseRight:'Sağ Seç', compareFolders:'Klasörleri Karşılaştır',
        onlyLeft:'Sadece Solda', onlyRight:'Sadece Sağda', different:'Farklı',
        identical:'Aynı', fileName:'Dosya Adı', status:'Durum', noResults:'Sonuç yok',
        loading:'Yükleniyor...', differences:'fark', noDiff:'Fark bulunamadı',
        copyToRight:'Sola Kopyala → Sağa', copyToLeft:'Sağdan ← Sola Kopyala',
        prevDiff:'Önceki Fark', nextDiff:'Sonraki Fark', wordWrap:'Sözcük Kaydır',
        fontSize:'Yazı Boyutu', placeholderLeft:'Sol metni buraya yapıştırın veya yazın...',
        placeholderRight:'Sağ metni buraya yapıştırın veya yazın...',
        leftPath:'Sol yol', rightPath:'Sağ yol',
        stats:'istatistik', added:'eklenen', removed:'silinen', unchanged:'değişmeyen',
        lines:'satır', chars:'karakter', selectFolder:'Klasör Seç',
        allFiles:'Tüm Dosyalar', textFiles:'Metin Dosyaları'
      },
      en: {
        title:'Text Diff', compare:'Compare', textMode:'Text',
        fileMode:'File', folderMode:'Folder', original:'Original (Left)',
        modified:'Modified (Right)', openLeft:'Open Left File', openRight:'Open Right File',
        pasteLeft:'Paste Left', pasteRight:'Paste Right', swap:'Swap',
        clear:'Clear', sideBySide:'Side by Side', inline:'Inline',
        leftFolder:'Left Folder', rightFolder:'Right Folder', browseLeft:'Browse Left',
        browseRight:'Browse Right', compareFolders:'Compare Folders',
        onlyLeft:'Only in Left', onlyRight:'Only in Right', different:'Different',
        identical:'Identical', fileName:'File Name', status:'Status', noResults:'No results',
        loading:'Loading...', differences:'differences', noDiff:'No differences found',
        copyToRight:'Copy Left → Right', copyToLeft:'Copy Right → Left',
        prevDiff:'Previous Diff', nextDiff:'Next Diff', wordWrap:'Word Wrap',
        fontSize:'Font Size', placeholderLeft:'Paste or type left text here...',
        placeholderRight:'Paste or type right text here...',
        leftPath:'Left path', rightPath:'Right path',
        stats:'statistics', added:'added', removed:'removed', unchanged:'unchanged',
        lines:'lines', chars:'characters', selectFolder:'Select Folder',
        allFiles:'All Files', textFiles:'Text Files'
      },
      de: {
        title:'Textvergleich', compare:'Vergleichen', textMode:'Text',
        fileMode:'Datei', folderMode:'Ordner', original:'Original (Links)',
        modified:'Geändert (Rechts)', openLeft:'Linke Datei öffnen', openRight:'Rechte Datei öffnen',
        pasteLeft:'Links einfügen', pasteRight:'Rechts einfügen', swap:'Tauschen',
        clear:'Löschen', sideBySide:'Nebeneinander', inline:'Inline',
        leftFolder:'Linker Ordner', rightFolder:'Rechter Ordner', browseLeft:'Links durchsuchen',
        browseRight:'Rechts durchsuchen', compareFolders:'Ordner vergleichen',
        onlyLeft:'Nur links', onlyRight:'Nur rechts', different:'Unterschiedlich',
        identical:'Identisch', fileName:'Dateiname', status:'Status', noResults:'Keine Ergebnisse',
        loading:'Laden...', differences:'Unterschiede', noDiff:'Keine Unterschiede gefunden',
        copyToRight:'Links → Rechts kopieren', copyToLeft:'Rechts → Links kopieren',
        prevDiff:'Vorheriger Unterschied', nextDiff:'Nächster Unterschied', wordWrap:'Zeilenumbruch',
        fontSize:'Schriftgröße', placeholderLeft:'Linken Text hier einfügen...',
        placeholderRight:'Rechten Text hier einfügen...',
        leftPath:'Linker Pfad', rightPath:'Rechter Pfad',
        stats:'Statistiken', added:'hinzugefügt', removed:'entfernt', unchanged:'unverändert',
        lines:'Zeilen', chars:'Zeichen', selectFolder:'Ordner auswählen',
        allFiles:'Alle Dateien', textFiles:'Textdateien'
      },
      fr: {
        title:'Comparateur de Texte', compare:'Comparer', textMode:'Texte',
        fileMode:'Fichier', folderMode:'Dossier', original:'Original (Gauche)',
        modified:'Modifié (Droite)', openLeft:'Ouvrir fichier gauche', openRight:'Ouvrir fichier droite',
        pasteLeft:'Coller à gauche', pasteRight:'Coller à droite', swap:'Échanger',
        clear:'Effacer', sideBySide:'Côte à côte', inline:'En ligne',
        leftFolder:'Dossier gauche', rightFolder:'Dossier droite', browseLeft:'Parcourir gauche',
        browseRight:'Parcourir droite', compareFolders:'Comparer les dossiers',
        onlyLeft:'Uniquement à gauche', onlyRight:'Uniquement à droite', different:'Différent',
        identical:'Identique', fileName:'Nom du fichier', status:'Statut', noResults:'Aucun résultat',
        loading:'Chargement...', differences:'différences', noDiff:'Aucune différence trouvée',
        copyToRight:'Copier gauche → droite', copyToLeft:'Copier droite → gauche',
        prevDiff:'Diff précédent', nextDiff:'Diff suivant', wordWrap:'Retour à la ligne',
        fontSize:'Taille de police', placeholderLeft:'Collez ou tapez le texte gauche ici...',
        placeholderRight:'Collez ou tapez le texte droite ici...',
        leftPath:'Chemin gauche', rightPath:'Chemin droite',
        stats:'statistiques', added:'ajouté', removed:'supprimé', unchanged:'inchangé',
        lines:'lignes', chars:'caractères', selectFolder:'Sélectionner un dossier',
        allFiles:'Tous les fichiers', textFiles:'Fichiers texte'
      },
      es: {
        title:'Comparador de Texto', compare:'Comparar', textMode:'Texto',
        fileMode:'Archivo', folderMode:'Carpeta', original:'Original (Izquierda)',
        modified:'Modificado (Derecha)', openLeft:'Abrir archivo izquierdo', openRight:'Abrir archivo derecho',
        pasteLeft:'Pegar izquierda', pasteRight:'Pegar derecha', swap:'Intercambiar',
        clear:'Limpiar', sideBySide:'Lado a lado', inline:'En línea',
        leftFolder:'Carpeta izquierda', rightFolder:'Carpeta derecha', browseLeft:'Examinar izquierda',
        browseRight:'Examinar derecha', compareFolders:'Comparar carpetas',
        onlyLeft:'Solo en izquierda', onlyRight:'Solo en derecha', different:'Diferente',
        identical:'Idéntico', fileName:'Nombre de archivo', status:'Estado', noResults:'Sin resultados',
        loading:'Cargando...', differences:'diferencias', noDiff:'No se encontraron diferencias',
        copyToRight:'Copiar izquierda → derecha', copyToLeft:'Copiar derecha → izquierda',
        prevDiff:'Diff anterior', nextDiff:'Diff siguiente', wordWrap:'Ajuste de línea',
        fontSize:'Tamaño de fuente', placeholderLeft:'Pegue o escriba el texto izquierdo aquí...',
        placeholderRight:'Pegue o escriba el texto derecho aquí...',
        leftPath:'Ruta izquierda', rightPath:'Ruta derecha',
        stats:'estadísticas', added:'añadido', removed:'eliminado', unchanged:'sin cambios',
        lines:'líneas', chars:'caracteres', selectFolder:'Seleccionar carpeta',
        allFiles:'Todos los archivos', textFiles:'Archivos de texto'
      },
      ru: {
        title:'Сравнение Текста', compare:'Сравнить', textMode:'Текст',
        fileMode:'Файл', folderMode:'Папка', original:'Оригинал (Левый)',
        modified:'Изменённый (Правый)', openLeft:'Открыть левый файл', openRight:'Открыть правый файл',
        pasteLeft:'Вставить слева', pasteRight:'Вставить справа', swap:'Поменять',
        clear:'Очистить', sideBySide:'Рядом', inline:'Построчно',
        leftFolder:'Левая папка', rightFolder:'Правая папка', browseLeft:'Обзор слева',
        browseRight:'Обзор справа', compareFolders:'Сравнить папки',
        onlyLeft:'Только слева', onlyRight:'Только справа', different:'Разные',
        identical:'Одинаковые', fileName:'Имя файла', status:'Статус', noResults:'Нет результатов',
        loading:'Загрузка...', differences:'различия', noDiff:'Различий не найдено',
        copyToRight:'Копировать лево → право', copyToLeft:'Копировать право → лево',
        prevDiff:'Предыдущее', nextDiff:'Следующее', wordWrap:'Перенос слов',
        fontSize:'Размер шрифта', placeholderLeft:'Вставьте или введите левый текст...',
        placeholderRight:'Вставьте или введите правый текст...',
        leftPath:'Левый путь', rightPath:'Правый путь',
        stats:'статистика', added:'добавлено', removed:'удалено', unchanged:'без изменений',
        lines:'строк', chars:'символов', selectFolder:'Выбрать папку',
        allFiles:'Все файлы', textFiles:'Текстовые файлы'
      },
    zh: { title:'文本比较', compare:'比较', textMode:'文本模式', fileMode:'文件模式', folderMode:'文件夹模式', original:'原始', modified:'修改', openLeft:'打开左侧', openRight:'打开右侧', pasteLeft:'粘贴左侧', pasteRight:'粘贴右侧', swap:'交换', clear:'清空', sideBySide:'并排', inline:'内联', leftFolder:'左侧文件夹', rightFolder:'右侧文件夹', browseLeft:'浏览左侧', browseRight:'浏览右侧', compareFolders:'比较文件夹', onlyLeft:'仅左侧', onlyRight:'仅右侧', different:'不同', identical:'相同', fileName:'文件名', status:'状态', noResults:'无结果', loading:'加载中', differences:'差异', noDiff:'无差异', copyToRight:'复制到右侧', copyToLeft:'复制到左侧', prevDiff:'上一个差异', nextDiff:'下一个差异', wordWrap:'自动换行', fontSize:'字体大小', placeholderLeft:'在此粘贴原始文本...', placeholderRight:'在此粘贴修改后的文本...', leftPath:'左侧路径', rightPath:'右侧路径', stats:'统计', added:'新增', removed:'删除', unchanged:'未变', lines:'行', chars:'字符', selectFolder:'选择文件夹', allFiles:'所有文件', textFiles:'文本文件' },
    ja: { title:'テキスト差分', compare:'比較', textMode:'テキストモード', fileMode:'ファイルモード', folderMode:'フォルダモード', original:'元のテキスト', modified:'変更後', openLeft:'左を開く', openRight:'右を開く', pasteLeft:'左に貼り付け', pasteRight:'右に貼り付け', swap:'入れ替え', clear:'クリア', sideBySide:'並列表示', inline:'インライン', leftFolder:'左フォルダ', rightFolder:'右フォルダ', browseLeft:'左を参照', browseRight:'右を参照', compareFolders:'フォルダ比較', onlyLeft:'左のみ', onlyRight:'右のみ', different:'異なる', identical:'同一', fileName:'ファイル名', status:'状態', noResults:'結果なし', loading:'読込中', differences:'差分', noDiff:'差分なし', copyToRight:'右にコピー', copyToLeft:'左にコピー', prevDiff:'前の差分', nextDiff:'次の差分', wordWrap:'折り返し', fontSize:'文字サイズ', placeholderLeft:'元のテキストを貼り付け...', placeholderRight:'変更後のテキストを貼り付け...', leftPath:'左パス', rightPath:'右パス', stats:'統計', added:'追加', removed:'削除', unchanged:'変更なし', lines:'行', chars:'文字', selectFolder:'フォルダ選択', allFiles:'すべてのファイル', textFiles:'テキストファイル' },
    it: { title:'Confronto Testi', compare:'Confronta', textMode:'Modalità testo', fileMode:'Modalità file', folderMode:'Modalità cartella', original:'Originale', modified:'Modificato', openLeft:'Apri sinistra', openRight:'Apri destra', pasteLeft:'Incolla sinistra', pasteRight:'Incolla destra', swap:'Scambia', clear:'Cancella', sideBySide:'Affiancato', inline:'In linea', leftFolder:'Cartella sinistra', rightFolder:'Cartella destra', browseLeft:'Sfoglia sinistra', browseRight:'Sfoglia destra', compareFolders:'Confronta cartelle', onlyLeft:'Solo sinistra', onlyRight:'Solo destra', different:'Diversi', identical:'Identici', fileName:'Nome file', status:'Stato', noResults:'Nessun risultato', loading:'Caricamento', differences:'Differenze', noDiff:'Nessuna differenza', copyToRight:'Copia a destra', copyToLeft:'Copia a sinistra', prevDiff:'Differenza precedente', nextDiff:'Differenza successiva', wordWrap:'A capo', fontSize:'Dimensione testo', placeholderLeft:'Incolla testo originale...', placeholderRight:'Incolla testo modificato...', leftPath:'Percorso sinistro', rightPath:'Percorso destro', stats:'Statistiche', added:'Aggiunte', removed:'Rimosse', unchanged:'Invariate', lines:'Righe', chars:'Caratteri', selectFolder:'Seleziona cartella', allFiles:'Tutti i file', textFiles:'File di testo' }
  };

    function getLocale() { return localStorage.getItem('sys_locale') || 'tr'; }
    var locale = ref(getLocale());
    var t = function(k) { return (LANGS[locale.value] && LANGS[locale.value][k]) || LANGS.en[k] || k; };
    function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

    /* ── Auth ── */
    function getToken() { return localStorage.getItem('auth_token'); }
    function authHeaders() { return { Authorization: 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }

    /* ── State ── */
    var mode = ref('text');
    var renderSideBySide = ref(true);
    var wordWrap = ref(false);
    var fontSize = ref(14);
    var leftText = ref('');
    var rightText = ref('');
    var leftFile = ref('');
    var rightFile = ref('');
    var leftFolder = ref('');
    var rightFolder = ref('');
    var diffEditorEl = ref(null);
    var folderResults = ref([]);
    var folderLoading = ref(false);
    var folderFilter = ref('all');

    /* ── Monaco ── */
    var monacoLib = null;
    var diffEditor = null;
    var originalModel = null;
    var modifiedModel = null;

    function initMonaco() {
      if (typeof require === 'undefined' || !require.config) return;
      require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs' } });
      require(['vs/editor/editor.main'], function(monaco) {
        monacoLib = monaco;
        createDiffEditor();
      });
    }

    function createDiffEditor() {
      if (!monacoLib || !diffEditorEl.value) return;
      if (diffEditor) { diffEditor.dispose(); diffEditor = null; }

      diffEditor = monacoLib.editor.createDiffEditor(diffEditorEl.value, {
        theme: 'vs-dark',
        fontSize: fontSize.value,
        fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace",
        automaticLayout: true,
        renderSideBySide: renderSideBySide.value,
        scrollBeyondLastLine: false,
        minimap: { enabled: false },
        lineNumbers: 'on',
        roundedSelection: true,
        smoothScrolling: true,
        readOnly: false,
        originalEditable: true,
        wordWrap: wordWrap.value ? 'on' : 'off',
        enableSplitViewResizing: true,
        ignoreTrimWhitespace: false,
        renderIndicators: true,
        padding: { top: 4, bottom: 4 }
      });

      originalModel = monacoLib.editor.createModel(leftText.value, 'plaintext');
      modifiedModel = monacoLib.editor.createModel(rightText.value, 'plaintext');

      diffEditor.setModel({ original: originalModel, modified: modifiedModel });

      /* Sync text changes back to refs */
      originalModel.onDidChangeContent(function() { leftText.value = originalModel.getValue(); });
      modifiedModel.onDidChangeContent(function() { rightText.value = modifiedModel.getValue(); });
    }

    function updateDiffModels() {
      if (!originalModel || !modifiedModel) return;
      if (originalModel.getValue() !== leftText.value) originalModel.setValue(leftText.value);
      if (modifiedModel.getValue() !== rightText.value) modifiedModel.setValue(rightText.value);
    }

    /* ── Diff stats ── */
    var diffStats = computed(function() {
      var l = leftText.value.split('\n');
      var r = rightText.value.split('\n');
      var changes = diffEditor ? diffEditor.getLineChanges() || [] : [];
      var added = 0, removed = 0;
      changes.forEach(function(c) {
        if (c.originalEndLineNumber > 0) removed += c.originalEndLineNumber - c.originalStartLineNumber + 1;
        if (c.modifiedEndLineNumber > 0) added += c.modifiedEndLineNumber - c.modifiedStartLineNumber + 1;
      });
      return {
        leftLines: l.length, rightLines: r.length,
        leftChars: leftText.value.length, rightChars: rightText.value.length,
        changes: changes.length, added: added, removed: removed
      };
    });

    /* ── Navigation ── */
    function nextDiff() {
      if (!diffEditor) return;
      var nav = diffEditor.getModifiedEditor();
      var changes = diffEditor.getLineChanges() || [];
      if (changes.length === 0) return;
      var curLine = nav.getPosition().lineNumber;
      for (var i = 0; i < changes.length; i++) {
        if (changes[i].modifiedStartLineNumber > curLine) {
          nav.revealLineInCenter(changes[i].modifiedStartLineNumber);
          nav.setPosition({ lineNumber: changes[i].modifiedStartLineNumber, column: 1 });
          return;
        }
      }
      nav.revealLineInCenter(changes[0].modifiedStartLineNumber);
      nav.setPosition({ lineNumber: changes[0].modifiedStartLineNumber, column: 1 });
    }

    function prevDiff() {
      if (!diffEditor) return;
      var nav = diffEditor.getModifiedEditor();
      var changes = diffEditor.getLineChanges() || [];
      if (changes.length === 0) return;
      var curLine = nav.getPosition().lineNumber;
      for (var i = changes.length - 1; i >= 0; i--) {
        if (changes[i].modifiedStartLineNumber < curLine) {
          nav.revealLineInCenter(changes[i].modifiedStartLineNumber);
          nav.setPosition({ lineNumber: changes[i].modifiedStartLineNumber, column: 1 });
          return;
        }
      }
      var last = changes[changes.length - 1];
      nav.revealLineInCenter(last.modifiedStartLineNumber);
      nav.setPosition({ lineNumber: last.modifiedStartLineNumber, column: 1 });
    }

    /* ── File operations ── */
    var FILE_FILTERS = [
      { label: 'All Files', extensions: ['*'] },
      { label: 'Text', extensions: ['.txt','.md','.csv','.log','.json','.xml','.html','.css','.js','.py','.java','.c','.cpp','.h','.yaml','.yml','.ini','.cfg','.conf','.sh','.bat','.sql'] }
    ];

    async function openLeft() {
      if (!window.FileDialog) return;
      var result = await window.FileDialog.open({ title: t('openLeft'), filters: FILE_FILTERS });
      if (!result) return;
      leftText.value = result.content || '';
      leftFile.value = result.name || '';
      updateDiffModels();
      setLang(result.name);
    }

    async function openRight() {
      if (!window.FileDialog) return;
      var result = await window.FileDialog.open({ title: t('openRight'), filters: FILE_FILTERS });
      if (!result) return;
      rightText.value = result.content || '';
      rightFile.value = result.name || '';
      updateDiffModels();
      setLang(result.name);
    }

    function setLang(filename) {
      if (!monacoLib || !originalModel || !modifiedModel) return;
      var ext = (filename || '').split('.').pop().toLowerCase();
      var langMap = { js:'javascript', ts:'typescript', py:'python', java:'java', c:'c', cpp:'cpp', h:'c', cs:'csharp', rb:'ruby', go:'go', rs:'rust', html:'html', htm:'html', css:'css', json:'json', xml:'xml', md:'markdown', sql:'sql', sh:'shell', yaml:'yaml', yml:'yaml' };
      var lang = langMap[ext] || 'plaintext';
      monacoLib.editor.setModelLanguage(originalModel, lang);
      monacoLib.editor.setModelLanguage(modifiedModel, lang);
    }

    async function pasteLeft() {
      try {
        var text = await navigator.clipboard.readText();
        leftText.value = text;
        updateDiffModels();
      } catch (e) { ElMessage.error('Clipboard access denied'); }
    }

    async function pasteRight() {
      try {
        var text = await navigator.clipboard.readText();
        rightText.value = text;
        updateDiffModels();
      } catch (e) { ElMessage.error('Clipboard access denied'); }
    }

    function swapSides() {
      var tmp = leftText.value;
      leftText.value = rightText.value;
      rightText.value = tmp;
      var tmpF = leftFile.value;
      leftFile.value = rightFile.value;
      rightFile.value = tmpF;
      updateDiffModels();
    }

    function clearAll() {
      leftText.value = '';
      rightText.value = '';
      leftFile.value = '';
      rightFile.value = '';
      updateDiffModels();
    }

    function copyLeftToRight() {
      rightText.value = leftText.value;
      rightFile.value = leftFile.value;
      updateDiffModels();
    }

    function copyRightToLeft() {
      leftText.value = rightText.value;
      leftFile.value = rightFile.value;
      updateDiffModels();
    }

    /* ── Settings watchers ── */
    watch(renderSideBySide, function(v) {
      if (diffEditor) diffEditor.updateOptions({ renderSideBySide: v });
    });

    watch(wordWrap, function(v) {
      if (diffEditor) diffEditor.updateOptions({ wordWrap: v ? 'on' : 'off' });
    });

    watch(fontSize, function(v) {
      if (diffEditor) diffEditor.updateOptions({ fontSize: v });
    });

    /* ── Folder comparison ── */
    async function browseFolderLeft() {
      if (!window.FileDialog) return;
      var result = await window.FileDialog.open({ title: t('selectFolder'), mode: 'folder' });
      if (result && result.path) leftFolder.value = result.path;
    }

    async function browseFolderRight() {
      if (!window.FileDialog) return;
      var result = await window.FileDialog.open({ title: t('selectFolder'), mode: 'folder' });
      if (result && result.path) rightFolder.value = result.path;
    }

    async function compareFolders() {
      if (!leftFolder.value || !rightFolder.value) return;
      folderLoading.value = true;
      folderResults.value = [];
      try {
        var leftRes = await fetch('/api/fs/list?path=' + encodeURIComponent(leftFolder.value), { headers: authHeaders() });
        var rightRes = await fetch('/api/fs/list?path=' + encodeURIComponent(rightFolder.value), { headers: authHeaders() });
        if (!leftRes.ok || !rightRes.ok) throw new Error('Failed to list folders');
        var leftFiles = (await leftRes.json()).filter(function(f) { return !f.isDir; });
        var rightFiles = (await rightRes.json()).filter(function(f) { return !f.isDir; });

        var leftMap = {};
        leftFiles.forEach(function(f) { leftMap[f.name] = f; });
        var rightMap = {};
        rightFiles.forEach(function(f) { rightMap[f.name] = f; });

        var allNames = new Set();
        leftFiles.forEach(function(f) { allNames.add(f.name); });
        rightFiles.forEach(function(f) { allNames.add(f.name); });

        var results = [];
        var sorted = Array.from(allNames).sort();
        for (var i = 0; i < sorted.length; i++) {
          var name = sorted[i];
          var inLeft = !!leftMap[name];
          var inRight = !!rightMap[name];
          var status = 'identical';
          if (inLeft && !inRight) status = 'onlyLeft';
          else if (!inLeft && inRight) status = 'onlyRight';
          else if (inLeft && inRight) {
            if (leftMap[name].size !== rightMap[name].size) status = 'different';
            else {
              /* Try content compare for small files */
              if (leftMap[name].size < 512000) {
                try {
                  var lRes = await fetch('/api/fs/read?path=' + encodeURIComponent(leftFolder.value + '/' + name), { headers: authHeaders() });
                  var rRes = await fetch('/api/fs/read?path=' + encodeURIComponent(rightFolder.value + '/' + name), { headers: authHeaders() });
                  if (lRes.ok && rRes.ok) {
                    var lData = await lRes.json();
                    var rData = await rRes.json();
                    if (lData.content !== rData.content) status = 'different';
                  }
                } catch(e) {}
              }
            }
          }
          results.push({
            name: name,
            status: status,
            leftSize: inLeft ? leftMap[name].size : 0,
            rightSize: inRight ? rightMap[name].size : 0,
            leftPath: inLeft ? leftMap[name].path : null,
            rightPath: inRight ? rightMap[name].path : null
          });
        }
        folderResults.value = results;
      } catch (e) {
        ElMessage.error(e.message);
      }
      folderLoading.value = false;
    }

    var filteredFolderResults = computed(function() {
      if (folderFilter.value === 'all') return folderResults.value;
      return folderResults.value.filter(function(r) { return r.status === folderFilter.value; });
    });

    var folderCounts = computed(function() {
      var c = { all: folderResults.value.length, onlyLeft: 0, onlyRight: 0, different: 0, identical: 0 };
      folderResults.value.forEach(function(r) { if (c[r.status] !== undefined) c[r.status]++; });
      return c;
    });

    async function openFolderFile(r) {
      if (!r.leftPath && !r.rightPath) return;
      try {
        if (r.leftPath) {
          var lRes = await fetch('/api/fs/read?path=' + encodeURIComponent(r.leftPath), { headers: authHeaders() });
          if (lRes.ok) { var ld = await lRes.json(); leftText.value = ld.content || ''; leftFile.value = r.name; }
        } else { leftText.value = ''; leftFile.value = ''; }
        if (r.rightPath) {
          var rRes = await fetch('/api/fs/read?path=' + encodeURIComponent(r.rightPath), { headers: authHeaders() });
          if (rRes.ok) { var rd = await rRes.json(); rightText.value = rd.content || ''; rightFile.value = r.name; }
        } else { rightText.value = ''; rightFile.value = ''; }
        mode.value = 'text';
        nextTick(function() {
          updateDiffModels();
          setLang(r.name);
        });
      } catch(e) { ElMessage.error(e.message); }
    }

    function formatBytes(b) {
      if (!b || b === 0) return '0 B';
      var units = ['B','KB','MB','GB'];
      var i = Math.floor(Math.log(b) / Math.log(1024));
      return (b / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + ' ' + units[i];
    }

    function statusColor(s) {
      return { onlyLeft:'#e57373', onlyRight:'#ffb74d', different:'#ffb74d', identical:'#81c784' }[s] || '#999';
    }

    function statusTag(s) {
      return { onlyLeft:'danger', onlyRight:'warning', different:'warning', identical:'success' }[s] || 'info';
    }

    /* ── Lifecycle ── */
    onMounted(function() {
      nextTick(initMonaco);
      window.addEventListener('locale-changed', onLocaleChanged);
    });

    onUnmounted(function() {
      window.removeEventListener('locale-changed', onLocaleChanged)if (originalModel) { originalModel.dispose(); originalModel = null; }
      if (modifiedModel) { modifiedModel.dispose(); modifiedModel = null; }
      if (diffEditor) { diffEditor.dispose(); diffEditor = null; }
    });

    return {
      locale, t, mode, renderSideBySide, wordWrap, fontSize,
      leftText, rightText, leftFile, rightFile,
      leftFolder, rightFolder, folderResults, folderLoading, folderFilter,
      diffEditorEl, diffStats,
      filteredFolderResults, folderCounts,
      openLeft, openRight, pasteLeft, pasteRight, swapSides, clearAll,
      copyLeftToRight, copyRightToLeft,
      nextDiff, prevDiff, updateDiffModels,
      browseFolderLeft, browseFolderRight, compareFolders, openFolderFile,
      formatBytes, statusColor, statusTag
    };
  }
})
