(function(Vue) {
  const { ref, computed, onMounted, onUnmounted } = Vue;

  const LANGS = {
    tr: {
      title: 'Disk Kullanımı',
      total: 'Toplam',
      docker: 'Docker Konteynerler',
      data: 'Data Dizini',
      backups: 'Yedekler',
      loading: 'Yükleniyor...',
      calculating: 'Hesaplanıyor...',
      refresh: 'Yenile',
      error: 'Bilgi alınamadı',
      noDocker: 'Docker çalışmıyor',
      empty: 'Boş',
      image: 'İmaj',
      layer: 'Katman',
      lastUpdated: 'Son güncelleme'
    },
    en: {
      title: 'Disk Usage',
      total: 'Total',
      docker: 'Docker Containers',
      data: 'Data Directory',
      backups: 'Backups',
      loading: 'Loading...',
      calculating: 'Calculating...',
      refresh: 'Refresh',
      error: 'Could not retrieve info',
      noDocker: 'Docker not running',
      empty: 'Empty',
      image: 'Image',
      layer: 'Layer',
      lastUpdated: 'Last updated'
    },
    de: {
      title: 'Festplattennutzung',
      total: 'Gesamt',
      docker: 'Docker-Container',
      data: 'Datenverzeichnis',
      backups: 'Sicherungen',
      loading: 'Laden...',
      calculating: 'Berechnung...',
      refresh: 'Aktualisieren',
      error: 'Informationen konnten nicht abgerufen werden',
      noDocker: 'Docker läuft nicht',
      empty: 'Leer',
      image: 'Image',
      layer: 'Schicht',
      lastUpdated: 'Letzte Aktualisierung'
    },
    fr: {
      title: 'Utilisation du disque',
      total: 'Total',
      docker: 'Conteneurs Docker',
      data: 'Répertoire de données',
      backups: 'Sauvegardes',
      loading: 'Chargement...',
      calculating: 'Calcul en cours...',
      refresh: 'Actualiser',
      error: 'Impossible de récupérer les informations',
      noDocker: 'Docker ne fonctionne pas',
      empty: 'Vide',
      image: 'Image',
      layer: 'Couche',
      lastUpdated: 'Dernière mise à jour'
    }
  };

  LANGS.es = { ...LANGS.en, title: 'Tamaño de disco' };
  LANGS.ru = { ...LANGS.en, title: 'Размер диска' };
  LANGS.zh = { ...LANGS.en, title: '磁盘大小' };
  LANGS.ja = { ...LANGS.en, title: 'ディスクサイズ' };
  LANGS.it = { ...LANGS.en, title: 'Dimensione disco' };
  LANGS.ar = { ...LANGS.en, title: 'حجم القرص' };
  LANGS.ko = { ...LANGS.en, title: '디스크 크기' };
  LANGS.hi = { ...LANGS.en, title: 'डिस्क आकार' };
  LANGS.pt = { ...LANGS.en, title: 'Tamanho do disco' };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  function formatSize(bytes) {
    if (!bytes || bytes <= 0) return '0 B';
    var units = ['B', 'KB', 'MB', 'GB', 'TB'];
    var i = 0;
    var size = bytes;
    while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
    return size.toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
  }

  return {
    setup() {
      var locale = ref(getLocale());
      function t(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

      var loading = ref(false);
      var refreshing = ref(false);
      var error = ref('');
      var dockerItems = ref([]);
      var dataItems = ref([]);
      var backupsItems = ref([]);
      var dockerTotal = ref(0);
      var dataTotal = ref(0);
      var backupsTotal = ref(0);
      var cachedAt = ref(null);
      var expandedSection = ref(null);

      var grandTotal = computed(function() {
        return dockerTotal.value + dataTotal.value + backupsTotal.value;
      });

      function getToken() { try { return localStorage.getItem('auth_token') || ''; } catch { return ''; } }
      function authHeaders() { return { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }

      function applyData(data) {
        dockerItems.value = data.docker || [];
        dataItems.value = data.data || [];
        backupsItems.value = data.backups || [];
        dockerTotal.value = data.dockerTotal || 0;
        dataTotal.value = data.dataTotal || 0;
        backupsTotal.value = data.backupsTotal || 0;
        cachedAt.value = data.cachedAt || null;
      }

      async function loadData() {
        loading.value = true;
        error.value = '';
        try {
          var r = await fetch('/api/disksize', { headers: authHeaders() });
          if (!r.ok) throw new Error('HTTP ' + r.status);
          applyData(await r.json());
        } catch(e) {
          error.value = t('error');
        }
        loading.value = false;
      }

      async function refreshData() {
        refreshing.value = true;
        error.value = '';
        try {
          var r = await fetch('/api/disksize/refresh', { method: 'POST', headers: authHeaders() });
          if (!r.ok) throw new Error('HTTP ' + r.status);
          applyData(await r.json());
        } catch(e) {
          error.value = t('error');
        }
        refreshing.value = false;
      }

      function formatCachedAt() {
        if (!cachedAt.value) return '';
        var d = new Date(cachedAt.value);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      function toggleSection(name) {
        expandedSection.value = expandedSection.value === name ? null : name;
      }

      function sectionPercent(sectionTotal) {
        var gt = grandTotal.value;
        if (gt <= 0) return 0;
        return Math.round(sectionTotal / gt * 100);
      }

      onMounted(function() {
        window.addEventListener('locale-changed', onLocaleChanged);
        loadData();
      });
      onUnmounted(function() {
        window.removeEventListener('locale-changed', onLocaleChanged);
      });

      return {
        t: t,
        loading: loading,
        refreshing: refreshing,
        error: error,
        dockerItems: dockerItems,
        dataItems: dataItems,
        backupsItems: backupsItems,
        dockerTotal: dockerTotal,
        dataTotal: dataTotal,
        backupsTotal: backupsTotal,
        grandTotal: grandTotal,
        cachedAt: cachedAt,
        expandedSection: expandedSection,
        loadData: loadData,
        refreshData: refreshData,
        formatCachedAt: formatCachedAt,
        toggleSection: toggleSection,
        formatSize: formatSize,
        sectionPercent: sectionPercent
      };
    }
  };
})(Vue);
