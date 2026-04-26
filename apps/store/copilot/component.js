(function (Vue) {
  const { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } = Vue;
  const ElMessageBox = (window.ElementPlus && window.ElementPlus.ElMessageBox) || { confirm: () => Promise.resolve() };

  const LANGS = {
    en: {
      title: 'GitHub Copilot', chat: 'Chat', history: 'History', settings: 'Settings',
      notInstalled: 'CLI not installed', installHint: 'GitHub Copilot CLI is required. Install it on the server with:',
      checkAgain: 'Check again', emptyTitle: 'Ask Copilot anything', emptySub: 'Type a prompt and press Ctrl+Enter to run on the server.',
      you: 'You', thinking: 'Thinking…', stop: 'Stop',
      promptPlaceholder: 'Ask Copilot to write code, explain a file, or run a task…',
      hintCtrlEnter: 'Ctrl+Enter to send', cwd: 'cwd', userRoot: 'user root',
      clearAll: 'Clear all', noHistory: 'No history yet.',
      githubToken: 'GitHub Token', githubTokenHelp: 'Personal access token used as GH_TOKEN when running the CLI. Stored on the server for your user only.',
      tokenPlaceholder: 'ghp_… or github_pat_…', show: 'Show', hide: 'Hide', createToken: 'Create a fine-grained token →',
      workingDir: 'Working directory', workingDirHelp: 'Absolute path or relative to your user files folder. Empty = user root.',
      cwdPlaceholder: 'e.g. files/project',
      model: 'Model', modelHelp: 'Optional. Default is Claude Sonnet 4.5. Leave empty for default.',
      allowAllTools: 'Allow all tools (auto-approve)', allowAllToolsHelp: '⚠ Lets Copilot run shell commands and edit files without prompting. Use carefully.',
      saving: 'Saving…', save: 'Save', cliInfo: 'CLI info'
    },
    tr: {
      title: 'GitHub Copilot', chat: 'Sohbet', history: 'Geçmiş', settings: 'Ayarlar',
      notInstalled: 'CLI yüklü değil', installHint: 'GitHub Copilot CLI gerekli. Sunucuda şu komutla kurun:',
      checkAgain: 'Tekrar kontrol et', emptyTitle: 'Copilot\'a istediğinizi sorun', emptySub: 'Bir istek yazıp Ctrl+Enter ile sunucuda çalıştırın.',
      you: 'Siz', thinking: 'Düşünüyor…', stop: 'Durdur',
      promptPlaceholder: 'Kod yazmasını, dosya açıklamasını veya görev çalıştırmasını isteyin…',
      hintCtrlEnter: 'Göndermek için Ctrl+Enter', cwd: 'çalışma dizini', userRoot: 'kullanıcı kökü',
      clearAll: 'Tümünü temizle', noHistory: 'Henüz geçmiş yok.',
      githubToken: 'GitHub Token', githubTokenHelp: 'CLI çalışırken GH_TOKEN olarak kullanılır. Sadece sizin kullanıcınız için sunucuda saklanır.',
      tokenPlaceholder: 'ghp_… veya github_pat_…', show: 'Göster', hide: 'Gizle', createToken: 'İnce ayarlı token oluştur →',
      workingDir: 'Çalışma dizini', workingDirHelp: 'Mutlak yol veya kullanıcı dosyalarınıza göre. Boş = kullanıcı kökü.',
      cwdPlaceholder: 'örn. files/project',
      model: 'Model', modelHelp: 'İsteğe bağlı. Varsayılan: Claude Sonnet 4.5. Boş bırakırsanız varsayılan kullanılır.',
      allowAllTools: 'Tüm araçlara izin ver (otomatik onay)', allowAllToolsHelp: '⚠ Copilot\'un sormadan komut çalıştırmasına ve dosya düzenlemesine izin verir. Dikkatli kullanın.',
      saving: 'Kaydediliyor…', save: 'Kaydet', cliInfo: 'CLI bilgisi'
    },
    de: {
      title: 'GitHub Copilot', chat: 'Chat', history: 'Verlauf', settings: 'Einstellungen',
      notInstalled: 'CLI nicht installiert', installHint: 'GitHub Copilot CLI erforderlich. Auf dem Server installieren:',
      checkAgain: 'Erneut prüfen', emptyTitle: 'Frage Copilot alles', emptySub: 'Eingabe schreiben und Strg+Enter drücken.',
      you: 'Du', thinking: 'Denkt nach…', stop: 'Stopp',
      promptPlaceholder: 'Bitte Copilot Code zu schreiben oder Aufgabe auszuführen…',
      hintCtrlEnter: 'Strg+Enter zum Senden', cwd: 'cwd', userRoot: 'Benutzerstamm',
      clearAll: 'Alles löschen', noHistory: 'Noch kein Verlauf.',
      githubToken: 'GitHub Token', githubTokenHelp: 'Wird als GH_TOKEN für die CLI verwendet. Nur für Ihr Benutzerkonto gespeichert.',
      tokenPlaceholder: 'ghp_… oder github_pat_…', show: 'Zeigen', hide: 'Verbergen', createToken: 'Fine-grained Token erstellen →',
      workingDir: 'Arbeitsverzeichnis', workingDirHelp: 'Absoluter Pfad oder relativ zu den Benutzerdateien.',
      cwdPlaceholder: 'z.B. files/project',
      model: 'Modell', modelHelp: 'Optional. Standard ist Claude Sonnet 4.5.',
      allowAllTools: 'Alle Tools erlauben', allowAllToolsHelp: '⚠ Erlaubt Copilot ohne Bestätigung auszuführen.',
      saving: 'Speichern…', save: 'Speichern', cliInfo: 'CLI-Info'
    },
    fr: {
      title: 'GitHub Copilot', chat: 'Chat', history: 'Historique', settings: 'Paramètres',
      notInstalled: 'CLI non installé', installHint: 'GitHub Copilot CLI requis. Installez-le sur le serveur:',
      checkAgain: 'Vérifier à nouveau', emptyTitle: 'Demandez à Copilot', emptySub: 'Tapez un message et Ctrl+Entrée pour exécuter.',
      you: 'Vous', thinking: 'Réflexion…', stop: 'Arrêter',
      promptPlaceholder: 'Demandez à Copilot d\'écrire du code…',
      hintCtrlEnter: 'Ctrl+Entrée pour envoyer', cwd: 'cwd', userRoot: 'racine utilisateur',
      clearAll: 'Tout effacer', noHistory: 'Aucun historique.',
      githubToken: 'Jeton GitHub', githubTokenHelp: 'Utilisé comme GH_TOKEN. Stocké uniquement pour votre utilisateur.',
      tokenPlaceholder: 'ghp_… ou github_pat_…', show: 'Afficher', hide: 'Masquer', createToken: 'Créer un jeton fine-grained →',
      workingDir: 'Répertoire de travail', workingDirHelp: 'Chemin absolu ou relatif à vos fichiers.',
      cwdPlaceholder: 'ex. files/project',
      model: 'Modèle', modelHelp: 'Optionnel. Par défaut Claude Sonnet 4.5.',
      allowAllTools: 'Autoriser tous les outils', allowAllToolsHelp: '⚠ Permet à Copilot d\'exécuter sans demander.',
      saving: 'Sauvegarde…', save: 'Sauvegarder', cliInfo: 'Info CLI'
    },
    es: {
      title: 'GitHub Copilot', chat: 'Chat', history: 'Historial', settings: 'Ajustes',
      notInstalled: 'CLI no instalado', installHint: 'GitHub Copilot CLI requerido. Instálalo en el servidor:',
      checkAgain: 'Comprobar otra vez', emptyTitle: 'Pregunta a Copilot', emptySub: 'Escribe y presiona Ctrl+Enter.',
      you: 'Tú', thinking: 'Pensando…', stop: 'Detener',
      promptPlaceholder: 'Pide a Copilot que escriba código…',
      hintCtrlEnter: 'Ctrl+Enter para enviar', cwd: 'cwd', userRoot: 'raíz de usuario',
      clearAll: 'Borrar todo', noHistory: 'Sin historial.',
      githubToken: 'Token de GitHub', githubTokenHelp: 'Usado como GH_TOKEN. Solo para tu usuario.',
      tokenPlaceholder: 'ghp_… o github_pat_…', show: 'Mostrar', hide: 'Ocultar', createToken: 'Crear token fine-grained →',
      workingDir: 'Directorio de trabajo', workingDirHelp: 'Ruta absoluta o relativa a tus archivos.',
      cwdPlaceholder: 'ej. files/project',
      model: 'Modelo', modelHelp: 'Opcional. Por defecto Claude Sonnet 4.5.',
      allowAllTools: 'Permitir todas las herramientas', allowAllToolsHelp: '⚠ Permite ejecutar sin preguntar.',
      saving: 'Guardando…', save: 'Guardar', cliInfo: 'Info del CLI'
    },
    ru: {
      title: 'GitHub Copilot', chat: 'Чат', history: 'История', settings: 'Настройки',
      notInstalled: 'CLI не установлен', installHint: 'Требуется GitHub Copilot CLI. Установите на сервере:',
      checkAgain: 'Проверить снова', emptyTitle: 'Спросите Copilot', emptySub: 'Введите запрос и Ctrl+Enter.',
      you: 'Вы', thinking: 'Думаю…', stop: 'Стоп',
      promptPlaceholder: 'Попросите Copilot написать код…',
      hintCtrlEnter: 'Ctrl+Enter для отправки', cwd: 'cwd', userRoot: 'корень пользователя',
      clearAll: 'Очистить всё', noHistory: 'История пуста.',
      githubToken: 'GitHub токен', githubTokenHelp: 'Используется как GH_TOKEN. Хранится только для вас.',
      tokenPlaceholder: 'ghp_… или github_pat_…', show: 'Показать', hide: 'Скрыть', createToken: 'Создать fine-grained токен →',
      workingDir: 'Рабочая папка', workingDirHelp: 'Абсолютный путь или относительно ваших файлов.',
      cwdPlaceholder: 'напр. files/project',
      model: 'Модель', modelHelp: 'Опционально. По умолчанию Claude Sonnet 4.5.',
      allowAllTools: 'Разрешить все инструменты', allowAllToolsHelp: '⚠ Позволяет выполнять без подтверждения.',
      saving: 'Сохранение…', save: 'Сохранить', cliInfo: 'Инфо CLI'
    },
    zh: { title:'GitHub Copilot', chat:'聊天', history:'历史', settings:'设置', notInstalled:'未安装', installHint:'安装提示', with:'与', checkAgain:'重新检查', emptyTitle:'空标题', emptySub:'暂无对话', you:'你', thinking:'思考中', stop:'停止', promptPlaceholder:'输入消息...', hintCtrlEnter:'按Ctrl+Enter发送', cwd:'工作目录', userRoot:'用户根目录', clearAll:'清空全部', noHistory:'没有历史记录', githubToken:'GitHub令牌', githubTokenHelp:'GitHub令牌帮助', tokenPlaceholder:'输入令牌', show:'显示', hide:'隐藏', createToken:'创建令牌', workingDir:'工作目录', workingDirHelp:'工作目录帮助', cwdPlaceholder:'输入路径', model:'模型', modelHelp:'模型帮助', allowAllTools:'允许所有工具', allowAllToolsHelp:'工具权限帮助', saving:'保存中', save:'保存', cliInfo:'CLI信息' },
    ja: { title:'GitHub Copilot', chat:'チャット', history:'履歴', settings:'設定', notInstalled:'未インストール', installHint:'インストールのヒント', with:'と', checkAgain:'再確認', emptyTitle:'タイトルなし', emptySub:'会話なし', you:'あなた', thinking:'思考中', stop:'停止', promptPlaceholder:'メッセージを入力...', hintCtrlEnter:'Ctrl+Enterで送信', cwd:'作業ディレクトリ', userRoot:'ユーザールート', clearAll:'すべてクリア', noHistory:'履歴なし', githubToken:'GitHubトークン', githubTokenHelp:'トークンのヘルプ', tokenPlaceholder:'トークンを入力', show:'表示', hide:'非表示', createToken:'トークン作成', workingDir:'作業ディレクトリ', workingDirHelp:'ディレクトリのヘルプ', cwdPlaceholder:'パスを入力', model:'モデル', modelHelp:'モデルのヘルプ', allowAllTools:'全ツール許可', allowAllToolsHelp:'ツール権限のヘルプ', saving:'保存中', save:'保存', cliInfo:'CLI情報' },
    it: { title:'GitHub Copilot', chat:'Chat', history:'Cronologia', settings:'Impostazioni', notInstalled:'Non installato', installHint:'Suggerimento installazione', with:'con', checkAgain:'Ricontrolla', emptyTitle:'Titolo vuoto', emptySub:'Nessuna conversazione', you:'Tu', thinking:'Pensando', stop:'Ferma', promptPlaceholder:'Scrivi un messaggio...', hintCtrlEnter:'Premi Ctrl+Invio per inviare', cwd:'Directory di lavoro', userRoot:'Root utente', clearAll:'Cancella tutto', noHistory:'Nessuna cronologia', githubToken:'Token GitHub', githubTokenHelp:'Guida token GitHub', tokenPlaceholder:'Inserisci token', show:'Mostra', hide:'Nascondi', createToken:'Crea token', workingDir:'Directory di lavoro', workingDirHelp:'Guida directory', cwdPlaceholder:'Inserisci percorso', model:'Modello', modelHelp:'Guida modello', allowAllTools:'Consenti tutti gli strumenti', allowAllToolsHelp:'Guida permessi strumenti', saving:'Salvataggio', save:'Salva', cliInfo:'Info CLI' }
  };

  return {
    setup() {
      const view = ref('chat');
      const prompt = ref('');
      const messages = ref([]);
      const history = ref([]);
      const status = reactive({ installed: false, version: '', authConfigured: false, message: '' });
      const settings = reactive({
        cwd: '', model: '', allowAllTools: false, githubToken: '', githubTokenSet: false
      });
      const showToken = ref(false);
      const busy = ref(false);
      const savingSettings = ref(false);
      const settingsMsg = ref('');
      const messagesRef = ref(null);
      let abortCtrl = null;

      // Locale from settings store
      const locale = ref('en');
      try {
        const s = window.Pinia && window.useSettingsStore && window.useSettingsStore();
        if (s && s.locale) locale.value = s.locale;
      } catch (e) { /* ignore */ }
      if (!LANGS[locale.value]) locale.value = 'en';

      const L = (key) => (LANGS[locale.value] && LANGS[locale.value][key]) || LANGS.en[key] || key;
      function onLocaleChanged(e) { locale.value = (e.detail && LANGS[e.detail]) ? e.detail : 'en'; }

      const suggestions = computed(() => ([
        L('emptyTitle') === 'Ask Copilot anything'
          ? 'List files in current directory'
          : 'Geçerli dizindeki dosyaları listele',
        'Explain package.json',
        'Write a hello-world Node script'
      ]));

      const getToken = () => localStorage.getItem('auth_token') || '';
      const authHeaders = (extra) => ({
        'Authorization': 'Bearer ' + getToken(),
        ...(extra || {})
      });

      const truncatePath = (p) => {
        if (!p) return '~';
        if (p.length <= 32) return p;
        return '…' + p.slice(-30);
      };

      const formatTime = (ts) => {
        try { return new Date(ts).toLocaleString(); } catch (e) { return ''; }
      };

      const scrollToBottom = () => {
        nextTick(() => {
          const el = messagesRef.value;
          if (el) el.scrollTop = el.scrollHeight;
        });
      };

      const loadStatus = async () => {
        try {
          const r = await fetch('/api/copilot/status', { headers: authHeaders() });
          const j = await r.json();
          status.installed = !!j.installed;
          status.version = j.version || '';
          status.authConfigured = !!j.authConfigured;
          status.message = j.message || '';
          if (j.settings) {
            settings.cwd = j.settings.cwd || '';
            settings.model = j.settings.model || '';
            settings.allowAllTools = !!j.settings.allowAllTools;
            settings.githubTokenSet = !!j.settings.githubTokenSet;
          }
        } catch (e) {
          status.installed = false;
          status.message = String(e.message || e);
        }
      };

      const saveSettings = async () => {
        savingSettings.value = true;
        settingsMsg.value = '';
        try {
          const body = {
            cwd: settings.cwd,
            model: settings.model,
            allowAllTools: settings.allowAllTools
          };
          if (settings.githubToken && settings.githubToken.trim()) {
            body.githubToken = settings.githubToken.trim();
          }
          const r = await fetch('/api/copilot/settings', {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(body)
          });
          const j = await r.json();
          if (!r.ok) throw new Error(j.error || 'Failed');
          settings.githubToken = '';
          settings.githubTokenSet = !!j.githubTokenSet;
          settingsMsg.value = '✅';
          setTimeout(() => { settingsMsg.value = ''; }, 2000);
        } catch (e) {
          settingsMsg.value = '❌ ' + (e.message || e);
        } finally {
          savingSettings.value = false;
        }
      };

      const sendPrompt = async () => {
        const p = prompt.value.trim();
        if (!p || busy.value) return;
        busy.value = true;

        const userMsg = { role: 'user', text: p, cwd: settings.cwd };
        const aiMsg = { role: 'assistant', text: '', stderr: '', streaming: true, cwd: settings.cwd, exitCode: null };
        messages.value.push(userMsg, aiMsg);
        prompt.value = '';
        scrollToBottom();

        abortCtrl = new AbortController();
        try {
          const r = await fetch('/api/copilot/prompt', {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({
              prompt: p,
              cwd: settings.cwd,
              model: settings.model,
              allowAllTools: settings.allowAllTools
            }),
            signal: abortCtrl.signal
          });

          if (!r.ok || !r.body) {
            const t = await r.text().catch(() => '');
            throw new Error(t || ('HTTP ' + r.status));
          }

          const reader = r.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            // Parse SSE events: separated by \n\n
            const parts = buffer.split('\n\n');
            buffer = parts.pop();
            for (const part of parts) {
              const lines = part.split('\n');
              let evt = 'message';
              let data = '';
              for (const ln of lines) {
                if (ln.startsWith('event:')) evt = ln.slice(6).trim();
                else if (ln.startsWith('data:')) data += (data ? '\n' : '') + ln.slice(5).replace(/^ /, '');
              }
              if (!data && evt !== 'end') continue;

              let payload = data;
              try { payload = JSON.parse(data); } catch (e) { /* keep raw */ }

              if (evt === 'stdout') {
                aiMsg.text += (typeof payload === 'string' ? payload : (payload.chunk || ''));
                scrollToBottom();
              } else if (evt === 'stderr') {
                aiMsg.stderr += (typeof payload === 'string' ? payload : (payload.chunk || ''));
              } else if (evt === 'error') {
                aiMsg.stderr += '\n[error] ' + (typeof payload === 'string' ? payload : (payload.message || JSON.stringify(payload)));
              } else if (evt === 'end') {
                aiMsg.exitCode = (payload && typeof payload === 'object') ? (payload.exitCode != null ? payload.exitCode : 0) : 0;
              }
            }
          }
        } catch (e) {
          if (e.name === 'AbortError') {
            aiMsg.stderr += '\n[aborted]';
          } else {
            aiMsg.stderr += '\n' + (e.message || String(e));
          }
        } finally {
          aiMsg.streaming = false;
          if (aiMsg.exitCode == null) aiMsg.exitCode = -1;
          busy.value = false;
          abortCtrl = null;
          scrollToBottom();
        }
      };

      const abortPrompt = () => {
        if (abortCtrl) {
          try { abortCtrl.abort(); } catch (e) { /* ignore */ }
        }
      };

      const loadHistory = async () => {
        try {
          const r = await fetch('/api/copilot/sessions', { headers: authHeaders() });
          const j = await r.json();
          history.value = Array.isArray(j) ? j : (j.sessions || []);
        } catch (e) {
          history.value = [];
        }
      };

      const clearHistory = async () => {
        try { await ElMessageBox.confirm('Clear all sessions?', { confirmButtonText: 'OK', cancelButtonText: 'Cancel', type: 'warning' }); } catch { return; }
        try {
          await fetch('/api/copilot/sessions', { method: 'DELETE', headers: authHeaders() });
          history.value = [];
        } catch (e) { /* ignore */ }
      };

      const replayFromHistory = (s) => {
        prompt.value = s.prompt || '';
        view.value = 'chat';
      };

      onMounted(() => {
        loadStatus();
        window.addEventListener('locale-changed', onLocaleChanged);
      });

      onBeforeUnmount(() => {
        abortPrompt();
        window.removeEventListener('locale-changed', onLocaleChanged);
      });

      return {
        view, prompt, messages, history, status, settings,
        showToken, busy, savingSettings, settingsMsg, messagesRef,
        suggestions,
        L, truncatePath, formatTime,
        loadStatus, saveSettings, sendPrompt, abortPrompt,
        loadHistory, clearHistory, replayFromHistory
      };
    }
  };
})(Vue);
