({
  setup() {
    const { ref, computed, watch, onMounted, onUnmounted, nextTick } = Vue;
    const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success(){}, error(){}, warning(){}, info(){} };

    /* ── i18n ── */
    const LANGS = {
      tr: {
        title:'HTML Editörü', open:'Aç', save:'Kaydet', saveAs:'Farklı Kaydet', newFile:'Yeni',
        preview:'Ön İzleme', refresh:'Yenile', autoRefresh:'Otomatik Yenile', format:'Biçimlendir',
        wordWrap:'Sözcük Kaydır', boilerplate:'HTML Şablonu', insertTag:'Etiket Ekle',
        console:'Konsol', openExternal:'Yeni Pencerede Aç', saved:'Kaydedildi ✓',
        untitled:'Adsız.html', lines:'satır', chars:'karakter'
      },
      en: {
        title:'HTML Editor', open:'Open', save:'Save', saveAs:'Save As', newFile:'New',
        preview:'Preview', refresh:'Refresh', autoRefresh:'Auto Refresh', format:'Format',
        wordWrap:'Word Wrap', boilerplate:'HTML Template', insertTag:'Insert Tag',
        console:'Console', openExternal:'Open in New Window', saved:'Saved ✓',
        untitled:'Untitled.html', lines:'lines', chars:'characters'
      },
      de: {
        title:'HTML-Editor', open:'Öffnen', save:'Speichern', saveAs:'Speichern unter', newFile:'Neu',
        preview:'Vorschau', refresh:'Aktualisieren', autoRefresh:'Auto-Aktualisierung', format:'Formatieren',
        wordWrap:'Zeilenumbruch', boilerplate:'HTML-Vorlage', insertTag:'Tag einfügen',
        console:'Konsole', openExternal:'In neuem Fenster öffnen', saved:'Gespeichert ✓',
        untitled:'Unbenannt.html', lines:'Zeilen', chars:'Zeichen'
      },
      fr: {
        title:'Éditeur HTML', open:'Ouvrir', save:'Enregistrer', saveAs:'Enregistrer sous', newFile:'Nouveau',
        preview:'Aperçu', refresh:'Rafraîchir', autoRefresh:'Auto-rafraîchissement', format:'Formater',
        wordWrap:'Retour à la ligne', boilerplate:'Modèle HTML', insertTag:'Insérer balise',
        console:'Console', openExternal:'Ouvrir dans une nouvelle fenêtre', saved:'Enregistré ✓',
        untitled:'SansNom.html', lines:'lignes', chars:'caractères'
      },
      es: {
        title:'Editor HTML', open:'Abrir', save:'Guardar', saveAs:'Guardar como', newFile:'Nuevo',
        preview:'Vista previa', refresh:'Actualizar', autoRefresh:'Auto actualizar', format:'Formatear',
        wordWrap:'Ajuste de línea', boilerplate:'Plantilla HTML', insertTag:'Insertar etiqueta',
        console:'Consola', openExternal:'Abrir en nueva ventana', saved:'Guardado ✓',
        untitled:'SinNombre.html', lines:'líneas', chars:'caracteres'
      },
      ru: {
        title:'HTML-редактор', open:'Открыть', save:'Сохранить', saveAs:'Сохранить как', newFile:'Новый',
        preview:'Просмотр', refresh:'Обновить', autoRefresh:'Авто-обновление', format:'Форматировать',
        wordWrap:'Перенос слов', boilerplate:'Шаблон HTML', insertTag:'Вставить тег',
        console:'Консоль', openExternal:'Открыть в новом окне', saved:'Сохранено ✓',
        untitled:'Безымянный.html', lines:'строк', chars:'символов'
      },
      zh: { title:'HTML编辑器', open:'打开', save:'保存', saveAs:'另存为', newFile:'新建', preview:'预览', refresh:'刷新', autoRefresh:'自动刷新', format:'格式化', wordWrap:'自动换行', boilerplate:'HTML模板', insertTag:'插入标签', console:'控制台', openExternal:'新窗口打开', saved:'已保存', untitled:'未命名.html', lines:'行', chars:'字符' },
      ja: { title:'HTMLエディタ', open:'開く', save:'保存', saveAs:'名前を付けて保存', newFile:'新規', preview:'プレビュー', refresh:'更新', autoRefresh:'自動更新', format:'フォーマット', wordWrap:'折り返し', boilerplate:'HTMLテンプレート', insertTag:'タグ挿入', console:'コンソール', openExternal:'新しいウィンドウで開く', saved:'保存済', untitled:'無題.html', lines:'行', chars:'文字' },
      it: { title:'Editor HTML', open:'Apri', save:'Salva', saveAs:'Salva con nome', newFile:'Nuovo', preview:'Anteprima', refresh:'Aggiorna', autoRefresh:'Aggiornamento automatico', format:'Formatta', wordWrap:'A capo automatico', boilerplate:'Modello HTML', insertTag:'Inserisci tag', console:'Console', openExternal:'Apri in nuova finestra', saved:'Salvato', untitled:'SenzaNome.html', lines:'righe', chars:'caratteri' },
      ar: { title:'محرر HTML', open:'فتح', save:'حفظ', saveAs:'حفظ باسم', newFile:'جديد', preview:'معاينة', refresh:'تحديث', autoRefresh:'تحديث تلقائي', format:'تنسيق', wordWrap:'التفاف النص', boilerplate:'قالب HTML', insertTag:'إدراج وسم', console:'وحدة التحكم', openExternal:'فتح في نافذة جديدة', saved:'تم الحفظ', untitled:'بدون عنوان.html', lines:'سطر', chars:'حرف' },
      ko: { title:'HTML 편집기', open:'열기', save:'저장', saveAs:'다른 이름으로 저장', newFile:'새 파일', preview:'미리보기', refresh:'새로고침', autoRefresh:'자동 새로고침', format:'정렬', wordWrap:'줄 바꿈', boilerplate:'HTML 템플릿', insertTag:'태그 삽입', console:'콘솔', openExternal:'새 창에서 열기', saved:'저장됨', untitled:'제목없음.html', lines:'줄', chars:'문자' },
      hi: { title:'HTML एडिटर', open:'खोलें', save:'सहेजें', saveAs:'इस रूप में सहेजें', newFile:'नया', preview:'पूर्वावलोकन', refresh:'रीफ्रेश', autoRefresh:'ऑटो रीफ्रेश', format:'फॉर्मेट', wordWrap:'वर्ड रैप', boilerplate:'HTML टेम्पलेट', insertTag:'टैग जोड़ें', console:'कंसोल', openExternal:'नई विंडो में खोलें', saved:'सहेजा गया', untitled:'शीर्षकहीन.html', lines:'पंक्तियाँ', chars:'अक्षर' },
      pt: { title:'Editor HTML', open:'Abrir', save:'Salvar', saveAs:'Salvar como', newFile:'Novo', preview:'Pré-visualização', refresh:'Atualizar', autoRefresh:'Atualização automática', format:'Formatar', wordWrap:'Quebra de linha', boilerplate:'Modelo HTML', insertTag:'Inserir tag', console:'Console', openExternal:'Abrir em nova janela', saved:'Salvo', untitled:'SemNome.html', lines:'linhas', chars:'caracteres' }
    };

    function getLocale() { return localStorage.getItem('sys_locale') || 'tr'; }
    var locale = ref(getLocale());
    var t = function(k) { return (LANGS[locale.value] && LANGS[locale.value][k]) || LANGS.en[k] || k; };
    function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

    /* ── State ── */
    var htmlCode = ref('<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello World! 🌐</h1>\n  <p>Start editing to see live preview.</p>\n</body>\n</html>');
    var cssCode = ref('body {\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n  max-width: 800px;\n  margin: 0 auto;\n  padding: 40px 20px;\n  background: #f5f5f5;\n  color: #333;\n}\n\nh1 {\n  color: #e44d26;\n}\n\np {\n  line-height: 1.6;\n  font-size: 16px;\n}');
    var jsCode = ref('// JavaScript code here\nconsole.log("Hello from HTML Editor!");');

    var activeTab = ref('html');
    var layout = ref('horizontal');
    var editorTheme = ref('vs-dark');
    var fontSize = ref(14);
    var wordWrap = ref(true);
    var autoRefresh = ref(true);
    var showConsole = ref(false);
    var consoleLogs = ref([]);
    var currentFilePath = ref('');
    var currentFileName = ref('');
    var editorEl = ref(null);
    var previewFrame = ref(null);

    var tabs = [
      { id: 'html', label: 'HTML', icon: '🟧', language: 'html' },
      { id: 'css', label: 'CSS', icon: '🟦', language: 'css' },
      { id: 'js', label: 'JS', icon: '🟨', language: 'javascript' }
    ];

    /* ── Monaco ── */
    var monacoLib = null;
    var editor = null;
    var editorModels = {};
    var refreshTimer = null;

    function initMonaco() {
      if (typeof require === 'undefined' || !require.config) return;
      require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs' }});
      require(['vs/editor/editor.main'], function(monaco) {
        monacoLib = monaco;

        editorModels.html = monaco.editor.createModel(htmlCode.value, 'html');
        editorModels.css = monaco.editor.createModel(cssCode.value, 'css');
        editorModels.js = monaco.editor.createModel(jsCode.value, 'javascript');

        editor = monaco.editor.create(editorEl.value, {
          model: editorModels.html,
          theme: editorTheme.value,
          fontSize: fontSize.value,
          fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          minimap: { enabled: false },
          lineNumbers: 'on',
          roundedSelection: true,
          smoothScrolling: true,
          wordWrap: wordWrap.value ? 'on' : 'off',
          padding: { top: 8, bottom: 8 },
          tabSize: 2,
          renderWhitespace: 'selection',
          suggest: { showWords: false },
          bracketPairColorization: { enabled: true },
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          formatOnPaste: true
        });

        editorModels.html.onDidChangeContent(function() {
          htmlCode.value = editorModels.html.getValue();
          scheduleRefresh();
        });
        editorModels.css.onDidChangeContent(function() {
          cssCode.value = editorModels.css.getValue();
          scheduleRefresh();
        });
        editorModels.js.onDidChangeContent(function() {
          jsCode.value = editorModels.js.getValue();
          scheduleRefresh();
        });

        editor.addAction({ id: 'save-html', label: 'Save', keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS], run: function() { saveFile(); } });
        editor.addAction({ id: 'open-html', label: 'Open', keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyO], run: function() { openFile(); } });
        editor.addAction({ id: 'format-html', label: 'Format', keybindings: [monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF], run: function() { formatCode(); } });

        editor.onDidChangeCursorPosition(function(e) {
          cursorInfo.value = 'Ln ' + e.position.lineNumber + ', Col ' + e.position.column;
        });

        nextTick(function() { refreshPreview(); });
      });
    }

    /* ── Tab switching ── */
    function switchTab(id) {
      activeTab.value = id;
      if (editor && editorModels[id]) {
        editor.setModel(editorModels[id]);
        editor.focus();
      }
    }

    /* ── Cursor & line info ── */
    var cursorInfo = ref('Ln 1, Col 1');
    var lineCount = computed(function() {
      if (!editor) return 0;
      var model = editor.getModel();
      return model ? model.getLineCount() : 0;
    });

    /* ── Preview ── */
    function buildPreviewDoc() {
      var html = htmlCode.value;

      var consoleScript = [
        '<script>',
        '(function(){',
        '  var _post = function(type, args) {',
        '    try { parent.postMessage({type:"he-console",logType:type,text:Array.prototype.slice.call(args).map(function(a){return typeof a==="object"?JSON.stringify(a):String(a)}).join(" ")},"*"); } catch(e){}',
        '  };',
        '  console.log = function(){ _post("log", arguments); };',
        '  console.warn = function(){ _post("warn", arguments); };',
        '  console.error = function(){ _post("error", arguments); };',
        '  console.info = function(){ _post("info", arguments); };',
        '  window.onerror = function(msg,src,line,col,err){ _post("error", ["Error: "+msg+" (line "+line+")"]); };',
        '})();',
        '<\/script>'
      ].join('\n');

      var cssInjection = '<style>\n' + cssCode.value + '\n</style>';
      var jsInjection = '<script>\n' + jsCode.value + '\n<\/script>';

      if (html.includes('</head>')) {
        html = html.replace('</head>', consoleScript + '\n' + cssInjection + '\n</head>');
      } else if (html.includes('<body')) {
        html = html.replace(/<body/, consoleScript + '\n' + cssInjection + '\n<body');
      } else {
        html = consoleScript + '\n' + cssInjection + '\n' + html;
      }

      if (html.includes('</body>')) {
        html = html.replace('</body>', jsInjection + '\n</body>');
      } else {
        html = html + '\n' + jsInjection;
      }

      return html;
    }

    function refreshPreview() {
      if (!previewFrame.value) return;
      consoleLogs.value = [];
      var doc = buildPreviewDoc();
      var frame = previewFrame.value;
      frame.srcdoc = doc;
    }

    function scheduleRefresh() {
      if (!autoRefresh.value) return;
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(refreshPreview, 400);
    }

    function toggleAutoRefresh() {
      autoRefresh.value = !autoRefresh.value;
    }

    function toggleConsole() {
      showConsole.value = !showConsole.value;
    }

    function openInNewWindow() {
      var win = window.open('', '_blank');
      if (!win) return;
      win.document.open();
      win.document.write(buildPreviewDoc());
      win.document.close();
    }

    /* ── Console message listener ── */
    function onConsoleMessage(e) {
      if (!e.data || e.data.type !== 'he-console') return;
      consoleLogs.value.push({ type: e.data.logType || 'log', text: e.data.text || '' });
      if (consoleLogs.value.length > 200) consoleLogs.value.splice(0, consoleLogs.value.length - 200);
    }

    /* ── Resize ── */
    var previewSize = ref(50);
    var previewStyle = computed(function() {
      return { flex: '0 0 ' + previewSize.value + '%' };
    });

    function startResize(e) {
      e.preventDefault();
      var startX = e.clientX;
      var startY = e.clientY;
      var startSize = previewSize.value;
      var parent = e.target.parentElement;
      var parentRect = parent.getBoundingClientRect();

      function onMove(ev) {
        if (layout.value === 'horizontal') {
          var dx = ev.clientX - startX;
          var pct = dx / parentRect.width * 100;
          previewSize.value = Math.max(20, Math.min(80, startSize - pct));
        } else {
          var dy = ev.clientY - startY;
          var pctV = dy / parentRect.height * 100;
          previewSize.value = Math.max(20, Math.min(80, startSize - pctV));
        }
      }
      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    }

    /* ── Snippets ── */
    var SNIPPETS = {
      boilerplate: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Document</title>\n</head>\n<body>\n  \n</body>\n</html>',
      div: '<div class="">\n  \n</div>',
      p: '<p></p>',
      h1: '<h1></h1>',
      a: '<a href="#"></a>',
      img: '<img src="" alt="">',
      ul: '<ul>\n  <li></li>\n  <li></li>\n  <li></li>\n</ul>',
      table: '<table>\n  <thead>\n    <tr>\n      <th>Header 1</th>\n      <th>Header 2</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>Cell 1</td>\n      <td>Cell 2</td>\n    </tr>\n  </tbody>\n</table>',
      form: '<form action="" method="post">\n  <label for="name">Name:</label>\n  <input type="text" id="name" name="name">\n  <button type="submit">Submit</button>\n</form>',
      input: '<input type="text" placeholder="">',
      button: '<button type="button">Click me</button>',
      video: '<video src="" controls width="640"></video>',
      canvas: '<canvas id="myCanvas" width="400" height="300"></canvas>'
    };

    function insertSnippet(key) {
      var snippet = SNIPPETS[key] || '';
      if (!editor || !snippet) return;
      if (key !== 'boilerplate' && activeTab.value !== 'html') {
        switchTab('html');
        nextTick(function() { doInsert(snippet); });
        return;
      }
      if (key === 'boilerplate') {
        if (activeTab.value !== 'html') switchTab('html');
        editorModels.html.setValue(snippet);
        return;
      }
      doInsert(snippet);
    }

    function doInsert(text) {
      if (!editor) return;
      var sel = editor.getSelection();
      editor.executeEdits('', [{ range: sel, text: text }]);
      editor.focus();
    }

    /* ── Format ── */
    function formatCode() {
      if (!editor) return;
      editor.getAction('editor.action.formatDocument').run();
    }

    /* ── Word wrap ── */
    function toggleWrap() {
      wordWrap.value = !wordWrap.value;
      if (editor) editor.updateOptions({ wordWrap: wordWrap.value ? 'on' : 'off' });
    }

    /* ── Theme & font ── */
    function setTheme(theme) {
      editorTheme.value = theme;
      if (monacoLib) monacoLib.editor.setTheme(theme);
    }

    function setFontSize(size) {
      fontSize.value = size;
      if (editor) editor.updateOptions({ fontSize: size });
    }

    /* ── File operations ── */
    var HTML_FILTERS = [
      { label: 'HTML', extensions: ['.html', '.htm'] },
      { label: 'All Files', extensions: ['*'] }
    ];

    function parseFileContent(content) {
      var result = { html: content, css: '', js: '' };

      var styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
      if (styleMatch) {
        result.css = styleMatch[1].trim();
        result.html = content.replace(styleMatch[0], '');
      }

      var scriptMatch = result.html.match(/<script[^>]*(?!.*src\s*=)[^>]*>([\s\S]*?)<\/script>/i);
      if (scriptMatch) {
        result.js = scriptMatch[1].trim();
        result.html = result.html.replace(scriptMatch[0], '');
      }

      result.html = result.html.trim();
      return result;
    }

    async function openFile() {
      var result = await window.FileDialog.open({ title: '📂 ' + t('open'), filters: HTML_FILTERS });
      if (!result) return;
      var parsed = parseFileContent(result.content || '');
      htmlCode.value = parsed.html;
      cssCode.value = parsed.css;
      jsCode.value = parsed.js;
      currentFilePath.value = result.path || '';
      currentFileName.value = result.name || '';
      if (editorModels.html) editorModels.html.setValue(htmlCode.value);
      if (editorModels.css) editorModels.css.setValue(cssCode.value);
      if (editorModels.js) editorModels.js.setValue(jsCode.value);
      switchTab('html');
      refreshPreview();
    }

    function buildFullFile() {
      var html = htmlCode.value;
      var css = cssCode.value.trim();
      var js = jsCode.value.trim();

      if (css) {
        var styleBlock = '<style>\n' + css + '\n</style>';
        if (html.includes('</head>')) {
          html = html.replace('</head>', styleBlock + '\n</head>');
        } else {
          html = styleBlock + '\n' + html;
        }
      }

      if (js) {
        var scriptBlock = '<script>\n' + js + '\n<\/script>';
        if (html.includes('</body>')) {
          html = html.replace('</body>', scriptBlock + '\n</body>');
        } else {
          html = html + '\n' + scriptBlock;
        }
      }

      return html;
    }

    async function saveFile() {
      if (!editor) return;
      var content = buildFullFile();
      if (currentFilePath.value) {
        var r = await window.FileDialog.writeFile(currentFilePath.value, content);
        if (r) ElMessage.success(t('saved'));
      } else {
        await saveFileAs();
      }
    }

    async function saveFileAs() {
      if (!editor) return;
      var content = buildFullFile();
      var result = await window.FileDialog.save({ title: '💾 ' + t('saveAs'), defaultName: currentFileName.value || t('untitled'), filters: HTML_FILTERS });
      if (!result) return;
      var r = await window.FileDialog.writeFile(result.path, content);
      if (r) {
        currentFilePath.value = result.path;
        currentFileName.value = result.name;
        ElMessage.success(t('saved'));
      }
    }

    function newFile() {
      htmlCode.value = SNIPPETS.boilerplate;
      cssCode.value = '';
      jsCode.value = '';
      currentFilePath.value = '';
      currentFileName.value = '';
      if (editorModels.html) editorModels.html.setValue(htmlCode.value);
      if (editorModels.css) editorModels.css.setValue(cssCode.value);
      if (editorModels.js) editorModels.js.setValue(jsCode.value);
      switchTab('html');
      refreshPreview();
    }

    /* ── Lifecycle ── */
    onMounted(function() {
      window.addEventListener('locale-changed', onLocaleChanged);
      window.addEventListener('message', onConsoleMessage);
      nextTick(initMonaco);
    });

    onUnmounted(function() {
      window.removeEventListener('locale-changed', onLocaleChanged);
      window.removeEventListener('message', onConsoleMessage);
      if (refreshTimer) clearTimeout(refreshTimer);
      if (editor) { editor.dispose(); editor = null; }
      Object.keys(editorModels).forEach(function(k) {
        if (editorModels[k]) editorModels[k].dispose();
      });
    });

    return {
      t, locale, activeTab, layout, editorTheme, fontSize, wordWrap,
      autoRefresh, showConsole, consoleLogs,
      currentFilePath, currentFileName,
      htmlCode, cssCode, jsCode,
      tabs, editorEl, previewFrame,
      cursorInfo, lineCount,
      previewStyle,
      switchTab, refreshPreview, scheduleRefresh,
      toggleAutoRefresh, toggleConsole, openInNewWindow,
      insertSnippet, formatCode, toggleWrap,
      setTheme, setFontSize,
      openFile, saveFile, saveFileAs, newFile,
      startResize
    };
  }
})
