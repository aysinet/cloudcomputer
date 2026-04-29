(function(Vue) {
  const { ref, onMounted } = Vue;

  const LANGS = {
    tr: { opened: 'Calendly yeni sekmede açıldı.', open: 'Tekrar Aç', info: 'Yeni sekmeniz açılmadıysa, lütfen pop-up engelleyiciyi devre dışı bırakın.' },
    en: { opened: 'Calendly opened in a new tab.', open: 'Open Again', info: 'If a new tab did not open, please disable your pop-up blocker.' },
    de: { opened: 'Calendly in neuem Tab geöffnet.', open: 'Erneut öffnen', info: 'Falls kein neuer Tab geöffnet wurde, deaktivieren Sie den Pop-up-Blocker.' },
    fr: { opened: 'Calendly ouvert dans un nouvel onglet.', open: 'Rouvrir', info: 'Si un nouvel onglet ne s\'est pas ouvert, désactivez le bloqueur de pop-ups.' },
    es: { opened: 'Calendly abierto en una nueva pestaña.', open: 'Abrir de nuevo', info: 'Si no se abrió una nueva pestaña, desactive el bloqueador de ventanas emergentes.' },
    ru: { opened: 'Calendly открыт в новой вкладке.', open: 'Открыть снова', info: 'Если новая вкладка не открылась, отключите блокировщик всплывающих окон.' },
    zh: { opened: 'Calendly已在新标签页中打开。', open: '重新打开', info: '如果新标签页未打开，请禁用弹出窗口拦截器。' },
    ja: { opened: 'Calendlyが新しいタブで開きました。', open: '再度開く', info: '新しいタブが開かない場合は、ポップアップブロッカーを無効にしてください。' },
    it: { opened: 'Calendly aperto in una nuova scheda.', open: 'Apri di nuovo', info: 'Se non si è aperta una nuova scheda, disabilita il blocco popup.' }
  };

  const URL = 'https://calendly.com/';

  return {
    setup(props) {
      const lang = (props.settings && props.settings.lang) || 'en';
      const L = LANGS[lang] || LANGS.en;
      const t = (k) => L[k] || k;

      function openCalendly() {
        window.open(URL, '_blank', 'noopener,noreferrer');
      }

      onMounted(() => { openCalendly(); });

      return { t, openCalendly };
    }
  };
})(Vue);
