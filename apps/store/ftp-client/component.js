({
  setup() {
    const { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } = Vue;
    const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success(){}, error(){}, warning(){}, info(){} };
    const ElMessageBox = (window.ElementPlus && window.ElementPlus.ElMessageBox) || { confirm: () => Promise.resolve(), prompt: () => Promise.resolve({ value: '' }) };

    /* ── i18n ── */
    const LANGS = {
      tr: {
        title:'FTP İstemcisi',
        connect:'Bağlan',
        disconnect:'Bağlantıyı Kes',
        host:'Sunucu',
        port:'Port',
        username:'Kullanıcı Adı',
        password:'Şifre',
        quickConnect:'Hızlı Bağlantı',
        secure:'FTPS (TLS)',
        connected:'Bağlandı',
        disconnected:'Bağlantı kesildi',
        connecting:'Bağlanıyor...',
        localFiles:'Yerel Dosyalar',
        remoteFiles:'Uzak Dosyalar',
        name:'Ad',
        size:'Boyut',
        modified:'Değiştirilme',
        type:'Tür',
        folder:'Klasör',
        file:'Dosya',
        upload:'Yükle',
        download:'İndir',
        delete:'Sil',
        rename:'Yeniden Adlandır',
        newFolder:'Yeni Klasör',
        refresh:'Yenile',
        deleteConfirm:'Bu öğeyi silmek istediğinize emin misiniz?',
        newFolderName:'Yeni klasör adı',
        renameTitle:'Yeniden adlandır',
        newName:'Yeni ad',
        transferring:'Aktarılıyor...',
        transferred:'Aktarım tamamlandı',
        error:'Hata',
        savedConnections:'Kayıtlı Bağlantılar',
        save:'Kaydet',
        noSaved:'Kayıtlı bağlantı yok',
        connectionName:'Bağlantı adı',
        cancel:'İptal',
        ok:'Tamam',
        path:'Yol',
        importXml:'FileZilla XML İçe Aktar',
        importSuccess:'sunucu başarıyla içe aktarıldı',
        importError:'XML dosyası okunamadı',
        importNoServers:'XML dosyasında sunucu bulunamadı',
        deleteAll:'Tümünü Sil',
        serverCount:'sunucu',
        log:'Günlük',
        clearLog:'Günlüğü Temizle',
        status:'Durum',
        idle:'Boşta',
        anonymous:'Anonim',
        passive:'Pasif mod',
        parentDir:'Üst dizin',
        selected:'seçili',
        totalSize:'Toplam boyut',
        items:'öğe',
        uploadFiles:'Dosya Yükle',
        permissions:'İzinler',
        owner:'Sahip'
      },
      en: {
        title:'FTP Client',
        connect:'Connect',
        disconnect:'Disconnect',
        host:'Host',
        port:'Port',
        username:'Username',
        password:'Password',
        quickConnect:'Quick Connect',
        secure:'FTPS (TLS)',
        connected:'Connected',
        disconnected:'Disconnected',
        connecting:'Connecting...',
        localFiles:'Local Files',
        remoteFiles:'Remote Files',
        name:'Name',
        size:'Size',
        modified:'Modified',
        type:'Type',
        folder:'Folder',
        file:'File',
        upload:'Upload',
        download:'Download',
        delete:'Delete',
        rename:'Rename',
        newFolder:'New Folder',
        refresh:'Refresh',
        deleteConfirm:'Are you sure you want to delete this item?',
        newFolderName:'New folder name',
        renameTitle:'Rename',
        newName:'New name',
        transferring:'Transferring...',
        transferred:'Transfer completed',
        error:'Error',
        savedConnections:'Saved Connections',
        save:'Save',
        noSaved:'No saved connections',
        connectionName:'Connection name',
        cancel:'Cancel',
        ok:'OK',
        path:'Path',
        importXml:'Import FileZilla XML',
        importSuccess:'server(s) imported successfully',
        importError:'Failed to read XML file',
        importNoServers:'No servers found in XML file',
        deleteAll:'Delete All',
        serverCount:'server(s)',
        log:'Log',
        clearLog:'Clear Log',
        status:'Status',
        idle:'Idle',
        anonymous:'Anonymous',
        passive:'Passive mode',
        parentDir:'Parent directory',
        selected:'selected',
        totalSize:'Total size',
        items:'items',
        uploadFiles:'Upload Files',
        permissions:'Permissions',
        owner:'Owner'
      },
      de: {
        title:'FTP-Client',
        connect:'Verbinden',
        disconnect:'Trennen',
        host:'Host',
        port:'Port',
        username:'Benutzername',
        password:'Passwort',
        quickConnect:'Schnellverbindung',
        secure:'FTPS (TLS)',
        connected:'Verbunden',
        disconnected:'Getrennt',
        connecting:'Verbindung wird hergestellt...',
        localFiles:'Lokale Dateien',
        remoteFiles:'Remote-Dateien',
        name:'Name',
        size:'Größe',
        modified:'Geändert',
        type:'Typ',
        folder:'Ordner',
        file:'Datei',
        upload:'Hochladen',
        download:'Herunterladen',
        delete:'Löschen',
        rename:'Umbenennen',
        newFolder:'Neuer Ordner',
        refresh:'Aktualisieren',
        deleteConfirm:'Möchten Sie dieses Element wirklich löschen?',
        newFolderName:'Neuer Ordnername',
        renameTitle:'Umbenennen',
        newName:'Neuer Name',
        transferring:'Übertragung...',
        transferred:'Übertragung abgeschlossen',
        error:'Fehler',
        savedConnections:'Gespeicherte Verbindungen',
        save:'Speichern',
        noSaved:'Keine gespeicherten Verbindungen',
        connectionName:'Verbindungsname',
        cancel:'Abbrechen',
        ok:'OK',
        path:'Pfad',
        importXml:'FileZilla XML Importieren',
        importSuccess:'Server erfolgreich importiert',
        importError:'XML-Datei konnte nicht gelesen werden',
        importNoServers:'Keine Server in XML-Datei gefunden',
        deleteAll:'Alle Löschen',
        serverCount:'Server',
        log:'Protokoll',
        clearLog:'Protokoll löschen',
        status:'Status',
        idle:'Bereit',
        anonymous:'Anonym',
        passive:'Passivmodus',
        parentDir:'Übergeordnetes Verzeichnis',
        selected:'ausgewählt',
        totalSize:'Gesamtgröße',
        items:'Elemente',
        uploadFiles:'Dateien hochladen',
        permissions:'Berechtigungen',
        owner:'Besitzer'
      },
      fr: {
        title:'Client FTP',
        connect:'Connecter',
        disconnect:'Déconnecter',
        host:'Hôte',
        port:'Port',
        username:'Nom d\'utilisateur',
        password:'Mot de passe',
        quickConnect:'Connexion rapide',
        secure:'FTPS (TLS)',
        connected:'Connecté',
        disconnected:'Déconnecté',
        connecting:'Connexion en cours...',
        localFiles:'Fichiers locaux',
        remoteFiles:'Fichiers distants',
        name:'Nom',
        size:'Taille',
        modified:'Modifié',
        type:'Type',
        folder:'Dossier',
        file:'Fichier',
        upload:'Envoyer',
        download:'Télécharger',
        delete:'Supprimer',
        rename:'Renommer',
        newFolder:'Nouveau dossier',
        refresh:'Actualiser',
        deleteConfirm:'Voulez-vous vraiment supprimer cet élément ?',
        newFolderName:'Nom du nouveau dossier',
        renameTitle:'Renommer',
        newName:'Nouveau nom',
        transferring:'Transfert en cours...',
        transferred:'Transfert terminé',
        error:'Erreur',
        savedConnections:'Connexions enregistrées',
        save:'Enregistrer',
        noSaved:'Aucune connexion enregistrée',
        connectionName:'Nom de la connexion',
        cancel:'Annuler',
        ok:'OK',
        path:'Chemin',
        importXml:'Importer XML FileZilla',
        importSuccess:'serveur(s) importé(s) avec succès',
        importError:'Impossible de lire le fichier XML',
        importNoServers:'Aucun serveur trouvé dans le fichier XML',
        deleteAll:'Tout Supprimer',
        serverCount:'serveur(s)',
        log:'Journal',
        clearLog:'Effacer le journal',
        status:'Statut',
        idle:'Inactif',
        anonymous:'Anonyme',
        passive:'Mode passif',
        parentDir:'Dossier parent',
        selected:'sélectionné(s)',
        totalSize:'Taille totale',
        items:'éléments',
        uploadFiles:'Envoyer des fichiers',
        permissions:'Permissions',
        owner:'Propriétaire'
      },
      es: {
        title:'Cliente FTP',
        connect:'Conectar',
        disconnect:'Desconectar',
        host:'Servidor',
        port:'Puerto',
        username:'Usuario',
        password:'Contraseña',
        quickConnect:'Conexión rápida',
        secure:'FTPS (TLS)',
        connected:'Conectado',
        disconnected:'Desconectado',
        connecting:'Conectando...',
        localFiles:'Archivos locales',
        remoteFiles:'Archivos remotos',
        name:'Nombre',
        size:'Tamaño',
        modified:'Modificado',
        type:'Tipo',
        folder:'Carpeta',
        file:'Archivo',
        upload:'Subir',
        download:'Descargar',
        delete:'Eliminar',
        rename:'Renombrar',
        newFolder:'Nueva carpeta',
        refresh:'Actualizar',
        deleteConfirm:'¿Está seguro de que desea eliminar este elemento?',
        newFolderName:'Nombre de la nueva carpeta',
        renameTitle:'Renombrar',
        newName:'Nuevo nombre',
        transferring:'Transfiriendo...',
        transferred:'Transferencia completada',
        error:'Error',
        savedConnections:'Conexiones guardadas',
        save:'Guardar',
        noSaved:'No hay conexiones guardadas',
        connectionName:'Nombre de conexión',
        cancel:'Cancelar',
        ok:'OK',
        path:'Ruta',
        importXml:'Importar XML FileZilla',
        importSuccess:'servidor(es) importado(s) exitosamente',
        importError:'No se pudo leer el archivo XML',
        importNoServers:'No se encontraron servidores en el archivo XML',
        deleteAll:'Eliminar Todo',
        serverCount:'servidor(es)',
        log:'Registro',
        clearLog:'Limpiar registro',
        status:'Estado',
        idle:'Inactivo',
        anonymous:'Anónimo',
        passive:'Modo pasivo',
        parentDir:'Directorio superior',
        selected:'seleccionados',
        totalSize:'Tamaño total',
        items:'elementos',
        uploadFiles:'Subir archivos',
        permissions:'Permisos',
        owner:'Propietario'
      },
      ru: {
        title:'FTP-клиент',
        connect:'Подключить',
        disconnect:'Отключить',
        host:'Хост',
        port:'Порт',
        username:'Имя пользователя',
        password:'Пароль',
        quickConnect:'Быстрое подключение',
        secure:'FTPS (TLS)',
        connected:'Подключено',
        disconnected:'Отключено',
        connecting:'Подключение...',
        localFiles:'Локальные файлы',
        remoteFiles:'Удалённые файлы',
        name:'Имя',
        size:'Размер',
        modified:'Изменён',
        type:'Тип',
        folder:'Папка',
        file:'Файл',
        upload:'Загрузить',
        download:'Скачать',
        delete:'Удалить',
        rename:'Переименовать',
        newFolder:'Новая папка',
        refresh:'Обновить',
        deleteConfirm:'Вы уверены, что хотите удалить этот элемент?',
        newFolderName:'Имя новой папки',
        renameTitle:'Переименовать',
        newName:'Новое имя',
        transferring:'Передача...',
        transferred:'Передача завершена',
        error:'Ошибка',
        savedConnections:'Сохранённые подключения',
        save:'Сохранить',
        noSaved:'Нет сохранённых подключений',
        connectionName:'Имя подключения',
        cancel:'Отмена',
        ok:'ОК',
        path:'Путь',
        importXml:'Импорт XML FileZilla',
        importSuccess:'сервер(ов) успешно импортировано',
        importError:'Не удалось прочитать XML-файл',
        importNoServers:'Серверы не найдены в XML-файле',
        deleteAll:'Удалить Все',
        serverCount:'сервер(ов)',
        log:'Журнал',
        clearLog:'Очистить журнал',
        status:'Статус',
        idle:'Ожидание',
        anonymous:'Аноним',
        passive:'Пассивный режим',
        parentDir:'Родительский каталог',
        selected:'выбрано',
        totalSize:'Общий размер',
        items:'элементов',
        uploadFiles:'Загрузить файлы',
        permissions:'Права',
        owner:'Владелец'
      },
      zh: {
        title:'FTP客户端',
        connect:'连接',
        disconnect:'断开',
        host:'主机',
        port:'端口',
        username:'用户名',
        password:'密码',
        quickConnect:'快速连接',
        secure:'FTPS (TLS)',
        connected:'已连接',
        disconnected:'已断开',
        connecting:'连接中...',
        localFiles:'本地文件',
        remoteFiles:'远程文件',
        name:'名称',
        size:'大小',
        modified:'修改时间',
        type:'类型',
        folder:'文件夹',
        file:'文件',
        upload:'上传',
        download:'下载',
        delete:'删除',
        rename:'重命名',
        newFolder:'新建文件夹',
        refresh:'刷新',
        deleteConfirm:'确定要删除此项吗？',
        newFolderName:'新文件夹名称',
        renameTitle:'重命名',
        newName:'新名称',
        transferring:'传输中...',
        transferred:'传输完成',
        error:'错误',
        savedConnections:'已保存的连接',
        save:'保存',
        noSaved:'没有保存的连接',
        connectionName:'连接名称',
        cancel:'取消',
        ok:'确定',
        path:'路径',
        importXml:'导入FileZilla XML',
        importSuccess:'个服务器导入成功',
        importError:'无法读取XML文件',
        importNoServers:'XML文件中未找到服务器',
        deleteAll:'全部删除',
        serverCount:'个服务器',
        log:'日志',
        clearLog:'清除日志',
        status:'状态',
        idle:'空闲',
        anonymous:'匿名',
        passive:'被动模式',
        parentDir:'上级目录',
        selected:'已选',
        totalSize:'总大小',
        items:'项',
        uploadFiles:'上传文件',
        permissions:'权限',
        owner:'所有者'
      },
      ja: {
        title:'FTPクライアント',
        connect:'接続',
        disconnect:'切断',
        host:'ホスト',
        port:'ポート',
        username:'ユーザー名',
        password:'パスワード',
        quickConnect:'クイック接続',
        secure:'FTPS (TLS)',
        connected:'接続済',
        disconnected:'切断済',
        connecting:'接続中...',
        localFiles:'ローカルファイル',
        remoteFiles:'リモートファイル',
        name:'名前',
        size:'サイズ',
        modified:'更新日時',
        type:'種類',
        folder:'フォルダ',
        file:'ファイル',
        upload:'アップロード',
        download:'ダウンロード',
        delete:'削除',
        rename:'名前変更',
        newFolder:'新規フォルダ',
        refresh:'更新',
        deleteConfirm:'このアイテムを削除しますか？',
        newFolderName:'新しいフォルダ名',
        renameTitle:'名前変更',
        newName:'新しい名前',
        transferring:'転送中...',
        transferred:'転送完了',
        error:'エラー',
        savedConnections:'保存済の接続',
        save:'保存',
        noSaved:'保存済の接続なし',
        connectionName:'接続名',
        cancel:'キャンセル',
        ok:'OK',
        path:'パス',
        importXml:'FileZilla XMLインポート',
        importSuccess:'サーバーが正常にインポートされました',
        importError:'XMLファイルの読み取りに失敗しました',
        importNoServers:'XMLファイルにサーバーが見つかりません',
        deleteAll:'すべて削除',
        serverCount:'サーバー',
        log:'ログ',
        clearLog:'ログクリア',
        status:'状態',
        idle:'待機中',
        anonymous:'匿名',
        passive:'パッシブモード',
        parentDir:'親ディレクトリ',
        selected:'選択中',
        totalSize:'合計サイズ',
        items:'件',
        uploadFiles:'ファイルをアップロード',
        permissions:'権限',
        owner:'所有者'
      },
      it: {
        title:'Client FTP',
        connect:'Connetti',
        disconnect:'Disconnetti',
        host:'Host',
        port:'Porta',
        username:'Nome utente',
        password:'Password',
        quickConnect:'Connessione rapida',
        secure:'FTPS (TLS)',
        connected:'Connesso',
        disconnected:'Disconnesso',
        connecting:'Connessione...',
        localFiles:'File locali',
        remoteFiles:'File remoti',
        name:'Nome',
        size:'Dimensione',
        modified:'Modificato',
        type:'Tipo',
        folder:'Cartella',
        file:'File',
        upload:'Carica',
        download:'Scarica',
        delete:'Elimina',
        rename:'Rinomina',
        newFolder:'Nuova cartella',
        refresh:'Aggiorna',
        deleteConfirm:'Sei sicuro di voler eliminare questo elemento?',
        newFolderName:'Nome nuova cartella',
        renameTitle:'Rinomina',
        newName:'Nuovo nome',
        transferring:'Trasferimento...',
        transferred:'Trasferimento completato',
        error:'Errore',
        savedConnections:'Connessioni salvate',
        save:'Salva',
        noSaved:'Nessuna connessione salvata',
        connectionName:'Nome connessione',
        cancel:'Annulla',
        ok:'OK',
        path:'Percorso',
        importXml:'Importa XML FileZilla',
        importSuccess:'server importati con successo',
        importError:'Impossibile leggere il file XML',
        importNoServers:'Nessun server trovato nel file XML',
        deleteAll:'Elimina Tutto',
        serverCount:'server',
        log:'Registro',
        clearLog:'Cancella registro',
        status:'Stato',
        idle:'Inattivo',
        anonymous:'Anonimo',
        passive:'Modalità passiva',
        parentDir:'Directory superiore',
        selected:'selezionati',
        totalSize:'Dimensione totale',
        items:'elementi',
        uploadFiles:'Carica file',
        permissions:'Permessi',
        owner:'Proprietario'
      },
      ar: {
        title:'عميل FTP',
        connect:'اتصال',
        disconnect:'قطع الاتصال',
        host:'المضيف',
        port:'المنفذ',
        username:'المستخدم',
        password:'كلمة المرور',
        quickConnect:'Quick Connect',
        secure:'FTPS (TLS)',
        connected:'متصل',
        disconnected:'غير متصل',
        connecting:'جارٍ الاتصال...',
        localFiles:'Local Files',
        remoteFiles:'Remote Files',
        name:'الاسم',
        size:'الحجم',
        modified:'تاريخ التعديل',
        type:'النوع',
        folder:'Folder',
        file:'ملف',
        upload:'رفع',
        download:'تنزيل',
        delete:'حذف',
        rename:'إعادة تسمية',
        newFolder:'مجلد جديد',
        refresh:'تحديث',
        deleteConfirm:'هل أنت متأكد أنك تريد حذف هذا العنصر؟',
        newFolderName:'New folder name',
        renameTitle:'إعادة تسمية',
        newName:'New name',
        transferring:'Transferring...',
        transferred:'Transfer completed',
        error:'خطأ',
        savedConnections:'Saved Connections',
        save:'حفظ',
        noSaved:'No saved connections',
        connectionName:'Connection name',
        cancel:'إلغاء',
        ok:'موافق',
        path:'المسار',
        importXml:'Import FileZilla XML',
        importSuccess:'تم استيراد مجموعة Postman بنجاح',
        importError:'Failed to read XML file',
        importNoServers:'No servers found in XML file',
        deleteAll:'Delete All',
        serverCount:'server(s)',
        log:'Log',
        clearLog:'Clear Log',
        status:'الحالة',
        idle:'Idle',
        anonymous:'Anonymous',
        passive:'Passive mode',
        parentDir:'المجلد الأصلي',
        selected:'محدد',
        totalSize:'Total size',
        items:'عناصر',
        uploadFiles:'Upload Files',
        permissions:'Permissions',
        owner:'المالك'
      },
      ko: {
        title:'FTP 클라이언트',
        connect:'Connect',
        disconnect:'Disconnect',
        host:'Host',
        port:'포트',
        username:'Username',
        password:'비밀번호',
        quickConnect:'Quick Connect',
        secure:'FTPS (TLS)',
        connected:'연결됨',
        disconnected:'연결 끊김',
        connecting:'연결 중...',
        localFiles:'Local Files',
        remoteFiles:'Remote Files',
        name:'이름',
        size:'크기',
        modified:'수정됨',
        type:'유형',
        folder:'Folder',
        file:'파일',
        upload:'업로드',
        download:'다운로드',
        delete:'삭제',
        rename:'이름 변경',
        newFolder:'New Folder',
        refresh:'새로고침',
        deleteConfirm:'Are you sure you want to delete this item?',
        newFolderName:'New folder name',
        renameTitle:'이름 변경',
        newName:'New name',
        transferring:'Transferring...',
        transferred:'Transfer completed',
        error:'오류',
        savedConnections:'Saved Connections',
        save:'저장',
        noSaved:'No saved connections',
        connectionName:'Connection name',
        cancel:'취소',
        ok:'OK',
        path:'경로',
        importXml:'Import FileZilla XML',
        importSuccess:'server(s) imported successfully',
        importError:'Failed to read XML file',
        importNoServers:'No servers found in XML file',
        deleteAll:'Delete All',
        serverCount:'server(s)',
        log:'Log',
        clearLog:'Clear Log',
        status:'상태',
        idle:'Idle',
        anonymous:'Anonymous',
        passive:'Passive mode',
        parentDir:'Parent directory',
        selected:'selected',
        totalSize:'Total size',
        items:'items',
        uploadFiles:'Upload Files',
        permissions:'Permissions',
        owner:'Owner'
      },
      hi: {
        title:'FTP क्लाइंट',
        connect:'Connect',
        disconnect:'Disconnect',
        host:'Host',
        port:'पोर्ट',
        username:'Username',
        password:'पासवर्ड',
        quickConnect:'Quick Connect',
        secure:'FTPS (TLS)',
        connected:'कनेक्टेड',
        disconnected:'डिस्कनेक्ट',
        connecting:'कनेक्ट हो रहा है...',
        localFiles:'Local Files',
        remoteFiles:'Remote Files',
        name:'नाम',
        size:'आकार',
        modified:'संशोधित',
        type:'प्रकार',
        folder:'Folder',
        file:'फ़ाइल',
        upload:'अपलोड',
        download:'डाउनलोड',
        delete:'हटाएं',
        rename:'नाम बदलें',
        newFolder:'New Folder',
        refresh:'रीफ्रेश',
        deleteConfirm:'Are you sure you want to delete this item?',
        newFolderName:'New folder name',
        renameTitle:'नाम बदलें',
        newName:'New name',
        transferring:'Transferring...',
        transferred:'Transfer completed',
        error:'त्रुटि',
        savedConnections:'Saved Connections',
        save:'सहेजें',
        noSaved:'No saved connections',
        connectionName:'Connection name',
        cancel:'रद्द करें',
        ok:'OK',
        path:'पथ',
        importXml:'Import FileZilla XML',
        importSuccess:'server(s) imported successfully',
        importError:'Failed to read XML file',
        importNoServers:'No servers found in XML file',
        deleteAll:'Delete All',
        serverCount:'server(s)',
        log:'Log',
        clearLog:'Clear Log',
        status:'स्थिति',
        idle:'Idle',
        anonymous:'Anonymous',
        passive:'Passive mode',
        parentDir:'Parent directory',
        selected:'selected',
        totalSize:'Total size',
        items:'items',
        uploadFiles:'Upload Files',
        permissions:'Permissions',
        owner:'Owner'
      },
      pt: {
        title:'Cliente FTP',
        connect:'Connect',
        disconnect:'Disconnect',
        host:'Host',
        port:'Porta',
        username:'Username',
        password:'Senha',
        quickConnect:'Quick Connect',
        secure:'FTPS (TLS)',
        connected:'Conectado',
        disconnected:'Desconectado',
        connecting:'Conectando...',
        localFiles:'Local Files',
        remoteFiles:'Remote Files',
        name:'Nome',
        size:'Porte',
        modified:'modificado',
        type:'Tipo',
        folder:'Folder',
        file:'Arquivo',
        upload:'Enviar',
        download:'Baixar',
        delete:'Excluir',
        rename:'Renomear',
        newFolder:'New Folder',
        refresh:'Atualizar',
        deleteConfirm:'Are you sure you want to delete this item?',
        newFolderName:'New folder name',
        renameTitle:'Renomear',
        newName:'New name',
        transferring:'Transferring...',
        transferred:'Transfer completed',
        error:'Erro',
        savedConnections:'Saved Connections',
        save:'Salvar',
        noSaved:'No saved connections',
        connectionName:'Connection name',
        cancel:'Cancelar',
        ok:'OK',
        path:'Caminho',
        importXml:'Import FileZilla XML',
        importSuccess:'server(s) imported successfully',
        importError:'Failed to read XML file',
        importNoServers:'No servers found in XML file',
        deleteAll:'Delete All',
        serverCount:'server(s)',
        log:'Log',
        clearLog:'Clear Log',
        status:'Status',
        idle:'Idle',
        anonymous:'Anonymous',
        passive:'Passive mode',
        parentDir:'Parent directory',
        selected:'selected',
        totalSize:'Total size',
        items:'items',
        uploadFiles:'Upload Files',
        permissions:'Permissions',
        owner:'Owner'
      }
    };

    function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }
    const locale = ref(getLocale());
    function t(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
    function onLocaleChanged() { locale.value = getLocale(); }

    function getToken() { return localStorage.getItem('auth_token') || ''; }
    function authHeaders() { return { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }
    function authHeadersPlain() { return { 'Authorization': 'Bearer ' + getToken() }; }

    /* ── Connection state ── */
    const connForm = reactive({ host: '', port: 21, username: 'anonymous', password: '', secure: false, name: '' });
    const isConnected = ref(false);
    const isConnecting = ref(false);
    const sessionId = ref(null);
    const savedConns = ref([]);
    const showSavedPanel = ref(false);

    /* ── Local files ── */
    const localPath = ref('');
    const localFiles = ref([]);
    const localSelected = ref([]);
    const localLoading = ref(false);

    /* ── Remote files ── */
    const remotePath = ref('/');
    const remoteFiles = ref([]);
    const remoteSelected = ref([]);
    const remoteLoading = ref(false);

    /* ── Transfer / Log ── */
    const transferring = ref(false);
    const transferText = ref('');
    const logMessages = ref([]);
    const showLog = ref(true);

    function addLog(msg, type) {
      const ts = new Date().toLocaleTimeString();
      logMessages.value.push({ ts, msg, type: type || 'info' });
      if (logMessages.value.length > 200) logMessages.value.splice(0, 50);
      nextTick(() => {
        const el = document.querySelector('.ftp-log-body');
        if (el) el.scrollTop = el.scrollHeight;
      });
    }

    function formatSize(bytes) {
      if (!bytes && bytes !== 0) return '';
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
      return (bytes / 1073741824).toFixed(2) + ' GB';
    }

    function fileIcon(item) {
      if (item.isDir) return '📁';
      const ext = (item.name || '').split('.').pop().toLowerCase();
      const icons = { jpg:'🖼️', jpeg:'🖼️', png:'🖼️', gif:'🖼️', webp:'🖼️', svg:'🖼️',
        mp3:'🎵', wav:'🎵', flac:'🎵', ogg:'🎵', mp4:'🎬', avi:'🎬', mkv:'🎬', mov:'🎬',
        pdf:'📕', doc:'📄', docx:'📄', xls:'📊', xlsx:'📊', ppt:'📊', zip:'📦', rar:'📦',
        gz:'📦', tar:'📦', '7z':'📦', txt:'📝', md:'📝', json:'📋', xml:'📋', html:'🌐',
        css:'🎨', js:'⚡', py:'🐍', java:'☕', c:'⚙️', cpp:'⚙️', sh:'💻' };
      return icons[ext] || '📄';
    }

    /* ── Saved connections ── */
    function loadSavedConns() {
      try { savedConns.value = JSON.parse(localStorage.getItem('ftp_connections') || '[]'); } catch { savedConns.value = []; }
    }

    function saveConn() {
      const name = connForm.name || (connForm.host + ':' + connForm.port);
      const entry = { name, host: connForm.host, port: connForm.port, username: connForm.username, password: connForm.password, secure: connForm.secure };
      const existing = savedConns.value.findIndex(c => c.name === name);
      if (existing >= 0) savedConns.value[existing] = entry;
      else savedConns.value.push(entry);
      localStorage.setItem('ftp_connections', JSON.stringify(savedConns.value));
      ElMessage.success(t('save') + ' ✓');
    }

    function loadConn(c) {
      connForm.host = c.host;
      connForm.port = c.port;
      connForm.username = c.username;
      connForm.password = c.password;
      connForm.secure = c.secure || false;
      connForm.name = c.name;
      showSavedPanel.value = false;
    }

    function deleteConn(idx) {
      savedConns.value.splice(idx, 1);
      localStorage.setItem('ftp_connections', JSON.stringify(savedConns.value));
    }

    function deleteAllConns() {
      savedConns.value = [];
      localStorage.setItem('ftp_connections', '[]');
    }

    function importFileZillaXml() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.xml';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(ev.target.result, 'text/xml');
            const parseErr = doc.querySelector('parsererror');
            if (parseErr) { ElMessage.error(t('importError')); return; }
            const servers = doc.querySelectorAll('Server');
            if (!servers.length) { ElMessage.warning(t('importNoServers')); return; }
            let imported = 0;
            servers.forEach(srv => {
              const host = (srv.querySelector('Host') || {}).textContent || '';
              if (!host) return;
              const port = parseInt((srv.querySelector('Port') || {}).textContent) || 21;
              const user = (srv.querySelector('User') || {}).textContent || 'anonymous';
              let pass = '';
              const passEl = srv.querySelector('Pass');
              if (passEl) {
                pass = passEl.getAttribute('encoding') === 'base64' ? atob(passEl.textContent || '') : (passEl.textContent || '');
              }
              const name = (srv.querySelector('Name') || {}).textContent || (host + ':' + port);
              const protocol = parseInt((srv.querySelector('Protocol') || {}).textContent) || 0;
              const secure = protocol === 6;
              const entry = { name, host, port, username: user, password: pass, secure };
              const existing = savedConns.value.findIndex(c => c.name === name);
              if (existing >= 0) savedConns.value[existing] = entry;
              else savedConns.value.push(entry);
              imported++;
            });
            localStorage.setItem('ftp_connections', JSON.stringify(savedConns.value));
            if (imported > 0) {
              ElMessage.success(imported + ' ' + t('importSuccess'));
              addLog('FileZilla XML: ' + imported + ' ' + t('importSuccess'), 'success');
            } else {
              ElMessage.warning(t('importNoServers'));
            }
          } catch (err) {
            ElMessage.error(t('importError'));
            addLog(t('importError') + ': ' + err.message, 'error');
          }
        };
        reader.onerror = () => ElMessage.error(t('importError'));
        reader.readAsText(file);
      };
      input.click();
    }

    /* ── API calls ── */
    async function ftpApi(endpoint, body) {
      const res = await fetch('/api/ftp/' + endpoint, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'API error');
      return data;
    }

    /* ── Connect / Disconnect ── */
    async function connect() {
      if (!connForm.host) { ElMessage.warning(t('host') + '!'); return; }
      isConnecting.value = true;
      addLog(`${t('connecting')} ${connForm.host}:${connForm.port}`, 'cmd');
      try {
        const data = await ftpApi('connect', {
          host: connForm.host, port: connForm.port,
          username: connForm.username, password: connForm.password,
          secure: connForm.secure
        });
        sessionId.value = data.sessionId;
        isConnected.value = true;
        remotePath.value = data.cwd || '/';
        addLog(`✓ ${t('connected')} — ${connForm.host}`, 'success');
        ElMessage.success(t('connected'));
        await loadRemoteDir();
      } catch (e) {
        addLog(`✗ ${e.message}`, 'error');
        ElMessage.error(e.message);
      } finally {
        isConnecting.value = false;
      }
    }

    async function disconnect() {
      if (!sessionId.value) return;
      try {
        await ftpApi('disconnect', { sessionId: sessionId.value });
      } catch {}
      sessionId.value = null;
      isConnected.value = false;
      remoteFiles.value = [];
      remotePath.value = '/';
      remoteSelected.value = [];
      addLog(t('disconnected'), 'info');
    }

    /* ── Local file browsing ── */
    async function loadLocalDir() {
      localLoading.value = true;
      localSelected.value = [];
      try {
        const r = await fetch('/api/fs/list?path=' + encodeURIComponent(localPath.value), { headers: authHeadersPlain() });
        if (r.ok) localFiles.value = await r.json();
      } catch (e) { addLog(t('error') + ': ' + e.message, 'error'); }
      localLoading.value = false;
    }

    function localEnter(item) {
      if (!item.isDir) return;
      localPath.value = item.path;
      loadLocalDir();
    }

    function localUp() {
      const parts = localPath.value.split('/').filter(Boolean);
      parts.pop();
      localPath.value = parts.join('/');
      loadLocalDir();
    }

    function toggleLocalSelect(item) {
      const idx = localSelected.value.findIndex(s => s.path === item.path);
      if (idx >= 0) localSelected.value.splice(idx, 1);
      else localSelected.value.push(item);
    }

    function isLocalSelected(item) {
      return localSelected.value.some(s => s.path === item.path);
    }

    /* ── Remote file browsing ── */
    async function loadRemoteDir() {
      if (!sessionId.value) return;
      remoteLoading.value = true;
      remoteSelected.value = [];
      try {
        const data = await ftpApi('list', { sessionId: sessionId.value, path: remotePath.value });
        remoteFiles.value = data.files || [];
      } catch (e) {
        addLog(t('error') + ': ' + e.message, 'error');
        ElMessage.error(e.message);
      }
      remoteLoading.value = false;
    }

    function remoteEnter(item) {
      if (!item.isDir) return;
      remotePath.value = (remotePath.value + '/' + item.name).replace(/\/+/g, '/');
      loadRemoteDir();
    }

    function remoteUp() {
      const parts = remotePath.value.split('/').filter(Boolean);
      parts.pop();
      remotePath.value = '/' + parts.join('/');
      loadRemoteDir();
    }

    function toggleRemoteSelect(item) {
      const idx = remoteSelected.value.findIndex(s => s.name === item.name);
      if (idx >= 0) remoteSelected.value.splice(idx, 1);
      else remoteSelected.value.push(item);
    }

    function isRemoteSelected(item) {
      return remoteSelected.value.some(s => s.name === item.name);
    }

    /* ── Upload (local → remote) ── */
    async function uploadSelected() {
      if (!sessionId.value || !localSelected.value.length) return;
      transferring.value = true;
      let ok = 0, fail = 0;
      for (const item of localSelected.value) {
        if (item.isDir) continue;
        transferText.value = '↑ ' + item.name;
        addLog('↑ ' + item.name, 'cmd');
        try {
          await ftpApi('upload', {
            sessionId: sessionId.value,
            localPath: item.path,
            remotePath: (remotePath.value + '/' + item.name).replace(/\/+/g, '/')
          });
          addLog('✓ ' + item.name, 'success');
          ok++;
        } catch (e) {
          addLog('✗ ' + item.name + ': ' + e.message, 'error');
          fail++;
        }
      }
      transferring.value = false;
      transferText.value = '';
      localSelected.value = [];
      await loadRemoteDir();
      ElMessage.success(t('transferred') + ` (${ok}/${ok + fail})`);
    }

    /* ── Download (remote → local) ── */
    async function downloadSelected() {
      if (!sessionId.value || !remoteSelected.value.length) return;
      transferring.value = true;
      let ok = 0, fail = 0;
      for (const item of remoteSelected.value) {
        if (item.isDir) continue;
        transferText.value = '↓ ' + item.name;
        addLog('↓ ' + item.name, 'cmd');
        try {
          await ftpApi('download', {
            sessionId: sessionId.value,
            remotePath: (remotePath.value + '/' + item.name).replace(/\/+/g, '/'),
            localPath: (localPath.value ? localPath.value + '/' + item.name : item.name)
          });
          addLog('✓ ' + item.name, 'success');
          ok++;
        } catch (e) {
          addLog('✗ ' + item.name + ': ' + e.message, 'error');
          fail++;
        }
      }
      transferring.value = false;
      transferText.value = '';
      remoteSelected.value = [];
      await loadLocalDir();
      ElMessage.success(t('transferred') + ` (${ok}/${ok + fail})`);
    }

    /* ── Remote operations ── */
    async function remoteDelete() {
      if (!sessionId.value || !remoteSelected.value.length) return;
      try {
        await ElMessageBox.confirm(t('deleteConfirm'), t('delete'), { type: 'warning', confirmButtonText: t('ok'), cancelButtonText: t('cancel') });
      } catch { return; }
      for (const item of remoteSelected.value) {
        addLog('✗ DEL ' + item.name, 'cmd');
        try {
          await ftpApi('delete', { sessionId: sessionId.value, path: (remotePath.value + '/' + item.name).replace(/\/+/g, '/'), isDir: item.isDir });
          addLog('✓ ' + t('delete') + ' ' + item.name, 'success');
        } catch (e) { addLog('✗ ' + e.message, 'error'); }
      }
      remoteSelected.value = [];
      await loadRemoteDir();
    }

    async function remoteMkdir() {
      try {
        const { value } = await ElMessageBox.prompt(t('newFolderName'), t('newFolder'), { confirmButtonText: t('ok'), cancelButtonText: t('cancel') });
        if (!value || !value.trim()) return;
        addLog('MKDIR ' + value.trim(), 'cmd');
        await ftpApi('mkdir', { sessionId: sessionId.value, path: (remotePath.value + '/' + value.trim()).replace(/\/+/g, '/') });
        addLog('✓ ' + value.trim(), 'success');
        await loadRemoteDir();
      } catch {}
    }

    async function remoteRename() {
      if (!remoteSelected.value.length) return;
      const item = remoteSelected.value[0];
      try {
        const { value } = await ElMessageBox.prompt(t('newName'), t('renameTitle'), { inputValue: item.name, confirmButtonText: t('ok'), cancelButtonText: t('cancel') });
        if (!value || !value.trim() || value === item.name) return;
        addLog('REN ' + item.name + ' → ' + value.trim(), 'cmd');
        await ftpApi('rename', {
          sessionId: sessionId.value,
          oldPath: (remotePath.value + '/' + item.name).replace(/\/+/g, '/'),
          newPath: (remotePath.value + '/' + value.trim()).replace(/\/+/g, '/')
        });
        addLog('✓ ' + value.trim(), 'success');
        remoteSelected.value = [];
        await loadRemoteDir();
      } catch {}
    }

    /* ── Computed ── */
    const localSelectionInfo = computed(() => {
      const items = localSelected.value;
      if (!items.length) return '';
      const totalSize = items.reduce((s, i) => s + (i.size || 0), 0);
      return items.length + ' ' + t('selected') + ' — ' + formatSize(totalSize);
    });

    const remoteSelectionInfo = computed(() => {
      const items = remoteSelected.value;
      if (!items.length) return '';
      const totalSize = items.reduce((s, i) => s + (i.size || 0), 0);
      return items.length + ' ' + t('selected') + ' — ' + formatSize(totalSize);
    });

    /* ── Init / Cleanup ── */
    onMounted(() => {
      window.addEventListener('locale-changed', onLocaleChanged);
      loadSavedConns();
      loadLocalDir();
    });

    onUnmounted(() => {
      window.removeEventListener('locale-changed', onLocaleChanged);
      if (sessionId.value) {
        fetch('/api/ftp/disconnect', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ sessionId: sessionId.value }) }).catch(() => {});
      }
    });

    return {
      t, connForm, isConnected, isConnecting, sessionId,
      savedConns, showSavedPanel, saveConn, loadConn, deleteConn, deleteAllConns,
      importFileZillaXml,
      localPath, localFiles, localSelected, localLoading,
      remotePath, remoteFiles, remoteSelected, remoteLoading,
      transferring, transferText, logMessages, showLog,
      connect, disconnect,
      loadLocalDir, localEnter, localUp, toggleLocalSelect, isLocalSelected,
      loadRemoteDir, remoteEnter, remoteUp, toggleRemoteSelect, isRemoteSelected,
      uploadSelected, downloadSelected,
      remoteDelete, remoteMkdir, remoteRename,
      localSelectionInfo, remoteSelectionInfo,
      formatSize, fileIcon, addLog
    };
  }
})
