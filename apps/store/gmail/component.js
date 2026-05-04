({
  setup() {
    const { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } = Vue;
    const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success: console.log, error: console.error, warning: console.warn, info: console.log };
    const ElMessageBox = (window.ElementPlus && window.ElementPlus.ElMessageBox) || { confirm: () => Promise.resolve() };

    const LANGS = {
      tr: {
        title:'Gmail', inbox:'Gelen Kutusu', sent:'Gönderilenler', drafts:'Taslaklar', trash:'Çöp Kutusu',
        starred:'Yıldızlı', important:'Önemli', spam:'Spam', allMail:'Tüm Postalar',
        compose:'Yeni Mail', settings:'Ayarlar', to:'Kime', cc:'CC', bcc:'BCC',
        subject:'Konu', send:'Gönder', sending:'Gönderiliyor...', sendSuccess:'Mail gönderildi',
        sendError:'Gönderme hatası', reply:'Yanıtla', forward:'İlet', delete:'Sil',
        markRead:'Okundu', markUnread:'Okunmadı', from:'Kimden', date:'Tarih', back:'Geri',
        noMails:'Mail yok', loading:'Yükleniyor...', noSubject:'(Konu yok)', refresh:'Yenile',
        all:'Tümü', unread:'Okunmamış', search:'Ara...', loadMore:'Daha fazla yükle',
        setup:'Kurulum', clientId:'Client ID', clientSecret:'Client Secret', redirectUri:'Redirect URI',
        save:'Kaydet', connect:'Bağlan', disconnect:'Bağlantıyı Kes', connected:'Bağlı',
        notConnected:'Bağlı değil', authCode:'Yetkilendirme Kodu', authorize:'Yetkilendir',
        pasteCode:'Kodu yapıştırın', setupDesc:'Google Cloud Console\'dan OAuth2 kimlik bilgileri gerekli',
        checkInterval:'Kontrol Aralığı (dk)', attachments:'Ekler', download:'İndir',
        searchContacts:'Kişi ara...', noContacts:'Kişi bulunamadı'
      },
      en: {
        title:'Gmail', inbox:'Inbox', sent:'Sent', drafts:'Drafts', trash:'Trash',
        starred:'Starred', important:'Important', spam:'Spam', allMail:'All Mail',
        compose:'Compose', settings:'Settings', to:'To', cc:'CC', bcc:'BCC',
        subject:'Subject', send:'Send', sending:'Sending...', sendSuccess:'Mail sent',
        sendError:'Send error', reply:'Reply', forward:'Forward', delete:'Delete',
        markRead:'Mark read', markUnread:'Mark unread', from:'From', date:'Date', back:'Back',
        noMails:'No mails', loading:'Loading...', noSubject:'(No Subject)', refresh:'Refresh',
        all:'All', unread:'Unread', search:'Search...', loadMore:'Load more',
        setup:'Setup', clientId:'Client ID', clientSecret:'Client Secret', redirectUri:'Redirect URI',
        save:'Save', connect:'Connect', disconnect:'Disconnect', connected:'Connected',
        notConnected:'Not connected', authCode:'Authorization Code', authorize:'Authorize',
        pasteCode:'Paste the code', setupDesc:'OAuth2 credentials from Google Cloud Console required',
        checkInterval:'Check Interval (min)', attachments:'Attachments', download:'Download',
        searchContacts:'Search contacts...', noContacts:'No contacts found'
      },
      de: {
        title:'Gmail', inbox:'Posteingang', sent:'Gesendet', drafts:'Entwürfe', trash:'Papierkorb',
        starred:'Markiert', important:'Wichtig', spam:'Spam', allMail:'Alle Mails',
        compose:'Verfassen', settings:'Einstellungen', to:'An', cc:'CC', bcc:'BCC',
        subject:'Betreff', send:'Senden', sending:'Wird gesendet...', sendSuccess:'Mail gesendet',
        sendError:'Sendefehler', reply:'Antworten', forward:'Weiterleiten', delete:'Löschen',
        markRead:'Gelesen', markUnread:'Ungelesen', from:'Von', date:'Datum', back:'Zurück',
        noMails:'Keine Mails', loading:'Laden...', noSubject:'(Kein Betreff)', refresh:'Aktualisieren',
        all:'Alle', unread:'Ungelesen', search:'Suchen...', loadMore:'Mehr laden',
        setup:'Einrichtung', clientId:'Client ID', clientSecret:'Client Secret', redirectUri:'Redirect URI',
        save:'Speichern', connect:'Verbinden', disconnect:'Trennen', connected:'Verbunden',
        notConnected:'Nicht verbunden', authCode:'Autorisierungscode', authorize:'Autorisieren',
        pasteCode:'Code einfügen', setupDesc:'OAuth2-Anmeldedaten aus der Google Cloud Console erforderlich',
        checkInterval:'Prüfintervall (Min)', attachments:'Anhänge', download:'Herunterladen',
        searchContacts:'Kontakte suchen...', noContacts:'Keine Kontakte gefunden'
      },
      fr: {
        title:'Gmail', inbox:'Boîte de réception', sent:'Envoyés', drafts:'Brouillons', trash:'Corbeille',
        starred:'Favoris', important:'Important', spam:'Spam', allMail:'Tous',
        compose:'Rédiger', settings:'Paramètres', to:'À', cc:'CC', bcc:'CCI',
        subject:'Objet', send:'Envoyer', sending:'Envoi...', sendSuccess:'Mail envoyé',
        sendError:'Erreur d\'envoi', reply:'Répondre', forward:'Transférer', delete:'Supprimer',
        markRead:'Lu', markUnread:'Non lu', from:'De', date:'Date', back:'Retour',
        noMails:'Pas de mails', loading:'Chargement...', noSubject:'(Sans objet)', refresh:'Actualiser',
        all:'Tous', unread:'Non lus', search:'Rechercher...', loadMore:'Charger plus',
        setup:'Configuration', clientId:'Client ID', clientSecret:'Client Secret', redirectUri:'URI de redirection',
        save:'Enregistrer', connect:'Connecter', disconnect:'Déconnecter', connected:'Connecté',
        notConnected:'Non connecté', authCode:'Code d\'autorisation', authorize:'Autoriser',
        pasteCode:'Collez le code', setupDesc:'Identifiants OAuth2 de Google Cloud Console requis',
        checkInterval:'Intervalle (min)', attachments:'Pièces jointes', download:'Télécharger',
        searchContacts:'Rechercher...', noContacts:'Aucun contact trouvé'
      },
      es: {
        title:'Gmail', inbox:'Bandeja de entrada', sent:'Enviados', drafts:'Borradores', trash:'Papelera',
        starred:'Destacados', important:'Importante', spam:'Spam', allMail:'Todos',
        compose:'Redactar', settings:'Ajustes', to:'Para', cc:'CC', bcc:'CCO',
        subject:'Asunto', send:'Enviar', sending:'Enviando...', sendSuccess:'Correo enviado',
        sendError:'Error de envío', reply:'Responder', forward:'Reenviar', delete:'Eliminar',
        markRead:'Leído', markUnread:'No leído', from:'De', date:'Fecha', back:'Atrás',
        noMails:'Sin correos', loading:'Cargando...', noSubject:'(Sin asunto)', refresh:'Actualizar',
        all:'Todos', unread:'No leídos', search:'Buscar...', loadMore:'Cargar más',
        setup:'Configuración', clientId:'Client ID', clientSecret:'Client Secret', redirectUri:'URI de redirección',
        save:'Guardar', connect:'Conectar', disconnect:'Desconectar', connected:'Conectado',
        notConnected:'No conectado', authCode:'Código de autorización', authorize:'Autorizar',
        pasteCode:'Pegue el código', setupDesc:'Se requieren credenciales OAuth2 de Google Cloud Console',
        checkInterval:'Intervalo (min)', attachments:'Adjuntos', download:'Descargar',
        searchContacts:'Buscar contactos...', noContacts:'No se encontraron contactos'
      },
      ru: {
        title:'Gmail', inbox:'Входящие', sent:'Отправленные', drafts:'Черновики', trash:'Корзина',
        starred:'Помеченные', important:'Важные', spam:'Спам', allMail:'Все письма',
        compose:'Написать', settings:'Настройки', to:'Кому', cc:'Копия', bcc:'Скрытая',
        subject:'Тема', send:'Отправить', sending:'Отправка...', sendSuccess:'Письмо отправлено',
        sendError:'Ошибка отправки', reply:'Ответить', forward:'Переслать', delete:'Удалить',
        markRead:'Прочитано', markUnread:'Не прочитано', from:'От', date:'Дата', back:'Назад',
        noMails:'Нет писем', loading:'Загрузка...', noSubject:'(Без темы)', refresh:'Обновить',
        all:'Все', unread:'Непрочитанные', search:'Поиск...', loadMore:'Загрузить ещё',
        setup:'Настройка', clientId:'Client ID', clientSecret:'Client Secret', redirectUri:'Redirect URI',
        save:'Сохранить', connect:'Подключить', disconnect:'Отключить', connected:'Подключено',
        notConnected:'Не подключено', authCode:'Код авторизации', authorize:'Авторизовать',
        pasteCode:'Вставьте код', setupDesc:'Требуются учётные данные OAuth2 из Google Cloud Console',
        checkInterval:'Интервал (мин)', attachments:'Вложения', download:'Скачать',
        searchContacts:'Поиск контактов...', noContacts:'Контакты не найдены'
      }
    };

    LANGS.zh = { ...LANGS.en, title:'Gmail' };
    LANGS.ja = { ...LANGS.en, title:'Gmail' };
    LANGS.it = { ...LANGS.en, title:'Gmail' };
    LANGS.ar = { ...LANGS.en, title:'Gmail' };
    LANGS.ko = { ...LANGS.en, title:'Gmail' };
    LANGS.hi = { ...LANGS.en, title:'Gmail' };
    LANGS.pt = { ...LANGS.en, title:'Gmail' };

    function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }
    const locale = ref(getLocale());
    function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
    function getToken() { try { return localStorage.getItem('auth_token') || ''; } catch { return ''; } }
    function authHeaders() { return { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }

    // State
    const view = ref('list');  // list | read | compose | settings
    const activeLabel = ref('INBOX');
    const messages = ref([]);
    const nextPageToken = ref(null);
    const selectedMsg = ref(null);
    const loading = ref(false);
    const loadingMore = ref(false);
    const searchQuery = ref('');
    const filterUnread = ref(false);

    // Config
    const gmailConfig = reactive({ clientId: '', clientSecret: '', redirectUri: '', authenticated: false, email: '', checkInterval: 5 });
    const authUrl = ref('');
    const authCode = ref('');
    const configSaving = ref(false);

    // Compose
    const compose = reactive({ to: '', cc: '', bcc: '', subject: '', text: '', showCc: false, inReplyTo: '', references: '' });
    const sendingMail = ref(false);

    // Contact picker
    const showContactPicker = ref(false);
    const cpSearch = ref('');
    const cpContacts = ref([]);

    // Labels
    const LABEL_MAP = {
      INBOX: { icon: '📥', order: 1 },
      SENT: { icon: '📤', order: 2 },
      DRAFT: { icon: '📝', order: 3 },
      STARRED: { icon: '⭐', order: 4 },
      IMPORTANT: { icon: '🏷️', order: 5 },
      SPAM: { icon: '⚠️', order: 6 },
      TRASH: { icon: '🗑️', order: 7 }
    };

    function labelName(id) {
      const map = { INBOX: L('inbox'), SENT: L('sent'), DRAFT: L('drafts'), STARRED: L('starred'), IMPORTANT: L('important'), SPAM: L('spam'), TRASH: L('trash') };
      return map[id] || id;
    }
    function labelIcon(id) { return LABEL_MAP[id]?.icon || '📁'; }

    const folders = computed(() => [
      { id: 'INBOX', icon: '📥', name: L('inbox') },
      { id: 'SENT', icon: '📤', name: L('sent') },
      { id: 'DRAFT', icon: '📝', name: L('drafts') },
      { id: 'STARRED', icon: '⭐', name: L('starred') },
      { id: 'IMPORTANT', icon: '🏷️', name: L('important') },
      { id: 'SPAM', icon: '⚠️', name: L('spam') },
      { id: 'TRASH', icon: '🗑️', name: L('trash') }
    ]);

    const unreadCount = computed(() => messages.value.filter(m => m.unread).length);

    const filteredMessages = computed(() => {
      if (!filterUnread.value) return messages.value;
      return messages.value.filter(m => m.unread);
    });

    // Load config
    async function loadConfig() {
      try {
        const r = await fetch('/api/gmail/config', { headers: authHeaders() });
        if (r.ok) {
          const d = await r.json();
          Object.assign(gmailConfig, d);
        }
      } catch {}
    }

    // Save config
    async function saveConfig() {
      configSaving.value = true;
      try {
        await fetch('/api/gmail/config', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({ clientId: gmailConfig.clientId, clientSecret: gmailConfig.clientSecret, redirectUri: gmailConfig.redirectUri, checkInterval: gmailConfig.checkInterval })
        });
        ElMessage.success(L('save') + ' ✓');
      } catch { ElMessage.error('Error'); }
      configSaving.value = false;
    }

    // Get auth URL
    async function getAuthUrl() {
      try {
        const r = await fetch('/api/gmail/auth-url', { headers: authHeaders() });
        if (r.ok) {
          const d = await r.json();
          authUrl.value = d.url;
          window.open(d.url, '_blank', 'noopener');
        } else {
          const e = await r.json();
          ElMessage.error(e.error || 'Error');
        }
      } catch { ElMessage.error('Error'); }
    }

    // Submit auth code
    async function submitAuthCode() {
      if (!authCode.value) return;
      try {
        const r = await fetch('/api/gmail/auth-callback', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({ code: authCode.value })
        });
        if (r.ok) {
          const d = await r.json();
          gmailConfig.authenticated = true;
          gmailConfig.email = d.email || '';
          authCode.value = '';
          authUrl.value = '';
          ElMessage.success(L('connected') + ' ✓');
          view.value = 'list';
          await loadMessages();
        } else {
          const e = await r.json();
          ElMessage.error(e.error || 'Error');
        }
      } catch { ElMessage.error('Error'); }
    }

    // Disconnect
    async function disconnect() {
      try {
        await fetch('/api/gmail/disconnect', { method: 'POST', headers: authHeaders() });
        gmailConfig.authenticated = false;
        gmailConfig.email = '';
        messages.value = [];
        ElMessage.success(L('disconnect') + ' ✓');
      } catch {}
    }

    // Load messages
    async function loadMessages(append) {
      if (!gmailConfig.authenticated) return;
      if (append) { loadingMore.value = true; } else { loading.value = true; messages.value = []; nextPageToken.value = null; }
      try {
        let url = '/api/gmail/messages?label=' + encodeURIComponent(activeLabel.value);
        if (searchQuery.value) url += '&q=' + encodeURIComponent(searchQuery.value);
        if (append && nextPageToken.value) url += '&pageToken=' + encodeURIComponent(nextPageToken.value);
        const r = await fetch(url, { headers: authHeaders() });
        if (r.ok) {
          const d = await r.json();
          if (append) { messages.value = [...messages.value, ...(d.messages || [])]; }
          else { messages.value = d.messages || []; }
          nextPageToken.value = d.nextPageToken || null;
        }
      } catch {}
      loading.value = false;
      loadingMore.value = false;
    }

    // Open message
    async function openMessage(msg) {
      loading.value = true;
      try {
        const r = await fetch('/api/gmail/messages/' + msg.id, { headers: authHeaders() });
        if (r.ok) {
          selectedMsg.value = await r.json();
          view.value = 'read';
          if (msg.unread) {
            msg.unread = false;
            fetch('/api/gmail/messages/' + msg.id + '/read', { method: 'POST', headers: authHeaders() }).catch(() => {});
          }
        }
      } catch {}
      loading.value = false;
    }

    // Trash
    async function trashMessage(msg) {
      try {
        const r = await fetch('/api/gmail/messages/' + (msg.id || selectedMsg.value?.id) + '/trash', { method: 'POST', headers: authHeaders() });
        if (r.ok) {
          messages.value = messages.value.filter(m => m.id !== (msg.id || selectedMsg.value?.id));
          if (view.value === 'read') { view.value = 'list'; selectedMsg.value = null; }
          ElMessage.success(L('delete') + ' ✓');
        }
      } catch {}
    }

    // Reply
    function replyTo(msg) {
      resetCompose();
      compose.to = msg.from || '';
      compose.subject = 'Re: ' + (msg.subject || '').replace(/^Re:\s*/i, '');
      compose.text = '\n\n---\n' + (msg.text || msg.snippet || '');
      compose.inReplyTo = msg.id;
      compose.references = msg.id;
      view.value = 'compose';
    }

    // Forward
    function forwardMsg(msg) {
      resetCompose();
      compose.subject = 'Fwd: ' + (msg.subject || '');
      compose.text = '\n\n--- Forwarded ---\n' + L('from') + ': ' + (msg.from || '') + '\n' + L('date') + ': ' + formatDate(msg.date) + '\n' + L('subject') + ': ' + (msg.subject || '') + '\n\n' + (msg.text || msg.snippet || '');
      view.value = 'compose';
    }

    // Send
    async function sendMail() {
      if (!compose.to) return;
      sendingMail.value = true;
      try {
        const r = await fetch('/api/gmail/send', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({
            to: compose.to, cc: compose.cc, bcc: compose.bcc,
            subject: compose.subject, text: compose.text,
            inReplyTo: compose.inReplyTo, references: compose.references
          })
        });
        if (r.ok) {
          ElMessage.success(L('sendSuccess'));
          resetCompose();
          view.value = 'list';
        } else {
          const e = await r.json();
          ElMessage.error(L('sendError') + ': ' + (e.error || ''));
        }
      } catch { ElMessage.error(L('sendError')); }
      sendingMail.value = false;
    }

    function resetCompose() {
      compose.to = ''; compose.cc = ''; compose.bcc = ''; compose.subject = ''; compose.text = '';
      compose.showCc = false; compose.inReplyTo = ''; compose.references = '';
    }

    // Contact picker
    async function loadAllContacts() {
      try {
        const res = await fetch('/api/contacts', { headers: authHeaders() });
        if (res.ok) cpContacts.value = (await res.json()).filter(c => c.email);
      } catch {}
    }

    async function searchContacts() {
      const q = cpSearch.value.trim();
      if (!q) return loadAllContacts();
      try {
        const res = await fetch('/api/contacts/search?q=' + encodeURIComponent(q), { headers: authHeaders() });
        if (res.ok) cpContacts.value = (await res.json()).filter(c => c.email);
      } catch {}
    }

    function pickContact(c) {
      const addr = c.first_name + ' ' + (c.last_name || '') + ' <' + c.email + '>';
      compose.to = compose.to ? compose.to + ', ' + addr.trim() : addr.trim();
      showContactPicker.value = false;
      cpSearch.value = '';
    }

    watch(showContactPicker, (v) => { if (v) loadAllContacts(); });

    // Helpers
    function formatDate(d) {
      if (!d) return '';
      try {
        const dt = new Date(d);
        const now = new Date();
        if (dt.toDateString() === now.toDateString()) return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (dt.getFullYear() === now.getFullYear()) return dt.toLocaleDateString([], { month: 'short', day: 'numeric' });
        return dt.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
      } catch { return d; }
    }

    function shortFrom(from) {
      if (!from) return '';
      const m = from.match(/"?([^"<]+)"?\s*</) || from.match(/([^<@]+)/);
      return m ? m[1].trim() : from;
    }

    function shortSnippet(s) {
      if (!s) return '';
      return s.length > 80 ? s.substring(0, 80) + '…' : s;
    }

    // Watchers
    watch(activeLabel, () => { view.value = 'list'; selectedMsg.value = null; loadMessages(); });

    let searchTimeout = null;
    watch(searchQuery, () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => loadMessages(), 500);
    });

    function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

    onMounted(async () => {
      window.addEventListener('locale-changed', onLocaleChanged);
      await loadConfig();
      if (gmailConfig.authenticated) await loadMessages();
      else view.value = 'settings';
    });

    onUnmounted(() => {
      window.removeEventListener('locale-changed', onLocaleChanged);
    });

    return {
      L, view, activeLabel, messages, nextPageToken, selectedMsg, loading, loadingMore,
      searchQuery, filterUnread, unreadCount, filteredMessages, folders,
      gmailConfig, authUrl, authCode, configSaving,
      compose, sendingMail,
      showContactPicker, cpSearch, cpContacts, searchContacts, pickContact,
      loadConfig, saveConfig, getAuthUrl, submitAuthCode, disconnect,
      loadMessages, openMessage, trashMessage, replyTo, forwardMsg,
      sendMail, resetCompose, formatDate, shortFrom, shortSnippet, labelName, labelIcon
    };
  }
})
