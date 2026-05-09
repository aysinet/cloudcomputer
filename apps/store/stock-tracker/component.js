(function(Vue) {
  const { ref, reactive, computed, onMounted, onUnmounted, watch } = Vue;

  const LANGS = {
    tr: {
      title:'Stock Tracker',
      tabAll:'Tümü',
      tabFav:'Favoriler',
      tabPortfolio:'Portföy',
      searchPlaceholder:'Hisse ara... (AAPL)',
      showHidden:'Gizlileri göster',
      live:'Canlı',
      disconnected:'Bağlantı kesildi',
      lastUpdate:'Son',
      colSymbol:'Sembol',
      colPrice:'Fiyat ($)',
      colChange:'Değişim',
      colActions:'İşlem',
      noResult:'Sonuç bulunamadı',
      loading:'Veri yükleniyor...',
      noKey:'FINNHUB_API_KEY ayarlanmadı',
      editTitle:'Düzenle',
      addTitle:'Hisse Ekle',
      lblSymbol:'Sembol',
      lblAmount:'Adet',
      lblBuyPrice:'Alış Fiyatı ($)',
      btnSave:'Kaydet',
      btnAdd:'Ekle',
      btnCancel:'İptal',
      usdBalance:'USD Bakiye',
      totalCost:'Toplam Maliyet',
      currentValue:'Güncel Değer',
      pnl:'Kâr / Zarar',
      colStock:'Hisse',
      colAmount:'Adet',
      colBuy:'Alış',
      colCurrent:'Güncel',
      colValue:'Değer',
      colPnl:'K/Z',
      emptyPortfolio:'Portföyünüze hisse ekleyin',
      favTooltip:'Favori',
      hideTooltip:'Gizle',
      editTooltip:'Düzenle',
      deleteTooltip:'Sil',
      marketOpen:'Piyasa Açık',
      marketClosed:'Piyasa Kapalı',
      preMarket:'Açılış Öncesi',
      postMarket:'Kapanış Sonrası',
      high:'Yüksek',
      low:'Düşük',
      prevClose:'Önceki Kapanış'
    },
    en: {
      title:'Stock Tracker',
      tabAll:'All',
      tabFav:'Favorites',
      tabPortfolio:'Portfolio',
      searchPlaceholder:'Search stock... (AAPL)',
      showHidden:'Show hidden',
      live:'Live',
      disconnected:'Disconnected',
      lastUpdate:'Last',
      colSymbol:'Symbol',
      colPrice:'Price ($)',
      colChange:'Change',
      colActions:'Actions',
      noResult:'No results found',
      loading:'Loading data...',
      noKey:'FINNHUB_API_KEY not set',
      editTitle:'Edit',
      addTitle:'Add Stock',
      lblSymbol:'Symbol',
      lblAmount:'Shares',
      lblBuyPrice:'Buy Price ($)',
      btnSave:'Save',
      btnAdd:'Add',
      btnCancel:'Cancel',
      usdBalance:'USD Balance',
      totalCost:'Total Cost',
      currentValue:'Current Value',
      pnl:'Profit / Loss',
      colStock:'Stock',
      colAmount:'Shares',
      colBuy:'Buy',
      colCurrent:'Current',
      colValue:'Value',
      colPnl:'P/L',
      emptyPortfolio:'Add stocks to your portfolio',
      favTooltip:'Favorite',
      hideTooltip:'Hide',
      editTooltip:'Edit',
      deleteTooltip:'Delete',
      marketOpen:'Market Open',
      marketClosed:'Market Closed',
      preMarket:'Pre-Market',
      postMarket:'Post-Market',
      high:'High',
      low:'Low',
      prevClose:'Prev Close'
    },
    de: {
      title:'Stock Tracker',
      tabAll:'Alle',
      tabFav:'Favoriten',
      tabPortfolio:'Portfolio',
      searchPlaceholder:'Aktie suchen... (AAPL)',
      showHidden:'Versteckte anzeigen',
      live:'Live',
      disconnected:'Verbindung getrennt',
      lastUpdate:'Zuletzt',
      colSymbol:'Symbol',
      colPrice:'Kurs ($)',
      colChange:'Änd.',
      colActions:'Aktionen',
      noResult:'Keine Ergebnisse',
      loading:'Daten werden geladen...',
      noKey:'FINNHUB_API_KEY nicht gesetzt',
      editTitle:'Bearbeiten',
      addTitle:'Aktie hinzufügen',
      lblSymbol:'Symbol',
      lblAmount:'Stück',
      lblBuyPrice:'Kaufkurs ($)',
      btnSave:'Speichern',
      btnAdd:'Hinzufügen',
      btnCancel:'Abbrechen',
      usdBalance:'USD Guthaben',
      totalCost:'Gesamtkosten',
      currentValue:'Aktueller Wert',
      pnl:'Gewinn / Verlust',
      colStock:'Aktie',
      colAmount:'Stück',
      colBuy:'Kauf',
      colCurrent:'Aktuell',
      colValue:'Wert',
      colPnl:'G/V',
      emptyPortfolio:'Fügen Sie Aktien zu Ihrem Portfolio hinzu',
      favTooltip:'Favorit',
      hideTooltip:'Verstecken',
      editTooltip:'Bearbeiten',
      deleteTooltip:'Löschen',
      marketOpen:'Markt offen',
      marketClosed:'Markt geschlossen',
      preMarket:'Vorbörslich',
      postMarket:'Nachbörslich',
      high:'Hoch',
      low:'Tief',
      prevClose:'Vortag'
    },
    fr: {
      title:'Stock Tracker',
      tabAll:'Tous',
      tabFav:'Favoris',
      tabPortfolio:'Portefeuille',
      searchPlaceholder:'Rechercher... (AAPL)',
      showHidden:'Afficher masqués',
      live:'En direct',
      disconnected:'Déconnecté',
      lastUpdate:'Dernière',
      colSymbol:'Symbole',
      colPrice:'Prix ($)',
      colChange:'Var.',
      colActions:'Actions',
      noResult:'Aucun résultat',
      loading:'Chargement...',
      noKey:'FINNHUB_API_KEY non configurée',
      editTitle:'Modifier',
      addTitle:'Ajouter une action',
      lblSymbol:'Symbole',
      lblAmount:'Quantité',
      lblBuyPrice:'Prix d\'achat ($)',
      btnSave:'Enregistrer',
      btnAdd:'Ajouter',
      btnCancel:'Annuler',
      usdBalance:'Solde USD',
      totalCost:'Coût total',
      currentValue:'Valeur actuelle',
      pnl:'Gain / Perte',
      colStock:'Action',
      colAmount:'Qté',
      colBuy:'Achat',
      colCurrent:'Actuel',
      colValue:'Valeur',
      colPnl:'G/P',
      emptyPortfolio:'Ajoutez des actions à votre portefeuille',
      favTooltip:'Favori',
      hideTooltip:'Masquer',
      editTooltip:'Modifier',
      deleteTooltip:'Supprimer',
      marketOpen:'Marché ouvert',
      marketClosed:'Marché fermé',
      preMarket:'Pré-ouverture',
      postMarket:'Après-bourse',
      high:'Haut',
      low:'Bas',
      prevClose:'Clôt. préc.'
    },
    es: {
      title:'Stock Tracker',
      tabAll:'Todos',
      tabFav:'Favoritos',
      tabPortfolio:'Portafolio',
      searchPlaceholder:'Buscar acción... (AAPL)',
      showHidden:'Mostrar ocultos',
      live:'En vivo',
      disconnected:'Desconectado',
      lastUpdate:'Última',
      colSymbol:'Símbolo',
      colPrice:'Precio ($)',
      colChange:'Cambio',
      colActions:'Acciones',
      noResult:'Sin resultados',
      loading:'Cargando datos...',
      noKey:'FINNHUB_API_KEY no configurada',
      editTitle:'Editar',
      addTitle:'Agregar acción',
      lblSymbol:'Símbolo',
      lblAmount:'Cantidad',
      lblBuyPrice:'Precio de compra ($)',
      btnSave:'Guardar',
      btnAdd:'Agregar',
      btnCancel:'Cancelar',
      usdBalance:'Saldo USD',
      totalCost:'Costo total',
      currentValue:'Valor actual',
      pnl:'Ganancia / Pérdida',
      colStock:'Acción',
      colAmount:'Cant.',
      colBuy:'Compra',
      colCurrent:'Actual',
      colValue:'Valor',
      colPnl:'G/P',
      emptyPortfolio:'Agregue acciones a su portafolio',
      favTooltip:'Favorito',
      hideTooltip:'Ocultar',
      editTooltip:'Editar',
      deleteTooltip:'Eliminar',
      marketOpen:'Mercado abierto',
      marketClosed:'Mercado cerrado',
      preMarket:'Pre-apertura',
      postMarket:'Post-cierre',
      high:'Máximo',
      low:'Mínimo',
      prevClose:'Cierre ant.'
    },
    ru: {
      title:'Stock Tracker',
      tabAll:'Все',
      tabFav:'Избранное',
      tabPortfolio:'Портфель',
      searchPlaceholder:'Поиск акции... (AAPL)',
      showHidden:'Показать скрытые',
      live:'Онлайн',
      disconnected:'Отключено',
      lastUpdate:'Послед.',
      colSymbol:'Символ',
      colPrice:'Цена ($)',
      colChange:'Изм.',
      colActions:'Действия',
      noResult:'Ничего не найдено',
      loading:'Загрузка данных...',
      noKey:'FINNHUB_API_KEY не задан',
      editTitle:'Редактировать',
      addTitle:'Добавить акцию',
      lblSymbol:'Символ',
      lblAmount:'Кол-во',
      lblBuyPrice:'Цена покупки ($)',
      btnSave:'Сохранить',
      btnAdd:'Добавить',
      btnCancel:'Отмена',
      usdBalance:'Баланс USD',
      totalCost:'Общая стоимость',
      currentValue:'Текущая стоимость',
      pnl:'Прибыль / Убыток',
      colStock:'Акция',
      colAmount:'Кол-во',
      colBuy:'Покупка',
      colCurrent:'Текущая',
      colValue:'Стоимость',
      colPnl:'П/У',
      emptyPortfolio:'Добавьте акции в свой портфель',
      favTooltip:'Избранное',
      hideTooltip:'Скрыть',
      editTooltip:'Редактировать',
      deleteTooltip:'Удалить',
      marketOpen:'Рынок открыт',
      marketClosed:'Рынок закрыт',
      preMarket:'Премаркет',
      postMarket:'Постмаркет',
      high:'Макс.',
      low:'Мин.',
      prevClose:'Пред. закр.'
    },
    zh: {
      title:'股票追踪',
      tabAll:'全部',
      tabFav:'收藏',
      tabPortfolio:'投资组合',
      searchPlaceholder:'搜索股票...',
      showHidden:'显示隐藏',
      live:'实时',
      disconnected:'已断开',
      lastUpdate:'最后更新',
      colSymbol:'代码',
      colPrice:'价格',
      colChange:'涨跌',
      colActions:'操作',
      noResult:'无结果',
      loading:'加载中',
      noKey:'无API密钥',
      editTitle:'编辑',
      addTitle:'添加',
      lblSymbol:'代码',
      lblAmount:'数量',
      lblBuyPrice:'买入价',
      btnSave:'保存',
      btnAdd:'添加',
      btnCancel:'取消',
      usdBalance:'美元余额',
      totalCost:'总成本',
      currentValue:'当前价值',
      pnl:'盈亏',
      colStock:'股票',
      colAmount:'数量',
      colBuy:'买入价',
      colCurrent:'当前价',
      colValue:'价值',
      colPnl:'盈亏',
      emptyPortfolio:'投资组合为空',
      favTooltip:'收藏',
      hideTooltip:'隐藏',
      editTooltip:'编辑',
      deleteTooltip:'删除',
      marketOpen:'开盘',
      marketClosed:'收盘',
      preMarket:'盘前',
      postMarket:'盘后',
      high:'最高',
      low:'最低',
      prevClose:'前收盘价'
    },
    ja: {
      title:'株式トラッカー',
      tabAll:'すべて',
      tabFav:'お気に入り',
      tabPortfolio:'ポートフォリオ',
      searchPlaceholder:'銘柄を検索...',
      showHidden:'非表示を表示',
      live:'リアルタイム',
      disconnected:'切断',
      lastUpdate:'最終更新',
      colSymbol:'シンボル',
      colPrice:'株価',
      colChange:'変動',
      colActions:'操作',
      noResult:'結果なし',
      loading:'読込中',
      noKey:'APIキーなし',
      editTitle:'編集',
      addTitle:'追加',
      lblSymbol:'シンボル',
      lblAmount:'数量',
      lblBuyPrice:'購入価格',
      btnSave:'保存',
      btnAdd:'追加',
      btnCancel:'キャンセル',
      usdBalance:'USD残高',
      totalCost:'総コスト',
      currentValue:'現在価値',
      pnl:'損益',
      colStock:'銘柄',
      colAmount:'数量',
      colBuy:'購入価格',
      colCurrent:'現在価格',
      colValue:'価値',
      colPnl:'損益',
      emptyPortfolio:'ポートフォリオは空です',
      favTooltip:'お気に入り',
      hideTooltip:'非表示',
      editTooltip:'編集',
      deleteTooltip:'削除',
      marketOpen:'取引中',
      marketClosed:'取引終了',
      preMarket:'プレマーケット',
      postMarket:'アフターマーケット',
      high:'高値',
      low:'安値',
      prevClose:'前日終値'
    },
    it: {
      title:'Tracker Azioni',
      tabAll:'Tutte',
      tabFav:'Preferite',
      tabPortfolio:'Portafoglio',
      searchPlaceholder:'Cerca azione...',
      showHidden:'Mostra nascoste',
      live:'In tempo reale',
      disconnected:'Disconnesso',
      lastUpdate:'Ultimo aggiornamento',
      colSymbol:'Simbolo',
      colPrice:'Prezzo',
      colChange:'Variazione',
      colActions:'Azioni',
      noResult:'Nessun risultato',
      loading:'Caricamento',
      noKey:'Nessuna chiave API',
      editTitle:'Modifica',
      addTitle:'Aggiungi',
      lblSymbol:'Simbolo',
      lblAmount:'Quantità',
      lblBuyPrice:'Prezzo acquisto',
      btnSave:'Salva',
      btnAdd:'Aggiungi',
      btnCancel:'Annulla',
      usdBalance:'Saldo USD',
      totalCost:'Costo totale',
      currentValue:'Valore attuale',
      pnl:'P/L',
      colStock:'Azione',
      colAmount:'Quantità',
      colBuy:'Acquisto',
      colCurrent:'Attuale',
      colValue:'Valore',
      colPnl:'P/L',
      emptyPortfolio:'Portafoglio vuoto',
      favTooltip:'Preferita',
      hideTooltip:'Nascondi',
      editTooltip:'Modifica',
      deleteTooltip:'Elimina',
      marketOpen:'Mercato aperto',
      marketClosed:'Mercato chiuso',
      preMarket:'Pre-mercato',
      postMarket:'Post-mercato',
      high:'Massimo',
      low:'Minimo',
      prevClose:'Chiusura precedente'
    },
    ar: {
      title:'متتبع الأسهم',
      tabAll:'الكل',
      tabFav:'المفضلة',
      tabPortfolio:'المحفظة',
      searchPlaceholder:'بحث عن سهم... (AAPL)',
      showHidden:'إظهار المخفية',
      live:'مباشر',
      disconnected:'غير متصل',
      lastUpdate:'آخر تحديث',
      colSymbol:'الرمز',
      colPrice:'السعر ($)',
      colChange:'التغيير',
      colActions:'إجراءات',
      noResult:'لا نتائج',
      loading:'جارٍ تحميل البيانات...',
      noKey:'لم يتم تعيين FINNHUB_API_KEY',
      editTitle:'تعديل',
      addTitle:'إضافة سهم',
      lblSymbol:'الرمز',
      lblAmount:'الكمية',
      lblBuyPrice:'سعر الشراء ($)',
      btnSave:'حفظ',
      btnAdd:'إضافة',
      btnCancel:'إلغاء',
      usdBalance:'رصيد USD',
      totalCost:'التكلفة الإجمالية',
      currentValue:'القيمة الحالية',
      pnl:'الربح / الخسارة',
      colStock:'السهم',
      colAmount:'الكمية',
      colBuy:'الشراء',
      colCurrent:'الحالي',
      colValue:'القيمة',
      colPnl:'ر/خ',
      emptyPortfolio:'أضف أسهماً إلى محفظتك',
      favTooltip:'مفضلة',
      hideTooltip:'إخفاء',
      editTooltip:'تعديل',
      deleteTooltip:'حذف',
      marketOpen:'السوق مفتوح',
      marketClosed:'السوق مغلق',
      preMarket:'ما قبل السوق',
      postMarket:'ما بعد السوق',
      high:'أعلى',
      low:'أدنى',
      prevClose:'الإغلاق السابق'
    },
    ko: {
      title:'주식 트래커',
      tabAll:'전체',
      tabFav:'즐겨찾기',
      tabPortfolio:'포트폴리오',
      searchPlaceholder:'종목 검색... (AAPL)',
      showHidden:'숨김 표시',
      live:'실시간',
      disconnected:'연결 끊김',
      lastUpdate:'최근',
      colSymbol:'종목',
      colPrice:'가격 ($)',
      colChange:'변동',
      colActions:'작업',
      noResult:'결과 없음',
      loading:'데이터 로딩 중...',
      noKey:'FINNHUB_API_KEY 미설정',
      editTitle:'편집',
      addTitle:'종목 추가',
      lblSymbol:'종목',
      lblAmount:'수량',
      lblBuyPrice:'매수가 ($)',
      btnSave:'저장',
      btnAdd:'추가',
      btnCancel:'취소',
      usdBalance:'USD 잔액',
      totalCost:'총 비용',
      currentValue:'현재 가치',
      pnl:'손익',
      colStock:'종목',
      colAmount:'수량',
      colBuy:'매수가',
      colCurrent:'현재가',
      colValue:'가치',
      colPnl:'손익',
      emptyPortfolio:'포트폴리오에 종목을 추가하세요',
      favTooltip:'즐겨찾기',
      hideTooltip:'숨기기',
      editTooltip:'편집',
      deleteTooltip:'삭제',
      marketOpen:'장 열림',
      marketClosed:'장 마감',
      preMarket:'프리마켓',
      postMarket:'애프터마켓',
      high:'고가',
      low:'저가',
      prevClose:'전일 종가'
    },
    hi: {
      title:'स्टॉक ट्रैकर',
      tabAll:'सभी',
      tabFav:'पसंदीदा',
      tabPortfolio:'पोर्टफोलियो',
      searchPlaceholder:'स्टॉक खोजें... (AAPL)',
      showHidden:'छिपे दिखाएं',
      live:'लाइव',
      disconnected:'डिस्कनेक्ट',
      lastUpdate:'अंतिम',
      colSymbol:'प्रतीक',
      colPrice:'मूल्य ($)',
      colChange:'परिवर्तन',
      colActions:'कार्य',
      noResult:'कोई परिणाम नहीं',
      loading:'डेटा लोड हो रहा है...',
      noKey:'FINNHUB_API_KEY सेट नहीं है',
      editTitle:'संपादित करें',
      addTitle:'स्टॉक जोड़ें',
      lblSymbol:'प्रतीक',
      lblAmount:'मात्रा',
      lblBuyPrice:'खरीद मूल्य ($)',
      btnSave:'सहेजें',
      btnAdd:'जोड़ें',
      btnCancel:'रद्द करें',
      usdBalance:'USD शेष',
      totalCost:'कुल लागत',
      currentValue:'वर्तमान मूल्य',
      pnl:'लाभ / हानि',
      colStock:'स्टॉक',
      colAmount:'मात्रा',
      colBuy:'खरीद',
      colCurrent:'वर्तमान',
      colValue:'मूल्य',
      colPnl:'ला/हा',
      emptyPortfolio:'अपने पोर्टफोलियो में स्टॉक जोड़ें',
      favTooltip:'पसंदीदा',
      hideTooltip:'छिपाएं',
      editTooltip:'संपादित करें',
      deleteTooltip:'हटाएं',
      marketOpen:'बाज़ार खुला',
      marketClosed:'बाज़ार बंद',
      preMarket:'प्री-मार्केट',
      postMarket:'पोस्ट-मार्केट',
      high:'उच्च',
      low:'निम्न',
      prevClose:'पिछला बंद'
    },
    pt: {
      title:'Rastreador de Ações',
      tabAll:'Todas',
      tabFav:'Favoritas',
      tabPortfolio:'Portfólio',
      searchPlaceholder:'Buscar ação... (AAPL)',
      showHidden:'Mostrar ocultas',
      live:'Ao vivo',
      disconnected:'Desconectado',
      lastUpdate:'Última',
      colSymbol:'Símbolo',
      colPrice:'Preço ($)',
      colChange:'Variação',
      colActions:'Ações',
      noResult:'Sem resultados',
      loading:'Carregando dados...',
      noKey:'FINNHUB_API_KEY não configurada',
      editTitle:'Editar',
      addTitle:'Adicionar Ação',
      lblSymbol:'Símbolo',
      lblAmount:'Quantidade',
      lblBuyPrice:'Preço de compra ($)',
      btnSave:'Salvar',
      btnAdd:'Adicionar',
      btnCancel:'Cancelar',
      usdBalance:'Saldo USD',
      totalCost:'Custo total',
      currentValue:'Valor atual',
      pnl:'Lucro / Prejuízo',
      colStock:'Ação',
      colAmount:'Qtd.',
      colBuy:'Compra',
      colCurrent:'Atual',
      colValue:'Valor',
      colPnl:'L/P',
      emptyPortfolio:'Adicione ações ao seu portfólio',
      favTooltip:'Favorita',
      hideTooltip:'Ocultar',
      editTooltip:'Editar',
      deleteTooltip:'Excluir',
      marketOpen:'Mercado aberto',
      marketClosed:'Mercado fechado',
      preMarket:'Pré-mercado',
      postMarket:'Pós-mercado',
      high:'Máxima',
      low:'Mínima',
      prevClose:'Fech. anterior'
    }
  };

  function getLocale() {
    try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; }
  }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      const allStocks = ref([]);
      const favorites = ref(['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN']);
      const hidden = ref([]);
      const search = ref('');
      const tab = ref('all');
      const showHidden = ref(false);
      const connected = ref(false);
      const lastUpdate = ref('');
      const marketStatus = reactive({ isOpen: false, session: null, holiday: null });
      let ws = null;
      let prevPrices = {};

      // Portfolio state
      const portfolio = ref([]);
      const pfForm = reactive({ symbol: '', amount: '', buyPrice: '' });
      const pfEdit = ref(-1);
      const usdBalance = ref(0);
      const editingUsd = ref(false);
      const usdDraft = ref('');
      const usdInput = ref(null);

      // Search suggestions
      const searchResults = ref([]);
      let searchTimeout = null;

      // WebSocket
      function connectWS() {
        const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
        ws = new WebSocket(proto + '//' + location.host + '/ws');

        ws.onopen = () => {
          connected.value = true;
          ws.send(JSON.stringify({ type: 'stock-subscribe' }));
        };

        ws.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data);
            if (msg.type === 'stock-prices' && Array.isArray(msg.data)) {
              const updated = msg.data.map(s => {
                const prev = prevPrices[s.symbol];
                let dir = '';
                if (prev !== undefined) {
                  if (s.price > prev) dir = 'up';
                  else if (s.price < prev) dir = 'down';
                }
                prevPrices[s.symbol] = s.price;
                return { ...s, dir };
              });
              allStocks.value = updated;
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

      // Market status
      async function fetchMarketStatus() {
        try {
          const res = await fetch('/api/stocks/market-status');
          if (res.ok) {
            const data = await res.json();
            marketStatus.isOpen = data.isOpen;
            marketStatus.session = data.session;
            marketStatus.holiday = data.holiday;
          }
        } catch {}
      }

      // Load prefs
      async function loadPrefs() {
        try {
          const res = await fetch('/api/stocks/favorites');
          if (res.ok) {
            const data = await res.json();
            favorites.value = data.favorites || [];
            hidden.value = data.hidden || [];
            portfolio.value = data.portfolio || [];
            usdBalance.value = data.usdBalance || 0;
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
          await fetch('/api/stocks/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ favorites: favorites.value, hidden: hidden.value, portfolio: portfolio.value, usdBalance: usdBalance.value, ...(extra || {}) })
          });
        } catch {}
      }

      // Search stocks via Finnhub
      async function doSearch(q) {
        if (!q || q.length < 1) { searchResults.value = []; return; }
        try {
          const res = await fetch('/api/stocks/search?q=' + encodeURIComponent(q));
          if (res.ok) { searchResults.value = await res.json(); }
        } catch {}
      }

      watch(search, (val) => {
        clearTimeout(searchTimeout);
        if (!val || val.length < 1) { searchResults.value = []; return; }
        searchTimeout = setTimeout(() => doSearch(val), 300);
      });

      // Computed lists
      const filteredStocks = computed(() => {
        let list = allStocks.value;
        if (!showHidden.value) list = list.filter(s => !hidden.value.includes(s.symbol));
        if (search.value) {
          const q = search.value.toUpperCase();
          list = list.filter(s => s.symbol.includes(q));
        }
        return list;
      });

      const favStocks = computed(() => {
        return allStocks.value.filter(s => favorites.value.includes(s.symbol));
      });

      const displayStocks = computed(() => {
        if (tab.value === 'fav') return favStocks.value;
        return filteredStocks.value;
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
        if (typeof p !== 'number' || isNaN(p)) return '—';
        return p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }

      function formatChange(s) {
        if (!s || typeof s.change !== 'number') return '';
        const sign = s.change >= 0 ? '+' : '';
        return sign + s.change.toFixed(2) + ' (' + sign + (s.changePercent || 0).toFixed(2) + '%)';
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

      // Portfolio helpers
      function getPrice(sym) {
        const s = allStocks.value.find(x => x.symbol === sym.toUpperCase());
        return s ? s.price : 0;
      }

      const portfolioRows = computed(() => {
        const rows = portfolio.value.map((p, i) => {
          const cur = getPrice(p.symbol);
          const cost = p.amount * p.buyPrice;
          const val = p.amount * cur;
          const pnl = val - cost;
          const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
          return { ...p, idx: i, curPrice: cur, cost, val, pnl, pnlPct, isUsd: false };
        });
        if (usdBalance.value > 0) {
          const amt = usdBalance.value;
          rows.push({ symbol: 'USD', amount: amt, buyPrice: 1, idx: -1, curPrice: 1, cost: amt, val: amt, pnl: 0, pnlPct: 0, isUsd: true });
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

      function startEditUsd() {
        usdDraft.value = usdBalance.value > 0 ? String(usdBalance.value) : '';
        editingUsd.value = true;
        Vue.nextTick(() => { if (usdInput.value) usdInput.value.focus(); });
      }

      function saveUsd() {
        const v = parseLocaleNumber(usdDraft.value);
        usdBalance.value = isNaN(v) || v < 0 ? 0 : v;
        editingUsd.value = false;
        savePrefs();
      }

      function cancelEditUsd() {
        editingUsd.value = false;
      }

      function addPortfolioEntry() {
        const sym = pfForm.symbol.toUpperCase().trim();
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

      // Autocomplete for symbol input (from API search)
      const symbolSuggestions = computed(() => {
        if (!pfForm.symbol || pfForm.symbol.length < 1) return [];
        const q = pfForm.symbol.toUpperCase();
        // First: from already loaded stocks
        const fromLoaded = allStocks.value
          .filter(s => s.symbol.startsWith(q))
          .slice(0, 6)
          .map(s => ({ symbol: s.symbol, description: '' }));
        // Merge with API search results
        const fromApi = searchResults.value.filter(r => r.symbol.startsWith(q)).slice(0, 6);
        const seen = new Set(fromLoaded.map(s => s.symbol));
        const merged = [...fromLoaded];
        for (const r of fromApi) {
          if (!seen.has(r.symbol)) { merged.push(r); seen.add(r.symbol); }
        }
        return merged.slice(0, 8);
      });

      function pickSymbol(s) {
        pfForm.symbol = s;
        searchResults.value = [];
      }

      // Market status label
      const marketLabel = computed(() => {
        if (!marketStatus.session && !marketStatus.isOpen) return L('marketClosed');
        if (marketStatus.session === 'pre-market') return L('preMarket');
        if (marketStatus.session === 'post-market') return L('postMarket');
        if (marketStatus.isOpen) return L('marketOpen');
        return L('marketClosed');
      });

      const marketClass = computed(() => {
        if (marketStatus.isOpen) return 'st-market-open';
        return 'st-market-closed';
      });

      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }
      let marketTimer = null;

      onMounted(() => {
        loadPrefs();
        connectWS();
        fetchMarketStatus();
        window.addEventListener('locale-changed', onLocaleChanged);
        marketTimer = setInterval(fetchMarketStatus, 60000);
      });

      onUnmounted(() => {
        if (ws) {
          ws.onclose = null;
          ws.close();
        }
        window.removeEventListener('locale-changed', onLocaleChanged);
        if (marketTimer) clearInterval(marketTimer);
      });

      return {
        L,
        allStocks, favorites, hidden, search, tab, showHidden,
        connected, lastUpdate, filteredStocks, favStocks, displayStocks,
        isFav, isHidden, toggleFav, toggleHidden, formatPrice, formatChange,
        portfolio, pfForm, pfEdit, portfolioRows, portfolioTotal,
        addPortfolioEntry, editPortfolioEntry, removePortfolioEntry, cancelEdit,
        symbolSuggestions, pickSymbol, searchResults, usdBalance,
        editingUsd, usdDraft, usdInput, startEditUsd, saveUsd, cancelEditUsd,
        marketStatus, marketLabel, marketClass
      };
    }
  };
})(Vue);
