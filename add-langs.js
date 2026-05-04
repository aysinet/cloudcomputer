/**
 * Script to add ar, ko, hi, pt translations to all store app.json and component.js files
 * Run with: node add-langs.js
 */
const fs = require('fs');
const path = require('path');

const storeDir = path.join(__dirname, 'apps', 'store');
const TARGET_LANGS = ['ar', 'ko', 'hi', 'pt'];
const requestedAppIds = process.argv.slice(2).filter(Boolean);
const requestedAppSet = requestedAppIds.length ? new Set(requestedAppIds) : null;

function shouldProcessApp(appId) {
  return !requestedAppSet || requestedAppSet.has(appId);
}

// ============================================================
// APP.JSON TRANSLATIONS (name + description for each app)
// ============================================================
const appJsonTranslations = {
  "archiver": {
    ar: { name: "أرشيف", description: "ضغط واستخراج أرشيفات ZIP و GZIP" },
    ko: { name: "압축기", description: "ZIP 및 GZIP 아카이브 압축 및 해제" },
    hi: { name: "आर्काइवर", description: "ZIP और GZIP आर्काइव को संपीड़ित और निकालें" },
    pt: { name: "Arquivador", description: "Comprimir e extrair arquivos ZIP e GZIP" }
  },
  "audio-editor": {
    ar: { name: "محرر الصوت", description: "تحرير ملفات الصوت — قص، نسخ، تأثيرات وتصدير WAV" },
    ko: { name: "오디오 편집기", description: "오디오 파일 편집 — 자르기, 복사, 효과 및 WAV 내보내기" },
    hi: { name: "ऑडियो संपादक", description: "ऑडियो फ़ाइलें संपादित करें — कट, कॉपी, इफेक्ट और WAV निर्यात" },
    pt: { name: "Editor de Áudio", description: "Editar arquivos de áudio — cortar, copiar, efeitos e exportar WAV" }
  },
  "audio-recorder": {
    ar: { name: "مسجل الصوت", description: "تسجيل الميكروفون — تسجيل WAV في الوقت الفعلي إلى الخادم" },
    ko: { name: "오디오 레코더", description: "마이크 녹음 — 서버로 실시간 WAV 녹음" },
    hi: { name: "ऑडियो रिकॉर्डर", description: "माइक्रोफ़ोन रिकॉर्डिंग — सर्वर पर रीयल-टाइम WAV रिकॉर्डिंग" },
    pt: { name: "Gravador de Áudio", description: "Gravação de microfone — gravação WAV em tempo real para o servidor" }
  },
  "backup-restore": {
    ar: { name: "النسخ الاحتياطي والاستعادة", description: "النسخ الاحتياطي والاستعادة للنظام — جميع البيانات والإعدادات والملفات" },
    ko: { name: "백업 및 복원", description: "시스템 백업 및 복원 — 모든 데이터, 설정 및 파일" },
    hi: { name: "बैकअप और रिस्टोर", description: "सिस्टम बैकअप और रिस्टोर — सभी डेटा, सेटिंग्स और फ़ाइलें" },
    pt: { name: "Backup e Restauração", description: "Backup e restauração do sistema — todos os dados, configurações e arquivos" }
  },
  "billiards": {
    ar: { name: "بلياردو", description: "لعبة بلياردو 8 كرات — محرك فيزيائي، خصم ذكاء اصطناعي" },
    ko: { name: "당구", description: "8볼 당구 게임 — 물리 엔진, AI 상대" },
    hi: { name: "बिलियर्ड्स", description: "8-बॉल पूल गेम — फिजिक्स इंजन, AI प्रतिद्वंद्वी" },
    pt: { name: "Bilhar", description: "Jogo de bilhar 8-ball — motor de física, oponente IA" }
  },
  "book-reader": {
    ar: { name: "قارئ الكتب", description: "قارئ الكتب الإلكترونية — يدعم صيغ EPUB، PDF، TXT، HTML، FB2" },
    ko: { name: "북 리더", description: "전자책 리더 — EPUB, PDF, TXT, HTML, FB2 형식 지원" },
    hi: { name: "बुक रीडर", description: "ई-बुक रीडर — EPUB, PDF, TXT, HTML, FB2 प्रारूप समर्थन" },
    pt: { name: "Leitor de Livros", description: "Leitor de e-books — suporta formatos EPUB, PDF, TXT, HTML, FB2" }
  },
  "budget": {
    ar: { name: "الميزانية", description: "تتبع الميزانية — سجلات الدخل/المصروفات، تخطيط المدفوعات، رسوم بيانية" },
    ko: { name: "예산", description: "예산 추적기 — 수입/지출 기록, 결제 계획, 차트" },
    hi: { name: "बजट", description: "बजट ट्रैकर — आय/व्यय रिकॉर्ड, भुगतान योजना, चार्ट" },
    pt: { name: "Orçamento", description: "Rastreador de orçamento — registros de receita/despesa, planejamento de pagamentos, gráficos" }
  },
  "camrecorder": {
    ar: { name: "الكاميرا", description: "التقاط الصور وتسجيل الفيديو بالكاميرا" },
    ko: { name: "카메라", description: "카메라로 사진 촬영 및 비디오 녹화" },
    hi: { name: "कैमरा", description: "कैमरे से फ़ोटो लें और वीडियो रिकॉर्ड करें" },
    pt: { name: "Câmera", description: "Tire fotos e grave vídeos com sua câmera" }
  },
  "chess": {
    ar: { name: "شطرنج", description: "لعبة شطرنج تعتمد على Docker" },
    ko: { name: "체스", description: "Docker 기반 체스 게임" },
    hi: { name: "शतरंज", description: "Docker-आधारित शतरंज गेम" },
    pt: { name: "Xadrez", description: "Jogo de xadrez baseado em Docker" }
  },
  "circuit": {
    ar: { name: "مصمم الدوائر", description: "مصمم مخططات الدوائر الإلكترونية — مكتبة المكونات، رسم الأسلاك، تحرير الخصائص، تصدير PNG" },
    ko: { name: "회로 설계", description: "전자 회로 설계 — 부품 라이브러리, 배선, 속성 편집, PNG 내보내기" },
    hi: { name: "सर्किट डिजाइनर", description: "इलेक्ट्रॉनिक सर्किट डिजाइनर — कंपोनेंट लाइब्रेरी, वायर ड्राइंग, प्रॉपर्टी एडिटिंग, PNG निर्यात" },
    pt: { name: "Designer de Circuitos", description: "Designer de circuitos eletrônicos — biblioteca de componentes, desenho de fios, edição de propriedades, exportação PNG" }
  },
  "codeeditor": {
    ar: { name: "محرر الأكواد", description: "محرر أكواد Monaco — تمييز بناء الجملة، فتح/حفظ الملفات" },
    ko: { name: "코드 편집기", description: "Monaco 기반 코드 편집기 — 구문 강조, 파일 열기/저장" },
    hi: { name: "कोड एडिटर", description: "Monaco-आधारित कोड एडिटर — सिंटैक्स हाइलाइटिंग, फ़ाइल खोलें/सहेजें" },
    pt: { name: "Editor de Código", description: "Editor de código baseado em Monaco — destaque de sintaxe, abrir/salvar arquivos" }
  },
  "coin-tracker": {
    ar: { name: "متتبع العملات", description: "متتبع العملات المشفرة — أسعار مباشرة، المفضلة، المحفظة" },
    ko: { name: "코인 트래커", description: "암호화폐 추적기 — 실시간 가격, 즐겨찾기, 포트폴리오" },
    hi: { name: "कॉइन ट्रैकर", description: "क्रिप्टोकरेंसी ट्रैकर — लाइव कीमतें, पसंदीदा, पोर्टफोलियो" },
    pt: { name: "Rastreador de Moedas", description: "Rastreador de criptomoedas — preços ao vivo, favoritos, portfólio" }
  },
  "copilot": {
    ar: { name: "كوبايلوت", description: "مساعد ذكاء اصطناعي يعتمد على GitHub Copilot CLI — إنشاء الأكواد على الخادم، طرح الأسئلة، تحرير الملفات" },
    ko: { name: "코파일럿", description: "GitHub Copilot CLI 기반 AI 도우미 — 서버에서 코드 생성, 질문, 파일 편집" },
    hi: { name: "कोपायलट", description: "GitHub Copilot CLI आधारित AI सहायक — सर्वर पर कोड जनरेट करें, प्रश्न पूछें, फ़ाइलें संपादित करें" },
    pt: { name: "Copilot", description: "Assistente de IA baseado em GitHub Copilot CLI — gerar código no servidor, fazer perguntas, editar arquivos" }
  },
  "doom": {
    ar: { name: "دووم", description: "لعبة Doom الكلاسيكية — العب في المتصفح" },
    ko: { name: "둠", description: "클래식 둠 게임 — 브라우저에서 플레이" },
    hi: { name: "डूम", description: "क्लासिक Doom गेम — ब्राउज़र में खेलें" },
    pt: { name: "Doom", description: "Jogo Doom clássico — jogue no navegador" }
  },
  "eth-wallet": {
    ar: { name: "محفظة ETH", description: "محفظة إيثريوم — الرصيد، الإرسال، سجل المعاملات" },
    ko: { name: "ETH 지갑", description: "이더리움 지갑 — 잔액, 전송, 거래 내역" },
    hi: { name: "ETH वॉलेट", description: "इथेरियम वॉलेट — बैलेंस, भेजें, लेनदेन इतिहास" },
    pt: { name: "Carteira ETH", description: "Carteira Ethereum — saldo, enviar, histórico de transações" }
  },
  "ext-example": {
    ar: { name: "تطبيق خارجي", description: "مثال تطبيق خارجي (localhost:9090)" },
    ko: { name: "외부 앱", description: "외부 애플리케이션 예시 (localhost:9090)" },
    hi: { name: "बाहरी ऐप", description: "बाहरी एप्लिकेशन उदाहरण (localhost:9090)" },
    pt: { name: "App Externo", description: "Exemplo de aplicação externa (localhost:9090)" }
  },
  "facebook": {
    ar: { name: "فيسبوك", description: "وصول سريع إلى منصة فيسبوك" },
    ko: { name: "페이스북", description: "페이스북 소셜 미디어 빠른 접속" },
    hi: { name: "फ़ेसबुक", description: "फ़ेसबुक सोशल मीडिया प्लेटफ़ॉर्म पर त्वरित पहुँच" },
    pt: { name: "Facebook", description: "Acesso rápido à plataforma Facebook" }
  },
  "freecell": {
    ar: { name: "فري سيل", description: "لعبة فري سيل الكلاسيكية" },
    ko: { name: "프리셀", description: "클래식 프리셀 카드 게임" },
    hi: { name: "फ्रीसेल", description: "क्लासिक फ्रीसेल कार्ड गेम" },
    pt: { name: "Freecell", description: "Jogo de cartas Freecell clássico" }
  },
  "ftp-client": {
    ar: { name: "عميل FTP", description: "عميل FTP مثل FileZilla — الاتصال، التنزيل/الرفع، إدارة الملفات عن بعد" },
    ko: { name: "FTP 클라이언트", description: "FileZilla와 같은 FTP 클라이언트 — 연결, 다운로드/업로드, 원격 파일 관리" },
    hi: { name: "FTP क्लाइंट", description: "FileZilla जैसा FTP क्लाइंट — कनेक्ट, डाउनलोड/अपलोड, रिमोट फ़ाइल प्रबंधन" },
    pt: { name: "Cliente FTP", description: "Cliente FTP tipo FileZilla — conectar, download/upload, gerenciamento remoto de arquivos" }
  },
  "github": {
    ar: { name: "جيت هاب", description: "عمليات Git، المستودعات، المشاكل وطلبات السحب" },
    ko: { name: "깃허브", description: "Git 작업, 리포지토리, 이슈 및 풀 리퀘스트 관리" },
    hi: { name: "गिटहब", description: "Git ऑपरेशन, रिपॉजिटरी, इश्यू और पुल रिक्वेस्ट प्रबंधन" },
    pt: { name: "GitHub", description: "Operações Git, repositórios, issues e gerenciamento de pull requests" }
  },
  "json-viewer": {
    ar: { name: "عارض JSON", description: "محرر وعارض JSON — تنسيق، فحص الأخطاء، خريطة مصغرة" },
    ko: { name: "JSON 뷰어", description: "JSON 편집기 및 뷰어 — 포맷, 오류 검사, 미니맵" },
    hi: { name: "JSON व्यूअर", description: "JSON संपादक और व्यूअर — प्रिटी प्रिंट, त्रुटि जांच, मिनीमैप" },
    pt: { name: "Visualizador JSON", description: "Editor e visualizador JSON — formatação, verificação de erros, minimapa" }
  },
  "kanban": {
    ar: { name: "لوحة كانبان", description: "إدارة المهام بلوحة كانبان بالسحب والإفلات" },
    ko: { name: "칸반 보드", description: "드래그 앤 드롭 칸반 보드로 작업 관리" },
    hi: { name: "कानबन बोर्ड", description: "ड्रैग-एंड-ड्रॉप कानबन बोर्ड से अपने कार्य प्रबंधित करें" },
    pt: { name: "Quadro Kanban", description: "Gerencie suas tarefas com um quadro Kanban de arrastar e soltar" }
  },
  "libretranslate": {
    ar: { name: "ليبر ترانسليت", description: "ترجمة تعتمد على Docker — ترجمة آلية مفتوحة المصدر" },
    ko: { name: "리브레 번역", description: "Docker 기반 번역 — 오픈 소스 기계 번역" },
    hi: { name: "लिबरट्रांसलेट", description: "Docker-आधारित अनुवाद — ओपन सोर्स मशीन अनुवाद" },
    pt: { name: "LibreTranslate", description: "Tradução baseada em Docker — tradução automática de código aberto" }
  },
  "magnifier": {
    ar: { name: "المكبر", description: "مكبر الشاشة — يتبع المؤشر ويكبر محتوى الشاشة" },
    ko: { name: "돋보기", description: "화면 돋보기 — 커서를 따라가며 화면 내용 확대" },
    hi: { name: "मैग्निफायर", description: "स्क्रीन मैग्निफायर — कर्सर का अनुसरण करता है और स्क्रीन सामग्री को ज़ूम करता है" },
    pt: { name: "Lupa", description: "Lupa de tela — segue o cursor e amplia o conteúdo da tela" }
  },
  "mail-app": {
    ar: { name: "البريد", description: "إرسال واستقبال البريد الإلكتروني — دعم SMTP و POP3" },
    ko: { name: "메일", description: "이메일 보내기 및 받기 — SMTP 및 POP3 지원" },
    hi: { name: "मेल", description: "ईमेल भेजें और प्राप्त करें — SMTP और POP3 समर्थन" },
    pt: { name: "Correio", description: "Enviar e receber e-mails — suporte SMTP e POP3" }
  },
  "memory-match": {
    ar: { name: "لعبة الذاكرة", description: "لعبة مطابقة بطاقات الذاكرة الكلاسيكية — اقلب البطاقات واعثر على الأزواج" },
    ko: { name: "메모리 매치", description: "클래식 메모리 카드 맞추기 게임 — 카드를 뒤집고 짝을 찾으세요" },
    hi: { name: "मेमोरी मैच", description: "क्लासिक मेमोरी कार्ड मैचिंग गेम — कार्ड पलटें और जोड़ियाँ खोजें" },
    pt: { name: "Jogo da Memória", description: "Jogo clássico de combinação de cartas da memória — vire as cartas e encontre os pares" }
  },
  "mandala-maker": {
    ar: { name: "صانع الماندالا", description: "أداة رسم ماندالا متماثلة — تناظر شعاعي، لوحة ألوان، حجم الفرشاة" },
    ko: { name: "만다라 메이커", description: "대칭 만다라 그리기 도구 — 방사 대칭, 색상 팔레트, 브러시 크기" },
    hi: { name: "मंडला मेकर", description: "सममित मंडला ड्राइंग टूल — रेडियल सिमेट्री, कलर पैलेट, ब्रश साइज़" },
    pt: { name: "Criador de Mandala", description: "Ferramenta de desenho de mandala simétrica — simetria radial, paleta de cores, tamanho do pincel" }
  },
  "map": {
    ar: { name: "خريطة", description: "خريطة — تحديد المواقع، حفظ العروض، تحديد الطبقات" },
    ko: { name: "지도", description: "지도 — 위치 표시, 뷰 저장, 레이어 선택" },
    hi: { name: "नक्शा", description: "नक्शा — स्थान चिह्नित करें, दृश्य सहेजें, लेयर चुनें" },
    pt: { name: "Mapa", description: "Mapa — marcar locais, salvar visualizações, selecionar camadas" }
  },
  "markdown-viewer": {
    ar: { name: "عارض Markdown", description: "محرر وعارض Markdown — معاينة مباشرة، فتح/حفظ الملفات" },
    ko: { name: "마크다운 뷰어", description: "마크다운 편집기 및 뷰어 — 실시간 미리보기, 파일 열기/저장" },
    hi: { name: "मार्कडाउन व्यूअर", description: "मार्कडाउन संपादक और व्यूअर — लाइव प्रीव्यू, फ़ाइल खोलें/सहेजें" },
    pt: { name: "Visualizador Markdown", description: "Editor e visualizador Markdown — pré-visualização ao vivo, abrir/salvar arquivos" }
  },
  "math-formula": {
    ar: { name: "محرر الصيغ", description: "محرر صيغ رياضية — كتابة الصيغ بـ LaTeX، تصدير PNG/SVG/LaTeX/MathML" },
    ko: { name: "수식 편집기", description: "수학 수식 편집기 — LaTeX로 수식 작성, PNG/SVG/LaTeX/MathML 내보내기" },
    hi: { name: "फॉर्मूला एडिटर", description: "गणित फॉर्मूला संपादक — LaTeX में फॉर्मूला लिखें, PNG/SVG/LaTeX/MathML निर्यात" },
    pt: { name: "Editor de Fórmulas", description: "Editor de fórmulas matemáticas — escreva fórmulas em LaTeX, exporte como PNG/SVG/LaTeX/MathML" }
  },
  "mindmap": {
    ar: { name: "خريطة ذهنية", description: "إنشاء خرائط ذهنية — فتح/حفظ الملفات، سمات وتخطيطات متعددة" },
    ko: { name: "마인드맵", description: "마인드맵 생성 — 파일 열기/저장, 다양한 테마 및 레이아웃" },
    hi: { name: "माइंड मैप", description: "माइंड मैप बनाएं — फ़ाइल खोलें/सहेजें, कई थीम और लेआउट" },
    pt: { name: "Mapa Mental", description: "Criação de mapa mental — abrir/salvar arquivos, múltiplos temas e layouts" }
  },
  "minesweeper": {
    ar: { name: "كاسحة الألغام", description: "لعبة كاسحة الألغام الكلاسيكية — سهل، متوسط، صعب" },
    ko: { name: "지뢰찾기", description: "클래식 지뢰찾기 게임 — 쉬움, 보통, 어려움" },
    hi: { name: "माइनस्वीपर", description: "क्लासिक माइनस्वीपर गेम — आसान, मध्यम, कठिन" },
    pt: { name: "Campo Minado", description: "Jogo clássico de campo minado — fácil, médio, difícil" }
  },
  "music-player": {
    ar: { name: "مشغل الموسيقى", description: "مشغل موسيقى — قائمة تشغيل، غلاف الألبوم، تخطي" },
    ko: { name: "음악 플레이어", description: "음악 플레이어 — 재생목록, 앨범 아트, 건너뛰기" },
    hi: { name: "म्यूज़िक प्लेयर", description: "म्यूज़िक प्लेयर — प्लेलिस्ट, एल्बम आर्ट, स्किप" },
    pt: { name: "Player de Música", description: "Player de música — playlist, capa do álbum, pular" }
  },
  "navidrome": {
    ar: { name: "ناڤيدروم", description: "خادم موسيقى يعتمد على Docker — Spotify الشخصي الخاص بك" },
    ko: { name: "나비드롬", description: "Docker 기반 음악 서버 — 나만의 Spotify" },
    hi: { name: "नेविड्रोम", description: "Docker-आधारित संगीत सर्वर — आपका निजी Spotify" },
    pt: { name: "Navidrome", description: "Servidor de música baseado em Docker — seu Spotify pessoal" }
  },
  "paint": {
    ar: { name: "رسام", description: "محرر صور — رسم، أشكال، نصوص، لوحة ألوان" },
    ko: { name: "그림판", description: "이미지 편집기 — 그리기, 도형, 텍스트, 색상 팔레트" },
    hi: { name: "पेंट", description: "इमेज एडिटर — ड्राइंग, शेप्स, टेक्स्ट, कलर पैलेट" },
    pt: { name: "Paint", description: "Editor de imagem — desenho, formas, texto, paleta de cores" }
  },
  "password-manager": {
    ar: { name: "مدير كلمات المرور", description: "مدير كلمات المرور — تشفير AES، خزنة آمنة" },
    ko: { name: "비밀번호 관리자", description: "비밀번호 관리자 — AES 암호화, 보안 금고" },
    hi: { name: "पासवर्ड मैनेजर", description: "पासवर्ड मैनेजर — AES एन्क्रिप्शन, सुरक्षित वॉल्ट" },
    pt: { name: "Gerenciador de Senhas", description: "Gerenciador de senhas — criptografia AES, cofre seguro" }
  },
  "pdf-viewer": {
    ar: { name: "عارض PDF", description: "عارض PDF — فتح الملفات، التنقل بين الصفحات، التكبير" },
    ko: { name: "PDF 뷰어", description: "PDF 뷰어 — 파일 열기, 페이지 탐색, 확대/축소" },
    hi: { name: "PDF व्यूअर", description: "PDF व्यूअर — फ़ाइल खोलें, पेज नेविगेशन, ज़ूम" },
    pt: { name: "Visualizador PDF", description: "Visualizador PDF — abrir arquivo, navegação de páginas, zoom" }
  },
  "pdf-writer": {
    ar: { name: "كاتب PDF", description: "منشئ PDF — محرر نصوص غني، إدراج الصور، إدارة الصفحات، حفظ على الخادم" },
    ko: { name: "PDF 작성기", description: "PDF 생성기 — 리치 텍스트 편집기, 이미지 삽입, 페이지 관리, 서버 저장" },
    hi: { name: "PDF लेखक", description: "PDF निर्माता — रिच टेक्स्ट एडिटर, इमेज इंसर्शन, पेज प्रबंधन, सर्वर पर सहेजें" },
    pt: { name: "Editor PDF", description: "Criador de PDF — editor de texto rico, inserção de imagem, gerenciamento de páginas, salvar no servidor" }
  },
  "photos": {
    ar: { name: "الصور", description: "معرض الصور — ألبومات، عرض شرائح، تحرير" },
    ko: { name: "포토", description: "사진 갤러리 — 앨범, 슬라이드쇼, 편집" },
    hi: { name: "फ़ोटो", description: "फ़ोटो गैलरी — एल्बम, स्लाइडशो, एडिटिंग" },
    pt: { name: "Fotos", description: "Galeria de fotos — álbuns, apresentação de slides, edição" }
  },
  "pomodoro": {
    ar: { name: "بومودورو", description: "مؤقت بومودورو — دورة عمل/استراحة" },
    ko: { name: "포모도로", description: "포모도로 타이머 — 작업/휴식 주기" },
    hi: { name: "पोमोडोरो", description: "पोमोडोरो टाइमर — कार्य/विश्राम चक्र" },
    pt: { name: "Pomodoro", description: "Timer Pomodoro — ciclo de trabalho/descanso" }
  },
  "postgres": {
    ar: { name: "PostgreSQL", description: "خدمة قاعدة بيانات PostgreSQL — قاعدة بيانات علاقية للتطبيقات" },
    ko: { name: "PostgreSQL", description: "PostgreSQL 데이터베이스 서비스 — 애플리케이션을 위한 관계형 데이터베이스" },
    hi: { name: "PostgreSQL", description: "PostgreSQL डेटाबेस सेवा — एप्लिकेशन के लिए रिलेशनल डेटाबेस" },
    pt: { name: "PostgreSQL", description: "Serviço de banco de dados PostgreSQL — banco de dados relacional para aplicações" }
  },
  "postit": {
    ar: { name: "ملاحظات لاصقة", description: "ألصق ملاحظات على سطح المكتب — سحب، تغيير الحجم، تلوين" },
    ko: { name: "포스트잇", description: "바탕화면에 메모 붙이기 — 드래그, 크기 조절, 색상 변경" },
    hi: { name: "पोस्टइट नोट्स", description: "अपने डेस्कटॉप पर नोट्स चिपकाएं — ड्रैग, रिसाइज़, रंग बदलें" },
    pt: { name: "Notas Adesivas", description: "Cole notas na sua área de trabalho — arrastar, redimensionar, colorir" }
  },
  "ratio-game": {
    ar: { name: "لعبة النسب", description: "قسم الدائرة لتطابق الكسر المستهدف — حقق أفضل نتيجة في 10 جولات" },
    ko: { name: "비율 게임", description: "목표 분수에 맞게 원을 나누세요 — 10라운드에서 최고 점수 달성" },
    hi: { name: "अनुपात गेम", description: "लक्ष्य भिन्न से मेल खाने के लिए वृत्त काटें — 10 राउंड में सर्वश्रेष्ठ स्कोर करें" },
    pt: { name: "Jogo de Proporção", description: "Corte o círculo para corresponder à fração alvo — melhor pontuação em 10 rodadas" }
  },
  "redis": {
    ar: { name: "Redis", description: "خدمة Redis للتخزين المؤقت وهياكل البيانات — مخزن مفتاح-قيمة سريع" },
    ko: { name: "Redis", description: "Redis 캐시 및 데이터 구조 서비스 — 빠른 키-값 저장소" },
    hi: { name: "Redis", description: "Redis कैश और डेटा संरचना सेवा — तेज़ की-वैल्यू स्टोर" },
    pt: { name: "Redis", description: "Serviço de cache e estrutura de dados Redis — armazenamento rápido de chave-valor" }
  },
  "reminder": {
    ar: { name: "تذكير", description: "تذكير — إشعارات مؤقتة، مهام متكررة" },
    ko: { name: "리마인더", description: "리마인더 — 예약 알림, 반복 작업" },
    hi: { name: "रिमाइंडर", description: "रिमाइंडर — समयबद्ध सूचनाएं, आवर्ती कार्य" },
    pt: { name: "Lembrete", description: "Lembrete — notificações programadas, tarefas recorrentes" }
  },
  "reversi": {
    ar: { name: "ريفرسي", description: "لعبة ريفرسي (أوثيلو) الاستراتيجية الكلاسيكية" },
    ko: { name: "리버시", description: "클래식 리버시(오델로) 전략 게임" },
    hi: { name: "रिवर्सी", description: "क्लासिक रिवर्सी (ओथेलो) रणनीति गेम" },
    pt: { name: "Reversi", description: "Jogo de estratégia clássico Reversi (Othello)" }
  },
  "rock-paper-scissors": {
    ar: { name: "حجر ورقة مقص", description: "لعبة حجر ورقة مقص الكلاسيكية — العب ضد الكمبيوتر، تتبع النتائج" },
    ko: { name: "가위바위보", description: "클래식 가위바위보 — 컴퓨터와 대전, 점수 추적" },
    hi: { name: "पत्थर कागज़ कैंची", description: "क्लासिक पत्थर कागज़ कैंची — कंप्यूटर के खिलाफ खेलें, स्कोर ट्रैकिंग" },
    pt: { name: "Pedra Papel Tesoura", description: "Pedra Papel Tesoura clássico — jogue contra o computador, acompanhamento de pontuação" }
  },
  "rss-reader": {
    ar: { name: "قارئ RSS", description: "قارئ RSS — إضافة خلاصات، قراءة المقالات، المفضلة" },
    ko: { name: "RSS 리더", description: "RSS 리더 — 피드 추가, 기사 읽기, 즐겨찾기" },
    hi: { name: "RSS रीडर", description: "RSS रीडर — फ़ीड जोड़ें, लेख पढ़ें, पसंदीदा" },
    pt: { name: "Leitor RSS", description: "Leitor RSS — adicionar feeds, ler artigos, favoritos" }
  },
  "signalmidi": {
    ar: { name: "محرر MIDI", description: "محرر ومؤلف MIDI على الويب" },
    ko: { name: "시그널 MIDI", description: "웹 기반 MIDI 시퀀서 및 편집기" },
    hi: { name: "सिग्नल MIDI", description: "वेब-आधारित MIDI सीक्वेंसर और एडिटर" },
    pt: { name: "Signal MIDI", description: "Sequenciador e editor MIDI baseado na web" }
  },
  "snake-game": {
    ar: { name: "الأفعى", description: "لعبة الأفعى الكلاسيكية — النقاط، مستويات السرعة، التصادم" },
    ko: { name: "스네이크", description: "클래식 스네이크 게임 — 점수, 속도 레벨, 충돌" },
    hi: { name: "स्नेक", description: "क्लासिक स्नेक गेम — स्कोर, स्पीड लेवल, टक्कर" },
    pt: { name: "Snake", description: "Jogo Snake clássico — pontuação, níveis de velocidade, colisão" }
  },
  "social-share": {
    ar: { name: "مشاركة اجتماعية", description: "مشاركة على وسائل التواصل — تويتر، فيسبوك، واتساب، تيليجرام والمزيد" },
    ko: { name: "소셜 공유", description: "소셜 미디어 공유 — 트위터, 페이스북, 왓츠앱, 텔레그램 등" },
    hi: { name: "सोशल शेयर", description: "सोशल मीडिया शेयरिंग — ट्विटर, फ़ेसबुक, व्हाट्सएप, टेलीग्राम और अधिक" },
    pt: { name: "Compartilhar Social", description: "Compartilhamento em redes sociais — Twitter, Facebook, WhatsApp, Telegram e mais" }
  },
  "sokoban": {
    ar: { name: "سوكوبان", description: "لعبة سوكوبان الكلاسيكية — ادفع الصناديق إلى المواقع المستهدفة، 30 مستوى" },
    ko: { name: "소코반", description: "클래식 소코반 퍼즐 게임 — 상자를 목표 위치로 밀기, 30 레벨" },
    hi: { name: "सोकोबन", description: "क्लासिक सोकोबन पज़ल गेम — बक्सों को लक्ष्य स्थानों पर धकेलें, 30 स्तर" },
    pt: { name: "Sokoban", description: "Jogo de puzzle clássico Sokoban — empurre caixas para os locais alvo, 30 níveis" }
  },
  "sport-scores": {
    ar: { name: "نتائج رياضية", description: "نتائج رياضية مباشرة — كرة قدم، كرة سلة، تنس" },
    ko: { name: "스포츠 스코어", description: "실시간 스포츠 점수 — 축구, 농구, 테니스" },
    hi: { name: "स्पोर्ट स्कोर", description: "लाइव स्पोर्ट स्कोर — फुटबॉल, बास्केटबॉल, टेनिस" },
    pt: { name: "Resultados Esportivos", description: "Resultados esportivos ao vivo — futebol, basquete, tênis" }
  },
  "stamp-paint": {
    ar: { name: "طلاء الأختام", description: "رسم بأسلوب TuxPaint — أختام، تأثيرات سحرية، فرش" },
    ko: { name: "스탬프 페인트", description: "TuxPaint 스타일 그리기 — 스탬프, 마법 효과, 브러시" },
    hi: { name: "स्टैम्प पेंट", description: "TuxPaint-स्टाइल ड्राइंग — स्टैम्प, मैजिक इफेक्ट, ब्रश" },
    pt: { name: "Stamp Paint", description: "Desenho estilo TuxPaint — carimbos, efeitos mágicos, pincéis" }
  },
  "stock-tracker": {
    ar: { name: "متتبع الأسهم", description: "متتبع أسهم ناسداك — أسعار مباشرة، المفضلة، المحفظة" },
    ko: { name: "주식 트래커", description: "나스닥 주식 추적기 — 실시간 가격, 즐겨찾기, 포트폴리오" },
    hi: { name: "स्टॉक ट्रैकर", description: "NASDAQ स्टॉक ट्रैकर — लाइव कीमतें, पसंदीदा, पोर्टफोलियो" },
    pt: { name: "Rastreador de Ações", description: "Rastreador de ações NASDAQ — preços ao vivo, favoritos, portfólio" }
  },
  "sudoku": {
    ar: { name: "سودوكو", description: "لعبة سودوكو — سهل، متوسط، صعب" },
    ko: { name: "스도쿠", description: "스도쿠 퍼즐 게임 — 쉬움, 보통, 어려움" },
    hi: { name: "सुडोकू", description: "सुडोकू पज़ल गेम — आसान, मध्यम, कठिन" },
    pt: { name: "Sudoku", description: "Jogo de puzzle Sudoku — fácil, médio, difícil" }
  },
  "system-monitor": {
    ar: { name: "مراقب النظام", description: "مراقبة استخدام CPU/RAM للخادم والعميل بالرسوم البيانية" },
    ko: { name: "시스템 모니터", description: "서버 및 클라이언트 CPU/RAM 사용량 그래프 모니터링" },
    hi: { name: "सिस्टम मॉनिटर", description: "ग्राफ़ के साथ सर्वर और क्लाइंट CPU/RAM उपयोग निगरानी" },
    pt: { name: "Monitor do Sistema", description: "Monitor de uso de CPU/RAM do servidor e cliente com gráficos" }
  },
  "telegram": {
    ar: { name: "تيليجرام", description: "تطبيق تيليجرام ويب للمراسلة" },
    ko: { name: "텔레그램", description: "텔레그램 웹 메시징 앱" },
    hi: { name: "टेलीग्राम", description: "टेलीग्राम वेब मैसेजिंग ऐप" },
    pt: { name: "Telegram", description: "Aplicativo de mensagens Telegram Web" }
  },
  "tetris": {
    ar: { name: "تتريس", description: "لعبة تتريس الكلاسيكية — النقاط، المستويات، معاينة القطعة التالية" },
    ko: { name: "테트리스", description: "클래식 테트리스 게임 — 점수, 레벨, 다음 블록 미리보기" },
    hi: { name: "टेट्रिस", description: "क्लासिक टेट्रिस गेम — स्कोर, लेवल, अगले पीस का प्रीव्यू" },
    pt: { name: "Tetris", description: "Jogo Tetris clássico — pontuação, níveis, prévia da próxima peça" }
  },
  "text-diff": {
    ar: { name: "مقارنة النصوص", description: "مقارنة النصوص والملفات — مقارنة جنبًا إلى جنب، مقارنة المجلدات" },
    ko: { name: "텍스트 비교", description: "텍스트 및 파일 비교 — 나란히 비교, 폴더 비교" },
    hi: { name: "टेक्स्ट डिफ", description: "टेक्स्ट और फ़ाइल तुलना — साइड-बाय-साइड डिफ, फ़ोल्डर तुलना" },
    pt: { name: "Comparador de Texto", description: "Comparação de texto e arquivos — diferença lado a lado, comparação de pastas" }
  },
  "tiktok": {
    ar: { name: "تيك توك", description: "وصول سريع إلى منصة تيك توك" },
    ko: { name: "틱톡", description: "틱톡 소셜 미디어 빠른 접속" },
    hi: { name: "टिकटॉक", description: "टिकटॉक सोशल मीडिया प्लेटफ़ॉर्म पर त्वरित पहुँच" },
    pt: { name: "TikTok", description: "Acesso rápido à plataforma TikTok" }
  },
  "torrent": {
    ar: { name: "تورنت", description: "عميل تورنت P2P — تنزيل ومشاركة عبر روابط مغناطيسية وملفات .torrent" },
    ko: { name: "토렌트", description: "P2P 토렌트 클라이언트 — 마그넷 링크 및 .torrent 파일로 다운로드 및 공유" },
    hi: { name: "टोरेंट", description: "P2P टोरेंट क्लाइंट — मैग्नेट लिंक और .torrent फ़ाइलों से डाउनलोड और शेयर करें" },
    pt: { name: "Torrent", description: "Cliente Torrent P2P — baixar e compartilhar via links magnéticos e arquivos .torrent" }
  },
  "trello": {
    ar: { name: "تريلو", description: "إدارة لوحات تريلو — بطاقات، قوائم، سحب وإفلات" },
    ko: { name: "트렐로", description: "트렐로 보드 관리 — 카드, 목록, 드래그 앤 드롭" },
    hi: { name: "ट्रेलो", description: "ट्रेलो बोर्ड प्रबंधन — कार्ड, सूचियाँ, ड्रैग एंड ड्रॉप" },
    pt: { name: "Trello", description: "Gerenciamento de quadros Trello — cartões, listas, arrastar e soltar" }
  },
  "twitter": {
    ar: { name: "إكس (تويتر)", description: "وصول سريع إلى منصة إكس (تويتر)" },
    ko: { name: "X (트위터)", description: "X (트위터) 소셜 미디어 빠른 접속" },
    hi: { name: "X (ट्विटर)", description: "X (ट्विटर) सोशल मीडिया प्लेटफ़ॉर्म पर त्वरित पहुँच" },
    pt: { name: "X (Twitter)", description: "Acesso rápido à plataforma X (Twitter)" }
  },
  "unit-converter": {
    ar: { name: "محول الوحدات", description: "تحويل وحدات الطول، الوزن، الحرارة، المساحة، الحجم، السرعة والمزيد" },
    ko: { name: "단위 변환기", description: "길이, 무게, 온도, 면적, 부피, 속도 등 단위 변환" },
    hi: { name: "यूनिट कनवर्टर", description: "लंबाई, वजन, तापमान, क्षेत्र, आयतन, गति और अधिक इकाइयों को बदलें" },
    pt: { name: "Conversor de Unidades", description: "Converter unidades de comprimento, peso, temperatura, área, volume, velocidade e mais" }
  },
  "video-editor": {
    ar: { name: "محرر الفيديو", description: "تحرير الفيديو — قص، تقسيم، نص، التحكم بالسرعة والتصدير" },
    ko: { name: "비디오 편집기", description: "비디오 편집 — 자르기, 분할, 텍스트 오버레이, 속도 조절 및 내보내기" },
    hi: { name: "वीडियो एडिटर", description: "वीडियो एडिटिंग — ट्रिम, स्प्लिट, टेक्स्ट ओवरले, स्पीड कंट्रोल और एक्सपोर्ट" },
    pt: { name: "Editor de Vídeo", description: "Edição de vídeo — cortar, dividir, sobreposição de texto, controle de velocidade e exportação" }
  },
  "video-player": {
    ar: { name: "مشغل الفيديو", description: "مشغل فيديو — قائمة تشغيل، ملء الشاشة" },
    ko: { name: "비디오 플레이어", description: "비디오 플레이어 — 재생목록, 전체화면" },
    hi: { name: "वीडियो प्लेयर", description: "वीडियो प्लेयर — प्लेलिस्ट, फ़ुलस्क्रीन" },
    pt: { name: "Player de Vídeo", description: "Player de vídeo — playlist, tela cheia" }
  },
  "vnc-client": {
    ar: { name: "عميل VNC", description: "الاتصال بخوادم VNC لعرض والتحكم بسطح المكتب عن بعد" },
    ko: { name: "VNC 클라이언트", description: "VNC 서버에 연결하여 원격 데스크톱 보기 및 제어" },
    hi: { name: "VNC क्लाइंट", description: "रिमोट डेस्कटॉप देखने और नियंत्रण के लिए VNC सर्वर से कनेक्ट करें" },
    pt: { name: "Cliente VNC", description: "Conectar a servidores VNC para visualização e controle remoto da área de trabalho" }
  },
  "whatsapp": {
    ar: { name: "واتساب", description: "تطبيق واتساب ويب للمراسلة" },
    ko: { name: "왓츠앱", description: "왓츠앱 웹 메시징 앱" },
    hi: { name: "व्हाट्सएप", description: "व्हाट्सएप वेब मैसेजिंग ऐप" },
    pt: { name: "WhatsApp", description: "Aplicativo de mensagens WhatsApp Web" }
  },
  "world-clock": {
    ar: { name: "ساعة عالمية", description: "ساعة عالمية — مناطق زمنية متعددة، إضافة مدن" },
    ko: { name: "세계 시계", description: "세계 시계 — 다중 시간대, 도시 추가" },
    hi: { name: "विश्व घड़ी", description: "विश्व घड़ी — कई समय क्षेत्र, शहर जोड़ें" },
    pt: { name: "Relógio Mundial", description: "Relógio mundial — múltiplos fusos horários, adicionar cidades" }
  },
  "youtube": {
    ar: { name: "يوتيوب", description: "تطبيق بحث ومشاهدة فيديوهات يوتيوب" },
    ko: { name: "유튜브", description: "유튜브 동영상 검색 및 시청 앱" },
    hi: { name: "यूट्यूब", description: "यूट्यूब वीडियो खोज और देखने का ऐप" },
    pt: { name: "YouTube", description: "Aplicativo de pesquisa e reprodução de vídeos do YouTube" }
  }
};

function parseLangsBlock(content) {
  const match = content.match(/(^\s*)(const|let|var)\s+LANGS\s*=\s*\{([\s\S]*?)\n(\s*)\};/m);
  if (!match) return null;
  return {
    fullMatch: match[0],
    constIndent: match[1],
    decl: match[2],
    inner: match[3],
    closingIndent: match[4],
    langs: Function('return ({' + match[3] + '\n})')()
  };
}

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function ensureCounter(map, key) {
  let counter = map.get(key);
  if (!counter) {
    counter = new Map();
    map.set(key, counter);
  }
  return counter;
}

function addCounterValue(map, key, value) {
  const counter = ensureCounter(map, key);
  counter.set(value, (counter.get(value) || 0) + 1);
}

function chooseMostCommon(counter) {
  let bestValue = null;
  let bestCount = -1;
  for (const [value, count] of counter.entries()) {
    if (count > bestCount) {
      bestValue = value;
      bestCount = count;
    }
  }
  return bestValue;
}

function buildTranslationMemory() {
  const memory = {
    byKeyAndValue: new Map(),
    byKey: new Map(),
    byValue: new Map()
  };

  for (const dir of fs.readdirSync(storeDir)) {
    const componentPath = path.join(storeDir, dir, 'component.js');
    if (!fs.existsSync(componentPath)) continue;

    let parsed;
    try {
      parsed = parseLangsBlock(fs.readFileSync(componentPath, 'utf8'));
    } catch {
      continue;
    }
    if (!parsed) continue;

    const base = isPlainObject(parsed.langs.en) ? parsed.langs.en : (isPlainObject(parsed.langs.tr) ? parsed.langs.tr : null);
    if (!base) continue;

    for (const langCode of TARGET_LANGS) {
      const target = parsed.langs[langCode];
      if (!isPlainObject(target)) continue;

      for (const [key, baseValue] of Object.entries(base)) {
        const targetValue = target[key];
        if (typeof baseValue !== 'string' || typeof targetValue !== 'string') continue;
        addCounterValue(memory.byKeyAndValue, `${langCode}\u0000${key}\u0000${baseValue}`, targetValue);
        addCounterValue(memory.byKey, `${langCode}\u0000${key}`, targetValue);
        addCounterValue(memory.byValue, `${langCode}\u0000${baseValue}`, targetValue);
      }
    }
  }

  return memory;
}

function lookupTranslation(memory, langCode, key, baseValue) {
  if (typeof baseValue !== 'string') return baseValue;

  const exact = memory.byKeyAndValue.get(`${langCode}\u0000${key}\u0000${baseValue}`);
  if (exact) return chooseMostCommon(exact);

  const byKey = memory.byKey.get(`${langCode}\u0000${key}`);
  if (byKey && byKey.size === 1) return chooseMostCommon(byKey);

  const byValue = memory.byValue.get(`${langCode}\u0000${baseValue}`);
  if (byValue) return chooseMostCommon(byValue);

  return baseValue;
}

function readAppLangMeta(appId) {
  const appJsonPath = path.join(storeDir, appId, 'app.json');
  if (!fs.existsSync(appJsonPath)) return {};
  try {
    const raw = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    return raw.lang || {};
  } catch {
    return {};
  }
}

function buildLocaleObject(appId, langCode, baseLocale, existingLocale, memory, appLangMeta) {
  const nextLocale = {};
  const currentLocale = isPlainObject(existingLocale) ? existingLocale : {};

  for (const [key, baseValue] of Object.entries(baseLocale)) {
    if (Object.prototype.hasOwnProperty.call(currentLocale, key)) {
      nextLocale[key] = currentLocale[key];
      continue;
    }

    if (key === 'title' && appLangMeta[langCode] && typeof appLangMeta[langCode].name === 'string') {
      nextLocale[key] = appLangMeta[langCode].name;
      continue;
    }

    nextLocale[key] = lookupTranslation(memory, langCode, key, baseValue);
  }

  for (const [key, value] of Object.entries(currentLocale)) {
    if (!Object.prototype.hasOwnProperty.call(nextLocale, key)) {
      nextLocale[key] = value;
    }
  }

  return nextLocale;
}

function escapeJsString(value) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n');
}

function formatJsKey(key) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : `'${escapeJsString(String(key))}'`;
}

function formatJsValue(value, indent, childIndent) {
  if (typeof value === 'string') return `'${escapeJsString(value)}'`;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value === null) return 'null';
  if (Array.isArray(value)) return `[${value.map((item) => formatJsValue(item, childIndent, childIndent + '  ')).join(', ')}]`;
  if (isPlainObject(value)) {
    const entries = Object.entries(value);
    if (!entries.length) return '{}';
    return `{
${entries.map(([nestedKey, nestedValue]) => `${childIndent}${formatJsKey(nestedKey)}:${formatJsValue(nestedValue, childIndent, childIndent + '  ')}`).join(',\n')}
${indent}}`;
  }
  return `'${escapeJsString(String(value))}'`;
}

function renderLangsBlock(parsed) {
  const localeIndentMatch = parsed.inner.match(/\n(\s+)[A-Za-z_$][A-Za-z0-9_$]*\s*:\s*\{/);
  const localeIndent = localeIndentMatch ? localeIndentMatch[1] : (parsed.constIndent + '  ');
  const childIndent = localeIndent + '  ';
  const entries = Object.entries(parsed.langs).map(([langCode, localeObj]) => {
    return `${localeIndent}${langCode}: ${formatJsValue(localeObj, localeIndent, childIndent)}`;
  });
  return `${parsed.constIndent}${parsed.decl} LANGS = {\n${entries.join(',\n')}\n${parsed.closingIndent}};`;
}

// Process all app.json files
const appDirs = fs.readdirSync(storeDir);
let appUpdated = 0;
let appSkipped = 0;

for (const dir of appDirs) {
  if (!shouldProcessApp(dir)) continue;

  const jsonPath = path.join(storeDir, dir, 'app.json');
  if (!fs.existsSync(jsonPath)) continue;

  const raw = fs.readFileSync(jsonPath, 'utf8');
  const app = JSON.parse(raw);

  if (!app.lang) {
    console.log(`SKIP (no lang): ${dir}`);
    appSkipped++;
    continue;
  }

  const trans = appJsonTranslations[app.id || dir];
  if (!trans) {
    console.log(`SKIP (no translation data): ${dir}`);
    appSkipped++;
    continue;
  }

  let changed = false;
  for (const langCode of TARGET_LANGS) {
    if (!app.lang[langCode] && trans[langCode]) {
      app.lang[langCode] = trans[langCode];
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(jsonPath, JSON.stringify(app, null, 2) + '\n', 'utf8');
    appUpdated++;
    console.log(`UPDATED app.json: ${dir}`);
  } else {
    appSkipped++;
    console.log(`ALREADY HAS: ${dir}`);
  }
}

console.log(`\n=== APP.JSON RESULTS: ${appUpdated} updated, ${appSkipped} skipped ===\n`);

const translationMemory = buildTranslationMemory();
let componentUpdated = 0;
let componentSkipped = 0;

for (const dir of appDirs) {
  if (!shouldProcessApp(dir)) continue;

  const componentPath = path.join(storeDir, dir, 'component.js');
  if (!fs.existsSync(componentPath)) continue;

  let content;
  let parsed;
  try {
    content = fs.readFileSync(componentPath, 'utf8');
    parsed = parseLangsBlock(content);
  } catch (error) {
    console.log(`SKIP component.js (read/parse error): ${dir} (${error.message})`);
    componentSkipped++;
    continue;
  }

  if (!parsed) {
    console.log(`SKIP component.js (no LANGS): ${dir}`);
    componentSkipped++;
    continue;
  }

  const baseLocale = isPlainObject(parsed.langs.en) ? parsed.langs.en : (isPlainObject(parsed.langs.tr) ? parsed.langs.tr : null);
  if (!baseLocale) {
    console.log(`SKIP component.js (no base locale): ${dir}`);
    componentSkipped++;
    continue;
  }

  const appLangMeta = readAppLangMeta(dir);
  let changed = false;

  for (const langCode of TARGET_LANGS) {
    const existingLocale = parsed.langs[langCode];
    const nextLocale = buildLocaleObject(dir, langCode, baseLocale, existingLocale, translationMemory, appLangMeta);
    if (JSON.stringify(existingLocale || {}) !== JSON.stringify(nextLocale)) {
      parsed.langs[langCode] = nextLocale;
      changed = true;
    }
  }

  if (!changed) {
    console.log(`ALREADY HAS component.js: ${dir}`);
    componentSkipped++;
    continue;
  }

  fs.writeFileSync(componentPath, content.replace(parsed.fullMatch, renderLangsBlock(parsed)), 'utf8');
  componentUpdated++;
  console.log(`UPDATED component.js: ${dir}`);
}

console.log(`\n=== COMPONENT.JS RESULTS: ${componentUpdated} updated, ${componentSkipped} skipped ===`);
