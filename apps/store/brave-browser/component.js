(function(Vue) {
  const { ref, onMounted, onBeforeUnmount } = Vue;

  const DOCKER_IMAGE = 'lscr.io/linuxserver/brave:latest';
  const APP_ID = 'brave-browser';
  const CONTAINER_PORT = 3000;

  const LANGS = {
    tr: {
      pulling:'Docker image indiriliyor',
      pullSlow:'Bu işlem ilk kurulumda biraz zaman alabilir...',
      starting:'Brave Browser başlatılıyor...',
      startSub:'Docker container hazırlanıyor',
      error:'Bir hata oluştu',
      retry:'Tekrar Dene',
      dockerCheck:'Docker\'ın yüklü ve çalışır durumda olduğundan emin olun.',
      start:'Başlat',
      restart:'Yeniden Başlat',
      stop:'Durdur',
      pullOk:'Image başarıyla indirildi! Container başlatılıyor...',
      pullFail:'Docker image indirme hatası'
    },
    en: {
      pulling:'Downloading Docker image',
      pullSlow:'This may take a while on first install...',
      starting:'Starting Brave Browser...',
      startSub:'Preparing Docker container',
      error:'An error occurred',
      retry:'Retry',
      dockerCheck:'Make sure Docker is installed and running.',
      start:'Start',
      restart:'Restart',
      stop:'Stop',
      pullOk:'Image downloaded! Starting container...',
      pullFail:'Docker image pull error'
    },
    de: {
      pulling:'Docker-Image wird heruntergeladen',
      pullSlow:'Dies kann beim ersten Mal etwas dauern...',
      starting:'Brave Browser wird gestartet...',
      startSub:'Docker-Container wird vorbereitet',
      error:'Ein Fehler ist aufgetreten',
      retry:'Erneut versuchen',
      dockerCheck:'Stellen Sie sicher, dass Docker installiert und aktiv ist.',
      start:'Starten',
      restart:'Neustart',
      stop:'Stoppen',
      pullOk:'Image heruntergeladen! Container startet...',
      pullFail:'Docker-Image-Download-Fehler'
    },
    fr: {
      pulling:'Téléchargement de l\'image Docker',
      pullSlow:'Cela peut prendre du temps lors de la première installation...',
      starting:'Démarrage de Brave Browser...',
      startSub:'Préparation du conteneur Docker',
      error:'Une erreur est survenue',
      retry:'Réessayer',
      dockerCheck:'Assurez-vous que Docker est installé et en cours d\'exécution.',
      start:'Démarrer',
      restart:'Redémarrer',
      stop:'Arrêter',
      pullOk:'Image téléchargée ! Démarrage du conteneur...',
      pullFail:'Erreur de téléchargement de l\'image Docker'
    },
    es: {
      pulling:'Descargando imagen Docker',
      pullSlow:'Esto puede tardar un poco en la primera instalación...',
      starting:'Iniciando Brave Browser...',
      startSub:'Preparando contenedor Docker',
      error:'Ha ocurrido un error',
      retry:'Reintentar',
      dockerCheck:'Asegúrese de que Docker esté instalado y en ejecución.',
      start:'Iniciar',
      restart:'Reiniciar',
      stop:'Detener',
      pullOk:'¡Imagen descargada! Iniciando contenedor...',
      pullFail:'Error al descargar la imagen Docker'
    },
    ru: {
      pulling:'Загрузка Docker-образа',
      pullSlow:'При первой установке это может занять некоторое время...',
      starting:'Запуск Brave Browser...',
      startSub:'Подготовка Docker-контейнера',
      error:'Произошла ошибка',
      retry:'Повторить',
      dockerCheck:'Убедитесь, что Docker установлен и запущен.',
      start:'Запустить',
      restart:'Перезапуск',
      stop:'Остановить',
      pullOk:'Образ загружен! Запуск контейнера...',
      pullFail:'Ошибка загрузки Docker-образа'
    },
    zh: {
      pulling:'正在下载Docker镜像',
      pullSlow:'首次安装可能需要一些时间...',
      starting:'正在启动Brave浏览器...',
      startSub:'正在准备Docker容器',
      error:'发生错误',
      retry:'重试',
      dockerCheck:'请确保Docker已安装并正在运行。',
      start:'启动',
      restart:'重启',
      stop:'停止',
      pullOk:'镜像下载完成！正在启动容器...',
      pullFail:'Docker镜像下载错误'
    },
    ja: {
      pulling:'Dockerイメージをダウンロード中',
      pullSlow:'初回インストール時は時間がかかる場合があります...',
      starting:'Brave Browserを起動中...',
      startSub:'Dockerコンテナを準備中',
      error:'エラーが発生しました',
      retry:'再試行',
      dockerCheck:'Dockerがインストールされ実行中であることを確認してください。',
      start:'開始',
      restart:'再起動',
      stop:'停止',
      pullOk:'イメージのダウンロード完了！コンテナを起動中...',
      pullFail:'Dockerイメージのダウンロードエラー'
    },
    it: {
      pulling:'Download dell\'immagine Docker',
      pullSlow:'Potrebbe richiedere del tempo alla prima installazione...',
      starting:'Avvio di Brave Browser...',
      startSub:'Preparazione del container Docker',
      error:'Si è verificato un errore',
      retry:'Riprova',
      dockerCheck:'Assicurati che Docker sia installato e in esecuzione.',
      start:'Avvia',
      restart:'Riavvia',
      stop:'Ferma',
      pullOk:'Immagine scaricata! Avvio del container...',
      pullFail:'Errore nel download dell\'immagine Docker'
    },
    ar: {
      pulling:'جارٍ تنزيل صورة Docker',
      pullSlow:'قد يستغرق هذا بعض الوقت عند التثبيت الأول...',
      starting:'جارٍ تشغيل Brave Browser...',
      startSub:'جارٍ تحضير حاوية Docker',
      error:'حدث خطأ',
      retry:'إعادة المحاولة',
      dockerCheck:'تأكد من أن Docker مثبت وقيد التشغيل.',
      start:'بدء',
      restart:'إعادة التشغيل',
      stop:'إيقاف',
      pullOk:'تم تنزيل الصورة! جارٍ تشغيل الحاوية...',
      pullFail:'خطأ في تنزيل صورة Docker'
    },
    ko: {
      pulling:'Docker 이미지 다운로드 중',
      pullSlow:'첫 설치 시 시간이 걸릴 수 있습니다...',
      starting:'Brave Browser 시작 중...',
      startSub:'Docker 컨테이너 준비 중',
      error:'오류가 발생했습니다',
      retry:'재시도',
      dockerCheck:'Docker가 설치되어 실행 중인지 확인하세요.',
      start:'시작',
      restart:'재시작',
      stop:'정지',
      pullOk:'이미지 다운로드 완료! 컨테이너 시작 중...',
      pullFail:'Docker 이미지 다운로드 오류'
    },
    hi: {
      pulling:'Docker इमेज डाउनलोड हो रहा है',
      pullSlow:'पहली बार इंस्टॉल में कुछ समय लग सकता है...',
      starting:'Brave Browser शुरू हो रहा है...',
      startSub:'Docker कंटेनर तैयार हो रहा है',
      error:'एक त्रुटि हुई',
      retry:'पुनः प्रयास',
      dockerCheck:'सुनिश्चित करें कि Docker इंस्टॉल और चालू है।',
      start:'शुरू करें',
      restart:'पुनरारंभ',
      stop:'रोकें',
      pullOk:'इमेज डाउनलोड हुई! कंटेनर शुरू हो रहा है...',
      pullFail:'Docker इमेज डाउनलोड त्रुटि'
    },
    pt: {
      pulling:'Baixando imagem Docker',
      pullSlow:'Isso pode demorar um pouco na primeira instalação...',
      starting:'Iniciando Brave Browser...',
      startSub:'Preparando container Docker',
      error:'Ocorreu um erro',
      retry:'Tentar novamente',
      dockerCheck:'Certifique-se de que o Docker está instalado e em execução.',
      start:'Iniciar',
      restart:'Reiniciar',
      stop:'Parar',
      pullOk:'Imagem baixada! Iniciando container...',
      pullFail:'Erro ao baixar imagem Docker'
    }
  };

  return {
    setup() {
      const status = ref('idle');
      const errorMsg = ref('');
      const port = ref(null);
      const containerId = ref(null);
      const iframeSrc = ref('');
      const pullProgress = ref('');

      function getLocale() { return localStorage.getItem('sys_locale') || 'tr'; }
      const locale = ref(getLocale());
      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }
      function t(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      async function apiFetch(url, opts = {}) {
        const token = localStorage.getItem('auth_token');
        const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
        if (token) headers['Authorization'] = 'Bearer ' + token;
        let res;
        try {
          res = await fetch(url, { ...opts, headers });
        } catch (e) {
          throw new Error(t('dockerCheck') + ' (' + e.message + ')');
        }
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
          const text = (await res.text()).substring(0, 200);
          throw new Error('Unexpected response (' + res.status + '): ' + text);
        }
        return res;
      }

      function getVolumes() {
        return ['${APP_VOLUME}:/config'];
      }

      function getEnv() {
        return [
          'PUID=1000',
          'PGID=1000',
          'TZ=Etc/UTC'
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
              env: getEnv(),
              extraPorts: [3001],
              shmSize: '1g'
            })
          });
          const runData = await runRes.json();

          if (!runRes.ok) {
            if (runData.error && (runData.error.includes('Unable to find image') || runData.error.includes('No such image'))) {
              await pullImage();
              return;
            }
            throw new Error(runData.error || 'Failed to start container');
          }

          port.value = runData.port;
          containerId.value = runData.containerId;

          await new Promise(r => setTimeout(r, 5000));

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
        pullProgress.value = t('pulling') + ': ' + DOCKER_IMAGE + '...';

        try {
          const res = await apiFetch('/api/docker/pull', {
            method: 'POST',
            body: JSON.stringify({ image: DOCKER_IMAGE })
          });
          const data = await res.json();

          if (!res.ok) throw new Error(data.error || 'Pull failed');

          pullProgress.value = t('pullOk');
          await checkAndStart();
        } catch (e) {
          errorMsg.value = t('pullFail') + ': ' + e.message;
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
        pullProgress, checkAndStart, stopContainer, restart, t
      };
    }
  };
})(Vue)
