(function(Vue) {
  const { ref, computed, onMounted, onBeforeUnmount } = Vue;

  const BASE_URL = 'https://www.linkedin.com';

  const LANGS = {
    tr: {
      home: 'Ana Sayfa', back: 'Geri', forward: 'İleri',
      refresh: 'Yenile', openTab: 'Yeni Sekmede Aç',
      feed: 'Akış', network: 'Ağım', jobs: 'İş İlanları',
      messaging: 'Mesajlar', notifications: 'Bildirimler'
    },
    en: {
      home: 'Home', back: 'Back', forward: 'Forward',
      refresh: 'Refresh', openTab: 'Open in New Tab',
      feed: 'Feed', network: 'My Network', jobs: 'Jobs',
      messaging: 'Messaging', notifications: 'Notifications'
    },
    de: {
      home: 'Startseite', back: 'Zurück', forward: 'Vorwärts',
      refresh: 'Aktualisieren', openTab: 'In neuem Tab öffnen',
      feed: 'Feed', network: 'Netzwerk', jobs: 'Jobs',
      messaging: 'Nachrichten', notifications: 'Benachrichtigungen'
    },
    fr: {
      home: 'Accueil', back: 'Retour', forward: 'Suivant',
      refresh: 'Actualiser', openTab: 'Ouvrir dans un nouvel onglet',
      feed: 'Fil', network: 'Réseau', jobs: 'Emplois',
      messaging: 'Messagerie', notifications: 'Notifications'
    },
    es: {
      home: 'Inicio', back: 'Atrás', forward: 'Adelante',
      refresh: 'Actualizar', openTab: 'Abrir en nueva pestaña',
      feed: 'Feed', network: 'Mi Red', jobs: 'Empleos',
      messaging: 'Mensajes', notifications: 'Notificaciones'
    },
    ru: {
      home: 'Главная', back: 'Назад', forward: 'Вперёд',
      refresh: 'Обновить', openTab: 'Открыть в новой вкладке',
      feed: 'Лента', network: 'Сеть', jobs: 'Вакансии',
      messaging: 'Сообщения', notifications: 'Уведомления'
    },
    zh: {
      home: '首页', back: '后退', forward: '前进',
      refresh: '刷新', openTab: '新标签页打开',
      feed: '动态', network: '人脉', jobs: '职位',
      messaging: '消息', notifications: '通知'
    },
    ja: {
      home: 'ホーム', back: '戻る', forward: '進む',
      refresh: '更新', openTab: '新しいタブで開く',
      feed: 'フィード', network: 'ネットワーク', jobs: '求人',
      messaging: 'メッセージ', notifications: '通知'
    },
    it: {
      home: 'Home', back: 'Indietro', forward: 'Avanti',
      refresh: 'Aggiorna', openTab: 'Apri in nuova scheda',
      feed: 'Feed', network: 'Rete', jobs: 'Lavoro',
      messaging: 'Messaggi', notifications: 'Notifiche'
    },
    ar: {
      home: 'الرئيسية', back: 'رجوع', forward: 'تقدم',
      refresh: 'تحديث', openTab: 'فتح في علامة تبويب جديدة',
      feed: 'الخلاصة', network: 'شبكتي', jobs: 'وظائف',
      messaging: 'الرسائل', notifications: 'الإشعارات'
    },
    ko: {
      home: '홈', back: '뒤로', forward: '앞으로',
      refresh: '새로고침', openTab: '새 탭에서 열기',
      feed: '피드', network: '네트워크', jobs: '채용',
      messaging: '메시지', notifications: '알림'
    },
    hi: {
      home: 'होम', back: 'पीछे', forward: 'आगे',
      refresh: 'रीफ़्रेश', openTab: 'नई टैब में खोलें',
      feed: 'फ़ीड', network: 'नेटवर्क', jobs: 'नौकरियाँ',
      messaging: 'संदेश', notifications: 'सूचनाएं'
    },
    pt: {
      home: 'Início', back: 'Voltar', forward: 'Avançar',
      refresh: 'Atualizar', openTab: 'Abrir em nova aba',
      feed: 'Feed', network: 'Rede', jobs: 'Vagas',
      messaging: 'Mensagens', notifications: 'Notificações'
    }
  };

  return {
    setup() {
      const locale = ref(localStorage.getItem('sys_locale') || 'en');
      const t = computed(() => LANGS[locale.value] || LANGS.en);
      const linkedinFrame = ref(null);

      function proxyUrl(url) {
        return '/api/browser/proxy?url=' + encodeURIComponent(url);
      }

      function getRealUrl() {
        const src = iframeSrc.value;
        try {
          const u = new URL(src, location.origin);
          return u.searchParams.get('url') || src;
        } catch { return src; }
      }

      const iframeSrc = ref(proxyUrl(BASE_URL + '/'));

      const shortcuts = computed(() => [
        { key: 'feed',          icon: '📰', path: '/feed/' },
        { key: 'network',       icon: '👥', path: '/mynetwork/' },
        { key: 'jobs',          icon: '💼', path: '/jobs/' },
        { key: 'messaging',     icon: '💬', path: '/messaging/' },
        { key: 'notifications', icon: '🔔', path: '/notifications/' }
      ]);

      function navigateHome() {
        iframeSrc.value = proxyUrl(BASE_URL + '/');
      }

      function navigateTo(path) {
        iframeSrc.value = proxyUrl(BASE_URL + path);
      }

      function goBack() {
        try {
          if (linkedinFrame.value) linkedinFrame.value.contentWindow.history.back();
        } catch(e) {}
      }

      function goForward() {
        try {
          if (linkedinFrame.value) linkedinFrame.value.contentWindow.history.forward();
        } catch(e) {}
      }

      function refresh() {
        const src = iframeSrc.value;
        iframeSrc.value = '';
        setTimeout(() => { iframeSrc.value = src; }, 50);
      }

      function openExternal() {
        window.open(getRealUrl(), '_blank');
      }

      function onIframeMessage(e) {
        if (e.data && e.data.type === 'browser-navigate' && e.data.url) {
          const url = e.data.url;
          if (url.includes('linkedin.com')) {
            iframeSrc.value = proxyUrl(url);
          } else {
            window.dispatchEvent(new CustomEvent('open-app-action', { detail: { app: 'browser' } }));
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('browser-open-url', { detail: url }));
            }, 300);
          }
        }
      }

      function onLocaleChanged(e) {
        if (e.detail && e.detail.locale) {
          locale.value = e.detail.locale;
        }
      }

      onMounted(() => {
        window.addEventListener('locale-changed', onLocaleChanged);
        window.addEventListener('message', onIframeMessage);
      });

      onBeforeUnmount(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
        window.removeEventListener('message', onIframeMessage);
      });

      return {
        t,
        iframeSrc,
        linkedinFrame,
        shortcuts,
        navigateHome,
        navigateTo,
        goBack,
        goForward,
        refresh,
        openExternal
      };
    }
  };
})(Vue);
