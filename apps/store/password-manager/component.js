(function(Vue) {
  const { ref, computed, onMounted, onUnmounted } = Vue;

  const COLORS = ['#5c6bc0','#ef5350','#ab47bc','#26a69a','#ec407a','#7e57c2','#42a5f5','#ff7043','#66bb6a','#ffa726'];

  const LANGS = {
    tr: {
      vaultTitle: 'Şifre Kasası', enterMaster: 'Ana şifrenizi girin', setMaster: 'Yeni bir ana şifre belirleyin',
      masterPlaceholder: 'Ana şifre...', newMasterPlaceholder: 'Yeni ana şifre belirle...',
      confirmPlaceholder: 'Şifreyi tekrar girin...',
      unlockBtn: 'Kilidi Aç', createBtn: 'Kasayı Oluştur',
      passRequired: 'Şifre gerekli', passMin6: 'En az 6 karakter olmalı', passMismatch: 'Şifreler eşleşmiyor',
      connError: 'Bağlantı hatası', wrongPass: 'Yanlış ana şifre',
      allGroups: 'Tüm Gruplar', all: 'Tümü', searchPlaceholder: 'Ara...',
      addBtn: 'Ekle', groupsBtn: 'Gruplar', lockBtn: 'Kilitle', changePwBtn: 'Şifre Değiştir',
      noEntries: 'Henüz kayıt yok',
      editTitle: 'Düzenle', newEntry: 'Yeni Kayıt',
      lblTitle: 'Başlık', titlePlaceholder: 'Örn: Gmail',
      lblGroup: 'Grup', lblUsername: 'Kullanıcı Adı', userPlaceholder: 'kullanici@mail.com',
      lblPassword: 'Şifre', lblUrl: 'URL', lblNotes: 'Notlar',
      genPassword: 'Şifre üret', genTitle: 'Şifre Üretici',
      genLength: 'Uzunluk', genUpper: 'Büyük harf', genLower: 'Küçük harf',
      genDigits: 'Rakam', genSymbols: 'Sembol',
      cancel: 'İptal', save: 'Kaydet', delete: 'Sil', edit: 'Düzenle',
      lblUser: 'Kullanıcı', lblModified: 'Değiştirilme',
      manageGroups: 'Grupları Yönet', newGroupPlaceholder: 'Yeni grup adı...',
      copied: 'Kopyalandı', defaultGroup: 'Genel',
      suggestedGroups: ['Genel', 'E-posta', 'Sosyal Medya', 'Banka', 'Sunucu', 'Alışveriş', 'İş'],
      suggestLabel: 'Önerilen gruplar:',
      changePwTitle: 'Ana Şifreyi Değiştir',
      currentPw: 'Mevcut şifre', newPw: 'Yeni şifre', confirmNewPw: 'Yeni şifre (tekrar)',
      changePwSuccess: 'Şifre başarıyla değiştirildi', changePwError: 'Mevcut şifre yanlış'
    },
    en: {
      vaultTitle: 'Password Vault', enterMaster: 'Enter your master password', setMaster: 'Set a new master password',
      masterPlaceholder: 'Master password...', newMasterPlaceholder: 'Set new master password...',
      confirmPlaceholder: 'Confirm password...',
      unlockBtn: 'Unlock', createBtn: 'Create Vault',
      passRequired: 'Password required', passMin6: 'Must be at least 6 characters', passMismatch: 'Passwords do not match',
      connError: 'Connection error', wrongPass: 'Wrong master password',
      allGroups: 'All Groups', all: 'All', searchPlaceholder: 'Search...',
      addBtn: 'Add', groupsBtn: 'Groups', lockBtn: 'Lock', changePwBtn: 'Change Password',
      noEntries: 'No entries yet',
      editTitle: 'Edit', newEntry: 'New Entry',
      lblTitle: 'Title', titlePlaceholder: 'e.g. Gmail',
      lblGroup: 'Group', lblUsername: 'Username', userPlaceholder: 'user@mail.com',
      lblPassword: 'Password', lblUrl: 'URL', lblNotes: 'Notes',
      genPassword: 'Generate password', genTitle: 'Password Generator',
      genLength: 'Length', genUpper: 'Uppercase', genLower: 'Lowercase',
      genDigits: 'Digits', genSymbols: 'Symbols',
      cancel: 'Cancel', save: 'Save', delete: 'Delete', edit: 'Edit',
      lblUser: 'Username', lblModified: 'Modified',
      manageGroups: 'Manage Groups', newGroupPlaceholder: 'New group name...',
      copied: 'Copied', defaultGroup: 'General',
      suggestedGroups: ['General', 'Email', 'Social Media', 'Banking', 'Server', 'Shopping', 'Work'],
      suggestLabel: 'Suggested groups:',
      changePwTitle: 'Change Master Password',
      currentPw: 'Current password', newPw: 'New password', confirmNewPw: 'New password (confirm)',
      changePwSuccess: 'Password changed successfully', changePwError: 'Current password is wrong'
    },
    de: {
      vaultTitle: 'Passwort-Tresor', enterMaster: 'Geben Sie Ihr Master-Passwort ein', setMaster: 'Neues Master-Passwort festlegen',
      masterPlaceholder: 'Master-Passwort...', newMasterPlaceholder: 'Neues Master-Passwort...',
      confirmPlaceholder: 'Passwort bestätigen...',
      unlockBtn: 'Entsperren', createBtn: 'Tresor erstellen',
      passRequired: 'Passwort erforderlich', passMin6: 'Mindestens 6 Zeichen', passMismatch: 'Passwörter stimmen nicht überein',
      connError: 'Verbindungsfehler', wrongPass: 'Falsches Master-Passwort',
      allGroups: 'Alle Gruppen', all: 'Alle', searchPlaceholder: 'Suchen...',
      addBtn: 'Hinzufügen', groupsBtn: 'Gruppen', lockBtn: 'Sperren', changePwBtn: 'Passwort ändern',
      noEntries: 'Noch keine Einträge',
      editTitle: 'Bearbeiten', newEntry: 'Neuer Eintrag',
      lblTitle: 'Titel', titlePlaceholder: 'z.B. Gmail',
      lblGroup: 'Gruppe', lblUsername: 'Benutzername', userPlaceholder: 'benutzer@mail.com',
      lblPassword: 'Passwort', lblUrl: 'URL', lblNotes: 'Notizen',
      genPassword: 'Passwort generieren', genTitle: 'Passwort-Generator',
      genLength: 'Länge', genUpper: 'Großbuchstaben', genLower: 'Kleinbuchstaben',
      genDigits: 'Ziffern', genSymbols: 'Symbole',
      cancel: 'Abbrechen', save: 'Speichern', delete: 'Löschen', edit: 'Bearbeiten',
      lblUser: 'Benutzername', lblModified: 'Geändert',
      manageGroups: 'Gruppen verwalten', newGroupPlaceholder: 'Neuer Gruppenname...',
      copied: 'Kopiert', defaultGroup: 'Allgemein',
      suggestedGroups: ['Allgemein', 'E-Mail', 'Soziale Medien', 'Bank', 'Server', 'Einkaufen', 'Arbeit'],
      suggestLabel: 'Vorgeschlagene Gruppen:',
      changePwTitle: 'Master-Passwort ändern',
      currentPw: 'Aktuelles Passwort', newPw: 'Neues Passwort', confirmNewPw: 'Neues Passwort (bestätigen)',
      changePwSuccess: 'Passwort erfolgreich geändert', changePwError: 'Aktuelles Passwort ist falsch'
    },
    fr: {
      vaultTitle: 'Coffre-fort', enterMaster: 'Entrez votre mot de passe principal', setMaster: 'Définir un nouveau mot de passe principal',
      masterPlaceholder: 'Mot de passe principal...', newMasterPlaceholder: 'Nouveau mot de passe...',
      confirmPlaceholder: 'Confirmez le mot de passe...',
      unlockBtn: 'Déverrouiller', createBtn: 'Créer le coffre',
      passRequired: 'Mot de passe requis', passMin6: 'Au moins 6 caractères', passMismatch: 'Les mots de passe ne correspondent pas',
      connError: 'Erreur de connexion', wrongPass: 'Mauvais mot de passe principal',
      allGroups: 'Tous les groupes', all: 'Tous', searchPlaceholder: 'Rechercher...',
      addBtn: 'Ajouter', groupsBtn: 'Groupes', lockBtn: 'Verrouiller', changePwBtn: 'Changer le mot de passe',
      noEntries: 'Aucune entrée',
      editTitle: 'Modifier', newEntry: 'Nouvelle entrée',
      lblTitle: 'Titre', titlePlaceholder: 'ex: Gmail',
      lblGroup: 'Groupe', lblUsername: "Nom d'utilisateur", userPlaceholder: 'utilisateur@mail.com',
      lblPassword: 'Mot de passe', lblUrl: 'URL', lblNotes: 'Notes',
      genPassword: 'Générer un mot de passe', genTitle: 'Générateur de mots de passe',
      genLength: 'Longueur', genUpper: 'Majuscules', genLower: 'Minuscules',
      genDigits: 'Chiffres', genSymbols: 'Symboles',
      cancel: 'Annuler', save: 'Enregistrer', delete: 'Supprimer', edit: 'Modifier',
      lblUser: 'Utilisateur', lblModified: 'Modifié',
      manageGroups: 'Gérer les groupes', newGroupPlaceholder: 'Nouveau nom de groupe...',
      copied: 'Copié', defaultGroup: 'Général',
      suggestedGroups: ['Général', 'E-mail', 'Réseaux sociaux', 'Banque', 'Serveur', 'Shopping', 'Travail'],
      suggestLabel: 'Groupes suggérés :',
      changePwTitle: 'Changer le mot de passe principal',
      currentPw: 'Mot de passe actuel', newPw: 'Nouveau mot de passe', confirmNewPw: 'Nouveau mot de passe (confirmer)',
      changePwSuccess: 'Mot de passe changé avec succès', changePwError: 'Le mot de passe actuel est incorrect'
    },
    es: {
      vaultTitle: 'Bóveda de contraseñas', enterMaster: 'Ingrese su contraseña maestra', setMaster: 'Establezca una nueva contraseña maestra',
      masterPlaceholder: 'Contraseña maestra...', newMasterPlaceholder: 'Nueva contraseña maestra...',
      confirmPlaceholder: 'Confirmar contraseña...',
      unlockBtn: 'Desbloquear', createBtn: 'Crear bóveda',
      passRequired: 'Contraseña requerida', passMin6: 'Al menos 6 caracteres', passMismatch: 'Las contraseñas no coinciden',
      connError: 'Error de conexión', wrongPass: 'Contraseña maestra incorrecta',
      allGroups: 'Todos los grupos', all: 'Todos', searchPlaceholder: 'Buscar...',
      addBtn: 'Agregar', groupsBtn: 'Grupos', lockBtn: 'Bloquear', changePwBtn: 'Cambiar contraseña',
      noEntries: 'Sin entradas aún',
      editTitle: 'Editar', newEntry: 'Nueva entrada',
      lblTitle: 'Título', titlePlaceholder: 'Ej: Gmail',
      lblGroup: 'Grupo', lblUsername: 'Usuario', userPlaceholder: 'usuario@mail.com',
      lblPassword: 'Contraseña', lblUrl: 'URL', lblNotes: 'Notas',
      genPassword: 'Generar contraseña', genTitle: 'Generador de contraseñas',
      genLength: 'Longitud', genUpper: 'Mayúsculas', genLower: 'Minúsculas',
      genDigits: 'Dígitos', genSymbols: 'Símbolos',
      cancel: 'Cancelar', save: 'Guardar', delete: 'Eliminar', edit: 'Editar',
      lblUser: 'Usuario', lblModified: 'Modificado',
      manageGroups: 'Administrar grupos', newGroupPlaceholder: 'Nombre del nuevo grupo...',
      copied: 'Copiado', defaultGroup: 'General',
      suggestedGroups: ['General', 'Correo', 'Redes sociales', 'Banco', 'Servidor', 'Compras', 'Trabajo'],
      suggestLabel: 'Grupos sugeridos:',
      changePwTitle: 'Cambiar contraseña maestra',
      currentPw: 'Contraseña actual', newPw: 'Nueva contraseña', confirmNewPw: 'Nueva contraseña (confirmar)',
      changePwSuccess: 'Contraseña cambiada exitosamente', changePwError: 'La contraseña actual es incorrecta'
    },
    ru: {
      vaultTitle: 'Хранилище паролей', enterMaster: 'Введите мастер-пароль', setMaster: 'Установите новый мастер-пароль',
      masterPlaceholder: 'Мастер-пароль...', newMasterPlaceholder: 'Новый мастер-пароль...',
      confirmPlaceholder: 'Подтвердите пароль...',
      unlockBtn: 'Разблокировать', createBtn: 'Создать хранилище',
      passRequired: 'Требуется пароль', passMin6: 'Минимум 6 символов', passMismatch: 'Пароли не совпадают',
      connError: 'Ошибка соединения', wrongPass: 'Неверный мастер-пароль',
      allGroups: 'Все группы', all: 'Все', searchPlaceholder: 'Поиск...',
      addBtn: 'Добавить', groupsBtn: 'Группы', lockBtn: 'Заблокировать', changePwBtn: 'Сменить пароль',
      noEntries: 'Пока нет записей',
      editTitle: 'Редактировать', newEntry: 'Новая запись',
      lblTitle: 'Название', titlePlaceholder: 'Напр: Gmail',
      lblGroup: 'Группа', lblUsername: 'Имя пользователя', userPlaceholder: 'user@mail.com',
      lblPassword: 'Пароль', lblUrl: 'URL', lblNotes: 'Заметки',
      genPassword: 'Сгенерировать пароль', genTitle: 'Генератор паролей',
      genLength: 'Длина', genUpper: 'Заглавные', genLower: 'Строчные',
      genDigits: 'Цифры', genSymbols: 'Символы',
      cancel: 'Отмена', save: 'Сохранить', delete: 'Удалить', edit: 'Редактировать',
      lblUser: 'Пользователь', lblModified: 'Изменено',
      manageGroups: 'Управление группами', newGroupPlaceholder: 'Имя новой группы...',
      copied: 'Скопировано', defaultGroup: 'Общее',
      suggestedGroups: ['Общее', 'Почта', 'Соцсети', 'Банк', 'Сервер', 'Покупки', 'Работа'],
      suggestLabel: 'Предлагаемые группы:',
      changePwTitle: 'Сменить мастер-пароль',
      currentPw: 'Текущий пароль', newPw: 'Новый пароль', confirmNewPw: 'Новый пароль (подтвердить)',
      changePwSuccess: 'Пароль успешно изменён', changePwError: 'Текущий пароль неверен'
    }
  };

  function getLocale() {
    try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; }
  }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      const unlocked = ref(false);
      const vaultExists = ref(false);
      const masterPass = ref('');
      const masterPassConfirm = ref('');
      const loading = ref(false);
      const lockError = ref('');
      let cachedMasterPass = '';

      const entries = ref([]);
      const groups = ref([]);
      const activeGroup = ref('');
      const search = ref('');
      const selectedId = ref(null);

      // Detail / Edit
      const showDetail = ref(false);
      const isEditing = ref(false);
      const detailEntry = ref(null);
      const editingEntry = ref({});
      const showPass = ref(false);

      // Group manager
      const showGroups = ref(false);
      const newGroupName = ref('');

      // Password generator
      const showGenOpts = ref(false);
      const genLength = ref(20);
      const genUpper = ref(true);
      const genLower = ref(true);
      const genDigits = ref(true);
      const genSymbols = ref(true);

      // Copy toast
      const copyToast = ref(false);
      let toastTimer = null;

      // Auto-lock timer
      let autoLockTimer = null;
      const AUTO_LOCK_MS = 5 * 60 * 1000; // 5 min

      function resetAutoLock() {
        if (autoLockTimer) clearTimeout(autoLockTimer);
        if (unlocked.value) {
          autoLockTimer = setTimeout(() => lockVault(), AUTO_LOCK_MS);
        }
      }

      const filteredEntries = computed(() => {
        let list = entries.value;
        if (activeGroup.value) list = list.filter(e => e.group === activeGroup.value);
        if (search.value) {
          const q = search.value.toLowerCase();
          list = list.filter(e =>
            (e.title || '').toLowerCase().includes(q) ||
            (e.username || '').toLowerCase().includes(q) ||
            (e.url || '').toLowerCase().includes(q)
          );
        }
        return list;
      });

      // Boot: check vault existence
      async function checkVault() {
        try {
          const res = await fetch('/api/vault/exists');
          if (res.ok) {
            const d = await res.json();
            vaultExists.value = d.exists;
          }
        } catch {}
      }
      checkVault();

      async function unlock() {
        lockError.value = '';
        if (!masterPass.value) { lockError.value = L('passRequired'); return; }
        if (!vaultExists.value) {
          if (masterPass.value.length < 6) { lockError.value = L('passMin6'); return; }
          if (masterPass.value !== masterPassConfirm.value) { lockError.value = L('passMismatch'); return; }
          // Create new vault
          loading.value = true;
          try {
            const res = await fetch('/api/vault/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ masterPassword: masterPass.value, entries: [], groups: groups.value })
            });
            if (res.ok) {
              cachedMasterPass = masterPass.value;
              vaultExists.value = true;
              unlocked.value = true;
              resetAutoLock();
            }
          } catch {}
          loading.value = false;
          return;
        }
        // Unlock existing
        loading.value = true;
        try {
          const res = await fetch('/api/vault/unlock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ masterPassword: masterPass.value })
          });
          if (res.ok) {
            const data = await res.json();
            entries.value = data.entries || [];
            groups.value = data.groups || [];
            cachedMasterPass = masterPass.value;
            unlocked.value = true;
            resetAutoLock();
          } else {
            const err = await res.json();
            lockError.value = err.error || L('wrongPass');
          }
        } catch { lockError.value = L('connError'); }
        loading.value = false;
      }

      function lockVault() {
        unlocked.value = false;
        entries.value = [];
        cachedMasterPass = '';
        masterPass.value = '';
        masterPassConfirm.value = '';
        selectedId.value = null;
        showDetail.value = false;
        showPass.value = false;
        if (autoLockTimer) clearTimeout(autoLockTimer);
      }

      async function persistVault() {
        if (!cachedMasterPass) return;
        resetAutoLock();
        try {
          await fetch('/api/vault/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ masterPassword: cachedMasterPass, entries: entries.value, groups: groups.value })
          });
        } catch {}
      }

      function selectEntry(entry) {
        selectedId.value = entry.id;
        detailEntry.value = entry;
        showPass.value = false;
        isEditing.value = false;
        showDetail.value = true;
        resetAutoLock();
      }

      function openAdd() {
        editingEntry.value = {
          id: null,
          title: '',
          group: activeGroup.value || (groups.value.length ? groups.value[0] : ''),
          username: '',
          password: '',
          url: '',
          notes: '',
          color: COLORS[Math.floor(Math.random() * COLORS.length)]
        };
        isEditing.value = true;
        showGenOpts.value = false;
        showDetail.value = true;
        resetAutoLock();
      }

      function editEntry(entry) {
        editingEntry.value = { ...entry };
        isEditing.value = true;
        showGenOpts.value = false;
        resetAutoLock();
      }

      function saveEntry() {
        const e = editingEntry.value;
        if (!e.title) return;
        const now = new Date().toLocaleString(locale.value === 'tr' ? 'tr-TR' : locale.value === 'de' ? 'de-DE' : locale.value === 'fr' ? 'fr-FR' : locale.value === 'es' ? 'es-ES' : locale.value === 'ru' ? 'ru-RU' : 'en-US');
        if (e.id) {
          const idx = entries.value.findIndex(x => x.id === e.id);
          if (idx >= 0) {
            entries.value[idx] = { ...e, modified: now };
            detailEntry.value = entries.value[idx];
          }
        } else {
          e.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
          e.created = now;
          e.modified = now;
          entries.value.push(e);
          detailEntry.value = e;
          selectedId.value = e.id;
        }
        isEditing.value = false;
        persistVault();
      }

      function deleteEntry(entry) {
        entries.value = entries.value.filter(e => e.id !== entry.id);
        showDetail.value = false;
        selectedId.value = null;
        detailEntry.value = null;
        persistVault();
      }

      function generatePassword() {
        showGenOpts.value = true;
        let chars = '';
        if (genUpper.value) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (genLower.value) chars += 'abcdefghijklmnopqrstuvwxyz';
        if (genDigits.value) chars += '0123456789';
        if (genSymbols.value) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const arr = new Uint32Array(genLength.value);
        crypto.getRandomValues(arr);
        editingEntry.value.password = Array.from(arr, v => chars[v % chars.length]).join('');
      }

      function copyText(text) {
        navigator.clipboard.writeText(text);
        copyToast.value = true;
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { copyToast.value = false; }, 1500);
        resetAutoLock();
      }

      // Group management
      function openGroupManager() {
        showGroups.value = true;
        resetAutoLock();
      }

      function addGroup() {
        const name = newGroupName.value.trim();
        if (name && !groups.value.includes(name)) {
          groups.value.push(name);
          persistVault();
        }
        newGroupName.value = '';
      }

      function removeGroup(i) {
        const name = groups.value[i];
        groups.value.splice(i, 1);
        entries.value.forEach(e => { if (e.group === name) e.group = ''; });
        if (activeGroup.value === name) activeGroup.value = '';
        persistVault();
      }

      // ── Change Master Password ──
      const showChangePw = ref(false);
      const changePwCurrent = ref('');
      const changePwNew = ref('');
      const changePwConfirm = ref('');
      const changePwError = ref('');
      const changePwLoading = ref(false);
      const changePwSuccess = ref(false);

      function openChangePw() {
        changePwCurrent.value = '';
        changePwNew.value = '';
        changePwConfirm.value = '';
        changePwError.value = '';
        changePwSuccess.value = false;
        showChangePw.value = true;
        resetAutoLock();
      }

      async function submitChangePw() {
        changePwError.value = '';
        changePwSuccess.value = false;
        if (!changePwCurrent.value) { changePwError.value = L('passRequired'); return; }
        if (changePwNew.value.length < 6) { changePwError.value = L('passMin6'); return; }
        if (changePwNew.value !== changePwConfirm.value) { changePwError.value = L('passMismatch'); return; }
        changePwLoading.value = true;
        try {
          const res = await fetch('/api/vault/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword: changePwCurrent.value, newPassword: changePwNew.value })
          });
          if (res.ok) {
            cachedMasterPass = changePwNew.value;
            changePwSuccess.value = true;
            changePwCurrent.value = '';
            changePwNew.value = '';
            changePwConfirm.value = '';
            setTimeout(() => { showChangePw.value = false; }, 1500);
          } else {
            changePwError.value = L('changePwError');
          }
        } catch { changePwError.value = L('connError'); }
        changePwLoading.value = false;
      }

      const suggestedGroupsFiltered = computed(() => {
        const lang = LANGS[locale.value] || LANGS.tr;
        const suggestions = lang.suggestedGroups || LANGS.tr.suggestedGroups;
        return suggestions.filter(s => !groups.value.includes(s));
      });

      function addSuggestedGroup(name) {
        if (!groups.value.includes(name)) {
          groups.value.push(name);
          persistVault();
        }
      }

      function addAllSuggested() {
        suggestedGroupsFiltered.value.forEach(s => {
          if (!groups.value.includes(s)) groups.value.push(s);
        });
        persistVault();
      }

      let localeTimer = null;
      onMounted(() => {
        localeTimer = setInterval(() => { locale.value = getLocale(); }, 1000);
      });

      onUnmounted(() => {
        if (autoLockTimer) clearTimeout(autoLockTimer);
        if (toastTimer) clearTimeout(toastTimer);
        if (localeTimer) clearInterval(localeTimer);
      });

      return {
        L,
        unlocked, vaultExists, masterPass, masterPassConfirm, loading, lockError,
        entries, groups, activeGroup, search, selectedId,
        filteredEntries, showDetail, isEditing, detailEntry, editingEntry, showPass,
        showGroups, newGroupName, showGenOpts, genLength, genUpper, genLower, genDigits, genSymbols,
        copyToast,
        unlock, lockVault, selectEntry, openAdd, editEntry, saveEntry, deleteEntry,
        generatePassword, copyText, openGroupManager, addGroup, removeGroup,
        showChangePw, changePwCurrent, changePwNew, changePwConfirm, changePwError,
        changePwLoading, changePwSuccess, openChangePw, submitChangePw,
        suggestedGroupsFiltered, addSuggestedGroup, addAllSuggested
      };
    }
  };
})(Vue);
