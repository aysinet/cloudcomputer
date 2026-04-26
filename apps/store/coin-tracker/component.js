(function(Vue) {
  const { ref, reactive, computed, onMounted, onUnmounted, watch } = Vue;

  const LANGS = {
    tr: {
      title: 'Coin Tracker', tabAll: 'Tümü', tabFav: 'Favoriler', tabPortfolio: 'Portföy',
      searchPlaceholder: 'Coin ara... (BTCUSDT)', showHidden: 'Gizlileri göster',
      live: 'Canlı', disconnected: 'Bağlantı kesildi', lastUpdate: 'Son',
      colSymbol: 'Sembol', colPrice: 'Fiyat (USDT)', colActions: 'İşlem',
      noResult: 'Sonuç bulunamadı', loading: 'Veri yükleniyor...',
      editTitle: 'Düzenle', addTitle: 'Coin Ekle',
      lblSymbol: 'Sembol', lblAmount: 'Miktar', lblBuyPrice: 'Alış Fiyatı (USDT)',
      btnSave: 'Kaydet', btnAdd: 'Ekle', btnCancel: 'İptal',
      usdtBalance: 'USDT Bakiye',
      totalCost: 'Toplam Maliyet', currentValue: 'Güncel Değer', pnl: 'Kâr / Zarar',
      colCoin: 'Coin', colAmount: 'Miktar', colBuy: 'Alış', colCurrent: 'Güncel',
      colValue: 'Değer', colPnl: 'K/Z',
      emptyPortfolio: 'Portföyünüze coin ekleyin',
      favTooltip: 'Favori', hideTooltip: 'Gizle', editTooltip: 'Düzenle', deleteTooltip: 'Sil'
    },
    en: {
      title: 'Coin Tracker', tabAll: 'All', tabFav: 'Favorites', tabPortfolio: 'Portfolio',
      searchPlaceholder: 'Search coin... (BTCUSDT)', showHidden: 'Show hidden',
      live: 'Live', disconnected: 'Disconnected', lastUpdate: 'Last',
      colSymbol: 'Symbol', colPrice: 'Price (USDT)', colActions: 'Actions',
      noResult: 'No results found', loading: 'Loading data...',
      editTitle: 'Edit', addTitle: 'Add Coin',
      lblSymbol: 'Symbol', lblAmount: 'Amount', lblBuyPrice: 'Buy Price (USDT)',
      btnSave: 'Save', btnAdd: 'Add', btnCancel: 'Cancel',
      usdtBalance: 'USDT Balance',
      totalCost: 'Total Cost', currentValue: 'Current Value', pnl: 'Profit / Loss',
      colCoin: 'Coin', colAmount: 'Amount', colBuy: 'Buy', colCurrent: 'Current',
      colValue: 'Value', colPnl: 'P/L',
      emptyPortfolio: 'Add coins to your portfolio',
      favTooltip: 'Favorite', hideTooltip: 'Hide', editTooltip: 'Edit', deleteTooltip: 'Delete'
    },
    de: {
      title: 'Coin Tracker', tabAll: 'Alle', tabFav: 'Favoriten', tabPortfolio: 'Portfolio',
      searchPlaceholder: 'Coin suchen... (BTCUSDT)', showHidden: 'Versteckte anzeigen',
      live: 'Live', disconnected: 'Verbindung getrennt', lastUpdate: 'Zuletzt',
      colSymbol: 'Symbol', colPrice: 'Preis (USDT)', colActions: 'Aktionen',
      noResult: 'Keine Ergebnisse', loading: 'Daten werden geladen...',
      editTitle: 'Bearbeiten', addTitle: 'Coin hinzufügen',
      lblSymbol: 'Symbol', lblAmount: 'Menge', lblBuyPrice: 'Kaufpreis (USDT)',
      btnSave: 'Speichern', btnAdd: 'Hinzufügen', btnCancel: 'Abbrechen',
      usdtBalance: 'USDT Guthaben',
      totalCost: 'Gesamtkosten', currentValue: 'Aktueller Wert', pnl: 'Gewinn / Verlust',
      colCoin: 'Coin', colAmount: 'Menge', colBuy: 'Kauf', colCurrent: 'Aktuell',
      colValue: 'Wert', colPnl: 'G/V',
      emptyPortfolio: 'Fügen Sie Coins zu Ihrem Portfolio hinzu',
      favTooltip: 'Favorit', hideTooltip: 'Verstecken', editTooltip: 'Bearbeiten', deleteTooltip: 'Löschen'
    },
    fr: {
      title: 'Coin Tracker', tabAll: 'Tous', tabFav: 'Favoris', tabPortfolio: 'Portefeuille',
      searchPlaceholder: 'Rechercher... (BTCUSDT)', showHidden: 'Afficher masqués',
      live: 'En direct', disconnected: 'Déconnecté', lastUpdate: 'Dernière',
      colSymbol: 'Symbole', colPrice: 'Prix (USDT)', colActions: 'Actions',
      noResult: 'Aucun résultat', loading: 'Chargement...',
      editTitle: 'Modifier', addTitle: 'Ajouter un coin',
      lblSymbol: 'Symbole', lblAmount: 'Montant', lblBuyPrice: "Prix d'achat (USDT)",
      btnSave: 'Enregistrer', btnAdd: 'Ajouter', btnCancel: 'Annuler',
      usdtBalance: 'Solde USDT',
      totalCost: 'Coût total', currentValue: 'Valeur actuelle', pnl: 'Gain / Perte',
      colCoin: 'Coin', colAmount: 'Montant', colBuy: 'Achat', colCurrent: 'Actuel',
      colValue: 'Valeur', colPnl: 'G/P',
      emptyPortfolio: 'Ajoutez des coins à votre portefeuille',
      favTooltip: 'Favori', hideTooltip: 'Masquer', editTooltip: 'Modifier', deleteTooltip: 'Supprimer'
    },
    es: {
      title: 'Coin Tracker', tabAll: 'Todos', tabFav: 'Favoritos', tabPortfolio: 'Portafolio',
      searchPlaceholder: 'Buscar moneda... (BTCUSDT)', showHidden: 'Mostrar ocultos',
      live: 'En vivo', disconnected: 'Desconectado', lastUpdate: 'Última',
      colSymbol: 'Símbolo', colPrice: 'Precio (USDT)', colActions: 'Acciones',
      noResult: 'Sin resultados', loading: 'Cargando datos...',
      editTitle: 'Editar', addTitle: 'Agregar moneda',
      lblSymbol: 'Símbolo', lblAmount: 'Cantidad', lblBuyPrice: 'Precio de compra (USDT)',
      btnSave: 'Guardar', btnAdd: 'Agregar', btnCancel: 'Cancelar',
      usdtBalance: 'Saldo USDT',
      totalCost: 'Costo total', currentValue: 'Valor actual', pnl: 'Ganancia / Pérdida',
      colCoin: 'Moneda', colAmount: 'Cantidad', colBuy: 'Compra', colCurrent: 'Actual',
      colValue: 'Valor', colPnl: 'G/P',
      emptyPortfolio: 'Agregue monedas a su portafolio',
      favTooltip: 'Favorito', hideTooltip: 'Ocultar', editTooltip: 'Editar', deleteTooltip: 'Eliminar'
    },
    ru: {
      title: 'Coin Tracker', tabAll: 'Все', tabFav: 'Избранное', tabPortfolio: 'Портфель',
      searchPlaceholder: 'Поиск монеты... (BTCUSDT)', showHidden: 'Показать скрытые',
      live: 'Онлайн', disconnected: 'Отключено', lastUpdate: 'Послед.',
      colSymbol: 'Символ', colPrice: 'Цена (USDT)', colActions: 'Действия',
      noResult: 'Ничего не найдено', loading: 'Загрузка данных...',
      editTitle: 'Редактировать', addTitle: 'Добавить монету',
      lblSymbol: 'Символ', lblAmount: 'Количество', lblBuyPrice: 'Цена покупки (USDT)',
      btnSave: 'Сохранить', btnAdd: 'Добавить', btnCancel: 'Отмена',
      usdtBalance: 'Баланс USDT',
      totalCost: 'Общая стоимость', currentValue: 'Текущая стоимость', pnl: 'Прибыль / Убыток',
      colCoin: 'Монета', colAmount: 'Кол-во', colBuy: 'Покупка', colCurrent: 'Текущая',
      colValue: 'Стоимость', colPnl: 'П/У',
      emptyPortfolio: 'Добавьте монеты в свой портфель',
      favTooltip: 'Избранное', hideTooltip: 'Скрыть', editTooltip: 'Редактировать', deleteTooltip: 'Удалить'
    },
    zh: { title: 'Coin Tracker', tabAll: 'All', tabFav: 'Favorites', tabPortfolio: 'Portfolio', searchPlaceholder: 'Search coin... (BTCUSDT)', showHidden: 'Show hidden', live: 'Live', disconnected: 'Disconnected', lastUpdate: 'Last', colSymbol: 'Symbol', colPrice: 'Price (USDT)', colActions: 'Actions', noResult: 'No results found', loading: 'Loading data...', editTitle: 'Edit', addTitle: 'Add Coin', lblSymbol: 'Symbol', lblAmount: 'Amount', lblBuyPrice: 'Buy Price (USDT)', btnSave: 'Save', btnAdd: 'Add', btnCancel: 'Cancel', usdtBalance: 'USDT Balance', totalCost: 'Total Cost', currentValue: 'Current Value', pnl: 'Profit / Loss', colCoin: 'Coin', colAmount: 'Amount', colBuy: 'Buy', colCurrent: 'Current', colValue: 'Value', colPnl: 'P/L', emptyPortfolio: 'Add coins to your portfolio', favTooltip: 'Favorite', hideTooltip: 'Hide', editTooltip: 'Edit', deleteTooltip: 'Delete' },
    ja: { title: 'Coin Tracker', tabAll: 'All', tabFav: 'Favorites', tabPortfolio: 'Portfolio', searchPlaceholder: 'Search coin... (BTCUSDT)', showHidden: 'Show hidden', live: 'Live', disconnected: 'Disconnected', lastUpdate: 'Last', colSymbol: 'Symbol', colPrice: 'Price (USDT)', colActions: 'Actions', noResult: 'No results found', loading: 'Loading data...', editTitle: 'Edit', addTitle: 'Add Coin', lblSymbol: 'Symbol', lblAmount: 'Amount', lblBuyPrice: 'Buy Price (USDT)', btnSave: 'Save', btnAdd: 'Add', btnCancel: 'Cancel', usdtBalance: 'USDT Balance', totalCost: 'Total Cost', currentValue: 'Current Value', pnl: 'Profit / Loss', colCoin: 'Coin', colAmount: 'Amount', colBuy: 'Buy', colCurrent: 'Current', colValue: 'Value', colPnl: 'P/L', emptyPortfolio: 'Add coins to your portfolio', favTooltip: 'Favorite', hideTooltip: 'Hide', editTooltip: 'Edit', deleteTooltip: 'Delete' },
    it: { title: 'Coin Tracker', tabAll: 'All', tabFav: 'Favorites', tabPortfolio: 'Portfolio', searchPlaceholder: 'Search coin... (BTCUSDT)', showHidden: 'Show hidden', live: 'Live', disconnected: 'Disconnected', lastUpdate: 'Last', colSymbol: 'Symbol', colPrice: 'Price (USDT)', colActions: 'Actions', noResult: 'No results found', loading: 'Loading data...', editTitle: 'Edit', addTitle: 'Add Coin', lblSymbol: 'Symbol', lblAmount: 'Amount', lblBuyPrice: 'Buy Price (USDT)', btnSave: 'Save', btnAdd: 'Add', btnCancel: 'Cancel', usdtBalance: 'USDT Balance', totalCost: 'Total Cost', currentValue: 'Current Value', pnl: 'Profit / Loss', colCoin: 'Coin', colAmount: 'Amount', colBuy: 'Buy', colCurrent: 'Current', colValue: 'Value', colPnl: 'P/L', emptyPortfolio: 'Add coins to your portfolio', favTooltip: 'Favorite', hideTooltip: 'Hide', editTooltip: 'Edit', deleteTooltip: 'Delete' }
  };

  function getLocale() {
    try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; }
  }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

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

      // ── Portfolio state ──
      const portfolio = ref([]);
      const pfForm = reactive({ symbol: '', amount: '', buyPrice: '' });
      const pfEdit = ref(-1);
      const usdtBalance = ref(0);
      const editingUsdt = ref(false);
      const usdtDraft = ref('');
      const usdtInput = ref(null);

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
              lastUpdate.value = new Date().toLocaleTimeString(locale.value === 'tr' ? 'tr-TR' : locale.value === 'de' ? 'de-DE' : locale.value === 'fr' ? 'fr-FR' : locale.value === 'es' ? 'es-ES' : locale.value === 'ru' ? 'ru-RU' : 'en-US');
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
            portfolio.value = data.portfolio || [];
            usdtBalance.value = data.usdtBalance || 0;
            // Default tab: if user set one use it, else if favorites exist show fav
            if (data.defaultTab) {
              tab.value = data.defaultTab;
            } else if (favorites.value.length > 0) {
              tab.value = 'fav';
            }
          }
        } catch {}
      }

      async function savePrefs(extra) {
        try {
          await fetch('/api/coins/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ favorites: favorites.value, hidden: hidden.value, portfolio: portfolio.value, usdtBalance: usdtBalance.value, ...(extra || {}) })
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
        return favorites.value
          .map(sym => allCoins.value.find(c => c.symbol === sym))
          .filter(Boolean);
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

      function formatBuyPrice(p) {
        if (typeof p !== 'number' || isNaN(p)) return '—';
        if (p >= 1) return p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 });
        if (p >= 0.01) return p.toFixed(6);
        return p.toFixed(8);
      }

      function parseLocaleNumber(str) {
        if (typeof str === 'number') return str;
        str = String(str).trim();
        if (!str) return NaN;
        const lastDot = str.lastIndexOf('.');
        const lastComma = str.lastIndexOf(',');
        if (lastComma > lastDot) {
          str = str.replace(/\./g, '').replace(',', '.');
        } else if (lastDot > lastComma) {
          str = str.replace(/,/g, '');
        }
        return parseFloat(str);
      }

      // ── Portfolio helpers ──
      function getPrice(sym) {
        const s = sym.toUpperCase().replace(/\/USDT$/i, '');
        const full = s.endsWith('USDT') ? s : s + 'USDT';
        const c = allCoins.value.find(x => x.symbol === full);
        return c ? c.price : 0;
      }

      const portfolioRows = computed(() => {
        const rows = portfolio.value.map((p, i) => {
          const cur = getPrice(p.symbol);
          const cost = p.amount * p.buyPrice;
          const val = p.amount * cur;
          const pnl = val - cost;
          const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
          return { ...p, idx: i, curPrice: cur, cost, val, pnl, pnlPct, isUsdt: false };
        });
        if (usdtBalance.value > 0) {
          const amt = usdtBalance.value;
          rows.push({ symbol: 'USDT', amount: amt, buyPrice: 1, idx: -1, curPrice: 1, cost: amt, val: amt, pnl: 0, pnlPct: 0, isUsdt: true });
        }
        return rows;
      });

      const portfolioTotal = computed(() => {
        let cost = 0, val = 0;
        portfolioRows.value.forEach(r => { cost += r.cost; val += r.val; });
        const pnl = val - cost;
        const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
        return { cost, val, pnl, pnlPct };
      });

      function startEditUsdt() {
        usdtDraft.value = usdtBalance.value > 0 ? String(usdtBalance.value) : '';
        editingUsdt.value = true;
        Vue.nextTick(() => { if (usdtInput.value) usdtInput.value.focus(); });
      }

      function saveUsdt() {
        const v = parseLocaleNumber(usdtDraft.value);
        usdtBalance.value = isNaN(v) || v < 0 ? 0 : v;
        editingUsdt.value = false;
        savePrefs();
      }

      function cancelEditUsdt() {
        editingUsdt.value = false;
      }

      function addPortfolioEntry() {
        const sym = pfForm.symbol.toUpperCase().replace(/\/USDT$/i, '').replace(/USDT$/i, '');
        const amount = parseLocaleNumber(pfForm.amount);
        const buyPrice = parseLocaleNumber(pfForm.buyPrice);
        if (!sym || isNaN(amount) || amount <= 0 || isNaN(buyPrice) || buyPrice <= 0) return;
        if (pfEdit.value >= 0) {
          portfolio.value[pfEdit.value] = { symbol: sym, amount, buyPrice };
          pfEdit.value = -1;
        } else {
          portfolio.value.push({ symbol: sym, amount, buyPrice });
        }
        pfForm.symbol = ''; pfForm.amount = ''; pfForm.buyPrice = '';
        savePrefs();
      }

      function editPortfolioEntry(i) {
        const e = portfolio.value[i];
        pfForm.symbol = e.symbol;
        pfForm.amount = String(e.amount);
        pfForm.buyPrice = String(e.buyPrice);
        pfEdit.value = i;
      }

      function removePortfolioEntry(i) {
        portfolio.value.splice(i, 1);
        if (pfEdit.value === i) pfEdit.value = -1;
        savePrefs();
      }

      function cancelEdit() {
        pfForm.symbol = ''; pfForm.amount = ''; pfForm.buyPrice = '';
        pfEdit.value = -1;
      }

      // ── Autocomplete for symbol input ──
      const symbolSuggestions = computed(() => {
        if (!pfForm.symbol || pfForm.symbol.length < 1) return [];
        const s = pfForm.symbol.toUpperCase();
        return allCoins.value
          .filter(c => c.symbol.replace('USDT', '').startsWith(s))
          .slice(0, 6)
          .map(c => c.symbol.replace('USDT', ''));
      });

      function pickSymbol(s) {
        pfForm.symbol = s;
      }

      onMounted(() => {
        loadPrefs();
        connectWS();
        localeTimer = setInterval(() => { locale.value = getLocale(); }, 1000);
      });

      let localeTimer = null;
      onUnmounted(() => {
        if (ws) {
          ws.onclose = null;
          ws.close();
        }
        if (localeTimer) clearInterval(localeTimer);
      });

      return {
        L,
        allCoins, favorites, hidden, search, tab, showHidden,
        connected, lastUpdate, filteredCoins, favCoins, displayCoins,
        isFav, isHidden, toggleFav, toggleHidden, formatPrice, formatBuyPrice,
        portfolio, pfForm, pfEdit, portfolioRows, portfolioTotal,
        addPortfolioEntry, editPortfolioEntry, removePortfolioEntry, cancelEdit,
        symbolSuggestions, pickSymbol, usdtBalance,
        editingUsdt, usdtDraft, usdtInput, startEditUsdt, saveUsdt, cancelEditUsdt
      };
    }
  };
})(Vue);
