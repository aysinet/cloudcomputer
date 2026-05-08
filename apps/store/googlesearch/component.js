(function(Vue) {
  const { ref, computed, onMounted, onBeforeUnmount, nextTick } = Vue;

  const LANGS = {
    tr: {
      home: 'Ana Sayfa', back: 'Geri', forward: 'İleri',
      refresh: 'Yenile', openTab: 'Yeni Sekmede Aç',
      placeholder: 'Google\'da ara...', search: 'Google Araması',
      lucky: 'Şanslı Hissediyorum'
    },
    en: {
      home: 'Home', back: 'Back', forward: 'Forward',
      refresh: 'Refresh', openTab: 'Open in New Tab',
      placeholder: 'Search Google...', search: 'Google Search',
      lucky: 'I\'m Feeling Lucky'
    },
    de: {
      home: 'Startseite', back: 'Zurück', forward: 'Vorwärts',
      refresh: 'Aktualisieren', openTab: 'In neuem Tab öffnen',
      placeholder: 'Google durchsuchen...', search: 'Google Suche',
      lucky: 'Auf gut Glück!'
    },
    fr: {
      home: 'Accueil', back: 'Retour', forward: 'Suivant',
      refresh: 'Actualiser', openTab: 'Ouvrir dans un nouvel onglet',
      placeholder: 'Rechercher sur Google...', search: 'Recherche Google',
      lucky: 'J\'ai de la chance'
    },
    es: {
      home: 'Inicio', back: 'Atrás', forward: 'Adelante',
      refresh: 'Actualizar', openTab: 'Abrir en nueva pestaña',
      placeholder: 'Buscar en Google...', search: 'Buscar con Google',
      lucky: 'Voy a tener suerte'
    },
    ru: {
      home: 'Главная', back: 'Назад', forward: 'Вперёд',
      refresh: 'Обновить', openTab: 'Открыть в новой вкладке',
      placeholder: 'Искать в Google...', search: 'Поиск Google',
      lucky: 'Мне повезёт!'
    },
    zh: {
      home: '首页', back: '后退', forward: '前进',
      refresh: '刷新', openTab: '新标签页打开',
      placeholder: '在Google中搜索...', search: 'Google搜索',
      lucky: '手气不错'
    },
    ja: {
      home: 'ホーム', back: '戻る', forward: '進む',
      refresh: '更新', openTab: '新しいタブで開く',
      placeholder: 'Googleで検索...', search: 'Google検索',
      lucky: 'I\'m Feeling Lucky'
    }
  };

  return {
    setup() {
      const locale = ref(localStorage.getItem('sys_locale') || 'en');
      const t = computed(() => LANGS[locale.value] || LANGS.en);
      const googleFrame = ref(null);
      const searchInput = ref(null);
      const query = ref('');
      const showLanding = ref(true);
      const loading = ref(false);
      const iframeSrc = ref('about:blank');
      const historyStack = ref([]);
      const historyIndex = ref(-1);

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

      function doSearch() {
        const q = query.value.trim();
        if (!q) return;
        loading.value = true;
        const searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(q);
        iframeSrc.value = proxyUrl(searchUrl);
        showLanding.value = false;
        // Push to history
        historyStack.value = historyStack.value.slice(0, historyIndex.value + 1);
        historyStack.value.push(searchUrl);
        historyIndex.value = historyStack.value.length - 1;
      }

      function doLucky() {
        const q = query.value.trim();
        if (!q) return;
        loading.value = true;
        const luckyUrl = 'https://www.google.com/search?q=' + encodeURIComponent(q) + '&btnI=1';
        iframeSrc.value = proxyUrl(luckyUrl);
        showLanding.value = false;
        historyStack.value = historyStack.value.slice(0, historyIndex.value + 1);
        historyStack.value.push(luckyUrl);
        historyIndex.value = historyStack.value.length - 1;
      }

      function navigateHome() {
        showLanding.value = true;
        iframeSrc.value = 'about:blank';
        query.value = '';
        loading.value = false;
        nextTick(() => {
          if (searchInput.value) searchInput.value.focus();
        });
      }

      function goBack() {
        if (historyIndex.value > 0) {
          historyIndex.value--;
          loading.value = true;
          iframeSrc.value = proxyUrl(historyStack.value[historyIndex.value]);
          showLanding.value = false;
        } else {
          navigateHome();
        }
      }

      function goForward() {
        if (historyIndex.value < historyStack.value.length - 1) {
          historyIndex.value++;
          loading.value = true;
          iframeSrc.value = proxyUrl(historyStack.value[historyIndex.value]);
          showLanding.value = false;
        }
      }

      function refresh() {
        if (showLanding.value) return;
        loading.value = true;
        const src = iframeSrc.value;
        iframeSrc.value = 'about:blank';
        setTimeout(() => { iframeSrc.value = src; }, 50);
      }

      function openExternal() {
        if (showLanding.value) {
          window.open('https://www.google.com/', '_blank');
        } else {
          window.open(getRealUrl(), '_blank');
        }
      }

      function onFrameLoad() {
        loading.value = false;
      }

      function onIframeMessage(e) {
        if (e.data && e.data.type === 'browser-navigate' && e.data.url) {
          const url = e.data.url;
          if (url.includes('google.com') || url.includes('google.co') || url.includes('gstatic.com') || url.includes('googleapis.com')) {
            loading.value = true;
            iframeSrc.value = proxyUrl(url);
            showLanding.value = false;
            historyStack.value = historyStack.value.slice(0, historyIndex.value + 1);
            historyStack.value.push(url);
            historyIndex.value = historyStack.value.length - 1;
          } else {
            window.dispatchEvent(new CustomEvent('open-app-action', { detail: { app: 'browser' } }));
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('browser-open-url', { detail: url }));
            }, 300);
          }
        }
      }

      function onLocaleChange() {
        locale.value = localStorage.getItem('sys_locale') || 'en';
      }

      onMounted(() => {
        window.addEventListener('localeChanged', onLocaleChange);
        window.addEventListener('message', onIframeMessage);
        nextTick(() => {
          if (searchInput.value) searchInput.value.focus();
        });
      });

      onBeforeUnmount(() => {
        window.removeEventListener('localeChanged', onLocaleChange);
        window.removeEventListener('message', onIframeMessage);
      });

      return {
        t,
        query,
        showLanding,
        loading,
        iframeSrc,
        googleFrame,
        searchInput,
        navigateHome,
        goBack,
        goForward,
        refresh,
        openExternal,
        doSearch,
        doLucky,
        onFrameLoad
      };
    }
  };
})(Vue);
