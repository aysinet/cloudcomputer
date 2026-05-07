({
  setup() {
    const { ref, reactive, computed, onMounted, onUnmounted, watch } = Vue;
    const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success(){}, error(){}, warning(){}, info(){} };

    /* ── i18n ── */
    const LANGS = {
      tr: {
        title:'Web İndirici',
        urlPlaceholder:'https://ornek.com adresini girin',
        start:'Taramayı Başlat',
        stop:'Durdur',
        clear:'Temizle',
        crawling:'Taranıyor...',
        depthLimit:'Derinlik Limiti',
        maxPages:'Maks Sayfa',
        sameDomain:'Aynı Domain',
        fileFilter:'Dosya Filtresi',
        allFiles:'Tüm dosyalar',
        images:'Resimler',
        media:'Medya',
        textFiles:'Metin Dosyaları',
        archives:'Arşivler',
        urlPattern:'URL Deseni',
        urlPatternHint:'ör: /blog/*',
        saveTo:'Kayıt Yeri',
        maxFileSize:'Maks Dosya Boyutu',
        maxFileSizeHint:'MB (0 = limitsiz)',
        fileSizeExceeded:'Dosya boyutu limitini aşıyor',
        scanned:'Taranan',
        found:'Bulunan',
        downloaded:'İndirilen',
        errors:'Hatalar',
        depth:'Derinlik',
        selectAll:'Tümünü Seç',
        selected:'seçili',
        downloadSelected:'Seçilenleri İndir',
        exportList:'Listeyi Dışa Aktar',
        fileName:'Dosya Adı',
        type:'Tür',
        size:'Boyut',
        status:'Durum',
        log:'Günlük',
        clearLog:'Günlüğü Temizle',
        emptyDesc:'Bir URL girin ve taramayı başlatın. Bulunan dosyalar burada listelenecek.',
        crawlStarted:'Tarama başlatıldı',
        crawlStopped:'Tarama durduruldu',
        crawlDone:'Tarama tamamlandı',
        downloadStarted:'İndirme başladı',
        downloadDone:'İndirme tamamlandı',
        downloadError:'İndirme hatası',
        invalidUrl:'Geçersiz URL',
        listExported:'Liste panoya kopyalandı'
      },
      en: {
        title:'Web Downloader',
        urlPlaceholder:'Enter URL like https://example.com',
        start:'Start Crawl',
        stop:'Stop',
        clear:'Clear',
        crawling:'Crawling...',
        depthLimit:'Depth Limit',
        maxPages:'Max Pages',
        sameDomain:'Same Domain',
        fileFilter:'File Filter',
        allFiles:'All files',
        images:'Images',
        media:'Media',
        textFiles:'Text Files',
        archives:'Archives',
        urlPattern:'URL Pattern',
        urlPatternHint:'e.g. /blog/*',
        saveTo:'Save To',
        maxFileSize:'Max File Size',
        maxFileSizeHint:'MB (0 = no limit)',
        fileSizeExceeded:'File size exceeds limit',
        scanned:'Scanned',
        found:'Found',
        downloaded:'Downloaded',
        errors:'Errors',
        depth:'Depth',
        selectAll:'Select All',
        selected:'selected',
        downloadSelected:'Download Selected',
        exportList:'Export List',
        fileName:'File Name',
        type:'Type',
        size:'Size',
        status:'Status',
        log:'Log',
        clearLog:'Clear Log',
        emptyDesc:'Enter a URL and start crawling. Found files will be listed here.',
        crawlStarted:'Crawl started',
        crawlStopped:'Crawl stopped',
        crawlDone:'Crawl completed',
        downloadStarted:'Download started',
        downloadDone:'Download completed',
        downloadError:'Download error',
        invalidUrl:'Invalid URL',
        listExported:'List copied to clipboard'
      },
      de: {
        title:'Web-Downloader',
        urlPlaceholder:'URL eingeben z.B. https://beispiel.de',
        start:'Crawl starten',
        stop:'Stopp',
        clear:'Löschen',
        crawling:'Crawlt...',
        depthLimit:'Tiefenlimit',
        maxPages:'Max Seiten',
        sameDomain:'Gleiche Domain',
        fileFilter:'Dateifilter',
        allFiles:'Alle Dateien',
        images:'Bilder',
        media:'Medien',
        textFiles:'Textdateien',
        archives:'Archive',
        urlPattern:'URL-Muster',
        urlPatternHint:'z.B. /blog/*',
        saveTo:'Speichern nach',
        maxFileSize:'Max Dateigröße',
        maxFileSizeHint:'MB (0 = unbegrenzt)',
        fileSizeExceeded:'Datei überschreitet Größenlimit',
        scanned:'Gescannt',
        found:'Gefunden',
        downloaded:'Heruntergeladen',
        errors:'Fehler',
        depth:'Tiefe',
        selectAll:'Alle auswählen',
        selected:'ausgewählt',
        downloadSelected:'Ausgewählte herunterladen',
        exportList:'Liste exportieren',
        fileName:'Dateiname',
        type:'Typ',
        size:'Größe',
        status:'Status',
        log:'Protokoll',
        clearLog:'Protokoll löschen',
        emptyDesc:'Geben Sie eine URL ein und starten Sie den Crawl. Gefundene Dateien werden hier aufgelistet.',
        crawlStarted:'Crawl gestartet',
        crawlStopped:'Crawl gestoppt',
        crawlDone:'Crawl abgeschlossen',
        downloadStarted:'Download gestartet',
        downloadDone:'Download abgeschlossen',
        downloadError:'Download-Fehler',
        invalidUrl:'Ungültige URL',
        listExported:'Liste in Zwischenablage kopiert'
      },
      fr: {
        title:'Téléchargeur Web',
        urlPlaceholder:'Entrez l\'URL ex: https://exemple.fr',
        start:'Démarrer',
        stop:'Arrêter',
        clear:'Effacer',
        crawling:'Exploration...',
        depthLimit:'Limite profondeur',
        maxPages:'Max pages',
        sameDomain:'Même domaine',
        fileFilter:'Filtre fichiers',
        allFiles:'Tous les fichiers',
        images:'Images',
        media:'Médias',
        textFiles:'Fichiers texte',
        archives:'Archives',
        urlPattern:'Modèle URL',
        urlPatternHint:'ex: /blog/*',
        saveTo:'Enregistrer dans',
        maxFileSize:'Taille max fichier',
        maxFileSizeHint:'Mo (0 = illimité)',
        fileSizeExceeded:'Taille du fichier dépasse la limite',
        scanned:'Scannés',
        found:'Trouvés',
        downloaded:'Téléchargés',
        errors:'Erreurs',
        depth:'Profondeur',
        selectAll:'Tout sélectionner',
        selected:'sélectionnés',
        downloadSelected:'Télécharger sélection',
        exportList:'Exporter la liste',
        fileName:'Nom du fichier',
        type:'Type',
        size:'Taille',
        status:'Statut',
        log:'Journal',
        clearLog:'Effacer le journal',
        emptyDesc:'Entrez une URL et lancez l\'exploration. Les fichiers trouvés seront listés ici.',
        crawlStarted:'Exploration démarrée',
        crawlStopped:'Exploration arrêtée',
        crawlDone:'Exploration terminée',
        downloadStarted:'Téléchargement démarré',
        downloadDone:'Téléchargement terminé',
        downloadError:'Erreur de téléchargement',
        invalidUrl:'URL invalide',
        listExported:'Liste copiée dans le presse-papiers'
      },
      es: {
        title:'Descargador Web',
        urlPlaceholder:'Ingrese URL ej: https://ejemplo.com',
        start:'Iniciar',
        stop:'Detener',
        clear:'Limpiar',
        crawling:'Rastreando...',
        depthLimit:'Límite profundidad',
        maxPages:'Máx páginas',
        sameDomain:'Mismo dominio',
        fileFilter:'Filtro archivos',
        allFiles:'Todos los archivos',
        images:'Imágenes',
        media:'Medios',
        textFiles:'Archivos de texto',
        archives:'Archivos comprimidos',
        urlPattern:'Patrón URL',
        urlPatternHint:'ej: /blog/*',
        saveTo:'Guardar en',
        maxFileSize:'Tamaño máx archivo',
        maxFileSizeHint:'MB (0 = sin límite)',
        fileSizeExceeded:'El archivo excede el límite de tamaño',
        scanned:'Escaneados',
        found:'Encontrados',
        downloaded:'Descargados',
        errors:'Errores',
        depth:'Profundidad',
        selectAll:'Seleccionar todo',
        selected:'seleccionados',
        downloadSelected:'Descargar selección',
        exportList:'Exportar lista',
        fileName:'Nombre archivo',
        type:'Tipo',
        size:'Tamaño',
        status:'Estado',
        log:'Registro',
        clearLog:'Limpiar registro',
        emptyDesc:'Ingrese una URL e inicie el rastreo. Los archivos encontrados se listarán aquí.',
        crawlStarted:'Rastreo iniciado',
        crawlStopped:'Rastreo detenido',
        crawlDone:'Rastreo completado',
        downloadStarted:'Descarga iniciada',
        downloadDone:'Descarga completada',
        downloadError:'Error de descarga',
        invalidUrl:'URL inválida',
        listExported:'Lista copiada al portapapeles'
      },
      ru: {
        title:'Веб-загрузчик',
        urlPlaceholder:'Введите URL, например https://example.com',
        start:'Начать',
        stop:'Стоп',
        clear:'Очистить',
        crawling:'Сканирование...',
        depthLimit:'Лимит глубины',
        maxPages:'Макс страниц',
        sameDomain:'Тот же домен',
        fileFilter:'Фильтр файлов',
        allFiles:'Все файлы',
        images:'Изображения',
        media:'Медиа',
        textFiles:'Текстовые файлы',
        archives:'Архивы',
        urlPattern:'Шаблон URL',
        urlPatternHint:'напр: /blog/*',
        saveTo:'Сохранить в',
        maxFileSize:'Макс размер файла',
        maxFileSizeHint:'МБ (0 = без лимита)',
        fileSizeExceeded:'Файл превышает лимит размера',
        scanned:'Просканировано',
        found:'Найдено',
        downloaded:'Загружено',
        errors:'Ошибки',
        depth:'Глубина',
        selectAll:'Выделить все',
        selected:'выбрано',
        downloadSelected:'Скачать выбранное',
        exportList:'Экспорт списка',
        fileName:'Имя файла',
        type:'Тип',
        size:'Размер',
        status:'Статус',
        log:'Журнал',
        clearLog:'Очистить журнал',
        emptyDesc:'Введите URL и начните сканирование. Найденные файлы будут перечислены здесь.',
        crawlStarted:'Сканирование начато',
        crawlStopped:'Сканирование остановлено',
        crawlDone:'Сканирование завершено',
        downloadStarted:'Загрузка начата',
        downloadDone:'Загрузка завершена',
        downloadError:'Ошибка загрузки',
        invalidUrl:'Неверный URL',
        listExported:'Список скопирован в буфер'
      },
      zh: {
        title:'网页下载器',
        urlPlaceholder:'输入URL 如 https://example.com',
        start:'开始抓取',
        stop:'停止',
        clear:'清空',
        crawling:'抓取中...',
        depthLimit:'深度限制',
        maxPages:'最大页数',
        sameDomain:'同域名',
        fileFilter:'文件过滤',
        allFiles:'所有文件',
        images:'图片',
        media:'媒体',
        textFiles:'文本文件',
        archives:'压缩包',
        urlPattern:'URL模式',
        urlPatternHint:'如: /blog/*',
        saveTo:'保存到',
        maxFileSize:'最大文件大小',
        maxFileSizeHint:'MB (0 = 无限制)',
        fileSizeExceeded:'文件大小超出限制',
        scanned:'已扫描',
        found:'已发现',
        downloaded:'已下载',
        errors:'错误',
        depth:'深度',
        selectAll:'全选',
        selected:'已选',
        downloadSelected:'下载选中',
        exportList:'导出列表',
        fileName:'文件名',
        type:'类型',
        size:'大小',
        status:'状态',
        log:'日志',
        clearLog:'清除日志',
        emptyDesc:'输入URL并开始抓取。发现的文件将列在这里。',
        crawlStarted:'抓取已开始',
        crawlStopped:'抓取已停止',
        crawlDone:'抓取完成',
        downloadStarted:'下载已开始',
        downloadDone:'下载完成',
        downloadError:'下载错误',
        invalidUrl:'无效URL',
        listExported:'列表已复制到剪贴板'
      },
      ja: {
        title:'Webダウンローダー',
        urlPlaceholder:'URLを入力 例: https://example.com',
        start:'クロール開始',
        stop:'停止',
        clear:'クリア',
        crawling:'クロール中...',
        depthLimit:'深度制限',
        maxPages:'最大ページ数',
        sameDomain:'同一ドメイン',
        fileFilter:'ファイルフィルター',
        allFiles:'すべてのファイル',
        images:'画像',
        media:'メディア',
        textFiles:'テキストファイル',
        archives:'アーカイブ',
        urlPattern:'URLパターン',
        urlPatternHint:'例: /blog/*',
        saveTo:'保存先',
        maxFileSize:'最大ファイルサイズ',
        maxFileSizeHint:'MB (0 = 無制限)',
        fileSizeExceeded:'ファイルサイズが制限を超えています',
        scanned:'スキャン済',
        found:'発見',
        downloaded:'ダウンロード済',
        errors:'エラー',
        depth:'深度',
        selectAll:'全選択',
        selected:'選択中',
        downloadSelected:'選択をダウンロード',
        exportList:'リストをエクスポート',
        fileName:'ファイル名',
        type:'タイプ',
        size:'サイズ',
        status:'ステータス',
        log:'ログ',
        clearLog:'ログをクリア',
        emptyDesc:'URLを入力してクロールを開始します。見つかったファイルがここに表示されます。',
        crawlStarted:'クロール開始',
        crawlStopped:'クロール停止',
        crawlDone:'クロール完了',
        downloadStarted:'ダウンロード開始',
        downloadDone:'ダウンロード完了',
        downloadError:'ダウンロードエラー',
        invalidUrl:'無効なURL',
        listExported:'リストがクリップボードにコピーされました'
      },
      it: {
        title:'Web Downloader',
        urlPlaceholder:'Inserisci URL es: https://esempio.it',
        start:'Avvia',
        stop:'Ferma',
        clear:'Cancella',
        crawling:'Scansione...',
        depthLimit:'Limite profondità',
        maxPages:'Max pagine',
        sameDomain:'Stesso dominio',
        fileFilter:'Filtro file',
        allFiles:'Tutti i file',
        images:'Immagini',
        media:'Media',
        textFiles:'File di testo',
        archives:'Archivi',
        urlPattern:'Pattern URL',
        urlPatternHint:'es: /blog/*',
        saveTo:'Salva in',
        maxFileSize:'Dim. max file',
        maxFileSizeHint:'MB (0 = illimitato)',
        fileSizeExceeded:'Il file supera il limite di dimensione',
        scanned:'Scansionati',
        found:'Trovati',
        downloaded:'Scaricati',
        errors:'Errori',
        depth:'Profondità',
        selectAll:'Seleziona tutto',
        selected:'selezionati',
        downloadSelected:'Scarica selezionati',
        exportList:'Esporta lista',
        fileName:'Nome file',
        type:'Tipo',
        size:'Dimensione',
        status:'Stato',
        log:'Registro',
        clearLog:'Cancella registro',
        emptyDesc:'Inserisci un URL e avvia la scansione. I file trovati saranno elencati qui.',
        crawlStarted:'Scansione avviata',
        crawlStopped:'Scansione fermata',
        crawlDone:'Scansione completata',
        downloadStarted:'Download avviato',
        downloadDone:'Download completato',
        downloadError:'Errore download',
        invalidUrl:'URL non valido',
        listExported:'Lista copiata negli appunti'
      },
      ar: {
        title:'محمّل الويب',
        urlPlaceholder:'أدخل الرابط مثل https://example.com',
        start:'بدء الفحص',
        stop:'إيقاف',
        clear:'مسح',
        crawling:'جاري الفحص...',
        depthLimit:'حد العمق',
        maxPages:'أقصى صفحات',
        sameDomain:'نفس النطاق',
        fileFilter:'فلتر الملفات',
        allFiles:'كل الملفات',
        images:'صور',
        media:'وسائط',
        textFiles:'ملفات نصية',
        archives:'أرشيفات',
        urlPattern:'نمط URL',
        urlPatternHint:'مثال: /blog/*',
        saveTo:'حفظ في',
        maxFileSize:'أقصى حجم ملف',
        maxFileSizeHint:'ميغابايت (0 = بلا حد)',
        fileSizeExceeded:'حجم الملف يتجاوز الحد',
        scanned:'تم فحصه',
        found:'تم إيجاده',
        downloaded:'تم تنزيله',
        errors:'أخطاء',
        depth:'العمق',
        selectAll:'تحديد الكل',
        selected:'محدد',
        downloadSelected:'تنزيل المحدد',
        exportList:'تصدير القائمة',
        fileName:'اسم الملف',
        type:'النوع',
        size:'الحجم',
        status:'الحالة',
        log:'السجل',
        clearLog:'مسح السجل',
        emptyDesc:'أدخل رابطاً وابدأ الفحص. الملفات المكتشفة ستظهر هنا.',
        crawlStarted:'بدأ الفحص',
        crawlStopped:'توقف الفحص',
        crawlDone:'اكتمل الفحص',
        downloadStarted:'بدأ التنزيل',
        downloadDone:'اكتمل التنزيل',
        downloadError:'خطأ في التنزيل',
        invalidUrl:'رابط غير صالح',
        listExported:'تم نسخ القائمة إلى الحافظة'
      },
      ko: {
        title:'웹 다운로더',
        urlPlaceholder:'URL 입력 예: https://example.com',
        start:'크롤링 시작',
        stop:'중지',
        clear:'지우기',
        crawling:'크롤링 중...',
        depthLimit:'깊이 제한',
        maxPages:'최대 페이지',
        sameDomain:'같은 도메인',
        fileFilter:'파일 필터',
        allFiles:'모든 파일',
        images:'이미지',
        media:'미디어',
        textFiles:'텍스트 파일',
        archives:'압축 파일',
        urlPattern:'URL 패턴',
        urlPatternHint:'예: /blog/*',
        saveTo:'저장 위치',
        maxFileSize:'최대 파일 크기',
        maxFileSizeHint:'MB (0 = 무제한)',
        fileSizeExceeded:'파일 크기가 제한을 초과합니다',
        scanned:'스캔됨',
        found:'발견됨',
        downloaded:'다운로드됨',
        errors:'오류',
        depth:'깊이',
        selectAll:'모두 선택',
        selected:'선택됨',
        downloadSelected:'선택 다운로드',
        exportList:'목록 내보내기',
        fileName:'파일명',
        type:'유형',
        size:'크기',
        status:'상태',
        log:'로그',
        clearLog:'로그 지우기',
        emptyDesc:'URL을 입력하고 크롤링을 시작하세요. 발견된 파일이 여기에 나열됩니다.',
        crawlStarted:'크롤링 시작됨',
        crawlStopped:'크롤링 중지됨',
        crawlDone:'크롤링 완료',
        downloadStarted:'다운로드 시작됨',
        downloadDone:'다운로드 완료',
        downloadError:'다운로드 오류',
        invalidUrl:'잘못된 URL',
        listExported:'목록이 클립보드에 복사됨'
      },
      hi: {
        title:'वेब डाउनलोडर',
        urlPlaceholder:'URL दर्ज करें जैसे https://example.com',
        start:'क्रॉल शुरू करें',
        stop:'रोकें',
        clear:'साफ़ करें',
        crawling:'क्रॉल हो रहा है...',
        depthLimit:'गहराई सीमा',
        maxPages:'अधिकतम पृष्ठ',
        sameDomain:'समान डोमेन',
        fileFilter:'फ़ाइल फ़िल्टर',
        allFiles:'सभी फ़ाइलें',
        images:'चित्र',
        media:'मीडिया',
        textFiles:'टेक्स्ट फ़ाइलें',
        archives:'आर्काइव',
        urlPattern:'URL पैटर्न',
        urlPatternHint:'उदा: /blog/*',
        saveTo:'यहाँ सहेजें',        maxFileSize:'अधिकतम फ़ाइल आकार',
        maxFileSizeHint:'MB (0 = असीमित)',
        fileSizeExceeded:'फ़ाइल आकार सीमा से अधिक है',        scanned:'स्कैन किए',
        found:'मिले',
        downloaded:'डाउनलोड किए',
        errors:'त्रुटियाँ',
        depth:'गहराई',
        selectAll:'सभी चुनें',
        selected:'चयनित',
        downloadSelected:'चयनित डाउनलोड करें',
        exportList:'सूची निर्यात करें',
        fileName:'फ़ाइल नाम',
        type:'प्रकार',
        size:'आकार',
        status:'स्थिति',
        log:'लॉग',
        clearLog:'लॉग साफ़ करें',
        emptyDesc:'URL दर्ज करें और क्रॉलिंग शुरू करें। मिली फ़ाइलें यहाँ सूचीबद्ध होंगी।',
        crawlStarted:'क्रॉल शुरू हुआ',
        crawlStopped:'क्रॉल रुका',
        crawlDone:'क्रॉल पूर्ण',
        downloadStarted:'डाउनलोड शुरू',
        downloadDone:'डाउनलोड पूर्ण',
        downloadError:'डाउनलोड त्रुटि',
        invalidUrl:'अमान्य URL',
        listExported:'सूची क्लिपबोर्ड पर कॉपी हुई'
      },
      pt: {
        title:'Web Downloader',
        urlPlaceholder:'Insira URL ex: https://exemplo.com',
        start:'Iniciar',
        stop:'Parar',
        clear:'Limpar',
        crawling:'Rastreando...',
        depthLimit:'Limite profundidade',
        maxPages:'Máx páginas',
        sameDomain:'Mesmo domínio',
        fileFilter:'Filtro arquivos',
        allFiles:'Todos os arquivos',
        images:'Imagens',
        media:'Mídia',
        textFiles:'Arquivos de texto',
        archives:'Arquivos compactados',
        urlPattern:'Padrão URL',
        urlPatternHint:'ex: /blog/*',
        saveTo:'Salvar em',
        maxFileSize:'Tam. máx arquivo',
        maxFileSizeHint:'MB (0 = sem limite)',
        fileSizeExceeded:'Arquivo excede o limite de tamanho',
        scanned:'Escaneados',
        found:'Encontrados',
        downloaded:'Baixados',
        errors:'Erros',
        depth:'Profundidade',
        selectAll:'Selecionar tudo',
        selected:'selecionados',
        downloadSelected:'Baixar selecionados',
        exportList:'Exportar lista',
        fileName:'Nome do arquivo',
        type:'Tipo',
        size:'Tamanho',
        status:'Status',
        log:'Log',
        clearLog:'Limpar log',
        emptyDesc:'Insira uma URL e inicie o rastreamento. Arquivos encontrados serão listados aqui.',
        crawlStarted:'Rastreamento iniciado',
        crawlStopped:'Rastreamento parado',
        crawlDone:'Rastreamento concluído',
        downloadStarted:'Download iniciado',
        downloadDone:'Download concluído',
        downloadError:'Erro no download',
        invalidUrl:'URL inválida',
        listExported:'Lista copiada para a área de transferência'
      }
    };

    function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }
    const locale = ref(getLocale());
    function t(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
    function onLocaleChanged() { locale.value = getLocale(); }
    window.addEventListener('locale-changed', onLocaleChanged);
    onUnmounted(() => window.removeEventListener('locale-changed', onLocaleChanged));

    /* ── Auth ── */
    function getToken() { return localStorage.getItem('auth_token') || ''; }
    function authHeaders() { return { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }

    /* ── State ── */
    const config = reactive({
      url: '',
      maxDepth: 3,
      maxPages: 100,
      maxFileSize: 0,
      sameDomain: true,
      filters: [],
      urlPattern: '',
      savePath: 'downloads/web'
    });

    const crawling = ref(false);
    const downloading = ref(false);
    const results = ref([]);
    const logs = ref([]);
    const progress = reactive({ scanned: 0, total: 0, downloaded: 0, errors: 0, currentDepth: 0 });
    const currentPage = ref(1);
    const pageSize = 50;
    let crawlAbort = null;

    /* ── Computed ── */
    const pagedResults = computed(() => {
      const start = (currentPage.value - 1) * pageSize;
      return results.value.slice(start, start + pageSize);
    });

    const selectedCount = computed(() => results.value.filter(r => r.selected).length);
    const selectAll = ref(false);
    const isIndeterminate = computed(() => {
      const sel = selectedCount.value;
      return sel > 0 && sel < results.value.length;
    });

    const progressPercent = computed(() => {
      if (progress.total === 0) return 0;
      return Math.round((progress.downloaded / progress.total) * 100);
    });

    /* ── Helpers ── */
    function addLog(msg, type = 'info') {
      const now = new Date();
      const time = now.toLocaleTimeString();
      logs.value.push({ msg, type, time });
      if (logs.value.length > 200) logs.value.splice(0, 50);
    }

    function classifyUrl(url) {
      const ext = (url.split('?')[0].split('#')[0].split('.').pop() || '').toLowerCase();
      const imageExts = ['jpg','jpeg','png','gif','webp','svg','ico','bmp','tiff','avif'];
      const mediaExts = ['mp3','mp4','avi','mkv','webm','ogg','wav','flac','m4a','mov','wmv'];
      const textExts = ['txt','csv','xml','json','md','log','ini','cfg','yaml','yml'];
      const archiveExts = ['zip','rar','7z','tar','gz','bz2','xz'];
      if (imageExts.includes(ext)) return 'images';
      if (mediaExts.includes(ext)) return 'media';
      if (textExts.includes(ext)) return 'text';
      if (ext === 'pdf') return 'pdf';
      if (archiveExts.includes(ext)) return 'archives';
      return 'html';
    }

    function extractFileName(url) {
      try {
        const u = new URL(url);
        const parts = u.pathname.split('/').filter(Boolean);
        if (parts.length) {
          const last = parts[parts.length - 1];
          if (last.includes('.')) return decodeURIComponent(last);
          return decodeURIComponent(last) + '.html';
        }
        return u.hostname + '.html';
      } catch { return 'page.html'; }
    }

    function formatSize(bytes) {
      if (!bytes) return '';
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function matchesFilter(type) {
      if (!config.filters.length) return true;
      return config.filters.includes(type);
    }

    function matchesPattern(url) {
      if (!config.urlPattern.trim()) return true;
      try {
        const pattern = config.urlPattern.replace(/\*/g, '.*');
        return new RegExp(pattern).test(new URL(url).pathname);
      } catch { return true; }
    }

    /* ── Crawl ── */
    async function startCrawl() {
      const urlStr = config.url.trim();
      if (!urlStr) return;

      // Validate URL
      let baseUrl;
      try {
        baseUrl = new URL(urlStr.startsWith('http') ? urlStr : 'https://' + urlStr);
      } catch {
        ElMessage.error(t('invalidUrl'));
        return;
      }

      config.url = baseUrl.href;
      crawling.value = true;
      results.value = [];
      progress.scanned = 0;
      progress.total = 0;
      progress.downloaded = 0;
      progress.errors = 0;
      progress.currentDepth = 0;
      currentPage.value = 1;

      crawlAbort = new AbortController();
      addLog(t('crawlStarted') + ': ' + baseUrl.href, 'info');
      ElMessage.info(t('crawlStarted'));

      try {
        const res = await fetch('/api/web-downloader/crawl', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            url: baseUrl.href,
            maxDepth: config.maxDepth,
            maxPages: config.maxPages,
            sameDomain: config.sameDomain,
            filters: config.filters,
            urlPattern: config.urlPattern
          }),
          signal: crawlAbort.signal
        });

        const data = await res.json();
        if (!res.ok) {
          addLog(data.error || 'Crawl failed', 'error');
          ElMessage.error(data.error || 'Crawl failed');
          crawling.value = false;
          return;
        }

        // Process found resources
        if (data.resources && data.resources.length) {
          results.value = data.resources.map(r => ({
            url: r.url,
            fileName: r.fileName || extractFileName(r.url),
            type: r.type || classifyUrl(r.url),
            size: r.size || null,
            sizeStr: r.size ? formatSize(r.size) : '',
            depth: r.depth || 0,
            status: 'pending',
            selected: true,
            error: null
          }));
          progress.total = results.value.length;
          progress.scanned = data.pagesScanned || 0;
          progress.currentDepth = data.maxDepthReached || 0;
        }

        addLog(t('crawlDone') + ` — ${results.value.length} ${t('found')}`, 'success');
        ElMessage.success(t('crawlDone'));
      } catch (e) {
        if (e.name === 'AbortError') {
          addLog(t('crawlStopped'), 'warning');
        } else {
          addLog(e.message, 'error');
          ElMessage.error(e.message);
        }
      } finally {
        crawling.value = false;
      }
    }

    function stopCrawl() {
      if (crawlAbort) {
        crawlAbort.abort();
        crawlAbort = null;
      }
      crawling.value = false;
      addLog(t('crawlStopped'), 'warning');
      ElMessage.warning(t('crawlStopped'));
    }

    function clearResults() {
      results.value = [];
      progress.scanned = 0;
      progress.total = 0;
      progress.downloaded = 0;
      progress.errors = 0;
      progress.currentDepth = 0;
      logs.value = [];
    }

    /* ── Download ── */
    async function downloadSelected() {
      const items = results.value.filter(r => r.selected && r.status !== 'done');
      if (!items.length) return;

      downloading.value = true;
      addLog(t('downloadStarted') + ` (${items.length})`, 'info');

      try {
        const res = await fetch('/api/web-downloader/download', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            files: items.map(it => ({ url: it.url, fileName: it.fileName })),
            savePath: config.savePath,
            maxFileSize: config.maxFileSize || 0
          })
        });

        const data = await res.json();
        if (!res.ok) {
          addLog(data.error || 'Download failed', 'error');
          ElMessage.error(data.error || 'Download failed');
          downloading.value = false;
          return;
        }

        // Update statuses
        if (data.results) {
          data.results.forEach(dr => {
            const item = results.value.find(r => r.url === dr.url);
            if (item) {
              item.status = dr.success ? 'done' : 'error';
              item.error = dr.error || null;
              item.sizeStr = dr.size ? formatSize(dr.size) : item.sizeStr;
              if (dr.success) progress.downloaded++;
              else progress.errors++;
            }
          });
        }

        addLog(t('downloadDone'), 'success');
        ElMessage.success(t('downloadDone'));
      } catch (e) {
        addLog(e.message, 'error');
        ElMessage.error(e.message);
      } finally {
        downloading.value = false;
      }
    }

    /* ── Select ── */
    function toggleSelectAll(val) {
      results.value.forEach(r => { r.selected = val; });
    }

    /* ── Export ── */
    function exportList() {
      const text = results.value.map(r => r.url).join('\n');
      navigator.clipboard.writeText(text).then(() => {
        ElMessage.success(t('listExported'));
        addLog(t('listExported'), 'info');
      });
    }

    return {
      t, config, crawling, downloading, results, logs, progress,
      currentPage, pageSize, pagedResults, selectedCount, selectAll,
      isIndeterminate, progressPercent,
      startCrawl, stopCrawl, clearResults, downloadSelected,
      toggleSelectAll, exportList
    };
  }
})
