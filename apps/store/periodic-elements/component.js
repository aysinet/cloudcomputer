(function(Vue) {
  const { ref, computed } = Vue;

  const CATS = {
    nm: { color:'#5b9bd5', name:{tr:'Ametal',en:'Nonmetal',de:'Nichtmetall',fr:'Non-métal',es:'No metal',ru:'Неметалл',zh:'非金属',ja:'非金属',it:'Non metallo',ar:'لا فلز',ko:'비금속',hi:'अधातु',pt:'Não metal'} },
    ng: { color:'#9b59b6', name:{tr:'Soy Gaz',en:'Noble Gas',de:'Edelgas',fr:'Gaz noble',es:'Gas noble',ru:'Благородный газ',zh:'稀有气体',ja:'貴ガス',it:'Gas nobile',ar:'غاز نبيل',ko:'비활성 기체',hi:'उत्कृष्ट गैस',pt:'Gás nobre'} },
    am: { color:'#e74c3c', name:{tr:'Alkali Metal',en:'Alkali Metal',de:'Alkalimetall',fr:'Métal alcalin',es:'Metal alcalino',ru:'Щелочной металл',zh:'碱金属',ja:'アルカリ金属',it:'Metallo alcalino',ar:'فلز قلوي',ko:'알칼리 금속',hi:'क्षार धातु',pt:'Metal alcalino'} },
    ae: { color:'#f39c12', name:{tr:'Toprak Alkali',en:'Alkaline Earth',de:'Erdalkalimetall',fr:'Alcalino-terreux',es:'Alcalinotérreo',ru:'Щёлочноземельный',zh:'碱土金属',ja:'アルカリ土類',it:'Alcalino terroso',ar:'فلز قلوي ترابي',ko:'알칼리 토금속',hi:'क्षारीय मृदा',pt:'Alcalino-terroso'} },
    tm: { color:'#3498db', name:{tr:'Geçiş Metali',en:'Transition Metal',de:'Übergangsmetall',fr:'Métal de transition',es:'Metal de transición',ru:'Переходный металл',zh:'过渡金属',ja:'遷移金属',it:'Metallo di transizione',ar:'فلز انتقالي',ko:'전이 금속',hi:'संक्रमण धातु',pt:'Metal de transição'} },
    pt: { color:'#1abc9c', name:{tr:'Geçiş Sonrası',en:'Post-transition',de:'Nachübergangsmetall',fr:'Post-transition',es:'Post-transición',ru:'Постпереходный',zh:'后过渡金属',ja:'卑金属',it:'Post-transizione',ar:'ما بعد الانتقال',ko:'전이후 금속',hi:'संक्रमणोत्तर',pt:'Pós-transição'} },
    ml: { color:'#2ecc71', name:{tr:'Yarı Metal',en:'Metalloid',de:'Halbmetall',fr:'Métalloïde',es:'Metaloide',ru:'Металлоид',zh:'准金属',ja:'半金属',it:'Metalloide',ar:'شبه فلز',ko:'준금속',hi:'उपधातु',pt:'Metaloide'} },
    ha: { color:'#8e44ad', name:{tr:'Halojen',en:'Halogen',de:'Halogen',fr:'Halogène',es:'Halógeno',ru:'Галоген',zh:'卤素',ja:'ハロゲン',it:'Alogeno',ar:'هالوجين',ko:'할로겐',hi:'हैलोजन',pt:'Halogênio'} },
    la: { color:'#fd79a8', name:{tr:'Lantanit',en:'Lanthanide',de:'Lanthanoid',fr:'Lanthanide',es:'Lantánido',ru:'Лантаноид',zh:'镧系',ja:'ランタノイド',it:'Lantanide',ar:'لانثانيد',ko:'란타넘족',hi:'लैंथेनाइड',pt:'Lantanídeo'} },
    ac: { color:'#e17055', name:{tr:'Aktinit',en:'Actinide',de:'Actinoid',fr:'Actinide',es:'Actínido',ru:'Актиноид',zh:'锕系',ja:'アクチノイド',it:'Attinide',ar:'أكتينيد',ko:'악티늄족',hi:'एक्टिनाइड',pt:'Actinídeo'} },
    uk: { color:'#636e72', name:{tr:'Bilinmeyen',en:'Unknown',de:'Unbekannt',fr:'Inconnu',es:'Desconocido',ru:'Неизвестный',zh:'未知',ja:'未知',it:'Sconosciuto',ar:'مجهول',ko:'미지',hi:'अज्ञात',pt:'Desconhecido'} }
  };

  const ELEMENT_NAMES = {
    tr: {
      H:'Hidrojen',He:'Helyum',Li:'Lityum',Be:'Berilyum',B:'Bor',C:'Karbon',N:'Azot',O:'Oksijen',
      F:'Flüor',Ne:'Neon',Na:'Sodyum',Mg:'Magnezyum',Al:'Alüminyum',Si:'Silisyum',P:'Fosfor',
      S:'Kükürt',Cl:'Klor',Ar:'Argon',K:'Potasyum',Ca:'Kalsiyum',Sc:'Skandiyum',Ti:'Titanyum',
      V:'Vanadyum',Cr:'Krom',Mn:'Manganez',Fe:'Demir',Co:'Kobalt',Ni:'Nikel',Cu:'Bakır',Zn:'Çinko',
      Ga:'Galyum',Ge:'Germanyum',As:'Arsenik',Se:'Selenyum',Br:'Brom',Kr:'Kripton',Rb:'Rubidyum',
      Sr:'Stronsiyum',Y:'İtriyum',Zr:'Zirkonyum',Nb:'Niyobyum',Mo:'Molibden',Tc:'Teknesyum',
      Ru:'Rutenyum',Rh:'Rodyum',Pd:'Paladyum',Ag:'Gümüş',Cd:'Kadmiyum',In:'İndiyum',Sn:'Kalay',
      Sb:'Antimon',Te:'Tellür',I:'İyot',Xe:'Ksenon',Cs:'Sezyum',Ba:'Baryum',La:'Lantan',Ce:'Seryum',
      Pr:'Praseodimyum',Nd:'Neodimyum',Pm:'Prometyum',Sm:'Samaryum',Eu:'Evropiyum',Gd:'Gadolinyum',
      Tb:'Terbiyum',Dy:'Disprosyum',Ho:'Holmiyum',Er:'Erbiyum',Tm:'Tulyum',Yb:'İterbiyum',
      Lu:'Lutesyum',Hf:'Hafniyum',Ta:'Tantal',W:'Tungsten',Re:'Renyum',Os:'Osmiyum',Ir:'İridyum',
      Pt:'Platin',Au:'Altın',Hg:'Cıva',Tl:'Talyum',Pb:'Kurşun',Bi:'Bizmut',Po:'Polonyum',
      At:'Astatin',Rn:'Radon',Fr:'Fransiyum',Ra:'Radyum',Ac:'Aktinyum',Th:'Toryum',Pa:'Protaktinyum',
      U:'Uranyum',Np:'Neptünyum',Pu:'Plütonyum',Am:'Amerikyum',Cm:'Küriyum',Bk:'Berkelyum',
      Cf:'Kaliforniyum',Es:'Aynştaynyum',Fm:'Fermiyum',Md:'Mendelevyum',No:'Nobelyum',
      Lr:'Lavrensiyum',Rf:'Rutherfordyum',Db:'Dubnyum',Sg:'Seaborgiyum',Bh:'Bohriyum',
      Hs:'Hassiyum',Mt:'Maytneriyum',Ds:'Darmstadtiyum',Rg:'Röntgenyum',Cn:'Kopernikyum',
      Nh:'Nihonyum',Fl:'Flerovyum',Mc:'Moskovyum',Lv:'Livermoryum',Ts:'Tennessin',Og:'Oganesson'
    },
    de: {
      H:'Wasserstoff',He:'Helium',Li:'Lithium',Be:'Beryllium',B:'Bor',C:'Kohlenstoff',N:'Stickstoff',O:'Sauerstoff',
      F:'Fluor',Ne:'Neon',Na:'Natrium',Mg:'Magnesium',Al:'Aluminium',Si:'Silicium',P:'Phosphor',
      S:'Schwefel',Cl:'Chlor',Ar:'Argon',K:'Kalium',Ca:'Calcium',Sc:'Scandium',Ti:'Titan',
      V:'Vanadium',Cr:'Chrom',Mn:'Mangan',Fe:'Eisen',Co:'Cobalt',Ni:'Nickel',Cu:'Kupfer',Zn:'Zink',
      Ga:'Gallium',Ge:'Germanium',As:'Arsen',Se:'Selen',Br:'Brom',Kr:'Krypton',Rb:'Rubidium',
      Sr:'Strontium',Y:'Yttrium',Zr:'Zirconium',Nb:'Niob',Mo:'Molybdän',Tc:'Technetium',
      Ru:'Ruthenium',Rh:'Rhodium',Pd:'Palladium',Ag:'Silber',Cd:'Cadmium',In:'Indium',Sn:'Zinn',
      Sb:'Antimon',Te:'Tellur',I:'Iod',Xe:'Xenon',Cs:'Cäsium',Ba:'Barium',La:'Lanthan',Ce:'Cer',
      Pr:'Praseodym',Nd:'Neodym',Pm:'Promethium',Sm:'Samarium',Eu:'Europium',Gd:'Gadolinium',
      Tb:'Terbium',Dy:'Dysprosium',Ho:'Holmium',Er:'Erbium',Tm:'Thulium',Yb:'Ytterbium',
      Lu:'Lutetium',Hf:'Hafnium',Ta:'Tantal',W:'Wolfram',Re:'Rhenium',Os:'Osmium',Ir:'Iridium',
      Pt:'Platin',Au:'Gold',Hg:'Quecksilber',Tl:'Thallium',Pb:'Blei',Bi:'Bismut',Po:'Polonium',
      At:'Astat',Rn:'Radon',Fr:'Francium',Ra:'Radium',Ac:'Actinium',Th:'Thorium',Pa:'Protactinium',
      U:'Uran',Np:'Neptunium',Pu:'Plutonium',Am:'Americium',Cm:'Curium',Bk:'Berkelium',
      Cf:'Californium',Es:'Einsteinium',Fm:'Fermium',Md:'Mendelevium',No:'Nobelium',
      Lr:'Lawrencium',Rf:'Rutherfordium',Db:'Dubnium',Sg:'Seaborgium',Bh:'Bohrium',
      Hs:'Hassium',Mt:'Meitnerium',Ds:'Darmstadtium',Rg:'Roentgenium',Cn:'Copernicium',
      Nh:'Nihonium',Fl:'Flerovium',Mc:'Moscovium',Lv:'Livermorium',Ts:'Tennessine',Og:'Oganesson'
    },
    fr: {
      H:'Hydrogène',He:'Hélium',Li:'Lithium',Be:'Béryllium',B:'Bore',C:'Carbone',N:'Azote',O:'Oxygène',
      F:'Fluor',Ne:'Néon',Na:'Sodium',Mg:'Magnésium',Al:'Aluminium',Si:'Silicium',P:'Phosphore',
      S:'Soufre',Cl:'Chlore',Ar:'Argon',K:'Potassium',Ca:'Calcium',Sc:'Scandium',Ti:'Titane',
      V:'Vanadium',Cr:'Chrome',Mn:'Manganèse',Fe:'Fer',Co:'Cobalt',Ni:'Nickel',Cu:'Cuivre',Zn:'Zinc',
      Ga:'Gallium',Ge:'Germanium',As:'Arsenic',Se:'Sélénium',Br:'Brome',Kr:'Krypton',Rb:'Rubidium',
      Sr:'Strontium',Y:'Yttrium',Zr:'Zirconium',Nb:'Niobium',Mo:'Molybdène',Tc:'Technétium',
      Ru:'Ruthénium',Rh:'Rhodium',Pd:'Palladium',Ag:'Argent',Cd:'Cadmium',In:'Indium',Sn:'Étain',
      Sb:'Antimoine',Te:'Tellure',I:'Iode',Xe:'Xénon',Cs:'Césium',Ba:'Baryum',La:'Lanthane',Ce:'Cérium',
      Pr:'Praséodyme',Nd:'Néodyme',Pm:'Prométhium',Sm:'Samarium',Eu:'Europium',Gd:'Gadolinium',
      Tb:'Terbium',Dy:'Dysprosium',Ho:'Holmium',Er:'Erbium',Tm:'Thulium',Yb:'Ytterbium',
      Lu:'Lutécium',Hf:'Hafnium',Ta:'Tantale',W:'Tungstène',Re:'Rhénium',Os:'Osmium',Ir:'Iridium',
      Pt:'Platine',Au:'Or',Hg:'Mercure',Tl:'Thallium',Pb:'Plomb',Bi:'Bismuth',Po:'Polonium',
      At:'Astate',Rn:'Radon',Fr:'Francium',Ra:'Radium',Ac:'Actinium',Th:'Thorium',Pa:'Protactinium',
      U:'Uranium',Np:'Neptunium',Pu:'Plutonium',Am:'Américium',Cm:'Curium',Bk:'Berkélium',
      Cf:'Californium',Es:'Einsteinium',Fm:'Fermium',Md:'Mendélévium',No:'Nobélium',
      Lr:'Lawrencium',Rf:'Rutherfordium',Db:'Dubnium',Sg:'Seaborgium',Bh:'Bohrium',
      Hs:'Hassium',Mt:'Meitnérium',Ds:'Darmstadtium',Rg:'Roentgenium',Cn:'Copernicium',
      Nh:'Nihonium',Fl:'Flérovium',Mc:'Moscovium',Lv:'Livermorium',Ts:'Tennesse',Og:'Oganesson'
    },
    es: {
      H:'Hidrógeno',He:'Helio',Li:'Litio',Be:'Berilio',B:'Boro',C:'Carbono',N:'Nitrógeno',O:'Oxígeno',
      F:'Flúor',Ne:'Neón',Na:'Sodio',Mg:'Magnesio',Al:'Aluminio',Si:'Silicio',P:'Fósforo',
      S:'Azufre',Cl:'Cloro',Ar:'Argón',K:'Potasio',Ca:'Calcio',Sc:'Escandio',Ti:'Titanio',
      V:'Vanadio',Cr:'Cromo',Mn:'Manganeso',Fe:'Hierro',Co:'Cobalto',Ni:'Níquel',Cu:'Cobre',Zn:'Zinc',
      Ga:'Galio',Ge:'Germanio',As:'Arsénico',Se:'Selenio',Br:'Bromo',Kr:'Kriptón',Rb:'Rubidio',
      Sr:'Estroncio',Y:'Itrio',Zr:'Circonio',Nb:'Niobio',Mo:'Molibdeno',Tc:'Tecnecio',
      Ru:'Rutenio',Rh:'Rodio',Pd:'Paladio',Ag:'Plata',Cd:'Cadmio',In:'Indio',Sn:'Estaño',
      Sb:'Antimonio',Te:'Telurio',I:'Yodo',Xe:'Xenón',Cs:'Cesio',Ba:'Bario',La:'Lantano',Ce:'Cerio',
      Pr:'Praseodimio',Nd:'Neodimio',Pm:'Prometio',Sm:'Samario',Eu:'Europio',Gd:'Gadolinio',
      Tb:'Terbio',Dy:'Disprosio',Ho:'Holmio',Er:'Erbio',Tm:'Tulio',Yb:'Iterbio',
      Lu:'Lutecio',Hf:'Hafnio',Ta:'Tántalo',W:'Wolframio',Re:'Renio',Os:'Osmio',Ir:'Iridio',
      Pt:'Platino',Au:'Oro',Hg:'Mercurio',Tl:'Talio',Pb:'Plomo',Bi:'Bismuto',Po:'Polonio',
      At:'Astato',Rn:'Radón',Fr:'Francio',Ra:'Radio',Ac:'Actinio',Th:'Torio',Pa:'Protactinio',
      U:'Uranio',Np:'Neptunio',Pu:'Plutonio',Am:'Americio',Cm:'Curio',Bk:'Berkelio',
      Cf:'Californio',Es:'Einstenio',Fm:'Fermio',Md:'Mendelevio',No:'Nobelio',
      Lr:'Lawrencio',Rf:'Rutherfordio',Db:'Dubnio',Sg:'Seaborgio',Bh:'Bohrio',
      Hs:'Hasio',Mt:'Meitnerio',Ds:'Darmstatio',Rg:'Roentgenio',Cn:'Copernicio',
      Nh:'Nihonio',Fl:'Flerovio',Mc:'Moscovio',Lv:'Livermorio',Ts:'Teneso',Og:'Oganesón'
    },
    ru: {
      H:'Водород',He:'Гелий',Li:'Литий',Be:'Бериллий',B:'Бор',C:'Углерод',N:'Азот',O:'Кислород',
      F:'Фтор',Ne:'Неон',Na:'Натрий',Mg:'Магний',Al:'Алюминий',Si:'Кремний',P:'Фосфор',
      S:'Сера',Cl:'Хлор',Ar:'Аргон',K:'Калий',Ca:'Кальций',Sc:'Скандий',Ti:'Титан',
      V:'Ванадий',Cr:'Хром',Mn:'Марганец',Fe:'Железо',Co:'Кобальт',Ni:'Никель',Cu:'Медь',Zn:'Цинк',
      Ga:'Галлий',Ge:'Германий',As:'Мышьяк',Se:'Селен',Br:'Бром',Kr:'Криптон',Rb:'Рубидий',
      Sr:'Стронций',Y:'Иттрий',Zr:'Цирконий',Nb:'Ниобий',Mo:'Молибден',Tc:'Технеций',
      Ru:'Рутений',Rh:'Родий',Pd:'Палладий',Ag:'Серебро',Cd:'Кадмий',In:'Индий',Sn:'Олово',
      Sb:'Сурьма',Te:'Теллур',I:'Иод',Xe:'Ксенон',Cs:'Цезий',Ba:'Барий',La:'Лантан',Ce:'Церий',
      Pr:'Празеодим',Nd:'Неодим',Pm:'Прометий',Sm:'Самарий',Eu:'Европий',Gd:'Гадолиний',
      Tb:'Тербий',Dy:'Диспрозий',Ho:'Гольмий',Er:'Эрбий',Tm:'Тулий',Yb:'Иттербий',
      Lu:'Лютеций',Hf:'Гафний',Ta:'Тантал',W:'Вольфрам',Re:'Рений',Os:'Осмий',Ir:'Иридий',
      Pt:'Платина',Au:'Золото',Hg:'Ртуть',Tl:'Таллий',Pb:'Свинец',Bi:'Висмут',Po:'Полоний',
      At:'Астат',Rn:'Радон',Fr:'Франций',Ra:'Радий',Ac:'Актиний',Th:'Торий',Pa:'Протактиний',
      U:'Уран',Np:'Нептуний',Pu:'Плутоний',Am:'Америций',Cm:'Кюрий',Bk:'Берклий',
      Cf:'Калифорний',Es:'Эйнштейний',Fm:'Фермий',Md:'Менделевий',No:'Нобелий',
      Lr:'Лоуренсий',Rf:'Резерфордий',Db:'Дубний',Sg:'Сиборгий',Bh:'Борий',
      Hs:'Хассий',Mt:'Мейтнерий',Ds:'Дармштадтий',Rg:'Рентгений',Cn:'Коперниций',
      Nh:'Нихоний',Fl:'Флеровий',Mc:'Московий',Lv:'Ливерморий',Ts:'Теннессин',Og:'Оганесон'
    }
  };

  const PHASE_LABELS = {
    tr: { S:'Katı', L:'Sıvı', G:'Gaz', U:'Bilinmiyor' },
    en: { S:'Solid', L:'Liquid', G:'Gas', U:'Unknown' },
    de: { S:'Fest', L:'Flüssig', G:'Gas', U:'Unbekannt' },
    fr: { S:'Solide', L:'Liquide', G:'Gaz', U:'Inconnu' },
    es: { S:'Sólido', L:'Líquido', G:'Gas', U:'Desconocido' },
    ru: { S:'Твёрдое', L:'Жидкое', G:'Газ', U:'Неизвестно' },
    zh: { S:'固体', L:'液体', G:'气体', U:'未知' },
    ja: { S:'固体', L:'液体', G:'気体', U:'不明' },
    it: { S:'Solido', L:'Liquido', G:'Gas', U:'Sconosciuto' },
    ar: { S:'صلب', L:'سائل', G:'غاز', U:'مجهول' },
    ko: { S:'고체', L:'액체', G:'기체', U:'미지' },
    hi: { S:'ठोस', L:'तरल', G:'गैस', U:'अज्ञात' },
    pt: { S:'Sólido', L:'Líquido', G:'Gás', U:'Desconhecido' }
  };

  const UI_LABELS = {
    tr: { atomicMass:'Atom Kütlesi', category:'Kategori', period:'Periyot', group:'Grup', phase:'Faz (Oda Sıcaklığı)', electronConfig:'Elektron Dizilimi', lanthanides:'Lantanitler', actinides:'Aktinitler' },
    en: { atomicMass:'Atomic Mass', category:'Category', period:'Period', group:'Group', phase:'Phase (Room Temp.)', electronConfig:'Electron Configuration', lanthanides:'Lanthanides', actinides:'Actinides' },
    de: { atomicMass:'Atommasse', category:'Kategorie', period:'Periode', group:'Gruppe', phase:'Phase (Raumtemp.)', electronConfig:'Elektronenkonfiguration', lanthanides:'Lanthanoide', actinides:'Actinoide' },
    fr: { atomicMass:'Masse atomique', category:'Catégorie', period:'Période', group:'Groupe', phase:'Phase (Temp. ambiante)', electronConfig:'Configuration électronique', lanthanides:'Lanthanides', actinides:'Actinides' },
    es: { atomicMass:'Masa atómica', category:'Categoría', period:'Período', group:'Grupo', phase:'Fase (Temp. ambiente)', electronConfig:'Configuración electrónica', lanthanides:'Lantánidos', actinides:'Actínidos' },
    ru: { atomicMass:'Атомная масса', category:'Категория', period:'Период', group:'Группа', phase:'Фаза (комн. темп.)', electronConfig:'Электронная конфигурация', lanthanides:'Лантаноиды', actinides:'Актиноиды' },
    zh: { atomicMass:'原子质量', category:'类别', period:'周期', group:'族', phase:'物态（室温）', electronConfig:'电子构型', lanthanides:'镧系元素', actinides:'锕系元素' },
    ja: { atomicMass:'原子量', category:'分類', period:'周期', group:'族', phase:'相（室温）', electronConfig:'電子配置', lanthanides:'ランタノイド', actinides:'アクチノイド' },
    it: { atomicMass:'Massa atomica', category:'Categoria', period:'Periodo', group:'Gruppo', phase:'Fase (Temp. ambiente)', electronConfig:'Configurazione elettronica', lanthanides:'Lantanidi', actinides:'Attinidi' },
    ar: { atomicMass:'الكتلة الذرية', category:'الفئة', period:'الدورة', group:'المجموعة', phase:'الحالة (حرارة الغرفة)', electronConfig:'التوزيع الإلكتروني', lanthanides:'اللانثانيدات', actinides:'الأكتينيدات' },
    ko: { atomicMass:'원자 질량', category:'분류', period:'주기', group:'족', phase:'상태 (실온)', electronConfig:'전자 배치', lanthanides:'란타넘족', actinides:'악티늄족' },
    hi: { atomicMass:'परमाणु द्रव्यमान', category:'श्रेणी', period:'आवर्त', group:'वर्ग', phase:'अवस्था (कक्ष ताप)', electronConfig:'इलेक्ट्रॉन विन्यास', lanthanides:'लैंथेनाइड', actinides:'एक्टिनाइड' },
    pt: { atomicMass:'Massa atômica', category:'Categoria', period:'Período', group:'Grupo', phase:'Fase (Temp. ambiente)', electronConfig:'Configuração eletrônica', lanthanides:'Lantanídeos', actinides:'Actinídeos' }
  };

  // [z, sym, name, mass, cat, row, col, eConfig, phase]
  const RAW = [
    [1,'H','Hydrogen',1.008,'nm',1,1,'1s¹','G'],
    [2,'He','Helium',4.003,'ng',1,18,'1s²','G'],
    [3,'Li','Lithium',6.941,'am',2,1,'[He] 2s¹','S'],
    [4,'Be','Beryllium',9.012,'ae',2,2,'[He] 2s²','S'],
    [5,'B','Boron',10.81,'ml',2,13,'[He] 2s² 2p¹','S'],
    [6,'C','Carbon',12.01,'nm',2,14,'[He] 2s² 2p²','S'],
    [7,'N','Nitrogen',14.01,'nm',2,15,'[He] 2s² 2p³','G'],
    [8,'O','Oxygen',16.00,'nm',2,16,'[He] 2s² 2p⁴','G'],
    [9,'F','Fluorine',19.00,'ha',2,17,'[He] 2s² 2p⁵','G'],
    [10,'Ne','Neon',20.18,'ng',2,18,'[He] 2s² 2p⁶','G'],
    [11,'Na','Sodium',22.99,'am',3,1,'[Ne] 3s¹','S'],
    [12,'Mg','Magnesium',24.31,'ae',3,2,'[Ne] 3s²','S'],
    [13,'Al','Aluminium',26.98,'pt',3,13,'[Ne] 3s² 3p¹','S'],
    [14,'Si','Silicon',28.09,'ml',3,14,'[Ne] 3s² 3p²','S'],
    [15,'P','Phosphorus',30.97,'nm',3,15,'[Ne] 3s² 3p³','S'],
    [16,'S','Sulfur',32.07,'nm',3,16,'[Ne] 3s² 3p⁴','S'],
    [17,'Cl','Chlorine',35.45,'ha',3,17,'[Ne] 3s² 3p⁵','G'],
    [18,'Ar','Argon',39.95,'ng',3,18,'[Ne] 3s² 3p⁶','G'],
    [19,'K','Potassium',39.10,'am',4,1,'[Ar] 4s¹','S'],
    [20,'Ca','Calcium',40.08,'ae',4,2,'[Ar] 4s²','S'],
    [21,'Sc','Scandium',44.96,'tm',4,3,'[Ar] 3d¹ 4s²','S'],
    [22,'Ti','Titanium',47.87,'tm',4,4,'[Ar] 3d² 4s²','S'],
    [23,'V','Vanadium',50.94,'tm',4,5,'[Ar] 3d³ 4s²','S'],
    [24,'Cr','Chromium',52.00,'tm',4,6,'[Ar] 3d⁵ 4s¹','S'],
    [25,'Mn','Manganese',54.94,'tm',4,7,'[Ar] 3d⁵ 4s²','S'],
    [26,'Fe','Iron',55.85,'tm',4,8,'[Ar] 3d⁶ 4s²','S'],
    [27,'Co','Cobalt',58.93,'tm',4,9,'[Ar] 3d⁷ 4s²','S'],
    [28,'Ni','Nickel',58.69,'tm',4,10,'[Ar] 3d⁸ 4s²','S'],
    [29,'Cu','Copper',63.55,'tm',4,11,'[Ar] 3d¹⁰ 4s¹','S'],
    [30,'Zn','Zinc',65.38,'tm',4,12,'[Ar] 3d¹⁰ 4s²','S'],
    [31,'Ga','Gallium',69.72,'pt',4,13,'[Ar] 3d¹⁰ 4s² 4p¹','S'],
    [32,'Ge','Germanium',72.63,'ml',4,14,'[Ar] 3d¹⁰ 4s² 4p²','S'],
    [33,'As','Arsenic',74.92,'ml',4,15,'[Ar] 3d¹⁰ 4s² 4p³','S'],
    [34,'Se','Selenium',78.97,'nm',4,16,'[Ar] 3d¹⁰ 4s² 4p⁴','S'],
    [35,'Br','Bromine',79.90,'ha',4,17,'[Ar] 3d¹⁰ 4s² 4p⁵','L'],
    [36,'Kr','Krypton',83.80,'ng',4,18,'[Ar] 3d¹⁰ 4s² 4p⁶','G'],
    [37,'Rb','Rubidium',85.47,'am',5,1,'[Kr] 5s¹','S'],
    [38,'Sr','Strontium',87.62,'ae',5,2,'[Kr] 5s²','S'],
    [39,'Y','Yttrium',88.91,'tm',5,3,'[Kr] 4d¹ 5s²','S'],
    [40,'Zr','Zirconium',91.22,'tm',5,4,'[Kr] 4d² 5s²','S'],
    [41,'Nb','Niobium',92.91,'tm',5,5,'[Kr] 4d⁴ 5s¹','S'],
    [42,'Mo','Molybdenum',95.95,'tm',5,6,'[Kr] 4d⁵ 5s¹','S'],
    [43,'Tc','Technetium',98,'tm',5,7,'[Kr] 4d⁵ 5s²','S'],
    [44,'Ru','Ruthenium',101.1,'tm',5,8,'[Kr] 4d⁷ 5s¹','S'],
    [45,'Rh','Rhodium',102.9,'tm',5,9,'[Kr] 4d⁸ 5s¹','S'],
    [46,'Pd','Palladium',106.4,'tm',5,10,'[Kr] 4d¹⁰','S'],
    [47,'Ag','Silver',107.9,'tm',5,11,'[Kr] 4d¹⁰ 5s¹','S'],
    [48,'Cd','Cadmium',112.4,'tm',5,12,'[Kr] 4d¹⁰ 5s²','S'],
    [49,'In','Indium',114.8,'pt',5,13,'[Kr] 4d¹⁰ 5s² 5p¹','S'],
    [50,'Sn','Tin',118.7,'pt',5,14,'[Kr] 4d¹⁰ 5s² 5p²','S'],
    [51,'Sb','Antimony',121.8,'ml',5,15,'[Kr] 4d¹⁰ 5s² 5p³','S'],
    [52,'Te','Tellurium',127.6,'ml',5,16,'[Kr] 4d¹⁰ 5s² 5p⁴','S'],
    [53,'I','Iodine',126.9,'ha',5,17,'[Kr] 4d¹⁰ 5s² 5p⁵','S'],
    [54,'Xe','Xenon',131.3,'ng',5,18,'[Kr] 4d¹⁰ 5s² 5p⁶','G'],
    [55,'Cs','Caesium',132.9,'am',6,1,'[Xe] 6s¹','S'],
    [56,'Ba','Barium',137.3,'ae',6,2,'[Xe] 6s²','S'],
    [72,'Hf','Hafnium',178.5,'tm',6,4,'[Xe] 4f¹⁴ 5d² 6s²','S'],
    [73,'Ta','Tantalum',180.9,'tm',6,5,'[Xe] 4f¹⁴ 5d³ 6s²','S'],
    [74,'W','Tungsten',183.8,'tm',6,6,'[Xe] 4f¹⁴ 5d⁴ 6s²','S'],
    [75,'Re','Rhenium',186.2,'tm',6,7,'[Xe] 4f¹⁴ 5d⁵ 6s²','S'],
    [76,'Os','Osmium',190.2,'tm',6,8,'[Xe] 4f¹⁴ 5d⁶ 6s²','S'],
    [77,'Ir','Iridium',192.2,'tm',6,9,'[Xe] 4f¹⁴ 5d⁷ 6s²','S'],
    [78,'Pt','Platinum',195.1,'tm',6,10,'[Xe] 4f¹⁴ 5d⁹ 6s¹','S'],
    [79,'Au','Gold',197.0,'tm',6,11,'[Xe] 4f¹⁴ 5d¹⁰ 6s¹','S'],
    [80,'Hg','Mercury',200.6,'tm',6,12,'[Xe] 4f¹⁴ 5d¹⁰ 6s²','L'],
    [81,'Tl','Thallium',204.4,'pt',6,13,'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹','S'],
    [82,'Pb','Lead',207.2,'pt',6,14,'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²','S'],
    [83,'Bi','Bismuth',209.0,'pt',6,15,'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³','S'],
    [84,'Po','Polonium',209,'pt',6,16,'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴','S'],
    [85,'At','Astatine',210,'ha',6,17,'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵','S'],
    [86,'Rn','Radon',222,'ng',6,18,'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶','G'],
    [87,'Fr','Francium',223,'am',7,1,'[Rn] 7s¹','S'],
    [88,'Ra','Radium',226,'ae',7,2,'[Rn] 7s²','S'],
    [104,'Rf','Rutherfordium',267,'tm',7,4,'[Rn] 5f¹⁴ 6d² 7s²','U'],
    [105,'Db','Dubnium',268,'tm',7,5,'[Rn] 5f¹⁴ 6d³ 7s²','U'],
    [106,'Sg','Seaborgium',269,'tm',7,6,'[Rn] 5f¹⁴ 6d⁴ 7s²','U'],
    [107,'Bh','Bohrium',270,'tm',7,7,'[Rn] 5f¹⁴ 6d⁵ 7s²','U'],
    [108,'Hs','Hassium',277,'tm',7,8,'[Rn] 5f¹⁴ 6d⁶ 7s²','U'],
    [109,'Mt','Meitnerium',278,'uk',7,9,'[Rn] 5f¹⁴ 6d⁷ 7s²','U'],
    [110,'Ds','Darmstadtium',281,'uk',7,10,'[Rn] 5f¹⁴ 6d⁹ 7s¹','U'],
    [111,'Rg','Roentgenium',282,'uk',7,11,'[Rn] 5f¹⁴ 6d¹⁰ 7s¹','U'],
    [112,'Cn','Copernicium',285,'tm',7,12,'[Rn] 5f¹⁴ 6d¹⁰ 7s²','U'],
    [113,'Nh','Nihonium',286,'uk',7,13,'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹','U'],
    [114,'Fl','Flerovium',289,'uk',7,14,'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²','U'],
    [115,'Mc','Moscovium',290,'uk',7,15,'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³','U'],
    [116,'Lv','Livermorium',293,'uk',7,16,'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴','U'],
    [117,'Ts','Tennessine',294,'uk',7,17,'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵','U'],
    [118,'Og','Oganesson',294,'uk',7,18,'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶','U'],
    // Lanthanides (row 9)
    [57,'La','Lanthanum',138.9,'la',9,3,'[Xe] 5d¹ 6s²','S'],
    [58,'Ce','Cerium',140.1,'la',9,4,'[Xe] 4f¹ 5d¹ 6s²','S'],
    [59,'Pr','Praseodymium',140.9,'la',9,5,'[Xe] 4f³ 6s²','S'],
    [60,'Nd','Neodymium',144.2,'la',9,6,'[Xe] 4f⁴ 6s²','S'],
    [61,'Pm','Promethium',145,'la',9,7,'[Xe] 4f⁵ 6s²','S'],
    [62,'Sm','Samarium',150.4,'la',9,8,'[Xe] 4f⁶ 6s²','S'],
    [63,'Eu','Europium',152.0,'la',9,9,'[Xe] 4f⁷ 6s²','S'],
    [64,'Gd','Gadolinium',157.3,'la',9,10,'[Xe] 4f⁷ 5d¹ 6s²','S'],
    [65,'Tb','Terbium',158.9,'la',9,11,'[Xe] 4f⁹ 6s²','S'],
    [66,'Dy','Dysprosium',162.5,'la',9,12,'[Xe] 4f¹⁰ 6s²','S'],
    [67,'Ho','Holmium',164.9,'la',9,13,'[Xe] 4f¹¹ 6s²','S'],
    [68,'Er','Erbium',167.3,'la',9,14,'[Xe] 4f¹² 6s²','S'],
    [69,'Tm','Thulium',168.9,'la',9,15,'[Xe] 4f¹³ 6s²','S'],
    [70,'Yb','Ytterbium',173.0,'la',9,16,'[Xe] 4f¹⁴ 6s²','S'],
    [71,'Lu','Lutetium',175.0,'la',9,17,'[Xe] 4f¹⁴ 5d¹ 6s²','S'],
    // Actinides (row 10)
    [89,'Ac','Actinium',227,'ac',10,3,'[Rn] 6d¹ 7s²','S'],
    [90,'Th','Thorium',232.0,'ac',10,4,'[Rn] 6d² 7s²','S'],
    [91,'Pa','Protactinium',231.0,'ac',10,5,'[Rn] 5f² 6d¹ 7s²','S'],
    [92,'U','Uranium',238.0,'ac',10,6,'[Rn] 5f³ 6d¹ 7s²','S'],
    [93,'Np','Neptunium',237,'ac',10,7,'[Rn] 5f⁴ 6d¹ 7s²','S'],
    [94,'Pu','Plutonium',244,'ac',10,8,'[Rn] 5f⁶ 7s²','S'],
    [95,'Am','Americium',243,'ac',10,9,'[Rn] 5f⁷ 7s²','S'],
    [96,'Cm','Curium',247,'ac',10,10,'[Rn] 5f⁷ 6d¹ 7s²','S'],
    [97,'Bk','Berkelium',247,'ac',10,11,'[Rn] 5f⁹ 7s²','S'],
    [98,'Cf','Californium',251,'ac',10,12,'[Rn] 5f¹⁰ 7s²','S'],
    [99,'Es','Einsteinium',252,'ac',10,13,'[Rn] 5f¹¹ 7s²','S'],
    [100,'Fm','Fermium',257,'ac',10,14,'[Rn] 5f¹² 7s²','S'],
    [101,'Md','Mendelevium',258,'ac',10,15,'[Rn] 5f¹³ 7s²','S'],
    [102,'No','Nobelium',259,'ac',10,16,'[Rn] 5f¹⁴ 7s²','S'],
    [103,'Lr','Lawrencium',266,'ac',10,17,'[Rn] 5f¹⁴ 7s² 7p¹','S']
  ];

  const PHASE = PHASE_LABELS;

  function getLocale() {
    try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; }
  }

  return {
    setup(props) {
      const lang = ref((props.settings && props.settings.lang) || getLocale());
      function onLocaleChanged(e) { lang.value = e.detail || getLocale(); }
      Vue.onMounted(function() { window.addEventListener('locale-changed', onLocaleChanged); });
      Vue.onUnmounted(function() { window.removeEventListener('locale-changed', onLocaleChanged); });

      const t = computed(function() { return UI_LABELS[lang.value] || UI_LABELS.en; });
      const elements = RAW.map(function(e) {
        return { z:e[0], s:e[1], n:e[2], m:e[3], c:e[4], r:e[5], k:e[6], ec:e[7], p:e[8] };
      });
      const selected = ref(null);
      const highlighted = ref(null);

      function select(el) { selected.value = el; }
      function close() { selected.value = null; }
      function trName(sym) {
        var names = ELEMENT_NAMES[lang.value] || ELEMENT_NAMES.tr;
        return names[sym] || sym;
      }
      function catInfo(code) {
        var c = CATS[code] || CATS.uk;
        return { color: c.color, name: c.name[lang.value] || c.name.en };
      }
      function phaseLabel(code) {
        var p = PHASE[lang.value] || PHASE.en;
        return p[code] || code;
      }
      function period(el) { return el.r <= 7 ? el.r : (el.r === 9 ? 6 : 7); }
      function group(el) { return (el.r <= 7) ? el.k : null; }

      return { elements, selected, highlighted, select, close, trName, catInfo, phaseLabel, period, group, CATS, t, lang };
    }
  };
})(Vue);
