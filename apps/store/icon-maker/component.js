(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, nextTick, watch } = Vue;

  const LANGS = {
    tr: {
      canvasSize:'Tuval Boyutu', tools:'Araçlar', color:'Renk', showGrid:'Izgarayı Göster',
      clear:'Temizle', undo:'Geri Al', redo:'Yinele', save:'Kaydet', load:'Yükle',
      downloadPng:'PNG İndir', downloadIco:'ICO İndir', import:'İçe Aktar',
      preview:'Önizleme', savedIcons:'Kayıtlı İkonlar', noIcons:'Henüz ikon yok',
      saveIcon:'İkonu Kaydet', iconName:'İkon Adı', iconNamePlaceholder:'İkon adı girin...',
      cancel:'İptal', untitled:'Adsız', saved:'Kaydedildi', deleted:'Silindi', loaded:'Yüklendi',
      error:'Hata', confirmDelete:'Bu ikonu silmek istediğinizden emin misiniz?',
      draw:'Çiz', erase:'Sil', fill:'Doldur', picker:'Renk Seç', move:'Taşı', mirror:'Yansıt',
      clearConfirm:'Tuvali temizlemek istediğinizden emin misiniz?'
    },
    en: {
      canvasSize:'Canvas Size', tools:'Tools', color:'Color', showGrid:'Show Grid',
      clear:'Clear', undo:'Undo', redo:'Redo', save:'Save', load:'Load',
      downloadPng:'Download PNG', downloadIco:'Download ICO', import:'Import',
      preview:'Preview', savedIcons:'Saved Icons', noIcons:'No icons yet',
      saveIcon:'Save Icon', iconName:'Icon Name', iconNamePlaceholder:'Enter icon name...',
      cancel:'Cancel', untitled:'Untitled', saved:'Saved', deleted:'Deleted', loaded:'Loaded',
      error:'Error', confirmDelete:'Are you sure you want to delete this icon?',
      draw:'Draw', erase:'Erase', fill:'Fill', picker:'Pick Color', move:'Move', mirror:'Mirror',
      clearConfirm:'Are you sure you want to clear the canvas?'
    },
    de: {
      canvasSize:'Leinwandgröße', tools:'Werkzeuge', color:'Farbe', showGrid:'Raster anzeigen',
      clear:'Löschen', undo:'Rückgängig', redo:'Wiederholen', save:'Speichern', load:'Laden',
      downloadPng:'PNG herunterladen', downloadIco:'ICO herunterladen', import:'Importieren',
      preview:'Vorschau', savedIcons:'Gespeicherte Icons', noIcons:'Noch keine Icons',
      saveIcon:'Icon speichern', iconName:'Icon-Name', iconNamePlaceholder:'Icon-Name eingeben...',
      cancel:'Abbrechen', untitled:'Unbenannt', saved:'Gespeichert', deleted:'Gelöscht', loaded:'Geladen',
      error:'Fehler', confirmDelete:'Möchten Sie dieses Icon wirklich löschen?',
      draw:'Zeichnen', erase:'Radieren', fill:'Füllen', picker:'Farbwähler', move:'Bewegen', mirror:'Spiegeln',
      clearConfirm:'Möchten Sie die Leinwand wirklich löschen?'
    },
    fr: {
      canvasSize:'Taille du canevas', tools:'Outils', color:'Couleur', showGrid:'Afficher la grille',
      clear:'Effacer', undo:'Annuler', redo:'Rétablir', save:'Enregistrer', load:'Charger',
      downloadPng:'Télécharger PNG', downloadIco:'Télécharger ICO', import:'Importer',
      preview:'Aperçu', savedIcons:'Icônes enregistrées', noIcons:'Aucune icône',
      saveIcon:'Enregistrer l\'icône', iconName:'Nom de l\'icône', iconNamePlaceholder:'Entrez le nom...',
      cancel:'Annuler', untitled:'Sans titre', saved:'Enregistré', deleted:'Supprimé', loaded:'Chargé',
      error:'Erreur', confirmDelete:'Voulez-vous vraiment supprimer cette icône?',
      draw:'Dessiner', erase:'Effacer', fill:'Remplir', picker:'Pipette', move:'Déplacer', mirror:'Miroir',
      clearConfirm:'Voulez-vous vraiment effacer le canevas?'
    },
    es: {
      canvasSize:'Tamaño del lienzo', tools:'Herramientas', color:'Color', showGrid:'Mostrar cuadrícula',
      clear:'Limpiar', undo:'Deshacer', redo:'Rehacer', save:'Guardar', load:'Cargar',
      downloadPng:'Descargar PNG', downloadIco:'Descargar ICO', import:'Importar',
      preview:'Vista previa', savedIcons:'Iconos guardados', noIcons:'Sin iconos aún',
      saveIcon:'Guardar icono', iconName:'Nombre del icono', iconNamePlaceholder:'Ingrese nombre...',
      cancel:'Cancelar', untitled:'Sin título', saved:'Guardado', deleted:'Eliminado', loaded:'Cargado',
      error:'Error', confirmDelete:'¿Está seguro de que desea eliminar este icono?',
      draw:'Dibujar', erase:'Borrar', fill:'Rellenar', picker:'Selector', move:'Mover', mirror:'Espejo',
      clearConfirm:'¿Está seguro de que desea limpiar el lienzo?'
    },
    ru: {
      canvasSize:'Размер холста', tools:'Инструменты', color:'Цвет', showGrid:'Показать сетку',
      clear:'Очистить', undo:'Отменить', redo:'Повторить', save:'Сохранить', load:'Загрузить',
      downloadPng:'Скачать PNG', downloadIco:'Скачать ICO', import:'Импорт',
      preview:'Предпросмотр', savedIcons:'Сохранённые иконки', noIcons:'Иконок пока нет',
      saveIcon:'Сохранить иконку', iconName:'Имя иконки', iconNamePlaceholder:'Введите имя...',
      cancel:'Отмена', untitled:'Без названия', saved:'Сохранено', deleted:'Удалено', loaded:'Загружено',
      error:'Ошибка', confirmDelete:'Вы уверены, что хотите удалить эту иконку?',
      draw:'Рисовать', erase:'Стереть', fill:'Залить', picker:'Пипетка', move:'Двигать', mirror:'Зеркало',
      clearConfirm:'Вы уверены, что хотите очистить холст?'
    },
    zh: {
      canvasSize:'画布大小', tools:'工具', color:'颜色', showGrid:'显示网格',
      clear:'清除', undo:'撤销', redo:'重做', save:'保存', load:'加载',
      downloadPng:'下载 PNG', downloadIco:'下载 ICO', import:'导入',
      preview:'预览', savedIcons:'已保存图标', noIcons:'暂无图标',
      saveIcon:'保存图标', iconName:'图标名称', iconNamePlaceholder:'输入图标名称...',
      cancel:'取消', untitled:'未命名', saved:'已保存', deleted:'已删除', loaded:'已加载',
      error:'错误', confirmDelete:'确定要删除此图标吗？',
      draw:'绘制', erase:'擦除', fill:'填充', picker:'取色', move:'移动', mirror:'镜像',
      clearConfirm:'确定要清除画布吗？'
    },
    ja: {
      canvasSize:'キャンバスサイズ', tools:'ツール', color:'色', showGrid:'グリッド表示',
      clear:'クリア', undo:'元に戻す', redo:'やり直し', save:'保存', load:'読込',
      downloadPng:'PNG ダウンロード', downloadIco:'ICO ダウンロード', import:'インポート',
      preview:'プレビュー', savedIcons:'保存済みアイコン', noIcons:'アイコンなし',
      saveIcon:'アイコンを保存', iconName:'アイコン名', iconNamePlaceholder:'アイコン名を入力...',
      cancel:'キャンセル', untitled:'無題', saved:'保存しました', deleted:'削除しました', loaded:'読み込みました',
      error:'エラー', confirmDelete:'このアイコンを削除しますか？',
      draw:'描画', erase:'消去', fill:'塗りつぶし', picker:'スポイト', move:'移動', mirror:'反転',
      clearConfirm:'キャンバスをクリアしますか？'
    },
    it: {
      canvasSize:'Dimensione tela', tools:'Strumenti', color:'Colore', showGrid:'Mostra griglia',
      clear:'Pulisci', undo:'Annulla', redo:'Ripeti', save:'Salva', load:'Carica',
      downloadPng:'Scarica PNG', downloadIco:'Scarica ICO', import:'Importa',
      preview:'Anteprima', savedIcons:'Icone salvate', noIcons:'Nessuna icona',
      saveIcon:'Salva icona', iconName:'Nome icona', iconNamePlaceholder:'Inserisci nome...',
      cancel:'Annulla', untitled:'Senza titolo', saved:'Salvato', deleted:'Eliminato', loaded:'Caricato',
      error:'Errore', confirmDelete:'Sei sicuro di voler eliminare questa icona?',
      draw:'Disegna', erase:'Cancella', fill:'Riempi', picker:'Contagocce', move:'Sposta', mirror:'Specchia',
      clearConfirm:'Sei sicuro di voler pulire la tela?'
    },
    ar: {
      canvasSize:'حجم اللوحة', tools:'الأدوات', color:'اللون', showGrid:'إظهار الشبكة',
      clear:'مسح', undo:'تراجع', redo:'إعادة', save:'حفظ', load:'تحميل',
      downloadPng:'تنزيل PNG', downloadIco:'تنزيل ICO', import:'استيراد',
      preview:'معاينة', savedIcons:'الأيقونات المحفوظة', noIcons:'لا توجد أيقونات',
      saveIcon:'حفظ الأيقونة', iconName:'اسم الأيقونة', iconNamePlaceholder:'أدخل الاسم...',
      cancel:'إلغاء', untitled:'بدون عنوان', saved:'تم الحفظ', deleted:'تم الحذف', loaded:'تم التحميل',
      error:'خطأ', confirmDelete:'هل أنت متأكد من حذف هذه الأيقونة؟',
      draw:'رسم', erase:'محو', fill:'ملء', picker:'منتقي', move:'نقل', mirror:'عكس',
      clearConfirm:'هل أنت متأكد من مسح اللوحة؟'
    },
    ko: {
      canvasSize:'캔버스 크기', tools:'도구', color:'색상', showGrid:'그리드 표시',
      clear:'지우기', undo:'실행 취소', redo:'다시 실행', save:'저장', load:'불러오기',
      downloadPng:'PNG 다운로드', downloadIco:'ICO 다운로드', import:'가져오기',
      preview:'미리보기', savedIcons:'저장된 아이콘', noIcons:'아이콘 없음',
      saveIcon:'아이콘 저장', iconName:'아이콘 이름', iconNamePlaceholder:'아이콘 이름 입력...',
      cancel:'취소', untitled:'제목 없음', saved:'저장됨', deleted:'삭제됨', loaded:'불러옴',
      error:'오류', confirmDelete:'이 아이콘을 삭제하시겠습니까?',
      draw:'그리기', erase:'지우개', fill:'채우기', picker:'스포이트', move:'이동', mirror:'반전',
      clearConfirm:'캔버스를 지우시겠습니까?'
    },
    hi: {
      canvasSize:'कैनवास आकार', tools:'उपकरण', color:'रंग', showGrid:'ग्रिड दिखाएं',
      clear:'साफ करें', undo:'पूर्ववत करें', redo:'फिर से करें', save:'सहेजें', load:'लोड करें',
      downloadPng:'PNG डाउनलोड', downloadIco:'ICO डाउनलोड', import:'आयात करें',
      preview:'पूर्वावलोकन', savedIcons:'सहेजे गए आइकन', noIcons:'कोई आइकन नहीं',
      saveIcon:'आइकन सहेजें', iconName:'आइकन नाम', iconNamePlaceholder:'आइकन नाम दर्ज करें...',
      cancel:'रद्द करें', untitled:'शीर्षकहीन', saved:'सहेजा गया', deleted:'हटाया गया', loaded:'लोड किया गया',
      error:'त्रुटि', confirmDelete:'क्या आप इस आइकन को हटाना चाहते हैं?',
      draw:'ड्रा', erase:'मिटाएं', fill:'भरें', picker:'पिकर', move:'मूव', mirror:'मिरर',
      clearConfirm:'क्या आप कैनवास साफ करना चाहते हैं?'
    },
    pt: {
      canvasSize:'Tamanho da tela', tools:'Ferramentas', color:'Cor', showGrid:'Mostrar grade',
      clear:'Limpar', undo:'Desfazer', redo:'Refazer', save:'Salvar', load:'Carregar',
      downloadPng:'Baixar PNG', downloadIco:'Baixar ICO', import:'Importar',
      preview:'Pré-visualização', savedIcons:'Ícones salvos', noIcons:'Nenhum ícone',
      saveIcon:'Salvar ícone', iconName:'Nome do ícone', iconNamePlaceholder:'Digite o nome...',
      cancel:'Cancelar', untitled:'Sem título', saved:'Salvo', deleted:'Excluído', loaded:'Carregado',
      error:'Erro', confirmDelete:'Tem certeza de que deseja excluir este ícone?',
      draw:'Desenhar', erase:'Apagar', fill:'Preencher', picker:'Conta-gotas', move:'Mover', mirror:'Espelhar',
      clearConfirm:'Tem certeza de que deseja limpar a tela?'
    }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      // Canvas
      const pixelCanvas = ref(null);
      const gridCanvas = ref(null);
      const canvasWrap = ref(null);
      const fileInput = ref(null);
      let ctx = null;

      // State
      const canvasSize = ref(32);
      const sizeOptions = [16, 24, 32, 48, 64, 128];
      const showGrid = ref(true);
      const activeTool = ref('draw');
      const currentColor = ref('#000000');
      const currentFileName = ref('');

      const toolList = [
        { id: 'draw', icon: '✏️' },
        { id: 'erase', icon: '🧹' },
        { id: 'fill', icon: '🪣' },
        { id: 'picker', icon: '💧' },
        { id: 'mirror', icon: '🪞' }
      ];

      const palette = [
        '#000000', '#ffffff', '#808080', '#c0c0c0',
        '#ff0000', '#ff6b6b', '#800000', '#ff8c00',
        '#ffa500', '#ffff00', '#f6d365', '#008000',
        '#00ff00', '#2ecc71', '#008080', '#00ffff',
        '#0000ff', '#4a90d9', '#000080', '#800080',
        '#ff00ff', '#a29bfe', '#6c5ce7', '#ff69b4',
        '#a0522d', '#deb887', '#ffe4c4', '#ff1493',
        'rgba(0,0,0,0)'
      ];

      const previewSizes = [16, 32, 48, 64];
      const previewRefs = {};

      // History
      const historyStack = ref([]);
      const historyIdx = ref(-1);
      const MAX_HISTORY = 50;

      // Save dialog
      const showSaveDialog = ref(false);
      const saveName = ref('');

      // Saved icons
      const savedIcons = ref([]);
      const loadingIcons = ref(false);

      // Drawing state
      let drawing = false;
      let mirrorMode = false;

      // Display size (zoom)
      const displaySize = computed(() => {
        const sz = canvasSize.value;
        if (sz <= 16) return 400;
        if (sz <= 32) return 416;
        if (sz <= 48) return 432;
        if (sz <= 64) return 448;
        return 512;
      });

      const canvasCursor = computed(() => {
        switch (activeTool.value) {
          case 'draw': return 'crosshair';
          case 'erase': return 'cell';
          case 'fill': return 'cell';
          case 'picker': return 'crosshair';
          default: return 'crosshair';
        }
      });

      function setPreviewRef(el, size) {
        if (el) previewRefs[size] = el;
      }

      // Init
      function initCanvas() {
        const c = pixelCanvas.value;
        if (!c) return;
        ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.clearRect(0, 0, canvasSize.value, canvasSize.value);
        pushHistory();
        drawGrid();
        updatePreviews();
      }

      function drawGrid() {
        nextTick(() => {
          const gc = gridCanvas.value;
          if (!gc || !showGrid.value) return;
          const gctx = gc.getContext('2d');
          const sz = canvasSize.value;
          gctx.clearRect(0, 0, sz, sz);
          gctx.strokeStyle = 'rgba(255,255,255,0.15)';
          gctx.lineWidth = 0.02;
          for (let x = 0; x <= sz; x++) {
            gctx.beginPath();
            gctx.moveTo(x, 0);
            gctx.lineTo(x, sz);
            gctx.stroke();
          }
          for (let y = 0; y <= sz; y++) {
            gctx.beginPath();
            gctx.moveTo(0, y);
            gctx.lineTo(sz, y);
            gctx.stroke();
          }
        });
      }

      function updatePreviews() {
        if (!pixelCanvas.value) return;
        for (const ps of previewSizes) {
          const pc = previewRefs[ps];
          if (!pc) continue;
          const pctx = pc.getContext('2d');
          pctx.clearRect(0, 0, ps, ps);
          pctx.imageSmoothingEnabled = false;
          pctx.drawImage(pixelCanvas.value, 0, 0, ps, ps);
        }
      }

      function pushHistory() {
        if (!ctx) return;
        if (historyIdx.value < historyStack.value.length - 1) {
          historyStack.value = historyStack.value.slice(0, historyIdx.value + 1);
        }
        const data = pixelCanvas.value.toDataURL();
        historyStack.value.push(data);
        if (historyStack.value.length > MAX_HISTORY) historyStack.value.shift();
        historyIdx.value = historyStack.value.length - 1;
        updatePreviews();
      }

      function restoreFromHistory(idx) {
        if (!ctx || idx < 0 || idx >= historyStack.value.length) return;
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvasSize.value, canvasSize.value);
          ctx.drawImage(img, 0, 0);
          updatePreviews();
        };
        img.src = historyStack.value[idx];
      }

      function undo() {
        if (historyIdx.value <= 0) return;
        historyIdx.value--;
        restoreFromHistory(historyIdx.value);
      }

      function redo() {
        if (historyIdx.value >= historyStack.value.length - 1) return;
        historyIdx.value++;
        restoreFromHistory(historyIdx.value);
      }

      // Pixel coordinate from mouse event
      function getPixelPos(e) {
        const c = pixelCanvas.value;
        const rect = c.getBoundingClientRect();
        const scaleX = c.width / rect.width;
        const scaleY = c.height / rect.height;
        return {
          x: Math.floor((e.clientX - rect.left) * scaleX),
          y: Math.floor((e.clientY - rect.top) * scaleY)
        };
      }

      // Draw a single pixel
      function drawPixel(x, y, color) {
        const sz = canvasSize.value;
        if (x < 0 || x >= sz || y < 0 || y >= sz) return;
        if (color === 'rgba(0,0,0,0)' || color === 'transparent') {
          ctx.clearRect(x, y, 1, 1);
        } else {
          ctx.fillStyle = color;
          ctx.fillRect(x, y, 1, 1);
        }
      }

      // Erase pixel
      function erasePixel(x, y) {
        const sz = canvasSize.value;
        if (x < 0 || x >= sz || y < 0 || y >= sz) return;
        ctx.clearRect(x, y, 1, 1);
      }

      // Color picker at pixel
      function pickColor(x, y) {
        const sz = canvasSize.value;
        if (x < 0 || x >= sz || y < 0 || y >= sz) return;
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        if (pixel[3] === 0) {
          currentColor.value = 'rgba(0,0,0,0)';
        } else {
          currentColor.value = '#' + [pixel[0], pixel[1], pixel[2]].map(v => v.toString(16).padStart(2, '0')).join('');
        }
      }

      // Flood fill
      function floodFill(sx, sy, fillColor) {
        const sz = canvasSize.value;
        if (sx < 0 || sx >= sz || sy < 0 || sy >= sz) return;
        const imgData = ctx.getImageData(0, 0, sz, sz);
        const data = imgData.data;

        const tIdx = (sy * sz + sx) * 4;
        const tR = data[tIdx], tG = data[tIdx + 1], tB = data[tIdx + 2], tA = data[tIdx + 3];

        let fR, fG, fB, fA;
        if (fillColor === 'rgba(0,0,0,0)' || fillColor === 'transparent') {
          fR = 0; fG = 0; fB = 0; fA = 0;
        } else {
          const fc = parseColor(fillColor);
          if (!fc) return;
          fR = fc.r; fG = fc.g; fB = fc.b; fA = fc.a;
        }

        if (tR === fR && tG === fG && tB === fB && tA === fA) return;

        const stack = [[sx, sy]];
        const visited = new Uint8Array(sz * sz);

        while (stack.length > 0) {
          const [cx, cy] = stack.pop();
          if (cx < 0 || cx >= sz || cy < 0 || cy >= sz) continue;
          const pi = cy * sz + cx;
          if (visited[pi]) continue;
          const di = pi * 4;
          if (data[di] !== tR || data[di + 1] !== tG || data[di + 2] !== tB || data[di + 3] !== tA) continue;
          visited[pi] = 1;
          data[di] = fR;
          data[di + 1] = fG;
          data[di + 2] = fB;
          data[di + 3] = fA;
          stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
        }
        ctx.putImageData(imgData, 0, 0);
      }

      function parseColor(str) {
        if (!str) return null;
        if (str.startsWith('#')) {
          const m = str.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i);
          if (m) return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16), a: m[4] ? parseInt(m[4], 16) : 255 };
        }
        if (str.startsWith('rgba')) {
          const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
          if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? Math.round(+m[4] * 255) : 255 };
        }
        if (str.startsWith('rgb')) {
          const m = str.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
          if (m) return { r: +m[1], g: +m[2], b: +m[3], a: 255 };
        }
        return { r: 0, g: 0, b: 0, a: 255 };
      }

      // Canvas mouse handlers
      let lastPx = -1, lastPy = -1;

      function onCanvasMouseDown(e) {
        const pos = getPixelPos(e);
        if (activeTool.value === 'fill') {
          floodFill(pos.x, pos.y, currentColor.value);
          if (mirrorMode) {
            floodFill(canvasSize.value - 1 - pos.x, pos.y, currentColor.value);
          }
          pushHistory();
          return;
        }
        if (activeTool.value === 'picker') {
          pickColor(pos.x, pos.y);
          return;
        }
        if (activeTool.value === 'mirror') {
          mirrorMode = !mirrorMode;
          return;
        }
        drawing = true;
        lastPx = pos.x;
        lastPy = pos.y;
        applyTool(pos.x, pos.y);
        updatePreviews();
      }

      function onCanvasMouseMove(e) {
        if (!drawing) return;
        const pos = getPixelPos(e);
        // Bresenham line to avoid skipping pixels
        bresenham(lastPx, lastPy, pos.x, pos.y, (x, y) => applyTool(x, y));
        lastPx = pos.x;
        lastPy = pos.y;
        updatePreviews();
      }

      function onCanvasMouseUp() {
        if (!drawing) return;
        drawing = false;
        lastPx = -1;
        lastPy = -1;
        pushHistory();
      }

      function applyTool(x, y) {
        if (activeTool.value === 'draw') {
          drawPixel(x, y, currentColor.value);
          if (mirrorMode) drawPixel(canvasSize.value - 1 - x, y, currentColor.value);
        } else if (activeTool.value === 'erase') {
          erasePixel(x, y);
          if (mirrorMode) erasePixel(canvasSize.value - 1 - x, y);
        }
      }

      function bresenham(x0, y0, x1, y1, plot) {
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;
        while (true) {
          plot(x0, y0);
          if (x0 === x1 && y0 === y1) break;
          const e2 = 2 * err;
          if (e2 > -dy) { err -= dy; x0 += sx; }
          if (e2 < dx) { err += dx; y0 += sy; }
        }
      }

      // Clear
      function clearCanvas() {
        ElMessageBox.confirm(L('clearConfirm'), '', { type: 'warning', confirmButtonText: 'OK', cancelButtonText: L('cancel') })
          .then(() => {
            ctx.clearRect(0, 0, canvasSize.value, canvasSize.value);
            pushHistory();
          }).catch(() => {});
      }

      // Size change
      function onSizeChange(newSize) {
        const oldData = pixelCanvas.value.toDataURL();
        canvasSize.value = newSize;
        nextTick(() => {
          ctx = pixelCanvas.value.getContext('2d', { willReadFrequently: true });
          ctx.clearRect(0, 0, newSize, newSize);
          // Try to paste old content scaled
          const img = new Image();
          img.onload = () => {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0, newSize, newSize);
            historyStack.value = [];
            historyIdx.value = -1;
            pushHistory();
            drawGrid();
          };
          img.src = oldData;
        });
      }

      // Save to server
      function saveToServer() {
        saveName.value = currentFileName.value || '';
        showSaveDialog.value = true;
      }

      async function confirmSave() {
        if (!saveName.value.trim()) return;
        showSaveDialog.value = false;
        try {
          const token = localStorage.getItem('auth_token') || '';
          const dataUrl = pixelCanvas.value.toDataURL('image/png');
          const body = {
            name: saveName.value.trim(),
            size: canvasSize.value,
            data: dataUrl
          };
          const resp = await fetch('/api/icon-maker/icons', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          if (resp.ok) {
            currentFileName.value = saveName.value.trim();
            ElMessage.success(L('saved'));
            loadIconList();
          } else {
            ElMessage.error(L('error'));
          }
        } catch { ElMessage.error(L('error')); }
      }

      // Load icon list from server
      async function loadIconList() {
        loadingIcons.value = true;
        try {
          const token = localStorage.getItem('auth_token') || '';
          const resp = await fetch('/api/icon-maker/icons', {
            headers: { 'Authorization': 'Bearer ' + token }
          });
          if (resp.ok) {
            const data = await resp.json();
            savedIcons.value = data.icons || [];
          }
        } catch { /* ignore */ }
        loadingIcons.value = false;
      }

      // Load from server
      function loadFromServer() {
        loadIconList();
      }

      // Load a specific icon
      function loadIcon(ic) {
        const img = new Image();
        img.onload = () => {
          canvasSize.value = ic.size || img.width;
          nextTick(() => {
            ctx = pixelCanvas.value.getContext('2d', { willReadFrequently: true });
            ctx.clearRect(0, 0, canvasSize.value, canvasSize.value);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0);
            currentFileName.value = ic.name;
            historyStack.value = [];
            historyIdx.value = -1;
            pushHistory();
            drawGrid();
            ElMessage.success(L('loaded'));
          });
        };
        img.src = ic.data || ic.thumbnail;
      }

      // Delete icon
      async function deleteIcon(id) {
        try {
          await ElMessageBox.confirm(L('confirmDelete'), '', { type: 'warning', confirmButtonText: 'OK', cancelButtonText: L('cancel') });
        } catch { return; }
        try {
          const token = localStorage.getItem('auth_token') || '';
          const resp = await fetch('/api/icon-maker/icons/' + encodeURIComponent(id), {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
          });
          if (resp.ok) {
            ElMessage.success(L('deleted'));
            loadIconList();
          } else {
            ElMessage.error(L('error'));
          }
        } catch { ElMessage.error(L('error')); }
      }

      // Download PNG
      function downloadPng() {
        const link = document.createElement('a');
        link.download = (currentFileName.value || 'icon') + '.png';
        link.href = pixelCanvas.value.toDataURL('image/png');
        link.click();
      }

      // Download ICO (simplified - creates a multi-size PNG pack as zip is complex, so we generate single ICO-compatible PNG)
      function downloadIco() {
        // Create a larger rendering for ICO
        const sizes = [16, 32, 48];
        const largest = 48;
        const c = document.createElement('canvas');
        c.width = largest;
        c.height = largest;
        const cctx = c.getContext('2d');
        cctx.imageSmoothingEnabled = false;
        cctx.drawImage(pixelCanvas.value, 0, 0, largest, largest);
        const link = document.createElement('a');
        link.download = (currentFileName.value || 'icon') + '.png';
        link.href = c.toDataURL('image/png');
        link.click();
      }

      // Import image
      function importImage() {
        if (fileInput.value) fileInput.value.click();
      }

      function onImportFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
            // Scale imported image down to current canvas size
            ctx.clearRect(0, 0, canvasSize.value, canvasSize.value);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0, canvasSize.value, canvasSize.value);
            pushHistory();
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
        e.target.value = '';
      }

      // Keyboard shortcuts
      function onKeyDown(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveToServer(); }
      }

      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

      // Watchers
      watch(showGrid, () => drawGrid());
      watch(canvasSize, () => drawGrid());

      onMounted(() => {
        window.addEventListener('locale-changed', onLocaleChanged);
        window.addEventListener('keydown', onKeyDown);
        nextTick(() => {
          initCanvas();
          loadIconList();
        });
      });

      onUnmounted(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
        window.removeEventListener('keydown', onKeyDown);
      });

      return {
        L, locale, pixelCanvas, gridCanvas, canvasWrap, fileInput,
        canvasSize, sizeOptions, showGrid, activeTool, currentColor, currentFileName,
        toolList, palette, previewSizes, displaySize, canvasCursor,
        historyStack, historyIdx,
        showSaveDialog, saveName, savedIcons, loadingIcons,
        setPreviewRef, onSizeChange,
        undo, redo, clearCanvas,
        onCanvasMouseDown, onCanvasMouseMove, onCanvasMouseUp,
        saveToServer, confirmSave, loadFromServer, loadIcon, deleteIcon,
        downloadPng, downloadIco, importImage, onImportFile
      };
    }
  };
})(Vue);
