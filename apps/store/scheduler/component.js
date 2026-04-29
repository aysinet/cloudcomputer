(function(Vue) {
  const { ref, reactive, computed, onMounted, onUnmounted, watch } = Vue;

  const LANGS = {
    tr: {
      title:'Zamanlayıcı', add:'Yeni Görev', edit:'Düzenle', save:'Kaydet', cancel:'İptal', delete:'Sil',
      nameLabel:'Görev Adı', dateTimeLabel:'Tarih & Saat', repeatLabel:'Tekrar', actionLabel:'Eylem Türü',
      noRepeat:'Tekrar Yok', hourly:'Saatlik', daily:'Günlük', weekly:'Haftalık', monthly:'Aylık',
      actionNotify:'Bildirim Gönder', actionApp:'Uygulama Çalıştır', actionWebhook:'Webhook Gönder',
      notifyTitle:'Bildirim Başlığı', notifyText:'Bildirim Metni', appSelect:'Uygulama Seç',
      webhookUrl:'Webhook URL', webhookMethod:'HTTP Metodu', webhookBody:'İstek Gövdesi (JSON)',
      webhookHeaders:'Başlıklar (JSON)', enabled:'Aktif', disabled:'Pasif',
      noTasks:'Henüz zamanlanmış görev yok', deleteConfirm:'Bu görevi silmek istediğinize emin misiniz?',
      filterAll:'Tümü', filterActive:'Aktif', filterDisabled:'Pasif',
      on:'Açık', off:'Kapalı', nameRequired:'Görev adı gerekli', dateRequired:'Tarih ve saat gerekli',
      lastRun:'Son Çalıştırma', nextRun:'Sonraki Çalıştırma', never:'Hiç', status:'Durum',
      runNow:'Şimdi Çalıştır', history:'Geçmiş', success:'Başarılı', failed:'Başarısız',
      logEmpty:'Henüz çalıştırma kaydı yok', close:'Kapat', result:'Sonuç',
      webhookUrlRequired:'Webhook URL gerekli'
    },
    en: {
      title:'Scheduler', add:'New Task', edit:'Edit', save:'Save', cancel:'Cancel', delete:'Delete',
      nameLabel:'Task Name', dateTimeLabel:'Date & Time', repeatLabel:'Repeat', actionLabel:'Action Type',
      noRepeat:'No Repeat', hourly:'Hourly', daily:'Daily', weekly:'Weekly', monthly:'Monthly',
      actionNotify:'Send Notification', actionApp:'Run App', actionWebhook:'Send Webhook',
      notifyTitle:'Notification Title', notifyText:'Notification Text', appSelect:'Select App',
      webhookUrl:'Webhook URL', webhookMethod:'HTTP Method', webhookBody:'Request Body (JSON)',
      webhookHeaders:'Headers (JSON)', enabled:'Enabled', disabled:'Disabled',
      noTasks:'No scheduled tasks yet', deleteConfirm:'Are you sure you want to delete this task?',
      filterAll:'All', filterActive:'Active', filterDisabled:'Disabled',
      on:'On', off:'Off', nameRequired:'Task name is required', dateRequired:'Date and time required',
      lastRun:'Last Run', nextRun:'Next Run', never:'Never', status:'Status',
      runNow:'Run Now', history:'History', success:'Success', failed:'Failed',
      logEmpty:'No execution history yet', close:'Close', result:'Result',
      webhookUrlRequired:'Webhook URL is required'
    },
    de: {
      title:'Planer', add:'Neue Aufgabe', edit:'Bearbeiten', save:'Speichern', cancel:'Abbrechen', delete:'Löschen',
      nameLabel:'Aufgabenname', dateTimeLabel:'Datum & Zeit', repeatLabel:'Wiederholung', actionLabel:'Aktionstyp',
      noRepeat:'Keine Wiederholung', hourly:'Stündlich', daily:'Täglich', weekly:'Wöchentlich', monthly:'Monatlich',
      actionNotify:'Benachrichtigung senden', actionApp:'App ausführen', actionWebhook:'Webhook senden',
      notifyTitle:'Benachrichtigungstitel', notifyText:'Benachrichtigungstext', appSelect:'App auswählen',
      webhookUrl:'Webhook-URL', webhookMethod:'HTTP-Methode', webhookBody:'Anfragekörper (JSON)',
      webhookHeaders:'Header (JSON)', enabled:'Aktiviert', disabled:'Deaktiviert',
      noTasks:'Noch keine geplanten Aufgaben', deleteConfirm:'Möchten Sie diese Aufgabe wirklich löschen?',
      filterAll:'Alle', filterActive:'Aktiv', filterDisabled:'Deaktiviert',
      on:'Ein', off:'Aus', nameRequired:'Aufgabenname erforderlich', dateRequired:'Datum und Zeit erforderlich',
      lastRun:'Letzter Lauf', nextRun:'Nächster Lauf', never:'Nie', status:'Status',
      runNow:'Jetzt ausführen', history:'Verlauf', success:'Erfolgreich', failed:'Fehlgeschlagen',
      logEmpty:'Noch kein Ausführungsverlauf', close:'Schließen', result:'Ergebnis',
      webhookUrlRequired:'Webhook-URL erforderlich'
    },
    fr: {
      title:'Planificateur', add:'Nouvelle tâche', edit:'Modifier', save:'Enregistrer', cancel:'Annuler', delete:'Supprimer',
      nameLabel:'Nom de la tâche', dateTimeLabel:'Date & Heure', repeatLabel:'Répétition', actionLabel:"Type d'action",
      noRepeat:'Pas de répétition', hourly:'Toutes les heures', daily:'Quotidien', weekly:'Hebdomadaire', monthly:'Mensuel',
      actionNotify:'Envoyer une notification', actionApp:'Lancer une app', actionWebhook:'Envoyer un webhook',
      notifyTitle:'Titre de notification', notifyText:'Texte de notification', appSelect:'Sélectionner une app',
      webhookUrl:'URL du webhook', webhookMethod:'Méthode HTTP', webhookBody:'Corps de la requête (JSON)',
      webhookHeaders:'En-têtes (JSON)', enabled:'Activé', disabled:'Désactivé',
      noTasks:'Aucune tâche planifiée', deleteConfirm:'Êtes-vous sûr de vouloir supprimer cette tâche ?',
      filterAll:'Tous', filterActive:'Actifs', filterDisabled:'Désactivés',
      on:'On', off:'Off', nameRequired:'Nom de tâche requis', dateRequired:'Date et heure requises',
      lastRun:'Dernier lancement', nextRun:'Prochain lancement', never:'Jamais', status:'Statut',
      runNow:'Exécuter maintenant', history:'Historique', success:'Succès', failed:'Échec',
      logEmpty:"Pas encore d'historique", close:'Fermer', result:'Résultat',
      webhookUrlRequired:'URL du webhook requise'
    },
    es: {
      title:'Programador', add:'Nueva tarea', edit:'Editar', save:'Guardar', cancel:'Cancelar', delete:'Eliminar',
      nameLabel:'Nombre de tarea', dateTimeLabel:'Fecha y hora', repeatLabel:'Repetir', actionLabel:'Tipo de acción',
      noRepeat:'Sin repetición', hourly:'Cada hora', daily:'Diario', weekly:'Semanal', monthly:'Mensual',
      actionNotify:'Enviar notificación', actionApp:'Ejecutar app', actionWebhook:'Enviar webhook',
      notifyTitle:'Título de notificación', notifyText:'Texto de notificación', appSelect:'Seleccionar app',
      webhookUrl:'URL del webhook', webhookMethod:'Método HTTP', webhookBody:'Cuerpo de solicitud (JSON)',
      webhookHeaders:'Encabezados (JSON)', enabled:'Activado', disabled:'Desactivado',
      noTasks:'Aún no hay tareas programadas', deleteConfirm:'¿Está seguro de que desea eliminar esta tarea?',
      filterAll:'Todos', filterActive:'Activos', filterDisabled:'Desactivados',
      on:'On', off:'Off', nameRequired:'Nombre de tarea requerido', dateRequired:'Fecha y hora requeridas',
      lastRun:'Última ejecución', nextRun:'Próxima ejecución', never:'Nunca', status:'Estado',
      runNow:'Ejecutar ahora', history:'Historial', success:'Éxito', failed:'Fallido',
      logEmpty:'Sin historial de ejecución', close:'Cerrar', result:'Resultado',
      webhookUrlRequired:'URL del webhook requerida'
    },
    ru: {
      title:'Планировщик', add:'Новая задача', edit:'Редактировать', save:'Сохранить', cancel:'Отмена', delete:'Удалить',
      nameLabel:'Имя задачи', dateTimeLabel:'Дата и время', repeatLabel:'Повтор', actionLabel:'Тип действия',
      noRepeat:'Без повтора', hourly:'Ежечасно', daily:'Ежедневно', weekly:'Еженедельно', monthly:'Ежемесячно',
      actionNotify:'Отправить уведомление', actionApp:'Запустить приложение', actionWebhook:'Отправить вебхук',
      notifyTitle:'Заголовок уведомления', notifyText:'Текст уведомления', appSelect:'Выбрать приложение',
      webhookUrl:'URL вебхука', webhookMethod:'HTTP метод', webhookBody:'Тело запроса (JSON)',
      webhookHeaders:'Заголовки (JSON)', enabled:'Включено', disabled:'Отключено',
      noTasks:'Пока нет запланированных задач', deleteConfirm:'Вы уверены, что хотите удалить эту задачу?',
      filterAll:'Все', filterActive:'Активные', filterDisabled:'Отключённые',
      on:'Вкл', off:'Выкл', nameRequired:'Имя задачи обязательно', dateRequired:'Дата и время обязательны',
      lastRun:'Последний запуск', nextRun:'Следующий запуск', never:'Никогда', status:'Статус',
      runNow:'Запустить сейчас', history:'История', success:'Успешно', failed:'Ошибка',
      logEmpty:'Нет истории выполнения', close:'Закрыть', result:'Результат',
      webhookUrlRequired:'URL вебхука обязателен'
    },
    zh: {
      title:'调度器', add:'新任务', edit:'编辑', save:'保存', cancel:'取消', delete:'删除',
      nameLabel:'任务名称', dateTimeLabel:'日期和时间', repeatLabel:'重复', actionLabel:'操作类型',
      noRepeat:'不重复', hourly:'每小时', daily:'每天', weekly:'每周', monthly:'每月',
      actionNotify:'发送通知', actionApp:'运行应用', actionWebhook:'发送Webhook',
      notifyTitle:'通知标题', notifyText:'通知内容', appSelect:'选择应用',
      webhookUrl:'Webhook URL', webhookMethod:'HTTP方法', webhookBody:'请求体 (JSON)',
      webhookHeaders:'请求头 (JSON)', enabled:'启用', disabled:'禁用',
      noTasks:'暂无计划任务', deleteConfirm:'确定要删除此任务吗？',
      filterAll:'全部', filterActive:'活跃', filterDisabled:'已禁用',
      on:'开', off:'关', nameRequired:'任务名称必填', dateRequired:'日期和时间必填',
      lastRun:'上次运行', nextRun:'下次运行', never:'从未', status:'状态',
      runNow:'立即运行', history:'历史', success:'成功', failed:'失败',
      logEmpty:'暂无执行记录', close:'关闭', result:'结果',
      webhookUrlRequired:'Webhook URL 必填'
    },
    ja: {
      title:'スケジューラ', add:'新しいタスク', edit:'編集', save:'保存', cancel:'キャンセル', delete:'削除',
      nameLabel:'タスク名', dateTimeLabel:'日時', repeatLabel:'繰り返し', actionLabel:'アクションタイプ',
      noRepeat:'繰り返しなし', hourly:'毎時', daily:'毎日', weekly:'毎週', monthly:'毎月',
      actionNotify:'通知を送信', actionApp:'アプリを実行', actionWebhook:'Webhookを送信',
      notifyTitle:'通知タイトル', notifyText:'通知テキスト', appSelect:'アプリを選択',
      webhookUrl:'Webhook URL', webhookMethod:'HTTPメソッド', webhookBody:'リクエストボディ (JSON)',
      webhookHeaders:'ヘッダー (JSON)', enabled:'有効', disabled:'無効',
      noTasks:'予定タスクはありません', deleteConfirm:'このタスクを削除してもよいですか？',
      filterAll:'すべて', filterActive:'アクティブ', filterDisabled:'無効',
      on:'オン', off:'オフ', nameRequired:'タスク名は必須です', dateRequired:'日時は必須です',
      lastRun:'最終実行', nextRun:'次回実行', never:'なし', status:'ステータス',
      runNow:'今すぐ実行', history:'履歴', success:'成功', failed:'失敗',
      logEmpty:'実行履歴はありません', close:'閉じる', result:'結果',
      webhookUrlRequired:'Webhook URLは必須です'
    },
    it: {
      title:'Pianificatore', add:'Nuova attività', edit:'Modifica', save:'Salva', cancel:'Annulla', delete:'Elimina',
      nameLabel:'Nome attività', dateTimeLabel:'Data e ora', repeatLabel:'Ripetizione', actionLabel:"Tipo di azione",
      noRepeat:'Nessuna ripetizione', hourly:'Ogni ora', daily:'Giornaliero', weekly:'Settimanale', monthly:'Mensile',
      actionNotify:'Invia notifica', actionApp:'Avvia app', actionWebhook:'Invia webhook',
      notifyTitle:'Titolo notifica', notifyText:'Testo notifica', appSelect:'Seleziona app',
      webhookUrl:'URL webhook', webhookMethod:'Metodo HTTP', webhookBody:'Corpo richiesta (JSON)',
      webhookHeaders:'Intestazioni (JSON)', enabled:'Attivato', disabled:'Disattivato',
      noTasks:'Nessuna attività pianificata', deleteConfirm:'Sei sicuro di voler eliminare questa attività?',
      filterAll:'Tutti', filterActive:'Attivi', filterDisabled:'Disattivati',
      on:'On', off:'Off', nameRequired:'Nome attività obbligatorio', dateRequired:'Data e ora obbligatorie',
      lastRun:'Ultima esecuzione', nextRun:'Prossima esecuzione', never:'Mai', status:'Stato',
      runNow:'Esegui ora', history:'Cronologia', success:'Riuscito', failed:'Fallito',
      logEmpty:'Nessun record di esecuzione', close:'Chiudi', result:'Risultato',
      webhookUrlRequired:'URL webhook obbligatorio'
    },
    ar: {
      title:'المجدول', add:'مهمة جديدة', edit:'تعديل', save:'حفظ', cancel:'إلغاء', delete:'حذف',
      nameLabel:'اسم المهمة', dateTimeLabel:'التاريخ والوقت', repeatLabel:'تكرار', actionLabel:'نوع الإجراء',
      noRepeat:'بدون تكرار', hourly:'كل ساعة', daily:'يومي', weekly:'أسبوعي', monthly:'شهري',
      actionNotify:'إرسال إشعار', actionApp:'تشغيل تطبيق', actionWebhook:'إرسال Webhook',
      notifyTitle:'عنوان الإشعار', notifyText:'نص الإشعار', appSelect:'اختر تطبيق',
      webhookUrl:'رابط Webhook', webhookMethod:'طريقة HTTP', webhookBody:'جسم الطلب (JSON)',
      webhookHeaders:'الرؤوس (JSON)', enabled:'مفعل', disabled:'معطل',
      noTasks:'لا توجد مهام مجدولة', deleteConfirm:'هل أنت متأكد من حذف هذه المهمة؟',
      filterAll:'الكل', filterActive:'نشط', filterDisabled:'معطل',
      on:'تشغيل', off:'إيقاف', nameRequired:'اسم المهمة مطلوب', dateRequired:'التاريخ والوقت مطلوبان',
      lastRun:'آخر تشغيل', nextRun:'التشغيل التالي', never:'أبداً', status:'الحالة',
      runNow:'تشغيل الآن', history:'السجل', success:'نجاح', failed:'فشل',
      logEmpty:'لا يوجد سجل تنفيذ', close:'إغلاق', result:'النتيجة',
      webhookUrlRequired:'رابط Webhook مطلوب'
    },
    ko: {
      title:'스케줄러', add:'새 작업', edit:'편집', save:'저장', cancel:'취소', delete:'삭제',
      nameLabel:'작업 이름', dateTimeLabel:'날짜 및 시간', repeatLabel:'반복', actionLabel:'액션 유형',
      noRepeat:'반복 없음', hourly:'매시간', daily:'매일', weekly:'매주', monthly:'매월',
      actionNotify:'알림 보내기', actionApp:'앱 실행', actionWebhook:'Webhook 보내기',
      notifyTitle:'알림 제목', notifyText:'알림 텍스트', appSelect:'앱 선택',
      webhookUrl:'Webhook URL', webhookMethod:'HTTP 메서드', webhookBody:'요청 본문 (JSON)',
      webhookHeaders:'헤더 (JSON)', enabled:'활성화', disabled:'비활성화',
      noTasks:'예약된 작업 없음', deleteConfirm:'이 작업을 삭제하시겠습니까?',
      filterAll:'전체', filterActive:'활성', filterDisabled:'비활성',
      on:'켜기', off:'끄기', nameRequired:'작업 이름 필수', dateRequired:'날짜와 시간 필수',
      lastRun:'마지막 실행', nextRun:'다음 실행', never:'없음', status:'상태',
      runNow:'지금 실행', history:'기록', success:'성공', failed:'실패',
      logEmpty:'실행 기록 없음', close:'닫기', result:'결과',
      webhookUrlRequired:'Webhook URL 필수'
    },
    hi: {
      title:'शेड्यूलर', add:'नया कार्य', edit:'संपादन', save:'सहेजें', cancel:'रद्द करें', delete:'हटाएं',
      nameLabel:'कार्य का नाम', dateTimeLabel:'दिनांक और समय', repeatLabel:'दोहराव', actionLabel:'क्रिया प्रकार',
      noRepeat:'कोई दोहराव नहीं', hourly:'प्रति घंटा', daily:'दैनिक', weekly:'साप्ताहिक', monthly:'मासिक',
      actionNotify:'अधिसूचना भेजें', actionApp:'ऐप चलाएं', actionWebhook:'Webhook भेजें',
      notifyTitle:'अधिसूचना शीर्षक', notifyText:'अधिसूचना पाठ', appSelect:'ऐप चुनें',
      webhookUrl:'Webhook URL', webhookMethod:'HTTP विधि', webhookBody:'अनुरोध बॉडी (JSON)',
      webhookHeaders:'हेडर (JSON)', enabled:'सक्षम', disabled:'अक्षम',
      noTasks:'कोई निर्धारित कार्य नहीं', deleteConfirm:'क्या आप इस कार्य को हटाना चाहते हैं?',
      filterAll:'सभी', filterActive:'सक्रिय', filterDisabled:'अक्षम',
      on:'चालू', off:'बंद', nameRequired:'कार्य का नाम आवश्यक', dateRequired:'दिनांक और समय आवश्यक',
      lastRun:'अंतिम चलाव', nextRun:'अगला चलाव', never:'कभी नहीं', status:'स्थिति',
      runNow:'अभी चलाएं', history:'इतिहास', success:'सफल', failed:'विफल',
      logEmpty:'कोई निष्पादन इतिहास नहीं', close:'बंद करें', result:'परिणाम',
      webhookUrlRequired:'Webhook URL आवश्यक'
    },
    pt: {
      title:'Agendador', add:'Nova tarefa', edit:'Editar', save:'Salvar', cancel:'Cancelar', delete:'Excluir',
      nameLabel:'Nome da tarefa', dateTimeLabel:'Data e hora', repeatLabel:'Repetir', actionLabel:'Tipo de ação',
      noRepeat:'Sem repetição', hourly:'A cada hora', daily:'Diário', weekly:'Semanal', monthly:'Mensal',
      actionNotify:'Enviar notificação', actionApp:'Executar app', actionWebhook:'Enviar webhook',
      notifyTitle:'Título da notificação', notifyText:'Texto da notificação', appSelect:'Selecionar app',
      webhookUrl:'URL do webhook', webhookMethod:'Método HTTP', webhookBody:'Corpo da requisição (JSON)',
      webhookHeaders:'Cabeçalhos (JSON)', enabled:'Ativado', disabled:'Desativado',
      noTasks:'Nenhuma tarefa agendada', deleteConfirm:'Tem certeza de que deseja excluir esta tarefa?',
      filterAll:'Todos', filterActive:'Ativos', filterDisabled:'Desativados',
      on:'Ligado', off:'Desligado', nameRequired:'Nome da tarefa obrigatório', dateRequired:'Data e hora obrigatórias',
      lastRun:'Última execução', nextRun:'Próxima execução', never:'Nunca', status:'Status',
      runNow:'Executar agora', history:'Histórico', success:'Sucesso', failed:'Falha',
      logEmpty:'Sem histórico de execução', close:'Fechar', result:'Resultado',
      webhookUrlRequired:'URL do webhook obrigatória'
    }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }
  function authHeaders() { return { 'Authorization': 'Bearer ' + (localStorage.getItem('auth_token') || ''), 'Content-Type': 'application/json' }; }

  return {
    setup(props) {
      const locale = ref((props.settings && props.settings.lang) || getLocale());
      function L(key) { return (LANGS[locale.value] || LANGS.en)[key] || (LANGS.en)[key] || key; }
      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

      const tasks = ref([]);
      const filter = ref('all');
      const editingId = ref(null);
      const showForm = ref(false);
      const showLog = ref(false);
      const logTask = ref(null);
      const logEntries = ref([]);
      const formError = ref('');
      const installedApps = ref([]);

      const form = Vue.reactive({
        name: '',
        datetime: '',
        repeat: '',
        actionType: 'notify',
        notifyTitle: '',
        notifyText: '',
        appId: '',
        webhookUrl: '',
        webhookMethod: 'POST',
        webhookBody: '',
        webhookHeaders: ''
      });

      const repeatOptions = computed(function() {
        return [
          { value: '', label: L('noRepeat') },
          { value: 'hourly', label: L('hourly') },
          { value: 'daily', label: L('daily') },
          { value: 'weekly', label: L('weekly') },
          { value: 'monthly', label: L('monthly') }
        ];
      });

      const actionOptions = computed(function() {
        return [
          { value: 'notify', label: '🔔 ' + L('actionNotify') },
          { value: 'app', label: '📂 ' + L('actionApp') },
          { value: 'webhook', label: '🌐 ' + L('actionWebhook') }
        ];
      });

      const counts = computed(function() {
        var all = tasks.value.length;
        var active = tasks.value.filter(function(t) { return t.enabled; }).length;
        return { all: all, active: active, disabled: all - active };
      });

      const filteredTasks = computed(function() {
        var list = tasks.value.slice();
        if (filter.value === 'active') list = list.filter(function(t) { return t.enabled; });
        else if (filter.value === 'disabled') list = list.filter(function(t) { return !t.enabled; });
        list.sort(function(a, b) {
          if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
          return new Date(a.datetime) - new Date(b.datetime);
        });
        return list;
      });

      async function loadTasks() {
        try {
          var r = await fetch('/api/scheduler', { headers: authHeaders() });
          if (r.ok) tasks.value = await r.json();
        } catch (e) { console.error('Load scheduler error', e); }
      }

      async function loadApps() {
        try {
          var r = await fetch('/api/apps', { headers: authHeaders() });
          if (r.ok) {
            var list = await r.json();
            installedApps.value = list.map(function(a) { return { id: a.id, name: a.name, icon: a.icon || '' }; });
          }
        } catch (e) { console.error('Load apps error', e); }
      }

      function openNew() {
        editingId.value = null;
        form.name = '';
        form.datetime = '';
        form.repeat = '';
        form.actionType = 'notify';
        form.notifyTitle = '';
        form.notifyText = '';
        form.appId = '';
        form.webhookUrl = '';
        form.webhookMethod = 'POST';
        form.webhookBody = '';
        form.webhookHeaders = '';
        formError.value = '';
        showForm.value = true;
      }

      function openEdit(task) {
        editingId.value = task.id;
        form.name = task.name;
        form.datetime = task.datetime ? task.datetime.slice(0, 16) : '';
        form.repeat = task.repeat || '';
        form.actionType = task.actionType || 'notify';
        form.notifyTitle = (task.actionData && task.actionData.title) || '';
        form.notifyText = (task.actionData && task.actionData.text) || '';
        form.appId = (task.actionData && task.actionData.appId) || '';
        form.webhookUrl = (task.actionData && task.actionData.url) || '';
        form.webhookMethod = (task.actionData && task.actionData.method) || 'POST';
        form.webhookBody = (task.actionData && task.actionData.body) || '';
        form.webhookHeaders = (task.actionData && task.actionData.headers) ? JSON.stringify(task.actionData.headers) : '';
        formError.value = '';
        showForm.value = true;
      }

      function resetForm() {
        showForm.value = false;
        editingId.value = null;
        formError.value = '';
      }

      async function saveTask() {
        if (!form.name.trim()) { formError.value = L('nameRequired'); return; }
        if (!form.datetime) { formError.value = L('dateRequired'); return; }

        var actionData = {};
        if (form.actionType === 'notify') {
          actionData = { title: form.notifyTitle || form.name, text: form.notifyText || form.name };
        } else if (form.actionType === 'app') {
          actionData = { appId: form.appId };
        } else if (form.actionType === 'webhook') {
          if (!form.webhookUrl.trim()) { formError.value = L('webhookUrlRequired'); return; }
          actionData = {
            url: form.webhookUrl.trim(),
            method: form.webhookMethod || 'POST',
            body: form.webhookBody || '',
            headers: null
          };
          if (form.webhookHeaders.trim()) {
            try { actionData.headers = JSON.parse(form.webhookHeaders); } catch { actionData.headers = {}; }
          }
        }

        var body = {
          name: form.name.trim(),
          datetime: new Date(form.datetime).toISOString(),
          repeat: form.repeat,
          actionType: form.actionType,
          actionData: actionData
        };

        try {
          if (editingId.value) {
            await fetch('/api/scheduler/' + editingId.value, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) });
          } else {
            await fetch('/api/scheduler', { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
          }
          resetForm();
          await loadTasks();
        } catch (e) { console.error('Save scheduler error', e); }
      }

      async function deleteTask(id) {
        if (!confirm(L('deleteConfirm'))) return;
        try {
          await fetch('/api/scheduler/' + id, { method: 'DELETE', headers: authHeaders() });
          await loadTasks();
        } catch (e) { console.error('Delete scheduler error', e); }
      }

      async function toggleEnabled(task) {
        try {
          await fetch('/api/scheduler/' + task.id, {
            method: 'PUT', headers: authHeaders(),
            body: JSON.stringify({ enabled: !task.enabled })
          });
          await loadTasks();
        } catch (e) { console.error('Toggle error', e); }
      }

      async function runNow(task) {
        try {
          await fetch('/api/scheduler/' + task.id + '/run', { method: 'POST', headers: authHeaders() });
          await loadTasks();
        } catch (e) { console.error('Run now error', e); }
      }

      async function openHistory(task) {
        logTask.value = task;
        try {
          var r = await fetch('/api/scheduler/' + task.id + '/log', { headers: authHeaders() });
          if (r.ok) logEntries.value = await r.json();
          else logEntries.value = [];
        } catch { logEntries.value = []; }
        showLog.value = true;
      }

      function closeLog() { showLog.value = false; logTask.value = null; logEntries.value = []; }

      function formatDateTime(iso) {
        if (!iso) return '—';
        try {
          var d = new Date(iso);
          return d.toLocaleString(locale.value === 'tr' ? 'tr-TR' : locale.value === 'en' ? 'en-US' : locale.value, {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
          });
        } catch { return iso; }
      }

      function repeatLabel(task) {
        if (!task.repeat) return '';
        var opt = repeatOptions.value.find(function(o) { return o.value === task.repeat; });
        return opt ? opt.label : task.repeat;
      }

      function actionIcon(type) {
        if (type === 'notify') return '🔔';
        if (type === 'app') return '📂';
        if (type === 'webhook') return '🌐';
        return '❓';
      }

      function actionSummary(task) {
        if (task.actionType === 'notify') return (task.actionData && task.actionData.title) || task.name;
        if (task.actionType === 'app') {
          var app = installedApps.value.find(function(a) { return a.id === (task.actionData && task.actionData.appId); });
          return app ? (app.icon + ' ' + app.name) : (task.actionData && task.actionData.appId) || '';
        }
        if (task.actionType === 'webhook') return (task.actionData && task.actionData.method || 'POST') + ' ' + ((task.actionData && task.actionData.url) || '').slice(0, 40);
        return '';
      }

      var refreshTimer = null;
      onMounted(async function() {
        window.addEventListener('locale-changed', onLocaleChanged);
        await loadTasks();
        await loadApps();
        refreshTimer = setInterval(loadTasks, 30000);
      });
      onUnmounted(function() {
        window.removeEventListener('locale-changed', onLocaleChanged);
        if (refreshTimer) clearInterval(refreshTimer);
      });

      return {
        L: L, tasks: tasks, filter: filter, editingId: editingId, showForm: showForm,
        form: form, formError: formError, repeatOptions: repeatOptions, actionOptions: actionOptions,
        counts: counts, filteredTasks: filteredTasks, installedApps: installedApps,
        showLog: showLog, logTask: logTask, logEntries: logEntries,
        openNew: openNew, openEdit: openEdit, resetForm: resetForm, saveTask: saveTask,
        deleteTask: deleteTask, toggleEnabled: toggleEnabled, runNow: runNow,
        openHistory: openHistory, closeLog: closeLog,
        formatDateTime: formatDateTime, repeatLabel: repeatLabel, actionIcon: actionIcon, actionSummary: actionSummary
      };
    }
  };
})(Vue);
