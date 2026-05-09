({
  setup() {
    const { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } = Vue;
    const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success(){}, error(){}, warning(){}, info(){} };
    const ElMessageBox = (window.ElementPlus && window.ElementPlus.ElMessageBox) || { confirm: () => Promise.resolve(), prompt: () => Promise.resolve({ value: '' }) };

    // ── i18n ──
    const LANGS = {
      tr: {
        title:'CV Oluşturucu', newResume:'Yeni CV', myResumes:'CV\'lerim', save:'Kaydet', delete:'Sil',
        duplicate:'Kopyala', exportPdf:'PDF Olarak İndir', preview:'Önizleme', edit:'Düzenle',
        personalInfo:'Kişisel Bilgiler', fullName:'Ad Soyad', jobTitle:'Meslek / Ünvan',
        email:'E-posta', phone:'Telefon', address:'Adres', website:'Web Sitesi',
        summary:'Özet', summaryPlaceholder:'Kendinizi kısaca tanıtın...',
        experience:'İş Deneyimi', education:'Eğitim', skills:'Yetenekler', languages:'Diller',
        certifications:'Sertifikalar', projects:'Projeler',
        addExperience:'Deneyim Ekle', addEducation:'Eğitim Ekle', addSkill:'Yetenek Ekle',
        addLanguage:'Dil Ekle', addCertification:'Sertifika Ekle', addProject:'Proje Ekle',
        company:'Şirket', position:'Pozisyon', startDate:'Başlangıç', endDate:'Bitiş',
        present:'Devam Ediyor', description:'Açıklama', school:'Okul', degree:'Derece/Bölüm',
        skillName:'Yetenek adı', level:'Seviye', language:'Dil', proficiency:'Yeterlilik',
        certName:'Sertifika adı', issuer:'Kurum', date:'Tarih',
        projectName:'Proje adı', projectUrl:'Proje URL',
        beginner:'Başlangıç', intermediate:'Orta', advanced:'İleri', expert:'Uzman', native:'Ana Dil',
        deleteConfirm:'Bu CV\'yi silmek istediğinize emin misiniz?', confirm:'Onayla', cancel:'İptal',
        noResumes:'Henüz CV yok. Yeni bir CV oluşturun.', untitled:'İsimsiz CV',
        template:'Şablon', classic:'Klasik', modern:'Modern', minimal:'Minimal', professional:'Profesyonel',
        photo:'Fotoğraf', uploadPhoto:'Fotoğraf Yükle', removePhoto:'Fotoğrafı Kaldır',
        references:'Referanslar', addReference:'Referans Ekle', refName:'İsim', refPosition:'Pozisyon',
        refCompany:'Şirket', refPhone:'Telefon', refEmail:'E-posta',
        color:'Renk', accentColor:'Vurgu Rengi', fontSize:'Yazı Boyutu',
        downloading:'PDF hazırlanıyor...', downloadReady:'PDF hazır!',
        resumeName:'CV Adı', rename:'Yeniden Adlandır'
      },
      en: {
        title:'Resume Builder', newResume:'New Resume', myResumes:'My Resumes', save:'Save', delete:'Delete',
        duplicate:'Duplicate', exportPdf:'Export PDF', preview:'Preview', edit:'Edit',
        personalInfo:'Personal Information', fullName:'Full Name', jobTitle:'Job Title',
        email:'Email', phone:'Phone', address:'Address', website:'Website',
        summary:'Summary', summaryPlaceholder:'Write a brief summary about yourself...',
        experience:'Work Experience', education:'Education', skills:'Skills', languages:'Languages',
        certifications:'Certifications', projects:'Projects',
        addExperience:'Add Experience', addEducation:'Add Education', addSkill:'Add Skill',
        addLanguage:'Add Language', addCertification:'Add Certification', addProject:'Add Project',
        company:'Company', position:'Position', startDate:'Start Date', endDate:'End Date',
        present:'Present', description:'Description', school:'School', degree:'Degree / Field',
        skillName:'Skill name', level:'Level', language:'Language', proficiency:'Proficiency',
        certName:'Certification name', issuer:'Issuer', date:'Date',
        projectName:'Project name', projectUrl:'Project URL',
        beginner:'Beginner', intermediate:'Intermediate', advanced:'Advanced', expert:'Expert', native:'Native',
        deleteConfirm:'Are you sure you want to delete this resume?', confirm:'Confirm', cancel:'Cancel',
        noResumes:'No resumes yet. Create a new one.', untitled:'Untitled Resume',
        template:'Template', classic:'Classic', modern:'Modern', minimal:'Minimal', professional:'Professional',
        photo:'Photo', uploadPhoto:'Upload Photo', removePhoto:'Remove Photo',
        references:'References', addReference:'Add Reference', refName:'Name', refPosition:'Position',
        refCompany:'Company', refPhone:'Phone', refEmail:'Email',
        color:'Color', accentColor:'Accent Color', fontSize:'Font Size',
        downloading:'Preparing PDF...', downloadReady:'PDF ready!',
        resumeName:'Resume Name', rename:'Rename'
      },
      de: {
        title:'Lebenslauf-Editor', newResume:'Neuer Lebenslauf', myResumes:'Meine Lebensläufe', save:'Speichern', delete:'Löschen',
        duplicate:'Duplizieren', exportPdf:'PDF exportieren', preview:'Vorschau', edit:'Bearbeiten',
        personalInfo:'Persönliche Daten', fullName:'Vollständiger Name', jobTitle:'Berufsbezeichnung',
        email:'E-Mail', phone:'Telefon', address:'Adresse', website:'Webseite',
        summary:'Zusammenfassung', summaryPlaceholder:'Beschreiben Sie sich kurz...',
        experience:'Berufserfahrung', education:'Ausbildung', skills:'Fähigkeiten', languages:'Sprachen',
        certifications:'Zertifikate', projects:'Projekte',
        addExperience:'Erfahrung hinzufügen', addEducation:'Ausbildung hinzufügen', addSkill:'Fähigkeit hinzufügen',
        addLanguage:'Sprache hinzufügen', addCertification:'Zertifikat hinzufügen', addProject:'Projekt hinzufügen',
        company:'Unternehmen', position:'Position', startDate:'Startdatum', endDate:'Enddatum',
        present:'Aktuell', description:'Beschreibung', school:'Schule', degree:'Abschluss/Fach',
        skillName:'Fähigkeit', level:'Stufe', language:'Sprache', proficiency:'Kenntnisstand',
        certName:'Zertifikatsname', issuer:'Aussteller', date:'Datum',
        projectName:'Projektname', projectUrl:'Projekt-URL',
        beginner:'Anfänger', intermediate:'Mittel', advanced:'Fortgeschritten', expert:'Experte', native:'Muttersprache',
        deleteConfirm:'Möchten Sie diesen Lebenslauf wirklich löschen?', confirm:'Bestätigen', cancel:'Abbrechen',
        noResumes:'Noch keine Lebensläufe. Erstellen Sie einen neuen.', untitled:'Unbenannter Lebenslauf',
        template:'Vorlage', classic:'Klassisch', modern:'Modern', minimal:'Minimal', professional:'Professionell',
        photo:'Foto', uploadPhoto:'Foto hochladen', removePhoto:'Foto entfernen',
        references:'Referenzen', addReference:'Referenz hinzufügen', refName:'Name', refPosition:'Position',
        refCompany:'Unternehmen', refPhone:'Telefon', refEmail:'E-Mail',
        color:'Farbe', accentColor:'Akzentfarbe', fontSize:'Schriftgröße',
        downloading:'PDF wird vorbereitet...', downloadReady:'PDF fertig!',
        resumeName:'Lebenslaufname', rename:'Umbenennen'
      },
      fr: {
        title:'Créateur de CV', newResume:'Nouveau CV', myResumes:'Mes CV', save:'Enregistrer', delete:'Supprimer',
        duplicate:'Dupliquer', exportPdf:'Exporter PDF', preview:'Aperçu', edit:'Modifier',
        personalInfo:'Informations personnelles', fullName:'Nom complet', jobTitle:'Poste',
        email:'E-mail', phone:'Téléphone', address:'Adresse', website:'Site web',
        summary:'Résumé', summaryPlaceholder:'Décrivez-vous brièvement...',
        experience:'Expérience professionnelle', education:'Formation', skills:'Compétences', languages:'Langues',
        certifications:'Certifications', projects:'Projets',
        addExperience:'Ajouter une expérience', addEducation:'Ajouter une formation', addSkill:'Ajouter une compétence',
        addLanguage:'Ajouter une langue', addCertification:'Ajouter une certification', addProject:'Ajouter un projet',
        company:'Entreprise', position:'Poste', startDate:'Date de début', endDate:'Date de fin',
        present:'Présent', description:'Description', school:'École', degree:'Diplôme/Domaine',
        skillName:'Compétence', level:'Niveau', language:'Langue', proficiency:'Maîtrise',
        certName:'Nom de la certification', issuer:'Émetteur', date:'Date',
        projectName:'Nom du projet', projectUrl:'URL du projet',
        beginner:'Débutant', intermediate:'Intermédiaire', advanced:'Avancé', expert:'Expert', native:'Langue maternelle',
        deleteConfirm:'Voulez-vous vraiment supprimer ce CV ?', confirm:'Confirmer', cancel:'Annuler',
        noResumes:'Aucun CV. Créez-en un nouveau.', untitled:'CV sans titre',
        template:'Modèle', classic:'Classique', modern:'Moderne', minimal:'Minimal', professional:'Professionnel',
        photo:'Photo', uploadPhoto:'Télécharger une photo', removePhoto:'Supprimer la photo',
        references:'Références', addReference:'Ajouter une référence', refName:'Nom', refPosition:'Poste',
        refCompany:'Entreprise', refPhone:'Téléphone', refEmail:'E-mail',
        color:'Couleur', accentColor:'Couleur d\'accent', fontSize:'Taille de police',
        downloading:'Préparation du PDF...', downloadReady:'PDF prêt !',
        resumeName:'Nom du CV', rename:'Renommer'
      },
      es: {
        title:'Constructor de CV', newResume:'Nuevo CV', myResumes:'Mis CVs', save:'Guardar', delete:'Eliminar',
        duplicate:'Duplicar', exportPdf:'Exportar PDF', preview:'Vista previa', edit:'Editar',
        personalInfo:'Información personal', fullName:'Nombre completo', jobTitle:'Puesto',
        email:'Correo', phone:'Teléfono', address:'Dirección', website:'Sitio web',
        summary:'Resumen', summaryPlaceholder:'Escribe un breve resumen sobre ti...',
        experience:'Experiencia laboral', education:'Educación', skills:'Habilidades', languages:'Idiomas',
        certifications:'Certificaciones', projects:'Proyectos',
        addExperience:'Agregar experiencia', addEducation:'Agregar educación', addSkill:'Agregar habilidad',
        addLanguage:'Agregar idioma', addCertification:'Agregar certificación', addProject:'Agregar proyecto',
        company:'Empresa', position:'Puesto', startDate:'Fecha de inicio', endDate:'Fecha de fin',
        present:'Presente', description:'Descripción', school:'Escuela', degree:'Grado/Campo',
        skillName:'Habilidad', level:'Nivel', language:'Idioma', proficiency:'Competencia',
        certName:'Nombre del certificado', issuer:'Emisor', date:'Fecha',
        projectName:'Nombre del proyecto', projectUrl:'URL del proyecto',
        beginner:'Principiante', intermediate:'Intermedio', advanced:'Avanzado', expert:'Experto', native:'Nativo',
        deleteConfirm:'¿Está seguro de que desea eliminar este CV?', confirm:'Confirmar', cancel:'Cancelar',
        noResumes:'No hay CVs. Cree uno nuevo.', untitled:'CV sin título',
        template:'Plantilla', classic:'Clásico', modern:'Moderno', minimal:'Mínimal', professional:'Profesional',
        photo:'Foto', uploadPhoto:'Subir foto', removePhoto:'Eliminar foto',
        references:'Referencias', addReference:'Agregar referencia', refName:'Nombre', refPosition:'Puesto',
        refCompany:'Empresa', refPhone:'Teléfono', refEmail:'Correo',
        color:'Color', accentColor:'Color de acento', fontSize:'Tamaño de fuente',
        downloading:'Preparando PDF...', downloadReady:'¡PDF listo!',
        resumeName:'Nombre del CV', rename:'Renombrar'
      },
      ru: {
        title:'Конструктор резюме', newResume:'Новое резюме', myResumes:'Мои резюме', save:'Сохранить', delete:'Удалить',
        duplicate:'Дублировать', exportPdf:'Экспорт PDF', preview:'Предпросмотр', edit:'Редактировать',
        personalInfo:'Личная информация', fullName:'Полное имя', jobTitle:'Должность',
        email:'Эл. почта', phone:'Телефон', address:'Адрес', website:'Веб-сайт',
        summary:'Краткое описание', summaryPlaceholder:'Кратко опишите себя...',
        experience:'Опыт работы', education:'Образование', skills:'Навыки', languages:'Языки',
        certifications:'Сертификаты', projects:'Проекты',
        addExperience:'Добавить опыт', addEducation:'Добавить образование', addSkill:'Добавить навык',
        addLanguage:'Добавить язык', addCertification:'Добавить сертификат', addProject:'Добавить проект',
        company:'Компания', position:'Должность', startDate:'Начало', endDate:'Окончание',
        present:'По настоящее время', description:'Описание', school:'Учебное заведение', degree:'Степень/Специальность',
        skillName:'Навык', level:'Уровень', language:'Язык', proficiency:'Уровень владения',
        certName:'Название сертификата', issuer:'Организация', date:'Дата',
        projectName:'Название проекта', projectUrl:'URL проекта',
        beginner:'Начальный', intermediate:'Средний', advanced:'Продвинутый', expert:'Эксперт', native:'Родной',
        deleteConfirm:'Вы уверены, что хотите удалить это резюме?', confirm:'Подтвердить', cancel:'Отмена',
        noResumes:'Нет резюме. Создайте новое.', untitled:'Без названия',
        template:'Шаблон', classic:'Классический', modern:'Современный', minimal:'Минимальный', professional:'Профессиональный',
        photo:'Фото', uploadPhoto:'Загрузить фото', removePhoto:'Удалить фото',
        references:'Рекомендации', addReference:'Добавить рекомендацию', refName:'Имя', refPosition:'Должность',
        refCompany:'Компания', refPhone:'Телефон', refEmail:'Эл. почта',
        color:'Цвет', accentColor:'Цвет акцента', fontSize:'Размер шрифта',
        downloading:'Подготовка PDF...', downloadReady:'PDF готов!',
        resumeName:'Название резюме', rename:'Переименовать'
      },
      zh: {
        title:'简历生成器', newResume:'新建简历', myResumes:'我的简历', save:'保存', delete:'删除',
        duplicate:'复制', exportPdf:'导出PDF', preview:'预览', edit:'编辑',
        personalInfo:'个人信息', fullName:'姓名', jobTitle:'职位',
        email:'邮箱', phone:'电话', address:'地址', website:'网站',
        summary:'个人简介', summaryPlaceholder:'简要介绍自己...',
        experience:'工作经历', education:'教育背景', skills:'技能', languages:'语言',
        certifications:'证书', projects:'项目',
        addExperience:'添加工作经历', addEducation:'添加教育背景', addSkill:'添加技能',
        addLanguage:'添加语言', addCertification:'添加证书', addProject:'添加项目',
        company:'公司', position:'职位', startDate:'开始日期', endDate:'结束日期',
        present:'至今', description:'描述', school:'学校', degree:'学位/专业',
        skillName:'技能名称', level:'等级', language:'语言', proficiency:'熟练度',
        certName:'证书名称', issuer:'颁发机构', date:'日期',
        projectName:'项目名称', projectUrl:'项目网址',
        beginner:'初级', intermediate:'中级', advanced:'高级', expert:'专家', native:'母语',
        deleteConfirm:'确定要删除此简历吗？', confirm:'确认', cancel:'取消',
        noResumes:'暂无简历，请创建新简历。', untitled:'未命名简历',
        template:'模板', classic:'经典', modern:'现代', minimal:'简约', professional:'专业',
        photo:'照片', uploadPhoto:'上传照片', removePhoto:'删除照片',
        references:'推荐信', addReference:'添加推荐人', refName:'姓名', refPosition:'职位',
        refCompany:'公司', refPhone:'电话', refEmail:'邮箱',
        color:'颜色', accentColor:'强调色', fontSize:'字号',
        downloading:'正在准备PDF...', downloadReady:'PDF已就绪！',
        resumeName:'简历名称', rename:'重命名'
      },
      ja: {
        title:'履歴書ビルダー', newResume:'新規作成', myResumes:'マイ履歴書', save:'保存', delete:'削除',
        duplicate:'複製', exportPdf:'PDF出力', preview:'プレビュー', edit:'編集',
        personalInfo:'個人情報', fullName:'氏名', jobTitle:'職種',
        email:'メール', phone:'電話番号', address:'住所', website:'ウェブサイト',
        summary:'概要', summaryPlaceholder:'自己紹介を簡潔に...',
        experience:'職歴', education:'学歴', skills:'スキル', languages:'言語',
        certifications:'資格', projects:'プロジェクト',
        addExperience:'職歴を追加', addEducation:'学歴を追加', addSkill:'スキルを追加',
        addLanguage:'言語を追加', addCertification:'資格を追加', addProject:'プロジェクトを追加',
        company:'会社', position:'役職', startDate:'開始日', endDate:'終了日',
        present:'現在', description:'説明', school:'学校', degree:'学位/専攻',
        skillName:'スキル名', level:'レベル', language:'言語', proficiency:'習熟度',
        certName:'資格名', issuer:'発行機関', date:'日付',
        projectName:'プロジェクト名', projectUrl:'プロジェクトURL',
        beginner:'初級', intermediate:'中級', advanced:'上級', expert:'エキスパート', native:'母国語',
        deleteConfirm:'この履歴書を削除しますか？', confirm:'確認', cancel:'キャンセル',
        noResumes:'履歴書がありません。新しく作成してください。', untitled:'無題の履歴書',
        template:'テンプレート', classic:'クラシック', modern:'モダン', minimal:'ミニマル', professional:'プロフェッショナル',
        photo:'写真', uploadPhoto:'写真をアップロード', removePhoto:'写真を削除',
        references:'参考人', addReference:'参考人を追加', refName:'氏名', refPosition:'役職',
        refCompany:'会社', refPhone:'電話', refEmail:'メール',
        color:'色', accentColor:'アクセントカラー', fontSize:'文字サイズ',
        downloading:'PDF準備中...', downloadReady:'PDF完成！',
        resumeName:'履歴書名', rename:'名前変更'
      },
      it: {
        title:'Creatore CV', newResume:'Nuovo CV', myResumes:'I miei CV', save:'Salva', delete:'Elimina',
        duplicate:'Duplica', exportPdf:'Esporta PDF', preview:'Anteprima', edit:'Modifica',
        personalInfo:'Informazioni personali', fullName:'Nome completo', jobTitle:'Professione',
        email:'Email', phone:'Telefono', address:'Indirizzo', website:'Sito web',
        summary:'Riepilogo', summaryPlaceholder:'Descrivi brevemente te stesso...',
        experience:'Esperienza lavorativa', education:'Istruzione', skills:'Competenze', languages:'Lingue',
        certifications:'Certificazioni', projects:'Progetti',
        addExperience:'Aggiungi esperienza', addEducation:'Aggiungi istruzione', addSkill:'Aggiungi competenza',
        addLanguage:'Aggiungi lingua', addCertification:'Aggiungi certificazione', addProject:'Aggiungi progetto',
        company:'Azienda', position:'Posizione', startDate:'Data inizio', endDate:'Data fine',
        present:'Presente', description:'Descrizione', school:'Scuola', degree:'Laurea/Campo',
        skillName:'Competenza', level:'Livello', language:'Lingua', proficiency:'Padronanza',
        certName:'Nome certificazione', issuer:'Ente', date:'Data',
        projectName:'Nome progetto', projectUrl:'URL progetto',
        beginner:'Base', intermediate:'Intermedio', advanced:'Avanzato', expert:'Esperto', native:'Madrelingua',
        deleteConfirm:'Sei sicuro di voler eliminare questo CV?', confirm:'Conferma', cancel:'Annulla',
        noResumes:'Nessun CV. Creane uno nuovo.', untitled:'CV senza titolo',
        template:'Modello', classic:'Classico', modern:'Moderno', minimal:'Minimale', professional:'Professionale',
        photo:'Foto', uploadPhoto:'Carica foto', removePhoto:'Rimuovi foto',
        references:'Referenze', addReference:'Aggiungi referenza', refName:'Nome', refPosition:'Posizione',
        refCompany:'Azienda', refPhone:'Telefono', refEmail:'Email',
        color:'Colore', accentColor:'Colore accento', fontSize:'Dimensione testo',
        downloading:'Preparazione PDF...', downloadReady:'PDF pronto!',
        resumeName:'Nome CV', rename:'Rinomina'
      },
      ar: {
        title:'منشئ السيرة الذاتية', newResume:'سيرة ذاتية جديدة', myResumes:'سيري الذاتية', save:'حفظ', delete:'حذف',
        duplicate:'نسخ', exportPdf:'تصدير PDF', preview:'معاينة', edit:'تعديل',
        personalInfo:'المعلومات الشخصية', fullName:'الاسم الكامل', jobTitle:'المسمى الوظيفي',
        email:'البريد الإلكتروني', phone:'الهاتف', address:'العنوان', website:'الموقع',
        summary:'الملخص', summaryPlaceholder:'اكتب ملخصًا موجزًا عن نفسك...',
        experience:'الخبرة العملية', education:'التعليم', skills:'المهارات', languages:'اللغات',
        certifications:'الشهادات', projects:'المشاريع',
        addExperience:'إضافة خبرة', addEducation:'إضافة تعليم', addSkill:'إضافة مهارة',
        addLanguage:'إضافة لغة', addCertification:'إضافة شهادة', addProject:'إضافة مشروع',
        company:'الشركة', position:'المنصب', startDate:'تاريخ البدء', endDate:'تاريخ الانتهاء',
        present:'حتى الآن', description:'الوصف', school:'المدرسة', degree:'الدرجة/التخصص',
        skillName:'اسم المهارة', level:'المستوى', language:'اللغة', proficiency:'الإتقان',
        certName:'اسم الشهادة', issuer:'الجهة المانحة', date:'التاريخ',
        projectName:'اسم المشروع', projectUrl:'رابط المشروع',
        beginner:'مبتدئ', intermediate:'متوسط', advanced:'متقدم', expert:'خبير', native:'لغة أم',
        deleteConfirm:'هل أنت متأكد من حذف هذه السيرة الذاتية؟', confirm:'تأكيد', cancel:'إلغاء',
        noResumes:'لا توجد سير ذاتية. أنشئ واحدة جديدة.', untitled:'سيرة ذاتية بدون عنوان',
        template:'قالب', classic:'كلاسيكي', modern:'عصري', minimal:'بسيط', professional:'احترافي',
        photo:'صورة', uploadPhoto:'رفع صورة', removePhoto:'إزالة الصورة',
        references:'المراجع', addReference:'إضافة مرجع', refName:'الاسم', refPosition:'المنصب',
        refCompany:'الشركة', refPhone:'الهاتف', refEmail:'البريد',
        color:'اللون', accentColor:'لون التمييز', fontSize:'حجم الخط',
        downloading:'جاري تحضير PDF...', downloadReady:'PDF جاهز!',
        resumeName:'اسم السيرة الذاتية', rename:'إعادة تسمية'
      },
      ko: {
        title:'이력서 빌더', newResume:'새 이력서', myResumes:'내 이력서', save:'저장', delete:'삭제',
        duplicate:'복제', exportPdf:'PDF 내보내기', preview:'미리보기', edit:'편집',
        personalInfo:'개인정보', fullName:'이름', jobTitle:'직함',
        email:'이메일', phone:'전화번호', address:'주소', website:'웹사이트',
        summary:'자기소개', summaryPlaceholder:'자신을 간략히 소개하세요...',
        experience:'경력사항', education:'학력', skills:'기술', languages:'언어',
        certifications:'자격증', projects:'프로젝트',
        addExperience:'경력 추가', addEducation:'학력 추가', addSkill:'기술 추가',
        addLanguage:'언어 추가', addCertification:'자격증 추가', addProject:'프로젝트 추가',
        company:'회사', position:'직위', startDate:'시작일', endDate:'종료일',
        present:'현재', description:'설명', school:'학교', degree:'학위/전공',
        skillName:'기술명', level:'수준', language:'언어', proficiency:'숙련도',
        certName:'자격증명', issuer:'발급기관', date:'날짜',
        projectName:'프로젝트명', projectUrl:'프로젝트 URL',
        beginner:'초급', intermediate:'중급', advanced:'고급', expert:'전문가', native:'모국어',
        deleteConfirm:'이 이력서를 삭제하시겠습니까?', confirm:'확인', cancel:'취소',
        noResumes:'이력서가 없습니다. 새로 만드세요.', untitled:'제목 없는 이력서',
        template:'템플릿', classic:'클래식', modern:'모던', minimal:'미니멀', professional:'프로페셔널',
        photo:'사진', uploadPhoto:'사진 업로드', removePhoto:'사진 삭제',
        references:'추천인', addReference:'추천인 추가', refName:'이름', refPosition:'직위',
        refCompany:'회사', refPhone:'전화', refEmail:'이메일',
        color:'색상', accentColor:'강조 색상', fontSize:'글자 크기',
        downloading:'PDF 준비중...', downloadReady:'PDF 완료!',
        resumeName:'이력서 이름', rename:'이름 변경'
      },
      hi: {
        title:'रिज्यूमे बिल्डर', newResume:'नया रिज्यूमे', myResumes:'मेरे रिज्यूमे', save:'सहेजें', delete:'हटाएं',
        duplicate:'कॉपी करें', exportPdf:'PDF निर्यात', preview:'पूर्वावलोकन', edit:'संपादित करें',
        personalInfo:'व्यक्तिगत जानकारी', fullName:'पूरा नाम', jobTitle:'पद',
        email:'ईमेल', phone:'फोन', address:'पता', website:'वेबसाइट',
        summary:'सारांश', summaryPlaceholder:'अपने बारे में संक्षेप में लिखें...',
        experience:'कार्य अनुभव', education:'शिक्षा', skills:'कौशल', languages:'भाषाएं',
        certifications:'प्रमाणपत्र', projects:'परियोजनाएं',
        addExperience:'अनुभव जोड़ें', addEducation:'शिक्षा जोड़ें', addSkill:'कौशल जोड़ें',
        addLanguage:'भाषा जोड़ें', addCertification:'प्रमाणपत्र जोड़ें', addProject:'परियोजना जोड़ें',
        company:'कंपनी', position:'पद', startDate:'आरंभ तिथि', endDate:'समाप्ति तिथि',
        present:'वर्तमान', description:'विवरण', school:'विद्यालय', degree:'डिग्री/क्षेत्र',
        skillName:'कौशल नाम', level:'स्तर', language:'भाषा', proficiency:'दक्षता',
        certName:'प्रमाणपत्र नाम', issuer:'जारीकर्ता', date:'तिथि',
        projectName:'परियोजना नाम', projectUrl:'परियोजना URL',
        beginner:'शुरुआती', intermediate:'मध्यम', advanced:'उन्नत', expert:'विशेषज्ञ', native:'मातृभाषा',
        deleteConfirm:'क्या आप इस रिज्यूमे को हटाना चाहते हैं?', confirm:'पुष्टि करें', cancel:'रद्द करें',
        noResumes:'कोई रिज्यूमे नहीं। नया बनाएं।', untitled:'शीर्षकहीन रिज्यूमे',
        template:'टेम्पलेट', classic:'क्लासिक', modern:'मॉडर्न', minimal:'न्यूनतम', professional:'पेशेवर',
        photo:'फोटो', uploadPhoto:'फोटो अपलोड करें', removePhoto:'फोटो हटाएं',
        references:'संदर्भ', addReference:'संदर्भ जोड़ें', refName:'नाम', refPosition:'पद',
        refCompany:'कंपनी', refPhone:'फोन', refEmail:'ईमेल',
        color:'रंग', accentColor:'एक्सेंट रंग', fontSize:'फॉन्ट साइज़',
        downloading:'PDF तैयार हो रहा है...', downloadReady:'PDF तैयार!',
        resumeName:'रिज्यूमे नाम', rename:'नाम बदलें'
      },
      pt: {
        title:'Criador de Currículo', newResume:'Novo Currículo', myResumes:'Meus Currículos', save:'Salvar', delete:'Excluir',
        duplicate:'Duplicar', exportPdf:'Exportar PDF', preview:'Visualizar', edit:'Editar',
        personalInfo:'Informações pessoais', fullName:'Nome completo', jobTitle:'Cargo',
        email:'Email', phone:'Telefone', address:'Endereço', website:'Website',
        summary:'Resumo', summaryPlaceholder:'Descreva-se brevemente...',
        experience:'Experiência profissional', education:'Formação', skills:'Habilidades', languages:'Idiomas',
        certifications:'Certificações', projects:'Projetos',
        addExperience:'Adicionar experiência', addEducation:'Adicionar formação', addSkill:'Adicionar habilidade',
        addLanguage:'Adicionar idioma', addCertification:'Adicionar certificação', addProject:'Adicionar projeto',
        company:'Empresa', position:'Cargo', startDate:'Data de início', endDate:'Data de término',
        present:'Presente', description:'Descrição', school:'Escola', degree:'Grau/Área',
        skillName:'Habilidade', level:'Nível', language:'Idioma', proficiency:'Proficiência',
        certName:'Nome da certificação', issuer:'Emissor', date:'Data',
        projectName:'Nome do projeto', projectUrl:'URL do projeto',
        beginner:'Iniciante', intermediate:'Intermediário', advanced:'Avançado', expert:'Especialista', native:'Nativo',
        deleteConfirm:'Tem certeza que deseja excluir este currículo?', confirm:'Confirmar', cancel:'Cancelar',
        noResumes:'Nenhum currículo. Crie um novo.', untitled:'Currículo sem título',
        template:'Modelo', classic:'Clássico', modern:'Moderno', minimal:'Minimalista', professional:'Profissional',
        photo:'Foto', uploadPhoto:'Enviar foto', removePhoto:'Remover foto',
        references:'Referências', addReference:'Adicionar referência', refName:'Nome', refPosition:'Cargo',
        refCompany:'Empresa', refPhone:'Telefone', refEmail:'Email',
        color:'Cor', accentColor:'Cor de destaque', fontSize:'Tamanho da fonte',
        downloading:'Preparando PDF...', downloadReady:'PDF pronto!',
        resumeName:'Nome do currículo', rename:'Renomear'
      }
    };

    function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }
    const locale = ref(getLocale());
    function t(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
    function onLocaleChanged() { locale.value = getLocale(); }

    function getToken() { return localStorage.getItem('auth_token') || ''; }
    function authHeaders() { return { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }

    async function api(url, opts) {
      const r = await fetch(url, { headers: authHeaders(), ...opts });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'API error');
      return d;
    }

    // ── State ──
    const resumes = ref([]);
    const activeResumeId = ref(null);
    const loading = ref(false);
    const mode = ref('list'); // list | edit | preview
    const activeSection = ref('personal');
    const pdfLoading = ref(false);

    const TEMPLATES = ['classic', 'modern', 'minimal', 'professional'];
    const ACCENT_COLORS = ['#2980b9', '#27ae60', '#8e44ad', '#e74c3c', '#f39c12', '#1abc9c', '#34495e', '#d35400'];
    const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];
    const LANG_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert', 'native'];

    const activeResume = computed(() => resumes.value.find(r => r.id === activeResumeId.value));

    function emptyResume() {
      return {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        name: t('untitled'),
        template: 'classic',
        accentColor: '#2980b9',
        fontSize: 14,
        photo: '',
        personal: { fullName: '', jobTitle: '', email: '', phone: '', address: '', website: '' },
        summary: '',
        experience: [],
        education: [],
        skills: [],
        languages: [],
        certifications: [],
        projects: [],
        references: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    // ── Server Methods ──
    async function loadResumes() {
      loading.value = true;
      try {
        const data = await api('/api/resume-builder/resumes');
        resumes.value = data.resumes || [];
        if (resumes.value.length && !activeResumeId.value) {
          activeResumeId.value = resumes.value[0].id;
        }
      } catch (e) { ElMessage.error(e.message); }
      finally { loading.value = false; }
    }

    async function saveResumes() {
      try {
        await api('/api/resume-builder/resumes', {
          method: 'POST',
          body: JSON.stringify({ resumes: resumes.value })
        });
      } catch (e) { ElMessage.error(e.message); }
    }

    let saveTimer = null;
    function debouncedSave() {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => saveResumes(), 600);
    }

    async function addResume() {
      const r = emptyResume();
      resumes.value.push(r);
      activeResumeId.value = r.id;
      mode.value = 'edit';
      activeSection.value = 'personal';
      await saveResumes();
      ElMessage.success(t('newResume'));
    }

    async function deleteResume(id) {
      try {
        await ElMessageBox.confirm(t('deleteConfirm'), t('confirm'), { confirmButtonText: t('confirm'), cancelButtonText: t('cancel'), type: 'warning' });
      } catch { return; }
      resumes.value = resumes.value.filter(r => r.id !== id);
      if (activeResumeId.value === id) {
        activeResumeId.value = resumes.value.length ? resumes.value[0].id : null;
      }
      if (!resumes.value.length) mode.value = 'list';
      await saveResumes();
    }

    async function duplicateResume(id) {
      const src = resumes.value.find(r => r.id === id);
      if (!src) return;
      const dup = JSON.parse(JSON.stringify(src));
      dup.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      dup.name = src.name + ' (copy)';
      dup.createdAt = new Date().toISOString();
      dup.updatedAt = new Date().toISOString();
      resumes.value.push(dup);
      activeResumeId.value = dup.id;
      await saveResumes();
      ElMessage.success(t('duplicate'));
    }

    async function renameResume(id) {
      const src = resumes.value.find(r => r.id === id);
      if (!src) return;
      try {
        const { value } = await ElMessageBox.prompt(t('resumeName'), t('rename'), {
          confirmButtonText: t('save'), cancelButtonText: t('cancel'), inputValue: src.name
        });
        if (value && value.trim()) {
          src.name = value.trim();
          src.updatedAt = new Date().toISOString();
          await saveResumes();
        }
      } catch { /* cancelled */ }
    }

    function switchResume(id) {
      activeResumeId.value = id;
      mode.value = 'edit';
      activeSection.value = 'personal';
    }

    function openPreview() { mode.value = 'preview'; }
    function openEdit() { mode.value = 'edit'; }
    function goToList() { mode.value = 'list'; }

    // ── Section Item Management ──
    function addExperience() {
      if (!activeResume.value) return;
      activeResume.value.experience.push({
        id: Date.now().toString(36), company: '', position: '', startDate: '', endDate: '', present: false, description: ''
      });
      markUpdated();
    }
    function removeExperience(idx) {
      activeResume.value.experience.splice(idx, 1); markUpdated();
    }
    function addEducation() {
      if (!activeResume.value) return;
      activeResume.value.education.push({
        id: Date.now().toString(36), school: '', degree: '', startDate: '', endDate: '', description: ''
      });
      markUpdated();
    }
    function removeEducation(idx) {
      activeResume.value.education.splice(idx, 1); markUpdated();
    }
    function addSkill() {
      if (!activeResume.value) return;
      activeResume.value.skills.push({ id: Date.now().toString(36), name: '', level: 'intermediate' });
      markUpdated();
    }
    function removeSkill(idx) {
      activeResume.value.skills.splice(idx, 1); markUpdated();
    }
    function addLanguage() {
      if (!activeResume.value) return;
      activeResume.value.languages.push({ id: Date.now().toString(36), name: '', proficiency: 'intermediate' });
      markUpdated();
    }
    function removeLanguage(idx) {
      activeResume.value.languages.splice(idx, 1); markUpdated();
    }
    function addCertification() {
      if (!activeResume.value) return;
      activeResume.value.certifications.push({ id: Date.now().toString(36), name: '', issuer: '', date: '' });
      markUpdated();
    }
    function removeCertification(idx) {
      activeResume.value.certifications.splice(idx, 1); markUpdated();
    }
    function addProject() {
      if (!activeResume.value) return;
      activeResume.value.projects.push({ id: Date.now().toString(36), name: '', url: '', description: '' });
      markUpdated();
    }
    function removeProject(idx) {
      activeResume.value.projects.splice(idx, 1); markUpdated();
    }
    function addReference() {
      if (!activeResume.value) return;
      activeResume.value.references.push({ id: Date.now().toString(36), name: '', position: '', company: '', phone: '', email: '' });
      markUpdated();
    }
    function removeReference(idx) {
      activeResume.value.references.splice(idx, 1); markUpdated();
    }

    function markUpdated() {
      if (activeResume.value) activeResume.value.updatedAt = new Date().toISOString();
      debouncedSave();
    }

    // ── Photo ──
    function handlePhotoUpload(file) {
      if (!activeResume.value) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 200;
          let w = img.width, h = img.height;
          if (w > MAX || h > MAX) {
            if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
            else { w = Math.round(w * MAX / h); h = MAX; }
          }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          activeResume.value.photo = canvas.toDataURL('image/jpeg', 0.8);
          markUpdated();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file.raw || file);
      return false;
    }

    function removePhoto() {
      if (!activeResume.value) return;
      activeResume.value.photo = '';
      markUpdated();
    }

    // ── PDF Export ──
    async function exportPdf() {
      if (!activeResume.value) return;
      pdfLoading.value = true;
      ElMessage.info(t('downloading'));
      try {
        const res = await fetch('/api/resume-builder/export-pdf', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ resume: activeResume.value, locale: locale.value })
        });
        if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'PDF error'); }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (activeResume.value.personal.fullName || activeResume.value.name || 'resume') + '.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        ElMessage.success(t('downloadReady'));
      } catch (e) { ElMessage.error(e.message); }
      finally { pdfLoading.value = false; }
    }

    // ── Watchers ──
    watch(() => activeResume.value ? JSON.stringify(activeResume.value) : '', (n, o) => {
      if (o && n !== o) debouncedSave();
    });

    // ── Lifecycle ──
    onMounted(() => {
      window.addEventListener('locale-changed', onLocaleChanged);
      loadResumes();
    });
    onUnmounted(() => {
      window.removeEventListener('locale-changed', onLocaleChanged);
      if (saveTimer) clearTimeout(saveTimer);
    });

    return {
      t, locale, resumes, activeResumeId, activeResume, loading, mode, activeSection, pdfLoading,
      TEMPLATES, ACCENT_COLORS, SKILL_LEVELS, LANG_LEVELS,
      loadResumes, addResume, deleteResume, duplicateResume, renameResume, switchResume,
      openPreview, openEdit, goToList,
      addExperience, removeExperience, addEducation, removeEducation,
      addSkill, removeSkill, addLanguage, removeLanguage,
      addCertification, removeCertification, addProject, removeProject,
      addReference, removeReference,
      markUpdated, handlePhotoUpload, removePhoto, exportPdf
    };
  }
})
