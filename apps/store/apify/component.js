({
  setup() {
    const { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } = Vue;
    const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success(){}, error(){}, warning(){}, info(){} };
    const ElMessageBox = (window.ElementPlus && window.ElementPlus.ElMessageBox) || { confirm: () => Promise.resolve(), prompt: () => Promise.resolve({ value: '' }) };

    // ── i18n ──
    const LANGS = {
      tr: {
        title:'Apify',
        store:'Mağaza', myActors:'Aktörlerim', runs:'Çalıştırmalar', datasets:'Veri Setleri',
        kvStores:'KV Depoları', schedules:'Zamanlamalar', tasks:'Görevler', settings:'Ayarlar', account:'Hesap',
        apiKey:'API Anahtarı', saveKey:'Kaydet', deleteKey:'Sil', enterApiKey:'API anahtarınızı girin',
        noKey:'API anahtarı yapılandırılmamış. Lütfen Ayarlar\'dan ekleyin.',
        keySaved:'API anahtarı kaydedildi', keyDeleted:'API anahtarı silindi',
        search:'Ara...', run:'Çalıştır', stop:'Durdur', abort:'İptal Et', resurrect:'Yeniden Canlandır',
        viewLog:'Log Görüntüle', viewData:'Veriyi Görüntüle', refresh:'Yenile',
        loading:'Yükleniyor...', noData:'Veri yok', noResults:'Sonuç bulunamadı',
        name:'Ad', status:'Durum', started:'Başlangıç', finished:'Bitiş', items:'Öğe',
        memory:'Bellek', duration:'Süre', actorId:'Aktör ID', runId:'Çalıştırma ID',
        input:'Girdi', output:'Çıktı', log:'Log', close:'Kapat', cancel:'İptal',
        confirm:'Onayla', delete:'Sil', create:'Oluştur', save:'Kaydet',
        running:'Çalışıyor', succeeded:'Başarılı', failed:'Başarısız', aborted:'İptal Edildi',
        ready:'Hazır', timeout:'Zaman Aşımı',
        runActor:'Aktörü Çalıştır', inputJson:'Girdi JSON', memoryMb:'Bellek (MB)',
        timeoutSecs:'Zaman Aşımı (sn)', build:'Build Etiketi',
        datasetItems:'Veri Seti Öğeleri', kvKeys:'Depo Anahtarları', kvValue:'Değer',
        totalItems:'Toplam öğe', createdAt:'Oluşturulma', modifiedAt:'Değiştirilme',
        username:'Kullanıcı Adı', email:'E-posta', plan:'Plan',
        usageUsd:'Kullanım ($)', proxy:'Proxy',
        confirmDelete:'Bu öğeyi silmek istediğinize emin misiniz?',
        runStarted:'Çalıştırma başlatıldı', runAborted:'Çalıştırma iptal edildi',
        back:'Geri', next:'İleri', prev:'Önceki', page:'Sayfa',
        description:'Açıklama', category:'Kategori', author:'Yazar',
        defaultDataset:'Varsayılan Veri Seti', defaultKvStore:'Varsayılan KV Deposu',
        cronExpression:'Cron İfadesi', isEnabled:'Aktif', actions:'Eylemler',
        actorName:'Aktör Adı', taskName:'Görev Adı', schedName:'Zamanlama Adı',
        exportJson:'JSON Dışa Aktar', exportCsv:'CSV Dışa Aktar',
        copied:'Panoya kopyalandı'
      },
      en: {
        title:'Apify',
        store:'Store', myActors:'My Actors', runs:'Runs', datasets:'Datasets',
        kvStores:'KV Stores', schedules:'Schedules', tasks:'Tasks', settings:'Settings', account:'Account',
        apiKey:'API Key', saveKey:'Save', deleteKey:'Delete', enterApiKey:'Enter your API key',
        noKey:'API key not configured. Please add it in Settings.',
        keySaved:'API key saved', keyDeleted:'API key deleted',
        search:'Search...', run:'Run', stop:'Stop', abort:'Abort', resurrect:'Resurrect',
        viewLog:'View Log', viewData:'View Data', refresh:'Refresh',
        loading:'Loading...', noData:'No data', noResults:'No results found',
        name:'Name', status:'Status', started:'Started', finished:'Finished', items:'Items',
        memory:'Memory', duration:'Duration', actorId:'Actor ID', runId:'Run ID',
        input:'Input', output:'Output', log:'Log', close:'Close', cancel:'Cancel',
        confirm:'Confirm', delete:'Delete', create:'Create', save:'Save',
        running:'Running', succeeded:'Succeeded', failed:'Failed', aborted:'Aborted',
        ready:'Ready', timeout:'Timeout',
        runActor:'Run Actor', inputJson:'Input JSON', memoryMb:'Memory (MB)',
        timeoutSecs:'Timeout (sec)', build:'Build Tag',
        datasetItems:'Dataset Items', kvKeys:'Store Keys', kvValue:'Value',
        totalItems:'Total items', createdAt:'Created', modifiedAt:'Modified',
        username:'Username', email:'Email', plan:'Plan',
        usageUsd:'Usage ($)', proxy:'Proxy',
        confirmDelete:'Are you sure you want to delete this item?',
        runStarted:'Run started', runAborted:'Run aborted',
        back:'Back', next:'Next', prev:'Previous', page:'Page',
        description:'Description', category:'Category', author:'Author',
        defaultDataset:'Default Dataset', defaultKvStore:'Default KV Store',
        cronExpression:'Cron Expression', isEnabled:'Enabled', actions:'Actions',
        actorName:'Actor Name', taskName:'Task Name', schedName:'Schedule Name',
        exportJson:'Export JSON', exportCsv:'Export CSV',
        copied:'Copied to clipboard'
      },
      de: {
        title:'Apify',
        store:'Store', myActors:'Meine Akteure', runs:'Ausführungen', datasets:'Datensätze',
        kvStores:'KV-Speicher', schedules:'Zeitpläne', tasks:'Aufgaben', settings:'Einstellungen', account:'Konto',
        apiKey:'API-Schlüssel', saveKey:'Speichern', deleteKey:'Löschen', enterApiKey:'API-Schlüssel eingeben',
        noKey:'API-Schlüssel nicht konfiguriert. Bitte in Einstellungen hinzufügen.',
        keySaved:'API-Schlüssel gespeichert', keyDeleted:'API-Schlüssel gelöscht',
        search:'Suchen...', run:'Ausführen', stop:'Stopp', abort:'Abbrechen', resurrect:'Wiederherstellen',
        viewLog:'Log anzeigen', viewData:'Daten anzeigen', refresh:'Aktualisieren',
        loading:'Laden...', noData:'Keine Daten', noResults:'Keine Ergebnisse',
        name:'Name', status:'Status', started:'Gestartet', finished:'Beendet', items:'Einträge',
        memory:'Speicher', duration:'Dauer', actorId:'Akteur-ID', runId:'Ausführungs-ID',
        input:'Eingabe', output:'Ausgabe', log:'Log', close:'Schließen', cancel:'Abbrechen',
        confirm:'Bestätigen', delete:'Löschen', create:'Erstellen', save:'Speichern',
        running:'Läuft', succeeded:'Erfolgreich', failed:'Fehlgeschlagen', aborted:'Abgebrochen',
        ready:'Bereit', timeout:'Zeitüberschreitung',
        runActor:'Akteur ausführen', inputJson:'Eingabe-JSON', memoryMb:'Speicher (MB)',
        timeoutSecs:'Timeout (Sek.)', build:'Build-Tag',
        datasetItems:'Datensatz-Einträge', kvKeys:'Speicher-Schlüssel', kvValue:'Wert',
        totalItems:'Einträge gesamt', createdAt:'Erstellt', modifiedAt:'Geändert',
        username:'Benutzername', email:'E-Mail', plan:'Plan',
        usageUsd:'Verbrauch ($)', proxy:'Proxy',
        confirmDelete:'Möchten Sie dieses Element wirklich löschen?',
        runStarted:'Ausführung gestartet', runAborted:'Ausführung abgebrochen',
        back:'Zurück', next:'Weiter', prev:'Vorherige', page:'Seite',
        description:'Beschreibung', category:'Kategorie', author:'Autor',
        defaultDataset:'Standard-Datensatz', defaultKvStore:'Standard-KV-Speicher',
        cronExpression:'Cron-Ausdruck', isEnabled:'Aktiviert', actions:'Aktionen',
        actorName:'Akteurname', taskName:'Aufgabenname', schedName:'Zeitplanname',
        exportJson:'JSON exportieren', exportCsv:'CSV exportieren',
        copied:'In Zwischenablage kopiert'
      },
      fr: {
        title:'Apify',
        store:'Magasin', myActors:'Mes Acteurs', runs:'Exécutions', datasets:'Jeux de données',
        kvStores:'Magasins KV', schedules:'Planifications', tasks:'Tâches', settings:'Paramètres', account:'Compte',
        apiKey:'Clé API', saveKey:'Enregistrer', deleteKey:'Supprimer', enterApiKey:'Entrez votre clé API',
        noKey:'Clé API non configurée. Veuillez l\'ajouter dans Paramètres.',
        keySaved:'Clé API enregistrée', keyDeleted:'Clé API supprimée',
        search:'Rechercher...', run:'Exécuter', stop:'Arrêter', abort:'Annuler', resurrect:'Ressusciter',
        viewLog:'Voir le log', viewData:'Voir les données', refresh:'Actualiser',
        loading:'Chargement...', noData:'Aucune donnée', noResults:'Aucun résultat',
        name:'Nom', status:'Statut', started:'Démarré', finished:'Terminé', items:'Éléments',
        memory:'Mémoire', duration:'Durée', actorId:'ID acteur', runId:'ID exécution',
        input:'Entrée', output:'Sortie', log:'Log', close:'Fermer', cancel:'Annuler',
        confirm:'Confirmer', delete:'Supprimer', create:'Créer', save:'Enregistrer',
        running:'En cours', succeeded:'Réussi', failed:'Échoué', aborted:'Annulé',
        ready:'Prêt', timeout:'Délai dépassé',
        runActor:'Exécuter l\'acteur', inputJson:'JSON d\'entrée', memoryMb:'Mémoire (Mo)',
        timeoutSecs:'Délai (sec)', build:'Tag de build',
        datasetItems:'Éléments du jeu de données', kvKeys:'Clés du magasin', kvValue:'Valeur',
        totalItems:'Total éléments', createdAt:'Créé', modifiedAt:'Modifié',
        username:'Nom d\'utilisateur', email:'E-mail', plan:'Forfait',
        usageUsd:'Utilisation ($)', proxy:'Proxy',
        confirmDelete:'Êtes-vous sûr de vouloir supprimer cet élément ?',
        runStarted:'Exécution démarrée', runAborted:'Exécution annulée',
        back:'Retour', next:'Suivant', prev:'Précédent', page:'Page',
        description:'Description', category:'Catégorie', author:'Auteur',
        defaultDataset:'Jeu de données par défaut', defaultKvStore:'Magasin KV par défaut',
        cronExpression:'Expression Cron', isEnabled:'Activé', actions:'Actions',
        actorName:'Nom de l\'acteur', taskName:'Nom de la tâche', schedName:'Nom de la planification',
        exportJson:'Exporter JSON', exportCsv:'Exporter CSV',
        copied:'Copié dans le presse-papiers'
      },
      es: {
        title:'Apify',
        store:'Tienda', myActors:'Mis Actores', runs:'Ejecuciones', datasets:'Conjuntos de Datos',
        kvStores:'Almacenes KV', schedules:'Programaciones', tasks:'Tareas', settings:'Ajustes', account:'Cuenta',
        apiKey:'Clave API', saveKey:'Guardar', deleteKey:'Eliminar', enterApiKey:'Ingrese su clave API',
        noKey:'Clave API no configurada. Por favor agréguela en Ajustes.',
        keySaved:'Clave API guardada', keyDeleted:'Clave API eliminada',
        search:'Buscar...', run:'Ejecutar', stop:'Detener', abort:'Abortar', resurrect:'Resucitar',
        viewLog:'Ver Log', viewData:'Ver Datos', refresh:'Actualizar',
        loading:'Cargando...', noData:'Sin datos', noResults:'Sin resultados',
        name:'Nombre', status:'Estado', started:'Iniciado', finished:'Finalizado', items:'Elementos',
        memory:'Memoria', duration:'Duración', actorId:'ID Actor', runId:'ID Ejecución',
        input:'Entrada', output:'Salida', log:'Log', close:'Cerrar', cancel:'Cancelar',
        confirm:'Confirmar', delete:'Eliminar', create:'Crear', save:'Guardar',
        running:'Ejecutando', succeeded:'Exitoso', failed:'Fallido', aborted:'Abortado',
        ready:'Listo', timeout:'Tiempo agotado',
        runActor:'Ejecutar Actor', inputJson:'JSON de Entrada', memoryMb:'Memoria (MB)',
        timeoutSecs:'Timeout (seg)', build:'Tag de Build',
        datasetItems:'Elementos del Dataset', kvKeys:'Claves del Almacén', kvValue:'Valor',
        totalItems:'Total elementos', createdAt:'Creado', modifiedAt:'Modificado',
        username:'Usuario', email:'Correo', plan:'Plan',
        usageUsd:'Uso ($)', proxy:'Proxy',
        confirmDelete:'¿Está seguro de que desea eliminar este elemento?',
        runStarted:'Ejecución iniciada', runAborted:'Ejecución abortada',
        back:'Atrás', next:'Siguiente', prev:'Anterior', page:'Página',
        description:'Descripción', category:'Categoría', author:'Autor',
        defaultDataset:'Dataset por defecto', defaultKvStore:'Almacén KV por defecto',
        cronExpression:'Expresión Cron', isEnabled:'Habilitado', actions:'Acciones',
        actorName:'Nombre del Actor', taskName:'Nombre de Tarea', schedName:'Nombre de Programación',
        exportJson:'Exportar JSON', exportCsv:'Exportar CSV',
        copied:'Copiado al portapapeles'
      },
      ru: {
        title:'Apify',
        store:'Магазин', myActors:'Мои актёры', runs:'Запуски', datasets:'Наборы данных',
        kvStores:'KV-хранилища', schedules:'Расписания', tasks:'Задачи', settings:'Настройки', account:'Аккаунт',
        apiKey:'API ключ', saveKey:'Сохранить', deleteKey:'Удалить', enterApiKey:'Введите ваш API ключ',
        noKey:'API ключ не настроен. Добавьте его в Настройках.',
        keySaved:'API ключ сохранён', keyDeleted:'API ключ удалён',
        search:'Поиск...', run:'Запустить', stop:'Остановить', abort:'Прервать', resurrect:'Воскресить',
        viewLog:'Просмотр лога', viewData:'Просмотр данных', refresh:'Обновить',
        loading:'Загрузка...', noData:'Нет данных', noResults:'Результатов не найдено',
        name:'Имя', status:'Статус', started:'Начало', finished:'Конец', items:'Элементы',
        memory:'Память', duration:'Длительность', actorId:'ID актёра', runId:'ID запуска',
        input:'Ввод', output:'Вывод', log:'Лог', close:'Закрыть', cancel:'Отмена',
        confirm:'Подтвердить', delete:'Удалить', create:'Создать', save:'Сохранить',
        running:'Выполняется', succeeded:'Успешно', failed:'Ошибка', aborted:'Прервано',
        ready:'Готов', timeout:'Тайм-аут',
        runActor:'Запустить актёра', inputJson:'JSON ввод', memoryMb:'Память (МБ)',
        timeoutSecs:'Тайм-аут (сек)', build:'Тег сборки',
        datasetItems:'Элементы набора данных', kvKeys:'Ключи хранилища', kvValue:'Значение',
        totalItems:'Всего элементов', createdAt:'Создано', modifiedAt:'Изменено',
        username:'Имя пользователя', email:'Email', plan:'Тариф',
        usageUsd:'Расходы ($)', proxy:'Прокси',
        confirmDelete:'Вы уверены, что хотите удалить этот элемент?',
        runStarted:'Запуск начат', runAborted:'Запуск прерван',
        back:'Назад', next:'Далее', prev:'Предыдущий', page:'Страница',
        description:'Описание', category:'Категория', author:'Автор',
        defaultDataset:'Набор данных по умолчанию', defaultKvStore:'KV-хранилище по умолчанию',
        cronExpression:'Cron выражение', isEnabled:'Активно', actions:'Действия',
        actorName:'Имя актёра', taskName:'Имя задачи', schedName:'Имя расписания',
        exportJson:'Экспорт JSON', exportCsv:'Экспорт CSV',
        copied:'Скопировано в буфер'
      },
      zh: {
        title:'Apify',
        store:'商店', myActors:'我的Actor', runs:'运行记录', datasets:'数据集',
        kvStores:'KV存储', schedules:'定时任务', tasks:'任务', settings:'设置', account:'账户',
        apiKey:'API密钥', saveKey:'保存', deleteKey:'删除', enterApiKey:'请输入您的API密钥',
        noKey:'API密钥未配置，请在设置中添加。',
        keySaved:'API密钥已保存', keyDeleted:'API密钥已删除',
        search:'搜索...', run:'运行', stop:'停止', abort:'中止', resurrect:'恢复',
        viewLog:'查看日志', viewData:'查看数据', refresh:'刷新',
        loading:'加载中...', noData:'暂无数据', noResults:'未找到结果',
        name:'名称', status:'状态', started:'开始时间', finished:'结束时间', items:'条目',
        memory:'内存', duration:'时长', actorId:'Actor ID', runId:'运行ID',
        input:'输入', output:'输出', log:'日志', close:'关闭', cancel:'取消',
        confirm:'确认', delete:'删除', create:'创建', save:'保存',
        running:'运行中', succeeded:'成功', failed:'失败', aborted:'已中止',
        ready:'就绪', timeout:'超时',
        runActor:'运行Actor', inputJson:'输入JSON', memoryMb:'内存(MB)',
        timeoutSecs:'超时(秒)', build:'构建标签',
        datasetItems:'数据集条目', kvKeys:'存储键', kvValue:'值',
        totalItems:'总条目', createdAt:'创建时间', modifiedAt:'修改时间',
        username:'用户名', email:'邮箱', plan:'套餐',
        usageUsd:'费用($)', proxy:'代理',
        confirmDelete:'确定要删除此项吗？',
        runStarted:'运行已启动', runAborted:'运行已中止',
        back:'返回', next:'下一页', prev:'上一页', page:'页',
        description:'描述', category:'分类', author:'作者',
        defaultDataset:'默认数据集', defaultKvStore:'默认KV存储',
        cronExpression:'Cron表达式', isEnabled:'已启用', actions:'操作',
        actorName:'Actor名称', taskName:'任务名称', schedName:'定时名称',
        exportJson:'导出JSON', exportCsv:'导出CSV',
        copied:'已复制到剪贴板'
      },
      ja: {
        title:'Apify',
        store:'ストア', myActors:'マイアクター', runs:'実行履歴', datasets:'データセット',
        kvStores:'KVストア', schedules:'スケジュール', tasks:'タスク', settings:'設定', account:'アカウント',
        apiKey:'APIキー', saveKey:'保存', deleteKey:'削除', enterApiKey:'APIキーを入力',
        noKey:'APIキーが設定されていません。設定で追加してください。',
        keySaved:'APIキーを保存しました', keyDeleted:'APIキーを削除しました',
        search:'検索...', run:'実行', stop:'停止', abort:'中止', resurrect:'復活',
        viewLog:'ログ表示', viewData:'データ表示', refresh:'更新',
        loading:'読み込み中...', noData:'データなし', noResults:'結果なし',
        name:'名前', status:'ステータス', started:'開始', finished:'終了', items:'アイテム',
        memory:'メモリ', duration:'時間', actorId:'アクターID', runId:'実行ID',
        input:'入力', output:'出力', log:'ログ', close:'閉じる', cancel:'キャンセル',
        confirm:'確認', delete:'削除', create:'作成', save:'保存',
        running:'実行中', succeeded:'成功', failed:'失敗', aborted:'中止済み',
        ready:'準備完了', timeout:'タイムアウト',
        runActor:'アクター実行', inputJson:'入力JSON', memoryMb:'メモリ(MB)',
        timeoutSecs:'タイムアウト(秒)', build:'ビルドタグ',
        datasetItems:'データセットアイテム', kvKeys:'ストアキー', kvValue:'値',
        totalItems:'合計アイテム', createdAt:'作成日', modifiedAt:'更新日',
        username:'ユーザー名', email:'メール', plan:'プラン',
        usageUsd:'使用料($)', proxy:'プロキシ',
        confirmDelete:'この項目を削除しますか？',
        runStarted:'実行を開始しました', runAborted:'実行を中止しました',
        back:'戻る', next:'次へ', prev:'前へ', page:'ページ',
        description:'説明', category:'カテゴリ', author:'作者',
        defaultDataset:'デフォルトデータセット', defaultKvStore:'デフォルトKVストア',
        cronExpression:'Cron式', isEnabled:'有効', actions:'アクション',
        actorName:'アクター名', taskName:'タスク名', schedName:'スケジュール名',
        exportJson:'JSON出力', exportCsv:'CSV出力',
        copied:'クリップボードにコピーしました'
      },
      it: {
        title:'Apify',
        store:'Store', myActors:'I miei Attori', runs:'Esecuzioni', datasets:'Dataset',
        kvStores:'Archivi KV', schedules:'Pianificazioni', tasks:'Attività', settings:'Impostazioni', account:'Account',
        apiKey:'Chiave API', saveKey:'Salva', deleteKey:'Elimina', enterApiKey:'Inserisci la tua chiave API',
        noKey:'Chiave API non configurata. Aggiungila nelle Impostazioni.',
        keySaved:'Chiave API salvata', keyDeleted:'Chiave API eliminata',
        search:'Cerca...', run:'Esegui', stop:'Ferma', abort:'Interrompi', resurrect:'Ripristina',
        viewLog:'Vedi Log', viewData:'Vedi Dati', refresh:'Aggiorna',
        loading:'Caricamento...', noData:'Nessun dato', noResults:'Nessun risultato',
        name:'Nome', status:'Stato', started:'Avviato', finished:'Terminato', items:'Elementi',
        memory:'Memoria', duration:'Durata', actorId:'ID Attore', runId:'ID Esecuzione',
        input:'Input', output:'Output', log:'Log', close:'Chiudi', cancel:'Annulla',
        confirm:'Conferma', delete:'Elimina', create:'Crea', save:'Salva',
        running:'In esecuzione', succeeded:'Riuscito', failed:'Fallito', aborted:'Interrotto',
        ready:'Pronto', timeout:'Timeout',
        runActor:'Esegui Attore', inputJson:'JSON Input', memoryMb:'Memoria (MB)',
        timeoutSecs:'Timeout (sec)', build:'Tag Build',
        datasetItems:'Elementi Dataset', kvKeys:'Chiavi Archivio', kvValue:'Valore',
        totalItems:'Totale elementi', createdAt:'Creato', modifiedAt:'Modificato',
        username:'Nome utente', email:'Email', plan:'Piano',
        usageUsd:'Utilizzo ($)', proxy:'Proxy',
        confirmDelete:'Sei sicuro di voler eliminare questo elemento?',
        runStarted:'Esecuzione avviata', runAborted:'Esecuzione interrotta',
        back:'Indietro', next:'Avanti', prev:'Precedente', page:'Pagina',
        description:'Descrizione', category:'Categoria', author:'Autore',
        defaultDataset:'Dataset predefinito', defaultKvStore:'Archivio KV predefinito',
        cronExpression:'Espressione Cron', isEnabled:'Abilitato', actions:'Azioni',
        actorName:'Nome Attore', taskName:'Nome Attività', schedName:'Nome Pianificazione',
        exportJson:'Esporta JSON', exportCsv:'Esporta CSV',
        copied:'Copiato negli appunti'
      },
      ar: {
        title:'Apify',
        store:'المتجر', myActors:'ممثلوي', runs:'عمليات التشغيل', datasets:'مجموعات البيانات',
        kvStores:'مخازن KV', schedules:'الجداول', tasks:'المهام', settings:'الإعدادات', account:'الحساب',
        apiKey:'مفتاح API', saveKey:'حفظ', deleteKey:'حذف', enterApiKey:'أدخل مفتاح API الخاص بك',
        noKey:'مفتاح API غير مهيأ. يرجى إضافته في الإعدادات.',
        keySaved:'تم حفظ مفتاح API', keyDeleted:'تم حذف مفتاح API',
        search:'بحث...', run:'تشغيل', stop:'إيقاف', abort:'إلغاء', resurrect:'استعادة',
        viewLog:'عرض السجل', viewData:'عرض البيانات', refresh:'تحديث',
        loading:'جاري التحميل...', noData:'لا توجد بيانات', noResults:'لا توجد نتائج',
        name:'الاسم', status:'الحالة', started:'البدء', finished:'الانتهاء', items:'العناصر',
        memory:'الذاكرة', duration:'المدة', actorId:'معرف الممثل', runId:'معرف التشغيل',
        input:'الإدخال', output:'الإخراج', log:'السجل', close:'إغلاق', cancel:'إلغاء',
        confirm:'تأكيد', delete:'حذف', create:'إنشاء', save:'حفظ',
        running:'قيد التشغيل', succeeded:'نجح', failed:'فشل', aborted:'ملغى',
        ready:'جاهز', timeout:'انتهت المهلة',
        runActor:'تشغيل الممثل', inputJson:'JSON إدخال', memoryMb:'الذاكرة (MB)',
        timeoutSecs:'المهلة (ثانية)', build:'علامة البناء',
        datasetItems:'عناصر مجموعة البيانات', kvKeys:'مفاتيح المخزن', kvValue:'القيمة',
        totalItems:'إجمالي العناصر', createdAt:'تاريخ الإنشاء', modifiedAt:'تاريخ التعديل',
        username:'اسم المستخدم', email:'البريد الإلكتروني', plan:'الخطة',
        usageUsd:'الاستخدام ($)', proxy:'الوكيل',
        confirmDelete:'هل أنت متأكد من حذف هذا العنصر؟',
        runStarted:'بدأ التشغيل', runAborted:'تم إلغاء التشغيل',
        back:'رجوع', next:'التالي', prev:'السابق', page:'صفحة',
        description:'الوصف', category:'الفئة', author:'المؤلف',
        defaultDataset:'مجموعة البيانات الافتراضية', defaultKvStore:'مخزن KV الافتراضي',
        cronExpression:'تعبير Cron', isEnabled:'مفعّل', actions:'إجراءات',
        actorName:'اسم الممثل', taskName:'اسم المهمة', schedName:'اسم الجدول',
        exportJson:'تصدير JSON', exportCsv:'تصدير CSV',
        copied:'تم النسخ إلى الحافظة'
      },
      ko: {
        title:'Apify',
        store:'스토어', myActors:'내 액터', runs:'실행 기록', datasets:'데이터셋',
        kvStores:'KV 스토어', schedules:'스케줄', tasks:'작업', settings:'설정', account:'계정',
        apiKey:'API 키', saveKey:'저장', deleteKey:'삭제', enterApiKey:'API 키를 입력하세요',
        noKey:'API 키가 설정되지 않았습니다. 설정에서 추가하세요.',
        keySaved:'API 키가 저장되었습니다', keyDeleted:'API 키가 삭제되었습니다',
        search:'검색...', run:'실행', stop:'정지', abort:'중단', resurrect:'복구',
        viewLog:'로그 보기', viewData:'데이터 보기', refresh:'새로고침',
        loading:'로딩 중...', noData:'데이터 없음', noResults:'결과 없음',
        name:'이름', status:'상태', started:'시작', finished:'완료', items:'항목',
        memory:'메모리', duration:'소요시간', actorId:'액터 ID', runId:'실행 ID',
        input:'입력', output:'출력', log:'로그', close:'닫기', cancel:'취소',
        confirm:'확인', delete:'삭제', create:'생성', save:'저장',
        running:'실행 중', succeeded:'성공', failed:'실패', aborted:'중단됨',
        ready:'준비', timeout:'타임아웃',
        runActor:'액터 실행', inputJson:'입력 JSON', memoryMb:'메모리(MB)',
        timeoutSecs:'타임아웃(초)', build:'빌드 태그',
        datasetItems:'데이터셋 항목', kvKeys:'스토어 키', kvValue:'값',
        totalItems:'전체 항목', createdAt:'생성일', modifiedAt:'수정일',
        username:'사용자명', email:'이메일', plan:'요금제',
        usageUsd:'사용량($)', proxy:'프록시',
        confirmDelete:'이 항목을 삭제하시겠습니까?',
        runStarted:'실행이 시작되었습니다', runAborted:'실행이 중단되었습니다',
        back:'뒤로', next:'다음', prev:'이전', page:'페이지',
        description:'설명', category:'카테고리', author:'저자',
        defaultDataset:'기본 데이터셋', defaultKvStore:'기본 KV 스토어',
        cronExpression:'Cron 표현식', isEnabled:'활성화', actions:'작업',
        actorName:'액터 이름', taskName:'작업 이름', schedName:'스케줄 이름',
        exportJson:'JSON 내보내기', exportCsv:'CSV 내보내기',
        copied:'클립보드에 복사됨'
      },
      hi: {
        title:'Apify',
        store:'स्टोर', myActors:'मेरे एक्टर', runs:'रन', datasets:'डेटासेट',
        kvStores:'KV स्टोर', schedules:'शेड्यूल', tasks:'कार्य', settings:'सेटिंग्स', account:'खाता',
        apiKey:'API कुंजी', saveKey:'सहेजें', deleteKey:'हटाएं', enterApiKey:'अपनी API कुंजी दर्ज करें',
        noKey:'API कुंजी कॉन्फ़िगर नहीं है। कृपया सेटिंग्स में जोड़ें।',
        keySaved:'API कुंजी सहेजी गई', keyDeleted:'API कुंजी हटाई गई',
        search:'खोजें...', run:'चलाएं', stop:'रोकें', abort:'रद्द करें', resurrect:'पुनर्जीवित',
        viewLog:'लॉग देखें', viewData:'डेटा देखें', refresh:'रिफ्रेश',
        loading:'लोड हो रहा है...', noData:'कोई डेटा नहीं', noResults:'कोई परिणाम नहीं',
        name:'नाम', status:'स्थिति', started:'शुरू', finished:'समाप्त', items:'आइटम',
        memory:'मेमोरी', duration:'अवधि', actorId:'एक्टर ID', runId:'रन ID',
        input:'इनपुट', output:'आउटपुट', log:'लॉग', close:'बंद करें', cancel:'रद्द',
        confirm:'पुष्टि', delete:'हटाएं', create:'बनाएं', save:'सहेजें',
        running:'चल रहा है', succeeded:'सफल', failed:'विफल', aborted:'रद्द',
        ready:'तैयार', timeout:'समय समाप्त',
        runActor:'एक्टर चलाएं', inputJson:'इनपुट JSON', memoryMb:'मेमोरी (MB)',
        timeoutSecs:'टाइमआउट (सेकंड)', build:'बिल्ड टैग',
        datasetItems:'डेटासेट आइटम', kvKeys:'स्टोर कुंजियां', kvValue:'मान',
        totalItems:'कुल आइटम', createdAt:'बनाया गया', modifiedAt:'संशोधित',
        username:'उपयोगकर्ता नाम', email:'ईमेल', plan:'प्लान',
        usageUsd:'उपयोग ($)', proxy:'प्रॉक्सी',
        confirmDelete:'क्या आप इस आइटम को हटाना चाहते हैं?',
        runStarted:'रन शुरू हुआ', runAborted:'रन रद्द हुआ',
        back:'वापस', next:'अगला', prev:'पिछला', page:'पृष्ठ',
        description:'विवरण', category:'श्रेणी', author:'लेखक',
        defaultDataset:'डिफ़ॉल्ट डेटासेट', defaultKvStore:'डिफ़ॉल्ट KV स्टोर',
        cronExpression:'Cron अभिव्यक्ति', isEnabled:'सक्रिय', actions:'क्रियाएं',
        actorName:'एक्टर नाम', taskName:'कार्य नाम', schedName:'शेड्यूल नाम',
        exportJson:'JSON निर्यात', exportCsv:'CSV निर्यात',
        copied:'क्लिपबोर्ड में कॉपी किया गया'
      },
      pt: {
        title:'Apify',
        store:'Loja', myActors:'Meus Atores', runs:'Execuções', datasets:'Datasets',
        kvStores:'Armazéns KV', schedules:'Agendamentos', tasks:'Tarefas', settings:'Configurações', account:'Conta',
        apiKey:'Chave API', saveKey:'Salvar', deleteKey:'Excluir', enterApiKey:'Insira sua chave API',
        noKey:'Chave API não configurada. Adicione-a nas Configurações.',
        keySaved:'Chave API salva', keyDeleted:'Chave API excluída',
        search:'Pesquisar...', run:'Executar', stop:'Parar', abort:'Abortar', resurrect:'Ressuscitar',
        viewLog:'Ver Log', viewData:'Ver Dados', refresh:'Atualizar',
        loading:'Carregando...', noData:'Sem dados', noResults:'Sem resultados',
        name:'Nome', status:'Status', started:'Início', finished:'Fim', items:'Itens',
        memory:'Memória', duration:'Duração', actorId:'ID do Ator', runId:'ID da Execução',
        input:'Entrada', output:'Saída', log:'Log', close:'Fechar', cancel:'Cancelar',
        confirm:'Confirmar', delete:'Excluir', create:'Criar', save:'Salvar',
        running:'Executando', succeeded:'Sucesso', failed:'Falha', aborted:'Abortado',
        ready:'Pronto', timeout:'Timeout',
        runActor:'Executar Ator', inputJson:'JSON de Entrada', memoryMb:'Memória (MB)',
        timeoutSecs:'Timeout (seg)', build:'Tag de Build',
        datasetItems:'Itens do Dataset', kvKeys:'Chaves do Armazém', kvValue:'Valor',
        totalItems:'Total de itens', createdAt:'Criado', modifiedAt:'Modificado',
        username:'Usuário', email:'Email', plan:'Plano',
        usageUsd:'Uso ($)', proxy:'Proxy',
        confirmDelete:'Tem certeza de que deseja excluir este item?',
        runStarted:'Execução iniciada', runAborted:'Execução abortada',
        back:'Voltar', next:'Próximo', prev:'Anterior', page:'Página',
        description:'Descrição', category:'Categoria', author:'Autor',
        defaultDataset:'Dataset padrão', defaultKvStore:'Armazém KV padrão',
        cronExpression:'Expressão Cron', isEnabled:'Ativado', actions:'Ações',
        actorName:'Nome do Ator', taskName:'Nome da Tarefa', schedName:'Nome do Agendamento',
        exportJson:'Exportar JSON', exportCsv:'Exportar CSV',
        copied:'Copiado para área de transferência'
      }
    };

    function getLocale() {
      try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; }
    }
    const locale = ref(getLocale());
    function t(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
    function onLocaleChanged() { locale.value = getLocale(); }

    // ── State ──
    const tab = ref('store');
    const loading = ref(false);
    const hasKey = ref(false);
    const maskedKey = ref('');
    const apiKeyInput = ref('');

    // Store
    const storeItems = ref([]);
    const storeSearch = ref('');
    const storeTotal = ref(0);
    const storePage = ref(0);

    // Actors
    const actors = ref([]);
    const actorsTotal = ref(0);
    const actorsPage = ref(0);

    // Runs
    const runs = ref([]);
    const runsTotal = ref(0);
    const runsPage = ref(0);
    const runsFilter = ref('');

    // Datasets
    const datasets = ref([]);
    const datasetsTotal = ref(0);
    const datasetsPage = ref(0);

    // KV Stores
    const kvStores = ref([]);
    const kvStoresTotal = ref(0);
    const kvStoresPage = ref(0);

    // Schedules
    const schedules = ref([]);
    const schedulesTotal = ref(0);

    // Tasks
    const tasks = ref([]);
    const tasksTotal = ref(0);

    // Account
    const accountInfo = ref(null);

    // Dialogs
    const runDialog = ref(false);
    const runActorId = ref('');
    const runActorName = ref('');
    const runInput = ref('{}');
    const runMemory = ref('');
    const runTimeout = ref('');
    const runBuild = ref('');

    const logDialog = ref(false);
    const logContent = ref('');
    const logRunId = ref('');

    const dataDialog = ref(false);
    const dataItems = ref([]);
    const dataTitle = ref('');
    const dataTotal = ref(0);
    const dataPage = ref(0);
    const dataDatasetId = ref('');

    const kvDialog = ref(false);
    const kvKeys = ref([]);
    const kvStoreId = ref('');
    const kvStoreTitle = ref('');

    const kvValueDialog = ref(false);
    const kvValueContent = ref('');
    const kvValueKey = ref('');

    const detailDialog = ref(false);
    const detailRun = ref(null);

    const PAGE_SIZE = 20;

    // ── API ──
    function authHeaders() {
      const token = localStorage.getItem('auth_token') || '';
      return { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };
    }

    async function api(url, opts = {}) {
      const resp = await fetch(url, { headers: authHeaders(), ...opts });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: resp.statusText }));
        throw new Error(err.error || err.message || resp.statusText);
      }
      return resp.json();
    }

    // ── Settings ──
    async function loadSettings() {
      try {
        const r = await api('/api/apify/settings');
        hasKey.value = r.hasKey;
        maskedKey.value = r.maskedKey;
      } catch { hasKey.value = false; }
    }

    async function saveApiKey() {
      if (!apiKeyInput.value.trim()) return;
      try {
        await api('/api/apify/settings', { method: 'POST', body: JSON.stringify({ apiKey: apiKeyInput.value.trim() }) });
        ElMessage.success(t('keySaved'));
        apiKeyInput.value = '';
        await loadSettings();
      } catch (e) { ElMessage.error(e.message); }
    }

    async function deleteApiKey() {
      try {
        await ElMessageBox.confirm(t('confirmDelete'), t('confirm'));
        await api('/api/apify/settings', { method: 'DELETE' });
        ElMessage.success(t('keyDeleted'));
        hasKey.value = false;
        maskedKey.value = '';
      } catch {}
    }

    // ── Store ──
    async function loadStore(page) {
      loading.value = true;
      try {
        const offset = (page || 0) * PAGE_SIZE;
        let url = `/api/apify/store?limit=${PAGE_SIZE}&offset=${offset}`;
        if (storeSearch.value) url += '&search=' + encodeURIComponent(storeSearch.value);
        const r = await api(url);
        storeItems.value = (r.data && r.data.items) || r.items || [];
        storeTotal.value = (r.data && r.data.total) || r.total || 0;
        storePage.value = page || 0;
      } catch (e) { ElMessage.error(e.message); storeItems.value = []; }
      loading.value = false;
    }

    function searchStore() { loadStore(0); }

    // ── Actors ──
    async function loadActors(page) {
      loading.value = true;
      try {
        const offset = (page || 0) * PAGE_SIZE;
        const r = await api(`/api/apify/actors?limit=${PAGE_SIZE}&offset=${offset}`);
        actors.value = (r.data && r.data.items) || r.items || [];
        actorsTotal.value = (r.data && r.data.total) || r.total || 0;
        actorsPage.value = page || 0;
      } catch (e) { ElMessage.error(e.message); actors.value = []; }
      loading.value = false;
    }

    // ── Runs ──
    async function loadRuns(page) {
      loading.value = true;
      try {
        const offset = (page || 0) * PAGE_SIZE;
        let url = `/api/apify/runs?limit=${PAGE_SIZE}&offset=${offset}`;
        if (runsFilter.value) url += '&status=' + encodeURIComponent(runsFilter.value);
        const r = await api(url);
        runs.value = (r.data && r.data.items) || r.items || [];
        runsTotal.value = (r.data && r.data.total) || r.total || 0;
        runsPage.value = page || 0;
      } catch (e) { ElMessage.error(e.message); runs.value = []; }
      loading.value = false;
    }

    // ── Datasets ──
    async function loadDatasets(page) {
      loading.value = true;
      try {
        const offset = (page || 0) * PAGE_SIZE;
        const r = await api(`/api/apify/datasets?limit=${PAGE_SIZE}&offset=${offset}`);
        datasets.value = (r.data && r.data.items) || r.items || [];
        datasetsTotal.value = (r.data && r.data.total) || r.total || 0;
        datasetsPage.value = page || 0;
      } catch (e) { ElMessage.error(e.message); datasets.value = []; }
      loading.value = false;
    }

    // ── KV Stores ──
    async function loadKvStores(page) {
      loading.value = true;
      try {
        const offset = (page || 0) * PAGE_SIZE;
        const r = await api(`/api/apify/kv-stores?limit=${PAGE_SIZE}&offset=${offset}`);
        kvStores.value = (r.data && r.data.items) || r.items || [];
        kvStoresTotal.value = (r.data && r.data.total) || r.total || 0;
        kvStoresPage.value = page || 0;
      } catch (e) { ElMessage.error(e.message); kvStores.value = []; }
      loading.value = false;
    }

    // ── Schedules ──
    async function loadSchedules() {
      loading.value = true;
      try {
        const r = await api('/api/apify/schedules');
        schedules.value = (r.data && r.data.items) || r.items || [];
        schedulesTotal.value = (r.data && r.data.total) || r.total || 0;
      } catch (e) { ElMessage.error(e.message); schedules.value = []; }
      loading.value = false;
    }

    async function deleteSchedule(id) {
      try {
        await ElMessageBox.confirm(t('confirmDelete'), t('confirm'));
        await api(`/api/apify/schedules/${id}`, { method: 'DELETE' });
        await loadSchedules();
      } catch {}
    }

    // ── Tasks ──
    async function loadTasks() {
      loading.value = true;
      try {
        const r = await api('/api/apify/tasks');
        tasks.value = (r.data && r.data.items) || r.items || [];
        tasksTotal.value = (r.data && r.data.total) || r.total || 0;
      } catch (e) { ElMessage.error(e.message); tasks.value = []; }
      loading.value = false;
    }

    async function runTask(taskId) {
      try {
        await api(`/api/apify/tasks/${encodeURIComponent(taskId)}/run`, { method: 'POST', body: JSON.stringify({}) });
        ElMessage.success(t('runStarted'));
      } catch (e) { ElMessage.error(e.message); }
    }

    async function deleteTask(id) {
      try {
        await ElMessageBox.confirm(t('confirmDelete'), t('confirm'));
        await api(`/api/apify/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' });
        await loadTasks();
      } catch {}
    }

    // ── Account ──
    async function loadAccount() {
      loading.value = true;
      try {
        const r = await api('/api/apify/account');
        accountInfo.value = r.data || r;
      } catch (e) { ElMessage.error(e.message); accountInfo.value = null; }
      loading.value = false;
    }

    // ── Run Actor Dialog ──
    function openRunDialog(actorId, actorName) {
      runActorId.value = actorId;
      runActorName.value = actorName || actorId;
      runInput.value = '{}';
      runMemory.value = '';
      runTimeout.value = '';
      runBuild.value = '';
      runDialog.value = true;
    }

    async function startRun() {
      try {
        JSON.parse(runInput.value);
      } catch {
        ElMessage.error('Invalid JSON input');
        return;
      }
      try {
        const body = {
          input: JSON.parse(runInput.value),
          options: {}
        };
        if (runMemory.value) body.options.memory = parseInt(runMemory.value);
        if (runTimeout.value) body.options.timeout = parseInt(runTimeout.value);
        if (runBuild.value) body.options.build = runBuild.value;
        await api(`/api/apify/actors/${encodeURIComponent(runActorId.value)}/run`, {
          method: 'POST', body: JSON.stringify(body)
        });
        ElMessage.success(t('runStarted'));
        runDialog.value = false;
        if (tab.value === 'runs') loadRuns(0);
      } catch (e) { ElMessage.error(e.message); }
    }

    // ── Run Detail ──
    async function showRunDetail(runId) {
      try {
        loading.value = true;
        const r = await api(`/api/apify/runs/${runId}`);
        detailRun.value = r.data || r;
        detailDialog.value = true;
      } catch (e) { ElMessage.error(e.message); }
      loading.value = false;
    }

    // ── Run Log ──
    async function showLog(runId) {
      logRunId.value = runId;
      logContent.value = t('loading');
      logDialog.value = true;
      try {
        const r = await api(`/api/apify/runs/${runId}/log`);
        logContent.value = r.log || JSON.stringify(r, null, 2);
      } catch (e) { logContent.value = 'Error: ' + e.message; }
    }

    // ── Abort / Resurrect ──
    async function abortRun(runId) {
      try {
        await api(`/api/apify/runs/${runId}/abort`, { method: 'POST' });
        ElMessage.success(t('runAborted'));
        loadRuns(runsPage.value);
      } catch (e) { ElMessage.error(e.message); }
    }

    async function resurrectRun(runId) {
      try {
        await api(`/api/apify/runs/${runId}/resurrect`, { method: 'POST' });
        ElMessage.success(t('runStarted'));
        loadRuns(runsPage.value);
      } catch (e) { ElMessage.error(e.message); }
    }

    // ── Dataset Items Dialog ──
    async function showDatasetItems(datasetId, title, page) {
      dataDatasetId.value = datasetId;
      dataTitle.value = title || datasetId;
      dataPage.value = page || 0;
      dataDialog.value = true;
      try {
        const offset = (page || 0) * 50;
        const r = await api(`/api/apify/datasets/${datasetId}/items?limit=50&offset=${offset}`);
        dataItems.value = Array.isArray(r) ? r : (r.items || r.data || []);
        dataTotal.value = Array.isArray(r) ? r.length : (r.total || dataItems.value.length);
      } catch (e) { ElMessage.error(e.message); dataItems.value = []; }
    }

    // ── KV Keys Dialog ──
    async function showKvKeys(storeId, title) {
      kvStoreId.value = storeId;
      kvStoreTitle.value = title || storeId;
      kvDialog.value = true;
      kvKeys.value = [];
      try {
        const r = await api(`/api/apify/kv-stores/${storeId}/keys`);
        kvKeys.value = (r.data && r.data.items) || r.items || [];
      } catch (e) { ElMessage.error(e.message); }
    }

    async function showKvValue(key) {
      kvValueKey.value = key;
      kvValueContent.value = t('loading');
      kvValueDialog.value = true;
      try {
        const r = await api(`/api/apify/kv-stores/${kvStoreId.value}/records/${encodeURIComponent(key)}`);
        kvValueContent.value = typeof r === 'string' ? r : JSON.stringify(r, null, 2);
      } catch (e) { kvValueContent.value = 'Error: ' + e.message; }
    }

    // ── Tab Change ──
    function switchTab(t) {
      tab.value = t;
      if (t === 'store') loadStore(0);
      else if (t === 'myActors') loadActors(0);
      else if (t === 'runs') loadRuns(0);
      else if (t === 'datasets') loadDatasets(0);
      else if (t === 'kvStores') loadKvStores(0);
      else if (t === 'schedules') loadSchedules();
      else if (t === 'tasks') loadTasks();
      else if (t === 'account') loadAccount();
    }

    // ── Helpers ──
    function statusColor(s) {
      const map = { RUNNING: '#409eff', SUCCEEDED: '#67c23a', FAILED: '#f56c6c', ABORTED: '#909399', READY: '#e6a23c', TIMED_OUT: '#f56c6c' };
      return map[s] || '#909399';
    }

    function statusLabel(s) {
      const map = { RUNNING: 'running', SUCCEEDED: 'succeeded', FAILED: 'failed', ABORTED: 'aborted', READY: 'ready', TIMED_OUT: 'timeout' };
      return t(map[s] || s || 'ready');
    }

    function fmtDate(d) {
      if (!d) return '-';
      try { return new Date(d).toLocaleString(); } catch { return d; }
    }

    function fmtDuration(start, end) {
      if (!start) return '-';
      const s = new Date(start);
      const e = end ? new Date(end) : new Date();
      const diff = Math.round((e - s) / 1000);
      if (diff < 60) return diff + 's';
      if (diff < 3600) return Math.floor(diff / 60) + 'm ' + (diff % 60) + 's';
      return Math.floor(diff / 3600) + 'h ' + Math.floor((diff % 3600) / 60) + 'm';
    }

    function fmtMemory(bytes) {
      if (!bytes) return '-';
      return Math.round(bytes / 1048576) + ' MB';
    }

    function totalPages(total) {
      return Math.ceil(total / PAGE_SIZE);
    }

    // Export
    function exportJSON(data, filename) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename || 'export.json';
      a.click();
      URL.revokeObjectURL(url);
    }

    function exportCSV(data, filename) {
      if (!data || !data.length) return;
      const keys = Object.keys(data[0]);
      const rows = [keys.join(',')];
      data.forEach(item => {
        rows.push(keys.map(k => {
          const v = item[k];
          if (v === null || v === undefined) return '';
          const s = String(v).replace(/"/g, '""');
          return s.includes(',') || s.includes('"') || s.includes('\n') ? '"' + s + '"' : s;
        }).join(','));
      });
      const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename || 'export.csv';
      a.click();
      URL.revokeObjectURL(url);
    }

    function copyToClipboard(text) {
      navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
      ElMessage.success(t('copied'));
    }

    // ── Lifecycle ──
    onMounted(async () => {
      window.addEventListener('locale-changed', onLocaleChanged);
      await loadSettings();
      if (hasKey.value) loadStore(0);
    });

    onUnmounted(() => {
      window.removeEventListener('locale-changed', onLocaleChanged);
    });

    return {
      t, locale, tab, loading, hasKey, maskedKey, apiKeyInput,
      storeItems, storeSearch, storeTotal, storePage,
      actors, actorsTotal, actorsPage,
      runs, runsTotal, runsPage, runsFilter,
      datasets, datasetsTotal, datasetsPage,
      kvStores, kvStoresTotal, kvStoresPage,
      schedules, schedulesTotal,
      tasks, tasksTotal,
      accountInfo,
      runDialog, runActorId, runActorName, runInput, runMemory, runTimeout, runBuild,
      logDialog, logContent, logRunId,
      dataDialog, dataItems, dataTitle, dataTotal, dataPage, dataDatasetId,
      kvDialog, kvKeys, kvStoreId, kvStoreTitle,
      kvValueDialog, kvValueContent, kvValueKey,
      detailDialog, detailRun,
      PAGE_SIZE,
      switchTab, loadStore, searchStore, loadActors, loadRuns,
      loadDatasets, loadKvStores, loadSchedules, loadTasks, loadAccount,
      saveApiKey, deleteApiKey,
      openRunDialog, startRun,
      showRunDetail, showLog, abortRun, resurrectRun,
      showDatasetItems, showKvKeys, showKvValue,
      deleteSchedule, runTask, deleteTask,
      statusColor, statusLabel, fmtDate, fmtDuration, fmtMemory, totalPages,
      exportJSON, exportCSV, copyToClipboard
    };
  }
})
