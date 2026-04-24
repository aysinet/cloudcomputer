(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, watch, nextTick } = Vue;

  return {
    setup() {
      const feeds = ref([]);
      const readItems = ref([]);
      const loading = ref(true);
      const refreshing = ref(false);
      const adding = ref(false);
      const newUrl = ref('');
      const newName = ref('');
      const addError = ref('');

      // Views: 'feeds' | 'items' | 'reader'
      const view = ref('feeds');
      const selectedFeedId = ref(null);
      const selectedItem = ref(null);

      const selectedFeed = computed(() => feeds.value.find(f => f.id === selectedFeedId.value) || null);
      const feedItems = computed(() => selectedFeed.value ? (selectedFeed.value.items || []) : []);

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
            addError.value = err.error || 'Eklenemedi';
          }
        } catch (e) {
          addError.value = 'Bağlantı hatası';
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
        if (url) window.open(url, '_blank', 'noopener');
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
          return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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

      onMounted(async () => {
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
      });

      return {
        feeds, readItems, loading, refreshing, adding, newUrl, newName, addError,
        view, selectedFeed, selectedItem, feedItems, totalUnread,
        feedUnread, isRead,
        addFeed, removeFeed, refreshFeed, refreshAll,
        openFeed, openItem, markAllRead, goBack, openExternal,
        stripHtml, truncate, formatDate
      };
    }
  };
})(Vue);
