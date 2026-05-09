(function(Vue) {
  const { ref, onMounted, onBeforeUnmount, computed } = Vue;

  const DOCKER_IMAGE = 'onlyoffice/documentserver:latest';
  const APP_ID = 'onlyoffice';
  const CONTAINER_PORT = 80;

  const LANGS = {
    tr: {
      pulling: 'Docker image indiriliyor',
      pullSub: 'OnlyOffice image oldukça büyüktür (~1.5 GB), ilk kurulumda biraz zaman alabilir...',
      starting: 'OnlyOffice başlatılıyor...',
      startSub: 'Belge sunucusu hazırlanıyor, bu birkaç dakika sürebilir',
      errorTitle: 'Bir hata oluştu',
      retry: '🔄 Tekrar Dene',
      dockerHint: 'Docker\'ın yüklü ve çalışır durumda olduğundan emin olun.',
      appTitle: 'OnlyOffice',
      appDesc: 'Tam ofis paketi — Word, Excel, PowerPoint online düzenleme',
      launch: '▶ Başlat',
      restart: 'Yeniden Başlat',
      stop: 'Durdur',
      featureDoc: '📄 Word belgeleri oluşturma ve düzenleme',
      featureSheet: '📊 Excel tabloları ile çalışma',
      featureSlide: '📽️ PowerPoint sunumları hazırlama',
      featureCollab: '👥 Gerçek zamanlı işbirliği',
      featurePdf: '📑 PDF görüntüleme ve düzenleme',
      featureFormat: '📁 Tüm popüler formatlar desteklenir'
    },
    en: {
      pulling: 'Downloading Docker image',
      pullSub: 'OnlyOffice image is quite large (~1.5 GB), first install may take some time...',
      starting: 'Starting OnlyOffice...',
      startSub: 'Preparing document server, this may take a few minutes',
      errorTitle: 'An error occurred',
      retry: '🔄 Try Again',
      dockerHint: 'Make sure Docker is installed and running.',
      appTitle: 'OnlyOffice',
      appDesc: 'Full office suite — edit Word, Excel, PowerPoint online',
      launch: '▶ Start',
      restart: 'Restart',
      stop: 'Stop',
      featureDoc: '📄 Create and edit Word documents',
      featureSheet: '📊 Work with Excel spreadsheets',
      featureSlide: '📽️ Create PowerPoint presentations',
      featureCollab: '👥 Real-time collaboration',
      featurePdf: '📑 View and edit PDFs',
      featureFormat: '📁 All popular formats supported'
    },
    de: {
      pulling: 'Docker-Image wird heruntergeladen',
      pullSub: 'Das OnlyOffice-Image ist recht groß (~1,5 GB), die erste Installation kann einige Zeit dauern...',
      starting: 'OnlyOffice wird gestartet...',
      startSub: 'Dokumentenserver wird vorbereitet, dies kann einige Minuten dauern',
      errorTitle: 'Ein Fehler ist aufgetreten',
      retry: '🔄 Erneut versuchen',
      dockerHint: 'Stellen Sie sicher, dass Docker installiert ist und läuft.',
      appTitle: 'OnlyOffice',
      appDesc: 'Komplettes Office-Paket — Word, Excel, PowerPoint online bearbeiten',
      launch: '▶ Starten',
      restart: 'Neustart',
      stop: 'Stoppen',
      featureDoc: '📄 Word-Dokumente erstellen und bearbeiten',
      featureSheet: '📊 Mit Excel-Tabellen arbeiten',
      featureSlide: '📽️ PowerPoint-Präsentationen erstellen',
      featureCollab: '👥 Zusammenarbeit in Echtzeit',
      featurePdf: '📑 PDFs anzeigen und bearbeiten',
      featureFormat: '📁 Alle gängigen Formate unterstützt'
    },
    fr: {
      pulling: "Téléchargement de l'image Docker",
      pullSub: "L'image OnlyOffice est assez volumineuse (~1,5 Go), la première installation peut prendre du temps...",
      starting: 'Démarrage de OnlyOffice...',
      startSub: 'Préparation du serveur de documents, cela peut prendre quelques minutes',
      errorTitle: 'Une erreur est survenue',
      retry: '🔄 Réessayer',
      dockerHint: 'Assurez-vous que Docker est installé et en cours d\'exécution.',
      appTitle: 'OnlyOffice',
      appDesc: 'Suite bureautique complète — Word, Excel, PowerPoint en ligne',
      launch: '▶ Démarrer',
      restart: 'Redémarrer',
      stop: 'Arrêter',
      featureDoc: '📄 Créer et modifier des documents Word',
      featureSheet: '📊 Travailler avec des feuilles de calcul Excel',
      featureSlide: '📽️ Créer des présentations PowerPoint',
      featureCollab: '👥 Collaboration en temps réel',
      featurePdf: '📑 Afficher et modifier des PDF',
      featureFormat: '📁 Tous les formats populaires pris en charge'
    },
    es: {
      pulling: 'Descargando imagen Docker',
      pullSub: 'La imagen de OnlyOffice es bastante grande (~1,5 GB), la primera instalación puede tardar...',
      starting: 'Iniciando OnlyOffice...',
      startSub: 'Preparando el servidor de documentos, esto puede tardar unos minutos',
      errorTitle: 'Se produjo un error',
      retry: '🔄 Reintentar',
      dockerHint: 'Asegúrese de que Docker esté instalado y en ejecución.',
      appTitle: 'OnlyOffice',
      appDesc: 'Suite ofimática completa — editar Word, Excel, PowerPoint en línea',
      launch: '▶ Iniciar',
      restart: 'Reiniciar',
      stop: 'Detener',
      featureDoc: '📄 Crear y editar documentos Word',
      featureSheet: '📊 Trabajar con hojas de cálculo Excel',
      featureSlide: '📽️ Crear presentaciones PowerPoint',
      featureCollab: '👥 Colaboración en tiempo real',
      featurePdf: '📑 Ver y editar PDF',
      featureFormat: '📁 Todos los formatos populares compatibles'
    },
    ru: {
      pulling: 'Загрузка Docker-образа',
      pullSub: 'Образ OnlyOffice достаточно большой (~1,5 ГБ), первая установка может занять некоторое время...',
      starting: 'Запуск OnlyOffice...',
      startSub: 'Подготовка сервера документов, это может занять несколько минут',
      errorTitle: 'Произошла ошибка',
      retry: '🔄 Повторить',
      dockerHint: 'Убедитесь, что Docker установлен и запущен.',
      appTitle: 'OnlyOffice',
      appDesc: 'Полный офисный пакет — редактирование Word, Excel, PowerPoint онлайн',
      launch: '▶ Запустить',
      restart: 'Перезапустить',
      stop: 'Остановить',
      featureDoc: '📄 Создание и редактирование документов Word',
      featureSheet: '📊 Работа с таблицами Excel',
      featureSlide: '📽️ Создание презентаций PowerPoint',
      featureCollab: '👥 Совместная работа в реальном времени',
      featurePdf: '📑 Просмотр и редактирование PDF',
      featureFormat: '📁 Поддержка всех популярных форматов'
    },
    zh: {
      pulling: '正在下载 Docker 镜像',
      pullSub: 'OnlyOffice 镜像较大（~1.5 GB），首次安装可能需要一些时间...',
      starting: '正在启动 OnlyOffice...',
      startSub: '正在准备文档服务器，可能需要几分钟',
      errorTitle: '发生错误',
      retry: '🔄 重试',
      dockerHint: '请确保 Docker 已安装并正在运行。',
      appTitle: 'OnlyOffice',
      appDesc: '完整办公套件 — 在线编辑 Word、Excel、PowerPoint',
      launch: '▶ 启动',
      restart: '重启',
      stop: '停止',
      featureDoc: '📄 创建和编辑 Word 文档',
      featureSheet: '📊 使用 Excel 电子表格',
      featureSlide: '📽️ 创建 PowerPoint 演示文稿',
      featureCollab: '👥 实时协作',
      featurePdf: '📑 查看和编辑 PDF',
      featureFormat: '📁 支持所有流行格式'
    },
    ja: {
      pulling: 'Docker イメージをダウンロード中',
      pullSub: 'OnlyOffice イメージは大きい（~1.5 GB）ため、初回インストールには時間がかかる場合があります...',
      starting: 'OnlyOffice を起動中...',
      startSub: 'ドキュメントサーバーを準備中、数分かかる場合があります',
      errorTitle: 'エラーが発生しました',
      retry: '🔄 再試行',
      dockerHint: 'Docker がインストールされ、実行中であることを確認してください。',
      appTitle: 'OnlyOffice',
      appDesc: '完全なオフィススイート — Word、Excel、PowerPointをオンラインで編集',
      launch: '▶ 起動',
      restart: '再起動',
      stop: '停止',
      featureDoc: '📄 Word ドキュメントの作成と編集',
      featureSheet: '📊 Excel スプレッドシートの操作',
      featureSlide: '📽️ PowerPoint プレゼンテーションの作成',
      featureCollab: '👥 リアルタイムコラボレーション',
      featurePdf: '📑 PDF の表示と編集',
      featureFormat: '📁 すべての一般的な形式をサポート'
    },
    it: {
      pulling: "Download dell'immagine Docker",
      pullSub: "L'immagine OnlyOffice è piuttosto grande (~1,5 GB), la prima installazione potrebbe richiedere del tempo...",
      starting: 'Avvio di OnlyOffice...',
      startSub: 'Preparazione del server documenti, potrebbero volerci alcuni minuti',
      errorTitle: 'Si è verificato un errore',
      retry: '🔄 Riprova',
      dockerHint: 'Assicurarsi che Docker sia installato e in esecuzione.',
      appTitle: 'OnlyOffice',
      appDesc: 'Suite office completa — modifica Word, Excel, PowerPoint online',
      launch: '▶ Avvia',
      restart: 'Riavvia',
      stop: 'Ferma',
      featureDoc: '📄 Crea e modifica documenti Word',
      featureSheet: '📊 Lavora con fogli di calcolo Excel',
      featureSlide: '📽️ Crea presentazioni PowerPoint',
      featureCollab: '👥 Collaborazione in tempo reale',
      featurePdf: '📑 Visualizza e modifica PDF',
      featureFormat: '📁 Tutti i formati popolari supportati'
    },
    ar: {
      pulling: 'جارٍ تنزيل صورة Docker',
      pullSub: 'صورة OnlyOffice كبيرة الحجم (~1.5 جيجابايت)، قد يستغرق التثبيت الأول بعض الوقت...',
      starting: 'جارٍ تشغيل OnlyOffice...',
      startSub: 'جارٍ تحضير خادم المستندات، قد يستغرق بضع دقائق',
      errorTitle: 'حدث خطأ',
      retry: '🔄 إعادة المحاولة',
      dockerHint: 'تأكد من تثبيت Docker وتشغيله.',
      appTitle: 'OnlyOffice',
      appDesc: 'حزمة مكتبية كاملة — تحرير Word وExcel وPowerPoint عبر الإنترنت',
      launch: '▶ تشغيل',
      restart: 'إعادة التشغيل',
      stop: 'إيقاف',
      featureDoc: '📄 إنشاء وتحرير مستندات Word',
      featureSheet: '📊 العمل مع جداول بيانات Excel',
      featureSlide: '📽️ إنشاء عروض PowerPoint',
      featureCollab: '👥 تعاون في الوقت الحقيقي',
      featurePdf: '📑 عرض وتحرير ملفات PDF',
      featureFormat: '📁 دعم جميع التنسيقات الشائعة'
    },
    ko: {
      pulling: 'Docker 이미지 다운로드 중',
      pullSub: 'OnlyOffice 이미지가 상당히 큽니다(~1.5 GB), 처음 설치 시 시간이 걸릴 수 있습니다...',
      starting: 'OnlyOffice 시작 중...',
      startSub: '문서 서버를 준비하는 중, 몇 분이 걸릴 수 있습니다',
      errorTitle: '오류가 발생했습니다',
      retry: '🔄 다시 시도',
      dockerHint: 'Docker가 설치되어 실행 중인지 확인하세요.',
      appTitle: 'OnlyOffice',
      appDesc: '전체 오피스 제품군 — Word, Excel, PowerPoint 온라인 편집',
      launch: '▶ 시작',
      restart: '다시 시작',
      stop: '중지',
      featureDoc: '📄 Word 문서 작성 및 편집',
      featureSheet: '📊 Excel 스프레드시트 작업',
      featureSlide: '📽️ PowerPoint 프레젠테이션 제작',
      featureCollab: '👥 실시간 협업',
      featurePdf: '📑 PDF 보기 및 편집',
      featureFormat: '📁 모든 인기 형식 지원'
    },
    hi: {
      pulling: 'Docker इमेज डाउनलोड हो रही है',
      pullSub: 'OnlyOffice इमेज काफी बड़ी है (~1.5 GB), पहली बार इंस्टॉल में कुछ समय लग सकता है...',
      starting: 'OnlyOffice शुरू हो रहा है...',
      startSub: 'डॉक्यूमेंट सर्वर तैयार किया जा रहा है, इसमें कुछ मिनट लग सकते हैं',
      errorTitle: 'एक त्रुटि हुई',
      retry: '🔄 पुनः प्रयास करें',
      dockerHint: 'सुनिश्चित करें कि Docker इंस्टॉल और चालू है।',
      appTitle: 'OnlyOffice',
      appDesc: 'पूर्ण ऑफिस सूट — Word, Excel, PowerPoint ऑनलाइन संपादन',
      launch: '▶ शुरू करें',
      restart: 'पुनः आरंभ',
      stop: 'रोकें',
      featureDoc: '📄 Word दस्तावेज़ बनाएं और संपादित करें',
      featureSheet: '📊 Excel स्प्रेडशीट के साथ काम करें',
      featureSlide: '📽️ PowerPoint प्रस्तुतियाँ बनाएं',
      featureCollab: '👥 रीयल-टाइम सहयोग',
      featurePdf: '📑 PDF देखें और संपादित करें',
      featureFormat: '📁 सभी लोकप्रिय प्रारूप समर्थित'
    },
    pt: {
      pulling: 'Baixando imagem Docker',
      pullSub: 'A imagem do OnlyOffice é bastante grande (~1,5 GB), a primeira instalação pode levar algum tempo...',
      starting: 'Iniciando OnlyOffice...',
      startSub: 'Preparando servidor de documentos, isso pode levar alguns minutos',
      errorTitle: 'Ocorreu um erro',
      retry: '🔄 Tentar novamente',
      dockerHint: 'Certifique-se de que o Docker está instalado e em execução.',
      appTitle: 'OnlyOffice',
      appDesc: 'Pacote office completo — editar Word, Excel, PowerPoint online',
      launch: '▶ Iniciar',
      restart: 'Reiniciar',
      stop: 'Parar',
      featureDoc: '📄 Criar e editar documentos Word',
      featureSheet: '📊 Trabalhar com planilhas Excel',
      featureSlide: '📽️ Criar apresentações PowerPoint',
      featureCollab: '👥 Colaboração em tempo real',
      featurePdf: '📑 Visualizar e editar PDFs',
      featureFormat: '📁 Todos os formatos populares suportados'
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
          throw new Error('Sunucu JSON yerine beklenmeyen yanıt döndü (' + res.status + ')');
        }
        return res;
      }

      function getVolumes() {
        return [
          '${APP_VOLUME}/logs:/var/log/onlyoffice',
          '${APP_VOLUME}/data:/var/www/onlyoffice/Data',
          '${APP_VOLUME}/lib:/var/lib/onlyoffice',
          '${APP_VOLUME}/db:/var/lib/postgresql'
        ];
      }

      function getEnv() {
        return [
          'JWT_ENABLED=true',
          'JWT_IN_BODY=true',
          'ALLOW_META_IP_ADDRESS=true',
          'ALLOW_PRIVATE_IP_ADDRESS=true',
          'USE_UNAUTHORIZED_STORAGE=true'
        ];
      }

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
            throw new Error(runData.error || 'Container başlatılamadı');
          }

          port.value = runData.port;
          containerId.value = runData.containerId;

          // OnlyOffice startup takes time (PostgreSQL, RabbitMQ, Node.js services)
          await new Promise(r => setTimeout(r, 8000));

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

          if (!res.ok) throw new Error(data.error || 'Pull başarısız');

          pullProgress.value = 'Image indirildi! OnlyOffice başlatılıyor...';
          await checkAndStart();
        } catch (e) {
          errorMsg.value = 'Docker image indirme hatası: ' + e.message;
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
        status, errorMsg, port, containerId, iframeSrc,
        pullProgress, checkAndStart, stopContainer, restart, L
      };
    }
  };
})(Vue);
