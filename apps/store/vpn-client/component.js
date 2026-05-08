(function(Vue) {
  const { ref, reactive, onMounted, computed, watch } = Vue;

  const DOCKER_IMAGE = 'qmcgaw/gluetun:latest';
  const APP_ID = 'vpn-client';
  const CONTROL_PORT = 8000;
  const HTTP_PROXY_PORT = 8888;
  const SOCKS_PORT = 8388;

  const VPN_PROVIDERS = [
    { value: 'custom', label: 'Custom (OpenVPN/WireGuard)' },
    { value: 'airvpn', label: 'AirVPN' },
    { value: 'cyberghost', label: 'CyberGhost' },
    { value: 'expressvpn', label: 'ExpressVPN' },
    { value: 'fastestvpn', label: 'FastestVPN' },
    { value: 'hidemyass', label: 'HideMyAss' },
    { value: 'ipvanish', label: 'IPVanish' },
    { value: 'ivpn', label: 'IVPN' },
    { value: 'mullvad', label: 'Mullvad' },
    { value: 'nordvpn', label: 'NordVPN' },
    { value: 'perfect privacy', label: 'Perfect Privacy' },
    { value: 'privado', label: 'Privado' },
    { value: 'private internet access', label: 'Private Internet Access' },
    { value: 'privatevpn', label: 'PrivateVPN' },
    { value: 'protonvpn', label: 'ProtonVPN' },
    { value: 'purevpn', label: 'PureVPN' },
    { value: 'slickvpn', label: 'SlickVPN' },
    { value: 'surfshark', label: 'Surfshark' },
    { value: 'torguard', label: 'TorGuard' },
    { value: 'vpn unlimited', label: 'VPN Unlimited' },
    { value: 'vyprvpn', label: 'VyprVPN' },
    { value: 'windscribe', label: 'Windscribe' }
  ];

  const I18N = {
    tr: {
      title: 'VPN İstemcisi',
      desc: 'Docker tabanlı VPN istemcisi — tüm trafiğinizi şifreleyin',
      provider: 'VPN Sağlayıcı',
      vpnType: 'VPN Türü',
      username: 'Kullanıcı Adı',
      password: 'Şifre',
      wgPrivateKey: 'WireGuard Private Key',
      wgAddresses: 'WireGuard Adresleri',
      wgEndpoint: 'WireGuard Endpoint',
      wgPublicKey: 'WireGuard Public Key (Sunucu)',
      ovpnConfig: 'OpenVPN Config Dosyası (.ovpn)',
      serverCountry: 'Sunucu Ülkesi',
      serverCity: 'Sunucu Şehri',
      start: 'Başlat',
      stop: 'Durdur',
      restart: 'Yeniden Başlat',
      starting: 'VPN başlatılıyor...',
      pulling: 'Docker image indiriliyor...',
      connected: 'VPN Bağlı',
      disconnected: 'VPN Bağlı Değil',
      error: 'Bir hata oluştu',
      tryAgain: 'Tekrar Dene',
      publicIp: 'Genel IP',
      httpProxy: 'HTTP Proxy',
      socksProxy: 'SOCKS5 Proxy',
      status: 'Durum',
      dockerCheck: "Docker'ın yüklü ve çalışır durumda olduğundan emin olun.",
      firstInstall: 'Bu işlem ilk kurulumda biraz zaman alabilir...',
      preparing: 'VPN container hazırlanıyor',
      optional: '(opsiyonel)',
      proxyInfo: 'Diğer uygulamalardan bu proxy adreslerini kullanarak VPN üzerinden bağlanabilirsiniz.',
      settingsSaved: 'Ayarlar kaydedildi',
      advanced: 'Gelişmiş Ayarlar',
      killSwitch: 'Kill Switch',
      killSwitchDesc: 'VPN bağlantısı kesildiğinde tüm trafiği engelle',
      dnsOverTls: 'DNS over TLS',
      saveSettings: 'Ayarları Kaydet ve Başlat',
      checking: 'Durum kontrol ediliyor...',
      serverHostname: 'Sunucu Hostname',
      customOvpn: 'Özel OpenVPN konfigürasyonu için .ovpn dosyanızı volume dizinine kopyalayın'
    },
    en: {
      title: 'VPN Client',
      desc: 'Docker-based VPN client — encrypt all your traffic',
      provider: 'VPN Provider',
      vpnType: 'VPN Type',
      username: 'Username',
      password: 'Password',
      wgPrivateKey: 'WireGuard Private Key',
      wgAddresses: 'WireGuard Addresses',
      wgEndpoint: 'WireGuard Endpoint',
      wgPublicKey: 'WireGuard Public Key (Server)',
      ovpnConfig: 'OpenVPN Config File (.ovpn)',
      serverCountry: 'Server Country',
      serverCity: 'Server City',
      start: 'Start',
      stop: 'Stop',
      restart: 'Restart',
      starting: 'Starting VPN...',
      pulling: 'Downloading Docker image...',
      connected: 'VPN Connected',
      disconnected: 'VPN Disconnected',
      error: 'An error occurred',
      tryAgain: 'Try Again',
      publicIp: 'Public IP',
      httpProxy: 'HTTP Proxy',
      socksProxy: 'SOCKS5 Proxy',
      status: 'Status',
      dockerCheck: 'Make sure Docker is installed and running.',
      firstInstall: 'This may take some time on first install...',
      preparing: 'Preparing VPN container',
      optional: '(optional)',
      proxyInfo: 'Use these proxy addresses from other apps to connect through VPN.',
      settingsSaved: 'Settings saved',
      advanced: 'Advanced Settings',
      killSwitch: 'Kill Switch',
      killSwitchDesc: 'Block all traffic when VPN drops',
      dnsOverTls: 'DNS over TLS',
      saveSettings: 'Save Settings & Start',
      checking: 'Checking status...',
      serverHostname: 'Server Hostname',
      customOvpn: 'For custom OpenVPN config, copy your .ovpn file to the volume directory'
    }
  };

  return {
    setup() {
      const status = ref('idle');         // idle | configuring | pulling | starting | running | error
      const errorMsg = ref('');
      const port = ref(null);
      const containerId = ref(null);
      const pullProgress = ref('');
      const vpnStatus = ref('disconnected');
      const publicIp = ref('');
      const httpProxyPort = ref(null);
      const socksProxyPort = ref(null);
      const controlPort = ref(null);
      const statusInterval = ref(null);

      // VPN config form
      const config = reactive({
        provider: 'custom',
        vpnType: 'openvpn',
        username: '',
        password: '',
        // WireGuard fields
        wgPrivateKey: '',
        wgAddresses: '',
        wgPublicKey: '',
        wgEndpoint: '',
        // Server selection
        serverCountry: '',
        serverCity: '',
        serverHostname: '',
        // Advanced
        killSwitch: true,
        dnsOverTls: true
      });

      const showAdvanced = ref(false);

      function t(key) {
        const locale = (window.__settingsStore && window.__settingsStore.locale) || 'tr';
        return (I18N[locale] && I18N[locale][key]) || (I18N.en && I18N.en[key]) || key;
      }

      const isCustom = computed(() => config.provider === 'custom');
      const isWireGuard = computed(() => config.vpnType === 'wireguard');
      const needsCredentials = computed(() => {
        if (isCustom.value) return false;
        const noCredProviders = ['mullvad', 'ivpn'];
        return !noCredProviders.includes(config.provider);
      });

      async function apiFetch(url, opts = {}) {
        const token = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith('token='));
        const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
        if (token) headers['Authorization'] = 'Bearer ' + token.split('=')[1];
        const res = await fetch(url, { ...opts, headers });
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
          throw new Error('Unexpected response from server (' + res.status + ')');
        }
        return res;
      }

      function getVolumes() {
        return [
          '${APP_VOLUME}:/gluetun'
        ];
      }

      function getEnv() {
        const env = [
          'VPN_SERVICE_PROVIDER=' + config.provider,
          'VPN_TYPE=' + config.vpnType,
          'TZ=Europe/Istanbul',
          'HTTPPROXY=on',
          'HTTPPROXY_LOG=on',
          'SHADOWSOCKS=on',
          'SHADOWSOCKS_LOG=on',
          'HTTP_CONTROL_SERVER_AUTH_DEFAULT_ROLE={"auth":"none"}'
        ];

        if (config.killSwitch) {
          env.push('FIREWALL_VPN_INPUT_PORTS=8000,8888,8388');
        }

        if (config.dnsOverTls) {
          env.push('DOT=on');
        } else {
          env.push('DOT=off');
        }

        // Provider-specific credentials
        if (config.vpnType === 'openvpn') {
          if (config.username) env.push('OPENVPN_USER=' + config.username);
          if (config.password) env.push('OPENVPN_PASSWORD=' + config.password);
          if (isCustom.value) {
            env.push('OPENVPN_CUSTOM_CONFIG=/gluetun/custom.ovpn');
          }
        } else if (config.vpnType === 'wireguard') {
          if (config.wgPrivateKey) env.push('WIREGUARD_PRIVATE_KEY=' + config.wgPrivateKey);
          if (config.wgAddresses) env.push('WIREGUARD_ADDRESSES=' + config.wgAddresses);
          if (isCustom.value) {
            if (config.wgPublicKey) env.push('WIREGUARD_PUBLIC_KEY=' + config.wgPublicKey);
            if (config.wgEndpoint) {
              const parts = config.wgEndpoint.split(':');
              if (parts.length === 2) {
                env.push('VPN_ENDPOINT_IP=' + parts[0]);
                env.push('VPN_ENDPOINT_PORT=' + parts[1]);
              }
            }
          }
        }

        // Server selection (for non-custom providers)
        if (!isCustom.value) {
          if (config.serverCountry) env.push('SERVER_COUNTRIES=' + config.serverCountry);
          if (config.serverCity) env.push('SERVER_CITIES=' + config.serverCity);
          if (config.serverHostname) env.push('SERVER_HOSTNAMES=' + config.serverHostname);
        }

        return env;
      }

      async function saveConfig() {
        try {
          const token = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith('token='));
          const headers = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = 'Bearer ' + token.split('=')[1];
          await fetch('/api/vpn-client/config', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              provider: config.provider,
              vpnType: config.vpnType,
              username: config.username,
              password: config.password,
              wgPrivateKey: config.wgPrivateKey,
              wgAddresses: config.wgAddresses,
              wgPublicKey: config.wgPublicKey,
              wgEndpoint: config.wgEndpoint,
              serverCountry: config.serverCountry,
              serverCity: config.serverCity,
              serverHostname: config.serverHostname,
              killSwitch: config.killSwitch,
              dnsOverTls: config.dnsOverTls
            })
          });
        } catch {}
      }

      async function loadConfig() {
        try {
          const token = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith('token='));
          const headers = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = 'Bearer ' + token.split('=')[1];
          const res = await fetch('/api/vpn-client/config', { headers });
          if (res.ok) {
            const data = await res.json();
            if (data && data.provider) {
              Object.assign(config, data);
            }
          }
        } catch {}
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
            controlPort.value = statusData.port;

            // Find extra port mappings for HTTP proxy and SOCKS
            if (statusData.portMappings) {
              const mappings = statusData.portMappings;
              httpProxyPort.value = mappings[HTTP_PROXY_PORT + '/tcp'] || mappings[HTTP_PROXY_PORT] || null;
              socksProxyPort.value = mappings[SOCKS_PORT + '/tcp'] || mappings[SOCKS_PORT] || null;
            }

            status.value = 'running';
            startStatusPolling();
            return;
          }

          // Save config before starting
          await saveConfig();

          // Start the container with NET_ADMIN capability and /dev/net/tun device
          const runRes = await apiFetch('/api/docker/run', {
            method: 'POST',
            body: JSON.stringify({
              image: DOCKER_IMAGE,
              appId: APP_ID,
              containerPort: CONTROL_PORT,
              volumes: getVolumes(),
              env: getEnv(),
              capAdd: ['NET_ADMIN'],
              devices: ['/dev/net/tun'],
              extraPorts: [HTTP_PROXY_PORT, SOCKS_PORT],
              restart: 'unless-stopped'
            })
          });
          const runData = await runRes.json();

          if (!runRes.ok) {
            if (runData.error && (runData.error.includes('Unable to find image') || runData.error.includes('No such image'))) {
              await pullImage();
              return;
            }
            throw new Error(runData.error || 'Container could not be started');
          }

          port.value = runData.hostPort;
          containerId.value = runData.containerId;
          controlPort.value = runData.hostPort;

          // Map extra ports
          if (runData.extraPortMappings) {
            for (const m of runData.extraPortMappings) {
              if (m.containerPort === HTTP_PROXY_PORT) httpProxyPort.value = m.hostPort;
              if (m.containerPort === SOCKS_PORT) socksProxyPort.value = m.hostPort;
            }
          }

          // Gluetun needs a few seconds to establish VPN connection
          await new Promise(r => setTimeout(r, 5000));

          status.value = 'running';
          startStatusPolling();
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

          if (!res.ok) throw new Error(data.error || 'Pull failed');

          pullProgress.value = 'Image indirildi! VPN başlatılıyor...';
          await checkAndStart();
        } catch (e) {
          errorMsg.value = 'Docker image pull error: ' + e.message;
          status.value = 'error';
        }
      }

      async function fetchVpnStatus() {
        if (!controlPort.value) return;
        try {
          // Use the proxy endpoint to reach gluetun's control server
          const res = await fetch('/proxy/' + APP_ID + '/v1/vpn/status');
          if (res.ok) {
            const data = await res.json();
            vpnStatus.value = data.status === 'running' ? 'connected' : 'disconnected';
          }
        } catch {
          vpnStatus.value = 'disconnected';
        }

        try {
          const res = await fetch('/proxy/' + APP_ID + '/v1/publicip/ip');
          if (res.ok) {
            const data = await res.json();
            publicIp.value = data.public_ip || '';
          }
        } catch {}
      }

      function startStatusPolling() {
        stopStatusPolling();
        fetchVpnStatus();
        statusInterval.value = setInterval(fetchVpnStatus, 10000);
      }

      function stopStatusPolling() {
        if (statusInterval.value) {
          clearInterval(statusInterval.value);
          statusInterval.value = null;
        }
      }

      async function stopContainer() {
        stopStatusPolling();
        try {
          await apiFetch('/api/docker/stop', {
            method: 'POST',
            body: JSON.stringify({ appId: APP_ID })
          });
        } catch {}
        port.value = null;
        containerId.value = null;
        controlPort.value = null;
        httpProxyPort.value = null;
        socksProxyPort.value = null;
        vpnStatus.value = 'disconnected';
        publicIp.value = '';
        status.value = 'idle';
      }

      async function restart() {
        await stopContainer();
        await checkAndStart();
      }

      function showConfig() {
        status.value = 'configuring';
      }

      function copyToClipboard(text) {
        navigator.clipboard.writeText(text).catch(() => {});
      }

      onMounted(async () => {
        await loadConfig();
        // Check if already running
        try {
          const res = await apiFetch('/api/docker/status/' + APP_ID);
          const data = await res.json();
          if (data.running) {
            await checkAndStart();
            return;
          }
        } catch {}
        // Show config screen if not running
        status.value = 'configuring';
      });

      return {
        status, errorMsg, port, containerId, pullProgress,
        vpnStatus, publicIp, httpProxyPort, socksProxyPort,
        config, showAdvanced, VPN_PROVIDERS,
        isCustom, isWireGuard, needsCredentials,
        t, checkAndStart, stopContainer, restart, showConfig,
        copyToClipboard, saveConfig
      };
    }
  };
})(Vue)
