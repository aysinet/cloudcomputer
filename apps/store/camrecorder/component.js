({
  setup() {
    const { ref, onMounted, onUnmounted, nextTick } = Vue;

    const LANGS = {
      tr: { title:'Kamera', retry:'Tekrar Dene', switch:'Kamera Değiştir', photo:'Fotoğraf Çek', startRec:'Kayıt Başlat', stopRec:'Kayıt Durdur', timer:'Zamanlayıcı', download:'İndir', noAccess:'Kameraya erişim izni verilemedi' },
      en: { title:'Camera', retry:'Retry', switch:'Switch Camera', photo:'Take Photo', startRec:'Start Recording', stopRec:'Stop Recording', timer:'Timer', download:'Download', noAccess:'Camera access denied' },
      de: { title:'Kamera', retry:'Erneut versuchen', switch:'Kamera wechseln', photo:'Foto aufnehmen', startRec:'Aufnahme starten', stopRec:'Aufnahme stoppen', timer:'Timer', download:'Herunterladen', noAccess:'Kamerazugriff verweigert' },
      fr: { title:'Caméra', retry:'Réessayer', switch:'Changer de caméra', photo:'Prendre une photo', startRec:'Démarrer l\'enregistrement', stopRec:'Arrêter', timer:'Minuteur', download:'Télécharger', noAccess:'Accès caméra refusé' },
      es: { title:'Cámara', retry:'Reintentar', switch:'Cambiar cámara', photo:'Tomar foto', startRec:'Iniciar grabación', stopRec:'Detener', timer:'Temporizador', download:'Descargar', noAccess:'Acceso a cámara denegado' },
      ru: { title:'Камера', retry:'Повторить', switch:'Переключить', photo:'Сделать фото', startRec:'Начать запись', stopRec:'Остановить', timer:'Таймер', download:'Скачать', noAccess:'Доступ к камере запрещён' },
      zh: { title:'摄像头', retry:'重试', switch:'切换摄像头', photo:'拍照', startRec:'开始录制', stopRec:'停止', timer:'定时器', download:'下载', noAccess:'无法访问摄像头' },
      ja: { title:'カメラ', retry:'再試行', switch:'カメラ切り替え', photo:'撮影', startRec:'録画開始', stopRec:'停止', timer:'タイマー', download:'ダウンロード', noAccess:'カメラへのアクセスが拒否されました' },
      it: { title:'Fotocamera', retry:'Riprova', switch:'Cambia fotocamera', photo:'Scatta foto', startRec:'Avvia registrazione', stopRec:'Interrompi', timer:'Timer', download:'Scarica', noAccess:'Accesso fotocamera negato' }
    };

    function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }
    const locale = ref(getLocale());
    function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

    const videoEl = ref(null);
    const canvasEl = ref(null);
    const error = ref('');
    const recording = ref(false);
    const recTime = ref('00:00');
    const countdown = ref(0);
    const gallery = ref([]);
    const showPreview = ref(false);
    const previewData = ref(null);
    const devices = ref([]);
    const selectedDevice = ref('');
    const facingMode = ref('user');
    let stream = null;
    let mediaRecorder = null;
    let recChunks = [];
    let recTimer = null;
    let recStart = 0;

    async function initCamera() {
      error.value = '';
      try {
        if (stream) { stream.getTracks().forEach(tr => tr.stop()); }
        const constraints = { video: selectedDevice.value ? { deviceId: { exact: selectedDevice.value } } : { facingMode: facingMode.value }, audio: true };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        await nextTick();
        if (videoEl.value) {
          videoEl.value.srcObject = stream;
          try { await videoEl.value.play(); } catch {}
        }
        const devs = await navigator.mediaDevices.enumerateDevices();
        devices.value = devs.filter(d => d.kind === 'videoinput');
        if (!selectedDevice.value && devices.value.length) {
          selectedDevice.value = devices.value[0].deviceId;
        }
      } catch (e) {
        error.value = L('noAccess');
      }
    }

    function switchCamera() {
      facingMode.value = facingMode.value === 'user' ? 'environment' : 'user';
      const idx = devices.value.findIndex(d => d.deviceId === selectedDevice.value);
      if (devices.value.length > 1) {
        selectedDevice.value = devices.value[(idx + 1) % devices.value.length].deviceId;
      }
      initCamera();
    }

    function switchDevice() { initCamera(); }

    function takePhoto() {
      if (!videoEl.value || !canvasEl.value) return;
      const v = videoEl.value;
      const c = canvasEl.value;
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      const ctx = c.getContext('2d');
      if (facingMode.value === 'user') {
        ctx.translate(c.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(v, 0, 0);
      const url = c.toDataURL('image/png');
      gallery.value.unshift({ type: 'photo', url, name: 'photo_' + Date.now() + '.png' });
    }

    function timerShot() {
      countdown.value = 3;
      const iv = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) { clearInterval(iv); takePhoto(); }
      }, 1000);
    }

    function startRec() {
      if (!stream) return;
      recChunks = [];
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm';
      mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorder.ondataavailable = e => { if (e.data.size > 0) recChunks.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(recChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const dur = Math.round((Date.now() - recStart) / 1000);
        const mm = String(Math.floor(dur / 60)).padStart(2, '0');
        const ss = String(dur % 60).padStart(2, '0');
        gallery.value.unshift({ type: 'video', url, name: 'video_' + Date.now() + '.webm', duration: mm + ':' + ss, blob });
      };
      mediaRecorder.start(1000);
      recording.value = true;
      recStart = Date.now();
      recTimer = setInterval(() => {
        const elapsed = Math.round((Date.now() - recStart) / 1000);
        const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const ss = String(elapsed % 60).padStart(2, '0');
        recTime.value = mm + ':' + ss;
      }, 500);
    }

    function stopRec() {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') { mediaRecorder.stop(); }
      recording.value = false;
      recTime.value = '00:00';
      if (recTimer) { clearInterval(recTimer); recTimer = null; }
    }

    function previewItem(item) { previewData.value = item; showPreview.value = true; }

    function removeItem(i) {
      const item = gallery.value[i];
      if (item && item.url && item.type === 'video') URL.revokeObjectURL(item.url);
      gallery.value.splice(i, 1);
    }

    function downloadItem(item) {
      const a = document.createElement('a');
      a.href = item.url;
      a.download = item.name || ('cam_' + Date.now());
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    function onLocaleChanged() { locale.value = getLocale(); }
    window.addEventListener('locale-changed', onLocaleChanged);

    onMounted(() => initCamera());
    onUnmounted(() => {
      if (stream) stream.getTracks().forEach(tr => tr.stop());
      if (recTimer) clearInterval(recTimer);
      window.removeEventListener('locale-changed', onLocaleChanged);
    });

    return { L, videoEl, canvasEl, error, recording, recTime, countdown, gallery, showPreview, previewData, devices, selectedDevice, facingMode, initCamera, switchCamera, switchDevice, takePhoto, timerShot, startRec, stopRec, previewItem, removeItem, downloadItem };
  }
})
