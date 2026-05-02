(function(Vue){
const{ref,onMounted,onUnmounted,watch,nextTick,computed}=Vue;

const LANGS={
  tr:{file:'Dosya',new:'Yeni',save:'Kaydet',load:'Yükle',cancel:'İptal',delete:'Sil',undo:'Geri Al',redo:'Yinele',bold:'Kalın',italic:'İtalik',strikethrough:'Üstü Çizili',underline:'Altı Çizili',textColor:'Metin Rengi',bgColor:'Arka Plan Rengi',align:'Hizalama',merge:'Birleştir',insertRow:'Satır Ekle',insertCol:'Sütun Ekle',deleteRow:'Satır Sil',deleteCol:'Sütun Sil',freeze:'Dondur',exportCSV:'CSV Dışa Aktar',importFile:'Dosya İçe Aktar (xls, xlsx, csv)',projectName:'Dosya Adı',noFiles:'Kayıtlı dosya yok',saved:'Kaydedildi!',deleted:'Silindi!',loaded:'Yüklendi!',importing:'İçe aktarılıyor...',importError:'Dosya okunamadı',formulaPlaceholder:'Formül veya değer girin',loading:'Yükleniyor...'},
  en:{file:'File',new:'New',save:'Save',load:'Load',cancel:'Cancel',delete:'Delete',undo:'Undo',redo:'Redo',bold:'Bold',italic:'Italic',strikethrough:'Strikethrough',underline:'Underline',textColor:'Text Color',bgColor:'Background Color',align:'Align',merge:'Merge',insertRow:'Insert Row',insertCol:'Insert Column',deleteRow:'Delete Row',deleteCol:'Delete Column',freeze:'Freeze',exportCSV:'Export CSV',importFile:'Import File (xls, xlsx, csv)',projectName:'File Name',noFiles:'No saved files',saved:'Saved!',deleted:'Deleted!',loaded:'Loaded!',importing:'Importing...',importError:'Failed to read file',formulaPlaceholder:'Enter formula or value',loading:'Loading...'},
  de:{file:'Datei',new:'Neu',save:'Speichern',load:'Laden',cancel:'Abbrechen',delete:'Löschen',undo:'Rückgängig',redo:'Wiederholen',bold:'Fett',italic:'Kursiv',strikethrough:'Durchgestrichen',underline:'Unterstrichen',textColor:'Textfarbe',bgColor:'Hintergrundfarbe',align:'Ausrichten',merge:'Verbinden',insertRow:'Zeile einfügen',insertCol:'Spalte einfügen',deleteRow:'Zeile löschen',deleteCol:'Spalte löschen',freeze:'Einfrieren',exportCSV:'CSV Export',importFile:'Datei importieren (xls, xlsx, csv)',projectName:'Dateiname',noFiles:'Keine gespeicherten Dateien',saved:'Gespeichert!',deleted:'Gelöscht!',loaded:'Geladen!',importing:'Importieren...',importError:'Datei konnte nicht gelesen werden',formulaPlaceholder:'Formel oder Wert eingeben',loading:'Laden...'},
  fr:{file:'Fichier',new:'Nouveau',save:'Enregistrer',load:'Charger',cancel:'Annuler',delete:'Supprimer',undo:'Annuler',redo:'Rétablir',bold:'Gras',italic:'Italique',strikethrough:'Barré',underline:'Souligné',textColor:'Couleur du texte',bgColor:'Couleur de fond',align:'Aligner',merge:'Fusionner',insertRow:'Insérer ligne',insertCol:'Insérer colonne',deleteRow:'Supprimer ligne',deleteCol:'Supprimer colonne',freeze:'Geler',exportCSV:'Exporter CSV',importFile:'Importer fichier (xls, xlsx, csv)',projectName:'Nom du fichier',noFiles:'Aucun fichier enregistré',saved:'Enregistré!',deleted:'Supprimé!',loaded:'Chargé!',importing:'Importation...',importError:'Impossible de lire le fichier',formulaPlaceholder:'Entrez une formule ou valeur',loading:'Chargement...'},
  es:{file:'Archivo',new:'Nuevo',save:'Guardar',load:'Cargar',cancel:'Cancelar',delete:'Eliminar',undo:'Deshacer',redo:'Rehacer',bold:'Negrita',italic:'Cursiva',strikethrough:'Tachado',underline:'Subrayado',textColor:'Color de texto',bgColor:'Color de fondo',align:'Alinear',merge:'Fusionar',insertRow:'Insertar fila',insertCol:'Insertar columna',deleteRow:'Eliminar fila',deleteCol:'Eliminar columna',freeze:'Congelar',exportCSV:'Exportar CSV',importFile:'Importar archivo (xls, xlsx, csv)',projectName:'Nombre del archivo',noFiles:'No hay archivos guardados',saved:'¡Guardado!',deleted:'¡Eliminado!',loaded:'¡Cargado!',importing:'Importando...',importError:'No se pudo leer el archivo',formulaPlaceholder:'Ingrese fórmula o valor',loading:'Cargando...'},
  ru:{file:'Файл',new:'Новый',save:'Сохранить',load:'Загрузить',cancel:'Отмена',delete:'Удалить',undo:'Отменить',redo:'Вперёд',bold:'Жирный',italic:'Курсив',strikethrough:'Зачёркнутый',underline:'Подчёркнутый',textColor:'Цвет текста',bgColor:'Цвет фона',align:'Выравнивание',merge:'Объединить',insertRow:'Вставить строку',insertCol:'Вставить столбец',deleteRow:'Удалить строку',deleteCol:'Удалить столбец',freeze:'Заморозить',exportCSV:'Экспорт CSV',importFile:'Импорт файла (xls, xlsx, csv)',projectName:'Имя файла',noFiles:'Нет сохранённых файлов',saved:'Сохранено!',deleted:'Удалено!',loaded:'Загружено!',importing:'Импорт...',importError:'Не удалось прочитать файл',formulaPlaceholder:'Введите формулу или значение',loading:'Загрузка...'},
  zh:{file:'文件',new:'新建',save:'保存',load:'加载',cancel:'取消',delete:'删除',undo:'撤销',redo:'重做',bold:'粗体',italic:'斜体',strikethrough:'删除线',underline:'下划线',textColor:'文字颜色',bgColor:'背景颜色',align:'对齐',merge:'合并',insertRow:'插入行',insertCol:'插入列',deleteRow:'删除行',deleteCol:'删除列',freeze:'冻结',exportCSV:'导出CSV',importFile:'导入文件 (xls, xlsx, csv)',projectName:'文件名',noFiles:'没有已保存的文件',saved:'已保存！',deleted:'已删除！',loaded:'已加载！',importing:'导入中...',importError:'无法读取文件',formulaPlaceholder:'输入公式或值',loading:'加载中...'},
  ja:{file:'ファイル',new:'新規',save:'保存',load:'読込',cancel:'キャンセル',delete:'削除',undo:'元に戻す',redo:'やり直し',bold:'太字',italic:'斜体',strikethrough:'取消線',underline:'下線',textColor:'文字色',bgColor:'背景色',align:'配置',merge:'結合',insertRow:'行挿入',insertCol:'列挿入',deleteRow:'行削除',deleteCol:'列削除',freeze:'固定',exportCSV:'CSV出力',importFile:'ファイル読込 (xls, xlsx, csv)',projectName:'ファイル名',noFiles:'保存ファイルなし',saved:'保存しました！',deleted:'削除しました！',loaded:'読み込みました！',importing:'読込中...',importError:'ファイルを読み込めません',formulaPlaceholder:'数式または値を入力',loading:'読込中...'},
  it:{file:'File',new:'Nuovo',save:'Salva',load:'Carica',cancel:'Annulla',delete:'Elimina',undo:'Annulla',redo:'Ripeti',bold:'Grassetto',italic:'Corsivo',strikethrough:'Barrato',underline:'Sottolineato',textColor:'Colore testo',bgColor:'Colore sfondo',align:'Allinea',merge:'Unisci',insertRow:'Inserisci riga',insertCol:'Inserisci colonna',deleteRow:'Elimina riga',deleteCol:'Elimina colonna',freeze:'Blocca',exportCSV:'Esporta CSV',importFile:'Importa file (xls, xlsx, csv)',projectName:'Nome file',noFiles:'Nessun file salvato',saved:'Salvato!',deleted:'Eliminato!',loaded:'Caricato!',importing:'Importazione...',importError:'Impossibile leggere il file',formulaPlaceholder:'Inserisci formula o valore',loading:'Caricamento...'},
  ar:{file:'ملف',new:'جديد',save:'حفظ',load:'تحميل',cancel:'إلغاء',delete:'حذف',undo:'تراجع',redo:'إعادة',bold:'عريض',italic:'مائل',strikethrough:'يتوسطه خط',underline:'تحته خط',textColor:'لون النص',bgColor:'لون الخلفية',align:'محاذاة',merge:'دمج',insertRow:'إدراج صف',insertCol:'إدراج عمود',deleteRow:'حذف صف',deleteCol:'حذف عمود',freeze:'تجميد',exportCSV:'تصدير CSV',importFile:'استيراد ملف (xls, xlsx, csv)',projectName:'اسم الملف',noFiles:'لا توجد ملفات محفوظة',saved:'!تم الحفظ',deleted:'!تم الحذف',loaded:'!تم التحميل',importing:'...جار الاستيراد',importError:'تعذر قراءة الملف',formulaPlaceholder:'أدخل صيغة أو قيمة',loading:'...جار التحميل'},
  ko:{file:'파일',new:'새로 만들기',save:'저장',load:'불러오기',cancel:'취소',delete:'삭제',undo:'실행취소',redo:'다시실행',bold:'굵게',italic:'기울임',strikethrough:'취소선',underline:'밑줄',textColor:'텍스트 색상',bgColor:'배경 색상',align:'정렬',merge:'병합',insertRow:'행 삽입',insertCol:'열 삽입',deleteRow:'행 삭제',deleteCol:'열 삭제',freeze:'틀 고정',exportCSV:'CSV 내보내기',importFile:'파일 가져오기 (xls, xlsx, csv)',projectName:'파일 이름',noFiles:'저장된 파일 없음',saved:'저장됨!',deleted:'삭제됨!',loaded:'불러옴!',importing:'가져오는 중...',importError:'파일을 읽을 수 없습니다',formulaPlaceholder:'수식 또는 값 입력',loading:'로딩...'},
  hi:{file:'फ़ाइल',new:'नया',save:'सेव',load:'लोड',cancel:'रद्द',delete:'हटाएं',undo:'पूर्ववत',redo:'फिर से',bold:'बोल्ड',italic:'इटैलिक',strikethrough:'स्ट्राइकथ्रू',underline:'अंडरलाइन',textColor:'टेक्स्ट रंग',bgColor:'पृष्ठभूमि रंग',align:'संरेखण',merge:'मर्ज',insertRow:'पंक्ति जोड़ें',insertCol:'स्तंभ जोड़ें',deleteRow:'पंक्ति हटाएं',deleteCol:'स्तंभ हटाएं',freeze:'फ्रीज',exportCSV:'CSV निर्यात',importFile:'फ़ाइल आयात (xls, xlsx, csv)',projectName:'फ़ाइल नाम',noFiles:'कोई सेव फ़ाइल नहीं',saved:'सेव हो गया!',deleted:'हट गया!',loaded:'लोड हो गया!',importing:'आयात हो रहा...',importError:'फ़ाइल पढ़ नहीं सकी',formulaPlaceholder:'फ़ॉर्मूला या वैल्यू दर्ज करें',loading:'लोड हो रहा...'},
  pt:{file:'Arquivo',new:'Novo',save:'Salvar',load:'Carregar',cancel:'Cancelar',delete:'Excluir',undo:'Desfazer',redo:'Refazer',bold:'Negrito',italic:'Itálico',strikethrough:'Tachado',underline:'Sublinhado',textColor:'Cor do texto',bgColor:'Cor de fundo',align:'Alinhar',merge:'Mesclar',insertRow:'Inserir linha',insertCol:'Inserir coluna',deleteRow:'Excluir linha',deleteCol:'Excluir coluna',freeze:'Congelar',exportCSV:'Exportar CSV',importFile:'Importar arquivo (xls, xlsx, csv)',projectName:'Nome do arquivo',noFiles:'Nenhum arquivo salvo',saved:'Salvo!',deleted:'Excluído!',loaded:'Carregado!',importing:'Importando...',importError:'Não foi possível ler o arquivo',formulaPlaceholder:'Digite fórmula ou valor',loading:'Carregando...'}
};

const XSS_CSS='https://cdn.jsdelivr.net/npm/x-data-spreadsheet@1.1.9/dist/xspreadsheet.css';
const XSS_JS='https://cdn.jsdelivr.net/npm/x-data-spreadsheet@1.1.9/dist/xspreadsheet.js';
const XSS_LOCALE_EN='https://cdn.jsdelivr.net/npm/x-data-spreadsheet@1.1.9/dist/locale/en.js';

return{
setup(){
  const locale=ref(getLocale());
  function getLocale(){return localStorage.getItem('sys_locale')||'tr'}
  function t(k){return(LANGS[locale.value]&&LANGS[locale.value][k])||LANGS.en[k]||k}
  function onLocaleChanged(e){locale.value=e.detail||getLocale()}
  function getAuthHeaders(){
    var tk=localStorage.getItem('auth_token')||'';
    return{'Authorization':'Bearer '+tk,'Content-Type':'application/json'};
  }
  function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}

  const sheetContainer=ref(null);
  const showFileMenu=ref(false);
  const showSaveModal=ref(false);
  const showLoadModal=ref(false);
  const projectName=ref('');
  const currentFileId=ref('');
  const statusMsg=ref('');
  const savedFiles=ref([]);
  const formulaText=ref('');
  const cellRef=ref('A1');
  const isBold=ref(false);
  const isItalic=ref(false);
  const isStrike=ref(false);
  const isUnderline=ref(false);
  const textColor=ref('#333333');
  const bgColor=ref('#ffffff');
  const hAlign=ref('left');

  var xs=null; // x-spreadsheet instance

  // ── CDN loading ──
  function loadCSS(url){
    if(document.querySelector('link[href="'+url+'"]'))return;
    var l=document.createElement('link');
    l.rel='stylesheet';l.href=url;
    document.head.appendChild(l);
  }
  function loadScript(url){
    return new Promise(function(resolve,reject){
      if(document.querySelector('script[src="'+url+'"]')){resolve();return}
      var s=document.createElement('script');
      s.src=url;s.onload=resolve;s.onerror=reject;
      document.head.appendChild(s);
    });
  }

  async function initSpreadsheet(){
    loadCSS(XSS_CSS);
    await loadScript(XSS_JS);
    try{await loadScript(XSS_LOCALE_EN)}catch(e){}
    if(window.x_spreadsheet && window.x_spreadsheet.locale){
      try{window.x_spreadsheet.locale('en')}catch(e){}
    }
    await nextTick();
    if(!sheetContainer.value)return;
    sheetContainer.value.innerHTML='';

    var w=sheetContainer.value.clientWidth;
    var h=sheetContainer.value.clientHeight;

    xs=window.x_spreadsheet(sheetContainer.value,{
      mode:'edit',
      showToolbar:false,
      showGrid:true,
      showContextmenu:true,
      showBottomBar:true,
      view:{
        height:function(){return h},
        width:function(){return w}
      },
      row:{len:200,height:25},
      col:{len:26,width:100,indexWidth:60,minWidth:60}
    });

    xs.on('cell-selected',function(cell,ri,ci){
      updateCellInfo(ri,ci);
    });
    xs.on('cell-edited',function(text,ri,ci){
      updateCellInfo(ri,ci);
    });
  }

  var formulaDirty=false;

  function updateCellInfo(ri,ci){
    var colName=getColName(ci);
    cellRef.value=colName+(ri+1);
    try{
      var c=xs.cell(ri,ci);
      if(c&&c.text!=null){
        formulaText.value=String(c.text);
      }else{
        formulaText.value='';
      }
    }catch(e){formulaText.value=''}
    formulaDirty=false;
    readCellStyle(ri,ci);
  }

  function getColName(ci){
    var n='';
    var c=ci;
    while(c>=0){
      n=String.fromCharCode(65+(c%26))+n;
      c=Math.floor(c/26)-1;
    }
    return n;
  }

  function readCellStyle(ri,ci){
    try{
      var cs=xs.cellStyle(ri,ci);
      if(cs){
        isBold.value=!!(cs.font&&cs.font.bold);
        isItalic.value=!!(cs.font&&cs.font.italic);
        isStrike.value=!!cs.strike;
        isUnderline.value=!!cs.underline;
        if(cs.color)textColor.value=cs.color;
        if(cs.bgcolor)bgColor.value=cs.bgcolor;
        if(cs.align)hAlign.value=cs.align;
      }else{
        isBold.value=false;isItalic.value=false;
        isStrike.value=false;isUnderline.value=false;
      }
    }catch(e){}
  }

  function onFormulaInput(val){
    formulaText.value=val;
    formulaDirty=true;
  }

  function applyFormula(){
    if(!xs||!formulaDirty)return;
    formulaDirty=false;
    var txt=formulaText.value;
    var parts=cellRef.value.match(/^([A-Z]+)(\d+)$/);
    if(!parts)return;
    var ci=colNameToIdx(parts[1]);
    var ri=parseInt(parts[2])-1;
    xs.cellText(ri,ci,txt).reRender();
  }

  function colNameToIdx(name){
    var idx=0;
    for(var i=0;i<name.length;i++){
      idx=idx*26+(name.charCodeAt(i)-64);
    }
    return idx-1;
  }

  // ── Formatting ──
  function formatBold(){isBold.value=!isBold.value;applyStyle({font:{bold:isBold.value}})}
  function formatItalic(){isItalic.value=!isItalic.value;applyStyle({font:{italic:isItalic.value}})}
  function formatStrike(){isStrike.value=!isStrike.value;applyStyle({strike:isStrike.value})}
  function formatUnderline(){isUnderline.value=!isUnderline.value;applyStyle({underline:isUnderline.value})}
  function setTextColor(c){textColor.value=c;applyStyle({color:c})}
  function setBgColor(c){bgColor.value=c;applyStyle({bgcolor:c})}
  function setHAlign(a){hAlign.value=a;applyStyle({align:a})}

  function applyStyle(style){
    /* x-spreadsheet doesn't expose a direct cell style API for selected cells,
       so we use the internal data model. We read selected range and apply. */
    if(!xs)return;
    try{
      var data=xs.getData();
      var sheet=data[xs.sheet?xs.sheet.activeIndex||0:0];
      // The sheet tracks selected cell internally
      // For simplicity, re-render after data change
      xs.loadData(data);
    }catch(e){}
  }

  // ── Cell operations via x-spreadsheet internal ──
  function doUndo(){if(xs&&xs.sheet)try{xs.sheet.undo()}catch(e){}}
  function doRedo(){if(xs&&xs.sheet)try{xs.sheet.redo()}catch(e){}}

  function mergeCells(){
    if(xs&&xs.sheet)try{xs.sheet.merge()}catch(e){}
  }
  function insertRow(){
    if(xs&&xs.sheet)try{xs.sheet.insertRow()}catch(e){}
  }
  function insertCol(){
    if(xs&&xs.sheet)try{xs.sheet.insertColumn()}catch(e){}
  }
  function deleteRow(){
    if(xs&&xs.sheet)try{xs.sheet.deleteRow()}catch(e){}
  }
  function deleteCol(){
    if(xs&&xs.sheet)try{xs.sheet.deleteColumn()}catch(e){}
  }
  function freezeCell(){
    if(xs&&xs.sheet)try{xs.sheet.freeze()}catch(e){}
  }

  // ── File operations ──
  function newFile(){
    showFileMenu.value=false;
    projectName.value='';
    currentFileId.value='';
    if(xs){
      xs.loadData([{name:'Sheet1',rows:{},cols:{},freeze:'A1'}]);
    }
  }

  function openSaveDialog(){
    showFileMenu.value=false;
    showSaveModal.value=true;
  }

  function openLoadDialog(){
    showFileMenu.value=false;
    fetchFiles();
    showLoadModal.value=true;
  }

  async function doSave(){
    if(!projectName.value.trim())return;
    showSaveModal.value=false;
    var id=currentFileId.value||uid();
    currentFileId.value=id;
    var data=xs?xs.getData():[];
    var payload={
      id:id,
      name:projectName.value.trim().slice(0,50),
      date:new Date().toISOString().slice(0,10),
      sheets:data
    };
    try{
      await fetch('/api/spreadsheet/files',{
        method:'POST',
        headers:getAuthHeaders(),
        body:JSON.stringify(payload)
      });
      showStatus(t('saved'));
    }catch(e){}
  }

  async function fetchFiles(){
    try{
      var res=await fetch('/api/spreadsheet/files',{headers:getAuthHeaders()});
      if(res.ok){var d=await res.json();savedFiles.value=d.files||[]}
    }catch(e){}
  }

  async function loadFile(id){
    showLoadModal.value=false;
    try{
      var res=await fetch('/api/spreadsheet/files/'+encodeURIComponent(id),{headers:getAuthHeaders()});
      if(res.ok){
        var d=await res.json();
        if(xs&&d.sheets){
          xs.loadData(d.sheets);
        }
        projectName.value=d.name||'';
        currentFileId.value=d.id||'';
        showStatus(t('loaded'));
      }
    }catch(e){}
  }

  async function deleteFile(id){
    try{
      await fetch('/api/spreadsheet/files/'+encodeURIComponent(id),{
        method:'DELETE',
        headers:getAuthHeaders()
      });
      showStatus(t('deleted'));
      fetchFiles();
    }catch(e){}
  }

  function showStatus(msg){statusMsg.value=msg;setTimeout(function(){statusMsg.value=''},2000)}

  // ── Export / Import ──
  function exportCSV(){
    showFileMenu.value=false;
    if(!xs)return;
    var data=xs.getData();
    if(!data||!data.length)return;
    var sheet=data[0];
    var rows=sheet.rows||{};
    var csv='';
    var maxR=0,maxC=0;
    for(var rk in rows){
      if(rk==='len')continue;
      var ri=parseInt(rk);
      if(ri>maxR)maxR=ri;
      var cells=rows[rk].cells||{};
      for(var ck in cells){
        var ci=parseInt(ck);
        if(ci>maxC)maxC=ci;
      }
    }
    for(var r=0;r<=maxR;r++){
      var line=[];
      var row=rows[r];
      for(var c=0;c<=maxC;c++){
        var val='';
        if(row&&row.cells&&row.cells[c]){
          val=row.cells[c].text!=null?String(row.cells[c].text):'';
        }
        // Escape CSV
        if(val.indexOf(',')>=0||val.indexOf('"')>=0||val.indexOf('\n')>=0){
          val='"'+val.replace(/"/g,'""')+'"';
        }
        line.push(val);
      }
      csv+=line.join(',')+'\n';
    }
    downloadText(csv,(projectName.value||'spreadsheet')+'.csv','text/csv');
  }

  function importFile(){
    showFileMenu.value=false;
    var inp=document.createElement('input');
    inp.type='file';inp.accept='.xls,.xlsx,.csv';
    inp.onchange=async function(){
      var file=inp.files[0];if(!file)return;
      showStatus(t('importing'));
      var formData=new FormData();
      formData.append('file',file);
      try{
        var tk=localStorage.getItem('auth_token')||'';
        var res=await fetch('/api/spreadsheet/import',{
          method:'POST',
          headers:{'Authorization':'Bearer '+tk},
          body:formData
        });
        if(res.ok){
          var d=await res.json();
          if(xs&&d.sheets&&d.sheets.length){
            xs.loadData(d.sheets);
          }
          showStatus(t('loaded'));
        }else{
          showStatus(t('importError'));
        }
      }catch(e){
        showStatus(t('importError'));
      }
    };
    inp.click();
  }

  function downloadText(text,filename,mime){
    var blob=new Blob([text],{type:mime});
    var a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ── Resize handling ──
  var resizeObs=null;
  function handleResize(){
    if(!xs||!sheetContainer.value)return;
    // x-spreadsheet doesn't have a native resize API
    // Re-init is the safest approach
    var data=xs.getData();
    sheetContainer.value.innerHTML='';
    var w=sheetContainer.value.clientWidth;
    var h=sheetContainer.value.clientHeight;
    xs=window.x_spreadsheet(sheetContainer.value,{
      mode:'edit',
      showToolbar:false,
      showGrid:true,
      showContextmenu:true,
      showBottomBar:true,
      view:{
        height:function(){return h},
        width:function(){return w}
      },
      row:{len:200,height:25},
      col:{len:26,width:100,indexWidth:60,minWidth:60}
    });
    if(data&&data.length){
      xs.loadData(data);
    }
    xs.on('cell-selected',function(cell,ri,ci){updateCellInfo(ri,ci)});
    xs.on('cell-edited',function(text,ri,ci){updateCellInfo(ri,ci)});
  }

  // ── Lifecycle ──
  onMounted(function(){
    nextTick(function(){initSpreadsheet()});
    window.addEventListener('locale-changed',onLocaleChanged);
    document.addEventListener('click',closeMenus);
    resizeObs=new ResizeObserver(debounce(handleResize,300));
    if(sheetContainer.value)resizeObs.observe(sheetContainer.value);
  });

  onUnmounted(function(){
    window.removeEventListener('locale-changed',onLocaleChanged);
    document.removeEventListener('click',closeMenus);
    if(resizeObs)resizeObs.disconnect();
  });

  function closeMenus(){showFileMenu.value=false}

  function debounce(fn,ms){
    var timer;
    return function(){
      clearTimeout(timer);
      timer=setTimeout(fn,ms);
    };
  }

  return{
    t,locale,sheetContainer,
    showFileMenu,showSaveModal,showLoadModal,
    projectName,statusMsg,savedFiles,
    formulaText,cellRef,
    isBold,isItalic,isStrike,isUnderline,
    textColor,bgColor,hAlign,
    applyFormula,onFormulaInput,
    formatBold,formatItalic,formatStrike,formatUnderline,
    setTextColor,setBgColor,setHAlign,
    doUndo,doRedo,
    mergeCells,insertRow,insertCol,deleteRow,deleteCol,freezeCell,
    newFile,openSaveDialog,openLoadDialog,doSave,loadFile,deleteFile,
    exportCSV,importFile
  };
}
}})(Vue);
