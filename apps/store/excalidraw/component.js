(function(Vue) {
  const { ref, onMounted, onBeforeUnmount, computed } = Vue;

  const DOCKER_IMAGE = 'excalidraw/excalidraw:latest';
  const APP_ID = 'excalidraw';
  const CONTAINER_PORT = 80;

  const LANGS = {
    tr: {
      appName: 'Excalidraw',
      desc: 'El çizimi tarzında sanal beyaz tahta',
      starting: 'Excalidraw başlatılıyor...',
      startingDesc: 'Çizim tahtası hazırlanıyor',
      pulling: 'Docker image indiriliyor',
      pullingDesc: 'Bu işlem ilk kurulumda biraz zaman alabilir...',
      error: 'Bir hata oluştu',
      dockerHint: 'Docker\'ın yüklü ve çalışır durumda olduğundan emin olun.',
      retry: 'Tekrar Dene',
      start: 'Başlat',
      restart: 'Yeniden Başlat',
      stop: 'Durdur',
      port: 'Port',
      pullSuccess: 'Image indirildi! Excalidraw başlatılıyor...',
      pullFail: 'Docker image indirme hatası',
      startFail: 'Container başlatılamadı',
      unexpectedResp: 'Sunucu JSON yerine beklenmeyen yanıt döndü'
    },
    en: {
      appName: 'Excalidraw',
      desc: 'Virtual whiteboard for hand-drawn style diagrams',
      starting: 'Starting Excalidraw...',
      startingDesc: 'Preparing the drawing board',
      pulling: 'Downloading Docker image',
      pullingDesc: 'This may take a while on first install...',
      error: 'An error occurred',
      dockerHint: 'Make sure Docker is installed and running.',
      retry: 'Try Again',
      start: 'Start',
      restart: 'Restart',
      stop: 'Stop',
      port: 'Port',
      pullSuccess: 'Image downloaded! Starting Excalidraw...',
      pullFail: 'Docker image download error',
      startFail: 'Failed to start container',
      unexpectedResp: 'Server returned unexpected response instead of JSON'
    },
    de: {
      appName: 'Excalidraw',
      desc: 'Virtuelles Whiteboard für handgezeichnete Diagramme',
      starting: 'Excalidraw wird gestartet...',
      startingDesc: 'Zeichenbrett wird vorbereitet',
      pulling: 'Docker-Image wird heruntergeladen',
      pullingDesc: 'Dies kann bei der Erstinstallation etwas dauern...',
      error: 'Ein Fehler ist aufgetreten',
      dockerHint: 'Stellen Sie sicher, dass Docker installiert und aktiv ist.',
      retry: 'Erneut versuchen',
      start: 'Starten',
      restart: 'Neustart',
      stop: 'Stoppen',
      port: 'Port',
      pullSuccess: 'Image heruntergeladen! Excalidraw wird gestartet...',
      pullFail: 'Fehler beim Herunterladen des Docker-Images',
      startFail: 'Container konnte nicht gestartet werden',
      unexpectedResp: 'Server hat unerwartete Antwort statt JSON zurückgegeben'
    },
    fr: {
      appName: 'Excalidraw',
      desc: 'Tableau blanc virtuel pour les diagrammes à main levée',
      starting: 'Démarrage d\'Excalidraw...',
      startingDesc: 'Préparation du tableau de dessin',
      pulling: 'Téléchargement de l\'image Docker',
      pullingDesc: 'Cela peut prendre un moment lors de la première installation...',
      error: 'Une erreur est survenue',
      dockerHint: 'Assurez-vous que Docker est installé et en cours d\'exécution.',
      retry: 'Réessayer',
      start: 'Démarrer',
      restart: 'Redémarrer',
      stop: 'Arrêter',
      port: 'Port',
      pullSuccess: 'Image téléchargée ! Démarrage d\'Excalidraw...',
      pullFail: 'Erreur de téléchargement de l\'image Docker',
      startFail: 'Impossible de démarrer le conteneur',
      unexpectedResp: 'Le serveur a renvoyé une réponse inattendue au lieu de JSON'
    },
    es: {
      appName: 'Excalidraw',
      desc: 'Pizarra virtual para diagramas estilo dibujado a mano',
      starting: 'Iniciando Excalidraw...',
      startingDesc: 'Preparando la pizarra de dibujo',
      pulling: 'Descargando imagen Docker',
      pullingDesc: 'Esto puede tardar un momento en la primera instalación...',
      error: 'Se produjo un error',
      dockerHint: 'Asegúrese de que Docker esté instalado y en ejecución.',
      retry: 'Reintentar',
      start: 'Iniciar',
      restart: 'Reiniciar',
      stop: 'Detener',
      port: 'Puerto',
      pullSuccess: '¡Imagen descargada! Iniciando Excalidraw...',
      pullFail: 'Error al descargar la imagen Docker',
      startFail: 'No se pudo iniciar el contenedor',
      unexpectedResp: 'El servidor devolvió una respuesta inesperada en lugar de JSON'
    },
    ru: {
      appName: 'Excalidraw',
      desc: 'Виртуальная доска для рисованных диаграмм',
      starting: 'Запуск Excalidraw...',
      startingDesc: 'Подготовка доски для рисования',
      pulling: 'Загрузка Docker-образа',
      pullingDesc: 'При первой установке это может занять некоторое время...',
      error: 'Произошла ошибка',
      dockerHint: 'Убедитесь, что Docker установлен и работает.',
      retry: 'Повторить',
      start: 'Запустить',
      restart: 'Перезапуск',
      stop: 'Остановить',
      port: 'Порт',
      pullSuccess: 'Образ загружен! Запуск Excalidraw...',
      pullFail: 'Ошибка загрузки Docker-образа',
      startFail: 'Не удалось запустить контейнер',
      unexpectedResp: 'Сервер вернул неожиданный ответ вместо JSON'
    },
    zh: {
      appName: 'Excalidraw',
      desc: '手绘风格虚拟白板',
      starting: '正在启动 Excalidraw...',
      startingDesc: '正在准备绘图板',
      pulling: '正在下载 Docker 镜像',
      pullingDesc: '首次安装可能需要一些时间...',
      error: '发生错误',
      dockerHint: '请确保 Docker 已安装并正在运行。',
      retry: '重试',
      start: '启动',
      restart: '重启',
      stop: '停止',
      port: '端口',
      pullSuccess: '镜像下载完成！正在启动 Excalidraw...',
      pullFail: 'Docker 镜像下载错误',
      startFail: '无法启动容器',
      unexpectedResp: '服务器返回了意外的非 JSON 响应'
    },
    ja: {
      appName: 'Excalidraw',
      desc: '手描き風ダイアグラム用仮想ホワイトボード',
      starting: 'Excalidraw を起動中...',
      startingDesc: '描画ボードを準備しています',
      pulling: 'Docker イメージをダウンロード中',
      pullingDesc: '初回インストール時は少し時間がかかる場合があります...',
      error: 'エラーが発生しました',
      dockerHint: 'Docker がインストールされ、実行中であることを確認してください。',
      retry: '再試行',
      start: '開始',
      restart: '再起動',
      stop: '停止',
      port: 'ポート',
      pullSuccess: 'イメージをダウンロードしました！Excalidraw を起動中...',
      pullFail: 'Docker イメージのダウンロードエラー',
      startFail: 'コンテナを起動できませんでした',
      unexpectedResp: 'サーバーが JSON の代わりに予期しない応答を返しました'
    },
    it: {
      appName: 'Excalidraw',
      desc: 'Lavagna virtuale per diagrammi in stile disegnato a mano',
      starting: 'Avvio di Excalidraw...',
      startingDesc: 'Preparazione della lavagna',
      pulling: 'Download dell\'immagine Docker',
      pullingDesc: 'La prima installazione potrebbe richiedere un po\' di tempo...',
      error: 'Si è verificato un errore',
      dockerHint: 'Assicurati che Docker sia installato e in esecuzione.',
      retry: 'Riprova',
      start: 'Avvia',
      restart: 'Riavvia',
      stop: 'Ferma',
      port: 'Porta',
      pullSuccess: 'Immagine scaricata! Avvio di Excalidraw...',
      pullFail: 'Errore nel download dell\'immagine Docker',
      startFail: 'Impossibile avviare il container',
      unexpectedResp: 'Il server ha restituito una risposta inaspettata al posto di JSON'
    },
    ar: {
      appName: 'إكسكاليدرو',
      desc: 'سبورة افتراضية لرسم المخططات بأسلوب يدوي',
      starting: 'جارٍ تشغيل Excalidraw...',
      startingDesc: 'جارٍ تجهيز لوحة الرسم',
      pulling: 'جارٍ تحميل صورة Docker',
      pullingDesc: 'قد يستغرق هذا بعض الوقت عند التثبيت الأول...',
      error: 'حدث خطأ',
      dockerHint: 'تأكد من أن Docker مثبت وقيد التشغيل.',
      retry: 'إعادة المحاولة',
      start: 'تشغيل',
      restart: 'إعادة التشغيل',
      stop: 'إيقاف',
      port: 'المنفذ',
      pullSuccess: 'تم تحميل الصورة! جارٍ تشغيل Excalidraw...',
      pullFail: 'خطأ في تحميل صورة Docker',
      startFail: 'فشل في تشغيل الحاوية',
      unexpectedResp: 'أرجع الخادم استجابة غير متوقعة بدلاً من JSON'
    },
    ko: {
      appName: '엑스칼리드로',
      desc: '손으로 그린 스타일의 다이어그램용 가상 화이트보드',
      starting: 'Excalidraw 시작 중...',
      startingDesc: '그리기 보드를 준비하고 있습니다',
      pulling: 'Docker 이미지 다운로드 중',
      pullingDesc: '첫 설치 시 시간이 다소 걸릴 수 있습니다...',
      error: '오류가 발생했습니다',
      dockerHint: 'Docker가 설치되어 실행 중인지 확인하세요.',
      retry: '다시 시도',
      start: '시작',
      restart: '재시작',
      stop: '중지',
      port: '포트',
      pullSuccess: '이미지 다운로드 완료! Excalidraw 시작 중...',
      pullFail: 'Docker 이미지 다운로드 오류',
      startFail: '컨테이너를 시작할 수 없습니다',
      unexpectedResp: '서버가 JSON 대신 예상치 못한 응답을 반환했습니다'
    },
    hi: {
      appName: 'एक्सकैलिड्रॉ',
      desc: 'हाथ से बनाए गए आरेखों के लिए वर्चुअल व्हाइटबोर्ड',
      starting: 'Excalidraw शुरू हो रहा है...',
      startingDesc: 'ड्राइंग बोर्ड तैयार किया जा रहा है',
      pulling: 'Docker इमेज डाउनलोड हो रही है',
      pullingDesc: 'पहली बार इंस्टॉल में कुछ समय लग सकता है...',
      error: 'एक त्रुटि हुई',
      dockerHint: 'सुनिश्चित करें कि Docker इंस्टॉल और चालू है।',
      retry: 'पुनः प्रयास करें',
      start: 'शुरू करें',
      restart: 'पुनः प्रारंभ',
      stop: 'रोकें',
      port: 'पोर्ट',
      pullSuccess: 'इमेज डाउनलोड हो गई! Excalidraw शुरू हो रहा है...',
      pullFail: 'Docker इमेज डाउनलोड त्रुटि',
      startFail: 'कंटेनर शुरू नहीं हो सका',
      unexpectedResp: 'सर्वर ने JSON के बजाय अप्रत्याशित प्रतिक्रिया दी'
    },
    pt: {
      appName: 'Excalidraw',
      desc: 'Quadro branco virtual para diagramas desenhados à mão',
      starting: 'Iniciando Excalidraw...',
      startingDesc: 'Preparando a prancheta de desenho',
      pulling: 'Baixando imagem Docker',
      pullingDesc: 'Isso pode demorar um pouco na primeira instalação...',
      error: 'Ocorreu um erro',
      dockerHint: 'Certifique-se de que o Docker está instalado e em execução.',
      retry: 'Tentar novamente',
      start: 'Iniciar',
      restart: 'Reiniciar',
      stop: 'Parar',
      port: 'Porta',
      pullSuccess: 'Imagem baixada! Iniciando Excalidraw...',
      pullFail: 'Erro ao baixar a imagem Docker',
      startFail: 'Falha ao iniciar o contêiner',
      unexpectedResp: 'O servidor retornou uma resposta inesperada em vez de JSON'
    }
  };

  function getLocale() {
    try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; }
  }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      const status = ref('idle');
      const errorMsg = ref('');
      const port = ref(null);
      const containerId = ref(null);
      const iframeSrc = ref('');
      const pullProgress = ref('');

      function onLocaleChanged() { locale.value = getLocale(); }

      async function apiFetch(url, opts = {}) {
        const token = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith('token='));
        const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
        if (token) headers['Authorization'] = 'Bearer ' + token.split('=')[1];
        const res = await fetch(url, { ...opts, headers });
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
          throw new Error(L('unexpectedResp') + ' (' + res.status + ')');
        }
        return res;
      }

      function getVolumes() { return []; }
      function getEnv() { return []; }

      async function checkAndStart() {
        status.value = 'starting';
        errorMsg.value = '';

        try {
          const statusRes = await apiFetch('/api/docker/status/' + APP_ID);
          const statusData = await statusRes.json();

          if (statusData.running) {
            port.value = statusData.port;
            containerId.value = statusData.containerId;
            iframeSrc.value = '/proxy/' + APP_ID + '/';
            status.value = 'running';
            return;
          }

          const runRes = await apiFetch('/api/docker/run', {
            method: 'POST',
            body: JSON.stringify({
              image: DOCKER_IMAGE,
              appId: APP_ID,
              containerPort: CONTAINER_PORT,
              volumes: getVolumes(),
              env: getEnv()
            })
          });
          const runData = await runRes.json();

          if (!runRes.ok) {
            if (runData.error && (runData.error.includes('Unable to find image') || runData.error.includes('No such image'))) {
              await pullImage();
              return;
            }
            throw new Error(runData.error || L('startFail'));
          }

          port.value = runData.port;
          containerId.value = runData.containerId;

          await new Promise(r => setTimeout(r, 3000));

          iframeSrc.value = '/proxy/' + APP_ID + '/';
          status.value = 'running';
        } catch (e) {
          if (e.message && (e.message.includes('No such image') || e.message.includes('Unable to find image') || e.message.includes('not found'))) {
            await pullImage();
          } else {
            errorMsg.value = e.message;
            status.value = 'error';
          }
        }
      }

      async function pullImage() {
        status.value = 'pulling';
        pullProgress.value = L('pulling') + ': ' + DOCKER_IMAGE + '...';

        try {
          const res = await apiFetch('/api/docker/pull', {
            method: 'POST',
            body: JSON.stringify({ image: DOCKER_IMAGE })
          });
          const data = await res.json();

          if (!res.ok) throw new Error(data.error || 'Pull failed');

          pullProgress.value = L('pullSuccess');
          await checkAndStart();
        } catch (e) {
          errorMsg.value = L('pullFail') + ': ' + e.message;
          status.value = 'error';
        }
      }

      async function stopContainer() {
        try {
          await apiFetch('/api/docker/stop', {
            method: 'POST',
            body: JSON.stringify({ appId: APP_ID })
          });
        } catch {}
        iframeSrc.value = '';
        port.value = null;
        containerId.value = null;
        status.value = 'idle';
      }

      async function restart() {
        await stopContainer();
        await checkAndStart();
      }

      onMounted(() => {
        window.addEventListener('locale-changed', onLocaleChanged);
        checkAndStart();
      });

      onBeforeUnmount(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
      });

      return {
        locale, L,
        status, errorMsg, port, containerId, iframeSrc,
        pullProgress, checkAndStart, stopContainer, restart
      };
    }
  };
})(Vue)
