(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, nextTick, watch } = Vue;

  const MAX_HISTORY = 50;

  const LANGS = {
    tr: {
      paint:'Boya', stamp:'Damga', lines:'Çizgi', shapes:'Şekiller', text:'Metin',
      magic:'Sihir', eraser:'Silgi', undo:'Geri Al', redo:'Yinele',
      newCanvas:'Yeni', save:'Kaydet', saveAs:'Farklı Kaydet', open:'Aç', saved:'Kaydedildi', error:'Hata',
      brushSize:'Fırça Boyutu', color:'Renk', stampSize:'Damga Boyutu',
      animals:'Hayvanlar', nature:'Doğa', food:'Yiyecek', transport:'Ulaşım',
      faces:'Yüzler', objects:'Nesneler', weather:'Hava', music:'Müzik',
      sports:'Spor', flags:'Bayraklar', symbols:'Semboller', fantasy:'Fantazi',
      rainbow:'Gökkuşağı', blur:'Bulanık', sparkle:'Parıltı', mirror:'Ayna',
      negative:'Negatif', grayscale:'Gri Ton', pixelate:'Piksel', emboss:'Kabartma',
      darken:'Karart', lighten:'Aydınlat', smudge:'Leke', kaleidoscope:'Kaleydoskop',
      line:'Düz Çizgi', rect:'Dikdörtgen', ellipse:'Elips', triangle:'Üçgen',
      star:'Yıldız', heart:'Kalp', arrow:'Ok', diamond:'Elmas',
      filled:'Dolu', outline:'Çerçeve',
      small:'Küçük', medium:'Orta', large:'Büyük',
      download:'İndir (PNG)', clear:'Temizle',
      fontFamily:'Yazı Tipi', fontSize:'Yazı Boyutu'
    },
    en: {
      paint:'Paint', stamp:'Stamp', lines:'Lines', shapes:'Shapes', text:'Text',
      magic:'Magic', eraser:'Eraser', undo:'Undo', redo:'Redo',
      newCanvas:'New', save:'Save', saveAs:'Save As', open:'Open', saved:'Saved', error:'Error',
      brushSize:'Brush Size', color:'Color', stampSize:'Stamp Size',
      animals:'Animals', nature:'Nature', food:'Food', transport:'Transport',
      faces:'Faces', objects:'Objects', weather:'Weather', music:'Music',
      sports:'Sports', flags:'Flags', symbols:'Symbols', fantasy:'Fantasy',
      rainbow:'Rainbow', blur:'Blur', sparkle:'Sparkle', mirror:'Mirror',
      negative:'Negative', grayscale:'Grayscale', pixelate:'Pixelate', emboss:'Emboss',
      darken:'Darken', lighten:'Lighten', smudge:'Smudge', kaleidoscope:'Kaleidoscope',
      line:'Line', rect:'Rectangle', ellipse:'Ellipse', triangle:'Triangle',
      star:'Star', heart:'Heart', arrow:'Arrow', diamond:'Diamond',
      filled:'Filled', outline:'Outline',
      small:'Small', medium:'Medium', large:'Large',
      download:'Download (PNG)', clear:'Clear',
      fontFamily:'Font', fontSize:'Font Size'
    },
    de: {
      paint:'Malen', stamp:'Stempel', lines:'Linien', shapes:'Formen', text:'Text',
      magic:'Magie', eraser:'Radierer', undo:'Rückgängig', redo:'Wiederholen',
      newCanvas:'Neu', save:'Speichern', saveAs:'Speichern unter', open:'Öffnen', saved:'Gespeichert', error:'Fehler',
      brushSize:'Pinselgröße', color:'Farbe', stampSize:'Stempelgröße',
      animals:'Tiere', nature:'Natur', food:'Essen', transport:'Transport',
      faces:'Gesichter', objects:'Objekte', weather:'Wetter', music:'Musik',
      sports:'Sport', flags:'Flaggen', symbols:'Symbole', fantasy:'Fantasie',
      rainbow:'Regenbogen', blur:'Unschärfe', sparkle:'Glitzer', mirror:'Spiegel',
      negative:'Negativ', grayscale:'Graustufen', pixelate:'Verpixeln', emboss:'Prägen',
      darken:'Abdunkeln', lighten:'Aufhellen', smudge:'Verwischen', kaleidoscope:'Kaleidoskop',
      line:'Linie', rect:'Rechteck', ellipse:'Ellipse', triangle:'Dreieck',
      star:'Stern', heart:'Herz', arrow:'Pfeil', diamond:'Diamant',
      filled:'Gefüllt', outline:'Umriss',
      small:'Klein', medium:'Mittel', large:'Groß',
      download:'Herunterladen (PNG)', clear:'Löschen',
      fontFamily:'Schriftart', fontSize:'Schriftgröße'
    },
    fr: {
      paint:'Peindre', stamp:'Tampon', lines:'Lignes', shapes:'Formes', text:'Texte',
      magic:'Magie', eraser:'Gomme', undo:'Annuler', redo:'Rétablir',
      newCanvas:'Nouveau', save:'Enregistrer', saveAs:'Enregistrer sous', open:'Ouvrir', saved:'Enregistré', error:'Erreur',
      brushSize:'Taille du pinceau', color:'Couleur', stampSize:'Taille du tampon',
      animals:'Animaux', nature:'Nature', food:'Nourriture', transport:'Transport',
      faces:'Visages', objects:'Objets', weather:'Météo', music:'Musique',
      sports:'Sports', flags:'Drapeaux', symbols:'Symboles', fantasy:'Fantaisie',
      rainbow:'Arc-en-ciel', blur:'Flou', sparkle:'Étincelle', mirror:'Miroir',
      negative:'Négatif', grayscale:'Niveaux de gris', pixelate:'Pixeliser', emboss:'Relief',
      darken:'Assombrir', lighten:'Éclaircir', smudge:'Tache', kaleidoscope:'Kaléidoscope',
      line:'Ligne', rect:'Rectangle', ellipse:'Ellipse', triangle:'Triangle',
      star:'Étoile', heart:'Cœur', arrow:'Flèche', diamond:'Diamant',
      filled:'Rempli', outline:'Contour',
      small:'Petit', medium:'Moyen', large:'Grand',
      download:'Télécharger (PNG)', clear:'Effacer',
      fontFamily:'Police', fontSize:'Taille de police'
    },
    es: {
      paint:'Pintar', stamp:'Sello', lines:'Líneas', shapes:'Formas', text:'Texto',
      magic:'Magia', eraser:'Borrador', undo:'Deshacer', redo:'Rehacer',
      newCanvas:'Nuevo', save:'Guardar', saveAs:'Guardar como', open:'Abrir', saved:'Guardado', error:'Error',
      brushSize:'Tamaño', color:'Color', stampSize:'Tamaño del sello',
      animals:'Animales', nature:'Naturaleza', food:'Comida', transport:'Transporte',
      faces:'Caras', objects:'Objetos', weather:'Clima', music:'Música',
      sports:'Deportes', flags:'Banderas', symbols:'Símbolos', fantasy:'Fantasía',
      rainbow:'Arcoíris', blur:'Desenfoque', sparkle:'Brillo', mirror:'Espejo',
      negative:'Negativo', grayscale:'Escala de grises', pixelate:'Pixelar', emboss:'Relieve',
      darken:'Oscurecer', lighten:'Aclarar', smudge:'Difuminar', kaleidoscope:'Caleidoscopio',
      line:'Línea', rect:'Rectángulo', ellipse:'Elipse', triangle:'Triángulo',
      star:'Estrella', heart:'Corazón', arrow:'Flecha', diamond:'Diamante',
      filled:'Relleno', outline:'Contorno',
      small:'Pequeño', medium:'Mediano', large:'Grande',
      download:'Descargar (PNG)', clear:'Borrar',
      fontFamily:'Fuente', fontSize:'Tamaño de fuente'
    },
    ru: {
      paint:'Кисть', stamp:'Штамп', lines:'Линии', shapes:'Фигуры', text:'Текст',
      magic:'Магия', eraser:'Ластик', undo:'Отмена', redo:'Повтор',
      newCanvas:'Новый', save:'Сохранить', saveAs:'Сохранить как', open:'Открыть', saved:'Сохранено', error:'Ошибка',
      brushSize:'Размер кисти', color:'Цвет', stampSize:'Размер штампа',
      animals:'Животные', nature:'Природа', food:'Еда', transport:'Транспорт',
      faces:'Лица', objects:'Предметы', weather:'Погода', music:'Музыка',
      sports:'Спорт', flags:'Флаги', symbols:'Символы', fantasy:'Фантазия',
      rainbow:'Радуга', blur:'Размытие', sparkle:'Блеск', mirror:'Зеркало',
      negative:'Негатив', grayscale:'Оттенки серого', pixelate:'Пиксели', emboss:'Тиснение',
      darken:'Затемнить', lighten:'Осветлить', smudge:'Пятно', kaleidoscope:'Калейдоскоп',
      line:'Линия', rect:'Прямоугольник', ellipse:'Эллипс', triangle:'Треугольник',
      star:'Звезда', heart:'Сердце', arrow:'Стрелка', diamond:'Ромб',
      filled:'Залитый', outline:'Контур',
      small:'Маленький', medium:'Средний', large:'Большой',
      download:'Скачать (PNG)', clear:'Очистить',
      fontFamily:'Шрифт', fontSize:'Размер шрифта'
    },
    zh: { paint:'画笔', stamp:'印章', lines:'线条', shapes:'形状', text:'文字', magic:'魔法', eraser:'橡皮擦', undo:'撤销', redo:'重做', newCanvas:'新建', save:'保存', saveAs:'另存为', open:'打开', saved:'已保存', error:'错误', brushSize:'画笔大小', color:'颜色', stampSize:'印章大小', animals:'动物', nature:'自然', food:'食物', transport:'交通', faces:'表情', objects:'物品', weather:'天气', music:'音乐', sports:'运动', flags:'旗帜', symbols:'符号', fantasy:'幻想', rainbow:'彩虹', blur:'模糊', sparkle:'闪光', mirror:'镜像', negative:'负片', grayscale:'灰度', pixelate:'像素化', emboss:'浮雕', darken:'变暗', lighten:'变亮', smudge:'涂抹', kaleidoscope:'万花筒', line:'直线', rect:'矩形', ellipse:'椭圆', triangle:'三角形', star:'星形', heart:'心形', arrow:'箭头', diamond:'菱形', filled:'填充', outline:'轮廓', small:'小', medium:'中', large:'大', download:'下载(PNG)', clear:'清除', fontFamily:'字体', fontSize:'字号' },
    ja: { paint:'ペイント', stamp:'スタンプ', lines:'線', shapes:'図形', text:'テキスト', magic:'マジック', eraser:'消しゴム', undo:'元に戻す', redo:'やり直し', newCanvas:'新規', save:'保存', saveAs:'名前を付けて保存', open:'開く', saved:'保存済み', error:'エラー', brushSize:'ブラシサイズ', color:'色', stampSize:'スタンプサイズ', animals:'動物', nature:'自然', food:'食べ物', transport:'乗り物', faces:'顔', objects:'もの', weather:'天気', music:'音楽', sports:'スポーツ', flags:'旗', symbols:'記号', fantasy:'ファンタジー', rainbow:'虹', blur:'ぼかし', sparkle:'きらめき', mirror:'ミラー', negative:'ネガ', grayscale:'グレー', pixelate:'ピクセル', emboss:'エンボス', darken:'暗く', lighten:'明るく', smudge:'にじみ', kaleidoscope:'万華鏡', line:'直線', rect:'四角', ellipse:'楕円', triangle:'三角', star:'星', heart:'ハート', arrow:'矢印', diamond:'ひし形', filled:'塗りつぶし', outline:'枠線', small:'小', medium:'中', large:'大', download:'ダウンロード(PNG)', clear:'クリア', fontFamily:'フォント', fontSize:'サイズ' },
    it: { paint:'Pennello', stamp:'Timbro', lines:'Linee', shapes:'Forme', text:'Testo', magic:'Magia', eraser:'Gomma', undo:'Annulla', redo:'Ripeti', newCanvas:'Nuovo', save:'Salva', saveAs:'Salva con nome', open:'Apri', saved:'Salvato', error:'Errore', brushSize:'Dimensione pennello', color:'Colore', stampSize:'Dimensione timbro', animals:'Animali', nature:'Natura', food:'Cibo', transport:'Trasporto', faces:'Facce', objects:'Oggetti', weather:'Meteo', music:'Musica', sports:'Sport', flags:'Bandiere', symbols:'Simboli', fantasy:'Fantasia', rainbow:'Arcobaleno', blur:'Sfocatura', sparkle:'Scintilla', mirror:'Specchio', negative:'Negativo', grayscale:'Scala di grigi', pixelate:'Pixelizzare', emboss:'Rilievo', darken:'Scurire', lighten:'Schiarire', smudge:'Macchia', kaleidoscope:'Caleidoscopio', line:'Linea', rect:'Rettangolo', ellipse:'Ellisse', triangle:'Triangolo', star:'Stella', heart:'Cuore', arrow:'Freccia', diamond:'Diamante', filled:'Pieno', outline:'Contorno', small:'Piccolo', medium:'Medio', large:'Grande', download:'Scarica (PNG)', clear:'Cancella', fontFamily:'Font', fontSize:'Dimensione' }
  };

  /* ── Stamp Data (emoji-based) ── */
  var STAMPS = {
    animals: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🦅','🦆','🦉','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐢','🐍','🦎','🦖','🐙','🦑','🦀','🐠','🐟','🐬','🐳','🦈','🐊','🦩','🦚','🦜'],
    nature: ['🌸','🌺','🌻','🌹','🌷','🌼','🌿','🍀','🍁','🍂','🍃','🌲','🌳','🌴','🌵','🌾','🍄','💐','🪻','🪷','🪹','🌍','🌙','⭐','☀️','🌈','❄️','💧','🔥','🌊'],
    food: ['🍎','🍊','🍋','🍇','🍉','🍓','🫐','🍑','🍒','🥝','🍌','🥭','🍍','🥥','🍕','🍔','🌭','🍟','🌮','🍦','🍰','🧁','🍩','🍪','🎂','🍫','☕','🧃','🥤','🍿'],
    transport: ['🚗','🚕','🚌','🚎','🚑','🚒','🚓','🏎️','🚲','🛵','🏍️','🚁','✈️','🚀','🛸','🚢','⛵','🚂','🚃','🚄','🚅','🚇','🚠','🛶','🚜','🏗️'],
    faces: ['😀','😃','😄','😁','😆','😂','🤣','😊','😇','🙂','🤩','😍','🥳','😎','🤓','😜','🤪','😝','🤗','🤔','🫡','🤭','😱','😨','🥺','😢','😭','😤','🤯','😈'],
    objects: ['⚽','🏀','🎾','🏈','🎱','🎯','🎮','🕹️','🎲','🧩','🎭','🎨','🎸','🎹','🎺','🎻','🥁','📷','💻','📱','⌚','💡','🔑','🏠','🏰','⛺','🎪','🎡','🎢','🗽'],
    weather: ['☀️','🌤️','⛅','🌥️','☁️','🌦️','🌧️','⛈️','🌩️','🌨️','❄️','💨','🌪️','🌫️','🌈','☂️','⚡','💧','🔥','⛄'],
    music: ['🎵','🎶','🎼','🎤','🎧','🎸','🎹','🎺','🎻','🥁','🪘','🎷','🪈','📯','🔔','🎙️'],
    sports: ['⚽','🏀','🏈','⚾','🎾','🏐','🏉','🥏','🎱','🏓','🏸','🥊','🥋','⛳','🏄','🏊','🚴','🏋️','🤸','⛷️','🏂','🤺','🏇','🧗','🎣','🛹'],
    flags: ['🏁','🚩','🎌','🏴','🏳️','🇹🇷','🇺🇸','🇬🇧','🇩🇪','🇫🇷','🇪🇸','🇮🇹','🇯🇵','🇨🇳','🇷🇺','🇧🇷','🇰🇷','🇮🇳','🇦🇺','🇨🇦'],
    symbols: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','❣️','💕','💗','💖','✨','⭐','🌟','💫','🔥','💥','🎀','🎁','🎈','🎉','🎊','🏆','👑','💎','🔮','🪄','♾️'],
    fantasy: ['🧚','🧜','🧛','🧞','🧝','🧙','🦸','🦹','👸','🤴','👼','🎅','🤶','🧌','👻','💀','👽','🤖','🦄','🐉','🧊','🪐','🛸','🌌','🔮']
  };

  var MAGIC_EFFECTS = [
    { id: 'rainbow', icon: '🌈' },
    { id: 'blur', icon: '🌫️' },
    { id: 'sparkle', icon: '✨' },
    { id: 'mirror', icon: '🪞' },
    { id: 'negative', icon: '🔄' },
    { id: 'grayscale', icon: '🩶' },
    { id: 'pixelate', icon: '🟦' },
    { id: 'emboss', icon: '🗻' },
    { id: 'darken', icon: '🌑' },
    { id: 'lighten', icon: '☀️' },
    { id: 'kaleidoscope', icon: '🔶' }
  ];

  var SHAPE_TYPES = [
    { id: 'rect', icon: '⬜' },
    { id: 'ellipse', icon: '⭕' },
    { id: 'triangle', icon: '🔺' },
    { id: 'star', icon: '⭐' },
    { id: 'heart', icon: '❤️' },
    { id: 'arrow', icon: '➡️' },
    { id: 'diamond', icon: '💎' }
  ];

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  return {
    setup() {
      var locale = ref(getLocale());
      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }
      function t(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      // ── Refs ──
      var mainCanvas = ref(null);
      var prevCanvas = ref(null);
      var canvasWrap = ref(null);

      var canvasW = 800, canvasH = 520;
      var ctx = null, prevCtx = null;

      // ── Tool state ──
      var activeTool = ref('paint');      // paint, stamp, lines, shapes, text, magic, eraser
      var brushSize = ref(6);
      var fgColor = ref('#000000');
      var bgColor = ref('#ffffff');
      var stampCategory = ref('animals');
      var selectedStamp = ref('🐶');
      var stampSize = ref(48);
      var shapeType = ref('rect');
      var shapeFilled = ref(true);
      var magicEffect = ref('rainbow');
      var textContent = ref('');
      var textFontSize = ref(28);
      var textFont = ref('sans-serif');
      var textPlacing = ref(false);

      // Drawing state
      var drawing = false;
      var startX = 0, startY = 0, lastX = 0, lastY = 0;
      var rainbowHue = 0;

      // History
      var historyStack = [];
      var historyIdx = ref(-1);
      var canUndo = ref(false);
      var canRedo = ref(false);

      // ── Palette ──
      var palette = [
        '#000000','#ffffff','#808080','#c0c0c0',
        '#800000','#ff0000','#ff6b6b','#ff8c00',
        '#ffa500','#ffff00','#f6d365','#008000',
        '#00ff00','#2ecc71','#008080','#00ffff',
        '#4ecdc4','#000080','#0000ff','#4a90d9',
        '#800080','#ff00ff','#a29bfe','#6c5ce7',
        '#a0522d','#deb887','#ff69b4','#ff1493',
        '#ffe4c4','#1abc9c'
      ];

      var stampCategories = computed(function() {
        return Object.keys(STAMPS);
      });

      var currentStamps = computed(function() {
        return STAMPS[stampCategory.value] || [];
      });

      // ── Init ──
      function initCanvas() {
        var c = mainCanvas.value;
        var p = prevCanvas.value;
        if (!c || !p) return;
        c.width = canvasW; c.height = canvasH;
        p.width = canvasW; p.height = canvasH;
        ctx = c.getContext('2d');
        prevCtx = p.getContext('2d');
        ctx.fillStyle = bgColor.value;
        ctx.fillRect(0, 0, canvasW, canvasH);
        pushHistory();
      }

      // ── History ──
      function pushHistory() {
        if (!ctx) return;
        if (historyIdx.value < historyStack.length - 1) {
          historyStack = historyStack.slice(0, historyIdx.value + 1);
        }
        historyStack.push(mainCanvas.value.toDataURL());
        if (historyStack.length > MAX_HISTORY) historyStack.shift();
        historyIdx.value = historyStack.length - 1;
        updateHistoryFlags();
      }

      function updateHistoryFlags() {
        canUndo.value = historyIdx.value > 0;
        canRedo.value = historyIdx.value < historyStack.length - 1;
      }

      function restoreHistory(idx) {
        if (!ctx || idx < 0 || idx >= historyStack.length) return;
        var img = new Image();
        img.onload = function() { ctx.clearRect(0, 0, canvasW, canvasH); ctx.drawImage(img, 0, 0); };
        img.src = historyStack[idx];
      }

      function undo() { if (historyIdx.value <= 0) return; historyIdx.value--; restoreHistory(historyIdx.value); updateHistoryFlags(); }
      function redo() { if (historyIdx.value >= historyStack.length - 1) return; historyIdx.value++; restoreHistory(historyIdx.value); updateHistoryFlags(); }

      // ── Canvas position helper ──
      function getPos(e) {
        var c = mainCanvas.value;
        var rect = c.getBoundingClientRect();
        var scaleX = canvasW / rect.width;
        var scaleY = canvasH / rect.height;
        var clientX, clientY;
        if (e.touches && e.touches.length > 0) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
        else { clientX = e.clientX; clientY = e.clientY; }
        return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
      }

      // ── Paint brush ──
      function paintDraw(x, y, isStart) {
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.strokeStyle = fgColor.value;
        ctx.lineWidth = brushSize.value;
        if (isStart) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 0.1, y); ctx.stroke(); }
        else { ctx.lineTo(x, y); ctx.stroke(); }
      }

      // ── Rainbow brush for magic ──
      function rainbowDraw(x, y, isStart) {
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        rainbowHue = (rainbowHue + 3) % 360;
        ctx.strokeStyle = 'hsl(' + rainbowHue + ',100%,50%)';
        ctx.lineWidth = brushSize.value;
        if (isStart) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 0.1, y); ctx.stroke(); }
        else { ctx.lineTo(x, y); ctx.stroke(); }
      }

      // ── Sparkle effect ──
      function drawSparkles(x, y) {
        var count = 6 + Math.floor(Math.random() * 8);
        for (var i = 0; i < count; i++) {
          var sx = x + (Math.random() - 0.5) * brushSize.value * 4;
          var sy = y + (Math.random() - 0.5) * brushSize.value * 4;
          var size = 1 + Math.random() * 3;
          ctx.save();
          ctx.globalAlpha = 0.5 + Math.random() * 0.5;
          ctx.fillStyle = 'hsl(' + Math.floor(Math.random() * 360) + ',100%,70%)';
          ctx.beginPath(); ctx.arc(sx, sy, size, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
      }

      // ── Apply magic effect on entire canvas ──
      function applyMagicEffect(effectId) {
        if (!ctx) return;
        var imgData = ctx.getImageData(0, 0, canvasW, canvasH);
        var data = imgData.data;
        switch (effectId) {
          case 'negative':
            for (var i = 0; i < data.length; i += 4) { data[i] = 255 - data[i]; data[i + 1] = 255 - data[i + 1]; data[i + 2] = 255 - data[i + 2]; }
            ctx.putImageData(imgData, 0, 0);
            pushHistory();
            break;
          case 'grayscale':
            for (var i = 0; i < data.length; i += 4) { var avg = (data[i] + data[i + 1] + data[i + 2]) / 3; data[i] = avg; data[i + 1] = avg; data[i + 2] = avg; }
            ctx.putImageData(imgData, 0, 0);
            pushHistory();
            break;
          case 'pixelate':
            var ps = 8;
            for (var yy = 0; yy < canvasH; yy += ps) {
              for (var xx = 0; xx < canvasW; xx += ps) {
                var idx = (yy * canvasW + xx) * 4;
                var r = data[idx], g = data[idx + 1], b = data[idx + 2];
                for (var dy = 0; dy < ps && yy + dy < canvasH; dy++) {
                  for (var dx = 0; dx < ps && xx + dx < canvasW; dx++) {
                    var pi = ((yy + dy) * canvasW + (xx + dx)) * 4;
                    data[pi] = r; data[pi + 1] = g; data[pi + 2] = b;
                  }
                }
              }
            }
            ctx.putImageData(imgData, 0, 0);
            pushHistory();
            break;
          case 'blur':
            ctx.save();
            ctx.filter = 'blur(3px)';
            ctx.drawImage(mainCanvas.value, 0, 0);
            ctx.restore();
            pushHistory();
            break;
          case 'emboss':
            var src = new Uint8ClampedArray(data);
            for (var y2 = 1; y2 < canvasH - 1; y2++) {
              for (var x2 = 1; x2 < canvasW - 1; x2++) {
                var i2 = (y2 * canvasW + x2) * 4;
                var i3 = ((y2 - 1) * canvasW + (x2 - 1)) * 4;
                for (var c = 0; c < 3; c++) {
                  data[i2 + c] = Math.min(255, Math.max(0, 128 + src[i2 + c] - src[i3 + c]));
                }
              }
            }
            ctx.putImageData(imgData, 0, 0);
            pushHistory();
            break;
          case 'darken':
            for (var i = 0; i < data.length; i += 4) { data[i] = Math.max(0, data[i] - 30); data[i + 1] = Math.max(0, data[i + 1] - 30); data[i + 2] = Math.max(0, data[i + 2] - 30); }
            ctx.putImageData(imgData, 0, 0);
            pushHistory();
            break;
          case 'lighten':
            for (var i = 0; i < data.length; i += 4) { data[i] = Math.min(255, data[i] + 30); data[i + 1] = Math.min(255, data[i + 1] + 30); data[i + 2] = Math.min(255, data[i + 2] + 30); }
            ctx.putImageData(imgData, 0, 0);
            pushHistory();
            break;
          case 'mirror':
            var tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvasW; tempCanvas.height = canvasH;
            var tCtx = tempCanvas.getContext('2d');
            tCtx.drawImage(mainCanvas.value, 0, 0);
            ctx.save();
            ctx.translate(canvasW, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(tempCanvas, 0, 0);
            ctx.restore();
            pushHistory();
            break;
          case 'kaleidoscope':
            var tempC2 = document.createElement('canvas');
            tempC2.width = canvasW; tempC2.height = canvasH;
            var tC2 = tempC2.getContext('2d');
            tC2.drawImage(mainCanvas.value, 0, 0);
            // Top-left quadrant → mirror to all 4
            var hw = canvasW / 2, hh = canvasH / 2;
            ctx.save();
            ctx.translate(canvasW, 0); ctx.scale(-1, 1);
            ctx.drawImage(tempC2, 0, 0, hw, hh, 0, 0, hw, hh);
            ctx.restore();
            ctx.save();
            ctx.translate(0, canvasH); ctx.scale(1, -1);
            ctx.drawImage(mainCanvas.value, 0, 0, canvasW, hh, 0, 0, canvasW, hh);
            ctx.restore();
            pushHistory();
            break;
        }
      }

      // ── Eraser ──
      function eraseDraw(x, y, isStart) {
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.strokeStyle = bgColor.value;
        ctx.lineWidth = brushSize.value * 2;
        if (isStart) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 0.1, y); ctx.stroke(); }
        else { ctx.lineTo(x, y); ctx.stroke(); }
      }

      // ── Stamp ──
      function placeStamp(x, y) {
        var sz = stampSize.value;
        ctx.font = sz + 'px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(selectedStamp.value, x, y);
        pushHistory();
      }

      // ── Text ──
      function placeText(x, y) {
        if (!textContent.value.trim()) return;
        ctx.font = textFontSize.value + 'px ' + textFont.value;
        ctx.fillStyle = fgColor.value;
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText(textContent.value, x, y);
        pushHistory();
      }

      // ── Shapes helpers ──
      function drawShapeOnCtx(targetCtx, shape, x1, y1, x2, y2, filled, color, lineW) {
        targetCtx.strokeStyle = color;
        targetCtx.fillStyle = color;
        targetCtx.lineWidth = lineW;
        targetCtx.lineCap = 'round';
        var cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
        var w = Math.abs(x2 - x1), h = Math.abs(y2 - y1);
        var mnX = Math.min(x1, x2), mnY = Math.min(y1, y2);
        targetCtx.beginPath();
        switch (shape) {
          case 'rect':
            if (filled) targetCtx.fillRect(mnX, mnY, w, h);
            else targetCtx.strokeRect(mnX, mnY, w, h);
            return;
          case 'ellipse':
            targetCtx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2);
            break;
          case 'triangle':
            targetCtx.moveTo(cx, mnY); targetCtx.lineTo(mnX, mnY + h); targetCtx.lineTo(mnX + w, mnY + h); targetCtx.closePath();
            break;
          case 'star':
            var spikes = 5, outerR = Math.min(w, h) / 2, innerR = outerR * 0.4;
            for (var i = 0; i < spikes * 2; i++) {
              var r = i % 2 === 0 ? outerR : innerR;
              var ang = (Math.PI * i / spikes) - Math.PI / 2;
              var sx = cx + r * Math.cos(ang), sy = cy + r * Math.sin(ang);
              if (i === 0) targetCtx.moveTo(sx, sy); else targetCtx.lineTo(sx, sy);
            }
            targetCtx.closePath();
            break;
          case 'heart':
            var topCurveH = h * 0.3;
            targetCtx.moveTo(cx, mnY + topCurveH);
            targetCtx.bezierCurveTo(cx, mnY, mnX, mnY, mnX, mnY + topCurveH);
            targetCtx.bezierCurveTo(mnX, cy, cx, cy + h * 0.2, cx, mnY + h);
            targetCtx.moveTo(cx, mnY + topCurveH);
            targetCtx.bezierCurveTo(cx, mnY, mnX + w, mnY, mnX + w, mnY + topCurveH);
            targetCtx.bezierCurveTo(mnX + w, cy, cx, cy + h * 0.2, cx, mnY + h);
            break;
          case 'arrow':
            var aw = w * 0.15;
            targetCtx.moveTo(mnX, cy - aw); targetCtx.lineTo(mnX + w * 0.65, cy - aw);
            targetCtx.lineTo(mnX + w * 0.65, mnY); targetCtx.lineTo(mnX + w, cy);
            targetCtx.lineTo(mnX + w * 0.65, mnY + h); targetCtx.lineTo(mnX + w * 0.65, cy + aw);
            targetCtx.lineTo(mnX, cy + aw); targetCtx.closePath();
            break;
          case 'diamond':
            targetCtx.moveTo(cx, mnY); targetCtx.lineTo(mnX + w, cy); targetCtx.lineTo(cx, mnY + h); targetCtx.lineTo(mnX, cy); targetCtx.closePath();
            break;
        }
        if (filled) targetCtx.fill(); else targetCtx.stroke();
      }

      // ── Line draw ──
      function drawLineOnCtx(targetCtx, x1, y1, x2, y2, color, lineW) {
        targetCtx.strokeStyle = color;
        targetCtx.lineWidth = lineW;
        targetCtx.lineCap = 'round';
        targetCtx.beginPath(); targetCtx.moveTo(x1, y1); targetCtx.lineTo(x2, y2); targetCtx.stroke();
      }

      // ── Mouse/Touch handlers ──
      function onPointerDown(e) {
        e.preventDefault();
        var pos = getPos(e);
        startX = pos.x; startY = pos.y; lastX = pos.x; lastY = pos.y;
        drawing = true;

        if (activeTool.value === 'stamp') { placeStamp(pos.x, pos.y); drawing = false; return; }
        if (activeTool.value === 'text') { placeText(pos.x, pos.y); drawing = false; return; }
        if (activeTool.value === 'magic') {
          var eff = magicEffect.value;
          if (eff === 'rainbow') { rainbowDraw(pos.x, pos.y, true); }
          else if (eff === 'sparkle') { drawSparkles(pos.x, pos.y); }
          else { applyMagicEffect(eff); drawing = false; }
          return;
        }
        if (activeTool.value === 'paint') { ctx.beginPath(); ctx.moveTo(pos.x, pos.y); paintDraw(pos.x, pos.y, true); return; }
        if (activeTool.value === 'eraser') { ctx.beginPath(); ctx.moveTo(pos.x, pos.y); eraseDraw(pos.x, pos.y, true); return; }
      }

      function onPointerMove(e) {
        if (!drawing) return;
        e.preventDefault();
        var pos = getPos(e);

        if (activeTool.value === 'paint') { paintDraw(pos.x, pos.y, false); }
        else if (activeTool.value === 'eraser') { eraseDraw(pos.x, pos.y, false); }
        else if (activeTool.value === 'magic' && magicEffect.value === 'rainbow') { rainbowDraw(pos.x, pos.y, false); }
        else if (activeTool.value === 'magic' && magicEffect.value === 'sparkle') { drawSparkles(pos.x, pos.y); }
        else if (activeTool.value === 'lines' || activeTool.value === 'shapes') {
          // Preview
          prevCtx.clearRect(0, 0, canvasW, canvasH);
          if (activeTool.value === 'lines') {
            drawLineOnCtx(prevCtx, startX, startY, pos.x, pos.y, fgColor.value, brushSize.value);
          } else {
            drawShapeOnCtx(prevCtx, shapeType.value, startX, startY, pos.x, pos.y, shapeFilled.value, fgColor.value, brushSize.value);
          }
        }
        lastX = pos.x; lastY = pos.y;
      }

      function onPointerUp(e) {
        if (!drawing) return;
        drawing = false;
        if (activeTool.value === 'paint' || activeTool.value === 'eraser') { pushHistory(); }
        else if (activeTool.value === 'magic' && (magicEffect.value === 'rainbow' || magicEffect.value === 'sparkle')) { pushHistory(); }
        else if (activeTool.value === 'lines') {
          prevCtx.clearRect(0, 0, canvasW, canvasH);
          var pos = e.changedTouches ? { x: lastX, y: lastY } : getPos(e);
          drawLineOnCtx(ctx, startX, startY, pos.x, pos.y, fgColor.value, brushSize.value);
          pushHistory();
        } else if (activeTool.value === 'shapes') {
          prevCtx.clearRect(0, 0, canvasW, canvasH);
          var pos = e.changedTouches ? { x: lastX, y: lastY } : getPos(e);
          drawShapeOnCtx(ctx, shapeType.value, startX, startY, pos.x, pos.y, shapeFilled.value, fgColor.value, brushSize.value);
          pushHistory();
        }
      }

      // ── State for file path ──
      var currentFilePath = ref('');
      var currentFileName = ref('');

      var IMG_FILTERS = [
        { label: 'Images', extensions: ['.png', '.jpg', '.jpeg', '.bmp', '.gif', '.webp'] }
      ];

      function authToken() {
        return localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
      }

      // ── File ops ──
      function newCanvas() {
        if (!ctx) return;
        ctx.fillStyle = bgColor.value;
        ctx.fillRect(0, 0, canvasW, canvasH);
        currentFilePath.value = '';
        currentFileName.value = '';
        pushHistory();
      }

      function downloadPNG() {
        var link = document.createElement('a');
        link.download = currentFileName.value || 'stamppaint_' + Date.now() + '.png';
        link.href = mainCanvas.value.toDataURL('image/png');
        link.click();
      }

      async function openFile() {
        if (!window.FileDialog) return;
        var result = await window.FileDialog.open({
          title: '📂 ' + t('open'),
          filters: IMG_FILTERS
        });
        if (!result) return;
        try {
          var resp = await fetch('/api/fs/read-binary?path=' + encodeURIComponent(result.path), {
            headers: { 'Authorization': 'Bearer ' + authToken() }
          });
          if (!resp.ok) { ElMessage.error(t('error')); return; }
          var data = await resp.json();
          var ext = (result.name.split('.').pop() || 'png').toLowerCase();
          var mimeMap = { png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg', bmp:'image/bmp', gif:'image/gif', webp:'image/webp' };
          var mime = mimeMap[ext] || 'image/png';
          var img = new Image();
          img.onload = function() {
            ctx.clearRect(0, 0, canvasW, canvasH);
            ctx.fillStyle = bgColor.value;
            ctx.fillRect(0, 0, canvasW, canvasH);
            ctx.drawImage(img, 0, 0, canvasW, canvasH);
            pushHistory();
          };
          img.src = 'data:' + mime + ';base64,' + data.content;
          currentFilePath.value = result.path;
          currentFileName.value = result.name;
        } catch (e) { ElMessage.error(t('error')); }
      }

      async function saveFile() {
        if (currentFilePath.value) {
          await saveToPath(currentFilePath.value);
        } else {
          await saveFileAs();
        }
      }

      async function saveFileAs() {
        if (!window.FileDialog || !mainCanvas.value) return;
        var result = await window.FileDialog.save({
          title: '💾 ' + t('saveAs'),
          defaultName: currentFileName.value || 'stamppaint_' + Date.now() + '.png',
          filters: [
            { label: 'PNG', extensions: ['.png'] },
            { label: 'JPEG', extensions: ['.jpg', '.jpeg'] }
          ]
        });
        if (!result) return;
        currentFilePath.value = result.path;
        currentFileName.value = result.name;
        await saveToPath(result.path);
      }

      async function saveToPath(filePath) {
        if (!mainCanvas.value) return;
        try {
          var ext = (filePath.split('.').pop() || 'png').toLowerCase();
          var mime = (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : 'image/png';
          var dataUrl = mainCanvas.value.toDataURL(mime);
          var b64 = dataUrl.split(',')[1];
          var resp = await fetch('/api/fs/write-binary', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + authToken(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath: filePath, content: b64 })
          });
          if (resp.ok) { ElMessage.success(t('saved')); }
          else { ElMessage.error(t('error')); }
        } catch (e) { ElMessage.error(t('error')); }
      }

      // ── Lifecycle ──
      onMounted(function() {
        window.addEventListener('locale-changed', onLocaleChanged);
        nextTick(function() { initCanvas(); });
      });

      onUnmounted(function() {
        window.removeEventListener('locale-changed', onLocaleChanged);
      });

      return {
        t, locale, mainCanvas, prevCanvas, canvasWrap,
        activeTool, brushSize, fgColor, bgColor,
        stampCategory, selectedStamp, stampSize, currentStamps, stampCategories,
        shapeType, shapeFilled, magicEffect,
        textContent, textFontSize, textFont,
        canUndo, canRedo, palette,
        MAGIC_EFFECTS, SHAPE_TYPES,
        onPointerDown, onPointerMove, onPointerUp,
        currentFileName,
        undo, redo, newCanvas, downloadPNG, openFile, saveFile, saveFileAs
      };
    }
  };
})(Vue);
