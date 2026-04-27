(function(Vue) {
  const { ref, onMounted, onUnmounted, nextTick, watch } = Vue;

  const LANGS = {
    tr: {
      color:'Renk', brushSize:'Fırça', sectors:'Dilim', mirror:'Ayna Simetrisi',
      guides:'Kılavuz Çizgiler', eraser:'Silgi', undo:'Geri Al', redo:'Yinele',
      clear:'Temizle', download:'PNG İndir', bgColor:'Arka Plan',
      open:'Aç', save:'Kaydet', saveAs:'Farklı Kaydet', saved:'Kaydedildi', error:'Hata'
    },
    en: {
      color:'Color', brushSize:'Brush', sectors:'Sectors', mirror:'Mirror Symmetry',
      guides:'Guide Lines', eraser:'Eraser', undo:'Undo', redo:'Redo',
      clear:'Clear', download:'Download PNG', bgColor:'Background',
      open:'Open', save:'Save', saveAs:'Save As', saved:'Saved', error:'Error'
    },
    de: {
      color:'Farbe', brushSize:'Pinsel', sectors:'Sektoren', mirror:'Spiegelsymmetrie',
      guides:'Hilfslinien', eraser:'Radierer', undo:'Rückgängig', redo:'Wiederholen',
      clear:'Löschen', download:'PNG herunterladen', bgColor:'Hintergrund',
      open:'Öffnen', save:'Speichern', saveAs:'Speichern unter', saved:'Gespeichert', error:'Fehler'
    },
    fr: {
      color:'Couleur', brushSize:'Pinceau', sectors:'Secteurs', mirror:'Symétrie miroir',
      guides:'Lignes de guide', eraser:'Gomme', undo:'Annuler', redo:'Rétablir',
      clear:'Effacer', download:'Télécharger PNG', bgColor:'Arrière-plan',
      open:'Ouvrir', save:'Enregistrer', saveAs:'Enregistrer sous', saved:'Enregistré', error:'Erreur'
    },
    es: {
      color:'Color', brushSize:'Pincel', sectors:'Sectores', mirror:'Simetría espejo',
      guides:'Líneas guía', eraser:'Borrador', undo:'Deshacer', redo:'Rehacer',
      clear:'Borrar', download:'Descargar PNG', bgColor:'Fondo',
      open:'Abrir', save:'Guardar', saveAs:'Guardar como', saved:'Guardado', error:'Error'
    },
    ru: {
      color:'Цвет', brushSize:'Кисть', sectors:'Секторы', mirror:'Зеркальная симметрия',
      guides:'Направляющие', eraser:'Ластик', undo:'Отмена', redo:'Повтор',
      clear:'Очистить', download:'Скачать PNG', bgColor:'Фон',
      open:'Открыть', save:'Сохранить', saveAs:'Сохранить как', saved:'Сохранено', error:'Ошибка'
    },
    zh: {
      color:'颜色', brushSize:'画笔', sectors:'扇区', mirror:'镜像对称',
      guides:'辅助线', eraser:'橡皮擦', undo:'撤销', redo:'重做',
      clear:'清除', download:'下载PNG', bgColor:'背景',
      open:'打开', save:'保存', saveAs:'另存为', saved:'已保存', error:'错误'
    },
    ja: {
      color:'色', brushSize:'ブラシ', sectors:'セクター', mirror:'ミラー対称',
      guides:'ガイドライン', eraser:'消しゴム', undo:'元に戻す', redo:'やり直す',
      clear:'クリア', download:'PNGダウンロード', bgColor:'背景',
      open:'開く', save:'保存', saveAs:'名前を付けて保存', saved:'保存しました', error:'エラー'
    },
    it: {
      color:'Colore', brushSize:'Pennello', sectors:'Settori', mirror:'Simmetria speculare',
      guides:'Linee guida', eraser:'Gomma', undo:'Annulla', redo:'Ripristina',
      clear:'Cancella', download:'Scarica PNG', bgColor:'Sfondo',
      open:'Apri', save:'Salva', saveAs:'Salva con nome', saved:'Salvato', error:'Errore'
    }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  const PRESET_COLORS = [
    '#1A202C','#E53E3E','#DD6B20','#D69E2E','#38A169',
    '#319795','#3182CE','#5B21B6','#D53F8C','#FFFFFF'
  ];

  return {
    setup() {
      const locale = ref(getLocale());
      const L = (k) => (LANGS[locale.value] || LANGS.en)[k] || k;

      /* ---- Drawing state ---- */
      const drawCanvas = ref(null);
      const guideCanvas = ref(null);
      const canvasWrap = ref(null);

      const color = ref('#1A202C');
      const bgColor = ref('#FFFFFF');
      const brushSize = ref(4);
      const sectors = ref(8);
      const mirror = ref(true);
      const showGuides = ref(true);
      const eraser = ref(false);

      const currentFilePath = ref('');
      const currentFileName = ref('');

      const history = ref([]);
      const historyIdx = ref(-1);
      const MAX_HISTORY = 40;

      let ctx = null;
      let gCtx = null;
      let canvasSize = 2000; // internal resolution
      let drawing = false;
      let prevX = 0, prevY = 0;

      /* ---- Symmetry math (from Mandala-JS) ---- */
      function getSymmetryPoints(x, y) {
        const ctr = canvasSize / 2;
        const relX = x - ctr;
        const relY = ctr - y;
        const dist = Math.hypot(relX, relY);
        const angle = Math.atan2(relX, relY);
        const result = [];
        const step = (Math.PI * 2) / sectors.value;
        for (let i = 0; i < sectors.value; i++) {
          const theta = angle + step * i;
          const px = ctr + Math.sin(theta) * dist;
          const py = ctr - Math.cos(theta) * dist;
          result.push([px, py]);
          if (mirror.value) {
            result.push([ctr - Math.sin(theta) * dist, py]);
          }
        }
        return result;
      }

      function drawSymLine(x1, y1, x2, y2) {
        const starts = getSymmetryPoints(x1, y1);
        const ends = getSymmetryPoints(x2, y2);
        ctx.lineWidth = brushSize.value;
        ctx.strokeStyle = eraser.value ? bgColor.value : color.value;
        ctx.globalCompositeOperation = eraser.value ? 'destination-out' : 'source-over';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        for (let i = 0; i < starts.length; i++) {
          ctx.moveTo(starts[i][0], starts[i][1]);
          ctx.lineTo(ends[i][0], ends[i][1]);
        }
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      }

      /* ---- Coordinate helpers ---- */
      function getCanvasCoords(e) {
        const canvas = drawCanvas.value;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return [
          (e.clientX - rect.left) * scaleX,
          (e.clientY - rect.top) * scaleY
        ];
      }

      /* ---- Pointer events ---- */
      function onPointerDown(e) {
        drawing = true;
        const [x, y] = getCanvasCoords(e);
        prevX = x;
        prevY = y;
        drawCanvas.value.setPointerCapture(e.pointerId);
      }

      function onPointerMove(e) {
        if (!drawing) return;
        const [x, y] = getCanvasCoords(e);
        drawSymLine(prevX, prevY, x, y);
        prevX = x;
        prevY = y;
      }

      function onPointerUp() {
        if (!drawing) return;
        drawing = false;
        pushHistory();
      }

      /* ---- History (undo/redo) ---- */
      function pushHistory() {
        const data = drawCanvas.value.toDataURL();
        if (historyIdx.value < history.value.length - 1) {
          history.value = history.value.slice(0, historyIdx.value + 1);
        }
        history.value.push(data);
        if (history.value.length > MAX_HISTORY) history.value.shift();
        historyIdx.value = history.value.length - 1;
      }

      function restoreHistory(idx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvasSize, canvasSize);
          ctx.drawImage(img, 0, 0);
        };
        img.src = history.value[idx];
      }

      function undoAction() {
        if (historyIdx.value <= 0) return;
        historyIdx.value--;
        restoreHistory(historyIdx.value);
      }

      function redoAction() {
        if (historyIdx.value >= history.value.length - 1) return;
        historyIdx.value++;
        restoreHistory(historyIdx.value);
      }

      /* ---- Guide lines ---- */
      function drawGuides() {
        if (!gCtx) return;
        const gc = guideCanvas.value;
        gCtx.clearRect(0, 0, gc.width, gc.height);
        const cx = gc.width / 2;
        const cy = gc.height / 2;
        const r = Math.max(gc.width, gc.height);
        const step = (Math.PI * 2) / sectors.value;

        gCtx.strokeStyle = 'rgba(0,0,0,0.15)';
        gCtx.lineWidth = 1;

        for (let i = 0; i < sectors.value; i++) {
          const angle = step * i;
          gCtx.beginPath();
          gCtx.moveTo(cx, cy);
          gCtx.lineTo(cx + Math.sin(angle) * r, cy - Math.cos(angle) * r);
          gCtx.stroke();
        }
        // center dot
        gCtx.beginPath();
        gCtx.arc(cx, cy, 3, 0, Math.PI * 2);
        gCtx.fillStyle = 'rgba(0,0,0,0.3)';
        gCtx.fill();
      }

      function toggleGuides() {
        showGuides.value = !showGuides.value;
        if (showGuides.value) nextTick(drawGuides);
      }

      /* ---- Canvas actions ---- */
      function clearCanvas() {
        ctx.clearRect(0, 0, canvasSize, canvasSize);
        pushHistory();
      }

      function onBgChange() {
        // bg is painted via CSS, no canvas repaint needed
      }

      const IMG_FILTERS = [{ label: 'Images', extensions: ['.png', '.jpg', '.jpeg', '.webp'] }];

      function getCompositeDataUrl(mime = 'image/png') {
        const tmp = document.createElement('canvas');
        tmp.width = canvasSize;
        tmp.height = canvasSize;
        const tCtx = tmp.getContext('2d');
        tCtx.fillStyle = bgColor.value;
        tCtx.fillRect(0, 0, canvasSize, canvasSize);
        tCtx.drawImage(drawCanvas.value, 0, 0);
        return tmp.toDataURL(mime);
      }

      function downloadPNG() {
        const link = document.createElement('a');
        link.download = currentFileName.value || 'mandala.png';
        link.href = getCompositeDataUrl('image/png');
        link.click();
      }

      /* ---- Server file operations ---- */
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
          const mimeMap = { png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg', webp:'image/webp' };
          const mime = mimeMap[ext] || 'image/png';
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvasSize, canvasSize);
            ctx.drawImage(img, 0, 0, canvasSize, canvasSize);
            pushHistory();
          };
          img.src = 'data:' + mime + ';base64,' + data.content;
          currentFilePath.value = result.path;
          currentFileName.value = result.name;
        } catch { ElMessage.error(L('error')); }
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
          defaultName: currentFileName.value || 'mandala-' + Date.now() + '.png',
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
        try {
          const ext = (filePath.split('.').pop() || 'png').toLowerCase();
          const mime = (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : 'image/png';
          const b64 = getCompositeDataUrl(mime).split(',')[1];
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

      /* ---- Resize observer ---- */
      let resizeObs = null;

      function fitCanvas() {
        if (!canvasWrap.value) return;
        const wrap = canvasWrap.value;
        const side = Math.min(wrap.clientWidth, wrap.clientHeight);
        const dc = drawCanvas.value;
        const gc = guideCanvas.value;
        dc.style.width = side + 'px';
        dc.style.height = side + 'px';
        gc.width = side;
        gc.height = side;
        gc.style.width = side + 'px';
        gc.style.height = side + 'px';
        if (showGuides.value) drawGuides();
      }

      /* ---- Init ---- */
      onMounted(async () => {
        await nextTick();
        const dc = drawCanvas.value;
        dc.width = canvasSize;
        dc.height = canvasSize;
        ctx = dc.getContext('2d');

        const gc = guideCanvas.value;
        gCtx = gc.getContext('2d');

        fitCanvas();
        pushHistory(); // blank state

        resizeObs = new ResizeObserver(fitCanvas);
        resizeObs.observe(canvasWrap.value);
      });

      onUnmounted(() => {
        if (resizeObs) resizeObs.disconnect();
      });

      watch(sectors, () => {
        if (showGuides.value) nextTick(drawGuides);
      });

      return {
        L, drawCanvas, guideCanvas, canvasWrap,
        color, bgColor, brushSize, sectors, mirror, showGuides, eraser,
        history, historyIdx, presetColors: PRESET_COLORS,
        currentFileName, currentFilePath,
        onPointerDown, onPointerMove, onPointerUp,
        undoAction, redoAction, clearCanvas, downloadPNG,
        openFile, saveFile, saveFileAs,
        onBgChange, toggleGuides
      };
    }
  };
})(Vue);
