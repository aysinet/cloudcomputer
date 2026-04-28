(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, nextTick, watch } = Vue;

  const LANGS = {
    tr: {
      boards:'Panolar', lists:'Listeler', cards:'Kartlar', settings:'Ayarlar',
      apiKey:'API Anahtarı', token:'Token', save:'Kaydet', cancel:'İptal',
      addList:'Liste Ekle', addCard:'Kart Ekle', editCard:'Kartı Düzenle',
      deleteCard:'Kartı Arşivle', moveCard:'Kartı Taşı', cardName:'Kart adı',
      listName:'Liste adı', description:'Açıklama', dueDate:'Bitiş Tarihi',
      noBoards:'Pano bulunamadı', loading:'Yükleniyor...', back:'Geri',
      configure:'Trello API anahtarı ve token\'ınızı yapılandırın',
      getKey:'API anahtarını al', authToken:'Token al',
      selectBoard:'Bir pano seçin', refresh:'Yenile',
      open:'Trello\'da Aç', saved:'Kaydedildi', error:'Hata',
      noCredentials:'API anahtarı ve token gerekli',
      cardDetail:'Kart Detay', labels:'Etiketler', members:'Üyeler',
      done:'Tamamlandı', notDone:'Tamamlanmadı'
    },
    en: {
      boards:'Boards', lists:'Lists', cards:'Cards', settings:'Settings',
      apiKey:'API Key', token:'Token', save:'Save', cancel:'Cancel',
      addList:'Add List', addCard:'Add Card', editCard:'Edit Card',
      deleteCard:'Archive Card', moveCard:'Move Card', cardName:'Card name',
      listName:'List name', description:'Description', dueDate:'Due Date',
      noBoards:'No boards found', loading:'Loading...', back:'Back',
      configure:'Configure your Trello API key and token',
      getKey:'Get API Key', authToken:'Get Token',
      selectBoard:'Select a board', refresh:'Refresh',
      open:'Open in Trello', saved:'Saved', error:'Error',
      noCredentials:'API key and token required',
      cardDetail:'Card Detail', labels:'Labels', members:'Members',
      done:'Done', notDone:'Not Done'
    },
    de: {
      boards:'Boards', lists:'Listen', cards:'Karten', settings:'Einstellungen',
      apiKey:'API-Schlüssel', token:'Token', save:'Speichern', cancel:'Abbrechen',
      addList:'Liste hinzufügen', addCard:'Karte hinzufügen', editCard:'Karte bearbeiten',
      deleteCard:'Karte archivieren', moveCard:'Karte verschieben', cardName:'Kartenname',
      listName:'Listenname', description:'Beschreibung', dueDate:'Fälligkeitsdatum',
      noBoards:'Keine Boards gefunden', loading:'Wird geladen...', back:'Zurück',
      configure:'Konfigurieren Sie Ihren Trello API-Schlüssel und Token',
      getKey:'API-Schlüssel erhalten', authToken:'Token erhalten',
      selectBoard:'Board auswählen', refresh:'Aktualisieren',
      open:'In Trello öffnen', saved:'Gespeichert', error:'Fehler',
      noCredentials:'API-Schlüssel und Token erforderlich',
      cardDetail:'Kartendetail', labels:'Labels', members:'Mitglieder',
      done:'Erledigt', notDone:'Nicht erledigt'
    },
    fr: {
      boards:'Tableaux', lists:'Listes', cards:'Cartes', settings:'Paramètres',
      apiKey:'Clé API', token:'Jeton', save:'Enregistrer', cancel:'Annuler',
      addList:'Ajouter une liste', addCard:'Ajouter une carte', editCard:'Modifier la carte',
      deleteCard:'Archiver la carte', moveCard:'Déplacer la carte', cardName:'Nom de la carte',
      listName:'Nom de la liste', description:'Description', dueDate:'Date d\'échéance',
      noBoards:'Aucun tableau trouvé', loading:'Chargement...', back:'Retour',
      configure:'Configurez votre clé API et token Trello',
      getKey:'Obtenir la clé API', authToken:'Obtenir le token',
      selectBoard:'Sélectionner un tableau', refresh:'Actualiser',
      open:'Ouvrir dans Trello', saved:'Enregistré', error:'Erreur',
      noCredentials:'Clé API et token requis',
      cardDetail:'Détail de la carte', labels:'Étiquettes', members:'Membres',
      done:'Terminé', notDone:'Non terminé'
    },
    es: {
      boards:'Tableros', lists:'Listas', cards:'Tarjetas', settings:'Ajustes',
      apiKey:'Clave API', token:'Token', save:'Guardar', cancel:'Cancelar',
      addList:'Añadir lista', addCard:'Añadir tarjeta', editCard:'Editar tarjeta',
      deleteCard:'Archivar tarjeta', moveCard:'Mover tarjeta', cardName:'Nombre de tarjeta',
      listName:'Nombre de lista', description:'Descripción', dueDate:'Fecha límite',
      noBoards:'No se encontraron tableros', loading:'Cargando...', back:'Atrás',
      configure:'Configure su clave API y token de Trello',
      getKey:'Obtener clave API', authToken:'Obtener token',
      selectBoard:'Seleccionar tablero', refresh:'Actualizar',
      open:'Abrir en Trello', saved:'Guardado', error:'Error',
      noCredentials:'Se requiere clave API y token',
      cardDetail:'Detalle de tarjeta', labels:'Etiquetas', members:'Miembros',
      done:'Hecho', notDone:'No hecho'
    },
    ru: {
      boards:'Доски', lists:'Списки', cards:'Карточки', settings:'Настройки',
      apiKey:'API ключ', token:'Токен', save:'Сохранить', cancel:'Отмена',
      addList:'Добавить список', addCard:'Добавить карточку', editCard:'Редактировать',
      deleteCard:'Архивировать', moveCard:'Переместить', cardName:'Название карточки',
      listName:'Название списка', description:'Описание', dueDate:'Срок',
      noBoards:'Доски не найдены', loading:'Загрузка...', back:'Назад',
      configure:'Настройте ключ API и токен Trello',
      getKey:'Получить API ключ', authToken:'Получить токен',
      selectBoard:'Выберите доску', refresh:'Обновить',
      open:'Открыть в Trello', saved:'Сохранено', error:'Ошибка',
      noCredentials:'Требуются API ключ и токен',
      cardDetail:'Детали карточки', labels:'Метки', members:'Участники',
      done:'Готово', notDone:'Не выполнено'
    },
    zh: { boards:'看板', lists:'列表', cards:'卡片', settings:'设置', apiKey:'API密钥', token:'令牌', save:'保存', cancel:'取消', addList:'添加列表', addCard:'添加卡片', editCard:'编辑卡片', deleteCard:'归档卡片', moveCard:'移动卡片', cardName:'卡片名称', listName:'列表名称', description:'描述', dueDate:'截止日期', noBoards:'未找到看板', loading:'加载中...', back:'返回', configure:'配置您的Trello API密钥和令牌', getKey:'获取API密钥', authToken:'获取令牌', selectBoard:'选择看板', refresh:'刷新', open:'在Trello中打开', saved:'已保存', error:'错误', noCredentials:'需要API密钥和令牌', cardDetail:'卡片详情', labels:'标签', members:'成员', done:'完成', notDone:'未完成' },
    ja: { boards:'ボード', lists:'リスト', cards:'カード', settings:'設定', apiKey:'APIキー', token:'トークン', save:'保存', cancel:'キャンセル', addList:'リスト追加', addCard:'カード追加', editCard:'カード編集', deleteCard:'カードアーカイブ', moveCard:'カード移動', cardName:'カード名', listName:'リスト名', description:'説明', dueDate:'期限', noBoards:'ボードが見つかりません', loading:'読み込み中...', back:'戻る', configure:'TrelloのAPIキーとトークンを設定してください', getKey:'APIキーを取得', authToken:'トークンを取得', selectBoard:'ボードを選択', refresh:'更新', open:'Trelloで開く', saved:'保存済み', error:'エラー', noCredentials:'APIキーとトークンが必要', cardDetail:'カード詳細', labels:'ラベル', members:'メンバー', done:'完了', notDone:'未完了' },
    it: { boards:'Bacheche', lists:'Liste', cards:'Schede', settings:'Impostazioni', apiKey:'Chiave API', token:'Token', save:'Salva', cancel:'Annulla', addList:'Aggiungi lista', addCard:'Aggiungi scheda', editCard:'Modifica scheda', deleteCard:'Archivia scheda', moveCard:'Sposta scheda', cardName:'Nome scheda', listName:'Nome lista', description:'Descrizione', dueDate:'Scadenza', noBoards:'Nessuna bacheca trovata', loading:'Caricamento...', back:'Indietro', configure:'Configura la tua chiave API e token Trello', getKey:'Ottieni chiave API', authToken:'Ottieni token', selectBoard:'Seleziona una bacheca', refresh:'Aggiorna', open:'Apri in Trello', saved:'Salvato', error:'Errore', noCredentials:'Chiave API e token richiesti', cardDetail:'Dettaglio scheda', labels:'Etichette', members:'Membri', done:'Fatto', notDone:'Non fatto' }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  return {
    setup() {
      var locale = ref(getLocale());
      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }
      function t(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      function authHeaders() {
        return { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || ''), 'Content-Type': 'application/json' };
      }

      // ── State ──
      var view = ref('boards'); // boards | board | settings
      var loading = ref(false);

      // Settings
      var apiKey = ref('');
      var apiToken = ref('');
      var settingsLoaded = ref(false);

      // Boards
      var boards = ref([]);
      var currentBoard = ref(null);

      // Lists & Cards
      var lists = ref([]);
      var cardsByList = ref({});

      // Add list/card dialogs
      var showAddList = ref(false);
      var newListName = ref('');
      var showAddCard = ref(false);
      var addCardListId = ref('');
      var newCardName = ref('');
      var newCardDesc = ref('');

      // Card detail dialog
      var showCardDetail = ref(false);
      var detailCard = ref(null);
      var editingCardName = ref('');
      var editingCardDesc = ref('');
      var editingCardDue = ref('');

      // Drag state
      var dragCard = ref(null);
      var dragOverList = ref(null);

      // ── API helpers ──
      async function api(endpoint, opts) {
        opts = opts || {};
        var res = await fetch('/api/trello' + endpoint, {
          method: opts.method || 'GET',
          headers: authHeaders(),
          body: opts.body ? JSON.stringify(opts.body) : undefined
        });
        var data = await res.json();
        if (!res.ok) throw new Error(data.error || 'API Error');
        return data;
      }

      // ── Settings ──
      async function loadSettings() {
        try {
          var data = await api('/settings');
          apiKey.value = data.apiKey || '';
          apiToken.value = data.token || '';
          settingsLoaded.value = true;
        } catch (e) { settingsLoaded.value = true; }
      }

      async function saveSettings() {
        try {
          await api('/settings', { method: 'POST', body: { apiKey: apiKey.value, token: apiToken.value } });
          ElMessage.success(t('saved'));
          if (apiKey.value && apiToken.value) {
            view.value = 'boards';
            loadBoards();
          }
        } catch (e) { ElMessage.error(t('error') + ': ' + e.message); }
      }

      function hasCredentials() {
        return apiKey.value && apiToken.value;
      }

      // ── Boards ──
      async function loadBoards() {
        if (!hasCredentials()) { view.value = 'settings'; return; }
        loading.value = true;
        try {
          boards.value = await api('/boards');
        } catch (e) { ElMessage.error(e.message); boards.value = []; }
        loading.value = false;
      }

      function getBoardColor(board) {
        if (board.prefs && board.prefs.backgroundTopColor) return board.prefs.backgroundTopColor;
        if (board.prefs && board.prefs.backgroundColor) return board.prefs.backgroundColor;
        return '#0079bf';
      }

      // ── Open board ──
      async function openBoard(board) {
        currentBoard.value = board;
        view.value = 'board';
        await loadBoardData(board.id);
      }

      async function loadBoardData(boardId) {
        loading.value = true;
        lists.value = [];
        cardsByList.value = {};
        try {
          var boardLists = await api('/boards/' + boardId + '/lists');
          lists.value = boardLists;
          // Load cards for each list in parallel
          var promises = boardLists.map(function(list) {
            return api('/lists/' + list.id + '/cards').then(function(cards) {
              cardsByList.value[list.id] = cards;
            }).catch(function() {
              cardsByList.value[list.id] = [];
            });
          });
          await Promise.all(promises);
        } catch (e) { ElMessage.error(e.message); }
        loading.value = false;
      }

      // ── Add list ──
      function openAddList() {
        newListName.value = '';
        showAddList.value = true;
      }

      async function createList() {
        if (!newListName.value.trim() || !currentBoard.value) return;
        try {
          await api('/boards/' + currentBoard.value.id + '/lists', { method: 'POST', body: { name: newListName.value.trim() } });
          showAddList.value = false;
          await loadBoardData(currentBoard.value.id);
        } catch (e) { ElMessage.error(e.message); }
      }

      // ── Add card ──
      function openAddCard(listId) {
        addCardListId.value = listId;
        newCardName.value = '';
        newCardDesc.value = '';
        showAddCard.value = true;
      }

      async function createCard() {
        if (!newCardName.value.trim() || !addCardListId.value) return;
        try {
          var body = { idList: addCardListId.value, name: newCardName.value.trim() };
          if (newCardDesc.value.trim()) body.desc = newCardDesc.value.trim();
          await api('/cards', { method: 'POST', body: body });
          showAddCard.value = false;
          await loadBoardData(currentBoard.value.id);
        } catch (e) { ElMessage.error(e.message); }
      }

      // ── Card detail ──
      function openCardDetail(card) {
        detailCard.value = card;
        editingCardName.value = card.name;
        editingCardDesc.value = card.desc || '';
        editingCardDue.value = card.due ? card.due.substring(0, 10) : '';
        showCardDetail.value = true;
      }

      async function saveCardChanges() {
        if (!detailCard.value) return;
        try {
          var body = { name: editingCardName.value };
          body.desc = editingCardDesc.value;
          if (editingCardDue.value) body.due = editingCardDue.value;
          else body.due = null;
          await api('/cards/' + detailCard.value.id, { method: 'PUT', body: body });
          showCardDetail.value = false;
          await loadBoardData(currentBoard.value.id);
        } catch (e) { ElMessage.error(e.message); }
      }

      async function archiveCard(cardId) {
        try {
          await api('/cards/' + cardId, { method: 'DELETE' });
          showCardDetail.value = false;
          await loadBoardData(currentBoard.value.id);
        } catch (e) { ElMessage.error(e.message); }
      }

      async function toggleCardDone(card) {
        try {
          await api('/cards/' + card.id, { method: 'PUT', body: { dueComplete: !card.dueComplete } });
          await loadBoardData(currentBoard.value.id);
        } catch (e) { ElMessage.error(e.message); }
      }

      // ── Drag & Drop ──
      function onDragStart(e, card) {
        dragCard.value = card;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', card.id);
      }

      function onDragOver(e, listId) {
        e.preventDefault();
        dragOverList.value = listId;
      }

      function onDragLeave(e, listId) {
        if (dragOverList.value === listId) dragOverList.value = null;
      }

      async function onDrop(e, listId) {
        e.preventDefault();
        dragOverList.value = null;
        if (!dragCard.value) return;
        var card = dragCard.value;
        dragCard.value = null;
        if (card.idList === listId) return;
        try {
          await api('/cards/' + card.id, { method: 'PUT', body: { idList: listId } });
          await loadBoardData(currentBoard.value.id);
        } catch (e2) { ElMessage.error(e2.message); }
      }

      // ── Navigation ──
      function goBoards() {
        currentBoard.value = null;
        view.value = 'boards';
        loadBoards();
      }

      function openInTrello() {
        if (currentBoard.value && currentBoard.value.url) {
          window.open(currentBoard.value.url, '_blank');
        }
      }

      function getLabelColor(label) {
        var map = { green:'#61bd4f', yellow:'#f2d600', orange:'#ff9f1a', red:'#eb5a46',
          purple:'#c377e0', blue:'#0079bf', sky:'#00c2e0', lime:'#51e898',
          pink:'#ff78cb', black:'#344563' };
        return map[label.color] || '#838c91';
      }

      function formatDue(due) {
        if (!due) return '';
        return due.substring(0, 10);
      }

      // ── Lifecycle ──
      onMounted(function() {
        window.addEventListener('locale-changed', onLocaleChanged);
        loadSettings().then(function() {
          if (hasCredentials()) loadBoards();
        });
      });

      onUnmounted(function() {
        window.removeEventListener('locale-changed', onLocaleChanged);
      });

      return {
        t, view, loading, apiKey, apiToken, settingsLoaded,
        boards, currentBoard, lists, cardsByList,
        showAddList, newListName, showAddCard, addCardListId, newCardName, newCardDesc,
        showCardDetail, detailCard, editingCardName, editingCardDesc, editingCardDue,
        dragCard, dragOverList,
        saveSettings, loadBoards, openBoard, loadBoardData,
        openAddList, createList, openAddCard, createCard,
        openCardDetail, saveCardChanges, archiveCard, toggleCardDone,
        onDragStart, onDragOver, onDragLeave, onDrop,
        goBoards, openInTrello, getBoardColor, getLabelColor, formatDue, hasCredentials
      };
    }
  };
})(Vue);
