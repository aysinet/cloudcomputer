(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, watch, nextTick } = Vue;

  const LANGS = {
    tr: {
      income:'Gelir', expense:'Gider', balance:'Bakiye', pending:'Bekleyen',
      list:'Liste', charts:'Grafikler', categories:'Kategoriler',
      all:'Tümü', allStatus:'Tüm Durum', paid:'Ödendi', unpaid:'Ödenecek',
      add:'Ekle', addEntry:'Kayıt Ekle', editEntry:'Kayıt Düzenle',
      addCat:'Kategori Ekle', editCat:'Kategori Düzenle',
      type:'Tür', amount:'Tutar', category:'Kategori', description:'Açıklama',
      date:'Tarih', status:'Durum', recurring:'Tekrarlayan', none:'Yok',
      rec_weekly:'Haftalık', rec_monthly:'Aylık', rec_yearly:'Yıllık',
      selectCat:'Kategori seç', descPlaceholder:'Açıklama girin...',
      catName:'Kategori Adı', icon:'İkon', color:'Renk',
      save:'Kaydet', cancel:'İptal', today:'Bugün',
      noEntries:'Bu ay için kayıt yok', saved:'Kaydedildi', error:'Hata', deleted:'Silindi',
      incomeVsExpense:'Gelir & Gider', expenseByCat:'Gider Dağılımı', paidVsPending:'Ödenen & Bekleyen',
      paidAmt:'Ödenen', unpaidAmt:'Bekleyen',
      notifyMe:'Bildirim gönder', showOnCalendar:'Takvimde göster'
    },
    en: {
      income:'Income', expense:'Expense', balance:'Balance', pending:'Pending',
      list:'List', charts:'Charts', categories:'Categories',
      all:'All', allStatus:'All Status', paid:'Paid', unpaid:'Unpaid',
      add:'Add', addEntry:'Add Entry', editEntry:'Edit Entry',
      addCat:'Add Category', editCat:'Edit Category',
      type:'Type', amount:'Amount', category:'Category', description:'Description',
      date:'Date', status:'Status', recurring:'Recurring', none:'None',
      rec_weekly:'Weekly', rec_monthly:'Monthly', rec_yearly:'Yearly',
      selectCat:'Select category', descPlaceholder:'Enter description...',
      catName:'Category Name', icon:'Icon', color:'Color',
      save:'Save', cancel:'Cancel', today:'Today',
      noEntries:'No entries for this month', saved:'Saved', error:'Error', deleted:'Deleted',
      incomeVsExpense:'Income & Expense', expenseByCat:'Expense Breakdown', paidVsPending:'Paid & Pending',
      paidAmt:'Paid', unpaidAmt:'Pending',
      notifyMe:'Send notification', showOnCalendar:'Show on calendar'
    },
    de: {
      income:'Einnahmen', expense:'Ausgaben', balance:'Saldo', pending:'Ausstehend',
      list:'Liste', charts:'Diagramme', categories:'Kategorien',
      all:'Alle', allStatus:'Alle Status', paid:'Bezahlt', unpaid:'Unbezahlt',
      add:'Hinzufügen', addEntry:'Eintrag hinzufügen', editEntry:'Eintrag bearbeiten',
      addCat:'Kategorie hinzufügen', editCat:'Kategorie bearbeiten',
      type:'Typ', amount:'Betrag', category:'Kategorie', description:'Beschreibung',
      date:'Datum', status:'Status', recurring:'Wiederkehrend', none:'Keine',
      rec_weekly:'Wöchentlich', rec_monthly:'Monatlich', rec_yearly:'Jährlich',
      selectCat:'Kategorie wählen', descPlaceholder:'Beschreibung eingeben...',
      catName:'Kategoriename', icon:'Symbol', color:'Farbe',
      save:'Speichern', cancel:'Abbrechen', today:'Heute',
      noEntries:'Keine Einträge für diesen Monat', saved:'Gespeichert', error:'Fehler', deleted:'Gelöscht',
      incomeVsExpense:'Einnahmen & Ausgaben', expenseByCat:'Ausgabenverteilung', paidVsPending:'Bezahlt & Ausstehend',
      paidAmt:'Bezahlt', unpaidAmt:'Ausstehend',
      notifyMe:'Benachrichtigung senden', showOnCalendar:'Im Kalender anzeigen'
    },
    fr: {
      income:'Revenus', expense:'Dépenses', balance:'Solde', pending:'En attente',
      list:'Liste', charts:'Graphiques', categories:'Catégories',
      all:'Tous', allStatus:'Tous les statuts', paid:'Payé', unpaid:'Impayé',
      add:'Ajouter', addEntry:'Ajouter une entrée', editEntry:'Modifier l\'entrée',
      addCat:'Ajouter catégorie', editCat:'Modifier catégorie',
      type:'Type', amount:'Montant', category:'Catégorie', description:'Description',
      date:'Date', status:'Statut', recurring:'Récurrent', none:'Aucun',
      rec_weekly:'Hebdomadaire', rec_monthly:'Mensuel', rec_yearly:'Annuel',
      selectCat:'Sélectionner catégorie', descPlaceholder:'Entrez une description...',
      catName:'Nom de catégorie', icon:'Icône', color:'Couleur',
      save:'Enregistrer', cancel:'Annuler', today:'Aujourd\'hui',
      noEntries:'Aucune entrée pour ce mois', saved:'Enregistré', error:'Erreur', deleted:'Supprimé',
      incomeVsExpense:'Revenus & Dépenses', expenseByCat:'Répartition des dépenses', paidVsPending:'Payé & En attente',
      paidAmt:'Payé', unpaidAmt:'En attente',
      notifyMe:'Envoyer une notification', showOnCalendar:'Afficher dans le calendrier'
    },
    es: {
      income:'Ingresos', expense:'Gastos', balance:'Saldo', pending:'Pendiente',
      list:'Lista', charts:'Gráficos', categories:'Categorías',
      all:'Todos', allStatus:'Todos estados', paid:'Pagado', unpaid:'Pendiente',
      add:'Agregar', addEntry:'Agregar entrada', editEntry:'Editar entrada',
      addCat:'Agregar categoría', editCat:'Editar categoría',
      type:'Tipo', amount:'Monto', category:'Categoría', description:'Descripción',
      date:'Fecha', status:'Estado', recurring:'Recurrente', none:'Ninguno',
      rec_weekly:'Semanal', rec_monthly:'Mensual', rec_yearly:'Anual',
      selectCat:'Seleccionar categoría', descPlaceholder:'Ingrese descripción...',
      catName:'Nombre de categoría', icon:'Icono', color:'Color',
      save:'Guardar', cancel:'Cancelar', today:'Hoy',
      noEntries:'No hay entradas para este mes', saved:'Guardado', error:'Error', deleted:'Eliminado',
      incomeVsExpense:'Ingresos & Gastos', expenseByCat:'Desglose de gastos', paidVsPending:'Pagado & Pendiente',
      paidAmt:'Pagado', unpaidAmt:'Pendiente',
      notifyMe:'Enviar notificación', showOnCalendar:'Mostrar en calendario'
    },
    ru: {
      income:'Доходы', expense:'Расходы', balance:'Баланс', pending:'Ожидает',
      list:'Список', charts:'Графики', categories:'Категории',
      all:'Все', allStatus:'Все статусы', paid:'Оплачено', unpaid:'Не оплачено',
      add:'Добавить', addEntry:'Добавить запись', editEntry:'Редактировать запись',
      addCat:'Добавить категорию', editCat:'Редактировать категорию',
      type:'Тип', amount:'Сумма', category:'Категория', description:'Описание',
      date:'Дата', status:'Статус', recurring:'Повторение', none:'Нет',
      rec_weekly:'Еженедельно', rec_monthly:'Ежемесячно', rec_yearly:'Ежегодно',
      selectCat:'Выбрать категорию', descPlaceholder:'Введите описание...',
      catName:'Название категории', icon:'Иконка', color:'Цвет',
      save:'Сохранить', cancel:'Отмена', today:'Сегодня',
      noEntries:'Нет записей за этот месяц', saved:'Сохранено', error:'Ошибка', deleted:'Удалено',
      incomeVsExpense:'Доходы & Расходы', expenseByCat:'Расходы по категориям', paidVsPending:'Оплачено & Ожидает',
      paidAmt:'Оплачено', unpaidAmt:'Ожидает',
      notifyMe:'Отправить уведомление', showOnCalendar:'Показать в календаре'
    },
    zh: {
      income:'收入', expense:'支出', balance:'余额', pending:'待定',
      list:'列表', charts:'图表', categories:'分类',
      all:'全部', allStatus:'所有状态', paid:'已付', unpaid:'未付',
      add:'添加', addEntry:'添加记录', editEntry:'编辑记录',
      addCat:'添加分类', editCat:'编辑分类',
      type:'类型', amount:'金额', category:'分类', description:'描述',
      date:'日期', status:'状态', recurring:'重复', none:'无',
      rec_weekly:'每周', rec_monthly:'每月', rec_yearly:'每年',
      selectCat:'选择分类', descPlaceholder:'输入描述...',
      catName:'分类名称', icon:'图标', color:'颜色',
      save:'保存', cancel:'取消', today:'今天',
      noEntries:'本月无记录', saved:'已保存', error:'错误', deleted:'已删除',
      incomeVsExpense:'收入 & 支出', expenseByCat:'支出分类', paidVsPending:'已付 & 待付',
      paidAmt:'已付', unpaidAmt:'待付',
      notifyMe:'发送通知', showOnCalendar:'在日历中显示'
    },
    ja: {
      income:'収入', expense:'支出', balance:'残高', pending:'保留',
      list:'リスト', charts:'グラフ', categories:'カテゴリ',
      all:'すべて', allStatus:'全ステータス', paid:'支払済', unpaid:'未払い',
      add:'追加', addEntry:'記録を追加', editEntry:'記録を編集',
      addCat:'カテゴリ追加', editCat:'カテゴリ編集',
      type:'種類', amount:'金額', category:'カテゴリ', description:'説明',
      date:'日付', status:'状態', recurring:'繰り返し', none:'なし',
      rec_weekly:'毎週', rec_monthly:'毎月', rec_yearly:'毎年',
      selectCat:'カテゴリを選択', descPlaceholder:'説明を入力...',
      catName:'カテゴリ名', icon:'アイコン', color:'色',
      save:'保存', cancel:'キャンセル', today:'今日',
      noEntries:'今月の記録なし', saved:'保存しました', error:'エラー', deleted:'削除しました',
      incomeVsExpense:'収入 & 支出', expenseByCat:'支出内訳', paidVsPending:'支払済 & 未払い',
      paidAmt:'支払済', unpaidAmt:'未払い',
      notifyMe:'通知を送信', showOnCalendar:'カレンダーに表示'
    },
    it: {
      income:'Entrate', expense:'Uscite', balance:'Saldo', pending:'In sospeso',
      list:'Lista', charts:'Grafici', categories:'Categorie',
      all:'Tutti', allStatus:'Tutti gli stati', paid:'Pagato', unpaid:'Da pagare',
      add:'Aggiungi', addEntry:'Aggiungi voce', editEntry:'Modifica voce',
      addCat:'Aggiungi categoria', editCat:'Modifica categoria',
      type:'Tipo', amount:'Importo', category:'Categoria', description:'Descrizione',
      date:'Data', status:'Stato', recurring:'Ricorrente', none:'Nessuno',
      rec_weekly:'Settimanale', rec_monthly:'Mensile', rec_yearly:'Annuale',
      selectCat:'Seleziona categoria', descPlaceholder:'Inserisci descrizione...',
      catName:'Nome categoria', icon:'Icona', color:'Colore',
      save:'Salva', cancel:'Annulla', today:'Oggi',
      noEntries:'Nessuna voce per questo mese', saved:'Salvato', error:'Errore', deleted:'Eliminato',
      incomeVsExpense:'Entrate & Uscite', expenseByCat:'Ripartizione uscite', paidVsPending:'Pagato & In sospeso',
      paidAmt:'Pagato', unpaidAmt:'In sospeso',
      notifyMe:'Invia notifica', showOnCalendar:'Mostra nel calendario'
    }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  function authHeaders() {
    return { 'Authorization': 'Bearer ' + (localStorage.getItem('auth_token') || ''), 'Content-Type': 'application/json' };
  }

  return {
    setup() {
      const locale = ref(getLocale());
      const L = (k) => (LANGS[locale.value] || LANGS.en)[k] || k;
      function onLocaleChanged() { locale.value = getLocale(); }
      window.addEventListener('locale-changed', onLocaleChanged);
      onUnmounted(() => window.removeEventListener('locale-changed', onLocaleChanged));

      /* ── State ── */
      const tab = ref('list');
      const now = new Date();
      const currentMonth = ref(now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0'));

      const entries = ref([]);
      const categories = ref([]);
      const summary = ref({ totals: [], byCategory: [] });

      const filterType = ref('');
      const filterPaid = ref('');

      /* ── Form state ── */
      const showForm = ref(false);
      const editingEntry = ref(null);
      const form = ref(defaultForm());

      const showCatForm = ref(false);
      const editingCat = ref(null);
      const catForm = ref({ name: '', icon: '📁', type: 'expense', color: '#409eff' });

      /* ── Chart refs ── */
      const barCanvas = ref(null);
      const pieCanvas = ref(null);
      const statusCanvas = ref(null);
      const pieData = ref([]);

      function defaultForm() {
        const d = new Date();
        return { type: 'expense', amount: 0, category_id: null, description: '', date: d.toISOString().slice(0, 10), paid: true, recurring: '', notify: false, show_calendar: false };
      }

      /* ── Computed ── */
      const monthLabel = computed(() => {
        const [y, m] = currentMonth.value.split('-');
        const d = new Date(Number(y), Number(m) - 1);
        return d.toLocaleDateString(locale.value === 'tr' ? 'tr-TR' : locale.value, { year: 'numeric', month: 'long' });
      });

      const isCurrentMonth = computed(() => {
        return currentMonth.value === (now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0'));
      });

      const totalIncome = computed(() => {
        const t = summary.value.totals.filter(r => r.type === 'income');
        return t.reduce((s, r) => s + (r.total || 0), 0);
      });
      const totalExpense = computed(() => {
        const t = summary.value.totals.filter(r => r.type === 'expense');
        return t.reduce((s, r) => s + (r.total || 0), 0);
      });
      const balance = computed(() => totalIncome.value - totalExpense.value);
      const totalPending = computed(() => {
        const t = summary.value.totals.filter(r => !r.paid);
        return t.reduce((s, r) => s + (r.total || 0), 0);
      });

      const filteredCats = computed(() => {
        return categories.value.filter(c => c.type === form.value.type);
      });

      /* ── Format ── */
      function fmt(v) {
        return Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }

      /* ── Month nav ── */
      function prevMonth() {
        const [y, m] = currentMonth.value.split('-').map(Number);
        const d = new Date(y, m - 2, 1);
        currentMonth.value = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      }
      function nextMonth() {
        const [y, m] = currentMonth.value.split('-').map(Number);
        const d = new Date(y, m, 1);
        currentMonth.value = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      }
      function goToday() {
        const n = new Date();
        currentMonth.value = n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0');
      }

      /* ── API ── */
      async function loadCategories() {
        try {
          const r = await fetch('/api/budget/categories', { headers: authHeaders() });
          if (r.ok) categories.value = await r.json();
        } catch {}
      }

      async function loadEntries() {
        try {
          let url = '/api/budget/entries?month=' + encodeURIComponent(currentMonth.value);
          if (filterType.value) url += '&type=' + filterType.value;
          if (filterPaid.value !== '') url += '&paid=' + filterPaid.value;
          const r = await fetch(url, { headers: authHeaders() });
          if (r.ok) entries.value = await r.json();
        } catch {}
      }

      async function loadSummary() {
        try {
          const r = await fetch('/api/budget/summary?month=' + encodeURIComponent(currentMonth.value), { headers: authHeaders() });
          if (r.ok) summary.value = await r.json();
        } catch {}
      }

      async function loadAll() {
        await Promise.all([loadEntries(), loadSummary()]);
      }

      /* ── Entry CRUD ── */
      function openForm(entry) {
        if (entry) {
          editingEntry.value = entry.id;
          form.value = { type: entry.type, amount: entry.amount, category_id: entry.category_id, description: entry.description, date: entry.date, paid: !!entry.paid, recurring: entry.recurring || '', notify: !!entry.notify, show_calendar: !!entry.show_calendar };
        } else {
          editingEntry.value = null;
          form.value = defaultForm();
        }
        showForm.value = true;
      }

      async function saveEntry() {
        const f = form.value;
        if (!f.amount || !f.date) return;
        try {
          const body = { category_id: f.category_id, type: f.type, amount: f.amount, description: f.description, date: f.date, paid: f.paid, recurring: f.recurring, notify: f.paid ? false : f.notify, show_calendar: f.paid ? false : f.show_calendar };
          let r;
          if (editingEntry.value) {
            r = await fetch('/api/budget/entries/' + editingEntry.value, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) });
          } else {
            r = await fetch('/api/budget/entries', { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
          }
          if (r.ok) { ElMessage.success(L('saved')); showForm.value = false; await loadAll(); }
          else ElMessage.error(L('error'));
        } catch { ElMessage.error(L('error')); }
      }

      async function deleteEntry(id) {
        try {
          const r = await fetch('/api/budget/entries/' + id, { method: 'DELETE', headers: authHeaders() });
          if (r.ok) { ElMessage.success(L('deleted')); await loadAll(); }
        } catch {}
      }

      async function togglePaid(e) {
        try {
          await fetch('/api/budget/entries/' + e.id, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ paid: !e.paid }) });
          await loadAll();
        } catch {}
      }

      /* ── Category CRUD ── */
      function openCatForm(cat) {
        if (cat) {
          editingCat.value = cat.id;
          catForm.value = { name: cat.name, icon: cat.icon, type: cat.type, color: cat.color };
        } else {
          editingCat.value = null;
          catForm.value = { name: '', icon: '📁', type: 'expense', color: '#409eff' };
        }
        showCatForm.value = true;
      }

      async function saveCat() {
        const f = catForm.value;
        if (!f.name) return;
        try {
          let r;
          if (editingCat.value) {
            r = await fetch('/api/budget/categories/' + editingCat.value, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(f) });
          } else {
            r = await fetch('/api/budget/categories', { method: 'POST', headers: authHeaders(), body: JSON.stringify(f) });
          }
          if (r.ok) { ElMessage.success(L('saved')); showCatForm.value = false; await loadCategories(); }
          else ElMessage.error(L('error'));
        } catch { ElMessage.error(L('error')); }
      }

      async function deleteCat(id) {
        try {
          const r = await fetch('/api/budget/categories/' + id, { method: 'DELETE', headers: authHeaders() });
          if (r.ok) { ElMessage.success(L('deleted')); await loadCategories(); }
        } catch {}
      }

      /* ── Charts ── */
      function drawCharts() {
        drawBarChart();
        drawPieChart();
        drawStatusChart();
      }

      function drawBarChart() {
        const canvas = barCanvas.value;
        if (!canvas) return;
        const c = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        c.clearRect(0, 0, W, H);

        const inc = totalIncome.value;
        const exp = totalExpense.value;
        const max = Math.max(inc, exp, 1);
        const barW = 80;
        const gap = 60;
        const baseY = H - 30;
        const maxH = H - 60;

        // Grid
        c.strokeStyle = 'rgba(0,0,0,0.06)';
        c.lineWidth = 0.5;
        for (let i = 0; i <= 4; i++) {
          const y = baseY - (i / 4) * maxH;
          c.beginPath(); c.moveTo(40, y); c.lineTo(W - 10, y); c.stroke();
          c.fillStyle = '#999'; c.font = '10px sans-serif'; c.textAlign = 'right';
          c.fillText(fmt(max * i / 4), 38, y + 4);
        }

        // Income bar
        const x1 = W / 2 - barW - gap / 2;
        const h1 = (inc / max) * maxH;
        const grad1 = c.createLinearGradient(0, baseY, 0, baseY - h1);
        grad1.addColorStop(0, '#95d475');
        grad1.addColorStop(1, '#67c23a');
        c.fillStyle = grad1;
        c.beginPath();
        roundRectPath(c, x1, baseY - h1, barW, h1, 6);
        c.fill();

        // Expense bar
        const x2 = W / 2 + gap / 2;
        const h2 = (exp / max) * maxH;
        const grad2 = c.createLinearGradient(0, baseY, 0, baseY - h2);
        grad2.addColorStop(0, '#f89898');
        grad2.addColorStop(1, '#f56c6c');
        c.fillStyle = grad2;
        c.beginPath();
        roundRectPath(c, x2, baseY - h2, barW, h2, 6);
        c.fill();

        // Labels
        c.fillStyle = '#333'; c.font = '12px sans-serif'; c.textAlign = 'center';
        c.fillText(L('income'), x1 + barW / 2, baseY + 16);
        c.fillText(L('expense'), x2 + barW / 2, baseY + 16);

        // Value on top
        c.fillStyle = '#67c23a'; c.fillText(fmt(inc), x1 + barW / 2, baseY - h1 - 6);
        c.fillStyle = '#f56c6c'; c.fillText(fmt(exp), x2 + barW / 2, baseY - h2 - 6);
      }

      function drawPieChart() {
        const canvas = pieCanvas.value;
        if (!canvas) return;
        const c = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        c.clearRect(0, 0, W, H);

        const catData = (summary.value.byCategory || []).filter(r => r.type === 'expense' && r.total > 0);
        const total = catData.reduce((s, r) => s + r.total, 0);
        if (total === 0) {
          c.fillStyle = '#ccc'; c.font = '14px sans-serif'; c.textAlign = 'center';
          c.fillText(L('noEntries'), W / 2, H / 2);
          pieData.value = [];
          return;
        }

        const cx = W / 2, cy = H / 2, r = Math.min(W, H) / 2 - 10;
        let start = -Math.PI / 2;
        const items = [];

        catData.forEach(d => {
          const sweep = (d.total / total) * Math.PI * 2;
          c.fillStyle = d.color || '#409eff';
          c.beginPath();
          c.moveTo(cx, cy);
          c.arc(cx, cy, r, start, start + sweep);
          c.closePath();
          c.fill();

          // Border
          c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke();

          items.push({ label: d.category || '?', icon: d.icon || '📌', color: d.color || '#409eff', value: d.total });
          start += sweep;
        });

        // Donut hole
        c.fillStyle = '#fff';
        c.beginPath(); c.arc(cx, cy, r * 0.55, 0, Math.PI * 2); c.fill();
        // Center text
        c.fillStyle = '#333'; c.font = 'bold 14px sans-serif'; c.textAlign = 'center';
        c.fillText(fmt(total), cx, cy + 5);

        pieData.value = items;
      }

      function drawStatusChart() {
        const canvas = statusCanvas.value;
        if (!canvas) return;
        const c = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        c.clearRect(0, 0, W, H);

        const totals = summary.value.totals || [];
        const paidIncome = totals.filter(r => r.type === 'income' && r.paid).reduce((s, r) => s + r.total, 0);
        const unpaidIncome = totals.filter(r => r.type === 'income' && !r.paid).reduce((s, r) => s + r.total, 0);
        const paidExpense = totals.filter(r => r.type === 'expense' && r.paid).reduce((s, r) => s + r.total, 0);
        const unpaidExpense = totals.filter(r => r.type === 'expense' && !r.paid).reduce((s, r) => s + r.total, 0);

        const data = [
          { label: L('income') + ' ' + L('paidAmt'), val: paidIncome, color: '#67c23a' },
          { label: L('income') + ' ' + L('unpaidAmt'), val: unpaidIncome, color: '#95d475' },
          { label: L('expense') + ' ' + L('paidAmt'), val: paidExpense, color: '#f56c6c' },
          { label: L('expense') + ' ' + L('unpaidAmt'), val: unpaidExpense, color: '#f89898' },
        ];

        const max = Math.max(...data.map(d => d.val), 1);
        const barH = 24;
        const gap = 12;
        const left = 160;
        const right = W - 20;
        const barArea = right - left;

        data.forEach((d, i) => {
          const y = 20 + i * (barH + gap);
          // Label
          c.fillStyle = '#555'; c.font = '11px sans-serif'; c.textAlign = 'right';
          c.fillText(d.label, left - 10, y + barH / 2 + 4);
          // Bar bg
          c.fillStyle = '#f0f0f0';
          c.beginPath(); roundRectPath(c, left, y, barArea, barH, 4); c.fill();
          // Bar
          const bw = Math.max(2, (d.val / max) * barArea);
          c.fillStyle = d.color;
          c.beginPath(); roundRectPath(c, left, y, bw, barH, 4); c.fill();
          // Value
          c.fillStyle = '#333'; c.font = '11px sans-serif'; c.textAlign = 'left';
          c.fillText(fmt(d.val), left + bw + 6, y + barH / 2 + 4);
        });
      }

      function roundRectPath(c, x, y, w, h, r) {
        if (h < 0) { y += h; h = -h; }
        r = Math.min(r, w / 2, h / 2);
        c.moveTo(x + r, y);
        c.lineTo(x + w - r, y);
        c.quadraticCurveTo(x + w, y, x + w, y + r);
        c.lineTo(x + w, y + h - r);
        c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        c.lineTo(x + r, y + h);
        c.quadraticCurveTo(x, y + h, x, y + h - r);
        c.lineTo(x, y + r);
        c.quadraticCurveTo(x, y, x + r, y);
        c.closePath();
      }

      /* ── Watch ── */
      watch(currentMonth, loadAll);
      watch(filterType, loadEntries);
      watch(filterPaid, loadEntries);
      watch(tab, (v) => {
        if (v === 'chart') nextTick(drawCharts);
      });

      /* ── Init ── */
      onMounted(async () => {
        await loadCategories();
        await loadAll();
      });

      return {
        L, tab, currentMonth, monthLabel, isCurrentMonth,
        entries, categories, summary,
        totalIncome, totalExpense, balance, totalPending,
        filterType, filterPaid, filteredCats,
        showForm, editingEntry, form, showCatForm, editingCat, catForm,
        barCanvas, pieCanvas, statusCanvas, pieData,
        fmt, prevMonth, nextMonth, goToday,
        openForm, saveEntry, deleteEntry, togglePaid,
        openCatForm, saveCat, deleteCat
      };
    }
  };
})(Vue);
