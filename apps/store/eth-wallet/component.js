({
  setup() {
    const { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } = Vue;
    const ElMessageBox = (window.ElementPlus && window.ElementPlus.ElMessageBox) || { confirm: () => Promise.resolve() };

    const LANGS = {
      tr: {
        title:'ETH Cüzdan',unlock:'Kilit Aç',lock:'Kilitle',create:'Yeni Cüzdan',import:'Cüzdan İçe Aktar',
        password:'Şifre',confirmPassword:'Şifre Tekrar',walletPassword:'Cüzdan Şifresi',
        enterPassword:'Cüzdan şifrenizi girin',setPassword:'Yeni şifre belirleyin',
        wrongPassword:'Yanlış şifre',passwordMismatch:'Şifreler eşleşmiyor',passwordMin:'Şifre en az 6 karakter',
        mnemonic:'Kurtarma Kelimeleri',mnemonicWarning:'Bu kelimeleri güvenli bir yere kaydedin! Bir daha gösterilmeyecek.',
        mnemonicPlaceholder:'12 kelimelik kurtarma ifadesini girin',enterMnemonic:'Kurtarma kelimelerini girin',
        invalidMnemonic:'Geçersiz kurtarma kelimeleri',copied:'Kopyalandı',copy:'Kopyala',
        balance:'Bakiye',send:'Gönder',receive:'Al',history:'İşlemler',nfts:'NFT\'ler',
        toAddress:'Alıcı Adresi',amount:'Miktar',sendETH:'ETH Gönder',sending:'Gönderiliyor...',
        txSuccess:'İşlem gönderildi',txError:'İşlem hatası',
        noTx:'Henüz işlem yok',noNFTs:'NFT bulunamadı',loadingNFTs:'NFT\'ler yükleniyor...',
        network:'Ağ',mainnet:'Mainnet',sepolia:'Sepolia Testnet',goerli:'Goerli Testnet',
        accounts:'Hesaplar',addAccount:'Hesap Ekle',account:'Hesap',
        iSaved:'Kaydettim',back:'Geri',refresh:'Yenile',address:'Adres',
        confirmSend:'göndermek istediğinize emin misiniz?',deleteWallet:'Cüzdanı Sil',
        deleteConfirm:'Cüzdanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!',
        importAccount:'Hesap İçe Aktar',privateKey:'Özel Anahtar',enterPrivateKey:'Özel anahtarı girin',
        viewPhrase:'Kurtarma Kelimeleri',gas:'Gas Ücreti',total:'Toplam',max:'Maks',
        checkExplorer:'Explorer\'da Görüntüle'
      },
      en: {
        title:'ETH Wallet',unlock:'Unlock',lock:'Lock',create:'Create Wallet',import:'Import Wallet',
        password:'Password',confirmPassword:'Confirm Password',walletPassword:'Wallet Password',
        enterPassword:'Enter your wallet password',setPassword:'Set a new password',
        wrongPassword:'Wrong password',passwordMismatch:'Passwords do not match',passwordMin:'Password min 6 chars',
        mnemonic:'Recovery Phrase',mnemonicWarning:'Save these words in a safe place! They will not be shown again.',
        mnemonicPlaceholder:'Enter 12-word recovery phrase',enterMnemonic:'Enter recovery phrase',
        invalidMnemonic:'Invalid recovery phrase',copied:'Copied',copy:'Copy',
        balance:'Balance',send:'Send',receive:'Receive',history:'Transactions',nfts:'NFTs',
        toAddress:'Recipient Address',amount:'Amount',sendETH:'Send ETH',sending:'Sending...',
        txSuccess:'Transaction sent',txError:'Transaction error',
        noTx:'No transactions yet',noNFTs:'No NFTs found',loadingNFTs:'Loading NFTs...',
        network:'Network',mainnet:'Mainnet',sepolia:'Sepolia Testnet',goerli:'Goerli Testnet',
        accounts:'Accounts',addAccount:'Add Account',account:'Account',
        iSaved:'I Saved It',back:'Back',refresh:'Refresh',address:'Address',
        confirmSend:'Are you sure you want to send?',deleteWallet:'Delete Wallet',
        deleteConfirm:'Are you sure you want to delete the wallet? This cannot be undone!',
        importAccount:'Import Account',privateKey:'Private Key',enterPrivateKey:'Enter private key',
        viewPhrase:'Recovery Phrase',gas:'Gas Fee',total:'Total',max:'Max',
        checkExplorer:'View on Explorer'
      },
      de: {
        title:'ETH Wallet',unlock:'Entsperren',lock:'Sperren',create:'Wallet erstellen',import:'Wallet importieren',
        password:'Passwort',confirmPassword:'Passwort bestätigen',walletPassword:'Wallet-Passwort',
        enterPassword:'Geben Sie Ihr Wallet-Passwort ein',setPassword:'Neues Passwort festlegen',
        wrongPassword:'Falsches Passwort',passwordMismatch:'Passwörter stimmen nicht überein',passwordMin:'Passwort min. 6 Zeichen',
        mnemonic:'Wiederherstellungsphrase',mnemonicWarning:'Speichern Sie diese Wörter an einem sicheren Ort!',
        mnemonicPlaceholder:'12-Wort-Wiederherstellungsphrase eingeben',enterMnemonic:'Wiederherstellungsphrase eingeben',
        invalidMnemonic:'Ungültige Wiederherstellungsphrase',copied:'Kopiert',copy:'Kopieren',
        balance:'Guthaben',send:'Senden',receive:'Empfangen',history:'Transaktionen',nfts:'NFTs',
        toAddress:'Empfängeradresse',amount:'Betrag',sendETH:'ETH senden',sending:'Wird gesendet...',
        txSuccess:'Transaktion gesendet',txError:'Transaktionsfehler',
        noTx:'Noch keine Transaktionen',noNFTs:'Keine NFTs gefunden',loadingNFTs:'NFTs werden geladen...',
        network:'Netzwerk',mainnet:'Mainnet',sepolia:'Sepolia Testnet',goerli:'Goerli Testnet',
        accounts:'Konten',addAccount:'Konto hinzufügen',account:'Konto',
        iSaved:'Gespeichert',back:'Zurück',refresh:'Aktualisieren',address:'Adresse',
        confirmSend:'Möchten Sie wirklich senden?',deleteWallet:'Wallet löschen',
        deleteConfirm:'Möchten Sie das Wallet wirklich löschen? Dies kann nicht rückgängig gemacht werden!',
        importAccount:'Konto importieren',privateKey:'Privater Schlüssel',enterPrivateKey:'Privaten Schlüssel eingeben',
        viewPhrase:'Wiederherstellungsphrase',gas:'Gas-Gebühr',total:'Gesamt',max:'Max',
        checkExplorer:'Im Explorer anzeigen'
      },
      fr: {
        title:'Portefeuille ETH',unlock:'Déverrouiller',lock:'Verrouiller',create:'Créer un portefeuille',import:'Importer un portefeuille',
        password:'Mot de passe',confirmPassword:'Confirmer le mot de passe',walletPassword:'Mot de passe du portefeuille',
        enterPassword:'Entrez votre mot de passe',setPassword:'Définir un nouveau mot de passe',
        wrongPassword:'Mot de passe incorrect',passwordMismatch:'Les mots de passe ne correspondent pas',passwordMin:'Mot de passe min 6 caractères',
        mnemonic:'Phrase de récupération',mnemonicWarning:'Sauvegardez ces mots dans un endroit sûr !',
        mnemonicPlaceholder:'Entrez la phrase de récupération de 12 mots',enterMnemonic:'Entrez la phrase de récupération',
        invalidMnemonic:'Phrase de récupération invalide',copied:'Copié',copy:'Copier',
        balance:'Solde',send:'Envoyer',receive:'Recevoir',history:'Transactions',nfts:'NFTs',
        toAddress:'Adresse du destinataire',amount:'Montant',sendETH:'Envoyer ETH',sending:'Envoi...',
        txSuccess:'Transaction envoyée',txError:'Erreur de transaction',
        noTx:'Pas encore de transactions',noNFTs:'Aucun NFT trouvé',loadingNFTs:'Chargement des NFTs...',
        network:'Réseau',mainnet:'Mainnet',sepolia:'Sepolia Testnet',goerli:'Goerli Testnet',
        accounts:'Comptes',addAccount:'Ajouter un compte',account:'Compte',
        iSaved:'J\'ai sauvegardé',back:'Retour',refresh:'Actualiser',address:'Adresse',
        confirmSend:'Êtes-vous sûr de vouloir envoyer ?',deleteWallet:'Supprimer le portefeuille',
        deleteConfirm:'Êtes-vous sûr de vouloir supprimer le portefeuille ? Cette action est irréversible !',
        importAccount:'Importer un compte',privateKey:'Clé privée',enterPrivateKey:'Entrez la clé privée',
        viewPhrase:'Phrase de récupération',gas:'Frais de gas',total:'Total',max:'Max',
        checkExplorer:'Voir sur Explorer'
      },
      es: {
        title:'Billetera ETH',unlock:'Desbloquear',lock:'Bloquear',create:'Crear Billetera',import:'Importar Billetera',
        password:'Contraseña',confirmPassword:'Confirmar Contraseña',walletPassword:'Contraseña de Billetera',
        enterPassword:'Ingrese su contraseña',setPassword:'Establezca una nueva contraseña',
        wrongPassword:'Contraseña incorrecta',passwordMismatch:'Las contraseñas no coinciden',passwordMin:'Contraseña mín. 6 caracteres',
        mnemonic:'Frase de Recuperación',mnemonicWarning:'Guarde estas palabras en un lugar seguro!',
        mnemonicPlaceholder:'Ingrese la frase de recuperación de 12 palabras',enterMnemonic:'Ingrese la frase de recuperación',
        invalidMnemonic:'Frase de recuperación inválida',copied:'Copiado',copy:'Copiar',
        balance:'Saldo',send:'Enviar',receive:'Recibir',history:'Transacciones',nfts:'NFTs',
        toAddress:'Dirección del Destinatario',amount:'Cantidad',sendETH:'Enviar ETH',sending:'Enviando...',
        txSuccess:'Transacción enviada',txError:'Error de transacción',
        noTx:'Sin transacciones aún',noNFTs:'No se encontraron NFTs',loadingNFTs:'Cargando NFTs...',
        network:'Red',mainnet:'Mainnet',sepolia:'Sepolia Testnet',goerli:'Goerli Testnet',
        accounts:'Cuentas',addAccount:'Agregar Cuenta',account:'Cuenta',
        iSaved:'Lo guardé',back:'Atrás',refresh:'Actualizar',address:'Dirección',
        confirmSend:'¿Está seguro de que desea enviar?',deleteWallet:'Eliminar Billetera',
        deleteConfirm:'¿Está seguro de que desea eliminar la billetera? Esta acción no se puede deshacer!',
        importAccount:'Importar Cuenta',privateKey:'Clave Privada',enterPrivateKey:'Ingrese la clave privada',
        viewPhrase:'Frase de Recuperación',gas:'Tarifa de Gas',total:'Total',max:'Máx',
        checkExplorer:'Ver en Explorer'
      },
      ru: {
        title:'ETH Кошелёк',unlock:'Разблокировать',lock:'Заблокировать',create:'Создать кошелёк',import:'Импортировать кошелёк',
        password:'Пароль',confirmPassword:'Подтвердите пароль',walletPassword:'Пароль кошелька',
        enterPassword:'Введите пароль кошелька',setPassword:'Установите новый пароль',
        wrongPassword:'Неверный пароль',passwordMismatch:'Пароли не совпадают',passwordMin:'Пароль мин. 6 символов',
        mnemonic:'Фраза восстановления',mnemonicWarning:'Сохраните эти слова в безопасном месте!',
        mnemonicPlaceholder:'Введите 12-словную фразу восстановления',enterMnemonic:'Введите фразу восстановления',
        invalidMnemonic:'Недействительная фраза восстановления',copied:'Скопировано',copy:'Копировать',
        balance:'Баланс',send:'Отправить',receive:'Получить',history:'Транзакции',nfts:'NFT',
        toAddress:'Адрес получателя',amount:'Сумма',sendETH:'Отправить ETH',sending:'Отправка...',
        txSuccess:'Транзакция отправлена',txError:'Ошибка транзакции',
        noTx:'Пока нет транзакций',noNFTs:'NFT не найдены',loadingNFTs:'Загрузка NFT...',
        network:'Сеть',mainnet:'Mainnet',sepolia:'Sepolia Testnet',goerli:'Goerli Testnet',
        accounts:'Аккаунты',addAccount:'Добавить аккаунт',account:'Аккаунт',
        iSaved:'Я сохранил',back:'Назад',refresh:'Обновить',address:'Адрес',
        confirmSend:'Вы уверены, что хотите отправить?',deleteWallet:'Удалить кошелёк',
        deleteConfirm:'Вы уверены, что хотите удалить кошелёк? Это действие необратимо!',
        importAccount:'Импортировать аккаунт',privateKey:'Приватный ключ',enterPrivateKey:'Введите приватный ключ',
        viewPhrase:'Фраза восстановления',gas:'Комиссия Gas',total:'Всего',max:'Макс',
        checkExplorer:'Смотреть в Explorer'
      },
    zh: { title:'ETH钱包', unlock:'解锁', lock:'锁定', create:'创建', import:'导入', password:'密码', confirmPassword:'确认密码', walletPassword:'钱包密码', enterPassword:'输入密码', setPassword:'设置密码', wrongPassword:'密码错误', passwordMismatch:'密码不一致', passwordMin:'密码至少', mnemonic:'助记词', mnemonicWarning:'助记词警告', mnemonicPlaceholder:'输入助记词', enterMnemonic:'输入助记词', invalidMnemonic:'无效助记词', copied:'已复制', copy:'复制', balance:'余额', send:'发送', receive:'接收', history:'历史', nfts:'NFTs', toAddress:'接收地址', amount:'金额', sendETH:'发送ETH', sending:'发送中', txSuccess:'交易成功', txError:'交易失败', noTx:'无交易记录', noNFTs:'无NFT', loadingNFTs:'加载NFT中', network:'网络', mainnet:'主网', sepolia:'Sepolia', goerli:'Goerli', accounts:'账户', addAccount:'添加账户', account:'账户', iSaved:'已保存', back:'返回', refresh:'刷新', address:'地址', confirmSend:'确认发送', deleteWallet:'删除钱包', deleteConfirm:'确认删除？', importAccount:'导入账户', privateKey:'私钥', enterPrivateKey:'输入私钥', viewPhrase:'查看助记词', gas:'Gas', total:'总计', max:'最大', checkExplorer:'查看浏览器' },
    ja: { title:'ETHウォレット', unlock:'ロック解除', lock:'ロック', create:'作成', import:'インポート', password:'パスワード', confirmPassword:'パスワード確認', walletPassword:'ウォレットパスワード', enterPassword:'パスワード入力', setPassword:'パスワード設定', wrongPassword:'パスワードが違います', passwordMismatch:'パスワード不一致', passwordMin:'パスワード最低', mnemonic:'ニーモニック', mnemonicWarning:'ニーモニック警告', mnemonicPlaceholder:'ニーモニック入力', enterMnemonic:'ニーモニック入力', invalidMnemonic:'無効なニーモニック', copied:'コピー済', copy:'コピー', balance:'残高', send:'送金', receive:'受取', history:'履歴', nfts:'NFTs', toAddress:'送金先アドレス', amount:'金額', sendETH:'ETH送金', sending:'送金中', txSuccess:'送金成功', txError:'送金エラー', noTx:'取引なし', noNFTs:'NFTなし', loadingNFTs:'NFT読込中', network:'ネットワーク', mainnet:'メインネット', sepolia:'Sepolia', goerli:'Goerli', accounts:'アカウント', addAccount:'アカウント追加', account:'アカウント', iSaved:'保存済', back:'戻る', refresh:'更新', address:'アドレス', confirmSend:'送金確認', deleteWallet:'ウォレット削除', deleteConfirm:'削除しますか？', importAccount:'アカウントインポート', privateKey:'秘密鍵', enterPrivateKey:'秘密鍵入力', viewPhrase:'フレーズ表示', gas:'ガス', total:'合計', max:'最大', checkExplorer:'エクスプローラーで確認' },
    it: { title:'Portafoglio ETH', unlock:'Sblocca', lock:'Blocca', create:'Crea', import:'Importa', password:'Password', confirmPassword:'Conferma password', walletPassword:'Password portafoglio', enterPassword:'Inserisci password', setPassword:'Imposta password', wrongPassword:'Password errata', passwordMismatch:'Password non corrispondenti', passwordMin:'Password minima', mnemonic:'Frase mnemonica', mnemonicWarning:'Avviso frase mnemonica', mnemonicPlaceholder:'Inserisci frase', enterMnemonic:'Inserisci frase', invalidMnemonic:'Frase non valida', copied:'Copiato', copy:'Copia', balance:'Saldo', send:'Invia', receive:'Ricevi', history:'Cronologia', nfts:'NFTs', toAddress:'Indirizzo destinatario', amount:'Importo', sendETH:'Invia ETH', sending:'Invio in corso', txSuccess:'Transazione riuscita', txError:'Errore transazione', noTx:'Nessuna transazione', noNFTs:'Nessun NFT', loadingNFTs:'Caricamento NFT', network:'Rete', mainnet:'Mainnet', sepolia:'Sepolia', goerli:'Goerli', accounts:'Account', addAccount:'Aggiungi account', account:'Account', iSaved:'Salvato', back:'Indietro', refresh:'Aggiorna', address:'Indirizzo', confirmSend:'Conferma invio', deleteWallet:'Elimina portafoglio', deleteConfirm:'Confermi eliminazione?', importAccount:'Importa account', privateKey:'Chiave privata', enterPrivateKey:'Inserisci chiave privata', viewPhrase:'Mostra frase', gas:'Gas', total:'Totale', max:'Massimo', checkExplorer:'Verifica su explorer' }
  };

    function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }
    const locale = ref(getLocale());
    function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
    function getToken() { try { return localStorage.getItem('auth_token') || ''; } catch { return ''; } }
    function authHeaders() { return { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }

    // Networks
    const NETWORKS = {
      mainnet: { name: 'Ethereum Mainnet', rpc: 'https://eth.llamarpc.com', chainId: 1, explorer: 'https://etherscan.io', symbol: 'ETH' },
      sepolia: { name: 'Sepolia Testnet', rpc: 'https://rpc.sepolia.org', chainId: 11155111, explorer: 'https://sepolia.etherscan.io', symbol: 'ETH' },
      goerli: { name: 'Goerli Testnet', rpc: 'https://rpc.ankr.com/eth_goerli', chainId: 5, explorer: 'https://goerli.etherscan.io', symbol: 'ETH' }
    };

    // State
    const screen = ref('loading'); // loading, setup, unlock, create-password, show-phrase, main
    const walletExists = ref(false);
    const walletPassword = ref('');
    const confirmPw = ref('');
    const pwError = ref('');
    const locked = ref(true);

    // Wallet data (decrypted in memory)
    const wallets = ref([]);
    const activeIndex = ref(0);
    const contacts = ref([]);
    const activeNetwork = ref('mainnet');

    // UI state
    const tab = ref('balance');
    const balance = ref('0');
    const balanceLoading = ref(false);
    const txs = ref([]);
    const nfts = ref([]);
    const nftLoading = ref(false);

    // Send form
    const sendForm = reactive({ to: '', amount: '', sending: false });
    const sendError = ref('');
    const sendSuccess = ref('');

    // Create/import
    const newMnemonic = ref('');
    const importPhrase = ref('');
    const importError = ref('');
    const importPkMode = ref(false);
    const importPk = ref('');

    // Show phrase
    const showPhraseConfirm = ref(false);
    const phrasePassword = ref('');
    const phraseVisible = ref(false);
    const phraseWords = ref('');

    // Account selector
    const showAccountMenu = ref(false);
    const showNetworkMenu = ref(false);

    const activeWallet = computed(() => wallets.value[activeIndex.value] || null);
    const activeAddr = computed(() => activeWallet.value ? activeWallet.value.address : '');
    const shortAddr = computed(() => {
      const a = activeAddr.value;
      return a ? a.slice(0, 6) + '...' + a.slice(-4) : '';
    });
    const net = computed(() => NETWORKS[activeNetwork.value] || NETWORKS.mainnet);

    function getProvider() {
      return new ethers.JsonRpcProvider(net.value.rpc);
    }

    function getSigner() {
      if (!activeWallet.value) return null;
      const provider = getProvider();
      return new ethers.Wallet(activeWallet.value.privateKey, provider);
    }

    // Check if wallet exists on server
    async function checkExists() {
      try {
        const r = await fetch('/api/ethwallet/exists', { headers: authHeaders() });
        const d = await r.json();
        walletExists.value = d.exists;
        screen.value = d.exists ? 'unlock' : 'setup';
      } catch { screen.value = 'setup'; }
    }

    // Unlock with password
    async function unlockWallet() {
      if (!walletPassword.value) { pwError.value = L('passwordMin'); return; }
      try {
        const r = await fetch('/api/ethwallet/unlock', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({ walletPassword: walletPassword.value })
        });
        if (!r.ok) { pwError.value = L('wrongPassword'); return; }
        const data = await r.json();
        wallets.value = data.wallets || [];
        activeIndex.value = data.activeIndex || 0;
        contacts.value = data.contacts || [];
        if (wallets.value.length === 0) { screen.value = 'setup'; return; }
        locked.value = false;
        screen.value = 'main';
        pwError.value = '';
        await refreshBalance();
      } catch (e) { pwError.value = L('wrongPassword'); }
    }

    // Save encrypted to server
    async function saveToServer() {
      try {
        await fetch('/api/ethwallet/save', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({
            walletPassword: walletPassword.value,
            wallets: wallets.value.map(w => ({
              address: w.address, privateKey: w.privateKey, mnemonic: w.mnemonic || '',
              name: w.name, imported: w.imported || false
            })),
            activeIndex: activeIndex.value,
            contacts: contacts.value
          })
        });
      } catch (e) { console.error('Save wallet error', e); }
    }

    // Create new wallet
    function startCreate() {
      screen.value = 'create-password';
      walletPassword.value = '';
      confirmPw.value = '';
      pwError.value = '';
    }

    function startImport() {
      importPhrase.value = '';
      importPk.value = '';
      importError.value = '';
      importPkMode.value = false;
      screen.value = 'import';
      walletPassword.value = '';
      confirmPw.value = '';
      pwError.value = '';
    }

    function confirmPassword() {
      if (walletPassword.value.length < 6) { pwError.value = L('passwordMin'); return; }
      if (walletPassword.value !== confirmPw.value) { pwError.value = L('passwordMismatch'); return; }
      pwError.value = '';

      if (screen.value === 'create-password') {
        // Generate new HD wallet
        const mnemonic = ethers.Mnemonic.fromEntropy(ethers.randomBytes(16));
        const hdNode = ethers.HDNodeWallet.fromMnemonic(mnemonic);
        newMnemonic.value = mnemonic.phrase;
        wallets.value = [{
          address: hdNode.address,
          privateKey: hdNode.privateKey,
          mnemonic: mnemonic.phrase,
          name: L('account') + ' 1',
          imported: false
        }];
        activeIndex.value = 0;
        screen.value = 'show-phrase';
      } else if (screen.value === 'import') {
        doImport();
      }
    }

    function phraseConfirmed() {
      locked.value = false;
      screen.value = 'main';
      saveToServer();
      refreshBalance();
    }

    function doImport() {
      try {
        if (importPkMode.value) {
          let pk = importPk.value.trim();
          if (!pk.startsWith('0x')) pk = '0x' + pk;
          const w = new ethers.Wallet(pk);
          wallets.value = [{
            address: w.address, privateKey: w.privateKey, mnemonic: '',
            name: L('account') + ' 1', imported: true
          }];
        } else {
          const phrase = importPhrase.value.trim().toLowerCase();
          const mn = ethers.Mnemonic.fromPhrase(phrase);
          const hdNode = ethers.HDNodeWallet.fromMnemonic(mn);
          wallets.value = [{
            address: hdNode.address, privateKey: hdNode.privateKey, mnemonic: phrase,
            name: L('account') + ' 1', imported: false
          }];
        }
        activeIndex.value = 0;
        locked.value = false;
        screen.value = 'main';
        saveToServer();
        refreshBalance();
      } catch (e) {
        importError.value = importPkMode.value ? L('txError') : L('invalidMnemonic');
      }
    }

    // Add derived account
    function addAccount() {
      const mainWallet = wallets.value.find(w => w.mnemonic);
      if (!mainWallet) return;
      try {
        const mn = ethers.Mnemonic.fromPhrase(mainWallet.mnemonic);
        const idx = wallets.value.length;
        const hdNode = ethers.HDNodeWallet.fromMnemonic(mn, "m/44'/60'/0'/0/" + idx);
        wallets.value.push({
          address: hdNode.address, privateKey: hdNode.privateKey, mnemonic: '',
          name: L('account') + ' ' + (idx + 1), imported: false
        });
        activeIndex.value = idx;
        showAccountMenu.value = false;
        saveToServer();
        refreshBalance();
      } catch (e) { console.error('Add account error', e); }
    }

    function selectAccount(idx) {
      if (idx === 'add') { addAccount(); return; }
      activeIndex.value = idx;
      showAccountMenu.value = false;
      saveToServer();
      refreshBalance();
    }

    function copyMnemonic() {
      navigator.clipboard.writeText(newMnemonic.value);
    }

    function selectNetwork(key) {
      activeNetwork.value = key;
      showNetworkMenu.value = false;
      refreshBalance();
    }

    // Balance
    async function refreshBalance() {
      if (!activeAddr.value) return;
      balanceLoading.value = true;
      try {
        const provider = getProvider();
        const raw = await provider.getBalance(activeAddr.value);
        balance.value = ethers.formatEther(raw);
      } catch (e) { balance.value = '?'; console.error('Balance error', e); }
      balanceLoading.value = false;
    }

    // Send
    async function sendETH() {
      if (!sendForm.to || !sendForm.amount) return;
      try { await ElMessageBox.confirm(sendForm.amount + ' ETH → ' + sendForm.to, L('confirmSend'), { confirmButtonText: 'OK', cancelButtonText: L('cancel') || 'Cancel', type: 'warning' }); } catch { return; }
      sendForm.sending = true;
      sendError.value = '';
      sendSuccess.value = '';
      try {
        const signer = getSigner();
        const tx = await signer.sendTransaction({
          to: sendForm.to,
          value: ethers.parseEther(sendForm.amount)
        });
        sendSuccess.value = L('txSuccess') + ': ' + tx.hash.slice(0, 14) + '...';
        sendForm.to = '';
        sendForm.amount = '';
        setTimeout(refreshBalance, 5000);
      } catch (e) {
        sendError.value = L('txError') + ': ' + (e.shortMessage || e.message || '').slice(0, 100);
      }
      sendForm.sending = false;
    }

    // NFTs (via Alchemy-compatible or public API)
    async function loadNFTs() {
      if (!activeAddr.value) return;
      nftLoading.value = true;
      nfts.value = [];
      try {
        // Basic ERC-721 detection via etherscan API (limited but works without API key)
        const url = net.value.explorer + '/api?module=account&action=tokennfttx&address=' +
          activeAddr.value + '&page=1&offset=50&sort=desc';
        const r = await fetch(url);
        const data = await r.json();
        if (data.result && Array.isArray(data.result)) {
          const seen = new Set();
          const items = [];
          for (const tx of data.result) {
            if (tx.to && tx.to.toLowerCase() === activeAddr.value.toLowerCase()) {
              const key = tx.contractAddress + ':' + tx.tokenID;
              if (!seen.has(key)) {
                seen.add(key);
                items.push({
                  contract: tx.contractAddress,
                  tokenId: tx.tokenID,
                  name: tx.tokenName || 'NFT',
                  symbol: tx.tokenSymbol || '',
                  from: tx.from
                });
              }
            }
          }
          // Filter out transferred-out ones
          if (data.result) {
            for (const tx of data.result) {
              if (tx.from && tx.from.toLowerCase() === activeAddr.value.toLowerCase()) {
                const key = tx.contractAddress + ':' + tx.tokenID;
                seen.delete(key);
              }
            }
          }
          nfts.value = items.filter(i => seen.has(i.contract + ':' + i.tokenId));
        }
      } catch (e) { console.error('NFT load error', e); }
      nftLoading.value = false;
    }

    // Transactions
    async function loadTxHistory() {
      if (!activeAddr.value) return;
      txs.value = [];
      try {
        const url = net.value.explorer + '/api?module=account&action=txlist&address=' +
          activeAddr.value + '&page=1&offset=20&sort=desc';
        const r = await fetch(url);
        const data = await r.json();
        if (data.result && Array.isArray(data.result)) {
          txs.value = data.result.map(tx => ({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: ethers.formatEther(tx.value || '0'),
            time: new Date(parseInt(tx.timeStamp) * 1000).toLocaleString(),
            isIn: tx.to && tx.to.toLowerCase() === activeAddr.value.toLowerCase(),
            status: tx.isError === '0' ? 'ok' : 'fail'
          }));
        }
      } catch (e) { console.error('TX history error', e); }
    }

    function copyAddress() {
      navigator.clipboard.writeText(activeAddr.value);
    }

    function lockWallet() {
      locked.value = true;
      wallets.value = [];
      walletPassword.value = '';
      balance.value = '0';
      txs.value = [];
      nfts.value = [];
      screen.value = 'unlock';
    }

    async function deleteWallet() {
      try { await ElMessageBox.confirm(L('deleteConfirm'), { confirmButtonText: 'OK', cancelButtonText: L('cancel') || 'Cancel', type: 'warning' }); } catch { return; }
      wallets.value = [];
      walletPassword.value = '';
      locked.value = true;
      balance.value = '0';
      // Save empty state
      fetch('/api/ethwallet/save', {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ walletPassword: 'delete', wallets: [], activeIndex: 0, contacts: [] })
      }).catch(() => {});
      screen.value = 'setup';
    }

    function viewOnExplorer(hash) {
      window.open(net.value.explorer + '/tx/' + hash, '_blank');
    }

    function viewNFTOnExplorer(contract, tokenId) {
      window.open(net.value.explorer + '/token/' + contract + '?a=' + tokenId, '_blank');
    }

    // Show recovery phrase (requires password)
    function requestShowPhrase() {
      phrasePassword.value = '';
      phraseVisible.value = false;
      showPhraseConfirm.value = true;
    }
    async function confirmShowPhrase() {
      try {
        const r = await fetch('/api/ethwallet/unlock', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({ walletPassword: phrasePassword.value })
        });
        if (!r.ok) { pwError.value = L('wrongPassword'); return; }
        const data = await r.json();
        const main = (data.wallets || []).find(w => w.mnemonic);
        phraseWords.value = main ? main.mnemonic : '';
        phraseVisible.value = true;
        pwError.value = '';
      } catch { pwError.value = L('wrongPassword'); }
    }
    function closeShowPhrase() {
      showPhraseConfirm.value = false;
      phraseVisible.value = false;
      phraseWords.value = '';
      phrasePassword.value = '';
    }

    // Watch tab changes
    watch(tab, (v) => {
      if (v === 'nfts') loadNFTs();
      if (v === 'history') loadTxHistory();
    });

    function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }
    onMounted(async () => {
      window.addEventListener('locale-changed', onLocaleChanged);
      await checkExists();
    });
    onUnmounted(() => { window.removeEventListener('locale-changed', onLocaleChanged); });

    return {
      L, screen, walletExists, walletPassword, confirmPw, pwError, locked,
      wallets, activeIndex, activeWallet, activeAddr, shortAddr, contacts, activeNetwork,
      tab, balance, balanceLoading, txs, nfts, nftLoading,
      sendForm, sendError, sendSuccess,
      newMnemonic, importPhrase, importError, importPkMode, importPk,
      showPhraseConfirm, phrasePassword, phraseVisible, phraseWords,
      showAccountMenu, showNetworkMenu, net, NETWORKS,
      startCreate, startImport, confirmPassword, phraseConfirmed, doImport,
      unlockWallet, lockWallet, addAccount, selectAccount, selectNetwork,
      refreshBalance, sendETH, loadNFTs, loadTxHistory,
      copyAddress, copyMnemonic, deleteWallet, viewOnExplorer, viewNFTOnExplorer,
      requestShowPhrase, confirmShowPhrase, closeShowPhrase
    };
  }
})
