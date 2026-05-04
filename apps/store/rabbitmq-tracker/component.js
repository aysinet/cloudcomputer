(function(Vue) {
  const { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } = Vue;

  const MAX_POINTS = 60;
  const CHART_COLORS = [
    '#ff9100','#00b894','#6c5ce7','#e17055','#00cec9',
    '#fdcb6e','#e84393','#0984e3','#d63031','#55efc4',
    '#a29bfe','#fab1a0','#81ecec','#ffeaa7','#fd79a8'
  ];

  const LANGS = {
    tr: {
      host:'Host', port:'Port', username:'Kullanıcı', password:'Şifre', vhost:'VHost',
      connect:'Bağlan', disconnect:'Bağlantıyı Kes', connecting:'Bağlanıyor',
      addServer:'Sunucu Ekle', editServer:'Sunucu Düzenle', serverName:'Sunucu Adı',
      serverNamePlaceholder:'Üretim Sunucusu', deleteServer:'Sunucuyu Sil',
      deleteConfirm:'Sunucu silinsin mi?', noServers:'Henüz sunucu eklenmedi',
      servers:'Sunucular', cancel:'İptal',
      queues:'kuyruk', overview:'Genel Bakış', chart:'Grafik',
      totalMessages:'Toplam Mesaj', totalQueues:'Toplam Kuyruk', consumers:'Tüketiciler',
      publishRate:'Yayın Hızı', topQueues:'En Yoğun Kuyruklar',
      searchQueues:'Kuyruk ara...', queueName:'Kuyruk Adı', messages:'Mesajlar',
      ready:'Hazır', unacked:'Onaysız', state:'Durum', alert:'Alarm',
      noQueues:'Kuyruk bulunamadı', allQueues:'Tümü', setAlert:'Alarm Kur',
      alerts:'Alarmlar', globalAlert:'Genel Alarm', globalAlertActive:'Genel alarm aktif',
      queueAlerts:'Kuyruk Alarmları', selectQueue:'Kuyruk Seçin', limit:'Limit',
      limitPlaceholder:'Mesaj limiti', save:'Kaydet', add:'Ekle', remove:'Kaldır',
      noAlerts:'Alarm yok', pause:'Duraklat', resume:'Devam Et',
      connectHint:'RabbitMQ sunucunuza bağlanarak kuyrukları izlemeye başlayın',
      alertTriggered:'Alarm: {queue} kuyruğunda {count} mesaj (limit: {limit})',
      globalAlertTriggered:'Genel alarm: Toplam {count} mesaj (limit: {limit})'
    },
    en: {
      host:'Host', port:'Port', username:'Username', password:'Password', vhost:'VHost',
      connect:'Connect', disconnect:'Disconnect', connecting:'Connecting',
      addServer:'Add Server', editServer:'Edit Server', serverName:'Server Name',
      serverNamePlaceholder:'Production Server', deleteServer:'Delete Server',
      deleteConfirm:'Delete this server?', noServers:'No servers added yet',
      servers:'Servers', cancel:'Cancel',
      queues:'queues', overview:'Overview', chart:'Chart',
      totalMessages:'Total Messages', totalQueues:'Total Queues', consumers:'Consumers',
      publishRate:'Publish Rate', topQueues:'Top Queues',
      searchQueues:'Search queues...', queueName:'Queue Name', messages:'Messages',
      ready:'Ready', unacked:'Unacked', state:'State', alert:'Alert',
      noQueues:'No queues found', allQueues:'All', setAlert:'Set Alert',
      alerts:'Alerts', globalAlert:'Global Alert', globalAlertActive:'Global alert active',
      queueAlerts:'Queue Alerts', selectQueue:'Select Queue', limit:'Limit',
      limitPlaceholder:'Message limit', save:'Save', add:'Add', remove:'Remove',
      noAlerts:'No alerts', pause:'Pause', resume:'Resume',
      connectHint:'Connect to your RabbitMQ server to start monitoring queues',
      alertTriggered:'Alert: {count} messages in queue {queue} (limit: {limit})',
      globalAlertTriggered:'Global alert: Total {count} messages (limit: {limit})'
    },
    de: {
      host:'Host', port:'Port', username:'Benutzer', password:'Passwort', vhost:'VHost',
      connect:'Verbinden', disconnect:'Trennen', connecting:'Verbinde',
      addServer:'Server hinzufügen', editServer:'Server bearbeiten', serverName:'Servername',
      serverNamePlaceholder:'Produktionsserver', deleteServer:'Server löschen',
      deleteConfirm:'Server löschen?', noServers:'Noch keine Server hinzugefügt',
      servers:'Server', cancel:'Abbrechen',
      queues:'Warteschlangen', overview:'Übersicht', chart:'Diagramm',
      totalMessages:'Nachrichten gesamt', totalQueues:'Warteschlangen', consumers:'Verbraucher',
      publishRate:'Veröffentlichungsrate', topQueues:'Top Warteschlangen',
      searchQueues:'Warteschlange suchen...', queueName:'Name', messages:'Nachrichten',
      ready:'Bereit', unacked:'Unbestätigt', state:'Status', alert:'Alarm',
      noQueues:'Keine Warteschlangen', allQueues:'Alle', setAlert:'Alarm setzen',
      alerts:'Alarme', globalAlert:'Globaler Alarm', globalAlertActive:'Globaler Alarm aktiv',
      queueAlerts:'Warteschlangen-Alarme', selectQueue:'Warteschlange wählen', limit:'Limit',
      limitPlaceholder:'Nachrichtenlimit', save:'Speichern', add:'Hinzufügen', remove:'Entfernen',
      noAlerts:'Keine Alarme', pause:'Pause', resume:'Fortsetzen',
      connectHint:'Verbinden Sie sich mit Ihrem RabbitMQ-Server',
      alertTriggered:'Alarm: {count} Nachrichten in {queue} (Limit: {limit})',
      globalAlertTriggered:'Globaler Alarm: {count} Nachrichten gesamt (Limit: {limit})'
    },
    fr: {
      host:'Hôte', port:'Port', username:'Utilisateur', password:'Mot de passe', vhost:'VHost',
      connect:'Connecter', disconnect:'Déconnecter', connecting:'Connexion',
      addServer:'Ajouter serveur', editServer:'Modifier serveur', serverName:'Nom du serveur',
      serverNamePlaceholder:'Serveur production', deleteServer:'Supprimer serveur',
      deleteConfirm:'Supprimer ce serveur?', noServers:'Aucun serveur ajouté',
      servers:'Serveurs', cancel:'Annuler',
      queues:'files', overview:'Aperçu', chart:'Graphique',
      totalMessages:'Messages totaux', totalQueues:'Files totales', consumers:'Consommateurs',
      publishRate:'Taux pub.', topQueues:'Top Files',
      searchQueues:'Chercher...', queueName:'Nom', messages:'Messages',
      ready:'Prêts', unacked:'Non confirmés', state:'État', alert:'Alerte',
      noQueues:'Aucune file', allQueues:'Toutes', setAlert:'Définir alerte',
      alerts:'Alertes', globalAlert:'Alerte globale', globalAlertActive:'Alerte globale active',
      queueAlerts:'Alertes par file', selectQueue:'Sélectionner', limit:'Limite',
      limitPlaceholder:'Limite messages', save:'Enregistrer', add:'Ajouter', remove:'Supprimer',
      noAlerts:'Aucune alerte', pause:'Pause', resume:'Reprendre',
      connectHint:'Connectez-vous à votre serveur RabbitMQ',
      alertTriggered:'Alerte: {count} messages dans {queue} (limite: {limit})',
      globalAlertTriggered:'Alerte globale: {count} messages (limite: {limit})'
    },
    es: {
      host:'Host', port:'Puerto', username:'Usuario', password:'Contraseña', vhost:'VHost',
      connect:'Conectar', disconnect:'Desconectar', connecting:'Conectando',
      addServer:'Agregar servidor', editServer:'Editar servidor', serverName:'Nombre del servidor',
      serverNamePlaceholder:'Servidor producción', deleteServer:'Eliminar servidor',
      deleteConfirm:'¿Eliminar este servidor?', noServers:'No hay servidores',
      servers:'Servidores', cancel:'Cancelar',
      queues:'colas', overview:'Resumen', chart:'Gráfico',
      totalMessages:'Mensajes totales', totalQueues:'Colas totales', consumers:'Consumidores',
      publishRate:'Tasa pub.', topQueues:'Top Colas',
      searchQueues:'Buscar...', queueName:'Nombre', messages:'Mensajes',
      ready:'Listos', unacked:'Sin confirmar', state:'Estado', alert:'Alerta',
      noQueues:'Sin colas', allQueues:'Todas', setAlert:'Configurar alerta',
      alerts:'Alertas', globalAlert:'Alerta global', globalAlertActive:'Alerta global activa',
      queueAlerts:'Alertas por cola', selectQueue:'Seleccionar', limit:'Límite',
      limitPlaceholder:'Límite mensajes', save:'Guardar', add:'Agregar', remove:'Eliminar',
      noAlerts:'Sin alertas', pause:'Pausar', resume:'Reanudar',
      connectHint:'Conéctese a su servidor RabbitMQ',
      alertTriggered:'Alerta: {count} mensajes en {queue} (límite: {limit})',
      globalAlertTriggered:'Alerta global: {count} mensajes (límite: {limit})'
    },
    ru: {
      host:'Хост', port:'Порт', username:'Пользователь', password:'Пароль', vhost:'VHost',
      connect:'Подключить', disconnect:'Отключить', connecting:'Подключение',
      addServer:'Добавить сервер', editServer:'Изменить сервер', serverName:'Имя сервера',
      serverNamePlaceholder:'Рабочий сервер', deleteServer:'Удалить сервер',
      deleteConfirm:'Удалить сервер?', noServers:'Серверы не добавлены',
      servers:'Серверы', cancel:'Отмена',
      queues:'очередей', overview:'Обзор', chart:'График',
      totalMessages:'Всего сообщений', totalQueues:'Всего очередей', consumers:'Потребители',
      publishRate:'Скорость', topQueues:'Топ очереди',
      searchQueues:'Поиск...', queueName:'Имя', messages:'Сообщения',
      ready:'Готово', unacked:'Без подтв.', state:'Состояние', alert:'Оповещение',
      noQueues:'Нет очередей', allQueues:'Все', setAlert:'Установить',
      alerts:'Оповещения', globalAlert:'Глобальное', globalAlertActive:'Глобальное оповещение',
      queueAlerts:'По очередям', selectQueue:'Выбрать', limit:'Лимит',
      limitPlaceholder:'Лимит сообщений', save:'Сохранить', add:'Добавить', remove:'Удалить',
      noAlerts:'Нет оповещений', pause:'Пауза', resume:'Продолжить',
      connectHint:'Подключитесь к серверу RabbitMQ',
      alertTriggered:'Оповещение: {count} сообщений в {queue} (лимит: {limit})',
      globalAlertTriggered:'Глобальное: {count} сообщений (лимит: {limit})'
    },
    zh: {
      host:'主机', port:'端口', username:'用户名', password:'密码', vhost:'VHost',
      connect:'连接', disconnect:'断开', connecting:'连接中',
      addServer:'添加服务器', editServer:'编辑服务器', serverName:'服务器名称',
      serverNamePlaceholder:'生产服务器', deleteServer:'删除服务器',
      deleteConfirm:'删除此服务器？', noServers:'尚未添加服务器',
      servers:'服务器', cancel:'取消',
      queues:'队列', overview:'概览', chart:'图表',
      totalMessages:'总消息数', totalQueues:'总队列数', consumers:'消费者',
      publishRate:'发布速率', topQueues:'热门队列',
      searchQueues:'搜索队列...', queueName:'队列名', messages:'消息',
      ready:'就绪', unacked:'未确认', state:'状态', alert:'警报',
      noQueues:'无队列', allQueues:'全部', setAlert:'设置警报',
      alerts:'警报', globalAlert:'全局警报', globalAlertActive:'全局警报已启用',
      queueAlerts:'队列警报', selectQueue:'选择队列', limit:'限制',
      limitPlaceholder:'消息限制', save:'保存', add:'添加', remove:'移除',
      noAlerts:'无警报', pause:'暂停', resume:'继续',
      connectHint:'连接到您的RabbitMQ服务器以开始监控',
      alertTriggered:'警报: {queue} 中有 {count} 条消息 (限制: {limit})',
      globalAlertTriggered:'全局警报: 共 {count} 条消息 (限制: {limit})'
    },
    ja: {
      host:'ホスト', port:'ポート', username:'ユーザー名', password:'パスワード', vhost:'VHost',
      connect:'接続', disconnect:'切断', connecting:'接続中',
      addServer:'サーバー追加', editServer:'サーバー編集', serverName:'サーバー名',
      serverNamePlaceholder:'本番サーバー', deleteServer:'サーバー削除',
      deleteConfirm:'サーバーを削除しますか？', noServers:'サーバーが追加されていません',
      servers:'サーバー', cancel:'キャンセル',
      queues:'キュー', overview:'概要', chart:'チャート',
      totalMessages:'総メッセージ数', totalQueues:'総キュー数', consumers:'コンシューマー',
      publishRate:'発行レート', topQueues:'上位キュー',
      searchQueues:'キュー検索...', queueName:'キュー名', messages:'メッセージ',
      ready:'準備済', unacked:'未確認', state:'状態', alert:'アラート',
      noQueues:'キューなし', allQueues:'全て', setAlert:'アラート設定',
      alerts:'アラート', globalAlert:'グローバルアラート', globalAlertActive:'グローバルアラート有効',
      queueAlerts:'キューアラート', selectQueue:'キュー選択', limit:'制限',
      limitPlaceholder:'メッセージ制限', save:'保存', add:'追加', remove:'削除',
      noAlerts:'アラートなし', pause:'一時停止', resume:'再開',
      connectHint:'RabbitMQサーバーに接続してモニタリングを開始',
      alertTriggered:'アラート: {queue} に {count} メッセージ (制限: {limit})',
      globalAlertTriggered:'グローバルアラート: 合計 {count} メッセージ (制限: {limit})'
    },
    it: {
      host:'Host', port:'Porta', username:'Utente', password:'Password', vhost:'VHost',
      connect:'Connetti', disconnect:'Disconnetti', connecting:'Connessione',
      addServer:'Aggiungi server', editServer:'Modifica server', serverName:'Nome server',
      serverNamePlaceholder:'Server produzione', deleteServer:'Elimina server',
      deleteConfirm:'Eliminare il server?', noServers:'Nessun server aggiunto',
      servers:'Server', cancel:'Annulla',
      queues:'code', overview:'Panoramica', chart:'Grafico',
      totalMessages:'Messaggi totali', totalQueues:'Code totali', consumers:'Consumatori',
      publishRate:'Tasso pub.', topQueues:'Top Code',
      searchQueues:'Cerca...', queueName:'Nome', messages:'Messaggi',
      ready:'Pronti', unacked:'Non confermati', state:'Stato', alert:'Avviso',
      noQueues:'Nessuna coda', allQueues:'Tutte', setAlert:'Imposta avviso',
      alerts:'Avvisi', globalAlert:'Avviso globale', globalAlertActive:'Avviso globale attivo',
      queueAlerts:'Avvisi per coda', selectQueue:'Seleziona', limit:'Limite',
      limitPlaceholder:'Limite messaggi', save:'Salva', add:'Aggiungi', remove:'Rimuovi',
      noAlerts:'Nessun avviso', pause:'Pausa', resume:'Riprendi',
      connectHint:'Connettiti al tuo server RabbitMQ',
      alertTriggered:'Avviso: {count} messaggi in {queue} (limite: {limit})',
      globalAlertTriggered:'Avviso globale: {count} messaggi (limite: {limit})'
    },
    ar: {
      host:'المضيف', port:'المنفذ', username:'المستخدم', password:'كلمة المرور', vhost:'VHost',
      connect:'اتصال', disconnect:'قطع', connecting:'جاري الاتصال',
      addServer:'إضافة خادم', editServer:'تعديل خادم', serverName:'اسم الخادم',
      serverNamePlaceholder:'خادم الإنتاج', deleteServer:'حذف الخادم',
      deleteConfirm:'هل تريد حذف هذا الخادم؟', noServers:'لم تتم إضافة خوادم بعد',
      servers:'الخوادم', cancel:'إلغاء',
      queues:'طوابير', overview:'نظرة عامة', chart:'رسم بياني',
      totalMessages:'إجمالي الرسائل', totalQueues:'إجمالي الطوابير', consumers:'المستهلكون',
      publishRate:'معدل النشر', topQueues:'أعلى الطوابير',
      searchQueues:'بحث...', queueName:'الاسم', messages:'الرسائل',
      ready:'جاهز', unacked:'غير مؤكد', state:'الحالة', alert:'تنبيه',
      noQueues:'لا توجد طوابير', allQueues:'الكل', setAlert:'تعيين تنبيه',
      alerts:'التنبيهات', globalAlert:'تنبيه عام', globalAlertActive:'التنبيه العام نشط',
      queueAlerts:'تنبيهات الطابور', selectQueue:'اختر', limit:'الحد',
      limitPlaceholder:'حد الرسائل', save:'حفظ', add:'إضافة', remove:'إزالة',
      noAlerts:'لا تنبيهات', pause:'إيقاف', resume:'استئناف',
      connectHint:'اتصل بخادم RabbitMQ الخاص بك',
      alertTriggered:'تنبيه: {count} رسالة في {queue} (الحد: {limit})',
      globalAlertTriggered:'تنبيه عام: {count} رسالة إجمالي (الحد: {limit})'
    }
  };

  LANGS.ko = { ...LANGS.en };
  LANGS.hi = { ...LANGS.en };
  LANGS.pt = { ...LANGS.en };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  return {
    setup() {
      var locale = ref(getLocale());
      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }
      function t(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      // ── Server list ──
      var servers = ref([]);
      var activeServerId = ref('');
      var showServerDialog = ref(false);
      var editingServer = ref(null);
      var serverForm = reactive({ name: '', host: 'localhost', port: 15672, user: 'guest', pass: 'guest', vhost: '/' });

      // ── Connection state ──
      var connected = ref(false);
      var loading = ref(false);
      var errorMsg = ref('');

      // ── Data state ──
      var queues = ref([]);
      var activeTab = ref('overview');
      var searchQuery = ref('');
      var sortField = ref('messages');
      var sortDir = ref('desc');
      var paused = ref(false);
      var pollInterval = ref(5000);
      var pollTimer = null;
      var prevTotalMessages = ref(0);
      var publishRate = ref(0);
      var lastPollTime = ref(0);

      // ── History for charts ──
      var totalHistory = ref([]);
      var queueHistory = reactive({});

      // ── Alert state ──
      var alertRules = ref([]);
      var globalAlert = ref(null);
      var globalAlertLimit = ref(0);
      var showAlertPanel = ref(false);
      var newAlertQueue = ref('');
      var newAlertLimit = ref(0);
      var alertDialogQueue = ref('');
      var alertDialogLimit = ref(0);
      var firedAlerts = reactive({});

      // ── Chart state ──
      var selectedQueuesForChart = ref([]);
      var overviewCanvas = ref(null);
      var chartCanvas = ref(null);

      // ── Computed ──
      var totalMessages = computed(function() {
        return queues.value.reduce(function(s, q) { return s + (q.messages || 0); }, 0);
      });
      var totalConsumers = computed(function() {
        return queues.value.reduce(function(s, q) { return s + (q.consumers || 0); }, 0);
      });
      var filteredQueues = computed(function() {
        if (!searchQuery.value) return queues.value;
        var q = searchQuery.value.toLowerCase();
        return queues.value.filter(function(item) { return item.name.toLowerCase().includes(q); });
      });
      var sortedQueues = computed(function() {
        var list = filteredQueues.value.slice();
        var field = sortField.value;
        var dir = sortDir.value === 'asc' ? 1 : -1;
        list.sort(function(a, b) {
          var va = a[field], vb = b[field];
          if (typeof va === 'string') return va.localeCompare(vb) * dir;
          return ((va || 0) - (vb || 0)) * dir;
        });
        return list;
      });
      var topQueues = computed(function() {
        return queues.value.slice().sort(function(a, b) { return (b.messages || 0) - (a.messages || 0); }).slice(0, 8);
      });
      var chartLegend = computed(function() {
        var names = selectedQueuesForChart.value.length > 0
          ? selectedQueuesForChart.value
          : queues.value.map(function(q) { return q.name; }).slice(0, 10);
        return names.map(function(n, i) { return { name: n, color: CHART_COLORS[i % CHART_COLORS.length] }; });
      });

      // ── API helpers ──
      function getToken() { return localStorage.getItem('token') || ''; }
      function authHeaders() { return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() }; }

      function activeServer() {
        return servers.value.find(function(s) { return s.id === activeServerId.value; }) || null;
      }

      async function rmqFetch(path) {
        var srv = activeServer();
        if (!srv) throw new Error('No server selected');
        var vhost = srv.vhost === '/' ? '%2F' : encodeURIComponent(srv.vhost);
        var apiPath = path.replace('{vhost}', vhost);
        var res = await fetch('/api/rabbitmq/proxy', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            host: srv.host,
            port: Number(srv.port),
            user: srv.user,
            pass: srv.pass,
            path: apiPath
          })
        });
        if (!res.ok) {
          var err = await res.json().catch(function() { return {}; });
          throw new Error(err.error || 'HTTP ' + res.status);
        }
        return res.json();
      }

      // ── Server CRUD ──
      async function loadServers() {
        try {
          var res = await fetch('/api/rabbitmq/servers', { headers: authHeaders() });
          if (res.ok) servers.value = await res.json();
        } catch (e) { /* ignore */ }
      }

      function openAddServer() {
        editingServer.value = null;
        serverForm.name = ''; serverForm.host = 'localhost'; serverForm.port = 15672;
        serverForm.user = 'guest'; serverForm.pass = 'guest'; serverForm.vhost = '/';
        showServerDialog.value = true;
      }

      function openEditServer(srv) {
        editingServer.value = srv;
        serverForm.name = srv.name; serverForm.host = srv.host; serverForm.port = srv.port;
        serverForm.user = srv.user; serverForm.pass = srv.pass; serverForm.vhost = srv.vhost;
        showServerDialog.value = true;
      }

      async function saveServer() {
        if (!serverForm.name || !serverForm.host || !serverForm.port) return;
        try {
          if (editingServer.value) {
            await fetch('/api/rabbitmq/servers/' + editingServer.value.id, {
              method: 'PUT', headers: authHeaders(),
              body: JSON.stringify(serverForm)
            });
          } else {
            await fetch('/api/rabbitmq/servers', {
              method: 'POST', headers: authHeaders(),
              body: JSON.stringify(serverForm)
            });
          }
          showServerDialog.value = false;
          await loadServers();
        } catch (e) { errorMsg.value = e.message; }
      }

      async function deleteServer(srv) {
        if (!confirm(t('deleteConfirm'))) return;
        if (activeServerId.value === srv.id) disconnect();
        try {
          await fetch('/api/rabbitmq/servers/' + srv.id, {
            method: 'DELETE', headers: authHeaders()
          });
          await loadServers();
        } catch (e) { errorMsg.value = e.message; }
      }

      async function saveServerAlerts() {
        var srv = activeServer();
        if (!srv) return;
        try {
          await fetch('/api/rabbitmq/servers/' + srv.id, {
            method: 'PUT', headers: authHeaders(),
            body: JSON.stringify({ alerts: srv.alerts })
          });
        } catch (e) { /* ignore */ }
      }

      // ── Connect / Disconnect ──
      async function connectToServer(srv) {
        activeServerId.value = srv.id;
        loading.value = true;
        errorMsg.value = '';
        try {
          await rmqFetch('/api/overview');
          connected.value = true;
          loadAlertsFromServer(srv);
          await fetchQueues();
          startPolling();
        } catch (e) {
          errorMsg.value = e.message;
          activeServerId.value = '';
        } finally {
          loading.value = false;
        }
      }

      function disconnect() {
        connected.value = false;
        activeServerId.value = '';
        stopPolling();
        queues.value = [];
        totalHistory.value = [];
        Object.keys(queueHistory).forEach(function(k) { delete queueHistory[k]; });
        prevTotalMessages.value = 0;
        publishRate.value = 0;
        firedAlerts = {};
      }

      // ── Polling ──
      function startPolling() {
        stopPolling();
        pollTimer = setInterval(function() {
          if (!paused.value && connected.value) fetchQueues();
        }, pollInterval.value);
      }

      function stopPolling() {
        if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
      }

      function setPollInterval(val) {
        pollInterval.value = val;
        if (connected.value) startPolling();
      }

      function togglePause() { paused.value = !paused.value; }

      // ── Fetch queue data ──
      async function fetchQueues() {
        try {
          var data = await rmqFetch('/api/queues/{vhost}');
          var now = Date.now();
          var newQueues = data.map(function(q) {
            return {
              name: q.name,
              messages: q.messages || 0,
              messages_ready: q.messages_ready || 0,
              messages_unacknowledged: q.messages_unacknowledged || 0,
              consumers: q.consumers || 0,
              state: q.state || 'idle',
              message_stats: q.message_stats || {}
            };
          });
          queues.value = newQueues;

          // Calculate publish rate
          var total = totalMessages.value;
          if (lastPollTime.value > 0 && prevTotalMessages.value > 0) {
            var dt = (now - lastPollTime.value) / 1000;
            if (dt > 0) publishRate.value = Math.max(0, (total - prevTotalMessages.value) / dt);
          }
          prevTotalMessages.value = total;
          lastPollTime.value = now;

          // Update history
          totalHistory.value.push(total);
          if (totalHistory.value.length > MAX_POINTS) totalHistory.value.shift();

          newQueues.forEach(function(q) {
            if (!queueHistory[q.name]) queueHistory[q.name] = [];
            queueHistory[q.name].push(q.messages);
            if (queueHistory[q.name].length > MAX_POINTS) queueHistory[q.name].shift();
          });

          // Draw graphs
          nextTick(function() { drawOverviewGraph(); drawDetailChart(); });

          // Check alerts
          checkAlerts();
          errorMsg.value = '';
        } catch (e) {
          errorMsg.value = e.message;
        }
      }

      // ── Sorting ──
      function sortBy(field) {
        if (sortField.value === field) {
          sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
        } else {
          sortField.value = field;
          sortDir.value = field === 'name' ? 'asc' : 'desc';
        }
      }

      // ── Alert management ──
      function setGlobalAlert() {
        if (globalAlertLimit.value > 0) {
          globalAlert.value = { limit: globalAlertLimit.value };
          firedAlerts['__global__'] = false;
          syncAlertsToServer();
        }
      }
      function removeGlobalAlert() {
        globalAlert.value = null;
        globalAlertLimit.value = 0;
        delete firedAlerts['__global__'];
        syncAlertsToServer();
      }
      function addQueueAlert() {
        if (!newAlertQueue.value || !newAlertLimit.value) return;
        var existing = alertRules.value.findIndex(function(r) { return r.queue === newAlertQueue.value; });
        if (existing >= 0) {
          alertRules.value[existing].limit = newAlertLimit.value;
        } else {
          alertRules.value.push({ queue: newAlertQueue.value, limit: newAlertLimit.value });
        }
        firedAlerts[newAlertQueue.value] = false;
        newAlertQueue.value = '';
        newAlertLimit.value = 0;
        syncAlertsToServer();
      }
      function removeAlert(queueName) {
        alertRules.value = alertRules.value.filter(function(r) { return r.queue !== queueName; });
        delete firedAlerts[queueName];
        syncAlertsToServer();
      }
      function getAlertForQueue(queueName) {
        return alertRules.value.find(function(r) { return r.queue === queueName; }) || null;
      }
      function isOverLimit(queueName, messages) {
        var rule = getAlertForQueue(queueName);
        if (rule && messages >= rule.limit) return true;
        if (globalAlert.value && messages >= globalAlert.value.limit) return true;
        return false;
      }
      function openAlertForQueue(queueName) {
        alertDialogQueue.value = queueName;
        var existing = getAlertForQueue(queueName);
        alertDialogLimit.value = existing ? existing.limit : 0;
      }
      function saveAlertDialog() {
        if (!alertDialogQueue.value || !alertDialogLimit.value) return;
        var existing = alertRules.value.findIndex(function(r) { return r.queue === alertDialogQueue.value; });
        if (existing >= 0) {
          alertRules.value[existing].limit = alertDialogLimit.value;
        } else {
          alertRules.value.push({ queue: alertDialogQueue.value, limit: alertDialogLimit.value });
        }
        firedAlerts[alertDialogQueue.value] = false;
        alertDialogQueue.value = '';
        syncAlertsToServer();
      }

      function syncAlertsToServer() {
        var srv = activeServer();
        if (!srv) return;
        srv.alerts = {
          global: globalAlert.value,
          queues: alertRules.value.slice()
        };
        saveServerAlerts();
      }

      function loadAlertsFromServer(srv) {
        if (!srv || !srv.alerts) return;
        if (srv.alerts.global) {
          globalAlert.value = srv.alerts.global;
          globalAlertLimit.value = srv.alerts.global.limit || 0;
        } else {
          globalAlert.value = null;
          globalAlertLimit.value = 0;
        }
        alertRules.value = (srv.alerts.queues || []).slice();
      }

      // ── Check alerts & send notifications ──
      function checkAlerts() {
        // Per-queue alerts
        alertRules.value.forEach(function(rule) {
          var q = queues.value.find(function(x) { return x.name === rule.queue; });
          if (!q) return;
          if (q.messages >= rule.limit) {
            if (!firedAlerts[rule.queue]) {
              firedAlerts[rule.queue] = true;
              sendNotification(
                t('alertTriggered').replace('{queue}', rule.queue).replace('{count}', q.messages).replace('{limit}', rule.limit),
                rule.queue
              );
            }
          } else {
            firedAlerts[rule.queue] = false;
          }
        });
        // Global alert
        if (globalAlert.value) {
          var total = totalMessages.value;
          if (total >= globalAlert.value.limit) {
            if (!firedAlerts['__global__']) {
              firedAlerts['__global__'] = true;
              sendNotification(
                t('globalAlertTriggered').replace('{count}', total).replace('{limit}', globalAlert.value.limit),
                '__global__'
              );
            }
          } else {
            firedAlerts['__global__'] = false;
          }
        }
      }

      async function sendNotification(text, key) {
        try {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + getToken()
            },
            body: JSON.stringify({
              title: '🐰 RabbitMQ Alert',
              text: text,
              icon: '🐰',
              bg: '#fff3e0'
            })
          });
        } catch (e) { /* ignore */ }
      }

      // ── Canvas Drawing ──
      function drawOverviewGraph() {
        var canvas = overviewCanvas.value;
        if (!canvas) return;
        var data = totalHistory.value;
        drawLineGraph(canvas, [{ data: data, color: '#ff9100' }], 'Total');
      }

      function drawDetailChart() {
        var canvas = chartCanvas.value;
        if (!canvas) return;
        var names = selectedQueuesForChart.value.length > 0
          ? selectedQueuesForChart.value
          : queues.value.map(function(q) { return q.name; }).slice(0, 10);
        var series = names.map(function(name, i) {
          return { data: queueHistory[name] || [], color: CHART_COLORS[i % CHART_COLORS.length] };
        });
        drawLineGraph(canvas, series, '');
      }

      function drawLineGraph(canvas, seriesArray, label) {
        var ctx = canvas.getContext('2d');
        var dpr = window.devicePixelRatio || 1;
        var w = canvas.width = canvas.offsetWidth * dpr;
        var h = canvas.height = canvas.offsetHeight * dpr;
        ctx.clearRect(0, 0, w, h);

        // Find max value across all series
        var maxVal = 10;
        seriesArray.forEach(function(s) {
          s.data.forEach(function(v) { if (v > maxVal) maxVal = v; });
        });
        maxVal = Math.ceil(maxVal * 1.15);

        // Grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        for (var g = 1; g <= 4; g++) {
          var gy = (h / 5) * g;
          ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
        }

        // Y-axis labels
        ctx.font = (10 * dpr) + 'px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.textAlign = 'right';
        for (var l = 0; l <= 4; l++) {
          var yLabel = (h / 5) * (5 - l);
          var valLabel = Math.round((maxVal / 5) * l);
          ctx.fillText(formatNum(valLabel), w - 4 * dpr, yLabel + 3 * dpr);
        }

        // Draw each series
        seriesArray.forEach(function(series) {
          var data = series.data;
          if (data.length < 2) return;
          var step = w / (MAX_POINTS - 1);
          var startIdx = Math.max(0, data.length - MAX_POINTS);

          // Fill area
          ctx.beginPath();
          ctx.moveTo(0, h);
          for (var j = startIdx; j < data.length; j++) {
            var x = (j - startIdx) * step;
            var val = Math.min(data[j], maxVal);
            var y = h - (val / maxVal) * h;
            ctx.lineTo(x, y);
          }
          ctx.lineTo((data.length - 1 - startIdx) * step, h);
          ctx.closePath();
          ctx.fillStyle = series.color.replace(')', ',0.1)').replace('rgb', 'rgba');
          if (series.color.startsWith('#')) {
            var r = parseInt(series.color.slice(1, 3), 16);
            var gv = parseInt(series.color.slice(3, 5), 16);
            var b = parseInt(series.color.slice(5, 7), 16);
            ctx.fillStyle = 'rgba(' + r + ',' + gv + ',' + b + ',0.12)';
          }
          ctx.fill();

          // Line
          ctx.beginPath();
          for (var k = startIdx; k < data.length; k++) {
            var xx = (k - startIdx) * step;
            var val2 = Math.min(data[k], maxVal);
            var yy = h - (val2 / maxVal) * h;
            if (k === startIdx) ctx.moveTo(xx, yy);
            else ctx.lineTo(xx, yy);
          }
          ctx.strokeStyle = series.color;
          ctx.lineWidth = 2 * dpr;
          ctx.lineJoin = 'round';
          ctx.stroke();
        });

        // Current value label for single series
        if (seriesArray.length === 1 && seriesArray[0].data.length > 0) {
          var lastVal = seriesArray[0].data[seriesArray[0].data.length - 1];
          ctx.font = 'bold ' + (12 * dpr) + 'px sans-serif';
          ctx.fillStyle = seriesArray[0].color;
          ctx.textAlign = 'left';
          ctx.fillText(formatNum(lastVal), 6 * dpr, 16 * dpr);
        }

        // Label
        if (label) {
          ctx.font = (10 * dpr) + 'px sans-serif';
          ctx.fillStyle = 'rgba(255,255,255,0.35)';
          ctx.textAlign = 'left';
          ctx.fillText(label, 6 * dpr, h - 6 * dpr);
        }
      }

      function redrawCharts() {
        nextTick(function() { drawOverviewGraph(); drawDetailChart(); });
      }

      // ── Queue chart toggle ──
      function toggleChartQueue(name) {
        var idx = selectedQueuesForChart.value.indexOf(name);
        if (idx >= 0) selectedQueuesForChart.value.splice(idx, 1);
        else selectedQueuesForChart.value.push(name);
        redrawCharts();
      }

      // ── Helpers ──
      function formatNum(n) {
        if (n == null) return '0';
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return String(n);
      }

      // ── Lifecycle ──
      onMounted(function() {
        window.addEventListener('locale-changed', onLocaleChanged);
        loadServers();
      });

      onUnmounted(function() {
        stopPolling();
        window.removeEventListener('locale-changed', onLocaleChanged);
      });

      return {
        // Servers
        servers, activeServerId, showServerDialog, editingServer, serverForm,
        loadServers, openAddServer, openEditServer, saveServer, deleteServer,
        connectToServer, activeServer,
        // Connection
        connected, loading, errorMsg,
        disconnect,
        // Data
        queues, activeTab, searchQuery, sortField, sortDir,
        paused, pollInterval, publishRate,
        // Computed
        totalMessages, totalConsumers, filteredQueues, sortedQueues, topQueues, chartLegend,
        // Methods
        setPollInterval, togglePause, sortBy, formatNum, redrawCharts, toggleChartQueue,
        // Canvas refs
        overviewCanvas, chartCanvas,
        // Alert state
        alertRules, globalAlert, globalAlertLimit, showAlertPanel,
        newAlertQueue, newAlertLimit,
        alertDialogQueue, alertDialogLimit,
        // Alert methods
        setGlobalAlert, removeGlobalAlert, addQueueAlert, removeAlert,
        getAlertForQueue, isOverLimit, openAlertForQueue, saveAlertDialog,
        // i18n
        t
      };
    }
  };
})(Vue);
