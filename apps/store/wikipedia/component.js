(function(Vue) {
  const { ref, computed, onMounted, onBeforeUnmount } = Vue;

  const LANGS = {
    tr: {
      home: 'Ana Sayfa', random: 'Rastgele', openTab: 'Yeni Sekmede Aç',
      favorites: 'Favoriler', addFav: 'Favorilere Ekle', removeFav: 'Favorilerden Çıkar',
      noFavs: 'Henüz favori yok', savePdf: 'PDF Kaydet', share: 'Paylaş',
      saving: 'PDF kaydediliyor...', saved: 'PDF kaydedildi!', saveFailed: 'PDF kaydedilemedi',
      enterTitle: 'Sayfa başlığı:', close: 'Kapat', open: 'Aç', delete: 'Sil'
    },
    en: {
      home: 'Home', random: 'Random', openTab: 'Open in New Tab',
      favorites: 'Favorites', addFav: 'Add to Favorites', removeFav: 'Remove from Favorites',
      noFavs: 'No favorites yet', savePdf: 'Save PDF', share: 'Share',
      saving: 'Saving PDF...', saved: 'PDF saved!', saveFailed: 'PDF save failed',
      enterTitle: 'Page title:', close: 'Close', open: 'Open', delete: 'Delete'
    },
    de: {
      home: 'Startseite', random: 'Zufällig', openTab: 'In neuem Tab öffnen',
      favorites: 'Favoriten', addFav: 'Zu Favoriten hinzufügen', removeFav: 'Aus Favoriten entfernen',
      noFavs: 'Noch keine Favoriten', savePdf: 'PDF speichern', share: 'Teilen',
      saving: 'PDF wird gespeichert...', saved: 'PDF gespeichert!', saveFailed: 'PDF-Speicherung fehlgeschlagen',
      enterTitle: 'Seitentitel:', close: 'Schließen', open: 'Öffnen', delete: 'Löschen'
    },
    fr: {
      home: 'Accueil', random: 'Aléatoire', openTab: 'Ouvrir dans un nouvel onglet',
      favorites: 'Favoris', addFav: 'Ajouter aux favoris', removeFav: 'Retirer des favoris',
      noFavs: 'Aucun favori', savePdf: 'Sauvegarder PDF', share: 'Partager',
      saving: 'Sauvegarde du PDF...', saved: 'PDF sauvegardé !', saveFailed: 'Échec de la sauvegarde',
      enterTitle: 'Titre de la page :', close: 'Fermer', open: 'Ouvrir', delete: 'Supprimer'
    },
    es: {
      home: 'Inicio', random: 'Aleatorio', openTab: 'Abrir en nueva pestaña',
      favorites: 'Favoritos', addFav: 'Añadir a favoritos', removeFav: 'Quitar de favoritos',
      noFavs: 'Sin favoritos', savePdf: 'Guardar PDF', share: 'Compartir',
      saving: 'Guardando PDF...', saved: '¡PDF guardado!', saveFailed: 'Error al guardar PDF',
      enterTitle: 'Título de la página:', close: 'Cerrar', open: 'Abrir', delete: 'Eliminar'
    },
    ru: {
      home: 'Главная', random: 'Случайная', openTab: 'Открыть в новой вкладке',
      favorites: 'Избранное', addFav: 'В избранное', removeFav: 'Из избранного',
      noFavs: 'Нет избранного', savePdf: 'Сохранить PDF', share: 'Поделиться',
      saving: 'Сохранение PDF...', saved: 'PDF сохранён!', saveFailed: 'Ошибка сохранения',
      enterTitle: 'Заголовок страницы:', close: 'Закрыть', open: 'Открыть', delete: 'Удалить'
    },
    zh: {
      home: '首页', random: '随机', openTab: '新标签页打开',
      favorites: '收藏夹', addFav: '添加收藏', removeFav: '移除收藏',
      noFavs: '暂无收藏', savePdf: '保存PDF', share: '分享',
      saving: '正在保存PDF...', saved: 'PDF已保存！', saveFailed: 'PDF保存失败',
      enterTitle: '页面标题：', close: '关闭', open: '打开', delete: '删除'
    },
    ja: {
      home: 'ホーム', random: 'ランダム', openTab: '新しいタブで開く',
      favorites: 'お気に入り', addFav: 'お気に入りに追加', removeFav: 'お気に入りから削除',
      noFavs: 'お気に入りなし', savePdf: 'PDF保存', share: '共有',
      saving: 'PDF保存中...', saved: 'PDF保存完了！', saveFailed: 'PDF保存失敗',
      enterTitle: 'ページタイトル：', close: '閉じる', open: '開く', delete: '削除'
    }
  };

  const WIKI_LANGUAGES = [
    { code: 'tr', label: 'Türkçe' },
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' },
    { code: 'es', label: 'Español' },
    { code: 'ru', label: 'Русский' },
    { code: 'zh', label: '中文' },
    { code: 'ja', label: '日本語' },
    { code: 'pt', label: 'Português' },
    { code: 'it', label: 'Italiano' },
    { code: 'ar', label: 'العربية' },
    { code: 'ko', label: '한국어' },
    { code: 'hi', label: 'हिन्दी' }
  ];

  return {
    setup() {
      const locale = ref(localStorage.getItem('sys_locale') || 'en');
      const t = computed(() => LANGS[locale.value] || LANGS.en);
      const languages = ref(WIKI_LANGUAGES);

      const sysLang = localStorage.getItem('sys_locale') || 'en';
      const defaultWikiLang = WIKI_LANGUAGES.find(l => l.code === sysLang) ? sysLang : 'en';
      const wikiLang = ref(defaultWikiLang);

      function proxyUrl(url) {
        return '/api/browser/proxy?url=' + encodeURIComponent(url);
      }

      function wikiUrl(lang) {
        return 'https://' + lang + '.wikipedia.org/';
      }

      const iframeSrc = ref(proxyUrl(wikiUrl(wikiLang.value)));

      // Favorites
      const favorites = ref([]);
      const showFavPanel = ref(false);

      // PDF status
      const pdfStatus = ref(''); // '', 'saving', 'saved', 'error'
      let pdfStatusTimer = null;

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
          const res = await fetch('/api/fs/read?path=' + encodeURIComponent('wikipedia/favorites.json'), {
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
            body: JSON.stringify({ dirPath: 'wikipedia' })
          });
          await fetch('/api/fs/write', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
            body: JSON.stringify({ filePath: 'wikipedia/favorites.json', content: JSON.stringify(favorites.value) })
          });
        } catch {}
      }

      function getCurrentPageInfo() {
        const origUrl = getOriginalUrl();
        const match = origUrl.match(/\/wiki\/(.+?)(?:\?|#|$)/);
        const slug = match ? decodeURIComponent(match[1]).replace(/_/g, ' ') : '';
        return { url: origUrl, title: slug || origUrl };
      }

      function isFavorite() {
        const cur = getOriginalUrl();
        return favorites.value.some(f => f.url === cur);
      }

      function toggleFavorite() {
        const cur = getOriginalUrl();
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

      // ── PDF save via backend ──
      async function savePdf() {
        const info = getCurrentPageInfo();
        const pageTitle = info.title || 'Wikipedia';
        const safeTitle = pageTitle.replace(/[<>:"/\\|?*]/g, '_').substring(0, 100);
        const fileName = safeTitle + '.pdf';
        const savePath = 'downloads/' + fileName;

        pdfStatus.value = 'saving';
        try {
          const res = await fetch('/api/wikipedia/save-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
            body: JSON.stringify({ url: getOriginalUrl(), title: pageTitle, savePath })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed');
          pdfStatus.value = 'saved';
          showToast(t.value.saved + ' → ' + savePath, 4000);
        } catch (e) {
          pdfStatus.value = 'error';
          showToast(t.value.saveFailed + ': ' + e.message, 4000);
        }
        if (pdfStatusTimer) clearTimeout(pdfStatusTimer);
        pdfStatusTimer = setTimeout(() => { pdfStatus.value = ''; }, 4000);
      }

      // ── Share via social-share app ──
      function shareLink() {
        const info = getCurrentPageInfo();
        const shareData = {
          text: info.title || 'Wikipedia',
          url: getOriginalUrl(),
          hashtags: ['Wikipedia']
        };
        // Set pending data and open social-share app
        window.__socialShareData = shareData;
        window.dispatchEvent(new CustomEvent('open-app-action', { detail: { app: 'social-share' } }));
        // Also dispatch in case already open
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('social-share-content', { detail: shareData }));
        }, 300);
      }

      // ── Navigation ──
      function navigateHome() {
        iframeSrc.value = proxyUrl(wikiUrl(wikiLang.value));
      }

      function openRandom() {
        iframeSrc.value = proxyUrl('https://' + wikiLang.value + '.wikipedia.org/wiki/Special:Random');
      }

      function getOriginalUrl() {
        const src = iframeSrc.value;
        const match = src.match(/[?&]url=([^&]+)/);
        return match ? decodeURIComponent(match[1]) : src;
      }

      function openExternal() {
        window.open(getOriginalUrl(), '_blank');
      }

      function onLocaleChanged(e) {
        if (e.detail && e.detail.locale) {
          locale.value = e.detail.locale;
        }
      }

      onMounted(() => {
        window.addEventListener('locale-changed', onLocaleChanged);
        loadFavorites();
      });

      onBeforeUnmount(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
        if (pdfStatusTimer) clearTimeout(pdfStatusTimer);
        if (toastTimer) clearTimeout(toastTimer);
      });

      return {
        t, languages, wikiLang, iframeSrc,
        favorites, showFavPanel, pdfStatus, toast,
        navigateHome, openRandom, openExternal,
        isFavorite, toggleFavorite, openFavorite, deleteFavorite,
        savePdf, shareLink
      };
    }
  };
})(Vue);