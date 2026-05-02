(function(Vue) {
  const { ref, onMounted } = Vue;
  const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success(){}, error(){}, warning(){} };

  /* ── i18n ── */
  const LANGS = {
    tr: {
      textTab:'Metin → ASCII', imageTab:'Resim → ASCII', galleryTab:'Galeri',
      textPlaceholder:'Metninizi yazın...', font:'Font', generate:'Oluştur', generating:'Oluşturuluyor...',
      copy:'Kopyala', save:'Kaydet', download:'İndir', upload:'Yükle', refresh:'Yenile', delete:'Sil',
      width:'Genişlik', charset:'Karakter Seti', invert:'Ters Çevir',
      uploadHint:'Resim sürükleyin veya tıklayarak seçin', loading:'Yükleniyor...', noFiles:'Henüz dosya yok',
      saved:'Kaydedildi', copied:'Kopyalandı', deleted:'Silindi', uploaded:'Yüklendi',
      errorGen:'Oluşturma hatası', errorLoad:'Yükleme hatası'
    },
    en: {
      textTab:'Text → ASCII', imageTab:'Image → ASCII', galleryTab:'Gallery',
      textPlaceholder:'Type your text...', font:'Font', generate:'Generate', generating:'Generating...',
      copy:'Copy', save:'Save', download:'Download', upload:'Upload', refresh:'Refresh', delete:'Delete',
      width:'Width', charset:'Charset', invert:'Invert',
      uploadHint:'Drag image or click to select', loading:'Loading...', noFiles:'No files yet',
      saved:'Saved', copied:'Copied', deleted:'Deleted', uploaded:'Uploaded',
      errorGen:'Generation error', errorLoad:'Load error'
    },
    de: {
      textTab:'Text → ASCII', imageTab:'Bild → ASCII', galleryTab:'Galerie',
      textPlaceholder:'Text eingeben...', font:'Schriftart', generate:'Erzeugen', generating:'Erzeugen...',
      copy:'Kopieren', save:'Speichern', download:'Herunterladen', upload:'Hochladen', refresh:'Aktualisieren', delete:'Löschen',
      width:'Breite', charset:'Zeichensatz', invert:'Invertieren',
      uploadHint:'Bild ziehen oder klicken', loading:'Laden...', noFiles:'Noch keine Dateien',
      saved:'Gespeichert', copied:'Kopiert', deleted:'Gelöscht', uploaded:'Hochgeladen',
      errorGen:'Erzeugungsfehler', errorLoad:'Ladefehler'
    },
    fr: {
      textTab:'Texte → ASCII', imageTab:'Image → ASCII', galleryTab:'Galerie',
      textPlaceholder:'Tapez votre texte...', font:'Police', generate:'Générer', generating:'Génération...',
      copy:'Copier', save:'Enregistrer', download:'Télécharger', upload:'Téléverser', refresh:'Rafraîchir', delete:'Supprimer',
      width:'Largeur', charset:'Jeu de caractères', invert:'Inverser',
      uploadHint:'Glissez une image ou cliquez pour sélectionner', loading:'Chargement...', noFiles:'Aucun fichier',
      saved:'Enregistré', copied:'Copié', deleted:'Supprimé', uploaded:'Téléversé',
      errorGen:'Erreur de génération', errorLoad:'Erreur de chargement'
    },
    es: {
      textTab:'Texto → ASCII', imageTab:'Imagen → ASCII', galleryTab:'Galería',
      textPlaceholder:'Escribe tu texto...', font:'Fuente', generate:'Generar', generating:'Generando...',
      copy:'Copiar', save:'Guardar', download:'Descargar', upload:'Subir', refresh:'Actualizar', delete:'Eliminar',
      width:'Ancho', charset:'Juego de caracteres', invert:'Invertir',
      uploadHint:'Arrastra una imagen o haz clic', loading:'Cargando...', noFiles:'Sin archivos aún',
      saved:'Guardado', copied:'Copiado', deleted:'Eliminado', uploaded:'Subido',
      errorGen:'Error de generación', errorLoad:'Error de carga'
    }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  return {
    setup() {
      const locale = ref(getLocale());
      const t = (k) => (LANGS[locale.value] && LANGS[locale.value][k]) || (LANGS.en[k]) || k;
      const token = () => localStorage.getItem('token') || '';
      const headers = () => ({ 'Authorization': 'Bearer ' + token(), 'Content-Type': 'application/json' });

      /* ── State ── */
      const tab = ref('text');

      // Text tab
      const textInput = ref('');
      const selectedFont = ref('Standard');
      const fonts = ref(['Standard','Banner','Big','Block','Bubble','Digital','Ivrit','Lean','Mini','Script','Shadow','Slant','Small','Speed','Star Wars']);
      const textResult = ref('');
      const textLoading = ref(false);

      // Image tab
      const selectedFile = ref(null);
      const imagePreview = ref('');
      const imgWidth = ref(100);
      const charsetMode = ref('standard');
      const invertColors = ref(false);
      const imageResult = ref('');
      const imgLoading = ref(false);

      // Gallery tab
      const galleryItems = ref([]);
      const galleryLoading = ref(false);
      const viewingFile = ref(null);

      /* ── Text to ASCII ── */
      async function generateText() {
        if (!textInput.value.trim()) return;
        textLoading.value = true;
        textResult.value = '';
        try {
          const res = await fetch('/api/ascii-art/text', {
            method: 'POST', headers: headers(),
            body: JSON.stringify({ text: textInput.value.trim(), font: selectedFont.value })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Error');
          textResult.value = data.result;
        } catch (e) {
          ElMessage.error(t('errorGen') + ': ' + e.message);
        } finally { textLoading.value = false; }
      }

      /* ── Image to ASCII ── */
      function onFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        pickFile(file);
      }
      function onDrop(e) {
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) pickFile(file);
      }
      function pickFile(file) {
        selectedFile.value = file;
        const reader = new FileReader();
        reader.onload = (ev) => { imagePreview.value = ev.target.result; };
        reader.readAsDataURL(file);
      }

      async function generateImage() {
        if (!selectedFile.value) return;
        imgLoading.value = true;
        imageResult.value = '';
        try {
          const formData = new FormData();
          formData.append('image', selectedFile.value);
          formData.append('width', imgWidth.value);
          formData.append('charset', charsetMode.value);
          formData.append('invert', invertColors.value ? '1' : '0');
          const res = await fetch('/api/ascii-art/image', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token() },
            body: formData
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Error');
          imageResult.value = data.result;
        } catch (e) {
          ElMessage.error(t('errorGen') + ': ' + e.message);
        } finally { imgLoading.value = false; }
      }

      /* ── Save / Download / Copy ── */
      async function saveToServer(content, prefix) {
        try {
          const res = await fetch('/api/ascii-art/save', {
            method: 'POST', headers: headers(),
            body: JSON.stringify({ content, prefix })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Error');
          ElMessage.success(t('saved'));
        } catch (e) { ElMessage.error(e.message); }
      }

      function downloadTxt(content, filename) {
        const name = filename || ('ascii-art-' + Date.now() + '.txt');
        const blob = new Blob([content], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = name;
        a.click();
        URL.revokeObjectURL(a.href);
      }

      function copyResult(text) {
        navigator.clipboard.writeText(text).then(() => ElMessage.success(t('copied')));
      }

      /* ── Gallery ── */
      async function loadGallery() {
        galleryLoading.value = true;
        try {
          const res = await fetch('/api/ascii-art/files', { headers: headers() });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Error');
          galleryItems.value = data.files || [];
        } catch (e) { ElMessage.error(t('errorLoad')); }
        finally { galleryLoading.value = false; }
      }

      async function viewFile(item) {
        try {
          const res = await fetch('/api/ascii-art/files/' + encodeURIComponent(item.name), { headers: headers() });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Error');
          viewingFile.value = { name: item.name, content: data.content };
        } catch (e) { ElMessage.error(t('errorLoad')); }
      }

      async function deleteFile(item) {
        try {
          const res = await fetch('/api/ascii-art/files/' + encodeURIComponent(item.name), {
            method: 'DELETE', headers: headers()
          });
          if (!res.ok) throw new Error('Error');
          galleryItems.value = galleryItems.value.filter(f => f.name !== item.name);
          if (viewingFile.value && viewingFile.value.name === item.name) viewingFile.value = null;
          ElMessage.success(t('deleted'));
        } catch (e) { ElMessage.error(e.message); }
      }

      async function uploadFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        try {
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch('/api/ascii-art/upload', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token() },
            body: formData
          });
          if (!res.ok) throw new Error('Error');
          ElMessage.success(t('uploaded'));
          loadGallery();
        } catch (e) { ElMessage.error(e.message); }
        e.target.value = '';
      }

      /* ── Helpers ── */
      function formatSize(bytes) {
        if (!bytes) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
      }
      function formatDate(d) {
        if (!d) return '';
        return new Date(d).toLocaleString();
      }

      onMounted(() => {
        if (tab.value === 'gallery') loadGallery();
      });

      /* watch tab for gallery auto-load */
      Vue.watch(tab, (v) => { if (v === 'gallery') loadGallery(); });

      return {
        tab, t,
        /* text */
        textInput, selectedFont, fonts, textResult, textLoading, generateText,
        /* image */
        selectedFile, imagePreview, imgWidth, charsetMode, invertColors, imageResult, imgLoading,
        generateImage, onFileSelect, onDrop,
        /* actions */
        copyResult, saveToServer, downloadTxt,
        /* gallery */
        galleryItems, galleryLoading, viewingFile, loadGallery, viewFile, deleteFile, uploadFile,
        /* helpers */
        formatSize, formatDate
      };
    }
  };
})(Vue);
