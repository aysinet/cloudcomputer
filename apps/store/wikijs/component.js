(function(Vue) {
  const { ref, onMounted, computed, onUnmounted } = Vue;

  const APP_ID = 'wikijs';

  const LANGS = {
    tr: { running:'Çalışıyor', stopped:'Durdu', loading:'Yükleniyor...', restarting:'Yeniden başlatılıyor...', error:'Hata', restart:'Yeniden Başlat', refresh:'Yenile', tryAgain:'Tekrar Dene', serviceInfo:'Servis Bilgileri', container:'Container', port:'Port', pgHost:'PostgreSQL Host', database:'Veritabanı', start:'Başlat' },
    en: { running:'Running', stopped:'Stopped', loading:'Loading...', restarting:'Restarting...', error:'Error', restart:'Restart', refresh:'Refresh', tryAgain:'Try Again', serviceInfo:'Service Information', container:'Container', port:'Port', pgHost:'PostgreSQL Host', database:'Database', start:'Start' },
    de: { running:'Läuft', stopped:'Gestoppt', loading:'Laden...', restarting:'Neustart...', error:'Fehler', restart:'Neustart', refresh:'Aktualisieren', tryAgain:'Erneut versuchen', serviceInfo:'Dienstinformationen', container:'Container', port:'Port', pgHost:'PostgreSQL Host', database:'Datenbank', start:'Starten' },
    fr: { running:'En cours', stopped:'Arrêté', loading:'Chargement...', restarting:'Redémarrage...', error:'Erreur', restart:'Redémarrer', refresh:'Actualiser', tryAgain:'Réessayer', serviceInfo:'Informations du service', container:'Conteneur', port:'Port', pgHost:'Hôte PostgreSQL', database:'Base de données', start:'Démarrer' },
    es: { running:'Ejecutando', stopped:'Detenido', loading:'Cargando...', restarting:'Reiniciando...', error:'Error', restart:'Reiniciar', refresh:'Actualizar', tryAgain:'Reintentar', serviceInfo:'Información del servicio', container:'Contenedor', port:'Puerto', pgHost:'Host PostgreSQL', database:'Base de datos', start:'Iniciar' },
    ru: { running:'Работает', stopped:'Остановлен', loading:'Загрузка...', restarting:'Перезапуск...', error:'Ошибка', restart:'Перезапуск', refresh:'Обновить', tryAgain:'Повторить', serviceInfo:'Информация о сервисе', container:'Контейнер', port:'Порт', pgHost:'PostgreSQL хост', database:'База данных', start:'Запустить' },
    zh: { running:'运行中', stopped:'已停止', loading:'加载中...', restarting:'重启中...', error:'错误', restart:'重启', refresh:'刷新', tryAgain:'重试', serviceInfo:'服务信息', container:'容器', port:'端口', pgHost:'PostgreSQL主机', database:'数据库', start:'启动' },
    ja: { running:'実行中', stopped:'停止', loading:'読み込み中...', restarting:'再起動中...', error:'エラー', restart:'再起動', refresh:'更新', tryAgain:'再試行', serviceInfo:'サービス情報', container:'コンテナ', port:'ポート', pgHost:'PostgreSQLホスト', database:'データベース', start:'起動' },
    it: { running:'In esecuzione', stopped:'Arrestato', loading:'Caricamento...', restarting:'Riavvio...', error:'Errore', restart:'Riavvia', refresh:'Aggiorna', tryAgain:'Riprova', serviceInfo:'Informazioni servizio', container:'Container', port:'Porta', pgHost:'Host PostgreSQL', database:'Database', start:'Avvia' },
    ar: { running:'قيد التشغيل', stopped:'متوقف', loading:'جارٍ التحميل...', restarting:'إعادة التشغيل...', error:'خطأ', restart:'إعادة التشغيل', refresh:'تحديث', tryAgain:'إعادة المحاولة', serviceInfo:'معلومات الخدمة', container:'الحاوية', port:'المنفذ', pgHost:'مضيف PostgreSQL', database:'قاعدة البيانات', start:'بدء' },
    ko: { running:'실행 중', stopped:'중지됨', loading:'로딩 중...', restarting:'재시작 중...', error:'오류', restart:'재시작', refresh:'새로고침', tryAgain:'다시 시도', serviceInfo:'서비스 정보', container:'컨테이너', port:'포트', pgHost:'PostgreSQL 호스트', database:'데이터베이스', start:'시작' },
    hi: { running:'चल रहा है', stopped:'रुका हुआ', loading:'लोड हो रहा है...', restarting:'पुनरारंभ हो रहा...', error:'त्रुटि', restart:'पुनरारंभ', refresh:'ताज़ा करें', tryAgain:'पुनः प्रयास', serviceInfo:'सेवा जानकारी', container:'कंटेनर', port:'पोर्ट', pgHost:'PostgreSQL होस्ट', database:'डेटाबेस', start:'शुरू करें' },
    pt: { running:'Em execução', stopped:'Parado', loading:'Carregando...', restarting:'Reiniciando...', error:'Erro', restart:'Reiniciar', refresh:'Atualizar', tryAgain:'Tentar novamente', serviceInfo:'Informações do serviço', container:'Contêiner', port:'Porta', pgHost:'Host PostgreSQL', database:'Banco de dados', start:'Iniciar' }
  };

  return {
    setup() {
      function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }
      var locale = ref(getLocale());
      function t(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }
      const status = ref('loading');
      const serviceInfo = ref(null);
      const errorMsg = ref('');
      const iframeSrc = ref('');

      async function apiFetch(url, opts = {}) {
        const token = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith('token='));
        const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
        if (token) headers['Authorization'] = 'Bearer ' + token.split('=')[1];
        return fetch(url, { ...opts, headers });
      }

      async function loadStatus() {
        status.value = 'loading';
        try {
          const res = await apiFetch('/api/services/' + APP_ID);
          if (!res.ok) throw new Error('Service not found');
          serviceInfo.value = await res.json();
          if (serviceInfo.value.running) {
            iframeSrc.value = '/proxy/' + APP_ID + '/';
            status.value = 'running';
          } else {
            status.value = 'stopped';
          }
        } catch (e) {
          errorMsg.value = e.message;
          status.value = 'error';
        }
      }

      async function restart() {
        status.value = 'restarting';
        try {
          await apiFetch('/api/docker/stop', { method: 'POST', body: JSON.stringify({ appId: APP_ID }) });
          const cfgRes = await apiFetch('/api/services/' + APP_ID);
          const cfg = await cfgRes.json();
          const appRes = await apiFetch('/api/store');
          const apps = await appRes.json();
          const manifest = apps.find(a => a.id === APP_ID);
          if (!manifest || !manifest.docker) throw new Error('Manifest not found');

          const env = [...(manifest.docker.env || [])];
          if (cfg.installConfig) {
            for (const [key, val] of Object.entries(cfg.installConfig)) {
              env.push(key + '=' + val);
            }
          }

          const body = {
            image: manifest.docker.image,
            appId: APP_ID,
            containerPort: manifest.docker.containerPort || 3000,
            volumes: manifest.docker.volumes || [],
            env,
            restart: 'always'
          };

          await apiFetch('/api/docker/run', { method: 'POST', body: JSON.stringify(body) });
          await new Promise(r => setTimeout(r, 8000));
          await loadStatus();
        } catch (e) {
          errorMsg.value = e.message;
          status.value = 'error';
        }
      }

      const connInfo = computed(() => {
        if (!serviceInfo.value) return null;
        return {
          port: serviceInfo.value.port,
          containerName: serviceInfo.value.containerName,
          pgHost: serviceInfo.value.installConfig?.PG_HOST || '',
          pgDatabase: serviceInfo.value.installConfig?.PG_DATABASE || 'wikijs'
        };
      });

      onMounted(() => {
        loadStatus();
        window.addEventListener('locale-changed', onLocaleChanged);
      });
      onUnmounted(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
      });

      return { status, serviceInfo, errorMsg, connInfo, iframeSrc, loadStatus, restart, t };
    }
  };
})(Vue)
