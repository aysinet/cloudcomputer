({
  setup() {
    const { ref, computed, onMounted, onUnmounted } = Vue;

    const LANGS = {
      tr: { title:'Döviz Çevirici', from:'Kaynak', to:'Hedef', amount:'Tutar', result:'Sonuç', rate:'Kur', swap:'Değiştir', search:'Ara...', loading:'Yükleniyor...', error:'Kurlar yüklenemedi', lastUpdate:'Son güncelleme', noResult:'Sonuç yok', popular:'Popüler', all:'Tümü', copied:'Kopyalandı' },
      en: { title:'Currency Converter', from:'From', to:'To', amount:'Amount', result:'Result', rate:'Rate', swap:'Swap', search:'Search...', loading:'Loading...', error:'Failed to load rates', lastUpdate:'Last update', noResult:'No result', popular:'Popular', all:'All', copied:'Copied' },
      de: { title:'Währungsrechner', from:'Von', to:'Nach', amount:'Betrag', result:'Ergebnis', rate:'Kurs', swap:'Tauschen', search:'Suchen...', loading:'Laden...', error:'Kurse konnten nicht geladen werden', lastUpdate:'Letzte Aktualisierung', noResult:'Kein Ergebnis', popular:'Beliebt', all:'Alle', copied:'Kopiert' },
      fr: { title:'Convertisseur', from:'De', to:'Vers', amount:'Montant', result:'Résultat', rate:'Taux', swap:'Inverser', search:'Rechercher...', loading:'Chargement...', error:'Échec du chargement', lastUpdate:'Dernière maj', noResult:'Aucun résultat', popular:'Populaires', all:'Toutes', copied:'Copié' },
      es: { title:'Conversor', from:'De', to:'A', amount:'Cantidad', result:'Resultado', rate:'Tipo', swap:'Intercambiar', search:'Buscar...', loading:'Cargando...', error:'Error al cargar tasas', lastUpdate:'Última actualización', noResult:'Sin resultados', popular:'Popular', all:'Todas', copied:'Copiado' },
      ru: { title:'Конвертер', from:'Из', to:'В', amount:'Сумма', result:'Результат', rate:'Курс', swap:'Обмен', search:'Поиск...', loading:'Загрузка...', error:'Ошибка загрузки', lastUpdate:'Обновлено', noResult:'Нет результатов', popular:'Популярные', all:'Все', copied:'Скопировано' },
      zh: { title:'汇率转换', from:'从', to:'到', amount:'金额', result:'结果', rate:'汇率', swap:'交换', search:'搜索...', loading:'加载中...', error:'加载失败', lastUpdate:'更新时间', noResult:'无结果', popular:'热门', all:'全部', copied:'已复制' },
      ja: { title:'通貨換算', from:'変換元', to:'変換先', amount:'金額', result:'結果', rate:'レート', swap:'入替', search:'検索...', loading:'読込中...', error:'読込失敗', lastUpdate:'更新', noResult:'結果なし', popular:'人気', all:'すべて', copied:'コピー済' },
      it: { title:'Convertitore', from:'Da', to:'A', amount:'Importo', result:'Risultato', rate:'Tasso', swap:'Scambia', search:'Cerca...', loading:'Caricamento...', error:'Errore caricamento', lastUpdate:'Ultimo aggiornamento', noResult:'Nessun risultato', popular:'Popolari', all:'Tutte', copied:'Copiato' },
      ar: { title:'محول العملات', from:'من', to:'إلى', amount:'المبلغ', result:'النتيجة', rate:'السعر', swap:'تبديل', search:'بحث...', loading:'جار التحميل...', error:'فشل التحميل', lastUpdate:'آخر تحديث', noResult:'لا نتائج', popular:'شائعة', all:'الكل', copied:'تم النسخ' },
      ko: { title:'환율 변환', from:'변환 전', to:'변환 후', amount:'금액', result:'결과', rate:'환율', swap:'교환', search:'검색...', loading:'로딩...', error:'로드 실패', lastUpdate:'최종 업데이트', noResult:'결과 없음', popular:'인기', all:'전체', copied:'복사됨' },
      hi: { title:'मुद्रा परिवर्तक', from:'से', to:'में', amount:'राशि', result:'परिणाम', rate:'दर', swap:'बदलें', search:'खोजें...', loading:'लोड हो रहा...', error:'लोड विफल', lastUpdate:'अंतिम अपडेट', noResult:'कोई परिणाम नहीं', popular:'लोकप्रिय', all:'सभी', copied:'कॉपी किया' },
      pt: { title:'Conversor', from:'De', to:'Para', amount:'Valor', result:'Resultado', rate:'Taxa', swap:'Trocar', search:'Pesquisar...', loading:'Carregando...', error:'Erro ao carregar', lastUpdate:'Última atualização', noResult:'Sem resultado', popular:'Popular', all:'Todas', copied:'Copiado' }
    };

    const COUNTRY_CURRENCY = {
      AF:'AFN',AL:'ALL',DZ:'DZD',AD:'EUR',AO:'AOA',AG:'XCD',AR:'ARS',AM:'AMD',AU:'AUD',AT:'EUR',
      AZ:'AZN',BS:'BSD',BH:'BHD',BD:'BDT',BB:'BBD',BY:'BYN',BE:'EUR',BZ:'BZD',BJ:'XOF',BT:'BTN',
      BO:'BOB',BA:'BAM',BW:'BWP',BR:'BRL',BN:'BND',BG:'BGN',BF:'XOF',BI:'BIF',KH:'KHR',CM:'XAF',
      CA:'CAD',CV:'CVE',CF:'XAF',TD:'XAF',CL:'CLP',CN:'CNY',CO:'COP',KM:'KMF',CG:'XAF',CD:'CDF',
      CR:'CRC',HR:'HRK',CU:'CUP',CY:'EUR',CZ:'CZK',DK:'DKK',DJ:'DJF',DM:'XCD',DO:'DOP',EC:'USD',
      EG:'EGP',SV:'SVC',GQ:'XAF',ER:'ERN',EE:'EUR',SZ:'SZL',ET:'ETB',FJ:'FJD',FI:'EUR',FR:'EUR',
      GA:'XAF',GM:'GMD',GE:'GEL',DE:'EUR',GH:'GHS',GR:'EUR',GD:'XCD',GT:'GTQ',GN:'GNF',GW:'XOF',
      GY:'GYD',HT:'HTG',HN:'HNL',HU:'HUF',IS:'ISK',IN:'INR',ID:'IDR',IR:'IRR',IQ:'IQD',IE:'EUR',
      IL:'ILS',IT:'EUR',JM:'JMD',JP:'JPY',JO:'JOD',KZ:'KZT',KE:'KES',KI:'AUD',KP:'KPW',KR:'KRW',
      KW:'KWD',KG:'KGS',LA:'LAK',LV:'EUR',LB:'LBP',LS:'LSL',LR:'LRD',LY:'LYD',LI:'CHF',LT:'EUR',
      LU:'EUR',MG:'MGA',MW:'MWK',MY:'MYR',MV:'MVR',ML:'XOF',MT:'EUR',MH:'USD',MR:'MRU',MU:'MUR',
      MX:'MXN',FM:'USD',MD:'MDL',MC:'EUR',MN:'MNT',ME:'EUR',MA:'MAD',MZ:'MZN',MM:'MMK',NA:'NAD',
      NR:'AUD',NP:'NPR',NL:'EUR',NZ:'NZD',NI:'NIO',NE:'XOF',NG:'NGN',NO:'NOK',OM:'OMR',PK:'PKR',
      PW:'USD',PA:'PAB',PG:'PGK',PY:'PYG',PE:'PEN',PH:'PHP',PL:'PLN',PT:'EUR',QA:'QAR',RO:'RON',
      RU:'RUB',RW:'RWF',KN:'XCD',LC:'XCD',VC:'XCD',WS:'WST',SM:'EUR',ST:'STN',SA:'SAR',SN:'XOF',
      RS:'RSD',SC:'SCR',SL:'SLE',SG:'SGD',SK:'EUR',SI:'EUR',SB:'SBD',SO:'SOS',ZA:'ZAR',SS:'SSP',
      ES:'EUR',LK:'LKR',SD:'SDG',SR:'SRD',SE:'SEK',CH:'CHF',SY:'SYP',TW:'TWD',TJ:'TJS',TZ:'TZS',
      TH:'THB',TL:'USD',TG:'XOF',TO:'TOP',TT:'TTD',TN:'TND',TR:'TRY',TM:'TMT',TV:'AUD',UG:'UGX',
      UA:'UAH',AE:'AED',GB:'GBP',US:'USD',UY:'UYU',UZ:'UZS',VU:'VUV',VE:'VES',VN:'VND',YE:'YER',
      ZM:'ZMW',ZW:'ZWG',HK:'HKD'
    };

    const POPULAR = ['USD','EUR','GBP','JPY','TRY','AUD','CAD','CHF','CNY','INR','KRW','BRL','MXN','SAR','AED','RUB','SEK','NOK','PLN','HKD'];

    const ALL_CURRENCIES = ["USD","EUR","GBP","JPY","AUD","CAD","CHF","CNY","HKD","NZD","SGD","THB","KRW","INR","MXN","BRL","ZAR","SEK","NOK","DKK","PLN","TRY","TWD","PHP","IDR","MYR","VND","AED","SAR","CZK","ADA","AFN","ALL","AMD","ANG","AOA","ARB","ARS","ATS","AVAX","AWG","AZM","AZN","BAM","BBD","BCH","BDT","BEF","BGN","BHD","BIF","BMD","BNB","BND","BOB","BSD","BTC","BTN","BWP","BYN","BYR","BZD","CDF","CLF","CLP","CNH","COP","CRC","CUC","CUP","CVE","CYP","DAI","DEM","DJF","DOGE","DOP","DOT","DZD","EEK","EGP","ERN","ESP","ETB","ETH","EURC","FIM","FJD","FKP","FRF","GEL","GGP","GHC","GHS","GIP","GMD","GNF","GRD","GTQ","GYD","HNL","HRK","HTG","HUF","IEP","ILS","IMP","IQD","IRR","ISK","ITL","JEP","JMD","JOD","KES","KGS","KHR","KMF","KPW","KWD","KYD","KZT","LAK","LBP","LINK","LKR","LRD","LSL","LTC","LTL","LUF","LUNA","LVL","LYD","MAD","MDL","MGA","MGF","MKD","MMK","MNT","MOP","MRO","MRU","MTL","MUR","MVR","MWK","MXV","MZM","MZN","NAD","NGN","NIO","NLG","NPR","OMR","PAB","PEN","PGK","PKR","POL","PTE","PYG","QAR","ROL","RON","RSD","RUB","RWF","SBD","SCR","SDD","SDG","SHP","SIT","SKK","SLE","SLL","SOL","SOS","SPL","SRD","SRG","SSP","STD","STN","SVC","SYP","SZL","TJS","TMM","TMT","TND","TOP","TRL","TRX","TTD","TVD","TZS","UAH","UGX","UNI","USDC","USDP","USDT","UYU","UZS","VAL","VEB","VED","VEF","VES","VUV","WST","XAF","XAG","XAU","XBT","XCD","XCG","XDR","XLM","XOF","XPD","XPF","XPT","XRP","YER","ZMK","ZMW","ZWD","ZWG","ZWL"];

    function getLocale() {
      try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; }
    }
    const locale = ref(getLocale());
    function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

    const baseCurrency = ref('USD');
    const targetCurrency = ref('EUR');
    const amount = ref(1);
    const rates = ref({});
    const loading = ref(false);
    const errorMsg = ref('');
    const lastUpdate = ref('');
    const copiedFlag = ref(false);

    const convertedAmount = computed(() => {
      if (!rates.value || !rates.value[targetCurrency.value]) return '';
      const r = rates.value[targetCurrency.value];
      if (r === null || r === undefined) return '';
      const val = parseFloat(amount.value);
      if (isNaN(val)) return '';
      return (val * r).toFixed(targetCurrency.value === 'BTC' || targetCurrency.value === 'ETH' || targetCurrency.value === 'XAU' ? 8 : 2);
    });

    const currentRate = computed(() => {
      if (!rates.value || !rates.value[targetCurrency.value]) return '';
      const r = rates.value[targetCurrency.value];
      if (r === null || r === undefined) return '';
      return r < 0.01 ? r.toFixed(8) : r < 1 ? r.toFixed(6) : r < 100 ? r.toFixed(4) : r.toFixed(2);
    });

    async function fetchRates() {
      loading.value = true;
      errorMsg.value = '';
      try {
        const res = await fetch('/api/currency-rates?base=' + encodeURIComponent(baseCurrency.value));
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (data.rates) {
          rates.value = data.rates;
          lastUpdate.value = data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();
        } else {
          throw new Error('Invalid response');
        }
      } catch (e) {
        errorMsg.value = L('error');
      } finally {
        loading.value = false;
      }
    }

    function swapCurrencies() {
      const tmp = baseCurrency.value;
      baseCurrency.value = targetCurrency.value;
      targetCurrency.value = tmp;
      fetchRates();
    }

    function copyResult() {
      if (!convertedAmount.value) return;
      const text = convertedAmount.value + ' ' + targetCurrency.value;
      navigator.clipboard.writeText(text).then(() => {
        copiedFlag.value = true;
        setTimeout(() => copiedFlag.value = false, 1500);
      }).catch(() => {});
    }

    function onLocaleChanged(e) {
      locale.value = e.detail || getLocale();
    }

    async function loadDefaultCurrency() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const s = await res.json();
          if (s.countryCode && COUNTRY_CURRENCY[s.countryCode]) {
            baseCurrency.value = COUNTRY_CURRENCY[s.countryCode];
          }
        }
      } catch {}
    }

    let refreshTimer = null;

    onMounted(async () => {
      window.addEventListener('locale-changed', onLocaleChanged);
      await loadDefaultCurrency();
      await fetchRates();
      refreshTimer = setInterval(fetchRates, 300000);
    });

    onUnmounted(() => {
      window.removeEventListener('locale-changed', onLocaleChanged);
      if (refreshTimer) clearInterval(refreshTimer);
    });

    return {
      baseCurrency, targetCurrency, amount, loading, errorMsg,
      lastUpdate, copiedFlag, convertedAmount, currentRate,
      popularList: POPULAR, allCurrencies: ALL_CURRENCIES,
      swapCurrencies, copyResult, fetchRates, L
    };
  }
})
