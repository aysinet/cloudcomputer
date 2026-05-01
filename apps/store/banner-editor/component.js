(function(Vue) {
  const { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } = Vue;

  return {
    setup() {
      // Refs
      const fabricCanvasEl = ref(null);
      const canvasArea = ref(null);
      const localFileInput = ref(null);

      // State
      const canvasW = ref(728);
      const canvasH = ref(90);
      const bgColor = ref('#1a1a2e');
      const sizePreset = ref('Leaderboard');
      const zoom = ref(1);
      const fabricReady = ref(false);
      const loading = ref(true);

      const sizePresets = [
        { label: 'Leaderboard', w: 728, h: 90 },
        { label: 'Banner', w: 468, h: 60 },
        { label: 'Half Banner', w: 234, h: 60 },
        { label: 'Medium Rectangle', w: 300, h: 250 },
        { label: 'Large Rectangle', w: 336, h: 280 },
        { label: 'Wide Skyscraper', w: 160, h: 600 },
        { label: 'Skyscraper', w: 120, h: 600 },
        { label: 'Half Page', w: 300, h: 600 },
        { label: 'Billboard', w: 970, h: 250 },
        { label: 'Large Leaderboard', w: 970, h: 90 },
        { label: 'Square', w: 250, h: 250 },
        { label: 'Small Square', w: 200, h: 200 },
        { label: 'Facebook Cover', w: 820, h: 312 },
        { label: 'Facebook Post', w: 1200, h: 630 },
        { label: 'Instagram Post', w: 1080, h: 1080 },
        { label: 'Instagram Story', w: 1080, h: 1920 },
        { label: 'Twitter Header', w: 1500, h: 500 },
        { label: 'Twitter Post', w: 1200, h: 675 },
        { label: 'YouTube Thumbnail', w: 1280, h: 720 },
        { label: 'YouTube Banner', w: 2560, h: 1440 },
        { label: 'LinkedIn Cover', w: 1584, h: 396 },
        { label: 'LinkedIn Post', w: 1200, h: 627 },
        { label: 'Pinterest Pin', w: 1000, h: 1500 },
        { label: 'Email Header', w: 600, h: 200 },
        { label: 'Full HD', w: 1920, h: 1080 },
        { label: '4K UHD', w: 3840, h: 2160 },
      ];

      // Layers panel
      const layers = reactive([]);
      const selectedLayerId = ref(null);
      let layerIdCounter = 0;

      const selectedLayer = computed(function() { return layers.find(function(l) { return l.id === selectedLayerId.value; }) || null; });
      const reversedLayers = computed(function() { return layers.slice().reverse(); });

      // History
      const history = ref([]);
      const historyIdx = ref(-1);
      const MAX_HISTORY = 50;
      let historyPaused = false;

      // Fabric canvas ref
      let fCanvas = null;

      // Auth
      function getToken() { try { return localStorage.getItem('auth_token') || ''; } catch(e) { return ''; } }

      // Load Fabric.js CDN (disable AMD define to avoid conflict with Monaco loader)
      function loadFabricJs() {
        return new Promise(function(resolve, reject) {
          if (window.fabric && window.fabric.Canvas) { resolve(); return; }
          // Temporarily hide AMD define so Fabric.js loads as a global script
          var origDefine = window.define;
          window.define = undefined;
          var script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js';
          script.onload = function() {
            // Restore AMD define
            window.define = origDefine;
            if (window.fabric && window.fabric.Canvas) {
              resolve();
            } else {
              reject(new Error('Fabric.js loaded but fabric.Canvas not available'));
            }
          };
          script.onerror = function() {
            window.define = origDefine;
            reject(new Error('Failed to load Fabric.js'));
          };
          document.head.appendChild(script);
        });
      }

      // Init Fabric Canvas
      function initFabricCanvas() {
        var el = fabricCanvasEl.value;
        if (!el) return;

        fCanvas = new fabric.Canvas(el, {
          width: canvasW.value,
          height: canvasH.value,
          backgroundColor: bgColor.value,
          selection: true,
          preserveObjectStacking: true,
        });

        fCanvas.on('selection:created', onSelectionChanged);
        fCanvas.on('selection:updated', onSelectionChanged);
        fCanvas.on('selection:cleared', function() {
          selectedLayerId.value = null;
          syncLayersFromCanvas();
        });

        fCanvas.on('object:modified', function() {
          syncLayersFromCanvas();
          pushHistory();
        });
        fCanvas.on('object:moving', syncLayersFromCanvas);
        fCanvas.on('object:scaling', syncLayersFromCanvas);
        fCanvas.on('object:rotating', syncLayersFromCanvas);

        applyZoom();
        pushHistory();
      }

      function onSelectionChanged() {
        var active = fCanvas.getActiveObject();
        if (active && active._layerId) {
          selectedLayerId.value = active._layerId;
        } else {
          selectedLayerId.value = null;
        }
        syncLayersFromCanvas();
      }

      // Sync fabric objects to layers panel
      function syncLayersFromCanvas() {
        if (!fCanvas) return;
        var objects = fCanvas.getObjects();
        layers.length = 0;
        for (var i = 0; i < objects.length; i++) {
          var obj = objects[i];
          if (!obj._layerId) continue;
          layers.push(buildLayerEntry(obj));
        }
      }

      function buildLayerEntry(obj) {
        var base = {
          id: obj._layerId,
          type: obj._layerType || 'unknown',
          name: obj._layerName || ('Layer ' + obj._layerId),
          x: Math.round(obj.left || 0),
          y: Math.round(obj.top || 0),
          w: Math.round((obj.width || 0) * (obj.scaleX || 1)),
          h: Math.round((obj.height || 0) * (obj.scaleY || 1)),
          rotation: Math.round((obj.angle || 0) * 10) / 10,
          opacity: obj.opacity != null ? obj.opacity : 1,
          visible: obj.visible !== false,
          locked: !!obj.lockMovementX,
        };

        if (obj._layerType === 'text') {
          base.text = obj.text || '';
          base.fontFamily = obj.fontFamily || 'Arial';
          base.fontSize = obj.fontSize || 36;
          base.fontColor = obj.fill || '#ffffff';
          base.bold = obj.fontWeight === 'bold';
          base.italic = obj.fontStyle === 'italic';
          base.underline = !!obj.underline;
          base.textAlign = obj.textAlign || 'center';
          base.lineHeight = obj.lineHeight || 1.3;
          base.strokeColor = obj.stroke || '#000000';
          base.strokeWidth = obj.strokeWidth || 0;
          base.shadowColor = obj.shadow ? obj.shadow.color : '#000000';
          base.shadowBlur = obj.shadow ? obj.shadow.blur : 0;
        } else if (obj._layerType === 'image') {
          base.flipH = !!obj.flipX;
          base.flipV = !!obj.flipY;
          base.borderWidth = obj.strokeWidth || 0;
          base.borderColor = obj.stroke || '#ffffff';
        }
        return base;
      }

      function findFabricObj(layerId) {
        if (!fCanvas) return null;
        var objects = fCanvas.getObjects();
        for (var i = 0; i < objects.length; i++) {
          if (objects[i]._layerId === layerId) return objects[i];
        }
        return null;
      }

      // SIZE PRESETS
      function onSizePresetChange() {
        var p = sizePresets.find(function(s) { return s.label === sizePreset.value; });
        if (p) {
          canvasW.value = p.w;
          canvasH.value = p.h;
          applyCanvasSize();
        }
      }

      function onCanvasSizeChange() {
        sizePreset.value = '';
        applyCanvasSize();
      }

      function applyCanvasSize() {
        if (!fCanvas) return;
        fCanvas.setWidth(canvasW.value * zoom.value);
        fCanvas.setHeight(canvasH.value * zoom.value);
        fCanvas.setZoom(zoom.value);
        fCanvas.renderAll();
      }

      function onBgColorChange() {
        if (!fCanvas) return;
        fCanvas.setBackgroundColor(bgColor.value, function() { fCanvas.renderAll(); });
      }

      // ZOOM
      function applyZoom() {
        if (!fCanvas) return;
        fCanvas.setZoom(zoom.value);
        fCanvas.setWidth(canvasW.value * zoom.value);
        fCanvas.setHeight(canvasH.value * zoom.value);
        fCanvas.renderAll();
      }

      function zoomIn() { zoom.value = Math.min(2, Math.round((zoom.value + 0.1) * 100) / 100); applyZoom(); }
      function zoomOut() { zoom.value = Math.max(0.1, Math.round((zoom.value - 0.1) * 100) / 100); applyZoom(); }
      function resetZoom() { zoom.value = 1; applyZoom(); }
      function onZoomRange(val) { zoom.value = Math.max(0.1, Math.min(2, parseInt(val) / 100)); applyZoom(); }

      // ADD TEXT
      function addText() {
        if (!fCanvas) return;
        var id = ++layerIdCounter;
        var text = new fabric.IText('Banner Text', {
          left: Math.round(canvasW.value / 2 - 100),
          top: Math.round(canvasH.value / 2 - 30),
          fontFamily: 'Arial',
          fontSize: 36,
          fill: '#ffffff',
          textAlign: 'center',
          lineHeight: 1.3,
          stroke: null,
          strokeWidth: 0,
          shadow: null,
          underline: false,
        });
        text._layerId = id;
        text._layerType = 'text';
        text._layerName = 'Text ' + id;

        fCanvas.add(text);
        fCanvas.setActiveObject(text);
        fCanvas.renderAll();
        syncLayersFromCanvas();
        pushHistory();
      }

      // ADD IMAGE (local)
      function addImageFromClient() {
        if (localFileInput.value) localFileInput.value.click();
      }

      function onLocalImageSelected(e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) { loadImageToCanvas(ev.target.result, file.name); };
        reader.readAsDataURL(file);
        e.target.value = '';
      }

      // ADD IMAGE (server)
      async function addImageFromServer() {
        if (!window.FileDialog) return;
        var result = await window.FileDialog.open({
          title: 'Open Image',
          filters: [
            { label: 'Images', extensions: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp'] }
          ]
        });
        if (!result) return;
        try {
          var r = await fetch('/api/fs/read-binary?path=' + encodeURIComponent(result.path), {
            headers: { 'Authorization': 'Bearer ' + getToken() }
          });
          if (!r.ok) return;
          var data = await r.json();
          var ext = (result.name.match(/\.([^.]+)$/) || ['', 'png'])[1].toLowerCase();
          var mimeMap = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', bmp: 'image/bmp' };
          var mime = mimeMap[ext] || 'image/png';
          var dataUrl = 'data:' + mime + ';base64,' + data.content;
          loadImageToCanvas(dataUrl, result.name);
        } catch (e) {
          console.error('Failed to load server image:', e);
        }
      }

      function loadImageToCanvas(dataUrl, name) {
        if (!fCanvas) return;
        var imgEl = new Image();
        imgEl.onload = function() {
          var fabricImg = new fabric.Image(imgEl, {});
          var id = ++layerIdCounter;
          var maxW = canvasW.value * 0.8;
          var maxH = canvasH.value * 0.8;
          var iw = fabricImg.width;
          var ih = fabricImg.height;
          if (iw > maxW || ih > maxH) {
            var scale = Math.min(maxW / iw, maxH / ih);
            fabricImg.scaleToWidth(Math.round(iw * scale));
          }
          fabricImg.set({
            left: Math.round((canvasW.value - fabricImg.getScaledWidth()) / 2),
            top: Math.round((canvasH.value - fabricImg.getScaledHeight()) / 2),
          });
          fabricImg._layerId = id;
          fabricImg._layerType = 'image';
          fabricImg._layerName = name || ('Image ' + id);

          fCanvas.add(fabricImg);
          fCanvas.setActiveObject(fabricImg);
          fCanvas.renderAll();
          syncLayersFromCanvas();
          pushHistory();
        };
        imgEl.onerror = function() { console.error('Failed to load image:', name); };
        imgEl.src = dataUrl;
      }

      // LAYER MANAGEMENT
      function selectLayer(id) {
        var obj = findFabricObj(id);
        if (obj && fCanvas) {
          fCanvas.setActiveObject(obj);
          fCanvas.renderAll();
          selectedLayerId.value = id;
          syncLayersFromCanvas();
        }
      }

      function deleteLayer() {
        if (!fCanvas || !selectedLayerId.value) return;
        var obj = findFabricObj(selectedLayerId.value);
        if (obj) {
          fCanvas.remove(obj);
          fCanvas.discardActiveObject();
          fCanvas.renderAll();
          selectedLayerId.value = null;
          syncLayersFromCanvas();
          pushHistory();
        }
      }

      function moveLayerUp() {
        if (!fCanvas || !selectedLayerId.value) return;
        var obj = findFabricObj(selectedLayerId.value);
        if (!obj) return;
        var idx = fCanvas.getObjects().indexOf(obj);
        if (idx < fCanvas.getObjects().length - 1) {
          fCanvas.moveTo(obj, idx + 1);
          fCanvas.renderAll();
          syncLayersFromCanvas();
        }
      }

      function moveLayerDown() {
        if (!fCanvas || !selectedLayerId.value) return;
        var obj = findFabricObj(selectedLayerId.value);
        if (!obj) return;
        var idx = fCanvas.getObjects().indexOf(obj);
        if (idx > 0) {
          fCanvas.moveTo(obj, idx - 1);
          fCanvas.renderAll();
          syncLayersFromCanvas();
        }
      }

      function toggleLayerVisibility(id) {
        var obj = findFabricObj(id);
        if (obj && fCanvas) {
          obj.set('visible', !obj.visible);
          fCanvas.renderAll();
          syncLayersFromCanvas();
        }
      }

      // DUPLICATE
      function duplicateLayer() {
        if (!fCanvas || !selectedLayerId.value) return;
        var obj = findFabricObj(selectedLayerId.value);
        if (!obj) return;
        obj.clone(function(cloned) {
          var id = ++layerIdCounter;
          cloned._layerId = id;
          cloned._layerType = obj._layerType;
          cloned._layerName = (obj._layerName || 'Layer') + ' Copy';
          cloned.set({ left: (obj.left || 0) + 20, top: (obj.top || 0) + 20 });
          fCanvas.add(cloned);
          fCanvas.setActiveObject(cloned);
          fCanvas.renderAll();
          syncLayersFromCanvas();
          pushHistory();
        });
      }

      // GROUP / UNGROUP
      function groupSelected() {
        if (!fCanvas) return;
        var active = fCanvas.getActiveObject();
        if (!active || active.type !== 'activeSelection') return;
        var group = active.toGroup();
        var id = ++layerIdCounter;
        group._layerId = id;
        group._layerType = 'group';
        group._layerName = 'Group ' + id;
        fCanvas.renderAll();
        syncLayersFromCanvas();
        pushHistory();
      }

      function ungroupSelected() {
        if (!fCanvas) return;
        var active = fCanvas.getActiveObject();
        if (!active || active.type !== 'group') return;
        active.toActiveSelection();
        fCanvas.renderAll();
        syncLayersFromCanvas();
        pushHistory();
      }

      // ALIGN
      function alignSelected(how) {
        if (!fCanvas || !selectedLayerId.value) return;
        var obj = findFabricObj(selectedLayerId.value);
        if (!obj) return;
        var ow = obj.getScaledWidth();
        var oh = obj.getScaledHeight();
        switch (how) {
          case 'left': obj.set('left', 0); break;
          case 'center-h': obj.set('left', (canvasW.value - ow) / 2); break;
          case 'right': obj.set('left', canvasW.value - ow); break;
          case 'top': obj.set('top', 0); break;
          case 'center-v': obj.set('top', (canvasH.value - oh) / 2); break;
          case 'bottom': obj.set('top', canvasH.value - oh); break;
        }
        obj.setCoords();
        fCanvas.renderAll();
        syncLayersFromCanvas();
        pushHistory();
      }

      // PROPERTY UPDATES
      function updateProp(prop, val) {
        if (!fCanvas || !selectedLayerId.value) return;
        var obj = findFabricObj(selectedLayerId.value);
        if (!obj) return;

        switch (prop) {
          case 'x': obj.set('left', val); break;
          case 'y': obj.set('top', val); break;
          case 'w':
            if (obj._layerType === 'text') obj.set('width', val);
            else obj.set('scaleX', val / (obj.width || 1));
            break;
          case 'h':
            if (obj._layerType === 'text') obj.set('height', val);
            else obj.set('scaleY', val / (obj.height || 1));
            break;
          case 'rotation': obj.set('angle', val); break;
          case 'opacity': obj.set('opacity', val); break;
          case 'text': obj.set('text', val); break;
          case 'fontFamily':
            obj.set('fontFamily', val);
            document.fonts.ready.then(function() { if (fCanvas) fCanvas.renderAll(); });
            break;
          case 'fontSize': obj.set('fontSize', val); break;
          case 'fontColor': obj.set('fill', val); break;
          case 'bold': obj.set('fontWeight', val ? 'bold' : 'normal'); break;
          case 'italic': obj.set('fontStyle', val ? 'italic' : 'normal'); break;
          case 'underline': obj.set('underline', val); break;
          case 'textAlign': obj.set('textAlign', val); break;
          case 'lineHeight': obj.set('lineHeight', val); break;
          case 'strokeColor': obj.set('stroke', val); break;
          case 'strokeWidth': obj.set('strokeWidth', val); break;
          case 'shadowColor': {
            var s = obj.shadow || new fabric.Shadow({ color: '#000', blur: 0, offsetX: 2, offsetY: 2 });
            s.color = val;
            obj.set('shadow', s);
            break;
          }
          case 'shadowBlur': {
            var s2 = obj.shadow || new fabric.Shadow({ color: '#000', blur: 0, offsetX: 2, offsetY: 2 });
            s2.blur = val;
            obj.set('shadow', val > 0 ? s2 : null);
            break;
          }
          case 'flipH': obj.set('flipX', val); break;
          case 'flipV': obj.set('flipY', val); break;
          case 'borderWidth': obj.set('strokeWidth', val); obj.set('stroke', val > 0 ? (obj.stroke || '#ffffff') : null); break;
          case 'borderColor': obj.set('stroke', val); break;
        }
        obj.setCoords();
        fCanvas.renderAll();
        syncLayersFromCanvas();
      }

      function updatePropAndHistory(prop, val) {
        updateProp(prop, val);
        pushHistory();
      }

      // FONT PICKER
      async function pickFont() {
        if (!selectedLayer.value || selectedLayer.value.type !== 'text') return;
        if (!window.FontSelectDialog) return;
        var result = await window.FontSelectDialog.show({
          title: 'Select Font',
          selectedFont: selectedLayer.value.fontFamily,
          sampleText: selectedLayer.value.text || 'Banner Text',
        });
        if (result) {
          updatePropAndHistory('fontFamily', result.family);
        }
      }

      // IMAGE FILTERS
      function applyFilter(filterType) {
        if (!fCanvas || !selectedLayerId.value) return;
        var obj = findFabricObj(selectedLayerId.value);
        if (!obj || obj._layerType !== 'image') return;
        obj.filters = obj.filters || [];
        switch (filterType) {
          case 'grayscale': obj.filters.push(new fabric.Image.filters.Grayscale()); break;
          case 'sepia': obj.filters.push(new fabric.Image.filters.Sepia()); break;
          case 'invert': obj.filters.push(new fabric.Image.filters.Invert()); break;
          case 'blur': obj.filters.push(new fabric.Image.filters.Blur({ blur: 0.2 })); break;
          case 'brightness': obj.filters.push(new fabric.Image.filters.Brightness({ brightness: 0.1 })); break;
          case 'contrast': obj.filters.push(new fabric.Image.filters.Contrast({ contrast: 0.2 })); break;
          case 'clear': obj.filters = []; break;
        }
        obj.applyFilters();
        fCanvas.renderAll();
        pushHistory();
      }

      // GRADIENT
      var gradColor1 = ref('#ff0000');
      var gradColor2 = ref('#0000ff');
      var gradDirection = ref('horizontal');

      function applyGradientFromPanel() {
        if (!fCanvas || !selectedLayerId.value) return;
        var obj = findFabricObj(selectedLayerId.value);
        if (!obj) return;
        var coords = gradDirection.value === 'horizontal'
          ? { x1: 0, y1: 0, x2: obj.width, y2: 0 }
          : { x1: 0, y1: 0, x2: 0, y2: obj.height };
        var gradient = new fabric.Gradient({
          type: 'linear',
          coords: coords,
          colorStops: [
            { offset: 0, color: gradColor1.value },
            { offset: 1, color: gradColor2.value },
          ]
        });
        obj.set('fill', gradient);
        fCanvas.renderAll();
        syncLayersFromCanvas();
        pushHistory();
      }

      // BRING FRONT / SEND BACK
      function bringToFront() {
        if (!fCanvas || !selectedLayerId.value) return;
        var obj = findFabricObj(selectedLayerId.value);
        if (obj) { fCanvas.bringToFront(obj); fCanvas.renderAll(); syncLayersFromCanvas(); }
      }

      function sendToBack() {
        if (!fCanvas || !selectedLayerId.value) return;
        var obj = findFabricObj(selectedLayerId.value);
        if (obj) { fCanvas.sendToBack(obj); fCanvas.renderAll(); syncLayersFromCanvas(); }
      }

      // LOCK / UNLOCK
      function toggleLock() {
        if (!fCanvas || !selectedLayerId.value) return;
        var obj = findFabricObj(selectedLayerId.value);
        if (!obj) return;
        var locked = !obj.lockMovementX;
        obj.set({
          lockMovementX: locked, lockMovementY: locked,
          lockScalingX: locked, lockScalingY: locked,
          lockRotation: locked, hasControls: !locked, selectable: true,
        });
        fCanvas.renderAll();
        syncLayersFromCanvas();
      }

      // HISTORY
      function getSnapshot() {
        if (!fCanvas) return '{}';
        var json = fCanvas.toJSON(['_layerId', '_layerType', '_layerName']);
        json._canvasW = canvasW.value;
        json._canvasH = canvasH.value;
        return JSON.stringify(json);
      }

      function pushHistory() {
        if (historyPaused) return;
        var snap = getSnapshot();
        if (historyIdx.value < history.value.length - 1) {
          history.value = history.value.slice(0, historyIdx.value + 1);
        }
        history.value.push(snap);
        if (history.value.length > MAX_HISTORY) history.value.shift();
        historyIdx.value = history.value.length - 1;
      }

      function restoreSnapshot(snap) {
        if (!fCanvas) return;
        historyPaused = true;
        var data = JSON.parse(snap);
        if (data._canvasW) canvasW.value = data._canvasW;
        if (data._canvasH) canvasH.value = data._canvasH;

        fCanvas.loadFromJSON(data, function() {
          var objects = fCanvas.getObjects();
          var maxId = layerIdCounter;
          for (var i = 0; i < objects.length; i++) {
            if (objects[i]._layerId && objects[i]._layerId > maxId) maxId = objects[i]._layerId;
          }
          layerIdCounter = maxId;
          applyZoom();
          fCanvas.renderAll();
          syncLayersFromCanvas();
          historyPaused = false;
        });
      }

      function undo() {
        if (historyIdx.value <= 0) return;
        historyIdx.value--;
        restoreSnapshot(history.value[historyIdx.value]);
      }

      function redo() {
        if (historyIdx.value >= history.value.length - 1) return;
        historyIdx.value++;
        restoreSnapshot(history.value[historyIdx.value]);
      }

      // EXPORT
      function doExport(format) {
        if (!fCanvas) return;
        fCanvas.discardActiveObject();
        fCanvas.renderAll();

        var prevZoom = zoom.value;
        fCanvas.setZoom(1);
        fCanvas.setWidth(canvasW.value);
        fCanvas.setHeight(canvasH.value);
        fCanvas.renderAll();

        var dataUrl = fCanvas.toDataURL({
          format: format === 'jpg' ? 'jpeg' : 'png',
          quality: format === 'jpg' ? 0.92 : 1,
          multiplier: 1,
        });

        var a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'banner-' + Date.now() + '.' + format;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        fCanvas.setZoom(prevZoom);
        fCanvas.setWidth(canvasW.value * prevZoom);
        fCanvas.setHeight(canvasH.value * prevZoom);
        fCanvas.renderAll();
      }

      function exportPNG() { doExport('png'); }
      function exportJPG() { doExport('jpg'); }

      function exportSVG() {
        if (!fCanvas) return;
        fCanvas.discardActiveObject();
        fCanvas.renderAll();
        var svg = fCanvas.toSVG();
        var blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'banner-' + Date.now() + '.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      // KEYBOARD SHORTCUTS
      function onKeyDown(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') { e.preventDefault(); duplicateLayer(); }
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (selectedLayerId.value && fCanvas) {
            var active = fCanvas.getActiveObject();
            if (active && active.isEditing) return;
            e.preventDefault();
            deleteLayer();
          }
        }
      }

      // LIFECYCLE
      onMounted(async function() {
        try {
          await loadFabricJs();
          fabricReady.value = true;
          // First set loading=false so the canvas element renders into the DOM
          loading.value = false;
          // Wait for Vue to flush the DOM update
          await nextTick();
          // Now the canvas ref is available
          initFabricCanvas();
        } catch (e) {
          console.error('Failed to load Fabric.js:', e);
          loading.value = false;
        }
        window.addEventListener('keydown', onKeyDown);
      });

      onUnmounted(function() {
        window.removeEventListener('keydown', onKeyDown);
        if (fCanvas) { fCanvas.dispose(); fCanvas = null; }
      });

      return {
        fabricCanvasEl: fabricCanvasEl,
        canvasArea: canvasArea,
        localFileInput: localFileInput,
        canvasW: canvasW,
        canvasH: canvasH,
        bgColor: bgColor,
        sizePreset: sizePreset,
        sizePresets: sizePresets,
        fabricReady: fabricReady,
        loading: loading,
        onSizePresetChange: onSizePresetChange,
        onCanvasSizeChange: onCanvasSizeChange,
        onBgColorChange: onBgColorChange,
        zoom: zoom,
        zoomIn: zoomIn,
        zoomOut: zoomOut,
        resetZoom: resetZoom,
        onZoomRange: onZoomRange,
        layers: layers,
        selectedLayerId: selectedLayerId,
        selectedLayer: selectedLayer,
        reversedLayers: reversedLayers,
        addText: addText,
        selectLayer: selectLayer,
        deleteLayer: deleteLayer,
        moveLayerUp: moveLayerUp,
        moveLayerDown: moveLayerDown,
        toggleLayerVisibility: toggleLayerVisibility,
        duplicateLayer: duplicateLayer,
        groupSelected: groupSelected,
        ungroupSelected: ungroupSelected,
        alignSelected: alignSelected,
        updateProp: updateProp,
        updatePropAndHistory: updatePropAndHistory,
        pickFont: pickFont,
        addImageFromClient: addImageFromClient,
        addImageFromServer: addImageFromServer,
        onLocalImageSelected: onLocalImageSelected,
        applyFilter: applyFilter,
        gradColor1: gradColor1,
        gradColor2: gradColor2,
        gradDirection: gradDirection,
        applyGradientFromPanel: applyGradientFromPanel,
        bringToFront: bringToFront,
        sendToBack: sendToBack,
        toggleLock: toggleLock,
        history: history,
        historyIdx: historyIdx,
        undo: undo,
        redo: redo,
        exportPNG: exportPNG,
        exportJPG: exportJPG,
        exportSVG: exportSVG,
      };
    }
  };
})(Vue);