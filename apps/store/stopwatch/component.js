(function(Vue) {
  const { ref, computed, onMounted, onUnmounted } = Vue;

  const LANGS = {
    tr: { start:'Başlat', stop:'Durdur', lap:'Tur', reset:'Sıfırla', total:'Toplam', lapN:'Tur', diff:'Fark', noLaps:'Tur kaydı yok', resume:'Devam', save:'Kaydet', history:'Geçmiş', back:'Geri', noHistory:'Kayıtlı sonuç yok', deleteConfirm:'Silinsin mi?', delete:'Sil', labelPlaceholder:'Etiket (isteğe bağlı)', saved:'Kaydedildi' },
    en: { start:'Start', stop:'Stop', lap:'Lap', reset:'Reset', total:'Total', lapN:'Lap', diff:'Split', noLaps:'No laps recorded', resume:'Resume', save:'Save', history:'History', back:'Back', noHistory:'No saved results', deleteConfirm:'Delete this?', delete:'Delete', labelPlaceholder:'Label (optional)', saved:'Saved' },
    de: { start:'Start', stop:'Stopp', lap:'Runde', reset:'Reset', total:'Gesamt', lapN:'Runde', diff:'Split', noLaps:'Keine Runden', resume:'Weiter', save:'Speichern', history:'Verlauf', back:'Zurück', noHistory:'Keine Ergebnisse', deleteConfirm:'Löschen?', delete:'Löschen', labelPlaceholder:'Bezeichnung', saved:'Gespeichert' },
    fr: { start:'Démarrer', stop:'Arrêter', lap:'Tour', reset:'Réinitialiser', total:'Total', lapN:'Tour', diff:'Écart', noLaps:'Aucun tour', resume:'Reprendre', save:'Enregistrer', history:'Historique', back:'Retour', noHistory:'Aucun résultat', deleteConfirm:'Supprimer?', delete:'Supprimer', labelPlaceholder:'Libellé', saved:'Enregistré' },
    es: { start:'Iniciar', stop:'Detener', lap:'Vuelta', reset:'Reiniciar', total:'Total', lapN:'Vuelta', diff:'Parcial', noLaps:'Sin vueltas', resume:'Reanudar', save:'Guardar', history:'Historial', back:'Volver', noHistory:'Sin resultados', deleteConfirm:'¿Eliminar?', delete:'Eliminar', labelPlaceholder:'Etiqueta', saved:'Guardado' },
    ru: { start:'Старт', stop:'Стоп', lap:'Круг', reset:'Сброс', total:'Всего', lapN:'Круг', diff:'Сплит', noLaps:'Нет кругов', resume:'Продолжить', save:'Сохранить', history:'История', back:'Назад', noHistory:'Нет результатов', deleteConfirm:'Удалить?', delete:'Удалить', labelPlaceholder:'Метка', saved:'Сохранено' },
    zh: { start:'开始', stop:'停止', lap:'圈', reset:'重置', total:'总计', lapN:'圈', diff:'分段', noLaps:'无圈数', resume:'继续', save:'保存', history:'历史', back:'返回', noHistory:'无结果', deleteConfirm:'删除?', delete:'删除', labelPlaceholder:'标签', saved:'已保存' },
    ja: { start:'開始', stop:'停止', lap:'ラップ', reset:'リセット', total:'合計', lapN:'ラップ', diff:'スプリット', noLaps:'ラップなし', resume:'再開', save:'保存', history:'履歴', back:'戻る', noHistory:'結果なし', deleteConfirm:'削除?', delete:'削除', labelPlaceholder:'ラベル', saved:'保存済' },
    it: { start:'Avvia', stop:'Ferma', lap:'Giro', reset:'Reset', total:'Totale', lapN:'Giro', diff:'Parziale', noLaps:'Nessun giro', resume:'Riprendi', save:'Salva', history:'Cronologia', back:'Indietro', noHistory:'Nessun risultato', deleteConfirm:'Eliminare?', delete:'Elimina', labelPlaceholder:'Etichetta', saved:'Salvato' },
    ar: { start:'بدء', stop:'إيقاف', lap:'لفة', reset:'إعادة', total:'المجموع', lapN:'لفة', diff:'فرق', noLaps:'لا توجد لفات', resume:'استئناف', save:'حفظ', history:'السجل', back:'رجوع', noHistory:'لا توجد نتائج', deleteConfirm:'حذف؟', delete:'حذف', labelPlaceholder:'تسمية', saved:'تم الحفظ' },
    ko: { start:'시작', stop:'정지', lap:'랩', reset:'초기화', total:'합계', lapN:'랩', diff:'스플릿', noLaps:'랩 없음', resume:'재개', save:'저장', history:'기록', back:'뒤로', noHistory:'결과 없음', deleteConfirm:'삭제?', delete:'삭제', labelPlaceholder:'라벨', saved:'저장됨' },
    hi: { start:'शुरू', stop:'रोकें', lap:'लैप', reset:'रीसेट', total:'कुल', lapN:'लैप', diff:'स्प्लिट', noLaps:'कोई लैप नहीं', resume:'जारी', save:'सेव', history:'इतिहास', back:'वापस', noHistory:'कोई परिणाम नहीं', deleteConfirm:'हटाएं?', delete:'हटाएं', labelPlaceholder:'लेबल', saved:'सेव हो गया' },
    pt: { start:'Iniciar', stop:'Parar', lap:'Volta', reset:'Reiniciar', total:'Total', lapN:'Volta', diff:'Parcial', noLaps:'Sem voltas', resume:'Continuar', save:'Salvar', history:'Histórico', back:'Voltar', noHistory:'Sem resultados', deleteConfirm:'Excluir?', delete:'Excluir', labelPlaceholder:'Rótulo', saved:'Salvo' }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  return {
    setup() {
      const locale = ref(getLocale());
      function t(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

      // State
      const running = ref(false);
      const elapsed = ref(0);        // ms accumulated before current run
      const startTime = ref(0);      // timestamp when started
      const laps = ref([]);           // [{ num, splitMs, totalMs }]
      let animFrame = null;
      const displayMs = ref(0);      // live display ms

      function now() { return performance.now(); }

      function currentElapsed() {
        return running.value ? elapsed.value + (now() - startTime.value) : elapsed.value;
      }

      function updateDisplay() {
        displayMs.value = currentElapsed();
        if (running.value) animFrame = requestAnimationFrame(updateDisplay);
      }

      function formatTime(ms) {
        if (ms < 0) ms = 0;
        var h = Math.floor(ms / 3600000);
        var m = Math.floor((ms % 3600000) / 60000);
        var s = Math.floor((ms % 60000) / 1000);
        var cs = Math.floor((ms % 1000) / 10);
        if (h > 0) return String(h) + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0') + '.' + String(cs).padStart(2,'0');
        return String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0') + '.' + String(cs).padStart(2,'0');
      }

      const display = computed(function() { return formatTime(displayMs.value); });

      // Actions
      function start() {
        if (running.value) return;
        running.value = true;
        startTime.value = now();
        updateDisplay();
      }

      function stop() {
        if (!running.value) return;
        elapsed.value += now() - startTime.value;
        running.value = false;
        if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
        displayMs.value = elapsed.value;
      }

      function lap() {
        if (!running.value) return;
        var totalMs = currentElapsed();
        var prevTotal = laps.value.length > 0 ? laps.value[0].totalMs : 0;
        var splitMs = totalMs - prevTotal;
        laps.value.unshift({ num: laps.value.length + 1, splitMs: splitMs, totalMs: totalMs });
      }

      function reset() {
        stop();
        elapsed.value = 0;
        displayMs.value = 0;
        laps.value = [];
      }

      // Best/worst lap detection
      const bestLapIdx = computed(function() {
        if (laps.value.length < 2) return -1;
        var best = Infinity, idx = -1;
        for (var i = 0; i < laps.value.length; i++) {
          if (laps.value[i].splitMs < best) { best = laps.value[i].splitMs; idx = i; }
        }
        return idx;
      });

      const worstLapIdx = computed(function() {
        if (laps.value.length < 2) return -1;
        var worst = -1, idx = -1;
        for (var i = 0; i < laps.value.length; i++) {
          if (laps.value[i].splitMs > worst) { worst = laps.value[i].splitMs; idx = i; }
        }
        return idx;
      });

      // History / Save
      function getToken() { try { return localStorage.getItem('auth_token') || ''; } catch { return ''; } }
      function authHeaders() { return { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }

      const showHistory = ref(false);
      const history = ref([]);
      const saveLabel = ref('');
      const saving = ref(false);
      const savedMsg = ref(false);
      const expandedId = ref(null);

      async function loadHistory() {
        try {
          var r = await fetch('/api/stopwatch/results', { headers: authHeaders() });
          if (r.ok) history.value = await r.json();
        } catch(e) { /* ignore */ }
      }

      async function saveResult() {
        if (saving.value) return;
        var totalMs = currentElapsed();
        if (totalMs <= 0) return;
        saving.value = true;
        try {
          var body = {
            label: saveLabel.value.trim(),
            totalMs: totalMs,
            laps: laps.value.slice().reverse()
          };
          var r = await fetch('/api/stopwatch/results', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(body)
          });
          if (r.ok) {
            var entry = await r.json();
            history.value.unshift(entry);
            saveLabel.value = '';
            savedMsg.value = true;
            setTimeout(function() { savedMsg.value = false; }, 2000);
          }
        } catch(e) { /* ignore */ }
        saving.value = false;
      }

      async function deleteResult(id) {
        try {
          var r = await fetch('/api/stopwatch/results/' + encodeURIComponent(id), {
            method: 'DELETE',
            headers: authHeaders()
          });
          if (r.ok) {
            history.value = history.value.filter(function(h) { return h.id !== id; });
            if (expandedId.value === id) expandedId.value = null;
          }
        } catch(e) { /* ignore */ }
      }

      function toggleExpand(id) {
        expandedId.value = expandedId.value === id ? null : id;
      }

      function formatDate(iso) {
        try {
          var d = new Date(iso);
          return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch { return iso; }
      }

      onMounted(function() {
        window.addEventListener('locale-changed', onLocaleChanged);
        loadHistory();
      });
      onUnmounted(function() {
        if (animFrame) cancelAnimationFrame(animFrame);
        window.removeEventListener('locale-changed', onLocaleChanged);
      });

      return {
        t: t,
        running: running,
        display: display,
        laps: laps,
        start: start,
        stop: stop,
        lap: lap,
        reset: reset,
        formatTime: formatTime,
        bestLapIdx: bestLapIdx,
        worstLapIdx: worstLapIdx,
        showHistory: showHistory,
        history: history,
        saveLabel: saveLabel,
        saving: saving,
        savedMsg: savedMsg,
        expandedId: expandedId,
        saveResult: saveResult,
        deleteResult: deleteResult,
        toggleExpand: toggleExpand,
        formatDate: formatDate,
        elapsed: elapsed
      };
    }
  };
})(Vue);
