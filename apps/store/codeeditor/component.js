(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, nextTick } = Vue;
  return {
    setup() {
      const editorContainer = ref(null);
      let editor = null;
      let monacoInstance = null;

      const LANG_MAP = {
        javascript: { monaco: 'javascript', name: 'JavaScript', ext: '.js', template: '// JavaScript\nconsole.log("Hello, World!");\n' },
        typescript: { monaco: 'typescript', name: 'TypeScript', ext: '.ts', template: '// TypeScript\nconst msg: string = "Hello, World!";\nconsole.log(msg);\n' },
        python: { monaco: 'python', name: 'Python', ext: '.py', template: '# Python\nprint("Hello, World!")\n' },
        go: { monaco: 'go', name: 'Go', ext: '.go', template: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello, World!")\n}\n' },
        php: { monaco: 'php', name: 'PHP', ext: '.php', template: '<?php\n// PHP\necho "Hello, World!\\n";\n?>\n' },
        c: { monaco: 'c', name: 'C', ext: '.c', template: '#include <stdio.h>\n\nint main() {\n\tprintf("Hello, World!\\n");\n\treturn 0;\n}\n' },
        cpp: { monaco: 'cpp', name: 'C++', ext: '.cpp', template: '#include <iostream>\nusing namespace std;\n\nint main() {\n\tcout << "Hello, World!" << endl;\n\treturn 0;\n}\n' },
        csharp: { monaco: 'csharp', name: 'C#', ext: '.csx', template: '// C# Script\nConsole.WriteLine("Hello, World!");\n' },
        java: { monaco: 'java', name: 'Java', ext: '.java', template: 'public class Main {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello, World!");\n\t}\n}\n' },
        rust: { monaco: 'rust', name: 'Rust', ext: '.rs', template: 'fn main() {\n\tprintln!("Hello, World!");\n}\n' },
        ruby: { monaco: 'ruby', name: 'Ruby', ext: '.rb', template: '# Ruby\nputs "Hello, World!"\n' },
        perl: { monaco: 'perl', name: 'Perl', ext: '.pl', template: '#!/usr/bin/perl\nprint "Hello, World!\\n";\n' },
        bash: { monaco: 'shell', name: 'Bash', ext: '.sh', template: '#!/bin/bash\necho "Hello, World!"\n' },
        powershell: { monaco: 'powershell', name: 'PowerShell', ext: '.ps1', template: '# PowerShell\nWrite-Host "Hello, World!"\n' },
        markdown: { monaco: 'markdown', name: 'Markdown', ext: '.md', template: '# Hello World\n\nThis is a **Markdown** document.\n\n## Features\n\n- Item 1\n- Item 2\n- Item 3\n\n```javascript\nconsole.log("Hello!");\n```\n' },
        html: { monaco: 'html', name: 'HTML', ext: '.html', template: '<!DOCTYPE html>\n<html lang="en">\n<head>\n\t<meta charset="UTF-8">\n\t<title>Document</title>\n</head>\n<body>\n\t<h1>Hello, World!</h1>\n</body>\n</html>\n' },
        css: { monaco: 'css', name: 'CSS', ext: '.css', template: '/* CSS */\nbody {\n\tfont-family: sans-serif;\n\tmargin: 0;\n\tpadding: 20px;\n\tbackground: #f5f5f5;\n}\n' },
        json: { monaco: 'json', name: 'JSON', ext: '.json', template: '{\n\t"name": "example",\n\t"version": "1.0.0",\n\t"description": "Hello, World!"\n}\n' },
        xml: { monaco: 'xml', name: 'XML', ext: '.xml', template: '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n\t<greeting>Hello, World!</greeting>\n</root>\n' },
        yaml: { monaco: 'yaml', name: 'YAML', ext: '.yaml', template: '# YAML\nname: example\nversion: 1.0.0\ndescription: Hello, World!\n' },
        sql: { monaco: 'sql', name: 'SQL', ext: '.sql', template: '-- SQL\nSELECT * FROM users\nWHERE active = 1\nORDER BY name;\n' }
      };

      const language = ref('javascript');
      const theme = ref('vs-dark');
      const fontSize = ref(14);
      const showMinimap = ref(false);
      const running = ref(false);
      const outputVisible = ref(false);
      const outputTab = ref('output');
      const outputText = ref('');
      const errorText = ref('');
      const exitCode = ref(null);
      const outputHeight = ref(180);
      const cursorInfo = ref('Ln 1, Col 1');
      const lineCount = ref(1);
      const currentFilePath = ref('');

      const languages = computed(function() { return Object.keys(LANG_MAP).map(function(k) { return { id: k, name: LANG_MAP[k].name, ext: LANG_MAP[k].ext }; }); });
      const fileName = computed(function() { return 'main' + (LANG_MAP[language.value] ? LANG_MAP[language.value].ext : '.txt'); });
      const runText = computed(function() { return 'Run'; });
      const runningText = computed(function() { return 'Running...'; });

      function getToken() { try { return localStorage.getItem('auth_token') || ''; } catch(e) { return ''; } }

      function initMonaco() {
        if (typeof require === 'undefined' || !require.config) return;
        require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs' }});
        require(['vs/editor/editor.main'], function(monaco) {
          monacoInstance = monaco;
          editor = monaco.editor.create(editorContainer.value, {
            value: LANG_MAP[language.value] ? LANG_MAP[language.value].template : '',
            language: LANG_MAP[language.value] ? LANG_MAP[language.value].monaco : 'plaintext',
            theme: theme.value,
            fontSize: fontSize.value,
            fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
            minimap: { enabled: showMinimap.value },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            roundedSelection: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            tabSize: 4,
            insertSpaces: false,
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
          editor.addAction({ id: 'run-code', label: 'Run Code', keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter], run: function() { runCode(); } });
          editor.addAction({ id: 'save-file', label: 'Save File', keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS], run: function() { saveFile(); } });
          editor.addAction({ id: 'open-file', label: 'Open File', keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyO], run: function() { openFile(); } });
        });
      }

      function setLanguage(lang) {
        language.value = lang;
        if (editor && monacoInstance) {
          var model = editor.getModel();
          monacoInstance.editor.setModelLanguage(model, LANG_MAP[lang] ? LANG_MAP[lang].monaco : 'plaintext');
          var current = editor.getValue();
          var isDefault = Object.values(LANG_MAP).some(function(l) { return l.template.trim() === current.trim(); });
          if (!current.trim() || isDefault) { editor.setValue(LANG_MAP[lang] ? LANG_MAP[lang].template : ''); }
        }
      }

      function setTheme(t) { theme.value = t; if (monacoInstance) monacoInstance.editor.setTheme(t); }
      function setFontSize(s) { fontSize.value = s; if (editor) editor.updateOptions({ fontSize: s }); }
      function toggleMinimap() { showMinimap.value = !showMinimap.value; if (editor) editor.updateOptions({ minimap: { enabled: showMinimap.value } }); }
      function formatCode() { if (editor) { var a = editor.getAction('editor.action.formatDocument'); if (a) a.run(); } }
      function clearOutput() { outputText.value = ''; errorText.value = ''; exitCode.value = null; outputVisible.value = false; }

      async function runCode() {
        if (running.value || !editor) return;
        var code = editor.getValue();
        if (!code.trim()) return;
        running.value = true;
        outputVisible.value = true;
        outputTab.value = 'output';
        outputText.value = 'Running...\n';
        errorText.value = '';
        exitCode.value = null;
        try {
          var r = await fetch('/api/code/run', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code, language: language.value })
          });
          var data = await r.json();
          outputText.value = data.output || '(no output)';
          errorText.value = data.error || '';
          exitCode.value = data.exitCode != null ? data.exitCode : null;
          if (data.error) outputTab.value = 'errors';
        } catch (e) {
          outputText.value = '';
          errorText.value = e.message || 'Execution failed';
          exitCode.value = 1;
          outputTab.value = 'errors';
        }
        running.value = false;
      }

      var resizeStartY = 0;
      var resizeStartH = 0;
      function startResize(e) {
        resizeStartY = e.clientY;
        resizeStartH = outputHeight.value;
        document.addEventListener('mousemove', onResize);
        document.addEventListener('mouseup', stopResize);
      }
      function onResize(e) {
        var diff = resizeStartY - e.clientY;
        outputHeight.value = Math.max(80, Math.min(500, resizeStartH + diff));
      }
      function stopResize() {
        document.removeEventListener('mousemove', onResize);
        document.removeEventListener('mouseup', stopResize);
      }

      async function handleFileAction(payload) {
        if (!payload || !payload.data || !payload.data.filePath) return;
        var fp = payload.data.filePath;
        try {
          var token = getToken();
          var r = await fetch('/api/fs/read?path=' + encodeURIComponent(fp), { headers: { 'Authorization': 'Bearer ' + token } });
          if (!r.ok) return;
          var data = await r.json();
          if (editor) editor.setValue(data.content || '');
          currentFilePath.value = fp;
          var lang = detectLang(payload.data.fileName || fp);
          if (lang) setLanguage(lang);
        } catch(e) { console.error('codeeditor: open file error', e); }
      }

      function onAppAction(e) { handleFileAction(e.detail); }

      onMounted(function() {
        nextTick(function() { initMonaco(); });
        window.addEventListener('app-action:codeeditor', onAppAction);
        var pending = window.__pendingAppAction && window.__pendingAppAction['codeeditor'];
        if (pending) {
          delete window.__pendingAppAction['codeeditor'];
          setTimeout(function() { handleFileAction(pending); }, 500);
        }
      });
      onUnmounted(function() {
        if (editor) { editor.dispose(); editor = null; }
        window.removeEventListener('app-action:codeeditor', onAppAction);
      });

      function detectLang(filename) {
        var ext = (filename.match(/\.[^.]+$/) || [''])[0].toLowerCase();
        for (var lang in LANG_MAP) {
          if (LANG_MAP[lang].ext === ext) return lang;
        }
        return null;
      }

      var CODE_FILTERS = [
        { label: 'All Files', extensions: ['*'] },
        { label: 'JavaScript', extensions: ['.js', '.mjs'] },
        { label: 'TypeScript', extensions: ['.ts', '.tsx'] },
        { label: 'Python', extensions: ['.py'] },
        { label: 'Go', extensions: ['.go'] },
        { label: 'C/C++', extensions: ['.c', '.cpp', '.h', '.hpp'] },
        { label: 'Java', extensions: ['.java'] },
        { label: 'Rust', extensions: ['.rs'] },
        { label: 'PHP', extensions: ['.php'] },
        { label: 'C#', extensions: ['.cs', '.csx'] },
        { label: 'Ruby', extensions: ['.rb'] },
        { label: 'Shell', extensions: ['.sh', '.bash', '.ps1'] },
        { label: 'Web', extensions: ['.html', '.css', '.json', '.xml', '.md'] }
      ];

      async function openFile() {
        var result = await window.FileDialog.open({ title: '📂 Open File', filters: CODE_FILTERS });
        if (!result) return;
        if (editor) editor.setValue(result.content);
        currentFilePath.value = result.path;
        var lang = detectLang(result.name);
        if (lang) setLanguage(lang);
      }

      async function saveFile() {
        if (!editor) return;
        var content = editor.getValue();
        if (currentFilePath.value) {
          var r = await window.FileDialog.writeFile(currentFilePath.value, content);
          if (r && window.ElementPlus) window.ElementPlus.ElMessage.success('Saved ✓');
        } else {
          await saveFileAs();
        }
      }

      async function saveFileAs() {
        if (!editor) return;
        var content = editor.getValue();
        var result = await window.FileDialog.save({ title: '💾 Save File', defaultName: fileName.value, filters: CODE_FILTERS });
        if (!result) return;
        var r = await window.FileDialog.writeFile(result.path, content);
        if (r) {
          currentFilePath.value = result.path;
          var lang = detectLang(result.name);
          if (lang) setLanguage(lang);
          if (window.ElementPlus) window.ElementPlus.ElMessage.success('Saved ✓');
        }
      }

      return {
        editorContainer: editorContainer, language: language, theme: theme, fontSize: fontSize, showMinimap: showMinimap,
        running: running, outputVisible: outputVisible, outputTab: outputTab, outputText: outputText, errorText: errorText,
        exitCode: exitCode, outputHeight: outputHeight, cursorInfo: cursorInfo, lineCount: lineCount, languages: languages,
        fileName: fileName, currentFilePath: currentFilePath, runText: runText, runningText: runningText,
        setLanguage: setLanguage, setTheme: setTheme, setFontSize: setFontSize, toggleMinimap: toggleMinimap,
        formatCode: formatCode, clearOutput: clearOutput, runCode: runCode, startResize: startResize,
        openFile: openFile, saveFile: saveFile, saveFileAs: saveFileAs
      };
    }
  };
})(Vue);
