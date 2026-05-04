({
  setup() {
    const { ref, reactive, computed, onMounted, onUnmounted } = Vue;
    const ElMessageBox = (window.ElementPlus && window.ElementPlus.ElMessageBox) || { confirm: () => Promise.resolve() };

    const LANGS = {
      tr: {
        title:'Hatırlatıcılar',
        add:'Yeni Hatırlatıcı',
        edit:'Düzenle',
        save:'Kaydet',
        cancel:'İptal',
        delete:'Sil',
        titleLabel:'Başlık',
        noteLabel:'Not',
        dateTimeLabel:'Tarih & Saat',
        repeatLabel:'Tekrar',
        noRepeat:'Tekrar Yok',
        hourly:'Saatlik',
        daily:'Günlük',
        weekly:'Haftalık',
        monthly:'Aylık',
        custom:'Özel',
        customMinutes:'Dakika (özel aralık)',
        soundLabel:'Ses',
        enabled:'Aktif',
        disabled:'Pasif',
        noReminders:'Henüz hatırlatıcı yok',
        deleteConfirm:'Bu hatırlatıcıyı silmek istediğinize emin misiniz?',
        snoozed:'Ertelendi',
        upcoming:'Yaklaşan',
        past:'Geçmiş',
        all:'Tümü',
        snooze5:'5dk ertele',
        snooze15:'15dk ertele',
        dismiss:'Kapat',
        titleRequired:'Başlık gerekli',
        dateRequired:'Tarih ve saat gerekli',
        on:'Açık',
        off:'Kapalı',
        today:'Bugün',
        tomorrow:'Yarın',
        thisWeek:'Bu Hafta',
        later:'Daha Sonra',
        filterAll:'Tümü',
        filterActive:'Aktif',
        filterDisabled:'Pasif'
      },
      en: {
        title:'Reminders',
        add:'New Reminder',
        edit:'Edit',
        save:'Save',
        cancel:'Cancel',
        delete:'Delete',
        titleLabel:'Title',
        noteLabel:'Note',
        dateTimeLabel:'Date & Time',
        repeatLabel:'Repeat',
        noRepeat:'No Repeat',
        hourly:'Hourly',
        daily:'Daily',
        weekly:'Weekly',
        monthly:'Monthly',
        custom:'Custom',
        customMinutes:'Minutes (custom interval)',
        soundLabel:'Sound',
        enabled:'Enabled',
        disabled:'Disabled',
        noReminders:'No reminders yet',
        deleteConfirm:'Are you sure you want to delete this reminder?',
        snoozed:'Snoozed',
        upcoming:'Upcoming',
        past:'Past',
        all:'All',
        snooze5:'Snooze 5m',
        snooze15:'Snooze 15m',
        dismiss:'Dismiss',
        titleRequired:'Title is required',
        dateRequired:'Date and time are required',
        on:'On',
        off:'Off',
        today:'Today',
        tomorrow:'Tomorrow',
        thisWeek:'This Week',
        later:'Later',
        filterAll:'All',
        filterActive:'Active',
        filterDisabled:'Disabled'
      },
      de: {
        title:'Erinnerungen',
        add:'Neue Erinnerung',
        edit:'Bearbeiten',
        save:'Speichern',
        cancel:'Abbrechen',
        delete:'Löschen',
        titleLabel:'Titel',
        noteLabel:'Notiz',
        dateTimeLabel:'Datum & Uhrzeit',
        repeatLabel:'Wiederholung',
        noRepeat:'Keine Wiederholung',
        hourly:'Stündlich',
        daily:'Täglich',
        weekly:'Wöchentlich',
        monthly:'Monatlich',
        custom:'Benutzerdefiniert',
        customMinutes:'Minuten (benutzerdefiniertes Intervall)',
        soundLabel:'Ton',
        enabled:'Aktiviert',
        disabled:'Deaktiviert',
        noReminders:'Noch keine Erinnerungen',
        deleteConfirm:'Möchten Sie diese Erinnerung wirklich löschen?',
        snoozed:'Verschoben',
        upcoming:'Bevorstehend',
        past:'Vergangen',
        all:'Alle',
        snooze5:'5 Min. verschieben',
        snooze15:'15 Min. verschieben',
        dismiss:'Schließen',
        titleRequired:'Titel ist erforderlich',
        dateRequired:'Datum und Uhrzeit sind erforderlich',
        on:'An',
        off:'Aus',
        today:'Heute',
        tomorrow:'Morgen',
        thisWeek:'Diese Woche',
        later:'Später',
        filterAll:'Alle',
        filterActive:'Aktiv',
        filterDisabled:'Deaktiviert'
      },
      fr: {
        title:'Rappels',
        add:'Nouveau Rappel',
        edit:'Modifier',
        save:'Enregistrer',
        cancel:'Annuler',
        delete:'Supprimer',
        titleLabel:'Titre',
        noteLabel:'Note',
        dateTimeLabel:'Date et Heure',
        repeatLabel:'Répétition',
        noRepeat:'Pas de répétition',
        hourly:'Toutes les heures',
        daily:'Quotidien',
        weekly:'Hebdomadaire',
        monthly:'Mensuel',
        custom:'Personnalisé',
        customMinutes:'Minutes (intervalle personnalisé)',
        soundLabel:'Son',
        enabled:'Activé',
        disabled:'Désactivé',
        noReminders:'Pas encore de rappels',
        deleteConfirm:'Êtes-vous sûr de vouloir supprimer ce rappel ?',
        snoozed:'Reporté',
        upcoming:'À venir',
        past:'Passé',
        all:'Tous',
        snooze5:'Reporter 5m',
        snooze15:'Reporter 15m',
        dismiss:'Fermer',
        titleRequired:'Le titre est requis',
        dateRequired:'La date et l\'heure sont requises',
        on:'On',
        off:'Off',
        today:'Aujourd\'hui',
        tomorrow:'Demain',
        thisWeek:'Cette Semaine',
        later:'Plus Tard',
        filterAll:'Tous',
        filterActive:'Actifs',
        filterDisabled:'Désactivés'
      },
      es: {
        title:'Recordatorios',
        add:'Nuevo Recordatorio',
        edit:'Editar',
        save:'Guardar',
        cancel:'Cancelar',
        delete:'Eliminar',
        titleLabel:'Título',
        noteLabel:'Nota',
        dateTimeLabel:'Fecha y Hora',
        repeatLabel:'Repetir',
        noRepeat:'Sin repetición',
        hourly:'Cada hora',
        daily:'Diario',
        weekly:'Semanal',
        monthly:'Mensual',
        custom:'Personalizado',
        customMinutes:'Minutos (intervalo personalizado)',
        soundLabel:'Sonido',
        enabled:'Activado',
        disabled:'Desactivado',
        noReminders:'Aún no hay recordatorios',
        deleteConfirm:'¿Estás seguro de que quieres eliminar este recordatorio?',
        snoozed:'Pospuesto',
        upcoming:'Próximo',
        past:'Pasado',
        all:'Todos',
        snooze5:'Posponer 5m',
        snooze15:'Posponer 15m',
        dismiss:'Cerrar',
        titleRequired:'El título es obligatorio',
        dateRequired:'La fecha y hora son obligatorias',
        on:'On',
        off:'Off',
        today:'Hoy',
        tomorrow:'Mañana',
        thisWeek:'Esta Semana',
        later:'Más Tarde',
        filterAll:'Todos',
        filterActive:'Activos',
        filterDisabled:'Desactivados'
      },
      ru: {
        title:'Напоминания',
        add:'Новое напоминание',
        edit:'Редактировать',
        save:'Сохранить',
        cancel:'Отмена',
        delete:'Удалить',
        titleLabel:'Заголовок',
        noteLabel:'Заметка',
        dateTimeLabel:'Дата и время',
        repeatLabel:'Повтор',
        noRepeat:'Без повтора',
        hourly:'Каждый час',
        daily:'Ежедневно',
        weekly:'Еженедельно',
        monthly:'Ежемесячно',
        custom:'Пользовательский',
        customMinutes:'Минуты (пользовательский интервал)',
        soundLabel:'Звук',
        enabled:'Включено',
        disabled:'Отключено',
        noReminders:'Пока нет напоминаний',
        deleteConfirm:'Вы уверены, что хотите удалить это напоминание?',
        snoozed:'Отложено',
        upcoming:'Предстоящие',
        past:'Прошедшие',
        all:'Все',
        snooze5:'Отложить 5м',
        snooze15:'Отложить 15м',
        dismiss:'Закрыть',
        titleRequired:'Заголовок обязателен',
        dateRequired:'Дата и время обязательны',
        on:'Вкл',
        off:'Выкл',
        today:'Сегодня',
        tomorrow:'Завтра',
        thisWeek:'На этой неделе',
        later:'Позже',
        filterAll:'Все',
        filterActive:'Активные',
        filterDisabled:'Отключённые'
      },
      zh: {
        title:'提醒事项',
        add:'新建提醒',
        edit:'编辑',
        save:'保存',
        cancel:'取消',
        delete:'删除',
        titleLabel:'标题',
        noteLabel:'备注',
        dateTimeLabel:'日期和时间',
        repeatLabel:'重复',
        noRepeat:'不重复',
        hourly:'每小时',
        daily:'每天',
        weekly:'每周',
        monthly:'每月',
        custom:'自定义',
        customMinutes:'自定义分钟',
        soundLabel:'声音',
        enabled:'已启用',
        disabled:'已禁用',
        noReminders:'没有提醒',
        deleteConfirm:'确认删除？',
        snoozed:'已延后',
        upcoming:'即将到来',
        past:'已过',
        all:'全部',
        snooze5:'延后5分钟',
        snooze15:'延后15分钟',
        dismiss:'关闭',
        titleRequired:'请输入标题',
        dateRequired:'请选择日期',
        on:'开',
        off:'关',
        today:'今天',
        tomorrow:'明天',
        thisWeek:'本周',
        later:'稍后',
        filterAll:'全部',
        filterActive:'活跃',
        filterDisabled:'已禁用'
      },
      ja: {
        title:'リマインダー',
        add:'新規リマインダー',
        edit:'編集',
        save:'保存',
        cancel:'キャンセル',
        delete:'削除',
        titleLabel:'タイトル',
        noteLabel:'メモ',
        dateTimeLabel:'日時',
        repeatLabel:'繰り返し',
        noRepeat:'繰り返しなし',
        hourly:'毎時',
        daily:'毎日',
        weekly:'毎週',
        monthly:'毎月',
        custom:'カスタム',
        customMinutes:'カスタム分',
        soundLabel:'サウンド',
        enabled:'有効',
        disabled:'無効',
        noReminders:'リマインダーなし',
        deleteConfirm:'削除しますか？',
        snoozed:'スヌーズ済',
        upcoming:'予定',
        past:'過去',
        all:'すべて',
        snooze5:'5分後に再通知',
        snooze15:'15分後に再通知',
        dismiss:'閉じる',
        titleRequired:'タイトルを入力してください',
        dateRequired:'日付を選択してください',
        on:'オン',
        off:'オフ',
        today:'今日',
        tomorrow:'明日',
        thisWeek:'今週',
        later:'後で',
        filterAll:'すべて',
        filterActive:'アクティブ',
        filterDisabled:'無効'
      },
      it: {
        title:'Promemoria',
        add:'Nuovo promemoria',
        edit:'Modifica',
        save:'Salva',
        cancel:'Annulla',
        delete:'Elimina',
        titleLabel:'Titolo',
        noteLabel:'Note',
        dateTimeLabel:'Data e ora',
        repeatLabel:'Ripeti',
        noRepeat:'Non ripetere',
        hourly:'Ogni ora',
        daily:'Ogni giorno',
        weekly:'Ogni settimana',
        monthly:'Ogni mese',
        custom:'Personalizzato',
        customMinutes:'Minuti personalizzati',
        soundLabel:'Suono',
        enabled:'Attivato',
        disabled:'Disattivato',
        noReminders:'Nessun promemoria',
        deleteConfirm:'Confermi eliminazione?',
        snoozed:'Posticipato',
        upcoming:'In arrivo',
        past:'Passato',
        all:'Tutti',
        snooze5:'Posticipa 5 min',
        snooze15:'Posticipa 15 min',
        dismiss:'Chiudi',
        titleRequired:'Titolo richiesto',
        dateRequired:'Data richiesta',
        on:'Attivo',
        off:'Spento',
        today:'Oggi',
        tomorrow:'Domani',
        thisWeek:'Questa settimana',
        later:'Più tardi',
        filterAll:'Tutti',
        filterActive:'Attivi',
        filterDisabled:'Disattivati'
      },
      ar: {
        title:'تذكير',
        add:'New Reminder',
        edit:'تعديل',
        save:'حفظ',
        cancel:'إلغاء',
        delete:'حذف',
        titleLabel:'العنوان',
        noteLabel:'Note',
        dateTimeLabel:'التاريخ والوقت',
        repeatLabel:'تكرار',
        noRepeat:'بدون تكرار',
        hourly:'كل ساعة',
        daily:'يومي',
        weekly:'أسبوعي',
        monthly:'شهري',
        custom:'Custom',
        customMinutes:'Minutes (custom interval)',
        soundLabel:'Sound',
        enabled:'مفعل',
        disabled:'معطل',
        noReminders:'No reminders yet',
        deleteConfirm:'Are you sure you want to delete this reminder?',
        snoozed:'Snoozed',
        upcoming:'Upcoming',
        past:'Past',
        all:'الكل',
        snooze5:'Snooze 5m',
        snooze15:'Snooze 15m',
        dismiss:'Dismiss',
        titleRequired:'Title is required',
        dateRequired:'التاريخ والوقت مطلوبان',
        on:'تشغيل',
        off:'إيقاف',
        today:'Today',
        tomorrow:'Tomorrow',
        thisWeek:'This Week',
        later:'Later',
        filterAll:'الكل',
        filterActive:'نشط',
        filterDisabled:'معطل'
      },
      ko: {
        title:'리마인더',
        add:'New Reminder',
        edit:'편집',
        save:'저장',
        cancel:'취소',
        delete:'삭제',
        titleLabel:'제목',
        noteLabel:'Note',
        dateTimeLabel:'날짜 및 시간',
        repeatLabel:'반복',
        noRepeat:'반복 없음',
        hourly:'매시간',
        daily:'매일',
        weekly:'매주',
        monthly:'매월',
        custom:'Custom',
        customMinutes:'Minutes (custom interval)',
        soundLabel:'Sound',
        enabled:'활성화',
        disabled:'비활성화',
        noReminders:'No reminders yet',
        deleteConfirm:'Are you sure you want to delete this reminder?',
        snoozed:'Snoozed',
        upcoming:'Upcoming',
        past:'Past',
        all:'전체',
        snooze5:'Snooze 5m',
        snooze15:'Snooze 15m',
        dismiss:'Dismiss',
        titleRequired:'Title is required',
        dateRequired:'날짜와 시간 필수',
        on:'켜기',
        off:'끄기',
        today:'Today',
        tomorrow:'Tomorrow',
        thisWeek:'This Week',
        later:'Later',
        filterAll:'전체',
        filterActive:'활성',
        filterDisabled:'비활성'
      },
      hi: {
        title:'रिमाइंडर',
        add:'New Reminder',
        edit:'संपादित करें',
        save:'सहेजें',
        cancel:'रद्द करें',
        delete:'हटाएं',
        titleLabel:'शीर्षक',
        noteLabel:'Note',
        dateTimeLabel:'दिनांक और समय',
        repeatLabel:'दोहराव',
        noRepeat:'कोई दोहराव नहीं',
        hourly:'प्रति घंटा',
        daily:'दैनिक',
        weekly:'साप्ताहिक',
        monthly:'मासिक',
        custom:'Custom',
        customMinutes:'Minutes (custom interval)',
        soundLabel:'Sound',
        enabled:'सक्षम',
        disabled:'अक्षम',
        noReminders:'No reminders yet',
        deleteConfirm:'Are you sure you want to delete this reminder?',
        snoozed:'Snoozed',
        upcoming:'Upcoming',
        past:'Past',
        all:'सभी',
        snooze5:'Snooze 5m',
        snooze15:'Snooze 15m',
        dismiss:'Dismiss',
        titleRequired:'Title is required',
        dateRequired:'दिनांक और समय आवश्यक',
        on:'चालू',
        off:'बंद',
        today:'Today',
        tomorrow:'Tomorrow',
        thisWeek:'This Week',
        later:'Later',
        filterAll:'सभी',
        filterActive:'सक्रिय',
        filterDisabled:'अक्षम'
      },
      pt: {
        title:'Lembrete',
        add:'New Reminder',
        edit:'Editar',
        save:'Salvar',
        cancel:'Cancelar',
        delete:'Excluir',
        titleLabel:'Título',
        noteLabel:'Note',
        dateTimeLabel:'Data e hora',
        repeatLabel:'Repetir',
        noRepeat:'Sem repetição',
        hourly:'A cada hora',
        daily:'Diário',
        weekly:'Semanal',
        monthly:'Mensal',
        custom:'Custom',
        customMinutes:'Minutes (custom interval)',
        soundLabel:'Sound',
        enabled:'Ativado',
        disabled:'Desativado',
        noReminders:'No reminders yet',
        deleteConfirm:'Are you sure you want to delete this reminder?',
        snoozed:'Snoozed',
        upcoming:'Upcoming',
        past:'Past',
        all:'Todas',
        snooze5:'Snooze 5m',
        snooze15:'Snooze 15m',
        dismiss:'Dismiss',
        titleRequired:'Title is required',
        dateRequired:'Data e hora obrigatórias',
        on:'Ligado',
        off:'Desligado',
        today:'Today',
        tomorrow:'Tomorrow',
        thisWeek:'This Week',
        later:'Later',
        filterAll:'Todos',
        filterActive:'Ativos',
        filterDisabled:'Desativados'
      }
  };

    function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }
    const locale = ref(getLocale());
    function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

    const reminders = ref([]);
    const filter = ref('all');
    const editingId = ref(null);
    const showForm = ref(false);
    const form = reactive({
      title: '', note: '', datetime: '', repeat: '', repeatInterval: 30, sound: true
    });
    const formError = ref('');

    const repeatOptions = computed(() => [
      { value: '', label: L('noRepeat') },
      { value: 'hourly', label: L('hourly') },
      { value: 'daily', label: L('daily') },
      { value: 'weekly', label: L('weekly') },
      { value: 'monthly', label: L('monthly') },
      { value: 'custom', label: L('custom') }
    ]);

    function getToken() { try { return localStorage.getItem('auth_token') || ''; } catch { return ''; } }
    function authHeaders() { return { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }

    async function loadReminders() {
      try {
        const r = await fetch('/api/reminders', { headers: authHeaders() });
        if (r.ok) reminders.value = await r.json();
      } catch (e) { console.error('Load reminders error', e); }
    }

    function resetForm() {
      form.title = ''; form.note = ''; form.datetime = ''; form.repeat = '';
      form.repeatInterval = 30; form.sound = true;
      formError.value = ''; editingId.value = null; showForm.value = false;
    }

    function openNew() {
      resetForm();
      const now = new Date();
      now.setMinutes(now.getMinutes() + 30);
      now.setSeconds(0); now.setMilliseconds(0);
      const y = now.getFullYear();
      const mo = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const h = String(now.getHours()).padStart(2, '0');
      const mi = String(now.getMinutes()).padStart(2, '0');
      form.datetime = y + '-' + mo + '-' + d + 'T' + h + ':' + mi;
      showForm.value = true;
    }

    function openEdit(rem) {
      editingId.value = rem.id;
      form.title = rem.title || '';
      form.note = rem.note || '';
      form.repeat = rem.repeat || '';
      form.repeatInterval = rem.repeatInterval || 30;
      form.sound = rem.sound !== false;
      if (rem.datetime) {
        const dt = new Date(rem.datetime);
        const y = dt.getFullYear();
        const mo = String(dt.getMonth() + 1).padStart(2, '0');
        const d = String(dt.getDate()).padStart(2, '0');
        const h = String(dt.getHours()).padStart(2, '0');
        const mi = String(dt.getMinutes()).padStart(2, '0');
        form.datetime = y + '-' + mo + '-' + d + 'T' + h + ':' + mi;
      } else { form.datetime = ''; }
      formError.value = '';
      showForm.value = true;
    }

    async function saveReminder() {
      if (!form.title.trim()) { formError.value = L('titleRequired'); return; }
      if (!form.datetime) { formError.value = L('dateRequired'); return; }
      const body = {
        title: form.title.trim(),
        note: form.note.trim(),
        datetime: new Date(form.datetime).toISOString(),
        repeat: form.repeat,
        repeatInterval: form.repeat === 'custom' ? (parseInt(form.repeatInterval) || 30) : 0,
        sound: form.sound
      };
      try {
        if (editingId.value) {
          await fetch('/api/reminders/' + editingId.value, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) });
        } else {
          await fetch('/api/reminders', { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
        }
        resetForm();
        await loadReminders();
      } catch (e) { console.error('Save reminder error', e); }
    }

    async function deleteReminder(id) {
      try { await ElMessageBox.confirm(L('deleteConfirm'), { confirmButtonText: 'OK', cancelButtonText: L('cancel') || 'Cancel', type: 'warning' }); } catch { return; }
      try {
        await fetch('/api/reminders/' + id, { method: 'DELETE', headers: authHeaders() });
        await loadReminders();
      } catch (e) { console.error('Delete reminder error', e); }
    }

    async function toggleEnabled(rem) {
      try {
        await fetch('/api/reminders/' + rem.id, {
          method: 'PUT', headers: authHeaders(),
          body: JSON.stringify({ enabled: !rem.enabled })
        });
        await loadReminders();
      } catch (e) { console.error('Toggle error', e); }
    }

    async function snoozeReminder(id, minutes) {
      try {
        await fetch('/api/reminders/' + id + '/snooze', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({ minutes: minutes })
        });
        await loadReminders();
      } catch (e) { console.error('Snooze error', e); }
    }

    async function dismissReminder(id) {
      try {
        await fetch('/api/reminders/' + id + '/dismiss', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({})
        });
        await loadReminders();
      } catch (e) { console.error('Dismiss error', e); }
    }

    function formatDateTime(iso) {
      if (!iso) return '';
      const d = new Date(iso);
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const time = pad(d.getHours()) + ':' + pad(d.getMinutes());
      const sameYear = d.getFullYear() === now.getFullYear();
      const dateStr = pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + (sameYear ? '' : '.' + d.getFullYear());
      return dateStr + ' ' + time;
    }

    function getRelativeGroup(iso) {
      if (!iso) return 'later';
      const d = new Date(iso);
      const now = new Date();
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      const tomorrowEnd = new Date(todayEnd.getTime() + 86400000);
      if (d <= now) return 'past';
      if (d <= todayEnd) return 'today';
      if (d <= tomorrowEnd) return 'tomorrow';
      const weekEnd = new Date(todayEnd.getTime() + 7 * 86400000);
      if (d <= weekEnd) return 'thisWeek';
      return 'later';
    }

    function repeatLabel(rem) {
      if (!rem.repeat) return '';
      const labels = { hourly: L('hourly'), daily: L('daily'), weekly: L('weekly'), monthly: L('monthly') };
      if (rem.repeat === 'custom') return L('custom') + ' (' + (rem.repeatInterval || 30) + 'min)';
      return labels[rem.repeat] || rem.repeat;
    }

    function isSnoozed(rem) {
      return rem.snoozedUntil && new Date(rem.snoozedUntil) > new Date();
    }

    function snoozeTimeLeft(rem) {
      if (!isSnoozed(rem)) return '';
      const left = Math.ceil((new Date(rem.snoozedUntil) - new Date()) / 60000);
      return left + ' min';
    }

    const filteredReminders = computed(() => {
      let list = reminders.value.slice();
      if (filter.value === 'active') list = list.filter(r => r.enabled);
      else if (filter.value === 'disabled') list = list.filter(r => !r.enabled);
      list.sort((a, b) => {
        if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
        return new Date(a.datetime) - new Date(b.datetime);
      });
      return list;
    });

    const counts = computed(() => ({
      all: reminders.value.length,
      active: reminders.value.filter(r => r.enabled).length,
      disabled: reminders.value.filter(r => !r.enabled).length
    }));

    function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }
    let refreshTimer = null;

    onMounted(async () => {
      await loadReminders();
      window.addEventListener('locale-changed', onLocaleChanged);
      refreshTimer = setInterval(loadReminders, 30000);
    });
    onUnmounted(() => {
      window.removeEventListener('locale-changed', onLocaleChanged);
      if (refreshTimer) clearInterval(refreshTimer);
    });

    return {
      L, reminders, filter, editingId, showForm, form, formError,
      repeatOptions, filteredReminders, counts,
      openNew, openEdit, saveReminder, deleteReminder,
      toggleEnabled, snoozeReminder, dismissReminder, resetForm,
      formatDateTime, getRelativeGroup, repeatLabel, isSnoozed, snoozeTimeLeft
    };
  }
})
