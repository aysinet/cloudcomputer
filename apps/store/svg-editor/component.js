(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, nextTick, watch, reactive } = Vue;

  const LANGS = {
    tr: {
      select:'Seç', rect:'Dikdörtgen', ellipse:'Elips', circle:'Daire', line:'Çizgi',
      pen:'Kalem', text:'Metin', image:'Resim', path:'Yol', polyline:'Çoklu Çizgi', polygon:'Çokgen',
      fill:'Dolgu', stroke:'Çizgi Rengi', strokeW:'Çizgi Kalınlığı', opacity:'Opaklık',
      noFill:'Dolgusuz', newFile:'Yeni', open:'Aç', save:'Kaydet', saveAs:'Farklı Kaydet',
      exportPng:'PNG İndir', undo:'Geri Al', redo:'Yinele', tool:'Araç',
      properties:'Özellikler', canvas:'Tuval', elements:'Elemanlar', noElements:'Eleman yok',
      bgColor:'Arka Plan', toFront:'Öne Getir', toBack:'Arkaya Gönder',
      duplicate:'Çoğalt', delete:'Sil', grid:'Izgara', snap:'Yapışma',
      textContent:'Metin', fontSize:'Yazı Boyutu', fontFamily:'Yazı Tipi',
      appearance:'Görünüm', saved:'Kaydedildi', error:'Hata'
    },
    en: {
      select:'Select', rect:'Rectangle', ellipse:'Ellipse', circle:'Circle', line:'Line',
      pen:'Pen', text:'Text', image:'Image', path:'Path', polyline:'Polyline', polygon:'Polygon',
      fill:'Fill', stroke:'Stroke', strokeW:'Stroke Width', opacity:'Opacity',
      noFill:'No Fill', newFile:'New', open:'Open', save:'Save', saveAs:'Save As',
      exportPng:'Export PNG', undo:'Undo', redo:'Redo', tool:'Tool',
      properties:'Properties', canvas:'Canvas', elements:'Elements', noElements:'No elements',
      bgColor:'Background', toFront:'Bring to Front', toBack:'Send to Back',
      duplicate:'Duplicate', delete:'Delete', grid:'Grid', snap:'Snap',
      textContent:'Text', fontSize:'Font Size', fontFamily:'Font Family',
      appearance:'Appearance', saved:'Saved', error:'Error'
    },
    de: {
      select:'Auswählen', rect:'Rechteck', ellipse:'Ellipse', circle:'Kreis', line:'Linie',
      pen:'Stift', text:'Text', image:'Bild', path:'Pfad', polyline:'Polylinie', polygon:'Polygon',
      fill:'Füllung', stroke:'Kontur', strokeW:'Konturbreite', opacity:'Deckkraft',
      noFill:'Keine Füllung', newFile:'Neu', open:'Öffnen', save:'Speichern', saveAs:'Speichern unter',
      exportPng:'PNG exportieren', undo:'Rückgängig', redo:'Wiederholen', tool:'Werkzeug',
      properties:'Eigenschaften', canvas:'Leinwand', elements:'Elemente', noElements:'Keine Elemente',
      bgColor:'Hintergrund', toFront:'Nach vorne', toBack:'Nach hinten',
      duplicate:'Duplizieren', delete:'Löschen', grid:'Raster', snap:'Einrasten',
      textContent:'Text', fontSize:'Schriftgröße', fontFamily:'Schriftart',
      appearance:'Aussehen', saved:'Gespeichert', error:'Fehler'
    },
    fr: {
      select:'Sélectionner', rect:'Rectangle', ellipse:'Ellipse', circle:'Cercle', line:'Ligne',
      pen:'Stylo', text:'Texte', image:'Image', path:'Chemin', polyline:'Polyligne', polygon:'Polygone',
      fill:'Remplissage', stroke:'Contour', strokeW:'Épaisseur', opacity:'Opacité',
      noFill:'Sans remplissage', newFile:'Nouveau', open:'Ouvrir', save:'Enregistrer', saveAs:'Enregistrer sous',
      exportPng:'Exporter PNG', undo:'Annuler', redo:'Rétablir', tool:'Outil',
      properties:'Propriétés', canvas:'Canevas', elements:'Éléments', noElements:'Aucun élément',
      bgColor:'Arrière-plan', toFront:'Premier plan', toBack:'Arrière-plan',
      duplicate:'Dupliquer', delete:'Supprimer', grid:'Grille', snap:'Aimanter',
      textContent:'Texte', fontSize:'Taille police', fontFamily:'Police',
      appearance:'Apparence', saved:'Enregistré', error:'Erreur'
    },
    es: {
      select:'Seleccionar', rect:'Rectángulo', ellipse:'Elipse', circle:'Círculo', line:'Línea',
      pen:'Pluma', text:'Texto', image:'Imagen', path:'Ruta', polyline:'Polilínea', polygon:'Polígono',
      fill:'Relleno', stroke:'Trazo', strokeW:'Ancho de trazo', opacity:'Opacidad',
      noFill:'Sin relleno', newFile:'Nuevo', open:'Abrir', save:'Guardar', saveAs:'Guardar como',
      exportPng:'Exportar PNG', undo:'Deshacer', redo:'Rehacer', tool:'Herramienta',
      properties:'Propiedades', canvas:'Lienzo', elements:'Elementos', noElements:'Sin elementos',
      bgColor:'Fondo', toFront:'Traer al frente', toBack:'Enviar atrás',
      duplicate:'Duplicar', delete:'Eliminar', grid:'Cuadrícula', snap:'Ajustar',
      textContent:'Texto', fontSize:'Tamaño fuente', fontFamily:'Familia fuente',
      appearance:'Apariencia', saved:'Guardado', error:'Error'
    },
    ru: {
      select:'Выбрать', rect:'Прямоугольник', ellipse:'Эллипс', circle:'Круг', line:'Линия',
      pen:'Перо', text:'Текст', image:'Изображение', path:'Путь', polyline:'Полилиния', polygon:'Полигон',
      fill:'Заливка', stroke:'Обводка', strokeW:'Толщина', opacity:'Прозрачность',
      noFill:'Без заливки', newFile:'Новый', open:'Открыть', save:'Сохранить', saveAs:'Сохранить как',
      exportPng:'Экспорт PNG', undo:'Отменить', redo:'Повторить', tool:'Инструмент',
      properties:'Свойства', canvas:'Холст', elements:'Элементы', noElements:'Нет элементов',
      bgColor:'Фон', toFront:'На передний план', toBack:'На задний план',
      duplicate:'Дублировать', delete:'Удалить', grid:'Сетка', snap:'Привязка',
      textContent:'Текст', fontSize:'Размер шрифта', fontFamily:'Шрифт',
      appearance:'Внешний вид', saved:'Сохранено', error:'Ошибка'
    },
    zh: {
      select:'选择', rect:'矩形', ellipse:'椭圆', circle:'圆形', line:'直线',
      pen:'钢笔', text:'文本', image:'图片', path:'路径', polyline:'折线', polygon:'多边形',
      fill:'填充', stroke:'描边', strokeW:'描边宽度', opacity:'不透明度',
      noFill:'无填充', newFile:'新建', open:'打开', save:'保存', saveAs:'另存为',
      exportPng:'导出PNG', undo:'撤销', redo:'重做', tool:'工具',
      properties:'属性', canvas:'画布', elements:'元素', noElements:'无元素',
      bgColor:'背景色', toFront:'置顶', toBack:'置底',
      duplicate:'复制', delete:'删除', grid:'网格', snap:'吸附',
      textContent:'文本', fontSize:'字号', fontFamily:'字体',
      appearance:'外观', saved:'已保存', error:'错误'
    },
    ja: {
      select:'選択', rect:'四角形', ellipse:'楕円', circle:'円', line:'線',
      pen:'ペン', text:'テキスト', image:'画像', path:'パス', polyline:'ポリライン', polygon:'ポリゴン',
      fill:'塗り', stroke:'線色', strokeW:'線幅', opacity:'不透明度',
      noFill:'塗りなし', newFile:'新規', open:'開く', save:'保存', saveAs:'名前を付けて保存',
      exportPng:'PNG出力', undo:'元に戻す', redo:'やり直し', tool:'ツール',
      properties:'プロパティ', canvas:'キャンバス', elements:'要素', noElements:'要素なし',
      bgColor:'背景色', toFront:'前面へ', toBack:'背面へ',
      duplicate:'複製', delete:'削除', grid:'グリッド', snap:'スナップ',
      textContent:'テキスト', fontSize:'文字サイズ', fontFamily:'フォント',
      appearance:'外観', saved:'保存しました', error:'エラー'
    },
    it: {
      select:'Seleziona', rect:'Rettangolo', ellipse:'Ellisse', circle:'Cerchio', line:'Linea',
      pen:'Penna', text:'Testo', image:'Immagine', path:'Percorso', polyline:'Polilinea', polygon:'Poligono',
      fill:'Riempimento', stroke:'Contorno', strokeW:'Spessore', opacity:'Opacità',
      noFill:'Senza riempimento', newFile:'Nuovo', open:'Apri', save:'Salva', saveAs:'Salva con nome',
      exportPng:'Esporta PNG', undo:'Annulla', redo:'Ripeti', tool:'Strumento',
      properties:'Proprietà', canvas:'Tela', elements:'Elementi', noElements:'Nessun elemento',
      bgColor:'Sfondo', toFront:'Porta avanti', toBack:'Porta dietro',
      duplicate:'Duplica', delete:'Elimina', grid:'Griglia', snap:'Aggancia',
      textContent:'Testo', fontSize:'Dimensione', fontFamily:'Carattere',
      appearance:'Aspetto', saved:'Salvato', error:'Errore'
    },
    ar: {
      select:'تحديد', rect:'مستطيل', ellipse:'قطع ناقص', circle:'دائرة', line:'خط',
      pen:'قلم', text:'نص', image:'صورة', path:'مسار', polyline:'خط متعدد', polygon:'مضلع',
      fill:'تعبئة', stroke:'حد', strokeW:'سمك الحد', opacity:'الشفافية',
      noFill:'بدون تعبئة', newFile:'جديد', open:'فتح', save:'حفظ', saveAs:'حفظ باسم',
      exportPng:'تصدير PNG', undo:'تراجع', redo:'إعادة', tool:'أداة',
      properties:'خصائص', canvas:'لوحة', elements:'عناصر', noElements:'لا توجد عناصر',
      bgColor:'خلفية', toFront:'إلى الأمام', toBack:'إلى الخلف',
      duplicate:'نسخ', delete:'حذف', grid:'شبكة', snap:'محاذاة',
      textContent:'نص', fontSize:'حجم الخط', fontFamily:'نوع الخط',
      appearance:'المظهر', saved:'تم الحفظ', error:'خطأ'
    },
    ko: {
      select:'선택', rect:'사각형', ellipse:'타원', circle:'원', line:'선',
      pen:'펜', text:'텍스트', image:'이미지', path:'경로', polyline:'폴리라인', polygon:'다각형',
      fill:'채우기', stroke:'선 색', strokeW:'선 두께', opacity:'불투명도',
      noFill:'채우기 없음', newFile:'새로 만들기', open:'열기', save:'저장', saveAs:'다른 이름으로 저장',
      exportPng:'PNG 내보내기', undo:'실행취소', redo:'다시실행', tool:'도구',
      properties:'속성', canvas:'캔버스', elements:'요소', noElements:'요소 없음',
      bgColor:'배경색', toFront:'맨 앞으로', toBack:'맨 뒤로',
      duplicate:'복제', delete:'삭제', grid:'격자', snap:'스냅',
      textContent:'텍스트', fontSize:'글자 크기', fontFamily:'글꼴',
      appearance:'모양', saved:'저장됨', error:'오류'
    },
    hi: {
      select:'चुनें', rect:'आयत', ellipse:'दीर्घवृत्त', circle:'वृत्त', line:'रेखा',
      pen:'पेन', text:'टेक्स्ट', image:'छवि', path:'पथ', polyline:'पॉलीलाइन', polygon:'बहुभुज',
      fill:'भरण', stroke:'स्ट्रोक', strokeW:'स्ट्रोक चौड़ाई', opacity:'अपारदर्शिता',
      noFill:'बिना भरण', newFile:'नया', open:'खोलें', save:'सहेजें', saveAs:'इस रूप में सहेजें',
      exportPng:'PNG निर्यात', undo:'पूर्ववत', redo:'फिर से करें', tool:'उपकरण',
      properties:'गुण', canvas:'कैनवास', elements:'तत्व', noElements:'कोई तत्व नहीं',
      bgColor:'पृष्ठभूमि', toFront:'सामने लाएं', toBack:'पीछे भेजें',
      duplicate:'डुप्लिकेट', delete:'हटाएं', grid:'ग्रिड', snap:'स्नैप',
      textContent:'टेक्स्ट', fontSize:'फ़ॉन्ट आकार', fontFamily:'फ़ॉन्ट',
      appearance:'दिखावट', saved:'सहेजा गया', error:'त्रुटि'
    },
    pt: {
      select:'Selecionar', rect:'Retângulo', ellipse:'Elipse', circle:'Círculo', line:'Linha',
      pen:'Caneta', text:'Texto', image:'Imagem', path:'Caminho', polyline:'Polilinha', polygon:'Polígono',
      fill:'Preenchimento', stroke:'Contorno', strokeW:'Espessura', opacity:'Opacidade',
      noFill:'Sem preenchimento', newFile:'Novo', open:'Abrir', save:'Salvar', saveAs:'Salvar como',
      exportPng:'Exportar PNG', undo:'Desfazer', redo:'Refazer', tool:'Ferramenta',
      properties:'Propriedades', canvas:'Tela', elements:'Elementos', noElements:'Sem elementos',
      bgColor:'Fundo', toFront:'Trazer frente', toBack:'Enviar trás',
      duplicate:'Duplicar', delete:'Excluir', grid:'Grade', snap:'Encaixar',
      textContent:'Texto', fontSize:'Tamanho fonte', fontFamily:'Família fonte',
      appearance:'Aparência', saved:'Salvo', error:'Erro'
    }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      // Refs
      const svgCanvas = ref(null);
      const canvasWrap = ref(null);
      const fillPicker = ref(null);
      const strokePicker = ref(null);
      const textEditInput = ref(null);

      // Canvas
      const canvasW = ref(800);
      const canvasH = ref(600);
      const canvasBg = ref('#ffffff');
      const zoom = ref(1);
      const showGrid = ref(true);
      const snapToGrid = ref(false);
      const gridSize = ref(20);

      // Tools
      const activeTool = ref('select');
      const strokeWidth = ref(2);
      const strokeColor = ref('#333333');
      const fillColor = ref('#6c5ce7');
      const opacity = ref(1);

      const toolList = computed(() => [
        { id: 'select', icon: '🔲' },
        { id: 'rect', icon: '⬜' },
        { id: 'ellipse', icon: '⭕' },
        { id: 'circle', icon: '🔵' },
        { id: 'line', icon: '📏' },
        { id: 'pen', icon: '✒️' },
        { id: 'text', icon: '🔤' }
      ]);

      // Elements
      const elements = ref([]);
      let nextId = 1;
      const selectedId = ref(null);

      const selectedEl = computed(() => {
        if (!selectedId.value) return null;
        return elements.value.find(e => e.id === selectedId.value) || null;
      });

      // Drawing state
      const drawing = ref(false);
      const drawStart = reactive({ x: 0, y: 0 });
      const drawCurrent = reactive({ x: 0, y: 0 });
      const cursorX = ref(0);
      const cursorY = ref(0);
      let dragging = false;
      let dragStart = { x: 0, y: 0 };
      let dragElStart = {};

      // Pen tool
      const currentPath = ref([]);

      // History
      const historyStack = ref([]);
      const historyIdx = ref(-1);
      const MAX_HISTORY = 50;

      // File
      const currentFilePath = ref('');
      const currentFileName = ref('');

      // Text editing
      const editingText = ref(false);
      const editTextValue = ref('');
      let editingTextEl = ref(null);
      const textOverlayStyle = computed(() => {
        if (!editingTextEl.value || !svgCanvas.value) return {};
        const wrap = canvasWrap.value;
        if (!wrap) return {};
        const rect = wrap.getBoundingClientRect();
        const el = editingTextEl.value;
        return {
          left: (el.x * zoom.value + wrap.scrollLeft) + 'px',
          top: ((el.y - (el.fontSize || 16)) * zoom.value + wrap.scrollTop) + 'px'
        };
      });

      const SVG_FILTERS = [
        { label: 'SVG Files', extensions: ['.svg'] }
      ];

      // ---- Helpers ----
      function genId() { return nextId++; }

      function snapVal(v) {
        return snapToGrid.value ? Math.round(v / gridSize.value) * gridSize.value : v;
      }

      function getSvgPos(e) {
        const wrap = canvasWrap.value;
        if (!wrap) return { x: 0, y: 0 };
        const rect = wrap.getBoundingClientRect();
        const x = (e.clientX - rect.left + wrap.scrollLeft) / zoom.value;
        const y = (e.clientY - rect.top + wrap.scrollTop) / zoom.value;
        return { x: snapVal(Math.round(x)), y: snapVal(Math.round(y)) };
      }

      function elementIcon(type) {
        const map = { rect: '⬜', ellipse: '⭕', circle: '🔵', line: '📏', pen: '✒️', text: '🔤', path: '✒️', polyline: '〰️', polygon: '🔷', image: '🖼️' };
        return map[type] || '⬜';
      }

      function getTextWidth(el) {
        if (!el || !el.text) return 60;
        return Math.max(60, el.text.length * (el.fontSize || 16) * 0.6);
      }

      function buildPathD(points) {
        if (!points || points.length === 0) return '';
        let d = 'M ' + points[0].x + ' ' + points[0].y;
        for (let i = 1; i < points.length; i++) {
          d += ' L ' + points[i].x + ' ' + points[i].y;
        }
        return d;
      }

      // ---- History ----
      function pushHistory() {
        if (historyIdx.value < historyStack.value.length - 1) {
          historyStack.value = historyStack.value.slice(0, historyIdx.value + 1);
        }
        historyStack.value.push(JSON.stringify(elements.value));
        if (historyStack.value.length > MAX_HISTORY) historyStack.value.shift();
        historyIdx.value = historyStack.value.length - 1;
      }

      function undo() {
        if (historyIdx.value <= 0) return;
        historyIdx.value--;
        elements.value = JSON.parse(historyStack.value[historyIdx.value]);
        selectedId.value = null;
      }

      function redo() {
        if (historyIdx.value >= historyStack.value.length - 1) return;
        historyIdx.value++;
        elements.value = JSON.parse(historyStack.value[historyIdx.value]);
        selectedId.value = null;
      }

      // ---- Zoom ----
      function zoomIn() { zoom.value = Math.min(5, +(zoom.value + 0.1).toFixed(2)); }
      function zoomOut() { zoom.value = Math.max(0.1, +(zoom.value - 0.1).toFixed(2)); }
      function onWheel(e) {
        if (e.ctrlKey) {
          e.preventDefault();
          if (e.deltaY < 0) zoomIn(); else zoomOut();
        }
      }

      // ---- Element ops ----
      function updateProp(prop, val) {
        if (!selectedId.value) return;
        const el = elements.value.find(e => e.id === selectedId.value);
        if (!el) return;
        el[prop] = val;
        pushHistory();
      }

      function bringToFront() {
        if (!selectedId.value) return;
        const idx = elements.value.findIndex(e => e.id === selectedId.value);
        if (idx < 0 || idx === elements.value.length - 1) return;
        const el = elements.value.splice(idx, 1)[0];
        elements.value.push(el);
        pushHistory();
      }

      function sendToBack() {
        if (!selectedId.value) return;
        const idx = elements.value.findIndex(e => e.id === selectedId.value);
        if (idx <= 0) return;
        const el = elements.value.splice(idx, 1)[0];
        elements.value.unshift(el);
        pushHistory();
      }

      function duplicateElement() {
        if (!selectedId.value) return;
        const el = elements.value.find(e => e.id === selectedId.value);
        if (!el) return;
        const clone = JSON.parse(JSON.stringify(el));
        clone.id = genId();
        // offset
        if ('x' in clone) clone.x += 15;
        if ('y' in clone) clone.y += 15;
        if ('cx' in clone) clone.cx += 15;
        if ('cy' in clone) clone.cy += 15;
        if ('x1' in clone) { clone.x1 += 15; clone.x2 += 15; }
        if ('y1' in clone) { clone.y1 += 15; clone.y2 += 15; }
        elements.value.push(clone);
        selectedId.value = clone.id;
        pushHistory();
      }

      function deleteElement() {
        if (!selectedId.value) return;
        elements.value = elements.value.filter(e => e.id !== selectedId.value);
        selectedId.value = null;
        pushHistory();
      }

      // ---- Mouse handlers ----
      function onMouseDown(e) {
        const pos = getSvgPos(e);
        cursorX.value = pos.x;
        cursorY.value = pos.y;

        if (activeTool.value === 'select') {
          selectedId.value = null;
          return;
        }

        if (activeTool.value === 'text') {
          const el = {
            id: genId(), type: 'text',
            x: pos.x, y: pos.y,
            text: L('text'),
            fill: fillColor.value === 'none' ? strokeColor.value : fillColor.value,
            stroke: 'none', strokeWidth: 0,
            fontSize: 24, fontFamily: 'sans-serif',
            fontWeight: 'normal', fontStyle: 'normal',
            opacity: opacity.value, transform: ''
          };
          elements.value.push(el);
          selectedId.value = el.id;
          pushHistory();
          activeTool.value = 'select';
          nextTick(() => startEditText(el));
          return;
        }

        if (activeTool.value === 'pen') {
          if (currentPath.value.length === 0) {
            currentPath.value.push({ x: pos.x, y: pos.y });
          }
          currentPath.value.push({ x: pos.x, y: pos.y });
          drawing.value = true;
          return;
        }

        drawing.value = true;
        drawStart.x = pos.x;
        drawStart.y = pos.y;
        drawCurrent.x = pos.x;
        drawCurrent.y = pos.y;
      }

      function onMouseMove(e) {
        const pos = getSvgPos(e);
        cursorX.value = pos.x;
        cursorY.value = pos.y;

        if (dragging && selectedId.value) {
          const el = elements.value.find(e => e.id === selectedId.value);
          if (!el) return;
          const dx = pos.x - dragStart.x;
          const dy = pos.y - dragStart.y;
          if (el.type === 'rect' || el.type === 'text' || el.type === 'image') {
            el.x = dragElStart.x + dx;
            el.y = dragElStart.y + dy;
          } else if (el.type === 'ellipse' || el.type === 'circle') {
            el.cx = dragElStart.cx + dx;
            el.cy = dragElStart.cy + dy;
          } else if (el.type === 'line') {
            el.x1 = dragElStart.x1 + dx;
            el.y1 = dragElStart.y1 + dy;
            el.x2 = dragElStart.x2 + dx;
            el.y2 = dragElStart.y2 + dy;
          }
          return;
        }

        if (!drawing.value) return;

        if (activeTool.value === 'pen' && currentPath.value.length > 0) {
          currentPath.value[currentPath.value.length - 1] = { x: pos.x, y: pos.y };
          return;
        }

        drawCurrent.x = pos.x;
        drawCurrent.y = pos.y;
      }

      function onMouseUp(e) {
        if (dragging) {
          dragging = false;
          pushHistory();
          return;
        }

        if (!drawing.value) return;

        if (activeTool.value === 'pen') return; // pen keeps going

        drawing.value = false;
        const pos = getSvgPos(e);

        if (activeTool.value === 'rect') {
          const x = Math.min(drawStart.x, pos.x);
          const y = Math.min(drawStart.y, pos.y);
          const w = Math.abs(pos.x - drawStart.x);
          const h = Math.abs(pos.y - drawStart.y);
          if (w < 2 && h < 2) return;
          const el = {
            id: genId(), type: 'rect',
            x, y, w, h, rx: 0, ry: 0,
            fill: fillColor.value, stroke: strokeColor.value,
            strokeWidth: strokeWidth.value, opacity: opacity.value, transform: ''
          };
          elements.value.push(el);
          selectedId.value = el.id;
        } else if (activeTool.value === 'ellipse') {
          const cx = (drawStart.x + pos.x) / 2;
          const cy = (drawStart.y + pos.y) / 2;
          const rx = Math.abs(pos.x - drawStart.x) / 2;
          const ry = Math.abs(pos.y - drawStart.y) / 2;
          if (rx < 2 && ry < 2) return;
          const el = {
            id: genId(), type: 'ellipse',
            cx, cy, rx, ry,
            fill: fillColor.value, stroke: strokeColor.value,
            strokeWidth: strokeWidth.value, opacity: opacity.value, transform: ''
          };
          elements.value.push(el);
          selectedId.value = el.id;
        } else if (activeTool.value === 'circle') {
          const r = Math.sqrt(Math.pow(pos.x - drawStart.x, 2) + Math.pow(pos.y - drawStart.y, 2));
          if (r < 2) return;
          const el = {
            id: genId(), type: 'circle',
            cx: drawStart.x, cy: drawStart.y, r: Math.round(r),
            fill: fillColor.value, stroke: strokeColor.value,
            strokeWidth: strokeWidth.value, opacity: opacity.value, transform: ''
          };
          elements.value.push(el);
          selectedId.value = el.id;
        } else if (activeTool.value === 'line') {
          if (Math.abs(pos.x - drawStart.x) < 2 && Math.abs(pos.y - drawStart.y) < 2) return;
          const el = {
            id: genId(), type: 'line',
            x1: drawStart.x, y1: drawStart.y, x2: pos.x, y2: pos.y,
            stroke: strokeColor.value, strokeWidth: strokeWidth.value,
            opacity: opacity.value, transform: ''
          };
          elements.value.push(el);
          selectedId.value = el.id;
        }

        pushHistory();
      }

      function onElementMouseDown(e, el) {
        if (activeTool.value !== 'select') return;
        e.stopPropagation();
        selectedId.value = el.id;
        // apply selected element colors to toolbar
        if (el.fill && el.fill !== 'none') fillColor.value = el.fill;
        if (el.stroke && el.stroke !== 'none') strokeColor.value = el.stroke;
        if (el.strokeWidth) strokeWidth.value = el.strokeWidth;
        if (el.opacity != null) opacity.value = el.opacity;

        dragging = true;
        const pos = getSvgPos(e);
        dragStart = { x: pos.x, y: pos.y };
        dragElStart = JSON.parse(JSON.stringify(el));
      }

      // ---- Pen tool finalize ----
      function finalizePen() {
        if (currentPath.value.length < 2) { currentPath.value = []; drawing.value = false; return; }
        const d = buildPathD(currentPath.value);
        const el = {
          id: genId(), type: 'path',
          d,
          fill: 'none', stroke: strokeColor.value,
          strokeWidth: strokeWidth.value, opacity: opacity.value, transform: ''
        };
        elements.value.push(el);
        selectedId.value = el.id;
        currentPath.value = [];
        drawing.value = false;
        pushHistory();
      }

      // ---- Text editing ----
      function startEditText(el) {
        editingTextEl.value = el;
        editTextValue.value = el.text;
        editingText.value = true;
        nextTick(() => { if (textEditInput.value) textEditInput.value.focus(); });
      }

      function commitEditText() {
        if (editingTextEl.value) {
          editingTextEl.value.text = editTextValue.value || L('text');
          pushHistory();
        }
        editingText.value = false;
        editingTextEl.value = null;
      }

      function cancelEditText() {
        editingText.value = false;
        editingTextEl.value = null;
      }

      // ---- File operations ----
      function newFile() {
        elements.value = [];
        selectedId.value = null;
        currentFilePath.value = '';
        currentFileName.value = '';
        nextId = 1;
        pushHistory();
      }

      function generateSvgString() {
        const svg = svgCanvas.value;
        if (!svg) return '';
        const clone = svg.cloneNode(true);
        // Remove grid and selection indicators
        clone.querySelectorAll('[stroke-dasharray]').forEach(n => n.remove());
        const pattern = clone.querySelector('#svge-grid');
        if (pattern) pattern.parentElement.remove();
        const gridRect = clone.querySelector('rect[fill="url(#svge-grid)"]');
        if (gridRect) gridRect.remove();
        // Set proper background
        const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bgRect.setAttribute('width', canvasW.value);
        bgRect.setAttribute('height', canvasH.value);
        bgRect.setAttribute('fill', canvasBg.value);
        clone.insertBefore(bgRect, clone.firstChild);
        // Fix dimensions
        clone.setAttribute('width', canvasW.value);
        clone.setAttribute('height', canvasH.value);
        clone.removeAttribute('class');
        const serializer = new XMLSerializer();
        let svgStr = serializer.serializeToString(clone);
        svgStr = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgStr;
        return svgStr;
      }

      async function openFile() {
        if (!window.FileDialog) return;
        const result = await window.FileDialog.open({
          title: '📂 ' + L('open'),
          filters: SVG_FILTERS
        });
        if (!result) return;
        try {
          const token = localStorage.getItem('auth_token') || '';
          const resp = await fetch('/api/fs/read?path=' + encodeURIComponent(result.path), {
            headers: { 'Authorization': 'Bearer ' + token }
          });
          if (!resp.ok) { ElMessage.error(L('error')); return; }
          const data = await resp.json();
          parseSvgContent(data.content);
          currentFilePath.value = result.path;
          currentFileName.value = result.name;
        } catch { ElMessage.error(L('error')); }
      }

      function parseSvgContent(svgText) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');
        const svg = doc.querySelector('svg');
        if (!svg) return;

        const vb = svg.getAttribute('viewBox');
        if (vb) {
          const parts = vb.split(/[\s,]+/).map(Number);
          if (parts.length >= 4) { canvasW.value = parts[2]; canvasH.value = parts[3]; }
        } else {
          const w = svg.getAttribute('width'); const h = svg.getAttribute('height');
          if (w) canvasW.value = parseInt(w);
          if (h) canvasH.value = parseInt(h);
        }

        elements.value = [];
        nextId = 1;
        const supportedTags = ['rect', 'ellipse', 'circle', 'line', 'polyline', 'polygon', 'path', 'text', 'image'];
        supportedTags.forEach(tag => {
          svg.querySelectorAll(tag).forEach(node => {
            const el = { id: genId(), type: tag };
            if (tag === 'rect') {
              el.x = +node.getAttribute('x') || 0;
              el.y = +node.getAttribute('y') || 0;
              el.w = +node.getAttribute('width') || 0;
              el.h = +node.getAttribute('height') || 0;
              el.rx = +node.getAttribute('rx') || 0;
              el.ry = +node.getAttribute('ry') || 0;
            } else if (tag === 'ellipse') {
              el.cx = +node.getAttribute('cx') || 0;
              el.cy = +node.getAttribute('cy') || 0;
              el.rx = +node.getAttribute('rx') || 0;
              el.ry = +node.getAttribute('ry') || 0;
            } else if (tag === 'circle') {
              el.cx = +node.getAttribute('cx') || 0;
              el.cy = +node.getAttribute('cy') || 0;
              el.r = +node.getAttribute('r') || 0;
            } else if (tag === 'line') {
              el.x1 = +node.getAttribute('x1') || 0;
              el.y1 = +node.getAttribute('y1') || 0;
              el.x2 = +node.getAttribute('x2') || 0;
              el.y2 = +node.getAttribute('y2') || 0;
            } else if (tag === 'polyline' || tag === 'polygon') {
              el.points = node.getAttribute('points') || '';
            } else if (tag === 'path') {
              el.d = node.getAttribute('d') || '';
            } else if (tag === 'text') {
              el.x = +node.getAttribute('x') || 0;
              el.y = +node.getAttribute('y') || 0;
              el.text = node.textContent || '';
              el.fontSize = parseInt(node.getAttribute('font-size')) || 16;
              el.fontFamily = node.getAttribute('font-family') || 'sans-serif';
              el.fontWeight = node.getAttribute('font-weight') || 'normal';
              el.fontStyle = node.getAttribute('font-style') || 'normal';
            } else if (tag === 'image') {
              el.x = +node.getAttribute('x') || 0;
              el.y = +node.getAttribute('y') || 0;
              el.w = +node.getAttribute('width') || 100;
              el.h = +node.getAttribute('height') || 100;
              el.href = node.getAttribute('href') || node.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || '';
            }
            el.fill = node.getAttribute('fill') || (tag === 'line' || tag === 'polyline' || tag === 'path' ? 'none' : '#000000');
            el.stroke = node.getAttribute('stroke') || (tag === 'line' || tag === 'polyline' ? '#000000' : 'none');
            el.strokeWidth = +node.getAttribute('stroke-width') || (tag === 'line' || tag === 'polyline' ? 2 : 0);
            el.opacity = node.getAttribute('opacity') != null ? +node.getAttribute('opacity') : 1;
            el.transform = node.getAttribute('transform') || '';
            elements.value.push(el);
          });
        });

        selectedId.value = null;
        pushHistory();
      }

      async function saveFile() {
        if (currentFilePath.value) {
          await saveToPath(currentFilePath.value);
        } else {
          await saveFileAs();
        }
      }

      async function saveFileAs() {
        if (!window.FileDialog) return;
        const result = await window.FileDialog.save({
          title: '💾 ' + L('saveAs'),
          defaultName: currentFileName.value || 'drawing.svg',
          filters: SVG_FILTERS
        });
        if (!result) return;
        currentFilePath.value = result.path;
        currentFileName.value = result.name;
        await saveToPath(result.path);
      }

      async function saveToPath(filePath) {
        try {
          const svgStr = generateSvgString();
          const token = localStorage.getItem('auth_token') || '';
          const resp = await fetch('/api/fs/write', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath, content: svgStr })
          });
          if (resp.ok) ElMessage.success(L('saved'));
          else ElMessage.error(L('error'));
        } catch { ElMessage.error(L('error')); }
      }

      function exportPng() {
        const svgStr = generateSvgString();
        const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = canvasW.value;
          canvas.height = canvasH.value;
          const ctx2 = canvas.getContext('2d');
          ctx2.fillStyle = canvasBg.value;
          ctx2.fillRect(0, 0, canvas.width, canvas.height);
          ctx2.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          const link = document.createElement('a');
          link.download = (currentFileName.value || 'drawing').replace(/\.svg$/i, '') + '.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
        };
        img.src = url;
      }

      // ---- Keyboard ----
      function onKeyDown(e) {
        if (editingText.value) return;
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') { e.preventDefault(); saveFileAs(); }
        else if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveFile(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'o') { e.preventDefault(); openFile(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); newFile(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') { e.preventDefault(); duplicateElement(); }
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (selectedId.value && !editingText.value) { e.preventDefault(); deleteElement(); }
        }
        if (e.key === 'Escape') {
          if (activeTool.value === 'pen' && currentPath.value.length > 0) {
            finalizePen();
          }
          selectedId.value = null;
        }
        if (e.key === 'Enter' && activeTool.value === 'pen' && currentPath.value.length > 0) {
          finalizePen();
        }
      }

      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

      onMounted(() => {
        window.addEventListener('locale-changed', onLocaleChanged);
        window.addEventListener('keydown', onKeyDown);
        pushHistory();
      });

      onUnmounted(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
        window.removeEventListener('keydown', onKeyDown);
      });

      return {
        L, locale,
        svgCanvas, canvasWrap, fillPicker, strokePicker, textEditInput,
        canvasW, canvasH, canvasBg, zoom, showGrid, snapToGrid, gridSize,
        activeTool, strokeWidth, strokeColor, fillColor, opacity,
        toolList,
        elements, selectedId, selectedEl,
        drawing, drawStart, drawCurrent, cursorX, cursorY,
        currentPath,
        historyStack, historyIdx,
        currentFilePath, currentFileName,
        editingText, editTextValue, editingTextEl, textOverlayStyle,
        elementIcon, getTextWidth, buildPathD,
        undo, redo, zoomIn, zoomOut, onWheel,
        updateProp, bringToFront, sendToBack, duplicateElement, deleteElement,
        onMouseDown, onMouseMove, onMouseUp, onElementMouseDown,
        startEditText, commitEditText, cancelEditText,
        newFile, openFile, saveFile, saveFileAs, exportPng
      };
    }
  };
})(Vue);
