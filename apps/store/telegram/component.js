(function(Vue) {
  const { ref, computed, onMounted, onBeforeUnmount } = Vue;

  const TELEGRAM_URL = 'https://web.telegram.org/a/';

  const LANGS = {
    tr: {
      title:'Telegram',
      loading:'Telegram Web yükleniyor...',
      reload:'Yenile',
      openExternal:'Yeni Sekmede Aç',
      info:'Telegram Web uygulaması pencere içinde çalışmaktadır.',
      loadError:'Telegram Web yüklenemedi. Yeni sekmede açmayı deneyin.'
    },
    en: {
      title:'Telegram',
      loading:'Loading Telegram Web...',
      reload:'Reload',
      openExternal:'Open in New Tab',
      info:'Telegram Web is running inside the window.',
      loadError:'Could not load Telegram Web. Try opening in a new tab.'
    },
    de: {
      title:'Telegram',
      loading:'Telegram Web wird geladen...',
      reload:'Neu laden',
      openExternal:'In neuem Tab öffnen',
      info:'Telegram Web läuft im Fenster.',
      loadError:'Telegram Web konnte nicht geladen werden. Versuchen Sie, es in einem neuen Tab zu öffnen.'
    },
    fr: {
      title:'Telegram',
      loading:'Chargement de Telegram Web...',
      reload:'Recharger',
      openExternal:'Ouvrir dans un nouvel onglet',
      info:'Telegram Web fonctionne dans la fenêtre.',
      loadError:'Impossible de charger Telegram Web. Essayez d\'ouvrir dans un nouvel onglet.'
    },
    es: {
      title:'Telegram',
      loading:'Cargando Telegram Web...',
      reload:'Recargar',
      openExternal:'Abrir en nueva pestaña',
      info:'Telegram Web se ejecuta dentro de la ventana.',
      loadError:'No se pudo cargar Telegram Web. Intente abrir en una nueva pestaña.'
    },
    ru: {
      title:'Telegram',
      loading:'Загрузка Telegram Web...',
      reload:'Перезагрузить',
      openExternal:'Открыть в новой вкладке',
      info:'Telegram Web работает внутри окна.',
      loadError:'Не удалось загрузить Telegram Web. Попробуйте открыть в новой вкладке.'
    },
    zh: {
      title:'Telegram',
      loading:'正在加载Telegram Web...',
      reload:'重新加载',
      openExternal:'在新标签页中打开',
      info:'Telegram Web正在窗口内运行。',
      loadError:'无法加载Telegram Web。请尝试在新标签页中打开。'
    },
    ja: {
      title:'Telegram',
      loading:'Telegram Webを読み込み中...',
      reload:'再読み込み',
      openExternal:'新しいタブで開く',
      info:'Telegram Webはウィンドウ内で動作しています。',
      loadError:'Telegram Webを読み込めませんでした。新しいタブで開いてみてください。'
    },
    it: {
      title:'Telegram',
      loading:'Caricamento Telegram Web...',
      reload:'Ricarica',
      openExternal:'Apri in nuova scheda',
      info:'Telegram Web è in esecuzione nella finestra.',
      loadError:'Impossibile caricare Telegram Web. Prova ad aprire in una nuova scheda.'
    },
    ar: {
      title:'تيليجرام',
      loading:'Loading Telegram Web...',
      reload:'Reload',
      openExternal:'فتح في نافذة جديدة',
      info:'معلومات',
      loadError:'فشل تحميل النموذج'
    },
    ko: {
      title:'텔레그램',
      loading:'Loading Telegram Web...',
      reload:'Reload',
      openExternal:'새 창에서 열기',
      info:'정보',
      loadError:'모델 로드 실패'
    },
    hi: {
      title:'टेलीग्राम',
      loading:'Loading Telegram Web...',
      reload:'Reload',
      openExternal:'नई विंडो में खोलें',
      info:'जानकारी',
      loadError:'मॉडल लोड करने में विफल'
    },
    pt: {
      title:'Telegram',
      loading:'Loading Telegram Web...',
      reload:'Reload',
      openExternal:'Abrir em nova janela',
      info:'Info',
      loadError:'Falha ao carregar modelo'
    }
  };

  return {
    setup() {
      var locale = ref(localStorage.getItem('sys_locale') || 'en');
      var t = computed(function() { return LANGS[locale.value] || LANGS.en; });

      var loading = ref(true);
      var loadFailed = ref(false);
      var iframeSrc = ref(TELEGRAM_URL);

      function onIframeLoad() {
        loading.value = false;
      }

      function onIframeError() {
        loading.value = false;
        loadFailed.value = true;
      }

      function reloadIframe() {
        loading.value = true;
        loadFailed.value = false;
        iframeSrc.value = '';
        setTimeout(function() {
          iframeSrc.value = TELEGRAM_URL;
        }, 100);
      }

      function openExternal() {
        window.open(TELEGRAM_URL, '_blank');
      }

      function onLocaleChanged(e) {
        if (e.detail && e.detail.locale) {
          locale.value = e.detail.locale;
        }
      }

      onMounted(function() {
        window.addEventListener('locale-changed', onLocaleChanged);
      });

      onBeforeUnmount(function() {
        window.removeEventListener('locale-changed', onLocaleChanged);
      });

      return {
        t, loading, loadFailed, iframeSrc,
        onIframeLoad, onIframeError, reloadIframe, openExternal
      };
    }
  };
})(Vue);
