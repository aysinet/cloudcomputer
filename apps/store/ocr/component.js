(function(Vue) {
  const { ref, computed, onMounted, onUnmounted } = Vue;

  const APP_ID = 'ocr';
  const OCR_LANGS = [
    { value: 'eng', label: 'English' },
    { value: 'tur', label: 'Turkce' },
    { value: 'eng+tur', label: 'English + Turkce' },
    { value: 'deu', label: 'Deutsch' },
    { value: 'fra', label: 'Francais' },
    { value: 'spa', label: 'Espanol' },
    { value: 'ita', label: 'Italiano' },
    { value: 'por', label: 'Portugues' },
    { value: 'rus', label: 'Russkiy' },
    { value: 'jpn', label: 'Japanese' },
    { value: 'chi_sim', label: 'Chinese Simplified' }
  ];

  const LANGS = {
    tr: { title:'OCR', installed:'Hazir', notInstalled:'Kurulu degil', running:'Calisiyor', stopped:'Durdu', loading:'Yukleniyor', pickServer:'Sunucudan Resim Sec', pickClient:'Bilgisayardan Yukle', saveAs:'Sonucu Kaydet', scan:'OCR Tara', restart:'Servisi Yeniden Baslat', refresh:'Yenile', history:'Gecmis', preview:'Metin Onizleme', noJobs:'Henuz OCR islemi yok', source:'Kaynak', output:'Cikti', language:'Dil', installHint:'Uygulamayi Store uzerinden kurup servisi baslatin.', selectSource:'Resim secin', ready:'Hazir', uploadSaved:'Yuklenen dosya sunucuya kaydedilecek', outputAuto:'Secilmezse varsayilan yol kullanilir', status:'Servis Durumu', chars:'karakter', openResult:'Sonucu Ac', serviceInfo:'Docker tabanli Tesseract OCR servisi', scanOk:'OCR tamamlandi', scanErr:'OCR hatasi', path:'Yol', sourceTypeServer:'Sunucu dosyasi', sourceTypeUpload:'Yuklenen dosya' },
    en: { title:'OCR', installed:'Installed', notInstalled:'Not installed', running:'Running', stopped:'Stopped', loading:'Loading', pickServer:'Pick Server Image', pickClient:'Upload From Computer', saveAs:'Save Result As', scan:'Run OCR', restart:'Restart Service', refresh:'Refresh', history:'History', preview:'Text Preview', noJobs:'No OCR jobs yet', source:'Source', output:'Output', language:'Language', installHint:'Install the app from Store and start the service.', selectSource:'Select an image', ready:'Ready', uploadSaved:'Uploaded file will be saved on the server', outputAuto:'Default path is used if not selected', status:'Service Status', chars:'chars', openResult:'Open Result', serviceInfo:'Docker-based Tesseract OCR service', scanOk:'OCR completed', scanErr:'OCR failed', path:'Path', sourceTypeServer:'Server file', sourceTypeUpload:'Uploaded file' },
    de: { title:'OCR', installed:'Installiert', notInstalled:'Nicht installiert', running:'Laeuft', stopped:'Gestoppt', loading:'Laedt', pickServer:'Serverbild waehlen', pickClient:'Vom Computer hochladen', saveAs:'Ergebnis speichern unter', scan:'OCR starten', restart:'Dienst neu starten', refresh:'Aktualisieren', history:'Verlauf', preview:'Textvorschau', noJobs:'Noch keine OCR-Jobs', source:'Quelle', output:'Ausgabe', language:'Sprache', installHint:'App im Store installieren und Dienst starten.', selectSource:'Bild auswaehlen', ready:'Bereit', uploadSaved:'Hochgeladene Datei wird auf dem Server gespeichert', outputAuto:'Wenn nicht gewaehlt, wird der Standardpfad verwendet', status:'Dienststatus', chars:'Zeichen', openResult:'Ergebnis oeffnen', serviceInfo:'Docker-basierter Tesseract-OCR-Dienst', scanOk:'OCR abgeschlossen', scanErr:'OCR fehlgeschlagen', path:'Pfad', sourceTypeServer:'Serverdatei', sourceTypeUpload:'Hochgeladene Datei' },
    fr: { title:'OCR', installed:'Installe', notInstalled:'Non installe', running:'En cours', stopped:'Arrete', loading:'Chargement', pickServer:'Choisir une image serveur', pickClient:'Televerser depuis l ordinateur', saveAs:'Enregistrer le resultat sous', scan:'Lancer OCR', restart:'Redemarrer le service', refresh:'Actualiser', history:'Historique', preview:'Apercu du texte', noJobs:'Aucune operation OCR', source:'Source', output:'Sortie', language:'Langue', installHint:'Installez l application depuis le Store et demarrez le service.', selectSource:'Selectionnez une image', ready:'Pret', uploadSaved:'Le fichier televerse sera enregistre sur le serveur', outputAuto:'Le chemin par defaut sera utilise si rien n est choisi', status:'Etat du service', chars:'caracteres', openResult:'Ouvrir le resultat', serviceInfo:'Service Tesseract OCR base sur Docker', scanOk:'OCR termine', scanErr:'Echec OCR', path:'Chemin', sourceTypeServer:'Fichier serveur', sourceTypeUpload:'Fichier televerse' },
    es: { title:'OCR', installed:'Instalado', notInstalled:'No instalado', running:'En ejecucion', stopped:'Detenido', loading:'Cargando', pickServer:'Elegir imagen del servidor', pickClient:'Subir desde el ordenador', saveAs:'Guardar resultado como', scan:'Ejecutar OCR', restart:'Reiniciar servicio', refresh:'Actualizar', history:'Historial', preview:'Vista previa del texto', noJobs:'Sin trabajos OCR', source:'Origen', output:'Salida', language:'Idioma', installHint:'Instala la app desde Store e inicia el servicio.', selectSource:'Selecciona una imagen', ready:'Listo', uploadSaved:'El archivo subido se guardara en el servidor', outputAuto:'Se usa la ruta por defecto si no eliges una', status:'Estado del servicio', chars:'caracteres', openResult:'Abrir resultado', serviceInfo:'Servicio Tesseract OCR basado en Docker', scanOk:'OCR completado', scanErr:'Error de OCR', path:'Ruta', sourceTypeServer:'Archivo del servidor', sourceTypeUpload:'Archivo subido' },
    ru: { title:'OCR', installed:'Установлено', notInstalled:'Не установлено', running:'Работает', stopped:'Остановлено', loading:'Загрузка', pickServer:'Выбрать изображение на сервере', pickClient:'Загрузить с компьютера', saveAs:'Сохранить результат как', scan:'Запустить OCR', restart:'Перезапустить сервис', refresh:'Обновить', history:'История', preview:'Предпросмотр текста', noJobs:'Пока нет OCR задач', source:'Источник', output:'Результат', language:'Язык', installHint:'Установите приложение из Store и запустите сервис.', selectSource:'Выберите изображение', ready:'Готово', uploadSaved:'Загруженный файл будет сохранен на сервере', outputAuto:'Если путь не выбран, используется путь по умолчанию', status:'Статус сервиса', chars:'символов', openResult:'Открыть результат', serviceInfo:'OCR сервис Tesseract на базе Docker', scanOk:'OCR завершен', scanErr:'Ошибка OCR', path:'Путь', sourceTypeServer:'Файл сервера', sourceTypeUpload:'Загруженный файл' },
    zh: { title:'OCR', installed:'已安装', notInstalled:'未安装', running:'运行中', stopped:'已停止', loading:'加载中', pickServer:'选择服务器图片', pickClient:'从电脑上传', saveAs:'结果另存为', scan:'执行 OCR', restart:'重启服务', refresh:'刷新', history:'历史', preview:'文本预览', noJobs:'暂无 OCR 记录', source:'来源', output:'输出', language:'语言', installHint:'请先在应用商店安装并启动服务。', selectSource:'选择图片', ready:'就绪', uploadSaved:'上传文件会先保存到服务器', outputAuto:'未选择时使用默认路径', status:'服务状态', chars:'字符', openResult:'打开结果', serviceInfo:'基于 Docker 的 Tesseract OCR 服务', scanOk:'OCR 已完成', scanErr:'OCR 失败', path:'路径', sourceTypeServer:'服务器文件', sourceTypeUpload:'上传文件' },
    ja: { title:'OCR', installed:'インストール済み', notInstalled:'未インストール', running:'実行中', stopped:'停止中', loading:'読み込み中', pickServer:'サーバー画像を選択', pickClient:'PC からアップロード', saveAs:'結果を別名で保存', scan:'OCR 実行', restart:'サービスを再起動', refresh:'更新', history:'履歴', preview:'テキストプレビュー', noJobs:'OCR ジョブはありません', source:'入力', output:'出力', language:'言語', installHint:'Store からアプリをインストールしてサービスを起動してください。', selectSource:'画像を選択してください', ready:'準備完了', uploadSaved:'アップロードしたファイルはサーバーに保存されます', outputAuto:'未選択時は既定のパスを使います', status:'サービス状態', chars:'文字', openResult:'結果を開く', serviceInfo:'Docker ベースの Tesseract OCR サービス', scanOk:'OCR 完了', scanErr:'OCR エラー', path:'パス', sourceTypeServer:'サーバーファイル', sourceTypeUpload:'アップロードファイル' },
    it: { title:'OCR', installed:'Installato', notInstalled:'Non installato', running:'In esecuzione', stopped:'Fermo', loading:'Caricamento', pickServer:'Seleziona immagine server', pickClient:'Carica dal computer', saveAs:'Salva risultato come', scan:'Esegui OCR', restart:'Riavvia servizio', refresh:'Aggiorna', history:'Cronologia', preview:'Anteprima testo', noJobs:'Nessuna operazione OCR', source:'Sorgente', output:'Output', language:'Lingua', installHint:'Installa l app dallo Store e avvia il servizio.', selectSource:'Seleziona un immagine', ready:'Pronto', uploadSaved:'Il file caricato verra salvato sul server', outputAuto:'Se non selezioni nulla viene usato il percorso predefinito', status:'Stato del servizio', chars:'caratteri', openResult:'Apri risultato', serviceInfo:'Servizio Tesseract OCR basato su Docker', scanOk:'OCR completato', scanErr:'Errore OCR', path:'Percorso', sourceTypeServer:'File server', sourceTypeUpload:'File caricato' },
    ar: { title:'OCR', installed:'مثبت', notInstalled:'غير مثبت', running:'يعمل', stopped:'متوقف', loading:'جار التحميل', pickServer:'اختر صورة من الخادم', pickClient:'ارفع من الكمبيوتر', saveAs:'احفظ النتيجة باسم', scan:'تشغيل OCR', restart:'اعادة تشغيل الخدمة', refresh:'تحديث', history:'السجل', preview:'معاينة النص', noJobs:'لا توجد عمليات OCR بعد', source:'المصدر', output:'الناتج', language:'اللغة', installHint:'ثبت التطبيق من المتجر ثم شغل الخدمة.', selectSource:'اختر صورة', ready:'جاهز', uploadSaved:'سيتم حفظ الملف المرفوع على الخادم', outputAuto:'سيتم استخدام المسار الافتراضي اذا لم تحدد مسارا', status:'حالة الخدمة', chars:'حرف', openResult:'افتح النتيجة', serviceInfo:'خدمة Tesseract OCR معتمدة على Docker', scanOk:'اكتمل OCR', scanErr:'فشل OCR', path:'المسار', sourceTypeServer:'ملف على الخادم', sourceTypeUpload:'ملف مرفوع' },
    ko: { title:'OCR', installed:'설치됨', notInstalled:'설치되지 않음', running:'실행 중', stopped:'중지됨', loading:'불러오는 중', pickServer:'서버 이미지 선택', pickClient:'컴퓨터에서 업로드', saveAs:'결과 저장 위치', scan:'OCR 실행', restart:'서비스 재시작', refresh:'새로고침', history:'기록', preview:'텍스트 미리보기', noJobs:'OCR 작업이 없습니다', source:'원본', output:'출력', language:'언어', installHint:'스토어에서 앱을 설치하고 서비스를 시작하세요.', selectSource:'이미지를 선택하세요', ready:'준비됨', uploadSaved:'업로드한 파일은 서버에 저장됩니다', outputAuto:'선택하지 않으면 기본 경로를 사용합니다', status:'서비스 상태', chars:'문자', openResult:'결과 열기', serviceInfo:'Docker 기반 Tesseract OCR 서비스', scanOk:'OCR 완료', scanErr:'OCR 실패', path:'경로', sourceTypeServer:'서버 파일', sourceTypeUpload:'업로드 파일' },
    hi: { title:'OCR', installed:'इंस्टॉल', notInstalled:'इंस्टॉल नहीं', running:'चालू', stopped:'बंद', loading:'लोड हो रहा है', pickServer:'सर्वर इमेज चुनें', pickClient:'कंप्यूटर से अपलोड करें', saveAs:'रिजल्ट इस नाम से सहेजें', scan:'OCR चलाएं', restart:'सेवा रीस्टार्ट करें', refresh:'रीफ्रेश', history:'इतिहास', preview:'टेक्स्ट प्रीव्यू', noJobs:'अभी कोई OCR जॉब नहीं', source:'स्रोत', output:'आउटपुट', language:'भाषा', installHint:'Store से ऐप इंस्टॉल करके सेवा शुरू करें।', selectSource:'एक इमेज चुनें', ready:'तैयार', uploadSaved:'अपलोड की गई फाइल सर्वर पर सहेजी जाएगी', outputAuto:'न चुनने पर डिफॉल्ट पथ उपयोग होगा', status:'सेवा स्थिति', chars:'अक्षर', openResult:'परिणाम खोलें', serviceInfo:'Docker आधारित Tesseract OCR सेवा', scanOk:'OCR पूरा हुआ', scanErr:'OCR विफल', path:'पथ', sourceTypeServer:'सर्वर फाइल', sourceTypeUpload:'अपलोड फाइल' },
    pt: { title:'OCR', installed:'Instalado', notInstalled:'Nao instalado', running:'Em execucao', stopped:'Parado', loading:'Carregando', pickServer:'Escolher imagem do servidor', pickClient:'Enviar do computador', saveAs:'Salvar resultado como', scan:'Executar OCR', restart:'Reiniciar servico', refresh:'Atualizar', history:'Historico', preview:'Previa do texto', noJobs:'Nenhum trabalho OCR ainda', source:'Origem', output:'Saida', language:'Idioma', installHint:'Instale o app pela Store e inicie o servico.', selectSource:'Selecione uma imagem', ready:'Pronto', uploadSaved:'O arquivo enviado sera salvo no servidor', outputAuto:'Se nao escolher um caminho, o padrao sera usado', status:'Status do servico', chars:'caracteres', openResult:'Abrir resultado', serviceInfo:'Servico Tesseract OCR baseado em Docker', scanOk:'OCR concluido', scanErr:'Falha no OCR', path:'Caminho', sourceTypeServer:'Arquivo do servidor', sourceTypeUpload:'Arquivo enviado' }
  };

  function getLocale() {
    try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; }
  }

  function authHeaders(extra) {
    var token = document.cookie.split(';').map(function(c) { return c.trim(); }).find(function(c) { return c.indexOf('token=') === 0; });
    var headers = Object.assign({}, extra || {});
    if (token) headers.Authorization = 'Bearer ' + token.split('=')[1];
    return headers;
  }

  function guessOutputPath(name) {
    var safe = (name || 'scan').replace(/[<>:"|?*\\/]+/g, '_');
    var base = safe.replace(/\.[^.]+$/, '') || 'scan';
    return 'OCR/results/' + base + '.ocr.txt';
  }

  function notify(type, msg) {
    if (window.ElementPlus && window.ElementPlus.ElMessage && window.ElementPlus.ElMessage[type]) {
      window.ElementPlus.ElMessage[type](msg);
    }
  }

  return {
    setup() {
      const locale = ref(getLocale());
      const status = ref('loading');
      const serviceInfo = ref(null);
      const jobs = ref([]);
      const selectedJob = ref(null);
      const selectedSourcePath = ref('');
      const selectedSourceName = ref('');
      const uploadFile = ref(null);
      const uploadLabel = ref('');
      const outputPath = ref('');
      const selectedLang = ref('eng+tur');
      const busy = ref(false);
      const previewText = ref('');
      const errorMsg = ref('');

      function L(key) {
        return (LANGS[locale.value] || LANGS.tr)[key] || LANGS.tr[key] || key;
      }

      function onLocaleChanged(e) {
        locale.value = e.detail || getLocale();
      }

      const isInstalled = computed(function() { return !!serviceInfo.value; });
      const canScan = computed(function() {
        return status.value === 'running' && (!!selectedSourcePath.value || !!uploadFile.value) && !busy.value;
      });

      async function loadStatus() {
        status.value = 'loading';
        errorMsg.value = '';
        try {
          const res = await fetch('/api/services/' + APP_ID, { headers: authHeaders() });
          if (res.status === 404) {
            serviceInfo.value = null;
            status.value = 'not-installed';
            return;
          }
          if (!res.ok) throw new Error('status');
          const data = await res.json();
          serviceInfo.value = data;
          status.value = data.running ? 'running' : 'stopped';
        } catch (e) {
          serviceInfo.value = null;
          status.value = 'error';
          errorMsg.value = e.message || 'status';
        }
      }

      async function loadJobs(selectId) {
        try {
          const res = await fetch('/api/ocr/jobs', { headers: authHeaders() });
          const data = res.ok ? await res.json() : { jobs: [] };
          jobs.value = Array.isArray(data.jobs) ? data.jobs : [];
          if (selectId) {
            var found = jobs.value.find(function(job) { return job.id === selectId; });
            if (found) await openJob(found);
          } else if (!selectedJob.value && jobs.value.length) {
            await openJob(jobs.value[0]);
          }
        } catch {}
      }

      async function openJob(job) {
        if (!job) return;
        selectedJob.value = job;
        try {
          const res = await fetch('/api/ocr/jobs/' + encodeURIComponent(job.id), { headers: authHeaders() });
          const data = res.ok ? await res.json() : job;
          selectedJob.value = data;
          previewText.value = data.text || data.textPreview || '';
        } catch {
          previewText.value = job.textPreview || '';
        }
      }

      async function pickServerImage() {
        if (!window.FileDialog) return;
        var result = await window.FileDialog.open({
          title: '🖼 OCR',
          filters: [{ label: 'Images', extensions: ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tif', '.tiff', '.gif'] }]
        });
        if (!result) return;
        selectedSourcePath.value = result.path;
        selectedSourceName.value = result.name;
        uploadFile.value = null;
        uploadLabel.value = '';
        if (!outputPath.value) outputPath.value = guessOutputPath(result.name);
      }

      function pickClientImage() {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = '.png,.jpg,.jpeg,.webp,.bmp,.tif,.tiff,.gif';
        input.onchange = function() {
          if (!input.files || !input.files[0]) return;
          uploadFile.value = input.files[0];
          uploadLabel.value = input.files[0].name;
          selectedSourcePath.value = '';
          selectedSourceName.value = input.files[0].name;
          if (!outputPath.value) outputPath.value = guessOutputPath(input.files[0].name);
        };
        input.click();
      }

      async function chooseOutput() {
        if (!window.FileDialog) return;
        var result = await window.FileDialog.save({
          title: '💾 OCR',
          defaultName: outputPath.value.split('/').pop() || 'scan.ocr.txt',
          initialPath: outputPath.value.indexOf('/') >= 0 ? outputPath.value.split('/').slice(0, -1).join('/') : '',
          filters: [{ label: 'Text', extensions: ['.txt'] }]
        });
        if (!result) return;
        outputPath.value = result.path;
      }

      async function restartService() {
        busy.value = true;
        errorMsg.value = '';
        try {
          await fetch('/api/docker/stop', {
            method: 'POST',
            headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
            body: JSON.stringify({ appId: APP_ID })
          });

          const cfgRes = await fetch('/api/services/' + APP_ID, { headers: authHeaders() });
          const cfg = cfgRes.ok ? await cfgRes.json() : { installConfig: {} };
          const appRes = await fetch('/api/store', { headers: authHeaders() });
          const apps = appRes.ok ? await appRes.json() : [];
          const manifest = apps.find(function(app) { return app.id === APP_ID; });
          if (!manifest || !manifest.docker) throw new Error('manifest');

          const env = [].concat(manifest.docker.env || []);
          const body = {
            image: manifest.docker.image,
            appId: APP_ID,
            containerPort: manifest.docker.containerPort || 9999,
            volumes: manifest.docker.volumes || [],
            env: env,
            restart: manifest.docker.restart || 'always',
            cmd: manifest.docker.cmd || []
          };

          const runRes = await fetch('/api/docker/run', {
            method: 'POST',
            headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
            body: JSON.stringify(body)
          });
          if (!runRes.ok) {
            const runErr = await runRes.json().catch(function() { return {}; });
            throw new Error(runErr.error || 'run');
          }
          await loadStatus();
        } catch (e) {
          errorMsg.value = e.message || 'restart';
          status.value = 'error';
        } finally {
          busy.value = false;
        }
      }

      async function runScan() {
        if (!canScan.value) return;
        busy.value = true;
        errorMsg.value = '';
        try {
          var res;
          if (uploadFile.value) {
            var form = new FormData();
            form.append('file', uploadFile.value);
            form.append('lang', selectedLang.value);
            if (outputPath.value) form.append('outputPath', outputPath.value);
            res = await fetch('/api/ocr/scan-upload', {
              method: 'POST',
              headers: authHeaders(),
              body: form
            });
          } else {
            res = await fetch('/api/ocr/scan', {
              method: 'POST',
              headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
              body: JSON.stringify({ sourcePath: selectedSourcePath.value, lang: selectedLang.value, outputPath: outputPath.value })
            });
          }
          var data = await res.json();
          if (!res.ok) throw new Error(data.error || 'scan');
          previewText.value = data.text || '';
          notify('success', L('scanOk'));
          await loadJobs(data.job && data.job.id);
        } catch (e) {
          errorMsg.value = e.message || 'scan';
          notify('error', L('scanErr') + ': ' + errorMsg.value);
        } finally {
          busy.value = false;
        }
      }

      onMounted(function() {
        window.addEventListener('locale-changed', onLocaleChanged);
        loadStatus();
        loadJobs();
      });

      onUnmounted(function() {
        window.removeEventListener('locale-changed', onLocaleChanged);
      });

      return {
        OCR_LANGS: OCR_LANGS,
        status: status,
        serviceInfo: serviceInfo,
        jobs: jobs,
        selectedJob: selectedJob,
        selectedSourcePath: selectedSourcePath,
        selectedSourceName: selectedSourceName,
        uploadLabel: uploadLabel,
        outputPath: outputPath,
        selectedLang: selectedLang,
        busy: busy,
        previewText: previewText,
        errorMsg: errorMsg,
        isInstalled: isInstalled,
        canScan: canScan,
        L: L,
        loadStatus: loadStatus,
        pickServerImage: pickServerImage,
        pickClientImage: pickClientImage,
        chooseOutput: chooseOutput,
        restartService: restartService,
        runScan: runScan,
        openJob: openJob
      };
    }
  };
})(Vue);