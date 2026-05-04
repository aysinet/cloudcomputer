(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, watch, nextTick } = Vue;

  const LANGS = {
    tr: {
      title:'RSS Okuyucu',
      back:'Geri',
      article:'Makale',
      unread:'okunmamış',
      hideRead:'Okunanları gizle',
      showRead:'Okunanları göster',
      markAllRead:'Tümünü okundu işaretle',
      markAllBtn:'✓ Tümü',
      refresh:'Yenile',
      refreshAll:'Tümünü yenile',
      loading:'Yükleniyor...',
      urlPlaceholder:'RSS URL yapıştırın...',
      namePlaceholder:'İsim (opsiyonel)',
      emptyTitle:'Henüz RSS beslemesi eklenmemiş',
      emptyHint:'Yukarıdan bir RSS URL\'si ekleyin',
      articles:'makale',
      remove:'Kaldır',
      noContent:'Bu beslemede içerik bulunamadı',
      untitled:'Başlıksız',
      markRead:'Okundu işaretle',
      goToSource:'Kaynağa Git',
      share:'Paylaş',
      noArticleContent:'İçerik yok',
      addError:'Eklenemedi',
      connError:'Bağlantı hatası'
    },
    en: {
      title:'RSS Reader',
      back:'Back',
      article:'Article',
      unread:'unread',
      hideRead:'Hide read',
      showRead:'Show read',
      markAllRead:'Mark all as read',
      markAllBtn:'✓ All',
      refresh:'Refresh',
      refreshAll:'Refresh all',
      loading:'Loading...',
      urlPlaceholder:'Paste RSS URL...',
      namePlaceholder:'Name (optional)',
      emptyTitle:'No RSS feeds added yet',
      emptyHint:'Add an RSS URL above',
      articles:'articles',
      remove:'Remove',
      noContent:'No content found in this feed',
      untitled:'Untitled',
      markRead:'Mark as read',
      goToSource:'Go to Source',
      share:'Share',
      noArticleContent:'No content',
      addError:'Could not add',
      connError:'Connection error'
    },
    de: {
      title:'RSS-Leser',
      back:'Zurück',
      article:'Artikel',
      unread:'ungelesen',
      hideRead:'Gelesene ausblenden',
      showRead:'Gelesene anzeigen',
      markAllRead:'Alle als gelesen markieren',
      markAllBtn:'✓ Alle',
      refresh:'Aktualisieren',
      refreshAll:'Alle aktualisieren',
      loading:'Laden...',
      urlPlaceholder:'RSS-URL einfügen...',
      namePlaceholder:'Name (optional)',
      emptyTitle:'Noch keine RSS-Feeds hinzugefügt',
      emptyHint:'Fügen Sie oben eine RSS-URL hinzu',
      articles:'Artikel',
      remove:'Entfernen',
      noContent:'Kein Inhalt in diesem Feed gefunden',
      untitled:'Ohne Titel',
      markRead:'Als gelesen markieren',
      goToSource:'Zur Quelle',
      share:'Teilen',
      noArticleContent:'Kein Inhalt',
      addError:'Konnte nicht hinzugefügt werden',
      connError:'Verbindungsfehler'
    },
    fr: {
      title:'Lecteur RSS',
      back:'Retour',
      article:'Article',
      unread:'non lus',
      hideRead:'Masquer les lus',
      showRead:'Afficher les lus',
      markAllRead:'Tout marquer comme lu',
      markAllBtn:'✓ Tous',
      refresh:'Actualiser',
      refreshAll:'Tout actualiser',
      loading:'Chargement...',
      urlPlaceholder:'Collez l\'URL RSS...',
      namePlaceholder:'Nom (optionnel)',
      emptyTitle:'Aucun flux RSS ajouté',
      emptyHint:'Ajoutez une URL RSS ci-dessus',
      articles:'articles',
      remove:'Supprimer',
      noContent:'Aucun contenu trouvé dans ce flux',
      untitled:'Sans titre',
      markRead:'Marquer comme lu',
      goToSource:'Aller à la source',
      share:'Partager',
      noArticleContent:'Pas de contenu',
      addError:'Impossible d\'ajouter',
      connError:'Erreur de connexion'
    },
    es: {
      title:'Lector RSS',
      back:'Atrás',
      article:'Artículo',
      unread:'no leídos',
      hideRead:'Ocultar leídos',
      showRead:'Mostrar leídos',
      markAllRead:'Marcar todo como leído',
      markAllBtn:'✓ Todos',
      refresh:'Actualizar',
      refreshAll:'Actualizar todo',
      loading:'Cargando...',
      urlPlaceholder:'Pegue la URL RSS...',
      namePlaceholder:'Nombre (opcional)',
      emptyTitle:'No se han añadido feeds RSS',
      emptyHint:'Añada una URL RSS arriba',
      articles:'artículos',
      remove:'Eliminar',
      noContent:'No se encontró contenido en este feed',
      untitled:'Sin título',
      markRead:'Marcar como leído',
      goToSource:'Ir a la fuente',
      share:'Compartir',
      noArticleContent:'Sin contenido',
      addError:'No se pudo añadir',
      connError:'Error de conexión'
    },
    ru: {
      title:'RSS Читалка',
      back:'Назад',
      article:'Статья',
      unread:'непрочитанных',
      hideRead:'Скрыть прочитанные',
      showRead:'Показать прочитанные',
      markAllRead:'Отметить все как прочитанные',
      markAllBtn:'✓ Все',
      refresh:'Обновить',
      refreshAll:'Обновить все',
      loading:'Загрузка...',
      urlPlaceholder:'Вставьте URL RSS...',
      namePlaceholder:'Имя (необязательно)',
      emptyTitle:'RSS-каналы ещё не добавлены',
      emptyHint:'Добавьте URL RSS-канала выше',
      articles:'статей',
      remove:'Удалить',
      noContent:'В этом канале нет содержимого',
      untitled:'Без названия',
      markRead:'Отметить как прочитанное',
      goToSource:'Перейти к источнику',
      share:'Поделиться',
      noArticleContent:'Нет содержимого',
      addError:'Не удалось добавить',
      connError:'Ошибка подключения'
    },
    zh: {
      title:'RSS阅读器',
      back:'返回',
      article:'文章',
      unread:'未读',
      hideRead:'隐藏已读',
      showRead:'显示已读',
      markAllRead:'全部标为已读',
      markAllBtn:'全部已读',
      refresh:'刷新',
      refreshAll:'全部刷新',
      loading:'加载中',
      urlPlaceholder:'输入RSS地址...',
      namePlaceholder:'输入名称...',
      emptyTitle:'欢迎',
      emptyHint:'添加RSS源开始阅读',
      articles:'文章',
      remove:'移除',
      noContent:'无内容',
      untitled:'无标题',
      markRead:'标为已读',
      goToSource:'访问原文',
      share:'分享',
      noArticleContent:'无文章内容',
      addError:'添加失败',
      connError:'连接错误'
    },
    ja: {
      title:'RSSリーダー',
      back:'戻る',
      article:'記事',
      unread:'未読',
      hideRead:'既読を非表示',
      showRead:'既読を表示',
      markAllRead:'すべて既読',
      markAllBtn:'すべて既読',
      refresh:'更新',
      refreshAll:'すべて更新',
      loading:'読込中',
      urlPlaceholder:'RSS URLを入力...',
      namePlaceholder:'名前を入力...',
      emptyTitle:'ようこそ',
      emptyHint:'RSSフィードを追加して閲覧開始',
      articles:'記事',
      remove:'削除',
      noContent:'コンテンツなし',
      untitled:'無題',
      markRead:'既読にする',
      goToSource:'元記事へ',
      share:'共有',
      noArticleContent:'記事コンテンツなし',
      addError:'追加エラー',
      connError:'接続エラー'
    },
    it: {
      title:'Lettore RSS',
      back:'Indietro',
      article:'Articolo',
      unread:'Non letti',
      hideRead:'Nascondi letti',
      showRead:'Mostra letti',
      markAllRead:'Segna tutti come letti',
      markAllBtn:'Tutti letti',
      refresh:'Aggiorna',
      refreshAll:'Aggiorna tutto',
      loading:'Caricamento',
      urlPlaceholder:'Inserisci URL RSS...',
      namePlaceholder:'Inserisci nome...',
      emptyTitle:'Benvenuto',
      emptyHint:'Aggiungi feed RSS per iniziare',
      articles:'Articoli',
      remove:'Rimuovi',
      noContent:'Nessun contenuto',
      untitled:'Senza titolo',
      markRead:'Segna come letto',
      goToSource:'Vai alla fonte',
      share:'Condividi',
      noArticleContent:'Nessun contenuto articolo',
      addError:'Errore aggiunta',
      connError:'Errore connessione'
    },
    ar: {
      title:'قارئ RSS',
      back:'رجوع',
      article:'Article',
      unread:'unread',
      hideRead:'Hide read',
      showRead:'Show read',
      markAllRead:'Mark all as read',
      markAllBtn:'✓ All',
      refresh:'تحديث',
      refreshAll:'Refresh all',
      loading:'جار التحميل...',
      urlPlaceholder:'Paste RSS URL...',
      namePlaceholder:'Name (optional)',
      emptyTitle:'كيف يمكنني مساعدتك؟',
      emptyHint:'Add an RSS URL above',
      articles:'articles',
      remove:'إزالة',
      noContent:'أدخل المحتوى',
      untitled:'بدون عنوان',
      markRead:'Mark as read',
      goToSource:'Go to Source',
      share:'Share',
      noArticleContent:'No content',
      addError:'Could not add',
      connError:'Connection error'
    },
    ko: {
      title:'RSS 리더',
      back:'뒤로',
      article:'Article',
      unread:'unread',
      hideRead:'Hide read',
      showRead:'Show read',
      markAllRead:'Mark all as read',
      markAllBtn:'✓ All',
      refresh:'새로고침',
      refreshAll:'Refresh all',
      loading:'로딩 중...',
      urlPlaceholder:'Paste RSS URL...',
      namePlaceholder:'Name (optional)',
      emptyTitle:'No RSS feeds added yet',
      emptyHint:'Add an RSS URL above',
      articles:'articles',
      remove:'제거',
      noContent:'내용을 입력하세요',
      untitled:'제목 없음',
      markRead:'Mark as read',
      goToSource:'Go to Source',
      share:'Share',
      noArticleContent:'No content',
      addError:'Could not add',
      connError:'Connection error'
    },
    hi: {
      title:'RSS रीडर',
      back:'वापस',
      article:'Article',
      unread:'unread',
      hideRead:'Hide read',
      showRead:'Show read',
      markAllRead:'Mark all as read',
      markAllBtn:'✓ All',
      refresh:'रीफ्रेश',
      refreshAll:'Refresh all',
      loading:'लोड हो रहा है...',
      urlPlaceholder:'Paste RSS URL...',
      namePlaceholder:'Name (optional)',
      emptyTitle:'No RSS feeds added yet',
      emptyHint:'Add an RSS URL above',
      articles:'articles',
      remove:'हटाएं',
      noContent:'सामग्री दर्ज करें',
      untitled:'शीर्षकहीन',
      markRead:'Mark as read',
      goToSource:'Go to Source',
      share:'Share',
      noArticleContent:'No content',
      addError:'Could not add',
      connError:'Connection error'
    },
    pt: {
      title:'Leitor RSS',
      back:'Voltar',
      article:'Article',
      unread:'unread',
      hideRead:'Hide read',
      showRead:'Show read',
      markAllRead:'Mark all as read',
      markAllBtn:'✓ All',
      refresh:'Atualizar',
      refreshAll:'Refresh all',
      loading:'Carregando...',
      urlPlaceholder:'Paste RSS URL...',
      namePlaceholder:'Name (optional)',
      emptyTitle:'No RSS feeds added yet',
      emptyHint:'Add an RSS URL above',
      articles:'articles',
      remove:'Remover',
      noContent:'Digite o conteúdo',
      untitled:'Sem título',
      markRead:'Mark as read',
      goToSource:'Go to Source',
      share:'Share',
      noArticleContent:'No content',
      addError:'Could not add',
      connError:'Connection error'
    }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      const feeds = ref([]);
      const readItems = ref([]);
      const loading = ref(true);
      const refreshing = ref(false);
      const adding = ref(false);
      const newUrl = ref('');
      const newName = ref('');
      const addError = ref('');
      const showRead = ref(localStorage.getItem('rss_showRead') !== 'false');

      // Views: 'feeds' | 'items' | 'reader'
      const view = ref('feeds');
      const selectedFeedId = ref(null);
      const selectedItem = ref(null);

      const selectedFeed = computed(() => feeds.value.find(f => f.id === selectedFeedId.value) || null);
      const feedItems = computed(() => {
        const items = selectedFeed.value ? (selectedFeed.value.items || []) : [];
        if (showRead.value) return items;
        return items.filter(i => !readItems.value.includes(i.guid));
      });

      const totalUnread = computed(() => {
        let count = 0;
        for (const f of feeds.value) {
          for (const item of (f.items || [])) {
            if (!readItems.value.includes(item.guid)) count++;
          }
        }
        return count;
      });

      function feedUnread(feed) {
        let count = 0;
        for (const item of (feed.items || [])) {
          if (!readItems.value.includes(item.guid)) count++;
        }
        return count;
      }

      function isRead(item) {
        return readItems.value.includes(item.guid);
      }

      async function loadData() {
        try {
          const res = await fetch('/api/rss/feeds');
          if (res.ok) {
            const data = await res.json();
            feeds.value = data.feeds || [];
            readItems.value = data.readItems || [];
          }
        } catch {}
      }

      async function addFeed() {
        const url = newUrl.value.trim();
        if (!url) return;
        addError.value = '';
        adding.value = true;
        try {
          const res = await fetch('/api/rss/feeds', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, name: newName.value.trim() || '' })
          });
          if (res.ok) {
            const data = await res.json();
            feeds.value = data.feeds || [];
            readItems.value = data.readItems || [];
            newUrl.value = '';
            newName.value = '';
          } else {
            const err = await res.json().catch(() => ({}));
            addError.value = err.error || L('addError');
          }
        } catch (e) {
          addError.value = L('connError');
        }
        adding.value = false;
      }

      async function removeFeed(id) {
        try {
          await fetch('/api/rss/feeds/' + id, { method: 'DELETE' });
          feeds.value = feeds.value.filter(f => f.id !== id);
          if (selectedFeedId.value === id) {
            selectedFeedId.value = null;
            view.value = 'feeds';
          }
        } catch {}
      }

      async function refreshFeed(id) {
        refreshing.value = true;
        try {
          const res = await fetch('/api/rss/feeds/' + id + '/refresh', { method: 'POST' });
          if (res.ok) {
            const data = await res.json();
            feeds.value = data.feeds || [];
            readItems.value = data.readItems || [];
          }
        } catch {}
        refreshing.value = false;
      }

      async function refreshAll() {
        refreshing.value = true;
        try {
          const res = await fetch('/api/rss/refresh-all', { method: 'POST' });
          if (res.ok) {
            const data = await res.json();
            feeds.value = data.feeds || [];
            readItems.value = data.readItems || [];
          }
        } catch {}
        refreshing.value = false;
      }

      function openFeed(feed) {
        selectedFeedId.value = feed.id;
        selectedItem.value = null;
        view.value = 'items';
      }

      async function openItem(item) {
        selectedItem.value = item;
        view.value = 'reader';
        await markItemRead(item);
      }

      async function markItemRead(item) {
        if (!readItems.value.includes(item.guid)) {
          readItems.value.push(item.guid);
          try {
            await fetch('/api/rss/read', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ guid: item.guid })
            });
          } catch {}
        }
      }

      async function markAllRead() {
        if (!selectedFeedId.value) return;
        try {
          await fetch('/api/rss/read-all', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feedId: selectedFeedId.value })
          });
          const feed = feeds.value.find(f => f.id === selectedFeedId.value);
          if (feed) {
            for (const item of feed.items) {
              if (!readItems.value.includes(item.guid)) readItems.value.push(item.guid);
            }
          }
        } catch {}
      }

      function goBack() {
        if (view.value === 'reader') { view.value = 'items'; selectedItem.value = null; }
        else if (view.value === 'items') { view.value = 'feeds'; selectedFeedId.value = null; }
      }

      function openExternal(url) {
        if (!url) return;
        window.dispatchEvent(new CustomEvent('open-app-action', { detail: { app: 'browser' } }));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('browser-open-url', { detail: url }));
        }, 300);
      }

      function shareItem(item) {
        if (!item) return;
        const title = decodeEntities(item.title) || '';
        const url = item.link || '';
        window.__socialShareData = { text: title, url };
        window.dispatchEvent(new CustomEvent('open-app-action', { detail: { app: 'social-share' } }));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('social-share-content', { detail: { text: title, url } }));
        }, 300);
      }

      function decodeEntities(str) {
        if (!str) return '';
        const el = document.createElement('textarea');
        el.innerHTML = str;
        return el.value;
      }

      function stripHtml(html) {
        if (!html) return '';
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
      }

      function truncate(str, len) {
        if (!str) return '';
        const clean = stripHtml(str);
        return clean.length > len ? clean.substring(0, len) + '…' : clean;
      }

      function formatDate(dateStr) {
        if (!dateStr) return '';
        try {
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return dateStr;
          const loc = locale.value === 'tr' ? 'tr-TR' : locale.value === 'de' ? 'de-DE' : locale.value === 'fr' ? 'fr-FR' : locale.value === 'es' ? 'es-ES' : locale.value === 'ru' ? 'ru-RU' : 'en-US';
          return d.toLocaleDateString(loc, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch { return dateStr; }
      }

      // Listen for navigation events from notifications
      function onRssNavigate(e) {
        const detail = e.detail || {};
        if (detail.feedId) {
          const feed = feeds.value.find(f => f.id === detail.feedId);
          if (feed) openFeed(feed);
        }
      }

      watch(showRead, (val) => { localStorage.setItem('rss_showRead', val ? 'true' : 'false'); });

      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }
      onMounted(async () => {
        window.addEventListener('locale-changed', onLocaleChanged);
        await loadData();
        loading.value = false;
        window.addEventListener('rss-navigate', onRssNavigate);

        // Check if there's a pending navigation
        if (window.__rssNavigate) {
          const nav = window.__rssNavigate;
          delete window.__rssNavigate;
          if (nav.feedId) {
            const feed = feeds.value.find(f => f.id === nav.feedId);
            if (feed) nextTick(() => openFeed(feed));
          }
        }
      });

      onUnmounted(() => {
        window.removeEventListener('rss-navigate', onRssNavigate);
        window.removeEventListener('locale-changed', onLocaleChanged);
});

      return {
        L, feeds, readItems, loading, refreshing, adding, newUrl, newName, addError, showRead,
        view, selectedFeed, selectedItem, feedItems, totalUnread,
        feedUnread, isRead,
        addFeed, removeFeed, refreshFeed, refreshAll,
        openFeed, openItem, markItemRead, markAllRead, goBack, openExternal, shareItem,
        decodeEntities, stripHtml, truncate, formatDate
      };
    }
  };
})(Vue);
