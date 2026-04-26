(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, nextTick, watch } = Vue;

  const LANGS = {
    tr: {
      pencil:'Kalem', brush:'Fırça', eraser:'Silgi', line:'Çizgi',
      rect:'Dikdörtgen', ellipse:'Elips', fill:'Dolgu', picker:'Renk Seçici', text:'Metin',
      newFile:'Yeni', open:'Aç', save:'Kaydet', saveAs:'Farklı Kaydet',
      upload:'Yükle', download:'İndir (PNG)',
      undo:'Geri Al', redo:'Yinele',
      bgColor:'Arka plan rengi', fgColor:'Ön plan rengi', resize:'Boyutlandır',
      filled:'Dolu', width:'Genişlik', height:'Yükseklik',
      apply:'Uygula', cancel:'İptal', textPlaceholder:'Metin gir...',
      tool:'Araç', saved:'Kaydedildi', error:'Hata'
    },
    en: {
      pencil:'Pencil', brush:'Brush', eraser:'Eraser', line:'Line',
      rect:'Rectangle', ellipse:'Ellipse', fill:'Fill', picker:'Color Picker', text:'Text',
      newFile:'New', open:'Open', save:'Save', saveAs:'Save As',
      upload:'Upload', download:'Download (PNG)',
      undo:'Undo', redo:'Redo',
      bgColor:'Background color', fgColor:'Foreground color', resize:'Resize',
      filled:'Filled', width:'Width', height:'Height',
      apply:'Apply', cancel:'Cancel', textPlaceholder:'Enter text...',
      tool:'Tool', saved:'Saved', error:'Error'
    },
    de: {
      pencil:'Stift', brush:'Pinsel', eraser:'Radierer', line:'Linie',
      rect:'Rechteck', ellipse:'Ellipse', fill:'Füllen', picker:'Farbwähler', text:'Text',
      newFile:'Neu', open:'Öffnen', save:'Speichern', saveAs:'Speichern unter',
      upload:'Hochladen', download:'Herunterladen (PNG)',
      undo:'Rückgängig', redo:'Wiederholen',
      bgColor:'Hintergrundfarbe', fgColor:'Vordergrundfarbe', resize:'Größe ändern',
      filled:'Gefüllt', width:'Breite', height:'Höhe',
      apply:'Anwenden', cancel:'Abbrechen', textPlaceholder:'Text eingeben...',
      tool:'Werkzeug', saved:'Gespeichert', error:'Fehler'
    },
    fr: {
      pencil:'Crayon', brush:'Pinceau', eraser:'Gomme', line:'Ligne',
      rect:'Rectangle', ellipse:'Ellipse', fill:'Remplir', picker:'Pipette', text:'Texte',
      newFile:'Nouveau', open:'Ouvrir', save:'Enregistrer', saveAs:'Enregistrer sous',
      upload:'Importer', download:'Télécharger (PNG)',
      undo:'Annuler', redo:'Rétablir',
      bgColor:'Couleur de fond', fgColor:'Couleur de premier plan', resize:'Redimensionner',
      filled:'Rempli', width:'Largeur', height:'Hauteur',
      apply:'Appliquer', cancel:'Annuler', textPlaceholder:'Saisir texte...',
      tool:'Outil', saved:'Enregistré', error:'Erreur'
    },
    es: {
      pencil:'Lápiz', brush:'Pincel', eraser:'Borrador', line:'Línea',
      rect:'Rectángulo', ellipse:'Elipse', fill:'Rellenar', picker:'Cuentagotas', text:'Texto',
      newFile:'Nuevo', open:'Abrir', save:'Guardar', saveAs:'Guardar como',
      upload:'Subir', download:'Descargar (PNG)',
      undo:'Deshacer', redo:'Rehacer',
      bgColor:'Color de fondo', fgColor:'Color de primer plano', resize:'Redimensionar',
      filled:'Relleno', width:'Ancho', height:'Alto',
      apply:'Aplicar', cancel:'Cancelar', textPlaceholder:'Escribir texto...',
      tool:'Herramienta', saved:'Guardado', error:'Error'
    },
    ru: {
      pencil:'Карандаш', brush:'Кисть', eraser:'Ластик', line:'Линия',
      rect:'Прямоугольник', ellipse:'Эллипс', fill:'Заливка', picker:'Пипетка', text:'Текст',
      newFile:'Новый', open:'Открыть', save:'Сохранить', saveAs:'Сохранить как',
      upload:'Загрузить', download:'Скачать (PNG)',
      undo:'Отмена', redo:'Повтор',
      bgColor:'Цвет фона', fgColor:'Цвет переднего плана', resize:'Размер',
      filled:'Залитый', width:'Ширина', height:'Высота',
      apply:'Применить', cancel:'Отмена', textPlaceholder:'Введите текст...',
      tool:'Инструмент', saved:'Сохранено', error:'Ошибка'
    }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      // Canvas refs
      const mainCanvas = ref(null);
      const previewCanvas = ref(null);
      const canvasWrap = ref(null);
      const fileInput = ref(null);
      const fgPicker = ref(null);
      const bgPicker = ref(null);
      const textInput = ref(null);

      // Canvas state
      const canvasW = ref(800);
      const canvasH = ref(600);
      let ctx = null;
      let previewCtx = null;

      // Tools
      const tool = ref('pencil');
      const brushSize = ref(3);
      const fgColor = ref('#000000');
      const bgColor = ref('#ffffff');
      const shapeFill = ref(false);

      const tools = computed(() => [
        { id: 'pencil', icon: '✏️', label: L('pencil') },
        { id: 'brush', icon: '🖌️', label: L('brush') },
        { id: 'eraser', icon: '🧹', label: L('eraser') },
        { id: 'line', icon: '📏', label: L('line') },
        { id: 'rect', icon: '⬜', label: L('rect') },
        { id: 'ellipse', icon: '⭕', label: L('ellipse') },
        { id: 'fill', icon: '🪣', label: L('fill') },
        { id: 'picker', icon: '💧', label: L('picker') },
        { id: 'text', icon: '🔤', label: L('text') }
      ]);

      const palette = [
        '#000000','#404040','#808080','#c0c0c0','#ffffff',
        '#800000','#ff0000','#ff6b6b','#ff8c00','#ffa500',
        '#ffff00','#f6d365','#008000','#00ff00','#2ecc71',
        '#008080','#00ffff','#4ecdc4','#000080','#0000ff',
        '#4a90d9','#800080','#ff00ff','#a29bfe','#6c5ce7',
        '#a0522d','#deb887','#ffe4c4','#ff69b4','#ff1493'
      ];

      // Drawing state
      let drawing = false;
      let startX = 0, startY = 0;
      let lastX = 0, lastY = 0;
      const mouseX = ref(0);
      const mouseY = ref(0);

      // History (undo/redo)
      const historyStack = ref([]);
      const historyIdx = ref(-1);
      const MAX_HISTORY = 40;

      // Resize
      const showResize = ref(false);
      const resizeW = ref(800);
      const resizeH = ref(600);

      // Text
      const textMode = ref(false);
      const textPos = ref({ x: 0, y: 0 });
      const textValue = ref('');
      const currentFilePath = ref('');
      const currentFileName = ref('');

      const IMG_FILTERS = [
        { label: 'Images', extensions: ['.png', '.jpg', '.jpeg', '.bmp', '.gif', '.webp'] }
      ];

      const currentToolLabel = computed(() => {
        const t = tools.value.find(x => x.id === tool.value);
        return t ? t.label : '';
      });

      const cursorStyle = computed(() => {
        switch (tool.value) {
          case 'pencil': case 'brush': return 'crosshair';
          case 'eraser': return 'cell';
          case 'fill': return 'cell';
          case 'picker': return 'crosshair';
          case 'text': return 'text';
          case 'line': case 'rect': case 'ellipse': return 'crosshair';
          default: return 'default';
        }
      });

      // Init
      function initCanvas() {
        const c = mainCanvas.value;
        const p = previewCanvas.value;
        if (!c || !p) return;

        c.width = canvasW.value;
        c.height = canvasH.value;
        p.width = canvasW.value;
        p.height = canvasH.value;

        ctx = c.getContext('2d');
        previewCtx = p.getContext('2d');

        ctx.fillStyle = bgColor.value;
        ctx.fillRect(0, 0, c.width, c.height);

        pushHistory();
      }

      function pushHistory() {
        if (!ctx) return;
        // Trim future states
        if (historyIdx.value < historyStack.value.length - 1) {
          historyStack.value = historyStack.value.slice(0, historyIdx.value + 1);
        }
        const data = mainCanvas.value.toDataURL();
        historyStack.value.push(data);
        if (historyStack.value.length > MAX_HISTORY) {
          historyStack.value.shift();
        }
        historyIdx.value = historyStack.value.length - 1;
      }

      function restoreFromHistory(idx) {
        if (!ctx || idx < 0 || idx >= historyStack.value.length) return;
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvasW.value, canvasH.value);
          ctx.drawImage(img, 0, 0);
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

      // File ops
      function newCanvas() {
        if (!ctx) return;
        ctx.fillStyle = bgColor.value;
        ctx.fillRect(0, 0, canvasW.value, canvasH.value);
        currentFilePath.value = '';
        currentFileName.value = '';
        pushHistory();
      }

      function loadImageToCanvas(img) {
        canvasW.value = img.width;
        canvasH.value = img.height;
        nextTick(() => {
          mainCanvas.value.width = img.width;
          mainCanvas.value.height = img.height;
          previewCanvas.value.width = img.width;
          previewCanvas.value.height = img.height;
          ctx = mainCanvas.value.getContext('2d');
          previewCtx = previewCanvas.value.getContext('2d');
          ctx.drawImage(img, 0, 0);
          pushHistory();
        });
      }

      // Open from server via FileDialog
      async function openFile() {
        if (!window.FileDialog) return;
        const result = await window.FileDialog.open({
          title: '📂 ' + L('open'),
          filters: IMG_FILTERS
        });
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
          const mime = mimeMap[ext] || 'image/png';
          const img = new Image();
          img.onload = () => loadImageToCanvas(img);
          img.src = 'data:' + mime + ';base64,' + data.content;
          currentFilePath.value = result.path;
          currentFileName.value = result.name;
        } catch { ElMessage.error(L('error')); }
      }

      // Upload from local device
      function uploadFile() {
        if (fileInput.value) fileInput.value.click();
      }

      function onFileOpen(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => loadImageToCanvas(img);
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
        currentFileName.value = file.name;
        currentFilePath.value = '';
        e.target.value = '';
      }

      // Save to server (same path or save-as)
      async function saveFile() {
        if (currentFilePath.value) {
          await saveToPath(currentFilePath.value);
        } else {
          await saveFileAs();
        }
      }

      async function saveFileAs() {
        if (!window.FileDialog || !mainCanvas.value) return;
        const result = await window.FileDialog.save({
          title: '💾 ' + L('saveAs'),
          defaultName: currentFileName.value || 'paint-' + Date.now() + '.png',
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
        if (!mainCanvas.value) return;
        try {
          const ext = (filePath.split('.').pop() || 'png').toLowerCase();
          const mime = (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : 'image/png';
          const dataUrl = mainCanvas.value.toDataURL(mime);
          const b64 = dataUrl.split(',')[1];
          const token = localStorage.getItem('auth_token') || '';
          const resp = await fetch('/api/fs/write-binary', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath: filePath, content: b64 })
          });
          if (resp.ok) { ElMessage.success(L('saved')); }
          else { ElMessage.error(L('error')); }
        } catch { ElMessage.error(L('error')); }
      }

      // Download to local device
      function downloadFile() {
        if (!mainCanvas.value) return;
        const link = document.createElement('a');
        link.download = currentFileName.value || 'paint-' + Date.now() + '.png';
        link.href = mainCanvas.value.toDataURL('image/png');
        link.click();
      }

      // Resize
      function applyResize() {
        const w = Math.max(1, Math.min(4000, resizeW.value));
        const h = Math.max(1, Math.min(4000, resizeH.value));
        // Save current image
        const imageData = mainCanvas.value.toDataURL();
        canvasW.value = w;
        canvasH.value = h;
        nextTick(() => {
          mainCanvas.value.width = w;
          mainCanvas.value.height = h;
          previewCanvas.value.width = w;
          previewCanvas.value.height = h;
          ctx = mainCanvas.value.getContext('2d');
          previewCtx = previewCanvas.value.getContext('2d');
          ctx.fillStyle = bgColor.value;
          ctx.fillRect(0, 0, w, h);
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
            pushHistory();
          };
          img.src = imageData;
        });
        showResize.value = false;
      }

      // Color pickers
      function pickFgColor() { if (fgPicker.value) fgPicker.value.click(); }
      function pickBgColor() { if (bgPicker.value) bgPicker.value.click(); }

      // Get mouse coords relative to canvas
      function getPos(e) {
        const rect = mainCanvas.value.getBoundingClientRect();
        const scaleX = mainCanvas.value.width / rect.width;
        const scaleY = mainCanvas.value.height / rect.height;
        return {
          x: Math.round((e.clientX - rect.left) * scaleX),
          y: Math.round((e.clientY - rect.top) * scaleY)
        };
      }

      // Drawing functions
      function drawLine(context, x1, y1, x2, y2, color, size) {
        context.strokeStyle = color;
        context.lineWidth = size;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
      }

      function drawRect(context, x1, y1, x2, y2, color, size, filled) {
        const rx = Math.min(x1, x2), ry = Math.min(y1, y2);
        const rw = Math.abs(x2 - x1), rh = Math.abs(y2 - y1);
        context.strokeStyle = color;
        context.lineWidth = size;
        context.lineJoin = 'miter';
        if (filled) {
          context.fillStyle = color;
          context.fillRect(rx, ry, rw, rh);
        } else {
          context.strokeRect(rx, ry, rw, rh);
        }
      }

      function drawEllipse(context, x1, y1, x2, y2, color, size, filled) {
        const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
        const rx = Math.abs(x2 - x1) / 2, ry = Math.abs(y2 - y1) / 2;
        context.strokeStyle = color;
        context.fillStyle = color;
        context.lineWidth = size;
        context.beginPath();
        context.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        if (filled) context.fill();
        else context.stroke();
      }

      // Flood fill
      function floodFill(sx, sy, fillColor) {
        const c = mainCanvas.value;
        const w = c.width, h = c.height;
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Parse fill color
        const fc = hexToRgb(fillColor);
        if (!fc) return;

        const idx = (sy * w + sx) * 4;
        const tR = data[idx], tG = data[idx + 1], tB = data[idx + 2], tA = data[idx + 3];

        // Don't fill if target color equals fill color
        if (tR === fc.r && tG === fc.g && tB === fc.b && tA === 255) return;

        const stack = [[sx, sy]];
        const visited = new Uint8Array(w * h);

        function match(i) {
          return data[i] === tR && data[i + 1] === tG && data[i + 2] === tB && data[i + 3] === tA;
        }

        while (stack.length > 0) {
          const [cx, cy] = stack.pop();
          if (cx < 0 || cx >= w || cy < 0 || cy >= h) continue;
          const pi = cy * w + cx;
          if (visited[pi]) continue;
          const di = pi * 4;
          if (!match(di)) continue;

          visited[pi] = 1;
          data[di] = fc.r;
          data[di + 1] = fc.g;
          data[di + 2] = fc.b;
          data[di + 3] = 255;

          stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
        }

        ctx.putImageData(imgData, 0, 0);
      }

      function hexToRgb(hex) {
        const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
        return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
      }

      function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
      }

      // Color picker tool
      function pickColorAt(x, y) {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        fgColor.value = rgbToHex(pixel[0], pixel[1], pixel[2]);
      }

      // Text
      function commitText() {
        if (!textValue.value || !ctx) { cancelText(); return; }
        const pos = textPos.value;
        const fontSize = brushSize.value + 10;
        ctx.font = fontSize + 'px "Segoe UI", sans-serif';
        ctx.fillStyle = fgColor.value;
        ctx.textBaseline = 'top';
        ctx.fillText(textValue.value, pos.canvasX, pos.canvasY);
        textMode.value = false;
        textValue.value = '';
        pushHistory();
      }

      function cancelText() {
        textMode.value = false;
        textValue.value = '';
      }

      // Mouse handlers
      function onMouseDown(e) {
        const pos = getPos(e);
        mouseX.value = pos.x;
        mouseY.value = pos.y;

        if (tool.value === 'fill') {
          const color = e.button === 2 ? bgColor.value : fgColor.value;
          floodFill(pos.x, pos.y, color);
          pushHistory();
          return;
        }

        if (tool.value === 'picker') {
          pickColorAt(pos.x, pos.y);
          return;
        }

        if (tool.value === 'text') {
          // Position text input
          const rect = mainCanvas.value.getBoundingClientRect();
          textPos.value = {
            x: e.clientX - rect.left + mainCanvas.value.offsetLeft,
            y: e.clientY - rect.top + mainCanvas.value.offsetTop,
            canvasX: pos.x,
            canvasY: pos.y
          };
          textMode.value = true;
          textValue.value = '';
          nextTick(() => { if (textInput.value) textInput.value.focus(); });
          return;
        }

        drawing = true;
        startX = pos.x;
        startY = pos.y;
        lastX = pos.x;
        lastY = pos.y;

        if (tool.value === 'pencil' || tool.value === 'brush' || tool.value === 'eraser') {
          const color = tool.value === 'eraser' ? bgColor.value : fgColor.value;
          const size = tool.value === 'brush' ? brushSize.value * 2 : brushSize.value;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }
      }

      function onMouseMove(e) {
        const pos = getPos(e);
        mouseX.value = pos.x;
        mouseY.value = pos.y;

        if (!drawing) return;

        if (tool.value === 'pencil' || tool.value === 'brush' || tool.value === 'eraser') {
          const color = tool.value === 'eraser' ? bgColor.value : fgColor.value;
          const size = tool.value === 'brush' ? brushSize.value * 2 : brushSize.value;
          drawLine(ctx, lastX, lastY, pos.x, pos.y, color, size);
          lastX = pos.x;
          lastY = pos.y;
        } else if (tool.value === 'line' || tool.value === 'rect' || tool.value === 'ellipse') {
          // Preview
          previewCtx.clearRect(0, 0, canvasW.value, canvasH.value);
          const color = fgColor.value;
          const size = brushSize.value;
          if (tool.value === 'line') {
            drawLine(previewCtx, startX, startY, pos.x, pos.y, color, size);
          } else if (tool.value === 'rect') {
            drawRect(previewCtx, startX, startY, pos.x, pos.y, color, size, shapeFill.value);
          } else if (tool.value === 'ellipse') {
            drawEllipse(previewCtx, startX, startY, pos.x, pos.y, color, size, shapeFill.value);
          }
        }
      }

      function onMouseUp(e) {
        if (!drawing) return;
        drawing = false;

        const pos = getPos(e);

        if (tool.value === 'line') {
          drawLine(ctx, startX, startY, pos.x, pos.y, fgColor.value, brushSize.value);
        } else if (tool.value === 'rect') {
          drawRect(ctx, startX, startY, pos.x, pos.y, fgColor.value, brushSize.value, shapeFill.value);
        } else if (tool.value === 'ellipse') {
          drawEllipse(ctx, startX, startY, pos.x, pos.y, fgColor.value, brushSize.value, shapeFill.value);
        }

        // Clear preview
        previewCtx.clearRect(0, 0, canvasW.value, canvasH.value);

        pushHistory();
      }

      // Keyboard shortcuts
      function onKeyDown(e) {
        if (textMode.value) return;
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') { e.preventDefault(); saveFileAs(); }
        else if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveFile(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'o') { e.preventDefault(); openFile(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); newCanvas(); }
      }

      let localeTimer = null;
      function onPaintOpenImage(e) {
        const detail = e.detail || window.__screenshotImage;
        if (!detail || !detail.dataUrl) return;
        const img = new Image();
        img.onload = () => loadImageToCanvas(img);
        img.src = detail.dataUrl;
        currentFileName.value = 'screenshot.png';
        currentFilePath.value = '';
        window.__screenshotImage = null;
      }
      onMounted(() => {
        localeTimer = setInterval(() => { locale.value = getLocale(); }, 1000);
        nextTick(() => {
          initCanvas();
          // Check if opened from screenshot
          if (window.__screenshotImage) {
            setTimeout(() => onPaintOpenImage({}), 200);
          }
        });
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('paint-open-image', onPaintOpenImage);
      });

      onUnmounted(() => {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('paint-open-image', onPaintOpenImage);
        if (localeTimer) clearInterval(localeTimer);
      });

      watch(showResize, (v) => {
        if (v) { resizeW.value = canvasW.value; resizeH.value = canvasH.value; }
      });

      return {
        L, mainCanvas, previewCanvas, canvasWrap, fileInput, fgPicker, bgPicker, textInput,
        canvasW, canvasH, tool, brushSize, fgColor, bgColor, shapeFill,
        tools, palette, mouseX, mouseY,
        historyStack, historyIdx,
        showResize, resizeW, resizeH,
        textMode, textPos, textValue,
        currentFilePath, currentFileName,
        currentToolLabel, cursorStyle,
        undo, redo, newCanvas, openFile, onFileOpen, saveFile, saveFileAs,
        uploadFile, downloadFile,
        applyResize, pickFgColor, pickBgColor,
        onMouseDown, onMouseMove, onMouseUp,
        commitText, cancelText
      };
    }
  };
})(Vue);
