({
  setup() {
    const { ref, computed, watch, onMounted, onUnmounted, nextTick } = Vue;
    const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success(){}, error(){}, warning(){}, info(){} };

    const LANGS = {
      tr: {
        title:'Markdown Görüntüleyici', open:'Aç', save:'Kaydet', saveAs:'Farklı Kaydet',
        newFile:'Yeni', edit:'Düzenle', preview:'Ön İzleme', split:'Bölünmüş',
        wordWrap:'Sözcük Kaydır', fontSize:'Yazı Boyutu', exportHtml:'HTML Olarak Dışa Aktar',
        print:'Yazdır', exportPdf:'PDF Olarak Dışa Aktar', copied:'Kopyalandı', saved:'Kaydedildi ✓', untitled:'Adsız.md',
        tocTitle:'İçindekiler', insertTable:'Tablo Ekle', insertImage:'Resim Ekle',
        insertLink:'Bağlantı Ekle', insertCode:'Kod Bloğu', bold:'Kalın', italic:'İtalik',
        strikethrough:'Üstü Çizili', heading:'Başlık', quote:'Alıntı', list:'Liste',
        orderedList:'Numaralı Liste', checkbox:'Onay Kutusu', hr:'Yatay Çizgi',
        lines:'satır', chars:'karakter', words:'kelime'
      },
      en: {
        title:'Markdown Viewer', open:'Open', save:'Save', saveAs:'Save As',
        newFile:'New', edit:'Edit', preview:'Preview', split:'Split',
        wordWrap:'Word Wrap', fontSize:'Font Size', exportHtml:'Export as HTML',
        print:'Print', exportPdf:'Export as PDF', copied:'Copied', saved:'Saved ✓', untitled:'Untitled.md',
        tocTitle:'Table of Contents', insertTable:'Insert Table', insertImage:'Insert Image',
        insertLink:'Insert Link', insertCode:'Code Block', bold:'Bold', italic:'Italic',
        strikethrough:'Strikethrough', heading:'Heading', quote:'Blockquote', list:'List',
        orderedList:'Ordered List', checkbox:'Checkbox', hr:'Horizontal Rule',
        lines:'lines', chars:'characters', words:'words'
      },
      de: {
        title:'Markdown-Betrachter', open:'Öffnen', save:'Speichern', saveAs:'Speichern unter',
        newFile:'Neu', edit:'Bearbeiten', preview:'Vorschau', split:'Geteilt',
        wordWrap:'Zeilenumbruch', fontSize:'Schriftgröße', exportHtml:'Als HTML exportieren',
        print:'Drucken', exportPdf:'Als PDF exportieren', copied:'Kopiert', saved:'Gespeichert ✓', untitled:'Unbenannt.md',
        tocTitle:'Inhaltsverzeichnis', insertTable:'Tabelle einfügen', insertImage:'Bild einfügen',
        insertLink:'Link einfügen', insertCode:'Codeblock', bold:'Fett', italic:'Kursiv',
        strikethrough:'Durchgestrichen', heading:'Überschrift', quote:'Blockzitat', list:'Liste',
        orderedList:'Nummerierte Liste', checkbox:'Kontrollkästchen', hr:'Horizontale Linie',
        lines:'Zeilen', chars:'Zeichen', words:'Wörter'
      },
      fr: {
        title:'Visionneuse Markdown', open:'Ouvrir', save:'Enregistrer', saveAs:'Enregistrer sous',
        newFile:'Nouveau', edit:'Éditer', preview:'Aperçu', split:'Divisé',
        wordWrap:'Retour à la ligne', fontSize:'Taille', exportHtml:'Exporter en HTML',
        print:'Imprimer', exportPdf:'Exporter en PDF', copied:'Copié', saved:'Enregistré ✓', untitled:'SansNom.md',
        tocTitle:'Table des matières', insertTable:'Insérer un tableau', insertImage:'Insérer une image',
        insertLink:'Insérer un lien', insertCode:'Bloc de code', bold:'Gras', italic:'Italique',
        strikethrough:'Barré', heading:'Titre', quote:'Citation', list:'Liste',
        orderedList:'Liste numérotée', checkbox:'Case à cocher', hr:'Ligne horizontale',
        lines:'lignes', chars:'caractères', words:'mots'
      },
      es: {
        title:'Visor Markdown', open:'Abrir', save:'Guardar', saveAs:'Guardar como',
        newFile:'Nuevo', edit:'Editar', preview:'Vista previa', split:'Dividido',
        wordWrap:'Ajuste de línea', fontSize:'Tamaño', exportHtml:'Exportar como HTML',
        print:'Imprimir', exportPdf:'Exportar como PDF', copied:'Copiado', saved:'Guardado ✓', untitled:'SinNombre.md',
        tocTitle:'Tabla de contenidos', insertTable:'Insertar tabla', insertImage:'Insertar imagen',
        insertLink:'Insertar enlace', insertCode:'Bloque de código', bold:'Negrita', italic:'Cursiva',
        strikethrough:'Tachado', heading:'Encabezado', quote:'Cita', list:'Lista',
        orderedList:'Lista numerada', checkbox:'Casilla', hr:'Línea horizontal',
        lines:'líneas', chars:'caracteres', words:'palabras'
      },
      ru: {
        title:'Просмотр Markdown', open:'Открыть', save:'Сохранить', saveAs:'Сохранить как',
        newFile:'Новый', edit:'Редактировать', preview:'Просмотр', split:'Разделённый',
        wordWrap:'Перенос слов', fontSize:'Размер', exportHtml:'Экспорт в HTML',
        print:'Печать', exportPdf:'Экспорт в PDF', copied:'Скопировано', saved:'Сохранено ✓', untitled:'Безымянный.md',
        tocTitle:'Содержание', insertTable:'Вставить таблицу', insertImage:'Вставить изображение',
        insertLink:'Вставить ссылку', insertCode:'Блок кода', bold:'Жирный', italic:'Курсив',
        strikethrough:'Зачёркнутый', heading:'Заголовок', quote:'Цитата', list:'Список',
        orderedList:'Нумерованный список', checkbox:'Флажок', hr:'Горизонтальная линия',
        lines:'строк', chars:'символов', words:'слов'
      },
    zh: { title:'Markdown查看器', open:'打开', save:'保存', saveAs:'另存为', newFile:'新建', edit:'编辑', preview:'预览', split:'分屏', wordWrap:'自动换行', fontSize:'字体大小', exportHtml:'导出HTML', print:'打印', exportPdf:'导出PDF', copied:'已复制', saved:'已保存', untitled:'未命名.md', tocTitle:'目录', insertTable:'插入表格', insertImage:'插入图片', insertLink:'插入链接', insertCode:'代码块', bold:'粗体', italic:'斜体', strikethrough:'删除线', heading:'标题', quote:'引用', list:'列表', orderedList:'有序列表', checkbox:'复选框', hr:'水平线', lines:'行', chars:'字符', words:'字' },
    ja: { title:'Markdownビューア', open:'開く', save:'保存', saveAs:'名前を付けて保存', newFile:'新規', edit:'編集', preview:'プレビュー', split:'分割', wordWrap:'折り返し', fontSize:'文字サイズ', exportHtml:'HTML出力', print:'印刷', exportPdf:'PDF出力', copied:'コピー済', saved:'保存済', untitled:'無題.md', tocTitle:'目次', insertTable:'表を挿入', insertImage:'画像を挿入', insertLink:'リンクを挿入', insertCode:'コードブロック', bold:'太字', italic:'斜体', strikethrough:'取消線', heading:'見出し', quote:'引用', list:'リスト', orderedList:'番号リスト', checkbox:'チェックボックス', hr:'水平線', lines:'行', chars:'文字', words:'単語' },
    it: { title:'Visualizzatore Markdown', open:'Apri', save:'Salva', saveAs:'Salva con nome', newFile:'Nuovo', edit:'Modifica', preview:'Anteprima', split:'Diviso', wordWrap:'A capo automatico', fontSize:'Dimensione testo', exportHtml:'Esporta HTML', print:'Stampa', exportPdf:'Esporta PDF', copied:'Copiato', saved:'Salvato', untitled:'SenzaNome.md', tocTitle:'Indice', insertTable:'Inserisci tabella', insertImage:'Inserisci immagine', insertLink:'Inserisci link', insertCode:'Blocco codice', bold:'Grassetto', italic:'Corsivo', strikethrough:'Barrato', heading:'Intestazione', quote:'Citazione', list:'Elenco', orderedList:'Elenco numerato', checkbox:'Casella di controllo', hr:'Linea orizzontale', lines:'righe', chars:'caratteri', words:'parole' }
  };

    function getLocale() { return localStorage.getItem('sys_locale') || 'tr'; }
    var locale = ref(getLocale());
    var t = function(k) { return (LANGS[locale.value] && LANGS[locale.value][k]) || LANGS.en[k] || k; };
    function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

    /* ── State ── */
    var mdText = ref('# Hello Markdown! 🎉\n\nThis is a **Markdown** editor with _live preview_.\n\n## Features\n\n- ✅ Live preview\n- ✅ Syntax highlighting\n- ✅ File open/save\n- ✅ Export to HTML\n- ✅ Table of contents\n\n## Code Example\n\n```javascript\nfunction greet(name) {\n  console.log(`Hello, ${name}!`);\n}\n\ngreet("World");\n```\n\n## Table\n\n| Name | Age | City |\n|------|-----|------|\n| Ali | 25 | Istanbul |\n| John | 30 | London |\n\n> This is a blockquote.\n\n---\n\n[Visit GitHub](https://github.com)\n');
    var viewMode = ref('split');
    var wordWrap = ref(true);
    var fontSize = ref(14);
    var currentFilePath = ref('');
    var currentFileName = ref('');
    var editorEl = ref(null);
    var previewEl = ref(null);

    /* ── Monaco ── */
    var monacoLib = null;
    var editor = null;

    /* ── Marked.js ── */
    var markedLoaded = ref(false);
    var markedLib = null;

    function loadMarked() {
      return new Promise(function(resolve, reject) {
        if (window.marked) { markedLib = window.marked; markedLoaded.value = true; resolve(); return; }
        var savedDefine = window.define;
        window.define = undefined;
        var s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/marked/15.0.7/marked.min.js';
        s.onload = function() {
          window.define = savedDefine;
          markedLib = window.marked;
          markedLoaded.value = true;
          resolve();
        };
        s.onerror = function(e) { window.define = savedDefine; reject(e); };
        document.head.appendChild(s);
      });
    }

    function renderMarkdown(text) {
      if (!markedLib) return '';
      try {
        return markedLib.parse(text || '', { gfm: true, breaks: true });
      } catch(e) { return '<pre>' + text + '</pre>'; }
    }

    var htmlPreview = computed(function() { if (!markedLoaded.value) return ''; return renderMarkdown(mdText.value); });

    /* ── Stats ── */
    var stats = computed(function() {
      var text = mdText.value;
      var lines = text.split('\n').length;
      var chars = text.length;
      var words = text.trim() ? text.trim().split(/\s+/).length : 0;
      return { lines: lines, chars: chars, words: words };
    });

    /* ── TOC ── */
    var toc = computed(function() {
      var lines = mdText.value.split('\n');
      var items = [];
      for (var i = 0; i < lines.length; i++) {
        var m = lines[i].match(/^(#{1,6})\s+(.+)/);
        if (m) {
          items.push({ level: m[1].length, text: m[2].replace(/[*_`#]/g, ''), line: i });
        }
      }
      return items;
    });

    function goToHeading(item) {
      if (!editor) return;
      editor.revealLineInCenter(item.line + 1);
      editor.setPosition({ lineNumber: item.line + 1, column: 1 });
      editor.focus();
    }

    /* ── Monaco init ── */
    function initMonaco() {
      if (typeof require === 'undefined' || !require.config) return;
      require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs' }});
      require(['vs/editor/editor.main'], function(monaco) {
        monacoLib = monaco;
        editor = monaco.editor.create(editorEl.value, {
          value: mdText.value,
          language: 'markdown',
          theme: 'vs-dark',
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
          renderWhitespace: 'selection'
        });
        editor.onDidChangeModelContent(function() {
          mdText.value = editor.getValue();
        });
        editor.addAction({ id: 'save-md', label: 'Save', keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS], run: function() { saveFile(); } });
        editor.addAction({ id: 'open-md', label: 'Open', keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyO], run: function() { openFile(); } });
        editor.addAction({ id: 'bold', label: 'Bold', keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB], run: function() { wrapSelection('**', '**'); } });
        editor.addAction({ id: 'italic', label: 'Italic', keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI], run: function() { wrapSelection('_', '_'); } });
      });
    }

    /* ── Editor helpers ── */
    function insertText(text) {
      if (!editor) return;
      var sel = editor.getSelection();
      editor.executeEdits('', [{ range: sel, text: text }]);
      editor.focus();
    }

    function wrapSelection(before, after) {
      if (!editor) return;
      var sel = editor.getSelection();
      var selected = editor.getModel().getValueInRange(sel);
      editor.executeEdits('', [{ range: sel, text: before + (selected || 'text') + after }]);
      editor.focus();
    }

    function insertHeading(level) {
      var prefix = '#'.repeat(level) + ' ';
      if (!editor) return;
      var pos = editor.getPosition();
      var lineContent = editor.getModel().getLineContent(pos.lineNumber);
      var existing = lineContent.match(/^#{1,6}\s/);
      if (existing) {
        var range = { startLineNumber: pos.lineNumber, startColumn: 1, endLineNumber: pos.lineNumber, endColumn: existing[0].length + 1 };
        editor.executeEdits('', [{ range: range, text: prefix }]);
      } else {
        editor.executeEdits('', [{ range: { startLineNumber: pos.lineNumber, startColumn: 1, endLineNumber: pos.lineNumber, endColumn: 1 }, text: prefix }]);
      }
      editor.focus();
    }

    function insertTable() {
      insertText('\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n');
    }

    function insertCodeBlock() {
      var sel = editor ? editor.getModel().getValueInRange(editor.getSelection()) : '';
      insertText('\n```\n' + (sel || 'code here') + '\n```\n');
    }

    function insertLink() { wrapSelection('[', '](url)'); }
    function insertImage() { insertText('![alt text](image-url)'); }
    function insertCheckbox() { insertText('\n- [ ] '); }
    function insertHr() { insertText('\n---\n'); }
    function insertQuote() {
      if (!editor) return;
      var sel = editor.getSelection();
      var selected = editor.getModel().getValueInRange(sel);
      var quoted = (selected || 'quote').split('\n').map(function(l) { return '> ' + l; }).join('\n');
      editor.executeEdits('', [{ range: sel, text: quoted }]);
      editor.focus();
    }
    function insertList() { insertText('\n- Item 1\n- Item 2\n- Item 3\n'); }
    function insertOrderedList() { insertText('\n1. Item 1\n2. Item 2\n3. Item 3\n'); }

    /* ── File ops ── */
    var MD_FILTERS = [
      { label: 'Markdown', extensions: ['.md', '.markdown', '.mdx'] },
      { label: 'Text', extensions: ['.txt'] },
      { label: 'All Files', extensions: ['*'] }
    ];

    async function openFile() {
      var result = await window.FileDialog.open({ title: '📂 ' + t('open'), filters: MD_FILTERS });
      if (!result) return;
      mdText.value = result.content || '';
      currentFilePath.value = result.path || '';
      currentFileName.value = result.name || '';
      if (editor) editor.setValue(mdText.value);
    }

    async function saveFile() {
      if (!editor) return;
      var content = editor.getValue();
      if (currentFilePath.value) {
        var r = await window.FileDialog.writeFile(currentFilePath.value, content);
        if (r) ElMessage.success(t('saved'));
      } else {
        await saveFileAs();
      }
    }

    async function saveFileAs() {
      if (!editor) return;
      var content = editor.getValue();
      var result = await window.FileDialog.save({ title: '💾 ' + t('saveAs'), defaultName: currentFileName.value || t('untitled'), filters: MD_FILTERS });
      if (!result) return;
      var r = await window.FileDialog.writeFile(result.path, content);
      if (r) {
        currentFilePath.value = result.path;
        currentFileName.value = result.name;
        ElMessage.success(t('saved'));
      }
    }

    function newFile() {
      mdText.value = '# ' + t('untitled').replace('.md', '') + '\n\n';
      currentFilePath.value = '';
      currentFileName.value = '';
      if (editor) editor.setValue(mdText.value);
    }

    /* ── Export ── */
    function exportHtml() {
      var html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1.0">\n<title>' + (currentFileName.value || 'Markdown') + '</title>\n<style>\nbody{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;max-width:800px;margin:0 auto;padding:40px 20px;color:#333;line-height:1.6}\npre{background:#f4f4f4;padding:16px;border-radius:6px;overflow-x:auto}\ncode{background:#f4f4f4;padding:2px 6px;border-radius:3px;font-size:0.9em}\ntable{border-collapse:collapse;width:100%}\nth,td{border:1px solid #ddd;padding:8px 12px;text-align:left}\nth{background:#f4f4f4}\nblockquote{border-left:4px solid #ddd;margin:0;padding:0 16px;color:#666}\nimg{max-width:100%}\n</style>\n</head>\n<body>\n' + htmlPreview.value + '\n</body>\n</html>';
      var blob = new Blob([html], { type: 'text/html' });
      var link = document.createElement('a');
      link.download = (currentFileName.value || 'document').replace(/\.md$/i, '') + '.html';
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    }

    function printPreview() {
      var win = window.open('', '_blank');
      win.document.write('<!DOCTYPE html><html><head><title>Print</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;max-width:800px;margin:0 auto;padding:20px;color:#333;line-height:1.6}pre{background:#f4f4f4;padding:16px;border-radius:6px;overflow-x:auto}code{background:#f4f4f4;padding:2px 6px;border-radius:3px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px 12px}th{background:#f4f4f4}blockquote{border-left:4px solid #ddd;margin:0;padding:0 16px;color:#666}img{max-width:100%}</style></head><body>' + htmlPreview.value + '</body></html>');
      win.document.close();
      win.print();
    }

    function exportPdf() {
      var savedDefine = window.define;
      window.define = undefined;
      var loadScript = function(url) {
        return new Promise(function(resolve, reject) {
          if (url.includes('html2canvas') && window.html2canvas) { resolve(); return; }
          if (url.includes('jspdf') && window.jspdf) { resolve(); return; }
          var s = document.createElement('script'); s.src = url;
          s.onload = resolve; s.onerror = reject;
          document.head.appendChild(s);
        });
      };
      var cssText = 'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;max-width:700px;margin:0 auto;padding:30px 20px;color:#333;line-height:1.6;font-size:13px}h1{font-size:22px}h2{font-size:18px}h3{font-size:15px}pre{background:#f4f4f4;padding:12px;border-radius:6px;overflow-x:auto;font-size:12px}code{background:#f4f4f4;padding:2px 5px;border-radius:3px;font-size:12px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:6px 10px;font-size:12px}th{background:#f4f4f4}blockquote{border-left:4px solid #ddd;margin:0;padding:0 14px;color:#666}img{max-width:100%}';
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
        .then(function() { return loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js'); })
        .then(function() {
          window.define = savedDefine;
          var container = document.createElement('div');
          container.style.cssText = 'position:fixed;left:-9999px;top:0;width:700px;background:#fff;padding:20px;z-index:-1';
          container.innerHTML = '<style>' + cssText + '</style>' + htmlPreview.value;
          document.body.appendChild(container);
          window.html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff' }).then(function(canvas) {
            document.body.removeChild(container);
            var imgData = canvas.toDataURL('image/png');
            var pdf = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            var pageW = pdf.internal.pageSize.getWidth();
            var pageH = pdf.internal.pageSize.getHeight();
            var margin = 10;
            var contentW = pageW - margin * 2;
            var contentH = (canvas.height * contentW) / canvas.width;
            var yOff = margin;
            while (yOff < contentH + margin) {
              if (yOff > margin) pdf.addPage();
              pdf.addImage(imgData, 'PNG', margin, margin - (yOff - margin), contentW, contentH);
              yOff += pageH - margin * 2;
            }
            pdf.save((currentFileName.value || 'document').replace(/\.md$/i, '') + '.pdf');
          });
        }).catch(function() { window.define = savedDefine; });
    }

    /* ── Settings watchers ── */
    watch(wordWrap, function(v) { if (editor) editor.updateOptions({ wordWrap: v ? 'on' : 'off' }); });
    watch(fontSize, function(v) { if (editor) editor.updateOptions({ fontSize: v }); });

    /* ── Sync scroll ── */
    function syncScroll() {
      if (!editor || !previewEl.value || viewMode.value !== 'split') return;
      var eTop = editor.getScrollTop();
      var eHeight = editor.getScrollHeight() - editor.getLayoutInfo().height;
      if (eHeight <= 0) return;
      var ratio = eTop / eHeight;
      var pEl = previewEl.value;
      pEl.scrollTop = ratio * (pEl.scrollHeight - pEl.clientHeight);
    }

    /* ── Lifecycle ── */
    onMounted(function() {
      window.addEventListener('locale-changed', onLocaleChanged);
      loadMarked().then(function() {
        nextTick(initMonaco);
      });
      /* Listen for external open-markdown event */
      window.addEventListener('open-markdown-file', onExternalOpen);
      if (window.__markdownFileToOpen) {
        mdText.value = window.__markdownFileToOpen.content || '';
        currentFilePath.value = window.__markdownFileToOpen.path || '';
        currentFileName.value = window.__markdownFileToOpen.name || '';
        window.__markdownFileToOpen = null;
      }
    });

    function onExternalOpen(e) {
      var detail = e.detail || {};
      if (detail.content != null) {
        mdText.value = detail.content;
        currentFilePath.value = detail.path || '';
        currentFileName.value = detail.name || '';
        if (editor) editor.setValue(mdText.value);
      }
    }

    onUnmounted(function() {
      window.removeEventListener('locale-changed', onLocaleChanged);
if (editor) { editor.dispose(); editor = null; }
      window.removeEventListener('open-markdown-file', onExternalOpen);
    });

    return {
      t, mdText, viewMode, wordWrap, fontSize,
      currentFilePath, currentFileName,
      editorEl, previewEl, htmlPreview, stats, toc,
      markedLoaded,
      openFile, saveFile, saveFileAs, newFile,
      exportHtml, printPreview, exportPdf,
      insertHeading, wrapSelection, insertTable, insertCodeBlock,
      insertLink, insertImage, insertCheckbox, insertHr,
      insertQuote, insertList, insertOrderedList,
      goToHeading, syncScroll
    };
  }
})
