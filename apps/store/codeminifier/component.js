({
  setup() {
    const { ref, computed, onMounted, onUnmounted } = Vue;
    const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success(){}, error(){}, warning(){}, info(){} };

    // ── i18n ──
    const LANGS = {
      tr: {
        title: 'Kod Küçültücü',
        selectFile: 'Dosya Seç',
        minify: 'Küçült',
        minifying: 'Küçültülüyor…',
        original: 'Orijinal',
        minified: 'Küçültülmüş',
        saved: 'Kazanç',
        outputPath: 'Çıktı Yolu',
        noFile: 'Lütfen bir dosya seçin',
        success: 'Dosya başarıyla küçültüldü!',
        error: 'Küçültme hatası',
        bytes: 'bayt',
        supportedTypes: 'Desteklenen: .js, .css, .html, .htm, .json, .svg, .xml',
        dragHint: 'veya sürükleyip bırakın',
        reduction: 'küçülme',
        fileInfo: 'Dosya Bilgisi',
        name: 'Ad',
        size: 'Boyut',
        type: 'Tür'
      },
      en: {
        title: 'Code Minifier',
        selectFile: 'Select File',
        minify: 'Minify',
        minifying: 'Minifying…',
        original: 'Original',
        minified: 'Minified',
        saved: 'Saved',
        outputPath: 'Output Path',
        noFile: 'Please select a file',
        success: 'File minified successfully!',
        error: 'Minification error',
        bytes: 'bytes',
        supportedTypes: 'Supported: .js, .css, .html, .htm, .json, .svg, .xml',
        dragHint: 'or drag & drop',
        reduction: 'reduction',
        fileInfo: 'File Info',
        name: 'Name',
        size: 'Size',
        type: 'Type'
      }
    };

    function getLocale() { return localStorage.getItem('sys_locale') || 'tr'; }
    var locale = ref(getLocale());
    var t = function(k) { return (LANGS[locale.value] && LANGS[locale.value][k]) || LANGS.en[k] || k; };
    function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

    // ── Auth ──
    function getToken() { return localStorage.getItem('auth_token'); }
    function authHeaders() { return { Authorization: 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }

    // ── State ──
    var selectedFile = ref(null);    // { path, name, size }
    var loading = ref(false);
    var result = ref(null);          // { originalSize, minifiedSize, outputPath }

    var SUPPORTED_EXTS = ['.js', '.css', '.html', '.htm', '.json', '.svg', '.xml'];

    var FILE_FILTERS = [
      { label: 'Web Files', extensions: ['.js', '.css', '.html', '.htm', '.json', '.svg', '.xml'] },
      { label: 'JavaScript', extensions: ['.js'] },
      { label: 'CSS', extensions: ['.css'] },
      { label: 'HTML', extensions: ['.html', '.htm'] },
      { label: 'JSON', extensions: ['.json'] },
      { label: 'SVG', extensions: ['.svg'] },
      { label: 'XML', extensions: ['.xml'] },
      { label: 'All Files', extensions: ['*'] }
    ];

    // ── Computed ──
    var savedBytes = computed(function() {
      if (!result.value) return 0;
      return result.value.originalSize - result.value.minifiedSize;
    });

    var savedPercent = computed(function() {
      if (!result.value || result.value.originalSize === 0) return 0;
      return ((savedBytes.value / result.value.originalSize) * 100).toFixed(1);
    });

    // ── File Selection ──
    async function selectFile() {
      if (!window.FileDialog) { ElMessage.error('FileDialog not available'); return; }
      var res = await window.FileDialog.open({ title: t('selectFile'), filters: FILE_FILTERS });
      if (!res) return;
      var ext = '.' + (res.name || '').split('.').pop().toLowerCase();
      if (SUPPORTED_EXTS.indexOf(ext) === -1) {
        ElMessage.warning(t('supportedTypes'));
        return;
      }
      selectedFile.value = { path: res.path, name: res.name, size: (res.content || '').length };
      result.value = null;
    }

    // ── Minify ──
    async function minifyFile() {
      if (!selectedFile.value) { ElMessage.warning(t('noFile')); return; }
      loading.value = true;
      result.value = null;
      try {
        var resp = await fetch('/api/minify', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ filePath: selectedFile.value.path })
        });
        var data = await resp.json();
        if (!resp.ok) throw new Error(data.error || t('error'));
        result.value = {
          originalSize: data.originalSize,
          minifiedSize: data.minifiedSize,
          outputPath: data.outputPath
        };
        ElMessage.success(t('success'));
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

    function getFileIcon(name) {
      if (!name) return '📄';
      var ext = name.split('.').pop().toLowerCase();
      var icons = { js: '🟨', css: '🎨', html: '🌐', htm: '🌐', json: '📋', svg: '🖼️', xml: '📰' };
      return icons[ext] || '📄';
    }

    // ── Lifecycle ──
    onMounted(function() {
      window.addEventListener('locale-changed', onLocaleChanged);
    });
    onUnmounted(function() {
      window.removeEventListener('locale-changed', onLocaleChanged);
    });

    return {
      locale, t, selectedFile, loading, result,
      savedBytes, savedPercent,
      selectFile, minifyFile, formatSize, getFileIcon
    };
  }
})