({
  setup() {
    const { ref, computed, onMounted, onUnmounted } = Vue;
    const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success(){}, error(){}, warning(){} };
    const ElMessageBox = (window.ElementPlus && window.ElementPlus.ElMessageBox) || { confirm: () => Promise.resolve() };

    /* ── i18n ── */
    const LANGS = {
      tr: {
        title:'PostIt Notlar',
        newPostit:'Yeni PostIt',
        noPostits:'Henüz postit yok',
        empty:'Boş not',
        deleteConfirm:'Bu notu silmek istediğinize emin misiniz?',
        delete:'Sil',
        yes:'Evet',
        cancel:'İptal',
        hide:'Gizle',
        show:'Göster',
        showAll:'Tümünü Göster',
        hideAll:'Tümünü Gizle',
        loading:'Yükleniyor...',
        placeholder:'Not yazın...',
        yellow:'Sarı',
        pink:'Pembe',
        blue:'Mavi',
        green:'Yeşil',
        purple:'Mor',
        orange:'Turuncu',
        color:'Renk',
        manager:'Yönetici',
        notes:'not'
      },
      en: {
        title:'PostIt Notes',
        newPostit:'New PostIt',
        noPostits:'No postits yet',
        empty:'Empty note',
        deleteConfirm:'Are you sure you want to delete this note?',
        delete:'Delete',
        yes:'Yes',
        cancel:'Cancel',
        hide:'Hide',
        show:'Show',
        showAll:'Show All',
        hideAll:'Hide All',
        loading:'Loading...',
        placeholder:'Write a note...',
        yellow:'Yellow',
        pink:'Pink',
        blue:'Blue',
        green:'Green',
        purple:'Purple',
        orange:'Orange',
        color:'Color',
        manager:'Manager',
        notes:'notes'
      },
      de: {
        title:'PostIt Notizen',
        newPostit:'Neue Notiz',
        noPostits:'Noch keine Notizen',
        empty:'Leere Notiz',
        deleteConfirm:'Möchten Sie diese Notiz wirklich löschen?',
        delete:'Löschen',
        yes:'Ja',
        cancel:'Abbrechen',
        hide:'Ausblenden',
        show:'Einblenden',
        showAll:'Alle anzeigen',
        hideAll:'Alle ausblenden',
        loading:'Laden...',
        placeholder:'Notiz schreiben...',
        yellow:'Gelb',
        pink:'Rosa',
        blue:'Blau',
        green:'Grün',
        purple:'Lila',
        orange:'Orange',
        color:'Farbe',
        manager:'Verwaltung',
        notes:'Notizen'
      },
      fr: {
        title:'Notes PostIt',
        newPostit:'Nouvelle Note',
        noPostits:'Aucune note',
        empty:'Note vide',
        deleteConfirm:'Êtes-vous sûr de vouloir supprimer cette note ?',
        delete:'Supprimer',
        yes:'Oui',
        cancel:'Annuler',
        hide:'Masquer',
        show:'Afficher',
        showAll:'Tout afficher',
        hideAll:'Tout masquer',
        loading:'Chargement...',
        placeholder:'Écrire une note...',
        yellow:'Jaune',
        pink:'Rose',
        blue:'Bleu',
        green:'Vert',
        purple:'Violet',
        orange:'Orange',
        color:'Couleur',
        manager:'Gestionnaire',
        notes:'notes'
      },
      es: {
        title:'Notas PostIt',
        newPostit:'Nueva Nota',
        noPostits:'Aún no hay notas',
        empty:'Nota vacía',
        deleteConfirm:'¿Estás seguro de que quieres eliminar esta nota?',
        delete:'Eliminar',
        yes:'Sí',
        cancel:'Cancelar',
        hide:'Ocultar',
        show:'Mostrar',
        showAll:'Mostrar todo',
        hideAll:'Ocultar todo',
        loading:'Cargando...',
        placeholder:'Escribir una nota...',
        yellow:'Amarillo',
        pink:'Rosa',
        blue:'Azul',
        green:'Verde',
        purple:'Morado',
        orange:'Naranja',
        color:'Color',
        manager:'Gestor',
        notes:'notas'
      },
      ru: {
        title:'PostIt Заметки',
        newPostit:'Новая заметка',
        noPostits:'Пока нет заметок',
        empty:'Пустая заметка',
        deleteConfirm:'Вы уверены, что хотите удалить эту заметку?',
        delete:'Удалить',
        yes:'Да',
        cancel:'Отмена',
        hide:'Скрыть',
        show:'Показать',
        showAll:'Показать все',
        hideAll:'Скрыть все',
        loading:'Загрузка...',
        placeholder:'Написать заметку...',
        yellow:'Жёлтый',
        pink:'Розовый',
        blue:'Синий',
        green:'Зелёный',
        purple:'Фиолетовый',
        orange:'Оранжевый',
        color:'Цвет',
        manager:'Менеджер',
        notes:'заметки'
      },
      zh: {
        title:'便利贴',
        newPostit:'新建便利贴',
        noPostits:'没有便利贴',
        empty:'空',
        deleteConfirm:'确认删除？',
        delete:'删除',
        yes:'是',
        cancel:'取消',
        hide:'隐藏',
        show:'显示',
        showAll:'显示全部',
        hideAll:'隐藏全部',
        loading:'加载中',
        placeholder:'输入内容...',
        yellow:'黄色',
        pink:'粉色',
        blue:'蓝色',
        green:'绿色',
        purple:'紫色',
        orange:'橙色',
        color:'颜色',
        manager:'管理',
        notes:'便签'
      },
      ja: {
        title:'付箋',
        newPostit:'新しい付箋',
        noPostits:'付箋なし',
        empty:'空',
        deleteConfirm:'削除しますか？',
        delete:'削除',
        yes:'はい',
        cancel:'キャンセル',
        hide:'非表示',
        show:'表示',
        showAll:'すべて表示',
        hideAll:'すべて非表示',
        loading:'読込中',
        placeholder:'内容を入力...',
        yellow:'黄色',
        pink:'ピンク',
        blue:'青',
        green:'緑',
        purple:'紫',
        orange:'オレンジ',
        color:'色',
        manager:'管理',
        notes:'メモ'
      },
      it: {
        title:'Post-it',
        newPostit:'Nuovo Post-it',
        noPostits:'Nessun Post-it',
        empty:'Vuoto',
        deleteConfirm:'Confermi eliminazione?',
        delete:'Elimina',
        yes:'Sì',
        cancel:'Annulla',
        hide:'Nascondi',
        show:'Mostra',
        showAll:'Mostra tutti',
        hideAll:'Nascondi tutti',
        loading:'Caricamento',
        placeholder:'Scrivi qui...',
        yellow:'Giallo',
        pink:'Rosa',
        blue:'Blu',
        green:'Verde',
        purple:'Viola',
        orange:'Arancione',
        color:'Colore',
        manager:'Gestisci',
        notes:'Note'
      },
      ar: {
        title:'ملاحظات لاصقة',
        newPostit:'New PostIt',
        noPostits:'No postits yet',
        empty:'لم تتم إضافة مدن.',
        deleteConfirm:'Are you sure you want to delete this note?',
        delete:'حذف',
        yes:'نعم',
        cancel:'إلغاء',
        hide:'Hide',
        show:'Show',
        showAll:'Show All',
        hideAll:'Hide All',
        loading:'جار التحميل...',
        placeholder:'اكتب ملاحظة...',
        yellow:'Yellow',
        pink:'وردي',
        blue:'أزرق',
        green:'أخضر',
        purple:'بنفسجي',
        orange:'Orange',
        color:'اللون',
        manager:'Manager',
        notes:'ملاحظات'
      },
      ko: {
        title:'포스트잇',
        newPostit:'New PostIt',
        noPostits:'No postits yet',
        empty:'추가된 도시가 없습니다.',
        deleteConfirm:'Are you sure you want to delete this note?',
        delete:'삭제',
        yes:'예',
        cancel:'취소',
        hide:'Hide',
        show:'Show',
        showAll:'Show All',
        hideAll:'Hide All',
        loading:'로딩 중...',
        placeholder:'메모 작성...',
        yellow:'Yellow',
        pink:'분홍색',
        blue:'파란색',
        green:'녹색',
        purple:'보라색',
        orange:'Orange',
        color:'색상',
        manager:'Manager',
        notes:'메모'
      },
      hi: {
        title:'पोस्टइट नोट्स',
        newPostit:'New PostIt',
        noPostits:'No postits yet',
        empty:'कोई शहर नहीं जोड़ा गया।',
        deleteConfirm:'Are you sure you want to delete this note?',
        delete:'हटाएं',
        yes:'हाँ',
        cancel:'रद्द करें',
        hide:'Hide',
        show:'Show',
        showAll:'Show All',
        hideAll:'Hide All',
        loading:'लोड हो रहा है...',
        placeholder:'नोट लिखें...',
        yellow:'Yellow',
        pink:'गुलाबी',
        blue:'नीला',
        green:'हरा',
        purple:'बैंगनी',
        orange:'Orange',
        color:'रंग',
        manager:'Manager',
        notes:'नोट्स'
      },
      pt: {
        title:'Notas Adesivas',
        newPostit:'New PostIt',
        noPostits:'No postits yet',
        empty:'Nenhuma cidade adicionada.',
        deleteConfirm:'Are you sure you want to delete this note?',
        delete:'Excluir',
        yes:'Sim',
        cancel:'Cancelar',
        hide:'Hide',
        show:'Show',
        showAll:'Show All',
        hideAll:'Hide All',
        loading:'Carregando...',
        placeholder:'Escrever nota...',
        yellow:'Yellow',
        pink:'Rosa',
        blue:'Azul',
        green:'Verde',
        purple:'Roxo',
        orange:'Orange',
        color:'Cor',
        manager:'Manager',
        notes:'Notas'
      }
  };

    function getLocale() { return localStorage.getItem('sys_locale') || 'tr'; }
    const locale = ref(getLocale());
    const t = (k) => (LANGS[locale.value] && LANGS[locale.value][k]) || LANGS.en[k] || k;
    function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

    /* ── Colors ── */
    const COLORS = [
      { id:'yellow', header:'#f9a825', body:'#fff9c4', text:'#5d4037' },
      { id:'pink',   header:'#ec407a', body:'#fce4ec', text:'#880e4f' },
      { id:'blue',   header:'#42a5f5', body:'#e3f2fd', text:'#0d47a1' },
      { id:'green',  header:'#66bb6a', body:'#e8f5e9', text:'#1b5e20' },
      { id:'purple', header:'#ab47bc', body:'#f3e5f5', text:'#4a148c' },
      { id:'orange', header:'#ff7043', body:'#fff3e0', text:'#bf360c' }
    ];

    function getColor(id) { return COLORS.find(c => c.id === id) || COLORS[0]; }

    /* ── Auth helpers ── */
    function getToken() { return localStorage.getItem('auth_token'); }
    function authHeaders() { return { Authorization: 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }

    /* ── Global state — persists after component unmount ── */
    if (!window.__postitState) {
      window.__postitState = { trayBtn: null, trayMenu: null, trayMenuVisible: false, elements: {}, saveTimers: {} };
    }
    const G = window.__postitState;

    /* ── Reactive state ── */
    const postits = ref([]);
    const loading = ref(true);
    let topZ = 8000;

    /* ── uid ── */
    function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

    /* ── API calls ── */
    async function loadPostits() {
      loading.value = true;
      try {
        const res = await fetch('/api/postit/list', { headers: authHeaders() });
        if (res.ok) {
          postits.value = await res.json();
          postits.value.forEach(p => {
            if (p.visible) createPostitElement(p);
          });
        }
      } catch (e) { console.error('PostIt load error:', e); }
      loading.value = false;
    }

    async function savePostitToServer(p) {
      try {
        await fetch('/api/postit/save', { method: 'POST', headers: authHeaders(), body: JSON.stringify(p) });
      } catch (e) { console.error('PostIt save error:', e); }
    }

    async function deletePostitFromServer(id) {
      try {
        await fetch('/api/postit/' + encodeURIComponent(id), { method: 'DELETE', headers: authHeaders() });
      } catch (e) { console.error('PostIt delete error:', e); }
    }

    /* ── Debounced save ── */
    function debounceSave(p) {
      if (G.saveTimers[p.id]) clearTimeout(G.saveTimers[p.id]);
      G.saveTimers[p.id] = setTimeout(() => {
        savePostitToServer(p);
        delete G.saveTimers[p.id];
      }, 500);
    }

    /* ── Create postit ── */
    function createPostit(colorId) {
      const color = getColor(colorId || 'yellow');
      const p = {
        id: uid(),
        content: '',
        color: color.id,
        x: 120 + Math.floor(Math.random() * 300),
        y: 80 + Math.floor(Math.random() * 200),
        w: 220, h: 220,
        visible: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      postits.value.push(p);
      createPostitElement(p);
      savePostitToServer(p);
      closeTrayMenu();
      return p;
    }

    /* ── Delete postit ── */
    async function deletePostit(id) {
      try {
        await ElMessageBox.confirm(t('deleteConfirm'), t('delete'), {
          type: 'warning', confirmButtonText: t('yes'), cancelButtonText: t('cancel')
        });
      } catch { return; }
      removePostitElement(id);
      postits.value = postits.value.filter(x => x.id !== id);
      deletePostitFromServer(id);
    }

    /* ── Toggle visibility ── */
    function togglePostit(p) {
      p.visible = !p.visible;
      if (p.visible) createPostitElement(p);
      else removePostitElement(p.id);
      savePostitToServer(p);
    }

    function showAllPostits() {
      postits.value.forEach(p => {
        if (!p.visible) { p.visible = true; createPostitElement(p); savePostitToServer(p); }
      });
    }

    function hideAllPostits() {
      postits.value.forEach(p => {
        if (p.visible) { p.visible = false; removePostitElement(p.id); savePostitToServer(p); }
      });
    }

    /* ── Change color ── */
    function changeColor(id, colorId) {
      const p = postits.value.find(x => x.id === id);
      if (!p) return;
      p.color = colorId;
      p.updatedAt = new Date().toISOString();
      const color = getColor(colorId);
      const el = G.elements[id];
      if (el) {
        el.style.background = color.body;
        const hdr = el.querySelector('.postit-note-header');
        if (hdr) hdr.style.background = color.header;
        const body = el.querySelector('.postit-note-body');
        if (body) body.style.color = color.text;
      }
      savePostitToServer(p);
    }

    /* ── Bring to front ── */
    function bringToFront(id) {
      const el = G.elements[id];
      if (el) el.style.zIndex = ++topZ;
    }

    /* ────────────────────────────────────────── */
    /* ── DOM: Postit element creation          ── */
    /* ────────────────────────────────────────── */
    function createPostitElement(data) {
      if (G.elements[data.id]) return;
      const color = getColor(data.color);

      const el = document.createElement('div');
      el.className = 'postit-note';
      el.style.cssText = 'left:' + data.x + 'px;top:' + data.y + 'px;width:' + data.w + 'px;height:' + data.h + 'px;background:' + color.body + ';z-index:' + (++topZ) + ';';

      /* header */
      const header = document.createElement('div');
      header.className = 'postit-note-header';
      header.style.background = color.header;

      const dot = document.createElement('span');
      dot.className = 'postit-note-dot';
      dot.textContent = '📌';

      const btnWrap = document.createElement('span');
      btnWrap.className = 'postit-note-btns';

      const delBtn = document.createElement('button');
      delBtn.className = 'postit-note-btn';
      delBtn.textContent = '🗑';
      delBtn.title = t('delete');
      delBtn.onclick = function(e) { e.stopPropagation(); deletePostit(data.id); };

      const closeBtn = document.createElement('button');
      closeBtn.className = 'postit-note-btn';
      closeBtn.textContent = '✕';
      closeBtn.title = t('hide');
      closeBtn.onclick = function(e) {
        e.stopPropagation();
        var p = postits.value.find(function(x) { return x.id === data.id; });
        if (p) { p.visible = false; savePostitToServer(p); }
        removePostitElement(data.id);
      };

      btnWrap.appendChild(delBtn);
      btnWrap.appendChild(closeBtn);
      header.appendChild(dot);
      header.appendChild(btnWrap);

      /* body - textarea */
      const body = document.createElement('textarea');
      body.className = 'postit-note-body';
      body.style.color = color.text;
      body.value = data.content || '';
      body.placeholder = t('placeholder');
      body.addEventListener('input', function() {
        var p = postits.value.find(function(x) { return x.id === data.id; });
        if (p) {
          p.content = body.value;
          p.updatedAt = new Date().toISOString();
          debounceSave(p);
        }
      });

      /* resize handle */
      const resizeH = document.createElement('div');
      resizeH.className = 'postit-note-resize';

      el.appendChild(header);
      el.appendChild(body);
      el.appendChild(resizeH);
      document.body.appendChild(el);
      G.elements[data.id] = el;

      /* draggable */
      makeDraggable(el, header, data);
      /* resizable */
      makeResizable(el, resizeH, data);
      /* click to front */
      el.addEventListener('mousedown', function() { bringToFront(data.id); });
    }

    function removePostitElement(id) {
      var el = G.elements[id];
      if (el) { el.remove(); delete G.elements[id]; }
    }

    /* ── Drag ── */
    function makeDraggable(el, handle, data) {
      handle.addEventListener('mousedown', function(e) {
        if (e.target.closest('.postit-note-btn')) return;
        e.preventDefault();
        var startX = e.clientX, startY = e.clientY;
        var startLeft = el.offsetLeft, startTop = el.offsetTop;
        bringToFront(data.id);

        function onMove(ev) {
          el.style.left = Math.max(0, startLeft + ev.clientX - startX) + 'px';
          el.style.top = Math.max(0, startTop + ev.clientY - startY) + 'px';
        }
        function onUp() {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          var p = postits.value.find(function(x) { return x.id === data.id; });
          if (p) { p.x = el.offsetLeft; p.y = el.offsetTop; debounceSave(p); }
        }
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
    }

    /* ── Resize ── */
    function makeResizable(el, handle, data) {
      handle.addEventListener('mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var startX = e.clientX, startY = e.clientY;
        var startW = el.offsetWidth, startH = el.offsetHeight;
        bringToFront(data.id);

        function onMove(ev) {
          el.style.width = Math.max(160, startW + ev.clientX - startX) + 'px';
          el.style.height = Math.max(140, startH + ev.clientY - startY) + 'px';
        }
        function onUp() {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          var p = postits.value.find(function(x) { return x.id === data.id; });
          if (p) { p.w = el.offsetWidth; p.h = el.offsetHeight; debounceSave(p); }
        }
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
    }

    /* ────────────────────────────────────────── */
    /* ── Tray icon                            ── */
    /* ────────────────────────────────────────── */
    function injectTrayIcon() {
      if (G.trayBtn) { G.trayBtn.remove(); G.trayBtn = null; }
      var tray = document.querySelector('.system-tray');
      if (!tray) return;
      var btn = document.createElement('button');
      btn.className = 'tray-btn postit-tray-btn';
      btn.textContent = '📌';
      btn.title = t('title');
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleTrayMenu();
      });
      tray.insertBefore(btn, tray.firstChild);
      G.trayBtn = btn;
    }

    function removeTrayIcon() {
      if (G.trayBtn) { G.trayBtn.remove(); G.trayBtn = null; }
      closeTrayMenu();
    }

    /* ── Tray menu ── */
    function toggleTrayMenu() {
      if (G.trayMenu && G.trayMenuVisible) { closeTrayMenu(); return; }
      showTrayMenu();
    }

    function showTrayMenu() {
      closeTrayMenu();
      if (!G.trayBtn) return;
      var rect = G.trayBtn.getBoundingClientRect();

      var menu = document.createElement('div');
      menu.className = 'postit-tray-menu';
      menu.style.left = Math.max(0, rect.left - 80) + 'px';
      menu.style.bottom = (window.innerHeight - rect.top + 6) + 'px';

      /* New PostIt */
      var newItem = document.createElement('div');
      newItem.className = 'ptm-item';
      newItem.textContent = '➕ ' + t('newPostit');
      newItem.onclick = function() { createPostit('yellow'); };
      menu.appendChild(newItem);

      /* Color picker */
      var colorRow = document.createElement('div');
      colorRow.className = 'ptm-colors';
      COLORS.forEach(function(c) {
        var dot = document.createElement('button');
        dot.className = 'ptm-color-dot';
        dot.style.background = c.header;
        dot.title = t(c.id);
        dot.onclick = function(e) { e.stopPropagation(); createPostit(c.id); };
        colorRow.appendChild(dot);
      });
      menu.appendChild(colorRow);

      /* Sep */
      menu.appendChild(createSep());

      /* Show/Hide All */
      var hasVisible = postits.value.some(function(p) { return p.visible; });
      var toggleItem = document.createElement('div');
      toggleItem.className = 'ptm-item';
      toggleItem.textContent = hasVisible ? ('🙈 ' + t('hideAll')) : ('👁 ' + t('showAll'));
      toggleItem.onclick = function() { if (hasVisible) hideAllPostits(); else showAllPostits(); closeTrayMenu(); };
      menu.appendChild(toggleItem);

      /* List of postits */
      if (postits.value.length > 0) {
        menu.appendChild(createSep());
        postits.value.forEach(function(p) {
          var c = getColor(p.color);
          var item = document.createElement('div');
          item.className = 'ptm-item ptm-item-note';
          var preview = (p.content || t('empty')).replace(/\n/g, ' ').slice(0, 28);
          if (p.content && p.content.length > 28) preview += '…';
          item.innerHTML = '<span class="ptm-dot" style="background:' + c.header + '"></span>' +
            '<span class="ptm-vis">' + (p.visible ? '👁' : '🙈') + '</span> ' + preview;
          item.onclick = function() {
            if (!p.visible) { p.visible = true; createPostitElement(p); savePostitToServer(p); }
            bringToFront(p.id);
            closeTrayMenu();
          };
          menu.appendChild(item);
        });
      }

      document.body.appendChild(menu);
      G.trayMenu = menu;
      G.trayMenuVisible = true;

      setTimeout(function() {
        document.addEventListener('click', closeTrayMenuOutside);
      }, 10);
    }

    function createSep() {
      var s = document.createElement('div');
      s.className = 'ptm-sep';
      return s;
    }

    function closeTrayMenu() {
      if (G.trayMenu) { G.trayMenu.remove(); G.trayMenu = null; }
      G.trayMenuVisible = false;
      document.removeEventListener('click', closeTrayMenuOutside);
    }

    function closeTrayMenuOutside(e) {
      if (G.trayMenu && !G.trayMenu.contains(e.target) && e.target !== G.trayBtn) closeTrayMenu();
    }

    /* ── Lifecycle ── */
    onMounted(function() {
      /* Clean up stale elements from previous session */
      Object.keys(G.elements).forEach(function(id) {
        if (G.elements[id]) { G.elements[id].remove(); delete G.elements[id]; }
      });
      injectTrayIcon();
      loadPostits();
      window.addEventListener('locale-changed', onLocaleChanged);
    });

    onUnmounted(function() {
      window.removeEventListener('locale-changed', onLocaleChanged);
      /* Tray icon and postits persist after window close */
    });

    return {
      postits, loading, locale, t, COLORS, getColor,
      createPostit, deletePostit, togglePostit, changeColor,
      showAllPostits, hideAllPostits, bringToFront
    };
  }
})
