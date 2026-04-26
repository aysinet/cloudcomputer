(function(Vue) {
  const { ref, onMounted, onBeforeUnmount } = Vue;

  const DOCKER_IMAGE = 'elliottking/doom-wasm:0.1.1';
  const APP_ID = 'doom';
  const CONTAINER_PORT = 8000;

  const LANGS = {
    tr: { pulling:'Docker image indiriliyor', pullSlow:'Bu işlem ilk kurulumda biraz zaman alabilir...', starting:'Doom başlatılıyor...', startSub:'Docker container hazırlanıyor', error:'Bir hata oluştu', retry:'Tekrar Dene', dockerCheck:'Docker\'ın yüklü ve çalışır durumda olduğundan emin olun.', start:'Başlat', restart:'Yeniden Başlat', stop:'Durdur', pullOk:'Image başarıyla indirildi! Container başlatılıyor...', pullFail:'Docker image indirme hatası' },
    en: { pulling:'Downloading Docker image', pullSlow:'This may take a while on first install...', starting:'Starting Doom...', startSub:'Preparing Docker container', error:'An error occurred', retry:'Retry', dockerCheck:'Make sure Docker is installed and running.', start:'Start', restart:'Restart', stop:'Stop', pullOk:'Image downloaded! Starting container...', pullFail:'Docker image pull error' },
    de: { pulling:'Docker-Image wird heruntergeladen', pullSlow:'Dies kann beim ersten Mal etwas dauern...', starting:'Doom wird gestartet...', startSub:'Docker-Container wird vorbereitet', error:'Ein Fehler ist aufgetreten', retry:'Erneut versuchen', dockerCheck:'Stellen Sie sicher, dass Docker installiert und aktiv ist.', start:'Starten', restart:'Neustart', stop:'Stoppen', pullOk:'Image heruntergeladen! Container startet...', pullFail:'Docker-Image-Download-Fehler' },
    fr: { pulling:'Téléchargement de l\'image Docker', pullSlow:'Cela peut prendre du temps lors de la première installation...', starting:'Démarrage de Doom...', startSub:'Préparation du conteneur Docker', error:'Une erreur est survenue', retry:'Réessayer', dockerCheck:'Assurez-vous que Docker est installé et en cours d\'exécution.', start:'Démarrer', restart:'Redémarrer', stop:'Arrêter', pullOk:'Image téléchargée ! Démarrage du conteneur...', pullFail:'Erreur de téléchargement de l\'image Docker' },
    es: { pulling:'Descargando imagen Docker', pullSlow:'Esto puede tardar un poco en la primera instalación...', starting:'Iniciando Doom...', startSub:'Preparando contenedor Docker', error:'Ha ocurrido un error', retry:'Reintentar', dockerCheck:'Asegúrese de que Docker esté instalado y en ejecución.', start:'Iniciar', restart:'Reiniciar', stop:'Detener', pullOk:'¡Imagen descargada! Iniciando contenedor...', pullFail:'Error al descargar la imagen Docker' },
    ru: { pulling:'Загрузка Docker-образа', pullSlow:'При первой установке это может занять некоторое время...', starting:'Запуск Doom...', startSub:'Подготовка Docker-контейнера', error:'Произошла ошибка', retry:'Повторить', dockerCheck:'Убедитесь, что Docker установлен и запущен.', start:'Запустить', restart:'Перезапуск', stop:'Остановить', pullOk:'Образ загружен! Запуск контейнера...', pullFail:'Ошибка загрузки Docker-образа' },
    zh: { pulling: 'Downloading Docker image', pullSlow: 'This may take a while on first install...', starting: 'Starting Doom...', startSub: 'Preparing Docker container', error: 'An error occurred', retry: 'Retry', dockerCheck: 'Make sure Docker is installed and running.', start: 'Start', restart: 'Restart', stop: 'Stop', pullOk: 'Image downloaded! Starting container...', pullFail: 'Docker image pull error' },
    ja: { pulling: 'Downloading Docker image', pullSlow: 'This may take a while on first install...', starting: 'Starting Doom...', startSub: 'Preparing Docker container', error: 'An error occurred', retry: 'Retry', dockerCheck: 'Make sure Docker is installed and running.', start: 'Start', restart: 'Restart', stop: 'Stop', pullOk: 'Image downloaded! Starting container...', pullFail: 'Docker image pull error' },
    it: { pulling: 'Downloading Docker image', pullSlow: 'This may take a while on first install...', starting: 'Starting Doom...', startSub: 'Preparing Docker container', error: 'An error occurred', retry: 'Retry', dockerCheck: 'Make sure Docker is installed and running.', start: 'Start', restart: 'Restart', stop: 'Stop', pullOk: 'Image downloaded! Starting container...', pullFail: 'Docker image pull error' }
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
            body: JSON.stringify({ image: DOCKER_IMAGE, appId: APP_ID, containerPort: CONTAINER_PORT })
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
        window.removeEventListener('locale-changed', onLocaleChanged));

      return {
        status, errorMsg, port, containerId, iframeSrc,
        pullProgress, checkAndStart, stopContainer, restart, t
      };
    }
  };
})(Vue)
