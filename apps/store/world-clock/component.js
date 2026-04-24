(function(Vue) {
  const { ref, computed, onMounted, onUnmounted } = Vue;

  const DEFAULT_CITIES = [
    { name: 'New York',      tz: 'America/New_York',      flag: '🇺🇸' },
    { name: 'Londra',        tz: 'Europe/London',          flag: '🇬🇧' },
    { name: 'Paris',         tz: 'Europe/Paris',           flag: '🇫🇷' },
    { name: 'Berlin',        tz: 'Europe/Berlin',          flag: '🇩🇪' },
    { name: 'İstanbul',      tz: 'Europe/Istanbul',        flag: '🇹🇷' },
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
    { name: 'Londra',        tz: 'Europe/London',          flag: '🇬🇧' },
    { name: 'Paris',         tz: 'Europe/Paris',           flag: '🇫🇷' },
    { name: 'Berlin',        tz: 'Europe/Berlin',          flag: '🇩🇪' },
    { name: 'Madrid',        tz: 'Europe/Madrid',          flag: '🇪🇸' },
    { name: 'Roma',          tz: 'Europe/Rome',            flag: '🇮🇹' },
    { name: 'Amsterdam',     tz: 'Europe/Amsterdam',       flag: '🇳🇱' },
    { name: 'Moskova',       tz: 'Europe/Moscow',          flag: '🇷🇺' },
    { name: 'İstanbul',      tz: 'Europe/Istanbul',        flag: '🇹🇷' },
    { name: 'Ankara',        tz: 'Europe/Istanbul',        flag: '🇹🇷' },
    { name: 'Kahire',        tz: 'Africa/Cairo',           flag: '🇪🇬' },
    { name: 'Dubai',         tz: 'Asia/Dubai',             flag: '🇦🇪' },
    { name: 'Mumbai',        tz: 'Asia/Kolkata',           flag: '🇮🇳' },
    { name: 'Singapur',      tz: 'Asia/Singapore',         flag: '🇸🇬' },
    { name: 'Bangkok',       tz: 'Asia/Bangkok',           flag: '🇹🇭' },
    { name: 'Hong Kong',     tz: 'Asia/Hong_Kong',         flag: '🇭🇰' },
    { name: 'Shenzhen',      tz: 'Asia/Shanghai',          flag: '🇨🇳' },
    { name: 'Pekin',         tz: 'Asia/Shanghai',          flag: '🇨🇳' },
    { name: 'Şangay',        tz: 'Asia/Shanghai',          flag: '🇨🇳' },
    { name: 'Tokyo',         tz: 'Asia/Tokyo',             flag: '🇯🇵' },
    { name: 'Seul',          tz: 'Asia/Seoul',             flag: '🇰🇷' },
    { name: 'Sydney',        tz: 'Australia/Sydney',       flag: '🇦🇺' },
    { name: 'Auckland',      tz: 'Pacific/Auckland',       flag: '🇳🇿' }
  ];

  return {
    setup() {
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

      function getTime(tz) {
        const d = new Date(now.value);
        try {
          const parts = {};
          new Intl.DateTimeFormat('tr-TR', {
            timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
          }).formatToParts(d).forEach(p => { parts[p.type] = p.value; });
          return (parts.hour || '00') + ':' + (parts.minute || '00') + ':' + (parts.second || '00');
        } catch { return '--:--:--'; }
      }

      function getDate(tz) {
        try {
          return new Date(now.value).toLocaleDateString('tr-TR', {
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

      onMounted(() => {
        timer = setInterval(() => { now.value = Date.now(); }, 1000);
      });

      onUnmounted(() => {
        if (timer) clearInterval(timer);
      });

      return {
        cities, addOpen, search, filteredCities,
        getTime, getDate, getOffset, getDayPhase,
        removeCity, addCity, moveCity
      };
    }
  };
})(Vue);
