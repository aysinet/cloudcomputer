(function(Vue) {
  const { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } = Vue;
  const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success(){}, error(){}, warning(){} };

  // ─── i18n ────────────────────────────────────────────
  const LANGS = {
    tr: {
      title:'Sunum', newPres:'Yeni Sunum', save:'Kaydet', load:'Yükle', del:'Sil',
      addSlide:'Slayt Ekle', deleteSlide:'Slaytı Sil', duplicateSlide:'Kopyala',
      slideN:'Slayt', of:'/', outline:'Anahat', notes:'Notlar',
      present:'Sunuma Başla', exitPresent:'Sunumdan Çık',
      template:'Şablon', applyTemplate:'Şablonu Uygula', properties:'Özellikler',
      slideTitle:'Başlık', slideSubtitle:'Alt Başlık', slideContent:'İçerik',
      saveName:'Sunum Adı', saveBtn:'Kaydet', cancelBtn:'İptal',
      savedList:'Kayıtlı Sunumlar', noSaved:'Kayıtlı sunum yok',
      loadBtn:'Yükle', deleteBtn:'Sil', saved:'Kaydedildi', loadOk:'Yüklendi',
      saveFail:'Kaydetme hatası', loadFail:'Yükleme hatası',
      prev:'Önceki', next:'Sonraki', moveUp:'Yukarı', moveDown:'Aşağı',
      titleSlide:'Başlık Slaytı', contentSlide:'İçerik Slaytı',
      twoColumn:'İki Sütun', imageLeft:'Sol Görsel', imageRight:'Sağ Görsel',
      blankSlide:'Boş Slayt', quoteSlide:'Alıntı', comparisonSlide:'Karşılaştırma',
      timelineSlide:'Zaman Çizelgesi', statsSlide:'İstatistik', endSlide:'Son Slayt',
      sectionSlide:'Bölüm Slaytı', bulletSlide:'Madde Listesi',
      bgColor:'Arka Plan', textColor:'Yazı Rengi', fontSize:'Yazı Boyutu',
      generate:'Sunucu Oluştur', generating:'Oluşturuluyor...',
      topicLabel:'Konu', slideCount:'Slayt Sayısı', generateBtn:'Oluştur',
      exportHTML:'HTML İndir', exportPPTX:'PPTX İndir', export:'Dışa Aktar',
      addText:'Metin', addRect:'Dikdörtgen', addCircle:'Daire', addTriangle:'Üçgen',
      addImage:'Resim', imgFromClient:'Bilgisayardan Resim', imgFromServer:'Sunucudan Resim',
      bgFromClient:'Bilgisayardan Arka Plan', bgFromServer:'Sunucudan Arka Plan',
      objectProps:'Nesne', objFill:'Dolgu', objOpacity:'Opaklık', deleteObj:'Sil',
      selectImage:'Resim Seç', noImages:'Resim bulunamadı', selectBtn:'Seç'
    },
    en: {
      title:'Presentation', newPres:'New Presentation', save:'Save', load:'Load', del:'Delete',
      addSlide:'Add Slide', deleteSlide:'Delete Slide', duplicateSlide:'Duplicate',
      slideN:'Slide', of:'/', outline:'Outline', notes:'Notes',
      present:'Present', exitPresent:'Exit',
      template:'Template', applyTemplate:'Apply Template', properties:'Properties',
      slideTitle:'Title', slideSubtitle:'Subtitle', slideContent:'Content',
      saveName:'Presentation Name', saveBtn:'Save', cancelBtn:'Cancel',
      savedList:'Saved Presentations', noSaved:'No saved presentations',
      loadBtn:'Load', deleteBtn:'Delete', saved:'Saved', loadOk:'Loaded',
      saveFail:'Save failed', loadFail:'Load failed',
      prev:'Previous', next:'Next', moveUp:'Move Up', moveDown:'Move Down',
      titleSlide:'Title Slide', contentSlide:'Content Slide',
      twoColumn:'Two Columns', imageLeft:'Image Left', imageRight:'Image Right',
      blankSlide:'Blank Slide', quoteSlide:'Quote', comparisonSlide:'Comparison',
      timelineSlide:'Timeline', statsSlide:'Statistics', endSlide:'End Slide',
      sectionSlide:'Section Slide', bulletSlide:'Bullet List',
      bgColor:'Background', textColor:'Text Color', fontSize:'Font Size',
      generate:'Server Generate', generating:'Generating...',
      topicLabel:'Topic', slideCount:'Slide Count', generateBtn:'Generate',
      exportHTML:'Export HTML', exportPPTX:'Export PPTX', export:'Export',
      addText:'Text', addRect:'Rect', addCircle:'Circle', addTriangle:'Triangle',
      addImage:'Image', imgFromClient:'Image from PC', imgFromServer:'Image from Server',
      bgFromClient:'Background from PC', bgFromServer:'Background from Server',
      objectProps:'Object', objFill:'Fill', objOpacity:'Opacity', deleteObj:'Delete',
      selectImage:'Select Image', noImages:'No images found', selectBtn:'Select'
    },
    de: {
      title:'Präsentation', newPres:'Neue Präsentation', save:'Speichern', load:'Laden', del:'Löschen',
      addSlide:'Folie hinzufügen', deleteSlide:'Folie löschen', duplicateSlide:'Duplizieren',
      slideN:'Folie', of:'/', outline:'Gliederung', notes:'Notizen',
      present:'Präsentieren', exitPresent:'Beenden',
      template:'Vorlage', applyTemplate:'Vorlage anwenden',
      slideTitle:'Titel', slideSubtitle:'Untertitel', slideContent:'Inhalt',
      saveName:'Präsentationsname', saveBtn:'Speichern', cancelBtn:'Abbrechen',
      savedList:'Gespeicherte Präsentationen', noSaved:'Keine gespeichert',
      loadBtn:'Laden', deleteBtn:'Löschen', saved:'Gespeichert', loadOk:'Geladen',
      saveFail:'Speicherfehler', loadFail:'Ladefehler',
      prev:'Zurück', next:'Weiter', moveUp:'Nach oben', moveDown:'Nach unten',
      titleSlide:'Titelfolie', contentSlide:'Inhaltsfolie',
      twoColumn:'Zwei Spalten', imageLeft:'Bild links', imageRight:'Bild rechts',
      blankSlide:'Leere Folie', quoteSlide:'Zitat', comparisonSlide:'Vergleich',
      timelineSlide:'Zeitleiste', statsSlide:'Statistik', endSlide:'Endfolie',
      sectionSlide:'Abschnittsfolie', bulletSlide:'Aufzählung',
      bgColor:'Hintergrund', textColor:'Textfarbe', fontSize:'Schriftgröße',
      generate:'Server-Generierung', generating:'Wird generiert...',
      topicLabel:'Thema', slideCount:'Folienanzahl', generateBtn:'Generieren',
      exportHTML:'HTML exportieren', exportPPTX:'PPTX exportieren', export:'Exportieren',
      addText:'Text', addRect:'Rechteck', addCircle:'Kreis', addTriangle:'Dreieck',
      addImage:'Bild', imgFromClient:'Bild vom PC', imgFromServer:'Bild vom Server',
      bgFromClient:'Hintergrund vom PC', bgFromServer:'Hintergrund vom Server',
      objectProps:'Objekt', objFill:'Füllung', objOpacity:'Deckkraft', deleteObj:'Löschen',
      selectImage:'Bild auswählen', noImages:'Keine Bilder', selectBtn:'Auswählen', properties:'Eigenschaften'
    },
    fr: {
      title:'Présentation', newPres:'Nouvelle présentation', save:'Enregistrer', load:'Charger', del:'Supprimer',
      addSlide:'Ajouter diapo', deleteSlide:'Supprimer diapo', duplicateSlide:'Dupliquer',
      slideN:'Diapo', of:'/', outline:'Plan', notes:'Notes',
      present:'Présenter', exitPresent:'Quitter',
      template:'Modèle', applyTemplate:'Appliquer le modèle',
      slideTitle:'Titre', slideSubtitle:'Sous-titre', slideContent:'Contenu',
      saveName:'Nom de la présentation', saveBtn:'Enregistrer', cancelBtn:'Annuler',
      savedList:'Présentations enregistrées', noSaved:'Aucune présentation',
      loadBtn:'Charger', deleteBtn:'Supprimer', saved:'Enregistré', loadOk:'Chargé',
      saveFail:'Échec enregistrement', loadFail:'Échec chargement',
      prev:'Précédent', next:'Suivant', moveUp:'Monter', moveDown:'Descendre',
      titleSlide:'Diapo de titre', contentSlide:'Diapo de contenu',
      twoColumn:'Deux colonnes', imageLeft:'Image à gauche', imageRight:'Image à droite',
      blankSlide:'Diapo vide', quoteSlide:'Citation', comparisonSlide:'Comparaison',
      timelineSlide:'Chronologie', statsSlide:'Statistiques', endSlide:'Diapo de fin',
      sectionSlide:'Diapo de section', bulletSlide:'Liste à puces',
      bgColor:'Arrière-plan', textColor:'Couleur du texte', fontSize:'Taille de police',
      generate:'Générer (serveur)', generating:'Génération...',
      topicLabel:'Sujet', slideCount:'Nombre de diapos', generateBtn:'Générer',
      exportHTML:'Exporter HTML', exportPPTX:'Exporter PPTX', export:'Exporter',
      addText:'Texte', addRect:'Rectangle', addCircle:'Cercle', addTriangle:'Triangle',
      addImage:'Image', imgFromClient:'Image du PC', imgFromServer:'Image du serveur',
      bgFromClient:'Fond du PC', bgFromServer:'Fond du serveur',
      objectProps:'Objet', objFill:'Remplissage', objOpacity:'Opacité', deleteObj:'Supprimer',
      selectImage:'Sélectionner image', noImages:'Aucune image', selectBtn:'Sélectionner', properties:'Propriétés'
    },
    es: {
      title:'Presentación', newPres:'Nueva presentación', save:'Guardar', load:'Cargar', del:'Eliminar',
      addSlide:'Añadir diapositiva', deleteSlide:'Eliminar diapositiva', duplicateSlide:'Duplicar',
      slideN:'Diapositiva', of:'/', outline:'Esquema', notes:'Notas',
      present:'Presentar', exitPresent:'Salir',
      template:'Plantilla', applyTemplate:'Aplicar plantilla',
      slideTitle:'Título', slideSubtitle:'Subtítulo', slideContent:'Contenido',
      saveName:'Nombre de presentación', saveBtn:'Guardar', cancelBtn:'Cancelar',
      savedList:'Presentaciones guardadas', noSaved:'Sin presentaciones',
      loadBtn:'Cargar', deleteBtn:'Eliminar', saved:'Guardado', loadOk:'Cargado',
      saveFail:'Error al guardar', loadFail:'Error al cargar',
      prev:'Anterior', next:'Siguiente', moveUp:'Subir', moveDown:'Bajar',
      titleSlide:'Diapositiva de título', contentSlide:'Diapositiva de contenido',
      twoColumn:'Dos columnas', imageLeft:'Imagen izquierda', imageRight:'Imagen derecha',
      blankSlide:'Diapositiva vacía', quoteSlide:'Cita', comparisonSlide:'Comparación',
      timelineSlide:'Línea temporal', statsSlide:'Estadísticas', endSlide:'Diapositiva final',
      sectionSlide:'Diapositiva de sección', bulletSlide:'Lista con viñetas',
      bgColor:'Fondo', textColor:'Color de texto', fontSize:'Tamaño de fuente',
      generate:'Generar (servidor)', generating:'Generando...',
      topicLabel:'Tema', slideCount:'Número de diapositivas', generateBtn:'Generar',
      exportHTML:'Exportar HTML', exportPPTX:'Exportar PPTX', export:'Exportar',
      addText:'Texto', addRect:'Rectángulo', addCircle:'Círculo', addTriangle:'Triángulo',
      addImage:'Imagen', imgFromClient:'Imagen del PC', imgFromServer:'Imagen del servidor',
      bgFromClient:'Fondo del PC', bgFromServer:'Fondo del servidor',
      objectProps:'Objeto', objFill:'Relleno', objOpacity:'Opacidad', deleteObj:'Eliminar',
      selectImage:'Seleccionar imagen', noImages:'Sin imágenes', selectBtn:'Seleccionar', properties:'Propiedades'
    },
    ru: {
      title:'Презентация', newPres:'Новая презентация', save:'Сохранить', load:'Загрузить', del:'Удалить',
      addSlide:'Добавить слайд', deleteSlide:'Удалить слайд', duplicateSlide:'Дублировать',
      slideN:'Слайд', of:'/', outline:'Структура', notes:'Заметки',
      present:'Показ', exitPresent:'Выход',
      template:'Шаблон', applyTemplate:'Применить шаблон',
      slideTitle:'Заголовок', slideSubtitle:'Подзаголовок', slideContent:'Содержимое',
      saveName:'Имя презентации', saveBtn:'Сохранить', cancelBtn:'Отмена',
      savedList:'Сохранённые презентации', noSaved:'Нет сохранённых',
      loadBtn:'Загрузить', deleteBtn:'Удалить', saved:'Сохранено', loadOk:'Загружено',
      saveFail:'Ошибка сохранения', loadFail:'Ошибка загрузки',
      prev:'Назад', next:'Далее', moveUp:'Вверх', moveDown:'Вниз',
      titleSlide:'Титульный слайд', contentSlide:'Слайд содержимого',
      twoColumn:'Два столбца', imageLeft:'Изображение слева', imageRight:'Изображение справа',
      blankSlide:'Пустой слайд', quoteSlide:'Цитата', comparisonSlide:'Сравнение',
      timelineSlide:'Хронология', statsSlide:'Статистика', endSlide:'Финальный слайд',
      sectionSlide:'Слайд раздела', bulletSlide:'Маркированный список',
      bgColor:'Фон', textColor:'Цвет текста', fontSize:'Размер шрифта',
      generate:'Генерация (сервер)', generating:'Генерация...',
      topicLabel:'Тема', slideCount:'Количество слайдов', generateBtn:'Генерировать',
      exportHTML:'Экспорт HTML', exportPPTX:'Экспорт PPTX', export:'Экспорт',
      addText:'Текст', addRect:'Прямоугольник', addCircle:'Круг', addTriangle:'Треугольник',
      addImage:'Изображение', imgFromClient:'Изображение с ПК', imgFromServer:'Изображение с сервера',
      bgFromClient:'Фон с ПК', bgFromServer:'Фон с сервера',
      objectProps:'Объект', objFill:'Заливка', objOpacity:'Прозрачность', deleteObj:'Удалить',
      selectImage:'Выбрать изображение', noImages:'Нет изображений', selectBtn:'Выбрать', properties:'Свойства'
    },
    zh: {
      title:'演示文稿', newPres:'新建演示', save:'保存', load:'加载', del:'删除',
      addSlide:'添加幻灯片', deleteSlide:'删除幻灯片', duplicateSlide:'复制',
      slideN:'幻灯片', of:'/', outline:'大纲', notes:'备注',
      present:'播放', exitPresent:'退出',
      template:'模板', applyTemplate:'应用模板',
      slideTitle:'标题', slideSubtitle:'副标题', slideContent:'内容',
      saveName:'演示名称', saveBtn:'保存', cancelBtn:'取消',
      savedList:'已保存的演示', noSaved:'没有保存的演示',
      loadBtn:'加载', deleteBtn:'删除', saved:'已保存', loadOk:'已加载',
      saveFail:'保存失败', loadFail:'加载失败',
      prev:'上一页', next:'下一页', moveUp:'上移', moveDown:'下移',
      titleSlide:'标题幻灯片', contentSlide:'内容幻灯片',
      twoColumn:'两栏', imageLeft:'左图', imageRight:'右图',
      blankSlide:'空白幻灯片', quoteSlide:'引用', comparisonSlide:'对比',
      timelineSlide:'时间线', statsSlide:'统计', endSlide:'结束幻灯片',
      sectionSlide:'章节幻灯片', bulletSlide:'项目列表',
      bgColor:'背景色', textColor:'文字颜色', fontSize:'字号',
      generate:'服务器生成', generating:'生成中...',
      topicLabel:'主题', slideCount:'幻灯片数', generateBtn:'生成',
      exportHTML:'导出HTML', exportPPTX:'导出PPTX', export:'导出',
      addText:'文本', addRect:'矩形', addCircle:'圆形', addTriangle:'三角形',
      addImage:'图片', imgFromClient:'从电脑添加图片', imgFromServer:'从服务器添加图片',
      bgFromClient:'从电脑设置背景', bgFromServer:'从服务器设置背景',
      objectProps:'对象', objFill:'填充', objOpacity:'透明度', deleteObj:'删除',
      selectImage:'选择图片', noImages:'没有图片', selectBtn:'选择', properties:'属性'
    },
    ja: {
      title:'プレゼンテーション', newPres:'新規作成', save:'保存', load:'読み込み', del:'削除',
      addSlide:'スライド追加', deleteSlide:'スライド削除', duplicateSlide:'複製',
      slideN:'スライド', of:'/', outline:'アウトライン', notes:'メモ',
      present:'発表', exitPresent:'終了',
      template:'テンプレート', applyTemplate:'テンプレート適用',
      slideTitle:'タイトル', slideSubtitle:'サブタイトル', slideContent:'内容',
      saveName:'プレゼン名', saveBtn:'保存', cancelBtn:'キャンセル',
      savedList:'保存済みプレゼン', noSaved:'保存済みなし',
      loadBtn:'読み込み', deleteBtn:'削除', saved:'保存済み', loadOk:'読み込み完了',
      saveFail:'保存失敗', loadFail:'読み込み失敗',
      prev:'前へ', next:'次へ', moveUp:'上へ', moveDown:'下へ',
      titleSlide:'タイトルスライド', contentSlide:'コンテンツスライド',
      twoColumn:'2カラム', imageLeft:'画像左', imageRight:'画像右',
      blankSlide:'空白スライド', quoteSlide:'引用', comparisonSlide:'比較',
      timelineSlide:'タイムライン', statsSlide:'統計', endSlide:'エンドスライド',
      sectionSlide:'セクションスライド', bulletSlide:'箇条書き',
      bgColor:'背景色', textColor:'文字色', fontSize:'フォントサイズ',
      generate:'サーバー生成', generating:'生成中...',
      topicLabel:'トピック', slideCount:'スライド数', generateBtn:'生成',
      exportHTML:'HTMLエクスポート', exportPPTX:'PPTXエクスポート', export:'エクスポート',
      addText:'テキスト', addRect:'四角形', addCircle:'円', addTriangle:'三角形',
      addImage:'画像', imgFromClient:'PCから画像', imgFromServer:'サーバーから画像',
      bgFromClient:'PCから背景', bgFromServer:'サーバーから背景',
      objectProps:'オブジェクト', objFill:'塗り', objOpacity:'不透明度', deleteObj:'削除',
      selectImage:'画像を選択', noImages:'画像なし', selectBtn:'選択', properties:'プロパティ'
    },
    it: {
      title:'Presentazione', newPres:'Nuova presentazione', save:'Salva', load:'Carica', del:'Elimina',
      addSlide:'Aggiungi diapositiva', deleteSlide:'Elimina diapositiva', duplicateSlide:'Duplica',
      slideN:'Diapositiva', of:'/', outline:'Struttura', notes:'Note',
      present:'Presenta', exitPresent:'Esci',
      template:'Modello', applyTemplate:'Applica modello',
      slideTitle:'Titolo', slideSubtitle:'Sottotitolo', slideContent:'Contenuto',
      saveName:'Nome presentazione', saveBtn:'Salva', cancelBtn:'Annulla',
      savedList:'Presentazioni salvate', noSaved:'Nessuna presentazione',
      loadBtn:'Carica', deleteBtn:'Elimina', saved:'Salvato', loadOk:'Caricato',
      saveFail:'Errore salvataggio', loadFail:'Errore caricamento',
      prev:'Precedente', next:'Successivo', moveUp:'Su', moveDown:'Giù',
      titleSlide:'Diapositiva titolo', contentSlide:'Diapositiva contenuto',
      twoColumn:'Due colonne', imageLeft:'Immagine sinistra', imageRight:'Immagine destra',
      blankSlide:'Diapositiva vuota', quoteSlide:'Citazione', comparisonSlide:'Confronto',
      timelineSlide:'Cronologia', statsSlide:'Statistiche', endSlide:'Diapositiva finale',
      sectionSlide:'Diapositiva sezione', bulletSlide:'Elenco puntato',
      bgColor:'Sfondo', textColor:'Colore testo', fontSize:'Dimensione carattere',
      generate:'Genera (server)', generating:'Generazione...',
      topicLabel:'Argomento', slideCount:'Numero diapositive', generateBtn:'Genera',
      exportHTML:'Esporta HTML', exportPPTX:'Esporta PPTX', export:'Esporta',
      addText:'Testo', addRect:'Rettangolo', addCircle:'Cerchio', addTriangle:'Triangolo',
      addImage:'Immagine', imgFromClient:'Immagine dal PC', imgFromServer:'Immagine dal server',
      bgFromClient:'Sfondo dal PC', bgFromServer:'Sfondo dal server',
      objectProps:'Oggetto', objFill:'Riempimento', objOpacity:'Opacità', deleteObj:'Elimina',
      selectImage:'Seleziona immagine', noImages:'Nessuna immagine', selectBtn:'Seleziona', properties:'Proprietà'
    },
    ar: {
      title:'عرض تقديمي', newPres:'عرض جديد', save:'حفظ', load:'تحميل', del:'حذف',
      addSlide:'إضافة شريحة', deleteSlide:'حذف شريحة', duplicateSlide:'نسخ',
      slideN:'شريحة', of:'/', outline:'المخطط', notes:'ملاحظات',
      present:'تقديم', exitPresent:'خروج',
      template:'قالب', applyTemplate:'تطبيق القالب',
      slideTitle:'العنوان', slideSubtitle:'العنوان الفرعي', slideContent:'المحتوى',
      saveName:'اسم العرض', saveBtn:'حفظ', cancelBtn:'إلغاء',
      savedList:'العروض المحفوظة', noSaved:'لا توجد عروض محفوظة',
      loadBtn:'تحميل', deleteBtn:'حذف', saved:'تم الحفظ', loadOk:'تم التحميل',
      saveFail:'فشل الحفظ', loadFail:'فشل التحميل',
      prev:'السابق', next:'التالي', moveUp:'للأعلى', moveDown:'للأسفل',
      titleSlide:'شريحة العنوان', contentSlide:'شريحة المحتوى',
      twoColumn:'عمودان', imageLeft:'صورة يسار', imageRight:'صورة يمين',
      blankSlide:'شريحة فارغة', quoteSlide:'اقتباس', comparisonSlide:'مقارنة',
      timelineSlide:'خط زمني', statsSlide:'إحصائيات', endSlide:'شريحة النهاية',
      sectionSlide:'شريحة قسم', bulletSlide:'قائمة نقطية',
      bgColor:'خلفية', textColor:'لون النص', fontSize:'حجم الخط',
      generate:'إنشاء (خادم)', generating:'جارٍ الإنشاء...',
      topicLabel:'الموضوع', slideCount:'عدد الشرائح', generateBtn:'إنشاء',
      exportHTML:'تصدير HTML', exportPPTX:'تصدير PPTX', export:'تصدير',
      addText:'نص', addRect:'مستطيل', addCircle:'دائرة', addTriangle:'مثلث',
      addImage:'صورة', imgFromClient:'صورة من الكمبيوتر', imgFromServer:'صورة من الخادم',
      bgFromClient:'خلفية من الكمبيوتر', bgFromServer:'خلفية من الخادم',
      objectProps:'كائن', objFill:'تعبئة', objOpacity:'شفافية', deleteObj:'حذف',
      selectImage:'اختر صورة', noImages:'لا توجد صور', selectBtn:'اختر', properties:'خصائص'
    },
    ko: {
      title:'프레젠테이션', newPres:'새 프레젠테이션', save:'저장', load:'불러오기', del:'삭제',
      addSlide:'슬라이드 추가', deleteSlide:'슬라이드 삭제', duplicateSlide:'복제',
      slideN:'슬라이드', of:'/', outline:'개요', notes:'메모',
      present:'발표', exitPresent:'종료',
      template:'템플릿', applyTemplate:'템플릿 적용',
      slideTitle:'제목', slideSubtitle:'부제', slideContent:'내용',
      saveName:'프레젠테이션 이름', saveBtn:'저장', cancelBtn:'취소',
      savedList:'저장된 프레젠테이션', noSaved:'저장된 것이 없음',
      loadBtn:'불러오기', deleteBtn:'삭제', saved:'저장됨', loadOk:'로드됨',
      saveFail:'저장 실패', loadFail:'로드 실패',
      prev:'이전', next:'다음', moveUp:'위로', moveDown:'아래로',
      titleSlide:'제목 슬라이드', contentSlide:'내용 슬라이드',
      twoColumn:'2단', imageLeft:'이미지 좌측', imageRight:'이미지 우측',
      blankSlide:'빈 슬라이드', quoteSlide:'인용', comparisonSlide:'비교',
      timelineSlide:'타임라인', statsSlide:'통계', endSlide:'마지막 슬라이드',
      sectionSlide:'섹션 슬라이드', bulletSlide:'글머리 기호',
      bgColor:'배경색', textColor:'글자 색', fontSize:'글자 크기',
      generate:'서버 생성', generating:'생성 중...',
      topicLabel:'주제', slideCount:'슬라이드 수', generateBtn:'생성',
      exportHTML:'HTML 내보내기', exportPPTX:'PPTX 내보내기', export:'내보내기',
      addText:'텍스트', addRect:'사각형', addCircle:'원', addTriangle:'삼각형',
      addImage:'이미지', imgFromClient:'PC에서 이미지', imgFromServer:'서버에서 이미지',
      bgFromClient:'PC에서 배경', bgFromServer:'서버에서 배경',
      objectProps:'객체', objFill:'채우기', objOpacity:'불투명도', deleteObj:'삭제',
      selectImage:'이미지 선택', noImages:'이미지 없음', selectBtn:'선택', properties:'속성'
    },
    hi: {
      title:'प्रस्तुति', newPres:'नई प्रस्तुति', save:'सहेजें', load:'लोड', del:'हटाएं',
      addSlide:'स्लाइड जोड़ें', deleteSlide:'स्लाइड हटाएं', duplicateSlide:'प्रतिलिपि',
      slideN:'स्लाइड', of:'/', outline:'रूपरेखा', notes:'नोट्स',
      present:'प्रस्तुत करें', exitPresent:'बाहर',
      template:'टेम्पलेट', applyTemplate:'टेम्पलेट लागू करें',
      slideTitle:'शीर्षक', slideSubtitle:'उपशीर्षक', slideContent:'सामग्री',
      saveName:'प्रस्तुति का नाम', saveBtn:'सहेजें', cancelBtn:'रद्द',
      savedList:'सहेजी गई प्रस्तुतियाँ', noSaved:'कोई सहेजी गई नहीं',
      loadBtn:'लोड', deleteBtn:'हटाएं', saved:'सहेजा गया', loadOk:'लोड हुआ',
      saveFail:'सहेजने में त्रुटि', loadFail:'लोड त्रुटि',
      prev:'पिछला', next:'अगला', moveUp:'ऊपर', moveDown:'नीचे',
      titleSlide:'शीर्षक स्लाइड', contentSlide:'सामग्री स्लाइड',
      twoColumn:'दो स्तंभ', imageLeft:'बाईं छवि', imageRight:'दाईं छवि',
      blankSlide:'खाली स्लाइड', quoteSlide:'उद्धरण', comparisonSlide:'तुलना',
      timelineSlide:'समयरेखा', statsSlide:'सांख्यिकी', endSlide:'अंतिम स्लाइड',
      sectionSlide:'अनुभाग स्लाइड', bulletSlide:'बुलेट सूची',
      bgColor:'पृष्ठभूमि', textColor:'पाठ रंग', fontSize:'फ़ॉन्ट आकार',
      generate:'सर्वर जनरेट', generating:'जनरेट हो रहा...',
      topicLabel:'विषय', slideCount:'स्लाइड संख्या', generateBtn:'जनरेट',
      exportHTML:'HTML निर्यात', exportPPTX:'PPTX निर्यात', export:'निर्यात',
      addText:'पाठ', addRect:'आयत', addCircle:'वृत्त', addTriangle:'त्रिकोण',
      addImage:'छवि', imgFromClient:'PC से छवि', imgFromServer:'सर्वर से छवि',
      bgFromClient:'PC से पृष्ठभूमि', bgFromServer:'सर्वर से पृष्ठभूमि',
      objectProps:'वस्तु', objFill:'भरण', objOpacity:'अपारदर्शिता', deleteObj:'हटाएं',
      selectImage:'छवि चुनें', noImages:'कोई छवि नहीं', selectBtn:'चुनें', properties:'गुण'
    },
    pt: {
      title:'Apresentação', newPres:'Nova apresentação', save:'Guardar', load:'Carregar', del:'Eliminar',
      addSlide:'Adicionar slide', deleteSlide:'Eliminar slide', duplicateSlide:'Duplicar',
      slideN:'Slide', of:'/', outline:'Esboço', notes:'Notas',
      present:'Apresentar', exitPresent:'Sair',
      template:'Modelo', applyTemplate:'Aplicar modelo',
      slideTitle:'Título', slideSubtitle:'Subtítulo', slideContent:'Conteúdo',
      saveName:'Nome da apresentação', saveBtn:'Guardar', cancelBtn:'Cancelar',
      savedList:'Apresentações guardadas', noSaved:'Nenhuma apresentação',
      loadBtn:'Carregar', deleteBtn:'Eliminar', saved:'Guardado', loadOk:'Carregado',
      saveFail:'Erro ao guardar', loadFail:'Erro ao carregar',
      prev:'Anterior', next:'Próximo', moveUp:'Subir', moveDown:'Descer',
      titleSlide:'Slide de título', contentSlide:'Slide de conteúdo',
      twoColumn:'Duas colunas', imageLeft:'Imagem esquerda', imageRight:'Imagem direita',
      blankSlide:'Slide vazio', quoteSlide:'Citação', comparisonSlide:'Comparação',
      timelineSlide:'Cronologia', statsSlide:'Estatísticas', endSlide:'Slide final',
      sectionSlide:'Slide de secção', bulletSlide:'Lista com marcadores',
      bgColor:'Fundo', textColor:'Cor do texto', fontSize:'Tamanho da fonte',
      generate:'Gerar (servidor)', generating:'A gerar...',
      topicLabel:'Tema', slideCount:'Número de slides', generateBtn:'Gerar',
      exportHTML:'Exportar HTML', exportPPTX:'Exportar PPTX', export:'Exportar',
      addText:'Texto', addRect:'Retângulo', addCircle:'Círculo', addTriangle:'Triângulo',
      addImage:'Imagem', imgFromClient:'Imagem do PC', imgFromServer:'Imagem do servidor',
      bgFromClient:'Fundo do PC', bgFromServer:'Fundo do servidor',
      objectProps:'Objeto', objFill:'Preenchimento', objOpacity:'Opacidade', deleteObj:'Eliminar',
      selectImage:'Selecionar imagem', noImages:'Sem imagens', selectBtn:'Selecionar', properties:'Propriedades'
    }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  // ─── Templates ───────────────────────────────────────
  const TEMPLATES = [
    { id:'title',       bg:'linear-gradient(135deg,#667eea,#764ba2)', textColor:'#fff', layout:'title' },
    { id:'content',     bg:'#ffffff',                                  textColor:'#222', layout:'content' },
    { id:'twoColumn',   bg:'#f8f9fa',                                  textColor:'#333', layout:'two-column' },
    { id:'imageLeft',   bg:'#ffffff',                                  textColor:'#333', layout:'image-left' },
    { id:'imageRight',  bg:'#ffffff',                                  textColor:'#333', layout:'image-right' },
    { id:'blank',       bg:'#ffffff',                                  textColor:'#333', layout:'blank' },
    { id:'quote',       bg:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)', textColor:'#e0e0e0', layout:'quote' },
    { id:'comparison',  bg:'#f0f4f8',                                  textColor:'#333', layout:'comparison' },
    { id:'timeline',    bg:'linear-gradient(135deg,#1a1a2e,#16213e)',  textColor:'#eee', layout:'timeline' },
    { id:'stats',       bg:'linear-gradient(135deg,#0f2027,#203a43,#2c5364)', textColor:'#fff', layout:'stats' },
    { id:'end',         bg:'linear-gradient(135deg,#e94560,#0f3460)',  textColor:'#fff', layout:'end' },
    { id:'section',     bg:'linear-gradient(135deg,#11998e,#38ef7d)',  textColor:'#fff', layout:'section' },
    { id:'bullet',      bg:'#ffffff',                                  textColor:'#333', layout:'bullet' }
  ];

  function makeSlide(templateId) {
    var tpl = TEMPLATES.find(function(t) { return t.id === templateId; }) || TEMPLATES[0];
    return {
      id: Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      template: tpl.id,
      bg: tpl.bg,
      textColor: tpl.textColor,
      layout: tpl.layout,
      title: '',
      subtitle: '',
      content: '',
      notes: '',
      bullets: [],
      leftContent: '',
      rightContent: '',
      imageUrl: '',
      quoteText: '',
      quoteAuthor: '',
      items: [],
      fontSize: 18,
      fabricObjects: [],
      bgImage: ''
    };
  }

  return {
    setup() {
      var locale = ref(getLocale());
      function t(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }
      function getToken() { try { return localStorage.getItem('auth_token') || ''; } catch(e) { return ''; } }

      // ─── State ─────────────────────────────────────
      var slides = ref([makeSlide('title')]);
      var currentIndex = ref(0);
      var currentSlide = computed(function() { return slides.value[currentIndex.value] || null; });
      var presenting = ref(false);
      var showSaveDialog = ref(false);
      var showLoadDialog = ref(false);
      var showGenerateDialog = ref(false);
      var saveName = ref('');
      var saving = ref(false);
      var savedList = ref([]);
      var generateTopic = ref('');
      var generateCount = ref(6);
      var generating = ref(false);
      var rightTab = ref('template');

      // Fabric.js refs
      var fabricCanvasEl = ref(null);
      var fsCanvasEl = ref(null);
      var previewWrapRef = ref(null);
      var imageFileInput = ref(null);
      var fCanvas = null;
      var CANVAS_W = 720;
      var CANVAS_H = 405;
      var fabricReady = ref(false);

      // Image browser
      var showImageBrowser = ref(false);
      var serverImages = ref([]);
      var selectedServerImage = ref('');
      var imageInsertMode = ref('');

      // Object selection
      var hasSelectedObject = ref(false);
      var selectedObjProps = reactive({ left: 0, top: 0, fill: '#333', opacity: 1, fontSize: 24, type: '' });

      // Debounce helper
      var _syncTimer = null;
      function debouncedSync() { clearTimeout(_syncTimer); _syncTimer = setTimeout(syncSlideToCanvas, 200); }

      // ─── Load Fabric.js ────────────────────────────
      function loadFabricJs() {
        return new Promise(function(resolve, reject) {
          if (window.fabric && window.fabric.Canvas) { resolve(); return; }
          var origDefine = window.define;
          window.define = undefined;
          var script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js';
          script.onload = function() {
            window.define = origDefine;
            if (window.fabric && window.fabric.Canvas) resolve();
            else reject(new Error('Fabric.js load failed'));
          };
          script.onerror = function() { window.define = origDefine; reject(new Error('Fabric.js CDN error')); };
          document.head.appendChild(script);
        });
      }

      // ─── Init Fabric Canvas ────────────────────────
      function initFabricCanvas() {
        var el = fabricCanvasEl.value;
        if (!el || !window.fabric) return;
        if (fCanvas) { try { fCanvas.dispose(); } catch(e){} }
        fCanvas = new fabric.Canvas(el, {
          width: CANVAS_W, height: CANVAS_H,
          backgroundColor: '#ffffff',
          selection: true,
          preserveObjectStacking: true
        });
        fCanvas.on('selection:created', onObjectSelected);
        fCanvas.on('selection:updated', onObjectSelected);
        fCanvas.on('selection:cleared', onObjectDeselected);
        fCanvas.on('object:modified', saveCanvasToSlide);
        fCanvas.on('object:added', saveCanvasToSlide);
        fCanvas.on('object:removed', saveCanvasToSlide);
        fabricReady.value = true;
        syncSlideToCanvas();
      }

      function onObjectSelected(e) {
        hasSelectedObject.value = true;
        var obj = fCanvas.getActiveObject();
        if (obj) {
          selectedObjProps.left = Math.round(obj.left || 0);
          selectedObjProps.top = Math.round(obj.top || 0);
          selectedObjProps.fill = obj.fill || '#333';
          selectedObjProps.opacity = obj.opacity || 1;
          selectedObjProps.fontSize = obj.fontSize || 24;
          selectedObjProps.type = obj.type || '';
          rightTab.value = 'object';
        }
      }

      function onObjectDeselected() {
        hasSelectedObject.value = false;
      }

      function updateSelectedObject() {
        if (!fCanvas) return;
        var obj = fCanvas.getActiveObject();
        if (!obj) return;
        obj.set({
          left: selectedObjProps.left,
          top: selectedObjProps.top,
          opacity: selectedObjProps.opacity
        });
        if (selectedObjProps.type !== 'image') obj.set({ fill: selectedObjProps.fill });
        if (obj.type === 'textbox' || obj.type === 'i-text') obj.set({ fontSize: selectedObjProps.fontSize });
        fCanvas.renderAll();
        saveCanvasToSlide();
      }

      function deleteSelectedObject() {
        if (!fCanvas) return;
        var obj = fCanvas.getActiveObject();
        if (obj) { fCanvas.remove(obj); fCanvas.discardActiveObject(); fCanvas.renderAll(); }
      }

      function bringForward() {
        if (!fCanvas) return;
        var obj = fCanvas.getActiveObject();
        if (obj) { fCanvas.bringForward(obj); fCanvas.renderAll(); saveCanvasToSlide(); }
      }

      function sendBackward() {
        if (!fCanvas) return;
        var obj = fCanvas.getActiveObject();
        if (obj) { fCanvas.sendBackwards(obj); fCanvas.renderAll(); saveCanvasToSlide(); }
      }

      // ─── Canvas ↔ Slide sync ───────────────────────
      function saveCanvasToSlide() {
        if (!fCanvas || !currentSlide.value) return;
        var json = fCanvas.toJSON(['id','slideObjType']);
        currentSlide.value.fabricObjects = json.objects || [];
        currentSlide.value._canvasBg = json.background || '';
      }

      function syncSlideToCanvas() {
        if (!fCanvas || !currentSlide.value) return;
        var sl = currentSlide.value;
        fCanvas.clear();

        // Set background
        if (sl.bgImage) {
          fabric.Image.fromURL(sl.bgImage, function(img) {
            if (!img) return;
            fCanvas.setBackgroundImage(img, fCanvas.renderAll.bind(fCanvas), {
              scaleX: CANVAS_W / img.width, scaleY: CANVAS_H / img.height
            });
          }, { crossOrigin: 'anonymous' });
        } else {
          fCanvas.setBackgroundColor(sl.bg || '#ffffff', fCanvas.renderAll.bind(fCanvas));
        }

        // Render layout text objects (non-interactive base layer)
        renderLayoutObjects(sl);

        // Restore user-added fabric objects
        if (sl.fabricObjects && sl.fabricObjects.length > 0) {
          fabric.util.enlivenObjects(sl.fabricObjects, function(objs) {
            objs.forEach(function(o) { fCanvas.add(o); });
            fCanvas.renderAll();
          });
        }
      }

      function renderLayoutObjects(sl) {
        if (!fCanvas) return;
        var tc = sl.textColor || '#333';
        var fs = sl.fontSize || 18;

        if (sl.layout === 'title' || sl.layout === 'section' || sl.layout === 'end') {
          if (sl.title) {
            var titleObj = new fabric.Textbox(sl.title, {
              left: 40, top: CANVAS_H * 0.3, width: CANVAS_W - 80,
              fontSize: 36, fontWeight: 'bold', fill: tc, textAlign: 'center',
              selectable: false, evented: false, slideObjType: 'layout'
            });
            fCanvas.add(titleObj);
          }
          if (sl.subtitle) {
            var subObj = new fabric.Textbox(sl.subtitle, {
              left: 80, top: CANVAS_H * 0.55, width: CANVAS_W - 160,
              fontSize: 22, fill: tc, opacity: 0.7, textAlign: 'center',
              selectable: false, evented: false, slideObjType: 'layout'
            });
            fCanvas.add(subObj);
          }
        } else if (sl.layout === 'content') {
          if (sl.title) {
            fCanvas.add(new fabric.Textbox(sl.title, {
              left: 40, top: 30, width: CANVAS_W - 80,
              fontSize: 28, fontWeight: 'bold', fill: tc, textAlign: 'center',
              selectable: false, evented: false, slideObjType: 'layout'
            }));
          }
          if (sl.content) {
            fCanvas.add(new fabric.Textbox(sl.content, {
              left: 40, top: 80, width: CANVAS_W - 80,
              fontSize: fs, fill: tc, textAlign: 'center',
              selectable: false, evented: false, slideObjType: 'layout'
            }));
          }
        } else if (sl.layout === 'bullet') {
          if (sl.title) {
            fCanvas.add(new fabric.Textbox(sl.title, {
              left: 40, top: 30, width: CANVAS_W - 80,
              fontSize: 28, fontWeight: 'bold', fill: tc, textAlign: 'center',
              selectable: false, evented: false, slideObjType: 'layout'
            }));
          }
          if (sl.bullets && sl.bullets.length) {
            var bulletText = sl.bullets.map(function(b) { return '• ' + b; }).join('\n');
            fCanvas.add(new fabric.Textbox(bulletText, {
              left: 60, top: 80, width: CANVAS_W - 120,
              fontSize: fs, fill: tc, lineHeight: 1.8,
              selectable: false, evented: false, slideObjType: 'layout'
            }));
          }
        } else if (sl.layout === 'two-column') {
          if (sl.title) {
            fCanvas.add(new fabric.Textbox(sl.title, {
              left: 40, top: 30, width: CANVAS_W - 80,
              fontSize: 28, fontWeight: 'bold', fill: tc, textAlign: 'center',
              selectable: false, evented: false, slideObjType: 'layout'
            }));
          }
          if (sl.leftContent) {
            fCanvas.add(new fabric.Textbox(sl.leftContent, {
              left: 30, top: 80, width: CANVAS_W / 2 - 50,
              fontSize: fs - 2, fill: tc,
              selectable: false, evented: false, slideObjType: 'layout'
            }));
          }
          if (sl.rightContent) {
            fCanvas.add(new fabric.Textbox(sl.rightContent, {
              left: CANVAS_W / 2 + 20, top: 80, width: CANVAS_W / 2 - 50,
              fontSize: fs - 2, fill: tc,
              selectable: false, evented: false, slideObjType: 'layout'
            }));
          }
        } else if (sl.layout === 'quote') {
          if (sl.quoteText) {
            fCanvas.add(new fabric.Textbox('"' + sl.quoteText + '"', {
              left: 60, top: CANVAS_H * 0.25, width: CANVAS_W - 120,
              fontSize: 24, fontStyle: 'italic', fill: tc, textAlign: 'center',
              selectable: false, evented: false, slideObjType: 'layout'
            }));
          }
          if (sl.quoteAuthor) {
            fCanvas.add(new fabric.Textbox('— ' + sl.quoteAuthor, {
              left: 60, top: CANVAS_H * 0.65, width: CANVAS_W - 120,
              fontSize: 16, fill: tc, opacity: 0.7, textAlign: 'center',
              selectable: false, evented: false, slideObjType: 'layout'
            }));
          }
        } else if (sl.layout === 'stats' || sl.layout === 'timeline' || sl.layout === 'comparison') {
          if (sl.title) {
            fCanvas.add(new fabric.Textbox(sl.title, {
              left: 40, top: 30, width: CANVAS_W - 80,
              fontSize: 28, fontWeight: 'bold', fill: tc, textAlign: 'center',
              selectable: false, evented: false, slideObjType: 'layout'
            }));
          }
          if (sl.items && sl.items.length) {
            var iw = (CANVAS_W - 80) / sl.items.length;
            sl.items.forEach(function(it, idx) {
              fCanvas.add(new fabric.Textbox(it.value || '', {
                left: 40 + idx * iw, top: CANVAS_H * 0.35, width: iw - 10,
                fontSize: 28, fontWeight: 'bold', fill: tc, textAlign: 'center',
                selectable: false, evented: false, slideObjType: 'layout'
              }));
              fCanvas.add(new fabric.Textbox(it.label || '', {
                left: 40 + idx * iw, top: CANVAS_H * 0.55, width: iw - 10,
                fontSize: 13, fill: tc, opacity: 0.6, textAlign: 'center',
                selectable: false, evented: false, slideObjType: 'layout'
              }));
            });
          }
        } else if (sl.layout === 'image-left' || sl.layout === 'image-right') {
          if (sl.title) {
            fCanvas.add(new fabric.Textbox(sl.title, {
              left: 40, top: 20, width: CANVAS_W - 80,
              fontSize: 26, fontWeight: 'bold', fill: tc, textAlign: 'center',
              selectable: false, evented: false, slideObjType: 'layout'
            }));
          }
          var imgSide = sl.layout === 'image-left' ? 'left' : 'right';
          var textX = imgSide === 'left' ? CANVAS_W / 2 + 10 : 30;
          if (sl.content) {
            fCanvas.add(new fabric.Textbox(sl.content, {
              left: textX, top: 70, width: CANVAS_W / 2 - 40,
              fontSize: fs, fill: tc,
              selectable: false, evented: false, slideObjType: 'layout'
            }));
          }
          if (sl.imageUrl) {
            var imgX = imgSide === 'left' ? 20 : CANVAS_W / 2 + 10;
            fabric.Image.fromURL(sl.imageUrl, function(img) {
              if (!img) return;
              var scale = Math.min((CANVAS_W / 2 - 40) / img.width, (CANVAS_H - 100) / img.height);
              img.set({
                left: imgX, top: 70, scaleX: scale, scaleY: scale,
                selectable: false, evented: false, slideObjType: 'layout'
              });
              fCanvas.add(img);
              fCanvas.renderAll();
            }, { crossOrigin: 'anonymous' });
          }
        } else {
          // blank
          if (sl.title) {
            fCanvas.add(new fabric.Textbox(sl.title, {
              left: 40, top: 40, width: CANVAS_W - 80,
              fontSize: 28, fontWeight: 'bold', fill: tc, textAlign: 'center',
              selectable: false, evented: false, slideObjType: 'layout'
            }));
          }
          if (sl.content) {
            fCanvas.add(new fabric.Textbox(sl.content, {
              left: 40, top: 100, width: CANVAS_W - 80,
              fontSize: fs, fill: tc, textAlign: 'center',
              selectable: false, evented: false, slideObjType: 'layout'
            }));
          }
        }
        fCanvas.renderAll();
      }

      // ─── Slide management ─────────────────────────
      function selectSlide(idx) {
        if (idx >= 0 && idx < slides.value.length) {
          saveCanvasToSlide();
          currentIndex.value = idx;
        }
      }

      function addSlide(templateId) {
        saveCanvasToSlide();
        var s = makeSlide(templateId || 'content');
        slides.value.splice(currentIndex.value + 1, 0, s);
        currentIndex.value = currentIndex.value + 1;
      }

      function deleteSlide() {
        if (slides.value.length <= 1) return;
        slides.value.splice(currentIndex.value, 1);
        if (currentIndex.value >= slides.value.length) currentIndex.value = slides.value.length - 1;
      }

      function duplicateSlide() {
        saveCanvasToSlide();
        var copy = JSON.parse(JSON.stringify(currentSlide.value));
        copy.id = Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        slides.value.splice(currentIndex.value + 1, 0, copy);
        currentIndex.value = currentIndex.value + 1;
      }

      function moveSlide(dir) {
        saveCanvasToSlide();
        var idx = currentIndex.value;
        var newIdx = idx + dir;
        if (newIdx < 0 || newIdx >= slides.value.length) return;
        var arr = slides.value.slice();
        var tmp = arr[idx];
        arr[idx] = arr[newIdx];
        arr[newIdx] = tmp;
        slides.value = arr;
        currentIndex.value = newIdx;
      }

      function applyTemplate(templateId) {
        var tpl = TEMPLATES.find(function(t2) { return t2.id === templateId; });
        if (!tpl || !currentSlide.value) return;
        currentSlide.value.template = tpl.id;
        currentSlide.value.bg = tpl.bg;
        currentSlide.value.textColor = tpl.textColor;
        currentSlide.value.layout = tpl.layout;
        syncSlideToCanvas();
      }

      function prevSlide() { if (currentIndex.value > 0) { saveCanvasToSlide(); currentIndex.value--; } }
      function nextSlide() { if (currentIndex.value < slides.value.length - 1) { saveCanvasToSlide(); currentIndex.value++; } }

      // Watch slide changes
      watch(currentIndex, function() { nextTick(syncSlideToCanvas); });

      // ─── Fabric Object Tools ───────────────────────
      function addTextObject() {
        if (!fCanvas) return;
        var tc = (currentSlide.value && currentSlide.value.textColor) || '#333';
        var text = new fabric.Textbox(t('addText'), {
          left: 100, top: 100, width: 200,
          fontSize: 24, fill: tc, fontFamily: 'system-ui, sans-serif',
          slideObjType: 'user'
        });
        fCanvas.add(text);
        fCanvas.setActiveObject(text);
        fCanvas.renderAll();
      }

      function addShape(type) {
        if (!fCanvas) return;
        var obj;
        if (type === 'rect') {
          obj = new fabric.Rect({ left: 100, top: 100, width: 120, height: 80, fill: '#4a90d9', rx: 6, ry: 6, slideObjType: 'user' });
        } else if (type === 'circle') {
          obj = new fabric.Circle({ left: 150, top: 120, radius: 50, fill: '#e94560', slideObjType: 'user' });
        } else if (type === 'triangle') {
          obj = new fabric.Triangle({ left: 120, top: 100, width: 100, height: 90, fill: '#38ef7d', slideObjType: 'user' });
        }
        if (obj) {
          fCanvas.add(obj);
          fCanvas.setActiveObject(obj);
          fCanvas.renderAll();
        }
      }

      // ─── Image Management ─────────────────────────
      function handleImageInsert(cmd) {
        imageInsertMode.value = cmd;
        if (cmd === 'client-object' || cmd === 'client-bg') {
          nextTick(function() {
            if (imageFileInput.value) imageFileInput.value.click();
          });
        } else if (cmd === 'server-object' || cmd === 'server-bg') {
          loadServerImages();
        }
      }

      function onImageFileSelected(e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;
        // Upload to server first
        var formData = new FormData();
        formData.append('files', file);
        var token = getToken();
        fetch('/api/presentation/upload-image', {
          method: 'POST',
          headers: token ? { 'Authorization': 'Bearer ' + token } : {},
          body: formData
        }).then(function(resp) { return resp.json(); })
        .then(function(data) {
          if (data.ok && data.files && data.files.length > 0) {
            var url = data.files[0].url;
            applyImageToCanvas(url, imageInsertMode.value);
            ElMessage.success(t('saved'));
          }
        }).catch(function(err) {
          console.error('[Presentation] image upload error:', err);
          // Fallback: use local data URL
          var reader = new FileReader();
          reader.onload = function(ev) {
            applyImageToCanvas(ev.target.result, imageInsertMode.value);
          };
          reader.readAsDataURL(file);
        });
        // Reset input
        if (imageFileInput.value) imageFileInput.value.value = '';
      }

      async function loadServerImages() {
        try {
          var token = getToken();
          var resp = await fetch('/api/photos/list', {
            headers: token ? { 'Authorization': 'Bearer ' + token } : {}
          });
          if (!resp.ok) throw new Error('Failed');
          var data = await resp.json();
          serverImages.value = (data.user || data || []).map(function(img) {
            return { filename: img.filename || img.name, name: img.name || img.filename, url: img.url || ('/api/photos/file/user/' + encodeURIComponent(img.filename || img.name)) };
          });
          selectedServerImage.value = '';
          showImageBrowser.value = true;
        } catch(err) {
          console.error('[Presentation] load images error:', err);
          ElMessage.error(t('loadFail'));
        }
      }

      function confirmServerImage() {
        if (!selectedServerImage.value) return;
        applyImageToCanvas(selectedServerImage.value, imageInsertMode.value);
        showImageBrowser.value = false;
      }

      function applyImageToCanvas(url, mode) {
        if (!fCanvas || !currentSlide.value) return;
        if (mode === 'client-bg' || mode === 'server-bg') {
          currentSlide.value.bgImage = url;
          fabric.Image.fromURL(url, function(img) {
            if (!img) return;
            fCanvas.setBackgroundImage(img, fCanvas.renderAll.bind(fCanvas), {
              scaleX: CANVAS_W / img.width, scaleY: CANVAS_H / img.height
            });
          }, { crossOrigin: 'anonymous' });
        } else {
          fabric.Image.fromURL(url, function(img) {
            if (!img) return;
            var scale = Math.min(300 / img.width, 250 / img.height, 1);
            img.set({
              left: 100, top: 80,
              scaleX: scale, scaleY: scale,
              slideObjType: 'user'
            });
            fCanvas.add(img);
            fCanvas.setActiveObject(img);
            fCanvas.renderAll();
          }, { crossOrigin: 'anonymous' });
        }
      }

      // ─── Presentation mode ─────────────────────────
      function startPresentation() {
        saveCanvasToSlide();
        presenting.value = true;
        nextTick(renderPresentationSlide);
      }

      function exitPresentation() { presenting.value = false; }

      function renderPresentationSlide() {
        var el = fsCanvasEl.value;
        if (!el || !currentSlide.value) return;
        var sl = currentSlide.value;
        var ctx = el.getContext('2d');
        var w = window.innerWidth;
        var h = window.innerHeight - 50;
        el.width = w; el.height = h;
        var scaleX = w / CANVAS_W;
        var scaleY = h / CANVAS_H;

        // Draw using a temp static canvas
        var tempCanvas = new fabric.StaticCanvas(null, { width: CANVAS_W, height: CANVAS_H });
        if (sl.bgImage) {
          fabric.Image.fromURL(sl.bgImage, function(img) {
            if (!img) return;
            tempCanvas.setBackgroundImage(img, function() {
              addObjectsAndRender(tempCanvas, sl, ctx, w, h, scaleX, scaleY);
            }, { scaleX: CANVAS_W / img.width, scaleY: CANVAS_H / img.height });
          }, { crossOrigin: 'anonymous' });
        } else {
          tempCanvas.setBackgroundColor(sl.bg || '#ffffff', function() {
            addObjectsAndRender(tempCanvas, sl, ctx, w, h, scaleX, scaleY);
          });
        }
      }

      function addObjectsAndRender(tempCanvas, sl, ctx, w, h, scaleX, scaleY) {
        renderLayoutToStaticCanvas(tempCanvas, sl);
        if (sl.fabricObjects && sl.fabricObjects.length) {
          fabric.util.enlivenObjects(sl.fabricObjects, function(objs) {
            objs.forEach(function(o) { tempCanvas.add(o); });
            tempCanvas.renderAll();
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(tempCanvas.getElement(), 0, 0, CANVAS_W, CANVAS_H, 0, 0, w, h);
          });
        } else {
          tempCanvas.renderAll();
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(tempCanvas.getElement(), 0, 0, CANVAS_W, CANVAS_H, 0, 0, w, h);
        }
      }

      function renderLayoutToStaticCanvas(sCanvas, sl) {
        var tc = sl.textColor || '#333';
        var fs = sl.fontSize || 18;
        if (sl.layout === 'title' || sl.layout === 'section' || sl.layout === 'end') {
          if (sl.title) sCanvas.add(new fabric.Textbox(sl.title, { left:40,top:CANVAS_H*0.3,width:CANVAS_W-80,fontSize:36,fontWeight:'bold',fill:tc,textAlign:'center',selectable:false }));
          if (sl.subtitle) sCanvas.add(new fabric.Textbox(sl.subtitle, { left:80,top:CANVAS_H*0.55,width:CANVAS_W-160,fontSize:22,fill:tc,opacity:0.7,textAlign:'center',selectable:false }));
        } else if (sl.layout === 'content') {
          if (sl.title) sCanvas.add(new fabric.Textbox(sl.title, { left:40,top:30,width:CANVAS_W-80,fontSize:28,fontWeight:'bold',fill:tc,textAlign:'center',selectable:false }));
          if (sl.content) sCanvas.add(new fabric.Textbox(sl.content, { left:40,top:80,width:CANVAS_W-80,fontSize:fs,fill:tc,textAlign:'center',selectable:false }));
        } else if (sl.layout === 'bullet') {
          if (sl.title) sCanvas.add(new fabric.Textbox(sl.title, { left:40,top:30,width:CANVAS_W-80,fontSize:28,fontWeight:'bold',fill:tc,textAlign:'center',selectable:false }));
          if (sl.bullets && sl.bullets.length) {
            sCanvas.add(new fabric.Textbox(sl.bullets.map(function(b){return '• '+b}).join('\n'), { left:60,top:80,width:CANVAS_W-120,fontSize:fs,fill:tc,lineHeight:1.8,selectable:false }));
          }
        } else if (sl.layout === 'two-column') {
          if (sl.title) sCanvas.add(new fabric.Textbox(sl.title, { left:40,top:30,width:CANVAS_W-80,fontSize:28,fontWeight:'bold',fill:tc,textAlign:'center',selectable:false }));
          if (sl.leftContent) sCanvas.add(new fabric.Textbox(sl.leftContent, { left:30,top:80,width:CANVAS_W/2-50,fontSize:fs-2,fill:tc,selectable:false }));
          if (sl.rightContent) sCanvas.add(new fabric.Textbox(sl.rightContent, { left:CANVAS_W/2+20,top:80,width:CANVAS_W/2-50,fontSize:fs-2,fill:tc,selectable:false }));
        } else if (sl.layout === 'quote') {
          if (sl.quoteText) sCanvas.add(new fabric.Textbox('"'+sl.quoteText+'"', { left:60,top:CANVAS_H*0.25,width:CANVAS_W-120,fontSize:24,fontStyle:'italic',fill:tc,textAlign:'center',selectable:false }));
          if (sl.quoteAuthor) sCanvas.add(new fabric.Textbox('— '+sl.quoteAuthor, { left:60,top:CANVAS_H*0.65,width:CANVAS_W-120,fontSize:16,fill:tc,opacity:0.7,textAlign:'center',selectable:false }));
        } else if (sl.layout === 'stats' || sl.layout === 'timeline' || sl.layout === 'comparison') {
          if (sl.title) sCanvas.add(new fabric.Textbox(sl.title, { left:40,top:30,width:CANVAS_W-80,fontSize:28,fontWeight:'bold',fill:tc,textAlign:'center',selectable:false }));
          if (sl.items && sl.items.length) {
            var iw = (CANVAS_W-80)/sl.items.length;
            sl.items.forEach(function(it,idx) {
              sCanvas.add(new fabric.Textbox(it.value||'', { left:40+idx*iw,top:CANVAS_H*0.35,width:iw-10,fontSize:28,fontWeight:'bold',fill:tc,textAlign:'center',selectable:false }));
              sCanvas.add(new fabric.Textbox(it.label||'', { left:40+idx*iw,top:CANVAS_H*0.55,width:iw-10,fontSize:13,fill:tc,opacity:0.6,textAlign:'center',selectable:false }));
            });
          }
        } else {
          if (sl.title) sCanvas.add(new fabric.Textbox(sl.title, { left:40,top:40,width:CANVAS_W-80,fontSize:28,fontWeight:'bold',fill:tc,textAlign:'center',selectable:false }));
          if (sl.content) sCanvas.add(new fabric.Textbox(sl.content, { left:40,top:100,width:CANVAS_W-80,fontSize:fs,fill:tc,textAlign:'center',selectable:false }));
        }
      }

      watch(function() { return presenting.value ? currentIndex.value : -1; }, function(v) {
        if (v >= 0) nextTick(renderPresentationSlide);
      });

      function onKeyDown(e) {
        if (!presenting.value) return;
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); nextSlide(); }
        else if (e.key === 'ArrowLeft' || e.key === 'Backspace') { e.preventDefault(); prevSlide(); }
        else if (e.key === 'Escape') { e.preventDefault(); exitPresentation(); }
      }

      // ─── New presentation ─────────────────────────
      function newPresentation() {
        slides.value = [makeSlide('title')];
        currentIndex.value = 0;
        nextTick(syncSlideToCanvas);
      }

      // ─── Bullet helpers ────────────────────────────
      function addBullet() {
        if (!currentSlide.value) return;
        if (!currentSlide.value.bullets) currentSlide.value.bullets = [];
        currentSlide.value.bullets.push('');
      }
      function removeBullet(idx) {
        if (!currentSlide.value || !currentSlide.value.bullets) return;
        currentSlide.value.bullets.splice(idx, 1);
        syncSlideToCanvas();
      }

      // ─── Item helpers ─────────────────────────────
      function addItem() {
        if (!currentSlide.value) return;
        if (!currentSlide.value.items) currentSlide.value.items = [];
        currentSlide.value.items.push({ label: '', value: '' });
      }
      function removeItem(idx) {
        if (!currentSlide.value || !currentSlide.value.items) return;
        currentSlide.value.items.splice(idx, 1);
        syncSlideToCanvas();
      }

      // ─── Save/Load ────────────────────────────────
      async function saveToServer() {
        if (!saveName.value.trim()) return;
        saving.value = true;
        saveCanvasToSlide();
        try {
          var token = getToken();
          var resp = await fetch('/api/presentation/save', {
            method: 'POST',
            headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { 'Authorization': 'Bearer ' + token } : {}),
            body: JSON.stringify({ name: saveName.value.trim(), slides: slides.value })
          });
          if (!resp.ok) throw new Error('Save failed');
          showSaveDialog.value = false;
          saveName.value = '';
          ElMessage.success(t('saved'));
        } catch (e) {
          console.error('[Presentation] save error:', e);
          ElMessage.error(t('saveFail'));
        } finally { saving.value = false; }
      }

      async function loadSavedList() {
        try {
          var token = getToken();
          var resp = await fetch('/api/presentation/list', {
            headers: token ? { 'Authorization': 'Bearer ' + token } : {}
          });
          if (!resp.ok) throw new Error('List failed');
          savedList.value = await resp.json();
          showLoadDialog.value = true;
        } catch (e) {
          console.error('[Presentation] list error:', e);
          ElMessage.error(t('loadFail'));
        }
      }

      async function loadFromServer(id) {
        try {
          var token = getToken();
          var resp = await fetch('/api/presentation/load/' + encodeURIComponent(id), {
            headers: token ? { 'Authorization': 'Bearer ' + token } : {}
          });
          if (!resp.ok) throw new Error('Load failed');
          var data = await resp.json();
          if (data.slides && data.slides.length > 0) {
            slides.value = data.slides;
            currentIndex.value = 0;
            nextTick(syncSlideToCanvas);
          }
          showLoadDialog.value = false;
          ElMessage.success(t('loadOk'));
        } catch (e) {
          console.error('[Presentation] load error:', e);
          ElMessage.error(t('loadFail'));
        }
      }

      async function deleteFromServer(id) {
        try {
          var token = getToken();
          await fetch('/api/presentation/delete/' + encodeURIComponent(id), {
            method: 'DELETE',
            headers: token ? { 'Authorization': 'Bearer ' + token } : {}
          });
          savedList.value = savedList.value.filter(function(s) { return s.id !== id; });
        } catch (e) { console.error(e); }
      }

      // ─── Server Generate ──────────────────────────
      async function serverGenerate() {
        if (!generateTopic.value.trim()) return;
        generating.value = true;
        try {
          var token = getToken();
          var resp = await fetch('/api/presentation/generate', {
            method: 'POST',
            headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { 'Authorization': 'Bearer ' + token } : {}),
            body: JSON.stringify({ topic: generateTopic.value.trim(), count: generateCount.value })
          });
          if (!resp.ok) throw new Error('Generate failed');
          var data = await resp.json();
          if (data.slides && data.slides.length > 0) {
            slides.value = data.slides;
            currentIndex.value = 0;
            nextTick(syncSlideToCanvas);
          }
          showGenerateDialog.value = false;
          generateTopic.value = '';
        } catch (e) {
          console.error('[Presentation] generate error:', e);
          ElMessage.error(t('saveFail'));
        } finally { generating.value = false; }
      }

      // ─── Client-side Generate ─────────────────────
      function clientGenerate(topic, count) {
        var topicStr = topic || generateTopic.value.trim() || 'Presentation';
        var n = count || generateCount.value || 6;
        var newSlides = [];

        var s0 = makeSlide('title');
        s0.title = topicStr;
        s0.subtitle = new Date().toLocaleDateString();
        newSlides.push(s0);

        for (var i = 1; i < n - 1; i++) {
          var tplIdx = i % 6;
          var tplIds = ['content', 'bullet', 'twoColumn', 'quote', 'stats', 'timeline'];
          var s = makeSlide(tplIds[tplIdx]);
          s.title = topicStr + ' — ' + t('slideN') + ' ' + (i + 1);
          if (s.layout === 'bullet') s.bullets = ['Point 1', 'Point 2', 'Point 3'];
          else if (s.layout === 'two-column') { s.leftContent = 'Left column content'; s.rightContent = 'Right column content'; }
          else if (s.layout === 'quote') { s.quoteText = 'Insert your quote here'; s.quoteAuthor = 'Author'; }
          else if (s.layout === 'stats') s.items = [{ label:'Stat 1', value:'100%' }, { label:'Stat 2', value:'50+' }];
          else if (s.layout === 'timeline') s.items = [{ label:'2020', value:'Event 1' }, { label:'2023', value:'Event 2' }];
          else s.content = 'Add your content here...';
          newSlides.push(s);
        }

        var sEnd = makeSlide('end');
        sEnd.title = topicStr;
        sEnd.subtitle = '🎯';
        newSlides.push(sEnd);

        slides.value = newSlides;
        currentIndex.value = 0;
        showGenerateDialog.value = false;
        nextTick(syncSlideToCanvas);
      }

      // ─── Export ────────────────────────────────────
      function handleExport(cmd) {
        if (cmd === 'html') exportHTML();
        else if (cmd === 'pptx') exportPPTX();
      }

      function exportHTML() {
        saveCanvasToSlide();
        var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + escapeHtml(slides.value[0] && slides.value[0].title || 'Presentation') + '</title>';
        html += '<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif}';
        html += '.slide{width:100vw;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px;page-break-after:always}';
        html += '.slide h1{font-size:3em;margin-bottom:.3em}.slide h2{font-size:1.8em;opacity:.8;margin-bottom:.5em}';
        html += '.slide .content{font-size:1.3em;max-width:80%;text-align:center;line-height:1.6}';
        html += '.slide .bullets{text-align:left;font-size:1.3em;line-height:2}.slide .bullets li{margin-bottom:.3em}';
        html += '.slide .two-col{display:flex;gap:40px;width:80%}.slide .two-col>div{flex:1}';
        html += '.slide blockquote{font-size:1.8em;font-style:italic;max-width:70%;text-align:center;line-height:1.5}';
        html += '.slide .quote-author{margin-top:20px;font-size:1.1em;opacity:.7}';
        html += '.slide .items{display:flex;gap:30px;flex-wrap:wrap;justify-content:center}';
        html += '.slide .item{text-align:center;padding:20px}.slide .item .val{font-size:2.5em;font-weight:bold}.slide .item .lbl{font-size:1em;opacity:.7;margin-top:5px}';
        html += '</style></head><body>';

        for (var i = 0; i < slides.value.length; i++) {
          var sl = slides.value[i];
          html += '<div class="slide" style="background:' + escapeHtml(sl.bg) + ';color:' + escapeHtml(sl.textColor) + '">';
          if (sl.title) html += '<h1>' + escapeHtml(sl.title) + '</h1>';
          if (sl.subtitle) html += '<h2>' + escapeHtml(sl.subtitle) + '</h2>';
          if (sl.layout === 'bullet' && sl.bullets && sl.bullets.length) {
            html += '<ul class="bullets">';
            for (var b = 0; b < sl.bullets.length; b++) html += '<li>' + escapeHtml(sl.bullets[b]) + '</li>';
            html += '</ul>';
          } else if (sl.layout === 'two-column') {
            html += '<div class="two-col"><div>' + escapeHtml(sl.leftContent || '') + '</div><div>' + escapeHtml(sl.rightContent || '') + '</div></div>';
          } else if (sl.layout === 'quote') {
            html += '<blockquote>' + escapeHtml(sl.quoteText || '') + '</blockquote>';
            if (sl.quoteAuthor) html += '<div class="quote-author">— ' + escapeHtml(sl.quoteAuthor) + '</div>';
          } else if ((sl.layout === 'stats' || sl.layout === 'timeline' || sl.layout === 'comparison') && sl.items && sl.items.length) {
            html += '<div class="items">';
            for (var it = 0; it < sl.items.length; it++) {
              html += '<div class="item"><div class="val">' + escapeHtml(sl.items[it].value || '') + '</div><div class="lbl">' + escapeHtml(sl.items[it].label || '') + '</div></div>';
            }
            html += '</div>';
          } else if (sl.content) {
            html += '<div class="content">' + escapeHtml(sl.content) + '</div>';
          }
          html += '</div>';
        }
        html += '</body></html>';

        var blob = new Blob([html], { type: 'text/html' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = (slides.value[0] && slides.value[0].title || 'presentation') + '.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      async function exportPPTX() {
        saveCanvasToSlide();
        try {
          var token = getToken();
          var resp = await fetch('/api/presentation/export-pptx', {
            method: 'POST',
            headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { 'Authorization': 'Bearer ' + token } : {}),
            body: JSON.stringify({ slides: slides.value, name: slides.value[0] && slides.value[0].title || 'presentation' })
          });
          if (!resp.ok) throw new Error('Export failed');
          var blob = await resp.blob();
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = (slides.value[0] && slides.value[0].title || 'presentation') + '.pptx';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          ElMessage.success('PPTX ' + t('saved'));
        } catch(e) {
          console.error('[Presentation] PPTX export error:', e);
          ElMessage.error(t('saveFail'));
        }
      }

      function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      }

      function getSlidePreviewStyle(sl) {
        return { background: sl.bg, color: sl.textColor };
      }

      // ─── Lifecycle ─────────────────────────────────
      onMounted(function() {
        window.addEventListener('locale-changed', onLocaleChanged);
        window.addEventListener('keydown', onKeyDown);
        loadFabricJs().then(function() {
          nextTick(initFabricCanvas);
        }).catch(function(err) {
          console.error('[Presentation] Fabric.js load error:', err);
        });
      });
      onUnmounted(function() {
        window.removeEventListener('locale-changed', onLocaleChanged);
        window.removeEventListener('keydown', onKeyDown);
        if (fCanvas) { try { fCanvas.dispose(); } catch(e){} fCanvas = null; }
      });

      return {
        t, locale, slides, currentIndex, currentSlide, presenting,
        showSaveDialog, showLoadDialog, showGenerateDialog,
        saveName, saving, savedList,
        generateTopic, generateCount, generating,
        TEMPLATES, rightTab,
        fabricCanvasEl, fsCanvasEl, previewWrapRef, imageFileInput,
        hasSelectedObject, selectedObjProps,
        showImageBrowser, serverImages, selectedServerImage,
        selectSlide, addSlide, deleteSlide, duplicateSlide, moveSlide,
        applyTemplate, prevSlide, nextSlide,
        startPresentation, exitPresentation,
        newPresentation, addBullet, removeBullet, addItem, removeItem,
        saveToServer, loadSavedList, loadFromServer, deleteFromServer,
        serverGenerate, clientGenerate,
        exportHTML, exportPPTX, handleExport,
        getSlidePreviewStyle, syncSlideToCanvas, debouncedSync,
        addTextObject, addShape, handleImageInsert, onImageFileSelected,
        confirmServerImage, deleteSelectedObject, updateSelectedObject,
        bringForward, sendBackward
      };
    }
  };
})(Vue);
