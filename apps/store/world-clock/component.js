(function(Vue) {
  const { ref, computed, onMounted, onUnmounted } = Vue;

  const LANGS = {
    tr: { title:'Dünya Saati', searchPlaceholder:'Şehir ara...', noResults:'Sonuç bulunamadı', up:'Yukarı', down:'Aşağı', remove:'Kaldır', empty:'Şehir eklenmemiş.', addCity:'Şehir ekle' },
    en: { title:'World Clock', searchPlaceholder:'Search city...', noResults:'No results found', up:'Up', down:'Down', remove:'Remove', empty:'No cities added.', addCity:'Add city' },
    de: { title:'Weltzeituhr', searchPlaceholder:'Stadt suchen...', noResults:'Keine Ergebnisse', up:'Hoch', down:'Runter', remove:'Entfernen', empty:'Keine Städte hinzugefügt.', addCity:'Stadt hinzufügen' },
    fr: { title:'Horloge Mondiale', searchPlaceholder:'Rechercher une ville...', noResults:'Aucun résultat', up:'Haut', down:'Bas', remove:'Supprimer', empty:'Aucune ville ajoutée.', addCity:'Ajouter une ville' },
    es: { title:'Reloj Mundial', searchPlaceholder:'Buscar ciudad...', noResults:'Sin resultados', up:'Arriba', down:'Abajo', remove:'Eliminar', empty:'No hay ciudades.', addCity:'Agregar ciudad' },
    ru: { title:'Мировые Часы', searchPlaceholder:'Поиск города...', noResults:'Не найдено', up:'Вверх', down:'Вниз', remove:'Удалить', empty:'Городов нет.', addCity:'Добавить город' },
    zh: { title:'世界时钟', searchPlaceholder:'搜索城市...', noResults:'未找到结果', up:'上移', down:'下移', remove:'移除', empty:'尚未添加城市。', addCity:'添加城市' },
    ja: { title:'世界時計', searchPlaceholder:'都市を検索...', noResults:'結果なし', up:'上へ', down:'下へ', remove:'削除', empty:'都市がありません。', addCity:'都市を追加' },
    it: { title:'Orologio Mondiale', searchPlaceholder:'Cerca città...', noResults:'Nessun risultato', up:'Su', down:'Giù', remove:'Rimuovi', empty:'Nessuna città aggiunta.', addCity:'Aggiungi città' },
    ar: { title:'ساعة عالمية', searchPlaceholder:'ابحث عن مدينة...', noResults:'لا توجد نتائج', up:'أعلى', down:'أسفل', remove:'إزالة', empty:'لم تتم إضافة مدن.', addCity:'إضافة مدينة' },
    ko: { title:'세계 시계', searchPlaceholder:'도시 검색...', noResults:'결과 없음', up:'위로', down:'아래로', remove:'제거', empty:'추가된 도시가 없습니다.', addCity:'도시 추가' },
    hi: { title:'विश्व घड़ी', searchPlaceholder:'शहर खोजें...', noResults:'कोई परिणाम नहीं', up:'ऊपर', down:'नीचे', remove:'हटाएं', empty:'कोई शहर नहीं जोड़ा गया।', addCity:'शहर जोड़ें' },
    pt: { title:'Relógio Mundial', searchPlaceholder:'Buscar cidade...', noResults:'Nenhum resultado', up:'Acima', down:'Abaixo', remove:'Remover', empty:'Nenhuma cidade adicionada.', addCity:'Adicionar cidade' }
  };

  // City names: use English names (universal), Turkish names removed
  const DEFAULT_CITIES = [
    { name: 'New York',      tz: 'America/New_York',      flag: '🇺🇸' },
    { name: 'London',        tz: 'Europe/London',          flag: '🇬🇧' },
    { name: 'Paris',         tz: 'Europe/Paris',           flag: '🇫🇷' },
    { name: 'Berlin',        tz: 'Europe/Berlin',          flag: '🇩🇪' },
    { name: 'Istanbul',      tz: 'Europe/Istanbul',        flag: '🇹🇷' },
    { name: 'Tokyo',         tz: 'Asia/Tokyo',             flag: '🇯🇵' },
    { name: 'Shenzhen',      tz: 'Asia/Shanghai',          flag: '🇨🇳' },
    { name: 'San Francisco', tz: 'America/Los_Angeles',    flag: '🇺🇸' }
  ];

  const ALL_CITIES = [
    { name: 'New York',      tz: 'America/New_York',      flag: '🇺🇸' },
    { name: 'Los Angeles',   tz: 'America/Los_Angeles',    flag: '🇺🇸' },
    { name: 'San Francisco', tz: 'America/Los_Angeles',    flag: '🇺🇸' },
    { name: 'Chicago',       tz: 'America/Chicago',        flag: '🇺🇸' },
    { name: 'Toronto',       tz: 'America/Toronto',        flag: '🇨🇦' },
    { name: 'Mexico City',   tz: 'America/Mexico_City',    flag: '🇲🇽' },
    { name: 'São Paulo',     tz: 'America/Sao_Paulo',      flag: '🇧🇷' },
    { name: 'Buenos Aires',  tz: 'America/Argentina/Buenos_Aires', flag: '🇦🇷' },
    { name: 'London',        tz: 'Europe/London',          flag: '🇬🇧' },
    { name: 'Paris',         tz: 'Europe/Paris',           flag: '🇫🇷' },
    { name: 'Berlin',        tz: 'Europe/Berlin',          flag: '🇩🇪' },
    { name: 'Madrid',        tz: 'Europe/Madrid',          flag: '🇪🇸' },
    { name: 'Rome',          tz: 'Europe/Rome',            flag: '🇮🇹' },
    { name: 'Amsterdam',     tz: 'Europe/Amsterdam',       flag: '🇳🇱' },
    { name: 'Moscow',        tz: 'Europe/Moscow',          flag: '🇷🇺' },
    { name: 'Istanbul',      tz: 'Europe/Istanbul',        flag: '🇹🇷' },
    { name: 'Ankara',        tz: 'Europe/Istanbul',        flag: '🇹🇷' },
    { name: 'Cairo',         tz: 'Africa/Cairo',           flag: '🇪🇬' },
    { name: 'Dubai',         tz: 'Asia/Dubai',             flag: '🇦🇪' },
    { name: 'Mumbai',        tz: 'Asia/Kolkata',           flag: '🇮🇳' },
    { name: 'Singapore',     tz: 'Asia/Singapore',         flag: '🇸🇬' },
    { name: 'Bangkok',       tz: 'Asia/Bangkok',           flag: '🇹🇭' },
    { name: 'Hong Kong',     tz: 'Asia/Hong_Kong',         flag: '🇭🇰' },
    { name: 'Shenzhen',      tz: 'Asia/Shanghai',          flag: '🇨🇳' },
    { name: 'Beijing',       tz: 'Asia/Shanghai',          flag: '🇨🇳' },
    { name: 'Shanghai',      tz: 'Asia/Shanghai',          flag: '🇨🇳' },
    { name: 'Tokyo',         tz: 'Asia/Tokyo',             flag: '🇯🇵' },
    { name: 'Seoul',         tz: 'Asia/Seoul',             flag: '🇰🇷' },
    { name: 'Sydney',        tz: 'Australia/Sydney',       flag: '🇦🇺' },
    { name: 'Auckland',      tz: 'Pacific/Auckland',       flag: '🇳🇿' }
  ];

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  return {
    setup() {
      const locale = ref(getLocale());
      function t(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      const STORAGE_KEY = 'wc_cities';
      const cities = ref(loadCities());
      const now = ref(Date.now());
      const addOpen = ref(false);
      const search = ref('');

      let timer = null;

      function loadCities() {
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length) return parsed;
          }
        } catch {}
        return DEFAULT_CITIES.map(c => ({ ...c }));
      }

      function saveCities() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cities.value));
      }

      function dateFmtLocale() {
        const map = { tr:'tr-TR', en:'en-US', de:'de-DE', fr:'fr-FR', es:'es-ES', ru:'ru-RU', zh:'zh-CN', ja:'ja-JP', it:'it-IT', ar:'ar-SA', ko:'ko-KR', hi:'hi-IN', pt:'pt-BR' };
        return map[locale.value] || 'en-US';
      }

      function getTime(tz) {
        const d = new Date(now.value);
        try {
          const parts = {};
          new Intl.DateTimeFormat(dateFmtLocale(), {
            timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
          }).formatToParts(d).forEach(p => { parts[p.type] = p.value; });
          return (parts.hour || '00') + ':' + (parts.minute || '00') + ':' + (parts.second || '00');
        } catch { return '--:--:--'; }
      }

      function getDate(tz) {
        try {
          return new Date(now.value).toLocaleDateString(dateFmtLocale(), {
            timeZone: tz, weekday: 'short', day: 'numeric', month: 'short'
          });
        } catch { return ''; }
      }

      function getOffset(tz) {
        try {
          const here = new Date(now.value);
          const fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' });
          const parts = fmt.formatToParts(here);
          const tzPart = parts.find(p => p.type === 'timeZoneName');
          return tzPart ? tzPart.value.replace('GMT', 'UTC') : '';
        } catch { return ''; }
      }

      function getDayPhase(tz) {
        try {
          const h = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hour12: false }).format(new Date(now.value)));
          if (h >= 6 && h < 12) return '🌅';
          if (h >= 12 && h < 18) return '☀️';
          if (h >= 18 && h < 21) return '🌇';
          return '🌙';
        } catch { return ''; }
      }

      function removeCity(idx) {
        cities.value.splice(idx, 1);
        saveCities();
      }

      function addCity(city) {
        if (cities.value.some(c => c.name === city.name && c.tz === city.tz)) return;
        cities.value.push({ ...city });
        saveCities();
        addOpen.value = false;
        search.value = '';
      }

      const filteredCities = computed(() => {
        const q = search.value.toLowerCase().trim();
        const existing = new Set(cities.value.map(c => c.name + '|' + c.tz));
        return ALL_CITIES.filter(c => {
          if (existing.has(c.name + '|' + c.tz)) return false;
          if (!q) return true;
          return c.name.toLowerCase().includes(q);
        });
      });

      function moveCity(from, to) {
        if (to < 0 || to >= cities.value.length) return;
        const item = cities.value.splice(from, 1)[0];
        cities.value.splice(to, 0, item);
        saveCities();
      }

      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

      onMounted(() => {
        timer = setInterval(() => { now.value = Date.now(); }, 1000);
        window.addEventListener('locale-changed', onLocaleChanged);
      });

      onUnmounted(() => {
        if (timer) clearInterval(timer);
        window.removeEventListener('locale-changed', onLocaleChanged);
      });

      return {
        cities, addOpen, search, filteredCities, t,
        getTime, getDate, getOffset, getDayPhase,
        removeCity, addCity, moveCity
      };
    }
  };
})(Vue);
