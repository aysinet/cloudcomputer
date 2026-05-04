({
  setup() {
    var ref = Vue.ref, computed = Vue.computed, watch = Vue.watch, onMounted = Vue.onMounted, onUnmounted = Vue.onUnmounted, nextTick = Vue.nextTick;
    var ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success:function(){}, error:function(){}, warning:function(){}, info:function(){} };

    var LANGS = {
      tr: {
        format:'Biçimle',
        minify:'Küçült',
        validate:'Doğrula',
        copy:'Kopyala',
        clear:'Temizle',
        indent:'Girinti',
        minimap:'Minimap',
        treeView:'Ağaç Görünümü',
        editor:'Editör',
        split:'Bölünmüş',
        line:'Satır',
        lines:'satır',
        chars:'karakter',
        copied:'Kopyalandı',
        valid:'Geçerli JSON',
        invalid:'Geçersiz JSON',
        formatted:'Biçimlendirildi',
        minified:'Küçültüldü',
        cleared:'Temizlendi',
        openFile:'Dosya Aç',
        saveFile:'Kaydet',
        saveAs:'Farklı Kaydet',
        openLocal:'Yerel Dosya Aç',
        openServer:'Sunucudan Aç',
        saved:'Kaydedildi',
        keys:'anahtar',
        items:'öğe'
      },
      en: {
        format:'Format',
        minify:'Minify',
        validate:'Validate',
        copy:'Copy',
        clear:'Clear',
        indent:'Indent',
        minimap:'Minimap',
        treeView:'Tree View',
        editor:'Editor',
        split:'Split',
        line:'Line',
        lines:'lines',
        chars:'chars',
        copied:'Copied',
        valid:'Valid JSON',
        invalid:'Invalid JSON',
        formatted:'Formatted',
        minified:'Minified',
        cleared:'Cleared',
        openFile:'Open File',
        saveFile:'Save',
        saveAs:'Save As',
        openLocal:'Open Local File',
        openServer:'Open from Server',
        saved:'Saved',
        keys:'keys',
        items:'items'
      },
      de: {
        format:'Formatieren',
        minify:'Minimieren',
        validate:'Validieren',
        copy:'Kopieren',
        clear:'Leeren',
        indent:'Einzug',
        minimap:'Minimap',
        treeView:'Baumansicht',
        editor:'Editor',
        split:'Geteilt',
        line:'Zeile',
        lines:'Zeilen',
        chars:'Zeichen',
        copied:'Kopiert',
        valid:'Gültiges JSON',
        invalid:'Ungültiges JSON',
        formatted:'Formatiert',
        minified:'Minimiert',
        cleared:'Geleert',
        openFile:'Datei öffnen',
        saveFile:'Speichern',
        saveAs:'Speichern unter',
        openLocal:'Lokale Datei öffnen',
        openServer:'Vom Server öffnen',
        saved:'Gespeichert',
        keys:'Schlüssel',
        items:'Elemente'
      },
      fr: {
        format:'Formater',
        minify:'Minifier',
        validate:'Valider',
        copy:'Copier',
        clear:'Effacer',
        indent:'Indentation',
        minimap:'Minimap',
        treeView:'Arborescence',
        editor:'Éditeur',
        split:'Divisé',
        line:'Ligne',
        lines:'lignes',
        chars:'caractères',
        copied:'Copié',
        valid:'JSON valide',
        invalid:'JSON invalide',
        formatted:'Formaté',
        minified:'Minifié',
        cleared:'Effacé',
        openFile:'Ouvrir',
        saveFile:'Enregistrer',
        saveAs:'Enregistrer sous',
        openLocal:'Ouvrir un fichier local',
        openServer:'Ouvrir depuis le serveur',
        saved:'Enregistré',
        keys:'clés',
        items:'éléments'
      },
      es: {
        format:'Formatear',
        minify:'Minificar',
        validate:'Validar',
        copy:'Copiar',
        clear:'Limpiar',
        indent:'Sangría',
        minimap:'Minimapa',
        treeView:'Vista de Árbol',
        editor:'Editor',
        split:'Dividido',
        line:'Línea',
        lines:'líneas',
        chars:'caracteres',
        copied:'Copiado',
        valid:'JSON válido',
        invalid:'JSON inválido',
        formatted:'Formateado',
        minified:'Minificado',
        cleared:'Limpiado',
        openFile:'Abrir',
        saveFile:'Guardar',
        saveAs:'Guardar como',
        openLocal:'Abrir archivo local',
        openServer:'Abrir desde servidor',
        saved:'Guardado',
        keys:'claves',
        items:'elementos'
      },
      ru: {
        format:'Форматировать',
        minify:'Минифицировать',
        validate:'Проверить',
        copy:'Копировать',
        clear:'Очистить',
        indent:'Отступ',
        minimap:'Миникарта',
        treeView:'Дерево',
        editor:'Редактор',
        split:'Разделить',
        line:'Строка',
        lines:'строк',
        chars:'символов',
        copied:'Скопировано',
        valid:'Корректный JSON',
        invalid:'Некорректный JSON',
        formatted:'Отформатировано',
        minified:'Минифицировано',
        cleared:'Очищено',
        openFile:'Открыть',
        saveFile:'Сохранить',
        saveAs:'Сохранить как',
        openLocal:'Открыть локальный файл',
        openServer:'Открыть с сервера',
        saved:'Сохранено',
        keys:'ключей',
        items:'элементов'
      },
      zh: {
        format:'格式化',
        minify:'压缩',
        validate:'验证',
        copy:'复制',
        clear:'清空',
        indent:'缩进',
        minimap:'小地图',
        treeView:'树视图',
        editor:'编辑器',
        split:'分屏',
        line:'行',
        lines:'行',
        chars:'字符',
        copied:'已复制',
        valid:'有效JSON',
        invalid:'无效JSON',
        formatted:'已格式化',
        minified:'已压缩',
        cleared:'已清空',
        openFile:'打开',
        saveFile:'保存',
        saveAs:'另存为',
        openLocal:'打开本地文件',
        openServer:'从服务器打开',
        saved:'已保存',
        keys:'键',
        items:'项'
      },
      ja: {
        format:'整形',
        minify:'圧縮',
        validate:'検証',
        copy:'コピー',
        clear:'クリア',
        indent:'インデント',
        minimap:'ミニマップ',
        treeView:'ツリー表示',
        editor:'エディタ',
        split:'分割',
        line:'行',
        lines:'行',
        chars:'文字',
        copied:'コピーしました',
        valid:'有効なJSON',
        invalid:'無効なJSON',
        formatted:'整形しました',
        minified:'圧縮しました',
        cleared:'クリアしました',
        openFile:'開く',
        saveFile:'保存',
        saveAs:'名前を付けて保存',
        openLocal:'ローカルファイルを開く',
        openServer:'サーバーから開く',
        saved:'保存しました',
        keys:'キー',
        items:'項目'
      },
      it: {
        format:'Formatta',
        minify:'Minifica',
        validate:'Convalida',
        copy:'Copia',
        clear:'Cancella',
        indent:'Rientro',
        minimap:'Minimappa',
        treeView:'Vista Albero',
        editor:'Editor',
        split:'Diviso',
        line:'Riga',
        lines:'righe',
        chars:'caratteri',
        copied:'Copiato',
        valid:'JSON valido',
        invalid:'JSON non valido',
        formatted:'Formattato',
        minified:'Minificato',
        cleared:'Cancellato',
        openFile:'Apri',
        saveFile:'Salva',
        saveAs:'Salva con nome',
        openLocal:'Apri file locale',
        openServer:'Apri dal server',
        saved:'Salvato',
        keys:'chiavi',
        items:'elementi'
      },
      ar: {
        format:'تنسيق',
        minify:'Minify',
        validate:'Validate',
        copy:'نسخ',
        clear:'Clear',
        indent:'Indent',
        minimap:'Minimap',
        treeView:'Tree View',
        editor:'Editor',
        split:'فرق',
        line:'Line',
        lines:'سطر',
        chars:'حرف',
        copied:'تم النسخ',
        valid:'Valid JSON',
        invalid:'Invalid JSON',
        formatted:'Formatted',
        minified:'Minified',
        cleared:'Cleared',
        openFile:'فتح ملف',
        saveFile:'حفظ',
        saveAs:'حفظ باسم',
        openLocal:'Open Local File',
        openServer:'فتح من الخادم',
        saved:'تم الحفظ',
        keys:'keys',
        items:'عناصر'
      },
      ko: {
        format:'정렬',
        minify:'Minify',
        validate:'Validate',
        copy:'복사',
        clear:'Clear',
        indent:'Indent',
        minimap:'Minimap',
        treeView:'Tree View',
        editor:'Editor',
        split:'스플릿',
        line:'Line',
        lines:'줄',
        chars:'문자',
        copied:'복사됨',
        valid:'Valid JSON',
        invalid:'Invalid JSON',
        formatted:'Formatted',
        minified:'Minified',
        cleared:'Cleared',
        openFile:'파일 열기',
        saveFile:'저장',
        saveAs:'다른 이름으로 저장',
        openLocal:'Open Local File',
        openServer:'서버에서 열기',
        saved:'저장됨',
        keys:'keys',
        items:'items'
      },
      hi: {
        format:'फॉर्मेट',
        minify:'Minify',
        validate:'Validate',
        copy:'कॉपी',
        clear:'Clear',
        indent:'Indent',
        minimap:'Minimap',
        treeView:'Tree View',
        editor:'Editor',
        split:'स्प्लिट',
        line:'Line',
        lines:'पंक्तियाँ',
        chars:'अक्षर',
        copied:'कॉपी किया',
        valid:'Valid JSON',
        invalid:'Invalid JSON',
        formatted:'Formatted',
        minified:'Minified',
        cleared:'Cleared',
        openFile:'फ़ाइल खोलें',
        saveFile:'सहेजें',
        saveAs:'इस रूप में सहेजें',
        openLocal:'Open Local File',
        openServer:'सर्वर से खोलें',
        saved:'सहेजा गया',
        keys:'keys',
        items:'items'
      },
      pt: {
        format:'Formatar',
        minify:'Minify',
        validate:'Validate',
        copy:'Copiar',
        clear:'Clear',
        indent:'Indent',
        minimap:'Minimap',
        treeView:'Tree View',
        editor:'Editor',
        split:'Parcial',
        line:'Line',
        lines:'linhas',
        chars:'caracteres',
        copied:'Copiado',
        valid:'Valid JSON',
        invalid:'Invalid JSON',
        formatted:'Formatted',
        minified:'Minified',
        cleared:'Cleared',
        openFile:'Abrir Arquivo',
        saveFile:'Salvar',
        saveAs:'Salvar como',
        openLocal:'Open Local File',
        openServer:'Abrir do servidor',
        saved:'Salvo',
        keys:'keys',
        items:'items'
      }
    };

    function getLocale() {
      try { return (window.__vueDesktopSettings && window.__vueDesktopSettings.locale) || localStorage.getItem('sys_locale') || 'en'; } catch(e) { return 'en'; }
    }
    var locale = ref(getLocale());
    function t(key) { return (LANGS[locale.value] || LANGS.en)[key] || key; }
    function onLocaleChanged(e) { if (e.detail) locale.value = e.detail; }

    var rawJson = ref('{\n  "message": "Hello, JSON Viewer!",\n  "version": 1.0,\n  "features": [\n    "pretty print",\n    "validation",\n    "tree view",\n    "minimap"\n  ],\n  "settings": {\n    "indent": 2,\n    "theme": "dark"\n  }\n}');
    var indentSize = ref(2);
    var showMinimap = ref(true);
    var viewMode = ref('split');
    var jsonError = ref('');
    var errorLine = ref(0);
    var isValid = ref(true);
    var editorRef = ref(null);
    var lineNumsRef = ref(null);
    var minimapRef = ref(null);
    var minimapCanvas = ref(null);
    var treeRef = ref(null);
    var currentFilePath = ref('');
    var showOpenMenu = ref(false);
    var showSaveMenu = ref(false);

    var JSON_FILTERS = [
      { label: 'JSON Files', extensions: ['.json'] },
      { label: 'All Files', extensions: ['*'] }
    ];

    var lineCount = computed(function() { return rawJson.value.split('\n').length; });

    var parsedSize = computed(function() {
      var bytes = new Blob([rawJson.value]).size;
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / 1048576).toFixed(1) + ' MB';
    });

    // Minimap viewport position
    var minimapViewport = computed(function() {
      var el = editorRef.value;
      if (!el) return {};
      var totalH = el.scrollHeight || 1;
      var visibleH = el.clientHeight || 1;
      var scrollTop = el.scrollTop || 0;
      var canvasH = minimapCanvas.value ? minimapCanvas.value.height : 200;
      var vpTop = (scrollTop / totalH) * canvasH;
      var vpH = Math.max(20, (visibleH / totalH) * canvasH);
      return { top: vpTop + 'px', height: vpH + 'px' };
    });

    function parseJson(text) {
      try {
        JSON.parse(text);
        jsonError.value = '';
        errorLine.value = 0;
        isValid.value = true;
        return true;
      } catch (e) {
        isValid.value = false;
        var msg = e.message || '';
        jsonError.value = msg;
        // Try to extract line from error message
        var posMatch = msg.match(/position\s+(\d+)/i);
        if (posMatch) {
          var pos = parseInt(posMatch[1]);
          var lines = text.substring(0, pos).split('\n');
          errorLine.value = lines.length;
        } else {
          var lineMatch = msg.match(/line\s+(\d+)/i);
          errorLine.value = lineMatch ? parseInt(lineMatch[1]) : 0;
        }
        return false;
      }
    }

    function onInput() {
      parseJson(rawJson.value);
      updateMinimap();
      updateTree();
    }

    function getIndent() {
      return indentSize.value === 'tab' ? '\t' : parseInt(indentSize.value);
    }

    function formatJson() {
      try {
        var obj = JSON.parse(rawJson.value);
        rawJson.value = JSON.stringify(obj, null, getIndent());
        parseJson(rawJson.value);
        updateMinimap();
        updateTree();
        ElMessage.success(t('formatted'));
      } catch (e) {
        parseJson(rawJson.value);
        ElMessage.error(t('invalid'));
      }
    }

    function reformat() {
      if (!isValid.value) return;
      try {
        var obj = JSON.parse(rawJson.value);
        rawJson.value = JSON.stringify(obj, null, getIndent());
        updateMinimap();
      } catch(e) {}
    }

    function minifyJson() {
      try {
        var obj = JSON.parse(rawJson.value);
        rawJson.value = JSON.stringify(obj);
        parseJson(rawJson.value);
        updateMinimap();
        updateTree();
        ElMessage.success(t('minified'));
      } catch (e) {
        ElMessage.error(t('invalid'));
      }
    }

    function validateJson() {
      if (parseJson(rawJson.value)) {
        ElMessage.success(t('valid'));
      } else {
        ElMessage.error(t('invalid') + ': ' + jsonError.value);
      }
    }

    function copyToClipboard() {
      navigator.clipboard.writeText(rawJson.value).then(function() {
        ElMessage.success(t('copied'));
      });
    }

    function clearAll() {
      rawJson.value = '';
      jsonError.value = '';
      errorLine.value = 0;
      isValid.value = true;
      updateMinimap();
      updateTree();
      ElMessage.info(t('cleared'));
    }

    function goToErrorLine() {
      if (!errorLine.value || !editorRef.value) return;
      var lines = rawJson.value.split('\n');
      var pos = 0;
      for (var i = 0; i < errorLine.value - 1 && i < lines.length; i++) {
        pos += lines[i].length + 1;
      }
      editorRef.value.focus();
      editorRef.value.setSelectionRange(pos, pos + (lines[errorLine.value - 1] || '').length);
      // Scroll line into view
      var lineH = editorRef.value.scrollHeight / lines.length;
      editorRef.value.scrollTop = Math.max(0, (errorLine.value - 5) * lineH);
    }

    function syncScroll() {
      if (lineNumsRef.value && editorRef.value) {
        lineNumsRef.value.scrollTop = editorRef.value.scrollTop;
      }
      updateMinimapViewport();
    }

    function updateMinimapViewport() {
      // Force recompute via a dummy ref toggle — the computed will re-evaluate
      // because editorRef.value scroll changes aren't reactive we just rely on CSS
    }

    // ── Minimap ──
    function updateMinimap() {
      if (!showMinimap.value) return;
      nextTick(function() { drawMinimap(); });
    }

    function drawMinimap() {
      var canvas = minimapCanvas.value;
      if (!canvas) return;
      var lines = rawJson.value.split('\n');
      var totalLines = lines.length;
      var w = 80, h = Math.min(Math.max(totalLines * 2, 100), 600);
      canvas.width = w;
      canvas.height = h;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, w, h);

      var lineH = h / Math.max(totalLines, 1);
      for (var i = 0; i < totalLines; i++) {
        var line = lines[i];
        var y = i * lineH;
        var trimmed = line.replace(/^\s+/, '');
        var indent = line.length - trimmed.length;
        var x = Math.min(indent * 2, 20);
        var barW = Math.min(trimmed.length * 0.8, w - x - 4);
        if (barW < 1) continue;

        // Color based on content
        if (i + 1 === errorLine.value) {
          ctx.fillStyle = 'rgba(239,68,68,0.7)';
        } else if (trimmed.match(/^\s*"/)) {
          ctx.fillStyle = trimmed.indexOf(':') > -1 ? 'rgba(147,197,253,0.5)' : 'rgba(134,239,172,0.4)';
        } else if (trimmed.match(/^\s*[\[\]{},]/)) {
          ctx.fillStyle = 'rgba(255,255,255,0.15)';
        } else if (trimmed.match(/^\s*(true|false|null)/)) {
          ctx.fillStyle = 'rgba(251,191,36,0.5)';
        } else if (trimmed.match(/^\s*\d/)) {
          ctx.fillStyle = 'rgba(196,181,253,0.5)';
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
        }
        ctx.fillRect(x + 2, y, barW, Math.max(lineH - 0.5, 1));
      }
    }

    function minimapClick(e) {
      var canvas = minimapCanvas.value;
      var editor = editorRef.value;
      if (!canvas || !editor) return;
      var rect = canvas.getBoundingClientRect();
      var y = e.clientY - rect.top;
      var ratio = y / canvas.height;
      editor.scrollTop = ratio * editor.scrollHeight - editor.clientHeight / 2;
      syncScroll();
    }

    // ── Tree View ──
    var treeError = ref('');
    var treeHtml = ref('');

    function updateTree() {
      if (viewMode.value !== 'split') return;
      try {
        var obj = JSON.parse(rawJson.value);
        treeHtml.value = buildTree(obj, 0);
        treeError.value = '';
      } catch (e) {
        treeError.value = e.message;
        treeHtml.value = '';
      }
    }

    function escapeHtml(s) {
      return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function buildTree(val, depth) {
      if (val === null) return '<span class="jv-t-null">null</span>';
      if (typeof val === 'boolean') return '<span class="jv-t-bool">' + val + '</span>';
      if (typeof val === 'number') return '<span class="jv-t-num">' + val + '</span>';
      if (typeof val === 'string') return '<span class="jv-t-str">"' + escapeHtml(val) + '"</span>';

      if (Array.isArray(val)) {
        if (val.length === 0) return '<span class="jv-t-brace">[]</span>';
        var items = '';
        for (var i = 0; i < val.length; i++) {
          items += '<div class="jv-t-row"><span class="jv-t-idx">' + i + '</span>: ' + buildTree(val[i], depth + 1) + '</div>';
        }
        return '<details' + (depth < 2 ? ' open' : '') + '><summary class="jv-t-toggle"><span class="jv-t-brace">[</span> <span class="jv-t-info">' + val.length + ' ' + t('items') + '</span></summary><div class="jv-t-children">' + items + '</div><span class="jv-t-brace">]</span></details>';
      }

      if (typeof val === 'object') {
        var keys = Object.keys(val);
        if (keys.length === 0) return '<span class="jv-t-brace">{}</span>';
        var rows = '';
        for (var k = 0; k < keys.length; k++) {
          rows += '<div class="jv-t-row"><span class="jv-t-key">"' + escapeHtml(keys[k]) + '"</span>: ' + buildTree(val[keys[k]], depth + 1) + '</div>';
        }
        return '<details' + (depth < 2 ? ' open' : '') + '><summary class="jv-t-toggle"><span class="jv-t-brace">{</span> <span class="jv-t-info">' + keys.length + ' ' + t('keys') + '</span></summary><div class="jv-t-children">' + rows + '</div><span class="jv-t-brace">}</span></details>';
      }
      return String(val);
    }

    // ── File Operations ──
    function openLocalFile() {
      showOpenMenu.value = false;
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json,.txt';
      input.onchange = function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          rawJson.value = ev.target.result;
          currentFilePath.value = '';
          onInput();
        };
        reader.readAsText(file);
      };
      input.click();
    }

    async function openServerFile() {
      showOpenMenu.value = false;
      if (!window.FileDialog) { ElMessage.error('FileDialog not available'); return; }
      var result = await window.FileDialog.open({ title: '📂 ' + t('openFile'), filters: JSON_FILTERS });
      if (!result) return;
      rawJson.value = result.content;
      currentFilePath.value = result.path;
      onInput();
    }

    function openFile() {
      showOpenMenu.value = !showOpenMenu.value;
      showSaveMenu.value = false;
    }

    async function saveFile() {
      showSaveMenu.value = false;
      if (currentFilePath.value) {
        if (!window.FileDialog) { ElMessage.error('FileDialog not available'); return; }
        var r = await window.FileDialog.writeFile(currentFilePath.value, rawJson.value);
        if (r) ElMessage.success(t('saved') + ' ✓');
      } else {
        await saveFileAs();
      }
    }

    async function saveFileAs() {
      showSaveMenu.value = false;
      if (!window.FileDialog) { ElMessage.error('FileDialog not available'); return; }
      var result = await window.FileDialog.save({ title: '💾 ' + t('saveAs'), defaultName: currentFilePath.value ? currentFilePath.value.split('/').pop() : 'data.json', filters: JSON_FILTERS });
      if (!result) return;
      var r = await window.FileDialog.writeFile(result.path, rawJson.value);
      if (r) {
        currentFilePath.value = result.path;
        ElMessage.success(t('saved') + ' ✓');
      }
    }

    function saveLocal() {
      showSaveMenu.value = false;
      var blob = new Blob([rawJson.value], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = currentFilePath.value ? currentFilePath.value.split('/').pop() : 'data.json';
      a.click();
      URL.revokeObjectURL(url);
    }

    function showSaveOptions() {
      showSaveMenu.value = !showSaveMenu.value;
      showOpenMenu.value = false;
    }

    function closeMenus(e) {
      if (!e.target.closest('.jv-dropdown-wrap')) {
        showOpenMenu.value = false;
        showSaveMenu.value = false;
      }
    }

    // ── Watchers ──
    watch(showMinimap, function() { nextTick(function() { drawMinimap(); }); });
    watch(viewMode, function() { nextTick(function() { updateTree(); }); });

    onMounted(function() {
      window.addEventListener('locale-changed', onLocaleChanged);
      document.addEventListener('click', closeMenus);
      parseJson(rawJson.value);
      nextTick(function() {
        drawMinimap();
        updateTree();
        // keep minimap viewport synced on scroll
        if (editorRef.value) {
          editorRef.value.addEventListener('scroll', function() {
            syncScroll();
            // force re-render minimap viewport
            showMinimap.value = showMinimap.value;
          });
        }
      });
    });

    onUnmounted(function() {
      window.removeEventListener('locale-changed', onLocaleChanged);
      document.removeEventListener('click', closeMenus);
    });

    return {
      t, rawJson, indentSize, showMinimap, viewMode, jsonError, errorLine, isValid,
      editorRef, lineNumsRef, minimapRef, minimapCanvas, treeRef,
      lineCount, parsedSize, minimapViewport, treeError, treeHtml,
      currentFilePath, showOpenMenu, showSaveMenu,
      onInput, formatJson, reformat, minifyJson, validateJson,
      copyToClipboard, clearAll, goToErrorLine, syncScroll, minimapClick,
      openFile, openLocalFile, openServerFile,
      saveFile, saveFileAs, saveLocal, showSaveOptions
    };
  }
})
