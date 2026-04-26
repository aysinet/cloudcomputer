({
  setup() {
    const { ref, computed, watch, onMounted, onUnmounted, nextTick } = Vue;
    const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success(){}, error(){}, warning(){} };
    const ElMessageBox = (window.ElementPlus && window.ElementPlus.ElMessageBox) || { confirm: () => Promise.resolve() };

    /* ── i18n ── */
    const LANGS = {
      tr: {
        title:'Formül Editörü', latex:'LaTeX Kodu', preview:'Önizleme', symbols:'Semboller',
        library:'Kütüphane', myFormulas:'Formüllerim', save:'Kaydet', delete:'Sil',
        exportPng:'PNG olarak kaydet', exportSvg:'SVG olarak kaydet', exportLatex:'LaTeX olarak kaydet',
        exportMathml:'MathML olarak kaydet', exportMenu:'Dışa Aktar', copy:'Kopyala',
        copyLatex:'LaTeX Kopyala', copyMathml:'MathML Kopyala',
        name:'İsim', nameRequired:'İsim gerekli', saved:'Kaydedildi', deleted:'Silindi',
        copied:'Panoya kopyalandı', deleteConfirm:'Bu formülü silmek istediğinize emin misiniz?',
        yes:'Evet', cancel:'İptal', noFormulas:'Henüz formül yok',
        loading:'KaTeX yükleniyor...', error:'Hata', placeholder:'LaTeX kodu yazın...',
        namePlaceholder:'Formül adı', fontSize:'Yazı boyutu', color:'Renk',
        bgColor:'Arka plan', transparent:'Şeffaf', padding:'Dolgu',
        catBasic:'Temel', catGreek:'Yunan', catOps:'Operatörler', catRel:'İlişkiler',
        catArrows:'Oklar', catSets:'Kümeler', catCalc:'Kalkülüs', catMatrix:'Matris',
        catTrig:'Trigonometri', catMisc:'Diğer',
        libAlgebra:'Cebir', libCalc:'Kalkülüs', libGeom:'Geometri', libStats:'İstatistik',
        libPhysics:'Fizik', libLinAlg:'Lineer Cebir',
        saveToServer:'Sunucuya Kaydet', savedToServer:'Sunucuya kaydedildi',
        loadError:'Formüller yüklenemedi', insertTemplate:'Şablon Ekle'
      },
      en: {
        title:'Formula Editor', latex:'LaTeX Code', preview:'Preview', symbols:'Symbols',
        library:'Library', myFormulas:'My Formulas', save:'Save', delete:'Delete',
        exportPng:'Save as PNG', exportSvg:'Save as SVG', exportLatex:'Save as LaTeX',
        exportMathml:'Save as MathML', exportMenu:'Export', copy:'Copy',
        copyLatex:'Copy LaTeX', copyMathml:'Copy MathML',
        name:'Name', nameRequired:'Name is required', saved:'Saved', deleted:'Deleted',
        copied:'Copied to clipboard', deleteConfirm:'Are you sure you want to delete this formula?',
        yes:'Yes', cancel:'Cancel', noFormulas:'No formulas yet',
        loading:'Loading KaTeX...', error:'Error', placeholder:'Type LaTeX code...',
        namePlaceholder:'Formula name', fontSize:'Font size', color:'Color',
        bgColor:'Background', transparent:'Transparent', padding:'Padding',
        catBasic:'Basic', catGreek:'Greek', catOps:'Operators', catRel:'Relations',
        catArrows:'Arrows', catSets:'Sets', catCalc:'Calculus', catMatrix:'Matrix',
        catTrig:'Trigonometry', catMisc:'Misc',
        libAlgebra:'Algebra', libCalc:'Calculus', libGeom:'Geometry', libStats:'Statistics',
        libPhysics:'Physics', libLinAlg:'Linear Algebra',
        saveToServer:'Save to Server', savedToServer:'Saved to server',
        loadError:'Could not load formulas', insertTemplate:'Insert Template'
      },
      de: {
        title:'Formel-Editor', latex:'LaTeX-Code', preview:'Vorschau', symbols:'Symbole',
        library:'Bibliothek', myFormulas:'Meine Formeln', save:'Speichern', delete:'Löschen',
        exportPng:'Als PNG speichern', exportSvg:'Als SVG speichern', exportLatex:'Als LaTeX speichern',
        exportMathml:'Als MathML speichern', exportMenu:'Exportieren', copy:'Kopieren',
        copyLatex:'LaTeX kopieren', copyMathml:'MathML kopieren',
        name:'Name', nameRequired:'Name ist erforderlich', saved:'Gespeichert', deleted:'Gelöscht',
        copied:'In Zwischenablage kopiert', deleteConfirm:'Möchten Sie diese Formel wirklich löschen?',
        yes:'Ja', cancel:'Abbrechen', noFormulas:'Noch keine Formeln',
        loading:'KaTeX wird geladen...', error:'Fehler', placeholder:'LaTeX-Code eingeben...',
        namePlaceholder:'Formelname', fontSize:'Schriftgröße', color:'Farbe',
        bgColor:'Hintergrund', transparent:'Transparent', padding:'Abstand',
        catBasic:'Basis', catGreek:'Griechisch', catOps:'Operatoren', catRel:'Relationen',
        catArrows:'Pfeile', catSets:'Mengen', catCalc:'Analysis', catMatrix:'Matrix',
        catTrig:'Trigonometrie', catMisc:'Sonstiges',
        libAlgebra:'Algebra', libCalc:'Analysis', libGeom:'Geometrie', libStats:'Statistik',
        libPhysics:'Physik', libLinAlg:'Lineare Algebra',
        saveToServer:'Auf Server speichern', savedToServer:'Auf Server gespeichert',
        loadError:'Formeln konnten nicht geladen werden', insertTemplate:'Vorlage einfügen'
      },
      fr: {
        title:'Éditeur de Formules', latex:'Code LaTeX', preview:'Aperçu', symbols:'Symboles',
        library:'Bibliothèque', myFormulas:'Mes Formules', save:'Enregistrer', delete:'Supprimer',
        exportPng:'Enregistrer en PNG', exportSvg:'Enregistrer en SVG', exportLatex:'Enregistrer en LaTeX',
        exportMathml:'Enregistrer en MathML', exportMenu:'Exporter', copy:'Copier',
        copyLatex:'Copier LaTeX', copyMathml:'Copier MathML',
        name:'Nom', nameRequired:'Le nom est requis', saved:'Enregistré', deleted:'Supprimé',
        copied:'Copié dans le presse-papiers', deleteConfirm:'Êtes-vous sûr de vouloir supprimer cette formule ?',
        yes:'Oui', cancel:'Annuler', noFormulas:'Aucune formule',
        loading:'Chargement de KaTeX...', error:'Erreur', placeholder:'Tapez du code LaTeX...',
        namePlaceholder:'Nom de la formule', fontSize:'Taille', color:'Couleur',
        bgColor:'Arrière-plan', transparent:'Transparent', padding:'Marge',
        catBasic:'Base', catGreek:'Grec', catOps:'Opérateurs', catRel:'Relations',
        catArrows:'Flèches', catSets:'Ensembles', catCalc:'Calcul', catMatrix:'Matrice',
        catTrig:'Trigonométrie', catMisc:'Divers',
        libAlgebra:'Algèbre', libCalc:'Calcul', libGeom:'Géométrie', libStats:'Statistiques',
        libPhysics:'Physique', libLinAlg:'Algèbre Linéaire',
        saveToServer:'Sauver sur le serveur', savedToServer:'Sauvé sur le serveur',
        loadError:'Impossible de charger les formules', insertTemplate:'Insérer un modèle'
      },
      es: {
        title:'Editor de Fórmulas', latex:'Código LaTeX', preview:'Vista previa', symbols:'Símbolos',
        library:'Biblioteca', myFormulas:'Mis Fórmulas', save:'Guardar', delete:'Eliminar',
        exportPng:'Guardar como PNG', exportSvg:'Guardar como SVG', exportLatex:'Guardar como LaTeX',
        exportMathml:'Guardar como MathML', exportMenu:'Exportar', copy:'Copiar',
        copyLatex:'Copiar LaTeX', copyMathml:'Copiar MathML',
        name:'Nombre', nameRequired:'El nombre es obligatorio', saved:'Guardado', deleted:'Eliminado',
        copied:'Copiado al portapapeles', deleteConfirm:'¿Estás seguro de que quieres eliminar esta fórmula?',
        yes:'Sí', cancel:'Cancelar', noFormulas:'Aún no hay fórmulas',
        loading:'Cargando KaTeX...', error:'Error', placeholder:'Escriba código LaTeX...',
        namePlaceholder:'Nombre de la fórmula', fontSize:'Tamaño', color:'Color',
        bgColor:'Fondo', transparent:'Transparente', padding:'Relleno',
        catBasic:'Básico', catGreek:'Griego', catOps:'Operadores', catRel:'Relaciones',
        catArrows:'Flechas', catSets:'Conjuntos', catCalc:'Cálculo', catMatrix:'Matriz',
        catTrig:'Trigonometría', catMisc:'Varios',
        libAlgebra:'Álgebra', libCalc:'Cálculo', libGeom:'Geometría', libStats:'Estadística',
        libPhysics:'Física', libLinAlg:'Álgebra Lineal',
        saveToServer:'Guardar en servidor', savedToServer:'Guardado en servidor',
        loadError:'No se pudieron cargar las fórmulas', insertTemplate:'Insertar plantilla'
      },
      ru: {
        title:'Редактор Формул', latex:'Код LaTeX', preview:'Предпросмотр', symbols:'Символы',
        library:'Библиотека', myFormulas:'Мои Формулы', save:'Сохранить', delete:'Удалить',
        exportPng:'Сохранить как PNG', exportSvg:'Сохранить как SVG', exportLatex:'Сохранить как LaTeX',
        exportMathml:'Сохранить как MathML', exportMenu:'Экспорт', copy:'Копировать',
        copyLatex:'Копировать LaTeX', copyMathml:'Копировать MathML',
        name:'Имя', nameRequired:'Имя обязательно', saved:'Сохранено', deleted:'Удалено',
        copied:'Скопировано в буфер', deleteConfirm:'Вы уверены, что хотите удалить эту формулу?',
        yes:'Да', cancel:'Отмена', noFormulas:'Пока нет формул',
        loading:'Загрузка KaTeX...', error:'Ошибка', placeholder:'Введите код LaTeX...',
        namePlaceholder:'Название формулы', fontSize:'Размер', color:'Цвет',
        bgColor:'Фон', transparent:'Прозрачный', padding:'Отступ',
        catBasic:'Основные', catGreek:'Греческие', catOps:'Операторы', catRel:'Отношения',
        catArrows:'Стрелки', catSets:'Множества', catCalc:'Анализ', catMatrix:'Матрица',
        catTrig:'Тригонометрия', catMisc:'Разное',
        libAlgebra:'Алгебра', libCalc:'Анализ', libGeom:'Геометрия', libStats:'Статистика',
        libPhysics:'Физика', libLinAlg:'Линейная алгебра',
        saveToServer:'Сохранить на сервер', savedToServer:'Сохранено на сервер',
        loadError:'Не удалось загрузить формулы', insertTemplate:'Вставить шаблон'
      }
    };

    function getLocale() { return localStorage.getItem('sys_locale') || 'tr'; }
    const locale = ref(getLocale());
    const t = (k) => (LANGS[locale.value] && LANGS[locale.value][k]) || LANGS.en[k] || k;
    let localeTimer;

    /* ── Auth ── */
    function getToken() { return localStorage.getItem('auth_token'); }
    function authHeaders() { return { Authorization: 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }

    /* ── KaTeX loading ── */
    const katexReady = ref(false);
    const katexError = ref('');

    function loadKaTeX() {
      return new Promise(function(resolve, reject) {
        if (window.katex) { katexReady.value = true; resolve(); return; }
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';
        document.head.appendChild(link);
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js';
        script.onload = function() { katexReady.value = true; resolve(); };
        script.onerror = function() { katexError.value = 'Failed to load KaTeX'; reject(); };
        document.head.appendChild(script);
      });
    }

    /* ── State ── */
    const latex = ref('E = mc^{2}');
    const formulaName = ref('');
    const fontSize = ref(32);
    const fgColor = ref('#ffffff');
    const bgColor = ref('#1a1a2e');
    const bgTransparent = ref(false);
    const padding = ref(20);
    const previewEl = ref(null);
    const renderError = ref('');
    const activeTab = ref('editor');
    const symbolCat = ref('catBasic');
    const libCat = ref('libAlgebra');

    /* ── Saved formulas ── */
    const formulas = ref([]);
    const loadingFormulas = ref(false);

    /* ── Symbols ── */
    const SYMBOLS = {
      catBasic: [
        { s:'\\frac{a}{b}', d:'a/b' }, { s:'\\sqrt{x}', d:'√x' }, { s:'\\sqrt[n]{x}', d:'ⁿ√x' },
        { s:'x^{n}', d:'xⁿ' }, { s:'x_{n}', d:'xₙ' }, { s:'\\sum_{i=1}^{n}', d:'Σ' },
        { s:'\\prod_{i=1}^{n}', d:'∏' }, { s:'\\log_{b}', d:'log' }, { s:'\\ln', d:'ln' },
        { s:'\\pm', d:'±' }, { s:'\\mp', d:'∓' }, { s:'\\cdot', d:'·' },
        { s:'\\times', d:'×' }, { s:'\\div', d:'÷' }, { s:'\\neq', d:'≠' },
        { s:'\\approx', d:'≈' }, { s:'\\equiv', d:'≡' }, { s:'\\infty', d:'∞' },
        { s:'\\pi', d:'π' }, { s:'\\dots', d:'…' }, { s:'\\overline{x}', d:'x̄' },
        { s:'\\hat{x}', d:'x̂' }, { s:'\\bar{x}', d:'x̄' }, { s:'\\vec{x}', d:'x⃗' },
        { s:'\\binom{n}{k}', d:'(n k)' }, { s:'n!', d:'n!' }
      ],
      catGreek: [
        { s:'\\alpha', d:'α' }, { s:'\\beta', d:'β' }, { s:'\\gamma', d:'γ' },
        { s:'\\delta', d:'δ' }, { s:'\\epsilon', d:'ε' }, { s:'\\zeta', d:'ζ' },
        { s:'\\eta', d:'η' }, { s:'\\theta', d:'θ' }, { s:'\\iota', d:'ι' },
        { s:'\\kappa', d:'κ' }, { s:'\\lambda', d:'λ' }, { s:'\\mu', d:'μ' },
        { s:'\\nu', d:'ν' }, { s:'\\xi', d:'ξ' }, { s:'\\rho', d:'ρ' },
        { s:'\\sigma', d:'σ' }, { s:'\\tau', d:'τ' }, { s:'\\upsilon', d:'υ' },
        { s:'\\phi', d:'φ' }, { s:'\\chi', d:'χ' }, { s:'\\psi', d:'ψ' },
        { s:'\\omega', d:'ω' }, { s:'\\Gamma', d:'Γ' }, { s:'\\Delta', d:'Δ' },
        { s:'\\Theta', d:'Θ' }, { s:'\\Lambda', d:'Λ' }, { s:'\\Sigma', d:'Σ' },
        { s:'\\Phi', d:'Φ' }, { s:'\\Psi', d:'Ψ' }, { s:'\\Omega', d:'Ω' }
      ],
      catOps: [
        { s:'+', d:'+' }, { s:'-', d:'-' }, { s:'\\times', d:'×' },
        { s:'\\div', d:'÷' }, { s:'\\cdot', d:'·' }, { s:'\\circ', d:'∘' },
        { s:'\\oplus', d:'⊕' }, { s:'\\otimes', d:'⊗' }, { s:'\\star', d:'⋆' },
        { s:'\\ast', d:'∗' }, { s:'\\cap', d:'∩' }, { s:'\\cup', d:'∪' },
        { s:'\\wedge', d:'∧' }, { s:'\\vee', d:'∨' }, { s:'\\neg', d:'¬' }
      ],
      catRel: [
        { s:'=', d:'=' }, { s:'\\neq', d:'≠' }, { s:'<', d:'<' },
        { s:'>', d:'>' }, { s:'\\leq', d:'≤' }, { s:'\\geq', d:'≥' },
        { s:'\\ll', d:'≪' }, { s:'\\gg', d:'≫' }, { s:'\\approx', d:'≈' },
        { s:'\\sim', d:'∼' }, { s:'\\simeq', d:'≃' }, { s:'\\cong', d:'≅' },
        { s:'\\equiv', d:'≡' }, { s:'\\propto', d:'∝' }, { s:'\\subset', d:'⊂' },
        { s:'\\supset', d:'⊃' }, { s:'\\subseteq', d:'⊆' }, { s:'\\supseteq', d:'⊇' },
        { s:'\\in', d:'∈' }, { s:'\\notin', d:'∉' }, { s:'\\ni', d:'∋' }
      ],
      catArrows: [
        { s:'\\leftarrow', d:'←' }, { s:'\\rightarrow', d:'→' }, { s:'\\leftrightarrow', d:'↔' },
        { s:'\\Leftarrow', d:'⇐' }, { s:'\\Rightarrow', d:'⇒' }, { s:'\\Leftrightarrow', d:'⇔' },
        { s:'\\uparrow', d:'↑' }, { s:'\\downarrow', d:'↓' }, { s:'\\mapsto', d:'↦' },
        { s:'\\longmapsto', d:'⟼' }, { s:'\\longrightarrow', d:'⟶' }, { s:'\\hookrightarrow', d:'↪' }
      ],
      catSets: [
        { s:'\\mathbb{N}', d:'ℕ' }, { s:'\\mathbb{Z}', d:'ℤ' }, { s:'\\mathbb{Q}', d:'ℚ' },
        { s:'\\mathbb{R}', d:'ℝ' }, { s:'\\mathbb{C}', d:'ℂ' }, { s:'\\emptyset', d:'∅' },
        { s:'\\cap', d:'∩' }, { s:'\\cup', d:'∪' }, { s:'\\setminus', d:'∖' },
        { s:'\\subset', d:'⊂' }, { s:'\\supset', d:'⊃' }, { s:'\\in', d:'∈' },
        { s:'\\forall', d:'∀' }, { s:'\\exists', d:'∃' }, { s:'\\nexists', d:'∄' }
      ],
      catCalc: [
        { s:'\\int_{a}^{b}', d:'∫' }, { s:'\\iint', d:'∬' }, { s:'\\iiint', d:'∭' },
        { s:'\\oint', d:'∮' }, { s:'\\frac{d}{dx}', d:'d/dx' }, { s:'\\frac{\\partial}{\\partial x}', d:'∂/∂x' },
        { s:'\\lim_{x \\to a}', d:'lim' }, { s:'\\sum_{i=0}^{\\infty}', d:'Σ∞' },
        { s:'\\prod_{i=0}^{n}', d:'∏' }, { s:'\\nabla', d:'∇' }, { s:'\\Delta', d:'Δ' },
        { s:'\\partial', d:'∂' }
      ],
      catMatrix: [
        { s:'\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', d:'( )' },
        { s:'\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}', d:'[ ]' },
        { s:'\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}', d:'| |' },
        { s:'\\begin{cases} x & \\text{if } a \\\\ y & \\text{if } b \\end{cases}', d:'{cases' },
        { s:'\\begin{pmatrix} a_{11} & \\cdots & a_{1n} \\\\ \\vdots & \\ddots & \\vdots \\\\ a_{m1} & \\cdots & a_{mn} \\end{pmatrix}', d:'(m×n)' }
      ],
      catTrig: [
        { s:'\\sin', d:'sin' }, { s:'\\cos', d:'cos' }, { s:'\\tan', d:'tan' },
        { s:'\\cot', d:'cot' }, { s:'\\sec', d:'sec' }, { s:'\\csc', d:'csc' },
        { s:'\\arcsin', d:'arcsin' }, { s:'\\arccos', d:'arccos' }, { s:'\\arctan', d:'arctan' },
        { s:'\\sinh', d:'sinh' }, { s:'\\cosh', d:'cosh' }, { s:'\\tanh', d:'tanh' }
      ],
      catMisc: [
        { s:'\\left( \\right)', d:'( )' }, { s:'\\left[ \\right]', d:'[ ]' },
        { s:'\\left\\{ \\right\\}', d:'{ }' }, { s:'\\left| \\right|', d:'| |' },
        { s:'\\left\\lfloor \\right\\rfloor', d:'⌊ ⌋' }, { s:'\\left\\lceil \\right\\rceil', d:'⌈ ⌉' },
        { s:'\\angle', d:'∠' }, { s:'\\perp', d:'⊥' }, { s:'\\parallel', d:'∥' },
        { s:'\\triangle', d:'△' }, { s:'\\square', d:'□' }, { s:'\\diamond', d:'◇' },
        { s:'\\therefore', d:'∴' }, { s:'\\because', d:'∵' }, { s:'\\ldots', d:'…' },
        { s:'\\cdots', d:'⋯' }, { s:'\\vdots', d:'⋮' }, { s:'\\ddots', d:'⋱' }
      ]
    };

    /* ── Formula Library ── */
    const LIBRARY = {
      libAlgebra: [
        { n:'Quadratic Formula', l:'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
        { n:'Binomial Theorem', l:'(a+b)^n = \\sum_{k=0}^{n} \\binom{n}{k} a^{n-k} b^k' },
        { n:'Difference of Squares', l:'a^2 - b^2 = (a-b)(a+b)' },
        { n:'Perfect Square', l:'(a \\pm b)^2 = a^2 \\pm 2ab + b^2' },
        { n:'Cube Formula', l:'a^3 + b^3 = (a+b)(a^2 - ab + b^2)' },
        { n:'Logarithm Rules', l:'\\log_b(xy) = \\log_b x + \\log_b y' },
        { n:'Exponential', l:'e^{i\\theta} = \\cos\\theta + i\\sin\\theta' }
      ],
      libCalc: [
        { n:'Derivative Definition', l:'f\'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}' },
        { n:'Chain Rule', l:'\\frac{d}{dx}[f(g(x))] = f\'(g(x)) \\cdot g\'(x)' },
        { n:'Product Rule', l:'(fg)\' = f\'g + fg\'' },
        { n:'Integration by Parts', l:'\\int u\\,dv = uv - \\int v\\,du' },
        { n:'Taylor Series', l:'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n' },
        { n:'Fundamental Theorem', l:'\\int_{a}^{b} f(x)\\,dx = F(b) - F(a)' },
        { n:'Power Rule', l:'\\frac{d}{dx} x^n = nx^{n-1}' }
      ],
      libGeom: [
        { n:'Pythagorean Theorem', l:'a^2 + b^2 = c^2' },
        { n:'Circle Area', l:'A = \\pi r^2' },
        { n:'Sphere Volume', l:'V = \\frac{4}{3}\\pi r^3' },
        { n:'Distance Formula', l:'d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}' },
        { n:'Law of Cosines', l:'c^2 = a^2 + b^2 - 2ab\\cos C' },
        { n:'Heron Formula', l:'A = \\sqrt{s(s-a)(s-b)(s-c)}' }
      ],
      libStats: [
        { n:'Mean', l:'\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i' },
        { n:'Standard Deviation', l:'\\sigma = \\sqrt{\\frac{1}{n}\\sum_{i=1}^{n}(x_i - \\bar{x})^2}' },
        { n:'Normal Distribution', l:'f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}' },
        { n:'Bayes Theorem', l:'P(A|B) = \\frac{P(B|A)\\,P(A)}{P(B)}' },
        { n:'Combinations', l:'\\binom{n}{k} = \\frac{n!}{k!(n-k)!}' },
        { n:'Variance', l:'\\text{Var}(X) = E[(X - \\mu)^2] = E[X^2] - (E[X])^2' }
      ],
      libPhysics: [
        { n:'Einstein Mass-Energy', l:'E = mc^2' },
        { n:'Newton Second Law', l:'\\vec{F} = m\\vec{a}' },
        { n:'Gravitation', l:'F = G\\frac{m_1 m_2}{r^2}' },
        { n:'Schrödinger Equation', l:'i\\hbar\\frac{\\partial}{\\partial t}\\Psi = \\hat{H}\\Psi' },
        { n:'Maxwell Equations', l:'\\nabla \\cdot \\vec{E} = \\frac{\\rho}{\\epsilon_0}' },
        { n:'Lorentz Factor', l:'\\gamma = \\frac{1}{\\sqrt{1 - \\frac{v^2}{c^2}}}' },
        { n:'Ohm Law', l:'V = IR' }
      ],
      libLinAlg: [
        { n:'Determinant 2×2', l:'\\det \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = ad - bc' },
        { n:'Eigenvalue', l:'A\\vec{v} = \\lambda\\vec{v}' },
        { n:'Dot Product', l:'\\vec{a} \\cdot \\vec{b} = \\sum_{i=1}^{n} a_i b_i' },
        { n:'Cross Product', l:'\\vec{a} \\times \\vec{b} = \\begin{vmatrix} \\hat{i} & \\hat{j} & \\hat{k} \\\\ a_1 & a_2 & a_3 \\\\ b_1 & b_2 & b_3 \\end{vmatrix}' },
        { n:'Matrix Transpose', l:'(AB)^T = B^T A^T' },
        { n:'Inverse', l:'A^{-1} = \\frac{1}{\\det A} \\text{adj}(A)' }
      ]
    };

    const symbolCats = computed(function() {
      return Object.keys(SYMBOLS).map(function(k) { return { id: k, name: t(k) }; });
    });
    const libCats = computed(function() {
      return Object.keys(LIBRARY).map(function(k) { return { id: k, name: t(k) }; });
    });

    const currentSymbols = computed(function() { return SYMBOLS[symbolCat.value] || []; });
    const currentLib = computed(function() { return LIBRARY[libCat.value] || []; });

    /* ── Render preview ── */
    function renderPreview() {
      if (!katexReady.value || !previewEl.value) return;
      try {
        window.katex.render(latex.value, previewEl.value, {
          throwOnError: false,
          displayMode: true,
          output: 'html',
          errorColor: '#ff6b6b'
        });
        previewEl.value.style.fontSize = fontSize.value + 'px';
        previewEl.value.style.color = fgColor.value;
        renderError.value = '';
      } catch (e) {
        renderError.value = e.message;
      }
    }

    watch([latex, fontSize, fgColor, katexReady], function() { nextTick(renderPreview); });

    /* ── Insert symbol ── */
    function insertSymbol(sym) {
      latex.value += ' ' + sym;
    }

    /* ── Insert library formula ── */
    function insertLibFormula(item) {
      latex.value = item.l;
      formulaName.value = item.n;
      activeTab.value = 'editor';
    }

    /* ── Export: PNG ── */
    function exportPng() {
      if (!katexReady.value) return;
      var container = document.createElement('div');
      container.style.cssText = 'position:fixed;left:-9999px;top:-9999px;padding:' + padding.value + 'px;' +
        (bgTransparent.value ? '' : 'background:' + bgColor.value + ';');
      document.body.appendChild(container);

      try {
        window.katex.render(latex.value, container, { throwOnError: false, displayMode: true, output: 'html' });
        container.style.fontSize = fontSize.value + 'px';
        container.style.color = fgColor.value;
      } catch (e) { ElMessage.error(t('error') + ': ' + e.message); container.remove(); return; }

      /* Use canvas to render */
      var svgStr = renderToSvgString();
      if (!svgStr) { container.remove(); return; }

      var tempContainer = document.createElement('div');
      tempContainer.style.cssText = 'position:fixed;left:-9999px;top:-9999px;';
      tempContainer.innerHTML = svgStr;
      document.body.appendChild(tempContainer);
      var svgEl = tempContainer.querySelector('svg');

      var w = svgEl.viewBox.baseVal.width || svgEl.getBoundingClientRect().width;
      var h = svgEl.viewBox.baseVal.height || svgEl.getBoundingClientRect().height;
      var scale = 3;
      var canvasW = Math.ceil((w + padding.value * 2) * scale);
      var canvasH = Math.ceil((h + padding.value * 2) * scale);

      var canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      var ctx = canvas.getContext('2d');

      if (!bgTransparent.value) {
        ctx.fillStyle = bgColor.value;
        ctx.fillRect(0, 0, canvasW, canvasH);
      }

      var svgData = new XMLSerializer().serializeToString(svgEl);
      var svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      var url = URL.createObjectURL(svgBlob);
      var img = new Image();
      img.onload = function() {
        ctx.drawImage(img, padding.value * scale, padding.value * scale, w * scale, h * scale);
        URL.revokeObjectURL(url);
        var link = document.createElement('a');
        link.download = (formulaName.value || 'formula') + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        container.remove();
        tempContainer.remove();
      };
      img.onerror = function() {
        URL.revokeObjectURL(url);
        container.remove();
        tempContainer.remove();
        ElMessage.error(t('error'));
      };
      img.src = url;
    }

    /* ── Export: SVG ── */
    function renderToSvgString() {
      if (!katexReady.value) return null;
      try {
        var html = window.katex.renderToString(latex.value, {
          throwOnError: false, displayMode: true, output: 'html'
        });
        /* Build SVG using foreignObject */
        var container = document.createElement('div');
        container.style.cssText = 'position:fixed;left:-9999px;top:-9999px;font-size:' + fontSize.value + 'px;color:' + fgColor.value + ';';
        container.innerHTML = html;
        document.body.appendChild(container);
        var rect = container.getBoundingClientRect();
        var w = Math.ceil(rect.width);
        var h = Math.ceil(rect.height);
        document.body.removeChild(container);

        var katexCssUrl = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">' +
          '<foreignObject width="100%" height="100%">' +
          '<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:' + fontSize.value + 'px;color:' + fgColor.value + ';">' +
          '<link rel="stylesheet" href="' + katexCssUrl + '" />' +
          html + '</div></foreignObject></svg>';
        return svg;
      } catch (e) { return null; }
    }

    function exportSvg() {
      var svgStr = renderToSvgString();
      if (!svgStr) { ElMessage.error(t('error')); return; }
      var blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      var link = document.createElement('a');
      link.download = (formulaName.value || 'formula') + '.svg';
      link.href = URL.createObjectURL(blob);
      link.click();
      setTimeout(function() { URL.revokeObjectURL(link.href); }, 5000);
    }

    /* ── Export: LaTeX ── */
    function exportLatex() {
      var content = '% LaTeX Formula\n% Generated by CloudComputer Formula Editor\n\\[\n' + latex.value + '\n\\]\n';
      downloadText(content, (formulaName.value || 'formula') + '.tex', 'text/x-latex');
    }

    /* ── Export: MathML ── */
    function exportMathml() {
      if (!katexReady.value) return;
      try {
        var mathml = window.katex.renderToString(latex.value, {
          throwOnError: false, displayMode: true, output: 'mathml'
        });
        var content = '<!DOCTYPE html>\n<html>\n<head><meta charset="utf-8"><title>' +
          (formulaName.value || 'Formula') + '</title></head>\n<body>\n' + mathml + '\n</body>\n</html>';
        downloadText(content, (formulaName.value || 'formula') + '.html', 'text/html');
      } catch (e) { ElMessage.error(t('error') + ': ' + e.message); }
    }

    /* ── Copy ── */
    function copyLatex() {
      navigator.clipboard.writeText(latex.value).then(function() { ElMessage.success(t('copied')); });
    }

    function copyMathml() {
      if (!katexReady.value) return;
      try {
        var mathml = window.katex.renderToString(latex.value, { throwOnError: false, displayMode: true, output: 'mathml' });
        navigator.clipboard.writeText(mathml).then(function() { ElMessage.success(t('copied')); });
      } catch (e) { ElMessage.error(t('error')); }
    }

    function downloadText(content, filename, mime) {
      var blob = new Blob([content], { type: mime + ';charset=utf-8' });
      var link = document.createElement('a');
      link.download = filename;
      link.href = URL.createObjectURL(blob);
      link.click();
      setTimeout(function() { URL.revokeObjectURL(link.href); }, 5000);
    }

    /* ── Save/Load formulas to server ── */
    async function loadFormulas() {
      loadingFormulas.value = true;
      try {
        var res = await fetch('/api/math-formula/list', { headers: authHeaders() });
        if (res.ok) formulas.value = await res.json();
      } catch (e) { console.error(t('loadError'), e); }
      loadingFormulas.value = false;
    }

    async function saveFormula() {
      if (!formulaName.value.trim()) { ElMessage.warning(t('nameRequired')); return; }
      var f = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name: formulaName.value.trim(),
        latex: latex.value,
        fontSize: fontSize.value,
        fgColor: fgColor.value,
        bgColor: bgColor.value,
        bgTransparent: bgTransparent.value,
        createdAt: new Date().toISOString()
      };
      try {
        var res = await fetch('/api/math-formula/save', { method: 'POST', headers: authHeaders(), body: JSON.stringify(f) });
        if (res.ok) {
          var data = await res.json();
          var idx = formulas.value.findIndex(function(x) { return x.id === data.id; });
          if (idx >= 0) formulas.value[idx] = data;
          else formulas.value.unshift(data);
          ElMessage.success(t('saved'));
        }
      } catch (e) { ElMessage.error(t('error')); }
    }

    async function deleteFormula(id) {
      try {
        await ElMessageBox.confirm(t('deleteConfirm'), t('delete'), {
          type: 'warning', confirmButtonText: t('yes'), cancelButtonText: t('cancel')
        });
      } catch { return; }
      try {
        await fetch('/api/math-formula/' + encodeURIComponent(id), { method: 'DELETE', headers: authHeaders() });
        formulas.value = formulas.value.filter(function(x) { return x.id !== id; });
        ElMessage.success(t('deleted'));
      } catch (e) { ElMessage.error(t('error')); }
    }

    function loadFormula(f) {
      latex.value = f.latex;
      formulaName.value = f.name;
      fontSize.value = f.fontSize || 32;
      fgColor.value = f.fgColor || '#ffffff';
      bgColor.value = f.bgColor || '#1a1a2e';
      bgTransparent.value = !!f.bgTransparent;
      activeTab.value = 'editor';
    }

    /* ── Save as PNG to server (images folder) ── */
    async function saveImageToServer() {
      if (!katexReady.value) return;
      var svgStr = renderToSvgString();
      if (!svgStr) { ElMessage.error(t('error')); return; }

      var tempContainer = document.createElement('div');
      tempContainer.style.cssText = 'position:fixed;left:-9999px;top:-9999px;';
      tempContainer.innerHTML = svgStr;
      document.body.appendChild(tempContainer);
      var svgEl = tempContainer.querySelector('svg');
      var w = svgEl.viewBox.baseVal.width || svgEl.getBoundingClientRect().width;
      var h = svgEl.viewBox.baseVal.height || svgEl.getBoundingClientRect().height;
      var scale = 3;
      var canvasW = Math.ceil((w + padding.value * 2) * scale);
      var canvasH = Math.ceil((h + padding.value * 2) * scale);

      var canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      var ctx = canvas.getContext('2d');
      if (!bgTransparent.value) { ctx.fillStyle = bgColor.value; ctx.fillRect(0, 0, canvasW, canvasH); }

      var svgData = new XMLSerializer().serializeToString(svgEl);
      var svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      var url = URL.createObjectURL(svgBlob);

      await new Promise(function(resolve) {
        var img = new Image();
        img.onload = function() {
          ctx.drawImage(img, padding.value * scale, padding.value * scale, w * scale, h * scale);
          URL.revokeObjectURL(url);
          resolve();
        };
        img.onerror = function() { URL.revokeObjectURL(url); resolve(); };
        img.src = url;
      });

      tempContainer.remove();

      canvas.toBlob(async function(blob) {
        if (!blob) { ElMessage.error(t('error')); return; }
        var fd = new FormData();
        fd.append('file', blob, (formulaName.value || 'formula') + '.png');
        try {
          var res = await fetch('/api/math-formula/save-image', {
            method: 'POST',
            headers: { Authorization: 'Bearer ' + getToken() },
            body: fd
          });
          if (res.ok) ElMessage.success(t('savedToServer'));
          else ElMessage.error(t('error'));
        } catch (e) { ElMessage.error(t('error')); }
      }, 'image/png');
    }

    /* ── Lifecycle ── */
    onMounted(function() {
      loadKaTeX().then(function() {
        nextTick(renderPreview);
      });
      loadFormulas();
      localeTimer = setInterval(function() { locale.value = getLocale(); }, 1000);
    });

    onUnmounted(function() {
      if (localeTimer) clearInterval(localeTimer);
    });

    return {
      locale, t, katexReady, katexError, latex, formulaName, fontSize, fgColor, bgColor,
      bgTransparent, padding, previewEl, renderError, activeTab,
      symbolCat, libCat, symbolCats, libCats, currentSymbols, currentLib,
      formulas, loadingFormulas,
      insertSymbol, insertLibFormula, renderPreview,
      exportPng, exportSvg, exportLatex, exportMathml,
      copyLatex, copyMathml,
      saveFormula, deleteFormula, loadFormula, saveImageToServer
    };
  }
})
