(function(Vue) {
  const { ref, reactive, computed, onMounted, onBeforeUnmount, watch } = Vue;

  const DOCKER_IMAGE = 'libretranslate/libretranslate:latest';
  const APP_ID = 'libretranslate';
  const CONTAINER_PORT = 5000;

  const LANGS = {
    tr: {
      title:'LibreTranslate',
      pulling:'Docker image indiriliyor',
      pullingNote:'İlk kurulumda dil modelleri indirilir, bu biraz sürebilir...',
      starting:'LibreTranslate başlatılıyor...',
      startingNote:'Dil modelleri yükleniyor',
      errorTitle:'Bir hata oluştu',
      retry:'Tekrar Dene',
      errorNote:'Docker\'ın yüklü ve çalışır durumda olduğundan emin olun.',
      startBtn:'Başlat',
      subtitle:'Açık kaynak makine çevirisi',
      restart:'Yeniden Başlat',
      stop:'Durdur',
      sourceLang:'Kaynak Dil',
      targetLang:'Hedef Dil',
      inputPlaceholder:'Çevrilecek metni yazın...',
      translateBtn:'Çevir',
      translating:'Çevriliyor...',
      swap:'Değiştir',
      autoDetect:'Otomatik Algıla',
      copyBtn:'Kopyala',
      copied:'Kopyalandı!',
      clearBtn:'Temizle',
      charCount:'karakter',
      loadingLangs:'Diller yükleniyor...',
      apiReady:'API Hazır',
      apiWaiting:'API Bekleniyor'
    },
    en: {
      title:'LibreTranslate',
      pulling:'Downloading Docker image',
      pullingNote:'Language models are downloaded on first setup, this may take a while...',
      starting:'Starting LibreTranslate...',
      startingNote:'Loading language models',
      errorTitle:'An error occurred',
      retry:'Retry',
      errorNote:'Make sure Docker is installed and running.',
      startBtn:'Start',
      subtitle:'Open source machine translation',
      restart:'Restart',
      stop:'Stop',
      sourceLang:'Source Language',
      targetLang:'Target Language',
      inputPlaceholder:'Enter text to translate...',
      translateBtn:'Translate',
      translating:'Translating...',
      swap:'Swap',
      autoDetect:'Auto Detect',
      copyBtn:'Copy',
      copied:'Copied!',
      clearBtn:'Clear',
      charCount:'characters',
      loadingLangs:'Loading languages...',
      apiReady:'API Ready',
      apiWaiting:'Waiting for API'
    },
    de: {
      title:'LibreTranslate',
      pulling:'Docker-Image wird heruntergeladen',
      pullingNote:'Sprachmodelle werden beim ersten Start heruntergeladen...',
      starting:'LibreTranslate wird gestartet...',
      startingNote:'Sprachmodelle werden geladen',
      errorTitle:'Ein Fehler ist aufgetreten',
      retry:'Erneut versuchen',
      errorNote:'Stellen Sie sicher, dass Docker installiert ist und läuft.',
      startBtn:'Starten',
      subtitle:'Open-Source-Maschinenübersetzung',
      restart:'Neustart',
      stop:'Stoppen',
      sourceLang:'Ausgangssprache',
      targetLang:'Zielsprache',
      inputPlaceholder:'Text zum Übersetzen eingeben...',
      translateBtn:'Übersetzen',
      translating:'Übersetze...',
      swap:'Tauschen',
      autoDetect:'Automatisch erkennen',
      copyBtn:'Kopieren',
      copied:'Kopiert!',
      clearBtn:'Löschen',
      charCount:'Zeichen',
      loadingLangs:'Sprachen werden geladen...',
      apiReady:'API bereit',
      apiWaiting:'Warte auf API'
    },
    fr: {
      title:'LibreTranslate',
      pulling:'Téléchargement de l\'image Docker',
      pullingNote:'Les modèles linguistiques sont téléchargés au premier démarrage...',
      starting:'Démarrage de LibreTranslate...',
      startingNote:'Chargement des modèles',
      errorTitle:'Une erreur est survenue',
      retry:'Réessayer',
      errorNote:'Assurez-vous que Docker est installé et en cours d\'exécution.',
      startBtn:'Démarrer',
      subtitle:'Traduction automatique open source',
      restart:'Redémarrer',
      stop:'Arrêter',
      sourceLang:'Langue source',
      targetLang:'Langue cible',
      inputPlaceholder:'Entrez le texte à traduire...',
      translateBtn:'Traduire',
      translating:'Traduction...',
      swap:'Inverser',
      autoDetect:'Détection auto',
      copyBtn:'Copier',
      copied:'Copié !',
      clearBtn:'Effacer',
      charCount:'caractères',
      loadingLangs:'Chargement des langues...',
      apiReady:'API prête',
      apiWaiting:'En attente de l\'API'
    },
    es: {
      title:'LibreTranslate',
      pulling:'Descargando imagen Docker',
      pullingNote:'Los modelos de idioma se descargan en la primera configuración...',
      starting:'Iniciando LibreTranslate...',
      startingNote:'Cargando modelos de idioma',
      errorTitle:'Ocurrió un error',
      retry:'Reintentar',
      errorNote:'Asegúrese de que Docker esté instalado y en ejecución.',
      startBtn:'Iniciar',
      subtitle:'Traducción automática de código abierto',
      restart:'Reiniciar',
      stop:'Detener',
      sourceLang:'Idioma origen',
      targetLang:'Idioma destino',
      inputPlaceholder:'Ingrese texto para traducir...',
      translateBtn:'Traducir',
      translating:'Traduciendo...',
      swap:'Intercambiar',
      autoDetect:'Detección automática',
      copyBtn:'Copiar',
      copied:'¡Copiado!',
      clearBtn:'Limpiar',
      charCount:'caracteres',
      loadingLangs:'Cargando idiomas...',
      apiReady:'API lista',
      apiWaiting:'Esperando API'
    },
    ru: {
      title:'LibreTranslate',
      pulling:'Загрузка Docker-образа',
      pullingNote:'Языковые модели загружаются при первой установке...',
      starting:'Запуск LibreTranslate...',
      startingNote:'Загрузка языковых моделей',
      errorTitle:'Произошла ошибка',
      retry:'Повторить',
      errorNote:'Убедитесь, что Docker установлен и работает.',
      startBtn:'Запустить',
      subtitle:'Машинный перевод с открытым кодом',
      restart:'Перезапустить',
      stop:'Остановить',
      sourceLang:'Исходный язык',
      targetLang:'Целевой язык',
      inputPlaceholder:'Введите текст для перевода...',
      translateBtn:'Перевести',
      translating:'Перевод...',
      swap:'Поменять',
      autoDetect:'Автоопределение',
      copyBtn:'Копировать',
      copied:'Скопировано!',
      clearBtn:'Очистить',
      charCount:'символов',
      loadingLangs:'Загрузка языков...',
      apiReady:'API готов',
      apiWaiting:'Ожидание API'
    },
    zh: {
      title:'LibreTranslate',
      pulling:'正在下载Docker镜像...',
      pullingNote:'下载提示',
      starting:'正在启动...',
      startingNote:'启动提示',
      errorTitle:'错误',
      retry:'重试',
      errorNote:'错误提示',
      startBtn:'启动',
      subtitle:'开源机器翻译',
      restart:'重启',
      stop:'停止',
      sourceLang:'源语言',
      targetLang:'目标语言',
      inputPlaceholder:'输入要翻译的文本...',
      translateBtn:'翻译',
      translating:'翻译中...',
      swap:'交换',
      autoDetect:'自动检测',
      copyBtn:'复制',
      copied:'已复制',
      clearBtn:'清空',
      charCount:'字符数',
      loadingLangs:'加载语言列表...',
      apiReady:'API就绪',
      apiWaiting:'等待API...'
    },
    ja: {
      title:'LibreTranslate',
      pulling:'Dockerイメージをダウンロード中...',
      pullingNote:'ダウンロードのヒント',
      starting:'起動中...',
      startingNote:'起動のヒント',
      errorTitle:'エラー',
      retry:'再試行',
      errorNote:'エラーのヒント',
      startBtn:'起動',
      subtitle:'オープンソース機械翻訳',
      restart:'再起動',
      stop:'停止',
      sourceLang:'翻訳元言語',
      targetLang:'翻訳先言語',
      inputPlaceholder:'翻訳するテキストを入力...',
      translateBtn:'翻訳',
      translating:'翻訳中...',
      swap:'入れ替え',
      autoDetect:'自動検出',
      copyBtn:'コピー',
      copied:'コピー済',
      clearBtn:'クリア',
      charCount:'文字数',
      loadingLangs:'言語リスト読込中...',
      apiReady:'API準備完了',
      apiWaiting:'API待機中...'
    },
    it: {
      title:'LibreTranslate',
      pulling:'Download immagine Docker...',
      pullingNote:'Nota download',
      starting:'Avvio in corso...',
      startingNote:'Nota avvio',
      errorTitle:'Errore',
      retry:'Riprova',
      errorNote:'Nota errore',
      startBtn:'Avvia',
      subtitle:'Traduzione automatica open source',
      restart:'Riavvia',
      stop:'Ferma',
      sourceLang:'Lingua di origine',
      targetLang:'Lingua di destinazione',
      inputPlaceholder:'Inserisci testo da tradurre...',
      translateBtn:'Traduci',
      translating:'Traduzione...',
      swap:'Scambia',
      autoDetect:'Rilevamento automatico',
      copyBtn:'Copia',
      copied:'Copiato',
      clearBtn:'Cancella',
      charCount:'Caratteri',
      loadingLangs:'Caricamento lingue...',
      apiReady:'API pronta',
      apiWaiting:'In attesa dell\'API...'
    },
    ar: {
      title:'ليبر ترانسليت',
      pulling:'Downloading Docker image',
      pullingNote:'Language models are downloaded on first setup, this may take a while...',
      starting:'Starting LibreTranslate...',
      startingNote:'Loading language models',
      errorTitle:'An error occurred',
      retry:'إعادة المحاولة',
      errorNote:'Make sure Docker is installed and running.',
      startBtn:'بدء',
      subtitle:'Open source machine translation',
      restart:'إعادة التشغيل',
      stop:'إيقاف',
      sourceLang:'Source Language',
      targetLang:'Target Language',
      inputPlaceholder:'Enter text to translate...',
      translateBtn:'Translate',
      translating:'Translating...',
      swap:'تبديل',
      autoDetect:'Auto Detect',
      copyBtn:'نسخ',
      copied:'تم النسخ!',
      clearBtn:'Clear',
      charCount:'حرف',
      loadingLangs:'Loading languages...',
      apiReady:'API Ready',
      apiWaiting:'Waiting for API'
    },
    ko: {
      title:'리브레 번역',
      pulling:'Downloading Docker image',
      pullingNote:'Language models are downloaded on first setup, this may take a while...',
      starting:'Starting LibreTranslate...',
      startingNote:'Loading language models',
      errorTitle:'An error occurred',
      retry:'재시도',
      errorNote:'Make sure Docker is installed and running.',
      startBtn:'시작',
      subtitle:'Open source machine translation',
      restart:'재시작',
      stop:'정지',
      sourceLang:'Source Language',
      targetLang:'Target Language',
      inputPlaceholder:'Enter text to translate...',
      translateBtn:'Translate',
      translating:'Translating...',
      swap:'교환',
      autoDetect:'Auto Detect',
      copyBtn:'복사',
      copied:'복사됨!',
      clearBtn:'Clear',
      charCount:'문자',
      loadingLangs:'Loading languages...',
      apiReady:'API Ready',
      apiWaiting:'Waiting for API'
    },
    hi: {
      title:'लिबरट्रांसलेट',
      pulling:'Downloading Docker image',
      pullingNote:'Language models are downloaded on first setup, this may take a while...',
      starting:'Starting LibreTranslate...',
      startingNote:'Loading language models',
      errorTitle:'An error occurred',
      retry:'पुनः प्रयास',
      errorNote:'Make sure Docker is installed and running.',
      startBtn:'शुरू करें',
      subtitle:'Open source machine translation',
      restart:'पुनरारंभ',
      stop:'रोकें',
      sourceLang:'Source Language',
      targetLang:'Target Language',
      inputPlaceholder:'Enter text to translate...',
      translateBtn:'Translate',
      translating:'Translating...',
      swap:'बदलें',
      autoDetect:'Auto Detect',
      copyBtn:'कॉपी',
      copied:'कॉपी किया गया!',
      clearBtn:'Clear',
      charCount:'अक्षर',
      loadingLangs:'Loading languages...',
      apiReady:'API Ready',
      apiWaiting:'Waiting for API'
    },
    pt: {
      title:'LibreTranslate',
      pulling:'Downloading Docker image',
      pullingNote:'Language models are downloaded on first setup, this may take a while...',
      starting:'Starting LibreTranslate...',
      startingNote:'Loading language models',
      errorTitle:'An error occurred',
      retry:'Tentar novamente',
      errorNote:'Make sure Docker is installed and running.',
      startBtn:'Iniciar',
      subtitle:'Open source machine translation',
      restart:'Reiniciar',
      stop:'Parar',
      sourceLang:'Source Language',
      targetLang:'Target Language',
      inputPlaceholder:'Enter text to translate...',
      translateBtn:'Translate',
      translating:'Translating...',
      swap:'Trocar',
      autoDetect:'Auto Detect',
      copyBtn:'Copiar',
      copied:'Copiado!',
      clearBtn:'Clear',
      charCount:'caracteres',
      loadingLangs:'Loading languages...',
      apiReady:'API Ready',
      apiWaiting:'Waiting for API'
    }
  };

  function getLocale() {
    try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; }
  }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      // Docker states
      const dockerStatus = ref('idle'); // idle | pulling | starting | running | error
      const errorMsg = ref('');
      const port = ref(null);
      const containerId = ref(null);
      const pullProgress = ref('');

      // Translation states
      const languages = ref([]);
      const sourceLang = ref('auto');
      const targetLang = ref('tr');
      const inputText = ref('');
      const outputText = ref('');
      const translating = ref(false);
      const apiReady = ref(false);
      const copied = ref(false);

      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }
      let apiCheckTimer = null;

      async function apiFetch(url, opts = {}) {
        const token = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith('token='));
        const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
        if (token) headers['Authorization'] = 'Bearer ' + token.split('=')[1];
        const res = await fetch(url, { ...opts, headers });
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
          throw new Error('Unexpected response (' + res.status + ')');
        }
        return res;
      }

      // --- Docker management ---
      async function checkAndStart() {
        dockerStatus.value = 'starting';
        errorMsg.value = '';

        try {
          const statusRes = await apiFetch('/api/docker/status/' + APP_ID);
          const statusData = await statusRes.json();

          if (statusData.running) {
            port.value = statusData.port;
            containerId.value = statusData.containerId;
            dockerStatus.value = 'running';
            waitForApi();
            return;
          }

          const runRes = await apiFetch('/api/docker/run', {
            method: 'POST',
            body: JSON.stringify({
              image: DOCKER_IMAGE,
              appId: APP_ID,
              containerPort: CONTAINER_PORT,
              volumes: ['${APP_VOLUME}:/home/libretranslate/.local'],
              env: ['LT_HOST=0.0.0.0']
            })
          });
          const runData = await runRes.json();

          if (!runRes.ok) {
            if (runData.error && (runData.error.includes('Unable to find image') || runData.error.includes('No such image'))) {
              await pullImage();
              return;
            }
            throw new Error(runData.error || 'Container could not start');
          }

          port.value = runData.port;
          containerId.value = runData.containerId;
          dockerStatus.value = 'running';
          waitForApi();
        } catch (e) {
          if (e.message && (e.message.includes('No such image') || e.message.includes('Unable to find image') || e.message.includes('not found'))) {
            await pullImage();
          } else {
            errorMsg.value = e.message;
            dockerStatus.value = 'error';
          }
        }
      }

      async function pullImage() {
        dockerStatus.value = 'pulling';
        pullProgress.value = L('pulling') + ': ' + DOCKER_IMAGE + '...';
        try {
          const res = await apiFetch('/api/docker/pull', {
            method: 'POST',
            body: JSON.stringify({ image: DOCKER_IMAGE })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Pull failed');
          pullProgress.value = 'Image downloaded! Starting...';
          await checkAndStart();
        } catch (e) {
          errorMsg.value = 'Docker image pull error: ' + e.message;
          dockerStatus.value = 'error';
        }
      }

      async function stopContainer() {
        try {
          await apiFetch('/api/docker/stop', {
            method: 'POST',
            body: JSON.stringify({ appId: APP_ID })
          });
        } catch {}
        port.value = null;
        containerId.value = null;
        apiReady.value = false;
        languages.value = [];
        dockerStatus.value = 'idle';
        if (apiCheckTimer) { clearInterval(apiCheckTimer); apiCheckTimer = null; }
      }

      async function restart() {
        await stopContainer();
        await checkAndStart();
      }

      // --- Wait for LibreTranslate API to be ready (models load slowly) ---
      function waitForApi() {
        let attempts = 0;
        const maxAttempts = 60; // 5 min max
        apiCheckTimer = setInterval(async () => {
          attempts++;
          if (attempts > maxAttempts) {
            clearInterval(apiCheckTimer);
            apiCheckTimer = null;
            return;
          }
          try {
            const res = await fetch('/proxy/' + APP_ID + '/languages');
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data) && data.length > 0) {
                languages.value = data;
                apiReady.value = true;
                // Set smart defaults based on locale
                const loc = locale.value;
                const langCodes = data.map(l => l.code);
                if (langCodes.includes(loc)) {
                  targetLang.value = loc;
                  sourceLang.value = loc === 'en' ? 'auto' : 'en';
                }
                clearInterval(apiCheckTimer);
                apiCheckTimer = null;
              }
            }
          } catch {}
        }, 5000);
      }

      // --- Translation ---
      async function translate() {
        if (!inputText.value.trim() || !apiReady.value) return;
        translating.value = true;
        outputText.value = '';
        try {
          const body = {
            q: inputText.value,
            source: sourceLang.value === 'auto' ? 'auto' : sourceLang.value,
            target: targetLang.value
          };
          const res = await fetch('/proxy/' + APP_ID + '/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          const data = await res.json();
          if (data.translatedText) {
            outputText.value = data.translatedText;
          } else if (data.error) {
            outputText.value = '⚠️ ' + data.error;
          }
        } catch (e) {
          outputText.value = '⚠️ ' + e.message;
        }
        translating.value = false;
      }

      function swapLangs() {
        if (sourceLang.value === 'auto') return;
        const tmp = sourceLang.value;
        sourceLang.value = targetLang.value;
        targetLang.value = tmp;
        // Also swap text
        if (outputText.value) {
          const tmpText = inputText.value;
          inputText.value = outputText.value;
          outputText.value = tmpText;
        }
      }

      function copyOutput() {
        if (!outputText.value) return;
        navigator.clipboard.writeText(outputText.value);
        copied.value = true;
        setTimeout(() => { copied.value = false; }, 1500);
      }

      function clearAll() {
        inputText.value = '';
        outputText.value = '';
      }

      const charCount = computed(() => inputText.value.length);

      const sourceLanguages = computed(() => {
        return [{ code: 'auto', name: L('autoDetect') }, ...languages.value];
      });

      const targetLanguages = computed(() => {
        return languages.value;
      });

      onMounted(() => {
        checkAndStart();
        window.addEventListener('locale-changed', onLocaleChanged);
      });

      onBeforeUnmount(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
        if (apiCheckTimer) { clearInterval(apiCheckTimer); apiCheckTimer = null; }
      });

      return {
        L, dockerStatus, errorMsg, port, containerId, pullProgress,
        checkAndStart, stopContainer, restart,
        languages, sourceLang, targetLang, inputText, outputText,
        translating, apiReady, copied, translate, swapLangs, copyOutput, clearAll,
        charCount, sourceLanguages, targetLanguages
      };
    }
  };
})(Vue);
