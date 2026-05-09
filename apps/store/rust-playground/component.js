(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, nextTick, watch } = Vue;

  const LANGS = {
    tr: {
      run: 'Çalıştır', compiling: 'Derleniyor...', format: 'Biçimle', share: 'Paylaş',
      output: 'Çıktı', errors: 'Hatalar', success: 'Başarılı', lines: 'Satır',
      channel: 'Kanal', edition: 'Sürüm', mode: 'Mod', copy: 'Kopyala',
      copied: 'Kopyalandı!', openFile: 'Dosya Aç', saveFile: 'Kaydet',
      shareMsg: 'Kodunuz Rust Playground\'a yüklendi:', noOutput: 'Çıktı yok',
      compileErr: 'Derleme hatası oluştu', networkErr: 'Bağlantı hatası — internet bağlantınızı kontrol edin',
      formatOk: 'Biçimlendirildi', formatErr: 'Biçimlendirme hatası'
    },
    en: {
      run: 'Run', compiling: 'Compiling...', format: 'Format', share: 'Share',
      output: 'Output', errors: 'Errors', success: 'Success', lines: 'Lines',
      channel: 'Channel', edition: 'Edition', mode: 'Mode', copy: 'Copy',
      copied: 'Copied!', openFile: 'Open File', saveFile: 'Save',
      shareMsg: 'Your code has been uploaded to Rust Playground:', noOutput: 'No output',
      compileErr: 'Compilation error', networkErr: 'Network error — check your connection',
      formatOk: 'Formatted', formatErr: 'Format error'
    },
    de: {
      run: 'Ausführen', compiling: 'Kompilierung...', format: 'Formatieren', share: 'Teilen',
      output: 'Ausgabe', errors: 'Fehler', success: 'Erfolgreich', lines: 'Zeilen',
      channel: 'Kanal', edition: 'Edition', mode: 'Modus', copy: 'Kopieren',
      copied: 'Kopiert!', openFile: 'Datei öffnen', saveFile: 'Speichern',
      shareMsg: 'Ihr Code wurde auf Rust Playground hochgeladen:', noOutput: 'Keine Ausgabe',
      compileErr: 'Kompilierungsfehler', networkErr: 'Netzwerkfehler', formatOk: 'Formatiert', formatErr: 'Formatierungsfehler'
    },
    fr: {
      run: 'Exécuter', compiling: 'Compilation...', format: 'Formater', share: 'Partager',
      output: 'Sortie', errors: 'Erreurs', success: 'Succès', lines: 'Lignes',
      channel: 'Canal', edition: 'Édition', mode: 'Mode', copy: 'Copier',
      copied: 'Copié!', openFile: 'Ouvrir', saveFile: 'Enregistrer',
      shareMsg: 'Votre code a été téléchargé sur Rust Playground:', noOutput: 'Aucune sortie',
      compileErr: 'Erreur de compilation', networkErr: 'Erreur réseau', formatOk: 'Formaté', formatErr: 'Erreur de formatage'
    },
    es: {
      run: 'Ejecutar', compiling: 'Compilando...', format: 'Formatear', share: 'Compartir',
      output: 'Salida', errors: 'Errores', success: 'Éxito', lines: 'Líneas',
      channel: 'Canal', edition: 'Edición', mode: 'Modo', copy: 'Copiar',
      copied: '¡Copiado!', openFile: 'Abrir', saveFile: 'Guardar',
      shareMsg: 'Su código se ha subido a Rust Playground:', noOutput: 'Sin salida',
      compileErr: 'Error de compilación', networkErr: 'Error de red', formatOk: 'Formateado', formatErr: 'Error de formato'
    },
    ru: {
      run: 'Запуск', compiling: 'Компиляция...', format: 'Форматировать', share: 'Поделиться',
      output: 'Вывод', errors: 'Ошибки', success: 'Успешно', lines: 'Строки',
      channel: 'Канал', edition: 'Редакция', mode: 'Режим', copy: 'Копировать',
      copied: 'Скопировано!', openFile: 'Открыть', saveFile: 'Сохранить',
      shareMsg: 'Ваш код загружен на Rust Playground:', noOutput: 'Нет вывода',
      compileErr: 'Ошибка компиляции', networkErr: 'Ошибка сети', formatOk: 'Отформатировано', formatErr: 'Ошибка форматирования'
    },
    zh: {
      run: '运行', compiling: '编译中...', format: '格式化', share: '分享',
      output: '输出', errors: '错误', success: '成功', lines: '行',
      channel: '通道', edition: '版本', mode: '模式', copy: '复制',
      copied: '已复制!', openFile: '打开文件', saveFile: '保存',
      shareMsg: '您的代码已上传至 Rust Playground：', noOutput: '无输出',
      compileErr: '编译错误', networkErr: '网络错误', formatOk: '已格式化', formatErr: '格式化错误'
    },
    ja: {
      run: '実行', compiling: 'コンパイル中...', format: 'フォーマット', share: '共有',
      output: '出力', errors: 'エラー', success: '成功', lines: '行',
      channel: 'チャンネル', edition: 'エディション', mode: 'モード', copy: 'コピー',
      copied: 'コピーしました!', openFile: 'ファイルを開く', saveFile: '保存',
      shareMsg: 'コードがRust Playgroundにアップロードされました：', noOutput: '出力なし',
      compileErr: 'コンパイルエラー', networkErr: 'ネットワークエラー', formatOk: 'フォーマット済み', formatErr: 'フォーマットエラー'
    },
    it: {
      run: 'Esegui', compiling: 'Compilazione...', format: 'Formatta', share: 'Condividi',
      output: 'Output', errors: 'Errori', success: 'Successo', lines: 'Righe',
      channel: 'Canale', edition: 'Edizione', mode: 'Modalità', copy: 'Copia',
      copied: 'Copiato!', openFile: 'Apri', saveFile: 'Salva',
      shareMsg: 'Il codice è stato caricato su Rust Playground:', noOutput: 'Nessun output',
      compileErr: 'Errore di compilazione', networkErr: 'Errore di rete', formatOk: 'Formattato', formatErr: 'Errore di formattazione'
    },
    ar: {
      run: 'تشغيل', compiling: 'جاري الترجمة...', format: 'تنسيق', share: 'مشاركة',
      output: 'المخرجات', errors: 'الأخطاء', success: 'نجاح', lines: 'سطور',
      channel: 'القناة', edition: 'الإصدار', mode: 'الوضع', copy: 'نسخ',
      copied: 'تم النسخ!', openFile: 'فتح ملف', saveFile: 'حفظ',
      shareMsg: 'تم رفع الكود إلى Rust Playground:', noOutput: 'لا يوجد مخرجات',
      compileErr: 'خطأ في الترجمة', networkErr: 'خطأ في الشبكة', formatOk: 'تم التنسيق', formatErr: 'خطأ في التنسيق'
    },
    ko: {
      run: '실행', compiling: '컴파일 중...', format: '포맷', share: '공유',
      output: '출력', errors: '오류', success: '성공', lines: '줄',
      channel: '채널', edition: '에디션', mode: '모드', copy: '복사',
      copied: '복사됨!', openFile: '파일 열기', saveFile: '저장',
      shareMsg: '코드가 Rust Playground에 업로드되었습니다:', noOutput: '출력 없음',
      compileErr: '컴파일 오류', networkErr: '네트워크 오류', formatOk: '포맷 완료', formatErr: '포맷 오류'
    },
    hi: {
      run: 'चलाएं', compiling: 'संकलन हो रहा है...', format: 'फॉर्मेट', share: 'शेयर',
      output: 'आउटपुट', errors: 'त्रुटियाँ', success: 'सफल', lines: 'पंक्तियाँ',
      channel: 'चैनल', edition: 'संस्करण', mode: 'मोड', copy: 'कॉपी',
      copied: 'कॉपी हो गया!', openFile: 'फ़ाइल खोलें', saveFile: 'सहेजें',
      shareMsg: 'आपका कोड Rust Playground पर अपलोड किया गया:', noOutput: 'कोई आउटपुट नहीं',
      compileErr: 'संकलन त्रुटि', networkErr: 'नेटवर्क त्रुटि', formatOk: 'फॉर्मेट हो गया', formatErr: 'फॉर्मेट त्रुटि'
    },
    pt: {
      run: 'Executar', compiling: 'Compilando...', format: 'Formatar', share: 'Compartilhar',
      output: 'Saída', errors: 'Erros', success: 'Sucesso', lines: 'Linhas',
      channel: 'Canal', edition: 'Edição', mode: 'Modo', copy: 'Copiar',
      copied: 'Copiado!', openFile: 'Abrir', saveFile: 'Salvar',
      shareMsg: 'Seu código foi enviado para o Rust Playground:', noOutput: 'Sem saída',
      compileErr: 'Erro de compilação', networkErr: 'Erro de rede', formatOk: 'Formatado', formatErr: 'Erro de formatação'
    }
  };

  function getLocale() {
    try { return localStorage.getItem('sys_locale') || 'tr'; } catch(e) { return 'tr'; }
  }

  const DEFAULT_CODE = `fn main() {
    println!("Hello, World!");

    // Variables
    let x = 5;
    let y = 10;
    println!("{} + {} = {}", x, y, x + y);

    // Vector
    let nums: Vec<i32> = (1..=5).collect();
    println!("Numbers: {:?}", nums);

    // Iterator
    let sum: i32 = nums.iter().sum();
    println!("Sum: {}", sum);
}
`;

  const EXAMPLES = {
    hello: `fn main() {\n    println!("Hello, World!");\n}\n`,
    fibonacci: `fn fibonacci(n: u64) -> u64 {\n    match n {\n        0 => 0,\n        1 => 1,\n        _ => fibonacci(n - 1) + fibonacci(n - 2),\n    }\n}\n\nfn main() {\n    for i in 0..10 {\n        println!("fib({}) = {}", i, fibonacci(i));\n    }\n}\n`,
    structs: `#[derive(Debug)]\nstruct Point {\n    x: f64,\n    y: f64,\n}\n\nimpl Point {\n    fn new(x: f64, y: f64) -> Self {\n        Point { x, y }\n    }\n\n    fn distance(&self, other: &Point) -> f64 {\n        ((self.x - other.x).powi(2) + (self.y - other.y).powi(2)).sqrt()\n    }\n}\n\nfn main() {\n    let p1 = Point::new(0.0, 0.0);\n    let p2 = Point::new(3.0, 4.0);\n    println!("Distance: {:.2}", p1.distance(&p2));\n}\n`,
    enums: `enum Shape {\n    Circle(f64),\n    Rectangle(f64, f64),\n    Triangle(f64, f64),\n}\n\nimpl Shape {\n    fn area(&self) -> f64 {\n        match self {\n            Shape::Circle(r) => std::f64::consts::PI * r * r,\n            Shape::Rectangle(w, h) => w * h,\n            Shape::Triangle(b, h) => 0.5 * b * h,\n        }\n    }\n}\n\nfn main() {\n    let shapes = vec![\n        Shape::Circle(5.0),\n        Shape::Rectangle(4.0, 6.0),\n        Shape::Triangle(3.0, 8.0),\n    ];\n    for (i, s) in shapes.iter().enumerate() {\n        println!("Shape {}: area = {:.2}", i+1, s.area());\n    }\n}\n`,
    traits: `trait Greetable {\n    fn greet(&self) -> String;\n}\n\nstruct Person { name: String }\nstruct Robot { id: u32 }\n\nimpl Greetable for Person {\n    fn greet(&self) -> String {\n        format!("Hi, I'm {}!", self.name)\n    }\n}\n\nimpl Greetable for Robot {\n    fn greet(&self) -> String {\n        format!("Beep boop! Unit #{}", self.id)\n    }\n}\n\nfn say_hello(entity: &dyn Greetable) {\n    println!("{}", entity.greet());\n}\n\nfn main() {\n    say_hello(&Person { name: "Alice".into() });\n    say_hello(&Robot { id: 42 });\n}\n`,
    iterators: `fn main() {\n    let data = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];\n\n    let result: Vec<i32> = data.iter()\n        .filter(|&&x| x % 2 == 0)\n        .map(|&x| x * x)\n        .collect();\n    println!("Even squares: {:?}", result);\n\n    let sum: i32 = data.iter().sum();\n    let product: i32 = data.iter().product();\n    println!("Sum: {}, Product: {}", sum, product);\n\n    let words = vec!["hello", "world", "rust"];\n    let upper: Vec<String> = words.iter().map(|w| w.to_uppercase()).collect();\n    println!("Upper: {:?}", upper);\n}\n`
  };

  const PLAYGROUND_API = 'https://play.rust-lang.org';

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      const editorContainer = ref(null);
      const fileInput = ref(null);
      const shareInput = ref(null);
      let editor = null;
      let monacoInstance = null;

      const channel = ref('stable');
      const edition = ref('2021');
      const mode = ref('debug');
      const running = ref(false);
      const outputVisible = ref(false);
      const outputTab = ref('output');
      const outputText = ref('');
      const stderrText = ref('');
      const asmText = ref('');
      const llvmIr = ref('');
      const mirText = ref('');
      const wasmText = ref('');
      const exitCode = ref(null);
      const execTime = ref('');
      const outputHeight = ref(200);
      const cursorInfo = ref('Ln 1, Col 1');
      const lineCount = ref(1);
      const showShareDialog = ref(false);
      const shareUrl = ref('');

      const currentOutput = computed(function() {
        switch (outputTab.value) {
          case 'stderr': return stderrText.value || '';
          case 'asm': return asmText.value || '';
          case 'llvm': return llvmIr.value || '';
          case 'mir': return mirText.value || '';
          case 'wasm': return wasmText.value || '';
          default: return outputText.value || L('noOutput');
        }
      });

      function getCode() {
        return editor ? editor.getValue() : DEFAULT_CODE;
      }

      function setCode(code) {
        if (editor) editor.setValue(code);
      }

      function initMonaco() {
        if (typeof require === 'undefined' || !require.config) return;
        require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs' }});
        require(['vs/editor/editor.main'], function(monaco) {
          monacoInstance = monaco;
          editor = monaco.editor.create(editorContainer.value, {
            value: DEFAULT_CODE,
            language: 'rust',
            theme: 'vs-dark',
            fontSize: 14,
            fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            roundedSelection: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: 'off',
            folding: true,
            bracketPairColorization: { enabled: true },
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            renderWhitespace: 'selection',
            padding: { top: 8, bottom: 8 }
          });

          editor.onDidChangeCursorPosition(function(e) {
            cursorInfo.value = 'Ln ' + e.position.lineNumber + ', Col ' + e.position.column;
          });

          editor.onDidChangeModelContent(function() {
            lineCount.value = editor.getModel().getLineCount();
          });

          lineCount.value = editor.getModel().getLineCount();

          editor.addAction({
            id: 'rust-run',
            label: 'Run Code',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
            run: function() { runCode(); }
          });

          editor.addAction({
            id: 'rust-format',
            label: 'Format Code',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF],
            run: function() { formatCode(); }
          });

          editor.addAction({
            id: 'rust-save',
            label: 'Save File',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
            run: function() { saveLocalFile(); }
          });
        });
      }

      async function runCode() {
        if (running.value) return;
        running.value = true;
        outputVisible.value = true;
        outputTab.value = 'output';
        outputText.value = '';
        stderrText.value = '';
        exitCode.value = null;
        execTime.value = '';
        asmText.value = '';
        llvmIr.value = '';
        mirText.value = '';
        wasmText.value = '';

        var startTime = Date.now();
        try {
          var res = await fetch(PLAYGROUND_API + '/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channel: channel.value,
              mode: mode.value,
              edition: edition.value,
              crateType: 'bin',
              tests: false,
              code: getCode(),
              backtrace: false
            })
          });
          var data = await res.json();
          var elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
          execTime.value = elapsed + 's';

          if (data.success) {
            outputText.value = data.stdout || L('noOutput');
            stderrText.value = data.stderr || '';
            exitCode.value = 0;
          } else {
            outputText.value = data.stdout || '';
            stderrText.value = data.stderr || L('compileErr');
            exitCode.value = 1;
            if (data.stderr) outputTab.value = 'stderr';
          }
        } catch(err) {
          outputText.value = '';
          stderrText.value = L('networkErr') + '\n' + (err.message || '');
          exitCode.value = -1;
          outputTab.value = 'stderr';
        }
        running.value = false;
      }

      async function formatCode() {
        if (running.value) return;
        running.value = true;
        try {
          var res = await fetch(PLAYGROUND_API + '/format', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channel: channel.value,
              edition: edition.value,
              code: getCode()
            })
          });
          var data = await res.json();
          if (data.success) {
            setCode(data.code);
            showNotify(L('formatOk'), 'success');
          } else {
            stderrText.value = data.stderr || L('formatErr');
            outputVisible.value = true;
            outputTab.value = 'stderr';
          }
        } catch(err) {
          showNotify(L('networkErr'), 'error');
        }
        running.value = false;
      }

      async function shareCode() {
        try {
          var res = await fetch(PLAYGROUND_API + '/meta/gist/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: getCode() })
          });
          var data = await res.json();
          if (data.id) {
            shareUrl.value = PLAYGROUND_API + '/?version=' + channel.value + '&mode=' + mode.value + '&edition=' + edition.value + '&gist=' + data.id;
            showShareDialog.value = true;
          }
        } catch(err) {
          showNotify(L('networkErr'), 'error');
        }
      }

      function copyShareLink() {
        if (shareInput.value) {
          shareInput.value.select();
          navigator.clipboard.writeText(shareUrl.value);
          showNotify(L('copied'), 'success');
        }
      }

      function copyOutput() {
        navigator.clipboard.writeText(currentOutput.value);
        showNotify(L('copied'), 'success');
      }

      function clearOutput() {
        outputVisible.value = false;
        outputText.value = '';
        stderrText.value = '';
        asmText.value = '';
        llvmIr.value = '';
        mirText.value = '';
        wasmText.value = '';
        exitCode.value = null;
        execTime.value = '';
      }

      function openLocalFile() {
        if (fileInput.value) fileInput.value.click();
      }

      function onFileSelected(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          setCode(ev.target.result);
        };
        reader.readAsText(file);
        e.target.value = '';
      }

      function saveLocalFile() {
        var code = getCode();
        var blob = new Blob([code], { type: 'text/plain' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'main.rs';
        a.click();
        URL.revokeObjectURL(a.href);
      }

      function showNotify(msg, type) {
        var ElMsg = window.ElementPlus && window.ElementPlus.ElMessage;
        if (ElMsg) {
          ElMsg({ message: msg, type: type || 'info', duration: 2000 });
        }
      }

      var resizing = false;
      var resizeStartY = 0;
      var resizeStartH = 0;

      function startResize(e) {
        resizing = true;
        resizeStartY = e.clientY;
        resizeStartH = outputHeight.value;
        document.addEventListener('mousemove', doResize);
        document.addEventListener('mouseup', stopResize);
        e.preventDefault();
      }

      function doResize(e) {
        if (!resizing) return;
        var diff = resizeStartY - e.clientY;
        var newH = Math.max(80, Math.min(600, resizeStartH + diff));
        outputHeight.value = newH;
      }

      function stopResize() {
        resizing = false;
        document.removeEventListener('mousemove', doResize);
        document.removeEventListener('mouseup', stopResize);
      }

      function onLocaleChanged() {
        locale.value = getLocale();
      }

      onMounted(function() {
        window.addEventListener('locale-changed', onLocaleChanged);
        nextTick(function() { initMonaco(); });
      });

      onUnmounted(function() {
        window.removeEventListener('locale-changed', onLocaleChanged);
        if (editor) { editor.dispose(); editor = null; }
      });

      return {
        locale, L,
        editorContainer, fileInput, shareInput,
        channel, edition, mode,
        running, outputVisible, outputTab,
        outputText, stderrText, asmText, llvmIr, mirText, wasmText,
        exitCode, execTime, outputHeight,
        cursorInfo, lineCount,
        currentOutput,
        showShareDialog, shareUrl,
        runCode, formatCode, shareCode,
        copyShareLink, copyOutput, clearOutput,
        openLocalFile, onFileSelected, saveLocalFile,
        startResize
      };
    }
  };
})(Vue);
