(function(Vue){
const{ref,reactive,onMounted,onUnmounted,watch,nextTick,computed}=Vue;

const LANGS={
tr:{select:'Seç',room:'Oda',door:'Kapı',window:'Pencere',furniture:'Mobilya',delete:'Sil',undo:'Geri Al',redo:'Yinele',file:'Dosya',new:'Yeni Proje',save:'Kaydet',load:'Yükle',close:'Kapat',cancel:'İptal',exportJSON:'JSON Dışa Aktar',importJSON:'JSON İçe Aktar',saveFile:'Dosyaya Kaydet',openFile:'Dosyadan Aç',saveServer:'Sunucuya Kaydet',loadServer:'Sunucudan Yükle',group:'Grupla',ungroup:'Grubu Çöz',properties:'Özellikler',roomName:'Oda Adı',floorColor:'Zemin Rengi',wallColor:'Duvar Rengi',width:'Genişlik',height:'Derinlik',rotation:'Döndürme',wallHeight:'Duvar Yüksekliği',resetView:'Görünümü Sıfırla',gridSize:'Izgara',rooms:'Oda',doors:'Kapı',windows:'Pencere',furnitureCount:'Mobilya',projectName:'Proje Adı',noProjects:'Kayıtlı proje yok',bed:'Yatak',sofa:'Kanepe',table:'Masa',chair:'Sandalye',desk:'Çalışma Masası',wardrobe:'Dolap',bathtub:'Küvet',toilet:'Tuvalet',sink:'Lavabo',stove:'Ocak',fridge:'Buzdolabı',washingMachine:'Çamaşır Makinesi',tv:'Televizyon',bookshelf:'Kitaplık',diningTable:'Yemek Masası',plant:'Bitki',lamp:'Lamba',rug:'Halı',saved:'Kaydedildi!',deleted:'Silindi!',loaded:'Yüklendi!'},
en:{select:'Select',room:'Room',door:'Door',window:'Window',furniture:'Furniture',delete:'Delete',undo:'Undo',redo:'Redo',file:'File',new:'New Project',save:'Save',load:'Load',close:'Close',cancel:'Cancel',exportJSON:'Export JSON',importJSON:'Import JSON',saveFile:'Save to File',openFile:'Open from File',saveServer:'Save to Server',loadServer:'Load from Server',group:'Group',ungroup:'Ungroup',properties:'Properties',roomName:'Room Name',floorColor:'Floor Color',wallColor:'Wall Color',width:'Width',height:'Depth',rotation:'Rotation',wallHeight:'Wall Height',resetView:'Reset View',gridSize:'Grid',rooms:'Rooms',doors:'Doors',windows:'Windows',furnitureCount:'Furniture',projectName:'Project Name',noProjects:'No saved projects',bed:'Bed',sofa:'Sofa',table:'Table',chair:'Chair',desk:'Desk',wardrobe:'Wardrobe',bathtub:'Bathtub',toilet:'Toilet',sink:'Sink',stove:'Stove',fridge:'Fridge',washingMachine:'Washing Machine',tv:'TV',bookshelf:'Bookshelf',diningTable:'Dining Table',plant:'Plant',lamp:'Lamp',rug:'Rug',saved:'Saved!',deleted:'Deleted!',loaded:'Loaded!'},
de:{select:'Auswählen',room:'Raum',door:'Tür',window:'Fenster',furniture:'Möbel',delete:'Löschen',undo:'Rückgängig',redo:'Wiederholen',file:'Datei',new:'Neues Projekt',save:'Speichern',load:'Laden',close:'Schließen',cancel:'Abbrechen',exportJSON:'JSON Export',importJSON:'JSON Import',saveFile:'In Datei speichern',openFile:'Aus Datei öffnen',saveServer:'Auf Server speichern',loadServer:'Vom Server laden',group:'Gruppieren',ungroup:'Gruppierung aufheben',properties:'Eigenschaften',roomName:'Raumname',floorColor:'Bodenfarbe',wallColor:'Wandfarbe',width:'Breite',height:'Tiefe',rotation:'Drehung',wallHeight:'Wandhöhe',resetView:'Ansicht zurücksetzen',gridSize:'Raster',rooms:'Räume',doors:'Türen',windows:'Fenster',furnitureCount:'Möbel',projectName:'Projektname',noProjects:'Keine gespeicherten Projekte',bed:'Bett',sofa:'Sofa',table:'Tisch',chair:'Stuhl',desk:'Schreibtisch',wardrobe:'Schrank',bathtub:'Badewanne',toilet:'Toilette',sink:'Waschbecken',stove:'Herd',fridge:'Kühlschrank',washingMachine:'Waschmaschine',tv:'Fernseher',bookshelf:'Bücherregal',diningTable:'Esstisch',plant:'Pflanze',lamp:'Lampe',rug:'Teppich',saved:'Gespeichert!',deleted:'Gelöscht!',loaded:'Geladen!'},
fr:{select:'Sélectionner',room:'Pièce',door:'Porte',window:'Fenêtre',furniture:'Meubles',delete:'Supprimer',undo:'Annuler',redo:'Rétablir',file:'Fichier',new:'Nouveau Projet',save:'Enregistrer',load:'Charger',close:'Fermer',cancel:'Annuler',exportJSON:'Exporter JSON',importJSON:'Importer JSON',saveFile:'Enregistrer dans un fichier',openFile:'Ouvrir un fichier',saveServer:'Enregistrer sur le serveur',loadServer:'Charger depuis le serveur',group:'Grouper',ungroup:'Dégrouper',properties:'Propriétés',roomName:'Nom de la pièce',floorColor:'Couleur du sol',wallColor:'Couleur du mur',width:'Largeur',height:'Profondeur',rotation:'Rotation',wallHeight:'Hauteur du mur',resetView:'Réinitialiser la vue',gridSize:'Grille',rooms:'Pièces',doors:'Portes',windows:'Fenêtres',furnitureCount:'Meubles',projectName:'Nom du projet',noProjects:'Aucun projet enregistré',bed:'Lit',sofa:'Canapé',table:'Table',chair:'Chaise',desk:'Bureau',wardrobe:'Armoire',bathtub:'Baignoire',toilet:'Toilettes',sink:'Évier',stove:'Cuisinière',fridge:'Réfrigérateur',washingMachine:'Lave-linge',tv:'Télévision',bookshelf:'Bibliothèque',diningTable:'Table à manger',plant:'Plante',lamp:'Lampe',rug:'Tapis',saved:'Enregistré!',deleted:'Supprimé!',loaded:'Chargé!'},
es:{select:'Seleccionar',room:'Habitación',door:'Puerta',window:'Ventana',furniture:'Muebles',delete:'Eliminar',undo:'Deshacer',redo:'Rehacer',file:'Archivo',new:'Nuevo Proyecto',save:'Guardar',load:'Cargar',close:'Cerrar',cancel:'Cancelar',exportJSON:'Exportar JSON',importJSON:'Importar JSON',saveFile:'Guardar en archivo',openFile:'Abrir archivo',saveServer:'Guardar en servidor',loadServer:'Cargar del servidor',group:'Agrupar',ungroup:'Desagrupar',properties:'Propiedades',roomName:'Nombre',floorColor:'Color del suelo',wallColor:'Color de pared',width:'Ancho',height:'Profundidad',rotation:'Rotación',wallHeight:'Altura de pared',resetView:'Restablecer vista',gridSize:'Cuadrícula',rooms:'Habitaciones',doors:'Puertas',windows:'Ventanas',furnitureCount:'Muebles',projectName:'Nombre del proyecto',noProjects:'No hay proyectos guardados',bed:'Cama',sofa:'Sofá',table:'Mesa',chair:'Silla',desk:'Escritorio',wardrobe:'Armario',bathtub:'Bañera',toilet:'Inodoro',sink:'Lavabo',stove:'Cocina',fridge:'Nevera',washingMachine:'Lavadora',tv:'Televisión',bookshelf:'Estantería',diningTable:'Mesa de comedor',plant:'Planta',lamp:'Lámpara',rug:'Alfombra',saved:'¡Guardado!',deleted:'¡Eliminado!',loaded:'¡Cargado!'},
ru:{select:'Выбрать',room:'Комната',door:'Дверь',window:'Окно',furniture:'Мебель',delete:'Удалить',undo:'Отменить',redo:'Вперёд',file:'Файл',new:'Новый проект',save:'Сохранить',load:'Загрузить',close:'Закрыть',cancel:'Отмена',exportJSON:'Экспорт JSON',importJSON:'Импорт JSON',saveFile:'Сохранить в файл',openFile:'Открыть файл',saveServer:'Сохранить на сервер',loadServer:'Загрузить с сервера',group:'Группировать',ungroup:'Разгруппировать',properties:'Свойства',roomName:'Название',floorColor:'Цвет пола',wallColor:'Цвет стен',width:'Ширина',height:'Глубина',rotation:'Поворот',wallHeight:'Высота стен',resetView:'Сброс',gridSize:'Сетка',rooms:'Комнаты',doors:'Двери',windows:'Окна',furnitureCount:'Мебель',projectName:'Название проекта',noProjects:'Нет сохранённых проектов',bed:'Кровать',sofa:'Диван',table:'Стол',chair:'Стул',desk:'Рабочий стол',wardrobe:'Шкаф',bathtub:'Ванна',toilet:'Туалет',sink:'Раковина',stove:'Плита',fridge:'Холодильник',washingMachine:'Стиральная машина',tv:'Телевизор',bookshelf:'Книжная полка',diningTable:'Обеденный стол',plant:'Растение',lamp:'Лампа',rug:'Ковёр',saved:'Сохранено!',deleted:'Удалено!',loaded:'Загружено!'},
zh:{select:'选择',room:'房间',door:'门',window:'窗户',furniture:'家具',delete:'删除',undo:'撤销',redo:'重做',file:'文件',new:'新项目',save:'保存',load:'加载',close:'关闭',cancel:'取消',exportJSON:'导出JSON',importJSON:'导入JSON',saveFile:'保存到文件',openFile:'从文件打开',saveServer:'保存到服务器',loadServer:'从服务器加载',group:'编组',ungroup:'取消编组',properties:'属性',roomName:'房间名',floorColor:'地板颜色',wallColor:'墙壁颜色',width:'宽度',height:'深度',rotation:'旋转',wallHeight:'墙高',resetView:'重置视图',gridSize:'网格',rooms:'房间',doors:'门',windows:'窗户',furnitureCount:'家具',projectName:'项目名称',noProjects:'没有保存的项目',bed:'床',sofa:'沙发',table:'桌子',chair:'椅子',desk:'书桌',wardrobe:'衣柜',bathtub:'浴缸',toilet:'马桶',sink:'水槽',stove:'炉灶',fridge:'冰箱',washingMachine:'洗衣机',tv:'电视',bookshelf:'书架',diningTable:'餐桌',plant:'植物',lamp:'台灯',rug:'地毯',saved:'已保存！',deleted:'已删除！',loaded:'已加载！'},
ja:{select:'選択',room:'部屋',door:'ドア',window:'窓',furniture:'家具',delete:'削除',undo:'元に戻す',redo:'やり直し',file:'ファイル',new:'新規プロジェクト',save:'保存',load:'読込',close:'閉じる',cancel:'キャンセル',exportJSON:'JSONエクスポート',importJSON:'JSONインポート',saveFile:'ファイルに保存',openFile:'ファイルから開く',saveServer:'サーバーに保存',loadServer:'サーバーから読込',group:'グループ化',ungroup:'グループ解除',properties:'プロパティ',roomName:'部屋名',floorColor:'床の色',wallColor:'壁の色',width:'幅',height:'奥行き',rotation:'回転',wallHeight:'壁の高さ',resetView:'ビューリセット',gridSize:'グリッド',rooms:'部屋',doors:'ドア',windows:'窓',furnitureCount:'家具',projectName:'プロジェクト名',noProjects:'保存されたプロジェクトはありません',bed:'ベッド',sofa:'ソファ',table:'テーブル',chair:'椅子',desk:'デスク',wardrobe:'ワードローブ',bathtub:'浴槽',toilet:'トイレ',sink:'シンク',stove:'コンロ',fridge:'冷蔵庫',washingMachine:'洗濯機',tv:'テレビ',bookshelf:'本棚',diningTable:'ダイニングテーブル',plant:'植物',lamp:'ランプ',rug:'ラグ',saved:'保存しました！',deleted:'削除しました！',loaded:'読み込みました！'},
it:{select:'Seleziona',room:'Stanza',door:'Porta',window:'Finestra',furniture:'Mobili',delete:'Elimina',undo:'Annulla',redo:'Ripeti',file:'File',new:'Nuovo Progetto',save:'Salva',load:'Carica',close:'Chiudi',cancel:'Annulla',exportJSON:'Esporta JSON',importJSON:'Importa JSON',saveFile:'Salva su file',openFile:'Apri da file',saveServer:'Salva su server',loadServer:'Carica dal server',group:'Raggruppa',ungroup:'Separa',properties:'Proprietà',roomName:'Nome stanza',floorColor:'Colore pavimento',wallColor:'Colore parete',width:'Larghezza',height:'Profondità',rotation:'Rotazione',wallHeight:'Altezza pareti',resetView:'Reset vista',gridSize:'Griglia',rooms:'Stanze',doors:'Porte',windows:'Finestre',furnitureCount:'Mobili',projectName:'Nome progetto',noProjects:'Nessun progetto salvato',bed:'Letto',sofa:'Divano',table:'Tavolo',chair:'Sedia',desk:'Scrivania',wardrobe:'Armadio',bathtub:'Vasca',toilet:'WC',sink:'Lavandino',stove:'Fornello',fridge:'Frigorifero',washingMachine:'Lavatrice',tv:'TV',bookshelf:'Libreria',diningTable:'Tavolo da pranzo',plant:'Pianta',lamp:'Lampada',rug:'Tappeto',saved:'Salvato!',deleted:'Eliminato!',loaded:'Caricato!'},
ar:{select:'تحديد',room:'غرفة',door:'باب',window:'نافذة',furniture:'أثاث',delete:'حذف',undo:'تراجع',redo:'إعادة',file:'ملف',new:'مشروع جديد',save:'حفظ',load:'تحميل',close:'إغلاق',cancel:'إلغاء',exportJSON:'تصدير JSON',importJSON:'استيراد JSON',saveFile:'حفظ في ملف',openFile:'فتح ملف',saveServer:'حفظ على الخادم',loadServer:'تحميل من الخادم',group:'تجميع',ungroup:'فك التجميع',properties:'خصائص',roomName:'اسم الغرفة',floorColor:'لون الأرضية',wallColor:'لون الجدار',width:'العرض',height:'العمق',rotation:'الدوران',wallHeight:'ارتفاع الجدار',resetView:'إعادة ضبط',gridSize:'الشبكة',rooms:'غرف',doors:'أبواب',windows:'نوافذ',furnitureCount:'أثاث',projectName:'اسم المشروع',noProjects:'لا توجد مشاريع محفوظة',bed:'سرير',sofa:'أريكة',table:'طاولة',chair:'كرسي',desk:'مكتب',wardrobe:'خزانة',bathtub:'حوض استحمام',toilet:'مرحاض',sink:'حوض',stove:'موقد',fridge:'ثلاجة',washingMachine:'غسالة',tv:'تلفاز',bookshelf:'رف كتب',diningTable:'طاولة طعام',plant:'نبتة',lamp:'مصباح',rug:'سجادة',saved:'!تم الحفظ',deleted:'!تم الحذف',loaded:'!تم التحميل'},
ko:{select:'선택',room:'방',door:'문',window:'창문',furniture:'가구',delete:'삭제',undo:'실행취소',redo:'다시실행',file:'파일',new:'새 프로젝트',save:'저장',load:'불러오기',close:'닫기',cancel:'취소',exportJSON:'JSON 내보내기',importJSON:'JSON 가져오기',saveFile:'파일로 저장',openFile:'파일에서 열기',saveServer:'서버에 저장',loadServer:'서버에서 불러오기',group:'그룹화',ungroup:'그룹 해제',properties:'속성',roomName:'방 이름',floorColor:'바닥 색상',wallColor:'벽 색상',width:'너비',height:'깊이',rotation:'회전',wallHeight:'벽 높이',resetView:'뷰 리셋',gridSize:'격자',rooms:'방',doors:'문',windows:'창문',furnitureCount:'가구',projectName:'프로젝트 이름',noProjects:'저장된 프로젝트 없음',bed:'침대',sofa:'소파',table:'테이블',chair:'의자',desk:'책상',wardrobe:'옷장',bathtub:'욕조',toilet:'변기',sink:'세면대',stove:'가스레인지',fridge:'냉장고',washingMachine:'세탁기',tv:'TV',bookshelf:'책장',diningTable:'식탁',plant:'식물',lamp:'램프',rug:'러그',saved:'저장됨!',deleted:'삭제됨!',loaded:'불러옴!'},
hi:{select:'चुनें',room:'कमरा',door:'दरवाज़ा',window:'खिड़की',furniture:'फ़र्नीचर',delete:'हटाएं',undo:'पूर्ववत',redo:'फिर से',file:'फ़ाइल',new:'नया प्रोजेक्ट',save:'सेव',load:'लोड',close:'बंद',cancel:'रद्द',exportJSON:'JSON निर्यात',importJSON:'JSON आयात',saveFile:'फ़ाइल में सेव',openFile:'फ़ाइल से खोलें',saveServer:'सर्वर पर सेव',loadServer:'सर्वर से लोड',group:'ग्रुप बनाएं',ungroup:'ग्रुप तोड़ें',properties:'गुण',roomName:'कमरे का नाम',floorColor:'फर्श का रंग',wallColor:'दीवार का रंग',width:'चौड़ाई',height:'गहराई',rotation:'घुमाव',wallHeight:'दीवार ऊंचाई',resetView:'रीसेट',gridSize:'ग्रिड',rooms:'कमरे',doors:'दरवाज़े',windows:'खिड़कियाँ',furnitureCount:'फ़र्नीचर',projectName:'प्रोजेक्ट नाम',noProjects:'कोई सेव प्रोजेक्ट नहीं',bed:'बिस्तर',sofa:'सोफा',table:'मेज़',chair:'कुर्सी',desk:'डेस्क',wardrobe:'अलमारी',bathtub:'बाथटब',toilet:'शौचालय',sink:'सिंक',stove:'चूल्हा',fridge:'फ्रिज',washingMachine:'वॉशिंग मशीन',tv:'टीवी',bookshelf:'किताबों की अलमारी',diningTable:'डाइनिंग टेबल',plant:'पौधा',lamp:'लैंप',rug:'गलीचा',saved:'सेव हो गया!',deleted:'हट गया!',loaded:'लोड हो गया!'},
pt:{select:'Selecionar',room:'Quarto',door:'Porta',window:'Janela',furniture:'Móveis',delete:'Excluir',undo:'Desfazer',redo:'Refazer',file:'Arquivo',new:'Novo Projeto',save:'Salvar',load:'Carregar',close:'Fechar',cancel:'Cancelar',exportJSON:'Exportar JSON',importJSON:'Importar JSON',saveFile:'Salvar em arquivo',openFile:'Abrir arquivo',saveServer:'Salvar no servidor',loadServer:'Carregar do servidor',group:'Agrupar',ungroup:'Desagrupar',properties:'Propriedades',roomName:'Nome do cômodo',floorColor:'Cor do piso',wallColor:'Cor da parede',width:'Largura',height:'Profundidade',rotation:'Rotação',wallHeight:'Altura da parede',resetView:'Resetar vista',gridSize:'Grade',rooms:'Cômodos',doors:'Portas',windows:'Janelas',furnitureCount:'Móveis',projectName:'Nome do projeto',noProjects:'Nenhum projeto salvo',bed:'Cama',sofa:'Sofá',table:'Mesa',chair:'Cadeira',desk:'Escrivaninha',wardrobe:'Guarda-roupa',bathtub:'Banheira',toilet:'Vaso sanitário',sink:'Pia',stove:'Fogão',fridge:'Geladeira',washingMachine:'Máquina de lavar',tv:'TV',bookshelf:'Estante',diningTable:'Mesa de jantar',plant:'Planta',lamp:'Luminária',rug:'Tapete',saved:'Salvo!',deleted:'Excluído!',loaded:'Carregado!'}
};

function getLocale(){try{return localStorage.getItem('sys_locale')||'tr'}catch{return'tr'}}
function getAuthHeaders(){const t=localStorage.getItem('auth_token')||'';return{'Authorization':'Bearer '+t,'Content-Type':'application/json'}}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}

const FURNITURE_LIST=[
  {type:'bed',icon:'🛏️',w:2,h:1.6,color:'#7c6f9c'},
  {type:'sofa',icon:'🛋️',w:2.2,h:0.9,color:'#6c7a89'},
  {type:'table',icon:'🪑',w:1.2,h:0.8,color:'#8b6914'},
  {type:'chair',icon:'🪑',w:0.5,h:0.5,color:'#a0522d'},
  {type:'desk',icon:'🖥️',w:1.4,h:0.7,color:'#8b7355'},
  {type:'wardrobe',icon:'🗄️',w:1.8,h:0.6,color:'#5c4033'},
  {type:'bathtub',icon:'🛁',w:1.7,h:0.8,color:'#e8e8e8'},
  {type:'toilet',icon:'🚽',w:0.5,h:0.7,color:'#f0f0f0'},
  {type:'sink',icon:'🚰',w:0.6,h:0.5,color:'#dcdcdc'},
  {type:'stove',icon:'🍳',w:0.6,h:0.6,color:'#2f2f2f'},
  {type:'fridge',icon:'🧊',w:0.7,h:0.7,color:'#c0c0c0'},
  {type:'washingMachine',icon:'🫧',w:0.6,h:0.6,color:'#b0b0b0'},
  {type:'tv',icon:'📺',w:1.2,h:0.1,color:'#1a1a1a'},
  {type:'bookshelf',icon:'📚',w:1.0,h:0.4,color:'#8b6914'},
  {type:'diningTable',icon:'🍽️',w:1.6,h:1.0,color:'#a0522d'},
  {type:'plant',icon:'🌿',w:0.4,h:0.4,color:'#228b22'},
  {type:'lamp',icon:'💡',w:0.3,h:0.3,color:'#ffd700'},
  {type:'rug',icon:'🟫',w:2.0,h:1.5,color:'#8b4513'}
];

const THREE_CDN='https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.min.js';
const ORBIT_CDN='https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/controls/OrbitControls.js';

return{
setup(){
  const locale=ref(getLocale());
  function L(k){return(LANGS[locale.value]||LANGS.tr)[k]||LANGS.tr[k]||k}

  const mode=ref('select');
  const view=ref('2d');
  const showFurniture=ref(false);
  const showFileMenu=ref(false);
  const showLoadDialog=ref(false);
  const showSaveDialog=ref(false);
  const projectName=ref('');
  const currentProjectId=ref('');
  const statusMsg=ref('');
  const wallHeight=ref(2.8);
  const gridSize=ref(0.5);
  const selectedItem=ref(null);
  const selectedItems=ref([]);
  const currentFilePath=ref('');

  const rooms=ref([]);
  const doors=ref([]);
  const windows=ref([]);
  const furnitureItems=ref([]);
  const furnitureList=FURNITURE_LIST;

  const undoStack=ref([]);
  const redoStack=ref([]);
  const savedProjects=ref([]);

  // canvas refs
  const canvas2d=ref(null);
  const canvasWrap=ref(null);
  const canvas3d=ref(null);
  const canvas3dWrap=ref(null);

  let ctx=null;
  let canvasW=0,canvasH=0;
  // pan & zoom
  let panX=0,panY=0,zoom=30; // 30 px per meter
  let isPanning=false,panStartX=0,panStartY=0;
  // drawing
  let isDrawing=false,drawStart=null;
  let isDragging=false;
  // 3D
  let threeScene=null,threeCamera=null,threeRenderer=null,threeControls=null;
  let threeLoaded=false;
  let THREE=null,OrbitControls=null;
  let resizeObs=null;

  // ─── coordinate transforms ───
  function screenToWorld(sx,sy){
    return{x:(sx-canvasW/2-panX)/zoom, y:(sy-canvasH/2-panY)/zoom};
  }
  function worldToScreen(wx,wy){
    return{x:wx*zoom+canvasW/2+panX, y:wy*zoom+canvasH/2+panY};
  }
  function snapToGrid(v){return Math.round(v/gridSize.value)*gridSize.value}

  // ─── history ───
  function pushHistory(){
    undoStack.value.push(JSON.stringify({rooms:rooms.value,doors:doors.value,windows:windows.value,furnitureItems:furnitureItems.value}));
    if(undoStack.value.length>50)undoStack.value.shift();
    redoStack.value=[];
  }
  function undo(){
    if(!undoStack.value.length)return;
    redoStack.value.push(JSON.stringify({rooms:rooms.value,doors:doors.value,windows:windows.value,furnitureItems:furnitureItems.value}));
    const s=JSON.parse(undoStack.value.pop());
    rooms.value=s.rooms;doors.value=s.doors;windows.value=s.windows;furnitureItems.value=s.furnitureItems;
    selectedItem.value=null;render2D();
  }
  function redo(){
    if(!redoStack.value.length)return;
    undoStack.value.push(JSON.stringify({rooms:rooms.value,doors:doors.value,windows:windows.value,furnitureItems:furnitureItems.value}));
    const s=JSON.parse(redoStack.value.pop());
    rooms.value=s.rooms;doors.value=s.doors;windows.value=s.windows;furnitureItems.value=s.furnitureItems;
    selectedItem.value=null;render2D();
  }

  // ─── 2D rendering ───
  function resizeCanvas(){
    if(!canvas2d.value||!canvasWrap.value)return;
    const r=canvasWrap.value.getBoundingClientRect();
    canvasW=r.width;canvasH=r.height;
    canvas2d.value.width=canvasW*devicePixelRatio;
    canvas2d.value.height=canvasH*devicePixelRatio;
    canvas2d.value.style.width=canvasW+'px';
    canvas2d.value.style.height=canvasH+'px';
    ctx=canvas2d.value.getContext('2d');
    ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
    render2D();
  }

  function render2D(){
    if(!ctx)return;
    ctx.clearRect(0,0,canvasW,canvasH);
    ctx.fillStyle='#11111b';ctx.fillRect(0,0,canvasW,canvasH);
    drawGrid();
    // rooms
    for(const r of rooms.value)drawRoom(r);
    // furniture
    for(const f of furnitureItems.value)drawFurnitureItem(f);
    // doors & windows
    for(const d of doors.value)drawDoor(d);
    for(const w of windows.value)drawWindow(w);
    // selection highlight
    if(selectedItems.value.length>0){for(const si of selectedItems.value)drawSelectionHighlight(si)}
    else if(selectedItem.value)drawSelectionHighlight(selectedItem.value);
    // drawing preview
    if(isDrawing&&drawStart){
      const m=mode.value;
      if(m==='room'){
        ctx.strokeStyle='rgba(137,180,250,0.6)';ctx.lineWidth=1;ctx.setLineDash([5,5]);
        const s=worldToScreen(drawStart.x,drawStart.y);
        const e=worldToScreen(drawStart.ex,drawStart.ey);
        ctx.strokeRect(s.x,s.y,e.x-s.x,e.y-s.y);
        ctx.setLineDash([]);
      }
    }
  }

  function drawGrid(){
    ctx.strokeStyle='#313244';ctx.lineWidth=0.5;
    const gs=gridSize.value*zoom;
    const ox=(canvasW/2+panX)%gs;
    const oy=(canvasH/2+panY)%gs;
    for(let x=ox;x<canvasW;x+=gs){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,canvasH);ctx.stroke()}
    for(let y=oy;y<canvasH;y+=gs){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(canvasW,y);ctx.stroke()}
    // origin cross
    const o=worldToScreen(0,0);
    ctx.strokeStyle='#45475a';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(o.x-10,o.y);ctx.lineTo(o.x+10,o.y);ctx.stroke();
    ctx.beginPath();ctx.moveTo(o.x,o.y-10);ctx.lineTo(o.x,o.y+10);ctx.stroke();
  }

  function drawRoom(r){
    const s=worldToScreen(r.x,r.y);
    const w=r.w*zoom,h=r.h*zoom;
    ctx.fillStyle=r.floorColor||'#2a2a40';
    ctx.fillRect(s.x,s.y,w,h);
    ctx.strokeStyle=r.wallColor||'#cdd6f4';ctx.lineWidth=3;
    ctx.strokeRect(s.x,s.y,w,h);
    // room name
    ctx.fillStyle='#cdd6f4';ctx.font='12px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';
    const name=r.name||L('room');
    ctx.fillText(name,s.x+w/2,s.y+h/2-8);
    // dimensions
    ctx.fillStyle='#6c7086';ctx.font='10px system-ui';
    ctx.fillText(r.w.toFixed(1)+'m × '+r.h.toFixed(1)+'m',s.x+w/2,s.y+h/2+8);
  }

  function drawDoor(d){
    const s=worldToScreen(d.x,d.y);
    const w=d.w*zoom;
    ctx.save();
    ctx.translate(s.x+w/2,s.y);
    ctx.rotate((d.rotation||0)*Math.PI/180);
    ctx.fillStyle='#f9e2af';ctx.fillRect(-w/2,-4,w,8);
    // arc to indicate swing
    ctx.strokeStyle='rgba(249,226,175,0.4)';ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(-w/2,0,w,0,-Math.PI/2,true);ctx.stroke();
    ctx.restore();
  }

  function drawWindow(w){
    const s=worldToScreen(w.x,w.y);
    const ww=w.w*zoom;
    ctx.save();
    ctx.translate(s.x+ww/2,s.y);
    ctx.rotate((w.rotation||0)*Math.PI/180);
    ctx.fillStyle='#89dceb';ctx.fillRect(-ww/2,-3,ww,6);
    ctx.strokeStyle='#74c7ec';ctx.lineWidth=1;
    ctx.strokeRect(-ww/2,-3,ww,6);
    // center line
    ctx.beginPath();ctx.moveTo(0,-3);ctx.lineTo(0,3);ctx.stroke();
    ctx.restore();
  }

  function drawFurnitureItem(f){
    const s=worldToScreen(f.x,f.y);
    const w=f.w*zoom,h=f.h*zoom;
    ctx.save();
    ctx.translate(s.x+w/2,s.y+h/2);
    ctx.rotate((f.rotation||0)*Math.PI/180);
    ctx.fillStyle=f.color||'#555';ctx.globalAlpha=0.7;
    ctx.fillRect(-w/2,-h/2,w,h);
    ctx.globalAlpha=1;
    ctx.strokeStyle='#888';ctx.lineWidth=1;ctx.strokeRect(-w/2,-h/2,w,h);
    ctx.fillStyle='#fff';ctx.font='11px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(f.icon||'',0,0);
    ctx.restore();
  }

  function drawSelectionHighlight(item){
    const s=worldToScreen(item.x,item.y);
    if(item.kind==='room'){
      const w=item.w*zoom,h=item.h*zoom;
      ctx.strokeStyle='#89b4fa';ctx.lineWidth=2;ctx.setLineDash([6,3]);
      ctx.strokeRect(s.x-2,s.y-2,w+4,h+4);ctx.setLineDash([]);
    }else if(item.kind==='door'||item.kind==='window'){
      const w=item.w*zoom;
      ctx.strokeStyle='#89b4fa';ctx.lineWidth=2;ctx.setLineDash([6,3]);
      ctx.strokeRect(s.x-4,s.y-8,w+8,16);ctx.setLineDash([]);
    }else{
      const w=item.w*zoom,h=item.h*zoom;
      ctx.strokeStyle='#89b4fa';ctx.lineWidth=2;ctx.setLineDash([6,3]);
      ctx.strokeRect(s.x-2,s.y-2,w+4,h+4);ctx.setLineDash([]);
    }
  }

  // ─── hit test ───
  function hitTest(wx,wy){
    // furniture (top-most first)
    for(let i=furnitureItems.value.length-1;i>=0;i--){
      const f=furnitureItems.value[i];
      if(wx>=f.x&&wx<=f.x+f.w&&wy>=f.y&&wy<=f.y+f.h)return f;
    }
    // doors
    for(const d of doors.value){
      if(wx>=d.x-0.1&&wx<=d.x+d.w+0.1&&wy>=d.y-0.3&&wy<=d.y+0.3)return d;
    }
    // windows
    for(const w of windows.value){
      if(wx>=w.x-0.1&&wx<=w.x+w.w+0.1&&wy>=w.y-0.3&&wy<=w.y+0.3)return w;
    }
    // rooms
    for(let i=rooms.value.length-1;i>=0;i--){
      const r=rooms.value[i];
      if(wx>=r.x&&wx<=r.x+r.w&&wy>=r.y&&wy<=r.y+r.h)return r;
    }
    return null;
  }

  // ─── mouse events ───
  function getAllItems(){return[...rooms.value,...doors.value,...windows.value,...furnitureItems.value]}
  function isSelected(item){return selectedItems.value.some(s=>s.id===item.id)}

  function onCanvasDown(e){
    const rect=canvasWrap.value.getBoundingClientRect();
    const sx=e.clientX-rect.left,sy=e.clientY-rect.top;
    const w=screenToWorld(sx,sy);

    if(e.button===1||e.button===2||(e.button===0&&e.altKey)){
      isPanning=true;panStartX=e.clientX-panX;panStartY=e.clientY-panY;return;
    }

    if(mode.value==='select'){
      const hit=hitTest(w.x,w.y);
      if(e.ctrlKey||e.metaKey){
        // Ctrl+click: toggle item in multi-select
        if(hit){
          if(isSelected(hit)){
            selectedItems.value=selectedItems.value.filter(s=>s.id!==hit.id);
            if(selectedItem.value&&selectedItem.value.id===hit.id)selectedItem.value=selectedItems.value[0]||null;
          }else{
            selectedItems.value.push(hit);
            selectedItem.value=hit;
          }
        }
      }else{
        // Normal click: single select
        if(hit){
          if(!isSelected(hit)){selectedItems.value=[hit]}
          selectedItem.value=hit;
        }else{
          selectedItems.value=[];selectedItem.value=null;
        }
      }
      if(selectedItems.value.length>0&&hit){
        isDragging=true;
        dragOffsets=selectedItems.value.map(it=>({id:it.id,dx:w.x-it.x,dy:w.y-it.y}));
      }
      render2D();return;
    }

    if(mode.value==='room'){
      isDrawing=true;
      const gx=snapToGrid(w.x),gy=snapToGrid(w.y);
      drawStart={x:gx,y:gy,ex:gx,ey:gy};return;
    }

    if(mode.value==='door'){
      pushHistory();
      const gx=snapToGrid(w.x),gy=snapToGrid(w.y);
      doors.value.push({id:uid(),kind:'door',x:gx,y:gy,w:0.9,rotation:0});
      render2D();return;
    }
    if(mode.value==='window'){
      pushHistory();
      const gx=snapToGrid(w.x),gy=snapToGrid(w.y);
      windows.value.push({id:uid(),kind:'window',x:gx,y:gy,w:1.0,rotation:0});
      render2D();return;
    }
  }

  let dragOffsets=[];

  function onCanvasMove(e){
    const rect=canvasWrap.value.getBoundingClientRect();
    const sx=e.clientX-rect.left,sy=e.clientY-rect.top;
    const w=screenToWorld(sx,sy);

    if(isPanning){panX=e.clientX-panStartX;panY=e.clientY-panStartY;render2D();return}

    if(isDrawing&&drawStart){
      drawStart.ex=snapToGrid(w.x);drawStart.ey=snapToGrid(w.y);render2D();return;
    }
    if(isDragging&&selectedItems.value.length>0){
      for(const off of dragOffsets){
        const item=selectedItems.value.find(s=>s.id===off.id);
        if(item){item.x=snapToGrid(w.x-off.dx);item.y=snapToGrid(w.y-off.dy)}
      }
      render2D();return;
    }
  }

  function onCanvasUp(e){
    if(isPanning){isPanning=false;return}
    if(isDragging){isDragging=false;pushHistory();return}
    if(isDrawing&&drawStart){
      isDrawing=false;
      let x1=Math.min(drawStart.x,drawStart.ex),y1=Math.min(drawStart.y,drawStart.ey);
      let x2=Math.max(drawStart.x,drawStart.ex),y2=Math.max(drawStart.y,drawStart.ey);
      const w=x2-x1,h=y2-y1;
      if(w>=0.5&&h>=0.5){
        pushHistory();
        rooms.value.push({id:uid(),kind:'room',x:x1,y:y1,w,h,name:'',floorColor:'#2a2a40',wallColor:'#cdd6f4',rotation:0});
      }
      drawStart=null;
      render2D();
    }
  }

  function onCanvasWheel(e){
    e.preventDefault();
    const factor=e.deltaY<0?1.1:0.9;
    zoom=Math.max(5,Math.min(200,zoom*factor));
    render2D();
  }

  // ─── furniture placement ───
  function toggleFurniturePanel(){showFurniture.value=!showFurniture.value}
  function selectFurniture(f){
    mode.value='select';showFurniture.value=false;
    pushHistory();
    const cx=-panX/zoom;const cy=-panY/zoom;
    furnitureItems.value.push({id:uid(),kind:'furniture',type:f.type,icon:f.icon,x:snapToGrid(cx),y:snapToGrid(cy),w:f.w,h:f.h,color:f.color,rotation:0});
    render2D();
  }

  function deleteSelected(){
    if(selectedItems.value.length===0&&!selectedItem.value)return;
    pushHistory();
    const ids=new Set(selectedItems.value.length>0?selectedItems.value.map(s=>s.id):[selectedItem.value.id]);
    rooms.value=rooms.value.filter(r=>!ids.has(r.id));
    doors.value=doors.value.filter(d=>!ids.has(d.id));
    windows.value=windows.value.filter(w=>!ids.has(w.id));
    furnitureItems.value=furnitureItems.value.filter(f=>!ids.has(f.id));
    selectedItem.value=null;selectedItems.value=[];render2D();
  }

  // ─── group / ungroup ───
  function groupSelected(){
    if(selectedItems.value.length<2)return;
    pushHistory();
    const items=selectedItems.value;
    let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
    for(const it of items){
      minX=Math.min(minX,it.x);minY=Math.min(minY,it.y);
      maxX=Math.max(maxX,it.x+(it.w||0));maxY=Math.max(maxY,it.y+(it.h||0));
    }
    const children=items.map(it=>{
      const c=JSON.parse(JSON.stringify(it));
      c.relX=it.x-minX;c.relY=it.y-minY;
      return c;
    });
    // remove originals
    const ids=new Set(items.map(s=>s.id));
    rooms.value=rooms.value.filter(r=>!ids.has(r.id));
    doors.value=doors.value.filter(d=>!ids.has(d.id));
    windows.value=windows.value.filter(w=>!ids.has(w.id));
    furnitureItems.value=furnitureItems.value.filter(f=>!ids.has(f.id));
    // create group item
    const grp={id:uid(),kind:'group',x:minX,y:minY,w:maxX-minX,h:maxY-minY,children,rotation:0,icon:'📦',color:'#6c7086'};
    furnitureItems.value.push(grp);
    selectedItems.value=[grp];selectedItem.value=grp;render2D();
  }

  function ungroupSelected(){
    const item=selectedItem.value;
    if(!item||item.kind!=='group'||!item.children)return;
    pushHistory();
    const baseX=item.x,baseY=item.y;
    for(const c of item.children){
      const restored={...c,x:baseX+(c.relX||0),y:baseY+(c.relY||0)};
      delete restored.relX;delete restored.relY;
      restored.id=uid();
      if(restored.kind==='room')rooms.value.push(restored);
      else if(restored.kind==='door')doors.value.push(restored);
      else if(restored.kind==='window')windows.value.push(restored);
      else furnitureItems.value.push(restored);
    }
    furnitureItems.value=furnitureItems.value.filter(f=>f.id!==item.id);
    selectedItem.value=null;selectedItems.value=[];render2D();
  }

  const canGroup=computed(()=>selectedItems.value.length>=2);
  const canUngroup=computed(()=>selectedItem.value&&selectedItem.value.kind==='group');


  // ─── 3D ───
  async function loadThree(){
    if(threeLoaded)return;
    try{
      const[threeModule,orbitModule]=await Promise.all([import(THREE_CDN),import(ORBIT_CDN)]);
      THREE=threeModule;
      OrbitControls=orbitModule.OrbitControls;
      threeLoaded=true;
    }catch(err){console.error('Three.js load error',err)}
  }

  async function switchTo3D(){
    view.value='3d';
    await loadThree();
    await nextTick();
    init3D();
    rebuild3D();
  }

  function init3D(){
    if(!canvas3d.value||!canvas3dWrap.value||!THREE)return;
    const wrap=canvas3dWrap.value;
    const w=wrap.clientWidth,h=wrap.clientHeight;

    if(threeRenderer){threeRenderer.dispose()}
    threeScene=new THREE.Scene();
    threeScene.background=new THREE.Color(0x1e1e2e);

    threeCamera=new THREE.PerspectiveCamera(60,w/h,0.1,1000);
    threeCamera.position.set(10,12,10);
    threeCamera.lookAt(0,0,0);

    threeRenderer=new THREE.WebGLRenderer({canvas:canvas3d.value,antialias:true});
    threeRenderer.setSize(w,h);
    threeRenderer.setPixelRatio(devicePixelRatio);
    threeRenderer.shadowMap.enabled=true;

    threeControls=new OrbitControls(threeCamera,canvas3d.value);
    threeControls.enableDamping=true;

    // lights
    const amb=new THREE.AmbientLight(0xffffff,0.5);
    threeScene.add(amb);
    const dir=new THREE.DirectionalLight(0xffffff,0.8);
    dir.position.set(10,15,10);dir.castShadow=true;
    threeScene.add(dir);

    animate3D();
  }

  function animate3D(){
    if(view.value!=='3d')return;
    requestAnimationFrame(animate3D);
    if(threeControls)threeControls.update();
    if(threeRenderer&&threeScene&&threeCamera)threeRenderer.render(threeScene,threeCamera);
  }

  function rebuild3D(){
    if(!threeScene||!THREE)return;
    // clear old objects
    while(threeScene.children.length>0){
      const c=threeScene.children[0];
      if(c.geometry)c.geometry.dispose();
      if(c.material){if(Array.isArray(c.material))c.material.forEach(m=>m.dispose());else c.material.dispose()}
      threeScene.remove(c);
    }
    // re-add lights
    threeScene.add(new THREE.AmbientLight(0xffffff,0.5));
    const dir=new THREE.DirectionalLight(0xffffff,0.8);
    dir.position.set(10,15,10);dir.castShadow=true;
    threeScene.add(dir);

    const wh=wallHeight.value;
    const wallThickness=0.15;

    // ground plane
    const ground=new THREE.Mesh(
      new THREE.PlaneGeometry(50,50),
      new THREE.MeshStandardMaterial({color:0x2a2a40,roughness:0.8})
    );
    ground.rotation.x=-Math.PI/2;ground.position.y=-0.01;ground.receiveShadow=true;
    threeScene.add(ground);

    // rooms
    for(const r of rooms.value){
      // floor
      const floorColor=new THREE.Color(r.floorColor||'#2a2a40');
      const floor=new THREE.Mesh(
        new THREE.PlaneGeometry(r.w,r.h),
        new THREE.MeshStandardMaterial({color:floorColor,roughness:0.6})
      );
      floor.rotation.x=-Math.PI/2;
      floor.position.set(r.x+r.w/2,0,r.y+r.h/2);
      floor.receiveShadow=true;
      threeScene.add(floor);

      const wallColor=new THREE.Color(r.wallColor||'#cdd6f4');
      const wallMat=new THREE.MeshStandardMaterial({color:wallColor,roughness:0.5,side:THREE.DoubleSide});

      // 4 walls
      const walls=[
        {px:r.x+r.w/2,pz:r.y,sx:r.w,rot:0},           // front
        {px:r.x+r.w/2,pz:r.y+r.h,sx:r.w,rot:0},       // back
        {px:r.x,pz:r.y+r.h/2,sx:r.h,rot:Math.PI/2},   // left
        {px:r.x+r.w,pz:r.y+r.h/2,sx:r.h,rot:Math.PI/2} // right
      ];

      for(const wl of walls){
        // check for doors/windows on this wall and create gaps
        const wallMesh=new THREE.Mesh(
          new THREE.BoxGeometry(wl.sx,wh,wallThickness),
          wallMat.clone()
        );
        wallMesh.position.set(wl.px,wh/2,wl.pz);
        wallMesh.rotation.y=wl.rot;
        wallMesh.castShadow=true;wallMesh.receiveShadow=true;
        threeScene.add(wallMesh);
      }
    }

    // doors in 3D
    for(const d of doors.value){
      const doorMat=new THREE.MeshStandardMaterial({color:0xf9e2af,roughness:0.4});
      const doorMesh=new THREE.Mesh(new THREE.BoxGeometry(d.w,wh*0.85,0.05),doorMat);
      doorMesh.position.set(d.x+d.w/2,wh*0.85/2,d.y);
      doorMesh.rotation.y=(d.rotation||0)*Math.PI/180;
      doorMesh.castShadow=true;
      threeScene.add(doorMesh);
    }

    // windows in 3D
    for(const w of windows.value){
      const winMat=new THREE.MeshStandardMaterial({color:0x89dceb,transparent:true,opacity:0.4,roughness:0.1});
      const winMesh=new THREE.Mesh(new THREE.BoxGeometry(w.w,wh*0.4,0.06),winMat);
      winMesh.position.set(w.x+w.w/2,wh*0.55,w.y);
      winMesh.rotation.y=(w.rotation||0)*Math.PI/180;
      threeScene.add(winMesh);
    }

    // furniture in 3D
    for(const f of furnitureItems.value){
      const fColor=new THREE.Color(f.color||'#555');
      const fh=getFurniture3DHeight(f.type);
      const fMat=new THREE.MeshStandardMaterial({color:fColor,roughness:0.5});
      const fMesh=new THREE.Mesh(new THREE.BoxGeometry(f.w,fh,f.h),fMat);
      fMesh.position.set(f.x+f.w/2,fh/2,f.y+f.h/2);
      fMesh.rotation.y=(f.rotation||0)*Math.PI/180;
      fMesh.castShadow=true;fMesh.receiveShadow=true;
      threeScene.add(fMesh);
    }
  }

  function getFurniture3DHeight(type){
    const h={bed:0.5,sofa:0.8,table:0.75,chair:0.9,desk:0.75,wardrobe:2.0,bathtub:0.6,toilet:0.7,sink:0.85,stove:0.9,fridge:1.8,washingMachine:0.85,tv:0.6,bookshelf:1.8,diningTable:0.75,plant:0.8,lamp:1.5,rug:0.02};
    return h[type]||0.5;
  }

  function resetCamera3D(){
    if(!threeCamera)return;
    threeCamera.position.set(10,12,10);threeCamera.lookAt(0,0,0);
    if(threeControls)threeControls.target.set(0,0,0);
  }

  // ─── save/load server ───
  async function fetchProjects(){
    try{
      const res=await fetch('/api/3dhome/projects',{headers:getAuthHeaders()});
      if(res.ok){const d=await res.json();savedProjects.value=d.projects||[]}
    }catch{}
  }

  function saveProject(){
    showFileMenu.value=false;
    projectName.value=projectName.value||L('new');
    showSaveDialog.value=true;
  }

  async function doSave(){
    if(!projectName.value.trim())return;
    showSaveDialog.value=false;
    const id=currentProjectId.value||uid();
    currentProjectId.value=id;
    const data={
      id,name:projectName.value.trim().slice(0,50),
      date:new Date().toISOString().slice(0,10),
      rooms:rooms.value,doors:doors.value,windows:windows.value,
      furnitureItems:furnitureItems.value,wallHeight:wallHeight.value
    };
    try{
      await fetch('/api/3dhome/projects',{method:'POST',headers:getAuthHeaders(),body:JSON.stringify(data)});
      showStatus(L('saved'));
      fetchProjects();
    }catch{}
  }

  async function loadProject(id){
    showLoadDialog.value=false;
    try{
      const res=await fetch('/api/3dhome/projects/'+encodeURIComponent(id),{headers:getAuthHeaders()});
      if(res.ok){
        const d=await res.json();
        applyProjectData(d);
        showStatus(L('loaded'));
      }
    }catch{}
  }

  function applyProjectData(d){
    rooms.value=d.rooms||[];doors.value=d.doors||[];windows.value=d.windows||[];
    furnitureItems.value=d.furnitureItems||[];wallHeight.value=d.wallHeight||2.8;
    projectName.value=d.name||'';currentProjectId.value=d.id||'';
    selectedItem.value=null;selectedItems.value=[];undoStack.value=[];redoStack.value=[];
    render2D();
  }

  function getProjectJSON(){
    return JSON.stringify({
      name:projectName.value||'home-plan',
      rooms:rooms.value,doors:doors.value,windows:windows.value,
      furnitureItems:furnitureItems.value,wallHeight:wallHeight.value
    },null,2);
  }

  async function deleteProject(id){
    try{
      await fetch('/api/3dhome/projects/'+encodeURIComponent(id),{method:'DELETE',headers:getAuthHeaders()});
      showStatus(L('deleted'));
      fetchProjects();
    }catch{}
  }

  // ─── FileDialog save/load ───
  async function saveToFile(){
    showFileMenu.value=false;
    if(!window.FileDialog)return;
    const result=await window.FileDialog.save({
      title:'\uD83C\uDFE0 '+L('saveFile'),
      defaultName:(projectName.value||'home-plan')+'.3dhome',
      filters:[{label:'3D Home',extensions:['.3dhome','.json']}]
    });
    if(!result)return;
    currentFilePath.value=result.path;
    const content=getProjectJSON();
    await window.FileDialog.writeFile(result.path,content);
    showStatus(L('saved'));
  }

  async function openFromFile(){
    showFileMenu.value=false;
    if(!window.FileDialog)return;
    const result=await window.FileDialog.open({
      title:'\uD83D\uDCC2 '+L('openFile'),
      filters:[{label:'3D Home',extensions:['.3dhome','.json']}]
    });
    if(!result)return;
    try{
      const d=JSON.parse(result.content);
      pushHistory();
      applyProjectData(d);
      currentFilePath.value=result.path;
      showStatus(L('loaded'));
    }catch{}
  }

  async function quickSave(){
    showFileMenu.value=false;
    if(currentFilePath.value&&window.FileDialog){
      const content=getProjectJSON();
      await window.FileDialog.writeFile(currentFilePath.value,content);
      showStatus(L('saved'));
    }else if(currentProjectId.value){
      await doSave();
    }else{
      saveToFile();
    }
  }

  function showStatus(msg){statusMsg.value=msg;setTimeout(()=>statusMsg.value='',2000)}

  function newProject(){
    showFileMenu.value=false;
    pushHistory();
    rooms.value=[];doors.value=[];windows.value=[];furnitureItems.value=[];
    selectedItem.value=null;selectedItems.value=[];projectName.value='';currentProjectId.value='';currentFilePath.value='';
    render2D();
  }

  function exportJSON(){
    showFileMenu.value=false;
    const data=getProjectJSON();
    const blob=new Blob([data],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);
    a.download=(projectName.value||'home-plan')+'.3dhome';a.click();
    URL.revokeObjectURL(a.href);
  }

  function importJSON(){
    showFileMenu.value=false;
    const inp=document.createElement('input');inp.type='file';inp.accept='.3dhome,.json';
    inp.onchange=()=>{
      const file=inp.files[0];if(!file)return;
      const reader=new FileReader();
      reader.onload=()=>{
        try{
          const d=JSON.parse(reader.result);
          pushHistory();
          rooms.value=d.rooms||[];doors.value=d.doors||[];windows.value=d.windows||[];
          furnitureItems.value=d.furnitureItems||[];wallHeight.value=d.wallHeight||2.8;
          selectedItem.value=null;selectedItems.value=[];render2D();
        }catch{}
      };
      reader.readAsText(file);
    };
    inp.click();
  }

  // ─── lifecycle ───
  onMounted(()=>{
    nextTick(()=>{resizeCanvas();fetchProjects()});
    resizeObs=new ResizeObserver(()=>{resizeCanvas();if(view.value==='3d'&&threeRenderer&&canvas3dWrap.value){
      const w=canvas3dWrap.value.clientWidth,h=canvas3dWrap.value.clientHeight;
      threeRenderer.setSize(w,h);threeCamera.aspect=w/h;threeCamera.updateProjectionMatrix();
    }});
    if(canvasWrap.value)resizeObs.observe(canvasWrap.value);
    document.addEventListener('click',closeMenus);
    document.addEventListener('keydown',onKeyDown);
  });

  onUnmounted(()=>{
    if(resizeObs)resizeObs.disconnect();
    if(threeRenderer)threeRenderer.dispose();
    document.removeEventListener('click',closeMenus);
    document.removeEventListener('keydown',onKeyDown);
  });

  function onKeyDown(e){
    if(e.target.closest('input,textarea'))return;
    if((e.key==='Delete'||e.key==='Backspace')&&(selectedItems.value.length>0||selectedItem.value)){
      e.preventDefault();deleteSelected();
    }
    if(e.ctrlKey&&e.key==='g'&&!e.shiftKey){e.preventDefault();groupSelected()}
    if(e.ctrlKey&&e.key==='G'&&e.shiftKey){e.preventDefault();ungroupSelected()}
    if(e.ctrlKey&&e.key==='s'){e.preventDefault();quickSave()}
    if(e.ctrlKey&&e.key==='z'){e.preventDefault();undo()}
    if(e.ctrlKey&&e.key==='y'){e.preventDefault();redo()}
    if(e.ctrlKey&&e.key==='a'){e.preventDefault();selectedItems.value=getAllItems();selectedItem.value=selectedItems.value[0]||null;render2D()}
  }

  function closeMenus(e){
    if(showFileMenu.value)showFileMenu.value=false;
  }

  // watch view change to resize 3D
  watch(view,(v)=>{if(v==='2d')nextTick(resizeCanvas)});

  return{
    L,mode,view,showFurniture,showFileMenu,showLoadDialog,showSaveDialog,
    projectName,statusMsg,wallHeight,gridSize,selectedItem,selectedItems,canGroup,canUngroup,
    rooms,doors,windows,furnitureItems,furnitureList,savedProjects,
    canvas2d,canvasWrap,canvas3d,canvas3dWrap,
    onCanvasDown,onCanvasMove,onCanvasUp,onCanvasWheel,
    toggleFurniturePanel,selectFurniture,deleteSelected,
    groupSelected,ungroupSelected,
    undo,redo,render2D,switchTo3D,resetCamera3D,rebuild3D,
    newProject,saveProject,doSave,loadProject,deleteProject,
    saveToFile,openFromFile,quickSave,
    exportJSON,importJSON
  };
}
}})(Vue);
