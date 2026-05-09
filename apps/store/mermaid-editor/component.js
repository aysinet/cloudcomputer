(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, nextTick, watch } = Vue;

  const LANGS = {
    tr: {
      new: 'Yeni', open: 'Aç', save: 'Kaydet', saveAs: 'Farklı Kaydet',
      templates: 'Şablonlar', code: 'Kod', preview: 'Önizleme',
      line: 'Satır', col: 'Sütun', chars: 'Karakter', lines: 'Satır',
      lastSaved: 'Son kayıt', filename: 'Dosya adı', cancel: 'İptal',
      themeDefault: 'Varsayılan', themeDark: 'Koyu', themeForest: 'Orman', themeNeutral: 'Nötr',
      exportSuccess: 'Dışa aktarıldı', saveSuccess: 'Kaydedildi', loadSuccess: 'Yüklendi',
      noFiles: 'Dosya bulunamadı',
      tpl_flowchart: 'Akış Şeması', tpl_sequence: 'Sıralama Diyagramı',
      tpl_class: 'Sınıf Diyagramı', tpl_state: 'Durum Diyagramı',
      tpl_er: 'ER Diyagramı', tpl_gantt: 'Gantt Şeması',
      tpl_pie: 'Pasta Grafik', tpl_mindmap: 'Zihin Haritası',
      tpl_timeline: 'Zaman Çizelgesi', tpl_gitgraph: 'Git Grafiği',
      tpl_journey: 'Kullanıcı Yolculuğu', tpl_quadrant: 'Kadran Grafiği',
      tpl_sankey: 'Sankey Diyagramı', tpl_block: 'Blok Diyagramı',
      newConfirm: 'Mevcut diyagram silinecek. Devam edilsin mi?',
      yes: 'Evet', no: 'Hayır', confirm: 'Onayla',
      openFromServer: 'Sunucudan Aç', saveToServer: 'Sunucuya Kaydet',
      mermaidFiles: 'Mermaid Dosyaları', allFiles: 'Tüm Dosyalar'
    },
    en: {
      new: 'New', open: 'Open', save: 'Save', saveAs: 'Save As',
      templates: 'Templates', code: 'Code', preview: 'Preview',
      line: 'Line', col: 'Col', chars: 'Chars', lines: 'Lines',
      lastSaved: 'Last saved', filename: 'Filename', cancel: 'Cancel',
      themeDefault: 'Default', themeDark: 'Dark', themeForest: 'Forest', themeNeutral: 'Neutral',
      exportSuccess: 'Exported', saveSuccess: 'Saved', loadSuccess: 'Loaded',
      noFiles: 'No files found',
      tpl_flowchart: 'Flowchart', tpl_sequence: 'Sequence Diagram',
      tpl_class: 'Class Diagram', tpl_state: 'State Diagram',
      tpl_er: 'ER Diagram', tpl_gantt: 'Gantt Chart',
      tpl_pie: 'Pie Chart', tpl_mindmap: 'Mind Map',
      tpl_timeline: 'Timeline', tpl_gitgraph: 'Git Graph',
      tpl_journey: 'User Journey', tpl_quadrant: 'Quadrant Chart',
      tpl_sankey: 'Sankey Diagram', tpl_block: 'Block Diagram',
      newConfirm: 'Current diagram will be cleared. Continue?',
      yes: 'Yes', no: 'No', confirm: 'Confirm',
      openFromServer: 'Open from Server', saveToServer: 'Save to Server',
      mermaidFiles: 'Mermaid Files', allFiles: 'All Files'
    },
    de: {
      new: 'Neu', open: 'Öffnen', save: 'Speichern', saveAs: 'Speichern unter',
      templates: 'Vorlagen', code: 'Code', preview: 'Vorschau',
      line: 'Zeile', col: 'Spalte', chars: 'Zeichen', lines: 'Zeilen',
      lastSaved: 'Zuletzt gespeichert', filename: 'Dateiname', cancel: 'Abbrechen',
      themeDefault: 'Standard', themeDark: 'Dunkel', themeForest: 'Wald', themeNeutral: 'Neutral',
      exportSuccess: 'Exportiert', saveSuccess: 'Gespeichert', loadSuccess: 'Geladen',
      noFiles: 'Keine Dateien gefunden',
      tpl_flowchart: 'Flussdiagramm', tpl_sequence: 'Sequenzdiagramm',
      tpl_class: 'Klassendiagramm', tpl_state: 'Zustandsdiagramm',
      tpl_er: 'ER-Diagramm', tpl_gantt: 'Gantt-Diagramm',
      tpl_pie: 'Kreisdiagramm', tpl_mindmap: 'Mindmap',
      tpl_timeline: 'Zeitleiste', tpl_gitgraph: 'Git-Graph',
      tpl_journey: 'User Journey', tpl_quadrant: 'Quadrantendiagramm',
      tpl_sankey: 'Sankey-Diagramm', tpl_block: 'Blockdiagramm',
      newConfirm: 'Das aktuelle Diagramm wird gelöscht. Fortfahren?',
      yes: 'Ja', no: 'Nein', confirm: 'Bestätigen',
      openFromServer: 'Vom Server öffnen', saveToServer: 'Auf Server speichern',
      mermaidFiles: 'Mermaid-Dateien', allFiles: 'Alle Dateien'
    },
    fr: {
      new: 'Nouveau', open: 'Ouvrir', save: 'Enregistrer', saveAs: 'Enregistrer sous',
      templates: 'Modèles', code: 'Code', preview: 'Aperçu',
      line: 'Ligne', col: 'Col', chars: 'Caractères', lines: 'Lignes',
      lastSaved: 'Dernière sauvegarde', filename: 'Nom du fichier', cancel: 'Annuler',
      themeDefault: 'Par défaut', themeDark: 'Sombre', themeForest: 'Forêt', themeNeutral: 'Neutre',
      exportSuccess: 'Exporté', saveSuccess: 'Enregistré', loadSuccess: 'Chargé',
      noFiles: 'Aucun fichier trouvé',
      tpl_flowchart: 'Organigramme', tpl_sequence: 'Diagramme de séquence',
      tpl_class: 'Diagramme de classes', tpl_state: 'Diagramme d\'état',
      tpl_er: 'Diagramme ER', tpl_gantt: 'Diagramme de Gantt',
      tpl_pie: 'Graphique circulaire', tpl_mindmap: 'Carte mentale',
      tpl_timeline: 'Chronologie', tpl_gitgraph: 'Graphe Git',
      tpl_journey: 'Parcours utilisateur', tpl_quadrant: 'Graphique quadrant',
      tpl_sankey: 'Diagramme Sankey', tpl_block: 'Diagramme de blocs',
      newConfirm: 'Le diagramme actuel sera effacé. Continuer ?',
      yes: 'Oui', no: 'Non', confirm: 'Confirmer',
      openFromServer: 'Ouvrir depuis le serveur', saveToServer: 'Enregistrer sur le serveur',
      mermaidFiles: 'Fichiers Mermaid', allFiles: 'Tous les fichiers'
    },
    es: {
      new: 'Nuevo', open: 'Abrir', save: 'Guardar', saveAs: 'Guardar como',
      templates: 'Plantillas', code: 'Código', preview: 'Vista previa',
      line: 'Línea', col: 'Col', chars: 'Caracteres', lines: 'Líneas',
      lastSaved: 'Último guardado', filename: 'Nombre de archivo', cancel: 'Cancelar',
      themeDefault: 'Predeterminado', themeDark: 'Oscuro', themeForest: 'Bosque', themeNeutral: 'Neutro',
      exportSuccess: 'Exportado', saveSuccess: 'Guardado', loadSuccess: 'Cargado',
      noFiles: 'No se encontraron archivos',
      tpl_flowchart: 'Diagrama de flujo', tpl_sequence: 'Diagrama de secuencia',
      tpl_class: 'Diagrama de clases', tpl_state: 'Diagrama de estados',
      tpl_er: 'Diagrama ER', tpl_gantt: 'Diagrama de Gantt',
      tpl_pie: 'Gráfico circular', tpl_mindmap: 'Mapa mental',
      tpl_timeline: 'Línea de tiempo', tpl_gitgraph: 'Gráfico Git',
      tpl_journey: 'Recorrido del usuario', tpl_quadrant: 'Gráfico de cuadrante',
      tpl_sankey: 'Diagrama Sankey', tpl_block: 'Diagrama de bloques',
      newConfirm: 'El diagrama actual será borrado. ¿Continuar?',
      yes: 'Sí', no: 'No', confirm: 'Confirmar',
      openFromServer: 'Abrir del servidor', saveToServer: 'Guardar en el servidor',
      mermaidFiles: 'Archivos Mermaid', allFiles: 'Todos los archivos'
    },
    ru: {
      new: 'Новый', open: 'Открыть', save: 'Сохранить', saveAs: 'Сохранить как',
      templates: 'Шаблоны', code: 'Код', preview: 'Предпросмотр',
      line: 'Строка', col: 'Столбец', chars: 'Символы', lines: 'Строки',
      lastSaved: 'Последнее сохранение', filename: 'Имя файла', cancel: 'Отмена',
      themeDefault: 'По умолчанию', themeDark: 'Тёмная', themeForest: 'Лес', themeNeutral: 'Нейтральная',
      exportSuccess: 'Экспортировано', saveSuccess: 'Сохранено', loadSuccess: 'Загружено',
      noFiles: 'Файлы не найдены',
      tpl_flowchart: 'Блок-схема', tpl_sequence: 'Диаграмма последовательности',
      tpl_class: 'Диаграмма классов', tpl_state: 'Диаграмма состояний',
      tpl_er: 'ER-диаграмма', tpl_gantt: 'Диаграмма Ганта',
      tpl_pie: 'Круговая диаграмма', tpl_mindmap: 'Ментальная карта',
      tpl_timeline: 'Временная шкала', tpl_gitgraph: 'Git-граф',
      tpl_journey: 'Путь пользователя', tpl_quadrant: 'Квадрантная диаграмма',
      tpl_sankey: 'Диаграмма Санки', tpl_block: 'Блок-диаграмма',
      newConfirm: 'Текущая диаграмма будет удалена. Продолжить?',
      yes: 'Да', no: 'Нет', confirm: 'Подтвердить',
      openFromServer: 'Открыть с сервера', saveToServer: 'Сохранить на сервер',
      mermaidFiles: 'Файлы Mermaid', allFiles: 'Все файлы'
    },
    zh: {
      new: '新建', open: '打开', save: '保存', saveAs: '另存为',
      templates: '模板', code: '代码', preview: '预览',
      line: '行', col: '列', chars: '字符', lines: '行数',
      lastSaved: '上次保存', filename: '文件名', cancel: '取消',
      themeDefault: '默认', themeDark: '深色', themeForest: '森林', themeNeutral: '中性',
      exportSuccess: '已导出', saveSuccess: '已保存', loadSuccess: '已加载',
      noFiles: '未找到文件',
      tpl_flowchart: '流程图', tpl_sequence: '时序图',
      tpl_class: '类图', tpl_state: '状态图',
      tpl_er: 'ER图', tpl_gantt: '甘特图',
      tpl_pie: '饼图', tpl_mindmap: '思维导图',
      tpl_timeline: '时间线', tpl_gitgraph: 'Git图',
      tpl_journey: '用户旅程', tpl_quadrant: '象限图',
      tpl_sankey: '桑基图', tpl_block: '块图',
      newConfirm: '当前图表将被清除。继续吗？',
      yes: '是', no: '否', confirm: '确认',
      openFromServer: '从服务器打开', saveToServer: '保存到服务器',
      mermaidFiles: 'Mermaid 文件', allFiles: '所有文件'
    },
    ja: {
      new: '新規', open: '開く', save: '保存', saveAs: '名前を付けて保存',
      templates: 'テンプレート', code: 'コード', preview: 'プレビュー',
      line: '行', col: '列', chars: '文字', lines: '行数',
      lastSaved: '最終保存', filename: 'ファイル名', cancel: 'キャンセル',
      themeDefault: 'デフォルト', themeDark: 'ダーク', themeForest: 'フォレスト', themeNeutral: 'ニュートラル',
      exportSuccess: 'エクスポート完了', saveSuccess: '保存完了', loadSuccess: '読み込み完了',
      noFiles: 'ファイルが見つかりません',
      tpl_flowchart: 'フローチャート', tpl_sequence: 'シーケンス図',
      tpl_class: 'クラス図', tpl_state: '状態図',
      tpl_er: 'ER図', tpl_gantt: 'ガントチャート',
      tpl_pie: '円グラフ', tpl_mindmap: 'マインドマップ',
      tpl_timeline: 'タイムライン', tpl_gitgraph: 'Gitグラフ',
      tpl_journey: 'ユーザージャーニー', tpl_quadrant: '象限チャート',
      tpl_sankey: 'サンキー図', tpl_block: 'ブロック図',
      newConfirm: '現在の図がクリアされます。続行しますか？',
      yes: 'はい', no: 'いいえ', confirm: '確認',
      openFromServer: 'サーバーから開く', saveToServer: 'サーバーに保存',
      mermaidFiles: 'Mermaid ファイル', allFiles: 'すべてのファイル'
    },
    it: {
      new: 'Nuovo', open: 'Apri', save: 'Salva', saveAs: 'Salva con nome',
      templates: 'Modelli', code: 'Codice', preview: 'Anteprima',
      line: 'Riga', col: 'Col', chars: 'Caratteri', lines: 'Righe',
      lastSaved: 'Ultimo salvataggio', filename: 'Nome file', cancel: 'Annulla',
      themeDefault: 'Predefinito', themeDark: 'Scuro', themeForest: 'Foresta', themeNeutral: 'Neutro',
      exportSuccess: 'Esportato', saveSuccess: 'Salvato', loadSuccess: 'Caricato',
      noFiles: 'Nessun file trovato',
      tpl_flowchart: 'Diagramma di flusso', tpl_sequence: 'Diagramma di sequenza',
      tpl_class: 'Diagramma delle classi', tpl_state: 'Diagramma di stato',
      tpl_er: 'Diagramma ER', tpl_gantt: 'Diagramma di Gantt',
      tpl_pie: 'Grafico a torta', tpl_mindmap: 'Mappa mentale',
      tpl_timeline: 'Linea temporale', tpl_gitgraph: 'Grafico Git',
      tpl_journey: 'Percorso utente', tpl_quadrant: 'Grafico a quadranti',
      tpl_sankey: 'Diagramma Sankey', tpl_block: 'Diagramma a blocchi',
      newConfirm: 'Il diagramma attuale verrà cancellato. Continuare?',
      yes: 'Sì', no: 'No', confirm: 'Conferma',
      openFromServer: 'Apri dal server', saveToServer: 'Salva sul server',
      mermaidFiles: 'File Mermaid', allFiles: 'Tutti i file'
    },
    ar: {
      new: 'جديد', open: 'فتح', save: 'حفظ', saveAs: 'حفظ باسم',
      templates: 'قوالب', code: 'الكود', preview: 'معاينة',
      line: 'سطر', col: 'عمود', chars: 'أحرف', lines: 'أسطر',
      lastSaved: 'آخر حفظ', filename: 'اسم الملف', cancel: 'إلغاء',
      themeDefault: 'افتراضي', themeDark: 'داكن', themeForest: 'غابة', themeNeutral: 'محايد',
      exportSuccess: 'تم التصدير', saveSuccess: 'تم الحفظ', loadSuccess: 'تم التحميل',
      noFiles: 'لم يتم العثور على ملفات',
      tpl_flowchart: 'مخطط انسيابي', tpl_sequence: 'مخطط تسلسلي',
      tpl_class: 'مخطط الفئات', tpl_state: 'مخطط الحالة',
      tpl_er: 'مخطط ER', tpl_gantt: 'مخطط جانت',
      tpl_pie: 'مخطط دائري', tpl_mindmap: 'خريطة ذهنية',
      tpl_timeline: 'خط زمني', tpl_gitgraph: 'رسم Git',
      tpl_journey: 'رحلة المستخدم', tpl_quadrant: 'مخطط رباعي',
      tpl_sankey: 'مخطط سانكي', tpl_block: 'مخطط كتلي',
      newConfirm: 'سيتم مسح الرسم البياني الحالي. هل تريد المتابعة؟',
      yes: 'نعم', no: 'لا', confirm: 'تأكيد',
      openFromServer: 'فتح من الخادم', saveToServer: 'حفظ على الخادم',
      mermaidFiles: 'ملفات Mermaid', allFiles: 'جميع الملفات'
    },
    ko: {
      new: '새로 만들기', open: '열기', save: '저장', saveAs: '다른 이름으로 저장',
      templates: '템플릿', code: '코드', preview: '미리보기',
      line: '줄', col: '열', chars: '문자', lines: '줄 수',
      lastSaved: '마지막 저장', filename: '파일 이름', cancel: '취소',
      themeDefault: '기본', themeDark: '다크', themeForest: '포레스트', themeNeutral: '뉴트럴',
      exportSuccess: '내보내기 완료', saveSuccess: '저장 완료', loadSuccess: '로드 완료',
      noFiles: '파일을 찾을 수 없습니다',
      tpl_flowchart: '플로차트', tpl_sequence: '시퀀스 다이어그램',
      tpl_class: '클래스 다이어그램', tpl_state: '상태 다이어그램',
      tpl_er: 'ER 다이어그램', tpl_gantt: '간트 차트',
      tpl_pie: '파이 차트', tpl_mindmap: '마인드맵',
      tpl_timeline: '타임라인', tpl_gitgraph: 'Git 그래프',
      tpl_journey: '사용자 여정', tpl_quadrant: '사분면 차트',
      tpl_sankey: '생키 다이어그램', tpl_block: '블록 다이어그램',
      newConfirm: '현재 다이어그램이 삭제됩니다. 계속하시겠습니까?',
      yes: '예', no: '아니오', confirm: '확인',
      openFromServer: '서버에서 열기', saveToServer: '서버에 저장',
      mermaidFiles: 'Mermaid 파일', allFiles: '모든 파일'
    },
    hi: {
      new: 'नया', open: 'खोलें', save: 'सहेजें', saveAs: 'इस रूप में सहेजें',
      templates: 'टेम्पलेट', code: 'कोड', preview: 'पूर्वावलोकन',
      line: 'पंक्ति', col: 'स्तंभ', chars: 'अक्षर', lines: 'पंक्तियाँ',
      lastSaved: 'अंतिम सहेजा', filename: 'फ़ाइल नाम', cancel: 'रद्द करें',
      themeDefault: 'डिफ़ॉल्ट', themeDark: 'डार्क', themeForest: 'फ़ॉरेस्ट', themeNeutral: 'न्यूट्रल',
      exportSuccess: 'निर्यात किया गया', saveSuccess: 'सहेजा गया', loadSuccess: 'लोड किया गया',
      noFiles: 'कोई फ़ाइल नहीं मिली',
      tpl_flowchart: 'फ़्लोचार्ट', tpl_sequence: 'सीक्वेंस आरेख',
      tpl_class: 'क्लास आरेख', tpl_state: 'स्टेट आरेख',
      tpl_er: 'ER आरेख', tpl_gantt: 'गैंट चार्ट',
      tpl_pie: 'पाई चार्ट', tpl_mindmap: 'माइंड मैप',
      tpl_timeline: 'टाइमलाइन', tpl_gitgraph: 'Git ग्राफ़',
      tpl_journey: 'उपयोगकर्ता यात्रा', tpl_quadrant: 'चतुर्थांश चार्ट',
      tpl_sankey: 'सैंकी आरेख', tpl_block: 'ब्लॉक आरेख',
      newConfirm: 'वर्तमान आरेख साफ़ हो जाएगा। जारी रखें?',
      yes: 'हाँ', no: 'नहीं', confirm: 'पुष्टि करें',
      openFromServer: 'सर्वर से खोलें', saveToServer: 'सर्वर पर सहेजें',
      mermaidFiles: 'Mermaid फ़ाइलें', allFiles: 'सभी फ़ाइलें'
    },
    pt: {
      new: 'Novo', open: 'Abrir', save: 'Salvar', saveAs: 'Salvar como',
      templates: 'Modelos', code: 'Código', preview: 'Pré-visualização',
      line: 'Linha', col: 'Col', chars: 'Caracteres', lines: 'Linhas',
      lastSaved: 'Último salvo', filename: 'Nome do arquivo', cancel: 'Cancelar',
      themeDefault: 'Padrão', themeDark: 'Escuro', themeForest: 'Floresta', themeNeutral: 'Neutro',
      exportSuccess: 'Exportado', saveSuccess: 'Salvo', loadSuccess: 'Carregado',
      noFiles: 'Nenhum arquivo encontrado',
      tpl_flowchart: 'Fluxograma', tpl_sequence: 'Diagrama de sequência',
      tpl_class: 'Diagrama de classes', tpl_state: 'Diagrama de estados',
      tpl_er: 'Diagrama ER', tpl_gantt: 'Gráfico de Gantt',
      tpl_pie: 'Gráfico de pizza', tpl_mindmap: 'Mapa mental',
      tpl_timeline: 'Linha do tempo', tpl_gitgraph: 'Gráfico Git',
      tpl_journey: 'Jornada do usuário', tpl_quadrant: 'Gráfico de quadrante',
      tpl_sankey: 'Diagrama Sankey', tpl_block: 'Diagrama de blocos',
      newConfirm: 'O diagrama atual será apagado. Continuar?',
      yes: 'Sim', no: 'Não', confirm: 'Confirmar',
      openFromServer: 'Abrir do servidor', saveToServer: 'Salvar no servidor',
      mermaidFiles: 'Arquivos Mermaid', allFiles: 'Todos os arquivos'
    }
  };

  function getLocale() {
    try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; }
  }

  const TEMPLATES = {
    flowchart: 'flowchart TD\n    A[Başlangıç] --> B{Karar}\n    B -->|Evet| C[İşlem 1]\n    B -->|Hayır| D[İşlem 2]\n    C --> E[Son]\n    D --> E',
    sequence: 'sequenceDiagram\n    participant A as Kullanıcı\n    participant B as Sunucu\n    participant C as Veritabanı\n    A->>B: İstek gönder\n    B->>C: Sorgu çalıştır\n    C-->>B: Sonuç döndür\n    B-->>A: Yanıt gönder',
    class: 'classDiagram\n    class Animal {\n        +String name\n        +int age\n        +makeSound()\n    }\n    class Dog {\n        +String breed\n        +bark()\n    }\n    class Cat {\n        +String color\n        +meow()\n    }\n    Animal <|-- Dog\n    Animal <|-- Cat',
    state: 'stateDiagram-v2\n    [*] --> Beklemede\n    Beklemede --> Aktif : başlat\n    Aktif --> Duraklatıldı : duraklat\n    Duraklatıldı --> Aktif : devam\n    Aktif --> Tamamlandı : bitir\n    Tamamlandı --> [*]',
    er: 'erDiagram\n    CUSTOMER ||--o{ ORDER : places\n    ORDER ||--|{ LINE_ITEM : contains\n    PRODUCT ||--o{ LINE_ITEM : "is in"\n    CUSTOMER {\n        int id PK\n        string name\n        string email\n    }\n    ORDER {\n        int id PK\n        date created\n        string status\n    }',
    gantt: 'gantt\n    title Proje Planı\n    dateFormat YYYY-MM-DD\n    section Tasarım\n        Araştırma       :a1, 2024-01-01, 7d\n        Wireframe       :a2, after a1, 5d\n    section Geliştirme\n        Frontend        :b1, after a2, 14d\n        Backend         :b2, after a2, 14d\n    section Test\n        QA Testi        :c1, after b1, 7d',
    pie: 'pie title Dil Dağılımı\n    "JavaScript" : 40\n    "Python" : 25\n    "TypeScript" : 20\n    "Go" : 10\n    "Diğer" : 5',
    mindmap: 'mindmap\n  root((Proje))\n    Tasarım\n      UI\n      UX\n      Wireframe\n    Geliştirme\n      Frontend\n      Backend\n      API\n    Test\n      Birim Test\n      Entegrasyon\n    Dağıtım\n      CI/CD\n      Staging\n      Production',
    timeline: 'timeline\n    title Teknoloji Tarihçesi\n    1990 : WWW\n         : HTML\n    1995 : JavaScript\n         : Java\n    2000 : CSS3\n    2010 : Node.js\n         : Angular\n    2015 : React\n         : Vue.js\n    2020 : Deno\n         : Svelte',
    gitgraph: 'gitGraph\n    commit\n    commit\n    branch develop\n    checkout develop\n    commit\n    commit\n    checkout main\n    merge develop\n    commit\n    branch feature\n    checkout feature\n    commit\n    checkout develop\n    merge feature\n    checkout main\n    merge develop',
    journey: 'journey\n    title Kullanıcı Alışveriş Deneyimi\n    section Keşif\n      Siteyi ziyaret et: 5: Kullanıcı\n      Ürünlere göz at: 4: Kullanıcı\n    section Satın Alma\n      Sepete ekle: 3: Kullanıcı\n      Ödeme yap: 2: Kullanıcı\n    section Teslimat\n      Kargo takibi: 4: Kullanıcı\n      Ürünü al: 5: Kullanıcı',
    quadrant: 'quadrantChart\n    title Öncelik Matrisi\n    x-axis Düşük Etki --> Yüksek Etki\n    y-axis Düşük Çaba --> Yüksek Çaba\n    quadrant-1 Planla\n    quadrant-2 Hemen Yap\n    quadrant-3 Ertele\n    quadrant-4 Devret\n    Görev A: [0.8, 0.2]\n    Görev B: [0.3, 0.7]\n    Görev C: [0.7, 0.8]\n    Görev D: [0.2, 0.3]',
    sankey: 'sankey-beta\n\nTraffic,Search,400\nTraffic,Social,200\nTraffic,Direct,300\nSearch,Homepage,250\nSearch,Product,150\nSocial,Homepage,100\nSocial,Product,100\nDirect,Homepage,200\nDirect,Product,100',
    block: 'block-beta\n    columns 3\n    Frontend blockArrowId6<["&nbsp;&nbsp;&nbsp;"]>(right) Backend\n    space:3\n    DB[("Database")]\n    space\n    Cache[("Cache")]'
  };

  const MERMAID_CDN = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      const code = ref(TEMPLATES.flowchart);
      const theme = ref('default');
      const layout = ref('split');
      const zoom = ref(1);
      const zoomPercent = computed(() => Math.round(zoom.value * 100));
      const errorMsg = ref('');
      const fileName = ref('');
      const lastSaved = ref('');
      const cursorLine = ref(1);
      const cursorCol = ref(1);
      const lineCount = computed(() => code.value.split('\n').length);
      const currentTemplate = ref('');

      const editorEl = ref(null);
      const previewEl = ref(null);
      const previewWrap = ref(null);
      const lineNumbersEl = ref(null);

      let renderTimeout = null;
      let mermaidReady = false;
      let mermaidModule = null;
      let resizing = false;
      let editorWidth = 50;

      const templates = [
        { key: 'flowchart' }, { key: 'sequence' }, { key: 'class' },
        { key: 'state' }, { key: 'er' }, { key: 'gantt' },
        { key: 'pie' }, { key: 'mindmap' }, { key: 'timeline' },
        { key: 'gitgraph' }, { key: 'journey' }, { key: 'quadrant' },
        { key: 'sankey' }, { key: 'block' }
      ];

      async function loadMermaid() {
        if (mermaidReady) return;
        try {
          mermaidModule = await import(MERMAID_CDN);
          const mermaid = mermaidModule.default;
          mermaid.initialize({
            startOnLoad: false,
            theme: theme.value,
            securityLevel: 'strict',
            fontFamily: 'Segoe UI, Arial, sans-serif'
          });
          mermaidReady = true;
          renderDiagram();
        } catch (e) {
          errorMsg.value = 'Mermaid yüklenemedi: ' + e.message;
        }
      }

      let renderCounter = 0;
      async function renderDiagram() {
        if (!mermaidReady || !previewEl.value) return;
        const mermaid = mermaidModule.default;
        const text = code.value.trim();
        if (!text) {
          previewEl.value.innerHTML = '';
          errorMsg.value = '';
          return;
        }
        try {
          mermaid.initialize({
            startOnLoad: false,
            theme: theme.value,
            securityLevel: 'strict',
            fontFamily: 'Segoe UI, Arial, sans-serif'
          });
          renderCounter++;
          const id = 'mmed-svg-' + renderCounter;
          const { svg } = await mermaid.render(id, text);
          previewEl.value.innerHTML = svg;
          errorMsg.value = '';
        } catch (e) {
          errorMsg.value = e.message || String(e);
          // remove any broken render elements from mermaid
          const broken = document.getElementById('dmmed-svg-' + renderCounter);
          if (broken) broken.remove();
        }
      }

      function onCodeInput() {
        errorMsg.value = '';
        clearTimeout(renderTimeout);
        renderTimeout = setTimeout(renderDiagram, 400);
        syncLineNumberScroll();
      }

      function updateCursor() {
        if (!editorEl.value) return;
        const ta = editorEl.value;
        const val = ta.value.substring(0, ta.selectionStart);
        const lines = val.split('\n');
        cursorLine.value = lines.length;
        cursorCol.value = lines[lines.length - 1].length + 1;
      }

      function onKeyDown(e) {
        if (e.key === 'Tab') {
          e.preventDefault();
          const ta = editorEl.value;
          const start = ta.selectionStart;
          const end = ta.selectionEnd;
          code.value = code.value.substring(0, start) + '    ' + code.value.substring(end);
          nextTick(() => {
            ta.selectionStart = ta.selectionEnd = start + 4;
            updateCursor();
          });
          onCodeInput();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          saveFile();
        }
      }

      function syncLineNumberScroll() {
        if (editorEl.value && lineNumbersEl.value) {
          lineNumbersEl.value.scrollTop = editorEl.value.scrollTop;
        }
      }

      function applyTemplate(key) {
        if (TEMPLATES[key]) {
          code.value = TEMPLATES[key];
          onCodeInput();
        }
        nextTick(() => { currentTemplate.value = ''; });
      }

      async function newDiagram() {
        if (code.value.trim()) {
          try {
            await ElMessageBox.confirm(L('newConfirm'), L('confirm'), {
              confirmButtonText: L('yes'),
              cancelButtonText: L('no'),
              type: 'warning'
            });
          } catch { return; }
        }
        code.value = TEMPLATES.flowchart;
        fileName.value = '';
        lastSaved.value = '';
        onCodeInput();
      }

      async function openFile() {
        if (!window.FileDialog) return;
        const result = await window.FileDialog.open({
          title: '📂 ' + L('openFromServer'),
          filters: [
            { label: L('mermaidFiles'), extensions: ['.mmd', '.mermaid'] },
            { label: L('allFiles'), extensions: ['*'] }
          ],
          initialPath: '/downloads'
        });
        if (result && result.content) {
          code.value = result.content;
          fileName.value = result.name || '';
          onCodeInput();
          ElMessage.success(L('loadSuccess'));
        }
      }

      async function saveFile() {
        if (!window.FileDialog) return;
        const defaultName = fileName.value || 'diagram.mmd';
        const result = await window.FileDialog.save({
          title: '💾 ' + L('saveToServer'),
          defaultName: defaultName,
          filters: [
            { label: L('mermaidFiles'), extensions: ['.mmd', '.mermaid'] },
            { label: L('allFiles'), extensions: ['*'] }
          ],
          initialPath: '/downloads'
        });
        if (!result) return;
        const token = localStorage.getItem('auth_token') || '';
        try {
          await fetch('/api/fs/write', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath: result.path, content: code.value })
          });
          fileName.value = result.name;
          lastSaved.value = new Date().toLocaleTimeString();
          ElMessage.success(L('saveSuccess'));
        } catch (e) { /* ignore */ }
      }

      function getSvgContent() {
        if (!previewEl.value) return null;
        const svg = previewEl.value.querySelector('svg');
        if (!svg) return null;
        const clone = svg.cloneNode(true);
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        if (!clone.getAttribute('width')) {
          const bb = svg.getBBox ? svg.getBBox() : null;
          if (bb) {
            clone.setAttribute('width', bb.width + 40);
            clone.setAttribute('height', bb.height + 40);
          }
        }
        return new XMLSerializer().serializeToString(clone);
      }

      function exportSvg() {
        const svgStr = getSvgContent();
        if (!svgStr) return;
        const blob = new Blob([svgStr], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (fileName.value || 'diagram').replace(/\.\w+$/, '') + '.svg';
        a.click();
        URL.revokeObjectURL(url);
      }

      function exportPng() {
        const svgStr = getSvgContent();
        if (!svgStr) return;
        const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();
        img.onload = function () {
          const canvas = document.createElement('canvas');
          const scale = 2;
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(function (blob) {
            const pngUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = (fileName.value || 'diagram').replace(/\.\w+$/, '') + '.png';
            a.click();
            URL.revokeObjectURL(pngUrl);
          }, 'image/png');
          URL.revokeObjectURL(url);
        };
        img.src = url;
      }

      /* Zoom */
      function zoomIn() { zoom.value = Math.min(3, zoom.value + 0.1); }
      function zoomOut() { zoom.value = Math.max(0.2, zoom.value - 0.1); }
      function zoomReset() { zoom.value = 1; }
      function onWheel(e) { e.deltaY < 0 ? zoomIn() : zoomOut(); }

      /* Resizer */
      function startResize(e) {
        resizing = true;
        const startX = e.clientX;
        const mainEl = e.target.parentElement;
        const startWidth = editorWidth;
        function onMove(ev) {
          if (!resizing) return;
          const dx = ev.clientX - startX;
          const pct = startWidth + (dx / mainEl.offsetWidth) * 100;
          editorWidth = Math.max(20, Math.min(80, pct));
          const editorPanel = mainEl.querySelector('.mmed-editor-panel');
          if (editorPanel) editorPanel.style.width = editorWidth + '%';
        }
        function onUp() {
          resizing = false;
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
        }
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      }

      /* Locale change listener */
      function onLocaleChanged() { locale.value = getLocale(); }

      onMounted(() => {
        window.addEventListener('locale-changed', onLocaleChanged);
        loadMermaid();
        if (editorEl.value) {
          editorEl.value.addEventListener('scroll', syncLineNumberScroll);
        }
      });

      onUnmounted(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
        clearTimeout(renderTimeout);
        if (editorEl.value) {
          editorEl.value.removeEventListener('scroll', syncLineNumberScroll);
        }
      });

      return {
        locale, L, code, theme, layout, zoom, zoomPercent,
        errorMsg, fileName, lastSaved, cursorLine, cursorCol,
        lineCount, currentTemplate,
        templates, editorEl, previewEl, previewWrap, lineNumbersEl,
        onCodeInput, updateCursor, onKeyDown, applyTemplate,
        newDiagram, openFile, saveFile,
        exportSvg, exportPng, renderDiagram,
        zoomIn, zoomOut, zoomReset, onWheel, startResize
      };
    }
  };
})(Vue);
