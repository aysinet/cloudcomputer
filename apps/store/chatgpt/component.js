(function(Vue) {
  const { ref, computed, onMounted, onBeforeUnmount } = Vue;

  const LANGS = {
    tr: {
      title: 'ChatGPT',
      home: 'Ana Sayfa',
      openTab: 'Yeni Sekmede Aç',
      refresh: 'Yenile',
      loading: 'ChatGPT yükleniyor...'
    },
    en: {
      title: 'ChatGPT',
      home: 'Home',
      openTab: 'Open in New Tab',
      refresh: 'Refresh',
      loading: 'Loading ChatGPT...'
    },
    de: {
      title: 'ChatGPT',
      home: 'Startseite',
      openTab: 'In neuem Tab öffnen',
      refresh: 'Aktualisieren',
      loading: 'ChatGPT wird geladen...'
    },
    fr: {
      title: 'ChatGPT',
      home: 'Accueil',
      openTab: 'Ouvrir dans un nouvel onglet',
      refresh: 'Actualiser',
      loading: 'Chargement de ChatGPT...'
    },
    es: {
      title: 'ChatGPT',
      home: 'Inicio',
      openTab: 'Abrir en nueva pestaña',
      refresh: 'Actualizar',
      loading: 'Cargando ChatGPT...'
    },
    ru: {
      title: 'ChatGPT',
      home: 'Главная',
      openTab: 'Открыть в новой вкладке',
      refresh: 'Обновить',
      loading: 'Загрузка ChatGPT...'
    },
    zh: {
      title: 'ChatGPT',
      home: '首页',
      openTab: '新标签页打开',
      refresh: '刷新',
      loading: '正在加载ChatGPT...'
    },
    ja: {
      title: 'ChatGPT',
      home: 'ホーム',
      openTab: '新しいタブで開く',
      refresh: '更新',
      loading: 'ChatGPTを読み込み中...'
    }
  };

  return {
    setup() {
      const locale = ref(localStorage.getItem('sys_locale') || 'tr');
      const t = computed(() => LANGS[locale.value] || LANGS.tr);

      const HOME_URL = 'https://chatgpt.com/';

      function proxyUrl(url) {
        return '/api/browser/proxy?url=' + encodeURIComponent(url);
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
