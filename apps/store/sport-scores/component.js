(function (Vue) {
  const { ref, reactive, computed, onMounted, onUnmounted, watch } = Vue;

  const LANGS = {
    tr: { title: 'Spor Skorları', soccer: 'Futbol', basketball: 'Basketbol', tennis: 'Tenis', all: 'Tümü', live: 'Canlı', finished: 'Bitti', upcoming: 'Yaklaşan', today: 'Bugün', noMatches: 'Bu tarihte maç bulunamadı', loading: 'Yükleniyor...', halfTime: 'İY', fullTime: 'MS', set: 'SET', refresh: 'Yenile', liveNow: 'CANLI' },
    en: { title: 'Sport Scores', soccer: 'Soccer', basketball: 'Basketball', tennis: 'Tennis', all: 'All', live: 'Live', finished: 'Finished', upcoming: 'Upcoming', today: 'Today', noMatches: 'No matches found for this date', loading: 'Loading...', halfTime: 'HT', fullTime: 'FT', set: 'SET', refresh: 'Refresh', liveNow: 'LIVE' },
    de: { title: 'Sport Ergebnisse', soccer: 'Fußball', basketball: 'Basketball', tennis: 'Tennis', all: 'Alle', live: 'Live', finished: 'Beendet', upcoming: 'Demnächst', today: 'Heute', noMatches: 'Keine Spiele gefunden', loading: 'Laden...', halfTime: 'HZ', fullTime: 'Ende', set: 'SATZ', refresh: 'Aktualisieren', liveNow: 'LIVE' },
    fr: { title: 'Scores Sportifs', soccer: 'Football', basketball: 'Basketball', tennis: 'Tennis', all: 'Tous', live: 'En direct', finished: 'Terminé', upcoming: 'À venir', today: "Aujourd'hui", noMatches: 'Aucun match trouvé', loading: 'Chargement...', halfTime: 'MT', fullTime: 'FT', set: 'SET', refresh: 'Actualiser', liveNow: 'EN DIRECT' },
    es: { title: 'Resultados', soccer: 'Fútbol', basketball: 'Baloncesto', tennis: 'Tenis', all: 'Todos', live: 'En vivo', finished: 'Finalizado', upcoming: 'Próximo', today: 'Hoy', noMatches: 'No se encontraron partidos', loading: 'Cargando...', halfTime: 'DT', fullTime: 'FT', set: 'SET', refresh: 'Actualizar', liveNow: 'EN VIVO' },
    ru: { title: 'Результаты', soccer: 'Футбол', basketball: 'Баскетбол', tennis: 'Теннис', all: 'Все', live: 'Live', finished: 'Завершён', upcoming: 'Скоро', today: 'Сегодня', noMatches: 'Матчей не найдено', loading: 'Загрузка...', halfTime: 'П', fullTime: 'МС', set: 'СЕТ', refresh: 'Обновить', liveNow: 'LIVE' },
    zh: { title: '体育比分', soccer: '足球', basketball: '篮球', tennis: '网球', all: '全部', live: '直播', finished: '已结束', upcoming: '即将', today: '今天', noMatches: '未找到比赛', loading: '加载中...', halfTime: 'HT', fullTime: 'FT', set: 'SET', refresh: '刷新', liveNow: '直播' },
    ja: { title: 'スポーツスコア', soccer: 'サッカー', basketball: 'バスケ', tennis: 'テニス', all: '全て', live: 'ライブ', finished: '終了', upcoming: '予定', today: '今日', noMatches: '試合が見つかりません', loading: '読み込み中...', halfTime: 'HT', fullTime: 'FT', set: 'SET', refresh: '更新', liveNow: 'LIVE' },
    it: { title: 'Risultati', soccer: 'Calcio', basketball: 'Basket', tennis: 'Tennis', all: 'Tutti', live: 'In diretta', finished: 'Finita', upcoming: 'Prossima', today: 'Oggi', noMatches: 'Nessuna partita trovata', loading: 'Caricamento...', halfTime: 'PT', fullTime: 'FT', set: 'SET', refresh: 'Aggiorna', liveNow: 'LIVE' }
  };

  // Map user country codes to Mackolik country names for priority sorting
  const COUNTRY_MAP = {
    TR: 'Türkiye', US: 'ABD', GB: 'İngiltere', DE: 'Almanya', FR: 'Fransa',
    ES: 'İspanya', IT: 'İtalya', NL: 'Hollanda', PT: 'Portekiz', BR: 'Brezilya',
    AR: 'Arjantin', SA: 'Suudi Arabistan', RU: 'Rusya', CN: 'Çin', JP: 'Japonya',
    KR: 'Güney Kore', IN: 'Hindistan', AU: 'Avustralya', MX: 'Meksika', PL: 'Polonya',
    BE: 'Belçika', AT: 'Avusturya', CH: 'İsviçre', SE: 'İsveç', NO: 'Norveç',
    DK: 'Danimarka', FI: 'Finlandiya', GR: 'Yunanistan', CZ: 'Çekya', HR: 'Hırvatistan',
    RS: 'Sırbistan', UA: 'Ukrayna', RO: 'Romanya', HU: 'Macaristan', IL: 'İsrail',
    EG: 'Mısır', MA: 'Fas', TN: 'Tunus', DZ: 'Cezayir', NG: 'Nijerya',
    ZA: 'Güney Afrika', CL: 'Şili', CO: 'Kolombiya', PE: 'Peru', EC: 'Ekvador',
    UY: 'Uruguay', PY: 'Paraguay', BO: 'Bolivya', VE: 'Venezuela', IE: 'İrlanda',
    SC: 'İskoçya', QA: 'Katar', AE: 'BAE', BH: 'Bahreyn', KW: 'Kuveyt'
  };

  // Top leagues for priority sorting (competition codes)
  const TOP_LEAGUE_CODES = [
    'AAL',   // Champions League
    'AAL',   // Europa League
    'TPL', 'TSPL', 'TK', // Turkey
    'İPL',   // England Premier League
    'İC',    // England Championship
    'İLL',   // England League One
    'LL',    // La Liga
    'BL',    // Bundesliga
    'İSA',   // Serie A
    'FL',    // Ligue 1
    'SPL',   // Saudi Pro League
    'AN'     // NBA
  ];

  const TOP_LEAGUE_NAMES = [
    'Şampiyonlar Ligi', 'Avrupa Ligi', 'Konferans Ligi',
    'Süper Lig', 'Premier Lig', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1',
    'NBA', 'EuroLeague', 'Pro Lig'
  ];

  const API_BASE = 'https://www.mackolik.com/perform/p0/ajax/components/competition/livescores/json';
  const TEAM_IMG = 'https://file.mackolikfeeds.com/teams/';

  function getLocale() {
    try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; }
  }

  function getUserCountry() {
    return 'TR'; // default, will be updated from API
  }

  function formatDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function displayDate(d, locale) {
    const days = {
      tr: ['Pzr', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
      en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      de: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
      fr: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
      es: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
      it: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
    };
    const months = {
      tr: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    };
    const dn = (days[locale] || days.en)[d.getDay()];
    const mn = (months[locale] || months.en)[d.getMonth()];
    return dn + ', ' + d.getDate() + ' ' + mn;
  }

  return {
    setup() {
      const locale = ref(getLocale());
      const userCountry = ref(getUserCountry());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      const currentDate = ref(new Date());
      const sport = ref('all'); // all, S, B, T
      const filter = ref('all'); // all, live, finished, upcoming
      const loading = ref(false);
      const competitions = ref({});
      const matches = ref({});
      const toggledGroups = reactive({});
      let refreshTimer = null;

      const dateStr = computed(() => formatDate(currentDate.value));
      const dateDisplay = computed(() => displayDate(currentDate.value, locale.value));
      const isToday = computed(() => formatDate(currentDate.value) === formatDate(new Date()));

      function prevDay() { const d = new Date(currentDate.value); d.setDate(d.getDate() - 1); currentDate.value = d; }
      function nextDay() { const d = new Date(currentDate.value); d.setDate(d.getDate() + 1); currentDate.value = d; }
      function goToday() { currentDate.value = new Date(); }

      // Group matches by competition, sorted by priority
      const groupedMatches = computed(() => {
        const comps = competitions.value;
        const allMatches = matches.value;
        const groups = {};

        for (const mId in allMatches) {
          const m = allMatches[mId];
          // Apply sport filter
          const comp = comps[m.competitionId];
          if (!comp) continue;
          if (sport.value !== 'all' && comp.sport !== sport.value) continue;
          // Apply status filter
          if (filter.value === 'live' && m.state !== 'live') continue;
          if (filter.value === 'finished' && m.state !== 'post') continue;
          if (filter.value === 'upcoming' && m.state !== 'pre') continue;

          if (!groups[m.competitionId]) {
            groups[m.competitionId] = {
              competition: comp,
              matches: []
            };
          }
          groups[m.competitionId].matches.push(m);
        }

        // Sort matches within each group by time
        for (const gId in groups) {
          groups[gId].matches.sort((a, b) => (a.mstUtc || 0) - (b.mstUtc || 0));
        }

        // Convert to array and sort groups by priority
        const uc = COUNTRY_MAP[userCountry.value] || '';
        const arr = Object.values(groups);

        arr.sort((a, b) => {
          const pa = getCompPriority(a.competition, uc);
          const pb = getCompPriority(b.competition, uc);
          if (pa !== pb) return pa - pb;
          // Has live match? prioritize
          const aLive = a.matches.some(m => m.state === 'live');
          const bLive = b.matches.some(m => m.state === 'live');
          if (aLive !== bLive) return aLive ? -1 : 1;
          return (a.competition.name || '').localeCompare(b.competition.name || '');
        });

        return arr;
      });

      function getCompPriority(comp, userCountryName) {
        const cn = comp.country && comp.country.name ? comp.country.name : '';
        const compName = comp.name || '';
        const compNameLower = compName.toLowerCase();
        const isSuperLeague = compNameLower.includes('süper') || compNameLower.includes('super');

        // 1. User's country super league (highest priority)
        if (userCountryName && cn === userCountryName && isSuperLeague) return 5;

        // 2. User's country other leagues
        if (userCountryName && cn === userCountryName) return 10;

        // 3. Continental championships (Champions League, Europa League, etc.)
        if (cn === 'Avrupa' || cn === 'Dünya' || cn === 'Güney Amerika' || cn === 'Kuzey / Orta Amerika' || cn === 'Afrika' || cn === 'Asya') {
          if (compName.includes('Şampiyonlar') || compName.includes('Champions')) return 15;
          return 20;
        }

        // 4. Other countries' super leagues
        if (isSuperLeague) return 28;

        // 5. Top leagues
        if (cn === 'İngiltere' && (compName.includes('Premier') || comp.code === 'İPL')) return 30;
        if (cn === 'İspanya' && (compName.includes('La Liga') || compName === 'La Liga' || comp.code === 'LL')) return 31;
        if (cn === 'Almanya' && (compName.includes('Bundesliga') || comp.code === 'BL')) return 32;
        if (cn === 'İtalya' && (compName.includes('Serie A') || comp.code === 'İSA')) return 33;
        if (cn === 'Fransa' && (compName.includes('Ligue 1') || comp.code === 'FL')) return 34;

        // 6. NBA, EuroLeague
        if (compName === 'NBA' || comp.code === 'AN') return 35;
        if (compName === 'EuroLeague') return 36;

        // 7. Other top-division leagues
        if (compName.includes('Premier') || compName.includes('1. Lig') || compName.includes('Serie A')) return 50;

        // 8. Cups
        if (compName.includes('Kupa') || compName.includes('Cup')) return 60;

        // 9. Lower divisions, youth, women
        if (compName.includes('U19') || compName.includes('U21') || compName.includes('U23') || compName.includes('U18') || compName.includes('U17')) return 80;
        if (compName.includes('Kadın') || compName.includes('(K)')) return 75;

        return 70;
      }

      const liveCount = computed(() => {
        let c = 0;
        for (const mId in matches.value) {
          if (matches.value[mId].state === 'live') c++;
        }
        return c;
      });

      function isTopGroup(comp) {
        const compName = (comp.name || '').toLowerCase();
        const cn = comp.country && comp.country.name ? comp.country.name : '';
        const uc = COUNTRY_MAP[userCountry.value] || '';
        if (compName.includes('süper') || compName.includes('super')) return true;
        if (['Avrupa', 'Dünya', 'Güney Amerika', 'Kuzey / Orta Amerika', 'Afrika', 'Asya'].includes(cn)) return true;
        if (uc && cn === uc) return true;
        if (compName.includes('premier') || compName === 'la liga' || compName.includes('bundesliga') || compName.includes('serie a') || compName.includes('ligue 1') || compName === 'nba' || compName === 'euroleague') return true;
        return false;
      }

      function isCollapsed(compId, comp) {
        const defaultOpen = isTopGroup(comp);
        const toggled = toggledGroups[compId] || false;
        return defaultOpen ? toggled : !toggled;
      }

      function toggleGroup(compId) {
        toggledGroups[compId] = !toggledGroups[compId];
      }

      async function fetchScores() {
        loading.value = true;
        try {
          const url = API_BASE + '?sports[]=Soccer&sports[]=Basketball&sports[]=Tennis&matchDate=' + dateStr.value;
          const token = localStorage.getItem('auth_token');
          const headers = token ? { Authorization: 'Bearer ' + token } : {};
          const res = await fetch('/api/sport-scores/proxy?url=' + encodeURIComponent(url), { headers });
          const data = await res.json();
          if (data.status === 'success' && data.data) {
            competitions.value = data.data.competitions || {};
            matches.value = data.data.matches || {};
          }
        } catch (e) {
          console.error('SportScores fetch error:', e);
        }
        loading.value = false;
      }

      function getMatchTime(m) {
        if (!m.mstUtc) return '';
        const d = new Date(m.mstUtc);
        return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
      }

      function getMatchStatus(m) {
        if (m.state === 'post') return m.statusBoxContent || L('fullTime');
        if (m.state === 'live') {
          if (m.statusBoxContent) return m.statusBoxContent;
          return L('liveNow');
        }
        return getMatchTime(m);
      }

      function getScore(m) {
        if (!m.score) return { home: '', away: '' };
        return { home: m.score.home || '', away: m.score.away || '' };
      }

      function getHalfTimeScore(m) {
        if (!m.score || !m.score.ht) return null;
        return '(' + m.score.ht.home + '-' + m.score.ht.away + ')';
      }

      function getTennisScore(m) {
        if (!m.score) return [];
        const sets = [];
        for (let i = 1; i <= 5; i++) {
          const s = m.score['s' + i];
          if (s) sets.push({ home: s.home, away: s.away, htb: s.homeTieBreak, atb: s.awayTieBreak });
        }
        return sets;
      }

      function teamLogo(teamId) {
        if (!teamId) return '';
        return TEAM_IMG + teamId;
      }

      function onImgError(e) {
        e.target.style.display = 'none';
      }

      function sportIcon(s) {
        if (s === 'S') return '⚽';
        if (s === 'B') return '🏀';
        if (s === 'T') return '🎾';
        return '🏅';
      }

      function countryFlag(comp) {
        if (!comp || !comp.country) return '';
        const name = comp.country.name || '';
        const flags = {
          'Türkiye': '🇹🇷', 'İngiltere': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'İspanya': '🇪🇸', 'Almanya': '🇩🇪',
          'İtalya': '🇮🇹', 'Fransa': '🇫🇷', 'Hollanda': '🇳🇱', 'Portekiz': '🇵🇹',
          'Brezilya': '🇧🇷', 'Arjantin': '🇦🇷', 'ABD': '🇺🇸', 'Rusya': '🇷🇺',
          'Japonya': '🇯🇵', 'Güney Kore': '🇰🇷', 'Çin': '🇨🇳', 'Avustralya': '🇦🇺',
          'Meksika': '🇲🇽', 'Suudi Arabistan': '🇸🇦', 'Belçika': '🇧🇪', 'Avusturya': '🇦🇹',
          'İsviçre': '🇨🇭', 'İsveç': '🇸🇪', 'Norveç': '🇳🇴', 'Danimarka': '🇩🇰',
          'Finlandiya': '🇫🇮', 'Polonya': '🇵🇱', 'Çekya': '🇨🇿', 'Hırvatistan': '🇭🇷',
          'Sırbistan': '🇷🇸', 'Yunanistan': '🇬🇷', 'Romanya': '🇷🇴', 'Ukrayna': '🇺🇦',
          'İskoçya': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'İrlanda': '🇮🇪', 'Macaristan': '🇭🇺', 'İsrail': '🇮🇱',
          'Mısır': '🇪🇬', 'Fas': '🇲🇦', 'Tunus': '🇹🇳', 'Cezayir': '🇩🇿',
          'Katar': '🇶🇦', 'BAE': '🇦🇪', 'Kolombiya': '🇨🇴', 'Şili': '🇨🇱',
          'Uruguay': '🇺🇾', 'Paraguay': '🇵🇾', 'Peru': '🇵🇪', 'Ekvador': '🇪🇨',
          'Bolivya': '🇧🇴', 'Venezuela': '🇻🇪', 'Hindistan': '🇮🇳',
          'Avrupa': '🇪🇺', 'Dünya': '🌍', 'Afrika': '🌍', 'Asya': '🌏',
          'Güney Amerika': '🌎', 'Kuzey / Orta Amerika': '🌎'
        };
        return flags[name] || '🏳️';
      }

      function onLocaleChanged() {
        locale.value = getLocale();
        userCountry.value = getUserCountry();
      }

      watch(dateStr, () => { fetchScores(); });

      onMounted(async () => {
        try {
          const token = localStorage.getItem('auth_token');
          const headers = token ? { Authorization: 'Bearer ' + token } : {};
          const sRes = await fetch('/api/settings', { headers });
          if (sRes.ok) {
            const s = await sRes.json();
            if (s.countryCode) userCountry.value = s.countryCode;
          }
        } catch {}
        fetchScores();
        refreshTimer = setInterval(() => { if (isToday.value) fetchScores(); }, 60000);
        window.addEventListener('locale-changed', onLocaleChanged);
      });

      onUnmounted(() => {
        if (refreshTimer) clearInterval(refreshTimer);
        window.removeEventListener('locale-changed', onLocaleChanged);
      });

      return {
        L, locale, currentDate, dateStr, dateDisplay, isToday,
        sport, filter, loading, liveCount,
        groupedMatches, prevDay, nextDay, goToday, fetchScores,
        getMatchTime, getMatchStatus, getScore, getHalfTimeScore, getTennisScore,
        teamLogo, onImgError, sportIcon, countryFlag,
        isCollapsed, toggleGroup
      };
    }
  };
})(Vue);
