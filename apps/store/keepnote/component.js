(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, watch, nextTick } = Vue;

  const LANGS = {
    tr: {
      title:'Notlar', newNote:'Not al...', newTitle:'Başlık', save:'Kapat', pin:'Sabitle', unpin:'Sabitlemeyi kaldır',
      archive:'Arşivle', unarchive:'Arşivden çıkar', delete:'Sil', duplicate:'Kopyala',
      color:'Renk', label:'Etiket', labels:'Etiketler', addLabel:'Etiket ekle', newLabel:'Yeni etiket',
      checklist:'Kontrol Listesi', text:'Metin', addItem:'Öğe ekle', search:'Notlarda ara...',
      all:'Tümü', pinned:'Sabitlenmiş', archived:'Arşiv', trash:'Çöp Kutusu',
      others:'Diğerleri', emptyNotes:'Not yok', emptyArchive:'Arşiv boş', emptyTrash:'Çöp kutusu boş',
      deleteForever:'Kalıcı olarak sil', restore:'Geri yükle', emptyTrashAction:'Çöp kutusunu boşalt',
      gridView:'Izgara', listView:'Liste', editNote:'Notu düzenle', noteText:'Not yazın...',
      deleteLabelConfirm:'Bu etiket silinsin mi?', noLabels:'Etiket yok',
      reminder:'Hatırlatma', addReminder:'Hatırlatma ekle', reminderDate:'Tarih ve saat',
      reminderAdded:'Hatırlatma eklendi', shareNote:'Notu paylaş',
      editLabels:'Etiketleri düzenle', manageLabels:'Etiketleri yönet'
    },
    en: {
      title:'Notes', newNote:'Take a note...', newTitle:'Title', save:'Close', pin:'Pin', unpin:'Unpin',
      archive:'Archive', unarchive:'Unarchive', delete:'Delete', duplicate:'Duplicate',
      color:'Color', label:'Label', labels:'Labels', addLabel:'Add label', newLabel:'New label',
      checklist:'Checklist', text:'Text', addItem:'Add item', search:'Search notes...',
      all:'All', pinned:'Pinned', archived:'Archive', trash:'Trash',
      others:'Others', emptyNotes:'No notes', emptyArchive:'Archive is empty', emptyTrash:'Trash is empty',
      deleteForever:'Delete forever', restore:'Restore', emptyTrashAction:'Empty trash',
      gridView:'Grid view', listView:'List view', editNote:'Edit note', noteText:'Write a note...',
      deleteLabelConfirm:'Delete this label?', noLabels:'No labels',
      reminder:'Reminder', addReminder:'Add reminder', reminderDate:'Date and time',
      reminderAdded:'Reminder added', shareNote:'Share note',
      editLabels:'Edit labels', manageLabels:'Manage labels'
    },
    de: {
      title:'Notizen', newNote:'Notiz erstellen...', newTitle:'Titel', save:'Schließen', pin:'Anheften', unpin:'Lösen',
      archive:'Archivieren', unarchive:'Wiederherstellen', delete:'Löschen', duplicate:'Duplizieren',
      color:'Farbe', label:'Label', labels:'Labels', addLabel:'Label hinzufügen', newLabel:'Neues Label',
      checklist:'Checkliste', text:'Text', addItem:'Eintrag hinzufügen', search:'Notizen suchen...',
      all:'Alle', pinned:'Angeheftet', archived:'Archiv', trash:'Papierkorb',
      others:'Andere', emptyNotes:'Keine Notizen', emptyArchive:'Archiv ist leer', emptyTrash:'Papierkorb ist leer',
      deleteForever:'Endgültig löschen', restore:'Wiederherstellen', emptyTrashAction:'Papierkorb leeren',
      gridView:'Rasteransicht', listView:'Listenansicht', editNote:'Notiz bearbeiten', noteText:'Notiz schreiben...',
      deleteLabelConfirm:'Dieses Label löschen?', noLabels:'Keine Labels',
      reminder:'Erinnerung', addReminder:'Erinnerung hinzufügen', reminderDate:'Datum und Uhrzeit',
      reminderAdded:'Erinnerung hinzugefügt', shareNote:'Notiz teilen',
      editLabels:'Labels bearbeiten', manageLabels:'Labels verwalten'
    },
    fr: {
      title:'Notes', newNote:'Créer une note...', newTitle:'Titre', save:'Fermer', pin:'Épingler', unpin:'Désépingler',
      archive:'Archiver', unarchive:'Désarchiver', delete:'Supprimer', duplicate:'Dupliquer',
      color:'Couleur', label:'Étiquette', labels:'Étiquettes', addLabel:'Ajouter une étiquette', newLabel:'Nouvelle étiquette',
      checklist:'Checklist', text:'Texte', addItem:'Ajouter un élément', search:'Rechercher dans les notes...',
      all:'Tout', pinned:'Épinglées', archived:'Archives', trash:'Corbeille',
      others:'Autres', emptyNotes:'Aucune note', emptyArchive:'Archives vides', emptyTrash:'Corbeille vide',
      deleteForever:'Supprimer définitivement', restore:'Restaurer', emptyTrashAction:'Vider la corbeille',
      gridView:'Grille', listView:'Liste', editNote:'Modifier la note', noteText:'Écrire une note...',
      deleteLabelConfirm:'Supprimer cette étiquette?', noLabels:'Aucune étiquette',
      reminder:'Rappel', addReminder:'Ajouter un rappel', reminderDate:'Date et heure',
      reminderAdded:'Rappel ajouté', shareNote:'Partager la note',
      editLabels:'Modifier les étiquettes', manageLabels:'Gérer les étiquettes'
    },
    es: {
      title:'Notas', newNote:'Crear una nota...', newTitle:'Título', save:'Cerrar', pin:'Fijar', unpin:'Desfijar',
      archive:'Archivar', unarchive:'Desarchivar', delete:'Eliminar', duplicate:'Duplicar',
      color:'Color', label:'Etiqueta', labels:'Etiquetas', addLabel:'Agregar etiqueta', newLabel:'Nueva etiqueta',
      checklist:'Lista', text:'Texto', addItem:'Agregar elemento', search:'Buscar notas...',
      all:'Todo', pinned:'Fijadas', archived:'Archivo', trash:'Papelera',
      others:'Otras', emptyNotes:'Sin notas', emptyArchive:'Archivo vacío', emptyTrash:'Papelera vacía',
      deleteForever:'Eliminar permanentemente', restore:'Restaurar', emptyTrashAction:'Vaciar papelera',
      gridView:'Cuadrícula', listView:'Lista', editNote:'Editar nota', noteText:'Escribir una nota...',
      deleteLabelConfirm:'¿Eliminar esta etiqueta?', noLabels:'Sin etiquetas',
      reminder:'Recordatorio', addReminder:'Agregar recordatorio', reminderDate:'Fecha y hora',
      reminderAdded:'Recordatorio agregado', shareNote:'Compartir nota',
      editLabels:'Editar etiquetas', manageLabels:'Administrar etiquetas'
    },
    ru: {
      title:'Заметки', newNote:'Создать заметку...', newTitle:'Заголовок', save:'Закрыть', pin:'Закрепить', unpin:'Открепить',
      archive:'Архивировать', unarchive:'Разархивировать', delete:'Удалить', duplicate:'Дублировать',
      color:'Цвет', label:'Метка', labels:'Метки', addLabel:'Добавить метку', newLabel:'Новая метка',
      checklist:'Чек-лист', text:'Текст', addItem:'Добавить элемент', search:'Поиск заметок...',
      all:'Все', pinned:'Закреплённые', archived:'Архив', trash:'Корзина',
      others:'Другие', emptyNotes:'Нет заметок', emptyArchive:'Архив пуст', emptyTrash:'Корзина пуста',
      deleteForever:'Удалить навсегда', restore:'Восстановить', emptyTrashAction:'Очистить корзину',
      gridView:'Сетка', listView:'Список', editNote:'Редактировать', noteText:'Написать заметку...',
      deleteLabelConfirm:'Удалить метку?', noLabels:'Нет меток',
      reminder:'Напоминание', addReminder:'Добавить напоминание', reminderDate:'Дата и время',
      reminderAdded:'Напоминание добавлено', shareNote:'Поделиться',
      editLabels:'Редактировать метки', manageLabels:'Управление метками'
    },
    zh: {
      title:'笔记', newNote:'记笔记...', newTitle:'标题', save:'关闭', pin:'置顶', unpin:'取消置顶',
      archive:'归档', unarchive:'取消归档', delete:'删除', duplicate:'复制',
      color:'颜色', label:'标签', labels:'标签', addLabel:'添加标签', newLabel:'新标签',
      checklist:'清单', text:'文本', addItem:'添加项目', search:'搜索笔记...',
      all:'全部', pinned:'已置顶', archived:'归档', trash:'回收站',
      others:'其他', emptyNotes:'没有笔记', emptyArchive:'归档为空', emptyTrash:'回收站为空',
      deleteForever:'永久删除', restore:'恢复', emptyTrashAction:'清空回收站',
      gridView:'网格视图', listView:'列表视图', editNote:'编辑笔记', noteText:'写笔记...',
      deleteLabelConfirm:'删除此标签？', noLabels:'没有标签',
      reminder:'提醒', addReminder:'添加提醒', reminderDate:'日期和时间',
      reminderAdded:'提醒已添加', shareNote:'分享笔记',
      editLabels:'编辑标签', manageLabels:'管理标签'
    },
    ja: {
      title:'メモ', newNote:'メモを作成...', newTitle:'タイトル', save:'閉じる', pin:'ピン留め', unpin:'ピン解除',
      archive:'アーカイブ', unarchive:'アーカイブ解除', delete:'削除', duplicate:'複製',
      color:'色', label:'ラベル', labels:'ラベル', addLabel:'ラベル追加', newLabel:'新しいラベル',
      checklist:'チェックリスト', text:'テキスト', addItem:'項目追加', search:'メモを検索...',
      all:'すべて', pinned:'ピン留め', archived:'アーカイブ', trash:'ゴミ箱',
      others:'その他', emptyNotes:'メモなし', emptyArchive:'アーカイブは空です', emptyTrash:'ゴミ箱は空です',
      deleteForever:'完全に削除', restore:'復元', emptyTrashAction:'ゴミ箱を空にする',
      gridView:'グリッド', listView:'リスト', editNote:'メモを編集', noteText:'メモを書く...',
      deleteLabelConfirm:'このラベルを削除しますか？', noLabels:'ラベルなし',
      reminder:'リマインダー', addReminder:'リマインダー追加', reminderDate:'日時',
      reminderAdded:'リマインダー追加済み', shareNote:'メモを共有',
      editLabels:'ラベル編集', manageLabels:'ラベル管理'
    },
    it: {
      title:'Note', newNote:'Crea una nota...', newTitle:'Titolo', save:'Chiudi', pin:'Fissa', unpin:'Sblocca',
      archive:'Archivia', unarchive:'Ripristina', delete:'Elimina', duplicate:'Duplica',
      color:'Colore', label:'Etichetta', labels:'Etichette', addLabel:'Aggiungi etichetta', newLabel:'Nuova etichetta',
      checklist:'Checklist', text:'Testo', addItem:'Aggiungi elemento', search:'Cerca note...',
      all:'Tutte', pinned:'Fissate', archived:'Archivio', trash:'Cestino',
      others:'Altre', emptyNotes:'Nessuna nota', emptyArchive:'Archivio vuoto', emptyTrash:'Cestino vuoto',
      deleteForever:'Elimina definitivamente', restore:'Ripristina', emptyTrashAction:'Svuota cestino',
      gridView:'Griglia', listView:'Lista', editNote:'Modifica nota', noteText:'Scrivi una nota...',
      deleteLabelConfirm:'Eliminare questa etichetta?', noLabels:'Nessuna etichetta',
      reminder:'Promemoria', addReminder:'Aggiungi promemoria', reminderDate:'Data e ora',
      reminderAdded:'Promemoria aggiunto', shareNote:'Condividi nota',
      editLabels:'Modifica etichette', manageLabels:'Gestisci etichette'
    },
    ar: {
      title:'ملاحظات', newNote:'إنشاء ملاحظة...', newTitle:'العنوان', save:'إغلاق', pin:'تثبيت', unpin:'إلغاء التثبيت',
      archive:'أرشفة', unarchive:'إلغاء الأرشفة', delete:'حذف', duplicate:'نسخ',
      color:'اللون', label:'تصنيف', labels:'التصنيفات', addLabel:'إضافة تصنيف', newLabel:'تصنيف جديد',
      checklist:'قائمة تحقق', text:'نص', addItem:'إضافة عنصر', search:'البحث في الملاحظات...',
      all:'الكل', pinned:'مثبتة', archived:'الأرشيف', trash:'سلة المهملات',
      others:'أخرى', emptyNotes:'لا توجد ملاحظات', emptyArchive:'الأرشيف فارغ', emptyTrash:'سلة المهملات فارغة',
      deleteForever:'حذف نهائي', restore:'استعادة', emptyTrashAction:'تفريغ سلة المهملات',
      gridView:'شبكة', listView:'قائمة', editNote:'تعديل الملاحظة', noteText:'اكتب ملاحظة...',
      deleteLabelConfirm:'حذف هذا التصنيف؟', noLabels:'لا توجد تصنيفات',
      reminder:'تذكير', addReminder:'إضافة تذكير', reminderDate:'التاريخ والوقت',
      reminderAdded:'تم إضافة التذكير', shareNote:'مشاركة الملاحظة',
      editLabels:'تعديل التصنيفات', manageLabels:'إدارة التصنيفات'
    },
    ko: {
      title:'메모', newNote:'메모 작성...', newTitle:'제목', save:'닫기', pin:'고정', unpin:'고정 해제',
      archive:'보관', unarchive:'보관 취소', delete:'삭제', duplicate:'복제',
      color:'색상', label:'라벨', labels:'라벨', addLabel:'라벨 추가', newLabel:'새 라벨',
      checklist:'체크리스트', text:'텍스트', addItem:'항목 추가', search:'메모 검색...',
      all:'전체', pinned:'고정됨', archived:'보관함', trash:'휴지통',
      others:'기타', emptyNotes:'메모 없음', emptyArchive:'보관함 비어있음', emptyTrash:'휴지통 비어있음',
      deleteForever:'영구 삭제', restore:'복원', emptyTrashAction:'휴지통 비우기',
      gridView:'그리드', listView:'목록', editNote:'메모 편집', noteText:'메모 작성...',
      deleteLabelConfirm:'이 라벨을 삭제하시겠습니까?', noLabels:'라벨 없음',
      reminder:'알림', addReminder:'알림 추가', reminderDate:'날짜 및 시간',
      reminderAdded:'알림 추가됨', shareNote:'메모 공유',
      editLabels:'라벨 편집', manageLabels:'라벨 관리'
    },
    hi: {
      title:'नोट्स', newNote:'नोट लें...', newTitle:'शीर्षक', save:'बंद करें', pin:'पिन करें', unpin:'अनपिन करें',
      archive:'आर्काइव', unarchive:'अनआर्काइव', delete:'हटाएं', duplicate:'कॉपी',
      color:'रंग', label:'लेबल', labels:'लेबल', addLabel:'लेबल जोड़ें', newLabel:'नया लेबल',
      checklist:'चेकलिस्ट', text:'टेक्स्ट', addItem:'आइटम जोड़ें', search:'नोट्स खोजें...',
      all:'सभी', pinned:'पिन किए गए', archived:'आर्काइव', trash:'ट्रैश',
      others:'अन्य', emptyNotes:'कोई नोट नहीं', emptyArchive:'आर्काइव खाली है', emptyTrash:'ट्रैश खाली है',
      deleteForever:'स्थायी रूप से हटाएं', restore:'पुनर्स्थापित करें', emptyTrashAction:'ट्रैश खाली करें',
      gridView:'ग्रिड', listView:'सूची', editNote:'नोट संपादित करें', noteText:'नोट लिखें...',
      deleteLabelConfirm:'यह लेबल हटाएं?', noLabels:'कोई लेबल नहीं',
      reminder:'रिमाइंडर', addReminder:'रिमाइंडर जोड़ें', reminderDate:'तारीख और समय',
      reminderAdded:'रिमाइंडर जोड़ा गया', shareNote:'नोट साझा करें',
      editLabels:'लेबल संपादित करें', manageLabels:'लेबल प्रबंधित करें'
    },
    pt: {
      title:'Notas', newNote:'Criar nota...', newTitle:'Título', save:'Fechar', pin:'Fixar', unpin:'Desafixar',
      archive:'Arquivar', unarchive:'Desarquivar', delete:'Excluir', duplicate:'Duplicar',
      color:'Cor', label:'Etiqueta', labels:'Etiquetas', addLabel:'Adicionar etiqueta', newLabel:'Nova etiqueta',
      checklist:'Checklist', text:'Texto', addItem:'Adicionar item', search:'Pesquisar notas...',
      all:'Tudo', pinned:'Fixadas', archived:'Arquivo', trash:'Lixeira',
      others:'Outras', emptyNotes:'Sem notas', emptyArchive:'Arquivo vazio', emptyTrash:'Lixeira vazia',
      deleteForever:'Excluir permanentemente', restore:'Restaurar', emptyTrashAction:'Esvaziar lixeira',
      gridView:'Grade', listView:'Lista', editNote:'Editar nota', noteText:'Escrever nota...',
      deleteLabelConfirm:'Excluir esta etiqueta?', noLabels:'Sem etiquetas',
      reminder:'Lembrete', addReminder:'Adicionar lembrete', reminderDate:'Data e hora',
      reminderAdded:'Lembrete adicionado', shareNote:'Compartilhar nota',
      editLabels:'Editar etiquetas', manageLabels:'Gerenciar etiquetas'
    }
  };

  const NOTE_COLORS = [
    { id: 'default', bg: '#202124', headerBg: '#28292c', border: '#5f6368' },
    { id: 'coral',   bg: '#77172e', headerBg: '#83222f', border: '#93353a' },
    { id: 'peach',   bg: '#692b17', headerBg: '#773520', border: '#87462a' },
    { id: 'sand',    bg: '#7c4a03', headerBg: '#8a5504', border: '#9a6605' },
    { id: 'mint',    bg: '#264d3b', headerBg: '#2d5a45', border: '#346750' },
    { id: 'sage',    bg: '#0c625d', headerBg: '#0e6e68', border: '#107a73' },
    { id: 'fog',     bg: '#256377', headerBg: '#2b6f84', border: '#317b91' },
    { id: 'storm',   bg: '#284255', headerBg: '#2e4c61', border: '#34566d' },
    { id: 'dusk',    bg: '#472e5b', headerBg: '#503567', border: '#593c73' },
    { id: 'blossom', bg: '#6c394f', headerBg: '#78415a', border: '#844965' },
    { id: 'clay',    bg: '#4b443a', headerBg: '#574e44', border: '#63584e' },
    { id: 'chalk',   bg: '#232427', headerBg: '#2b2c2f', border: '#3c3d40' }
  ];

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

      // ── State ──
      const notes = ref([]);
      const labels = ref([]);
      const filter = ref('all');       // all | pinned | archived | trash | label:xxx
      const viewMode = ref('grid');    // grid | list
      const search = ref('');
      const toast = ref('');
      let toastTimer = null;

      // Editor
      const editDlg = ref(false);
      const editNote = ref(null);
      const editIsNew = ref(false);

      // New note bar
      const newBarExpanded = ref(false);
      const newTitle = ref('');
      const newContent = ref('');
      const newIsChecklist = ref(false);
      const newCheckItems = ref([]);
      const newColor = ref('default');
      const newLabels = ref([]);
      const newItemText = ref('');

      // Label manager
      const labelDlg = ref(false);
      const labelInput = ref('');

      // Reminder dialog
      const reminderDlg = ref(false);
      const reminderNoteId = ref(null);
      const reminderDatetime = ref('');

      // Color picker
      const colorPickerNoteId = ref(null);

      // Label picker
      const labelPickerNoteId = ref(null);

      // ── Computed ──
      const filteredNotes = computed(() => {
        let list = notes.value;
        const q = search.value.toLowerCase().trim();

        if (filter.value === 'all') {
          list = list.filter(n => !n.archived && !n.trashed);
        } else if (filter.value === 'pinned') {
          list = list.filter(n => n.pinned && !n.archived && !n.trashed);
        } else if (filter.value === 'archived') {
          list = list.filter(n => n.archived && !n.trashed);
        } else if (filter.value === 'trash') {
          list = list.filter(n => n.trashed);
        } else if (filter.value.startsWith('label:')) {
          const lbl = filter.value.slice(6);
          list = list.filter(n => !n.archived && !n.trashed && n.labels && n.labels.includes(lbl));
        }

        if (q) {
          list = list.filter(n => {
            const title = (n.title || '').toLowerCase();
            const content = (n.content || '').toLowerCase();
            const items = (n.check_items || []).map(i => i.text.toLowerCase()).join(' ');
            return title.includes(q) || content.includes(q) || items.includes(q);
          });
        }

        // Pinned first, then by updated_at desc
        return list.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return (b.updated_at || 0) - (a.updated_at || 0);
        });
      });

      const pinnedNotes = computed(() => filteredNotes.value.filter(n => n.pinned));
      const unpinnedNotes = computed(() => filteredNotes.value.filter(n => !n.pinned));
      const showPinnedSection = computed(() => filter.value === 'all' && pinnedNotes.value.length > 0 && unpinnedNotes.value.length > 0);

      function showToast(msg) {
        toast.value = msg;
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { toast.value = ''; }, 2200);
      }

      function getColor(id) { return NOTE_COLORS.find(c => c.id === id) || NOTE_COLORS[0]; }

      // ── API ──
      async function loadNotes() {
        try {
          const res = await fetch('/api/keep/notes');
          if (res.ok) {
            const data = await res.json();
            notes.value = data.notes || [];
            labels.value = data.labels || [];
          }
        } catch {}
      }

      async function saveAll() {
        try {
          await fetch('/api/keep/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes: notes.value, labels: labels.value })
          });
        } catch {}
      }

      let saveTimer = null;
      function debouncedSave() {
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(saveAll, 400);
      }

      // ── Note CRUD ──
      function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

      function createNote() {
        const title = newTitle.value.trim();
        const content = newContent.value.trim();
        const items = newCheckItems.value.filter(i => i.text.trim());
        if (!title && !content && !items.length) { collapseNewBar(); return; }

        const note = {
          id: genId(),
          title: title,
          content: newIsChecklist.value ? '' : content,
          is_checklist: newIsChecklist.value,
          check_items: newIsChecklist.value ? items.map(i => ({ id: genId(), text: i.text.trim(), done: i.done })) : [],
          color: newColor.value,
          pinned: false,
          archived: false,
          trashed: false,
          labels: [...newLabels.value],
          created_at: Date.now(),
          updated_at: Date.now()
        };
        notes.value.unshift(note);
        collapseNewBar();
        debouncedSave();
      }

      function collapseNewBar() {
        newBarExpanded.value = false;
        newTitle.value = '';
        newContent.value = '';
        newIsChecklist.value = false;
        newCheckItems.value = [];
        newColor.value = 'default';
        newLabels.value = [];
        newItemText.value = '';
      }

      function expandNewBar(asChecklist) {
        newBarExpanded.value = true;
        newIsChecklist.value = !!asChecklist;
        if (asChecklist && !newCheckItems.value.length) {
          newCheckItems.value.push({ text: '', done: false });
        }
      }

      function addNewCheckItem() {
        const t = newItemText.value.trim();
        if (!t) return;
        newCheckItems.value.push({ text: t, done: false });
        newItemText.value = '';
      }

      function removeNewCheckItem(i) { newCheckItems.value.splice(i, 1); }

      // ── Edit note ──
      function openEdit(note) {
        editNote.value = JSON.parse(JSON.stringify(note));
        editIsNew.value = false;
        editDlg.value = true;
      }

      function saveEdit() {
        if (!editNote.value) { editDlg.value = false; return; }
        const idx = notes.value.findIndex(n => n.id === editNote.value.id);
        if (idx >= 0) {
          editNote.value.updated_at = Date.now();
          notes.value[idx] = editNote.value;
        }
        editDlg.value = false;
        debouncedSave();
      }

      function addEditCheckItem() {
        if (!editNote.value) return;
        editNote.value.check_items.push({ id: genId(), text: '', done: false });
        nextTick(() => {
          const inputs = document.querySelectorAll('.gk-edit-check-input');
          if (inputs.length) inputs[inputs.length - 1].focus();
        });
      }

      function removeEditCheckItem(i) {
        if (editNote.value) editNote.value.check_items.splice(i, 1);
      }

      // ── Note actions ──
      function togglePin(note) {
        note.pinned = !note.pinned;
        note.updated_at = Date.now();
        debouncedSave();
      }

      function archiveNote(note) {
        note.archived = !note.archived;
        note.pinned = false;
        note.updated_at = Date.now();
        debouncedSave();
      }

      function trashNote(note) {
        note.trashed = true;
        note.pinned = false;
        note.updated_at = Date.now();
        debouncedSave();
      }

      function restoreNote(note) {
        note.trashed = false;
        note.archived = false;
        note.updated_at = Date.now();
        debouncedSave();
      }

      function deleteForever(note) {
        notes.value = notes.value.filter(n => n.id !== note.id);
        debouncedSave();
      }

      function emptyTrash() {
        notes.value = notes.value.filter(n => !n.trashed);
        debouncedSave();
      }

      function duplicateNote(note) {
        const dup = JSON.parse(JSON.stringify(note));
        dup.id = genId();
        dup.pinned = false;
        dup.created_at = Date.now();
        dup.updated_at = Date.now();
        notes.value.unshift(dup);
        debouncedSave();
      }

      function setNoteColor(noteId, colorId) {
        const n = notes.value.find(n => n.id === noteId);
        if (n) { n.color = colorId; n.updated_at = Date.now(); debouncedSave(); }
        colorPickerNoteId.value = null;
      }

      function toggleNoteLabel(noteId, label) {
        const n = notes.value.find(n => n.id === noteId);
        if (!n) return;
        if (!n.labels) n.labels = [];
        const idx = n.labels.indexOf(label);
        if (idx >= 0) n.labels.splice(idx, 1);
        else n.labels.push(label);
        n.updated_at = Date.now();
        debouncedSave();
      }

      function toggleCheckItem(note, itemIdx) {
        if (note.check_items && note.check_items[itemIdx]) {
          note.check_items[itemIdx].done = !note.check_items[itemIdx].done;
          note.updated_at = Date.now();
          debouncedSave();
        }
      }

      // ── Labels CRUD ──
      function addLabel() {
        const name = labelInput.value.trim();
        if (!name || labels.value.includes(name)) return;
        labels.value.push(name);
        labelInput.value = '';
        debouncedSave();
      }

      function deleteLabel(lbl) {
        labels.value = labels.value.filter(l => l !== lbl);
        // Remove from all notes
        notes.value.forEach(n => {
          if (n.labels) n.labels = n.labels.filter(l => l !== lbl);
        });
        if (filter.value === 'label:' + lbl) filter.value = 'all';
        debouncedSave();
      }

      // ── Reminder integration ──
      function openReminderDlg(noteId) {
        reminderNoteId.value = noteId;
        const now = new Date();
        now.setMinutes(now.getMinutes() + 60);
        reminderDatetime.value = now.toISOString().slice(0, 16);
        reminderDlg.value = true;
      }

      async function submitReminder() {
        const note = notes.value.find(n => n.id === reminderNoteId.value);
        if (!note || !reminderDatetime.value) { reminderDlg.value = false; return; }
        const title = (note.title || note.content || '').slice(0, 80);
        try {
          await fetch('/api/reminders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: '📝 ' + title,
              note: note.content || '',
              datetime: new Date(reminderDatetime.value).toISOString(),
              repeat: '', sound: true, enabled: true
            })
          });
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: '🔔 ' + L('reminderAdded'),
              text: title,
              icon: '📝', bg: '#fff8e1'
            })
          });
          showToast(L('reminderAdded'));
        } catch {}
        reminderDlg.value = false;
      }

      // ── Social share ──
      function shareNote(note) {
        const text = (note.title ? note.title + '\n' : '') +
          (note.is_checklist
            ? (note.check_items || []).map(i => (i.done ? '☑' : '☐') + ' ' + i.text).join('\n')
            : (note.content || ''));
        window.dispatchEvent(new CustomEvent('social-share-content', {
          detail: { text, type: 'text' }
        }));
        window.dispatchEvent(new CustomEvent('open-app', { detail: 'social-share' }));
      }

      // ── Helpers ──
      function notePreview(note) {
        if (note.is_checklist && note.check_items && note.check_items.length) {
          return note.check_items.slice(0, 6);
        }
        return null;
      }

      function noteContentPreview(note) {
        if (note.is_checklist) return '';
        return (note.content || '').slice(0, 200);
      }

      function checkedCount(note) {
        if (!note.check_items) return 0;
        return note.check_items.filter(i => i.done).length;
      }

      // ── Lifecycle ──
      onMounted(async () => {
        await loadNotes();
        window.addEventListener('locale-changed', onLocaleChanged);
      });

      onUnmounted(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
        if (toastTimer) clearTimeout(toastTimer);
        if (saveTimer) clearTimeout(saveTimer);
      });

      return {
        L, notes, labels, filter, viewMode, search, toast,
        editDlg, editNote, editIsNew,
        newBarExpanded, newTitle, newContent, newIsChecklist, newCheckItems, newColor, newLabels, newItemText,
        labelDlg, labelInput,
        reminderDlg, reminderNoteId, reminderDatetime,
        colorPickerNoteId, labelPickerNoteId,
        filteredNotes, pinnedNotes, unpinnedNotes, showPinnedSection,
        getColor, NOTE_COLORS,
        loadNotes, createNote, collapseNewBar, expandNewBar,
        addNewCheckItem, removeNewCheckItem,
        openEdit, saveEdit, addEditCheckItem, removeEditCheckItem,
        togglePin, archiveNote, trashNote, restoreNote, deleteForever, emptyTrash,
        duplicateNote, setNoteColor, toggleNoteLabel, toggleCheckItem,
        addLabel, deleteLabel,
        openReminderDlg, submitReminder, shareNote,
        notePreview, noteContentPreview, checkedCount,
        showToast
      };
    }
  };
})(Vue);
