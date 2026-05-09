(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, watch, nextTick } = Vue;

  const LANGS = {
    tr: {
      addPhotos:'Fotoğraf Ekle', photos:'Fotoğraflar', layout:'Düzen', spacing:'Aralık',
      borderRadius:'Köşe Yuvarlaklığı', bgColor:'Arka Plan', canvasSize:'Tuval Boyutu',
      download:'İndir (PNG)', saveToFiles:'Dosyalara Kaydet', clearAll:'Tümünü Temizle',
      dropHint:'Fotoğrafları sürükleyin veya yukarıdan ekleyin',
      emptyHint:'Kolaj oluşturmak için fotoğraf ekleyin',
      templates:'Şablonlar', saved:'Kaydedildi', error:'Hata',
      grid2x2:'2×2 Izgara', grid3x3:'3×3 Izgara', grid2x1:'2 Yatay', grid1x2:'2 Dikey',
      grid2x3:'2×3 Izgara', grid3x2:'3×2 Izgara', gridBig1:'1 Büyük + 2', gridBig2:'1 Büyük + 3',
      mosaic1:'Mozaik A', mosaic2:'Mozaik B', strip:'Şerit', cross:'Artı'
    },
    en: {
      addPhotos:'Add Photos', photos:'Photos', layout:'Layout', spacing:'Spacing',
      borderRadius:'Border Radius', bgColor:'Background', canvasSize:'Canvas Size',
      download:'Download (PNG)', saveToFiles:'Save to Files', clearAll:'Clear All',
      dropHint:'Drag photos here or add from toolbar',
      emptyHint:'Add photos to create a collage',
      templates:'Templates', saved:'Saved', error:'Error',
      grid2x2:'2×2 Grid', grid3x3:'3×3 Grid', grid2x1:'2 Horizontal', grid1x2:'2 Vertical',
      grid2x3:'2×3 Grid', grid3x2:'3×2 Grid', gridBig1:'1 Big + 2', gridBig2:'1 Big + 3',
      mosaic1:'Mosaic A', mosaic2:'Mosaic B', strip:'Strip', cross:'Cross'
    },
    de: {
      addPhotos:'Fotos hinzufügen', photos:'Fotos', layout:'Layout', spacing:'Abstand',
      borderRadius:'Eckenradius', bgColor:'Hintergrund', canvasSize:'Leinwandgröße',
      download:'Herunterladen (PNG)', saveToFiles:'In Dateien speichern', clearAll:'Alle löschen',
      dropHint:'Fotos hierher ziehen oder oben hinzufügen',
      emptyHint:'Fotos hinzufügen, um eine Collage zu erstellen',
      templates:'Vorlagen', saved:'Gespeichert', error:'Fehler',
      grid2x2:'2×2 Raster', grid3x3:'3×3 Raster', grid2x1:'2 Horizontal', grid1x2:'2 Vertikal',
      grid2x3:'2×3 Raster', grid3x2:'3×2 Raster', gridBig1:'1 Groß + 2', gridBig2:'1 Groß + 3',
      mosaic1:'Mosaik A', mosaic2:'Mosaik B', strip:'Streifen', cross:'Kreuz'
    },
    fr: {
      addPhotos:'Ajouter des photos', photos:'Photos', layout:'Disposition', spacing:'Espacement',
      borderRadius:'Rayon de bordure', bgColor:'Arrière-plan', canvasSize:'Taille du canevas',
      download:'Télécharger (PNG)', saveToFiles:'Enregistrer', clearAll:'Tout supprimer',
      dropHint:'Glissez des photos ici ou ajoutez depuis la barre',
      emptyHint:'Ajoutez des photos pour créer un collage',
      templates:'Modèles', saved:'Enregistré', error:'Erreur',
      grid2x2:'Grille 2×2', grid3x3:'Grille 3×3', grid2x1:'2 Horizontal', grid1x2:'2 Vertical',
      grid2x3:'Grille 2×3', grid3x2:'Grille 3×2', gridBig1:'1 Grand + 2', gridBig2:'1 Grand + 3',
      mosaic1:'Mosaïque A', mosaic2:'Mosaïque B', strip:'Bande', cross:'Croix'
    },
    es: {
      addPhotos:'Añadir fotos', photos:'Fotos', layout:'Diseño', spacing:'Espaciado',
      borderRadius:'Radio de borde', bgColor:'Fondo', canvasSize:'Tamaño del lienzo',
      download:'Descargar (PNG)', saveToFiles:'Guardar en archivos', clearAll:'Borrar todo',
      dropHint:'Arrastra fotos aquí o añade desde la barra',
      emptyHint:'Añade fotos para crear un collage',
      templates:'Plantillas', saved:'Guardado', error:'Error',
      grid2x2:'Cuadrícula 2×2', grid3x3:'Cuadrícula 3×3', grid2x1:'2 Horizontal', grid1x2:'2 Vertical',
      grid2x3:'Cuadrícula 2×3', grid3x2:'Cuadrícula 3×2', gridBig1:'1 Grande + 2', gridBig2:'1 Grande + 3',
      mosaic1:'Mosaico A', mosaic2:'Mosaico B', strip:'Tira', cross:'Cruz'
    },
    ru: {
      addPhotos:'Добавить фото', photos:'Фото', layout:'Макет', spacing:'Интервал',
      borderRadius:'Скругление', bgColor:'Фон', canvasSize:'Размер холста',
      download:'Скачать (PNG)', saveToFiles:'Сохранить в файлы', clearAll:'Очистить всё',
      dropHint:'Перетащите фото сюда или добавьте с панели',
      emptyHint:'Добавьте фото для создания коллажа',
      templates:'Шаблоны', saved:'Сохранено', error:'Ошибка',
      grid2x2:'Сетка 2×2', grid3x3:'Сетка 3×3', grid2x1:'2 Горизонтально', grid1x2:'2 Вертикально',
      grid2x3:'Сетка 2×3', grid3x2:'Сетка 3×2', gridBig1:'1 Большой + 2', gridBig2:'1 Большой + 3',
      mosaic1:'Мозаика A', mosaic2:'Мозаика B', strip:'Полоса', cross:'Крест'
    },
    zh: {
      addPhotos:'添加照片', photos:'照片', layout:'布局', spacing:'间距',
      borderRadius:'圆角', bgColor:'背景', canvasSize:'画布大小',
      download:'下载 (PNG)', saveToFiles:'保存到文件', clearAll:'清除全部',
      dropHint:'拖拽照片到此处或从工具栏添加',
      emptyHint:'添加照片以创建拼贴画',
      templates:'模板', saved:'已保存', error:'错误',
      grid2x2:'2×2 网格', grid3x3:'3×3 网格', grid2x1:'2 水平', grid1x2:'2 垂直',
      grid2x3:'2×3 网格', grid3x2:'3×2 网格', gridBig1:'1 大 + 2', gridBig2:'1 大 + 3',
      mosaic1:'马赛克 A', mosaic2:'马赛克 B', strip:'条带', cross:'十字'
    },
    ja: {
      addPhotos:'写真を追加', photos:'写真', layout:'レイアウト', spacing:'間隔',
      borderRadius:'角丸', bgColor:'背景', canvasSize:'キャンバスサイズ',
      download:'ダウンロード (PNG)', saveToFiles:'ファイルに保存', clearAll:'すべてクリア',
      dropHint:'写真をここにドラッグするかツールバーから追加',
      emptyHint:'コラージュを作成するには写真を追加してください',
      templates:'テンプレート', saved:'保存済み', error:'エラー',
      grid2x2:'2×2 グリッド', grid3x3:'3×3 グリッド', grid2x1:'2 横', grid1x2:'2 縦',
      grid2x3:'2×3 グリッド', grid3x2:'3×2 グリッド', gridBig1:'1 大きい + 2', gridBig2:'1 大きい + 3',
      mosaic1:'モザイク A', mosaic2:'モザイク B', strip:'ストリップ', cross:'クロス'
    },
    it: {
      addPhotos:'Aggiungi foto', photos:'Foto', layout:'Layout', spacing:'Spaziatura',
      borderRadius:'Raggio bordo', bgColor:'Sfondo', canvasSize:'Dimensione tela',
      download:'Scarica (PNG)', saveToFiles:'Salva nei file', clearAll:'Cancella tutto',
      dropHint:'Trascina le foto qui o aggiungi dalla barra',
      emptyHint:'Aggiungi foto per creare un collage',
      templates:'Modelli', saved:'Salvato', error:'Errore',
      grid2x2:'Griglia 2×2', grid3x3:'Griglia 3×3', grid2x1:'2 Orizzontale', grid1x2:'2 Verticale',
      grid2x3:'Griglia 2×3', grid3x2:'Griglia 3×2', gridBig1:'1 Grande + 2', gridBig2:'1 Grande + 3',
      mosaic1:'Mosaico A', mosaic2:'Mosaico B', strip:'Striscia', cross:'Croce'
    },
    ar: {
      addPhotos:'إضافة صور', photos:'صور', layout:'تخطيط', spacing:'التباعد',
      borderRadius:'نصف قطر الحد', bgColor:'الخلفية', canvasSize:'حجم اللوحة',
      download:'تحميل (PNG)', saveToFiles:'حفظ في الملفات', clearAll:'مسح الكل',
      dropHint:'اسحب الصور هنا أو أضفها من شريط الأدوات',
      emptyHint:'أضف صورًا لإنشاء كولاج',
      templates:'قوالب', saved:'تم الحفظ', error:'خطأ',
      grid2x2:'شبكة 2×2', grid3x3:'شبكة 3×3', grid2x1:'2 أفقي', grid1x2:'2 عمودي',
      grid2x3:'شبكة 2×3', grid3x2:'شبكة 3×2', gridBig1:'1 كبير + 2', gridBig2:'1 كبير + 3',
      mosaic1:'فسيفساء A', mosaic2:'فسيفساء B', strip:'شريط', cross:'صليب'
    },
    ko: {
      addPhotos:'사진 추가', photos:'사진', layout:'레이아웃', spacing:'간격',
      borderRadius:'테두리 반경', bgColor:'배경', canvasSize:'캔버스 크기',
      download:'다운로드 (PNG)', saveToFiles:'파일에 저장', clearAll:'모두 지우기',
      dropHint:'여기에 사진을 드래그하거나 도구 모음에서 추가하세요',
      emptyHint:'콜라주를 만들려면 사진을 추가하세요',
      templates:'템플릿', saved:'저장됨', error:'오류',
      grid2x2:'2×2 격자', grid3x3:'3×3 격자', grid2x1:'2 가로', grid1x2:'2 세로',
      grid2x3:'2×3 격자', grid3x2:'3×2 격자', gridBig1:'1 크게 + 2', gridBig2:'1 크게 + 3',
      mosaic1:'모자이크 A', mosaic2:'모자이크 B', strip:'스트립', cross:'십자'
    },
    hi: {
      addPhotos:'फोटो जोड़ें', photos:'फोटो', layout:'लेआउट', spacing:'स्पेसिंग',
      borderRadius:'बॉर्डर रेडियस', bgColor:'बैकग्राउंड', canvasSize:'कैनवास आकार',
      download:'डाउनलोड (PNG)', saveToFiles:'फ़ाइलों में सहेजें', clearAll:'सभी हटाएं',
      dropHint:'फोटो यहां ड्रैग करें या टूलबार से जोड़ें',
      emptyHint:'कोलाज बनाने के लिए फोटो जोड़ें',
      templates:'टेम्पलेट', saved:'सहेजा गया', error:'त्रुटि',
      grid2x2:'2×2 ग्रिड', grid3x3:'3×3 ग्रिड', grid2x1:'2 क्षैतिज', grid1x2:'2 लंबवत',
      grid2x3:'2×3 ग्रिड', grid3x2:'3×2 ग्रिड', gridBig1:'1 बड़ा + 2', gridBig2:'1 बड़ा + 3',
      mosaic1:'मोज़ेक A', mosaic2:'मोज़ेक B', strip:'स्ट्रिप', cross:'क्रॉस'
    },
    pt: {
      addPhotos:'Adicionar fotos', photos:'Fotos', layout:'Layout', spacing:'Espaçamento',
      borderRadius:'Raio da borda', bgColor:'Fundo', canvasSize:'Tamanho da tela',
      download:'Baixar (PNG)', saveToFiles:'Salvar em arquivos', clearAll:'Limpar tudo',
      dropHint:'Arraste fotos aqui ou adicione pela barra de ferramentas',
      emptyHint:'Adicione fotos para criar uma colagem',
      templates:'Modelos', saved:'Salvo', error:'Erro',
      grid2x2:'Grade 2×2', grid3x3:'Grade 3×3', grid2x1:'2 Horizontal', grid1x2:'2 Vertical',
      grid2x3:'Grade 2×3', grid3x2:'Grade 3×2', gridBig1:'1 Grande + 2', gridBig2:'1 Grande + 3',
      mosaic1:'Mosaico A', mosaic2:'Mosaico B', strip:'Faixa', cross:'Cruz'
    }
  };

  function getLocale() {
    try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; }
  }

  /* ---- Layout definitions ---- */
  /* Each layout: { name, cells: [{x,y,w,h}] } where x/y/w/h are fractions 0-1 */
  function buildLayouts(L) {
    return [
      { name: L('grid2x2'), cells: [
        {x:0,y:0,w:.5,h:.5},{x:.5,y:0,w:.5,h:.5},
        {x:0,y:.5,w:.5,h:.5},{x:.5,y:.5,w:.5,h:.5}
      ]},
      { name: L('grid3x3'), cells: [
        {x:0,y:0,w:1/3,h:1/3},{x:1/3,y:0,w:1/3,h:1/3},{x:2/3,y:0,w:1/3,h:1/3},
        {x:0,y:1/3,w:1/3,h:1/3},{x:1/3,y:1/3,w:1/3,h:1/3},{x:2/3,y:1/3,w:1/3,h:1/3},
        {x:0,y:2/3,w:1/3,h:1/3},{x:1/3,y:2/3,w:1/3,h:1/3},{x:2/3,y:2/3,w:1/3,h:1/3}
      ]},
      { name: L('grid2x1'), cells: [
        {x:0,y:0,w:.5,h:1},{x:.5,y:0,w:.5,h:1}
      ]},
      { name: L('grid1x2'), cells: [
        {x:0,y:0,w:1,h:.5},{x:0,y:.5,w:1,h:.5}
      ]},
      { name: L('grid2x3'), cells: [
        {x:0,y:0,w:.5,h:1/3},{x:.5,y:0,w:.5,h:1/3},
        {x:0,y:1/3,w:.5,h:1/3},{x:.5,y:1/3,w:.5,h:1/3},
        {x:0,y:2/3,w:.5,h:1/3},{x:.5,y:2/3,w:.5,h:1/3}
      ]},
      { name: L('grid3x2'), cells: [
        {x:0,y:0,w:1/3,h:.5},{x:1/3,y:0,w:1/3,h:.5},{x:2/3,y:0,w:1/3,h:.5},
        {x:0,y:.5,w:1/3,h:.5},{x:1/3,y:.5,w:1/3,h:.5},{x:2/3,y:.5,w:1/3,h:.5}
      ]},
      { name: L('gridBig1'), cells: [
        {x:0,y:0,w:.6,h:1},
        {x:.6,y:0,w:.4,h:.5},{x:.6,y:.5,w:.4,h:.5}
      ]},
      { name: L('gridBig2'), cells: [
        {x:0,y:0,w:.5,h:1},
        {x:.5,y:0,w:.5,h:1/3},{x:.5,y:1/3,w:.5,h:1/3},{x:.5,y:2/3,w:.5,h:1/3}
      ]},
      { name: L('mosaic1'), cells: [
        {x:0,y:0,w:2/3,h:2/3},
        {x:2/3,y:0,w:1/3,h:1/3},{x:2/3,y:1/3,w:1/3,h:1/3},
        {x:0,y:2/3,w:1/3,h:1/3},{x:1/3,y:2/3,w:1/3,h:1/3},{x:2/3,y:2/3,w:1/3,h:1/3}
      ]},
      { name: L('mosaic2'), cells: [
        {x:0,y:0,w:1/3,h:1/3},{x:1/3,y:0,w:1/3,h:1/3},{x:2/3,y:0,w:1/3,h:2/3},
        {x:0,y:1/3,w:2/3,h:2/3},
        {x:2/3,y:2/3,w:1/3,h:1/3}
      ]},
      { name: L('strip'), cells: [
        {x:0,y:0,w:.25,h:1},{x:.25,y:0,w:.25,h:1},
        {x:.5,y:0,w:.25,h:1},{x:.75,y:0,w:.25,h:1}
      ]},
      { name: L('cross'), cells: [
        {x:1/3,y:0,w:1/3,h:1/3},
        {x:0,y:1/3,w:1/3,h:1/3},{x:1/3,y:1/3,w:1/3,h:1/3},{x:2/3,y:1/3,w:1/3,h:1/3},
        {x:1/3,y:2/3,w:1/3,h:1/3}
      ]}
    ];
  }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      const layouts = ref(buildLayouts(L));
      const selectedLayout = ref(0);
      const photos = ref([]);
      const selectedPhoto = ref(-1);
      const spacing = ref(6);
      const borderRadius = ref(4);
      const bgColor = ref('#1a1a2e');
      const canvasW = ref(1200);
      const canvasH = ref(900);
      const statusMsg = ref('');
      const templateCanvasRefs = ref({});

      const fileInput = ref(null);
      const collageCanvas = ref(null);

      let nextId = 1;
      let dragIdx = -1;

      /* --- Photo loading --- */
      function addPhotos() { fileInput.value && fileInput.value.click(); }

      function onFilesSelected(e) {
        const files = e.target.files;
        if (!files || !files.length) return;
        for (let i = 0; i < files.length; i++) loadImageFile(files[i]);
        e.target.value = '';
      }

      function loadImageFile(file) {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            photos.value.push({
              id: nextId++,
              img: img,
              thumb: e.target.result,
              name: file.name,
              panX: 0, panY: 0, zoom: 1
            });
            nextTick(() => renderCollage());
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }

      function loadImageFromDrop(dt) {
        const files = dt.files;
        if (!files || !files.length) return;
        for (let i = 0; i < files.length; i++) loadImageFile(files[i]);
      }

      /* --- Drag & drop reorder --- */
      function onPhotoDragStart(idx, e) {
        dragIdx = idx;
        e.dataTransfer.effectAllowed = 'move';
      }
      function onPhotoDragOver(idx, e) { e.dataTransfer.dropEffect = 'move'; }
      function onPhotoDrop(idx, e) {
        if (dragIdx < 0 || dragIdx === idx) return;
        const arr = photos.value;
        const item = arr.splice(dragIdx, 1)[0];
        arr.splice(idx, 0, item);
        dragIdx = -1;
        renderCollage();
      }
      function onDragOverList(e) { e.dataTransfer.dropEffect = 'copy'; }
      function onDropList(e) { loadImageFromDrop(e.dataTransfer); }
      function onDragOverCanvas(e) { e.dataTransfer.dropEffect = 'copy'; }
      function onDropCanvas(e) { loadImageFromDrop(e.dataTransfer); }

      function movePhoto(idx, dir) {
        const arr = photos.value;
        const ni = idx + dir;
        if (ni < 0 || ni >= arr.length) return;
        const tmp = arr[idx];
        arr[idx] = arr[ni];
        arr[ni] = tmp;
        selectedPhoto.value = ni;
        renderCollage();
      }

      function removePhoto(idx) {
        photos.value.splice(idx, 1);
        if (selectedPhoto.value >= photos.value.length) selectedPhoto.value = photos.value.length - 1;
        renderCollage();
      }

      function clearAll() {
        photos.value = [];
        selectedPhoto.value = -1;
        renderCollage();
      }

      /* --- Canvas rendering --- */
      function getCells() {
        const layout = layouts.value[selectedLayout.value];
        return layout ? layout.cells : layouts.value[0].cells;
      }

      function renderCollage() {
        const canvas = collageCanvas.value;
        if (!canvas) return;
        const cw = canvasW.value;
        const ch = canvasH.value;
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext('2d');

        // background
        ctx.fillStyle = bgColor.value;
        ctx.fillRect(0, 0, cw, ch);

        if (photos.value.length === 0) return;

        const cells = getCells();
        const sp = spacing.value;
        const br = borderRadius.value;

        for (let i = 0; i < cells.length; i++) {
          const photo = photos.value[i % photos.value.length];
          if (!photo) continue;
          const cell = cells[i];

          const cx = cell.x * cw + sp;
          const cy = cell.y * ch + sp;
          const cellW = cell.w * cw - sp * 2;
          const cellH = cell.h * ch - sp * 2;

          if (cellW <= 0 || cellH <= 0) continue;

          ctx.save();
          // clip with rounded rect
          roundRect(ctx, cx, cy, cellW, cellH, br);
          ctx.clip();

          // draw image covering cell (cover fit + pan)
          drawCover(ctx, photo, cx, cy, cellW, cellH);
          ctx.restore();
        }
      }

      function roundRect(ctx, x, y, w, h, r) {
        r = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
      }

      function drawCover(ctx, photo, cx, cy, cw, ch) {
        const img = photo.img;
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        const zoom = photo.zoom || 1;

        // cover fit
        const scale = Math.max(cw / iw, ch / ih) * zoom;
        const dw = iw * scale;
        const dh = ih * scale;
        const dx = cx + (cw - dw) / 2 + (photo.panX || 0);
        const dy = cy + (ch - dh) / 2 + (photo.panY || 0);

        ctx.drawImage(img, dx, dy, dw, dh);
      }

      /* --- Canvas mouse interaction (pan photos) --- */
      let isPanning = false;
      let panStartX = 0, panStartY = 0;
      let panPhotoIdx = -1;
      let panOrigX = 0, panOrigY = 0;

      function findCellAtPos(mx, my) {
        const cells = getCells();
        const cw = canvasW.value;
        const ch = canvasH.value;
        const sp = spacing.value;
        for (let i = cells.length - 1; i >= 0; i--) {
          const c = cells[i];
          const cx = c.x * cw + sp;
          const cy = c.y * ch + sp;
          const w = c.w * cw - sp * 2;
          const h = c.h * ch - sp * 2;
          if (mx >= cx && mx <= cx + w && my >= cy && my <= cy + h) return i;
        }
        return -1;
      }

      function getCanvasCoords(e) {
        const canvas = collageCanvas.value;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
      }

      function onCanvasMouseDown(e) {
        const pos = getCanvasCoords(e);
        const cellIdx = findCellAtPos(pos.x, pos.y);
        if (cellIdx < 0) return;
        const photoIdx = cellIdx % photos.value.length;
        isPanning = true;
        panPhotoIdx = photoIdx;
        panStartX = e.clientX;
        panStartY = e.clientY;
        panOrigX = photos.value[photoIdx].panX || 0;
        panOrigY = photos.value[photoIdx].panY || 0;
        selectedPhoto.value = photoIdx;
      }

      function onCanvasMouseMove(e) {
        if (!isPanning || panPhotoIdx < 0) return;
        const canvas = collageCanvas.value;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        photos.value[panPhotoIdx].panX = panOrigX + (e.clientX - panStartX) * scaleX;
        photos.value[panPhotoIdx].panY = panOrigY + (e.clientY - panStartY) * scaleY;
        renderCollage();
      }

      function onCanvasMouseUp() {
        isPanning = false;
        panPhotoIdx = -1;
      }

      /* --- Layout apply --- */
      function applyLayout() {
        // reset pans
        photos.value.forEach(p => { p.panX = 0; p.panY = 0; p.zoom = 1; });
        nextTick(() => renderCollage());
      }

      /* --- Template thumbnails --- */
      function renderTemplateThumbs() {
        layouts.value.forEach((lay, idx) => {
          const canvas = templateCanvasRefs.value[idx];
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          const w = 60, h = 60;
          ctx.fillStyle = '#1a1a2e';
          ctx.fillRect(0, 0, w, h);
          const colors = ['#e91e63','#9c27b0','#3f51b5','#00bcd4','#4caf50','#ff9800','#f44336','#607d8b','#795548'];
          lay.cells.forEach((cell, ci) => {
            const sp = 1.5;
            const cx = cell.x * w + sp;
            const cy = cell.y * h + sp;
            const cw = cell.w * w - sp * 2;
            const ch = cell.h * h - sp * 2;
            ctx.fillStyle = colors[ci % colors.length];
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            const r = 2;
            ctx.moveTo(cx + r, cy);
            ctx.lineTo(cx + cw - r, cy);
            ctx.quadraticCurveTo(cx + cw, cy, cx + cw, cy + r);
            ctx.lineTo(cx + cw, cy + ch - r);
            ctx.quadraticCurveTo(cx + cw, cy + ch, cx + cw - r, cy + ch);
            ctx.lineTo(cx + r, cy + ch);
            ctx.quadraticCurveTo(cx, cy + ch, cx, cy + ch - r);
            ctx.lineTo(cx, cy + r);
            ctx.quadraticCurveTo(cx, cy, cx + r, cy);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;
          });
        });
      }

      /* --- Download & Save --- */
      function downloadCollage() {
        const canvas = collageCanvas.value;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = 'collage-' + Date.now() + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        showStatus(L('saved'));
      }

      async function saveToFiles() {
        const canvas = collageCanvas.value;
        if (!canvas) return;
        try {
          if (window.FileDialog) {
            const result = await window.FileDialog.show({
              title: L('saveToFiles'),
              mode: 'save',
              filters: ['.png'],
              initialPath: '/photos'
            });
            if (!result) return;
            const dataUrl = canvas.toDataURL('image/png');
            const base64 = dataUrl.split(',')[1];
            const token = localStorage.getItem('auth_token') || '';
            const savePath = result.path.endsWith('.png') ? result.path : result.path + '.png';
            const resp = await fetch('/api/fs/write', {
              method: 'POST',
              headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
              body: JSON.stringify({ path: savePath, content: base64, encoding: 'base64' })
            });
            if (resp.ok) showStatus(L('saved'));
            else showStatus(L('error'));
          } else {
            downloadCollage();
          }
        } catch (err) {
          showStatus(L('error'));
        }
      }

      function showStatus(msg) {
        statusMsg.value = msg;
        setTimeout(() => { statusMsg.value = ''; }, 2000);
      }

      /* --- Wheel zoom --- */
      function onWheel(e) {
        if (photos.value.length === 0) return;
        const pos = getCanvasCoords(e);
        const cellIdx = findCellAtPos(pos.x, pos.y);
        if (cellIdx < 0) return;
        const photoIdx = cellIdx % photos.value.length;
        const photo = photos.value[photoIdx];
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        photo.zoom = Math.max(0.3, Math.min(5, (photo.zoom || 1) + delta));
        e.preventDefault();
        renderCollage();
      }

      /* --- Locale change --- */
      function onLocaleChanged(e) {
        locale.value = e.detail || getLocale();
        layouts.value = buildLayouts(L);
        nextTick(() => renderTemplateThumbs());
      }

      onMounted(() => {
        window.addEventListener('locale-changed', onLocaleChanged);
        nextTick(() => {
          renderTemplateThumbs();
          renderCollage();
          const canvas = collageCanvas.value;
          if (canvas) canvas.addEventListener('wheel', onWheel, { passive: false });
        });
      });

      onUnmounted(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
        const canvas = collageCanvas.value;
        if (canvas) canvas.removeEventListener('wheel', onWheel);
      });

      return {
        locale, L,
        layouts, selectedLayout,
        photos, selectedPhoto,
        spacing, borderRadius, bgColor,
        canvasW, canvasH,
        statusMsg, templateCanvasRefs,
        fileInput, collageCanvas,
        addPhotos, onFilesSelected,
        movePhoto, removePhoto, clearAll,
        applyLayout, renderCollage,
        downloadCollage, saveToFiles,
        onPhotoDragStart, onPhotoDragOver, onPhotoDrop,
        onDragOverList, onDropList, onDragOverCanvas, onDropCanvas,
        onCanvasMouseDown, onCanvasMouseMove, onCanvasMouseUp
      };
    }
  };
})(Vue);
