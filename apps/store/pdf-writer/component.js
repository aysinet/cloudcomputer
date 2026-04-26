(function(Vue) {
  const { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } = Vue;
  const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success(){}, error(){}, warning(){} };

  const LANGS = {
    tr: {
      title:'PDF Oluşturucu', newDoc:'Yeni Belge', save:'Sunucuya Kaydet', download:'İndir',
      addPage:'Sayfa Ekle', deletePage:'Sayfayı Sil', pageOf:'/',
      bold:'Kalın', italic:'İtalik', underline:'Altı Çizili', strikethrough:'Üstü Çizili',
      alignLeft:'Sola', alignCenter:'Ortala', alignRight:'Sağa', alignJustify:'İki Yana',
      fontSize:'Yazı Boyutu', fontFamily:'Yazı Tipi', textColor:'Renk',
      insertImage:'Resim Ekle', insertLine:'Çizgi Ekle', insertTable:'Tablo Ekle',
      heading1:'Başlık 1', heading2:'Başlık 2', heading3:'Başlık 3', paragraph:'Paragraf',
      fileName:'Dosya Adı', unnamed:'isimsiz',
      saving:'Kaydediliyor...', saved:'PDF sunucuya kaydedildi', saveFail:'Kaydetme hatası',
      generating:'PDF oluşturuluyor...', downloadReady:'PDF hazır',
      pageSize:'Sayfa Boyutu', orientation:'Yönlendirme', portrait:'Dikey', landscape:'Yatay',
      margins:'Kenar Boşlukları', header:'Üst Bilgi', footer:'Alt Bilgi',
      loading:'jsPDF yükleniyor...', loadFail:'jsPDF yüklenemedi',
      undo:'Geri Al', redo:'Yinele', bulletList:'Madde İşareti', numberedList:'Numaralı Liste',
      columns:'Sütun', rows:'Satır', insertTablePrompt:'Tablo boyutunu seçin',
      ok:'Tamam', cancel:'İptal', page:'Sayfa', zoom:'Yakınlaştır',
      headerPlaceholder:'Üst bilgi metni...', footerPlaceholder:'Alt bilgi metni...',
      margin:'Kenar', top:'Üst', bottom:'Alt', left:'Sol', right:'Sağ',
      preview:'Önizleme', edit:'Düzenle'
    },
    en: {
      title:'PDF Writer', newDoc:'New Document', save:'Save to Server', download:'Download',
      addPage:'Add Page', deletePage:'Delete Page', pageOf:'/',
      bold:'Bold', italic:'Italic', underline:'Underline', strikethrough:'Strikethrough',
      alignLeft:'Left', alignCenter:'Center', alignRight:'Right', alignJustify:'Justify',
      fontSize:'Font Size', fontFamily:'Font', textColor:'Color',
      insertImage:'Insert Image', insertLine:'Insert Line', insertTable:'Insert Table',
      heading1:'Heading 1', heading2:'Heading 2', heading3:'Heading 3', paragraph:'Paragraph',
      fileName:'File Name', unnamed:'untitled',
      saving:'Saving...', saved:'PDF saved to server', saveFail:'Save failed',
      generating:'Generating PDF...', downloadReady:'PDF ready',
      pageSize:'Page Size', orientation:'Orientation', portrait:'Portrait', landscape:'Landscape',
      margins:'Margins', header:'Header', footer:'Footer',
      loading:'Loading jsPDF...', loadFail:'Failed to load jsPDF',
      undo:'Undo', redo:'Redo', bulletList:'Bullet List', numberedList:'Numbered List',
      columns:'Columns', rows:'Rows', insertTablePrompt:'Choose table size',
      ok:'OK', cancel:'Cancel', page:'Page', zoom:'Zoom',
      headerPlaceholder:'Header text...', footerPlaceholder:'Footer text...',
      margin:'Margin', top:'Top', bottom:'Bottom', left:'Left', right:'Right',
      preview:'Preview', edit:'Edit'
    },
    de: {
      title:'PDF-Ersteller', newDoc:'Neues Dokument', save:'Auf Server speichern', download:'Herunterladen',
      addPage:'Seite hinzufügen', deletePage:'Seite löschen', pageOf:'/',
      bold:'Fett', italic:'Kursiv', underline:'Unterstrichen', strikethrough:'Durchgestrichen',
      alignLeft:'Links', alignCenter:'Zentriert', alignRight:'Rechts', alignJustify:'Blocksatz',
      fontSize:'Schriftgröße', fontFamily:'Schriftart', textColor:'Farbe',
      insertImage:'Bild einfügen', insertLine:'Linie einfügen', insertTable:'Tabelle einfügen',
      heading1:'Überschrift 1', heading2:'Überschrift 2', heading3:'Überschrift 3', paragraph:'Absatz',
      fileName:'Dateiname', unnamed:'unbenannt',
      saving:'Wird gespeichert...', saved:'PDF auf Server gespeichert', saveFail:'Speicherfehler',
      generating:'PDF wird erstellt...', downloadReady:'PDF bereit',
      pageSize:'Seitengröße', orientation:'Ausrichtung', portrait:'Hochformat', landscape:'Querformat',
      margins:'Ränder', header:'Kopfzeile', footer:'Fußzeile',
      loading:'jsPDF wird geladen...', loadFail:'jsPDF konnte nicht geladen werden',
      undo:'Rückgängig', redo:'Wiederholen', bulletList:'Aufzählung', numberedList:'Nummerierung',
      columns:'Spalten', rows:'Zeilen', insertTablePrompt:'Tabellengröße wählen',
      ok:'OK', cancel:'Abbrechen', page:'Seite', zoom:'Zoom',
      headerPlaceholder:'Kopfzeilentext...', footerPlaceholder:'Fußzeilentext...',
      margin:'Rand', top:'Oben', bottom:'Unten', left:'Links', right:'Rechts',
      preview:'Vorschau', edit:'Bearbeiten'
    },
    fr: {
      title:'Créateur PDF', newDoc:'Nouveau document', save:'Enregistrer sur serveur', download:'Télécharger',
      addPage:'Ajouter page', deletePage:'Supprimer page', pageOf:'/',
      bold:'Gras', italic:'Italique', underline:'Souligné', strikethrough:'Barré',
      alignLeft:'Gauche', alignCenter:'Centre', alignRight:'Droite', alignJustify:'Justifié',
      fontSize:'Taille', fontFamily:'Police', textColor:'Couleur',
      insertImage:'Insérer image', insertLine:'Insérer ligne', insertTable:'Insérer tableau',
      heading1:'Titre 1', heading2:'Titre 2', heading3:'Titre 3', paragraph:'Paragraphe',
      fileName:'Nom du fichier', unnamed:'sans_nom',
      saving:'Enregistrement...', saved:'PDF enregistré sur le serveur', saveFail:'Erreur d\'enregistrement',
      generating:'Génération du PDF...', downloadReady:'PDF prêt',
      pageSize:'Taille de page', orientation:'Orientation', portrait:'Portrait', landscape:'Paysage',
      margins:'Marges', header:'En-tête', footer:'Pied de page',
      loading:'Chargement de jsPDF...', loadFail:'Impossible de charger jsPDF',
      undo:'Annuler', redo:'Rétablir', bulletList:'Liste à puces', numberedList:'Liste numérotée',
      columns:'Colonnes', rows:'Lignes', insertTablePrompt:'Choisir la taille du tableau',
      ok:'OK', cancel:'Annuler', page:'Page', zoom:'Zoom',
      headerPlaceholder:'Texte d\'en-tête...', footerPlaceholder:'Texte de pied de page...',
      margin:'Marge', top:'Haut', bottom:'Bas', left:'Gauche', right:'Droite',
      preview:'Aperçu', edit:'Modifier'
    },
    es: {
      title:'Creador de PDF', newDoc:'Nuevo documento', save:'Guardar en servidor', download:'Descargar',
      addPage:'Agregar página', deletePage:'Eliminar página', pageOf:'/',
      bold:'Negrita', italic:'Cursiva', underline:'Subrayado', strikethrough:'Tachado',
      alignLeft:'Izquierda', alignCenter:'Centro', alignRight:'Derecha', alignJustify:'Justificado',
      fontSize:'Tamaño', fontFamily:'Fuente', textColor:'Color',
      insertImage:'Insertar imagen', insertLine:'Insertar línea', insertTable:'Insertar tabla',
      heading1:'Título 1', heading2:'Título 2', heading3:'Título 3', paragraph:'Párrafo',
      fileName:'Nombre del archivo', unnamed:'sin_nombre',
      saving:'Guardando...', saved:'PDF guardado en el servidor', saveFail:'Error al guardar',
      generating:'Generando PDF...', downloadReady:'PDF listo',
      pageSize:'Tamaño de página', orientation:'Orientación', portrait:'Vertical', landscape:'Horizontal',
      margins:'Márgenes', header:'Encabezado', footer:'Pie de página',
      loading:'Cargando jsPDF...', loadFail:'No se pudo cargar jsPDF',
      undo:'Deshacer', redo:'Rehacer', bulletList:'Lista con viñetas', numberedList:'Lista numerada',
      columns:'Columnas', rows:'Filas', insertTablePrompt:'Elegir tamaño de tabla',
      ok:'Aceptar', cancel:'Cancelar', page:'Página', zoom:'Zoom',
      headerPlaceholder:'Texto de encabezado...', footerPlaceholder:'Texto de pie de página...',
      margin:'Margen', top:'Arriba', bottom:'Abajo', left:'Izquierda', right:'Derecha',
      preview:'Vista previa', edit:'Editar'
    },
    ru: {
      title:'Создатель PDF', newDoc:'Новый документ', save:'Сохранить на сервер', download:'Скачать',
      addPage:'Добавить страницу', deletePage:'Удалить страницу', pageOf:'/',
      bold:'Жирный', italic:'Курсив', underline:'Подчёркнутый', strikethrough:'Зачёркнутый',
      alignLeft:'По левому', alignCenter:'По центру', alignRight:'По правому', alignJustify:'По ширине',
      fontSize:'Размер шрифта', fontFamily:'Шрифт', textColor:'Цвет',
      insertImage:'Вставить изображение', insertLine:'Вставить линию', insertTable:'Вставить таблицу',
      heading1:'Заголовок 1', heading2:'Заголовок 2', heading3:'Заголовок 3', paragraph:'Абзац',
      fileName:'Имя файла', unnamed:'без_имени',
      saving:'Сохранение...', saved:'PDF сохранён на сервере', saveFail:'Ошибка сохранения',
      generating:'Создание PDF...', downloadReady:'PDF готов',
      pageSize:'Размер страницы', orientation:'Ориентация', portrait:'Портрет', landscape:'Альбом',
      margins:'Поля', header:'Верхний колонтитул', footer:'Нижний колонтитул',
      loading:'Загрузка jsPDF...', loadFail:'Не удалось загрузить jsPDF',
      undo:'Отмена', redo:'Повтор', bulletList:'Маркированный список', numberedList:'Нумерованный список',
      columns:'Столбцы', rows:'Строки', insertTablePrompt:'Выберите размер таблицы',
      ok:'ОК', cancel:'Отмена', page:'Страница', zoom:'Масштаб',
      headerPlaceholder:'Текст верхнего колонтитулыа...', footerPlaceholder:'Текст нижнего колонтитула...',
      margin:'Поле', top:'Верх', bottom:'Низ', left:'Лево', right:'Право',
      preview:'Предпросмотр', edit:'Редактировать'
    },
    zh: { title:'PDF编辑器', newDoc:'新文档', save:'保存', download:'下载', addPage:'添加页', deletePage:'删除页', pageOf:'/', bold:'粗体', italic:'斜体', underline:'下划线', strikethrough:'删除线', alignLeft:'左对齐', alignCenter:'居中', alignRight:'右对齐', alignJustify:'两端对齐', fontSize:'字体大小', fontFamily:'字体', textColor:'文字颜色', insertImage:'插入图片', insertLine:'插入线条', insertTable:'插入表格', heading1:'标题1', heading2:'标题2', heading3:'标题3', paragraph:'段落', fileName:'文件名', unnamed:'未命名', saving:'保存中', saved:'已保存', saveFail:'保存失败', generating:'生成中', downloadReady:'下载就绪', pageSize:'页面大小', orientation:'方向', portrait:'纵向', landscape:'横向', margins:'边距', header:'页眉', footer:'页脚', loading:'加载中', loadFail:'加载失败', undo:'撤销', redo:'重做', bulletList:'项目符号列表', numberedList:'编号列表', columns:'列', rows:'行', insertTablePrompt:'插入表格', ok:'确定', cancel:'取消', page:'页', zoom:'缩放', headerPlaceholder:'输入页眉...', footerPlaceholder:'输入页脚...', margin:'边距', top:'上', bottom:'下', left:'左', right:'右', preview:'预览', edit:'编辑' },
    ja: { title:'PDFエディタ', newDoc:'新規文書', save:'保存', download:'ダウンロード', addPage:'ページ追加', deletePage:'ページ削除', pageOf:'/', bold:'太字', italic:'斜体', underline:'下線', strikethrough:'取消線', alignLeft:'左揃え', alignCenter:'中央揃え', alignRight:'右揃え', alignJustify:'両端揃え', fontSize:'文字サイズ', fontFamily:'フォント', textColor:'文字色', insertImage:'画像挿入', insertLine:'線挿入', insertTable:'表挿入', heading1:'見出し1', heading2:'見出し2', heading3:'見出し3', paragraph:'段落', fileName:'ファイル名', unnamed:'無題', saving:'保存中', saved:'保存済', saveFail:'保存失敗', generating:'生成中', downloadReady:'ダウンロード準備完了', pageSize:'用紙サイズ', orientation:'向き', portrait:'縦', landscape:'横', margins:'余白', header:'ヘッダー', footer:'フッター', loading:'読込中', loadFail:'読込失敗', undo:'元に戻す', redo:'やり直し', bulletList:'箇条書き', numberedList:'番号リスト', columns:'列', rows:'行', insertTablePrompt:'表を挿入', ok:'OK', cancel:'キャンセル', page:'ページ', zoom:'ズーム', headerPlaceholder:'ヘッダーを入力...', footerPlaceholder:'フッターを入力...', margin:'余白', top:'上', bottom:'下', left:'左', right:'右', preview:'プレビュー', edit:'編集' },
    it: { title:'Editor PDF', newDoc:'Nuovo documento', save:'Salva', download:'Scarica', addPage:'Aggiungi pagina', deletePage:'Elimina pagina', pageOf:'di', bold:'Grassetto', italic:'Corsivo', underline:'Sottolineato', strikethrough:'Barrato', alignLeft:'Allinea a sinistra', alignCenter:'Centra', alignRight:'Allinea a destra', alignJustify:'Giustifica', fontSize:'Dimensione testo', fontFamily:'Carattere', textColor:'Colore testo', insertImage:'Inserisci immagine', insertLine:'Inserisci linea', insertTable:'Inserisci tabella', heading1:'Titolo 1', heading2:'Titolo 2', heading3:'Titolo 3', paragraph:'Paragrafo', fileName:'Nome file', unnamed:'Senza nome', saving:'Salvataggio', saved:'Salvato', saveFail:'Salvataggio fallito', generating:'Generazione', downloadReady:'Download pronto', pageSize:'Formato pagina', orientation:'Orientamento', portrait:'Verticale', landscape:'Orizzontale', margins:'Margini', header:'Intestazione', footer:'Piè di pagina', loading:'Caricamento', loadFail:'Caricamento fallito', undo:'Annulla', redo:'Ripristina', bulletList:'Elenco puntato', numberedList:'Elenco numerato', columns:'Colonne', rows:'Righe', insertTablePrompt:'Inserisci tabella', ok:'OK', cancel:'Annulla', page:'Pagina', zoom:'Zoom', headerPlaceholder:'Inserisci intestazione...', footerPlaceholder:'Inserisci piè di pagina...', margin:'Margine', top:'Alto', bottom:'Basso', left:'Sinistra', right:'Destra', preview:'Anteprima', edit:'Modifica' }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  /* ── Page sizes in mm ── */
  var PAGE_SIZES = {
    a4: { w: 210, h: 297, label: 'A4' },
    a3: { w: 297, h: 420, label: 'A3' },
    letter: { w: 215.9, h: 279.4, label: 'Letter' },
    legal: { w: 215.9, h: 355.6, label: 'Legal' }
  };

  return {
    setup() {
      var locale = ref(getLocale());
      function t(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

      /* ── jsPDF loading ── */
      var jspdfReady = ref(false);
      var jspdfError = ref('');

      function loadJsPDF() {
        return new Promise(function(resolve, reject) {
          if (window.jspdf) { jspdfReady.value = true; resolve(); return; }
          // Bypass AMD/require define from Monaco
          var _define = window.define;
          window.define = undefined;
          var script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js';
          script.onload = function() {
            window.define = _define;
            if (window.jspdf) { jspdfReady.value = true; resolve(); }
            else { jspdfError.value = 'jsPDF not available'; reject(); }
          };
          script.onerror = function() {
            window.define = _define;
            jspdfError.value = 'Failed to load jsPDF';
            reject();
          };
          document.head.appendChild(script);
        });
      }

      /* ── State ── */
      var fileName = ref('');
      var pages = ref([{ id: 1, content: '' }]);
      var currentPage = ref(0);
      var nextPageId = 2;
      var pageSize = ref('a4');
      var orientation = ref('portrait');
      var headerText = ref('');
      var footerText = ref('');
      var margins = reactive({ top: 20, bottom: 20, left: 15, right: 15 });
      var isSaving = ref(false);
      var editorRefs = ref([]);
      var showSettings = ref(false);
      var mode = ref('edit'); // edit | preview
      var previewUrl = ref('');
      var fileInput = ref(null);

      /* ── Editor commands ── */
      function execCmd(cmd, val) {
        document.execCommand(cmd, false, val || null);
        syncContent();
      }

      function syncContent() {
        var el = getCurrentEditor();
        if (el) {
          pages.value[currentPage.value].content = el.innerHTML;
        }
      }

      function getCurrentEditor() {
        var editors = document.querySelectorAll('.pw-editor-page');
        return editors[currentPage.value] || null;
      }

      function setBlockType(tag) {
        document.execCommand('formatBlock', false, tag);
        syncContent();
      }

      /* ── Font settings ── */
      var currentFontSize = ref(14);
      var currentFontFamily = ref('serif');
      var currentTextColor = ref('#000000');

      var fontFamilies = [
        { id: 'serif', label: 'Serif (Times)' },
        { id: 'sans-serif', label: 'Sans-serif (Arial)' },
        { id: 'monospace', label: 'Monospace (Courier)' },
        { id: 'Georgia, serif', label: 'Georgia' },
        { id: 'Verdana, sans-serif', label: 'Verdana' }
      ];

      var fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];

      function changeFontSize(size) {
        currentFontSize.value = size;
        // execCommand fontSize only supports 1-7
        document.execCommand('fontSize', false, '3');
        // Replace font size with actual pixel value
        var sel = window.getSelection();
        if (sel.rangeCount) {
          var container = sel.getRangeAt(0).commonAncestorContainer;
          var el = container.nodeType === 3 ? container.parentNode : container;
          var fonts = (el.closest ? el.closest('.pw-editor-page') : el).querySelectorAll('font[size="3"]');
          fonts.forEach(function(f) {
            f.removeAttribute('size');
            f.style.fontSize = size + 'px';
          });
        }
        syncContent();
      }

      function changeFontFamily(family) {
        currentFontFamily.value = family;
        document.execCommand('fontName', false, family);
        syncContent();
      }

      function changeTextColor(color) {
        currentTextColor.value = color;
        document.execCommand('foreColor', false, color);
        syncContent();
      }

      /* ── Insert image ── */
      function triggerImageInsert() {
        if (fileInput.value) fileInput.value.click();
      }

      function onImageSelected(e) {
        var files = e.target.files;
        if (!files || !files.length) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          var img = '<img src="' + ev.target.result + '" style="max-width:100%;height:auto;margin:8px 0;" />';
          document.execCommand('insertHTML', false, img);
          syncContent();
        };
        reader.readAsDataURL(files[0]);
        e.target.value = '';
      }

      function insertHR() {
        document.execCommand('insertHTML', false, '<hr style="border:1px solid #ccc;margin:12px 0;" />');
        syncContent();
      }

      /* ── Lists ── */
      function insertBulletList() { execCmd('insertUnorderedList'); }
      function insertNumberedList() { execCmd('insertOrderedList'); }

      /* ── Table ── */
      var showTableDialog = ref(false);
      var tableRows = ref(3);
      var tableCols = ref(3);

      function insertTable() {
        var r = tableRows.value, c = tableCols.value;
        var html = '<table style="width:100%;border-collapse:collapse;margin:8px 0;">';
        for (var i = 0; i < r; i++) {
          html += '<tr>';
          for (var j = 0; j < c; j++) {
            html += '<td style="border:1px solid #999;padding:6px;min-width:40px;">&nbsp;</td>';
          }
          html += '</tr>';
        }
        html += '</table><p></p>';
        document.execCommand('insertHTML', false, html);
        showTableDialog.value = false;
        syncContent();
      }

      /* ── Page management ── */
      function addPage() {
        pages.value.push({ id: nextPageId++, content: '' });
        currentPage.value = pages.value.length - 1;
      }

      function deletePage() {
        if (pages.value.length <= 1) return;
        pages.value.splice(currentPage.value, 1);
        if (currentPage.value >= pages.value.length) currentPage.value = pages.value.length - 1;
      }

      function goToPage(idx) {
        syncContent();
        currentPage.value = idx;
      }

      /* ── New document ── */
      function newDocument() {
        fileName.value = '';
        pages.value = [{ id: 1, content: '' }];
        currentPage.value = 0;
        nextPageId = 2;
        headerText.value = '';
        footerText.value = '';
        if (previewUrl.value) { URL.revokeObjectURL(previewUrl.value); previewUrl.value = ''; }
        mode.value = 'edit';
      }

      /* ── Build PDF ── */
      function buildPDF() {
        if (!window.jspdf) return null;
        var jsPDF = window.jspdf.jsPDF;
        var ps = PAGE_SIZES[pageSize.value] || PAGE_SIZES.a4;
        var isLandscape = orientation.value === 'landscape';
        var doc = new jsPDF({
          orientation: isLandscape ? 'landscape' : 'portrait',
          unit: 'mm',
          format: [ps.w, ps.h]
        });

        var pw = isLandscape ? ps.h : ps.w;
        var ph = isLandscape ? ps.w : ps.h;
        var ml = margins.left, mr = margins.right, mt = margins.top, mb = margins.bottom;
        var contentW = pw - ml - mr;
        var LINE_HEIGHT = 6;
        var FONT_SIZE_MAP = { 8:7, 9:8, 10:9, 11:10, 12:11, 14:12, 16:14, 18:16, 20:18, 24:20, 28:22, 32:24, 36:26, 48:30, 72:40 };

        for (var p = 0; p < pages.value.length; p++) {
          if (p > 0) doc.addPage([ps.w, ps.h], isLandscape ? 'landscape' : 'portrait');

          // Header
          if (headerText.value) {
            doc.setFontSize(9);
            doc.setTextColor(120);
            doc.text(headerText.value, pw / 2, 10, { align: 'center' });
          }

          // Footer
          if (footerText.value || true) {
            doc.setFontSize(9);
            doc.setTextColor(120);
            var fText = (footerText.value || '') + (footerText.value ? ' — ' : '') + t('page') + ' ' + (p + 1) + '/' + pages.value.length;
            doc.text(fText, pw / 2, ph - 8, { align: 'center' });
          }

          // Parse HTML content into text blocks
          var content = pages.value[p].content || '';
          var parser = new DOMParser();
          var parsed = parser.parseFromString('<div>' + content + '</div>', 'text/html');
          var body = parsed.body.firstChild;
          var y = mt;

          function processNode(node) {
            if (y > ph - mb - 10) return;
            if (node.nodeType === 3) {
              // Text node
              var text = node.textContent;
              if (!text.trim()) return;
              doc.setFontSize(12);
              doc.setTextColor(0);
              doc.setFont('helvetica', 'normal');
              var lines = doc.splitTextToSize(text, contentW);
              lines.forEach(function(line) {
                if (y > ph - mb - 10) return;
                doc.text(line, ml, y);
                y += LINE_HEIGHT;
              });
              return;
            }
            if (node.nodeType !== 1) return;

            var tag = node.tagName.toLowerCase();
            var style = node.getAttribute('style') || '';
            var fontSizeMatch = style.match(/font-size:\s*(\d+)px/);
            var colorMatch = style.match(/color:\s*(#[0-9a-fA-F]{6})/);
            var textAlignMatch = style.match(/text-align:\s*(\w+)/);

            // Set font properties
            var pdfSize = 12;
            if (tag === 'h1') pdfSize = 22;
            else if (tag === 'h2') pdfSize = 18;
            else if (tag === 'h3') pdfSize = 15;
            else if (fontSizeMatch) {
              var px = parseInt(fontSizeMatch[1]);
              pdfSize = FONT_SIZE_MAP[px] || Math.round(px * 0.75);
            }

            var isBold = tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'b' || tag === 'strong' || style.includes('font-weight: bold') || style.includes('font-weight:bold');
            var isItalic = tag === 'i' || tag === 'em' || style.includes('font-style: italic') || style.includes('font-style:italic');

            var fontStyle = 'normal';
            if (isBold && isItalic) fontStyle = 'bolditalic';
            else if (isBold) fontStyle = 'bold';
            else if (isItalic) fontStyle = 'italic';

            doc.setFontSize(pdfSize);
            doc.setFont('helvetica', fontStyle);

            if (colorMatch) {
              var hex = colorMatch[1];
              var r = parseInt(hex.slice(1, 3), 16);
              var g = parseInt(hex.slice(3, 5), 16);
              var b = parseInt(hex.slice(5, 7), 16);
              doc.setTextColor(r, g, b);
            } else {
              doc.setTextColor(0);
            }

            var align = 'left';
            if (textAlignMatch) align = textAlignMatch[1];

            var alignX = ml;
            var alignOpt = { align: 'left' };
            if (align === 'center') { alignX = pw / 2; alignOpt = { align: 'center' }; }
            else if (align === 'right') { alignX = pw - mr; alignOpt = { align: 'right' }; }
            else if (align === 'justify') { alignX = ml; alignOpt = { align: 'justify', maxWidth: contentW }; }

            if (tag === 'br') { y += LINE_HEIGHT; return; }
            if (tag === 'hr') {
              doc.setDrawColor(180);
              doc.setLineWidth(0.5);
              doc.line(ml, y, pw - mr, y);
              y += LINE_HEIGHT;
              return;
            }

            if (tag === 'img') {
              try {
                var src = node.getAttribute('src');
                if (src && src.startsWith('data:image')) {
                  var imgW = Math.min(contentW, 120);
                  var imgH = imgW * 0.6;
                  if (y + imgH > ph - mb) return;
                  doc.addImage(src, 'JPEG', ml, y, imgW, imgH);
                  y += imgH + 4;
                }
              } catch(e) {}
              return;
            }

            if (tag === 'table') {
              // Simple table rendering
              var rows = node.querySelectorAll('tr');
              var rowH = 8;
              rows.forEach(function(row) {
                if (y > ph - mb - 10) return;
                var cells = row.querySelectorAll('td, th');
                var cellW = contentW / (cells.length || 1);
                var cx = ml;
                cells.forEach(function(cell) {
                  doc.setFontSize(10);
                  doc.setFont('helvetica', cell.tagName === 'TH' ? 'bold' : 'normal');
                  doc.setTextColor(0);
                  doc.rect(cx, y, cellW, rowH);
                  doc.text((cell.textContent || '').trim().substring(0, 50), cx + 2, y + 5);
                  cx += cellW;
                });
                y += rowH;
              });
              y += 4;
              return;
            }

            if (tag === 'ul' || tag === 'ol') {
              var items = node.querySelectorAll(':scope > li');
              items.forEach(function(li, idx) {
                if (y > ph - mb - 10) return;
                doc.setFontSize(pdfSize || 12);
                doc.setFont('helvetica', fontStyle);
                doc.setTextColor(0);
                var prefix = tag === 'ol' ? (idx + 1) + '. ' : '• ';
                var text = (li.textContent || '').trim();
                var lines = doc.splitTextToSize(prefix + text, contentW - 5);
                lines.forEach(function(line) {
                  if (y > ph - mb - 10) return;
                  doc.text(line, ml + 5, y);
                  y += LINE_HEIGHT;
                });
              });
              y += 2;
              return;
            }

            // Block elements add spacing
            if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
              if (tag.startsWith('h')) y += 3;

              var text = node.textContent || '';
              if (text.trim()) {
                var lines = doc.splitTextToSize(text.trim(), contentW);
                lines.forEach(function(line) {
                  if (y > ph - mb - 10) return;
                  doc.text(line, alignX, y, alignOpt);
                  y += LINE_HEIGHT * (pdfSize / 12);
                });
              }

              // Check for child images etc
              var childImgs = node.querySelectorAll('img');
              childImgs.forEach(function(img) { processNode(img); });

              if (tag.startsWith('h')) y += 2;
              else y += 2;
              return;
            }

            // Inline elements: process children
            if (node.childNodes.length) {
              node.childNodes.forEach(processNode);
            } else {
              var text = node.textContent || '';
              if (text.trim()) {
                var lines = doc.splitTextToSize(text.trim(), contentW);
                lines.forEach(function(line) {
                  if (y > ph - mb - 10) return;
                  doc.text(line, alignX, y, alignOpt);
                  y += LINE_HEIGHT;
                });
              }
            }
          }

          if (body && body.childNodes) {
            body.childNodes.forEach(processNode);
          }
        }

        return doc;
      }

      /* ── Preview ── */
      function togglePreview() {
        syncContent();
        if (mode.value === 'preview') {
          if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
          previewUrl.value = '';
          mode.value = 'edit';
          return;
        }
        var doc = buildPDF();
        if (!doc) { ElMessage.error(t('loadFail')); return; }
        var blob = doc.output('blob');
        previewUrl.value = URL.createObjectURL(blob);
        mode.value = 'preview';
      }

      /* ── Download ── */
      function downloadPDF() {
        syncContent();
        var doc = buildPDF();
        if (!doc) { ElMessage.error(t('loadFail')); return; }
        doc.save((fileName.value || t('unnamed')) + '.pdf');
        ElMessage.success(t('downloadReady'));
      }

      /* ── Save to server ── */
      function getToken() { return localStorage.getItem('auth_token'); }

      async function savePDF() {
        syncContent();
        var doc = buildPDF();
        if (!doc) { ElMessage.error(t('loadFail')); return; }

        isSaving.value = true;
        try {
          var base64 = doc.output('datauristring').split(',')[1];
          var name = (fileName.value || t('unnamed')).replace(/[^a-zA-Z0-9_\-. ]/g, '_');
          var res = await fetch('/api/fs/write-binary', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + getToken()
            },
            body: JSON.stringify({
              filePath: '/documents/' + name + '.pdf',
              content: base64
            })
          });
          if (res.ok) {
            ElMessage.success(t('saved'));
          } else {
            var data = await res.json().catch(function() { return {}; });
            ElMessage.error(data.error || t('saveFail'));
          }
        } catch (e) {
          ElMessage.error(t('saveFail') + ': ' + e.message);
        }
        isSaving.value = false;
      }

      /* ── Lifecycle ── */
      onMounted(function() {
        loadJsPDF();
        window.addEventListener('locale-changed', onLocaleChanged);
      });

      onUnmounted(function() {
        window.removeEventListener('locale-changed', onLocaleChanged)if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
      });

      return {
        t, jspdfReady, jspdfError,
        fileName, pages, currentPage, pageSize, orientation,
        headerText, footerText, margins, isSaving, showSettings,
        mode, previewUrl, fileInput,
        currentFontSize, currentFontFamily, currentTextColor,
        fontFamilies, fontSizes,
        showTableDialog, tableRows, tableCols,
        PAGE_SIZES: Object.keys(PAGE_SIZES).map(function(k) { return { id: k, label: PAGE_SIZES[k].label }; }),
        execCmd, setBlockType, changeFontSize, changeFontFamily, changeTextColor,
        triggerImageInsert, onImageSelected, insertHR,
        insertBulletList, insertNumberedList, insertTable,
        addPage, deletePage, goToPage, syncContent,
        newDocument, downloadPDF, savePDF, togglePreview
      };
    }
  };
})(Vue)
