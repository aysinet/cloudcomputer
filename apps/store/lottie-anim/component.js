(function(Vue) {
  const { ref, onMounted, onUnmounted, nextTick, watch, computed } = Vue;

  const LOTTIE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js';
  const SAMPLE_URL = 'https://assets2.lottiefiles.com/packages/lf20_UJNc2t.json';

  const LANGS = {
    tr: {
      openFile: 'Dosya Aç', fromUrl: 'URL\'den Yükle', sample: 'Örnek', loading: 'Yükleniyor...',
      noFile: 'Animasyon yüklenmedi', speed: 'Hız',
      bgColor: 'Arka plan', loop: 'Tekrar', dropHere: 'Lottie JSON dosyasını buraya bırakın',
      emptyTitle: 'Lottie Animasyon Oynatıcı', emptySub: 'JSON dosyası sürükleyin veya Dosya Aç / URL butonunu kullanın',
      loadError: 'Lottie kütüphanesi yüklenemedi', animError: 'Animasyon yüklenemedi', urlPrompt: 'Lottie JSON URL girin:',
      fetchError: 'URL\'den yüklenemedi',
      openLocal: 'Bilgisayardan Aç', openServer: 'Sunucudan Aç',
      save: 'Kaydet', saveJsonLocal: 'JSON İndir (Lokal)', saveJsonServer: 'JSON Sunucuya Kaydet',
      savePngLocal: 'PNG İndir (Lokal)', savePngServer: 'PNG Sunucuya Kaydet',
      quickSave: 'Hızlı Kaydet', saved: 'Kaydedildi', saveError: 'Kaydetme hatası'
    },
    en: {
      openFile: 'Open File', fromUrl: 'From URL', sample: 'Sample', loading: 'Loading...',
      noFile: 'No animation loaded', speed: 'Speed',
      bgColor: 'Background', loop: 'Loop', dropHere: 'Drop Lottie JSON file here',
      emptyTitle: 'Lottie Animation Player', emptySub: 'Drag a JSON file or use Open File / URL button',
      loadError: 'Failed to load Lottie library', animError: 'Failed to load animation', urlPrompt: 'Enter Lottie JSON URL:',
      fetchError: 'Failed to load from URL',
      openLocal: 'Open from Computer', openServer: 'Open from Server',
      save: 'Save', saveJsonLocal: 'Download JSON (Local)', saveJsonServer: 'Save JSON to Server',
      savePngLocal: 'Download PNG (Local)', savePngServer: 'Save PNG to Server',
      quickSave: 'Quick Save', saved: 'Saved', saveError: 'Save failed'
    },
    de: {
      openFile: 'Datei öffnen', fromUrl: 'Von URL', sample: 'Beispiel', loading: 'Laden...',
      noFile: 'Keine Animation geladen', speed: 'Geschwindigkeit',
      bgColor: 'Hintergrund', loop: 'Wiederholen', dropHere: 'Lottie JSON-Datei hierher ziehen',
      emptyTitle: 'Lottie-Animationsplayer', emptySub: 'JSON-Datei ziehen oder Datei öffnen / URL verwenden',
      loadError: 'Lottie-Bibliothek konnte nicht geladen werden', animError: 'Animation konnte nicht geladen werden', urlPrompt: 'Lottie JSON-URL eingeben:',
      fetchError: 'Laden von URL fehlgeschlagen',
      openLocal: 'Vom Computer öffnen', openServer: 'Vom Server öffnen',
      save: 'Speichern', saveJsonLocal: 'JSON herunterladen', saveJsonServer: 'JSON auf Server speichern',
      savePngLocal: 'PNG herunterladen', savePngServer: 'PNG auf Server speichern',
      quickSave: 'Schnellspeichern', saved: 'Gespeichert', saveError: 'Speichern fehlgeschlagen'
    },
    fr: {
      openFile: 'Ouvrir', fromUrl: 'Depuis URL', sample: 'Exemple', loading: 'Chargement...',
      noFile: 'Aucune animation chargée', speed: 'Vitesse',
      bgColor: 'Arrière-plan', loop: 'Boucle', dropHere: 'Déposez le fichier JSON Lottie ici',
      emptyTitle: 'Lecteur d\'animation Lottie', emptySub: 'Glissez un fichier JSON ou utilisez Ouvrir / URL',
      loadError: 'Échec du chargement de la bibliothèque Lottie', animError: 'Échec du chargement de l\'animation', urlPrompt: 'Entrez l\'URL JSON Lottie:',
      fetchError: 'Échec du chargement depuis l\'URL',
      openLocal: 'Depuis l\'ordinateur', openServer: 'Depuis le serveur',
      save: 'Enregistrer', saveJsonLocal: 'Télécharger JSON', saveJsonServer: 'Enregistrer JSON sur serveur',
      savePngLocal: 'Télécharger PNG', savePngServer: 'Enregistrer PNG sur serveur',
      quickSave: 'Sauvegarde rapide', saved: 'Enregistré', saveError: 'Échec de l\'enregistrement'
    },
    es: {
      openFile: 'Abrir', fromUrl: 'Desde URL', sample: 'Ejemplo', loading: 'Cargando...',
      noFile: 'Sin animación cargada', speed: 'Velocidad',
      bgColor: 'Fondo', loop: 'Repetir', dropHere: 'Suelta el archivo JSON Lottie aquí',
      emptyTitle: 'Reproductor de Animación Lottie', emptySub: 'Arrastra un archivo JSON o usa Abrir / URL',
      loadError: 'Error al cargar biblioteca Lottie', animError: 'Error al cargar la animación', urlPrompt: 'Ingresa la URL del JSON Lottie:',
      fetchError: 'Error al cargar desde URL',
      openLocal: 'Desde el equipo', openServer: 'Desde el servidor',
      save: 'Guardar', saveJsonLocal: 'Descargar JSON', saveJsonServer: 'Guardar JSON en servidor',
      savePngLocal: 'Descargar PNG', savePngServer: 'Guardar PNG en servidor',
      quickSave: 'Guardado rápido', saved: 'Guardado', saveError: 'Error al guardar'
    },
    ru: {
      openFile: 'Открыть', fromUrl: 'Из URL', sample: 'Пример', loading: 'Загрузка...',
      noFile: 'Анимация не загружена', speed: 'Скорость',
      bgColor: 'Фон', loop: 'Повтор', dropHere: 'Перетащите JSON-файл Lottie сюда',
      emptyTitle: 'Плеер Lottie-анимации', emptySub: 'Перетащите JSON или нажмите Открыть / URL',
      loadError: 'Не удалось загрузить библиотеку Lottie', animError: 'Не удалось загрузить анимацию', urlPrompt: 'Введите URL Lottie JSON:',
      fetchError: 'Не удалось загрузить из URL',
      openLocal: 'С компьютера', openServer: 'С сервера',
      save: 'Сохранить', saveJsonLocal: 'Скачать JSON', saveJsonServer: 'Сохранить JSON на сервер',
      savePngLocal: 'Скачать PNG', savePngServer: 'Сохранить PNG на сервер',
      quickSave: 'Быстрое сохранение', saved: 'Сохранено', saveError: 'Ошибка сохранения'
    },
    zh: {
      openFile: '打开文件', fromUrl: '从URL加载', sample: '示例', loading: '加载中...',
      noFile: '未加载动画', speed: '速度',
      bgColor: '背景', loop: '循环', dropHere: '将Lottie JSON文件拖放到此处',
      emptyTitle: 'Lottie 动画播放器', emptySub: '拖放JSON文件或使用打开/URL按钮',
      loadError: '加载Lottie库失败', animError: '加载动画失败', urlPrompt: '输入Lottie JSON URL:',
      fetchError: '从URL加载失败',
      openLocal: '从电脑打开', openServer: '从服务器打开',
      save: '保存', saveJsonLocal: '下载JSON', saveJsonServer: '保存JSON到服务器',
      savePngLocal: '下载PNG', savePngServer: '保存PNG到服务器',
      quickSave: '快速保存', saved: '已保存', saveError: '保存失败'
    },
    ja: {
      openFile: 'ファイルを開く', fromUrl: 'URLから', sample: 'サンプル', loading: '読み込み中...',
      noFile: 'アニメーション未読込', speed: '速度',
      bgColor: '背景色', loop: 'ループ', dropHere: 'Lottie JSONファイルをここにドロップ',
      emptyTitle: 'Lottieアニメーションプレーヤー', emptySub: 'JSONファイルをドラッグまたはファイルを開く/URLボタンを使用',
      loadError: 'Lottieライブラリの読み込みに失敗', animError: 'アニメーションの読み込みに失敗', urlPrompt: 'Lottie JSON URLを入力:',
      fetchError: 'URLからの読み込みに失敗',
      openLocal: 'PCから開く', openServer: 'サーバーから開く',
      save: '保存', saveJsonLocal: 'JSONダウンロード', saveJsonServer: 'サーバーにJSON保存',
      savePngLocal: 'PNGダウンロード', savePngServer: 'サーバーにPNG保存',
      quickSave: 'クイック保存', saved: '保存しました', saveError: '保存に失敗'
    },
    it: {
      openFile: 'Apri file', fromUrl: 'Da URL', sample: 'Esempio', loading: 'Caricamento...',
      noFile: 'Nessuna animazione caricata', speed: 'Velocità',
      bgColor: 'Sfondo', loop: 'Ripeti', dropHere: 'Trascina qui il file JSON Lottie',
      emptyTitle: 'Lettore Animazioni Lottie', emptySub: 'Trascina un file JSON o usa Apri / URL',
      loadError: 'Impossibile caricare la libreria Lottie', animError: 'Impossibile caricare l\'animazione', urlPrompt: 'Inserisci l\'URL JSON Lottie:',
      fetchError: 'Impossibile caricare dall\'URL',
      openLocal: 'Dal computer', openServer: 'Dal server',
      save: 'Salva', saveJsonLocal: 'Scarica JSON', saveJsonServer: 'Salva JSON sul server',
      savePngLocal: 'Scarica PNG', savePngServer: 'Salva PNG sul server',
      quickSave: 'Salvataggio rapido', saved: 'Salvato', saveError: 'Salvataggio fallito'
    },
    ar: {
      openFile: 'فتح ملف', fromUrl: 'من رابط', sample: 'مثال', loading: 'جاري التحميل...',
      noFile: 'لم يتم تحميل رسوم متحركة', speed: 'السرعة',
      bgColor: 'الخلفية', loop: 'تكرار', dropHere: 'أسقط ملف Lottie JSON هنا',
      emptyTitle: 'مشغّل رسوم Lottie', emptySub: 'اسحب ملف JSON أو استخدم زر فتح / رابط',
      loadError: 'فشل تحميل مكتبة Lottie', animError: 'فشل تحميل الرسوم المتحركة', urlPrompt: 'أدخل رابط Lottie JSON:',
      fetchError: 'فشل التحميل من الرابط',
      openLocal: 'من الحاسوب', openServer: 'من الخادم',
      save: 'حفظ', saveJsonLocal: 'تنزيل JSON', saveJsonServer: 'حفظ JSON على الخادم',
      savePngLocal: 'تنزيل PNG', savePngServer: 'حفظ PNG على الخادم',
      quickSave: 'حفظ سريع', saved: 'تم الحفظ', saveError: 'فشل الحفظ'
    },
    ko: {
      openFile: '파일 열기', fromUrl: 'URL에서', sample: '샘플', loading: '로딩 중...',
      noFile: '애니메이션 없음', speed: '속도',
      bgColor: '배경색', loop: '반복', dropHere: 'Lottie JSON 파일을 여기에 놓으세요',
      emptyTitle: 'Lottie 애니메이션 플레이어', emptySub: 'JSON 파일을 드래그하거나 열기/URL 버튼 사용',
      loadError: 'Lottie 라이브러리 로드 실패', animError: '애니메이션 로드 실패', urlPrompt: 'Lottie JSON URL 입력:',
      fetchError: 'URL에서 로드 실패',
      openLocal: 'PC에서 열기', openServer: '서버에서 열기',
      save: '저장', saveJsonLocal: 'JSON 다운로드', saveJsonServer: '서버에 JSON 저장',
      savePngLocal: 'PNG 다운로드', savePngServer: '서버에 PNG 저장',
      quickSave: '빠른 저장', saved: '저장됨', saveError: '저장 실패'
    },
    hi: {
      openFile: 'फ़ाइल खोलें', fromUrl: 'URL से', sample: 'नमूना', loading: 'लोड हो रहा है...',
      noFile: 'कोई एनिमेशन लोड नहीं', speed: 'गति',
      bgColor: 'पृष्ठभूमि', loop: 'दोहराएं', dropHere: 'Lottie JSON फ़ाइल यहाँ छोड़ें',
      emptyTitle: 'Lottie एनिमेशन प्लेयर', emptySub: 'JSON फ़ाइल खींचें या खोलें / URL बटन उपयोग करें',
      loadError: 'Lottie लाइब्रेरी लोड विफल', animError: 'एनिमेशन लोड विफल', urlPrompt: 'Lottie JSON URL दर्ज करें:',
      fetchError: 'URL से लोड विफल',
      openLocal: 'कंप्यूटर से खोलें', openServer: 'सर्वर से खोलें',
      save: 'सहेजें', saveJsonLocal: 'JSON डाउनलोड', saveJsonServer: 'सर्वर पर JSON सहेजें',
      savePngLocal: 'PNG डाउनलोड', savePngServer: 'सर्वर पर PNG सहेजें',
      quickSave: 'त्वरित सहेजें', saved: 'सहेजा गया', saveError: 'सहेजना विफल'
    },
    pt: {
      openFile: 'Abrir', fromUrl: 'De URL', sample: 'Exemplo', loading: 'Carregando...',
      noFile: 'Nenhuma animação carregada', speed: 'Velocidade',
      bgColor: 'Fundo', loop: 'Repetir', dropHere: 'Solte o arquivo JSON Lottie aqui',
      emptyTitle: 'Player de Animação Lottie', emptySub: 'Arraste um arquivo JSON ou use Abrir / URL',
      loadError: 'Falha ao carregar biblioteca Lottie', animError: 'Falha ao carregar animação', urlPrompt: 'Digite a URL do JSON Lottie:',
      fetchError: 'Falha ao carregar da URL',
      openLocal: 'Do computador', openServer: 'Do servidor',
      save: 'Salvar', saveJsonLocal: 'Baixar JSON', saveJsonServer: 'Salvar JSON no servidor',
      savePngLocal: 'Baixar PNG', savePngServer: 'Salvar PNG no servidor',
      quickSave: 'Salvamento rápido', saved: 'Salvo', saveError: 'Falha ao salvar'
    }
  };

  function getLocale() {
    try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; }
  }

  // lottie-web singleton
  var lottiePromise = null;
  function loadLottieLib() {
    if (lottiePromise) return lottiePromise;
    if (window.lottie) { lottiePromise = Promise.resolve(window.lottie); return lottiePromise; }
    lottiePromise = new Promise(function(resolve, reject) {
      // Temporarily hide AMD define to prevent "anonymous define" conflict
      var _define = window.define;
      window.define = undefined;
      var script = document.createElement('script');
      script.src = LOTTIE_CDN;
      script.onload = function() {
        window.define = _define; // Restore AMD define
        resolve(window.lottie);
      };
      script.onerror = function() {
        window.define = _define; // Restore on error too
        reject(new Error('lottie-web script load failed'));
      };
      document.head.appendChild(script);
    });
    return lottiePromise;
  }

  function fmtTime(sec) {
    var s = Math.floor(sec % 60);
    var m = Math.floor(sec / 60);
    return m + ':' + s.toString().padStart(2, '0');
  }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      const loading = ref(false);
      const errorMsg = ref('');
      const fileName = ref('');
      const animLoaded = ref(false);
      const playing = ref(false);
      const loop = ref(true);
      const speed = ref(1);
      const speeds = [0.25, 0.5, 1, 1.5, 2, 3];
      const bgColor = ref('#0c0c1e');
      const seekValue = ref(0);
      const dragging = ref(false);
      const showOpenMenu = ref(false);
      const showSaveMenu = ref(false);
      const currentFilePath = ref('');

      var currentJsonStr = '';

      const animContainer = ref(null);
      const canvasWrap = ref(null);
      const fileInput = ref(null);

      var lottieLib = null;
      var anim = null;
      var animDuration = 0;
      var rafHandle = null;
      var resizeObserver = null;
      var seeking = false;

      const currentTimeStr = computed(function() {
        if (!animDuration) return '0:00';
        return fmtTime(seekValue.value * animDuration);
      });
      const durationStr = computed(function() {
        if (!animDuration) return '0:00';
        return fmtTime(animDuration);
      });

      // ---------- Lottie lib init ----------
      async function ensureLottie() {
        if (lottieLib) return lottieLib;
        loading.value = true;
        errorMsg.value = '';
        try {
          lottieLib = await loadLottieLib();
          return lottieLib;
        } catch (e) {
          console.error('Lottie lib init failed:', e);
          errorMsg.value = L('loadError');
          loading.value = false;
          throw e;
        }
      }

      // ---------- Load animation ----------
      async function loadAnimation(jsonStr, name, serverPath) {
        try {
          await ensureLottie();
          await nextTick();

          destroyAnim();

          var animData;
          try { animData = JSON.parse(jsonStr); }
          catch (e) { errorMsg.value = L('animError'); loading.value = false; return; }

          if (!animContainer.value) { errorMsg.value = L('animError'); loading.value = false; return; }

          animContainer.value.innerHTML = '';

          anim = lottieLib.loadAnimation({
            container: animContainer.value,
            renderer: 'svg',
            loop: loop.value,
            autoplay: true,
            animationData: animData
          });

          anim.addEventListener('DOMLoaded', function() {
            animDuration = anim.getDuration();
            currentJsonStr = jsonStr;
            fileName.value = name;
            currentFilePath.value = serverPath || '';
            animLoaded.value = true;
            loading.value = false;
            errorMsg.value = '';
            playing.value = true;
            seekValue.value = 0;
            anim.setSpeed(speed.value);
            startSeekTracker();
          });

          anim.addEventListener('complete', function() {
            if (!loop.value) {
              playing.value = false;
              seekValue.value = 1;
            }
          });

          anim.addEventListener('error', function() {
            errorMsg.value = L('animError');
            loading.value = false;
          });

        } catch (e) {
          console.error('Animation load error:', e);
          errorMsg.value = L('animError');
          loading.value = false;
        }
      }

      // ---------- Seek tracker ----------
      function startSeekTracker() {
        cancelAnimationFrame(rafHandle);
        function tick() {
          if (anim && playing.value && !seeking) {
            var totalFrames = anim.totalFrames;
            if (totalFrames > 0) {
              seekValue.value = anim.currentFrame / totalFrames;
            }
          }
          rafHandle = requestAnimationFrame(tick);
        }
        rafHandle = requestAnimationFrame(tick);
      }

      function destroyAnim() {
        cancelAnimationFrame(rafHandle);
        if (anim) { anim.destroy(); anim = null; }
        animDuration = 0;
        playing.value = false;
        animLoaded.value = false;
      }

      // ---------- Playback controls ----------
      function togglePlay() {
        if (!anim) return;
        if (playing.value) {
          anim.pause();
          playing.value = false;
        } else {
          anim.play();
          playing.value = true;
          startSeekTracker();
        }
      }

      function stop() {
        if (!anim) return;
        anim.goToAndStop(0, true);
        playing.value = false;
        seekValue.value = 0;
        cancelAnimationFrame(rafHandle);
      }

      function onSeek(e) {
        var v = parseFloat(e.target.value);
        seekValue.value = v;
        seeking = true;
        if (anim) {
          var frame = Math.round(v * anim.totalFrames);
          if (frame >= anim.totalFrames) frame = anim.totalFrames - 1;
          if (frame < 0) frame = 0;
          if (playing.value) {
            anim.goToAndPlay(frame, true);
            nextTick(function() { seeking = false; });
          } else {
            anim.goToAndStop(frame, true);
            seeking = false;
          }
        } else {
          seeking = false;
        }
      }

      // ---------- File loading — Local ----------
      function openLocalFile() { fileInput.value && fileInput.value.click(); }

      function onFileSelected(e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;
        loading.value = true;
        var reader = new FileReader();
        reader.onload = function() { loadAnimation(reader.result, file.name); };
        reader.onerror = function() { errorMsg.value = L('animError'); loading.value = false; };
        reader.readAsText(file);
        e.target.value = '';
      }

      function onDrop(e) {
        dragging.value = false;
        var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (!file) return;
        if (!file.name.endsWith('.json') && !file.name.endsWith('.lottie')) return;
        loading.value = true;
        var reader = new FileReader();
        reader.onload = function() { loadAnimation(reader.result, file.name); };
        reader.onerror = function() { errorMsg.value = L('animError'); loading.value = false; };
        reader.readAsText(file);
      }

      // ---------- File loading — Server (FileDialog) ----------
      async function openServerFile() {
        if (!window.FileDialog) return;
        var result = await window.FileDialog.open({
          title: '📂 ' + L('openServer'),
          filters: [
            { label: 'Lottie JSON', extensions: ['.json', '.lottie'] },
            { label: 'All Files', extensions: ['*'] }
          ]
        });
        if (!result) return;
        loading.value = true;
        try {
          await loadAnimation(result.content, result.name, result.path);
        } catch (e) {
          errorMsg.value = L('animError');
          loading.value = false;
        }
      }

      // ---------- File loading — URL ----------
      async function loadFromUrl() {
        var url = prompt(L('urlPrompt'), '');
        if (!url || !url.trim()) return;
        loading.value = true;
        errorMsg.value = '';
        try {
          var resp = await fetch(url.trim());
          if (!resp.ok) throw new Error('HTTP ' + resp.status);
          var text = await resp.text();
          var name = url.split('/').pop() || 'animation.json';
          await loadAnimation(text, name);
        } catch (e) {
          console.error('Fetch error:', e);
          errorMsg.value = L('fetchError');
          loading.value = false;
        }
      }

      async function loadSample() {
        loading.value = true;
        errorMsg.value = '';
        try {
          var resp = await fetch(SAMPLE_URL);
          if (!resp.ok) throw new Error('HTTP ' + resp.status);
          var text = await resp.text();
          await loadAnimation(text, 'sample.json');
        } catch (e) {
          console.error('Sample load error:', e);
          errorMsg.value = L('fetchError');
          loading.value = false;
        }
      }

      // ---------- Save — JSON Local ----------
      function saveJsonLocal() {
        if (!currentJsonStr) return;
        var blob = new Blob([currentJsonStr], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = (fileName.value || 'animation').replace(/\.(json|lottie)$/i, '') + '.json';
        a.click();
        URL.revokeObjectURL(a.href);
      }

      // ---------- Save — JSON to Server ----------
      async function saveJsonServer() {
        if (!currentJsonStr || !window.FileDialog) return;
        var result = await window.FileDialog.save({
          title: '💾 ' + L('saveJsonServer'),
          defaultName: (fileName.value || 'animation').replace(/\.(json|lottie)$/i, '') + '.json',
          filters: [
            { label: 'Lottie JSON', extensions: ['.json', '.lottie'] },
            { label: 'All Files', extensions: ['*'] }
          ]
        });
        if (!result) return;
        try {
          await window.FileDialog.writeFile(result.path, currentJsonStr);
          currentFilePath.value = result.path;
          fileName.value = result.name;
          showStatus(L('saved'));
        } catch (e) {
          console.error('Save error:', e);
          showStatus(L('saveError'));
        }
      }

      // ---------- Save — PNG Local ----------
      function savePngLocal() {
        if (!animContainer.value || !anim) return;
        captureSvgToPng(function(blob) {
          if (!blob) return;
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = (fileName.value || 'lottie').replace(/\.(json|lottie)$/i, '') + '.png';
          a.click();
          URL.revokeObjectURL(a.href);
        });
      }

      // ---------- Save — PNG to Server ----------
      async function savePngServer() {
        if (!animContainer.value || !anim || !window.FileDialog) return;
        var result = await window.FileDialog.save({
          title: '💾 ' + L('savePngServer'),
          defaultName: (fileName.value || 'lottie').replace(/\.(json|lottie)$/i, '') + '.png',
          filters: [{ label: 'PNG Image', extensions: ['.png'] }]
        });
        if (!result) return;
        captureSvgToPng(async function(blob) {
          if (!blob) { showStatus(L('saveError')); return; }
          try {
            var reader = new FileReader();
            reader.onload = async function() {
              var b64 = reader.result.split(',')[1];
              var token = localStorage.getItem('auth_token') || '';
              var resp = await fetch('/api/fs/write-binary', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                body: JSON.stringify({ filePath: result.path, content: b64 })
              });
              showStatus(resp.ok ? L('saved') : L('saveError'));
            };
            reader.readAsDataURL(blob);
          } catch (e) {
            console.error('PNG save error:', e);
            showStatus(L('saveError'));
          }
        });
      }

      // ---------- SVG to PNG capture ----------
      function captureSvgToPng(callback) {
        var svg = animContainer.value && animContainer.value.querySelector('svg');
        if (!svg) { callback(null); return; }

        var clone = svg.cloneNode(true);
        var rect = svg.getBoundingClientRect();
        clone.setAttribute('width', rect.width);
        clone.setAttribute('height', rect.height);

        var svgData = new XMLSerializer().serializeToString(clone);
        var svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        var url = URL.createObjectURL(svgBlob);

        var w = Math.round(rect.width * 2);
        var h = Math.round(rect.height * 2);

        var img = new Image();
        img.onload = function() {
          var canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          var ctx = canvas.getContext('2d');
          ctx.fillStyle = bgColor.value;
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          URL.revokeObjectURL(url);
          canvas.toBlob(function(b) { callback(b); }, 'image/png');
        };
        img.onerror = function() { URL.revokeObjectURL(url); callback(null); };
        img.src = url;
      }

      // ---------- Quick Save ----------
      async function quickSave() {
        if (!currentFilePath.value || !currentJsonStr || !window.FileDialog) return;
        try {
          await window.FileDialog.writeFile(currentFilePath.value, currentJsonStr);
          showStatus(L('saved'));
        } catch (e) {
          console.error('Quick save error:', e);
          showStatus(L('saveError'));
        }
      }

      // ---------- Status toast ----------
      function showStatus(msg) {
        if (window.ElMessage) { window.ElMessage.success(msg); return; }
        errorMsg.value = msg;
        setTimeout(function() { if (errorMsg.value === msg) errorMsg.value = ''; }, 2000);
      }

      // ---------- Watch loop, speed ----------
      watch(loop, function(v) { if (anim) anim.loop = v; });
      watch(speed, function(v) { if (anim) anim.setSpeed(v); });

      // ---------- Drag & drop on root ----------
      function onRootDragOver(e) { e.preventDefault(); dragging.value = true; }
      function onRootDragEnter(e) { e.preventDefault(); dragging.value = true; }

      // ---------- Close menus on outside click ----------
      function closeMenus() { showOpenMenu.value = false; showSaveMenu.value = false; }

      // ---------- Lifecycle ----------
      onMounted(function() {
        window.addEventListener('locale-changed', function() { locale.value = getLocale(); });
        document.addEventListener('click', closeMenus);
        var root = canvasWrap.value && canvasWrap.value.parentElement;
        if (root) {
          root.addEventListener('dragover', onRootDragOver);
          root.addEventListener('dragenter', onRootDragEnter);
        }
      });

      onUnmounted(function() {
        destroyAnim();
        document.removeEventListener('click', closeMenus);
        var root = canvasWrap.value && canvasWrap.value.parentElement;
        if (root) {
          root.removeEventListener('dragover', onRootDragOver);
          root.removeEventListener('dragenter', onRootDragEnter);
        }
      });

      return {
        locale, L, loading, errorMsg, fileName, animLoaded,
        playing, loop, speed, speeds, bgColor,
        seekValue, dragging,
        showOpenMenu, showSaveMenu, currentFilePath,
        animContainer, canvasWrap, fileInput,
        currentTimeStr, durationStr,
        openLocalFile, openServerFile, onFileSelected, onDrop,
        loadFromUrl, loadSample,
        saveJsonLocal, saveJsonServer, savePngLocal, savePngServer, quickSave,
        togglePlay, stop, onSeek
      };
    }
  };
})(Vue);
