(function(Vue) {
  const { ref, computed, onMounted, onUnmounted } = Vue;

  // [english, emoji, {tr,en,de,fr,es,ru,zh,ja,it}, difficulty 1-3]
  const WORDS = [
    // ── Beginner (1) ──
    ['cat','🐱',{tr:'kedi',de:'Katze',fr:'chat',es:'gato',ru:'кот',zh:'猫',ja:'猫',it:'gatto',ar:'قطة',ko:'고양이',hi:'बिल्ली',pt:'gato'},1],
    ['dog','🐶',{tr:'köpek',de:'Hund',fr:'chien',es:'perro',ru:'собака',zh:'狗',ja:'犬',it:'cane',ar:'كلب',ko:'개',hi:'कुत्ता',pt:'cachorro'},1],
    ['sun','☀️',{tr:'güneş',de:'Sonne',fr:'soleil',es:'sol',ru:'солнце',zh:'太阳',ja:'太陽',it:'sole',ar:'شمس',ko:'태양',hi:'सूरज',pt:'sol'},1],
    ['moon','🌙',{tr:'ay',de:'Mond',fr:'lune',es:'luna',ru:'луна',zh:'月亮',ja:'月',it:'luna',ar:'قمر',ko:'달',hi:'चाँद',pt:'lua'},1],
    ['water','💧',{tr:'su',de:'Wasser',fr:'eau',es:'agua',ru:'вода',zh:'水',ja:'水',it:'acqua',ar:'ماء',ko:'물',hi:'पानी',pt:'água'},1],
    ['fire','🔥',{tr:'ateş',de:'Feuer',fr:'feu',es:'fuego',ru:'огонь',zh:'火',ja:'火',it:'fuoco',ar:'نار',ko:'불',hi:'आग',pt:'fogo'},1],
    ['house','🏠',{tr:'ev',de:'Haus',fr:'maison',es:'casa',ru:'дом',zh:'房子',ja:'家',it:'casa',ar:'منزل',ko:'집',hi:'घर',pt:'casa'},1],
    ['tree','🌳',{tr:'ağaç',de:'Baum',fr:'arbre',es:'árbol',ru:'дерево',zh:'树',ja:'木',it:'albero',ar:'شجرة',ko:'나무',hi:'पेड़',pt:'árvore'},1],
    ['book','📖',{tr:'kitap',de:'Buch',fr:'livre',es:'libro',ru:'книга',zh:'书',ja:'本',it:'libro',ar:'كتاب',ko:'책',hi:'किताब',pt:'livro'},1],
    ['star','⭐',{tr:'yıldız',de:'Stern',fr:'étoile',es:'estrella',ru:'звезда',zh:'星星',ja:'星',it:'stella',ar:'نجمة',ko:'별',hi:'तारा',pt:'estrela'},1],
    ['heart','❤️',{tr:'kalp',de:'Herz',fr:'cœur',es:'corazón',ru:'сердце',zh:'心',ja:'心',it:'cuore',ar:'قلب',ko:'심장',hi:'दिल',pt:'coração'},1],
    ['fish','🐟',{tr:'balık',de:'Fisch',fr:'poisson',es:'pez',ru:'рыба',zh:'鱼',ja:'魚',it:'pesce',ar:'سمكة',ko:'물고기',hi:'मछली',pt:'peixe'},1],
    ['bird','🐦',{tr:'kuş',de:'Vogel',fr:'oiseau',es:'pájaro',ru:'птица',zh:'鸟',ja:'鳥',it:'uccello',ar:'طائر',ko:'새',hi:'चिड़िया',pt:'pássaro'},1],
    ['apple','🍎',{tr:'elma',de:'Apfel',fr:'pomme',es:'manzana',ru:'яблоко',zh:'苹果',ja:'りんご',it:'mela',ar:'تفاحة',ko:'사과',hi:'सेब',pt:'maçã'},1],
    ['flower','🌸',{tr:'çiçek',de:'Blume',fr:'fleur',es:'flor',ru:'цветок',zh:'花',ja:'花',it:'fiore',ar:'زهرة',ko:'꽃',hi:'फूल',pt:'flor'},1],
    ['rain','🌧️',{tr:'yağmur',de:'Regen',fr:'pluie',es:'lluvia',ru:'дождь',zh:'雨',ja:'雨',it:'pioggia',ar:'مطر',ko:'비',hi:'बारिश',pt:'chuva'},1],
    ['snow','❄️',{tr:'kar',de:'Schnee',fr:'neige',es:'nieve',ru:'снег',zh:'雪',ja:'雪',it:'neve',ar:'ثلج',ko:'눈',hi:'बर्फ',pt:'neve'},1],
    ['hand','✋',{tr:'el',de:'Hand',fr:'main',es:'mano',ru:'рука',zh:'手',ja:'手',it:'mano',ar:'يد',ko:'손',hi:'हाथ',pt:'mão'},1],
    ['eye','👁️',{tr:'göz',de:'Auge',fr:'œil',es:'ojo',ru:'глаз',zh:'眼睛',ja:'目',it:'occhio',ar:'عين',ko:'눈',hi:'आँख',pt:'olho'},1],
    ['ear','👂',{tr:'kulak',de:'Ohr',fr:'oreille',es:'oreja',ru:'ухо',zh:'耳朵',ja:'耳',it:'orecchio',ar:'أذن',ko:'귀',hi:'कान',pt:'orelha'},1],
    ['baby','👶',{tr:'bebek',de:'Baby',fr:'bébé',es:'bebé',ru:'малыш',zh:'婴儿',ja:'赤ちゃん',it:'bambino',ar:'طفل',ko:'아기',hi:'बच्चा',pt:'bebê'},1],
    ['clock','🕐',{tr:'saat',de:'Uhr',fr:'horloge',es:'reloj',ru:'часы',zh:'时钟',ja:'時計',it:'orologio',ar:'ساعة',ko:'시계',hi:'घड़ी',pt:'relógio'},1],
    ['key','🔑',{tr:'anahtar',de:'Schlüssel',fr:'clé',es:'llave',ru:'ключ',zh:'钥匙',ja:'鍵',it:'chiave',ar:'مفتاح',ko:'열쇠',hi:'चाबी',pt:'chave'},1],
    ['bread','🍞',{tr:'ekmek',de:'Brot',fr:'pain',es:'pan',ru:'хлеб',zh:'面包',ja:'パン',it:'pane',ar:'خبز',ko:'빵',hi:'रोटी',pt:'pão'},1],
    ['milk','🥛',{tr:'süt',de:'Milch',fr:'lait',es:'leche',ru:'молоко',zh:'牛奶',ja:'牛乳',it:'latte',ar:'حليب',ko:'우유',hi:'दूध',pt:'leite'},1],
    ['door','🚪',{tr:'kapı',de:'Tür',fr:'porte',es:'puerta',ru:'дверь',zh:'门',ja:'ドア',it:'porta',ar:'باب',ko:'문',hi:'दरवाज़ा',pt:'porta'},1],
    ['car','🚗',{tr:'araba',de:'Auto',fr:'voiture',es:'coche',ru:'машина',zh:'汽车',ja:'車',it:'auto',ar:'سيارة',ko:'자동차',hi:'गाड़ी',pt:'carro'},1],
    ['bus','🚌',{tr:'otobüs',de:'Bus',fr:'bus',es:'autobús',ru:'автобус',zh:'公交车',ja:'バス',it:'autobus',ar:'حافلة',ko:'버스',hi:'बस',pt:'ônibus'},1],
    ['horse','🐴',{tr:'at',de:'Pferd',fr:'cheval',es:'caballo',ru:'лошадь',zh:'马',ja:'馬',it:'cavallo',ar:'حصان',ko:'말',hi:'घोड़ा',pt:'cavalo'},1],
    ['mountain','⛰️',{tr:'dağ',de:'Berg',fr:'montagne',es:'montaña',ru:'гора',zh:'山',ja:'山',it:'montagna',ar:'جبل',ko:'산',hi:'पहाड़',pt:'montanha'},1],
    ['food','🍽️',{tr:'yemek',de:'Essen',fr:'nourriture',es:'comida',ru:'еда',zh:'食物',ja:'食べ物',it:'cibo',ar:'طعام',ko:'음식',hi:'खाना',pt:'comida'},1],
    ['music','🎵',{tr:'müzik',de:'Musik',fr:'musique',es:'música',ru:'музыка',zh:'音乐',ja:'音楽',it:'musica',ar:'موسيقى',ko:'음악',hi:'संगीत',pt:'música'},1],
    ['money','💰',{tr:'para',de:'Geld',fr:'argent',es:'dinero',ru:'деньги',zh:'钱',ja:'お金',it:'denaro',ar:'مال',ko:'돈',hi:'पैसा',pt:'dinheiro'},1],
    // ── Intermediate (2) ──
    ['knowledge','📚',{tr:'bilgi',de:'Wissen',fr:'connaissance',es:'conocimiento',ru:'знание',zh:'知识',ja:'知識',it:'conoscenza',ar:'معرفة',ko:'지식',hi:'ज्ञान',pt:'conhecimento'},2],
    ['freedom','🕊️',{tr:'özgürlük',de:'Freiheit',fr:'liberté',es:'libertad',ru:'свобода',zh:'自由',ja:'自由',it:'libertà',ar:'حرية',ko:'자유',hi:'स्वतंत्रता',pt:'liberdade'},2],
    ['journey','🧳',{tr:'yolculuk',de:'Reise',fr:'voyage',es:'viaje',ru:'путешествие',zh:'旅程',ja:'旅',it:'viaggio',ar:'رحلة',ko:'여행',hi:'यात्रा',pt:'jornada'},2],
    ['bridge','🌉',{tr:'köprü',de:'Brücke',fr:'pont',es:'puente',ru:'мост',zh:'桥',ja:'橋',it:'ponte',ar:'جسر',ko:'다리',hi:'पुल',pt:'ponte'},2],
    ['island','🏝️',{tr:'ada',de:'Insel',fr:'île',es:'isla',ru:'остров',zh:'岛',ja:'島',it:'isola',ar:'جزيرة',ko:'섬',hi:'द्वीप',pt:'ilha'},2],
    ['shadow','',{tr:'gölge',de:'Schatten',fr:'ombre',es:'sombra',ru:'тень',zh:'影子',ja:'影',it:'ombra',ar:'ظل',ko:'그림자',hi:'छाया',pt:'sombra'},2],
    ['strength','💪',{tr:'güç',de:'Stärke',fr:'force',es:'fuerza',ru:'сила',zh:'力量',ja:'力',it:'forza',ar:'قوة',ko:'힘',hi:'शक्ति',pt:'força'},2],
    ['silence','🤫',{tr:'sessizlik',de:'Stille',fr:'silence',es:'silencio',ru:'тишина',zh:'沉默',ja:'沈黙',it:'silenzio',ar:'صمت',ko:'침묵',hi:'चुप्पी',pt:'silêncio'},2],
    ['danger','⚠️',{tr:'tehlike',de:'Gefahr',fr:'danger',es:'peligro',ru:'опасность',zh:'危险',ja:'危険',it:'pericolo',ar:'خطر',ko:'위험',hi:'खतरा',pt:'perigo'},2],
    ['dream','💭',{tr:'rüya',de:'Traum',fr:'rêve',es:'sueño',ru:'мечта',zh:'梦',ja:'夢',it:'sogno',ar:'حلم',ko:'꿈',hi:'सपना',pt:'sonho'},2],
    ['victory','🏆',{tr:'zafer',de:'Sieg',fr:'victoire',es:'victoria',ru:'победа',zh:'胜利',ja:'勝利',it:'vittoria',ar:'نصر',ko:'승리',hi:'जीत',pt:'vitória'},2],
    ['weather','🌤️',{tr:'hava durumu',de:'Wetter',fr:'météo',es:'clima',ru:'погода',zh:'天气',ja:'天気',it:'meteo',ar:'طقس',ko:'날씨',hi:'मौसम',pt:'clima'},2],
    ['language','🗣️',{tr:'dil',de:'Sprache',fr:'langue',es:'idioma',ru:'язык',zh:'语言',ja:'言語',it:'lingua',ar:'لغة',ko:'언어',hi:'भाषा',pt:'idioma'},2],
    ['history','📜',{tr:'tarih',de:'Geschichte',fr:'histoire',es:'historia',ru:'история',zh:'历史',ja:'歴史',it:'storia',ar:'تاريخ',ko:'역사',hi:'इतिहास',pt:'história'},2],
    ['promise','🤝',{tr:'söz',de:'Versprechen',fr:'promesse',es:'promesa',ru:'обещание',zh:'承诺',ja:'約束',it:'promessa',ar:'وعد',ko:'약속',hi:'वादा',pt:'promessa'},2],
    ['neighbor','',{tr:'komşu',de:'Nachbar',fr:'voisin',es:'vecino',ru:'сосед',zh:'邻居',ja:'隣人',it:'vicino',ar:'جار',ko:'이웃',hi:'पड़ोसी',pt:'vizinho'},2],
    ['ocean','🌊',{tr:'okyanus',de:'Ozean',fr:'océan',es:'océano',ru:'океан',zh:'海洋',ja:'海',it:'oceano',ar:'محيط',ko:'바다',hi:'महासागर',pt:'oceano'},2],
    ['castle','🏰',{tr:'kale',de:'Schloss',fr:'château',es:'castillo',ru:'замок',zh:'城堡',ja:'城',it:'castello',ar:'قلعة',ko:'성',hi:'किला',pt:'castelo'},2],
    ['candle','🕯️',{tr:'mum',de:'Kerze',fr:'bougie',es:'vela',ru:'свеча',zh:'蜡烛',ja:'ろうそく',it:'candela',ar:'شمعة',ko:'촛불',hi:'मोमबत्ती',pt:'vela'},2],
    ['diamond','💎',{tr:'elmas',de:'Diamant',fr:'diamant',es:'diamante',ru:'алмаз',zh:'钻石',ja:'ダイヤモンド',it:'diamante',ar:'ماس',ko:'다이아몬드',hi:'हीरा',pt:'diamante'},2],
    ['thunder','⚡',{tr:'gök gürültüsü',de:'Donner',fr:'tonnerre',es:'trueno',ru:'гром',zh:'雷',ja:'雷',it:'tuono',ar:'رعد',ko:'천둥',hi:'गरज',pt:'trovão'},2],
    ['rainbow','🌈',{tr:'gökkuşağı',de:'Regenbogen',fr:'arc-en-ciel',es:'arco iris',ru:'радуга',zh:'彩虹',ja:'虹',it:'arcobaleno',ar:'قوس قزح',ko:'무지개',hi:'इंद्रधनुष',pt:'arco-íris'},2],
    ['compass','🧭',{tr:'pusula',de:'Kompass',fr:'boussole',es:'brújula',ru:'компас',zh:'指南针',ja:'コンパス',it:'bussola',ar:'بوصلة',ko:'나침반',hi:'कम्पास',pt:'bússola'},2],
    ['crown','👑',{tr:'taç',de:'Krone',fr:'couronne',es:'corona',ru:'корона',zh:'皇冠',ja:'王冠',it:'corona',ar:'تاج',ko:'왕관',hi:'मुकुट',pt:'coroa'},2],
    ['anchor','⚓',{tr:'çapa',de:'Anker',fr:'ancre',es:'ancla',ru:'якорь',zh:'锚',ja:'いかり',it:'ancora',ar:'مرساة',ko:'닻',hi:'लंगर',pt:'âncora'},2],
    ['garden','🌻',{tr:'bahçe',de:'Garten',fr:'jardin',es:'jardín',ru:'сад',zh:'花园',ja:'庭',it:'giardino',ar:'حديقة',ko:'정원',hi:'बगीचा',pt:'jardim'},2],
    ['planet','🪐',{tr:'gezegen',de:'Planet',fr:'planète',es:'planeta',ru:'планета',zh:'行星',ja:'惑星',it:'pianeta',ar:'كوكب',ko:'행성',hi:'ग्रह',pt:'planeta'},2],
    ['rocket','🚀',{tr:'roket',de:'Rakete',fr:'fusée',es:'cohete',ru:'ракета',zh:'火箭',ja:'ロケット',it:'razzo',ar:'صاروخ',ko:'로켓',hi:'रॉकेट',pt:'foguete'},2],
    ['butterfly','🦋',{tr:'kelebek',de:'Schmetterling',fr:'papillon',es:'mariposa',ru:'бабочка',zh:'蝴蝶',ja:'蝶',it:'farfalla',ar:'فراشة',ko:'나비',hi:'तितली',pt:'borboleta'},2],
    ['treasure','',{tr:'hazine',de:'Schatz',fr:'trésor',es:'tesoro',ru:'сокровище',zh:'宝藏',ja:'宝',it:'tesoro',ar:'كنز',ko:'보물',hi:'खजाना',pt:'tesouro'},2],
    ['desert','🏜️',{tr:'çöl',de:'Wüste',fr:'désert',es:'desierto',ru:'пустыня',zh:'沙漠',ja:'砂漠',it:'deserto',ar:'صحراء',ko:'사막',hi:'रेगिस्तान',pt:'deserto'},2],
    // ── Advanced (3) ──
    ['resilience','',{tr:'dayanıklılık',de:'Widerstandsfähigkeit',fr:'résilience',es:'resiliencia',ru:'устойчивость',zh:'韧性',ja:'回復力',it:'resilienza',ar:'مرونة',ko:'회복력',hi:'लचीलापन',pt:'resiliência'},3],
    ['ambiguity','',{tr:'belirsizlik',de:'Mehrdeutigkeit',fr:'ambiguïté',es:'ambigüedad',ru:'двусмысленность',zh:'模糊',ja:'曖昧さ',it:'ambiguità',ar:'غموض',ko:'모호함',hi:'अस्पष्टता',pt:'ambiguidade'},3],
    ['perseverance','',{tr:'azim',de:'Beharrlichkeit',fr:'persévérance',es:'perseverancia',ru:'настойчивость',zh:'毅力',ja:'忍耐',it:'perseveranza',ar:'مثابرة',ko:'인내',hi:'दृढ़ता',pt:'perseverança'},3],
    ['conscience','',{tr:'vicdan',de:'Gewissen',fr:'conscience',es:'conciencia',ru:'совесть',zh:'良心',ja:'良心',it:'coscienza',ar:'ضمير',ko:'양심',hi:'विवेक',pt:'consciência'},3],
    ['catastrophe','💥',{tr:'felaket',de:'Katastrophe',fr:'catastrophe',es:'catástrofe',ru:'катастрофа',zh:'灾难',ja:'大惨事',it:'catastrofe',ar:'كارثة',ko:'재앙',hi:'तबाही',pt:'catástrofe'},3],
    ['eloquence','',{tr:'belagat',de:'Eloquenz',fr:'éloquence',es:'elocuencia',ru:'красноречие',zh:'口才',ja:'雄弁',it:'eloquenza',ar:'بلاغة',ko:'웅변',hi:'वाक्पटुता',pt:'eloquência'},3],
    ['hypothesis','🔬',{tr:'hipotez',de:'Hypothese',fr:'hypothèse',es:'hipótesis',ru:'гипотеза',zh:'假设',ja:'仮説',it:'ipotesi',ar:'فرضية',ko:'가설',hi:'परिकल्पना',pt:'hipótese'},3],
    ['nostalgia','',{tr:'nostalji',de:'Nostalgie',fr:'nostalgie',es:'nostalgia',ru:'ностальгия',zh:'怀旧',ja:'郷愁',it:'nostalgia',ar:'حنين',ko:'향수',hi:'पुरानी यादें',pt:'nostalgia'},3],
    ['sovereignty','',{tr:'egemenlik',de:'Souveränität',fr:'souveraineté',es:'soberanía',ru:'суверенитет',zh:'主权',ja:'主権',it:'sovranità',ar:'سيادة',ko:'주권',hi:'संप्रभुता',pt:'soberania'},3],
    ['phenomenon','',{tr:'fenomen',de:'Phänomen',fr:'phénomène',es:'fenómeno',ru:'феномен',zh:'现象',ja:'現象',it:'fenomeno',ar:'ظاهرة',ko:'현상',hi:'घटना',pt:'fenômeno'},3],
    ['melancholy','😔',{tr:'melankoli',de:'Melancholie',fr:'mélancolie',es:'melancolía',ru:'меланхолия',zh:'忧郁',ja:'憂鬱',it:'malinconia',ar:'كآبة',ko:'우울',hi:'उदासी',pt:'melancolia'},3],
    ['paradox','',{tr:'paradoks',de:'Paradoxon',fr:'paradoxe',es:'paradoja',ru:'парадокс',zh:'悖论',ja:'パラドックス',it:'paradosso',ar:'مفارقة',ko:'역설',hi:'विरोधाभास',pt:'paradoxo'},3],
    ['ephemeral','',{tr:'geçici',de:'vergänglich',fr:'éphémère',es:'efímero',ru:'эфемерный',zh:'短暂的',ja:'はかない',it:'effimero',ar:'زائل',ko:'일시적',hi:'क्षणभंगुर',pt:'efêmero'},3],
    ['bureaucracy','',{tr:'bürokrasi',de:'Bürokratie',fr:'bureaucratie',es:'burocracia',ru:'бюрократия',zh:'官僚主义',ja:'官僚制',it:'burocrazia',ar:'بيروقراطية',ko:'관료제',hi:'नौकरशाही',pt:'burocracia'},3],
    ['architecture','🏛️',{tr:'mimari',de:'Architektur',fr:'architecture',es:'arquitectura',ru:'архитектура',zh:'建筑',ja:'建築',it:'architettura',ar:'عمارة',ko:'건축',hi:'वास्तुकला',pt:'arquitetura'},3],
    ['philosophy','',{tr:'felsefe',de:'Philosophie',fr:'philosophie',es:'filosofía',ru:'философия',zh:'哲学',ja:'哲学',it:'filosofia',ar:'فلسفة',ko:'철학',hi:'दर्शन',pt:'filosofia'},3],
    ['metamorphosis','🦋',{tr:'başkalaşım',de:'Metamorphose',fr:'métamorphose',es:'metamorfosis',ru:'метаморфоза',zh:'蜕变',ja:'変態',it:'metamorfosi',ar:'تحول',ko:'변태',hi:'कायापलट',pt:'metamorfose'},3],
    ['serendipity','',{tr:'tesadüfi keşif',de:'Serendipität',fr:'sérendipité',es:'serendipia',ru:'серендипность',zh:'意外发现',ja:'偶然の発見',it:'serendipità',ar:'صدفة سعيدة',ko:'뜻밖의 발견',hi:'अप्रत्याशित खोज',pt:'serendipidade'},3],
    ['vulnerability','',{tr:'kırılganlık',de:'Verletzlichkeit',fr:'vulnérabilité',es:'vulnerabilidad',ru:'уязвимость',zh:'脆弱性',ja:'脆弱性',it:'vulnerabilità',ar:'ضعف',ko:'취약성',hi:'भेद्यता',pt:'vulnerabilidade'},3],
    ['infrastructure','🏗️',{tr:'altyapı',de:'Infrastruktur',fr:'infrastructure',es:'infraestructura',ru:'инфраструктура',zh:'基础设施',ja:'インフラ',it:'infrastruttura',ar:'بنية تحتية',ko:'인프라',hi:'बुनियादी ढांचा',pt:'infraestrutura'},3],
    ['kaleidoscope','',{tr:'kaleydoskop',de:'Kaleidoskop',fr:'kaléidoscope',es:'caleidoscopio',ru:'калейдоскоп',zh:'万花筒',ja:'万華鏡',it:'caleidoscopio',ar:'منظار',ko:'만화경',hi:'बहुरूपदर्शक',pt:'caleidoscópio'},3],
    ['quintessence','',{tr:'öz',de:'Quintessenz',fr:'quintessence',es:'quintaesencia',ru:'квинтэссенция',zh:'精髓',ja:'真髄',it:'quintessenza',ar:'جوهر',ko:'정수',hi:'सार',pt:'quintessência'},3],
    ['juxtaposition','',{tr:'yan yana koyma',de:'Gegenüberstellung',fr:'juxtaposition',es:'yuxtaposición',ru:'сопоставление',zh:'并列',ja:'並置',it:'giustapposizione',ar:'مقارنة',ko:'병치',hi:'सन्निधान',pt:'justaposição'},3],
    ['conundrum','🤔',{tr:'ikilem',de:'Rätsel',fr:'énigme',es:'enigma',ru:'загадка',zh:'难题',ja:'難問',it:'enigma',ar:'لغز',ko:'난제',hi:'पहेली',pt:'enigma'},3],
    // ── Beginner Set 2 (1) ──
    ['table','🪑',{tr:'masa',de:'Tisch',fr:'table',es:'mesa',ru:'стол',zh:'桌子',ja:'テーブル',it:'tavolo',ar:'طاولة',ko:'탁자',hi:'मेज',pt:'mesa'},1],
    ['chair','💺',{tr:'sandalye',de:'Stuhl',fr:'chaise',es:'silla',ru:'стул',zh:'椅子',ja:'椅子',it:'sedia',ar:'كرسي',ko:'의자',hi:'कुर्सी',pt:'cadeira'},1],
    ['window','🪟',{tr:'pencere',de:'Fenster',fr:'fenêtre',es:'ventana',ru:'окно',zh:'窗户',ja:'窓',it:'finestra',ar:'نافذة',ko:'창문',hi:'खिड़की',pt:'janela'},1],
    ['river','🏞️',{tr:'nehir',de:'Fluss',fr:'rivière',es:'río',ru:'река',zh:'河流',ja:'川',it:'fiume',ar:'نهر',ko:'강',hi:'नदी',pt:'rio'},1],
    ['friend','🤗',{tr:'arkadaş',de:'Freund',fr:'ami',es:'amigo',ru:'друг',zh:'朋友',ja:'友達',it:'amico',ar:'صديق',ko:'친구',hi:'दोस्त',pt:'amigo'},1],
    ['school','🏫',{tr:'okul',de:'Schule',fr:'école',es:'escuela',ru:'школа',zh:'学校',ja:'学校',it:'scuola',ar:'مدرسة',ko:'학교',hi:'स्कूल',pt:'escola'},1],
    ['city','🏙️',{tr:'şehir',de:'Stadt',fr:'ville',es:'ciudad',ru:'город',zh:'城市',ja:'都市',it:'città',ar:'مدينة',ko:'도시',hi:'शहर',pt:'cidade'},1],
    ['night','🌃',{tr:'gece',de:'Nacht',fr:'nuit',es:'noche',ru:'ночь',zh:'夜晚',ja:'夜',it:'notte',ar:'ليل',ko:'밤',hi:'रात',pt:'noite'},1],
    ['child','👧',{tr:'çocuk',de:'Kind',fr:'enfant',es:'niño',ru:'ребёнок',zh:'孩子',ja:'子供',it:'bambino',ar:'طفل',ko:'아이',hi:'बच्चा',pt:'criança'},1],
    ['mouth','👄',{tr:'ağız',de:'Mund',fr:'bouche',es:'boca',ru:'рот',zh:'嘴',ja:'口',it:'bocca',ar:'فم',ko:'입',hi:'मुंह',pt:'boca'},1],
    ['ball','⚽',{tr:'top',de:'Ball',fr:'balle',es:'pelota',ru:'мяч',zh:'球',ja:'ボール',it:'palla',ar:'كرة',ko:'공',hi:'गेंद',pt:'bola'},1],
    ['hat','🎩',{tr:'şapka',de:'Hut',fr:'chapeau',es:'sombrero',ru:'шляпа',zh:'帽子',ja:'帽子',it:'cappello',ar:'قبعة',ko:'모자',hi:'टोपी',pt:'chapéu'},1],
    ['shoe','👟',{tr:'ayakkabı',de:'Schuh',fr:'chaussure',es:'zapato',ru:'обувь',zh:'鞋',ja:'靴',it:'scarpa',ar:'حذاء',ko:'신발',hi:'जूता',pt:'sapato'},1],
    ['bed','🛏️',{tr:'yatak',de:'Bett',fr:'lit',es:'cama',ru:'кровать',zh:'床',ja:'ベッド',it:'letto',ar:'سرير',ko:'침대',hi:'बिस्तर',pt:'cama'},1],
    ['cup','☕',{tr:'bardak',de:'Tasse',fr:'tasse',es:'taza',ru:'чашка',zh:'杯子',ja:'カップ',it:'tazza',ar:'كوب',ko:'컵',hi:'कप',pt:'xícara'},1],
    ['tooth','🦷',{tr:'diş',de:'Zahn',fr:'dent',es:'diente',ru:'зуб',zh:'牙齿',ja:'歯',it:'dente',ar:'سن',ko:'이',hi:'दांत',pt:'dente'},1],
    ['soap','🧼',{tr:'sabun',de:'Seife',fr:'savon',es:'jabón',ru:'мыло',zh:'肥皂',ja:'石鹸',it:'sapone',ar:'صابون',ko:'비누',hi:'साबुन',pt:'sabão'},1],
    ['knife','🔪',{tr:'bıçak',de:'Messer',fr:'couteau',es:'cuchillo',ru:'нож',zh:'刀',ja:'ナイフ',it:'coltello',ar:'سكين',ko:'칼',hi:'चाकू',pt:'faca'},1],
    ['lamp','💡',{tr:'lamba',de:'Lampe',fr:'lampe',es:'lámpara',ru:'лампа',zh:'灯',ja:'ランプ',it:'lampada',ar:'مصباح',ko:'램프',hi:'लैंप',pt:'lâmpada'},1],
    ['pen','🖊️',{tr:'kalem',de:'Stift',fr:'stylo',es:'bolígrafo',ru:'ручка',zh:'笔',ja:'ペン',it:'penna',ar:'قلم',ko:'펜',hi:'कलम',pt:'caneta'},1],
    ['shirt','👕',{tr:'gömlek',de:'Hemd',fr:'chemise',es:'camisa',ru:'рубашка',zh:'衬衫',ja:'シャツ',it:'camicia',ar:'قميص',ko:'셔츠',hi:'कमीज',pt:'camisa'},1],
    ['cloud','☁️',{tr:'bulut',de:'Wolke',fr:'nuage',es:'nube',ru:'облако',zh:'云',ja:'雲',it:'nuvola',ar:'سحابة',ko:'구름',hi:'बादल',pt:'nuvem'},1],
    ['grass','🌿',{tr:'çimen',de:'Gras',fr:'herbe',es:'hierba',ru:'трава',zh:'草',ja:'草',it:'erba',ar:'عشب',ko:'풀',hi:'घास',pt:'grama'},1],
    ['egg','🥚',{tr:'yumurta',de:'Ei',fr:'œuf',es:'huevo',ru:'яйцо',zh:'蛋',ja:'卵',it:'uovo',ar:'بيض',ko:'달걀',hi:'अंडा',pt:'ovo'},1],
    ['cheese','🧀',{tr:'peynir',de:'Käse',fr:'fromage',es:'queso',ru:'сыр',zh:'奶酪',ja:'チーズ',it:'formaggio',ar:'جبن',ko:'치즈',hi:'पनीर',pt:'queijo'},1],
    ['ice','🧊',{tr:'buz',de:'Eis',fr:'glace',es:'hielo',ru:'лёд',zh:'冰',ja:'氷',it:'ghiaccio',ar:'جليد',ko:'얼음',hi:'बर्फ़',pt:'gelo'},1],
    ['stone','🪨',{tr:'taş',de:'Stein',fr:'pierre',es:'piedra',ru:'камень',zh:'石头',ja:'石',it:'pietra',ar:'حجر',ko:'돌',hi:'पत्थर',pt:'pedra'},1],
    ['leaf','🍃',{tr:'yaprak',de:'Blatt',fr:'feuille',es:'hoja',ru:'лист',zh:'叶子',ja:'葉',it:'foglia',ar:'ورقة',ko:'잎',hi:'पत्ता',pt:'folha'},1],
    ['bone','🦴',{tr:'kemik',de:'Knochen',fr:'os',es:'hueso',ru:'кость',zh:'骨头',ja:'骨',it:'osso',ar:'عظم',ko:'뼈',hi:'हड्डी',pt:'osso'},1],
    ['cake','🎂',{tr:'pasta',de:'Kuchen',fr:'gâteau',es:'pastel',ru:'торт',zh:'蛋糕',ja:'ケーキ',it:'torta',ar:'كعكة',ko:'케이크',hi:'केक',pt:'bolo'},1],
    ['rice','🍚',{tr:'pirinç',de:'Reis',fr:'riz',es:'arroz',ru:'рис',zh:'米饭',ja:'ご飯',it:'riso',ar:'أرز',ko:'쌀',hi:'चावल',pt:'arroz'},1],
    ['salt','🧂',{tr:'tuz',de:'Salz',fr:'sel',es:'sal',ru:'соль',zh:'盐',ja:'塩',it:'sale',ar:'ملح',ko:'소금',hi:'नमक',pt:'sal'},1],
    ['king','🤴',{tr:'kral',de:'König',fr:'roi',es:'rey',ru:'король',zh:'国王',ja:'王',it:'re',ar:'ملك',ko:'왕',hi:'राजा',pt:'rei'},1],
    ['queen','👸',{tr:'kraliçe',de:'Königin',fr:'reine',es:'reina',ru:'королева',zh:'女王',ja:'女王',it:'regina',ar:'ملكة',ko:'여왕',hi:'रानी',pt:'rainha'},1],
    // ── Intermediate Set 2 (2) ──
    ['courage','🦁',{tr:'cesaret',de:'Mut',fr:'courage',es:'coraje',ru:'смелость',zh:'勇气',ja:'勇気',it:'coraggio',ar:'شجاعة',ko:'용기',hi:'साहस',pt:'coragem'},2],
    ['horizon','🌅',{tr:'ufuk',de:'Horizont',fr:'horizon',es:'horizonte',ru:'горизонт',zh:'地平线',ja:'地平線',it:'orizzonte',ar:'أفق',ko:'지평선',hi:'क्षितिज',pt:'horizonte'},2],
    ['loyalty','🤝',{tr:'sadakat',de:'Treue',fr:'loyauté',es:'lealtad',ru:'верность',zh:'忠诚',ja:'忠誠',it:'lealtà',ar:'وفاء',ko:'충성',hi:'वफ़ादारी',pt:'lealdade'},2],
    ['patience','⏳',{tr:'sabır',de:'Geduld',fr:'patience',es:'paciencia',ru:'терпение',zh:'耐心',ja:'忍耐',it:'pazienza',ar:'صبر',ko:'인내심',hi:'धैर्य',pt:'paciência'},2],
    ['harmony','🎶',{tr:'uyum',de:'Harmonie',fr:'harmonie',es:'armonía',ru:'гармония',zh:'和谐',ja:'調和',it:'armonia',ar:'تناغم',ko:'조화',hi:'सामंजस्य',pt:'harmonia'},2],
    ['mystery','🔮',{tr:'gizem',de:'Geheimnis',fr:'mystère',es:'misterio',ru:'тайна',zh:'神秘',ja:'神秘',it:'mistero',ar:'غموض',ko:'미스터리',hi:'रहस्य',pt:'mistério'},2],
    ['wisdom','🦉',{tr:'bilgelik',de:'Weisheit',fr:'sagesse',es:'sabiduría',ru:'мудрость',zh:'智慧',ja:'知恵',it:'saggezza',ar:'حكمة',ko:'지혜',hi:'बुद्धिमत्ता',pt:'sabedoria'},2],
    ['volcano','🌋',{tr:'yanardağ',de:'Vulkan',fr:'volcan',es:'volcán',ru:'вулкан',zh:'火山',ja:'火山',it:'vulcano',ar:'بركان',ko:'화산',hi:'ज्वालामुखी',pt:'vulcão'},2],
    ['forest','🌲',{tr:'orman',de:'Wald',fr:'forêt',es:'bosque',ru:'лес',zh:'森林',ja:'森',it:'foresta',ar:'غابة',ko:'숲',hi:'जंगल',pt:'floresta'},2],
    ['miracle','✨',{tr:'mucize',de:'Wunder',fr:'miracle',es:'milagro',ru:'чудо',zh:'奇迹',ja:'奇跡',it:'miracolo',ar:'معجزة',ko:'기적',hi:'चमत्कार',pt:'milagre'},2],
    ['adventure','🗺️',{tr:'macera',de:'Abenteuer',fr:'aventure',es:'aventura',ru:'приключение',zh:'冒险',ja:'冒険',it:'avventura',ar:'مغامرة',ko:'모험',hi:'रोमांच',pt:'aventura'},2],
    ['recipe','📝',{tr:'tarif',de:'Rezept',fr:'recette',es:'receta',ru:'рецепт',zh:'食谱',ja:'レシピ',it:'ricetta',ar:'وصفة',ko:'레시피',hi:'नुस्खा',pt:'receita'},2],
    ['challenge','🏅',{tr:'meydan okuma',de:'Herausforderung',fr:'défi',es:'desafío',ru:'вызов',zh:'挑战',ja:'挑戦',it:'sfida',ar:'تحدي',ko:'도전',hi:'चुनौती',pt:'desafio'},2],
    ['tradition','🏮',{tr:'gelenek',de:'Tradition',fr:'tradition',es:'tradición',ru:'традиция',zh:'传统',ja:'伝統',it:'tradizione',ar:'تقاليد',ko:'전통',hi:'परंपरा',pt:'tradição'},2],
    ['discovery','🔭',{tr:'keşif',de:'Entdeckung',fr:'découverte',es:'descubrimiento',ru:'открытие',zh:'发现',ja:'発見',it:'scoperta',ar:'اكتشاف',ko:'발견',hi:'खोज',pt:'descoberta'},2],
    ['sacrifice','',{tr:'fedakarlık',de:'Opfer',fr:'sacrifice',es:'sacrificio',ru:'жертва',zh:'牺牲',ja:'犠牲',it:'sacrificio',ar:'تضحية',ko:'희생',hi:'बलिदान',pt:'sacrifício'},2],
    ['shelter','🏕️',{tr:'sığınak',de:'Unterschlupf',fr:'abri',es:'refugio',ru:'убежище',zh:'避难所',ja:'避難所',it:'rifugio',ar:'ملجأ',ko:'피난처',hi:'आश्रय',pt:'abrigo'},2],
    ['strategy','♟️',{tr:'strateji',de:'Strategie',fr:'stratégie',es:'estrategia',ru:'стратегия',zh:'策略',ja:'戦略',it:'strategia',ar:'استراتيجية',ko:'전략',hi:'रणनीति',pt:'estratégia'},2],
    ['fountain','⛲',{tr:'çeşme',de:'Brunnen',fr:'fontaine',es:'fuente',ru:'фонтан',zh:'喷泉',ja:'噴水',it:'fontana',ar:'نافورة',ko:'분수',hi:'फव्वारा',pt:'fonte'},2],
    ['harvest','🌾',{tr:'hasat',de:'Ernte',fr:'récolte',es:'cosecha',ru:'урожай',zh:'收获',ja:'収穫',it:'raccolto',ar:'حصاد',ko:'수확',hi:'फसल',pt:'colheita'},2],
    ['kingdom','👑',{tr:'krallık',de:'Königreich',fr:'royaume',es:'reino',ru:'королевство',zh:'王国',ja:'王国',it:'regno',ar:'مملكة',ko:'왕국',hi:'राज्य',pt:'reino'},2],
    ['glacier','🏔️',{tr:'buzul',de:'Gletscher',fr:'glacier',es:'glaciar',ru:'ледник',zh:'冰川',ja:'氷河',it:'ghiacciaio',ar:'نهر جليدي',ko:'빙하',hi:'हिमनद',pt:'geleira'},2],
    ['portrait','🖼️',{tr:'portre',de:'Porträt',fr:'portrait',es:'retrato',ru:'портрет',zh:'肖像',ja:'肖像',it:'ritratto',ar:'صورة',ko:'초상화',hi:'चित्र',pt:'retrato'},2],
    ['symphony','🎻',{tr:'senfoni',de:'Symphonie',fr:'symphonie',es:'sinfonía',ru:'симфония',zh:'交响曲',ja:'交響曲',it:'sinfonia',ar:'سيمفونية',ko:'교향곡',hi:'सिम्फनी',pt:'sinfonia'},2],
    ['rebellion','⚔️',{tr:'isyan',de:'Rebellion',fr:'rébellion',es:'rebelión',ru:'восстание',zh:'叛乱',ja:'反乱',it:'ribellione',ar:'تمرد',ko:'반란',hi:'विद्रोह',pt:'rebelião'},2],
    ['eclipse','🌑',{tr:'tutulma',de:'Finsternis',fr:'éclipse',es:'eclipse',ru:'затмение',zh:'日食',ja:'日食',it:'eclisse',ar:'كسوف',ko:'일식',hi:'ग्रहण',pt:'eclipse'},2],
    ['emotion','😢',{tr:'duygu',de:'Emotion',fr:'émotion',es:'emoción',ru:'эмоция',zh:'情感',ja:'感情',it:'emozione',ar:'عاطفة',ko:'감정',hi:'भावना',pt:'emoção'},2],
    ['illusion','🪄',{tr:'yanılsama',de:'Illusion',fr:'illusion',es:'ilusión',ru:'иллюзия',zh:'幻觉',ja:'幻想',it:'illusione',ar:'وهم',ko:'환상',hi:'भ्रम',pt:'ilusão'},2],
    ['ceremony','🎊',{tr:'tören',de:'Zeremonie',fr:'cérémonie',es:'ceremonia',ru:'церемония',zh:'仪式',ja:'式典',it:'cerimonia',ar:'حفل',ko:'의식',hi:'समारोह',pt:'cerimônia'},2],
    ['labyrinth','🌀',{tr:'labirent',de:'Labyrinth',fr:'labyrinthe',es:'laberinto',ru:'лабиринт',zh:'迷宫',ja:'迷路',it:'labirinto',ar:'متاهة',ko:'미로',hi:'भूलभुलैया',pt:'labirinto'},2],
    // ── Advanced Set 2 (3) ──
    ['benevolent','😇',{tr:'hayırsever',de:'wohlwollend',fr:'bienveillant',es:'benevolente',ru:'благожелательный',zh:'仁慈的',ja:'慈悲深い',it:'benevolo',ar:'خيّر',ko:'자비로운',hi:'परोपकारी',pt:'benevolente'},3],
    ['clandestine','🕵️',{tr:'gizli',de:'heimlich',fr:'clandestin',es:'clandestino',ru:'тайный',zh:'秘密的',ja:'秘密の',it:'clandestino',ar:'سري',ko:'은밀한',hi:'गुप्त',pt:'clandestino'},3],
    ['dichotomy','⚖️',{tr:'ikilik',de:'Dichotomie',fr:'dichotomie',es:'dicotomía',ru:'дихотомия',zh:'二分法',ja:'二分法',it:'dicotomia',ar:'ثنائية',ko:'이분법',hi:'द्विभाजन',pt:'dicotomia'},3],
    ['enigmatic','❓',{tr:'esrarengiz',de:'rätselhaft',fr:'énigmatique',es:'enigmático',ru:'загадочный',zh:'神秘的',ja:'謎めいた',it:'enigmatico',ar:'غامض',ko:'수수께끼의',hi:'रहस्यमय',pt:'enigmático'},3],
    ['magnanimous','',{tr:'cömert',de:'großmütig',fr:'magnanime',es:'magnánimo',ru:'великодушный',zh:'宽宏大量',ja:'寛大な',it:'magnanimo',ar:'كريم',ko:'관대한',hi:'उदार',pt:'magnânimo'},3],
    ['precarious','',{tr:'tehlikeli',de:'prekär',fr:'précaire',es:'precario',ru:'ненадёжный',zh:'不稳定的',ja:'不安定な',it:'precario',ar:'محفوف بالمخاطر',ko:'불안정한',hi:'अनिश्चित',pt:'precário'},3],
    ['sycophant','',{tr:'dalkavuk',de:'Schmeichler',fr:'flagorneur',es:'adulador',ru:'подхалим',zh:'谄媚者',ja:'おべっか使い',it:'adulatore',ar:'متملق',ko:'아첨꾼',hi:'चापलूस',pt:'bajulador'},3],
    ['anachronism','',{tr:'anakronizm',de:'Anachronismus',fr:'anachronisme',es:'anacronismo',ru:'анахронизм',zh:'时代错误',ja:'時代錯誤',it:'anacronismo',ar:'مفارقة تاريخية',ko:'시대착오',hi:'कालभ्रम',pt:'anacronismo'},3],
    ['idiosyncrasy','',{tr:'tuhaflık',de:'Eigenart',fr:'idiosyncrasie',es:'idiosincrasia',ru:'идиосинкразия',zh:'特质',ja:'特異性',it:'idiosincrasia',ar:'خصوصية',ko:'특이성',hi:'विलक्षणता',pt:'idiossincrasia'},3],
    ['recalcitrant','',{tr:'inatçı',de:'widerspenstig',fr:'récalcitrant',es:'recalcitrante',ru:'непокорный',zh:'桀骜不驯',ja:'反抗的な',it:'recalcitrante',ar:'عنيد',ko:'반항적인',hi:'हठी',pt:'recalcitrante'},3],
    ['obfuscation','',{tr:'karmaşıklaştırma',de:'Verschleierung',fr:'obfuscation',es:'ofuscación',ru:'запутывание',zh:'混淆',ja:'難読化',it:'offuscamento',ar:'تعتيم',ko:'난독화',hi:'अस्पष्टीकरण',pt:'ofuscação'},3],
    ['perspicacious','',{tr:'keskin zekalı',de:'scharfsinnig',fr:'perspicace',es:'perspicaz',ru:'проницательный',zh:'敏锐的',ja:'洞察力ある',it:'perspicace',ar:'فطن',ko:'통찰력 있는',hi:'सूक्ष्मदर्शी',pt:'perspicaz'},3],
    ['antithesis','',{tr:'karşıtlık',de:'Antithese',fr:'antithèse',es:'antítesis',ru:'антитеза',zh:'对立面',ja:'対立',it:'antitesi',ar:'نقيض',ko:'대립',hi:'विलोम',pt:'antítese'},3],
    ['conflagration','🔥',{tr:'yangın',de:'Großbrand',fr:'conflagration',es:'conflagración',ru:'пожар',zh:'大火',ja:'大火災',it:'conflagrazione',ar:'حريق',ko:'대화재',hi:'महाअग्नि',pt:'conflagração'},3],
    ['diaspora','🌍',{tr:'diaspora',de:'Diaspora',fr:'diaspora',es:'diáspora',ru:'диаспора',zh:'散居',ja:'離散',it:'diaspora',ar:'شتات',ko:'디아스포라',hi:'प्रवासी समुदाय',pt:'diáspora'},3],
    ['egalitarian','',{tr:'eşitlikçi',de:'egalitär',fr:'égalitaire',es:'igualitario',ru:'эгалитарный',zh:'平等主义',ja:'平等主義',it:'egualitario',ar:'مساواتي',ko:'평등주의',hi:'समतावादी',pt:'igualitário'},3],
    ['hegemony','',{tr:'hegemonya',de:'Hegemonie',fr:'hégémonie',es:'hegemonía',ru:'гегемония',zh:'霸权',ja:'覇権',it:'egemonia',ar:'هيمنة',ko:'패권',hi:'वर्चस्व',pt:'hegemonia'},3],
    ['iconoclast','',{tr:'ikonoklast',de:'Ikonoklast',fr:'iconoclaste',es:'iconoclasta',ru:'иконоборец',zh:'偶像破坏者',ja:'因習打破者',it:'iconoclasta',ar:'محطم الأصنام',ko:'우상파괴자',hi:'मूर्तिभंजक',pt:'iconoclasta'},3],
    ['jurisprudence','⚖️',{tr:'hukuk bilimi',de:'Rechtswissenschaft',fr:'jurisprudence',es:'jurisprudencia',ru:'юриспруденция',zh:'法学',ja:'法学',it:'giurisprudenza',ar:'فقه قانوني',ko:'법학',hi:'विधिशास्त्र',pt:'jurisprudência'},3],
    ['nomenclature','',{tr:'terimler',de:'Nomenklatur',fr:'nomenclature',es:'nomenclatura',ru:'номенклатура',zh:'命名法',ja:'命名法',it:'nomenclatura',ar:'تسمية',ko:'명명법',hi:'नामकरण',pt:'nomenclatura'},3],
    ['oligarchy','',{tr:'oligarşi',de:'Oligarchie',fr:'oligarchie',es:'oligarquía',ru:'олигархия',zh:'寡头政治',ja:'寡頭政治',it:'oligarchia',ar:'حكم القلة',ko:'과두정',hi:'कुलीनतंत्र',pt:'oligarquia'},3],
    ['panacea','💊',{tr:'her derde deva',de:'Allheilmittel',fr:'panacée',es:'panacea',ru:'панацея',zh:'万灵药',ja:'万能薬',it:'panacea',ar:'علاج شامل',ko:'만병통치약',hi:'रामबाण',pt:'panaceia'},3],
    ['quagmire','',{tr:'bataklık',de:'Sumpf',fr:'bourbier',es:'atolladero',ru:'трясина',zh:'泥潭',ja:'窮地',it:'pantano',ar:'مستنقع',ko:'수렁',hi:'दलदल',pt:'atoleiro'},3],
    ['surreptitious','',{tr:'gizlice yapılan',de:'heimlich',fr:'subreptice',es:'subrepticio',ru:'тайный',zh:'偷偷摸摸',ja:'こそこそした',it:'furtivo',ar:'خفي',ko:'은밀한',hi:'चोरी-छिपे',pt:'sub-reptício'},3],
    ['tautology','',{tr:'totoloji',de:'Tautologie',fr:'tautologie',es:'tautología',ru:'тавтология',zh:'同义反复',ja:'同語反復',it:'tautologia',ar:'حشو',ko:'동어반복',hi:'पुनरुक्ति',pt:'tautologia'},3],
    ['vicissitude','',{tr:'değişkenlik',de:'Wechselfälle',fr:'vicissitude',es:'vicisitud',ru:'превратность',zh:'变迁',ja:'変転',it:'vicissitudine',ar:'تقلب',ko:'변천',hi:'उतार-चढ़ाव',pt:'vicissitude'},3],
    ['ameliorate','',{tr:'iyileştirmek',de:'verbessern',fr:'améliorer',es:'mejorar',ru:'улучшать',zh:'改善',ja:'改善する',it:'migliorare',ar:'تحسين',ko:'개선하다',hi:'सुधारना',pt:'melhorar'},3],
    ['bellicose','',{tr:'kavgacı',de:'kriegerisch',fr:'belliqueux',es:'belicoso',ru:'воинственный',zh:'好战的',ja:'好戦的な',it:'bellicoso',ar:'محارب',ko:'호전적인',hi:'लड़ाकू',pt:'belicoso'},3],
    ['capitulate','🏳️',{tr:'teslim olmak',de:'kapitulieren',fr:'capituler',es:'capitular',ru:'капитулировать',zh:'投降',ja:'降伏する',it:'capitolare',ar:'استسلام',ko:'항복하다',hi:'समर्पण करना',pt:'capitular'},3],
    ['demagogue','',{tr:'demagog',de:'Demagoge',fr:'démagogue',es:'demagogo',ru:'демагог',zh:'煽动者',ja:'煽動者',it:'demagogo',ar:'ديماغوجي',ko:'선동가',hi:'जनोत्तेजक',pt:'demagogo'},3],
    ['exacerbate','',{tr:'kötüleştirmek',de:'verschlimmern',fr:'exacerber',es:'exacerbar',ru:'обострять',zh:'加剧',ja:'悪化させる',it:'esacerbare',ar:'تفاقم',ko:'악화시키다',hi:'बिगाड़ना',pt:'exacerbar'},3],
    // ── Beginner Set 3 (1) ──
    ['tiger','🐯',{tr:'kaplan',de:'Tiger',fr:'tigre',es:'tigre',ru:'тигр',zh:'老虎',ja:'虎',it:'tigre',ar:'نمر',ko:'호랑이',hi:'बाघ',pt:'tigre'},1],
    ['bear','🐻',{tr:'ayı',de:'Bär',fr:'ours',es:'oso',ru:'медведь',zh:'熊',ja:'熊',it:'orso',ar:'دب',ko:'곰',hi:'भालू',pt:'urso'},1],
    ['monkey','🐒',{tr:'maymun',de:'Affe',fr:'singe',es:'mono',ru:'обезьяна',zh:'猴子',ja:'猿',it:'scimmia',ar:'قرد',ko:'원숭이',hi:'बंदर',pt:'macaco'},1],
    ['snake','🐍',{tr:'yılan',de:'Schlange',fr:'serpent',es:'serpiente',ru:'змея',zh:'蛇',ja:'蛇',it:'serpente',ar:'ثعبان',ko:'뱀',hi:'सांप',pt:'cobra'},1],
    ['spider','🕷️',{tr:'örümcek',de:'Spinne',fr:'araignée',es:'araña',ru:'паук',zh:'蜘蛛',ja:'蜘蛛',it:'ragno',ar:'عنكبوت',ko:'거미',hi:'मकड़ी',pt:'aranha'},1],
    ['rabbit','🐰',{tr:'tavşan',de:'Kaninchen',fr:'lapin',es:'conejo',ru:'кролик',zh:'兔子',ja:'ウサギ',it:'coniglio',ar:'أرنب',ko:'토끼',hi:'खरगोश',pt:'coelho'},1],
    ['elephant','🐘',{tr:'fil',de:'Elefant',fr:'éléphant',es:'elefante',ru:'слон',zh:'大象',ja:'象',it:'elefante',ar:'فيل',ko:'코끼리',hi:'हाथी',pt:'elefante'},1],
    ['wolf','🐺',{tr:'kurt',de:'Wolf',fr:'loup',es:'lobo',ru:'волк',zh:'狼',ja:'狼',it:'lupo',ar:'ذئب',ko:'늑대',hi:'भेड़िया',pt:'lobo'},1],
    ['train','🚂',{tr:'tren',de:'Zug',fr:'train',es:'tren',ru:'поезд',zh:'火车',ja:'電車',it:'treno',ar:'قطار',ko:'기차',hi:'ट्रेन',pt:'trem'},1],
    ['airplane','✈️',{tr:'uçak',de:'Flugzeug',fr:'avion',es:'avión',ru:'самолёт',zh:'飞机',ja:'飛行機',it:'aereo',ar:'طائرة',ko:'비행기',hi:'हवाई जहाज़',pt:'avião'},1],
    ['bicycle','🚲',{tr:'bisiklet',de:'Fahrrad',fr:'vélo',es:'bicicleta',ru:'велосипед',zh:'自行车',ja:'自転車',it:'bicicletta',ar:'دراجة',ko:'자전거',hi:'साइकिल',pt:'bicicleta'},1],
    ['boat','⛵',{tr:'tekne',de:'Boot',fr:'bateau',es:'barco',ru:'лодка',zh:'船',ja:'船',it:'barca',ar:'قارب',ko:'배',hi:'नाव',pt:'barco'},1],
    ['umbrella','☂️',{tr:'şemsiye',de:'Regenschirm',fr:'parapluie',es:'paraguas',ru:'зонт',zh:'雨伞',ja:'傘',it:'ombrello',ar:'مظلة',ko:'우산',hi:'छाता',pt:'guarda-chuva'},1],
    ['camera','📷',{tr:'kamera',de:'Kamera',fr:'caméra',es:'cámara',ru:'камера',zh:'相机',ja:'カメラ',it:'fotocamera',ar:'كاميرا',ko:'카메라',hi:'कैमरा',pt:'câmera'},1],
    ['guitar','🎸',{tr:'gitar',de:'Gitarre',fr:'guitare',es:'guitarra',ru:'гитара',zh:'吉他',ja:'ギター',it:'chitarra',ar:'غيتار',ko:'기타',hi:'गिटार',pt:'guitarra'},1],
    ['bridge','🌉',{tr:'köprü',de:'Brücke',fr:'pont',es:'puente',ru:'мост',zh:'桥',ja:'橋',it:'ponte',ar:'جسر',ko:'다리',hi:'पुल',pt:'ponte'},1],
    ['beach','🏖️',{tr:'plaj',de:'Strand',fr:'plage',es:'playa',ru:'пляж',zh:'海滩',ja:'ビーチ',it:'spiaggia',ar:'شاطئ',ko:'해변',hi:'समुद्र तट',pt:'praia'},1],
    ['winter','❄️',{tr:'kış',de:'Winter',fr:'hiver',es:'invierno',ru:'зима',zh:'冬天',ja:'冬',it:'inverno',ar:'شتاء',ko:'겨울',hi:'सर्दी',pt:'inverno'},1],
    ['summer','☀️',{tr:'yaz',de:'Sommer',fr:'été',es:'verano',ru:'лето',zh:'夏天',ja:'夏',it:'estate',ar:'صيف',ko:'여름',hi:'गर्मी',pt:'verão'},1],
    ['spring','🌷',{tr:'ilkbahar',de:'Frühling',fr:'printemps',es:'primavera',ru:'весна',zh:'春天',ja:'春',it:'primavera',ar:'ربيع',ko:'봄',hi:'वसंत',pt:'primavera'},1],
    ['autumn','🍂',{tr:'sonbahar',de:'Herbst',fr:'automne',es:'otoño',ru:'осень',zh:'秋天',ja:'秋',it:'autunno',ar:'خريف',ko:'가을',hi:'पतझड़',pt:'outono'},1],
    ['nose','👃',{tr:'burun',de:'Nase',fr:'nez',es:'nariz',ru:'нос',zh:'鼻子',ja:'鼻',it:'naso',ar:'أنف',ko:'코',hi:'नाक',pt:'nariz'},1],
    ['finger','☝️',{tr:'parmak',de:'Finger',fr:'doigt',es:'dedo',ru:'палец',zh:'手指',ja:'指',it:'dito',ar:'إصبع',ko:'손가락',hi:'उंगली',pt:'dedo'},1],
    ['neck','',{tr:'boyun',de:'Hals',fr:'cou',es:'cuello',ru:'шея',zh:'脖子',ja:'首',it:'collo',ar:'رقبة',ko:'목',hi:'गर्दन',pt:'pescoço'},1],
    ['shoulder','💪',{tr:'omuz',de:'Schulter',fr:'épaule',es:'hombro',ru:'плечо',zh:'肩膀',ja:'肩',it:'spalla',ar:'كتف',ko:'어깨',hi:'कंधा',pt:'ombro'},1],
    ['stomach','',{tr:'mide',de:'Magen',fr:'estomac',es:'estómago',ru:'желудок',zh:'胃',ja:'胃',it:'stomaco',ar:'معدة',ko:'위',hi:'पेट',pt:'estômago'},1],
    ['banana','🍌',{tr:'muz',de:'Banane',fr:'banane',es:'plátano',ru:'банан',zh:'香蕉',ja:'バナナ',it:'banana',ar:'موز',ko:'바나나',hi:'केला',pt:'banana'},1],
    ['orange','🍊',{tr:'portakal',de:'Orange',fr:'orange',es:'naranja',ru:'апельсин',zh:'橙子',ja:'オレンジ',it:'arancia',ar:'برتقال',ko:'오렌지',hi:'संतरा',pt:'laranja'},1],
    ['grape','🍇',{tr:'üzüm',de:'Traube',fr:'raisin',es:'uva',ru:'виноград',zh:'葡萄',ja:'ブドウ',it:'uva',ar:'عنب',ko:'포도',hi:'अंगूर',pt:'uva'},1],
    ['tomato','🍅',{tr:'domates',de:'Tomate',fr:'tomate',es:'tomate',ru:'помидор',zh:'番茄',ja:'トマト',it:'pomodoro',ar:'طماطم',ko:'토마토',hi:'टमाटर',pt:'tomate'},1],
    ['onion','🧅',{tr:'soğan',de:'Zwiebel',fr:'oignon',es:'cebolla',ru:'лук',zh:'洋葱',ja:'タマネギ',it:'cipolla',ar:'بصل',ko:'양파',hi:'प्याज',pt:'cebola'},1],
    ['potato','🥔',{tr:'patates',de:'Kartoffel',fr:'pomme de terre',es:'patata',ru:'картофель',zh:'土豆',ja:'ジャガイモ',it:'patata',ar:'بطاطس',ko:'감자',hi:'आलू',pt:'batata'},1],
    ['chicken','🐔',{tr:'tavuk',de:'Huhn',fr:'poulet',es:'pollo',ru:'курица',zh:'鸡',ja:'鶏',it:'pollo',ar:'دجاج',ko:'닭',hi:'मुर्गी',pt:'frango'},1],
    ['butter','🧈',{tr:'tereyağı',de:'Butter',fr:'beurre',es:'mantequilla',ru:'масло',zh:'黄油',ja:'バター',it:'burro',ar:'زبدة',ko:'버터',hi:'मक्खन',pt:'manteiga'},1],
    // ── Intermediate Set 3 (2) ──
    ['ambition','🎯',{tr:'hırs',de:'Ehrgeiz',fr:'ambition',es:'ambición',ru:'амбиция',zh:'抱负',ja:'野心',it:'ambizione',ar:'طموح',ko:'야망',hi:'महत्वाकांक्षा',pt:'ambição'},2],
    ['revenge','⚔️',{tr:'intikam',de:'Rache',fr:'vengeance',es:'venganza',ru:'месть',zh:'复仇',ja:'復讐',it:'vendetta',ar:'انتقام',ko:'복수',hi:'बदला',pt:'vingança'},2],
    ['destiny','🔮',{tr:'kader',de:'Schicksal',fr:'destin',es:'destino',ru:'судьба',zh:'命运',ja:'運命',it:'destino',ar:'قدر',ko:'운명',hi:'भाग्य',pt:'destino'},2],
    ['poverty','',{tr:'yoksulluk',de:'Armut',fr:'pauvreté',es:'pobreza',ru:'бедность',zh:'贫困',ja:'貧困',it:'povertà',ar:'فقر',ko:'빈곤',hi:'गरीबी',pt:'pobreza'},2],
    ['wealth','💎',{tr:'zenginlik',de:'Reichtum',fr:'richesse',es:'riqueza',ru:'богатство',zh:'财富',ja:'富',it:'ricchezza',ar:'ثروة',ko:'부',hi:'धन',pt:'riqueza'},2],
    ['gravity','🌍',{tr:'yerçekimi',de:'Schwerkraft',fr:'gravité',es:'gravedad',ru:'гравитация',zh:'重力',ja:'重力',it:'gravità',ar:'جاذبية',ko:'중력',hi:'गुरुत्वाकर्षण',pt:'gravidade'},2],
    ['oxygen','💨',{tr:'oksijen',de:'Sauerstoff',fr:'oxygène',es:'oxígeno',ru:'кислород',zh:'氧气',ja:'酸素',it:'ossigeno',ar:'أكسجين',ko:'산소',hi:'ऑक्सीजन',pt:'oxigênio'},2],
    ['atmosphere','🌐',{tr:'atmosfer',de:'Atmosphäre',fr:'atmosphère',es:'atmósfera',ru:'атмосфера',zh:'大气',ja:'大気',it:'atmosfera',ar:'غلاف جوي',ko:'대기',hi:'वायुमंडल',pt:'atmosfera'},2],
    ['skeleton','💀',{tr:'iskelet',de:'Skelett',fr:'squelette',es:'esqueleto',ru:'скелет',zh:'骨骼',ja:'骸骨',it:'scheletro',ar:'هيكل عظمي',ko:'골격',hi:'कंकाल',pt:'esqueleto'},2],
    ['manuscript','📜',{tr:'el yazması',de:'Manuskript',fr:'manuscrit',es:'manuscrito',ru:'рукопись',zh:'手稿',ja:'原稿',it:'manoscritto',ar:'مخطوطة',ko:'원고',hi:'पांडुलिपि',pt:'manuscrito'},2],
    ['telescope','🔭',{tr:'teleskop',de:'Teleskop',fr:'télescope',es:'telescopio',ru:'телескоп',zh:'望远镜',ja:'望遠鏡',it:'telescopio',ar:'تلسكوب',ko:'망원경',hi:'दूरबीन',pt:'telescópio'},2],
    ['cathedral','⛪',{tr:'katedral',de:'Kathedrale',fr:'cathédrale',es:'catedral',ru:'собор',zh:'大教堂',ja:'大聖堂',it:'cattedrale',ar:'كاتدرائية',ko:'대성당',hi:'गिरजाघर',pt:'catedral'},2],
    ['currency','💵',{tr:'para birimi',de:'Währung',fr:'monnaie',es:'moneda',ru:'валюта',zh:'货币',ja:'通貨',it:'valuta',ar:'عملة',ko:'통화',hi:'मुद्रा',pt:'moeda'},2],
    ['continent','🗺️',{tr:'kıta',de:'Kontinent',fr:'continent',es:'continente',ru:'континент',zh:'大陆',ja:'大陸',it:'continente',ar:'قارة',ko:'대륙',hi:'महाद्वीप',pt:'continente'},2],
    ['pyramid','🔺',{tr:'piramit',de:'Pyramide',fr:'pyramide',es:'pirámide',ru:'пирамида',zh:'金字塔',ja:'ピラミッド',it:'piramide',ar:'هرم',ko:'피라미드',hi:'पिरामिड',pt:'pirâmide'},2],
    ['compass','🧭',{tr:'pusula',de:'Kompass',fr:'boussole',es:'brújula',ru:'компас',zh:'指南针',ja:'コンパス',it:'bussola',ar:'بوصلة',ko:'나침반',hi:'दिशासूचक',pt:'bússola'},2],
    ['universe','🌌',{tr:'evren',de:'Universum',fr:'univers',es:'universo',ru:'вселенная',zh:'宇宙',ja:'宇宙',it:'universo',ar:'كون',ko:'우주',hi:'ब्रह्मांड',pt:'universo'},2],
    ['earthquake','🌍',{tr:'deprem',de:'Erdbeben',fr:'tremblement de terre',es:'terremoto',ru:'землетрясение',zh:'地震',ja:'地震',it:'terremoto',ar:'زلزال',ko:'지진',hi:'भूकंप',pt:'terremoto'},2],
    ['hurricane','🌪️',{tr:'kasırga',de:'Hurrikan',fr:'ouragan',es:'huracán',ru:'ураган',zh:'飓风',ja:'ハリケーン',it:'uragano',ar:'إعصار',ko:'허리케인',hi:'तूफ़ान',pt:'furacão'},2],
    ['revolution','✊',{tr:'devrim',de:'Revolution',fr:'révolution',es:'revolución',ru:'революция',zh:'革命',ja:'革命',it:'rivoluzione',ar:'ثورة',ko:'혁명',hi:'क्रांति',pt:'revolução'},2],
    ['epidemic','🦠',{tr:'salgın',de:'Epidemie',fr:'épidémie',es:'epidemia',ru:'эпидемия',zh:'流行病',ja:'流行病',it:'epidemia',ar:'وباء',ko:'전염병',hi:'महामारी',pt:'epidemia'},2],
    ['monument','🗽',{tr:'anıt',de:'Denkmal',fr:'monument',es:'monumento',ru:'памятник',zh:'纪念碑',ja:'記念碑',it:'monumento',ar:'نصب تذكاري',ko:'기념비',hi:'स्मारक',pt:'monumento'},2],
    ['democracy','🗳️',{tr:'demokrasi',de:'Demokratie',fr:'démocratie',es:'democracia',ru:'демократия',zh:'民主',ja:'民主主義',it:'democrazia',ar:'ديمقراطية',ko:'민주주의',hi:'लोकतंत्र',pt:'democracia'},2],
    ['evolution','🧬',{tr:'evrim',de:'Evolution',fr:'évolution',es:'evolución',ru:'эволюция',zh:'进化',ja:'進化',it:'evoluzione',ar:'تطور',ko:'진화',hi:'विकास',pt:'evolução'},2],
    ['archaeology','🏺',{tr:'arkeoloji',de:'Archäologie',fr:'archéologie',es:'arqueología',ru:'археология',zh:'考古学',ja:'考古学',it:'archeologia',ar:'علم الآثار',ko:'고고학',hi:'पुरातत्व',pt:'arqueologia'},2],
    ['mythology','🏛️',{tr:'mitoloji',de:'Mythologie',fr:'mythologie',es:'mitología',ru:'мифология',zh:'神话',ja:'神話',it:'mitologia',ar:'أساطير',ko:'신화',hi:'पौराणिक कथा',pt:'mitologia'},2],
    ['philosophy','📖',{tr:'felsefe',de:'Philosophie',fr:'philosophie',es:'filosofía',ru:'философия',zh:'哲学',ja:'哲学',it:'filosofia',ar:'فلسفة',ko:'철학',hi:'दर्शनशास्त्र',pt:'filosofia'},2],
    // ── Advanced Set 3 (3) ──
    ['acquiesce','',{tr:'kabullenmek',de:'einwilligen',fr:'acquiescer',es:'consentir',ru:'уступать',zh:'默许',ja:'黙認する',it:'acconsentire',ar:'إذعان',ko:'묵인하다',hi:'मान लेना',pt:'aquiescer'},3],
    ['cacophony','🔊',{tr:'kakofoni',de:'Kakophonie',fr:'cacophonie',es:'cacofonía',ru:'какофония',zh:'刺耳声',ja:'不協和音',it:'cacofonia',ar:'نشاز',ko:'불협화음',hi:'कर्कश ध्वनि',pt:'cacofonia'},3],
    ['debilitate','',{tr:'zayıflatmak',de:'schwächen',fr:'débiliter',es:'debilitar',ru:'ослаблять',zh:'使衰弱',ja:'衰弱させる',it:'debilitare',ar:'إضعاف',ko:'약화시키다',hi:'कमज़ोर करना',pt:'debilitar'},3],
    ['ebullient','🎉',{tr:'coşkulu',de:'überschwänglich',fr:'exubérant',es:'eufórico',ru:'кипучий',zh:'热情洋溢',ja:'熱狂的な',it:'esuberante',ar:'متحمس',ko:'열정적인',hi:'उत्साही',pt:'efervescente'},3],
    ['fallacious','',{tr:'yanıltıcı',de:'trügerisch',fr:'fallacieux',es:'falaz',ru:'ложный',zh:'谬误的',ja:'誤った',it:'fallace',ar:'مغالط',ko:'오류의',hi:'भ्रामक',pt:'falacioso'},3],
    ['galvanize','⚡',{tr:'harekete geçirmek',de:'galvanisieren',fr:'galvaniser',es:'galvanizar',ru:'вдохновлять',zh:'激励',ja:'鼓舞する',it:'galvanizzare',ar:'تحفيز',ko:'자극하다',hi:'प्रेरित करना',pt:'galvanizar'},3],
    ['hubris','',{tr:'kibir',de:'Hybris',fr:'hubris',es:'arrogancia',ru:'высокомерие',zh:'傲慢',ja:'傲慢',it:'arroganza',ar:'غطرسة',ko:'오만',hi:'अहंकार',pt:'arrogância'},3],
    ['impervious','🛡️',{tr:'etkilenmez',de:'undurchlässig',fr:'imperméable',es:'impermeable',ru:'непроницаемый',zh:'不受影响',ja:'影響されない',it:'impermeabile',ar:'منيع',ko:'영향받지 않는',hi:'अप्रभावित',pt:'impermeável'},3],
    ['jettison','',{tr:'fırlatmak',de:'abwerfen',fr:'jeter',es:'deshacerse',ru:'выбрасывать',zh:'抛弃',ja:'投棄する',it:'gettare',ar:'التخلص من',ko:'내던지다',hi:'फेंक देना',pt:'descartar'},3],
    ['laconic','',{tr:'az sözlü',de:'lakonisch',fr:'laconique',es:'lacónico',ru:'лаконичный',zh:'简洁的',ja:'簡潔な',it:'laconico',ar:'مقتضب',ko:'간결한',hi:'संक्षिप्त',pt:'lacônico'},3],
    ['machination','',{tr:'entrika',de:'Machenschaft',fr:'machination',es:'maquinación',ru:'махинация',zh:'阴谋',ja:'策略',it:'macchinazione',ar:'مكيدة',ko:'음모',hi:'षड्यंत्र',pt:'maquinação'},3],
    ['nefarious','',{tr:'habis',de:'ruchlos',fr:'néfaste',es:'nefasto',ru:'гнусный',zh:'邪恶的',ja:'極悪な',it:'nefando',ar:'شنيع',ko:'사악한',hi:'दुष्ट',pt:'nefário'},3],
    ['obsequious','',{tr:'yaltakçı',de:'unterwürfig',fr:'obséquieux',es:'servil',ru:'подобострастный',zh:'谄媚的',ja:'卑屈な',it:'ossequioso',ar:'متذلل',ko:'아첨하는',hi:'खुशामदी',pt:'obsequioso'},3],
    ['pernicious','',{tr:'zararlı',de:'verderblich',fr:'pernicieux',es:'pernicioso',ru:'пагубный',zh:'有害的',ja:'有害な',it:'pernicioso',ar:'مؤذي',ko:'해로운',hi:'हानिकारक',pt:'pernicioso'},3],
    ['quixotic','',{tr:'hayalperest',de:'quixotisch',fr:'quichottesque',es:'quijotesco',ru:'донкихотский',zh:'不切实际',ja:'空想的な',it:'donchisciottesco',ar:'خيالي',ko:'비현실적인',hi:'कल्पनाप्रवण',pt:'quixotesco'},3],
    ['recondite','',{tr:'anlaşılmaz',de:'abstruse',fr:'abscons',es:'recóndito',ru:'сокровенный',zh:'深奥的',ja:'難解な',it:'recondito',ar:'غامض',ko:'심오한',hi:'गूढ़',pt:'recôndito'},3],
    ['sanguine','😊',{tr:'iyimser',de:'zuversichtlich',fr:'optimiste',es:'sanguíneo',ru:'оптимистичный',zh:'乐观的',ja:'楽観的な',it:'ottimista',ar:'متفائل',ko:'낙관적인',hi:'आशावादी',pt:'otimista'},3],
    ['truculent','',{tr:'saldırgan',de:'streitlustig',fr:'truculent',es:'truculento',ru:'свирепый',zh:'凶暴的',ja:'攻撃的な',it:'truculento',ar:'شرس',ko:'호전적인',hi:'उग्र',pt:'truculento'},3],
    ['ubiquitous','🌐',{tr:'her yerde bulunan',de:'allgegenwärtig',fr:'omniprésent',es:'ubicuo',ru:'вездесущий',zh:'无处不在',ja:'遍在する',it:'onnipresente',ar:'في كل مكان',ko:'어디에나 있는',hi:'सर्वव्यापी',pt:'onipresente'},3],
    ['verisimilitude','',{tr:'gerçeğe yakınlık',de:'Wahrscheinlichkeit',fr:'vraisemblance',es:'verosimilitud',ru:'правдоподобие',zh:'逼真',ja:'迫真性',it:'verosimiglianza',ar:'مصداقية',ko:'사실성',hi:'यथार्थता',pt:'verossimilhança'},3],
    ['weltanschauung','',{tr:'dünya görüşü',de:'Weltanschauung',fr:'vision du monde',es:'cosmovisión',ru:'мировоззрение',zh:'世界观',ja:'世界観',it:'visione del mondo',ar:'نظرة للعالم',ko:'세계관',hi:'विश्वदृष्टि',pt:'visão de mundo'},3],
    ['xeric','🏜️',{tr:'kurak',de:'trocken',fr:'xérique',es:'xérico',ru:'засушливый',zh:'干旱的',ja:'乾燥した',it:'xerico',ar:'جاف',ko:'건조한',hi:'शुष्क',pt:'xérico'},3],
    ['zealot','',{tr:'fanatik',de:'Eiferer',fr:'zélote',es:'fanático',ru:'фанатик',zh:'狂热者',ja:'熱狂者',it:'fanatico',ar:'متعصب',ko:'광신자',hi:'कट्टर',pt:'fanático'},3],
    ['apocryphal','',{tr:'uydurma',de:'apokryph',fr:'apocryphe',es:'apócrifo',ru:'апокрифический',zh:'伪经的',ja:'外典の',it:'apocrifo',ar:'ملفق',ko:'위경의',hi:'संदिग्ध',pt:'apócrifo'},3],
    ['blandishment','',{tr:'pohpoh',de:'Schmeichelei',fr:'cajolerie',es:'halago',ru:'лесть',zh:'奉承',ja:'お世辞',it:'lusinghe',ar:'تملق',ko:'감언이설',hi:'चापलूसी',pt:'lisonja'},3],
    ['corroborate','',{tr:'doğrulamak',de:'bestätigen',fr:'corroborer',es:'corroborar',ru:'подтверждать',zh:'证实',ja:'裏付ける',it:'corroborare',ar:'تأكيد',ko:'확증하다',hi:'पुष्टि करना',pt:'corroborar'},3],
    ['diatribe','',{tr:'ağır eleştiri',de:'Hetzrede',fr:'diatribe',es:'diatriba',ru:'диатриба',zh:'抨击',ja:'痛烈な批判',it:'diatriba',ar:'خطبة هجومية',ko:'통렬한 비판',hi:'कटु भाषण',pt:'diatribe'},3],
    ['enervate','',{tr:'güçsüzleştirmek',de:'entkräften',fr:'énerver',es:'enervar',ru:'обессилить',zh:'使无力',ja:'衰弱させる',it:'snervare',ar:'إنهاك',ko:'기력을 빼다',hi:'शक्तिहीन करना',pt:'enervar'},3],
    ['fractious','',{tr:'huysuz',de:'widerspenstig',fr:'récalcitrant',es:'díscolo',ru:'вздорный',zh:'易怒的',ja:'気難しい',it:'irascibile',ar:'سريع الغضب',ko:'성마른',hi:'चिड़चिड़ा',pt:'irascível'},3],
    ['grandiloquent','',{tr:'tumturaklı',de:'großsprecherisch',fr:'grandiloquent',es:'grandilocuente',ru:'напыщенный',zh:'夸大的',ja:'大げさな',it:'magniloquente',ar:'متفخم',ko:'거창한',hi:'आडंबरपूर्ण',pt:'grandiloquente'},3],
    ['hermetic','',{tr:'sızdırmaz',de:'hermetisch',fr:'hermétique',es:'hermético',ru:'герметичный',zh:'密封的',ja:'密閉された',it:'ermetico',ar:'محكم',ko:'밀봉된',hi:'वायुरोधी',pt:'hermético'},3],
    ['inscrutable','',{tr:'anlaşılmaz',de:'unergründlich',fr:'inscrutable',es:'inescrutable',ru:'непостижимый',zh:'高深莫测',ja:'不可解な',it:'imperscrutabile',ar:'غامض',ko:'헤아릴 수 없는',hi:'अगम्य',pt:'inescrutável'},3]
  ];

  const DIFF_LABELS = {
    tr: { 1:'Kolay', 2:'Orta', 3:'Zor', all:'Tümü', known:'Biliyorum', unknown:'Bilmiyorum', flip:'Çevir', next:'Sonraki', prev:'Önceki', score:'Skor', of:'/', reset:'Sıfırla', title:'İngilizce Kartlar' },
    en: { 1:'Easy', 2:'Medium', 3:'Hard', all:'All', known:'I Know', unknown:"Don't Know", flip:'Flip', next:'Next', prev:'Previous', score:'Score', of:'/', reset:'Reset', title:'English Cards' },
    de: { 1:'Leicht', 2:'Mittel', 3:'Schwer', all:'Alle', known:'Weiß ich', unknown:'Weiß nicht', flip:'Umdrehen', next:'Nächste', prev:'Vorherige', score:'Punkte', of:'/', reset:'Zurücksetzen', title:'Englisch-Karten' },
    fr: { 1:'Facile', 2:'Moyen', 3:'Difficile', all:'Tout', known:'Je sais', unknown:'Je ne sais pas', flip:'Retourner', next:'Suivant', prev:'Précédent', score:'Score', of:'/', reset:'Réinitialiser', title:'Cartes Anglais' },
    es: { 1:'Fácil', 2:'Medio', 3:'Difícil', all:'Todos', known:'Lo sé', unknown:'No sé', flip:'Voltear', next:'Siguiente', prev:'Anterior', score:'Puntos', of:'/', reset:'Reiniciar', title:'Tarjetas Inglés' },
    ru: { 1:'Легко', 2:'Средне', 3:'Сложно', all:'Все', known:'Знаю', unknown:'Не знаю', flip:'Перевернуть', next:'Следующая', prev:'Предыдущая', score:'Счёт', of:'/', reset:'Сброс', title:'Английские карточки' },
    zh: { 1:'简单', 2:'中等', 3:'困难', all:'全部', known:'我知道', unknown:'不知道', flip:'翻转', next:'下一个', prev:'上一个', score:'分数', of:'/', reset:'重置', title:'英语卡片' },
    ja: { 1:'簡単', 2:'普通', 3:'難しい', all:'全て', known:'知ってる', unknown:'知らない', flip:'めくる', next:'次へ', prev:'前へ', score:'スコア', of:'/', reset:'リセット', title:'英語カード' },
    it: { 1:'Facile', 2:'Medio', 3:'Difficile', all:'Tutti', known:'Lo so', unknown:'Non so', flip:'Gira', next:'Successiva', prev:'Precedente', score:'Punteggio', of:'/', reset:'Ripristina', title:'Carte Inglese' },
    ar: { 1:'سهل', 2:'متوسط', 3:'صعب', all:'الكل', known:'أعرف', unknown:'لا أعرف', flip:'اقلب', next:'التالي', prev:'السابق', score:'النتيجة', of:'/', reset:'إعادة', title:'بطاقات إنجليزية' },
    ko: { 1:'쉬움', 2:'보통', 3:'어려움', all:'전체', known:'알아요', unknown:'몰라요', flip:'뒤집기', next:'다음', prev:'이전', score:'점수', of:'/', reset:'초기화', title:'영어 카드' },
    hi: { 1:'आसान', 2:'मध्यम', 3:'कठिन', all:'सभी', known:'मुझे पता है', unknown:'नहीं पता', flip:'पलटें', next:'अगला', prev:'पिछला', score:'स्कोर', of:'/', reset:'रीसेट', title:'अंग्रेज़ी कार्ड' },
    pt: { 1:'Fácil', 2:'Médio', 3:'Difícil', all:'Todos', known:'Eu sei', unknown:'Não sei', flip:'Virar', next:'Próximo', prev:'Anterior', score:'Pontuação', of:'/', reset:'Reiniciar', title:'Cartões de Inglês' }
  };

  return {
    setup(props) {
      const lang = ref((props.settings && props.settings.lang) || 'tr');
      const L = computed(() => DIFF_LABELS[lang.value] || DIFF_LABELS.en);
      const t = (k) => L.value[k] || k;

      function onLocaleChanged(e) { lang.value = e.detail || 'tr'; }

      const difficulty = ref(0); // 0=all
      const flipped = ref(false);
      const idx = ref(0);
      const known = ref(0);
      const unknown = ref(0);
      const answered = ref({});

      const filtered = computed(() => {
        const d = difficulty.value;
        return d === 0 ? WORDS : WORDS.filter(w => w[3] === d);
      });
      const total = computed(() => filtered.value.length);
      const current = computed(() => filtered.value[idx.value] || null);
      const emoji = computed(() => current.value ? current.value[1] : '');
      const enWord = computed(() => current.value ? current.value[0] : '');
      const localWord = computed(() => {
        if (!current.value) return '';
        const tr = current.value[2];
        return tr[lang.value] || tr.tr || current.value[0];
      });
      const diffLevel = computed(() => current.value ? current.value[3] : 1);

      function setDifficulty(d) { difficulty.value = d; idx.value = 0; flipped.value = false; known.value = 0; unknown.value = 0; answered.value = {}; }
      function flip() { flipped.value = !flipped.value; }
      function next() { if (idx.value < total.value - 1) { idx.value++; flipped.value = false; } }
      function prev() { if (idx.value > 0) { idx.value--; flipped.value = false; } }
      function markKnown() {
        if (!answered.value[idx.value]) { known.value++; answered.value[idx.value] = 'k'; }
        next();
      }
      function markUnknown() {
        if (!answered.value[idx.value]) { unknown.value++; answered.value[idx.value] = 'u'; }
        flipped.value = true;
      }
      function reset() { idx.value = 0; flipped.value = false; known.value = 0; unknown.value = 0; answered.value = {}; }
      function shuffle() {
        const arr = filtered.value;
        for (var i = arr.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
        }
        reset();
      }

      onMounted(() => { window.addEventListener('locale-changed', onLocaleChanged); });
      onUnmounted(() => { window.removeEventListener('locale-changed', onLocaleChanged); });

      return { lang, t, difficulty, flipped, idx, known, unknown, total, current, emoji, enWord, localWord, diffLevel, filtered, setDifficulty, flip, next, prev, markKnown, markUnknown, reset, shuffle, answered };
    }
  };
})(Vue);
