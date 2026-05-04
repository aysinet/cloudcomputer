(function(Vue) {
  const { ref, computed, onMounted, onBeforeUnmount } = Vue;

  const LANGS = {
    tr: {
      title:'X (Twitter)',
      subtitle:'Aşağıdaki bağlantılardan X\'e erişin',
      home:'Ana Sayfa',
      explore:'Keşfet',
      notifications:'Bildirimler',
      messages:'Mesajlar',
      bookmarks:'Yer İşaretleri',
      lists:'Listeler',
      openMain:'X\'i Aç',
      popupBlocked:'Açılır pencere engelleyiciniz aktif olabilir. Lütfen bu site için izin verin.'
    },
    en: {
      title:'X (Twitter)',
      subtitle:'Access X from the links below',
      home:'Home',
      explore:'Explore',
      notifications:'Notifications',
      messages:'Messages',
      bookmarks:'Bookmarks',
      lists:'Lists',
      openMain:'Open X',
      popupBlocked:'Your pop-up blocker may be active. Please allow it for this site.'
    },
    de: {
      title:'X (Twitter)',
      subtitle:'Greifen Sie über die Links unten auf X zu',
      home:'Startseite',
      explore:'Entdecken',
      notifications:'Benachrichtigungen',
      messages:'Nachrichten',
      bookmarks:'Lesezeichen',
      lists:'Listen',
      openMain:'X öffnen',
      popupBlocked:'Ihr Pop-up-Blocker ist möglicherweise aktiv. Bitte erlauben Sie ihn für diese Website.'
    },
    fr: {
      title:'X (Twitter)',
      subtitle:'Accédez à X via les liens ci-dessous',
      home:'Accueil',
      explore:'Explorer',
      notifications:'Notifications',
      messages:'Messages',
      bookmarks:'Signets',
      lists:'Listes',
      openMain:'Ouvrir X',
      popupBlocked:'Votre bloqueur de pop-ups est peut-être actif. Veuillez l\'autoriser pour ce site.'
    },
    es: {
      title:'X (Twitter)',
      subtitle:'Accede a X desde los enlaces a continuación',
      home:'Inicio',
      explore:'Explorar',
      notifications:'Notificaciones',
      messages:'Mensajes',
      bookmarks:'Marcadores',
      lists:'Listas',
      openMain:'Abrir X',
      popupBlocked:'Su bloqueador de ventanas emergentes puede estar activo. Permítalo para este sitio.'
    },
    ru: {
      title:'X (Twitter)',
      subtitle:'Доступ к X по ссылкам ниже',
      home:'Главная',
      explore:'Обзор',
      notifications:'Уведомления',
      messages:'Сообщения',
      bookmarks:'Закладки',
      lists:'Списки',
      openMain:'Открыть X',
      popupBlocked:'Ваш блокировщик всплывающих окон может быть активен. Разрешите его для этого сайта.'
    },
    zh: {
      title:'X (Twitter)',
      subtitle:'通过以下链接访问X',
      home:'首页',
      explore:'探索',
      notifications:'通知',
      messages:'消息',
      bookmarks:'书签',
      lists:'列表',
      openMain:'打开X',
      popupBlocked:'您的弹出窗口拦截器可能处于活动状态。请为此网站允许。'
    },
    ja: {
      title:'X (Twitter)',
      subtitle:'以下のリンクからXにアクセス',
      home:'ホーム',
      explore:'探索',
      notifications:'通知',
      messages:'メッセージ',
      bookmarks:'ブックマーク',
      lists:'リスト',
      openMain:'Xを開く',
      popupBlocked:'ポップアップブロッカーが有効になっている可能性があります。このサイトを許可してください。'
    },
    it: {
      title:'X (Twitter)',
      subtitle:'Accedi a X dai link sottostanti',
      home:'Home',
      explore:'Esplora',
      notifications:'Notifiche',
      messages:'Messaggi',
      bookmarks:'Segnalibri',
      lists:'Liste',
      openMain:'Apri X',
      popupBlocked:'Il blocco popup potrebbe essere attivo. Consentilo per questo sito.'
    },
    ar: {
      title:'إكس (تويتر)',
      subtitle:'Access X from the links below',
      home:'الرئيسية',
      explore:'استكشاف',
      notifications:'Notifications',
      messages:'الرسائل',
      bookmarks:'Bookmarks',
      lists:'Lists',
      openMain:'Open X',
      popupBlocked:'قد يكون مانع النوافذ المنبثقة نشطًا. يرجى السماح لهذا الموقع.'
    },
    ko: {
      title:'X (트위터)',
      subtitle:'Access X from the links below',
      home:'홈',
      explore:'탐색',
      notifications:'Notifications',
      messages:'메시지',
      bookmarks:'Bookmarks',
      lists:'Lists',
      openMain:'Open X',
      popupBlocked:'팝업 차단기가 활성화되어 있을 수 있습니다. 이 사이트를 허용해 주세요.'
    },
    hi: {
      title:'X (ट्विटर)',
      subtitle:'Access X from the links below',
      home:'होम',
      explore:'एक्सप्लोर',
      notifications:'Notifications',
      messages:'संदेश',
      bookmarks:'Bookmarks',
      lists:'Lists',
      openMain:'Open X',
      popupBlocked:'आपका पॉप-अप ब्लॉकर सक्रिय हो सकता है। कृपया इस साइट के लिए अनुमति दें।'
    },
    pt: {
      title:'X (Twitter)',
      subtitle:'Access X from the links below',
      home:'Início',
      explore:'Explorar',
      notifications:'Notifications',
      messages:'Mensagens',
      bookmarks:'Bookmarks',
      lists:'Lists',
      openMain:'Open X',
      popupBlocked:'Seu bloqueador de pop-ups pode estar ativo. Permita-o para este site.'
    }
  };

  return {
    setup() {
      const locale = ref(localStorage.getItem('sys_locale') || 'en');
      const t = computed(() => LANGS[locale.value] || LANGS.en);

      const shortcuts = computed(() => [
        { key: 'home', icon: '🏠', url: 'https://x.com/home' },
        { key: 'explore', icon: '🔍', url: 'https://x.com/explore' },
        { key: 'notifications', icon: '🔔', url: 'https://x.com/notifications' },
        { key: 'messages', icon: '✉️', url: 'https://x.com/messages' },
        { key: 'bookmarks', icon: '🔖', url: 'https://x.com/i/bookmarks' },
        { key: 'lists', icon: '📋', url: 'https://x.com/i/lists' }
      ]);

      function openLink(url) {
        window.open(url, '_blank');
      }

      function onLocaleChanged(e) {
        if (e.detail && e.detail.locale) {
          locale.value = e.detail.locale;
        }
      }

      onMounted(() => {
        window.addEventListener('locale-changed', onLocaleChanged);
        window.open('https://x.com/', '_blank');
      });

      onBeforeUnmount(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
      });

      return { t, shortcuts, openLink };
    }
  };
})(Vue);
