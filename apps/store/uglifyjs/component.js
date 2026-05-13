({
  setup() {
    const { ref, computed, reactive, onMounted, onUnmounted, watch } = Vue;
    const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success(){}, error(){}, warning(){}, info(){} };

    // ── i18n ──
    const LANGS = {
      tr: {
        title: 'UglifyJS',
        selectFile: 'Kaynak Dosya Seç',
        selectOutput: 'Çıktı Konumu',
        minify: 'Küçült',
        minifying: 'Küçültülüyor…',
        preview: 'Önizleme',
        original: 'Orijinal',
        minified: 'Küçültülmüş',
        saved: 'Kazanç',
        outputPath: 'Çıktı Yolu',
        noFile: 'Lütfen bir JS dosyası seçin',
        success: 'Dosya başarıyla küçültüldü!',
        error: 'Küçültme hatası',
        reduction: 'küçülme',
        // Options
        options: 'Seçenekler',
        compress: 'Sıkıştır',
        mangle: 'İsim Değiştir',
        output: 'Çıktı',
        advanced: 'Gelişmiş',
        enabled: 'Etkin',
        disabled: 'Devre Dışı',
        // Compress
        dropConsole: 'console.* kaldır',
        dropDebugger: 'debugger kaldır',
        deadCode: 'Ölü kod temizle',
        unused: 'Kullanılmayan kaldır',
        conditionals: 'Koşulları optimize et',
        sequences: 'Ardışık ifadeleri birleştir',
        booleans: 'Boolean optimizasyonu',
        loops: 'Döngü optimizasyonu',
        passes: 'Geçiş sayısı',
        toplevel: 'Üst düzey değişkenler',
        pureFuncs: 'Saf fonksiyonlar (virgülle)',
        globalDefs: 'Global tanımlar',
        unsafe: 'Güvensiz dönüşümler',
        // Mangle
        mangleEnabled: 'İsim değiştir',
        mangleEval: 'eval kapsamında',
        mangleToplevel: 'Üst düzey isimler',
        reserved: 'Korunan isimler (virgülle)',
        mangleProps: 'Özellik isimleri',
        keepQuoted: 'Tırnaklıları koru',
        propsRegex: 'Regex filtresi',
        propsReserved: 'Korunan özellikler',
        // Output
        beautify: 'Güzelleştir',
        semicolons: 'Noktalı virgüller',
        comments: 'Yorumlar',
        commentsNone: 'Hiçbiri',
        commentsAll: 'Tümü',
        commentsSome: 'Lisanslı',
        quoteStyle: 'Tırnak stili',
        quoteAuto: 'Otomatik',
        quoteSingle: 'Tek',
        quoteDouble: 'Çift',
        quoteOriginal: 'Orijinal',
        indentLevel: 'Girinti düzeyi',
        maxLineLen: 'Maks. satır uzunluğu',
        wrapIife: 'IIFE kapsülle',
        preamble: 'Başlık (lisans vb.)',
        asciiOnly: 'Sadece ASCII',
        // Advanced
        keepFnames: 'Fonksiyon isimlerini koru',
        keepFargs: 'Fonksiyon argümanlarını koru',
        moduleMode: 'ES modül modu',
        ieCompat: 'IE uyumluluğu',
        webkitCompat: 'WebKit uyumluluğu',
        v8Compat: 'V8 uyumluluğu',
        sourceMap: 'Kaynak harita (inline)',
        // File
        supportedTypes: 'Desteklenen: .js dosyaları',
        autoOutput: 'Otomatik (.min.js)',
        customOutput: 'Özel konum seç',
        warnings: 'Uyarılar',
        previewResult: 'Önizle',
        parseError: 'Ayrıştırma hatası',
        line: 'Satır',
        col: 'Sütun'
      },
      en: {
        title: 'UglifyJS',
        selectFile: 'Select Source File',
        selectOutput: 'Output Location',
        minify: 'Minify',
        minifying: 'Minifying…',
        preview: 'Preview',
        original: 'Original',
        minified: 'Minified',
        saved: 'Saved',
        outputPath: 'Output Path',
        noFile: 'Please select a JS file',
        success: 'File minified successfully!',
        error: 'Minification error',
        reduction: 'reduction',
        options: 'Options',
        compress: 'Compress',
        mangle: 'Mangle',
        output: 'Output',
        advanced: 'Advanced',
        enabled: 'Enabled',
        disabled: 'Disabled',
        dropConsole: 'Drop console.*',
        dropDebugger: 'Drop debugger',
        deadCode: 'Remove dead code',
        unused: 'Drop unused',
        conditionals: 'Optimize conditionals',
        sequences: 'Join sequences',
        booleans: 'Boolean optimizations',
        loops: 'Loop optimizations',
        passes: 'Passes',
        toplevel: 'Top-level variables',
        pureFuncs: 'Pure functions (comma-sep)',
        globalDefs: 'Global definitions',
        unsafe: 'Unsafe transforms',
        mangleEnabled: 'Mangle names',
        mangleEval: 'Mangle in eval scope',
        mangleToplevel: 'Top-level names',
        reserved: 'Reserved names (comma-sep)',
        mangleProps: 'Mangle properties',
        keepQuoted: 'Keep quoted',
        propsRegex: 'Regex filter',
        propsReserved: 'Reserved properties',
        beautify: 'Beautify',
        semicolons: 'Semicolons',
        comments: 'Comments',
        commentsNone: 'None',
        commentsAll: 'All',
        commentsSome: 'Licensed',
        quoteStyle: 'Quote style',
        quoteAuto: 'Auto',
        quoteSingle: 'Single',
        quoteDouble: 'Double',
        quoteOriginal: 'Original',
        indentLevel: 'Indent level',
        maxLineLen: 'Max line length',
        wrapIife: 'Wrap IIFE',
        preamble: 'Preamble (license etc.)',
        asciiOnly: 'ASCII only',
        keepFnames: 'Keep function names',
        keepFargs: 'Keep function arguments',
        moduleMode: 'ES module mode',
        ieCompat: 'IE compatibility',
        webkitCompat: 'WebKit compatibility',
        v8Compat: 'V8 compatibility',
        sourceMap: 'Source map (inline)',
        supportedTypes: 'Supported: .js files',
        autoOutput: 'Automatic (.min.js)',
        customOutput: 'Choose custom location',
        warnings: 'Warnings',
        previewResult: 'Preview',
        parseError: 'Parse error',
        line: 'Line',
        col: 'Column'
      }
    };

    LANGS.de = { ...LANGS.en, title: 'UglifyJS', selectFile: 'Quelldatei wählen', minify: 'Minimieren', success: 'Datei erfolgreich minimiert!', error: 'Minimierungsfehler', options: 'Optionen', compress: 'Komprimieren', mangle: 'Verschleiern', output: 'Ausgabe', advanced: 'Erweitert' };
    LANGS.fr = { ...LANGS.en, title: 'UglifyJS', selectFile: 'Sélectionner le fichier', minify: 'Minifier', success: 'Fichier minifié avec succès!', error: 'Erreur de minification', options: 'Options', compress: 'Compresser', mangle: 'Obscurcir', output: 'Sortie', advanced: 'Avancé' };
    LANGS.es = { ...LANGS.en, title: 'UglifyJS', selectFile: 'Seleccionar archivo', minify: 'Minificar', success: '¡Archivo minificado exitosamente!', error: 'Error de minificación', options: 'Opciones', compress: 'Comprimir', mangle: 'Ofuscar', output: 'Salida', advanced: 'Avanzado' };
    LANGS.ru = { ...LANGS.en, title: 'UglifyJS', selectFile: 'Выбрать файл', minify: 'Минифицировать', success: 'Файл успешно минифицирован!', error: 'Ошибка минификации', options: 'Параметры', compress: 'Сжатие', mangle: 'Обфускация', output: 'Вывод', advanced: 'Расширенные' };
    LANGS.zh = { ...LANGS.en, title: 'UglifyJS', selectFile: '选择源文件', minify: '压缩', success: '文件压缩成功！', error: '压缩错误', options: '选项', compress: '压缩', mangle: '混淆', output: '输出', advanced: '高级' };
    LANGS.ja = { ...LANGS.en, title: 'UglifyJS', selectFile: 'ソースファイル選択', minify: '圧縮', success: 'ファイルの圧縮に成功しました！', error: '圧縮エラー', options: 'オプション', compress: '圧縮', mangle: '難読化', output: '出力', advanced: '詳細' };
    LANGS.it = { ...LANGS.en, title: 'UglifyJS', selectFile: 'Seleziona file', minify: 'Minimizza', success: 'File minimizzato con successo!', error: 'Errore di minimizzazione', options: 'Opzioni', compress: 'Comprimi', mangle: 'Offusca', output: 'Output', advanced: 'Avanzato' };
    LANGS.ar = { ...LANGS.en, title: 'UglifyJS', selectFile: 'اختر الملف', minify: 'تصغير', success: 'تم تصغير الملف بنجاح!', error: 'خطأ في التصغير', options: 'الخيارات', compress: 'ضغط', mangle: 'تشويش', output: 'الإخراج', advanced: 'متقدم' };
    LANGS.ko = { ...LANGS.en, title: 'UglifyJS', selectFile: '소스 파일 선택', minify: '압축', success: '파일이 성공적으로 압축되었습니다!', error: '압축 오류', options: '옵션', compress: '압축', mangle: '난독화', output: '출력', advanced: '고급' };
    LANGS.hi = { ...LANGS.en, title: 'UglifyJS', selectFile: 'स्रोत फ़ाइल चुनें', minify: 'छोटा करें', success: 'फ़ाइल सफलतापूर्वक छोटी की गई!', error: 'छोटा करने में त्रुटि', options: 'विकल्प', compress: 'संपीड़ित', mangle: 'अस्पष्ट', output: 'आउटपुट', advanced: 'उन्नत' };
    LANGS.pt = { ...LANGS.en, title: 'UglifyJS', selectFile: 'Selecionar arquivo', minify: 'Minificar', success: 'Arquivo minificado com sucesso!', error: 'Erro de minificação', options: 'Opções', compress: 'Comprimir', mangle: 'Ofuscar', output: 'Saída', advanced: 'Avançado' };

    function getLocale() { return localStorage.getItem('sys_locale') || 'tr'; }
    var locale = ref(getLocale());
    var t = function(k) { return (LANGS[locale.value] && LANGS[locale.value][k]) || LANGS.en[k] || k; };
    function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

    // ── Auth ──
    function getToken() { return localStorage.getItem('auth_token'); }
    function authHeaders() { return { Authorization: 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }

    // ── State ──
    var selectedFile = ref(null);    // { path, name, size }
    var outputMode = ref('auto');    // 'auto' or 'custom'
    var customOutput = ref('');
    var loading = ref(false);
    var result = ref(null);
    var errorInfo = ref(null);
    var activeTab = ref('compress');

    var FILE_FILTERS = [
      { label: 'JavaScript', extensions: ['.js'] },
      { label: 'All Files', extensions: ['*'] }
    ];

    // ── Options ──
    var compressEnabled = ref(true);
    var compressOpts = reactive({
      dead_code: true,
      drop_console: false,
      drop_debugger: true,
      unused: true,
      conditionals: true,
      sequences: true,
      booleans: true,
      loops: true,
      passes: 1,
      toplevel: false,
      pure_funcs: '',
      unsafe: false
    });

    var mangleEnabled = ref(true);
    var mangleOpts = reactive({
      eval: false,
      toplevel: false,
      reserved: '',
      properties: false,
      keep_quoted: false,
      props_regex: '',
      props_reserved: ''
    });

    var outputOpts = reactive({
      beautify: false,
      semicolons: true,
      comments: false,
      quote_style: 0,
      indent_level: 4,
      max_line_len: 0,
      wrap_iife: false,
      preamble: '',
      ascii_only: false
    });

    var advancedOpts = reactive({
      keep_fnames: false,
      keep_fargs: false,
      module: false,
      ie: false,
      webkit: false,
      v8: false,
      sourceMap: false
    });

    // ── Computed ──
    var savedBytes = computed(function() {
      if (!result.value) return 0;
      return result.value.originalSize - result.value.minifiedSize;
    });
    var savedPercent = computed(function() {
      if (!result.value || result.value.originalSize === 0) return 0;
      return ((savedBytes.value / result.value.originalSize) * 100).toFixed(1);
    });

    // ── Build options object for API ──
    function buildOptions() {
      var opts = {};

      // Compress
      if (!compressEnabled.value) {
        opts.compress = false;
      } else {
        opts.compress = {
          dead_code: compressOpts.dead_code,
          drop_console: compressOpts.drop_console,
          drop_debugger: compressOpts.drop_debugger,
          unused: compressOpts.unused,
          conditionals: compressOpts.conditionals,
          sequences: compressOpts.sequences,
          booleans: compressOpts.booleans,
          loops: compressOpts.loops,
          passes: compressOpts.passes,
          toplevel: compressOpts.toplevel,
          unsafe: compressOpts.unsafe
        };
        if (compressOpts.pure_funcs.trim()) {
          opts.compress.pure_funcs = compressOpts.pure_funcs.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
        }
      }

      // Mangle
      if (!mangleEnabled.value) {
        opts.mangle = false;
      } else {
        opts.mangle = {
          eval: mangleOpts.eval,
          toplevel: mangleOpts.toplevel
        };
        if (mangleOpts.reserved.trim()) {
          opts.mangle.reserved = mangleOpts.reserved.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
        }
        if (mangleOpts.properties) {
          opts.mangle.properties = {
            keep_quoted: mangleOpts.keep_quoted
          };
          if (mangleOpts.props_regex.trim()) {
            opts.mangle.properties.regex = mangleOpts.props_regex.trim();
          }
          if (mangleOpts.props_reserved.trim()) {
            opts.mangle.properties.reserved = mangleOpts.props_reserved.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
          }
        }
      }

      // Output
      opts.output = {
        beautify: outputOpts.beautify,
        semicolons: outputOpts.semicolons,
        comments: outputOpts.comments,
        quote_style: outputOpts.quote_style,
        wrap_iife: outputOpts.wrap_iife,
        ascii_only: outputOpts.ascii_only
      };
      if (outputOpts.beautify) {
        opts.output.indent_level = outputOpts.indent_level;
      }
      if (outputOpts.max_line_len > 0) {
        opts.output.max_line_len = outputOpts.max_line_len;
      }
      if (outputOpts.preamble.trim()) {
        opts.output.preamble = outputOpts.preamble;
      }

      // Advanced
      opts.keep_fnames = advancedOpts.keep_fnames;
      opts.keep_fargs = advancedOpts.keep_fargs;
      opts.module = advancedOpts.module;
      opts.ie = advancedOpts.ie;
      opts.webkit = advancedOpts.webkit;
      opts.v8 = advancedOpts.v8;
      opts.sourceMap = advancedOpts.sourceMap;

      return opts;
    }

    // ── File Selection ──
    async function openFile() {
      if (!window.FileDialog) { ElMessage.error('FileDialog not available'); return; }
      var res = await window.FileDialog.open({ title: t('selectFile'), filters: FILE_FILTERS });
      if (!res) return;
      var ext = '.' + (res.name || '').split('.').pop().toLowerCase();
      if (ext !== '.js') {
        ElMessage.warning(t('supportedTypes'));
        return;
      }
      selectedFile.value = { path: res.path, name: res.name, size: (res.content || '').length };
      result.value = null;
      errorInfo.value = null;
    }

    async function chooseOutput() {
      if (!window.FileDialog) { ElMessage.error('FileDialog not available'); return; }
      var defaultName = 'output.min.js';
      if (selectedFile.value) {
        var base = selectedFile.value.name.replace(/\.js$/i, '');
        defaultName = base + '.min.js';
      }
      var res = await window.FileDialog.save({ title: t('selectOutput'), defaultName: defaultName, filters: FILE_FILTERS });
      if (!res) return;
      customOutput.value = res.path;
      outputMode.value = 'custom';
    }

    // ── Minify ──
    async function minifyFile() {
      if (!selectedFile.value) { ElMessage.warning(t('noFile')); return; }
      loading.value = true;
      result.value = null;
      errorInfo.value = null;
      try {
        var body = {
          filePath: selectedFile.value.path,
          options: buildOptions()
        };
        if (outputMode.value === 'custom' && customOutput.value) {
          body.outputPath = customOutput.value;
        }
        var resp = await fetch('/api/uglifyjs/minify', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(body)
        });
        var data = await resp.json();
        if (!resp.ok) throw new Error(data.error || t('error'));
        if (data.ok === false) {
          errorInfo.value = { message: data.error, line: data.line, col: data.col };
          ElMessage.error(data.error || t('error'));
        } else {
          result.value = {
            originalSize: data.originalSize,
            minifiedSize: data.minifiedSize,
            outputPath: data.outputPath,
            warnings: data.warnings || []
          };
          ElMessage.success(t('success'));
        }
      } catch (e) {
        ElMessage.error(e.message || t('error'));
      }
      loading.value = false;
    }

    // ── Helpers ──
    function formatSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    // ── Lifecycle ──
    onMounted(function() {
      window.addEventListener('locale-changed', onLocaleChanged);
    });
    onUnmounted(function() {
      window.removeEventListener('locale-changed', onLocaleChanged);
    });

    return {
      locale, t,
      selectedFile, outputMode, customOutput, loading, result, errorInfo,
      activeTab,
      compressEnabled, compressOpts,
      mangleEnabled, mangleOpts,
      outputOpts, advancedOpts,
      savedBytes, savedPercent,
      openFile, chooseOutput, minifyFile,
      formatSize
    };
  }
})