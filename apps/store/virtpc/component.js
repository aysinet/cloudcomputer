(function(Vue) {
  var ref = Vue.ref;
  var reactive = Vue.reactive;
  var computed = Vue.computed;
  var onMounted = Vue.onMounted;
  var onUnmounted = Vue.onUnmounted;
  var nextTick = Vue.nextTick;

  var DOCKER_IMAGE = 'dorowu/ubuntu-desktop-lxde-vnc:latest';
  var STORAGE_KEY = 'virtpc_machines';
  var VIRTPC_PREFIX = 'virtpc-';

  return {
    setup: function() {
      var view = ref('list');
      var machines = reactive([]);
      var newVmName = ref('');
      var newVmResolution = ref('1280x720');
      var statusMsg = ref('');
      var errorMsg = ref('');
      var creating = ref(false);
      var pollTimer = null;
      var vmWindows = [];

      var resolutions = [
        '1024x768', '1280x720', '1280x1024', '1366x768',
        '1440x900', '1600x900', '1920x1080'
      ];

      function getToken() {
        try {
          var c = document.cookie.split(';').map(function(x) { return x.trim(); }).find(function(x) { return x.startsWith('token='); });
          return c ? c.split('=')[1] : (localStorage.getItem('auth_token') || '');
        } catch(e) { return ''; }
      }

      function apiFetch(url, opts) {
        opts = opts || {};
        var headers = { 'Content-Type': 'application/json' };
        var token = getToken();
        if (token) headers['Authorization'] = 'Bearer ' + token;
        if (opts.headers) { for (var k in opts.headers) headers[k] = opts.headers[k]; }
        opts.headers = headers;
        return fetch(url, opts);
      }

      function sanitizeName(name) {
        return name.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 30).toLowerCase();
      }

      function getAppId(vmName) {
        return 'virtpc-' + sanitizeName(vmName);
      }

      // Persistence — save local metadata (resolution, createdAt) per VM
      function saveMachines() {
        try {
          var data = machines.map(function(m) {
            return { name: m.name, resolution: m.resolution, createdAt: m.createdAt };
          });
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch(e) {}
      }

      function getLocalMeta() {
        try {
          var data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
          var map = {};
          for (var i = 0; i < data.length; i++) {
            map[data[i].name] = data[i];
          }
          return map;
        } catch(e) { return {}; }
      }

      // Discover VirtPC containers from server
      async function refreshAll() {
        try {
          var res = await apiFetch('/api/docker/containers');
          var data = await res.json();
          var localMeta = getLocalMeta();

          // Filter to only virtpc- prefixed containers
          var virtpcContainers = data.filter(function(c) { return c.appId.startsWith(VIRTPC_PREFIX); });

          // Build a map of existing machines by name
          var existingMap = {};
          for (var i = 0; i < machines.length; i++) {
            existingMap[machines[i].name] = machines[i];
          }

          // Track which names are found from server
          var serverNames = {};

          for (var j = 0; j < virtpcContainers.length; j++) {
            var c = virtpcContainers[j];
            var vmName = c.appId.substring(VIRTPC_PREFIX.length);
            serverNames[vmName] = true;
            var meta = localMeta[vmName] || {};
            var existing = existingMap[vmName];

            if (existing) {
              existing.status = c.running ? 'running' : 'stopped';
              existing.port = c.hostPort || null;
              existing.containerId = c.containerId || null;
            } else {
              machines.push({
                name: vmName,
                resolution: meta.resolution || '1280x720',
                createdAt: meta.createdAt || Date.now(),
                status: c.running ? 'running' : 'stopped',
                port: c.hostPort || null,
                containerId: c.containerId || null
              });
            }
          }

          // Also check local-only machines (in localStorage but not on server — they were deleted)
          for (var name in localMeta) {
            if (!serverNames[name] && !existingMap[name]) {
              // Don't add machines that don't exist on server anymore
            }
          }

          // Remove machines from list that no longer exist on server (and are stopped locally)
          for (var k = machines.length - 1; k >= 0; k--) {
            if (!serverNames[machines[k].name] && machines[k].status !== 'starting' && machines[k].status !== 'creating') {
              machines.splice(k, 1);
            }
          }
        } catch(e) {
          // Fallback: check each machine individually
          for (var m = 0; m < machines.length; m++) {
            await checkStatus(machines[m]);
          }
        }
      }

      async function checkStatus(vm) {
        var appId = getAppId(vm.name);
        try {
          var res = await apiFetch('/api/docker/status/' + appId);
          var data = await res.json();
          if (data.running) {
            vm.status = 'running';
            vm.port = data.port;
            vm.containerId = data.containerId;
          } else {
            vm.status = 'stopped';
            vm.port = null;
            vm.containerId = null;
          }
        } catch(e) {
          vm.status = 'stopped';
          vm.port = null;
          vm.containerId = null;
        }
      }

      // Create VM (image will be auto-pulled by docker-manager if needed)
      async function createVm() {
        var name = sanitizeName(newVmName.value);
        if (!name) { errorMsg.value = 'Please enter a valid name (letters, numbers, dash, underscore)'; return; }
        if (name.length < 2) { errorMsg.value = 'Name must be at least 2 characters'; return; }

        var exists = machines.find(function(m) { return sanitizeName(m.name) === name; });
        if (exists) { errorMsg.value = 'A machine with this name already exists'; return; }

        creating.value = true;
        errorMsg.value = '';
        statusMsg.value = 'Creating virtual machine "' + name + '"... (Image will be pulled automatically if needed)';

        var appId = getAppId(name);
        var res_parts = newVmResolution.value.split('x');
        var resW = res_parts[0] || '1280';
        var resH = res_parts[1] || '720';

        try {
          var res = await apiFetch('/api/docker/run', {
            method: 'POST',
            body: JSON.stringify({
              image: DOCKER_IMAGE,
              appId: appId,
              containerPort: 80,
              volumes: ['/dev/shm:/dev/shm'],
              env: [
                'RESOLUTION=' + resW + 'x' + resH
              ],
              restart: 'unless-stopped'
            })
          });
          var data = await res.json();
          if (data.ok) {
            machines.push({
              name: name,
              resolution: newVmResolution.value,
              createdAt: Date.now(),
              status: 'running',
              port: data.port,
              containerId: data.containerId
            });
            saveMachines();
            newVmName.value = '';
            statusMsg.value = 'VM "' + name + '" created successfully!';
          } else {
            errorMsg.value = data.error || 'Failed to create VM';
            statusMsg.value = '';
          }
        } catch(e) {
          errorMsg.value = 'Failed: ' + e.message;
          statusMsg.value = '';
        }
        creating.value = false;
      }

      // Start VM
      async function startVm(vm) {
        vm.status = 'starting';
        errorMsg.value = '';
        statusMsg.value = 'Starting "' + vm.name + '"...';

        var appId = getAppId(vm.name);
        var res_parts = (vm.resolution || '1280x720').split('x');
        var resW = res_parts[0] || '1280';
        var resH = res_parts[1] || '720';

        try {
          var res = await apiFetch('/api/docker/run', {
            method: 'POST',
            body: JSON.stringify({
              image: DOCKER_IMAGE,
              appId: appId,
              containerPort: 80,
              volumes: ['/dev/shm:/dev/shm'],
              env: [
                'RESOLUTION=' + resW + 'x' + resH
              ],
              restart: 'unless-stopped'
            })
          });
          var data = await res.json();
          if (data.ok) {
            vm.status = 'running';
            vm.port = data.port;
            vm.containerId = data.containerId;
            statusMsg.value = '"' + vm.name + '" started.';
          } else {
            vm.status = 'stopped';
            errorMsg.value = data.error || 'Failed to start';
            statusMsg.value = '';
          }
        } catch(e) {
          vm.status = 'stopped';
          errorMsg.value = 'Start failed: ' + e.message;
          statusMsg.value = '';
        }
      }

      // Stop VM
      async function stopVm(vm) {
        vm.status = 'stopping';
        statusMsg.value = 'Stopping "' + vm.name + '"...';
        errorMsg.value = '';

        var appId = getAppId(vm.name);
        try {
          await apiFetch('/api/docker/stop', {
            method: 'POST',
            body: JSON.stringify({ appId: appId })
          });
          vm.status = 'stopped';
          vm.port = null;
          vm.containerId = null;
          statusMsg.value = '"' + vm.name + '" stopped.';
        } catch(e) {
          vm.status = 'running';
          errorMsg.value = 'Stop failed: ' + e.message;
          statusMsg.value = '';
        }
      }

      // Delete VM — always remove container and port on backend
      async function deleteVm(vm) {
        var appId = getAppId(vm.name);
        statusMsg.value = 'Deleting "' + vm.name + '"...';
        errorMsg.value = '';
        try {
          await apiFetch('/api/docker/stop', {
            method: 'POST',
            body: JSON.stringify({ appId: appId })
          });
        } catch(e) {
          // Container may already be gone, continue with local cleanup
        }
        var idx = machines.indexOf(vm);
        if (idx >= 0) machines.splice(idx, 1);
        saveMachines();
        statusMsg.value = '"' + vm.name + '" deleted.';
      }

      // Connect to VM — open in a separate WinBox window
      async function connectVm(vm) {
        if (vm.status !== 'running') return;
        var appId = getAppId(vm.name);
        // Trigger status check to ensure proxy is registered on server
        try {
          await apiFetch('/api/docker/status/' + appId);
        } catch(e) {}

        var vw = window.innerWidth;
        var vh = window.innerHeight - 56;
        var wbW = Math.min(1024, vw - 80);
        var wbH = Math.min(768, vh - 40);
        var x = Math.max(20, Math.floor((vw - wbW) / 2));
        var y = Math.max(20, Math.floor((vh - wbH) / 2));

        var wb = new WinBox({
          title: '\uD83D\uDDA5 ' + vm.name + ' (' + (vm.resolution || '1280x720') + ')',
          width: wbW,
          height: wbH,
          x: x,
          y: y,
          class: ['no-full'],
          onclose: function() {
            var idx = vmWindows.indexOf(wb);
            if (idx >= 0) vmWindows.splice(idx, 1);
            return false;
          }
        });

        var iframe = document.createElement('iframe');
        iframe.src = '/proxy/' + appId + '/';
        iframe.style.cssText = 'width:100%;height:100%;border:none';
        iframe.allow = 'clipboard-read; clipboard-write';
        wb.body.appendChild(iframe);
        vmWindows.push(wb);
      }

      // Format date
      function formatDate(ts) {
        if (!ts) return '';
        var d = new Date(ts);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      // Status icon
      function statusIcon(st) {
        switch(st) {
          case 'running': return '\u25CF';
          case 'stopped': return '\u25CB';
          case 'starting': case 'stopping': case 'checking': return '\u25D4';
          default: return '\u25CB';
        }
      }

      function statusColor(st) {
        switch(st) {
          case 'running': return '#4ade80';
          case 'stopped': return '#888';
          case 'starting': case 'stopping': case 'checking': return '#fbbf24';
          default: return '#888';
        }
      }

      // Poll status periodically
      function startPolling() {
        if (pollTimer) clearInterval(pollTimer);
        pollTimer = setInterval(function() {
          if (view.value === 'list') refreshAll();
        }, 15000);
      }

      onMounted(function() {
        refreshAll();
        startPolling();
      });

      onUnmounted(function() {
        if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
        // Close all VM windows when VirtPC app closes
        for (var i = 0; i < vmWindows.length; i++) {
          try { vmWindows[i].close(); } catch(e) {}
        }
        vmWindows.length = 0;
      });

      return {
        machines: machines,
        newVmName: newVmName,
        newVmResolution: newVmResolution,
        resolutions: resolutions,
        statusMsg: statusMsg,
        errorMsg: errorMsg,
        creating: creating,
        createVm: createVm,
        startVm: startVm,
        stopVm: stopVm,
        deleteVm: deleteVm,
        connectVm: connectVm,
        formatDate: formatDate,
        statusIcon: statusIcon,
        statusColor: statusColor,
        refreshAll: refreshAll
      };
    }
  };
})(Vue);