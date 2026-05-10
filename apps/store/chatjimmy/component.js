(function(Vue) {
  const { ref, computed, onMounted, onBeforeUnmount } = Vue;

  const LANGS = {
    tr: {
      title: 'ChatJimmy',
      home: 'Ana Sayfa',
      openTab: 'Yeni Sekmede Aç',
      refresh: 'Yenile',
      loading: 'ChatJimmy yükleniyor...'
    },
    en: {
      title: 'ChatJimmy',
      home: 'Home',
      openTab: 'Open in New Tab',
      refresh: 'Refresh',
      loading: 'Loading ChatJimmy...'
    },
    de: {
      title: 'ChatJimmy',
      home: 'Startseite',
      openTab: 'In neuem Tab öffnen',
      refresh: 'Aktualisieren',
      loading: 'ChatJimmy wird geladen...'
    },
    fr: {
      title: 'ChatJimmy',
      home: 'Accueil',
      openTab: 'Ouvrir dans un nouvel onglet',
      refresh: 'Actualiser',
      loading: 'Chargement de ChatJimmy...'
    },
    es: {
      title: 'ChatJimmy',
      home: 'Inicio',
      openTab: 'Abrir en nueva pestaña',
      refresh: 'Actualizar',
      loading: 'Cargando ChatJimmy...'
    },
    ru: {
      title: 'ChatJimmy',
      home: 'Главная',
      openTab: 'Открыть в новой вкладке',
      refresh: 'Обновить',
      loading: 'Загрузка ChatJimmy...'
    },
    zh: {
      title: 'ChatJimmy',
      home: '首页',
      openTab: '新标签页打开',
      refresh: '刷新',
      loading: '正在加载ChatJimmy...'
    },
    ja: {
      title: 'ChatJimmy',
      home: 'ホーム',
      openTab: '新しいタブで開く',
      refresh: '更新',
      loading: 'ChatJimmyを読み込み中...'
    }
  };

  return {
    setup() {
      const locale = ref(localStorage.getItem('sys_locale') || 'tr');
      const t = computed(() => LANGS[locale.value] || LANGS.tr);

      const HOME_URL = 'https://chatjimmy.ai/';

      function proxyUrl(url) {
        return '/api/browser/proxy?interceptAll=1&proxyDomain=chatjimmy.ai&url=' + encodeURIComponent(url);
      }

      const iframeSrc = ref(proxyUrl(HOME_URL));
      const iframeLoaded = ref(false);

      function navigateHome() {
        iframeLoaded.value = false;
        iframeSrc.value = proxyUrl(HOME_URL);
      }

      function refreshPage() {
        iframeLoaded.value = false;
        const current = iframeSrc.value;
        iframeSrc.value = '';
        setTimeout(() => { iframeSrc.value = current; }, 50);
      }

      function openExternal() {
        const src = iframeSrc.value;
        try {
          const u = new URL(src, location.origin);
          const realUrl = u.searchParams.get('url') || HOME_URL;
          window.open(realUrl, '_blank');
        } catch {
          window.open(HOME_URL, '_blank');
        }
      }

      function onIframeLoad() {
        iframeLoaded.value = true;
      }

      function onLocaleChanged(e) {
        if (e.detail && e.detail.locale) {
          locale.value = e.detail.locale;
        }
      }

      onMounted(() => {
        window.addEventListener('locale-changed', onLocaleChanged);
      });

      onBeforeUnmount(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
      });

      return {
        t,
        iframeSrc,
        iframeLoaded,
        navigateHome,
        refreshPage,
        openExternal,
        onIframeLoad
      };
    }
  };
})(Vue);
