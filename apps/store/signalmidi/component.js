(function(Vue) {
  const { ref, onMounted, onBeforeUnmount } = Vue;

  const DOCKER_IMAGE = 'cloudpc-signalmidi:latest';
  const APP_ID = 'signalmidi';
  const CONTAINER_PORT = 3000;

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
          const text = (await res.text()).substring(0, 200);
          throw new Error('Sunucu JSON yerine beklenmeyen yanıt döndü (' + res.status + ')');
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
            iframeSrc.value = '/proxy/' + APP_ID + '/edit.html';
            status.value = 'running';
            return;
          }

          const runRes = await apiFetch('/api/docker/run', {
            method: 'POST',
            body: JSON.stringify({ image: DOCKER_IMAGE, appId: APP_ID, containerPort: CONTAINER_PORT })
          });
          const runData = await runRes.json();

          if (!runRes.ok) {
            if (runData.error && (runData.error.includes('No such image') || runData.error.includes('Unable to find image') || runData.error.includes('not found'))) {
              await buildImage();
              return;
            }
            throw new Error(runData.error || 'Container başlatılamadı');
          }

          port.value = runData.port;
          containerId.value = runData.containerId;
          await new Promise(r => setTimeout(r, 3000));
          iframeSrc.value = '/proxy/' + APP_ID + '/edit.html';
          status.value = 'running';
        } catch (e) {
          if (e.message && (e.message.includes('No such image') || e.message.includes('Unable to find image') || e.message.includes('not found'))) {
            await buildImage();
          } else {
            errorMsg.value = e.message;
            status.value = 'error';
          }
        }
      }

      async function buildImage() {
        status.value = 'building';
        pullProgress.value = 'Docker image derleniyor: ' + DOCKER_IMAGE + '...';

        try {
          const res = await apiFetch('/api/docker/build', {
            method: 'POST',
            body: JSON.stringify({ context: './apps/store/signalmidi', tag: DOCKER_IMAGE })
          });
          const data = await res.json();

          if (!res.ok) throw new Error(data.error || 'Build başarısız');

          pullProgress.value = 'Image başarıyla derlendi! Container başlatılıyor...';
          await checkAndStart();
        } catch (e) {
          errorMsg.value = 'Docker image derleme hatası: ' + e.message;
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
        pullProgress, checkAndStart, buildImage, stopContainer, restart
      };
    }
  };
})(Vue)
