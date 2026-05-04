(function(Vue) {
const { ref, computed, onMounted, onUnmounted, watch, nextTick } = Vue;
const { ElMessage, ElMessageBox } = window.ElementPlus || {};

const LANGS = {
  tr: {
    title:'LoopStudio', play:'Oynat', stop:'Durdur', bpm:'BPM',
    addTrack:'Kanal Ekle', removeTrack:'Kanalı Sil',
    mute:'Sessiz', solo:'Solo', volume:'Ses', pan:'Pan',
    samples:'Örnekler', uploadSample:'Örnek Yükle', noSamples:'Örnek yok',
    save:'Kaydet', saveAs:'Farklı Kaydet', load:'Yükle',
    newProject:'Yeni Proje', projectName:'Proje Adı', projects:'Projeler',
    deleteProject:'Projeyi Sil', export:'WAV Aktar', master:'Ana Ses',
    swing:'Swing', clearTrack:'Kanalı Temizle',
    noProject:'Kaydedilmemiş', selectSample:'Örnek Seç', recording:'Kayıtlar',
    music:'Müzik', loading:'Yükleniyor...',
    saved:'Kaydedildi', deleted:'Silindi', error:'Hata', confirm:'Onayla',
    cancel:'İptal', duplicate:'Kopyala', metronome:'Metronom',
    assignSample:'Örnek Ata', uploaded:'Yüklendi',
    deleteConfirm:'Bu projeyi silmek istediğinize emin misiniz?',
    exportingWav:'WAV dışa aktarılıyor...', exportDone:'WAV kaydedildi',
    loopOn:'Döngü Açık', loopOff:'Döngü Kapalı'
  },
  en: {
    title:'LoopStudio', play:'Play', stop:'Stop', bpm:'BPM',
    addTrack:'Add Track', removeTrack:'Remove Track',
    mute:'Mute', solo:'Solo', volume:'Vol', pan:'Pan',
    samples:'Samples', uploadSample:'Upload Sample', noSamples:'No samples',
    save:'Save', saveAs:'Save As', load:'Load',
    newProject:'New Project', projectName:'Project Name', projects:'Projects',
    deleteProject:'Delete Project', export:'Export WAV', master:'Master',
    swing:'Swing', clearTrack:'Clear Track',
    noProject:'Unsaved', selectSample:'Select Sample', recording:'Recordings',
    music:'Music', loading:'Loading...',
    saved:'Saved', deleted:'Deleted', error:'Error', confirm:'Confirm',
    cancel:'Cancel', duplicate:'Duplicate', metronome:'Metronome',
    assignSample:'Assign Sample', uploaded:'Uploaded',
    deleteConfirm:'Are you sure you want to delete this project?',
    exportingWav:'Exporting WAV...', exportDone:'WAV exported',
    loopOn:'Loop On', loopOff:'Loop Off'
  },
  de: {
    title:'LoopStudio', play:'Abspielen', stop:'Stopp', bpm:'BPM',
    addTrack:'Spur hinzufügen', removeTrack:'Spur entfernen',
    mute:'Stumm', solo:'Solo', volume:'Laut', pan:'Pan',
    samples:'Samples', uploadSample:'Sample hochladen', noSamples:'Keine Samples',
    save:'Speichern', saveAs:'Speichern als', load:'Laden',
    newProject:'Neues Projekt', projectName:'Projektname', projects:'Projekte',
    deleteProject:'Projekt löschen', export:'WAV exportieren', master:'Master',
    swing:'Swing', clearTrack:'Spur leeren',
    noProject:'Nicht gespeichert', selectSample:'Sample wählen', recording:'Aufnahmen',
    music:'Musik', loading:'Laden...',
    saved:'Gespeichert', deleted:'Gelöscht', error:'Fehler', confirm:'Bestätigen',
    cancel:'Abbrechen', duplicate:'Duplizieren', metronome:'Metronom',
    assignSample:'Sample zuweisen', uploaded:'Hochgeladen',
    deleteConfirm:'Möchten Sie dieses Projekt wirklich löschen?',
    exportingWav:'WAV wird exportiert...', exportDone:'WAV exportiert',
    loopOn:'Loop An', loopOff:'Loop Aus'
  },
  fr: {
    title:'LoopStudio', play:'Lecture', stop:'Stop', bpm:'BPM',
    addTrack:'Ajouter piste', removeTrack:'Supprimer piste',
    mute:'Muet', solo:'Solo', volume:'Vol', pan:'Pan',
    samples:'Échantillons', uploadSample:'Importer', noSamples:'Aucun échantillon',
    save:'Sauver', saveAs:'Sauver sous', load:'Charger',
    newProject:'Nouveau Projet', projectName:'Nom du projet', projects:'Projets',
    deleteProject:'Supprimer', export:'Exporter WAV', master:'Master',
    swing:'Swing', clearTrack:'Vider la piste',
    noProject:'Non sauvegardé', selectSample:'Choisir', recording:'Enregistrements',
    music:'Musique', loading:'Chargement...',
    saved:'Sauvegardé', deleted:'Supprimé', error:'Erreur', confirm:'Confirmer',
    cancel:'Annuler', duplicate:'Dupliquer', metronome:'Métronome',
    assignSample:'Assigner', uploaded:'Importé',
    deleteConfirm:'Voulez-vous vraiment supprimer ce projet ?',
    exportingWav:'Export WAV en cours...', exportDone:'WAV exporté',
    loopOn:'Boucle activée', loopOff:'Boucle désactivée'
  },
  es: {
    title:'LoopStudio', play:'Reproducir', stop:'Parar', bpm:'BPM',
    addTrack:'Añadir pista', removeTrack:'Eliminar pista',
    mute:'Silenciar', solo:'Solo', volume:'Vol', pan:'Pan',
    samples:'Muestras', uploadSample:'Subir muestra', noSamples:'Sin muestras',
    save:'Guardar', saveAs:'Guardar como', load:'Cargar',
    newProject:'Nuevo Proyecto', projectName:'Nombre', projects:'Proyectos',
    deleteProject:'Eliminar proyecto', export:'Exportar WAV', master:'Master',
    swing:'Swing', clearTrack:'Limpiar pista',
    noProject:'Sin guardar', selectSample:'Seleccionar', recording:'Grabaciones',
    music:'Música', loading:'Cargando...',
    saved:'Guardado', deleted:'Eliminado', error:'Error', confirm:'Confirmar',
    cancel:'Cancelar', duplicate:'Duplicar', metronome:'Metrónomo',
    assignSample:'Asignar', uploaded:'Subido',
    deleteConfirm:'¿Seguro que desea eliminar este proyecto?',
    exportingWav:'Exportando WAV...', exportDone:'WAV exportado',
    loopOn:'Bucle activado', loopOff:'Bucle desactivado'
  }
};

LANGS.ru = { ...LANGS.en, title:'LoopStudio' };
LANGS.zh = { ...LANGS.en, title:'LoopStudio' };
LANGS.ja = { ...LANGS.en, title:'LoopStudio' };
LANGS.it = { ...LANGS.en, title:'LoopStudio' };
LANGS.ar = { ...LANGS.en, title:'LoopStudio' };
LANGS.ko = { ...LANGS.en, title:'LoopStudio' };
LANGS.hi = { ...LANGS.en, title:'LoopStudio' };
LANGS.pt = { ...LANGS.en, title:'LoopStudio' };

function getToken() { return localStorage.getItem('auth_token') || ''; }
function authHeaders() { return { 'Authorization': 'Bearer ' + getToken() }; }
function getLang() {
  const loc = (localStorage.getItem('sys_locale') || 'en').toLowerCase().slice(0, 2);
  return LANGS[loc] || LANGS.en;
}

return {
  setup() {
    const L = getLang();
    const SAMPLE_RATE = 44100;
    const DEFAULT_STEPS = 16;

    // ── State ──
    const playing = ref(false);
    const bpm = ref(120);
    const swing = ref(0);
    const masterVol = ref(0.8);
    const currentStep = ref(-1);
    const stepCount = ref(DEFAULT_STEPS);
    const loopEnabled = ref(true);
    const metronome = ref(false);
    const projectName = ref('');
    const dirty = ref(false);

    const tracks = ref([]);
    const samples = ref([]);
    const projects = ref([]);
    const showSamplePicker = ref(false);
    const samplePickerTrack = ref(-1);
    const sampleTab = ref('uploaded');
    const musicFiles = ref([]);
    const recordingFiles = ref([]);
    const uploading = ref(false);
    const busyText = ref('');
    const showProjectDialog = ref(false);
    const exportBusy = ref(false);

    let audioCtx = null;
    let schedulerTimer = null;
    let nextStepTime = 0;
    let currentScheduledStep = 0;
    const trackBuffers = {};
    const activeNodes = [];

    const TRACK_COLORS = ['#e74c3c','#3498db','#2ecc71','#f1c40f','#9b59b6','#e67e22','#1abc9c','#e91e63'];

    // ── Track Factory ──
    function createTrack(name, sampleUrl, sampleName) {
      return {
        id: Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        name: name || 'Track ' + (tracks.value.length + 1),
        sampleUrl: sampleUrl || '',
        sampleName: sampleName || '',
        steps: Array.from({ length: stepCount.value }, () => ({ on: false, velocity: 1.0 })),
        volume: 0.8,
        pan: 0,
        mute: false,
        solo: false,
        color: TRACK_COLORS[tracks.value.length % TRACK_COLORS.length]
      };
    }

    function initDefaults() {
      tracks.value = [
        createTrack('Kick'), createTrack('Snare'),
        createTrack('HiHat'), createTrack('Clap')
      ];
      projectName.value = '';
      dirty.value = false;
    }

    // ── Audio Engine ──
    function ensureAudioCtx() {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SAMPLE_RATE });
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return audioCtx;
    }

    async function loadSampleBuffer(url) {
      if (trackBuffers[url]) return trackBuffers[url];
      try {
        const resp = await fetch(url, { headers: authHeaders() });
        const ab = await resp.arrayBuffer();
        const decoded = await ensureAudioCtx().decodeAudioData(ab);
        trackBuffers[url] = decoded;
        return decoded;
      } catch (e) {
        console.warn('Failed to load sample:', url, e);
        return null;
      }
    }

    function getStepDuration() { return 60 / bpm.value / 4; }

    function startPlayback() {
      if (playing.value) return;
      ensureAudioCtx();
      playing.value = true;
      currentScheduledStep = currentStep.value >= 0 ? currentStep.value : 0;
      nextStepTime = audioCtx.currentTime + 0.05;
      scheduler();
    }

    function scheduler() {
      if (!playing.value) return;
      const lookAhead = 0.1;
      while (nextStepTime < audioCtx.currentTime + lookAhead) {
        const step = currentScheduledStep % stepCount.value;
        const stepDur = getStepDuration();
        let swingOffset = 0;
        if (step % 2 === 1 && swing.value > 0) swingOffset = stepDur * swing.value * 0.5;
        scheduleStep(step, nextStepTime + swingOffset);
        currentStep.value = step;
        nextStepTime += stepDur;
        currentScheduledStep++;
        if (!loopEnabled.value && currentScheduledStep >= stepCount.value) {
          stopPlayback();
          return;
        }
      }
      schedulerTimer = setTimeout(scheduler, 25);
    }

    function scheduleStep(step, time) {
      const ctx = audioCtx;
      const hasSolo = tracks.value.some(t => t.solo);
      for (const track of tracks.value) {
        if (track.mute) continue;
        if (hasSolo && !track.solo) continue;
        const s = track.steps[step];
        if (s && s.on && track.sampleUrl) {
          const buf = trackBuffers[track.sampleUrl];
          if (!buf) continue;
          const source = ctx.createBufferSource();
          source.buffer = buf;
          const gain = ctx.createGain();
          gain.gain.value = track.volume * s.velocity * masterVol.value;
          const pan = ctx.createStereoPanner();
          pan.pan.value = track.pan;
          source.connect(gain);
          gain.connect(pan);
          pan.connect(ctx.destination);
          source.start(time);
          activeNodes.push(source);
          source.onended = () => {
            const idx = activeNodes.indexOf(source);
            if (idx >= 0) activeNodes.splice(idx, 1);
          };
        }
      }
      if (metronome.value) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.value = step % 4 === 0 ? 1000 : 800;
        g.gain.setValueAtTime(0.12, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(time); osc.stop(time + 0.05);
      }
    }

    function stopPlayback() {
      playing.value = false;
      if (schedulerTimer) { clearTimeout(schedulerTimer); schedulerTimer = null; }
      currentStep.value = -1;
      currentScheduledStep = 0;
      for (const n of activeNodes) { try { n.stop(); } catch (e) {} }
      activeNodes.length = 0;
    }

    function togglePlay() {
      if (playing.value) stopPlayback(); else startPlayback();
    }

    // ── Step Operations ──
    function toggleStep(trackIdx, stepIdx) {
      const s = tracks.value[trackIdx].steps[stepIdx];
      s.on = !s.on;
      if (s.on) s.velocity = 1.0;
      dirty.value = true;
    }

    function setStepVelocity(trackIdx, stepIdx, vel) {
      tracks.value[trackIdx].steps[stepIdx].velocity = vel;
      dirty.value = true;
    }

    // ── Track Management ──
    function addTrack() { tracks.value.push(createTrack()); dirty.value = true; }
    function removeTrack(idx) { tracks.value.splice(idx, 1); dirty.value = true; }
    function clearTrack(idx) {
      for (const s of tracks.value[idx].steps) { s.on = false; s.velocity = 1.0; }
      dirty.value = true;
    }
    function duplicateTrack(idx) {
      const src = tracks.value[idx];
      const dup = createTrack(src.name + ' (copy)', src.sampleUrl, src.sampleName);
      dup.steps = src.steps.map(s => ({ ...s }));
      dup.volume = src.volume; dup.pan = src.pan; dup.color = src.color;
      tracks.value.splice(idx + 1, 0, dup);
      dirty.value = true;
    }

    // ── Step Count ──
    function setStepCount(count) {
      const old = stepCount.value;
      stepCount.value = count;
      for (const track of tracks.value) {
        if (count > old) {
          for (let i = old; i < count; i++) track.steps.push({ on: false, velocity: 1.0 });
        } else {
          track.steps.length = count;
        }
      }
      dirty.value = true;
    }

    // ── Sample Management ──
    async function loadSamples() {
      try {
        const r = await fetch('/api/loopstudio/samples', { headers: authHeaders() });
        if (r.ok) samples.value = await r.json();
      } catch (e) {}
    }

    async function loadMusicFiles() {
      try {
        const r = await fetch('/api/music/files', { headers: authHeaders() });
        if (r.ok) {
          const data = await r.json();
          musicFiles.value = [...(data.public || []), ...(data.user || [])];
        }
      } catch (e) {}
    }

    async function loadRecordings() {
      try {
        const r = await fetch('/api/audio-recorder/list', { headers: authHeaders() });
        if (r.ok) recordingFiles.value = await r.json();
      } catch (e) {}
    }

    function openSamplePicker(trackIdx) {
      samplePickerTrack.value = trackIdx;
      showSamplePicker.value = true;
      loadSamples();
      loadMusicFiles();
      loadRecordings();
    }

    async function assignSample(url, name) {
      const idx = samplePickerTrack.value;
      if (idx < 0 || idx >= tracks.value.length) return;
      tracks.value[idx].sampleUrl = url;
      tracks.value[idx].sampleName = name;
      showSamplePicker.value = false;
      dirty.value = true;
      await loadSampleBuffer(url);
    }

    async function assignMusicFile(file) {
      await assignSample(file.url, file.name || file.filename);
    }

    async function assignRecording(rec) {
      const url = '/api/audio-recorder/stream/' + encodeURIComponent(rec.filename);
      await assignSample(url, rec.filename);
    }

    async function assignUploadedSample(s) {
      await assignSample(s.url, s.name || s.filename);
    }

    async function uploadSamples() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.wav,.mp3,.ogg,.flac';
      input.multiple = true;
      input.onchange = async () => {
        if (!input.files.length) return;
        uploading.value = true;
        const formData = new FormData();
        for (const f of input.files) formData.append('files', f);
        try {
          const res = await fetch('/api/loopstudio/samples/upload', {
            method: 'POST',
            headers: authHeaders(),
            body: formData
          });
          if (res.ok) {
            const data = await res.json();
            if (ElMessage) ElMessage.success(L.uploaded + ' (' + (data.files || []).length + ')');
            await loadSamples();
          }
        } catch (e) {
          if (ElMessage) ElMessage.error(L.error);
        }
        uploading.value = false;
      };
      input.click();
    }

    async function deleteSample(s) {
      try {
        await fetch('/api/loopstudio/samples/' + encodeURIComponent(s.filename), {
          method: 'DELETE', headers: authHeaders()
        });
        await loadSamples();
      } catch (e) {}
    }

    // ── Project Management ──
    function getProjectData() {
      return {
        bpm: bpm.value, swing: swing.value, masterVol: masterVol.value,
        stepCount: stepCount.value, loopEnabled: loopEnabled.value, metronome: metronome.value,
        tracks: tracks.value.map(t => ({
          id: t.id, name: t.name, sampleUrl: t.sampleUrl, sampleName: t.sampleName,
          steps: t.steps, volume: t.volume, pan: t.pan, mute: t.mute, solo: t.solo, color: t.color
        }))
      };
    }

    function loadProjectData(data) {
      bpm.value = data.bpm || 120;
      swing.value = data.swing || 0;
      masterVol.value = data.masterVol != null ? data.masterVol : 0.8;
      stepCount.value = data.stepCount || 16;
      loopEnabled.value = data.loopEnabled !== false;
      metronome.value = !!data.metronome;
      tracks.value = (data.tracks || []).map(function(t) {
        return {
          id: t.id, name: t.name, sampleUrl: t.sampleUrl, sampleName: t.sampleName,
          steps: (t.steps || []).map(function(s) { return { on: !!s.on, velocity: s.velocity != null ? s.velocity : 1.0 }; }),
          volume: t.volume, pan: t.pan, mute: t.mute, solo: t.solo, color: t.color
        };
      });
      for (var i = 0; i < tracks.value.length; i++) {
        if (tracks.value[i].sampleUrl) loadSampleBuffer(tracks.value[i].sampleUrl);
      }
      dirty.value = false;
    }

    async function loadProjects() {
      try {
        const r = await fetch('/api/loopstudio/projects', { headers: authHeaders() });
        if (r.ok) projects.value = await r.json();
      } catch (e) {}
    }

    async function saveProject(name) {
      if (!name) return;
      try {
        const r = await fetch('/api/loopstudio/projects/' + encodeURIComponent(name), {
          method: 'PUT',
          headers: { ...authHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify(getProjectData())
        });
        if (r.ok) {
          projectName.value = name;
          dirty.value = false;
          if (ElMessage) ElMessage.success(L.saved);
          await loadProjects();
        }
      } catch (e) {
        if (ElMessage) ElMessage.error(L.error);
      }
    }

    async function saveCurrentProject() {
      if (projectName.value) await saveProject(projectName.value);
      else saveProjectAs();
    }

    async function saveProjectAs() {
      try {
        const result = await ElMessageBox.prompt(L.projectName, L.saveAs, {
          confirmButtonText: L.confirm,
          cancelButtonText: L.cancel,
          inputValue: projectName.value || ''
        });
        if (result.value && result.value.trim()) await saveProject(result.value.trim());
      } catch (e) {}
    }

    async function openProject(name) {
      try {
        const r = await fetch('/api/loopstudio/projects/' + encodeURIComponent(name), { headers: authHeaders() });
        if (r.ok) {
          const data = await r.json();
          loadProjectData(data);
          projectName.value = name;
          showProjectDialog.value = false;
        }
      } catch (e) {
        if (ElMessage) ElMessage.error(L.error);
      }
    }

    async function deleteProject(name) {
      try {
        await ElMessageBox.confirm(L.deleteConfirm, L.deleteProject, {
          confirmButtonText: L.confirm, cancelButtonText: L.cancel, type: 'warning'
        });
        await fetch('/api/loopstudio/projects/' + encodeURIComponent(name), {
          method: 'DELETE', headers: authHeaders()
        });
        if (ElMessage) ElMessage.success(L.deleted);
        await loadProjects();
        if (projectName.value === name) { projectName.value = ''; dirty.value = true; }
      } catch (e) {}
    }

    function newProject() {
      if (playing.value) stopPlayback();
      initDefaults();
    }

    // ── WAV Export ──
    function audioBufferToWav(buffer) {
      var numCh = buffer.numberOfChannels, sr = buffer.sampleRate;
      var blockAlign = numCh * 2, dataLen = buffer.length * blockAlign;
      var ab = new ArrayBuffer(44 + dataLen), v = new DataView(ab);
      function ws(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
      ws(0,'RIFF'); v.setUint32(4, 36 + dataLen, true); ws(8,'WAVE');
      ws(12,'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
      v.setUint16(22, numCh, true); v.setUint32(24, sr, true);
      v.setUint32(28, sr * blockAlign, true); v.setUint16(32, blockAlign, true);
      v.setUint16(34, 16, true); ws(36,'data'); v.setUint32(40, dataLen, true);
      var channels = [];
      for (var c = 0; c < numCh; c++) channels.push(buffer.getChannelData(c));
      var off = 44;
      for (var i = 0; i < buffer.length; i++) {
        for (var c = 0; c < numCh; c++) {
          var s = Math.max(-1, Math.min(1, channels[c][i]));
          v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
          off += 2;
        }
      }
      return new Blob([ab], { type: 'audio/wav' });
    }

    async function exportWav() {
      exportBusy.value = true;
      busyText.value = L.exportingWav;
      try {
        var totalDur = stepCount.value * getStepDuration() + 1;
        var offCtx = new OfflineAudioContext(2, SAMPLE_RATE * totalDur, SAMPLE_RATE);
        var hasSolo = tracks.value.some(function(t) { return t.solo; });
        for (var step = 0; step < stepCount.value; step++) {
          var stepTime = step * getStepDuration();
          for (var ti = 0; ti < tracks.value.length; ti++) {
            var track = tracks.value[ti];
            if (track.mute) continue;
            if (hasSolo && !track.solo) continue;
            var s = track.steps[step];
            if (s && s.on && track.sampleUrl) {
              var buf = trackBuffers[track.sampleUrl];
              if (!buf) continue;
              var source = offCtx.createBufferSource();
              source.buffer = buf;
              var gain = offCtx.createGain();
              gain.gain.value = track.volume * s.velocity * masterVol.value;
              var pan = offCtx.createStereoPanner();
              pan.pan.value = track.pan;
              source.connect(gain); gain.connect(pan); pan.connect(offCtx.destination);
              source.start(stepTime);
            }
          }
        }
        var rendered = await offCtx.startRendering();
        var wavBlob = audioBufferToWav(rendered);
        var fname = (projectName.value || 'loopstudio-export') + '.wav';
        var formData = new FormData();
        formData.append('file', wavBlob, fname);
        var r = await fetch('/api/audio-editor/save-music', {
          method: 'POST', headers: authHeaders(), body: formData
        });
        if (r.ok && ElMessage) ElMessage.success(L.exportDone);
      } catch (e) {
        console.error('Export error:', e);
        if (ElMessage) ElMessage.error(L.error);
      }
      exportBusy.value = false;
      busyText.value = '';
    }

    // ── Lifecycle ──
    onMounted(function() {
      initDefaults();
      loadSamples();
      loadProjects();
    });

    onUnmounted(function() {
      stopPlayback();
      if (audioCtx) { audioCtx.close(); audioCtx = null; }
    });

    return {
      L, playing, bpm, swing, masterVol, currentStep, stepCount,
      loopEnabled, metronome, projectName, dirty, tracks,
      samples, projects, showSamplePicker, samplePickerTrack,
      sampleTab, musicFiles, recordingFiles, uploading,
      busyText, showProjectDialog, exportBusy,
      togglePlay, toggleStep, setStepVelocity,
      addTrack, removeTrack, clearTrack, duplicateTrack,
      setStepCount, openSamplePicker, assignSample, assignMusicFile,
      assignRecording, assignUploadedSample, uploadSamples, deleteSample,
      saveCurrentProject, saveProjectAs, openProject, deleteProject,
      newProject, exportWav, loadProjects, loadSamples, loadMusicFiles, loadRecordings
    };
  }
};
})(Vue)
