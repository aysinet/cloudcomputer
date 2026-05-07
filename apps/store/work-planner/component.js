({
  setup() {
    const { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } = Vue;
    const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success(){}, error(){}, warning(){}, info(){} };
    const ElMessageBox = (window.ElementPlus && window.ElementPlus.ElMessageBox) || { confirm: () => Promise.resolve(), prompt: () => Promise.resolve({ value: '' }) };

    const LANGS = {
      tr: {
        gantt:'Gantt',board:'Görev Panosu',flow:'İş Akışı',selectProject:'Proje Seç',newProject:'Yeni Proje',
        members:'Üyeler',addTask:'Görev Ekle',editTask:'Görev Düzenle',taskName:'Görev Adı',assignee:'Atanan Kişi',
        startDate:'Başlangıç',endDate:'Bitiş',priority:'Öncelik',progress:'İlerleme',status:'Durum',
        description:'Açıklama',dependencies:'Bağımlılıklar',selectDeps:'Bağımlılık seç',save:'Kaydet',
        cancel:'İptal',delete:'Sil',day:'Gün',week:'Hafta',month:'Ay',
        p0:'Yok',p1:'Düşük',p2:'Orta',p3:'Yüksek',
        todo:'Yapılacak',inprogress:'Devam Ediyor',review:'İnceleme',done:'Tamamlandı',
        filterByMember:'Üyeye Göre Filtrele',all:'Tümü',noTasks:'Henüz görev yok',
        selectOrCreate:'Bir proje seçin veya yeni oluşturun',
        select:'Seç',pan:'Taşı',connect:'Bağla',addTaskNode:'Görev',decision:'Karar',start:'Başlangıç',end:'Bitiş',
        autoLayout:'Otomatik Düzen',editNode:'Düğüm Düzenle',label:'Etiket',
        memberName:'Üye Adı',role:'Rol',noMembers:'Henüz üye yok',selectMember:'Üye seç',
        deleteConfirm:'Silmek istediğinize emin misiniz?',confirm:'Onayla',
        projectName:'Proje adı'
      },
      en: {
        gantt:'Gantt',board:'Task Board',flow:'Workflow',selectProject:'Select Project',newProject:'New Project',
        members:'Members',addTask:'Add Task',editTask:'Edit Task',taskName:'Task Name',assignee:'Assignee',
        startDate:'Start Date',endDate:'End Date',priority:'Priority',progress:'Progress',status:'Status',
        description:'Description',dependencies:'Dependencies',selectDeps:'Select dependencies',save:'Save',
        cancel:'Cancel',delete:'Delete',day:'Day',week:'Week',month:'Month',
        p0:'None',p1:'Low',p2:'Medium',p3:'High',
        todo:'To Do',inprogress:'In Progress',review:'Review',done:'Done',
        filterByMember:'Filter by Member',all:'All',noTasks:'No tasks yet',
        selectOrCreate:'Select or create a project',
        select:'Select',pan:'Pan',connect:'Connect',addTaskNode:'Task',decision:'Decision',start:'Start',end:'End',
        autoLayout:'Auto Layout',editNode:'Edit Node',label:'Label',
        memberName:'Member Name',role:'Role',noMembers:'No members yet',selectMember:'Select member',
        deleteConfirm:'Are you sure you want to delete?',confirm:'Confirm',
        projectName:'Project name'
      },
      de: {
        gantt:'Gantt',board:'Aufgabenboard',flow:'Workflow',selectProject:'Projekt wählen',newProject:'Neues Projekt',
        members:'Mitglieder',addTask:'Aufgabe hinzufügen',editTask:'Aufgabe bearbeiten',taskName:'Aufgabenname',assignee:'Zugewiesen',
        startDate:'Startdatum',endDate:'Enddatum',priority:'Priorität',progress:'Fortschritt',status:'Status',
        description:'Beschreibung',dependencies:'Abhängigkeiten',selectDeps:'Abhängigkeiten wählen',save:'Speichern',
        cancel:'Abbrechen',delete:'Löschen',day:'Tag',week:'Woche',month:'Monat',
        p0:'Keine',p1:'Niedrig',p2:'Mittel',p3:'Hoch',
        todo:'Zu erledigen',inprogress:'In Bearbeitung',review:'Überprüfung',done:'Erledigt',
        filterByMember:'Nach Mitglied filtern',all:'Alle',noTasks:'Noch keine Aufgaben',
        selectOrCreate:'Projekt auswählen oder erstellen',
        select:'Auswählen',pan:'Verschieben',connect:'Verbinden',addTaskNode:'Aufgabe',decision:'Entscheidung',start:'Start',end:'Ende',
        autoLayout:'Auto-Layout',editNode:'Knoten bearbeiten',label:'Bezeichnung',
        memberName:'Name',role:'Rolle',noMembers:'Noch keine Mitglieder',selectMember:'Mitglied wählen',
        deleteConfirm:'Möchten Sie wirklich löschen?',confirm:'Bestätigen',
        projectName:'Projektname'
      },
      fr: {
        gantt:'Gantt',board:'Tableau',flow:'Flux',selectProject:'Choisir un projet',newProject:'Nouveau Projet',
        members:'Membres',addTask:'Ajouter',editTask:'Modifier',taskName:'Nom de la tâche',assignee:'Assigné',
        startDate:'Début',endDate:'Fin',priority:'Priorité',progress:'Progression',status:'Statut',
        description:'Description',dependencies:'Dépendances',selectDeps:'Sélectionner',save:'Enregistrer',
        cancel:'Annuler',delete:'Supprimer',day:'Jour',week:'Semaine',month:'Mois',
        p0:'Aucune',p1:'Basse',p2:'Moyenne',p3:'Haute',
        todo:'À faire',inprogress:'En cours',review:'Révision',done:'Terminé',
        filterByMember:'Filtrer par membre',all:'Tous',noTasks:'Pas de tâches',
        selectOrCreate:'Sélectionnez ou créez un projet',
        select:'Sélect.',pan:'Déplacer',connect:'Lier',addTaskNode:'Tâche',decision:'Décision',start:'Début',end:'Fin',
        autoLayout:'Auto',editNode:'Modifier nœud',label:'Étiquette',
        memberName:'Nom',role:'Rôle',noMembers:'Aucun membre',selectMember:'Choisir',
        deleteConfirm:'Voulez-vous vraiment supprimer ?',confirm:'Confirmer',
        projectName:'Nom du projet'
      },
      es: {
        gantt:'Gantt',board:'Tablero',flow:'Flujo',selectProject:'Seleccionar proyecto',newProject:'Nuevo Proyecto',
        members:'Miembros',addTask:'Agregar tarea',editTask:'Editar tarea',taskName:'Nombre',assignee:'Asignado',
        startDate:'Inicio',endDate:'Fin',priority:'Prioridad',progress:'Progreso',status:'Estado',
        description:'Descripción',dependencies:'Dependencias',selectDeps:'Seleccionar',save:'Guardar',
        cancel:'Cancelar',delete:'Eliminar',day:'Día',week:'Semana',month:'Mes',
        p0:'Ninguna',p1:'Baja',p2:'Media',p3:'Alta',
        todo:'Por hacer',inprogress:'En progreso',review:'Revisión',done:'Hecho',
        filterByMember:'Filtrar por miembro',all:'Todos',noTasks:'Sin tareas',
        selectOrCreate:'Seleccione o cree un proyecto',
        select:'Seleccionar',pan:'Mover',connect:'Conectar',addTaskNode:'Tarea',decision:'Decisión',start:'Inicio',end:'Fin',
        autoLayout:'Auto',editNode:'Editar nodo',label:'Etiqueta',
        memberName:'Nombre',role:'Rol',noMembers:'Sin miembros',selectMember:'Seleccionar',
        deleteConfirm:'¿Está seguro de eliminar?',confirm:'Confirmar',
        projectName:'Nombre del proyecto'
      }
    };

    const locale = ref(localStorage.getItem('sys_locale') || 'tr');
    const t = (key) => (LANGS[locale.value] && LANGS[locale.value][key]) || (LANGS.tr[key]) || key;

    const _onStorage = (e) => { if (e.key === 'sys_locale') locale.value = e.newValue || 'tr'; };
    onMounted(() => window.addEventListener('storage', _onStorage));
    onUnmounted(() => window.removeEventListener('storage', _onStorage));

    const STATUSES = [
      { id: 'todo', label: 'To Do', color: '#909399' },
      { id: 'inprogress', label: 'In Progress', color: '#e6a23c' },
      { id: 'review', label: 'Review', color: '#409eff' },
      { id: 'done', label: 'Done', color: '#67c23a' }
    ];

    const MEMBER_COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#ef4444','#8b5cf6','#06b6d4','#f97316'];

    // State
    const activeTab = ref('gantt');
    const projects = ref([]);
    const activeProjectId = ref(null);
    const tasks = ref([]);
    const members = ref([]);
    const ganttScale = ref('week');
    const boardFilter = ref('');
    const showTaskDialog = ref(false);
    const showMembers = ref(false);
    const showNodeDialog = ref(false);
    const editingTask = reactive({ id:null, name:'', assignee_id:null, start_date:'', end_date:'', priority:0, progress:0, status:'todo', description:'', depends_on:[] });
    const newMemberName = ref('');
    const newMemberRole = ref('');

    // Flow state
    const flowNodes = ref([]);
    const flowEdges = ref([]);
    const flowTool = ref('select');
    const selectedNode = ref(null);
    const selectedEdge = ref(null);
    const editingNode = reactive({ id:null, label:'', assignee_id:null });
    const panX = ref(0);
    const panY = ref(0);
    const zoom = ref(1);
    const connectingFrom = ref(null);
    const connectPreviewX = ref(0);
    const connectPreviewY = ref(0);
    const draggingNode = ref(null);
    const dragOffset = reactive({ x:0, y:0 });
    const isPanning = ref(false);
    const panStart = reactive({ x:0, y:0 });
    const ganttRef = ref(null);
    const canvasWrap = ref(null);

    const cellWidth = computed(() => ganttScale.value === 'day' ? 36 : ganttScale.value === 'week' ? 28 : 40);

    // Auth helper
    function authHeaders() {
      return { 'Content-Type':'application/json', 'Authorization':'Bearer '+(localStorage.getItem('auth_token')||'') };
    }
    async function api(url, opts={}) {
      const r = await fetch(url, { headers: authHeaders(), ...opts });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Error');
      return d;
    }

    // Load projects
    async function loadProjects() {
      try { projects.value = await api('/api/workplanner/projects'); } catch(e) { console.error(e); }
    }

    async function loadProject() {
      if (!activeProjectId.value) { tasks.value = []; members.value = []; flowNodes.value = []; flowEdges.value = []; return; }
      try {
        const [t2, m2, fn, fe] = await Promise.all([
          api('/api/workplanner/projects/'+activeProjectId.value+'/tasks'),
          api('/api/workplanner/projects/'+activeProjectId.value+'/members'),
          api('/api/workplanner/projects/'+activeProjectId.value+'/nodes'),
          api('/api/workplanner/projects/'+activeProjectId.value+'/edges')
        ]);
        tasks.value = t2.map(x => ({ ...x, depends_on: x.depends_on ? JSON.parse(x.depends_on) : [] }));
        members.value = m2;
        flowNodes.value = fn;
        flowEdges.value = fe;
      } catch(e) { console.error(e); }
    }

    async function addProject() {
      try {
        const { value } = await ElMessageBox.prompt(t('projectName'), t('newProject'), { confirmButtonText: t('save'), cancelButtonText: t('cancel') });
        if (!value || !value.trim()) return;
        const p = await api('/api/workplanner/projects', { method:'POST', body: JSON.stringify({ name: value.trim() }) });
        projects.value.push(p);
        activeProjectId.value = p.id;
        await loadProject();
      } catch(e) { if (e !== 'cancel') console.error(e); }
    }

    async function deleteProject() {
      try {
        await ElMessageBox.confirm(t('deleteConfirm'), t('confirm'), { type:'warning' });
        await api('/api/workplanner/projects/'+activeProjectId.value, { method:'DELETE' });
        projects.value = projects.value.filter(p => p.id !== activeProjectId.value);
        activeProjectId.value = null;
        tasks.value = []; members.value = []; flowNodes.value = []; flowEdges.value = [];
      } catch(e) { if (e !== 'cancel') console.error(e); }
    }

    // Tasks
    function addTask() {
      Object.assign(editingTask, { id:null, name:'', assignee_id:null, start_date:'', end_date:'', priority:0, progress:0, status:'todo', description:'', depends_on:[] });
      showTaskDialog.value = true;
    }
    function editTask(task) {
      Object.assign(editingTask, { ...task, depends_on: task.depends_on || [] });
      showTaskDialog.value = true;
    }
    async function saveTask() {
      if (!editingTask.name.trim()) return ElMessage.warning(t('taskName'));
      const body = { ...editingTask, depends_on: JSON.stringify(editingTask.depends_on || []) };
      try {
        if (editingTask.id) {
          await api('/api/workplanner/tasks/'+editingTask.id, { method:'PUT', body: JSON.stringify(body) });
          const idx = tasks.value.findIndex(x => x.id === editingTask.id);
          if (idx >= 0) {
            const m = members.value.find(x => x.id === editingTask.assignee_id);
            tasks.value[idx] = { ...editingTask, assignee_name: m ? m.name : '', depends_on: editingTask.depends_on || [] };
          }
        } else {
          body.project_id = activeProjectId.value;
          const newTask = await api('/api/workplanner/tasks', { method:'POST', body: JSON.stringify(body) });
          newTask.depends_on = editingTask.depends_on || [];
          const m = members.value.find(x => x.id === newTask.assignee_id);
          newTask.assignee_name = m ? m.name : '';
          tasks.value.push(newTask);
        }
        showTaskDialog.value = false;
      } catch(e) { ElMessage.error(e.message); }
    }
    async function deleteTask(id) {
      try {
        await api('/api/workplanner/tasks/'+id, { method:'DELETE' });
        tasks.value = tasks.value.filter(x => x.id !== id);
        showTaskDialog.value = false;
      } catch(e) { ElMessage.error(e.message); }
    }

    // Members
    async function addMember() {
      if (!newMemberName.value.trim()) return;
      try {
        const color = MEMBER_COLORS[members.value.length % MEMBER_COLORS.length];
        const m = await api('/api/workplanner/members', { method:'POST', body: JSON.stringify({ project_id: activeProjectId.value, name: newMemberName.value.trim(), role: newMemberRole.value.trim(), color }) });
        members.value.push(m);
        newMemberName.value = '';
        newMemberRole.value = '';
      } catch(e) { ElMessage.error(e.message); }
    }
    async function deleteMember(id) {
      try {
        await api('/api/workplanner/members/'+id, { method:'DELETE' });
        members.value = members.value.filter(x => x.id !== id);
      } catch(e) { ElMessage.error(e.message); }
    }

    // Gantt helpers
    const timelineDates = computed(() => {
      const dates = [];
      const now = new Date();
      let start = new Date(now);
      start.setDate(start.getDate() - 7);
      const totalDays = ganttScale.value === 'day' ? 60 : ganttScale.value === 'week' ? 90 : 180;
      for (let i = 0; i < totalDays; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const day = d.getDay();
        const iso = d.toISOString().split('T')[0];
        const today = now.toISOString().split('T')[0];
        let label = '';
        if (ganttScale.value === 'day') label = d.getDate() + '';
        else if (ganttScale.value === 'week') label = (i % 7 === 0) ? (d.getDate()+'/'+(d.getMonth()+1)) : '';
        else label = (d.getDate() === 1) ? (d.getMonth()+1)+'/'+d.getFullYear().toString().slice(2) : '';
        dates.push({ key: iso, label, isWeekend: day===0||day===6, isToday: iso===today, date: d });
      }
      return dates;
    });

    function getBarStyle(task) {
      if (!timelineDates.value.length) return { display:'none' };
      const startDay = timelineDates.value[0].date;
      const taskStart = new Date(task.start_date);
      const taskEnd = new Date(task.end_date);
      const diffStart = Math.round((taskStart - startDay) / 86400000);
      const diffEnd = Math.round((taskEnd - startDay) / 86400000);
      const left = diffStart * cellWidth.value;
      const width = Math.max((diffEnd - diffStart + 1) * cellWidth.value, 20);
      const colors = ['#64748b','#22c55e','#f59e0b','#ef4444'];
      return { left: left+'px', width: width+'px', background: colors[task.priority] || '#64748b' };
    }

    // Board
    function filteredTasksByStatus(status) {
      let list = tasks.value.filter(t2 => t2.status === status);
      if (boardFilter.value) list = list.filter(t2 => t2.assignee_id === boardFilter.value);
      return list;
    }
    let draggedTask = null;
    function onDragStart(e, task) { draggedTask = task; e.dataTransfer.effectAllowed = 'move'; }
    async function onDropBoard(e, status) {
      if (!draggedTask) return;
      try {
        await api('/api/workplanner/tasks/'+draggedTask.id, { method:'PUT', body: JSON.stringify({ status }) });
        draggedTask.status = status;
      } catch(ex) { ElMessage.error(ex.message); }
      draggedTask = null;
    }

    function priorityColor(p) { return ['#909399','#67c23a','#e6a23c','#f56c6c'][p] || '#909399'; }

    // Flow (Visio-like)
    function nodeIcon(type) {
      const icons = { task:'📋', decision:'◇', start:'⬤', end:'⏹️' };
      return icons[type] || '📋';
    }
    const svgViewBox = computed(() => '0 0 3000 2000');

    function edgeCoords(edge) {
      const from = flowNodes.value.find(n => n.id === edge.from_node);
      const to = flowNodes.value.find(n => n.id === edge.to_node);
      if (!from || !to) return { x1:0, y1:0, x2:0, y2:0 };
      return { x1: from.x+70, y1: from.y+30, x2: to.x+70, y2: to.y+30 };
    }

    async function addFlowNode(type) {
      const label = type === 'start' ? t('start') : type === 'end' ? t('end') : type === 'decision' ? t('decision') : t('addTaskNode');
      const x = 100 + Math.random()*400;
      const y = 100 + Math.random()*300;
      try {
        const node = await api('/api/workplanner/nodes', { method:'POST', body: JSON.stringify({ project_id: activeProjectId.value, type, label, x: Math.round(x), y: Math.round(y) }) });
        flowNodes.value.push(node);
      } catch(e) { ElMessage.error(e.message); }
    }

    function selectEdge(edge) { selectedEdge.value = edge.id; selectedNode.value = null; }

    function onNodeMouseDown(e, node) {
      if (flowTool.value === 'connect') {
        connectingFrom.value = { id: node.id, x: node.x+70, y: node.y+30 };
        connectPreviewX.value = node.x+70;
        connectPreviewY.value = node.y+30;
        return;
      }
      selectedNode.value = node.id;
      selectedEdge.value = null;
      draggingNode.value = node;
      const rect = canvasWrap.value.getBoundingClientRect();
      dragOffset.x = e.clientX - rect.left - panX.value - node.x * zoom.value;
      dragOffset.y = e.clientY - rect.top - panY.value - node.y * zoom.value;
    }

    function onCanvasMouseDown(e) {
      if (flowTool.value === 'pan') {
        isPanning.value = true;
        panStart.x = e.clientX - panX.value;
        panStart.y = e.clientY - panY.value;
      } else if (flowTool.value === 'select') {
        selectedNode.value = null;
        selectedEdge.value = null;
      }
    }

    function onCanvasMouseMove(e) {
      if (isPanning.value) {
        panX.value = e.clientX - panStart.x;
        panY.value = e.clientY - panStart.y;
        return;
      }
      if (draggingNode.value) {
        const rect = canvasWrap.value.getBoundingClientRect();
        draggingNode.value.x = Math.round((e.clientX - rect.left - panX.value - dragOffset.x) / zoom.value);
        draggingNode.value.y = Math.round((e.clientY - rect.top - panY.value - dragOffset.y) / zoom.value);
        return;
      }
      if (connectingFrom.value) {
        const rect = canvasWrap.value.getBoundingClientRect();
        connectPreviewX.value = (e.clientX - rect.left - panX.value) / zoom.value;
        connectPreviewY.value = (e.clientY - rect.top - panY.value) / zoom.value;
      }
    }

    async function onCanvasMouseUp(e) {
      if (isPanning.value) { isPanning.value = false; return; }
      if (draggingNode.value) {
        const node = draggingNode.value;
        draggingNode.value = null;
        try { await api('/api/workplanner/nodes/'+node.id, { method:'PUT', body: JSON.stringify({ x: node.x, y: node.y }) }); } catch(ex) {}
        return;
      }
      if (connectingFrom.value) {
        // Find target node
        const rect = canvasWrap.value.getBoundingClientRect();
        const mx = (e.clientX - rect.left - panX.value) / zoom.value;
        const my = (e.clientY - rect.top - panY.value) / zoom.value;
        const target = flowNodes.value.find(n => n.id !== connectingFrom.value.id && mx >= n.x && mx <= n.x+140 && my >= n.y && my <= n.y+60);
        if (target) {
          try {
            const edge = await api('/api/workplanner/edges', { method:'POST', body: JSON.stringify({ project_id: activeProjectId.value, from_node: connectingFrom.value.id, to_node: target.id, label:'' }) });
            flowEdges.value.push(edge);
          } catch(ex) { ElMessage.error(ex.message); }
        }
        connectingFrom.value = null;
      }
    }

    function onCanvasWheel(e) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      zoom.value = Math.max(0.3, Math.min(3, zoom.value + delta));
    }

    function editFlowNode(node) {
      Object.assign(editingNode, { id: node.id, label: node.label, assignee_id: node.assignee_id });
      showNodeDialog.value = true;
    }

    async function saveFlowNode() {
      try {
        await api('/api/workplanner/nodes/'+editingNode.id, { method:'PUT', body: JSON.stringify({ label: editingNode.label, assignee_id: editingNode.assignee_id }) });
        const node = flowNodes.value.find(n => n.id === editingNode.id);
        if (node) {
          node.label = editingNode.label;
          node.assignee_id = editingNode.assignee_id;
          const m = members.value.find(x => x.id === editingNode.assignee_id);
          node.assignee_name = m ? m.name : '';
        }
        showNodeDialog.value = false;
      } catch(e) { ElMessage.error(e.message); }
    }

    async function deleteFlowItem() {
      try {
        if (selectedNode.value) {
          await api('/api/workplanner/nodes/'+selectedNode.value, { method:'DELETE' });
          flowEdges.value = flowEdges.value.filter(e2 => e2.from_node !== selectedNode.value && e2.to_node !== selectedNode.value);
          flowNodes.value = flowNodes.value.filter(n => n.id !== selectedNode.value);
          selectedNode.value = null;
        } else if (selectedEdge.value) {
          await api('/api/workplanner/edges/'+selectedEdge.value, { method:'DELETE' });
          flowEdges.value = flowEdges.value.filter(e2 => e2.id !== selectedEdge.value);
          selectedEdge.value = null;
        }
      } catch(e) { ElMessage.error(e.message); }
    }

    function autoLayout() {
      const sorted = [...flowNodes.value];
      const cols = { start:[], task:[], decision:[], end:[] };
      sorted.forEach(n => { if (cols[n.type]) cols[n.type].push(n); else cols.task.push(n); });
      let x = 60;
      ['start','task','decision','end'].forEach(type => {
        let y = 60;
        cols[type].forEach(n => {
          n.x = x; n.y = y; y += 100;
        });
        if (cols[type].length) x += 220;
      });
      // Save positions
      flowNodes.value.forEach(n => {
        api('/api/workplanner/nodes/'+n.id, { method:'PUT', body: JSON.stringify({ x: n.x, y: n.y }) }).catch(()=>{});
      });
    }

    onMounted(async () => {
      await loadProjects();
      if (projects.value.length) {
        activeProjectId.value = projects.value[0].id;
        await loadProject();
      }
    });

    return {
      t, STATUSES, MEMBER_COLORS,
      activeTab, projects, activeProjectId, tasks, members, ganttScale, boardFilter,
      showTaskDialog, showMembers, showNodeDialog, editingTask, newMemberName, newMemberRole,
      flowNodes, flowEdges, flowTool, selectedNode, selectedEdge, editingNode,
      panX, panY, zoom, connectingFrom, connectPreviewX, connectPreviewY,
      ganttRef, canvasWrap, cellWidth, svgViewBox,
      timelineDates, getBarStyle, filteredTasksByStatus, priorityColor, nodeIcon, edgeCoords,
      loadProjects, loadProject, addProject, deleteProject,
      addTask, editTask, saveTask, deleteTask,
      addMember, deleteMember,
      onDragStart, onDropBoard,
      addFlowNode, selectEdge, onNodeMouseDown, onCanvasMouseDown, onCanvasMouseMove, onCanvasMouseUp, onCanvasWheel,
      editFlowNode, saveFlowNode, deleteFlowItem, autoLayout
    };
  }
})
