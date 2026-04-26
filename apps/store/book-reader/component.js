({
  setup() {
    const { ref, computed, watch, onMounted, onUnmounted, nextTick } = Vue;
    const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success(){}, error(){}, warning(){}, info(){} };
    const ElMessageBox = (window.ElementPlus && window.ElementPlus.ElMessageBox) || { confirm: () => Promise.resolve() };

    /* ── i18n ── */
    const LANGS = {
      tr: {
        title:'Kitap Okuyucu', open:'Dosya Aç', upload:'Yükle', library:'Kütüphane',
        toc:'İçindekiler', bookmarks:'Yer İmleri', settings:'Ayarlar',
        addBookmark:'Yer İmi Ekle', removeBookmark:'Kaldır', goTo:'Git',
        fontSize:'Yazı Boyutu', theme:'Tema', light:'Açık', dark:'Koyu', sepia:'Sepya',
        lineHeight:'Satır Aralığı', fontFamily:'Yazı Tipi', margins:'Kenar Boşluğu',
        prevPage:'Önceki Sayfa', nextPage:'Sonraki Sayfa', page:'Sayfa', of:'/',
        noBook:'Henüz kitap açılmadı', dropHere:'veya sürükle bırak',
        supported:'Desteklenen formatlar', progress:'İlerleme',
        noToc:'İçindekiler tablosu bulunamadı', noBookmarks:'Henüz yer imi yok',
        deleteConfirm:'Bu yer imini silmek istediğinize emin misiniz?',
        yes:'Evet', cancel:'İptal', delete:'Sil', loading:'Yükleniyor...',
        loadError:'Dosya yüklenemedi', bookmarkAdded:'Yer imi eklendi',
        fullscreen:'Tam Ekran', exitFullscreen:'Tam Ekrandan Çık',
        openFromServer:'Sunucudan Aç', searchPlaceholder:'Ara...',
        zoomIn:'Yakınlaştır', zoomOut:'Uzaklaştır', fitWidth:'Genişliğe Sığdır',
        continuous:'Sürekli', paginated:'Sayfalı', viewMode:'Görünüm',
        saveProgress:'İlerleme kaydedildi', lastRead:'Son okunan',
        removeFromLib:'Kütüphaneden Kaldır', noLibBooks:'Kütüphane boş',
        bookmarkLabel:'Yer İmi Adı', bookmarkPlaceholder:'Yer imi açıklaması...'
      },
      en: {
        title:'Book Reader', open:'Open File', upload:'Upload', library:'Library',
        toc:'Contents', bookmarks:'Bookmarks', settings:'Settings',
        addBookmark:'Add Bookmark', removeBookmark:'Remove', goTo:'Go To',
        fontSize:'Font Size', theme:'Theme', light:'Light', dark:'Dark', sepia:'Sepia',
        lineHeight:'Line Height', fontFamily:'Font Family', margins:'Margins',
        prevPage:'Previous Page', nextPage:'Next Page', page:'Page', of:'/',
        noBook:'No book opened yet', dropHere:'or drag and drop',
        supported:'Supported formats', progress:'Progress',
        noToc:'No table of contents found', noBookmarks:'No bookmarks yet',
        deleteConfirm:'Are you sure you want to delete this bookmark?',
        yes:'Yes', cancel:'Cancel', delete:'Delete', loading:'Loading...',
        loadError:'Could not load file', bookmarkAdded:'Bookmark added',
        fullscreen:'Fullscreen', exitFullscreen:'Exit Fullscreen',
        openFromServer:'Open from Server', searchPlaceholder:'Search...',
        zoomIn:'Zoom In', zoomOut:'Zoom Out', fitWidth:'Fit Width',
        continuous:'Continuous', paginated:'Paginated', viewMode:'View Mode',
        saveProgress:'Progress saved', lastRead:'Last read',
        removeFromLib:'Remove from Library', noLibBooks:'Library is empty',
        bookmarkLabel:'Bookmark Label', bookmarkPlaceholder:'Bookmark description...'
      },
      de: {
        title:'Buchleser', open:'Datei öffnen', upload:'Hochladen', library:'Bibliothek',
        toc:'Inhaltsverzeichnis', bookmarks:'Lesezeichen', settings:'Einstellungen',
        addBookmark:'Lesezeichen hinzufügen', removeBookmark:'Entfernen', goTo:'Gehe zu',
        fontSize:'Schriftgröße', theme:'Thema', light:'Hell', dark:'Dunkel', sepia:'Sepia',
        lineHeight:'Zeilenabstand', fontFamily:'Schriftart', margins:'Ränder',
        prevPage:'Vorherige Seite', nextPage:'Nächste Seite', page:'Seite', of:'/',
        noBook:'Noch kein Buch geöffnet', dropHere:'oder per Drag & Drop',
        supported:'Unterstützte Formate', progress:'Fortschritt',
        noToc:'Kein Inhaltsverzeichnis gefunden', noBookmarks:'Noch keine Lesezeichen',
        deleteConfirm:'Möchten Sie dieses Lesezeichen wirklich löschen?',
        yes:'Ja', cancel:'Abbrechen', delete:'Löschen', loading:'Laden...',
        loadError:'Datei konnte nicht geladen werden', bookmarkAdded:'Lesezeichen hinzugefügt',
        fullscreen:'Vollbild', exitFullscreen:'Vollbild beenden',
        openFromServer:'Vom Server öffnen', searchPlaceholder:'Suchen...',
        zoomIn:'Vergrößern', zoomOut:'Verkleinern', fitWidth:'Breite anpassen',
        continuous:'Fortlaufend', paginated:'Seitenweise', viewMode:'Ansicht',
        saveProgress:'Fortschritt gespeichert', lastRead:'Zuletzt gelesen',
        removeFromLib:'Aus Bibliothek entfernen', noLibBooks:'Bibliothek ist leer',
        bookmarkLabel:'Lesezeichen-Name', bookmarkPlaceholder:'Lesezeichen-Beschreibung...'
      },
      fr: {
        title:'Lecteur de Livres', open:'Ouvrir un fichier', upload:'Télécharger', library:'Bibliothèque',
        toc:'Table des matières', bookmarks:'Signets', settings:'Paramètres',
        addBookmark:'Ajouter un signet', removeBookmark:'Supprimer', goTo:'Aller à',
        fontSize:'Taille de police', theme:'Thème', light:'Clair', dark:'Sombre', sepia:'Sépia',
        lineHeight:'Interligne', fontFamily:'Police', margins:'Marges',
        prevPage:'Page précédente', nextPage:'Page suivante', page:'Page', of:'/',
        noBook:'Aucun livre ouvert', dropHere:'ou glisser-déposer',
        supported:'Formats supportés', progress:'Progression',
        noToc:'Aucune table des matières trouvée', noBookmarks:'Aucun signet',
        deleteConfirm:'Êtes-vous sûr de vouloir supprimer ce signet ?',
        yes:'Oui', cancel:'Annuler', delete:'Supprimer', loading:'Chargement...',
        loadError:'Impossible de charger le fichier', bookmarkAdded:'Signet ajouté',
        fullscreen:'Plein écran', exitFullscreen:'Quitter le plein écran',
        openFromServer:'Ouvrir depuis le serveur', searchPlaceholder:'Rechercher...',
        zoomIn:'Agrandir', zoomOut:'Réduire', fitWidth:'Ajuster à la largeur',
        continuous:'Continu', paginated:'Paginé', viewMode:'Mode d\'affichage',
        saveProgress:'Progression sauvegardée', lastRead:'Dernière lecture',
        removeFromLib:'Retirer de la bibliothèque', noLibBooks:'Bibliothèque vide',
        bookmarkLabel:'Nom du signet', bookmarkPlaceholder:'Description du signet...'
      },
      es: {
        title:'Lector de Libros', open:'Abrir archivo', upload:'Subir', library:'Biblioteca',
        toc:'Índice', bookmarks:'Marcadores', settings:'Ajustes',
        addBookmark:'Añadir marcador', removeBookmark:'Eliminar', goTo:'Ir a',
        fontSize:'Tamaño de fuente', theme:'Tema', light:'Claro', dark:'Oscuro', sepia:'Sepia',
        lineHeight:'Interlineado', fontFamily:'Fuente', margins:'Márgenes',
        prevPage:'Página anterior', nextPage:'Página siguiente', page:'Página', of:'/',
        noBook:'Ningún libro abierto', dropHere:'o arrastrar y soltar',
        supported:'Formatos soportados', progress:'Progreso',
        noToc:'No se encontró índice', noBookmarks:'Aún no hay marcadores',
        deleteConfirm:'¿Estás seguro de que quieres eliminar este marcador?',
        yes:'Sí', cancel:'Cancelar', delete:'Eliminar', loading:'Cargando...',
        loadError:'No se pudo cargar el archivo', bookmarkAdded:'Marcador añadido',
        fullscreen:'Pantalla completa', exitFullscreen:'Salir de pantalla completa',
        openFromServer:'Abrir desde el servidor', searchPlaceholder:'Buscar...',
        zoomIn:'Acercar', zoomOut:'Alejar', fitWidth:'Ajustar al ancho',
        continuous:'Continuo', paginated:'Paginado', viewMode:'Vista',
        saveProgress:'Progreso guardado', lastRead:'Última lectura',
        removeFromLib:'Eliminar de la biblioteca', noLibBooks:'Biblioteca vacía',
        bookmarkLabel:'Nombre del marcador', bookmarkPlaceholder:'Descripción del marcador...'
      },
      ru: {
        title:'Читалка', open:'Открыть файл', upload:'Загрузить', library:'Библиотека',
        toc:'Содержание', bookmarks:'Закладки', settings:'Настройки',
        addBookmark:'Добавить закладку', removeBookmark:'Удалить', goTo:'Перейти',
        fontSize:'Размер шрифта', theme:'Тема', light:'Светлая', dark:'Тёмная', sepia:'Сепия',
        lineHeight:'Межстрочный', fontFamily:'Шрифт', margins:'Поля',
        prevPage:'Предыдущая', nextPage:'Следующая', page:'Страница', of:'/',
        noBook:'Книга не открыта', dropHere:'или перетащите файл',
        supported:'Поддерживаемые форматы', progress:'Прогресс',
        noToc:'Содержание не найдено', noBookmarks:'Нет закладок',
        deleteConfirm:'Вы уверены, что хотите удалить эту закладку?',
        yes:'Да', cancel:'Отмена', delete:'Удалить', loading:'Загрузка...',
        loadError:'Не удалось загрузить файл', bookmarkAdded:'Закладка добавлена',
        fullscreen:'Полный экран', exitFullscreen:'Выход из полного экрана',
        openFromServer:'Открыть с сервера', searchPlaceholder:'Поиск...',
        zoomIn:'Увеличить', zoomOut:'Уменьшить', fitWidth:'По ширине',
        continuous:'Непрерывный', paginated:'Постраничный', viewMode:'Вид',
        saveProgress:'Прогресс сохранён', lastRead:'Последнее чтение',
        removeFromLib:'Удалить из библиотеки', noLibBooks:'Библиотека пуста',
        bookmarkLabel:'Название закладки', bookmarkPlaceholder:'Описание закладки...'
      },
    zh: { title: 'Book Reader', open: 'Open File', upload: 'Upload', library: 'Library', toc: 'Contents', bookmarks: 'Bookmarks', settings: 'Settings', addBookmark: 'Add Bookmark', removeBookmark: 'Remove', goTo: 'Go To', fontSize: 'Font Size', theme: 'Theme', light: 'Light', dark: 'Dark', sepia: 'Sepia', lineHeight: 'Line Height', fontFamily: 'Font Family', margins: 'Margins', prevPage: 'Previous Page', nextPage: 'Next Page', page: 'Page', of: '/', noBook: 'No book opened yet', dropHere: 'or drag and drop', supported: 'Supported formats', progress: 'Progress', noToc: 'No table of contents found', noBookmarks: 'No bookmarks yet', deleteConfirm: 'Are you sure you want to delete this bookmark?', yes: 'Yes', cancel: 'Cancel', delete: 'Delete', loading: 'Loading...', loadError: 'Could not load file', bookmarkAdded: 'Bookmark added', fullscreen: 'Fullscreen', exitFullscreen: 'Exit Fullscreen', openFromServer: 'Open from Server', searchPlaceholder: 'Search...', zoomIn: 'Zoom In', zoomOut: 'Zoom Out', fitWidth: 'Fit Width', continuous: 'Continuous', paginated: 'Paginated', viewMode: 'View Mode', saveProgress: 'Progress saved', lastRead: 'Last read', removeFromLib: 'Remove from Library', noLibBooks: 'Library is empty', bookmarkLabel: 'Bookmark Label', bookmarkPlaceholder: 'Bookmark description...' },
    ja: { title: 'Book Reader', open: 'Open File', upload: 'Upload', library: 'Library', toc: 'Contents', bookmarks: 'Bookmarks', settings: 'Settings', addBookmark: 'Add Bookmark', removeBookmark: 'Remove', goTo: 'Go To', fontSize: 'Font Size', theme: 'Theme', light: 'Light', dark: 'Dark', sepia: 'Sepia', lineHeight: 'Line Height', fontFamily: 'Font Family', margins: 'Margins', prevPage: 'Previous Page', nextPage: 'Next Page', page: 'Page', of: '/', noBook: 'No book opened yet', dropHere: 'or drag and drop', supported: 'Supported formats', progress: 'Progress', noToc: 'No table of contents found', noBookmarks: 'No bookmarks yet', deleteConfirm: 'Are you sure you want to delete this bookmark?', yes: 'Yes', cancel: 'Cancel', delete: 'Delete', loading: 'Loading...', loadError: 'Could not load file', bookmarkAdded: 'Bookmark added', fullscreen: 'Fullscreen', exitFullscreen: 'Exit Fullscreen', openFromServer: 'Open from Server', searchPlaceholder: 'Search...', zoomIn: 'Zoom In', zoomOut: 'Zoom Out', fitWidth: 'Fit Width', continuous: 'Continuous', paginated: 'Paginated', viewMode: 'View Mode', saveProgress: 'Progress saved', lastRead: 'Last read', removeFromLib: 'Remove from Library', noLibBooks: 'Library is empty', bookmarkLabel: 'Bookmark Label', bookmarkPlaceholder: 'Bookmark description...' },
    it: { title: 'Book Reader', open: 'Open File', upload: 'Upload', library: 'Library', toc: 'Contents', bookmarks: 'Bookmarks', settings: 'Settings', addBookmark: 'Add Bookmark', removeBookmark: 'Remove', goTo: 'Go To', fontSize: 'Font Size', theme: 'Theme', light: 'Light', dark: 'Dark', sepia: 'Sepia', lineHeight: 'Line Height', fontFamily: 'Font Family', margins: 'Margins', prevPage: 'Previous Page', nextPage: 'Next Page', page: 'Page', of: '/', noBook: 'No book opened yet', dropHere: 'or drag and drop', supported: 'Supported formats', progress: 'Progress', noToc: 'No table of contents found', noBookmarks: 'No bookmarks yet', deleteConfirm: 'Are you sure you want to delete this bookmark?', yes: 'Yes', cancel: 'Cancel', delete: 'Delete', loading: 'Loading...', loadError: 'Could not load file', bookmarkAdded: 'Bookmark added', fullscreen: 'Fullscreen', exitFullscreen: 'Exit Fullscreen', openFromServer: 'Open from Server', searchPlaceholder: 'Search...', zoomIn: 'Zoom In', zoomOut: 'Zoom Out', fitWidth: 'Fit Width', continuous: 'Continuous', paginated: 'Paginated', viewMode: 'View Mode', saveProgress: 'Progress saved', lastRead: 'Last read', removeFromLib: 'Remove from Library', noLibBooks: 'Library is empty', bookmarkLabel: 'Bookmark Label', bookmarkPlaceholder: 'Bookmark description...' }
  };

    function getLocale() { return localStorage.getItem('sys_locale') || 'tr'; }
    const locale = ref(getLocale());
    const t = function(k) { return (LANGS[locale.value] && LANGS[locale.value][k]) || LANGS.en[k] || k; };
    var localeTimer;

    /* ── Auth ── */
    function getToken() { return localStorage.getItem('auth_token'); }
    function authHeaders() { return { Authorization: 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }

    /* ── CDN Loading ── */
    var epubReady = ref(false);
    var pdfReady = ref(false);

    function loadScript(url) {
      return new Promise(function(resolve, reject) {
        if (document.querySelector('script[src="' + url + '"]')) { resolve(); return; }
        var s = document.createElement('script');
        s.src = url;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    function loadCSS(url) {
      if (document.querySelector('link[href="' + url + '"]')) return;
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = url;
      document.head.appendChild(l);
    }

    async function loadLibraries() {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/epubjs@0.3.93/dist/epub.min.js');
        epubReady.value = true;
      } catch (e) { console.warn('epub.js load failed', e); }
      try {
        if (!window.pdfjsLib) {
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        pdfReady.value = true;
      } catch (e) { console.warn('pdf.js load failed', e); }
    }

    /* ── State ── */
    var loading = ref(false);
    var bookLoaded = ref(false);
    var bookTitle = ref('');
    var bookAuthor = ref('');
    var fileName = ref('');
    var bookFormat = ref('');
    var currentPage = ref(1);
    var totalPages = ref(0);
    var progressPct = ref(0);
    var tocItems = ref([]);
    var sidePanel = ref('');

    /* reader settings */
    var rdFontSize = ref(18);
    var rdTheme = ref('dark');
    var rdLineHeight = ref(1.6);
    var rdFontFamily = ref('serif');
    var rdMargin = ref(40);

    /* bookmarks */
    var bookmarks = ref([]);
    var bookmarkLabel = ref('');

    /* library */
    var libBooks = ref([]);
    var loadingLib = ref(false);

    /* internal refs */
    var viewerEl = ref(null);
    var epubBook = null;
    var epubRendition = null;
    var pdfDoc = null;
    var pdfCanvases = [];
    var currentBookId = null;
    var pdfZoom = ref(1.0);

    /* ── Themes ── */
    var THEMES = {
      dark:  { bg:'#1a1a2e', fg:'#d4d4d4', link:'#64b5f6' },
      light: { bg:'#fefefe', fg:'#222222', link:'#1565c0' },
      sepia: { bg:'#f4ecd8', fg:'#5b4636', link:'#8b5e3c' }
    };

    var currentTheme = computed(function() { return THEMES[rdTheme.value] || THEMES.dark; });

    /* ── File open methods ── */
    async function openFromServer() {
      if (!window.FileDialog) { ElMessage.warning('FileDialog not available'); return; }
      try {
        var result = await window.FileDialog.open({
          title: t('openFromServer'),
          filters: [{ label: t('supported'), extensions: ['epub','pdf','txt','html','htm','fb2','md'] }]
        });
        if (!result) return;
        var ext = (result.name || '').split('.').pop().toLowerCase();
        if (ext === 'epub' || ext === 'pdf') {
          var res = await fetch('/api/fs/read-binary?path=' + encodeURIComponent(result.path), { headers: authHeaders() });
          if (!res.ok) throw new Error(t('loadError'));
          var data = await res.json();
          var binary = atob(data.content);
          var bytes = new Uint8Array(binary.length);
          for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          await loadBook(bytes.buffer, result.name, ext);
        } else {
          await loadBook(result.content, result.name, ext);
        }
      } catch (e) { ElMessage.error(t('loadError')); console.error(e); }
    }

    function uploadFile() {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = '.epub,.pdf,.txt,.html,.htm,.fb2,.md';
      input.onchange = function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var ext = file.name.split('.').pop().toLowerCase();
        var reader = new FileReader();
        if (ext === 'epub' || ext === 'pdf') {
          reader.onload = function(ev) { loadBook(ev.target.result, file.name, ext); };
          reader.readAsArrayBuffer(file);
        } else {
          reader.onload = function(ev) { loadBook(ev.target.result, file.name, ext); };
          reader.readAsText(file);
        }
      };
      input.click();
    }

    /* ── Drop handler ── */
    function handleDrop(e) {
      e.preventDefault();
      e.stopPropagation();
      var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (!file) return;
      var ext = file.name.split('.').pop().toLowerCase();
      var reader = new FileReader();
      if (ext === 'epub' || ext === 'pdf') {
        reader.onload = function(ev) { loadBook(ev.target.result, file.name, ext); };
        reader.readAsArrayBuffer(file);
      } else {
        reader.onload = function(ev) { loadBook(ev.target.result, file.name, ext); };
        reader.readAsText(file);
      }
    }
    function handleDragover(e) { e.preventDefault(); }

    /* ── Main book loader ── */
    async function loadBook(data, name, ext) {
      cleanupCurrent();
      loading.value = true;
      fileName.value = name;
      bookFormat.value = ext.toUpperCase();
      currentBookId = name.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 60);
      try {
        if (ext === 'epub') await loadEpub(data);
        else if (ext === 'pdf') await loadPdf(data);
        else if (ext === 'fb2') loadFb2(data);
        else if (ext === 'md') loadMarkdown(data);
        else if (ext === 'html' || ext === 'htm') loadHtml(data);
        else loadTxt(data);

        bookLoaded.value = true;
        loading.value = false;
        loadBookData();
        addToLibrary();
      } catch (e) {
        loading.value = false;
        ElMessage.error(t('loadError'));
        console.error('Book load error:', e);
      }
    }

    function cleanupCurrent() {
      if (epubRendition) { try { epubRendition.destroy(); } catch(e){} epubRendition = null; }
      if (epubBook) { try { epubBook.destroy(); } catch(e){} epubBook = null; }
      pdfDoc = null;
      pdfCanvases = [];
      bookLoaded.value = false;
      tocItems.value = [];
      bookmarks.value = [];
      bookTitle.value = '';
      bookAuthor.value = '';
      currentPage.value = 1;
      totalPages.value = 0;
      progressPct.value = 0;
      bookmarkLabel.value = '';
      if (viewerEl.value) viewerEl.value.innerHTML = '';
    }

    /* ── EPUB ── */
    async function loadEpub(data) {
      if (!epubReady.value || !window.ePub) throw new Error('epub.js not loaded');
      epubBook = window.ePub(data);
      await epubBook.ready;

      bookTitle.value = epubBook.packaging.metadata.title || fileName.value;
      bookAuthor.value = epubBook.packaging.metadata.creator || '';

      /* TOC */
      var nav = await epubBook.loaded.navigation;
      if (nav && nav.toc) {
        tocItems.value = nav.toc.map(function(item) {
          return { label: item.label, href: item.href, sub: (item.subitems || []).map(function(s) { return { label: s.label, href: s.href }; }) };
        });
      }

      /* Render */
      epubRendition = epubBook.renderTo(viewerEl.value, {
        width: '100%',
        height: '100%',
        spread: 'none',
        flow: 'paginated'
      });

      applyEpubTheme();
      epubRendition.display();

      epubRendition.on('relocated', function(location) {
        if (location && location.start) {
          currentPage.value = location.start.displayed ? location.start.displayed.page : 1;
          totalPages.value = location.start.displayed ? location.start.displayed.total : 0;
          progressPct.value = epubBook.locations ? Math.round((location.start.percentage || 0) * 100) : 0;
        }
      });

      /* Generate locations for progress */
      try { await epubBook.locations.generate(1024); } catch(e) {}
    }

    function applyEpubTheme() {
      if (!epubRendition) return;
      var th = currentTheme.value;
      epubRendition.themes.default({
        'body': { 'background': th.bg + ' !important', 'color': th.fg + ' !important', 'font-size': rdFontSize.value + 'px !important', 'line-height': rdLineHeight.value + ' !important', 'font-family': rdFontFamily.value + ',serif !important', 'padding': rdMargin.value + 'px !important' },
        'a': { 'color': th.link + ' !important' },
        'p': { 'color': th.fg + ' !important' },
        'h1,h2,h3,h4,h5,h6': { 'color': th.fg + ' !important' },
        'span': { 'color': th.fg + ' !important' }
      });
    }

    function epubPrev() { if (epubRendition) epubRendition.prev(); }
    function epubNext() { if (epubRendition) epubRendition.next(); }
    function epubGoTo(href) { if (epubRendition) { epubRendition.display(href); sidePanel.value = ''; } }

    /* ── PDF ── */
    async function loadPdf(data) {
      if (!pdfReady.value || !window.pdfjsLib) throw new Error('pdf.js not loaded');
      pdfDoc = await window.pdfjsLib.getDocument({ data: data }).promise;
      totalPages.value = pdfDoc.numPages;
      bookTitle.value = fileName.value;
      await renderPdfPages();
    }

    async function renderPdfPages() {
      if (!pdfDoc || !viewerEl.value) return;
      viewerEl.value.innerHTML = '';
      pdfCanvases = [];
      for (var i = 1; i <= pdfDoc.numPages; i++) {
        var page = await pdfDoc.getPage(i);
        var viewport = page.getViewport({ scale: pdfZoom.value });
        var canvas = document.createElement('canvas');
        canvas.className = 'bkr-pdf-canvas';
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        var ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport: viewport }).promise;
        viewerEl.value.appendChild(canvas);
        pdfCanvases.push(canvas);
      }
      updatePdfPage();
    }

    function updatePdfPage() {
      if (!viewerEl.value || !pdfDoc) return;
      var container = viewerEl.value;
      var scrollTop = container.scrollTop;
      var found = 1;
      var children = container.children;
      for (var i = 0; i < children.length; i++) {
        if (children[i].offsetTop <= scrollTop + 50) found = i + 1;
      }
      currentPage.value = found;
      progressPct.value = Math.round(found / totalPages.value * 100);
    }

    function pdfGoToPage(p) {
      var c = viewerEl.value && viewerEl.value.children[p - 1];
      if (c) c.scrollIntoView({ behavior: 'smooth' });
    }

    function pdfZoomIn() { pdfZoom.value = Math.min(5, pdfZoom.value + 0.25); renderPdfPages(); }
    function pdfZoomOut() { pdfZoom.value = Math.max(0.25, pdfZoom.value - 0.25); renderPdfPages(); }

    /* ── Plain text ── */
    function loadTxt(text) {
      bookTitle.value = fileName.value;
      if (!viewerEl.value) return;
      var pre = document.createElement('pre');
      pre.className = 'bkr-txt-content';
      pre.textContent = text;
      viewerEl.value.appendChild(pre);
      totalPages.value = 1;
      currentPage.value = 1;
    }

    /* ── HTML ── */
    function loadHtml(html) {
      bookTitle.value = fileName.value;
      if (!viewerEl.value) return;
      var container = document.createElement('div');
      container.className = 'bkr-html-content';
      /* Sanitize: remove script tags */
      var cleaned = html.replace(/<script[\s\S]*?<\/script>/gi, '');
      container.innerHTML = cleaned;
      viewerEl.value.appendChild(container);
      totalPages.value = 1;
      currentPage.value = 1;
      /* Extract title from <title> */
      var titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
      if (titleMatch) bookTitle.value = titleMatch[1];
    }

    /* ── Markdown ── */
    function loadMarkdown(md) {
      bookTitle.value = fileName.value;
      if (!viewerEl.value) return;
      /* Simple markdown to HTML */
      var html = md
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/^\- (.*$)/gm, '<li>$1</li>')
        .replace(/^---$/gm, '<hr>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
      html = '<p>' + html + '</p>';
      var container = document.createElement('div');
      container.className = 'bkr-html-content';
      container.innerHTML = html;
      viewerEl.value.appendChild(container);
      totalPages.value = 1;
      currentPage.value = 1;
    }

    /* ── FB2 ── */
    function loadFb2(text) {
      if (!viewerEl.value) return;
      try {
        var parser = new DOMParser();
        var doc = parser.parseFromString(text, 'text/xml');

        /* Extract metadata */
        var ti = doc.querySelector('title-info');
        if (ti) {
          var bt = ti.querySelector('book-title');
          if (bt) bookTitle.value = bt.textContent;
          var fn = ti.querySelector('author first-name');
          var ln = ti.querySelector('author last-name');
          if (fn || ln) bookAuthor.value = ((fn ? fn.textContent : '') + ' ' + (ln ? ln.textContent : '')).trim();
        }
        if (!bookTitle.value) bookTitle.value = fileName.value;

        /* Extract body sections */
        var bodies = doc.querySelectorAll('body');
        var html = '';
        bodies.forEach(function(body) {
          body.querySelectorAll('section').forEach(function(section) {
            var titleEl = section.querySelector('title');
            if (titleEl) html += '<h2>' + titleEl.textContent.trim() + '</h2>';
            section.querySelectorAll('p').forEach(function(p) {
              html += '<p>' + p.textContent + '</p>';
            });
          });
          /* Also handle direct paragraphs */
          body.querySelectorAll(':scope > p').forEach(function(p) {
            html += '<p>' + p.textContent + '</p>';
          });
        });

        /* TOC from sections */
        var sections = doc.querySelectorAll('body > section');
        var tocList = [];
        sections.forEach(function(s, i) {
          var stitle = s.querySelector('title');
          if (stitle) tocList.push({ label: stitle.textContent.trim(), href: '#fb2-section-' + i, sub: [] });
        });
        tocItems.value = tocList;

        var container = document.createElement('div');
        container.className = 'bkr-html-content';
        container.innerHTML = html || '<p>' + text.slice(0, 10000) + '</p>';
        viewerEl.value.appendChild(container);
        totalPages.value = 1;
        currentPage.value = 1;
      } catch (e) {
        loadTxt(text);
      }
    }

    /* ── Settings watchers ── */
    watch([rdFontSize, rdTheme, rdLineHeight, rdFontFamily, rdMargin], function() {
      if (bookFormat.value === 'EPUB') {
        applyEpubTheme();
      }
      applyTextStyles();
      saveSettings();
    });

    function applyTextStyles() {
      if (!viewerEl.value) return;
      var th = currentTheme.value;
      var content = viewerEl.value.querySelector('.bkr-txt-content, .bkr-html-content');
      if (content) {
        content.style.fontSize = rdFontSize.value + 'px';
        content.style.lineHeight = rdLineHeight.value;
        content.style.fontFamily = rdFontFamily.value + ',serif';
        content.style.color = th.fg;
        content.style.padding = rdMargin.value + 'px';
      }
    }

    /* ── Navigation ── */
    function prevPage() {
      if (bookFormat.value === 'EPUB') epubPrev();
      else if (bookFormat.value === 'PDF' && currentPage.value > 1) pdfGoToPage(currentPage.value - 1);
    }
    function nextPage() {
      if (bookFormat.value === 'EPUB') epubNext();
      else if (bookFormat.value === 'PDF' && currentPage.value < totalPages.value) pdfGoToPage(currentPage.value + 1);
    }

    /* ── Keyboard ── */
    function handleKeydown(e) {
      if (!bookLoaded.value) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prevPage(); }
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); nextPage(); }
    }

    /* ── Bookmarks ── */
    function addBookmark() {
      var bm = {
        id: Date.now().toString(36),
        label: bookmarkLabel.value.trim() || (t('page') + ' ' + currentPage.value),
        page: currentPage.value,
        progress: progressPct.value,
        cfi: null,
        createdAt: new Date().toISOString()
      };
      if (bookFormat.value === 'EPUB' && epubRendition && epubRendition.location) {
        try { bm.cfi = epubRendition.location.start.cfi; } catch(e) {}
      }
      bookmarks.value.push(bm);
      bookmarkLabel.value = '';
      ElMessage.success(t('bookmarkAdded'));
      saveBookData();
    }

    async function removeBookmark(id) {
      try {
        await ElMessageBox.confirm(t('deleteConfirm'), t('delete'), {
          type:'warning', confirmButtonText: t('yes'), cancelButtonText: t('cancel')
        });
      } catch { return; }
      bookmarks.value = bookmarks.value.filter(function(b) { return b.id !== id; });
      saveBookData();
    }

    function goToBookmark(bm) {
      if (bookFormat.value === 'EPUB' && bm.cfi) epubRendition.display(bm.cfi);
      else if (bookFormat.value === 'PDF') pdfGoToPage(bm.page);
      sidePanel.value = '';
    }

    /* ── Persistence ── */
    function saveBookData() {
      if (!currentBookId) return;
      var data = {
        bookId: currentBookId,
        bookmarks: bookmarks.value,
        page: currentPage.value,
        progress: progressPct.value,
        cfi: null
      };
      if (bookFormat.value === 'EPUB' && epubRendition && epubRendition.location) {
        try { data.cfi = epubRendition.location.start.cfi; } catch(e) {}
      }
      fetch('/api/book-reader/progress', {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(data)
      }).catch(function(e) { console.error('Save progress error:', e); });
    }

    async function loadBookData() {
      if (!currentBookId) return;
      try {
        var res = await fetch('/api/book-reader/progress/' + encodeURIComponent(currentBookId), { headers: authHeaders() });
        if (res.ok) {
          var data = await res.json();
          if (data.bookmarks) bookmarks.value = data.bookmarks;
          /* Restore position */
          if (bookFormat.value === 'EPUB' && data.cfi && epubRendition) {
            try { epubRendition.display(data.cfi); } catch(e) {}
          } else if (bookFormat.value === 'PDF' && data.page > 1) {
            nextTick(function() { pdfGoToPage(data.page); });
          }
        }
      } catch (e) { console.error('Load progress error:', e); }
    }

    function saveSettings() {
      localStorage.setItem('bkr_settings', JSON.stringify({
        fontSize: rdFontSize.value, theme: rdTheme.value,
        lineHeight: rdLineHeight.value, fontFamily: rdFontFamily.value, margin: rdMargin.value
      }));
    }

    function loadSettings() {
      try {
        var s = JSON.parse(localStorage.getItem('bkr_settings'));
        if (s) {
          if (s.fontSize) rdFontSize.value = s.fontSize;
          if (s.theme) rdTheme.value = s.theme;
          if (s.lineHeight) rdLineHeight.value = s.lineHeight;
          if (s.fontFamily) rdFontFamily.value = s.fontFamily;
          if (s.margin !== undefined) rdMargin.value = s.margin;
        }
      } catch(e) {}
    }

    /* ── Library ── */
    async function loadLibrary() {
      loadingLib.value = true;
      try {
        var res = await fetch('/api/book-reader/library', { headers: authHeaders() });
        if (res.ok) libBooks.value = await res.json();
      } catch(e) {}
      loadingLib.value = false;
    }

    function addToLibrary() {
      var existing = libBooks.value.find(function(b) { return b.id === currentBookId; });
      if (existing) {
        existing.lastRead = new Date().toISOString();
        existing.title = bookTitle.value || fileName.value;
        existing.author = bookAuthor.value;
        existing.progress = progressPct.value;
        existing.format = bookFormat.value;
      } else {
        libBooks.value.unshift({
          id: currentBookId,
          title: bookTitle.value || fileName.value,
          author: bookAuthor.value,
          format: bookFormat.value,
          fileName: fileName.value,
          progress: progressPct.value,
          lastRead: new Date().toISOString()
        });
      }
      fetch('/api/book-reader/library', {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(libBooks.value)
      }).catch(function(e) {});
    }

    async function removeFromLibrary(id) {
      try {
        await ElMessageBox.confirm(t('deleteConfirm'), t('delete'), {
          type:'warning', confirmButtonText: t('yes'), cancelButtonText: t('cancel')
        });
      } catch { return; }
      libBooks.value = libBooks.value.filter(function(b) { return b.id !== id; });
      fetch('/api/book-reader/library', {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(libBooks.value)
      }).catch(function(e) {});
    }

    /* ── Side panel ── */
    function togglePanel(panel) {
      sidePanel.value = sidePanel.value === panel ? '' : panel;
    }

    /* ── Scroll tracking for PDF ── */
    function onViewerScroll() {
      if (bookFormat.value === 'PDF') updatePdfPage();
      /* Debounced progress save */
      if (bookLoaded.value) {
        if (onViewerScroll._t) clearTimeout(onViewerScroll._t);
        onViewerScroll._t = setTimeout(function() { saveBookData(); }, 2000);
      }
    }

    /* ── Lifecycle ── */
    onMounted(function() {
      loadLibraries();
      loadSettings();
      loadLibrary();
      localeTimer = setInterval(function() { locale.value = getLocale(); }, 1000);
      document.addEventListener('keydown', handleKeydown);
    });

    onUnmounted(function() {
      if (localeTimer) clearInterval(localeTimer);
      document.removeEventListener('keydown', handleKeydown);
      if (bookLoaded.value) saveBookData();
      cleanupCurrent();
    });

    return {
      locale, t, loading, bookLoaded, bookTitle, bookAuthor, fileName, bookFormat,
      currentPage, totalPages, progressPct, tocItems, sidePanel,
      rdFontSize, rdTheme, rdLineHeight, rdFontFamily, rdMargin,
      bookmarks, bookmarkLabel, libBooks, loadingLib,
      viewerEl, currentTheme, pdfZoom,
      openFromServer, uploadFile, handleDrop, handleDragover,
      prevPage, nextPage, epubGoTo, goToBookmark,
      addBookmark, removeBookmark, togglePanel,
      pdfZoomIn, pdfZoomOut, pdfGoToPage, onViewerScroll,
      removeFromLibrary, loadLibrary
    };
  }
})
