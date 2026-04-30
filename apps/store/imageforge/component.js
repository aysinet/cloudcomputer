(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, nextTick, watch, reactive } = Vue;

  /* ─── i18n ─── */
  const LANGS = {
    tr: {
      file:'Dosya', edit:'Düzen', view:'Görünüm', newFile:'Yeni', open:'Aç', save:'Kaydet',
      saveAs:'Farklı Kaydet', upload:'Yükle', exportPng:'PNG Olarak Dışa Aktar', exportJpeg:'JPEG Olarak Dışa Aktar',
      download:'İndir', undo:'Geri Al', redo:'Yinele', reset:'Sıfırla',
      tools:'Araçlar', properties:'Özellikler', transform:'Dönüşüm', effects:'Efektler',
      resize:'Boyutlandır', scale:'Ölçekle', rotate:'Döndür', skew:'Eğ',
      flipH:'Yatay Çevir', flipV:'Dikey Çevir', crop:'Kırp',
      width:'Genişlik', height:'Yükseklik', angle:'Açı', skewX:'Eğim X', skewY:'Eğim Y',
      apply:'Uygula', cancel:'İptal', zoom:'Yakınlaştır', zoomIn:'Yakınlaştır', zoomOut:'Uzaklaştır',
      fitScreen:'Ekrana Sığdır', actualSize:'Gerçek Boyut',
      grayscale:'Gri Tonlama', sepia:'Sepya', brightness:'Parlaklık', contrast:'Kontrast',
      blur:'Bulanıklaştır', invert:'Ters Çevir', sharpen:'Keskinleştir',
      gridOverlay:'Izgara', showGrid:'Izgarayı Göster',
      dragDrop:'Bir görsel sürükleyip bırakın veya dosya yükleyin',
      noImage:'Henüz görsel yüklenmedi', saved:'Kaydedildi', error:'Hata',
      lockAspect:'Oranı Kilitle', quality:'Kalite',
      select:'Seç', move:'Taşı', hand:'El', cropTool:'Kırpma',
      applyCrop:'Kırpmayı Uygula', cancelCrop:'İptal',
      pointer:'İmleç', pan:'Kaydır'
    },
    en: {
      file:'File', edit:'Edit', view:'View', newFile:'New', open:'Open', save:'Save',
      saveAs:'Save As', upload:'Upload', exportPng:'Export as PNG', exportJpeg:'Export as JPEG',
      download:'Download', undo:'Undo', redo:'Redo', reset:'Reset',
      tools:'Tools', properties:'Properties', transform:'Transform', effects:'Effects',
      resize:'Resize', scale:'Scale', rotate:'Rotate', skew:'Skew',
      flipH:'Flip Horizontal', flipV:'Flip Vertical', crop:'Crop',
      width:'Width', height:'Height', angle:'Angle', skewX:'Skew X', skewY:'Skew Y',
      apply:'Apply', cancel:'Cancel', zoom:'Zoom', zoomIn:'Zoom In', zoomOut:'Zoom Out',
      fitScreen:'Fit to Screen', actualSize:'Actual Size',
      grayscale:'Grayscale', sepia:'Sepia', brightness:'Brightness', contrast:'Contrast',
      blur:'Blur', invert:'Invert', sharpen:'Sharpen',
      gridOverlay:'Grid', showGrid:'Show Grid',
      dragDrop:'Drag & drop an image or upload a file',
      noImage:'No image loaded yet', saved:'Saved', error:'Error',
      lockAspect:'Lock Aspect Ratio', quality:'Quality',
      select:'Select', move:'Move', hand:'Hand', cropTool:'Crop',
      applyCrop:'Apply Crop', cancelCrop:'Cancel',
      pointer:'Pointer', pan:'Pan'
    },
    de: {
      file:'Datei', edit:'Bearbeiten', view:'Ansicht', newFile:'Neu', open:'Öffnen', save:'Speichern',
      saveAs:'Speichern unter', upload:'Hochladen', exportPng:'Als PNG exportieren', exportJpeg:'Als JPEG exportieren',
      download:'Herunterladen', undo:'Rückgängig', redo:'Wiederholen', reset:'Zurücksetzen',
      tools:'Werkzeuge', properties:'Eigenschaften', transform:'Transformieren', effects:'Effekte',
      resize:'Größe ändern', scale:'Skalieren', rotate:'Drehen', skew:'Neigen',
      flipH:'Horizontal spiegeln', flipV:'Vertikal spiegeln', crop:'Zuschneiden',
      width:'Breite', height:'Höhe', angle:'Winkel', skewX:'Neigung X', skewY:'Neigung Y',
      apply:'Anwenden', cancel:'Abbrechen', zoom:'Zoom', zoomIn:'Vergrößern', zoomOut:'Verkleinern',
      fitScreen:'An Bildschirm anpassen', actualSize:'Originalgröße',
      grayscale:'Graustufen', sepia:'Sepia', brightness:'Helligkeit', contrast:'Kontrast',
      blur:'Weichzeichnen', invert:'Invertieren', sharpen:'Schärfen',
      gridOverlay:'Raster', showGrid:'Raster anzeigen',
      dragDrop:'Bild hierher ziehen oder hochladen',
      noImage:'Kein Bild geladen', saved:'Gespeichert', error:'Fehler',
      lockAspect:'Seitenverhältnis sperren', quality:'Qualität',
      select:'Auswählen', move:'Verschieben', hand:'Hand', cropTool:'Zuschneiden',
      applyCrop:'Zuschnitt anwenden', cancelCrop:'Abbrechen',
      pointer:'Zeiger', pan:'Schwenken'
    },
    fr: {
      file:'Fichier', edit:'Édition', view:'Affichage', newFile:'Nouveau', open:'Ouvrir', save:'Enregistrer',
      saveAs:'Enregistrer sous', upload:'Importer', exportPng:'Exporter en PNG', exportJpeg:'Exporter en JPEG',
      download:'Télécharger', undo:'Annuler', redo:'Rétablir', reset:'Réinitialiser',
      tools:'Outils', properties:'Propriétés', transform:'Transformer', effects:'Effets',
      resize:'Redimensionner', scale:'Échelle', rotate:'Pivoter', skew:'Incliner',
      flipH:'Retourner horizontalement', flipV:'Retourner verticalement', crop:'Recadrer',
      width:'Largeur', height:'Hauteur', angle:'Angle', skewX:'Inclinaison X', skewY:'Inclinaison Y',
      apply:'Appliquer', cancel:'Annuler', zoom:'Zoom', zoomIn:'Agrandir', zoomOut:'Réduire',
      fitScreen:'Ajuster à l\'écran', actualSize:'Taille réelle',
      grayscale:'Niveaux de gris', sepia:'Sépia', brightness:'Luminosité', contrast:'Contraste',
      blur:'Flou', invert:'Inverser', sharpen:'Netteté',
      gridOverlay:'Grille', showGrid:'Afficher la grille',
      dragDrop:'Glissez-déposez une image ou importez un fichier',
      noImage:'Aucune image chargée', saved:'Enregistré', error:'Erreur',
      lockAspect:'Verrouiller les proportions', quality:'Qualité',
      select:'Sélectionner', move:'Déplacer', hand:'Main', cropTool:'Recadrer',
      applyCrop:'Appliquer le recadrage', cancelCrop:'Annuler',
      pointer:'Curseur', pan:'Panoramique'
    },
    es: {
      file:'Archivo', edit:'Editar', view:'Ver', newFile:'Nuevo', open:'Abrir', save:'Guardar',
      saveAs:'Guardar como', upload:'Subir', exportPng:'Exportar como PNG', exportJpeg:'Exportar como JPEG',
      download:'Descargar', undo:'Deshacer', redo:'Rehacer', reset:'Restablecer',
      tools:'Herramientas', properties:'Propiedades', transform:'Transformar', effects:'Efectos',
      resize:'Redimensionar', scale:'Escalar', rotate:'Rotar', skew:'Sesgar',
      flipH:'Voltear horizontalmente', flipV:'Voltear verticalmente', crop:'Recortar',
      width:'Ancho', height:'Alto', angle:'Ángulo', skewX:'Sesgo X', skewY:'Sesgo Y',
      apply:'Aplicar', cancel:'Cancelar', zoom:'Zoom', zoomIn:'Acercar', zoomOut:'Alejar',
      fitScreen:'Ajustar a pantalla', actualSize:'Tamaño real',
      grayscale:'Escala de grises', sepia:'Sepia', brightness:'Brillo', contrast:'Contraste',
      blur:'Desenfoque', invert:'Invertir', sharpen:'Enfocar',
      gridOverlay:'Cuadrícula', showGrid:'Mostrar cuadrícula',
      dragDrop:'Arrastra y suelta una imagen o sube un archivo',
      noImage:'No hay imagen cargada', saved:'Guardado', error:'Error',
      lockAspect:'Bloquear proporción', quality:'Calidad',
      select:'Seleccionar', move:'Mover', hand:'Mano', cropTool:'Recortar',
      applyCrop:'Aplicar recorte', cancelCrop:'Cancelar',
      pointer:'Puntero', pan:'Desplazar'
    },
    ru: {
      file:'Файл', edit:'Правка', view:'Вид', newFile:'Новый', open:'Открыть', save:'Сохранить',
      saveAs:'Сохранить как', upload:'Загрузить', exportPng:'Экспорт в PNG', exportJpeg:'Экспорт в JPEG',
      download:'Скачать', undo:'Отменить', redo:'Повторить', reset:'Сбросить',
      tools:'Инструменты', properties:'Свойства', transform:'Трансформация', effects:'Эффекты',
      resize:'Размер', scale:'Масштаб', rotate:'Поворот', skew:'Наклон',
      flipH:'Отразить горизонтально', flipV:'Отразить вертикально', crop:'Обрезка',
      width:'Ширина', height:'Высота', angle:'Угол', skewX:'Наклон X', skewY:'Наклон Y',
      apply:'Применить', cancel:'Отмена', zoom:'Масштаб', zoomIn:'Приблизить', zoomOut:'Отдалить',
      fitScreen:'По размеру экрана', actualSize:'Реальный размер',
      grayscale:'Оттенки серого', sepia:'Сепия', brightness:'Яркость', contrast:'Контраст',
      blur:'Размытие', invert:'Инвертировать', sharpen:'Резкость',
      gridOverlay:'Сетка', showGrid:'Показать сетку',
      dragDrop:'Перетащите изображение или загрузите файл',
      noImage:'Изображение не загружено', saved:'Сохранено', error:'Ошибка',
      lockAspect:'Сохранить пропорции', quality:'Качество',
      select:'Выбрать', move:'Переместить', hand:'Рука', cropTool:'Обрезка',
      applyCrop:'Применить обрезку', cancelCrop:'Отмена',
      pointer:'Указатель', pan:'Панорамирование'
    },
    zh: {
      file:'文件', edit:'编辑', view:'视图', newFile:'新建', open:'打开', save:'保存',
      saveAs:'另存为', upload:'上传', exportPng:'导出PNG', exportJpeg:'导出JPEG',
      download:'下载', undo:'撤销', redo:'重做', reset:'重置',
      tools:'工具', properties:'属性', transform:'变换', effects:'效果',
      resize:'调整大小', scale:'缩放', rotate:'旋转', skew:'倾斜',
      flipH:'水平翻转', flipV:'垂直翻转', crop:'裁剪',
      width:'宽度', height:'高度', angle:'角度', skewX:'倾斜X', skewY:'倾斜Y',
      apply:'应用', cancel:'取消', zoom:'缩放', zoomIn:'放大', zoomOut:'缩小',
      fitScreen:'适合屏幕', actualSize:'实际大小',
      grayscale:'灰度', sepia:'棕褐色', brightness:'亮度', contrast:'对比度',
      blur:'模糊', invert:'反转', sharpen:'锐化',
      gridOverlay:'网格', showGrid:'显示网格',
      dragDrop:'拖放图像或上传文件', noImage:'尚未加载图像',
      saved:'已保存', error:'错误', lockAspect:'锁定比例', quality:'质量',
      select:'选择', move:'移动', hand:'手形', cropTool:'裁剪',
      applyCrop:'应用裁剪', cancelCrop:'取消', pointer:'指针', pan:'平移'
    },
    ja: {
      file:'ファイル', edit:'編集', view:'表示', newFile:'新規', open:'開く', save:'保存',
      saveAs:'名前を付けて保存', upload:'アップロード', exportPng:'PNGでエクスポート', exportJpeg:'JPEGでエクスポート',
      download:'ダウンロード', undo:'元に戻す', redo:'やり直し', reset:'リセット',
      tools:'ツール', properties:'プロパティ', transform:'変換', effects:'エフェクト',
      resize:'サイズ変更', scale:'拡大縮小', rotate:'回転', skew:'傾斜',
      flipH:'水平反転', flipV:'垂直反転', crop:'切り抜き',
      width:'幅', height:'高さ', angle:'角度', skewX:'傾斜X', skewY:'傾斜Y',
      apply:'適用', cancel:'キャンセル', zoom:'ズーム', zoomIn:'拡大', zoomOut:'縮小',
      fitScreen:'画面に合わせる', actualSize:'実際のサイズ',
      grayscale:'グレースケール', sepia:'セピア', brightness:'明るさ', contrast:'コントラスト',
      blur:'ぼかし', invert:'反転', sharpen:'シャープ',
      gridOverlay:'グリッド', showGrid:'グリッドを表示',
      dragDrop:'画像をドラッグ＆ドロップまたはアップロード', noImage:'画像が読み込まれていません',
      saved:'保存しました', error:'エラー', lockAspect:'アスペクト比を固定', quality:'品質',
      select:'選択', move:'移動', hand:'ハンド', cropTool:'切り抜き',
      applyCrop:'切り抜きを適用', cancelCrop:'キャンセル', pointer:'ポインタ', pan:'パン'
    },
    it: {
      file:'File', edit:'Modifica', view:'Visualizza', newFile:'Nuovo', open:'Apri', save:'Salva',
      saveAs:'Salva con nome', upload:'Carica', exportPng:'Esporta come PNG', exportJpeg:'Esporta come JPEG',
      download:'Scarica', undo:'Annulla', redo:'Ripeti', reset:'Ripristina',
      tools:'Strumenti', properties:'Proprietà', transform:'Trasforma', effects:'Effetti',
      resize:'Ridimensiona', scale:'Scala', rotate:'Ruota', skew:'Inclina',
      flipH:'Capovolgi orizzontalmente', flipV:'Capovolgi verticalmente', crop:'Ritaglia',
      width:'Larghezza', height:'Altezza', angle:'Angolo', skewX:'Inclinazione X', skewY:'Inclinazione Y',
      apply:'Applica', cancel:'Annulla', zoom:'Zoom', zoomIn:'Ingrandisci', zoomOut:'Riduci',
      fitScreen:'Adatta allo schermo', actualSize:'Dimensione reale',
      grayscale:'Scala di grigi', sepia:'Seppia', brightness:'Luminosità', contrast:'Contrasto',
      blur:'Sfocatura', invert:'Inverti', sharpen:'Nitidezza',
      gridOverlay:'Griglia', showGrid:'Mostra griglia',
      dragDrop:'Trascina e rilascia un\'immagine o carica un file', noImage:'Nessuna immagine caricata',
      saved:'Salvato', error:'Errore', lockAspect:'Blocca proporzioni', quality:'Qualità',
      select:'Seleziona', move:'Sposta', hand:'Mano', cropTool:'Ritaglia',
      applyCrop:'Applica ritaglio', cancelCrop:'Annulla', pointer:'Puntatore', pan:'Panoramica'
    },
    ar: {
      file:'ملف', edit:'تحرير', view:'عرض', newFile:'جديد', open:'فتح', save:'حفظ',
      saveAs:'حفظ باسم', upload:'رفع', exportPng:'تصدير PNG', exportJpeg:'تصدير JPEG',
      download:'تنزيل', undo:'تراجع', redo:'إعادة', reset:'إعادة تعيين',
      tools:'أدوات', properties:'خصائص', transform:'تحويل', effects:'تأثيرات',
      resize:'تغيير الحجم', scale:'قياس', rotate:'تدوير', skew:'إمالة',
      flipH:'قلب أفقي', flipV:'قلب عمودي', crop:'قص',
      width:'العرض', height:'الارتفاع', angle:'الزاوية', skewX:'إمالة X', skewY:'إمالة Y',
      apply:'تطبيق', cancel:'إلغاء', zoom:'تكبير', zoomIn:'تكبير', zoomOut:'تصغير',
      fitScreen:'ملائمة الشاشة', actualSize:'الحجم الفعلي',
      grayscale:'تدرج رمادي', sepia:'بني داكن', brightness:'سطوع', contrast:'تباين',
      blur:'ضبابية', invert:'عكس', sharpen:'حدة',
      gridOverlay:'شبكة', showGrid:'إظهار الشبكة',
      dragDrop:'اسحب وأفلت صورة أو ارفع ملفاً', noImage:'لم يتم تحميل صورة',
      saved:'تم الحفظ', error:'خطأ', lockAspect:'قفل النسبة', quality:'الجودة',
      select:'تحديد', move:'نقل', hand:'يد', cropTool:'قص',
      applyCrop:'تطبيق القص', cancelCrop:'إلغاء', pointer:'مؤشر', pan:'تحريك'
    },
    ko: {
      file:'파일', edit:'편집', view:'보기', newFile:'새로 만들기', open:'열기', save:'저장',
      saveAs:'다른 이름으로 저장', upload:'업로드', exportPng:'PNG로 내보내기', exportJpeg:'JPEG로 내보내기',
      download:'다운로드', undo:'실행 취소', redo:'다시 실행', reset:'초기화',
      tools:'도구', properties:'속성', transform:'변환', effects:'효과',
      resize:'크기 조정', scale:'배율', rotate:'회전', skew:'기울이기',
      flipH:'수평 뒤집기', flipV:'수직 뒤집기', crop:'자르기',
      width:'너비', height:'높이', angle:'각도', skewX:'기울기 X', skewY:'기울기 Y',
      apply:'적용', cancel:'취소', zoom:'확대/축소', zoomIn:'확대', zoomOut:'축소',
      fitScreen:'화면에 맞추기', actualSize:'실제 크기',
      grayscale:'회색조', sepia:'세피아', brightness:'밝기', contrast:'대비',
      blur:'흐림', invert:'반전', sharpen:'선명하게',
      gridOverlay:'격자', showGrid:'격자 표시',
      dragDrop:'이미지를 드래그 앤 드롭하거나 파일을 업로드하세요', noImage:'이미지가 로드되지 않았습니다',
      saved:'저장됨', error:'오류', lockAspect:'비율 잠금', quality:'품질',
      select:'선택', move:'이동', hand:'손', cropTool:'자르기',
      applyCrop:'자르기 적용', cancelCrop:'취소', pointer:'포인터', pan:'이동'
    },
    hi: {
      file:'फ़ाइल', edit:'संपादित करें', view:'दृश्य', newFile:'नया', open:'खोलें', save:'सहेजें',
      saveAs:'इस रूप में सहेजें', upload:'अपलोड', exportPng:'PNG के रूप में निर्यात', exportJpeg:'JPEG के रूप में निर्यात',
      download:'डाउनलोड', undo:'पूर्ववत करें', redo:'फिर से करें', reset:'रीसेट',
      tools:'उपकरण', properties:'गुण', transform:'रूपांतरण', effects:'प्रभाव',
      resize:'आकार बदलें', scale:'स्केल', rotate:'घुमाएं', skew:'तिरछा',
      flipH:'क्षैतिज फ़्लिप', flipV:'लंबवत फ़्लिप', crop:'क्रॉप',
      width:'चौड़ाई', height:'ऊंचाई', angle:'कोण', skewX:'तिरछा X', skewY:'तिरछा Y',
      apply:'लागू करें', cancel:'रद्द करें', zoom:'ज़ूम', zoomIn:'ज़ूम इन', zoomOut:'ज़ूम आउट',
      fitScreen:'स्क्रीन पर फिट', actualSize:'वास्तविक आकार',
      grayscale:'ग्रेस्केल', sepia:'सेपिया', brightness:'चमक', contrast:'कंट्रास्ट',
      blur:'धुंधला', invert:'उलटा', sharpen:'तेज़',
      gridOverlay:'ग्रिड', showGrid:'ग्रिड दिखाएं',
      dragDrop:'एक छवि खींचें और छोड़ें या फ़ाइल अपलोड करें', noImage:'कोई छवि लोड नहीं',
      saved:'सहेजा गया', error:'त्रुटि', lockAspect:'अनुपात लॉक', quality:'गुणवत्ता',
      select:'चुनें', move:'स्थानांतरित', hand:'हाथ', cropTool:'क्रॉप',
      applyCrop:'क्रॉप लागू करें', cancelCrop:'रद्द करें', pointer:'पॉइंटर', pan:'पैन'
    },
    pt: {
      file:'Arquivo', edit:'Editar', view:'Visualizar', newFile:'Novo', open:'Abrir', save:'Salvar',
      saveAs:'Salvar como', upload:'Carregar', exportPng:'Exportar como PNG', exportJpeg:'Exportar como JPEG',
      download:'Baixar', undo:'Desfazer', redo:'Refazer', reset:'Redefinir',
      tools:'Ferramentas', properties:'Propriedades', transform:'Transformar', effects:'Efeitos',
      resize:'Redimensionar', scale:'Escalar', rotate:'Girar', skew:'Inclinar',
      flipH:'Inverter horizontalmente', flipV:'Inverter verticalmente', crop:'Cortar',
      width:'Largura', height:'Altura', angle:'Ângulo', skewX:'Inclinação X', skewY:'Inclinação Y',
      apply:'Aplicar', cancel:'Cancelar', zoom:'Zoom', zoomIn:'Aumentar', zoomOut:'Diminuir',
      fitScreen:'Ajustar à tela', actualSize:'Tamanho real',
      grayscale:'Escala de cinza', sepia:'Sépia', brightness:'Brilho', contrast:'Contraste',
      blur:'Desfoque', invert:'Inverter', sharpen:'Nitidez',
      gridOverlay:'Grade', showGrid:'Mostrar grade',
      dragDrop:'Arraste e solte uma imagem ou carregue um arquivo', noImage:'Nenhuma imagem carregada',
      saved:'Salvo', error:'Erro', lockAspect:'Bloquear proporção', quality:'Qualidade',
      select:'Selecionar', move:'Mover', hand:'Mão', cropTool:'Cortar',
      applyCrop:'Aplicar corte', cancelCrop:'Cancelar', pointer:'Ponteiro', pan:'Panorâmica'
    }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      /* ─── Refs ─── */
      const canvasRef = ref(null);
      const canvasWrap = ref(null);
      const fileInput = ref(null);
      const rootRef = ref(null);

      /* ─── State ─── */
      const hasImage = ref(false);
      const imgW = ref(0);
      const imgH = ref(0);
      const zoomLevel = ref(100);
      const showGrid = ref(false);
      const activeTool = ref('pointer');
      const activePanel = ref('transform');
      const menuOpen = ref('');
      const dragging = ref(false);

      // Original image backup
      let originalImage = null;
      let ctx = null;

      // History
      const history = ref([]);
      const historyIdx = ref(-1);
      const MAX_HISTORY = 50;

      // Transform props
      const resizeW = ref(0);
      const resizeH = ref(0);
      const lockAspect = ref(true);
      let aspectRatio = 1;
      const scaleVal = ref(100);
      const rotateAngle = ref(0);
      const skewXVal = ref(0);
      const skewYVal = ref(0);

      // Effects
      const brightnessVal = ref(0);
      const contrastVal = ref(0);
      const blurVal = ref(0);

      // Export
      const exportFormat = ref('png');
      const exportQuality = ref(92);

      // Crop
      const cropping = ref(false);
      const cropRect = reactive({ x: 0, y: 0, w: 0, h: 0 });
      let cropStart = null;

      // Pan
      let panStart = null;
      let scrollStart = null;

      // File
      const currentFilePath = ref('');
      const currentFileName = ref('');

      const IMG_FILTERS = [
        { label: 'Images', extensions: ['.png', '.jpg', '.jpeg', '.bmp', '.gif', '.webp'] }
      ];

      /* ─── Canvas helpers ─── */
      function getCanvas() { return canvasRef.value; }
      function getCtx() {
        if (!ctx && canvasRef.value) ctx = canvasRef.value.getContext('2d', { willReadFrequently: true });
        return ctx;
      }

      function pushHistory() {
        const c = getCanvas();
        if (!c) return;
        if (historyIdx.value < history.value.length - 1) {
          history.value = history.value.slice(0, historyIdx.value + 1);
        }
        history.value.push(c.toDataURL());
        if (history.value.length > MAX_HISTORY) history.value.shift();
        historyIdx.value = history.value.length - 1;
      }

      function restoreHistory(idx) {
        const c = getCanvas();
        const context = getCtx();
        if (!c || !context || idx < 0 || idx >= history.value.length) return;
        const img = new Image();
        img.onload = () => {
          c.width = img.width;
          c.height = img.height;
          imgW.value = img.width;
          imgH.value = img.height;
          context.clearRect(0, 0, c.width, c.height);
          context.drawImage(img, 0, 0);
          syncResizeDims();
        };
        img.src = history.value[idx];
      }

      function undo() {
        if (historyIdx.value <= 0) return;
        historyIdx.value--;
        restoreHistory(historyIdx.value);
      }

      function redo() {
        if (historyIdx.value >= history.value.length - 1) return;
        historyIdx.value++;
        restoreHistory(historyIdx.value);
      }

      const canUndo = computed(() => historyIdx.value > 0);
      const canRedo = computed(() => historyIdx.value < history.value.length - 1);

      function syncResizeDims() {
        resizeW.value = imgW.value;
        resizeH.value = imgH.value;
        if (imgH.value > 0) aspectRatio = imgW.value / imgH.value;
      }

      /* ─── Load image ─── */
      function loadImage(img) {
        const c = getCanvas();
        if (!c) return;
        c.width = img.width;
        c.height = img.height;
        ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        imgW.value = img.width;
        imgH.value = img.height;
        hasImage.value = true;
        originalImage = c.toDataURL();
        syncResizeDims();
        scaleVal.value = 100;
        rotateAngle.value = 0;
        skewXVal.value = 0;
        skewYVal.value = 0;
        brightnessVal.value = 0;
        contrastVal.value = 0;
        blurVal.value = 0;
        history.value = [];
        historyIdx.value = -1;
        pushHistory();
        fitToScreen();
      }

      /* ─── File operations ─── */
      function newCanvas() {
        const c = getCanvas();
        if (!c) return;
        c.width = 800; c.height = 600;
        ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 800, 600);
        imgW.value = 800; imgH.value = 600;
        hasImage.value = true;
        originalImage = c.toDataURL();
        syncResizeDims();
        history.value = [];
        historyIdx.value = -1;
        pushHistory();
        currentFilePath.value = '';
        currentFileName.value = '';
        fitToScreen();
      }

      function uploadFile() { if (fileInput.value) fileInput.value.click(); }

      function onFileInput(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => loadImage(img);
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
        currentFileName.value = file.name;
        currentFilePath.value = '';
        e.target.value = '';
      }

      async function openFile() {
        if (!window.FileDialog) return;
        const result = await window.FileDialog.open({ title: '📂 ' + L('open'), filters: IMG_FILTERS });
        if (!result) return;
        try {
          const token = localStorage.getItem('auth_token') || '';
          const resp = await fetch('/api/fs/read-binary?path=' + encodeURIComponent(result.path), {
            headers: { 'Authorization': 'Bearer ' + token }
          });
          if (!resp.ok) { ElMessage.error(L('error')); return; }
          const data = await resp.json();
          const ext = (result.name.split('.').pop() || 'png').toLowerCase();
          const mimeMap = { png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg', bmp:'image/bmp', gif:'image/gif', webp:'image/webp' };
          const img = new Image();
          img.onload = () => loadImage(img);
          img.src = 'data:' + (mimeMap[ext] || 'image/png') + ';base64,' + data.content;
          currentFilePath.value = result.path;
          currentFileName.value = result.name;
        } catch { ElMessage.error(L('error')); }
      }

      async function saveFile() {
        if (currentFilePath.value) await saveToPath(currentFilePath.value);
        else await saveFileAs();
      }

      async function saveFileAs() {
        if (!window.FileDialog || !getCanvas()) return;
        const result = await window.FileDialog.save({
          title: '💾 ' + L('saveAs'),
          defaultName: currentFileName.value || 'imageforge-' + Date.now() + '.png',
          filters: [
            { label: 'PNG', extensions: ['.png'] },
            { label: 'JPEG', extensions: ['.jpg', '.jpeg'] }
          ]
        });
        if (!result) return;
        currentFilePath.value = result.path;
        currentFileName.value = result.name;
        await saveToPath(result.path);
      }

      async function saveToPath(filePath) {
        const c = getCanvas();
        if (!c) return;
        try {
          const ext = (filePath.split('.').pop() || 'png').toLowerCase();
          const mime = (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : 'image/png';
          const q = mime === 'image/jpeg' ? exportQuality.value / 100 : undefined;
          const dataUrl = c.toDataURL(mime, q);
          const b64 = dataUrl.split(',')[1];
          const token = localStorage.getItem('auth_token') || '';
          const resp = await fetch('/api/fs/write-binary', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath, content: b64 })
          });
          if (resp.ok) ElMessage.success(L('saved'));
          else ElMessage.error(L('error'));
        } catch { ElMessage.error(L('error')); }
      }

      function downloadAs(format) {
        const c = getCanvas();
        if (!c) return;
        const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const ext = format === 'jpeg' ? '.jpg' : '.png';
        const q = format === 'jpeg' ? exportQuality.value / 100 : undefined;
        const link = document.createElement('a');
        link.download = (currentFileName.value || 'imageforge-' + Date.now()) + ext;
        link.href = c.toDataURL(mime, q);
        link.click();
      }

      /* ─── Drag & Drop ─── */
      function onDragOver(e) { e.preventDefault(); dragging.value = true; }
      function onDragLeave() { dragging.value = false; }
      function onDrop(e) {
        e.preventDefault();
        dragging.value = false;
        const file = e.dataTransfer.files[0];
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => loadImage(img);
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
        currentFileName.value = file.name;
        currentFilePath.value = '';
      }

      /* ─── Zoom ─── */
      function setZoom(val) {
        zoomLevel.value = Math.max(10, Math.min(500, val));
      }

      function zoomIn() { setZoom(zoomLevel.value + 25); }
      function zoomOut() { setZoom(zoomLevel.value - 25); }

      function fitToScreen() {
        if (!canvasWrap.value || !hasImage.value) return;
        const wrap = canvasWrap.value;
        const padded = 40;
        const scaleX = (wrap.clientWidth - padded) / imgW.value;
        const scaleY = (wrap.clientHeight - padded) / imgH.value;
        const s = Math.min(scaleX, scaleY, 1);
        zoomLevel.value = Math.round(s * 100);
      }

      function actualSize() { zoomLevel.value = 100; }

      const canvasStyle = computed(() => ({
        width: Math.round(imgW.value * zoomLevel.value / 100) + 'px',
        height: Math.round(imgH.value * zoomLevel.value / 100) + 'px'
      }));

      /* ─── Transform: Resize ─── */
      function onResizeWChange() {
        if (lockAspect.value && aspectRatio > 0) {
          resizeH.value = Math.round(resizeW.value / aspectRatio);
        }
      }
      function onResizeHChange() {
        if (lockAspect.value && aspectRatio > 0) {
          resizeW.value = Math.round(resizeH.value * aspectRatio);
        }
      }

      function applyResize() {
        const c = getCanvas();
        const context = getCtx();
        if (!c || !context) return;
        const w = Math.max(1, Math.min(8000, resizeW.value));
        const h = Math.max(1, Math.min(8000, resizeH.value));
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = c.width;
        tempCanvas.height = c.height;
        tempCanvas.getContext('2d').drawImage(c, 0, 0);
        c.width = w; c.height = h;
        ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, w, h);
        imgW.value = w; imgH.value = h;
        syncResizeDims();
        pushHistory();
      }

      /* ─── Transform: Scale ─── */
      function applyScale() {
        const c = getCanvas();
        if (!c) return;
        const factor = scaleVal.value / 100;
        const nw = Math.round(imgW.value * factor);
        const nh = Math.round(imgH.value * factor);
        if (nw < 1 || nh < 1 || nw > 8000 || nh > 8000) return;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = c.width; tempCanvas.height = c.height;
        tempCanvas.getContext('2d').drawImage(c, 0, 0);
        c.width = nw; c.height = nh;
        ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, nw, nh);
        imgW.value = nw; imgH.value = nh;
        syncResizeDims();
        scaleVal.value = 100;
        pushHistory();
      }

      /* ─── Transform: Rotate ─── */
      function applyRotate() {
        const c = getCanvas();
        if (!c) return;
        const angle = rotateAngle.value * Math.PI / 180;
        const cos = Math.abs(Math.cos(angle));
        const sin = Math.abs(Math.sin(angle));
        const nw = Math.round(imgW.value * cos + imgH.value * sin);
        const nh = Math.round(imgW.value * sin + imgH.value * cos);
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = c.width; tempCanvas.height = c.height;
        tempCanvas.getContext('2d').drawImage(c, 0, 0);
        c.width = nw; c.height = nh;
        ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.translate(nw / 2, nh / 2);
        ctx.rotate(angle);
        ctx.drawImage(tempCanvas, -imgW.value / 2, -imgH.value / 2);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        imgW.value = nw; imgH.value = nh;
        syncResizeDims();
        rotateAngle.value = 0;
        pushHistory();
      }

      /* ─── Transform: Skew ─── */
      function applySkew() {
        const c = getCanvas();
        if (!c) return;
        const sx = Math.tan(skewXVal.value * Math.PI / 180);
        const sy = Math.tan(skewYVal.value * Math.PI / 180);
        const nw = Math.round(imgW.value + Math.abs(sx) * imgH.value);
        const nh = Math.round(imgH.value + Math.abs(sy) * imgW.value);
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = c.width; tempCanvas.height = c.height;
        tempCanvas.getContext('2d').drawImage(c, 0, 0);
        c.width = nw; c.height = nh;
        ctx = c.getContext('2d', { willReadFrequently: true });
        const ox = sx < 0 ? Math.abs(sx) * imgH.value : 0;
        const oy = sy < 0 ? Math.abs(sy) * imgW.value : 0;
        ctx.setTransform(1, sy, sx, 1, ox, oy);
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        imgW.value = nw; imgH.value = nh;
        syncResizeDims();
        skewXVal.value = 0; skewYVal.value = 0;
        pushHistory();
      }

      /* ─── Transform: Flip ─── */
      function flipH() {
        const c = getCanvas();
        const context = getCtx();
        if (!c || !context) return;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = c.width; tempCanvas.height = c.height;
        tempCanvas.getContext('2d').drawImage(c, 0, 0);
        context.clearRect(0, 0, c.width, c.height);
        context.save();
        context.translate(c.width, 0);
        context.scale(-1, 1);
        context.drawImage(tempCanvas, 0, 0);
        context.restore();
        pushHistory();
      }

      function flipV() {
        const c = getCanvas();
        const context = getCtx();
        if (!c || !context) return;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = c.width; tempCanvas.height = c.height;
        tempCanvas.getContext('2d').drawImage(c, 0, 0);
        context.clearRect(0, 0, c.width, c.height);
        context.save();
        context.translate(0, c.height);
        context.scale(1, -1);
        context.drawImage(tempCanvas, 0, 0);
        context.restore();
        pushHistory();
      }

      /* ─── Crop ─── */
      function startCrop() {
        activeTool.value = 'crop';
        cropping.value = true;
        cropRect.x = Math.round(imgW.value * 0.1);
        cropRect.y = Math.round(imgH.value * 0.1);
        cropRect.w = Math.round(imgW.value * 0.8);
        cropRect.h = Math.round(imgH.value * 0.8);
      }

      function applyCrop() {
        const c = getCanvas();
        const context = getCtx();
        if (!c || !context) return;
        const { x, y, w, h } = cropRect;
        if (w < 1 || h < 1) return;
        const imgData = context.getImageData(x, y, w, h);
        c.width = w; c.height = h;
        ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.putImageData(imgData, 0, 0);
        imgW.value = w; imgH.value = h;
        syncResizeDims();
        cropping.value = false;
        activeTool.value = 'pointer';
        pushHistory();
      }

      function cancelCrop() {
        cropping.value = false;
        activeTool.value = 'pointer';
      }

      // Crop drag handles
      let cropDragType = null;
      let cropDragStart = null;

      function getCropOverlayStyle() {
        const z = zoomLevel.value / 100;
        return {
          left: Math.round(cropRect.x * z) + 'px',
          top: Math.round(cropRect.y * z) + 'px',
          width: Math.round(cropRect.w * z) + 'px',
          height: Math.round(cropRect.h * z) + 'px'
        };
      }

      function onCropMouseDown(e, type) {
        e.preventDefault();
        e.stopPropagation();
        cropDragType = type;
        cropDragStart = { mx: e.clientX, my: e.clientY, ...cropRect };
        window.addEventListener('mousemove', onCropMouseMove);
        window.addEventListener('mouseup', onCropMouseUp);
      }

      function onCropMouseMove(e) {
        if (!cropDragStart) return;
        const z = zoomLevel.value / 100;
        const dx = (e.clientX - cropDragStart.mx) / z;
        const dy = (e.clientY - cropDragStart.my) / z;
        if (cropDragType === 'move') {
          cropRect.x = Math.max(0, Math.min(imgW.value - cropDragStart.w, Math.round(cropDragStart.x + dx)));
          cropRect.y = Math.max(0, Math.min(imgH.value - cropDragStart.h, Math.round(cropDragStart.y + dy)));
        } else if (cropDragType === 'se') {
          cropRect.w = Math.max(10, Math.min(imgW.value - cropRect.x, Math.round(cropDragStart.w + dx)));
          cropRect.h = Math.max(10, Math.min(imgH.value - cropRect.y, Math.round(cropDragStart.h + dy)));
        } else if (cropDragType === 'sw') {
          const newX = Math.max(0, Math.round(cropDragStart.x + dx));
          cropRect.w = Math.max(10, cropDragStart.w + (cropDragStart.x - newX));
          cropRect.x = newX;
          cropRect.h = Math.max(10, Math.min(imgH.value - cropRect.y, Math.round(cropDragStart.h + dy)));
        } else if (cropDragType === 'ne') {
          cropRect.w = Math.max(10, Math.min(imgW.value - cropRect.x, Math.round(cropDragStart.w + dx)));
          const newY = Math.max(0, Math.round(cropDragStart.y + dy));
          cropRect.h = Math.max(10, cropDragStart.h + (cropDragStart.y - newY));
          cropRect.y = newY;
        } else if (cropDragType === 'nw') {
          const newX = Math.max(0, Math.round(cropDragStart.x + dx));
          const newY = Math.max(0, Math.round(cropDragStart.y + dy));
          cropRect.w = Math.max(10, cropDragStart.w + (cropDragStart.x - newX));
          cropRect.h = Math.max(10, cropDragStart.h + (cropDragStart.y - newY));
          cropRect.x = newX;
          cropRect.y = newY;
        }
      }

      function onCropMouseUp() {
        cropDragType = null;
        cropDragStart = null;
        window.removeEventListener('mousemove', onCropMouseMove);
        window.removeEventListener('mouseup', onCropMouseUp);
      }

      /* ─── Effects ─── */
      function applyGrayscale() {
        const c = getCanvas();
        const context = getCtx();
        if (!c || !context) return;
        const imgData = context.getImageData(0, 0, c.width, c.height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const avg = d[i] * 0.299 + d[i+1] * 0.587 + d[i+2] * 0.114;
          d[i] = d[i+1] = d[i+2] = avg;
        }
        context.putImageData(imgData, 0, 0);
        pushHistory();
      }

      function applySepia() {
        const c = getCanvas();
        const context = getCtx();
        if (!c || !context) return;
        const imgData = context.getImageData(0, 0, c.width, c.height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i+1], b = d[i+2];
          d[i]   = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
          d[i+1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
          d[i+2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
        }
        context.putImageData(imgData, 0, 0);
        pushHistory();
      }

      function applyInvert() {
        const c = getCanvas();
        const context = getCtx();
        if (!c || !context) return;
        const imgData = context.getImageData(0, 0, c.width, c.height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          d[i] = 255 - d[i];
          d[i+1] = 255 - d[i+1];
          d[i+2] = 255 - d[i+2];
        }
        context.putImageData(imgData, 0, 0);
        pushHistory();
      }

      function applyBrightness() {
        const c = getCanvas();
        const context = getCtx();
        if (!c || !context) return;
        // Restore from current history then apply
        const b = brightnessVal.value;
        if (b === 0) return;
        const imgData = context.getImageData(0, 0, c.width, c.height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          d[i] = Math.max(0, Math.min(255, d[i] + b));
          d[i+1] = Math.max(0, Math.min(255, d[i+1] + b));
          d[i+2] = Math.max(0, Math.min(255, d[i+2] + b));
        }
        context.putImageData(imgData, 0, 0);
        brightnessVal.value = 0;
        pushHistory();
      }

      function applyContrast() {
        const c = getCanvas();
        const context = getCtx();
        if (!c || !context) return;
        const con = contrastVal.value;
        if (con === 0) return;
        const factor = (259 * (con + 255)) / (255 * (259 - con));
        const imgData = context.getImageData(0, 0, c.width, c.height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          d[i]   = Math.max(0, Math.min(255, factor * (d[i] - 128) + 128));
          d[i+1] = Math.max(0, Math.min(255, factor * (d[i+1] - 128) + 128));
          d[i+2] = Math.max(0, Math.min(255, factor * (d[i+2] - 128) + 128));
        }
        context.putImageData(imgData, 0, 0);
        contrastVal.value = 0;
        pushHistory();
      }

      function applyBlur() {
        const c = getCanvas();
        const context = getCtx();
        if (!c || !context) return;
        const radius = blurVal.value;
        if (radius <= 0) return;
        // Use CSS filter via temp canvas for blur
        const temp = document.createElement('canvas');
        temp.width = c.width; temp.height = c.height;
        const tCtx = temp.getContext('2d');
        tCtx.filter = 'blur(' + radius + 'px)';
        tCtx.drawImage(c, 0, 0);
        context.clearRect(0, 0, c.width, c.height);
        context.drawImage(temp, 0, 0);
        blurVal.value = 0;
        pushHistory();
      }

      function applySharpen() {
        const c = getCanvas();
        const context = getCtx();
        if (!c || !context) return;
        const w = c.width, h = c.height;
        const imgData = context.getImageData(0, 0, w, h);
        const src = imgData.data;
        const out = new Uint8ClampedArray(src);
        // Simple 3x3 sharpen kernel
        const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            for (let ch = 0; ch < 3; ch++) {
              let sum = 0;
              for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                  const idx = ((y + ky) * w + (x + kx)) * 4 + ch;
                  sum += src[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
                }
              }
              out[(y * w + x) * 4 + ch] = Math.max(0, Math.min(255, sum));
            }
          }
        }
        imgData.data.set(out);
        context.putImageData(imgData, 0, 0);
        pushHistory();
      }

      /* ─── Reset ─── */
      function resetImage() {
        if (!originalImage) return;
        const c = getCanvas();
        if (!c) return;
        const img = new Image();
        img.onload = () => {
          c.width = img.width; c.height = img.height;
          ctx = c.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(img, 0, 0);
          imgW.value = img.width; imgH.value = img.height;
          syncResizeDims();
          brightnessVal.value = 0;
          contrastVal.value = 0;
          blurVal.value = 0;
          scaleVal.value = 100;
          rotateAngle.value = 0;
          skewXVal.value = 0;
          skewYVal.value = 0;
          pushHistory();
        };
        img.src = originalImage;
      }

      /* ─── Canvas mouse (pan) ─── */
      function onCanvasMouseDown(e) {
        if (activeTool.value === 'pan' && canvasWrap.value) {
          panStart = { x: e.clientX, y: e.clientY };
          scrollStart = { x: canvasWrap.value.scrollLeft, y: canvasWrap.value.scrollTop };
          window.addEventListener('mousemove', onCanvasPanMove);
          window.addEventListener('mouseup', onCanvasPanUp);
        }
      }

      function onCanvasPanMove(e) {
        if (!panStart || !canvasWrap.value) return;
        canvasWrap.value.scrollLeft = scrollStart.x - (e.clientX - panStart.x);
        canvasWrap.value.scrollTop = scrollStart.y - (e.clientY - panStart.y);
      }

      function onCanvasPanUp() {
        panStart = null; scrollStart = null;
        window.removeEventListener('mousemove', onCanvasPanMove);
        window.removeEventListener('mouseup', onCanvasPanUp);
      }

      function onCanvasWheel(e) {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (e.deltaY < 0) zoomIn();
          else zoomOut();
        }
      }

      /* ─── Menu ─── */
      function toggleMenu(name) {
        menuOpen.value = menuOpen.value === name ? '' : name;
      }
      function closeMenu() { menuOpen.value = ''; }

      /* ─── Tools list ─── */
      const toolsList = computed(() => [
        { id: 'pointer', icon: '🖱️', label: L('pointer') },
        { id: 'pan', icon: '✋', label: L('pan') },
        { id: 'crop', icon: '✂️', label: L('cropTool') }
      ]);

      /* ─── Keyboard shortcuts ─── */
      function onKeyDown(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) { e.preventDefault(); redo(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveFile(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'o') { e.preventDefault(); openFile(); }
        if (e.key === '+' || e.key === '=') { if (e.ctrlKey) { e.preventDefault(); zoomIn(); } }
        if (e.key === '-') { if (e.ctrlKey) { e.preventDefault(); zoomOut(); } }
      }

      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

      onMounted(() => {
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('locale-changed', onLocaleChanged);
      });

      onUnmounted(() => {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('locale-changed', onLocaleChanged);
        window.removeEventListener('mousemove', onCropMouseMove);
        window.removeEventListener('mouseup', onCropMouseUp);
        window.removeEventListener('mousemove', onCanvasPanMove);
        window.removeEventListener('mouseup', onCanvasPanUp);
      });

      return {
        L, locale, canvasRef, canvasWrap, fileInput, rootRef,
        hasImage, imgW, imgH, zoomLevel, showGrid, activeTool, activePanel,
        menuOpen, dragging, canUndo, canRedo,
        resizeW, resizeH, lockAspect, scaleVal, rotateAngle, skewXVal, skewYVal,
        brightnessVal, contrastVal, blurVal, exportQuality,
        cropping, cropRect, canvasStyle, toolsList,
        currentFileName,
        // Methods
        undo, redo, newCanvas, uploadFile, onFileInput, openFile, saveFile, saveFileAs,
        downloadAs, resetImage,
        onDragOver, onDragLeave, onDrop,
        zoomIn, zoomOut, fitToScreen, actualSize, setZoom,
        onResizeWChange, onResizeHChange, applyResize,
        applyScale, applyRotate, applySkew,
        flipH, flipV,
        startCrop, applyCrop, cancelCrop, getCropOverlayStyle, onCropMouseDown,
        applyGrayscale, applySepia, applyInvert, applyBrightness, applyContrast, applyBlur, applySharpen,
        toggleMenu, closeMenu,
        onCanvasMouseDown, onCanvasWheel
      };
    }
  };
})(Vue);
