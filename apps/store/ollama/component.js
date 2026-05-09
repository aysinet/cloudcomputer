(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, nextTick, watch } = Vue;

  const DOCKER_IMAGE = 'ollama/ollama:latest';
  const APP_ID = 'ollama';
  const CONTAINER_PORT = 11434;

  const LANGS = {
    tr: {
      checking: 'Ollama durumu kontrol ediliyor...', pulling: 'Docker imajı indiriliyor...', starting: 'Ollama başlatılıyor...', restarting: 'Ollama yeniden başlatılıyor...',
      error: 'Bir hata oluştu', retry: 'Tekrar Dene', restartTip: 'Yeniden Başlat', stopTip: 'Durdur',
      stopped: 'Ollama durduruldu', stoppedSub: 'Yerel LLM çalıştırma platformu', start: 'Başlat',
      models: 'Modeller', chat: 'Sohbet', pullModel: 'Model İndir', deleteModel: 'Sil',
      modelName: 'Model adı (ör: llama3.2, mistral, gemma2)', pull: 'İndir',
      pullingModel: 'Model indiriliyor...', pullSuccess: 'Model başarıyla indirildi',
      pullError: 'Model indirme hatası', deleteConfirm: 'Bu modeli silmek istediğinize emin misiniz?',
      noModels: 'Henüz model yok. Yukarıdan bir model indirin.', selectModel: 'Model seçin',
      typeMessage: 'Mesajınızı yazın...', send: 'Gönder', thinking: 'Düşünüyor...',
      newChat: 'Yeni Sohbet', clearChat: 'Sohbeti Temizle', size: 'Boyut',
      welcome: 'Ollama ile sohbet etmeye başlayın', welcomeSub: 'Önce sol panelden bir model seçin veya indirin',
      stopGen: 'Durdur', copied: 'Kopyalandı', copy: 'Kopyala', port: 'Port',
      refreshModels: 'Modelleri Yenile', modelPullPlaceholder: 'ör: llama3.2, mistral, gemma2',
      system: 'Sistem Mesajı', systemPlaceholder: 'İsteğe bağlı sistem mesajı...'
    },
    en: {
      checking: 'Checking Ollama status...', pulling: 'Pulling Docker image...', starting: 'Starting Ollama...', restarting: 'Restarting Ollama...',
      error: 'An error occurred', retry: 'Try Again', restartTip: 'Restart', stopTip: 'Stop',
      stopped: 'Ollama stopped', stoppedSub: 'Local LLM runtime platform', start: 'Start',
      models: 'Models', chat: 'Chat', pullModel: 'Pull Model', deleteModel: 'Delete',
      modelName: 'Model name (e.g. llama3.2, mistral, gemma2)', pull: 'Pull',
      pullingModel: 'Pulling model...', pullSuccess: 'Model pulled successfully',
      pullError: 'Model pull error', deleteConfirm: 'Are you sure you want to delete this model?',
      noModels: 'No models yet. Pull a model from above.', selectModel: 'Select model',
      typeMessage: 'Type your message...', send: 'Send', thinking: 'Thinking...',
      newChat: 'New Chat', clearChat: 'Clear Chat', size: 'Size',
      welcome: 'Start chatting with Ollama', welcomeSub: 'Select or pull a model from the left panel first',
      stopGen: 'Stop', copied: 'Copied', copy: 'Copy', port: 'Port',
      refreshModels: 'Refresh Models', modelPullPlaceholder: 'e.g. llama3.2, mistral, gemma2',
      system: 'System Message', systemPlaceholder: 'Optional system message...'
    },
    de: {
      checking: 'Ollama-Status wird überprüft...', pulling: 'Docker-Image wird heruntergeladen...', starting: 'Ollama wird gestartet...', restarting: 'Ollama wird neu gestartet...',
      error: 'Ein Fehler ist aufgetreten', retry: 'Erneut versuchen', restartTip: 'Neu starten', stopTip: 'Stoppen',
      stopped: 'Ollama gestoppt', stoppedSub: 'Lokale LLM-Laufzeitplattform', start: 'Starten',
      models: 'Modelle', chat: 'Chat', pullModel: 'Modell herunterladen', deleteModel: 'Löschen',
      modelName: 'Modellname (z.B. llama3.2, mistral, gemma2)', pull: 'Herunterladen',
      pullingModel: 'Modell wird heruntergeladen...', pullSuccess: 'Modell erfolgreich heruntergeladen',
      pullError: 'Fehler beim Herunterladen', deleteConfirm: 'Möchten Sie dieses Modell wirklich löschen?',
      noModels: 'Noch keine Modelle. Laden Sie oben ein Modell herunter.', selectModel: 'Modell auswählen',
      typeMessage: 'Nachricht eingeben...', send: 'Senden', thinking: 'Denkt nach...',
      newChat: 'Neuer Chat', clearChat: 'Chat löschen', size: 'Größe',
      welcome: 'Starten Sie einen Chat mit Ollama', welcomeSub: 'Wählen oder laden Sie zuerst ein Modell im linken Panel',
      stopGen: 'Stopp', copied: 'Kopiert', copy: 'Kopieren', port: 'Port',
      refreshModels: 'Modelle aktualisieren', modelPullPlaceholder: 'z.B. llama3.2, mistral, gemma2',
      system: 'Systemnachricht', systemPlaceholder: 'Optionale Systemnachricht...'
    },
    fr: {
      checking: 'Vérification du statut Ollama...', pulling: "Téléchargement de l'image Docker...", starting: "Démarrage d'Ollama...", restarting: "Redémarrage d'Ollama...",
      error: 'Une erreur est survenue', retry: 'Réessayer', restartTip: 'Redémarrer', stopTip: 'Arrêter',
      stopped: 'Ollama arrêté', stoppedSub: "Plateforme locale d'exécution LLM", start: 'Démarrer',
      models: 'Modèles', chat: 'Chat', pullModel: 'Télécharger un modèle', deleteModel: 'Supprimer',
      modelName: 'Nom du modèle (ex: llama3.2, mistral, gemma2)', pull: 'Télécharger',
      pullingModel: 'Téléchargement du modèle...', pullSuccess: 'Modèle téléchargé avec succès',
      pullError: 'Erreur de téléchargement', deleteConfirm: 'Êtes-vous sûr de vouloir supprimer ce modèle ?',
      noModels: 'Aucun modèle. Téléchargez un modèle ci-dessus.', selectModel: 'Sélectionner un modèle',
      typeMessage: 'Tapez votre message...', send: 'Envoyer', thinking: 'Réflexion...',
      newChat: 'Nouveau Chat', clearChat: 'Effacer le chat', size: 'Taille',
      welcome: 'Commencez à discuter avec Ollama', welcomeSub: "Sélectionnez ou téléchargez d'abord un modèle dans le panneau de gauche",
      stopGen: 'Arrêter', copied: 'Copié', copy: 'Copier', port: 'Port',
      refreshModels: 'Actualiser les modèles', modelPullPlaceholder: 'ex: llama3.2, mistral, gemma2',
      system: 'Message système', systemPlaceholder: 'Message système optionnel...'
    },
    es: {
      checking: 'Comprobando estado de Ollama...', pulling: 'Descargando imagen Docker...', starting: 'Iniciando Ollama...', restarting: 'Reiniciando Ollama...',
      error: 'Se produjo un error', retry: 'Reintentar', restartTip: 'Reiniciar', stopTip: 'Detener',
      stopped: 'Ollama detenido', stoppedSub: 'Plataforma local de ejecución LLM', start: 'Iniciar',
      models: 'Modelos', chat: 'Chat', pullModel: 'Descargar modelo', deleteModel: 'Eliminar',
      modelName: 'Nombre del modelo (ej: llama3.2, mistral, gemma2)', pull: 'Descargar',
      pullingModel: 'Descargando modelo...', pullSuccess: 'Modelo descargado correctamente',
      pullError: 'Error al descargar el modelo', deleteConfirm: '¿Está seguro de que desea eliminar este modelo?',
      noModels: 'Sin modelos. Descargue un modelo arriba.', selectModel: 'Seleccionar modelo',
      typeMessage: 'Escriba su mensaje...', send: 'Enviar', thinking: 'Pensando...',
      newChat: 'Nuevo Chat', clearChat: 'Borrar chat', size: 'Tamaño',
      welcome: 'Empiece a chatear con Ollama', welcomeSub: 'Seleccione o descargue un modelo del panel izquierdo primero',
      stopGen: 'Detener', copied: 'Copiado', copy: 'Copiar', port: 'Puerto',
      refreshModels: 'Actualizar modelos', modelPullPlaceholder: 'ej: llama3.2, mistral, gemma2',
      system: 'Mensaje del sistema', systemPlaceholder: 'Mensaje del sistema opcional...'
    },
    ru: {
      checking: 'Проверка статуса Ollama...', pulling: 'Загрузка Docker-образа...', starting: 'Запуск Ollama...', restarting: 'Перезапуск Ollama...',
      error: 'Произошла ошибка', retry: 'Повторить', restartTip: 'Перезапустить', stopTip: 'Остановить',
      stopped: 'Ollama остановлен', stoppedSub: 'Локальная платформа запуска LLM', start: 'Запустить',
      models: 'Модели', chat: 'Чат', pullModel: 'Загрузить модель', deleteModel: 'Удалить',
      modelName: 'Имя модели (напр: llama3.2, mistral, gemma2)', pull: 'Загрузить',
      pullingModel: 'Загрузка модели...', pullSuccess: 'Модель успешно загружена',
      pullError: 'Ошибка загрузки модели', deleteConfirm: 'Вы уверены, что хотите удалить эту модель?',
      noModels: 'Моделей пока нет. Загрузите модель выше.', selectModel: 'Выбрать модель',
      typeMessage: 'Введите сообщение...', send: 'Отправить', thinking: 'Думает...',
      newChat: 'Новый чат', clearChat: 'Очистить чат', size: 'Размер',
      welcome: 'Начните общение с Ollama', welcomeSub: 'Сначала выберите или загрузите модель в левой панели',
      stopGen: 'Стоп', copied: 'Скопировано', copy: 'Копировать', port: 'Порт',
      refreshModels: 'Обновить модели', modelPullPlaceholder: 'напр: llama3.2, mistral, gemma2',
      system: 'Системное сообщение', systemPlaceholder: 'Необязательное системное сообщение...'
    },
    zh: {
      checking: '正在检查 Ollama 状态...', pulling: '正在拉取 Docker 镜像...', starting: '正在启动 Ollama...', restarting: '正在重启 Ollama...',
      error: '发生错误', retry: '重试', restartTip: '重启', stopTip: '停止',
      stopped: 'Ollama 已停止', stoppedSub: '本地 LLM 运行平台', start: '启动',
      models: '模型', chat: '聊天', pullModel: '拉取模型', deleteModel: '删除',
      modelName: '模型名称（例如：llama3.2, mistral, gemma2）', pull: '拉取',
      pullingModel: '正在拉取模型...', pullSuccess: '模型拉取成功',
      pullError: '模型拉取错误', deleteConfirm: '确定要删除此模型吗？',
      noModels: '还没有模型。请从上方拉取模型。', selectModel: '选择模型',
      typeMessage: '输入消息...', send: '发送', thinking: '思考中...',
      newChat: '新对话', clearChat: '清除对话', size: '大小',
      welcome: '开始与 Ollama 聊天', welcomeSub: '请先从左侧面板选择或拉取模型',
      stopGen: '停止', copied: '已复制', copy: '复制', port: '端口',
      refreshModels: '刷新模型', modelPullPlaceholder: '例如：llama3.2, mistral, gemma2',
      system: '系统消息', systemPlaceholder: '可选的系统消息...'
    },
    ja: {
      checking: 'Ollama の状態を確認中...', pulling: 'Docker イメージをダウンロード中...', starting: 'Ollama を起動中...', restarting: 'Ollama を再起動中...',
      error: 'エラーが発生しました', retry: '再試行', restartTip: '再起動', stopTip: '停止',
      stopped: 'Ollama 停止中', stoppedSub: 'ローカル LLM 実行プラットフォーム', start: '開始',
      models: 'モデル', chat: 'チャット', pullModel: 'モデルをダウンロード', deleteModel: '削除',
      modelName: 'モデル名（例：llama3.2, mistral, gemma2）', pull: 'ダウンロード',
      pullingModel: 'モデルをダウンロード中...', pullSuccess: 'モデルのダウンロードに成功',
      pullError: 'モデルダウンロードエラー', deleteConfirm: 'このモデルを削除してもよろしいですか？',
      noModels: 'モデルがありません。上からモデルをダウンロードしてください。', selectModel: 'モデルを選択',
      typeMessage: 'メッセージを入力...', send: '送信', thinking: '考え中...',
      newChat: '新しいチャット', clearChat: 'チャットをクリア', size: 'サイズ',
      welcome: 'Ollama とチャットを始めましょう', welcomeSub: 'まず左パネルからモデルを選択またはダウンロードしてください',
      stopGen: '停止', copied: 'コピーしました', copy: 'コピー', port: 'ポート',
      refreshModels: 'モデルを更新', modelPullPlaceholder: '例：llama3.2, mistral, gemma2',
      system: 'システムメッセージ', systemPlaceholder: 'オプションのシステムメッセージ...'
    },
    it: {
      checking: 'Controllo stato Ollama...', pulling: "Download dell'immagine Docker...", starting: 'Avvio di Ollama...', restarting: 'Riavvio di Ollama...',
      error: 'Si è verificato un errore', retry: 'Riprova', restartTip: 'Riavvia', stopTip: 'Ferma',
      stopped: 'Ollama fermato', stoppedSub: 'Piattaforma locale di esecuzione LLM', start: 'Avvia',
      models: 'Modelli', chat: 'Chat', pullModel: 'Scarica modello', deleteModel: 'Elimina',
      modelName: 'Nome modello (es: llama3.2, mistral, gemma2)', pull: 'Scarica',
      pullingModel: 'Download modello in corso...', pullSuccess: 'Modello scaricato con successo',
      pullError: 'Errore download modello', deleteConfirm: 'Sei sicuro di voler eliminare questo modello?',
      noModels: 'Nessun modello. Scarica un modello sopra.', selectModel: 'Seleziona modello',
      typeMessage: 'Scrivi il tuo messaggio...', send: 'Invia', thinking: 'Pensando...',
      newChat: 'Nuova Chat', clearChat: 'Cancella chat', size: 'Dimensione',
      welcome: 'Inizia a chattare con Ollama', welcomeSub: 'Seleziona o scarica prima un modello dal pannello sinistro',
      stopGen: 'Ferma', copied: 'Copiato', copy: 'Copia', port: 'Porta',
      refreshModels: 'Aggiorna modelli', modelPullPlaceholder: 'es: llama3.2, mistral, gemma2',
      system: 'Messaggio di sistema', systemPlaceholder: 'Messaggio di sistema opzionale...'
    },
    ar: {
      checking: 'جارٍ التحقق من حالة Ollama...', pulling: 'جارٍ تنزيل صورة Docker...', starting: 'جارٍ تشغيل Ollama...', restarting: 'جارٍ إعادة تشغيل Ollama...',
      error: 'حدث خطأ', retry: 'إعادة المحاولة', restartTip: 'إعادة التشغيل', stopTip: 'إيقاف',
      stopped: 'Ollama متوقف', stoppedSub: 'منصة تشغيل LLM محلية', start: 'تشغيل',
      models: 'النماذج', chat: 'محادثة', pullModel: 'تنزيل نموذج', deleteModel: 'حذف',
      modelName: 'اسم النموذج (مثال: llama3.2, mistral, gemma2)', pull: 'تنزيل',
      pullingModel: 'جارٍ تنزيل النموذج...', pullSuccess: 'تم تنزيل النموذج بنجاح',
      pullError: 'خطأ في تنزيل النموذج', deleteConfirm: 'هل أنت متأكد من حذف هذا النموذج؟',
      noModels: 'لا توجد نماذج بعد. قم بتنزيل نموذج من الأعلى.', selectModel: 'اختر نموذجاً',
      typeMessage: 'اكتب رسالتك...', send: 'إرسال', thinking: 'يفكر...',
      newChat: 'محادثة جديدة', clearChat: 'مسح المحادثة', size: 'الحجم',
      welcome: 'ابدأ المحادثة مع Ollama', welcomeSub: 'اختر أو نزّل نموذجاً من اللوحة اليسرى أولاً',
      stopGen: 'إيقاف', copied: 'تم النسخ', copy: 'نسخ', port: 'المنفذ',
      refreshModels: 'تحديث النماذج', modelPullPlaceholder: 'مثال: llama3.2, mistral, gemma2',
      system: 'رسالة النظام', systemPlaceholder: 'رسالة نظام اختيارية...'
    },
    ko: {
      checking: 'Ollama 상태 확인 중...', pulling: 'Docker 이미지 다운로드 중...', starting: 'Ollama 시작 중...', restarting: 'Ollama 재시작 중...',
      error: '오류가 발생했습니다', retry: '다시 시도', restartTip: '재시작', stopTip: '중지',
      stopped: 'Ollama 중지됨', stoppedSub: '로컬 LLM 실행 플랫폼', start: '시작',
      models: '모델', chat: '채팅', pullModel: '모델 다운로드', deleteModel: '삭제',
      modelName: '모델 이름 (예: llama3.2, mistral, gemma2)', pull: '다운로드',
      pullingModel: '모델 다운로드 중...', pullSuccess: '모델 다운로드 성공',
      pullError: '모델 다운로드 오류', deleteConfirm: '이 모델을 삭제하시겠습니까?',
      noModels: '모델이 없습니다. 위에서 모델을 다운로드하세요.', selectModel: '모델 선택',
      typeMessage: '메시지를 입력하세요...', send: '보내기', thinking: '생각 중...',
      newChat: '새 채팅', clearChat: '채팅 지우기', size: '크기',
      welcome: 'Ollama와 채팅을 시작하세요', welcomeSub: '먼저 왼쪽 패널에서 모델을 선택하거나 다운로드하세요',
      stopGen: '중지', copied: '복사됨', copy: '복사', port: '포트',
      refreshModels: '모델 새로고침', modelPullPlaceholder: '예: llama3.2, mistral, gemma2',
      system: '시스템 메시지', systemPlaceholder: '선택적 시스템 메시지...'
    },
    hi: {
      checking: 'Ollama स्थिति जाँच रहा है...', pulling: 'Docker इमेज डाउनलोड हो रही है...', starting: 'Ollama शुरू हो रहा है...', restarting: 'Ollama पुनः आरंभ हो रहा है...',
      error: 'एक त्रुटि हुई', retry: 'पुनः प्रयास करें', restartTip: 'पुनः आरंभ करें', stopTip: 'रोकें',
      stopped: 'Ollama रुका हुआ', stoppedSub: 'स्थानीय LLM रनटाइम प्लेटफ़ॉर्म', start: 'शुरू करें',
      models: 'मॉडल', chat: 'चैट', pullModel: 'मॉडल डाउनलोड करें', deleteModel: 'हटाएं',
      modelName: 'मॉडल का नाम (उदा: llama3.2, mistral, gemma2)', pull: 'डाउनलोड',
      pullingModel: 'मॉडल डाउनलोड हो रहा है...', pullSuccess: 'मॉडल सफलतापूर्वक डाउनलोड हुआ',
      pullError: 'मॉडल डाउनलोड त्रुटि', deleteConfirm: 'क्या आप इस मॉडल को हटाना चाहते हैं?',
      noModels: 'अभी कोई मॉडल नहीं। ऊपर से मॉडल डाउनलोड करें।', selectModel: 'मॉडल चुनें',
      typeMessage: 'अपना संदेश लिखें...', send: 'भेजें', thinking: 'सोच रहा है...',
      newChat: 'नई चैट', clearChat: 'चैट साफ़ करें', size: 'आकार',
      welcome: 'Ollama के साथ चैट शुरू करें', welcomeSub: 'पहले बाएं पैनल से मॉडल चुनें या डाउनलोड करें',
      stopGen: 'रोकें', copied: 'कॉपी किया', copy: 'कॉपी', port: 'पोर्ट',
      refreshModels: 'मॉडल रीफ्रेश करें', modelPullPlaceholder: 'उदा: llama3.2, mistral, gemma2',
      system: 'सिस्टम संदेश', systemPlaceholder: 'वैकल्पिक सिस्टम संदेश...'
    },
    pt: {
      checking: 'Verificando status do Ollama...', pulling: 'Baixando imagem Docker...', starting: 'Iniciando Ollama...', restarting: 'Reiniciando Ollama...',
      error: 'Ocorreu um erro', retry: 'Tentar novamente', restartTip: 'Reiniciar', stopTip: 'Parar',
      stopped: 'Ollama parado', stoppedSub: 'Plataforma local de execução LLM', start: 'Iniciar',
      models: 'Modelos', chat: 'Chat', pullModel: 'Baixar modelo', deleteModel: 'Excluir',
      modelName: 'Nome do modelo (ex: llama3.2, mistral, gemma2)', pull: 'Baixar',
      pullingModel: 'Baixando modelo...', pullSuccess: 'Modelo baixado com sucesso',
      pullError: 'Erro ao baixar modelo', deleteConfirm: 'Tem certeza de que deseja excluir este modelo?',
      noModels: 'Nenhum modelo ainda. Baixe um modelo acima.', selectModel: 'Selecionar modelo',
      typeMessage: 'Digite sua mensagem...', send: 'Enviar', thinking: 'Pensando...',
      newChat: 'Novo Chat', clearChat: 'Limpar chat', size: 'Tamanho',
      welcome: 'Comece a conversar com o Ollama', welcomeSub: 'Selecione ou baixe um modelo no painel esquerdo primeiro',
      stopGen: 'Parar', copied: 'Copiado', copy: 'Copiar', port: 'Porta',
      refreshModels: 'Atualizar modelos', modelPullPlaceholder: 'ex: llama3.2, mistral, gemma2',
      system: 'Mensagem do sistema', systemPlaceholder: 'Mensagem do sistema opcional...'
    }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  function formatSize(bytes) {
    if (!bytes) return '—';
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return gb.toFixed(1) + ' GB';
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(0) + ' MB';
  }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
      function onLocaleChanged() { locale.value = getLocale(); }

      const status = ref('idle');
      const errorMsg = ref('');
      const port = ref(null);
      const containerId = ref(null);
      const pullProgress = ref('');

      /* ── Model Management ── */
      const models = ref([]);
      const selectedModel = ref('');
      const pullModelName = ref('');
      const pullingModelFlag = ref(false);
      const pullModelStatus = ref('');

      /* ── Chat ── */
      const messages = ref([]);
      const userInput = ref('');
      const generating = ref(false);
      const systemMessage = ref('');
      let abortController = null;

      const chatContainer = ref(null);

      function getToken() {
        const c = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith('token='));
        return c ? c.split('=')[1] : '';
      }

      async function apiFetch(url, opts = {}) {
        const token = getToken();
        const headers = { ...(opts.headers || {}) };
        if (token) headers['Authorization'] = 'Bearer ' + token;
        if (opts.body && typeof opts.body === 'string') headers['Content-Type'] = 'application/json';
        return fetch(url, { ...opts, headers });
      }

      function getVolumes() { return ['${APP_VOLUME}:/root/.ollama']; }
      function getEnv() { return []; }

      /* ── Docker Lifecycle ── */
      async function checkAndStart() {
        status.value = 'checking';
        errorMsg.value = '';
        try {
          const res = await apiFetch('/api/docker/status/' + APP_ID);
          const data = await res.json();
          if (data.running) {
            port.value = data.hostPort || data.portMappings?.[CONTAINER_PORT] || null;
            containerId.value = data.containerId || null;
            status.value = 'running';
            await loadModels();
            return;
          }
          await startContainer();
        } catch (e) {
          errorMsg.value = e.message;
          status.value = 'error';
        }
      }

      async function startContainer() {
        status.value = 'starting';
        try {
          const body = {
            image: DOCKER_IMAGE,
            appId: APP_ID,
            containerPort: CONTAINER_PORT,
            volumes: getVolumes(),
            env: getEnv(),
            restart: 'unless-stopped'
          };
          const res = await apiFetch('/api/docker/run', { method: 'POST', body: JSON.stringify(body) });
          const data = await res.json();
          if (!res.ok) {
            if (data.error && data.error.includes('image') || (data.error && data.error.includes('No such'))) {
              await pullImage();
              return;
            }
            throw new Error(data.error || 'Start failed');
          }
          port.value = data.hostPort || null;
          containerId.value = data.containerId || null;
          await new Promise(r => setTimeout(r, 4000));
          status.value = 'running';
          await loadModels();
        } catch (e) {
          errorMsg.value = e.message;
          status.value = 'error';
        }
      }

      async function pullImage() {
        status.value = 'pulling';
        pullProgress.value = L('pulling') + ' ' + DOCKER_IMAGE;
        try {
          const res = await apiFetch('/api/docker/pull', { method: 'POST', body: JSON.stringify({ image: DOCKER_IMAGE }) });
          if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Pull failed'); }
          await startContainer();
        } catch (e) {
          errorMsg.value = e.message;
          status.value = 'error';
        }
      }

      async function stopContainer() {
        try {
          await apiFetch('/api/docker/stop', { method: 'POST', body: JSON.stringify({ appId: APP_ID }) });
        } catch {}
        port.value = null;
        containerId.value = null;
        status.value = 'idle';
        models.value = [];
        messages.value = [];
      }

      async function restart() {
        status.value = 'checking';
        try {
          await apiFetch('/api/docker/stop', { method: 'POST', body: JSON.stringify({ appId: APP_ID }) });
          await new Promise(r => setTimeout(r, 1000));
        } catch {}
        await checkAndStart();
      }

      /* ── Ollama API (proxied) ── */
      function ollamaUrl(path) {
        return '/proxy/' + APP_ID + path;
      }

      async function loadModels() {
        try {
          const res = await apiFetch(ollamaUrl('/api/tags'));
          if (!res.ok) return;
          const data = await res.json();
          models.value = (data.models || []).map(m => ({
            name: m.name,
            size: m.size,
            modified: m.modified_at,
            paramSize: m.details?.parameter_size || '',
            family: m.details?.family || '',
            quantization: m.details?.quantization_level || ''
          }));
          if (models.value.length && !selectedModel.value) {
            selectedModel.value = models.value[0].name;
          }
        } catch {}
      }

      async function pullModel() {
        const name = pullModelName.value.trim();
        if (!name || pullingModelFlag.value) return;
        pullingModelFlag.value = true;
        pullModelStatus.value = L('pullingModel');
        try {
          const res = await apiFetch(ollamaUrl('/api/pull'), {
            method: 'POST',
            body: JSON.stringify({ name, stream: false })
          });
          if (!res.ok) {
            const d = await res.json().catch(() => ({}));
            throw new Error(d.error || L('pullError'));
          }
          pullModelStatus.value = L('pullSuccess');
          pullModelName.value = '';
          await loadModels();
          setTimeout(() => { pullModelStatus.value = ''; }, 3000);
        } catch (e) {
          pullModelStatus.value = L('pullError') + ': ' + e.message;
        } finally {
          pullingModelFlag.value = false;
        }
      }

      async function deleteModel(name) {
        if (!confirm(L('deleteConfirm'))) return;
        try {
          await apiFetch(ollamaUrl('/api/delete'), {
            method: 'DELETE',
            body: JSON.stringify({ name })
          });
          if (selectedModel.value === name) selectedModel.value = '';
          await loadModels();
        } catch {}
      }

      /* ── Chat ── */
      function clearChat() {
        messages.value = [];
      }

      function scrollToBottom() {
        nextTick(() => {
          if (chatContainer.value) {
            chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
          }
        });
      }

      async function sendMessage() {
        const text = userInput.value.trim();
        if (!text || !selectedModel.value || generating.value) return;

        messages.value.push({ role: 'user', content: text });
        userInput.value = '';
        generating.value = true;
        scrollToBottom();

        const assistantMsg = { role: 'assistant', content: '' };
        messages.value.push(assistantMsg);

        try {
          abortController = new AbortController();
          const chatMessages = [];
          if (systemMessage.value.trim()) {
            chatMessages.push({ role: 'system', content: systemMessage.value.trim() });
          }
          for (const m of messages.value) {
            if (m.role === 'user' || (m.role === 'assistant' && m.content)) {
              chatMessages.push({ role: m.role, content: m.content });
            }
          }
          // Remove last empty assistant
          if (chatMessages.length && chatMessages[chatMessages.length - 1].role === 'assistant' && !chatMessages[chatMessages.length - 1].content) {
            chatMessages.pop();
          }

          const res = await apiFetch(ollamaUrl('/api/chat'), {
            method: 'POST',
            body: JSON.stringify({ model: selectedModel.value, messages: chatMessages, stream: true }),
            signal: abortController.signal
          });

          if (!res.ok) {
            const d = await res.json().catch(() => ({}));
            throw new Error(d.error || 'Chat error');
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
              if (!line.trim()) continue;
              try {
                const chunk = JSON.parse(line);
                if (chunk.message?.content) {
                  const idx = messages.value.length - 1;
                  messages.value[idx] = { ...messages.value[idx], content: messages.value[idx].content + chunk.message.content };
                }
              } catch {}
            }
            scrollToBottom();
          }
          // Process remaining buffer
          if (buffer.trim()) {
            try {
              const chunk = JSON.parse(buffer);
              if (chunk.message?.content) {
                const idx = messages.value.length - 1;
                messages.value[idx] = { ...messages.value[idx], content: messages.value[idx].content + chunk.message.content };
              }
            } catch {}
          }
        } catch (e) {
          if (e.name !== 'AbortError') {
            const idx = messages.value.length - 1;
            if (!messages.value[idx].content) {
              messages.value[idx] = { ...messages.value[idx], content: '⚠️ ' + e.message };
            }
          }
        } finally {
          generating.value = false;
          abortController = null;
          scrollToBottom();
        }
      }

      function stopGeneration() {
        if (abortController) abortController.abort();
      }

      function copyMessage(content) {
        navigator.clipboard.writeText(content).catch(() => {});
      }

      function handleInputKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      }

      onMounted(() => {
        window.addEventListener('locale-changed', onLocaleChanged);
        checkAndStart();
      });

      onUnmounted(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
        if (abortController) abortController.abort();
      });

      return {
        L, locale, status, errorMsg, port, pullProgress,
        models, selectedModel, pullModelName, pullingModelFlag, pullModelStatus,
        messages, userInput, generating, systemMessage, chatContainer,
        checkAndStart, stopContainer, restart,
        loadModels, pullModel, deleteModel,
        sendMessage, stopGeneration, clearChat, copyMessage, handleInputKeydown,
        formatSize
      };
    }
  };
})(Vue);
