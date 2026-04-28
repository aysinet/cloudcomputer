(function(Vue) {
  const { ref, computed, onMounted, onBeforeUnmount } = Vue;

  const LANGS = {
    tr: {
      title: 'Facebook',
      subtitle: 'Aşağıdaki bağlantılardan Facebook\'a erişin',
      feed: 'Haber Akışı',
      messenger: 'Messenger',
      marketplace: 'Marketplace',
      groups: 'Gruplar',
      watch: 'Watch',
      gaming: 'Gaming',
      openMain: 'Facebook\'u Aç',
      popupBlocked: 'Açılır pencere engelleyiciniz aktif olabilir. Lütfen bu site için izin verin.',
      opening: 'Facebook açılıyor...'
    },
    en: {
      title: 'Facebook',
      subtitle: 'Access Facebook from the links below',
      feed: 'News Feed',
      messenger: 'Messenger',
      marketplace: 'Marketplace',
      groups: 'Groups',
      watch: 'Watch',
      gaming: 'Gaming',
      openMain: 'Open Facebook',
      popupBlocked: 'Your pop-up blocker may be active. Please allow it for this site.',
      opening: 'Opening Facebook...'
    },
    de: {
      title: 'Facebook',
      subtitle: 'Greifen Sie über die Links unten auf Facebook zu',
      feed: 'Neuigkeiten',
      messenger: 'Messenger',
      marketplace: 'Marketplace',
      groups: 'Gruppen',
      watch: 'Watch',
      gaming: 'Gaming',
      openMain: 'Facebook öffnen',
      popupBlocked: 'Ihr Pop-up-Blocker ist möglicherweise aktiv. Bitte erlauben Sie ihn für diese Website.',
      opening: 'Facebook wird geöffnet...'
    },
    fr: {
      title: 'Facebook',
      subtitle: 'Accédez à Facebook via les liens ci-dessous',
      feed: 'Fil d\'actualité',
      messenger: 'Messenger',
      marketplace: 'Marketplace',
      groups: 'Groupes',
      watch: 'Watch',
      gaming: 'Gaming',
      openMain: 'Ouvrir Facebook',
      popupBlocked: 'Votre bloqueur de pop-ups est peut-être actif. Veuillez l\'autoriser pour ce site.',
      opening: 'Ouverture de Facebook...'
    },
    es: {
      title: 'Facebook',
      subtitle: 'Accede a Facebook desde los enlaces a continuación',
      feed: 'Noticias',
      messenger: 'Messenger',
      marketplace: 'Marketplace',
      groups: 'Grupos',
      watch: 'Watch',
      gaming: 'Gaming',
      openMain: 'Abrir Facebook',
      popupBlocked: 'Su bloqueador de ventanas emergentes puede estar activo. Permítalo para este sitio.',
      opening: 'Abriendo Facebook...'
    },
    ru: {
      title: 'Facebook',
      subtitle: 'Доступ к Facebook по ссылкам ниже',
      feed: 'Новости',
      messenger: 'Мессенджер',
      marketplace: 'Маркетплейс',
      groups: 'Группы',
      watch: 'Watch',
      gaming: 'Игры',
      openMain: 'Открыть Facebook',
      popupBlocked: 'Ваш блокировщик всплывающих окон может быть активен. Разрешите его для этого сайта.',
      opening: 'Открытие Facebook...'
    },
    zh: {
      title: 'Facebook',
      subtitle: '通过以下链接访问Facebook',
      feed: '动态消息',
      messenger: 'Messenger',
      marketplace: '市场',
      groups: '群组',
      watch: 'Watch',
      gaming: '游戏',
      openMain: '打开Facebook',
      popupBlocked: '您的弹出窗口拦截器可能处于活动状态。请为此网站允许。',
      opening: '正在打开Facebook...'
    },
    ja: {
      title: 'Facebook',
      subtitle: '以下のリンクからFacebookにアクセス',
      feed: 'ニュースフィード',
      messenger: 'Messenger',
      marketplace: 'マーケットプレイス',
      groups: 'グループ',
      watch: 'Watch',
      gaming: 'ゲーム',
      openMain: 'Facebookを開く',
      popupBlocked: 'ポップアップブロッカーが有効になっている可能性があります。このサイトを許可してください。',
      opening: 'Facebookを開いています...'
    },
    it: {
      title: 'Facebook',
      subtitle: 'Accedi a Facebook dai link sottostanti',
      feed: 'Notizie',
      messenger: 'Messenger',
      marketplace: 'Marketplace',
      groups: 'Gruppi',
      watch: 'Watch',
      gaming: 'Gaming',
      openMain: 'Apri Facebook',
      popupBlocked: 'Il blocco popup potrebbe essere attivo. Consentilo per questo sito.',
      opening: 'Apertura di Facebook...'
    }
  };

  return {
    setup() {
      const locale = ref(localStorage.getItem('sys_locale') || 'en');
      const t = computed(() => LANGS[locale.value] || LANGS.en);

      const shortcuts = computed(() => [
        { key: 'feed', icon: '📰', url: 'https://www.facebook.com/' },
        { key: 'messenger', icon: '💬', url: 'https://www.messenger.com/' },
        { key: 'marketplace', icon: '🏪', url: 'https://www.facebook.com/marketplace/' },
        { key: 'groups', icon: '👥', url: 'https://www.facebook.com/groups/' },
        { key: 'watch', icon: '📺', url: 'https://www.facebook.com/watch/' },
        { key: 'gaming', icon: '🎮', url: 'https://www.facebook.com/gaming/' }
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
        window.open('https://www.facebook.com/', '_blank');
      });

      onBeforeUnmount(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
      });

      return { t, shortcuts, openLink };
    }
  };
})(Vue);
