(function(Vue) {
  const { ref, onMounted } = Vue;

  const DOCKER_IMAGE = 'cloudpc-tiddlywiki:latest';
  const APP_ID = 'tiddlywiki';
  const CONTAINER_PORT = 8080;
  const BUILD_CONTEXT = './apps/store/tiddlywiki';

  return {
    setup() {
      const status = ref('idle');
      const errorMsg = ref('');
      const port = ref(null);
      const containerId = ref(null);
      const iframeSrc = ref('');
      const pullProgress = ref('');

      async function apiFetch(url, opts = {}) {
        const token = localStorage.getItem('auth_token');
        const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
        if (token) headers['Authorization'] = 'Bearer ' + token;
        const res = await fetch(url, { ...opts, headers });
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
          throw new Error('Sunucu JSON yerine beklenmeyen yanıt döndü (' + res.status + ')');
        }
        return res;
      }

      function getVolumes() {
        return ['${APP_VOLUME}:/wiki'];
      }

      async function checkAndStart() {
        status.value = 'starting';
        errorMsg.value = '';

        try {
          // 1. Already running?
          const statusRes = await apiFetch('/api/docker/status/' + APP_ID);
          const statusData = await statusRes.json();

          if (statusData.running) {
            port.value = statusData.port;
            containerId.value = statusData.containerId;
            iframeSrc.value = '/proxy/' + APP_ID + '/?_=' + Date.now();
            status.value = 'running';
            return;
          }

          // 2. Ensure image is built (no-op if already exists on docker-manager side)
          status.value = 'pulling';
          pullProgress.value = 'Docker image hazırlanıyor...';

          const buildRes = await apiFetch('/api/docker/build', {
            method: 'POST',
            body: JSON.stringify({ context: BUILD_CONTEXT, tag: DOCKER_IMAGE })
          });
          const buildData = await buildRes.json();
          if (!buildRes.ok) throw new Error(buildData.error || 'Image derleme başarısız');

          // 3. Run container
          status.value = 'starting';
          pullProgress.value = 'TiddlyWiki başlatılıyor...';

          const runRes = await apiFetch('/api/docker/run', {
            method: 'POST',
            body: JSON.stringify({
              image: DOCKER_IMAGE,
              appId: APP_ID,
              containerPort: CONTAINER_PORT,
              volumes: getVolumes(),
              env: [],
              restart: 'always'
            })
          });
          const runData = await runRes.json();

          if (!runRes.ok) throw new Error(runData.error || 'Container başlatılamadı');

          port.value = runData.port;
          containerId.value = runData.containerId;

          await new Promise(r => setTimeout(r, 3000));

          iframeSrc.value = '/proxy/' + APP_ID + '/?_=' + Date.now();
          status.value = 'running';
        } catch (e) {
          errorMsg.value = e.message;
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
