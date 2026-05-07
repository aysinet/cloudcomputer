(function(Vue) {
  const { ref, computed, onMounted, onBeforeUnmount } = Vue;

  const LANGS = {
    tr: {
      home: 'Ana Sayfa', openTab: 'Yeni Sekmede Aç',
      favorites: 'Favoriler', addFav: 'Favorilere Ekle', removeFav: 'Favorilerden Çıkar',
      noFavs: 'Henüz favori yok', share: 'Paylaş',
      close: 'Kapat', open: 'Aç', delete: 'Sil'
    },
    en: {
      home: 'Home', openTab: 'Open in New Tab',
      favorites: 'Favorites', addFav: 'Add to Favorites', removeFav: 'Remove from Favorites',
      noFavs: 'No favorites yet', share: 'Share',
      close: 'Close', open: 'Open', delete: 'Delete'
    },
    de: {
      home: 'Startseite', openTab: 'In neuem Tab öffnen',
      favorites: 'Favoriten', addFav: 'Zu Favoriten hinzufügen', removeFav: 'Aus Favoriten entfernen',
      noFavs: 'Noch keine Favoriten', share: 'Teilen',
      close: 'Schließen', open: 'Öffnen', delete: 'Löschen'
    },
    fr: {
      home: 'Accueil', openTab: 'Ouvrir dans un nouvel onglet',
      favorites: 'Favoris', addFav: 'Ajouter aux favoris', removeFav: 'Retirer des favoris',
      noFavs: 'Aucun favori', share: 'Partager',
      close: 'Fermer', open: 'Ouvrir', delete: 'Supprimer'
    },
    es: {
      home: 'Inicio', openTab: 'Abrir en nueva pestaña',
      favorites: 'Favoritos', addFav: 'Añadir a favoritos', removeFav: 'Quitar de favoritos',
      noFavs: 'Sin favoritos', share: 'Compartir',
      close: 'Cerrar', open: 'Abrir', delete: 'Eliminar'
    },
    ru: {
      home: 'Главная', openTab: 'Открыть в новой вкладке',
      favorites: 'Избранное', addFav: 'В избранное', removeFav: 'Из избранного',
      noFavs: 'Нет избранного', share: 'Поделиться',
      close: 'Закрыть', open: 'Открыть', delete: 'Удалить'
    },
    zh: {
      home: '首页', openTab: '新标签页打开',
      favorites: '收藏夹', addFav: '添加收藏', removeFav: '移除收藏',
      noFavs: '暂无收藏', share: '分享',
      close: '关闭', open: '打开', delete: '删除'
    },
    ja: {
      home: 'ホーム', openTab: '新しいタブで開く',
      favorites: 'お気に入り', addFav: 'お気に入りに追加', removeFav: 'お気に入りから削除',
      noFavs: 'お気に入りなし', share: '共有',
      close: '閉じる', open: '開く', delete: '削除'
    }
  };

  return {
    setup() {
      const locale = ref(localStorage.getItem('sys_locale') || 'en');
      const t = computed(() => LANGS[locale.value] || LANGS.en);

      const iframeSrc = ref(proxyUrl('https://www.duckduckgo.com'));

      function proxyUrl(url) {
        return '/api/browser/proxy?url=' + encodeURIComponent(url);
      }

      // Favorites
      const favorites = ref([]);
      const showFavPanel = ref(false);

      // Toast
      const toast = ref('');
      let toastTimer = null;
      function showToast(msg, duration) {
        toast.value = msg;
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { toast.value = ''; }, duration || 3000);
      }

      function getToken() { return localStorage.getItem('auth_token') || ''; }

      // ── Favorites persistence via /api/fs ──
      async function loadFavorites() {
        try {
          const res = await fetch('/api/fs/read?path=' + encodeURIComponent('duckduckgo/favorites.json'), {
            headers: { 'Authorization': 'Bearer ' + getToken() }
          });
          if (res.ok) {
            const data = await res.json();
            favorites.value = JSON.parse(data.content || '[]');
          }
        } catch { favorites.value = []; }
      }

      async function saveFavorites() {
        try {
          await fetch('/api/fs/mkdir', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
            body: JSON.stringify({ dirPath: 'duckduckgo' })
          });
          await fetch('/api/fs/write', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
            body: JSON.stringify({ filePath: 'duckduckgo/favorites.json', content: JSON.stringify(favorites.value) })
          });
        } catch {}
      }

      function getRealUrl() {
        const src = iframeSrc.value;
        try {
          const u = new URL(src, location.origin);
          return u.searchParams.get('url') || src;
        } catch { return src; }
      }

      function getCurrentPageInfo() {
        const realUrl = getRealUrl();
        try {
          const urlObj = new URL(realUrl);
          const query = urlObj.searchParams.get('q') || '';
          return { url: realUrl, title: query || 'DuckDuckGo' };
        } catch { return { url: realUrl, title: 'DuckDuckGo' }; }
      }

      function isFavorite() {
        const cur = getRealUrl();
        return favorites.value.some(f => f.url === cur);
      }

      function toggleFavorite() {
        const cur = getRealUrl();
        const idx = favorites.value.findIndex(f => f.url === cur);
        if (idx >= 0) {
          favorites.value.splice(idx, 1);
        } else {
          const info = getCurrentPageInfo();
          favorites.value.push({ url: info.url, title: info.title, date: new Date().toISOString() });
        }
        saveFavorites();
      }

      function openFavorite(fav) {
        iframeSrc.value = proxyUrl(fav.url);
        showFavPanel.value = false;
      }

      function deleteFavorite(index) {
        favorites.value.splice(index, 1);
        saveFavorites();
      }

      // ── Share via social-share app ──
      function shareLink() {
        const info = getCurrentPageInfo();
        const shareData = {
          text: info.title || 'DuckDuckGo',
          url: getRealUrl(),
          hashtags: ['DuckDuckGo', 'Privacy']
        };
        window.__socialShareData = shareData;
        window.dispatchEvent(new CustomEvent('open-app-action', { detail: { app: 'social-share' } }));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('social-share-content', { detail: shareData }));
        }, 300);
      }

      // ── Navigation ──
      function navigateHome() {
        iframeSrc.value = proxyUrl('https://www.duckduckgo.com');
      }

      function openExternal() {
        window.open(getRealUrl(), '_blank');
      }

      function onIframeMessage(e) {
        if (e.data && e.data.type === 'browser-navigate' && e.data.url) {
          const url = e.data.url;
          // If it's a DuckDuckGo internal link, navigate within the app
          if (url.includes('duckduckgo.com')) {
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

      function onLocaleChanged(e) {
        if (e.detail && e.detail.locale) {
          locale.value = e.detail.locale;
        }
      }

      onMounted(() => {
        window.addEventListener('locale-changed', onLocaleChanged);
        window.addEventListener('message', onIframeMessage);
        loadFavorites();
      });

      onBeforeUnmount(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
        window.removeEventListener('message', onIframeMessage);
        if (toastTimer) clearTimeout(toastTimer);
      });

      return {
        t, iframeSrc,
        favorites, showFavPanel, toast,
        navigateHome, openExternal,
        isFavorite, toggleFavorite, openFavorite, deleteFavorite,
        shareLink
      };
    }
  };
})(Vue);