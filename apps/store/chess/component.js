(function(Vue) {
  const { ref, onMounted, onBeforeUnmount } = Vue;

  const DOCKER_IMAGE = 'rmeira/chess';
  const APP_ID = 'chess';
  const CONTAINER_PORT = 80;

  return {
    setup() {
      const status = ref('idle');        // idle | pulling | starting | running | error
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
          // Check if container is already running
          const statusRes = await apiFetch('/api/docker/status/' + APP_ID);
          const statusData = await statusRes.json();

          if (statusData.running) {
            port.value = statusData.port;
            containerId.value = statusData.containerId;
            iframeSrc.value = '/proxy/' + APP_ID + '/';
            status.value = 'running';
            return;
          }

          // Try to start the container
          const runRes = await apiFetch('/api/docker/run', {
            method: 'POST',
            body: JSON.stringify({ image: DOCKER_IMAGE, appId: APP_ID, containerPort: CONTAINER_PORT })
          });
          const runData = await runRes.json();

          if (!runRes.ok) {
            // If image not found, pull first
            if (runData.error && runData.error.includes('Unable to find image')) {
              await pullImage();
              return;
            }
            throw new Error(runData.error || 'Failed to start container');
          }

          port.value = runData.port;
          containerId.value = runData.containerId;

          // Wait a moment for the container to be ready
          await new Promise(r => setTimeout(r, 2000));

          iframeSrc.value = '/proxy/' + APP_ID + '/';
          status.value = 'running';
        } catch (e) {
          // If error suggests image not present, try pulling
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

          if (!res.ok) throw new Error(data.error || 'Pull failed');

          pullProgress.value = 'Image başarıyla indirildi! Container başlatılıyor...';
          // Now start the container
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

      onBeforeUnmount(() => {
        // Optionally stop container when window closes
        // Uncomment below to auto-stop:
        // stopContainer();
      });

      return {
        status, errorMsg, port, containerId, iframeSrc,
        pullProgress, checkAndStart, stopContainer, restart
      };
    }
  };
})(Vue)
