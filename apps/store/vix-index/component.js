(function(Vue) {
const { ref, computed, onMounted, onUnmounted, watch, nextTick } = Vue;

const LANGS = {
  tr: {
    title: 'VIX Endeksi',
    subtitle: 'Korku & Açgözlülük Göstergesi',
    current: 'Güncel VIX',
    open: 'Açılış',
    high: 'Yüksek',
    low: 'Düşük',
    prev: 'Önceki Kapanış',
    change: 'Değişim',
    lastUpdate: 'Son Güncelleme',
    fear: 'KORKU',
    greed: 'AÇGÖZLÜLÜK',
    extremeFear: 'Aşırı Korku',
    moderateFear: 'Orta Korku',
    lowFear: 'Düşük Korku',
    neutral: 'Nötr',
    lowGreed: 'Düşük Açgözlülük',
    moderateGreed: 'Orta Açgözlülük',
    extremeGreed: 'Aşırı Açgözlülük',
    history: 'Geçmiş (30 Gün)',
    loading: 'Yükleniyor...',
    error: 'Veri alınamadı',
    retry: 'Tekrar Dene',
    noData: 'Veri bulunamadı',
    apiKeyMissing: 'FRED API anahtarı gerekli',
    date: 'Tarih',
    value: 'Değer',
    zone: 'Bölge',
    weekAgo: '1 Hafta Önce',
    monthAgo: '1 Ay Önce',
    yearHigh: 'Yıllık Yüksek',
    yearLow: 'Yıllık Düşük',
    range30d: '30G',
    range90d: '90G',
    range1y: '1Y',
    range5y: '5Y'
  },
  en: {
    title: 'VIX Index',
    subtitle: 'Fear & Greed Indicator',
    current: 'Current VIX',
    open: 'Open',
    high: 'High',
    low: 'Low',
    prev: 'Previous Close',
    change: 'Change',
    lastUpdate: 'Last Update',
    fear: 'FEAR',
    greed: 'GREED',
    extremeFear: 'Extreme Fear',
    moderateFear: 'Moderate Fear',
    lowFear: 'Low Fear',
    neutral: 'Neutral',
    lowGreed: 'Low Greed',
    moderateGreed: 'Moderate Greed',
    extremeGreed: 'Extreme Greed',
    history: 'History (30 Days)',
    loading: 'Loading...',
    error: 'Failed to load data',
    retry: 'Retry',
    noData: 'No data found',
    apiKeyMissing: 'FRED API key required',
    date: 'Date',
    value: 'Value',
    zone: 'Zone',
    weekAgo: '1 Week Ago',
    monthAgo: '1 Month Ago',
    yearHigh: 'Year High',
    yearLow: 'Year Low',
    range30d: '30D',
    range90d: '90D',
    range1y: '1Y',
    range5y: '5Y'
  },
  de: {
    title: 'VIX-Index',
    subtitle: 'Angst- & Gier-Indikator',
    current: 'Aktueller VIX',
    open: 'Eröffnung',
    high: 'Hoch',
    low: 'Tief',
    prev: 'Vorheriger Schluss',
    change: 'Änderung',
    lastUpdate: 'Letzte Aktualisierung',
    fear: 'ANGST',
    greed: 'GIER',
    extremeFear: 'Extreme Angst',
    moderateFear: 'Mäßige Angst',
    lowFear: 'Geringe Angst',
    neutral: 'Neutral',
    lowGreed: 'Geringe Gier',
    moderateGreed: 'Mäßige Gier',
    extremeGreed: 'Extreme Gier',
    history: 'Verlauf (30 Tage)',
    loading: 'Laden...',
    error: 'Daten konnten nicht geladen werden',
    retry: 'Erneut versuchen',
    noData: 'Keine Daten gefunden',
    apiKeyMissing: 'FRED API-Schlüssel erforderlich',
    date: 'Datum',
    value: 'Wert',
    zone: 'Zone',
    weekAgo: 'Vor 1 Woche',
    monthAgo: 'Vor 1 Monat',
    yearHigh: 'Jahreshoch',
    yearLow: 'Jahrestief',
    range30d: '30T',
    range90d: '90T',
    range1y: '1J',
    range5y: '5J'
  },
  fr: {
    title: 'Indice VIX',
    subtitle: 'Indicateur de Peur & Avidité',
    current: 'VIX Actuel',
    open: 'Ouverture',
    high: 'Haut',
    low: 'Bas',
    prev: 'Clôture Précédente',
    change: 'Variation',
    lastUpdate: 'Dernière MAJ',
    fear: 'PEUR',
    greed: 'AVIDITÉ',
    extremeFear: 'Peur Extrême',
    moderateFear: 'Peur Modérée',
    lowFear: 'Faible Peur',
    neutral: 'Neutre',
    lowGreed: 'Faible Avidité',
    moderateGreed: 'Avidité Modérée',
    extremeGreed: 'Avidité Extrême',
    history: 'Historique (30 Jours)',
    loading: 'Chargement...',
    error: 'Échec du chargement',
    retry: 'Réessayer',
    noData: 'Aucune donnée',
    apiKeyMissing: 'Clé API FRED requise',
    date: 'Date',
    value: 'Valeur',
    zone: 'Zone',
    weekAgo: 'Il y a 1 semaine',
    monthAgo: 'Il y a 1 mois',
    yearHigh: 'Plus haut annuel',
    yearLow: 'Plus bas annuel',
    range30d: '30J',
    range90d: '90J',
    range1y: '1A',
    range5y: '5A'
  },
  es: {
    title: 'Índice VIX',
    subtitle: 'Indicador de Miedo y Codicia',
    current: 'VIX Actual',
    open: 'Apertura',
    high: 'Máximo',
    low: 'Mínimo',
    prev: 'Cierre Anterior',
    change: 'Cambio',
    lastUpdate: 'Última Actualización',
    fear: 'MIEDO',
    greed: 'CODICIA',
    extremeFear: 'Miedo Extremo',
    moderateFear: 'Miedo Moderado',
    lowFear: 'Miedo Bajo',
    neutral: 'Neutral',
    lowGreed: 'Codicia Baja',
    moderateGreed: 'Codicia Moderada',
    extremeGreed: 'Codicia Extrema',
    history: 'Historial (30 Días)',
    loading: 'Cargando...',
    error: 'Error al cargar datos',
    retry: 'Reintentar',
    noData: 'Sin datos',
    apiKeyMissing: 'Clave API FRED requerida',
    date: 'Fecha',
    value: 'Valor',
    zone: 'Zona',
    weekAgo: 'Hace 1 semana',
    monthAgo: 'Hace 1 mes',
    yearHigh: 'Máximo anual',
    yearLow: 'Mínimo anual',
    range30d: '30D',
    range90d: '90D',
    range1y: '1A',
    range5y: '5A'
  },
  ru: {
    title: 'Индекс VIX',
    subtitle: 'Индикатор Страха и Жадности',
    current: 'Текущий VIX',
    open: 'Открытие',
    high: 'Максимум',
    low: 'Минимум',
    prev: 'Предыдущее закрытие',
    change: 'Изменение',
    lastUpdate: 'Последнее обновление',
    fear: 'СТРАХ',
    greed: 'ЖАДНОСТЬ',
    extremeFear: 'Крайний страх',
    moderateFear: 'Умеренный страх',
    lowFear: 'Слабый страх',
    neutral: 'Нейтрально',
    lowGreed: 'Слабая жадность',
    moderateGreed: 'Умеренная жадность',
    extremeGreed: 'Крайняя жадность',
    history: 'История (30 дней)',
    loading: 'Загрузка...',
    error: 'Ошибка загрузки данных',
    retry: 'Повторить',
    noData: 'Данные не найдены',
    apiKeyMissing: 'Требуется ключ API FRED',
    date: 'Дата',
    value: 'Значение',
    zone: 'Зона',
    weekAgo: '1 неделю назад',
    monthAgo: '1 месяц назад',
    yearHigh: 'Годовой макс.',
    yearLow: 'Годовой мин.',
    range30d: '30Д',
    range90d: '90Д',
    range1y: '1Г',
    range5y: '5Л'
  },
  zh: {
    title: 'VIX 指数',
    subtitle: '恐惧与贪婪指标',
    current: '当前 VIX',
    open: '开盘',
    high: '最高',
    low: '最低',
    prev: '前收盘',
    change: '变化',
    lastUpdate: '最后更新',
    fear: '恐惧',
    greed: '贪婪',
    extremeFear: '极度恐惧',
    moderateFear: '中度恐惧',
    lowFear: '轻度恐惧',
    neutral: '中性',
    lowGreed: '轻度贪婪',
    moderateGreed: '中度贪婪',
    extremeGreed: '极度贪婪',
    history: '历史 (30天)',
    loading: '加载中...',
    error: '数据加载失败',
    retry: '重试',
    noData: '未找到数据',
    apiKeyMissing: '需要 FRED API 密钥',
    date: '日期',
    value: '值',
    zone: '区域',
    weekAgo: '1周前',
    monthAgo: '1个月前',
    yearHigh: '年度最高',
    yearLow: '年度最低',
    range30d: '30天',
    range90d: '90天',
    range1y: '1年',
    range5y: '5年'
  },
  ja: {
    title: 'VIX指数',
    subtitle: '恐怖＆貪欲指標',
    current: '現在のVIX',
    open: '始値',
    high: '高値',
    low: '安値',
    prev: '前日終値',
    change: '変動',
    lastUpdate: '最終更新',
    fear: '恐怖',
    greed: '貪欲',
    extremeFear: '極度の恐怖',
    moderateFear: '中程度の恐怖',
    lowFear: '軽度の恐怖',
    neutral: '中立',
    lowGreed: '軽度の貪欲',
    moderateGreed: '中程度の貪欲',
    extremeGreed: '極度の貪欲',
    history: '履歴 (30日)',
    loading: '読み込み中...',
    error: 'データ読み込み失敗',
    retry: '再試行',
    noData: 'データなし',
    apiKeyMissing: 'FRED APIキーが必要',
    date: '日付',
    value: '値',
    zone: 'ゾーン',
    weekAgo: '1週間前',
    monthAgo: '1ヶ月前',
    yearHigh: '年間高値',
    yearLow: '年間安値',
    range30d: '30日',
    range90d: '90日',
    range1y: '1年',
    range5y: '5年'
  },
  it: {
    title: 'Indice VIX',
    subtitle: 'Indicatore Paura & Avidità',
    current: 'VIX Attuale',
    open: 'Apertura',
    high: 'Massimo',
    low: 'Minimo',
    prev: 'Chiusura Precedente',
    change: 'Variazione',
    lastUpdate: 'Ultimo Aggiornamento',
    fear: 'PAURA',
    greed: 'AVIDITÀ',
    extremeFear: 'Paura Estrema',
    moderateFear: 'Paura Moderata',
    lowFear: 'Paura Lieve',
    neutral: 'Neutro',
    lowGreed: 'Avidità Lieve',
    moderateGreed: 'Avidità Moderata',
    extremeGreed: 'Avidità Estrema',
    history: 'Storico (30 Giorni)',
    loading: 'Caricamento...',
    error: 'Impossibile caricare i dati',
    retry: 'Riprova',
    noData: 'Nessun dato',
    apiKeyMissing: 'Chiave API FRED richiesta',
    date: 'Data',
    value: 'Valore',
    zone: 'Zona',
    weekAgo: '1 settimana fa',
    monthAgo: '1 mese fa',
    yearHigh: 'Massimo annuale',
    yearLow: 'Minimo annuale',
    range30d: '30G',
    range90d: '90G',
    range1y: '1A',
    range5y: '5A'
  },
  ar: {
    title: 'مؤشر VIX',
    subtitle: 'مؤشر الخوف والطمع',
    current: 'VIX الحالي',
    open: 'الافتتاح',
    high: 'الأعلى',
    low: 'الأدنى',
    prev: 'الإغلاق السابق',
    change: 'التغيير',
    lastUpdate: 'آخر تحديث',
    fear: 'خوف',
    greed: 'طمع',
    extremeFear: 'خوف شديد',
    moderateFear: 'خوف متوسط',
    lowFear: 'خوف منخفض',
    neutral: 'محايد',
    lowGreed: 'طمع منخفض',
    moderateGreed: 'طمع متوسط',
    extremeGreed: 'طمع شديد',
    history: 'السجل (30 يوم)',
    loading: 'جار التحميل...',
    error: 'فشل تحميل البيانات',
    retry: 'إعادة المحاولة',
    noData: 'لا توجد بيانات',
    apiKeyMissing: 'مفتاح FRED API مطلوب',
    date: 'التاريخ',
    value: 'القيمة',
    zone: 'المنطقة',
    weekAgo: 'قبل أسبوع',
    monthAgo: 'قبل شهر',
    yearHigh: 'أعلى سنوي',
    yearLow: 'أدنى سنوي',
    range30d: '30ي',
    range90d: '90ي',
    range1y: '1س',
    range5y: '5س'
  },
  ko: {
    title: 'VIX 지수',
    subtitle: '공포 & 탐욕 지표',
    current: '현재 VIX',
    open: '시가',
    high: '고가',
    low: '저가',
    prev: '전일 종가',
    change: '변동',
    lastUpdate: '마지막 업데이트',
    fear: '공포',
    greed: '탐욕',
    extremeFear: '극심한 공포',
    moderateFear: '보통 공포',
    lowFear: '약한 공포',
    neutral: '중립',
    lowGreed: '약한 탐욕',
    moderateGreed: '보통 탐욕',
    extremeGreed: '극심한 탐욕',
    history: '기록 (30일)',
    loading: '로딩 중...',
    error: '데이터 로드 실패',
    retry: '재시도',
    noData: '데이터 없음',
    apiKeyMissing: 'FRED API 키 필요',
    date: '날짜',
    value: '값',
    zone: '구간',
    weekAgo: '1주 전',
    monthAgo: '1개월 전',
    yearHigh: '연간 최고',
    yearLow: '연간 최저',
    range30d: '30일',
    range90d: '90일',
    range1y: '1년',
    range5y: '5년'
  },
  hi: {
    title: 'VIX सूचकांक',
    subtitle: 'भय और लालच संकेतक',
    current: 'वर्तमान VIX',
    open: 'खुलावट',
    high: 'उच्च',
    low: 'निम्न',
    prev: 'पिछला बंद',
    change: 'परिवर्तन',
    lastUpdate: 'अंतिम अपडेट',
    fear: 'भय',
    greed: 'लालच',
    extremeFear: 'अत्यधिक भय',
    moderateFear: 'मध्यम भय',
    lowFear: 'कम भय',
    neutral: 'तटस्थ',
    lowGreed: 'कम लालच',
    moderateGreed: 'मध्यम लालच',
    extremeGreed: 'अत्यधिक लालच',
    history: 'इतिहास (30 दिन)',
    loading: 'लोड हो रहा है...',
    error: 'डेटा लोड विफल',
    retry: 'पुनः प्रयास',
    noData: 'कोई डेटा नहीं',
    apiKeyMissing: 'FRED API कुंजी आवश्यक',
    date: 'तिथि',
    value: 'मूल्य',
    zone: 'क्षेत्र',
    weekAgo: '1 सप्ताह पहले',
    monthAgo: '1 महीने पहले',
    yearHigh: 'वार्षिक उच्च',
    yearLow: 'वार्षिक निम्न',
    range30d: '30दि',
    range90d: '90दि',
    range1y: '1वर्ष',
    range5y: '5वर्ष'
  },
  pt: {
    title: 'Índice VIX',
    subtitle: 'Indicador de Medo & Ganância',
    current: 'VIX Atual',
    open: 'Abertura',
    high: 'Máxima',
    low: 'Mínima',
    prev: 'Fecho Anterior',
    change: 'Variação',
    lastUpdate: 'Última Atualização',
    fear: 'MEDO',
    greed: 'GANÂNCIA',
    extremeFear: 'Medo Extremo',
    moderateFear: 'Medo Moderado',
    lowFear: 'Medo Baixo',
    neutral: 'Neutro',
    lowGreed: 'Ganância Baixa',
    moderateGreed: 'Ganância Moderada',
    extremeGreed: 'Ganância Extrema',
    history: 'Histórico (30 Dias)',
    loading: 'Carregando...',
    error: 'Falha ao carregar dados',
    retry: 'Tentar novamente',
    noData: 'Sem dados',
    apiKeyMissing: 'Chave API FRED necessária',
    date: 'Data',
    value: 'Valor',
    zone: 'Zona',
    weekAgo: '1 semana atrás',
    monthAgo: '1 mês atrás',
    yearHigh: 'Máxima anual',
    yearLow: 'Mínima anual',
    range30d: '30D',
    range90d: '90D',
    range1y: '1A',
    range5y: '5A'
  }
};

function getLocale() {
  try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; }
}

function getVixZone(val) {
  if (val >= 35) return { key: 'extremeFear', color: '#d32f2f', bg: 'rgba(211,47,47,0.12)' };
  if (val >= 25) return { key: 'moderateFear', color: '#e64a19', bg: 'rgba(230,74,25,0.12)' };
  if (val >= 20) return { key: 'lowFear', color: '#f57c00', bg: 'rgba(245,124,0,0.12)' };
  if (val >= 15) return { key: 'neutral', color: '#fbc02d', bg: 'rgba(251,192,45,0.12)' };
  if (val >= 12) return { key: 'lowGreed', color: '#7cb342', bg: 'rgba(124,179,66,0.12)' };
  if (val >= 10) return { key: 'moderateGreed', color: '#43a047', bg: 'rgba(67,160,71,0.12)' };
  return { key: 'extremeGreed', color: '#2e7d32', bg: 'rgba(46,125,50,0.12)' };
}

return {
  setup() {
    const locale = ref(getLocale());
    function onLocaleChanged(e) { if (e.detail) locale.value = e.detail; }
    function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

    function formatDate(dateStr) {
      const d = new Date(dateStr);
      return d.toLocaleDateString(locale.value === 'tr' ? 'tr-TR' : locale.value, {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    }

    const loading = ref(true);
    const error = ref('');
    const vixData = ref([]);
    const range = ref('30d');
    const hoveredPoint = ref(null);

    const rangeDays = { '30d': 30, '90d': 90, '1y': 365, '5y': 1825 };

    const filteredData = computed(() => {
      const days = rangeDays[range.value] || 30;
      return vixData.value.slice(-days);
    });

    const stats = computed(() => {
      const data = vixData.value;
      if (!data.length) return null;
      const latest = data[data.length - 1];
      const prev = data.length > 1 ? data[data.length - 2] : null;
      const weekAgoIdx = Math.max(0, data.length - 6);
      const monthAgoIdx = Math.max(0, data.length - 23);
      const vals = data.map(d => d.value);
      return {
        current: latest.value,
        date: latest.date,
        change: prev ? latest.value - prev.value : 0,
        changePercent: prev && prev.value ? ((latest.value - prev.value) / prev.value * 100) : 0,
        weekAgo: data[weekAgoIdx] ? data[weekAgoIdx].value : null,
        monthAgo: data[monthAgoIdx] ? data[monthAgoIdx].value : null,
        yearHigh: Math.max(...vals),
        yearLow: Math.min(...vals)
      };
    });

    const currentZone = computed(() => {
      if (!stats.value) return getVixZone(20);
      return getVixZone(stats.value.current);
    });

    async function fetchVixData() {
      loading.value = true;
      error.value = '';
      try {
        const res = await fetch('/api/vix/history');
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        if (data.error) { error.value = data.error; loading.value = false; return; }
        vixData.value = data.observations || [];
        loading.value = false;
      } catch (e) {
        error.value = L('error');
        loading.value = false;
      }
    }

    function drawGauge(canvas) {
      if (!canvas || !stats.value) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width = canvas.offsetWidth * 2;
      const h = canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
      const cw = w / 2, ch = h / 2;
      const cx = cw / 2, cy = ch * 0.62;
      const r = Math.min(cw, ch) * 0.42;

      ctx.clearRect(0, 0, cw, ch);

      const startAngle = Math.PI;
      const segments = [
        { pct: 0.143, color: '#2e7d32' },
        { pct: 0.143, color: '#43a047' },
        { pct: 0.143, color: '#7cb342' },
        { pct: 0.143, color: '#fbc02d' },
        { pct: 0.143, color: '#f57c00' },
        { pct: 0.143, color: '#e64a19' },
        { pct: 0.143, color: '#d32f2f' }
      ];

      let cumPct = 0;
      segments.forEach(seg => {
        const a1 = startAngle + cumPct * Math.PI;
        const a2 = startAngle + (cumPct + seg.pct) * Math.PI;
        ctx.beginPath();
        ctx.arc(cx, cy, r, a1, a2);
        ctx.lineWidth = r * 0.22;
        ctx.strokeStyle = seg.color;
        ctx.lineCap = 'butt';
        ctx.stroke();
        cumPct += seg.pct;
      });

      const val = Math.min(50, Math.max(0, stats.value.current));
      const needleAngle = startAngle + (val / 50) * Math.PI;
      const needleLen = r * 0.72;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(needleAngle);
      ctx.beginPath();
      ctx.moveTo(0, -3);
      ctx.lineTo(needleLen, 0);
      ctx.lineTo(0, 3);
      ctx.closePath();
      ctx.fillStyle = currentZone.value.color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fillStyle = currentZone.value.color;
      ctx.fill();
      ctx.restore();

      ctx.font = '600 ' + (r * 0.16) + 'px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#43a047';
      ctx.fillText(L('greed'), cx - r - 5, cy + r * 0.32);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#d32f2f';
      ctx.fillText(L('fear'), cx + r + 5, cy + r * 0.32);
    }

    function drawChart(canvas) {
      if (!canvas || !filteredData.value.length) return;
      const ctx = canvas.getContext('2d');
      const dpr = 2;
      const w = canvas.width = canvas.offsetWidth * dpr;
      const h = canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
      const cw = w / dpr, ch = h / dpr;
      const pad = { top: 15, right: 10, bottom: 25, left: 36 };
      const gw = cw - pad.left - pad.right;
      const gh = ch - pad.top - pad.bottom;
      const data = filteredData.value;

      ctx.clearRect(0, 0, cw, ch);

      const vals = data.map(d => d.value);
      const minV = Math.floor(Math.min(...vals) * 0.9);
      const maxV = Math.ceil(Math.max(...vals) * 1.1);
      const rangeV = maxV - minV || 1;

      const toX = (i) => pad.left + (i / (data.length - 1)) * gw;
      const toY = (v) => pad.top + gh - ((v - minV) / rangeV) * gh;

      ctx.strokeStyle = 'rgba(128,128,128,0.15)';
      ctx.lineWidth = 0.5;
      const gridCount = 4;
      for (let gi = 0; gi <= gridCount; gi++) {
        const y = pad.top + (gh / gridCount) * gi;
        ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(cw - pad.right, y); ctx.stroke();
        const lbl = (maxV - (rangeV / gridCount) * gi).toFixed(1);
        ctx.fillStyle = 'rgba(128,128,128,0.6)';
        ctx.font = '10px system-ui';
        ctx.textAlign = 'right';
        ctx.fillText(lbl, pad.left - 4, y + 3);
      }

      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(128,128,128,0.6)';
      ctx.font = '9px system-ui';
      const labelStep = Math.max(1, Math.floor(data.length / 5));
      for (let li = 0; li < data.length; li += labelStep) {
        const d = new Date(data[li].date);
        const lbl2 = (d.getMonth() + 1) + '/' + d.getDate();
        ctx.fillText(lbl2, toX(li), ch - 5);
      }

      const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + gh);
      gradient.addColorStop(0, 'rgba(211,47,47,0.12)');
      gradient.addColorStop(0.5, 'rgba(251,192,45,0.06)');
      gradient.addColorStop(1, 'rgba(46,125,50,0.12)');
      ctx.fillStyle = gradient;
      ctx.fillRect(pad.left, pad.top, gw, gh);

      ctx.beginPath();
      ctx.moveTo(toX(0), toY(data[0].value));
      for (let ci = 1; ci < data.length; ci++) ctx.lineTo(toX(ci), toY(data[ci].value));
      ctx.lineTo(toX(data.length - 1), pad.top + gh);
      ctx.lineTo(toX(0), pad.top + gh);
      ctx.closePath();
      const areaGrad = ctx.createLinearGradient(0, pad.top, 0, pad.top + gh);
      areaGrad.addColorStop(0, 'rgba(229,57,53,0.25)');
      areaGrad.addColorStop(1, 'rgba(229,57,53,0.02)');
      ctx.fillStyle = areaGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(toX(0), toY(data[0].value));
      for (let ci = 1; ci < data.length; ci++) ctx.lineTo(toX(ci), toY(data[ci].value));
      ctx.strokeStyle = '#e53935';
      ctx.lineWidth = 1.8;
      ctx.lineJoin = 'round';
      ctx.stroke();

      const lastIdx = data.length - 1;
      ctx.beginPath();
      ctx.arc(toX(lastIdx), toY(data[lastIdx].value), 4, 0, Math.PI * 2);
      ctx.fillStyle = '#e53935';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    function onChartHover(e) {
      const canvas = e.target;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const data = filteredData.value;
      if (!data.length) return;
      const padL = 36, padR = 10;
      const gw = rect.width - padL - padR;
      const idx = Math.round(((x - padL) / gw) * (data.length - 1));
      if (idx >= 0 && idx < data.length) {
        hoveredPoint.value = data[idx];
      }
    }

    function onChartLeave() {
      hoveredPoint.value = null;
    }

    function redrawCanvases() {
      nextTick(() => {
        const gauge = document.querySelector('.vix-gauge-canvas');
        const chart = document.querySelector('.vix-chart-canvas');
        if (gauge) drawGauge(gauge);
        if (chart) drawChart(chart);
      });
    }

    onMounted(() => {
      fetchVixData();
      window.addEventListener('locale-changed', onLocaleChanged);
    });

    onUnmounted(() => {
      window.removeEventListener('locale-changed', onLocaleChanged);
    });

    watch([filteredData, stats], () => { redrawCanvases(); }, { flush: 'post' });
    watch(range, () => { redrawCanvases(); });

    return {
      locale, L, loading, error, vixData, range, stats, currentZone,
      filteredData, hoveredPoint, getVixZone, formatDate,
      fetchVixData, onChartHover, onChartLeave
    };
  }
};
})(Vue);
