({
  setup() {
    const { ref, onMounted, onUnmounted } = Vue;
    const ElMessageBox = (window.ElementPlus && window.ElementPlus.ElMessageBox) || { confirm: () => Promise.resolve() };

    const LANGS = {
      tr: {
        title:'Ses Kaydedici',
        record:'Kayıt',
        pause:'Duraklat',
        resume:'Devam',
        stop:'Durdur',
        recordings:'Kayıtlar',
        noRecordings:'Henüz kayıt yok',
        download:'İndir',
        delete:'Sil',
        connected:'Bağlı',
        disconnected:'Bağlantı yok',
        recordingState:'Kaydediliyor...',
        pausedState:'Duraklatıldı',
        success:'Başarılı',
        error:'Hata',
        saved:'Kayıt kaydedildi',
        deleted:'Kayıt silindi',
        micError:'Mikrofon erişimi reddedildi',
        deleteConfirm:'Bu kaydı silmek istediğinize emin misiniz?',
        cancel:'İptal'
      },
      en: {
        title:'Audio Recorder',
        record:'Record',
        pause:'Pause',
        resume:'Resume',
        stop:'Stop',
        recordings:'Recordings',
        noRecordings:'No recordings yet',
        download:'Download',
        delete:'Delete',
        connected:'Connected',
        disconnected:'Disconnected',
        recordingState:'Recording...',
        pausedState:'Paused',
        success:'Success',
        error:'Error',
        saved:'Recording saved',
        deleted:'Recording deleted',
        micError:'Microphone access denied',
        deleteConfirm:'Are you sure you want to delete this recording?',
        cancel:'Cancel'
      },
      de: {
        title:'Audiorekorder',
        record:'Aufnahme',
        pause:'Pause',
        resume:'Fortsetzen',
        stop:'Stopp',
        recordings:'Aufnahmen',
        noRecordings:'Noch keine Aufnahmen',
        download:'Herunterladen',
        delete:'Löschen',
        connected:'Verbunden',
        disconnected:'Getrennt',
        recordingState:'Aufnahme...',
        pausedState:'Pausiert',
        success:'Erfolgreich',
        error:'Fehler',
        saved:'Aufnahme gespeichert',
        deleted:'Aufnahme gelöscht',
        micError:'Mikrofonzugriff verweigert',
        deleteConfirm:'Möchten Sie diese Aufnahme wirklich löschen?',
        cancel:'Abbrechen'
      },
      fr: {
        title:'Enregistreur Audio',
        record:'Enregistrer',
        pause:'Pause',
        resume:'Reprendre',
        stop:'Arrêter',
        recordings:'Enregistrements',
        noRecordings:'Pas encore d\'enregistrements',
        download:'Télécharger',
        delete:'Supprimer',
        connected:'Connecté',
        disconnected:'Déconnecté',
        recordingState:'Enregistrement...',
        pausedState:'En pause',
        success:'Succès',
        error:'Erreur',
        saved:'Enregistrement sauvegardé',
        deleted:'Enregistrement supprimé',
        micError:'Accès au microphone refusé',
        deleteConfirm:'Êtes-vous sûr de vouloir supprimer cet enregistrement ?',
        cancel:'Annuler'
      },
      es: {
        title:'Grabadora de Audio',
        record:'Grabar',
        pause:'Pausar',
        resume:'Reanudar',
        stop:'Detener',
        recordings:'Grabaciones',
        noRecordings:'Aún no hay grabaciones',
        download:'Descargar',
        delete:'Eliminar',
        connected:'Conectado',
        disconnected:'Desconectado',
        recordingState:'Grabando...',
        pausedState:'En pausa',
        success:'Éxito',
        error:'Error',
        saved:'Grabación guardada',
        deleted:'Grabación eliminada',
        micError:'Acceso al micrófono denegado',
        deleteConfirm:'¿Estás seguro de que quieres eliminar esta grabación?',
        cancel:'Cancelar'
      },
      ru: {
        title:'Аудиорекордер',
        record:'Запись',
        pause:'Пауза',
        resume:'Продолжить',
        stop:'Стоп',
        recordings:'Записи',
        noRecordings:'Пока нет записей',
        download:'Скачать',
        delete:'Удалить',
        connected:'Подключено',
        disconnected:'Отключено',
        recordingState:'Запись...',
        pausedState:'Приостановлено',
        success:'Успешно',
        error:'Ошибка',
        saved:'Запись сохранена',
        deleted:'Запись удалена',
        micError:'Доступ к микрофону отклонён',
        deleteConfirm:'Вы уверены, что хотите удалить эту запись?',
        cancel:'Отмена'
      },
      zh: {
        title:'录音机',
        record:'录音',
        pause:'暂停',
        resume:'继续',
        stop:'停止',
        recordings:'录音列表',
        noRecordings:'没有录音',
        download:'下载',
        delete:'删除',
        connected:'已连接',
        disconnected:'已断开',
        recordingState:'录音中',
        pausedState:'已暂停',
        success:'成功',
        error:'错误',
        saved:'已保存',
        deleted:'已删除',
        micError:'麦克风错误',
        deleteConfirm:'确认删除？',
        cancel:'取消'
      },
      ja: {
        title:'ボイスレコーダー',
        record:'録音',
        pause:'一時停止',
        resume:'再開',
        stop:'停止',
        recordings:'録音一覧',
        noRecordings:'録音なし',
        download:'ダウンロード',
        delete:'削除',
        connected:'接続済',
        disconnected:'切断',
        recordingState:'録音中',
        pausedState:'一時停止中',
        success:'成功',
        error:'エラー',
        saved:'保存済',
        deleted:'削除済',
        micError:'マイクエラー',
        deleteConfirm:'削除しますか？',
        cancel:'キャンセル'
      },
      it: {
        title:'Registratore Audio',
        record:'Registra',
        pause:'Pausa',
        resume:'Riprendi',
        stop:'Stop',
        recordings:'Registrazioni',
        noRecordings:'Nessuna registrazione',
        download:'Scarica',
        delete:'Elimina',
        connected:'Connesso',
        disconnected:'Disconnesso',
        recordingState:'Registrazione',
        pausedState:'In pausa',
        success:'Successo',
        error:'Errore',
        saved:'Salvato',
        deleted:'Eliminato',
        micError:'Errore microfono',
        deleteConfirm:'Confermi eliminazione?',
        cancel:'Annulla'
      },
      ar: {
        title:'مسجل الصوت',
        record:'Record',
        pause:'إيقاف',
        resume:'استئناف',
        stop:'إيقاف',
        recordings:'Recordings',
        noRecordings:'No recordings yet',
        download:'تنزيل',
        delete:'حذف',
        connected:'متصل',
        disconnected:'غير متصل',
        recordingState:'Recording...',
        pausedState:'Paused',
        success:'نجاح',
        error:'خطأ',
        saved:'Recording saved',
        deleted:'Recording deleted',
        micError:'Microphone access denied',
        deleteConfirm:'Are you sure you want to delete this recording?',
        cancel:'إلغاء'
      },
      ko: {
        title:'오디오 레코더',
        record:'Record',
        pause:'Pause',
        resume:'재개',
        stop:'정지',
        recordings:'Recordings',
        noRecordings:'No recordings yet',
        download:'다운로드',
        delete:'삭제',
        connected:'연결됨',
        disconnected:'연결 끊김',
        recordingState:'Recording...',
        pausedState:'Paused',
        success:'성공',
        error:'오류',
        saved:'Recording saved',
        deleted:'Recording deleted',
        micError:'Microphone access denied',
        deleteConfirm:'Are you sure you want to delete this recording?',
        cancel:'취소'
      },
      hi: {
        title:'ऑडियो रिकॉर्डर',
        record:'Record',
        pause:'Pause',
        resume:'जारी',
        stop:'रोकें',
        recordings:'Recordings',
        noRecordings:'No recordings yet',
        download:'डाउनलोड',
        delete:'हटाएं',
        connected:'कनेक्टेड',
        disconnected:'डिस्कनेक्ट',
        recordingState:'Recording...',
        pausedState:'Paused',
        success:'सफल',
        error:'त्रुटि',
        saved:'Recording saved',
        deleted:'Recording deleted',
        micError:'Microphone access denied',
        deleteConfirm:'Are you sure you want to delete this recording?',
        cancel:'रद्द करें'
      },
      pt: {
        title:'Gravador de Áudio',
        record:'Record',
        pause:'Pause',
        resume:'Continuar',
        stop:'Parar',
        recordings:'Recordings',
        noRecordings:'No recordings yet',
        download:'Baixar',
        delete:'Excluir',
        connected:'Conectado',
        disconnected:'Desconectado',
        recordingState:'Recording...',
        pausedState:'Paused',
        success:'Sucesso',
        error:'Erro',
        saved:'Recording saved',
        deleted:'Recording deleted',
        micError:'Microphone access denied',
        deleteConfirm:'Are you sure you want to delete this recording?',
        cancel:'Cancelar'
      }
  };

    function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }
    const locale = ref(getLocale());
    function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

    function getToken() { try { return localStorage.getItem('auth_token') || ''; } catch { return ''; } }
    function authHeaders() { return { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }

    // State
    const recording = ref(false);
    const paused = ref(false);
    const busy = ref(false);
    const elapsed = ref(0);
    const statusMsg = ref('');
    const statusType = ref('');
    const recordings = ref([]);
    const wsConnected = ref(false);
    const currentPlaying = ref('');
    const vizCanvas = ref(null);
    const audioPlayer = ref(null);

    let ws = null;
    let mediaStream = null;
    let audioContext = null;
    let scriptNode = null;
    let sourceNode = null;
    let analyserNode = null;
    let timerInterval = null;
    function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }
    let animFrame = null;
    let sessionId = '';
    const SAMPLE_RATE = 44100;
    const BUFFER_SIZE = 4096;

    function showStatus(msg, type) {
      statusMsg.value = msg;
      statusType.value = type;
      setTimeout(() => { statusMsg.value = ''; }, 4000);
    }

    function formatSize(bytes) {
      if (!bytes && bytes !== 0) return '';
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function formatDate(ms) {
      const d = new Date(ms);
      const pad = n => String(n).padStart(2, '0');
      return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' +
             pad(d.getHours()) + ':' + pad(d.getMinutes());
    }

    function formatTime(sec) {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    // ── WebSocket ──
    function connectWS() {
      const proto = location.protocol === 'https:' ? 'wss' : 'ws';
      ws = new WebSocket(proto + '://' + location.host + '/ws?token=' + encodeURIComponent(getToken()));
      ws.binaryType = 'arraybuffer';

      ws.onopen = () => { wsConnected.value = true; };
      ws.onclose = () => {
        wsConnected.value = false;
        // Reconnect after 3s if component is still alive
        setTimeout(() => { if (localeTimer) connectWS(); }, 3000);
      };
      ws.onmessage = (ev) => {
        if (typeof ev.data === 'string') {
          try {
            const msg = JSON.parse(ev.data);
            if (msg.type === 'audio-rec-saved') {
              showStatus(L('saved') + ' — ' + msg.data.filename, 'success');
              loadRecordings();
            } else if (msg.type === 'audio-rec-error') {
              showStatus(msg.data.error || L('error'), 'error');
            }
          } catch {}
        }
      };
    }

    function sendWS(obj) {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(obj));
      }
    }

    function sendBinary(buffer) {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(buffer);
      }
    }

    // ── Recording ──
    async function startRecording() {
      if (recording.value || busy.value) return;
      busy.value = true;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: { sampleRate: SAMPLE_RATE, channelCount: 1, echoCancellation: true, noiseSuppression: true }
        });
      } catch (e) {
        showStatus(L('micError'), 'error');
        busy.value = false;
        return;
      }

      audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SAMPLE_RATE });
      sourceNode = audioContext.createMediaStreamSource(mediaStream);

      // Analyser for visualization
      analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 256;
      sourceNode.connect(analyserNode);

      // ScriptProcessor to capture raw PCM
      scriptNode = audioContext.createScriptProcessor(BUFFER_SIZE, 1, 1);
      sourceNode.connect(scriptNode);
      scriptNode.connect(audioContext.destination);

      // Generate session ID
      sessionId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      sendWS({ type: 'audio-rec-start', data: { sessionId, sampleRate: audioContext.sampleRate, channels: 1 } });

      scriptNode.onaudioprocess = (e) => {
        if (paused.value) return;
        const pcm = e.inputBuffer.getChannelData(0);
        // Convert Float32 to Int16 for smaller transfer + WAV compatibility
        const int16 = new Int16Array(pcm.length);
        for (let i = 0; i < pcm.length; i++) {
          const s = Math.max(-1, Math.min(1, pcm[i]));
          int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        sendBinary(int16.buffer);
      };

      recording.value = true;
      paused.value = false;
      elapsed.value = 0;
      busy.value = false;

      timerInterval = setInterval(() => {
        if (!paused.value) elapsed.value++;
      }, 1000);

      drawVisualizer();
    }

    function pauseRecording() {
      paused.value = true;
    }

    function resumeRecording() {
      paused.value = false;
    }

    function stopRecording() {
      recording.value = false;
      paused.value = false;
      if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
      if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }

      // Stop audio processing
      if (scriptNode) { scriptNode.disconnect(); scriptNode = null; }
      if (sourceNode) { sourceNode.disconnect(); sourceNode = null; }
      if (analyserNode) { analyserNode.disconnect(); analyserNode = null; }
      if (audioContext) { audioContext.close(); audioContext = null; }
      if (mediaStream) { mediaStream.getTracks().forEach(t => t.stop()); mediaStream = null; }

      sendWS({ type: 'audio-rec-stop', data: { sessionId } });
      clearCanvas();
    }

    // ── Visualizer ──
    function drawVisualizer() {
      if (!analyserNode || !vizCanvas.value) return;
      const canvas = vizCanvas.value;
      const ctx = canvas.getContext('2d');
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      function draw() {
        if (!recording.value) return;
        animFrame = requestAnimationFrame(draw);
        analyserNode.getByteFrequencyData(dataArray);

        ctx.fillStyle = '#111118';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 255;
          const barHeight = v * canvas.height;
          const r = 229 + (v * 20);
          const g = 57 + (v * 100);
          const b = 53;
          ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      }
      draw();
    }

    function clearCanvas() {
      if (!vizCanvas.value) return;
      const ctx = vizCanvas.value.getContext('2d');
      ctx.fillStyle = '#111118';
      ctx.fillRect(0, 0, vizCanvas.value.width, vizCanvas.value.height);
    }

    // ── Recordings management ──
    async function loadRecordings() {
      try {
        const r = await fetch('/api/audio-recorder/list', { headers: authHeaders() });
        if (r.ok) recordings.value = await r.json();
      } catch (e) { console.error('Load recordings error', e); }
    }

    function playRecording(r) {
      if (!audioPlayer.value) return;
      if (currentPlaying.value === r.filename) {
        audioPlayer.value.pause();
        currentPlaying.value = '';
        return;
      }
      audioPlayer.value.src = '/api/audio-recorder/stream/' + encodeURIComponent(r.filename) + '?token=' + encodeURIComponent(getToken());
      audioPlayer.value.play();
      currentPlaying.value = r.filename;
    }

    function downloadRecording(filename) {
      const a = document.createElement('a');
      a.href = '/api/audio-recorder/download/' + encodeURIComponent(filename) + '?token=' + encodeURIComponent(getToken());
      a.download = filename;
      a.click();
    }

    async function deleteRecording(filename) {
      try { await ElMessageBox.confirm(L('deleteConfirm'), { confirmButtonText: 'OK', cancelButtonText: L('cancel') || 'Cancel', type: 'warning' }); } catch { return; }
      try {
        const r = await fetch('/api/audio-recorder/' + encodeURIComponent(filename), {
          method: 'DELETE', headers: authHeaders()
        });
        if (r.ok) {
          showStatus(L('deleted'), 'success');
          if (currentPlaying.value === filename) {
            audioPlayer.value.pause();
            currentPlaying.value = '';
          }
          loadRecordings();
        }
      } catch (e) { showStatus(L('error'), 'error'); }
    }

    onMounted(() => {
      connectWS();
      loadRecordings();
      clearCanvas();
      window.addEventListener('locale-changed', onLocaleChanged);
    });

    onUnmounted(() => {
      window.removeEventListener('locale-changed', onLocaleChanged)
      if (recording.value) stopRecording();
      if (ws) { ws.onclose = null; ws.close(); ws = null; }
    });

    return {
      recording, paused, busy, elapsed, statusMsg, statusType, recordings,
      wsConnected, currentPlaying, vizCanvas, audioPlayer, L,
      startRecording, pauseRecording, resumeRecording, stopRecording,
      playRecording, downloadRecording, deleteRecording,
      formatSize, formatDate, formatTime
    };
  }
})
