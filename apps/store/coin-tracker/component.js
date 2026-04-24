(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, watch } = Vue;
  return {
    setup() {
      const allCoins = ref([]);
      const favorites = ref(['BTCUSDT', 'ETHUSDT', 'BNBUSDT']);
      const hidden = ref([]);
      const search = ref('');
      const tab = ref('all');
      const showHidden = ref(false);
      const connected = ref(false);
      const lastUpdate = ref('');
      let ws = null;
      let prevPrices = {};

      // ── WebSocket connection ──
      function connectWS() {
        const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
        ws = new WebSocket(proto + '//' + location.host + '/ws');

        ws.onopen = () => {
          connected.value = true;
          ws.send(JSON.stringify({ type: 'coin-subscribe' }));
        };

        ws.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data);
            if (msg.type === 'coin-prices' && Array.isArray(msg.data)) {
              // Determine price direction
              const updated = msg.data.map(c => {
                const prev = prevPrices[c.symbol];
                let dir = '';
                if (prev !== undefined) {
                  if (c.price > prev) dir = 'up';
                  else if (c.price < prev) dir = 'down';
                }
                prevPrices[c.symbol] = c.price;
                return { ...c, dir };
              });
              allCoins.value = updated;
              lastUpdate.value = new Date().toLocaleTimeString('tr-TR');
            }
          } catch {}
        };

        ws.onclose = () => {
          connected.value = false;
          setTimeout(connectWS, 3000);
        };

        ws.onerror = () => { ws.close(); };
      }

      // ── Load prefs ──
      async function loadPrefs() {
        try {
          const res = await fetch('/api/coins/favorites');
          if (res.ok) {
            const data = await res.json();
            favorites.value = data.favorites || [];
            hidden.value = data.hidden || [];
          }
        } catch {}
      }

      async function savePrefs() {
        try {
          await fetch('/api/coins/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ favorites: favorites.value, hidden: hidden.value })
          });
        } catch {}
      }

      // ── Computed lists ──
      const filteredCoins = computed(() => {
        let list = allCoins.value;
        if (!showHidden.value) list = list.filter(c => !hidden.value.includes(c.symbol));
        if (search.value) {
          const s = search.value.toUpperCase();
          list = list.filter(c => c.symbol.includes(s));
        }
        return list;
      });

      const favCoins = computed(() => {
        return allCoins.value.filter(c => favorites.value.includes(c.symbol));
      });

      const displayCoins = computed(() => {
        if (tab.value === 'fav') return favCoins.value;
        return filteredCoins.value;
      });

      function isFav(sym) { return favorites.value.includes(sym); }
      function isHidden(sym) { return hidden.value.includes(sym); }

      function toggleFav(sym) {
        const idx = favorites.value.indexOf(sym);
        if (idx >= 0) favorites.value.splice(idx, 1);
        else favorites.value.push(sym);
        savePrefs();
      }

      function toggleHidden(sym) {
        const idx = hidden.value.indexOf(sym);
        if (idx >= 0) hidden.value.splice(idx, 1);
        else hidden.value.push(sym);
        savePrefs();
      }

      function formatPrice(p) {
        if (p >= 1) return p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (p >= 0.01) return p.toFixed(4);
        return p.toFixed(8);
      }

      onMounted(() => {
        loadPrefs();
        connectWS();
      });

      onUnmounted(() => {
        if (ws) {
          ws.onclose = null;
          ws.close();
        }
      });

      return {
        allCoins, favorites, hidden, search, tab, showHidden,
        connected, lastUpdate, filteredCoins, favCoins, displayCoins,
        isFav, isHidden, toggleFav, toggleHidden, formatPrice
      };
    }
  };
})(Vue);
