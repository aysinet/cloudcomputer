({
  setup() {
    const { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } = Vue;
    const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success(){}, error(){}, warning(){}, info(){} };
    const ElMessageBox = (window.ElementPlus && window.ElementPlus.ElMessageBox) || { confirm: () => Promise.resolve(), prompt: () => Promise.resolve({ value: '' }) };

    /* ── i18n ── */
    const LANGS = {
      tr: {
        title:'Requestly', send:'Gönder', sending:'Gönderiliyor...', url:'URL girin', method:'Metod',
        params:'Parametreler', headers:'Başlıklar', body:'Gövde', auth:'Yetkilendirme',
        response:'Yanıt', status:'Durum', time:'Süre', size:'Boyut',
        pretty:'Güzel', raw:'Ham', preview:'Önizleme', responseHeaders:'Yanıt Başlıkları',
        collections:'Koleksiyonlar', history:'Geçmiş', newCollection:'Yeni Koleksiyon',
        newFolder:'Yeni Klasör', newRequest:'Yeni İstek', rename:'Yeniden Adlandır',
        delete:'Sil', duplicate:'Çoğalt', save:'Kaydet', saveAs:'Farklı Kaydet',
        importPostman:'Postman İçe Aktar', exportCollection:'Dışa Aktar',
        importSuccess:'Postman koleksiyonu başarıyla içe aktarıldı',
        importError:'Geçersiz Postman koleksiyon dosyası',
        environments:'Ortamlar', noEnv:'Ortam Yok', manageEnvs:'Ortamları Yönet',
        envName:'Ortam Adı', variable:'Değişken', value:'Değer', addVariable:'Değişken Ekle',
        key:'Anahtar', description:'Açıklama', enabled:'Etkin',
        none:'Yok', bearerToken:'Bearer Token', basicAuth:'Basic Auth', apiKey:'API Anahtarı',
        token:'Token', username:'Kullanıcı Adı', password:'Şifre',
        addHeader:'Başlık Ekle', addParam:'Parametre Ekle',
        formData:'Form Data', xWwwForm:'x-www-form-urlencoded', rawBody:'Ham', graphql:'GraphQL',
        binary:'İkili', noBody:'Gövde Yok', contentType:'İçerik Türü',
        deleteConfirm:'Bu öğeyi silmek istediğinize emin misiniz?',
        cancel:'İptal', ok:'Tamam', noResponse:'Henüz bir yanıt yok. Bir istek gönderin.',
        requestName:'İstek Adı', collectionName:'Koleksiyon Adı', folderName:'Klasör Adı',
        clearHistory:'Geçmişi Temizle', searchRequests:'İstek ara...',
        copied:'Kopyalandı', copyResponse:'Yanıtı Kopyala', ms:'ms',
        queryParams:'Sorgu Parametreleri', pathVariables:'Yol Değişkenleri',
        bodyType:'Gövde Türü', beautify:'Güzelleştir',
        noCollections:'Henüz koleksiyon yok', noHistory:'Geçmiş boş',
        importFile:'Dosya Seç', importDrop:'veya dosyayı buraya sürükleyin',
        tabs:'Sekmeler', closeTab:'Sekmeyi Kapat', untitled:'Adsız İstek',
        addEnv:'Ortam Ekle', deleteEnv:'Ortamı Sil', activeEnv:'Aktif Ortam',
        exportAll:'Tümünü Dışa Aktar'
      },
      en: {
        title:'Requestly', send:'Send', sending:'Sending...', url:'Enter URL', method:'Method',
        params:'Params', headers:'Headers', body:'Body', auth:'Auth',
        response:'Response', status:'Status', time:'Time', size:'Size',
        pretty:'Pretty', raw:'Raw', preview:'Preview', responseHeaders:'Response Headers',
        collections:'Collections', history:'History', newCollection:'New Collection',
        newFolder:'New Folder', newRequest:'New Request', rename:'Rename',
        delete:'Delete', duplicate:'Duplicate', save:'Save', saveAs:'Save As',
        importPostman:'Import Postman', exportCollection:'Export',
        importSuccess:'Postman collection imported successfully',
        importError:'Invalid Postman collection file',
        environments:'Environments', noEnv:'No Environment', manageEnvs:'Manage Environments',
        envName:'Environment Name', variable:'Variable', value:'Value', addVariable:'Add Variable',
        key:'Key', description:'Description', enabled:'Enabled',
        none:'None', bearerToken:'Bearer Token', basicAuth:'Basic Auth', apiKey:'API Key',
        token:'Token', username:'Username', password:'Password',
        addHeader:'Add Header', addParam:'Add Param',
        formData:'Form Data', xWwwForm:'x-www-form-urlencoded', rawBody:'Raw', graphql:'GraphQL',
        binary:'Binary', noBody:'No Body', contentType:'Content Type',
        deleteConfirm:'Are you sure you want to delete this item?',
        cancel:'Cancel', ok:'OK', noResponse:'No response yet. Send a request.',
        requestName:'Request Name', collectionName:'Collection Name', folderName:'Folder Name',
        clearHistory:'Clear History', searchRequests:'Search requests...',
        copied:'Copied', copyResponse:'Copy Response', ms:'ms',
        queryParams:'Query Params', pathVariables:'Path Variables',
        bodyType:'Body Type', beautify:'Beautify',
        noCollections:'No collections yet', noHistory:'History is empty',
        importFile:'Choose File', importDrop:'or drag & drop file here',
        tabs:'Tabs', closeTab:'Close Tab', untitled:'Untitled Request',
        addEnv:'Add Environment', deleteEnv:'Delete Environment', activeEnv:'Active Environment',
        exportAll:'Export All'
      },
      de: {
        title:'Requestly', send:'Senden', sending:'Senden...', url:'URL eingeben', method:'Methode',
        params:'Parameter', headers:'Header', body:'Body', auth:'Auth',
        response:'Antwort', status:'Status', time:'Zeit', size:'Größe',
        pretty:'Formatiert', raw:'Roh', preview:'Vorschau', responseHeaders:'Antwort-Header',
        collections:'Sammlungen', history:'Verlauf', newCollection:'Neue Sammlung',
        newFolder:'Neuer Ordner', newRequest:'Neue Anfrage', rename:'Umbenennen',
        delete:'Löschen', duplicate:'Duplizieren', save:'Speichern', saveAs:'Speichern unter',
        importPostman:'Postman importieren', exportCollection:'Exportieren',
        importSuccess:'Postman-Sammlung erfolgreich importiert',
        importError:'Ungültige Postman-Sammlungsdatei',
        environments:'Umgebungen', noEnv:'Keine Umgebung', manageEnvs:'Umgebungen verwalten',
        envName:'Umgebungsname', variable:'Variable', value:'Wert', addVariable:'Variable hinzufügen',
        key:'Schlüssel', description:'Beschreibung', enabled:'Aktiviert',
        none:'Keine', bearerToken:'Bearer Token', basicAuth:'Basic Auth', apiKey:'API-Schlüssel',
        token:'Token', username:'Benutzername', password:'Passwort',
        addHeader:'Header hinzufügen', addParam:'Parameter hinzufügen',
        formData:'Form Data', xWwwForm:'x-www-form-urlencoded', rawBody:'Roh', graphql:'GraphQL',
        binary:'Binär', noBody:'Kein Body', contentType:'Inhaltstyp',
        deleteConfirm:'Möchten Sie dieses Element wirklich löschen?',
        cancel:'Abbrechen', ok:'OK', noResponse:'Noch keine Antwort. Senden Sie eine Anfrage.',
        requestName:'Anfragename', collectionName:'Sammlungsname', folderName:'Ordnername',
        clearHistory:'Verlauf löschen', searchRequests:'Anfragen suchen...',
        copied:'Kopiert', copyResponse:'Antwort kopieren', ms:'ms',
        queryParams:'Abfrageparameter', pathVariables:'Pfadvariablen',
        bodyType:'Body-Typ', beautify:'Formatieren',
        noCollections:'Noch keine Sammlungen', noHistory:'Verlauf ist leer',
        importFile:'Datei wählen', importDrop:'oder Datei hierher ziehen',
        tabs:'Tabs', closeTab:'Tab schließen', untitled:'Unbenannte Anfrage',
        addEnv:'Umgebung hinzufügen', deleteEnv:'Umgebung löschen', activeEnv:'Aktive Umgebung',
        exportAll:'Alle exportieren'
      },
      fr: {
        title:'Requestly', send:'Envoyer', sending:'Envoi...', url:'Entrez l\'URL', method:'Méthode',
        params:'Paramètres', headers:'En-têtes', body:'Corps', auth:'Auth',
        response:'Réponse', status:'Statut', time:'Temps', size:'Taille',
        pretty:'Formaté', raw:'Brut', preview:'Aperçu', responseHeaders:'En-têtes de réponse',
        collections:'Collections', history:'Historique', newCollection:'Nouvelle collection',
        newFolder:'Nouveau dossier', newRequest:'Nouvelle requête', rename:'Renommer',
        delete:'Supprimer', duplicate:'Dupliquer', save:'Enregistrer', saveAs:'Enregistrer sous',
        importPostman:'Importer Postman', exportCollection:'Exporter',
        importSuccess:'Collection Postman importée avec succès',
        importError:'Fichier de collection Postman invalide',
        environments:'Environnements', noEnv:'Aucun environnement', manageEnvs:'Gérer les environnements',
        envName:'Nom de l\'environnement', variable:'Variable', value:'Valeur', addVariable:'Ajouter une variable',
        key:'Clé', description:'Description', enabled:'Activé',
        none:'Aucun', bearerToken:'Bearer Token', basicAuth:'Basic Auth', apiKey:'Clé API',
        token:'Jeton', username:'Nom d\'utilisateur', password:'Mot de passe',
        addHeader:'Ajouter un en-tête', addParam:'Ajouter un paramètre',
        formData:'Form Data', xWwwForm:'x-www-form-urlencoded', rawBody:'Brut', graphql:'GraphQL',
        binary:'Binaire', noBody:'Pas de corps', contentType:'Type de contenu',
        deleteConfirm:'Voulez-vous vraiment supprimer cet élément ?',
        cancel:'Annuler', ok:'OK', noResponse:'Aucune réponse. Envoyez une requête.',
        requestName:'Nom de la requête', collectionName:'Nom de la collection', folderName:'Nom du dossier',
        clearHistory:'Effacer l\'historique', searchRequests:'Rechercher des requêtes...',
        copied:'Copié', copyResponse:'Copier la réponse', ms:'ms',
        queryParams:'Paramètres de requête', pathVariables:'Variables de chemin',
        bodyType:'Type de corps', beautify:'Embellir',
        noCollections:'Aucune collection', noHistory:'L\'historique est vide',
        importFile:'Choisir un fichier', importDrop:'ou glisser-déposer ici',
        tabs:'Onglets', closeTab:'Fermer l\'onglet', untitled:'Requête sans titre',
        addEnv:'Ajouter un environnement', deleteEnv:'Supprimer l\'environnement', activeEnv:'Environnement actif',
        exportAll:'Tout exporter'
      },
      es: {
        title:'Requestly', send:'Enviar', sending:'Enviando...', url:'Ingrese URL', method:'Método',
        params:'Parámetros', headers:'Encabezados', body:'Cuerpo', auth:'Auth',
        response:'Respuesta', status:'Estado', time:'Tiempo', size:'Tamaño',
        pretty:'Formateado', raw:'Sin formato', preview:'Vista previa', responseHeaders:'Encabezados de respuesta',
        collections:'Colecciones', history:'Historial', newCollection:'Nueva colección',
        newFolder:'Nueva carpeta', newRequest:'Nueva solicitud', rename:'Renombrar',
        delete:'Eliminar', duplicate:'Duplicar', save:'Guardar', saveAs:'Guardar como',
        importPostman:'Importar Postman', exportCollection:'Exportar',
        importSuccess:'Colección Postman importada exitosamente',
        importError:'Archivo de colección Postman inválido',
        environments:'Entornos', noEnv:'Sin entorno', manageEnvs:'Gestionar entornos',
        envName:'Nombre del entorno', variable:'Variable', value:'Valor', addVariable:'Agregar variable',
        key:'Clave', description:'Descripción', enabled:'Habilitado',
        none:'Ninguno', bearerToken:'Bearer Token', basicAuth:'Basic Auth', apiKey:'Clave API',
        token:'Token', username:'Usuario', password:'Contraseña',
        addHeader:'Agregar encabezado', addParam:'Agregar parámetro',
        formData:'Form Data', xWwwForm:'x-www-form-urlencoded', rawBody:'Sin formato', graphql:'GraphQL',
        binary:'Binario', noBody:'Sin cuerpo', contentType:'Tipo de contenido',
        deleteConfirm:'¿Está seguro de que desea eliminar este elemento?',
        cancel:'Cancelar', ok:'Aceptar', noResponse:'Sin respuesta. Envíe una solicitud.',
        requestName:'Nombre de solicitud', collectionName:'Nombre de colección', folderName:'Nombre de carpeta',
        clearHistory:'Borrar historial', searchRequests:'Buscar solicitudes...',
        copied:'Copiado', copyResponse:'Copiar respuesta', ms:'ms',
        queryParams:'Parámetros de consulta', pathVariables:'Variables de ruta',
        bodyType:'Tipo de cuerpo', beautify:'Embellecer',
        noCollections:'Aún no hay colecciones', noHistory:'El historial está vacío',
        importFile:'Elegir archivo', importDrop:'o arrastre y suelte aquí',
        tabs:'Pestañas', closeTab:'Cerrar pestaña', untitled:'Solicitud sin título',
        addEnv:'Agregar entorno', deleteEnv:'Eliminar entorno', activeEnv:'Entorno activo',
        exportAll:'Exportar todo'
      },
      ru: {
        title:'Requestly', send:'Отправить', sending:'Отправка...', url:'Введите URL', method:'Метод',
        params:'Параметры', headers:'Заголовки', body:'Тело', auth:'Авторизация',
        response:'Ответ', status:'Статус', time:'Время', size:'Размер',
        pretty:'Форматированный', raw:'Исходный', preview:'Предпросмотр', responseHeaders:'Заголовки ответа',
        collections:'Коллекции', history:'История', newCollection:'Новая коллекция',
        newFolder:'Новая папка', newRequest:'Новый запрос', rename:'Переименовать',
        delete:'Удалить', duplicate:'Дублировать', save:'Сохранить', saveAs:'Сохранить как',
        importPostman:'Импорт Postman', exportCollection:'Экспорт',
        importSuccess:'Коллекция Postman успешно импортирована',
        importError:'Недопустимый файл коллекции Postman',
        environments:'Окружения', noEnv:'Без окружения', manageEnvs:'Управление окружениями',
        envName:'Имя окружения', variable:'Переменная', value:'Значение', addVariable:'Добавить переменную',
        key:'Ключ', description:'Описание', enabled:'Включено',
        none:'Нет', bearerToken:'Bearer Token', basicAuth:'Basic Auth', apiKey:'API-ключ',
        token:'Токен', username:'Имя пользователя', password:'Пароль',
        addHeader:'Добавить заголовок', addParam:'Добавить параметр',
        formData:'Form Data', xWwwForm:'x-www-form-urlencoded', rawBody:'Исходный', graphql:'GraphQL',
        binary:'Двоичный', noBody:'Без тела', contentType:'Тип содержимого',
        deleteConfirm:'Вы уверены, что хотите удалить этот элемент?',
        cancel:'Отмена', ok:'ОК', noResponse:'Ответа пока нет. Отправьте запрос.',
        requestName:'Имя запроса', collectionName:'Имя коллекции', folderName:'Имя папки',
        clearHistory:'Очистить историю', searchRequests:'Искать запросы...',
        copied:'Скопировано', copyResponse:'Копировать ответ', ms:'мс',
        queryParams:'Параметры запроса', pathVariables:'Переменные пути',
        bodyType:'Тип тела', beautify:'Форматировать',
        noCollections:'Коллекций пока нет', noHistory:'История пуста',
        importFile:'Выбрать файл', importDrop:'или перетащите файл сюда',
        tabs:'Вкладки', closeTab:'Закрыть вкладку', untitled:'Без названия',
        addEnv:'Добавить окружение', deleteEnv:'Удалить окружение', activeEnv:'Активное окружение',
        exportAll:'Экспортировать все'
      },
      zh: {
        title:'Requestly', send:'发送', sending:'发送中...', url:'输入URL', method:'方法',
        params:'参数', headers:'请求头', body:'请求体', auth:'认证',
        response:'响应', status:'状态', time:'时间', size:'大小',
        pretty:'格式化', raw:'原始', preview:'预览', responseHeaders:'响应头',
        collections:'集合', history:'历史', newCollection:'新建集合',
        newFolder:'新建文件夹', newRequest:'新建请求', rename:'重命名',
        delete:'删除', duplicate:'复制', save:'保存', saveAs:'另存为',
        importPostman:'导入Postman', exportCollection:'导出',
        importSuccess:'Postman集合导入成功',
        importError:'无效的Postman集合文件',
        environments:'环境', noEnv:'无环境', manageEnvs:'管理环境',
        envName:'环境名称', variable:'变量', value:'值', addVariable:'添加变量',
        key:'键', description:'描述', enabled:'启用',
        none:'无', bearerToken:'Bearer Token', basicAuth:'Basic Auth', apiKey:'API密钥',
        token:'令牌', username:'用户名', password:'密码',
        addHeader:'添加请求头', addParam:'添加参数',
        formData:'表单数据', xWwwForm:'x-www-form-urlencoded', rawBody:'原始', graphql:'GraphQL',
        binary:'二进制', noBody:'无请求体', contentType:'内容类型',
        deleteConfirm:'确定要删除此项吗？',
        cancel:'取消', ok:'确定', noResponse:'暂无响应。请发送请求。',
        requestName:'请求名称', collectionName:'集合名称', folderName:'文件夹名称',
        clearHistory:'清除历史', searchRequests:'搜索请求...',
        copied:'已复制', copyResponse:'复制响应', ms:'毫秒',
        queryParams:'查询参数', pathVariables:'路径变量',
        bodyType:'请求体类型', beautify:'格式化',
        noCollections:'暂无集合', noHistory:'历史为空',
        importFile:'选择文件', importDrop:'或拖拽文件到此处',
        tabs:'标签页', closeTab:'关闭标签', untitled:'未命名请求',
        addEnv:'添加环境', deleteEnv:'删除环境', activeEnv:'当前环境',
        exportAll:'导出全部'
      },
      ja: {
        title:'Requestly', send:'送信', sending:'送信中...', url:'URLを入力', method:'メソッド',
        params:'パラメータ', headers:'ヘッダー', body:'ボディ', auth:'認証',
        response:'レスポンス', status:'ステータス', time:'時間', size:'サイズ',
        pretty:'整形', raw:'生データ', preview:'プレビュー', responseHeaders:'レスポンスヘッダー',
        collections:'コレクション', history:'履歴', newCollection:'新規コレクション',
        newFolder:'新規フォルダ', newRequest:'新規リクエスト', rename:'名前変更',
        delete:'削除', duplicate:'複製', save:'保存', saveAs:'名前を付けて保存',
        importPostman:'Postmanインポート', exportCollection:'エクスポート',
        importSuccess:'Postmanコレクションのインポートに成功しました',
        importError:'無効なPostmanコレクションファイル',
        environments:'環境', noEnv:'環境なし', manageEnvs:'環境管理',
        envName:'環境名', variable:'変数', value:'値', addVariable:'変数追加',
        key:'キー', description:'説明', enabled:'有効',
        none:'なし', bearerToken:'Bearer Token', basicAuth:'Basic Auth', apiKey:'APIキー',
        token:'トークン', username:'ユーザー名', password:'パスワード',
        addHeader:'ヘッダー追加', addParam:'パラメータ追加',
        formData:'フォームデータ', xWwwForm:'x-www-form-urlencoded', rawBody:'生データ', graphql:'GraphQL',
        binary:'バイナリ', noBody:'ボディなし', contentType:'コンテンツタイプ',
        deleteConfirm:'このアイテムを削除してもよろしいですか？',
        cancel:'キャンセル', ok:'OK', noResponse:'レスポンスがありません。リクエストを送信してください。',
        requestName:'リクエスト名', collectionName:'コレクション名', folderName:'フォルダ名',
        clearHistory:'履歴をクリア', searchRequests:'リクエストを検索...',
        copied:'コピーしました', copyResponse:'レスポンスをコピー', ms:'ミリ秒',
        queryParams:'クエリパラメータ', pathVariables:'パス変数',
        bodyType:'ボディタイプ', beautify:'整形',
        noCollections:'コレクションがありません', noHistory:'履歴が空です',
        importFile:'ファイルを選択', importDrop:'またはファイルをここにドラッグ',
        tabs:'タブ', closeTab:'タブを閉じる', untitled:'無題のリクエスト',
        addEnv:'環境追加', deleteEnv:'環境削除', activeEnv:'アクティブ環境',
        exportAll:'すべてエクスポート'
      },
      it: {
        title:'Requestly', send:'Invia', sending:'Invio...', url:'Inserisci URL', method:'Metodo',
        params:'Parametri', headers:'Intestazioni', body:'Corpo', auth:'Auth',
        response:'Risposta', status:'Stato', time:'Tempo', size:'Dimensione',
        pretty:'Formattato', raw:'Grezzo', preview:'Anteprima', responseHeaders:'Intestazioni risposta',
        collections:'Collezioni', history:'Cronologia', newCollection:'Nuova collezione',
        newFolder:'Nuova cartella', newRequest:'Nuova richiesta', rename:'Rinomina',
        delete:'Elimina', duplicate:'Duplica', save:'Salva', saveAs:'Salva come',
        importPostman:'Importa Postman', exportCollection:'Esporta',
        importSuccess:'Collezione Postman importata con successo',
        importError:'File di collezione Postman non valido',
        environments:'Ambienti', noEnv:'Nessun ambiente', manageEnvs:'Gestisci ambienti',
        envName:'Nome ambiente', variable:'Variabile', value:'Valore', addVariable:'Aggiungi variabile',
        key:'Chiave', description:'Descrizione', enabled:'Abilitato',
        none:'Nessuno', bearerToken:'Bearer Token', basicAuth:'Basic Auth', apiKey:'Chiave API',
        token:'Token', username:'Nome utente', password:'Password',
        addHeader:'Aggiungi intestazione', addParam:'Aggiungi parametro',
        formData:'Form Data', xWwwForm:'x-www-form-urlencoded', rawBody:'Grezzo', graphql:'GraphQL',
        binary:'Binario', noBody:'Nessun corpo', contentType:'Tipo di contenuto',
        deleteConfirm:'Sei sicuro di voler eliminare questo elemento?',
        cancel:'Annulla', ok:'OK', noResponse:'Nessuna risposta. Invia una richiesta.',
        requestName:'Nome richiesta', collectionName:'Nome collezione', folderName:'Nome cartella',
        clearHistory:'Cancella cronologia', searchRequests:'Cerca richieste...',
        copied:'Copiato', copyResponse:'Copia risposta', ms:'ms',
        queryParams:'Parametri di query', pathVariables:'Variabili percorso',
        bodyType:'Tipo di corpo', beautify:'Formatta',
        noCollections:'Nessuna collezione', noHistory:'La cronologia è vuota',
        importFile:'Scegli file', importDrop:'o trascina qui',
        tabs:'Schede', closeTab:'Chiudi scheda', untitled:'Richiesta senza titolo',
        addEnv:'Aggiungi ambiente', deleteEnv:'Elimina ambiente', activeEnv:'Ambiente attivo',
        exportAll:'Esporta tutto'
      },
      ar: {
        title:'Requestly', send:'إرسال', sending:'جارٍ الإرسال...', url:'أدخل URL', method:'الطريقة',
        params:'المعاملات', headers:'الرؤوس', body:'الجسم', auth:'المصادقة',
        response:'الاستجابة', status:'الحالة', time:'الوقت', size:'الحجم',
        pretty:'منسق', raw:'خام', preview:'معاينة', responseHeaders:'رؤوس الاستجابة',
        collections:'المجموعات', history:'السجل', newCollection:'مجموعة جديدة',
        newFolder:'مجلد جديد', newRequest:'طلب جديد', rename:'إعادة تسمية',
        delete:'حذف', duplicate:'تكرار', save:'حفظ', saveAs:'حفظ باسم',
        importPostman:'استيراد Postman', exportCollection:'تصدير',
        importSuccess:'تم استيراد مجموعة Postman بنجاح',
        importError:'ملف مجموعة Postman غير صالح',
        environments:'البيئات', noEnv:'بدون بيئة', manageEnvs:'إدارة البيئات',
        envName:'اسم البيئة', variable:'متغير', value:'القيمة', addVariable:'إضافة متغير',
        key:'المفتاح', description:'الوصف', enabled:'مفعل',
        none:'لا شيء', bearerToken:'Bearer Token', basicAuth:'Basic Auth', apiKey:'مفتاح API',
        token:'الرمز', username:'اسم المستخدم', password:'كلمة المرور',
        addHeader:'إضافة رأس', addParam:'إضافة معامل',
        formData:'بيانات النموذج', xWwwForm:'x-www-form-urlencoded', rawBody:'خام', graphql:'GraphQL',
        binary:'ثنائي', noBody:'بدون جسم', contentType:'نوع المحتوى',
        deleteConfirm:'هل أنت متأكد من حذف هذا العنصر؟',
        cancel:'إلغاء', ok:'موافق', noResponse:'لا توجد استجابة. أرسل طلبًا.',
        requestName:'اسم الطلب', collectionName:'اسم المجموعة', folderName:'اسم المجلد',
        clearHistory:'مسح السجل', searchRequests:'البحث عن طلبات...',
        copied:'تم النسخ', copyResponse:'نسخ الاستجابة', ms:'مللي ثانية',
        queryParams:'معاملات الاستعلام', pathVariables:'متغيرات المسار',
        bodyType:'نوع الجسم', beautify:'تنسيق',
        noCollections:'لا توجد مجموعات', noHistory:'السجل فارغ',
        importFile:'اختر ملفًا', importDrop:'أو اسحب الملف هنا',
        tabs:'علامات التبويب', closeTab:'إغلاق التبويب', untitled:'طلب بدون عنوان',
        addEnv:'إضافة بيئة', deleteEnv:'حذف البيئة', activeEnv:'البيئة النشطة',
        exportAll:'تصدير الكل'
      }
    };

    function getLocale() {
      try { return (window.__vueDesktopSettings && window.__vueDesktopSettings.locale) || localStorage.getItem('sys_locale') || 'en'; } catch(e) { return 'en'; }
    }
    const locale = ref(getLocale());
    function t(key) { return (LANGS[locale.value] || LANGS.en)[key] || (LANGS.en[key] || key); }
    function onLocaleChanged(e) { if (e.detail) locale.value = e.detail; }

    /* ── HTTP Methods ── */
    const HTTP_METHODS = ['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS'];
    const METHOD_COLORS = { GET:'#14F195', POST:'#FBBF24', PUT:'#60A5FA', PATCH:'#A78BFA', DELETE:'#F87171', HEAD:'#6EE7B7', OPTIONS:'#FDA4AF' };

    /* ── State ── */
    const sidebarTab = ref('collections');
    const collections = ref([]);
    const history = ref([]);
    const environments = ref([]);
    const activeEnvId = ref(null);
    const searchQuery = ref('');
    const showEnvDialog = ref(false);
    const showImportDialog = ref(false);
    const importDragOver = ref(false);
    const loading = ref(false);
    const saving = ref(false);

    /* ── Tabs (open requests) ── */
    const tabs = ref([]);
    const activeTabId = ref(null);

    function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

    function createDefaultRequest(name) {
      return {
        id: uid(),
        name: name || t('untitled'),
        method: 'GET',
        url: '',
        params: [{ key: '', value: '', description: '', enabled: true }],
        headers: [{ key: '', value: '', description: '', enabled: true }],
        bodyType: 'none',
        bodyRaw: '',
        bodyRawType: 'application/json',
        bodyFormData: [{ key: '', value: '', description: '', enabled: true }],
        bodyUrlEncoded: [{ key: '', value: '', description: '', enabled: true }],
        authType: 'none',
        authBearer: '',
        authBasicUser: '',
        authBasicPass: '',
        authApiKey: '',
        authApiValue: '',
        authApiIn: 'header',
        response: null,
        requestTab: 'params',
        responseTab: 'pretty',
        collectionId: null,
        folderId: null
      };
    }

    const activeTab = computed(() => tabs.value.find(t => t.id === activeTabId.value) || null);

    /* ── Active environment variables ── */
    const activeEnvVars = computed(() => {
      if (!activeEnvId.value) return {};
      const env = environments.value.find(e => e.id === activeEnvId.value);
      if (!env) return {};
      const map = {};
      env.variables.forEach(v => { if (v.enabled && v.key) map[v.key] = v.value; });
      return map;
    });

    function replaceEnvVars(str) {
      if (!str) return str;
      return str.replace(/\{\{(\w+)\}\}/g, (m, key) => activeEnvVars.value[key] !== undefined ? activeEnvVars.value[key] : m);
    }

    /* ── Data persistence ── */
    let saveTimer = null;
    function debouncedSave() {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(saveData, 800);
    }

    async function loadData() {
      try {
        const res = await fetch('/api/requestly/data');
        if (!res.ok) return;
        const data = await res.json();
        if (data.collections) collections.value = data.collections;
        if (data.history) history.value = data.history;
        if (data.environments) environments.value = data.environments;
        if (data.activeEnvId) activeEnvId.value = data.activeEnvId;
      } catch (e) { /* first use */ }
    }

    async function saveData() {
      if (saving.value) return;
      saving.value = true;
      try {
        await fetch('/api/requestly/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collections: collections.value,
            history: history.value.slice(0, 500),
            environments: environments.value,
            activeEnvId: activeEnvId.value
          })
        });
      } catch (e) { /* ignore */ }
      saving.value = false;
    }

    /* ── Tab management ── */
    function openNewTab(req) {
      const r = req || createDefaultRequest();
      tabs.value.push(r);
      activeTabId.value = r.id;
    }

    function closeTab(tabId) {
      const idx = tabs.value.findIndex(t => t.id === tabId);
      if (idx === -1) return;
      tabs.value.splice(idx, 1);
      if (activeTabId.value === tabId) {
        activeTabId.value = tabs.value.length ? tabs.value[Math.min(idx, tabs.value.length - 1)].id : null;
      }
    }

    function openRequestInTab(req) {
      const existing = tabs.value.find(t => t.id === req.id);
      if (existing) { activeTabId.value = existing.id; return; }
      const clone = JSON.parse(JSON.stringify(req));
      if (!clone.params) clone.params = [{ key:'', value:'', description:'', enabled:true }];
      if (!clone.headers) clone.headers = [{ key:'', value:'', description:'', enabled:true }];
      if (!clone.bodyType) clone.bodyType = 'none';
      if (!clone.bodyRaw) clone.bodyRaw = '';
      if (!clone.bodyRawType) clone.bodyRawType = 'application/json';
      if (!clone.bodyFormData) clone.bodyFormData = [{ key:'', value:'', description:'', enabled:true }];
      if (!clone.bodyUrlEncoded) clone.bodyUrlEncoded = [{ key:'', value:'', description:'', enabled:true }];
      if (!clone.authType) clone.authType = 'none';
      if (!clone.requestTab) clone.requestTab = 'params';
      if (!clone.responseTab) clone.responseTab = 'pretty';
      clone.response = null;
      tabs.value.push(clone);
      activeTabId.value = clone.id;
    }

    /* ── Send request ── */
    async function sendRequest() {
      const req = activeTab.value;
      if (!req || !req.url) return;
      loading.value = true;
      req.response = null;

      const url = replaceEnvVars(req.url.trim());
      const method = req.method;

      // Build headers
      const hdrs = {};
      req.headers.forEach(h => {
        if (h.enabled && h.key) hdrs[replaceEnvVars(h.key)] = replaceEnvVars(h.value);
      });

      // Auth
      if (req.authType === 'bearer' && req.authBearer) {
        hdrs['Authorization'] = 'Bearer ' + replaceEnvVars(req.authBearer);
      } else if (req.authType === 'basic') {
        hdrs['Authorization'] = 'Basic ' + btoa(replaceEnvVars(req.authBasicUser) + ':' + replaceEnvVars(req.authBasicPass));
      } else if (req.authType === 'apikey' && req.authApiKey) {
        if (req.authApiIn === 'header') {
          hdrs[replaceEnvVars(req.authApiKey)] = replaceEnvVars(req.authApiValue);
        }
      }

      // Build query params
      const params = {};
      req.params.forEach(p => {
        if (p.enabled && p.key) params[replaceEnvVars(p.key)] = replaceEnvVars(p.value);
      });
      // API key as query param
      if (req.authType === 'apikey' && req.authApiIn === 'query' && req.authApiKey) {
        params[replaceEnvVars(req.authApiKey)] = replaceEnvVars(req.authApiValue);
      }

      // Body
      let body = null;
      if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        if (req.bodyType === 'raw') {
          body = replaceEnvVars(req.bodyRaw);
          if (!hdrs['Content-Type']) hdrs['Content-Type'] = req.bodyRawType || 'application/json';
        } else if (req.bodyType === 'form-data') {
          const fd = new FormData();
          req.bodyFormData.forEach(f => { if (f.enabled && f.key) fd.append(replaceEnvVars(f.key), replaceEnvVars(f.value)); });
          body = fd;
        } else if (req.bodyType === 'x-www-form-urlencoded') {
          const usp = new URLSearchParams();
          req.bodyUrlEncoded.forEach(f => { if (f.enabled && f.key) usp.append(replaceEnvVars(f.key), replaceEnvVars(f.value)); });
          body = usp.toString();
          if (!hdrs['Content-Type']) hdrs['Content-Type'] = 'application/x-www-form-urlencoded';
        }
      }

      try {
        const startTime = performance.now();
        const res = await fetch('/api/requestly/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ method, url, headers: hdrs, params, body, bodyType: req.bodyType })
        });
        const elapsed = Math.round(performance.now() - startTime);
        const result = await res.json();

        req.response = {
          status: result.status || 0,
          statusText: result.statusText || '',
          headers: result.headers || {},
          body: result.body || '',
          time: result.time || elapsed,
          size: result.size || 0
        };

        // Add to history
        history.value.unshift({
          id: uid(),
          method: req.method,
          url: req.url,
          name: req.name,
          status: req.response.status,
          time: req.response.time,
          timestamp: new Date().toISOString()
        });
        if (history.value.length > 500) history.value.length = 500;
        debouncedSave();
      } catch (e) {
        req.response = { status: 0, statusText: 'Network Error', headers: {}, body: e.message, time: 0, size: 0 };
      }
      loading.value = false;
    }

    /* ── Response display ── */
    function prettyBody(resp) {
      if (!resp || !resp.body) return '';
      try {
        const obj = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
        return JSON.stringify(obj, null, 2);
      } catch (e) { return String(resp.body); }
    }

    function formatSize(bytes) {
      if (!bytes) return '0 B';
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / 1048576).toFixed(1) + ' MB';
    }

    function statusClass(code) {
      if (!code) return '';
      if (code >= 200 && code < 300) return 'rq-status-success';
      if (code >= 300 && code < 400) return 'rq-status-redirect';
      if (code >= 400 && code < 500) return 'rq-status-client-err';
      return 'rq-status-server-err';
    }

    function copyResponse() {
      const req = activeTab.value;
      if (!req || !req.response) return;
      navigator.clipboard.writeText(prettyBody(req.response)).then(() => ElMessage.success(t('copied')));
    }

    /* ── Collection management ── */
    function addCollection() {
      const name = t('newCollection') + ' ' + (collections.value.length + 1);
      collections.value.push({ id: uid(), name, items: [], variables: [] });
      debouncedSave();
    }

    function addFolder(collection) {
      collection.items.push({ id: uid(), name: t('newFolder'), type: 'folder', items: [] });
      debouncedSave();
    }

    function addRequestToCollection(parent) {
      const req = createDefaultRequest(t('newRequest'));
      if (Array.isArray(parent.items)) {
        parent.items.push({ ...req, type: 'request' });
      }
      debouncedSave();
    }

    function deleteItem(parent, index) {
      ElMessageBox.confirm(t('deleteConfirm'), t('delete'), { confirmButtonText: t('ok'), cancelButtonText: t('cancel'), type: 'warning' })
        .then(() => { parent.splice(index, 1); debouncedSave(); }).catch(() => {});
    }

    function renameItem(item) {
      ElMessageBox.prompt(t('rename'), { inputValue: item.name, confirmButtonText: t('ok'), cancelButtonText: t('cancel') })
        .then(({ value }) => { if (value) { item.name = value; debouncedSave(); } }).catch(() => {});
    }

    function duplicateRequest(parent, index) {
      const clone = JSON.parse(JSON.stringify(parent[index]));
      clone.id = uid();
      clone.name = clone.name + ' (copy)';
      parent.splice(index + 1, 0, clone);
      debouncedSave();
    }

    /* ── Environment management ── */
    function addEnvironment() {
      environments.value.push({ id: uid(), name: t('envName'), variables: [{ key: '', value: '', enabled: true }] });
      debouncedSave();
    }

    function deleteEnvironment(idx) {
      const env = environments.value[idx];
      if (activeEnvId.value === env.id) activeEnvId.value = null;
      environments.value.splice(idx, 1);
      debouncedSave();
    }

    function addEnvVariable(env) {
      env.variables.push({ key: '', value: '', enabled: true });
    }

    function removeEnvVariable(env, idx) {
      env.variables.splice(idx, 1);
      debouncedSave();
    }

    /* ── Postman Import ── */
    function handleImportFile(event) {
      const file = event.target.files[0];
      if (!file) return;
      readImportFile(file);
    }

    function handleImportDrop(event) {
      event.preventDefault();
      importDragOver.value = false;
      const file = event.dataTransfer.files[0];
      if (!file) return;
      readImportFile(file);
    }

    function readImportFile(file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const json = JSON.parse(e.target.result);
          importPostmanCollection(json);
        } catch (err) {
          ElMessage.error(t('importError'));
        }
      };
      reader.readAsText(file);
    }

    function importPostmanCollection(json) {
      // Support Postman Collection v2.0 and v2.1
      if (!json.info || !json.item) {
        ElMessage.error(t('importError'));
        return;
      }

      function parseItems(items) {
        return (items || []).map(item => {
          if (item.item && Array.isArray(item.item)) {
            // Folder
            return { id: uid(), name: item.name || 'Folder', type: 'folder', items: parseItems(item.item) };
          }
          // Request
          const req = item.request || {};
          const urlObj = req.url || {};
          const rawUrl = typeof urlObj === 'string' ? urlObj : (urlObj.raw || '');
          const headers = (req.header || []).map(h => ({
            key: h.key || '', value: h.value || '', description: h.description || '', enabled: !h.disabled
          }));
          if (!headers.length) headers.push({ key:'', value:'', description:'', enabled:true });

          // Query params
          const params = (urlObj.query || []).map(q => ({
            key: q.key || '', value: q.value || '', description: q.description || '', enabled: !q.disabled
          }));
          if (!params.length) params.push({ key:'', value:'', description:'', enabled:true });

          // Body
          let bodyType = 'none', bodyRaw = '', bodyRawType = 'application/json';
          const bodyFormData = [{ key:'', value:'', description:'', enabled:true }];
          const bodyUrlEncoded = [{ key:'', value:'', description:'', enabled:true }];
          if (req.body) {
            if (req.body.mode === 'raw') {
              bodyType = 'raw';
              bodyRaw = req.body.raw || '';
              if (req.body.options && req.body.options.raw && req.body.options.raw.language === 'json') bodyRawType = 'application/json';
              else if (req.body.options && req.body.options.raw && req.body.options.raw.language === 'xml') bodyRawType = 'application/xml';
              else if (req.body.options && req.body.options.raw && req.body.options.raw.language === 'text') bodyRawType = 'text/plain';
            } else if (req.body.mode === 'formdata') {
              bodyType = 'form-data';
              const fd = (req.body.formdata || []).map(f => ({
                key: f.key || '', value: f.value || '', description: f.description || '', enabled: !f.disabled
              }));
              if (fd.length) bodyFormData.splice(0, bodyFormData.length, ...fd);
            } else if (req.body.mode === 'urlencoded') {
              bodyType = 'x-www-form-urlencoded';
              const ue = (req.body.urlencoded || []).map(f => ({
                key: f.key || '', value: f.value || '', description: f.description || '', enabled: !f.disabled
              }));
              if (ue.length) bodyUrlEncoded.splice(0, bodyUrlEncoded.length, ...ue);
            }
          }

          // Auth
          let authType = 'none', authBearer = '', authBasicUser = '', authBasicPass = '';
          if (req.auth) {
            if (req.auth.type === 'bearer') {
              authType = 'bearer';
              const bArr = req.auth.bearer || [];
              authBearer = (bArr.find(b => b.key === 'token') || {}).value || '';
            } else if (req.auth.type === 'basic') {
              authType = 'basic';
              const bArr = req.auth.basic || [];
              authBasicUser = (bArr.find(b => b.key === 'username') || {}).value || '';
              authBasicPass = (bArr.find(b => b.key === 'password') || {}).value || '';
            }
          }

          return {
            id: uid(), name: item.name || 'Request', type: 'request',
            method: req.method || 'GET', url: rawUrl, headers, params,
            bodyType, bodyRaw, bodyRawType, bodyFormData, bodyUrlEncoded,
            authType, authBearer, authBasicUser, authBasicPass,
            authApiKey: '', authApiValue: '', authApiIn: 'header',
            requestTab: 'params', responseTab: 'pretty', response: null
          };
        });
      }

      const col = {
        id: uid(),
        name: json.info.name || 'Imported Collection',
        items: parseItems(json.item),
        variables: (json.variable || []).map(v => ({ key: v.key || '', value: v.value || '', enabled: true }))
      };
      collections.value.push(col);
      showImportDialog.value = false;
      debouncedSave();
      ElMessage.success(t('importSuccess'));
    }

    /* ── Export collection ── */
    function exportCollection(col) {
      function buildItems(items) {
        return items.map(item => {
          if (item.type === 'folder') {
            return { name: item.name, item: buildItems(item.items || []) };
          }
          const req = {
            method: item.method || 'GET',
            header: (item.headers || []).filter(h => h.key).map(h => ({
              key: h.key, value: h.value, description: h.description, disabled: !h.enabled
            })),
            url: {
              raw: item.url || '',
              query: (item.params || []).filter(p => p.key).map(p => ({
                key: p.key, value: p.value, description: p.description, disabled: !p.enabled
              }))
            }
          };
          if (item.bodyType === 'raw') {
            req.body = { mode: 'raw', raw: item.bodyRaw || '', options: { raw: { language: item.bodyRawType === 'application/json' ? 'json' : 'text' } } };
          } else if (item.bodyType === 'form-data') {
            req.body = { mode: 'formdata', formdata: (item.bodyFormData || []).filter(f => f.key).map(f => ({ key: f.key, value: f.value, description: f.description, disabled: !f.enabled })) };
          } else if (item.bodyType === 'x-www-form-urlencoded') {
            req.body = { mode: 'urlencoded', urlencoded: (item.bodyUrlEncoded || []).filter(f => f.key).map(f => ({ key: f.key, value: f.value, description: f.description, disabled: !f.enabled })) };
          }
          if (item.authType === 'bearer') req.auth = { type: 'bearer', bearer: [{ key: 'token', value: item.authBearer, type: 'string' }] };
          else if (item.authType === 'basic') req.auth = { type: 'basic', basic: [{ key: 'username', value: item.authBasicUser, type: 'string' }, { key: 'password', value: item.authBasicPass, type: 'string' }] };
          return { name: item.name, request: req };
        });
      }

      const postmanJson = {
        info: {
          name: col.name,
          schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        item: buildItems(col.items || []),
        variable: (col.variables || []).map(v => ({ key: v.key, value: v.value }))
      };

      const blob = new Blob([JSON.stringify(postmanJson, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = col.name.replace(/[^a-zA-Z0-9_-]/g, '_') + '.postman_collection.json';
      a.click();
      URL.revokeObjectURL(a.href);
    }

    /* ── Key-Value helpers ── */
    function addRow(arr) {
      arr.push({ key: '', value: '', description: '', enabled: true });
    }

    function removeRow(arr, idx) {
      arr.splice(idx, 1);
      if (!arr.length) arr.push({ key: '', value: '', description: '', enabled: true });
    }

    /* ── Beautify raw body ── */
    function beautifyBody() {
      const req = activeTab.value;
      if (!req || req.bodyType !== 'raw') return;
      try {
        const obj = JSON.parse(req.bodyRaw);
        req.bodyRaw = JSON.stringify(obj, null, 2);
      } catch (e) { /* not json */ }
    }

    /* ── History ── */
    function clearHistory() {
      history.value = [];
      debouncedSave();
    }

    function openFromHistory(item) {
      const req = createDefaultRequest(item.name || item.url);
      req.method = item.method;
      req.url = item.url;
      openNewTab(req);
    }

    /* ── Filtered sidebar items ── */
    const filteredCollections = computed(() => {
      if (!searchQuery.value) return collections.value;
      const q = searchQuery.value.toLowerCase();
      return collections.value.filter(c => {
        if (c.name.toLowerCase().includes(q)) return true;
        return (c.items || []).some(function findInItems(item) {
          if (item.name && item.name.toLowerCase().includes(q)) return true;
          if (item.items) return item.items.some(findInItems);
          return false;
        });
      });
    });

    const filteredHistory = computed(() => {
      if (!searchQuery.value) return history.value;
      const q = searchQuery.value.toLowerCase();
      return history.value.filter(h => (h.url && h.url.toLowerCase().includes(q)) || (h.name && h.name.toLowerCase().includes(q)));
    });

    /* ── Lifecycle ── */
    onMounted(() => {
      window.addEventListener('locale-changed', onLocaleChanged);
      loadData().then(() => {
        if (!tabs.value.length) openNewTab();
      });
    });

    onUnmounted(() => {
      window.removeEventListener('locale-changed', onLocaleChanged);
      if (saveTimer) { clearTimeout(saveTimer); saveData(); }
    });

    return {
      t, locale, HTTP_METHODS, METHOD_COLORS,
      sidebarTab, collections, history, environments, activeEnvId, searchQuery,
      showEnvDialog, showImportDialog, importDragOver, loading, saving,
      tabs, activeTabId, activeTab, activeEnvVars,
      filteredCollections, filteredHistory,
      openNewTab, closeTab, openRequestInTab, sendRequest,
      prettyBody, formatSize, statusClass, copyResponse,
      addCollection, addFolder, addRequestToCollection, deleteItem, renameItem, duplicateRequest,
      addEnvironment, deleteEnvironment, addEnvVariable, removeEnvVariable,
      handleImportFile, handleImportDrop, importPostmanCollection, exportCollection,
      addRow, removeRow, beautifyBody, clearHistory, openFromHistory,
      readImportFile
    };
  }
})
