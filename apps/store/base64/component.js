({
  setup() {
    const { ref, computed, watch } = Vue;

    const LANGS = {
      tr: {
        title: 'Base64 Kodlayıcı',
        encode: 'Kodla',
        decode: 'Çöz',
        input: 'Giriş',
        output: 'Çıkış',
        inputPlaceholder: 'Kodlamak veya çözmek istediğiniz metni buraya yazın...',
        outputPlaceholder: 'Sonuç burada görünecek...',
        copy: 'Kopyala',
        clear: 'Temizle',
        paste: 'Yapıştır',
        swap: 'Değiştir',
        copied: 'Kopyalandı!',
        error: 'Hata',
        invalidBase64: 'Geçersiz Base64 metni',
        charCount: 'Karakter',
        lineCount: 'Satır',
        byteSize: 'Boyut',
        urlSafe: 'URL Güvenli',
        fileMode: 'Dosya',
        textMode: 'Metin',
        dropFile: 'Dosyayı sürükleyin veya tıklayın',
        fileName: 'Dosya',
        fileSize: 'Boyut',
        download: 'İndir',
        encodedSize: 'Kodlanmış Boyut'
      },
      en: {
        title: 'Base64 Encoder',
        encode: 'Encode',
        decode: 'Decode',
        input: 'Input',
        output: 'Output',
        inputPlaceholder: 'Enter text to encode or decode...',
        outputPlaceholder: 'Result will appear here...',
        copy: 'Copy',
        clear: 'Clear',
        paste: 'Paste',
        swap: 'Swap',
        copied: 'Copied!',
        error: 'Error',
        invalidBase64: 'Invalid Base64 text',
        charCount: 'Characters',
        lineCount: 'Lines',
        byteSize: 'Size',
        urlSafe: 'URL Safe',
        fileMode: 'File',
        textMode: 'Text',
        dropFile: 'Drop a file or click to select',
        fileName: 'File',
        fileSize: 'Size',
        download: 'Download',
        encodedSize: 'Encoded Size'
      },
      de: {
        title: 'Base64 Kodierer',
        encode: 'Kodieren',
        decode: 'Dekodieren',
        input: 'Eingabe',
        output: 'Ausgabe',
        inputPlaceholder: 'Text zum Kodieren oder Dekodieren eingeben...',
        outputPlaceholder: 'Ergebnis wird hier angezeigt...',
        copy: 'Kopieren',
        clear: 'Löschen',
        paste: 'Einfügen',
        swap: 'Tauschen',
        copied: 'Kopiert!',
        error: 'Fehler',
        invalidBase64: 'Ungültiger Base64-Text',
        charCount: 'Zeichen',
        lineCount: 'Zeilen',
        byteSize: 'Größe',
        urlSafe: 'URL-sicher',
        fileMode: 'Datei',
        textMode: 'Text',
        dropFile: 'Datei hierher ziehen oder klicken',
        fileName: 'Datei',
        fileSize: 'Größe',
        download: 'Herunterladen',
        encodedSize: 'Kodierte Größe'
      },
      fr: {
        title: 'Base64 Encodeur',
        encode: 'Encoder',
        decode: 'Décoder',
        input: 'Entrée',
        output: 'Sortie',
        inputPlaceholder: 'Entrez le texte à encoder ou décoder...',
        outputPlaceholder: 'Le résultat apparaîtra ici...',
        copy: 'Copier',
        clear: 'Effacer',
        paste: 'Coller',
        swap: 'Échanger',
        copied: 'Copié!',
        error: 'Erreur',
        invalidBase64: 'Texte Base64 invalide',
        charCount: 'Caractères',
        lineCount: 'Lignes',
        byteSize: 'Taille',
        urlSafe: 'URL sûr',
        fileMode: 'Fichier',
        textMode: 'Texte',
        dropFile: 'Déposez un fichier ou cliquez',
        fileName: 'Fichier',
        fileSize: 'Taille',
        download: 'Télécharger',
        encodedSize: 'Taille encodée'
      }
    };

    LANGS.es = { ...LANGS.en, title: 'Base64 Codificador' };
    LANGS.ru = { ...LANGS.en, title: 'Base64 Кодировщик' };
    LANGS.zh = { ...LANGS.en, title: 'Base64 编码器' };
    LANGS.ja = { ...LANGS.en, title: 'Base64 エンコーダー' };
    LANGS.it = { ...LANGS.en, title: 'Base64 Codificatore' };
    LANGS.ar = { ...LANGS.en, title: 'Base64 مشفر' };
    LANGS.ko = { ...LANGS.en, title: 'Base64 인코더' };
    LANGS.hi = { ...LANGS.en, title: 'Base64 एन्कोडर' };
    LANGS.pt = { ...LANGS.en, title: 'Base64 Codificador' };

    const lang = ref((window.__CLOUD_LANG__ || 'tr').toLowerCase());
    const L = (key) => (LANGS[lang.value] || LANGS['en'])?.[key] || LANGS['en'][key] || key;

    const mode = ref('encode');
    const inputText = ref('');
    const outputText = ref('');
    const errorMsg = ref('');
    const urlSafe = ref(false);
    const isFileMode = ref(false);
    const copiedFlag = ref(false);
    const fileName = ref('');
    const fileSize = ref(0);

    function formatBytes(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function encodeBase64(str) {
      try {
        const encoded = btoa(unescape(encodeURIComponent(str)));
        if (urlSafe.value) {
          return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        }
        return encoded;
      } catch (e) {
        return null;
      }
    }

    function decodeBase64(str) {
      try {
        let input = str.trim();
        if (urlSafe.value) {
          input = input.replace(/-/g, '+').replace(/_/g, '/');
          while (input.length % 4) input += '=';
        }
        return decodeURIComponent(escape(atob(input)));
      } catch (e) {
        return null;
      }
    }

    function process() {
      errorMsg.value = '';
      if (!inputText.value) {
        outputText.value = '';
        return;
      }
      if (mode.value === 'encode') {
        const result = encodeBase64(inputText.value);
        if (result === null) {
          errorMsg.value = L('error');
          outputText.value = '';
        } else {
          outputText.value = result;
        }
      } else {
        const result = decodeBase64(inputText.value);
        if (result === null) {
          errorMsg.value = L('invalidBase64');
          outputText.value = '';
        } else {
          outputText.value = result;
        }
      }
    }

    watch([inputText, mode, urlSafe], process);

    function swapValues() {
      const tmp = outputText.value;
      mode.value = mode.value === 'encode' ? 'decode' : 'encode';
      inputText.value = tmp;
    }

    async function copyOutput() {
      if (!outputText.value) return;
      try {
        await navigator.clipboard.writeText(outputText.value);
        copiedFlag.value = true;
        setTimeout(() => copiedFlag.value = false, 1500);
      } catch {}
    }

    async function pasteInput() {
      try {
        const text = await navigator.clipboard.readText();
        inputText.value = text;
      } catch {}
    }

    function clearAll() {
      inputText.value = '';
      outputText.value = '';
      errorMsg.value = '';
      fileName.value = '';
      fileSize.value = 0;
    }

    function handleFileDrop(e) {
      e.preventDefault();
      const file = e.dataTransfer?.files?.[0];
      if (file) readFile(file);
    }

    function handleFileSelect(e) {
      const file = e.target?.files?.[0];
      if (file) readFile(file);
    }

    function readFile(file) {
      fileName.value = file.name;
      fileSize.value = file.size;
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1] || '';
        if (mode.value === 'encode') {
          inputText.value = '';
          outputText.value = base64;
          errorMsg.value = '';
        } else {
          inputText.value = base64;
        }
      };
      reader.readAsDataURL(file);
    }

    function downloadDecoded() {
      if (!outputText.value) return;
      const blob = new Blob([outputText.value], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'decoded.txt';
      a.click();
      URL.revokeObjectURL(url);
    }

    const inputStats = computed(() => {
      const text = inputText.value;
      if (!text) return null;
      return {
        chars: text.length,
        lines: text.split('\n').length,
        bytes: new TextEncoder().encode(text).length
      };
    });

    const outputStats = computed(() => {
      const text = outputText.value;
      if (!text) return null;
      return {
        chars: text.length,
        lines: text.split('\n').length,
        bytes: new TextEncoder().encode(text).length
      };
    });

    return {
      L, mode, inputText, outputText, errorMsg, urlSafe, isFileMode,
      copiedFlag, fileName, fileSize, formatBytes,
      swapValues, copyOutput, pasteInput, clearAll,
      handleFileDrop, handleFileSelect, downloadDecoded,
      inputStats, outputStats
    };
  }
})
