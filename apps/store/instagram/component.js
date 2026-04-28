(function(Vue) {
  const { ref, computed, onMounted, onBeforeUnmount } = Vue;

  const LANGS = {
    tr: {
      title: 'Instagram',
      subtitle: 'Aşağıdaki bağlantılardan Instagram\'a erişin',
      feed: 'Ana Sayfa',
      explore: 'Keşfet',
      reels: 'Reels',
      messages: 'Mesajlar',
      stories: 'Hikayeler',
      shop: 'Mağaza',
      openMain: 'Instagram\'ı Aç',
      popupBlocked: 'Açılır pencere engelleyiciniz aktif olabilir. Lütfen bu site için izin verin.'
    },
    en: {
      title: 'Instagram',
      subtitle: 'Access Instagram from the links below',
      feed: 'Home',
      explore: 'Explore',
      reels: 'Reels',
      messages: 'Messages',
      stories: 'Stories',
      shop: 'Shop',
      openMain: 'Open Instagram',
      popupBlocked: 'Your pop-up blocker may be active. Please allow it for this site.'
    },
    de: {
      title: 'Instagram',
      subtitle: 'Greifen Sie über die Links unten auf Instagram zu',
      feed: 'Startseite',
      explore: 'Entdecken',
      reels: 'Reels',
      messages: 'Nachrichten',
      stories: 'Stories',
      shop: 'Shop',
      openMain: 'Instagram öffnen',
      popupBlocked: 'Ihr Pop-up-Blocker ist möglicherweise aktiv. Bitte erlauben Sie ihn für diese Website.'
    },
    fr: {
      title: 'Instagram',
      subtitle: 'Accédez à Instagram via les liens ci-dessous',
      feed: 'Accueil',
      explore: 'Explorer',
      reels: 'Reels',
      messages: 'Messages',
      stories: 'Stories',
      shop: 'Boutique',
      openMain: 'Ouvrir Instagram',
      popupBlocked: 'Votre bloqueur de pop-ups est peut-être actif. Veuillez l\'autoriser pour ce site.'
    },
    es: {
      title: 'Instagram',
      subtitle: 'Accede a Instagram desde los enlaces a continuación',
      feed: 'Inicio',
      explore: 'Explorar',
      reels: 'Reels',
      messages: 'Mensajes',
      stories: 'Historias',
      shop: 'Tienda',
      openMain: 'Abrir Instagram',
      popupBlocked: 'Su bloqueador de ventanas emergentes puede estar activo. Permítalo para este sitio.'
    },
    ru: {
      title: 'Instagram',
      subtitle: 'Доступ к Instagram по ссылкам ниже',
      feed: 'Главная',
      explore: 'Обзор',
      reels: 'Reels',
      messages: 'Сообщения',
      stories: 'Истории',
      shop: 'Магазин',
      openMain: 'Открыть Instagram',
      popupBlocked: 'Ваш блокировщик всплывающих окон может быть активен. Разрешите его для этого сайта.'
    },
    zh: {
      title: 'Instagram',
      subtitle: '通过以下链接访问Instagram',
      feed: '首页',
      explore: '探索',
      reels: 'Reels',
      messages: '消息',
      stories: '快拍',
      shop: '商店',
      openMain: '打开Instagram',
      popupBlocked: '您的弹出窗口拦截器可能处于活动状态。请为此网站允许。'
    },
    ja: {
      title: 'Instagram',
      subtitle: '以下のリンクからInstagramにアクセス',
      feed: 'ホーム',
      explore: '発見',
      reels: 'リール',
      messages: 'メッセージ',
      stories: 'ストーリーズ',
      shop: 'ショップ',
      openMain: 'Instagramを開く',
      popupBlocked: 'ポップアップブロッカーが有効になっている可能性があります。このサイトを許可してください。'
    },
    it: {
      title: 'Instagram',
      subtitle: 'Accedi a Instagram dai link sottostanti',
      feed: 'Home',
      explore: 'Esplora',
      reels: 'Reels',
      messages: 'Messaggi',
      stories: 'Storie',
      shop: 'Negozio',
      openMain: 'Apri Instagram',
      popupBlocked: 'Il blocco popup potrebbe essere attivo. Consentilo per questo sito.'
    },
    ar: {
      title: 'إنستغرام',
      subtitle: 'الوصول إلى إنستغرام من الروابط أدناه',
      feed: 'الرئيسية',
      explore: 'استكشاف',
      reels: 'ريلز',
      messages: 'الرسائل',
      stories: 'القصص',
      shop: 'المتجر',
      openMain: 'فتح إنستغرام',
      popupBlocked: 'قد يكون مانع النوافذ المنبثقة نشطًا. يرجى السماح لهذا الموقع.'
    },
    ko: {
      title: '인스타그램',
      subtitle: '아래 링크에서 인스타그램에 접속하세요',
      feed: '홈',
      explore: '탐색',
      reels: '릴스',
      messages: '메시지',
      stories: '스토리',
      shop: '쇼핑',
      openMain: '인스타그램 열기',
      popupBlocked: '팝업 차단기가 활성화되어 있을 수 있습니다. 이 사이트를 허용해 주세요.'
    },
    hi: {
      title: 'इंस्टाग्राम',
      subtitle: 'नीचे दिए गए लिंक से इंस्टाग्राम एक्सेस करें',
      feed: 'होम',
      explore: 'एक्सप्लोर',
      reels: 'रील्स',
      messages: 'संदेश',
      stories: 'स्टोरीज़',
      shop: 'शॉप',
      openMain: 'इंस्टाग्राम खोलें',
      popupBlocked: 'आपका पॉप-अप ब्लॉकर सक्रिय हो सकता है। कृपया इस साइट के लिए अनुमति दें।'
    },
    pt: {
      title: 'Instagram',
      subtitle: 'Acesse o Instagram pelos links abaixo',
      feed: 'Início',
      explore: 'Explorar',
      reels: 'Reels',
      messages: 'Mensagens',
      stories: 'Stories',
      shop: 'Loja',
      openMain: 'Abrir Instagram',
      popupBlocked: 'Seu bloqueador de pop-ups pode estar ativo. Permita-o para este site.'
    }
  };

  return {
    setup() {
      const locale = ref(localStorage.getItem('sys_locale') || 'en');
      const t = computed(() => LANGS[locale.value] || LANGS.en);

      const shortcuts = computed(() => [
        { key: 'feed', icon: '🏠', url: 'https://www.instagram.com/' },
        { key: 'explore', icon: '🔍', url: 'https://www.instagram.com/explore/' },
        { key: 'reels', icon: '🎬', url: 'https://www.instagram.com/reels/' },
        { key: 'messages', icon: '✉️', url: 'https://www.instagram.com/direct/inbox/' },
        { key: 'stories', icon: '⭕', url: 'https://www.instagram.com/stories/' },
        { key: 'shop', icon: '🛍️', url: 'https://www.instagram.com/shop/' }
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
        window.open('https://www.instagram.com/', '_blank');
      });

      onBeforeUnmount(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
      });

      return { t, shortcuts, openLink };
    }
  };
})(Vue);
