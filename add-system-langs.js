/**
 * Add ar, ko, hi, pt languages to index.html, mobile.html, setup.html
 * Handles: I18N main, Extended I18N, Reminder, Screenshot, WMO_DESC_I18N, EP_LOCALES, LANG_OPTIONS, LOCALE_MAP
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

// =======================================================
// HELPER: Insert text after a matched line
// =======================================================
function insertAfter(content, marker, insertion) {
  const idx = content.indexOf(marker);
  if (idx === -1) { console.log('  WARN: marker not found: ' + marker.substring(0, 60)); return content; }
  const end = idx + marker.length;
  return content.substring(0, end) + insertion + content.substring(end);
}

function insertBefore(content, marker, insertion) {
  const idx = content.indexOf(marker);
  if (idx === -1) { console.log('  WARN: marker not found: ' + marker.substring(0, 60)); return content; }
  return content.substring(0, idx) + insertion + content.substring(idx);
}

// =======================================================
// 1. SETUP.HTML - Add new languages to LANGS object
// =======================================================
function updateSetupHtml() {
  console.log('\n=== SETUP.HTML ===');
  let content = fs.readFileSync(path.join(ROOT, 'setup.html'), 'utf8');

  // Check if already added
  if (content.includes("ar: { flag:'🇸🇦'")) {
    console.log('  Already has ar, skipping');
    return;
  }

  const newLangs = `,
  ar: { flag:'🇸🇦', label:'العربية', subtitle:'أكمل الإعداد الأولي', langTitle:'اختر اللغة',
    userTitle:'حساب المسؤول', username:'اسم المستخدم', password:'كلمة المرور', passwordConfirm:'تأكيد كلمة المرور',
    locTitle:'إعدادات الموقع', country:'الدولة', city:'المدينة', back:'رجوع', next:'التالي', finish:'إكمال الإعداد',
    finishing:'جاري الإعداد...', errRequired:'جميع الحقول مطلوبة', errPasswordMatch:'كلمتا المرور غير متطابقتين',
    errPasswordMin:'كلمة المرور يجب أن تكون 4 أحرف على الأقل', errUsername:'اسم المستخدم يجب أن يكون 3 أحرف على الأقل',
    errUsernameChars:'اسم المستخدم يمكن أن يحتوي فقط على حروف وأرقام و _ و -',
    selectCountry:'اختر الدولة', selectCity:'اختر المدينة' },
  ko: { flag:'🇰🇷', label:'한국어', subtitle:'초기 설정을 완료하세요', langTitle:'언어 선택',
    userTitle:'관리자 계정', username:'사용자 이름', password:'비밀번호', passwordConfirm:'비밀번호 확인',
    locTitle:'위치 설정', country:'국가', city:'도시', back:'뒤로', next:'다음', finish:'설정 완료',
    finishing:'설정 중...', errRequired:'모든 필드를 입력해야 합니다', errPasswordMatch:'비밀번호가 일치하지 않습니다',
    errPasswordMin:'비밀번호는 최소 4자 이상이어야 합니다', errUsername:'사용자 이름은 최소 3자 이상이어야 합니다',
    errUsernameChars:'사용자 이름은 문자, 숫자, _, -만 사용할 수 있습니다',
    selectCountry:'국가 선택', selectCity:'도시 선택' },
  hi: { flag:'🇮🇳', label:'हिन्दी', subtitle:'प्रारंभिक सेटअप पूरा करें', langTitle:'भाषा चुनें',
    userTitle:'व्यवस्थापक खाता', username:'उपयोगकर्ता नाम', password:'पासवर्ड', passwordConfirm:'पासवर्ड की पुष्टि',
    locTitle:'स्थान सेटिंग्स', country:'देश', city:'शहर', back:'पीछे', next:'अगला', finish:'सेटअप पूरा करें',
    finishing:'सेटअप हो रहा है...', errRequired:'सभी फ़ील्ड आवश्यक हैं', errPasswordMatch:'पासवर्ड मेल नहीं खाते',
    errPasswordMin:'पासवर्ड कम से कम 4 अक्षर का होना चाहिए', errUsername:'उपयोगकर्ता नाम कम से कम 3 अक्षर का होना चाहिए',
    errUsernameChars:'उपयोगकर्ता नाम में केवल अक्षर, अंक, _ और - हो सकते हैं',
    selectCountry:'देश चुनें', selectCity:'शहर चुनें' },
  pt: { flag:'🇧🇷', label:'Português', subtitle:'Complete a configuração inicial', langTitle:'Selecionar Idioma',
    userTitle:'Conta de Administrador', username:'Nome de usuário', password:'Senha', passwordConfirm:'Confirmar Senha',
    locTitle:'Configurações de Localização', country:'País', city:'Cidade', back:'Voltar', next:'Próximo', finish:'Concluir Configuração',
    finishing:'Configurando...', errRequired:'Todos os campos são obrigatórios', errPasswordMatch:'As senhas não coincidem',
    errPasswordMin:'A senha deve ter pelo menos 4 caracteres', errUsername:'O nome de usuário deve ter pelo menos 3 caracteres',
    errUsernameChars:'O nome de usuário só pode conter letras, números, _ e -',
    selectCountry:'Selecionar país', selectCity:'Selecionar cidade' }`;

  // Insert before the closing }; of LANGS
  // Find the it: { ... } block end, which is the last entry
  const marker = "selectCountry:'Seleziona paese', selectCity:'Seleziona città' }";
  content = insertAfter(content, marker, newLangs);

  // Add lang buttons in HTML (look for Italian button pattern)
  const itBtnMarker = `<button class="lang-btn" data-lang="it" onclick="selectLang('it')">🇮🇹 Italiano</button>`;
  if (content.includes(itBtnMarker)) {
    const newButtons = `
          <button class="lang-btn" data-lang="ar" onclick="selectLang('ar')">🇸🇦 العربية</button>
          <button class="lang-btn" data-lang="ko" onclick="selectLang('ko')">🇰🇷 한국어</button>
          <button class="lang-btn" data-lang="hi" onclick="selectLang('hi')">🇮🇳 हिन्दी</button>
          <button class="lang-btn" data-lang="pt" onclick="selectLang('pt')">🇧🇷 Português</button>`;
    content = insertAfter(content, itBtnMarker, newButtons);
  }

  fs.writeFileSync(path.join(ROOT, 'setup.html'), content, 'utf8');
  console.log('  Updated setup.html');
}

// =======================================================
// 2. INDEX.HTML - Full I18N + Extended + WMO + EP + LANG_OPTIONS + LOCALE_MAP
// =======================================================
function updateIndexHtml() {
  console.log('\n=== INDEX.HTML ===');
  let content = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

  if (content.includes("I18N.ar,") || content.includes("I18N_AR")) {
    console.log('  Already has ar, skipping');
    return;
  }

  // ── 2a. Main I18N block ──
  // Insert after the it: { ... } block (last entry before closing })
  const itMainEnd = `magTrayShow: 'Mostra lente', magTrayToggle: 'Icona lente', magTrayToggleDesc: 'Mostra icona della lente di ingrandimento nella barra delle applicazioni'
  }
};`;

  const newMainI18N = `
const I18N_AR = {
    apps: 'التطبيقات', user: 'المستخدم', loading: 'جاري التحميل...', search: 'بحث...',
    calc: 'الآلة الحاسبة', notepad: 'المفكرة', fileman: 'مدير الملفات',
    todo: 'قائمة المهام', weather: 'الطقس', settings: 'الإعدادات',
    terminal: 'الطرفية', clock: 'الساعة', calendar: 'التقويم',
    notifications: 'الإشعارات', appstore: 'متجر التطبيقات', browser: 'المتصفح',
    screenkeyboard: 'لوحة المفاتيح', skbCopy: 'نسخ', skbClear: 'مسح', skbTrayShow: 'إظهار لوحة المفاتيح',
    mute: 'كتم', unmute: 'إلغاء الكتم',
    settingsDisplay: 'العرض', settingsLocation: 'الموقع', settingsSound: 'الصوت',
    settingsNetwork: 'الشبكة', settingsAbout: 'حول', settingsLanguage: 'اللغة',
    brightness: 'السطوع', brightnessDesc: 'ضبط سطوع الشاشة',
    darkMode: 'الوضع الداكن', darkModeDesc: 'استخدام السمة الداكنة',
    resolution: 'الدقة', mainVolume: 'مستوى الصوت الرئيسي', systemSound: 'صوت النظام',
    notifSound: 'صوت الإشعار', wifi: 'واي فاي', wifiDesc: 'اتصال الشبكة اللاسلكية',
    bluetooth: 'بلوتوث', vpn: 'VPN', vpnDesc: 'نفق الشبكة الخاصة',
    version: 'الإصدار', checkUpdates: 'التحقق من التحديثات',
    country: 'الدولة', countryDesc: 'للطقس والمنطقة الزمنية',
    city: 'المدينة', cityListing: 'مدينة مدرجة', timezone: 'المنطقة الزمنية',
    timezoneAuto: 'تلقائي', location: 'الموقع', locationSaved: 'تم الحفظ',
    selectPlaceholder: 'اختر...', language: 'اللغة', languageDesc: 'لغة الواجهة',
    notifTitle: 'الإشعارات', noNotifications: 'لا توجد إشعارات 🎉',
    markAllRead: 'تحديد الكل كمقروء', testNotifPlaceholder: 'إضافة إشعار تجريبي...',
    send: 'إرسال', openApp: 'فتح التطبيق',
    storeTitle: 'متجر التطبيقات', appsAvailable: 'تطبيق متاح',
    internal: 'داخلي', external: 'خارجي', service: 'خدمة', install: 'تثبيت', uninstall: 'إزالة', storeSearch: 'بحث في التطبيقات...', storeNoResults: 'لم يتم العثور على نتائج',
    volMute: '🔇 كتم', volUnmute: '🔈 إلغاء الكتم',
    settingsWallpaper: 'خلفية الشاشة', wpMode: 'الوضع', wpModeDesc: 'نفس الخلفية لجميع أسطح المكتب أو مختلفة لكل واحد',
    wpAll: 'نفسها للجميع', wpPer: 'لكل سطح مكتب', wpDesktopSelect: 'اختر سطح المكتب',
    wpUpload: 'رفع صورة', wpUploadBtn: 'رفع', wpGallery: 'الخلفيات',
    wpUploading: 'جاري الرفع...', wpDefault: 'افتراضي',
    settingsSession: 'الجلسة', restoreApps: 'استعادة التطبيقات', restoreAppsDesc: 'إعادة فتح التطبيقات بعد تحديث الصفحة',
    skbTrayToggle: 'أيقونة لوحة المفاتيح', skbTrayToggleDesc: 'إظهار أيقونة لوحة المفاتيح في شريط المهام',
    magTrayShow: 'إظهار المكبر', magTrayToggle: 'أيقونة المكبر', magTrayToggleDesc: 'إظهار أيقونة المكبر في شريط المهام'
};
const I18N_KO = {
    apps: '애플리케이션', user: '사용자', loading: '로딩 중...', search: '검색...',
    calc: '계산기', notepad: '메모장', fileman: '파일 관리자',
    todo: '할 일 목록', weather: '날씨', settings: '설정',
    terminal: '터미널', clock: '시계', calendar: '달력',
    notifications: '알림', appstore: '앱 스토어', browser: '브라우저',
    screenkeyboard: '화면 키보드', skbCopy: '복사', skbClear: '지우기', skbTrayShow: '화면 키보드 표시',
    mute: '음소거', unmute: '음소거 해제',
    settingsDisplay: '디스플레이', settingsLocation: '위치', settingsSound: '소리',
    settingsNetwork: '네트워크', settingsAbout: '정보', settingsLanguage: '언어',
    brightness: '밝기', brightnessDesc: '화면 밝기 조절',
    darkMode: '다크 모드', darkModeDesc: '다크 테마 사용',
    resolution: '해상도', mainVolume: '기본 볼륨', systemSound: '시스템 소리',
    notifSound: '알림 소리', wifi: 'Wi-Fi', wifiDesc: '무선 네트워크 연결',
    bluetooth: '블루투스', vpn: 'VPN', vpnDesc: '사설 네트워크 터널',
    version: '버전', checkUpdates: '업데이트 확인',
    country: '국가', countryDesc: '날씨 및 시간대용',
    city: '도시', cityListing: '개 도시 표시', timezone: '시간대',
    timezoneAuto: '자동', location: '위치', locationSaved: '저장됨',
    selectPlaceholder: '선택...', language: '언어', languageDesc: '인터페이스 언어',
    notifTitle: '알림', noNotifications: '알림 없음 🎉',
    markAllRead: '모두 읽음으로 표시', testNotifPlaceholder: '테스트 알림 추가...',
    send: '보내기', openApp: '앱 열기',
    storeTitle: '앱 스토어', appsAvailable: '개 앱 사용 가능',
    internal: '내장', external: '외부', service: '서비스', install: '설치', uninstall: '제거', storeSearch: '앱 검색...', storeNoResults: '결과 없음',
    volMute: '🔇 음소거', volUnmute: '🔈 음소거 해제',
    settingsWallpaper: '배경화면', wpMode: '모드', wpModeDesc: '모든 데스크톱에 같은 배경 또는 각각 다르게 설정',
    wpAll: '모두 동일', wpPer: '데스크톱별', wpDesktopSelect: '데스크톱 선택',
    wpUpload: '이미지 업로드', wpUploadBtn: '업로드', wpGallery: '배경화면',
    wpUploading: '업로드 중...', wpDefault: '기본값',
    settingsSession: '세션', restoreApps: '앱 복원', restoreAppsDesc: '페이지 새로고침 후 앱 다시 열기',
    skbTrayToggle: '키보드 아이콘', skbTrayToggleDesc: '작업 표시줄에 화면 키보드 아이콘 표시',
    magTrayShow: '돋보기 표시', magTrayToggle: '돋보기 아이콘', magTrayToggleDesc: '작업 표시줄에 돋보기 아이콘 표시'
};
const I18N_HI = {
    apps: 'एप्लिकेशन', user: 'उपयोगकर्ता', loading: 'लोड हो रहा है...', search: 'खोजें...',
    calc: 'कैलकुलेटर', notepad: 'नोटपैड', fileman: 'फ़ाइल प्रबंधक',
    todo: 'कार्य सूची', weather: 'मौसम', settings: 'सेटिंग्स',
    terminal: 'टर्मिनल', clock: 'घड़ी', calendar: 'कैलेंडर',
    notifications: 'सूचनाएं', appstore: 'ऐप स्टोर', browser: 'ब्राउज़र',
    screenkeyboard: 'स्क्रीन कीबोर्ड', skbCopy: 'कॉपी', skbClear: 'साफ़', skbTrayShow: 'स्क्रीन कीबोर्ड दिखाएं',
    mute: 'म्यूट', unmute: 'अनम्यूट',
    settingsDisplay: 'डिस्प्ले', settingsLocation: 'स्थान', settingsSound: 'ध्वनि',
    settingsNetwork: 'नेटवर्क', settingsAbout: 'के बारे में', settingsLanguage: 'भाषा',
    brightness: 'चमक', brightnessDesc: 'स्क्रीन की चमक समायोजित करें',
    darkMode: 'डार्क मोड', darkModeDesc: 'डार्क थीम का उपयोग करें',
    resolution: 'रिज़ॉल्यूशन', mainVolume: 'मुख्य वॉल्यूम', systemSound: 'सिस्टम ध्वनि',
    notifSound: 'सूचना ध्वनि', wifi: 'वाई-फ़ाई', wifiDesc: 'वायरलेस नेटवर्क कनेक्शन',
    bluetooth: 'ब्लूटूथ', vpn: 'VPN', vpnDesc: 'निजी नेटवर्क टनल',
    version: 'संस्करण', checkUpdates: 'अपडेट की जांच करें',
    country: 'देश', countryDesc: 'मौसम और समय क्षेत्र के लिए',
    city: 'शहर', cityListing: 'शहर सूचीबद्ध', timezone: 'समय क्षेत्र',
    timezoneAuto: 'स्वचालित', location: 'स्थान', locationSaved: 'सहेजा गया',
    selectPlaceholder: 'चुनें...', language: 'भाषा', languageDesc: 'इंटरफ़ेस भाषा',
    notifTitle: 'सूचनाएं', noNotifications: 'कोई सूचना नहीं 🎉',
    markAllRead: 'सभी को पढ़ा गया चिह्नित करें', testNotifPlaceholder: 'परीक्षण सूचना जोड़ें...',
    send: 'भेजें', openApp: 'ऐप खोलें',
    storeTitle: 'ऐप स्टोर', appsAvailable: 'ऐप उपलब्ध',
    internal: 'आंतरिक', external: 'बाहरी', service: 'सेवा', install: 'इंस्टॉल', uninstall: 'अनइंस्टॉल', storeSearch: 'ऐप खोजें...', storeNoResults: 'कोई परिणाम नहीं',
    volMute: '🔇 म्यूट', volUnmute: '🔈 अनम्यूट',
    settingsWallpaper: 'वॉलपेपर', wpMode: 'मोड', wpModeDesc: 'सभी डेस्कटॉप के लिए एक ही या अलग-अलग वॉलपेपर',
    wpAll: 'सभी के लिए समान', wpPer: 'प्रति डेस्कटॉप', wpDesktopSelect: 'डेस्कटॉप चुनें',
    wpUpload: 'इमेज अपलोड करें', wpUploadBtn: 'अपलोड', wpGallery: 'वॉलपेपर',
    wpUploading: 'अपलोड हो रहा है...', wpDefault: 'डिफ़ॉल्ट',
    settingsSession: 'सत्र', restoreApps: 'ऐप्स पुनर्स्थापित करें', restoreAppsDesc: 'पेज रीफ़्रेश के बाद ऐप दोबारा खोलें',
    skbTrayToggle: 'कीबोर्ड आइकन', skbTrayToggleDesc: 'टास्कबार में स्क्रीन कीबोर्ड आइकन दिखाएं',
    magTrayShow: 'मैग्निफायर दिखाएं', magTrayToggle: 'मैग्निफायर आइकन', magTrayToggleDesc: 'टास्कबार में मैग्निफायर आइकन दिखाएं'
};
const I18N_PT = {
    apps: 'Aplicações', user: 'Utilizador', loading: 'Carregando...', search: 'Pesquisar...',
    calc: 'Calculadora', notepad: 'Bloco de Notas', fileman: 'Gerenciador de Arquivos',
    todo: 'Lista de Tarefas', weather: 'Clima', settings: 'Configurações',
    terminal: 'Terminal', clock: 'Relógio', calendar: 'Calendário',
    notifications: 'Notificações', appstore: 'Loja de Apps', browser: 'Navegador',
    screenkeyboard: 'Teclado Virtual', skbCopy: 'Copiar', skbClear: 'Limpar', skbTrayShow: 'Mostrar Teclado Virtual',
    mute: 'Silenciar', unmute: 'Ativar Som',
    settingsDisplay: 'Tela', settingsLocation: 'Localização', settingsSound: 'Som',
    settingsNetwork: 'Rede', settingsAbout: 'Sobre', settingsLanguage: 'Idioma',
    brightness: 'Brilho', brightnessDesc: 'Ajustar brilho da tela',
    darkMode: 'Modo Escuro', darkModeDesc: 'Usar tema escuro',
    resolution: 'Resolução', mainVolume: 'Volume Principal', systemSound: 'Som do Sistema',
    notifSound: 'Som de Notificação', wifi: 'Wi-Fi', wifiDesc: 'Conexão de rede sem fio',
    bluetooth: 'Bluetooth', vpn: 'VPN', vpnDesc: 'Túnel de rede privada',
    version: 'Versão', checkUpdates: 'Verificar Atualizações',
    country: 'País', countryDesc: 'Para clima e fuso horário',
    city: 'Cidade', cityListing: 'cidades listadas', timezone: 'Fuso Horário',
    timezoneAuto: 'Automático', location: 'Localização', locationSaved: 'Salvo',
    selectPlaceholder: 'Selecionar...', language: 'Idioma', languageDesc: 'Idioma da interface',
    notifTitle: 'Notificações', noNotifications: 'Nenhuma notificação 🎉',
    markAllRead: 'Marcar Todas como Lidas', testNotifPlaceholder: 'Adicionar notificação de teste...',
    send: 'Enviar', openApp: 'Abrir App',
    storeTitle: 'Loja de Apps', appsAvailable: 'apps disponíveis',
    internal: 'Interno', external: 'Externo', service: 'Serviço', install: 'Instalar', uninstall: 'Desinstalar', storeSearch: 'Pesquisar apps...', storeNoResults: 'Nenhum resultado encontrado',
    volMute: '🔇 Silenciar', volUnmute: '🔈 Ativar Som',
    settingsWallpaper: 'Papel de Parede', wpMode: 'Modo', wpModeDesc: 'Mesmo papel de parede para todas as áreas de trabalho ou diferente para cada uma',
    wpAll: 'Igual para Todos', wpPer: 'Por Área de Trabalho', wpDesktopSelect: 'Selecionar Área de Trabalho',
    wpUpload: 'Enviar Imagem', wpUploadBtn: 'Enviar', wpGallery: 'Papéis de Parede',
    wpUploading: 'Enviando...', wpDefault: 'Padrão',
    settingsSession: 'Sessão', restoreApps: 'Restaurar Apps', restoreAppsDesc: 'Reabrir apps após atualização da página',
    skbTrayToggle: 'Ícone do Teclado', skbTrayToggleDesc: 'Mostrar ícone do teclado virtual na barra de tarefas',
    magTrayShow: 'Mostrar Lupa', magTrayToggle: 'Ícone da Lupa', magTrayToggleDesc: 'Mostrar ícone da lupa na barra de tarefas'
};
I18N.ar = I18N_AR; I18N.ko = I18N_KO; I18N.hi = I18N_HI; I18N.pt = I18N_PT;`;

  content = insertAfter(content, itMainEnd, '\n' + newMainI18N);

  // ── 2b. Reminder i18n ──
  const reminderItMarker = "Object.assign(I18N.it, { reminderDismiss:'Chiudi' });";
  content = insertAfter(content, reminderItMarker, `
Object.assign(I18N.ar, { reminderDismiss:'إغلاق' });
Object.assign(I18N.ko, { reminderDismiss:'닫기' });
Object.assign(I18N.hi, { reminderDismiss:'बंद करें' });
Object.assign(I18N.pt, { reminderDismiss:'Dispensar' });`);

  // ── 2c. Screenshot i18n ──
  const ssItMarker = "Object.assign(I18N.it, { screenshot:'Cattura schermo', ssSelectRegion:'Seleziona area', ssCopied:'Copiato negli appunti', ssOpenPaint:'Aperto in Paint', ssCancelled:'Annullato' });";
  content = insertAfter(content, ssItMarker, `
Object.assign(I18N.ar, { screenshot:'لقطة شاشة', ssSelectRegion:'حدد المنطقة', ssCopied:'تم النسخ إلى الحافظة', ssOpenPaint:'تم الفتح في الرسام', ssCancelled:'تم الإلغاء' });
Object.assign(I18N.ko, { screenshot:'스크린샷', ssSelectRegion:'영역 선택', ssCopied:'클립보드에 복사됨', ssOpenPaint:'페인트에서 열림', ssCancelled:'취소됨' });
Object.assign(I18N.hi, { screenshot:'स्क्रीनशॉट', ssSelectRegion:'क्षेत्र चुनें', ssCopied:'क्लिपबोर्ड में कॉपी किया गया', ssOpenPaint:'पेंट में खोला गया', ssCancelled:'रद्द किया गया' });
Object.assign(I18N.pt, { screenshot:'Captura de Tela', ssSelectRegion:'Selecionar região', ssCopied:'Copiado para a área de transferência', ssOpenPaint:'Aberto no Paint', ssCancelled:'Cancelado' });`);

  // ── 2d. LANG_OPTIONS ──
  const langOptMarker = "{ code: 'it', label: 'Italiano', flag: '🇮🇹' }";
  content = insertAfter(content, langOptMarker, `,
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' }`);

  // ── 2e. LOCALE_MAP ──
  const localeMapMarker = "const LOCALE_MAP = { tr:'tr-TR', en:'en-US', de:'de-DE', fr:'fr-FR', es:'es-ES', ru:'ru-RU', zh:'zh-CN', ja:'ja-JP', it:'it-IT' };";
  content = content.replace(localeMapMarker, "const LOCALE_MAP = { tr:'tr-TR', en:'en-US', de:'de-DE', fr:'fr-FR', es:'es-ES', ru:'ru-RU', zh:'zh-CN', ja:'ja-JP', it:'it-IT', ar:'ar-SA', ko:'ko-KR', hi:'hi-IN', pt:'pt-BR' };");

  // ── 2f. Extended I18N ──
  const extItMarker = `contactsFav:'Aggiungi ai preferiti', contactsFaved:'Preferito', contactsCount:'contatti', contactsPickContact:'Scegli dai contatti'
});`;
  const extNew = `
Object.assign(I18N.ar, {
  ctxOpen:'فتح', ctxMove:'نقل', ctxCopy:'نسخ', ctxDesktop:'سطح المكتب', ctxRemove:'إزالة من سطح المكتب', ctxAddDesktop:'إضافة إلى سطح المكتب', ctxLogout:'تسجيل الخروج',
  start:'ابدأ', fullscreen:'ملء الشاشة', fullscreenExit:'الخروج من ملء الشاشة',
  notepadClear:'مسح', notepadCopy:'نسخ', notepadPlaceholder:'ابدأ الكتابة...', notepadChars:'حرف', notepadWords:'كلمة',
  todoTitle:'قائمة المهام', todoCompleted:'مكتمل', todoPlaceholder:'إضافة مهمة جديدة...', todoAdd:'إضافة', todoEmpty:'لا توجد مهام بعد 🎉',
  todoGroups:'المجموعات', todoAddGroup:'إضافة مجموعة', todoGroupName:'اسم المجموعة...', todoAll:'الكل', todoDeleteGroup:'حذف المجموعة',
  todoPriorityLow:'منخفض', todoPriorityMed:'متوسط', todoPriorityHigh:'عالي',
  fmDesktop:'سطح المكتب', fmDocuments:'المستندات', fmDownloads:'التنزيلات', fmPictures:'الصور', fmMusic:'الموسيقى', fmTrash:'سلة المهملات',
  fmItems:'عنصر', fmSelected:'محدد', fmOpening:'جاري الفتح...', fmPathPrefix:'C:\\\\المستخدمون\\\\المستخدم\\\\',
  weatherNow:'الآن', weatherHumidity:'الرطوبة', weatherWind:'الرياح', weatherFeelsLike:'يشعر كأنه', weatherHourly:'التوقعات بالساعة', weatherUnknown:'غير معروف',
  calToday:'اليوم', calAddEvent:'+ حدث', calEventPlaceholder:'اسم الحدث...', calAdd:'إضافة', calNoEvents:'لا أحداث في هذا التاريخ', calMore:'المزيد',
  calBlue:'أزرق', calGreen:'أخضر', calOrange:'برتقالي', calRed:'أحمر', calPurple:'بنفسجي',
  calStartTime:'البداية', calEndTime:'النهاية', calOptional:'اختياري',
  calHolidays:'العطلات', calDays:'أيام', calAddHoliday:'إضافة', calClearHolidays:'مسح جميع العطلات', calHolidaysAdded:'عطلة أضيفت',
  termBarTitle:'bash - مستخدم@vuedesktop', termWelcome:'Aysi Cloud Computer Terminal v1.0 — الأوامر: help, ls, date, clear, echo [نص]',
  termHelpText:'الأوامر: help, ls, date, clear, echo [نص], whoami, pwd', termNotFound:'الأمر غير موجود', termHelpHint:'اكتب "help".',
  termPlaceholder:'أدخل الأمر...', termUser:'مستخدم', termPwd:'/home/مستخدم',
  notifNow:'الآن', notifLabel:'إشعار',
  mediaPrev:'السابق', mediaNext:'التالي',
  brUrlPlaceholder:'اكتب عنوان URL أو ابحث...', brAdd:'إضافة', brRetry:'إعادة المحاولة', brNewTab:'علامة تبويب جديدة',
  brBack:'رجوع', brForward:'تقدم', brReload:'تحديث', brHome:'الرئيسية', brBookmarks:'الإشارات المرجعية',
  contacts:'جهات الاتصال', contactsTitle:'جهات الاتصال', contactsSearch:'بحث في جهات الاتصال...', contactsAdd:'إضافة جهة اتصال', contactsEdit:'تعديل', contactsDelete:'حذف', contactsDeleteConfirm:'هل أنت متأكد من حذف جهة الاتصال هذه؟', contactsSave:'حفظ', contactsBack:'رجوع', contactsEmpty:'لا توجد جهات اتصال',
  contactsFirstName:'الاسم الأول', contactsLastName:'اسم العائلة', contactsEmail:'البريد الإلكتروني', contactsPhone:'الهاتف', contactsMobile:'الجوال', contactsCompany:'الشركة', contactsJobTitle:'المسمى الوظيفي', contactsAddress:'العنوان', contactsCity:'المدينة', contactsCountry:'الدولة', contactsWebsite:'الموقع الإلكتروني', contactsBirthday:'تاريخ الميلاد', contactsNotes:'ملاحظات',
  contactsFav:'إضافة إلى المفضلة', contactsFaved:'في المفضلة', contactsCount:'جهة اتصال', contactsPickContact:'اختر من جهات الاتصال'
});
Object.assign(I18N.ko, {
  ctxOpen:'열기', ctxMove:'이동', ctxCopy:'복사', ctxDesktop:'데스크톱', ctxRemove:'데스크톱에서 제거', ctxAddDesktop:'데스크톱에 추가', ctxLogout:'로그아웃',
  start:'시작', fullscreen:'전체 화면', fullscreenExit:'전체 화면 종료',
  notepadClear:'지우기', notepadCopy:'복사', notepadPlaceholder:'입력을 시작하세요...', notepadChars:'자', notepadWords:'단어',
  todoTitle:'할 일 목록', todoCompleted:'완료', todoPlaceholder:'새 작업 추가...', todoAdd:'추가', todoEmpty:'아직 작업이 없습니다 🎉',
  todoGroups:'그룹', todoAddGroup:'그룹 추가', todoGroupName:'그룹 이름...', todoAll:'전체', todoDeleteGroup:'그룹 삭제',
  todoPriorityLow:'낮음', todoPriorityMed:'보통', todoPriorityHigh:'높음',
  fmDesktop:'데스크톱', fmDocuments:'문서', fmDownloads:'다운로드', fmPictures:'사진', fmMusic:'음악', fmTrash:'휴지통',
  fmItems:'항목', fmSelected:'선택됨', fmOpening:'여는 중...', fmPathPrefix:'C:\\\\Users\\\\User\\\\',
  weatherNow:'현재', weatherHumidity:'습도', weatherWind:'바람', weatherFeelsLike:'체감', weatherHourly:'시간별 예보', weatherUnknown:'알 수 없음',
  calToday:'오늘', calAddEvent:'+ 이벤트', calEventPlaceholder:'이벤트 이름...', calAdd:'추가', calNoEvents:'이 날짜에 이벤트 없음', calMore:'더보기',
  calBlue:'파란색', calGreen:'초록색', calOrange:'주황색', calRed:'빨간색', calPurple:'보라색',
  calStartTime:'시작', calEndTime:'종료', calOptional:'선택사항',
  calHolidays:'공휴일', calDays:'일', calAddHoliday:'추가', calClearHolidays:'모든 공휴일 삭제', calHolidaysAdded:'개 공휴일 추가됨',
  termBarTitle:'bash - user@vuedesktop', termWelcome:'Aysi Cloud Computer 터미널 v1.0 — 명령어: help, ls, date, clear, echo [텍스트]',
  termHelpText:'명령어: help, ls, date, clear, echo [텍스트], whoami, pwd', termNotFound:'명령어를 찾을 수 없습니다', termHelpHint:'"help"를 입력하세요.',
  termPlaceholder:'명령어 입력...', termUser:'사용자', termPwd:'/home/사용자',
  notifNow:'지금', notifLabel:'알림',
  mediaPrev:'이전', mediaNext:'다음',
  brUrlPlaceholder:'URL 또는 검색어 입력...', brAdd:'추가', brRetry:'재시도', brNewTab:'새 탭',
  brBack:'뒤로', brForward:'앞으로', brReload:'새로고침', brHome:'홈', brBookmarks:'북마크',
  contacts:'연락처', contactsTitle:'연락처', contactsSearch:'연락처 검색...', contactsAdd:'연락처 추가', contactsEdit:'편집', contactsDelete:'삭제', contactsDeleteConfirm:'이 연락처를 삭제하시겠습니까?', contactsSave:'저장', contactsBack:'뒤로', contactsEmpty:'연락처 없음',
  contactsFirstName:'이름', contactsLastName:'성', contactsEmail:'이메일', contactsPhone:'전화', contactsMobile:'휴대폰', contactsCompany:'회사', contactsJobTitle:'직함', contactsAddress:'주소', contactsCity:'도시', contactsCountry:'국가', contactsWebsite:'웹사이트', contactsBirthday:'생일', contactsNotes:'메모',
  contactsFav:'즐겨찾기 추가', contactsFaved:'즐겨찾기', contactsCount:'연락처', contactsPickContact:'연락처에서 선택'
});
Object.assign(I18N.hi, {
  ctxOpen:'खोलें', ctxMove:'स्थानांतरित करें', ctxCopy:'कॉपी', ctxDesktop:'डेस्कटॉप', ctxRemove:'डेस्कटॉप से हटाएं', ctxAddDesktop:'डेस्कटॉप में जोड़ें', ctxLogout:'लॉग आउट',
  start:'शुरू', fullscreen:'पूर्ण स्क्रीन', fullscreenExit:'पूर्ण स्क्रीन से बाहर निकलें',
  notepadClear:'साफ़ करें', notepadCopy:'कॉपी', notepadPlaceholder:'टाइप करना शुरू करें...', notepadChars:'अक्षर', notepadWords:'शब्द',
  todoTitle:'कार्य सूची', todoCompleted:'पूर्ण', todoPlaceholder:'नया कार्य जोड़ें...', todoAdd:'जोड़ें', todoEmpty:'अभी तक कोई कार्य नहीं 🎉',
  todoGroups:'समूह', todoAddGroup:'समूह जोड़ें', todoGroupName:'समूह का नाम...', todoAll:'सभी', todoDeleteGroup:'समूह हटाएं',
  todoPriorityLow:'कम', todoPriorityMed:'मध्यम', todoPriorityHigh:'उच्च',
  fmDesktop:'डेस्कटॉप', fmDocuments:'दस्तावेज़', fmDownloads:'डाउनलोड', fmPictures:'चित्र', fmMusic:'संगीत', fmTrash:'कचरा',
  fmItems:'आइटम', fmSelected:'चयनित', fmOpening:'खोल रहा है...', fmPathPrefix:'C:\\\\Users\\\\User\\\\',
  weatherNow:'अभी', weatherHumidity:'नमी', weatherWind:'हवा', weatherFeelsLike:'महसूस होता है', weatherHourly:'प्रति घंटा पूर्वानुमान', weatherUnknown:'अज्ञात',
  calToday:'आज', calAddEvent:'+ कार्यक्रम', calEventPlaceholder:'कार्यक्रम का नाम...', calAdd:'जोड़ें', calNoEvents:'इस तिथि पर कोई कार्यक्रम नहीं', calMore:'और',
  calBlue:'नीला', calGreen:'हरा', calOrange:'नारंगी', calRed:'लाल', calPurple:'बैंगनी',
  calStartTime:'प्रारंभ', calEndTime:'समाप्त', calOptional:'वैकल्पिक',
  calHolidays:'छुट्टियां', calDays:'दिन', calAddHoliday:'जोड़ें', calClearHolidays:'सभी छुट्टियां हटाएं', calHolidaysAdded:'छुट्टियां जोड़ी गईं',
  termBarTitle:'bash - user@vuedesktop', termWelcome:'Aysi Cloud Computer टर्मिनल v1.0 — कमांड: help, ls, date, clear, echo [टेक्स्ट]',
  termHelpText:'कमांड: help, ls, date, clear, echo [टेक्स्ट], whoami, pwd', termNotFound:'कमांड नहीं मिला', termHelpHint:'"help" टाइप करें।',
  termPlaceholder:'कमांड दर्ज करें...', termUser:'उपयोगकर्ता', termPwd:'/home/उपयोगकर्ता',
  notifNow:'अभी', notifLabel:'सूचना',
  mediaPrev:'पिछला', mediaNext:'अगला',
  brUrlPlaceholder:'URL या खोज टाइप करें...', brAdd:'जोड़ें', brRetry:'पुनः प्रयास', brNewTab:'नया टैब',
  brBack:'पीछे', brForward:'आगे', brReload:'रीलोड', brHome:'होम', brBookmarks:'बुकमार्क',
  contacts:'संपर्क', contactsTitle:'संपर्क', contactsSearch:'संपर्क खोजें...', contactsAdd:'संपर्क जोड़ें', contactsEdit:'संपादित करें', contactsDelete:'हटाएं', contactsDeleteConfirm:'क्या आप इस संपर्क को हटाना चाहते हैं?', contactsSave:'सहेजें', contactsBack:'पीछे', contactsEmpty:'कोई संपर्क नहीं',
  contactsFirstName:'पहला नाम', contactsLastName:'अंतिम नाम', contactsEmail:'ईमेल', contactsPhone:'फ़ोन', contactsMobile:'मोबाइल', contactsCompany:'कंपनी', contactsJobTitle:'पद', contactsAddress:'पता', contactsCity:'शहर', contactsCountry:'देश', contactsWebsite:'वेबसाइट', contactsBirthday:'जन्मदिन', contactsNotes:'टिप्पणियां',
  contactsFav:'पसंदीदा में जोड़ें', contactsFaved:'पसंदीदा', contactsCount:'संपर्क', contactsPickContact:'संपर्कों से चुनें'
});
Object.assign(I18N.pt, {
  ctxOpen:'Abrir', ctxMove:'Mover', ctxCopy:'Copiar', ctxDesktop:'Área de Trabalho', ctxRemove:'Remover da Área de Trabalho', ctxAddDesktop:'Adicionar à Área de Trabalho', ctxLogout:'Sair',
  start:'Iniciar', fullscreen:'Tela Cheia', fullscreenExit:'Sair da Tela Cheia',
  notepadClear:'Limpar', notepadCopy:'Copiar', notepadPlaceholder:'Comece a digitar...', notepadChars:'caracteres', notepadWords:'palavras',
  todoTitle:'Lista de Tarefas', todoCompleted:'concluídas', todoPlaceholder:'Adicionar nova tarefa...', todoAdd:'Adicionar', todoEmpty:'Nenhuma tarefa ainda 🎉',
  todoGroups:'Grupos', todoAddGroup:'Adicionar Grupo', todoGroupName:'Nome do grupo...', todoAll:'Todos', todoDeleteGroup:'Excluir Grupo',
  todoPriorityLow:'Baixa', todoPriorityMed:'Média', todoPriorityHigh:'Alta',
  fmDesktop:'Área de Trabalho', fmDocuments:'Documentos', fmDownloads:'Downloads', fmPictures:'Imagens', fmMusic:'Música', fmTrash:'Lixeira',
  fmItems:'itens', fmSelected:'selecionado', fmOpening:'abrindo...', fmPathPrefix:'C:\\\\Usuários\\\\Usuário\\\\',
  weatherNow:'Agora', weatherHumidity:'Umidade', weatherWind:'Vento', weatherFeelsLike:'Sensação', weatherHourly:'Previsão por Hora', weatherUnknown:'Desconhecido',
  calToday:'Hoje', calAddEvent:'+ Evento', calEventPlaceholder:'Nome do evento...', calAdd:'Adicionar', calNoEvents:'Nenhum evento nesta data', calMore:'mais',
  calBlue:'Azul', calGreen:'Verde', calOrange:'Laranja', calRed:'Vermelho', calPurple:'Roxo',
  calStartTime:'Início', calEndTime:'Fim', calOptional:'opcional',
  calHolidays:'Feriados', calDays:'dias', calAddHoliday:'Adicionar', calClearHolidays:'Limpar todos os feriados', calHolidaysAdded:'feriados adicionados',
  termBarTitle:'bash - usuario@vuedesktop', termWelcome:'Aysi Cloud Computer Terminal v1.0 — Comandos: help, ls, date, clear, echo [texto]',
  termHelpText:'Comandos: help, ls, date, clear, echo [texto], whoami, pwd', termNotFound:'Comando não encontrado', termHelpHint:'Digite "help".',
  termPlaceholder:'digite o comando...', termUser:'usuario', termPwd:'/home/usuario',
  notifNow:'Agora', notifLabel:'Notificação',
  mediaPrev:'Anterior', mediaNext:'Próximo',
  brUrlPlaceholder:'Digite uma URL ou pesquise...', brAdd:'Adicionar', brRetry:'Tentar Novamente', brNewTab:'Nova Aba',
  brBack:'Voltar', brForward:'Avançar', brReload:'Recarregar', brHome:'Início', brBookmarks:'Favoritos',
  contacts:'Contatos', contactsTitle:'Contatos', contactsSearch:'Pesquisar contatos...', contactsAdd:'Adicionar Contato', contactsEdit:'Editar', contactsDelete:'Excluir', contactsDeleteConfirm:'Tem certeza que deseja excluir este contato?', contactsSave:'Salvar', contactsBack:'Voltar', contactsEmpty:'Nenhum contato',
  contactsFirstName:'Nome', contactsLastName:'Sobrenome', contactsEmail:'E-mail', contactsPhone:'Telefone', contactsMobile:'Celular', contactsCompany:'Empresa', contactsJobTitle:'Cargo', contactsAddress:'Endereço', contactsCity:'Cidade', contactsCountry:'País', contactsWebsite:'Website', contactsBirthday:'Aniversário', contactsNotes:'Notas',
  contactsFav:'Adicionar aos Favoritos', contactsFaved:'Favorito', contactsCount:'contatos', contactsPickContact:'Escolher de Contatos'
});`;
  // Find after it extended block ends (last closing line)
  const extItIdx = content.indexOf(extItMarker);
  if (extItIdx !== -1) {
    const insertPos = extItIdx + extItMarker.length;
    content = content.substring(0, insertPos) + extNew + content.substring(insertPos);
  }

  // ── 2g. WMO_DESC_I18N ──
  const wmoItMarker = "it:{0:'Sereno',1:'Poco nuvoloso',2:'Parzialmente nuvoloso',3:'Coperto',45:'Nebbia',48:'Nebbia gelata',51:'Pioviggine leggera',53:'Pioviggine',55:'Pioviggine fitta',61:'Pioggia leggera',63:'Pioggia',65:'Pioggia forte',71:'Neve leggera',73:'Nevicata',75:'Neve forte',77:'Granuli di neve',80:'Rovesci leggeri',81:'Rovesci',82:'Rovesci forti',85:'Rovesci di neve leggeri',86:'Rovesci di neve',95:'Temporale',96:'Temporale con grandine',99:'Grandine violenta'}";

  const wmoNew = `,
  ar:{0:'صافي',1:'غائم جزئياً',2:'غائم في الغالب',3:'ملبد بالغيوم',45:'ضبابي',48:'ضباب صقيعي',51:'رذاذ خفيف',53:'رذاذ',55:'رذاذ كثيف',61:'مطر خفيف',63:'ماطر',65:'مطر غزير',71:'ثلج خفيف',73:'تساقط ثلوج',75:'ثلج كثيف',77:'حبيبات ثلجية',80:'زخات خفيفة',81:'زخات',82:'زخات شديدة',85:'زخات ثلجية خفيفة',86:'زخات ثلجية',95:'عاصفة رعدية',96:'عاصفة رعدية مع برد',99:'برد شديد'},
  ko:{0:'맑음',1:'약간 흐림',2:'대체로 흐림',3:'흐림',45:'안개',48:'상고대 안개',51:'가벼운 이슬비',53:'이슬비',55:'짙은 이슬비',61:'약한 비',63:'비',65:'강한 비',71:'약한 눈',73:'눈',75:'강한 눈',77:'싸락눈',80:'가벼운 소나기',81:'소나기',82:'강한 소나기',85:'가벼운 눈소나기',86:'눈소나기',95:'뇌우',96:'우박 동반 뇌우',99:'심한 우박'},
  hi:{0:'साफ',1:'आंशिक बादल',2:'अधिकतर बादल',3:'बादल छाए',45:'कोहरा',48:'पाला कोहरा',51:'हल्की बूंदाबांदी',53:'बूंदाबांदी',55:'घनी बूंदाबांदी',61:'हल्की बारिश',63:'बारिश',65:'भारी बारिश',71:'हल्की बर्फ',73:'बर्फबारी',75:'भारी बर्फ',77:'बर्फ के दाने',80:'हल्की बौछारें',81:'बौछारें',82:'भारी बौछारें',85:'हल्की हिमपात बौछारें',86:'हिमपात बौछारें',95:'आंधी',96:'ओलों के साथ आंधी',99:'भीषण ओले'},
  pt:{0:'Limpo',1:'Parcialmente nublado',2:'Predominantemente nublado',3:'Nublado',45:'Neblina',48:'Neblina congelante',51:'Garoa leve',53:'Garoa',55:'Garoa densa',61:'Chuva fraca',63:'Chuvoso',65:'Chuva forte',71:'Neve fraca',73:'Queda de neve',75:'Neve forte',77:'Grãos de neve',80:'Pancadas leves',81:'Pancadas',82:'Pancadas fortes',85:'Pancadas de neve leves',86:'Pancadas de neve',95:'Trovoada',96:'Trovoada com granizo',99:'Granizo severo'}`;
  content = insertAfter(content, wmoItMarker, wmoNew);

  // ── 2h. EP_LOCALES ──
  const epItEnd = "it:{name:'it',el:{datepicker:{now:'Ora',today:'Oggi',cancel:'Annulla',clear:'Cancella',confirm:'OK',dateTablePrompt:'Usa i tasti freccia e Invio per selezionare il giorno',monthTablePrompt:'Usa i tasti freccia e Invio per selezionare il mese',yearTablePrompt:'Usa i tasti freccia e Invio per selezionare l\\'anno',selectedDate:'Data selezionata',selectDate:'Seleziona data',selectTime:'Seleziona ora',startDate:'Data inizio',startTime:'Ora inizio',endDate:'Data fine',endTime:'Ora fine',prevYear:'Anno precedente',nextYear:'Anno successivo',prevMonth:'Mese precedente',nextMonth:'Mese successivo',year:'',month1:'Gennaio',month2:'Febbraio',month3:'Marzo',month4:'Aprile',month5:'Maggio',month6:'Giugno',month7:'Luglio',month8:'Agosto',month9:'Settembre',month10:'Ottobre',month11:'Novembre',month12:'Dicembre',weeks:{sun:'Dom',mon:'Lun',tue:'Mar',wed:'Mer',thu:'Gio',fri:'Ven',sat:'Sab'},weeksFull:{sun:'Domenica',mon:'Lunedì',tue:'Martedì',wed:'Mercoledì',thu:'Giovedì',fri:'Venerdì',sat:'Sabato'},months:{jan:'Gen',feb:'Feb',mar:'Mar',apr:'Apr',may:'Mag',jun:'Giu',jul:'Lug',aug:'Ago',sep:'Set',oct:'Ott',nov:'Nov',dec:'Dic'}},select:{noMatch:'Nessuna corrispondenza',noData:'Nessun dato',placeholder:'Seleziona'},dialog:{close:'Chiudi'},messagebox:{title:'Messaggio',confirm:'OK',cancel:'Annulla'},table:{emptyText:'Nessun dato'}}}";

  const epNew = `,
  ar:{name:'ar',el:{datepicker:{now:'الآن',today:'اليوم',cancel:'إلغاء',clear:'مسح',confirm:'موافق',dateTablePrompt:'استخدم مفاتيح الأسهم و Enter لتحديد اليوم',monthTablePrompt:'استخدم مفاتيح الأسهم و Enter لتحديد الشهر',yearTablePrompt:'استخدم مفاتيح الأسهم و Enter لتحديد السنة',selectedDate:'التاريخ المحدد',selectDate:'اختر التاريخ',selectTime:'اختر الوقت',startDate:'تاريخ البداية',startTime:'وقت البداية',endDate:'تاريخ النهاية',endTime:'وقت النهاية',prevYear:'السنة السابقة',nextYear:'السنة التالية',prevMonth:'الشهر السابق',nextMonth:'الشهر التالي',year:'',month1:'يناير',month2:'فبراير',month3:'مارس',month4:'أبريل',month5:'مايو',month6:'يونيو',month7:'يوليو',month8:'أغسطس',month9:'سبتمبر',month10:'أكتوبر',month11:'نوفمبر',month12:'ديسمبر',weeks:{sun:'أحد',mon:'إثن',tue:'ثلا',wed:'أرب',thu:'خمي',fri:'جمع',sat:'سبت'},weeksFull:{sun:'الأحد',mon:'الإثنين',tue:'الثلاثاء',wed:'الأربعاء',thu:'الخميس',fri:'الجمعة',sat:'السبت'},months:{jan:'ينا',feb:'فبر',mar:'مار',apr:'أبر',may:'ماي',jun:'يون',jul:'يول',aug:'أغس',sep:'سبت',oct:'أكت',nov:'نوف',dec:'ديس'}},select:{noMatch:'لا توجد بيانات مطابقة',noData:'لا توجد بيانات',placeholder:'اختر'},dialog:{close:'إغلاق'},messagebox:{title:'رسالة',confirm:'موافق',cancel:'إلغاء'},table:{emptyText:'لا توجد بيانات'}}},
  ko:{name:'ko',el:{datepicker:{now:'지금',today:'오늘',cancel:'취소',clear:'삭제',confirm:'확인',dateTablePrompt:'화살표 키와 Enter로 날짜를 선택하세요',monthTablePrompt:'화살표 키와 Enter로 월을 선택하세요',yearTablePrompt:'화살표 키와 Enter로 연도를 선택하세요',selectedDate:'선택한 날짜',selectDate:'날짜 선택',selectTime:'시간 선택',startDate:'시작 날짜',startTime:'시작 시간',endDate:'종료 날짜',endTime:'종료 시간',prevYear:'이전 해',nextYear:'다음 해',prevMonth:'이전 달',nextMonth:'다음 달',year:'년',month1:'1월',month2:'2월',month3:'3월',month4:'4월',month5:'5월',month6:'6월',month7:'7월',month8:'8월',month9:'9월',month10:'10월',month11:'11월',month12:'12월',weeks:{sun:'일',mon:'월',tue:'화',wed:'수',thu:'목',fri:'금',sat:'토'},weeksFull:{sun:'일요일',mon:'월요일',tue:'화요일',wed:'수요일',thu:'목요일',fri:'금요일',sat:'토요일'},months:{jan:'1월',feb:'2월',mar:'3월',apr:'4월',may:'5월',jun:'6월',jul:'7월',aug:'8월',sep:'9월',oct:'10월',nov:'11월',dec:'12월'}},select:{noMatch:'일치하는 데이터 없음',noData:'데이터 없음',placeholder:'선택'},dialog:{close:'닫기'},messagebox:{title:'메시지',confirm:'확인',cancel:'취소'},table:{emptyText:'데이터 없음'}}},
  hi:{name:'hi',el:{datepicker:{now:'अभी',today:'आज',cancel:'रद्द',clear:'साफ़',confirm:'ठीक',dateTablePrompt:'दिन चुनने के लिए तीर कुंजियों और Enter का उपयोग करें',monthTablePrompt:'महीना चुनने के लिए तीर कुंजियों और Enter का उपयोग करें',yearTablePrompt:'वर्ष चुनने के लिए तीर कुंजियों और Enter का उपयोग करें',selectedDate:'चयनित तिथि',selectDate:'तिथि चुनें',selectTime:'समय चुनें',startDate:'प्रारंभ तिथि',startTime:'प्रारंभ समय',endDate:'समाप्ति तिथि',endTime:'समाप्ति समय',prevYear:'पिछला वर्ष',nextYear:'अगला वर्ष',prevMonth:'पिछला महीना',nextMonth:'अगला महीना',year:'',month1:'जनवरी',month2:'फ़रवरी',month3:'मार्च',month4:'अप्रैल',month5:'मई',month6:'जून',month7:'जुलाई',month8:'अगस्त',month9:'सितंबर',month10:'अक्तूबर',month11:'नवंबर',month12:'दिसंबर',weeks:{sun:'रवि',mon:'सोम',tue:'मंगल',wed:'बुध',thu:'गुरु',fri:'शुक्र',sat:'शनि'},weeksFull:{sun:'रविवार',mon:'सोमवार',tue:'मंगलवार',wed:'बुधवार',thu:'गुरुवार',fri:'शुक्रवार',sat:'शनिवार'},months:{jan:'जन',feb:'फ़र',mar:'मार्च',apr:'अप्रै',may:'मई',jun:'जून',jul:'जुला',aug:'अग',sep:'सित',oct:'अक्तू',nov:'नव',dec:'दिस'}},select:{noMatch:'कोई मिलान नहीं',noData:'कोई डेटा नहीं',placeholder:'चुनें'},dialog:{close:'बंद करें'},messagebox:{title:'संदेश',confirm:'ठीक',cancel:'रद्द'},table:{emptyText:'कोई डेटा नहीं'}}},
  pt:{name:'pt',el:{datepicker:{now:'Agora',today:'Hoje',cancel:'Cancelar',clear:'Limpar',confirm:'OK',dateTablePrompt:'Use as setas e Enter para selecionar o dia',monthTablePrompt:'Use as setas e Enter para selecionar o mês',yearTablePrompt:'Use as setas e Enter para selecionar o ano',selectedDate:'Data selecionada',selectDate:'Selecionar data',selectTime:'Selecionar hora',startDate:'Data Inicial',startTime:'Hora Inicial',endDate:'Data Final',endTime:'Hora Final',prevYear:'Ano Anterior',nextYear:'Próximo Ano',prevMonth:'Mês Anterior',nextMonth:'Próximo Mês',year:'',month1:'Janeiro',month2:'Fevereiro',month3:'Março',month4:'Abril',month5:'Maio',month6:'Junho',month7:'Julho',month8:'Agosto',month9:'Setembro',month10:'Outubro',month11:'Novembro',month12:'Dezembro',weeks:{sun:'Dom',mon:'Seg',tue:'Ter',wed:'Qua',thu:'Qui',fri:'Sex',sat:'Sáb'},weeksFull:{sun:'Domingo',mon:'Segunda-feira',tue:'Terça-feira',wed:'Quarta-feira',thu:'Quinta-feira',fri:'Sexta-feira',sat:'Sábado'},months:{jan:'Jan',feb:'Fev',mar:'Mar',apr:'Abr',may:'Mai',jun:'Jun',jul:'Jul',aug:'Ago',sep:'Set',oct:'Out',nov:'Nov',dec:'Dez'}},select:{noMatch:'Nenhum dado correspondente',noData:'Sem dados',placeholder:'Selecionar'},dialog:{close:'Fechar'},messagebox:{title:'Mensagem',confirm:'OK',cancel:'Cancelar'},table:{emptyText:'Sem dados'}}}`;
  content = insertAfter(content, epItEnd, epNew);

  fs.writeFileSync(path.join(ROOT, 'index.html'), content, 'utf8');
  console.log('  Updated index.html');
}

// =======================================================
// 3. MOBILE.HTML - Same structure as index.html
// =======================================================
function updateMobileHtml() {
  console.log('\n=== MOBILE.HTML ===');
  let content = fs.readFileSync(path.join(ROOT, 'mobile.html'), 'utf8');

  if (content.includes("I18N.ar") || content.includes("ar:{")) {
    console.log('  Already has ar, skipping');
    return;
  }

  // ── 3a. Main I18N block ──
  // Need to find where the main I18N ends in mobile - read the it: block closing
  // The mobile main I18N has similar keys but slightly different (no settingsWallpaper etc, no contacts)
  // Let me find the closing of the main I18N in mobile
  const mobileItEndMarker = content.includes("magTrayToggleDesc: 'Mostra icona della lente")
    ? "magTrayToggleDesc: 'Mostra icona della lente di ingrandimento nella barra delle applicazioni'\n  }\n};"
    : null;

  // Read the mobile file to find exactly what keys are in the main I18N
  // Mobile I18N has same structure as desktop for the base keys
  // Let me use a different approach - find the closing of it: block
  const mobileItIdx = content.indexOf("it: {\n    apps: 'Applicazioni'");
  if (mobileItIdx === -1) {
    // Try alternate pattern
    const altCheck = content.indexOf("it: {");
    if (altCheck === -1) {
      console.log('  Could not find it: block in mobile I18N');
      return;
    }
  }

  // Find the end of the main I18N object - it ends with }; after the it block
  const mainI18NEnd = content.indexOf('\n};', content.indexOf("it: {", content.indexOf('const I18N')));
  if (mainI18NEnd === -1) {
    console.log('  Could not find main I18N end');
    return;
  }

  // Read the last line before }; to understand what the it block contains
  const mobileMainContent = content.substring(content.indexOf('const I18N'), mainI18NEnd + 3);

  // Insert new languages before the closing };
  const mobileNewLangs = `,
  ar: {
    apps: 'التطبيقات', user: 'المستخدم', loading: 'جاري التحميل...', search: 'بحث...',
    calc: 'الآلة الحاسبة', notepad: 'المفكرة', fileman: 'مدير الملفات',
    todo: 'قائمة المهام', weather: 'الطقس', settings: 'الإعدادات',
    terminal: 'الطرفية', clock: 'الساعة', calendar: 'التقويم',
    notifications: 'الإشعارات', appstore: 'متجر التطبيقات', browser: 'المتصفح',
    screenkeyboard: 'لوحة المفاتيح', skbCopy: 'نسخ', skbClear: 'مسح', skbTrayShow: 'إظهار لوحة المفاتيح',
    mute: 'كتم', unmute: 'إلغاء الكتم',
    settingsDisplay: 'العرض', settingsLocation: 'الموقع', settingsSound: 'الصوت',
    settingsNetwork: 'الشبكة', settingsAbout: 'حول', settingsLanguage: 'اللغة',
    brightness: 'السطوع', brightnessDesc: 'ضبط سطوع الشاشة',
    darkMode: 'الوضع الداكن', darkModeDesc: 'استخدام السمة الداكنة',
    resolution: 'الدقة', mainVolume: 'مستوى الصوت الرئيسي', systemSound: 'صوت النظام',
    notifSound: 'صوت الإشعار', wifi: 'واي فاي', wifiDesc: 'اتصال الشبكة اللاسلكية',
    bluetooth: 'بلوتوث', vpn: 'VPN', vpnDesc: 'نفق الشبكة الخاصة',
    version: 'الإصدار', checkUpdates: 'التحقق من التحديثات',
    country: 'الدولة', countryDesc: 'للطقس والمنطقة الزمنية',
    city: 'المدينة', cityListing: 'مدينة مدرجة', timezone: 'المنطقة الزمنية',
    timezoneAuto: 'تلقائي', location: 'الموقع', locationSaved: 'تم الحفظ',
    selectPlaceholder: 'اختر...', language: 'اللغة', languageDesc: 'لغة الواجهة',
    notifTitle: 'الإشعارات', noNotifications: 'لا توجد إشعارات 🎉',
    markAllRead: 'تحديد الكل كمقروء', testNotifPlaceholder: 'إضافة إشعار تجريبي...',
    send: 'إرسال', openApp: 'فتح التطبيق',
    storeTitle: 'متجر التطبيقات', appsAvailable: 'تطبيق متاح',
    internal: 'داخلي', external: 'خارجي', service: 'خدمة', install: 'تثبيت', uninstall: 'إزالة', storeSearch: 'بحث في التطبيقات...', storeNoResults: 'لم يتم العثور على نتائج',
    volMute: '🔇 كتم', volUnmute: '🔈 إلغاء الكتم',
    settingsWallpaper: 'خلفية الشاشة', settingsSession: 'الجلسة',
    magTrayShow: 'إظهار المكبر', magTrayToggle: 'أيقونة المكبر', magTrayToggleDesc: 'إظهار أيقونة المكبر في شريط المهام'
  },
  ko: {
    apps: '애플리케이션', user: '사용자', loading: '로딩 중...', search: '검색...',
    calc: '계산기', notepad: '메모장', fileman: '파일 관리자',
    todo: '할 일 목록', weather: '날씨', settings: '설정',
    terminal: '터미널', clock: '시계', calendar: '달력',
    notifications: '알림', appstore: '앱 스토어', browser: '브라우저',
    screenkeyboard: '화면 키보드', skbCopy: '복사', skbClear: '지우기', skbTrayShow: '화면 키보드 표시',
    mute: '음소거', unmute: '음소거 해제',
    settingsDisplay: '디스플레이', settingsLocation: '위치', settingsSound: '소리',
    settingsNetwork: '네트워크', settingsAbout: '정보', settingsLanguage: '언어',
    brightness: '밝기', brightnessDesc: '화면 밝기 조절',
    darkMode: '다크 모드', darkModeDesc: '다크 테마 사용',
    resolution: '해상도', mainVolume: '기본 볼륨', systemSound: '시스템 소리',
    notifSound: '알림 소리', wifi: 'Wi-Fi', wifiDesc: '무선 네트워크 연결',
    bluetooth: '블루투스', vpn: 'VPN', vpnDesc: '사설 네트워크 터널',
    version: '버전', checkUpdates: '업데이트 확인',
    country: '국가', countryDesc: '날씨 및 시간대용',
    city: '도시', cityListing: '개 도시 표시', timezone: '시간대',
    timezoneAuto: '자동', location: '위치', locationSaved: '저장됨',
    selectPlaceholder: '선택...', language: '언어', languageDesc: '인터페이스 언어',
    notifTitle: '알림', noNotifications: '알림 없음 🎉',
    markAllRead: '모두 읽음으로 표시', testNotifPlaceholder: '테스트 알림 추가...',
    send: '보내기', openApp: '앱 열기',
    storeTitle: '앱 스토어', appsAvailable: '개 앱 사용 가능',
    internal: '내장', external: '외부', service: '서비스', install: '설치', uninstall: '제거', storeSearch: '앱 검색...', storeNoResults: '결과 없음',
    volMute: '🔇 음소거', volUnmute: '🔈 음소거 해제',
    settingsWallpaper: '배경화면', settingsSession: '세션',
    magTrayShow: '돋보기 표시', magTrayToggle: '돋보기 아이콘', magTrayToggleDesc: '작업 표시줄에 돋보기 아이콘 표시'
  },
  hi: {
    apps: 'एप्लिकेशन', user: 'उपयोगकर्ता', loading: 'लोड हो रहा है...', search: 'खोजें...',
    calc: 'कैलकुलेटर', notepad: 'नोटपैड', fileman: 'फ़ाइल प्रबंधक',
    todo: 'कार्य सूची', weather: 'मौसम', settings: 'सेटिंग्स',
    terminal: 'टर्मिनल', clock: 'घड़ी', calendar: 'कैलेंडर',
    notifications: 'सूचनाएं', appstore: 'ऐप स्टोर', browser: 'ब्राउज़र',
    screenkeyboard: 'स्क्रीन कीबोर्ड', skbCopy: 'कॉपी', skbClear: 'साफ़', skbTrayShow: 'स्क्रीन कीबोर्ड दिखाएं',
    mute: 'म्यूट', unmute: 'अनम्यूट',
    settingsDisplay: 'डिस्प्ले', settingsLocation: 'स्थान', settingsSound: 'ध्वनि',
    settingsNetwork: 'नेटवर्क', settingsAbout: 'के बारे में', settingsLanguage: 'भाषा',
    brightness: 'चमक', brightnessDesc: 'स्क्रीन की चमक समायोजित करें',
    darkMode: 'डार्क मोड', darkModeDesc: 'डार्क थीम का उपयोग करें',
    resolution: 'रिज़ॉल्यूशन', mainVolume: 'मुख्य वॉल्यूम', systemSound: 'सिस्टम ध्वनि',
    notifSound: 'सूचना ध्वनि', wifi: 'वाई-फ़ाई', wifiDesc: 'वायरलेस नेटवर्क कनेक्शन',
    bluetooth: 'ब्लूटूथ', vpn: 'VPN', vpnDesc: 'निजी नेटवर्क टनल',
    version: 'संस्करण', checkUpdates: 'अपडेट की जांच करें',
    country: 'देश', countryDesc: 'मौसम और समय क्षेत्र के लिए',
    city: 'शहर', cityListing: 'शहर सूचीबद्ध', timezone: 'समय क्षेत्र',
    timezoneAuto: 'स्वचालित', location: 'स्थान', locationSaved: 'सहेजा गया',
    selectPlaceholder: 'चुनें...', language: 'भाषा', languageDesc: 'इंटरफ़ेस भाषा',
    notifTitle: 'सूचनाएं', noNotifications: 'कोई सूचना नहीं 🎉',
    markAllRead: 'सभी को पढ़ा गया चिह्नित करें', testNotifPlaceholder: 'परीक्षण सूचना जोड़ें...',
    send: 'भेजें', openApp: 'ऐप खोलें',
    storeTitle: 'ऐप स्टोर', appsAvailable: 'ऐप उपलब्ध',
    internal: 'आंतरिक', external: 'बाहरी', service: 'सेवा', install: 'इंस्टॉल', uninstall: 'अनइंस्टॉल', storeSearch: 'ऐप खोजें...', storeNoResults: 'कोई परिणाम नहीं',
    volMute: '🔇 म्यूट', volUnmute: '🔈 अनम्यूट',
    settingsWallpaper: 'वॉलपेपर', settingsSession: 'सत्र',
    magTrayShow: 'मैग्निफायर दिखाएं', magTrayToggle: 'मैग्निफायर आइकन', magTrayToggleDesc: 'टास्कबार में मैग्निफायर आइकन दिखाएं'
  },
  pt: {
    apps: 'Aplicações', user: 'Utilizador', loading: 'Carregando...', search: 'Pesquisar...',
    calc: 'Calculadora', notepad: 'Bloco de Notas', fileman: 'Gerenciador de Arquivos',
    todo: 'Lista de Tarefas', weather: 'Clima', settings: 'Configurações',
    terminal: 'Terminal', clock: 'Relógio', calendar: 'Calendário',
    notifications: 'Notificações', appstore: 'Loja de Apps', browser: 'Navegador',
    screenkeyboard: 'Teclado Virtual', skbCopy: 'Copiar', skbClear: 'Limpar', skbTrayShow: 'Mostrar Teclado Virtual',
    mute: 'Silenciar', unmute: 'Ativar Som',
    settingsDisplay: 'Tela', settingsLocation: 'Localização', settingsSound: 'Som',
    settingsNetwork: 'Rede', settingsAbout: 'Sobre', settingsLanguage: 'Idioma',
    brightness: 'Brilho', brightnessDesc: 'Ajustar brilho da tela',
    darkMode: 'Modo Escuro', darkModeDesc: 'Usar tema escuro',
    resolution: 'Resolução', mainVolume: 'Volume Principal', systemSound: 'Som do Sistema',
    notifSound: 'Som de Notificação', wifi: 'Wi-Fi', wifiDesc: 'Conexão de rede sem fio',
    bluetooth: 'Bluetooth', vpn: 'VPN', vpnDesc: 'Túnel de rede privada',
    version: 'Versão', checkUpdates: 'Verificar Atualizações',
    country: 'País', countryDesc: 'Para clima e fuso horário',
    city: 'Cidade', cityListing: 'cidades listadas', timezone: 'Fuso Horário',
    timezoneAuto: 'Automático', location: 'Localização', locationSaved: 'Salvo',
    selectPlaceholder: 'Selecionar...', language: 'Idioma', languageDesc: 'Idioma da interface',
    notifTitle: 'Notificações', noNotifications: 'Nenhuma notificação 🎉',
    markAllRead: 'Marcar Todas como Lidas', testNotifPlaceholder: 'Adicionar notificação de teste...',
    send: 'Enviar', openApp: 'Abrir App',
    storeTitle: 'Loja de Apps', appsAvailable: 'apps disponíveis',
    internal: 'Interno', external: 'Externo', service: 'Serviço', install: 'Instalar', uninstall: 'Desinstalar', storeSearch: 'Pesquisar apps...', storeNoResults: 'Nenhum resultado encontrado',
    volMute: '🔇 Silenciar', volUnmute: '🔈 Ativar Som',
    settingsWallpaper: 'Papel de Parede', settingsSession: 'Sessão',
    magTrayShow: 'Mostrar Lupa', magTrayToggle: 'Ícone da Lupa', magTrayToggleDesc: 'Mostrar ícone da lupa na barra de tarefas'
  }`;

  // Insert before the closing }; of main I18N
  content = content.substring(0, mainI18NEnd) + mobileNewLangs + content.substring(mainI18NEnd);

  // ── 3b. Reminder ──
  const mReminderIt = "Object.assign(I18N.it, { reminderDismiss:'Chiudi' });";
  content = insertAfter(content, mReminderIt, `
Object.assign(I18N.ar, { reminderDismiss:'إغلاق' });
Object.assign(I18N.ko, { reminderDismiss:'닫기' });
Object.assign(I18N.hi, { reminderDismiss:'बंद करें' });
Object.assign(I18N.pt, { reminderDismiss:'Dispensar' });`);

  // ── 3c. LANG_OPTIONS ──
  const mLangOpt = "{ code: 'it', label: 'Italiano', flag: '🇮🇹' }";
  content = insertAfter(content, mLangOpt, `,
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' }`);

  // ── 3d. LOCALE_MAP ──
  const mLocaleMap = "const LOCALE_MAP = { tr:'tr-TR', en:'en-US', de:'de-DE', fr:'fr-FR', es:'es-ES', ru:'ru-RU', zh:'zh-CN', ja:'ja-JP', it:'it-IT' };";
  content = content.replace(mLocaleMap, "const LOCALE_MAP = { tr:'tr-TR', en:'en-US', de:'de-DE', fr:'fr-FR', es:'es-ES', ru:'ru-RU', zh:'zh-CN', ja:'ja-JP', it:'it-IT', ar:'ar-SA', ko:'ko-KR', hi:'hi-IN', pt:'pt-BR' };");

  // ── 3e. Extended I18N ──
  // Mobile extended ends with it block for browser bookmarks
  const mExtItMarker = "brBack:'Indietro', brForward:'Avanti', brReload:'Ricarica', brHome:'Home', brBookmarks:'Segnalibri'\n});";
  content = insertAfter(content, mExtItMarker, `
Object.assign(I18N.ar, {
  ctxOpen:'فتح', ctxMove:'نقل', ctxCopy:'نسخ', ctxDesktop:'سطح المكتب',
  start:'ابدأ', fullscreen:'ملء الشاشة', fullscreenExit:'الخروج من ملء الشاشة',
  notepadClear:'مسح', notepadCopy:'نسخ', notepadPlaceholder:'ابدأ الكتابة...', notepadChars:'حرف', notepadWords:'كلمة',
  todoTitle:'قائمة المهام', todoCompleted:'مكتمل', todoPlaceholder:'إضافة مهمة جديدة...', todoAdd:'إضافة', todoEmpty:'لا توجد مهام بعد 🎉',
  todoDefault1:'جرب Aysi Cloud Computer', todoDefault2:'أضف تطبيقات جديدة',
  fmDesktop:'سطح المكتب', fmDocuments:'المستندات', fmDownloads:'التنزيلات', fmPictures:'الصور', fmMusic:'الموسيقى', fmTrash:'سلة المهملات',
  fmItems:'عنصر', fmSelected:'محدد', fmOpening:'جاري الفتح...', fmPathPrefix:'C:\\\\المستخدمون\\\\المستخدم\\\\',
  weatherNow:'الآن', weatherHumidity:'الرطوبة', weatherWind:'الرياح', weatherFeelsLike:'يشعر كأنه', weatherHourly:'التوقعات بالساعة', weatherUnknown:'غير معروف',
  calToday:'اليوم', calAddEvent:'+ حدث', calEventPlaceholder:'اسم الحدث...', calAdd:'إضافة', calNoEvents:'لا أحداث في هذا التاريخ', calMore:'المزيد',
  calBlue:'أزرق', calGreen:'أخضر', calOrange:'برتقالي', calRed:'أحمر', calPurple:'بنفسجي',
  termBarTitle:'bash - مستخدم@vuedesktop', termWelcome:'Aysi Cloud Computer Terminal v1.0 — الأوامر: help, ls, date, clear, echo [نص]',
  termHelpText:'الأوامر: help, ls, date, clear, echo [نص], whoami, pwd', termNotFound:'الأمر غير موجود', termHelpHint:'اكتب "help".',
  termPlaceholder:'أدخل الأمر...', termUser:'مستخدم', termPwd:'/home/مستخدم',
  notifCalTitle:'التقويم', notifCalText:'اجتماع غداً الساعة 10:00.', notifTaskTitle:'المهام', notifTaskText:'3 مهام بانتظار الإكمال.',
  notifSysTitle:'النظام', notifSysText:'تحديث متاح: v1.1', notifTermTitle:'الطرفية', notifTermText:'اكتملت العملية في الخلفية.',
  notifTime2h:'قبل ساعتين', notifTime4h:'قبل 4 ساعات', notifYesterday:'أمس', notifNow:'الآن', notifLabel:'إشعار',
  mediaPrev:'السابق', mediaNext:'التالي',
  brUrlPlaceholder:'اكتب عنوان URL أو ابحث...', brAdd:'إضافة', brRetry:'إعادة المحاولة', brNewTab:'علامة تبويب جديدة',
  brBack:'رجوع', brForward:'تقدم', brReload:'تحديث', brHome:'الرئيسية', brBookmarks:'الإشارات المرجعية'
});
Object.assign(I18N.ko, {
  ctxOpen:'열기', ctxMove:'이동', ctxCopy:'복사', ctxDesktop:'데스크톱',
  start:'시작', fullscreen:'전체 화면', fullscreenExit:'전체 화면 종료',
  notepadClear:'지우기', notepadCopy:'복사', notepadPlaceholder:'입력을 시작하세요...', notepadChars:'자', notepadWords:'단어',
  todoTitle:'할 일 목록', todoCompleted:'완료', todoPlaceholder:'새 작업 추가...', todoAdd:'추가', todoEmpty:'아직 작업이 없습니다 🎉',
  todoDefault1:'Aysi Cloud Computer 체험', todoDefault2:'새 앱 추가',
  fmDesktop:'데스크톱', fmDocuments:'문서', fmDownloads:'다운로드', fmPictures:'사진', fmMusic:'음악', fmTrash:'휴지통',
  fmItems:'항목', fmSelected:'선택됨', fmOpening:'여는 중...', fmPathPrefix:'C:\\\\Users\\\\User\\\\',
  weatherNow:'현재', weatherHumidity:'습도', weatherWind:'바람', weatherFeelsLike:'체감', weatherHourly:'시간별 예보', weatherUnknown:'알 수 없음',
  calToday:'오늘', calAddEvent:'+ 이벤트', calEventPlaceholder:'이벤트 이름...', calAdd:'추가', calNoEvents:'이 날짜에 이벤트 없음', calMore:'더보기',
  calBlue:'파란색', calGreen:'초록색', calOrange:'주황색', calRed:'빨간색', calPurple:'보라색',
  termBarTitle:'bash - user@vuedesktop', termWelcome:'Aysi Cloud Computer 터미널 v1.0 — 명령어: help, ls, date, clear, echo [텍스트]',
  termHelpText:'명령어: help, ls, date, clear, echo [텍스트], whoami, pwd', termNotFound:'명령어를 찾을 수 없습니다', termHelpHint:'"help"를 입력하세요.',
  termPlaceholder:'명령어 입력...', termUser:'사용자', termPwd:'/home/사용자',
  notifCalTitle:'달력', notifCalText:'내일 오전 10시에 회의가 있습니다.', notifTaskTitle:'작업', notifTaskText:'3개의 작업이 완료 대기 중입니다.',
  notifSysTitle:'시스템', notifSysText:'업데이트 사용 가능: v1.1', notifTermTitle:'터미널', notifTermText:'백그라운드 프로세스 완료.',
  notifTime2h:'2시간 전', notifTime4h:'4시간 전', notifYesterday:'어제', notifNow:'지금', notifLabel:'알림',
  mediaPrev:'이전', mediaNext:'다음',
  brUrlPlaceholder:'URL 또는 검색어 입력...', brAdd:'추가', brRetry:'재시도', brNewTab:'새 탭',
  brBack:'뒤로', brForward:'앞으로', brReload:'새로고침', brHome:'홈', brBookmarks:'북마크'
});
Object.assign(I18N.hi, {
  ctxOpen:'खोलें', ctxMove:'स्थानांतरित करें', ctxCopy:'कॉपी', ctxDesktop:'डेस्कटॉप',
  start:'शुरू', fullscreen:'पूर्ण स्क्रीन', fullscreenExit:'पूर्ण स्क्रीन से बाहर निकलें',
  notepadClear:'साफ़ करें', notepadCopy:'कॉपी', notepadPlaceholder:'टाइप करना शुरू करें...', notepadChars:'अक्षर', notepadWords:'शब्द',
  todoTitle:'कार्य सूची', todoCompleted:'पूर्ण', todoPlaceholder:'नया कार्य जोड़ें...', todoAdd:'जोड़ें', todoEmpty:'अभी तक कोई कार्य नहीं 🎉',
  todoDefault1:'Aysi Cloud Computer आज़माएं', todoDefault2:'नए ऐप्स जोड़ें',
  fmDesktop:'डेस्कटॉप', fmDocuments:'दस्तावेज़', fmDownloads:'डाउनलोड', fmPictures:'चित्र', fmMusic:'संगीत', fmTrash:'कचरा',
  fmItems:'आइटम', fmSelected:'चयनित', fmOpening:'खोल रहा है...', fmPathPrefix:'C:\\\\Users\\\\User\\\\',
  weatherNow:'अभी', weatherHumidity:'नमी', weatherWind:'हवा', weatherFeelsLike:'महसूस होता है', weatherHourly:'प्रति घंटा पूर्वानुमान', weatherUnknown:'अज्ञात',
  calToday:'आज', calAddEvent:'+ कार्यक्रम', calEventPlaceholder:'कार्यक्रम का नाम...', calAdd:'जोड़ें', calNoEvents:'इस तिथि पर कोई कार्यक्रम नहीं', calMore:'और',
  calBlue:'नीला', calGreen:'हरा', calOrange:'नारंगी', calRed:'लाल', calPurple:'बैंगनी',
  termBarTitle:'bash - user@vuedesktop', termWelcome:'Aysi Cloud Computer टर्मिनल v1.0 — कमांड: help, ls, date, clear, echo [टेक्स्ट]',
  termHelpText:'कमांड: help, ls, date, clear, echo [टेक्स्ट], whoami, pwd', termNotFound:'कमांड नहीं मिला', termHelpHint:'"help" टाइप करें।',
  termPlaceholder:'कमांड दर्ज करें...', termUser:'उपयोगकर्ता', termPwd:'/home/उपयोगकर्ता',
  notifCalTitle:'कैलेंडर', notifCalText:'कल सुबह 10:00 बजे बैठक है।', notifTaskTitle:'कार्य', notifTaskText:'3 कार्य पूरे होने की प्रतीक्षा में हैं।',
  notifSysTitle:'सिस्टम', notifSysText:'अपडेट उपलब्ध: v1.1', notifTermTitle:'टर्मिनल', notifTermText:'बैकग्राउंड प्रोसेस पूर्ण हुई।',
  notifTime2h:'2 घंटे पहले', notifTime4h:'4 घंटे पहले', notifYesterday:'कल', notifNow:'अभी', notifLabel:'सूचना',
  mediaPrev:'पिछला', mediaNext:'अगला',
  brUrlPlaceholder:'URL या खोज टाइप करें...', brAdd:'जोड़ें', brRetry:'पुनः प्रयास', brNewTab:'नया टैब',
  brBack:'पीछे', brForward:'आगे', brReload:'रीलोड', brHome:'होम', brBookmarks:'बुकमार्क'
});
Object.assign(I18N.pt, {
  ctxOpen:'Abrir', ctxMove:'Mover', ctxCopy:'Copiar', ctxDesktop:'Área de Trabalho',
  start:'Iniciar', fullscreen:'Tela Cheia', fullscreenExit:'Sair da Tela Cheia',
  notepadClear:'Limpar', notepadCopy:'Copiar', notepadPlaceholder:'Comece a digitar...', notepadChars:'caracteres', notepadWords:'palavras',
  todoTitle:'Lista de Tarefas', todoCompleted:'concluídas', todoPlaceholder:'Adicionar nova tarefa...', todoAdd:'Adicionar', todoEmpty:'Nenhuma tarefa ainda 🎉',
  todoDefault1:'Experimentar Aysi Cloud Computer', todoDefault2:'Adicionar novos apps',
  fmDesktop:'Área de Trabalho', fmDocuments:'Documentos', fmDownloads:'Downloads', fmPictures:'Imagens', fmMusic:'Música', fmTrash:'Lixeira',
  fmItems:'itens', fmSelected:'selecionado', fmOpening:'abrindo...', fmPathPrefix:'C:\\\\Usuários\\\\Usuário\\\\',
  weatherNow:'Agora', weatherHumidity:'Umidade', weatherWind:'Vento', weatherFeelsLike:'Sensação', weatherHourly:'Previsão por Hora', weatherUnknown:'Desconhecido',
  calToday:'Hoje', calAddEvent:'+ Evento', calEventPlaceholder:'Nome do evento...', calAdd:'Adicionar', calNoEvents:'Nenhum evento nesta data', calMore:'mais',
  calBlue:'Azul', calGreen:'Verde', calOrange:'Laranja', calRed:'Vermelho', calPurple:'Roxo',
  termBarTitle:'bash - usuario@vuedesktop', termWelcome:'Aysi Cloud Computer Terminal v1.0 — Comandos: help, ls, date, clear, echo [texto]',
  termHelpText:'Comandos: help, ls, date, clear, echo [texto], whoami, pwd', termNotFound:'Comando não encontrado', termHelpHint:'Digite "help".',
  termPlaceholder:'digite o comando...', termUser:'usuario', termPwd:'/home/usuario',
  notifCalTitle:'Calendário', notifCalText:'Reunião amanhã às 10:00.', notifTaskTitle:'Tarefas', notifTaskText:'3 tarefas aguardando conclusão.',
  notifSysTitle:'Sistema', notifSysText:'Atualização disponível: v1.1', notifTermTitle:'Terminal', notifTermText:'Processo em segundo plano concluído.',
  notifTime2h:'Há 2 horas', notifTime4h:'Há 4 horas', notifYesterday:'Ontem', notifNow:'Agora', notifLabel:'Notificação',
  mediaPrev:'Anterior', mediaNext:'Próximo',
  brUrlPlaceholder:'Digite uma URL ou pesquise...', brAdd:'Adicionar', brRetry:'Tentar Novamente', brNewTab:'Nova Aba',
  brBack:'Voltar', brForward:'Avançar', brReload:'Recarregar', brHome:'Início', brBookmarks:'Favoritos'
});`);

  // ── 3f. WMO_DESC_I18N ──
  const mWmoIt = "it:{0:'Sereno',1:'Poco nuvoloso',2:'Parzialmente nuvoloso',3:'Coperto',45:'Nebbia',48:'Nebbia gelata',51:'Pioviggine leggera',53:'Pioviggine',55:'Pioviggine fitta',61:'Pioggia leggera',63:'Pioggia',65:'Pioggia forte',71:'Neve leggera',73:'Nevicata',75:'Neve forte',77:'Granuli di neve',80:'Rovesci leggeri',81:'Rovesci',82:'Rovesci forti',85:'Rovesci di neve leggeri',86:'Rovesci di neve',95:'Temporale',96:'Temporale con grandine',99:'Grandine violenta'}";
  content = insertAfter(content, mWmoIt, `,
  ar:{0:'صافي',1:'غائم جزئياً',2:'غائم في الغالب',3:'ملبد بالغيوم',45:'ضبابي',48:'ضباب صقيعي',51:'رذاذ خفيف',53:'رذاذ',55:'رذاذ كثيف',61:'مطر خفيف',63:'ماطر',65:'مطر غزير',71:'ثلج خفيف',73:'تساقط ثلوج',75:'ثلج كثيف',77:'حبيبات ثلجية',80:'زخات خفيفة',81:'زخات',82:'زخات شديدة',85:'زخات ثلجية خفيفة',86:'زخات ثلجية',95:'عاصفة رعدية',96:'عاصفة رعدية مع برد',99:'برد شديد'},
  ko:{0:'맑음',1:'약간 흐림',2:'대체로 흐림',3:'흐림',45:'안개',48:'상고대 안개',51:'가벼운 이슬비',53:'이슬비',55:'짙은 이슬비',61:'약한 비',63:'비',65:'강한 비',71:'약한 눈',73:'눈',75:'강한 눈',77:'싸락눈',80:'가벼운 소나기',81:'소나기',82:'강한 소나기',85:'가벼운 눈소나기',86:'눈소나기',95:'뇌우',96:'우박 동반 뇌우',99:'심한 우박'},
  hi:{0:'साफ',1:'आंशिक बादल',2:'अधिकतर बादल',3:'बादल छाए',45:'कोहरा',48:'पाला कोहरा',51:'हल्की बूंदाबांदी',53:'बूंदाबांदी',55:'घनी बूंदाबांदी',61:'हल्की बारिश',63:'बारिश',65:'भारी बारिश',71:'हल्की बर्फ',73:'बर्फबारी',75:'भारी बर्फ',77:'बर्फ के दाने',80:'हल्की बौछारें',81:'बौछारें',82:'भारी बौछारें',85:'हल्की हिमपात बौछारें',86:'हिमपात बौछारें',95:'आंधी',96:'ओलों के साथ आंधी',99:'भीषण ओले'},
  pt:{0:'Limpo',1:'Parcialmente nublado',2:'Predominantemente nublado',3:'Nublado',45:'Neblina',48:'Neblina congelante',51:'Garoa leve',53:'Garoa',55:'Garoa densa',61:'Chuva fraca',63:'Chuvoso',65:'Chuva forte',71:'Neve fraca',73:'Queda de neve',75:'Neve forte',77:'Grãos de neve',80:'Pancadas leves',81:'Pancadas',82:'Pancadas fortes',85:'Pancadas de neve leves',86:'Pancadas de neve',95:'Trovoada',96:'Trovoada com granizo',99:'Granizo severo'}`);

  // ── 3g. EP_LOCALES ──
  const mEpItEnd = "it:{name:'it',el:{datepicker:{now:'Ora',today:'Oggi',cancel:'Annulla',clear:'Cancella',confirm:'OK',";
  // Find the end of the it EP_LOCALES entry - look for the closing }}}
  const mEpItFullEnd = content.indexOf("table:{emptyText:'Nessun dato'}}}",
    content.lastIndexOf("it:{name:'it'"));
  if (mEpItFullEnd !== -1) {
    const insertPos = mEpItFullEnd + "table:{emptyText:'Nessun dato'}}}".length;
    const mEpNew = `,
  ar:{name:'ar',el:{datepicker:{now:'الآن',today:'اليوم',cancel:'إلغاء',clear:'مسح',confirm:'موافق',dateTablePrompt:'استخدم مفاتيح الأسهم و Enter لتحديد اليوم',monthTablePrompt:'استخدم مفاتيح الأسهم و Enter لتحديد الشهر',yearTablePrompt:'استخدم مفاتيح الأسهم و Enter لتحديد السنة',selectedDate:'التاريخ المحدد',selectDate:'اختر التاريخ',selectTime:'اختر الوقت',startDate:'تاريخ البداية',startTime:'وقت البداية',endDate:'تاريخ النهاية',endTime:'وقت النهاية',prevYear:'السنة السابقة',nextYear:'السنة التالية',prevMonth:'الشهر السابق',nextMonth:'الشهر التالي',year:'',month1:'يناير',month2:'فبراير',month3:'مارس',month4:'أبريل',month5:'مايو',month6:'يونيو',month7:'يوليو',month8:'أغسطس',month9:'سبتمبر',month10:'أكتوبر',month11:'نوفمبر',month12:'ديسمبر',weeks:{sun:'أحد',mon:'إثن',tue:'ثلا',wed:'أرب',thu:'خمي',fri:'جمع',sat:'سبت'},weeksFull:{sun:'الأحد',mon:'الإثنين',tue:'الثلاثاء',wed:'الأربعاء',thu:'الخميس',fri:'الجمعة',sat:'السبت'},months:{jan:'ينا',feb:'فبر',mar:'مار',apr:'أبر',may:'ماي',jun:'يون',jul:'يول',aug:'أغس',sep:'سبت',oct:'أكت',nov:'نوف',dec:'ديس'}},select:{noMatch:'لا توجد بيانات مطابقة',noData:'لا توجد بيانات',placeholder:'اختر'},dialog:{close:'إغلاق'},messagebox:{title:'رسالة',confirm:'موافق',cancel:'إلغاء'},table:{emptyText:'لا توجد بيانات'}}},
  ko:{name:'ko',el:{datepicker:{now:'지금',today:'오늘',cancel:'취소',clear:'삭제',confirm:'확인',dateTablePrompt:'화살표 키와 Enter로 날짜를 선택하세요',monthTablePrompt:'화살표 키와 Enter로 월을 선택하세요',yearTablePrompt:'화살표 키와 Enter로 연도를 선택하세요',selectedDate:'선택한 날짜',selectDate:'날짜 선택',selectTime:'시간 선택',startDate:'시작 날짜',startTime:'시작 시간',endDate:'종료 날짜',endTime:'종료 시간',prevYear:'이전 해',nextYear:'다음 해',prevMonth:'이전 달',nextMonth:'다음 달',year:'년',month1:'1월',month2:'2월',month3:'3월',month4:'4월',month5:'5월',month6:'6월',month7:'7월',month8:'8월',month9:'9월',month10:'10월',month11:'11월',month12:'12월',weeks:{sun:'일',mon:'월',tue:'화',wed:'수',thu:'목',fri:'금',sat:'토'},weeksFull:{sun:'일요일',mon:'월요일',tue:'화요일',wed:'수요일',thu:'목요일',fri:'금요일',sat:'토요일'},months:{jan:'1월',feb:'2월',mar:'3월',apr:'4월',may:'5월',jun:'6월',jul:'7월',aug:'8월',sep:'9월',oct:'10월',nov:'11월',dec:'12월'}},select:{noMatch:'일치하는 데이터 없음',noData:'데이터 없음',placeholder:'선택'},dialog:{close:'닫기'},messagebox:{title:'메시지',confirm:'확인',cancel:'취소'},table:{emptyText:'데이터 없음'}}},
  hi:{name:'hi',el:{datepicker:{now:'अभी',today:'आज',cancel:'रद्द',clear:'साफ़',confirm:'ठीक',dateTablePrompt:'दिन चुनने के लिए तीर कुंजियों और Enter का उपयोग करें',monthTablePrompt:'महीना चुनने के लिए तीर कुंजियों और Enter का उपयोग करें',yearTablePrompt:'वर्ष चुनने के लिए तीर कुंजियों और Enter का उपयोग करें',selectedDate:'चयनित तिथि',selectDate:'तिथि चुनें',selectTime:'समय चुनें',startDate:'प्रारंभ तिथि',startTime:'प्रारंभ समय',endDate:'समाप्ति तिथि',endTime:'समाप्ति समय',prevYear:'पिछला वर्ष',nextYear:'अगला वर्ष',prevMonth:'पिछला महीना',nextMonth:'अगला महीना',year:'',month1:'जनवरी',month2:'फ़रवरी',month3:'मार्च',month4:'अप्रैल',month5:'मई',month6:'जून',month7:'जुलाई',month8:'अगस्त',month9:'सितंबर',month10:'अक्तूबर',month11:'नवंबर',month12:'दिसंबर',weeks:{sun:'रवि',mon:'सोम',tue:'मंगल',wed:'बुध',thu:'गुरु',fri:'शुक्र',sat:'शनि'},weeksFull:{sun:'रविवार',mon:'सोमवार',tue:'मंगलवार',wed:'बुधवार',thu:'गुरुवार',fri:'शुक्रवार',sat:'शनिवार'},months:{jan:'जन',feb:'फ़र',mar:'मार्च',apr:'अप्रै',may:'मई',jun:'जून',jul:'जुला',aug:'अग',sep:'सित',oct:'अक्तू',nov:'नव',dec:'दिस'}},select:{noMatch:'कोई मिलान नहीं',noData:'कोई डेटा नहीं',placeholder:'चुनें'},dialog:{close:'बंद करें'},messagebox:{title:'संदेश',confirm:'ठीक',cancel:'रद्द'},table:{emptyText:'कोई डेटा नहीं'}}},
  pt:{name:'pt',el:{datepicker:{now:'Agora',today:'Hoje',cancel:'Cancelar',clear:'Limpar',confirm:'OK',dateTablePrompt:'Use as setas e Enter para selecionar o dia',monthTablePrompt:'Use as setas e Enter para selecionar o mês',yearTablePrompt:'Use as setas e Enter para selecionar o ano',selectedDate:'Data selecionada',selectDate:'Selecionar data',selectTime:'Selecionar hora',startDate:'Data Inicial',startTime:'Hora Inicial',endDate:'Data Final',endTime:'Hora Final',prevYear:'Ano Anterior',nextYear:'Próximo Ano',prevMonth:'Mês Anterior',nextMonth:'Próximo Mês',year:'',month1:'Janeiro',month2:'Fevereiro',month3:'Março',month4:'Abril',month5:'Maio',month6:'Junho',month7:'Julho',month8:'Agosto',month9:'Setembro',month10:'Outubro',month11:'Novembro',month12:'Dezembro',weeks:{sun:'Dom',mon:'Seg',tue:'Ter',wed:'Qua',thu:'Qui',fri:'Sex',sat:'Sáb'},weeksFull:{sun:'Domingo',mon:'Segunda-feira',tue:'Terça-feira',wed:'Quarta-feira',thu:'Quinta-feira',fri:'Sexta-feira',sat:'Sábado'},months:{jan:'Jan',feb:'Fev',mar:'Mar',apr:'Abr',may:'Mai',jun:'Jun',jul:'Jul',aug:'Ago',sep:'Set',oct:'Out',nov:'Nov',dec:'Dez'}},select:{noMatch:'Nenhum dado correspondente',noData:'Sem dados',placeholder:'Selecionar'},dialog:{close:'Fechar'},messagebox:{title:'Mensagem',confirm:'OK',cancel:'Cancelar'},table:{emptyText:'Sem dados'}}}`;
    content = content.substring(0, insertPos) + mEpNew + content.substring(insertPos);
  }

  fs.writeFileSync(path.join(ROOT, 'mobile.html'), content, 'utf8');
  console.log('  Updated mobile.html');
}

// =======================================================
// RUN
// =======================================================
updateSetupHtml();
updateIndexHtml();
updateMobileHtml();
console.log('\n=== ALL DONE ===');
