({
  setup() {
    const { ref, reactive, computed, watch, onMounted, onUnmounted } = Vue;
    const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success(){}, error(){}, warning(){}, info(){} };

    /* ── i18n ── */
    const LANGS = {
      tr: {
        title:'Cron Builder',
        minute:'Dakika', hour:'Saat', dayOfMonth:'Ayın Günü', month:'Ay', dayOfWeek:'Haftanın Günü',
        every:'Her', range:'Aralık', interval:'Aralık', specific:'Belirli',
        minuteInterval:'dakikada bir', hourInterval:'saatte bir', dayInterval:'günde bir',
        day:'gün',
        exprPlaceholder:'Cron ifadesi yazın (örn: */5 * * * *)',
        nextRuns:'Sonraki Çalışma Zamanları',
        presets:'Hazır Şablonlar', clear:'Temizle',
        save:'Kaydet', saved:'Kaydedilenler', noSaved:'Henüz kayıtlı ifade yok',
        copied:'Kopyalandı!',
        invalidExpr:'Geçersiz cron ifadesi',
        labelPrompt:'Etiket (isteğe bağlı):',
        everyMinute:'Her dakika', everyHour:'Her saat başı', everyDay:'Her gün gece yarısı',
        everyWeekday:'Hafta içi her gün', everyWeekend:'Her hafta sonu',
        every5Min:'Her 5 dakikada', every15Min:'Her 15 dakikada', every30Min:'Her 30 dakikada',
        everyMondayMorning:'Her pazartesi sabah 9:00', everyFirstOfMonth:'Her ayın 1\'i gece yarısı',
        everyNoon:'Her gün öğlen', everyMidnight:'Her gece yarısı',
        at:'saat', on:'günü', and:'ve', through:'ile arasında',
        inMonth:'ayında',
        january:'Ocak', february:'Şubat', march:'Mart', april:'Nisan', may:'Mayıs', june:'Haziran',
        july:'Temmuz', august:'Ağustos', september:'Eylül', october:'Ekim', november:'Kasım', december:'Aralık',
        sunday:'Pazar', monday:'Pazartesi', tuesday:'Salı', wednesday:'Çarşamba',
        thursday:'Perşembe', friday:'Cuma', saturday:'Cumartesi',
        sun:'Paz', mon:'Pte', tue:'Sal', wed:'Çar', thu:'Per', fri:'Cum', sat:'Cmt',
        jan:'Oca', feb:'Şub', mar:'Mar', apr:'Nis', may2:'May', jun:'Haz',
        jul:'Tem', aug:'Ağu', sep:'Eyl', oct:'Eki', nov:'Kas', dec:'Ara',
        explainEveryMinute:'Her dakika çalışır',
        explainEveryHour:'Her saat başı çalışır',
        explainAt:'Saat',
        explainEveryN:'Her',
        explainMinutes:'dakikada bir',
        explainHours:'saatte bir',
        explainDays:'günde bir',
        explainOn:'tarihinde',
        explainOfMonth:'ayının',
        explainWeekday:'hafta içi',
        explainWeekend:'hafta sonu',
        explainAnd:','
      },
      en: {
        title:'Cron Builder',
        minute:'Minute', hour:'Hour', dayOfMonth:'Day (Month)', month:'Month', dayOfWeek:'Day (Week)',
        every:'Every', range:'Range', interval:'Interval', specific:'Specific',
        minuteInterval:'minute(s)', hourInterval:'hour(s)', dayInterval:'day(s)',
        day:'day',
        exprPlaceholder:'Enter cron expression (e.g. */5 * * * *)',
        nextRuns:'Next Run Times',
        presets:'Presets', clear:'Clear',
        save:'Save', saved:'Saved', noSaved:'No saved expressions yet',
        copied:'Copied!',
        invalidExpr:'Invalid cron expression',
        labelPrompt:'Label (optional):',
        everyMinute:'Every minute', everyHour:'Every hour', everyDay:'Every day at midnight',
        everyWeekday:'Every weekday', everyWeekend:'Every weekend',
        every5Min:'Every 5 minutes', every15Min:'Every 15 minutes', every30Min:'Every 30 minutes',
        everyMondayMorning:'Every Monday at 9:00 AM', everyFirstOfMonth:'1st of every month at midnight',
        everyNoon:'Every day at noon', everyMidnight:'Every midnight',
        at:'at', on:'on', and:'and', through:'through',
        inMonth:'in',
        january:'January', february:'February', march:'March', april:'April', may:'May', june:'June',
        july:'July', august:'August', september:'September', october:'October', november:'November', december:'December',
        sunday:'Sunday', monday:'Monday', tuesday:'Tuesday', wednesday:'Wednesday',
        thursday:'Thursday', friday:'Friday', saturday:'Saturday',
        sun:'Sun', mon:'Mon', tue:'Tue', wed:'Wed', thu:'Thu', fri:'Fri', sat:'Sat',
        jan:'Jan', feb:'Feb', mar:'Mar', apr:'Apr', may2:'May', jun:'Jun',
        jul:'Jul', aug:'Aug', sep:'Sep', oct:'Oct', nov:'Nov', dec:'Dec',
        explainEveryMinute:'Runs every minute',
        explainEveryHour:'Runs every hour',
        explainAt:'At',
        explainEveryN:'Every',
        explainMinutes:'minute(s)',
        explainHours:'hour(s)',
        explainDays:'day(s)',
        explainOn:'on the',
        explainOfMonth:'of',
        explainWeekday:'weekdays',
        explainWeekend:'weekends',
        explainAnd:','
      },
      de: {
        title:'Cron Builder',
        minute:'Minute', hour:'Stunde', dayOfMonth:'Tag (Monat)', month:'Monat', dayOfWeek:'Wochentag',
        every:'Jede', range:'Bereich', interval:'Intervall', specific:'Bestimmte',
        minuteInterval:'Minute(n)', hourInterval:'Stunde(n)', dayInterval:'Tag(e)',
        day:'Tag',
        exprPlaceholder:'Cron-Ausdruck eingeben (z.B. */5 * * * *)',
        nextRuns:'Nächste Ausführungszeiten',
        presets:'Vorlagen', clear:'Löschen',
        save:'Speichern', saved:'Gespeichert', noSaved:'Noch keine gespeicherten Ausdrücke',
        copied:'Kopiert!',
        invalidExpr:'Ungültiger Cron-Ausdruck',
        labelPrompt:'Bezeichnung (optional):',
        everyMinute:'Jede Minute', everyHour:'Jede Stunde', everyDay:'Jeden Tag um Mitternacht',
        everyWeekday:'Jeden Werktag', everyWeekend:'Jedes Wochenende',
        every5Min:'Alle 5 Minuten', every15Min:'Alle 15 Minuten', every30Min:'Alle 30 Minuten',
        everyMondayMorning:'Jeden Montag um 9:00', everyFirstOfMonth:'Am 1. jedes Monats um Mitternacht',
        everyNoon:'Jeden Tag mittags', everyMidnight:'Jeden Tag um Mitternacht',
        at:'um', on:'am', and:'und', through:'bis',
        inMonth:'im',
        january:'Januar', february:'Februar', march:'März', april:'April', may:'Mai', june:'Juni',
        july:'Juli', august:'August', september:'September', october:'Oktober', november:'November', december:'Dezember',
        sunday:'Sonntag', monday:'Montag', tuesday:'Dienstag', wednesday:'Mittwoch',
        thursday:'Donnerstag', friday:'Freitag', saturday:'Samstag',
        sun:'So', mon:'Mo', tue:'Di', wed:'Mi', thu:'Do', fri:'Fr', sat:'Sa',
        jan:'Jan', feb:'Feb', mar:'Mär', apr:'Apr', may2:'Mai', jun:'Jun',
        jul:'Jul', aug:'Aug', sep:'Sep', oct:'Okt', nov:'Nov', dec:'Dez',
        explainEveryMinute:'Läuft jede Minute', explainEveryHour:'Läuft jede Stunde',
        explainAt:'Um', explainEveryN:'Alle', explainMinutes:'Minute(n)', explainHours:'Stunde(n)',
        explainDays:'Tag(e)', explainOn:'am', explainOfMonth:'des', explainWeekday:'Werktage',
        explainWeekend:'Wochenende', explainAnd:','
      },
      fr: {
        title:'Cron Builder',
        minute:'Minute', hour:'Heure', dayOfMonth:'Jour (Mois)', month:'Mois', dayOfWeek:'Jour (Semaine)',
        every:'Chaque', range:'Plage', interval:'Intervalle', specific:'Spécifique',
        minuteInterval:'minute(s)', hourInterval:'heure(s)', dayInterval:'jour(s)',
        day:'jour',
        exprPlaceholder:'Entrez une expression cron (ex: */5 * * * *)',
        nextRuns:'Prochaines exécutions',
        presets:'Modèles', clear:'Effacer',
        save:'Enregistrer', saved:'Enregistrés', noSaved:'Aucune expression enregistrée',
        copied:'Copié!',
        invalidExpr:'Expression cron invalide',
        labelPrompt:'Libellé (optionnel):',
        everyMinute:'Chaque minute', everyHour:'Chaque heure', everyDay:'Chaque jour à minuit',
        everyWeekday:'Chaque jour ouvrable', everyWeekend:'Chaque week-end',
        every5Min:'Toutes les 5 minutes', every15Min:'Toutes les 15 minutes', every30Min:'Toutes les 30 minutes',
        everyMondayMorning:'Chaque lundi à 9h00', everyFirstOfMonth:'Le 1er de chaque mois à minuit',
        everyNoon:'Chaque jour à midi', everyMidnight:'Chaque minuit',
        at:'à', on:'le', and:'et', through:'à',
        inMonth:'en',
        january:'Janvier', february:'Février', march:'Mars', april:'Avril', may:'Mai', june:'Juin',
        july:'Juillet', august:'Août', september:'Septembre', october:'Octobre', november:'Novembre', december:'Décembre',
        sunday:'Dimanche', monday:'Lundi', tuesday:'Mardi', wednesday:'Mercredi',
        thursday:'Jeudi', friday:'Vendredi', saturday:'Samedi',
        sun:'Dim', mon:'Lun', tue:'Mar', wed:'Mer', thu:'Jeu', fri:'Ven', sat:'Sam',
        jan:'Jan', feb:'Fév', mar:'Mar', apr:'Avr', may2:'Mai', jun:'Jui',
        jul:'Jul', aug:'Aoû', sep:'Sep', oct:'Oct', nov:'Nov', dec:'Déc',
        explainEveryMinute:'S\'exécute chaque minute', explainEveryHour:'S\'exécute chaque heure',
        explainAt:'À', explainEveryN:'Toutes les', explainMinutes:'minute(s)', explainHours:'heure(s)',
        explainDays:'jour(s)', explainOn:'le', explainOfMonth:'de', explainWeekday:'jours ouvrables',
        explainWeekend:'week-end', explainAnd:','
      },
      es: {
        title:'Cron Builder',
        minute:'Minuto', hour:'Hora', dayOfMonth:'Día (Mes)', month:'Mes', dayOfWeek:'Día (Semana)',
        every:'Cada', range:'Rango', interval:'Intervalo', specific:'Específico',
        minuteInterval:'minuto(s)', hourInterval:'hora(s)', dayInterval:'día(s)',
        day:'día',
        exprPlaceholder:'Ingrese expresión cron (ej: */5 * * * *)',
        nextRuns:'Próximas ejecuciones',
        presets:'Plantillas', clear:'Limpiar',
        save:'Guardar', saved:'Guardados', noSaved:'Sin expresiones guardadas',
        copied:'¡Copiado!',
        invalidExpr:'Expresión cron inválida',
        labelPrompt:'Etiqueta (opcional):',
        everyMinute:'Cada minuto', everyHour:'Cada hora', everyDay:'Cada día a medianoche',
        everyWeekday:'Cada día laborable', everyWeekend:'Cada fin de semana',
        every5Min:'Cada 5 minutos', every15Min:'Cada 15 minutos', every30Min:'Cada 30 minutos',
        everyMondayMorning:'Cada lunes a las 9:00', everyFirstOfMonth:'El 1° de cada mes a medianoche',
        everyNoon:'Cada día al mediodía', everyMidnight:'Cada medianoche',
        at:'a las', on:'el', and:'y', through:'hasta',
        inMonth:'en',
        january:'Enero', february:'Febrero', march:'Marzo', april:'Abril', may:'Mayo', june:'Junio',
        july:'Julio', august:'Agosto', september:'Septiembre', october:'Octubre', november:'Noviembre', december:'Diciembre',
        sunday:'Domingo', monday:'Lunes', tuesday:'Martes', wednesday:'Miércoles',
        thursday:'Jueves', friday:'Viernes', saturday:'Sábado',
        sun:'Dom', mon:'Lun', tue:'Mar', wed:'Mié', thu:'Jue', fri:'Vie', sat:'Sáb',
        jan:'Ene', feb:'Feb', mar:'Mar', apr:'Abr', may2:'May', jun:'Jun',
        jul:'Jul', aug:'Ago', sep:'Sep', oct:'Oct', nov:'Nov', dec:'Dic',
        explainEveryMinute:'Se ejecuta cada minuto', explainEveryHour:'Se ejecuta cada hora',
        explainAt:'A las', explainEveryN:'Cada', explainMinutes:'minuto(s)', explainHours:'hora(s)',
        explainDays:'día(s)', explainOn:'el', explainOfMonth:'de', explainWeekday:'días laborables',
        explainWeekend:'fines de semana', explainAnd:','
      },
      ru: {
        title:'Cron Builder',
        minute:'Минута', hour:'Час', dayOfMonth:'День (Месяц)', month:'Месяц', dayOfWeek:'День (Неделя)',
        every:'Каждый', range:'Диапазон', interval:'Интервал', specific:'Конкретные',
        minuteInterval:'минут(ы)', hourInterval:'час(ов)', dayInterval:'день(дней)',
        day:'день',
        exprPlaceholder:'Введите cron-выражение (напр: */5 * * * *)',
        nextRuns:'Следующие запуски',
        presets:'Шаблоны', clear:'Очистить',
        save:'Сохранить', saved:'Сохранённые', noSaved:'Нет сохранённых выражений',
        copied:'Скопировано!',
        invalidExpr:'Недопустимое cron-выражение',
        labelPrompt:'Метка (необязательно):',
        everyMinute:'Каждую минуту', everyHour:'Каждый час', everyDay:'Каждый день в полночь',
        everyWeekday:'Каждый рабочий день', everyWeekend:'Каждые выходные',
        every5Min:'Каждые 5 минут', every15Min:'Каждые 15 минут', every30Min:'Каждые 30 минут',
        everyMondayMorning:'Каждый понедельник в 9:00', everyFirstOfMonth:'1-го числа каждого месяца в полночь',
        everyNoon:'Каждый день в полдень', everyMidnight:'Каждую полночь',
        at:'в', on:'в', and:'и', through:'до',
        inMonth:'в',
        january:'Январь', february:'Февраль', march:'Март', april:'Апрель', may:'Май', june:'Июнь',
        july:'Июль', august:'Август', september:'Сентябрь', october:'Октябрь', november:'Ноябрь', december:'Декабрь',
        sunday:'Воскресенье', monday:'Понедельник', tuesday:'Вторник', wednesday:'Среда',
        thursday:'Четверг', friday:'Пятница', saturday:'Суббота',
        sun:'Вс', mon:'Пн', tue:'Вт', wed:'Ср', thu:'Чт', fri:'Пт', sat:'Сб',
        jan:'Янв', feb:'Фев', mar:'Мар', apr:'Апр', may2:'Май', jun:'Июн',
        jul:'Июл', aug:'Авг', sep:'Сен', oct:'Окт', nov:'Ноя', dec:'Дек',
        explainEveryMinute:'Запускается каждую минуту', explainEveryHour:'Запускается каждый час',
        explainAt:'В', explainEveryN:'Каждые', explainMinutes:'минут(ы)', explainHours:'час(ов)',
        explainDays:'день(дней)', explainOn:'числа', explainOfMonth:'месяца', explainWeekday:'будни',
        explainWeekend:'выходные', explainAnd:','
      },
      zh: {
        title:'Cron 构建器',
        minute:'分钟', hour:'小时', dayOfMonth:'日', month:'月', dayOfWeek:'星期',
        every:'每', range:'范围', interval:'间隔', specific:'指定',
        minuteInterval:'分钟', hourInterval:'小时', dayInterval:'天',
        day:'天',
        exprPlaceholder:'输入 cron 表达式（例：*/5 * * * *）',
        nextRuns:'下次运行时间',
        presets:'预设模板', clear:'清除',
        save:'保存', saved:'已保存', noSaved:'暂无保存的表达式',
        copied:'已复制！',
        invalidExpr:'无效的 cron 表达式',
        labelPrompt:'标签（可选）：',
        everyMinute:'每分钟', everyHour:'每小时', everyDay:'每天午夜',
        everyWeekday:'每个工作日', everyWeekend:'每个周末',
        every5Min:'每5分钟', every15Min:'每15分钟', every30Min:'每30分钟',
        everyMondayMorning:'每周一上午9:00', everyFirstOfMonth:'每月1日午夜',
        everyNoon:'每天中午', everyMidnight:'每天午夜',
        at:'在', on:'在', and:'和', through:'到',
        inMonth:'月',
        january:'一月', february:'二月', march:'三月', april:'四月', may:'五月', june:'六月',
        july:'七月', august:'八月', september:'九月', october:'十月', november:'十一月', december:'十二月',
        sunday:'星期日', monday:'星期一', tuesday:'星期二', wednesday:'星期三',
        thursday:'星期四', friday:'星期五', saturday:'星期六',
        sun:'日', mon:'一', tue:'二', wed:'三', thu:'四', fri:'五', sat:'六',
        jan:'1月', feb:'2月', mar:'3月', apr:'4月', may2:'5月', jun:'6月',
        jul:'7月', aug:'8月', sep:'9月', oct:'10月', nov:'11月', dec:'12月',
        explainEveryMinute:'每分钟运行', explainEveryHour:'每小时运行',
        explainAt:'在', explainEveryN:'每', explainMinutes:'分钟', explainHours:'小时',
        explainDays:'天', explainOn:'第', explainOfMonth:'日', explainWeekday:'工作日',
        explainWeekend:'周末', explainAnd:'、'
      },
      ja: {
        title:'Cron ビルダー',
        minute:'分', hour:'時', dayOfMonth:'日', month:'月', dayOfWeek:'曜日',
        every:'毎', range:'範囲', interval:'間隔', specific:'指定',
        minuteInterval:'分ごと', hourInterval:'時間ごと', dayInterval:'日ごと',
        day:'日',
        exprPlaceholder:'cron式を入力（例：*/5 * * * *）',
        nextRuns:'次回実行時刻',
        presets:'プリセット', clear:'クリア',
        save:'保存', saved:'保存済み', noSaved:'保存された式はありません',
        copied:'コピー済み！',
        invalidExpr:'無効なcron式',
        labelPrompt:'ラベル（任意）：',
        everyMinute:'毎分', everyHour:'毎時', everyDay:'毎日深夜0時',
        everyWeekday:'平日毎日', everyWeekend:'毎週末',
        every5Min:'5分ごと', every15Min:'15分ごと', every30Min:'30分ごと',
        everyMondayMorning:'毎週月曜9:00', everyFirstOfMonth:'毎月1日深夜0時',
        everyNoon:'毎日正午', everyMidnight:'毎日深夜0時',
        at:'に', on:'の', and:'と', through:'から',
        inMonth:'月',
        january:'1月', february:'2月', march:'3月', april:'4月', may:'5月', june:'6月',
        july:'7月', august:'8月', september:'9月', october:'10月', november:'11月', december:'12月',
        sunday:'日曜日', monday:'月曜日', tuesday:'火曜日', wednesday:'水曜日',
        thursday:'木曜日', friday:'金曜日', saturday:'土曜日',
        sun:'日', mon:'月', tue:'火', wed:'水', thu:'木', fri:'金', sat:'土',
        jan:'1月', feb:'2月', mar:'3月', apr:'4月', may2:'5月', jun:'6月',
        jul:'7月', aug:'8月', sep:'9月', oct:'10月', nov:'11月', dec:'12月',
        explainEveryMinute:'毎分実行', explainEveryHour:'毎時実行',
        explainAt:'', explainEveryN:'毎', explainMinutes:'分', explainHours:'時間',
        explainDays:'日', explainOn:'日の', explainOfMonth:'月', explainWeekday:'平日',
        explainWeekend:'週末', explainAnd:'、'
      },
      it: {
        title:'Cron Builder',
        minute:'Minuto', hour:'Ora', dayOfMonth:'Giorno (Mese)', month:'Mese', dayOfWeek:'Giorno (Sett.)',
        every:'Ogni', range:'Intervallo', interval:'Intervallo', specific:'Specifico',
        minuteInterval:'minuto/i', hourInterval:'ora/e', dayInterval:'giorno/i',
        day:'giorno',
        exprPlaceholder:'Inserisci espressione cron (es: */5 * * * *)',
        nextRuns:'Prossime esecuzioni',
        presets:'Modelli', clear:'Cancella',
        save:'Salva', saved:'Salvati', noSaved:'Nessuna espressione salvata',
        copied:'Copiato!',
        invalidExpr:'Espressione cron non valida',
        labelPrompt:'Etichetta (opzionale):',
        everyMinute:'Ogni minuto', everyHour:'Ogni ora', everyDay:'Ogni giorno a mezzanotte',
        everyWeekday:'Ogni giorno feriale', everyWeekend:'Ogni fine settimana',
        every5Min:'Ogni 5 minuti', every15Min:'Ogni 15 minuti', every30Min:'Ogni 30 minuti',
        everyMondayMorning:'Ogni lunedì alle 9:00', everyFirstOfMonth:'Il 1° di ogni mese a mezzanotte',
        everyNoon:'Ogni giorno a mezzogiorno', everyMidnight:'Ogni mezzanotte',
        at:'alle', on:'il', and:'e', through:'a',
        inMonth:'in',
        january:'Gennaio', february:'Febbraio', march:'Marzo', april:'Aprile', may:'Maggio', june:'Giugno',
        july:'Luglio', august:'Agosto', september:'Settembre', october:'Ottobre', november:'Novembre', december:'Dicembre',
        sunday:'Domenica', monday:'Lunedì', tuesday:'Martedì', wednesday:'Mercoledì',
        thursday:'Giovedì', friday:'Venerdì', saturday:'Sabato',
        sun:'Dom', mon:'Lun', tue:'Mar', wed:'Mer', thu:'Gio', fri:'Ven', sat:'Sab',
        jan:'Gen', feb:'Feb', mar:'Mar', apr:'Apr', may2:'Mag', jun:'Giu',
        jul:'Lug', aug:'Ago', sep:'Set', oct:'Ott', nov:'Nov', dec:'Dic',
        explainEveryMinute:'Eseguito ogni minuto', explainEveryHour:'Eseguito ogni ora',
        explainAt:'Alle', explainEveryN:'Ogni', explainMinutes:'minuto/i', explainHours:'ora/e',
        explainDays:'giorno/i', explainOn:'il', explainOfMonth:'del', explainWeekday:'giorni feriali',
        explainWeekend:'fine settimana', explainAnd:','
      },
      ar: {
        title:'منشئ Cron',
        minute:'دقيقة', hour:'ساعة', dayOfMonth:'يوم (شهر)', month:'شهر', dayOfWeek:'يوم (أسبوع)',
        every:'كل', range:'نطاق', interval:'فاصل', specific:'محدد',
        minuteInterval:'دقيقة', hourInterval:'ساعة', dayInterval:'يوم',
        day:'يوم',
        exprPlaceholder:'أدخل تعبير cron (مثال: */5 * * * *)',
        nextRuns:'أوقات التشغيل التالية',
        presets:'قوالب', clear:'مسح',
        save:'حفظ', saved:'المحفوظة', noSaved:'لا توجد تعبيرات محفوظة',
        copied:'تم النسخ!',
        invalidExpr:'تعبير cron غير صالح',
        labelPrompt:'تسمية (اختياري):',
        everyMinute:'كل دقيقة', everyHour:'كل ساعة', everyDay:'كل يوم عند منتصف الليل',
        everyWeekday:'كل يوم عمل', everyWeekend:'كل نهاية أسبوع',
        every5Min:'كل 5 دقائق', every15Min:'كل 15 دقيقة', every30Min:'كل 30 دقيقة',
        everyMondayMorning:'كل إثنين الساعة 9:00', everyFirstOfMonth:'أول كل شهر عند منتصف الليل',
        everyNoon:'كل يوم ظهراً', everyMidnight:'كل منتصف ليل',
        at:'في', on:'في', and:'و', through:'إلى',
        inMonth:'في',
        january:'يناير', february:'فبراير', march:'مارس', april:'أبريل', may:'مايو', june:'يونيو',
        july:'يوليو', august:'أغسطس', september:'سبتمبر', october:'أكتوبر', november:'نوفمبر', december:'ديسمبر',
        sunday:'الأحد', monday:'الإثنين', tuesday:'الثلاثاء', wednesday:'الأربعاء',
        thursday:'الخميس', friday:'الجمعة', saturday:'السبت',
        sun:'أحد', mon:'إثن', tue:'ثلا', wed:'أرب', thu:'خمي', fri:'جمع', sat:'سبت',
        jan:'ينا', feb:'فبر', mar:'مار', apr:'أبر', may2:'ماي', jun:'يون',
        jul:'يول', aug:'أغس', sep:'سبت', oct:'أكت', nov:'نوف', dec:'ديس',
        explainEveryMinute:'يعمل كل دقيقة', explainEveryHour:'يعمل كل ساعة',
        explainAt:'في', explainEveryN:'كل', explainMinutes:'دقيقة', explainHours:'ساعة',
        explainDays:'يوم', explainOn:'في', explainOfMonth:'من', explainWeekday:'أيام العمل',
        explainWeekend:'عطلة نهاية الأسبوع', explainAnd:'،'
      },
      ko: {
        title:'Cron 빌더',
        minute:'분', hour:'시', dayOfMonth:'일', month:'월', dayOfWeek:'요일',
        every:'매', range:'범위', interval:'간격', specific:'특정',
        minuteInterval:'분마다', hourInterval:'시간마다', dayInterval:'일마다',
        day:'일',
        exprPlaceholder:'cron 표현식 입력 (예: */5 * * * *)',
        nextRuns:'다음 실행 시간',
        presets:'프리셋', clear:'지우기',
        save:'저장', saved:'저장됨', noSaved:'저장된 표현식이 없습니다',
        copied:'복사됨!',
        invalidExpr:'유효하지 않은 cron 표현식',
        labelPrompt:'레이블 (선택):',
        everyMinute:'매분', everyHour:'매시', everyDay:'매일 자정',
        everyWeekday:'평일마다', everyWeekend:'주말마다',
        every5Min:'5분마다', every15Min:'15분마다', every30Min:'30분마다',
        everyMondayMorning:'매주 월요일 오전 9:00', everyFirstOfMonth:'매월 1일 자정',
        everyNoon:'매일 정오', everyMidnight:'매일 자정',
        at:'에', on:'에', and:'와', through:'부터',
        inMonth:'월',
        january:'1월', february:'2월', march:'3월', april:'4월', may:'5월', june:'6월',
        july:'7월', august:'8월', september:'9월', october:'10월', november:'11월', december:'12월',
        sunday:'일요일', monday:'월요일', tuesday:'화요일', wednesday:'수요일',
        thursday:'목요일', friday:'금요일', saturday:'토요일',
        sun:'일', mon:'월', tue:'화', wed:'수', thu:'목', fri:'금', sat:'토',
        jan:'1월', feb:'2월', mar:'3월', apr:'4월', may2:'5월', jun:'6월',
        jul:'7월', aug:'8월', sep:'9월', oct:'10월', nov:'11월', dec:'12월',
        explainEveryMinute:'매분 실행', explainEveryHour:'매시 실행',
        explainAt:'', explainEveryN:'매', explainMinutes:'분', explainHours:'시간',
        explainDays:'일', explainOn:'일', explainOfMonth:'월', explainWeekday:'평일',
        explainWeekend:'주말', explainAnd:','
      },
      hi: {
        title:'Cron बिल्डर',
        minute:'मिनट', hour:'घंटा', dayOfMonth:'दिन (महीना)', month:'महीना', dayOfWeek:'दिन (सप्ताह)',
        every:'हर', range:'सीमा', interval:'अंतराल', specific:'विशेष',
        minuteInterval:'मिनट', hourInterval:'घंटे', dayInterval:'दिन',
        day:'दिन',
        exprPlaceholder:'cron अभिव्यक्ति दर्ज करें (उदा: */5 * * * *)',
        nextRuns:'अगले चलने का समय',
        presets:'प्रीसेट', clear:'साफ़ करें',
        save:'सहेजें', saved:'सहेजे गए', noSaved:'कोई सहेजी गई अभिव्यक्ति नहीं',
        copied:'कॉपी किया!',
        invalidExpr:'अमान्य cron अभिव्यक्ति',
        labelPrompt:'लेबल (वैकल्पिक):',
        everyMinute:'हर मिनट', everyHour:'हर घंटे', everyDay:'हर दिन आधी रात',
        everyWeekday:'हर कार्यदिवस', everyWeekend:'हर सप्ताहांत',
        every5Min:'हर 5 मिनट', every15Min:'हर 15 मिनट', every30Min:'हर 30 मिनट',
        everyMondayMorning:'हर सोमवार सुबह 9:00', everyFirstOfMonth:'हर महीने की 1 तारीख आधी रात',
        everyNoon:'हर दिन दोपहर', everyMidnight:'हर आधी रात',
        at:'बजे', on:'पर', and:'और', through:'से',
        inMonth:'में',
        january:'जनवरी', february:'फरवरी', march:'मार्च', april:'अप्रैल', may:'मई', june:'जून',
        july:'जुलाई', august:'अगस्त', september:'सितंबर', october:'अक्तूबर', november:'नवंबर', december:'दिसंबर',
        sunday:'रविवार', monday:'सोमवार', tuesday:'मंगलवार', wednesday:'बुधवार',
        thursday:'गुरुवार', friday:'शुक्रवार', saturday:'शनिवार',
        sun:'रवि', mon:'सोम', tue:'मंगल', wed:'बुध', thu:'गुरु', fri:'शुक्र', sat:'शनि',
        jan:'जन', feb:'फर', mar:'मार', apr:'अप्रै', may2:'मई', jun:'जून',
        jul:'जुल', aug:'अग', sep:'सित', oct:'अक्तू', nov:'नव', dec:'दिस',
        explainEveryMinute:'हर मिनट चलता है', explainEveryHour:'हर घंटे चलता है',
        explainAt:'', explainEveryN:'हर', explainMinutes:'मिनट', explainHours:'घंटे',
        explainDays:'दिन', explainOn:'तारीख', explainOfMonth:'महीने', explainWeekday:'कार्यदिवस',
        explainWeekend:'सप्ताहांत', explainAnd:','
      },
      pt: {
        title:'Cron Builder',
        minute:'Minuto', hour:'Hora', dayOfMonth:'Dia (Mês)', month:'Mês', dayOfWeek:'Dia (Semana)',
        every:'Cada', range:'Faixa', interval:'Intervalo', specific:'Específico',
        minuteInterval:'minuto(s)', hourInterval:'hora(s)', dayInterval:'dia(s)',
        day:'dia',
        exprPlaceholder:'Insira expressão cron (ex: */5 * * * *)',
        nextRuns:'Próximas execuções',
        presets:'Modelos', clear:'Limpar',
        save:'Salvar', saved:'Salvos', noSaved:'Nenhuma expressão salva',
        copied:'Copiado!',
        invalidExpr:'Expressão cron inválida',
        labelPrompt:'Rótulo (opcional):',
        everyMinute:'A cada minuto', everyHour:'A cada hora', everyDay:'Todo dia à meia-noite',
        everyWeekday:'Dias úteis', everyWeekend:'Todo fim de semana',
        every5Min:'A cada 5 minutos', every15Min:'A cada 15 minutos', every30Min:'A cada 30 minutos',
        everyMondayMorning:'Toda segunda às 9:00', everyFirstOfMonth:'Dia 1° de cada mês à meia-noite',
        everyNoon:'Todo dia ao meio-dia', everyMidnight:'Toda meia-noite',
        at:'às', on:'no', and:'e', through:'até',
        inMonth:'em',
        january:'Janeiro', february:'Fevereiro', march:'Março', april:'Abril', may:'Maio', june:'Junho',
        july:'Julho', august:'Agosto', september:'Setembro', october:'Outubro', november:'Novembro', december:'Dezembro',
        sunday:'Domingo', monday:'Segunda', tuesday:'Terça', wednesday:'Quarta',
        thursday:'Quinta', friday:'Sexta', saturday:'Sábado',
        sun:'Dom', mon:'Seg', tue:'Ter', wed:'Qua', thu:'Qui', fri:'Sex', sat:'Sáb',
        jan:'Jan', feb:'Fev', mar:'Mar', apr:'Abr', may2:'Mai', jun:'Jun',
        jul:'Jul', aug:'Ago', sep:'Set', oct:'Out', nov:'Nov', dec:'Dez',
        explainEveryMinute:'Executa a cada minuto', explainEveryHour:'Executa a cada hora',
        explainAt:'Às', explainEveryN:'A cada', explainMinutes:'minuto(s)', explainHours:'hora(s)',
        explainDays:'dia(s)', explainOn:'no dia', explainOfMonth:'de', explainWeekday:'dias úteis',
        explainWeekend:'fim de semana', explainAnd:','
      }
    };

    function getLocale() { return localStorage.getItem('sys_locale') || 'tr'; }
    var locale = ref(getLocale());
    function L(k) { return (LANGS[locale.value] && LANGS[locale.value][k]) || LANGS.en[k] || k; }
    function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

    function getToken() { return localStorage.getItem('auth_token'); }
    function authHeaders() { return { Authorization: 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }

    /* ── Month / Day names ── */
    const monthNames = computed(function() {
      return [L('jan'), L('feb'), L('mar'), L('apr'), L('may2'), L('jun'),
              L('jul'), L('aug'), L('sep'), L('oct'), L('nov'), L('dec')];
    });
    const dayNames = computed(function() {
      return [L('sun'), L('mon'), L('tue'), L('wed'), L('thu'), L('fri'), L('sat')];
    });
    const monthFullNames = computed(function() {
      return [L('january'), L('february'), L('march'), L('april'), L('may'), L('june'),
              L('july'), L('august'), L('september'), L('october'), L('november'), L('december')];
    });
    const dayFullNames = computed(function() {
      return [L('sunday'), L('monday'), L('tuesday'), L('wednesday'),
              L('thursday'), L('friday'), L('saturday')];
    });

    /* ── State ── */
    var cronExpression = ref('* * * * *');
    var explanation = ref('');
    var errorMsg = ref('');
    var copiedFlag = ref(false);
    var activeTab = ref('minute');
    var showPresets = ref(false);
    var savedExpressions = ref([]);

    var fields = reactive({
      minute: { type: 'every', rangeStart: 0, rangeEnd: 30, interval: 5, selected: [] },
      hour:   { type: 'every', rangeStart: 0, rangeEnd: 12, interval: 2, selected: [] },
      dom:    { type: 'every', rangeStart: 1, rangeEnd: 15, interval: 1, selected: [] },
      month:  { type: 'every', rangeStart: 1, rangeEnd: 6, interval: 1, selected: [] },
      dow:    { type: 'every', rangeStart: 1, rangeEnd: 5, interval: 1, selected: [] }
    });

    /* ── Build cron expression from visual builder ── */
    function buildFieldPart(field, minVal) {
      if (field.type === 'every') return '*';
      if (field.type === 'range') return field.rangeStart + '-' + field.rangeEnd;
      if (field.type === 'interval') return '*/' + field.interval;
      if (field.type === 'specific') {
        if (field.selected.length === 0) return '*';
        var sorted = field.selected.slice().sort(function(a,b){ return a - b; });
        return sorted.join(',');
      }
      return '*';
    }

    function buildExpression() {
      var parts = [
        buildFieldPart(fields.minute, 0),
        buildFieldPart(fields.hour, 0),
        buildFieldPart(fields.dom, 1),
        buildFieldPart(fields.month, 1),
        buildFieldPart(fields.dow, 0)
      ];
      cronExpression.value = parts.join(' ');
      explainExpression();
      computeNextRuns();
    }

    /* ── Parse cron expression into visual builder ── */
    function parseFieldPart(part, field, minVal) {
      if (part === '*') {
        field.type = 'every';
      } else if (part.indexOf('/') > -1) {
        field.type = 'interval';
        field.interval = parseInt(part.split('/')[1]) || 1;
      } else if (part.indexOf('-') > -1) {
        field.type = 'range';
        var rr = part.split('-');
        field.rangeStart = parseInt(rr[0]) || minVal;
        field.rangeEnd = parseInt(rr[1]) || minVal;
      } else if (part.indexOf(',') > -1) {
        field.type = 'specific';
        field.selected = part.split(',').map(function(v){ return parseInt(v); }).filter(function(v){ return !isNaN(v); });
      } else {
        var num = parseInt(part);
        if (!isNaN(num)) {
          field.type = 'specific';
          field.selected = [num];
        } else {
          field.type = 'every';
        }
      }
    }

    function parseExpression(expr) {
      var parts = expr.trim().split(/\s+/);
      if (parts.length !== 5) return false;
      parseFieldPart(parts[0], fields.minute, 0);
      parseFieldPart(parts[1], fields.hour, 0);
      parseFieldPart(parts[2], fields.dom, 1);
      parseFieldPart(parts[3], fields.month, 1);
      parseFieldPart(parts[4], fields.dow, 0);
      return true;
    }

    /* ── Explain cron expression ── */
    function explainExpression() {
      errorMsg.value = '';
      explanation.value = '';
      var parts = cronExpression.value.trim().split(/\s+/);
      if (parts.length !== 5) {
        errorMsg.value = L('invalidExpr');
        return;
      }

      // Validate each part
      if (!validateCronPart(parts[0], 0, 59) ||
          !validateCronPart(parts[1], 0, 23) ||
          !validateCronPart(parts[2], 1, 31) ||
          !validateCronPart(parts[3], 1, 12) ||
          !validateCronPart(parts[4], 0, 7)) {
        errorMsg.value = L('invalidExpr');
        return;
      }

      var desc = buildDescription(parts);
      explanation.value = desc;
    }

    function validateCronPart(part, min, max) {
      if (part === '*') return true;
      // Handle */N
      if (/^\*\/\d+$/.test(part)) {
        var n = parseInt(part.split('/')[1]);
        return n >= 1 && n <= max;
      }
      // Handle ranges: N-M
      if (/^\d+-\d+$/.test(part)) {
        var rr = part.split('-');
        var a = parseInt(rr[0]), b = parseInt(rr[1]);
        return a >= min && a <= max && b >= min && b <= max;
      }
      // Handle lists: N,N,N
      if (/^[\d,]+$/.test(part)) {
        var nums = part.split(',').map(Number);
        return nums.every(function(n) { return n >= min && n <= max; });
      }
      // Single number
      if (/^\d+$/.test(part)) {
        var v = parseInt(part);
        return v >= min && v <= max;
      }
      return false;
    }

    function buildDescription(parts) {
      var min = parts[0], hr = parts[1], dom = parts[2], mon = parts[3], dow = parts[4];
      var segments = [];

      // Special common patterns
      if (min === '*' && hr === '*' && dom === '*' && mon === '*' && dow === '*') {
        return L('explainEveryMinute');
      }
      if (min === '0' && hr === '*' && dom === '*' && mon === '*' && dow === '*') {
        return L('explainEveryHour');
      }

      // Minute
      if (min === '*') {
        segments.push(L('explainEveryMinute'));
      } else if (min.indexOf('/') > -1) {
        segments.push(L('explainEveryN') + ' ' + min.split('/')[1] + ' ' + L('explainMinutes'));
      } else {
        segments.push(L('explainAt') + ' ' + formatTimeComponent(min, hr));
      }

      // Hour (only if not already covered)
      if (min !== '*' && hr !== '*') {
        if (hr.indexOf('/') > -1) {
          segments.push(L('explainEveryN') + ' ' + hr.split('/')[1] + ' ' + L('explainHours'));
        }
      } else if (min === '*' && hr !== '*') {
        if (hr.indexOf('/') > -1) {
          segments.push(L('explainEveryN') + ' ' + hr.split('/')[1] + ' ' + L('explainHours'));
        } else {
          segments.push(L('explainAt') + ' ' + hr + ':xx');
        }
      }

      // DOM
      if (dom !== '*') {
        if (dom.indexOf('/') > -1) {
          segments.push(L('explainEveryN') + ' ' + dom.split('/')[1] + ' ' + L('explainDays'));
        } else {
          segments.push(L('explainOn') + ' ' + dom);
        }
      }

      // Month
      if (mon !== '*') {
        if (mon.indexOf(',') > -1) {
          var mNames = mon.split(',').map(function(m) {
            var idx = parseInt(m) - 1;
            return monthFullNames.value[idx] || m;
          });
          segments.push(L('inMonth') + ' ' + mNames.join(L('explainAnd') + ' '));
        } else if (mon.indexOf('-') > -1) {
          var mrr = mon.split('-');
          segments.push(monthFullNames.value[parseInt(mrr[0])-1] + ' ' + L('through') + ' ' + monthFullNames.value[parseInt(mrr[1])-1]);
        } else {
          segments.push(L('inMonth') + ' ' + (monthFullNames.value[parseInt(mon)-1] || mon));
        }
      }

      // DOW
      if (dow !== '*') {
        if (dow === '1-5') {
          segments.push(L('explainWeekday'));
        } else if (dow === '0,6' || dow === '6,0') {
          segments.push(L('explainWeekend'));
        } else if (dow.indexOf(',') > -1) {
          var dNames = dow.split(',').map(function(d) {
            return dayFullNames.value[parseInt(d)] || d;
          });
          segments.push(L('on') + ' ' + dNames.join(L('explainAnd') + ' '));
        } else if (dow.indexOf('-') > -1) {
          var drr = dow.split('-');
          segments.push(dayFullNames.value[parseInt(drr[0])] + ' ' + L('through') + ' ' + dayFullNames.value[parseInt(drr[1])]);
        } else {
          segments.push(L('on') + ' ' + (dayFullNames.value[parseInt(dow)] || dow));
        }
      }

      return segments.join(', ');
    }

    function formatTimeComponent(min, hr) {
      if (hr === '*') return 'xx:' + padTime(min);
      // Handle lists
      var hours = hr.indexOf(',') > -1 ? hr.split(',') : [hr];
      var minutes = min.indexOf(',') > -1 ? min.split(',') : [min];
      var times = [];
      for (var h = 0; h < hours.length; h++) {
        for (var m = 0; m < minutes.length; m++) {
          times.push(padTime(hours[h]) + ':' + padTime(minutes[m]));
        }
      }
      return times.join(L('explainAnd') + ' ');
    }

    function padTime(v) {
      var s = String(v);
      return s.length < 2 ? '0' + s : s;
    }

    /* ── Compute next N run times ── */
    var nextRuns = ref([]);
    function computeNextRuns() {
      nextRuns.value = [];
      var parts = cronExpression.value.trim().split(/\s+/);
      if (parts.length !== 5) return;

      var now = new Date();
      var results = [];
      var dt = new Date(now.getTime());
      dt.setSeconds(0, 0);
      dt.setMinutes(dt.getMinutes() + 1);

      var maxIter = 525600; // max 1 year of minutes
      for (var i = 0; i < maxIter && results.length < 5; i++) {
        if (matchesCron(dt, parts)) {
          results.push(formatDate(dt));
        }
        dt = new Date(dt.getTime() + 60000);
      }
      nextRuns.value = results;
    }

    function matchesCron(dt, parts) {
      var min = dt.getMinutes();
      var hr = dt.getHours();
      var dom = dt.getDate();
      var mon = dt.getMonth() + 1;
      var dow = dt.getDay();

      return matchField(min, parts[0], 0, 59) &&
             matchField(hr, parts[1], 0, 23) &&
             matchField(dom, parts[2], 1, 31) &&
             matchField(mon, parts[3], 1, 12) &&
             matchField(dow, parts[4], 0, 7);
    }

    function matchField(value, field, min, max) {
      if (field === '*') return true;
      // */N
      if (field.indexOf('/') > -1) {
        var pp = field.split('/');
        var step = parseInt(pp[1]);
        var base = pp[0] === '*' ? min : parseInt(pp[0]);
        if (step <= 0) return false;
        return (value - base) >= 0 && (value - base) % step === 0;
      }
      // N-M
      if (field.indexOf('-') > -1) {
        var rr = field.split('-');
        var a = parseInt(rr[0]), b = parseInt(rr[1]);
        return value >= a && value <= b;
      }
      // N,N,N
      if (field.indexOf(',') > -1) {
        var vals = field.split(',').map(Number);
        // DOW: treat 7 as 0 (Sunday)
        if (max === 7) {
          return vals.some(function(v) { return v === value || (v === 7 && value === 0) || (v === 0 && value === 7); });
        }
        return vals.indexOf(value) > -1;
      }
      // Single number
      var numVal = parseInt(field);
      if (max === 7) {
        return numVal === value || (numVal === 7 && value === 0);
      }
      return numVal === value;
    }

    function formatDate(dt) {
      var days = dayFullNames.value;
      var months = monthFullNames.value;
      return days[dt.getDay()] + ', ' + dt.getDate() + ' ' + months[dt.getMonth()] + ' ' +
             dt.getFullYear() + ' ' + padTime(dt.getHours()) + ':' + padTime(dt.getMinutes());
    }

    /* ── Expression input handler ── */
    function onExpressionInput() {
      parseExpression(cronExpression.value);
      explainExpression();
      computeNextRuns();
    }

    /* ── Copy ── */
    async function copyExpression() {
      if (!cronExpression.value) return;
      try {
        await navigator.clipboard.writeText(cronExpression.value);
        copiedFlag.value = true;
        ElMessage.success(L('copied'));
        setTimeout(function() { copiedFlag.value = false; }, 1500);
      } catch(e) {}
    }

    /* ── Presets ── */
    var presets = computed(function() {
      return [
        { expr: '* * * * *', desc: L('everyMinute') },
        { expr: '0 * * * *', desc: L('everyHour') },
        { expr: '0 0 * * *', desc: L('everyMidnight') },
        { expr: '0 12 * * *', desc: L('everyNoon') },
        { expr: '*/5 * * * *', desc: L('every5Min') },
        { expr: '*/15 * * * *', desc: L('every15Min') },
        { expr: '*/30 * * * *', desc: L('every30Min') },
        { expr: '0 9 * * 1', desc: L('everyMondayMorning') },
        { expr: '0 0 1 * *', desc: L('everyFirstOfMonth') },
        { expr: '0 9 * * 1-5', desc: L('everyWeekday') },
        { expr: '0 10 * * 0,6', desc: L('everyWeekend') }
      ];
    });

    function loadPresets() { showPresets.value = true; }
    function applyPreset(p) {
      cronExpression.value = p.expr;
      parseExpression(p.expr);
      explainExpression();
      computeNextRuns();
      showPresets.value = false;
    }

    /* ── Save / Load expressions (server-side) ── */
    async function loadSaved() {
      try {
        var res = await fetch('/api/cron-builder/expressions', { headers: authHeaders() });
        if (res.ok) {
          var data = await res.json();
          savedExpressions.value = Array.isArray(data.expressions) ? data.expressions : [];
        }
      } catch(e) {}
    }

    async function saveSaved() {
      try {
        await fetch('/api/cron-builder/expressions', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ expressions: savedExpressions.value })
        });
      } catch(e) {}
    }

    function saveExpression() {
      if (!cronExpression.value) return;
      var label = prompt(L('labelPrompt'));
      savedExpressions.value.push({
        expression: cronExpression.value,
        label: label || '',
        explanation: explanation.value,
        createdAt: new Date().toISOString()
      });
      saveSaved();
    }

    function loadSavedExpression(s) {
      cronExpression.value = s.expression;
      parseExpression(s.expression);
      explainExpression();
      computeNextRuns();
    }

    function removeSavedExpression(idx) {
      savedExpressions.value.splice(idx, 1);
      saveSaved();
    }

    function clearAll() {
      cronExpression.value = '* * * * *';
      fields.minute.type = 'every'; fields.minute.selected = [];
      fields.hour.type = 'every'; fields.hour.selected = [];
      fields.dom.type = 'every'; fields.dom.selected = [];
      fields.month.type = 'every'; fields.month.selected = [];
      fields.dow.type = 'every'; fields.dow.selected = [];
      explainExpression();
      computeNextRuns();
    }

    /* ── Lifecycle ── */
    onMounted(function() {
      window.addEventListener('locale-changed', onLocaleChanged);
      explainExpression();
      computeNextRuns();
      loadSaved();
    });

    onUnmounted(function() {
      window.removeEventListener('locale-changed', onLocaleChanged);
    });

    return {
      L, locale,
      cronExpression, explanation, errorMsg, copiedFlag,
      activeTab, fields, showPresets, presets,
      monthNames, dayNames,
      nextRuns, savedExpressions,
      buildExpression, onExpressionInput, copyExpression,
      loadPresets, applyPreset, clearAll,
      saveExpression, loadSavedExpression, removeSavedExpression
    };
  }
})
