({
  setup(props) {
    const { ref, computed, watch, onMounted, nextTick } = Vue;

    const LANGS = {
      tr: {
        settingsTitle:'Google Takvim Ayarları',save:'Kaydet',connect:'Google\'a Bağlan',
        authInstructions:'Aşağıdaki URL\'yi tarayıcıda açın ve kodu yapıştırın:',pasteCode:'Yetkilendirme kodunu yapıştırın',
        authorize:'Yetkilendir',connectedAs:'Bağlı:',disconnect:'Bağlantıyı Kes',
        today:'Bugün',month:'Ay',week:'Hafta',day:'Gün',allCalendars:'Tüm Takvimler',
        more:'daha',allDay:'Tüm gün',newEvent:'Yeni Etkinlik',editEvent:'Etkinliği Düzenle',
        eventTitle:'Başlık',eventTitlePlaceholder:'Etkinlik başlığı ekleyin',
        startDate:'Başlangıç',endDate:'Bitiş',location:'Konum',locationPlaceholder:'Konum ekleyin',
        description:'Açıklama',calendar:'Takvim',color:'Renk',defaultColor:'Varsayılan',
        reminder:'Hatırlatıcı',minutes:'dakika',recurrence:'Tekrarlama',noRecurrence:'Tekrarlama yok',
        daily:'Günlük',weekly:'Haftalık',monthly:'Aylık',yearly:'Yıllık',
        attendees:'Katılımcılar',attendeesPlaceholder:'email1@x.com, email2@x.com',
        cancel:'İptal',create:'Oluştur',update:'Güncelle',edit:'Düzenle',delete:'Sil',
        noEvents:'Etkinlik yok',notConnected:'Google Takvim hesabınızı bağlayın',setupAccount:'Hesap Ayarla',
        deleteConfirm:'Bu etkinliği silmek istediğinize emin misiniz?',
        mon:'Pzt',tue:'Sal',wed:'Çar',thu:'Per',fri:'Cum',sat:'Cmt',sun:'Paz',
        months:'Ocak,Şubat,Mart,Nisan,Mayıs,Haziran,Temmuz,Ağustos,Eylül,Ekim,Kasım,Aralık'
      },
      en: {
        settingsTitle:'Google Calendar Settings',save:'Save',connect:'Connect to Google',
        authInstructions:'Open the URL below in your browser and paste the code:',pasteCode:'Paste authorization code',
        authorize:'Authorize',connectedAs:'Connected:',disconnect:'Disconnect',
        today:'Today',month:'Month',week:'Week',day:'Day',allCalendars:'All Calendars',
        more:'more',allDay:'All day',newEvent:'New Event',editEvent:'Edit Event',
        eventTitle:'Title',eventTitlePlaceholder:'Add event title',
        startDate:'Start',endDate:'End',location:'Location',locationPlaceholder:'Add location',
        description:'Description',calendar:'Calendar',color:'Color',defaultColor:'Default',
        reminder:'Reminder',minutes:'min',recurrence:'Recurrence',noRecurrence:'No recurrence',
        daily:'Daily',weekly:'Weekly',monthly:'Monthly',yearly:'Yearly',
        attendees:'Attendees',attendeesPlaceholder:'email1@x.com, email2@x.com',
        cancel:'Cancel',create:'Create',update:'Update',edit:'Edit',delete:'Delete',
        noEvents:'No events',notConnected:'Connect your Google Calendar account',setupAccount:'Setup Account',
        deleteConfirm:'Are you sure you want to delete this event?',
        mon:'Mon',tue:'Tue',wed:'Wed',thu:'Thu',fri:'Fri',sat:'Sat',sun:'Sun',
        months:'January,February,March,April,May,June,July,August,September,October,November,December'
      },
      de: {
        settingsTitle:'Google Kalender Einstellungen',save:'Speichern',connect:'Mit Google verbinden',
        authInstructions:'Öffnen Sie die URL im Browser und fügen Sie den Code ein:',pasteCode:'Autorisierungscode einfügen',
        authorize:'Autorisieren',connectedAs:'Verbunden:',disconnect:'Trennen',
        today:'Heute',month:'Monat',week:'Woche',day:'Tag',allCalendars:'Alle Kalender',
        more:'mehr',allDay:'Ganztägig',newEvent:'Neues Ereignis',editEvent:'Ereignis bearbeiten',
        eventTitle:'Titel',eventTitlePlaceholder:'Ereignistitel hinzufügen',
        startDate:'Beginn',endDate:'Ende',location:'Ort',locationPlaceholder:'Ort hinzufügen',
        description:'Beschreibung',calendar:'Kalender',color:'Farbe',defaultColor:'Standard',
        reminder:'Erinnerung',minutes:'Min',recurrence:'Wiederholung',noRecurrence:'Keine Wiederholung',
        daily:'Täglich',weekly:'Wöchentlich',monthly:'Monatlich',yearly:'Jährlich',
        attendees:'Teilnehmer',attendeesPlaceholder:'email1@x.com, email2@x.com',
        cancel:'Abbrechen',create:'Erstellen',update:'Aktualisieren',edit:'Bearbeiten',delete:'Löschen',
        noEvents:'Keine Ereignisse',notConnected:'Verbinden Sie Ihr Google Kalender-Konto',setupAccount:'Konto einrichten',
        deleteConfirm:'Möchten Sie dieses Ereignis wirklich löschen?',
        mon:'Mo',tue:'Di',wed:'Mi',thu:'Do',fri:'Fr',sat:'Sa',sun:'So',
        months:'Januar,Februar,März,April,Mai,Juni,Juli,August,September,Oktober,November,Dezember'
      },
      fr: {
        settingsTitle:'Paramètres Google Agenda',save:'Enregistrer',connect:'Se connecter à Google',
        authInstructions:'Ouvrez l\'URL ci-dessous dans votre navigateur et collez le code:',pasteCode:'Collez le code d\'autorisation',
        authorize:'Autoriser',connectedAs:'Connecté:',disconnect:'Déconnecter',
        today:'Aujourd\'hui',month:'Mois',week:'Semaine',day:'Jour',allCalendars:'Tous les calendriers',
        more:'plus',allDay:'Toute la journée',newEvent:'Nouvel événement',editEvent:'Modifier l\'événement',
        eventTitle:'Titre',eventTitlePlaceholder:'Ajouter un titre',
        startDate:'Début',endDate:'Fin',location:'Lieu',locationPlaceholder:'Ajouter un lieu',
        description:'Description',calendar:'Calendrier',color:'Couleur',defaultColor:'Par défaut',
        reminder:'Rappel',minutes:'min',recurrence:'Récurrence',noRecurrence:'Aucune récurrence',
        daily:'Quotidien',weekly:'Hebdomadaire',monthly:'Mensuel',yearly:'Annuel',
        attendees:'Participants',attendeesPlaceholder:'email1@x.com, email2@x.com',
        cancel:'Annuler',create:'Créer',update:'Mettre à jour',edit:'Modifier',delete:'Supprimer',
        noEvents:'Aucun événement',notConnected:'Connectez votre compte Google Agenda',setupAccount:'Configurer le compte',
        deleteConfirm:'Voulez-vous vraiment supprimer cet événement?',
        mon:'Lun',tue:'Mar',wed:'Mer',thu:'Jeu',fri:'Ven',sat:'Sam',sun:'Dim',
        months:'Janvier,Février,Mars,Avril,Mai,Juin,Juillet,Août,Septembre,Octobre,Novembre,Décembre'
      },
      es: {
        settingsTitle:'Configuración de Google Calendar',save:'Guardar',connect:'Conectar con Google',
        authInstructions:'Abra la URL a continuación en su navegador y pegue el código:',pasteCode:'Pegue el código de autorización',
        authorize:'Autorizar',connectedAs:'Conectado:',disconnect:'Desconectar',
        today:'Hoy',month:'Mes',week:'Semana',day:'Día',allCalendars:'Todos los calendarios',
        more:'más',allDay:'Todo el día',newEvent:'Nuevo evento',editEvent:'Editar evento',
        eventTitle:'Título',eventTitlePlaceholder:'Agregar título del evento',
        startDate:'Inicio',endDate:'Fin',location:'Ubicación',locationPlaceholder:'Agregar ubicación',
        description:'Descripción',calendar:'Calendario',color:'Color',defaultColor:'Predeterminado',
        reminder:'Recordatorio',minutes:'min',recurrence:'Recurrencia',noRecurrence:'Sin recurrencia',
        daily:'Diario',weekly:'Semanal',monthly:'Mensual',yearly:'Anual',
        attendees:'Asistentes',attendeesPlaceholder:'email1@x.com, email2@x.com',
        cancel:'Cancelar',create:'Crear',update:'Actualizar',edit:'Editar',delete:'Eliminar',
        noEvents:'Sin eventos',notConnected:'Conecte su cuenta de Google Calendar',setupAccount:'Configurar cuenta',
        deleteConfirm:'¿Está seguro de que desea eliminar este evento?',
        mon:'Lun',tue:'Mar',wed:'Mié',thu:'Jue',fri:'Vie',sat:'Sáb',sun:'Dom',
        months:'Enero,Febrero,Marzo,Abril,Mayo,Junio,Julio,Agosto,Septiembre,Octubre,Noviembre,Diciembre'
      }
    };

    LANGS.ru = { ...LANGS.en, settingsTitle:'Google Calendar Settings' };
    LANGS.zh = { ...LANGS.en, settingsTitle:'Google Calendar Settings' };
    LANGS.ja = { ...LANGS.en, settingsTitle:'Google Calendar Settings' };
    LANGS.it = { ...LANGS.en, settingsTitle:'Google Calendar Settings' };
    LANGS.ar = { ...LANGS.en, settingsTitle:'Google Calendar Settings' };
    LANGS.ko = { ...LANGS.en, settingsTitle:'Google Calendar Settings' };
    LANGS.hi = { ...LANGS.en, settingsTitle:'Google Calendar Settings' };
    LANGS.pt = { ...LANGS.en, settingsTitle:'Google Calendar Settings' };

    const lang = ref((window.__CLOUD_LANG__ || 'tr').toLowerCase());
    const L = (key) => (LANGS[lang.value] || LANGS['en'])?.[key] || LANGS['en']?.[key] || key;

    const API = '/api/gcalendar';
    const headers = () => {
      const h = { 'Content-Type': 'application/json' };
      const t = (document.cookie.match(/(?:^|; )token=([^;]*)/) || [])[1]
             || window.__AUTH_TOKEN__
             || localStorage.getItem('token');
      if (t) h['Authorization'] = 'Bearer ' + t;
      return h;
    };

    // State
    const view = ref('loading');
    const viewMode = ref('month');
    const authenticated = ref(false);
    const email = ref('');
    const clientId = ref('');
    const clientSecret = ref('');
    const redirectUri = ref('urn:ietf:wg:oauth:2.0:oob');
    const saving = ref(false);
    const authLoading = ref(false);
    const codeLoading = ref(false);
    const authUrl = ref('');
    const authCode = ref('');

    const calendars = ref([]);
    const selectedCalendarId = ref('');
    const events = ref([]);
    const currentDate = ref(new Date());

    const eventDetailVisible = ref(false);
    const selectedEvent = ref(null);
    const createDialogVisible = ref(false);
    const editingEvent = ref(null);
    const dayDetailVisible = ref(false);
    const dayDetailDate = ref('');
    const dayDetailTitle = ref('');
    const dayDetailEvents = ref([]);

    const form = ref({
      title: '', startDate: '', endDate: '', allDay: false,
      location: '', description: '', calendarId: '', colorId: '',
      reminderMinutes: 10, recurrence: '', attendeesStr: ''
    });

    const eventColors = [
      { label: 'Lavender', background: '#7986cb' },
      { label: 'Sage', background: '#33b679' },
      { label: 'Grape', background: '#8e24aa' },
      { label: 'Flamingo', background: '#e67c73' },
      { label: 'Banana', background: '#f6bf26' },
      { label: 'Tangerine', background: '#f4511e' },
      { label: 'Peacock', background: '#039be5' },
      { label: 'Graphite', background: '#616161' },
      { label: 'Blueberry', background: '#3f51b5' },
      { label: 'Basil', background: '#0b8043' },
      { label: 'Tomato', background: '#d50000' }
    ];

    const monthNames = computed(() => L('months').split(','));
    const weekDays = computed(() => [L('mon'), L('tue'), L('wed'), L('thu'), L('fri'), L('sat'), L('sun')]);

    const writableCalendars = computed(() =>
      calendars.value.filter(c => c.accessRole === 'owner' || c.accessRole === 'writer')
    );

    const monthLabel = computed(() => {
      const d = currentDate.value;
      return `${monthNames.value[d.getMonth()]} ${d.getFullYear()}`;
    });

    // Month grid computation
    const monthDays = computed(() => {
      const d = currentDate.value;
      const year = d.getFullYear();
      const month = d.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      let startOffset = (firstDay.getDay() + 6) % 7; // Monday start
      const days = [];
      const today = new Date();
      const todayStr = fmtDate(today);

      // Previous month days
      for (let i = startOffset - 1; i >= 0; i--) {
        const dd = new Date(year, month, -i);
        const ds = fmtDate(dd);
        days.push({ day: dd.getDate(), date: ds, current: false, isToday: ds === todayStr, events: getEventsForDate(ds) });
      }
      // Current month days
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const dd = new Date(year, month, i);
        const ds = fmtDate(dd);
        days.push({ day: i, date: ds, current: true, isToday: ds === todayStr, events: getEventsForDate(ds) });
      }
      // Next month fill
      const remaining = 42 - days.length;
      for (let i = 1; i <= remaining; i++) {
        const dd = new Date(year, month + 1, i);
        const ds = fmtDate(dd);
        days.push({ day: i, date: ds, current: false, isToday: ds === todayStr, events: getEventsForDate(ds) });
      }
      return days;
    });

    // Week view
    const weekViewDays = computed(() => {
      const d = currentDate.value;
      const dayOfWeek = (d.getDay() + 6) % 7;
      const monday = new Date(d);
      monday.setDate(d.getDate() - dayOfWeek);
      const today = fmtDate(new Date());
      const daysArr = weekDays.value;
      const result = [];
      for (let i = 0; i < 7; i++) {
        const dd = new Date(monday);
        dd.setDate(monday.getDate() + i);
        const ds = fmtDate(dd);
        const dayEvents = getEventsForDate(ds).filter(e => !e.allDay).map(e => {
          const st = parseTime(e.startTime);
          const et = parseTime(e.endTime);
          return { ...e, top: st * 50 / 60, height: Math.max((et - st) * 50 / 60, 20) };
        });
        result.push({ dateStr: ds, day: dd.getDate(), dayName: daysArr[i], isToday: ds === today, events: dayEvents });
      }
      return result;
    });

    // Day view
    const currentDateStr = computed(() => fmtDate(currentDate.value));
    const dayViewTitle = computed(() => {
      const d = currentDate.value;
      const days = weekDays.value;
      const dayIdx = (d.getDay() + 6) % 7;
      return `${days[dayIdx]}, ${d.getDate()} ${monthNames.value[d.getMonth()]} ${d.getFullYear()}`;
    });
    const dayViewEvents = computed(() => {
      return getEventsForDate(currentDateStr.value).filter(e => !e.allDay).map(e => {
        const st = parseTime(e.startTime);
        const et = parseTime(e.endTime);
        return { ...e, top: st * 50 / 60, height: Math.max((et - st) * 50 / 60, 20) };
      });
    });

    function fmtDate(d) {
      return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    }
    function parseTime(t) {
      if (!t) return 0;
      const [h, m] = t.split(':').map(Number);
      return h * 60 + (m || 0);
    }

    function getEventsForDate(dateStr) {
      return events.value.filter(e => {
        if (e.startDate === dateStr) return true;
        if (e.allDay && e.endDate && dateStr >= e.startDate && dateStr < e.endDate) return true;
        return false;
      });
    }

    // API calls
    async function fetchConfig() {
      try {
        const r = await fetch(`${API}/config`, { headers: headers() });
        const d = await r.json();
        clientId.value = d.clientId || '';
        clientSecret.value = d.clientSecret ? '••••' : '';
        redirectUri.value = d.redirectUri || 'urn:ietf:wg:oauth:2.0:oob';
        authenticated.value = d.authenticated;
        email.value = d.email || '';
        if (authenticated.value) {
          view.value = 'calendar';
          await loadCalendars();
          await loadEvents();
        } else {
          view.value = clientId.value ? 'settings' : 'welcome';
        }
      } catch {
        view.value = 'welcome';
      }
    }

    async function saveConfig() {
      saving.value = true;
      try {
        await fetch(`${API}/config`, {
          method: 'POST', headers: headers(),
          body: JSON.stringify({
            clientId: clientId.value,
            clientSecret: clientSecret.value === '••••' ? undefined : clientSecret.value,
            redirectUri: redirectUri.value
          })
        });
        ElMessage.success(L('save') + ' ✓');
      } catch {} finally { saving.value = false; }
    }

    async function startAuth() {
      authLoading.value = true;
      try {
        const r = await fetch(`${API}/auth-url`, { headers: headers() });
        const d = await r.json();
        if (d.url) {
          authUrl.value = d.url;
          window.open(d.url, '_blank', 'noopener,noreferrer');
        }
      } catch {} finally { authLoading.value = false; }
    }

    async function submitCode() {
      if (!authCode.value.trim()) return;
      codeLoading.value = true;
      try {
        const r = await fetch(`${API}/auth-callback`, {
          method: 'POST', headers: headers(),
          body: JSON.stringify({ code: authCode.value.trim() })
        });
        const d = await r.json();
        if (d.ok) {
          authenticated.value = true;
          email.value = d.email || '';
          authUrl.value = '';
          authCode.value = '';
          view.value = 'calendar';
          await loadCalendars();
          await loadEvents();
        } else {
          ElMessage.error(d.error || 'Auth failed');
        }
      } catch { ElMessage.error('Auth error'); } finally { codeLoading.value = false; }
    }

    async function disconnect() {
      await fetch(`${API}/disconnect`, { method: 'POST', headers: headers() });
      authenticated.value = false;
      email.value = '';
      calendars.value = [];
      events.value = [];
      view.value = 'settings';
    }

    async function loadCalendars() {
      try {
        const r = await fetch(`${API}/calendars`, { headers: headers() });
        calendars.value = await r.json();
        if (calendars.value.length && !form.value.calendarId) {
          const primary = calendars.value.find(c => c.primary);
          form.value.calendarId = primary ? primary.id : calendars.value[0].id;
        }
      } catch {}
    }

    async function loadEvents() {
      const d = currentDate.value;
      const year = d.getFullYear();
      const month = d.getMonth();
      let timeMin, timeMax;
      if (viewMode.value === 'month') {
        timeMin = new Date(year, month - 1, 1).toISOString();
        timeMax = new Date(year, month + 2, 0).toISOString();
      } else if (viewMode.value === 'week') {
        const dayOfWeek = (d.getDay() + 6) % 7;
        const monday = new Date(d);
        monday.setDate(d.getDate() - dayOfWeek);
        timeMin = monday.toISOString();
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 7);
        timeMax = sunday.toISOString();
      } else {
        timeMin = new Date(year, month, d.getDate()).toISOString();
        timeMax = new Date(year, month, d.getDate() + 1).toISOString();
      }
      const params = new URLSearchParams({ timeMin, timeMax });
      if (selectedCalendarId.value) params.set('calendarId', selectedCalendarId.value);
      try {
        const r = await fetch(`${API}/events?${params}`, { headers: headers() });
        const data = await r.json();
        events.value = (data || []).map(normalizeEvent);
      } catch { events.value = []; }
    }

    function normalizeEvent(e) {
      const start = e.start?.dateTime || e.start?.date || '';
      const end = e.end?.dateTime || e.end?.date || '';
      const allDay = !e.start?.dateTime;
      const startD = start.substring(0, 10);
      const endD = end.substring(0, 10);
      const startTime = allDay ? '' : start.substring(11, 16);
      const endTime = allDay ? '' : end.substring(11, 16);
      const cal = calendars.value.find(c => c.id === e.calendarId);
      const colorIdx = e.colorId ? parseInt(e.colorId) : 0;
      const color = colorIdx && eventColors[colorIdx - 1] ? eventColors[colorIdx - 1].background : (cal?.backgroundColor || '#4285f4');
      return {
        id: e.id,
        calendarId: e.calendarId || '',
        calendarName: cal?.summary || '',
        title: e.summary || '(No title)',
        allDay,
        startDate: startD,
        endDate: endD,
        startTime,
        endTime,
        dateLabel: startD,
        location: e.location || '',
        description: e.description || '',
        color,
        colorId: e.colorId || '',
        attendees: e.attendees || [],
        recurrence: e.recurrence || [],
        reminders: e.reminders || {},
        htmlLink: e.htmlLink || '',
        raw: e
      };
    }

    // Navigation
    function goToday() {
      currentDate.value = new Date();
      loadEvents();
    }
    function goPrev() {
      const d = new Date(currentDate.value);
      if (viewMode.value === 'month') d.setMonth(d.getMonth() - 1);
      else if (viewMode.value === 'week') d.setDate(d.getDate() - 7);
      else d.setDate(d.getDate() - 1);
      currentDate.value = d;
      loadEvents();
    }
    function goNext() {
      const d = new Date(currentDate.value);
      if (viewMode.value === 'month') d.setMonth(d.getMonth() + 1);
      else if (viewMode.value === 'week') d.setDate(d.getDate() + 7);
      else d.setDate(d.getDate() + 1);
      currentDate.value = d;
      loadEvents();
    }
    watch(viewMode, () => loadEvents());

    // Dialogs
    function openEventDetail(ev) {
      selectedEvent.value = ev;
      eventDetailVisible.value = true;
    }
    function openDayDetail(day) {
      dayDetailDate.value = day.date;
      dayDetailTitle.value = day.date;
      dayDetailEvents.value = day.events || getEventsForDate(day.date);
      dayDetailVisible.value = true;
    }
    function openCreateDialog(dateStr) {
      editingEvent.value = null;
      const now = new Date();
      const base = dateStr || fmtDate(now);
      const hour = String(now.getHours()).padStart(2, '0');
      const nextHour = String(Math.min(now.getHours() + 1, 23)).padStart(2, '0');
      form.value = {
        title: '',
        startDate: base + 'T' + hour + ':00:00',
        endDate: base + 'T' + nextHour + ':00:00',
        allDay: false,
        location: '',
        description: '',
        calendarId: form.value.calendarId || (writableCalendars.value[0]?.id || ''),
        colorId: '',
        reminderMinutes: 10,
        recurrence: '',
        attendeesStr: ''
      };
      createDialogVisible.value = true;
      dayDetailVisible.value = false;
    }
    function editEvent(ev) {
      editingEvent.value = ev;
      eventDetailVisible.value = false;
      form.value = {
        title: ev.title,
        startDate: ev.allDay ? ev.startDate + 'T09:00:00' : ev.startDate + 'T' + ev.startTime + ':00',
        endDate: ev.allDay ? (ev.endDate || ev.startDate) + 'T10:00:00' : (ev.endDate || ev.startDate) + 'T' + ev.endTime + ':00',
        allDay: ev.allDay,
        location: ev.location,
        description: ev.description,
        calendarId: ev.calendarId || form.value.calendarId,
        colorId: ev.colorId || '',
        reminderMinutes: ev.reminders?.overrides?.[0]?.minutes || 10,
        recurrence: ev.recurrence?.[0] || '',
        attendeesStr: (ev.attendees || []).map(a => a.email).join(', ')
      };
      createDialogVisible.value = true;
    }

    async function saveEvent() {
      if (!form.value.title.trim()) return ElMessage.warning(L('eventTitle'));
      saving.value = true;
      const f = form.value;
      const body = {
        summary: f.title,
        location: f.location,
        description: f.description,
        calendarId: f.calendarId,
        colorId: f.colorId || undefined,
        start: f.allDay ? { date: f.startDate.substring(0, 10) } : { dateTime: f.startDate, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        end: f.allDay ? { date: f.endDate.substring(0, 10) } : { dateTime: f.endDate, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        reminders: f.reminderMinutes > 0 ? { useDefault: false, overrides: [{ method: 'popup', minutes: f.reminderMinutes }] } : { useDefault: true },
        recurrence: f.recurrence ? [f.recurrence] : undefined,
        attendees: f.attendeesStr ? f.attendeesStr.split(',').map(e => ({ email: e.trim() })).filter(e => e.email) : undefined
      };
      try {
        const url = editingEvent.value
          ? `${API}/events/${encodeURIComponent(editingEvent.value.calendarId)}/${encodeURIComponent(editingEvent.value.id)}`
          : `${API}/events`;
        const method = editingEvent.value ? 'PUT' : 'POST';
        const r = await fetch(url, { method, headers: headers(), body: JSON.stringify(body) });
        const d = await r.json();
        if (d.error) { ElMessage.error(d.error); return; }
        createDialogVisible.value = false;
        await loadEvents();
        ElMessage.success(editingEvent.value ? L('update') + ' ✓' : L('create') + ' ✓');
      } catch { ElMessage.error('Error'); } finally { saving.value = false; }
    }

    async function deleteEvent(ev) {
      if (!ev) return;
      try {
        await ElMessageBox.confirm(L('deleteConfirm'), { type: 'warning' });
      } catch { return; }
      try {
        await fetch(`${API}/events/${encodeURIComponent(ev.calendarId || 'primary')}/${encodeURIComponent(ev.id)}`, {
          method: 'DELETE', headers: headers()
        });
        eventDetailVisible.value = false;
        await loadEvents();
        ElMessage.success(L('delete') + ' ✓');
      } catch {}
    }

    function copyUrl() {
      navigator.clipboard.writeText(authUrl.value).catch(() => {});
      ElMessage.success('Copied!');
    }

    onMounted(() => fetchConfig());

    return {
      L, view, viewMode, authenticated, email, clientId, clientSecret, redirectUri,
      saving, authLoading, codeLoading, authUrl, authCode,
      calendars, selectedCalendarId, events, currentDate, monthLabel, weekDays,
      monthDays, weekViewDays, currentDateStr, dayViewTitle, dayViewEvents,
      writableCalendars, eventColors,
      eventDetailVisible, selectedEvent, createDialogVisible, editingEvent,
      dayDetailVisible, dayDetailDate, dayDetailTitle, dayDetailEvents,
      form,
      saveConfig, startAuth, submitCode, disconnect, copyUrl,
      loadEvents, goToday, goPrev, goNext,
      openEventDetail, openDayDetail, openCreateDialog, editEvent, saveEvent, deleteEvent
    };
  }
})