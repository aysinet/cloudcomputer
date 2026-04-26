(function(Vue) {
  const { ref, onMounted, onUnmounted, nextTick } = Vue;
  const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success: console.log, error: console.error, warning: console.warn };
  return {
    setup() {
      const mmContainer = ref(null);
      var mindMap = null;
      const currentFilePath = ref('');
      const isDirty = ref(false);
      const currentLayout = ref('logicalStructure');
      const currentTheme = ref('default');
      const showRecent = ref(false);
      const recentFiles = ref([]);
      var RECENT_KEY = 'mindmap_recent_files';

      var defaultData = {
        data: { text: 'Ana Konu' },
        children: [
          { data: { text: 'Alt Konu 1' }, children: [
            { data: { text: 'Detay 1.1' }, children: [] },
            { data: { text: 'Detay 1.2' }, children: [] }
          ]},
          { data: { text: 'Alt Konu 2' }, children: [
            { data: { text: 'Detay 2.1' }, children: [] }
          ]},
          { data: { text: 'Alt Konu 3' }, children: [] }
        ]
      };

      function loadRecent() {
        try { recentFiles.value = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch(e) { recentFiles.value = []; }
      }

      function addRecent(filePath) {
        var name = filePath.split('/').pop();
        var list = recentFiles.value.filter(function(r) { return r.path !== filePath; });
        list.unshift({ name: name, path: filePath, time: Date.now() });
        if (list.length > 10) list.length = 10;
        recentFiles.value = list;
        localStorage.setItem(RECENT_KEY, JSON.stringify(list));
      }

      function loadMindMapLib() {
        return new Promise(function(resolve, reject) {
          if (window.simpleMindMap) { resolve(window.simpleMindMap.default || window.simpleMindMap); return; }
          // Check if script tag already exists but hasn't loaded yet
          var existing = document.querySelector('script[src*="simpleMindMap.umd"]');
          if (existing) {
            existing.addEventListener('load', function() { resolve(window.simpleMindMap.default || window.simpleMindMap); });
            existing.addEventListener('error', function() {
              // Retry with fresh script
              loadScript().then(resolve).catch(reject);
            });
            // Also poll in case load event already fired
            var tries = 0;
            var poll = setInterval(function() {
              tries++;
              if (window.simpleMindMap) { clearInterval(poll); resolve(window.simpleMindMap.default || window.simpleMindMap); }
              if (tries > 50) { clearInterval(poll); loadScript().then(resolve).catch(reject); }
            }, 100);
            return;
          }
          loadScript().then(resolve).catch(reject);
        });
        function loadScript() {
          return new Promise(function(resolve, reject) {
            var s = document.createElement('script');
            s.src = 'https://unpkg.com/simple-mind-map@0.12.1/dist/simpleMindMap.umd.min.js';
            s.onload = function() { resolve(window.simpleMindMap.default || window.simpleMindMap); };
            s.onerror = reject;
            document.head.appendChild(s);
          });
        }
      }

      onMounted(function() {
        loadRecent();
        nextTick(function() {
          if (!mmContainer.value) return;
          loadMindMapLib().then(function(MindMap) {
            // Ensure container has dimensions before init
            var el = mmContainer.value;
            if (!el) return;
            function initMindMap() {
              if (!el.clientWidth || !el.clientHeight) {
                setTimeout(initMindMap, 50);
                return;
              }
              mindMap = new MindMap({
                el: el,
                data: JSON.parse(JSON.stringify(defaultData)),
                layout: currentLayout.value,
                theme: currentTheme.value,
                mousewheelAction: 'zoom',
                fit: true
              });
              mindMap.on('data_change', function() { isDirty.value = true; });
            }
            initMindMap();
          }).catch(function(e) { console.error('MindMap lib load error:', e); });
        });
      });

      onUnmounted(function() {
        if (mindMap) { mindMap.destroy(); mindMap = null; }
        window.removeEventListener('keydown', handleKey);
        document.removeEventListener('click', closeRecent);
      });

      function newMap() {
        if (mindMap) {
          mindMap.setData(JSON.parse(JSON.stringify(defaultData)));
          currentFilePath.value = '';
          isDirty.value = false;
        }
      }

      async function openMap() {
        var result = await window.FileDialog.open({
          title: '📂 Mind Map Aç',
          filters: [{ label: 'Mind Map', extensions: ['.smm', '.json'] }, { label: 'All Files', extensions: ['*'] }]
        });
        if (!result) return;
        try {
          var data = JSON.parse(result.content);
          if (mindMap) {
            mindMap.setData(data);
            currentFilePath.value = result.path;
            isDirty.value = false;
            addRecent(result.path);
          }
        } catch (e) { ElMessage.error('Geçersiz mind map dosyası: ' + e.message); }
      }

      async function saveMap() {
        if (!mindMap) return;
        var data = mindMap.getData();
        var content = JSON.stringify(data, null, 2);
        if (currentFilePath.value) {
          await window.FileDialog.writeFile(currentFilePath.value, content);
          isDirty.value = false;
          addRecent(currentFilePath.value);
        } else {
          await saveMapAs();
        }
      }

      async function saveMapAs() {
        if (!mindMap) return;
        var data = mindMap.getData();
        var content = JSON.stringify(data, null, 2);
        var result = await window.FileDialog.save({
          title: '💾 Mind Map Kaydet',
          defaultName: 'mindmap.smm',
          filters: [{ label: 'Mind Map', extensions: ['.smm', '.json'] }]
        });
        if (!result) return;
        await window.FileDialog.writeFile(result, content);
        currentFilePath.value = result;
        isDirty.value = false;
        addRecent(result);
      }

      async function openRecent(rf) {
        showRecent.value = false;
        try {
          var file = await window.FileDialog.readFile(rf.path);
          if (!file) { ElMessage.error('Dosya bulunamadı: ' + rf.path); return; }
          var data = JSON.parse(file.content);
          if (mindMap) {
            mindMap.setData(data);
            currentFilePath.value = rf.path;
            isDirty.value = false;
            addRecent(rf.path);
          }
        } catch (e) { ElMessage.error('Dosya açılamadı: ' + e.message); }
      }

      function doUndo() { if (mindMap) mindMap.execCommand('BACK'); }
      function doRedo() { if (mindMap) mindMap.execCommand('FORWARD'); }
      function addChild() { if (mindMap) mindMap.execCommand('INSERT_CHILD_NODE'); }
      function addSibling() { if (mindMap) mindMap.execCommand('INSERT_NODE'); }
      function removeNode() { if (mindMap) mindMap.execCommand('REMOVE_NODE'); }

      function fitCanvas() { if (mindMap) mindMap.view.fit(); }
      function zoomIn() { if (mindMap) mindMap.view.enlarge(); }
      function zoomOut() { if (mindMap) mindMap.view.narrow(); }

      function changeLayout(layout) {
        currentLayout.value = layout;
        if (mindMap) mindMap.setLayout(layout);
      }

      function changeTheme(theme) {
        currentTheme.value = theme;
        if (mindMap) mindMap.setTheme(theme);
      }

      function handleKey(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveMap(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'o') { e.preventDefault(); openMap(); }
      }
      function closeRecent() { if (showRecent.value) showRecent.value = false; }

      onMounted(function() {
        window.addEventListener('keydown', handleKey);
        document.addEventListener('click', closeRecent);
      });

      return {
        mmContainer: mmContainer, currentFilePath: currentFilePath, isDirty: isDirty,
        currentLayout: currentLayout, currentTheme: currentTheme,
        showRecent: showRecent, recentFiles: recentFiles,
        newMap: newMap, openMap: openMap, saveMap: saveMap, saveMapAs: saveMapAs, openRecent: openRecent,
        doUndo: doUndo, doRedo: doRedo, addChild: addChild, addSibling: addSibling, removeNode: removeNode,
        fitCanvas: fitCanvas, zoomIn: zoomIn, zoomOut: zoomOut, changeLayout: changeLayout, changeTheme: changeTheme
      };
    }
  };
})(Vue);
