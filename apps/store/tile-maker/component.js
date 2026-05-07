(function(Vue) {
  const { ref, reactive, computed, onMounted, onBeforeUnmount, watch, nextTick } = Vue;

  // ─── i18n ───
  const LANGS = {
    tr: {
      flat: 'Düz', isometric: 'İzometrik', tileSize: 'Tile Boyutu', customSize: 'Özel Boyut',
      width: 'Genişlik', height: 'Yükseklik', pencil: 'Kalem', eraser: 'Silgi', fill: 'Doldur',
      picker: 'Damlalık', line: 'Çizgi', rect: 'Dikdörtgen', ellipse: 'Elips', mirror: 'Ayna',
      mirrorH: 'Yatay Ayna', mirrorV: 'Dikey Ayna', color: 'Renk', palette: 'Palet',
      grid: 'Izgara', preview: 'Önizleme', undo: 'Geri Al', redo: 'Yinele', clear: 'Temizle',
      save: 'Kaydet', load: 'Yükle', exportPng: 'PNG Dışa Aktar', exportTileset: 'Tileset Dışa Aktar',
      newTile: 'Yeni Tile', zoom: 'Yakınlaştır', opacity: 'Opaklık', layers: 'Katmanlar',
      addLayer: 'Katman Ekle', deleteLayer: 'Katmanı Sil', mergeDown: 'Aşağı Birleştir',
      layerName: 'Katman', visible: 'Görünür', tileMode: 'Tile Modu', presets: 'Hazır Boyutlar',
      tilePreview: 'Tile Tekrar Önizleme', rotate90: '90° Döndür', flipH: 'Yatay Çevir',
      flipV: 'Dikey Çevir', isoPreview: 'İzometrik Önizleme', saveFailed: 'Kayıt başarısız',
      saved: 'Kaydedildi!', loaded: 'Yüklendi!', loadFailed: 'Yükleme başarısız',
      clearConfirm: 'Tüm pikseller silinecek. Emin misiniz?', confirm: 'Onayla', cancel: 'İptal',
      animation: 'Animasyon', addFrame: 'Kare Ekle', deleteFrame: 'Kare Sil', play: 'Oynat',
      stop: 'Durdur', fps: 'FPS', frame: 'Kare', duplicateFrame: 'Kareyi Kopyala',
      copies: 'Tekrar', tiledPreview: 'Tekrarlı Önizleme'
    },
    en: {
      flat: 'Flat', isometric: 'Isometric', tileSize: 'Tile Size', customSize: 'Custom Size',
      width: 'Width', height: 'Height', pencil: 'Pencil', eraser: 'Eraser', fill: 'Fill',
      picker: 'Picker', line: 'Line', rect: 'Rectangle', ellipse: 'Ellipse', mirror: 'Mirror',
      mirrorH: 'Mirror H', mirrorV: 'Mirror V', color: 'Color', palette: 'Palette',
      grid: 'Grid', preview: 'Preview', undo: 'Undo', redo: 'Redo', clear: 'Clear',
      save: 'Save', load: 'Load', exportPng: 'Export PNG', exportTileset: 'Export Tileset',
      newTile: 'New Tile', zoom: 'Zoom', opacity: 'Opacity', layers: 'Layers',
      addLayer: 'Add Layer', deleteLayer: 'Delete Layer', mergeDown: 'Merge Down',
      layerName: 'Layer', visible: 'Visible', tileMode: 'Tile Mode', presets: 'Presets',
      tilePreview: 'Tile Repeat Preview', rotate90: 'Rotate 90°', flipH: 'Flip H',
      flipV: 'Flip V', isoPreview: 'Isometric Preview', saveFailed: 'Save failed',
      saved: 'Saved!', loaded: 'Loaded!', loadFailed: 'Load failed',
      clearConfirm: 'All pixels will be cleared. Are you sure?', confirm: 'Confirm', cancel: 'Cancel',
      animation: 'Animation', addFrame: 'Add Frame', deleteFrame: 'Delete Frame', play: 'Play',
      stop: 'Stop', fps: 'FPS', frame: 'Frame', duplicateFrame: 'Duplicate Frame',
      copies: 'Copies', tiledPreview: 'Tiled Preview'
    },
    de: {
      flat: 'Flach', isometric: 'Isometrisch', tileSize: 'Tile-Größe', customSize: 'Benutzerdefiniert',
      width: 'Breite', height: 'Höhe', pencil: 'Stift', eraser: 'Radierer', fill: 'Füllen',
      picker: 'Pipette', line: 'Linie', rect: 'Rechteck', ellipse: 'Ellipse', mirror: 'Spiegel',
      mirrorH: 'H-Spiegel', mirrorV: 'V-Spiegel', color: 'Farbe', palette: 'Palette',
      grid: 'Raster', preview: 'Vorschau', undo: 'Rückgängig', redo: 'Wiederholen', clear: 'Löschen',
      save: 'Speichern', load: 'Laden', exportPng: 'PNG Exportieren', exportTileset: 'Tileset Exportieren',
      newTile: 'Neues Tile', zoom: 'Zoom', opacity: 'Deckkraft', layers: 'Ebenen',
      addLayer: 'Ebene hinzufügen', deleteLayer: 'Ebene löschen', mergeDown: 'Nach unten zusammenführen',
      layerName: 'Ebene', visible: 'Sichtbar', tileMode: 'Tile-Modus', presets: 'Vorlagen',
      tilePreview: 'Tile-Wiederholungsvorschau', rotate90: '90° Drehen', flipH: 'H Spiegeln',
      flipV: 'V Spiegeln', isoPreview: 'Isometrische Vorschau', saveFailed: 'Speichern fehlgeschlagen',
      saved: 'Gespeichert!', loaded: 'Geladen!', loadFailed: 'Laden fehlgeschlagen',
      clearConfirm: 'Alle Pixel werden gelöscht. Sind Sie sicher?', confirm: 'Bestätigen', cancel: 'Abbrechen',
      animation: 'Animation', addFrame: 'Bild hinzufügen', deleteFrame: 'Bild löschen', play: 'Abspielen',
      stop: 'Stoppen', fps: 'FPS', frame: 'Bild', duplicateFrame: 'Bild duplizieren',
      copies: 'Kopien', tiledPreview: 'Gekachelte Vorschau'
    },
    fr: {
      flat: 'Plat', isometric: 'Isométrique', tileSize: 'Taille du Tile', customSize: 'Taille personnalisée',
      width: 'Largeur', height: 'Hauteur', pencil: 'Crayon', eraser: 'Gomme', fill: 'Remplir',
      picker: 'Pipette', line: 'Ligne', rect: 'Rectangle', ellipse: 'Ellipse', mirror: 'Miroir',
      mirrorH: 'Miroir H', mirrorV: 'Miroir V', color: 'Couleur', palette: 'Palette',
      grid: 'Grille', preview: 'Aperçu', undo: 'Annuler', redo: 'Rétablir', clear: 'Effacer',
      save: 'Enregistrer', load: 'Charger', exportPng: 'Exporter PNG', exportTileset: 'Exporter Tileset',
      newTile: 'Nouveau Tile', zoom: 'Zoom', opacity: 'Opacité', layers: 'Calques',
      addLayer: 'Ajouter calque', deleteLayer: 'Supprimer calque', mergeDown: 'Fusionner vers le bas',
      layerName: 'Calque', visible: 'Visible', tileMode: 'Mode Tile', presets: 'Préréglages',
      tilePreview: 'Aperçu répétition', rotate90: 'Rotation 90°', flipH: 'Retourner H',
      flipV: 'Retourner V', isoPreview: 'Aperçu isométrique', saveFailed: 'Échec de l\'enregistrement',
      saved: 'Enregistré!', loaded: 'Chargé!', loadFailed: 'Échec du chargement',
      clearConfirm: 'Tous les pixels seront effacés. Êtes-vous sûr?', confirm: 'Confirmer', cancel: 'Annuler',
      animation: 'Animation', addFrame: 'Ajouter image', deleteFrame: 'Supprimer image', play: 'Lecture',
      stop: 'Arrêter', fps: 'IPS', frame: 'Image', duplicateFrame: 'Dupliquer image',
      copies: 'Copies', tiledPreview: 'Aperçu en mosaïque'
    },
    es: {
      flat: 'Plano', isometric: 'Isométrico', tileSize: 'Tamaño de Tile', customSize: 'Tamaño personalizado',
      width: 'Ancho', height: 'Alto', pencil: 'Lápiz', eraser: 'Borrador', fill: 'Rellenar',
      picker: 'Cuentagotas', line: 'Línea', rect: 'Rectángulo', ellipse: 'Elipse', mirror: 'Espejo',
      mirrorH: 'Espejo H', mirrorV: 'Espejo V', color: 'Color', palette: 'Paleta',
      grid: 'Cuadrícula', preview: 'Vista previa', undo: 'Deshacer', redo: 'Rehacer', clear: 'Limpiar',
      save: 'Guardar', load: 'Cargar', exportPng: 'Exportar PNG', exportTileset: 'Exportar Tileset',
      newTile: 'Nuevo Tile', zoom: 'Zoom', opacity: 'Opacidad', layers: 'Capas',
      addLayer: 'Añadir capa', deleteLayer: 'Eliminar capa', mergeDown: 'Fusionar abajo',
      layerName: 'Capa', visible: 'Visible', tileMode: 'Modo Tile', presets: 'Preajustes',
      tilePreview: 'Vista previa de repetición', rotate90: 'Rotar 90°', flipH: 'Voltear H',
      flipV: 'Voltear V', isoPreview: 'Vista previa isométrica', saveFailed: 'Error al guardar',
      saved: '¡Guardado!', loaded: '¡Cargado!', loadFailed: 'Error al cargar',
      clearConfirm: '¿Se borrarán todos los píxeles. ¿Está seguro?', confirm: 'Confirmar', cancel: 'Cancelar',
      animation: 'Animación', addFrame: 'Añadir cuadro', deleteFrame: 'Eliminar cuadro', play: 'Reproducir',
      stop: 'Detener', fps: 'FPS', frame: 'Cuadro', duplicateFrame: 'Duplicar cuadro',
      copies: 'Copias', tiledPreview: 'Vista previa en mosaico'
    },
    ru: {
      flat: 'Плоский', isometric: 'Изометрический', tileSize: 'Размер тайла', customSize: 'Произвольный',
      width: 'Ширина', height: 'Высота', pencil: 'Карандаш', eraser: 'Ластик', fill: 'Заливка',
      picker: 'Пипетка', line: 'Линия', rect: 'Прямоугольник', ellipse: 'Эллипс', mirror: 'Зеркало',
      mirrorH: 'Зеркало Г', mirrorV: 'Зеркало В', color: 'Цвет', palette: 'Палитра',
      grid: 'Сетка', preview: 'Предпросмотр', undo: 'Отменить', redo: 'Повторить', clear: 'Очистить',
      save: 'Сохранить', load: 'Загрузить', exportPng: 'Экспорт PNG', exportTileset: 'Экспорт Tileset',
      newTile: 'Новый тайл', zoom: 'Масштаб', opacity: 'Прозрачность', layers: 'Слои',
      addLayer: 'Добавить слой', deleteLayer: 'Удалить слой', mergeDown: 'Объединить вниз',
      layerName: 'Слой', visible: 'Видимый', tileMode: 'Режим тайла', presets: 'Пресеты',
      tilePreview: 'Предпросмотр повторения', rotate90: 'Поворот 90°', flipH: 'Отразить Г',
      flipV: 'Отразить В', isoPreview: 'Изометрический просмотр', saveFailed: 'Ошибка сохранения',
      saved: 'Сохранено!', loaded: 'Загружено!', loadFailed: 'Ошибка загрузки',
      clearConfirm: 'Все пиксели будут удалены. Вы уверены?', confirm: 'Подтвердить', cancel: 'Отмена',
      animation: 'Анимация', addFrame: 'Добавить кадр', deleteFrame: 'Удалить кадр', play: 'Играть',
      stop: 'Стоп', fps: 'FPS', frame: 'Кадр', duplicateFrame: 'Дублировать кадр',
      copies: 'Копии', tiledPreview: 'Мозаичный просмотр'
    },
    zh: {
      flat: '平面', isometric: '等距', tileSize: '图块大小', customSize: '自定义大小',
      width: '宽度', height: '高度', pencil: '铅笔', eraser: '橡皮', fill: '填充',
      picker: '取色器', line: '线条', rect: '矩形', ellipse: '椭圆', mirror: '镜像',
      mirrorH: '水平镜像', mirrorV: '垂直镜像', color: '颜色', palette: '调色板',
      grid: '网格', preview: '预览', undo: '撤销', redo: '重做', clear: '清除',
      save: '保存', load: '加载', exportPng: '导出PNG', exportTileset: '导出图块集',
      newTile: '新建图块', zoom: '缩放', opacity: '透明度', layers: '图层',
      addLayer: '添加图层', deleteLayer: '删除图层', mergeDown: '向下合并',
      layerName: '图层', visible: '可见', tileMode: '图块模式', presets: '预设',
      tilePreview: '图块重复预览', rotate90: '旋转90°', flipH: '水平翻转',
      flipV: '垂直翻转', isoPreview: '等距预览', saveFailed: '保存失败',
      saved: '已保存！', loaded: '已加载！', loadFailed: '加载失败',
      clearConfirm: '所有像素将被清除，确定吗？', confirm: '确认', cancel: '取消',
      animation: '动画', addFrame: '添加帧', deleteFrame: '删除帧', play: '播放',
      stop: '停止', fps: '帧率', frame: '帧', duplicateFrame: '复制帧',
      copies: '副本', tiledPreview: '平铺预览'
    },
    ja: {
      flat: 'フラット', isometric: 'アイソメトリック', tileSize: 'タイルサイズ', customSize: 'カスタムサイズ',
      width: '幅', height: '高さ', pencil: 'ペン', eraser: '消しゴム', fill: '塗りつぶし',
      picker: 'スポイト', line: '線', rect: '四角形', ellipse: '楕円', mirror: 'ミラー',
      mirrorH: '左右反転', mirrorV: '上下反転', color: '色', palette: 'パレット',
      grid: 'グリッド', preview: 'プレビュー', undo: '元に戻す', redo: 'やり直し', clear: 'クリア',
      save: '保存', load: '読み込み', exportPng: 'PNG出力', exportTileset: 'タイルセット出力',
      newTile: '新規タイル', zoom: 'ズーム', opacity: '不透明度', layers: 'レイヤー',
      addLayer: 'レイヤー追加', deleteLayer: 'レイヤー削除', mergeDown: '下と結合',
      layerName: 'レイヤー', visible: '表示', tileMode: 'タイルモード', presets: 'プリセット',
      tilePreview: 'タイルリピートプレビュー', rotate90: '90°回転', flipH: '左右反転',
      flipV: '上下反転', isoPreview: 'アイソメプレビュー', saveFailed: '保存失敗',
      saved: '保存しました！', loaded: '読み込みました！', loadFailed: '読み込み失敗',
      clearConfirm: '全ピクセルが消去されます。よろしいですか？', confirm: '確認', cancel: 'キャンセル',
      animation: 'アニメーション', addFrame: 'フレーム追加', deleteFrame: 'フレーム削除', play: '再生',
      stop: '停止', fps: 'FPS', frame: 'フレーム', duplicateFrame: 'フレーム複製',
      copies: 'コピー', tiledPreview: 'タイル表示プレビュー'
    },
    it: {
      flat: 'Piatto', isometric: 'Isometrico', tileSize: 'Dimensione Tile', customSize: 'Dimensione personalizzata',
      width: 'Larghezza', height: 'Altezza', pencil: 'Matita', eraser: 'Gomma', fill: 'Riempi',
      picker: 'Contagocce', line: 'Linea', rect: 'Rettangolo', ellipse: 'Ellisse', mirror: 'Specchio',
      mirrorH: 'Specchio O', mirrorV: 'Specchio V', color: 'Colore', palette: 'Tavolozza',
      grid: 'Griglia', preview: 'Anteprima', undo: 'Annulla', redo: 'Ripristina', clear: 'Cancella',
      save: 'Salva', load: 'Carica', exportPng: 'Esporta PNG', exportTileset: 'Esporta Tileset',
      newTile: 'Nuovo Tile', zoom: 'Zoom', opacity: 'Opacità', layers: 'Livelli',
      addLayer: 'Aggiungi livello', deleteLayer: 'Elimina livello', mergeDown: 'Unisci sotto',
      layerName: 'Livello', visible: 'Visibile', tileMode: 'Modalità Tile', presets: 'Preimpostazioni',
      tilePreview: 'Anteprima ripetizione', rotate90: 'Ruota 90°', flipH: 'Capovolgi O',
      flipV: 'Capovolgi V', isoPreview: 'Anteprima isometrica', saveFailed: 'Salvataggio fallito',
      saved: 'Salvato!', loaded: 'Caricato!', loadFailed: 'Caricamento fallito',
      clearConfirm: 'Tutti i pixel verranno cancellati. Sei sicuro?', confirm: 'Conferma', cancel: 'Annulla',
      animation: 'Animazione', addFrame: 'Aggiungi fotogramma', deleteFrame: 'Elimina fotogramma', play: 'Riproduci',
      stop: 'Ferma', fps: 'FPS', frame: 'Fotogramma', duplicateFrame: 'Duplica fotogramma',
      copies: 'Copie', tiledPreview: 'Anteprima a mosaico'
    },
    ar: {
      flat: 'مسطح', isometric: 'متساوي القياس', tileSize: 'حجم البلاط', customSize: 'حجم مخصص',
      width: 'العرض', height: 'الارتفاع', pencil: 'قلم', eraser: 'ممحاة', fill: 'تعبئة',
      picker: 'قطارة', line: 'خط', rect: 'مستطيل', ellipse: 'شكل بيضاوي', mirror: 'مرآة',
      mirrorH: 'مرآة أفقية', mirrorV: 'مرآة عمودية', color: 'لون', palette: 'لوحة الألوان',
      grid: 'شبكة', preview: 'معاينة', undo: 'تراجع', redo: 'إعادة', clear: 'مسح',
      save: 'حفظ', load: 'تحميل', exportPng: 'تصدير PNG', exportTileset: 'تصدير مجموعة البلاط',
      newTile: 'بلاط جديد', zoom: 'تكبير', opacity: 'الشفافية', layers: 'الطبقات',
      addLayer: 'إضافة طبقة', deleteLayer: 'حذف طبقة', mergeDown: 'دمج لأسفل',
      layerName: 'طبقة', visible: 'مرئي', tileMode: 'وضع البلاط', presets: 'إعدادات مسبقة',
      tilePreview: 'معاينة تكرار البلاط', rotate90: 'تدوير 90°', flipH: 'قلب أفقي',
      flipV: 'قلب عمودي', isoPreview: 'معاينة متساوية القياس', saveFailed: 'فشل الحفظ',
      saved: 'تم الحفظ!', loaded: 'تم التحميل!', loadFailed: 'فشل التحميل',
      clearConfirm: 'سيتم مسح جميع البكسلات. هل أنت متأكد؟', confirm: 'تأكيد', cancel: 'إلغاء',
      animation: 'رسوم متحركة', addFrame: 'إضافة إطار', deleteFrame: 'حذف إطار', play: 'تشغيل',
      stop: 'إيقاف', fps: 'إطار/ثانية', frame: 'إطار', duplicateFrame: 'نسخ إطار',
      copies: 'نسخ', tiledPreview: 'معاينة مبلطة'
    },
    ko: {
      flat: '평면', isometric: '아이소메트릭', tileSize: '타일 크기', customSize: '사용자 정의',
      width: '너비', height: '높이', pencil: '연필', eraser: '지우개', fill: '채우기',
      picker: '스포이트', line: '선', rect: '사각형', ellipse: '타원', mirror: '미러',
      mirrorH: '수평 미러', mirrorV: '수직 미러', color: '색상', palette: '팔레트',
      grid: '그리드', preview: '미리보기', undo: '실행취소', redo: '다시실행', clear: '지우기',
      save: '저장', load: '불러오기', exportPng: 'PNG 내보내기', exportTileset: '타일셋 내보내기',
      newTile: '새 타일', zoom: '확대', opacity: '불투명도', layers: '레이어',
      addLayer: '레이어 추가', deleteLayer: '레이어 삭제', mergeDown: '아래로 병합',
      layerName: '레이어', visible: '표시', tileMode: '타일 모드', presets: '프리셋',
      tilePreview: '타일 반복 미리보기', rotate90: '90° 회전', flipH: '수평 뒤집기',
      flipV: '수직 뒤집기', isoPreview: '아이소메트릭 미리보기', saveFailed: '저장 실패',
      saved: '저장됨!', loaded: '불러옴!', loadFailed: '불러오기 실패',
      clearConfirm: '모든 픽셀이 지워집니다. 계속하시겠습니까?', confirm: '확인', cancel: '취소',
      animation: '애니메이션', addFrame: '프레임 추가', deleteFrame: '프레임 삭제', play: '재생',
      stop: '정지', fps: 'FPS', frame: '프레임', duplicateFrame: '프레임 복제',
      copies: '복사', tiledPreview: '타일 미리보기'
    },
    hi: {
      flat: 'सपाट', isometric: 'आइसोमेट्रिक', tileSize: 'टाइल आकार', customSize: 'कस्टम आकार',
      width: 'चौड़ाई', height: 'ऊंचाई', pencil: 'पेंसिल', eraser: 'इरेज़र', fill: 'भरें',
      picker: 'पिकर', line: 'रेखा', rect: 'आयत', ellipse: 'दीर्घवृत्त', mirror: 'मिरर',
      mirrorH: 'क्षैतिज मिरर', mirrorV: 'लंबवत मिरर', color: 'रंग', palette: 'पैलेट',
      grid: 'ग्रिड', preview: 'पूर्वावलोकन', undo: 'पूर्ववत करें', redo: 'पुनः करें', clear: 'साफ़ करें',
      save: 'सहेजें', load: 'लोड करें', exportPng: 'PNG निर्यात', exportTileset: 'टाइलसेट निर्यात',
      newTile: 'नया टाइल', zoom: 'ज़ूम', opacity: 'अपारदर्शिता', layers: 'परतें',
      addLayer: 'परत जोड़ें', deleteLayer: 'परत हटाएं', mergeDown: 'नीचे मर्ज करें',
      layerName: 'परत', visible: 'दृश्य', tileMode: 'टाइल मोड', presets: 'प्रीसेट',
      tilePreview: 'टाइल दोहराव पूर्वावलोकन', rotate90: '90° घुमाएं', flipH: 'क्षैतिज पलटें',
      flipV: 'लंबवत पलटें', isoPreview: 'आइसोमेट्रिक पूर्वावलोकन', saveFailed: 'सहेजना विफल',
      saved: 'सहेजा गया!', loaded: 'लोड किया गया!', loadFailed: 'लोड विफल',
      clearConfirm: 'सभी पिक्सेल साफ हो जाएंगे। क्या आप सुनिश्चित हैं?', confirm: 'पुष्टि करें', cancel: 'रद्द करें',
      animation: 'एनीमेशन', addFrame: 'फ्रेम जोड़ें', deleteFrame: 'फ्रेम हटाएं', play: 'चलाएं',
      stop: 'रुकें', fps: 'FPS', frame: 'फ्रेम', duplicateFrame: 'फ्रेम डुप्लिकेट',
      copies: 'प्रतियाँ', tiledPreview: 'टाइल पूर्वावलोकन'
    },
    pt: {
      flat: 'Plano', isometric: 'Isométrico', tileSize: 'Tamanho do Tile', customSize: 'Tamanho personalizado',
      width: 'Largura', height: 'Altura', pencil: 'Lápis', eraser: 'Borracha', fill: 'Preencher',
      picker: 'Conta-gotas', line: 'Linha', rect: 'Retângulo', ellipse: 'Elipse', mirror: 'Espelho',
      mirrorH: 'Espelho H', mirrorV: 'Espelho V', color: 'Cor', palette: 'Paleta',
      grid: 'Grade', preview: 'Pré-visualização', undo: 'Desfazer', redo: 'Refazer', clear: 'Limpar',
      save: 'Salvar', load: 'Carregar', exportPng: 'Exportar PNG', exportTileset: 'Exportar Tileset',
      newTile: 'Novo Tile', zoom: 'Zoom', opacity: 'Opacidade', layers: 'Camadas',
      addLayer: 'Adicionar camada', deleteLayer: 'Excluir camada', mergeDown: 'Mesclar abaixo',
      layerName: 'Camada', visible: 'Visível', tileMode: 'Modo Tile', presets: 'Predefinições',
      tilePreview: 'Pré-visualização de repetição', rotate90: 'Girar 90°', flipH: 'Inverter H',
      flipV: 'Inverter V', isoPreview: 'Pré-visualização isométrica', saveFailed: 'Falha ao salvar',
      saved: 'Salvo!', loaded: 'Carregado!', loadFailed: 'Falha ao carregar',
      clearConfirm: 'Todos os pixels serão apagados. Tem certeza?', confirm: 'Confirmar', cancel: 'Cancelar',
      animation: 'Animação', addFrame: 'Adicionar quadro', deleteFrame: 'Excluir quadro', play: 'Reproduzir',
      stop: 'Parar', fps: 'FPS', frame: 'Quadro', duplicateFrame: 'Duplicar quadro',
      copies: 'Cópias', tiledPreview: 'Visualização em mosaico'
    }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }
  function getToken() { try { return localStorage.getItem('token') || ''; } catch { return ''; } }

  const SIZE_PRESETS = [
    { label: '8×8', w: 8, h: 8 },
    { label: '16×16', w: 16, h: 16 },
    { label: '32×32', w: 32, h: 32 },
    { label: '64×64', w: 64, h: 64 },
    { label: '48×24 (Iso)', w: 48, h: 24 },
    { label: '64×32 (Iso)', w: 64, h: 32 },
    { label: '128×64 (Iso)', w: 128, h: 64 }
  ];

  const DEFAULT_PALETTE = [
    '#000000','#ffffff','#ff0000','#00ff00','#0000ff','#ffff00','#ff00ff','#00ffff',
    '#ff8800','#8800ff','#0088ff','#88ff00','#ff0088','#00ff88','#884400','#448800',
    '#004488','#880044','#444444','#888888','#bbbbbb','#553311','#116655','#665511',
    '#1a1c2c','#5d275d','#b13e53','#ef7d57','#ffcd75','#a7f070','#38b764','#257179',
    '#29366f','#3b5dc9','#41a6f6','#73eff7','#f4f4f4','#94b0c2','#566c86','#333c57'
  ];

  return {
    setup() {
      const locale = ref(getLocale());
      function L(key) { return (LANGS[locale.value] || LANGS.tr)[key] || key; }

      // ─── State ───
      const tileMode = ref('flat');
      const tileW = ref(16);
      const tileH = ref(16);
      const selectedPreset = ref('16×16');
      const customW = ref(16);
      const customH = ref(16);
      const zoom = ref(16);
      const showGrid = ref(true);
      const showPreview = ref(true);
      const showTiledPreview = ref(false);
      const tiledCopies = ref(3);

      const tool = ref('pencil');
      const fgColor = ref('#000000');
      const bgColor = ref('#ffffff');
      const brushOpacity = ref(1);
      const mirrorH = ref(false);
      const mirrorV = ref(false);
      const palette = ref([...DEFAULT_PALETTE]);

      // Layers
      const layers = ref([]);
      const activeLayerIdx = ref(0);
      const activeLayer = computed(() => layers.value[activeLayerIdx.value]);

      // History
      const history = ref([]);
      const historyIdx = ref(-1);
      const maxHistory = 50;

      // Canvas refs
      const editorCanvas = ref(null);
      const previewCanvas = ref(null);
      const tiledCanvas = ref(null);
      const isoCanvas = ref(null);

      // Drawing state
      let isDrawing = false;
      let lineStartX = -1, lineStartY = -1;
      let shapeStartX = -1, shapeStartY = -1;
      let tempPixels = null;

      // Animation
      const frames = ref([]);
      const activeFrameIdx = ref(0);
      const animPlaying = ref(false);
      const animFps = ref(8);
      let animInterval = null;
      const showAnimPanel = ref(false);

      // Dialog
      const showClearDialog = ref(false);

      // ─── Layer helpers ───
      function createEmptyPixels(w, h) {
        const arr = [];
        for (let y = 0; y < h; y++) {
          arr[y] = [];
          for (let x = 0; x < w; x++) arr[y][x] = null;
        }
        return arr;
      }

      function clonePixels(px) {
        return px.map(function(row) { return row.slice(); });
      }

      function initLayers() {
        layers.value = [
          { name: L('layerName') + ' 1', visible: true, opacity: 1, pixels: createEmptyPixels(tileW.value, tileH.value) }
        ];
        activeLayerIdx.value = 0;
      }

      function addLayer() {
        var idx = layers.value.length + 1;
        layers.value.push({
          name: L('layerName') + ' ' + idx, visible: true, opacity: 1,
          pixels: createEmptyPixels(tileW.value, tileH.value)
        });
        activeLayerIdx.value = layers.value.length - 1;
        pushHistory();
        render();
      }

      function removeLayer(idx) {
        if (layers.value.length <= 1) return;
        layers.value.splice(idx, 1);
        if (activeLayerIdx.value >= layers.value.length) activeLayerIdx.value = layers.value.length - 1;
        pushHistory();
        render();
      }

      function mergeDown(idx) {
        if (idx <= 0) return;
        var upper = layers.value[idx];
        var lower = layers.value[idx - 1];
        for (var y = 0; y < tileH.value; y++) {
          for (var x = 0; x < tileW.value; x++) {
            if (upper.pixels[y][x]) lower.pixels[y][x] = upper.pixels[y][x];
          }
        }
        layers.value.splice(idx, 1);
        activeLayerIdx.value = idx - 1;
        pushHistory();
        render();
      }

      function moveLayerUp(idx) {
        if (idx >= layers.value.length - 1) return;
        var tmp = layers.value[idx];
        layers.value[idx] = layers.value[idx + 1];
        layers.value[idx + 1] = tmp;
        activeLayerIdx.value = idx + 1;
        render();
      }

      function moveLayerDown(idx) {
        if (idx <= 0) return;
        var tmp = layers.value[idx];
        layers.value[idx] = layers.value[idx - 1];
        layers.value[idx - 1] = tmp;
        activeLayerIdx.value = idx - 1;
        render();
      }

      // ─── History ───
      function pushHistory() {
        var state = layers.value.map(function(l) {
          return { name: l.name, visible: l.visible, opacity: l.opacity, pixels: clonePixels(l.pixels) };
        });
        if (historyIdx.value < history.value.length - 1) {
          history.value = history.value.slice(0, historyIdx.value + 1);
        }
        history.value.push(state);
        if (history.value.length > maxHistory) history.value.shift();
        historyIdx.value = history.value.length - 1;
      }

      function undo() {
        if (historyIdx.value <= 0) return;
        historyIdx.value--;
        restoreHistory();
      }

      function redo() {
        if (historyIdx.value >= history.value.length - 1) return;
        historyIdx.value++;
        restoreHistory();
      }

      function restoreHistory() {
        var st = history.value[historyIdx.value];
        layers.value = st.map(function(l) {
          return { name: l.name, visible: l.visible, opacity: l.opacity, pixels: clonePixels(l.pixels) };
        });
        if (activeLayerIdx.value >= layers.value.length) activeLayerIdx.value = layers.value.length - 1;
        render();
      }

      // ─── Pixel operations ───
      function setPixel(x, y, color) {
        var layer = layers.value[activeLayerIdx.value];
        if (!layer || x < 0 || y < 0 || x >= tileW.value || y >= tileH.value) return;
        layer.pixels[y][x] = color;
        if (mirrorH.value) {
          var mx = tileW.value - 1 - x;
          if (mx >= 0 && mx < tileW.value) layer.pixels[y][mx] = color;
        }
        if (mirrorV.value) {
          var my = tileH.value - 1 - y;
          if (my >= 0 && my < tileH.value) layer.pixels[my][x] = color;
        }
        if (mirrorH.value && mirrorV.value) {
          var mx2 = tileW.value - 1 - x;
          var my2 = tileH.value - 1 - y;
          if (mx2 >= 0 && mx2 < tileW.value && my2 >= 0 && my2 < tileH.value) layer.pixels[my2][mx2] = color;
        }
      }

      function getPixel(x, y) {
        for (var i = layers.value.length - 1; i >= 0; i--) {
          var l = layers.value[i];
          if (!l.visible) continue;
          if (l.pixels[y] && l.pixels[y][x]) return l.pixels[y][x];
        }
        return null;
      }

      function floodFill(startX, startY, newColor) {
        var layer = layers.value[activeLayerIdx.value];
        if (!layer) return;
        var targetColor = layer.pixels[startY][startX];
        if (targetColor === newColor) return;
        var stack = [[startX, startY]];
        var visited = {};
        while (stack.length > 0) {
          var p = stack.pop();
          var px = p[0], py = p[1];
          var key = px + ',' + py;
          if (visited[key]) continue;
          if (px < 0 || py < 0 || px >= tileW.value || py >= tileH.value) continue;
          if (layer.pixels[py][px] !== targetColor) continue;
          visited[key] = true;
          layer.pixels[py][px] = newColor;
          stack.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]);
        }
      }

      function drawLinePixels(x0, y0, x1, y1, clr) {
        var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
        var sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
        var err = dx - dy;
        while (true) {
          setPixel(x0, y0, clr);
          if (x0 === x1 && y0 === y1) break;
          var e2 = 2 * err;
          if (e2 > -dy) { err -= dy; x0 += sx; }
          if (e2 < dx) { err += dx; y0 += sy; }
        }
      }

      function drawRectPixels(x0, y0, x1, y1, clr) {
        var minX = Math.min(x0, x1), maxX = Math.max(x0, x1);
        var minY = Math.min(y0, y1), maxY = Math.max(y0, y1);
        for (var x = minX; x <= maxX; x++) { setPixel(x, minY, clr); setPixel(x, maxY, clr); }
        for (var y = minY; y <= maxY; y++) { setPixel(minX, y, clr); setPixel(maxX, y, clr); }
      }

      function drawEllipsePixels(cx, cy, rx, ry, clr) {
        if (rx <= 0 || ry <= 0) return;
        var x = 0, y = ry;
        var d1 = (ry * ry) - (rx * rx * ry) + (0.25 * rx * rx);
        var dx2 = 2 * ry * ry * x, dy2 = 2 * rx * rx * y;
        while (dx2 < dy2) {
          setPixel(cx + x, cy + y, clr); setPixel(cx - x, cy + y, clr);
          setPixel(cx + x, cy - y, clr); setPixel(cx - x, cy - y, clr);
          if (d1 < 0) { x++; dx2 += 2 * ry * ry; d1 += dx2 + ry * ry; }
          else { x++; y--; dx2 += 2 * ry * ry; dy2 -= 2 * rx * rx; d1 += dx2 - dy2 + ry * ry; }
        }
        var d2 = (ry * ry * (x + 0.5) * (x + 0.5)) + (rx * rx * (y - 1) * (y - 1)) - (rx * rx * ry * ry);
        while (y >= 0) {
          setPixel(cx + x, cy + y, clr); setPixel(cx - x, cy + y, clr);
          setPixel(cx + x, cy - y, clr); setPixel(cx - x, cy - y, clr);
          if (d2 > 0) { y--; dy2 -= 2 * rx * rx; d2 += rx * rx - dy2; }
          else { y--; x++; dx2 += 2 * ry * ry; dy2 -= 2 * rx * rx; d2 += dx2 - dy2 + rx * rx; }
        }
      }

      // ─── Render ───
      function render() {
        renderEditor();
        if (showPreview.value) renderPreview();
        if (showTiledPreview.value) renderTiled();
        if (tileMode.value === 'isometric') renderIso();
      }

      function compositePixels(srcLayers) {
        var w = tileW.value, h = tileH.value;
        var result = createEmptyPixels(w, h);
        for (var li = 0; li < srcLayers.length; li++) {
          var l = srcLayers[li];
          if (!l.visible) continue;
          for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
              if (l.pixels[y][x]) result[y][x] = l.pixels[y][x];
            }
          }
        }
        return result;
      }

      function renderEditor() {
        var cvs = editorCanvas.value;
        if (!cvs) return;
        var ctx = cvs.getContext('2d');
        var w = tileW.value, h = tileH.value, z = zoom.value;
        cvs.width = w * z;
        cvs.height = h * z;

        // Transparent background pattern
        ctx.fillStyle = '#2b2b3a';
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        for (var cy = 0; cy < h; cy++) {
          for (var cx = 0; cx < w; cx++) {
            if ((cx + cy) % 2 === 0) {
              ctx.fillStyle = '#363648';
              ctx.fillRect(cx * z, cy * z, z, z);
            }
          }
        }

        // Draw pixels from all visible layers
        for (var li = 0; li < layers.value.length; li++) {
          var l = layers.value[li];
          if (!l.visible) continue;
          ctx.globalAlpha = l.opacity;
          for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
              if (l.pixels[y][x]) {
                ctx.fillStyle = l.pixels[y][x];
                ctx.fillRect(x * z, y * z, z, z);
              }
            }
          }
        }
        ctx.globalAlpha = 1;

        // Grid
        if (showGrid.value && z >= 4) {
          ctx.strokeStyle = 'rgba(255,255,255,0.12)';
          ctx.lineWidth = 0.5;
          for (var gx = 0; gx <= w; gx++) {
            ctx.beginPath(); ctx.moveTo(gx * z, 0); ctx.lineTo(gx * z, h * z); ctx.stroke();
          }
          for (var gy = 0; gy <= h; gy++) {
            ctx.beginPath(); ctx.moveTo(0, gy * z); ctx.lineTo(w * z, gy * z); ctx.stroke();
          }
        }
      }

      function renderPreview() {
        var cvs = previewCanvas.value;
        if (!cvs) return;
        var ctx = cvs.getContext('2d');
        var w = tileW.value, h = tileH.value;
        var scale = Math.min(96 / w, 96 / h, 8);
        cvs.width = w * scale;
        cvs.height = h * scale;
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = '#2b2b3a';
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        var composite = compositePixels(layers.value);
        for (var y = 0; y < h; y++) {
          for (var x = 0; x < w; x++) {
            if (composite[y][x]) {
              ctx.fillStyle = composite[y][x];
              ctx.fillRect(x * scale, y * scale, scale, scale);
            }
          }
        }
      }

      function renderTiled() {
        var cvs = tiledCanvas.value;
        if (!cvs) return;
        var ctx = cvs.getContext('2d');
        var w = tileW.value, h = tileH.value;
        var copies = tiledCopies.value;
        var scale = Math.max(1, Math.floor(Math.min(200 / (w * copies), 200 / (h * copies))));
        cvs.width = w * copies * scale;
        cvs.height = h * copies * scale;
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = '#2b2b3a';
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        var composite = compositePixels(layers.value);
        for (var ty = 0; ty < copies; ty++) {
          for (var tx = 0; tx < copies; tx++) {
            for (var y = 0; y < h; y++) {
              for (var x = 0; x < w; x++) {
                if (composite[y][x]) {
                  ctx.fillStyle = composite[y][x];
                  ctx.fillRect((tx * w + x) * scale, (ty * h + y) * scale, scale, scale);
                }
              }
            }
          }
        }
      }

      function renderIso() {
        var cvs = isoCanvas.value;
        if (!cvs) return;
        var ctx = cvs.getContext('2d');
        var w = tileW.value, h = tileH.value;
        var pxSize = Math.max(2, Math.floor(Math.min(200 / (w + h), 200 / ((w + h) / 2 + h))));
        var isoW = (w + h) * pxSize;
        var isoH = ((w + h) / 2 + 4) * pxSize;
        cvs.width = isoW;
        cvs.height = isoH;
        ctx.fillStyle = '#2b2b3a';
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        var composite = compositePixels(layers.value);
        var centerX = isoW / 2;
        for (var y = 0; y < h; y++) {
          for (var x = 0; x < w; x++) {
            if (!composite[y][x]) continue;
            var isoX = centerX + (x - y) * pxSize;
            var isoY = (x + y) * pxSize * 0.5;
            ctx.fillStyle = composite[y][x];
            ctx.beginPath();
            ctx.moveTo(isoX, isoY);
            ctx.lineTo(isoX + pxSize, isoY + pxSize * 0.5);
            ctx.lineTo(isoX, isoY + pxSize);
            ctx.lineTo(isoX - pxSize, isoY + pxSize * 0.5);
            ctx.closePath();
            ctx.fill();
            // darker edge
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.beginPath();
            ctx.moveTo(isoX, isoY + pxSize);
            ctx.lineTo(isoX + pxSize, isoY + pxSize * 0.5);
            ctx.lineTo(isoX + pxSize, isoY + pxSize * 0.5 + 2);
            ctx.lineTo(isoX, isoY + pxSize + 2);
            ctx.closePath();
            ctx.fill();
          }
        }
      }

      // ─── Canvas events ───
      function getPixelPos(e) {
        var cvs = editorCanvas.value;
        if (!cvs) return null;
        var rect = cvs.getBoundingClientRect();
        var x = Math.floor((e.clientX - rect.left) / zoom.value);
        var y = Math.floor((e.clientY - rect.top) / zoom.value);
        if (x < 0 || y < 0 || x >= tileW.value || y >= tileH.value) return null;
        return { x: x, y: y };
      }

      function onCanvasDown(e) {
        e.preventDefault();
        var pos = getPixelPos(e);
        if (!pos) return;
        isDrawing = true;

        if (tool.value === 'pencil') {
          setPixel(pos.x, pos.y, fgColor.value);
          render();
        } else if (tool.value === 'eraser') {
          setPixel(pos.x, pos.y, null);
          render();
        } else if (tool.value === 'fill') {
          floodFill(pos.x, pos.y, fgColor.value);
          render();
          pushHistory();
          isDrawing = false;
        } else if (tool.value === 'picker') {
          var c = getPixel(pos.x, pos.y);
          if (c) fgColor.value = c;
          isDrawing = false;
        } else if (tool.value === 'line') {
          lineStartX = pos.x; lineStartY = pos.y;
          tempPixels = clonePixels(layers.value[activeLayerIdx.value].pixels);
        } else if (tool.value === 'rect' || tool.value === 'ellipse') {
          shapeStartX = pos.x; shapeStartY = pos.y;
          tempPixels = clonePixels(layers.value[activeLayerIdx.value].pixels);
        }
      }

      function onCanvasMove(e) {
        if (!isDrawing) return;
        var pos = getPixelPos(e);
        if (!pos) return;

        if (tool.value === 'pencil') {
          setPixel(pos.x, pos.y, fgColor.value);
          render();
        } else if (tool.value === 'eraser') {
          setPixel(pos.x, pos.y, null);
          render();
        } else if (tool.value === 'line' && tempPixels) {
          layers.value[activeLayerIdx.value].pixels = clonePixels(tempPixels);
          drawLinePixels(lineStartX, lineStartY, pos.x, pos.y, fgColor.value);
          render();
        } else if (tool.value === 'rect' && tempPixels) {
          layers.value[activeLayerIdx.value].pixels = clonePixels(tempPixels);
          drawRectPixels(shapeStartX, shapeStartY, pos.x, pos.y, fgColor.value);
          render();
        } else if (tool.value === 'ellipse' && tempPixels) {
          layers.value[activeLayerIdx.value].pixels = clonePixels(tempPixels);
          var cx = Math.round((shapeStartX + pos.x) / 2);
          var cy = Math.round((shapeStartY + pos.y) / 2);
          var rx = Math.abs(pos.x - shapeStartX) / 2;
          var ry = Math.abs(pos.y - shapeStartY) / 2;
          drawEllipsePixels(cx, cy, Math.round(rx), Math.round(ry), fgColor.value);
          render();
        }
      }

      function onCanvasUp() {
        if (!isDrawing) return;
        isDrawing = false;
        tempPixels = null;
        pushHistory();
        render();
      }

      // ─── Transform ───
      function rotate90() {
        var layer = layers.value[activeLayerIdx.value];
        if (!layer) return;
        var w = tileW.value, h = tileH.value;
        var newPx = createEmptyPixels(h, w);
        for (var y = 0; y < h; y++)
          for (var x = 0; x < w; x++)
            newPx[x][h - 1 - y] = layer.pixels[y][x];
        // swap dimensions
        tileW.value = h;
        tileH.value = w;
        // rebuild all layers with new size
        for (var i = 0; i < layers.value.length; i++) {
          if (i === activeLayerIdx.value) {
            layers.value[i].pixels = newPx;
          } else {
            var old = layers.value[i].pixels;
            var np = createEmptyPixels(tileW.value, tileH.value);
            for (var oy = 0; oy < Math.min(h, tileH.value); oy++)
              for (var ox = 0; ox < Math.min(w, tileW.value); ox++)
                if (old[oy] && old[oy][ox]) np[ox][h - 1 - oy] = old[oy][ox];
            layers.value[i].pixels = np;
          }
        }
        pushHistory();
        render();
      }

      function flipHorizontal() {
        var layer = layers.value[activeLayerIdx.value];
        if (!layer) return;
        for (var y = 0; y < tileH.value; y++) layer.pixels[y].reverse();
        pushHistory();
        render();
      }

      function flipVertical() {
        var layer = layers.value[activeLayerIdx.value];
        if (!layer) return;
        layer.pixels.reverse();
        pushHistory();
        render();
      }

      // ─── Clear ───
      function confirmClear() { showClearDialog.value = true; }
      function doClear() {
        showClearDialog.value = false;
        for (var i = 0; i < layers.value.length; i++) {
          layers.value[i].pixels = createEmptyPixels(tileW.value, tileH.value);
        }
        pushHistory();
        render();
      }

      // ─── New tile ───
      function newTile() {
        initLayers();
        history.value = [];
        historyIdx.value = -1;
        pushHistory();
        render();
      }

      // ─── Preset change ───
      function onPresetChange(val) {
        var p = SIZE_PRESETS.find(function(s) { return s.label === val; });
        if (p) {
          tileW.value = p.w;
          tileH.value = p.h;
          customW.value = p.w;
          customH.value = p.h;
          resizeLayers();
        }
      }

      function applyCustomSize() {
        tileW.value = Math.max(1, Math.min(256, customW.value));
        tileH.value = Math.max(1, Math.min(256, customH.value));
        selectedPreset.value = '';
        resizeLayers();
      }

      function resizeLayers() {
        var w = tileW.value, h = tileH.value;
        for (var i = 0; i < layers.value.length; i++) {
          var oldPx = layers.value[i].pixels;
          var newPx = createEmptyPixels(w, h);
          for (var y = 0; y < Math.min(oldPx.length, h); y++)
            for (var x = 0; x < Math.min(oldPx[y].length, w); x++)
              newPx[y][x] = oldPx[y][x];
          layers.value[i].pixels = newPx;
        }
        pushHistory();
        render();
      }

      // ─── Animation frames ───
      function initFrames() {
        frames.value = [{ layers: cloneAllLayers() }];
        activeFrameIdx.value = 0;
      }

      function cloneAllLayers() {
        return layers.value.map(function(l) {
          return { name: l.name, visible: l.visible, opacity: l.opacity, pixels: clonePixels(l.pixels) };
        });
      }

      function saveCurrentFrame() {
        if (frames.value[activeFrameIdx.value]) {
          frames.value[activeFrameIdx.value].layers = cloneAllLayers();
        }
      }

      function switchFrame(idx) {
        saveCurrentFrame();
        activeFrameIdx.value = idx;
        var fr = frames.value[idx];
        if (fr) {
          layers.value = fr.layers.map(function(l) {
            return { name: l.name, visible: l.visible, opacity: l.opacity, pixels: clonePixels(l.pixels) };
          });
          if (activeLayerIdx.value >= layers.value.length) activeLayerIdx.value = 0;
          render();
        }
      }

      function addFrame() {
        saveCurrentFrame();
        frames.value.push({ layers: [{ name: L('layerName') + ' 1', visible: true, opacity: 1, pixels: createEmptyPixels(tileW.value, tileH.value) }] });
        switchFrame(frames.value.length - 1);
      }

      function duplicateFrame() {
        saveCurrentFrame();
        frames.value.push({ layers: cloneAllLayers() });
        switchFrame(frames.value.length - 1);
      }

      function deleteFrame(idx) {
        if (frames.value.length <= 1) return;
        frames.value.splice(idx, 1);
        if (activeFrameIdx.value >= frames.value.length) activeFrameIdx.value = frames.value.length - 1;
        switchFrame(activeFrameIdx.value);
      }

      function playAnim() {
        if (frames.value.length <= 1) return;
        animPlaying.value = true;
        var idx = 0;
        animInterval = setInterval(function() {
          idx = (idx + 1) % frames.value.length;
          switchFrame(idx);
        }, 1000 / animFps.value);
      }

      function stopAnim() {
        animPlaying.value = false;
        if (animInterval) { clearInterval(animInterval); animInterval = null; }
      }

      // ─── Palette ───
      function addToPalette(c) {
        if (!palette.value.includes(c)) palette.value.push(c);
      }

      function removeFromPalette(idx) {
        palette.value.splice(idx, 1);
      }

      // ─── Export / Save ───
      function getTileImageData() {
        var cvs = document.createElement('canvas');
        cvs.width = tileW.value;
        cvs.height = tileH.value;
        var ctx = cvs.getContext('2d');
        var composite = compositePixels(layers.value);
        for (var y = 0; y < tileH.value; y++) {
          for (var x = 0; x < tileW.value; x++) {
            if (composite[y][x]) {
              ctx.fillStyle = composite[y][x];
              ctx.fillRect(x, y, 1, 1);
            }
          }
        }
        return cvs;
      }

      async function exportPng() {
        if (!window.FileDialog) return;
        var result = await window.FileDialog.save({
          title: '💾 ' + L('exportPng'),
          defaultName: 'tile-' + tileW.value + 'x' + tileH.value + '-' + Date.now() + '.png',
          filters: [{ label: 'PNG', extensions: ['.png'] }]
        });
        if (!result) return;
        try {
          var cvs = getTileImageData();
          var dataUrl = cvs.toDataURL('image/png');
          var b64 = dataUrl.split(',')[1];
          var resp = await fetch('/api/fs/write-binary', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath: result.path, content: b64 })
          });
          if (resp.ok) { if (window.ElMessage) window.ElMessage.success(L('saved')); }
          else { if (window.ElMessage) window.ElMessage.error(L('saveFailed')); }
        } catch (e) {
          console.error(e);
          if (window.ElMessage) window.ElMessage.error(L('saveFailed'));
        }
      }

      async function exportTileset() {
        if (!window.FileDialog) return;
        saveCurrentFrame();
        var cols = Math.ceil(Math.sqrt(frames.value.length));
        var rows = Math.ceil(frames.value.length / cols);
        var cvs = document.createElement('canvas');
        cvs.width = tileW.value * cols;
        cvs.height = tileH.value * rows;
        var ctx = cvs.getContext('2d');
        for (var fi = 0; fi < frames.value.length; fi++) {
          var fr = frames.value[fi];
          var comp = compositePixels(fr.layers);
          var col = fi % cols;
          var row = Math.floor(fi / cols);
          for (var y = 0; y < tileH.value; y++) {
            for (var x = 0; x < tileW.value; x++) {
              if (comp[y][x]) {
                ctx.fillStyle = comp[y][x];
                ctx.fillRect(col * tileW.value + x, row * tileH.value + y, 1, 1);
              }
            }
          }
        }
        var result = await window.FileDialog.save({
          title: '💾 ' + L('exportTileset'),
          defaultName: 'tileset-' + Date.now() + '.png',
          filters: [{ label: 'PNG', extensions: ['.png'] }]
        });
        if (!result) return;
        try {
          var dataUrl = cvs.toDataURL('image/png');
          var b64 = dataUrl.split(',')[1];
          var resp = await fetch('/api/fs/write-binary', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath: result.path, content: b64 })
          });
          if (resp.ok) { if (window.ElMessage) window.ElMessage.success(L('saved')); }
          else { if (window.ElMessage) window.ElMessage.error(L('saveFailed')); }
        } catch (e) {
          console.error(e);
          if (window.ElMessage) window.ElMessage.error(L('saveFailed'));
        }
      }

      async function saveProject() {
        if (!window.FileDialog) return;
        saveCurrentFrame();
        var data = {
          version: 1,
          tileW: tileW.value, tileH: tileH.value,
          tileMode: tileMode.value,
          palette: palette.value,
          frames: frames.value.map(function(f) {
            return { layers: f.layers.map(function(l) {
              return { name: l.name, visible: l.visible, opacity: l.opacity, pixels: l.pixels };
            })};
          })
        };
        var result = await window.FileDialog.save({
          title: '💾 ' + L('save'),
          defaultName: 'tile-project-' + Date.now() + '.tilemaker',
          filters: [{ label: 'TileMaker Project', extensions: ['.tilemaker'] }]
        });
        if (!result) return;
        try {
          var resp = await fetch('/api/fs/write', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath: result.path, content: JSON.stringify(data) })
          });
          if (resp.ok) { if (window.ElMessage) window.ElMessage.success(L('saved')); }
          else { if (window.ElMessage) window.ElMessage.error(L('saveFailed')); }
        } catch (e) {
          console.error(e);
          if (window.ElMessage) window.ElMessage.error(L('saveFailed'));
        }
      }

      async function loadProject() {
        if (!window.FileDialog) return;
        var result = await window.FileDialog.open({
          title: '📂 ' + L('load'),
          filters: [{ label: 'TileMaker Project', extensions: ['.tilemaker'] }]
        });
        if (!result || !result.content) return;
        try {
          var data = JSON.parse(result.content);
          if (data.version !== 1) throw new Error('Unknown version');
          tileW.value = data.tileW || 16;
          tileH.value = data.tileH || 16;
          customW.value = tileW.value;
          customH.value = tileH.value;
          selectedPreset.value = '';
          tileMode.value = data.tileMode || 'flat';
          if (data.palette) palette.value = data.palette;
          if (data.frames && data.frames.length > 0) {
            frames.value = data.frames.map(function(f) {
              return { layers: f.layers.map(function(l) {
                return { name: l.name, visible: l.visible, opacity: l.opacity, pixels: l.pixels };
              })};
            });
            activeFrameIdx.value = 0;
            switchFrame(0);
          } else if (data.layers) {
            layers.value = data.layers.map(function(l) {
              return { name: l.name, visible: l.visible, opacity: l.opacity, pixels: l.pixels };
            });
            frames.value = [{ layers: cloneAllLayers() }];
            activeFrameIdx.value = 0;
          }
          history.value = [];
          historyIdx.value = -1;
          pushHistory();
          if (window.ElMessage) window.ElMessage.success(L('loaded'));
          render();
        } catch (e) {
          console.error(e);
          if (window.ElMessage) window.ElMessage.error(L('loadFailed'));
        }
      }

      // ─── Zoom with wheel ───
      function onWheel(e) {
        e.preventDefault();
        if (e.deltaY < 0) zoom.value = Math.min(64, zoom.value + 2);
        else zoom.value = Math.max(2, zoom.value - 2);
        render();
      }

      // ─── Right click color pick ───
      function onContextMenu(e) {
        e.preventDefault();
        var pos = getPixelPos(e);
        if (!pos) return;
        var c = getPixel(pos.x, pos.y);
        if (c) {
          fgColor.value = c;
          addToPalette(c);
        }
      }

      // ─── Init ───
      onMounted(function() {
        initLayers();
        initFrames();
        pushHistory();
        nextTick(function() { render(); });
      });

      onBeforeUnmount(function() {
        stopAnim();
      });

      watch(showGrid, function() { render(); });
      watch(showPreview, function() { nextTick(function() { render(); }); });
      watch(showTiledPreview, function() { nextTick(function() { render(); }); });
      watch(tileMode, function() { nextTick(function() { render(); }); });
      watch(tiledCopies, function() { nextTick(function() { render(); }); });

      return {
        L, locale, tileMode, tileW, tileH, selectedPreset, customW, customH,
        zoom, showGrid, showPreview, showTiledPreview, tiledCopies,
        tool, fgColor, bgColor, brushOpacity, mirrorH, mirrorV, palette,
        layers, activeLayerIdx, activeLayer,
        history, historyIdx, editorCanvas, previewCanvas, tiledCanvas, isoCanvas,
        showClearDialog, showAnimPanel,
        frames, activeFrameIdx, animPlaying, animFps,
        SIZE_PRESETS: SIZE_PRESETS,
        render: render,
        // actions
        onCanvasDown, onCanvasMove, onCanvasUp, onWheel, onContextMenu,
        undo, redo, confirmClear, doClear, newTile,
        onPresetChange, applyCustomSize,
        addLayer, removeLayer, mergeDown, moveLayerUp, moveLayerDown,
        rotate90, flipHorizontal, flipVertical,
        addToPalette, removeFromPalette,
        exportPng, exportTileset, saveProject, loadProject,
        addFrame, duplicateFrame, deleteFrame, switchFrame, playAnim, stopAnim
      };
    }
  };
})(Vue);
