(function(Vue) {
  const { ref, onMounted, onUnmounted, nextTick } = Vue;

  const CDN_BASE = 'https://cdn.jsdelivr.net/npm/vim-wasm@0.0.13/';

  return {
    setup() {
      const vimCanvas = ref(null);
      const vimInput = ref(null);
      const screenWrap = ref(null);
      const loading = ref(true);
      const loadingText = ref('Loading Vim WebAssembly...');
      const errorMsg = ref('');
      const statusText = ref('Ready');
      const featureSet = ref('normal');
      const fontSize = ref(16);
      let vimInstance = null;
      let vimWasmModule = null;

      function checkCompatibility() {
        if (typeof SharedArrayBuffer === 'undefined') {
          return 'SharedArrayBuffer is not available. This browser or context does not support it. Please ensure the page is served with proper COOP/COEP headers over HTTPS.';
        }
        if (typeof Atomics === 'undefined') {
          return 'Atomics API is not available in this browser.';
        }
        return null;
      }

      async function loadVimWasm() {
        if (vimWasmModule) return vimWasmModule;
        const moduleUrl = CDN_BASE + 'vimwasm.js';
        const mod = await import(moduleUrl);
        vimWasmModule = mod;
        return mod;
      }

      async function startVim() {
        const compat = checkCompatibility();
        if (compat) {
          errorMsg.value = compat;
          loading.value = false;
          return;
        }

        loading.value = true;
        loadingText.value = 'Loading vim-wasm module...';

        try {
          const mod = await loadVimWasm();
          const VimWasm = mod.VimWasm || mod.default;

          if (!VimWasm) {
            errorMsg.value = 'Failed to load VimWasm class from module.';
            loading.value = false;
            return;
          }

          // Check compatibility via library function if available
          if (mod.checkBrowserCompatibility) {
            const err = mod.checkBrowserCompatibility();
            if (err) {
              errorMsg.value = err;
              loading.value = false;
              return;
            }
          }

          loadingText.value = 'Starting Vim...';

          const workerPath = featureSet.value === 'small'
            ? CDN_BASE + 'small/vim.js'
            : CDN_BASE + 'vim.js';

          vimInstance = new VimWasm({
            canvas: vimCanvas.value,
            input: vimInput.value,
            workerScriptPath: workerPath
          });

          vimInstance.onVimInit = function() {
            loading.value = false;
            statusText.value = 'Vim initialized';
          };

          vimInstance.onVimExit = function(status) {
            statusText.value = 'Vim exited (code: ' + status + ')';
            vimInstance = null;
          };

          vimInstance.onError = function(err) {
            statusText.value = 'Error: ' + (err.message || err);
          };

          await vimInstance.start({
            debug: false,
            perf: false,
            clipboard: true,
            dirs: ['/work'],
            files: {
              '/work/welcome.txt': 'Welcome to Vim in the browser!\n\nThis is vim-wasm running via WebAssembly.\nYou can edit text just like native Vim.\n\nTry:\n  :help\n  :e /work/newfile.txt\n  i (insert mode)\n  <Esc> (normal mode)\n  :w (save)\n  :q (quit)\n',
              '/.vim/vimrc': "set number\nset relativenumber\nset tabstop=4\nset shiftwidth=4\nset expandtab\nset autoindent\nset hlsearch\nset incsearch\nset showmatch\nset wildmenu\nset laststatus=2\nsyntax on\ncolorscheme desert\n"
            },
            cmdArgs: ['/work/welcome.txt']
          });
        } catch(e) {
          errorMsg.value = 'Failed to start Vim: ' + (e.message || e);
          loading.value = false;
        }
      }

      function stopVim() {
        if (vimInstance) {
          try {
            vimInstance.cmdline('qall!');
          } catch(e) { /* ignore */ }
          vimInstance = null;
        }
      }

      function restartVim() {
        stopVim();
        errorMsg.value = '';
        nextTick(function() {
          startVim();
        });
      }

      function switchFeature(value) {
        featureSet.value = value;
        restartVim();
      }

      function setFontSize(size) {
        fontSize.value = size;
        if (vimInstance) {
          try {
            vimInstance.cmdline('set guifont=monospace:h' + size);
          } catch(e) { /* ignore */ }
        }
      }

      function toggleFullscreen() {
        const el = screenWrap.value;
        if (!el) return;
        if (!document.fullscreenElement) {
          el.requestFullscreen().catch(function() {});
        } else {
          document.exitFullscreen().catch(function() {});
        }
      }

      function resizeCanvas() {
        if (!vimCanvas.value || !screenWrap.value) return;
        const wrap = screenWrap.value;
        vimCanvas.value.width = wrap.clientWidth;
        vimCanvas.value.height = wrap.clientHeight;
      }

      let resizeObs = null;

      onMounted(function() {
        nextTick(function() {
          resizeCanvas();
          startVim();
        });

        resizeObs = new ResizeObserver(function() {
          resizeCanvas();
        });
        if (screenWrap.value) {
          resizeObs.observe(screenWrap.value);
        }
      });

      onUnmounted(function() {
        stopVim();
        if (resizeObs) {
          resizeObs.disconnect();
          resizeObs = null;
        }
      });

      return {
        vimCanvas,
        vimInput,
        screenWrap,
        loading,
        loadingText,
        errorMsg,
        statusText,
        featureSet,
        fontSize,
        restartVim,
        switchFeature,
        setFontSize,
        toggleFullscreen
      };
    }
  };
})(Vue);
