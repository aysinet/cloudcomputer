({
  setup() {
    var ref = Vue.ref, computed = Vue.computed, watch = Vue.watch, onMounted = Vue.onMounted, onUnmounted = Vue.onUnmounted, nextTick = Vue.nextTick;
    var ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success:function(){}, error:function(){}, warning:function(){}, info:function(){} };

    var LANGS = {
      tr: {
        openLocal:'Yerel Dosya Aç', openServer:'Sunucudan Aç', save:'Kaydet', saveAs:'Farklı Kaydet', saveLocal:'Yerel Olarak İndir',
        uploadToServer:'Sunucuya Yükle', goTo:'Git', columns:'Sütun', findNext:'Sonraki', findPrev:'Önceki', noMatch:'Bulunamadı',
        offset:'Ofset', value:'Değer', bytes:'bayt', modified:'Değiştirildi', localFile:'Yerel Dosya',
        dropOrOpen:'Bir dosya sürükleyin veya açın', dropOrOpenSub:'Yerel bilgisayardan veya sunucudan dosya seçebilirsiniz',
        dropFile:'Dosyayı buraya bırakın', saved:'Kaydedildi', uploaded:'Sunucuya yüklendi', goToPrompt:'Offset girin (hex: 0x1A veya ondalık: 26)',
        fileTooLarge:'Dosya çok büyük (maks. 16 MB)', uploadTitle:'Sunucuya Yükle'
      },
      en: {
        openLocal:'Open Local File', openServer:'Open from Server', save:'Save', saveAs:'Save As', saveLocal:'Download Locally',
        uploadToServer:'Upload to Server', goTo:'Go To', columns:'Columns', findNext:'Next', findPrev:'Prev', noMatch:'No match',
        offset:'Offset', value:'Value', bytes:'bytes', modified:'Modified', localFile:'Local File',
        dropOrOpen:'Drop a file or open one', dropOrOpenSub:'Select a file from your computer or from the server',
        dropFile:'Drop file here', saved:'Saved', uploaded:'Uploaded to server', goToPrompt:'Enter offset (hex: 0x1A or decimal: 26)',
        fileTooLarge:'File too large (max 16 MB)', uploadTitle:'Upload to Server'
      },
      de: {
        openLocal:'Lokale Datei öffnen', openServer:'Vom Server öffnen', save:'Speichern', saveAs:'Speichern unter', saveLocal:'Lokal herunterladen',
        uploadToServer:'Auf Server hochladen', goTo:'Gehe zu', columns:'Spalten', findNext:'Nächste', findPrev:'Vorherige', noMatch:'Nicht gefunden',
        offset:'Offset', value:'Wert', bytes:'Bytes', modified:'Geändert', localFile:'Lokale Datei',
        dropOrOpen:'Datei hierhin ziehen oder öffnen', dropOrOpenSub:'Datei vom Computer oder Server auswählen',
        dropFile:'Datei hier ablegen', saved:'Gespeichert', uploaded:'Auf Server hochgeladen', goToPrompt:'Offset eingeben (hex: 0x1A oder dezimal: 26)',
        fileTooLarge:'Datei zu groß (max 16 MB)', uploadTitle:'Auf Server hochladen'
      },
      fr: {
        openLocal:'Ouvrir un fichier local', openServer:'Ouvrir depuis le serveur', save:'Enregistrer', saveAs:'Enregistrer sous', saveLocal:'Télécharger localement',
        uploadToServer:'Téléverser', goTo:'Aller à', columns:'Colonnes', findNext:'Suivant', findPrev:'Précédent', noMatch:'Aucun résultat',
        offset:'Offset', value:'Valeur', bytes:'octets', modified:'Modifié', localFile:'Fichier local',
        dropOrOpen:'Glissez un fichier ou ouvrez-en un', dropOrOpenSub:'Sélectionnez un fichier depuis votre ordinateur ou le serveur',
        dropFile:'Déposez le fichier ici', saved:'Enregistré', uploaded:'Téléversé sur le serveur', goToPrompt:'Entrez l\'offset (hex: 0x1A ou décimal: 26)',
        fileTooLarge:'Fichier trop volumineux (max 16 Mo)', uploadTitle:'Téléverser sur le serveur'
      },
      es: {
        openLocal:'Abrir archivo local', openServer:'Abrir del servidor', save:'Guardar', saveAs:'Guardar como', saveLocal:'Descargar localmente',
        uploadToServer:'Subir al servidor', goTo:'Ir a', columns:'Columnas', findNext:'Siguiente', findPrev:'Anterior', noMatch:'Sin resultados',
        offset:'Offset', value:'Valor', bytes:'bytes', modified:'Modificado', localFile:'Archivo local',
        dropOrOpen:'Arrastra un archivo o abre uno', dropOrOpenSub:'Selecciona un archivo de tu computadora o del servidor',
        dropFile:'Suelta el archivo aquí', saved:'Guardado', uploaded:'Subido al servidor', goToPrompt:'Ingresa offset (hex: 0x1A o decimal: 26)',
        fileTooLarge:'Archivo demasiado grande (máx. 16 MB)', uploadTitle:'Subir al servidor'
      }
    };

    LANGS.ru = { ...LANGS.en };
    LANGS.zh = { ...LANGS.en };
    LANGS.ja = { ...LANGS.en };
    LANGS.it = { ...LANGS.en };
    LANGS.ar = { ...LANGS.en };
    LANGS.ko = { ...LANGS.en };
    LANGS.hi = { ...LANGS.en };
    LANGS.pt = { ...LANGS.en };

    function getLocale() { try { return (window.__vueDesktopSettings && window.__vueDesktopSettings.locale) || localStorage.getItem('sys_locale') || 'en'; } catch(e) { return 'en'; } }
    var locale = ref(getLocale());
    function t(key) { return (LANGS[locale.value] || LANGS.en)[key] || (LANGS.en[key] || key); }
    function onLocaleChanged(e) { if (e.detail) locale.value = e.detail; }

    function getToken() { try { return localStorage.getItem('auth_token') || ''; } catch(e) { return ''; } }
    function authHeaders() { return { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }

    var MAX_FILE_SIZE = 16 * 1024 * 1024;
    var ROW_HEIGHT = 22;
    var VISIBLE_BUFFER = 5;

    // State
    var fileData = ref(null);
    var fileName = ref('');
    var currentFilePath = ref('');
    var modified = ref(false);
    var columns = ref(16);
    var selectedOffset = ref(-1);
    var showOpenMenu = ref(false);
    var showSaveMenu = ref(false);
    var showSearch = ref(false);
    var searchType = ref('hex');
    var searchQuery = ref('');
    var searchResults = ref([]);
    var searchIndex = ref(0);
    var dragging = ref(false);
    var gridContainer = ref(null);
    var scrollTop = ref(0);
    var editingOffset = ref(-1);
    var editValue = ref('');
    var editingAsciiOffset = ref(-1);
    var editAsciiValue = ref('');
    var editInput = ref(null);
    var editAsciiInput = ref(null);

    // Undo/redo
    var undoStack = ref([]);
    var redoStack = ref([]);
    var canUndo = computed(function() { return undoStack.value.length > 0; });
    var canRedo = computed(function() { return redoStack.value.length > 0; });

    // Virtual scroll
    var totalRows = computed(function() {
      if (!fileData.value) return 0;
      return Math.ceil(fileData.value.length / columns.value);
    });
    var totalHeight = computed(function() { return totalRows.value * ROW_HEIGHT; });
    var startRow = computed(function() { return Math.max(0, Math.floor(scrollTop.value / ROW_HEIGHT) - VISIBLE_BUFFER); });
    var endRow = computed(function() {
      if (!gridContainer.value) return startRow.value + 40;
      var visible = Math.ceil(gridContainer.value.clientHeight / ROW_HEIGHT) + VISIBLE_BUFFER * 2;
      return Math.min(totalRows.value, startRow.value + visible);
    });
    var offsetY = computed(function() { return startRow.value * ROW_HEIGHT; });

    var visibleRows = computed(function() {
      if (!fileData.value) return [];
      var rows = [];
      for (var i = startRow.value; i < endRow.value; i++) {
        var off = i * columns.value;
        var bytes = [];
        for (var j = 0; j < columns.value; j++) {
          bytes.push(off + j < fileData.value.length ? fileData.value[off + j] : null);
        }
        rows.push({ offset: off, bytes: bytes });
      }
      return rows;
    });

    function onScroll() {
      if (gridContainer.value) scrollTop.value = gridContainer.value.scrollTop;
    }

    function refreshView() {
      scrollTop.value = gridContainer.value ? gridContainer.value.scrollTop : 0;
    }

    // Hex helpers
    function hexByte(v) {
      if (v === null || v === undefined) return '  ';
      return ('0' + (v & 0xFF).toString(16)).slice(-2).toUpperCase();
    }
    function hexOffset(off) {
      return ('00000000' + off.toString(16)).slice(-8).toUpperCase();
    }
    function printableChar(b) {
      return (b >= 32 && b <= 126) ? String.fromCharCode(b) : '.';
    }
    function formatFileSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / 1048576).toFixed(1) + ' MB';
    }
    function getU16LE(offset) {
      if (!fileData.value || offset + 1 >= fileData.value.length) return 0;
      return fileData.value[offset] | (fileData.value[offset + 1] << 8);
    }

    // Selection & classes
    function byteClass(offset, b) {
      var cls = {};
      if (b === null) cls['hex-null'] = true;
      else if (b === 0) cls['hex-zero'] = true;
      else if (b === 0xFF) cls['hex-ff'] = true;
      else if (b >= 32 && b <= 126) cls['hex-printable'] = true;
      if (offset === selectedOffset.value) cls['hex-selected'] = true;
      if (isSearchHighlight(offset)) cls['hex-highlight'] = true;
      if (isModifiedByte(offset)) cls['hex-modified-byte'] = true;
      return cls;
    }
    function asciiClass(offset, b) {
      var cls = {};
      if (b === null) cls['hex-null'] = true;
      if (offset === selectedOffset.value) cls['hex-selected'] = true;
      if (isSearchHighlight(offset)) cls['hex-highlight'] = true;
      return cls;
    }

    function selectByte(offset) {
      if (fileData.value && offset >= 0 && offset < fileData.value.length) {
        selectedOffset.value = offset;
      }
    }

    // Track modified bytes
    var modifiedBytes = ref({});
    function isModifiedByte(offset) { return !!modifiedBytes.value[offset]; }

    // Edit hex
    function startEditHex(offset, b) {
      if (b === null) return;
      editingOffset.value = offset;
      editValue.value = hexByte(b);
      editingAsciiOffset.value = -1;
      nextTick(function() {
        var inp = document.querySelector('.hex-edit-input');
        if (inp) { inp.focus(); inp.select(); }
      });
    }
    function onEditInput(e) {
      var v = e.target.value.replace(/[^0-9a-fA-F]/g, '').toUpperCase().slice(0, 2);
      editValue.value = v;
      e.target.value = v;
    }
    function commitEdit() {
      if (editingOffset.value < 0) return;
      var v = parseInt(editValue.value, 16);
      if (isNaN(v)) { cancelEdit(); return; }
      var off = editingOffset.value;
      var oldVal = fileData.value[off];
      if (v !== oldVal) {
        undoStack.value.push({ offset: off, oldVal: oldVal, newVal: v });
        redoStack.value = [];
        fileData.value[off] = v;
        modifiedBytes.value = Object.assign({}, modifiedBytes.value, {[off]: true});
        modified.value = true;
        fileData.value = new Uint8Array(fileData.value);
      }
      editingOffset.value = -1;
      editValue.value = '';
    }
    function cancelEdit() { editingOffset.value = -1; editValue.value = ''; }

    // Edit ASCII
    function startEditAscii(offset, b) {
      if (b === null) return;
      editingAsciiOffset.value = offset;
      editAsciiValue.value = printableChar(b);
      editingOffset.value = -1;
      nextTick(function() {
        var inp = document.querySelector('.hex-edit-ascii-input');
        if (inp) { inp.focus(); inp.select(); }
      });
    }
    function onAsciiInput(e) {
      var v = e.target.value.slice(-1);
      editAsciiValue.value = v;
      e.target.value = v;
    }
    function commitAsciiEdit() {
      if (editingAsciiOffset.value < 0) return;
      var off = editingAsciiOffset.value;
      var v = editAsciiValue.value.charCodeAt(0);
      if (isNaN(v) || v < 0 || v > 255) { cancelAsciiEdit(); return; }
      var oldVal = fileData.value[off];
      if (v !== oldVal) {
        undoStack.value.push({ offset: off, oldVal: oldVal, newVal: v });
        redoStack.value = [];
        fileData.value[off] = v;
        modifiedBytes.value = Object.assign({}, modifiedBytes.value, {[off]: true});
        modified.value = true;
        fileData.value = new Uint8Array(fileData.value);
      }
      editingAsciiOffset.value = -1;
      editAsciiValue.value = '';
    }
    function cancelAsciiEdit() { editingAsciiOffset.value = -1; editAsciiValue.value = ''; }

    // Undo / Redo
    function undo() {
      if (!undoStack.value.length) return;
      var action = undoStack.value.pop();
      fileData.value[action.offset] = action.oldVal;
      redoStack.value.push(action);
      delete modifiedBytes.value[action.offset];
      modifiedBytes.value = Object.assign({}, modifiedBytes.value);
      fileData.value = new Uint8Array(fileData.value);
      modified.value = undoStack.value.length > 0;
    }
    function redo() {
      if (!redoStack.value.length) return;
      var action = redoStack.value.pop();
      fileData.value[action.offset] = action.newVal;
      undoStack.value.push(action);
      modifiedBytes.value = Object.assign({}, modifiedBytes.value, {[action.offset]: true});
      fileData.value = new Uint8Array(fileData.value);
      modified.value = true;
    }

    // Search
    function isSearchHighlight(offset) {
      if (!searchResults.value.length) return false;
      var cur = searchResults.value[searchIndex.value];
      if (cur === undefined) return false;
      var len = searchType.value === 'hex' ? parseHexSearch().length : searchQuery.value.length;
      return offset >= cur && offset < cur + len;
    }

    function parseHexSearch() {
      return searchQuery.value.trim().split(/\s+/).map(function(h) { return parseInt(h, 16); }).filter(function(v) { return !isNaN(v); });
    }

    function doSearch() {
      if (!fileData.value || !searchQuery.value.trim()) { searchResults.value = []; return; }
      var results = [];
      if (searchType.value === 'hex') {
        var pattern = parseHexSearch();
        if (!pattern.length) { searchResults.value = []; return; }
        for (var i = 0; i <= fileData.value.length - pattern.length; i++) {
          var match = true;
          for (var j = 0; j < pattern.length; j++) {
            if (fileData.value[i + j] !== pattern[j]) { match = false; break; }
          }
          if (match) results.push(i);
        }
      } else {
        var txt = searchQuery.value;
        for (var i2 = 0; i2 <= fileData.value.length - txt.length; i2++) {
          var m = true;
          for (var j2 = 0; j2 < txt.length; j2++) {
            if (fileData.value[i2 + j2] !== txt.charCodeAt(j2)) { m = false; break; }
          }
          if (m) results.push(i2);
        }
      }
      searchResults.value = results;
      searchIndex.value = 0;
      if (results.length) scrollToOffset(results[0]);
    }

    function findNext() {
      doSearch();
      if (!searchResults.value.length) return;
      searchIndex.value = (searchIndex.value + 1) % searchResults.value.length;
      scrollToOffset(searchResults.value[searchIndex.value]);
    }
    function findPrev() {
      doSearch();
      if (!searchResults.value.length) return;
      searchIndex.value = (searchIndex.value - 1 + searchResults.value.length) % searchResults.value.length;
      scrollToOffset(searchResults.value[searchIndex.value]);
    }

    function scrollToOffset(offset) {
      var row = Math.floor(offset / columns.value);
      if (gridContainer.value) {
        gridContainer.value.scrollTop = row * ROW_HEIGHT - gridContainer.value.clientHeight / 2;
      }
      selectedOffset.value = offset;
    }

    function goToOffset() {
      var input = prompt(t('goToPrompt'));
      if (!input) return;
      input = input.trim();
      var offset;
      if (input.startsWith('0x') || input.startsWith('0X')) {
        offset = parseInt(input, 16);
      } else {
        offset = parseInt(input, 10);
      }
      if (isNaN(offset) || offset < 0) return;
      if (fileData.value && offset >= fileData.value.length) offset = fileData.value.length - 1;
      scrollToOffset(offset);
    }

    // File loading
    function loadBuffer(arrayBuffer, name, serverPath) {
      if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
        ElMessage.error(t('fileTooLarge'));
        return;
      }
      fileData.value = new Uint8Array(arrayBuffer);
      fileName.value = name || 'unknown';
      currentFilePath.value = serverPath || '';
      modified.value = false;
      undoStack.value = [];
      redoStack.value = [];
      modifiedBytes.value = {};
      selectedOffset.value = -1;
      searchResults.value = [];
      if (gridContainer.value) gridContainer.value.scrollTop = 0;
      scrollTop.value = 0;
    }

    // Open local file
    function openLocalFile() {
      showOpenMenu.value = false;
      var input = document.createElement('input');
      input.type = 'file';
      input.onchange = function(e) {
        var file = e.target.files[0];
        if (!file) return;
        if (file.size > MAX_FILE_SIZE) { ElMessage.error(t('fileTooLarge')); return; }
        var reader = new FileReader();
        reader.onload = function(ev) {
          loadBuffer(ev.target.result, file.name, '');
        };
        reader.readAsArrayBuffer(file);
      };
      input.click();
    }

    // Open from server (via FileDialog)
    async function openServerFile() {
      showOpenMenu.value = false;
      if (!window.FileDialog) { ElMessage.error('FileDialog not available'); return; }
      var result = await window.FileDialog.open({ title: '📂 ' + t('openServer'), filters: [{ label: 'All Files', extensions: ['*'] }] });
      if (!result) return;
      // Read as binary from server
      try {
        var r = await fetch('/api/fs/read-binary?path=' + encodeURIComponent(result.path), { headers: authHeaders() });
        if (!r.ok) throw new Error('Read failed');
        var data = await r.json();
        var binary = Uint8Array.from(atob(data.content), function(c) { return c.charCodeAt(0); });
        loadBuffer(binary.buffer, data.name, data.path);
      } catch(e) {
        ElMessage.error(e.message || 'Failed to read file');
      }
    }

    // Save to server (current path)
    async function saveToServer() {
      showSaveMenu.value = false;
      if (!currentFilePath.value || !fileData.value) return;
      try {
        var b64 = arrayBufferToBase64(fileData.value);
        var r = await fetch('/api/fs/write-binary', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({ filePath: currentFilePath.value, content: b64 })
        });
        if (!r.ok) throw new Error('Write failed');
        modified.value = false;
        modifiedBytes.value = {};
        undoStack.value = [];
        redoStack.value = [];
        ElMessage.success(t('saved') + ' ✓');
      } catch(e) {
        ElMessage.error(e.message || 'Save failed');
      }
    }

    // Save As on server
    async function saveAsServer() {
      showSaveMenu.value = false;
      if (!fileData.value) return;
      if (!window.FileDialog) { ElMessage.error('FileDialog not available'); return; }
      var result = await window.FileDialog.save({ title: '💾 ' + t('saveAs'), defaultName: fileName.value || 'file.bin', filters: [{ label: 'All Files', extensions: ['*'] }] });
      if (!result) return;
      try {
        var b64 = arrayBufferToBase64(fileData.value);
        var r = await fetch('/api/fs/write-binary', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({ filePath: result.path, content: b64 })
        });
        if (!r.ok) throw new Error('Write failed');
        currentFilePath.value = result.path;
        fileName.value = result.name;
        modified.value = false;
        modifiedBytes.value = {};
        undoStack.value = [];
        redoStack.value = [];
        ElMessage.success(t('saved') + ' ✓');
      } catch(e) {
        ElMessage.error(e.message || 'Save failed');
      }
    }

    // Download locally
    function saveLocal() {
      showSaveMenu.value = false;
      if (!fileData.value) return;
      var blob = new Blob([fileData.value], { type: 'application/octet-stream' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = fileName.value || 'file.bin';
      a.click();
      URL.revokeObjectURL(url);
    }

    // Upload local file to server
    async function uploadToServer() {
      if (!fileData.value || currentFilePath.value) return;
      if (!window.FileDialog) { ElMessage.error('FileDialog not available'); return; }
      var result = await window.FileDialog.save({ title: '⬆️ ' + t('uploadTitle'), defaultName: fileName.value || 'file.bin', filters: [{ label: 'All Files', extensions: ['*'] }] });
      if (!result) return;
      try {
        var b64 = arrayBufferToBase64(fileData.value);
        var r = await fetch('/api/fs/write-binary', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({ filePath: result.path, content: b64 })
        });
        if (!r.ok) throw new Error('Upload failed');
        currentFilePath.value = result.path;
        ElMessage.success(t('uploaded') + ' ✓');
      } catch(e) {
        ElMessage.error(e.message || 'Upload failed');
      }
    }

    function arrayBufferToBase64(uint8) {
      var binary = '';
      var len = uint8.length;
      var chunkSize = 8192;
      for (var i = 0; i < len; i += chunkSize) {
        var chunk = uint8.subarray(i, Math.min(i + chunkSize, len));
        binary += String.fromCharCode.apply(null, chunk);
      }
      return btoa(binary);
    }

    // Menus
    function toggleOpenMenu() { showOpenMenu.value = !showOpenMenu.value; showSaveMenu.value = false; }
    function toggleSaveMenu() { showSaveMenu.value = !showSaveMenu.value; showOpenMenu.value = false; }

    // Drag & Drop
    function onDragEnter(e) { e.preventDefault(); dragging.value = true; }
    function onDragLeave(e) { dragging.value = false; }
    function onDrop(e) {
      e.preventDefault();
      dragging.value = false;
      var file = e.dataTransfer.files[0];
      if (!file) return;
      if (file.size > MAX_FILE_SIZE) { ElMessage.error(t('fileTooLarge')); return; }
      var reader = new FileReader();
      reader.onload = function(ev) { loadBuffer(ev.target.result, file.name, ''); };
      reader.readAsArrayBuffer(file);
    }

    // Click outside dropdown
    function onDocClick(e) {
      if (!e.target.closest('.hex-dropdown-wrap')) {
        showOpenMenu.value = false;
        showSaveMenu.value = false;
      }
    }

    // Keyboard shortcuts
    function onKeyDown(e) {
      if (editingOffset.value >= 0 || editingAsciiOffset.value >= 0) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') { e.preventDefault(); showSearch.value = true; }
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') { e.preventDefault(); goToOffset(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); if (currentFilePath.value) saveToServer(); else saveAsServer(); }
      // Navigate with arrows
      if (!fileData.value) return;
      if (e.key === 'ArrowRight' && selectedOffset.value < fileData.value.length - 1) { e.preventDefault(); selectedOffset.value++; }
      if (e.key === 'ArrowLeft' && selectedOffset.value > 0) { e.preventDefault(); selectedOffset.value--; }
      if (e.key === 'ArrowDown' && selectedOffset.value + columns.value < fileData.value.length) { e.preventDefault(); selectedOffset.value += columns.value; }
      if (e.key === 'ArrowUp' && selectedOffset.value - columns.value >= 0) { e.preventDefault(); selectedOffset.value -= columns.value; }
    }

    watch(searchQuery, function() { doSearch(); });

    onMounted(function() {
      window.addEventListener('localeChanged', onLocaleChanged);
      document.addEventListener('click', onDocClick);
      document.addEventListener('keydown', onKeyDown);
    });
    onUnmounted(function() {
      window.removeEventListener('localeChanged', onLocaleChanged);
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    });

    return {
      t, fileData, fileName, currentFilePath, modified, columns, selectedOffset,
      showOpenMenu, showSaveMenu, showSearch, searchType, searchQuery, searchResults, searchIndex,
      dragging, gridContainer, totalHeight, offsetY, startRow, visibleRows,
      editingOffset, editValue, editInput, editingAsciiOffset, editAsciiValue, editAsciiInput,
      canUndo, canRedo,
      hexByte, hexOffset, printableChar, formatFileSize, getU16LE,
      byteClass, asciiClass, selectByte,
      startEditHex, onEditInput, commitEdit, cancelEdit,
      startEditAscii, onAsciiInput, commitAsciiEdit, cancelAsciiEdit,
      undo, redo, findNext, findPrev, goToOffset,
      openLocalFile, openServerFile, saveToServer, saveAsServer, saveLocal, uploadToServer,
      toggleOpenMenu, toggleSaveMenu, onScroll, refreshView,
      onDragEnter, onDrop, onDragLeave, isSearchHighlight
    };
  }
})
