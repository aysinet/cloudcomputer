(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, watch, nextTick } = Vue;

  const LANGS = {
    tr: {
      search: 'Ara', searchPlaceholder: 'YouTube\'da ara...', trending: 'Trendler',
      favorites: 'Favoriler', history: 'Geçmiş', noResults: 'Sonuç bulunamadı',
      loading: 'Yükleniyor...', views: 'görüntülenme', addFav: 'Favorilere Ekle',
      removeFav: 'Favorilerden Çıkar', clearHistory: 'Geçmişi Temizle',
      noFavorites: 'Henüz favori eklenmedi', noHistory: 'Geçmiş boş',
      pasteUrl: 'YouTube URL yapıştır...', watch: 'İzle', back: 'Geri',
      openYoutube: 'YouTube\'da Aç', copyLink: 'Bağlantıyı Kopyala',
      copied: 'Kopyalandı!', loadMore: 'Daha Fazla', searchError: 'Arama hatası',
      trendingError: 'Trendler yüklenemedi', urlError: 'Geçersiz YouTube URL',
      ago: 'önce', home: 'Ana Sayfa'
    },
    en: {
      search: 'Search', searchPlaceholder: 'Search YouTube...', trending: 'Trending',
      favorites: 'Favorites', history: 'History', noResults: 'No results found',
      loading: 'Loading...', views: 'views', addFav: 'Add to Favorites',
      removeFav: 'Remove from Favorites', clearHistory: 'Clear History',
      noFavorites: 'No favorites yet', noHistory: 'History is empty',
      pasteUrl: 'Paste YouTube URL...', watch: 'Watch', back: 'Back',
      openYoutube: 'Open on YouTube', copyLink: 'Copy Link',
      copied: 'Copied!', loadMore: 'Load More', searchError: 'Search error',
      trendingError: 'Could not load trends', urlError: 'Invalid YouTube URL',
      ago: 'ago', home: 'Home'
    },
    de: {
      search: 'Suchen', searchPlaceholder: 'Auf YouTube suchen...', trending: 'Trends',
      favorites: 'Favoriten', history: 'Verlauf', noResults: 'Keine Ergebnisse',
      loading: 'Wird geladen...', views: 'Aufrufe', addFav: 'Zu Favoriten',
      removeFav: 'Aus Favoriten entfernen', clearHistory: 'Verlauf löschen',
      noFavorites: 'Noch keine Favoriten', noHistory: 'Verlauf ist leer',
      pasteUrl: 'YouTube-URL einfügen...', watch: 'Ansehen', back: 'Zurück',
      openYoutube: 'Auf YouTube öffnen', copyLink: 'Link kopieren',
      copied: 'Kopiert!', loadMore: 'Mehr laden', searchError: 'Suchfehler',
      trendingError: 'Trends konnten nicht geladen werden', urlError: 'Ungültige YouTube-URL',
      ago: 'vor', home: 'Startseite'
    },
    fr: {
      search: 'Rechercher', searchPlaceholder: 'Rechercher sur YouTube...', trending: 'Tendances',
      favorites: 'Favoris', history: 'Historique', noResults: 'Aucun résultat',
      loading: 'Chargement...', views: 'vues', addFav: 'Ajouter aux favoris',
      removeFav: 'Retirer des favoris', clearHistory: 'Effacer l\'historique',
      noFavorites: 'Pas encore de favoris', noHistory: 'Historique vide',
      pasteUrl: 'Coller l\'URL YouTube...', watch: 'Regarder', back: 'Retour',
      openYoutube: 'Ouvrir sur YouTube', copyLink: 'Copier le lien',
      copied: 'Copié !', loadMore: 'Charger plus', searchError: 'Erreur de recherche',
      trendingError: 'Impossible de charger les tendances', urlError: 'URL YouTube invalide',
      ago: 'il y a', home: 'Accueil'
    },
    es: {
      search: 'Buscar', searchPlaceholder: 'Buscar en YouTube...', trending: 'Tendencias',
      favorites: 'Favoritos', history: 'Historial', noResults: 'Sin resultados',
      loading: 'Cargando...', views: 'vistas', addFav: 'Añadir a favoritos',
      removeFav: 'Quitar de favoritos', clearHistory: 'Borrar historial',
      noFavorites: 'Aún no hay favoritos', noHistory: 'Historial vacío',
      pasteUrl: 'Pegar URL de YouTube...', watch: 'Ver', back: 'Volver',
      openYoutube: 'Abrir en YouTube', copyLink: 'Copiar enlace',
      copied: '¡Copiado!', loadMore: 'Cargar más', searchError: 'Error de búsqueda',
      trendingError: 'No se pudieron cargar las tendencias', urlError: 'URL de YouTube no válida',
      ago: 'hace', home: 'Inicio'
    },
    ru: {
      search: 'Поиск', searchPlaceholder: 'Искать на YouTube...', trending: 'Тренды',
      favorites: 'Избранное', history: 'История', noResults: 'Ничего не найдено',
      loading: 'Загрузка...', views: 'просмотров', addFav: 'В избранное',
      removeFav: 'Удалить из избранного', clearHistory: 'Очистить историю',
      noFavorites: 'Пока нет избранного', noHistory: 'История пуста',
      pasteUrl: 'Вставьте URL YouTube...', watch: 'Смотреть', back: 'Назад',
      openYoutube: 'Открыть на YouTube', copyLink: 'Копировать ссылку',
      copied: 'Скопировано!', loadMore: 'Загрузить ещё', searchError: 'Ошибка поиска',
      trendingError: 'Не удалось загрузить тренды', urlError: 'Неверный URL YouTube',
      ago: 'назад', home: 'Главная'
    },
    zh: { search: 'Search', searchPlaceholder: 'Search YouTube...', trending: 'Trending', favorites: 'Favorites', history: 'History', noResults: 'No results found', loading: 'Loading...', views: 'views', addFav: 'Add to Favorites', removeFav: 'Remove from Favorites', clearHistory: 'Clear History', noFavorites: 'No favorites yet', noHistory: 'History is empty', pasteUrl: 'Paste YouTube URL...', watch: 'Watch', back: 'Back', openYoutube: 'Open on YouTube', copyLink: 'Copy Link', copied: 'Copied!', loadMore: 'Load More', searchError: 'Search error', trendingError: 'Could not load trends', urlError: 'Invalid YouTube URL', ago: 'ago', home: 'Home' },
    ja: { search: 'Search', searchPlaceholder: 'Search YouTube...', trending: 'Trending', favorites: 'Favorites', history: 'History', noResults: 'No results found', loading: 'Loading...', views: 'views', addFav: 'Add to Favorites', removeFav: 'Remove from Favorites', clearHistory: 'Clear History', noFavorites: 'No favorites yet', noHistory: 'History is empty', pasteUrl: 'Paste YouTube URL...', watch: 'Watch', back: 'Back', openYoutube: 'Open on YouTube', copyLink: 'Copy Link', copied: 'Copied!', loadMore: 'Load More', searchError: 'Search error', trendingError: 'Could not load trends', urlError: 'Invalid YouTube URL', ago: 'ago', home: 'Home' },
    it: { search: 'Search', searchPlaceholder: 'Search YouTube...', trending: 'Trending', favorites: 'Favorites', history: 'History', noResults: 'No results found', loading: 'Loading...', views: 'views', addFav: 'Add to Favorites', removeFav: 'Remove from Favorites', clearHistory: 'Clear History', noFavorites: 'No favorites yet', noHistory: 'History is empty', pasteUrl: 'Paste YouTube URL...', watch: 'Watch', back: 'Back', openYoutube: 'Open on YouTube', copyLink: 'Copy Link', copied: 'Copied!', loadMore: 'Load More', searchError: 'Search error', trendingError: 'Could not load trends', urlError: 'Invalid YouTube URL', ago: 'ago', home: 'Home' }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  return {
    setup() {
      var locale = ref(getLocale());
      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }
      function t(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      // ── State ──
      var activeTab = ref('home');
      var searchQuery = ref('');
      var searchResults = ref([]);
      var trendingVideos = ref([]);
      var searching = ref(false);
      var loadingTrending = ref(false);
      var currentVideo = ref(null);
      var searchPage = ref(1);
      var loadingMore = ref(false);
      var urlInput = ref('');

      // Persisted state
      var favorites = ref([]);
      var watchHistory = ref([]);

      function loadPersistedData() {
        try { favorites.value = JSON.parse(localStorage.getItem('yt_favorites') || '[]'); } catch { favorites.value = []; }
        try { watchHistory.value = JSON.parse(localStorage.getItem('yt_history') || '[]'); } catch { watchHistory.value = []; }
      }

      function saveFavorites() {
        try { localStorage.setItem('yt_favorites', JSON.stringify(favorites.value)); } catch {}
      }

      function saveHistory() {
        try { localStorage.setItem('yt_history', JSON.stringify(watchHistory.value)); } catch {}
      }

      // ── Helpers ──
      function extractVideoId(url) {
        if (!url) return null;
        // Standard watch URL
        var m = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
        if (m) return m[1];
        // Short URL
        m = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
        if (m) return m[1];
        // Embed URL
        m = url.match(/embed\/([a-zA-Z0-9_-]{11})/);
        if (m) return m[1];
        // Plain video ID
        if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
        return null;
      }

      function formatDuration(seconds) {
        if (!seconds || !isFinite(seconds)) return '0:00';
        var h = Math.floor(seconds / 3600);
        var m = Math.floor((seconds % 3600) / 60);
        var s = Math.floor(seconds % 60);
        if (h > 0) return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
        return m + ':' + String(s).padStart(2, '0');
      }

      function formatViews(n) {
        if (!n) return '0';
        if (n >= 1000000000) return (n / 1000000000).toFixed(1) + 'B';
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return String(n);
      }

      function isFavorite(videoId) {
        return favorites.value.some(function(v) { return v.videoId === videoId; });
      }

      function toggleFavorite(video) {
        var idx = favorites.value.findIndex(function(v) { return v.videoId === video.videoId; });
        if (idx >= 0) {
          favorites.value.splice(idx, 1);
        } else {
          favorites.value.unshift({
            videoId: video.videoId,
            title: video.title,
            author: video.author,
            duration: video.duration,
            thumbnail: video.thumbnail,
            addedAt: Date.now()
          });
        }
        saveFavorites();
      }

      function addToHistory(video) {
        // Remove duplicates
        watchHistory.value = watchHistory.value.filter(function(v) { return v.videoId !== video.videoId; });
        watchHistory.value.unshift({
          videoId: video.videoId,
          title: video.title,
          author: video.author,
          duration: video.duration,
          thumbnail: video.thumbnail,
          watchedAt: Date.now()
        });
        // Keep only last 50
        if (watchHistory.value.length > 50) watchHistory.value.length = 50;
        saveHistory();
      }

      function clearHistory() {
        watchHistory.value = [];
        saveHistory();
      }

      // ── Search ──
      async function doSearch() {
        var q = searchQuery.value.trim();
        if (!q) return;
        searching.value = true;
        searchPage.value = 1;
        searchResults.value = [];
        try {
          var res = await fetch('/api/youtube/search?q=' + encodeURIComponent(q) + '&page=1');
          if (res.ok) {
            searchResults.value = await res.json();
          }
        } catch {}
        searching.value = false;
        if (activeTab.value !== 'search') activeTab.value = 'search';
      }

      async function loadMore() {
        var q = searchQuery.value.trim();
        if (!q) return;
        loadingMore.value = true;
        searchPage.value++;
        try {
          var res = await fetch('/api/youtube/search?q=' + encodeURIComponent(q) + '&page=' + searchPage.value);
          if (res.ok) {
            var more = await res.json();
            searchResults.value = searchResults.value.concat(more);
          }
        } catch {}
        loadingMore.value = false;
      }

      // ── Trending ──
      async function loadTrending() {
        loadingTrending.value = true;
        try {
          var res = await fetch('/api/youtube/trending?region=US');
          if (res.ok) {
            trendingVideos.value = await res.json();
          }
        } catch {}
        loadingTrending.value = false;
      }

      // ── Watch ──
      function watchVideo(video) {
        currentVideo.value = video;
        addToHistory(video);
      }

      function watchFromUrl() {
        var url = urlInput.value.trim();
        if (!url) return;
        var videoId = extractVideoId(url);
        if (!videoId) {
          ElMessage.warning(t('urlError'));
          return;
        }
        watchVideo({
          videoId: videoId,
          title: 'YouTube Video',
          author: '',
          duration: 0,
          thumbnail: 'https://img.youtube.com/vi/' + videoId + '/mqdefault.jpg'
        });
        urlInput.value = '';
      }

      function closePlayer() {
        currentVideo.value = null;
      }

      function openOnYoutube() {
        if (currentVideo.value) {
          window.open('https://www.youtube.com/watch?v=' + currentVideo.value.videoId, '_blank');
        }
      }

      function copyLink() {
        if (currentVideo.value) {
          var url = 'https://www.youtube.com/watch?v=' + currentVideo.value.videoId;
          navigator.clipboard.writeText(url).then(function() {
            ElMessage.success(t('copied'));
          }).catch(function() {});
        }
      }

      var embedUrl = computed(function() {
        if (!currentVideo.value) return '';
        return 'https://www.youtube.com/embed/' + currentVideo.value.videoId + '?autoplay=1&rel=0';
      });

      // ── Tab helpers ──
      function goHome() {
        currentVideo.value = null;
        activeTab.value = 'home';
      }

      // ── Lifecycle ──
      onMounted(function() {
        loadPersistedData();
        loadTrending();
        window.addEventListener('locale-changed', onLocaleChanged);
      });

      onUnmounted(function() {
        window.removeEventListener('locale-changed', onLocaleChanged);
      });

      return {
        t, activeTab, searchQuery, searchResults, trendingVideos,
        searching, loadingTrending, currentVideo, loadingMore, urlInput,
        favorites, watchHistory, embedUrl,
        doSearch, loadMore, loadTrending,
        watchVideo, watchFromUrl, closePlayer,
        openOnYoutube, copyLink, goHome,
        toggleFavorite, isFavorite, clearHistory,
        formatDuration, formatViews, extractVideoId
      };
    }
  };
})(Vue);
