(function(Vue) {
  const { ref, computed, onMounted, onUnmounted } = Vue;

  const APP_ID = 'litellm';

  const LANGS = {
    tr: { checking: 'LiteLLM durumu kontrol ediliyor...', restarting: 'LiteLLM yeniden başlatılıyor...', error: 'Bir hata oluştu', retry: 'Tekrar Dene', restartTip: 'Yeniden Başlat', stopTip: 'Durdur', stopped: 'LiteLLM durduruldu', stoppedSub: 'Servisi yeniden başlatmak için aşağıdaki butona tıklayın', start: 'Başlat', desc: '100+ LLM API\'yi OpenAI formatında kullanabileceğiniz proxy sunucusu' },
    en: { checking: 'Checking LiteLLM status...', restarting: 'Restarting LiteLLM...', error: 'An error occurred', retry: 'Try Again', restartTip: 'Restart', stopTip: 'Stop', stopped: 'LiteLLM stopped', stoppedSub: 'Click the button below to restart the service', start: 'Start', desc: 'Proxy server to call 100+ LLM APIs using the OpenAI format' },
    de: { checking: 'LiteLLM-Status wird überprüft...', restarting: 'LiteLLM wird neu gestartet...', error: 'Ein Fehler ist aufgetreten', retry: 'Erneut versuchen', restartTip: 'Neu starten', stopTip: 'Stoppen', stopped: 'LiteLLM gestoppt', stoppedSub: 'Klicken Sie auf die Schaltfläche, um den Dienst neu zu starten', start: 'Starten', desc: 'Proxyserver zum Aufrufen von 100+ LLM-APIs im OpenAI-Format' },
    fr: { checking: 'Vérification du statut LiteLLM...', restarting: 'Redémarrage de LiteLLM...', error: 'Une erreur est survenue', retry: 'Réessayer', restartTip: 'Redémarrer', stopTip: 'Arrêter', stopped: 'LiteLLM arrêté', stoppedSub: 'Cliquez sur le bouton ci-dessous pour redémarrer le service', start: 'Démarrer', desc: 'Serveur proxy pour appeler plus de 100 API LLM au format OpenAI' },
    es: { checking: 'Comprobando estado de LiteLLM...', restarting: 'Reiniciando LiteLLM...', error: 'Se produjo un error', retry: 'Reintentar', restartTip: 'Reiniciar', stopTip: 'Detener', stopped: 'LiteLLM detenido', stoppedSub: 'Haga clic en el botón para reiniciar el servicio', start: 'Iniciar', desc: 'Servidor proxy para llamar a más de 100 APIs LLM en formato OpenAI' },
    ru: { checking: 'Проверка статуса LiteLLM...', restarting: 'Перезапуск LiteLLM...', error: 'Произошла ошибка', retry: 'Повторить', restartTip: 'Перезапустить', stopTip: 'Остановить', stopped: 'LiteLLM остановлен', stoppedSub: 'Нажмите кнопку ниже, чтобы перезапустить сервис', start: 'Запустить', desc: 'Прокси-сервер для вызова 100+ LLM API в формате OpenAI' },
    zh: { checking: '正在检查 LiteLLM 状态...', restarting: '正在重启 LiteLLM...', error: '发生错误', retry: '重试', restartTip: '重启', stopTip: '停止', stopped: 'LiteLLM 已停止', stoppedSub: '点击下方按钮重启服务', start: '启动', desc: '使用 OpenAI 格式调用 100+ LLM API 的代理服务器' },
    ja: { checking: 'LiteLLM の状態を確認中...', restarting: 'LiteLLM を再起動中...', error: 'エラーが発生しました', retry: '再試行', restartTip: '再起動', stopTip: '停止', stopped: 'LiteLLM 停止中', stoppedSub: '下のボタンをクリックしてサービスを再起動', start: '開始', desc: 'OpenAI 形式で 100 以上の LLM API を呼び出すプロキシサーバー' },
    it: { checking: 'Controllo stato LiteLLM...', restarting: 'Riavvio di LiteLLM...', error: 'Si è verificato un errore', retry: 'Riprova', restartTip: 'Riavvia', stopTip: 'Ferma', stopped: 'LiteLLM fermato', stoppedSub: 'Clicca il pulsante qui sotto per riavviare il servizio', start: 'Avvia', desc: 'Server proxy per chiamare oltre 100 API LLM in formato OpenAI' },
    ar: { checking: 'جارٍ التحقق من حالة LiteLLM...', restarting: 'جارٍ إعادة تشغيل LiteLLM...', error: 'حدث خطأ', retry: 'إعادة المحاولة', restartTip: 'إعادة التشغيل', stopTip: 'إيقاف', stopped: 'LiteLLM متوقف', stoppedSub: 'انقر على الزر أدناه لإعادة تشغيل الخدمة', start: 'تشغيل', desc: 'خادم وكيل لاستدعاء أكثر من 100 واجهة برمجة LLM بتنسيق OpenAI' },
    ko: { checking: 'LiteLLM 상태 확인 중...', restarting: 'LiteLLM 재시작 중...', error: '오류가 발생했습니다', retry: '다시 시도', restartTip: '재시작', stopTip: '중지', stopped: 'LiteLLM 중지됨', stoppedSub: '아래 버튼을 클릭하여 서비스를 재시작하세요', start: '시작', desc: 'OpenAI 형식으로 100개 이상의 LLM API를 호출하는 프록시 서버' },
    hi: { checking: 'LiteLLM स्थिति जाँच रहा है...', restarting: 'LiteLLM पुनः आरंभ हो रहा है...', error: 'एक त्रुटि हुई', retry: 'पुनः प्रयास करें', restartTip: 'पुनः आरंभ करें', stopTip: 'रोकें', stopped: 'LiteLLM रुका हुआ', stoppedSub: 'सेवा पुनः आरंभ करने के लिए नीचे बटन पर क्लिक करें', start: 'शुरू करें', desc: 'OpenAI प्रारूप में 100+ LLM API कॉल करने के लिए प्रॉक्सी सर्वर' },
    pt: { checking: 'Verificando status do LiteLLM...', restarting: 'Reiniciando LiteLLM...', error: 'Ocorreu um erro', retry: 'Tentar novamente', restartTip: 'Reiniciar', stopTip: 'Parar', stopped: 'LiteLLM parado', stoppedSub: 'Clique no botão abaixo para reiniciar o serviço', start: 'Iniciar', desc: 'Servidor proxy para chamar mais de 100 APIs LLM no formato OpenAI' }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      function onLocaleChanged() { locale.value = getLocale(); }

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
            iframeSrc.value = '/proxy/' + APP_ID + '/ui/';
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
            containerPort: manifest.docker.containerPort || 4000,
            volumes: manifest.docker.volumes || [],
            env,
            restart: 'always'
          };

          await apiFetch('/api/docker/run', { method: 'POST', body: JSON.stringify(body) });
          await new Promise(r => setTimeout(r, 5000));
          await loadStatus();
        } catch (e) {
          errorMsg.value = e.message;
          status.value = 'error';
        }
      }

      async function stopContainer() {
        try {
          await apiFetch('/api/docker/stop', { method: 'POST', body: JSON.stringify({ appId: APP_ID }) });
        } catch {}
        iframeSrc.value = '';
        serviceInfo.value = null;
        status.value = 'stopped';
      }

      const connInfo = computed(() => {
        if (!serviceInfo.value) return null;
        return {
          host: 'localhost',
          port: serviceInfo.value.port,
          internalHost: serviceInfo.value.containerName
        };
      });

      onMounted(() => {
        window.addEventListener('locale-changed', onLocaleChanged);
        loadStatus();
      });

      onUnmounted(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
      });

      return { status, serviceInfo, errorMsg, iframeSrc, connInfo, loadStatus, restart, stopContainer, L };
    }
  };
})(Vue)
