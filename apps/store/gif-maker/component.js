(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, watch, nextTick } = Vue;

  const LANGS = {
    tr: {
      addImages:'Resim Ekle', fromVideo:'Videodan', fromFiles:'Dosyalardan', frames:'Kareler', delay:'Gecikme',
      width:'Genişlik', height:'Yükseklik', keepAspect:'Oranı Koru', quality:'Kalite',
      best:'En İyi', good:'İyi', fast:'Hızlı', generate:'GIF Oluştur', generateServer:'Sunucuda Oluştur',
      download:'İndir', saveToFiles:'Dosyalara Kaydet', close:'Kapat', cancel:'İptal',
      dropHint:'Resimleri sürükleyin veya yukarıdan ekleyin',
      emptyHint:'GIF oluşturmak için en az 2 resim ekleyin',
      extractFrames:'Video Karelerini Çıkar', startTime:'Başlangıç', endTime:'Bitiş',
      duration:'Süre', extract:'Çıkar', reverse:'Ters Çevir', clearAll:'Tümünü Temizle',
      browseFiles:'Dosya Gözat', selectImages:'Resimleri Seç', addSelected:'Seçilenleri Ekle',
      serverMode:'Sunucu', clientMode:'Tarayıcı', generating:'Oluşturuluyor...',
      parentDir:'Üst Klasör', noImages:'Bu klasörde resim yok'
    },
    en: {
      addImages:'Add Images', fromVideo:'From Video', fromFiles:'From Files', frames:'Frames', delay:'Delay',
      width:'Width', height:'Height', keepAspect:'Keep Aspect', quality:'Quality',
      best:'Best', good:'Good', fast:'Fast', generate:'Generate GIF', generateServer:'Generate on Server',
      download:'Download', saveToFiles:'Save to Files', close:'Close', cancel:'Cancel',
      dropHint:'Drag images here or add from toolbar',
      emptyHint:'Add at least 2 images to create a GIF',
      extractFrames:'Extract Video Frames', startTime:'Start', endTime:'End',
      duration:'Duration', extract:'Extract', reverse:'Reverse', clearAll:'Clear All',
      browseFiles:'Browse Files', selectImages:'Select Images', addSelected:'Add Selected',
      serverMode:'Server', clientMode:'Browser', generating:'Generating...',
      parentDir:'Parent Folder', noImages:'No images in this folder'
    },
    de: {
      addImages:'Bilder hinzufügen', fromVideo:'Aus Video', fromFiles:'Aus Dateien', frames:'Frames', delay:'Verzögerung',
      width:'Breite', height:'Höhe', keepAspect:'Seitenverhältnis', quality:'Qualität',
      best:'Beste', good:'Gut', fast:'Schnell', generate:'GIF erstellen', generateServer:'Server-GIF',
      download:'Herunterladen', saveToFiles:'In Dateien speichern', close:'Schließen', cancel:'Abbrechen',
      dropHint:'Bilder hierher ziehen oder oben hinzufügen',
      emptyHint:'Mindestens 2 Bilder hinzufügen',
      extractFrames:'Video-Frames extrahieren', startTime:'Start', endTime:'Ende',
      duration:'Dauer', extract:'Extrahieren', reverse:'Umkehren', clearAll:'Alle löschen',
      browseFiles:'Dateien durchsuchen', selectImages:'Bilder auswählen', addSelected:'Auswahl hinzufügen',
      serverMode:'Server', clientMode:'Browser', generating:'Wird erstellt...',
      parentDir:'Übergeordneter Ordner', noImages:'Keine Bilder in diesem Ordner'
    },
    fr: {
      addImages:'Ajouter des images', fromVideo:'Depuis vidéo', fromFiles:'Depuis fichiers', frames:'Images', delay:'Délai',
      width:'Largeur', height:'Hauteur', keepAspect:'Garder ratio', quality:'Qualité',
      best:'Meilleure', good:'Bonne', fast:'Rapide', generate:'Créer GIF', generateServer:'Créer sur serveur',
      download:'Télécharger', saveToFiles:'Enregistrer', close:'Fermer', cancel:'Annuler',
      dropHint:'Glissez des images ici ou ajoutez depuis la barre',
      emptyHint:'Ajoutez au moins 2 images pour créer un GIF',
      extractFrames:'Extraire les images vidéo', startTime:'Début', endTime:'Fin',
      duration:'Durée', extract:'Extraire', reverse:'Inverser', clearAll:'Tout supprimer',
      browseFiles:'Parcourir fichiers', selectImages:'Sélectionner images', addSelected:'Ajouter sélection',
      serverMode:'Serveur', clientMode:'Navigateur', generating:'Création en cours...',
      parentDir:'Dossier parent', noImages:'Pas d\'images dans ce dossier'
    },
    es: {
      addImages:'Añadir imágenes', fromVideo:'Desde vídeo', fromFiles:'Desde archivos', frames:'Cuadros', delay:'Retardo',
      width:'Ancho', height:'Alto', keepAspect:'Mantener proporción', quality:'Calidad',
      best:'Mejor', good:'Buena', fast:'Rápida', generate:'Crear GIF', generateServer:'Crear en servidor',
      download:'Descargar', saveToFiles:'Guardar en archivos', close:'Cerrar', cancel:'Cancelar',
      dropHint:'Arrastra imágenes aquí o añade desde la barra',
      emptyHint:'Añade al menos 2 imágenes para crear un GIF',
      extractFrames:'Extraer cuadros de vídeo', startTime:'Inicio', endTime:'Fin',
      duration:'Duración', extract:'Extraer', reverse:'Invertir', clearAll:'Borrar todo',
      browseFiles:'Explorar archivos', selectImages:'Seleccionar imágenes', addSelected:'Añadir selección',
      serverMode:'Servidor', clientMode:'Navegador', generating:'Generando...',
      parentDir:'Carpeta superior', noImages:'No hay imágenes en esta carpeta'
    },
    ru: {
      addImages:'Добавить изображения', fromVideo:'Из видео', fromFiles:'Из файлов', frames:'Кадры', delay:'Задержка',
      width:'Ширина', height:'Высота', keepAspect:'Сохранять пропорции', quality:'Качество',
      best:'Лучшее', good:'Хорошее', fast:'Быстро', generate:'Создать GIF', generateServer:'Создать на сервере',
      download:'Скачать', saveToFiles:'Сохранить в файлы', close:'Закрыть', cancel:'Отмена',
      dropHint:'Перетащите изображения или добавьте с панели',
      emptyHint:'Добавьте минимум 2 изображения для создания GIF',
      extractFrames:'Извлечь кадры из видео', startTime:'Начало', endTime:'Конец',
      duration:'Длительность', extract:'Извлечь', reverse:'Реверс', clearAll:'Очистить всё',
      browseFiles:'Обзор файлов', selectImages:'Выбрать изображения', addSelected:'Добавить выбранные',
      serverMode:'Сервер', clientMode:'Браузер', generating:'Создание...',
      parentDir:'Родительская папка', noImages:'Нет изображений в этой папке'
    },
    zh: {
      addImages:'添加图片', fromVideo:'从视频', fromFiles:'从文件', frames:'帧', delay:'延迟',
      width:'宽度', height:'高度', keepAspect:'保持比例', quality:'质量',
      best:'最佳', good:'良好', fast:'快速', generate:'生成GIF', generateServer:'服务器生成',
      download:'下载', saveToFiles:'保存到文件', close:'关闭', cancel:'取消',
      dropHint:'拖放图片到此处或从工具栏添加',
      emptyHint:'添加至少2张图片来创建GIF',
      extractFrames:'提取视频帧', startTime:'开始', endTime:'结束',
      duration:'时长', extract:'提取', reverse:'反转', clearAll:'清除全部',
      browseFiles:'浏览文件', selectImages:'选择图片', addSelected:'添加所选',
      serverMode:'服务器', clientMode:'浏览器', generating:'生成中...',
      parentDir:'上级目录', noImages:'此文件夹没有图片'
    },
    ja: {
      addImages:'画像を追加', fromVideo:'動画から', fromFiles:'ファイルから', frames:'フレーム', delay:'遅延',
      width:'幅', height:'高さ', keepAspect:'比率を維持', quality:'品質',
      best:'最高', good:'良好', fast:'高速', generate:'GIF作成', generateServer:'サーバーで作成',
      download:'ダウンロード', saveToFiles:'ファイルに保存', close:'閉じる', cancel:'キャンセル',
      dropHint:'画像をドラッグするかツールバーから追加',
      emptyHint:'GIFを作成するには2枚以上の画像を追加してください',
      extractFrames:'動画フレームを抽出', startTime:'開始', endTime:'終了',
      duration:'長さ', extract:'抽出', reverse:'反転', clearAll:'すべて削除',
      browseFiles:'ファイル参照', selectImages:'画像を選択', addSelected:'選択を追加',
      serverMode:'サーバー', clientMode:'ブラウザ', generating:'生成中...',
      parentDir:'親フォルダ', noImages:'このフォルダに画像がありません'
    },
    it: {
      addImages:'Aggiungi immagini', fromVideo:'Da video', fromFiles:'Da file', frames:'Fotogrammi', delay:'Ritardo',
      width:'Larghezza', height:'Altezza', keepAspect:'Mantieni proporzioni', quality:'Qualità',
      best:'Migliore', good:'Buona', fast:'Veloce', generate:'Crea GIF', generateServer:'Crea su server',
      download:'Scarica', saveToFiles:'Salva nei file', close:'Chiudi', cancel:'Annulla',
      dropHint:'Trascina immagini qui o aggiungi dalla barra',
      emptyHint:'Aggiungi almeno 2 immagini per creare un GIF',
      extractFrames:'Estrai fotogrammi video', startTime:'Inizio', endTime:'Fine',
      duration:'Durata', extract:'Estrai', reverse:'Inverti', clearAll:'Cancella tutto',
      browseFiles:'Sfoglia file', selectImages:'Seleziona immagini', addSelected:'Aggiungi selezione',
      serverMode:'Server', clientMode:'Browser', generating:'Creazione...',
      parentDir:'Cartella superiore', noImages:'Nessuna immagine in questa cartella'
    },
    ar: {
      addImages:'إضافة صور', fromVideo:'من فيديو', fromFiles:'من ملفات', frames:'إطارات', delay:'تأخير',
      width:'العرض', height:'الارتفاع', keepAspect:'حفظ النسبة', quality:'الجودة',
      best:'الأفضل', good:'جيدة', fast:'سريعة', generate:'إنشاء GIF', generateServer:'إنشاء على الخادم',
      download:'تنزيل', saveToFiles:'حفظ في الملفات', close:'إغلاق', cancel:'إلغاء',
      dropHint:'اسحب الصور هنا أو أضفها من شريط الأدوات',
      emptyHint:'أضف صورتين على الأقل لإنشاء GIF',
      extractFrames:'استخراج إطارات الفيديو', startTime:'البداية', endTime:'النهاية',
      duration:'المدة', extract:'استخراج', reverse:'عكس', clearAll:'مسح الكل',
      browseFiles:'تصفح الملفات', selectImages:'اختيار الصور', addSelected:'إضافة المحدد',
      serverMode:'الخادم', clientMode:'المتصفح', generating:'جاري الإنشاء...',
      parentDir:'المجلد الأعلى', noImages:'لا توجد صور في هذا المجلد'
    },
    ko: {
      addImages:'이미지 추가', fromVideo:'비디오에서', fromFiles:'파일에서', frames:'프레임', delay:'지연',
      width:'너비', height:'높이', keepAspect:'비율 유지', quality:'품질',
      best:'최고', good:'좋음', fast:'빠름', generate:'GIF 생성', generateServer:'서버에서 생성',
      download:'다운로드',
      saveToFiles:'파일에 저장', close:'닫기', cancel:'취소',
      dropHint:'이미지를 끌어다 놓거나 툴바에서 추가하세요',
      emptyHint:'GIF를 만들려면 최소 2개의 이미지를 추가하세요',
      extractFrames:'비디오 프레임 추출', startTime:'시작', endTime:'끝',
      duration:'길이', extract:'추출', reverse:'뒤집기', clearAll:'모두 지우기',
      browseFiles:'파일 찾아보기', selectImages:'이미지 선택', addSelected:'선택 항목 추가',
      serverMode:'서버', clientMode:'브라우저', generating:'생성 중...',
      parentDir:'상위 폴더', noImages:'이 폴더에 이미지가 없습니다'
    },
    hi: {
      addImages:'चित्र जोड़ें', fromVideo:'वीडियो से', fromFiles:'फ़ाइलों से', frames:'फ्रेम', delay:'देरी',
      width:'चौड़ाई', height:'ऊँचाई', keepAspect:'अनुपात रखें', quality:'गुणवत्ता',
      best:'सर्वश्रेष्ठ', good:'अच्छी', fast:'तेज़', generate:'GIF बनाएं', generateServer:'सर्वर पर बनाएं',
      download:'डाउनलोड', saveToFiles:'फ़ाइलों में सहेजें', close:'बंद करें', cancel:'रद्द करें',
      dropHint:'यहां चित्र खींचें या टूलबार से जोड़ें',
      emptyHint:'GIF बनाने के लिए कम से कम 2 चित्र जोड़ें',
      extractFrames:'वीडियो फ्रेम निकालें', startTime:'शुरू', endTime:'अंत',
      duration:'अवधि', extract:'निकालें', reverse:'उलटें', clearAll:'सब हटाएं',
      browseFiles:'फ़ाइलें ब्राउज़ करें', selectImages:'चित्र चुनें', addSelected:'चयनित जोड़ें',
      serverMode:'सर्वर', clientMode:'ब्राउज़र', generating:'बना रहा है...',
      parentDir:'ऊपरी फ़ोल्डर', noImages:'इस फ़ोल्डर में कोई चित्र नहीं'
    },
    pt: {
      addImages:'Adicionar imagens', fromVideo:'De vídeo', fromFiles:'De arquivos', frames:'Quadros', delay:'Atraso',
      width:'Largura', height:'Altura', keepAspect:'Manter proporção', quality:'Qualidade',
      best:'Melhor', good:'Boa', fast:'Rápida', generate:'Criar GIF', generateServer:'Criar no servidor',
      download:'Baixar', saveToFiles:'Salvar em arquivos', close:'Fechar', cancel:'Cancelar',
      dropHint:'Arraste imagens aqui ou adicione pela barra',
      emptyHint:'Adicione pelo menos 2 imagens para criar um GIF',
      extractFrames:'Extrair quadros do vídeo', startTime:'Início', endTime:'Fim',
      duration:'Duração', extract:'Extrair', reverse:'Inverter', clearAll:'Limpar tudo',
      browseFiles:'Procurar arquivos', selectImages:'Selecionar imagens', addSelected:'Adicionar seleção',
      serverMode:'Servidor', clientMode:'Navegador', generating:'Gerando...',
      parentDir:'Pasta pai', noImages:'Nenhuma imagem nesta pasta'
    }
  };

  function getLocale() {
    try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; }
  }

  // Minimal GIF encoder (GIF89a)
  function GIFEncoder(w, h, quality) {
    const width = w, height = h;
    const pages = [];
    let palSize = 7; // 2^(palSize+1) = 256 colors

    function analyzePixels(pixels, q) {
      // Simple median-cut color quantization
      const nq = new NeuQuant(pixels, pixels.length, q || 10);
      nq.init();
      const colorTab = nq.getColorMap();
      const indexedPixels = new Uint8Array(width * height);
      let k = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        const idx = nq.lookupRGB(pixels[i], pixels[i+1], pixels[i+2]);
        indexedPixels[k++] = idx;
      }
      return { colorTab, indexedPixels };
    }

    return {
      addFrame(ctx, delay) {
        const imageData = ctx.getImageData(0, 0, width, height);
        pages.push({ data: imageData.data, delay: delay || 100 });
      },
      async render(progressCb) {
        // Use gif.js worker-based encoder
        return new Promise((resolve, reject) => {
          const gif = new GIF({
            workers: 2,
            quality: quality || 10,
            width, height,
            workerScript: gifWorkerUrl
          });
          pages.forEach((page, i) => {
            const canvas = document.createElement('canvas');
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext('2d');
            const imgData = ctx.createImageData(width, height);
            imgData.data.set(page.data);
            ctx.putImageData(imgData, 0, 0);
            gif.addFrame(canvas, { delay: page.delay, copy: true });
          });
          gif.on('progress', p => { if (progressCb) progressCb(Math.round(p * 100)); });
          gif.on('finished', blob => resolve(blob));
          gif.on('error', reject);
          gif.render();
        });
      }
    };
  }

  // gif.js worker blob URL
  let gifWorkerUrl = null;
  function ensureGifJs() {
    return new Promise((resolve, reject) => {
      if (window.GIF) { resolve(); return; }
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js';
      s.onload = () => {
        // Create worker blob from CDN
        fetch('https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js')
          .then(r => r.blob())
          .then(blob => {
            gifWorkerUrl = URL.createObjectURL(blob);
            resolve();
          }).catch(reject);
      };
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  let nextId = 1;

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      const frames = ref([]);
      const selectedFrame = ref(0);
      const globalDelay = ref(200);
      const outputWidth = ref(480);
      const outputHeight = ref(320);
      const keepAspect = ref(true);
      const quality = ref(10);
      const generating = ref(false);
      const progress = ref(0);
      const outputUrl = ref(null);
      const outputSize = ref('');
      const playing = ref(false);
      const previewIdx = ref(0);
      const dragOver = ref(false);

      // Video modal
      const showVideoModal = ref(false);
      const videoSrc = ref('');
      const videoDuration = ref(0);
      const videoStart = ref(0);
      const videoEnd = ref(0);
      const videoFps = ref(10);
      const maxFrames = ref(50);
      const extracting = ref(false);
      const extractProgress = ref(0);

      const imageInput = ref(null);
      const videoInput = ref(null);
      const videoEl = ref(null);
      const framesList = ref(null);

      // Server-side generation mode
      const useServer = ref(false);
      // File browser
      const showFileBrowser = ref(false);
      const browsePath = ref('');
      const browseItems = ref({ folders: [], images: [] });
      const browseSelected = ref([]);
      const browseLoading = ref(false);

      let previewTimer = null;
      let aspectRatio = 1.5;

      const estimatedFrames = computed(() => {
        const dur = (videoEnd.value - videoStart.value);
        if (dur <= 0) return 0;
        return Math.min(Math.ceil(dur * videoFps.value), maxFrames.value);
      });

      watch(keepAspect, (v) => {
        if (v && frames.value.length) recalcAspect();
      });

      watch(outputWidth, (w) => {
        if (keepAspect.value) outputHeight.value = Math.round(w / aspectRatio);
      });

      function recalcAspect() {
        aspectRatio = outputWidth.value / outputHeight.value;
      }

      function triggerImageUpload() { imageInput.value?.click(); }
      function triggerVideoUpload() { videoInput.value?.click(); }

      function loadImage(src) {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      }

      function createThumb(img, maxW, maxH) {
        const c = document.createElement('canvas');
        let w = img.width || img.videoWidth, h = img.height || img.videoHeight;
        const scale = Math.min(maxW / w, maxH / h, 1);
        c.width = Math.round(w * scale);
        c.height = Math.round(h * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        return c.toDataURL('image/jpeg', 0.7);
      }

      async function onImagesSelected(e) {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        for (const file of files) {
          const url = URL.createObjectURL(file);
          try {
            const img = await loadImage(url);
            if (frames.value.length === 0) {
              aspectRatio = img.width / img.height;
              outputWidth.value = Math.min(img.width, 480);
              outputHeight.value = Math.round(outputWidth.value / aspectRatio);
            }
            frames.value.push({
              id: nextId++,
              src: url,
              thumb: createThumb(img, 120, 90),
              delay: globalDelay.value,
              width: img.width,
              height: img.height,
              imgEl: img
            });
          } catch { /* skip invalid */ }
        }
        outputUrl.value = null;
        e.target.value = '';
      }

      function onVideoSelected(e) {
        const file = e.target.files[0];
        if (!file) return;
        videoSrc.value = URL.createObjectURL(file);
        showVideoModal.value = true;
        videoStart.value = 0;
        videoEnd.value = 0;
        videoDuration.value = 0;
        e.target.value = '';
      }

      function onVideoLoaded() {
        const v = videoEl.value;
        if (!v) return;
        videoDuration.value = v.duration;
        videoEnd.value = Math.min(v.duration, 5);
      }

      async function extractVideoFrames() {
        const v = videoEl.value;
        if (!v) return;
        extracting.value = true;
        extractProgress.value = 0;

        const start = videoStart.value;
        const end = videoEnd.value;
        const fps = videoFps.value;
        const max = maxFrames.value;
        const dur = end - start;
        if (dur <= 0) { extracting.value = false; return; }

        const totalFrames = Math.min(Math.ceil(dur * fps), max);
        const interval = dur / totalFrames;

        const canvas = document.createElement('canvas');
        canvas.width = v.videoWidth;
        canvas.height = v.videoHeight;
        const ctx = canvas.getContext('2d');

        if (frames.value.length === 0) {
          aspectRatio = v.videoWidth / v.videoHeight;
          outputWidth.value = Math.min(v.videoWidth, 480);
          outputHeight.value = Math.round(outputWidth.value / aspectRatio);
        }

        for (let i = 0; i < totalFrames; i++) {
          const time = start + i * interval;
          await seekVideo(v, time);
          ctx.drawImage(v, 0, 0);
          const img = await loadImage(canvas.toDataURL('image/png'));
          frames.value.push({
            id: nextId++,
            src: canvas.toDataURL('image/png'),
            thumb: createThumb(v, 120, 90),
            delay: Math.round(1000 / fps),
            width: v.videoWidth,
            height: v.videoHeight,
            imgEl: img
          });
          extractProgress.value = Math.round(((i + 1) / totalFrames) * 100);
        }

        extracting.value = false;
        showVideoModal.value = false;
        outputUrl.value = null;
      }

      function seekVideo(video, time) {
        return new Promise((resolve) => {
          video.currentTime = time;
          video.onseeked = () => resolve();
        });
      }

      async function onDrop(e) {
        dragOver.value = false;
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (!files.length) return;
        for (const file of files) {
          const url = URL.createObjectURL(file);
          try {
            const img = await loadImage(url);
            if (frames.value.length === 0) {
              aspectRatio = img.width / img.height;
              outputWidth.value = Math.min(img.width, 480);
              outputHeight.value = Math.round(outputWidth.value / aspectRatio);
            }
            frames.value.push({
              id: nextId++,
              src: url,
              thumb: createThumb(img, 120, 90),
              delay: globalDelay.value,
              width: img.width,
              height: img.height,
              imgEl: img
            });
          } catch { /* skip */ }
        }
        outputUrl.value = null;
      }

      function moveFrame(idx, dir) {
        const arr = frames.value;
        const ni = idx + dir;
        if (ni < 0 || ni >= arr.length) return;
        [arr[idx], arr[ni]] = [arr[ni], arr[idx]];
        selectedFrame.value = ni;
      }

      function duplicateFrame(idx) {
        const f = frames.value[idx];
        frames.value.splice(idx + 1, 0, { ...f, id: nextId++ });
      }

      function removeFrame(idx) {
        frames.value.splice(idx, 1);
        if (selectedFrame.value >= frames.value.length) selectedFrame.value = Math.max(0, frames.value.length - 1);
      }

      function reverseFrames() { frames.value.reverse(); }
      function clearFrames() { frames.value = []; outputUrl.value = null; selectedFrame.value = 0; }

      // Preview animation
      function togglePreview() {
        playing.value = !playing.value;
        if (playing.value) startPreview();
        else stopPreview();
      }

      function startPreview() {
        stopPreview();
        if (!frames.value.length) return;
        function step() {
          if (!playing.value || !frames.value.length) return;
          const delay = frames.value[previewIdx.value]?.delay || globalDelay.value;
          previewTimer = setTimeout(() => {
            previewIdx.value = (previewIdx.value + 1) % frames.value.length;
            step();
          }, delay);
        }
        step();
      }

      function stopPreview() {
        if (previewTimer) { clearTimeout(previewTimer); previewTimer = null; }
      }

      async function generateGif() {
        if (frames.value.length < 2 || generating.value) return;
        generating.value = true;
        progress.value = 0;
        stopPreview();
        playing.value = false;

        try {
          await ensureGifJs();

          const w = outputWidth.value;
          const h = outputHeight.value;

          const gif = new GIF({
            workers: 2,
            quality: quality.value,
            width: w,
            height: h,
            workerScript: gifWorkerUrl
          });

          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');

          for (const frame of frames.value) {
            ctx.clearRect(0, 0, w, h);
            const img = frame.imgEl || await loadImage(frame.src);
            // Draw fitted
            const sx = w / img.width, sy = h / img.height;
            const scale = Math.min(sx, sy);
            const dw = img.width * scale, dh = img.height * scale;
            const dx = (w - dw) / 2, dy = (h - dh) / 2;
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, w, h);
            ctx.drawImage(img, dx, dy, dw, dh);
            gif.addFrame(ctx, { delay: frame.delay, copy: true });
          }

          gif.on('progress', p => { progress.value = Math.round(p * 100); });

          const blob = await new Promise((resolve, reject) => {
            gif.on('finished', resolve);
            gif.on('error', reject);
            gif.render();
          });

          if (outputUrl.value) URL.revokeObjectURL(outputUrl.value);
          outputUrl.value = URL.createObjectURL(blob);
          outputSize.value = formatSize(blob.size);
        } catch (err) {
          console.error('GIF generation failed:', err);
        } finally {
          generating.value = false;
        }
      }

      function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
      }

      function downloadGif() {
        if (!outputUrl.value) return;
        const a = document.createElement('a');
        a.href = outputUrl.value;
        a.download = 'animation_' + Date.now() + '.gif';
        a.click();
      }

      async function saveToFiles() {
        if (!outputUrl.value || !window.FileDialog) return;
        try {
          const resp = await fetch(outputUrl.value);
          const blob = await resp.blob();
          const reader = new FileReader();
          const base64 = await new Promise(resolve => {
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(blob);
          });
          const result = await window.FileDialog.show({
            title: 'Save GIF',
            mode: 'save',
            filters: ['.gif'],
            defaultName: 'animation_' + Date.now() + '.gif'
          });
          if (!result) return;
          const token = localStorage.getItem('auth_token') || '';
          await fetch('/api/fs/write', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: result.path, content: base64, encoding: 'base64' })
          });
        } catch (err) { console.error('Save failed:', err); }
      }

      // ── Server-side file browsing & generation ──
      function getToken() { return localStorage.getItem('auth_token') || ''; }

      async function openFileBrowser() {
        showFileBrowser.value = true;
        browseSelected.value = [];
        await browseDir('');
      }

      async function browseDir(dirPath) {
        browseLoading.value = true;
        try {
          const res = await fetch('/api/gif-maker/browse-images?path=' + encodeURIComponent(dirPath), {
            headers: { 'Authorization': 'Bearer ' + getToken() }
          });
          const data = await res.json();
          browseItems.value = data;
          browsePath.value = data.currentPath || '';
        } catch (e) { console.error('Browse failed:', e); }
        finally { browseLoading.value = false; }
      }

      function browseGoUp() {
        const parts = browsePath.value.split('/').filter(Boolean);
        parts.pop();
        browseDir(parts.join('/'));
      }

      function toggleBrowseSelect(imgPath) {
        const idx = browseSelected.value.indexOf(imgPath);
        if (idx >= 0) browseSelected.value.splice(idx, 1);
        else browseSelected.value.push(imgPath);
      }

      async function addBrowseSelected() {
        if (!browseSelected.value.length) return;
        for (const imgPath of browseSelected.value) {
          try {
            const res = await fetch('/api/gif-maker/image-thumb?path=' + encodeURIComponent(imgPath), {
              headers: { 'Authorization': 'Bearer ' + getToken() }
            });
            const data = await res.json();
            if (frames.value.length === 0) {
              aspectRatio = data.width / data.height;
              outputWidth.value = Math.min(data.width, 480);
              outputHeight.value = Math.round(outputWidth.value / aspectRatio);
            }
            frames.value.push({
              id: nextId++,
              src: null,
              serverPath: imgPath,
              thumb: data.thumb,
              delay: globalDelay.value,
              width: data.width,
              height: data.height,
              imgEl: null
            });
          } catch { /* skip */ }
        }
        showFileBrowser.value = false;
        browseSelected.value = [];
        outputUrl.value = null;
      }

      async function generateGifServer() {
        if (frames.value.length < 2 || generating.value) return;
        generating.value = true;
        progress.value = 0;
        stopPreview();
        playing.value = false;

        try {
          const images = [];
          const delays = [];

          for (const frame of frames.value) {
            if (frame.serverPath) {
              images.push(frame.serverPath);
            } else if (frame.src) {
              // Convert blob URL to base64 data URI
              const resp = await fetch(frame.src);
              const blob = await resp.blob();
              const base64 = await new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(blob);
              });
              images.push(base64);
            }
            delays.push(frame.delay);
          }

          progress.value = 30;

          const res = await fetch('/api/gif-maker/generate', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' },
            body: JSON.stringify({
              images,
              delays,
              width: outputWidth.value,
              height: outputHeight.value,
              quality: quality.value,
              globalDelay: globalDelay.value
            })
          });

          progress.value = 80;
          const data = await res.json();
          if (!data.ok) throw new Error(data.error || 'Server error');

          if (outputUrl.value) URL.revokeObjectURL(outputUrl.value);
          // Convert base64 data URI to blob URL for display
          const resp2 = await fetch(data.gif);
          const blob = await resp2.blob();
          outputUrl.value = URL.createObjectURL(blob);
          outputSize.value = formatSize(data.size);
          progress.value = 100;
        } catch (err) {
          console.error('Server GIF generation failed:', err);
        } finally {
          generating.value = false;
        }
      }

      async function saveToFilesServer() {
        if (!outputUrl.value) return;
        try {
          const result = await window.FileDialog.show({
            title: 'Save GIF',
            mode: 'save',
            filters: ['.gif'],
            defaultName: 'animation_' + Date.now() + '.gif'
          });
          if (!result) return;

          const resp = await fetch(outputUrl.value);
          const blob = await resp.blob();
          const reader = new FileReader();
          const dataUri = await new Promise(resolve => {
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });

          await fetch('/api/gif-maker/save', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath: result.path, data: dataUri })
          });
        } catch (err) { console.error('Save failed:', err); }
      }

      // Locale change listener
      function onLocaleChanged() { locale.value = getLocale(); }

      onMounted(() => {
        window.addEventListener('locale-changed', onLocaleChanged);
        ensureGifJs().catch(() => {});
      });

      onUnmounted(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
        stopPreview();
        if (outputUrl.value) URL.revokeObjectURL(outputUrl.value);
        if (gifWorkerUrl) { URL.revokeObjectURL(gifWorkerUrl); gifWorkerUrl = null; }
      });

      return {
        locale, L, frames, selectedFrame, globalDelay, outputWidth, outputHeight,
        keepAspect, quality, generating, progress, outputUrl, outputSize,
        playing, previewIdx, dragOver,
        showVideoModal, videoSrc, videoDuration, videoStart, videoEnd,
        videoFps, maxFrames, extracting, extractProgress, estimatedFrames,
        imageInput, videoInput, videoEl, framesList,
        useServer, showFileBrowser, browsePath, browseItems, browseSelected, browseLoading,
        triggerImageUpload, triggerVideoUpload, openFileBrowser,
        browseDir, browseGoUp, toggleBrowseSelect, addBrowseSelected,
        onImagesSelected, onVideoSelected, onVideoLoaded, extractVideoFrames,
        onDrop, moveFrame, duplicateFrame, removeFrame, reverseFrames, clearFrames,
        togglePreview, generateGif, generateGifServer, downloadGif, saveToFiles, saveToFilesServer
      };
    }
  };
})(Vue);
