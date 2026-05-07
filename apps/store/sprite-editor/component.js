(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, nextTick, watch, reactive } = Vue;

  // ==================== I18N ====================
  const LANGS = {
    tr: {
      new:'Yeni',newProject:'Yeni Proje',open:'Aç',openProject:'Proje Aç',save:'Kaydet',saveProject:'Projeyi Kaydet',saveAs:'Farklı Kaydet',
      export:'Dışa Aktar',exportPng:'PNG Olarak Dışa Aktar',exportSheet:'Sprite Sayfası',exportGif:'GIF Olarak Dışa Aktar',spriteSheet:'Sprite Sayfası',
      canvasSize:'Tuval Boyutu',customSize:'Özel Boyut',width:'Genişlik',height:'Yükseklik',apply:'Uygula',cancel:'İptal',create:'Oluştur',
      zoom:'Yakınlaştır',grid:'Izgara',preview:'Önizleme',frames:'Kareler',frame:'Kare',addFrame:'Kare Ekle',duplicate:'Kopyala',deleteFrame:'Kareyi Sil',
      pencil:'Kalem',eraser:'Silgi',fill:'Doldur',picker:'Renk Seçici',line:'Çizgi',rect:'Dikdörtgen',ellipse:'Elips',select:'Seç',move:'Taşı',mirror:'Ayna',
      foreground:'Ön Plan Rengi',background:'Arka Plan Rengi',brushSize:'Fırça Boyutu',filled:'Dolu',
      onionSkin:'Soğan Kabuğu',opacity:'Şeffaflık',projectName:'Proje Adı',
      saved:'Kaydedildi',error:'Hata',confirmNew:'Yeni proje oluşturulsun mu? Kaydedilmemiş değişiklikler kaybolacak.',
      noProject:'Proje yok',loadError:'Yükleme hatası',spriteFiles:'Sprite Dosyaları'
    },
    en: {
      new:'New',newProject:'New Project',open:'Open',openProject:'Open Project',save:'Save',saveProject:'Save Project',saveAs:'Save As',
      export:'Export',exportPng:'Export as PNG',exportSheet:'Sprite Sheet',exportGif:'Export as GIF',spriteSheet:'Sprite Sheet',
      canvasSize:'Canvas Size',customSize:'Custom Size',width:'Width',height:'Height',apply:'Apply',cancel:'Cancel',create:'Create',
      zoom:'Zoom',grid:'Grid',preview:'Preview',frames:'Frames',frame:'Frame',addFrame:'Add Frame',duplicate:'Duplicate',deleteFrame:'Delete Frame',
      pencil:'Pencil',eraser:'Eraser',fill:'Fill',picker:'Color Picker',line:'Line',rect:'Rectangle',ellipse:'Ellipse',select:'Select',move:'Move',mirror:'Mirror',
      foreground:'Foreground Color',background:'Background Color',brushSize:'Brush Size',filled:'Filled',
      onionSkin:'Onion Skin',opacity:'Opacity',projectName:'Project Name',
      saved:'Saved',error:'Error',confirmNew:'Create new project? Unsaved changes will be lost.',
      noProject:'No project',loadError:'Load error',spriteFiles:'Sprite Files'
    },
    de: {
      new:'Neu',newProject:'Neues Projekt',open:'Öffnen',openProject:'Projekt öffnen',save:'Speichern',saveProject:'Projekt speichern',saveAs:'Speichern unter',
      export:'Exportieren',exportPng:'Als PNG exportieren',exportSheet:'Sprite-Blatt',exportGif:'Als GIF exportieren',spriteSheet:'Sprite-Blatt',
      canvasSize:'Leinwandgröße',customSize:'Benutzerdefiniert',width:'Breite',height:'Höhe',apply:'Anwenden',cancel:'Abbrechen',create:'Erstellen',
      zoom:'Zoom',grid:'Raster',preview:'Vorschau',frames:'Frames',frame:'Frame',addFrame:'Frame hinzufügen',duplicate:'Duplizieren',deleteFrame:'Frame löschen',
      pencil:'Bleistift',eraser:'Radierer',fill:'Füllen',picker:'Farbwähler',line:'Linie',rect:'Rechteck',ellipse:'Ellipse',select:'Auswählen',move:'Bewegen',mirror:'Spiegeln',
      foreground:'Vordergrundfarbe',background:'Hintergrundfarbe',brushSize:'Pinselgröße',filled:'Gefüllt',
      onionSkin:'Zwiebelschale',opacity:'Deckkraft',projectName:'Projektname',
      saved:'Gespeichert',error:'Fehler',confirmNew:'Neues Projekt erstellen? Ungespeicherte Änderungen gehen verloren.',
      noProject:'Kein Projekt',loadError:'Ladefehler',spriteFiles:'Sprite-Dateien'
    },
    fr: {
      new:'Nouveau',newProject:'Nouveau Projet',open:'Ouvrir',openProject:'Ouvrir Projet',save:'Enregistrer',saveProject:'Enregistrer Projet',saveAs:'Enregistrer sous',
      export:'Exporter',exportPng:'Exporter en PNG',exportSheet:'Feuille de sprites',exportGif:'Exporter en GIF',spriteSheet:'Feuille de Sprites',
      canvasSize:'Taille du canevas',customSize:'Taille personnalisée',width:'Largeur',height:'Hauteur',apply:'Appliquer',cancel:'Annuler',create:'Créer',
      zoom:'Zoom',grid:'Grille',preview:'Aperçu',frames:'Images',frame:'Image',addFrame:'Ajouter image',duplicate:'Dupliquer',deleteFrame:'Supprimer image',
      pencil:'Crayon',eraser:'Gomme',fill:'Remplir',picker:'Pipette',line:'Ligne',rect:'Rectangle',ellipse:'Ellipse',select:'Sélectionner',move:'Déplacer',mirror:'Miroir',
      foreground:'Couleur de premier plan',background:'Couleur d\'arrière-plan',brushSize:'Taille du pinceau',filled:'Rempli',
      onionSkin:'Pelure d\'oignon',opacity:'Opacité',projectName:'Nom du projet',
      saved:'Enregistré',error:'Erreur',confirmNew:'Créer un nouveau projet ? Les modifications non enregistrées seront perdues.',
      noProject:'Aucun projet',loadError:'Erreur de chargement',spriteFiles:'Fichiers Sprite'
    },
    es: {
      new:'Nuevo',newProject:'Nuevo Proyecto',open:'Abrir',openProject:'Abrir Proyecto',save:'Guardar',saveProject:'Guardar Proyecto',saveAs:'Guardar como',
      export:'Exportar',exportPng:'Exportar como PNG',exportSheet:'Hoja de sprites',exportGif:'Exportar como GIF',spriteSheet:'Hoja de Sprites',
      canvasSize:'Tamaño del lienzo',customSize:'Tamaño personalizado',width:'Ancho',height:'Alto',apply:'Aplicar',cancel:'Cancelar',create:'Crear',
      zoom:'Zoom',grid:'Cuadrícula',preview:'Vista previa',frames:'Cuadros',frame:'Cuadro',addFrame:'Añadir cuadro',duplicate:'Duplicar',deleteFrame:'Eliminar cuadro',
      pencil:'Lápiz',eraser:'Borrador',fill:'Rellenar',picker:'Selector de color',line:'Línea',rect:'Rectángulo',ellipse:'Elipse',select:'Seleccionar',move:'Mover',mirror:'Espejo',
      foreground:'Color de primer plano',background:'Color de fondo',brushSize:'Tamaño del pincel',filled:'Relleno',
      onionSkin:'Piel de cebolla',opacity:'Opacidad',projectName:'Nombre del proyecto',
      saved:'Guardado',error:'Error',confirmNew:'¿Crear nuevo proyecto? Los cambios no guardados se perderán.',
      noProject:'Sin proyecto',loadError:'Error de carga',spriteFiles:'Archivos Sprite'
    },
    ru: {
      new:'Новый',newProject:'Новый проект',open:'Открыть',openProject:'Открыть проект',save:'Сохранить',saveProject:'Сохранить проект',saveAs:'Сохранить как',
      export:'Экспорт',exportPng:'Экспорт как PNG',exportSheet:'Спрайт-лист',exportGif:'Экспорт как GIF',spriteSheet:'Спрайт-лист',
      canvasSize:'Размер холста',customSize:'Свой размер',width:'Ширина',height:'Высота',apply:'Применить',cancel:'Отмена',create:'Создать',
      zoom:'Масштаб',grid:'Сетка',preview:'Предпросмотр',frames:'Кадры',frame:'Кадр',addFrame:'Добавить кадр',duplicate:'Дублировать',deleteFrame:'Удалить кадр',
      pencil:'Карандаш',eraser:'Ластик',fill:'Заливка',picker:'Пипетка',line:'Линия',rect:'Прямоугольник',ellipse:'Эллипс',select:'Выбор',move:'Перемещение',mirror:'Зеркало',
      foreground:'Цвет переднего плана',background:'Цвет фона',brushSize:'Размер кисти',filled:'Заполненный',
      onionSkin:'Луковая кожура',opacity:'Непрозрачность',projectName:'Имя проекта',
      saved:'Сохранено',error:'Ошибка',confirmNew:'Создать новый проект? Несохранённые изменения будут потеряны.',
      noProject:'Нет проекта',loadError:'Ошибка загрузки',spriteFiles:'Файлы спрайтов'
    },
    zh: {
      new:'新建',newProject:'新建项目',open:'打开',openProject:'打开项目',save:'保存',saveProject:'保存项目',saveAs:'另存为',
      export:'导出',exportPng:'导出为PNG',exportSheet:'精灵图表',exportGif:'导出为GIF',spriteSheet:'精灵图表',
      canvasSize:'画布大小',customSize:'自定义大小',width:'宽度',height:'高度',apply:'应用',cancel:'取消',create:'创建',
      zoom:'缩放',grid:'网格',preview:'预览',frames:'帧',frame:'帧',addFrame:'添加帧',duplicate:'复制',deleteFrame:'删除帧',
      pencil:'铅笔',eraser:'橡皮擦',fill:'填充',picker:'取色器',line:'直线',rect:'矩形',ellipse:'椭圆',select:'选择',move:'移动',mirror:'镜像',
      foreground:'前景色',background:'背景色',brushSize:'画笔大小',filled:'填充',
      onionSkin:'洋葱皮',opacity:'不透明度',projectName:'项目名称',
      saved:'已保存',error:'错误',confirmNew:'创建新项目？未保存的更改将丢失。',
      noProject:'无项目',loadError:'加载错误',spriteFiles:'精灵文件'
    },
    ja: {
      new:'新規',newProject:'新規プロジェクト',open:'開く',openProject:'プロジェクトを開く',save:'保存',saveProject:'プロジェクトを保存',saveAs:'名前を付けて保存',
      export:'エクスポート',exportPng:'PNGとしてエクスポート',exportSheet:'スプライトシート',exportGif:'GIFとしてエクスポート',spriteSheet:'スプライトシート',
      canvasSize:'キャンバスサイズ',customSize:'カスタムサイズ',width:'幅',height:'高さ',apply:'適用',cancel:'キャンセル',create:'作成',
      zoom:'ズーム',grid:'グリッド',preview:'プレビュー',frames:'フレーム',frame:'フレーム',addFrame:'フレーム追加',duplicate:'複製',deleteFrame:'フレーム削除',
      pencil:'鉛筆',eraser:'消しゴム',fill:'塗りつぶし',picker:'スポイト',line:'直線',rect:'四角形',ellipse:'楕円',select:'選択',move:'移動',mirror:'ミラー',
      foreground:'前景色',background:'背景色',brushSize:'ブラシサイズ',filled:'塗りつぶし',
      onionSkin:'オニオンスキン',opacity:'不透明度',projectName:'プロジェクト名',
      saved:'保存しました',error:'エラー',confirmNew:'新規プロジェクトを作成しますか？未保存の変更は失われます。',
      noProject:'プロジェクトなし',loadError:'読み込みエラー',spriteFiles:'スプライトファイル'
    },
    it: {
      new:'Nuovo',newProject:'Nuovo Progetto',open:'Apri',openProject:'Apri Progetto',save:'Salva',saveProject:'Salva Progetto',saveAs:'Salva con nome',
      export:'Esporta',exportPng:'Esporta come PNG',exportSheet:'Foglio sprite',exportGif:'Esporta come GIF',spriteSheet:'Foglio Sprite',
      canvasSize:'Dimensione tela',customSize:'Dimensione personalizzata',width:'Larghezza',height:'Altezza',apply:'Applica',cancel:'Annulla',create:'Crea',
      zoom:'Zoom',grid:'Griglia',preview:'Anteprima',frames:'Fotogrammi',frame:'Fotogramma',addFrame:'Aggiungi fotogramma',duplicate:'Duplica',deleteFrame:'Elimina fotogramma',
      pencil:'Matita',eraser:'Gomma',fill:'Riempi',picker:'Contagocce',line:'Linea',rect:'Rettangolo',ellipse:'Ellisse',select:'Seleziona',move:'Sposta',mirror:'Specchio',
      foreground:'Colore primo piano',background:'Colore sfondo',brushSize:'Dimensione pennello',filled:'Pieno',
      onionSkin:'Buccia di cipolla',opacity:'Opacità',projectName:'Nome progetto',
      saved:'Salvato',error:'Errore',confirmNew:'Creare nuovo progetto? Le modifiche non salvate andranno perse.',
      noProject:'Nessun progetto',loadError:'Errore di caricamento',spriteFiles:'File Sprite'
    },
    ar: {
      new:'جديد',newProject:'مشروع جديد',open:'فتح',openProject:'فتح مشروع',save:'حفظ',saveProject:'حفظ المشروع',saveAs:'حفظ باسم',
      export:'تصدير',exportPng:'تصدير كـ PNG',exportSheet:'ورقة سبرايت',exportGif:'تصدير كـ GIF',spriteSheet:'ورقة سبرايت',
      canvasSize:'حجم اللوحة',customSize:'حجم مخصص',width:'العرض',height:'الارتفاع',apply:'تطبيق',cancel:'إلغاء',create:'إنشاء',
      zoom:'تكبير',grid:'شبكة',preview:'معاينة',frames:'إطارات',frame:'إطار',addFrame:'إضافة إطار',duplicate:'تكرار',deleteFrame:'حذف الإطار',
      pencil:'قلم رصاص',eraser:'ممحاة',fill:'تعبئة',picker:'منتقي الألوان',line:'خط',rect:'مستطيل',ellipse:'بيضوي',select:'تحديد',move:'نقل',mirror:'مرآة',
      foreground:'لون أمامي',background:'لون خلفي',brushSize:'حجم الفرشاة',filled:'ممتلئ',
      onionSkin:'قشر البصل',opacity:'الشفافية',projectName:'اسم المشروع',
      saved:'تم الحفظ',error:'خطأ',confirmNew:'إنشاء مشروع جديد؟ ستفقد التغييرات غير المحفوظة.',
      noProject:'لا يوجد مشروع',loadError:'خطأ في التحميل',spriteFiles:'ملفات سبرايت'
    },
    ko: {
      new:'새로 만들기',newProject:'새 프로젝트',open:'열기',openProject:'프로젝트 열기',save:'저장',saveProject:'프로젝트 저장',saveAs:'다른 이름으로 저장',
      export:'내보내기',exportPng:'PNG로 내보내기',exportSheet:'스프라이트 시트',exportGif:'GIF로 내보내기',spriteSheet:'스프라이트 시트',
      canvasSize:'캔버스 크기',customSize:'사용자 지정 크기',width:'너비',height:'높이',apply:'적용',cancel:'취소',create:'생성',
      zoom:'확대/축소',grid:'그리드',preview:'미리보기',frames:'프레임',frame:'프레임',addFrame:'프레임 추가',duplicate:'복제',deleteFrame:'프레임 삭제',
      pencil:'연필',eraser:'지우개',fill:'채우기',picker:'색상 선택기',line:'선',rect:'사각형',ellipse:'타원',select:'선택',move:'이동',mirror:'미러',
      foreground:'전경색',background:'배경색',brushSize:'브러시 크기',filled:'채움',
      onionSkin:'어니언 스킨',opacity:'불투명도',projectName:'프로젝트 이름',
      saved:'저장됨',error:'오류',confirmNew:'새 프로젝트를 만드시겠습니까? 저장하지 않은 변경사항이 손실됩니다.',
      noProject:'프로젝트 없음',loadError:'로드 오류',spriteFiles:'스프라이트 파일'
    },
    hi: {
      new:'नया',newProject:'नया प्रोजेक्ट',open:'खोलें',openProject:'प्रोजेक्ट खोलें',save:'सेव',saveProject:'प्रोजेक्ट सेव करें',saveAs:'इस रूप में सेव करें',
      export:'एक्सपोर्ट',exportPng:'PNG के रूप में एक्सपोर्ट',exportSheet:'स्प्राइट शीट',exportGif:'GIF के रूप में एक्सपोर्ट',spriteSheet:'स्प्राइट शीट',
      canvasSize:'कैनवास आकार',customSize:'कस्टम आकार',width:'चौड़ाई',height:'ऊँचाई',apply:'लागू करें',cancel:'रद्द करें',create:'बनाएं',
      zoom:'ज़ूम',grid:'ग्रिड',preview:'पूर्वावलोकन',frames:'फ्रेम',frame:'फ्रेम',addFrame:'फ्रेम जोड़ें',duplicate:'डुप्लिकेट',deleteFrame:'फ्रेम हटाएं',
      pencil:'पेंसिल',eraser:'इरेज़र',fill:'भरें',picker:'रंग चुनने वाला',line:'रेखा',rect:'आयत',ellipse:'दीर्घवृत्त',select:'चुनें',move:'स्थानांतरित करें',mirror:'दर्पण',
      foreground:'अग्रभूमि रंग',background:'पृष्ठभूमि रंग',brushSize:'ब्रश आकार',filled:'भरा हुआ',
      onionSkin:'ओनियन स्किन',opacity:'अपारदर्शिता',projectName:'प्रोजेक्ट का नाम',
      saved:'सेव हो गया',error:'त्रुटि',confirmNew:'नया प्रोजेक्ट बनाएं? सहेजे न गए परिवर्तन खो जाएंगे।',
      noProject:'कोई प्रोजेक्ट नहीं',loadError:'लोड त्रुटि',spriteFiles:'स्प्राइट फ़ाइलें'
    },
    pt: {
      new:'Novo',newProject:'Novo Projeto',open:'Abrir',openProject:'Abrir Projeto',save:'Salvar',saveProject:'Salvar Projeto',saveAs:'Salvar como',
      export:'Exportar',exportPng:'Exportar como PNG',exportSheet:'Folha de sprites',exportGif:'Exportar como GIF',spriteSheet:'Folha de Sprites',
      canvasSize:'Tamanho da tela',customSize:'Tamanho personalizado',width:'Largura',height:'Altura',apply:'Aplicar',cancel:'Cancelar',create:'Criar',
      zoom:'Zoom',grid:'Grade',preview:'Visualização',frames:'Quadros',frame:'Quadro',addFrame:'Adicionar quadro',duplicate:'Duplicar',deleteFrame:'Excluir quadro',
      pencil:'Lápis',eraser:'Borracha',fill:'Preencher',picker:'Conta-gotas',line:'Linha',rect:'Retângulo',ellipse:'Elipse',select:'Selecionar',move:'Mover',mirror:'Espelho',
      foreground:'Cor de primeiro plano',background:'Cor de fundo',brushSize:'Tamanho do pincel',filled:'Preenchido',
      onionSkin:'Onion Skin',opacity:'Opacidade',projectName:'Nome do projeto',
      saved:'Salvo',error:'Erro',confirmNew:'Criar novo projeto? Alterações não salvas serão perdidas.',
      noProject:'Sem projeto',loadError:'Erro ao carregar',spriteFiles:'Arquivos Sprite'
    }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      const ElMessage = window.ElementPlus?.ElMessage || { success(){}, error(){}, warning(){} };
      const ElMessageBox = window.ElementPlus?.ElMessageBox || { confirm: () => Promise.resolve() };

      // ==================== REFS ====================
      const mainCanvas = ref(null);
      const gridCanvas = ref(null);
      const previewCanvas = ref(null);
      const previewAnimCanvas = ref(null);
      const canvasArea = ref(null);
      const fgPicker = ref(null);
      const bgPicker = ref(null);
      const frameThumbs = reactive({});

      // ==================== STATE ====================
      const spriteW = ref(32);
      const spriteH = ref(32);
      const zoom = ref(12);
      const showGrid = ref(true);
      const tool = ref('pencil');
      const brushSize = ref(1);
      const fgColor = ref('#000000');
      const bgColor = ref('#ffffff');
      const shapeFill = ref(false);
      const onionSkin = ref(false);
      const onionOpacity = ref(30);

      // Canvas sizes
      const canvasSizes = [
        { label: '8×8', value: '8x8' },
        { label: '16×16', value: '16x16' },
        { label: '32×32', value: '32x32' },
        { label: '48×48', value: '48x48' },
        { label: '64×64', value: '64x64' },
        { label: '96×96', value: '96x96' },
        { label: '128×128', value: '128x128' },
        { label: '256×256', value: '256x256' }
      ];
      const canvasSize = ref('32x32');
      const showCustomSize = ref(false);
      const customW = ref(32);
      const customH = ref(32);

      // New project dialog
      const showNewProject = ref(false);
      const newProjectName = ref('my-sprite');
      const newProjectSize = ref('32x32');

      // Animation
      const fps = ref(8);
      const playing = ref(false);
      let animTimer = null;
      let animFrameIdx = 0;

      // Frames: each frame stores ImageData as a data URL
      const frames = ref([]);
      const currentFrame = ref(0);

      // History
      const historyStack = ref([]);
      const historyIdx = ref(-1);
      const MAX_HISTORY = 50;

      // Drawing state
      let drawing = false;
      let startX = 0, startY = 0;
      let lastX = 0, lastY = 0;
      const mouseX = ref(0);
      const mouseY = ref(0);
      let ctx = null;
      let previewCtx = null;

      // File
      const currentFilePath = ref('');
      const currentFileName = ref('');

      // Drag for frame reorder
      let dragFrameIdx = -1;

      // Tools
      const tools = computed(() => [
        { id: 'pencil', icon: '✏️' },
        { id: 'eraser', icon: '🧹' },
        { id: 'fill', icon: '🪣' },
        { id: 'picker', icon: '💉' },
        { id: 'line', icon: '📏' },
        { id: 'rect', icon: '⬜' },
        { id: 'ellipse', icon: '⭕' },
        { id: 'mirror', icon: '🪞' }
      ]);

      // Palette
      const palette = [
        '#000000','#404040','#808080','#c0c0c0','#ffffff',
        '#800000','#ff0000','#ff6b6b','#ff8c00','#ffa500',
        '#ffff00','#808000','#008000','#00ff00','#00ffff',
        '#008080','#0000ff','#4169e1','#6c5ce7','#800080',
        '#ff00ff','#ff69b4','#a0522d','#deb887','#f5deb3',
        'transparent'
      ];

      // ==================== CANVAS INIT ====================
      function initCanvas() {
        const c = mainCanvas.value;
        if (!c) return;
        c.width = spriteW.value;
        c.height = spriteH.value;
        ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.imageSmoothingEnabled = false;
        const p = previewCanvas.value;
        if (p) {
          p.width = spriteW.value;
          p.height = spriteH.value;
          previewCtx = p.getContext('2d');
          previewCtx.imageSmoothingEnabled = false;
        }
        // Init first frame
        if (frames.value.length === 0) {
          ctx.clearRect(0, 0, spriteW.value, spriteH.value);
          frames.value.push({ id: Date.now(), data: captureFrame() });
          currentFrame.value = 0;
        } else {
          restoreFrame(currentFrame.value);
        }
        pushHistory();
        drawGrid();
        updateThumb(currentFrame.value);
      }

      function captureFrame() {
        if (!ctx) return '';
        return mainCanvas.value.toDataURL('image/png');
      }

      function restoreFrame(idx) {
        if (!ctx || !frames.value[idx]) return;
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, spriteW.value, spriteH.value);
          ctx.drawImage(img, 0, 0);
          renderOnionSkin();
        };
        img.src = frames.value[idx].data;
      }

      function saveCurrentFrame() {
        if (frames.value[currentFrame.value]) {
          frames.value[currentFrame.value].data = captureFrame();
        }
      }

      // ==================== GRID ====================
      function drawGrid() {
        const gc = gridCanvas.value;
        if (!gc || zoom.value < 4) return;
        const w = spriteW.value * zoom.value;
        const h = spriteH.value * zoom.value;
        gc.width = w;
        gc.height = h;
        const gCtx = gc.getContext('2d');
        gCtx.clearRect(0, 0, w, h);
        gCtx.strokeStyle = 'rgba(255,255,255,0.12)';
        gCtx.lineWidth = 0.5;
        for (let x = 0; x <= spriteW.value; x++) {
          gCtx.beginPath();
          gCtx.moveTo(x * zoom.value, 0);
          gCtx.lineTo(x * zoom.value, h);
          gCtx.stroke();
        }
        for (let y = 0; y <= spriteH.value; y++) {
          gCtx.beginPath();
          gCtx.moveTo(0, y * zoom.value);
          gCtx.lineTo(w, y * zoom.value);
          gCtx.stroke();
        }
      }

      // ==================== ONION SKIN ====================
      function renderOnionSkin() {
        if (!onionSkin.value || !previewCtx) return;
        previewCtx.clearRect(0, 0, spriteW.value, spriteH.value);
        const prevIdx = currentFrame.value - 1;
        if (prevIdx < 0 || !frames.value[prevIdx]) return;
        previewCtx.globalAlpha = onionOpacity.value / 100;
        const img = new Image();
        img.onload = () => {
          previewCtx.drawImage(img, 0, 0);
          previewCtx.globalAlpha = 1;
        };
        img.src = frames.value[prevIdx].data;
      }

      // ==================== HISTORY ====================
      function pushHistory() {
        if (!ctx) return;
        const state = { frame: currentFrame.value, data: captureFrame() };
        if (historyIdx.value < historyStack.value.length - 1) {
          historyStack.value = historyStack.value.slice(0, historyIdx.value + 1);
        }
        historyStack.value.push(state);
        if (historyStack.value.length > MAX_HISTORY) historyStack.value.shift();
        historyIdx.value = historyStack.value.length - 1;
      }

      function undo() {
        if (historyIdx.value <= 0) return;
        saveCurrentFrame();
        historyIdx.value--;
        const state = historyStack.value[historyIdx.value];
        if (state.frame !== currentFrame.value) {
          currentFrame.value = state.frame;
        }
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, spriteW.value, spriteH.value);
          ctx.drawImage(img, 0, 0);
          frames.value[currentFrame.value].data = state.data;
          updateThumb(currentFrame.value);
          renderOnionSkin();
        };
        img.src = state.data;
      }

      function redo() {
        if (historyIdx.value >= historyStack.value.length - 1) return;
        historyIdx.value++;
        const state = historyStack.value[historyIdx.value];
        if (state.frame !== currentFrame.value) {
          currentFrame.value = state.frame;
        }
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, spriteW.value, spriteH.value);
          ctx.drawImage(img, 0, 0);
          frames.value[currentFrame.value].data = state.data;
          updateThumb(currentFrame.value);
          renderOnionSkin();
        };
        img.src = state.data;
      }

      // ==================== FRAME MANAGEMENT ====================
      function selectFrame(idx) {
        if (idx === currentFrame.value) return;
        saveCurrentFrame();
        updateThumb(currentFrame.value);
        currentFrame.value = idx;
        restoreFrame(idx);
        pushHistory();
        updateThumb(idx);
      }

      function addFrame() {
        saveCurrentFrame();
        updateThumb(currentFrame.value);
        const newF = { id: Date.now(), data: createBlankFrame() };
        frames.value.push(newF);
        currentFrame.value = frames.value.length - 1;
        restoreFrame(currentFrame.value);
        pushHistory();
        nextTick(() => updateAllThumbs());
      }

      function duplicateFrame() {
        saveCurrentFrame();
        const dup = { id: Date.now(), data: frames.value[currentFrame.value].data };
        frames.value.splice(currentFrame.value + 1, 0, dup);
        currentFrame.value = currentFrame.value + 1;
        restoreFrame(currentFrame.value);
        pushHistory();
        nextTick(() => updateAllThumbs());
      }

      function deleteFrame(idx) {
        if (frames.value.length <= 1) return;
        frames.value.splice(idx, 1);
        if (currentFrame.value >= frames.value.length) currentFrame.value = frames.value.length - 1;
        restoreFrame(currentFrame.value);
        pushHistory();
        nextTick(() => updateAllThumbs());
      }

      function createBlankFrame() {
        const c = document.createElement('canvas');
        c.width = spriteW.value;
        c.height = spriteH.value;
        return c.toDataURL('image/png');
      }

      // Frame drag & drop for reorder
      function onFrameDragStart(idx, e) { dragFrameIdx = idx; e.dataTransfer.effectAllowed = 'move'; }
      function onFrameDragOver(idx, e) { e.dataTransfer.dropEffect = 'move'; }
      function onFrameDrop(idx) {
        if (dragFrameIdx < 0 || dragFrameIdx === idx) return;
        saveCurrentFrame();
        const item = frames.value.splice(dragFrameIdx, 1)[0];
        frames.value.splice(idx, 0, item);
        currentFrame.value = idx;
        restoreFrame(idx);
        nextTick(() => updateAllThumbs());
        dragFrameIdx = -1;
      }

      // ==================== THUMBNAILS ====================
      function updateThumb(idx) {
        nextTick(() => {
          const tc = frameThumbs[idx];
          if (!tc || !frames.value[idx]) return;
          const tCtx = tc.getContext('2d');
          tCtx.imageSmoothingEnabled = false;
          tCtx.clearRect(0, 0, tc.width, tc.height);
          const img = new Image();
          img.onload = () => { tCtx.drawImage(img, 0, 0); };
          img.src = frames.value[idx].data;
        });
      }

      function updateAllThumbs() {
        for (let i = 0; i < frames.value.length; i++) updateThumb(i);
      }

      // ==================== ANIMATION PREVIEW ====================
      function togglePlay() {
        playing.value = !playing.value;
        if (playing.value) startAnimation();
        else stopAnimation();
      }

      function startAnimation() {
        stopAnimation();
        animFrameIdx = 0;
        animTimer = setInterval(() => {
          if (frames.value.length === 0) return;
          animFrameIdx = (animFrameIdx + 1) % frames.value.length;
          renderPreviewFrame(animFrameIdx);
        }, 1000 / fps.value);
      }

      function stopAnimation() {
        if (animTimer) { clearInterval(animTimer); animTimer = null; }
      }

      function renderPreviewFrame(idx) {
        const pc = previewAnimCanvas.value;
        if (!pc || !frames.value[idx]) return;
        const pCtx = pc.getContext('2d');
        pCtx.imageSmoothingEnabled = false;
        pCtx.clearRect(0, 0, spriteW.value, spriteH.value);
        const img = new Image();
        img.onload = () => { pCtx.drawImage(img, 0, 0); };
        img.src = frames.value[idx].data;
      }

      // ==================== DRAWING ====================
      function getPos(e) {
        const rect = mainCanvas.value.getBoundingClientRect();
        const scaleX = mainCanvas.value.width / rect.width;
        const scaleY = mainCanvas.value.height / rect.height;
        return {
          x: Math.floor((e.clientX - rect.left) * scaleX),
          y: Math.floor((e.clientY - rect.top) * scaleY)
        };
      }

      function setPixel(x, y, color) {
        if (x < 0 || x >= spriteW.value || y < 0 || y >= spriteH.value) return;
        if (color === 'transparent') {
          ctx.clearRect(x, y, 1, 1);
        } else {
          ctx.fillStyle = color;
          ctx.fillRect(x, y, 1, 1);
        }
      }

      function setPixelBlock(x, y, size, color) {
        const half = Math.floor(size / 2);
        for (let dy = -half; dy < size - half; dy++) {
          for (let dx = -half; dx < size - half; dx++) {
            setPixel(x + dx, y + dy, color);
          }
        }
      }

      // Bresenham line
      function drawPixelLine(x0, y0, x1, y1, color, size) {
        const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;
        while (true) {
          setPixelBlock(x0, y0, size, color);
          if (x0 === x1 && y0 === y1) break;
          const e2 = 2 * err;
          if (e2 > -dy) { err -= dy; x0 += sx; }
          if (e2 < dx) { err += dx; y0 += sy; }
        }
      }

      // Pixel rectangle
      function drawPixelRect(x0, y0, x1, y1, color, filled) {
        const minX = Math.min(x0, x1), maxX = Math.max(x0, x1);
        const minY = Math.min(y0, y1), maxY = Math.max(y0, y1);
        if (filled) {
          for (let y = minY; y <= maxY; y++)
            for (let x = minX; x <= maxX; x++) setPixel(x, y, color);
        } else {
          for (let x = minX; x <= maxX; x++) { setPixel(x, minY, color); setPixel(x, maxY, color); }
          for (let y = minY; y <= maxY; y++) { setPixel(minX, y, color); setPixel(maxX, y, color); }
        }
      }

      // Pixel ellipse (midpoint algorithm)
      function drawPixelEllipse(x0, y0, x1, y1, color, filled) {
        const cx = Math.round((x0 + x1) / 2), cy = Math.round((y0 + y1) / 2);
        const rx = Math.abs(Math.round((x1 - x0) / 2)), ry = Math.abs(Math.round((y1 - y0) / 2));
        if (rx === 0 && ry === 0) { setPixel(cx, cy, color); return; }
        if (filled) {
          for (let y = -ry; y <= ry; y++) {
            for (let x = -rx; x <= rx; x++) {
              if ((rx > 0 && ry > 0) ? (x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1 : true) {
                setPixel(cx + x, cy + y, color);
              }
            }
          }
        } else {
          let x = 0, y = ry;
          let d1 = (ry * ry) - (rx * rx * ry) + (0.25 * rx * rx);
          let dx = 2 * ry * ry * x, dy = 2 * rx * rx * y;
          while (dx < dy) {
            setPixel(cx + x, cy + y, color); setPixel(cx - x, cy + y, color);
            setPixel(cx + x, cy - y, color); setPixel(cx - x, cy - y, color);
            if (d1 < 0) { x++; dx += 2 * ry * ry; d1 += dx + ry * ry; }
            else { x++; y--; dx += 2 * ry * ry; dy -= 2 * rx * rx; d1 += dx - dy + ry * ry; }
          }
          let d2 = (ry * ry) * ((x + 0.5) * (x + 0.5)) + (rx * rx) * ((y - 1) * (y - 1)) - (rx * rx * ry * ry);
          while (y >= 0) {
            setPixel(cx + x, cy + y, color); setPixel(cx - x, cy + y, color);
            setPixel(cx + x, cy - y, color); setPixel(cx - x, cy - y, color);
            if (d2 > 0) { y--; dy -= 2 * rx * rx; d2 += rx * rx - dy; }
            else { y--; x++; dx += 2 * ry * ry; dy -= 2 * rx * rx; d2 += dx - dy + rx * rx; }
          }
        }
      }

      // Flood fill
      function floodFill(sx, sy, fillColor) {
        const w = spriteW.value, h = spriteH.value;
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        const isTransparent = fillColor === 'transparent';
        const fc = isTransparent ? { r: 0, g: 0, b: 0, a: 0 } : hexToRgba(fillColor);
        if (!fc) return;
        const idx = (sy * w + sx) * 4;
        const tR = data[idx], tG = data[idx + 1], tB = data[idx + 2], tA = data[idx + 3];
        if (tR === fc.r && tG === fc.g && tB === fc.b && tA === (isTransparent ? 0 : 255)) return;
        const stack = [[sx, sy]];
        const visited = new Uint8Array(w * h);
        function match(i) { return data[i] === tR && data[i + 1] === tG && data[i + 2] === tB && data[i + 3] === tA; }
        while (stack.length > 0) {
          const [cx, cy] = stack.pop();
          if (cx < 0 || cx >= w || cy < 0 || cy >= h) continue;
          const pi = cy * w + cx;
          if (visited[pi]) continue;
          const di = pi * 4;
          if (!match(di)) continue;
          visited[pi] = 1;
          if (isTransparent) {
            data[di] = 0; data[di + 1] = 0; data[di + 2] = 0; data[di + 3] = 0;
          } else {
            data[di] = fc.r; data[di + 1] = fc.g; data[di + 2] = fc.b; data[di + 3] = 255;
          }
          stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
        }
        ctx.putImageData(imgData, 0, 0);
      }

      function hexToRgba(hex) {
        const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
        return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16), a: 255 } : null;
      }

      function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
      }

      // Mirror draw (bilateral symmetry)
      function mirrorDraw(x, y, color, size) {
        const mx = spriteW.value - 1 - x;
        setPixelBlock(x, y, size, color);
        setPixelBlock(mx, y, size, color);
      }

      // ==================== EVENT HANDLERS ====================
      function onMouseDown(e) {
        const pos = getPos(e);
        mouseX.value = pos.x;
        mouseY.value = pos.y;

        if (tool.value === 'fill') {
          const color = e.button === 2 ? bgColor.value : fgColor.value;
          floodFill(pos.x, pos.y, color);
          saveCurrentFrame();
          updateThumb(currentFrame.value);
          pushHistory();
          return;
        }

        if (tool.value === 'picker') {
          const pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data;
          if (pixel[3] === 0) { fgColor.value = 'transparent'; }
          else { fgColor.value = rgbToHex(pixel[0], pixel[1], pixel[2]); }
          return;
        }

        drawing = true;
        startX = pos.x; startY = pos.y;
        lastX = pos.x; lastY = pos.y;

        if (tool.value === 'pencil' || tool.value === 'eraser' || tool.value === 'mirror') {
          const color = tool.value === 'eraser' ? 'transparent' : fgColor.value;
          if (tool.value === 'mirror') {
            mirrorDraw(pos.x, pos.y, color, brushSize.value);
          } else {
            setPixelBlock(pos.x, pos.y, brushSize.value, color);
          }
        }
      }

      function onMouseMove(e) {
        const pos = getPos(e);
        mouseX.value = pos.x;
        mouseY.value = pos.y;
        if (!drawing) return;

        if (tool.value === 'pencil' || tool.value === 'eraser' || tool.value === 'mirror') {
          const color = tool.value === 'eraser' ? 'transparent' : fgColor.value;
          if (tool.value === 'mirror') {
            // Bresenham for both sides
            const dx = Math.abs(pos.x - lastX), dy = Math.abs(pos.y - lastY);
            const sx = lastX < pos.x ? 1 : -1, sy = lastY < pos.y ? 1 : -1;
            let err = dx - dy, cx = lastX, cy = lastY;
            while (true) {
              mirrorDraw(cx, cy, color, brushSize.value);
              if (cx === pos.x && cy === pos.y) break;
              const e2 = 2 * err;
              if (e2 > -dy) { err -= dy; cx += sx; }
              if (e2 < dx) { err += dx; cy += sy; }
            }
          } else {
            drawPixelLine(lastX, lastY, pos.x, pos.y, color, brushSize.value);
          }
          lastX = pos.x;
          lastY = pos.y;
        } else if (tool.value === 'line' || tool.value === 'rect' || tool.value === 'ellipse') {
          // Preview on preview canvas: restore current frame, draw shape on main
          restoreFrame(currentFrame.value);
          const color = fgColor.value;
          if (tool.value === 'line') drawPixelLine(startX, startY, pos.x, pos.y, color, brushSize.value);
          else if (tool.value === 'rect') drawPixelRect(startX, startY, pos.x, pos.y, color, shapeFill.value);
          else if (tool.value === 'ellipse') drawPixelEllipse(startX, startY, pos.x, pos.y, color, shapeFill.value);
        }
      }

      function onMouseUp(e) {
        if (!drawing) return;
        drawing = false;
        const pos = getPos(e);

        if (tool.value === 'line') {
          restoreFrame(currentFrame.value);
          drawPixelLine(startX, startY, pos.x, pos.y, fgColor.value, brushSize.value);
        } else if (tool.value === 'rect') {
          restoreFrame(currentFrame.value);
          drawPixelRect(startX, startY, pos.x, pos.y, fgColor.value, shapeFill.value);
        } else if (tool.value === 'ellipse') {
          restoreFrame(currentFrame.value);
          drawPixelEllipse(startX, startY, pos.x, pos.y, fgColor.value, shapeFill.value);
        }

        saveCurrentFrame();
        updateThumb(currentFrame.value);
        pushHistory();
      }

      // ==================== SIZE CHANGE ====================
      function onCanvasSizeChange(val) {
        const [w, h] = val.split('x').map(Number);
        resizeSprite(w, h);
      }

      function applyCustomSize() {
        const w = Math.max(1, Math.min(512, customW.value));
        const h = Math.max(1, Math.min(512, customH.value));
        resizeSprite(w, h);
        showCustomSize.value = false;
      }

      function resizeSprite(w, h) {
        saveCurrentFrame();
        const oldFrames = frames.value.slice();
        let loaded = 0;
        const newFrames = oldFrames.map(f => ({ id: f.id, data: '' }));
        oldFrames.forEach((f, i) => {
          const img = new Image();
          img.onload = () => {
            const tc = document.createElement('canvas');
            tc.width = w; tc.height = h;
            const tCtx = tc.getContext('2d');
            tCtx.imageSmoothingEnabled = false;
            tCtx.drawImage(img, 0, 0);
            newFrames[i].data = tc.toDataURL('image/png');
            loaded++;
            if (loaded === oldFrames.length) {
              spriteW.value = w;
              spriteH.value = h;
              frames.value = newFrames;
              nextTick(() => {
                initCanvas();
                restoreFrame(currentFrame.value);
                updateAllThumbs();
              });
            }
          };
          img.src = f.data;
        });
        if (oldFrames.length === 0) {
          spriteW.value = w;
          spriteH.value = h;
          frames.value = [];
          nextTick(() => initCanvas());
        }
      }

      // ==================== COLOR ====================
      function pickFg() { if (fgPicker.value) fgPicker.value.click(); }
      function pickBg() { if (bgPicker.value) bgPicker.value.click(); }
      function swapColors() { const tmp = fgColor.value; fgColor.value = bgColor.value; bgColor.value = tmp; }

      // ==================== FILE OPERATIONS ====================
      function getToken() { return localStorage.getItem('auth_token') || ''; }

      // New Project
      function newProject() { showNewProject.value = true; newProjectName.value = 'my-sprite'; newProjectSize.value = '32x32'; }

      function createNewProject() {
        showNewProject.value = false;
        const [w, h] = newProjectSize.value.split('x').map(Number);
        spriteW.value = w;
        spriteH.value = h;
        canvasSize.value = newProjectSize.value;
        frames.value = [];
        currentFrame.value = 0;
        historyStack.value = [];
        historyIdx.value = -1;
        currentFilePath.value = '';
        currentFileName.value = newProjectName.value + '.sprite';
        nextTick(() => initCanvas());
      }

      // Open from server
      async function openProject() {
        if (!window.FileDialog) return;
        const result = await window.FileDialog.open({
          title: '📂 ' + L('openProject'),
          filters: [{ label: L('spriteFiles'), extensions: ['.sprite'] }]
        });
        if (!result) return;
        try {
          const resp = await fetch('/api/fs/read?path=' + encodeURIComponent(result.path), {
            headers: { 'Authorization': 'Bearer ' + getToken() }
          });
          if (!resp.ok) { ElMessage.error(L('loadError')); return; }
          const data = await resp.json();
          const project = JSON.parse(data.content);
          spriteW.value = project.width;
          spriteH.value = project.height;
          canvasSize.value = project.width + 'x' + project.height;
          fps.value = project.fps || 8;
          frames.value = project.frames || [];
          currentFrame.value = 0;
          currentFilePath.value = result.path;
          currentFileName.value = result.name;
          historyStack.value = [];
          historyIdx.value = -1;
          nextTick(() => {
            initCanvas();
            restoreFrame(0);
            updateAllThumbs();
          });
          ElMessage.success(L('open') + ': ' + result.name);
        } catch (e) { ElMessage.error(L('loadError')); console.error(e); }
      }

      // Save to server
      async function saveProject() {
        if (currentFilePath.value) {
          await saveToPath(currentFilePath.value);
        } else {
          await saveProjectAs();
        }
      }

      async function saveProjectAs() {
        if (!window.FileDialog) return;
        const result = await window.FileDialog.save({
          title: '💾 ' + L('saveAs'),
          defaultName: currentFileName.value || 'my-sprite.sprite',
          filters: [{ label: L('spriteFiles'), extensions: ['.sprite'] }]
        });
        if (!result) return;
        currentFilePath.value = result.path;
        currentFileName.value = result.name;
        await saveToPath(result.path);
      }

      async function saveToPath(filePath) {
        saveCurrentFrame();
        const project = {
          version: 1,
          width: spriteW.value,
          height: spriteH.value,
          fps: fps.value,
          frames: frames.value
        };
        try {
          const resp = await fetch('/api/fs/write', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath, content: JSON.stringify(project) })
          });
          if (resp.ok) ElMessage.success(L('saved'));
          else ElMessage.error(L('error'));
        } catch { ElMessage.error(L('error')); }
      }

      // Export single frame as PNG
      function exportSprite() {
        if (!mainCanvas.value) return;
        const link = document.createElement('a');
        link.download = (currentFileName.value || 'sprite').replace('.sprite', '') + '-frame' + (currentFrame.value + 1) + '.png';
        link.href = mainCanvas.value.toDataURL('image/png');
        link.click();
      }

      // Export sprite sheet (all frames in a row)
      function exportSpriteSheet() {
        if (frames.value.length === 0) return;
        const cols = Math.ceil(Math.sqrt(frames.value.length));
        const rows = Math.ceil(frames.value.length / cols);
        const sheetCanvas = document.createElement('canvas');
        sheetCanvas.width = spriteW.value * cols;
        sheetCanvas.height = spriteH.value * rows;
        const sCtx = sheetCanvas.getContext('2d');
        sCtx.imageSmoothingEnabled = false;

        let loaded = 0;
        frames.value.forEach((f, i) => {
          const img = new Image();
          img.onload = () => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            sCtx.drawImage(img, col * spriteW.value, row * spriteH.value);
            loaded++;
            if (loaded === frames.value.length) {
              const link = document.createElement('a');
              link.download = (currentFileName.value || 'sprite').replace('.sprite', '') + '-sheet.png';
              link.href = sheetCanvas.toDataURL('image/png');
              link.click();
            }
          };
          img.src = f.data;
        });
      }

      // Export GIF animation (builds animated GIF manually)
      function exportGif() {
        if (frames.value.length < 2) {
          ElMessage.warning('GIF: min 2 frames');
          return;
        }
        const w = spriteW.value, h = spriteH.value;
        const delay = Math.round(100 / fps.value); // centiseconds

        // Collect all frame pixel data
        const frameDataList = [];
        let loadCount = 0;
        frames.value.forEach((f, i) => {
          const img = new Image();
          img.onload = () => {
            const tc = document.createElement('canvas');
            tc.width = w; tc.height = h;
            const tCtx = tc.getContext('2d');
            tCtx.imageSmoothingEnabled = false;
            tCtx.drawImage(img, 0, 0);
            frameDataList[i] = tCtx.getImageData(0, 0, w, h);
            loadCount++;
            if (loadCount === frames.value.length) buildGif(frameDataList, w, h, delay);
          };
          img.src = f.data;
        });
      }

      function buildGif(frameDataList, w, h, delay) {
        // Quantize each frame to 256 colors, build GIF87a/89a binary
        const colorTableSize = 256;
        function quantize(imgData) {
          const pixels = imgData.data;
          const colorMap = new Map();
          const indexed = new Uint8Array(w * h);
          const palette = [];
          let transparentIdx = -1;
          for (let i = 0; i < pixels.length; i += 4) {
            const a = pixels[i + 3];
            if (a < 128) {
              if (transparentIdx === -1) {
                transparentIdx = palette.length;
                palette.push([0, 0, 0]);
              }
              indexed[i / 4] = transparentIdx;
              continue;
            }
            // Reduce to 5-bit per channel for clustering
            const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
            const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
            if (!colorMap.has(key)) {
              if (palette.length < colorTableSize) {
                colorMap.set(key, palette.length);
                palette.push([r, g, b]);
              } else {
                // Find nearest
                let best = 0, bestDist = Infinity;
                for (let j = 0; j < palette.length; j++) {
                  if (j === transparentIdx) continue;
                  const dr = palette[j][0] - r, dg = palette[j][1] - g, db = palette[j][2] - b;
                  const dist = dr * dr + dg * dg + db * db;
                  if (dist < bestDist) { bestDist = dist; best = j; }
                }
                colorMap.set(key, best);
              }
            }
            indexed[i / 4] = colorMap.get(key);
          }
          while (palette.length < colorTableSize) palette.push([0, 0, 0]);
          return { indexed, palette, transparentIdx };
        }

        // LZW compress
        function lzwEncode(indexed, minCodeSize) {
          const clearCode = 1 << minCodeSize;
          const eoiCode = clearCode + 1;
          let codeSize = minCodeSize + 1;
          let nextCode = eoiCode + 1;
          const table = new Map();
          for (let i = 0; i < clearCode; i++) table.set(String(i), i);

          const output = [];
          let bits = 0, buf = 0, bitPos = 0;
          function writeBits(code, size) {
            buf |= code << bitPos;
            bitPos += size;
            while (bitPos >= 8) {
              output.push(buf & 0xff);
              buf >>= 8;
              bitPos -= 8;
            }
          }
          writeBits(clearCode, codeSize);
          let current = String(indexed[0]);
          for (let i = 1; i < indexed.length; i++) {
            const next = String(indexed[i]);
            const combined = current + ',' + next;
            if (table.has(combined)) {
              current = combined;
            } else {
              writeBits(table.get(current), codeSize);
              if (nextCode < 4096) {
                table.set(combined, nextCode++);
                if (nextCode > (1 << codeSize) && codeSize < 12) codeSize++;
              } else {
                writeBits(clearCode, codeSize);
                table.clear();
                for (let j = 0; j < clearCode; j++) table.set(String(j), j);
                nextCode = eoiCode + 1;
                codeSize = minCodeSize + 1;
              }
              current = next;
            }
          }
          writeBits(table.get(current), codeSize);
          writeBits(eoiCode, codeSize);
          if (bitPos > 0) output.push(buf & 0xff);
          return new Uint8Array(output);
        }

        // Build binary
        const parts = [];
        function writeStr(s) { for (let i = 0; i < s.length; i++) parts.push(s.charCodeAt(i)); }
        function writeByte(b) { parts.push(b & 0xff); }
        function writeShort(v) { parts.push(v & 0xff); parts.push((v >> 8) & 0xff); }
        function writeBytes(arr) { for (let i = 0; i < arr.length; i++) parts.push(arr[i]); }

        // Header
        writeStr('GIF89a');
        writeShort(w); writeShort(h);
        writeByte(0x70); // no global color table, 8-bit color depth
        writeByte(0); writeByte(0);

        // NETSCAPE extension for looping
        writeByte(0x21); writeByte(0xff); writeByte(11);
        writeStr('NETSCAPE2.0');
        writeByte(3); writeByte(1); writeShort(0); writeByte(0);

        frameDataList.forEach(imgData => {
          const { indexed, palette, transparentIdx } = quantize(imgData);

          // Graphics Control Extension
          writeByte(0x21); writeByte(0xf9); writeByte(4);
          writeByte(transparentIdx >= 0 ? 0x09 : 0x08); // dispose + transparency
          writeShort(delay);
          writeByte(transparentIdx >= 0 ? transparentIdx : 0);
          writeByte(0);

          // Image Descriptor with local color table
          writeByte(0x2c);
          writeShort(0); writeShort(0); writeShort(w); writeShort(h);
          writeByte(0x87); // local color table, 256 entries

          // Local Color Table
          palette.forEach(c => { writeByte(c[0]); writeByte(c[1]); writeByte(c[2]); });

          // Image data
          const minCodeSize = 8;
          writeByte(minCodeSize);
          const compressed = lzwEncode(indexed, minCodeSize);
          // Sub-blocks of max 255 bytes
          let off = 0;
          while (off < compressed.length) {
            const chunkSize = Math.min(255, compressed.length - off);
            writeByte(chunkSize);
            for (let j = 0; j < chunkSize; j++) parts.push(compressed[off + j]);
            off += chunkSize;
          }
          writeByte(0); // sub-block terminator
        });

        // Trailer
        writeByte(0x3b);

        const blob = new Blob([new Uint8Array(parts)], { type: 'image/gif' });
        const link = document.createElement('a');
        link.download = (currentFileName.value || 'sprite').replace('.sprite', '') + '.gif';
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
        ElMessage.success('GIF exported!');
      }

      // ==================== KEYBOARD SHORTCUTS ====================
      function onKeyDown(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') { e.preventDefault(); saveProjectAs(); }
        else if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveProject(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'o') { e.preventDefault(); openProject(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); newProject(); }
        // Tool shortcuts
        if (e.key === 'b' || e.key === 'p') tool.value = 'pencil';
        if (e.key === 'e') tool.value = 'eraser';
        if (e.key === 'g') tool.value = 'fill';
        if (e.key === 'i') tool.value = 'picker';
        if (e.key === 'l') tool.value = 'line';
        if (e.key === 'r') tool.value = 'rect';
        if (e.key === 'o') { if (!e.ctrlKey) tool.value = 'ellipse'; }
        if (e.key === 'm') tool.value = 'mirror';
      }

      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

      // ==================== WATCHERS ====================
      watch(zoom, () => { drawGrid(); });
      watch(showGrid, () => { drawGrid(); });
      watch(onionSkin, () => { if (onionSkin.value) renderOnionSkin(); else if (previewCtx) previewCtx.clearRect(0, 0, spriteW.value, spriteH.value); });
      watch(onionOpacity, () => { if (onionSkin.value) renderOnionSkin(); });
      watch(fps, () => { if (playing.value) { stopAnimation(); startAnimation(); } });

      // ==================== LIFECYCLE ====================
      onMounted(() => {
        window.addEventListener('locale-changed', onLocaleChanged);
        window.addEventListener('keydown', onKeyDown);
        nextTick(() => initCanvas());
      });

      onUnmounted(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
        window.removeEventListener('keydown', onKeyDown);
        stopAnimation();
      });

      // ==================== RETURN ====================
      return {
        L, locale,
        mainCanvas, gridCanvas, previewCanvas, previewAnimCanvas, canvasArea, fgPicker, bgPicker, frameThumbs,
        spriteW, spriteH, zoom, showGrid,
        tool, brushSize, fgColor, bgColor, shapeFill, tools, palette,
        onionSkin, onionOpacity,
        canvasSizes, canvasSize, showCustomSize, customW, customH,
        showNewProject, newProjectName, newProjectSize,
        fps, playing, frames, currentFrame,
        historyStack, historyIdx,
        mouseX, mouseY,
        currentFilePath, currentFileName,
        onCanvasSizeChange, applyCustomSize,
        onMouseDown, onMouseMove, onMouseUp,
        pickFg, pickBg, swapColors,
        undo, redo,
        selectFrame, addFrame, duplicateFrame, deleteFrame,
        onFrameDragStart, onFrameDragOver, onFrameDrop,
        togglePlay,
        newProject, createNewProject, openProject, saveProject, saveProjectAs,
        exportSprite, exportSpriteSheet, exportGif
      };
    }
  };
})(Vue);
