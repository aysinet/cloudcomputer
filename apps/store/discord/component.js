(function(Vue) {
  const { ref, computed, onMounted, onBeforeUnmount } = Vue;

  const LANGS = {
    tr: {
      title: 'Discord',
      subtitle: 'Aşağıdaki bağlantılardan Discord\'a erişin',
      channels: 'Kanallar',
      friends: 'Arkadaşlar',
      nitro: 'Nitro',
      discover: 'Keşfet',
      apps: 'Uygulama Dizini',
      safety: 'Güvenlik Merkezi',
      openMain: 'Discord\'u Aç',
      popupBlocked: 'Açılır pencere engelleyiciniz aktif olabilir. Lütfen bu site için izin verin.'
    },
    en: {
      title: 'Discord',
      subtitle: 'Access Discord from the links below',
      channels: 'Channels',
      friends: 'Friends',
      nitro: 'Nitro',
      discover: 'Discover',
      apps: 'App Directory',
      safety: 'Safety Center',
      openMain: 'Open Discord',
      popupBlocked: 'Your pop-up blocker may be active. Please allow it for this site.'
    },
    de: {
      title: 'Discord',
      subtitle: 'Greifen Sie über die Links unten auf Discord zu',
      channels: 'Kanäle',
      friends: 'Freunde',
      nitro: 'Nitro',
      discover: 'Entdecken',
      apps: 'App-Verzeichnis',
      safety: 'Sicherheitscenter',
      openMain: 'Discord öffnen',
      popupBlocked: 'Ihr Pop-up-Blocker ist möglicherweise aktiv. Bitte erlauben Sie ihn für diese Website.'
    },
    fr: {
      title: 'Discord',
      subtitle: 'Accédez à Discord via les liens ci-dessous',
      channels: 'Salons',
      friends: 'Amis',
      nitro: 'Nitro',
      discover: 'Découvrir',
      apps: 'Répertoire d\'apps',
      safety: 'Centre de sécurité',
      openMain: 'Ouvrir Discord',
      popupBlocked: 'Votre bloqueur de pop-ups est peut-être actif. Veuillez l\'autoriser pour ce site.'
    },
    es: {
      title: 'Discord',
      subtitle: 'Accede a Discord desde los enlaces a continuación',
      channels: 'Canales',
      friends: 'Amigos',
      nitro: 'Nitro',
      discover: 'Descubrir',
      apps: 'Directorio de apps',
      safety: 'Centro de seguridad',
      openMain: 'Abrir Discord',
      popupBlocked: 'Su bloqueador de ventanas emergentes puede estar activo. Permítalo para este sitio.'
    },
    ru: {
      title: 'Discord',
      subtitle: 'Доступ к Discord по ссылкам ниже',
      channels: 'Каналы',
      friends: 'Друзья',
      nitro: 'Nitro',
      discover: 'Обзор',
      apps: 'Каталог приложений',
      safety: 'Центр безопасности',
      openMain: 'Открыть Discord',
      popupBlocked: 'Ваш блокировщик всплывающих окон может быть активен. Разрешите его для этого сайта.'
    },
    zh: {
      title: 'Discord',
      subtitle: '通过以下链接访问Discord',
      channels: '频道',
      friends: '好友',
      nitro: 'Nitro',
      discover: '发现',
      apps: '应用目录',
      safety: '安全中心',
      openMain: '打开Discord',
      popupBlocked: '您的弹出窗口拦截器可能处于活动状态。请为此网站允许。'
    },
    ja: {
      title: 'Discord',
      subtitle: '以下のリンクからDiscordにアクセス',
      channels: 'チャンネル',
      friends: 'フレンド',
      nitro: 'Nitro',
      discover: 'ディスカバー',
      apps: 'アプリディレクトリ',
      safety: 'セーフティセンター',
      openMain: 'Discordを開く',
      popupBlocked: 'ポップアップブロッカーが有効になっている可能性があります。このサイトを許可してください。'
    },
    it: {
      title: 'Discord',
      subtitle: 'Accedi a Discord dai link sottostanti',
      channels: 'Canali',
      friends: 'Amici',
      nitro: 'Nitro',
      discover: 'Scopri',
      apps: 'Directory app',
      safety: 'Centro sicurezza',
      openMain: 'Apri Discord',
      popupBlocked: 'Il blocco popup potrebbe essere attivo. Consentilo per questo sito.'
    },
    ar: {
      title: 'ديسكورد',
      subtitle: 'الوصول إلى ديسكورد من الروابط أدناه',
      channels: 'القنوات',
      friends: 'الأصدقاء',
      nitro: 'نيترو',
      discover: 'اكتشف',
      apps: 'دليل التطبيقات',
      safety: 'مركز الأمان',
      openMain: 'فتح ديسكورد',
      popupBlocked: 'قد يكون مانع النوافذ المنبثقة نشطًا. يرجى السماح لهذا الموقع.'
    },
    ko: {
      title: '디스코드',
      subtitle: '아래 링크에서 디스코드에 접속하세요',
      channels: '채널',
      friends: '친구',
      nitro: 'Nitro',
      discover: '탐색',
      apps: '앱 디렉토리',
      safety: '안전 센터',
      openMain: '디스코드 열기',
      popupBlocked: '팝업 차단기가 활성화되어 있을 수 있습니다. 이 사이트를 허용해 주세요.'
    },
    hi: {
      title: 'डिस्कॉर्ड',
      subtitle: 'नीचे दिए गए लिंक से डिस्कॉर्ड एक्सेस करें',
      channels: 'चैनल',
      friends: 'मित्र',
      nitro: 'Nitro',
      discover: 'डिस्कवर',
      apps: 'ऐप डायरेक्टरी',
      safety: 'सुरक्षा केंद्र',
      openMain: 'डिस्कॉर्ड खोलें',
      popupBlocked: 'आपका पॉप-अप ब्लॉकर सक्रिय हो सकता है। कृपया इस साइट के लिए अनुमति दें।'
    },
    pt: {
      title: 'Discord',
      subtitle: 'Acesse o Discord pelos links abaixo',
      channels: 'Canais',
      friends: 'Amigos',
      nitro: 'Nitro',
      discover: 'Descobrir',
      apps: 'Diretório de apps',
      safety: 'Central de segurança',
      openMain: 'Abrir Discord',
      popupBlocked: 'Seu bloqueador de pop-ups pode estar ativo. Permita-o para este site.'
    }
  };

  return {
    setup() {
      const locale = ref(localStorage.getItem('sys_locale') || 'en');
      const t = computed(() => LANGS[locale.value] || LANGS.en);

      const shortcuts = computed(() => [
        { key: 'channels', icon: '💬', url: 'https://discord.com/channels/@me' },
        { key: 'friends', icon: '👥', url: 'https://discord.com/channels/@me' },
        { key: 'nitro', icon: '🚀', url: 'https://discord.com/nitro' },
        { key: 'discover', icon: '🔍', url: 'https://discord.com/servers' },
        { key: 'apps', icon: '🧩', url: 'https://discord.com/application-directory' },
        { key: 'safety', icon: '🛡️', url: 'https://discord.com/safety' }
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
        window.open('https://discord.com/channels/@me', '_blank');
      });

      onBeforeUnmount(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
      });

      return { t, shortcuts, openLink };
    }
  };
})(Vue);
