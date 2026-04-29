(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, watch, nextTick } = Vue;

  const LANGS = {
    tr: {
      title:'PetCarely', myPets:'Evcil Hayvanlarım', addPet:'Hayvan Ekle', editPet:'Düzenle', deletePet:'Sil',
      noPets:'Henüz evcil hayvan eklenmedi', addFirst:'İlk evcil hayvanınızı ekleyin',
      // tabs
      profile:'Profil', physical:'Fiziksel', behavior:'Davranış', health:'Sağlık', media:'Medya',
      // basic info
      name:'İsim', species:'Tür', breed:'Irk', gender:'Cinsiyet', birthDate:'Doğum Tarihi',
      color:'Renk', weight:'Ağırlık', weightUnit:'kg', microchipId:'Mikroçip No', age:'Yaş',
      // species
      dog:'Köpek', cat:'Kedi', bird:'Kuş', fish:'Balık', rabbit:'Tavşan', hamster:'Hamster',
      turtle:'Kaplumbağa', snake:'Yılan', horse:'At', other:'Diğer',
      // gender
      male:'Erkek', female:'Dişi', unknown:'Bilinmiyor',
      // physical
      size:'Boyut', small:'Küçük', medium:'Orta', large:'Büyük',
      coatType:'Tüy Tipi', short:'Kısa', long:'Uzun', curly:'Kıvırcık', hairless:'Tüysüz', wire:'Tel',
      eyeColor:'Göz Rengi', distinctiveMarks:'Ayırt Edici İşaretler',
      // behavior
      temperament:'Mizaç', friendly:'Arkadaş Canlısı', aggressive:'Agresif', shy:'Çekingen',
      calm:'Sakin', playful:'Oyuncu', protective:'Koruyucu',
      activityLevel:'Aktivite Seviyesi', low:'Düşük', high:'Yüksek',
      trainingLevel:'Eğitim Seviyesi', untrained:'Eğitimsiz', basic:'Temel', advanced:'İleri',
      socialBehavior:'Sosyal Davranış', goodWithKids:'Çocuklarla iyi', goodWithPets:'Diğer hayvanlarla iyi',
      goodWithStrangers:'Yabancılarla iyi',
      // health
      neuteredSpayed:'Kısırlaştırılmış', yes:'Evet', no:'Hayır',
      allergies:'Alerjiler', chronicConditions:'Kronik Durumlar', addItem:'Ekle',
      // media
      profilePhoto:'Profil Fotoğrafı', photos:'Fotoğraflar', uploadPhoto:'Fotoğraf Yükle',
      noPhotos:'Henüz fotoğraf yok', deletePhoto:'Fotoğrafı Sil', setAsProfile:'Profil Yap',
      // actions
      save:'Kaydet', cancel:'İptal', confirm:'Onayla', deleteConfirm:'Bu evcil hayvan silinsin mi?',
      saved:'Kaydedildi', required:'Bu alan gerekli',
      // integrations
      addReminder:'Hatırlatma Ekle', addToCalendar:'Takvime Ekle', shareProfile:'Profili Paylaş',
      reminderTitle:'Hatırlatma Başlığı', reminderDate:'Tarih ve Saat',
      reminderAdded:'Hatırlatma eklendi', calendarAdded:'Takvime eklendi',
      vaccinationReminder:'Aşı hatırlatma', vetVisit:'Veteriner ziyareti', feedingTime:'Beslenme zamanı',
      groomingTime:'Bakım zamanı', medicationTime:'İlaç zamanı',
      birthdayEvent:'doğum günü 🎂', years:'yıl', months:'ay'
    },
    en: {
      title:'PetCarely', myPets:'My Pets', addPet:'Add Pet', editPet:'Edit', deletePet:'Delete',
      noPets:'No pets added yet', addFirst:'Add your first pet',
      profile:'Profile', physical:'Physical', behavior:'Behavior', health:'Health', media:'Media',
      name:'Name', species:'Species', breed:'Breed', gender:'Gender', birthDate:'Birth Date',
      color:'Color', weight:'Weight', weightUnit:'kg', microchipId:'Microchip ID', age:'Age',
      dog:'Dog', cat:'Cat', bird:'Bird', fish:'Fish', rabbit:'Rabbit', hamster:'Hamster',
      turtle:'Turtle', snake:'Snake', horse:'Horse', other:'Other',
      male:'Male', female:'Female', unknown:'Unknown',
      size:'Size', small:'Small', medium:'Medium', large:'Large',
      coatType:'Coat Type', short:'Short', long:'Long', curly:'Curly', hairless:'Hairless', wire:'Wire',
      eyeColor:'Eye Color', distinctiveMarks:'Distinctive Marks',
      temperament:'Temperament', friendly:'Friendly', aggressive:'Aggressive', shy:'Shy',
      calm:'Calm', playful:'Playful', protective:'Protective',
      activityLevel:'Activity Level', low:'Low', high:'High',
      trainingLevel:'Training Level', untrained:'Untrained', basic:'Basic', advanced:'Advanced',
      socialBehavior:'Social Behavior', goodWithKids:'Good with kids', goodWithPets:'Good with other pets',
      goodWithStrangers:'Good with strangers',
      neuteredSpayed:'Neutered/Spayed', yes:'Yes', no:'No',
      allergies:'Allergies', chronicConditions:'Chronic Conditions', addItem:'Add',
      profilePhoto:'Profile Photo', photos:'Photos', uploadPhoto:'Upload Photo',
      noPhotos:'No photos yet', deletePhoto:'Delete Photo', setAsProfile:'Set as Profile',
      save:'Save', cancel:'Cancel', confirm:'Confirm', deleteConfirm:'Delete this pet?',
      saved:'Saved', required:'This field is required',
      addReminder:'Add Reminder', addToCalendar:'Add to Calendar', shareProfile:'Share Profile',
      reminderTitle:'Reminder Title', reminderDate:'Date and Time',
      reminderAdded:'Reminder added', calendarAdded:'Added to calendar',
      vaccinationReminder:'Vaccination reminder', vetVisit:'Vet visit', feedingTime:'Feeding time',
      groomingTime:'Grooming time', medicationTime:'Medication time',
      birthdayEvent:'birthday 🎂', years:'years', months:'months'
    },
    de: {
      title:'PetCarely', myPets:'Meine Haustiere', addPet:'Tier hinzufügen', editPet:'Bearbeiten', deletePet:'Löschen',
      noPets:'Noch keine Haustiere', addFirst:'Fügen Sie Ihr erstes Haustier hinzu',
      profile:'Profil', physical:'Physisch', behavior:'Verhalten', health:'Gesundheit', media:'Medien',
      name:'Name', species:'Art', breed:'Rasse', gender:'Geschlecht', birthDate:'Geburtsdatum',
      color:'Farbe', weight:'Gewicht', weightUnit:'kg', microchipId:'Mikrochip-Nr.', age:'Alter',
      dog:'Hund', cat:'Katze', bird:'Vogel', fish:'Fisch', rabbit:'Kaninchen', hamster:'Hamster',
      turtle:'Schildkröte', snake:'Schlange', horse:'Pferd', other:'Andere',
      male:'Männlich', female:'Weiblich', unknown:'Unbekannt',
      size:'Größe', small:'Klein', medium:'Mittel', large:'Groß',
      coatType:'Felltyp', short:'Kurz', long:'Lang', curly:'Lockig', hairless:'Haarlos', wire:'Drahtig',
      eyeColor:'Augenfarbe', distinctiveMarks:'Besondere Merkmale',
      temperament:'Temperament', friendly:'Freundlich', aggressive:'Aggressiv', shy:'Schüchtern',
      calm:'Ruhig', playful:'Verspielt', protective:'Beschützend',
      activityLevel:'Aktivitätsniveau', low:'Niedrig', high:'Hoch',
      trainingLevel:'Ausbildungsstufe', untrained:'Untrainiert', basic:'Grundlegend', advanced:'Fortgeschritten',
      socialBehavior:'Sozialverhalten', goodWithKids:'Gut mit Kindern', goodWithPets:'Gut mit anderen Tieren',
      goodWithStrangers:'Gut mit Fremden',
      neuteredSpayed:'Kastriert/Sterilisiert', yes:'Ja', no:'Nein',
      allergies:'Allergien', chronicConditions:'Chronische Erkrankungen', addItem:'Hinzufügen',
      profilePhoto:'Profilfoto', photos:'Fotos', uploadPhoto:'Foto hochladen',
      noPhotos:'Noch keine Fotos', deletePhoto:'Foto löschen', setAsProfile:'Als Profil festlegen',
      save:'Speichern', cancel:'Abbrechen', confirm:'Bestätigen', deleteConfirm:'Dieses Haustier löschen?',
      saved:'Gespeichert', required:'Pflichtfeld',
      addReminder:'Erinnerung hinzufügen', addToCalendar:'Zum Kalender', shareProfile:'Profil teilen',
      reminderTitle:'Erinnerungstitel', reminderDate:'Datum und Uhrzeit',
      reminderAdded:'Erinnerung hinzugefügt', calendarAdded:'Zum Kalender hinzugefügt',
      vaccinationReminder:'Impferinnerung', vetVisit:'Tierarztbesuch', feedingTime:'Fütterungszeit',
      groomingTime:'Pflegezeit', medicationTime:'Medikamentenzeit',
      birthdayEvent:'Geburtstag 🎂', years:'Jahre', months:'Monate'
    },
    fr: {
      title:'PetCarely', myPets:'Mes Animaux', addPet:'Ajouter', editPet:'Modifier', deletePet:'Supprimer',
      noPets:'Aucun animal ajouté', addFirst:'Ajoutez votre premier animal',
      profile:'Profil', physical:'Physique', behavior:'Comportement', health:'Santé', media:'Médias',
      name:'Nom', species:'Espèce', breed:'Race', gender:'Genre', birthDate:'Date de naissance',
      color:'Couleur', weight:'Poids', weightUnit:'kg', microchipId:'N° Puce', age:'Âge',
      dog:'Chien', cat:'Chat', bird:'Oiseau', fish:'Poisson', rabbit:'Lapin', hamster:'Hamster',
      turtle:'Tortue', snake:'Serpent', horse:'Cheval', other:'Autre',
      male:'Mâle', female:'Femelle', unknown:'Inconnu',
      size:'Taille', small:'Petit', medium:'Moyen', large:'Grand',
      coatType:'Type de pelage', short:'Court', long:'Long', curly:'Bouclé', hairless:'Sans poil', wire:'Dur',
      eyeColor:'Couleur des yeux', distinctiveMarks:'Marques distinctives',
      temperament:'Tempérament', friendly:'Amical', aggressive:'Agressif', shy:'Timide',
      calm:'Calme', playful:'Joueur', protective:'Protecteur',
      activityLevel:'Niveau d\'activité', low:'Faible', high:'Élevé',
      trainingLevel:'Niveau d\'éducation', untrained:'Non éduqué', basic:'Basique', advanced:'Avancé',
      socialBehavior:'Comportement social', goodWithKids:'Bon avec les enfants', goodWithPets:'Bon avec les animaux',
      goodWithStrangers:'Bon avec les inconnus',
      neuteredSpayed:'Stérilisé', yes:'Oui', no:'Non',
      allergies:'Allergies', chronicConditions:'Maladies chroniques', addItem:'Ajouter',
      profilePhoto:'Photo de profil', photos:'Photos', uploadPhoto:'Télécharger',
      noPhotos:'Pas de photos', deletePhoto:'Supprimer photo', setAsProfile:'Définir comme profil',
      save:'Enregistrer', cancel:'Annuler', confirm:'Confirmer', deleteConfirm:'Supprimer cet animal?',
      saved:'Enregistré', required:'Champ obligatoire',
      addReminder:'Ajouter rappel', addToCalendar:'Ajouter au calendrier', shareProfile:'Partager le profil',
      reminderTitle:'Titre du rappel', reminderDate:'Date et heure',
      reminderAdded:'Rappel ajouté', calendarAdded:'Ajouté au calendrier',
      vaccinationReminder:'Rappel vaccination', vetVisit:'Visite vétérinaire', feedingTime:'Heure du repas',
      groomingTime:'Heure du toilettage', medicationTime:'Heure du médicament',
      birthdayEvent:'anniversaire 🎂', years:'ans', months:'mois'
    },
    es: {
      title:'PetCarely', myPets:'Mis Mascotas', addPet:'Agregar', editPet:'Editar', deletePet:'Eliminar',
      noPets:'Sin mascotas aún', addFirst:'Agregue su primera mascota',
      profile:'Perfil', physical:'Físico', behavior:'Comportamiento', health:'Salud', media:'Medios',
      name:'Nombre', species:'Especie', breed:'Raza', gender:'Género', birthDate:'Fecha de nacimiento',
      color:'Color', weight:'Peso', weightUnit:'kg', microchipId:'ID Microchip', age:'Edad',
      dog:'Perro', cat:'Gato', bird:'Pájaro', fish:'Pez', rabbit:'Conejo', hamster:'Hámster',
      turtle:'Tortuga', snake:'Serpiente', horse:'Caballo', other:'Otro',
      male:'Macho', female:'Hembra', unknown:'Desconocido',
      size:'Tamaño', small:'Pequeño', medium:'Mediano', large:'Grande',
      coatType:'Tipo de pelo', short:'Corto', long:'Largo', curly:'Rizado', hairless:'Sin pelo', wire:'Alambre',
      eyeColor:'Color de ojos', distinctiveMarks:'Marcas distintivas',
      temperament:'Temperamento', friendly:'Amigable', aggressive:'Agresivo', shy:'Tímido',
      calm:'Tranquilo', playful:'Juguetón', protective:'Protector',
      activityLevel:'Nivel de actividad', low:'Bajo', high:'Alto',
      trainingLevel:'Nivel de entrenamiento', untrained:'Sin entrenar', basic:'Básico', advanced:'Avanzado',
      socialBehavior:'Comportamiento social', goodWithKids:'Bueno con niños', goodWithPets:'Bueno con mascotas',
      goodWithStrangers:'Bueno con extraños',
      neuteredSpayed:'Esterilizado', yes:'Sí', no:'No',
      allergies:'Alergias', chronicConditions:'Condiciones crónicas', addItem:'Agregar',
      profilePhoto:'Foto de perfil', photos:'Fotos', uploadPhoto:'Subir foto',
      noPhotos:'Sin fotos', deletePhoto:'Eliminar foto', setAsProfile:'Establecer como perfil',
      save:'Guardar', cancel:'Cancelar', confirm:'Confirmar', deleteConfirm:'¿Eliminar esta mascota?',
      saved:'Guardado', required:'Campo obligatorio',
      addReminder:'Agregar recordatorio', addToCalendar:'Agregar al calendario', shareProfile:'Compartir perfil',
      reminderTitle:'Título del recordatorio', reminderDate:'Fecha y hora',
      reminderAdded:'Recordatorio agregado', calendarAdded:'Agregado al calendario',
      vaccinationReminder:'Recordatorio de vacunación', vetVisit:'Visita al veterinario', feedingTime:'Hora de alimentación',
      groomingTime:'Hora de aseo', medicationTime:'Hora del medicamento',
      birthdayEvent:'cumpleaños 🎂', years:'años', months:'meses'
    },
    ru: {
      title:'PetCarely', myPets:'Мои питомцы', addPet:'Добавить', editPet:'Редактировать', deletePet:'Удалить',
      noPets:'Питомцев пока нет', addFirst:'Добавьте первого питомца',
      profile:'Профиль', physical:'Физические', behavior:'Поведение', health:'Здоровье', media:'Медиа',
      name:'Имя', species:'Вид', breed:'Порода', gender:'Пол', birthDate:'Дата рождения',
      color:'Окрас', weight:'Вес', weightUnit:'кг', microchipId:'Микрочип', age:'Возраст',
      dog:'Собака', cat:'Кот', bird:'Птица', fish:'Рыба', rabbit:'Кролик', hamster:'Хомяк',
      turtle:'Черепаха', snake:'Змея', horse:'Лошадь', other:'Другое',
      male:'Самец', female:'Самка', unknown:'Неизвестно',
      size:'Размер', small:'Маленький', medium:'Средний', large:'Крупный',
      coatType:'Тип шерсти', short:'Короткая', long:'Длинная', curly:'Кудрявая', hairless:'Бесшёрстная', wire:'Жёсткая',
      eyeColor:'Цвет глаз', distinctiveMarks:'Особые приметы',
      temperament:'Темперамент', friendly:'Дружелюбный', aggressive:'Агрессивный', shy:'Робкий',
      calm:'Спокойный', playful:'Игривый', protective:'Защитный',
      activityLevel:'Уровень активности', low:'Низкий', high:'Высокий',
      trainingLevel:'Уровень дрессировки', untrained:'Необученный', basic:'Базовый', advanced:'Продвинутый',
      socialBehavior:'Социальное поведение', goodWithKids:'Хорош с детьми', goodWithPets:'Хорош с животными',
      goodWithStrangers:'Хорош с незнакомцами',
      neuteredSpayed:'Стерилизован', yes:'Да', no:'Нет',
      allergies:'Аллергии', chronicConditions:'Хронические заболевания', addItem:'Добавить',
      profilePhoto:'Фото профиля', photos:'Фотографии', uploadPhoto:'Загрузить фото',
      noPhotos:'Нет фотографий', deletePhoto:'Удалить фото', setAsProfile:'Установить как профиль',
      save:'Сохранить', cancel:'Отмена', confirm:'Подтвердить', deleteConfirm:'Удалить питомца?',
      saved:'Сохранено', required:'Обязательное поле',
      addReminder:'Добавить напоминание', addToCalendar:'В календарь', shareProfile:'Поделиться',
      reminderTitle:'Название напоминания', reminderDate:'Дата и время',
      reminderAdded:'Напоминание добавлено', calendarAdded:'Добавлено в календарь',
      vaccinationReminder:'Напоминание о прививке', vetVisit:'Визит к ветеринару', feedingTime:'Время кормления',
      groomingTime:'Время ухода', medicationTime:'Время лекарства',
      birthdayEvent:'день рождения 🎂', years:'лет', months:'мес.'
    },
    zh: {
      title:'PetCarely', myPets:'我的宠物', addPet:'添加宠物', editPet:'编辑', deletePet:'删除',
      noPets:'还没有宠物', addFirst:'添加您的第一个宠物',
      profile:'资料', physical:'身体', behavior:'行为', health:'健康', media:'媒体',
      name:'名字', species:'种类', breed:'品种', gender:'性别', birthDate:'出生日期',
      color:'颜色', weight:'体重', weightUnit:'kg', microchipId:'芯片号', age:'年龄',
      dog:'狗', cat:'猫', bird:'鸟', fish:'鱼', rabbit:'兔', hamster:'仓鼠',
      turtle:'龟', snake:'蛇', horse:'马', other:'其他',
      male:'雄性', female:'雌性', unknown:'未知',
      size:'大小', small:'小型', medium:'中型', large:'大型',
      coatType:'毛发类型', short:'短毛', long:'长毛', curly:'卷毛', hairless:'无毛', wire:'刚毛',
      eyeColor:'眼睛颜色', distinctiveMarks:'特殊标记',
      temperament:'性情', friendly:'友好', aggressive:'攻击性', shy:'害羞',
      calm:'安静', playful:'好动', protective:'保护性',
      activityLevel:'活动水平', low:'低', high:'高',
      trainingLevel:'训练水平', untrained:'未训练', basic:'基础', advanced:'高级',
      socialBehavior:'社会行为', goodWithKids:'与儿童友好', goodWithPets:'与其他宠物友好',
      goodWithStrangers:'与陌生人友好',
      neuteredSpayed:'已绝育', yes:'是', no:'否',
      allergies:'过敏', chronicConditions:'慢性疾病', addItem:'添加',
      profilePhoto:'头像', photos:'照片', uploadPhoto:'上传照片',
      noPhotos:'暂无照片', deletePhoto:'删除照片', setAsProfile:'设为头像',
      save:'保存', cancel:'取消', confirm:'确认', deleteConfirm:'删除此宠物？',
      saved:'已保存', required:'必填',
      addReminder:'添加提醒', addToCalendar:'添加到日历', shareProfile:'分享资料',
      reminderTitle:'提醒标题', reminderDate:'日期和时间',
      reminderAdded:'提醒已添加', calendarAdded:'已添加到日历',
      vaccinationReminder:'疫苗提醒', vetVisit:'兽医就诊', feedingTime:'喂食时间',
      groomingTime:'美容时间', medicationTime:'用药时间',
      birthdayEvent:'生日 🎂', years:'年', months:'月'
    },
    ja: {
      title:'PetCarely', myPets:'マイペット', addPet:'追加', editPet:'編集', deletePet:'削除',
      noPets:'ペットはまだいません', addFirst:'最初のペットを追加してください',
      profile:'プロフィール', physical:'身体的特徴', behavior:'行動', health:'健康', media:'メディア',
      name:'名前', species:'種類', breed:'品種', gender:'性別', birthDate:'生年月日',
      color:'毛色', weight:'体重', weightUnit:'kg', microchipId:'マイクロチップ', age:'年齢',
      dog:'犬', cat:'猫', bird:'鳥', fish:'魚', rabbit:'ウサギ', hamster:'ハムスター',
      turtle:'カメ', snake:'ヘビ', horse:'馬', other:'その他',
      male:'オス', female:'メス', unknown:'不明',
      size:'サイズ', small:'小型', medium:'中型', large:'大型',
      coatType:'毛質', short:'短毛', long:'長毛', curly:'巻き毛', hairless:'無毛', wire:'硬毛',
      eyeColor:'目の色', distinctiveMarks:'特徴的な模様',
      temperament:'気質', friendly:'フレンドリー', aggressive:'攻撃的', shy:'臆病',
      calm:'穏やか', playful:'遊び好き', protective:'保護的',
      activityLevel:'活動レベル', low:'低い', high:'高い',
      trainingLevel:'しつけレベル', untrained:'未訓練', basic:'基本', advanced:'上級',
      socialBehavior:'社会的行動', goodWithKids:'子供と相性良い', goodWithPets:'他のペットと相性良い',
      goodWithStrangers:'知らない人と相性良い',
      neuteredSpayed:'避妊・去勢済み', yes:'はい', no:'いいえ',
      allergies:'アレルギー', chronicConditions:'慢性疾患', addItem:'追加',
      profilePhoto:'プロフィール写真', photos:'写真', uploadPhoto:'写真をアップロード',
      noPhotos:'写真なし', deletePhoto:'写真を削除', setAsProfile:'プロフィールに設定',
      save:'保存', cancel:'キャンセル', confirm:'確認', deleteConfirm:'このペットを削除しますか？',
      saved:'保存しました', required:'必須項目',
      addReminder:'リマインダー追加', addToCalendar:'カレンダーに追加', shareProfile:'プロフィールを共有',
      reminderTitle:'リマインダータイトル', reminderDate:'日時',
      reminderAdded:'リマインダー追加済み', calendarAdded:'カレンダーに追加済み',
      vaccinationReminder:'ワクチン接種リマインダー', vetVisit:'獣医訪問', feedingTime:'給餌時間',
      groomingTime:'グルーミング時間', medicationTime:'投薬時間',
      birthdayEvent:'誕生日 🎂', years:'歳', months:'ヶ月'
    },
    it: {
      title:'PetCarely', myPets:'I miei animali', addPet:'Aggiungi', editPet:'Modifica', deletePet:'Elimina',
      noPets:'Nessun animale aggiunto', addFirst:'Aggiungi il tuo primo animale',
      profile:'Profilo', physical:'Fisico', behavior:'Comportamento', health:'Salute', media:'Media',
      name:'Nome', species:'Specie', breed:'Razza', gender:'Genere', birthDate:'Data di nascita',
      color:'Colore', weight:'Peso', weightUnit:'kg', microchipId:'Microchip', age:'Età',
      dog:'Cane', cat:'Gatto', bird:'Uccello', fish:'Pesce', rabbit:'Coniglio', hamster:'Criceto',
      turtle:'Tartaruga', snake:'Serpente', horse:'Cavallo', other:'Altro',
      male:'Maschio', female:'Femmina', unknown:'Sconosciuto',
      size:'Taglia', small:'Piccolo', medium:'Medio', large:'Grande',
      coatType:'Tipo di pelo', short:'Corto', long:'Lungo', curly:'Riccio', hairless:'Senza pelo', wire:'Duro',
      eyeColor:'Colore occhi', distinctiveMarks:'Segni distintivi',
      temperament:'Temperamento', friendly:'Amichevole', aggressive:'Aggressivo', shy:'Timido',
      calm:'Calmo', playful:'Giocherellone', protective:'Protettivo',
      activityLevel:'Livello di attività', low:'Basso', high:'Alto',
      trainingLevel:'Livello di addestramento', untrained:'Non addestrato', basic:'Base', advanced:'Avanzato',
      socialBehavior:'Comportamento sociale', goodWithKids:'Buono con bambini', goodWithPets:'Buono con animali',
      goodWithStrangers:'Buono con sconosciuti',
      neuteredSpayed:'Sterilizzato', yes:'Sì', no:'No',
      allergies:'Allergie', chronicConditions:'Condizioni croniche', addItem:'Aggiungi',
      profilePhoto:'Foto profilo', photos:'Foto', uploadPhoto:'Carica foto',
      noPhotos:'Nessuna foto', deletePhoto:'Elimina foto', setAsProfile:'Imposta come profilo',
      save:'Salva', cancel:'Annulla', confirm:'Conferma', deleteConfirm:'Eliminare questo animale?',
      saved:'Salvato', required:'Campo obbligatorio',
      addReminder:'Aggiungi promemoria', addToCalendar:'Aggiungi al calendario', shareProfile:'Condividi profilo',
      reminderTitle:'Titolo promemoria', reminderDate:'Data e ora',
      reminderAdded:'Promemoria aggiunto', calendarAdded:'Aggiunto al calendario',
      vaccinationReminder:'Promemoria vaccinazione', vetVisit:'Visita veterinaria', feedingTime:'Ora del pasto',
      groomingTime:'Ora della toelettatura', medicationTime:'Ora del farmaco',
      birthdayEvent:'compleanno 🎂', years:'anni', months:'mesi'
    },
    ar: {
      title:'PetCarely', myPets:'حيواناتي', addPet:'إضافة', editPet:'تعديل', deletePet:'حذف',
      noPets:'لا توجد حيوانات بعد', addFirst:'أضف حيوانك الأليف الأول',
      profile:'الملف', physical:'الجسدي', behavior:'السلوك', health:'الصحة', media:'الوسائط',
      name:'الاسم', species:'النوع', breed:'السلالة', gender:'الجنس', birthDate:'تاريخ الميلاد',
      color:'اللون', weight:'الوزن', weightUnit:'كغ', microchipId:'رقم الشريحة', age:'العمر',
      dog:'كلب', cat:'قطة', bird:'طائر', fish:'سمكة', rabbit:'أرنب', hamster:'هامستر',
      turtle:'سلحفاة', snake:'ثعبان', horse:'حصان', other:'أخرى',
      male:'ذكر', female:'أنثى', unknown:'غير معروف',
      size:'الحجم', small:'صغير', medium:'متوسط', large:'كبير',
      coatType:'نوع الفراء', short:'قصير', long:'طويل', curly:'مجعد', hairless:'بدون شعر', wire:'خشن',
      eyeColor:'لون العيون', distinctiveMarks:'علامات مميزة',
      temperament:'المزاج', friendly:'ودود', aggressive:'عدواني', shy:'خجول',
      calm:'هادئ', playful:'مرح', protective:'حامٍ',
      activityLevel:'مستوى النشاط', low:'منخفض', high:'عالي',
      trainingLevel:'مستوى التدريب', untrained:'غير مدرب', basic:'أساسي', advanced:'متقدم',
      socialBehavior:'السلوك الاجتماعي', goodWithKids:'جيد مع الأطفال', goodWithPets:'جيد مع الحيوانات',
      goodWithStrangers:'جيد مع الغرباء',
      neuteredSpayed:'معقم', yes:'نعم', no:'لا',
      allergies:'الحساسية', chronicConditions:'الأمراض المزمنة', addItem:'إضافة',
      profilePhoto:'صورة شخصية', photos:'الصور', uploadPhoto:'رفع صورة',
      noPhotos:'لا توجد صور', deletePhoto:'حذف الصورة', setAsProfile:'تعيين كصورة شخصية',
      save:'حفظ', cancel:'إلغاء', confirm:'تأكيد', deleteConfirm:'حذف هذا الحيوان؟',
      saved:'تم الحفظ', required:'حقل مطلوب',
      addReminder:'إضافة تذكير', addToCalendar:'إضافة إلى التقويم', shareProfile:'مشاركة الملف',
      reminderTitle:'عنوان التذكير', reminderDate:'التاريخ والوقت',
      reminderAdded:'تم إضافة التذكير', calendarAdded:'تمت الإضافة إلى التقويم',
      vaccinationReminder:'تذكير التطعيم', vetVisit:'زيارة الطبيب البيطري', feedingTime:'وقت التغذية',
      groomingTime:'وقت العناية', medicationTime:'وقت الدواء',
      birthdayEvent:'عيد ميلاد 🎂', years:'سنة', months:'شهر'
    },
    ko: {
      title:'PetCarely', myPets:'내 반려동물', addPet:'추가', editPet:'편집', deletePet:'삭제',
      noPets:'아직 반려동물이 없습니다', addFirst:'첫 번째 반려동물을 추가하세요',
      profile:'프로필', physical:'신체', behavior:'행동', health:'건강', media:'미디어',
      name:'이름', species:'종류', breed:'품종', gender:'성별', birthDate:'생년월일',
      color:'색상', weight:'체중', weightUnit:'kg', microchipId:'마이크로칩', age:'나이',
      dog:'개', cat:'고양이', bird:'새', fish:'물고기', rabbit:'토끼', hamster:'햄스터',
      turtle:'거북이', snake:'뱀', horse:'말', other:'기타',
      male:'수컷', female:'암컷', unknown:'모름',
      size:'크기', small:'소형', medium:'중형', large:'대형',
      coatType:'모질', short:'짧은', long:'긴', curly:'곱슬', hairless:'무모', wire:'강모',
      eyeColor:'눈 색', distinctiveMarks:'특이 표식',
      temperament:'기질', friendly:'친근한', aggressive:'공격적', shy:'소심한',
      calm:'차분한', playful:'장난스러운', protective:'보호적',
      activityLevel:'활동 수준', low:'낮음', high:'높음',
      trainingLevel:'훈련 수준', untrained:'미훈련', basic:'기본', advanced:'고급',
      socialBehavior:'사회적 행동', goodWithKids:'아이에게 좋음', goodWithPets:'다른 동물과 좋음',
      goodWithStrangers:'낯선 사람과 좋음',
      neuteredSpayed:'중성화', yes:'예', no:'아니오',
      allergies:'알레르기', chronicConditions:'만성 질환', addItem:'추가',
      profilePhoto:'프로필 사진', photos:'사진', uploadPhoto:'사진 업로드',
      noPhotos:'사진 없음', deletePhoto:'사진 삭제', setAsProfile:'프로필로 설정',
      save:'저장', cancel:'취소', confirm:'확인', deleteConfirm:'이 반려동물을 삭제하시겠습니까?',
      saved:'저장됨', required:'필수 항목',
      addReminder:'알림 추가', addToCalendar:'캘린더에 추가', shareProfile:'프로필 공유',
      reminderTitle:'알림 제목', reminderDate:'날짜 및 시간',
      reminderAdded:'알림 추가됨', calendarAdded:'캘린더에 추가됨',
      vaccinationReminder:'예방접종 알림', vetVisit:'수의사 방문', feedingTime:'급식 시간',
      groomingTime:'그루밍 시간', medicationTime:'투약 시간',
      birthdayEvent:'생일 🎂', years:'년', months:'개월'
    },
    hi: {
      title:'PetCarely', myPets:'मेरे पालतू', addPet:'जोड़ें', editPet:'संपादित करें', deletePet:'हटाएं',
      noPets:'अभी कोई पालतू नहीं', addFirst:'अपना पहला पालतू जोड़ें',
      profile:'प्रोफ़ाइल', physical:'शारीरिक', behavior:'व्यवहार', health:'स्वास्थ्य', media:'मीडिया',
      name:'नाम', species:'प्रजाति', breed:'नस्ल', gender:'लिंग', birthDate:'जन्म तिथि',
      color:'रंग', weight:'वजन', weightUnit:'किग्रा', microchipId:'माइक्रोचिप', age:'उम्र',
      dog:'कुत्ता', cat:'बिल्ली', bird:'पक्षी', fish:'मछली', rabbit:'खरगोश', hamster:'हैम्स्टर',
      turtle:'कछुआ', snake:'सांप', horse:'घोड़ा', other:'अन्य',
      male:'नर', female:'मादा', unknown:'अज्ञात',
      size:'आकार', small:'छोटा', medium:'मध्यम', large:'बड़ा',
      coatType:'बाल का प्रकार', short:'छोटे', long:'लंबे', curly:'घुंघराले', hairless:'बिना बाल', wire:'कड़े',
      eyeColor:'आंखों का रंग', distinctiveMarks:'विशिष्ट चिह्न',
      temperament:'स्वभाव', friendly:'मित्रवत', aggressive:'आक्रामक', shy:'शर्मीला',
      calm:'शांत', playful:'चंचल', protective:'सुरक्षात्मक',
      activityLevel:'गतिविधि स्तर', low:'कम', high:'उच्च',
      trainingLevel:'प्रशिक्षण स्तर', untrained:'अप्रशिक्षित', basic:'बुनियादी', advanced:'उन्नत',
      socialBehavior:'सामाजिक व्यवहार', goodWithKids:'बच्चों के साथ अच्छा', goodWithPets:'अन्य पालतू के साथ अच्छा',
      goodWithStrangers:'अजनबियों के साथ अच्छा',
      neuteredSpayed:'नपुंसक', yes:'हाँ', no:'नहीं',
      allergies:'एलर्जी', chronicConditions:'पुरानी बीमारियां', addItem:'जोड़ें',
      profilePhoto:'प्रोफ़ाइल फ़ोटो', photos:'फ़ोटो', uploadPhoto:'फ़ोटो अपलोड',
      noPhotos:'कोई फ़ोटो नहीं', deletePhoto:'फ़ोटो हटाएं', setAsProfile:'प्रोफ़ाइल बनाएं',
      save:'सहेजें', cancel:'रद्द करें', confirm:'पुष्टि करें', deleteConfirm:'क्या इस पालतू को हटाएं?',
      saved:'सहेजा गया', required:'आवश्यक',
      addReminder:'रिमाइंडर जोड़ें', addToCalendar:'कैलेंडर में जोड़ें', shareProfile:'प्रोफ़ाइल साझा करें',
      reminderTitle:'रिमाइंडर शीर्षक', reminderDate:'तारीख और समय',
      reminderAdded:'रिमाइंडर जोड़ा गया', calendarAdded:'कैलेंडर में जोड़ा गया',
      vaccinationReminder:'टीकाकरण रिमाइंडर', vetVisit:'पशु चिकित्सक', feedingTime:'भोजन का समय',
      groomingTime:'सफाई का समय', medicationTime:'दवा का समय',
      birthdayEvent:'जन्मदिन 🎂', years:'वर्ष', months:'महीने'
    },
    pt: {
      title:'PetCarely', myPets:'Meus Pets', addPet:'Adicionar', editPet:'Editar', deletePet:'Excluir',
      noPets:'Nenhum pet adicionado', addFirst:'Adicione seu primeiro pet',
      profile:'Perfil', physical:'Físico', behavior:'Comportamento', health:'Saúde', media:'Mídia',
      name:'Nome', species:'Espécie', breed:'Raça', gender:'Gênero', birthDate:'Data de nascimento',
      color:'Cor', weight:'Peso', weightUnit:'kg', microchipId:'Microchip', age:'Idade',
      dog:'Cão', cat:'Gato', bird:'Pássaro', fish:'Peixe', rabbit:'Coelho', hamster:'Hamster',
      turtle:'Tartaruga', snake:'Cobra', horse:'Cavalo', other:'Outro',
      male:'Macho', female:'Fêmea', unknown:'Desconhecido',
      size:'Porte', small:'Pequeno', medium:'Médio', large:'Grande',
      coatType:'Tipo de pelo', short:'Curto', long:'Longo', curly:'Encaracolado', hairless:'Sem pelo', wire:'Duro',
      eyeColor:'Cor dos olhos', distinctiveMarks:'Marcas distintas',
      temperament:'Temperamento', friendly:'Amigável', aggressive:'Agressivo', shy:'Tímido',
      calm:'Calmo', playful:'Brincalhão', protective:'Protetor',
      activityLevel:'Nível de atividade', low:'Baixo', high:'Alto',
      trainingLevel:'Nível de treino', untrained:'Sem treino', basic:'Básico', advanced:'Avançado',
      socialBehavior:'Comportamento social', goodWithKids:'Bom com crianças', goodWithPets:'Bom com outros pets',
      goodWithStrangers:'Bom com estranhos',
      neuteredSpayed:'Castrado', yes:'Sim', no:'Não',
      allergies:'Alergias', chronicConditions:'Condições crônicas', addItem:'Adicionar',
      profilePhoto:'Foto de perfil', photos:'Fotos', uploadPhoto:'Enviar foto',
      noPhotos:'Sem fotos', deletePhoto:'Excluir foto', setAsProfile:'Definir como perfil',
      save:'Salvar', cancel:'Cancelar', confirm:'Confirmar', deleteConfirm:'Excluir este pet?',
      saved:'Salvo', required:'Campo obrigatório',
      addReminder:'Adicionar lembrete', addToCalendar:'Adicionar ao calendário', shareProfile:'Compartilhar perfil',
      reminderTitle:'Título do lembrete', reminderDate:'Data e hora',
      reminderAdded:'Lembrete adicionado', calendarAdded:'Adicionado ao calendário',
      vaccinationReminder:'Lembrete de vacinação', vetVisit:'Visita ao veterinário', feedingTime:'Hora da alimentação',
      groomingTime:'Hora da higiene', medicationTime:'Hora do medicamento',
      birthdayEvent:'aniversário 🎂', years:'anos', months:'meses'
    }
  };

  const SPECIES_ICONS = { dog:'🐕', cat:'🐈', bird:'🐦', fish:'🐟', rabbit:'🐇', hamster:'🐹', turtle:'🐢', snake:'🐍', horse:'🐴', other:'🐾' };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

      // ── State ──
      const pets = ref([]);
      const selectedPetId = ref(null);
      const view = ref('list'); // list | detail | form
      const activeTab = ref('profile');
      const formMode = ref('add'); // add | edit
      const toast = ref('');
      let toastTimer = null;

      // Form data
      const form = ref(emptyForm());

      function emptyForm() {
        return {
          name: '', species: 'dog', breed: '', gender: 'unknown',
          birth_date: '', color: '', weight: '', microchip_id: '',
          size: 'medium', coat_type: 'short', eye_color: '', distinctive_marks: '',
          temperament: 'friendly', activity_level: 'medium', training_level: 'basic',
          good_with_kids: false, good_with_pets: false, good_with_strangers: false,
          neutered_spayed: false,
          allergies: [], chronic_conditions: [],
          profile_photo_url: '', additional_photos: []
        };
      }

      const selectedPet = computed(() => pets.value.find(p => p.id === selectedPetId.value) || null);

      // ── Allergy/condition input temp ──
      const allergyInput = ref('');
      const conditionInput = ref('');

      // ── Reminder dialog ──
      const reminderDlg = ref(false);
      const reminderForm = ref({ title: '', datetime: '', preset: '' });

      // ── Age calculation ──
      function calcAge(birthDate) {
        if (!birthDate) return '';
        const bd = new Date(birthDate);
        const now = new Date();
        let years = now.getFullYear() - bd.getFullYear();
        let months = now.getMonth() - bd.getMonth();
        if (months < 0) { years--; months += 12; }
        if (now.getDate() < bd.getDate()) months--;
        if (months < 0) { years--; months += 12; }
        if (years > 0) return years + ' ' + L('years') + (months > 0 ? ' ' + months + ' ' + L('months') : '');
        return months + ' ' + L('months');
      }

      // ── Toast ──
      function showToast(msg) {
        toast.value = msg;
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { toast.value = ''; }, 2500);
      }

      // ── API ──
      async function loadPets() {
        try {
          const res = await fetch('/api/pets');
          if (res.ok) pets.value = await res.json();
        } catch {}
      }

      async function savePet() {
        if (!form.value.name.trim()) return;
        const body = {
          ...form.value,
          weight: form.value.weight ? parseFloat(form.value.weight) : null,
          allergies: JSON.stringify(form.value.allergies || []),
          chronic_conditions: JSON.stringify(form.value.chronic_conditions || []),
          additional_photos: JSON.stringify(form.value.additional_photos || [])
        };

        try {
          if (formMode.value === 'add') {
            const res = await fetch('/api/pets', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body)
            });
            if (res.ok) {
              const data = await res.json();
              await loadPets();
              selectedPetId.value = data.id;
              view.value = 'detail';
              showToast(L('saved'));
            }
          } else {
            const res = await fetch('/api/pets/' + selectedPetId.value, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body)
            });
            if (res.ok) {
              await loadPets();
              view.value = 'detail';
              showToast(L('saved'));
            }
          }
        } catch {}
      }

      async function deletePet(id) {
        try {
          await fetch('/api/pets/' + id, { method: 'DELETE' });
          pets.value = pets.value.filter(p => p.id !== id);
          if (selectedPetId.value === id) {
            selectedPetId.value = null;
            view.value = 'list';
          }
        } catch {}
      }

      // ── Navigation ──
      function openAddForm() {
        formMode.value = 'add';
        form.value = emptyForm();
        activeTab.value = 'profile';
        view.value = 'form';
      }

      function openEditForm(pet) {
        formMode.value = 'edit';
        selectedPetId.value = pet.id;
        form.value = {
          name: pet.name || '',
          species: pet.species || 'dog',
          breed: pet.breed || '',
          gender: pet.gender || 'unknown',
          birth_date: pet.birth_date || '',
          color: pet.color || '',
          weight: pet.weight || '',
          microchip_id: pet.microchip_id || '',
          size: pet.size || 'medium',
          coat_type: pet.coat_type || 'short',
          eye_color: pet.eye_color || '',
          distinctive_marks: pet.distinctive_marks || '',
          temperament: pet.temperament || 'friendly',
          activity_level: pet.activity_level || 'medium',
          training_level: pet.training_level || 'basic',
          good_with_kids: !!pet.good_with_kids,
          good_with_pets: !!pet.good_with_pets,
          good_with_strangers: !!pet.good_with_strangers,
          neutered_spayed: !!pet.neutered_spayed,
          allergies: safeParseArr(pet.allergies),
          chronic_conditions: safeParseArr(pet.chronic_conditions),
          profile_photo_url: pet.profile_photo_url || '',
          additional_photos: safeParseArr(pet.additional_photos)
        };
        activeTab.value = 'profile';
        view.value = 'form';
      }

      function openDetail(pet) {
        selectedPetId.value = pet.id;
        activeTab.value = 'profile';
        view.value = 'detail';
      }

      function goList() {
        view.value = 'list';
        selectedPetId.value = null;
      }

      // ── Helpers ──
      function safeParseArr(val) {
        if (Array.isArray(val)) return val;
        if (!val) return [];
        try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; }
      }

      function speciesIcon(sp) { return SPECIES_ICONS[sp] || '🐾'; }

      // ── Allergy / Condition management ──
      function addAllergy() {
        const v = allergyInput.value.trim();
        if (!v || form.value.allergies.includes(v)) return;
        form.value.allergies.push(v);
        allergyInput.value = '';
      }
      function removeAllergy(i) { form.value.allergies.splice(i, 1); }

      function addCondition() {
        const v = conditionInput.value.trim();
        if (!v || form.value.chronic_conditions.includes(v)) return;
        form.value.chronic_conditions.push(v);
        conditionInput.value = '';
      }
      function removeCondition(i) { form.value.chronic_conditions.splice(i, 1); }

      // ── Photo upload ──
      function uploadProfilePhoto() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.jpg,.jpeg,.png,.webp';
        input.onchange = async () => {
          if (!input.files.length) return;
          const fd = new FormData();
          fd.append('files', input.files[0]);
          try {
            const res = await fetch('/api/photos/upload', { method: 'POST', body: fd });
            if (res.ok) {
              const data = await res.json();
              if (data.files && data.files.length) {
                form.value.profile_photo_url = data.files[0].url;
              }
            }
          } catch {}
        };
        input.click();
      }

      function uploadAdditionalPhotos() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.jpg,.jpeg,.png,.webp';
        input.multiple = true;
        input.onchange = async () => {
          if (!input.files.length) return;
          const fd = new FormData();
          for (const f of input.files) fd.append('files', f);
          try {
            const res = await fetch('/api/photos/upload', { method: 'POST', body: fd });
            if (res.ok) {
              const data = await res.json();
              if (data.files) {
                for (const f of data.files) {
                  form.value.additional_photos.push(f.url);
                }
              }
            }
          } catch {}
        };
        input.click();
      }

      function removeAdditionalPhoto(i) { form.value.additional_photos.splice(i, 1); }
      function setAsProfile(url) { form.value.profile_photo_url = url; }

      // ── Integration: Reminder ──
      function openReminderDlg(preset) {
        const pet = selectedPet.value;
        if (!pet) return;
        const now = new Date();
        now.setMinutes(now.getMinutes() + 60);
        const dtStr = now.toISOString().slice(0, 16);
        let title = '';
        if (preset === 'vaccination') title = pet.name + ' — ' + L('vaccinationReminder');
        else if (preset === 'vet') title = pet.name + ' — ' + L('vetVisit');
        else if (preset === 'feeding') title = pet.name + ' — ' + L('feedingTime');
        else if (preset === 'grooming') title = pet.name + ' — ' + L('groomingTime');
        else if (preset === 'medication') title = pet.name + ' — ' + L('medicationTime');
        reminderForm.value = { title, datetime: dtStr, preset };
        reminderDlg.value = true;
      }

      async function submitReminder() {
        const { title, datetime } = reminderForm.value;
        if (!title.trim() || !datetime) return;
        try {
          await fetch('/api/reminders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: title.trim(),
              note: '🐾 PetCarely',
              datetime: new Date(datetime).toISOString(),
              repeat: '',
              sound: true,
              enabled: true
            })
          });
          showToast(L('reminderAdded'));
          // Also send notification
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: '🐾 ' + L('addReminder'),
              text: title.trim(),
              icon: '🐾',
              bg: '#fff3e0'
            })
          });
        } catch {}
        reminderDlg.value = false;
      }

      // ── Integration: Calendar ──
      async function addBirthdayToCalendar() {
        const pet = selectedPet.value;
        if (!pet || !pet.birth_date) return;
        // Add birthday event for current year
        const bd = new Date(pet.birth_date);
        const thisYear = new Date().getFullYear();
        const eventDate = thisYear + '-' + String(bd.getMonth() + 1).padStart(2, '0') + '-' + String(bd.getDate()).padStart(2, '0');
        try {
          await fetch('/api/calendar/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              date: eventDate,
              title: speciesIcon(pet.species) + ' ' + pet.name + ' ' + L('birthdayEvent'),
              color: '#f7971e'
            })
          });
          showToast(L('calendarAdded'));
          // Notification
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: '📅 ' + L('addToCalendar'),
              text: pet.name + ' ' + L('birthdayEvent'),
              icon: '🐾',
              bg: '#fff3e0'
            })
          });
        } catch {}
      }

      // ── Integration: Social Share ──
      function shareProfile() {
        const pet = selectedPet.value;
        if (!pet) return;
        const text = speciesIcon(pet.species) + ' ' + pet.name +
          (pet.breed ? ' (' + pet.breed + ')' : '') +
          (pet.birth_date ? ' — ' + calcAge(pet.birth_date) : '') +
          '\n🐾 PetCarely';
        window.dispatchEvent(new CustomEvent('social-share-content', {
          detail: { text, type: 'text' }
        }));
        // Also try to open the social share app
        window.dispatchEvent(new CustomEvent('open-app', { detail: 'social-share' }));
      }

      // ── Lifecycle ──
      onMounted(async () => {
        await loadPets();
        window.addEventListener('locale-changed', onLocaleChanged);
      });

      onUnmounted(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
        if (toastTimer) clearTimeout(toastTimer);
      });

      return {
        L, locale, pets, selectedPetId, selectedPet, view, activeTab,
        formMode, form, toast,
        allergyInput, conditionInput,
        reminderDlg, reminderForm,
        calcAge, speciesIcon, safeParseArr,
        loadPets, savePet, deletePet,
        openAddForm, openEditForm, openDetail, goList,
        addAllergy, removeAllergy, addCondition, removeCondition,
        uploadProfilePhoto, uploadAdditionalPhotos, removeAdditionalPhoto, setAsProfile,
        openReminderDlg, submitReminder, addBirthdayToCalendar, shareProfile,
        showToast, SPECIES_ICONS
      };
    }
  };
})(Vue);
