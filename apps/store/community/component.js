({
  setup() {
    const { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } = Vue;

    // ═══════════════════════════════════════════════════
    // CONSTANTS
    // ═══════════════════════════════════════════════════
    const HUB_URL = 'wss://community.aysi.net';
    const HUB_HTTP = 'https://community.aysi.net';
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const ALLOWED_EXTENSIONS = ['jpg','jpeg','png','gif','webp','pdf','txt','md','zip','7z'];
    const BANNED_NICKNAMES = ['admin','moderator','system','bot','null','undefined'];
    const NICK_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
    const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 15000, 30000];
    const HEARTBEAT_INTERVAL = 120000;
    const AVATAR_EMOJIS = [
      '🦊','🐱','🐻','🦁','🐼','🐨','🦄','🐲',
      '🎮','🎯','🎨','🎵','🚀','⚡','🔥','💎',
      '🌙','🌈','🍀','🎃','🎪','🏆','👾','🤖',
      '🦅','🐬','🦋','🐝','🐺','🦜','🐙','🐧'
    ];
    const CHAT_ROOMS = [
      { id: 'lobby', icon: '🏠', nameKey: 'roomLobby' },
      { id: 'random', icon: '🎲', nameKey: 'roomRandom' },
      { id: 'games', icon: '🎮', nameKey: 'roomGames' },
      { id: 'help', icon: '❓', nameKey: 'roomHelp' },
      { id: 'turkce', icon: '🇹🇷', nameKey: 'roomTurkce' },
      { id: 'english', icon: '🇬🇧', nameKey: 'roomEnglish' }
    ];
    const FORUM_CATS = [
      { id: 'genel', icon: '💬', nameKey: 'forumGeneral' },
      { id: 'soru', icon: '❓', nameKey: 'forumQA' },
      { id: 'oneriler', icon: '💡', nameKey: 'forumSuggestions' },
      { id: 'hatalar', icon: '🐛', nameKey: 'forumBugs' },
      { id: 'oyunlar', icon: '🎮', nameKey: 'forumGamesTopic' },
      { id: 'paylasim', icon: '📸', nameKey: 'forumSharing' },
      { id: 'duyuru', icon: '📢', nameKey: 'forumAnnouncements' }
    ];
    const GAME_TYPES = [
      { id: 'tictactoe', icon: '❌', nameKey: 'gameTTT', descKey: 'gameTTTDesc' },
      { id: 'rps', icon: '✊', nameKey: 'gameRPS', descKey: 'gameRPSDesc' },
      { id: 'chess', icon: '♟️', nameKey: 'gameChess', descKey: 'gameChessDesc' },
      { id: 'backgammon', icon: '🎲', nameKey: 'gameBG', descKey: 'gameBGDesc' }
    ];

    // ═══════════════════════════════════════════════════
    // LANGS
    // ═══════════════════════════════════════════════════
    const LANGS = {
      tr: {
        setupTitle:'Topluluğa Hoş Geldin!', setupSubtitle:'Kendine bir profil oluştur',
        nickname:'Takma Ad', nickPlaceholder:'GamerTR42', nickAvailable:'✅ Müsait', nickTaken:'❌ Bu isim alınmış', nickChecking:'⏳ Kontrol ediliyor...',
        avatar:'Avatar', uploadAvatar:'Özel Resim Yükle', customAvatarSet:'Özel avatar yüklendi',
        bio:'Hakkımda', bioPlaceholder:'Kısa bir tanıtım...', joinCommunity:'Topluluğa Katıl',
        connecting:'Bağlanıyor...', connected:'Bağlı', reconnecting:'Yeniden bağlanıyor', disconnected:'Bağlantı kesildi',
        chat:'SOHBET', dm:'ÖZEL MESAJ', forum:'FORUM', games:'OYUNLAR', users:'KİŞİLER', settings:'Ayarlar',
        online:'çevrimiçi', send:'Gönder', msgPlaceholder:'Mesajınızı yazın...', noMessages:'Henüz mesaj yok',
        noDm:'Henüz özel mesaj yok', noDmMessages:'Mesaj yok', sendDm:'Mesaj Gönder',
        attach:'Dosya ekle', newThread:'Yeni Başlık', threadTitle:'Başlık', content:'İçerik',
        create:'Oluştur', cancel:'İptal', replies:'yanıt', views:'görüntüleme', noThreads:'Henüz başlık yok',
        replyPlaceholder:'Yanıtınızı yazın... (Ctrl+Enter ile gönder)', profile:'Profil',
        profileSettings:'Profil Ayarları', status:'Durum', save:'Kaydet',
        stats:'İstatistikler', wins:'Galibiyet', losses:'Mağlubiyet', draws:'Berabere', posts:'Gönderi',
        openGames:'Açık Oyunlar', join:'Katıl', waitingOpponent:'Rakip bekleniyor...',
        game:'Oyun', resign:'Teslim Ol', drawOffer:'Berabere Teklif', drawOfferReceived:'Rakibiniz berabere teklif ediyor',
        accept:'Kabul Et', decline:'Reddet',
        rpsChoose:'Seçiminizi yapın', rpsOpponentChose:'Rakip seçim yaptı, sonuç bekleniyor...',
        roll:'Zar At', onlineUsers:'Çevrimiçi Kullanıcılar',
        roomLobby:'Lobi', roomRandom:'Rastgele', roomGames:'Oyunlar', roomHelp:'Yardım', roomTurkce:'Türkçe', roomEnglish:'English',
        forumGeneral:'Genel Tartışma', forumQA:'Soru-Cevap', forumSuggestions:'Öneriler', forumBugs:'Hata Raporları',
        forumGamesTopic:'Oyun Tartışmaları', forumSharing:'Paylaşımlar', forumAnnouncements:'Duyurular',
        gameTTT:'XOX', gameTTTDesc:'Klasik 3x3, 2 kişi', gameRPS:'Taş-Kağıt-Makas', gameRPSDesc:'Hızlı tur, 2 kişi',
        gameChess:'Satranç', gameChessDesc:'Klasik satranç, 2 kişi', gameBG:'Tavla', gameBGDesc:'Klasik tavla, 2 kişi',
        yourTurn:'Sıra sizde', opponentTurn:'Rakibin sırası', youWin:'Kazandınız! 🎉', youLose:'Kaybettiniz', draw:'Berabere!',
        fileTooLarge:'Dosya çok büyük (maks 5MB)', invalidFileType:'Bu dosya türü desteklenmiyor',
        profileUpdated:'Profil güncellendi', nickInvalid:'Geçersiz takma ad (3-20 karakter, harf/rakam/_)'
      },
      en: {
        setupTitle:'Welcome to Community!', setupSubtitle:'Create your profile',
        nickname:'Nickname', nickPlaceholder:'GamerTR42', nickAvailable:'✅ Available', nickTaken:'❌ Already taken', nickChecking:'⏳ Checking...',
        avatar:'Avatar', uploadAvatar:'Upload Custom Image', customAvatarSet:'Custom avatar set',
        bio:'About me', bioPlaceholder:'A short intro...', joinCommunity:'Join Community',
        connecting:'Connecting...', connected:'Connected', reconnecting:'Reconnecting', disconnected:'Disconnected',
        chat:'CHAT', dm:'DIRECT MESSAGES', forum:'FORUM', games:'GAMES', users:'USERS', settings:'Settings',
        online:'online', send:'Send', msgPlaceholder:'Type your message...', noMessages:'No messages yet',
        noDm:'No direct messages yet', noDmMessages:'No messages', sendDm:'Send Message',
        attach:'Attach file', newThread:'New Thread', threadTitle:'Title', content:'Content',
        create:'Create', cancel:'Cancel', replies:'replies', views:'views', noThreads:'No threads yet',
        replyPlaceholder:'Write your reply... (Ctrl+Enter to send)', profile:'Profile',
        profileSettings:'Profile Settings', status:'Status', save:'Save',
        stats:'Statistics', wins:'Wins', losses:'Losses', draws:'Draws', posts:'Posts',
        openGames:'Open Games', join:'Join', waitingOpponent:'Waiting for opponent...',
        game:'Game', resign:'Resign', drawOffer:'Offer Draw', drawOfferReceived:'Your opponent offers a draw',
        accept:'Accept', decline:'Decline',
        rpsChoose:'Make your choice', rpsOpponentChose:'Opponent has chosen, waiting for result...',
        roll:'Roll Dice', onlineUsers:'Online Users',
        roomLobby:'Lobby', roomRandom:'Random', roomGames:'Games', roomHelp:'Help', roomTurkce:'Türkçe', roomEnglish:'English',
        forumGeneral:'General Discussion', forumQA:'Q&A', forumSuggestions:'Suggestions', forumBugs:'Bug Reports',
        forumGamesTopic:'Game Discussions', forumSharing:'Sharing', forumAnnouncements:'Announcements',
        gameTTT:'Tic-Tac-Toe', gameTTTDesc:'Classic 3x3, 2 players', gameRPS:'Rock-Paper-Scissors', gameRPSDesc:'Quick round, 2 players',
        gameChess:'Chess', gameChessDesc:'Classic chess, 2 players', gameBG:'Backgammon', gameBGDesc:'Classic backgammon, 2 players',
        yourTurn:'Your turn', opponentTurn:"Opponent's turn", youWin:'You win! 🎉', youLose:'You lose', draw:'Draw!',
        fileTooLarge:'File too large (max 5MB)', invalidFileType:'File type not supported',
        profileUpdated:'Profile updated', nickInvalid:'Invalid nickname (3-20 chars, letters/numbers/_)'
      },
      de: {
        setupTitle:'Willkommen in der Community!', setupSubtitle:'Erstelle dein Profil',
        nickname:'Spitzname', nickPlaceholder:'GamerTR42', nickAvailable:'✅ Verfügbar', nickTaken:'❌ Bereits vergeben', nickChecking:'⏳ Prüfe...',
        avatar:'Avatar', uploadAvatar:'Bild hochladen', customAvatarSet:'Avatar gesetzt',
        bio:'Über mich', bioPlaceholder:'Kurze Beschreibung...', joinCommunity:'Community beitreten',
        connecting:'Verbinde...', connected:'Verbunden', reconnecting:'Neu verbinden', disconnected:'Getrennt',
        chat:'CHAT', dm:'DIREKTNACHRICHTEN', forum:'FORUM', games:'SPIELE', users:'BENUTZER', settings:'Einstellungen',
        online:'online', send:'Senden', msgPlaceholder:'Nachricht eingeben...', noMessages:'Noch keine Nachrichten',
        noDm:'Noch keine Direktnachrichten', noDmMessages:'Keine Nachrichten', sendDm:'Nachricht senden',
        attach:'Datei anhängen', newThread:'Neues Thema', threadTitle:'Titel', content:'Inhalt',
        create:'Erstellen', cancel:'Abbrechen', replies:'Antworten', views:'Aufrufe', noThreads:'Noch keine Themen',
        replyPlaceholder:'Antwort schreiben... (Strg+Enter zum Senden)', profile:'Profil',
        profileSettings:'Profileinstellungen', status:'Status', save:'Speichern',
        stats:'Statistiken', wins:'Siege', losses:'Niederlagen', draws:'Unentschieden', posts:'Beiträge',
        openGames:'Offene Spiele', join:'Beitreten', waitingOpponent:'Warte auf Gegner...',
        game:'Spiel', resign:'Aufgeben', drawOffer:'Remis anbieten', drawOfferReceived:'Ihr Gegner bietet Remis an',
        accept:'Akzeptieren', decline:'Ablehnen',
        rpsChoose:'Triff deine Wahl', rpsOpponentChose:'Gegner hat gewählt...',
        roll:'Würfeln', onlineUsers:'Online-Benutzer',
        roomLobby:'Lobby', roomRandom:'Zufällig', roomGames:'Spiele', roomHelp:'Hilfe', roomTurkce:'Türkçe', roomEnglish:'English',
        forumGeneral:'Allgemein', forumQA:'Fragen', forumSuggestions:'Vorschläge', forumBugs:'Fehlerberichte',
        forumGamesTopic:'Spielthemen', forumSharing:'Teilen', forumAnnouncements:'Ankündigungen',
        gameTTT:'XOX', gameTTTDesc:'Klassisch 3x3', gameRPS:'Schere-Stein-Papier', gameRPSDesc:'Schnelle Runde',
        gameChess:'Schach', gameChessDesc:'Klassisches Schach', gameBG:'Backgammon', gameBGDesc:'Klassisches Backgammon',
        yourTurn:'Du bist dran', opponentTurn:'Gegner ist dran', youWin:'Gewonnen! 🎉', youLose:'Verloren', draw:'Unentschieden!',
        fileTooLarge:'Datei zu groß (max 5MB)', invalidFileType:'Dateityp nicht unterstützt',
        profileUpdated:'Profil aktualisiert', nickInvalid:'Ungültiger Name (3-20 Zeichen)'
      },
      fr: {
        setupTitle:'Bienvenue dans la Communauté!', setupSubtitle:'Créez votre profil',
        nickname:'Pseudo', nickPlaceholder:'GamerTR42', nickAvailable:'✅ Disponible', nickTaken:'❌ Déjà pris', nickChecking:'⏳ Vérification...',
        avatar:'Avatar', uploadAvatar:'Charger une image', customAvatarSet:'Avatar personnalisé défini',
        bio:'À propos', bioPlaceholder:'Courte présentation...', joinCommunity:'Rejoindre',
        connecting:'Connexion...', connected:'Connecté', reconnecting:'Reconnexion', disconnected:'Déconnecté',
        chat:'CHAT', dm:'MESSAGES PRIVÉS', forum:'FORUM', games:'JEUX', users:'UTILISATEURS', settings:'Paramètres',
        online:'en ligne', send:'Envoyer', msgPlaceholder:'Tapez votre message...', noMessages:'Aucun message',
        noDm:'Pas de messages privés', noDmMessages:'Aucun message', sendDm:'Envoyer un message',
        attach:'Joindre', newThread:'Nouveau sujet', threadTitle:'Titre', content:'Contenu',
        create:'Créer', cancel:'Annuler', replies:'réponses', views:'vues', noThreads:'Aucun sujet',
        replyPlaceholder:'Votre réponse... (Ctrl+Entrée)', profile:'Profil',
        profileSettings:'Paramètres du profil', status:'Statut', save:'Enregistrer',
        stats:'Statistiques', wins:'Victoires', losses:'Défaites', draws:'Nuls', posts:'Posts',
        openGames:'Parties ouvertes', join:'Rejoindre', waitingOpponent:'En attente d\'un adversaire...',
        game:'Jeu', resign:'Abandonner', drawOffer:'Proposer nul', drawOfferReceived:'Votre adversaire propose le nul',
        accept:'Accepter', decline:'Refuser',
        rpsChoose:'Faites votre choix', rpsOpponentChose:'L\'adversaire a choisi...',
        roll:'Lancer les dés', onlineUsers:'Utilisateurs en ligne',
        roomLobby:'Salon', roomRandom:'Aléatoire', roomGames:'Jeux', roomHelp:'Aide', roomTurkce:'Türkçe', roomEnglish:'English',
        forumGeneral:'Discussion générale', forumQA:'Questions', forumSuggestions:'Suggestions', forumBugs:'Bugs',
        forumGamesTopic:'Discussions jeux', forumSharing:'Partages', forumAnnouncements:'Annonces',
        gameTTT:'Morpion', gameTTTDesc:'Classique 3x3', gameRPS:'Pierre-Feuille-Ciseaux', gameRPSDesc:'Tour rapide',
        gameChess:'Échecs', gameChessDesc:'Échecs classiques', gameBG:'Backgammon', gameBGDesc:'Backgammon classique',
        yourTurn:'Votre tour', opponentTurn:'Tour adverse', youWin:'Victoire! 🎉', youLose:'Défaite', draw:'Match nul!',
        fileTooLarge:'Fichier trop volumineux (max 5Mo)', invalidFileType:'Type de fichier non supporté',
        profileUpdated:'Profil mis à jour', nickInvalid:'Pseudo invalide (3-20 caractères)'
      },
      es: {
        setupTitle:'¡Bienvenido a la Comunidad!', setupSubtitle:'Crea tu perfil',
        nickname:'Apodo', nickPlaceholder:'GamerTR42', nickAvailable:'✅ Disponible', nickTaken:'❌ Ya ocupado', nickChecking:'⏳ Verificando...',
        avatar:'Avatar', uploadAvatar:'Subir imagen', customAvatarSet:'Avatar personalizado',
        bio:'Sobre mí', bioPlaceholder:'Breve presentación...', joinCommunity:'Unirse',
        connecting:'Conectando...', connected:'Conectado', reconnecting:'Reconectando', disconnected:'Desconectado',
        chat:'CHAT', dm:'MENSAJES DIRECTOS', forum:'FORO', games:'JUEGOS', users:'USUARIOS', settings:'Ajustes',
        online:'en línea', send:'Enviar', msgPlaceholder:'Escriba su mensaje...', noMessages:'Sin mensajes',
        noDm:'Sin mensajes directos', noDmMessages:'Sin mensajes', sendDm:'Enviar mensaje',
        attach:'Adjuntar', newThread:'Nuevo tema', threadTitle:'Título', content:'Contenido',
        create:'Crear', cancel:'Cancelar', replies:'respuestas', views:'vistas', noThreads:'Sin temas',
        replyPlaceholder:'Escriba su respuesta... (Ctrl+Enter)', profile:'Perfil',
        profileSettings:'Ajustes de perfil', status:'Estado', save:'Guardar',
        stats:'Estadísticas', wins:'Victorias', losses:'Derrotas', draws:'Empates', posts:'Posts',
        openGames:'Partidas abiertas', join:'Unirse', waitingOpponent:'Esperando rival...',
        game:'Juego', resign:'Rendirse', drawOffer:'Ofrecer empate', drawOfferReceived:'Tu rival ofrece empate',
        accept:'Aceptar', decline:'Rechazar',
        rpsChoose:'Elige', rpsOpponentChose:'El rival ha elegido...',
        roll:'Tirar dados', onlineUsers:'Usuarios en línea',
        roomLobby:'Lobby', roomRandom:'Aleatorio', roomGames:'Juegos', roomHelp:'Ayuda', roomTurkce:'Türkçe', roomEnglish:'English',
        forumGeneral:'Discusión general', forumQA:'Preguntas', forumSuggestions:'Sugerencias', forumBugs:'Errores',
        forumGamesTopic:'Juegos', forumSharing:'Compartir', forumAnnouncements:'Anuncios',
        gameTTT:'Tres en raya', gameTTTDesc:'Clásico 3x3', gameRPS:'Piedra-Papel-Tijera', gameRPSDesc:'Ronda rápida',
        gameChess:'Ajedrez', gameChessDesc:'Ajedrez clásico', gameBG:'Backgammon', gameBGDesc:'Backgammon clásico',
        yourTurn:'Tu turno', opponentTurn:'Turno rival', youWin:'¡Ganaste! 🎉', youLose:'Perdiste', draw:'¡Empate!',
        fileTooLarge:'Archivo muy grande (máx 5MB)', invalidFileType:'Tipo no soportado',
        profileUpdated:'Perfil actualizado', nickInvalid:'Apodo inválido (3-20 caracteres)'
      },
      ru: {
        setupTitle:'Добро пожаловать!', setupSubtitle:'Создайте свой профиль',
        nickname:'Никнейм', nickPlaceholder:'GamerTR42', nickAvailable:'✅ Доступен', nickTaken:'❌ Занят', nickChecking:'⏳ Проверка...',
        avatar:'Аватар', uploadAvatar:'Загрузить изображение', customAvatarSet:'Аватар установлен',
        bio:'О себе', bioPlaceholder:'Кратко о себе...', joinCommunity:'Присоединиться',
        connecting:'Подключение...', connected:'Подключён', reconnecting:'Переподключение', disconnected:'Отключён',
        chat:'ЧАТ', dm:'ЛИЧНЫЕ СООБЩЕНИЯ', forum:'ФОРУМ', games:'ИГРЫ', users:'ПОЛЬЗОВАТЕЛИ', settings:'Настройки',
        online:'онлайн', send:'Отправить', msgPlaceholder:'Введите сообщение...', noMessages:'Нет сообщений',
        noDm:'Нет личных сообщений', noDmMessages:'Нет сообщений', sendDm:'Написать',
        attach:'Прикрепить', newThread:'Новая тема', threadTitle:'Заголовок', content:'Содержание',
        create:'Создать', cancel:'Отмена', replies:'ответов', views:'просм.', noThreads:'Нет тем',
        replyPlaceholder:'Ваш ответ... (Ctrl+Enter)', profile:'Профиль',
        profileSettings:'Настройки профиля', status:'Статус', save:'Сохранить',
        stats:'Статистика', wins:'Победы', losses:'Поражения', draws:'Ничьи', posts:'Посты',
        openGames:'Открытые игры', join:'Войти', waitingOpponent:'Ожидание соперника...',
        game:'Игра', resign:'Сдаться', drawOffer:'Предложить ничью', drawOfferReceived:'Соперник предлагает ничью',
        accept:'Принять', decline:'Отклонить',
        rpsChoose:'Сделайте выбор', rpsOpponentChose:'Соперник выбрал...',
        roll:'Бросить кости', onlineUsers:'Онлайн',
        roomLobby:'Лобби', roomRandom:'Случайный', roomGames:'Игры', roomHelp:'Помощь', roomTurkce:'Türkçe', roomEnglish:'English',
        forumGeneral:'Общее', forumQA:'Вопросы', forumSuggestions:'Предложения', forumBugs:'Баги',
        forumGamesTopic:'Игры', forumSharing:'Публикации', forumAnnouncements:'Объявления',
        gameTTT:'Крестики-нолики', gameTTTDesc:'3x3, 2 игрока', gameRPS:'Камень-Ножницы-Бумага', gameRPSDesc:'Быстрый раунд',
        gameChess:'Шахматы', gameChessDesc:'Классические шахматы', gameBG:'Нарды', gameBGDesc:'Классические нарды',
        yourTurn:'Ваш ход', opponentTurn:'Ход соперника', youWin:'Победа! 🎉', youLose:'Поражение', draw:'Ничья!',
        fileTooLarge:'Файл слишком большой (макс 5МБ)', invalidFileType:'Тип файла не поддерживается',
        profileUpdated:'Профиль обновлён', nickInvalid:'Неверный никнейм (3-20 символов)'
      },
      zh: {
        setupTitle:'欢迎加入社区!', setupSubtitle:'创建你的个人资料',
        nickname:'昵称', nickPlaceholder:'GamerTR42', nickAvailable:'✅ 可用', nickTaken:'❌ 已被使用', nickChecking:'⏳ 检查中...',
        avatar:'头像', uploadAvatar:'上传自定义图片', customAvatarSet:'自定义头像已设置',
        bio:'关于我', bioPlaceholder:'简短介绍...', joinCommunity:'加入社区',
        connecting:'连接中...', connected:'已连接', reconnecting:'重新连接', disconnected:'已断开',
        chat:'聊天', dm:'私信', forum:'论坛', games:'游戏', users:'用户', settings:'设置',
        online:'在线', send:'发送', msgPlaceholder:'输入消息...', noMessages:'暂无消息',
        noDm:'暂无私信', noDmMessages:'暂无消息', sendDm:'发送消息',
        attach:'附件', newThread:'新主题', threadTitle:'标题', content:'内容',
        create:'创建', cancel:'取消', replies:'回复', views:'浏览', noThreads:'暂无主题',
        replyPlaceholder:'写下回复... (Ctrl+Enter发送)', profile:'个人资料',
        profileSettings:'个人资料设置', status:'状态', save:'保存',
        stats:'统计', wins:'胜', losses:'负', draws:'平', posts:'帖子',
        openGames:'开放游戏', join:'加入', waitingOpponent:'等待对手...',
        game:'游戏', resign:'认输', drawOffer:'提议和棋', drawOfferReceived:'对手提议和棋',
        accept:'接受', decline:'拒绝',
        rpsChoose:'做出选择', rpsOpponentChose:'对手已选择...',
        roll:'掷骰子', onlineUsers:'在线用户',
        roomLobby:'大厅', roomRandom:'随机', roomGames:'游戏', roomHelp:'帮助', roomTurkce:'Türkçe', roomEnglish:'English',
        forumGeneral:'综合讨论', forumQA:'问答', forumSuggestions:'建议', forumBugs:'反馈',
        forumGamesTopic:'游戏讨论', forumSharing:'分享', forumAnnouncements:'公告',
        gameTTT:'井字棋', gameTTTDesc:'经典3x3', gameRPS:'石头剪刀布', gameRPSDesc:'快速对决',
        gameChess:'国际象棋', gameChessDesc:'经典象棋', gameBG:'西洋双陆棋', gameBGDesc:'经典双陆棋',
        yourTurn:'你的回合', opponentTurn:'对手回合', youWin:'胜利! 🎉', youLose:'失败', draw:'平局!',
        fileTooLarge:'文件过大(最大5MB)', invalidFileType:'不支持的文件类型',
        profileUpdated:'已更新', nickInvalid:'无效昵称(3-20字符)'
      },
      ja: {
        setupTitle:'コミュニティへようこそ!', setupSubtitle:'プロフィールを作成',
        nickname:'ニックネーム', nickPlaceholder:'GamerTR42', nickAvailable:'✅ 利用可能', nickTaken:'❌ 使用中', nickChecking:'⏳ 確認中...',
        avatar:'アバター', uploadAvatar:'画像をアップロード', customAvatarSet:'カスタムアバター設定済',
        bio:'自己紹介', bioPlaceholder:'短い紹介...', joinCommunity:'参加する',
        connecting:'接続中...', connected:'接続済', reconnecting:'再接続中', disconnected:'切断',
        chat:'チャット', dm:'ダイレクトメッセージ', forum:'フォーラム', games:'ゲーム', users:'ユーザー', settings:'設定',
        online:'オンライン', send:'送信', msgPlaceholder:'メッセージを入力...', noMessages:'メッセージなし',
        noDm:'DMなし', noDmMessages:'メッセージなし', sendDm:'メッセージ送信',
        attach:'添付', newThread:'新しいスレッド', threadTitle:'タイトル', content:'内容',
        create:'作成', cancel:'キャンセル', replies:'返信', views:'閲覧', noThreads:'スレッドなし',
        replyPlaceholder:'返信を書く... (Ctrl+Enter)', profile:'プロフィール',
        profileSettings:'プロフィール設定', status:'ステータス', save:'保存',
        stats:'統計', wins:'勝', losses:'敗', draws:'引分', posts:'投稿',
        openGames:'オープンゲーム', join:'参加', waitingOpponent:'対戦相手を待機中...',
        game:'ゲーム', resign:'投了', drawOffer:'引き分け提案', drawOfferReceived:'対戦相手が引き分けを提案',
        accept:'承諾', decline:'拒否',
        rpsChoose:'選んでください', rpsOpponentChose:'相手が選択済...',
        roll:'サイコロ', onlineUsers:'オンラインユーザー',
        roomLobby:'ロビー', roomRandom:'ランダム', roomGames:'ゲーム', roomHelp:'ヘルプ', roomTurkce:'Türkçe', roomEnglish:'English',
        forumGeneral:'一般', forumQA:'Q&A', forumSuggestions:'提案', forumBugs:'バグ報告',
        forumGamesTopic:'ゲーム', forumSharing:'共有', forumAnnouncements:'お知らせ',
        gameTTT:'○×ゲーム', gameTTTDesc:'3x3', gameRPS:'じゃんけん', gameRPSDesc:'クイックラウンド',
        gameChess:'チェス', gameChessDesc:'クラシックチェス', gameBG:'バックギャモン', gameBGDesc:'クラシック',
        yourTurn:'あなたの番', opponentTurn:'相手の番', youWin:'勝利! 🎉', youLose:'敗北', draw:'引き分け!',
        fileTooLarge:'ファイルが大きすぎます(最大5MB)', invalidFileType:'非対応の形式',
        profileUpdated:'プロフィール更新済', nickInvalid:'無効なニックネーム(3-20文字)'
      },
      it: {
        setupTitle:'Benvenuto nella Community!', setupSubtitle:'Crea il tuo profilo',
        nickname:'Soprannome', nickPlaceholder:'GamerTR42', nickAvailable:'✅ Disponibile', nickTaken:'❌ Già in uso', nickChecking:'⏳ Verifica...',
        avatar:'Avatar', uploadAvatar:'Carica immagine', customAvatarSet:'Avatar personalizzato impostato',
        bio:'Bio', bioPlaceholder:'Breve presentazione...', joinCommunity:'Unisciti',
        connecting:'Connessione...', connected:'Connesso', reconnecting:'Riconnessione', disconnected:'Disconnesso',
        chat:'CHAT', dm:'MESSAGGI DIRETTI', forum:'FORUM', games:'GIOCHI', users:'UTENTI', settings:'Impostazioni',
        online:'online', send:'Invia', msgPlaceholder:'Scrivi un messaggio...', noMessages:'Nessun messaggio',
        noDm:'Nessun messaggio diretto', noDmMessages:'Nessun messaggio', sendDm:'Invia messaggio',
        attach:'Allega', newThread:'Nuovo argomento', threadTitle:'Titolo', content:'Contenuto',
        create:'Crea', cancel:'Annulla', replies:'risposte', views:'visualizzazioni', noThreads:'Nessun argomento',
        replyPlaceholder:'Scrivi la tua risposta... (Ctrl+Invio)', profile:'Profilo',
        profileSettings:'Impostazioni profilo', status:'Stato', save:'Salva',
        stats:'Statistiche', wins:'Vittorie', losses:'Sconfitte', draws:'Pareggi', posts:'Post',
        openGames:'Partite aperte', join:'Unisciti', waitingOpponent:'In attesa dell\'avversario...',
        game:'Gioco', resign:'Arrendersi', drawOffer:'Proponi patta', drawOfferReceived:'L\'avversario propone la patta',
        accept:'Accetta', decline:'Rifiuta',
        rpsChoose:'Fai la tua scelta', rpsOpponentChose:'L\'avversario ha scelto...',
        roll:'Tira i dadi', onlineUsers:'Utenti online',
        roomLobby:'Lobby', roomRandom:'Casuale', roomGames:'Giochi', roomHelp:'Aiuto', roomTurkce:'Türkçe', roomEnglish:'English',
        forumGeneral:'Generale', forumQA:'Domande', forumSuggestions:'Suggerimenti', forumBugs:'Bug',
        forumGamesTopic:'Giochi', forumSharing:'Condivisione', forumAnnouncements:'Annunci',
        gameTTT:'Tris', gameTTTDesc:'Classico 3x3', gameRPS:'Morra cinese', gameRPSDesc:'Turno rapido',
        gameChess:'Scacchi', gameChessDesc:'Scacchi classici', gameBG:'Backgammon', gameBGDesc:'Backgammon classico',
        yourTurn:'Il tuo turno', opponentTurn:'Turno avversario', youWin:'Vittoria! 🎉', youLose:'Sconfitta', draw:'Pareggio!',
        fileTooLarge:'File troppo grande (max 5MB)', invalidFileType:'Tipo non supportato',
        profileUpdated:'Profilo aggiornato', nickInvalid:'Soprannome non valido (3-20 caratteri)'
      },
      ar: {
        setupTitle:'مرحبًا بك في المجتمع!', setupSubtitle:'أنشئ ملفك الشخصي',
        nickname:'الاسم المستعار', nickPlaceholder:'GamerTR42', nickAvailable:'✅ متاح', nickTaken:'❌ مستخدم', nickChecking:'⏳ جارٍ التحقق...',
        avatar:'الصورة الرمزية', uploadAvatar:'رفع صورة', customAvatarSet:'تم تعيين الصورة',
        bio:'نبذة', bioPlaceholder:'نبذة قصيرة...', joinCommunity:'انضم',
        connecting:'جارٍ الاتصال...', connected:'متصل', reconnecting:'إعادة الاتصال', disconnected:'غير متصل',
        chat:'الدردشة', dm:'رسائل خاصة', forum:'المنتدى', games:'الألعاب', users:'المستخدمون', settings:'الإعدادات',
        online:'متصل', send:'إرسال', msgPlaceholder:'اكتب رسالة...', noMessages:'لا رسائل',
        noDm:'لا رسائل خاصة', noDmMessages:'لا رسائل', sendDm:'إرسال رسالة',
        attach:'إرفاق', newThread:'موضوع جديد', threadTitle:'العنوان', content:'المحتوى',
        create:'إنشاء', cancel:'إلغاء', replies:'ردود', views:'مشاهدات', noThreads:'لا مواضيع',
        replyPlaceholder:'اكتب ردك...', profile:'الملف الشخصي',
        profileSettings:'إعدادات الملف', status:'الحالة', save:'حفظ',
        stats:'الإحصائيات', wins:'فوز', losses:'خسارة', draws:'تعادل', posts:'منشورات',
        openGames:'ألعاب مفتوحة', join:'انضم', waitingOpponent:'في انتظار الخصم...',
        game:'لعبة', resign:'استسلام', drawOffer:'عرض تعادل', drawOfferReceived:'الخصم يعرض التعادل',
        accept:'قبول', decline:'رفض',
        rpsChoose:'اختر', rpsOpponentChose:'الخصم اختار...',
        roll:'رمي النرد', onlineUsers:'المتصلون',
        roomLobby:'اللوبي', roomRandom:'عشوائي', roomGames:'ألعاب', roomHelp:'مساعدة', roomTurkce:'Türkçe', roomEnglish:'English',
        forumGeneral:'عام', forumQA:'أسئلة', forumSuggestions:'اقتراحات', forumBugs:'أخطاء',
        forumGamesTopic:'ألعاب', forumSharing:'مشاركات', forumAnnouncements:'إعلانات',
        gameTTT:'إكس أو', gameTTTDesc:'3x3 كلاسيكي', gameRPS:'حجر ورقة مقص', gameRPSDesc:'جولة سريعة',
        gameChess:'شطرنج', gameChessDesc:'شطرنج كلاسيكي', gameBG:'طاولة', gameBGDesc:'طاولة كلاسيكية',
        yourTurn:'دورك', opponentTurn:'دور الخصم', youWin:'فوز! 🎉', youLose:'خسارة', draw:'تعادل!',
        fileTooLarge:'الملف كبير جدًا (5 ميجا)', invalidFileType:'نوع غير مدعوم',
        profileUpdated:'تم التحديث', nickInvalid:'اسم غير صالح (3-20 حرف)'
      },
      ko: {
        setupTitle:'커뮤니티에 오신 것을 환영합니다!', setupSubtitle:'프로필을 만드세요',
        nickname:'닉네임', nickPlaceholder:'GamerTR42', nickAvailable:'✅ 사용 가능', nickTaken:'❌ 이미 사용 중', nickChecking:'⏳ 확인 중...',
        avatar:'아바타', uploadAvatar:'이미지 업로드', customAvatarSet:'커스텀 아바타 설정됨',
        bio:'소개', bioPlaceholder:'간단한 소개...', joinCommunity:'가입하기',
        connecting:'연결 중...', connected:'연결됨', reconnecting:'재연결 중', disconnected:'연결 끊김',
        chat:'채팅', dm:'개인 메시지', forum:'포럼', games:'게임', users:'사용자', settings:'설정',
        online:'온라인', send:'보내기', msgPlaceholder:'메시지 입력...', noMessages:'메시지 없음',
        noDm:'개인 메시지 없음', noDmMessages:'메시지 없음', sendDm:'메시지 보내기',
        attach:'첨부', newThread:'새 주제', threadTitle:'제목', content:'내용',
        create:'만들기', cancel:'취소', replies:'답글', views:'조회', noThreads:'주제 없음',
        replyPlaceholder:'답글 작성... (Ctrl+Enter)', profile:'프로필',
        profileSettings:'프로필 설정', status:'상태', save:'저장',
        stats:'통계', wins:'승', losses:'패', draws:'무', posts:'게시물',
        openGames:'열린 게임', join:'참가', waitingOpponent:'상대 대기 중...',
        game:'게임', resign:'항복', drawOffer:'무승부 제안', drawOfferReceived:'상대가 무승부를 제안합니다',
        accept:'수락', decline:'거절',
        rpsChoose:'선택하세요', rpsOpponentChose:'상대가 선택했습니다...',
        roll:'주사위', onlineUsers:'온라인 사용자',
        roomLobby:'로비', roomRandom:'랜덤', roomGames:'게임', roomHelp:'도움말', roomTurkce:'Türkçe', roomEnglish:'English',
        forumGeneral:'일반', forumQA:'Q&A', forumSuggestions:'제안', forumBugs:'버그',
        forumGamesTopic:'게임', forumSharing:'공유', forumAnnouncements:'공지',
        gameTTT:'틱택토', gameTTTDesc:'3x3', gameRPS:'가위바위보', gameRPSDesc:'빠른 라운드',
        gameChess:'체스', gameChessDesc:'클래식 체스', gameBG:'백개먼', gameBGDesc:'클래식 백개먼',
        yourTurn:'당신의 차례', opponentTurn:'상대 차례', youWin:'승리! 🎉', youLose:'패배', draw:'무승부!',
        fileTooLarge:'파일이 너무 큽니다(최대 5MB)', invalidFileType:'지원되지 않는 형식',
        profileUpdated:'프로필 업데이트됨', nickInvalid:'잘못된 닉네임(3-20자)'
      },
      hi: {
        setupTitle:'समुदाय में स्वागत है!', setupSubtitle:'अपनी प्रोफ़ाइल बनाएं',
        nickname:'उपनाम', nickPlaceholder:'GamerTR42', nickAvailable:'✅ उपलब्ध', nickTaken:'❌ पहले से लिया हुआ', nickChecking:'⏳ जाँच हो रही है...',
        avatar:'अवतार', uploadAvatar:'चित्र अपलोड', customAvatarSet:'कस्टम अवतार सेट',
        bio:'परिचय', bioPlaceholder:'संक्षिप्त परिचय...', joinCommunity:'शामिल हों',
        connecting:'कनेक्ट हो रहा है...', connected:'कनेक्टेड', reconnecting:'पुनः कनेक्ट', disconnected:'डिस्कनेक्ट',
        chat:'चैट', dm:'निजी संदेश', forum:'फ़ोरम', games:'गेम', users:'उपयोगकर्ता', settings:'सेटिंग',
        online:'ऑनलाइन', send:'भेजें', msgPlaceholder:'संदेश लिखें...', noMessages:'कोई संदेश नहीं',
        noDm:'कोई निजी संदेश नहीं', noDmMessages:'कोई संदेश नहीं', sendDm:'संदेश भेजें',
        attach:'संलग्न', newThread:'नया विषय', threadTitle:'शीर्षक', content:'सामग्री',
        create:'बनाएं', cancel:'रद्द करें', replies:'उत्तर', views:'दृश्य', noThreads:'कोई विषय नहीं',
        replyPlaceholder:'उत्तर लिखें...', profile:'प्रोफ़ाइल',
        profileSettings:'प्रोफ़ाइल सेटिंग', status:'स्थिति', save:'सहेजें',
        stats:'आँकड़े', wins:'जीत', losses:'हार', draws:'ड्रॉ', posts:'पोस्ट',
        openGames:'खुले गेम', join:'शामिल हों', waitingOpponent:'प्रतिद्वंद्वी की प्रतीक्षा...',
        game:'गेम', resign:'हार मानें', drawOffer:'ड्रॉ प्रस्ताव', drawOfferReceived:'प्रतिद्वंद्वी ड्रॉ प्रस्ताव',
        accept:'स्वीकार', decline:'अस्वीकार',
        rpsChoose:'चुनें', rpsOpponentChose:'प्रतिद्वंद्वी ने चुना...',
        roll:'पासा फेंकें', onlineUsers:'ऑनलाइन उपयोगकर्ता',
        roomLobby:'लॉबी', roomRandom:'रैंडम', roomGames:'गेम', roomHelp:'मदद', roomTurkce:'Türkçe', roomEnglish:'English',
        forumGeneral:'सामान्य', forumQA:'प्रश्न', forumSuggestions:'सुझाव', forumBugs:'बग',
        forumGamesTopic:'गेम', forumSharing:'साझा', forumAnnouncements:'घोषणाएं',
        gameTTT:'टिक-टैक-टो', gameTTTDesc:'3x3', gameRPS:'पत्थर-कागज-कैंची', gameRPSDesc:'त्वरित राउंड',
        gameChess:'शतरंज', gameChessDesc:'क्लासिक शतरंज', gameBG:'बैकगैमन', gameBGDesc:'क्लासिक',
        yourTurn:'आपकी बारी', opponentTurn:'प्रतिद्वंद्वी की बारी', youWin:'जीत! 🎉', youLose:'हार', draw:'ड्रॉ!',
        fileTooLarge:'फ़ाइल बहुत बड़ी (अधिकतम 5MB)', invalidFileType:'असमर्थित प्रकार',
        profileUpdated:'प्रोफ़ाइल अपडेट', nickInvalid:'अमान्य उपनाम (3-20 अक्षर)'
      },
      pt: {
        setupTitle:'Bem-vindo à Comunidade!', setupSubtitle:'Crie seu perfil',
        nickname:'Apelido', nickPlaceholder:'GamerTR42', nickAvailable:'✅ Disponível', nickTaken:'❌ Já em uso', nickChecking:'⏳ Verificando...',
        avatar:'Avatar', uploadAvatar:'Enviar imagem', customAvatarSet:'Avatar personalizado definido',
        bio:'Sobre', bioPlaceholder:'Breve apresentação...', joinCommunity:'Participar',
        connecting:'Conectando...', connected:'Conectado', reconnecting:'Reconectando', disconnected:'Desconectado',
        chat:'CHAT', dm:'MENSAGENS DIRETAS', forum:'FÓRUM', games:'JOGOS', users:'USUÁRIOS', settings:'Configurações',
        online:'online', send:'Enviar', msgPlaceholder:'Digite sua mensagem...', noMessages:'Sem mensagens',
        noDm:'Sem mensagens diretas', noDmMessages:'Sem mensagens', sendDm:'Enviar mensagem',
        attach:'Anexar', newThread:'Novo tópico', threadTitle:'Título', content:'Conteúdo',
        create:'Criar', cancel:'Cancelar', replies:'respostas', views:'visualizações', noThreads:'Sem tópicos',
        replyPlaceholder:'Escreva sua resposta... (Ctrl+Enter)', profile:'Perfil',
        profileSettings:'Configurações do perfil', status:'Status', save:'Salvar',
        stats:'Estatísticas', wins:'Vitórias', losses:'Derrotas', draws:'Empates', posts:'Posts',
        openGames:'Jogos abertos', join:'Participar', waitingOpponent:'Aguardando adversário...',
        game:'Jogo', resign:'Desistir', drawOffer:'Propor empate', drawOfferReceived:'O adversário propõe empate',
        accept:'Aceitar', decline:'Recusar',
        rpsChoose:'Faça sua escolha', rpsOpponentChose:'Adversário escolheu...',
        roll:'Jogar dados', onlineUsers:'Usuários online',
        roomLobby:'Saguão', roomRandom:'Aleatório', roomGames:'Jogos', roomHelp:'Ajuda', roomTurkce:'Türkçe', roomEnglish:'English',
        forumGeneral:'Geral', forumQA:'Perguntas', forumSuggestions:'Sugestões', forumBugs:'Bugs',
        forumGamesTopic:'Jogos', forumSharing:'Compartilhar', forumAnnouncements:'Anúncios',
        gameTTT:'Jogo da Velha', gameTTTDesc:'3x3 clássico', gameRPS:'Pedra-Papel-Tesoura', gameRPSDesc:'Rodada rápida',
        gameChess:'Xadrez', gameChessDesc:'Xadrez clássico', gameBG:'Gamão', gameBGDesc:'Gamão clássico',
        yourTurn:'Sua vez', opponentTurn:'Vez do adversário', youWin:'Vitória! 🎉', youLose:'Derrota', draw:'Empate!',
        fileTooLarge:'Arquivo muito grande (máx 5MB)', invalidFileType:'Tipo não suportado',
        profileUpdated:'Perfil atualizado', nickInvalid:'Apelido inválido (3-20 caracteres)'
      }
    };

    // ═══════════════════════════════════════════════════
    // LANGUAGE DETECTION
    // ═══════════════════════════════════════════════════
    const lang = ref((() => {
      const dl = (window.__desktop_lang || navigator.language || 'en').substring(0, 2).toLowerCase();
      return LANGS[dl] ? dl : 'en';
    })());
    const t = computed(() => LANGS[lang.value]);

    // ═══════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════
    const view = ref('loading'); // 'loading' | 'setup' | 'app'
    const connState = ref('connecting'); // 'connecting' | 'connected' | 'disconnected'
    const activePanel = ref('chat');
    const prevPanel = ref('chat');
    const activeRoom = ref('lobby');
    const activeDm = ref(null);
    const toast = ref('');

    // Profile
    const myProfile = reactive({ userId: '', nickname: '', avatarType: 'emoji', avatarData: '🦊', bio: '', status: 'online', wins: 0, losses: 0, draws: 0, forumPosts: 0 });

    // Setup
    const setupNick = ref('');
    const setupAvatar = ref('🦊');
    const setupAvatarType = ref('emoji');
    const setupAvatarCustom = ref('');
    const setupBio = ref('');
    const nickStatus = ref('');

    // Settings
    const settingsNick = ref('');
    const settingsBio = ref('');
    const settingsAvatar = ref('🦊');
    const settingsAvatarType = ref('emoji');
    const settingsStatus = ref('online');

    // Chat
    const chatMessages = reactive({}); // { roomId: [msg...] }
    const chatInput = ref('');
    const unreadCounts = reactive({});
    const chatMessagesEl = ref(null);

    // DM
    const dmList = ref([]);
    const dmMessagesMap = reactive({}); // { oderId: [msg...] }
    const dmInput = ref('');
    const dmMessagesEl = ref(null);

    // Forum
    const forumCat = ref('genel');
    const forumThreads = ref([]);
    const forumThread = ref(null);
    const showNewThread = ref(false);
    const newThreadTitle = ref('');
    const newThreadContent = ref('');
    const replyInput = ref('');

    // Games
    const activeGame = ref(null);
    const waitingGames = ref([]);
    const myWaitingGame = ref(null);
    const drawOfferReceived = ref(false);

    // TicTacToe
    const tttBoard = ref(Array(9).fill(''));
    const tttMyMark = ref('X');
    const tttTurn = ref('X');
    const tttGameOver = ref(false);

    // RPS
    const rpsChoice = ref('');
    const rpsOpponentChose = ref(false);
    const rpsResult = ref('');

    // Chess
    const chessBoard = ref(null);
    const chessMySide = ref('white');
    const chessTurn = ref('white');
    const chessSelected = ref(null);
    const chessValidMoves = ref([]);
    const chessLastMove = ref(null);
    const chessMoves = ref([]);
    const chessGameOver = ref(false);

    // Backgammon
    const bgBoard = ref(null);
    const bgMyColor = ref('white');
    const bgTurn = ref('white');
    const bgDice = ref([]);
    const bgSelected = ref(null);
    const bgGameOver = ref(false);

    // Files
    const pendingFiles = ref([]);

    // Users
    const onlineUsers = ref([]);

    // Profile View
    const profileView = reactive({ userId: '', nickname: '', avatarType: 'emoji', avatarData: '🦊', bio: '', status: 'online', wins: 0, losses: 0, draws: 0, forumPosts: 0 });

    // WebSocket
    let ws = null;
    let reconnectAttempt = 0;
    let reconnectTimer = null;
    let heartbeatTimer = null;
    let nickCheckTimer = null;
    let msgIdCounter = 0;
    let offlineQueue = [];

    // ═══════════════════════════════════════════════════
    // COMPUTED
    // ═══════════════════════════════════════════════════
    const avatarEmojis = computed(() => AVATAR_EMOJIS);

    const chatRooms = computed(() => CHAT_ROOMS.map(r => ({ ...r, name: t.value[r.nameKey] || r.id })));

    const forumCategories = computed(() => FORUM_CATS.map(c => ({ ...c, name: t.value[c.nameKey] || c.id })));

    const gameTypes = computed(() => GAME_TYPES.map(g => ({ ...g, name: t.value[g.nameKey] || g.id, desc: t.value[g.descKey] || '' })));

    const currentRoomObj = computed(() => chatRooms.value.find(r => r.id === activeRoom.value) || { icon: '', name: '' });

    const currentMessages = computed(() => chatMessages[activeRoom.value] || []);

    const dmMessages = computed(() => dmMessagesMap[activeDm.value] || []);

    const dmPartnerProfile = computed(() => {
      const u = onlineUsers.value.find(u => u.userId === activeDm.value);
      return u || { nickname: '...' };
    });

    const currentForumCat = computed(() => forumCategories.value.find(c => c.id === forumCat.value) || { icon: '', name: '' });

    const onlineCount = computed(() => onlineUsers.value.filter(u => u.status !== 'offline').length);

    const canRegister = computed(() => {
      return setupNick.value.length >= 3 && NICK_REGEX.test(setupNick.value) && nickStatus.value === 'available' && !BANNED_NICKNAMES.includes(setupNick.value.toLowerCase());
    });

    // Chess computed
    const chessFiles = computed(() => ['a','b','c','d','e','f','g','h']);

    const chessDisplayBoard = computed(() => {
      if (!chessBoard.value) return [];
      const board = chessMySide.value === 'white' ? chessBoard.value : [...chessBoard.value].reverse().map(row => [...row].reverse());
      return board.map(row => row.map(p => PIECES[p] || ''));
    });

    const chessStatusText = computed(() => {
      if (chessGameOver.value) return chessGameOver.value;
      return chessTurn.value === chessMySide.value ? t.value.yourTurn : t.value.opponentTurn;
    });

    const chessMoveList = computed(() => chessMoves.value.join(' '));

    // TTT computed
    const tttStatusText = computed(() => {
      if (tttGameOver.value) return tttGameOver.value;
      return tttTurn.value === tttMyMark.value ? t.value.yourTurn : t.value.opponentTurn;
    });

    // BG computed
    const bgMyTurn = computed(() => !bgGameOver.value && bgTurn.value === bgMyColor.value);
    const bgTopPoints = computed(() => bgBoard.value ? bgBoard.value.slice(0, 12) : []);
    const bgBottomPoints = computed(() => bgBoard.value ? bgBoard.value.slice(12, 24) : []);
    const bgStatusText = computed(() => {
      if (bgGameOver.value) return bgGameOver.value;
      return bgMyTurn.value ? t.value.yourTurn : t.value.opponentTurn;
    });

    // ═══════════════════════════════════════════════════
    // UTILS
    // ═══════════════════════════════════════════════════
    function showToast(msg) {
      toast.value = msg;
      setTimeout(() => { toast.value = ''; }, 3000);
    }

    function formatTime(ts) {
      if (!ts) return '';
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function formatSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / 1048576).toFixed(1) + ' MB';
    }

    function isImage(mime) {
      return mime && mime.startsWith('image/');
    }

    function fileUrl(att) {
      return HUB_HTTP + '/files/' + att.fileId + '/' + encodeURIComponent(att.name);
    }

    function downloadFile(att) {
      window.open(fileUrl(att), '_blank');
    }

    function gameIcon(type) {
      const g = GAME_TYPES.find(g => g.id === type);
      return g ? g.icon : '🎮';
    }

    function generateClientId() {
      const raw = navigator.userAgent + screen.width + screen.height + (localStorage.getItem('community_installTs') || '');
      // Simple hash
      let hash = 0;
      for (let i = 0; i < raw.length; i++) {
        const c = raw.charCodeAt(i);
        hash = ((hash << 5) - hash) + c;
        hash |= 0;
      }
      return 'cid_' + Math.abs(hash).toString(16) + '_' + Date.now().toString(36);
    }

    // Simple Markdown renderer (sanitized)
    function renderMd(text) {
      if (!text) return '';
      let html = text
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
      return html;
    }

    // Avatar resize
    function resizeAvatar(file) {
      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = 128;
          const ctx = canvas.getContext('2d');
          const min = Math.min(img.width, img.height);
          const sx = (img.width - min) / 2, sy = (img.height - min) / 2;
          ctx.drawImage(img, sx, sy, min, min, 0, 0, 128, 128);
          resolve(canvas.toDataURL('image/webp', 0.8));
        };
        img.src = URL.createObjectURL(file);
      });
    }

    // ═══════════════════════════════════════════════════
    // WEBSOCKET CONNECTION
    // ═══════════════════════════════════════════════════
    function connect() {
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
      connState.value = 'connecting';

      try {
        ws = new WebSocket(HUB_URL + '/ws');
      } catch (e) {
        connState.value = 'disconnected';
        scheduleReconnect();
        return;
      }

      ws.onopen = () => {
        connState.value = 'connected';
        reconnectAttempt = 0;
        startHeartbeat();

        const userId = localStorage.getItem('community_userId');
        const authToken = localStorage.getItem('community_authToken');

        if (userId && authToken) {
          wsSend({ type: 'auth', userId, authToken });
        } else {
          view.value = 'setup';
        }

        // Flush offline queue
        while (offlineQueue.length > 0) {
          wsSend(offlineQueue.shift());
        }
      };

      ws.onclose = () => {
        connState.value = 'disconnected';
        stopHeartbeat();
        if (view.value === 'app') scheduleReconnect();
      };

      ws.onerror = () => {
        connState.value = 'disconnected';
      };

      ws.onmessage = (evt) => {
        let msg;
        try { msg = JSON.parse(evt.data); } catch (e) { return; }
        handleMessage(msg);
      };
    }

    function wsSend(data) {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      } else {
        offlineQueue.push(data);
      }
    }

    function scheduleReconnect() {
      if (reconnectTimer) return;
      const delay = RECONNECT_DELAYS[Math.min(reconnectAttempt, RECONNECT_DELAYS.length - 1)];
      reconnectAttempt++;
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connect();
      }, delay);
    }

    function startHeartbeat() {
      stopHeartbeat();
      heartbeatTimer = setInterval(() => {
        wsSend({ type: 'ping' });
      }, HEARTBEAT_INTERVAL);
    }

    function stopHeartbeat() {
      if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; }
    }

    // ═══════════════════════════════════════════════════
    // MESSAGE HANDLER
    // ═══════════════════════════════════════════════════
    function handleMessage(msg) {
      switch (msg.type) {
        // Auth
        case 'auth.ok':
          Object.assign(myProfile, msg.profile);
          view.value = 'app';
          wsSend({ type: 'presence.subscribe' });
          wsSend({ type: 'chat.join', room: 'lobby' });
          wsSend({ type: 'dm.list' });
          break;
        case 'auth.error':
          localStorage.removeItem('community_userId');
          localStorage.removeItem('community_authToken');
          view.value = 'setup';
          break;

        // Register
        case 'register.ok':
          localStorage.setItem('community_userId', msg.userId);
          localStorage.setItem('community_authToken', msg.authToken);
          Object.assign(myProfile, msg.profile);
          myProfile.userId = msg.userId;
          view.value = 'app';
          wsSend({ type: 'presence.subscribe' });
          wsSend({ type: 'chat.join', room: 'lobby' });
          break;
        case 'register.error':
          if (msg.code === 'NICKNAME_TAKEN') nickStatus.value = 'taken';
          break;

        // Profile
        case 'profile.updated':
          Object.assign(myProfile, msg.profile);
          showToast(t.value.profileUpdated);
          break;
        case 'profile.data':
          Object.assign(profileView, msg.profile);
          break;
        case 'profile.nickname_available':
          nickStatus.value = msg.available ? 'available' : 'taken';
          break;

        // Chat
        case 'chat.message':
          if (!chatMessages[msg.room]) chatMessages[msg.room] = [];
          chatMessages[msg.room].push(msg);
          if (msg.room !== activeRoom.value || activePanel.value !== 'chat') {
            unreadCounts[msg.room] = (unreadCounts[msg.room] || 0) + 1;
          } else {
            nextTick(() => scrollToBottom(chatMessagesEl));
          }
          break;
        case 'chat.sync':
          if (!chatMessages[msg.room]) chatMessages[msg.room] = [];
          if (msg.messages) {
            chatMessages[msg.room] = msg.messages;
            nextTick(() => scrollToBottom(chatMessagesEl));
          }
          break;

        // DM
        case 'dm.message':
          if (!dmMessagesMap[msg.from.userId]) dmMessagesMap[msg.from.userId] = [];
          dmMessagesMap[msg.from.userId].push(msg);
          updateDmList(msg.from, msg.content, msg.ts);
          if (activePanel.value === 'dm' && activeDm.value === msg.from.userId) {
            nextTick(() => scrollToBottom(dmMessagesEl));
          }
          break;
        case 'dm.sync':
          dmMessagesMap[msg.with] = msg.messages || [];
          nextTick(() => scrollToBottom(dmMessagesEl));
          break;
        case 'dm.list':
          dmList.value = msg.conversations || [];
          break;
        case 'dm.sent':
          if (msg.to) {
            if (!dmMessagesMap[msg.to]) dmMessagesMap[msg.to] = [];
            dmMessagesMap[msg.to].push({ from: { userId: myProfile.userId, nickname: myProfile.nickname, avatarType: myProfile.avatarType, avatarData: myProfile.avatarData }, content: msg.content, ts: msg.ts || new Date().toISOString() });
            nextTick(() => scrollToBottom(dmMessagesEl));
          }
          break;

        // Forum
        case 'forum.categories':
          // Static categories, handled locally
          break;
        case 'forum.threads':
          forumThreads.value = msg.threads || [];
          break;
        case 'forum.thread':
          forumThread.value = msg.thread;
          break;
        case 'forum.created':
          forumThreads.value.unshift(msg.thread);
          showNewThread.value = false;
          newThreadTitle.value = '';
          newThreadContent.value = '';
          break;
        case 'forum.replied':
          if (forumThread.value && forumThread.value.id === msg.threadId) {
            if (!forumThread.value.replies) forumThread.value.replies = [];
            forumThread.value.replies.push(msg.reply);
          }
          break;

        // Games
        case 'game.created':
          myWaitingGame.value = msg.gameId;
          break;
        case 'game.started':
          myWaitingGame.value = null;
          activeGame.value = { gameId: msg.gameId, gameType: msg.gameType || msg.config?.gameType || 'tictactoe', opponent: msg.opponent, config: msg.config };
          initGame(activeGame.value);
          break;
        case 'game.move':
          handleGameMove(msg);
          break;
        case 'game.list':
          waitingGames.value = (msg.games || []).filter(g => g.creator.userId !== myProfile.userId);
          break;
        case 'game.resigned':
          if (activeGame.value) {
            chessGameOver.value = t.value.youWin;
            tttGameOver.value = t.value.youWin;
            bgGameOver.value = t.value.youWin;
          }
          break;
        case 'game.draw_offer':
          drawOfferReceived.value = true;
          break;
        case 'game.ended':
          if (msg.result === 'win') { chessGameOver.value = t.value.youWin; tttGameOver.value = t.value.youWin; bgGameOver.value = t.value.youWin; }
          else if (msg.result === 'loss') { chessGameOver.value = t.value.youLose; tttGameOver.value = t.value.youLose; bgGameOver.value = t.value.youLose; }
          else { chessGameOver.value = t.value.draw; tttGameOver.value = t.value.draw; bgGameOver.value = t.value.draw; }
          break;
        case 'game.opponent_disconnected':
          showToast('Opponent disconnected');
          break;
        case 'game.cancelled':
          myWaitingGame.value = null;
          break;

        // Presence
        case 'presence.full':
          onlineUsers.value = msg.users || [];
          break;
        case 'presence.delta':
          if (msg.joined) msg.joined.forEach(u => {
            if (!onlineUsers.value.find(x => x.userId === u.userId)) onlineUsers.value.push(u);
          });
          if (msg.left) msg.left.forEach(uid => {
            onlineUsers.value = onlineUsers.value.filter(u => u.userId !== uid);
          });
          if (msg.statusChanged) msg.statusChanged.forEach(sc => {
            const u = onlineUsers.value.find(x => x.userId === sc.userId);
            if (u) u.status = sc.status;
          });
          break;

        case 'pong':
          break;

        case 'error':
          showToast(msg.message || 'Error');
          break;
      }
    }

    // ═══════════════════════════════════════════════════
    // ACTIONS
    // ═══════════════════════════════════════════════════

    // -- Nickname Check --
    function checkNickname() {
      if (nickCheckTimer) clearTimeout(nickCheckTimer);
      const nick = setupNick.value.trim();
      if (nick.length < 3 || !NICK_REGEX.test(nick) || BANNED_NICKNAMES.includes(nick.toLowerCase())) {
        nickStatus.value = '';
        return;
      }
      nickStatus.value = 'checking';
      nickCheckTimer = setTimeout(() => {
        wsSend({ type: 'profile.check_nickname', nickname: nick });
      }, 500);
    }

    // -- Register --
    function doRegister() {
      if (!canRegister.value) return;
      if (!localStorage.getItem('community_installTs')) {
        localStorage.setItem('community_installTs', Date.now().toString());
      }
      const clientId = localStorage.getItem('community_clientId') || generateClientId();
      localStorage.setItem('community_clientId', clientId);
      wsSend({
        type: 'register',
        clientId,
        nickname: setupNick.value.trim(),
        avatarType: setupAvatarType.value,
        avatarData: setupAvatarType.value === 'custom' ? setupAvatarCustom.value : setupAvatar.value,
        bio: setupBio.value.trim()
      });
    }

    // -- Avatar Upload --
    async function handleAvatarUpload(e) {
      const file = e.target.files?.[0];
      if (!file) return;
      const data = await resizeAvatar(file);
      setupAvatarType.value = 'custom';
      setupAvatarCustom.value = data;
      setupAvatar.value = '';
    }

    async function handleSettingsAvatarUpload(e) {
      const file = e.target.files?.[0];
      if (!file) return;
      const data = await resizeAvatar(file);
      settingsAvatarType.value = 'custom';
      settingsAvatar.value = data;
    }

    // -- Chat --
    function openChat(roomId) {
      activePanel.value = 'chat';
      activeRoom.value = roomId;
      unreadCounts[roomId] = 0;
      if (!chatMessages[roomId]) chatMessages[roomId] = [];
      wsSend({ type: 'chat.join', room: roomId });
      const last = chatMessages[roomId]?.[chatMessages[roomId].length - 1];
      wsSend({ type: 'chat.sync', room: roomId, since: last?.ts || '' });
      nextTick(() => scrollToBottom(chatMessagesEl));
    }

    function sendChat() {
      const content = chatInput.value.trim();
      if (!content && !pendingFiles.value.length) return;
      const msgData = { type: 'chat.send', room: activeRoom.value, content, attachments: [] };

      if (pendingFiles.value.length > 0) {
        uploadFiles(pendingFiles.value).then(attachments => {
          msgData.attachments = attachments;
          wsSend(msgData);
          pendingFiles.value = [];
        });
      } else {
        wsSend(msgData);
      }
      chatInput.value = '';
    }

    function onChatScroll() { /* Future: load older messages */ }

    // -- DM --
    function openDm(userId) {
      activePanel.value = 'dm';
      activeDm.value = userId;
      if (!dmMessagesMap[userId]) dmMessagesMap[userId] = [];
      wsSend({ type: 'dm.sync', with: userId, since: '' });
    }

    function sendDm() {
      const content = dmInput.value.trim();
      if (!content || !activeDm.value) return;
      wsSend({ type: 'dm.send', to: activeDm.value, content });
      if (!dmMessagesMap[activeDm.value]) dmMessagesMap[activeDm.value] = [];
      dmMessagesMap[activeDm.value].push({
        from: { userId: myProfile.userId, nickname: myProfile.nickname, avatarType: myProfile.avatarType, avatarData: myProfile.avatarData },
        content,
        ts: new Date().toISOString()
      });
      dmInput.value = '';
      nextTick(() => scrollToBottom(dmMessagesEl));
    }

    function updateDmList(from, lastMessage, lastTs) {
      const existing = dmList.value.find(d => d.oderId === from.userId);
      if (existing) {
        existing.lastMessage = lastMessage;
        existing.lastTs = lastTs;
        existing.unread = (existing.unread || 0) + 1;
      } else {
        dmList.value.push({ oderId: from.userId, nickname: from.nickname, avatarType: from.avatarType, avatarData: from.avatarData, lastMessage, lastTs, unread: 1 });
      }
    }

    // -- Forum --
    function openForum(catId) {
      activePanel.value = 'forum';
      forumCat.value = catId;
      forumThread.value = null;
      wsSend({ type: 'forum.list', categoryId: catId, page: 1, limit: 20 });
    }

    function openThread(threadId) {
      wsSend({ type: 'forum.thread', threadId, afterReplyId: 0 });
    }

    function createThread() {
      const title = newThreadTitle.value.trim();
      const content = newThreadContent.value.trim();
      if (!title || !content) return;
      wsSend({ type: 'forum.create', categoryId: forumCat.value, title, content, attachments: [] });
    }

    function sendReply() {
      const content = replyInput.value.trim();
      if (!content || !forumThread.value) return;
      wsSend({ type: 'forum.reply', threadId: forumThread.value.id, content, attachments: [] });
      replyInput.value = '';
    }

    function likeReply(replyId) {
      wsSend({ type: 'forum.like', replyId });
    }

    // -- Games --
    function openGames() {
      activePanel.value = 'games';
      activeGame.value = null;
      wsSend({ type: 'game.list' });
    }

    function createGame(gameType) {
      if (myWaitingGame.value) return;
      wsSend({ type: 'game.create', gameType });
    }

    function joinGame(gameId) {
      wsSend({ type: 'game.join', gameId });
    }

    function cancelGame() {
      if (myWaitingGame.value) {
        wsSend({ type: 'game.cancel', gameId: myWaitingGame.value });
        myWaitingGame.value = null;
      }
    }

    function resignGame() {
      if (!activeGame.value) return;
      wsSend({ type: 'game.resign', gameId: activeGame.value.gameId });
      wsSend({ type: 'game.end', gameId: activeGame.value.gameId, result: 'loss', reason: 'resign' });
      if (activeGame.value.gameType === 'tictactoe') tttGameOver.value = t.value.youLose;
      else if (activeGame.value.gameType === 'chess') chessGameOver.value = t.value.youLose;
      else if (activeGame.value.gameType === 'backgammon') bgGameOver.value = t.value.youLose;
    }

    function offerDraw() {
      if (!activeGame.value) return;
      wsSend({ type: 'game.draw_offer', gameId: activeGame.value.gameId });
    }

    function acceptDraw() {
      drawOfferReceived.value = false;
      if (!activeGame.value) return;
      wsSend({ type: 'game.draw_accept', gameId: activeGame.value.gameId });
      wsSend({ type: 'game.end', gameId: activeGame.value.gameId, result: 'draw', reason: 'agreement' });
      chessGameOver.value = t.value.draw;
      tttGameOver.value = t.value.draw;
      bgGameOver.value = t.value.draw;
    }

    function declineDraw() {
      drawOfferReceived.value = false;
    }

    function leaveGame() {
      if (activeGame.value && !chessGameOver.value && !tttGameOver.value && !bgGameOver.value) {
        resignGame();
      }
      activeGame.value = null;
      openGames();
    }

    // -- Init Games --
    function initGame(game) {
      switch (game.gameType) {
        case 'tictactoe':
          tttBoard.value = Array(9).fill('');
          tttMyMark.value = game.config?.yourSide === 'O' ? 'O' : 'X';
          tttTurn.value = 'X';
          tttGameOver.value = false;
          break;
        case 'rps':
          rpsChoice.value = '';
          rpsOpponentChose.value = false;
          rpsResult.value = '';
          break;
        case 'chess':
          chessMySide.value = game.config?.yourSide || 'white';
          chessBoard.value = ChessEngine.newBoard();
          chessTurn.value = 'white';
          chessSelected.value = null;
          chessValidMoves.value = [];
          chessLastMove.value = null;
          chessMoves.value = [];
          chessGameOver.value = false;
          break;
        case 'backgammon':
          bgMyColor.value = game.config?.yourSide || 'white';
          bgBoard.value = BackgammonEngine.newBoard();
          bgTurn.value = 'white';
          bgDice.value = [];
          bgSelected.value = null;
          bgGameOver.value = false;
          break;
      }
    }

    // -- Game Move Handler --
    function handleGameMove(msg) {
      if (!activeGame.value || activeGame.value.gameId !== msg.gameId) return;

      switch (activeGame.value.gameType) {
        case 'tictactoe': {
          const { pos } = msg.data;
          const opMark = tttMyMark.value === 'X' ? 'O' : 'X';
          tttBoard.value[pos] = opMark;
          tttTurn.value = tttMyMark.value;
          const winner = TicTacToeEngine.checkWinner(tttBoard.value);
          if (winner) {
            tttGameOver.value = winner === tttMyMark.value ? t.value.youWin : t.value.youLose;
          } else if (TicTacToeEngine.isFull(tttBoard.value)) {
            tttGameOver.value = t.value.draw;
          }
          break;
        }
        case 'rps': {
          rpsOpponentChose.value = false;
          const myC = rpsChoice.value;
          const opC = msg.data.choice;
          const result = RPSEngine.evaluate(myC, opC);
          rpsResult.value = result === 0 ? t.value.draw : result === 1 ? t.value.youWin : t.value.youLose;
          break;
        }
        case 'chess': {
          const { from, to } = msg.data;
          ChessEngine.applyMove(chessBoard.value, from, to);
          chessLastMove.value = { from, to };
          chessTurn.value = chessMySide.value;
          const moveNum = Math.ceil(chessMoves.value.length / 2) + 1;
          chessMoves.value.push((chessTurn.value === 'white' ? moveNum + '... ' : '') + ChessEngine.toAlgebraic(from, to));
          if (ChessEngine.isCheckmate(chessBoard.value, chessMySide.value)) {
            chessGameOver.value = t.value.youLose;
            wsSend({ type: 'game.end', gameId: activeGame.value.gameId, result: 'loss', reason: 'checkmate' });
          } else if (ChessEngine.isStalemate(chessBoard.value, chessMySide.value)) {
            chessGameOver.value = t.value.draw;
            wsSend({ type: 'game.end', gameId: activeGame.value.gameId, result: 'draw', reason: 'stalemate' });
          }
          break;
        }
        case 'backgammon': {
          BackgammonEngine.applyMove(bgBoard.value, msg.data);
          bgTurn.value = bgMyColor.value;
          bgDice.value = [];
          break;
        }
      }
    }

    // ═══════════════════════════════════════════════════
    // TTT GAME
    // ═══════════════════════════════════════════════════
    function tttMove(pos) {
      if (tttGameOver.value || tttTurn.value !== tttMyMark.value || tttBoard.value[pos]) return;
      tttBoard.value[pos] = tttMyMark.value;
      tttTurn.value = tttMyMark.value === 'X' ? 'O' : 'X';
      wsSend({ type: 'game.move', gameId: activeGame.value.gameId, data: { pos } });

      const winner = TicTacToeEngine.checkWinner(tttBoard.value);
      if (winner) {
        tttGameOver.value = winner === tttMyMark.value ? t.value.youWin : t.value.youLose;
        wsSend({ type: 'game.end', gameId: activeGame.value.gameId, result: 'win', reason: 'line' });
      } else if (TicTacToeEngine.isFull(tttBoard.value)) {
        tttGameOver.value = t.value.draw;
        wsSend({ type: 'game.end', gameId: activeGame.value.gameId, result: 'draw', reason: 'full' });
      }
    }

    const TicTacToeEngine = {
      checkWinner(board) {
        const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for (const [a,b,c] of lines) {
          if (board[a] && board[a] === board[b] && board[b] === board[c]) return board[a];
        }
        return null;
      },
      isFull(board) {
        return board.every(c => c);
      }
    };

    // ═══════════════════════════════════════════════════
    // RPS GAME
    // ═══════════════════════════════════════════════════
    function rpsSelect(choice) {
      if (rpsChoice.value || rpsResult.value) return;
      rpsChoice.value = choice;
      wsSend({ type: 'game.move', gameId: activeGame.value.gameId, data: { choice } });
    }

    const RPSEngine = {
      evaluate(my, op) {
        if (my === op) return 0;
        const wins = { '✊': '✌️', '✋': '✊', '✌️': '✋' };
        return wins[my] === op ? 1 : -1;
      }
    };

    // ═══════════════════════════════════════════════════
    // CHESS ENGINE (client-side)
    // ═══════════════════════════════════════════════════
    const PIECES = {
      K:'♔', Q:'♕', R:'♖', B:'♗', N:'♘', P:'♙',
      k:'♚', q:'♛', r:'♜', b:'♝', n:'♞', p:'♟'
    };

    const ChessEngine = {
      newBoard() {
        return [
          ['r','n','b','q','k','b','n','r'],
          ['p','p','p','p','p','p','p','p'],
          ['','','','','','','',''],
          ['','','','','','','',''],
          ['','','','','','','',''],
          ['','','','','','','',''],
          ['P','P','P','P','P','P','P','P'],
          ['R','N','B','Q','K','B','N','R']
        ];
      },

      isWhite(piece) { return piece === piece.toUpperCase() && piece !== ''; },
      isBlack(piece) { return piece === piece.toLowerCase() && piece !== ''; },
      colorOf(piece) { return piece ? (this.isWhite(piece) ? 'white' : 'black') : null; },

      getValidMoves(board, r, c) {
        const piece = board[r][c];
        if (!piece) return [];
        const moves = [];
        const color = this.colorOf(piece);
        const type = piece.toLowerCase();
        const dir = color === 'white' ? -1 : 1;

        switch (type) {
          case 'p': {
            const startRow = color === 'white' ? 6 : 1;
            if (r + dir >= 0 && r + dir < 8 && !board[r + dir][c]) {
              moves.push([r + dir, c]);
              if (r === startRow && !board[r + 2 * dir][c]) moves.push([r + 2 * dir, c]);
            }
            for (const dc of [-1, 1]) {
              const nr = r + dir, nc = c + dc;
              if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] && this.colorOf(board[nr][nc]) !== color) {
                moves.push([nr, nc]);
              }
            }
            break;
          }
          case 'r': this._slideMoves(board, r, c, [[0,1],[0,-1],[1,0],[-1,0]], moves, color); break;
          case 'b': this._slideMoves(board, r, c, [[1,1],[1,-1],[-1,1],[-1,-1]], moves, color); break;
          case 'q': this._slideMoves(board, r, c, [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]], moves, color); break;
          case 'n': {
            for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && this.colorOf(board[nr][nc]) !== color) moves.push([nr, nc]);
            }
            break;
          }
          case 'k': {
            for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
              if (!dr && !dc) continue;
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && this.colorOf(board[nr][nc]) !== color) moves.push([nr, nc]);
            }
            break;
          }
        }
        // Filter moves that would leave king in check
        return moves.filter(([mr, mc]) => {
          const copy = board.map(row => [...row]);
          copy[mr][mc] = copy[r][c];
          copy[r][c] = '';
          return !this.isCheck(copy, color);
        });
      },

      _slideMoves(board, r, c, dirs, moves, color) {
        for (const [dr, dc] of dirs) {
          let nr = r + dr, nc = c + dc;
          while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            if (!board[nr][nc]) { moves.push([nr, nc]); }
            else {
              if (this.colorOf(board[nr][nc]) !== color) moves.push([nr, nc]);
              break;
            }
            nr += dr; nc += dc;
          }
        }
      },

      applyMove(board, from, to) {
        const piece = board[from[0]][from[1]];
        board[to[0]][to[1]] = piece;
        board[from[0]][from[1]] = '';
        // Pawn promotion
        if (piece.toLowerCase() === 'p' && (to[0] === 0 || to[0] === 7)) {
          board[to[0]][to[1]] = piece === 'P' ? 'Q' : 'q';
        }
      },

      isCheck(board, color) {
        let kr = -1, kc = -1;
        const king = color === 'white' ? 'K' : 'k';
        for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
          if (board[r][c] === king) { kr = r; kc = c; break; }
        }
        if (kr === -1) return true;
        const opColor = color === 'white' ? 'black' : 'white';
        for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
          if (board[r][c] && this.colorOf(board[r][c]) === opColor) {
            // Check raw attacks (without recursion)
            if (this._attacks(board, r, c, kr, kc)) return true;
          }
        }
        return false;
      },

      _attacks(board, r, c, tr, tc) {
        const piece = board[r][c].toLowerCase();
        const color = this.colorOf(board[r][c]);
        const dir = color === 'white' ? -1 : 1;

        switch (piece) {
          case 'p': return Math.abs(c - tc) === 1 && r + dir === tr;
          case 'n': return (Math.abs(r-tr) === 2 && Math.abs(c-tc) === 1) || (Math.abs(r-tr) === 1 && Math.abs(c-tc) === 2);
          case 'k': return Math.abs(r-tr) <= 1 && Math.abs(c-tc) <= 1;
          case 'r': return this._slideAttacks(board, r, c, tr, tc, [[0,1],[0,-1],[1,0],[-1,0]]);
          case 'b': return this._slideAttacks(board, r, c, tr, tc, [[1,1],[1,-1],[-1,1],[-1,-1]]);
          case 'q': return this._slideAttacks(board, r, c, tr, tc, [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]);
        }
        return false;
      },

      _slideAttacks(board, r, c, tr, tc, dirs) {
        for (const [dr, dc] of dirs) {
          let nr = r + dr, nc = c + dc;
          while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            if (nr === tr && nc === tc) return true;
            if (board[nr][nc]) break;
            nr += dr; nc += dc;
          }
        }
        return false;
      },

      isCheckmate(board, color) {
        if (!this.isCheck(board, color)) return false;
        return this._noMoves(board, color);
      },

      isStalemate(board, color) {
        if (this.isCheck(board, color)) return false;
        return this._noMoves(board, color);
      },

      _noMoves(board, color) {
        for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
          if (board[r][c] && this.colorOf(board[r][c]) === color) {
            if (this.getValidMoves(board, r, c).length > 0) return false;
          }
        }
        return true;
      },

      toAlgebraic(from, to) {
        const files = 'abcdefgh';
        return files[from[1]] + (8 - from[0]) + files[to[1]] + (8 - to[0]);
      }
    };

    // Chess UI
    function chessClick(ri, ci) {
      if (chessGameOver.value || chessTurn.value !== chessMySide.value || !chessBoard.value) return;
      // Translate display coords back to board coords
      let br = ri, bc = ci;
      if (chessMySide.value === 'black') { br = 7 - ri; bc = 7 - ci; }

      if (chessSelected.value) {
        const [sr, sc] = chessSelected.value;
        // Translate selected back
        let sbr = sr, sbc = sc;
        if (chessMySide.value === 'black') { sbr = 7 - sr; sbc = 7 - sc; }

        if (chessValidMoves.value.some(([mr, mc]) => mr === br && mc === bc)) {
          // Apply move
          ChessEngine.applyMove(chessBoard.value, [sbr, sbc], [br, bc]);
          chessLastMove.value = { from: [sbr, sbc], to: [br, bc] };
          chessTurn.value = chessMySide.value === 'white' ? 'black' : 'white';
          chessMoves.value.push(ChessEngine.toAlgebraic([sbr, sbc], [br, bc]));
          wsSend({ type: 'game.move', gameId: activeGame.value.gameId, data: { from: [sbr, sbc], to: [br, bc] } });

          const opColor = chessMySide.value === 'white' ? 'black' : 'white';
          if (ChessEngine.isCheckmate(chessBoard.value, opColor)) {
            chessGameOver.value = t.value.youWin;
            wsSend({ type: 'game.end', gameId: activeGame.value.gameId, result: 'win', reason: 'checkmate' });
          } else if (ChessEngine.isStalemate(chessBoard.value, opColor)) {
            chessGameOver.value = t.value.draw;
            wsSend({ type: 'game.end', gameId: activeGame.value.gameId, result: 'draw', reason: 'stalemate' });
          }
        }
        chessSelected.value = null;
        chessValidMoves.value = [];
      } else {
        const piece = chessBoard.value[br][bc];
        if (piece && ChessEngine.colorOf(piece) === chessMySide.value) {
          chessSelected.value = [ri, ci];
          chessValidMoves.value = ChessEngine.getValidMoves(chessBoard.value, br, bc);
        }
      }
    }

    function isChessValidTarget(ri, ci) {
      if (!chessValidMoves.value.length) return false;
      let br = ri, bc = ci;
      if (chessMySide.value === 'black') { br = 7 - ri; bc = 7 - ci; }
      return chessValidMoves.value.some(([mr, mc]) => mr === br && mc === bc);
    }

    function isChessLastMove(ri, ci) {
      if (!chessLastMove.value) return false;
      let br = ri, bc = ci;
      if (chessMySide.value === 'black') { br = 7 - ri; bc = 7 - ci; }
      const { from, to } = chessLastMove.value;
      return (br === from[0] && bc === from[1]) || (br === to[0] && bc === to[1]);
    }

    // ═══════════════════════════════════════════════════
    // BACKGAMMON ENGINE (simplified)
    // ═══════════════════════════════════════════════════
    const BackgammonEngine = {
      newBoard() {
        // 24 points, each is an array of checker colors ('white' or 'black')
        const board = Array.from({ length: 24 }, () => []);
        // Standard starting positions
        board[0] = ['black','black']; board[5] = ['white','white','white','white','white'];
        board[7] = ['white','white','white']; board[11] = ['black','black','black','black','black'];
        board[12] = ['white','white','white','white','white']; board[16] = ['black','black','black'];
        board[18] = ['black','black','black','black','black']; board[23] = ['white','white'];
        return board;
      },

      applyMove(board, moveData) {
        if (!moveData || !moveData.moves) return;
        for (const m of moveData.moves) {
          if (m.from >= 0 && m.from < 24 && board[m.from].length > 0) {
            board[m.from].pop();
          }
          if (m.to >= 0 && m.to < 24) {
            board[m.to].push(m.color);
          }
        }
      }
    };

    function bgClick(half, pi) {
      if (bgGameOver.value || !bgMyTurn.value || !bgDice.value.length) return;
      const pointIndex = half === 'top' ? pi : pi + 12;
      if (bgSelected.value === null) {
        if (bgBoard.value[pointIndex].length > 0 && bgBoard.value[pointIndex][0] === bgMyColor.value) {
          bgSelected.value = pointIndex;
        }
      } else {
        const from = bgSelected.value;
        const to = pointIndex;
        const die = Math.abs(to - from);
        if (bgDice.value.includes(die)) {
          const color = bgMyColor.value;
          bgBoard.value[from].pop();
          bgBoard.value[to].push(color);
          bgDice.value.splice(bgDice.value.indexOf(die), 1);
          wsSend({ type: 'game.move', gameId: activeGame.value.gameId, data: { moves: [{ from, to, color }] } });
          if (bgDice.value.length === 0) {
            bgTurn.value = bgMyColor.value === 'white' ? 'black' : 'white';
          }
        }
        bgSelected.value = null;
      }
    }

    function bgRoll() {
      if (!bgMyTurn.value || bgDice.value.length) return;
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      bgDice.value = d1 === d2 ? [d1, d1, d1, d1] : [d1, d2];
      wsSend({ type: 'game.move', gameId: activeGame.value.gameId, data: { type: 'roll', dice: bgDice.value } });
    }

    // ═══════════════════════════════════════════════════
    // FILE UPLOAD
    // ═══════════════════════════════════════════════════
    function handleFileSelect(e) {
      const files = Array.from(e.target.files || []);
      for (const f of files) {
        if (f.size > MAX_FILE_SIZE) { showToast(t.value.fileTooLarge); continue; }
        const ext = f.name.split('.').pop().toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) { showToast(t.value.invalidFileType); continue; }
        if (pendingFiles.value.length >= 3) break;
        pendingFiles.value.push(f);
      }
      e.target.value = '';
    }

    async function uploadFiles(files) {
      const results = [];
      const authToken = localStorage.getItem('community_authToken');
      for (const file of files) {
        try {
          let uploadFile = file;
          let thumb = null;
          // Resize images client-side
          if (file.type.startsWith('image/')) {
            const resized = await resizeImage(file, 1920);
            uploadFile = resized.file;
            thumb = resized.thumb;
          }
          const formData = new FormData();
          formData.append('file', uploadFile);
          const resp = await fetch(HUB_HTTP + '/files/upload', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + authToken },
            body: formData
          });
          if (resp.ok) {
            const data = await resp.json();
            results.push({ fileId: data.fileId, name: file.name, size: file.size, mime: file.type, thumb });
          }
        } catch (e) { /* upload failed */ }
      }
      return results;
    }

    function resizeImage(file, maxDim) {
      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          let w = img.width, h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) { h = (h / w) * maxDim; w = maxDim; }
            else { w = (w / h) * maxDim; h = maxDim; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob(blob => {
            // Thumbnail
            const tc = document.createElement('canvas');
            const tw = 200, th = Math.round(200 * (h / w));
            tc.width = tw; tc.height = th;
            tc.getContext('2d').drawImage(img, 0, 0, tw, th);
            const thumb = tc.toDataURL('image/webp', 0.6);
            resolve({ file: new File([blob], file.name, { type: 'image/webp' }), thumb });
          }, 'image/webp', 0.8);
        };
        img.src = URL.createObjectURL(file);
      });
    }

    // ═══════════════════════════════════════════════════
    // PROFILE & SETTINGS
    // ═══════════════════════════════════════════════════
    function showProfile(user) {
      Object.assign(profileView, user);
      prevPanel.value = activePanel.value;
      activePanel.value = 'profile';
      if (user.userId && user.userId !== myProfile.userId) {
        wsSend({ type: 'profile.get', userId: user.userId });
      }
    }

    function openSettings() {
      settingsNick.value = myProfile.nickname;
      settingsBio.value = myProfile.bio;
      settingsAvatar.value = myProfile.avatarData;
      settingsAvatarType.value = myProfile.avatarType;
      settingsStatus.value = myProfile.status || 'online';
      activePanel.value = 'settings';
    }

    function saveSettings() {
      if (!NICK_REGEX.test(settingsNick.value) || BANNED_NICKNAMES.includes(settingsNick.value.toLowerCase())) {
        showToast(t.value.nickInvalid);
        return;
      }
      wsSend({
        type: 'profile.update',
        nickname: settingsNick.value.trim(),
        bio: settingsBio.value.trim(),
        avatarType: settingsAvatarType.value,
        avatarData: settingsAvatar.value
      });
      wsSend({ type: 'presence.status', status: settingsStatus.value });
      myProfile.status = settingsStatus.value;
    }

    // ═══════════════════════════════════════════════════
    // SCROLL HELPER
    // ═══════════════════════════════════════════════════
    function scrollToBottom(elRef) {
      if (elRef.value) {
        elRef.value.scrollTop = elRef.value.scrollHeight;
      }
    }

    // ═══════════════════════════════════════════════════
    // LIFECYCLE
    // ═══════════════════════════════════════════════════
    onMounted(() => {
      connect();
    });

    onUnmounted(() => {
      if (ws) { ws.onclose = null; ws.close(); }
      if (reconnectTimer) clearTimeout(reconnectTimer);
      stopHeartbeat();
      if (nickCheckTimer) clearTimeout(nickCheckTimer);
    });

    // Watch language changes
    watch(() => window.__desktop_lang, (newLang) => {
      if (newLang) {
        const dl = newLang.substring(0, 2).toLowerCase();
        if (LANGS[dl]) lang.value = dl;
      }
    });

    // ═══════════════════════════════════════════════════
    // RETURN
    // ═══════════════════════════════════════════════════
    return {
      // State
      view, connState, activePanel, prevPanel, activeRoom, activeDm, toast,
      myProfile, t,

      // Setup
      setupNick, setupAvatar, setupAvatarType, setupBio, nickStatus, avatarEmojis, canRegister,

      // Settings
      settingsNick, settingsBio, settingsAvatar, settingsAvatarType, settingsStatus,

      // Chat
      chatRooms, chatMessages, chatInput, currentMessages, currentRoomObj, unreadCounts,
      chatMessagesEl, pendingFiles,

      // DM
      dmList, dmMessages, dmInput, dmMessagesEl, dmPartnerProfile,

      // Forum
      forumCategories, forumCat, forumThreads, forumThread, currentForumCat,
      showNewThread, newThreadTitle, newThreadContent, replyInput,

      // Games
      gameTypes, activeGame, waitingGames, myWaitingGame, drawOfferReceived,
      tttBoard, tttStatusText, rpsChoice, rpsOpponentChose, rpsResult,
      chessBoard, chessDisplayBoard, chessFiles, chessSelected, chessValidMoves, chessStatusText, chessMoveList, chessLastMove,
      bgTopPoints, bgBottomPoints, bgDice, bgMyTurn, bgStatusText,

      // Users
      onlineUsers, onlineCount,

      // Profile
      profileView,

      // Methods
      checkNickname, doRegister, handleAvatarUpload, handleSettingsAvatarUpload,
      openChat, sendChat, onChatScroll,
      openDm, sendDm,
      openForum, openThread, createThread, sendReply, likeReply,
      openGames, createGame, joinGame, cancelGame, resignGame, offerDraw, acceptDraw, declineDraw, leaveGame,
      tttMove, rpsSelect, chessClick, isChessValidTarget, isChessLastMove,
      bgClick, bgRoll,
      handleFileSelect,
      showProfile, openSettings, saveSettings,
      formatTime, formatSize, isImage, fileUrl, downloadFile, gameIcon, renderMd,

      // Chess piece display (for template)
      getPieceDisplay(piece) { return PIECES[piece] || ''; }
    };
  }
})
