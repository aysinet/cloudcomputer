(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, watch } = Vue;
  const { useVolumeStore } = window.__volumeStore || {};

  return {
    setup() {
      const volStore = typeof useVolumeStore === 'function' ? useVolumeStore() : null;
      const tracks = ref([]);
      const index = ref(-1);
      const playing = ref(false);
      const elapsed = ref(0);
      const duration = ref(0);
      const volume = ref(volStore ? volStore.level : parseInt(localStorage.getItem('vp_volume') ?? '80', 10));
      const muted = ref(volStore ? volStore.muted : false);
      const loadingInit = ref(true);
      const tab = ref('playlist');
      const availableFiles = ref({ public: [], user: [] });
      const uploading = ref(false);
      const showControls = ref(true);
      const videoEl = ref(null);

      let hideTimer = null;

      const currentTrack = computed(() => index.value >= 0 && index.value < tracks.value.length ? tracks.value[index.value] : null);
      const progress = computed(() => duration.value > 0 ? (elapsed.value / duration.value) * 100 : 0);

      function onMeta() {
        if (videoEl.value) duration.value = videoEl.value.duration;
      }
      function onTime() {
        if (videoEl.value) elapsed.value = videoEl.value.currentTime;
      }
      function onError() { playing.value = false; }

      function play(i) {
        if (i < 0 || i >= tracks.value.length) return;
        index.value = i;
        const v = videoEl.value;
        if (!v) return;
        v.src = tracks.value[i].url;
        v.volume = volume.value / 100;
        v.muted = muted.value;
        v.play().then(() => { playing.value = true; startHideTimer(); }).catch(() => {});
      }

      function toggle() {
        const v = videoEl.value;
        if (!v || index.value < 0) {
          if (tracks.value.length) play(0);
          return;
        }
        if (v.paused) {
          v.play().then(() => { playing.value = true; startHideTimer(); }).catch(() => {});
        } else {
          v.pause();
          playing.value = false;
          showControls.value = true;
        }
      }

      function next() {
        if (!tracks.value.length) return;
        play((index.value + 1) % tracks.value.length);
      }

      function prev() {
        if (!tracks.value.length) return;
        const v = videoEl.value;
        if (v && v.currentTime > 3) { v.currentTime = 0; elapsed.value = 0; return; }
        play((index.value - 1 + tracks.value.length) % tracks.value.length);
      }

      function seek(e) {
        const v = videoEl.value;
        if (!v || !duration.value) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        v.currentTime = pct * duration.value;
        elapsed.value = v.currentTime;
      }

      function setVolume(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        volume.value = Math.round(pct * 100);
        if (videoEl.value) { videoEl.value.volume = volume.value / 100; videoEl.value.muted = false; }
        muted.value = false;
        localStorage.setItem('vp_volume', volume.value);
        if (volStore) volStore.setLevel(volume.value);
      }

      function toggleMute() {
        muted.value = !muted.value;
        if (videoEl.value) videoEl.value.muted = muted.value;
        if (volStore) { if (muted.value) volStore.muted = true; else volStore.muted = false; }
      }

      // Watch system volume store
      if (volStore) {
        watch(() => volStore.effectiveLevel, (lvl) => {
          volume.value = lvl;
          muted.value = volStore.muted;
          if (videoEl.value) { videoEl.value.volume = lvl / 100; videoEl.value.muted = volStore.muted; }
        });
      }

      // ── Media source registration ──
      const mediaHandlers = volStore ? {
        toggle,
        next,
        prev,
        seekFwd(sec) { const v = videoEl.value; if (v && isFinite(v.duration)) { v.currentTime = Math.min(v.duration, v.currentTime + sec); elapsed.value = v.currentTime; } },
        seekBack(sec) { const v = videoEl.value; if (v) { v.currentTime = Math.max(0, v.currentTime - sec); elapsed.value = v.currentTime; } }
      } : null;

      function syncMediaState() {
        if (!volStore) return;
        const title = currentTrack.value ? currentTrack.value.title : '';
        volStore.updateMediaState(playing.value, title);
      }

      if (volStore) {
        watch([playing, index], () => { syncMediaState(); });
      }

      function toggleFullscreen() {
        const el = videoEl.value?.closest('.vp-player');
        if (!el) return;
        if (document.fullscreenElement) document.exitFullscreen();
        else el.requestFullscreen().catch(() => {});
      }

      function startHideTimer() {
        showControls.value = true;
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(() => { if (playing.value) showControls.value = false; }, 3000);
      }

      function formatTime(s) {
        if (!s || !isFinite(s)) return '0:00';
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = Math.floor(s % 60);
        if (h > 0) return h + ':' + String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
        return m + ':' + String(sec).padStart(2, '0');
      }

      function formatSize(bytes) {
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
      }

      // Playlist
      async function loadPlaylist() {
        try {
          const res = await fetch('/api/video/playlist');
          if (res.ok) tracks.value = await res.json();
        } catch {}
      }

      async function savePlaylist() {
        try {
          await fetch('/api/video/playlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playlist: tracks.value })
          });
        } catch {}
      }

      async function loadFiles() {
        try {
          const res = await fetch('/api/video/files');
          if (res.ok) availableFiles.value = await res.json();
        } catch {}
      }

      function addToPlaylist(file, source) {
        if (tracks.value.some(t => t.url === file.url)) return;
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
          const v = videoEl.value;
          if (v) { v.pause(); v.src = ''; }
          playing.value = false;
          index.value = -1;
          elapsed.value = 0;
          duration.value = 0;
        } else if (i < index.value) { index.value--; }
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

      function isInPlaylist(file) { return tracks.value.some(t => t.url === file.url); }

      function triggerUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.mp4,.webm,.mkv,.avi,.mov,.ogv';
        input.multiple = true;
        input.onchange = async () => {
          if (!input.files.length) return;
          uploading.value = true;
          const fd = new FormData();
          for (const f of input.files) fd.append('files', f);
          try {
            const res = await fetch('/api/video/upload', { method: 'POST', body: fd });
            if (res.ok) await loadFiles();
          } catch {}
          uploading.value = false;
        };
        input.click();
      }

      async function deleteFile(file) {
        try {
          await fetch('/api/video/file/' + encodeURIComponent(file.filename), { method: 'DELETE' });
          tracks.value = tracks.value.filter(t => t.url !== file.url);
          savePlaylist();
          await loadFiles();
        } catch {}
      }

      // Mouse move shows controls
      function onMouseMove() { startHideTimer(); }

      onMounted(async () => {
        await loadPlaylist();
        await loadFiles();
        loadingInit.value = false;
        if (volStore && mediaHandlers) volStore.registerMedia(mediaHandlers);
        // Add mousemove listener to player area
        setTimeout(() => {
          const el = videoEl.value?.closest('.vp-player');
          if (el) el.addEventListener('mousemove', onMouseMove);
        }, 100);
      });

      // ── URL link ──
      const linkUrl = ref('');

      function addFromUrl() {
        const url = linkUrl.value.trim();
        if (!url) return;
        if (tracks.value.some(t => t.url === url)) { linkUrl.value = ''; return; }
        let name = url;
        try { name = decodeURIComponent(url.split('/').pop().split('?')[0].replace(/\.[^.]+$/, '')); } catch {}
        tracks.value.push({ title: name || 'URL Video', filename: '', url, source: 'url', icon: '🔗' });
        linkUrl.value = '';
        savePlaylist();
      }

      onUnmounted(() => {
        const v = videoEl.value;
        if (v) { v.pause(); v.src = ''; }
        if (hideTimer) clearTimeout(hideTimer);
        const el = v?.closest('.vp-player');
        if (el) el.removeEventListener('mousemove', onMouseMove);
        if (volStore && mediaHandlers) volStore.unregisterMedia(mediaHandlers);
      });

      return {
        tracks, index, playing, elapsed, duration, volume, muted, loadingInit,
        tab, availableFiles, uploading, showControls, videoEl, linkUrl,
        currentTrack, progress,
        play, toggle, next, prev, seek, setVolume, toggleMute, toggleFullscreen,
        onMeta, onTime, onError,
        formatTime, formatSize,
        addToPlaylist, removeFromPlaylist, moveTrack, isInPlaylist,
        triggerUpload, deleteFile, addFromUrl
      };
    }
  };
})(Vue);
