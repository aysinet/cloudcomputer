({
  setup() {
    const { ref, computed, onMounted, onUnmounted } = Vue;

    // ── Unit definitions ──
    const CATEGORIES = [
      { key:'length', icon:'📏' },
      { key:'weight', icon:'⚖️' },
      { key:'temperature', icon:'🌡️' },
      { key:'area', icon:'📐' },
      { key:'volume', icon:'🧪' },
      { key:'speed', icon:'🚀' },
      { key:'time', icon:'⏱️' },
      { key:'data', icon:'💾' },
      { key:'pressure', icon:'🔧' },
      { key:'energy', icon:'⚡' }
    ];

    // factor = multiply by this to convert to base unit
    const UNIT_DEFS = {
      length: {
        base: 'm',
        units: [
          { key:'mm', symbol:'mm', factor:0.001 },
          { key:'cm', symbol:'cm', factor:0.01 },
          { key:'m', symbol:'m', factor:1 },
          { key:'km', symbol:'km', factor:1000 },
          { key:'inch', symbol:'in', factor:0.0254 },
          { key:'foot', symbol:'ft', factor:0.3048 },
          { key:'yard', symbol:'yd', factor:0.9144 },
          { key:'mile', symbol:'mi', factor:1609.344 },
          { key:'nautical_mile', symbol:'nmi', factor:1852 }
        ]
      },
      weight: {
        base: 'kg',
        units: [
          { key:'mg', symbol:'mg', factor:0.000001 },
          { key:'g', symbol:'g', factor:0.001 },
          { key:'kg', symbol:'kg', factor:1 },
          { key:'ton', symbol:'t', factor:1000 },
          { key:'ounce', symbol:'oz', factor:0.0283495 },
          { key:'pound', symbol:'lb', factor:0.453592 },
          { key:'stone', symbol:'st', factor:6.35029 }
        ]
      },
      temperature: {
        base: 'celsius',
        units: [
          { key:'celsius', symbol:'°C', factor:null },
          { key:'fahrenheit', symbol:'°F', factor:null },
          { key:'kelvin', symbol:'K', factor:null }
        ]
      },
      area: {
        base: 'sqm',
        units: [
          { key:'sqmm', symbol:'mm²', factor:0.000001 },
          { key:'sqcm', symbol:'cm²', factor:0.0001 },
          { key:'sqm', symbol:'m²', factor:1 },
          { key:'hectare', symbol:'ha', factor:10000 },
          { key:'sqkm', symbol:'km²', factor:1000000 },
          { key:'sqinch', symbol:'in²', factor:0.00064516 },
          { key:'sqfoot', symbol:'ft²', factor:0.092903 },
          { key:'acre', symbol:'ac', factor:4046.86 },
          { key:'sqmile', symbol:'mi²', factor:2589988.11 }
        ]
      },
      volume: {
        base: 'liter',
        units: [
          { key:'ml', symbol:'mL', factor:0.001 },
          { key:'liter', symbol:'L', factor:1 },
          { key:'cubicm', symbol:'m³', factor:1000 },
          { key:'gallon_us', symbol:'gal(US)', factor:3.78541 },
          { key:'gallon_uk', symbol:'gal(UK)', factor:4.54609 },
          { key:'quart', symbol:'qt', factor:0.946353 },
          { key:'pint', symbol:'pt', factor:0.473176 },
          { key:'cup', symbol:'cup', factor:0.236588 },
          { key:'floz', symbol:'fl oz', factor:0.0295735 }
        ]
      },
      speed: {
        base: 'mps',
        units: [
          { key:'mps', symbol:'m/s', factor:1 },
          { key:'kmh', symbol:'km/h', factor:0.277778 },
          { key:'mph', symbol:'mph', factor:0.44704 },
          { key:'knot', symbol:'kn', factor:0.514444 },
          { key:'fps', symbol:'ft/s', factor:0.3048 }
        ]
      },
      time: {
        base: 'second',
        units: [
          { key:'ms', symbol:'ms', factor:0.001 },
          { key:'second', symbol:'s', factor:1 },
          { key:'minute', symbol:'min', factor:60 },
          { key:'hour', symbol:'h', factor:3600 },
          { key:'day', symbol:'d', factor:86400 },
          { key:'week', symbol:'wk', factor:604800 },
          { key:'month', symbol:'mo', factor:2592000 },
          { key:'year', symbol:'yr', factor:31536000 }
        ]
      },
      data: {
        base: 'byte',
        units: [
          { key:'bit', symbol:'b', factor:0.125 },
          { key:'byte', symbol:'B', factor:1 },
          { key:'kb', symbol:'KB', factor:1024 },
          { key:'mb', symbol:'MB', factor:1048576 },
          { key:'gb', symbol:'GB', factor:1073741824 },
          { key:'tb', symbol:'TB', factor:1099511627776 }
        ]
      },
      pressure: {
        base: 'pascal',
        units: [
          { key:'pascal', symbol:'Pa', factor:1 },
          { key:'kpa', symbol:'kPa', factor:1000 },
          { key:'bar', symbol:'bar', factor:100000 },
          { key:'atm', symbol:'atm', factor:101325 },
          { key:'psi', symbol:'psi', factor:6894.76 },
          { key:'mmhg', symbol:'mmHg', factor:133.322 }
        ]
      },
      energy: {
        base: 'joule',
        units: [
          { key:'joule', symbol:'J', factor:1 },
          { key:'kj', symbol:'kJ', factor:1000 },
          { key:'calorie', symbol:'cal', factor:4.184 },
          { key:'kcal', symbol:'kcal', factor:4184 },
          { key:'wh', symbol:'Wh', factor:3600 },
          { key:'kwh', symbol:'kWh', factor:3600000 },
          { key:'btu', symbol:'BTU', factor:1055.06 }
        ]
      }
    };

    // ── i18n ──
    const LANGS = {
      tr: {
        title:'Birim Dönüştürücü', category:'Kategori', from:'Kaynak', to:'Hedef',
        selectUnit:'Birim seç', formula:'Formül', quickRef:'Hızlı Referans', cancel:'İptal',
        cat_length:'Uzunluk', cat_weight:'Ağırlık', cat_temperature:'Sıcaklık',
        cat_area:'Alan', cat_volume:'Hacim', cat_speed:'Hız',
        cat_time:'Zaman', cat_data:'Veri', cat_pressure:'Basınç', cat_energy:'Enerji',
        unit_mm:'Milimetre', unit_cm:'Santimetre', unit_m:'Metre', unit_km:'Kilometre',
        unit_inch:'İnç', unit_foot:'Feet', unit_yard:'Yarda', unit_mile:'Mil', unit_nautical_mile:'Deniz Mili',
        unit_mg:'Miligram', unit_g:'Gram', unit_kg:'Kilogram', unit_ton:'Ton',
        unit_ounce:'Ons', unit_pound:'Pound', unit_stone:'Stone',
        unit_celsius:'Santigrat', unit_fahrenheit:'Fahrenheit', unit_kelvin:'Kelvin',
        unit_sqmm:'mm²', unit_sqcm:'cm²', unit_sqm:'m²', unit_hectare:'Hektar',
        unit_sqkm:'km²', unit_sqinch:'in²', unit_sqfoot:'ft²', unit_acre:'Dönüm(Acre)', unit_sqmile:'mi²',
        unit_ml:'Mililitre', unit_liter:'Litre', unit_cubicm:'m³',
        unit_gallon_us:'Galon(US)', unit_gallon_uk:'Galon(UK)', unit_quart:'Quart',
        unit_pint:'Pint', unit_cup:'Fincan', unit_floz:'Sıvı Ons',
        unit_mps:'m/s', unit_kmh:'km/sa', unit_mph:'mil/sa', unit_knot:'Knot', unit_fps:'ft/s',
        unit_ms:'Milisaniye', unit_second:'Saniye', unit_minute:'Dakika', unit_hour:'Saat',
        unit_day:'Gün', unit_week:'Hafta', unit_month:'Ay', unit_year:'Yıl',
        unit_bit:'Bit', unit_byte:'Bayt', unit_kb:'KB', unit_mb:'MB', unit_gb:'GB', unit_tb:'TB',
        unit_pascal:'Pascal', unit_kpa:'Kilopascal', unit_bar:'Bar', unit_atm:'Atmosfer', unit_psi:'PSI', unit_mmhg:'mmHg',
        unit_joule:'Joule', unit_kj:'Kilojoule', unit_calorie:'Kalori', unit_kcal:'Kilokalori',
        unit_wh:'Watt-saat', unit_kwh:'Kilowatt-saat', unit_btu:'BTU'
      },
      en: {
        title:'Unit Converter', category:'Category', from:'From', to:'To',
        selectUnit:'Select unit', formula:'Formula', quickRef:'Quick Reference', cancel:'Cancel',
        cat_length:'Length', cat_weight:'Weight', cat_temperature:'Temperature',
        cat_area:'Area', cat_volume:'Volume', cat_speed:'Speed',
        cat_time:'Time', cat_data:'Data', cat_pressure:'Pressure', cat_energy:'Energy',
        unit_mm:'Millimeter', unit_cm:'Centimeter', unit_m:'Meter', unit_km:'Kilometer',
        unit_inch:'Inch', unit_foot:'Foot', unit_yard:'Yard', unit_mile:'Mile', unit_nautical_mile:'Nautical Mile',
        unit_mg:'Milligram', unit_g:'Gram', unit_kg:'Kilogram', unit_ton:'Metric Ton',
        unit_ounce:'Ounce', unit_pound:'Pound', unit_stone:'Stone',
        unit_celsius:'Celsius', unit_fahrenheit:'Fahrenheit', unit_kelvin:'Kelvin',
        unit_sqmm:'mm²', unit_sqcm:'cm²', unit_sqm:'m²', unit_hectare:'Hectare',
        unit_sqkm:'km²', unit_sqinch:'in²', unit_sqfoot:'ft²', unit_acre:'Acre', unit_sqmile:'mi²',
        unit_ml:'Milliliter', unit_liter:'Liter', unit_cubicm:'m³',
        unit_gallon_us:'Gallon(US)', unit_gallon_uk:'Gallon(UK)', unit_quart:'Quart',
        unit_pint:'Pint', unit_cup:'Cup', unit_floz:'Fluid Ounce',
        unit_mps:'m/s', unit_kmh:'km/h', unit_mph:'mph', unit_knot:'Knot', unit_fps:'ft/s',
        unit_ms:'Millisecond', unit_second:'Second', unit_minute:'Minute', unit_hour:'Hour',
        unit_day:'Day', unit_week:'Week', unit_month:'Month', unit_year:'Year',
        unit_bit:'Bit', unit_byte:'Byte', unit_kb:'KB', unit_mb:'MB', unit_gb:'GB', unit_tb:'TB',
        unit_pascal:'Pascal', unit_kpa:'Kilopascal', unit_bar:'Bar', unit_atm:'Atmosphere', unit_psi:'PSI', unit_mmhg:'mmHg',
        unit_joule:'Joule', unit_kj:'Kilojoule', unit_calorie:'Calorie', unit_kcal:'Kilocalorie',
        unit_wh:'Watt-hour', unit_kwh:'Kilowatt-hour', unit_btu:'BTU'
      },
      de: {
        title:'Einheitenrechner', category:'Kategorie', from:'Von', to:'Nach',
        selectUnit:'Einheit wählen', formula:'Formel', quickRef:'Kurzreferenz', cancel:'Abbrechen',
        cat_length:'Länge', cat_weight:'Gewicht', cat_temperature:'Temperatur',
        cat_area:'Fläche', cat_volume:'Volumen', cat_speed:'Geschwindigkeit',
        cat_time:'Zeit', cat_data:'Daten', cat_pressure:'Druck', cat_energy:'Energie',
        unit_mm:'Millimeter', unit_cm:'Zentimeter', unit_m:'Meter', unit_km:'Kilometer',
        unit_inch:'Zoll', unit_foot:'Fuß', unit_yard:'Yard', unit_mile:'Meile', unit_nautical_mile:'Seemeile',
        unit_mg:'Milligramm', unit_g:'Gramm', unit_kg:'Kilogramm', unit_ton:'Tonne',
        unit_ounce:'Unze', unit_pound:'Pfund', unit_stone:'Stone',
        unit_celsius:'Celsius', unit_fahrenheit:'Fahrenheit', unit_kelvin:'Kelvin',
        unit_sqmm:'mm²', unit_sqcm:'cm²', unit_sqm:'m²', unit_hectare:'Hektar',
        unit_sqkm:'km²', unit_sqinch:'in²', unit_sqfoot:'ft²', unit_acre:'Acre', unit_sqmile:'mi²',
        unit_ml:'Milliliter', unit_liter:'Liter', unit_cubicm:'m³',
        unit_gallon_us:'Gallone(US)', unit_gallon_uk:'Gallone(UK)', unit_quart:'Quart',
        unit_pint:'Pint', unit_cup:'Tasse', unit_floz:'Flüssigunze',
        unit_mps:'m/s', unit_kmh:'km/h', unit_mph:'mph', unit_knot:'Knoten', unit_fps:'ft/s',
        unit_ms:'Millisekunde', unit_second:'Sekunde', unit_minute:'Minute', unit_hour:'Stunde',
        unit_day:'Tag', unit_week:'Woche', unit_month:'Monat', unit_year:'Jahr',
        unit_bit:'Bit', unit_byte:'Byte', unit_kb:'KB', unit_mb:'MB', unit_gb:'GB', unit_tb:'TB',
        unit_pascal:'Pascal', unit_kpa:'Kilopascal', unit_bar:'Bar', unit_atm:'Atmosphäre', unit_psi:'PSI', unit_mmhg:'mmHg',
        unit_joule:'Joule', unit_kj:'Kilojoule', unit_calorie:'Kalorie', unit_kcal:'Kilokalorie',
        unit_wh:'Wattstunde', unit_kwh:'Kilowattstunde', unit_btu:'BTU'
      },
      fr: {
        title:'Convertisseur d\'Unités', category:'Catégorie', from:'De', to:'Vers',
        selectUnit:'Choisir unité', formula:'Formule', quickRef:'Référence Rapide', cancel:'Annuler',
        cat_length:'Longueur', cat_weight:'Poids', cat_temperature:'Température',
        cat_area:'Surface', cat_volume:'Volume', cat_speed:'Vitesse',
        cat_time:'Temps', cat_data:'Données', cat_pressure:'Pression', cat_energy:'Énergie',
        unit_mm:'Millimètre', unit_cm:'Centimètre', unit_m:'Mètre', unit_km:'Kilomètre',
        unit_inch:'Pouce', unit_foot:'Pied', unit_yard:'Yard', unit_mile:'Mile', unit_nautical_mile:'Mille Marin',
        unit_mg:'Milligramme', unit_g:'Gramme', unit_kg:'Kilogramme', unit_ton:'Tonne',
        unit_ounce:'Once', unit_pound:'Livre', unit_stone:'Stone',
        unit_celsius:'Celsius', unit_fahrenheit:'Fahrenheit', unit_kelvin:'Kelvin',
        unit_sqmm:'mm²', unit_sqcm:'cm²', unit_sqm:'m²', unit_hectare:'Hectare',
        unit_sqkm:'km²', unit_sqinch:'in²', unit_sqfoot:'ft²', unit_acre:'Acre', unit_sqmile:'mi²',
        unit_ml:'Millilitre', unit_liter:'Litre', unit_cubicm:'m³',
        unit_gallon_us:'Gallon(US)', unit_gallon_uk:'Gallon(UK)', unit_quart:'Quart',
        unit_pint:'Pinte', unit_cup:'Tasse', unit_floz:'Once Liquide',
        unit_mps:'m/s', unit_kmh:'km/h', unit_mph:'mph', unit_knot:'Nœud', unit_fps:'ft/s',
        unit_ms:'Milliseconde', unit_second:'Seconde', unit_minute:'Minute', unit_hour:'Heure',
        unit_day:'Jour', unit_week:'Semaine', unit_month:'Mois', unit_year:'Année',
        unit_bit:'Bit', unit_byte:'Octet', unit_kb:'Ko', unit_mb:'Mo', unit_gb:'Go', unit_tb:'To',
        unit_pascal:'Pascal', unit_kpa:'Kilopascal', unit_bar:'Bar', unit_atm:'Atmosphère', unit_psi:'PSI', unit_mmhg:'mmHg',
        unit_joule:'Joule', unit_kj:'Kilojoule', unit_calorie:'Calorie', unit_kcal:'Kilocalorie',
        unit_wh:'Watt-heure', unit_kwh:'Kilowatt-heure', unit_btu:'BTU'
      },
      es: {
        title:'Conversor de Unidades', category:'Categoría', from:'De', to:'A',
        selectUnit:'Seleccionar unidad', formula:'Fórmula', quickRef:'Referencia Rápida', cancel:'Cancelar',
        cat_length:'Longitud', cat_weight:'Peso', cat_temperature:'Temperatura',
        cat_area:'Área', cat_volume:'Volumen', cat_speed:'Velocidad',
        cat_time:'Tiempo', cat_data:'Datos', cat_pressure:'Presión', cat_energy:'Energía',
        unit_mm:'Milímetro', unit_cm:'Centímetro', unit_m:'Metro', unit_km:'Kilómetro',
        unit_inch:'Pulgada', unit_foot:'Pie', unit_yard:'Yarda', unit_mile:'Milla', unit_nautical_mile:'Milla Náutica',
        unit_mg:'Miligramo', unit_g:'Gramo', unit_kg:'Kilogramo', unit_ton:'Tonelada',
        unit_ounce:'Onza', unit_pound:'Libra', unit_stone:'Stone',
        unit_celsius:'Celsius', unit_fahrenheit:'Fahrenheit', unit_kelvin:'Kelvin',
        unit_sqmm:'mm²', unit_sqcm:'cm²', unit_sqm:'m²', unit_hectare:'Hectárea',
        unit_sqkm:'km²', unit_sqinch:'in²', unit_sqfoot:'ft²', unit_acre:'Acre', unit_sqmile:'mi²',
        unit_ml:'Mililitro', unit_liter:'Litro', unit_cubicm:'m³',
        unit_gallon_us:'Galón(US)', unit_gallon_uk:'Galón(UK)', unit_quart:'Cuarto',
        unit_pint:'Pinta', unit_cup:'Taza', unit_floz:'Onza Líquida',
        unit_mps:'m/s', unit_kmh:'km/h', unit_mph:'mph', unit_knot:'Nudo', unit_fps:'ft/s',
        unit_ms:'Milisegundo', unit_second:'Segundo', unit_minute:'Minuto', unit_hour:'Hora',
        unit_day:'Día', unit_week:'Semana', unit_month:'Mes', unit_year:'Año',
        unit_bit:'Bit', unit_byte:'Byte', unit_kb:'KB', unit_mb:'MB', unit_gb:'GB', unit_tb:'TB',
        unit_pascal:'Pascal', unit_kpa:'Kilopascal', unit_bar:'Bar', unit_atm:'Atmósfera', unit_psi:'PSI', unit_mmhg:'mmHg',
        unit_joule:'Julio', unit_kj:'Kilojulio', unit_calorie:'Caloría', unit_kcal:'Kilocaloría',
        unit_wh:'Vatio-hora', unit_kwh:'Kilovatio-hora', unit_btu:'BTU'
      },
      ru: {
        title:'Конвертер Единиц', category:'Категория', from:'Из', to:'В',
        selectUnit:'Выберите единицу', formula:'Формула', quickRef:'Справка', cancel:'Отмена',
        cat_length:'Длина', cat_weight:'Вес', cat_temperature:'Температура',
        cat_area:'Площадь', cat_volume:'Объём', cat_speed:'Скорость',
        cat_time:'Время', cat_data:'Данные', cat_pressure:'Давление', cat_energy:'Энергия',
        unit_mm:'Миллиметр', unit_cm:'Сантиметр', unit_m:'Метр', unit_km:'Километр',
        unit_inch:'Дюйм', unit_foot:'Фут', unit_yard:'Ярд', unit_mile:'Миля', unit_nautical_mile:'Морская Миля',
        unit_mg:'Миллиграмм', unit_g:'Грамм', unit_kg:'Килограмм', unit_ton:'Тонна',
        unit_ounce:'Унция', unit_pound:'Фунт', unit_stone:'Стоун',
        unit_celsius:'Цельсий', unit_fahrenheit:'Фаренгейт', unit_kelvin:'Кельвин',
        unit_sqmm:'мм²', unit_sqcm:'см²', unit_sqm:'м²', unit_hectare:'Гектар',
        unit_sqkm:'км²', unit_sqinch:'дюйм²', unit_sqfoot:'фут²', unit_acre:'Акр', unit_sqmile:'миля²',
        unit_ml:'Миллилитр', unit_liter:'Литр', unit_cubicm:'м³',
        unit_gallon_us:'Галлон(US)', unit_gallon_uk:'Галлон(UK)', unit_quart:'Кварта',
        unit_pint:'Пинта', unit_cup:'Чашка', unit_floz:'Жидкая Унция',
        unit_mps:'м/с', unit_kmh:'км/ч', unit_mph:'миль/ч', unit_knot:'Узел', unit_fps:'фут/с',
        unit_ms:'Миллисекунда', unit_second:'Секунда', unit_minute:'Минута', unit_hour:'Час',
        unit_day:'День', unit_week:'Неделя', unit_month:'Месяц', unit_year:'Год',
        unit_bit:'Бит', unit_byte:'Байт', unit_kb:'КБ', unit_mb:'МБ', unit_gb:'ГБ', unit_tb:'ТБ',
        unit_pascal:'Паскаль', unit_kpa:'Килопаскаль', unit_bar:'Бар', unit_atm:'Атмосфера', unit_psi:'PSI', unit_mmhg:'мм рт.ст.',
        unit_joule:'Джоуль', unit_kj:'Килоджоуль', unit_calorie:'Калория', unit_kcal:'Килокалория',
        unit_wh:'Ватт-час', unit_kwh:'Киловатт-час', unit_btu:'BTU'
      }
    };

    function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }
    const locale = ref(getLocale());
    function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

    let localeTimer = null;

    // ── State ──
    const category = ref('length');
    const fromUnit = ref('');
    const toUnit = ref('');
    const fromValue = ref('');
    const toValue = ref('');
    const categories = CATEGORIES;

    const units = computed(() => {
      const def = UNIT_DEFS[category.value];
      return def ? def.units : [];
    });

    function onCategoryChange() {
      const u = units.value;
      fromUnit.value = u.length > 0 ? u[0].key : '';
      toUnit.value = u.length > 1 ? u[1].key : u.length > 0 ? u[0].key : '';
      fromValue.value = '';
      toValue.value = '';
    }

    // ── Conversion ──
    function convertTemp(val, from, to) {
      let c;
      if (from === 'celsius') c = val;
      else if (from === 'fahrenheit') c = (val - 32) * 5 / 9;
      else c = val - 273.15; // kelvin
      if (to === 'celsius') return c;
      if (to === 'fahrenheit') return c * 9 / 5 + 32;
      return c + 273.15; // kelvin
    }

    function convert(val, from, to, cat) {
      if (!val && val !== 0) return '';
      const v = parseFloat(val);
      if (isNaN(v)) return '';
      if (from === to) return formatNum(v);

      if (cat === 'temperature') return formatNum(convertTemp(v, from, to));

      const def = UNIT_DEFS[cat];
      if (!def) return '';
      const fromDef = def.units.find(u => u.key === from);
      const toDef = def.units.find(u => u.key === to);
      if (!fromDef || !toDef) return '';
      const base = v * fromDef.factor;
      return formatNum(base / toDef.factor);
    }

    function formatNum(n) {
      if (Number.isInteger(n)) return String(n);
      const abs = Math.abs(n);
      if (abs >= 1) return n.toFixed(6).replace(/\.?0+$/, '');
      if (abs >= 0.0001) return n.toFixed(8).replace(/\.?0+$/, '');
      return n.toExponential(4);
    }

    function convertFromTo() {
      toValue.value = convert(fromValue.value, fromUnit.value, toUnit.value, category.value);
    }

    function swapUnits() {
      const tmpU = fromUnit.value;
      const tmpV = fromValue.value;
      fromUnit.value = toUnit.value;
      toUnit.value = tmpU;
      fromValue.value = toValue.value;
      toValue.value = tmpV ? convert(toValue.value, fromUnit.value, toUnit.value, category.value) : '';
    }

    // ── Formula display ──
    const formulaText = computed(() => {
      if (!fromUnit.value || !toUnit.value || fromUnit.value === toUnit.value) return '';
      const cat = category.value;
      if (cat === 'temperature') {
        const f = fromUnit.value, t = toUnit.value;
        if (f === 'celsius' && t === 'fahrenheit') return '°F = °C × 9/5 + 32';
        if (f === 'fahrenheit' && t === 'celsius') return '°C = (°F − 32) × 5/9';
        if (f === 'celsius' && t === 'kelvin') return 'K = °C + 273.15';
        if (f === 'kelvin' && t === 'celsius') return '°C = K − 273.15';
        if (f === 'fahrenheit' && t === 'kelvin') return 'K = (°F − 32) × 5/9 + 273.15';
        if (f === 'kelvin' && t === 'fahrenheit') return '°F = (K − 273.15) × 9/5 + 32';
        return '';
      }
      const def = UNIT_DEFS[cat];
      if (!def) return '';
      const fd = def.units.find(u => u.key === fromUnit.value);
      const td = def.units.find(u => u.key === toUnit.value);
      if (!fd || !td) return '';
      const ratio = fd.factor / td.factor;
      return '1 ' + fd.symbol + ' = ' + formatNum(ratio) + ' ' + td.symbol;
    });

    // ── Quick reference ──
    const refTable = computed(() => {
      if (!fromUnit.value || !toUnit.value) return [];
      const vals = [1, 5, 10, 50, 100, 500, 1000];
      const cat = category.value;
      const fd = UNIT_DEFS[cat] && UNIT_DEFS[cat].units.find(u => u.key === fromUnit.value);
      const td = UNIT_DEFS[cat] && UNIT_DEFS[cat].units.find(u => u.key === toUnit.value);
      if (!fd || !td) return [];
      return vals.map(v => ({
        val: v,
        from: v + ' ' + fd.symbol,
        to: convert(v, fromUnit.value, toUnit.value, cat) + ' ' + td.symbol
      }));
    });

    onMounted(() => {
      onCategoryChange();
      localeTimer = setInterval(() => { locale.value = getLocale(); }, 1000);
    });
    onUnmounted(() => { if (localeTimer) clearInterval(localeTimer); });

    return {
      category, fromUnit, toUnit, fromValue, toValue, categories, units,
      onCategoryChange, convertFromTo, swapUnits,
      formulaText, refTable, L
    };
  }
})
