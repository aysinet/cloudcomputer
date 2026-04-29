(function(Vue) {
  const { ref, computed, onMounted, onUnmounted } = Vue;

  const LANGS = {
    tr: { break:'Mola', focus:'Odaklan', session:'Oturum', min:'dk', focusLabel:'Odak:', breakLabel:'Mola:' },
    en: { break:'Break', focus:'Focus', session:'Session', min:'min', focusLabel:'Focus:', breakLabel:'Break:' },
    de: { break:'Pause', focus:'Fokus', session:'Sitzung', min:'Min', focusLabel:'Fokus:', breakLabel:'Pause:' },
    fr: { break:'Pause', focus:'Concentration', session:'Session', min:'min', focusLabel:'Focus :', breakLabel:'Pause :' },
    es: { break:'Descanso', focus:'Enfoque', session:'Sesión', min:'min', focusLabel:'Enfoque:', breakLabel:'Descanso:' },
    ru: { break:'Перерыв', focus:'Фокус', session:'Сессия', min:'мин', focusLabel:'Фокус:', breakLabel:'Перерыв:' },
    zh: { break:'休息', focus:'专注', session:'会话', min:'分钟', focusLabel:'专注:', breakLabel:'休息:' },
    ja: { break:'休憩', focus:'集中', session:'セッション', min:'分', focusLabel:'集中:', breakLabel:'休憩:' },
    it: { break:'Pausa', focus:'Concentrazione', session:'Sessione', min:'min', focusLabel:'Focus:', breakLabel:'Pausa:' },
    ar: { break:'استراحة', focus:'تركيز', session:'جلسة', min:'د', focusLabel:'تركيز:', breakLabel:'استراحة:' },
    ko: { break:'휴식', focus:'집중', session:'세션', min:'분', focusLabel:'집중:', breakLabel:'휴식:' },
    hi: { break:'विश्राम', focus:'ध्यान', session:'सत्र', min:'मिनट', focusLabel:'ध्यान:', breakLabel:'विश्राम:' },
    pt: { break:'Pausa', focus:'Foco', session:'Sessão', min:'min', focusLabel:'Foco:', breakLabel:'Pausa:' }
  };
  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  return {
    setup() {
      const locale = ref(getLocale());
      function t(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

      const workDuration = ref(25);
      const breakDuration = ref(5);
      const isBreak = ref(false);
      const running = ref(false);
      const remaining = ref(25 * 60);
      const sessions = ref(0);
      const workMin = ref(0);
      let timer = null;

      const totalSeconds = computed(() => (isBreak.value ? breakDuration.value : workDuration.value) * 60);
      const display = computed(() => {
        const m = Math.floor(remaining.value / 60);
        const s = remaining.value % 60;
        return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
      });
      const dashOffset = computed(() => {
        const circumference = 339.292;
        return circumference * (1 - remaining.value / totalSeconds.value);
      });

      function tick() {
        if (remaining.value <= 0) {
          clearInterval(timer);
          running.value = false;
          if (!isBreak.value) { sessions.value++; workMin.value += workDuration.value; }
          isBreak.value = !isBreak.value;
          remaining.value = (isBreak.value ? breakDuration.value : workDuration.value) * 60;
          return;
        }
        remaining.value--;
      }
      function toggle() {
        if (running.value) { clearInterval(timer); running.value = false; }
        else { timer = setInterval(tick, 1000); running.value = true; }
      }
      function reset() {
        clearInterval(timer);
        running.value = false;
        isBreak.value = false;
        remaining.value = workDuration.value * 60;
      }
      function skip() {
        clearInterval(timer);
        running.value = false;
        if (!isBreak.value) { sessions.value++; workMin.value += workDuration.value; }
        isBreak.value = !isBreak.value;
        remaining.value = (isBreak.value ? breakDuration.value : workDuration.value) * 60;
      }

      onMounted(() => { window.addEventListener('locale-changed', onLocaleChanged); });
      onUnmounted(() => { clearInterval(timer); window.removeEventListener('locale-changed', onLocaleChanged); });

      return { workDuration, breakDuration, isBreak, running, remaining, sessions, workMin, display, dashOffset, toggle, reset, skip, t };
    }
  };
})(Vue);
