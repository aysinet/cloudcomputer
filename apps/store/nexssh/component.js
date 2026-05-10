({
  setup() {
    const { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } = Vue;
    const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success(){}, error(){}, warning(){}, info(){} };
    const ElMessageBox = (window.ElementPlus && window.ElementPlus.ElMessageBox) || { confirm: () => Promise.resolve(), prompt: () => Promise.resolve({ value: '' }) };

    /* ── i18n ── */
    const LANGS = {
      tr: {
        title:'NexSSH',
        connect:'Bağlan',
        disconnect:'Bağlantıyı Kes',
        host:'Sunucu (IP/Host)',
        port:'Port',
        username:'Kullanıcı Adı',
        password:'Şifre',
        quickConnect:'Hızlı Bağlantı',
        connected:'Bağlandı',
        disconnected:'Bağlantı kesildi',
        connecting:'Bağlanıyor...',
        terminal:'Terminal',
        fileManager:'Dosya Yöneticisi',
        remoteFiles:'Uzak Dosyalar',
        name:'Ad',
        size:'Boyut',
        modified:'Değiştirilme',
        permissions:'İzinler',
        owner:'Sahip',
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
        error:'Hata',
        savedConnections:'Kayıtlı Bağlantılar',
        save:'Kaydet',
        noSaved:'Kayıtlı bağlantı yok',
        connectionName:'Bağlantı adı',
        cancel:'İptal',
        ok:'Tamam',
        path:'Yol',
        deleteAll:'Tümünü Sil',
        serverCount:'sunucu',
        log:'Günlük',
        clearLog:'Günlüğü Temizle',
        status:'Durum',
        idle:'Boşta',
        parentDir:'Üst dizin',
        selected:'seçili',
        totalSize:'Toplam boyut',
        items:'öğe',
        execute:'Çalıştır',
        command:'Komut',
        clear:'Temizle',
        copy:'Kopyala',
        move:'Taşı',
        chmod:'İzin Değiştir',
        chmodTitle:'Dosya izinlerini değiştir',
        chmodMode:'Mod (örn: 755)',
        copyTo:'Kopyalama hedefi',
        moveTo:'Taşıma hedefi',
        targetPath:'Hedef yol',
        symlinkTarget:'Symlink hedefi',
        transferring:'Aktarılıyor...',
        transferred:'Aktarım tamamlandı',
        edit:'Düzenle',
        saveFile:'Dosyayı Kaydet',
        editor:'Editör',
        closeEditor:'Editörü Kapat',
        fileSaved:'Dosya kaydedildi',
        commandHistory:'Komut Geçmişi',
        noHistory:'Geçmiş yok',
        tabs:'Sekmeler',
        newTab:'Yeni Sekme',
        closeTab:'Sekmeyi Kapat',
        sftpUpload:'Dosya Yükle (SFTP)',
        privateKey:'Özel Anahtar',
        authMethod:'Kimlik Doğrulama',
        passwordAuth:'Şifre',
        keyAuth:'Anahtar',
        selectFile:'Dosya Seç'
      },
      en: {
        title:'NexSSH',
        connect:'Connect',
        disconnect:'Disconnect',
        host:'Host (IP/Hostname)',
        port:'Port',
        username:'Username',
        password:'Password',
        quickConnect:'Quick Connect',
        connected:'Connected',
        disconnected:'Disconnected',
        connecting:'Connecting...',
        terminal:'Terminal',
        fileManager:'File Manager',
        remoteFiles:'Remote Files',
        name:'Name',
        size:'Size',
        modified:'Modified',
        permissions:'Permissions',
        owner:'Owner',
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
        error:'Error',
        savedConnections:'Saved Connections',
        save:'Save',
        noSaved:'No saved connections',
        connectionName:'Connection name',
        cancel:'Cancel',
        ok:'OK',
        path:'Path',
        deleteAll:'Delete All',
        serverCount:'server(s)',
        log:'Log',
        clearLog:'Clear Log',
        status:'Status',
        idle:'Idle',
        parentDir:'Parent directory',
        selected:'selected',
        totalSize:'Total size',
        items:'items',
        execute:'Execute',
        command:'Command',
        clear:'Clear',
        copy:'Copy',
        move:'Move',
        chmod:'Change Permissions',
        chmodTitle:'Change file permissions',
        chmodMode:'Mode (e.g. 755)',
        copyTo:'Copy destination',
        moveTo:'Move destination',
        targetPath:'Target path',
        symlinkTarget:'Symlink target',
        transferring:'Transferring...',
        transferred:'Transfer completed',
        edit:'Edit',
        saveFile:'Save File',
        editor:'Editor',
        closeEditor:'Close Editor',
        fileSaved:'File saved',
        commandHistory:'Command History',
        noHistory:'No history',
        tabs:'Tabs',
        newTab:'New Tab',
        closeTab:'Close Tab',
        sftpUpload:'Upload File (SFTP)',
        privateKey:'Private Key',
        authMethod:'Authentication',
        passwordAuth:'Password',
        keyAuth:'Key',
        selectFile:'Select File'
      },
      de: {
        title:'NexSSH',
        connect:'Verbinden',
        disconnect:'Trennen',
        host:'Host (IP/Hostname)',
        port:'Port',
        username:'Benutzername',
        password:'Passwort',
        quickConnect:'Schnellverbindung',
        connected:'Verbunden',
        disconnected:'Getrennt',
        connecting:'Verbindung wird hergestellt...',
        terminal:'Terminal',
        fileManager:'Dateimanager',
        remoteFiles:'Remote-Dateien',
        name:'Name',
        size:'Größe',
        modified:'Geändert',
        permissions:'Berechtigungen',
        owner:'Besitzer',
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
        error:'Fehler',
        savedConnections:'Gespeicherte Verbindungen',
        save:'Speichern',
        noSaved:'Keine gespeicherten Verbindungen',
        connectionName:'Verbindungsname',
        cancel:'Abbrechen',
        ok:'OK',
        path:'Pfad',
        deleteAll:'Alle Löschen',
        serverCount:'Server',
        log:'Protokoll',
        clearLog:'Protokoll löschen',
        status:'Status',
        idle:'Bereit',
        parentDir:'Übergeordnetes Verzeichnis',
        selected:'ausgewählt',
        totalSize:'Gesamtgröße',
        items:'Elemente',
        execute:'Ausführen',
        command:'Befehl',
        clear:'Löschen',
        copy:'Kopieren',
        move:'Verschieben',
        chmod:'Berechtigungen ändern',
        chmodTitle:'Dateiberechtigungen ändern',
        chmodMode:'Modus (z.B. 755)',
        copyTo:'Kopierziel',
        moveTo:'Verschiebungsziel',
        targetPath:'Zielpfad',
        symlinkTarget:'Symlink-Ziel',
        transferring:'Übertragung...',
        transferred:'Übertragung abgeschlossen',
        edit:'Bearbeiten',
        saveFile:'Datei speichern',
        editor:'Editor',
        closeEditor:'Editor schließen',
        fileSaved:'Datei gespeichert',
        commandHistory:'Befehlsverlauf',
        noHistory:'Kein Verlauf',
        tabs:'Tabs',
        newTab:'Neuer Tab',
        closeTab:'Tab schließen',
        sftpUpload:'Datei hochladen (SFTP)',
        privateKey:'Privater Schlüssel',
        authMethod:'Authentifizierung',
        passwordAuth:'Passwort',
        keyAuth:'Schlüssel',
        selectFile:'Datei auswählen'
      },
      fr: {
        title:'NexSSH',
        connect:'Connecter',
        disconnect:'Déconnecter',
        host:'Hôte (IP/Nom d\'hôte)',
        port:'Port',
        username:'Nom d\'utilisateur',
        password:'Mot de passe',
        quickConnect:'Connexion rapide',
        connected:'Connecté',
        disconnected:'Déconnecté',
        connecting:'Connexion en cours...',
        terminal:'Terminal',
        fileManager:'Gestionnaire de fichiers',
        remoteFiles:'Fichiers distants',
        name:'Nom',
        size:'Taille',
        modified:'Modifié',
        permissions:'Permissions',
        owner:'Propriétaire',
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
        error:'Erreur',
        savedConnections:'Connexions enregistrées',
        save:'Enregistrer',
        noSaved:'Aucune connexion enregistrée',
        connectionName:'Nom de la connexion',
        cancel:'Annuler',
        ok:'OK',
        path:'Chemin',
        deleteAll:'Tout Supprimer',
        serverCount:'serveur(s)',
        log:'Journal',
        clearLog:'Effacer le journal',
        status:'Statut',
        idle:'Inactif',
        parentDir:'Dossier parent',
        selected:'sélectionné(s)',
        totalSize:'Taille totale',
        items:'éléments',
        execute:'Exécuter',
        command:'Commande',
        clear:'Effacer',
        copy:'Copier',
        move:'Déplacer',
        chmod:'Modifier les permissions',
        chmodTitle:'Modifier les permissions du fichier',
        chmodMode:'Mode (ex: 755)',
        copyTo:'Destination de copie',
        moveTo:'Destination de déplacement',
        targetPath:'Chemin cible',
        symlinkTarget:'Cible du symlink',
        transferring:'Transfert en cours...',
        transferred:'Transfert terminé',
        edit:'Modifier',
        saveFile:'Enregistrer le fichier',
        editor:'Éditeur',
        closeEditor:'Fermer l\'éditeur',
        fileSaved:'Fichier enregistré',
        commandHistory:'Historique des commandes',
        noHistory:'Aucun historique',
        tabs:'Onglets',
        newTab:'Nouvel onglet',
        closeTab:'Fermer l\'onglet',
        sftpUpload:'Envoyer un fichier (SFTP)',
        privateKey:'Clé privée',
        authMethod:'Authentification',
        passwordAuth:'Mot de passe',
        keyAuth:'Clé',
        selectFile:'Sélectionner un fichier'
      },
      es: {
        title:'NexSSH',
        connect:'Conectar',
        disconnect:'Desconectar',
        host:'Servidor (IP/Host)',
        port:'Puerto',
        username:'Usuario',
        password:'Contraseña',
        quickConnect:'Conexión rápida',
        connected:'Conectado',
        disconnected:'Desconectado',
        connecting:'Conectando...',
        terminal:'Terminal',
        fileManager:'Gestor de archivos',
        remoteFiles:'Archivos remotos',
        name:'Nombre',
        size:'Tamaño',
        modified:'Modificado',
        permissions:'Permisos',
        owner:'Propietario',
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
        error:'Error',
        savedConnections:'Conexiones guardadas',
        save:'Guardar',
        noSaved:'No hay conexiones guardadas',
        connectionName:'Nombre de conexión',
        cancel:'Cancelar',
        ok:'OK',
        path:'Ruta',
        deleteAll:'Eliminar Todo',
        serverCount:'servidor(es)',
        log:'Registro',
        clearLog:'Limpiar registro',
        status:'Estado',
        idle:'Inactivo',
        parentDir:'Directorio superior',
        selected:'seleccionados',
        totalSize:'Tamaño total',
        items:'elementos',
        execute:'Ejecutar',
        command:'Comando',
        clear:'Limpiar',
        copy:'Copiar',
        move:'Mover',
        chmod:'Cambiar permisos',
        chmodTitle:'Cambiar permisos del archivo',
        chmodMode:'Modo (ej: 755)',
        copyTo:'Destino de copia',
        moveTo:'Destino de movimiento',
        targetPath:'Ruta de destino',
        symlinkTarget:'Destino del symlink',
        transferring:'Transfiriendo...',
        transferred:'Transferencia completada',
        edit:'Editar',
        saveFile:'Guardar archivo',
        editor:'Editor',
        closeEditor:'Cerrar editor',
        fileSaved:'Archivo guardado',
        commandHistory:'Historial de comandos',
        noHistory:'Sin historial',
        tabs:'Pestañas',
        newTab:'Nueva pestaña',
        closeTab:'Cerrar pestaña',
        sftpUpload:'Subir archivo (SFTP)',
        privateKey:'Clave privada',
        authMethod:'Autenticación',
        passwordAuth:'Contraseña',
        keyAuth:'Clave',
        selectFile:'Seleccionar archivo'
      },
      ru: {
        title:'NexSSH',
        connect:'Подключить',
        disconnect:'Отключить',
        host:'Хост (IP/Имя)',
        port:'Порт',
        username:'Имя пользователя',
        password:'Пароль',
        quickConnect:'Быстрое подключение',
        connected:'Подключено',
        disconnected:'Отключено',
        connecting:'Подключение...',
        terminal:'Терминал',
        fileManager:'Файловый менеджер',
        remoteFiles:'Удалённые файлы',
        name:'Имя',
        size:'Размер',
        modified:'Изменён',
        permissions:'Права',
        owner:'Владелец',
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
        error:'Ошибка',
        savedConnections:'Сохранённые подключения',
        save:'Сохранить',
        noSaved:'Нет сохранённых подключений',
        connectionName:'Имя подключения',
        cancel:'Отмена',
        ok:'ОК',
        path:'Путь',
        deleteAll:'Удалить Все',
        serverCount:'сервер(ов)',
        log:'Журнал',
        clearLog:'Очистить журнал',
        status:'Статус',
        idle:'Ожидание',
        parentDir:'Родительский каталог',
        selected:'выбрано',
        totalSize:'Общий размер',
        items:'элементов',
        execute:'Выполнить',
        command:'Команда',
        clear:'Очистить',
        copy:'Копировать',
        move:'Переместить',
        chmod:'Изменить права',
        chmodTitle:'Изменить права файла',
        chmodMode:'Режим (напр. 755)',
        copyTo:'Куда копировать',
        moveTo:'Куда переместить',
        targetPath:'Целевой путь',
        symlinkTarget:'Цель симлинка',
        transferring:'Передача...',
        transferred:'Передача завершена',
        edit:'Редактировать',
        saveFile:'Сохранить файл',
        editor:'Редактор',
        closeEditor:'Закрыть редактор',
        fileSaved:'Файл сохранён',
        commandHistory:'История команд',
        noHistory:'Нет истории',
        tabs:'Вкладки',
        newTab:'Новая вкладка',
        closeTab:'Закрыть вкладку',
        sftpUpload:'Загрузить файл (SFTP)',
        privateKey:'Приватный ключ',
        authMethod:'Аутентификация',
        passwordAuth:'Пароль',
        keyAuth:'Ключ',
        selectFile:'Выбрать файл'
      },
      zh: {
        title:'NexSSH',
        connect:'连接',
        disconnect:'断开',
        host:'主机 (IP/主机名)',
        port:'端口',
        username:'用户名',
        password:'密码',
        quickConnect:'快速连接',
        connected:'已连接',
        disconnected:'已断开',
        connecting:'连接中...',
        terminal:'终端',
        fileManager:'文件管理器',
        remoteFiles:'远程文件',
        name:'名称',
        size:'大小',
        modified:'修改时间',
        permissions:'权限',
        owner:'所有者',
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
        error:'错误',
        savedConnections:'已保存的连接',
        save:'保存',
        noSaved:'没有保存的连接',
        connectionName:'连接名称',
        cancel:'取消',
        ok:'确定',
        path:'路径',
        deleteAll:'全部删除',
        serverCount:'个服务器',
        log:'日志',
        clearLog:'清除日志',
        status:'状态',
        idle:'空闲',
        parentDir:'上级目录',
        selected:'已选',
        totalSize:'总大小',
        items:'项',
        execute:'执行',
        command:'命令',
        clear:'清除',
        copy:'复制',
        move:'移动',
        chmod:'修改权限',
        chmodTitle:'修改文件权限',
        chmodMode:'模式（如 755）',
        copyTo:'复制目标',
        moveTo:'移动目标',
        targetPath:'目标路径',
        symlinkTarget:'符号链接目标',
        transferring:'传输中...',
        transferred:'传输完成',
        edit:'编辑',
        saveFile:'保存文件',
        editor:'编辑器',
        closeEditor:'关闭编辑器',
        fileSaved:'文件已保存',
        commandHistory:'命令历史',
        noHistory:'无历史记录',
        tabs:'标签页',
        newTab:'新标签',
        closeTab:'关闭标签',
        sftpUpload:'上传文件 (SFTP)',
        privateKey:'私钥',
        authMethod:'认证方式',
        passwordAuth:'密码',
        keyAuth:'密钥',
        selectFile:'选择文件'
      },
      ja: {
        title:'NexSSH',
        connect:'接続',
        disconnect:'切断',
        host:'ホスト (IP/ホスト名)',
        port:'ポート',
        username:'ユーザー名',
        password:'パスワード',
        quickConnect:'クイック接続',
        connected:'接続済',
        disconnected:'切断済',
        connecting:'接続中...',
        terminal:'ターミナル',
        fileManager:'ファイルマネージャー',
        remoteFiles:'リモートファイル',
        name:'名前',
        size:'サイズ',
        modified:'更新日時',
        permissions:'権限',
        owner:'所有者',
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
        error:'エラー',
        savedConnections:'保存済の接続',
        save:'保存',
        noSaved:'保存済の接続なし',
        connectionName:'接続名',
        cancel:'キャンセル',
        ok:'OK',
        path:'パス',
        deleteAll:'すべて削除',
        serverCount:'サーバー',
        log:'ログ',
        clearLog:'ログクリア',
        status:'状態',
        idle:'待機中',
        parentDir:'親ディレクトリ',
        selected:'選択中',
        totalSize:'合計サイズ',
        items:'件',
        execute:'実行',
        command:'コマンド',
        clear:'クリア',
        copy:'コピー',
        move:'移動',
        chmod:'権限変更',
        chmodTitle:'ファイル権限の変更',
        chmodMode:'モード（例: 755）',
        copyTo:'コピー先',
        moveTo:'移動先',
        targetPath:'ターゲットパス',
        symlinkTarget:'シンボリックリンク先',
        transferring:'転送中...',
        transferred:'転送完了',
        edit:'編集',
        saveFile:'ファイルを保存',
        editor:'エディタ',
        closeEditor:'エディタを閉じる',
        fileSaved:'ファイルが保存されました',
        commandHistory:'コマンド履歴',
        noHistory:'履歴なし',
        tabs:'タブ',
        newTab:'新しいタブ',
        closeTab:'タブを閉じる',
        sftpUpload:'ファイルをアップロード (SFTP)',
        privateKey:'秘密鍵',
        authMethod:'認証方法',
        passwordAuth:'パスワード',
        keyAuth:'鍵',
        selectFile:'ファイルを選択'
      },
      it: {
        title:'NexSSH',
        connect:'Connetti',
        disconnect:'Disconnetti',
        host:'Host (IP/Nome host)',
        port:'Porta',
        username:'Nome utente',
        password:'Password',
        quickConnect:'Connessione rapida',
        connected:'Connesso',
        disconnected:'Disconnesso',
        connecting:'Connessione...',
        terminal:'Terminale',
        fileManager:'Gestore file',
        remoteFiles:'File remoti',
        name:'Nome',
        size:'Dimensione',
        modified:'Modificato',
        permissions:'Permessi',
        owner:'Proprietario',
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
        error:'Errore',
        savedConnections:'Connessioni salvate',
        save:'Salva',
        noSaved:'Nessuna connessione salvata',
        connectionName:'Nome connessione',
        cancel:'Annulla',
        ok:'OK',
        path:'Percorso',
        deleteAll:'Elimina Tutto',
        serverCount:'server',
        log:'Registro',
        clearLog:'Cancella registro',
        status:'Stato',
        idle:'Inattivo',
        parentDir:'Directory superiore',
        selected:'selezionati',
        totalSize:'Dimensione totale',
        items:'elementi',
        execute:'Esegui',
        command:'Comando',
        clear:'Cancella',
        copy:'Copia',
        move:'Sposta',
        chmod:'Modifica permessi',
        chmodTitle:'Modifica permessi del file',
        chmodMode:'Modalità (es. 755)',
        copyTo:'Destinazione copia',
        moveTo:'Destinazione spostamento',
        targetPath:'Percorso di destinazione',
        symlinkTarget:'Destinazione symlink',
        transferring:'Trasferimento...',
        transferred:'Trasferimento completato',
        edit:'Modifica',
        saveFile:'Salva file',
        editor:'Editor',
        closeEditor:'Chiudi editor',
        fileSaved:'File salvato',
        commandHistory:'Cronologia comandi',
        noHistory:'Nessuna cronologia',
        tabs:'Schede',
        newTab:'Nuova scheda',
        closeTab:'Chiudi scheda',
        sftpUpload:'Carica file (SFTP)',
        privateKey:'Chiave privata',
        authMethod:'Autenticazione',
        passwordAuth:'Password',
        keyAuth:'Chiave',
        selectFile:'Seleziona file'
      },
      ar: {
        title:'NexSSH',
        connect:'اتصال',
        disconnect:'قطع الاتصال',
        host:'المضيف (IP/اسم المضيف)',
        port:'المنفذ',
        username:'اسم المستخدم',
        password:'كلمة المرور',
        quickConnect:'اتصال سريع',
        connected:'متصل',
        disconnected:'غير متصل',
        connecting:'جارٍ الاتصال...',
        terminal:'الطرفية',
        fileManager:'مدير الملفات',
        remoteFiles:'الملفات البعيدة',
        name:'الاسم',
        size:'الحجم',
        modified:'تاريخ التعديل',
        permissions:'الأذونات',
        owner:'المالك',
        type:'النوع',
        folder:'مجلد',
        file:'ملف',
        upload:'رفع',
        download:'تنزيل',
        delete:'حذف',
        rename:'إعادة تسمية',
        newFolder:'مجلد جديد',
        refresh:'تحديث',
        deleteConfirm:'هل أنت متأكد أنك تريد حذف هذا العنصر؟',
        newFolderName:'اسم المجلد الجديد',
        renameTitle:'إعادة تسمية',
        newName:'الاسم الجديد',
        error:'خطأ',
        savedConnections:'الاتصالات المحفوظة',
        save:'حفظ',
        noSaved:'لا توجد اتصالات محفوظة',
        connectionName:'اسم الاتصال',
        cancel:'إلغاء',
        ok:'موافق',
        path:'المسار',
        deleteAll:'حذف الكل',
        serverCount:'خادم',
        log:'السجل',
        clearLog:'مسح السجل',
        status:'الحالة',
        idle:'خامل',
        parentDir:'المجلد الأصلي',
        selected:'محدد',
        totalSize:'الحجم الكلي',
        items:'عناصر',
        execute:'تنفيذ',
        command:'أمر',
        clear:'مسح',
        copy:'نسخ',
        move:'نقل',
        chmod:'تغيير الأذونات',
        chmodTitle:'تغيير أذونات الملف',
        chmodMode:'الوضع (مثال: 755)',
        copyTo:'وجهة النسخ',
        moveTo:'وجهة النقل',
        targetPath:'المسار الهدف',
        symlinkTarget:'هدف الرابط الرمزي',
        transferring:'جارٍ النقل...',
        transferred:'اكتمل النقل',
        edit:'تعديل',
        saveFile:'حفظ الملف',
        editor:'المحرر',
        closeEditor:'إغلاق المحرر',
        fileSaved:'تم حفظ الملف',
        commandHistory:'سجل الأوامر',
        noHistory:'لا يوجد سجل',
        tabs:'علامات التبويب',
        newTab:'علامة تبويب جديدة',
        closeTab:'إغلاق علامة التبويب',
        sftpUpload:'رفع ملف (SFTP)',
        privateKey:'المفتاح الخاص',
        authMethod:'المصادقة',
        passwordAuth:'كلمة المرور',
        keyAuth:'مفتاح',
        selectFile:'اختر ملف'
      },
      ko: {
        title:'NexSSH',
        connect:'연결',
        disconnect:'연결 끊기',
        host:'호스트 (IP/호스트명)',
        port:'포트',
        username:'사용자 이름',
        password:'비밀번호',
        quickConnect:'빠른 연결',
        connected:'연결됨',
        disconnected:'연결 끊김',
        connecting:'연결 중...',
        terminal:'터미널',
        fileManager:'파일 관리자',
        remoteFiles:'원격 파일',
        name:'이름',
        size:'크기',
        modified:'수정됨',
        permissions:'권한',
        owner:'소유자',
        type:'유형',
        folder:'폴더',
        file:'파일',
        upload:'업로드',
        download:'다운로드',
        delete:'삭제',
        rename:'이름 변경',
        newFolder:'새 폴더',
        refresh:'새로고침',
        deleteConfirm:'이 항목을 삭제하시겠습니까?',
        newFolderName:'새 폴더 이름',
        renameTitle:'이름 변경',
        newName:'새 이름',
        error:'오류',
        savedConnections:'저장된 연결',
        save:'저장',
        noSaved:'저장된 연결 없음',
        connectionName:'연결 이름',
        cancel:'취소',
        ok:'확인',
        path:'경로',
        deleteAll:'모두 삭제',
        serverCount:'서버',
        log:'로그',
        clearLog:'로그 지우기',
        status:'상태',
        idle:'대기',
        parentDir:'상위 디렉토리',
        selected:'선택됨',
        totalSize:'총 크기',
        items:'항목',
        execute:'실행',
        command:'명령어',
        clear:'지우기',
        copy:'복사',
        move:'이동',
        chmod:'권한 변경',
        chmodTitle:'파일 권한 변경',
        chmodMode:'모드 (예: 755)',
        copyTo:'복사 대상',
        moveTo:'이동 대상',
        targetPath:'대상 경로',
        symlinkTarget:'심볼릭 링크 대상',
        transferring:'전송 중...',
        transferred:'전송 완료',
        edit:'편집',
        saveFile:'파일 저장',
        editor:'편집기',
        closeEditor:'편집기 닫기',
        fileSaved:'파일 저장됨',
        commandHistory:'명령어 기록',
        noHistory:'기록 없음',
        tabs:'탭',
        newTab:'새 탭',
        closeTab:'탭 닫기',
        sftpUpload:'파일 업로드 (SFTP)',
        privateKey:'개인 키',
        authMethod:'인증',
        passwordAuth:'비밀번호',
        keyAuth:'키',
        selectFile:'파일 선택'
      },
      hi: {
        title:'NexSSH',
        connect:'कनेक्ट',
        disconnect:'डिस्कनेक्ट',
        host:'होस्ट (IP/होस्टनेम)',
        port:'पोर्ट',
        username:'उपयोगकर्ता नाम',
        password:'पासवर्ड',
        quickConnect:'त्वरित कनेक्ट',
        connected:'कनेक्टेड',
        disconnected:'डिस्कनेक्ट',
        connecting:'कनेक्ट हो रहा है...',
        terminal:'टर्मिनल',
        fileManager:'फ़ाइल प्रबंधक',
        remoteFiles:'रिमोट फ़ाइलें',
        name:'नाम',
        size:'आकार',
        modified:'संशोधित',
        permissions:'अनुमतियाँ',
        owner:'मालिक',
        type:'प्रकार',
        folder:'फ़ोल्डर',
        file:'फ़ाइल',
        upload:'अपलोड',
        download:'डाउनलोड',
        delete:'हटाएं',
        rename:'नाम बदलें',
        newFolder:'नया फ़ोल्डर',
        refresh:'रीफ्रेश',
        deleteConfirm:'क्या आप इस आइटम को हटाना चाहते हैं?',
        newFolderName:'नया फ़ोल्डर नाम',
        renameTitle:'नाम बदलें',
        newName:'नया नाम',
        error:'त्रुटि',
        savedConnections:'सहेजे गए कनेक्शन',
        save:'सहेजें',
        noSaved:'कोई सहेजा गया कनेक्शन नहीं',
        connectionName:'कनेक्शन नाम',
        cancel:'रद्द करें',
        ok:'ठीक है',
        path:'पथ',
        deleteAll:'सब हटाएं',
        serverCount:'सर्वर',
        log:'लॉग',
        clearLog:'लॉग साफ़ करें',
        status:'स्थिति',
        idle:'निष्क्रिय',
        parentDir:'मूल निर्देशिका',
        selected:'चयनित',
        totalSize:'कुल आकार',
        items:'आइटम',
        execute:'चलाएं',
        command:'कमांड',
        clear:'साफ़ करें',
        copy:'कॉपी',
        move:'मूव',
        chmod:'अनुमतियाँ बदलें',
        chmodTitle:'फ़ाइल अनुमतियाँ बदलें',
        chmodMode:'मोड (उदा: 755)',
        copyTo:'कॉपी गंतव्य',
        moveTo:'मूव गंतव्य',
        targetPath:'लक्ष्य पथ',
        symlinkTarget:'सिमलिंक लक्ष्य',
        transferring:'स्थानांतरित हो रहा है...',
        transferred:'स्थानांतरण पूर्ण',
        edit:'संपादित करें',
        saveFile:'फ़ाइल सहेजें',
        editor:'संपादक',
        closeEditor:'संपादक बंद करें',
        fileSaved:'फ़ाइल सहेजी गई',
        commandHistory:'कमांड इतिहास',
        noHistory:'कोई इतिहास नहीं',
        tabs:'टैब',
        newTab:'नया टैब',
        closeTab:'टैब बंद करें',
        sftpUpload:'फ़ाइल अपलोड (SFTP)',
        privateKey:'निजी कुंजी',
        authMethod:'प्रमाणीकरण',
        passwordAuth:'पासवर्ड',
        keyAuth:'कुंजी',
        selectFile:'फ़ाइल चुनें'
      },
      pt: {
        title:'NexSSH',
        connect:'Conectar',
        disconnect:'Desconectar',
        host:'Host (IP/Nome do host)',
        port:'Porta',
        username:'Nome de utilizador',
        password:'Senha',
        quickConnect:'Conexão rápida',
        connected:'Conectado',
        disconnected:'Desconectado',
        connecting:'Conectando...',
        terminal:'Terminal',
        fileManager:'Gerenciador de arquivos',
        remoteFiles:'Arquivos remotos',
        name:'Nome',
        size:'Tamanho',
        modified:'Modificado',
        permissions:'Permissões',
        owner:'Proprietário',
        type:'Tipo',
        folder:'Pasta',
        file:'Arquivo',
        upload:'Enviar',
        download:'Baixar',
        delete:'Excluir',
        rename:'Renomear',
        newFolder:'Nova pasta',
        refresh:'Atualizar',
        deleteConfirm:'Tem certeza de que deseja excluir este item?',
        newFolderName:'Nome da nova pasta',
        renameTitle:'Renomear',
        newName:'Novo nome',
        error:'Erro',
        savedConnections:'Conexões salvas',
        save:'Salvar',
        noSaved:'Nenhuma conexão salva',
        connectionName:'Nome da conexão',
        cancel:'Cancelar',
        ok:'OK',
        path:'Caminho',
        deleteAll:'Excluir tudo',
        serverCount:'servidor(es)',
        log:'Log',
        clearLog:'Limpar log',
        status:'Status',
        idle:'Ocioso',
        parentDir:'Diretório pai',
        selected:'selecionado(s)',
        totalSize:'Tamanho total',
        items:'itens',
        execute:'Executar',
        command:'Comando',
        clear:'Limpar',
        copy:'Copiar',
        move:'Mover',
        chmod:'Alterar permissões',
        chmodTitle:'Alterar permissões do arquivo',
        chmodMode:'Modo (ex: 755)',
        copyTo:'Destino da cópia',
        moveTo:'Destino da movimentação',
        targetPath:'Caminho de destino',
        symlinkTarget:'Destino do symlink',
        transferring:'Transferindo...',
        transferred:'Transferência concluída',
        edit:'Editar',
        saveFile:'Salvar arquivo',
        editor:'Editor',
        closeEditor:'Fechar editor',
        fileSaved:'Arquivo salvo',
        commandHistory:'Histórico de comandos',
        noHistory:'Sem histórico',
        tabs:'Abas',
        newTab:'Nova aba',
        closeTab:'Fechar aba',
        sftpUpload:'Enviar arquivo (SFTP)',
        privateKey:'Chave privada',
        authMethod:'Autenticação',
        passwordAuth:'Senha',
        keyAuth:'Chave',
        selectFile:'Selecionar arquivo'
      }
    };

    function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }
    const locale = ref(getLocale());
    function t(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
    function onLocaleChanged() { locale.value = getLocale(); }

    function getToken() { return localStorage.getItem('auth_token') || ''; }
    function authHeaders() { return { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }

    /* ── Connection state ── */
    const connForm = reactive({ host: '', port: 22, username: 'root', password: '', name: '', authMethod: 'password', privateKey: '' });
    const isConnected = ref(false);
    const isConnecting = ref(false);
    const sessionId = ref(null);
    const savedConns = ref([]);
    const showSavedPanel = ref(false);

    /* ── Active view ── */
    const activeView = ref('terminal'); // 'terminal' or 'files'

    /* ── Terminal ── */
    const terminalOutput = ref([]);
    const currentCommand = ref('');
    const commandRunning = ref(false);
    const commandHistory = ref([]);
    const historyIndex = ref(-1);
    const cwd = ref('~');

    /* ── File manager ── */
    const remotePath = ref('/');
    const remoteFiles = ref([]);
    const remoteSelected = ref([]);
    const remoteLoading = ref(false);

    /* ── File editor ── */
    const editorVisible = ref(false);
    const editorFilePath = ref('');
    const editorContent = ref('');
    const editorSaving = ref(false);

    /* ── Transfer ── */
    const transferring = ref(false);
    const transferText = ref('');

    /* ── Log ── */
    const logMessages = ref([]);
    const showLog = ref(true);

    function addLog(msg, type) {
      const ts = new Date().toLocaleTimeString();
      logMessages.value.push({ ts, msg, type: type || 'info' });
      if (logMessages.value.length > 300) logMessages.value.splice(0, 100);
      nextTick(() => {
        const el = document.querySelector('.ssh-log-body');
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
        css:'🎨', js:'⚡', py:'🐍', java:'☕', c:'⚙️', cpp:'⚙️', sh:'💻', conf:'⚙️',
        log:'📋', key:'🔑', pem:'🔑', crt:'🔏', yml:'📋', yaml:'📋' };
      return icons[ext] || '📄';
    }

    /* ── API helper ── */
    async function sshApi(endpoint, body) {
      const res = await fetch('/api/ssh/' + endpoint, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'API error');
      return data;
    }

    /* ── Saved connections ── */
    async function loadSavedConns() {
      try {
        const res = await fetch('/api/ssh/connections', { headers: authHeaders() });
        if (res.ok) {
          const rows = await res.json();
          savedConns.value = rows.map(r => ({ id: r.id, name: r.name, host: r.host, port: r.port, username: r.username, authMethod: r.auth_method || 'password' }));
        } else { savedConns.value = []; }
      } catch { savedConns.value = []; }
    }

    async function saveConn() {
      const name = connForm.name || (connForm.host + ':' + connForm.port);
      try {
        const existing = savedConns.value.find(c => c.name === name);
        if (existing && existing.id) {
          await fetch('/api/ssh/connections/' + existing.id, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ name, host: connForm.host, port: connForm.port, username: connForm.username, authMethod: connForm.authMethod }) });
        } else {
          await fetch('/api/ssh/connections', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ name, host: connForm.host, port: connForm.port, username: connForm.username, authMethod: connForm.authMethod }) });
        }
        await loadSavedConns();
        ElMessage.success(t('save') + ' ✓');
      } catch (e) { ElMessage.error(e.message); }
    }

    function loadConn(c) {
      connForm.host = c.host;
      connForm.port = c.port;
      connForm.username = c.username;
      connForm.authMethod = c.authMethod || 'password';
      connForm.name = c.name;
      connForm.password = '';
      connForm.privateKey = '';
      showSavedPanel.value = false;
    }

    async function deleteConn(idx) {
      const c = savedConns.value[idx];
      if (c && c.id) {
        try { await fetch('/api/ssh/connections/' + c.id, { method: 'DELETE', headers: authHeaders() }); } catch {}
      }
      await loadSavedConns();
    }

    async function deleteAllConns() {
      try { await fetch('/api/ssh/connections', { method: 'DELETE', headers: authHeaders() }); } catch {}
      savedConns.value = [];
    }

    /* ── Connect / Disconnect ── */
    async function connect() {
      if (!connForm.host) { ElMessage.warning(t('host') + '!'); return; }
      if (!connForm.username) { ElMessage.warning(t('username') + '!'); return; }
      isConnecting.value = true;
      addLog(`${t('connecting')} ${connForm.username}@${connForm.host}:${connForm.port}`, 'cmd');
      try {
        const payload = {
          host: connForm.host,
          port: connForm.port,
          username: connForm.username
        };
        if (connForm.authMethod === 'key' && connForm.privateKey) {
          payload.privateKey = connForm.privateKey;
        } else {
          payload.password = connForm.password;
        }
        const data = await sshApi('connect', payload);
        sessionId.value = data.sessionId;
        isConnected.value = true;
        cwd.value = data.cwd || '~';
        addLog(`✓ ${t('connected')} — ${connForm.username}@${connForm.host}`, 'success');
        ElMessage.success(t('connected'));
        terminalOutput.value = [];
        terminalOutput.value.push({ type: 'system', text: `Connected to ${connForm.host} as ${connForm.username}` });
        if (activeView.value === 'files') {
          remotePath.value = data.cwd || '/';
          await loadRemoteDir();
        }
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
        await sshApi('disconnect', { sessionId: sessionId.value });
      } catch {}
      sessionId.value = null;
      isConnected.value = false;
      remoteFiles.value = [];
      remotePath.value = '/';
      remoteSelected.value = [];
      terminalOutput.value = [];
      cwd.value = '~';
      addLog(t('disconnected'), 'info');
      ElMessage.info(t('disconnected'));
    }

    /* ── Terminal: execute command ── */
    async function executeCommand() {
      if (!sessionId.value || !currentCommand.value.trim()) return;
      const cmd = currentCommand.value.trim();
      commandHistory.value.unshift(cmd);
      if (commandHistory.value.length > 100) commandHistory.value.pop();
      historyIndex.value = -1;
      terminalOutput.value.push({ type: 'input', text: `${connForm.username}@${connForm.host}:${cwd.value}$ ${cmd}` });
      currentCommand.value = '';
      commandRunning.value = true;
      try {
        const data = await sshApi('exec', { sessionId: sessionId.value, command: cmd });
        if (data.stdout) {
          data.stdout.split('\n').forEach(line => {
            terminalOutput.value.push({ type: 'stdout', text: line });
          });
        }
        if (data.stderr) {
          data.stderr.split('\n').forEach(line => {
            if (line.trim()) terminalOutput.value.push({ type: 'stderr', text: line });
          });
        }
        if (data.cwd) cwd.value = data.cwd;
      } catch (e) {
        terminalOutput.value.push({ type: 'stderr', text: e.message });
        addLog(`✗ ${e.message}`, 'error');
      }
      commandRunning.value = false;
      // keep terminal scrolled to bottom
      nextTick(() => {
        const el = document.querySelector('.ssh-terminal-output');
        if (el) el.scrollTop = el.scrollHeight;
      });
    }

    function onTerminalKeydown(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeCommand();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (commandHistory.value.length > 0) {
          historyIndex.value = Math.min(historyIndex.value + 1, commandHistory.value.length - 1);
          currentCommand.value = commandHistory.value[historyIndex.value];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex.value > 0) {
          historyIndex.value--;
          currentCommand.value = commandHistory.value[historyIndex.value];
        } else {
          historyIndex.value = -1;
          currentCommand.value = '';
        }
      }
    }

    function clearTerminal() {
      terminalOutput.value = [];
    }

    /* ── File Manager ── */
    async function loadRemoteDir() {
      if (!sessionId.value) return;
      remoteLoading.value = true;
      remoteSelected.value = [];
      try {
        const data = await sshApi('sftp-list', { sessionId: sessionId.value, path: remotePath.value });
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
      if (!remotePath.value) remotePath.value = '/';
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

    /* ── SFTP operations ── */
    async function sftpDelete() {
      if (!sessionId.value || !remoteSelected.value.length) return;
      try {
        await ElMessageBox.confirm(t('deleteConfirm'), t('delete'), { type: 'warning', confirmButtonText: t('ok'), cancelButtonText: t('cancel') });
      } catch { return; }
      for (const item of remoteSelected.value) {
        const fullPath = (remotePath.value + '/' + item.name).replace(/\/+/g, '/');
        addLog('DEL ' + fullPath, 'cmd');
        try {
          await sshApi('sftp-delete', { sessionId: sessionId.value, path: fullPath, isDir: item.isDir });
          addLog('✓ ' + t('delete') + ' ' + item.name, 'success');
        } catch (e) { addLog('✗ ' + e.message, 'error'); }
      }
      remoteSelected.value = [];
      await loadRemoteDir();
    }

    async function sftpMkdir() {
      try {
        const { value } = await ElMessageBox.prompt(t('newFolderName'), t('newFolder'), { confirmButtonText: t('ok'), cancelButtonText: t('cancel') });
        if (!value || !value.trim()) return;
        const dirPath = (remotePath.value + '/' + value.trim()).replace(/\/+/g, '/');
        addLog('MKDIR ' + dirPath, 'cmd');
        await sshApi('sftp-mkdir', { sessionId: sessionId.value, path: dirPath });
        addLog('✓ ' + value.trim(), 'success');
        await loadRemoteDir();
      } catch {}
    }

    async function sftpRename() {
      if (!remoteSelected.value.length) return;
      const item = remoteSelected.value[0];
      try {
        const { value } = await ElMessageBox.prompt(t('newName'), t('renameTitle'), { inputValue: item.name, confirmButtonText: t('ok'), cancelButtonText: t('cancel') });
        if (!value || !value.trim() || value === item.name) return;
        const oldPath = (remotePath.value + '/' + item.name).replace(/\/+/g, '/');
        const newPath = (remotePath.value + '/' + value.trim()).replace(/\/+/g, '/');
        addLog('REN ' + item.name + ' → ' + value.trim(), 'cmd');
        await sshApi('sftp-rename', { sessionId: sessionId.value, oldPath, newPath });
        addLog('✓ ' + value.trim(), 'success');
        remoteSelected.value = [];
        await loadRemoteDir();
      } catch {}
    }

    async function sftpChmod() {
      if (!remoteSelected.value.length) return;
      const item = remoteSelected.value[0];
      try {
        const { value } = await ElMessageBox.prompt(t('chmodMode'), t('chmodTitle'), { inputValue: '755', confirmButtonText: t('ok'), cancelButtonText: t('cancel') });
        if (!value || !value.trim()) return;
        const filePath = (remotePath.value + '/' + item.name).replace(/\/+/g, '/');
        addLog('CHMOD ' + value.trim() + ' ' + item.name, 'cmd');
        await sshApi('sftp-chmod', { sessionId: sessionId.value, path: filePath, mode: value.trim() });
        addLog('✓ chmod ' + value.trim() + ' ' + item.name, 'success');
        await loadRemoteDir();
      } catch {}
    }

    async function sftpCopy() {
      if (!remoteSelected.value.length) return;
      const item = remoteSelected.value[0];
      const srcPath = (remotePath.value + '/' + item.name).replace(/\/+/g, '/');
      try {
        const { value } = await ElMessageBox.prompt(t('targetPath'), t('copyTo'), { inputValue: srcPath + '.copy', confirmButtonText: t('ok'), cancelButtonText: t('cancel') });
        if (!value || !value.trim()) return;
        addLog('CP ' + srcPath + ' → ' + value.trim(), 'cmd');
        await sshApi('exec', { sessionId: sessionId.value, command: 'cp -r ' + JSON.stringify(srcPath) + ' ' + JSON.stringify(value.trim()) });
        addLog('✓ ' + t('copy') + ' ' + item.name, 'success');
        await loadRemoteDir();
      } catch {}
    }

    async function sftpMove() {
      if (!remoteSelected.value.length) return;
      const item = remoteSelected.value[0];
      const srcPath = (remotePath.value + '/' + item.name).replace(/\/+/g, '/');
      try {
        const { value } = await ElMessageBox.prompt(t('targetPath'), t('moveTo'), { inputValue: srcPath, confirmButtonText: t('ok'), cancelButtonText: t('cancel') });
        if (!value || !value.trim() || value === srcPath) return;
        addLog('MV ' + srcPath + ' → ' + value.trim(), 'cmd');
        await sshApi('exec', { sessionId: sessionId.value, command: 'mv ' + JSON.stringify(srcPath) + ' ' + JSON.stringify(value.trim()) });
        addLog('✓ ' + t('move') + ' ' + item.name, 'success');
        remoteSelected.value = [];
        await loadRemoteDir();
      } catch {}
    }

    /* ── Download: remote → local (user files) ── */
    async function sftpDownload() {
      if (!sessionId.value || !remoteSelected.value.length) return;
      transferring.value = true;
      let ok = 0, fail = 0;
      for (const item of remoteSelected.value) {
        if (item.isDir) continue;
        const remoteFull = (remotePath.value + '/' + item.name).replace(/\/+/g, '/');
        transferText.value = '↓ ' + item.name;
        addLog('↓ ' + item.name, 'cmd');
        try {
          await sshApi('sftp-download', { sessionId: sessionId.value, remotePath: remoteFull, localPath: item.name });
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
      ElMessage.success(t('transferred') + ` (${ok}/${ok + fail})`);
    }

    /* ── Upload: local → remote (SFTP) ── */
    async function sftpUpload() {
      if (!sessionId.value) return;
      if (window.FileDialog) {
        try {
          const result = await window.FileDialog.open({ multiple: true });
          if (!result || (Array.isArray(result) && !result.length)) return;
          const files = Array.isArray(result) ? result : [result];
          transferring.value = true;
          let ok = 0, fail = 0;
          for (const file of files) {
            const localPath = typeof file === 'string' ? file : file.path;
            const fileName = localPath.split('/').pop();
            const remoteFull = (remotePath.value + '/' + fileName).replace(/\/+/g, '/');
            transferText.value = '↑ ' + fileName;
            addLog('↑ ' + fileName, 'cmd');
            try {
              await sshApi('sftp-upload', { sessionId: sessionId.value, localPath, remotePath: remoteFull });
              addLog('✓ ' + fileName, 'success');
              ok++;
            } catch (e) {
              addLog('✗ ' + fileName + ': ' + e.message, 'error');
              fail++;
            }
          }
          transferring.value = false;
          transferText.value = '';
          await loadRemoteDir();
          ElMessage.success(t('transferred') + ` (${ok}/${ok + fail})`);
        } catch {}
      }
    }

    /* ── Edit remote file ── */
    async function editFile(item) {
      if (!item || item.isDir) return;
      const filePath = (remotePath.value + '/' + item.name).replace(/\/+/g, '/');
      try {
        const data = await sshApi('sftp-read', { sessionId: sessionId.value, path: filePath });
        editorFilePath.value = filePath;
        editorContent.value = data.content || '';
        editorVisible.value = true;
      } catch (e) {
        ElMessage.error(e.message);
      }
    }

    async function saveEditorFile() {
      if (!sessionId.value || !editorFilePath.value) return;
      editorSaving.value = true;
      try {
        await sshApi('sftp-write', { sessionId: sessionId.value, path: editorFilePath.value, content: editorContent.value });
        ElMessage.success(t('fileSaved'));
        addLog('✓ ' + t('fileSaved') + ' ' + editorFilePath.value, 'success');
      } catch (e) {
        ElMessage.error(e.message);
        addLog('✗ ' + e.message, 'error');
      }
      editorSaving.value = false;
    }

    function closeEditor() {
      editorVisible.value = false;
      editorFilePath.value = '';
      editorContent.value = '';
    }

    /* ── Computed ── */
    const remoteSelectionInfo = computed(() => {
      const items = remoteSelected.value;
      if (!items.length) return '';
      const totalSize = items.reduce((s, i) => s + (i.size || 0), 0);
      return items.length + ' ' + t('selected') + ' — ' + formatSize(totalSize);
    });

    /* ── Watch activeView ── */
    watch(activeView, (view) => {
      if (view === 'files' && isConnected.value && remoteFiles.value.length === 0) {
        loadRemoteDir();
      }
    });

    /* ── Init / Cleanup ── */
    onMounted(() => {
      window.addEventListener('locale-changed', onLocaleChanged);
      loadSavedConns();
    });

    onUnmounted(() => {
      window.removeEventListener('locale-changed', onLocaleChanged);
      if (sessionId.value) {
        fetch('/api/ssh/disconnect', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ sessionId: sessionId.value }) }).catch(() => {});
      }
    });

    return {
      t, locale, connForm, isConnected, isConnecting, sessionId,
      savedConns, showSavedPanel, saveConn, loadConn, deleteConn, deleteAllConns,
      activeView,
      terminalOutput, currentCommand, commandRunning, commandHistory, cwd,
      executeCommand, onTerminalKeydown, clearTerminal,
      remotePath, remoteFiles, remoteSelected, remoteLoading,
      transferring, transferText, logMessages, showLog,
      connect, disconnect,
      loadRemoteDir, remoteEnter, remoteUp, toggleRemoteSelect, isRemoteSelected,
      sftpDelete, sftpMkdir, sftpRename, sftpChmod, sftpCopy, sftpMove,
      sftpDownload, sftpUpload,
      editorVisible, editorFilePath, editorContent, editorSaving,
      editFile, saveEditorFile, closeEditor,
      remoteSelectionInfo,
      formatSize, fileIcon, addLog
    };
  }
})
