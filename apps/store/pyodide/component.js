(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, nextTick, watch } = Vue;

  const LANGS = {
    tr: {
      loading: 'Pyodide yükleniyor...',
      loadingPkg: 'Paketler yükleniyor (NumPy, Pandas)...',
      ready: 'Python hazır! Kod yazmaya başlayın.',
      run: 'Çalıştır',
      clear: 'Temizle',
      stop: 'Durdur',
      editor: 'Editör',
      console: 'Konsol',
      loadError: 'Pyodide yüklenirken hata oluştu',
      running: 'Çalışıyor...',
      packages: 'Paketler',
      installPkg: 'Paket Yükle',
      pkgPlaceholder: 'Paket adı (ör: scipy)',
      installing: 'Yükleniyor...',
      installed: 'yüklendi',
      installError: 'Paket yüklenemedi',
      version: 'Python Sürümü',
      snippet: 'Kod Örnekleri',
      snippetNumpy: 'NumPy Örneği',
      snippetPandas: 'Pandas Örneği',
      snippetPlot: 'Matplotlib Örneği',
      pkgLoaded: 'paket yüklü',
      replHint: '>>> Python komutlarını buraya yazın',
      fontSize: 'Yazı Boyutu',
      theme: 'Tema',
      dark: 'Koyu',
      light: 'Açık',
      file: 'Dosya',
      newFile: 'Yeni Dosya',
      saveFile: 'Dosyayı Kaydet',
      loadFile: 'Dosya Yükle'
    },
    en: {
      loading: 'Loading Pyodide...',
      loadingPkg: 'Loading packages (NumPy, Pandas)...',
      ready: 'Python is ready! Start coding.',
      run: 'Run',
      clear: 'Clear',
      stop: 'Stop',
      editor: 'Editor',
      console: 'Console',
      loadError: 'Error loading Pyodide',
      running: 'Running...',
      packages: 'Packages',
      installPkg: 'Install Package',
      pkgPlaceholder: 'Package name (e.g. scipy)',
      installing: 'Installing...',
      installed: 'installed',
      installError: 'Failed to install package',
      version: 'Python Version',
      snippet: 'Code Snippets',
      snippetNumpy: 'NumPy Example',
      snippetPandas: 'Pandas Example',
      snippetPlot: 'Matplotlib Example',
      pkgLoaded: 'packages loaded',
      replHint: '>>> Type Python commands here',
      fontSize: 'Font Size',
      theme: 'Theme',
      dark: 'Dark',
      light: 'Light',
      file: 'File',
      newFile: 'New File',
      saveFile: 'Save File',
      loadFile: 'Load File'
    }
  };

  function getLocale() {
    try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; }
  }

  const SNIPPETS = {
    numpy: `import numpy as np

# Rastgele 5x5 matris
m = np.random.rand(5, 5)
print("Matris:\\n", m)
print("Ortalama:", m.mean())
print("Toplam:", m.sum())
print("Determinant:", np.linalg.det(m))`,
    pandas: `import pandas as pd
import numpy as np

df = pd.DataFrame({
    'İsim': ['Ali', 'Ayşe', 'Mehmet', 'Fatma', 'Can'],
    'Yaş': [28, 34, 45, 23, 31],
    'Şehir': ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'],
    'Maaş': [15000, 22000, 30000, 12000, 18000]
})

print(df)
print("\\nİstatistikler:")
print(df.describe())
print("\\nOrtalama maaş:", df['Maaş'].mean())`,
    plot: `import matplotlib
matplotlib.use('AGG')
import matplotlib.pyplot as plt
import numpy as np
import io, base64

x = np.linspace(0, 2 * np.pi, 100)
fig, ax = plt.subplots(figsize=(8, 4))
ax.plot(x, np.sin(x), label='sin(x)', linewidth=2)
ax.plot(x, np.cos(x), label='cos(x)', linewidth=2)
ax.set_title('Trigonometrik Fonksiyonlar')
ax.legend()
ax.grid(True, alpha=0.3)

buf = io.BytesIO()
fig.savefig(buf, format='png', dpi=100, bbox_inches='tight')
buf.seek(0)
img_b64 = base64.b64encode(buf.read()).decode()
plt.close(fig)

# Görseli HTML olarak göster
from js import document
el = document.createElement('img')
el.src = 'data:image/png;base64,' + img_b64
el.style.maxWidth = '100%'
document.getElementById('pyodide-plot-area').innerHTML = ''
document.getElementById('pyodide-plot-area').appendChild(el)
print("Grafik oluşturuldu!")`
  };

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      const pyStatus = ref('loading'); // loading | loadingPkg | ready | error
      const errorMsg = ref('');
      const editorCode = ref('print("Merhaba Dünya! 🐍")');
      const consoleOutput = ref([]);
      const isRunning = ref(false);
      const replInput = ref('');
      const replHistory = ref([]);
      const replHistoryIdx = ref(-1);
      const activeTab = ref('editor'); // editor | console
      const fontSize = ref(14);
      const loadedPackages = ref(['numpy', 'pandas']);
      const newPkg = ref('');
      const installingPkg = ref(false);
      const showPkgPanel = ref(false);

      let pyodide = null;
      const editorRef = ref(null);
      const replRef = ref(null);
      const outputRef = ref(null);

      function addOutput(text, type) {
        consoleOutput.value.push({ text, type: type || 'stdout', ts: Date.now() });
        nextTick(() => {
          if (outputRef.value) outputRef.value.scrollTop = outputRef.value.scrollHeight;
        });
      }

      async function initPyodide() {
        pyStatus.value = 'loading';
        try {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js';
          document.head.appendChild(script);

          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = () => reject(new Error('Pyodide script yüklenemedi'));
          });

          pyodide = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/'
          });

          pyStatus.value = 'loadingPkg';

          await pyodide.loadPackage(['numpy', 'pandas']);

          pyodide.setStdout({ batched: (text) => addOutput(text, 'stdout') });
          pyodide.setStderr({ batched: (text) => addOutput(text, 'stderr') });

          pyStatus.value = 'ready';
          addOutput('Python ' + pyodide.version + ' (Pyodide)', 'info');
          addOutput(L('ready'), 'info');
        } catch (e) {
          errorMsg.value = e.message;
          pyStatus.value = 'error';
        }
      }

      async function runCode() {
        if (!pyodide || isRunning.value) return;
        const code = editorCode.value.trim();
        if (!code) return;

        isRunning.value = true;
        activeTab.value = 'console';
        addOutput('>>> ' + code.split('\n')[0] + (code.includes('\n') ? ' ...' : ''), 'input');

        try {
          const result = await pyodide.runPythonAsync(code);
          if (result !== undefined && result !== null) {
            addOutput(String(result), 'result');
          }
        } catch (e) {
          addOutput(e.message, 'stderr');
        }
        isRunning.value = false;
      }

      async function runRepl() {
        if (!pyodide || !replInput.value.trim()) return;
        const code = replInput.value.trim();
        replHistory.value.push(code);
        replHistoryIdx.value = replHistory.value.length;
        replInput.value = '';

        addOutput('>>> ' + code, 'input');
        isRunning.value = true;
        try {
          const result = await pyodide.runPythonAsync(code);
          if (result !== undefined && result !== null) {
            addOutput(String(result), 'result');
          }
        } catch (e) {
          addOutput(e.message, 'stderr');
        }
        isRunning.value = false;
        nextTick(() => { if (replRef.value) replRef.value.focus(); });
      }

      function replKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          runRepl();
        } else if (e.key === 'ArrowUp') {
          if (replHistoryIdx.value > 0) {
            replHistoryIdx.value--;
            replInput.value = replHistory.value[replHistoryIdx.value];
          }
          e.preventDefault();
        } else if (e.key === 'ArrowDown') {
          if (replHistoryIdx.value < replHistory.value.length - 1) {
            replHistoryIdx.value++;
            replInput.value = replHistory.value[replHistoryIdx.value];
          } else {
            replHistoryIdx.value = replHistory.value.length;
            replInput.value = '';
          }
          e.preventDefault();
        }
      }

      function clearConsole() {
        consoleOutput.value = [];
        const plotArea = document.getElementById('pyodide-plot-area');
        if (plotArea) plotArea.innerHTML = '';
      }

      function loadSnippet(key) {
        editorCode.value = SNIPPETS[key] || '';
        activeTab.value = 'editor';
      }

      async function installPackage() {
        if (!pyodide || !newPkg.value.trim() || installingPkg.value) return;
        const pkg = newPkg.value.trim();
        installingPkg.value = true;
        addOutput(L('installing') + ' ' + pkg + '...', 'info');
        try {
          await pyodide.loadPackage(pkg);
          loadedPackages.value.push(pkg);
          addOutput('✅ ' + pkg + ' ' + L('installed'), 'info');
          newPkg.value = '';
        } catch (e) {
          addOutput('❌ ' + L('installError') + ': ' + e.message, 'stderr');
        }
        installingPkg.value = false;
      }

      function editorKeyDown(e) {
        if (e.key === 'Tab') {
          e.preventDefault();
          const ta = e.target;
          const start = ta.selectionStart;
          const end = ta.selectionEnd;
          editorCode.value = editorCode.value.substring(0, start) + '    ' + editorCode.value.substring(end);
          nextTick(() => { ta.selectionStart = ta.selectionEnd = start + 4; });
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          runCode();
        }
      }

      function downloadFile() {
        const blob = new Blob([editorCode.value], { type: 'text/x-python' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'script.py';
        a.click();
        URL.revokeObjectURL(a.href);
      }

      function uploadFile() {
        const inp = document.createElement('input');
        inp.type = 'file';
        inp.accept = '.py,.txt';
        inp.onchange = () => {
          const f = inp.files[0];
          if (!f) return;
          const reader = new FileReader();
          reader.onload = () => { editorCode.value = reader.result; };
          reader.readAsText(f);
        };
        inp.click();
      }

      function onLocaleChanged() { locale.value = getLocale(); }

      onMounted(() => {
        window.addEventListener('locale-changed', onLocaleChanged);
        initPyodide();
      });

      onUnmounted(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
      });

      return {
        locale, L,
        pyStatus, errorMsg,
        editorCode, consoleOutput,
        isRunning, replInput,
        activeTab, fontSize,
        loadedPackages, newPkg, installingPkg, showPkgPanel,
        editorRef, replRef, outputRef,
        runCode, runRepl, replKeyDown,
        clearConsole, loadSnippet,
        installPackage, editorKeyDown,
        downloadFile, uploadFile, initPyodide
      };
    }
  };
})(Vue);
