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
      favTooltip: 'Favori', hideTooltip: 'Gizle', editTooltip: 'Düzenle', deleteTooltip: 'Sil',
      alertTooltip: 'Bildirim', alertTitle: 'Fiyat Bildirimi', alertMin: 'Minimum Fiyat', alertMax: 'Maksimum Fiyat',
      alertSave: 'Kaydet', alertRemove: 'Kaldır', alertClose: 'Kapat', alertActive: 'Aktif Bildirimler', alertNone: 'Bildirim yok'
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
      favTooltip: 'Favorite', hideTooltip: 'Hide', editTooltip: 'Edit', deleteTooltip: 'Delete',
      alertTooltip: 'Alert', alertTitle: 'Price Alert', alertMin: 'Min Price', alertMax: 'Max Price',
      alertSave: 'Save', alertRemove: 'Remove', alertClose: 'Close', alertActive: 'Active Alerts', alertNone: 'No alerts'
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
      favTooltip: 'Favorit', hideTooltip: 'Verstecken', editTooltip: 'Bearbeiten', deleteTooltip: 'Löschen',
      alertTooltip: 'Alarm', alertTitle: 'Preisalarm', alertMin: 'Mindestpreis', alertMax: 'Höchstpreis',
      alertSave: 'Speichern', alertRemove: 'Entfernen', alertClose: 'Schließen', alertActive: 'Aktive Alarme', alertNone: 'Keine Alarme'
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
      favTooltip: 'Favori', hideTooltip: 'Masquer', editTooltip: 'Modifier', deleteTooltip: 'Supprimer',
      alertTooltip: 'Alerte', alertTitle: 'Alerte de prix', alertMin: 'Prix minimum', alertMax: 'Prix maximum',
      alertSave: 'Enregistrer', alertRemove: 'Supprimer', alertClose: 'Fermer', alertActive: 'Alertes actives', alertNone: 'Aucune alerte'
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
      favTooltip: 'Favorito', hideTooltip: 'Ocultar', editTooltip: 'Editar', deleteTooltip: 'Eliminar',
      alertTooltip: 'Alerta', alertTitle: 'Alerta de precio', alertMin: 'Precio mínimo', alertMax: 'Precio máximo',
      alertSave: 'Guardar', alertRemove: 'Eliminar', alertClose: 'Cerrar', alertActive: 'Alertas activas', alertNone: 'Sin alertas'
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
      favTooltip: 'Избранное', hideTooltip: 'Скрыть', editTooltip: 'Редактировать', deleteTooltip: 'Удалить',
      alertTooltip: 'Уведомление', alertTitle: 'Уведомление о цене', alertMin: 'Мин. цена', alertMax: 'Макс. цена',
      alertSave: 'Сохранить', alertRemove: 'Удалить', alertClose: 'Закрыть', alertActive: 'Активные уведомления', alertNone: 'Нет уведомлений'
    },
    zh: { title:'加密货币追踪', tabAll:'全部', tabFav:'收藏', tabPortfolio:'投资组合', searchPlaceholder:'搜索币种...', showHidden:'显示隐藏', live:'实时', disconnected:'已断开', lastUpdate:'最后更新', colSymbol:'代码', colPrice:'价格', colActions:'操作', noResult:'无结果', loading:'加载中', editTitle:'编辑', addTitle:'添加', lblSymbol:'代码', lblAmount:'数量', lblBuyPrice:'买入价', btnSave:'保存', btnAdd:'添加', btnCancel:'取消', usdtBalance:'USDT余额', totalCost:'总成本', currentValue:'当前价值', pnl:'盈亏', colCoin:'币种', colAmount:'数量', colBuy:'买入价', colCurrent:'当前价', colValue:'价值', colPnl:'盈亏', emptyPortfolio:'投资组合为空', favTooltip:'收藏', hideTooltip:'隐藏', editTooltip:'编辑', deleteTooltip:'删除', alertTooltip:'提醒', alertTitle:'价格提醒', alertMin:'最低价', alertMax:'最高价', alertSave:'保存', alertRemove:'删除', alertClose:'关闭', alertActive:'活跃提醒', alertNone:'无提醒' },
    ja: { title:'暗号通貨トラッカー', tabAll:'すべて', tabFav:'お気に入り', tabPortfolio:'ポートフォリオ', searchPlaceholder:'通貨を検索...', showHidden:'非表示を表示', live:'リアルタイム', disconnected:'切断', lastUpdate:'最終更新', colSymbol:'シンボル', colPrice:'価格', colActions:'操作', noResult:'結果なし', loading:'読込中', editTitle:'編集', addTitle:'追加', lblSymbol:'シンボル', lblAmount:'数量', lblBuyPrice:'購入価格', btnSave:'保存', btnAdd:'追加', btnCancel:'キャンセル', usdtBalance:'USDT残高', totalCost:'総コスト', currentValue:'現在価値', pnl:'損益', colCoin:'通貨', colAmount:'数量', colBuy:'購入価格', colCurrent:'現在価格', colValue:'価値', colPnl:'損益', emptyPortfolio:'ポートフォリオは空です', favTooltip:'お気に入り', hideTooltip:'非表示', editTooltip:'編集', deleteTooltip:'削除', alertTooltip:'アラート', alertTitle:'価格アラート', alertMin:'最低価格', alertMax:'最高価格', alertSave:'保存', alertRemove:'削除', alertClose:'閉じる', alertActive:'アクティブなアラート', alertNone:'アラートなし' },
    it: { title:'Tracker Criptovalute', tabAll:'Tutte', tabFav:'Preferite', tabPortfolio:'Portafoglio', searchPlaceholder:'Cerca moneta...', showHidden:'Mostra nascoste', live:'In tempo reale', disconnected:'Disconnesso', lastUpdate:'Ultimo aggiornamento', colSymbol:'Simbolo', colPrice:'Prezzo', colActions:'Azioni', noResult:'Nessun risultato', loading:'Caricamento', editTitle:'Modifica', addTitle:'Aggiungi', lblSymbol:'Simbolo', lblAmount:'Quantità', lblBuyPrice:'Prezzo acquisto', btnSave:'Salva', btnAdd:'Aggiungi', btnCancel:'Annulla', usdtBalance:'Saldo USDT', totalCost:'Costo totale', currentValue:'Valore attuale', pnl:'P/L', colCoin:'Moneta', colAmount:'Quantità', colBuy:'Acquisto', colCurrent:'Attuale', colValue:'Valore', colPnl:'P/L', emptyPortfolio:'Portafoglio vuoto', favTooltip:'Preferita', hideTooltip:'Nascondi', editTooltip:'Modifica', deleteTooltip:'Elimina', alertTooltip:'Avviso', alertTitle:'Avviso prezzo', alertMin:'Prezzo minimo', alertMax:'Prezzo massimo', alertSave:'Salva', alertRemove:'Rimuovi', alertClose:'Chiudi', alertActive:'Avvisi attivi', alertNone:'Nessun avviso' }
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

      // ── Drag reorder helpers ──
      const dragIdx = ref(-1);
      const dragOverIdx = ref(-1);
      const dragTarget = ref(''); // 'fav' or 'pf'

      function onDragStart(type, idx, e) {
        dragTarget.value = type;
        dragIdx.value = idx;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', idx);
      }
      function onDragOver(type, idx, e) {
        if (dragTarget.value !== type) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        dragOverIdx.value = idx;
      }
      function onDragEnd() {
        dragIdx.value = -1;
        dragOverIdx.value = -1;
        dragTarget.value = '';
      }
      function onDropFav(idx) {
        if (dragTarget.value !== 'fav' || dragIdx.value < 0 || dragIdx.value === idx) { onDragEnd(); return; }
        const arr = [...favorites.value];
        const [moved] = arr.splice(dragIdx.value, 1);
        arr.splice(idx, 0, moved);
        favorites.value = arr;
        onDragEnd();
        savePrefs();
      }
      function onDropPf(idx) {
        if (dragTarget.value !== 'pf' || dragIdx.value < 0 || dragIdx.value === idx) { onDragEnd(); return; }
        const arr = [...portfolio.value];
        const [moved] = arr.splice(dragIdx.value, 1);
        arr.splice(idx, 0, moved);
        portfolio.value = arr;
        onDragEnd();
        savePrefs();
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

      // ── Price alerts ──
      const coinAlerts = ref([]);
      const alertDialogOpen = ref(false);
      const alertSymbol = ref('');
      const alertMin = ref('');
      const alertMax = ref('');

      async function loadAlerts() {
        try {
          const res = await fetch('/api/coins/alerts');
          if (res.ok) coinAlerts.value = await res.json();
        } catch {}
      }

      async function saveAlerts() {
        try {
          await fetch('/api/coins/alerts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alerts: coinAlerts.value })
          });
        } catch {}
      }

      function openAlertDialog(symbol) {
        const sym = symbol.endsWith('USDT') ? symbol : symbol + 'USDT';
        alertSymbol.value = sym;
        const existing = coinAlerts.value.find(a => a.symbol === sym);
        alertMin.value = existing && existing.min !== null ? String(existing.min) : '';
        alertMax.value = existing && existing.max !== null ? String(existing.max) : '';
        alertDialogOpen.value = true;
      }

      function saveAlert() {
        const sym = alertSymbol.value;
        const min = alertMin.value.trim() !== '' ? parseLocaleNumber(alertMin.value) : null;
        const max = alertMax.value.trim() !== '' ? parseLocaleNumber(alertMax.value) : null;
        if (min === null && max === null) { removeAlert(); return; }
        const idx = coinAlerts.value.findIndex(a => a.symbol === sym);
        const entry = { symbol: sym, min: (min !== null && !isNaN(min)) ? min : null, max: (max !== null && !isNaN(max)) ? max : null };
        if (idx >= 0) coinAlerts.value[idx] = entry;
        else coinAlerts.value.push(entry);
        saveAlerts();
        alertDialogOpen.value = false;
      }

      function removeAlert() {
        coinAlerts.value = coinAlerts.value.filter(a => a.symbol !== alertSymbol.value);
        saveAlerts();
        alertDialogOpen.value = false;
      }

      function removeAlertBySymbol(sym) {
        coinAlerts.value = coinAlerts.value.filter(a => a.symbol !== sym);
        saveAlerts();
      }

      function hasAlert(sym) {
        return coinAlerts.value.some(a => a.symbol === sym);
      }

      function closeAlertDialog() {
        alertDialogOpen.value = false;
      }

      onMounted(() => {
        loadPrefs();
        loadAlerts();
        connectWS();
        window.addEventListener('locale-changed', onLocaleChanged);
      });

      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }
      onUnmounted(() => {
        if (ws) {
          ws.onclose = null;
          ws.close();
        }
        window.removeEventListener('locale-changed', onLocaleChanged);
      });

      return {
        L,
        allCoins, favorites, hidden, search, tab, showHidden,
        connected, lastUpdate, filteredCoins, favCoins, displayCoins,
        isFav, isHidden, toggleFav, toggleHidden, formatPrice, formatBuyPrice,
        portfolio, pfForm, pfEdit, portfolioRows, portfolioTotal,
        addPortfolioEntry, editPortfolioEntry, removePortfolioEntry, cancelEdit,
        symbolSuggestions, pickSymbol, usdtBalance,
        editingUsdt, usdtDraft, usdtInput, startEditUsdt, saveUsdt, cancelEditUsdt,
        dragIdx, dragOverIdx, dragTarget,
        onDragStart, onDragOver, onDragEnd, onDropFav, onDropPf,
        coinAlerts, alertDialogOpen, alertSymbol, alertMin, alertMax,
        openAlertDialog, saveAlert, removeAlert, removeAlertBySymbol, hasAlert, closeAlertDialog
      };
    }
  };
})(Vue);
