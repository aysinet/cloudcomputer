(function(Vue) {
  const { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } = Vue;

  const LANGS = {
    tr: {
      title: 'Müzik Notasyon Editörü', newFile: 'Yeni', open: 'Aç', save: 'Kaydet', saveAs: 'Farklı Kaydet',
      importFile: 'İçe Aktar', exportXml: 'MusicXML İndir', exportPng: 'PNG İndir',
      tabVisual: 'Görsel', tabSource: 'Kaynak XML',
      zoomIn: 'Yakınlaştır', zoomOut: 'Uzaklaştır', zoomReset: 'Sıfırla',
      addNote: 'Nota Ekle', addRest: 'Sus Ekle', addMeasure: 'Ölçü Ekle', removeMeasure: 'Ölçü Sil',
      noteC: 'Do', noteD: 'Re', noteE: 'Mi', noteF: 'Fa', noteG: 'Sol', noteA: 'La', noteB: 'Si',
      duration: 'Süre', whole: 'Birlik', half: 'İkilik', quarter: 'Dörtlük', eighth: 'Sekizlik', d16th: '16lık',
      octave: 'Oktav', sharp: 'Diyez', flat: 'Bemol', natural: 'Natürel', dot: 'Noktalı',
      tempo: 'Tempo', timeSignature: 'Ölçü İşareti', keySignature: 'Anahtar İşareti',
      title_: 'Başlık', composer: 'Besteci', clef: 'Anahtar', treble: 'Sol Anahtarı', bass: 'Fa Anahtarı',
      play: 'Çal', stop: 'Dur', loading: 'Yükleniyor...', ready: 'Hazır',
      error: 'Hata', parseError: 'MusicXML ayrıştırma hatası',
      noOsmd: 'OpenSheetMusicDisplay yüklenemedi',
      confirm: 'Devam et?', unsavedChanges: 'Kaydedilmemiş değişiklikler var.',
      templates: 'Şablonlar', blank: 'Boş Sayfa', cMajorScale: 'Do Majör Gam', simpleWaltz: 'Basit Vals'
    },
    en: {
      title: 'Music Notation Editor', newFile: 'New', open: 'Open', save: 'Save', saveAs: 'Save As',
      importFile: 'Import', exportXml: 'Download MusicXML', exportPng: 'Download PNG',
      tabVisual: 'Visual', tabSource: 'Source XML',
      zoomIn: 'Zoom In', zoomOut: 'Zoom Out', zoomReset: 'Reset',
      addNote: 'Add Note', addRest: 'Add Rest', addMeasure: 'Add Measure', removeMeasure: 'Remove Measure',
      noteC: 'C', noteD: 'D', noteE: 'E', noteF: 'F', noteG: 'G', noteA: 'A', noteB: 'B',
      duration: 'Duration', whole: 'Whole', half: 'Half', quarter: 'Quarter', eighth: 'Eighth', d16th: '16th',
      octave: 'Octave', sharp: 'Sharp', flat: 'Flat', natural: 'Natural', dot: 'Dotted',
      tempo: 'Tempo', timeSignature: 'Time Signature', keySignature: 'Key Signature',
      title_: 'Title', composer: 'Composer', clef: 'Clef', treble: 'Treble', bass: 'Bass',
      play: 'Play', stop: 'Stop', loading: 'Loading...', ready: 'Ready',
      error: 'Error', parseError: 'MusicXML parse error',
      noOsmd: 'OpenSheetMusicDisplay could not be loaded',
      confirm: 'Continue?', unsavedChanges: 'You have unsaved changes.',
      templates: 'Templates', blank: 'Blank Page', cMajorScale: 'C Major Scale', simpleWaltz: 'Simple Waltz'
    },
    de: {
      title: 'Musiknotation-Editor', newFile: 'Neu', open: 'Öffnen', save: 'Speichern', saveAs: 'Speichern unter',
      importFile: 'Importieren', exportXml: 'MusicXML herunterladen', exportPng: 'PNG herunterladen',
      tabVisual: 'Visuell', tabSource: 'Quell-XML',
      zoomIn: 'Vergrößern', zoomOut: 'Verkleinern', zoomReset: 'Zurücksetzen',
      addNote: 'Note hinzufügen', addRest: 'Pause hinzufügen', addMeasure: 'Takt hinzufügen', removeMeasure: 'Takt entfernen',
      noteC: 'C', noteD: 'D', noteE: 'E', noteF: 'F', noteG: 'G', noteA: 'A', noteB: 'B',
      duration: 'Dauer', whole: 'Ganze', half: 'Halbe', quarter: 'Viertel', eighth: 'Achtel', d16th: '16tel',
      octave: 'Oktave', sharp: 'Kreuz', flat: 'B', natural: 'Auflösung', dot: 'Punktiert',
      tempo: 'Tempo', timeSignature: 'Taktart', keySignature: 'Tonart',
      title_: 'Titel', composer: 'Komponist', clef: 'Schlüssel', treble: 'Violinschlüssel', bass: 'Bassschlüssel',
      play: 'Abspielen', stop: 'Stopp', loading: 'Laden...', ready: 'Bereit',
      error: 'Fehler', parseError: 'MusicXML-Analysefehler', noOsmd: 'OpenSheetMusicDisplay konnte nicht geladen werden',
      confirm: 'Fortfahren?', unsavedChanges: 'Es gibt ungespeicherte Änderungen.',
      templates: 'Vorlagen', blank: 'Leere Seite', cMajorScale: 'C-Dur Tonleiter', simpleWaltz: 'Einfacher Walzer'
    },
    fr: {
      title: 'Éditeur de Notation', newFile: 'Nouveau', open: 'Ouvrir', save: 'Enregistrer', saveAs: 'Enregistrer sous',
      importFile: 'Importer', exportXml: 'Télécharger MusicXML', exportPng: 'Télécharger PNG',
      tabVisual: 'Visuel', tabSource: 'Source XML',
      zoomIn: 'Agrandir', zoomOut: 'Réduire', zoomReset: 'Réinitialiser',
      addNote: 'Ajouter note', addRest: 'Ajouter silence', addMeasure: 'Ajouter mesure', removeMeasure: 'Supprimer mesure',
      noteC: 'Do', noteD: 'Ré', noteE: 'Mi', noteF: 'Fa', noteG: 'Sol', noteA: 'La', noteB: 'Si',
      duration: 'Durée', whole: 'Ronde', half: 'Blanche', quarter: 'Noire', eighth: 'Croche', d16th: 'Double croche',
      octave: 'Octave', sharp: 'Dièse', flat: 'Bémol', natural: 'Bécarre', dot: 'Pointée',
      tempo: 'Tempo', timeSignature: 'Signature rythmique', keySignature: 'Armure',
      title_: 'Titre', composer: 'Compositeur', clef: 'Clé', treble: 'Clé de sol', bass: 'Clé de fa',
      play: 'Jouer', stop: 'Arrêter', loading: 'Chargement...', ready: 'Prêt',
      error: 'Erreur', parseError: 'Erreur d\'analyse MusicXML', noOsmd: 'OpenSheetMusicDisplay n\'a pas pu être chargé',
      confirm: 'Continuer?', unsavedChanges: 'Vous avez des modifications non enregistrées.',
      templates: 'Modèles', blank: 'Page vierge', cMajorScale: 'Gamme de Do Majeur', simpleWaltz: 'Valse simple'
    },
    es: {
      title: 'Editor de Notación', newFile: 'Nuevo', open: 'Abrir', save: 'Guardar', saveAs: 'Guardar como',
      importFile: 'Importar', exportXml: 'Descargar MusicXML', exportPng: 'Descargar PNG',
      tabVisual: 'Visual', tabSource: 'Fuente XML',
      zoomIn: 'Acercar', zoomOut: 'Alejar', zoomReset: 'Restablecer',
      addNote: 'Agregar nota', addRest: 'Agregar silencio', addMeasure: 'Agregar compás', removeMeasure: 'Eliminar compás',
      noteC: 'Do', noteD: 'Re', noteE: 'Mi', noteF: 'Fa', noteG: 'Sol', noteA: 'La', noteB: 'Si',
      duration: 'Duración', whole: 'Redonda', half: 'Blanca', quarter: 'Negra', eighth: 'Corchea', d16th: 'Semicorchea',
      octave: 'Octava', sharp: 'Sostenido', flat: 'Bemol', natural: 'Becuadro', dot: 'Puntillo',
      tempo: 'Tempo', timeSignature: 'Compás', keySignature: 'Armadura',
      title_: 'Título', composer: 'Compositor', clef: 'Clave', treble: 'Clave de sol', bass: 'Clave de fa',
      play: 'Reproducir', stop: 'Detener', loading: 'Cargando...', ready: 'Listo',
      error: 'Error', parseError: 'Error al analizar MusicXML', noOsmd: 'No se pudo cargar OpenSheetMusicDisplay',
      confirm: '¿Continuar?', unsavedChanges: 'Tiene cambios sin guardar.',
      templates: 'Plantillas', blank: 'Página en blanco', cMajorScale: 'Escala de Do Mayor', simpleWaltz: 'Vals simple'
    },
    ru: {
      title: 'Редактор нотной записи', newFile: 'Новый', open: 'Открыть', save: 'Сохранить', saveAs: 'Сохранить как',
      importFile: 'Импорт', exportXml: 'Скачать MusicXML', exportPng: 'Скачать PNG',
      tabVisual: 'Визуальный', tabSource: 'Исходный XML',
      zoomIn: 'Увеличить', zoomOut: 'Уменьшить', zoomReset: 'Сбросить',
      addNote: 'Добавить ноту', addRest: 'Добавить паузу', addMeasure: 'Добавить такт', removeMeasure: 'Удалить такт',
      noteC: 'До', noteD: 'Ре', noteE: 'Ми', noteF: 'Фа', noteG: 'Соль', noteA: 'Ля', noteB: 'Си',
      duration: 'Длительность', whole: 'Целая', half: 'Половинная', quarter: 'Четвертная', eighth: 'Восьмая', d16th: '16-я',
      octave: 'Октава', sharp: 'Диез', flat: 'Бемоль', natural: 'Бекар', dot: 'Точка',
      tempo: 'Темп', timeSignature: 'Размер', keySignature: 'Тональность',
      title_: 'Название', composer: 'Композитор', clef: 'Ключ', treble: 'Скрипичный', bass: 'Басовый',
      play: 'Воспроизвести', stop: 'Стоп', loading: 'Загрузка...', ready: 'Готово',
      error: 'Ошибка', parseError: 'Ошибка разбора MusicXML', noOsmd: 'Не удалось загрузить OpenSheetMusicDisplay',
      confirm: 'Продолжить?', unsavedChanges: 'Есть несохранённые изменения.',
      templates: 'Шаблоны', blank: 'Пустая страница', cMajorScale: 'Гамма До мажор', simpleWaltz: 'Простой вальс'
    },
    zh: { title:'乐谱编辑器', newFile:'新建', open:'打开', save:'保存', saveAs:'另存为', importFile:'导入', exportXml:'下载MusicXML', exportPng:'下载PNG', tabVisual:'可视化', tabSource:'源XML', zoomIn:'放大', zoomOut:'缩小', zoomReset:'重置', addNote:'添加音符', addRest:'添加休止符', addMeasure:'添加小节', removeMeasure:'删除小节', noteC:'C', noteD:'D', noteE:'E', noteF:'F', noteG:'G', noteA:'A', noteB:'B', duration:'时值', whole:'全音符', half:'二分音符', quarter:'四分音符', eighth:'八分音符', d16th:'十六分音符', octave:'八度', sharp:'升号', flat:'降号', natural:'还原', dot:'附点', tempo:'速度', timeSignature:'拍号', keySignature:'调号', title_:'标题', composer:'作曲', clef:'谱号', treble:'高音谱号', bass:'低音谱号', play:'播放', stop:'停止', loading:'加载中...', ready:'就绪', error:'错误', parseError:'MusicXML解析错误', noOsmd:'无法加载OpenSheetMusicDisplay', confirm:'继续？', unsavedChanges:'有未保存的更改。', templates:'模板', blank:'空白页', cMajorScale:'C大调音阶', simpleWaltz:'简单华尔兹' },
    ja: { title:'楽譜エディタ', newFile:'新規', open:'開く', save:'保存', saveAs:'名前を付けて保存', importFile:'インポート', exportXml:'MusicXMLをDL', exportPng:'PNGをDL', tabVisual:'ビジュアル', tabSource:'ソースXML', zoomIn:'拡大', zoomOut:'縮小', zoomReset:'リセット', addNote:'音符を追加', addRest:'休符を追加', addMeasure:'小節を追加', removeMeasure:'小節を削除', noteC:'ド', noteD:'レ', noteE:'ミ', noteF:'ファ', noteG:'ソ', noteA:'ラ', noteB:'シ', duration:'音価', whole:'全音符', half:'2分音符', quarter:'4分音符', eighth:'8分音符', d16th:'16分音符', octave:'オクターブ', sharp:'シャープ', flat:'フラット', natural:'ナチュラル', dot:'付点', tempo:'テンポ', timeSignature:'拍子記号', keySignature:'調号', title_:'タイトル', composer:'作曲者', clef:'音部記号', treble:'ト音記号', bass:'ヘ音記号', play:'再生', stop:'停止', loading:'読込中...', ready:'準備完了', error:'エラー', parseError:'MusicXML解析エラー', noOsmd:'OpenSheetMusicDisplayを読み込めません', confirm:'続行しますか？', unsavedChanges:'未保存の変更があります。', templates:'テンプレート', blank:'空白ページ', cMajorScale:'ハ長調音階', simpleWaltz:'シンプルなワルツ' },
    it: { title:'Editor di Notazione', newFile:'Nuovo', open:'Apri', save:'Salva', saveAs:'Salva con nome', importFile:'Importa', exportXml:'Scarica MusicXML', exportPng:'Scarica PNG', tabVisual:'Visuale', tabSource:'Sorgente XML', zoomIn:'Ingrandisci', zoomOut:'Riduci', zoomReset:'Ripristina', addNote:'Aggiungi nota', addRest:'Aggiungi pausa', addMeasure:'Aggiungi battuta', removeMeasure:'Rimuovi battuta', noteC:'Do', noteD:'Re', noteE:'Mi', noteF:'Fa', noteG:'Sol', noteA:'La', noteB:'Si', duration:'Durata', whole:'Semibreve', half:'Minima', quarter:'Semiminima', eighth:'Croma', d16th:'Semicroma', octave:'Ottava', sharp:'Diesis', flat:'Bemolle', natural:'Bequadro', dot:'Puntato', tempo:'Tempo', timeSignature:'Indicazione metrica', keySignature:'Armatura', title_:'Titolo', composer:'Compositore', clef:'Chiave', treble:'Chiave di violino', bass:'Chiave di basso', play:'Riproduci', stop:'Ferma', loading:'Caricamento...', ready:'Pronto', error:'Errore', parseError:'Errore di analisi MusicXML', noOsmd:'Impossibile caricare OpenSheetMusicDisplay', confirm:'Continuare?', unsavedChanges:'Ci sono modifiche non salvate.', templates:'Modelli', blank:'Pagina vuota', cMajorScale:'Scala di Do Maggiore', simpleWaltz:'Valzer semplice' },
    ar: { title:'محرر التدوين الموسيقي', newFile:'جديد', open:'فتح', save:'حفظ', saveAs:'حفظ باسم', importFile:'استيراد', exportXml:'تنزيل MusicXML', exportPng:'تنزيل PNG', tabVisual:'مرئي', tabSource:'مصدر XML', zoomIn:'تكبير', zoomOut:'تصغير', zoomReset:'إعادة', addNote:'إضافة نغمة', addRest:'إضافة سكتة', addMeasure:'إضافة مازورة', removeMeasure:'حذف مازورة', noteC:'دو', noteD:'ري', noteE:'مي', noteF:'فا', noteG:'صول', noteA:'لا', noteB:'سي', duration:'المدة', whole:'مستديرة', half:'بيضاء', quarter:'سوداء', eighth:'كروش', d16th:'دبل كروش', octave:'أوكتاف', sharp:'دييز', flat:'بيمول', natural:'بيكار', dot:'منقوطة', tempo:'الإيقاع', timeSignature:'الميزان', keySignature:'المفتاح', title_:'العنوان', composer:'المؤلف', clef:'المفتاح', treble:'مفتاح صول', bass:'مفتاح فا', play:'تشغيل', stop:'إيقاف', loading:'جار التحميل...', ready:'جاهز', error:'خطأ', parseError:'خطأ في تحليل MusicXML', noOsmd:'تعذر تحميل OpenSheetMusicDisplay', confirm:'متابعة؟', unsavedChanges:'توجد تغييرات غير محفوظة.', templates:'قوالب', blank:'صفحة فارغة', cMajorScale:'سلم دو الكبير', simpleWaltz:'فالس بسيط' },
    ko: { title:'악보 편집기', newFile:'새 파일', open:'열기', save:'저장', saveAs:'다른 이름으로', importFile:'가져오기', exportXml:'MusicXML 다운로드', exportPng:'PNG 다운로드', tabVisual:'시각적', tabSource:'소스 XML', zoomIn:'확대', zoomOut:'축소', zoomReset:'초기화', addNote:'음표 추가', addRest:'쉼표 추가', addMeasure:'마디 추가', removeMeasure:'마디 삭제', noteC:'도', noteD:'레', noteE:'미', noteF:'파', noteG:'솔', noteA:'라', noteB:'시', duration:'음길이', whole:'온음표', half:'2분음표', quarter:'4분음표', eighth:'8분음표', d16th:'16분음표', octave:'옥타브', sharp:'샤프', flat:'플랫', natural:'내추럴', dot:'점음표', tempo:'템포', timeSignature:'박자표', keySignature:'조표', title_:'제목', composer:'작곡가', clef:'음자리표', treble:'높은음자리표', bass:'낮은음자리표', play:'재생', stop:'정지', loading:'로딩 중...', ready:'준비 완료', error:'오류', parseError:'MusicXML 분석 오류', noOsmd:'OpenSheetMusicDisplay를 로드할 수 없습니다', confirm:'계속하시겠습니까?', unsavedChanges:'저장되지 않은 변경 사항이 있습니다.', templates:'템플릿', blank:'빈 페이지', cMajorScale:'다장조 음계', simpleWaltz:'간단한 왈츠' },
    hi: { title:'संगीत अंकन संपादक', newFile:'नया', open:'खोलें', save:'सहेजें', saveAs:'इस नाम से सहेजें', importFile:'आयात', exportXml:'MusicXML डाउनलोड', exportPng:'PNG डाउनलोड', tabVisual:'दृश्य', tabSource:'स्रोत XML', zoomIn:'ज़ूम इन', zoomOut:'ज़ूम आउट', zoomReset:'रीसेट', addNote:'स्वर जोड़ें', addRest:'विराम जोड़ें', addMeasure:'माप जोड़ें', removeMeasure:'माप हटाएं', noteC:'सा', noteD:'रे', noteE:'गा', noteF:'मा', noteG:'पा', noteA:'धा', noteB:'नी', duration:'अवधि', whole:'पूर्ण', half:'आधा', quarter:'चौथाई', eighth:'आठवां', d16th:'16वां', octave:'सप्तक', sharp:'शार्प', flat:'फ्लैट', natural:'नैचुरल', dot:'बिंदु', tempo:'गति', timeSignature:'ताल चिह्न', keySignature:'स्वर चिह्न', title_:'शीर्षक', composer:'संगीतकार', clef:'कुंजी', treble:'ट्रेबल', bass:'बास', play:'चलाएं', stop:'रोकें', loading:'लोड हो रहा...', ready:'तैयार', error:'त्रुटि', parseError:'MusicXML विश्लेषण त्रुटि', noOsmd:'OpenSheetMusicDisplay लोड नहीं हो सका', confirm:'जारी रखें?', unsavedChanges:'सहेजे नहीं गए परिवर्तन हैं।', templates:'टेम्पलेट', blank:'खाली पृष्ठ', cMajorScale:'सा मेजर स्केल', simpleWaltz:'सरल वॉल्ट्ज़' },
    pt: { title:'Editor de Notação Musical', newFile:'Novo', open:'Abrir', save:'Salvar', saveAs:'Salvar como', importFile:'Importar', exportXml:'Baixar MusicXML', exportPng:'Baixar PNG', tabVisual:'Visual', tabSource:'Fonte XML', zoomIn:'Ampliar', zoomOut:'Reduzir', zoomReset:'Redefinir', addNote:'Adicionar nota', addRest:'Adicionar pausa', addMeasure:'Adicionar compasso', removeMeasure:'Remover compasso', noteC:'Dó', noteD:'Ré', noteE:'Mi', noteF:'Fá', noteG:'Sol', noteA:'Lá', noteB:'Si', duration:'Duração', whole:'Semibreve', half:'Mínima', quarter:'Semínima', eighth:'Colcheia', d16th:'Semicolcheia', octave:'Oitava', sharp:'Sustenido', flat:'Bemol', natural:'Bequadro', dot:'Pontuada', tempo:'Andamento', timeSignature:'Fórmula de compasso', keySignature:'Armadura de clave', title_:'Título', composer:'Compositor', clef:'Clave', treble:'Clave de sol', bass:'Clave de fá', play:'Tocar', stop:'Parar', loading:'Carregando...', ready:'Pronto', error:'Erro', parseError:'Erro ao analisar MusicXML', noOsmd:'Não foi possível carregar OpenSheetMusicDisplay', confirm:'Continuar?', unsavedChanges:'Existem alterações não salvas.', templates:'Modelos', blank:'Página em branco', cMajorScale:'Escala de Dó Maior', simpleWaltz:'Valsa simples' }
  };

  const NOTE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const DURATIONS = [
    { type: 'whole',    divisions: 16, symbol: '𝅝' },
    { type: 'half',     divisions: 8,  symbol: '𝅗𝅥' },
    { type: 'quarter',  divisions: 4,  symbol: '♩' },
    { type: 'eighth',   divisions: 2,  symbol: '♪' },
    { type: '16th',     divisions: 1,  symbol: '𝅘𝅥𝅯' }
  ];

  const TEMPLATES = {
    blank: () => buildMusicXML('Untitled', '', 'G', 4, 4, 120, [{ notes: [{ rest: true, duration: 'whole', divisions: 16 }] }]),
    cMajorScale: () => buildMusicXML('C Major Scale', '', 'G', 4, 4, 100, [
      { notes: 'C4q D4q E4q F4q'.split(' ').map(parseShortNote) },
      { notes: 'G4q A4q B4q C5q'.split(' ').map(parseShortNote) }
    ]),
    simpleWaltz: () => buildMusicXML('Simple Waltz', '', 'G', 3, 4, 140, [
      { notes: 'C4q E4q G4q'.split(' ').map(parseShortNote) },
      { notes: 'D4q F4q A4q'.split(' ').map(parseShortNote) },
      { notes: 'E4q G4q B4q'.split(' ').map(parseShortNote) },
      { notes: 'C4h C4q'.split(' ').map(parseShortNote) }
    ])
  };

  function parseShortNote(s) {
    const step = s[0];
    const alter = s.includes('#') ? 1 : s.includes('b') ? -1 : 0;
    const rest = s.length > 0 && /^\d+$/.test(s);
    let octave, dur;
    if (alter !== 0) {
      octave = parseInt(s[2]);
      dur = s[3];
    } else {
      octave = parseInt(s[1]);
      dur = s[2];
    }
    const durMap = { w: 'whole', h: 'half', q: 'quarter', e: 'eighth', s: '16th' };
    const divMap = { w: 16, h: 8, q: 4, e: 2, s: 1 };
    return { step, octave, alter, duration: durMap[dur] || 'quarter', divisions: divMap[dur] || 4, rest: false };
  }

  function buildMusicXML(title, composer, clef, beats, beatType, tempo, measures) {
    const clefSign = clef === 'F' ? 'F' : 'G';
    const clefLine = clef === 'F' ? 4 : 2;
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
  <work><work-title>${escXml(title)}</work-title></work>
  <identification>${composer ? `<creator type="composer">${escXml(composer)}</creator>` : ''}</identification>
  <part-list><score-part id="P1"><part-name>Part 1</part-name></score-part></part-list>
  <part id="P1">\n`;

    measures.forEach((m, mi) => {
      xml += `    <measure number="${mi + 1}">\n`;
      if (mi === 0) {
        xml += `      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>${beats}</beats><beat-type>${beatType}</beat-type></time>
        <clef><sign>${clefSign}</sign><line>${clefLine}</line></clef>
      </attributes>\n`;
        if (tempo) {
          xml += `      <direction placement="above"><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>${tempo}</per-minute></metronome></direction-type></direction>\n`;
        }
      }
      (m.notes || []).forEach(n => {
        if (n.rest) {
          xml += `      <note><rest/><duration>${n.divisions}</duration><type>${n.duration}</type></note>\n`;
        } else {
          xml += `      <note>\n`;
          xml += `        <pitch><step>${n.step}</step>${n.alter ? `<alter>${n.alter}</alter>` : ''}<octave>${n.octave}</octave></pitch>\n`;
          xml += `        <duration>${n.divisions}</duration><type>${n.duration}</type>${n.dot ? '<dot/>' : ''}\n`;
          xml += `      </note>\n`;
        }
      });
      xml += `    </measure>\n`;
    });

    xml += `  </part>\n</score-partwise>`;
    return xml;
  }

  function escXml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return {
    setup() {
      const locale = ref(localStorage.getItem('sys_locale') || 'en');
      const t = computed(() => LANGS[locale.value] || LANGS.en);

      // ── State ──
      const activeTab = ref('visual');
      const xmlSource = ref('');
      const osmdContainer = ref(null);
      const xmlEditor = ref(null);
      const zoom = ref(1.0);
      const status = ref('');
      const dirty = ref(false);
      const filePath = ref('');
      const osmdReady = ref(false);
      let osmd = null;

      // ── Note input state ──
      const selNote = ref('C');
      const selOctave = ref(4);
      const selDuration = ref('quarter');
      const selAccidental = ref(0); // -1 flat, 0 natural, 1 sharp
      const selDot = ref(false);

      // ── Score meta ──
      const scoreTitle = ref('Untitled');
      const scoreComposer = ref('');
      const scoreBeats = ref(4);
      const scoreBeatType = ref(4);
      const scoreTempo = ref(120);
      const scoreClef = ref('G');

      // ── OSMD init ──
      async function initOSMD() {
        if (!window.opensheetmusicdisplay) {
          status.value = t.value.noOsmd;
          return;
        }
        await nextTick();
        const container = osmdContainer.value;
        if (!container) return;
        try {
          osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(container, {
            autoResize: true,
            drawTitle: true,
            drawComposer: true,
            drawCredits: false,
            drawPartNames: false,
            backend: 'svg'
          });
          osmdReady.value = true;
          status.value = t.value.ready;
        } catch (e) {
          status.value = t.value.noOsmd + ': ' + e.message;
        }
      }

      async function renderXML(xml) {
        if (!osmd || !xml) return;
        try {
          status.value = t.value.loading;
          await osmd.load(xml);
          osmd.zoom = zoom.value;
          osmd.render();
          status.value = t.value.ready;
        } catch (e) {
          status.value = t.value.parseError + ': ' + e.message;
        }
      }

      // ── Template loading ──
      function loadTemplate(key) {
        const gen = TEMPLATES[key];
        if (!gen) return;
        xmlSource.value = gen();
        dirty.value = false;
        filePath.value = '';
        renderXML(xmlSource.value);
        parseMetaFromXML();
      }

      function parseMetaFromXML() {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(xmlSource.value, 'text/xml');
          const wt = doc.querySelector('work-title');
          if (wt) scoreTitle.value = wt.textContent;
          const cr = doc.querySelector('creator[type="composer"]');
          if (cr) scoreComposer.value = cr.textContent;
          const beats = doc.querySelector('beats');
          if (beats) scoreBeats.value = parseInt(beats.textContent) || 4;
          const bt = doc.querySelector('beat-type');
          if (bt) scoreBeatType.value = parseInt(bt.textContent) || 4;
          const pm = doc.querySelector('per-minute');
          if (pm) scoreTempo.value = parseInt(pm.textContent) || 120;
          const sign = doc.querySelector('clef sign');
          if (sign) scoreClef.value = sign.textContent;
        } catch {}
      }

      // ── Note/Rest/Measure manipulation ──
      function addNoteToXml() {
        const note = {
          step: selNote.value,
          octave: selOctave.value,
          alter: selAccidental.value,
          duration: selDuration.value,
          divisions: DURATIONS.find(d => d.type === selDuration.value)?.divisions || 4,
          dot: selDot.value,
          rest: false
        };
        insertNoteIntoXML(note);
      }

      function addRestToXml() {
        const note = {
          rest: true,
          duration: selDuration.value,
          divisions: DURATIONS.find(d => d.type === selDuration.value)?.divisions || 4
        };
        insertNoteIntoXML(note);
      }

      function insertNoteIntoXML(note) {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(xmlSource.value, 'text/xml');
          const measures = doc.querySelectorAll('measure');
          if (!measures.length) return;
          const lastMeasure = measures[measures.length - 1];

          const noteEl = doc.createElement('note');
          if (note.rest) {
            noteEl.appendChild(doc.createElement('rest'));
          } else {
            const pitch = doc.createElement('pitch');
            const step = doc.createElement('step');
            step.textContent = note.step;
            pitch.appendChild(step);
            if (note.alter) {
              const alter = doc.createElement('alter');
              alter.textContent = note.alter;
              pitch.appendChild(alter);
            }
            const oct = doc.createElement('octave');
            oct.textContent = note.octave;
            pitch.appendChild(oct);
            noteEl.appendChild(pitch);
          }
          const dur = doc.createElement('duration');
          dur.textContent = note.divisions;
          noteEl.appendChild(dur);
          const type = doc.createElement('type');
          type.textContent = note.duration;
          noteEl.appendChild(type);
          if (note.dot) noteEl.appendChild(doc.createElement('dot'));

          lastMeasure.appendChild(noteEl);
          xmlSource.value = new XMLSerializer().serializeToString(doc);
          dirty.value = true;
          renderXML(xmlSource.value);
        } catch (e) {
          status.value = t.value.error + ': ' + e.message;
        }
      }

      function addMeasure() {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(xmlSource.value, 'text/xml');
          const part = doc.querySelector('part');
          if (!part) return;
          const measures = doc.querySelectorAll('measure');
          const newNum = measures.length + 1;
          const measure = doc.createElement('measure');
          measure.setAttribute('number', newNum);
          // Add a whole rest
          const note = doc.createElement('note');
          note.appendChild(doc.createElement('rest'));
          const dur = doc.createElement('duration');
          dur.textContent = '16';
          note.appendChild(dur);
          const type = doc.createElement('type');
          type.textContent = 'whole';
          note.appendChild(type);
          measure.appendChild(note);
          part.appendChild(measure);
          xmlSource.value = new XMLSerializer().serializeToString(doc);
          dirty.value = true;
          renderXML(xmlSource.value);
        } catch (e) {
          status.value = t.value.error + ': ' + e.message;
        }
      }

      function removeMeasure() {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(xmlSource.value, 'text/xml');
          const measures = doc.querySelectorAll('measure');
          if (measures.length <= 1) return;
          measures[measures.length - 1].remove();
          xmlSource.value = new XMLSerializer().serializeToString(doc);
          dirty.value = true;
          renderXML(xmlSource.value);
        } catch (e) {
          status.value = t.value.error + ': ' + e.message;
        }
      }

      // ── File Operations ──
      async function newFile() {
        loadTemplate('blank');
        scoreTitle.value = 'Untitled';
        scoreComposer.value = '';
      }

      async function openFile() {
        if (window.FileDialog) {
          const fp = await window.FileDialog.open({ filter: ['.musicxml', '.xml', '.mxl'] });
          if (!fp) return;
          try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch('/api/fs/read?path=' + encodeURIComponent(fp), {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) throw new Error('Read failed');
            xmlSource.value = await res.text();
            filePath.value = fp;
            dirty.value = false;
            parseMetaFromXML();
            renderXML(xmlSource.value);
          } catch (e) { status.value = t.value.error + ': ' + e.message; }
        }
      }

      async function saveFile() {
        if (!filePath.value) { saveFileAs(); return; }
        try {
          const token = localStorage.getItem('auth_token');
          await fetch('/api/fs/write', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ path: filePath.value, content: xmlSource.value })
          });
          dirty.value = false;
        } catch (e) { status.value = t.value.error + ': ' + e.message; }
      }

      async function saveFileAs() {
        if (window.FileDialog) {
          const fp = await window.FileDialog.save({ defaultName: (scoreTitle.value || 'score') + '.musicxml', filter: ['.musicxml'] });
          if (!fp) return;
          filePath.value = fp;
          await saveFile();
        }
      }

      function importFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.musicxml,.xml,.mxl';
        input.onchange = () => {
          const file = input.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            xmlSource.value = reader.result;
            dirty.value = false;
            filePath.value = '';
            parseMetaFromXML();
            renderXML(xmlSource.value);
          };
          reader.readAsText(file);
        };
        input.click();
      }

      function exportXml() {
        const blob = new Blob([xmlSource.value], { type: 'application/xml' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = (scoreTitle.value || 'score') + '.musicxml';
        a.click();
        URL.revokeObjectURL(a.href);
      }

      function exportPng() {
        if (!osmdContainer.value) return;
        const svg = osmdContainer.value.querySelector('svg');
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const bbox = svg.getBoundingClientRect();
        canvas.width = bbox.width * 2;
        canvas.height = bbox.height * 2;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const img = new Image();
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          const a = document.createElement('a');
          a.href = canvas.toDataURL('image/png');
          a.download = (scoreTitle.value || 'score') + '.png';
          a.click();
        };
        img.src = url;
      }

      // ── Zoom ──
      function zoomIn() {
        zoom.value = Math.min(zoom.value + 0.1, 3.0);
        if (osmd) { osmd.zoom = zoom.value; osmd.render(); }
      }
      function zoomOut() {
        zoom.value = Math.max(zoom.value - 0.1, 0.3);
        if (osmd) { osmd.zoom = zoom.value; osmd.render(); }
      }
      function zoomReset() {
        zoom.value = 1.0;
        if (osmd) { osmd.zoom = 1.0; osmd.render(); }
      }

      // ── Source tab sync ──
      function onSourceInput(e) {
        xmlSource.value = e.target.value;
        dirty.value = true;
      }

      function applySource() {
        parseMetaFromXML();
        renderXML(xmlSource.value);
      }

      // ── Meta update ──
      function updateMeta() {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(xmlSource.value, 'text/xml');
          let wt = doc.querySelector('work-title');
          if (wt) wt.textContent = scoreTitle.value;
          let cr = doc.querySelector('creator[type="composer"]');
          if (!cr && scoreComposer.value) {
            const id = doc.querySelector('identification');
            if (id) {
              cr = doc.createElement('creator');
              cr.setAttribute('type', 'composer');
              cr.textContent = scoreComposer.value;
              id.appendChild(cr);
            }
          } else if (cr) {
            cr.textContent = scoreComposer.value;
          }
          const pm = doc.querySelector('per-minute');
          if (pm) pm.textContent = scoreTempo.value;
          xmlSource.value = new XMLSerializer().serializeToString(doc);
          dirty.value = true;
          renderXML(xmlSource.value);
        } catch {}
      }

      // ── MIDI Playback (Web Audio API) ──
      let audioCtx = null;
      const playing = ref(false);
      let playTimeouts = [];

      function noteToFreq(step, octave, alter) {
        const semitones = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
        const midi = 12 + (octave * 12) + (semitones[step] || 0) + (alter || 0);
        return 440 * Math.pow(2, (midi - 69) / 12);
      }

      function playScore() {
        if (playing.value) { stopPlayback(); return; }
        if (!xmlSource.value) return;
        try {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          playing.value = true;
          const parser = new DOMParser();
          const doc = parser.parseFromString(xmlSource.value, 'text/xml');
          const notes = doc.querySelectorAll('note');
          const bpm = scoreTempo.value || 120;
          const beatDur = 60 / bpm;
          let time = 0;

          notes.forEach(n => {
            const isRest = n.querySelector('rest');
            const durEl = n.querySelector('duration');
            const divisions = durEl ? parseInt(durEl.textContent) : 4;
            const noteDur = (divisions / 4) * beatDur;

            if (!isRest) {
              const stepEl = n.querySelector('step');
              const octEl = n.querySelector('octave');
              const altEl = n.querySelector('alter');
              if (stepEl && octEl) {
                const freq = noteToFreq(stepEl.textContent, parseInt(octEl.textContent), altEl ? parseInt(altEl.textContent) : 0);
                const t = time;
                const tid = setTimeout(() => {
                  const osc = audioCtx.createOscillator();
                  const gain = audioCtx.createGain();
                  osc.connect(gain);
                  gain.connect(audioCtx.destination);
                  osc.type = 'triangle';
                  osc.frequency.value = freq;
                  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
                  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + noteDur * 0.9);
                  osc.start(audioCtx.currentTime);
                  osc.stop(audioCtx.currentTime + noteDur);
                }, t * 1000);
                playTimeouts.push(tid);
              }
            }
            time += noteDur;
          });

          const endTid = setTimeout(() => { playing.value = false; }, time * 1000 + 200);
          playTimeouts.push(endTid);
        } catch (e) {
          status.value = t.value.error + ': ' + e.message;
          playing.value = false;
        }
      }

      function stopPlayback() {
        playTimeouts.forEach(id => clearTimeout(id));
        playTimeouts = [];
        if (audioCtx) { audioCtx.close(); audioCtx = null; }
        playing.value = false;
      }

      // ── Watch tab switch ──
      watch(activeTab, (tab) => {
        if (tab === 'visual' && xmlSource.value) {
          nextTick(() => renderXML(xmlSource.value));
        }
      });

      // ── Locale ──
      function onLocaleChanged(e) {
        if (e.detail && e.detail.locale) locale.value = e.detail.locale;
      }

      onMounted(() => {
        window.addEventListener('locale-changed', onLocaleChanged);
        initOSMD().then(() => loadTemplate('blank'));
      });

      onBeforeUnmount(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
        stopPlayback();
      });

      return {
        t, activeTab, xmlSource, osmdContainer, xmlEditor,
        zoom, status, dirty, filePath, osmdReady,
        selNote, selOctave, selDuration, selAccidental, selDot,
        scoreTitle, scoreComposer, scoreBeats, scoreBeatType, scoreTempo, scoreClef,
        NOTE_NAMES, DURATIONS,
        newFile, openFile, saveFile, saveFileAs, importFile, exportXml, exportPng,
        loadTemplate, addNoteToXml, addRestToXml, addMeasure, removeMeasure,
        zoomIn, zoomOut, zoomReset,
        onSourceInput, applySource, updateMeta,
        playing, playScore, stopPlayback
      };
    }
  };
})(Vue);
