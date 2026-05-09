(function(Vue) {
  const { ref, computed, onMounted, onUnmounted } = Vue;

  const LANGS = {
    tr: {
      title: 'Font Görüntüleyici',
      compare: 'Karşılaştır',
      catalog: 'Katalog',
      waterfall: 'Şelale',
      sampleText: 'Örnek Metin',
      typeHere: 'Metin yazın...',
      fontSize: 'Boyut',
      fontWeight: 'Kalınlık',
      fontStyle: 'Stil',
      color: 'Renk',
      bgColor: 'Arka Plan',
      searchFont: 'Font ara...',
      allCategories: 'Tüm Kategoriler',
      system: 'Sistem',
      addPanel: 'Panel Ekle',
      glyphs: 'Karakterler',
      letterSpacing: 'Harf Aralığı',
      lineHeight: 'Satır Yüksekliği',
      totalFonts: 'Toplam Font',
      showing: 'Gösterilen',
      noResults: 'Sonuç bulunamadı',
      defaultSample: 'Hızlı kahverengi tilki tembel köpeğin üzerinden atladı.'
    },
    en: {
      title: 'Font Viewer',
      compare: 'Compare',
      catalog: 'Catalog',
      waterfall: 'Waterfall',
      sampleText: 'Sample Text',
      typeHere: 'Type here...',
      fontSize: 'Size',
      fontWeight: 'Weight',
      fontStyle: 'Style',
      color: 'Color',
      bgColor: 'Background',
      searchFont: 'Search font...',
      allCategories: 'All Categories',
      system: 'System',
      addPanel: 'Add Panel',
      glyphs: 'Glyphs',
      letterSpacing: 'Letter Spacing',
      lineHeight: 'Line Height',
      totalFonts: 'Total Fonts',
      showing: 'Showing',
      noResults: 'No results found',
      defaultSample: 'The quick brown fox jumps over the lazy dog.'
    },
    de: {
      title: 'Schriftarten-Viewer',
      compare: 'Vergleichen',
      catalog: 'Katalog',
      waterfall: 'Wasserfall',
      sampleText: 'Beispieltext',
      typeHere: 'Text eingeben...',
      fontSize: 'Größe',
      fontWeight: 'Gewicht',
      fontStyle: 'Stil',
      color: 'Farbe',
      bgColor: 'Hintergrund',
      searchFont: 'Schriftart suchen...',
      allCategories: 'Alle Kategorien',
      system: 'System',
      addPanel: 'Panel hinzufügen',
      glyphs: 'Zeichen',
      letterSpacing: 'Zeichenabstand',
      lineHeight: 'Zeilenhöhe',
      totalFonts: 'Gesamt',
      showing: 'Angezeigt',
      noResults: 'Keine Ergebnisse',
      defaultSample: 'Franz jagt im komplett verwahrlosten Taxi quer durch Bayern.'
    },
    fr: {
      title: 'Visionneuse de polices',
      compare: 'Comparer',
      catalog: 'Catalogue',
      waterfall: 'Cascade',
      sampleText: 'Texte exemple',
      typeHere: 'Tapez ici...',
      fontSize: 'Taille',
      fontWeight: 'Graisse',
      fontStyle: 'Style',
      color: 'Couleur',
      bgColor: 'Arrière-plan',
      searchFont: 'Rechercher une police...',
      allCategories: 'Toutes les catégories',
      system: 'Système',
      addPanel: 'Ajouter un panneau',
      glyphs: 'Glyphes',
      letterSpacing: 'Espacement des lettres',
      lineHeight: 'Hauteur de ligne',
      totalFonts: 'Total polices',
      showing: 'Affichées',
      noResults: 'Aucun résultat',
      defaultSample: 'Portez ce vieux whisky au juge blond qui fume.'
    },
    es: {
      title: 'Visor de fuentes',
      compare: 'Comparar',
      catalog: 'Catálogo',
      waterfall: 'Cascada',
      sampleText: 'Texto de ejemplo',
      typeHere: 'Escriba aquí...',
      fontSize: 'Tamaño',
      fontWeight: 'Grosor',
      fontStyle: 'Estilo',
      color: 'Color',
      bgColor: 'Fondo',
      searchFont: 'Buscar fuente...',
      allCategories: 'Todas las categorías',
      system: 'Sistema',
      addPanel: 'Añadir panel',
      glyphs: 'Glifos',
      letterSpacing: 'Espaciado',
      lineHeight: 'Altura de línea',
      totalFonts: 'Total fuentes',
      showing: 'Mostrando',
      noResults: 'Sin resultados',
      defaultSample: 'El veloz murciélago hindú comía feliz cardillo y kiwi.'
    },
    ru: {
      title: 'Просмотр шрифтов',
      compare: 'Сравнить',
      catalog: 'Каталог',
      waterfall: 'Каскад',
      sampleText: 'Пример текста',
      typeHere: 'Введите текст...',
      fontSize: 'Размер',
      fontWeight: 'Насыщенность',
      fontStyle: 'Стиль',
      color: 'Цвет',
      bgColor: 'Фон',
      searchFont: 'Поиск шрифта...',
      allCategories: 'Все категории',
      system: 'Система',
      addPanel: 'Добавить панель',
      glyphs: 'Глифы',
      letterSpacing: 'Межбуквенный',
      lineHeight: 'Высота строки',
      totalFonts: 'Всего шрифтов',
      showing: 'Показано',
      noResults: 'Ничего не найдено',
      defaultSample: 'Съешь ещё этих мягких французских булок, да выпей же чаю.'
    },
    zh: {
      title: '字体查看器',
      compare: '比较',
      catalog: '目录',
      waterfall: '瀑布',
      sampleText: '示例文本',
      typeHere: '在此输入...',
      fontSize: '大小',
      fontWeight: '粗细',
      fontStyle: '样式',
      color: '颜色',
      bgColor: '背景',
      searchFont: '搜索字体...',
      allCategories: '所有类别',
      system: '系统',
      addPanel: '添加面板',
      glyphs: '字形',
      letterSpacing: '字间距',
      lineHeight: '行高',
      totalFonts: '总字体数',
      showing: '显示',
      noResults: '未找到结果',
      defaultSample: '天地玄黄，宇宙洪荒。日月盈昃，辰宿列张。'
    },
    ja: {
      title: 'フォントビューア',
      compare: '比較',
      catalog: 'カタログ',
      waterfall: 'ウォーターフォール',
      sampleText: 'サンプルテキスト',
      typeHere: 'ここに入力...',
      fontSize: 'サイズ',
      fontWeight: '太さ',
      fontStyle: 'スタイル',
      color: '色',
      bgColor: '背景',
      searchFont: 'フォント検索...',
      allCategories: 'すべてのカテゴリ',
      system: 'システム',
      addPanel: 'パネル追加',
      glyphs: 'グリフ',
      letterSpacing: '文字間隔',
      lineHeight: '行の高さ',
      totalFonts: 'フォント総数',
      showing: '表示中',
      noResults: '結果なし',
      defaultSample: 'いろはにほへと ちりぬるを わかよたれそ つねならむ'
    },
    it: {
      title: 'Visualizzatore font',
      compare: 'Confronta',
      catalog: 'Catalogo',
      waterfall: 'Cascata',
      sampleText: 'Testo di esempio',
      typeHere: 'Scrivi qui...',
      fontSize: 'Dimensione',
      fontWeight: 'Peso',
      fontStyle: 'Stile',
      color: 'Colore',
      bgColor: 'Sfondo',
      searchFont: 'Cerca font...',
      allCategories: 'Tutte le categorie',
      system: 'Sistema',
      addPanel: 'Aggiungi pannello',
      glyphs: 'Glifi',
      letterSpacing: 'Spaziatura',
      lineHeight: 'Altezza riga',
      totalFonts: 'Totale font',
      showing: 'Mostrati',
      noResults: 'Nessun risultato',
      defaultSample: 'Ma la volpe col suo balzo ha raggiunto il quieto Fido.'
    },
    ar: {
      title: 'عارض الخطوط',
      compare: 'مقارنة',
      catalog: 'الكتالوج',
      waterfall: 'شلال',
      sampleText: 'نص تجريبي',
      typeHere: 'اكتب هنا...',
      fontSize: 'الحجم',
      fontWeight: 'السُمك',
      fontStyle: 'النمط',
      color: 'اللون',
      bgColor: 'الخلفية',
      searchFont: 'بحث عن خط...',
      allCategories: 'جميع الفئات',
      system: 'النظام',
      addPanel: 'إضافة لوحة',
      glyphs: 'الحروف',
      letterSpacing: 'تباعد الأحرف',
      lineHeight: 'ارتفاع السطر',
      totalFonts: 'إجمالي الخطوط',
      showing: 'معروض',
      noResults: 'لا توجد نتائج',
      defaultSample: 'نص حكيم له سر قاطع وذو شأن عظيم مكتوب على ثوب أخضر ومغلف بجلد أزرق.'
    },
    ko: {
      title: '글꼴 뷰어',
      compare: '비교',
      catalog: '카탈로그',
      waterfall: '폭포',
      sampleText: '샘플 텍스트',
      typeHere: '여기에 입력...',
      fontSize: '크기',
      fontWeight: '굵기',
      fontStyle: '스타일',
      color: '색상',
      bgColor: '배경',
      searchFont: '글꼴 검색...',
      allCategories: '모든 카테고리',
      system: '시스템',
      addPanel: '패널 추가',
      glyphs: '글리프',
      letterSpacing: '자간',
      lineHeight: '줄 높이',
      totalFonts: '총 글꼴',
      showing: '표시 중',
      noResults: '결과 없음',
      defaultSample: '다람쥐 헌 쳇바퀴에 타고파.'
    },
    hi: {
      title: 'फ़ॉन्ट व्यूअर',
      compare: 'तुलना',
      catalog: 'कैटलॉग',
      waterfall: 'झरना',
      sampleText: 'नमूना पाठ',
      typeHere: 'यहाँ टाइप करें...',
      fontSize: 'आकार',
      fontWeight: 'मोटाई',
      fontStyle: 'शैली',
      color: 'रंग',
      bgColor: 'पृष्ठभूमि',
      searchFont: 'फ़ॉन्ट खोजें...',
      allCategories: 'सभी श्रेणियाँ',
      system: 'सिस्टम',
      addPanel: 'पैनल जोड़ें',
      glyphs: 'ग्लिफ़',
      letterSpacing: 'अक्षर रिक्ति',
      lineHeight: 'पंक्ति ऊँचाई',
      totalFonts: 'कुल फ़ॉन्ट',
      showing: 'दिखाए गए',
      noResults: 'कोई परिणाम नहीं',
      defaultSample: 'ऊँट चढ़ा पहाड़, बकरी ने खाई घास।'
    },
    pt: {
      title: 'Visualizador de fontes',
      compare: 'Comparar',
      catalog: 'Catálogo',
      waterfall: 'Cascata',
      sampleText: 'Texto de exemplo',
      typeHere: 'Digite aqui...',
      fontSize: 'Tamanho',
      fontWeight: 'Peso',
      fontStyle: 'Estilo',
      color: 'Cor',
      bgColor: 'Fundo',
      searchFont: 'Buscar fonte...',
      allCategories: 'Todas as categorias',
      system: 'Sistema',
      addPanel: 'Adicionar painel',
      glyphs: 'Glifos',
      letterSpacing: 'Espaçamento',
      lineHeight: 'Altura da linha',
      totalFonts: 'Total de fontes',
      showing: 'Exibindo',
      noResults: 'Nenhum resultado',
      defaultSample: 'À noite, vovô Kowalsky vê o ímã cair no pé do pinguim queixoso e vsjsjdê.'
    }
  };

  const FONT_DB = {
    serif: [
      'Georgia', 'Times New Roman', 'Palatino Linotype', 'Book Antiqua',
      'Garamond', 'Cambria', 'Constantia', 'Didot', 'Baskerville',
      'Hoefler Text', 'Bodoni MT', 'Calisto MT', 'Rockwell',
      'Century Schoolbook', 'Goudy Old Style', 'Perpetua'
    ],
    'sans-serif': [
      'Arial', 'Helvetica', 'Verdana', 'Tahoma', 'Trebuchet MS',
      'Segoe UI', 'Calibri', 'Candara', 'Optima', 'Gill Sans',
      'Franklin Gothic Medium', 'Century Gothic', 'Lucida Sans',
      'Corbel', 'Bahnschrift', 'Aptos'
    ],
    monospace: [
      'Courier New', 'Consolas', 'Lucida Console', 'Monaco',
      'Cascadia Code', 'Cascadia Mono', 'JetBrains Mono',
      'Fira Code', 'Source Code Pro', 'Ubuntu Mono',
      'Menlo', 'Andale Mono', 'OCR A Extended'
    ],
    cursive: [
      'Comic Sans MS', 'Brush Script MT', 'Lucida Handwriting',
      'Segoe Script', 'Script MT Bold', 'Palace Script MT',
      'Freestyle Script', 'French Script MT', 'Edwardian Script ITC',
      'Mistral', 'Monotype Corsiva'
    ],
    fantasy: [
      'Impact', 'Papyrus', 'Copperplate', 'Harrington',
      'Algerian', 'Castellar', 'Stencil', 'Jokerman',
      'Ravie', 'Showcard Gothic', 'Snap ITC'
    ],
    system: [
      'system-ui', '-apple-system', 'BlinkMacSystemFont',
      'Segoe UI Variable', 'Noto Sans', 'Roboto', 'Inter',
      'SF Pro Display', 'Apple Color Emoji', 'Segoe UI Emoji'
    ]
  };

  function getLocale() {
    try { return localStorage.getItem('sys_locale') || 'tr'; }
    catch { return 'tr'; }
  }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) {
        return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k;
      }

      // Mode: compare, catalog, waterfall
      const mode = ref('compare');

      // Typography settings
      const sampleText = ref('');
      const fontSize = ref(36);
      const fontWeight = ref(400);
      const fontStyle = ref('normal');
      const textColor = ref('#e1e4ea');
      const bgColor = ref('#1a1a2e');
      const letterSpacing = ref(0);
      const lineHeight = ref(1.4);
      const showGlyphs = ref(false);

      // Search & filter
      const searchQuery = ref('');
      const categoryFilter = ref('all');

      // All fonts flat list
      const allFonts = computed(() => {
        const all = [];
        for (const cat in FONT_DB) {
          for (const f of FONT_DB[cat]) {
            if (!all.includes(f)) all.push(f);
          }
        }
        return all.sort();
      });

      // Font categories for grouped selects
      const fontCategories = computed(() => {
        return Object.keys(FONT_DB).map(k => ({
          key: k,
          label: k.charAt(0).toUpperCase() + k.slice(1),
          fonts: FONT_DB[k]
        }));
      });

      // Filtered fonts for catalog
      const filteredFonts = computed(() => {
        let fonts;
        if (categoryFilter.value === 'all') {
          fonts = allFonts.value;
        } else {
          fonts = FONT_DB[categoryFilter.value] || [];
        }
        if (searchQuery.value.trim()) {
          const q = searchQuery.value.toLowerCase();
          fonts = fonts.filter(f => f.toLowerCase().includes(q));
        }
        return fonts;
      });

      function getFontCategory(font) {
        for (const cat in FONT_DB) {
          if (FONT_DB[cat].includes(font)) return cat;
        }
        return 'unknown';
      }

      // Compare panels
      const comparePanels = ref([
        { font: 'Segoe UI' },
        { font: 'Georgia' },
        { font: 'Consolas' }
      ]);

      function addPanel() {
        if (comparePanels.value.length < 6) {
          const used = comparePanels.value.map(p => p.font);
          const next = allFonts.value.find(f => !used.includes(f)) || 'Arial';
          comparePanels.value.push({ font: next });
        }
      }

      function removePanel(idx) {
        if (comparePanels.value.length > 2) {
          comparePanels.value.splice(idx, 1);
        }
      }

      function selectFontForCompare(font) {
        mode.value = 'compare';
        const existing = comparePanels.value.find(p => p.font === font);
        if (!existing) {
          if (comparePanels.value.length < 6) {
            comparePanels.value.push({ font });
          } else {
            comparePanels.value[comparePanels.value.length - 1].font = font;
          }
        }
      }

      // Waterfall
      const waterfallFont = ref('Segoe UI');
      const waterfallSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72, 84, 96];

      // Locale change listener
      function onLocaleChanged() {
        locale.value = getLocale();
      }

      onMounted(() => {
        window.addEventListener('locale-changed', onLocaleChanged);
      });

      onUnmounted(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
      });

      return {
        locale, L,
        mode,
        sampleText, fontSize, fontWeight, fontStyle,
        textColor, bgColor, letterSpacing, lineHeight,
        showGlyphs,
        searchQuery, categoryFilter,
        allFonts, fontCategories, filteredFonts,
        getFontCategory,
        comparePanels, addPanel, removePanel,
        selectFontForCompare,
        waterfallFont, waterfallSizes
      };
    }
  };
})(Vue);
