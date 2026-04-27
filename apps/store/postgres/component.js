(function(Vue) {
  const { ref, onMounted, computed } = Vue;

  const APP_ID = 'postgres';

  return {
    setup() {
      const status = ref('loading');
      const serviceInfo = ref(null);
      const errorMsg = ref('');

      async function apiFetch(url, opts = {}) {
        const token = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith('token='));
        const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
        if (token) headers['Authorization'] = 'Bearer ' + token.split('=')[1];
        return fetch(url, { ...opts, headers });
      }

      async function loadStatus() {
        status.value = 'loading';
        try {
          const res = await apiFetch('/api/services/' + APP_ID);
          if (!res.ok) throw new Error('Service not found');
          serviceInfo.value = await res.json();
          status.value = serviceInfo.value.running ? 'running' : 'stopped';
        } catch (e) {
          errorMsg.value = e.message;
          status.value = 'error';
        }
      }

      async function restart() {
        status.value = 'restarting';
        try {
          // Stop
          await apiFetch('/api/docker/stop', {
            method: 'POST',
            body: JSON.stringify({ appId: APP_ID })
          });
          // Re-run with saved config
          const cfgRes = await apiFetch('/api/services/' + APP_ID);
          const cfg = await cfgRes.json();
          const appRes = await apiFetch('/api/store');
          const apps = await appRes.json();
          const manifest = apps.find(a => a.id === APP_ID);
          if (!manifest || !manifest.docker) throw new Error('Manifest not found');

          const env = [...(manifest.docker.env || [])];
          if (cfg.installConfig) {
            for (const [key, val] of Object.entries(cfg.installConfig)) {
              env.push(`${key}=${val}`);
            }
          }

          await apiFetch('/api/docker/run', {
            method: 'POST',
            body: JSON.stringify({
              image: manifest.docker.image,
              appId: APP_ID,
              containerPort: manifest.docker.containerPort || 5432,
              volumes: manifest.docker.volumes || [],
              env,
              restart: 'always'
            })
          });

          await new Promise(r => setTimeout(r, 2000));
          await loadStatus();
        } catch (e) {
          errorMsg.value = e.message;
          status.value = 'error';
        }
      }

      const connInfo = computed(() => {
        if (!serviceInfo.value) return null;
        return {
          host: 'localhost',
          port: serviceInfo.value.port,
          user: 'postgres',
          internalHost: serviceInfo.value.containerName
        };
      });

      onMounted(() => loadStatus());

      return { status, serviceInfo, errorMsg, connInfo, loadStatus, restart };
    }
  };
})(Vue)
