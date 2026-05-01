(function(Vue) {
  const { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } = Vue;

  return {
    setup() {
      /* ─── refs ─── */
      const previewCanvas = ref(null);
      const captureCanvas = ref(null);

      /* ─── text state ─── */
      const text = ref('3D Text');
      const fontFamily = ref('Arial');
      const fontSize = ref(72);
      const textColor = ref('#ffcc00');
      const bgColor = ref('#1a1a2e');
      const canvasW = ref(800);
      const canvasH = ref(400);
      const textAlign = ref('center');
      const bold = ref(true);
      const italic = ref(false);

      /* ─── 3-D effect ─── */
      const effect3d = ref('depth');
      const depthColor = ref('#996600');
      const depthLength = ref(8);
      const depthAngle = ref(135);
      const outlineColor = ref('#000000');
      const outlineWidth = ref(2);
      const shadowColor = ref('#000000');
      const shadowBlur = ref(10);
      const shadowOffX = ref(4);
      const shadowOffY = ref(4);
      const bevelLight = ref('#ffffff');
      const bevelDark = ref('#444444');
      const bevelSize = ref(3);
      const glossOpacity = ref(0.35);
      const neonGlow = ref('#ff00ff');
      const neonBlur = ref(20);
      const retroLayers = ref(5);
      const retroSpread = ref(3);
      const embossStrength = ref(3);

      const effects3dList = [
        { value: 'depth',    label: '🧱 Depth / Extrude' },
        { value: 'shadow',   label: '🌑 Drop Shadow'},
        { value: 'outline',  label: '✏️ Outline'},
        { value: 'bevel',    label: '🔲 Bevel'},
        { value: 'gloss',    label: '✨ Glossy'},
        { value: 'neon',     label: '💡 Neon Glow'},
        { value: 'retro',    label: '🎞️ Retro / Layered'},
        { value: 'emboss',   label: '🪨 Emboss'},
        { value: 'chrome',   label: '🪞 Chrome'},
        { value: 'gold',     label: '🥇 Gold'},
      ];

      /* ─── animation ─── */
      const animEnabled = ref(false);
      const animType = ref('none');
      const animDuration = ref(2);
      const loopAnim = ref(true);
      const animEasing = ref('ease');

      const animTypes = [
        { value: 'none',        label: '— None —' },
        { value: 'rotateY',     label: '🔄 Rotate Y (horizontal flip)' },
        { value: 'rotateX',     label: '🔃 Rotate X (vertical flip)' },
        { value: 'rotateZ',     label: '🌀 Rotate Z (spin)' },
        { value: 'fadeInOut',   label: '🌗 Fade In / Out' },
        { value: 'slideLeft',   label: '⬅️ Slide from Left' },
        { value: 'slideRight',  label: '➡️ Slide from Right' },
        { value: 'slideTop',    label: '⬆️ Slide from Top' },
        { value: 'slideBottom', label: '⬇️ Slide from Bottom' },
        { value: 'zoomIn',      label: '🔍 Zoom In' },
        { value: 'bounce',      label: '⚾ Bounce' },
        { value: 'typewriter',  label: '⌨️ Typewriter' },
        { value: 'wave',        label: '🌊 Wave' },
      ];

      const easings = ['linear','ease','ease-in','ease-out','ease-in-out'];

      /* ─── export state ─── */
      const exportFormat = ref('png');
      const exportFps = ref(15);
      const exporting = ref(false);
      const exportProgress = ref(0);

      /* ─── preview animation ─── */
      let animFrame = null;
      let animStart = 0;
      const isPlaying = ref(false);

      /* ─── helpers ─── */
      function getToken() { try { return localStorage.getItem('auth_token') || ''; } catch(e) { return ''; } }

      function hexToRgba(hex, a) {
        var r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
        return 'rgba('+r+','+g+','+b+','+a+')';
      }

      function easeValue(t, type) {
        if (type === 'ease-in') return t * t;
        if (type === 'ease-out') return t * (2 - t);
        if (type === 'ease-in-out') return t < .5 ? 2*t*t : -1+(4-2*t)*t;
        if (type === 'ease') return t < .5 ? 2*t*t : -1+(4-2*t)*t;
        return t; // linear
      }

      /* ─── 3D render core ─── */
      function render3DText(ctx, w, h, progress) {
        ctx.clearRect(0, 0, w, h);

        // BG
        ctx.fillStyle = bgColor.value;
        ctx.fillRect(0, 0, w, h);

        var txt = text.value || '3D';
        var fStyle = (italic.value ? 'italic ' : '') + (bold.value ? 'bold ' : '') + fontSize.value + 'px "' + fontFamily.value + '"';
        ctx.font = fStyle;
        ctx.textBaseline = 'middle';
        ctx.textAlign = textAlign.value;

        var tx = textAlign.value === 'center' ? w/2 : textAlign.value === 'right' ? w - 30 : 30;
        var ty = h / 2;

        // Apply animation transform
        var animP = progress != null ? progress : 1;
        var at = animType.value;

        ctx.save();
        ctx.translate(tx, ty);

        var drawAlpha = 1;
        var charProgress = null; // for typewriter
        var waveOffset = 0;

        if (animEnabled.value && at !== 'none' && animP < 1) {
          var ep = easeValue(animP, animEasing.value);

          if (at === 'rotateY') {
            // Simulate Y rotation with scaleX
            var scX = Math.cos(ep * Math.PI * 2);
            ctx.scale(scX, 1);
          } else if (at === 'rotateX') {
            var scY = Math.cos(ep * Math.PI * 2);
            ctx.scale(1, scY);
          } else if (at === 'rotateZ') {
            ctx.rotate(ep * Math.PI * 2);
          } else if (at === 'fadeInOut') {
            drawAlpha = Math.sin(ep * Math.PI);
          } else if (at === 'slideLeft') {
            var offX = (1 - ep) * (-w);
            ctx.translate(offX, 0);
          } else if (at === 'slideRight') {
            var offX2 = (1 - ep) * w;
            ctx.translate(offX2, 0);
          } else if (at === 'slideTop') {
            var offY = (1 - ep) * (-h);
            ctx.translate(0, offY);
          } else if (at === 'slideBottom') {
            var offY2 = (1 - ep) * h;
            ctx.translate(0, offY2);
          } else if (at === 'zoomIn') {
            var sc = ep;
            ctx.scale(sc, sc);
          } else if (at === 'bounce') {
            var bounceY = Math.abs(Math.sin(ep * Math.PI * 3)) * (1 - ep) * h * 0.3;
            ctx.translate(0, -bounceY);
          } else if (at === 'typewriter') {
            charProgress = Math.floor(ep * (txt.length + 1));
          } else if (at === 'wave') {
            waveOffset = ep * Math.PI * 4;
          }
        }

        ctx.globalAlpha = drawAlpha;

        var displayText = txt;
        if (charProgress != null) {
          displayText = txt.substring(0, charProgress);
        }

        var eff = effect3d.value;

        if (at === 'wave' && animEnabled.value && waveOffset !== 0) {
          // Wave: draw each character individually
          drawWaveText(ctx, displayText, fStyle, eff, waveOffset);
        } else {
          draw3DEffect(ctx, displayText, 0, 0, eff, fStyle);
        }

        ctx.globalAlpha = 1;
        ctx.restore();
      }

      function drawWaveText(ctx, txt, fStyle, eff, waveOff) {
        ctx.font = fStyle;
        var totalW = ctx.measureText(txt).width;
        var startX = -totalW / 2;
        for (var i = 0; i < txt.length; i++) {
          var ch = txt[i];
          var chW = ctx.measureText(ch).width;
          var yOff = Math.sin(waveOff + i * 0.5) * 15;
          ctx.save();
          ctx.translate(startX + chW / 2, yOff);
          draw3DEffect(ctx, ch, 0, 0, eff, fStyle);
          ctx.restore();
          startX += chW;
        }
      }

      function draw3DEffect(ctx, txt, x, y, eff, fStyle) {
        ctx.font = fStyle;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (eff === 'depth') {
          drawDepth(ctx, txt, x, y);
        } else if (eff === 'shadow') {
          drawDropShadow(ctx, txt, x, y);
        } else if (eff === 'outline') {
          drawOutline(ctx, txt, x, y);
        } else if (eff === 'bevel') {
          drawBevel(ctx, txt, x, y);
        } else if (eff === 'gloss') {
          drawGlossy(ctx, txt, x, y);
        } else if (eff === 'neon') {
          drawNeon(ctx, txt, x, y);
        } else if (eff === 'retro') {
          drawRetro(ctx, txt, x, y);
        } else if (eff === 'emboss') {
          drawEmboss(ctx, txt, x, y);
        } else if (eff === 'chrome') {
          drawChrome(ctx, txt, x, y);
        } else if (eff === 'gold') {
          drawGold(ctx, txt, x, y);
        } else {
          ctx.fillStyle = textColor.value;
          ctx.fillText(txt, x, y);
        }
      }

      function drawDepth(ctx, txt, x, y) {
        var len = depthLength.value;
        var ang = depthAngle.value * Math.PI / 180;
        var dx = Math.cos(ang);
        var dy = Math.sin(ang);
        ctx.fillStyle = depthColor.value;
        for (var i = len; i > 0; i--) {
          ctx.fillText(txt, x + dx * i, y + dy * i);
        }
        ctx.fillStyle = textColor.value;
        ctx.fillText(txt, x, y);
      }

      function drawDropShadow(ctx, txt, x, y) {
        ctx.save();
        ctx.shadowColor = shadowColor.value;
        ctx.shadowBlur = shadowBlur.value;
        ctx.shadowOffsetX = shadowOffX.value;
        ctx.shadowOffsetY = shadowOffY.value;
        ctx.fillStyle = textColor.value;
        ctx.fillText(txt, x, y);
        ctx.restore();
      }

      function drawOutline(ctx, txt, x, y) {
        ctx.strokeStyle = outlineColor.value;
        ctx.lineWidth = outlineWidth.value;
        ctx.lineJoin = 'round';
        ctx.strokeText(txt, x, y);
        ctx.fillStyle = textColor.value;
        ctx.fillText(txt, x, y);
      }

      function drawBevel(ctx, txt, x, y) {
        // top-left highlight
        ctx.fillStyle = bevelLight.value;
        for (var i = 1; i <= bevelSize.value; i++) {
          ctx.fillText(txt, x - i, y - i);
        }
        // bottom-right dark
        ctx.fillStyle = bevelDark.value;
        for (var j = 1; j <= bevelSize.value; j++) {
          ctx.fillText(txt, x + j, y + j);
        }
        ctx.fillStyle = textColor.value;
        ctx.fillText(txt, x, y);
      }

      function drawGlossy(ctx, txt, x, y) {
        // Shadow base
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = textColor.value;
        ctx.fillText(txt, x, y);
        ctx.restore();

        // Glossy overlay — clip to text
        ctx.save();
        ctx.globalCompositeOperation = 'source-atop';
        var m = ctx.measureText(txt);
        var grd = ctx.createLinearGradient(x - m.width/2, y - fontSize.value/2, x - m.width/2, y + fontSize.value/2);
        grd.addColorStop(0, 'rgba(255,255,255,' + glossOpacity.value + ')');
        grd.addColorStop(0.5, 'rgba(255,255,255,0)');
        grd.addColorStop(1, 'rgba(0,0,0,0.2)');
        ctx.fillStyle = grd;
        ctx.fillRect(x - m.width/2 - 10, y - fontSize.value, m.width + 20, fontSize.value * 2);
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
      }

      function drawNeon(ctx, txt, x, y) {
        ctx.save();
        for (var i = 0; i < 3; i++) {
          ctx.shadowColor = neonGlow.value;
          ctx.shadowBlur = neonBlur.value * (i + 1) / 2;
          ctx.fillStyle = i === 2 ? '#ffffff' : neonGlow.value;
          ctx.fillText(txt, x, y);
        }
        ctx.restore();
      }

      function drawRetro(ctx, txt, x, y) {
        var layers = retroLayers.value;
        var spread = retroSpread.value;
        var colors = ['#ff6b6b','#feca57','#48dbfb','#ff9ff3','#54a0ff','#5f27cd'];
        for (var i = layers; i >= 1; i--) {
          ctx.fillStyle = colors[i % colors.length];
          ctx.fillText(txt, x + i * spread, y + i * spread);
        }
        ctx.fillStyle = textColor.value;
        ctx.fillText(txt, x, y);
      }

      function drawEmboss(ctx, txt, x, y) {
        var s = embossStrength.value;
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillText(txt, x - s, y - s);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillText(txt, x + s, y + s);
        ctx.fillStyle = textColor.value;
        ctx.fillText(txt, x, y);
      }

      function drawChrome(ctx, txt, x, y) {
        var m = ctx.measureText(txt);
        var grd = ctx.createLinearGradient(x - m.width/2, y - fontSize.value/2, x - m.width/2, y + fontSize.value/2);
        grd.addColorStop(0, '#e8e8e8');
        grd.addColorStop(0.25, '#a0a0a0');
        grd.addColorStop(0.5, '#f0f0f0');
        grd.addColorStop(0.75, '#808080');
        grd.addColorStop(1, '#c0c0c0');

        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // outline
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.strokeText(txt, x, y);

        ctx.fillStyle = grd;
        ctx.fillText(txt, x, y);
        ctx.restore();
      }

      function drawGold(ctx, txt, x, y) {
        var m = ctx.measureText(txt);
        var grd = ctx.createLinearGradient(x - m.width/2, y - fontSize.value/2, x - m.width/2, y + fontSize.value/2);
        grd.addColorStop(0, '#f5d442');
        grd.addColorStop(0.3, '#e6a817');
        grd.addColorStop(0.5, '#fce38a');
        grd.addColorStop(0.7, '#e6a817');
        grd.addColorStop(1, '#c8860a');

        // Dark extrusion
        ctx.fillStyle = '#7a5200';
        for (var i = 4; i > 0; i--) {
          ctx.fillText(txt, x + i, y + i);
        }

        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        ctx.strokeStyle = '#8B6914';
        ctx.lineWidth = 2;
        ctx.strokeText(txt, x, y);
        ctx.fillStyle = grd;
        ctx.fillText(txt, x, y);
        ctx.restore();
      }

      /* ─── live preview ─── */
      function updatePreview() {
        var cvs = previewCanvas.value;
        if (!cvs) return;
        cvs.width = canvasW.value;
        cvs.height = canvasH.value;
        var ctx = cvs.getContext('2d');
        if (animEnabled.value && animType.value !== 'none' && isPlaying.value) return; // skip; animation loop handles it
        render3DText(ctx, canvasW.value, canvasH.value, 1);
      }

      /* ─── animation preview ─── */
      function startPreview() {
        if (animType.value === 'none') return;
        isPlaying.value = true;
        animStart = performance.now();
        animLoop();
      }

      function stopPreview() {
        isPlaying.value = false;
        if (animFrame) cancelAnimationFrame(animFrame);
        animFrame = null;
        updatePreview();
      }

      function animLoop() {
        if (!isPlaying.value) return;
        var cvs = previewCanvas.value;
        if (!cvs) return;
        var ctx2 = cvs.getContext('2d');
        var elapsed = (performance.now() - animStart) / 1000;
        var dur = animDuration.value || 2;
        var p = elapsed / dur;
        if (p >= 1) {
          if (loopAnim.value) {
            animStart = performance.now();
            p = 0;
          } else {
            p = 1;
            isPlaying.value = false;
          }
        }
        render3DText(ctx2, canvasW.value, canvasH.value, p);
        if (isPlaying.value) animFrame = requestAnimationFrame(animLoop);
      }

      /* ─── font dialog ─── */
      async function openFontDialog() {
        if (!window.FontSelectDialog) return;
        var result = await window.FontSelectDialog.show({
          title: '🔤 Font Selection',
          selectedFont: fontFamily.value,
          sampleText: text.value || '3D Text',
          apiKey: ''
        });
        if (result && result.family) {
          fontFamily.value = result.family;
          updatePreview();
        }
      }

      /* ─── export helpers ─── */
      function renderFrameToCanvas(cvs, progress) {
        cvs.width = canvasW.value;
        cvs.height = canvasH.value;
        var ctx = cvs.getContext('2d');
        render3DText(ctx, canvasW.value, canvasH.value, progress);
      }

      // Still image export (PNG/JPG)
      async function exportStillImage(format) {
        if (!window.FileDialog) return;
        var ext = format === 'jpg' ? 'jpg' : 'png';
        var result = await window.FileDialog.save({
          title: '💾 Save ' + ext.toUpperCase(),
          defaultName: '3dtext-' + Date.now() + '.' + ext,
          filters: [{ label: ext.toUpperCase(), extensions: ['.' + ext] }]
        });
        if (!result) return;
        try {
          exporting.value = true;
          exportProgress.value = 0;
          var cvs = document.createElement('canvas');
          renderFrameToCanvas(cvs, 1);
          var mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
          var dataUrl = cvs.toDataURL(mime, format === 'jpg' ? 0.92 : 1);
          var b64 = dataUrl.split(',')[1];
          var resp = await fetch('/api/fs/write-binary', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath: result.path, content: b64 })
          });
          if (resp.ok) { if (window.ElMessage) window.ElMessage.success('Saved!'); }
          else { if (window.ElMessage) window.ElMessage.error('Save failed'); }
          exportProgress.value = 100;
        } catch(e) {
          console.error(e);
          if (window.ElMessage) window.ElMessage.error('Export error');
        } finally {
          exporting.value = false;
        }
      }

      // GIF export
      async function exportGIF() {
        if (!window.FileDialog) return;
        var result = await window.FileDialog.save({
          title: '💾 Save GIF',
          defaultName: '3dtext-' + Date.now() + '.gif',
          filters: [{ label: 'GIF', extensions: ['.gif'] }]
        });
        if (!result) return;
        exporting.value = true;
        exportProgress.value = 0;
        try {
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js');
          var fps = exportFps.value || 15;
          var dur = animDuration.value || 2;
          var totalFrames = Math.round(fps * dur);
          var delay = Math.round(1000 / fps);

          var gif = new GIF({
            workers: 2,
            quality: 10,
            width: canvasW.value,
            height: canvasH.value,
            workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js'
          });

          var cvs = document.createElement('canvas');
          for (var i = 0; i < totalFrames; i++) {
            var p = i / totalFrames;
            renderFrameToCanvas(cvs, p);
            gif.addFrame(cvs, { copy: true, delay: delay });
            exportProgress.value = Math.round((i / totalFrames) * 80);
          }

          var blob = await new Promise(function(resolve, reject) {
            gif.on('finished', resolve);
            gif.on('error', reject);
            gif.render();
          });

          exportProgress.value = 90;

          var reader = new FileReader();
          var b64 = await new Promise(function(resolve) {
            reader.onload = function() { resolve(reader.result.split(',')[1]); };
            reader.readAsDataURL(blob);
          });

          var resp = await fetch('/api/fs/write-binary', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath: result.path, content: b64 })
          });
          exportProgress.value = 100;
          if (resp.ok) { if (window.ElMessage) window.ElMessage.success('GIF saved!'); }
          else { if (window.ElMessage) window.ElMessage.error('Save failed'); }
        } catch(e) {
          console.error(e);
          if (window.ElMessage) window.ElMessage.error('GIF export error: ' + e.message);
        } finally {
          exporting.value = false;
        }
      }

      // WebM video export (uses MediaRecorder which browsers support)
      async function exportVideo(mimeHint) {
        if (!window.FileDialog) return;
        // Determine best supported mime
        var mimeType = 'video/webm';
        var ext = 'webm';
        if (mimeHint === 'mp4' && MediaRecorder.isTypeSupported('video/mp4')) {
          mimeType = 'video/mp4'; ext = 'mp4';
        } else if (mimeHint === 'webm' && MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
          mimeType = 'video/webm;codecs=vp9'; ext = 'webm';
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
          mimeType = 'video/webm;codecs=vp8'; ext = 'webm';
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          mimeType = 'video/webm'; ext = 'webm';
        }

        var result = await window.FileDialog.save({
          title: '💾 Save Video (' + ext.toUpperCase() + ')',
          defaultName: '3dtext-' + Date.now() + '.' + ext,
          filters: [{ label: ext.toUpperCase(), extensions: ['.' + ext] }]
        });
        if (!result) return;

        exporting.value = true;
        exportProgress.value = 0;
        try {
          var cvs = document.createElement('canvas');
          cvs.width = canvasW.value;
          cvs.height = canvasH.value;

          var stream = cvs.captureStream(exportFps.value);
          var recorder = new MediaRecorder(stream, { mimeType: mimeType });
          var chunks = [];
          recorder.ondataavailable = function(e) { if (e.data.size > 0) chunks.push(e.data); };

          var recordDone = new Promise(function(resolve) { recorder.onstop = resolve; });
          recorder.start();

          var dur = animDuration.value || 2;
          var fps = exportFps.value || 15;
          var totalFrames = Math.round(dur * fps);
          var frameDelay = 1000 / fps;

          for (var i = 0; i <= totalFrames; i++) {
            var p = i / totalFrames;
            renderFrameToCanvas(cvs, p);
            exportProgress.value = Math.round((i / totalFrames) * 85);
            await new Promise(function(r) { setTimeout(r, frameDelay); });
          }
          recorder.stop();
          await recordDone;

          exportProgress.value = 90;
          var blob = new Blob(chunks, { type: mimeType });
          var reader = new FileReader();
          var b64 = await new Promise(function(resolve) {
            reader.onload = function() { resolve(reader.result.split(',')[1]); };
            reader.readAsDataURL(blob);
          });

          var resp = await fetch('/api/fs/write-binary', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath: result.path, content: b64 })
          });

          exportProgress.value = 100;
          if (resp.ok) { if (window.ElMessage) window.ElMessage.success('Video saved!'); }
          else { if (window.ElMessage) window.ElMessage.error('Save failed'); }
        } catch(e) {
          console.error(e);
          if (window.ElMessage) window.ElMessage.error('Video export error: ' + e.message);
        } finally {
          exporting.value = false;
        }
      }

      // Download to local device
      function downloadLocal() {
        var cvs = document.createElement('canvas');
        renderFrameToCanvas(cvs, 1);
        var a = document.createElement('a');
        a.href = cvs.toDataURL('image/png');
        a.download = '3dtext-' + Date.now() + '.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      /* ─── script loader ─── */
      var loadedScripts = {};
      function loadScript(url) {
        if (loadedScripts[url]) return loadedScripts[url];
        loadedScripts[url] = new Promise(function(resolve, reject) {
          if (url.indexOf('gif.js') !== -1 && window.GIF) { resolve(); return; }
          var origDefine = window.define;
          window.define = undefined;
          var s = document.createElement('script');
          s.src = url;
          s.onload = function() { window.define = origDefine; resolve(); };
          s.onerror = function() { window.define = origDefine; reject(new Error('Failed to load ' + url)); };
          document.head.appendChild(s);
        });
        return loadedScripts[url];
      }

      /* ─── watchers ─── */
      watch([text, fontFamily, fontSize, textColor, bgColor, canvasW, canvasH, textAlign, bold, italic,
             effect3d, depthColor, depthLength, depthAngle, outlineColor, outlineWidth,
             shadowColor, shadowBlur, shadowOffX, shadowOffY, bevelLight, bevelDark, bevelSize,
             glossOpacity, neonGlow, neonBlur, retroLayers, retroSpread, embossStrength],
        function() { nextTick(updatePreview); }
      );

      watch([animType, animEnabled], function() {
        if (!animEnabled.value || animType.value === 'none') stopPreview();
      });

      /* ─── lifecycle ─── */
      onMounted(function() {
        nextTick(updatePreview);
      });

      onUnmounted(function() {
        if (animFrame) cancelAnimationFrame(animFrame);
      });

      /* ─── return ─── */
      return {
        previewCanvas, text, fontFamily, fontSize, textColor, bgColor,
        canvasW, canvasH, textAlign, bold, italic,
        effect3d, effects3dList, depthColor, depthLength, depthAngle,
        outlineColor, outlineWidth, shadowColor, shadowBlur, shadowOffX, shadowOffY,
        bevelLight, bevelDark, bevelSize, glossOpacity, neonGlow, neonBlur,
        retroLayers, retroSpread, embossStrength,
        animEnabled, animType, animTypes, animDuration, loopAnim, animEasing, easings,
        exportFormat, exportFps, exporting, exportProgress, isPlaying,
        openFontDialog, updatePreview, startPreview, stopPreview,
        exportStillImage, exportGIF, exportVideo, downloadLocal,
      };
    }
  };
})(Vue);
