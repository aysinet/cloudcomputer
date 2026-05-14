(function(Vue) {
  const { ref, reactive, onMounted, computed } = Vue;

  const APP_ID = 'android-emulator';
  const CONTAINER_PORT = 6080;

  const ANDROID_VERSIONS = [
    { value: 'emulator_14.0', label: 'Android 14.0 (API 34)' },
    { value: 'emulator_13.0', label: 'Android 13.0 (API 33)' },
    { value: 'emulator_12.0', label: 'Android 12.0 (API 32)' },
    { value: 'emulator_11.0', label: 'Android 11.0 (API 30)' },
    { value: 'emulator_10.0', label: 'Android 10.0 (API 29)' },
    { value: 'emulator_9.0', label: 'Android 9.0 (API 28)' }
  ];

  const DEVICES = [
    { value: 'Samsung Galaxy S10', label: 'Samsung Galaxy S10' },
    { value: 'Samsung Galaxy S9', label: 'Samsung Galaxy S9' },
    { value: 'Samsung Galaxy S8', label: 'Samsung Galaxy S8' },
    { value: 'Samsung Galaxy S7 Edge', label: 'Samsung Galaxy S7 Edge' },
    { value: 'Samsung Galaxy S7', label: 'Samsung Galaxy S7' },
    { value: 'Samsung Galaxy S6', label: 'Samsung Galaxy S6' },
    { value: 'Nexus 4', label: 'Nexus 4' },
    { value: 'Nexus 5', label: 'Nexus 5' },
    { value: 'Nexus One', label: 'Nexus One' },
    { value: 'Nexus S', label: 'Nexus S' },
    { value: 'Nexus 7', label: 'Nexus 7 (Tablet)' },
    { value: 'Pixel C', label: 'Pixel C (Tablet)' }
  ];

  return {
    setup() {
      const status = ref('idle');
      const errorMsg = ref('');
      const port = ref(null);
      const containerId = ref(null);
      const iframeSrc = ref('');
      const pullProgress = ref('');
      const showSetup = ref(false);

      const config = reactive({
        androidVersion: 'emulator_11.0',
        device: 'Samsung Galaxy S10'
      });

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

      function getDockerImage() {
        return 'budtmo/docker-android:' + config.androidVersion;
      }

      function getEnv() {
        return [
          'EMULATOR_DEVICE=' + config.device,
          'WEB_VNC=true'
        ];
      }

      function getVolumes() {
        return ['${APP_VOLUME}:/home/androidusr'];
      }

      function saveConfig() {
        try {
          localStorage.setItem('android-emulator-config', JSON.stringify(config));
        } catch {}
      }

      function loadConfig() {
        try {
          const saved = localStorage.getItem('android-emulator-config');
          if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(config, parsed);
          }
        } catch {}
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

          showSetup.value = true;
          status.value = 'idle';
        } catch (e) {
          showSetup.value = true;
          status.value = 'idle';
        }
      }

      async function startContainer() {
        saveConfig();
        status.value = 'starting';
        errorMsg.value = '';

        try {
          const runRes = await apiFetch('/api/docker/run', {
            method: 'POST',
            body: JSON.stringify({
              image: getDockerImage(),
              appId: APP_ID,
              containerPort: CONTAINER_PORT,
              volumes: getVolumes(),
              env: getEnv(),
              devices: ['/dev/kvm'],
              restart: 'always'
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

          showSetup.value = false;
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
        pullProgress.value = 'Docker image indiriliyor: ' + getDockerImage() + '...';

        try {
          const res = await apiFetch('/api/docker/pull', {
            method: 'POST',
            body: JSON.stringify({ image: getDockerImage() })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Pull başarısız');

          pullProgress.value = 'Image indirildi! Android Emülatör başlatılıyor...';
          await startContainer();
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
        showSetup.value = true;
      }

      async function restart() {
        status.value = 'restarting';
        try {
          await apiFetch('/api/docker/stop', {
            method: 'POST',
            body: JSON.stringify({ appId: APP_ID })
          });
          await new Promise(r => setTimeout(r, 2000));
          await startContainer();
        } catch (e) {
          errorMsg.value = e.message;
          status.value = 'error';
        }
      }

      function openInNewTab() {
        if (port.value) {
          window.open('/proxy/' + APP_ID + '/', '_blank');
        }
      }

      const deviceLabel = computed(() => {
        const d = DEVICES.find(d => d.value === config.device);
        return d ? d.label : config.device;
      });

      onMounted(() => {
        loadConfig();
        checkAndStart();
      });

      return {
        status, errorMsg, port, containerId, iframeSrc,
        pullProgress, showSetup, config,
        ANDROID_VERSIONS, DEVICES,
        checkAndStart, startContainer, stopContainer, restart,
        openInNewTab, deviceLabel
      };
    }
  };
})(Vue)
