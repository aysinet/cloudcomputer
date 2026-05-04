(function (Vue) {
  const { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick, watch } = Vue;

  /* ── i18n ── */
  const LANGS = {
    en: {
      newChat: 'New chat', untitled: 'New conversation', delete: 'Delete',
      noConversations: 'No conversations yet',
      selectProvider: 'Select a provider', settings: 'Settings',
      noProviderTitle: 'No AI provider configured',
      noProviderDesc: 'Configure at least one AI provider with an API key to start chatting. You can set it up from Settings or use the quick setup below.',
      step1: 'Open Settings (⚙️)', step2: 'Enter an API key for any provider', step3: 'Start chatting!',
      openSettings: 'Open Settings',
      systemPrompt: 'System prompt', systemPromptHelp: 'Optional instructions sent at the start of every conversation.',
      systemPromptPlaceholder: 'e.g. You are a helpful assistant...',
      quickApiSetup: 'Quick API key setup', quickApiSetupHelp: 'Enter an API key to activate a provider instantly. Keys are stored securely on the server.',
      apiKeyPlaceholder: 'Paste API key...', saving: 'Saving...', saveAndActivate: 'Save & Activate',
      close: 'Close',
      emptyTitle: 'How can I help you?', emptySub: 'Ask anything — write, code, translate, brainstorm...',
      you: 'You', thinking: 'Thinking...', stop: 'Stop',
      promptPlaceholder: 'Send a message...',
      toSend: 'to send', newLine: 'new line',
      copy: 'Copy', copied: 'Copied!',
      providerSaved: 'Provider saved and activated!', providerError: 'Failed to save.'
    },
    tr: {
      newChat: 'Yeni sohbet', untitled: 'Yeni konuşma', delete: 'Sil',
      noConversations: 'Henüz konuşma yok',
      selectProvider: 'Sağlayıcı seçin', settings: 'Ayarlar',
      noProviderTitle: 'AI sağlayıcı yapılandırılmamış',
      noProviderDesc: 'Sohbete başlamak için en az bir AI sağlayıcısına API anahtarı girin. Ayarlardan veya aşağıdaki hızlı kurulumdan yapabilirsiniz.',
      step1: 'Ayarları açın (⚙️)', step2: 'Herhangi bir sağlayıcı için API anahtarı girin', step3: 'Sohbete başlayın!',
      openSettings: 'Ayarları Aç',
      systemPrompt: 'Sistem istemi', systemPromptHelp: 'Her konuşmanın başında gönderilen isteğe bağlı talimatlar.',
      systemPromptPlaceholder: 'örn. Sen yardımcı bir asistansın...',
      quickApiSetup: 'Hızlı API anahtarı kurulumu', quickApiSetupHelp: 'Sağlayıcıyı anında etkinleştirmek için API anahtarı girin. Anahtarlar sunucuda güvenli şekilde saklanır.',
      apiKeyPlaceholder: 'API anahtarını yapıştırın...', saving: 'Kaydediliyor...', saveAndActivate: 'Kaydet ve Etkinleştir',
      close: 'Kapat',
      emptyTitle: 'Size nasıl yardımcı olabilirim?', emptySub: 'İstediğinizi sorun — yazın, kodlayın, çevirin, fikir üretin...',
      you: 'Siz', thinking: 'Düşünüyor...', stop: 'Durdur',
      promptPlaceholder: 'Mesaj gönderin...',
      toSend: 'göndermek için', newLine: 'yeni satır',
      copy: 'Kopyala', copied: 'Kopyalandı!',
      providerSaved: 'Sağlayıcı kaydedildi ve etkinleştirildi!', providerError: 'Kaydetme başarısız.'
    },
    de: {
      newChat: 'Neuer Chat', untitled: 'Neue Unterhaltung', delete: 'Löschen',
      noConversations: 'Noch keine Unterhaltungen',
      selectProvider: 'Anbieter wählen', settings: 'Einstellungen',
      noProviderTitle: 'Kein KI-Anbieter konfiguriert',
      noProviderDesc: 'Konfigurieren Sie mindestens einen KI-Anbieter mit API-Schlüssel.',
      step1: 'Einstellungen öffnen (⚙️)', step2: 'API-Schlüssel eingeben', step3: 'Chatten!',
      openSettings: 'Einstellungen öffnen',
      systemPrompt: 'Systemaufforderung', systemPromptHelp: 'Optionale Anweisungen am Anfang jeder Unterhaltung.',
      systemPromptPlaceholder: 'z.B. Du bist ein hilfreicher Assistent...',
      quickApiSetup: 'Schnelle API-Schlüssel-Einrichtung', quickApiSetupHelp: 'API-Schlüssel eingeben, um einen Anbieter sofort zu aktivieren.',
      apiKeyPlaceholder: 'API-Schlüssel einfügen...', saving: 'Speichern...', saveAndActivate: 'Speichern & Aktivieren',
      close: 'Schließen',
      emptyTitle: 'Wie kann ich helfen?', emptySub: 'Fragen Sie alles — schreiben, programmieren, übersetzen...',
      you: 'Du', thinking: 'Denkt nach...', stop: 'Stopp',
      promptPlaceholder: 'Nachricht senden...',
      toSend: 'zum Senden', newLine: 'neue Zeile',
      copy: 'Kopieren', copied: 'Kopiert!',
      providerSaved: 'Anbieter gespeichert!', providerError: 'Speichern fehlgeschlagen.'
    },
    fr: {
      newChat: 'Nouveau chat', untitled: 'Nouvelle conversation', delete: 'Supprimer',
      noConversations: 'Aucune conversation',
      selectProvider: 'Sélectionner un fournisseur', settings: 'Paramètres',
      noProviderTitle: 'Aucun fournisseur IA configuré',
      noProviderDesc: 'Configurez au moins un fournisseur IA avec une clé API pour commencer.',
      step1: 'Ouvrir Paramètres (⚙️)', step2: 'Entrer une clé API', step3: 'Commencer à discuter!',
      openSettings: 'Ouvrir Paramètres',
      systemPrompt: 'Prompt système', systemPromptHelp: 'Instructions optionnelles envoyées au début.',
      systemPromptPlaceholder: 'ex. Tu es un assistant utile...',
      quickApiSetup: 'Configuration rapide', quickApiSetupHelp: 'Entrez une clé API pour activer un fournisseur.',
      apiKeyPlaceholder: 'Coller la clé API...', saving: 'Sauvegarde...', saveAndActivate: 'Sauvegarder & Activer',
      close: 'Fermer',
      emptyTitle: 'Comment puis-je vous aider?', emptySub: 'Demandez ce que vous voulez...',
      you: 'Vous', thinking: 'Réflexion...', stop: 'Arrêter',
      promptPlaceholder: 'Envoyer un message...',
      toSend: 'pour envoyer', newLine: 'nouvelle ligne',
      copy: 'Copier', copied: 'Copié!',
      providerSaved: 'Fournisseur sauvegardé!', providerError: 'Échec de la sauvegarde.'
    },
    es: {
      newChat: 'Nuevo chat', untitled: 'Nueva conversación', delete: 'Eliminar',
      noConversations: 'Sin conversaciones',
      selectProvider: 'Seleccionar proveedor', settings: 'Ajustes',
      noProviderTitle: 'Sin proveedor de IA', noProviderDesc: 'Configure al menos un proveedor con clave API.',
      step1: 'Abrir Ajustes (⚙️)', step2: 'Ingresar clave API', step3: '¡Empezar a chatear!',
      openSettings: 'Abrir Ajustes',
      systemPrompt: 'Prompt del sistema', systemPromptHelp: 'Instrucciones opcionales.',
      systemPromptPlaceholder: 'ej. Eres un asistente útil...',
      quickApiSetup: 'Configuración rápida', quickApiSetupHelp: 'Ingrese una clave API para activar un proveedor.',
      apiKeyPlaceholder: 'Pegar clave API...', saving: 'Guardando...', saveAndActivate: 'Guardar y Activar',
      close: 'Cerrar',
      emptyTitle: '¿Cómo puedo ayudarte?', emptySub: 'Pregunta lo que quieras...',
      you: 'Tú', thinking: 'Pensando...', stop: 'Detener',
      promptPlaceholder: 'Enviar mensaje...',
      toSend: 'para enviar', newLine: 'nueva línea',
      copy: 'Copiar', copied: '¡Copiado!',
      providerSaved: '¡Proveedor guardado!', providerError: 'Error al guardar.'
    },
    ru: {
      newChat: 'Новый чат', untitled: 'Новый разговор', delete: 'Удалить',
      noConversations: 'Пока нет разговоров',
      selectProvider: 'Выберите провайдера', settings: 'Настройки',
      noProviderTitle: 'ИИ-провайдер не настроен', noProviderDesc: 'Настройте хотя бы одного провайдера.',
      step1: 'Откройте Настройки (⚙️)', step2: 'Введите API-ключ', step3: 'Начните общение!',
      openSettings: 'Открыть настройки',
      systemPrompt: 'Системный промпт', systemPromptHelp: 'Необязательные инструкции.',
      systemPromptPlaceholder: 'напр. Ты полезный помощник...',
      quickApiSetup: 'Быстрая настройка', quickApiSetupHelp: 'Введите API-ключ для активации провайдера.',
      apiKeyPlaceholder: 'Вставьте API-ключ...', saving: 'Сохранение...', saveAndActivate: 'Сохранить и активировать',
      close: 'Закрыть',
      emptyTitle: 'Чем могу помочь?', emptySub: 'Спрашивайте что угодно...',
      you: 'Вы', thinking: 'Думаю...', stop: 'Стоп',
      promptPlaceholder: 'Отправить сообщение...',
      toSend: 'для отправки', newLine: 'новая строка',
      copy: 'Копировать', copied: 'Скопировано!',
      providerSaved: 'Провайдер сохранён!', providerError: 'Ошибка сохранения.'
    },
    zh: {
      newChat: '新对话', untitled: '新会话', delete: '删除',
      noConversations: '暂无对话',
      selectProvider: '选择提供商', settings: '设置',
      noProviderTitle: '未配置AI提供商', noProviderDesc: '请配置至少一个带API密钥的AI提供商。',
      step1: '打开设置 (⚙️)', step2: '输入API密钥', step3: '开始聊天!',
      openSettings: '打开设置',
      systemPrompt: '系统提示', systemPromptHelp: '可选指令。',
      systemPromptPlaceholder: '例如 你是一个有用的助手...',
      quickApiSetup: '快速设置', quickApiSetupHelp: '输入API密钥以激活提供商。',
      apiKeyPlaceholder: '粘贴API密钥...', saving: '保存中...', saveAndActivate: '保存并激活',
      close: '关闭',
      emptyTitle: '有什么可以帮你的？', emptySub: '随便问——写作、编程、翻译...',
      you: '你', thinking: '思考中...', stop: '停止',
      promptPlaceholder: '发送消息...',
      toSend: '发送', newLine: '换行',
      copy: '复制', copied: '已复制!',
      providerSaved: '提供商已保存!', providerError: '保存失败。'
    },
    ja: {
      newChat: '新しいチャット', untitled: '新しい会話', delete: '削除',
      noConversations: '会話はまだありません',
      selectProvider: 'プロバイダーを選択', settings: '設定',
      noProviderTitle: 'AIプロバイダー未設定', noProviderDesc: 'APIキーを設定してください。',
      step1: '設定を開く (⚙️)', step2: 'APIキーを入力', step3: 'チャット開始!',
      openSettings: '設定を開く',
      systemPrompt: 'システムプロンプト', systemPromptHelp: 'オプションの指示。',
      systemPromptPlaceholder: '例: あなたは役立つアシスタントです...',
      quickApiSetup: 'クイック設定', quickApiSetupHelp: 'APIキーを入力してプロバイダーを有効にします。',
      apiKeyPlaceholder: 'APIキーを貼り付け...', saving: '保存中...', saveAndActivate: '保存して有効化',
      close: '閉じる',
      emptyTitle: '何かお手伝いできますか？', emptySub: '何でも聞いてください...',
      you: 'あなた', thinking: '考えています...', stop: '停止',
      promptPlaceholder: 'メッセージを送信...',
      toSend: '送信', newLine: '改行',
      copy: 'コピー', copied: 'コピーしました!',
      providerSaved: 'プロバイダー保存済み!', providerError: '保存に失敗。'
    },
    it: {
      newChat: 'Nuova chat', untitled: 'Nuova conversazione', delete: 'Elimina',
      noConversations: 'Nessuna conversazione',
      selectProvider: 'Seleziona provider', settings: 'Impostazioni',
      noProviderTitle: 'Nessun provider IA configurato', noProviderDesc: 'Configura almeno un provider.',
      step1: 'Apri Impostazioni (⚙️)', step2: 'Inserisci chiave API', step3: 'Inizia a chattare!',
      openSettings: 'Apri Impostazioni',
      systemPrompt: 'Prompt di sistema', systemPromptHelp: 'Istruzioni opzionali.',
      systemPromptPlaceholder: 'es. Sei un assistente utile...',
      quickApiSetup: 'Configurazione rapida', quickApiSetupHelp: 'Inserisci una chiave API.',
      apiKeyPlaceholder: 'Incolla chiave API...', saving: 'Salvataggio...', saveAndActivate: 'Salva e Attiva',
      close: 'Chiudi',
      emptyTitle: 'Come posso aiutarti?', emptySub: 'Chiedi quello che vuoi...',
      you: 'Tu', thinking: 'Pensando...', stop: 'Ferma',
      promptPlaceholder: 'Invia messaggio...',
      toSend: 'per inviare', newLine: 'nuova riga',
      copy: 'Copia', copied: 'Copiato!',
      providerSaved: 'Provider salvato!', providerError: 'Salvataggio fallito.'
    },
    ar: {
      newChat: 'محادثة جديدة', untitled: 'محادثة جديدة', delete: 'حذف',
      noConversations: 'لا توجد محادثات',
      selectProvider: 'اختر مزود', settings: 'الإعدادات',
      noProviderTitle: 'لم يتم تكوين مزود AI', noProviderDesc: 'قم بتكوين مزود واحد على الأقل.',
      step1: 'افتح الإعدادات (⚙️)', step2: 'أدخل مفتاح API', step3: 'ابدأ المحادثة!',
      openSettings: 'فتح الإعدادات',
      systemPrompt: 'تعليمات النظام', systemPromptHelp: 'تعليمات اختيارية.',
      systemPromptPlaceholder: 'مثال: أنت مساعد مفيد...',
      quickApiSetup: 'إعداد سريع', quickApiSetupHelp: 'أدخل مفتاح API لتفعيل المزود.',
      apiKeyPlaceholder: 'الصق مفتاح API...', saving: 'جاري الحفظ...', saveAndActivate: 'حفظ وتفعيل',
      close: 'إغلاق',
      emptyTitle: 'كيف يمكنني مساعدتك؟', emptySub: 'اسأل أي شيء...',
      you: 'أنت', thinking: 'يفكر...', stop: 'إيقاف',
      promptPlaceholder: 'إرسال رسالة...',
      toSend: 'للإرسال', newLine: 'سطر جديد',
      copy: 'نسخ', copied: 'تم النسخ!',
      providerSaved: 'تم حفظ المزود!', providerError: 'فشل الحفظ.'
    }
  };

  LANGS.ko = { ...LANGS.en };
  LANGS.hi = { ...LANGS.en };
  LANGS.pt = { ...LANGS.en };

  const QUICK_PROVIDERS = [
    { id: 'openai', name: 'OpenAI', icon: '🟢', defaultModel: 'gpt-4o' },
    { id: 'anthropic', name: 'Anthropic', icon: '🟠', defaultModel: 'claude-sonnet-4-20250514' },
    { id: 'google', name: 'Google Gemini', icon: '🔵', defaultModel: 'gemini-2.5-flash' },
    { id: 'deepseek', name: 'DeepSeek', icon: '🔷', defaultModel: 'deepseek-chat' },
    { id: 'groq', name: 'Groq', icon: '⚡', defaultModel: 'llama-3.3-70b-versatile' },
    { id: 'xai', name: 'xAI (Grok)', icon: '✖️', defaultModel: 'grok-3' },
    { id: 'huggingface', name: 'HuggingFace', icon: '🤗', defaultModel: 'Qwen/Qwen2.5-72B-Instruct' }
  ];

  /* ── Simple Markdown renderer (no external dependency) ── */
  function simpleMarkdown(text) {
    if (!text) return '';
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks: ```lang\ncode\n```
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, function (_, lang, code) {
      return '<pre><code class="lang-' + (lang || 'text') + '">' + code.trim() + '</code></pre>';
    });

    // Inline code
    html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');

    // Headings
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Blockquote
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr>');

    // Unordered list
    html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

    // Ordered list
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Paragraphs — wrap remaining text blocks
    html = html.replace(/\n{2,}/g, '</p><p>');
    // Single newlines → <br>
    html = html.replace(/\n/g, '<br>');

    // Wrap in paragraph if not starting with block element
    if (!/^<(h[1-3]|pre|ul|ol|blockquote|hr|p)/.test(html)) {
      html = '<p>' + html + '</p>';
    }

    return html;
  }

  return {
    setup() {
      const prompt = ref('');
      const busy = ref(false);
      const providers = ref([]);
      const selectedProvider = ref('');
      const conversations = ref([]);
      const currentConvId = ref('');
      const sidebarCollapsed = ref(false);
      const showSettings = ref(false);
      const systemPrompt = ref('');
      const messagesRef = ref(null);
      const promptRef = ref(null);
      const savingProviders = ref(false);
      const saveMsg = ref('');
      const saveMsgType = ref('');
      let abortCtrl = null;
      let saveTimer = null;

      // Quick providers for settings
      const quickProviders = ref(QUICK_PROVIDERS.map(p => ({ ...p, apiKey: '', showKey: false })));

      // Locale
      const locale = ref('en');
      try {
        const s = window.Pinia && window.useSettingsStore && window.useSettingsStore();
        if (s && s.locale) locale.value = s.locale;
      } catch (e) {}
      if (!LANGS[locale.value]) locale.value = 'en';

      const L = (key) => (LANGS[locale.value] && LANGS[locale.value][key]) || LANGS.en[key] || key;

      function onLocaleChanged(e) { locale.value = (e.detail && LANGS[e.detail]) ? e.detail : 'en'; }

      const getToken = () => localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
      const authHeaders = (extra) => ({
        'Authorization': 'Bearer ' + getToken(),
        ...(extra || {})
      });

      // ── Suggestions ──
      const suggestions = computed(() => {
        const isTr = locale.value === 'tr';
        return [
          isTr ? 'Python\'da basit bir web scraper yaz' : 'Write a simple web scraper in Python',
          isTr ? 'Bu kodu bana açıkla' : 'Explain this code to me',
          isTr ? 'Bir regex ifadesi oluştur' : 'Create a regex expression',
          isTr ? 'İngilizce-Türkçe çeviri yap' : 'Translate text for me'
        ];
      });

      // ── Current conversation messages ──
      const currentMessages = computed(() => {
        const conv = conversations.value.find(c => c.id === currentConvId.value);
        return conv ? conv.messages : [];
      });

      const sortedConversations = computed(() => {
        return [...conversations.value].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });

      function formatDate(d) {
        try {
          const dt = new Date(d);
          const now = new Date();
          if (dt.toDateString() === now.toDateString()) {
            return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
          return dt.toLocaleDateString([], { month: 'short', day: 'numeric' });
        } catch { return ''; }
      }

      function genId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      }

      // ── Scroll ──
      function scrollToBottom() {
        nextTick(() => {
          const el = messagesRef.value;
          if (el) el.scrollTop = el.scrollHeight;
        });
      }

      // ── Auto resize textarea ──
      function autoResize() {
        nextTick(() => {
          const ta = promptRef.value;
          if (ta) {
            ta.style.height = 'auto';
            ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
          }
        });
      }

      // ── Load providers ──
      async function loadProviders() {
        try {
          const r = await fetch('/api/chatgpt/providers', { headers: authHeaders() });
          if (r.ok) {
            const data = await r.json();
            providers.value = data.providers || [];
            if (providers.value.length && !selectedProvider.value) {
              selectedProvider.value = providers.value[0].id;
            }
            // If current selection no longer valid
            if (selectedProvider.value && !providers.value.find(p => p.id === selectedProvider.value)) {
              selectedProvider.value = providers.value.length ? providers.value[0].id : '';
            }
          }
        } catch {}
      }

      // ── Load conversations ──
      async function loadConversations() {
        try {
          const r = await fetch('/api/chatgpt/conversations', { headers: authHeaders() });
          if (r.ok) {
            const data = await r.json();
            conversations.value = data.conversations || [];
            if (conversations.value.length && !currentConvId.value) {
              currentConvId.value = conversations.value[0].id;
            }
          }
        } catch {}
      }

      // ── Save conversations (debounced) ──
      function debouncedSave() {
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(saveConversations, 800);
      }

      async function saveConversations() {
        try {
          await fetch('/api/chatgpt/conversations', {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ conversations: conversations.value })
          });
        } catch {}
      }

      // ── Conversation management ──
      function newConversation() {
        const id = genId();
        const conv = {
          id,
          title: '',
          model: '',
          provider: selectedProvider.value,
          systemPrompt: systemPrompt.value,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        conversations.value.unshift(conv);
        currentConvId.value = id;
        showSettings.value = false;
        debouncedSave();
      }

      function selectConversation(id) {
        currentConvId.value = id;
        showSettings.value = false;
        scrollToBottom();
      }

      function deleteConversation(id) {
        conversations.value = conversations.value.filter(c => c.id !== id);
        if (currentConvId.value === id) {
          currentConvId.value = conversations.value.length ? conversations.value[0].id : '';
        }
        debouncedSave();
      }

      function onProviderChange() {
        // persist preference
      }

      // ── Auto-title from first message ──
      function autoTitle(conv, userMsg) {
        if (!conv.title) {
          conv.title = userMsg.length > 60 ? userMsg.slice(0, 57) + '...' : userMsg;
        }
      }

      // ── Send message ──
      async function sendMessage() {
        const text = prompt.value.trim();
        if (!text || busy.value || !selectedProvider.value) return;

        // Ensure we have a conversation
        if (!currentConvId.value) {
          newConversation();
        }

        const conv = conversations.value.find(c => c.id === currentConvId.value);
        if (!conv) return;

        autoTitle(conv, text);
        conv.provider = selectedProvider.value;

        // Add user message
        conv.messages.push({ role: 'user', content: text });
        prompt.value = '';
        autoResize();

        // Add assistant placeholder
        const assistantMsg = reactive({ role: 'assistant', content: '', _streaming: true });
        conv.messages.push(assistantMsg);

        busy.value = true;
        conv.updatedAt = new Date().toISOString();
        scrollToBottom();

        // Build messages to send
        const toSend = [];
        const sp = conv.systemPrompt || systemPrompt.value;
        if (sp) toSend.push({ role: 'system', content: sp });
        // Send conversation history (excluding streaming marker)
        for (const m of conv.messages) {
          if (m._streaming) continue;
          toSend.push({ role: m.role, content: m.content });
        }
        // The last user message is already in the array

        abortCtrl = new AbortController();

        try {
          const r = await fetch('/api/chatgpt/stream', {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({
              provider: selectedProvider.value,
              messages: toSend
            }),
            signal: abortCtrl.signal
          });

          if (!r.ok) {
            const err = await r.json().catch(() => ({}));
            assistantMsg.content = '⚠️ ' + (err.error || 'Error ' + r.status);
            assistantMsg._streaming = false;
            busy.value = false;
            debouncedSave();
            return;
          }

          // Read SSE stream
          const reader = r.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('event: ')) {
                const eventType = line.slice(7).trim();
                // next line should be data:
                continue;
              }
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  // Check what kind of event by looking at data structure
                  if (data.text !== undefined) {
                    assistantMsg.content += data.text;
                    scrollToBottom();
                  } else if (data.message) {
                    // Error
                    assistantMsg.content += '\n⚠️ ' + data.message;
                  }
                } catch {}
              }
            }
          }
        } catch (e) {
          if (e.name !== 'AbortError') {
            assistantMsg.content += '\n⚠️ ' + (e.message || 'Connection error');
          }
        }

        assistantMsg._streaming = false;
        busy.value = false;
        abortCtrl = null;
        debouncedSave();
        scrollToBottom();
      }

      function abortStream() {
        if (abortCtrl) {
          abortCtrl.abort();
          abortCtrl = null;
        }
        busy.value = false;
      }

      // ── Markdown rendering ──
      function renderMarkdown(text) {
        return simpleMarkdown(text);
      }

      // ── Copy ──
      function copyText(text) {
        navigator.clipboard.writeText(text).catch(() => {});
      }

      // ── Quick provider save ──
      async function saveQuickProviders() {
        savingProviders.value = true;
        saveMsg.value = '';
        try {
          // Load existing settings
          const r = await fetch('/api/ai-settings', { headers: authHeaders() });
          const existing = r.ok ? await r.json() : { providers: [], agents: [] };
          const existingProviders = existing.providers || [];
          const agents = existing.agents || [];

          // Merge quick provider keys into existing
          for (const qp of quickProviders.value) {
            if (!qp.apiKey) continue;
            const idx = existingProviders.findIndex(p => p.id === qp.id);
            if (idx >= 0) {
              existingProviders[idx].apiKey = qp.apiKey;
              existingProviders[idx].enabled = true;
            } else {
              existingProviders.push({
                id: qp.id,
                name: qp.name,
                icon: qp.icon,
                defaultModel: qp.defaultModel,
                enabled: true,
                apiKey: qp.apiKey,
                model: '',
                custom: false
              });
            }
          }

          // Save
          const sr = await fetch('/api/ai-settings', {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ providers: existingProviders, agents })
          });

          if (sr.ok) {
            saveMsg.value = L('providerSaved');
            saveMsgType.value = 'success';
            // Clear entered keys from UI
            for (const qp of quickProviders.value) { qp.apiKey = ''; }
            // Reload providers
            await loadProviders();
          } else {
            saveMsg.value = L('providerError');
            saveMsgType.value = 'error';
          }
        } catch (e) {
          saveMsg.value = L('providerError');
          saveMsgType.value = 'error';
        }
        savingProviders.value = false;
        setTimeout(() => { saveMsg.value = ''; }, 4000);
      }

      // ── Lifecycle ──
      onMounted(async () => {
        window.addEventListener('locale-changed', onLocaleChanged);
        await Promise.all([loadProviders(), loadConversations()]);
        // If no conversations exist, don't auto-create one — let empty state show
      });

      onBeforeUnmount(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
        if (saveTimer) clearTimeout(saveTimer);
        if (abortCtrl) abortCtrl.abort();
      });

      return {
        prompt, busy, providers, selectedProvider,
        conversations, currentConvId, currentMessages, sortedConversations,
        sidebarCollapsed, showSettings, systemPrompt,
        messagesRef, promptRef,
        quickProviders, savingProviders, saveMsg, saveMsgType,
        suggestions,
        L, formatDate, autoResize, renderMarkdown,
        newConversation, selectConversation, deleteConversation,
        onProviderChange, sendMessage, abortStream,
        copyText, saveQuickProviders
      };
    }
  };
})(Vue);
