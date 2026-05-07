(function(Vue) {
  const { ref, computed, onMounted } = Vue;

  const LANGS = {
    tr: {
      home: 'Ana Sayfa', back: 'Geri', forward: 'İleri',
      refresh: 'Yenile', openTab: 'Yeni Sekmede Aç'
    },
    en: {
      home: 'Home', back: 'Back', forward: 'Forward',
      refresh: 'Refresh', openTab: 'Open in New Tab'
    },
    de: {
      home: 'Startseite', back: 'Zurück', forward: 'Vorwärts',
      refresh: 'Aktualisieren', openTab: 'In neuem Tab öffnen'
    },
    fr: {
      home: 'Accueil', back: 'Retour', forward: 'Suivant',
      refresh: 'Actualiser', openTab: 'Ouvrir dans un nouvel onglet'
    },
    es: {
      home: 'Inicio', back: 'Atrás', forward: 'Adelante',
      refresh: 'Actualizar', openTab: 'Abrir en nueva pestaña'
    },
    ru: {
      home: 'Главная', back: 'Назад', forward: 'Вперёд',
      refresh: 'Обновить', openTab: 'Открыть в новой вкладке'
    },
    zh: {
      home: '首页', back: '后退', forward: '前进',
      refresh: '刷新', openTab: '新标签页打开'
    },
    ja: {
      home: 'ホーム', back: '戻る', forward: '進む',
      refresh: '更新', openTab: '新しいタブで開く'
    }
  };

  return {
    setup() {
      const locale = ref(localStorage.getItem('sys_locale') || 'en');
      const t = computed(() => LANGS[locale.value] || LANGS.en);
      const googleFrame = ref(null);

      function proxyUrl(url) {
        return '/api/browser/proxy?url=' + encodeURIComponent(url);
      }

      function getRealUrl() {
        const src = iframeSrc.value;
        try {
          const u = new URL(src, location.origin);
          return u.searchParams.get('url') || src;
        } catch { return src; }
      }

      const iframeSrc = ref(proxyUrl('https://www.google.com/'));

      function navigateHome() {
        iframeSrc.value = proxyUrl('https://www.google.com/');
      }

      function goBack() {
        try {
          if (googleFrame.value) googleFrame.value.contentWindow.history.back();
        } catch(e) {}
      }

      function goForward() {
        try {
          if (googleFrame.value) googleFrame.value.contentWindow.history.forward();
        } catch(e) {}
      }

      function refresh() {
        const src = iframeSrc.value;
        iframeSrc.value = '';
        setTimeout(() => { iframeSrc.value = src; }, 50);
      }

      function openExternal() {
        window.open(getRealUrl(), '_blank');
      }

      function onIframeMessage(e) {
        if (e.data && e.data.type === 'browser-navigate' && e.data.url) {
          const url = e.data.url;
          // If it's a Google internal link, navigate within the app
          if (url.includes('google.com') || url.includes('google.co') || url.includes('gstatic.com') || url.includes('googleapis.com')) {
            iframeSrc.value = proxyUrl(url);
          } else {
            // Open external links in the browser app
            window.dispatchEvent(new CustomEvent('open-app-action', { detail: { app: 'browser' } }));
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('browser-open-url', { detail: url }));
            }, 300);
          }
        }
      }

      // Listen for locale changes
      function onLocaleChange() {
        locale.value = localStorage.getItem('sys_locale') || 'en';
      }

      onMounted(() => {
        window.addEventListener('localeChanged', onLocaleChange);
        window.addEventListener('message', onIframeMessage);
      });

      return {
        t,
        iframeSrc,
        googleFrame,
        navigateHome,
        goBack,
        goForward,
        refresh,
        openExternal
      };
    }
  };
})(Vue);
