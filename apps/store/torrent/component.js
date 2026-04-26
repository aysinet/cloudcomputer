({
  setup() {
    const { ref, computed, watch, onMounted, onUnmounted, nextTick } = Vue;
    const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success(){}, error(){}, warning(){}, info(){} };
    const ElMessageBox = (window.ElementPlus && window.ElementPlus.ElMessageBox) || { confirm: () => Promise.resolve() };

    /* ── i18n ── */
    const LANGS = {
      tr: {
        title:'Torrent', addTorrent:'Torrent Ekle', magnetLink:'Magnet Bağlantısı',
        torrentFile:'.torrent Dosyası', add:'Ekle', cancel:'İptal', pause:'Duraklat',
        resume:'Devam Et', remove:'Kaldır', removeData:'Verilerle birlikte sil',
        settings:'Ayarlar', name:'Ad', size:'Boyut', progress:'İlerleme',
        status:'Durum', downSpeed:'İndirme', upSpeed:'Yükleme', peers:'Eşler',
        seeds:'Seed', eta:'Kalan Süre', ratio:'Oran', added:'Eklendi',
        all:'Tümü', downloading:'İndiriliyor', seeding:'Paylaşılıyor',
        completed:'Tamamlandı', paused:'Duraklatıldı', queued:'Sırada',
        error:'Hata', general:'Genel', files:'Dosyalar', peerList:'Eşler',
        trackers:'Tracker\'lar', info:'Bilgi', noTorrents:'Henüz torrent yok',
        addMagnet:'Magnet link yapıştır...', selectFile:'.torrent dosyası seç',
        deleteConfirm:'Bu torrenti kaldırmak istediğinize emin misiniz?',
        yes:'Evet', totalDown:'Toplam İndirme', totalUp:'Toplam Yükleme',
        downloadPath:'İndirme Yolu', maxDown:'Maks İndirme (KB/s)', maxUp:'Maks Yükleme (KB/s)',
        unlimited:'Sınırsız', save:'Kaydet', port:'Port', dht:'DHT',
        fileName:'Dosya Adı', fileSize:'Boyut', fileProg:'İlerleme',
        peerAddr:'Adres', peerClient:'İstemci', peerDown:'İndirme', peerUp:'Yükleme',
        trackerUrl:'Tracker URL', trackerStatus:'Durum', hash:'Info Hash',
        created:'Oluşturulma', comment:'Açıklama', creator:'Oluşturan',
        private:'Özel', pieces:'Parça', pieceLen:'Parça Boyutu',
        magnetPlaceholder:'magnet:?xt=urn:btih:...', or:'veya',
        startAll:'Tümünü Başlat', pauseAll:'Tümünü Duraklat',
        connected:'Bağlı', disconnected:'Bağlantı kesildi',
        notInstalled:'WebTorrent sunucuda kurulu değil. npm install webtorrent yapın.'
      },
      en: {
        title:'Torrent', addTorrent:'Add Torrent', magnetLink:'Magnet Link',
        torrentFile:'.torrent File', add:'Add', cancel:'Cancel', pause:'Pause',
        resume:'Resume', remove:'Remove', removeData:'Delete with data',
        settings:'Settings', name:'Name', size:'Size', progress:'Progress',
        status:'Status', downSpeed:'Download', upSpeed:'Upload', peers:'Peers',
        seeds:'Seeds', eta:'ETA', ratio:'Ratio', added:'Added',
        all:'All', downloading:'Downloading', seeding:'Seeding',
        completed:'Completed', paused:'Paused', queued:'Queued',
        error:'Error', general:'General', files:'Files', peerList:'Peers',
        trackers:'Trackers', info:'Info', noTorrents:'No torrents yet',
        addMagnet:'Paste magnet link...', selectFile:'Select .torrent file',
        deleteConfirm:'Are you sure you want to remove this torrent?',
        yes:'Yes', totalDown:'Total Download', totalUp:'Total Upload',
        downloadPath:'Download Path', maxDown:'Max Download (KB/s)', maxUp:'Max Upload (KB/s)',
        unlimited:'Unlimited', save:'Save', port:'Port', dht:'DHT',
        fileName:'File Name', fileSize:'Size', fileProg:'Progress',
        peerAddr:'Address', peerClient:'Client', peerDown:'Download', peerUp:'Upload',
        trackerUrl:'Tracker URL', trackerStatus:'Status', hash:'Info Hash',
        created:'Created', comment:'Comment', creator:'Creator',
        private:'Private', pieces:'Pieces', pieceLen:'Piece Size',
        magnetPlaceholder:'magnet:?xt=urn:btih:...', or:'or',
        startAll:'Start All', pauseAll:'Pause All',
        connected:'Connected', disconnected:'Disconnected',
        notInstalled:'WebTorrent not installed on server. Run npm install webtorrent.'
      },
      de: {
        title:'Torrent', addTorrent:'Torrent hinzufügen', magnetLink:'Magnet-Link',
        torrentFile:'.torrent-Datei', add:'Hinzufügen', cancel:'Abbrechen', pause:'Pause',
        resume:'Fortsetzen', remove:'Entfernen', removeData:'Mit Daten löschen',
        settings:'Einstellungen', name:'Name', size:'Größe', progress:'Fortschritt',
        status:'Status', downSpeed:'Download', upSpeed:'Upload', peers:'Peers',
        seeds:'Seeds', eta:'Verbleibend', ratio:'Verhältnis', added:'Hinzugefügt',
        all:'Alle', downloading:'Wird heruntergeladen', seeding:'Wird geteilt',
        completed:'Abgeschlossen', paused:'Pausiert', queued:'In Warteschlange',
        error:'Fehler', general:'Allgemein', files:'Dateien', peerList:'Peers',
        trackers:'Tracker', info:'Info', noTorrents:'Noch keine Torrents',
        addMagnet:'Magnet-Link einfügen...', selectFile:'.torrent-Datei auswählen',
        deleteConfirm:'Möchten Sie diesen Torrent wirklich entfernen?',
        yes:'Ja', totalDown:'Gesamt-Download', totalUp:'Gesamt-Upload',
        downloadPath:'Download-Pfad', maxDown:'Max Download (KB/s)', maxUp:'Max Upload (KB/s)',
        unlimited:'Unbegrenzt', save:'Speichern', port:'Port', dht:'DHT',
        fileName:'Dateiname', fileSize:'Größe', fileProg:'Fortschritt',
        peerAddr:'Adresse', peerClient:'Client', peerDown:'Download', peerUp:'Upload',
        trackerUrl:'Tracker-URL', trackerStatus:'Status', hash:'Info-Hash',
        created:'Erstellt', comment:'Kommentar', creator:'Ersteller',
        private:'Privat', pieces:'Teile', pieceLen:'Teilgröße',
        magnetPlaceholder:'magnet:?xt=urn:btih:...', or:'oder',
        startAll:'Alle starten', pauseAll:'Alle pausieren',
        connected:'Verbunden', disconnected:'Getrennt',
        notInstalled:'WebTorrent ist nicht installiert. Führen Sie npm install webtorrent aus.'
      },
      fr: {
        title:'Torrent', addTorrent:'Ajouter un Torrent', magnetLink:'Lien Magnet',
        torrentFile:'Fichier .torrent', add:'Ajouter', cancel:'Annuler', pause:'Pause',
        resume:'Reprendre', remove:'Supprimer', removeData:'Supprimer avec les données',
        settings:'Paramètres', name:'Nom', size:'Taille', progress:'Progression',
        status:'Statut', downSpeed:'Téléchargement', upSpeed:'Upload', peers:'Pairs',
        seeds:'Seeds', eta:'Temps restant', ratio:'Ratio', added:'Ajouté',
        all:'Tous', downloading:'En téléchargement', seeding:'En partage',
        completed:'Terminé', paused:'En pause', queued:'En attente',
        error:'Erreur', general:'Général', files:'Fichiers', peerList:'Pairs',
        trackers:'Trackers', info:'Info', noTorrents:'Aucun torrent',
        addMagnet:'Collez un lien magnet...', selectFile:'Sélectionner un fichier .torrent',
        deleteConfirm:'Êtes-vous sûr de vouloir supprimer ce torrent ?',
        yes:'Oui', totalDown:'Total téléchargé', totalUp:'Total uploadé',
        downloadPath:'Chemin de téléchargement', maxDown:'Max Download (KB/s)', maxUp:'Max Upload (KB/s)',
        unlimited:'Illimité', save:'Enregistrer', port:'Port', dht:'DHT',
        fileName:'Nom du fichier', fileSize:'Taille', fileProg:'Progression',
        peerAddr:'Adresse', peerClient:'Client', peerDown:'Téléchargement', peerUp:'Upload',
        trackerUrl:'URL du Tracker', trackerStatus:'Statut', hash:'Info Hash',
        created:'Créé', comment:'Commentaire', creator:'Créateur',
        private:'Privé', pieces:'Pièces', pieceLen:'Taille de pièce',
        magnetPlaceholder:'magnet:?xt=urn:btih:...', or:'ou',
        startAll:'Tout démarrer', pauseAll:'Tout mettre en pause',
        connected:'Connecté', disconnected:'Déconnecté',
        notInstalled:'WebTorrent non installé sur le serveur. Exécutez npm install webtorrent.'
      },
      es: {
        title:'Torrent', addTorrent:'Agregar Torrent', magnetLink:'Enlace Magnet',
        torrentFile:'Archivo .torrent', add:'Agregar', cancel:'Cancelar', pause:'Pausar',
        resume:'Reanudar', remove:'Eliminar', removeData:'Eliminar con datos',
        settings:'Ajustes', name:'Nombre', size:'Tamaño', progress:'Progreso',
        status:'Estado', downSpeed:'Descarga', upSpeed:'Subida', peers:'Pares',
        seeds:'Seeds', eta:'Tiempo restante', ratio:'Ratio', added:'Agregado',
        all:'Todos', downloading:'Descargando', seeding:'Compartiendo',
        completed:'Completado', paused:'Pausado', queued:'En cola',
        error:'Error', general:'General', files:'Archivos', peerList:'Pares',
        trackers:'Trackers', info:'Info', noTorrents:'Sin torrents',
        addMagnet:'Pega un enlace magnet...', selectFile:'Seleccionar archivo .torrent',
        deleteConfirm:'¿Estás seguro de que quieres eliminar este torrent?',
        yes:'Sí', totalDown:'Descarga total', totalUp:'Subida total',
        downloadPath:'Ruta de descarga', maxDown:'Máx Descarga (KB/s)', maxUp:'Máx Subida (KB/s)',
        unlimited:'Ilimitado', save:'Guardar', port:'Puerto', dht:'DHT',
        fileName:'Nombre de archivo', fileSize:'Tamaño', fileProg:'Progreso',
        peerAddr:'Dirección', peerClient:'Cliente', peerDown:'Descarga', peerUp:'Subida',
        trackerUrl:'URL del Tracker', trackerStatus:'Estado', hash:'Info Hash',
        created:'Creado', comment:'Comentario', creator:'Creador',
        private:'Privado', pieces:'Piezas', pieceLen:'Tamaño de pieza',
        magnetPlaceholder:'magnet:?xt=urn:btih:...', or:'o',
        startAll:'Iniciar todos', pauseAll:'Pausar todos',
        connected:'Conectado', disconnected:'Desconectado',
        notInstalled:'WebTorrent no está instalado en el servidor. Ejecute npm install webtorrent.'
      },
      ru: {
        title:'Торрент', addTorrent:'Добавить торрент', magnetLink:'Magnet-ссылка',
        torrentFile:'.torrent файл', add:'Добавить', cancel:'Отмена', pause:'Пауза',
        resume:'Продолжить', remove:'Удалить', removeData:'Удалить с данными',
        settings:'Настройки', name:'Имя', size:'Размер', progress:'Прогресс',
        status:'Статус', downSpeed:'Загрузка', upSpeed:'Отдача', peers:'Пиры',
        seeds:'Сиды', eta:'Осталось', ratio:'Рейтинг', added:'Добавлен',
        all:'Все', downloading:'Загружается', seeding:'Раздаётся',
        completed:'Завершён', paused:'На паузе', queued:'В очереди',
        error:'Ошибка', general:'Общие', files:'Файлы', peerList:'Пиры',
        trackers:'Трекеры', info:'Инфо', noTorrents:'Нет торрентов',
        addMagnet:'Вставьте magnet-ссылку...', selectFile:'Выберите .torrent файл',
        deleteConfirm:'Вы уверены, что хотите удалить этот торрент?',
        yes:'Да', totalDown:'Всего загружено', totalUp:'Всего отдано',
        downloadPath:'Путь загрузки', maxDown:'Макс загрузка (КБ/с)', maxUp:'Макс отдача (КБ/с)',
        unlimited:'Без ограничений', save:'Сохранить', port:'Порт', dht:'DHT',
        fileName:'Имя файла', fileSize:'Размер', fileProg:'Прогресс',
        peerAddr:'Адрес', peerClient:'Клиент', peerDown:'Загрузка', peerUp:'Отдача',
        trackerUrl:'URL трекера', trackerStatus:'Статус', hash:'Инфо-хеш',
        created:'Создан', comment:'Комментарий', creator:'Создатель',
        private:'Приватный', pieces:'Части', pieceLen:'Размер части',
        magnetPlaceholder:'magnet:?xt=urn:btih:...', or:'или',
        startAll:'Запустить все', pauseAll:'Приостановить все',
        connected:'Подключён', disconnected:'Отключён',
        notInstalled:'WebTorrent не установлен на сервере. Выполните npm install webtorrent.'
      }
    };

    function getLocale() { return localStorage.getItem('sys_locale') || 'tr'; }
    var locale = ref(getLocale());
    var t = function(k) { return (LANGS[locale.value] && LANGS[locale.value][k]) || LANGS.en[k] || k; };
    var localeTimer;

    /* ── Auth ── */
    function getToken() { return localStorage.getItem('auth_token'); }
    function authHeaders() { return { Authorization: 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }

    /* ── State ── */
    var torrents = ref([]);
    var selectedHash = ref('');
    var filter = ref('all');
    var addDialogVisible = ref(false);
    var settingsDialogVisible = ref(false);
    var magnetInput = ref('');
    var detailTab = ref('general');
    var wsConnected = ref(false);
    var serverReady = ref(true);
    var ws = null;

    /* settings */
    var stDownPath = ref('downloads');
    var stMaxDown = ref(0);
    var stMaxUp = ref(0);

    /* ── Computed ── */
    var filteredTorrents = computed(function() {
      if (filter.value === 'all') return torrents.value;
      return torrents.value.filter(function(t) { return t.status === filter.value; });
    });

    var selectedTorrent = computed(function() {
      return torrents.value.find(function(t) { return t.infoHash === selectedHash.value; }) || null;
    });

    var totalDownSpeed = computed(function() {
      return torrents.value.reduce(function(s, t) { return s + (t.downloadSpeed || 0); }, 0);
    });

    var totalUpSpeed = computed(function() {
      return torrents.value.reduce(function(s, t) { return s + (t.uploadSpeed || 0); }, 0);
    });

    var filterCounts = computed(function() {
      var c = { all: torrents.value.length, downloading: 0, seeding: 0, completed: 0, paused: 0, error: 0 };
      torrents.value.forEach(function(t) { if (c[t.status] !== undefined) c[t.status]++; });
      return c;
    });

    /* ── Formatting ── */
    function formatBytes(b) {
      if (!b || b === 0) return '0 B';
      var units = ['B','KB','MB','GB','TB'];
      var i = Math.floor(Math.log(b) / Math.log(1024));
      return (b / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + ' ' + units[i];
    }

    function formatSpeed(bps) {
      if (!bps || bps === 0) return '0 B/s';
      return formatBytes(bps) + '/s';
    }

    function formatEta(seconds) {
      if (!seconds || seconds <= 0 || !isFinite(seconds)) return '∞';
      var h = Math.floor(seconds / 3600);
      var m = Math.floor((seconds % 3600) / 60);
      var s = Math.floor(seconds % 60);
      if (h > 0) return h + 'h ' + m + 'm';
      if (m > 0) return m + 'm ' + s + 's';
      return s + 's';
    }

    function statusType(st) {
      var map = { downloading: 'primary', seeding: 'success', completed: 'success', paused: 'warning', error: 'danger', queued: 'info' };
      return map[st] || 'info';
    }

    function statusIcon(st) {
      var map = { downloading: '⬇️', seeding: '⬆️', completed: '✅', paused: '⏸️', error: '❌', queued: '⏳' };
      return map[st] || '❓';
    }

    /* ── WebSocket ── */
    function connectWS() {
      var proto = location.protocol === 'https:' ? 'wss' : 'ws';
      ws = new WebSocket(proto + '://' + location.host + '/ws?token=' + encodeURIComponent(getToken()));
      ws.onopen = function() {
        wsConnected.value = true;
        ws.send(JSON.stringify({ type: 'torrent-subscribe' }));
      };
      ws.onmessage = function(ev) {
        try {
          var msg = JSON.parse(ev.data);
          if (msg.type === 'torrent-list' || msg.type === 'torrent-progress') {
            if (Array.isArray(msg.data)) {
              torrents.value = msg.data;
            }
          } else if (msg.type === 'torrent-added') {
            ElMessage.success(t('added') + ': ' + (msg.data.name || ''));
          } else if (msg.type === 'torrent-error') {
            ElMessage.error(msg.data.error || t('error'));
          } else if (msg.type === 'torrent-not-installed') {
            serverReady.value = false;
          }
        } catch(e) {}
      };
      ws.onclose = function() {
        wsConnected.value = false;
        setTimeout(function() { if (localeTimer) connectWS(); }, 3000);
      };
      ws.onerror = function() { ws.close(); };
    }

    function sendWS(obj) {
      if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
    }

    /* ── Actions ── */
    function addMagnet() {
      var link = magnetInput.value.trim();
      if (!link) return;
      sendWS({ type: 'torrent-add', data: { magnet: link, path: stDownPath.value } });
      magnetInput.value = '';
      addDialogVisible.value = false;
    }

    function uploadTorrentFile() {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = '.torrent';
      input.onchange = function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          var base64 = btoa(String.fromCharCode.apply(null, new Uint8Array(ev.target.result)));
          sendWS({ type: 'torrent-add', data: { torrentBase64: base64, name: file.name, path: stDownPath.value } });
          addDialogVisible.value = false;
        };
        reader.readAsArrayBuffer(file);
      };
      input.click();
    }

    function pauseTorrent(hash) { sendWS({ type: 'torrent-pause', data: { infoHash: hash } }); }
    function resumeTorrent(hash) { sendWS({ type: 'torrent-resume', data: { infoHash: hash } }); }

    async function removeTorrent(hash, deleteData) {
      try {
        await ElMessageBox.confirm(t('deleteConfirm'), t('remove'), {
          type: 'warning', confirmButtonText: t('yes'), cancelButtonText: t('cancel')
        });
      } catch { return; }
      sendWS({ type: 'torrent-remove', data: { infoHash: hash, deleteData: !!deleteData } });
      if (selectedHash.value === hash) selectedHash.value = '';
    }

    function startAll() { sendWS({ type: 'torrent-start-all' }); }
    function pauseAll() { sendWS({ type: 'torrent-pause-all' }); }

    function selectTorrent(row) { selectedHash.value = row.infoHash; }

    function saveSettings() {
      sendWS({ type: 'torrent-settings', data: { downloadPath: stDownPath.value, maxDownloadSpeed: stMaxDown.value, maxUploadSpeed: stMaxUp.value } });
      settingsDialogVisible.value = false;
      ElMessage.success(t('save'));
    }

    /* ── Row class ── */
    function tableRowClass(row) {
      return row.row.infoHash === selectedHash.value ? 'tor-row-selected' : '';
    }

    /* ── Lifecycle ── */
    onMounted(function() {
      connectWS();
      localeTimer = setInterval(function() { locale.value = getLocale(); }, 1000);
    });

    onUnmounted(function() {
      if (localeTimer) { clearInterval(localeTimer); localeTimer = null; }
      if (ws) { sendWS({ type: 'torrent-unsubscribe' }); ws.close(); ws = null; }
    });

    return {
      locale, t, torrents, selectedHash, filter, addDialogVisible, settingsDialogVisible,
      magnetInput, detailTab, wsConnected, serverReady,
      filteredTorrents, selectedTorrent, totalDownSpeed, totalUpSpeed, filterCounts,
      formatBytes, formatSpeed, formatEta, statusType, statusIcon,
      addMagnet, uploadTorrentFile, pauseTorrent, resumeTorrent, removeTorrent,
      startAll, pauseAll, selectTorrent, saveSettings, tableRowClass,
      stDownPath, stMaxDown, stMaxUp
    };
  }
})
