({
  setup() {
    const { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } = Vue;
    const ElMessageBox = (window.ElementPlus && window.ElementPlus.ElMessageBox) || { confirm: () => Promise.resolve() };

    /* ─── i18n ─── */
    const LANGS = {
      tr: {
        title:'Solana Cüzdan',unlock:'Kilit Aç',lock:'Kilitle',create:'Yeni Cüzdan Oluştur',import:'Cüzdan İçe Aktar',
        password:'Şifre',confirmPassword:'Şifre Tekrar',walletPassword:'Cüzdan Şifresi',
        enterPassword:'Cüzdan şifrenizi girin',setPassword:'Yeni şifre belirleyin',
        wrongPassword:'Yanlış şifre',passwordMismatch:'Şifreler eşleşmiyor',passwordMin:'Şifre en az 6 karakter',
        secretKey:'Gizli Anahtar',enterSecretKey:'Base58 gizli anahtarı girin',
        copied:'Kopyalandı',copy:'Kopyala',
        balance:'Bakiye',send:'Gönder',receive:'Al',history:'İşlemler',tokens:'Token\'lar',
        toAddress:'Alıcı Adresi',amount:'Miktar',sendSOL:'SOL Gönder',sending:'Gönderiliyor...',
        txSuccess:'İşlem gönderildi',txError:'İşlem hatası',invalidAddress:'Geçersiz adres',
        insufficientBalance:'Yetersiz bakiye',
        noTx:'Henüz işlem yok',noTokens:'Token bulunamadı',
        network:'Ağ',mainnet:'Mainnet Beta',devnet:'Devnet',testnet:'Testnet',
        accounts:'Hesaplar',addAccount:'Hesap Ekle',account:'Hesap',
        iSaved:'Kaydettim',back:'Geri',refresh:'Yenile',address:'Adres',
        confirmSend:'göndermek istediğinize emin misiniz?',deleteWallet:'Cüzdanı Sil',
        deleteConfirm:'Cüzdanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!',
        importAccount:'Hesap İçe Aktar',
        viewSecretKey:'Gizli Anahtarı Göster',hideSecretKey:'Gizli Anahtarı Gizle',
        airdrop:'Airdrop',airdropSuccess:'1 SOL airdrop başarılı!',airdropError:'Airdrop hatası (sadece devnet/testnet)',
        fee:'İşlem Ücreti',total:'Toplam',max:'Maks',
        checkExplorer:'Explorer\'da Görüntüle',
        deleteAccount:'Hesabı Sil',renameAccount:'Hesabı Yeniden Adlandır',
        exportKey:'Anahtarı Dışa Aktar',
        changePw:'Şifre Değiştir',currentPw:'Mevcut Şifre',newPw:'Yeni Şifre',confirmNewPw:'Yeni Şifre Tekrar',
        pwChanged:'Şifre değiştirildi',wrongCurrentPw:'Mevcut şifre yanlış',
        sol:'SOL',lamports:'Lamports',
        backupWarning:'Bu gizli anahtarı güvenli bir yere kaydedin! Bir daha gösterilmeyecek.',
        loading:'Yükleniyor...',decimalsLabel:'Ondalık',slotLabel:'Slot'
      },
      en: {
        title:'Solana Wallet',unlock:'Unlock',lock:'Lock',create:'Create New Wallet',import:'Import Wallet',
        password:'Password',confirmPassword:'Confirm Password',walletPassword:'Wallet Password',
        enterPassword:'Enter your wallet password',setPassword:'Set a new password',
        wrongPassword:'Wrong password',passwordMismatch:'Passwords do not match',passwordMin:'Password min 6 chars',
        secretKey:'Secret Key',enterSecretKey:'Enter Base58 secret key',
        copied:'Copied',copy:'Copy',
        balance:'Balance',send:'Send',receive:'Receive',history:'Transactions',tokens:'Tokens',
        toAddress:'Recipient Address',amount:'Amount',sendSOL:'Send SOL',sending:'Sending...',
        txSuccess:'Transaction sent',txError:'Transaction error',invalidAddress:'Invalid address',
        insufficientBalance:'Insufficient balance',
        noTx:'No transactions yet',noTokens:'No tokens found',
        network:'Network',mainnet:'Mainnet Beta',devnet:'Devnet',testnet:'Testnet',
        accounts:'Accounts',addAccount:'Add Account',account:'Account',
        iSaved:'I Saved It',back:'Back',refresh:'Refresh',address:'Address',
        confirmSend:'Are you sure you want to send?',deleteWallet:'Delete Wallet',
        deleteConfirm:'Are you sure you want to delete the wallet? This cannot be undone!',
        importAccount:'Import Account',
        viewSecretKey:'View Secret Key',hideSecretKey:'Hide Secret Key',
        airdrop:'Airdrop',airdropSuccess:'1 SOL airdrop successful!',airdropError:'Airdrop error (devnet/testnet only)',
        fee:'Transaction Fee',total:'Total',max:'Max',
        checkExplorer:'View on Explorer',
        deleteAccount:'Delete Account',renameAccount:'Rename Account',
        exportKey:'Export Key',
        changePw:'Change Password',currentPw:'Current Password',newPw:'New Password',confirmNewPw:'Confirm New Password',
        pwChanged:'Password changed',wrongCurrentPw:'Wrong current password',
        sol:'SOL',lamports:'Lamports',
        backupWarning:'Save this secret key in a safe place! It will not be shown again.',
        loading:'Loading...',decimalsLabel:'Decimals',slotLabel:'Slot'
      },
      de: {
        title:'Solana Wallet',unlock:'Entsperren',lock:'Sperren',create:'Neues Wallet erstellen',import:'Wallet importieren',
        password:'Passwort',confirmPassword:'Passwort bestätigen',walletPassword:'Wallet-Passwort',
        enterPassword:'Wallet-Passwort eingeben',setPassword:'Neues Passwort festlegen',
        wrongPassword:'Falsches Passwort',passwordMismatch:'Passwörter stimmen nicht überein',passwordMin:'Passwort min. 6 Zeichen',
        secretKey:'Geheimer Schlüssel',enterSecretKey:'Base58 geheimen Schlüssel eingeben',
        copied:'Kopiert',copy:'Kopieren',
        balance:'Guthaben',send:'Senden',receive:'Empfangen',history:'Transaktionen',tokens:'Token',
        toAddress:'Empfängeradresse',amount:'Betrag',sendSOL:'SOL senden',sending:'Wird gesendet...',
        txSuccess:'Transaktion gesendet',txError:'Transaktionsfehler',invalidAddress:'Ungültige Adresse',
        insufficientBalance:'Unzureichendes Guthaben',
        noTx:'Noch keine Transaktionen',noTokens:'Keine Token gefunden',
        network:'Netzwerk',mainnet:'Mainnet Beta',devnet:'Devnet',testnet:'Testnet',
        accounts:'Konten',addAccount:'Konto hinzufügen',account:'Konto',
        iSaved:'Gespeichert',back:'Zurück',refresh:'Aktualisieren',address:'Adresse',
        confirmSend:'Möchten Sie wirklich senden?',deleteWallet:'Wallet löschen',
        deleteConfirm:'Wallet wirklich löschen? Nicht rückgängig machbar!',
        importAccount:'Konto importieren',
        viewSecretKey:'Geheimen Schlüssel anzeigen',hideSecretKey:'Geheimen Schlüssel verbergen',
        airdrop:'Airdrop',airdropSuccess:'1 SOL Airdrop erfolgreich!',airdropError:'Airdrop-Fehler (nur devnet/testnet)',
        fee:'Transaktionsgebühr',total:'Gesamt',max:'Max',
        checkExplorer:'Im Explorer anzeigen',
        deleteAccount:'Konto löschen',renameAccount:'Konto umbenennen',exportKey:'Schlüssel exportieren',
        changePw:'Passwort ändern',currentPw:'Aktuelles Passwort',newPw:'Neues Passwort',confirmNewPw:'Neues Passwort bestätigen',
        pwChanged:'Passwort geändert',wrongCurrentPw:'Falsches aktuelles Passwort',
        sol:'SOL',lamports:'Lamports',
        backupWarning:'Speichern Sie diesen geheimen Schlüssel an einem sicheren Ort! Er wird nicht erneut angezeigt.',
        loading:'Laden...',decimalsLabel:'Dezimalstellen',slotLabel:'Slot'
      },
      fr: {
        title:'Portefeuille Solana',unlock:'Déverrouiller',lock:'Verrouiller',create:'Créer un portefeuille',import:'Importer',
        password:'Mot de passe',confirmPassword:'Confirmer',walletPassword:'Mot de passe du portefeuille',
        enterPassword:'Entrez votre mot de passe',setPassword:'Définir un mot de passe',
        wrongPassword:'Mot de passe incorrect',passwordMismatch:'Non concordants',passwordMin:'Min 6 caractères',
        secretKey:'Clé secrète',enterSecretKey:'Entrez la clé secrète Base58',
        copied:'Copié',copy:'Copier',
        balance:'Solde',send:'Envoyer',receive:'Recevoir',history:'Transactions',tokens:'Tokens',
        toAddress:'Adresse du destinataire',amount:'Montant',sendSOL:'Envoyer SOL',sending:'Envoi...',
        txSuccess:'Transaction envoyée',txError:'Erreur de transaction',invalidAddress:'Adresse invalide',
        insufficientBalance:'Solde insuffisant',
        noTx:'Aucune transaction',noTokens:'Aucun token trouvé',
        network:'Réseau',mainnet:'Mainnet Beta',devnet:'Devnet',testnet:'Testnet',
        accounts:'Comptes',addAccount:'Ajouter',account:'Compte',
        iSaved:'Sauvegardé',back:'Retour',refresh:'Actualiser',address:'Adresse',
        confirmSend:'Êtes-vous sûr?',deleteWallet:'Supprimer',
        deleteConfirm:'Supprimer le portefeuille? Irréversible!',
        importAccount:'Importer un compte',
        viewSecretKey:'Voir la clé secrète',hideSecretKey:'Masquer la clé secrète',
        airdrop:'Airdrop',airdropSuccess:'1 SOL airdrop réussi!',airdropError:'Erreur airdrop (devnet/testnet)',
        fee:'Frais',total:'Total',max:'Max',checkExplorer:'Voir sur Explorer',
        deleteAccount:'Supprimer le compte',renameAccount:'Renommer',exportKey:'Exporter la clé',
        changePw:'Changer le mot de passe',currentPw:'Mot de passe actuel',newPw:'Nouveau',confirmNewPw:'Confirmer',
        pwChanged:'Mot de passe changé',wrongCurrentPw:'Mot de passe actuel incorrect',
        sol:'SOL',lamports:'Lamports',
        backupWarning:'Sauvegardez cette clé secrète en lieu sûr ! Elle ne sera plus affichée.',
        loading:'Chargement...',decimalsLabel:'Décimales',slotLabel:'Slot'
      },
      es: {
        title:'Cartera Solana',unlock:'Desbloquear',lock:'Bloquear',create:'Crear Cartera',import:'Importar',
        password:'Contraseña',confirmPassword:'Confirmar',walletPassword:'Contraseña',
        enterPassword:'Ingrese su contraseña',setPassword:'Establezca contraseña',
        wrongPassword:'Incorrecta',passwordMismatch:'No coinciden',passwordMin:'Mín. 6 caracteres',
        secretKey:'Clave secreta',enterSecretKey:'Ingrese clave secreta Base58',
        copied:'Copiado',copy:'Copiar',
        balance:'Saldo',send:'Enviar',receive:'Recibir',history:'Transacciones',tokens:'Tokens',
        toAddress:'Dirección',amount:'Cantidad',sendSOL:'Enviar SOL',sending:'Enviando...',
        txSuccess:'Transacción enviada',txError:'Error',invalidAddress:'Dirección inválida',
        insufficientBalance:'Saldo insuficiente',
        noTx:'Sin transacciones',noTokens:'Sin tokens',
        network:'Red',mainnet:'Mainnet Beta',devnet:'Devnet',testnet:'Testnet',
        accounts:'Cuentas',addAccount:'Agregar',account:'Cuenta',
        iSaved:'Guardado',back:'Atrás',refresh:'Actualizar',address:'Dirección',
        confirmSend:'¿Está seguro?',deleteWallet:'Eliminar',
        deleteConfirm:'¿Eliminar la cartera? ¡Irreversible!',
        importAccount:'Importar cuenta',
        viewSecretKey:'Ver clave secreta',hideSecretKey:'Ocultar clave secreta',
        airdrop:'Airdrop',airdropSuccess:'1 SOL airdrop exitoso!',airdropError:'Error airdrop (solo devnet/testnet)',
        fee:'Tarifa',total:'Total',max:'Máx',checkExplorer:'Ver en Explorer',
        deleteAccount:'Eliminar cuenta',renameAccount:'Renombrar',exportKey:'Exportar clave',
        changePw:'Cambiar contraseña',currentPw:'Actual',newPw:'Nueva',confirmNewPw:'Confirmar nueva',
        pwChanged:'Contraseña cambiada',wrongCurrentPw:'Contraseña actual incorrecta',
        sol:'SOL',lamports:'Lamports',
        backupWarning:'¡Guarde esta clave secreta en un lugar seguro! No se mostrará de nuevo.',
        loading:'Cargando...',decimalsLabel:'Decimales',slotLabel:'Slot'
      },
      ru: {
        title:'Кошелёк Solana',unlock:'Разблокировать',lock:'Заблокировать',create:'Создать кошелёк',import:'Импортировать',
        password:'Пароль',confirmPassword:'Подтвердите',walletPassword:'Пароль кошелька',
        enterPassword:'Введите пароль',setPassword:'Установите пароль',
        wrongPassword:'Неверный пароль',passwordMismatch:'Пароли не совпадают',passwordMin:'Мин. 6 символов',
        secretKey:'Секретный ключ',enterSecretKey:'Введите Base58 секретный ключ',
        copied:'Скопировано',copy:'Копировать',
        balance:'Баланс',send:'Отправить',receive:'Получить',history:'Транзакции',tokens:'Токены',
        toAddress:'Адрес получателя',amount:'Сумма',sendSOL:'Отправить SOL',sending:'Отправка...',
        txSuccess:'Транзакция отправлена',txError:'Ошибка',invalidAddress:'Неверный адрес',
        insufficientBalance:'Недостаточно средств',
        noTx:'Нет транзакций',noTokens:'Токены не найдены',
        network:'Сеть',mainnet:'Mainnet Beta',devnet:'Devnet',testnet:'Testnet',
        accounts:'Аккаунты',addAccount:'Добавить',account:'Аккаунт',
        iSaved:'Сохранено',back:'Назад',refresh:'Обновить',address:'Адрес',
        confirmSend:'Подтвердите отправку',deleteWallet:'Удалить',
        deleteConfirm:'Удалить кошелёк? Необратимо!',
        importAccount:'Импорт аккаунта',
        viewSecretKey:'Показать секретный ключ',hideSecretKey:'Скрыть секретный ключ',
        airdrop:'Аирдроп',airdropSuccess:'Аирдроп 1 SOL успешен!',airdropError:'Ошибка аирдропа (только devnet/testnet)',
        fee:'Комиссия',total:'Всего',max:'Макс',checkExplorer:'Смотреть в Explorer',
        deleteAccount:'Удалить аккаунт',renameAccount:'Переименовать',exportKey:'Экспортировать ключ',
        changePw:'Изменить пароль',currentPw:'Текущий',newPw:'Новый',confirmNewPw:'Подтвердите новый',
        pwChanged:'Пароль изменён',wrongCurrentPw:'Неверный текущий пароль',
        sol:'SOL',lamports:'Lamports',
        backupWarning:'Сохраните этот секретный ключ в надёжном месте! Он больше не будет показан.',
        loading:'Загрузка...',decimalsLabel:'Десятичные',slotLabel:'Слот'
      }
    };

    LANGS.zh = { ...LANGS.en,
      title:'Solana钱包',unlock:'解锁',lock:'锁定',create:'创建新钱包',import:'导入钱包',
      password:'密码',confirmPassword:'确认密码',walletPassword:'钱包密码',
      enterPassword:'请输入钱包密码',setPassword:'设置新密码',
      wrongPassword:'密码错误',passwordMismatch:'密码不匹配',passwordMin:'密码至少6个字符',
      secretKey:'私钥',enterSecretKey:'输入Base58私钥',
      copied:'已复制',copy:'复制',
      balance:'余额',send:'发送',receive:'接收',history:'交易记录',tokens:'代币',
      toAddress:'收款地址',amount:'金额',sendSOL:'发送SOL',sending:'发送中...',
      txSuccess:'交易已发送',txError:'交易错误',invalidAddress:'无效地址',
      insufficientBalance:'余额不足',
      noTx:'暂无交易记录',noTokens:'未找到代币',
      network:'网络',mainnet:'主网Beta',devnet:'开发网',testnet:'测试网',
      accounts:'账户',addAccount:'添加账户',account:'账户',
      iSaved:'已保存',back:'返回',refresh:'刷新',address:'地址',
      confirmSend:'确认发送？',deleteWallet:'删除钱包',
      deleteConfirm:'确定删除钱包？此操作不可撤销！',
      importAccount:'导入账户',
      viewSecretKey:'查看私钥',hideSecretKey:'隐藏私钥',
      airdrop:'空投',airdropSuccess:'1 SOL空投成功！',airdropError:'空投错误（仅限devnet/testnet）',
      fee:'交易费',total:'总计',max:'最大',checkExplorer:'在浏览器中查看',
      deleteAccount:'删除账户',renameAccount:'重命名账户',exportKey:'导出密钥',
      changePw:'修改密码',currentPw:'当前密码',newPw:'新密码',confirmNewPw:'确认新密码',
      pwChanged:'密码已修改',wrongCurrentPw:'当前密码错误',
      sol:'SOL',lamports:'Lamports',
      backupWarning:'请将此私钥保存到安全的地方！它将不会再次显示。',
      loading:'加载中...',decimalsLabel:'精度',slotLabel:'区块'
    };
    LANGS.ja = { ...LANGS.en,
      title:'Solanaウォレット',unlock:'ロック解除',lock:'ロック',create:'新規ウォレット作成',import:'ウォレットをインポート',
      password:'パスワード',confirmPassword:'パスワード確認',walletPassword:'ウォレットパスワード',
      enterPassword:'パスワードを入力',setPassword:'新しいパスワードを設定',
      wrongPassword:'パスワードが違います',passwordMismatch:'パスワードが一致しません',passwordMin:'パスワードは6文字以上',
      secretKey:'秘密鍵',enterSecretKey:'Base58秘密鍵を入力',
      copied:'コピーしました',copy:'コピー',
      balance:'残高',send:'送金',receive:'受取',history:'取引履歴',tokens:'トークン',
      toAddress:'送金先アドレス',amount:'金額',sendSOL:'SOLを送金',sending:'送金中...',
      txSuccess:'取引が送信されました',txError:'取引エラー',invalidAddress:'無効なアドレス',
      insufficientBalance:'残高不足',
      noTx:'取引履歴はありません',noTokens:'トークンが見つかりません',
      network:'ネットワーク',mainnet:'メインネットBeta',devnet:'Devnet',testnet:'Testnet',
      accounts:'アカウント',addAccount:'アカウント追加',account:'アカウント',
      iSaved:'保存しました',back:'戻る',refresh:'更新',address:'アドレス',
      confirmSend:'送金してよろしいですか？',deleteWallet:'ウォレット削除',
      deleteConfirm:'ウォレットを削除しますか？この操作は元に戻せません！',
      importAccount:'アカウントをインポート',
      viewSecretKey:'秘密鍵を表示',hideSecretKey:'秘密鍵を非表示',
      airdrop:'エアドロップ',airdropSuccess:'1 SOLエアドロップ成功！',airdropError:'エアドロップエラー（devnet/testnetのみ）',
      fee:'手数料',total:'合計',max:'最大',checkExplorer:'エクスプローラーで表示',
      deleteAccount:'アカウント削除',renameAccount:'アカウント名変更',exportKey:'鍵をエクスポート',
      changePw:'パスワード変更',currentPw:'現在のパスワード',newPw:'新しいパスワード',confirmNewPw:'新しいパスワード確認',
      pwChanged:'パスワードが変更されました',wrongCurrentPw:'現在のパスワードが違います',
      sol:'SOL',lamports:'Lamports',
      backupWarning:'この秘密鍵を安全な場所に保存してください！再表示されません。',
      loading:'読み込み中...',decimalsLabel:'小数点',slotLabel:'スロット'
    };
    LANGS.it = { ...LANGS.en,
      title:'Portafoglio Solana',unlock:'Sblocca',lock:'Blocca',create:'Crea Portafoglio',import:'Importa',
      password:'Password',confirmPassword:'Conferma Password',walletPassword:'Password Portafoglio',
      enterPassword:'Inserisci la password',setPassword:'Imposta una nuova password',
      wrongPassword:'Password errata',passwordMismatch:'Le password non coincidono',passwordMin:'Min 6 caratteri',
      secretKey:'Chiave segreta',enterSecretKey:'Inserisci chiave segreta Base58',
      copied:'Copiato',copy:'Copia',
      balance:'Saldo',send:'Invia',receive:'Ricevi',history:'Transazioni',tokens:'Token',
      toAddress:'Indirizzo destinatario',amount:'Importo',sendSOL:'Invia SOL',sending:'Invio...',
      txSuccess:'Transazione inviata',txError:'Errore transazione',invalidAddress:'Indirizzo non valido',
      insufficientBalance:'Saldo insufficiente',
      noTx:'Nessuna transazione',noTokens:'Nessun token trovato',
      network:'Rete',mainnet:'Mainnet Beta',devnet:'Devnet',testnet:'Testnet',
      accounts:'Account',addAccount:'Aggiungi Account',account:'Account',
      iSaved:'Salvato',back:'Indietro',refresh:'Aggiorna',address:'Indirizzo',
      confirmSend:'Sei sicuro di voler inviare?',deleteWallet:'Elimina Portafoglio',
      deleteConfirm:'Eliminare il portafoglio? Irreversibile!',
      importAccount:'Importa Account',
      viewSecretKey:'Mostra chiave segreta',hideSecretKey:'Nascondi chiave segreta',
      airdrop:'Airdrop',airdropSuccess:'1 SOL airdrop riuscito!',airdropError:'Errore airdrop (solo devnet/testnet)',
      fee:'Commissione',total:'Totale',max:'Max',checkExplorer:'Vedi su Explorer',
      deleteAccount:'Elimina Account',renameAccount:'Rinomina',exportKey:'Esporta chiave',
      changePw:'Cambia Password',currentPw:'Password attuale',newPw:'Nuova Password',confirmNewPw:'Conferma nuova',
      pwChanged:'Password cambiata',wrongCurrentPw:'Password attuale errata',
      sol:'SOL',lamports:'Lamports',
      backupWarning:'Salva questa chiave segreta in un luogo sicuro! Non verrà più mostrata.',
      loading:'Caricamento...',decimalsLabel:'Decimali',slotLabel:'Slot'
    };
    LANGS.ar = { ...LANGS.en,
      title:'محفظة سولانا',unlock:'فتح القفل',lock:'قفل',create:'إنشاء محفظة جديدة',import:'استيراد محفظة',
      password:'كلمة المرور',confirmPassword:'تأكيد كلمة المرور',walletPassword:'كلمة مرور المحفظة',
      enterPassword:'أدخل كلمة مرور المحفظة',setPassword:'تعيين كلمة مرور جديدة',
      wrongPassword:'كلمة مرور خاطئة',passwordMismatch:'كلمات المرور غير متطابقة',passwordMin:'الحد الأدنى 6 أحرف',
      secretKey:'المفتاح السري',enterSecretKey:'أدخل المفتاح السري Base58',
      copied:'تم النسخ',copy:'نسخ',
      balance:'الرصيد',send:'إرسال',receive:'استقبال',history:'المعاملات',tokens:'الرموز',
      toAddress:'عنوان المستلم',amount:'المبلغ',sendSOL:'إرسال SOL',sending:'جارٍ الإرسال...',
      txSuccess:'تم إرسال المعاملة',txError:'خطأ في المعاملة',invalidAddress:'عنوان غير صالح',
      insufficientBalance:'رصيد غير كافٍ',
      noTx:'لا توجد معاملات',noTokens:'لم يتم العثور على رموز',
      network:'الشبكة',mainnet:'الشبكة الرئيسية Beta',devnet:'Devnet',testnet:'Testnet',
      accounts:'الحسابات',addAccount:'إضافة حساب',account:'حساب',
      iSaved:'تم الحفظ',back:'رجوع',refresh:'تحديث',address:'العنوان',
      confirmSend:'هل أنت متأكد من الإرسال؟',deleteWallet:'حذف المحفظة',
      deleteConfirm:'حذف المحفظة؟ لا يمكن التراجع!',
      importAccount:'استيراد حساب',
      viewSecretKey:'عرض المفتاح السري',hideSecretKey:'إخفاء المفتاح السري',
      airdrop:'إسقاط جوي',airdropSuccess:'تم إسقاط 1 SOL بنجاح!',airdropError:'خطأ في الإسقاط الجوي (devnet/testnet فقط)',
      fee:'رسوم المعاملة',total:'الإجمالي',max:'الحد الأقصى',checkExplorer:'عرض في المستكشف',
      deleteAccount:'حذف الحساب',renameAccount:'إعادة تسمية',exportKey:'تصدير المفتاح',
      changePw:'تغيير كلمة المرور',currentPw:'كلمة المرور الحالية',newPw:'كلمة مرور جديدة',confirmNewPw:'تأكيد كلمة المرور الجديدة',
      pwChanged:'تم تغيير كلمة المرور',wrongCurrentPw:'كلمة المرور الحالية خاطئة',
      sol:'SOL',lamports:'Lamports',
      backupWarning:'احفظ هذا المفتاح السري في مكان آمن! لن يتم عرضه مرة أخرى.',
      loading:'جارٍ التحميل...',decimalsLabel:'الأرقام العشرية',slotLabel:'الفتحة'
    };
    LANGS.ko = { ...LANGS.en,
      title:'Solana 지갑',unlock:'잠금 해제',lock:'잠금',create:'새 지갑 만들기',import:'지갑 가져오기',
      password:'비밀번호',confirmPassword:'비밀번호 확인',walletPassword:'지갑 비밀번호',
      enterPassword:'지갑 비밀번호를 입력하세요',setPassword:'새 비밀번호 설정',
      wrongPassword:'잘못된 비밀번호',passwordMismatch:'비밀번호가 일치하지 않습니다',passwordMin:'비밀번호는 최소 6자',
      secretKey:'비밀 키',enterSecretKey:'Base58 비밀 키를 입력하세요',
      copied:'복사됨',copy:'복사',
      balance:'잔액',send:'보내기',receive:'받기',history:'거래 내역',tokens:'토큰',
      toAddress:'받는 주소',amount:'금액',sendSOL:'SOL 보내기',sending:'보내는 중...',
      txSuccess:'거래가 전송되었습니다',txError:'거래 오류',invalidAddress:'잘못된 주소',
      insufficientBalance:'잔액 부족',
      noTx:'거래 내역이 없습니다',noTokens:'토큰을 찾을 수 없습니다',
      network:'네트워크',mainnet:'메인넷 Beta',devnet:'Devnet',testnet:'Testnet',
      accounts:'계정',addAccount:'계정 추가',account:'계정',
      iSaved:'저장했습니다',back:'뒤로',refresh:'새로고침',address:'주소',
      confirmSend:'정말 보내시겠습니까?',deleteWallet:'지갑 삭제',
      deleteConfirm:'지갑을 삭제하시겠습니까? 되돌릴 수 없습니다!',
      importAccount:'계정 가져오기',
      viewSecretKey:'비밀 키 보기',hideSecretKey:'비밀 키 숨기기',
      airdrop:'에어드롭',airdropSuccess:'1 SOL 에어드롭 성공!',airdropError:'에어드롭 오류 (devnet/testnet만 가능)',
      fee:'수수료',total:'합계',max:'최대',checkExplorer:'탐색기에서 보기',
      deleteAccount:'계정 삭제',renameAccount:'계정 이름 변경',exportKey:'키 내보내기',
      changePw:'비밀번호 변경',currentPw:'현재 비밀번호',newPw:'새 비밀번호',confirmNewPw:'새 비밀번호 확인',
      pwChanged:'비밀번호가 변경되었습니다',wrongCurrentPw:'현재 비밀번호가 틀립니다',
      sol:'SOL',lamports:'Lamports',
      backupWarning:'이 비밀 키를 안전한 곳에 저장하세요! 다시 표시되지 않습니다.',
      loading:'로딩 중...',decimalsLabel:'소수점',slotLabel:'슬롯'
    };
    LANGS.hi = { ...LANGS.en,
      title:'सोलाना वॉलेट',unlock:'अनलॉक',lock:'लॉक',create:'नया वॉलेट बनाएं',import:'वॉलेट इंपोर्ट करें',
      password:'पासवर्ड',confirmPassword:'पासवर्ड की पुष्टि',walletPassword:'वॉलेट पासवर्ड',
      enterPassword:'वॉलेट पासवर्ड दर्ज करें',setPassword:'नया पासवर्ड सेट करें',
      wrongPassword:'गलत पासवर्ड',passwordMismatch:'पासवर्ड मेल नहीं खाते',passwordMin:'पासवर्ड कम से कम 6 अक्षर',
      secretKey:'गुप्त कुंजी',enterSecretKey:'Base58 गुप्त कुंजी दर्ज करें',
      copied:'कॉपी किया गया',copy:'कॉपी करें',
      balance:'बैलेंस',send:'भेजें',receive:'प्राप्त करें',history:'लेन-देन',tokens:'टोकन',
      toAddress:'प्राप्तकर्ता का पता',amount:'राशि',sendSOL:'SOL भेजें',sending:'भेज रहे हैं...',
      txSuccess:'लेन-देन भेजा गया',txError:'लेन-देन त्रुटि',invalidAddress:'अमान्य पता',
      insufficientBalance:'अपर्याप्त बैलेंस',
      noTx:'कोई लेन-देन नहीं',noTokens:'कोई टोकन नहीं मिला',
      network:'नेटवर्क',mainnet:'मेननेट Beta',devnet:'Devnet',testnet:'Testnet',
      accounts:'खाते',addAccount:'खाता जोड़ें',account:'खाता',
      iSaved:'सहेज लिया',back:'वापस',refresh:'रीफ्रेश',address:'पता',
      confirmSend:'क्या आप भेजना चाहते हैं?',deleteWallet:'वॉलेट हटाएं',
      deleteConfirm:'वॉलेट हटाना चाहते हैं? यह पूर्ववत नहीं किया जा सकता!',
      importAccount:'खाता इंपोर्ट करें',
      viewSecretKey:'गुप्त कुंजी देखें',hideSecretKey:'गुप्त कुंजी छिपाएं',
      airdrop:'एयरड्रॉप',airdropSuccess:'1 SOL एयरड्रॉप सफल!',airdropError:'एयरड्रॉप त्रुटि (केवल devnet/testnet)',
      fee:'शुल्क',total:'कुल',max:'अधिकतम',checkExplorer:'एक्सप्लोरर में देखें',
      deleteAccount:'खाता हटाएं',renameAccount:'नाम बदलें',exportKey:'कुंजी निर्यात करें',
      changePw:'पासवर्ड बदलें',currentPw:'वर्तमान पासवर्ड',newPw:'नया पासवर्ड',confirmNewPw:'नया पासवर्ड पुष्टि',
      pwChanged:'पासवर्ड बदल दिया गया',wrongCurrentPw:'वर्तमान पासवर्ड गलत है',
      sol:'SOL',lamports:'Lamports',
      backupWarning:'इस गुप्त कुंजी को सुरक्षित स्थान पर सहेजें! यह दोबारा नहीं दिखाई जाएगी।',
      loading:'लोड हो रहा है...',decimalsLabel:'दशमलव',slotLabel:'स्लॉट'
    };
    LANGS.pt = { ...LANGS.en,
      title:'Carteira Solana',unlock:'Desbloquear',lock:'Bloquear',create:'Criar Carteira',import:'Importar',
      password:'Senha',confirmPassword:'Confirmar Senha',walletPassword:'Senha da Carteira',
      enterPassword:'Digite a senha da carteira',setPassword:'Defina uma nova senha',
      wrongPassword:'Senha incorreta',passwordMismatch:'As senhas não coincidem',passwordMin:'Mín. 6 caracteres',
      secretKey:'Chave secreta',enterSecretKey:'Digite a chave secreta Base58',
      copied:'Copiado',copy:'Copiar',
      balance:'Saldo',send:'Enviar',receive:'Receber',history:'Transações',tokens:'Tokens',
      toAddress:'Endereço do destinatário',amount:'Valor',sendSOL:'Enviar SOL',sending:'Enviando...',
      txSuccess:'Transação enviada',txError:'Erro na transação',invalidAddress:'Endereço inválido',
      insufficientBalance:'Saldo insuficiente',
      noTx:'Sem transações',noTokens:'Nenhum token encontrado',
      network:'Rede',mainnet:'Mainnet Beta',devnet:'Devnet',testnet:'Testnet',
      accounts:'Contas',addAccount:'Adicionar Conta',account:'Conta',
      iSaved:'Salvo',back:'Voltar',refresh:'Atualizar',address:'Endereço',
      confirmSend:'Tem certeza que deseja enviar?',deleteWallet:'Excluir Carteira',
      deleteConfirm:'Excluir a carteira? Irreversível!',
      importAccount:'Importar Conta',
      viewSecretKey:'Ver chave secreta',hideSecretKey:'Ocultar chave secreta',
      airdrop:'Airdrop',airdropSuccess:'1 SOL airdrop com sucesso!',airdropError:'Erro no airdrop (somente devnet/testnet)',
      fee:'Taxa',total:'Total',max:'Máx',checkExplorer:'Ver no Explorer',
      deleteAccount:'Excluir Conta',renameAccount:'Renomear',exportKey:'Exportar chave',
      changePw:'Alterar Senha',currentPw:'Senha atual',newPw:'Nova Senha',confirmNewPw:'Confirmar nova senha',
      pwChanged:'Senha alterada',wrongCurrentPw:'Senha atual incorreta',
      sol:'SOL',lamports:'Lamports',
      backupWarning:'Salve esta chave secreta em um local seguro! Ela não será exibida novamente.',
      loading:'Carregando...',decimalsLabel:'Decimais',slotLabel:'Slot'
    };

    function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }
    const locale = ref(getLocale());
    function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
    function getToken() { try { return localStorage.getItem('auth_token') || ''; } catch { return ''; } }
    function authHeaders() { return { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }

    /* ─── Solana Networks ─── */
    const NETWORKS = {
      mainnet: { name: 'Mainnet Beta', rpc: 'https://api.mainnet-beta.solana.com', explorer: 'https://explorer.solana.com', symbol: 'SOL' },
      devnet:  { name: 'Devnet',       rpc: 'https://api.devnet.solana.com',       explorer: 'https://explorer.solana.com', explorerSuffix: '?cluster=devnet', symbol: 'SOL' },
      testnet: { name: 'Testnet',      rpc: 'https://api.testnet.solana.com',      explorer: 'https://explorer.solana.com', explorerSuffix: '?cluster=testnet', symbol: 'SOL' }
    };

    /* ─── State ─── */
    const screen = ref('loading');
    const walletPassword = ref('');
    const confirmPw = ref('');
    const pwError = ref('');
    const locked = ref(true);

    const wallets = ref([]);
    const activeIndex = ref(0);
    const activeNetwork = ref('mainnet');

    const tab = ref('balance');
    const balance = ref('0');
    const balanceLoading = ref(false);
    const txs = ref([]);
    const tokens = ref([]);
    const tokensLoading = ref(false);

    const sendForm = reactive({ to: '', amount: '', sending: false });
    const sendError = ref('');
    const sendSuccess = ref('');

    const importKey = ref('');
    const importError = ref('');
    const showSecretKey = ref(false);

    const showChangePw = ref(false);
    const changePwForm = reactive({ current: '', newPw: '', confirm: '' });
    const changePwError = ref('');

    // Auto-lock timer
    let autoLockTimer = null;
    const AUTO_LOCK_MS = 5 * 60 * 1000;

    const activeWallet = computed(() => wallets.value[activeIndex.value] || null);
    const activeAddr = computed(() => activeWallet.value ? activeWallet.value.publicKey : '');
    const shortAddr = computed(() => {
      const a = activeAddr.value;
      return a ? a.slice(0, 6) + '...' + a.slice(-4) : '';
    });
    const net = computed(() => NETWORKS[activeNetwork.value] || NETWORKS.mainnet);

    /* ─── Solana Web3 helpers ─── */
    let solanaWeb3 = null;

    async function loadSolanaSDK() {
      if (window.solanaWeb3) { solanaWeb3 = window.solanaWeb3; return; }
      return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://unpkg.com/@solana/web3.js@1.95.8/lib/index.iife.min.js';
        s.onload = () => { solanaWeb3 = window.solanaWeb3; resolve(); };
        s.onerror = () => reject(new Error('Failed to load Solana SDK'));
        document.head.appendChild(s);
      });
    }

    function getConnection() {
      return new solanaWeb3.Connection(net.value.rpc, 'confirmed');
    }

    function getKeypairFromSecret(secretKeyBase58) {
      const bytes = bs58Decode(secretKeyBase58);
      return solanaWeb3.Keypair.fromSecretKey(bytes);
    }

    /* ─── Base58 encode/decode (minimal, no dependency) ─── */
    const BS58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    function bs58Decode(str) {
      const bytes = [0];
      for (let i = 0; i < str.length; i++) {
        const c = BS58_ALPHABET.indexOf(str[i]);
        if (c < 0) throw new Error('Invalid Base58 character');
        for (let j = 0; j < bytes.length; j++) bytes[j] *= 58;
        bytes[0] += c;
        let carry = 0;
        for (let j = 0; j < bytes.length; j++) {
          bytes[j] += carry;
          carry = (bytes[j] >> 8);
          bytes[j] &= 0xff;
        }
        while (carry) { bytes.push(carry & 0xff); carry >>= 8; }
      }
      for (let i = 0; i < str.length && str[i] === '1'; i++) bytes.push(0);
      return new Uint8Array(bytes.reverse());
    }
    function bs58Encode(buffer) {
      const digits = [0];
      for (let i = 0; i < buffer.length; i++) {
        for (let j = 0; j < digits.length; j++) digits[j] <<= 8;
        digits[0] += buffer[i];
        let carry = 0;
        for (let j = 0; j < digits.length; j++) {
          digits[j] += carry;
          carry = (digits[j] / 58) | 0;
          digits[j] %= 58;
        }
        while (carry) { digits.push(carry % 58); carry = (carry / 58) | 0; }
      }
      let str = '';
      for (let i = 0; i < buffer.length && buffer[i] === 0; i++) str += '1';
      for (let i = digits.length - 1; i >= 0; i--) str += BS58_ALPHABET[digits[i]];
      return str;
    }

    /* ─── Auto-lock ─── */
    function resetAutoLock() {
      if (autoLockTimer) clearTimeout(autoLockTimer);
      if (!locked.value && screen.value === 'main') {
        autoLockTimer = setTimeout(() => lockWallet(), AUTO_LOCK_MS);
      }
    }

    function lockWallet() {
      locked.value = true;
      wallets.value = [];
      activeIndex.value = 0;
      balance.value = '0';
      txs.value = [];
      tokens.value = [];
      sendForm.to = '';
      sendForm.amount = '';
      showSecretKey.value = false;
      screen.value = 'unlock';
    }

    /* ─── Check wallet exists on server ─── */
    async function checkExists() {
      try {
        const r = await fetch('/api/solwallet/exists', { headers: authHeaders() });
        const d = await r.json();
        screen.value = d.exists ? 'unlock' : 'setup';
      } catch { screen.value = 'setup'; }
    }

    /* ─── Unlock with password ─── */
    async function unlockWallet() {
      if (!walletPassword.value) { pwError.value = L('passwordMin'); return; }
      try {
        const r = await fetch('/api/solwallet/unlock', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({ walletPassword: walletPassword.value })
        });
        if (!r.ok) { pwError.value = L('wrongPassword'); return; }
        const data = await r.json();
        wallets.value = data.wallets || [];
        activeIndex.value = data.activeIndex || 0;
        if (wallets.value.length === 0) { screen.value = 'setup'; return; }
        locked.value = false;
        screen.value = 'main';
        pwError.value = '';
        resetAutoLock();
        await refreshBalance();
      } catch { pwError.value = L('wrongPassword'); }
    }

    /* ─── Save encrypted to server ─── */
    async function saveToServer() {
      try {
        await fetch('/api/solwallet/save', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({
            walletPassword: walletPassword.value,
            wallets: wallets.value.map(w => ({
              publicKey: w.publicKey,
              secretKey: w.secretKey,
              name: w.name,
              imported: w.imported || false
            })),
            activeIndex: activeIndex.value
          })
        });
      } catch (e) { console.error('Save wallet error', e); }
    }

    let saveDebounce = null;
    function debouncedSave() {
      if (saveDebounce) clearTimeout(saveDebounce);
      saveDebounce = setTimeout(() => saveToServer(), 400);
    }

    /* ─── Create wallet ─── */
    function startCreate() {
      screen.value = 'create-password';
      walletPassword.value = '';
      confirmPw.value = '';
      pwError.value = '';
    }

    function startImport() {
      importKey.value = '';
      importError.value = '';
      screen.value = 'import';
      walletPassword.value = '';
      confirmPw.value = '';
      pwError.value = '';
    }

    async function confirmPassword() {
      if (walletPassword.value.length < 6) { pwError.value = L('passwordMin'); return; }
      if (walletPassword.value !== confirmPw.value) { pwError.value = L('passwordMismatch'); return; }
      pwError.value = '';

      await loadSolanaSDK();

      if (screen.value === 'create-password') {
        const keypair = solanaWeb3.Keypair.generate();
        wallets.value = [{
          publicKey: keypair.publicKey.toBase58(),
          secretKey: bs58Encode(keypair.secretKey),
          name: L('account') + ' 1',
          imported: false
        }];
        activeIndex.value = 0;
        // Show the secret key to user for backup
        screen.value = 'show-key';
      } else if (screen.value === 'import') {
        try {
          const trimmed = importKey.value.trim();
          if (!trimmed) { importError.value = L('enterSecretKey'); return; }
          // Try parsing as JSON (Uint8Array format like [1,2,3,...])
          let keypair;
          if (trimmed.startsWith('[')) {
            const arr = JSON.parse(trimmed);
            keypair = solanaWeb3.Keypair.fromSecretKey(new Uint8Array(arr));
          } else {
            // Base58 encoded secret key
            const bytes = bs58Decode(trimmed);
            keypair = solanaWeb3.Keypair.fromSecretKey(bytes);
          }
          wallets.value = [{
            publicKey: keypair.publicKey.toBase58(),
            secretKey: bs58Encode(keypair.secretKey),
            name: L('account') + ' 1',
            imported: true
          }];
          activeIndex.value = 0;
          locked.value = false;
          screen.value = 'main';
          await saveToServer();
          resetAutoLock();
          await refreshBalance();
        } catch (e) {
          importError.value = L('secretKey') + ': ' + (e.message || 'Invalid');
        }
      }
    }

    /* ─── Show key (backup) & confirm ─── */
    async function keyConfirmed() {
      locked.value = false;
      screen.value = 'main';
      await saveToServer();
      resetAutoLock();
      await refreshBalance();
    }

    function copySecretKey() {
      if (!activeWallet.value) return;
      navigator.clipboard.writeText(activeWallet.value.secretKey).catch(() => {});
      ElMessage({ message: L('copied'), type: 'success', duration: 1500 });
    }

    function copyAddress() {
      if (!activeAddr.value) return;
      navigator.clipboard.writeText(activeAddr.value).catch(() => {});
      ElMessage({ message: L('copied'), type: 'success', duration: 1500 });
    }

    function copyNewKey() {
      if (!wallets.value[0]) return;
      navigator.clipboard.writeText(wallets.value[0].secretKey).catch(() => {});
      ElMessage({ message: L('copied'), type: 'success', duration: 1500 });
    }

    /* ─── Balance ─── */
    async function refreshBalance() {
      if (!activeAddr.value) return;
      balanceLoading.value = true;
      try {
        const conn = getConnection();
        const pubkey = new solanaWeb3.PublicKey(activeAddr.value);
        const lamports = await conn.getBalance(pubkey);
        balance.value = (lamports / 1e9).toFixed(6);
      } catch (e) {
        console.error('Balance error:', e);
        balance.value = '?';
      }
      balanceLoading.value = false;
    }

    /* ─── Transactions ─── */
    async function loadTransactions() {
      if (!activeAddr.value) return;
      try {
        const conn = getConnection();
        const pubkey = new solanaWeb3.PublicKey(activeAddr.value);
        const sigs = await conn.getSignaturesForAddress(pubkey, { limit: 20 });
        txs.value = sigs.map(s => ({
          signature: s.signature,
          slot: s.slot,
          err: s.err,
          blockTime: s.blockTime,
          memo: s.memo
        }));
      } catch (e) {
        console.error('TX history error:', e);
        txs.value = [];
      }
    }

    /* ─── Token accounts ─── */
    async function loadTokens() {
      if (!activeAddr.value) return;
      tokensLoading.value = true;
      try {
        const conn = getConnection();
        const pubkey = new solanaWeb3.PublicKey(activeAddr.value);
        const resp = await conn.getParsedTokenAccountsByOwner(pubkey, {
          programId: new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
        });
        tokens.value = (resp.value || []).map(t => {
          const info = t.account.data.parsed.info;
          return {
            mint: info.mint,
            amount: info.tokenAmount.uiAmountString || '0',
            decimals: info.tokenAmount.decimals
          };
        }).filter(t => parseFloat(t.amount) > 0);
      } catch (e) {
        console.error('Tokens error:', e);
        tokens.value = [];
      }
      tokensLoading.value = false;
    }

    /* ─── Send SOL ─── */
    async function sendSOL() {
      sendError.value = '';
      sendSuccess.value = '';
      if (!sendForm.to.trim()) { sendError.value = L('invalidAddress'); return; }

      const amountSOL = parseFloat(sendForm.amount);
      if (isNaN(amountSOL) || amountSOL <= 0) { sendError.value = L('amount') + ' > 0'; return; }

      const currentBalance = parseFloat(balance.value);
      if (amountSOL > currentBalance) { sendError.value = L('insufficientBalance'); return; }

      // Validate recipient address
      let toPubkey;
      try {
        toPubkey = new solanaWeb3.PublicKey(sendForm.to.trim());
        if (!solanaWeb3.PublicKey.isOnCurve(toPubkey)) throw new Error('off curve');
      } catch {
        sendError.value = L('invalidAddress');
        return;
      }

      try {
        await ElMessageBox.confirm(
          `${amountSOL} SOL → ${sendForm.to.slice(0, 8)}...${sendForm.to.slice(-4)}\n${L('confirmSend')}`,
          L('sendSOL'), { confirmButtonText: L('sendSOL'), cancelButtonText: L('back'), type: 'warning' }
        );
      } catch { return; }

      sendForm.sending = true;
      resetAutoLock();
      try {
        const conn = getConnection();
        const fromKeypair = getKeypairFromSecret(activeWallet.value.secretKey);
        const lamports = Math.round(amountSOL * 1e9);
        const tx = new solanaWeb3.Transaction().add(
          solanaWeb3.SystemProgram.transfer({
            fromPubkey: fromKeypair.publicKey,
            toPubkey: toPubkey,
            lamports: lamports
          })
        );
        const sig = await solanaWeb3.sendAndConfirmTransaction(conn, tx, [fromKeypair]);
        sendSuccess.value = L('txSuccess') + ' — ' + sig.slice(0, 12) + '...';
        sendForm.to = '';
        sendForm.amount = '';
        setTimeout(() => { refreshBalance(); loadTransactions(); }, 2000);
      } catch (e) {
        sendError.value = L('txError') + ': ' + (e.message || '');
      }
      sendForm.sending = false;
    }

    /* ─── Airdrop (devnet/testnet only) ─── */
    async function requestAirdrop() {
      if (activeNetwork.value === 'mainnet') return;
      try {
        const conn = getConnection();
        const pubkey = new solanaWeb3.PublicKey(activeAddr.value);
        await conn.requestAirdrop(pubkey, 1e9);
        ElMessage({ message: L('airdropSuccess'), type: 'success', duration: 3000 });
        setTimeout(() => refreshBalance(), 3000);
      } catch (e) {
        ElMessage({ message: L('airdropError'), type: 'error', duration: 3000 });
      }
    }

    /* ─── Account management ─── */
    async function addAccount() {
      await loadSolanaSDK();
      const keypair = solanaWeb3.Keypair.generate();
      wallets.value.push({
        publicKey: keypair.publicKey.toBase58(),
        secretKey: bs58Encode(keypair.secretKey),
        name: L('account') + ' ' + (wallets.value.length + 1),
        imported: false
      });
      activeIndex.value = wallets.value.length - 1;
      debouncedSave();
      await refreshBalance();
    }

    function selectAccount(i) {
      if (i === 'add') { addAccount(); return; }
      if (i === activeIndex.value) return;
      activeIndex.value = i;
      balance.value = '0';
      txs.value = [];
      tokens.value = [];
      tab.value = 'balance';
      debouncedSave();
      refreshBalance();
    }

    async function deleteAccount(i) {
      if (wallets.value.length <= 1) return;
      try {
        await ElMessageBox.confirm(L('deleteConfirm'), L('deleteAccount'), {
          confirmButtonText: L('deleteAccount'), cancelButtonText: L('back'), type: 'warning'
        });
      } catch { return; }
      wallets.value.splice(i, 1);
      if (activeIndex.value >= wallets.value.length) activeIndex.value = wallets.value.length - 1;
      debouncedSave();
      refreshBalance();
    }

    function selectNetwork(k) {
      if (k === activeNetwork.value) return;
      activeNetwork.value = k;
      balance.value = '0';
      txs.value = [];
      tokens.value = [];
      refreshBalance();
    }

    /* ─── Change password ─── */
    async function changePassword() {
      changePwError.value = '';
      if (changePwForm.newPw.length < 6) { changePwError.value = L('passwordMin'); return; }
      if (changePwForm.newPw !== changePwForm.confirm) { changePwError.value = L('passwordMismatch'); return; }
      try {
        const r = await fetch('/api/solwallet/change-password', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({
            currentPassword: changePwForm.current,
            newPassword: changePwForm.newPw
          })
        });
        if (!r.ok) {
          const d = await r.json();
          changePwError.value = d.error === 'wrong_password' ? L('wrongCurrentPw') : d.error;
          return;
        }
        walletPassword.value = changePwForm.newPw;
        changePwForm.current = '';
        changePwForm.newPw = '';
        changePwForm.confirm = '';
        showChangePw.value = false;
        ElMessage({ message: L('pwChanged'), type: 'success', duration: 2000 });
      } catch (e) {
        changePwError.value = e.message || 'Error';
      }
    }

    /* ─── Delete wallet ─── */
    async function deleteWallet() {
      try {
        await ElMessageBox.confirm(L('deleteConfirm'), L('deleteWallet'), {
          confirmButtonText: L('deleteWallet'), cancelButtonText: L('back'), type: 'warning'
        });
      } catch { return; }
      try {
        await fetch('/api/solwallet/delete', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({ walletPassword: walletPassword.value })
        });
      } catch {}
      wallets.value = [];
      activeIndex.value = 0;
      balance.value = '0';
      txs.value = [];
      tokens.value = [];
      locked.value = true;
      walletPassword.value = '';
      screen.value = 'setup';
    }

    /* ─── Explorer link ─── */
    function explorerUrl(type, val) {
      const base = net.value.explorer;
      const suffix = net.value.explorerSuffix || '';
      return base + '/' + type + '/' + val + suffix;
    }

    function openExplorer(type, val) {
      window.open(explorerUrl(type, val), '_blank', 'noopener');
    }

    /* ─── Tab switching ─── */
    watch(tab, (v) => {
      if (v === 'history') loadTransactions();
      else if (v === 'tokens') loadTokens();
    });

    watch(activeNetwork, () => { resetAutoLock(); });

    /* ─── Lifecycle ─── */
    onMounted(async () => {
      await loadSolanaSDK();
      await checkExists();
      document.addEventListener('mousemove', resetAutoLock);
      document.addEventListener('keydown', resetAutoLock);
    });

    onUnmounted(() => {
      if (autoLockTimer) clearTimeout(autoLockTimer);
      if (saveDebounce) clearTimeout(saveDebounce);
      document.removeEventListener('mousemove', resetAutoLock);
      document.removeEventListener('keydown', resetAutoLock);
    });

    const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || function(){};

    return {
      L, screen, walletPassword, confirmPw, pwError, locked,
      wallets, activeIndex, activeWallet, activeAddr, shortAddr,
      activeNetwork, NETWORKS, net, tab,
      balance, balanceLoading, txs, tokens, tokensLoading,
      sendForm, sendError, sendSuccess,
      importKey, importError, showSecretKey,
      showChangePw, changePwForm, changePwError,
      // methods
      unlockWallet, lockWallet, startCreate, startImport,
      confirmPassword, keyConfirmed,
      copySecretKey, copyAddress, copyNewKey,
      refreshBalance, sendSOL, requestAirdrop,
      addAccount, selectAccount, deleteAccount, selectNetwork,
      changePassword, deleteWallet,
      openExplorer, explorerUrl, bs58Encode,
      debouncedSave
    };
  }
})