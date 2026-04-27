({
  setup() {
    const { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } = Vue;
    const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success: console.log, error: console.error };
    const ElMessageBox = (window.ElementPlus && window.ElementPlus.ElMessageBox) || { confirm: () => Promise.resolve() };

    const LANGS = {
      tr: {
        title:'Mail', inbox:'Gelen Kutusu', sent:'Gönderilenler', drafts:'Taslaklar', compose:'Yeni Mail',
        settings:'Ayarlar', accounts:'Hesaplar', addAccount:'Hesap Ekle', editAccount:'Hesap Düzenle',
        deleteAccount:'Hesap Sil', deleteAccountConfirm:'Bu hesabı silmek istediğinize emin misiniz?',
        email:'E-posta', password:'Şifre', name:'İsim', save:'Kaydet', cancel:'İptal', delete:'Sil',
        smtpHost:'SMTP Sunucu', smtpPort:'SMTP Port', smtpSecure:'SSL/TLS',
        pop3Host:'POP3 Sunucu', pop3Port:'POP3 Port', pop3Tls:'TLS',
        to:'Kime', cc:'CC', bcc:'BCC', subject:'Konu', send:'Gönder', sending:'Gönderiliyor...',
        sendSuccess:'Mail gönderildi', sendError:'Gönderme hatası',
        fetchMail:'Mailleri Al', fetching:'Alınıyor...', fetchSuccess:'yeni mail alındı',
        fetchError:'Alma hatası', noMails:'Mail yok', noAccount:'Hesap eklenmemiş',
        reply:'Yanıtla', forward:'İlet', deleteMsg:'Sil', markRead:'Okundu',
        from:'Kimden', date:'Tarih', back:'Geri', saveDraft:'Taslak Kaydet',
        testConnection:'Bağlantı Test', testSuccess:'Bağlantı başarılı', testFail:'Bağlantı başarısız',
        loading:'Yükleniyor...', attachments:'Ekler', noSubject:'(Konu yok)', refresh:'Yenile',
        all:'Tümü', unread:'Okunmamış'
      },
      en: {
        title:'Mail', inbox:'Inbox', sent:'Sent', drafts:'Drafts', compose:'Compose',
        settings:'Settings', accounts:'Accounts', addAccount:'Add Account', editAccount:'Edit Account',
        deleteAccount:'Delete Account', deleteAccountConfirm:'Are you sure you want to delete this account?',
        email:'Email', password:'Password', name:'Name', save:'Save', cancel:'Cancel', delete:'Delete',
        smtpHost:'SMTP Server', smtpPort:'SMTP Port', smtpSecure:'SSL/TLS',
        pop3Host:'POP3 Server', pop3Port:'POP3 Port', pop3Tls:'TLS',
        to:'To', cc:'CC', bcc:'BCC', subject:'Subject', send:'Send', sending:'Sending...',
        sendSuccess:'Mail sent', sendError:'Send error',
        fetchMail:'Fetch Mail', fetching:'Fetching...', fetchSuccess:'new mails fetched',
        fetchError:'Fetch error', noMails:'No mails', noAccount:'No account configured',
        reply:'Reply', forward:'Forward', deleteMsg:'Delete', markRead:'Mark read',
        from:'From', date:'Date', back:'Back', saveDraft:'Save Draft',
        testConnection:'Test Connection', testSuccess:'Connection successful', testFail:'Connection failed',
        loading:'Loading...', attachments:'Attachments', noSubject:'(No Subject)', refresh:'Refresh',
        all:'All', unread:'Unread'
      },
      de: {
        title:'Mail', inbox:'Posteingang', sent:'Gesendet', drafts:'Entwürfe', compose:'Verfassen',
        settings:'Einstellungen', accounts:'Konten', addAccount:'Konto hinzufügen', editAccount:'Konto bearbeiten',
        deleteAccount:'Konto löschen', deleteAccountConfirm:'Möchten Sie dieses Konto wirklich löschen?',
        email:'E-Mail', password:'Passwort', name:'Name', save:'Speichern', cancel:'Abbrechen', delete:'Löschen',
        smtpHost:'SMTP-Server', smtpPort:'SMTP-Port', smtpSecure:'SSL/TLS',
        pop3Host:'POP3-Server', pop3Port:'POP3-Port', pop3Tls:'TLS',
        to:'An', cc:'CC', bcc:'BCC', subject:'Betreff', send:'Senden', sending:'Wird gesendet...',
        sendSuccess:'Mail gesendet', sendError:'Sendefehler',
        fetchMail:'Mails abrufen', fetching:'Wird abgerufen...', fetchSuccess:'neue Mails abgerufen',
        fetchError:'Abruffehler', noMails:'Keine Mails', noAccount:'Kein Konto konfiguriert',
        reply:'Antworten', forward:'Weiterleiten', deleteMsg:'Löschen', markRead:'Gelesen',
        from:'Von', date:'Datum', back:'Zurück', saveDraft:'Entwurf speichern',
        testConnection:'Verbindung testen', testSuccess:'Verbindung erfolgreich', testFail:'Verbindung fehlgeschlagen',
        loading:'Laden...', attachments:'Anhänge', noSubject:'(Kein Betreff)', refresh:'Aktualisieren',
        all:'Alle', unread:'Ungelesen'
      },
      fr: {
        title:'Mail', inbox:'Boîte de réception', sent:'Envoyés', drafts:'Brouillons', compose:'Rédiger',
        settings:'Paramètres', accounts:'Comptes', addAccount:'Ajouter un compte', editAccount:'Modifier le compte',
        deleteAccount:'Supprimer le compte', deleteAccountConfirm:'Voulez-vous vraiment supprimer ce compte ?',
        email:'E-mail', password:'Mot de passe', name:'Nom', save:'Enregistrer', cancel:'Annuler', delete:'Supprimer',
        smtpHost:'Serveur SMTP', smtpPort:'Port SMTP', smtpSecure:'SSL/TLS',
        pop3Host:'Serveur POP3', pop3Port:'Port POP3', pop3Tls:'TLS',
        to:'À', cc:'CC', bcc:'CCI', subject:'Objet', send:'Envoyer', sending:'Envoi en cours...',
        sendSuccess:'Mail envoyé', sendError:'Erreur d\'envoi',
        fetchMail:'Récupérer', fetching:'Récupération...', fetchSuccess:'nouveaux mails récupérés',
        fetchError:'Erreur de récupération', noMails:'Pas de mails', noAccount:'Aucun compte configuré',
        reply:'Répondre', forward:'Transférer', deleteMsg:'Supprimer', markRead:'Marquer comme lu',
        from:'De', date:'Date', back:'Retour', saveDraft:'Enreg. brouillon',
        testConnection:'Tester connexion', testSuccess:'Connexion réussie', testFail:'Connexion échouée',
        loading:'Chargement...', attachments:'Pièces jointes', noSubject:'(Sans objet)', refresh:'Actualiser',
        all:'Tous', unread:'Non lus'
      },
      es: {
        title:'Correo', inbox:'Bandeja de entrada', sent:'Enviados', drafts:'Borradores', compose:'Redactar',
        settings:'Ajustes', accounts:'Cuentas', addAccount:'Agregar cuenta', editAccount:'Editar cuenta',
        deleteAccount:'Eliminar cuenta', deleteAccountConfirm:'¿Está seguro de que desea eliminar esta cuenta?',
        email:'Correo', password:'Contraseña', name:'Nombre', save:'Guardar', cancel:'Cancelar', delete:'Eliminar',
        smtpHost:'Servidor SMTP', smtpPort:'Puerto SMTP', smtpSecure:'SSL/TLS',
        pop3Host:'Servidor POP3', pop3Port:'Puerto POP3', pop3Tls:'TLS',
        to:'Para', cc:'CC', bcc:'CCO', subject:'Asunto', send:'Enviar', sending:'Enviando...',
        sendSuccess:'Correo enviado', sendError:'Error de envío',
        fetchMail:'Recibir correos', fetching:'Recibiendo...', fetchSuccess:'correos nuevos recibidos',
        fetchError:'Error de recepción', noMails:'Sin correos', noAccount:'Ninguna cuenta configurada',
        reply:'Responder', forward:'Reenviar', deleteMsg:'Eliminar', markRead:'Marcar leído',
        from:'De', date:'Fecha', back:'Atrás', saveDraft:'Guardar borrador',
        testConnection:'Probar conexión', testSuccess:'Conexión exitosa', testFail:'Conexión fallida',
        loading:'Cargando...', attachments:'Adjuntos', noSubject:'(Sin asunto)', refresh:'Actualizar',
        all:'Todos', unread:'No leídos'
      },
      ru: {
        title:'Почта', inbox:'Входящие', sent:'Отправленные', drafts:'Черновики', compose:'Написать',
        settings:'Настройки', accounts:'Аккаунты', addAccount:'Добавить аккаунт', editAccount:'Редактировать',
        deleteAccount:'Удалить аккаунт', deleteAccountConfirm:'Вы действительно хотите удалить этот аккаунт?',
        email:'Email', password:'Пароль', name:'Имя', save:'Сохранить', cancel:'Отмена', delete:'Удалить',
        smtpHost:'SMTP сервер', smtpPort:'SMTP порт', smtpSecure:'SSL/TLS',
        pop3Host:'POP3 сервер', pop3Port:'POP3 порт', pop3Tls:'TLS',
        to:'Кому', cc:'Копия', bcc:'Скрытая', subject:'Тема', send:'Отправить', sending:'Отправка...',
        sendSuccess:'Письмо отправлено', sendError:'Ошибка отправки',
        fetchMail:'Получить почту', fetching:'Получение...', fetchSuccess:'новых писем получено',
        fetchError:'Ошибка получения', noMails:'Нет писем', noAccount:'Аккаунт не настроен',
        reply:'Ответить', forward:'Переслать', deleteMsg:'Удалить', markRead:'Прочитано',
        from:'От', date:'Дата', back:'Назад', saveDraft:'Сохр. черновик',
        testConnection:'Тест соединения', testSuccess:'Соединение успешно', testFail:'Соединение не удалось',
        loading:'Загрузка...', attachments:'Вложения', noSubject:'(Без темы)', refresh:'Обновить',
        all:'Все', unread:'Непрочитанные'
      },
    zh: { title:'邮件', inbox:'收件箱', sent:'已发送', drafts:'草稿', compose:'写邮件', settings:'设置', accounts:'账户', addAccount:'添加账户', editAccount:'编辑账户', deleteAccount:'删除账户', deleteAccountConfirm:'确认删除账户？', email:'邮箱', password:'密码', name:'名称', save:'保存', cancel:'取消', delete:'删除', smtpHost:'SMTP主机', smtpPort:'SMTP端口', smtpSecure:'SMTP加密', pop3Host:'POP3主机', pop3Port:'POP3端口', pop3Tls:'POP3 TLS', to:'收件人', cc:'抄送', bcc:'密送', subject:'主题', send:'发送', sending:'发送中', sendSuccess:'发送成功', sendError:'发送失败', fetchMail:'收取邮件', fetching:'收取中', fetchSuccess:'收取成功', fetchError:'收取失败', noMails:'没有邮件', noAccount:'没有账户', reply:'回复', forward:'转发', deleteMsg:'删除邮件', markRead:'标为已读', from:'发件人', date:'日期', back:'返回', saveDraft:'保存草稿', testConnection:'测试连接', testSuccess:'连接成功', testFail:'连接失败', loading:'加载中', attachments:'附件', noSubject:'无主题', refresh:'刷新', all:'全部', unread:'未读' },
    ja: { title:'メール', inbox:'受信トレイ', sent:'送信済', drafts:'下書き', compose:'新規メール', settings:'設定', accounts:'アカウント', addAccount:'アカウント追加', editAccount:'アカウント編集', deleteAccount:'アカウント削除', deleteAccountConfirm:'アカウントを削除しますか？', email:'メール', password:'パスワード', name:'名前', save:'保存', cancel:'キャンセル', delete:'削除', smtpHost:'SMTPホスト', smtpPort:'SMTPポート', smtpSecure:'SMTPセキュア', pop3Host:'POP3ホスト', pop3Port:'POP3ポート', pop3Tls:'POP3 TLS', to:'宛先', cc:'CC', bcc:'BCC', subject:'件名', send:'送信', sending:'送信中', sendSuccess:'送信成功', sendError:'送信エラー', fetchMail:'メール受信', fetching:'受信中', fetchSuccess:'受信成功', fetchError:'受信エラー', noMails:'メールなし', noAccount:'アカウントなし', reply:'返信', forward:'転送', deleteMsg:'メール削除', markRead:'既読にする', from:'差出人', date:'日付', back:'戻る', saveDraft:'下書き保存', testConnection:'接続テスト', testSuccess:'接続成功', testFail:'接続失敗', loading:'読込中', attachments:'添付ファイル', noSubject:'件名なし', refresh:'更新', all:'すべて', unread:'未読' },
    it: { title:'Posta', inbox:'Posta in arrivo', sent:'Inviata', drafts:'Bozze', compose:'Scrivi', settings:'Impostazioni', accounts:'Account', addAccount:'Aggiungi account', editAccount:'Modifica account', deleteAccount:'Elimina account', deleteAccountConfirm:'Confermi eliminazione account?', email:'Email', password:'Password', name:'Nome', save:'Salva', cancel:'Annulla', delete:'Elimina', smtpHost:'Host SMTP', smtpPort:'Porta SMTP', smtpSecure:'SMTP sicuro', pop3Host:'Host POP3', pop3Port:'Porta POP3', pop3Tls:'POP3 TLS', to:'A', cc:'CC', bcc:'CCN', subject:'Oggetto', send:'Invia', sending:'Invio in corso', sendSuccess:'Invio riuscito', sendError:'Errore invio', fetchMail:'Ricevi posta', fetching:'Ricezione', fetchSuccess:'Ricezione riuscita', fetchError:'Errore ricezione', noMails:'Nessuna mail', noAccount:'Nessun account', reply:'Rispondi', forward:'Inoltra', deleteMsg:'Elimina messaggio', markRead:'Segna come letto', from:'Da', date:'Data', back:'Indietro', saveDraft:'Salva bozza', testConnection:'Test connessione', testSuccess:'Connessione riuscita', testFail:'Connessione fallita', loading:'Caricamento', attachments:'Allegati', noSubject:'Nessun oggetto', refresh:'Aggiorna', all:'Tutte', unread:'Non lette' }
  };

    function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }
    const locale = ref(getLocale());
    function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
    function getToken() { try { return localStorage.getItem('auth_token') || ''; } catch { return ''; } }
    function authHeaders() { return { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }

    // State
    const accounts = ref([]);
    const activeAccountId = ref(null);
    const folder = ref('inbox');       // inbox | sent | drafts
    const view = ref('list');          // list | read | compose | settings | account-form
    const messages = ref([]);
    const selectedMsg = ref(null);
    const loading = ref(false);
    const fetchingMail = ref(false);
    const filterUnread = ref(false);

    // Compose state
    const compose = reactive({ to: '', cc: '', bcc: '', subject: '', text: '', draftId: null, showCc: false });
    const sendingMail = ref(false);
    const sendResult = ref({ type: '', msg: '' });

    // Account form
    const accForm = reactive({ id: null, email: '', name: '', password: '', smtpHost: '', smtpPort: 587, smtpSecure: false, pop3Host: '', pop3Port: 995, pop3Tls: true });
    const accFormError = ref('');
    const testing = reactive({ smtp: false, pop3: false, smtpOk: null, pop3Ok: null });

    const activeAccount = computed(() => accounts.value.find(a => a.id === activeAccountId.value));
    const unreadCount = computed(() => {
      if (folder.value !== 'inbox') return 0;
      return messages.value.filter(m => !m.read).length;
    });
    const filteredMessages = computed(() => {
      if (!filterUnread.value || folder.value !== 'inbox') return messages.value;
      return messages.value.filter(m => !m.read);
    });

    // Load accounts
    async function loadAccounts() {
      try {
        const r = await fetch('/api/mail/accounts', { headers: authHeaders() });
        if (r.ok) {
          const data = await r.json();
          accounts.value = data.accounts || [];
          activeAccountId.value = data.activeAccountId;
        }
      } catch {}
    }

    // Load messages for current folder
    async function loadMessages() {
      if (!activeAccountId.value) { messages.value = []; return; }
      loading.value = true;
      try {
        const r = await fetch('/api/mail/messages/' + folder.value, { headers: authHeaders() });
        if (r.ok) messages.value = await r.json();
      } catch {}
      loading.value = false;
    }

    // Fetch mail via POP3
    async function fetchMail() {
      if (!activeAccountId.value) return;
      fetchingMail.value = true;
      try {
        const r = await fetch('/api/mail/fetch', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({ accountId: activeAccountId.value })
        });
        if (r.ok) {
          const d = await r.json();
          await loadMessages();
          if (d.fetched > 0) ElMessage.success(d.fetched + ' ' + L('fetchSuccess'));
        } else {
          const e = await r.json();
          ElMessage.error(L('fetchError') + ': ' + (e.error || ''));
        }
      } catch (e) { ElMessage.error(L('fetchError')); }
      fetchingMail.value = false;
    }

    // Send mail
    async function sendMail() {
      if (!compose.to) return;
      sendingMail.value = true;
      sendResult.value = { type: '', msg: '' };
      try {
        const r = await fetch('/api/mail/send', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({
            accountId: activeAccountId.value,
            to: compose.to, cc: compose.cc, bcc: compose.bcc,
            subject: compose.subject, text: compose.text
          })
        });
        if (r.ok) {
          sendResult.value = { type: 'success', msg: L('sendSuccess') };
          ElMessage.success(L('sendSuccess'));
          // Delete draft if was editing one
          if (compose.draftId) {
            await fetch('/api/mail/drafts/' + compose.draftId, { method: 'DELETE', headers: authHeaders() });
          }
          resetCompose();
          view.value = 'list';
          if (folder.value === 'sent') await loadMessages();
        } else {
          const e = await r.json();
          sendResult.value = { type: 'error', msg: L('sendError') + ': ' + (e.error || '') };
          ElMessage.error(sendResult.value.msg);
        }
      } catch (e) {
        sendResult.value = { type: 'error', msg: L('sendError') };
        ElMessage.error(L('sendError'));
      }
      sendingMail.value = false;
    }

    // Save draft
    async function saveDraft() {
      try {
        const r = await fetch('/api/mail/drafts', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({
            accountId: activeAccountId.value, draftId: compose.draftId,
            to: compose.to, cc: compose.cc, bcc: compose.bcc,
            subject: compose.subject, text: compose.text
          })
        });
        if (r.ok) {
          const d = await r.json();
          compose.draftId = d.id;
          ElMessage.success(L('saveDraft') + ' ✓');
        }
      } catch {}
    }

    // Open message
    async function openMessage(msg) {
      selectedMsg.value = msg;
      view.value = 'read';
      if (folder.value === 'inbox' && !msg.read) {
        msg.read = true;
        try {
          await fetch('/api/mail/read/' + (msg.uid || msg.messageId), {
            method: 'POST', headers: authHeaders()
          });
        } catch {}
      }
    }

    // Delete message
    async function deleteMessage(msg) {
      const uid = msg.uid || msg.messageId;
      try {
        await fetch('/api/mail/messages/' + folder.value + '/' + encodeURIComponent(uid), {
          method: 'DELETE', headers: authHeaders()
        });
        messages.value = messages.value.filter(m => (m.uid || m.messageId) !== uid);
        if (selectedMsg.value && (selectedMsg.value.uid || selectedMsg.value.messageId) === uid) {
          view.value = 'list';
          selectedMsg.value = null;
        }
      } catch {}
    }

    // Reply
    function replyTo(msg) {
      resetCompose();
      compose.to = msg.fromAddr || msg.from || '';
      compose.subject = 'Re: ' + (msg.subject || '');
      compose.text = '\n\n---\n' + (msg.text || '');
      view.value = 'compose';
    }

    // Forward
    function forwardMsg(msg) {
      resetCompose();
      compose.subject = 'Fwd: ' + (msg.subject || '');
      compose.text = '\n\n--- Forwarded ---\n' + L('from') + ': ' + (msg.from || '') + '\n' + L('date') + ': ' + formatDate(msg.date) + '\n' + L('subject') + ': ' + (msg.subject || '') + '\n\n' + (msg.text || '');
      view.value = 'compose';
    }

    // Open draft in compose
    function openDraft(draft) {
      resetCompose();
      compose.draftId = draft.id;
      compose.to = draft.to || '';
      compose.cc = draft.cc || '';
      compose.bcc = draft.bcc || '';
      compose.subject = draft.subject || '';
      compose.text = draft.text || '';
      view.value = 'compose';
    }

    function resetCompose() {
      compose.to = ''; compose.cc = ''; compose.bcc = ''; compose.subject = ''; compose.text = ''; compose.draftId = null; compose.showCc = false;
      sendResult.value = { type: '', msg: '' };
    }

    // Account management
    function openAddAccount() {
      Object.assign(accForm, { id: null, email: '', name: '', password: '', smtpHost: '', smtpPort: 587, smtpSecure: false, pop3Host: '', pop3Port: 995, pop3Tls: true });
      accFormError.value = '';
      testing.smtpOk = null; testing.pop3Ok = null;
      view.value = 'account-form';
    }

    function openEditAccount(acc) {
      Object.assign(accForm, { id: acc.id, email: acc.email, name: acc.name || '', password: '', smtpHost: acc.smtpHost, smtpPort: acc.smtpPort, smtpSecure: acc.smtpSecure, pop3Host: acc.pop3Host, pop3Port: acc.pop3Port, pop3Tls: acc.pop3Tls });
      accFormError.value = '';
      testing.smtpOk = null; testing.pop3Ok = null;
      view.value = 'account-form';
    }

    async function saveAccount() {
      if (!accForm.email || !accForm.smtpHost || !accForm.pop3Host) { accFormError.value = 'Email, SMTP & POP3 required'; return; }
      if (!accForm.id && !accForm.password) { accFormError.value = L('password') + ' required'; return; }
      try {
        const r = await fetch('/api/mail/accounts', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({ ...accForm })
        });
        if (r.ok) {
          await loadAccounts();
          view.value = 'settings';
          accFormError.value = '';
        } else {
          const e = await r.json();
          accFormError.value = e.error || 'Error';
        }
      } catch (e) { accFormError.value = 'Error'; }
    }

    async function deleteAccount(id) {
      try { await ElMessageBox.confirm(L('deleteAccountConfirm'), { confirmButtonText: 'OK', cancelButtonText: L('cancel') || 'Cancel', type: 'warning' }); } catch { return; }
      try {
        await fetch('/api/mail/accounts/' + id, { method: 'DELETE', headers: authHeaders() });
        await loadAccounts();
        if (accounts.value.length === 0) activeAccountId.value = null;
      } catch {}
    }

    async function setActiveAccount(id) {
      activeAccountId.value = id;
      try {
        await fetch('/api/mail/active', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ accountId: id }) });
      } catch {}
      await loadMessages();
    }

    // Test connection
    async function testConn(type) {
      testing[type] = true;
      testing[type + 'Ok'] = null;
      try {
        const payload = type === 'smtp'
          ? { type: 'smtp', host: accForm.smtpHost, port: accForm.smtpPort, secure: accForm.smtpSecure, email: accForm.email, password: accForm.password }
          : { type: 'pop3', host: accForm.pop3Host, port: accForm.pop3Port, secure: accForm.pop3Tls, email: accForm.email, password: accForm.password };
        const r = await fetch('/api/mail/test', { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
        testing[type + 'Ok'] = r.ok;
        if (r.ok) ElMessage.success(L('testSuccess'));
        else { const e = await r.json(); ElMessage.error(L('testFail') + ': ' + (e.error || '')); }
      } catch { testing[type + 'Ok'] = false; ElMessage.error(L('testFail')); }
      testing[type] = false;
    }

    function formatDate(d) {
      if (!d) return '';
      try {
        const dt = new Date(d);
        const now = new Date();
        if (dt.toDateString() === now.toDateString()) return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return dt.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch { return d; }
    }

    function shortFrom(from) {
      if (!from) return '';
      const m = from.match(/"?([^"<]+)"?\s*</) || from.match(/([^<@]+)/);
      return m ? m[1].trim() : from;
    }

    // Watchers
    watch(folder, () => { view.value = 'list'; selectedMsg.value = null; loadMessages(); });

    // Incoming compose from other apps
    function onMailCompose(e) {
      const data = e.detail || {};
      resetCompose();
      if (data.to) compose.to = data.to;
      if (data.subject) compose.subject = data.subject;
      if (data.text) compose.text = data.text;
      if (data.cc) compose.cc = data.cc;
      if (data.bcc) compose.bcc = data.bcc;
      view.value = 'compose';
    }

    function checkPendingCompose() {
      if (window.__mailComposeData) {
        const data = window.__mailComposeData;
        delete window.__mailComposeData;
        resetCompose();
        if (data.to) compose.to = data.to;
        if (data.subject) compose.subject = data.subject;
        if (data.text) compose.text = data.text;
        if (data.cc) compose.cc = data.cc;
        if (data.bcc) compose.bcc = data.bcc;
        view.value = 'compose';
      }
    }

    function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }
    onMounted(async () => {
      window.addEventListener('locale-changed', onLocaleChanged);
      await loadAccounts();
      if (activeAccountId.value) await loadMessages();
      window.addEventListener('mail-compose', onMailCompose);
      checkPendingCompose();
    });
    onUnmounted(() => {
      window.removeEventListener('locale-changed', onLocaleChanged);
      window.removeEventListener('mail-compose', onMailCompose);
    });

    return {
      L, accounts, activeAccountId, activeAccount, folder, view, messages, selectedMsg,
      loading, fetchingMail, filterUnread, filteredMessages, unreadCount,
      compose, sendingMail, sendResult, sendMail, saveDraft, resetCompose,
      accForm, accFormError, testing, openAddAccount, openEditAccount, saveAccount, deleteAccount,
      setActiveAccount, testConn,
      loadMessages, fetchMail, openMessage, deleteMessage, replyTo, forwardMsg, openDraft, formatDate, shortFrom
    };
  }
})
