(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, nextTick } = Vue;

  const LANGS = {
    tr: {
      setMaster: 'Yeni bir ana şifre belirleyin',
      enterMaster: 'Ana şifrenizi girin',
      masterPlaceholder: 'Ana şifre...',
      confirmPlaceholder: 'Şifreyi tekrar girin...',
      unlockBtn: 'Kilidi Aç',
      createBtn: 'Kasa Oluştur',
      passRequired: 'Şifre gerekli',
      passMin6: 'En az 6 karakter olmalı',
      passMismatch: 'Şifreler eşleşmiyor',
      connError: 'Bağlantı hatası',
      wrongPass: 'Yanlış ana şifre',
      notes: 'Notlar',
      media: 'Medya',
      tags: 'Etiketler',
      allTags: 'Tüm Etiketler',
      searchPlaceholder: 'Ara...',
      addNote: 'Not Ekle',
      addMedia: 'Medya Ekle',
      editNote: 'Notu Düzenle',
      noNotes: 'Henüz not yok',
      noMedia: 'Henüz medya yok',
      untitled: 'Başlıksız',
      lblTitle: 'Başlık',
      titlePlaceholder: 'Not başlığı...',
      lblContent: 'İçerik',
      contentPlaceholder: 'Notunuzu yazın...',
      tagPlaceholder: 'Etiket ekle...',
      cancel: 'İptal',
      save: 'Kaydet',
      delete: 'Sil',
      download: 'İndir',
      lockBtn: 'Kilitle',
      changePwBtn: 'Şifre Değiştir',
      changePwTitle: 'Ana Şifreyi Değiştir',
      currentPw: 'Mevcut şifre',
      newPw: 'Yeni şifre',
      confirmNewPw: 'Yeni şifre (tekrar)',
      changePwSuccess: 'Şifre başarıyla değiştirildi',
      changePwError: 'Mevcut şifre yanlış',
      uploadError: 'Yükleme hatası',
      deleteConfirm: 'Silmek istediğinize emin misiniz?',
      saved: 'Kaydedildi',
      importBtn: 'İçe Aktar',
      exportBtn: 'Dışa Aktar',
      importFromDevice: 'Cihazdan İçe Aktar',
      importFromServer: 'Sunucudan İçe Aktar',
      exportToServer: 'Sunucuya Kaydet',
      exportSuccess: 'Dışa aktarma başarılı',
      importSuccess: 'İçe aktarma başarılı',
      noFiles: 'Dosya bulunamadı',
      parentDir: 'Üst Klasör',
      serverFiles: 'Sunucu Dosyaları',
      exportAllNotes: 'Tüm Notları İndir (JSON)',
      downloadTxt: 'TXT İndir',
      downloadJson: 'JSON İndir',
      saveFileName: 'Dosya Adı',
      selectFromServer: 'Sunucudan dosya seçin',
      exportAllToServer: 'Tümünü Sunucuya Aktar'
    },
    en: {
      setMaster: 'Set a new master password',
      enterMaster: 'Enter your master password',
      masterPlaceholder: 'Master password...',
      confirmPlaceholder: 'Confirm password...',
      unlockBtn: 'Unlock',
      createBtn: 'Create Vault',
      passRequired: 'Password required',
      passMin6: 'Must be at least 6 characters',
      passMismatch: 'Passwords do not match',
      connError: 'Connection error',
      wrongPass: 'Wrong master password',
      notes: 'Notes',
      media: 'Media',
      tags: 'Tags',
      allTags: 'All Tags',
      searchPlaceholder: 'Search...',
      addNote: 'Add Note',
      addMedia: 'Add Media',
      editNote: 'Edit Note',
      noNotes: 'No notes yet',
      noMedia: 'No media yet',
      untitled: 'Untitled',
      lblTitle: 'Title',
      titlePlaceholder: 'Note title...',
      lblContent: 'Content',
      contentPlaceholder: 'Write your note...',
      tagPlaceholder: 'Add tag...',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      download: 'Download',
      lockBtn: 'Lock',
      changePwBtn: 'Change Password',
      changePwTitle: 'Change Master Password',
      currentPw: 'Current password',
      newPw: 'New password',
      confirmNewPw: 'New password (confirm)',
      changePwSuccess: 'Password changed successfully',
      changePwError: 'Current password is wrong',
      uploadError: 'Upload error',
      deleteConfirm: 'Are you sure you want to delete?',
      saved: 'Saved',
      importBtn: 'Import',
      exportBtn: 'Export',
      importFromDevice: 'Import from Device',
      importFromServer: 'Import from Server',
      exportToServer: 'Save to Server',
      exportSuccess: 'Export successful',
      importSuccess: 'Import successful',
      noFiles: 'No files found',
      parentDir: 'Parent Folder',
      serverFiles: 'Server Files',
      exportAllNotes: 'Download All Notes (JSON)',
      downloadTxt: 'Download TXT',
      downloadJson: 'Download JSON',
      saveFileName: 'File Name',
      selectFromServer: 'Select files from server',
      exportAllToServer: 'Export All to Server'
    },
    de: {
      setMaster: 'Neues Master-Passwort festlegen',
      enterMaster: 'Master-Passwort eingeben',
      masterPlaceholder: 'Master-Passwort...',
      confirmPlaceholder: 'Passwort bestätigen...',
      unlockBtn: 'Entsperren',
      createBtn: 'Tresor erstellen',
      passRequired: 'Passwort erforderlich',
      passMin6: 'Mindestens 6 Zeichen',
      passMismatch: 'Passwörter stimmen nicht überein',
      connError: 'Verbindungsfehler',
      wrongPass: 'Falsches Master-Passwort',
      notes: 'Notizen',
      media: 'Medien',
      tags: 'Tags',
      allTags: 'Alle Tags',
      searchPlaceholder: 'Suchen...',
      addNote: 'Notiz hinzufügen',
      addMedia: 'Medien hinzufügen',
      editNote: 'Notiz bearbeiten',
      noNotes: 'Noch keine Notizen',
      noMedia: 'Noch keine Medien',
      untitled: 'Ohne Titel',
      lblTitle: 'Titel',
      titlePlaceholder: 'Notiz-Titel...',
      lblContent: 'Inhalt',
      contentPlaceholder: 'Notiz schreiben...',
      tagPlaceholder: 'Tag hinzufügen...',
      cancel: 'Abbrechen',
      save: 'Speichern',
      delete: 'Löschen',
      download: 'Herunterladen',
      lockBtn: 'Sperren',
      changePwBtn: 'Passwort ändern',
      changePwTitle: 'Master-Passwort ändern',
      currentPw: 'Aktuelles Passwort',
      newPw: 'Neues Passwort',
      confirmNewPw: 'Neues Passwort (bestätigen)',
      changePwSuccess: 'Passwort erfolgreich geändert',
      changePwError: 'Aktuelles Passwort ist falsch',
      uploadError: 'Upload-Fehler',
      deleteConfirm: 'Möchten Sie wirklich löschen?',
      saved: 'Gespeichert',
      importBtn: 'Importieren',
      exportBtn: 'Exportieren',
      importFromDevice: 'Vom Gerät importieren',
      importFromServer: 'Vom Server importieren',
      exportToServer: 'Auf Server speichern',
      exportSuccess: 'Export erfolgreich',
      importSuccess: 'Import erfolgreich',
      noFiles: 'Keine Dateien',
      parentDir: 'Übergeordneter Ordner',
      serverFiles: 'Server-Dateien',
      exportAllNotes: 'Alle Notizen exportieren',
      downloadTxt: 'TXT herunterladen',
      downloadJson: 'JSON herunterladen',
      saveFileName: 'Dateiname',
      selectFromServer: 'Dateien vom Server auswählen',
      exportAllToServer: 'Alle auf Server exportieren'
    },
    fr: {
      setMaster: 'Définir un mot de passe principal',
      enterMaster: 'Entrez votre mot de passe principal',
      masterPlaceholder: 'Mot de passe principal...',
      confirmPlaceholder: 'Confirmez le mot de passe...',
      unlockBtn: 'Déverrouiller',
      createBtn: 'Créer le coffre',
      passRequired: 'Mot de passe requis',
      passMin6: 'Au moins 6 caractères',
      passMismatch: 'Les mots de passe ne correspondent pas',
      connError: 'Erreur de connexion',
      wrongPass: 'Mauvais mot de passe',
      notes: 'Notes',
      media: 'Médias',
      tags: 'Étiquettes',
      allTags: 'Toutes les étiquettes',
      searchPlaceholder: 'Rechercher...',
      addNote: 'Ajouter une note',
      addMedia: 'Ajouter un média',
      editNote: 'Modifier la note',
      noNotes: 'Aucune note',
      noMedia: 'Aucun média',
      untitled: 'Sans titre',
      lblTitle: 'Titre',
      titlePlaceholder: 'Titre de la note...',
      lblContent: 'Contenu',
      contentPlaceholder: 'Écrivez votre note...',
      tagPlaceholder: 'Ajouter une étiquette...',
      cancel: 'Annuler',
      save: 'Enregistrer',
      delete: 'Supprimer',
      download: 'Télécharger',
      lockBtn: 'Verrouiller',
      changePwBtn: 'Changer le mot de passe',
      changePwTitle: 'Changer le mot de passe principal',
      currentPw: 'Mot de passe actuel',
      newPw: 'Nouveau mot de passe',
      confirmNewPw: 'Nouveau mot de passe (confirmer)',
      changePwSuccess: 'Mot de passe changé avec succès',
      changePwError: 'Mot de passe actuel incorrect',
      uploadError: 'Erreur de téléchargement',
      deleteConfirm: 'Êtes-vous sûr de vouloir supprimer ?',
      saved: 'Enregistré',
      importBtn: 'Importer',
      exportBtn: 'Exporter',
      importFromDevice: 'Importer depuis l\'appareil',
      importFromServer: 'Importer depuis le serveur',
      exportToServer: 'Enregistrer sur le serveur',
      exportSuccess: 'Export réussi',
      importSuccess: 'Import réussi',
      noFiles: 'Aucun fichier',
      parentDir: 'Dossier parent',
      serverFiles: 'Fichiers du serveur',
      exportAllNotes: 'Exporter toutes les notes',
      downloadTxt: 'Télécharger TXT',
      downloadJson: 'Télécharger JSON',
      saveFileName: 'Nom du fichier',
      selectFromServer: 'Sélectionner les fichiers',
      exportAllToServer: 'Tout exporter sur le serveur'
    },
    es: {
      setMaster: 'Establecer una contraseña maestra',
      enterMaster: 'Ingrese su contraseña maestra',
      masterPlaceholder: 'Contraseña maestra...',
      confirmPlaceholder: 'Confirmar contraseña...',
      unlockBtn: 'Desbloquear',
      createBtn: 'Crear bóveda',
      passRequired: 'Contraseña requerida',
      passMin6: 'Mínimo 6 caracteres',
      passMismatch: 'Las contraseñas no coinciden',
      connError: 'Error de conexión',
      wrongPass: 'Contraseña maestra incorrecta',
      notes: 'Notas',
      media: 'Medios',
      tags: 'Etiquetas',
      allTags: 'Todas las etiquetas',
      searchPlaceholder: 'Buscar...',
      addNote: 'Agregar nota',
      addMedia: 'Agregar medio',
      editNote: 'Editar nota',
      noNotes: 'Sin notas aún',
      noMedia: 'Sin medios aún',
      untitled: 'Sin título',
      lblTitle: 'Título',
      titlePlaceholder: 'Título de la nota...',
      lblContent: 'Contenido',
      contentPlaceholder: 'Escribe tu nota...',
      tagPlaceholder: 'Agregar etiqueta...',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      download: 'Descargar',
      lockBtn: 'Bloquear',
      changePwBtn: 'Cambiar contraseña',
      changePwTitle: 'Cambiar contraseña maestra',
      currentPw: 'Contraseña actual',
      newPw: 'Nueva contraseña',
      confirmNewPw: 'Nueva contraseña (confirmar)',
      changePwSuccess: 'Contraseña cambiada exitosamente',
      changePwError: 'Contraseña actual incorrecta',
      uploadError: 'Error de carga',
      deleteConfirm: '¿Está seguro de que desea eliminar?',
      saved: 'Guardado',
      importBtn: 'Importar',
      exportBtn: 'Exportar',
      importFromDevice: 'Importar desde dispositivo',
      importFromServer: 'Importar desde servidor',
      exportToServer: 'Guardar en servidor',
      exportSuccess: 'Exportación exitosa',
      importSuccess: 'Importación exitosa',
      noFiles: 'Sin archivos',
      parentDir: 'Carpeta superior',
      serverFiles: 'Archivos del servidor',
      exportAllNotes: 'Exportar todas las notas',
      downloadTxt: 'Descargar TXT',
      downloadJson: 'Descargar JSON',
      saveFileName: 'Nombre del archivo',
      selectFromServer: 'Seleccionar archivos del servidor',
      exportAllToServer: 'Exportar todo al servidor'
    },
    ru: {
      setMaster: 'Установите мастер-пароль',
      enterMaster: 'Введите мастер-пароль',
      masterPlaceholder: 'Мастер-пароль...',
      confirmPlaceholder: 'Подтвердите пароль...',
      unlockBtn: 'Разблокировать',
      createBtn: 'Создать хранилище',
      passRequired: 'Требуется пароль',
      passMin6: 'Минимум 6 символов',
      passMismatch: 'Пароли не совпадают',
      connError: 'Ошибка соединения',
      wrongPass: 'Неверный мастер-пароль',
      notes: 'Заметки',
      media: 'Медиа',
      tags: 'Теги',
      allTags: 'Все теги',
      searchPlaceholder: 'Поиск...',
      addNote: 'Добавить заметку',
      addMedia: 'Добавить медиа',
      editNote: 'Редактировать заметку',
      noNotes: 'Заметок пока нет',
      noMedia: 'Медиа пока нет',
      untitled: 'Без названия',
      lblTitle: 'Название',
      titlePlaceholder: 'Название заметки...',
      lblContent: 'Содержание',
      contentPlaceholder: 'Напишите заметку...',
      tagPlaceholder: 'Добавить тег...',
      cancel: 'Отмена',
      save: 'Сохранить',
      delete: 'Удалить',
      download: 'Скачать',
      lockBtn: 'Заблокировать',
      changePwBtn: 'Сменить пароль',
      changePwTitle: 'Сменить мастер-пароль',
      currentPw: 'Текущий пароль',
      newPw: 'Новый пароль',
      confirmNewPw: 'Новый пароль (подтвердить)',
      changePwSuccess: 'Пароль успешно изменён',
      changePwError: 'Текущий пароль неверен',
      uploadError: 'Ошибка загрузки',
      deleteConfirm: 'Вы уверены, что хотите удалить?',
      saved: 'Сохранено',
      importBtn: 'Импорт',
      exportBtn: 'Экспорт',
      importFromDevice: 'Импорт с устройства',
      importFromServer: 'Импорт с сервера',
      exportToServer: 'Сохранить на сервер',
      exportSuccess: 'Экспорт выполнен',
      importSuccess: 'Импорт выполнен',
      noFiles: 'Нет файлов',
      parentDir: 'Родительская папка',
      serverFiles: 'Файлы сервера',
      exportAllNotes: 'Экспортировать все заметки',
      downloadTxt: 'Скачать TXT',
      downloadJson: 'Скачать JSON',
      saveFileName: 'Имя файла',
      selectFromServer: 'Выбрать файлы с сервера',
      exportAllToServer: 'Экспортировать всё на сервер'
    }
  };

  function getLocale() {
    try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; }
  }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      // Auth state
      const unlocked = ref(false);
      const vaultExists = ref(false);
      const masterPass = ref('');
      const masterPassConfirm = ref('');
      const loading = ref(false);
      const lockError = ref('');
      let cachedMasterPass = '';

      // Data
      const notes = ref([]);
      const mediaFiles = ref([]);
      const view = ref('notes');
      const activeTag = ref('');
      const search = ref('');

      // Note editor
      const showNoteDialog = ref(false);
      const editingNote = ref({ title: '', content: '', tags: [] });
      const tagInput = ref('');

      // Media
      const showMediaDialog = ref(false);
      const mediaDetail = ref(null);
      const mediaTagInput = ref('');
      const fileInputRef = ref(null);
      const importFileInputRef = ref(null);

      // Import/Export
      const showImportDialog = ref(false);
      const showExportDialog = ref(false);
      const showServerBrowser = ref(false);
      const showExportToServer = ref(false);
      const serverBrowserFiles = ref([]);
      const serverBrowserPath = ref('');
      const serverBrowseLoading = ref(false);
      const exportTargetType = ref('');
      const exportTargetItem = ref(null);
      const exportServerPath = ref('');
      const exportServerFileName = ref('');

      // Change password
      const showChangePw = ref(false);
      const changePwCurrent = ref('');
      const changePwNew = ref('');
      const changePwConfirm = ref('');
      const changePwError = ref('');

      // Toast
      const toast = ref('');
      let toastTimer = null;
      function showToast(msg) {
        toast.value = msg;
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { toast.value = ''; }, 2000);
      }

      // Auto-lock
      let autoLockTimer = null;
      const AUTO_LOCK_MS = 5 * 60 * 1000;
      function resetAutoLock() {
        if (autoLockTimer) clearTimeout(autoLockTimer);
        if (unlocked.value) {
          autoLockTimer = setTimeout(() => lockVault(), AUTO_LOCK_MS);
        }
      }

      // Computed
      const allTags = computed(() => {
        const tagSet = new Set();
        notes.value.forEach(n => (n.tags || []).forEach(t => tagSet.add(t)));
        mediaFiles.value.forEach(m => (m.tags || []).forEach(t => tagSet.add(t)));
        return Array.from(tagSet).sort();
      });

      function getTagCount(tag) {
        let c = 0;
        notes.value.forEach(n => { if ((n.tags || []).includes(tag)) c++; });
        mediaFiles.value.forEach(m => { if ((m.tags || []).includes(tag)) c++; });
        return c;
      }

      const filteredNotes = computed(() => {
        let list = notes.value;
        if (activeTag.value) list = list.filter(n => (n.tags || []).includes(activeTag.value));
        if (search.value) {
          const q = search.value.toLowerCase();
          list = list.filter(n =>
            (n.title || '').toLowerCase().includes(q) ||
            (n.content || '').toLowerCase().includes(q) ||
            (n.tags || []).some(t => t.toLowerCase().includes(q))
          );
        }
        return list.slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      });

      const filteredMedia = computed(() => {
        let list = mediaFiles.value;
        if (activeTag.value) list = list.filter(m => (m.tags || []).includes(activeTag.value));
        if (search.value) {
          const q = search.value.toLowerCase();
          list = list.filter(m =>
            (m.name || '').toLowerCase().includes(q) ||
            (m.tags || []).some(t => t.toLowerCase().includes(q))
          );
        }
        return list.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      });

      const suggestedTags = computed(() => {
        if (!tagInput.value) return [];
        const q = tagInput.value.toLowerCase();
        return allTags.value.filter(t =>
          t.toLowerCase().includes(q) && !(editingNote.value.tags || []).includes(t)
        ).slice(0, 5);
      });

      // Vault operations
      async function checkVault() {
        try {
          const res = await fetch('/api/secure-note/exists');
          if (res.ok) {
            const d = await res.json();
            vaultExists.value = d.exists;
          }
        } catch {}
      }

      async function unlock() {
        lockError.value = '';
        if (!masterPass.value) { lockError.value = L('passRequired'); return; }
        if (!vaultExists.value) {
          if (masterPass.value.length < 6) { lockError.value = L('passMin6'); return; }
          if (masterPass.value !== masterPassConfirm.value) { lockError.value = L('passMismatch'); return; }
          loading.value = true;
          try {
            const res = await fetch('/api/secure-note/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ masterPassword: masterPass.value, notes: [], media: [] })
            });
            if (res.ok) {
              cachedMasterPass = masterPass.value;
              vaultExists.value = true;
              unlocked.value = true;
              resetAutoLock();
            }
          } catch { lockError.value = L('connError'); }
          loading.value = false;
          return;
        }
        loading.value = true;
        try {
          const res = await fetch('/api/secure-note/unlock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ masterPassword: masterPass.value })
          });
          if (res.ok) {
            const data = await res.json();
            notes.value = data.notes || [];
            mediaFiles.value = (data.media || []).map(m => {
              if (m.thumbData && m.mimeType && m.mimeType.startsWith('image/')) {
                m.thumbUrl = 'data:' + m.mimeType + ';base64,' + m.thumbData;
              }
              if (m.fileData) {
                m.dataUrl = 'data:' + (m.mimeType || 'application/octet-stream') + ';base64,' + m.fileData;
              }
              return m;
            });
            cachedMasterPass = masterPass.value;
            unlocked.value = true;
            resetAutoLock();
          } else {
            lockError.value = L('wrongPass');
          }
        } catch { lockError.value = L('connError'); }
        loading.value = false;
      }

      function lockVault() {
        unlocked.value = false;
        notes.value = [];
        mediaFiles.value = [];
        cachedMasterPass = '';
        masterPass.value = '';
        masterPassConfirm.value = '';
        if (autoLockTimer) clearTimeout(autoLockTimer);
      }

      async function persistVault() {
        if (!cachedMasterPass) return;
        resetAutoLock();
        const mediaToSave = mediaFiles.value.map(m => ({
          id: m.id,
          name: m.name,
          mimeType: m.mimeType,
          size: m.size,
          tags: m.tags,
          createdAt: m.createdAt,
          fileData: m.fileData,
          thumbData: m.thumbData
        }));
        try {
          await fetch('/api/secure-note/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              masterPassword: cachedMasterPass,
              notes: notes.value,
              media: mediaToSave
            })
          });
        } catch {}
      }

      let saveTimer = null;
      function debouncedSave() {
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(persistVault, 600);
      }

      // Note CRUD
      function openAddNote() {
        editingNote.value = { id: null, title: '', content: '', tags: [] };
        tagInput.value = '';
        showNoteDialog.value = true;
        resetAutoLock();
      }

      function openNoteDetail(note) {
        editingNote.value = { ...note, tags: [...(note.tags || [])] };
        tagInput.value = '';
        showNoteDialog.value = true;
        resetAutoLock();
      }

      function saveNote() {
        const e = editingNote.value;
        const now = Date.now();
        if (e.id) {
          const idx = notes.value.findIndex(n => n.id === e.id);
          if (idx >= 0) {
            notes.value[idx] = { ...e, updatedAt: now };
          }
        } else {
          e.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
          e.createdAt = now;
          e.updatedAt = now;
          notes.value.push({ ...e });
        }
        showNoteDialog.value = false;
        debouncedSave();
        showToast(L('saved'));
      }

      function deleteNote(note) {
        notes.value = notes.value.filter(n => n.id !== note.id);
        showNoteDialog.value = false;
        debouncedSave();
      }

      // Tag helpers
      function addTag() {
        const t = tagInput.value.trim();
        if (t && !(editingNote.value.tags || []).includes(t)) {
          if (!editingNote.value.tags) editingNote.value.tags = [];
          editingNote.value.tags.push(t);
        }
        tagInput.value = '';
      }

      function pickTag(t) {
        if (!(editingNote.value.tags || []).includes(t)) {
          if (!editingNote.value.tags) editingNote.value.tags = [];
          editingNote.value.tags.push(t);
        }
        tagInput.value = '';
      }

      // Media operations
      function triggerMediaUpload() {
        if (fileInputRef.value) fileInputRef.value.click();
        resetAutoLock();
      }

      async function handleFileUpload(e) {
        const files = e.target.files;
        if (!files || !files.length) return;
        for (const file of files) {
          if (file.size > 10 * 1024 * 1024) continue; // 10MB limit
          try {
            const base64 = await fileToBase64(file);
            const entry = {
              id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
              name: file.name,
              mimeType: file.type,
              size: file.size,
              tags: [],
              createdAt: Date.now(),
              fileData: base64
            };
            // Generate thumbnail for images
            if (file.type.startsWith('image/')) {
              entry.thumbData = base64;
              entry.thumbUrl = 'data:' + file.type + ';base64,' + base64;
            }
            entry.dataUrl = 'data:' + (file.type || 'application/octet-stream') + ';base64,' + base64;
            mediaFiles.value.push(entry);
          } catch {}
        }
        e.target.value = '';
        debouncedSave();
        showToast(L('saved'));
      }

      function fileToBase64(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result;
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      function openMediaDetail(m) {
        mediaDetail.value = { ...m, tags: [...(m.tags || [])] };
        mediaTagInput.value = '';
        showMediaDialog.value = true;
        resetAutoLock();
      }

      function addMediaTag() {
        const t = mediaTagInput.value.trim();
        if (t && mediaDetail.value && !(mediaDetail.value.tags || []).includes(t)) {
          mediaDetail.value.tags.push(t);
          // Update original
          const orig = mediaFiles.value.find(m => m.id === mediaDetail.value.id);
          if (orig) orig.tags = [...mediaDetail.value.tags];
          debouncedSave();
        }
        mediaTagInput.value = '';
      }

      function removeMediaTag(idx) {
        if (mediaDetail.value) {
          mediaDetail.value.tags.splice(idx, 1);
          const orig = mediaFiles.value.find(m => m.id === mediaDetail.value.id);
          if (orig) orig.tags = [...mediaDetail.value.tags];
          debouncedSave();
        }
      }

      function deleteMedia(m) {
        mediaFiles.value = mediaFiles.value.filter(x => x.id !== m.id);
        showMediaDialog.value = false;
        debouncedSave();
      }

      function downloadMedia(m) {
        if (!m || !m.dataUrl) return;
        const a = document.createElement('a');
        a.href = m.dataUrl;
        a.download = m.name || 'file';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      // --- Import / Export ---
      function triggerImportFromDevice() {
        showImportDialog.value = false;
        if (importFileInputRef.value) importFileInputRef.value.click();
      }

      async function handleImportFiles(e) {
        const files = e.target.files;
        if (!files || !files.length) return;
        for (const file of files) {
          if (file.size > 10 * 1024 * 1024) continue;
          const ext = file.name.split('.').pop().toLowerCase();
          if (['txt', 'md', 'json', 'html', 'csv', 'xml', 'log'].includes(ext)) {
            const text = await file.text();
            if (ext === 'json') {
              try {
                const parsed = JSON.parse(text);
                const now = Date.now();
                if (Array.isArray(parsed)) {
                  parsed.forEach(n => {
                    if (n.title || n.content) {
                      notes.value.push({
                        id: now.toString(36) + Math.random().toString(36).slice(2, 7),
                        title: String(n.title || file.name).slice(0, 200),
                        content: String(n.content || '').slice(0, 50000),
                        tags: Array.isArray(n.tags) ? n.tags.map(t => String(t).slice(0, 50)).slice(0, 20) : [],
                        createdAt: n.createdAt || now, updatedAt: now
                      });
                    }
                  });
                } else if (parsed.title || parsed.content) {
                  notes.value.push({
                    id: now.toString(36) + Math.random().toString(36).slice(2, 7),
                    title: String(parsed.title || file.name).slice(0, 200),
                    content: String(parsed.content || '').slice(0, 50000),
                    tags: Array.isArray(parsed.tags) ? parsed.tags.map(t => String(t).slice(0, 50)).slice(0, 20) : [],
                    createdAt: parsed.createdAt || now, updatedAt: now
                  });
                } else {
                  notes.value.push({
                    id: now.toString(36) + Math.random().toString(36).slice(2, 7),
                    title: file.name.replace(/\.\w+$/, ''), content: text.slice(0, 50000),
                    tags: [], createdAt: now, updatedAt: now
                  });
                }
              } catch {
                const now = Date.now();
                notes.value.push({
                  id: now.toString(36) + Math.random().toString(36).slice(2, 7),
                  title: file.name.replace(/\.\w+$/, ''), content: text.slice(0, 50000),
                  tags: [], createdAt: now, updatedAt: now
                });
              }
            } else {
              const now = Date.now();
              notes.value.push({
                id: now.toString(36) + Math.random().toString(36).slice(2, 7),
                title: file.name.replace(/\.\w+$/, ''), content: text.slice(0, 50000),
                tags: [], createdAt: now, updatedAt: now
              });
            }
          } else {
            const base64 = await fileToBase64(file);
            const entry = {
              id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
              name: file.name, mimeType: file.type || 'application/octet-stream',
              size: file.size, tags: [], createdAt: Date.now(), fileData: base64
            };
            if (file.type && file.type.startsWith('image/')) {
              entry.thumbData = base64;
              entry.thumbUrl = 'data:' + file.type + ';base64,' + base64;
            }
            entry.dataUrl = 'data:' + (file.type || 'application/octet-stream') + ';base64,' + base64;
            mediaFiles.value.push(entry);
          }
        }
        e.target.value = '';
        debouncedSave();
        showToast(L('importSuccess'));
      }

      async function openServerBrowser() {
        showImportDialog.value = false;
        serverBrowserPath.value = '';
        await loadServerFiles('');
        showServerBrowser.value = true;
      }

      async function loadServerFiles(dirPath) {
        serverBrowseLoading.value = true;
        try {
          const res = await fetch('/api/fs/list?path=' + encodeURIComponent(dirPath));
          if (res.ok) {
            serverBrowserFiles.value = await res.json();
            serverBrowserPath.value = dirPath;
          }
        } catch {}
        serverBrowseLoading.value = false;
      }

      function navigateServerDir(item) {
        if (item.isDir) loadServerFiles(item.path);
      }

      function navigateServerUp() {
        const parts = serverBrowserPath.value.split('/').filter(Boolean);
        parts.pop();
        loadServerFiles(parts.join('/'));
      }

      async function importServerFile(item) {
        if (item.isDir) { navigateServerDir(item); return; }
        const ext = (item.ext || '').replace('.', '').toLowerCase();
        const textExts = ['txt','md','json','html','csv','xml','log'];
        try {
          if (textExts.includes(ext)) {
            const res = await fetch('/api/fs/read?path=' + encodeURIComponent(item.path));
            if (!res.ok) return;
            const data = await res.json();
            const now = Date.now();
            if (ext === 'json') {
              try {
                const parsed = JSON.parse(data.content);
                if (Array.isArray(parsed)) {
                  parsed.forEach(n => {
                    if (n.title || n.content) {
                      notes.value.push({
                        id: now.toString(36) + Math.random().toString(36).slice(2, 7),
                        title: String(n.title || item.name).slice(0, 200),
                        content: String(n.content || '').slice(0, 50000),
                        tags: Array.isArray(n.tags) ? n.tags.map(t => String(t).slice(0, 50)).slice(0, 20) : [],
                        createdAt: n.createdAt || now, updatedAt: now
                      });
                    }
                  });
                } else if (parsed.title || parsed.content) {
                  notes.value.push({
                    id: now.toString(36) + Math.random().toString(36).slice(2, 7),
                    title: String(parsed.title || item.name).slice(0, 200),
                    content: String(parsed.content || '').slice(0, 50000),
                    tags: Array.isArray(parsed.tags) ? parsed.tags.map(t => String(t).slice(0, 50)).slice(0, 20) : [],
                    createdAt: parsed.createdAt || now, updatedAt: now
                  });
                } else {
                  notes.value.push({
                    id: now.toString(36) + Math.random().toString(36).slice(2, 7),
                    title: item.name.replace(/\.\w+$/, ''), content: String(data.content).slice(0, 50000),
                    tags: [], createdAt: now, updatedAt: now
                  });
                }
              } catch {
                notes.value.push({
                  id: now.toString(36) + Math.random().toString(36).slice(2, 7),
                  title: item.name.replace(/\.\w+$/, ''), content: String(data.content).slice(0, 50000),
                  tags: [], createdAt: now, updatedAt: now
                });
              }
            } else {
              notes.value.push({
                id: now.toString(36) + Math.random().toString(36).slice(2, 7),
                title: item.name.replace(/\.\w+$/, ''), content: String(data.content).slice(0, 50000),
                tags: [], createdAt: now, updatedAt: now
              });
            }
          } else {
            const res = await fetch('/api/fs/read-binary?path=' + encodeURIComponent(item.path));
            if (!res.ok) return;
            const data = await res.json();
            const mimeMap = {
              jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',gif:'image/gif',
              webp:'image/webp',svg:'image/svg+xml',bmp:'image/bmp',
              mp3:'audio/mpeg',wav:'audio/wav',ogg:'audio/ogg',m4a:'audio/mp4',
              mp4:'video/mp4',webm:'video/webm',avi:'video/x-msvideo',mkv:'video/x-matroska',
              pdf:'application/pdf',zip:'application/zip',rar:'application/x-rar-compressed'
            };
            const mime = mimeMap[ext] || 'application/octet-stream';
            const entry = {
              id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
              name: item.name, mimeType: mime, size: item.size,
              tags: [], createdAt: Date.now(), fileData: data.content
            };
            if (mime.startsWith('image/')) {
              entry.thumbData = data.content;
              entry.thumbUrl = 'data:' + mime + ';base64,' + data.content;
            }
            entry.dataUrl = 'data:' + mime + ';base64,' + data.content;
            mediaFiles.value.push(entry);
          }
          debouncedSave();
          showToast(L('importSuccess'));
        } catch {}
      }

      function exportNoteTxt(note) {
        const blob = new Blob([(note.title || '') + '\n\n' + (note.content || '')], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = (note.title || 'note') + '.txt';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      function exportNoteJson(note) {
        const data = { title: note.title, content: note.content, tags: note.tags, createdAt: note.createdAt, updatedAt: note.updatedAt };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = (note.title || 'note') + '.json';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      function exportAllNotesJson() {
        const data = notes.value.map(n => ({ title: n.title, content: n.content, tags: n.tags, createdAt: n.createdAt, updatedAt: n.updatedAt }));
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'secure-notes-export.json';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      function openExportToServer(type, item) {
        exportTargetType.value = type;
        exportTargetItem.value = item;
        exportServerPath.value = 'downloads';
        if (type === 'note') {
          exportServerFileName.value = (item.title || 'note') + '.txt';
        } else if (type === 'media') {
          exportServerFileName.value = item.name || 'file';
        } else {
          exportServerFileName.value = 'secure-notes-export.json';
        }
        showExportToServer.value = true;
        showNoteDialog.value = false;
        showMediaDialog.value = false;
        showExportDialog.value = false;
        loadServerFiles('downloads');
      }

      function selectExportDir(item) {
        if (item.isDir) {
          exportServerPath.value = item.path;
          loadServerFiles(item.path);
        }
      }

      function navigateExportUp() {
        const parts = serverBrowserPath.value.split('/').filter(Boolean);
        parts.pop();
        const p = parts.join('/');
        exportServerPath.value = p;
        loadServerFiles(p);
      }

      async function executeExportToServer() {
        if (!exportServerFileName.value) return;
        const fp = exportServerPath.value ? exportServerPath.value + '/' + exportServerFileName.value : exportServerFileName.value;
        try {
          if (exportTargetType.value === 'note') {
            const n = exportTargetItem.value;
            await fetch('/api/fs/write', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ filePath: fp, content: (n.title || '') + '\n\n' + (n.content || '') })
            });
          } else if (exportTargetType.value === 'media') {
            const m = exportTargetItem.value;
            if (m.fileData) {
              await fetch('/api/fs/write-binary', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filePath: fp, content: m.fileData })
              });
            }
          } else if (exportTargetType.value === 'allNotes') {
            const data = notes.value.map(n => ({ title: n.title, content: n.content, tags: n.tags, createdAt: n.createdAt, updatedAt: n.updatedAt }));
            await fetch('/api/fs/write', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ filePath: fp, content: JSON.stringify(data, null, 2) })
            });
          }
          showExportToServer.value = false;
          showToast(L('exportSuccess'));
        } catch {}
      }

      function getFileIcon(ext) {
        if (!ext) return '📄';
        const e = ext.replace('.', '').toLowerCase();
        if (['jpg','jpeg','png','gif','webp','svg','bmp'].includes(e)) return '🖼️';
        if (['mp3','wav','ogg','m4a','flac','aac'].includes(e)) return '🎵';
        if (['mp4','webm','avi','mkv','mov'].includes(e)) return '🎬';
        if (e === 'pdf') return '📕';
        if (['zip','rar','7z','tar','gz'].includes(e)) return '📦';
        if (['txt','md','log'].includes(e)) return '📝';
        if (['json','xml','csv','html'].includes(e)) return '📋';
        return '📄';
      }

      // Change password
      async function changePassword() {
        changePwError.value = '';
        if (!changePwCurrent.value || !changePwNew.value) { changePwError.value = L('passRequired'); return; }
        if (changePwNew.value.length < 6) { changePwError.value = L('passMin6'); return; }
        if (changePwNew.value !== changePwConfirm.value) { changePwError.value = L('passMismatch'); return; }
        try {
          const res = await fetch('/api/secure-note/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword: changePwCurrent.value, newPassword: changePwNew.value })
          });
          if (res.ok) {
            cachedMasterPass = changePwNew.value;
            showChangePw.value = false;
            changePwCurrent.value = '';
            changePwNew.value = '';
            changePwConfirm.value = '';
            showToast(L('changePwSuccess'));
          } else {
            changePwError.value = L('changePwError');
          }
        } catch { changePwError.value = L('connError'); }
      }

      // Helpers
      function formatDate(ts) {
        if (!ts) return '';
        return new Date(ts).toLocaleDateString(locale.value === 'tr' ? 'tr-TR' : 'en-US', {
          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
      }

      function formatSize(bytes) {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
      }

      function getMediaIcon(mime) {
        if (!mime) return '📄';
        if (mime.startsWith('image/')) return '🖼️';
        if (mime.startsWith('audio/')) return '🎵';
        if (mime.startsWith('video/')) return '🎬';
        if (mime.includes('pdf')) return '📕';
        if (mime.includes('zip') || mime.includes('rar') || mime.includes('archive')) return '📦';
        return '📄';
      }

      function isImage(mime) { return mime && mime.startsWith('image/'); }
      function isAudio(mime) { return mime && mime.startsWith('audio/'); }
      function isVideo(mime) { return mime && mime.startsWith('video/'); }

      // Init
      checkVault();

      onUnmounted(() => {
        if (autoLockTimer) clearTimeout(autoLockTimer);
        if (saveTimer) clearTimeout(saveTimer);
        if (toastTimer) clearTimeout(toastTimer);
      });

      return {
        // Auth
        unlocked, vaultExists, masterPass, masterPassConfirm, loading, lockError,
        unlock, lockVault,
        // Data
        notes, mediaFiles, view, activeTag, search,
        allTags, getTagCount, filteredNotes, filteredMedia,
        // Notes
        showNoteDialog, editingNote, tagInput, suggestedTags,
        openAddNote, openNoteDetail, saveNote, deleteNote, addTag, pickTag,
        // Media
        showMediaDialog, mediaDetail, mediaTagInput, fileInputRef,
        triggerMediaUpload, handleFileUpload, openMediaDetail,
        addMediaTag, removeMediaTag, deleteMedia, downloadMedia,
        // Import/Export
        showImportDialog, showExportDialog, showServerBrowser, showExportToServer,
        serverBrowserFiles, serverBrowserPath, serverBrowseLoading,
        exportTargetType, exportServerPath, exportServerFileName, importFileInputRef,
        triggerImportFromDevice, handleImportFiles,
        openServerBrowser, loadServerFiles, navigateServerDir, navigateServerUp, importServerFile,
        exportNoteTxt, exportNoteJson, exportAllNotesJson,
        openExportToServer, selectExportDir, navigateExportUp, executeExportToServer, getFileIcon,
        // Change pw
        showChangePw, changePwCurrent, changePwNew, changePwConfirm, changePwError,
        changePassword,
        // Helpers
        formatDate, formatSize, getMediaIcon, isImage, isAudio, isVideo,
        toast, L
      };
    }
  };
})(Vue);
