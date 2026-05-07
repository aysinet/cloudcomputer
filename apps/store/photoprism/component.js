(function(Vue) {
  const { ref, onMounted, onBeforeUnmount, computed } = Vue;

  const DOCKER_IMAGE = 'photoprism/photoprism:latest';
  const APP_ID = 'photoprism';
  const CONTAINER_PORT = 2342;

  return {
    setup() {
      const status = ref('idle');        // idle | pulling | starting | running | error
      const errorMsg = ref('');
      const port = ref(null);
      const containerId = ref(null);
      const iframeSrc = ref('');
      const pullProgress = ref('');

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
          '${DATA_VOLUME}:/photoprism/originals:ro',
          '${APP_VOLUME}:/photoprism/storage'
        ];
      }

      function getEnv() {
        return [
          'PHOTOPRISM_ADMIN_USER=admin',
          'PHOTOPRISM_ADMIN_PASSWORD=cloudcomputer',
          'PHOTOPRISM_AUTH_MODE=password',
          'PHOTOPRISM_SITE_TITLE=PhotoPrism',
          'PHOTOPRISM_SITE_CAPTION=AI-Powered Photos App',
          'PHOTOPRISM_LOG_LEVEL=info',
          'PHOTOPRISM_READONLY=false',
          'PHOTOPRISM_EXPERIMENTAL=false',
          'PHOTOPRISM_DISABLE_TLS=true',
          'PHOTOPRISM_DEFAULT_TLS=false',
          'PHOTOPRISM_DISABLE_WEBDAV=false',
          'PHOTOPRISM_DISABLE_SETTINGS=false',
          'PHOTOPRISM_DISABLE_TENSORFLOW=false',
          'PHOTOPRISM_DISABLE_FACES=false',
          'PHOTOPRISM_DISABLE_CLASSIFICATION=false',
          'PHOTOPRISM_DISABLE_VECTORS=false',
          'PHOTOPRISM_DISABLE_RAW=false',
          'PHOTOPRISM_DETECT_NSFW=false',
          'PHOTOPRISM_UPLOAD_NSFW=true',
          'PHOTOPRISM_DATABASE_DRIVER=sqlite',
          'PHOTOPRISM_HTTP_COMPRESSION=gzip',
          'PHOTOPRISM_DEFAULT_LOCALE=en',
          'PHOTOPRISM_ORIGINALS_LIMIT=5000',
          'PHOTOPRISM_UPLOAD_LIMIT=5000'
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

          // PhotoPrism startup süresi uzun olabilir (TensorFlow modelleri yüklenir)
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
        pullProgress.value = 'Docker image indiriliyor: ' + DOCKER_IMAGE + '...';

        try {
          const res = await apiFetch('/api/docker/pull', {
            method: 'POST',
            body: JSON.stringify({ image: DOCKER_IMAGE })
          });
          const data = await res.json();

          if (!res.ok) throw new Error(data.error || 'Pull başarısız');

          pullProgress.value = 'Image indirildi! PhotoPrism başlatılıyor...';
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
        checkAndStart();
      });

      return {
        status, errorMsg, port, containerId, iframeSrc,
        pullProgress, checkAndStart, stopContainer, restart
      };
    }
  };
})(Vue)
