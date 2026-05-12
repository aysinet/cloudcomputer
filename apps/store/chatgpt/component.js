(function(Vue) {
  const { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } = Vue;

  const LANGS = {
    tr: {
      title: 'ChatGPT',
      newChat: 'Yeni Sohbet',
      typeMessage: 'Mesajınızı yazın...',
      send: 'Gönder',
      conversations: 'Sohbetler',
      noConversations: 'Henüz sohbet yok',
      deleteConv: 'Sohbeti Sil',
      clearAll: 'Tümünü Temizle',
      provider: 'Sağlayıcı',
      model: 'Model',
      noProviders: 'AI sağlayıcı bulunamadı. Ayarlar > AI bölümünden API anahtarı ekleyin.',
      thinking: 'Düşünüyor...',
      error: 'Hata',
      retry: 'Tekrar Dene',
      copy: 'Kopyala',
      copied: 'Kopyalandı!',
      settings: 'Ayarlar',
      temperature: 'Sıcaklık',
      systemPrompt: 'Sistem Mesajı',
      systemPromptPlaceholder: 'Opsiyonel sistem mesajı...',
      welcome: 'Merhaba! Size nasıl yardımcı olabilirim?',
      searchConv: 'Sohbet ara...',
      rename: 'Yeniden Adlandır',
      cancel: 'İptal',
      save: 'Kaydet',
      exportChat: 'Dışa Aktar',
      tokens: 'Token'
    },
    en: {
      title: 'ChatGPT',
      newChat: 'New Chat',
      typeMessage: 'Type your message...',
      send: 'Send',
      conversations: 'Conversations',
      noConversations: 'No conversations yet',
      deleteConv: 'Delete Conversation',
      clearAll: 'Clear All',
      provider: 'Provider',
      model: 'Model',
      noProviders: 'No AI provider found. Add an API key in Settings > AI.',
      thinking: 'Thinking...',
      error: 'Error',
      retry: 'Retry',
      copy: 'Copy',
      copied: 'Copied!',
      settings: 'Settings',
      temperature: 'Temperature',
      systemPrompt: 'System Prompt',
      systemPromptPlaceholder: 'Optional system prompt...',
      welcome: 'Hello! How can I help you?',
      searchConv: 'Search conversations...',
      rename: 'Rename',
      cancel: 'Cancel',
      save: 'Save',
      exportChat: 'Export',
      tokens: 'Tokens'
    },
    de: {
      title: 'ChatGPT',
      newChat: 'Neuer Chat',
      typeMessage: 'Nachricht eingeben...',
      send: 'Senden',
      conversations: 'Gespräche',
      noConversations: 'Noch keine Gespräche',
      deleteConv: 'Gespräch löschen',
      clearAll: 'Alle löschen',
      provider: 'Anbieter',
      model: 'Modell',
      noProviders: 'Kein KI-Anbieter gefunden. API-Schlüssel unter Einstellungen > KI hinzufügen.',
      thinking: 'Denkt nach...',
      error: 'Fehler',
      retry: 'Erneut versuchen',
      copy: 'Kopieren',
      copied: 'Kopiert!',
      settings: 'Einstellungen',
      temperature: 'Temperatur',
      systemPrompt: 'Systemnachricht',
      systemPromptPlaceholder: 'Optionale Systemnachricht...',
      welcome: 'Hallo! Wie kann ich Ihnen helfen?',
      searchConv: 'Gespräche suchen...',
      rename: 'Umbenennen',
      cancel: 'Abbrechen',
      save: 'Speichern',
      exportChat: 'Exportieren',
      tokens: 'Tokens'
    },
    fr: {
      title: 'ChatGPT',
      newChat: 'Nouveau Chat',
      typeMessage: 'Tapez votre message...',
      send: 'Envoyer',
      conversations: 'Conversations',
      noConversations: 'Aucune conversation',
      deleteConv: 'Supprimer',
      clearAll: 'Tout effacer',
      provider: 'Fournisseur',
      model: 'Modèle',
      noProviders: 'Aucun fournisseur IA. Ajoutez une clé API dans Paramètres > IA.',
      thinking: 'Réflexion...',
      error: 'Erreur',
      retry: 'Réessayer',
      copy: 'Copier',
      copied: 'Copié !',
      settings: 'Paramètres',
      temperature: 'Température',
      systemPrompt: 'Message système',
      systemPromptPlaceholder: 'Message système optionnel...',
      welcome: 'Bonjour ! Comment puis-je vous aider ?',
      searchConv: 'Rechercher...',
      rename: 'Renommer',
      cancel: 'Annuler',
      save: 'Enregistrer',
      exportChat: 'Exporter',
      tokens: 'Jetons'
    },
    es: {
      title: 'ChatGPT',
      newChat: 'Nuevo Chat',
      typeMessage: 'Escribe tu mensaje...',
      send: 'Enviar',
      conversations: 'Conversaciones',
      noConversations: 'Sin conversaciones',
      deleteConv: 'Eliminar',
      clearAll: 'Borrar todo',
      provider: 'Proveedor',
      model: 'Modelo',
      noProviders: 'No se encontró proveedor de IA. Agrega una clave API en Configuración > IA.',
      thinking: 'Pensando...',
      error: 'Error',
      retry: 'Reintentar',
      copy: 'Copiar',
      copied: '¡Copiado!',
      settings: 'Configuración',
      temperature: 'Temperatura',
      systemPrompt: 'Mensaje del sistema',
      systemPromptPlaceholder: 'Mensaje del sistema opcional...',
      welcome: '¡Hola! ¿Cómo puedo ayudarte?',
      searchConv: 'Buscar...',
      rename: 'Renombrar',
      cancel: 'Cancelar',
      save: 'Guardar',
      exportChat: 'Exportar',
      tokens: 'Tokens'
    },
    ru: {
      title: 'ChatGPT',
      newChat: 'Новый чат',
      typeMessage: 'Введите сообщение...',
      send: 'Отправить',
      conversations: 'Беседы',
      noConversations: 'Нет бесед',
      deleteConv: 'Удалить',
      clearAll: 'Очистить всё',
      provider: 'Провайдер',
      model: 'Модель',
      noProviders: 'Провайдер ИИ не найден. Добавьте API-ключ в Настройки > ИИ.',
      thinking: 'Думаю...',
      error: 'Ошибка',
      retry: 'Повторить',
      copy: 'Копировать',
      copied: 'Скопировано!',
      settings: 'Настройки',
      temperature: 'Температура',
      systemPrompt: 'Системное сообщение',
      systemPromptPlaceholder: 'Системное сообщение...',
      welcome: 'Привет! Чем могу помочь?',
      searchConv: 'Поиск...',
      rename: 'Переименовать',
      cancel: 'Отмена',
      save: 'Сохранить',
      exportChat: 'Экспорт',
      tokens: 'Токены'
    },
    zh: {
      title: 'ChatGPT',
      newChat: '新对话',
      typeMessage: '输入消息...',
      send: '发送',
      conversations: '对话',
      noConversations: '暂无对话',
      deleteConv: '删除',
      clearAll: '清除全部',
      provider: '提供商',
      model: '模型',
      noProviders: '未找到AI提供商。请在设置 > AI中添加API密钥。',
      thinking: '思考中...',
      error: '错误',
      retry: '重试',
      copy: '复制',
      copied: '已复制！',
      settings: '设置',
      temperature: '温度',
      systemPrompt: '系统提示',
      systemPromptPlaceholder: '可选系统提示...',
      welcome: '你好！我能帮你什么？',
      searchConv: '搜索...',
      rename: '重命名',
      cancel: '取消',
      save: '保存',
      exportChat: '导出',
      tokens: '令牌'
    },
    ja: {
      title: 'ChatGPT',
      newChat: '新規チャット',
      typeMessage: 'メッセージを入力...',
      send: '送信',
      conversations: '会話',
      noConversations: '会話がありません',
      deleteConv: '削除',
      clearAll: 'すべてクリア',
      provider: 'プロバイダー',
      model: 'モデル',
      noProviders: 'AIプロバイダーが見つかりません。設定 > AIでAPIキーを追加してください。',
      thinking: '考え中...',
      error: 'エラー',
      retry: '再試行',
      copy: 'コピー',
      copied: 'コピーしました！',
      settings: '設定',
      temperature: '温度',
      systemPrompt: 'システムプロンプト',
      systemPromptPlaceholder: 'システムプロンプト...',
      welcome: 'こんにちは！何かお手伝いできますか？',
      searchConv: '検索...',
      rename: '名前変更',
      cancel: 'キャンセル',
      save: '保存',
      exportChat: 'エクスポート',
      tokens: 'トークン'
    },
    it: {
      title: 'ChatGPT',
      newChat: 'Nuova Chat',
      typeMessage: 'Scrivi il tuo messaggio...',
      send: 'Invia',
      conversations: 'Conversazioni',
      noConversations: 'Nessuna conversazione',
      deleteConv: 'Elimina',
      clearAll: 'Cancella tutto',
      provider: 'Provider',
      model: 'Modello',
      noProviders: 'Nessun provider AI trovato. Aggiungi una chiave API in Impostazioni > AI.',
      thinking: 'Sto pensando...',
      error: 'Errore',
      retry: 'Riprova',
      copy: 'Copia',
      copied: 'Copiato!',
      settings: 'Impostazioni',
      temperature: 'Temperatura',
      systemPrompt: 'Messaggio di sistema',
      systemPromptPlaceholder: 'Messaggio di sistema...',
      welcome: 'Ciao! Come posso aiutarti?',
      searchConv: 'Cerca...',
      rename: 'Rinomina',
      cancel: 'Annulla',
      save: 'Salva',
      exportChat: 'Esporta',
      tokens: 'Token'
    },
    ar: {
      title: 'ChatGPT',
      newChat: 'محادثة جديدة',
      typeMessage: 'اكتب رسالتك...',
      send: 'إرسال',
      conversations: 'المحادثات',
      noConversations: 'لا توجد محادثات',
      deleteConv: 'حذف',
      clearAll: 'مسح الكل',
      provider: 'المزود',
      model: 'النموذج',
      noProviders: 'لم يتم العثور على مزود AI. أضف مفتاح API في الإعدادات > AI.',
      thinking: 'جارٍ التفكير...',
      error: 'خطأ',
      retry: 'إعادة',
      copy: 'نسخ',
      copied: 'تم النسخ!',
      settings: 'الإعدادات',
      temperature: 'الحرارة',
      systemPrompt: 'رسالة النظام',
      systemPromptPlaceholder: 'رسالة نظام اختيارية...',
      welcome: 'مرحباً! كيف يمكنني مساعدتك؟',
      searchConv: 'بحث...',
      rename: 'تسمية',
      cancel: 'إلغاء',
      save: 'حفظ',
      exportChat: 'تصدير',
      tokens: 'رموز'
    },
    ko: {
      title: 'ChatGPT',
      newChat: '새 대화',
      typeMessage: '메시지를 입력하세요...',
      send: '보내기',
      conversations: '대화',
      noConversations: '대화가 없습니다',
      deleteConv: '삭제',
      clearAll: '모두 삭제',
      provider: '제공자',
      model: '모델',
      noProviders: 'AI 제공자를 찾을 수 없습니다. 설정 > AI에서 API 키를 추가하세요.',
      thinking: '생각 중...',
      error: '오류',
      retry: '다시 시도',
      copy: '복사',
      copied: '복사됨!',
      settings: '설정',
      temperature: '온도',
      systemPrompt: '시스템 프롬프트',
      systemPromptPlaceholder: '시스템 프롬프트...',
      welcome: '안녕하세요! 무엇을 도와드릴까요?',
      searchConv: '검색...',
      rename: '이름 변경',
      cancel: '취소',
      save: '저장',
      exportChat: '내보내기',
      tokens: '토큰'
    },
    hi: {
      title: 'ChatGPT',
      newChat: 'नई चैट',
      typeMessage: 'अपना संदेश लिखें...',
      send: 'भेजें',
      conversations: 'वार्तालाप',
      noConversations: 'कोई वार्तालाप नहीं',
      deleteConv: 'हटाएं',
      clearAll: 'सब हटाएं',
      provider: 'प्रदाता',
      model: 'मॉडल',
      noProviders: 'कोई AI प्रदाता नहीं मिला। सेटिंग्स > AI में API कुंजी जोड़ें।',
      thinking: 'सोच रहा हूं...',
      error: 'त्रुटि',
      retry: 'पुनः प्रयास',
      copy: 'कॉपी',
      copied: 'कॉपी किया!',
      settings: 'सेटिंग्स',
      temperature: 'तापमान',
      systemPrompt: 'सिस्टम प्रॉम्प्ट',
      systemPromptPlaceholder: 'सिस्टम प्रॉम्प्ट...',
      welcome: 'नमस्ते! मैं आपकी कैसे मदद कर सकता हूं?',
      searchConv: 'खोजें...',
      rename: 'नाम बदलें',
      cancel: 'रद्द',
      save: 'सहेजें',
      exportChat: 'निर्यात',
      tokens: 'टोकन'
    },
    pt: {
      title: 'ChatGPT',
      newChat: 'Novo Chat',
      typeMessage: 'Digite sua mensagem...',
      send: 'Enviar',
      conversations: 'Conversas',
      noConversations: 'Sem conversas',
      deleteConv: 'Excluir',
      clearAll: 'Limpar tudo',
      provider: 'Provedor',
      model: 'Modelo',
      noProviders: 'Nenhum provedor de IA encontrado. Adicione uma chave API em Configurações > IA.',
      thinking: 'Pensando...',
      error: 'Erro',
      retry: 'Tentar novamente',
      copy: 'Copiar',
      copied: 'Copiado!',
      settings: 'Configurações',
      temperature: 'Temperatura',
      systemPrompt: 'Prompt do sistema',
      systemPromptPlaceholder: 'Prompt do sistema...',
      welcome: 'Olá! Como posso ajudá-lo?',
      searchConv: 'Pesquisar...',
      rename: 'Renomear',
      cancel: 'Cancelar',
      save: 'Salvar',
      exportChat: 'Exportar',
      tokens: 'Tokens'
    }
  };

  function getLocale() {
    try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; }
  }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      const token = () => localStorage.getItem('auth_token') || '';

      // ─── State ───
      const conversations = ref([]);
      const activeConvId = ref(null);
      const userInput = ref('');
      const isStreaming = ref(false);
      const streamContent = ref('');
      const providers = ref([]);
      const selectedProvider = ref('');
      const selectedModel = ref('');
      const models = ref([]);
      const showSidebar = ref(true);
      const showSettings = ref(false);
      const temperature = ref(0.7);
      const systemPrompt = ref('');
      const searchQuery = ref('');
      const editingConvId = ref(null);
      const editingTitle = ref('');
      const errorMsg = ref('');
      const copyFeedback = ref('');

      // ─── Computed ───
      const activeConversation = computed(() => {
        return conversations.value.find(c => c.id === activeConvId.value) || null;
      });

      const activeMessages = computed(() => {
        return activeConversation.value ? activeConversation.value.messages : [];
      });

      const filteredConversations = computed(() => {
        const q = searchQuery.value.toLowerCase().trim();
        if (!q) return conversations.value;
        return conversations.value.filter(c =>
          c.title.toLowerCase().includes(q) ||
          c.messages.some(m => m.content.toLowerCase().includes(q))
        );
      });

      // ─── Providers & Models ───
      async function loadProviders() {
        try {
          const res = await fetch('/api/chatgpt/providers', {
            headers: { 'Authorization': 'Bearer ' + token() }
          });
          const data = await res.json();
          providers.value = data.providers || [];
          if (providers.value.length > 0 && !selectedProvider.value) {
            selectedProvider.value = providers.value[0].id;
            selectedModel.value = providers.value[0].model || '';
            loadModels();
          }
        } catch (e) {
          console.error('Failed to load providers:', e);
        }
      }

      async function loadModels() {
        if (!selectedProvider.value) return;
        try {
          const res = await fetch('/api/ai/models?provider=' + selectedProvider.value, {
            headers: { 'Authorization': 'Bearer ' + token() }
          });
          const data = await res.json();
          models.value = data.models || [];
          if (models.value.length > 0 && !selectedModel.value) {
            const def = models.value.find(m => m.default);
            selectedModel.value = def ? def.id : models.value[0].id;
          }
        } catch (e) {
          console.error('Failed to load models:', e);
        }
      }

      function onProviderChange() {
        const p = providers.value.find(pr => pr.id === selectedProvider.value);
        selectedModel.value = p ? p.model || '' : '';
        models.value = [];
        loadModels();
      }

      // ─── Conversations ───
      async function loadConversations() {
        try {
          const res = await fetch('/api/chatgpt/conversations', {
            headers: { 'Authorization': 'Bearer ' + token() }
          });
          const data = await res.json();
          conversations.value = data.conversations || [];
          if (conversations.value.length > 0 && !activeConvId.value) {
            activeConvId.value = conversations.value[0].id;
          }
        } catch (e) {
          console.error('Failed to load conversations:', e);
        }
      }

      let saveTimer = null;
      function debouncedSave() {
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
          fetch('/api/chatgpt/conversations', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + token(),
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ conversations: conversations.value })
          }).catch(e => console.error('Save failed:', e));
        }, 800);
      }

      function newChat() {
        const conv = {
          id: Date.now().toString(36) + Math.random().toString(36).substring(2, 8),
          title: L('newChat'),
          messages: [],
          provider: selectedProvider.value,
          model: selectedModel.value,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        conversations.value.unshift(conv);
        activeConvId.value = conv.id;
        debouncedSave();
      }

      function selectConversation(id) {
        activeConvId.value = id;
      }

      function deleteConversation(id) {
        conversations.value = conversations.value.filter(c => c.id !== id);
        if (activeConvId.value === id) {
          activeConvId.value = conversations.value.length > 0 ? conversations.value[0].id : null;
        }
        debouncedSave();
      }

      function clearAllConversations() {
        conversations.value = [];
        activeConvId.value = null;
        debouncedSave();
      }

      function startRename(conv) {
        editingConvId.value = conv.id;
        editingTitle.value = conv.title;
      }

      function saveRename() {
        if (editingConvId.value && editingTitle.value.trim()) {
          const conv = conversations.value.find(c => c.id === editingConvId.value);
          if (conv) {
            conv.title = editingTitle.value.trim().substring(0, 100);
            debouncedSave();
          }
        }
        editingConvId.value = null;
        editingTitle.value = '';
      }

      function cancelRename() {
        editingConvId.value = null;
        editingTitle.value = '';
      }

      // ─── Chat ───
      async function sendMessage() {
        const text = userInput.value.trim();
        if (!text || isStreaming.value) return;
        if (!selectedProvider.value) {
          errorMsg.value = L('noProviders');
          return;
        }

        if (!activeConvId.value) {
          newChat();
        }

        const conv = conversations.value.find(c => c.id === activeConvId.value);
        if (!conv) return;

        conv.messages.push({
          id: Date.now().toString(36),
          role: 'user',
          content: text,
          timestamp: new Date().toISOString()
        });

        if (conv.messages.filter(m => m.role === 'user').length === 1) {
          conv.title = text.substring(0, 60) + (text.length > 60 ? '...' : '');
        }

        userInput.value = '';
        errorMsg.value = '';
        conv.updatedAt = new Date().toISOString();

        const apiMessages = [];
        if (systemPrompt.value.trim()) {
          apiMessages.push({ role: 'system', content: systemPrompt.value.trim() });
        }
        for (const m of conv.messages) {
          apiMessages.push({ role: m.role, content: m.content });
        }

        isStreaming.value = true;
        streamContent.value = '';

        const assistantMsg = {
          id: (Date.now() + 1).toString(36),
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString()
        };
        conv.messages.push(assistantMsg);

        try {
          const res = await fetch('/api/chatgpt/stream', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + token(),
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              provider: selectedProvider.value,
              model: selectedModel.value,
              messages: apiMessages,
              temperature: temperature.value
            })
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(err.error || 'Request failed');
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith('data: ')) continue;
              const data = trimmed.slice(6);
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  assistantMsg.content += parsed.content;
                  streamContent.value = assistantMsg.content;
                }
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch (e) {
                if (e.message && !e.message.includes('JSON')) throw e;
              }
            }
          }
        } catch (e) {
          errorMsg.value = e.message;
          if (!assistantMsg.content) {
            conv.messages = conv.messages.filter(m => m.id !== assistantMsg.id);
          }
        } finally {
          isStreaming.value = false;
          streamContent.value = '';
          debouncedSave();
          await nextTick();
          scrollToBottom();
        }
      }

      // ─── UI Helpers ───
      function scrollToBottom() {
        const el = document.querySelector('.cg-messages');
        if (el) el.scrollTop = el.scrollHeight;
      }

      function copyMessage(content) {
        navigator.clipboard.writeText(content).then(() => {
          copyFeedback.value = L('copied');
          setTimeout(() => { copyFeedback.value = ''; }, 2000);
        }).catch(() => {});
      }

      function retryLast() {
        const conv = activeConversation.value;
        if (!conv || conv.messages.length < 1) return;
        const lastMsg = conv.messages[conv.messages.length - 1];
        if (lastMsg.role === 'assistant') {
          conv.messages.pop();
        }
        const lastUser = [...conv.messages].reverse().find(m => m.role === 'user');
        if (lastUser) {
          userInput.value = lastUser.content;
          conv.messages = conv.messages.filter(m => m.id !== lastUser.id);
          nextTick(() => sendMessage());
        }
      }

      function exportChat() {
        const conv = activeConversation.value;
        if (!conv) return;
        let text = '# ' + conv.title + '\n\n';
        for (const m of conv.messages) {
          const role = m.role === 'user' ? '👤 User' : '🤖 Assistant';
          text += '## ' + role + '\n' + m.content + '\n\n';
        }
        const blob = new Blob([text], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (conv.title || 'chat').replace(/[^a-zA-Z0-9_-]/g, '_') + '.md';
        a.click();
        URL.revokeObjectURL(url);
      }

      function formatTime(iso) {
        if (!iso) return '';
        try {
          const d = new Date(iso);
          return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' +
                 d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        } catch { return ''; }
      }

      function onKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      }

      function toggleSidebar() {
        showSidebar.value = !showSidebar.value;
      }

      function toggleSettings() {
        showSettings.value = !showSettings.value;
      }

      function renderMarkdown(text) {
        if (!text) return '';
        let html = text
          .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="cg-code-block"><code>$2</code></pre>')
          .replace(/`([^`]+)`/g, '<code class="cg-inline-code">$1</code>')
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>')
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
          .replace(/^### (.+)$/gm, '<h4>$1</h4>')
          .replace(/^## (.+)$/gm, '<h3>$1</h3>')
          .replace(/^# (.+)$/gm, '<h2>$1</h2>')
          .replace(/^\- (.+)$/gm, '<li>$1</li>')
          .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
          .replace(/\n/g, '<br>');
        html = html.replace(/((?:<li>.*?<\/li><br>?)+)/g, '<ul>$1</ul>');
        return html;
      }

      function onLocaleChanged(e) {
        if (e.detail && e.detail.locale) locale.value = e.detail.locale;
      }

      watch(() => activeMessages.value.length, () => {
        nextTick(() => scrollToBottom());
      });

      watch(streamContent, () => {
        nextTick(() => scrollToBottom());
      });

      onMounted(() => {
        window.addEventListener('locale-changed', onLocaleChanged);
        loadProviders();
        loadConversations();
      });

      onBeforeUnmount(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
        if (saveTimer) clearTimeout(saveTimer);
      });

      return {
        L, locale,
        conversations, activeConvId, activeConversation, activeMessages, filteredConversations,
        userInput, isStreaming, streamContent, errorMsg, copyFeedback,
        providers, selectedProvider, selectedModel, models,
        showSidebar, showSettings,
        temperature, systemPrompt, searchQuery,
        editingConvId, editingTitle,
        newChat, selectConversation, deleteConversation, clearAllConversations,
        startRename, saveRename, cancelRename,
        sendMessage, onKeyDown, copyMessage, retryLast, exportChat,
        toggleSidebar, toggleSettings, onProviderChange,
        formatTime, renderMarkdown,
        scrollToBottom
      };
    }
  };
})(Vue);
