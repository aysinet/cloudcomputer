({
  setup() {
    const { ref, computed, onMounted, onUnmounted } = Vue;
    const ElMessageBox = (window.ElementPlus && window.ElementPlus.ElMessageBox) || { confirm: () => Promise.resolve() };

    const LANGS = {
      tr: {
        title:'Yedekleme & Geri Yükleme', backup:'Yedekle', restore:'Geri Yükle',
        backups:'Yedekler', noBackups:'Henüz yedek yok',
        format:'Format', createBackup:'Yedek Oluştur', download:'İndir', delete:'Sil',
        deleteConfirm:'Bu yedeği silmek istediğinize emin misiniz?',
        restoreConfirm:'Bu yedekten geri yükleme yapmak istiyor musunuz?\n\nTüm açık programlar kapatılacak ve mevcut veriler yedeğin içeriğiyle değiştirilecek.',
        restoreBtn:'Geri Yükle', uploadBackup:'Yedek Dosyası Yükle',
        creating:'Yedek oluşturuluyor...', restoring:'Geri yükleniyor...',
        success:'Başarılı', error:'Hata', backupCreated:'Yedek oluşturuldu',
        restoreDone:'Geri yükleme tamamlandı. Sayfa yenilenecek.',
        size:'Boyut', date:'Tarih', actions:'İşlemler',
        closeWarning:'Tüm açık pencereler kapatılacak.',
        tabBackup:'Yedekle', tabRestore:'Geri Yükle',
        selectFile:'Dosya Seç', orSelectExisting:'veya mevcut bir yedek seçin',
        uploading:'Yükleniyor...', uploaded:'Yüklendi'
      },
      en: {
        title:'Backup & Restore', backup:'Backup', restore:'Restore',
        backups:'Backups', noBackups:'No backups yet',
        format:'Format', createBackup:'Create Backup', download:'Download', delete:'Delete',
        deleteConfirm:'Are you sure you want to delete this backup?',
        restoreConfirm:'Do you want to restore from this backup?\n\nAll open programs will be closed and current data will be replaced with the backup contents.',
        restoreBtn:'Restore', uploadBackup:'Upload Backup File',
        creating:'Creating backup...', restoring:'Restoring...',
        success:'Success', error:'Error', backupCreated:'Backup created',
        restoreDone:'Restore completed. Page will reload.',
        size:'Size', date:'Date', actions:'Actions',
        closeWarning:'All open windows will be closed.',
        tabBackup:'Backup', tabRestore:'Restore',
        selectFile:'Select File', orSelectExisting:'or select an existing backup',
        uploading:'Uploading...', uploaded:'Uploaded'
      },
      de: {
        title:'Sicherung & Wiederherstellung', backup:'Sichern', restore:'Wiederherstellen',
        backups:'Sicherungen', noBackups:'Noch keine Sicherungen',
        format:'Format', createBackup:'Sicherung erstellen', download:'Herunterladen', delete:'Löschen',
        deleteConfirm:'Möchten Sie diese Sicherung wirklich löschen?',
        restoreConfirm:'Möchten Sie aus dieser Sicherung wiederherstellen?\n\nAlle offenen Programme werden geschlossen und aktuelle Daten werden ersetzt.',
        restoreBtn:'Wiederherstellen', uploadBackup:'Sicherungsdatei hochladen',
        creating:'Sicherung wird erstellt...', restoring:'Wiederherstellung...',
        success:'Erfolgreich', error:'Fehler', backupCreated:'Sicherung erstellt',
        restoreDone:'Wiederherstellung abgeschlossen. Seite wird neu geladen.',
        size:'Größe', date:'Datum', actions:'Aktionen',
        closeWarning:'Alle offenen Fenster werden geschlossen.',
        tabBackup:'Sichern', tabRestore:'Wiederherstellen',
        selectFile:'Datei wählen', orSelectExisting:'oder wählen Sie eine vorhandene Sicherung',
        uploading:'Hochladen...', uploaded:'Hochgeladen'
      },
      fr: {
        title:'Sauvegarde & Restauration', backup:'Sauvegarder', restore:'Restaurer',
        backups:'Sauvegardes', noBackups:'Pas encore de sauvegardes',
        format:'Format', createBackup:'Créer une sauvegarde', download:'Télécharger', delete:'Supprimer',
        deleteConfirm:'Êtes-vous sûr de vouloir supprimer cette sauvegarde ?',
        restoreConfirm:'Voulez-vous restaurer à partir de cette sauvegarde ?\n\nTous les programmes ouverts seront fermés et les données actuelles seront remplacées.',
        restoreBtn:'Restaurer', uploadBackup:'Charger un fichier de sauvegarde',
        creating:'Création de la sauvegarde...', restoring:'Restauration...',
        success:'Succès', error:'Erreur', backupCreated:'Sauvegarde créée',
        restoreDone:'Restauration terminée. La page va se recharger.',
        size:'Taille', date:'Date', actions:'Actions',
        closeWarning:'Toutes les fenêtres ouvertes seront fermées.',
        tabBackup:'Sauvegarder', tabRestore:'Restaurer',
        selectFile:'Choisir un fichier', orSelectExisting:'ou sélectionnez une sauvegarde existante',
        uploading:'Chargement...', uploaded:'Chargé'
      },
      es: {
        title:'Copia de Seguridad & Restaurar', backup:'Respaldar', restore:'Restaurar',
        backups:'Copias de seguridad', noBackups:'Aún no hay copias de seguridad',
        format:'Formato', createBackup:'Crear copia', download:'Descargar', delete:'Eliminar',
        deleteConfirm:'¿Estás seguro de que quieres eliminar esta copia de seguridad?',
        restoreConfirm:'¿Desea restaurar desde esta copia de seguridad?\n\nTodos los programas abiertos se cerrarán y los datos actuales serán reemplazados.',
        restoreBtn:'Restaurar', uploadBackup:'Subir archivo de respaldo',
        creating:'Creando copia de seguridad...', restoring:'Restaurando...',
        success:'Éxito', error:'Error', backupCreated:'Copia de seguridad creada',
        restoreDone:'Restauración completada. La página se recargará.',
        size:'Tamaño', date:'Fecha', actions:'Acciones',
        closeWarning:'Todas las ventanas abiertas se cerrarán.',
        tabBackup:'Respaldar', tabRestore:'Restaurar',
        selectFile:'Seleccionar archivo', orSelectExisting:'o seleccione una copia existente',
        uploading:'Subiendo...', uploaded:'Subido'
      },
      ru: {
        title:'Резервное копирование', backup:'Создать', restore:'Восстановить',
        backups:'Резервные копии', noBackups:'Пока нет резервных копий',
        format:'Формат', createBackup:'Создать резервную копию', download:'Скачать', delete:'Удалить',
        deleteConfirm:'Вы уверены, что хотите удалить эту резервную копию?',
        restoreConfirm:'Вы хотите восстановить из этой резервной копии?\n\nВсе открытые программы будут закрыты, а текущие данные заменены содержимым копии.',
        restoreBtn:'Восстановить', uploadBackup:'Загрузить файл резервной копии',
        creating:'Создание резервной копии...', restoring:'Восстановление...',
        success:'Успешно', error:'Ошибка', backupCreated:'Резервная копия создана',
        restoreDone:'Восстановление завершено. Страница перезагрузится.',
        size:'Размер', date:'Дата', actions:'Действия',
        closeWarning:'Все открытые окна будут закрыты.',
        tabBackup:'Создать', tabRestore:'Восстановить',
        selectFile:'Выбрать файл', orSelectExisting:'или выберите существующую копию',
        uploading:'Загрузка...', uploaded:'Загружено'
      },
    zh: { title: 'Backup & Restore', backup: 'Backup', restore: 'Restore', backups: 'Backups', noBackups: 'No backups yet', format: 'Format', createBackup: 'Create Backup', download: 'Download', delete: 'Delete', deleteConfirm: 'Are you sure you want to delete this backup?', restoreConfirm: 'Do you want to restore from this backup?\n\nAll open programs will be closed and current data will be replaced with the backup contents.', restoreBtn: 'Restore', uploadBackup: 'Upload Backup File', creating: 'Creating backup...', restoring: 'Restoring...', success: 'Success', error: 'Error', backupCreated: 'Backup created', restoreDone: 'Restore completed. Page will reload.', size: 'Size', date: 'Date', actions: 'Actions', closeWarning: 'All open windows will be closed.', tabBackup: 'Backup', tabRestore: 'Restore', selectFile: 'Select File', orSelectExisting: 'or select an existing backup', uploading: 'Uploading...', uploaded: 'Uploaded' },
    ja: { title: 'Backup & Restore', backup: 'Backup', restore: 'Restore', backups: 'Backups', noBackups: 'No backups yet', format: 'Format', createBackup: 'Create Backup', download: 'Download', delete: 'Delete', deleteConfirm: 'Are you sure you want to delete this backup?', restoreConfirm: 'Do you want to restore from this backup?\n\nAll open programs will be closed and current data will be replaced with the backup contents.', restoreBtn: 'Restore', uploadBackup: 'Upload Backup File', creating: 'Creating backup...', restoring: 'Restoring...', success: 'Success', error: 'Error', backupCreated: 'Backup created', restoreDone: 'Restore completed. Page will reload.', size: 'Size', date: 'Date', actions: 'Actions', closeWarning: 'All open windows will be closed.', tabBackup: 'Backup', tabRestore: 'Restore', selectFile: 'Select File', orSelectExisting: 'or select an existing backup', uploading: 'Uploading...', uploaded: 'Uploaded' },
    it: { title: 'Backup & Restore', backup: 'Backup', restore: 'Restore', backups: 'Backups', noBackups: 'No backups yet', format: 'Format', createBackup: 'Create Backup', download: 'Download', delete: 'Delete', deleteConfirm: 'Are you sure you want to delete this backup?', restoreConfirm: 'Do you want to restore from this backup?\n\nAll open programs will be closed and current data will be replaced with the backup contents.', restoreBtn: 'Restore', uploadBackup: 'Upload Backup File', creating: 'Creating backup...', restoring: 'Restoring...', success: 'Success', error: 'Error', backupCreated: 'Backup created', restoreDone: 'Restore completed. Page will reload.', size: 'Size', date: 'Date', actions: 'Actions', closeWarning: 'All open windows will be closed.', tabBackup: 'Backup', tabRestore: 'Restore', selectFile: 'Select File', orSelectExisting: 'or select an existing backup', uploading: 'Uploading...', uploaded: 'Uploaded' }
  };

    function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }
    const locale = ref(getLocale());
    function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

    function getToken() { try { return localStorage.getItem('auth_token') || ''; } catch { return ''; } }
    function authHeaders() { return { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }

    const tab = ref('backup');
    const format = ref('zip');
    const backups = ref([]);
    const busy = ref(false);
    const busyText = ref('');
    const statusMsg = ref('');
    const statusType = ref('');

    async function loadBackups() {
      try {
        const r = await fetch('/api/backup/list', { headers: authHeaders() });
        if (r.ok) backups.value = await r.json();
      } catch (e) { console.error('Load backups error', e); }
    }

    function formatSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }

    function formatDate(ms) {
      const d = new Date(ms);
      const pad = n => String(n).padStart(2, '0');
      return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' +
             pad(d.getHours()) + ':' + pad(d.getMinutes());
    }

    function closeAllOpenWindows() {
      // Access the parent Vue app's closeAllWindows via the DOM root
      try {
        const appEl = document.getElementById('app');
        if (appEl && appEl.__vue_app__) {
          const rootComp = appEl.__vue_app__._instance;
          if (rootComp && rootComp.exposed && rootComp.exposed.closeAllWindows) {
            rootComp.exposed.closeAllWindows();
            return;
          }
        }
      } catch {}
      // Fallback: try to close via WinBox DOM nodes
      try {
        document.querySelectorAll('.winbox').forEach(el => {
          const closeBtn = el.querySelector('.wb-close');
          if (closeBtn) closeBtn.click();
        });
      } catch {}
    }

    function collectLocalStorage() {
      const data = {};
      const keys = ['auth_token', 'sys_locale', 'system_volume', 'calendarEvents',
                     'desktopNotifications', 'iconDesktopMap'];
      // Also save wb_ positions
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (keys.includes(key) || key.startsWith('wb_'))) {
          data[key] = localStorage.getItem(key);
        }
      }
      return data;
    }

    function restoreLocalStorage(data) {
      if (!data || typeof data !== 'object') return;
      // Keep auth_token as-is (don't overwrite current session)
      const currentToken = localStorage.getItem('auth_token');
      for (const [key, value] of Object.entries(data)) {
        if (key === 'auth_token') continue;
        try { localStorage.setItem(key, value); } catch {}
      }
      if (currentToken) localStorage.setItem('auth_token', currentToken);
    }

    async function createBackup() {
      if (busy.value) return;
      busy.value = true;
      busyText.value = L('creating');
      statusMsg.value = '';

      try {
        // 1. Send localStorage data to server
        const lsData = collectLocalStorage();
        await fetch('/api/backup/client-data', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({ data: lsData })
        });

        // 2. Create backup archive
        const r = await fetch('/api/backup/create', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({ format: format.value })
        });
        const result = await r.json();
        if (!r.ok) throw new Error(result.error || 'Backup failed');

        statusMsg.value = L('backupCreated') + ' — ' + result.filename + ' (' + formatSize(result.size) + ')';
        statusType.value = 'success';
        await loadBackups();
      } catch (e) {
        statusMsg.value = L('error') + ': ' + e.message;
        statusType.value = 'error';
      } finally {
        busy.value = false;
        busyText.value = '';
      }
    }

    function downloadBackup(filename) {
      const token = getToken();
      const a = document.createElement('a');
      a.href = '/api/backup/download/' + encodeURIComponent(filename) + '?token=' + encodeURIComponent(token);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    async function deleteBackup(filename) {
      try { await ElMessageBox.confirm(L('deleteConfirm'), { confirmButtonText: 'OK', cancelButtonText: L('cancel') || 'Cancel', type: 'warning' }); } catch { return; }
      try {
        await fetch('/api/backup/' + encodeURIComponent(filename), {
          method: 'DELETE', headers: authHeaders()
        });
        await loadBackups();
      } catch (e) { console.error('Delete error', e); }
    }

    async function restoreFromBackup(filename) {
      try { await ElMessageBox.confirm(L('restoreConfirm'), { confirmButtonText: 'OK', cancelButtonText: L('cancel') || 'Cancel', type: 'warning' }); } catch { return; }
      if (busy.value) return;
      busy.value = true;
      busyText.value = L('restoring');
      statusMsg.value = '';

      try {
        // Close all open windows first
        closeAllOpenWindows();
        await new Promise(r => setTimeout(r, 500));

        const r = await fetch('/api/backup/restore', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({ filename })
        });
        const result = await r.json();
        if (!r.ok) throw new Error(result.error || 'Restore failed');

        // Restore localStorage from backup
        if (result.clientData) {
          restoreLocalStorage(result.clientData);
        }

        statusMsg.value = L('restoreDone');
        statusType.value = 'success';

        // Reload page after short delay
        setTimeout(() => { location.reload(); }, 2000);
      } catch (e) {
        statusMsg.value = L('error') + ': ' + e.message;
        statusType.value = 'error';
        busy.value = false;
        busyText.value = '';
      }
    }

    function triggerUpload() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.zip,.7z';
      input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;
        busy.value = true;
        busyText.value = L('uploading');
        statusMsg.value = '';
        try {
          const fd = new FormData();
          fd.append('file', file);
          const token = getToken();
          const r = await fetch('/api/backup/upload', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            body: fd
          });
          const result = await r.json();
          if (!r.ok) throw new Error(result.error || 'Upload failed');
          statusMsg.value = L('uploaded') + ' — ' + result.filename;
          statusType.value = 'success';
          await loadBackups();
        } catch (e) {
          statusMsg.value = L('error') + ': ' + e.message;
          statusType.value = 'error';
        } finally {
          busy.value = false;
          busyText.value = '';
        }
      };
      input.click();
    }

    let localeTimer = null;
    onMounted(async () => {
      await loadBackups();
      localeTimer = setInterval(() => { locale.value = getLocale(); }, 1000);
    });
    onUnmounted(() => { if (localeTimer) clearInterval(localeTimer); });

    return {
      L, tab, format, backups, busy, busyText, statusMsg, statusType,
      createBackup, downloadBackup, deleteBackup, restoreFromBackup,
      triggerUpload, formatSize, formatDate, loadBackups
    };
  }
})
