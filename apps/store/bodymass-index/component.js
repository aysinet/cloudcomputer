(function(Vue) {
  const { ref, computed, onMounted, onBeforeUnmount } = Vue;

  const LANGS = {
    tr: {
      title: 'Vücut Kitle İndeksi', subtitle: 'Boy ve kilonuzu girerek BMI değerinizi hesaplayın',
      height: 'Boy (cm)', weight: 'Kilo (kg)', age: 'Yaş', gender: 'Cinsiyet',
      male: 'Erkek', female: 'Kadın', calculate: 'Hesapla', reset: 'Sıfırla',
      result: 'Sonuç', bmi: 'BMI Değeri', category: 'Kategori', idealRange: 'İdeal Aralık',
      underweight: 'Zayıf', normal: 'Normal', overweight: 'Fazla Kilolu',
      obese1: 'Obez (Sınıf I)', obese2: 'Obez (Sınıf II)', obese3: 'Obez (Sınıf III)',
      fillFields: 'Lütfen boy ve kilo alanlarını doldurun'
    },
    en: {
      title: 'Body Mass Index', subtitle: 'Enter your height and weight to calculate your BMI',
      height: 'Height (cm)', weight: 'Weight (kg)', age: 'Age', gender: 'Gender',
      male: 'Male', female: 'Female', calculate: 'Calculate', reset: 'Reset',
      result: 'Result', bmi: 'BMI Value', category: 'Category', idealRange: 'Ideal Range',
      underweight: 'Underweight', normal: 'Normal', overweight: 'Overweight',
      obese1: 'Obese (Class I)', obese2: 'Obese (Class II)', obese3: 'Obese (Class III)',
      fillFields: 'Please fill in height and weight fields'
    },
    de: {
      title: 'Body-Mass-Index', subtitle: 'Geben Sie Größe und Gewicht ein, um Ihren BMI zu berechnen',
      height: 'Größe (cm)', weight: 'Gewicht (kg)', age: 'Alter', gender: 'Geschlecht',
      male: 'Männlich', female: 'Weiblich', calculate: 'Berechnen', reset: 'Zurücksetzen',
      result: 'Ergebnis', bmi: 'BMI-Wert', category: 'Kategorie', idealRange: 'Idealbereich',
      underweight: 'Untergewicht', normal: 'Normalgewicht', overweight: 'Übergewicht',
      obese1: 'Adipositas (Grad I)', obese2: 'Adipositas (Grad II)', obese3: 'Adipositas (Grad III)',
      fillFields: 'Bitte füllen Sie Größe und Gewicht aus'
    },
    fr: {
      title: 'Indice de Masse Corporelle', subtitle: 'Entrez votre taille et poids pour calculer votre IMC',
      height: 'Taille (cm)', weight: 'Poids (kg)', age: 'Âge', gender: 'Genre',
      male: 'Homme', female: 'Femme', calculate: 'Calculer', reset: 'Réinitialiser',
      result: 'Résultat', bmi: 'Valeur IMC', category: 'Catégorie', idealRange: 'Plage idéale',
      underweight: 'Insuffisance pondérale', normal: 'Normal', overweight: 'Surpoids',
      obese1: 'Obèse (Classe I)', obese2: 'Obèse (Classe II)', obese3: 'Obèse (Classe III)',
      fillFields: 'Veuillez remplir la taille et le poids'
    },
    es: {
      title: 'Índice de Masa Corporal', subtitle: 'Ingrese su altura y peso para calcular su IMC',
      height: 'Altura (cm)', weight: 'Peso (kg)', age: 'Edad', gender: 'Género',
      male: 'Masculino', female: 'Femenino', calculate: 'Calcular', reset: 'Restablecer',
      result: 'Resultado', bmi: 'Valor IMC', category: 'Categoría', idealRange: 'Rango ideal',
      underweight: 'Bajo peso', normal: 'Normal', overweight: 'Sobrepeso',
      obese1: 'Obeso (Clase I)', obese2: 'Obeso (Clase II)', obese3: 'Obeso (Clase III)',
      fillFields: 'Por favor complete la altura y el peso'
    },
    ru: {
      title: 'Индекс массы тела', subtitle: 'Введите рост и вес для расчёта ИМТ',
      height: 'Рост (см)', weight: 'Вес (кг)', age: 'Возраст', gender: 'Пол',
      male: 'Мужской', female: 'Женский', calculate: 'Рассчитать', reset: 'Сбросить',
      result: 'Результат', bmi: 'Значение ИМТ', category: 'Категория', idealRange: 'Идеальный диапазон',
      underweight: 'Недостаточный вес', normal: 'Норма', overweight: 'Избыточный вес',
      obese1: 'Ожирение (I степень)', obese2: 'Ожирение (II степень)', obese3: 'Ожирение (III степень)',
      fillFields: 'Пожалуйста, заполните рост и вес'
    },
    zh: {
      title: '身体质量指数', subtitle: '输入身高和体重计算BMI',
      height: '身高 (cm)', weight: '体重 (kg)', age: '年龄', gender: '性别',
      male: '男', female: '女', calculate: '计算', reset: '重置',
      result: '结果', bmi: 'BMI值', category: '类别', idealRange: '理想范围',
      underweight: '偏瘦', normal: '正常', overweight: '超重',
      obese1: '肥胖（I级）', obese2: '肥胖（II级）', obese3: '肥胖（III级）',
      fillFields: '请填写身高和体重'
    },
    ja: {
      title: 'ボディマス指数', subtitle: '身長と体重を入力してBMIを計算',
      height: '身長 (cm)', weight: '体重 (kg)', age: '年齢', gender: '性別',
      male: '男性', female: '女性', calculate: '計算', reset: 'リセット',
      result: '結果', bmi: 'BMI値', category: 'カテゴリ', idealRange: '理想範囲',
      underweight: '低体重', normal: '標準', overweight: '過体重',
      obese1: '肥満（I度）', obese2: '肥満（II度）', obese3: '肥満（III度）',
      fillFields: '身長と体重を入力してください'
    },
    it: {
      title: 'Indice di Massa Corporea', subtitle: 'Inserisci altezza e peso per calcolare il BMI',
      height: 'Altezza (cm)', weight: 'Peso (kg)', age: 'Età', gender: 'Genere',
      male: 'Maschio', female: 'Femmina', calculate: 'Calcola', reset: 'Resetta',
      result: 'Risultato', bmi: 'Valore BMI', category: 'Categoria', idealRange: 'Range ideale',
      underweight: 'Sottopeso', normal: 'Normopeso', overweight: 'Sovrappeso',
      obese1: 'Obeso (Classe I)', obese2: 'Obeso (Classe II)', obese3: 'Obeso (Classe III)',
      fillFields: 'Inserisci altezza e peso'
    },
    ar: {
      title: 'مؤشر كتلة الجسم', subtitle: 'أدخل طولك ووزنك لحساب مؤشر كتلة الجسم',
      height: 'الطول (سم)', weight: 'الوزن (كجم)', age: 'العمر', gender: 'الجنس',
      male: 'ذكر', female: 'أنثى', calculate: 'حساب', reset: 'إعادة تعيين',
      result: 'النتيجة', bmi: 'قيمة BMI', category: 'الفئة', idealRange: 'النطاق المثالي',
      underweight: 'نقص الوزن', normal: 'طبيعي', overweight: 'زيادة الوزن',
      obese1: 'سمنة (درجة أولى)', obese2: 'سمنة (درجة ثانية)', obese3: 'سمنة (درجة ثالثة)',
      fillFields: 'يرجى ملء الطول والوزن'
    },
    ko: {
      title: '체질량지수', subtitle: '신장과 체중을 입력하여 BMI를 계산하세요',
      height: '신장 (cm)', weight: '체중 (kg)', age: '나이', gender: '성별',
      male: '남성', female: '여성', calculate: '계산', reset: '초기화',
      result: '결과', bmi: 'BMI 값', category: '분류', idealRange: '이상적 범위',
      underweight: '저체중', normal: '정상', overweight: '과체중',
      obese1: '비만 (1단계)', obese2: '비만 (2단계)', obese3: '비만 (3단계)',
      fillFields: '신장과 체중을 입력해 주세요'
    },
    hi: {
      title: 'बॉडी मास इंडेक्स', subtitle: 'BMI की गणना के लिए ऊँचाई और वजन दर्ज करें',
      height: 'ऊँचाई (cm)', weight: 'वजन (kg)', age: 'आयु', gender: 'लिंग',
      male: 'पुरुष', female: 'महिला', calculate: 'गणना करें', reset: 'रीसेट',
      result: 'परिणाम', bmi: 'BMI मान', category: 'श्रेणी', idealRange: 'आदर्श सीमा',
      underweight: 'कम वजन', normal: 'सामान्य', overweight: 'अधिक वजन',
      obese1: 'मोटापा (श्रेणी I)', obese2: 'मोटापा (श्रेणी II)', obese3: 'मोटापा (श्रेणी III)',
      fillFields: 'कृपया ऊँचाई और वजन भरें'
    },
    pt: {
      title: 'Índice de Massa Corporal', subtitle: 'Insira sua altura e peso para calcular o IMC',
      height: 'Altura (cm)', weight: 'Peso (kg)', age: 'Idade', gender: 'Gênero',
      male: 'Masculino', female: 'Feminino', calculate: 'Calcular', reset: 'Redefinir',
      result: 'Resultado', bmi: 'Valor IMC', category: 'Categoria', idealRange: 'Faixa ideal',
      underweight: 'Abaixo do peso', normal: 'Normal', overweight: 'Sobrepeso',
      obese1: 'Obeso (Classe I)', obese2: 'Obeso (Classe II)', obese3: 'Obeso (Classe III)',
      fillFields: 'Por favor preencha altura e peso'
    }
  };

  const BMI_CATEGORIES = [
    { max: 18.5, key: 'underweight', color: '#74b9ff' },
    { max: 25,   key: 'normal',      color: '#00b894' },
    { max: 30,   key: 'overweight',   color: '#fdcb6e' },
    { max: 35,   key: 'obese1',       color: '#e17055' },
    { max: 40,   key: 'obese2',       color: '#d63031' },
    { max: Infinity, key: 'obese3',   color: '#6c5ce7' }
  ];

  return {
    setup() {
      const locale = ref(localStorage.getItem('sys_locale') || 'en');
      const t = computed(() => LANGS[locale.value] || LANGS.en);

      const height = ref('');
      const weight = ref('');
      const age = ref('');
      const gender = ref('male');
      const bmiValue = ref(null);
      const showResult = ref(false);

      const bmiCategory = computed(() => {
        if (bmiValue.value === null) return null;
        return BMI_CATEGORIES.find(c => bmiValue.value < c.max) || BMI_CATEGORIES[BMI_CATEGORIES.length - 1];
      });

      const bmiLabel = computed(() => {
        if (!bmiCategory.value) return '';
        return t.value[bmiCategory.value.key] || bmiCategory.value.key;
      });

      const bmiColor = computed(() => {
        return bmiCategory.value ? bmiCategory.value.color : '#00b894';
      });

      const idealWeight = computed(() => {
        const h = parseFloat(height.value);
        if (!h || h <= 0) return null;
        const hm = h / 100;
        return { min: (18.5 * hm * hm).toFixed(1), max: (24.9 * hm * hm).toFixed(1) };
      });

      const gaugePercent = computed(() => {
        if (bmiValue.value === null) return 0;
        // Map BMI 10-50 to 0-100%
        const pct = ((bmiValue.value - 10) / 40) * 100;
        return Math.max(0, Math.min(100, pct));
      });

      function calculate() {
        const h = parseFloat(height.value);
        const w = parseFloat(weight.value);
        if (!h || !w || h <= 0 || w <= 0) { bmiValue.value = null; showResult.value = false; return; }
        const hm = h / 100;
        bmiValue.value = parseFloat((w / (hm * hm)).toFixed(1));
        showResult.value = true;
      }

      function reset() {
        height.value = '';
        weight.value = '';
        age.value = '';
        gender.value = 'male';
        bmiValue.value = null;
        showResult.value = false;
      }

      function onLocaleChanged(e) {
        if (e.detail && e.detail.locale) locale.value = e.detail.locale;
      }
      onMounted(() => { window.addEventListener('locale-changed', onLocaleChanged); });
      onBeforeUnmount(() => { window.removeEventListener('locale-changed', onLocaleChanged); });

      return {
        t, height, weight, age, gender,
        bmiValue, bmiLabel, bmiColor, idealWeight, gaugePercent, showResult,
        calculate, reset
      };
    }
  };
})(Vue);
