(function(Vue) {
  const { ref, computed, onUnmounted } = Vue;
  return {
    setup() {
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

      onUnmounted(() => clearInterval(timer));

      return { workDuration, breakDuration, isBreak, running, remaining, sessions, workMin, display, dashOffset, toggle, reset, skip };
    }
  };
})(Vue);
