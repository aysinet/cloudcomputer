(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, watch, nextTick } = Vue;

  const LANGS = {
    tr: {
      title: 'Senkronizasyon',
      status: 'Durum',
      settings: 'Ayarlar',
      log: 'Günlük',
      connected: 'Bağlı',
      disconnected: 'Bağlı Değil',
      enabled: 'Aktif',
      disabled: 'Pasif',
      peerUrl: 'Sunucu Adresi',
      peerUrlHint: 'Örn: https://cloud.example.com',
      pairingCode: 'Eşleşme Kodu',
      generateCode: 'Kod Oluştur',
      connect: 'Bağlan',
      disconnect: 'Bağlantıyı Kes',
      syncNow: 'Şimdi Senkronize Et',
      syncing: 'Senkronize ediliyor...',
      lastSync: 'Son Senkronizasyon',
      never: 'Hiçbir zaman',
      deviceName: 'Cihaz Adı',
      pairedDevices: 'Eşleşmiş Cihazlar',
      noDevices: 'Henüz eşleşmiş cihaz yok',
      unpair: 'Eşleşmeyi Kaldır',
      unpairAll: 'Tümünü Kaldır',
      syncFolders: 'Senkronize Edilecek Klasörler',
      syncAppData: 'Uygulama Verilerini Senkronize Et',
      excludePatterns: 'Hariç Tutulacak Dosyalar',
      conflictStrategy: 'Çakışma Stratejisi',
      lww: 'Son Yazan Kazanır',
      keepBoth: 'İkisini de Sakla',
      interval: 'Senkronizasyon Aralığı (sn)',
      maxFileSize: 'Maks Dosya Boyutu (MB)',
      save: 'Kaydet',
      saved: 'Kaydedildi',
      clearLog: 'Günlüğü Temizle',
      noLogs: 'Henüz günlük kaydı yok',
      downloaded: 'İndirildi',
      uploaded: 'Yüklendi',
      errors: 'Hatalar',
      pairing: 'Eşleşme',
      pairMode: 'Bu cihazı nasıl kullanacaksınız?',
      asServer: 'Sunucu (Bu cihaz bağlantı kabul eder)',
      asClient: 'İstemci (Bu cihaz sunucuya bağlanır)',
      waitingPair: 'Eşleşme kodu ile bekleniyor...',
      codeExpires: 'Kod geçerlilik süresi:',
      enterPeerInfo: 'Uzak sunucu bilgileri',
      pairSuccess: 'Eşleşme başarılı!',
      syncComplete: 'Senkronizasyon tamamlandı',
      connectionError: 'Bağlantı hatası',
      files: 'Dosyalar', photos: 'Fotoğraflar', music: 'Müzik', videos: 'Videolar', recordings: 'Kayıtlar'
    },
    en: {
      title: 'Synchronizer',
      status: 'Status',
      settings: 'Settings',
      log: 'Log',
      connected: 'Connected',
      disconnected: 'Disconnected',
      enabled: 'Enabled',
      disabled: 'Disabled',
      peerUrl: 'Server Address',
      peerUrlHint: 'E.g.: https://cloud.example.com',
      pairingCode: 'Pairing Code',
      generateCode: 'Generate Code',
      connect: 'Connect',
      disconnect: 'Disconnect',
      syncNow: 'Sync Now',
      syncing: 'Syncing...',
      lastSync: 'Last Sync',
      never: 'Never',
      deviceName: 'Device Name',
      pairedDevices: 'Paired Devices',
      noDevices: 'No paired devices yet',
      unpair: 'Unpair',
      unpairAll: 'Unpair All',
      syncFolders: 'Folders to Sync',
      syncAppData: 'Sync App Data',
      excludePatterns: 'Exclude Patterns',
      conflictStrategy: 'Conflict Strategy',
      lww: 'Last Write Wins',
      keepBoth: 'Keep Both',
      interval: 'Sync Interval (sec)',
      maxFileSize: 'Max File Size (MB)',
      save: 'Save',
      saved: 'Saved',
      clearLog: 'Clear Log',
      noLogs: 'No log entries yet',
      downloaded: 'Downloaded',
      uploaded: 'Uploaded',
      errors: 'Errors',
      pairing: 'Pairing',
      pairMode: 'How will you use this device?',
      asServer: 'Server (This device accepts connections)',
      asClient: 'Client (This device connects to server)',
      waitingPair: 'Waiting with pairing code...',
      codeExpires: 'Code expires in:',
      enterPeerInfo: 'Remote server details',
      pairSuccess: 'Pairing successful!',
      syncComplete: 'Sync complete',
      connectionError: 'Connection error',
      files: 'Files', photos: 'Photos', music: 'Music', videos: 'Videos', recordings: 'Recordings'
    }
  };

  return {
    template: '#SynchronizerApp',
    props: { appWindow: Object },
    setup(props) {
      const lang = ref(window.__desktopLang || 'en');
      const L = (key) => (LANGS[lang.value] || LANGS.en)[key] || (LANGS.en)[key] || key;

      const tab = ref('status');
      const loading = ref(false);
      const toast = ref('');
      let toastTimer = null;

      // Status
      const status = ref({ enabled: false, connected: false, peerUrl: '', deviceId: '', deviceName: '', pairedDevices: [], lastSyncTime: null });

      // Config
      const config = ref({
        enabled: false, peerUrl: '', deviceName: '', syncFolders: ['files', 'photos', 'music', 'videos', 'recordings'],
        syncAppData: true, excludePatterns: ['*.tmp', '*.log', 'Thumbs.db', '.DS_Store'],
        maxFileSize: 104857600, intervalSeconds: 60, conflictStrategy: 'last-write-wins'
      });
      const configSaved = ref(false);

      // Pairing
      const pairMode = ref(''); // 'server' | 'client'
      const pairingCode = ref('');
      const pairingExpiry = ref('');
      const pairingCountdown = ref(0);
      let countdownTimer = null;
      const clientPeerUrl = ref('');
      const clientPairingCode = ref('');

      // Log
      const logs = ref([]);

      // Syncing
      const syncing = ref(false);
      const syncResult = ref(null);

      function showToast(msg) {
        toast.value = msg;
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { toast.value = ''; }, 3000);
      }

      async function loadStatus() {
        try {
          const res = await fetch('/api/sync/status');
          status.value = await res.json();
        } catch { }
      }

      async function loadConfig() {
        try {
          const res = await fetch('/api/sync/config');
          const data = await res.json();
          config.value = { ...config.value, ...data };
        } catch { }
      }

      async function saveConfig() {
        try {
          const res = await fetch('/api/sync/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config.value)
          });
          if (res.ok) {
            configSaved.value = true;
            showToast(L('saved'));
            setTimeout(() => { configSaved.value = false; }, 2000);
          }
        } catch { }
      }

      async function loadLogs() {
        try {
          const res = await fetch('/api/sync/log');
          logs.value = (await res.json()).reverse();
        } catch { }
      }

      async function clearLogs() {
        await fetch('/api/sync/log', { method: 'DELETE' });
        logs.value = [];
      }

      // Pairing — Server mode
      async function generateCode() {
        try {
          const res = await fetch('/api/sync/pair/generate', { method: 'POST' });
          const data = await res.json();
          pairingCode.value = data.code;
          pairingExpiry.value = data.expiresAt;
          startCountdown(data.expiresAt);
        } catch { }
      }

      function startCountdown(expiresAt) {
        if (countdownTimer) clearInterval(countdownTimer);
        const update = () => {
          const remaining = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
          pairingCountdown.value = remaining;
          if (remaining <= 0) {
            clearInterval(countdownTimer);
            pairingCode.value = '';
          }
        };
        update();
        countdownTimer = setInterval(update, 1000);
      }

      // Pairing — Client mode
      async function connectToPeer() {
        if (!clientPeerUrl.value || !clientPairingCode.value) return;
        loading.value = true;
        try {
          const res = await fetch('/api/sync/pair/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ peerUrl: clientPeerUrl.value, pairingCode: clientPairingCode.value })
          });
          const data = await res.json();
          if (data.ok) {
            showToast(L('pairSuccess'));
            pairMode.value = '';
            setTimeout(() => { loadStatus(); loadConfig(); }, 2000);
          }
        } catch (e) {
          showToast(L('connectionError'));
        }
        loading.value = false;
      }

      async function syncNow() {
        syncing.value = true;
        syncResult.value = null;
        try {
          const res = await fetch('/api/sync/trigger', { method: 'POST' });
          syncResult.value = await res.json();
          showToast(L('syncComplete'));
          loadStatus();
          loadLogs();
        } catch {
          showToast(L('connectionError'));
        }
        syncing.value = false;
      }

      async function unpairDevice(deviceId) {
        await fetch('/api/sync/unpair', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId })
        });
        loadStatus();
        loadConfig();
      }

      async function unpairAll() {
        await fetch('/api/sync/unpair', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        loadStatus();
        loadConfig();
        showToast('OK');
      }

      // Folder toggle
      const allFolders = ['files', 'photos', 'music', 'videos', 'recordings'];
      function toggleFolder(f) {
        const idx = config.value.syncFolders.indexOf(f);
        if (idx >= 0) config.value.syncFolders.splice(idx, 1);
        else config.value.syncFolders.push(f);
      }

      // Exclude patterns
      const excludeInput = ref('');
      function addExclude() {
        const v = excludeInput.value.trim();
        if (v && !config.value.excludePatterns.includes(v)) {
          config.value.excludePatterns.push(v);
        }
        excludeInput.value = '';
      }
      function removeExclude(idx) {
        config.value.excludePatterns.splice(idx, 1);
      }

      function formatTime(iso) {
        if (!iso) return L('never');
        const d = new Date(iso);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
      }

      function logIcon(type) {
        const icons = { sync: '✅', error: '❌', connected: '🔗', 'peer-connected': '🔗', 'peer-disconnected': '🔌', paired: '🤝', 'device-paired': '🤝' };
        return icons[type] || '📋';
      }

      // WebSocket listener for real-time sync events
      let wsHandler = null;
      onMounted(() => {
        loadStatus();
        loadConfig();

        if (window.__desktopWs) {
          wsHandler = (e) => {
            try {
              const msg = JSON.parse(e.data);
              if (msg.type === 'sync-status') {
                status.value.connected = msg.data.connected;
              } else if (msg.type === 'sync-complete') {
                syncResult.value = msg.data;
                loadStatus();
                if (tab.value === 'log') loadLogs();
              } else if (msg.type === 'sync-paired') {
                showToast(L('pairSuccess'));
                loadStatus();
                loadConfig();
              }
            } catch { }
          };
          window.__desktopWs.addEventListener('message', wsHandler);
        }
      });

      onUnmounted(() => {
        if (countdownTimer) clearInterval(countdownTimer);
        if (toastTimer) clearTimeout(toastTimer);
        if (wsHandler && window.__desktopWs) {
          window.__desktopWs.removeEventListener('message', wsHandler);
        }
      });

      watch(tab, (v) => {
        if (v === 'log') loadLogs();
        if (v === 'status') loadStatus();
      });

      return {
        L, lang, tab, loading, toast, status, config, configSaved,
        pairMode, pairingCode, pairingExpiry, pairingCountdown,
        clientPeerUrl, clientPairingCode,
        logs, syncing, syncResult,
        allFolders, excludeInput,
        loadStatus, loadConfig, saveConfig, loadLogs, clearLogs,
        generateCode, connectToPeer, syncNow,
        unpairDevice, unpairAll,
        toggleFolder, addExclude, removeExclude,
        formatTime, logIcon
      };
    }
  };
})(window.Vue);
