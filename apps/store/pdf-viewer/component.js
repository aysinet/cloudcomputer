(function(Vue) {
  var ref = Vue.ref;
  var computed = Vue.computed;
  var onMounted = Vue.onMounted;
  var onUnmounted = Vue.onUnmounted;
  var nextTick = Vue.nextTick;
  var watch = Vue.watch;

  return {
    setup: function() {
      var pdfData = ref(null);
      var pdfDoc = null;
      var currentPage = ref(1);
      var totalPages = ref(0);
      var scale = ref(1.5);
      var rotation = ref(0);
      var loading = ref(false);
      var currentFileName = ref('');
      var currentFilePath = ref('');
      var canvasRefs = {};
      var fileInput = ref(null);
      var pdfContent = ref(null);
      var pdfjsLib = null;
      var renderedPages = {};

      var zoomPercent = computed(function() {
        return Math.round(scale.value * 100);
      });

      var welcomeText = computed(function() { return 'Open a PDF file or upload one from your computer'; });
      var openText = computed(function() { return 'Open File'; });
      var uploadText = computed(function() { return 'Upload'; });
      var loadingText = computed(function() { return 'Loading PDF...'; });

      var PDF_FILTERS = [
        { label: 'PDF Files', extensions: ['.pdf'] },
        { label: 'All Files', extensions: ['*'] }
      ];

      function loadPdfJs() {
        return new Promise(function(resolve, reject) {
          if (window.pdfjsLib) {
            pdfjsLib = window.pdfjsLib;
            resolve();
            return;
          }
          var script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          script.onload = function() {
            pdfjsLib = window.pdfjsLib;
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            resolve();
          };
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      async function loadPdfFromData(data, fileName) {
        loading.value = true;
        try {
          await loadPdfJs();
          var loadingTask = pdfjsLib.getDocument({ data: data });
          var doc = await loadingTask.promise;
          pdfDoc = doc;
          totalPages.value = doc.numPages;
          currentPage.value = 1;
          currentFileName.value = fileName || 'document.pdf';
          pdfData.value = data;
          renderedPages = {};
          loading.value = false;
          await nextTick();
          await renderAllVisible();
        } catch (e) {
          console.error('PDF load error:', e);
          pdfData.value = null;
          loading.value = false;
        }
      }

      async function renderPage(pageNum) {
        if (!pdfDoc || renderedPages[pageNum + '_' + scale.value]) return;
        var canvas = canvasRefs[pageNum];
        if (!canvas) return;

        var page = await pdfDoc.getPage(pageNum);
        var viewport = page.getViewport({ scale: scale.value, rotation: 0 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = viewport.width + 'px';
        canvas.style.height = viewport.height + 'px';

        var ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport: viewport }).promise;
        renderedPages[pageNum + '_' + scale.value] = true;
      }

      async function renderAllVisible() {
        if (!pdfDoc) return;
        for (var i = 1; i <= totalPages.value; i++) {
          await renderPage(i);
        }
      }

      async function rerender() {
        renderedPages = {};
        await nextTick();
        await renderAllVisible();
      }

      function getAuthHeaders() {
        var token = localStorage.getItem('token');
        return { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };
      }

      async function openFile() {
        try {
          var result = await window.FileDialog.open({ title: '📂 Open PDF', filters: PDF_FILTERS });
          if (!result) return;
          currentFilePath.value = result.path;
          // Re-read file as binary via base64 endpoint
          var r = await fetch('/api/fs/read-binary?path=' + encodeURIComponent(result.path), {
            headers: getAuthHeaders()
          });
          if (!r.ok) return;
          var data = await r.json();
          var binary = atob(data.content);
          var len = binary.length;
          var bytes = new Uint8Array(len);
          for (var i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          await loadPdfFromData(bytes.buffer, result.name);
        } catch (e) {
          console.error('Open file error:', e);
        }
      }

      function uploadPdf() {
        if (fileInput.value) fileInput.value.click();
      }

      function handleFileUpload(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          loadPdfFromData(ev.target.result, file.name);
        };
        reader.readAsArrayBuffer(file);
        e.target.value = '';
      }

      function downloadPdf() {
        if (!pdfData.value) return;
        var blob = new Blob([pdfData.value], { type: 'application/pdf' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = currentFileName.value || 'document.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      async function saveToFs() {
        if (!pdfData.value) return;
        try {
          var result = await window.FileDialog.save({ title: '💾 Save PDF', defaultName: currentFileName.value || 'document.pdf', filters: PDF_FILTERS });
          if (!result) return;
          var bytes = new Uint8Array(pdfData.value);
          var binary = '';
          for (var i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          var b64 = btoa(binary);
          var r = await fetch('/api/fs/write-binary', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ filePath: result.path, content: b64 })
          });
          if (r.ok) {
            currentFilePath.value = result.path;
            currentFileName.value = result.name;
          }
        } catch (e) {
          console.error('Save error:', e);
        }
      }

      function zoomIn() {
        if (scale.value < 5) {
          scale.value = Math.min(5, scale.value + 0.25);
          rerender();
        }
      }

      function zoomOut() {
        if (scale.value > 0.25) {
          scale.value = Math.max(0.25, scale.value - 0.25);
          rerender();
        }
      }

      function resetZoom() {
        scale.value = 1.5;
        rerender();
      }

      function fitWidth() {
        if (!pdfContent.value || !pdfDoc) return;
        pdfDoc.getPage(currentPage.value).then(function(page) {
          var viewport = page.getViewport({ scale: 1 });
          var containerWidth = pdfContent.value.clientWidth - 40;
          scale.value = Math.round((containerWidth / viewport.width) * 100) / 100;
          rerender();
        });
      }

      function fitPage() {
        if (!pdfContent.value || !pdfDoc) return;
        pdfDoc.getPage(currentPage.value).then(function(page) {
          var viewport = page.getViewport({ scale: 1 });
          var containerWidth = pdfContent.value.clientWidth - 40;
          var containerHeight = pdfContent.value.clientHeight - 40;
          var scaleW = containerWidth / viewport.width;
          var scaleH = containerHeight / viewport.height;
          scale.value = Math.round(Math.min(scaleW, scaleH) * 100) / 100;
          rerender();
        });
      }

      function prevPage() {
        if (currentPage.value > 1) {
          currentPage.value--;
          scrollToPage(currentPage.value);
        }
      }

      function nextPage() {
        if (currentPage.value < totalPages.value) {
          currentPage.value++;
          scrollToPage(currentPage.value);
        }
      }

      function goToPage(val) {
        var p = parseInt(val);
        if (p >= 1 && p <= totalPages.value) {
          currentPage.value = p;
          scrollToPage(p);
        }
      }

      function scrollToPage(pageNum) {
        var canvas = canvasRefs[pageNum];
        if (canvas && pdfContent.value) {
          canvas.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }

      function handleScroll() {
        if (!pdfContent.value || !pdfDoc) return;
        var container = pdfContent.value;
        var scrollTop = container.scrollTop;
        var best = 1;
        var bestDist = Infinity;
        for (var i = 1; i <= totalPages.value; i++) {
          var canvas = canvasRefs[i];
          if (canvas) {
            var dist = Math.abs(canvas.offsetTop - scrollTop);
            if (dist < bestDist) {
              bestDist = dist;
              best = i;
            }
          }
        }
        currentPage.value = best;
      }

      function rotateLeft() {
        rotation.value = (rotation.value - 90) % 360;
      }

      function rotateRight() {
        rotation.value = (rotation.value + 90) % 360;
      }

      function printPdf() {
        if (!pdfData.value) return;
        var blob = new Blob([pdfData.value], { type: 'application/pdf' });
        var url = URL.createObjectURL(blob);
        var win = window.open(url);
        if (win) {
          win.addEventListener('load', function() {
            win.print();
          });
        }
      }

      onMounted(function() {
        loadPdfJs();
      });

      onUnmounted(function() {
        pdfDoc = null;
        pdfData.value = null;
        canvasRefs = {};
        renderedPages = {};
      });

      return {
        pdfData: pdfData,
        currentPage: currentPage,
        totalPages: totalPages,
        scale: scale,
        rotation: rotation,
        loading: loading,
        currentFileName: currentFileName,
        currentFilePath: currentFilePath,
        canvasRefs: canvasRefs,
        fileInput: fileInput,
        pdfContent: pdfContent,
        zoomPercent: zoomPercent,
        welcomeText: welcomeText,
        openText: openText,
        uploadText: uploadText,
        loadingText: loadingText,
        openFile: openFile,
        uploadPdf: uploadPdf,
        handleFileUpload: handleFileUpload,
        downloadPdf: downloadPdf,
        saveToFs: saveToFs,
        zoomIn: zoomIn,
        zoomOut: zoomOut,
        resetZoom: resetZoom,
        fitWidth: fitWidth,
        fitPage: fitPage,
        prevPage: prevPage,
        nextPage: nextPage,
        goToPage: goToPage,
        handleScroll: handleScroll,
        rotateLeft: rotateLeft,
        rotateRight: rotateRight,
        printPdf: printPdf
      };
    }
  };
})(Vue);
