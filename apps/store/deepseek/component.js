(function(Vue) {
  const { ref, computed, onMounted, onBeforeUnmount } = Vue;

  const LANGS = {
    tr: {
      home: 'Ana Sayfa', back: 'Geri', forward: 'İleri',
      refresh: 'Yenile', openTab: 'Yeni Sekmede Aç',
      blocked: 'DeepSeek bu tarayıcıda iframe içinde yüklenemiyor.',
      openNew: 'DeepSeek\'i Yeni Sekmede Aç',
      loading: 'DeepSeek yükleniyor...'
    },
    en: {
      home: 'Home', back: 'Back', forward: 'Forward',
      refresh: 'Refresh', openTab: 'Open in New Tab',
      blocked: 'DeepSeek cannot be loaded in an iframe in this browser.',
      openNew: 'Open DeepSeek in New Tab',
      loading: 'Loading DeepSeek...'
    },
    de: {
      home: 'Startseite', back: 'Zurück', forward: 'Vorwärts',
      refresh: 'Aktualisieren', openTab: 'In neuem Tab öffnen',
      blocked: 'DeepSeek kann in diesem Browser nicht im iframe geladen werden.',
      openNew: 'DeepSeek in neuem Tab öffnen',
      loading: 'DeepSeek wird geladen...'
    },
    fr: {
      home: 'Accueil', back: 'Retour', forward: 'Suivant',
      refresh: 'Actualiser', openTab: 'Ouvrir dans un nouvel onglet',
      blocked: 'DeepSeek ne peut pas être chargé dans un iframe.',
      openNew: 'Ouvrir DeepSeek dans un nouvel onglet',
      loading: 'Chargement de DeepSeek...'
    },
    es: {
      home: 'Inicio', back: 'Atrás', forward: 'Adelante',
      refresh: 'Actualizar', openTab: 'Abrir en nueva pestaña',
      blocked: 'DeepSeek no se puede cargar en un iframe.',
      openNew: 'Abrir DeepSeek en nueva pestaña',
      loading: 'Cargando DeepSeek...'
    },
    ru: {
      home: 'Главная', back: 'Назад', forward: 'Вперёд',
      refresh: 'Обновить', openTab: 'Открыть в новой вкладке',
      blocked: 'DeepSeek не может быть загружен в iframe.',
      openNew: 'Открыть DeepSeek в новой вкладке',
      loading: 'Загрузка DeepSeek...'
    },
    zh: {
      home: '首页', back: '后退', forward: '前进',
      refresh: '刷新', openTab: '新标签页打开',
      blocked: 'DeepSeek无法在iframe中加载。',
      openNew: '在新标签页中打开DeepSeek',
      loading: '正在加载DeepSeek...'
    },
    ja: {
      home: 'ホーム', back: '戻る', forward: '進む',
      refresh: '更新', openTab: '新しいタブで開く',
      blocked: 'DeepSeekはiframe内で読み込めません。',
      openNew: 'DeepSeekを新しいタブで開く',
      loading: 'DeepSeekを読み込み中...'
    }
  };

  return {
    setup() {
      const locale = ref(localStorage.getItem('sys_locale') || 'tr');
      const t = computed(() => LANGS[locale.value] || LANGS.tr);
      const deepseekFrame = ref(null);
      const loadFailed = ref(false);
      const isLoading = ref(true);

      const HOME_URL = 'https://chat.deepseek.com/';

      function proxyUrl(url) {
        return '/api/browser/proxy?url=' + encodeURIComponent(url);
      }

      const iframeSrc = ref(proxyUrl(HOME_URL));

      function navigateHome() {
        loadFailed.value = false;
        isLoading.value = true;
        iframeSrc.value = proxyUrl(HOME_URL);
      }

      function goBack() {
        try {
          if (deepseekFrame.value) deepseekFrame.value.contentWindow.history.back();
        } catch(e) {}
      }

      function goForward() {
        try {
          if (deepseekFrame.value) deepseekFrame.value.contentWindow.history.forward();
        } catch(e) {}
      }

      function refresh() {
        loadFailed.value = false;
        isLoading.value = true;
        const src = iframeSrc.value;
        iframeSrc.value = '';
        setTimeout(() => { iframeSrc.value = src; }, 50);
      }

      function openExternal() {
        window.open(HOME_URL, '_blank');
      }

      function onIframeLoad() {
        isLoading.value = false;
        try {
          if (deepseekFrame.value) {
            const doc = deepseekFrame.value.contentDocument || deepseekFrame.value.contentWindow.document;
            const text = doc && doc.body ? doc.body.innerText : '';
            if (text.includes('challenge') || text.includes('Max challenge') || text.includes('Just a moment')) {
              loadFailed.value = true;
            }
          }
        } catch(e) {
          // Cross-origin - can't check, assume OK
        }
      }

      function onIframeError() {
        isLoading.value = false;
        loadFailed.value = true;
      }

      function onLocaleChange() {
        locale.value = localStorage.getItem('sys_locale') || 'tr';
      }

      onMounted(() => {
        window.addEventListener('locale-changed', onLocaleChange);
      });

      onBeforeUnmount(() => {
        window.removeEventListener('locale-changed', onLocaleChange);
      });

      return {
        t,
        iframeSrc,
        deepseekFrame,
        loadFailed,
        isLoading,
        navigateHome,
        goBack,
        goForward,
        refresh,
        openExternal,
        onIframeLoad,
        onIframeError
      };
    }
  };
})(Vue);
