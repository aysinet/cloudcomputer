(function(Vue) {
  const { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } = Vue;

  /* ── i18n ── */
  const LANGS = {
    tr: {
      title:'Devre Tasarımcısı',
      components:'Bileşenler',
      properties:'Özellikler',
      tools:'Araçlar',
      select:'Seç',
      wire:'Kablo',
      delete:'Sil',
      rotate:'Döndür',
      zoomIn:'Yakınlaştır',
      zoomOut:'Uzaklaştır',
      zoomFit:'Sığdır',
      undo:'Geri Al',
      redo:'Yinele',
      newFile:'Yeni',
      save:'Kaydet',
      load:'Aç',
      exportPng:'PNG Dışa Aktar',
      name:'Ad',
      value:'Değer',
      rotation:'Açı',
      resistor:'Direnç',
      capacitor:'Kondansatör',
      inductor:'Bobin',
      diode:'Diyot',
      led:'LED',
      zener:'Zener Diyot',
      npn:'NPN Transistör',
      pnp:'PNP Transistör',
      mosfetN:'N-MOSFET',
      mosfetP:'P-MOSFET',
      opamp:'Op-Amp',
      ic:'Entegre (IC)',
      battery:'Batarya',
      gnd:'Toprak',
      vcc:'VCC',
      switchComp:'Anahtar',
      fuse:'Sigorta',
      crystal:'Kristal',
      transformer:'Transformatör',
      relay:'Röle',
      potentiometer:'Potansiyometre',
      speaker:'Hoparlör',
      microphone:'Mikrofon',
      motor:'Motor',
      catPassive:'Pasif',
      catActive:'Aktif',
      catPower:'Güç',
      catIO:'Giriş/Çıkış',
      catIC:'Entegre',
      catElectro:'Elektromekanik',
      noSelection:'Bileşen seçilmedi',
      saved:'Kaydedildi',
      loaded:'Yüklendi',
      deleteConfirm:'Seçili bileşeni silmek istiyor musunuz?',
      gridSnap:'Izgara',
      showGrid:'Izgarayı Göster',
      snapToGrid:'Izgaraya Yapış',
      circuitName:'Devre Adı',
      unnamed:'İsimsiz Devre',
      netlist:'Netlist',
      copyNetlist:'Netlist Kopyala',
      copied:'Kopyalandı',
      x:'X',
      y:'Y',
      id:'ID',
      pins:'Pinler',
      wires:'Kablo',
      totalComponents:'Toplam Bileşen'
    },
    en: {
      title:'Circuit Designer',
      components:'Components',
      properties:'Properties',
      tools:'Tools',
      select:'Select',
      wire:'Wire',
      delete:'Delete',
      rotate:'Rotate',
      zoomIn:'Zoom In',
      zoomOut:'Zoom Out',
      zoomFit:'Fit',
      undo:'Undo',
      redo:'Redo',
      newFile:'New',
      save:'Save',
      load:'Open',
      exportPng:'Export PNG',
      name:'Name',
      value:'Value',
      rotation:'Angle',
      resistor:'Resistor',
      capacitor:'Capacitor',
      inductor:'Inductor',
      diode:'Diode',
      led:'LED',
      zener:'Zener Diode',
      npn:'NPN Transistor',
      pnp:'PNP Transistor',
      mosfetN:'N-MOSFET',
      mosfetP:'P-MOSFET',
      opamp:'Op-Amp',
      ic:'IC',
      battery:'Battery',
      gnd:'Ground',
      vcc:'VCC',
      switchComp:'Switch',
      fuse:'Fuse',
      crystal:'Crystal',
      transformer:'Transformer',
      relay:'Relay',
      potentiometer:'Potentiometer',
      speaker:'Speaker',
      microphone:'Microphone',
      motor:'Motor',
      catPassive:'Passive',
      catActive:'Active',
      catPower:'Power',
      catIO:'I/O',
      catIC:'Integrated',
      catElectro:'Electromechanical',
      noSelection:'No component selected',
      saved:'Saved',
      loaded:'Loaded',
      deleteConfirm:'Delete selected component?',
      gridSnap:'Grid',
      showGrid:'Show Grid',
      snapToGrid:'Snap to Grid',
      circuitName:'Circuit Name',
      unnamed:'Unnamed Circuit',
      netlist:'Netlist',
      copyNetlist:'Copy Netlist',
      copied:'Copied',
      x:'X',
      y:'Y',
      id:'ID',
      pins:'Pins',
      wires:'Wires',
      totalComponents:'Total Components'
    },
    de: {
      title:'Schaltplan-Designer',
      components:'Bauteile',
      properties:'Eigenschaften',
      tools:'Werkzeuge',
      select:'Auswählen',
      wire:'Leitung',
      delete:'Löschen',
      rotate:'Drehen',
      zoomIn:'Vergrößern',
      zoomOut:'Verkleinern',
      zoomFit:'Einpassen',
      undo:'Rückgängig',
      redo:'Wiederholen',
      newFile:'Neu',
      save:'Speichern',
      load:'Öffnen',
      exportPng:'PNG exportieren',
      name:'Name',
      value:'Wert',
      rotation:'Winkel',
      resistor:'Widerstand',
      capacitor:'Kondensator',
      inductor:'Spule',
      diode:'Diode',
      led:'LED',
      zener:'Zener-Diode',
      npn:'NPN-Transistor',
      pnp:'PNP-Transistor',
      mosfetN:'N-MOSFET',
      mosfetP:'P-MOSFET',
      opamp:'Op-Amp',
      ic:'IC',
      battery:'Batterie',
      gnd:'Masse',
      vcc:'VCC',
      switchComp:'Schalter',
      fuse:'Sicherung',
      crystal:'Kristall',
      transformer:'Transformator',
      relay:'Relais',
      potentiometer:'Potentiometer',
      speaker:'Lautsprecher',
      microphone:'Mikrofon',
      motor:'Motor',
      catPassive:'Passiv',
      catActive:'Aktiv',
      catPower:'Strom',
      catIO:'E/A',
      catIC:'Integriert',
      catElectro:'Elektromechanisch',
      noSelection:'Kein Bauteil ausgewählt',
      saved:'Gespeichert',
      loaded:'Geladen',
      deleteConfirm:'Ausgewähltes Bauteil löschen?',
      gridSnap:'Raster',
      showGrid:'Raster anzeigen',
      snapToGrid:'Am Raster ausrichten',
      circuitName:'Schaltungsname',
      unnamed:'Unbenannte Schaltung',
      netlist:'Netzliste',
      copyNetlist:'Netzliste kopieren',
      copied:'Kopiert',
      x:'X',
      y:'Y',
      id:'ID',
      pins:'Pins',
      wires:'Leitungen',
      totalComponents:'Bauteile gesamt'
    },
    fr: {
      title:'Concepteur de Circuits',
      components:'Composants',
      properties:'Propriétés',
      tools:'Outils',
      select:'Sélectionner',
      wire:'Câble',
      delete:'Supprimer',
      rotate:'Pivoter',
      zoomIn:'Agrandir',
      zoomOut:'Réduire',
      zoomFit:'Ajuster',
      undo:'Annuler',
      redo:'Rétablir',
      newFile:'Nouveau',
      save:'Enregistrer',
      load:'Ouvrir',
      exportPng:'Exporter PNG',
      name:'Nom',
      value:'Valeur',
      rotation:'Angle',
      resistor:'Résistance',
      capacitor:'Condensateur',
      inductor:'Bobine',
      diode:'Diode',
      led:'LED',
      zener:'Diode Zener',
      npn:'Transistor NPN',
      pnp:'Transistor PNP',
      mosfetN:'N-MOSFET',
      mosfetP:'P-MOSFET',
      opamp:'Op-Amp',
      ic:'CI',
      battery:'Batterie',
      gnd:'Masse',
      vcc:'VCC',
      switchComp:'Interrupteur',
      fuse:'Fusible',
      crystal:'Crystal',
      transformer:'Transformateur',
      relay:'Relais',
      potentiometer:'Potentiomètre',
      speaker:'Haut-parleur',
      microphone:'Microphone',
      motor:'Moteur',
      catPassive:'Passif',
      catActive:'Actif',
      catPower:'Alimentation',
      catIO:'E/S',
      catIC:'Intégré',
      catElectro:'Électromécanique',
      noSelection:'Aucun composant sélectionné',
      saved:'Enregistré',
      loaded:'Chargé',
      deleteConfirm:'Supprimer le composant sélectionné ?',
      gridSnap:'Grille',
      showGrid:'Afficher la grille',
      snapToGrid:'Accrocher à la grille',
      circuitName:'Nom du circuit',
      unnamed:'Circuit sans nom',
      netlist:'Netlist',
      copyNetlist:'Copier Netlist',
      copied:'Copié',
      x:'X',
      y:'Y',
      id:'ID',
      pins:'Broches',
      wires:'Câbles',
      totalComponents:'Total composants'
    },
    es: {
      title:'Diseñador de Circuitos',
      components:'Componentes',
      properties:'Propiedades',
      tools:'Herramientas',
      select:'Seleccionar',
      wire:'Cable',
      delete:'Eliminar',
      rotate:'Rotar',
      zoomIn:'Acercar',
      zoomOut:'Alejar',
      zoomFit:'Ajustar',
      undo:'Deshacer',
      redo:'Rehacer',
      newFile:'Nuevo',
      save:'Guardar',
      load:'Abrir',
      exportPng:'Exportar PNG',
      name:'Nombre',
      value:'Valor',
      rotation:'Ángulo',
      resistor:'Resistencia',
      capacitor:'Condensador',
      inductor:'Inductor',
      diode:'Diodo',
      led:'LED',
      zener:'Diodo Zener',
      npn:'Transistor NPN',
      pnp:'Transistor PNP',
      mosfetN:'N-MOSFET',
      mosfetP:'P-MOSFET',
      opamp:'Op-Amp',
      ic:'CI',
      battery:'Batería',
      gnd:'Tierra',
      vcc:'VCC',
      switchComp:'Interruptor',
      fuse:'Fusible',
      crystal:'Cristal',
      transformer:'Transformador',
      relay:'Relé',
      potentiometer:'Potenciómetro',
      speaker:'Altavoz',
      microphone:'Micrófono',
      motor:'Motor',
      catPassive:'Pasivo',
      catActive:'Activo',
      catPower:'Energía',
      catIO:'E/S',
      catIC:'Integrado',
      catElectro:'Electromecánico',
      noSelection:'Ningún componente seleccionado',
      saved:'Guardado',
      loaded:'Cargado',
      deleteConfirm:'¿Eliminar componente seleccionado?',
      gridSnap:'Cuadrícula',
      showGrid:'Mostrar cuadrícula',
      snapToGrid:'Ajustar a cuadrícula',
      circuitName:'Nombre del circuito',
      unnamed:'Circuito sin nombre',
      netlist:'Netlist',
      copyNetlist:'Copiar Netlist',
      copied:'Copiado',
      x:'X',
      y:'Y',
      id:'ID',
      pins:'Pines',
      wires:'Cables',
      totalComponents:'Total componentes'
    },
    ru: {
      title:'Конструктор Схем',
      components:'Компоненты',
      properties:'Свойства',
      tools:'Инструменты',
      select:'Выбрать',
      wire:'Провод',
      delete:'Удалить',
      rotate:'Повернуть',
      zoomIn:'Приблизить',
      zoomOut:'Отдалить',
      zoomFit:'По размеру',
      undo:'Отмена',
      redo:'Повтор',
      newFile:'Новый',
      save:'Сохранить',
      load:'Открыть',
      exportPng:'Экспорт PNG',
      name:'Имя',
      value:'Значение',
      rotation:'Угол',
      resistor:'Резистор',
      capacitor:'Конденсатор',
      inductor:'Катушка',
      diode:'Диод',
      led:'Светодиод',
      zener:'Стабилитрон',
      npn:'NPN Транзистор',
      pnp:'PNP Транзистор',
      mosfetN:'N-MOSFET',
      mosfetP:'P-MOSFET',
      opamp:'ОУ',
      ic:'Микросхема',
      battery:'Батарея',
      gnd:'Земля',
      vcc:'VCC',
      switchComp:'Переключатель',
      fuse:'Предохранитель',
      crystal:'Кварц',
      transformer:'Трансформатор',
      relay:'Реле',
      potentiometer:'Потенциометр',
      speaker:'Динамик',
      microphone:'Микрофон',
      motor:'Мотор',
      catPassive:'Пассивные',
      catActive:'Активные',
      catPower:'Питание',
      catIO:'Вход/Выход',
      catIC:'Интегральные',
      catElectro:'Электромеханика',
      noSelection:'Компонент не выбран',
      saved:'Сохранено',
      loaded:'Загружено',
      deleteConfirm:'Удалить выбранный компонент?',
      gridSnap:'Сетка',
      showGrid:'Показать сетку',
      snapToGrid:'Привязка к сетке',
      circuitName:'Название схемы',
      unnamed:'Безымянная схема',
      netlist:'Нетлист',
      copyNetlist:'Копировать Нетлист',
      copied:'Скопировано',
      x:'X',
      y:'Y',
      id:'ID',
      pins:'Выводы',
      wires:'Провода',
      totalComponents:'Всего компонентов'
    },
    zh: {
      title:'电路设计器',
      components:'元件',
      properties:'属性',
      tools:'工具',
      select:'选择',
      wire:'导线',
      delete:'删除',
      rotate:'旋转',
      zoomIn:'放大',
      zoomOut:'缩小',
      zoomFit:'适应',
      undo:'撤销',
      redo:'重做',
      newFile:'新建',
      save:'保存',
      load:'加载',
      exportPng:'导出PNG',
      name:'名称',
      value:'值',
      rotation:'旋转',
      resistor:'电阻',
      capacitor:'电容',
      inductor:'电感',
      diode:'二极管',
      led:'发光二极管',
      zener:'稳压二极管',
      npn:'NPN晶体管',
      pnp:'PNP晶体管',
      mosfetN:'N-MOSFET',
      mosfetP:'P-MOSFET',
      opamp:'运算放大器',
      ic:'集成电路',
      battery:'电池',
      gnd:'接地',
      vcc:'电源',
      switchComp:'开关',
      fuse:'保险丝',
      crystal:'晶振',
      transformer:'变压器',
      relay:'继电器',
      potentiometer:'电位器',
      speaker:'扬声器',
      microphone:'麦克风',
      motor:'电机',
      catPassive:'无源元件',
      catActive:'有源元件',
      catPower:'电源',
      catIO:'输入/输出',
      catIC:'集成电路',
      catElectro:'机电元件',
      noSelection:'未选中',
      saved:'已保存',
      loaded:'已加载',
      deleteConfirm:'确认删除？',
      gridSnap:'网格吸附',
      showGrid:'显示网格',
      snapToGrid:'吸附到网格',
      circuitName:'电路名称',
      unnamed:'未命名',
      netlist:'网表',
      copyNetlist:'复制网表',
      copied:'已复制',
      x:'X',
      y:'Y',
      id:'ID',
      pins:'引脚',
      wires:'导线',
      totalComponents:'元件总数'
    },
    ja: {
      title:'回路デザイナー',
      components:'部品',
      properties:'プロパティ',
      tools:'ツール',
      select:'選択',
      wire:'配線',
      delete:'削除',
      rotate:'回転',
      zoomIn:'拡大',
      zoomOut:'縮小',
      zoomFit:'全体表示',
      undo:'元に戻す',
      redo:'やり直し',
      newFile:'新規',
      save:'保存',
      load:'読込',
      exportPng:'PNG出力',
      name:'名前',
      value:'値',
      rotation:'回転',
      resistor:'抵抗',
      capacitor:'コンデンサ',
      inductor:'インダクタ',
      diode:'ダイオード',
      led:'LED',
      zener:'ツェナーダイオード',
      npn:'NPNトランジスタ',
      pnp:'PNPトランジスタ',
      mosfetN:'N-MOSFET',
      mosfetP:'P-MOSFET',
      opamp:'オペアンプ',
      ic:'IC',
      battery:'バッテリー',
      gnd:'グランド',
      vcc:'電源',
      switchComp:'スイッチ',
      fuse:'ヒューズ',
      crystal:'水晶振動子',
      transformer:'トランス',
      relay:'リレー',
      potentiometer:'可変抵抗',
      speaker:'スピーカー',
      microphone:'マイク',
      motor:'モーター',
      catPassive:'受動部品',
      catActive:'能動部品',
      catPower:'電源',
      catIO:'入出力',
      catIC:'集積回路',
      catElectro:'電気機械',
      noSelection:'選択なし',
      saved:'保存済',
      loaded:'読込済',
      deleteConfirm:'削除しますか？',
      gridSnap:'グリッド吸着',
      showGrid:'グリッド表示',
      snapToGrid:'グリッドに吸着',
      circuitName:'回路名',
      unnamed:'無題',
      netlist:'ネットリスト',
      copyNetlist:'ネットリストをコピー',
      copied:'コピー済',
      x:'X',
      y:'Y',
      id:'ID',
      pins:'ピン',
      wires:'配線',
      totalComponents:'部品数'
    },
    it: {
      title:'Progettista Circuiti',
      components:'Componenti',
      properties:'Proprietà',
      tools:'Strumenti',
      select:'Seleziona',
      wire:'Filo',
      delete:'Elimina',
      rotate:'Ruota',
      zoomIn:'Ingrandisci',
      zoomOut:'Riduci',
      zoomFit:'Adatta',
      undo:'Annulla',
      redo:'Ripristina',
      newFile:'Nuovo',
      save:'Salva',
      load:'Carica',
      exportPng:'Esporta PNG',
      name:'Nome',
      value:'Valore',
      rotation:'Rotazione',
      resistor:'Resistore',
      capacitor:'Condensatore',
      inductor:'Induttore',
      diode:'Diodo',
      led:'LED',
      zener:'Zener',
      npn:'NPN',
      pnp:'PNP',
      mosfetN:'N-MOSFET',
      mosfetP:'P-MOSFET',
      opamp:'Amp. operazionale',
      ic:'Circuito integrato',
      battery:'Batteria',
      gnd:'Massa',
      vcc:'Alimentazione',
      switchComp:'Interruttore',
      fuse:'Fusibile',
      crystal:'Cristallo',
      transformer:'Trasformatore',
      relay:'Relè',
      potentiometer:'Potenziometro',
      speaker:'Altoparlante',
      microphone:'Microfono',
      motor:'Motore',
      catPassive:'Passivi',
      catActive:'Attivi',
      catPower:'Alimentazione',
      catIO:'I/O',
      catIC:'Circuiti integrati',
      catElectro:'Elettromeccanici',
      noSelection:'Nessuna selezione',
      saved:'Salvato',
      loaded:'Caricato',
      deleteConfirm:'Confermi eliminazione?',
      gridSnap:'Aggancia griglia',
      showGrid:'Mostra griglia',
      snapToGrid:'Aggancia alla griglia',
      circuitName:'Nome circuito',
      unnamed:'Senza nome',
      netlist:'Netlist',
      copyNetlist:'Copia netlist',
      copied:'Copiato',
      x:'X',
      y:'Y',
      id:'ID',
      pins:'Pin',
      wires:'Fili',
      totalComponents:'Totale componenti'
    },
    ar: {
      title:'مصمم الدوائر',
      components:'Components',
      properties:'خصائص',
      tools:'أدوات',
      select:'تحديد',
      wire:'خشن',
      delete:'حذف',
      rotate:'تدوير',
      zoomIn:'تكبير',
      zoomOut:'تصغير',
      zoomFit:'ملاءمة',
      undo:'تراجع',
      redo:'إعادة',
      newFile:'جديد',
      save:'حفظ',
      load:'تحميل',
      exportPng:'Export PNG',
      name:'الاسم',
      value:'القيمة',
      rotation:'الزاوية',
      resistor:'Resistor',
      capacitor:'Capacitor',
      inductor:'Inductor',
      diode:'Diode',
      led:'LED',
      zener:'Zener Diode',
      npn:'NPN Transistor',
      pnp:'PNP Transistor',
      mosfetN:'N-MOSFET',
      mosfetP:'P-MOSFET',
      opamp:'Op-Amp',
      ic:'IC',
      battery:'Battery',
      gnd:'Ground',
      vcc:'VCC',
      switchComp:'Switch',
      fuse:'Fuse',
      crystal:'Crystal',
      transformer:'Transformer',
      relay:'Relay',
      potentiometer:'Potentiometer',
      speaker:'Speaker',
      microphone:'Microphone',
      motor:'Motor',
      catPassive:'Passive',
      catActive:'نشط',
      catPower:'Power',
      catIO:'I/O',
      catIC:'Integrated',
      catElectro:'Electromechanical',
      noSelection:'No component selected',
      saved:'تم الحفظ',
      loaded:'!تم التحميل',
      deleteConfirm:'Delete selected component?',
      gridSnap:'الشبكة',
      showGrid:'إظهار الشبكة',
      snapToGrid:'Snap to Grid',
      circuitName:'Circuit Name',
      unnamed:'Unnamed Circuit',
      netlist:'Netlist',
      copyNetlist:'Copy Netlist',
      copied:'تم النسخ',
      x:'X',
      y:'Y',
      id:'ID',
      pins:'Pins',
      wires:'Wires',
      totalComponents:'Total Components'
    },
    ko: {
      title:'회로 설계',
      components:'Components',
      properties:'속성',
      tools:'도구',
      select:'선택',
      wire:'강모',
      delete:'삭제',
      rotate:'회전',
      zoomIn:'확대',
      zoomOut:'축소',
      zoomFit:'맞추기',
      undo:'실행취소',
      redo:'다시실행',
      newFile:'새 파일',
      save:'저장',
      load:'불러오기',
      exportPng:'Export PNG',
      name:'이름',
      value:'값',
      rotation:'회전',
      resistor:'Resistor',
      capacitor:'Capacitor',
      inductor:'Inductor',
      diode:'Diode',
      led:'LED',
      zener:'Zener Diode',
      npn:'NPN Transistor',
      pnp:'PNP Transistor',
      mosfetN:'N-MOSFET',
      mosfetP:'P-MOSFET',
      opamp:'Op-Amp',
      ic:'IC',
      battery:'Battery',
      gnd:'Ground',
      vcc:'VCC',
      switchComp:'Switch',
      fuse:'Fuse',
      crystal:'Crystal',
      transformer:'Transformer',
      relay:'Relay',
      potentiometer:'Potentiometer',
      speaker:'Speaker',
      microphone:'Microphone',
      motor:'Motor',
      catPassive:'Passive',
      catActive:'활성',
      catPower:'Power',
      catIO:'I/O',
      catIC:'Integrated',
      catElectro:'Electromechanical',
      noSelection:'No component selected',
      saved:'저장됨',
      loaded:'불러옴!',
      deleteConfirm:'Delete selected component?',
      gridSnap:'격자',
      showGrid:'격자 표시',
      snapToGrid:'Snap to Grid',
      circuitName:'Circuit Name',
      unnamed:'Unnamed Circuit',
      netlist:'Netlist',
      copyNetlist:'Copy Netlist',
      copied:'복사됨',
      x:'X',
      y:'Y',
      id:'ID',
      pins:'Pins',
      wires:'Wires',
      totalComponents:'Total Components'
    },
    hi: {
      title:'सर्किट डिजाइनर',
      components:'Components',
      properties:'गुण',
      tools:'उपकरण',
      select:'चुनें',
      wire:'कड़े',
      delete:'हटाएं',
      rotate:'घुमाएं',
      zoomIn:'ज़ूम इन',
      zoomOut:'ज़ूम आउट',
      zoomFit:'फ़िट',
      undo:'पूर्ववत',
      redo:'फिर से',
      newFile:'नया',
      save:'सहेजें',
      load:'लोड',
      exportPng:'Export PNG',
      name:'नाम',
      value:'मूल्य',
      rotation:'घुमाव',
      resistor:'Resistor',
      capacitor:'Capacitor',
      inductor:'Inductor',
      diode:'Diode',
      led:'LED',
      zener:'Zener Diode',
      npn:'NPN Transistor',
      pnp:'PNP Transistor',
      mosfetN:'N-MOSFET',
      mosfetP:'P-MOSFET',
      opamp:'Op-Amp',
      ic:'IC',
      battery:'Battery',
      gnd:'Ground',
      vcc:'VCC',
      switchComp:'Switch',
      fuse:'Fuse',
      crystal:'Crystal',
      transformer:'Transformer',
      relay:'Relay',
      potentiometer:'Potentiometer',
      speaker:'Speaker',
      microphone:'Microphone',
      motor:'Motor',
      catPassive:'Passive',
      catActive:'सक्रिय',
      catPower:'Power',
      catIO:'I/O',
      catIC:'Integrated',
      catElectro:'Electromechanical',
      noSelection:'No component selected',
      saved:'सहेजा गया',
      loaded:'लोड हो गया!',
      deleteConfirm:'Delete selected component?',
      gridSnap:'ग्रिड',
      showGrid:'ग्रिड दिखाएं',
      snapToGrid:'Snap to Grid',
      circuitName:'Circuit Name',
      unnamed:'Unnamed Circuit',
      netlist:'Netlist',
      copyNetlist:'Copy Netlist',
      copied:'कॉपी किया',
      x:'X',
      y:'Y',
      id:'ID',
      pins:'Pins',
      wires:'Wires',
      totalComponents:'Total Components'
    },
    pt: {
      title:'Designer de Circuitos',
      components:'Components',
      properties:'Propriedades',
      tools:'Ferramentas',
      select:'Selecionar',
      wire:'Duro',
      delete:'Excluir',
      rotate:'Girar',
      zoomIn:'Ampliar',
      zoomOut:'Reduzir',
      zoomFit:'Ajustar',
      undo:'Desfazer',
      redo:'Refazer',
      newFile:'Novo',
      save:'Salvar',
      load:'Carregar',
      exportPng:'Export PNG',
      name:'Nome',
      value:'Valor',
      rotation:'Rotação',
      resistor:'Resistor',
      capacitor:'Capacitor',
      inductor:'Inductor',
      diode:'Diode',
      led:'LED',
      zener:'Zener Diode',
      npn:'NPN Transistor',
      pnp:'PNP Transistor',
      mosfetN:'N-MOSFET',
      mosfetP:'P-MOSFET',
      opamp:'Op-Amp',
      ic:'IC',
      battery:'Battery',
      gnd:'Ground',
      vcc:'VCC',
      switchComp:'Switch',
      fuse:'Fuse',
      crystal:'Crystal',
      transformer:'Transformer',
      relay:'Relay',
      potentiometer:'Potentiometer',
      speaker:'Speaker',
      microphone:'Microphone',
      motor:'Motor',
      catPassive:'Passive',
      catActive:'Ativos',
      catPower:'Power',
      catIO:'I/O',
      catIC:'Integrated',
      catElectro:'Electromechanical',
      noSelection:'No component selected',
      saved:'Salvo',
      loaded:'Carregado!',
      deleteConfirm:'Delete selected component?',
      gridSnap:'Grade',
      showGrid:'Mostrar grade',
      snapToGrid:'Snap to Grid',
      circuitName:'Circuit Name',
      unnamed:'Unnamed Circuit',
      netlist:'Netlist',
      copyNetlist:'Copy Netlist',
      copied:'Copiado',
      x:'X',
      y:'Y',
      id:'ID',
      pins:'Pins',
      wires:'Wires',
      totalComponents:'Total Components'
    }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  /* ── Component definitions ── */
  const GRID = 20;

  const COMPONENT_DEFS = {
    resistor:     { cat:'catPassive', symbol:'R', defaultValue:'1kΩ', pins:[{x:-40,y:0},{x:40,y:0}] },
    capacitor:    { cat:'catPassive', symbol:'C', defaultValue:'100nF', pins:[{x:-30,y:0},{x:30,y:0}] },
    inductor:     { cat:'catPassive', symbol:'L', defaultValue:'10mH', pins:[{x:-40,y:0},{x:40,y:0}] },
    potentiometer:{ cat:'catPassive', symbol:'POT', defaultValue:'10kΩ', pins:[{x:-40,y:0},{x:40,y:0},{x:0,y:-30}] },
    diode:        { cat:'catActive', symbol:'D', defaultValue:'1N4148', pins:[{x:-30,y:0},{x:30,y:0}] },
    led:          { cat:'catActive', symbol:'LED', defaultValue:'Red', pins:[{x:-30,y:0},{x:30,y:0}] },
    zener:        { cat:'catActive', symbol:'DZ', defaultValue:'5.1V', pins:[{x:-30,y:0},{x:30,y:0}] },
    npn:          { cat:'catActive', symbol:'Q', defaultValue:'2N2222', pins:[{x:-30,y:0},{x:20,y:-30},{x:20,y:30}] },
    pnp:          { cat:'catActive', symbol:'Q', defaultValue:'2N2907', pins:[{x:-30,y:0},{x:20,y:-30},{x:20,y:30}] },
    mosfetN:      { cat:'catActive', symbol:'M', defaultValue:'IRF540', pins:[{x:-30,y:0},{x:20,y:-30},{x:20,y:30}] },
    mosfetP:      { cat:'catActive', symbol:'M', defaultValue:'IRF9540', pins:[{x:-30,y:0},{x:20,y:-30},{x:20,y:30}] },
    opamp:        { cat:'catIC', symbol:'U', defaultValue:'LM741', pins:[{x:-40,y:-15},{x:-40,y:15},{x:40,y:0},{x:0,y:-30},{x:0,y:30}] },
    ic:           { cat:'catIC', symbol:'U', defaultValue:'IC', pins:[{x:-40,y:-20},{x:-40,y:0},{x:-40,y:20},{x:40,y:-20},{x:40,y:0},{x:40,y:20}] },
    battery:      { cat:'catPower', symbol:'V', defaultValue:'9V', pins:[{x:0,y:-30},{x:0,y:30}] },
    gnd:          { cat:'catPower', symbol:'GND', defaultValue:'', pins:[{x:0,y:-20}] },
    vcc:          { cat:'catPower', symbol:'VCC', defaultValue:'5V', pins:[{x:0,y:20}] },
    switchComp:   { cat:'catElectro', symbol:'SW', defaultValue:'SPST', pins:[{x:-30,y:0},{x:30,y:0}] },
    fuse:         { cat:'catElectro', symbol:'F', defaultValue:'1A', pins:[{x:-30,y:0},{x:30,y:0}] },
    crystal:      { cat:'catElectro', symbol:'Y', defaultValue:'16MHz', pins:[{x:-20,y:0},{x:20,y:0}] },
    transformer:  { cat:'catElectro', symbol:'T', defaultValue:'1:1', pins:[{x:-30,y:-20},{x:-30,y:20},{x:30,y:-20},{x:30,y:20}] },
    relay:        { cat:'catElectro', symbol:'K', defaultValue:'5V', pins:[{x:-30,y:-20},{x:-30,y:20},{x:30,y:0}] },
    speaker:      { cat:'catIO', symbol:'SPK', defaultValue:'8Ω', pins:[{x:-20,y:0},{x:20,y:0}] },
    microphone:   { cat:'catIO', symbol:'MIC', defaultValue:'', pins:[{x:-20,y:0},{x:20,y:0}] },
    motor:        { cat:'catIO', symbol:'M', defaultValue:'DC', pins:[{x:-30,y:0},{x:30,y:0}] }
  };

  const CATEGORIES = ['catPassive','catActive','catPower','catIO','catIC','catElectro'];

  /* ── Drawing functions for each component ── */
  function drawSymbol(ctx, type, x, y, rot, w, h) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot * Math.PI / 180);
    ctx.strokeStyle = '#c8d6e5';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#c8d6e5';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    switch(type) {
      case 'resistor': {
        ctx.beginPath();
        ctx.moveTo(-40, 0); ctx.lineTo(-25, 0);
        var zw = 5, zy = 8;
        for (var i = 0; i < 6; i++) {
          ctx.lineTo(-25 + zw * (i + 0.5), (i % 2 === 0 ? -zy : zy));
        }
        ctx.lineTo(25, 0); ctx.lineTo(40, 0);
        ctx.stroke();
        break;
      }
      case 'capacitor': {
        ctx.beginPath();
        ctx.moveTo(-30, 0); ctx.lineTo(-5, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-5, -12); ctx.lineTo(-5, 12); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(5, -12); ctx.lineTo(5, 12); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(5, 0); ctx.lineTo(30, 0); ctx.stroke();
        break;
      }
      case 'inductor': {
        ctx.beginPath();
        ctx.moveTo(-40, 0); ctx.lineTo(-28, 0);
        for (var i = 0; i < 4; i++) {
          ctx.arc(-20 + i * 12, 0, 6, Math.PI, 0, false);
        }
        ctx.lineTo(40, 0);
        ctx.stroke();
        break;
      }
      case 'potentiometer': {
        // Draw as resistor + arrow
        ctx.beginPath();
        ctx.moveTo(-40, 0); ctx.lineTo(-25, 0);
        var zw = 5, zy = 8;
        for (var i = 0; i < 6; i++) {
          ctx.lineTo(-25 + zw * (i + 0.5), (i % 2 === 0 ? -zy : zy));
        }
        ctx.lineTo(25, 0); ctx.lineTo(40, 0);
        ctx.stroke();
        // Wiper arrow
        ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(-5, -15); ctx.lineTo(5, -15); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(0, -12); ctx.stroke();
        break;
      }
      case 'diode': {
        ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-8, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8, -10); ctx.lineTo(-8, 10); ctx.lineTo(8, 0); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(8, -10); ctx.lineTo(8, 10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(30, 0); ctx.stroke();
        break;
      }
      case 'led': {
        // Diode + arrows
        ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-8, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8, -10); ctx.lineTo(-8, 10); ctx.lineTo(8, 0); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(8, -10); ctx.lineTo(8, 10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(30, 0); ctx.stroke();
        // Light arrows
        ctx.beginPath(); ctx.moveTo(2, -14); ctx.lineTo(8, -22); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(8, -14); ctx.lineTo(14, -22); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(6, -20); ctx.lineTo(10, -24); ctx.lineTo(8, -18); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(12, -20); ctx.lineTo(16, -24); ctx.lineTo(14, -18); ctx.stroke();
        break;
      }
      case 'zener': {
        ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-8, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8, -10); ctx.lineTo(-8, 10); ctx.lineTo(8, 0); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(5, -10); ctx.lineTo(8, -10); ctx.lineTo(8, 10); ctx.lineTo(11, 10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(30, 0); ctx.stroke();
        break;
      }
      case 'npn': {
        ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-8, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8, -18); ctx.lineTo(-8, 18); ctx.lineWidth = 3; ctx.stroke(); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-8, -8); ctx.lineTo(20, -30); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8, 8); ctx.lineTo(20, 30); ctx.stroke();
        // Arrow on emitter
        ctx.beginPath(); ctx.moveTo(14, 22); ctx.lineTo(20, 30); ctx.lineTo(10, 28); ctx.fill();
        break;
      }
      case 'pnp': {
        ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-8, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8, -18); ctx.lineTo(-8, 18); ctx.lineWidth = 3; ctx.stroke(); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-8, -8); ctx.lineTo(20, -30); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8, 8); ctx.lineTo(20, 30); ctx.stroke();
        // Arrow on base toward emitter
        ctx.beginPath(); ctx.moveTo(-2, 4); ctx.lineTo(-8, 8); ctx.lineTo(-4, 14); ctx.fill();
        break;
      }
      case 'mosfetN': {
        ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-12, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-12, -16); ctx.lineTo(-12, 16); ctx.lineWidth = 3; ctx.stroke(); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-8, -14); ctx.lineTo(-8, -6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8, -3); ctx.lineTo(-8, 3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8, 6); ctx.lineTo(-8, 14); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8, -10); ctx.lineTo(20, -10); ctx.lineTo(20, -30); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(20, 0); ctx.lineTo(20, 30); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8, 10); ctx.lineTo(20, 10); ctx.lineTo(20, 30); ctx.stroke();
        // Arrow
        ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(4, -4); ctx.lineTo(4, 4); ctx.fill();
        break;
      }
      case 'mosfetP': {
        ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-12, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-12, -16); ctx.lineTo(-12, 16); ctx.lineWidth = 3; ctx.stroke(); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-8, -14); ctx.lineTo(-8, -6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8, -3); ctx.lineTo(-8, 3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8, 6); ctx.lineTo(-8, 14); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8, -10); ctx.lineTo(20, -10); ctx.lineTo(20, -30); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(20, 0); ctx.lineTo(20, 30); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8, 10); ctx.lineTo(20, 10); ctx.lineTo(20, 30); ctx.stroke();
        // Arrow reversed
        ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-4, -4); ctx.lineTo(-4, 4); ctx.fill();
        break;
      }
      case 'opamp': {
        ctx.beginPath();
        ctx.moveTo(-30, -30); ctx.lineTo(-30, 30); ctx.lineTo(30, 0); ctx.closePath();
        ctx.stroke();
        // + and - labels
        ctx.font = '14px monospace';
        ctx.fillText('+', -22, 18);
        ctx.fillText('−', -22, -12);
        // Pin leads
        ctx.beginPath(); ctx.moveTo(-40, -15); ctx.lineTo(-30, -15); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-40, 15); ctx.lineTo(-30, 15); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(40, 0); ctx.stroke();
        // Power pins
        ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(0, -30); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 16); ctx.lineTo(0, 30); ctx.stroke();
        break;
      }
      case 'ic': {
        ctx.strokeRect(-30, -30, 60, 60);
        ctx.font = '9px monospace';
        ctx.fillText('IC', 0, 0);
        // Pins: left 3, right 3
        ctx.beginPath(); ctx.moveTo(-40, -20); ctx.lineTo(-30, -20); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(-30, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-40, 20); ctx.lineTo(-30, 20); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(30, -20); ctx.lineTo(40, -20); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(40, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(30, 20); ctx.lineTo(40, 20); ctx.stroke();
        // Notch
        ctx.beginPath(); ctx.arc(0, -30, 5, 0, Math.PI, false); ctx.stroke();
        break;
      }
      case 'battery': {
        ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(0, -8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-12, -8); ctx.lineTo(12, -8); ctx.lineWidth = 3; ctx.stroke(); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-6, -2); ctx.lineTo(6, -2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-12, 4); ctx.lineTo(12, 4); ctx.lineWidth = 3; ctx.stroke(); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-6, 10); ctx.lineTo(6, 10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(0, 30); ctx.stroke();
        ctx.font = '9px monospace';
        ctx.fillText('+', 16, -6);
        ctx.fillText('−', 16, 12);
        break;
      }
      case 'gnd': {
        ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(0, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(12, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8, 5); ctx.lineTo(8, 5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-4, 10); ctx.lineTo(4, 10); ctx.stroke();
        break;
      }
      case 'vcc': {
        ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(0, 4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8, 4); ctx.lineTo(0, -6); ctx.lineTo(8, 4); ctx.closePath(); ctx.stroke();
        ctx.font = '9px monospace';
        ctx.fillText('VCC', 0, -14);
        break;
      }
      case 'switchComp': {
        ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-10, 0); ctx.stroke();
        ctx.beginPath(); ctx.arc(-10, 0, 3, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(10, 0, 3, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(7, -10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(30, 0); ctx.stroke();
        break;
      }
      case 'fuse': {
        ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-15, 0); ctx.stroke();
        ctx.strokeRect(-15, -6, 30, 12);
        ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(12, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(15, 0); ctx.lineTo(30, 0); ctx.stroke();
        break;
      }
      case 'crystal': {
        ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(-8, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8, -8); ctx.lineTo(-8, 8); ctx.stroke();
        ctx.strokeRect(-5, -10, 10, 20);
        ctx.beginPath(); ctx.moveTo(8, -8); ctx.lineTo(8, 8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(20, 0); ctx.stroke();
        break;
      }
      case 'transformer': {
        // Primary (left)
        ctx.beginPath(); ctx.moveTo(-30, -20); ctx.lineTo(-18, -20); ctx.stroke();
        for (var i = 0; i < 3; i++) ctx.beginPath(), ctx.arc(-18, -12 + i * 12, 6, -Math.PI/2, Math.PI/2, false), ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-18, 20); ctx.lineTo(-30, 20); ctx.stroke();
        // Core
        ctx.beginPath(); ctx.moveTo(-4, -22); ctx.lineTo(-4, 22); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(4, -22); ctx.lineTo(4, 22); ctx.stroke();
        // Secondary (right)
        ctx.beginPath(); ctx.moveTo(30, -20); ctx.lineTo(18, -20); ctx.stroke();
        for (var i = 0; i < 3; i++) ctx.beginPath(), ctx.arc(18, -12 + i * 12, 6, Math.PI/2, -Math.PI/2, false), ctx.stroke();
        ctx.beginPath(); ctx.moveTo(18, 20); ctx.lineTo(30, 20); ctx.stroke();
        break;
      }
      case 'relay': {
        // Coil (left)
        ctx.beginPath(); ctx.moveTo(-30, -20); ctx.lineTo(-18, -20); ctx.stroke();
        for (var i = 0; i < 3; i++) ctx.beginPath(), ctx.arc(-18, -12 + i * 8, 4, -Math.PI/2, Math.PI/2, false), ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-18, 14); ctx.lineTo(-30, 14); ctx.lineTo(-30, 20); ctx.stroke();
        // Switch (right)
        ctx.beginPath(); ctx.arc(20, 6, 3, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(20, 3); ctx.lineTo(30, -12); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(40, 0); ctx.stroke();
        // Dashed link
        ctx.setLineDash([2, 2]);
        ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(16, 0); ctx.stroke();
        ctx.setLineDash([]);
        break;
      }
      case 'speaker': {
        ctx.strokeRect(-10, -8, 10, 16);
        ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(12, -16); ctx.lineTo(12, 16); ctx.lineTo(0, 8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-20, -4); ctx.lineTo(-10, -4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-20, 4); ctx.lineTo(-10, 4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-20, -4); ctx.lineTo(-20, 0); ctx.lineTo(-20, 4); ctx.stroke();
        break;
      }
      case 'microphone': {
        ctx.beginPath(); ctx.arc(0, -4, 10, Math.PI, 0, false); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-10, -4); ctx.lineTo(-10, 6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(10, -4); ctx.lineTo(10, 6); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 6, 10, 0, Math.PI, false); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 16); ctx.lineTo(0, 22); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-6, 22); ctx.lineTo(6, 22); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(-10, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(20, 0); ctx.stroke();
        break;
      }
      case 'motor': {
        ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.stroke();
        ctx.font = '13px monospace'; ctx.fillText('M', 0, 1);
        ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-16, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(30, 0); ctx.stroke();
        break;
      }
    }
    ctx.restore();
  }

  /* ── Pin position after rotation ── */
  function rotatePoint(px, py, angle) {
    var rad = angle * Math.PI / 180;
    return {
      x: Math.round(px * Math.cos(rad) - py * Math.sin(rad)),
      y: Math.round(px * Math.sin(rad) + py * Math.cos(rad))
    };
  }

  function getAbsolutePins(comp) {
    var def = COMPONENT_DEFS[comp.type];
    if (!def) return [];
    return def.pins.map(function(p) {
      var rp = rotatePoint(p.x, p.y, comp.rotation || 0);
      return { x: comp.x + rp.x, y: comp.y + rp.y };
    });
  }

  return {
    setup() {
      var locale = ref(getLocale());
      function t(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

      /* ── State ── */
      var canvasEl = ref(null);
      var canvasWrap = ref(null);
      var activeTool = ref('select');
      var selectedId = ref(null);
      var showGridOpt = ref(true);
      var snapGrid = ref(true);
      var compCat = ref('catPassive');
      var circuitName = ref('');

      var components = ref([]);
      var wires = ref([]);
      var undoStack = ref([]);
      var redoStack = ref([]);

      /* ── Zoom / Pan ── */
      var zoom = ref(1);
      var panX = ref(0);
      var panY = ref(0);
      var isPanning = ref(false);
      var panStartX = 0, panStartY = 0, panOriginX = 0, panOriginY = 0;

      /* ── Wire drawing ── */
      var wireStart = ref(null);
      var wirePreview = ref(null);

      /* ── Drag ── */
      var isDragging = ref(false);
      var dragOffsetX = 0, dragOffsetY = 0;

      var nextId = 1;

      /* ── Canvas context ── */
      var ctx = null;
      var canvasW = 4000;
      var canvasH = 3000;

      function snap(v) { return snapGrid.value ? Math.round(v / GRID) * GRID : v; }

      function screenToWorld(sx, sy) {
        var rect = canvasEl.value.getBoundingClientRect();
        return {
          x: (sx - rect.left) / zoom.value - panX.value,
          y: (sy - rect.top) / zoom.value - panY.value
        };
      }

      /* ── Undo / Redo ── */
      function saveState() {
        undoStack.value.push(JSON.stringify({ components: components.value, wires: wires.value }));
        if (undoStack.value.length > 50) undoStack.value.shift();
        redoStack.value = [];
      }

      function undo() {
        if (!undoStack.value.length) return;
        redoStack.value.push(JSON.stringify({ components: components.value, wires: wires.value }));
        var prev = JSON.parse(undoStack.value.pop());
        components.value = prev.components;
        wires.value = prev.wires;
        selectedId.value = null;
        render();
      }

      function redo() {
        if (!redoStack.value.length) return;
        undoStack.value.push(JSON.stringify({ components: components.value, wires: wires.value }));
        var next = JSON.parse(redoStack.value.pop());
        components.value = next.components;
        wires.value = next.wires;
        selectedId.value = null;
        render();
      }

      /* ── Component CRUD ── */
      function addComponent(type) {
        var def = COMPONENT_DEFS[type];
        if (!def) return;
        saveState();
        var comp = {
          id: nextId++,
          type: type,
          x: snap(canvasW / 2 - panX.value),
          y: snap(canvasH / 2 - panY.value),
          rotation: 0,
          name: def.symbol + nextId,
          value: def.defaultValue
        };
        components.value.push(comp);
        selectedId.value = comp.id;
        activeTool.value = 'select';
        render();
      }

      function deleteSelected() {
        if (!selectedId.value) return;
        saveState();
        // Remove wires connected to this component
        var comp = components.value.find(function(c) { return c.id === selectedId.value; });
        if (comp) {
          var absPins = getAbsolutePins(comp);
          wires.value = wires.value.filter(function(w) {
            return !absPins.some(function(p) {
              return (Math.abs(p.x - w.x1) < 10 && Math.abs(p.y - w.y1) < 10) ||
                     (Math.abs(p.x - w.x2) < 10 && Math.abs(p.y - w.y2) < 10);
            });
          });
        }
        components.value = components.value.filter(function(c) { return c.id !== selectedId.value; });
        selectedId.value = null;
        render();
      }

      function rotateSelected() {
        if (!selectedId.value) return;
        saveState();
        var comp = components.value.find(function(c) { return c.id === selectedId.value; });
        if (comp) {
          comp.rotation = (comp.rotation + 90) % 360;
          render();
        }
      }

      /* ── Render ── */
      function render() {
        if (!ctx) return;
        var c = canvasEl.value;
        ctx.clearRect(0, 0, c.width, c.height);

        ctx.save();
        ctx.scale(zoom.value, zoom.value);
        ctx.translate(panX.value, panY.value);

        // Background
        ctx.fillStyle = '#0d1117';
        ctx.fillRect(-panX.value, -panY.value, c.width / zoom.value, c.height / zoom.value);

        // Grid
        if (showGridOpt.value) {
          ctx.strokeStyle = 'rgba(48, 54, 68, 0.6)';
          ctx.lineWidth = 0.5;
          var startX = Math.floor(-panX.value / GRID) * GRID;
          var startY = Math.floor(-panY.value / GRID) * GRID;
          var endX = startX + c.width / zoom.value + GRID;
          var endY = startY + c.height / zoom.value + GRID;
          for (var gx = startX; gx < endX; gx += GRID) {
            ctx.beginPath(); ctx.moveTo(gx, startY); ctx.lineTo(gx, endY); ctx.stroke();
          }
          for (var gy = startY; gy < endY; gy += GRID) {
            ctx.beginPath(); ctx.moveTo(startX, gy); ctx.lineTo(endX, gy); ctx.stroke();
          }
        }

        // Wires
        ctx.strokeStyle = '#55efc4';
        ctx.lineWidth = 2;
        wires.value.forEach(function(w) {
          ctx.beginPath();
          ctx.moveTo(w.x1, w.y1);
          if (w.midX !== undefined) {
            ctx.lineTo(w.midX, w.y1);
            ctx.lineTo(w.midX, w.y2);
          }
          ctx.lineTo(w.x2, w.y2);
          ctx.stroke();
          // Junction dots
          ctx.fillStyle = '#55efc4';
          ctx.beginPath(); ctx.arc(w.x1, w.y1, 3, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(w.x2, w.y2, 3, 0, Math.PI * 2); ctx.fill();
        });

        // Wire preview
        if (wireStart.value && wirePreview.value) {
          ctx.strokeStyle = 'rgba(116, 185, 255, 0.7)';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 3]);
          ctx.beginPath();
          ctx.moveTo(wireStart.value.x, wireStart.value.y);
          var midX = wirePreview.value.x;
          ctx.lineTo(midX, wireStart.value.y);
          ctx.lineTo(midX, wirePreview.value.y);
          ctx.lineTo(wirePreview.value.x, wirePreview.value.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Components
        components.value.forEach(function(comp) {
          drawSymbol(ctx, comp.type, comp.x, comp.y, comp.rotation);

          // Label
          ctx.save();
          ctx.fillStyle = '#74b9ff';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(comp.name, comp.x, comp.y - 28);
          if (comp.value) {
            ctx.fillStyle = '#dfe6e9';
            ctx.font = '9px monospace';
            ctx.fillText(comp.value, comp.x, comp.y + 32);
          }
          ctx.restore();

          // Pins (small circles)
          var absPins = getAbsolutePins(comp);
          absPins.forEach(function(p) {
            ctx.fillStyle = '#fd79a8';
            ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
          });

          // Selection highlight
          if (comp.id === selectedId.value) {
            ctx.strokeStyle = '#ffeaa7';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 3]);
            ctx.strokeRect(comp.x - 46, comp.y - 36, 92, 72);
            ctx.setLineDash([]);
          }
        });

        ctx.restore();
      }

      /* ── Hit testing ── */
      function hitTestComponent(wx, wy) {
        for (var i = components.value.length - 1; i >= 0; i--) {
          var c = components.value[i];
          if (Math.abs(wx - c.x) < 44 && Math.abs(wy - c.y) < 34) return c;
        }
        return null;
      }

      function hitTestPin(wx, wy) {
        for (var i = 0; i < components.value.length; i++) {
          var absPins = getAbsolutePins(components.value[i]);
          for (var j = 0; j < absPins.length; j++) {
            if (Math.abs(wx - absPins[j].x) < 10 && Math.abs(wy - absPins[j].y) < 10) {
              return { x: absPins[j].x, y: absPins[j].y };
            }
          }
        }
        return null;
      }

      function hitTestWire(wx, wy) {
        for (var i = 0; i < wires.value.length; i++) {
          var w = wires.value[i];
          if (distToSegment(wx, wy, w.x1, w.y1, w.x2, w.y2) < 8) return i;
          if (w.midX !== undefined) {
            if (distToSegment(wx, wy, w.x1, w.y1, w.midX, w.y1) < 8) return i;
            if (distToSegment(wx, wy, w.midX, w.y1, w.midX, w.y2) < 8) return i;
            if (distToSegment(wx, wy, w.midX, w.y2, w.x2, w.y2) < 8) return i;
          }
        }
        return -1;
      }

      function distToSegment(px, py, x1, y1, x2, y2) {
        var dx = x2 - x1, dy = y2 - y1;
        var lenSq = dx * dx + dy * dy;
        if (lenSq === 0) return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
        var t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
        var projX = x1 + t * dx, projY = y1 + t * dy;
        return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
      }

      /* ── Mouse events ── */
      function onMouseDown(e) {
        if (e.button === 1 || (e.button === 0 && e.altKey)) {
          isPanning.value = true;
          panStartX = e.clientX; panStartY = e.clientY;
          panOriginX = panX.value; panOriginY = panY.value;
          e.preventDefault();
          return;
        }
        if (e.button !== 0) return;

        var pos = screenToWorld(e.clientX, e.clientY);
        var wx = snap(pos.x), wy = snap(pos.y);

        if (activeTool.value === 'select') {
          var hit = hitTestComponent(pos.x, pos.y);
          if (hit) {
            selectedId.value = hit.id;
            isDragging.value = true;
            dragOffsetX = hit.x - pos.x;
            dragOffsetY = hit.y - pos.y;
            render();
          } else {
            // Check wire click
            var wi = hitTestWire(pos.x, pos.y);
            if (wi >= 0) {
              selectedId.value = null;
              render();
            } else {
              selectedId.value = null;
              render();
            }
          }
        } else if (activeTool.value === 'wire') {
          var pin = hitTestPin(pos.x, pos.y);
          if (wireStart.value) {
            // Finish wire
            var endPt = pin || { x: wx, y: wy };
            if (endPt.x !== wireStart.value.x || endPt.y !== wireStart.value.y) {
              saveState();
              var midX = endPt.x;
              wires.value.push({
                x1: wireStart.value.x, y1: wireStart.value.y,
                x2: endPt.x, y2: endPt.y,
                midX: midX
              });
            }
            wireStart.value = null;
            wirePreview.value = null;
            render();
          } else {
            wireStart.value = pin || { x: wx, y: wy };
          }
        } else if (activeTool.value === 'delete') {
          var hit = hitTestComponent(pos.x, pos.y);
          if (hit) {
            selectedId.value = hit.id;
            deleteSelected();
          } else {
            var wi = hitTestWire(pos.x, pos.y);
            if (wi >= 0) {
              saveState();
              wires.value.splice(wi, 1);
              render();
            }
          }
        }
      }

      function onMouseMove(e) {
        if (isPanning.value) {
          panX.value = panOriginX + (e.clientX - panStartX) / zoom.value;
          panY.value = panOriginY + (e.clientY - panStartY) / zoom.value;
          render();
          return;
        }
        if (isDragging.value && selectedId.value) {
          var pos = screenToWorld(e.clientX, e.clientY);
          var comp = components.value.find(function(c) { return c.id === selectedId.value; });
          if (comp) {
            comp.x = snap(pos.x + dragOffsetX);
            comp.y = snap(pos.y + dragOffsetY);
            render();
          }
          return;
        }
        if (activeTool.value === 'wire' && wireStart.value) {
          var pos = screenToWorld(e.clientX, e.clientY);
          wirePreview.value = { x: snap(pos.x), y: snap(pos.y) };
          render();
        }
      }

      function onMouseUp(e) {
        if (isPanning.value) {
          isPanning.value = false;
          return;
        }
        if (isDragging.value) {
          isDragging.value = false;
        }
      }

      function onWheel(e) {
        e.preventDefault();
        var delta = e.deltaY > 0 ? -0.1 : 0.1;
        var newZoom = Math.max(0.2, Math.min(5, zoom.value + delta));
        // Zoom toward cursor
        var rect = canvasEl.value.getBoundingClientRect();
        var mx = e.clientX - rect.left, my = e.clientY - rect.top;
        var wx = mx / zoom.value - panX.value;
        var wy = my / zoom.value - panY.value;
        zoom.value = newZoom;
        panX.value = mx / newZoom - wx;
        panY.value = my / newZoom - wy;
        render();
      }

      function onKeyDown(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'Delete' || e.key === 'Backspace') { deleteSelected(); e.preventDefault(); }
        if (e.key === 'r' || e.key === 'R') { rotateSelected(); e.preventDefault(); }
        if (e.key === 'w' || e.key === 'W') { activeTool.value = 'wire'; e.preventDefault(); }
        if (e.key === 'Escape') {
          wireStart.value = null; wirePreview.value = null;
          activeTool.value = 'select';
          render();
        }
        if (e.ctrlKey && e.key === 'z') { undo(); e.preventDefault(); }
        if (e.ctrlKey && e.key === 'y') { redo(); e.preventDefault(); }
      }

      /* ── Zoom controls ── */
      function zoomIn() { zoom.value = Math.min(5, zoom.value + 0.2); render(); }
      function zoomOut() { zoom.value = Math.max(0.2, zoom.value - 0.2); render(); }
      function zoomFit() {
        zoom.value = 1; panX.value = 50; panY.value = 50;
        if (components.value.length) {
          var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          components.value.forEach(function(c) {
            if (c.x < minX) minX = c.x; if (c.y < minY) minY = c.y;
            if (c.x > maxX) maxX = c.x; if (c.y > maxY) maxY = c.y;
          });
          var cw = canvasEl.value ? canvasEl.value.width : 800;
          var ch = canvasEl.value ? canvasEl.value.height : 600;
          var w = maxX - minX + 200;
          var h = maxY - minY + 200;
          zoom.value = Math.min(cw / w, ch / h, 2);
          panX.value = (cw / zoom.value - w) / 2 - minX + 100;
          panY.value = (ch / zoom.value - h) / 2 - minY + 100;
        }
        render();
      }

      /* ── Save / Load / Export ── */
      function getToken() { return localStorage.getItem('auth_token'); }

      async function saveCircuit() {
        var data = {
          name: circuitName.value || t('unnamed'),
          components: components.value,
          wires: wires.value,
          nextId: nextId,
          savedAt: new Date().toISOString()
        };
        try {
          var res = await fetch('/api/fs/write', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() },
            body: JSON.stringify({
              path: '/circuits/' + (circuitName.value || 'circuit') + '.json',
              content: JSON.stringify(data, null, 2)
            })
          });
          if (res.ok && window.ElementPlus) window.ElementPlus.ElMessage.success(t('saved'));
        } catch (e) {
          if (window.ElementPlus) window.ElementPlus.ElMessage.error(e.message);
        }
      }

      async function loadCircuit() {
        try {
          // List circuit files
          var listRes = await fetch('/api/fs/list?path=' + encodeURIComponent('/circuits'), {
            headers: { Authorization: 'Bearer ' + getToken() }
          });
          if (!listRes.ok) return;
          var files = await listRes.json();
          var jsonFiles = files.filter(function(f) { return f.name.endsWith('.json'); });
          if (!jsonFiles.length) return;

          // Load the most recent one (or first)
          var fname = jsonFiles[jsonFiles.length - 1].name;
          var readRes = await fetch('/api/fs/read?path=' + encodeURIComponent('/circuits/' + fname), {
            headers: { Authorization: 'Bearer ' + getToken() }
          });
          if (!readRes.ok) return;
          var data = await readRes.json();
          saveState();
          components.value = data.components || [];
          wires.value = data.wires || [];
          nextId = data.nextId || components.value.length + 1;
          circuitName.value = data.name || '';
          selectedId.value = null;
          zoomFit();
          if (window.ElementPlus) window.ElementPlus.ElMessage.success(t('loaded'));
        } catch (e) {
          if (window.ElementPlus) window.ElementPlus.ElMessage.error(e.message);
        }
      }

      function exportPng() {
        if (!canvasEl.value) return;
        // Render a clean export canvas
        var expCanvas = document.createElement('canvas');
        if (!components.value.length) return;
        var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        components.value.forEach(function(c) {
          if (c.x - 60 < minX) minX = c.x - 60;
          if (c.y - 50 < minY) minY = c.y - 50;
          if (c.x + 60 > maxX) maxX = c.x + 60;
          if (c.y + 50 > maxY) maxY = c.y + 50;
        });
        wires.value.forEach(function(w) {
          if (w.x1 < minX) minX = w.x1 - 10; if (w.x2 < minX) minX = w.x2 - 10;
          if (w.y1 < minY) minY = w.y1 - 10; if (w.y2 < minY) minY = w.y2 - 10;
          if (w.x1 > maxX) maxX = w.x1 + 10; if (w.x2 > maxX) maxX = w.x2 + 10;
          if (w.y1 > maxY) maxY = w.y1 + 10; if (w.y2 > maxY) maxY = w.y2 + 10;
        });

        var pad = 40;
        expCanvas.width = (maxX - minX + pad * 2) * 2;
        expCanvas.height = (maxY - minY + pad * 2) * 2;
        var ectx = expCanvas.getContext('2d');
        ectx.scale(2, 2);
        ectx.fillStyle = '#0d1117';
        ectx.fillRect(0, 0, expCanvas.width, expCanvas.height);
        ectx.translate(-minX + pad, -minY + pad);

        // Draw wires
        ectx.strokeStyle = '#55efc4';
        ectx.lineWidth = 2;
        wires.value.forEach(function(w) {
          ectx.beginPath();
          ectx.moveTo(w.x1, w.y1);
          if (w.midX !== undefined) {
            ectx.lineTo(w.midX, w.y1);
            ectx.lineTo(w.midX, w.y2);
          }
          ectx.lineTo(w.x2, w.y2);
          ectx.stroke();
          ectx.fillStyle = '#55efc4';
          ectx.beginPath(); ectx.arc(w.x1, w.y1, 3, 0, Math.PI * 2); ectx.fill();
          ectx.beginPath(); ectx.arc(w.x2, w.y2, 3, 0, Math.PI * 2); ectx.fill();
        });

        // Draw components
        components.value.forEach(function(comp) {
          drawSymbol(ectx, comp.type, comp.x, comp.y, comp.rotation);
          ectx.fillStyle = '#74b9ff';
          ectx.font = '10px monospace';
          ectx.textAlign = 'center';
          ectx.fillText(comp.name, comp.x, comp.y - 28);
          if (comp.value) {
            ectx.fillStyle = '#dfe6e9';
            ectx.font = '9px monospace';
            ectx.fillText(comp.value, comp.x, comp.y + 32);
          }
          var absPins = getAbsolutePins(comp);
          absPins.forEach(function(p) {
            ectx.fillStyle = '#fd79a8';
            ectx.beginPath(); ectx.arc(p.x, p.y, 3, 0, Math.PI * 2); ectx.fill();
          });
        });

        var link = document.createElement('a');
        link.download = (circuitName.value || 'circuit') + '.png';
        link.href = expCanvas.toDataURL('image/png');
        link.click();
      }

      function newCircuit() {
        saveState();
        components.value = [];
        wires.value = [];
        selectedId.value = null;
        circuitName.value = '';
        nextId = 1;
        panX.value = 50; panY.value = 50; zoom.value = 1;
        render();
      }

      /* ── Netlist generation ── */
      function generateNetlist() {
        var nets = [];
        var netId = 0;
        var pinNets = {}; // "compId:pinIdx" → netId

        // Assign net IDs via wires (pins that are connected share a net)
        wires.value.forEach(function(w) {
          var p1 = findPinAt(w.x1, w.y1);
          var p2 = findPinAt(w.x2, w.y2);
          var net1 = p1 ? pinNets[p1.key] : undefined;
          var net2 = p2 ? pinNets[p2.key] : undefined;

          var nid;
          if (net1 !== undefined && net2 !== undefined) {
            nid = Math.min(net1, net2);
            var old = Math.max(net1, net2);
            Object.keys(pinNets).forEach(function(k) { if (pinNets[k] === old) pinNets[k] = nid; });
          } else if (net1 !== undefined) nid = net1;
          else if (net2 !== undefined) nid = net2;
          else nid = netId++;

          if (p1) pinNets[p1.key] = nid;
          if (p2) pinNets[p2.key] = nid;
        });

        var lines = [];
        lines.push('* Netlist — ' + (circuitName.value || t('unnamed')));
        lines.push('* Generated: ' + new Date().toISOString());
        lines.push('');
        components.value.forEach(function(comp) {
          var def = COMPONENT_DEFS[comp.type];
          if (!def) return;
          var pinLabels = def.pins.map(function(p, idx) {
            var key = comp.id + ':' + idx;
            return pinNets[key] !== undefined ? 'N' + pinNets[key] : '?';
          });
          lines.push(comp.name + ' ' + pinLabels.join(' ') + ' ' + (comp.value || comp.type));
        });
        lines.push('');
        lines.push('.end');
        return lines.join('\n');
      }

      function findPinAt(x, y) {
        for (var i = 0; i < components.value.length; i++) {
          var comp = components.value[i];
          var absPins = getAbsolutePins(comp);
          for (var j = 0; j < absPins.length; j++) {
            if (Math.abs(absPins[j].x - x) < 10 && Math.abs(absPins[j].y - y) < 10) {
              return { key: comp.id + ':' + j, comp: comp, pinIdx: j };
            }
          }
        }
        return null;
      }

      function copyNetlist() {
        var text = generateNetlist();
        navigator.clipboard.writeText(text).then(function() {
          if (window.ElementPlus) window.ElementPlus.ElMessage.success(t('copied'));
        });
      }

      /* ── Selected component ── */
      var selectedComp = computed(function() {
        return components.value.find(function(c) { return c.id === selectedId.value; }) || null;
      });

      function updateSelectedProp(prop, val) {
        if (!selectedComp.value) return;
        selectedComp.value[prop] = val;
        render();
      }

      /* ── Computed ── */
      var compCats = computed(function() {
        return CATEGORIES.map(function(c) { return { id: c, label: t(c) }; });
      });

      var categoryComponents = computed(function() {
        return Object.keys(COMPONENT_DEFS)
          .filter(function(k) { return COMPONENT_DEFS[k].cat === compCat.value; })
          .map(function(k) { return { id: k, label: t(k), symbol: COMPONENT_DEFS[k].symbol }; });
      });

      var stats = computed(function() {
        return {
          components: components.value.length,
          wires: wires.value.length
        };
      });

      /* ── Resize observer ── */
      var resizeObs = null;
      function resizeCanvas() {
        if (!canvasEl.value || !canvasWrap.value) return;
        canvasEl.value.width = canvasWrap.value.clientWidth;
        canvasEl.value.height = canvasWrap.value.clientHeight;
        render();
      }

      /* ── Lifecycle ── */
      onMounted(function() {
        nextTick(function() {
          if (canvasEl.value) {
            ctx = canvasEl.value.getContext('2d');
            resizeCanvas();
          }
          if (canvasWrap.value) {
            resizeObs = new ResizeObserver(resizeCanvas);
            resizeObs.observe(canvasWrap.value);
          }
        });
        window.addEventListener('locale-changed', onLocaleChanged);
        window.addEventListener('keydown', onKeyDown);
      });

      onUnmounted(function() {
        window.removeEventListener('locale-changed', onLocaleChanged);
        if (resizeObs) resizeObs.disconnect();
        window.removeEventListener('keydown', onKeyDown);
      });

      return {
        t, canvasEl, canvasWrap, activeTool, selectedId, selectedComp,
        showGridOpt, snapGrid, compCat, circuitName, components, wires,
        zoom, panX, panY, stats,
        compCats, categoryComponents,
        addComponent, deleteSelected, rotateSelected,
        onMouseDown, onMouseMove, onMouseUp, onWheel,
        zoomIn, zoomOut, zoomFit, undo, redo,
        newCircuit, saveCircuit, loadCircuit, exportPng,
        generateNetlist, copyNetlist,
        updateSelectedProp
      };
    }
  };
})(Vue)
