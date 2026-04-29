(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, watch, nextTick } = Vue;

  const LANGS = {
    tr: { camera:'Kamera', upload:'Yükle', capture:'Çek', retake:'Tekrar Çek', scan:'Tara', documents:'Belgelerim', newDoc:'Yeni Belge', addPage:'Sayfa Ekle', pages:'sayfa', filter:'Filtre', original:'Orijinal', grayscale:'Gri Tonlama', bw:'Siyah Beyaz', enhanced:'Gelişmiş', sharp:'Keskin', rotate:'Döndür', crop:'Kırp', applyCrop:'Kırpı Uygula', cancelCrop:'İptal', download:'İndir', downloadPdf:'PDF İndir', downloadImg:'Resim İndir', delete:'Sil', rename:'Yeniden Adlandır', title:'Başlık', noCamera:'Kamera bulunamadı', cameraError:'Kamera erişim hatası', noDocs:'Henüz belge yok', scanHint:'Kameradan çekin veya dosya yükleyin', switchCam:'Kamera Değiştir', deleteConfirm:'Bu belge silinsin mi?', deletePage:'Sayfayı Sil', processing:'İşleniyor...', brightness:'Parlaklık', contrast:'Kontrast' },
    en: { camera:'Camera', upload:'Upload', capture:'Capture', retake:'Retake', scan:'Scan', documents:'My Documents', newDoc:'New Document', addPage:'Add Page', pages:'pages', filter:'Filter', original:'Original', grayscale:'Grayscale', bw:'Black & White', enhanced:'Enhanced', sharp:'Sharpen', rotate:'Rotate', crop:'Crop', applyCrop:'Apply Crop', cancelCrop:'Cancel', download:'Download', downloadPdf:'Download PDF', downloadImg:'Download Image', delete:'Delete', rename:'Rename', title:'Title', noCamera:'No camera found', cameraError:'Camera access error', noDocs:'No documents yet', scanHint:'Capture from camera or upload a file', switchCam:'Switch Camera', deleteConfirm:'Delete this document?', deletePage:'Delete Page', processing:'Processing...', brightness:'Brightness', contrast:'Contrast' },
    de: { camera:'Kamera', upload:'Hochladen', capture:'Aufnehmen', retake:'Erneut', scan:'Scannen', documents:'Meine Dokumente', newDoc:'Neues Dokument', addPage:'Seite hinzufügen', pages:'Seiten', filter:'Filter', original:'Original', grayscale:'Graustufen', bw:'Schwarz-Weiß', enhanced:'Verbessert', sharp:'Schärfen', rotate:'Drehen', crop:'Zuschneiden', applyCrop:'Zuschnitt anwenden', cancelCrop:'Abbrechen', download:'Herunterladen', downloadPdf:'PDF herunterladen', downloadImg:'Bild herunterladen', delete:'Löschen', rename:'Umbenennen', title:'Titel', noCamera:'Keine Kamera gefunden', cameraError:'Kamerazugriffsfehler', noDocs:'Noch keine Dokumente', scanHint:'Mit Kamera aufnehmen oder Datei hochladen', switchCam:'Kamera wechseln', deleteConfirm:'Dieses Dokument löschen?', deletePage:'Seite löschen', processing:'Verarbeitung...', brightness:'Helligkeit', contrast:'Kontrast' },
    fr: { camera:'Caméra', upload:'Télécharger', capture:'Capturer', retake:'Reprendre', scan:'Numériser', documents:'Mes Documents', newDoc:'Nouveau Document', addPage:'Ajouter une page', pages:'pages', filter:'Filtre', original:'Original', grayscale:'Niveaux de gris', bw:'Noir et Blanc', enhanced:'Amélioré', sharp:'Netteté', rotate:'Rotation', crop:'Recadrer', applyCrop:'Appliquer', cancelCrop:'Annuler', download:'Télécharger', downloadPdf:'Télécharger PDF', downloadImg:'Télécharger Image', delete:'Supprimer', rename:'Renommer', title:'Titre', noCamera:'Aucune caméra trouvée', cameraError:'Erreur d\'accès caméra', noDocs:'Aucun document', scanHint:'Capturer avec la caméra ou télécharger un fichier', switchCam:'Changer de caméra', deleteConfirm:'Supprimer ce document?', deletePage:'Supprimer la page', processing:'Traitement...', brightness:'Luminosité', contrast:'Contraste' },
    es: { camera:'Cámara', upload:'Subir', capture:'Capturar', retake:'Repetir', scan:'Escanear', documents:'Mis Documentos', newDoc:'Nuevo Documento', addPage:'Agregar página', pages:'páginas', filter:'Filtro', original:'Original', grayscale:'Escala de grises', bw:'Blanco y Negro', enhanced:'Mejorado', sharp:'Nitidez', rotate:'Rotar', crop:'Recortar', applyCrop:'Aplicar recorte', cancelCrop:'Cancelar', download:'Descargar', downloadPdf:'Descargar PDF', downloadImg:'Descargar Imagen', delete:'Eliminar', rename:'Renombrar', title:'Título', noCamera:'No se encontró cámara', cameraError:'Error de acceso a cámara', noDocs:'Sin documentos aún', scanHint:'Capture con cámara o suba un archivo', switchCam:'Cambiar cámara', deleteConfirm:'¿Eliminar este documento?', deletePage:'Eliminar página', processing:'Procesando...', brightness:'Brillo', contrast:'Contraste' },
    ru: { camera:'Камера', upload:'Загрузить', capture:'Снять', retake:'Переснять', scan:'Сканировать', documents:'Мои документы', newDoc:'Новый документ', addPage:'Добавить страницу', pages:'страниц', filter:'Фильтр', original:'Оригинал', grayscale:'Оттенки серого', bw:'Чёрно-белый', enhanced:'Улучшенный', sharp:'Резкость', rotate:'Повернуть', crop:'Обрезать', applyCrop:'Применить', cancelCrop:'Отмена', download:'Скачать', downloadPdf:'Скачать PDF', downloadImg:'Скачать изображение', delete:'Удалить', rename:'Переименовать', title:'Название', noCamera:'Камера не найдена', cameraError:'Ошибка доступа к камере', noDocs:'Документов пока нет', scanHint:'Снимите камерой или загрузите файл', switchCam:'Другая камера', deleteConfirm:'Удалить этот документ?', deletePage:'Удалить страницу', processing:'Обработка...', brightness:'Яркость', contrast:'Контраст' },
    zh: { camera:'相机', upload:'上传', capture:'拍摄', retake:'重拍', scan:'扫描', documents:'我的文档', newDoc:'新建文档', addPage:'添加页面', pages:'页', filter:'滤镜', original:'原始', grayscale:'灰度', bw:'黑白', enhanced:'增强', sharp:'锐化', rotate:'旋转', crop:'裁剪', applyCrop:'应用裁剪', cancelCrop:'取消', download:'下载', downloadPdf:'下载PDF', downloadImg:'下载图片', delete:'删除', rename:'重命名', title:'标题', noCamera:'未找到相机', cameraError:'相机访问错误', noDocs:'暂无文档', scanHint:'用相机拍摄或上传文件', switchCam:'切换相机', deleteConfirm:'删除此文档？', deletePage:'删除页面', processing:'处理中...', brightness:'亮度', contrast:'对比度' },
    ja: { camera:'カメラ', upload:'アップロード', capture:'撮影', retake:'再撮影', scan:'スキャン', documents:'マイドキュメント', newDoc:'新規ドキュメント', addPage:'ページ追加', pages:'ページ', filter:'フィルター', original:'オリジナル', grayscale:'グレースケール', bw:'白黒', enhanced:'強化', sharp:'シャープ', rotate:'回転', crop:'切り抜き', applyCrop:'適用', cancelCrop:'キャンセル', download:'ダウンロード', downloadPdf:'PDF ダウンロード', downloadImg:'画像ダウンロード', delete:'削除', rename:'名前変更', title:'タイトル', noCamera:'カメラが見つかりません', cameraError:'カメラアクセスエラー', noDocs:'ドキュメントなし', scanHint:'カメラで撮影またはファイルをアップロード', switchCam:'カメラ切替', deleteConfirm:'このドキュメントを削除しますか？', deletePage:'ページ削除', processing:'処理中...', brightness:'明るさ', contrast:'コントラスト' },
    it: { camera:'Fotocamera', upload:'Carica', capture:'Cattura', retake:'Riprendi', scan:'Scansiona', documents:'I miei documenti', newDoc:'Nuovo Documento', addPage:'Aggiungi pagina', pages:'pagine', filter:'Filtro', original:'Originale', grayscale:'Scala di grigi', bw:'Bianco e Nero', enhanced:'Migliorato', sharp:'Nitidezza', rotate:'Ruota', crop:'Ritaglia', applyCrop:'Applica', cancelCrop:'Annulla', download:'Scarica', downloadPdf:'Scarica PDF', downloadImg:'Scarica Immagine', delete:'Elimina', rename:'Rinomina', title:'Titolo', noCamera:'Nessuna fotocamera trovata', cameraError:'Errore accesso fotocamera', noDocs:'Nessun documento', scanHint:'Cattura con fotocamera o carica un file', switchCam:'Cambia fotocamera', deleteConfirm:'Eliminare questo documento?', deletePage:'Elimina pagina', processing:'Elaborazione...', brightness:'Luminosità', contrast:'Contrasto' },
    ar: { camera:'الكاميرا', upload:'رفع', capture:'التقاط', retake:'إعادة', scan:'مسح', documents:'مستنداتي', newDoc:'مستند جديد', addPage:'إضافة صفحة', pages:'صفحات', filter:'فلتر', original:'أصلي', grayscale:'رمادي', bw:'أبيض وأسود', enhanced:'محسّن', sharp:'حاد', rotate:'تدوير', crop:'قص', applyCrop:'تطبيق', cancelCrop:'إلغاء', download:'تنزيل', downloadPdf:'تنزيل PDF', downloadImg:'تنزيل صورة', delete:'حذف', rename:'إعادة تسمية', title:'العنوان', noCamera:'لم يتم العثور على كاميرا', cameraError:'خطأ في الوصول للكاميرا', noDocs:'لا توجد مستندات', scanHint:'التقط بالكاميرا أو ارفع ملفًا', switchCam:'تبديل الكاميرا', deleteConfirm:'حذف هذا المستند؟', deletePage:'حذف الصفحة', processing:'جارٍ المعالجة...', brightness:'السطوع', contrast:'التباين' },
    ko: { camera:'카메라', upload:'업로드', capture:'촬영', retake:'재촬영', scan:'스캔', documents:'내 문서', newDoc:'새 문서', addPage:'페이지 추가', pages:'페이지', filter:'필터', original:'원본', grayscale:'그레이스케일', bw:'흑백', enhanced:'향상', sharp:'선명', rotate:'회전', crop:'자르기', applyCrop:'적용', cancelCrop:'취소', download:'다운로드', downloadPdf:'PDF 다운로드', downloadImg:'이미지 다운로드', delete:'삭제', rename:'이름 변경', title:'제목', noCamera:'카메라를 찾을 수 없음', cameraError:'카메라 접근 오류', noDocs:'문서 없음', scanHint:'카메라로 촬영하거나 파일을 업로드하세요', switchCam:'카메라 전환', deleteConfirm:'이 문서를 삭제하시겠습니까?', deletePage:'페이지 삭제', processing:'처리 중...', brightness:'밝기', contrast:'대비' },
    hi: { camera:'कैमरा', upload:'अपलोड', capture:'कैप्चर', retake:'दोबारा', scan:'स्कैन', documents:'मेरे दस्तावेज़', newDoc:'नया दस्तावेज़', addPage:'पेज जोड़ें', pages:'पेज', filter:'फ़िल्टर', original:'मूल', grayscale:'ग्रेस्केल', bw:'काला और सफ़ेद', enhanced:'बेहतर', sharp:'तेज़', rotate:'घुमाएं', crop:'काटें', applyCrop:'लागू करें', cancelCrop:'रद्द', download:'डाउनलोड', downloadPdf:'PDF डाउनलोड', downloadImg:'छवि डाउनलोड', delete:'हटाएं', rename:'नाम बदलें', title:'शीर्षक', noCamera:'कोई कैमरा नहीं मिला', cameraError:'कैमरा एक्सेस त्रुटि', noDocs:'अभी कोई दस्तावेज़ नहीं', scanHint:'कैमरे से कैप्चर करें या फ़ाइल अपलोड करें', switchCam:'कैमरा बदलें', deleteConfirm:'यह दस्तावेज़ हटाएं?', deletePage:'पेज हटाएं', processing:'प्रोसेसिंग...', brightness:'चमक', contrast:'कंट्रास्ट' },
    pt: { camera:'Câmera', upload:'Enviar', capture:'Capturar', retake:'Recapturar', scan:'Digitalizar', documents:'Meus Documentos', newDoc:'Novo Documento', addPage:'Adicionar página', pages:'páginas', filter:'Filtro', original:'Original', grayscale:'Escala de cinza', bw:'Preto e Branco', enhanced:'Aprimorado', sharp:'Nitidez', rotate:'Girar', crop:'Recortar', applyCrop:'Aplicar', cancelCrop:'Cancelar', download:'Baixar', downloadPdf:'Baixar PDF', downloadImg:'Baixar Imagem', delete:'Excluir', rename:'Renomear', title:'Título', noCamera:'Nenhuma câmera encontrada', cameraError:'Erro de acesso à câmera', noDocs:'Nenhum documento ainda', scanHint:'Capture com câmera ou envie um arquivo', switchCam:'Trocar câmera', deleteConfirm:'Excluir este documento?', deletePage:'Excluir página', processing:'Processando...', brightness:'Brilho', contrast:'Contraste' }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

      // ── State ──
      const view = ref('home');        // home | camera | editor
      const documents = ref([]);       // [{id, title, pages:[{id, original, filtered, filter, rotation, brightness, contrast}], createdAt}]
      const activeDocId = ref(null);
      const activePageIdx = ref(0);
      const processing = ref(false);

      // Camera
      const cameraActive = ref(false);
      const cameraError = ref('');
      const videoEl = ref(null);
      const canvasEl = ref(null);
      const capturedImage = ref(null);
      const facingMode = ref('environment');
      let stream = null;

      // Editor
      const currentFilter = ref('original');
      const cropMode = ref(false);
      const cropRect = ref({ x: 0, y: 0, w: 100, h: 100 });
      const brightness = ref(100);
      const contrast = ref(100);
      const editorCanvasEl = ref(null);
      const previewCanvasEl = ref(null);

      // Rename dialog
      const renameDialog = ref(false);
      const renameInput = ref('');
      const renameDocId = ref(null);

      // Computed
      const activeDoc = computed(() => documents.value.find(d => d.id === activeDocId.value) || null);
      const activePage = computed(() => {
        const doc = activeDoc.value;
        if (!doc || activePageIdx.value < 0 || activePageIdx.value >= doc.pages.length) return null;
        return doc.pages[activePageIdx.value];
      });

      function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

      // ── Persistence ──
      async function loadDocuments() {
        try {
          const res = await fetch('/api/camscanner/documents');
          if (res.ok) {
            const data = await res.json();
            documents.value = data.documents || [];
          }
        } catch {}
      }

      async function saveDocuments() {
        try {
          await fetch('/api/camscanner/documents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documents: documents.value })
          });
        } catch {}
      }

      // ── Camera ──
      async function startCamera() {
        cameraError.value = '';
        capturedImage.value = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facingMode.value, width: { ideal: 1920 }, height: { ideal: 1080 } },
            audio: false
          });
          cameraActive.value = true;
          view.value = 'camera';
          await nextTick();
          if (videoEl.value) {
            videoEl.value.srcObject = stream;
            await videoEl.value.play();
          }
        } catch (err) {
          cameraError.value = L('cameraError');
          cameraActive.value = false;
        }
      }

      function stopCamera() {
        if (stream) {
          stream.getTracks().forEach(t => t.stop());
          stream = null;
        }
        cameraActive.value = false;
        if (videoEl.value) videoEl.value.srcObject = null;
      }

      function switchCamera() {
        facingMode.value = facingMode.value === 'environment' ? 'user' : 'environment';
        stopCamera();
        startCamera();
      }

      function capturePhoto() {
        const v = videoEl.value;
        const c = canvasEl.value;
        if (!v || !c) return;
        c.width = v.videoWidth;
        c.height = v.videoHeight;
        const ctx = c.getContext('2d');
        if (facingMode.value === 'user') {
          ctx.translate(c.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(v, 0, 0);
        capturedImage.value = c.toDataURL('image/png');
        stopCamera();
      }

      function retakePhoto() {
        capturedImage.value = null;
        startCamera();
      }

      // ── Upload ──
      function triggerUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.jpg,.jpeg,.png,.webp,.bmp';
        input.multiple = true;
        input.onchange = () => {
          if (!input.files.length) return;
          for (const file of input.files) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const dataUrl = e.target.result;
              addPageToNewOrActive(dataUrl);
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      }

      function addPageToNewOrActive(imageData) {
        const page = { id: genId(), original: imageData, filtered: imageData, filter: 'original', rotation: 0, brightness: 100, contrast: 100 };
        if (activeDoc.value) {
          activeDoc.value.pages.push(page);
          activePageIdx.value = activeDoc.value.pages.length - 1;
        } else {
          const doc = {
            id: genId(),
            title: L('scan') + ' ' + new Date().toLocaleDateString(),
            pages: [page],
            createdAt: Date.now()
          };
          documents.value.unshift(doc);
          activeDocId.value = doc.id;
          activePageIdx.value = 0;
        }
        view.value = 'editor';
        currentFilter.value = 'original';
        brightness.value = 100;
        contrast.value = 100;
        saveDocuments();
        nextTick(() => renderPreview());
      }

      function addCapturedToDoc() {
        if (!capturedImage.value) return;
        addPageToNewOrActive(capturedImage.value);
        capturedImage.value = null;
      }

      // ── Image Filters (Canvas) ──
      function applyFilter(imageData, filter, bright, cont) {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const c = document.createElement('canvas');
            c.width = img.width;
            c.height = img.height;
            const ctx = c.getContext('2d');

            // Apply brightness/contrast via CSS filter on canvas
            ctx.filter = 'brightness(' + (bright / 100) + ') contrast(' + (cont / 100) + ')';
            ctx.drawImage(img, 0, 0);
            ctx.filter = 'none';

            if (filter === 'grayscale' || filter === 'bw' || filter === 'enhanced' || filter === 'sharp') {
              const imgD = ctx.getImageData(0, 0, c.width, c.height);
              const d = imgD.data;
              if (filter === 'grayscale') {
                for (let i = 0; i < d.length; i += 4) {
                  const avg = d[i] * 0.299 + d[i+1] * 0.587 + d[i+2] * 0.114;
                  d[i] = d[i+1] = d[i+2] = avg;
                }
              } else if (filter === 'bw') {
                for (let i = 0; i < d.length; i += 4) {
                  const avg = d[i] * 0.299 + d[i+1] * 0.587 + d[i+2] * 0.114;
                  const val = avg > 128 ? 255 : 0;
                  d[i] = d[i+1] = d[i+2] = val;
                }
              } else if (filter === 'enhanced') {
                for (let i = 0; i < d.length; i += 4) {
                  const avg = d[i] * 0.299 + d[i+1] * 0.587 + d[i+2] * 0.114;
                  // High contrast grayscale
                  let v = ((avg - 128) * 1.5) + 128;
                  v = Math.max(0, Math.min(255, v));
                  d[i] = d[i+1] = d[i+2] = v;
                }
              } else if (filter === 'sharp') {
                // Simple unsharp mask approach
                const w = c.width, h = c.height;
                const orig = new Uint8ClampedArray(d);
                for (let y = 1; y < h - 1; y++) {
                  for (let x = 1; x < w - 1; x++) {
                    const idx = (y * w + x) * 4;
                    for (let ch = 0; ch < 3; ch++) {
                      const center = orig[idx + ch] * 5;
                      const neighbors = orig[idx - 4 + ch] + orig[idx + 4 + ch] +
                                        orig[((y-1)*w + x)*4 + ch] + orig[((y+1)*w + x)*4 + ch];
                      d[idx + ch] = Math.max(0, Math.min(255, center - neighbors));
                    }
                  }
                }
              }
              ctx.putImageData(imgD, 0, 0);
            }
            resolve(c.toDataURL('image/png'));
          };
          img.src = imageData;
        });
      }

      async function setFilter(f) {
        if (!activePage.value) return;
        currentFilter.value = f;
        processing.value = true;
        const result = await applyFilter(activePage.value.original, f, brightness.value, contrast.value);
        activePage.value.filtered = result;
        activePage.value.filter = f;
        activePage.value.brightness = brightness.value;
        activePage.value.contrast = contrast.value;
        processing.value = false;
        saveDocuments();
        renderPreview();
      }

      async function adjustImage() {
        if (!activePage.value) return;
        processing.value = true;
        const result = await applyFilter(activePage.value.original, currentFilter.value, brightness.value, contrast.value);
        activePage.value.filtered = result;
        activePage.value.brightness = brightness.value;
        activePage.value.contrast = contrast.value;
        processing.value = false;
        saveDocuments();
        renderPreview();
      }

      // ── Rotate ──
      function rotatePage() {
        if (!activePage.value) return;
        const p = activePage.value;
        p.rotation = ((p.rotation || 0) + 90) % 360;
        // Actually rotate the images
        rotateImage(p.original).then(rotOrig => {
          p.original = rotOrig;
          return rotateImage(p.filtered);
        }).then(rotFilt => {
          p.filtered = rotFilt;
          saveDocuments();
          renderPreview();
        });
      }

      function rotateImage(dataUrl) {
        return new Promise(resolve => {
          const img = new Image();
          img.onload = () => {
            const c = document.createElement('canvas');
            c.width = img.height;
            c.height = img.width;
            const ctx = c.getContext('2d');
            ctx.translate(c.width / 2, c.height / 2);
            ctx.rotate(Math.PI / 2);
            ctx.drawImage(img, -img.width / 2, -img.height / 2);
            resolve(c.toDataURL('image/png'));
          };
          img.src = dataUrl;
        });
      }

      // ── Crop ──
      let cropDrag = null;

      function startCrop() {
        cropMode.value = true;
        cropRect.value = { x: 10, y: 10, w: 80, h: 80 };
      }

      function cancelCrop() { cropMode.value = false; }

      function applyCropAction() {
        if (!activePage.value) return;
        const p = activePage.value;
        const img = new Image();
        img.onload = () => {
          const sx = (cropRect.value.x / 100) * img.width;
          const sy = (cropRect.value.y / 100) * img.height;
          const sw = (cropRect.value.w / 100) * img.width;
          const sh = (cropRect.value.h / 100) * img.height;
          const c = document.createElement('canvas');
          c.width = sw;
          c.height = sh;
          const ctx = c.getContext('2d');
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
          const cropped = c.toDataURL('image/png');
          p.original = cropped;
          p.filtered = cropped;
          currentFilter.value = 'original';
          brightness.value = 100;
          contrast.value = 100;
          cropMode.value = false;
          saveDocuments();
          renderPreview();
        };
        img.src = p.original;
      }

      function onCropMouseDown(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const px = ((e.clientX - rect.left) / rect.width) * 100;
        const py = ((e.clientY - rect.top) / rect.height) * 100;
        const cr = cropRect.value;
        // Determine if near edge or inside
        const edgeThresh = 4;
        let edge = 'move';
        if (Math.abs(px - cr.x) < edgeThresh) edge = 'left';
        else if (Math.abs(px - (cr.x + cr.w)) < edgeThresh) edge = 'right';
        if (Math.abs(py - cr.y) < edgeThresh) edge += edge === 'move' ? 'top' : '-top';
        else if (Math.abs(py - (cr.y + cr.h)) < edgeThresh) edge += edge === 'move' ? 'bottom' : '-bottom';
        if (edge === 'move' && (px < cr.x || px > cr.x + cr.w || py < cr.y || py > cr.y + cr.h)) {
          edge = 'new';
        }
        cropDrag = { edge, startX: px, startY: py, origRect: { ...cr } };
        e.preventDefault();
      }

      function onCropMouseMove(e) {
        if (!cropDrag) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const px = ((e.clientX - rect.left) / rect.width) * 100;
        const py = ((e.clientY - rect.top) / rect.height) * 100;
        const dx = px - cropDrag.startX;
        const dy = py - cropDrag.startY;
        const o = cropDrag.origRect;
        const cr = cropRect.value;
        if (cropDrag.edge === 'move') {
          cr.x = Math.max(0, Math.min(100 - o.w, o.x + dx));
          cr.y = Math.max(0, Math.min(100 - o.h, o.y + dy));
        } else if (cropDrag.edge === 'right') {
          cr.w = Math.max(5, Math.min(100 - o.x, o.w + dx));
        } else if (cropDrag.edge === 'left') {
          const newX = Math.max(0, o.x + dx);
          cr.w = o.w + (o.x - newX);
          cr.x = newX;
        } else if (cropDrag.edge === 'bottom') {
          cr.h = Math.max(5, Math.min(100 - o.y, o.h + dy));
        } else if (cropDrag.edge === 'top') {
          const newY = Math.max(0, o.y + dy);
          cr.h = o.h + (o.y - newY);
          cr.y = newY;
        } else if (cropDrag.edge === 'new') {
          cr.x = Math.min(cropDrag.startX, px);
          cr.y = Math.min(cropDrag.startY, py);
          cr.w = Math.abs(dx);
          cr.h = Math.abs(dy);
        }
        e.preventDefault();
      }

      function onCropMouseUp() { cropDrag = null; }

      // ── Preview rendering ──
      function renderPreview() {
        // Nothing special needed — reactive img src handles it
      }

      // ── Document management ──
      function newDocument() {
        activeDocId.value = null;
        activePageIdx.value = 0;
        view.value = 'home';
      }

      function openDocument(doc) {
        activeDocId.value = doc.id;
        activePageIdx.value = 0;
        currentFilter.value = doc.pages[0]?.filter || 'original';
        brightness.value = doc.pages[0]?.brightness || 100;
        contrast.value = doc.pages[0]?.contrast || 100;
        view.value = 'editor';
        nextTick(() => renderPreview());
      }

      function selectPage(idx) {
        activePageIdx.value = idx;
        const p = activePage.value;
        if (p) {
          currentFilter.value = p.filter || 'original';
          brightness.value = p.brightness || 100;
          contrast.value = p.contrast || 100;
        }
        renderPreview();
      }

      function deleteDocument(docId) {
        documents.value = documents.value.filter(d => d.id !== docId);
        if (activeDocId.value === docId) {
          activeDocId.value = null;
          activePageIdx.value = 0;
          view.value = 'home';
        }
        saveDocuments();
      }

      function deletePage() {
        const doc = activeDoc.value;
        if (!doc) return;
        doc.pages.splice(activePageIdx.value, 1);
        if (!doc.pages.length) {
          deleteDocument(doc.id);
          return;
        }
        if (activePageIdx.value >= doc.pages.length) activePageIdx.value = doc.pages.length - 1;
        saveDocuments();
        renderPreview();
      }

      function startRename(doc) {
        renameDocId.value = doc.id;
        renameInput.value = doc.title;
        renameDialog.value = true;
      }

      function confirmRename() {
        if (!renameInput.value.trim()) return;
        const doc = documents.value.find(d => d.id === renameDocId.value);
        if (doc) doc.title = renameInput.value.trim();
        renameDialog.value = false;
        saveDocuments();
      }

      // ── Download ──
      function downloadImage() {
        if (!activePage.value) return;
        const a = document.createElement('a');
        a.href = activePage.value.filtered;
        a.download = (activeDoc.value?.title || 'scan') + '_page' + (activePageIdx.value + 1) + '.png';
        a.click();
      }

      function downloadPdf() {
        const doc = activeDoc.value;
        if (!doc || !doc.pages.length) return;
        processing.value = true;

        // Build a simple PDF with embedded images
        const promises = doc.pages.map(p => {
          return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve({ width: img.width, height: img.height, data: p.filtered });
            img.src = p.filtered;
          });
        });

        Promise.all(promises).then(pages => {
          // Minimal PDF generator
          let pdf = '%PDF-1.4\n';
          const objects = [];
          let objNum = 1;

          // Catalog
          const catalogNum = objNum++;
          objects.push({ num: catalogNum, data: '<< /Type /Catalog /Pages ' + (objNum) + ' 0 R >>' });
          const pagesNum = objNum++;

          const pageObjs = [];
          const imgObjs = [];

          for (let i = 0; i < pages.length; i++) {
            const pg = pages[i];
            // Scale to A4-ish (595x842)
            const scale = Math.min(595 / pg.width, 842 / pg.height);
            const w = Math.round(pg.width * scale);
            const h = Math.round(pg.height * scale);

            const imgObjNum = objNum++;
            // Extract raw image data from base64
            const base64 = pg.data.split(',')[1];
            const imgStream = 'q ' + w + ' 0 0 ' + h + ' 0 0 cm /Img' + i + ' Do Q';

            const pageObjNum = objNum++;
            const contentObjNum = objNum++;

            imgObjs.push({ num: imgObjNum, data: '<< /Type /XObject /Subtype /Image /Width ' + pg.width + ' /Height ' + pg.height + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + atob(base64).length + ' >>', stream: base64, isImage: true });
            objects.push({ num: contentObjNum, data: '<< /Length ' + imgStream.length + ' >>', stream: imgStream });
            pageObjs.push({ num: pageObjNum, data: '<< /Type /Page /Parent ' + pagesNum + ' 0 R /MediaBox [0 0 ' + w + ' ' + h + '] /Contents ' + contentObjNum + ' 0 R /Resources << /XObject << /Img' + i + ' ' + imgObjNum + ' 0 R >> >> >>' });
          }

          objects.push({ num: pagesNum, data: '<< /Type /Pages /Kids [' + pageObjs.map(p => p.num + ' 0 R').join(' ') + '] /Count ' + pageObjs.length + ' >>' });

          for (const po of pageObjs) objects.push(po);
          for (const io of imgObjs) objects.push(io);

          // Instead of minimal PDF, use canvas to create pages and download as multi-image
          // Actually let's do a simpler approach: blob download
          processing.value = false;

          // Use a simpler approach: download pages as individual images in a zip-like manner
          // Or just download them one by one for now
          // Best approach: use canvas to combine and download as single image per page
          for (let i = 0; i < pages.length; i++) {
            const a = document.createElement('a');
            a.href = pages[i].data;
            a.download = (doc.title || 'scan') + '_page' + (i + 1) + '.png';
            a.click();
          }
        });
      }

      function goHome() {
        stopCamera();
        capturedImage.value = null;
        cropMode.value = false;
        view.value = 'home';
      }

      // ── Lifecycle ──
      onMounted(async () => {
        await loadDocuments();
        window.addEventListener('locale-changed', onLocaleChanged);
      });

      onUnmounted(() => {
        stopCamera();
        window.removeEventListener('locale-changed', onLocaleChanged);
      });

      return {
        L, view, documents, activeDocId, activeDoc, activePageIdx, activePage,
        processing, cameraActive, cameraError, videoEl, canvasEl, capturedImage,
        currentFilter, cropMode, cropRect, brightness, contrast,
        editorCanvasEl, previewCanvasEl,
        renameDialog, renameInput,
        startCamera, stopCamera, switchCamera, capturePhoto, retakePhoto,
        triggerUpload, addCapturedToDoc,
        setFilter, adjustImage, rotatePage,
        startCrop, cancelCrop, applyCropAction,
        onCropMouseDown, onCropMouseMove, onCropMouseUp,
        newDocument, openDocument, selectPage,
        deleteDocument, deletePage, startRename, confirmRename,
        downloadImage, downloadPdf, goHome
      };
    }
  };
})(Vue);
