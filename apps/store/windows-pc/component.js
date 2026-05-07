(function(Vue) {
  const { ref, reactive, onMounted, computed } = Vue;

  const DOCKER_IMAGE = 'dockurr/windows';
  const APP_ID = 'windows-pc';
  const CONTAINER_PORT = 8006;

  const WIN_VERSIONS = [
    { value: '11', label: 'Windows 11 Pro', size: '7.2 GB' },
    { value: '11l', label: 'Windows 11 LTSC', size: '4.7 GB' },
    { value: '11e', label: 'Windows 11 Enterprise', size: '6.6 GB' },
    { value: '10', label: 'Windows 10 Pro', size: '5.7 GB' },
    { value: '10l', label: 'Windows 10 LTSC', size: '4.6 GB' },
    { value: '10e', label: 'Windows 10 Enterprise', size: '5.2 GB' },
    { value: '8e', label: 'Windows 8.1 Enterprise', size: '3.7 GB' },
    { value: '7u', label: 'Windows 7 Ultimate', size: '3.1 GB' },
    { value: 'vu', label: 'Windows Vista Ultimate', size: '3.0 GB' },
    { value: 'xp', label: 'Windows XP Professional', size: '0.6 GB' },
    { value: '2025', label: 'Windows Server 2025', size: '6.7 GB' },
    { value: '2022', label: 'Windows Server 2022', size: '6.0 GB' },
    { value: '2019', label: 'Windows Server 2019', size: '5.3 GB' },
    { value: '2016', label: 'Windows Server 2016', size: '6.5 GB' }
  ];

  const LANGUAGES = [
    'English', 'Turkish', 'Arabic', 'Chinese', 'Czech', 'Danish', 'Dutch',
    'Finnish', 'French', 'German', 'Greek', 'Hebrew', 'Hungarian', 'Italian',
    'Japanese', 'Korean', 'Norwegian', 'Polish', 'Portuguese', 'Romanian',
    'Russian', 'Serbian', 'Slovak', 'Slovenian', 'Spanish', 'Swedish', 'Thai',
    'Ukrainian', 'Bulgarian', 'Croatian', 'Estonian', 'Latvian', 'Lithuanian'
  ];

  return {
    setup() {
      const status = ref('idle');
      const errorMsg = ref('');
      const port = ref(null);
      const rdpPort = ref(null);
      const containerId = ref(null);
      const iframeSrc = ref('');
      const pullProgress = ref('');
      const showSetup = ref(false);
      const showRdpInfo = ref(false);

      const config = reactive({
        version: '11',
        ramSize: '4G',
        cpuCores: '2',
        diskSize: '64G',
        language: 'English',
        username: 'Docker',
        password: 'admin'
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

      function getEnv() {
        const env = [
          'VERSION=' + config.version,
          'RAM_SIZE=' + config.ramSize,
          'CPU_CORES=' + config.cpuCores,
          'DISK_SIZE=' + config.diskSize
        ];
        if (config.language && config.language !== 'English') {
          env.push('LANGUAGE=' + config.language);
        }
        if (config.username && config.username !== 'Docker') {
          env.push('USERNAME=' + config.username);
        }
        if (config.password && config.password !== 'admin') {
          env.push('PASSWORD=' + config.password);
        }
        return env;
      }

      function getVolumes() {
        return ['${APP_VOLUME}:/storage'];
      }

      function saveConfig() {
        try {
          localStorage.setItem('windows-pc-config', JSON.stringify(config));
        } catch {}
      }

      function loadConfig() {
        try {
          const saved = localStorage.getItem('windows-pc-config');
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
            if (statusData.extraPorts) {
              const rdp = statusData.extraPorts.find(p => p.containerPort === 3389);
              if (rdp) rdpPort.value = rdp.hostPort;
            }
            iframeSrc.value = '/proxy/' + APP_ID + '/';
            status.value = 'running';
            return;
          }

          // Container not running - show setup on first use
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
              image: DOCKER_IMAGE,
              appId: APP_ID,
              containerPort: CONTAINER_PORT,
              extraPorts: [3389],
              volumes: getVolumes(),
              env: getEnv(),
              devices: ['/dev/kvm', '/dev/net/tun'],
              capAdd: ['NET_ADMIN'],
              stopTimeout: 120,
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
          if (runData.extraPortMappings) {
            const rdp = runData.extraPortMappings.find(p => p.containerPort === 3389);
            if (rdp) rdpPort.value = rdp.hostPort;
          }

          showSetup.value = false;
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

          pullProgress.value = 'Image indirildi! Windows başlatılıyor...';
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
        rdpPort.value = null;
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

      function toggleRdpInfo() {
        showRdpInfo.value = !showRdpInfo.value;
      }

      const versionLabel = computed(() => {
        const v = WIN_VERSIONS.find(w => w.value === config.version);
        return v ? v.label : config.version;
      });

      onMounted(() => {
        loadConfig();
        checkAndStart();
      });

      return {
        status, errorMsg, port, rdpPort, containerId, iframeSrc,
        pullProgress, showSetup, showRdpInfo, config,
        WIN_VERSIONS, LANGUAGES,
        checkAndStart, startContainer, stopContainer, restart,
        openInNewTab, toggleRdpInfo, versionLabel
      };
    }
  };
})(Vue)
