(function(Vue) {
  const { ref, computed, onMounted, onBeforeUnmount } = Vue;

  const LANGS = {
    tr: {
      home: 'Ana Sayfa', back: 'Geri', forward: 'İleri',
      refresh: 'Yenile', openTab: 'Yeni Sekmede Aç',
      clearSession: 'Oturumu Temizle', loading: 'Cloudflare yükleniyor...',
      sessionCleared: 'Oturum temizlendi'
    },
    en: {
      home: 'Home', back: 'Back', forward: 'Forward',
      refresh: 'Refresh', openTab: 'Open in New Tab',
      clearSession: 'Clear Session', loading: 'Loading Cloudflare...',
      sessionCleared: 'Session cleared'
    },
    de: {
      home: 'Startseite', back: 'Zurück', forward: 'Vorwärts',
      refresh: 'Aktualisieren', openTab: 'In neuem Tab öffnen',
      clearSession: 'Sitzung löschen', loading: 'Cloudflare wird geladen...',
      sessionCleared: 'Sitzung gelöscht'
    },
    fr: {
      home: 'Accueil', back: 'Retour', forward: 'Suivant',
      refresh: 'Actualiser', openTab: 'Ouvrir dans un nouvel onglet',
      clearSession: 'Effacer la session', loading: 'Chargement de Cloudflare...',
      sessionCleared: 'Session effacée'
    },
    es: {
      home: 'Inicio', back: 'Atrás', forward: 'Adelante',
      refresh: 'Actualizar', openTab: 'Abrir en nueva pestaña',
      clearSession: 'Borrar sesión', loading: 'Cargando Cloudflare...',
      sessionCleared: 'Sesión borrada'
    },
    ru: {
      home: 'Главная', back: 'Назад', forward: 'Вперёд',
      refresh: 'Обновить', openTab: 'Открыть в новой вкладке',
      clearSession: 'Очистить сессию', loading: 'Загрузка Cloudflare...',
      sessionCleared: 'Сессия очищена'
    },
    zh: {
      home: '首页', back: '后退', forward: '前进',
      refresh: '刷新', openTab: '新标签页打开',
      clearSession: '清除会话', loading: '正在加载Cloudflare...',
      sessionCleared: '会话已清除'
    },
    ja: {
      home: 'ホーム', back: '戻る', forward: '進む',
      refresh: '更新', openTab: '新しいタブで開く',
      clearSession: 'セッションをクリア', loading: 'Cloudflareを読み込み中...',
      sessionCleared: 'セッションがクリアされました'
    }
  };

  const APP_ID = 'cloudflare';
  const HOME_URL = 'https://dash.cloudflare.com/login';
  const PROXY_DOMAIN = 'cloudflare.com';

  return {
    setup() {
      const locale = ref(localStorage.getItem('sys_locale') || 'tr');
      const t = computed(() => LANGS[locale.value] || LANGS.tr);
      const cfFrame = ref(null);
      const iframeLoaded = ref(false);
      const statusMsg = ref('');

      function getToken() {
        try { const c = document.cookie.match(/token=([^;]+)/); if (c) return c[1]; } catch {}
        try { const t = localStorage.getItem('auth_token'); if (t) return t; } catch {}
        return '';
      }

      function proxyUrl(url) {
        return '/api/proxy-session/' + APP_ID + '?url=' + encodeURIComponent(url) + '&proxyDomain=' + encodeURIComponent(PROXY_DOMAIN);
      }

      function getRealUrl() {
        const src = iframeSrc.value;
        try {
          const u = new URL(src, location.origin);
          return u.searchParams.get('url') || src;
        } catch { return src; }
      }

      const iframeSrc = ref(proxyUrl(HOME_URL));

      function navigateHome() {
        iframeLoaded.value = false;
        iframeSrc.value = proxyUrl(HOME_URL);
      }

      function goBack() {
        try { if (cfFrame.value) cfFrame.value.contentWindow.history.back(); } catch {}
      }

      function goForward() {
        try { if (cfFrame.value) cfFrame.value.contentWindow.history.forward(); } catch {}
      }

      function refresh() {
        iframeLoaded.value = false;
        const src = iframeSrc.value;
        iframeSrc.value = '';
        setTimeout(() => { iframeSrc.value = src; }, 50);
      }

      function openExternal() {
        window.open(getRealUrl(), '_blank');
      }

      function onIframeLoad() {
        iframeLoaded.value = true;
      }

      async function clearSession() {
        try {
          const token = getToken();
          await fetch('/api/proxy-session/' + APP_ID + '/cookies', {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
          });
          statusMsg.value = t.value.sessionCleared;
          setTimeout(() => { statusMsg.value = ''; }, 2000);
          navigateHome();
        } catch {}
      }

      function onIframeMessage(e) {
        if (e.data && e.data.type === 'browser-navigate' && e.data.url) {
          const url = e.data.url;
          if (url.includes('cloudflare.com')) {
            iframeLoaded.value = false;
            iframeSrc.value = proxyUrl(url);
          } else {
            window.dispatchEvent(new CustomEvent('open-app-action', { detail: { app: 'browser' } }));
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('browser-open-url', { detail: url }));
            }, 300);
          }
        }
      }

      function onLocaleChange() {
        locale.value = localStorage.getItem('sys_locale') || 'tr';
      }

      onMounted(() => {
        window.addEventListener('locale-changed', onLocaleChange);
        window.addEventListener('message', onIframeMessage);
      });

      onBeforeUnmount(() => {
        window.removeEventListener('locale-changed', onLocaleChange);
        window.removeEventListener('message', onIframeMessage);
      });

      return {
        t,
        iframeSrc,
        iframeLoaded,
        cfFrame,
        statusMsg,
        navigateHome,
        goBack,
        goForward,
        refresh,
        openExternal,
        onIframeLoad,
        clearSession
      };
    }
  };
})(Vue);
