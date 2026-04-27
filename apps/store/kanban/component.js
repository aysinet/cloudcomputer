({
  setup() {
    const { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } = Vue;
    const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success(){}, error(){}, warning(){}, info(){} };
    const ElMessageBox = (window.ElementPlus && window.ElementPlus.ElMessageBox) || { confirm: () => Promise.resolve(), prompt: () => Promise.resolve({ value: '' }) };

    const LANGS = {
      tr: {
        title:'Kanban Panosu', addBoard:'Yeni Pano', addColumn:'Kolon Ekle', addCard:'Kart Ekle',
        editCard:'Kart Düzenle', deleteCard:'Kartı Sil', deleteColumn:'Kolonu Sil', deleteBoard:'Panoyu Sil',
        boardName:'Pano adı', columnName:'Kolon adı', cardTitle:'Kart başlığı', description:'Açıklama',
        color:'Renk', priority:'Öncelik', dueDate:'Bitiş tarihi', save:'Kaydet', cancel:'İptal',
        delete:'Sil', edit:'Düzenle', confirm:'Onayla', deleteConfirm:'Bu öğeyi silmek istediğinize emin misiniz?',
        noBoards:'Henüz pano yok. Yeni bir pano oluşturun.', importTodos:'Todo Kayıtlarını Aktar',
        importSuccess:'aktarıldı', importEmpty:'Aktarılacak todo bulunamadı',
        selectColumn:'Hangi kolona aktarılsın?', low:'Düşük', medium:'Orta', high:'Yüksek', critical:'Kritik',
        wipLimit:'WIP Limiti', cards:'kart', renameBoard:'Panoyu Yeniden Adlandır',
        renameColumn:'Kolonu Yeniden Adlandır', columnColor:'Kolon Rengi', moveLeft:'Sola Taşı', moveRight:'Sağa Taşı'
      },
      en: {
        title:'Kanban Board', addBoard:'New Board', addColumn:'Add Column', addCard:'Add Card',
        editCard:'Edit Card', deleteCard:'Delete Card', deleteColumn:'Delete Column', deleteBoard:'Delete Board',
        boardName:'Board name', columnName:'Column name', cardTitle:'Card title', description:'Description',
        color:'Color', priority:'Priority', dueDate:'Due date', save:'Save', cancel:'Cancel',
        delete:'Delete', edit:'Edit', confirm:'Confirm', deleteConfirm:'Are you sure you want to delete this item?',
        noBoards:'No boards yet. Create a new board.', importTodos:'Import Todo Items',
        importSuccess:'imported', importEmpty:'No todos to import',
        selectColumn:'Import to which column?', low:'Low', medium:'Medium', high:'High', critical:'Critical',
        wipLimit:'WIP Limit', cards:'cards', renameBoard:'Rename Board',
        renameColumn:'Rename Column', columnColor:'Column Color', moveLeft:'Move Left', moveRight:'Move Right'
      },
      de: {
        title:'Kanban-Tafel', addBoard:'Neue Tafel', addColumn:'Spalte hinzufügen', addCard:'Karte hinzufügen',
        editCard:'Karte bearbeiten', deleteCard:'Karte löschen', deleteColumn:'Spalte löschen', deleteBoard:'Tafel löschen',
        boardName:'Tafelname', columnName:'Spaltenname', cardTitle:'Kartentitel', description:'Beschreibung',
        color:'Farbe', priority:'Priorität', dueDate:'Fälligkeitsdatum', save:'Speichern', cancel:'Abbrechen',
        delete:'Löschen', edit:'Bearbeiten', confirm:'Bestätigen', deleteConfirm:'Möchten Sie dieses Element wirklich löschen?',
        noBoards:'Noch keine Tafeln. Erstellen Sie eine neue Tafel.', importTodos:'Todo-Einträge importieren',
        importSuccess:'importiert', importEmpty:'Keine Todos zum Importieren',
        selectColumn:'In welche Spalte importieren?', low:'Niedrig', medium:'Mittel', high:'Hoch', critical:'Kritisch',
        wipLimit:'WIP-Limit', cards:'Karten', renameBoard:'Tafel umbenennen',
        renameColumn:'Spalte umbenennen', columnColor:'Spaltenfarbe', moveLeft:'Nach links', moveRight:'Nach rechts'
      },
      fr: {
        title:'Tableau Kanban', addBoard:'Nouveau tableau', addColumn:'Ajouter une colonne', addCard:'Ajouter une carte',
        editCard:'Modifier la carte', deleteCard:'Supprimer la carte', deleteColumn:'Supprimer la colonne', deleteBoard:'Supprimer le tableau',
        boardName:'Nom du tableau', columnName:'Nom de la colonne', cardTitle:'Titre de la carte', description:'Description',
        color:'Couleur', priority:'Priorité', dueDate:'Date limite', save:'Enregistrer', cancel:'Annuler',
        delete:'Supprimer', edit:'Modifier', confirm:'Confirmer', deleteConfirm:'Voulez-vous vraiment supprimer cet élément ?',
        noBoards:'Aucun tableau. Créez un nouveau tableau.', importTodos:'Importer les tâches',
        importSuccess:'importées', importEmpty:'Aucune tâche à importer',
        selectColumn:'Importer dans quelle colonne ?', low:'Basse', medium:'Moyenne', high:'Haute', critical:'Critique',
        wipLimit:'Limite WIP', cards:'cartes', renameBoard:'Renommer le tableau',
        renameColumn:'Renommer la colonne', columnColor:'Couleur de colonne', moveLeft:'Déplacer à gauche', moveRight:'Déplacer à droite'
      },
      es: {
        title:'Tablero Kanban', addBoard:'Nuevo tablero', addColumn:'Añadir columna', addCard:'Añadir tarjeta',
        editCard:'Editar tarjeta', deleteCard:'Eliminar tarjeta', deleteColumn:'Eliminar columna', deleteBoard:'Eliminar tablero',
        boardName:'Nombre del tablero', columnName:'Nombre de columna', cardTitle:'Título de tarjeta', description:'Descripción',
        color:'Color', priority:'Prioridad', dueDate:'Fecha límite', save:'Guardar', cancel:'Cancelar',
        delete:'Eliminar', edit:'Editar', confirm:'Confirmar', deleteConfirm:'¿Está seguro de que desea eliminar este elemento?',
        noBoards:'No hay tableros. Cree un nuevo tablero.', importTodos:'Importar tareas',
        importSuccess:'importadas', importEmpty:'No hay tareas para importar',
        selectColumn:'¿Importar a qué columna?', low:'Baja', medium:'Media', high:'Alta', critical:'Crítica',
        wipLimit:'Límite WIP', cards:'tarjetas', renameBoard:'Renombrar tablero',
        renameColumn:'Renombrar columna', columnColor:'Color de columna', moveLeft:'Mover izquierda', moveRight:'Mover derecha'
      },
      ru: {
        title:'Канбан-доска', addBoard:'Новая доска', addColumn:'Добавить колонку', addCard:'Добавить карточку',
        editCard:'Редактировать', deleteCard:'Удалить карточку', deleteColumn:'Удалить колонку', deleteBoard:'Удалить доску',
        boardName:'Название доски', columnName:'Название колонки', cardTitle:'Заголовок', description:'Описание',
        color:'Цвет', priority:'Приоритет', dueDate:'Срок', save:'Сохранить', cancel:'Отмена',
        delete:'Удалить', edit:'Редактировать', confirm:'Подтвердить', deleteConfirm:'Вы уверены, что хотите удалить этот элемент?',
        noBoards:'Нет досок. Создайте новую доску.', importTodos:'Импорт задач',
        importSuccess:'импортировано', importEmpty:'Нет задач для импорта',
        selectColumn:'В какую колонку импортировать?', low:'Низкий', medium:'Средний', high:'Высокий', critical:'Критический',
        wipLimit:'WIP лимит', cards:'карточек', renameBoard:'Переименовать доску',
        renameColumn:'Переименовать колонку', columnColor:'Цвет колонки', moveLeft:'Влево', moveRight:'Вправо'
      },
      zh: {
        title:'看板', addBoard:'新建面板', addColumn:'添加列', addCard:'添加卡片',
        editCard:'编辑卡片', deleteCard:'删除卡片', deleteColumn:'删除列', deleteBoard:'删除面板',
        boardName:'面板名称', columnName:'列名称', cardTitle:'卡片标题', description:'描述',
        color:'颜色', priority:'优先级', dueDate:'截止日期', save:'保存', cancel:'取消',
        delete:'删除', edit:'编辑', confirm:'确认', deleteConfirm:'确定要删除此项吗？',
        noBoards:'暂无面板。请创建新面板。', importTodos:'导入待办事项',
        importSuccess:'已导入', importEmpty:'无待办事项可导入',
        selectColumn:'导入到哪一列？', low:'低', medium:'中', high:'高', critical:'紧急',
        wipLimit:'在制品限制', cards:'卡片', renameBoard:'重命名面板',
        renameColumn:'重命名列', columnColor:'列颜色', moveLeft:'左移', moveRight:'右移'
      },
      ja: {
        title:'カンバンボード', addBoard:'新規ボード', addColumn:'列を追加', addCard:'カード追加',
        editCard:'カード編集', deleteCard:'カード削除', deleteColumn:'列を削除', deleteBoard:'ボード削除',
        boardName:'ボード名', columnName:'列名', cardTitle:'カードタイトル', description:'説明',
        color:'色', priority:'優先度', dueDate:'期限', save:'保存', cancel:'キャンセル',
        delete:'削除', edit:'編集', confirm:'確認', deleteConfirm:'このアイテムを削除しますか？',
        noBoards:'ボードがありません。新しいボードを作成してください。', importTodos:'Todoをインポート',
        importSuccess:'インポート済', importEmpty:'インポートするTodoがありません',
        selectColumn:'どの列にインポートしますか？', low:'低', medium:'中', high:'高', critical:'緊急',
        wipLimit:'WIP制限', cards:'カード', renameBoard:'ボード名変更',
        renameColumn:'列名変更', columnColor:'列の色', moveLeft:'左へ移動', moveRight:'右へ移動'
      },
      it: {
        title:'Bacheca Kanban', addBoard:'Nuova bacheca', addColumn:'Aggiungi colonna', addCard:'Aggiungi scheda',
        editCard:'Modifica scheda', deleteCard:'Elimina scheda', deleteColumn:'Elimina colonna', deleteBoard:'Elimina bacheca',
        boardName:'Nome bacheca', columnName:'Nome colonna', cardTitle:'Titolo scheda', description:'Descrizione',
        color:'Colore', priority:'Priorità', dueDate:'Scadenza', save:'Salva', cancel:'Annulla',
        delete:'Elimina', edit:'Modifica', confirm:'Conferma', deleteConfirm:'Sei sicuro di voler eliminare questo elemento?',
        noBoards:'Nessuna bacheca. Crea una nuova bacheca.', importTodos:'Importa attività',
        importSuccess:'importate', importEmpty:'Nessuna attività da importare',
        selectColumn:'In quale colonna importare?', low:'Bassa', medium:'Media', high:'Alta', critical:'Critica',
        wipLimit:'Limite WIP', cards:'schede', renameBoard:'Rinomina bacheca',
        renameColumn:'Rinomina colonna', columnColor:'Colore colonna', moveLeft:'Sposta a sinistra', moveRight:'Sposta a destra'
      }
    };

    const PRIORITY_COLORS = ['', '#909399', '#e6a23c', '#f56c6c', '#ff2d2d'];
    const CARD_COLORS = ['', '#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#9b59b6', '#00bcd4', '#ff9800', '#795548'];
    const COL_COLORS = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#9b59b6', '#00bcd4', '#ff9800', '#607d8b'];

    function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }
    const locale = ref(getLocale());
    function t(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
    function onLocaleChanged() { locale.value = getLocale(); }

    function getToken() { return localStorage.getItem('auth_token') || ''; }
    function authHeaders() { return { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }

    const boards = ref([]);
    const activeBoardId = ref(null);
    const columns = ref([]);
    const loading = ref(false);

    /* Card dialog */
    const cardDialog = ref(false);
    const cardForm = reactive({ id: null, column_id: null, title: '', description: '', color: '', priority: 0, due_date: '' });
    const isEditCard = computed(() => !!cardForm.id);

    /* Drag state */
    const dragCard = ref(null);
    const dragOverCol = ref(null);
    const dragOverIdx = ref(-1);

    const activeBoard = computed(() => boards.value.find(b => b.id === activeBoardId.value));

    async function api(url, opts) {
      const r = await fetch(url, { headers: authHeaders(), ...opts });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'API error');
      return d;
    }

    /* ── Boards ── */
    async function loadBoards() {
      boards.value = await api('/api/kanban/boards');
      if (boards.value.length && !activeBoardId.value) activeBoardId.value = boards.value[0].id;
      if (activeBoardId.value) await loadColumns();
    }

    async function addBoard() {
      try {
        const { value } = await ElMessageBox.prompt(t('boardName'), t('addBoard'), { confirmButtonText: t('save'), cancelButtonText: t('cancel') });
        if (!value || !value.trim()) return;
        const b = await api('/api/kanban/boards', { method: 'POST', body: JSON.stringify({ name: value.trim() }) });
        boards.value.push(b);
        activeBoardId.value = b.id;
        await loadColumns();
      } catch {}
    }

    async function renameBoard() {
      if (!activeBoard.value) return;
      try {
        const { value } = await ElMessageBox.prompt(t('boardName'), t('renameBoard'), { inputValue: activeBoard.value.name, confirmButtonText: t('save'), cancelButtonText: t('cancel') });
        if (!value || !value.trim()) return;
        await api('/api/kanban/boards/' + activeBoardId.value, { method: 'PUT', body: JSON.stringify({ name: value.trim() }) });
        activeBoard.value.name = value.trim();
      } catch {}
    }

    async function deleteBoard() {
      if (!activeBoardId.value) return;
      try {
        await ElMessageBox.confirm(t('deleteConfirm'), t('deleteBoard'), { type: 'warning', confirmButtonText: t('confirm'), cancelButtonText: t('cancel') });
        await api('/api/kanban/boards/' + activeBoardId.value, { method: 'DELETE' });
        boards.value = boards.value.filter(b => b.id !== activeBoardId.value);
        activeBoardId.value = boards.value.length ? boards.value[0].id : null;
        if (activeBoardId.value) await loadColumns(); else columns.value = [];
      } catch {}
    }

    function switchBoard(id) {
      activeBoardId.value = id;
      loadColumns();
    }

    /* ── Columns ── */
    async function loadColumns() {
      if (!activeBoardId.value) { columns.value = []; return; }
      loading.value = true;
      try {
        columns.value = await api('/api/kanban/boards/' + activeBoardId.value + '/columns');
      } catch { columns.value = []; }
      loading.value = false;
    }

    async function addColumn() {
      if (!activeBoardId.value) return;
      try {
        const { value } = await ElMessageBox.prompt(t('columnName'), t('addColumn'), { confirmButtonText: t('save'), cancelButtonText: t('cancel') });
        if (!value || !value.trim()) return;
        const col = await api('/api/kanban/columns', { method: 'POST', body: JSON.stringify({ board_id: activeBoardId.value, name: value.trim() }) });
        columns.value.push(col);
      } catch {}
    }

    async function renameColumn(col) {
      try {
        const { value } = await ElMessageBox.prompt(t('columnName'), t('renameColumn'), { inputValue: col.name, confirmButtonText: t('save'), cancelButtonText: t('cancel') });
        if (!value || !value.trim()) return;
        await api('/api/kanban/columns/' + col.id, { method: 'PUT', body: JSON.stringify({ name: value.trim() }) });
        col.name = value.trim();
      } catch {}
    }

    async function changeColumnColor(col, color) {
      col.color = color;
      await api('/api/kanban/columns/' + col.id, { method: 'PUT', body: JSON.stringify({ color }) });
    }

    async function deleteColumn(col) {
      try {
        await ElMessageBox.confirm(t('deleteConfirm'), t('deleteColumn'), { type: 'warning', confirmButtonText: t('confirm'), cancelButtonText: t('cancel') });
        await api('/api/kanban/columns/' + col.id, { method: 'DELETE' });
        columns.value = columns.value.filter(c => c.id !== col.id);
      } catch {}
    }

    async function moveColumn(col, dir) {
      const idx = columns.value.indexOf(col);
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= columns.value.length) return;
      columns.value.splice(idx, 1);
      columns.value.splice(newIdx, 0, col);
      const updates = columns.value.map((c, i) => api('/api/kanban/columns/' + c.id, { method: 'PUT', body: JSON.stringify({ sort_order: i }) }));
      await Promise.all(updates);
    }

    /* ── Cards ── */
    function openAddCard(colId) {
      Object.assign(cardForm, { id: null, column_id: colId, title: '', description: '', color: '', priority: 0, due_date: '' });
      cardDialog.value = true;
    }

    function openEditCard(card) {
      Object.assign(cardForm, { id: card.id, column_id: card.column_id, title: card.title, description: card.description || '', color: card.color || '', priority: card.priority || 0, due_date: card.due_date || '' });
      cardDialog.value = true;
    }

    async function saveCard() {
      if (!cardForm.title.trim()) return;
      if (cardForm.id) {
        await api('/api/kanban/cards/' + cardForm.id, { method: 'PUT', body: JSON.stringify({ title: cardForm.title, description: cardForm.description, color: cardForm.color, priority: cardForm.priority, due_date: cardForm.due_date }) });
        const col = columns.value.find(c => c.cards && c.cards.some(k => k.id === cardForm.id));
        if (col) {
          const card = col.cards.find(k => k.id === cardForm.id);
          if (card) Object.assign(card, { title: cardForm.title, description: cardForm.description, color: cardForm.color, priority: cardForm.priority, due_date: cardForm.due_date });
        }
      } else {
        const card = await api('/api/kanban/cards', { method: 'POST', body: JSON.stringify({ column_id: cardForm.column_id, title: cardForm.title, description: cardForm.description, color: cardForm.color, priority: cardForm.priority, due_date: cardForm.due_date }) });
        const col = columns.value.find(c => c.id === cardForm.column_id);
        if (col) { if (!col.cards) col.cards = []; col.cards.push(card); }
      }
      cardDialog.value = false;
    }

    async function deleteCard(col, card) {
      try {
        await ElMessageBox.confirm(t('deleteConfirm'), t('deleteCard'), { type: 'warning', confirmButtonText: t('confirm'), cancelButtonText: t('cancel') });
        await api('/api/kanban/cards/' + card.id, { method: 'DELETE' });
        col.cards = col.cards.filter(c => c.id !== card.id);
      } catch {}
    }

    /* ── Drag & Drop ── */
    function onDragStart(e, card, col) {
      dragCard.value = { card, fromCol: col };
      e.dataTransfer.effectAllowed = 'move';
      e.target.classList.add('dragging');
    }

    function onDragEnd(e) {
      e.target.classList.remove('dragging');
      dragCard.value = null;
      dragOverCol.value = null;
      dragOverIdx.value = -1;
    }

    function onDragOverCol(e, col, idx) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      dragOverCol.value = col.id;
      dragOverIdx.value = idx;
    }

    function onDragOverEmpty(e, col) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      dragOverCol.value = col.id;
      dragOverIdx.value = col.cards ? col.cards.length : 0;
    }

    async function onDrop(e, targetCol) {
      e.preventDefault();
      if (!dragCard.value) return;
      const { card, fromCol } = dragCard.value;
      let targetIdx = dragOverIdx.value >= 0 ? dragOverIdx.value : (targetCol.cards ? targetCol.cards.length : 0);
      // Remove from source
      if (fromCol.cards) fromCol.cards = fromCol.cards.filter(c => c.id !== card.id);
      // Insert into target
      if (!targetCol.cards) targetCol.cards = [];
      if (targetIdx > targetCol.cards.length) targetIdx = targetCol.cards.length;
      targetCol.cards.splice(targetIdx, 0, card);
      card.column_id = targetCol.id;
      dragCard.value = null;
      dragOverCol.value = null;
      dragOverIdx.value = -1;
      await api('/api/kanban/move-card', { method: 'POST', body: JSON.stringify({ cardId: card.id, targetColumnId: targetCol.id, targetIndex: targetIdx }) });
    }

    /* ── Import Todos ── */
    async function importTodos() {
      if (!activeBoardId.value || !columns.value.length) return;
      let targetColId;
      if (columns.value.length === 1) {
        targetColId = columns.value[0].id;
      } else {
        try {
          const opts = columns.value.map(c => c.name);
          const { value } = await ElMessageBox.prompt(
            t('selectColumn') + '\n' + columns.value.map((c, i) => (i + 1) + '. ' + c.name).join('\n'),
            t('importTodos'),
            { inputValue: '1', confirmButtonText: t('confirm'), cancelButtonText: t('cancel') }
          );
          const idx = parseInt(value) - 1;
          if (idx < 0 || idx >= columns.value.length) return;
          targetColId = columns.value[idx].id;
        } catch { return; }
      }
      try {
        const r = await api('/api/kanban/import-todos', { method: 'POST', body: JSON.stringify({ boardId: activeBoardId.value, columnId: targetColId }) });
        if (r.imported > 0) {
          ElMessage.success(r.imported + ' ' + t('importSuccess'));
          await loadColumns();
        } else {
          ElMessage.info(t('importEmpty'));
        }
      } catch (e) { ElMessage.error(e.message); }
    }

    function priorityLabel(p) {
      return ['-', t('low'), t('medium'), t('high'), t('critical')][p] || '-';
    }

    function priorityColor(p) { return PRIORITY_COLORS[p] || ''; }

    onMounted(() => {
      window.addEventListener('locale-changed', onLocaleChanged);
      loadBoards();
    });

    onUnmounted(() => {
      window.removeEventListener('locale-changed', onLocaleChanged);
    });

    return {
      t, boards, activeBoardId, activeBoard, columns, loading,
      cardDialog, cardForm, isEditCard,
      dragCard, dragOverCol, dragOverIdx,
      CARD_COLORS, COL_COLORS, PRIORITY_COLORS,
      loadBoards, addBoard, renameBoard, deleteBoard, switchBoard,
      loadColumns, addColumn, renameColumn, changeColumnColor, deleteColumn, moveColumn,
      openAddCard, openEditCard, saveCard, deleteCard,
      onDragStart, onDragEnd, onDragOverCol, onDragOverEmpty, onDrop,
      importTodos, priorityLabel, priorityColor
    };
  }
})
