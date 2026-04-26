(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, watch, nextTick } = Vue;
  const { useVolumeStore } = window.__volumeStore || {};

  return {
    setup() {
      const volStore = typeof useVolumeStore === 'function' ? useVolumeStore() : null;
      const tracks = ref([]);
      const index = ref(-1);
      const playing = ref(false);
      const elapsed = ref(0);
      const duration = ref(0);
      const volume = ref(volStore ? volStore.level : parseInt(localStorage.getItem('mp_volume') ?? '80', 10));
      const loading = ref(true);
      const tab = ref('playlist'); // playlist | files
      const availableFiles = ref({ public: [], user: [] });
      const uploading = ref(false);

      // Visualizer state
      const vizActive = ref(false);
      const vizMode = ref('bars'); // bars | wave | circle
      const vizModes = ['bars', 'wave', 'circle'];
      let audioCtx = null;
      let analyser = null;
      let sourceNode = null;
      let vizRafId = null;
      let vizCanvas = null;
      let vizCtx = null;

      let audio = null;
      let rafId = null;

      const currentTrack = computed(() => index.value >= 0 && index.value < tracks.value.length ? tracks.value[index.value] : null);
      const progress = computed(() => duration.value > 0 ? (elapsed.value / duration.value) * 100 : 0);

      function createAudio() {
        if (audio) { audio.pause(); audio.src = ''; }
        audio = new Audio();
        audio.volume = volume.value / 100;
        audio.addEventListener('loadedmetadata', () => { duration.value = audio.duration; });
        audio.addEventListener('ended', () => { next(); });
        audio.addEventListener('error', () => { playing.value = false; });
      }

      function updateTime() {
        if (audio && !audio.paused) {
          elapsed.value = audio.currentTime;
          rafId = requestAnimationFrame(updateTime);
        }
      }

      function play(i) {
        if (i < 0 || i >= tracks.value.length) return;
        index.value = i;
        const track = tracks.value[i];
        if (!audio) createAudio();
        audio.src = track.url;
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        audio.play().then(() => {
          playing.value = true;
          rafId = requestAnimationFrame(updateTime);
        }).catch(() => {});
      }

      function toggle() {
        if (!audio || index.value < 0) {
          if (tracks.value.length) play(0);
          return;
        }
        if (audio.paused) {
          audio.play().then(() => {
            playing.value = true;
            rafId = requestAnimationFrame(updateTime);
          }).catch(() => {});
        } else {
          audio.pause();
          playing.value = false;
          if (rafId) cancelAnimationFrame(rafId);
        }
      }

      function next() {
        if (!tracks.value.length) return;
        play((index.value + 1) % tracks.value.length);
      }

      function prev() {
        if (!tracks.value.length) return;
        if (audio && audio.currentTime > 3) {
          audio.currentTime = 0;
          elapsed.value = 0;
          return;
        }
        play((index.value - 1 + tracks.value.length) % tracks.value.length);
      }

      function seek(e) {
        if (!audio || !duration.value) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        audio.currentTime = pct * duration.value;
        elapsed.value = audio.currentTime;
      }

      function setVolume(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        volume.value = Math.round(pct * 100);
        if (audio) audio.volume = volume.value / 100;
        localStorage.setItem('mp_volume', volume.value);
        if (volStore) volStore.setLevel(volume.value);
      }

      // Watch system volume store
      if (volStore) {
        watch(() => volStore.effectiveLevel, (lvl) => {
          volume.value = lvl;
          if (audio) audio.volume = lvl / 100;
        });
      }

      // ── Media source registration ──
      const mediaHandlers = volStore ? {
        toggle,
        next,
        prev,
        seekFwd(sec) { if (audio && isFinite(audio.duration)) { audio.currentTime = Math.min(audio.duration, audio.currentTime + sec); elapsed.value = audio.currentTime; } },
        seekBack(sec) { if (audio) { audio.currentTime = Math.max(0, audio.currentTime - sec); elapsed.value = audio.currentTime; } }
      } : null;

      function syncMediaState() {
        if (!volStore) return;
        const title = currentTrack.value ? currentTrack.value.title : '';
        volStore.updateMediaState(playing.value, title);
      }

      // Sync media state to volume store whenever playing or track changes
      if (volStore) {
        watch([playing, index], () => { syncMediaState(); });
      }

      function formatTime(s) {
        if (!s || !isFinite(s)) return '0:00';
        const m = Math.floor(s / 60);
        return m + ':' + String(Math.floor(s % 60)).padStart(2, '0');
      }

      // ── Playlist management ──
      async function loadPlaylist() {
        try {
          const res = await fetch('/api/music/playlist');
          if (res.ok) tracks.value = await res.json();
        } catch {}
      }

      async function savePlaylist() {
        try {
          await fetch('/api/music/playlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playlist: tracks.value })
          });
        } catch {}
      }

      async function loadFiles() {
        try {
          const res = await fetch('/api/music/files');
          if (res.ok) availableFiles.value = await res.json();
        } catch {}
      }

      function addToPlaylist(file, source) {
        const exists = tracks.value.some(t => t.url === file.url);
        if (exists) return;
        tracks.value.push({
          title: file.name,
          filename: file.filename,
          url: file.url,
          source,
          icon: source === 'public' ? '🌐' : '👤'
        });
        savePlaylist();
      }

      function removeFromPlaylist(i) {
        const wasPlaying = i === index.value;
        tracks.value.splice(i, 1);
        if (wasPlaying) {
          if (audio) { audio.pause(); audio.src = ''; }
          playing.value = false;
          index.value = -1;
          elapsed.value = 0;
          duration.value = 0;
        } else if (i < index.value) {
          index.value--;
        }
        savePlaylist();
      }

      function moveTrack(from, to) {
        if (to < 0 || to >= tracks.value.length) return;
        const item = tracks.value.splice(from, 1)[0];
        tracks.value.splice(to, 0, item);
        if (index.value === from) index.value = to;
        else if (from < index.value && to >= index.value) index.value--;
        else if (from > index.value && to <= index.value) index.value++;
        savePlaylist();
      }

      // ── File upload ──
      function triggerUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.mp3,.wav,.ogg,.flac,.aac,.m4a,.webm';
        input.multiple = true;
        input.onchange = async () => {
          if (!input.files.length) return;
          uploading.value = true;
          const formData = new FormData();
          for (const f of input.files) formData.append('files', f);
          try {
            const res = await fetch('/api/music/upload', { method: 'POST', body: formData });
            if (res.ok) {
              await loadFiles();
            }
          } catch {}
          uploading.value = false;
        };
        input.click();
      }

      async function deleteFile(file) {
        try {
          await fetch('/api/music/file/' + encodeURIComponent(file.filename), { method: 'DELETE' });
          // Remove from playlist if present
          tracks.value = tracks.value.filter(t => t.url !== file.url);
          savePlaylist();
          await loadFiles();
        } catch {}
      }

      function isInPlaylist(file) {
        return tracks.value.some(t => t.url === file.url);
      }

      // ── Visualizer ──
      function ensureAudioContext() {
        if (audioCtx) return;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.8;
        if (audio) {
          sourceNode = audioCtx.createMediaElementSource(audio);
          sourceNode.connect(analyser);
          analyser.connect(audioCtx.destination);
        }
      }

      function toggleVisualizer() {
        vizActive.value = !vizActive.value;
        if (vizActive.value) {
          ensureAudioContext();
          if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
          nextTick(() => {
            const el = document.querySelector('.mp-viz-canvas');
            if (el) {
              vizCanvas = el;
              vizCtx = el.getContext('2d');
              resizeVizCanvas();
              drawViz();
            }
          });
        } else {
          if (vizRafId) { cancelAnimationFrame(vizRafId); vizRafId = null; }
        }
      }

      function cycleVizMode() {
        const i = vizModes.indexOf(vizMode.value);
        vizMode.value = vizModes[(i + 1) % vizModes.length];
      }

      function resizeVizCanvas() {
        if (!vizCanvas) return;
        const parent = vizCanvas.parentElement;
        if (!parent) return;
        vizCanvas.width = parent.clientWidth;
        vizCanvas.height = parent.clientHeight;
      }

      function drawViz() {
        if (!vizActive.value || !analyser || !vizCtx || !vizCanvas) return;
        vizRafId = requestAnimationFrame(drawViz);
        const w = vizCanvas.width;
        const h = vizCanvas.height;
        const bufLen = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufLen);

        vizCtx.clearRect(0, 0, w, h);

        if (vizMode.value === 'bars') {
          analyser.getByteFrequencyData(dataArray);
          const barCount = Math.min(bufLen, 128);
          const barW = w / barCount;
          for (let i = 0; i < barCount; i++) {
            const val = dataArray[i] / 255;
            const barH = val * h * 0.9;
            const hue = (i / barCount) * 120 + 140;
            vizCtx.fillStyle = `hsla(${hue}, 85%, 55%, 0.85)`;
            vizCtx.fillRect(i * barW, h - barH, barW - 1, barH);
            // Mirror glow on top
            vizCtx.fillStyle = `hsla(${hue}, 85%, 55%, 0.15)`;
            vizCtx.fillRect(i * barW, h - barH - barH * 0.08, barW - 1, barH * 0.08);
          }
        } else if (vizMode.value === 'wave') {
          analyser.getByteTimeDomainData(dataArray);
          vizCtx.lineWidth = 2.5;
          vizCtx.strokeStyle = '#38ef7d';
          vizCtx.shadowColor = '#38ef7d';
          vizCtx.shadowBlur = 12;
          vizCtx.beginPath();
          const sliceW = w / bufLen;
          for (let i = 0; i < bufLen; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * h) / 2;
            if (i === 0) vizCtx.moveTo(0, y);
            else vizCtx.lineTo(i * sliceW, y);
          }
          vizCtx.lineTo(w, h / 2);
          vizCtx.stroke();
          vizCtx.shadowBlur = 0;
        } else if (vizMode.value === 'circle') {
          analyser.getByteFrequencyData(dataArray);
          const cx = w / 2, cy = h / 2;
          const radius = Math.min(w, h) * 0.25;
          const bars = Math.min(bufLen, 180);
          for (let i = 0; i < bars; i++) {
            const val = dataArray[i] / 255;
            const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
            const len = val * radius * 0.9 + 4;
            const x1 = cx + Math.cos(angle) * radius;
            const y1 = cy + Math.sin(angle) * radius;
            const x2 = cx + Math.cos(angle) * (radius + len);
            const y2 = cy + Math.sin(angle) * (radius + len);
            const hue = (i / bars) * 360;
            vizCtx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.8)`;
            vizCtx.lineWidth = 2;
            vizCtx.beginPath();
            vizCtx.moveTo(x1, y1);
            vizCtx.lineTo(x2, y2);
            vizCtx.stroke();
          }
          // Inner circle
          vizCtx.beginPath();
          vizCtx.arc(cx, cy, radius - 2, 0, Math.PI * 2);
          vizCtx.strokeStyle = 'rgba(56,239,125,0.3)';
          vizCtx.lineWidth = 1.5;
          vizCtx.stroke();
        }
      }

      let vizResizeHandler = null;

      onMounted(async () => {
        createAudio();
        await loadPlaylist();
        await loadFiles();
        loading.value = false;
        if (volStore && mediaHandlers) volStore.registerMedia(mediaHandlers);
        vizResizeHandler = () => resizeVizCanvas();
        window.addEventListener('resize', vizResizeHandler);
      });

      // ── URL link ──
      const linkUrl = ref('');

      function addFromUrl() {
        const url = linkUrl.value.trim();
        if (!url) return;
        if (tracks.value.some(t => t.url === url)) { linkUrl.value = ''; return; }
        let name = url;
        try { name = decodeURIComponent(url.split('/').pop().split('?')[0].replace(/\.[^.]+$/, '')); } catch {}
        tracks.value.push({ title: name || 'URL Parça', filename: '', url, source: 'url', icon: '🔗' });
        linkUrl.value = '';
        savePlaylist();
      }

      onUnmounted(() => {
        if (audio) { audio.pause(); audio.src = ''; audio = null; }
        if (rafId) cancelAnimationFrame(rafId);
        if (vizRafId) cancelAnimationFrame(vizRafId);
        if (vizResizeHandler) window.removeEventListener('resize', vizResizeHandler);
        if (audioCtx) { audioCtx.close().catch(() => {}); audioCtx = null; }
        if (volStore && mediaHandlers) volStore.unregisterMedia(mediaHandlers);
      });

      return {
        tracks, index, playing, elapsed, duration, volume, loading,
        tab, availableFiles, uploading, linkUrl,
        currentTrack, progress,
        vizActive, vizMode,
        play, toggle, next, prev, seek, setVolume, formatTime,
        addToPlaylist, removeFromPlaylist, moveTrack,
        triggerUpload, deleteFile, isInPlaylist, addFromUrl,
        toggleVisualizer, cycleVizMode
      };
    }
  };
})(Vue);
