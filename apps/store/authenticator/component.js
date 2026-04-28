(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, watch } = Vue;

  const COLORS = ['#1565c0','#e53935','#8e24aa','#00897b','#d81b60','#5e35b1','#1e88e5','#f4511e','#43a047','#fb8c00','#3949ab','#00acc1'];

  const LANGS = {
    tr: {
      title: 'Doğrulayıcı', addAccount: 'Hesap Ekle', searchPlaceholder: 'Hesap ara...',
      noAccounts: 'Henüz hesap yok', noAccountsSub: 'İlk 2FA hesabınızı ekleyin',
      copied: 'Kopyalandı!', unknown: 'Bilinmeyen',
      addTitle: 'Hesap Ekle', editTitle: 'Hesabı Düzenle',
      manual: 'Manuel Giriş', qrPaste: 'URI Yapıştır',
      lblIssuer: 'Sağlayıcı', issuerPlaceholder: 'Örn: Google',
      lblAccount: 'Hesap', accountPlaceholder: 'kullanici@mail.com',
      lblSecret: 'Gizli Anahtar', secretPlaceholder: 'Base32 kodlu anahtar...',
      lblPeriod: 'Süre', seconds: 'saniye', lblDigits: 'Rakam Sayısı', lblAlgorithm: 'Algoritma',
      qrScan: 'QR Tarama', qrDropText: 'QR kod resmini sürükleyip bırakın', qrDropSub: 'veya tıklayarak dosya seçin',
      qrScanning: 'Taranıyor...', qrNotFound: 'QR kod bulunamadı', qrSuccess: 'QR kod başarıyla okundu!',
      uriInfo: 'otpauth:// URI\'sini yapıştırın', uriPlaceholder: 'otpauth://totp/...',
      parseUri: 'URI\'yi Ayrıştır', uriError: 'Geçersiz URI formatı',
      cancel: 'İptal', save: 'Kaydet', delete: 'Sil',
      deleteTitle: 'Hesabı Sil', deleteConfirm: 'Bu 2FA hesabını silmek istediğinize emin misiniz?',
      import: 'İçe Aktar', export: 'Dışa Aktar',
      importTitle: 'Hesapları İçe Aktar', importInfo: 'JSON formatında dışa aktarılmış veriyi yapıştırın.',
      importPlaceholder: 'JSON verisini yapıştırın...', importBtn: 'İçe Aktar', importError: 'Geçersiz JSON verisi',
      exportSuccess: 'Panoya kopyalandı'
    },
    en: {
      title: 'Authenticator', addAccount: 'Add Account', searchPlaceholder: 'Search accounts...',
      noAccounts: 'No accounts yet', noAccountsSub: 'Add your first 2FA account',
      copied: 'Copied!', unknown: 'Unknown',
      addTitle: 'Add Account', editTitle: 'Edit Account',
      manual: 'Manual Entry', qrPaste: 'Paste URI',
      lblIssuer: 'Issuer', issuerPlaceholder: 'e.g. Google',
      lblAccount: 'Account', accountPlaceholder: 'user@mail.com',
      lblSecret: 'Secret Key', secretPlaceholder: 'Base32 encoded key...',
      lblPeriod: 'Period', seconds: 'seconds', lblDigits: 'Digits', lblAlgorithm: 'Algorithm',
      qrScan: 'QR Scan', qrDropText: 'Drag & drop a QR code image', qrDropSub: 'or click to select a file',
      qrScanning: 'Scanning...', qrNotFound: 'No QR code found', qrSuccess: 'QR code scanned successfully!',
      uriInfo: 'Paste an otpauth:// URI', uriPlaceholder: 'otpauth://totp/...',
      parseUri: 'Parse URI', uriError: 'Invalid URI format',
      cancel: 'Cancel', save: 'Save', delete: 'Delete',
      deleteTitle: 'Delete Account', deleteConfirm: 'Are you sure you want to delete this 2FA account?',
      import: 'Import', export: 'Export',
      importTitle: 'Import Accounts', importInfo: 'Paste exported JSON data.',
      importPlaceholder: 'Paste JSON data...', importBtn: 'Import', importError: 'Invalid JSON data',
      exportSuccess: 'Copied to clipboard'
    },
    de: {
      title: 'Authentifikator', addAccount: 'Konto hinzufügen', searchPlaceholder: 'Konten suchen...',
      noAccounts: 'Noch keine Konten', noAccountsSub: 'Fügen Sie Ihr erstes 2FA-Konto hinzu',
      copied: 'Kopiert!', unknown: 'Unbekannt',
      addTitle: 'Konto hinzufügen', editTitle: 'Konto bearbeiten',
      manual: 'Manuell', qrPaste: 'URI einfügen',
      lblIssuer: 'Aussteller', issuerPlaceholder: 'z.B. Google',
      lblAccount: 'Konto', accountPlaceholder: 'benutzer@mail.com',
      lblSecret: 'Geheimer Schlüssel', secretPlaceholder: 'Base32-kodierter Schlüssel...',
      lblPeriod: 'Intervall', seconds: 'Sekunden', lblDigits: 'Ziffern', lblAlgorithm: 'Algorithmus',
      qrScan: 'QR-Scan', qrDropText: 'QR-Code-Bild hierher ziehen', qrDropSub: 'oder klicken um Datei auszuwählen',
      qrScanning: 'Wird gescannt...', qrNotFound: 'Kein QR-Code gefunden', qrSuccess: 'QR-Code erfolgreich gescannt!',
      uriInfo: 'Fügen Sie eine otpauth:// URI ein', uriPlaceholder: 'otpauth://totp/...',
      parseUri: 'URI analysieren', uriError: 'Ungültiges URI-Format',
      cancel: 'Abbrechen', save: 'Speichern', delete: 'Löschen',
      deleteTitle: 'Konto löschen', deleteConfirm: 'Möchten Sie dieses 2FA-Konto wirklich löschen?',
      import: 'Importieren', export: 'Exportieren',
      importTitle: 'Konten importieren', importInfo: 'Exportierte JSON-Daten einfügen.',
      importPlaceholder: 'JSON-Daten einfügen...', importBtn: 'Importieren', importError: 'Ungültige JSON-Daten',
      exportSuccess: 'In Zwischenablage kopiert'
    },
    fr: {
      title: 'Authentificateur', addAccount: 'Ajouter un compte', searchPlaceholder: 'Rechercher des comptes...',
      noAccounts: 'Aucun compte', noAccountsSub: 'Ajoutez votre premier compte 2FA',
      copied: 'Copié !', unknown: 'Inconnu',
      addTitle: 'Ajouter un compte', editTitle: 'Modifier le compte',
      manual: 'Saisie manuelle', qrPaste: 'Coller l\'URI',
      lblIssuer: 'Émetteur', issuerPlaceholder: 'ex : Google',
      lblAccount: 'Compte', accountPlaceholder: 'utilisateur@mail.com',
      lblSecret: 'Clé secrète', secretPlaceholder: 'Clé encodée en Base32...',
      lblPeriod: 'Période', seconds: 'secondes', lblDigits: 'Chiffres', lblAlgorithm: 'Algorithme',
      qrScan: 'Scanner QR', qrDropText: 'Glissez-déposez une image de code QR', qrDropSub: 'ou cliquez pour sélectionner un fichier',
      qrScanning: 'Analyse en cours...', qrNotFound: 'Aucun code QR trouvé', qrSuccess: 'Code QR scanné avec succès !',
      uriInfo: 'Collez une URI otpauth://', uriPlaceholder: 'otpauth://totp/...',
      parseUri: 'Analyser l\'URI', uriError: 'Format d\'URI invalide',
      cancel: 'Annuler', save: 'Enregistrer', delete: 'Supprimer',
      deleteTitle: 'Supprimer le compte', deleteConfirm: 'Voulez-vous vraiment supprimer ce compte 2FA ?',
      import: 'Importer', export: 'Exporter',
      importTitle: 'Importer des comptes', importInfo: 'Collez les données JSON exportées.',
      importPlaceholder: 'Collez les données JSON...', importBtn: 'Importer', importError: 'Données JSON invalides',
      exportSuccess: 'Copié dans le presse-papiers'
    },
    es: {
      title: 'Autenticador', addAccount: 'Agregar cuenta', searchPlaceholder: 'Buscar cuentas...',
      noAccounts: 'Sin cuentas', noAccountsSub: 'Agregue su primera cuenta 2FA',
      copied: '¡Copiado!', unknown: 'Desconocido',
      addTitle: 'Agregar cuenta', editTitle: 'Editar cuenta',
      manual: 'Entrada manual', qrPaste: 'Pegar URI',
      lblIssuer: 'Emisor', issuerPlaceholder: 'ej: Google',
      lblAccount: 'Cuenta', accountPlaceholder: 'usuario@mail.com',
      lblSecret: 'Clave secreta', secretPlaceholder: 'Clave codificada en Base32...',
      lblPeriod: 'Período', seconds: 'segundos', lblDigits: 'Dígitos', lblAlgorithm: 'Algoritmo',
      qrScan: 'Escanear QR', qrDropText: 'Arrastre y suelte una imagen de código QR', qrDropSub: 'o haga clic para seleccionar un archivo',
      qrScanning: 'Escaneando...', qrNotFound: 'No se encontró código QR', qrSuccess: '¡Código QR escaneado con éxito!',
      uriInfo: 'Pegue una URI otpauth://', uriPlaceholder: 'otpauth://totp/...',
      parseUri: 'Analizar URI', uriError: 'Formato de URI inválido',
      cancel: 'Cancelar', save: 'Guardar', delete: 'Eliminar',
      deleteTitle: 'Eliminar cuenta', deleteConfirm: '¿Desea eliminar esta cuenta 2FA?',
      import: 'Importar', export: 'Exportar',
      importTitle: 'Importar cuentas', importInfo: 'Pegue los datos JSON exportados.',
      importPlaceholder: 'Pegue los datos JSON...', importBtn: 'Importar', importError: 'Datos JSON inválidos',
      exportSuccess: 'Copiado al portapapeles'
    },
    ru: {
      title: 'Аутентификатор', addAccount: 'Добавить аккаунт', searchPlaceholder: 'Поиск аккаунтов...',
      noAccounts: 'Нет аккаунтов', noAccountsSub: 'Добавьте первый 2FA аккаунт',
      copied: 'Скопировано!', unknown: 'Неизвестно',
      addTitle: 'Добавить аккаунт', editTitle: 'Редактировать аккаунт',
      manual: 'Ручной ввод', qrPaste: 'Вставить URI',
      lblIssuer: 'Издатель', issuerPlaceholder: 'напр. Google',
      lblAccount: 'Аккаунт', accountPlaceholder: 'user@mail.com',
      lblSecret: 'Секретный ключ', secretPlaceholder: 'Ключ в Base32...',
      lblPeriod: 'Период', seconds: 'секунд', lblDigits: 'Цифры', lblAlgorithm: 'Алгоритм',
      qrScan: 'QR-скан', qrDropText: 'Перетащите изображение QR-кода', qrDropSub: 'или нажмите для выбора файла',
      qrScanning: 'Сканирование...', qrNotFound: 'QR-код не найден', qrSuccess: 'QR-код успешно отсканирован!',
      uriInfo: 'Вставьте URI otpauth://', uriPlaceholder: 'otpauth://totp/...',
      parseUri: 'Разобрать URI', uriError: 'Неверный формат URI',
      cancel: 'Отмена', save: 'Сохранить', delete: 'Удалить',
      deleteTitle: 'Удалить аккаунт', deleteConfirm: 'Вы уверены, что хотите удалить этот 2FA аккаунт?',
      import: 'Импорт', export: 'Экспорт',
      importTitle: 'Импорт аккаунтов', importInfo: 'Вставьте экспортированные данные JSON.',
      importPlaceholder: 'Вставьте JSON данные...', importBtn: 'Импорт', importError: 'Неверные данные JSON',
      exportSuccess: 'Скопировано в буфер обмена'
    },
    zh: {
      title: '身份验证器', addAccount: '添加账户', searchPlaceholder: '搜索账户...',
      noAccounts: '暂无账户', noAccountsSub: '添加您的第一个 2FA 账户',
      copied: '已复制！', unknown: '未知',
      addTitle: '添加账户', editTitle: '编辑账户',
      manual: '手动输入', qrPaste: '粘贴 URI',
      lblIssuer: '发行者', issuerPlaceholder: '例如：Google',
      lblAccount: '账户', accountPlaceholder: 'user@mail.com',
      lblSecret: '密钥', secretPlaceholder: 'Base32 编码密钥...',
      lblPeriod: '周期', seconds: '秒', lblDigits: '位数', lblAlgorithm: '算法',
      qrScan: 'QR扫描', qrDropText: '拖放二维码图片', qrDropSub: '或点击选择文件',
      qrScanning: '扫描中...', qrNotFound: '未找到二维码', qrSuccess: '二维码扫描成功！',
      uriInfo: '粘贴 otpauth:// URI', uriPlaceholder: 'otpauth://totp/...',
      parseUri: '解析 URI', uriError: '无效的 URI 格式',
      cancel: '取消', save: '保存', delete: '删除',
      deleteTitle: '删除账户', deleteConfirm: '确定要删除此 2FA 账户吗？',
      import: '导入', export: '导出',
      importTitle: '导入账户', importInfo: '粘贴导出的 JSON 数据。',
      importPlaceholder: '粘贴 JSON 数据...', importBtn: '导入', importError: '无效的 JSON 数据',
      exportSuccess: '已复制到剪贴板'
    },
    ja: {
      title: '認証アプリ', addAccount: 'アカウント追加', searchPlaceholder: 'アカウントを検索...',
      noAccounts: 'アカウントなし', noAccountsSub: '最初の2FAアカウントを追加してください',
      copied: 'コピーしました！', unknown: '不明',
      addTitle: 'アカウント追加', editTitle: 'アカウント編集',
      manual: '手動入力', qrPaste: 'URI貼り付け',
      lblIssuer: '発行者', issuerPlaceholder: '例: Google',
      lblAccount: 'アカウント', accountPlaceholder: 'user@mail.com',
      lblSecret: 'シークレットキー', secretPlaceholder: 'Base32エンコードキー...',
      lblPeriod: '期間', seconds: '秒', lblDigits: '桁数', lblAlgorithm: 'アルゴリズム',
      qrScan: 'QRスキャン', qrDropText: 'QRコード画像をドラッグ＆ドロップ', qrDropSub: 'またはクリックしてファイルを選択',
      qrScanning: 'スキャン中...', qrNotFound: 'QRコードが見つかりません', qrSuccess: 'QRコードのスキャンに成功しました！',
      uriInfo: 'otpauth:// URIを貼り付けてください', uriPlaceholder: 'otpauth://totp/...',
      parseUri: 'URIを解析', uriError: '無効なURI形式',
      cancel: 'キャンセル', save: '保存', delete: '削除',
      deleteTitle: 'アカウント削除', deleteConfirm: 'この2FAアカウントを削除しますか？',
      import: 'インポート', export: 'エクスポート',
      importTitle: 'アカウントインポート', importInfo: 'エクスポートされたJSONデータを貼り付けてください。',
      importPlaceholder: 'JSONデータを貼り付け...', importBtn: 'インポート', importError: '無効なJSONデータ',
      exportSuccess: 'クリップボードにコピーしました'
    },
    it: {
      title: 'Autenticatore', addAccount: 'Aggiungi account', searchPlaceholder: 'Cerca account...',
      noAccounts: 'Nessun account', noAccountsSub: 'Aggiungi il tuo primo account 2FA',
      copied: 'Copiato!', unknown: 'Sconosciuto',
      addTitle: 'Aggiungi account', editTitle: 'Modifica account',
      manual: 'Inserimento manuale', qrPaste: 'Incolla URI',
      lblIssuer: 'Emittente', issuerPlaceholder: 'es. Google',
      lblAccount: 'Account', accountPlaceholder: 'utente@mail.com',
      lblSecret: 'Chiave segreta', secretPlaceholder: 'Chiave codificata Base32...',
      lblPeriod: 'Periodo', seconds: 'secondi', lblDigits: 'Cifre', lblAlgorithm: 'Algoritmo',
      qrScan: 'Scansione QR', qrDropText: 'Trascina e rilascia un\'immagine del codice QR', qrDropSub: 'o clicca per selezionare un file',
      qrScanning: 'Scansione in corso...', qrNotFound: 'Nessun codice QR trovato', qrSuccess: 'Codice QR scansionato con successo!',
      uriInfo: 'Incolla un URI otpauth://', uriPlaceholder: 'otpauth://totp/...',
      parseUri: 'Analizza URI', uriError: 'Formato URI non valido',
      cancel: 'Annulla', save: 'Salva', delete: 'Elimina',
      deleteTitle: 'Elimina account', deleteConfirm: 'Vuoi eliminare questo account 2FA?',
      import: 'Importa', export: 'Esporta',
      importTitle: 'Importa account', importInfo: 'Incolla i dati JSON esportati.',
      importPlaceholder: 'Incolla dati JSON...', importBtn: 'Importa', importError: 'Dati JSON non validi',
      exportSuccess: 'Copiato negli appunti'
    },
    ar: {
      title: 'المصادق', addAccount: 'إضافة حساب', searchPlaceholder: 'البحث عن حسابات...',
      noAccounts: 'لا توجد حسابات', noAccountsSub: 'أضف أول حساب 2FA الخاص بك',
      copied: 'تم النسخ!', unknown: 'غير معروف',
      addTitle: 'إضافة حساب', editTitle: 'تعديل الحساب',
      manual: 'إدخال يدوي', qrPaste: 'لصق URI',
      lblIssuer: 'المُصدر', issuerPlaceholder: 'مثال: Google',
      lblAccount: 'الحساب', accountPlaceholder: 'user@mail.com',
      lblSecret: 'المفتاح السري', secretPlaceholder: 'مفتاح بترميز Base32...',
      lblPeriod: 'المدة', seconds: 'ثانية', lblDigits: 'عدد الأرقام', lblAlgorithm: 'الخوارزمية',
      qrScan: 'مسح QR', qrDropText: 'اسحب وأفلت صورة رمز QR', qrDropSub: 'أو انقر لاختيار ملف',
      qrScanning: 'جارٍ المسح...', qrNotFound: 'لم يتم العثور على رمز QR', qrSuccess: 'تم مسح رمز QR بنجاح!',
      uriInfo: 'الصق عنوان otpauth:// URI', uriPlaceholder: 'otpauth://totp/...',
      parseUri: 'تحليل URI', uriError: 'تنسيق URI غير صالح',
      cancel: 'إلغاء', save: 'حفظ', delete: 'حذف',
      deleteTitle: 'حذف الحساب', deleteConfirm: 'هل أنت متأكد من حذف حساب 2FA هذا؟',
      import: 'استيراد', export: 'تصدير',
      importTitle: 'استيراد الحسابات', importInfo: 'الصق بيانات JSON المُصدَّرة.',
      importPlaceholder: 'الصق بيانات JSON...', importBtn: 'استيراد', importError: 'بيانات JSON غير صالحة',
      exportSuccess: 'تم النسخ إلى الحافظة'
    },
    ko: {
      title: '인증기', addAccount: '계정 추가', searchPlaceholder: '계정 검색...',
      noAccounts: '계정 없음', noAccountsSub: '첫 번째 2FA 계정을 추가하세요',
      copied: '복사됨!', unknown: '알 수 없음',
      addTitle: '계정 추가', editTitle: '계정 편집',
      manual: '수동 입력', qrPaste: 'URI 붙여넣기',
      lblIssuer: '발급자', issuerPlaceholder: '예: Google',
      lblAccount: '계정', accountPlaceholder: 'user@mail.com',
      lblSecret: '비밀 키', secretPlaceholder: 'Base32 인코딩 키...',
      lblPeriod: '주기', seconds: '초', lblDigits: '자릿수', lblAlgorithm: '알고리즘',
      qrScan: 'QR 스캔', qrDropText: 'QR 코드 이미지를 끌어다 놓으세요', qrDropSub: '또는 클릭하여 파일 선택',
      qrScanning: '스캔 중...', qrNotFound: 'QR 코드를 찾을 수 없습니다', qrSuccess: 'QR 코드가 성공적으로 스캔되었습니다!',
      uriInfo: 'otpauth:// URI를 붙여넣으세요', uriPlaceholder: 'otpauth://totp/...',
      parseUri: 'URI 분석', uriError: '잘못된 URI 형식',
      cancel: '취소', save: '저장', delete: '삭제',
      deleteTitle: '계정 삭제', deleteConfirm: '이 2FA 계정을 삭제하시겠습니까?',
      import: '가져오기', export: '내보내기',
      importTitle: '계정 가져오기', importInfo: '내보낸 JSON 데이터를 붙여넣으세요.',
      importPlaceholder: 'JSON 데이터 붙여넣기...', importBtn: '가져오기', importError: '잘못된 JSON 데이터',
      exportSuccess: '클립보드에 복사됨'
    },
    hi: {
      title: 'प्रमाणक', addAccount: 'खाता जोड़ें', searchPlaceholder: 'खाते खोजें...',
      noAccounts: 'कोई खाता नहीं', noAccountsSub: 'अपना पहला 2FA खाता जोड़ें',
      copied: 'कॉपी किया गया!', unknown: 'अज्ञात',
      addTitle: 'खाता जोड़ें', editTitle: 'खाता संपादित करें',
      manual: 'मैनुअल प्रविष्टि', qrPaste: 'URI चिपकाएं',
      lblIssuer: 'जारीकर्ता', issuerPlaceholder: 'उदा: Google',
      lblAccount: 'खाता', accountPlaceholder: 'user@mail.com',
      lblSecret: 'गुप्त कुंजी', secretPlaceholder: 'Base32 एन्कोडेड कुंजी...',
      lblPeriod: 'अवधि', seconds: 'सेकंड', lblDigits: 'अंक', lblAlgorithm: 'एल्गोरिदम',
      qrScan: 'QR स्कैन', qrDropText: 'QR कोड इमेज खींचकर छोड़ें', qrDropSub: 'या फ़ाइल चुनने के लिए क्लिक करें',
      qrScanning: 'स्कैन हो रहा है...', qrNotFound: 'QR कोड नहीं मिला', qrSuccess: 'QR कोड सफलतापूर्वक स्कैन किया गया!',
      uriInfo: 'otpauth:// URI चिपकाएं', uriPlaceholder: 'otpauth://totp/...',
      parseUri: 'URI पार्स करें', uriError: 'अमान्य URI प्रारूप',
      cancel: 'रद्द करें', save: 'सहेजें', delete: 'हटाएं',
      deleteTitle: 'खाता हटाएं', deleteConfirm: 'क्या आप इस 2FA खाते को हटाना चाहते हैं?',
      import: 'आयात', export: 'निर्यात',
      importTitle: 'खाते आयात करें', importInfo: 'निर्यात किए गए JSON डेटा चिपकाएं।',
      importPlaceholder: 'JSON डेटा चिपकाएं...', importBtn: 'आयात', importError: 'अमान्य JSON डेटा',
      exportSuccess: 'क्लिपबोर्ड में कॉपी किया गया'
    },
    pt: {
      title: 'Autenticador', addAccount: 'Adicionar Conta', searchPlaceholder: 'Pesquisar contas...',
      noAccounts: 'Nenhuma conta', noAccountsSub: 'Adicione sua primeira conta 2FA',
      copied: 'Copiado!', unknown: 'Desconhecido',
      addTitle: 'Adicionar Conta', editTitle: 'Editar Conta',
      manual: 'Entrada Manual', qrPaste: 'Colar URI',
      lblIssuer: 'Emissor', issuerPlaceholder: 'ex: Google',
      lblAccount: 'Conta', accountPlaceholder: 'usuario@mail.com',
      lblSecret: 'Chave Secreta', secretPlaceholder: 'Chave codificada em Base32...',
      lblPeriod: 'Período', seconds: 'segundos', lblDigits: 'Dígitos', lblAlgorithm: 'Algoritmo',
      qrScan: 'Escanear QR', qrDropText: 'Arraste e solte uma imagem de código QR', qrDropSub: 'ou clique para selecionar um arquivo',
      qrScanning: 'Escaneando...', qrNotFound: 'Nenhum código QR encontrado', qrSuccess: 'Código QR escaneado com sucesso!',
      uriInfo: 'Cole um URI otpauth://', uriPlaceholder: 'otpauth://totp/...',
      parseUri: 'Analisar URI', uriError: 'Formato de URI inválido',
      cancel: 'Cancelar', save: 'Salvar', delete: 'Excluir',
      deleteTitle: 'Excluir Conta', deleteConfirm: 'Tem certeza de que deseja excluir esta conta 2FA?',
      import: 'Importar', export: 'Exportar',
      importTitle: 'Importar Contas', importInfo: 'Cole os dados JSON exportados.',
      importPlaceholder: 'Cole os dados JSON...', importBtn: 'Importar', importError: 'Dados JSON inválidos',
      exportSuccess: 'Copiado para a área de transferência'
    }
  };

  /* ── TOTP Engine (RFC 6238 / RFC 4226) ── */
  function base32Decode(str) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    str = str.replace(/[\s=-]+/g, '').toUpperCase();
    let bits = '';
    for (let i = 0; i < str.length; i++) {
      const idx = alphabet.indexOf(str[i]);
      if (idx === -1) continue;
      bits += idx.toString(2).padStart(5, '0');
    }
    const bytes = new Uint8Array(Math.floor(bits.length / 8));
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
    }
    return bytes;
  }

  async function hmacSha(algorithm, key, data) {
    const algo = { 'SHA-1': 'SHA-1', 'SHA-256': 'SHA-256', 'SHA-512': 'SHA-512' }[algorithm] || 'SHA-1';
    const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: algo }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', cryptoKey, data);
    return new Uint8Array(sig);
  }

  async function generateTOTP(secret, period = 30, digits = 6, algorithm = 'SHA-1') {
    const key = base32Decode(secret);
    const epoch = Math.floor(Date.now() / 1000);
    const counter = Math.floor(epoch / period);
    const counterBytes = new Uint8Array(8);
    let tmp = counter;
    for (let i = 7; i >= 0; i--) {
      counterBytes[i] = tmp & 0xff;
      tmp = Math.floor(tmp / 256);
    }
    const hash = await hmacSha(algorithm, key, counterBytes);
    const offset = hash[hash.length - 1] & 0x0f;
    const binary = ((hash[offset] & 0x7f) << 24) | ((hash[offset + 1] & 0xff) << 16) |
                   ((hash[offset + 2] & 0xff) << 8) | (hash[offset + 3] & 0xff);
    const otp = (binary % Math.pow(10, digits)).toString().padStart(digits, '0');
    return otp;
  }

  function getLocale() {
    try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; }
  }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      const STORAGE_KEY = 'authenticator_accounts';
      const accounts = ref([]);
      const search = ref('');
      const copiedId = ref(null);
      let copiedTimer = null;

      // Timer state
      const remaining = ref(30);
      const period = ref(30);
      let tickInterval = null;

      // Dialogs
      const showAddDialog = ref(false);
      const showImportDialog = ref(false);
      const showDeleteDialog = ref(false);
      const editingAccount = ref(null);
      const deletingAccount = ref(null);
      const addTab = ref('manual');

      // Form
      const form = ref({ issuer: '', account: '', secret: '', period: 30, digits: 6, algorithm: 'SHA-1' });
      const uriInput = ref('');
      const uriError = ref('');
      const importData = ref('');
      const importError = ref('');

      // QR scan state
      const qrDragover = ref(false);
      const qrScanning = ref(false);
      const qrPreview = ref(null);
      const qrError = ref('');
      const qrSuccess = ref('');
      let jsQRLoaded = null;

      const filteredAccounts = computed(() => {
        if (!search.value) return accounts.value;
        const q = search.value.toLowerCase();
        return accounts.value.filter(a =>
          (a.issuer || '').toLowerCase().includes(q) ||
          (a.account || '').toLowerCase().includes(q)
        );
      });

      const timerOffset = computed(() => {
        const maxPeriod = accounts.value.length ? accounts.value[0].period || 30 : 30;
        const fraction = remaining.value / maxPeriod;
        return (1 - fraction) * 97.4; // circumference ≈ 97.4
      });

      const timerColor = computed(() => {
        if (remaining.value <= 5) return '#ef5350';
        if (remaining.value <= 10) return '#ffa726';
        return '#66bb6a';
      });

      function loadAccounts() {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) accounts.value = JSON.parse(raw);
        } catch {}
      }

      function saveAccounts() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts.value));
      }

      async function updateCodes() {
        const epoch = Math.floor(Date.now() / 1000);
        for (const acc of accounts.value) {
          const p = acc.period || 30;
          remaining.value = p - (epoch % p);
          try {
            acc.currentCode = await generateTOTP(acc.secret, p, acc.digits || 6, acc.algorithm || 'SHA-1');
          } catch {
            acc.currentCode = '------';
          }
        }
      }

      function startTimer() {
        updateCodes();
        tickInterval = setInterval(() => {
          const epoch = Math.floor(Date.now() / 1000);
          const p = accounts.value.length ? (accounts.value[0].period || 30) : 30;
          remaining.value = p - (epoch % p);
          if (remaining.value === p) updateCodes();
        }, 500);
      }

      function formatCode(code) {
        if (!code) return '------';
        if (code.length === 8) return code.slice(0, 4) + ' ' + code.slice(4);
        if (code.length === 6) return code.slice(0, 3) + ' ' + code.slice(3);
        return code;
      }

      function copyCode(acc) {
        if (!acc.currentCode || acc.currentCode === '------') return;
        navigator.clipboard.writeText(acc.currentCode);
        copiedId.value = acc.id;
        if (copiedTimer) clearTimeout(copiedTimer);
        copiedTimer = setTimeout(() => { copiedId.value = null; }, 1500);
      }

      function resetForm() {
        form.value = { issuer: '', account: '', secret: '', period: 30, digits: 6, algorithm: 'SHA-1' };
        uriInput.value = '';
        uriError.value = '';
        qrPreview.value = null;
        qrError.value = '';
        qrSuccess.value = '';
        editingAccount.value = null;
        addTab.value = 'manual';
      }

      /* ── QR Code Image Scanner ── */
      function loadJsQR() {
        if (jsQRLoaded) return jsQRLoaded;
        jsQRLoaded = new Promise((resolve, reject) => {
          if (window.jsQR) return resolve(window.jsQR);
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
          s.onload = () => resolve(window.jsQR);
          s.onerror = () => { jsQRLoaded = null; reject(new Error('Failed to load jsQR')); };
          document.head.appendChild(s);
        });
        return jsQRLoaded;
      }

      async function scanQRImage(file) {
        qrError.value = '';
        qrSuccess.value = '';
        qrScanning.value = true;
        try {
          const jsQR = await loadJsQR();
          const img = await createImageBitmap(file);
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, canvas.width, canvas.height);
          if (!code || !code.data) {
            qrError.value = L('qrNotFound');
            return;
          }
          const uri = code.data.trim();
          if (uri.startsWith('otpauth://totp/')) {
            uriInput.value = uri;
            parseUri();
            qrSuccess.value = L('qrSuccess');
          } else {
            qrError.value = L('uriError');
          }
        } catch {
          qrError.value = L('qrNotFound');
        } finally {
          qrScanning.value = false;
        }
      }

      function onQrDrop(e) {
        qrDragover.value = false;
        const file = e.dataTransfer?.files?.[0];
        if (file && file.type.startsWith('image/')) {
          qrPreview.value = URL.createObjectURL(file);
          scanQRImage(file);
        }
      }

      function onQrFile(e) {
        const file = e.target?.files?.[0];
        if (file && file.type.startsWith('image/')) {
          qrPreview.value = URL.createObjectURL(file);
          scanQRImage(file);
        }
        e.target.value = '';
      }

      function editAccount(acc) {
        editingAccount.value = acc;
        form.value = { issuer: acc.issuer, account: acc.account, secret: acc.secret, period: acc.period, digits: acc.digits, algorithm: acc.algorithm };
        showAddDialog.value = true;
      }

      function saveAccount() {
        const secret = form.value.secret.replace(/\s/g, '');
        if (!secret) return;

        if (editingAccount.value) {
          const acc = editingAccount.value;
          acc.issuer = form.value.issuer;
          acc.account = form.value.account;
          acc.period = form.value.period;
          acc.digits = form.value.digits;
          acc.algorithm = form.value.algorithm;
        } else {
          accounts.value.push({
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            issuer: form.value.issuer,
            account: form.value.account,
            secret: secret,
            period: form.value.period || 30,
            digits: form.value.digits || 6,
            algorithm: form.value.algorithm || 'SHA-1',
            color: COLORS[accounts.value.length % COLORS.length],
            currentCode: ''
          });
        }
        saveAccounts();
        updateCodes();
        showAddDialog.value = false;
        resetForm();
      }

      function parseUri() {
        uriError.value = '';
        const raw = uriInput.value.trim();
        if (!raw.startsWith('otpauth://totp/')) {
          uriError.value = L('uriError');
          return;
        }
        try {
          const url = new URL(raw);
          const params = url.searchParams;
          const label = decodeURIComponent(url.pathname.replace('/totp/', ''));
          const parts = label.includes(':') ? label.split(':') : [label, ''];
          form.value.issuer = params.get('issuer') || parts[0].trim();
          form.value.account = parts.length > 1 ? parts[1].trim() : parts[0].trim();
          form.value.secret = (params.get('secret') || '').replace(/\s/g, '');
          form.value.period = parseInt(params.get('period')) || 30;
          form.value.digits = parseInt(params.get('digits')) || 6;
          form.value.algorithm = params.get('algorithm') || 'SHA-1';
          addTab.value = 'manual';
        } catch {
          uriError.value = L('uriError');
        }
      }

      function confirmDelete(acc) {
        deletingAccount.value = acc;
        showDeleteDialog.value = true;
      }

      function doDelete() {
        if (deletingAccount.value) {
          accounts.value = accounts.value.filter(a => a.id !== deletingAccount.value.id);
          saveAccounts();
        }
        showDeleteDialog.value = false;
        deletingAccount.value = null;
      }

      function exportAccounts() {
        const data = accounts.value.map(a => ({
          issuer: a.issuer, account: a.account, secret: a.secret,
          period: a.period, digits: a.digits, algorithm: a.algorithm
        }));
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        ElMessage.success(L('exportSuccess'));
      }

      function doImport() {
        importError.value = '';
        try {
          const arr = JSON.parse(importData.value);
          if (!Array.isArray(arr)) throw new Error('not array');
          for (const item of arr) {
            if (!item.secret) continue;
            accounts.value.push({
              id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
              issuer: item.issuer || '',
              account: item.account || '',
              secret: item.secret.replace(/\s/g, ''),
              period: item.period || 30,
              digits: item.digits || 6,
              algorithm: item.algorithm || 'SHA-1',
              color: COLORS[accounts.value.length % COLORS.length],
              currentCode: ''
            });
          }
          saveAccounts();
          updateCodes();
          showImportDialog.value = false;
          importData.value = '';
        } catch {
          importError.value = L('importError');
        }
      }

      onMounted(() => {
        loadAccounts();
        startTimer();
        window.addEventListener('storage', (e) => {
          if (e.key === 'sys_locale') locale.value = e.newValue || 'tr';
        });
      });

      onUnmounted(() => {
        if (tickInterval) clearInterval(tickInterval);
        if (copiedTimer) clearTimeout(copiedTimer);
      });

      return {
        L, accounts, search, filteredAccounts, copiedId,
        remaining, timerOffset, timerColor,
        showAddDialog, showImportDialog, showDeleteDialog,
        editingAccount, deletingAccount, addTab,
        form, uriInput, uriError, importData, importError,
        qrDragover, qrScanning, qrPreview, qrError, qrSuccess,
        formatCode, copyCode, resetForm, editAccount, saveAccount,
        parseUri, confirmDelete, doDelete, exportAccounts, doImport,
        onQrDrop, onQrFile
      };
    }
  };
})(Vue);
