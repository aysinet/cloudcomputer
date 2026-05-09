({
  setup() {
    const { ref, computed, watch, onMounted, onUnmounted, nextTick } = Vue;

    const LANGS = {
      tr: {
        title: 'Regex Test',
        pattern: 'Düzenli İfade',
        patternPlaceholder: 'Regex ifadenizi yazın… ör: \\d+',
        testString: 'Test Metni',
        testPlaceholder: 'Test edilecek metni buraya yazın…',
        flags: 'Bayraklar',
        flagG: 'Global (g)',
        flagI: 'Büyük/Küçük harf duyarsız (i)',
        flagM: 'Çok satırlı (m)',
        flagS: 'Nokta tümünü eşler (s)',
        flagU: 'Unicode (u)',
        matches: 'Eşleşmeler',
        noMatch: 'Eşleşme bulunamadı',
        matchCount: 'eşleşme',
        groups: 'Gruplar',
        group: 'Grup',
        fullMatch: 'Tam Eşleşme',
        index: 'İndeks',
        explanation: 'Açıklama',
        replace: 'Değiştir',
        replacePlaceholder: 'Değiştirme metni…',
        replaceResult: 'Sonuç',
        copy: 'Kopyala',
        copied: 'Kopyalandı!',
        clear: 'Temizle',
        error: 'Hata',
        cheatsheet: 'Kısa Yollar',
        examples: 'Örnekler',
        commonPatterns: 'Yaygın Kalıplar',
        email: 'E-posta',
        url: 'URL',
        phone: 'Telefon',
        ipAddress: 'IP Adresi',
        date: 'Tarih (GG/AA/YYYY)',
        hexColor: 'Hex Renk',
        tab_test: 'Test',
        tab_replace: 'Değiştir',
        tab_explain: 'Açıkla',
        tab_cheatsheet: 'Rehber',
        charClass: 'Karakter Sınıfları',
        quantifiers: 'Niceleyiciler',
        anchors: 'Çapalar',
        groupsRef: 'Gruplar & Referanslar',
        lookaround: 'Bakınma'
      },
      en: {
        title: 'Regex Tester',
        pattern: 'Regular Expression',
        patternPlaceholder: 'Enter your regex… e.g. \\d+',
        testString: 'Test String',
        testPlaceholder: 'Enter text to test against…',
        flags: 'Flags',
        flagG: 'Global (g)',
        flagI: 'Case insensitive (i)',
        flagM: 'Multiline (m)',
        flagS: 'Dot matches all (s)',
        flagU: 'Unicode (u)',
        matches: 'Matches',
        noMatch: 'No matches found',
        matchCount: 'match(es)',
        groups: 'Groups',
        group: 'Group',
        fullMatch: 'Full Match',
        index: 'Index',
        explanation: 'Explanation',
        replace: 'Replace',
        replacePlaceholder: 'Replacement text…',
        replaceResult: 'Result',
        copy: 'Copy',
        copied: 'Copied!',
        clear: 'Clear',
        error: 'Error',
        cheatsheet: 'Cheat Sheet',
        examples: 'Examples',
        commonPatterns: 'Common Patterns',
        email: 'Email',
        url: 'URL',
        phone: 'Phone',
        ipAddress: 'IP Address',
        date: 'Date (DD/MM/YYYY)',
        hexColor: 'Hex Color',
        tab_test: 'Test',
        tab_replace: 'Replace',
        tab_explain: 'Explain',
        tab_cheatsheet: 'Cheat Sheet',
        charClass: 'Character Classes',
        quantifiers: 'Quantifiers',
        anchors: 'Anchors',
        groupsRef: 'Groups & References',
        lookaround: 'Lookaround'
      },
      de: {
        title: 'Regex-Tester',
        pattern: 'Regulärer Ausdruck',
        patternPlaceholder: 'Regex eingeben… z.B. \\d+',
        testString: 'Testtext',
        testPlaceholder: 'Text zum Testen eingeben…',
        flags: 'Flags',
        flagG: 'Global (g)',
        flagI: 'Groß-/Kleinschreibung ignorieren (i)',
        flagM: 'Mehrzeilig (m)',
        flagS: 'Punkt passt zu allem (s)',
        flagU: 'Unicode (u)',
        matches: 'Treffer',
        noMatch: 'Keine Treffer gefunden',
        matchCount: 'Treffer',
        groups: 'Gruppen',
        group: 'Gruppe',
        fullMatch: 'Vollständiger Treffer',
        index: 'Index',
        explanation: 'Erklärung',
        replace: 'Ersetzen',
        replacePlaceholder: 'Ersetzungstext…',
        replaceResult: 'Ergebnis',
        copy: 'Kopieren',
        copied: 'Kopiert!',
        clear: 'Löschen',
        error: 'Fehler',
        cheatsheet: 'Kurzreferenz',
        examples: 'Beispiele',
        commonPatterns: 'Gängige Muster',
        email: 'E-Mail',
        url: 'URL',
        phone: 'Telefon',
        ipAddress: 'IP-Adresse',
        date: 'Datum (TT/MM/JJJJ)',
        hexColor: 'Hex-Farbe',
        tab_test: 'Test',
        tab_replace: 'Ersetzen',
        tab_explain: 'Erklären',
        tab_cheatsheet: 'Referenz',
        charClass: 'Zeichenklassen',
        quantifiers: 'Quantoren',
        anchors: 'Anker',
        groupsRef: 'Gruppen & Referenzen',
        lookaround: 'Lookaround'
      },
      fr: {
        title: 'Testeur Regex',
        pattern: 'Expression Régulière',
        patternPlaceholder: 'Entrez votre regex… ex: \\d+',
        testString: 'Texte de test',
        testPlaceholder: 'Entrez le texte à tester…',
        flags: 'Drapeaux',
        flagG: 'Global (g)',
        flagI: 'Insensible à la casse (i)',
        flagM: 'Multiligne (m)',
        flagS: 'Le point correspond à tout (s)',
        flagU: 'Unicode (u)',
        matches: 'Correspondances',
        noMatch: 'Aucune correspondance',
        matchCount: 'correspondance(s)',
        groups: 'Groupes',
        group: 'Groupe',
        fullMatch: 'Correspondance complète',
        index: 'Index',
        explanation: 'Explication',
        replace: 'Remplacer',
        replacePlaceholder: 'Texte de remplacement…',
        replaceResult: 'Résultat',
        copy: 'Copier',
        copied: 'Copié!',
        clear: 'Effacer',
        error: 'Erreur',
        cheatsheet: 'Aide-mémoire',
        examples: 'Exemples',
        commonPatterns: 'Modèles courants',
        email: 'E-mail',
        url: 'URL',
        phone: 'Téléphone',
        ipAddress: 'Adresse IP',
        date: 'Date (JJ/MM/AAAA)',
        hexColor: 'Couleur Hex',
        tab_test: 'Test',
        tab_replace: 'Remplacer',
        tab_explain: 'Expliquer',
        tab_cheatsheet: 'Référence',
        charClass: 'Classes de caractères',
        quantifiers: 'Quantificateurs',
        anchors: 'Ancres',
        groupsRef: 'Groupes & Références',
        lookaround: 'Lookaround'
      }
    };

    LANGS.es = { ...LANGS.en, title: 'Probador Regex', tab_test: 'Probar', tab_replace: 'Reemplazar', tab_explain: 'Explicar', tab_cheatsheet: 'Referencia' };
    LANGS.ru = { ...LANGS.en, title: 'Тестер Regex', matches: 'Совпадения', noMatch: 'Совпадений не найдено' };
    LANGS.zh = { ...LANGS.en, title: '正则测试器', matches: '匹配结果', noMatch: '未找到匹配' };
    LANGS.ja = { ...LANGS.en, title: '正規表現テスター', matches: 'マッチ', noMatch: 'マッチなし' };
    LANGS.it = { ...LANGS.en, title: 'Tester Regex' };
    LANGS.ar = { ...LANGS.en, title: 'اختبار التعبيرات' };
    LANGS.ko = { ...LANGS.en, title: '정규식 테스터' };
    LANGS.hi = { ...LANGS.en, title: 'रीजेक्स टेस्टर' };
    LANGS.pt = { ...LANGS.en, title: 'Testador Regex' };

    const lang = ref((window.__CLOUD_LANG__ || 'tr').toLowerCase());
    const L = (key) => (LANGS[lang.value] || LANGS['en'])?.[key] || LANGS['en'][key] || key;

    /* ── State ── */
    const pattern = ref('');
    const testStr = ref('');
    const replaceStr = ref('');
    const activeTab = ref('test');
    const copiedFlag = ref(false);
    const errorMsg = ref('');

    // Flags
    const flagG = ref(true);
    const flagI = ref(false);
    const flagM = ref(false);
    const flagS = ref(false);
    const flagU = ref(false);

    const flagString = computed(() => {
      let f = '';
      if (flagG.value) f += 'g';
      if (flagI.value) f += 'i';
      if (flagM.value) f += 'm';
      if (flagS.value) f += 's';
      if (flagU.value) f += 'u';
      return f;
    });

    const regex = computed(() => {
      if (!pattern.value) return null;
      try {
        errorMsg.value = '';
        return new RegExp(pattern.value, flagString.value);
      } catch (e) {
        errorMsg.value = e.message;
        return null;
      }
    });

    /* ── Match results ── */
    const matchResults = computed(() => {
      if (!regex.value || !testStr.value) return [];
      const results = [];
      const re = new RegExp(regex.value.source, regex.value.flags);
      let m;
      let safety = 0;
      if (re.global) {
        while ((m = re.exec(testStr.value)) !== null && safety < 500) {
          safety++;
          results.push({
            value: m[0],
            index: m.index,
            length: m[0].length,
            groups: m.slice(1),
            namedGroups: m.groups || null
          });
          if (m[0].length === 0) re.lastIndex++;
        }
      } else {
        m = re.exec(testStr.value);
        if (m) {
          results.push({
            value: m[0],
            index: m.index,
            length: m[0].length,
            groups: m.slice(1),
            namedGroups: m.groups || null
          });
        }
      }
      return results;
    });

    /* ── Highlighted test string ── */
    const highlightedText = computed(() => {
      if (!regex.value || !testStr.value || matchResults.value.length === 0) {
        return escapeHtml(testStr.value);
      }
      const text = testStr.value;
      const matches = matchResults.value;
      let result = '';
      let lastIdx = 0;
      const colors = ['#a855f7', '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#06b6d4'];
      matches.forEach((m, i) => {
        if (m.index >= lastIdx) {
          result += escapeHtml(text.slice(lastIdx, m.index));
          result += '<mark class="rxt-hl" style="background:' + colors[i % colors.length] + '40;border-bottom:2px solid ' + colors[i % colors.length] + '">';
          result += escapeHtml(text.slice(m.index, m.index + m.length));
          result += '</mark>';
          lastIdx = m.index + m.length;
        }
      });
      result += escapeHtml(text.slice(lastIdx));
      return result;
    });

    function escapeHtml(str) {
      if (!str) return '';
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    /* ── Replace result ── */
    const replaceResult = computed(() => {
      if (!regex.value || !testStr.value) return '';
      try {
        return testStr.value.replace(regex.value, replaceStr.value);
      } catch { return ''; }
    });

    /* ── Regex explanation ── */
    const EXPLANATIONS = {
      tr: {
        '.': 'Herhangi bir karakter (satır sonu hariç)',
        '\\d': 'Herhangi bir rakam [0-9]',
        '\\D': 'Rakam olmayan karakter',
        '\\w': 'Kelime karakteri [a-zA-Z0-9_]',
        '\\W': 'Kelime karakteri olmayan',
        '\\s': 'Boşluk karakteri',
        '\\S': 'Boşluk olmayan karakter',
        '\\b': 'Kelime sınırı',
        '\\B': 'Kelime sınırı olmayan',
        '^': 'Satır/metin başı',
        '$': 'Satır/metin sonu',
        '*': '0 veya daha fazla tekrar',
        '+': '1 veya daha fazla tekrar',
        '?': '0 veya 1 tekrar (opsiyonel)',
        '|': 'VEYA (alternatif)',
        '\\': 'Kaçış karakteri',
        '()': 'Yakalama grubu',
        '(?:)': 'Yakalamayan grup',
        '(?=)': 'İleri bakınma (pozitif)',
        '(?!)': 'İleri bakınma (negatif)',
        '(?<=)': 'Geri bakınma (pozitif)',
        '(?<!)': 'Geri bakınma (negatif)',
        '[]': 'Karakter sınıfı',
        '[^]': 'Olumsuz karakter sınıfı',
        '{n}': 'Tam n tekrar',
        '{n,}': 'En az n tekrar',
        '{n,m}': 'n ile m arası tekrar'
      },
      en: {
        '.': 'Any character (except newline)',
        '\\d': 'Any digit [0-9]',
        '\\D': 'Non-digit character',
        '\\w': 'Word character [a-zA-Z0-9_]',
        '\\W': 'Non-word character',
        '\\s': 'Whitespace character',
        '\\S': 'Non-whitespace character',
        '\\b': 'Word boundary',
        '\\B': 'Non-word boundary',
        '^': 'Start of string/line',
        '$': 'End of string/line',
        '*': '0 or more repetitions',
        '+': '1 or more repetitions',
        '?': '0 or 1 (optional)',
        '|': 'OR (alternation)',
        '\\': 'Escape character',
        '()': 'Capturing group',
        '(?:)': 'Non-capturing group',
        '(?=)': 'Positive lookahead',
        '(?!)': 'Negative lookahead',
        '(?<=)': 'Positive lookbehind',
        '(?<!)': 'Negative lookbehind',
        '[]': 'Character class',
        '[^]': 'Negated character class',
        '{n}': 'Exactly n repetitions',
        '{n,}': 'At least n repetitions',
        '{n,m}': 'Between n and m repetitions'
      }
    };

    function getExplanations() {
      return EXPLANATIONS[lang.value] || EXPLANATIONS['en'];
    }

    /* ── Parse and explain a regex pattern ── */
    function explainPattern(pat) {
      if (!pat) return [];
      const expl = getExplanations();
      const tokens = [];
      let i = 0;
      while (i < pat.length) {
        // Escaped sequences
        if (pat[i] === '\\' && i + 1 < pat.length) {
          const seq = pat.slice(i, i + 2);
          tokens.push({ token: seq, desc: expl[seq] || (lang.value === 'tr' ? 'Kaçırılmış: ' + pat[i + 1] : 'Escaped: ' + pat[i + 1]) });
          i += 2;
          continue;
        }
        // Character class [...]
        if (pat[i] === '[') {
          let j = i + 1;
          if (j < pat.length && pat[j] === '^') j++;
          while (j < pat.length && pat[j] !== ']') {
            if (pat[j] === '\\') j++;
            j++;
          }
          const cls = pat.slice(i, j + 1);
          const isNeg = cls[1] === '^';
          tokens.push({ token: cls, desc: isNeg ? expl['[^]'] + ': ' + cls : expl['[]'] + ': ' + cls });
          i = j + 1;
          continue;
        }
        // Groups (...) 
        if (pat[i] === '(') {
          if (pat.slice(i, i + 3) === '(?:') {
            tokens.push({ token: '(?:', desc: expl['(?:)'] });
            i += 3; continue;
          }
          if (pat.slice(i, i + 3) === '(?=') {
            tokens.push({ token: '(?=', desc: expl['(?=)'] });
            i += 3; continue;
          }
          if (pat.slice(i, i + 3) === '(?!') {
            tokens.push({ token: '(?!', desc: expl['(?!)'] });
            i += 3; continue;
          }
          if (pat.slice(i, i + 4) === '(?<=') {
            tokens.push({ token: '(?<=', desc: expl['(?<=)'] });
            i += 4; continue;
          }
          if (pat.slice(i, i + 4) === '(?<!') {
            tokens.push({ token: '(?<!', desc: expl['(?<!)'] });
            i += 4; continue;
          }
          // Named group (?<name>)
          if (pat.slice(i, i + 3) === '(?<' && pat[i + 3] !== '=' && pat[i + 3] !== '!') {
            const endN = pat.indexOf('>', i + 3);
            if (endN !== -1) {
              const name = pat.slice(i + 3, endN);
              tokens.push({ token: pat.slice(i, endN + 1), desc: (lang.value === 'tr' ? 'Adlandırılmış grup: ' : 'Named group: ') + name });
              i = endN + 1; continue;
            }
          }
          tokens.push({ token: '(', desc: expl['()'] });
          i++; continue;
        }
        if (pat[i] === ')') {
          tokens.push({ token: ')', desc: lang.value === 'tr' ? 'Grup sonu' : 'End of group' });
          i++; continue;
        }
        // Quantifiers with braces {n}, {n,}, {n,m}
        if (pat[i] === '{') {
          const qm = pat.slice(i).match(/^\{(\d+)(?:(,)(\d*))?\}/);
          if (qm) {
            const tok = qm[0];
            let desc;
            if (qm[2] === undefined) desc = expl['{n}'].replace('n', qm[1]);
            else if (qm[3] === '') desc = expl['{n,}'].replace('n', qm[1]);
            else desc = expl['{n,m}'].replace('n', qm[1]).replace('m', qm[3]);
            tokens.push({ token: tok, desc });
            i += tok.length; continue;
          }
        }
        // Simple tokens
        const ch = pat[i];
        if (expl[ch]) {
          tokens.push({ token: ch, desc: expl[ch] });
        } else {
          tokens.push({ token: ch, desc: (lang.value === 'tr' ? 'Karakter: ' : 'Literal: ') + '"' + ch + '"' });
        }
        i++;
      }
      return tokens;
    }

    const explanationTokens = computed(() => explainPattern(pattern.value));

    /* ── Common patterns ── */
    const commonPatterns = computed(() => [
      { label: L('email'), pattern: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}', test: 'user@example.com' },
      { label: L('url'), pattern: 'https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+[\\w\\-.,@?^=%&:/~+#]*', test: 'https://example.com/path' },
      { label: L('phone'), pattern: '\\+?\\d{1,3}[\\s\\-]?\\(?\\d{1,4}\\)?[\\s\\-]?\\d{3,4}[\\s\\-]?\\d{2,4}', test: '+90 532 123 4567' },
      { label: L('ipAddress'), pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', test: '192.168.1.1' },
      { label: L('date'), pattern: '(0?[1-9]|[12]\\d|3[01])[\\/\\-](0?[1-9]|1[0-2])[\\/\\-]\\d{4}', test: '25/12/2024' },
      { label: L('hexColor'), pattern: '#([0-9a-fA-F]{3}){1,2}\\b', test: '#ff5733' }
    ]);

    /* ── Cheat sheet data ── */
    const cheatsheet = computed(() => [
      {
        title: L('charClass'),
        items: [
          { token: '.', desc: getExplanations()['.'] },
          { token: '\\d', desc: getExplanations()['\\d'] },
          { token: '\\D', desc: getExplanations()['\\D'] },
          { token: '\\w', desc: getExplanations()['\\w'] },
          { token: '\\W', desc: getExplanations()['\\W'] },
          { token: '\\s', desc: getExplanations()['\\s'] },
          { token: '\\S', desc: getExplanations()['\\S'] },
          { token: '[abc]', desc: lang.value === 'tr' ? 'a, b veya c' : 'a, b, or c' },
          { token: '[^abc]', desc: lang.value === 'tr' ? 'a, b, c hariç' : 'Not a, b, or c' },
          { token: '[a-z]', desc: lang.value === 'tr' ? 'a ile z arası' : 'a through z' }
        ]
      },
      {
        title: L('quantifiers'),
        items: [
          { token: '*', desc: getExplanations()['*'] },
          { token: '+', desc: getExplanations()['+'] },
          { token: '?', desc: getExplanations()['?'] },
          { token: '{3}', desc: getExplanations()['{n}'].replace('n', '3') },
          { token: '{3,}', desc: getExplanations()['{n,}'].replace('n', '3') },
          { token: '{3,5}', desc: getExplanations()['{n,m}'].replace('n', '3').replace('m', '5') },
          { token: '*?', desc: lang.value === 'tr' ? 'Tembel 0+' : 'Lazy 0+' },
          { token: '+?', desc: lang.value === 'tr' ? 'Tembel 1+' : 'Lazy 1+' }
        ]
      },
      {
        title: L('anchors'),
        items: [
          { token: '^', desc: getExplanations()['^'] },
          { token: '$', desc: getExplanations()['$'] },
          { token: '\\b', desc: getExplanations()['\\b'] },
          { token: '\\B', desc: getExplanations()['\\B'] }
        ]
      },
      {
        title: L('groupsRef'),
        items: [
          { token: '(abc)', desc: getExplanations()['()'] },
          { token: '(?:abc)', desc: getExplanations()['(?:)'] },
          { token: '(?<name>)', desc: lang.value === 'tr' ? 'Adlandırılmış grup' : 'Named group' },
          { token: '\\1', desc: lang.value === 'tr' ? 'Geri referans (grup 1)' : 'Back-reference (group 1)' },
          { token: 'a|b', desc: getExplanations()['|'] }
        ]
      },
      {
        title: L('lookaround'),
        items: [
          { token: '(?=abc)', desc: getExplanations()['(?=)'] },
          { token: '(?!abc)', desc: getExplanations()['(?!)'] },
          { token: '(?<=abc)', desc: getExplanations()['(?<=)'] },
          { token: '(?<!abc)', desc: getExplanations()['(?<!)'] }
        ]
      }
    ]);

    /* ── Actions ── */
    function loadExample(ex) {
      pattern.value = ex.pattern;
      testStr.value = ex.test;
      activeTab.value = 'test';
    }

    function insertToken(token) {
      pattern.value += token;
    }

    async function copyResult(text) {
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        copiedFlag.value = true;
        setTimeout(() => copiedFlag.value = false, 1500);
      } catch {}
    }

    function clearAll() {
      pattern.value = '';
      testStr.value = '';
      replaceStr.value = '';
      errorMsg.value = '';
    }

    /* ── Locale listener ── */
    function onLocaleChanged(e) {
      if (e.detail && e.detail.locale) lang.value = e.detail.locale;
    }
    onMounted(() => {
      window.addEventListener('locale-changed', onLocaleChanged);
      try { lang.value = localStorage.getItem('sys_locale') || 'tr'; } catch {}
    });
    onUnmounted(() => {
      window.removeEventListener('locale-changed', onLocaleChanged);
    });

    return {
      L, lang,
      pattern, testStr, replaceStr, activeTab,
      copiedFlag, errorMsg,
      flagG, flagI, flagM, flagS, flagU,
      flagString, regex,
      matchResults, highlightedText,
      replaceResult,
      explanationTokens,
      commonPatterns, cheatsheet,
      loadExample, insertToken, copyResult, clearAll
    };
  }
})