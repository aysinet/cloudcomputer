(function(Vue) {
  const { ref, computed, watch, onMounted, onUnmounted, nextTick } = Vue;

  /* ── i18n ── */
  const LANGS = {
    tr: {
      title:'QR Kod Oluşturucu', inputLabel:'İçerik', placeholder:'Metin veya URL girin...',
      type:'Tür', text:'Metin', url:'URL', wifi:'Wi-Fi', email:'E-posta', phone:'Telefon',
      size:'Boyut', fgColor:'Ön Plan', bgColor:'Arka Plan', errLevel:'Hata Düzeltme',
      low:'Düşük', medium:'Orta', quartile:'Çeyrek', high:'Yüksek',
      download:'PNG İndir', copy:'Kopyala', copied:'Kopyalandı!',
      ssid:'Ağ Adı (SSID)', wifiPass:'Şifre', encryption:'Şifreleme', none:'Yok',
      emailAddr:'E-posta Adresi', subject:'Konu', body:'Mesaj',
      phoneNum:'Telefon Numarası', generate:'Oluştur', noContent:'İçerik girin',
      hidden:'Gizli Ağ', margin:'Kenar Boşluğu',
      save:'Kaydet', saved:'Kaydedildi!', savedCodes:'Kayıtlı QR Kodlar',
      noSaved:'Henüz kayıtlı QR kod yok', deleteSaved:'Sil', labelPlaceholder:'Etiket (isteğe bağlı)',
      generating:'Oluşturuluyor...'
    },
    en: {
      title:'QR Code Maker', inputLabel:'Content', placeholder:'Enter text or URL...',
      type:'Type', text:'Text', url:'URL', wifi:'Wi-Fi', email:'Email', phone:'Phone',
      size:'Size', fgColor:'Foreground', bgColor:'Background', errLevel:'Error Correction',
      low:'Low', medium:'Medium', quartile:'Quartile', high:'High',
      download:'Download PNG', copy:'Copy', copied:'Copied!',
      ssid:'Network Name (SSID)', wifiPass:'Password', encryption:'Encryption', none:'None',
      emailAddr:'Email Address', subject:'Subject', body:'Message',
      phoneNum:'Phone Number', generate:'Generate', noContent:'Enter content',
      hidden:'Hidden Network', margin:'Margin',
      save:'Save', saved:'Saved!', savedCodes:'Saved QR Codes',
      noSaved:'No saved QR codes yet', deleteSaved:'Delete', labelPlaceholder:'Label (optional)',
      generating:'Generating...'
    },
    de: {
      title:'QR-Code Ersteller', inputLabel:'Inhalt', placeholder:'Text oder URL eingeben...',
      type:'Typ', text:'Text', url:'URL', wifi:'WLAN', email:'E-Mail', phone:'Telefon',
      size:'Größe', fgColor:'Vordergrund', bgColor:'Hintergrund', errLevel:'Fehlerkorrektur',
      low:'Niedrig', medium:'Mittel', quartile:'Viertel', high:'Hoch',
      download:'PNG herunterladen', copy:'Kopieren', copied:'Kopiert!',
      ssid:'Netzwerkname (SSID)', wifiPass:'Passwort', encryption:'Verschlüsselung', none:'Keine',
      emailAddr:'E-Mail-Adresse', subject:'Betreff', body:'Nachricht',
      phoneNum:'Telefonnummer', generate:'Erstellen', noContent:'Inhalt eingeben',
      hidden:'Verstecktes Netzwerk', margin:'Rand',
      save:'Speichern', saved:'Gespeichert!', savedCodes:'Gespeicherte QR-Codes',
      noSaved:'Keine gespeicherten QR-Codes', deleteSaved:'Löschen', labelPlaceholder:'Bezeichnung (optional)',
      generating:'Erstelle...'
    },
    fr: {
      title:'Générateur QR Code', inputLabel:'Contenu', placeholder:'Entrez du texte ou une URL...',
      type:'Type', text:'Texte', url:'URL', wifi:'Wi-Fi', email:'E-mail', phone:'Téléphone',
      size:'Taille', fgColor:'Premier plan', bgColor:'Arrière-plan', errLevel:'Correction d\'erreur',
      low:'Bas', medium:'Moyen', quartile:'Quartile', high:'Élevé',
      download:'Télécharger PNG', copy:'Copier', copied:'Copié !',
      ssid:'Nom du réseau (SSID)', wifiPass:'Mot de passe', encryption:'Chiffrement', none:'Aucun',
      emailAddr:'Adresse e-mail', subject:'Objet', body:'Message',
      phoneNum:'Numéro de téléphone', generate:'Générer', noContent:'Entrez du contenu',
      hidden:'Réseau caché', margin:'Marge',
      save:'Enregistrer', saved:'Enregistré !', savedCodes:'QR Codes enregistrés',
      noSaved:'Aucun QR code enregistré', deleteSaved:'Supprimer', labelPlaceholder:'Libellé (facultatif)',
      generating:'Génération...'
    },
    es: {
      title:'Generador de QR', inputLabel:'Contenido', placeholder:'Ingrese texto o URL...',
      type:'Tipo', text:'Texto', url:'URL', wifi:'Wi-Fi', email:'Correo', phone:'Teléfono',
      size:'Tamaño', fgColor:'Primer plano', bgColor:'Fondo', errLevel:'Corrección de error',
      low:'Bajo', medium:'Medio', quartile:'Cuartil', high:'Alto',
      download:'Descargar PNG', copy:'Copiar', copied:'¡Copiado!',
      ssid:'Nombre de red (SSID)', wifiPass:'Contraseña', encryption:'Cifrado', none:'Ninguno',
      emailAddr:'Dirección de correo', subject:'Asunto', body:'Mensaje',
      phoneNum:'Número de teléfono', generate:'Generar', noContent:'Ingrese contenido',
      hidden:'Red oculta', margin:'Margen',
      save:'Guardar', saved:'¡Guardado!', savedCodes:'Códigos QR guardados',
      noSaved:'No hay códigos QR guardados', deleteSaved:'Eliminar', labelPlaceholder:'Etiqueta (opcional)',
      generating:'Generando...'
    },
    ru: {
      title:'Генератор QR-кодов', inputLabel:'Содержимое', placeholder:'Введите текст или URL...',
      type:'Тип', text:'Текст', url:'URL', wifi:'Wi-Fi', email:'Эл. почта', phone:'Телефон',
      size:'Размер', fgColor:'Передний план', bgColor:'Фон', errLevel:'Коррекция ошибок',
      low:'Низкая', medium:'Средняя', quartile:'Четверть', high:'Высокая',
      download:'Скачать PNG', copy:'Копировать', copied:'Скопировано!',
      ssid:'Имя сети (SSID)', wifiPass:'Пароль', encryption:'Шифрование', none:'Нет',
      emailAddr:'Адрес эл. почты', subject:'Тема', body:'Сообщение',
      phoneNum:'Номер телефона', generate:'Создать', noContent:'Введите содержимое',
      hidden:'Скрытая сеть', margin:'Отступ',
      save:'Сохранить', saved:'Сохранено!', savedCodes:'Сохранённые QR-коды',
      noSaved:'Нет сохранённых QR-кодов', deleteSaved:'Удалить', labelPlaceholder:'Метка (необязательно)',
      generating:'Создание...'
    },
    zh: {
      title:'二维码生成器', inputLabel:'内容', placeholder:'输入文本或网址...',
      type:'类型', text:'文本', url:'网址', wifi:'Wi-Fi', email:'电子邮件', phone:'电话',
      size:'尺寸', fgColor:'前景色', bgColor:'背景色', errLevel:'纠错等级',
      low:'低', medium:'中', quartile:'四分之一', high:'高',
      download:'下载 PNG', copy:'复制', copied:'已复制！',
      ssid:'网络名称 (SSID)', wifiPass:'密码', encryption:'加密', none:'无',
      emailAddr:'邮箱地址', subject:'主题', body:'正文',
      phoneNum:'电话号码', generate:'生成', noContent:'请输入内容',
      hidden:'隐藏网络', margin:'边距',
      save:'保存', saved:'已保存！', savedCodes:'已保存的二维码',
      noSaved:'暂无保存的二维码', deleteSaved:'删除', labelPlaceholder:'标签（可选）',
      generating:'生成中...'
    },
    ja: {
      title:'QRコードメーカー', inputLabel:'内容', placeholder:'テキストまたはURLを入力...',
      type:'タイプ', text:'テキスト', url:'URL', wifi:'Wi-Fi', email:'メール', phone:'電話',
      size:'サイズ', fgColor:'前景色', bgColor:'背景色', errLevel:'誤り訂正',
      low:'低', medium:'中', quartile:'四分の一', high:'高',
      download:'PNGダウンロード', copy:'コピー', copied:'コピーしました！',
      ssid:'ネットワーク名 (SSID)', wifiPass:'パスワード', encryption:'暗号化', none:'なし',
      emailAddr:'メールアドレス', subject:'件名', body:'本文',
      phoneNum:'電話番号', generate:'生成', noContent:'内容を入力してください',
      hidden:'非公開ネットワーク', margin:'余白',
      save:'保存', saved:'保存しました！', savedCodes:'保存済みQRコード',
      noSaved:'保存済みのQRコードはありません', deleteSaved:'削除', labelPlaceholder:'ラベル（任意）',
      generating:'生成中...'
    },
    it: {
      title:'Generatore QR Code', inputLabel:'Contenuto', placeholder:'Inserisci testo o URL...',
      type:'Tipo', text:'Testo', url:'URL', wifi:'Wi-Fi', email:'Email', phone:'Telefono',
      size:'Dimensione', fgColor:'Primo piano', bgColor:'Sfondo', errLevel:'Correzione errori',
      low:'Basso', medium:'Medio', quartile:'Quartile', high:'Alto',
      download:'Scarica PNG', copy:'Copia', copied:'Copiato!',
      ssid:'Nome rete (SSID)', wifiPass:'Password', encryption:'Crittografia', none:'Nessuna',
      emailAddr:'Indirizzo email', subject:'Oggetto', body:'Messaggio',
      phoneNum:'Numero di telefono', generate:'Genera', noContent:'Inserisci contenuto',
      hidden:'Rete nascosta', margin:'Margine',
      save:'Salva', saved:'Salvato!', savedCodes:'Codici QR salvati',
      noSaved:'Nessun codice QR salvato', deleteSaved:'Elimina', labelPlaceholder:'Etichetta (opzionale)',
      generating:'Generazione...'
    },
    ar: {
      title:'صانع رمز QR', inputLabel:'المحتوى', placeholder:'أدخل نصاً أو رابطاً...',
      type:'النوع', text:'نص', url:'رابط', wifi:'واي فاي', email:'بريد إلكتروني', phone:'هاتف',
      size:'الحجم', fgColor:'اللون الأمامي', bgColor:'لون الخلفية', errLevel:'تصحيح الأخطاء',
      low:'منخفض', medium:'متوسط', quartile:'ربع', high:'عالي',
      download:'تحميل PNG', copy:'نسخ', copied:'تم النسخ!',
      ssid:'اسم الشبكة (SSID)', wifiPass:'كلمة المرور', encryption:'التشفير', none:'بدون',
      emailAddr:'عنوان البريد', subject:'الموضوع', body:'الرسالة',
      phoneNum:'رقم الهاتف', generate:'إنشاء', noContent:'أدخل المحتوى',
      hidden:'شبكة مخفية', margin:'الهامش',
      save:'حفظ', saved:'تم الحفظ!', savedCodes:'رموز QR المحفوظة',
      noSaved:'لا توجد رموز QR محفوظة', deleteSaved:'حذف', labelPlaceholder:'تسمية (اختياري)',
      generating:'جاري الإنشاء...'
    },
    ko: {
      title:'QR 코드 생성기', inputLabel:'내용', placeholder:'텍스트 또는 URL을 입력하세요...',
      type:'유형', text:'텍스트', url:'URL', wifi:'Wi-Fi', email:'이메일', phone:'전화',
      size:'크기', fgColor:'전경색', bgColor:'배경색', errLevel:'오류 정정',
      low:'낮음', medium:'중간', quartile:'사분위', high:'높음',
      download:'PNG 다운로드', copy:'복사', copied:'복사됨!',
      ssid:'네트워크 이름 (SSID)', wifiPass:'비밀번호', encryption:'암호화', none:'없음',
      emailAddr:'이메일 주소', subject:'제목', body:'메시지',
      phoneNum:'전화번호', generate:'생성', noContent:'내용을 입력하세요',
      hidden:'숨겨진 네트워크', margin:'여백',
      save:'저장', saved:'저장됨!', savedCodes:'저장된 QR 코드',
      noSaved:'저장된 QR 코드가 없습니다', deleteSaved:'삭제', labelPlaceholder:'라벨 (선택)',
      generating:'생성 중...'
    },
    hi: {
      title:'QR कोड मेकर', inputLabel:'सामग्री', placeholder:'टेक्स्ट या URL दर्ज करें...',
      type:'प्रकार', text:'टेक्स्ट', url:'URL', wifi:'वाई-फ़ाई', email:'ईमेल', phone:'फ़ोन',
      size:'आकार', fgColor:'अग्रभूमि', bgColor:'पृष्ठभूमि', errLevel:'त्रुटि सुधार',
      low:'कम', medium:'मध्यम', quartile:'चतुर्थक', high:'उच्च',
      download:'PNG डाउनलोड', copy:'कॉपी', copied:'कॉपी हो गया!',
      ssid:'नेटवर्क नाम (SSID)', wifiPass:'पासवर्ड', encryption:'एन्क्रिप्शन', none:'कोई नहीं',
      emailAddr:'ईमेल पता', subject:'विषय', body:'संदेश',
      phoneNum:'फ़ोन नंबर', generate:'बनाएं', noContent:'सामग्री दर्ज करें',
      hidden:'छिपा नेटवर्क', margin:'हाशिया',
      save:'सहेजें', saved:'सहेजा गया!', savedCodes:'सहेजे गए QR कोड',
      noSaved:'कोई सहेजा गया QR कोड नहीं', deleteSaved:'हटाएं', labelPlaceholder:'लेबल (वैकल्पिक)',
      generating:'बना रहा है...'
    },
    pt: {
      title:'Gerador de QR Code', inputLabel:'Conteúdo', placeholder:'Digite texto ou URL...',
      type:'Tipo', text:'Texto', url:'URL', wifi:'Wi-Fi', email:'E-mail', phone:'Telefone',
      size:'Tamanho', fgColor:'Primeiro plano', bgColor:'Fundo', errLevel:'Correção de erro',
      low:'Baixo', medium:'Médio', quartile:'Quartil', high:'Alto',
      download:'Baixar PNG', copy:'Copiar', copied:'Copiado!',
      ssid:'Nome da rede (SSID)', wifiPass:'Senha', encryption:'Criptografia', none:'Nenhum',
      emailAddr:'Endereço de e-mail', subject:'Assunto', body:'Mensagem',
      phoneNum:'Número de telefone', generate:'Gerar', noContent:'Digite o conteúdo',
      hidden:'Rede oculta', margin:'Margem',
      save:'Salvar', saved:'Salvo!', savedCodes:'QR Codes salvos',
      noSaved:'Nenhum QR code salvo', deleteSaved:'Excluir', labelPlaceholder:'Rótulo (opcional)',
      generating:'Gerando...'
    }
  };

  function getLocale() {
    try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; }
  }

  function getToken() {
    try { return localStorage.getItem('auth_token') || ''; } catch { return ''; }
  }

  return {
    setup() {
      var locale = ref(getLocale());
      function t(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

      // State
      var qrType = ref('text');
      var textInput = ref('');
      var urlInput = ref('https://');
      var wifiSSID = ref('');
      var wifiPass = ref('');
      var wifiEnc = ref('WPA');
      var wifiHidden = ref(false);
      var emailAddr = ref('');
      var emailSubject = ref('');
      var emailBody = ref('');
      var phoneNum = ref('');
      var qrSize = ref(256);
      var fgColor = ref('#000000');
      var bgColor = ref('#ffffff');
      var errLevel = ref('M');
      var margin = ref(2);
      var copiedMsg = ref(false);
      var savedMsg = ref(false);
      var qrImageUrl = ref('');
      var generating = ref(false);
      var saveLabel = ref('');
      var savedCodes = ref([]);
      var showSaved = ref(false);

      var TYPES = [
        { key: 'text', icon: '📝' },
        { key: 'url', icon: '🔗' },
        { key: 'wifi', icon: '📶' },
        { key: 'email', icon: '📧' },
        { key: 'phone', icon: '📞' }
      ];

      var ERR_OPTIONS = ['L', 'M', 'Q', 'H'];
      var ERR_LABEL_KEYS = { L: 'low', M: 'medium', Q: 'quartile', H: 'high' };

      var qrContent = computed(function() {
        switch (qrType.value) {
          case 'url':
            return urlInput.value.trim();
          case 'wifi':
            if (!wifiSSID.value.trim()) return '';
            var hidden = wifiHidden.value ? 'H:true' : '';
            return 'WIFI:T:' + wifiEnc.value + ';S:' + wifiSSID.value + ';P:' + wifiPass.value + ';' + hidden + ';';
          case 'email':
            if (!emailAddr.value.trim()) return '';
            var mailto = 'mailto:' + encodeURIComponent(emailAddr.value.trim());
            var params = [];
            if (emailSubject.value.trim()) params.push('subject=' + encodeURIComponent(emailSubject.value.trim()));
            if (emailBody.value.trim()) params.push('body=' + encodeURIComponent(emailBody.value.trim()));
            return mailto + (params.length ? '?' + params.join('&') : '');
          case 'phone':
            return phoneNum.value.trim() ? 'tel:' + phoneNum.value.trim() : '';
          default:
            return textInput.value.trim();
        }
      });

      var hasContent = computed(function() { return qrContent.value.length > 0; });

      var _debounceTimer = null;
      function generateQR() {
        clearTimeout(_debounceTimer);
        if (!hasContent.value) { qrImageUrl.value = ''; return; }
        _debounceTimer = setTimeout(async function() {
          if (!hasContent.value) return;
          generating.value = true;
          try {
            var res = await fetch('/api/qrcode/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
              body: JSON.stringify({
                content: qrContent.value,
                size: qrSize.value,
                fgColor: fgColor.value,
                bgColor: bgColor.value,
                errLevel: errLevel.value,
                margin: margin.value
              })
            });
            if (res.ok) {
              var data = await res.json();
              qrImageUrl.value = data.dataUrl;
            }
          } catch(e) { /* ignore */ }
          generating.value = false;
        }, 300);
      }

      watch([qrContent, qrSize, fgColor, bgColor, errLevel, margin], generateQR);

      function downloadPNG() {
        if (!qrImageUrl.value) return;
        var link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = qrImageUrl.value;
        link.click();
      }

      async function copyToClipboard() {
        if (!qrImageUrl.value) return;
        try {
          var resp = await fetch(qrImageUrl.value);
          var blob = await resp.blob();
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          copiedMsg.value = true;
          setTimeout(function() { copiedMsg.value = false; }, 2000);
        } catch(e) { /* ignore */ }
      }

      async function saveQRCode() {
        if (!qrImageUrl.value || !qrContent.value) return;
        try {
          var res = await fetch('/api/qrcode/saved', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
            body: JSON.stringify({
              label: saveLabel.value,
              content: qrContent.value,
              dataUrl: qrImageUrl.value,
              options: { type: qrType.value, size: qrSize.value, fgColor: fgColor.value, bgColor: bgColor.value, errLevel: errLevel.value, margin: margin.value }
            })
          });
          if (res.ok) {
            var data = await res.json();
            savedCodes.value.unshift(data.code);
            savedMsg.value = true;
            saveLabel.value = '';
            setTimeout(function() { savedMsg.value = false; }, 2000);
          }
        } catch(e) { /* ignore */ }
      }

      async function loadSavedCodes() {
        try {
          var res = await fetch('/api/qrcode/saved', {
            headers: { 'Authorization': 'Bearer ' + getToken() }
          });
          if (res.ok) {
            var data = await res.json();
            savedCodes.value = data.codes || [];
          }
        } catch(e) { /* ignore */ }
      }

      async function deleteSavedCode(id) {
        try {
          var res = await fetch('/api/qrcode/saved/' + encodeURIComponent(id), {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + getToken() }
          });
          if (res.ok) {
            savedCodes.value = savedCodes.value.filter(function(c) { return c.id !== id; });
          }
        } catch(e) { /* ignore */ }
      }

      function loadSavedToEditor(code) {
        if (code.options) {
          qrType.value = code.options.type || 'text';
          qrSize.value = code.options.size || 256;
          fgColor.value = code.options.fgColor || '#000000';
          bgColor.value = code.options.bgColor || '#ffffff';
          errLevel.value = code.options.errLevel || 'M';
          margin.value = code.options.margin ?? 2;
        }
        nextTick(function() {
          switch (qrType.value) {
            case 'url': urlInput.value = code.content; break;
            case 'phone': phoneNum.value = code.content.replace('tel:', ''); break;
            default: textInput.value = code.content; break;
          }
          qrImageUrl.value = code.dataUrl;
          showSaved.value = false;
        });
      }

      onMounted(function() {
        window.addEventListener('locale-changed', onLocaleChanged);
        loadSavedCodes();
        generateQR();
      });

      onUnmounted(function() {
        window.removeEventListener('locale-changed', onLocaleChanged);
      });

      return {
        t: t, qrType: qrType, TYPES: TYPES,
        textInput: textInput, urlInput: urlInput,
        wifiSSID: wifiSSID, wifiPass: wifiPass, wifiEnc: wifiEnc, wifiHidden: wifiHidden,
        emailAddr: emailAddr, emailSubject: emailSubject, emailBody: emailBody,
        phoneNum: phoneNum,
        qrSize: qrSize, fgColor: fgColor, bgColor: bgColor,
        errLevel: errLevel, ERR_OPTIONS: ERR_OPTIONS, ERR_LABEL_KEYS: ERR_LABEL_KEYS,
        margin: margin,
        hasContent: hasContent, copiedMsg: copiedMsg, savedMsg: savedMsg,
        qrImageUrl: qrImageUrl, generating: generating,
        saveLabel: saveLabel, savedCodes: savedCodes, showSaved: showSaved,
        generateQR: generateQR, downloadPNG: downloadPNG, copyToClipboard: copyToClipboard,
        saveQRCode: saveQRCode, deleteSavedCode: deleteSavedCode, loadSavedToEditor: loadSavedToEditor
      };
    }
  };
})(Vue);
