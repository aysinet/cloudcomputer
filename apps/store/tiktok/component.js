(function(Vue) {
  const { ref, computed, onMounted, onBeforeUnmount } = Vue;

  const LANGS = {
    tr: {
      title:'TikTok',
      subtitle:'Aşağıdaki bağlantılardan TikTok\'a erişin',
      foryou:'Senin İçin',
      explore:'Keşfet',
      following:'Takip',
      live:'Canlı',
      upload:'Yükle',
      messages:'Mesajlar',
      openMain:'TikTok\'u Aç',
      popupBlocked:'Açılır pencere engelleyiciniz aktif olabilir. Lütfen bu site için izin verin.'
    },
    en: {
      title:'TikTok',
      subtitle:'Access TikTok from the links below',
      foryou:'For You',
      explore:'Explore',
      following:'Following',
      live:'LIVE',
      upload:'Upload',
      messages:'Messages',
      openMain:'Open TikTok',
      popupBlocked:'Your pop-up blocker may be active. Please allow it for this site.'
    },
    de: {
      title:'TikTok',
      subtitle:'Greifen Sie über die Links unten auf TikTok zu',
      foryou:'Für dich',
      explore:'Entdecken',
      following:'Folge ich',
      live:'LIVE',
      upload:'Hochladen',
      messages:'Nachrichten',
      openMain:'TikTok öffnen',
      popupBlocked:'Ihr Pop-up-Blocker ist möglicherweise aktiv. Bitte erlauben Sie ihn für diese Website.'
    },
    fr: {
      title:'TikTok',
      subtitle:'Accédez à TikTok via les liens ci-dessous',
      foryou:'Pour toi',
      explore:'Explorer',
      following:'Abonnements',
      live:'LIVE',
      upload:'Publier',
      messages:'Messages',
      openMain:'Ouvrir TikTok',
      popupBlocked:'Votre bloqueur de pop-ups est peut-être actif. Veuillez l\'autoriser pour ce site.'
    },
    es: {
      title:'TikTok',
      subtitle:'Accede a TikTok desde los enlaces a continuación',
      foryou:'Para ti',
      explore:'Explorar',
      following:'Siguiendo',
      live:'EN VIVO',
      upload:'Subir',
      messages:'Mensajes',
      openMain:'Abrir TikTok',
      popupBlocked:'Su bloqueador de ventanas emergentes puede estar activo. Permítalo para este sitio.'
    },
    ru: {
      title:'TikTok',
      subtitle:'Доступ к TikTok по ссылкам ниже',
      foryou:'Рекомендации',
      explore:'Обзор',
      following:'Подписки',
      live:'LIVE',
      upload:'Загрузить',
      messages:'Сообщения',
      openMain:'Открыть TikTok',
      popupBlocked:'Ваш блокировщик всплывающих окон может быть активен. Разрешите его для этого сайта.'
    },
    zh: {
      title:'TikTok',
      subtitle:'通过以下链接访问TikTok',
      foryou:'推荐',
      explore:'探索',
      following:'关注',
      live:'直播',
      upload:'上传',
      messages:'消息',
      openMain:'打开TikTok',
      popupBlocked:'您的弹出窗口拦截器可能处于活动状态。请为此网站允许。'
    },
    ja: {
      title:'TikTok',
      subtitle:'以下のリンクからTikTokにアクセス',
      foryou:'おすすめ',
      explore:'探索',
      following:'フォロー中',
      live:'ライブ',
      upload:'アップロード',
      messages:'メッセージ',
      openMain:'TikTokを開く',
      popupBlocked:'ポップアップブロッカーが有効になっている可能性があります。このサイトを許可してください。'
    },
    it: {
      title:'TikTok',
      subtitle:'Accedi a TikTok dai link sottostanti',
      foryou:'Per te',
      explore:'Esplora',
      following:'Seguiti',
      live:'LIVE',
      upload:'Carica',
      messages:'Messaggi',
      openMain:'Apri TikTok',
      popupBlocked:'Il blocco popup potrebbe essere attivo. Consentilo per questo sito.'
    },
    ar: {
      title:'تيك توك',
      subtitle:'Access TikTok from the links below',
      foryou:'For You',
      explore:'استكشاف',
      following:'Following',
      live:'LIVE',
      upload:'رفع',
      messages:'الرسائل',
      openMain:'Open TikTok',
      popupBlocked:'قد يكون مانع النوافذ المنبثقة نشطًا. يرجى السماح لهذا الموقع.'
    },
    ko: {
      title:'틱톡',
      subtitle:'Access TikTok from the links below',
      foryou:'For You',
      explore:'탐색',
      following:'Following',
      live:'LIVE',
      upload:'업로드',
      messages:'메시지',
      openMain:'Open TikTok',
      popupBlocked:'팝업 차단기가 활성화되어 있을 수 있습니다. 이 사이트를 허용해 주세요.'
    },
    hi: {
      title:'टिकटॉक',
      subtitle:'Access TikTok from the links below',
      foryou:'For You',
      explore:'एक्सप्लोर',
      following:'Following',
      live:'LIVE',
      upload:'अपलोड',
      messages:'संदेश',
      openMain:'Open TikTok',
      popupBlocked:'आपका पॉप-अप ब्लॉकर सक्रिय हो सकता है। कृपया इस साइट के लिए अनुमति दें।'
    },
    pt: {
      title:'TikTok',
      subtitle:'Access TikTok from the links below',
      foryou:'For You',
      explore:'Explorar',
      following:'Following',
      live:'LIVE',
      upload:'Enviar',
      messages:'Mensagens',
      openMain:'Open TikTok',
      popupBlocked:'Seu bloqueador de pop-ups pode estar ativo. Permita-o para este site.'
    }
  };

  return {
    setup() {
      var locale = ref(localStorage.getItem('sys_locale') || 'en');
      var t = computed(function() { return LANGS[locale.value] || LANGS.en; });

      var shortcuts = computed(function() {
        return [
          { key: 'foryou', icon: '🏠', url: 'https://www.tiktok.com/foryou' },
          { key: 'explore', icon: '🔍', url: 'https://www.tiktok.com/explore' },
          { key: 'following', icon: '👥', url: 'https://www.tiktok.com/following' },
          { key: 'live', icon: '📡', url: 'https://www.tiktok.com/live' },
          { key: 'upload', icon: '➕', url: 'https://www.tiktok.com/upload' },
          { key: 'messages', icon: '✉️', url: 'https://www.tiktok.com/messages' }
        ];
      });

      function openLink(url) {
        window.open(url, '_blank');
      }

      function onLocaleChanged(e) {
        if (e.detail && e.detail.locale) {
          locale.value = e.detail.locale;
        }
      }

      onMounted(function() {
        window.addEventListener('locale-changed', onLocaleChanged);
        window.open('https://www.tiktok.com/', '_blank');
      });

      onBeforeUnmount(function() {
        window.removeEventListener('locale-changed', onLocaleChanged);
      });

      return { t, shortcuts, openLink };
    }
  };
})(Vue);
