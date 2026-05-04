(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, watch } = Vue;

  const LANGS = {
    tr: {
      title:'Google Trends',
      trending:'Gündem',
      search:'Arama Trendi',
      realtime:'Gerçek Zamanlı',
      daily:'Günlük Trendler',
      searchPlaceholder:'Anahtar kelime ara...',
      compare:'Karşılaştır',
      comparePlaceholder:'Terim ekle (Enter)...',
      period:'Dönem',
      lastHour:'Son 1 saat',
      last4h:'Son 4 saat',
      lastDay:'Son 24 saat',
      last7d:'Son 7 gün',
      last30d:'Son 30 gün',
      last90d:'Son 90 gün',
      last12m:'Son 12 ay',
      last5y:'Son 5 yıl',
      country:'Ülke',
      worldwide:'Dünya Geneli',
      category:'Kategori',
      allCategories:'Tüm Kategoriler',
      business:'İş',
      entertainment:'Eğlence',
      health:'Sağlık',
      sciTech:'Bilim/Teknoloji',
      sports:'Spor',
      topStories:'En Popüler',
      loading:'Yükleniyor...',
      noResults:'Sonuç bulunamadı',
      interestOverTime:'Zaman İçinde İlgi',
      relatedQueries:'İlişkili Sorgular',
      relatedTopics:'İlişkili Konular',
      rising:'Yükselen',
      top:'En Popüler',
      searchVolume:'Arama Hacmi',
      trendScore:'Trend Skoru',
      removeAll:'Tümünü Temizle',
      addToCompare:'Karşılaştırmaya Ekle',
      error:'Veri alınamadı',
      retry:'Tekrar Dene',
      traffic:'arama',
      regionInterest:'Bölgesel İlgi',
      moreOn:'Daha fazla bilgi',
      breakout:'Patlama',
      explore:'Keşfet'
    },
    en: {
      title:'Google Trends',
      trending:'Trending',
      search:'Search Trend',
      realtime:'Real-time',
      daily:'Daily Trends',
      searchPlaceholder:'Search keyword...',
      compare:'Compare',
      comparePlaceholder:'Add term (Enter)...',
      period:'Period',
      lastHour:'Past hour',
      last4h:'Past 4 hours',
      lastDay:'Past 24 hours',
      last7d:'Past 7 days',
      last30d:'Past 30 days',
      last90d:'Past 90 days',
      last12m:'Past 12 months',
      last5y:'Past 5 years',
      country:'Country',
      worldwide:'Worldwide',
      category:'Category',
      allCategories:'All Categories',
      business:'Business',
      entertainment:'Entertainment',
      health:'Health',
      sciTech:'Sci/Tech',
      sports:'Sports',
      topStories:'Top Stories',
      loading:'Loading...',
      noResults:'No results found',
      interestOverTime:'Interest Over Time',
      relatedQueries:'Related Queries',
      relatedTopics:'Related Topics',
      rising:'Rising',
      top:'Top',
      searchVolume:'Search Volume',
      trendScore:'Trend Score',
      removeAll:'Clear All',
      addToCompare:'Add to Compare',
      error:'Could not fetch data',
      retry:'Retry',
      traffic:'searches',
      regionInterest:'Interest by Region',
      moreOn:'More info',
      breakout:'Breakout',
      explore:'Explore'
    },
    de: {
      title:'Google Trends',
      trending:'Im Trend',
      search:'Suchtrend',
      realtime:'Echtzeit',
      daily:'Tägliche Trends',
      searchPlaceholder:'Stichwort suchen...',
      compare:'Vergleichen',
      comparePlaceholder:'Begriff hinzufügen (Enter)...',
      period:'Zeitraum',
      lastHour:'Letzte Stunde',
      last4h:'Letzte 4 Stunden',
      lastDay:'Letzte 24 Stunden',
      last7d:'Letzte 7 Tage',
      last30d:'Letzte 30 Tage',
      last90d:'Letzte 90 Tage',
      last12m:'Letzte 12 Monate',
      last5y:'Letzte 5 Jahre',
      country:'Land',
      worldwide:'Weltweit',
      category:'Kategorie',
      allCategories:'Alle Kategorien',
      business:'Wirtschaft',
      entertainment:'Unterhaltung',
      health:'Gesundheit',
      sciTech:'Wissenschaft/Technik',
      sports:'Sport',
      topStories:'Top-Meldungen',
      loading:'Laden...',
      noResults:'Keine Ergebnisse gefunden',
      interestOverTime:'Interesse im Zeitverlauf',
      relatedQueries:'Ähnliche Suchanfragen',
      relatedTopics:'Ähnliche Themen',
      rising:'Steigend',
      top:'Top',
      searchVolume:'Suchvolumen',
      trendScore:'Trend-Wert',
      removeAll:'Alle löschen',
      addToCompare:'Zum Vergleich hinzufügen',
      error:'Daten konnten nicht abgerufen werden',
      retry:'Wiederholen',
      traffic:'Suchanfragen',
      regionInterest:'Regionales Interesse',
      moreOn:'Mehr Infos',
      breakout:'Ausbruch',
      explore:'Erkunden'
    },
    fr: {
      title:'Google Trends',
      trending:'Tendances',
      search:'Tendance de recherche',
      realtime:'Temps réel',
      daily:'Tendances quotidiennes',
      searchPlaceholder:'Rechercher un mot-clé...',
      compare:'Comparer',
      comparePlaceholder:'Ajouter un terme (Entrée)...',
      period:'Période',
      lastHour:'Dernière heure',
      last4h:'4 dernières heures',
      lastDay:'24 dernières heures',
      last7d:'7 derniers jours',
      last30d:'30 derniers jours',
      last90d:'90 derniers jours',
      last12m:'12 derniers mois',
      last5y:'5 dernières années',
      country:'Pays',
      worldwide:'Monde entier',
      category:'Catégorie',
      allCategories:'Toutes les catégories',
      business:'Affaires',
      entertainment:'Divertissement',
      health:'Santé',
      sciTech:'Sciences/Tech',
      sports:'Sports',
      topStories:'À la une',
      loading:'Chargement...',
      noResults:'Aucun résultat trouvé',
      interestOverTime:'Intérêt dans le temps',
      relatedQueries:'Requêtes associées',
      relatedTopics:'Sujets associés',
      rising:'En hausse',
      top:'Top',
      searchVolume:'Volume de recherche',
      trendScore:'Score de tendance',
      removeAll:'Tout effacer',
      addToCompare:'Ajouter à la comparaison',
      error:'Impossible de récupérer les données',
      retry:'Réessayer',
      traffic:'recherches',
      regionInterest:'Intérêt par région',
      moreOn:'Plus d\'infos',
      breakout:'Explosion',
      explore:'Explorer'
    },
    es: {
      title:'Google Trends',
      trending:'Tendencias',
      search:'Tendencia de búsqueda',
      realtime:'Tiempo real',
      daily:'Tendencias diarias',
      searchPlaceholder:'Buscar palabra clave...',
      compare:'Comparar',
      comparePlaceholder:'Agregar término (Enter)...',
      period:'Período',
      lastHour:'Última hora',
      last4h:'Últimas 4 horas',
      lastDay:'Últimas 24 horas',
      last7d:'Últimos 7 días',
      last30d:'Últimos 30 días',
      last90d:'Últimos 90 días',
      last12m:'Últimos 12 meses',
      last5y:'Últimos 5 años',
      country:'País',
      worldwide:'Mundial',
      category:'Categoría',
      allCategories:'Todas las categorías',
      business:'Negocios',
      entertainment:'Entretenimiento',
      health:'Salud',
      sciTech:'Ciencia/Tec',
      sports:'Deportes',
      topStories:'Más populares',
      loading:'Cargando...',
      noResults:'No se encontraron resultados',
      interestOverTime:'Interés a lo largo del tiempo',
      relatedQueries:'Consultas relacionadas',
      relatedTopics:'Temas relacionados',
      rising:'En aumento',
      top:'Top',
      searchVolume:'Volumen de búsqueda',
      trendScore:'Puntuación de tendencia',
      removeAll:'Borrar todo',
      addToCompare:'Añadir a comparación',
      error:'No se pudieron obtener los datos',
      retry:'Reintentar',
      traffic:'búsquedas',
      regionInterest:'Interés por región',
      moreOn:'Más información',
      breakout:'Explosión',
      explore:'Explorar'
    },
    ru: {
      title:'Google Trends',
      trending:'В тренде',
      search:'Поисковый тренд',
      realtime:'В реальном времени',
      daily:'Ежедневные тренды',
      searchPlaceholder:'Поиск ключевого слова...',
      compare:'Сравнить',
      comparePlaceholder:'Добавить термин (Enter)...',
      period:'Период',
      lastHour:'Последний час',
      last4h:'Последние 4 часа',
      lastDay:'Последние 24 часа',
      last7d:'Последние 7 дней',
      last30d:'Последние 30 дней',
      last90d:'Последние 90 дней',
      last12m:'Последние 12 месяцев',
      last5y:'Последние 5 лет',
      country:'Страна',
      worldwide:'Весь мир',
      category:'Категория',
      allCategories:'Все категории',
      business:'Бизнес',
      entertainment:'Развлечения',
      health:'Здоровье',
      sciTech:'Наука/Технологии',
      sports:'Спорт',
      topStories:'Популярное',
      loading:'Загрузка...',
      noResults:'Результатов не найдено',
      interestOverTime:'Динамика интереса',
      relatedQueries:'Похожие запросы',
      relatedTopics:'Похожие темы',
      rising:'Растущие',
      top:'Топ',
      searchVolume:'Объём поиска',
      trendScore:'Рейтинг тренда',
      removeAll:'Очистить всё',
      addToCompare:'Добавить к сравнению',
      error:'Не удалось загрузить данные',
      retry:'Повторить',
      traffic:'поисков',
      regionInterest:'Интерес по регионам',
      moreOn:'Подробнее',
      breakout:'Взрыв',
      explore:'Исследовать'
    },
    zh: {
      title:'Google 趋势',
      trending:'热门',
      search:'搜索趋势',
      realtime:'实时',
      daily:'每日趋势',
      searchPlaceholder:'搜索关键词...',
      compare:'比较',
      comparePlaceholder:'添加词条(回车)...',
      period:'时间段',
      lastHour:'过去1小时',
      last4h:'过去4小时',
      lastDay:'过去24小时',
      last7d:'过去7天',
      last30d:'过去30天',
      last90d:'过去90天',
      last12m:'过去12个月',
      last5y:'过去5年',
      country:'国家',
      worldwide:'全球',
      category:'分类',
      allCategories:'所有分类',
      loading:'加载中...',
      noResults:'未找到结果',
      interestOverTime:'随时间变化的兴趣',
      relatedQueries:'相关查询',
      relatedTopics:'相关主题',
      rising:'上升',
      top:'热门',
      searchVolume:'搜索量',
      trendScore:'趋势分数',
      removeAll:'全部清除',
      addToCompare:'添加到比较',
      error:'无法获取数据',
      retry:'重试',
      traffic:'搜索',
      regionInterest:'区域兴趣',
      breakout:'爆发',
      explore:'探索',
      business:'商业',
      entertainment:'娱乐',
      health:'健康',
      sciTech:'科技',
      sports:'体育',
      topStories:'头条',
      moreOn:'更多'
    },
    ja: {
      title:'Google トレンド',
      trending:'トレンド',
      search:'検索トレンド',
      realtime:'リアルタイム',
      daily:'デイリートレンド',
      searchPlaceholder:'キーワードを検索...',
      compare:'比較',
      comparePlaceholder:'用語を追加(Enter)...',
      period:'期間',
      lastHour:'過去1時間',
      last4h:'過去4時間',
      lastDay:'過去24時間',
      last7d:'過去7日間',
      last30d:'過去30日間',
      last90d:'過去90日間',
      last12m:'過去12ヶ月',
      last5y:'過去5年間',
      country:'国',
      worldwide:'世界全体',
      category:'カテゴリー',
      allCategories:'すべてのカテゴリー',
      loading:'読み込み中...',
      noResults:'結果がありません',
      interestOverTime:'時系列での関心度',
      relatedQueries:'関連クエリ',
      relatedTopics:'関連トピック',
      rising:'急上昇',
      top:'トップ',
      searchVolume:'検索量',
      trendScore:'トレンドスコア',
      removeAll:'すべてクリア',
      addToCompare:'比較に追加',
      error:'データを取得できません',
      retry:'再試行',
      traffic:'検索',
      regionInterest:'地域別の関心',
      breakout:'急上昇',
      explore:'探索',
      business:'ビジネス',
      entertainment:'エンタメ',
      health:'健康',
      sciTech:'科学技術',
      sports:'スポーツ',
      topStories:'トップニュース',
      moreOn:'詳細'
    },
    it: {
      title:'Google Trends',
      trending:'Di tendenza',
      search:'Tendenza ricerca',
      realtime:'Tempo reale',
      daily:'Tendenze giornaliere',
      searchPlaceholder:'Cerca parola chiave...',
      compare:'Confronta',
      comparePlaceholder:'Aggiungi termine (Invio)...',
      period:'Periodo',
      lastHour:'Ultima ora',
      last4h:'Ultime 4 ore',
      lastDay:'Ultime 24 ore',
      last7d:'Ultimi 7 giorni',
      last30d:'Ultimi 30 giorni',
      last90d:'Ultimi 90 giorni',
      last12m:'Ultimi 12 mesi',
      last5y:'Ultimi 5 anni',
      country:'Paese',
      worldwide:'Mondiale',
      category:'Categoria',
      allCategories:'Tutte le categorie',
      loading:'Caricamento...',
      noResults:'Nessun risultato',
      interestOverTime:'Interesse nel tempo',
      relatedQueries:'Query correlate',
      relatedTopics:'Argomenti correlati',
      rising:'In crescita',
      top:'Top',
      searchVolume:'Volume di ricerca',
      trendScore:'Punteggio di tendenza',
      removeAll:'Cancella tutto',
      addToCompare:'Aggiungi al confronto',
      error:'Impossibile recuperare i dati',
      retry:'Riprova',
      traffic:'ricerche',
      regionInterest:'Interesse per regione',
      breakout:'Esplosione',
      explore:'Esplora',
      business:'Affari',
      entertainment:'Intrattenimento',
      health:'Salute',
      sciTech:'Scienza/Tech',
      sports:'Sport',
      topStories:'In evidenza',
      moreOn:'Approfondisci'
    },
    ar: {
      title:'اتجاهات جوجل',
      trending:'Trending',
      search:'Search Trend',
      realtime:'Real-time',
      daily:'يومي',
      searchPlaceholder:'Search keyword...',
      compare:'Compare',
      comparePlaceholder:'Add term (Enter)...',
      period:'المدة',
      lastHour:'Past hour',
      last4h:'Past 4 hours',
      lastDay:'Past 24 hours',
      last7d:'Past 7 days',
      last30d:'Past 30 days',
      last90d:'Past 90 days',
      last12m:'Past 12 months',
      last5y:'Past 5 years',
      country:'Country',
      worldwide:'Worldwide',
      category:'الفئة',
      allCategories:'All Categories',
      business:'Business',
      entertainment:'Entertainment',
      health:'الصحة',
      sciTech:'Sci/Tech',
      sports:'Sports',
      topStories:'Top Stories',
      loading:'جار التحميل...',
      noResults:'لا توجد نتائج',
      interestOverTime:'Interest Over Time',
      relatedQueries:'Related Queries',
      relatedTopics:'Related Topics',
      rising:'Rising',
      top:'Top',
      searchVolume:'Search Volume',
      trendScore:'Trend Score',
      removeAll:'Clear All',
      addToCompare:'Add to Compare',
      error:'Could not fetch data',
      retry:'إعادة المحاولة',
      traffic:'searches',
      regionInterest:'Interest by Region',
      moreOn:'More info',
      breakout:'Breakout',
      explore:'استكشاف'
    },
    ko: {
      title:'Google 트렌드',
      trending:'Trending',
      search:'Search Trend',
      realtime:'Real-time',
      daily:'매일',
      searchPlaceholder:'Search keyword...',
      compare:'Compare',
      comparePlaceholder:'Add term (Enter)...',
      period:'주기',
      lastHour:'Past hour',
      last4h:'Past 4 hours',
      lastDay:'Past 24 hours',
      last7d:'Past 7 days',
      last30d:'Past 30 days',
      last90d:'Past 90 days',
      last12m:'Past 12 months',
      last5y:'Past 5 years',
      country:'Country',
      worldwide:'Worldwide',
      category:'분류',
      allCategories:'All Categories',
      business:'Business',
      entertainment:'Entertainment',
      health:'건강',
      sciTech:'Sci/Tech',
      sports:'Sports',
      topStories:'Top Stories',
      loading:'로딩 중...',
      noResults:'결과 없음',
      interestOverTime:'Interest Over Time',
      relatedQueries:'Related Queries',
      relatedTopics:'Related Topics',
      rising:'Rising',
      top:'Top',
      searchVolume:'Search Volume',
      trendScore:'Trend Score',
      removeAll:'Clear All',
      addToCompare:'Add to Compare',
      error:'Could not fetch data',
      retry:'재시도',
      traffic:'searches',
      regionInterest:'Interest by Region',
      moreOn:'More info',
      breakout:'Breakout',
      explore:'탐색'
    },
    hi: {
      title:'Google Trends',
      trending:'Trending',
      search:'Search Trend',
      realtime:'Real-time',
      daily:'दैनिक',
      searchPlaceholder:'Search keyword...',
      compare:'Compare',
      comparePlaceholder:'Add term (Enter)...',
      period:'अवधि',
      lastHour:'Past hour',
      last4h:'Past 4 hours',
      lastDay:'Past 24 hours',
      last7d:'Past 7 days',
      last30d:'Past 30 days',
      last90d:'Past 90 days',
      last12m:'Past 12 months',
      last5y:'Past 5 years',
      country:'Country',
      worldwide:'Worldwide',
      category:'श्रेणी',
      allCategories:'All Categories',
      business:'Business',
      entertainment:'Entertainment',
      health:'स्वास्थ्य',
      sciTech:'Sci/Tech',
      sports:'Sports',
      topStories:'Top Stories',
      loading:'लोड हो रहा है...',
      noResults:'कोई परिणाम नहीं',
      interestOverTime:'Interest Over Time',
      relatedQueries:'Related Queries',
      relatedTopics:'Related Topics',
      rising:'Rising',
      top:'Top',
      searchVolume:'Search Volume',
      trendScore:'Trend Score',
      removeAll:'Clear All',
      addToCompare:'Add to Compare',
      error:'Could not fetch data',
      retry:'पुनः प्रयास',
      traffic:'searches',
      regionInterest:'Interest by Region',
      moreOn:'More info',
      breakout:'Breakout',
      explore:'एक्सप्लोर'
    },
    pt: {
      title:'Google Trends',
      trending:'Trending',
      search:'Search Trend',
      realtime:'Real-time',
      daily:'Diário',
      searchPlaceholder:'Search keyword...',
      compare:'Compare',
      comparePlaceholder:'Add term (Enter)...',
      period:'Período',
      lastHour:'Past hour',
      last4h:'Past 4 hours',
      lastDay:'Past 24 hours',
      last7d:'Past 7 days',
      last30d:'Past 30 days',
      last90d:'Past 90 days',
      last12m:'Past 12 months',
      last5y:'Past 5 years',
      country:'Country',
      worldwide:'Worldwide',
      category:'Categoria',
      allCategories:'All Categories',
      business:'Business',
      entertainment:'Entertainment',
      health:'Saúde',
      sciTech:'Sci/Tech',
      sports:'Sports',
      topStories:'Top Stories',
      loading:'Carregando...',
      noResults:'Nenhum resultado',
      interestOverTime:'Interest Over Time',
      relatedQueries:'Related Queries',
      relatedTopics:'Related Topics',
      rising:'Rising',
      top:'Top',
      searchVolume:'Search Volume',
      trendScore:'Trend Score',
      removeAll:'Clear All',
      addToCompare:'Add to Compare',
      error:'Could not fetch data',
      retry:'Tentar novamente',
      traffic:'searches',
      regionInterest:'Interest by Region',
      moreOn:'More info',
      breakout:'Breakout',
      explore:'Explorar'
    }
  };

  const COUNTRIES = [
    { code:'', name:'worldwide' },
    { code:'TR', name:'Türkiye' }, { code:'US', name:'United States' },
    { code:'GB', name:'United Kingdom' }, { code:'DE', name:'Deutschland' },
    { code:'FR', name:'France' }, { code:'ES', name:'España' },
    { code:'IT', name:'Italia' }, { code:'RU', name:'Россия' },
    { code:'JP', name:'日本' }, { code:'CN', name:'中国' },
    { code:'KR', name:'한국' }, { code:'BR', name:'Brasil' },
    { code:'IN', name:'India' }, { code:'AU', name:'Australia' },
    { code:'CA', name:'Canada' }, { code:'MX', name:'México' },
    { code:'NL', name:'Nederland' }, { code:'PL', name:'Polska' },
    { code:'SE', name:'Sverige' }, { code:'AR', name:'Argentina' },
    { code:'SA', name:'السعودية' }, { code:'EG', name:'مصر' },
    { code:'ID', name:'Indonesia' }, { code:'TH', name:'ไทย' },
    { code:'PH', name:'Philippines' }, { code:'NG', name:'Nigeria' }
  ];

  const PERIODS = [
    { value:'now 1-H', label:'lastHour' },
    { value:'now 4-H', label:'last4h' },
    { value:'now 1-d', label:'lastDay' },
    { value:'now 7-d', label:'last7d' },
    { value:'today 1-m', label:'last30d' },
    { value:'today 3-m', label:'last90d' },
    { value:'today 12-m', label:'last12m' },
    { value:'today 5-y', label:'last5y' }
  ];

  const CATEGORIES = [
    { id:'all', label:'allCategories' },
    { id:'b', label:'business' },
    { id:'e', label:'entertainment' },
    { id:'m', label:'health' },
    { id:'t', label:'sciTech' },
    { id:'s', label:'sports' },
    { id:'h', label:'topStories' }
  ];

  const CHART_COLORS = ['#4285F4','#EA4335','#FBBC04','#34A853','#FF6D01','#46BDC6','#7B1FA2','#E91E63'];

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      const tab = ref('trending');  // trending | search
      const country = ref('TR');
      const period = ref('today 12-m');
      const categoryFilter = ref('all');

      const trendItems = ref([]);
      const trendLoading = ref(false);
      const trendError = ref('');

      // Search / Compare
      const searchKeyword = ref('');
      const compareTerms = ref([]);
      const newTerm = ref('');
      const searchLoading = ref(false);
      const searchError = ref('');
      const searchData = ref(null);

      // Chart
      const chartCanvas = ref(null);
      let chartInstance = null;

      // Expanded trend item
      const expandedIdx = ref(-1);

      function toggleExpand(idx) {
        expandedIdx.value = expandedIdx.value === idx ? -1 : idx;
      }

      // ── Trending ──
      async function fetchTrending() {
        trendLoading.value = true;
        trendError.value = '';
        try {
          const geo = country.value || '';
          const cat = categoryFilter.value !== 'all' ? categoryFilter.value : '';
          const resp = await fetch(`/api/google-trends/trending?geo=${encodeURIComponent(geo)}&cat=${encodeURIComponent(cat)}`);
          if (!resp.ok) throw new Error('HTTP ' + resp.status);
          const data = await resp.json();
          trendItems.value = data.trends || [];
        } catch(e) {
          trendError.value = e.message;
          trendItems.value = [];
        } finally {
          trendLoading.value = false;
        }
      }

      // ── Search Interest ──
      async function fetchSearch() {
        const kw = searchKeyword.value.trim();
        if (!kw && compareTerms.value.length === 0) return;
        searchLoading.value = true;
        searchError.value = '';
        try {
          const terms = kw ? [kw, ...compareTerms.value] : [...compareTerms.value];
          const geo = country.value || '';
          const resp = await fetch(`/api/google-trends/interest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keywords: terms, geo, time: period.value })
          });
          if (!resp.ok) throw new Error('HTTP ' + resp.status);
          const data = await resp.json();
          searchData.value = data;
          Vue.nextTick(() => drawChart(data));
        } catch(e) {
          searchError.value = e.message;
          searchData.value = null;
        } finally {
          searchLoading.value = false;
        }
      }

      function doSearch() {
        if (searchKeyword.value.trim()) {
          fetchSearch();
        }
      }

      function addCompareTerm() {
        const t = newTerm.value.trim();
        if (t && compareTerms.value.length < 4 && !compareTerms.value.includes(t)) {
          compareTerms.value.push(t);
          newTerm.value = '';
          if (searchKeyword.value.trim()) fetchSearch();
        }
      }

      function removeTerm(idx) {
        compareTerms.value.splice(idx, 1);
        if (searchKeyword.value.trim() || compareTerms.value.length) fetchSearch();
      }

      function clearTerms() {
        compareTerms.value = [];
        searchData.value = null;
        destroyChart();
      }

      function addToCompare(keyword) {
        if (compareTerms.value.length < 4 && !compareTerms.value.includes(keyword)) {
          searchKeyword.value = searchKeyword.value || keyword;
          if (searchKeyword.value !== keyword) compareTerms.value.push(keyword);
          tab.value = 'search';
          fetchSearch();
        }
      }

      function openTrendsPage(query) {
        const geo = country.value ? `&geo=${country.value}` : '';
        const url = `https://trends.google.com/trends/explore?q=${encodeURIComponent(query)}${geo}`;
        window.open(url, '_blank');
      }

      // ── Chart ──
      function destroyChart() {
        if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
      }

      function drawChart(data) {
        destroyChart();
        const el = chartCanvas.value;
        if (!el || !data || !data.timeline) return;
        const ctx = el.getContext('2d');
        const W = el.parentElement.clientWidth - 8;
        const H = 200;
        el.width = W * (window.devicePixelRatio || 1);
        el.height = H * (window.devicePixelRatio || 1);
        el.style.width = W + 'px';
        el.style.height = H + 'px';
        ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

        const timeline = data.timeline;
        const keywords = data.keywords || [];
        if (!timeline.length) return;

        const padL = 40, padR = 16, padT = 16, padB = 28;
        const cW = W - padL - padR;
        const cH = H - padT - padB;

        // Find max
        let max = 0;
        timeline.forEach(pt => {
          pt.values.forEach(v => { if (v > max) max = v; });
        });
        if (max === 0) max = 100;

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
          const y = padT + (cH / 4) * i;
          ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,0.35)';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(Math.round(max - (max / 4) * i), padL - 6, y + 3);
        }

        // X labels
        const step = Math.max(1, Math.floor(timeline.length / 6));
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        for (let i = 0; i < timeline.length; i += step) {
          const x = padL + (i / (timeline.length - 1)) * cW;
          ctx.fillText(timeline[i].label || '', x, H - 6);
        }

        // Lines
        keywords.forEach((kw, ki) => {
          ctx.strokeStyle = CHART_COLORS[ki % CHART_COLORS.length];
          ctx.lineWidth = 2;
          ctx.beginPath();
          timeline.forEach((pt, pi) => {
            const x = padL + (pi / (timeline.length - 1)) * cW;
            const y = padT + cH - (pt.values[ki] / max) * cH;
            pi === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          });
          ctx.stroke();
        });

        chartInstance = { destroy() { ctx.clearRect(0,0,el.width,el.height); } };
      }

      function formatTraffic(val) {
        if (!val) return '';
        const n = parseInt(val.replace(/[^0-9]/g, ''));
        if (isNaN(n)) return val;
        if (n >= 1000000) return (n/1000000).toFixed(1) + 'M+';
        if (n >= 1000) return (n/1000).toFixed(0) + 'K+';
        return val;
      }

      // ── Lifecycle ──
      let localeHandler = null;
      onMounted(() => {
        fetchTrending();
        localeHandler = () => { locale.value = getLocale(); };
        window.addEventListener('locale-changed', localeHandler);
      });

      onUnmounted(() => {
        destroyChart();
        if (localeHandler) window.removeEventListener('locale-changed', localeHandler);
      });

      watch([country, categoryFilter], () => {
        if (tab.value === 'trending') fetchTrending();
      });

      watch(tab, (v) => {
        if (v === 'trending') fetchTrending();
      });

      watch([country, period], () => {
        if (tab.value === 'search' && (searchKeyword.value.trim() || compareTerms.value.length)) {
          fetchSearch();
        }
      });

      return {
        L, tab, country, period, categoryFilter,
        trendItems, trendLoading, trendError,
        searchKeyword, compareTerms, newTerm,
        searchLoading, searchError, searchData,
        chartCanvas, expandedIdx,
        COUNTRIES, PERIODS, CATEGORIES, CHART_COLORS,
        fetchTrending, doSearch, fetchSearch,
        addCompareTerm, removeTerm, clearTerms,
        addToCompare, openTrendsPage, toggleExpand,
        formatTraffic
      };
    }
  };
})(Vue);
