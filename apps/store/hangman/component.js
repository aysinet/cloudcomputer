(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, nextTick } = Vue;

  /* ───── UI translations ───── */
  const LANGS = {
    tr: { title:'Adam Asmaca', subtitle:'Kelimeyi tahmin edin!', start:'Başla', wins:'Kazanma', losses:'Kayıp', wordLang:'Kelime Dili', youWon:'Tebrikler!', youLost:'Kaybettiniz!', theWord:'Kelime şuydu:', playAgain:'Tekrar Oyna', tryAgain:'Tekrar Dene', hint:'İpucu' },
    en: { title:'Hangman', subtitle:'Guess the hidden word!', start:'Start', wins:'Wins', losses:'Losses', wordLang:'Word Lang', youWon:'You Won!', youLost:'You Lost!', theWord:'The word was:', playAgain:'Play Again', tryAgain:'Try Again', hint:'Hint' },
    de: { title:'Galgenmännchen', subtitle:'Errate das Wort!', start:'Start', wins:'Siege', losses:'Niederl.', wordLang:'Wortsprache', youWon:'Gewonnen!', youLost:'Verloren!', theWord:'Das Wort war:', playAgain:'Nochmal', tryAgain:'Nochmal', hint:'Hinweis' },
    fr: { title:'Pendu', subtitle:'Devinez le mot caché !', start:'Jouer', wins:'Victoires', losses:'Défaites', wordLang:'Langue', youWon:'Gagné !', youLost:'Perdu !', theWord:'Le mot était :', playAgain:'Rejouer', tryAgain:'Réessayer', hint:'Indice' },
    es: { title:'Ahorcado', subtitle:'¡Adivina la palabra!', start:'Jugar', wins:'Victorias', losses:'Derrotas', wordLang:'Idioma', youWon:'¡Ganaste!', youLost:'¡Perdiste!', theWord:'La palabra era:', playAgain:'Otra vez', tryAgain:'Reintentar', hint:'Pista' },
    ru: { title:'Виселица', subtitle:'Угадайте слово!', start:'Старт', wins:'Побед', losses:'Пораж.', wordLang:'Язык слов', youWon:'Победа!', youLost:'Поражение!', theWord:'Слово было:', playAgain:'Ещё раз', tryAgain:'Заново', hint:'Подсказка' },
    zh: { title:'猜单词', subtitle:'猜出隐藏的单词！', start:'开始', wins:'胜', losses:'负', wordLang:'词语语言', youWon:'你赢了！', youLost:'你输了！', theWord:'答案是：', playAgain:'再来一局', tryAgain:'重试', hint:'提示' },
    ja: { title:'ハングマン', subtitle:'隠された言葉を当てよう！', start:'スタート', wins:'勝ち', losses:'負け', wordLang:'言語', youWon:'勝利！', youLost:'残念！', theWord:'正解は：', playAgain:'もう一度', tryAgain:'再挑戦', hint:'ヒント' },
    it: { title:'Impiccato', subtitle:'Indovina la parola!', start:'Gioca', wins:'Vittorie', losses:'Sconfitte', wordLang:'Lingua', youWon:'Hai Vinto!', youLost:'Hai Perso!', theWord:'La parola era:', playAgain:'Rigioca', tryAgain:'Riprova', hint:'Suggerimento' },
    pt: { title:'Forca', subtitle:'Adivinhe a palavra!', start:'Jogar', wins:'Vitórias', losses:'Derrotas', wordLang:'Idioma', youWon:'Ganhou!', youLost:'Perdeu!', theWord:'A palavra era:', playAgain:'Jogar de Novo', tryAgain:'Tentar de Novo', hint:'Dica' },
    ar: { title:'الرجل المشنوق', subtitle:'خمن الكلمة المخفية!', start:'ابدأ', wins:'فوز', losses:'خسارة', wordLang:'لغة الكلمة', youWon:'فزت!', youLost:'خسرت!', theWord:'الكلمة كانت:', playAgain:'العب مجدداً', tryAgain:'حاول مجدداً', hint:'تلميح' },
    ko: { title:'행맨', subtitle:'숨겨진 단어를 맞춰보세요!', start:'시작', wins:'승', losses:'패', wordLang:'단어 언어', youWon:'승리!', youLost:'패배!', theWord:'정답:', playAgain:'다시 하기', tryAgain:'재도전', hint:'힌트' }
  };

  /* ───── Word banks per language with categories ───── */
  const WORD_BANKS = {
    tr: [
      { cat: 'Hayvanlar', words: ['kelebek','timsah','penguen','kartal','sincap','yunus','flamingo','kamelya','jaguar','pelikan','papagan','antilop','bukalemun','gergedan','samandra'] },
      { cat: 'Yiyecekler', words: ['baklava','simit','cikoban','kofte','dolma','pide','mercimek','borek','sarmisak','zeytin','yogurt','kaymak','muhallebi','kadayif'] },
      { cat: 'Meslekler', words: ['muhendis','doktor','ogretmen','avukat','mimar','hemsire','pilot','asci','garson','sanatci','subay','eczaci','berber','kasap'] },
      { cat: 'Doğa', words: ['volkan','okyanus','buzul','orman','nehir','deprem','kasirga','gokkusagi','selale','madensuyu','yanar','kayalik','mercan','tepecik'] },
      { cat: 'Spor', words: ['futbol','basketbol','voleybol','tenis','yuzme','boks','eskrim','atletizm','cimnastik','bisiklet','halter','okculuk','kayak','binicilik'] }
    ],
    en: [
      { cat: 'Animals', words: ['butterfly','crocodile','penguin','elephant','dolphin','giraffe','kangaroo','flamingo','chameleon','porcupine','jellyfish','albatross','armadillo','nightingale'] },
      { cat: 'Foods', words: ['hamburger','spaghetti','chocolate','pineapple','avocado','broccoli','cinnamon','mushroom','blueberry','pancake','sandwich','lasagna','croissant','asparagus'] },
      { cat: 'Professions', words: ['engineer','architect','scientist','detective','musician','librarian','carpenter','plumber','surgeon','journalist','astronaut','pharmacist','electrician','professor'] },
      { cat: 'Nature', words: ['volcano','mountain','waterfall','hurricane','blizzard','avalanche','thunder','rainbow','glacier','canyon','meadow','desert','tsunami','asteroid'] },
      { cat: 'Sports', words: ['football','baseball','swimming','tennis','archery','fencing','gymnastics','wrestling','badminton','surfing','lacrosse','handball','marathon','triathlon'] }
    ],
    de: [
      { cat: 'Tiere', words: ['schmetterling','krokodil','pinguin','elefant','delfin','giraffe','flamingo','kaninchen','schildkroete','eichhoernchen','nashorn','papagei','kolibri','seepferdchen'] },
      { cat: 'Essen', words: ['bratwurst','kartoffel','brezel','schokolade','apfelstrudel','sauerkraut','pfannkuchen','lebkuchen','marzipan','schnitzel','knoblauch','himbeere','geschnetzeltes'] },
      { cat: 'Berufe', words: ['ingenieur','architekt','wissenschaftler','musiker','lehrer','arzt','journalist','polizist','feuerwehrmann','rechtsanwalt','mechaniker','apotheker'] },
      { cat: 'Natur', words: ['wasserfall','gewitter','vulkan','regenbogen','gletscher','lawine','erdbeben','nordlicht','mondfinsternis','bergkette'] },
      { cat: 'Sport', words: ['fussball','handball','schwimmen','leichtathletik','eiskunstlauf','bogenschiessen','reiten','fechten','turnen','skifahren'] }
    ],
    fr: [
      { cat: 'Animaux', words: ['papillon','crocodile','pingouin','elephant','dauphin','girafe','flamant','cameleon','hippopotame','ecureuil','rhinoceros','perroquet','hirondelle'] },
      { cat: 'Nourriture', words: ['croissant','baguette','chocolat','ratatouille','fromage','champignon','framboise','brioche','crevette','aubergine','artichaut','madeleine'] },
      { cat: 'Métiers', words: ['ingenieur','architecte','scientifique','musicien','journaliste','professeur','pharmacien','chirurgien','electricien','informaticien'] },
      { cat: 'Nature', words: ['cascade','volcan','montagne','ouragan','tempete','avalanche','glacier','tonnerre','tremblement','eclair'] },
      { cat: 'Sports', words: ['football','natation','escrime','equitation','athletisme','cyclisme','badminton','gymnastique','plongeon','aviron'] }
    ],
    es: [
      { cat: 'Animales', words: ['mariposa','cocodrilo','pinguino','elefante','delfin','jirafa','flamenco','camaleon','hipopotamo','rinoceronte','murcielago','tortuga','canguro'] },
      { cat: 'Comida', words: ['chocolate','paella','enchilada','guacamole','quesadilla','chimichurri','empanada','churros','gazpacho','albondigas','croqueta','tortilla'] },
      { cat: 'Profesiones', words: ['ingeniero','arquitecto','cientifico','periodista','profesor','farmaceutico','cirujano','electricista','bombero','abogado'] },
      { cat: 'Naturaleza', words: ['cascada','volcan','montana','huracan','terremoto','avalancha','glaciar','arcoiris','relampago','tormenta'] },
      { cat: 'Deportes', words: ['futbol','baloncesto','natacion','atletismo','ciclismo','gimnasia','balonmano','esgrima','equitacion','boxeo'] }
    ],
    ru: [
      { cat: 'Животные', words: ['бабочка','крокодил','пингвин','дельфин','жираф','фламинго','хамелеон','носорог','попугай','черепаха','белка','кенгуру','медведь'] },
      { cat: 'Еда', words: ['шоколад','пельмени','блинчики','сосиска','картошка','сметана','вареники','баклажан','помидор','капуста','морковь','огурец'] },
      { cat: 'Профессии', words: ['инженер','архитектор','учитель','журналист','музыкант','хирург','фармацевт','электрик','пожарный','адвокат'] },
      { cat: 'Природа', words: ['водопад','вулкан','ураган','землетрясение','лавина','ледник','радуга','молния','гроза','метель'] },
      { cat: 'Спорт', words: ['футбол','баскетбол','плавание','гимнастика','фехтование','биатлон','хоккей','волейбол','борьба','бокс'] }
    ],
    zh: [
      { cat: '动物', words: ['蝴蝶','鳄鱼','企鹅','大象','海豚','长颈鹿','火烈鸟','变色龙','犀牛','鹦鹉','乌龟','袋鼠','河马'] },
      { cat: '食物', words: ['巧克力','饺子','包子','面条','豆腐','烧烤','月饼','春卷','馒头','火锅','汤圆','粽子'] },
      { cat: '职业', words: ['工程师','建筑师','科学家','记者','音乐家','教授','药剂师','医生','律师','消防员'] },
      { cat: '自然', words: ['瀑布','火山','飓风','地震','雪崩','冰川','彩虹','闪电','海啸','龙卷风'] },
      { cat: '运动', words: ['足球','篮球','游泳','体操','击剑','射箭','乒乓球','羽毛球','排球','滑冰'] }
    ],
    ja: [
      { cat: '動物', words: ['ちょうちょう','わに','ぺんぎん','いるか','きりん','かめれおん','さい','おうむ','かめ','かんがるー','かば','くじら'] },
      { cat: '食べ物', words: ['すし','てんぷら','おにぎり','うどん','ぎょうざ','らーめん','たこやき','やきにく','さしみ','みそしる','とうふ','おこのみやき'] },
      { cat: '職業', words: ['えんじにあ','いしゃ','かんごし','きょうし','けいさつかん','しょうぼうし','べんごし','かがくしゃ','うちゅうひこうし'] },
      { cat: '自然', words: ['たき','かざん','たいふう','じしん','なだれ','にじ','かみなり','つなみ','ふぶき','こうずい'] },
      { cat: 'スポーツ', words: ['やきゅう','すいえい','たいそう','じゅうどう','からて','けんどう','すもう','ばどみんとん','たっきゅう'] }
    ],
    it: [
      { cat: 'Animali', words: ['farfalla','coccodrillo','pinguino','elefante','delfino','giraffa','fenicottero','camaleonte','rinoceronte','pappagallo','tartaruga','canguro'] },
      { cat: 'Cibo', words: ['cioccolato','spaghetti','lasagna','bruschetta','mozzarella','tiramisu','focaccia','prosciutto','risotto','panettone','gorgonzola'] },
      { cat: 'Professioni', words: ['ingegnere','architetto','scienziato','giornalista','musicista','professore','farmacista','chirurgo','avvocato','pompiere'] },
      { cat: 'Natura', words: ['cascata','vulcano','uragano','terremoto','valanga','ghiacciaio','arcobaleno','fulmine','tempesta','tsunami'] },
      { cat: 'Sport', words: ['calcio','pallacanestro','nuoto','ginnastica','scherma','equitazione','ciclismo','pallavolo','pugilato','atletica'] }
    ],
    pt: [
      { cat: 'Animais', words: ['borboleta','crocodilo','pinguim','elefante','golfinho','girafa','flamingo','camaleao','rinoceronte','papagaio','tartaruga','canguru'] },
      { cat: 'Comida', words: ['chocolate','brigadeiro','feijoada','coxinha','pastel','bacalhau','pimentao','abacaxi','mandioca','tapioca','acai','pamonha'] },
      { cat: 'Profissões', words: ['engenheiro','arquiteto','cientista','jornalista','professor','farmaceutico','cirurgiao','advogado','bombeiro','eletricista'] },
      { cat: 'Natureza', words: ['cachoeira','vulcao','furacao','terremoto','avalanche','geleira','arcoiris','relampago','tempestade','tsunami'] },
      { cat: 'Esportes', words: ['futebol','basquete','natacao','ginastica','esgrima','ciclismo','voleibol','atletismo','boxe','surfe'] }
    ],
    ar: [
      { cat: 'حيوانات', words: ['فراشة','تمساح','بطريق','فيل','دلفين','زرافة','حرباء','وحيد','ببغاء','سلحفاة','كنغر','فلامنغو'] },
      { cat: 'طعام', words: ['شوكولاتة','فلافل','حمص','شاورما','كنافة','بقلاوة','مجدرة','منسف','كبسة','تبولة','فتوش','ملوخية'] },
      { cat: 'مهن', words: ['مهندس','معماري','عالم','صحفي','موسيقي','طبيب','صيدلي','محامي','رجل','كهربائي'] },
      { cat: 'طبيعة', words: ['شلال','بركان','اعصار','زلزال','انهيار','جليد','قوس','برق','عاصفة','تسونامي'] },
      { cat: 'رياضة', words: ['كرة','سباحة','ملاكمة','مبارزة','فروسية','رماية','جمباز','مصارعة','تزلج','ركوب'] }
    ],
    ko: [
      { cat: '동물', words: ['나비','악어','펭귄','코끼리','돌고래','기린','카멜레온','코뿔소','앵무새','거북이','캥거루','하마'] },
      { cat: '음식', words: ['비빔밥','불고기','김치','떡볶이','잡채','삼겹살','된장찌개','김밥','냉면','호떡','만두','순두부'] },
      { cat: '직업', words: ['엔지니어','건축가','과학자','기자','음악가','교수','약사','의사','변호사','소방관'] },
      { cat: '자연', words: ['폭포','화산','허리케인','지진','눈사태','빙하','무지개','번개','태풍','쓰나미'] },
      { cat: '스포츠', words: ['축구','농구','수영','체조','펜싱','양궁','탁구','배드민턴','배구','스키'] }
    ]
  };

  /* ───── Keyboard layouts per language (Latin or native) ───── */
  const KEYBOARDS = {
    tr: [['Q','W','E','R','T','Y','U','I','O','P'],['A','S','D','F','G','H','J','K','L'],['Z','X','C','V','B','N','M','Ö','Ü','Ç','Ş','İ','Ğ']],
    en: [['Q','W','E','R','T','Y','U','I','O','P'],['A','S','D','F','G','H','J','K','L'],['Z','X','C','V','B','N','M']],
    de: [['Q','W','E','R','T','Z','U','I','O','P','Ü'],['A','S','D','F','G','H','J','K','L','Ö','Ä'],['Y','X','C','V','B','N','M','ß']],
    fr: [['A','Z','E','R','T','Y','U','I','O','P'],['Q','S','D','F','G','H','J','K','L','M'],['W','X','C','V','B','N','É','È','Ê','Ë','Ç']],
    es: [['Q','W','E','R','T','Y','U','I','O','P'],['A','S','D','F','G','H','J','K','L','Ñ'],['Z','X','C','V','B','N','M']],
    ru: [['Й','Ц','У','К','Е','Н','Г','Ш','Щ','З','Х'],['Ф','Ы','В','А','П','Р','О','Л','Д','Ж','Э'],['Я','Ч','С','М','И','Т','Ь','Б','Ю','Ъ','Ё']],
    zh: [['Q','W','E','R','T','Y','U','I','O','P'],['A','S','D','F','G','H','J','K','L'],['Z','X','C','V','B','N','M']],
    ja: [['あ','い','う','え','お','か','き','く','け','こ'],['さ','し','す','せ','そ','た','ち','つ','て','と'],['な','に','ぬ','ね','の','は','ひ','ふ','へ','ほ'],['ま','み','む','め','も','や','ゆ','よ','ら','り'],['る','れ','ろ','わ','を','ん','っ','ー']],
    it: [['Q','W','E','R','T','Y','U','I','O','P'],['A','S','D','F','G','H','J','K','L'],['Z','X','C','V','B','N','M']],
    pt: [['Q','W','E','R','T','Y','U','I','O','P'],['A','S','D','F','G','H','J','K','L','Ç'],['Z','X','C','V','B','N','M']],
    ar: [['ض','ص','ث','ق','ف','غ','ع','ه','خ','ح','ج'],['ش','س','ي','ب','ل','ا','ت','ن','م','ك','ط'],['ئ','ء','ؤ','ر','ى','ة','و','ز','ظ','د','ذ']],
    ko: [['ㅂ','ㅈ','ㄷ','ㄱ','ㅅ','ㅛ','ㅕ','ㅑ','ㅐ','ㅔ'],['ㅁ','ㄴ','ㅇ','ㄹ','ㅎ','ㅗ','ㅓ','ㅏ','ㅣ'],['ㅋ','ㅌ','ㅊ','ㅍ','ㅠ','ㅜ','ㅡ']]
  };

  /* ───── Language list for word selector ───── */
  const WORD_LANGS = [
    { code:'tr', name:'Türkçe',   flag:'🇹🇷' },
    { code:'en', name:'English',   flag:'🇬🇧' },
    { code:'de', name:'Deutsch',   flag:'🇩🇪' },
    { code:'fr', name:'Français',  flag:'🇫🇷' },
    { code:'es', name:'Español',   flag:'🇪🇸' },
    { code:'ru', name:'Русский',   flag:'🇷🇺' },
    { code:'zh', name:'中文',      flag:'🇨🇳' },
    { code:'ja', name:'日本語',    flag:'🇯🇵' },
    { code:'it', name:'Italiano',  flag:'🇮🇹' },
    { code:'pt', name:'Português', flag:'🇧🇷' },
    { code:'ar', name:'العربية',   flag:'🇸🇦' },
    { code:'ko', name:'한국어',    flag:'🇰🇷' }
  ];

  const MAX_WRONG = 6;

  function getLocale() { return localStorage.getItem('sys_locale') || 'tr'; }

  function normalize(str) {
    return str.toUpperCase().normalize('NFC');
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  return {
    setup() {
      const locale = ref(getLocale());
      const L = (k) => (LANGS[locale.value] || LANGS.en)[k] || k;

      const rootEl = ref(null);

      /* State */
      const state = ref('idle');        // idle | playing | won | lost
      const wordLang = ref(getLocale());
      const currentWord = ref('');
      const currentCategory = ref('');
      const hint = ref('');
      const guessed = ref(new Set());
      const wins = ref(0);
      const losses = ref(0);

      /* Computed */
      const wordLetters = computed(() => {
        return normalize(currentWord.value).split('');
      });

      const wordDisplay = computed(() => {
        if (!currentWord.value) return [];
        const upper = normalize(currentWord.value);
        return upper.split('').map(ch => {
          if (ch === ' ') return ' ';
          if (state.value === 'lost') return ch;
          return guessed.value.has(ch) ? ch : '_';
        });
      });

      const wrongCount = computed(() => {
        let count = 0;
        guessed.value.forEach(l => {
          if (!wordLetters.value.includes(l)) count++;
        });
        return count;
      });

      const keyboard = computed(() => {
        return KEYBOARDS[wordLang.value] || KEYBOARDS.en;
      });

      const wordLangs = WORD_LANGS;

      /* Load stats */
      try {
        wins.value = parseInt(localStorage.getItem('hangman_wins') || '0');
        losses.value = parseInt(localStorage.getItem('hangman_losses') || '0');
      } catch(e) {}

      /* Functions */
      function startGame() {
        const bank = WORD_BANKS[wordLang.value] || WORD_BANKS.en;
        const category = pickRandom(bank);
        const word = pickRandom(category.words);
        currentWord.value = word;
        currentCategory.value = category.cat;
        hint.value = '';
        guessed.value = new Set();
        state.value = 'playing';
        nextTick(() => { if (rootEl.value) rootEl.value.focus(); });
      }

      function guess(letter) {
        if (state.value !== 'playing') return;
        const upper = normalize(letter);
        if (guessed.value.has(upper)) return;

        const newSet = new Set(guessed.value);
        newSet.add(upper);
        guessed.value = newSet;

        /* Check win */
        const allRevealed = normalize(currentWord.value).split('').every(ch => ch === ' ' || newSet.has(ch));
        if (allRevealed) {
          state.value = 'won';
          wins.value++;
          localStorage.setItem('hangman_wins', String(wins.value));
          return;
        }

        /* Check loss */
        let wc = 0;
        newSet.forEach(l => { if (!wordLetters.value.includes(l)) wc++; });
        if (wc >= MAX_WRONG) {
          state.value = 'lost';
          losses.value++;
          localStorage.setItem('hangman_losses', String(losses.value));
          return;
        }

        /* Hint after 3 wrong guesses */
        if (wc === 3 && !hint.value) {
          const cat = currentCategory.value;
          hint.value = cat;
        }
      }

      function onKeyDown(e) {
        if (state.value !== 'playing') {
          if (e.key === 'Enter') startGame();
          return;
        }
        const key = e.key.toUpperCase().normalize('NFC');
        const allKeys = keyboard.value.flat();
        if (allKeys.includes(key)) {
          e.preventDefault();
          guess(key);
        }
      }

      function onLangChange() {
        if (state.value === 'playing') {
          startGame();
        }
      }

      onMounted(() => {
        if (rootEl.value) rootEl.value.focus();
      });

      return {
        locale, L, rootEl,
        state, wordLang, wordLangs,
        currentWord, currentCategory, hint,
        guessed, wins, losses,
        wordLetters, wordDisplay, wrongCount,
        keyboard,
        startGame, guess, onKeyDown, onLangChange
      };
    }
  };
})(Vue);
