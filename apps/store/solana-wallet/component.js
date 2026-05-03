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
        sol:'SOL',lamports:'Lamports'
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
        sol:'SOL',lamports:'Lamports'
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
        sol:'SOL',lamports:'Lamports'
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
        sol:'SOL',lamports:'Lamports'
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
        sol:'SOL',lamports:'Lamports'
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
        sol:'SOL',lamports:'Lamports'
      }
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