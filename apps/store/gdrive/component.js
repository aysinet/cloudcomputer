({
  setup() {
    const { ref, reactive, computed, onMounted, onUnmounted, watch } = Vue;
    const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success(){}, error(){}, warning(){}, info(){} };
    const ElMessageBox = (window.ElementPlus && window.ElementPlus.ElMessageBox) || { confirm: () => Promise.resolve(), prompt: () => Promise.resolve({ value: '' }) };

    /* ── i18n ── */
    const LANGS = {
      tr: {
        myDrive:'Drive\'ım', sharedWithMe:'Benimle paylaşılan', starred:'Yıldızlı', trash:'Çöp Kutusu',
        upload:'Dosya Yükle', newFolder:'Yeni Klasör', search:'Ara...', refresh:'Yenile',
        name:'Ad', owner:'Sahip', modified:'Değiştirilme', size:'Boyut', download:'İndir',
        rename:'Yeniden Adlandır', delete:'Sil', copyLink:'Bağlantıyı Kopyala', star:'Yıldızla',
        settings:'Ayarlar', cancel:'İptal', save:'Kaydet', ok:'Tamam',
        clientId:'Client ID', clientSecret:'Client Secret', redirectUri:'Redirect URI',
        clientIdPlaceholder:'Google Cloud Console Client ID',
        clientSecretPlaceholder:'Client Secret',
        settingsHelp:'Google Cloud Console\'dan OAuth 2.0 kimlik bilgilerinizi alın. Redirect URI olarak uygulamanızın adresini ekleyin.',
        configRequired:'Google Drive\'a bağlanmak için önce OAuth ayarlarını yapılandırın.',
        authRequired:'Google Drive hesabınıza bağlanın.',
        connectDrive:'Drive\'a Bağlan', disconnect:'Bağlantıyı Kes',
        pasteCode:'Google\'dan aldığınız yetkilendirme kodunu yapıştırın:',
        authCodePlaceholder:'Yetkilendirme kodu',
        authorize:'Yetkilendir',
        parentDir:'Üst Klasör', gridView:'Izgara Görünümü', listView:'Liste Görünümü',
        emptyFolder:'Bu klasör boş', noResults:'Sonuç bulunamadı',
        dropFiles:'Dosyaları buraya sürükleyin', selected:'seçili', items:'öğe',
        storage:'Depolama', deleteConfirm:'Bu öğeyi silmek istediğinize emin misiniz?',
        folderName:'Klasör adı', newFolderPlaceholder:'Yeni Klasör',
        uploading:'Yükleniyor...', uploadSuccess:'Yükleme tamamlandı',
        downloadStarted:'İndirme başladı', deleted:'Silindi', renamed:'Yeniden adlandırıldı',
        folderCreated:'Klasör oluşturuldu', linkCopied:'Bağlantı kopyalandı',
        error:'Hata', connected:'Bağlandı', disconnected:'Bağlantı kesildi'
      },
      en: {
        myDrive:'My Drive', sharedWithMe:'Shared with me', starred:'Starred', trash:'Trash',
        upload:'Upload File', newFolder:'New Folder', search:'Search...', refresh:'Refresh',
        name:'Name', owner:'Owner', modified:'Modified', size:'Size', download:'Download',
        rename:'Rename', delete:'Delete', copyLink:'Copy Link', star:'Star',
        settings:'Settings', cancel:'Cancel', save:'Save', ok:'OK',
        clientId:'Client ID', clientSecret:'Client Secret', redirectUri:'Redirect URI',
        clientIdPlaceholder:'Google Cloud Console Client ID',
        clientSecretPlaceholder:'Client Secret',
        settingsHelp:'Get your OAuth 2.0 credentials from Google Cloud Console. Add your app URL as Redirect URI.',
        configRequired:'Configure OAuth settings to connect to Google Drive.',
        authRequired:'Connect to your Google Drive account.',
        connectDrive:'Connect to Drive', disconnect:'Disconnect',
        pasteCode:'Paste the authorization code from Google:',
        authCodePlaceholder:'Authorization code',
        authorize:'Authorize',
        parentDir:'Parent Folder', gridView:'Grid View', listView:'List View',
        emptyFolder:'This folder is empty', noResults:'No results found',
        dropFiles:'Drop files here', selected:'selected', items:'items',
        storage:'Storage', deleteConfirm:'Are you sure you want to delete this item?',
        folderName:'Folder name', newFolderPlaceholder:'New Folder',
        uploading:'Uploading...', uploadSuccess:'Upload complete',
        downloadStarted:'Download started', deleted:'Deleted', renamed:'Renamed',
        folderCreated:'Folder created', linkCopied:'Link copied',
        error:'Error', connected:'Connected', disconnected:'Disconnected'
      },
      de: {
        myDrive:'Mein Drive', sharedWithMe:'Für mich freigegeben', starred:'Markiert', trash:'Papierkorb',
        upload:'Datei hochladen', newFolder:'Neuer Ordner', search:'Suchen...', refresh:'Aktualisieren',
        name:'Name', owner:'Besitzer', modified:'Geändert', size:'Größe', download:'Herunterladen',
        rename:'Umbenennen', delete:'Löschen', copyLink:'Link kopieren', star:'Markieren',
        settings:'Einstellungen', cancel:'Abbrechen', save:'Speichern', ok:'OK',
        clientId:'Client ID', clientSecret:'Client Secret', redirectUri:'Redirect URI',
        clientIdPlaceholder:'Google Cloud Console Client ID',
        clientSecretPlaceholder:'Client Secret',
        settingsHelp:'Holen Sie sich Ihre OAuth 2.0-Anmeldedaten aus der Google Cloud Console.',
        configRequired:'Konfigurieren Sie die OAuth-Einstellungen für Google Drive.',
        authRequired:'Verbinden Sie sich mit Ihrem Google Drive.',
        connectDrive:'Mit Drive verbinden', disconnect:'Trennen',
        pasteCode:'Fügen Sie den Autorisierungscode von Google ein:',
        authCodePlaceholder:'Autorisierungscode',
        authorize:'Autorisieren',
        parentDir:'Übergeordneter Ordner', gridView:'Rasteransicht', listView:'Listenansicht',
        emptyFolder:'Dieser Ordner ist leer', noResults:'Keine Ergebnisse',
        dropFiles:'Dateien hierher ziehen', selected:'ausgewählt', items:'Elemente',
        storage:'Speicher', deleteConfirm:'Möchten Sie dieses Element wirklich löschen?',
        folderName:'Ordnername', newFolderPlaceholder:'Neuer Ordner',
        uploading:'Hochladen...', uploadSuccess:'Upload abgeschlossen',
        downloadStarted:'Download gestartet', deleted:'Gelöscht', renamed:'Umbenannt',
        folderCreated:'Ordner erstellt', linkCopied:'Link kopiert',
        error:'Fehler', connected:'Verbunden', disconnected:'Getrennt'
      },
      fr: {
        myDrive:'Mon Drive', sharedWithMe:'Partagés avec moi', starred:'Favoris', trash:'Corbeille',
        upload:'Importer', newFolder:'Nouveau dossier', search:'Rechercher...', refresh:'Actualiser',
        name:'Nom', owner:'Propriétaire', modified:'Modifié', size:'Taille', download:'Télécharger',
        rename:'Renommer', delete:'Supprimer', copyLink:'Copier le lien', star:'Favori',
        settings:'Paramètres', cancel:'Annuler', save:'Enregistrer', ok:'OK',
        clientId:'Client ID', clientSecret:'Client Secret', redirectUri:'URI de redirection',
        clientIdPlaceholder:'Client ID Google Cloud Console',
        clientSecretPlaceholder:'Client Secret',
        settingsHelp:'Obtenez vos identifiants OAuth 2.0 depuis Google Cloud Console.',
        configRequired:'Configurez les paramètres OAuth pour Google Drive.',
        authRequired:'Connectez-vous à votre Google Drive.',
        connectDrive:'Se connecter à Drive', disconnect:'Déconnecter',
        pasteCode:'Collez le code d\'autorisation de Google :',
        authCodePlaceholder:'Code d\'autorisation',
        authorize:'Autoriser',
        parentDir:'Dossier parent', gridView:'Grille', listView:'Liste',
        emptyFolder:'Ce dossier est vide', noResults:'Aucun résultat',
        dropFiles:'Déposez les fichiers ici', selected:'sélectionné(s)', items:'éléments',
        storage:'Stockage', deleteConfirm:'Voulez-vous vraiment supprimer cet élément ?',
        folderName:'Nom du dossier', newFolderPlaceholder:'Nouveau dossier',
        uploading:'Importation...', uploadSuccess:'Import terminé',
        downloadStarted:'Téléchargement lancé', deleted:'Supprimé', renamed:'Renommé',
        folderCreated:'Dossier créé', linkCopied:'Lien copié',
        error:'Erreur', connected:'Connecté', disconnected:'Déconnecté'
      },
      es: {
        myDrive:'Mi Drive', sharedWithMe:'Compartidos conmigo', starred:'Destacados', trash:'Papelera',
        upload:'Subir archivo', newFolder:'Nueva carpeta', search:'Buscar...', refresh:'Actualizar',
        name:'Nombre', owner:'Propietario', modified:'Modificado', size:'Tamaño', download:'Descargar',
        rename:'Renombrar', delete:'Eliminar', copyLink:'Copiar enlace', star:'Destacar',
        settings:'Ajustes', cancel:'Cancelar', save:'Guardar', ok:'OK',
        clientId:'Client ID', clientSecret:'Client Secret', redirectUri:'URI de redirección',
        clientIdPlaceholder:'Client ID de Google Cloud Console',
        clientSecretPlaceholder:'Client Secret',
        settingsHelp:'Obtenga sus credenciales OAuth 2.0 desde Google Cloud Console.',
        configRequired:'Configure OAuth para conectar con Google Drive.',
        authRequired:'Conéctese a su Google Drive.',
        connectDrive:'Conectar a Drive', disconnect:'Desconectar',
        pasteCode:'Pegue el código de autorización de Google:',
        authCodePlaceholder:'Código de autorización',
        authorize:'Autorizar',
        parentDir:'Carpeta superior', gridView:'Cuadrícula', listView:'Lista',
        emptyFolder:'Esta carpeta está vacía', noResults:'Sin resultados',
        dropFiles:'Suelte archivos aquí', selected:'seleccionados', items:'elementos',
        storage:'Almacenamiento', deleteConfirm:'¿Seguro que desea eliminar este elemento?',
        folderName:'Nombre de carpeta', newFolderPlaceholder:'Nueva carpeta',
        uploading:'Subiendo...', uploadSuccess:'Subida completada',
        downloadStarted:'Descarga iniciada', deleted:'Eliminado', renamed:'Renombrado',
        folderCreated:'Carpeta creada', linkCopied:'Enlace copiado',
        error:'Error', connected:'Conectado', disconnected:'Desconectado'
      },
      ru: {
        myDrive:'Мой Диск', sharedWithMe:'Доступные мне', starred:'Помеченные', trash:'Корзина',
        upload:'Загрузить файл', newFolder:'Новая папка', search:'Поиск...', refresh:'Обновить',
        name:'Имя', owner:'Владелец', modified:'Изменён', size:'Размер', download:'Скачать',
        rename:'Переименовать', delete:'Удалить', copyLink:'Копировать ссылку', star:'В избранное',
        settings:'Настройки', cancel:'Отмена', save:'Сохранить', ok:'ОК',
        clientId:'Client ID', clientSecret:'Client Secret', redirectUri:'URI перенаправления',
        clientIdPlaceholder:'Client ID из Google Cloud Console',
        clientSecretPlaceholder:'Client Secret',
        settingsHelp:'Получите учётные данные OAuth 2.0 в Google Cloud Console.',
        configRequired:'Настройте OAuth для подключения к Google Drive.',
        authRequired:'Подключитесь к вашему Google Drive.',
        connectDrive:'Подключить Drive', disconnect:'Отключить',
        pasteCode:'Вставьте код авторизации от Google:',
        authCodePlaceholder:'Код авторизации',
        authorize:'Авторизовать',
        parentDir:'Родительская папка', gridView:'Сетка', listView:'Список',
        emptyFolder:'Эта папка пуста', noResults:'Ничего не найдено',
        dropFiles:'Перетащите файлы сюда', selected:'выбрано', items:'элементов',
        storage:'Хранилище', deleteConfirm:'Вы уверены, что хотите удалить этот элемент?',
        folderName:'Имя папки', newFolderPlaceholder:'Новая папка',
        uploading:'Загрузка...', uploadSuccess:'Загрузка завершена',
        downloadStarted:'Скачивание начато', deleted:'Удалено', renamed:'Переименовано',
        folderCreated:'Папка создана', linkCopied:'Ссылка скопирована',
        error:'Ошибка', connected:'Подключено', disconnected:'Отключено'
      },
      zh: {
        myDrive:'我的云端硬盘', sharedWithMe:'与我共享', starred:'已加星标', trash:'回收站',
        upload:'上传文件', newFolder:'新建文件夹', search:'搜索...', refresh:'刷新',
        name:'名称', owner:'所有者', modified:'修改时间', size:'大小', download:'下载',
        rename:'重命名', delete:'删除', copyLink:'复制链接', star:'加星标',
        settings:'设置', cancel:'取消', save:'保存', ok:'确定',
        clientId:'客户端 ID', clientSecret:'客户端密钥', redirectUri:'重定向 URI',
        clientIdPlaceholder:'Google Cloud Console 客户端 ID',
        clientSecretPlaceholder:'客户端密钥',
        settingsHelp:'从 Google Cloud Console 获取您的 OAuth 2.0 凭据。',
        configRequired:'请配置 OAuth 设置以连接 Google Drive。',
        authRequired:'连接到您的 Google Drive 帐户。',
        connectDrive:'连接到 Drive', disconnect:'断开连接',
        pasteCode:'粘贴来自 Google 的授权码：',
        authCodePlaceholder:'授权码',
        authorize:'授权',
        parentDir:'上级文件夹', gridView:'网格视图', listView:'列表视图',
        emptyFolder:'此文件夹为空', noResults:'未找到结果',
        dropFiles:'将文件拖放到此处', selected:'已选择', items:'个项目',
        storage:'存储空间', deleteConfirm:'确定要删除此项目吗？',
        folderName:'文件夹名称', newFolderPlaceholder:'新建文件夹',
        uploading:'上传中...', uploadSuccess:'上传完成',
        downloadStarted:'下载已开始', deleted:'已删除', renamed:'已重命名',
        folderCreated:'文件夹已创建', linkCopied:'链接已复制',
        error:'错误', connected:'已连接', disconnected:'已断开'
      },
      ja: {
        myDrive:'マイドライブ', sharedWithMe:'共有アイテム', starred:'スター付き', trash:'ゴミ箱',
        upload:'ファイルをアップロード', newFolder:'新しいフォルダ', search:'検索...', refresh:'更新',
        name:'名前', owner:'オーナー', modified:'更新日時', size:'サイズ', download:'ダウンロード',
        rename:'名前変更', delete:'削除', copyLink:'リンクをコピー', star:'スター',
        settings:'設定', cancel:'キャンセル', save:'保存', ok:'OK',
        clientId:'クライアント ID', clientSecret:'クライアント シークレット', redirectUri:'リダイレクト URI',
        clientIdPlaceholder:'Google Cloud Console クライアント ID',
        clientSecretPlaceholder:'クライアント シークレット',
        settingsHelp:'Google Cloud Console から OAuth 2.0 認証情報を取得してください。',
        configRequired:'Google Drive に接続するには OAuth 設定を構成してください。',
        authRequired:'Google Drive アカウントに接続してください。',
        connectDrive:'Drive に接続', disconnect:'切断',
        pasteCode:'Google からの認証コードを貼り付けてください：',
        authCodePlaceholder:'認証コード',
        authorize:'認証',
        parentDir:'親フォルダ', gridView:'グリッド表示', listView:'リスト表示',
        emptyFolder:'このフォルダは空です', noResults:'結果が見つかりません',
        dropFiles:'ここにファイルをドロップ', selected:'選択済み', items:'件',
        storage:'ストレージ', deleteConfirm:'このアイテムを削除してもよろしいですか？',
        folderName:'フォルダ名', newFolderPlaceholder:'新しいフォルダ',
        uploading:'アップロード中...', uploadSuccess:'アップロード完了',
        downloadStarted:'ダウンロード開始', deleted:'削除しました', renamed:'名前を変更しました',
        folderCreated:'フォルダを作成しました', linkCopied:'リンクをコピーしました',
        error:'エラー', connected:'接続済み', disconnected:'切断済み'
      },
      it: {
        myDrive:'Il mio Drive', sharedWithMe:'Condivisi con me', starred:'Speciali', trash:'Cestino',
        upload:'Carica file', newFolder:'Nuova cartella', search:'Cerca...', refresh:'Aggiorna',
        name:'Nome', owner:'Proprietario', modified:'Modificato', size:'Dimensione', download:'Scarica',
        rename:'Rinomina', delete:'Elimina', copyLink:'Copia link', star:'Speciale',
        settings:'Impostazioni', cancel:'Annulla', save:'Salva', ok:'OK',
        clientId:'Client ID', clientSecret:'Client Secret', redirectUri:'URI di reindirizzamento',
        clientIdPlaceholder:'Client ID Google Cloud Console',
        clientSecretPlaceholder:'Client Secret',
        settingsHelp:'Ottieni le credenziali OAuth 2.0 da Google Cloud Console.',
        configRequired:'Configura le impostazioni OAuth per Google Drive.',
        authRequired:'Connettiti al tuo Google Drive.',
        connectDrive:'Connetti a Drive', disconnect:'Disconnetti',
        pasteCode:'Incolla il codice di autorizzazione da Google:',
        authCodePlaceholder:'Codice di autorizzazione',
        authorize:'Autorizza',
        parentDir:'Cartella superiore', gridView:'Griglia', listView:'Elenco',
        emptyFolder:'Questa cartella è vuota', noResults:'Nessun risultato',
        dropFiles:'Trascina i file qui', selected:'selezionati', items:'elementi',
        storage:'Spazio', deleteConfirm:'Sei sicuro di voler eliminare questo elemento?',
        folderName:'Nome cartella', newFolderPlaceholder:'Nuova cartella',
        uploading:'Caricamento...', uploadSuccess:'Caricamento completato',
        downloadStarted:'Download avviato', deleted:'Eliminato', renamed:'Rinominato',
        folderCreated:'Cartella creata', linkCopied:'Link copiato',
        error:'Errore', connected:'Connesso', disconnected:'Disconnesso'
      },
      ar: {
        myDrive:'ملفاتي', sharedWithMe:'مشتركة معي', starred:'مميزة بنجمة', trash:'سلة المهملات',
        upload:'رفع ملف', newFolder:'مجلد جديد', search:'بحث...', refresh:'تحديث',
        name:'الاسم', owner:'المالك', modified:'تاريخ التعديل', size:'الحجم', download:'تنزيل',
        rename:'إعادة تسمية', delete:'حذف', copyLink:'نسخ الرابط', star:'تمييز بنجمة',
        settings:'الإعدادات', cancel:'إلغاء', save:'حفظ', ok:'موافق',
        clientId:'معرّف العميل', clientSecret:'سر العميل', redirectUri:'عنوان إعادة التوجيه',
        clientIdPlaceholder:'معرّف العميل من Google Cloud Console',
        clientSecretPlaceholder:'سر العميل',
        settingsHelp:'احصل على بيانات OAuth 2.0 من Google Cloud Console.',
        configRequired:'قم بتكوين إعدادات OAuth للاتصال بـ Google Drive.',
        authRequired:'اتصل بحساب Google Drive الخاص بك.',
        connectDrive:'اتصل بـ Drive', disconnect:'قطع الاتصال',
        pasteCode:'الصق رمز التفويض من Google:',
        authCodePlaceholder:'رمز التفويض',
        authorize:'تفويض',
        parentDir:'المجلد الأصلي', gridView:'عرض شبكي', listView:'عرض قائمة',
        emptyFolder:'هذا المجلد فارغ', noResults:'لا توجد نتائج',
        dropFiles:'أسقط الملفات هنا', selected:'محدد', items:'عناصر',
        storage:'التخزين', deleteConfirm:'هل أنت متأكد أنك تريد حذف هذا العنصر؟',
        folderName:'اسم المجلد', newFolderPlaceholder:'مجلد جديد',
        uploading:'جارٍ الرفع...', uploadSuccess:'اكتمل الرفع',
        downloadStarted:'بدأ التنزيل', deleted:'تم الحذف', renamed:'تمت إعادة التسمية',
        folderCreated:'تم إنشاء المجلد', linkCopied:'تم نسخ الرابط',
        error:'خطأ', connected:'متصل', disconnected:'غير متصل'
      }
    };

    LANGS.ko = { ...LANGS.en };
    LANGS.hi = { ...LANGS.en };
    LANGS.pt = { ...LANGS.en };

    function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }
    const locale = ref(getLocale());
    function t(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

    /* ── Auth ── */
    function getToken() { return localStorage.getItem('auth_token') || ''; }
    function authHeaders() { return { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }
    function authHeadersMultipart() { return { 'Authorization': 'Bearer ' + getToken() }; }

    /* ── State ── */
    const isConnected = ref(false);
    const hasConfig = ref(false);
    const loading = ref(false);
    const files = ref([]);
    const currentFolderId = ref('');
    const currentView = ref('myDrive');
    const viewMode = ref('grid');
    const searchQuery = ref('');
    const isSearching = ref(false);
    const selectedFiles = ref([]);
    const breadcrumbs = ref([]);
    const sortField = ref('name');
    const sortAsc = ref(true);
    const quota = reactive({ usage: 0, limit: 0 });
    const uploadProgress = ref(0);
    const isDragOver = ref(false);
    const history = ref([]);
    const historyIndex = ref(-1);

    // Settings
    const showSettings = ref(false);
    const settingsForm = reactive({ clientId: '', clientSecret: '', redirectUri: '' });
    const settingsSaving = ref(false);

    // Auth
    const showAuthInput = ref(false);
    const authCode = ref('');
    const authLoading = ref(false);

    // Rename
    const showRename = ref(false);
    const renameValue = ref('');
    const renameFileId = ref('');

    // Context Menu
    const ctxMenu = reactive({ show: false, x: 0, y: 0, file: null });

    /* ── Computed ── */
    const canGoBack = computed(() => historyIndex.value > 0);
    const canGoForward = computed(() => historyIndex.value < history.value.length - 1);
    const quotaPercent = computed(() => quota.limit ? Math.min(100, Math.round((quota.usage / quota.limit) * 100)) : 0);

    /* ── API Helpers ── */
    async function apiGet(url) {
      const r = await fetch(url, { headers: authHeaders() });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    }
    async function apiPost(url, body) {
      const r = await fetch(url, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    }
    async function apiPatch(url, body) {
      const r = await fetch(url, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(body) });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    }
    async function apiDelete(url) {
      const r = await fetch(url, { method: 'DELETE', headers: authHeaders() });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    }

    /* ── Settings ── */
    async function loadConfig() {
      try {
        const data = await apiGet('/api/gdrive/config');
        hasConfig.value = !!(data.clientId);
        isConnected.value = !!data.authenticated;
        settingsForm.clientId = data.clientId || '';
        settingsForm.clientSecret = data.clientSecret ? '••••••••' : '';
        settingsForm.redirectUri = data.redirectUri || '';
        if (isConnected.value) {
          loadFiles();
          loadQuota();
        }
      } catch { hasConfig.value = false; }
    }

    async function saveSettings() {
      settingsSaving.value = true;
      try {
        const body = { clientId: settingsForm.clientId, redirectUri: settingsForm.redirectUri };
        if (settingsForm.clientSecret && !settingsForm.clientSecret.startsWith('••')) {
          body.clientSecret = settingsForm.clientSecret;
        }
        await apiPost('/api/gdrive/config', body);
        hasConfig.value = true;
        showSettings.value = false;
        ElMessage.success(t('save'));
      } catch (e) { ElMessage.error(t('error') + ': ' + e.message); }
      settingsSaving.value = false;
    }

    /* ── OAuth ── */
    async function startAuth() {
      authLoading.value = true;
      try {
        const data = await apiGet('/api/gdrive/auth-url');
        if (data.url) {
          window.open(data.url, '_blank', 'width=600,height=700');
          showAuthInput.value = true;
        }
      } catch (e) { ElMessage.error(t('error') + ': ' + e.message); }
      authLoading.value = false;
    }

    async function submitAuthCode() {
      if (!authCode.value.trim()) return;
      authLoading.value = true;
      try {
        await apiPost('/api/gdrive/auth-callback', { code: authCode.value.trim() });
        isConnected.value = true;
        showAuthInput.value = false;
        authCode.value = '';
        ElMessage.success(t('connected'));
        loadFiles();
        loadQuota();
      } catch (e) { ElMessage.error(t('error') + ': ' + e.message); }
      authLoading.value = false;
    }

    async function disconnect() {
      try {
        await apiPost('/api/gdrive/disconnect', {});
        isConnected.value = false;
        files.value = [];
        breadcrumbs.value = [];
        ElMessage.info(t('disconnected'));
      } catch (e) { ElMessage.error(e.message); }
    }

    /* ── Files ── */
    async function loadFiles(folderId) {
      loading.value = true;
      isSearching.value = false;
      try {
        const params = new URLSearchParams();
        if (folderId) params.set('folderId', folderId);
        if (currentView.value === 'shared') params.set('shared', '1');
        if (currentView.value === 'starred') params.set('starred', '1');
        if (currentView.value === 'trash') params.set('trash', '1');
        const data = await apiGet('/api/gdrive/files?' + params.toString());
        files.value = sortFiles(data.files || []);
        currentFolderId.value = folderId || '';
        selectedFiles.value = [];
      } catch (e) { ElMessage.error(t('error') + ': ' + e.message); }
      loading.value = false;
    }

    async function doSearch() {
      if (!searchQuery.value.trim()) return clearSearch();
      loading.value = true;
      isSearching.value = true;
      try {
        const data = await apiGet('/api/gdrive/files?q=' + encodeURIComponent(searchQuery.value.trim()));
        files.value = sortFiles(data.files || []);
        selectedFiles.value = [];
      } catch (e) { ElMessage.error(t('error') + ': ' + e.message); }
      loading.value = false;
    }
    function clearSearch() {
      searchQuery.value = '';
      isSearching.value = false;
      loadFiles(currentFolderId.value);
    }

    function sortFiles(arr) {
      const folders = arr.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
      const rest = arr.filter(f => f.mimeType !== 'application/vnd.google-apps.folder');
      const sorter = (a, b) => {
        let va = a[sortField.value] || '', vb = b[sortField.value] || '';
        if (sortField.value === 'size') { va = Number(va) || 0; vb = Number(vb) || 0; }
        else { va = String(va).toLowerCase(); vb = String(vb).toLowerCase(); }
        if (va < vb) return sortAsc.value ? -1 : 1;
        if (va > vb) return sortAsc.value ? 1 : -1;
        return 0;
      };
      folders.sort(sorter);
      rest.sort(sorter);
      return [...folders, ...rest];
    }

    function sortBy(field) {
      if (sortField.value === field) sortAsc.value = !sortAsc.value;
      else { sortField.value = field; sortAsc.value = true; }
      files.value = sortFiles(files.value);
    }

    async function loadQuota() {
      try {
        const data = await apiGet('/api/gdrive/quota');
        quota.usage = Number(data.usage) || 0;
        quota.limit = Number(data.limit) || 0;
      } catch {}
    }

    /* ── Navigation ── */
    function navigateTo(folderId) {
      if (folderId === 'root') folderId = '';
      const newHist = history.value.slice(0, historyIndex.value + 1);
      newHist.push({ folderId, breadcrumbs: [...breadcrumbs.value] });
      history.value = newHist;
      historyIndex.value = newHist.length - 1;
      if (!folderId) breadcrumbs.value = [];
      else {
        const idx = breadcrumbs.value.findIndex(b => b.id === folderId);
        if (idx >= 0) breadcrumbs.value = breadcrumbs.value.slice(0, idx + 1);
      }
      loadFiles(folderId);
    }

    function openItem(f) {
      if (f.mimeType === 'application/vnd.google-apps.folder') {
        breadcrumbs.value.push({ id: f.id, name: f.name });
        navigateTo(f.id);
      } else {
        if (f.webViewLink) window.open(f.webViewLink, '_blank');
      }
    }

    function goBack() {
      if (!canGoBack.value) return;
      historyIndex.value--;
      const entry = history.value[historyIndex.value];
      breadcrumbs.value = [...(entry.breadcrumbs || [])];
      loadFiles(entry.folderId);
    }
    function goForward() {
      if (!canGoForward.value) return;
      historyIndex.value++;
      const entry = history.value[historyIndex.value];
      breadcrumbs.value = [...(entry.breadcrumbs || [])];
      loadFiles(entry.folderId);
    }
    function goUp() {
      if (breadcrumbs.value.length > 1) {
        breadcrumbs.value.pop();
        const parent = breadcrumbs.value[breadcrumbs.value.length - 1];
        navigateTo(parent.id);
      } else {
        breadcrumbs.value = [];
        navigateTo('root');
      }
    }

    function switchView(view) {
      currentView.value = view;
      breadcrumbs.value = [];
      currentFolderId.value = '';
      searchQuery.value = '';
      isSearching.value = false;
      loadFiles();
    }

    /* ── Selection ── */
    function selectFile(f) { selectedFiles.value = [f.id]; }
    function toggleSelect(f) {
      const idx = selectedFiles.value.indexOf(f.id);
      if (idx >= 0) selectedFiles.value.splice(idx, 1);
      else selectedFiles.value.push(f.id);
    }
    function isSelected(id) { return selectedFiles.value.includes(id); }

    /* ── File Operations ── */
    async function createFolder() {
      try {
        const { value: name } = await ElMessageBox.prompt(t('folderName'), t('newFolder'), {
          inputValue: t('newFolderPlaceholder'), confirmButtonText: t('ok'), cancelButtonText: t('cancel')
        });
        if (!name) return;
        await apiPost('/api/gdrive/folder', { name, parentId: currentFolderId.value || undefined });
        ElMessage.success(t('folderCreated'));
        loadFiles(currentFolderId.value);
      } catch {}
    }

    function triggerUpload() {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.onchange = async () => {
        if (!input.files || !input.files.length) return;
        await uploadFileList(input.files);
      };
      input.click();
    }

    async function uploadFileList(fileList) {
      const total = fileList.length;
      let done = 0;
      ElMessage.info(t('uploading'));
      for (const file of fileList) {
        try {
          const fd = new FormData();
          fd.append('file', file);
          if (currentFolderId.value) fd.append('parentId', currentFolderId.value);
          const r = await fetch('/api/gdrive/upload', { method: 'POST', headers: authHeadersMultipart(), body: fd });
          if (!r.ok) throw new Error(await r.text());
          done++;
          uploadProgress.value = Math.round((done / total) * 100);
        } catch (e) { ElMessage.error(file.name + ': ' + e.message); }
      }
      uploadProgress.value = 0;
      ElMessage.success(t('uploadSuccess'));
      loadFiles(currentFolderId.value);
    }

    async function downloadFile(fileId) {
      const token = getToken();
      const a = document.createElement('a');
      a.href = '/api/gdrive/download/' + encodeURIComponent(fileId) + '?token=' + encodeURIComponent(token);
      a.download = '';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      ElMessage.info(t('downloadStarted'));
    }

    async function deleteFile(fileId, silent) {
      try {
        if (!silent) await ElMessageBox.confirm(t('deleteConfirm'), t('delete'), { confirmButtonText: t('ok'), cancelButtonText: t('cancel'), type: 'warning' });
        await apiDelete('/api/gdrive/files/' + encodeURIComponent(fileId));
        if (!silent) ElMessage.success(t('deleted'));
        loadFiles(currentFolderId.value);
      } catch {}
    }

    function renameCtx() {
      if (!ctxMenu.file) return;
      renameFileId.value = ctxMenu.file.id;
      renameValue.value = ctxMenu.file.name;
      showRename.value = true;
      closeCtxMenu();
    }
    async function doRename() {
      if (!renameValue.value.trim() || !renameFileId.value) return;
      try {
        await apiPatch('/api/gdrive/files/' + encodeURIComponent(renameFileId.value), { name: renameValue.value.trim() });
        ElMessage.success(t('renamed'));
        showRename.value = false;
        loadFiles(currentFolderId.value);
      } catch (e) { ElMessage.error(e.message); }
    }

    function downloadCtx() {
      if (ctxMenu.file) downloadFile(ctxMenu.file.id);
      closeCtxMenu();
    }
    function deleteCtx() {
      if (ctxMenu.file) deleteFile(ctxMenu.file.id);
      closeCtxMenu();
    }
    function copyLinkCtx() {
      if (ctxMenu.file && ctxMenu.file.webViewLink) {
        navigator.clipboard.writeText(ctxMenu.file.webViewLink).then(() => ElMessage.success(t('linkCopied')));
      }
      closeCtxMenu();
    }
    async function starCtx() {
      if (!ctxMenu.file) return;
      try {
        await apiPatch('/api/gdrive/files/' + encodeURIComponent(ctxMenu.file.id), { starred: !ctxMenu.file.starred });
        loadFiles(currentFolderId.value);
      } catch (e) { ElMessage.error(e.message); }
      closeCtxMenu();
    }

    /* ── Context Menu ── */
    function onContextMenu(e, f) {
      selectedFiles.value = [f.id];
      ctxMenu.file = f;
      ctxMenu.x = e.clientX;
      ctxMenu.y = e.clientY;
      ctxMenu.show = true;
    }
    function closeCtxMenu() { ctxMenu.show = false; ctxMenu.file = null; }

    /* ── Drag & Drop ── */
    function onDragOver(e) { isDragOver.value = true; }
    function onDragLeave() { isDragOver.value = false; }
    function onDrop(e) {
      isDragOver.value = false;
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
        uploadFileList(e.dataTransfer.files);
      }
    }

    /* ── Helpers ── */
    function getFileIcon(f) {
      if (!f || !f.mimeType) return '📄';
      const m = f.mimeType;
      if (m === 'application/vnd.google-apps.folder') return '📁';
      if (m === 'application/vnd.google-apps.document') return '📝';
      if (m === 'application/vnd.google-apps.spreadsheet') return '📊';
      if (m === 'application/vnd.google-apps.presentation') return '📽️';
      if (m === 'application/vnd.google-apps.form') return '📋';
      if (m === 'application/vnd.google-apps.drawing') return '🎨';
      if (m.startsWith('image/')) return '🖼️';
      if (m.startsWith('video/')) return '🎬';
      if (m.startsWith('audio/')) return '🎵';
      if (m === 'application/pdf') return '📕';
      if (m.includes('zip') || m.includes('rar') || m.includes('archive') || m.includes('compressed')) return '📦';
      if (m.includes('javascript') || m.includes('json') || m.includes('html') || m.includes('css') || m.includes('xml')) return '💻';
      if (m.startsWith('text/')) return '📄';
      return '📄';
    }

    function formatSize(bytes) {
      if (!bytes || bytes === 0) return '';
      const units = ['B', 'KB', 'MB', 'GB', 'TB'];
      let i = 0;
      let size = bytes;
      while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
      return size.toFixed(i > 0 ? 1 : 0) + ' ' + units[i];
    }

    /* ── Global click to close context menu ── */
    function onGlobalClick() { if (ctxMenu.show) closeCtxMenu(); }
    onMounted(() => {
      document.addEventListener('click', onGlobalClick);
      loadConfig();
      // Init history
      history.value = [{ folderId: '', breadcrumbs: [] }];
      historyIndex.value = 0;
    });
    onUnmounted(() => {
      document.removeEventListener('click', onGlobalClick);
    });

    // Watch locale changes
    watch(() => { try { return localStorage.getItem('sys_locale'); } catch { return 'tr'; } }, (v) => { if (v) locale.value = v; });

    return {
      // State
      isConnected, hasConfig, loading, files, currentFolderId, currentView,
      viewMode, searchQuery, isSearching, selectedFiles, breadcrumbs,
      sortField, sortAsc, quota, uploadProgress, isDragOver,
      showSettings, settingsForm, settingsSaving,
      showAuthInput, authCode, authLoading,
      showRename, renameValue, ctxMenu,
      // Computed
      canGoBack, canGoForward, quotaPercent,
      // Methods
      t, loadFiles, doSearch, clearSearch, sortBy, navigateTo, openItem,
      goBack, goForward, goUp, switchView,
      selectFile, toggleSelect, isSelected,
      createFolder, triggerUpload, downloadFile, deleteFile,
      renameCtx, doRename, downloadCtx, deleteCtx, copyLinkCtx, starCtx,
      onContextMenu, closeCtxMenu,
      onDragOver, onDragLeave, onDrop,
      startAuth, submitAuthCode, disconnect, saveSettings,
      getFileIcon, formatSize
    };
  }
})
