(function(Vue) {
  const { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } = Vue;

  return {
    setup() {
      // ─── Refs ───
      const textInput = ref(null);
      const imageUrl = ref('');

      // ─── Text input ───
      const inputText = ref('');
      const inputMode = ref('text'); // text | frequency

      // ─── Settings ───
      const fontFamily = ref('Arial');
      const minFontSize = ref(14);
      const maxFontSize = ref(80);
      const wordPadding = ref(3);
      const rotation = ref('mixed'); // none | horizontal | vertical | mixed | random
      const caseMode = ref('original');  // original | upper | lower | capitalize
      const shape = ref('rectangle'); // rectangle | circle | diamond | triangle | star
      const bgColor = ref('#1a1a2e');
      const maxWords = ref(200);
      const spiral = ref('archimedean'); // archimedean | rectangular
      const weightFn = ref('linear'); // linear | sqrt | log

      // ─── Color palettes ───
      const palettes = [
        { name: 'Ocean', colors: ['#06b6d4','#0ea5e9','#3b82f6','#6366f1','#8b5cf6'] },
        { name: 'Sunset', colors: ['#f97316','#ef4444','#ec4899','#f59e0b','#eab308'] },
        { name: 'Forest', colors: ['#22c55e','#16a34a','#15803d','#84cc16','#a3e635'] },
        { name: 'Neon', colors: ['#f0abfc','#a78bfa','#67e8f9','#34d399','#fbbf24'] },
        { name: 'Pastel', colors: ['#fca5a5','#fdba74','#fde68a','#86efac','#93c5fd'] },
        { name: 'Monochrome', colors: ['#e2e8f0','#cbd5e1','#94a3b8','#64748b','#475569'] },
        { name: 'Fire', colors: ['#ff0000','#ff4500','#ff6600','#ff8c00','#ffd700'] },
        { name: 'Candy', colors: ['#ff6b9d','#c44dff','#4deeea','#ffe66d','#74ee15'] },
        { name: 'Earth', colors: ['#a0522d','#cd853f','#deb887','#8fbc8f','#556b2f'] },
      ];
      const selectedPalette = ref(0);
      const customColors = ref(['#06b6d4','#3b82f6','#8b5cf6','#ec4899','#f59e0b']);

      const currentColors = computed(() => {
        if (selectedPalette.value === -1) return customColors.value;
        return palettes[selectedPalette.value]?.colors || palettes[0].colors;
      });

      const useStopWords = ref(true);

      // ─── State ───
      const words = ref([]);
      const generating = ref(false);
      const generated = ref(false);

      // ─── Canvas size ───
      const canvasW = ref(800);
      const canvasH = ref(500);

      // ─── GENERATE WORD CLOUD (backend) ───
      async function generate() {
        if (!inputText.value.trim()) return;

        generating.value = true;
        await nextTick();

        try {
          const response = await fetch('/api/wordcloud/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: inputText.value,
              inputMode: inputMode.value,
              fontFamily: fontFamily.value,
              minFontSize: minFontSize.value,
              maxFontSize: maxFontSize.value,
              wordPadding: wordPadding.value,
              rotation: rotation.value,
              caseMode: caseMode.value,
              shape: shape.value,
              bgColor: bgColor.value,
              maxWords: maxWords.value,
              spiral: spiral.value,
              weightFn: weightFn.value,
              colors: currentColors.value,
              canvasWidth: canvasW.value,
              canvasHeight: canvasH.value,
              useStopWords: useStopWords.value
            })
          });

          if (!response.ok) throw new Error('API error: ' + response.status);
          const data = await response.json();

          if (!data.image) {
            console.warn('[WordCloud] No words could be placed');
            generating.value = false;
            return;
          }

          // Store placed words for SVG export, set image URL for display
          words.value = data.words || [];
          imageUrl.value = data.image;
          generated.value = true;
        } catch (e) {
          console.error('[WordCloud] generate error:', e);
        } finally {
          generating.value = false;
        }
      }

      // ─── Export ───
      function exportPNG() {
        if (!imageUrl.value) return;
        const a = document.createElement('a');
        a.download = 'wordcloud.png';
        a.href = imageUrl.value;
        a.click();
      }

      async function exportJPG() {
        try {
          const url = await getJPGDataUrl();
          if (!url) return;
          const a = document.createElement('a');
          a.download = 'wordcloud.jpg';
          a.href = url;
          a.click();
        } catch (e) { console.error(e); }
      }

      function exportSVG() {
        const svg = buildSVGString();
        if (!svg) return;
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const a = document.createElement('a');
        a.download = 'wordcloud.svg';
        a.href = URL.createObjectURL(blob);
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      }

      // ─── Copy to clipboard ───
      async function copyToClipboard() {
        if (!imageUrl.value) return;
        try {
          const resp = await fetch(imageUrl.value);
          const blob = await resp.blob();
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        } catch (e) { console.error(e); }
      }

      // ─── Clear canvas ───
      function clearCanvas() {
        imageUrl.value = '';
        words.value = [];
        generated.value = false;
      }

      // ─── Save / Load ───
      const savedList = ref([]);
      const showSaveDialog = ref(false);
      const showLoadDialog = ref(false);
      const saveName = ref('');
      const saveFormat = ref('png');
      const saving = ref(false);

      function getConfig() {
        return {
          inputText: inputText.value,
          inputMode: inputMode.value,
          fontFamily: fontFamily.value,
          minFontSize: minFontSize.value,
          maxFontSize: maxFontSize.value,
          wordPadding: wordPadding.value,
          rotation: rotation.value,
          caseMode: caseMode.value,
          shape: shape.value,
          bgColor: bgColor.value,
          maxWords: maxWords.value,
          spiral: spiral.value,
          weightFn: weightFn.value,
          selectedPalette: selectedPalette.value,
          customColors: customColors.value.slice(),
          useStopWords: useStopWords.value,
          canvasW: canvasW.value,
          canvasH: canvasH.value
        };
      }

      function applyConfig(cfg) {
        if (!cfg) return;
        if (cfg.inputText !== undefined) inputText.value = cfg.inputText;
        if (cfg.inputMode) inputMode.value = cfg.inputMode;
        if (cfg.fontFamily) fontFamily.value = cfg.fontFamily;
        if (cfg.minFontSize) minFontSize.value = cfg.minFontSize;
        if (cfg.maxFontSize) maxFontSize.value = cfg.maxFontSize;
        if (cfg.wordPadding !== undefined) wordPadding.value = cfg.wordPadding;
        if (cfg.rotation) rotation.value = cfg.rotation;
        if (cfg.caseMode) caseMode.value = cfg.caseMode;
        if (cfg.shape) shape.value = cfg.shape;
        if (cfg.bgColor) bgColor.value = cfg.bgColor;
        if (cfg.maxWords) maxWords.value = cfg.maxWords;
        if (cfg.spiral) spiral.value = cfg.spiral;
        if (cfg.weightFn) weightFn.value = cfg.weightFn;
        if (cfg.selectedPalette !== undefined) selectedPalette.value = cfg.selectedPalette;
        if (cfg.customColors) customColors.value = cfg.customColors;
        if (cfg.useStopWords !== undefined) useStopWords.value = cfg.useStopWords;
        if (cfg.canvasW) canvasW.value = cfg.canvasW;
        if (cfg.canvasH) canvasH.value = cfg.canvasH;
      }

      function buildSVGString() {
        if (words.value.length === 0) return null;
        const W = canvasW.value, H = canvasH.value;
        const font = fontFamily.value;
        let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">';
        svg += '<rect width="100%" height="100%" fill="' + bgColor.value + '"/>';
        for (const w of words.value) {
          const tx = w.angle !== 0 ? w.x + w.bw / 2 : w.x + 2;
          const ty = w.angle !== 0 ? w.y + w.bh / 2 : w.y + w.fontSize + 2;
          const transform = w.angle !== 0 ? ' transform="rotate(' + w.angle + ' ' + tx + ' ' + ty + ')"' : '';
          const safeText = w.text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
          svg += '<text x="' + tx + '" y="' + ty + '" font-size="' + w.fontSize + '" font-family="\'' + font + '\', sans-serif" fill="' + w.color + '"' + transform + '>' + safeText + '</text>';
        }
        svg += '</svg>';
        return svg;
      }

      async function getJPGDataUrl() {
        if (!imageUrl.value) return null;
        const img = new Image();
        img.src = imageUrl.value;
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
        const c = document.createElement('canvas');
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        const ctx = c.getContext('2d');
        ctx.fillStyle = bgColor.value;
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0);
        return c.toDataURL('image/jpeg', 0.92);
      }

      async function saveToServer() {
        if (!saveName.value.trim() || !generated.value) return;
        saving.value = true;
        try {
          let imageData = null;
          const fmt = saveFormat.value;
          if (fmt === 'svg') {
            imageData = buildSVGString();
          } else if (fmt === 'jpg') {
            imageData = await getJPGDataUrl();
          } else {
            imageData = imageUrl.value;
          }
          const resp = await fetch('/api/wordcloud/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: saveName.value.trim(),
              config: getConfig(),
              words: words.value,
              image: imageData,
              format: fmt
            })
          });
          if (!resp.ok) throw new Error('Save failed');
          const data = await resp.json();
          showSaveDialog.value = false;
          saveName.value = '';
          if (window.ElementPlus) window.ElementPlus.ElMessage.success('Kaydedildi: ' + data.savedFiles.join(', '));
        } catch (e) {
          console.error('[WordCloud] save error:', e);
          if (window.ElementPlus) window.ElementPlus.ElMessage.error('Kaydetme hatası');
        } finally {
          saving.value = false;
        }
      }

      async function loadSavedList() {
        try {
          const resp = await fetch('/api/wordcloud/list');
          if (!resp.ok) throw new Error('List failed');
          savedList.value = await resp.json();
          showLoadDialog.value = true;
        } catch (e) {
          console.error('[WordCloud] list error:', e);
          if (window.ElementPlus) window.ElementPlus.ElMessage.error('Liste yüklenemedi');
        }
      }

      async function loadFromServer(id) {
        try {
          const resp = await fetch('/api/wordcloud/load/' + encodeURIComponent(id));
          if (!resp.ok) throw new Error('Load failed');
          const data = await resp.json();
          applyConfig(data.config);
          if (data.words && data.words.length > 0) {
            words.value = data.words;
          }
          showLoadDialog.value = false;
          if (window.ElementPlus) window.ElementPlus.ElMessage.success('"' + data.name + '" yüklendi');
          await nextTick();
          generate();
        } catch (e) {
          console.error('[WordCloud] load error:', e);
          if (window.ElementPlus) window.ElementPlus.ElMessage.error('Yükleme hatası');
        }
      }

      async function deleteFromServer(id) {
        try {
          await fetch('/api/wordcloud/delete/' + encodeURIComponent(id), { method: 'DELETE' });
          savedList.value = savedList.value.filter(s => s.id !== id);
        } catch (e) { console.error(e); }
      }

      function exportJSON() {
        if (!generated.value) return;
        const json = JSON.stringify({ name: 'wordcloud', config: getConfig(), words: words.value }, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const a = document.createElement('a');
        a.download = 'wordcloud.json';
        a.href = URL.createObjectURL(blob);
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      }

      function onCanvasSizeChange() {
        nextTick(() => {
          if (generated.value) generate();
        });
      }

      // ─── Font select dialog ───
      async function pickFont() {
        if (window.FontSelectDialog) {
          const result = await window.FontSelectDialog.show({ title: '\uD83D\uDD24 Font Se\u00E7in', selectedFont: fontFamily.value });
          if (result) fontFamily.value = result.family;
        }
      }

      // ─── Custom color editing ───
      function addCustomColor() {
        if (customColors.value.length < 12) {
          const hue = Math.round(Math.random() * 360);
          customColors.value.push('hsl(' + hue + ', 70%, 60%)');
        }
      }
      function removeCustomColor(idx) {
        if (customColors.value.length > 2) customColors.value.splice(idx, 1);
      }
      function onCustomColorChange(idx, e) {
        customColors.value[idx] = e.target.value;
      }

      // ─── Sample text ───
      function loadSample() {
        inputText.value =
          'JavaScript Python TypeScript React Vue Angular Node Express MongoDB PostgreSQL Docker Kubernetes ' +
          'Cloud Computing Development Frontend Backend API REST GraphQL Machine Learning AI Data Science ' +
          'Algorithm Design Pattern Architecture Software Engineering Web Mobile Application Framework Library ' +
          'Component Module Package Function Variable Class Object Interface Database Server Client Browser ' +
          'HTML CSS SCSS Tailwind Bootstrap Material Responsive Animation Performance Security Testing Debug ' +
          'Deploy Container Microservice Serverless Lambda Function Edge Computing DevOps CI CD Pipeline Git ' +
          'Version Control Repository Branch Merge Commit Push Pull Request Review Code Quality Agile Scrum ' +
          'Sprint Kanban Workflow Automation Integration Delivery Monitoring Logging Tracing Observability ' +
          'Scalability Reliability Availability Consistency Partition Tolerance Distributed System Network ' +
          'Protocol HTTP WebSocket TCP UDP DNS Load Balancer Proxy Cache CDN Storage Compute Memory CPU GPU';
      }

      // Watch canvas size — clear image when size changes
      watch([canvasW, canvasH], () => {
        imageUrl.value = '';
        generated.value = false;
        words.value = [];
      });

      return {
        textInput, imageUrl,
        inputText, inputMode,
        fontFamily, minFontSize, maxFontSize, wordPadding,
        rotation, caseMode, shape, bgColor, maxWords, spiral, weightFn,
        palettes, selectedPalette, customColors, currentColors,
        useStopWords,
        words, generating, generated,
        canvasW, canvasH,
        generate, clearCanvas, loadSample, pickFont,
        exportPNG, exportJPG, exportSVG, exportJSON, copyToClipboard,
        onCanvasSizeChange,
        addCustomColor, removeCustomColor, onCustomColorChange,
        savedList, showSaveDialog, showLoadDialog,
        saveName, saveFormat, saving,
        saveToServer, loadSavedList, loadFromServer, deleteFromServer
      };
    }
  };
})(Vue);
