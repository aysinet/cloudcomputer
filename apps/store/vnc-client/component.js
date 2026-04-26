(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, nextTick, watch } = Vue;

  const LANGS = {
    tr: {
      title: 'VNC İstemcisi', host: 'Sunucu Adresi', port: 'Port', password: 'Şifre',
      connect: 'Bağlan', disconnect: 'Bağlantıyı Kes', connecting: 'Bağlanıyor...',
      connected: 'Bağlandı', disconnected: 'Bağlantı kesildi', error: 'Bağlantı hatası',
      hostRequired: 'Sunucu adresi gerekli', savedConnections: 'Kayıtlı Bağlantılar',
      save: 'Bağlantıyı Kaydet', delete: 'Sil', noSaved: 'Kayıtlı bağlantı yok',
      name: 'Bağlantı Adı', connectionName: 'Bağlantı adı girin',
      fullscreen: 'Tam Ekran', screenshot: 'Ekran Görüntüsü', clipboardSync: 'Pano Senkronizasyonu',
      scaling: 'Ölçekleme', quality: 'Kalite', sendCtrlAltDel: 'Ctrl+Alt+Del Gönder',
      reconnect: 'Yeniden Bağlan', status: 'Durum', latency: 'Gecikme',
      viewOnly: 'Yalnızca İzle', localScaling: 'Yerel Ölçekleme',
      recent: 'Son Bağlantılar', quickConnect: 'Hızlı Bağlantı',
      loadingNoVNC: 'noVNC yükleniyor...', loadError: 'noVNC yüklenemedi',
      wsProxy: 'WebSocket proxy üzerinden bağlanılıyor...',
      connectionInfo: 'VNC sunucu adresini ve portunu girin'
    },
    en: {
      title: 'VNC Client', host: 'Server Address', port: 'Port', password: 'Password',
      connect: 'Connect', disconnect: 'Disconnect', connecting: 'Connecting...',
      connected: 'Connected', disconnected: 'Disconnected', error: 'Connection error',
      hostRequired: 'Server address required', savedConnections: 'Saved Connections',
      save: 'Save Connection', delete: 'Delete', noSaved: 'No saved connections',
      name: 'Connection Name', connectionName: 'Enter connection name',
      fullscreen: 'Fullscreen', screenshot: 'Screenshot', clipboardSync: 'Clipboard Sync',
      scaling: 'Scaling', quality: 'Quality', sendCtrlAltDel: 'Send Ctrl+Alt+Del',
      reconnect: 'Reconnect', status: 'Status', latency: 'Latency',
      viewOnly: 'View Only', localScaling: 'Local Scaling',
      recent: 'Recent Connections', quickConnect: 'Quick Connect',
      loadingNoVNC: 'Loading noVNC...', loadError: 'Failed to load noVNC',
      wsProxy: 'Connecting via WebSocket proxy...',
      connectionInfo: 'Enter VNC server address and port'
    },
    de: {
      title: 'VNC-Client', host: 'Serveradresse', port: 'Port', password: 'Passwort',
      connect: 'Verbinden', disconnect: 'Trennen', connecting: 'Verbindung wird hergestellt...',
      connected: 'Verbunden', disconnected: 'Getrennt', error: 'Verbindungsfehler',
      hostRequired: 'Serveradresse erforderlich', savedConnections: 'Gespeicherte Verbindungen',
      save: 'Verbindung speichern', delete: 'Löschen', noSaved: 'Keine gespeicherten Verbindungen',
      name: 'Verbindungsname', connectionName: 'Verbindungsname eingeben',
      fullscreen: 'Vollbild', screenshot: 'Screenshot', clipboardSync: 'Zwischenablage-Sync',
      scaling: 'Skalierung', quality: 'Qualität', sendCtrlAltDel: 'Strg+Alt+Entf senden',
      reconnect: 'Neu verbinden', status: 'Status', latency: 'Latenz',
      viewOnly: 'Nur ansehen', localScaling: 'Lokale Skalierung',
      recent: 'Letzte Verbindungen', quickConnect: 'Schnellverbindung',
      loadingNoVNC: 'noVNC wird geladen...', loadError: 'noVNC konnte nicht geladen werden',
      wsProxy: 'Verbindung über WebSocket-Proxy...',
      connectionInfo: 'VNC-Serveradresse und Port eingeben'
    },
    fr: {
      title: 'Client VNC', host: 'Adresse du serveur', port: 'Port', password: 'Mot de passe',
      connect: 'Connecter', disconnect: 'Déconnecter', connecting: 'Connexion en cours...',
      connected: 'Connecté', disconnected: 'Déconnecté', error: 'Erreur de connexion',
      hostRequired: 'Adresse du serveur requise', savedConnections: 'Connexions enregistrées',
      save: 'Enregistrer la connexion', delete: 'Supprimer', noSaved: 'Aucune connexion enregistrée',
      name: 'Nom de la connexion', connectionName: 'Entrez le nom de la connexion',
      fullscreen: 'Plein écran', screenshot: 'Capture d\'écran', clipboardSync: 'Sync presse-papiers',
      scaling: 'Mise à l\'échelle', quality: 'Qualité', sendCtrlAltDel: 'Envoyer Ctrl+Alt+Suppr',
      reconnect: 'Reconnecter', status: 'Statut', latency: 'Latence',
      viewOnly: 'Lecture seule', localScaling: 'Mise à l\'échelle locale',
      recent: 'Connexions récentes', quickConnect: 'Connexion rapide',
      loadingNoVNC: 'Chargement de noVNC...', loadError: 'Échec du chargement de noVNC',
      wsProxy: 'Connexion via proxy WebSocket...',
      connectionInfo: 'Entrez l\'adresse et le port du serveur VNC'
    },
    es: {
      title: 'Cliente VNC', host: 'Dirección del servidor', port: 'Puerto', password: 'Contraseña',
      connect: 'Conectar', disconnect: 'Desconectar', connecting: 'Conectando...',
      connected: 'Conectado', disconnected: 'Desconectado', error: 'Error de conexión',
      hostRequired: 'Dirección del servidor requerida', savedConnections: 'Conexiones guardadas',
      save: 'Guardar conexión', delete: 'Eliminar', noSaved: 'Sin conexiones guardadas',
      name: 'Nombre de conexión', connectionName: 'Ingrese nombre de conexión',
      fullscreen: 'Pantalla completa', screenshot: 'Captura de pantalla', clipboardSync: 'Sincronizar portapapeles',
      scaling: 'Escalado', quality: 'Calidad', sendCtrlAltDel: 'Enviar Ctrl+Alt+Supr',
      reconnect: 'Reconectar', status: 'Estado', latency: 'Latencia',
      viewOnly: 'Solo ver', localScaling: 'Escalado local',
      recent: 'Conexiones recientes', quickConnect: 'Conexión rápida',
      loadingNoVNC: 'Cargando noVNC...', loadError: 'Error al cargar noVNC',
      wsProxy: 'Conectando a través de proxy WebSocket...',
      connectionInfo: 'Ingrese la dirección y el puerto del servidor VNC'
    },
    ru: {
      title: 'VNC-клиент', host: 'Адрес сервера', port: 'Порт', password: 'Пароль',
      connect: 'Подключиться', disconnect: 'Отключиться', connecting: 'Подключение...',
      connected: 'Подключено', disconnected: 'Отключено', error: 'Ошибка подключения',
      hostRequired: 'Требуется адрес сервера', savedConnections: 'Сохранённые подключения',
      save: 'Сохранить подключение', delete: 'Удалить', noSaved: 'Нет сохранённых подключений',
      name: 'Имя подключения', connectionName: 'Введите имя подключения',
      fullscreen: 'Полный экран', screenshot: 'Снимок экрана', clipboardSync: 'Синхронизация буфера',
      scaling: 'Масштабирование', quality: 'Качество', sendCtrlAltDel: 'Отправить Ctrl+Alt+Del',
      reconnect: 'Переподключиться', status: 'Статус', latency: 'Задержка',
      viewOnly: 'Только просмотр', localScaling: 'Локальное масштабирование',
      recent: 'Последние подключения', quickConnect: 'Быстрое подключение',
      loadingNoVNC: 'Загрузка noVNC...', loadError: 'Не удалось загрузить noVNC',
      wsProxy: 'Подключение через WebSocket-прокси...',
      connectionInfo: 'Введите адрес и порт VNC-сервера'
    },
    zh: { title: 'VNC Client', host: 'Server Address', port: 'Port', password: 'Password', connect: 'Connect', disconnect: 'Disconnect', connecting: 'Connecting...', connected: 'Connected', disconnected: 'Disconnected', error: 'Connection error', hostRequired: 'Server address required', savedConnections: 'Saved Connections', save: 'Save Connection', delete: 'Delete', noSaved: 'No saved connections', name: 'Connection Name', connectionName: 'Enter connection name', fullscreen: 'Fullscreen', screenshot: 'Screenshot', clipboardSync: 'Clipboard Sync', scaling: 'Scaling', quality: 'Quality', sendCtrlAltDel: 'Send Ctrl+Alt+Del', reconnect: 'Reconnect', status: 'Status', latency: 'Latency', viewOnly: 'View Only', localScaling: 'Local Scaling', recent: 'Recent Connections', quickConnect: 'Quick Connect', loadingNoVNC: 'Loading noVNC...', loadError: 'Failed to load noVNC', wsProxy: 'Connecting via WebSocket proxy...', connectionInfo: 'Enter VNC server address and port' },
    ja: { title: 'VNC Client', host: 'Server Address', port: 'Port', password: 'Password', connect: 'Connect', disconnect: 'Disconnect', connecting: 'Connecting...', connected: 'Connected', disconnected: 'Disconnected', error: 'Connection error', hostRequired: 'Server address required', savedConnections: 'Saved Connections', save: 'Save Connection', delete: 'Delete', noSaved: 'No saved connections', name: 'Connection Name', connectionName: 'Enter connection name', fullscreen: 'Fullscreen', screenshot: 'Screenshot', clipboardSync: 'Clipboard Sync', scaling: 'Scaling', quality: 'Quality', sendCtrlAltDel: 'Send Ctrl+Alt+Del', reconnect: 'Reconnect', status: 'Status', latency: 'Latency', viewOnly: 'View Only', localScaling: 'Local Scaling', recent: 'Recent Connections', quickConnect: 'Quick Connect', loadingNoVNC: 'Loading noVNC...', loadError: 'Failed to load noVNC', wsProxy: 'Connecting via WebSocket proxy...', connectionInfo: 'Enter VNC server address and port' },
    it: { title: 'VNC Client', host: 'Server Address', port: 'Port', password: 'Password', connect: 'Connect', disconnect: 'Disconnect', connecting: 'Connecting...', connected: 'Connected', disconnected: 'Disconnected', error: 'Connection error', hostRequired: 'Server address required', savedConnections: 'Saved Connections', save: 'Save Connection', delete: 'Delete', noSaved: 'No saved connections', name: 'Connection Name', connectionName: 'Enter connection name', fullscreen: 'Fullscreen', screenshot: 'Screenshot', clipboardSync: 'Clipboard Sync', scaling: 'Scaling', quality: 'Quality', sendCtrlAltDel: 'Send Ctrl+Alt+Del', reconnect: 'Reconnect', status: 'Status', latency: 'Latency', viewOnly: 'View Only', localScaling: 'Local Scaling', recent: 'Recent Connections', quickConnect: 'Quick Connect', loadingNoVNC: 'Loading noVNC...', loadError: 'Failed to load noVNC', wsProxy: 'Connecting via WebSocket proxy...', connectionInfo: 'Enter VNC server address and port' }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  // noVNC module loader
  var noVNCLoaded = false;
  var noVNCLoading = false;
  var noVNCCallbacks = [];

  function loadNoVNC(cb) {
    if (noVNCLoaded && window.RFB) { cb(null); return; }
    noVNCCallbacks.push(cb);
    if (noVNCLoading) return;
    noVNCLoading = true;

    var _amdDefine = window.define;
    window.define = undefined;

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@novnc/novnc@1.5.0/lib/rfb.js';
    script.type = 'module';

    // noVNC is an ES module, we need a different loading approach
    var moduleScript = document.createElement('script');
    moduleScript.type = 'module';
    moduleScript.textContent = [
      'import RFB from "https://cdn.jsdelivr.net/npm/@novnc/novnc@1.5.0/lib/rfb.js";',
      'window._noVNC_RFB = RFB;',
      'window.dispatchEvent(new Event("novnc-loaded"));'
    ].join('\n');

    function onLoaded() {
      window.define = _amdDefine;
      noVNCLoaded = true;
      noVNCLoading = false;
      noVNCCallbacks.forEach(function(c) { c(null); });
      noVNCCallbacks = [];
    }

    function onError() {
      window.define = _amdDefine;
      noVNCLoading = false;
      noVNCCallbacks.forEach(function(c) { c(new Error('load failed')); });
      noVNCCallbacks = [];
    }

    window.addEventListener('novnc-loaded', onLoaded, { once: true });
    moduleScript.onerror = onError;
    document.head.appendChild(moduleScript);

    // Fallback timeout
    setTimeout(function() {
      if (!noVNCLoaded) onError();
    }, 15000);
  }

  return {
    setup() {
      var locale = ref(getLocale());
      var localeTimer;
      function t(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      // Connection form
      var host = ref('');
      var port = ref(5900);
      var password = ref('');
      var viewOnly = ref(false);
      var localScaling = ref(true);
      var connName = ref('');

      // State
      var status = ref('idle'); // idle, loading-novnc, connecting, connected, error
      var errorMsg = ref('');
      var showSidebar = ref(true);

      // noVNC
      var rfb = null;
      var vncContainer = ref(null);
      var noVNCReady = ref(false);

      // Saved connections
      var savedConns = ref([]);
      var recentConns = ref([]);

      function loadSaved() {
        try { savedConns.value = JSON.parse(localStorage.getItem('vnc_saved') || '[]'); } catch { savedConns.value = []; }
        try { recentConns.value = JSON.parse(localStorage.getItem('vnc_recent') || '[]'); } catch { recentConns.value = []; }
      }

      function saveSavedConns() {
        try { localStorage.setItem('vnc_saved', JSON.stringify(savedConns.value)); } catch {}
      }

      function saveRecentConns() {
        try { localStorage.setItem('vnc_recent', JSON.stringify(recentConns.value)); } catch {}
      }

      function saveConnection() {
        var name = connName.value.trim() || (host.value + ':' + port.value);
        var existing = savedConns.value.findIndex(function(c) { return c.host === host.value && c.port === port.value; });
        var entry = { name: name, host: host.value, port: port.value, password: password.value };
        if (existing >= 0) {
          savedConns.value[existing] = entry;
        } else {
          savedConns.value.unshift(entry);
        }
        saveSavedConns();
        ElMessage.success(t('save'));
      }

      function deleteSaved(idx) {
        savedConns.value.splice(idx, 1);
        saveSavedConns();
      }

      function useSaved(conn) {
        host.value = conn.host;
        port.value = conn.port;
        password.value = conn.password || '';
        connName.value = conn.name || '';
      }

      function addRecent(h, p) {
        recentConns.value = recentConns.value.filter(function(c) { return !(c.host === h && c.port === p); });
        recentConns.value.unshift({ host: h, port: p, time: Date.now() });
        if (recentConns.value.length > 10) recentConns.value.length = 10;
        saveRecentConns();
      }

      // ── Connect via WebSocket proxy ──
      function doConnect() {
        var h = host.value.trim();
        if (!h) { ElMessage.warning(t('hostRequired')); return; }
        var p = parseInt(port.value) || 5900;

        errorMsg.value = '';
        status.value = 'loading-novnc';

        loadNoVNC(function(err) {
          if (err) {
            // Fallback: use iframe approach
            connectViaIframe(h, p);
            return;
          }
          noVNCReady.value = true;
          connectWithRFB(h, p);
        });
      }

      function connectWithRFB(h, p) {
        status.value = 'connecting';

        nextTick(function() {
          var container = vncContainer.value;
          if (!container) { status.value = 'error'; errorMsg.value = 'Container not found'; return; }

          // Clean up any existing connection
          if (rfb) {
            try { rfb.disconnect(); } catch {}
            rfb = null;
          }

          // Clear container
          container.innerHTML = '';

          try {
            var proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
            var token = localStorage.getItem('auth_token') || '';
            var wsUrl = proto + '//' + location.host + '/api/vnc/proxy?host=' + encodeURIComponent(h) + '&port=' + p + '&token=' + encodeURIComponent(token);

            var RFBClass = window._noVNC_RFB;
            if (!RFBClass) {
              connectViaIframe(h, p);
              return;
            }

            rfb = new RFBClass(container, wsUrl, {
              credentials: { password: password.value || '' },
              wsProtocols: ['binary']
            });

            rfb.viewOnly = viewOnly.value;
            rfb.scaleViewport = localScaling.value;
            rfb.resizeSession = false;
            rfb.compressionLevel = 6;
            rfb.qualityLevel = 6;

            rfb.addEventListener('connect', function() {
              status.value = 'connected';
              showSidebar.value = false;
              addRecent(h, p);
            });

            rfb.addEventListener('disconnect', function(e) {
              status.value = e.detail.clean ? 'idle' : 'error';
              if (!e.detail.clean) errorMsg.value = t('disconnected');
              rfb = null;
            });

            rfb.addEventListener('securityfailure', function(e) {
              status.value = 'error';
              errorMsg.value = 'Security: ' + (e.detail.reason || 'authentication failed');
              rfb = null;
            });
          } catch (e) {
            status.value = 'error';
            errorMsg.value = e.message;
          }
        });
      }

      // Fallback: connect via an iframe to the built-in noVNC player
      function connectViaIframe(h, p) {
        status.value = 'connected';
        showSidebar.value = false;
        addRecent(h, p);

        nextTick(function() {
          var container = vncContainer.value;
          if (!container) return;
          container.innerHTML = '';

          var proto = location.protocol === 'https:' ? 'wss' : 'ws';
          var token = localStorage.getItem('auth_token') || '';
          var wsUrl = proto + '://' + location.host + '/api/vnc/proxy?host=' + encodeURIComponent(h) + '&port=' + p + '&token=' + encodeURIComponent(token);

          // Build a self-contained noVNC HTML page as a blob
          var html = '<!DOCTYPE html><html><head>' +
            '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
            '<style>body{margin:0;overflow:hidden;background:#000}#screen{width:100vw;height:100vh}</style>' +
            '<script type="module">' +
            'import RFB from "https://cdn.jsdelivr.net/npm/@novnc/novnc@1.5.0/lib/rfb.js";' +
            'const rfb = new RFB(document.getElementById("screen"),"' + wsUrl + '",{' +
            'credentials:{password:"' + (password.value || '').replace(/"/g, '\\"') + '"},' +
            'wsProtocols:["binary"]});' +
            'rfb.viewOnly=' + (viewOnly.value ? 'true' : 'false') + ';' +
            'rfb.scaleViewport=true;rfb.resizeSession=false;' +
            'rfb.addEventListener("disconnect",()=>{document.body.style.background="#1a1a2e";' +
            'document.body.innerHTML="<div style=\\"color:#ccc;display:flex;align-items:center;justify-content:center;height:100vh\\">Disconnected</div>"});' +
            '<\/script></head><body><div id="screen"></div></body></html>';

          var blob = new Blob([html], { type: 'text/html' });
          var iframe = document.createElement('iframe');
          iframe.src = URL.createObjectURL(blob);
          iframe.style.cssText = 'width:100%;height:100%;border:none';
          iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
          container.appendChild(iframe);
        });
      }

      function doDisconnect() {
        if (rfb) {
          try { rfb.disconnect(); } catch {}
          rfb = null;
        }
        // Clear iframe if exists
        if (vncContainer.value) {
          vncContainer.value.innerHTML = '';
        }
        status.value = 'idle';
        showSidebar.value = true;
      }

      function sendCtrlAltDel() {
        if (rfb) rfb.sendCtrlAltDel();
      }

      function toggleFullscreen() {
        var el = vncContainer.value;
        if (!el) return;
        if (document.fullscreenElement) document.exitFullscreen();
        else el.requestFullscreen().catch(function() {});
      }

      function takeScreenshot() {
        if (!rfb || !rfb._display) return;
        try {
          var canvas = rfb._display._target || vncContainer.value.querySelector('canvas');
          if (!canvas) return;
          var link = document.createElement('a');
          link.download = 'vnc-screenshot-' + Date.now() + '.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
          ElMessage.success(t('screenshot'));
        } catch {}
      }

      function handleViewOnlyChange(val) {
        viewOnly.value = val;
        if (rfb) rfb.viewOnly = val;
      }

      function handleScalingChange(val) {
        localScaling.value = val;
        if (rfb) rfb.scaleViewport = val;
      }

      onMounted(function() {
        loadSaved();
        localeTimer = setInterval(function() { locale.value = getLocale(); }, 1000);
      });

      onUnmounted(function() {
        if (localeTimer) clearInterval(localeTimer);
        if (rfb) { try { rfb.disconnect(); } catch {} }
      });

      return {
        t, host, port, password, viewOnly, localScaling, connName,
        status, errorMsg, showSidebar, vncContainer, noVNCReady,
        savedConns, recentConns,
        doConnect, doDisconnect, sendCtrlAltDel,
        toggleFullscreen, takeScreenshot,
        saveConnection, deleteSaved, useSaved,
        handleViewOnlyChange, handleScalingChange
      };
    }
  };
})(Vue);
