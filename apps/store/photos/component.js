(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, watch } = Vue;

  // ── i18n ──
  const LANGS = {
    tr: {
      upload:'Yükle', searchPlaceholder:'Ara (isim, etiket)...', allPhotos:'Tüm Fotoğraflar',
      uploaded:'Yüklenen', fromUrl:'URL\'den', categories:'Kategoriler', collections:'Koleksiyonlar',
      newCategory:'Yeni Kategori', newCollection:'Yeni Koleksiyon', emptyText:'Henüz fotoğraf yok — Yükleyin veya URL ekleyin',
      rotation:'Döndürme', reset:'Sıfırla', category:'Kategori', tags:'Etiketler', addTag:'Etiket ekle...',
      delete:'Sil', rotateLeft:'Sola Döndür', rotateRight:'Sağa Döndür', info:'Bilgi',
      add:'Ekle', cancel:'İptal', addToCollection:'Koleksiyona Ekle', slideshow:'Slayt Gösterisi',
      urlPlaceholder:'Resim URL\'si yapıştır (jpg, png, webp...)', library:'Kütüphane',
      newCategoryTitle:'Yeni Kategori', newCollectionTitle:'Yeni Koleksiyon',
      categoryPlaceholder:'Kategori adı...', collectionPlaceholder:'Koleksiyon adı...',
      deleteCollection:'Koleksiyonu Sil', renameCollection:'Yeniden Adlandır',
      confirmDelete:'Bu fotoğrafı silmek istediğinizden emin misiniz?'
    },
    en: {
      upload:'Upload', searchPlaceholder:'Search (name, tag)...', allPhotos:'All Photos',
      uploaded:'Uploaded', fromUrl:'From URL', categories:'Categories', collections:'Collections',
      newCategory:'New Category', newCollection:'New Collection', emptyText:'No photos yet — Upload or add from URL',
      rotation:'Rotation', reset:'Reset', category:'Category', tags:'Tags', addTag:'Add tag...',
      delete:'Delete', rotateLeft:'Rotate Left', rotateRight:'Rotate Right', info:'Info',
      add:'Add', cancel:'Cancel', addToCollection:'Add to Collection', slideshow:'Slideshow',
      urlPlaceholder:'Paste image URL (jpg, png, webp...)', library:'Library',
      newCategoryTitle:'New Category', newCollectionTitle:'New Collection',
      categoryPlaceholder:'Category name...', collectionPlaceholder:'Collection name...',
      deleteCollection:'Delete Collection', renameCollection:'Rename',
      confirmDelete:'Are you sure you want to delete this photo?'
    },
    de: {
      upload:'Hochladen', searchPlaceholder:'Suche (Name, Tag)...', allPhotos:'Alle Fotos',
      uploaded:'Hochgeladen', fromUrl:'Von URL', categories:'Kategorien', collections:'Sammlungen',
      newCategory:'Neue Kategorie', newCollection:'Neue Sammlung', emptyText:'Noch keine Fotos — Laden Sie hoch oder fügen Sie eine URL hinzu',
      rotation:'Drehung', reset:'Zurücksetzen', category:'Kategorie', tags:'Tags', addTag:'Tag hinzufügen...',
      delete:'Löschen', rotateLeft:'Links drehen', rotateRight:'Rechts drehen', info:'Info',
      add:'Hinzufügen', cancel:'Abbrechen', addToCollection:'Zur Sammlung', slideshow:'Diashow',
      urlPlaceholder:'Bild-URL einfügen (jpg, png, webp...)', library:'Bibliothek',
      newCategoryTitle:'Neue Kategorie', newCollectionTitle:'Neue Sammlung',
      categoryPlaceholder:'Kategoriename...', collectionPlaceholder:'Sammlungsname...',
      deleteCollection:'Sammlung löschen', renameCollection:'Umbenennen',
      confirmDelete:'Möchten Sie dieses Foto wirklich löschen?'
    },
    fr: {
      upload:'Télécharger', searchPlaceholder:'Rechercher (nom, tag)...', allPhotos:'Toutes les photos',
      uploaded:'Téléchargées', fromUrl:'Depuis URL', categories:'Catégories', collections:'Collections',
      newCategory:'Nouvelle catégorie', newCollection:'Nouvelle collection', emptyText:'Pas encore de photos — Téléchargez ou ajoutez une URL',
      rotation:'Rotation', reset:'Réinitialiser', category:'Catégorie', tags:'Tags', addTag:'Ajouter un tag...',
      delete:'Supprimer', rotateLeft:'Tourner à gauche', rotateRight:'Tourner à droite', info:'Info',
      add:'Ajouter', cancel:'Annuler', addToCollection:'Ajouter à la collection', slideshow:'Diaporama',
      urlPlaceholder:'Coller l\'URL de l\'image (jpg, png, webp...)', library:'Bibliothèque',
      newCategoryTitle:'Nouvelle catégorie', newCollectionTitle:'Nouvelle collection',
      categoryPlaceholder:'Nom de catégorie...', collectionPlaceholder:'Nom de collection...',
      deleteCollection:'Supprimer la collection', renameCollection:'Renommer',
      confirmDelete:'Êtes-vous sûr de vouloir supprimer cette photo ?'
    },
    es: {
      upload:'Subir', searchPlaceholder:'Buscar (nombre, etiqueta)...', allPhotos:'Todas las fotos',
      uploaded:'Subidas', fromUrl:'Desde URL', categories:'Categorías', collections:'Colecciones',
      newCategory:'Nueva categoría', newCollection:'Nueva colección', emptyText:'Sin fotos aún — Suba o añada una URL',
      rotation:'Rotación', reset:'Restablecer', category:'Categoría', tags:'Etiquetas', addTag:'Añadir etiqueta...',
      delete:'Eliminar', rotateLeft:'Girar izquierda', rotateRight:'Girar derecha', info:'Info',
      add:'Añadir', cancel:'Cancelar', addToCollection:'Añadir a colección', slideshow:'Presentación',
      urlPlaceholder:'Pegar URL de imagen (jpg, png, webp...)', library:'Biblioteca',
      newCategoryTitle:'Nueva categoría', newCollectionTitle:'Nueva colección',
      categoryPlaceholder:'Nombre de categoría...', collectionPlaceholder:'Nombre de colección...',
      deleteCollection:'Eliminar colección', renameCollection:'Renombrar',
      confirmDelete:'¿Está seguro de que desea eliminar esta foto?'
    },
    ru: {
      upload:'Загрузить', searchPlaceholder:'Поиск (имя, тег)...', allPhotos:'Все фото',
      uploaded:'Загруженные', fromUrl:'Из URL', categories:'Категории', collections:'Коллекции',
      newCategory:'Новая категория', newCollection:'Новая коллекция', emptyText:'Пока нет фото — Загрузите или добавьте URL',
      rotation:'Вращение', reset:'Сброс', category:'Категория', tags:'Теги', addTag:'Добавить тег...',
      delete:'Удалить', rotateLeft:'Повернуть влево', rotateRight:'Повернуть вправо', info:'Инфо',
      add:'Добавить', cancel:'Отмена', addToCollection:'В коллекцию', slideshow:'Слайд-шоу',
      urlPlaceholder:'Вставьте URL изображения (jpg, png, webp...)', library:'Библиотека',
      newCategoryTitle:'Новая категория', newCollectionTitle:'Новая коллекция',
      categoryPlaceholder:'Название категории...', collectionPlaceholder:'Название коллекции...',
      deleteCollection:'Удалить коллекцию', renameCollection:'Переименовать',
      confirmDelete:'Вы уверены, что хотите удалить это фото?'
    },
    zh: {
      upload:'上传', searchPlaceholder:'搜索（名称、标签）...', allPhotos:'所有照片',
      uploaded:'已上传', fromUrl:'从URL', categories:'分类', collections:'合集',
      newCategory:'新建分类', newCollection:'新建合集', emptyText:'暂无照片 — 上传或从URL添加',
      rotation:'旋转', reset:'重置', category:'分类', tags:'标签', addTag:'添加标签...',
      delete:'删除', rotateLeft:'左旋', rotateRight:'右旋', info:'信息',
      add:'添加', cancel:'取消', addToCollection:'添加到合集', slideshow:'幻灯片',
      urlPlaceholder:'粘贴图片URL（jpg, png, webp...）', library:'图库',
      newCategoryTitle:'新建分类', newCollectionTitle:'新建合集',
      categoryPlaceholder:'分类名称...', collectionPlaceholder:'合集名称...',
      deleteCollection:'删除合集', renameCollection:'重命名',
      confirmDelete:'确定要删除这张照片吗？'
    },
    ja: {
      upload:'アップロード', searchPlaceholder:'検索（名前、タグ）...', allPhotos:'すべての写真',
      uploaded:'アップロード済み', fromUrl:'URLから', categories:'カテゴリ', collections:'コレクション',
      newCategory:'新しいカテゴリ', newCollection:'新しいコレクション', emptyText:'写真がありません — アップロードまたはURLを追加',
      rotation:'回転', reset:'リセット', category:'カテゴリ', tags:'タグ', addTag:'タグを追加...',
      delete:'削除', rotateLeft:'左に回転', rotateRight:'右に回転', info:'情報',
      add:'追加', cancel:'キャンセル', addToCollection:'コレクションに追加', slideshow:'スライドショー',
      urlPlaceholder:'画像URLを貼り付け（jpg, png, webp...）', library:'ライブラリ',
      newCategoryTitle:'新しいカテゴリ', newCollectionTitle:'新しいコレクション',
      categoryPlaceholder:'カテゴリ名...', collectionPlaceholder:'コレクション名...',
      deleteCollection:'コレクションを削除', renameCollection:'名前変更',
      confirmDelete:'この写真を削除してもよいですか？'
    },
    it: {
      upload:'Carica', searchPlaceholder:'Cerca (nome, tag)...', allPhotos:'Tutte le foto',
      uploaded:'Caricate', fromUrl:'Da URL', categories:'Categorie', collections:'Collezioni',
      newCategory:'Nuova categoria', newCollection:'Nuova collezione', emptyText:'Nessuna foto — Carica o aggiungi URL',
      rotation:'Rotazione', reset:'Reimposta', category:'Categoria', tags:'Tag', addTag:'Aggiungi tag...',
      delete:'Elimina', rotateLeft:'Ruota a sinistra', rotateRight:'Ruota a destra', info:'Info',
      add:'Aggiungi', cancel:'Annulla', addToCollection:'Aggiungi alla collezione', slideshow:'Presentazione',
      urlPlaceholder:'Incolla URL immagine (jpg, png, webp...)', library:'Libreria',
      newCategoryTitle:'Nuova categoria', newCollectionTitle:'Nuova collezione',
      categoryPlaceholder:'Nome categoria...', collectionPlaceholder:'Nome collezione...',
      deleteCollection:'Elimina collezione', renameCollection:'Rinomina',
      confirmDelete:'Sei sicuro di voler eliminare questa foto?'
    },
    ar: {
      upload:'رفع', searchPlaceholder:'بحث (اسم، وسم)...', allPhotos:'جميع الصور',
      uploaded:'المرفوعة', fromUrl:'من URL', categories:'الفئات', collections:'المجموعات',
      newCategory:'فئة جديدة', newCollection:'مجموعة جديدة', emptyText:'لا توجد صور بعد — ارفع أو أضف URL',
      rotation:'تدوير', reset:'إعادة تعيين', category:'الفئة', tags:'الوسوم', addTag:'إضافة وسم...',
      delete:'حذف', rotateLeft:'تدوير لليسار', rotateRight:'تدوير لليمين', info:'معلومات',
      add:'إضافة', cancel:'إلغاء', addToCollection:'إضافة للمجموعة', slideshow:'عرض شرائح',
      urlPlaceholder:'لصق رابط الصورة (jpg, png, webp...)', library:'المكتبة',
      newCategoryTitle:'فئة جديدة', newCollectionTitle:'مجموعة جديدة',
      categoryPlaceholder:'اسم الفئة...', collectionPlaceholder:'اسم المجموعة...',
      deleteCollection:'حذف المجموعة', renameCollection:'إعادة تسمية',
      confirmDelete:'هل أنت متأكد من حذف هذه الصورة؟'
    },
    ko: {
      upload:'업로드', searchPlaceholder:'검색 (이름, 태그)...', allPhotos:'모든 사진',
      uploaded:'업로드됨', fromUrl:'URL에서', categories:'카테고리', collections:'컬렉션',
      newCategory:'새 카테고리', newCollection:'새 컬렉션', emptyText:'사진 없음 — 업로드하거나 URL 추가',
      rotation:'회전', reset:'초기화', category:'카테고리', tags:'태그', addTag:'태그 추가...',
      delete:'삭제', rotateLeft:'왼쪽 회전', rotateRight:'오른쪽 회전', info:'정보',
      add:'추가', cancel:'취소', addToCollection:'컬렉션에 추가', slideshow:'슬라이드쇼',
      urlPlaceholder:'이미지 URL 붙여넣기 (jpg, png, webp...)', library:'라이브러리',
      newCategoryTitle:'새 카테고리', newCollectionTitle:'새 컬렉션',
      categoryPlaceholder:'카테고리 이름...', collectionPlaceholder:'컬렉션 이름...',
      deleteCollection:'컬렉션 삭제', renameCollection:'이름 변경',
      confirmDelete:'이 사진을 삭제하시겠습니까?'
    },
    hi: {
      upload:'अपलोड', searchPlaceholder:'खोजें (नाम, टैग)...', allPhotos:'सभी फ़ोटो',
      uploaded:'अपलोड किए गए', fromUrl:'URL से', categories:'श्रेणियाँ', collections:'संग्रह',
      newCategory:'नई श्रेणी', newCollection:'नया संग्रह', emptyText:'अभी कोई फ़ोटो नहीं — अपलोड करें या URL जोड़ें',
      rotation:'घुमाव', reset:'रीसेट', category:'श्रेणी', tags:'टैग', addTag:'टैग जोड़ें...',
      delete:'हटाएं', rotateLeft:'बाएं घुमाएं', rotateRight:'दाएं घुमाएं', info:'जानकारी',
      add:'जोड़ें', cancel:'रद्द करें', addToCollection:'संग्रह में जोड़ें', slideshow:'स्लाइडशो',
      urlPlaceholder:'छवि URL चिपकाएं (jpg, png, webp...)', library:'लाइब्रेरी',
      newCategoryTitle:'नई श्रेणी', newCollectionTitle:'नया संग्रह',
      categoryPlaceholder:'श्रेणी का नाम...', collectionPlaceholder:'संग्रह का नाम...',
      deleteCollection:'संग्रह हटाएं', renameCollection:'नाम बदलें',
      confirmDelete:'क्या आप इस फ़ोटो को हटाना चाहते हैं?'
    },
    pt: {
      upload:'Enviar', searchPlaceholder:'Pesquisar (nome, tag)...', allPhotos:'Todas as fotos',
      uploaded:'Enviadas', fromUrl:'De URL', categories:'Categorias', collections:'Coleções',
      newCategory:'Nova categoria', newCollection:'Nova coleção', emptyText:'Sem fotos ainda — Envie ou adicione URL',
      rotation:'Rotação', reset:'Redefinir', category:'Categoria', tags:'Tags', addTag:'Adicionar tag...',
      delete:'Excluir', rotateLeft:'Girar à esquerda', rotateRight:'Girar à direita', info:'Info',
      add:'Adicionar', cancel:'Cancelar', addToCollection:'Adicionar à coleção', slideshow:'Apresentação',
      urlPlaceholder:'Colar URL da imagem (jpg, png, webp...)', library:'Biblioteca',
      newCategoryTitle:'Nova categoria', newCollectionTitle:'Nova coleção',
      categoryPlaceholder:'Nome da categoria...', collectionPlaceholder:'Nome da coleção...',
      deleteCollection:'Excluir coleção', renameCollection:'Renomear',
      confirmDelete:'Tem certeza de que deseja excluir esta foto?'
    }
  };

  function getLocale() {
    try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; }
  }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(key) { return (LANGS[locale.value] || LANGS.tr)[key] || (LANGS.tr)[key] || key; }

      // Reactive locale (poll for changes from settings)
      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }
      onMounted(() => { window.addEventListener('locale-changed', onLocaleChanged); });
      onUnmounted(() => { window.removeEventListener('locale-changed', onLocaleChanged); });

      // ── State ──
      const library = ref([]);        // [{id, name, url, filename, source, ext, size, tags, category, rotation}]
      const collections = ref([]);     // [{id, name, photoIds}]
      const categories = ref([]);      // string[]
      const uploading = ref(false);
      const search = ref('');
      const sideFilter = ref('all');
      const view = ref('grid');
      const detailPhoto = ref(null);
      const selectedIds = ref([]);
      const newTag = ref('');
      const showUrlBar = ref(false);
      const urlInput = ref('');

      // Lightbox
      const lightbox = ref({ show: false, photo: null, index: 0 });

      // Slideshow
      const slideshow = ref({ active: false, photos: [], index: 0, photo: null, paused: false, fade: true });
      let slideTimer = null;

      // Dialog
      const dlg = ref({ show: false, mode: '', title: '', input: '', placeholder: '' });

      // ── Filtering ──
      const filteredPhotos = computed(() => {
        let list = library.value;
        const sf = sideFilter.value;
        if (sf === 'uploaded') list = list.filter(p => p.source === 'upload');
        else if (sf === 'url') list = list.filter(p => p.source === 'url');
        else if (sf.startsWith('cat:')) { const cat = sf.slice(4); list = list.filter(p => p.category === cat); }
        else if (sf.startsWith('col:')) {
          const colId = sf.slice(4);
          const col = collections.value.find(c => c.id === colId);
          if (col) list = list.filter(p => col.photoIds.includes(p.id));
          else list = [];
        }
        if (search.value.trim()) {
          const q = search.value.trim().toLowerCase();
          list = list.filter(p => {
            if (p.name.toLowerCase().includes(q)) return true;
            if (p.tags && p.tags.some(t => t.toLowerCase().includes(q))) return true;
            if (p.category && p.category.toLowerCase().includes(q)) return true;
            return false;
          });
        }
        return list;
      });

      function countByCategory(cat) { return library.value.filter(p => p.category === cat).length; }
      function photoCollections(photoId) { return collections.value.filter(c => c.photoIds.includes(photoId)); }

      // ── Persistence ──
      async function loadLibrary() {
        try {
          const res = await fetch('/api/photos/library');
          if (res.ok) {
            const data = await res.json();
            library.value = data.photos || [];
            collections.value = data.collections || [];
            categories.value = data.categories || [];
          }
        } catch {}
      }

      async function saveLibrary() {
        try {
          await fetch('/api/photos/library', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photos: library.value, collections: collections.value, categories: categories.value })
          });
        } catch {}
      }

      async function loadFiles() {
        try {
          const res = await fetch('/api/photos/files');
          if (!res.ok) return;
          const data = await res.json();
          let changed = false;
          // Auto-add new uploaded files that aren't in library yet
          const urls = new Set(library.value.map(p => p.url));
          for (const f of [...data.user, ...data.public]) {
            if (!urls.has(f.url)) {
              library.value.push({
                id: genId(),
                name: f.name,
                filename: f.filename,
                url: f.url,
                source: 'upload',
                ext: f.ext,
                size: f.size,
                tags: [],
                category: '',
                rotation: 0
              });
              changed = true;
            }
          }
          if (changed) saveLibrary();
        } catch {}
      }

      // ── Upload ──
      function triggerUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg';
        input.multiple = true;
        input.onchange = async () => {
          if (!input.files.length) return;
          uploading.value = true;
          const fd = new FormData();
          for (const f of input.files) fd.append('files', f);
          try {
            const res = await fetch('/api/photos/upload', { method: 'POST', body: fd });
            if (res.ok) {
              const data = await res.json();
              for (const f of data.files) {
                library.value.push({
                  id: genId(), name: f.name, filename: f.filename, url: f.url,
                  source: 'upload', ext: f.ext, size: f.size,
                  tags: [], category: '', rotation: 0
                });
              }
              saveLibrary();
            }
          } catch {}
          uploading.value = false;
        };
        input.click();
      }

      // ── URL add ──
      function addFromUrl() {
        const url = urlInput.value.trim();
        if (!url) return;
        if (library.value.some(p => p.url === url)) { urlInput.value = ''; return; }
        let name = url;
        try { name = decodeURIComponent(url.split('/').pop().split('?')[0].replace(/\.[^.]+$/, '')); } catch {}
        library.value.push({
          id: genId(), name: name || 'Image', filename: '', url,
          source: 'url', ext: '', size: 0,
          tags: [], category: '', rotation: 0
        });
        urlInput.value = '';
        saveLibrary();
      }

      // ── Selection ──
      function toggleSelect(id) {
        const idx = selectedIds.value.indexOf(id);
        if (idx >= 0) selectedIds.value.splice(idx, 1);
        else selectedIds.value.push(id);
      }

      function deleteSelected() {
        for (const id of selectedIds.value) {
          const photo = library.value.find(p => p.id === id);
          if (photo) deletePhotoInternal(photo);
        }
        selectedIds.value = [];
      }

      // ── Rotation ──
      function rotatePhoto(photo, deg, reset) {
        const p = library.value.find(x => x.id === photo.id);
        if (!p) return;
        if (reset) p.rotation = 0;
        else p.rotation = ((p.rotation || 0) + deg) % 360;
        // Update references
        if (lightbox.value.photo && lightbox.value.photo.id === p.id) lightbox.value.photo = p;
        if (detailPhoto.value && detailPhoto.value.id === p.id) detailPhoto.value = p;
        saveLibrary();
      }

      // ── Tags ──
      function addTag(photo) {
        const tag = newTag.value.trim();
        if (!tag) return;
        const p = library.value.find(x => x.id === photo.id);
        if (!p) return;
        if (!p.tags) p.tags = [];
        if (!p.tags.includes(tag)) p.tags.push(tag);
        newTag.value = '';
        saveLibrary();
      }

      function removeTag(photo, idx) {
        const p = library.value.find(x => x.id === photo.id);
        if (!p || !p.tags) return;
        p.tags.splice(idx, 1);
        saveLibrary();
      }

      // ── Category ──
      function setCategoryDetail(val) {
        if (!detailPhoto.value) return;
        const p = library.value.find(x => x.id === detailPhoto.value.id);
        if (p) { p.category = val; saveLibrary(); }
      }

      function promptNewCategory() {
        dlg.value = { show: true, mode: 'new-category', title: L('newCategoryTitle'), input: '', placeholder: L('categoryPlaceholder') };
      }

      // ── Collections ──
      function promptNewCollection() {
        dlg.value = { show: true, mode: 'new-collection', title: L('newCollectionTitle'), input: '', placeholder: L('collectionPlaceholder') };
      }

      function openCollectionDialog() {
        if (!selectedIds.value.length) return;
        dlg.value = { show: true, mode: 'add-to-collection', title: L('addToCollection'), input: '', placeholder: '' };
      }

      function addSelectedToCollection(colId) {
        const col = collections.value.find(c => c.id === colId);
        if (!col) return;
        for (const id of selectedIds.value) {
          if (!col.photoIds.includes(id)) col.photoIds.push(id);
        }
        selectedIds.value = [];
        saveLibrary();
      }

      function dlgConfirm() {
        const mode = dlg.value.mode;
        const val = dlg.value.input.trim();
        if (!val) return;
        if (mode === 'new-category') {
          if (!categories.value.includes(val)) categories.value.push(val);
        } else if (mode === 'new-collection') {
          const newCol = { id: genId(), name: val, photoIds: [] };
          // If we came from add-to-collection dialog with selected photos
          if (selectedIds.value.length) newCol.photoIds = [...selectedIds.value];
          collections.value.push(newCol);
          selectedIds.value = [];
        }
        dlg.value.show = false;
        saveLibrary();
      }

      // ── Delete ──
      function deletePhoto(photo) {
        deletePhotoInternal(photo);
        if (detailPhoto.value && detailPhoto.value.id === photo.id) detailPhoto.value = null;
      }

      function deletePhotoInternal(photo) {
        // Remove from collections
        for (const col of collections.value) {
          col.photoIds = col.photoIds.filter(id => id !== photo.id);
        }
        // Delete file on server if uploaded
        if (photo.source === 'upload' && photo.filename) {
          fetch('/api/photos/file/' + encodeURIComponent(photo.filename), { method: 'DELETE' }).catch(() => {});
        }
        library.value = library.value.filter(p => p.id !== photo.id);
        saveLibrary();
      }

      // ── Lightbox ──
      function openLightbox(photo) {
        const idx = filteredPhotos.value.findIndex(p => p.id === photo.id);
        lightbox.value = { show: true, photo, index: idx >= 0 ? idx : 0 };
        detailPhoto.value = photo;
      }

      function closeLightbox() { lightbox.value.show = false; }

      function lbNav(dir) {
        const list = filteredPhotos.value;
        if (!list.length) return;
        let i = lightbox.value.index + dir;
        if (i < 0) i = list.length - 1;
        if (i >= list.length) i = 0;
        lightbox.value.index = i;
        lightbox.value.photo = list[i];
        detailPhoto.value = list[i];
      }
      function lbPrev() { lbNav(-1); }
      function lbNext() { lbNav(1); }

      function onKeydown(e) {
        if (lightbox.value.show) {
          if (e.key === 'ArrowLeft') lbPrev();
          else if (e.key === 'ArrowRight') lbNext();
          else if (e.key === 'Escape') closeLightbox();
        }
        if (slideshow.value.active && e.key === 'Escape') stopSlideshow();
      }

      // ── Slideshow ──
      function startSlideshow(photos) {
        if (!photos.length) return;
        slideshow.value = { active: true, photos, index: 0, photo: photos[0], paused: false, fade: true };
        slideTimer = setInterval(() => {
          if (slideshow.value.paused) return;
          slideshow.value.fade = false;
          setTimeout(() => {
            let i = slideshow.value.index + 1;
            if (i >= slideshow.value.photos.length) i = 0;
            slideshow.value.index = i;
            slideshow.value.photo = slideshow.value.photos[i];
            slideshow.value.fade = true;
          }, 300);
        }, 4000);
      }

      function stopSlideshow() {
        slideshow.value.active = false;
        if (slideTimer) { clearInterval(slideTimer); slideTimer = null; }
      }

      function slideshowTogglePause() {
        slideshow.value.paused = !slideshow.value.paused;
      }

      // Check if current sidebar is a collection – show slideshow button
      // (handled by checking sideFilter starting with 'col:' in toolbar via template)

      // ── Context menu for collection sidebar items ──
      // Using right-click on collection sidebar is complex in template; we provide buttons instead.

      // ── Helpers ──
      function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

      function formatSize(bytes) {
        if (!bytes) return '';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
      }

      // ── Init ──
      onMounted(async () => {
        await loadLibrary();
        await loadFiles();
        document.addEventListener('keydown', onKeydown);
      });

      onUnmounted(() => {
        document.removeEventListener('keydown', onKeydown);
        if (slideTimer) clearInterval(slideTimer);
      });

      // Watch sidebar filter for collection - add slideshow context
      const isCollectionView = computed(() => sideFilter.value.startsWith('col:'));
      function startCollectionSlideshow() {
        const colId = sideFilter.value.slice(4);
        const col = collections.value.find(c => c.id === colId);
        if (!col) return;
        const photos = library.value.filter(p => col.photoIds.includes(p.id));
        startSlideshow(photos);
      }

      function deleteCurrentCollection() {
        const colId = sideFilter.value.slice(4);
        collections.value = collections.value.filter(c => c.id !== colId);
        sideFilter.value = 'all';
        saveLibrary();
      }

      return {
        L, library, collections, categories, uploading, search, sideFilter, view,
        detailPhoto, selectedIds, newTag, showUrlBar, urlInput,
        lightbox, slideshow, dlg,
        filteredPhotos, countByCategory, photoCollections,
        triggerUpload, addFromUrl, toggleSelect, deleteSelected,
        rotatePhoto, addTag, removeTag, setCategoryDetail,
        promptNewCategory, promptNewCollection, openCollectionDialog,
        addSelectedToCollection, dlgConfirm,
        deletePhoto, openLightbox, closeLightbox, lbPrev, lbNext,
        startSlideshow, stopSlideshow, slideshowTogglePause,
        formatSize, isCollectionView, startCollectionSlideshow, deleteCurrentCollection
      };
    }
  };
})(Vue);
