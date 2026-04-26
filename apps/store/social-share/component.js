(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, watch } = Vue;

  const LANGS = {
    tr: {
      title:'Sosyal Paylaşım', compose:'Oluştur', history:'Geçmiş',
      contentType:'İçerik Türü', text:'Metin', link:'Bağlantı', image:'Görsel',
      message:'Mesaj', messagePlaceholder:'Paylaşmak istediğiniz mesajı yazın...',
      url:'Bağlantı', urlPlaceholder:'https://ornek.com/sayfa',
      pickImage:'Dosyadan Seç', imageUrlPlaceholder:'Görsel URL\'si yapıştır...',
      hashtags:'Etiketler', addHashtag:'Etiket ekle...',
      platforms:'Platformlar', share:'Paylaş',
      noHistory:'Henüz paylaşım yok',
      delete:'Sil', reshare:'Tekrar Paylaş',
      shared:'Paylaşıldı!', selectPlatform:'En az bir platform seçin',
      enterMessage:'Bir mesaj girin', incomingContent:'Başka uygulamadan içerik alındı',
      copiedClipboard:'Panoya kopyalandı'
    },
    en: {
      title:'Social Share', compose:'Compose', history:'History',
      contentType:'Content Type', text:'Text', link:'Link', image:'Image',
      message:'Message', messagePlaceholder:'Write the message you want to share...',
      url:'Link', urlPlaceholder:'https://example.com/page',
      pickImage:'Pick from Files', imageUrlPlaceholder:'Paste image URL...',
      hashtags:'Hashtags', addHashtag:'Add hashtag...',
      platforms:'Platforms', share:'Share',
      noHistory:'No shares yet',
      delete:'Delete', reshare:'Reshare',
      shared:'Shared!', selectPlatform:'Select at least one platform',
      enterMessage:'Enter a message', incomingContent:'Content received from another app',
      copiedClipboard:'Copied to clipboard'
    },
    de: {
      title:'Soziales Teilen', compose:'Erstellen', history:'Verlauf',
      contentType:'Inhaltstyp', text:'Text', link:'Link', image:'Bild',
      message:'Nachricht', messagePlaceholder:'Schreiben Sie die Nachricht, die Sie teilen möchten...',
      url:'Link', urlPlaceholder:'https://beispiel.de/seite',
      pickImage:'Aus Dateien wählen', imageUrlPlaceholder:'Bild-URL einfügen...',
      hashtags:'Hashtags', addHashtag:'Hashtag hinzufügen...',
      platforms:'Plattformen', share:'Teilen',
      noHistory:'Noch nichts geteilt',
      delete:'Löschen', reshare:'Erneut teilen',
      shared:'Geteilt!', selectPlatform:'Wählen Sie mindestens eine Plattform',
      enterMessage:'Nachricht eingeben', incomingContent:'Inhalt von einer anderen App empfangen',
      copiedClipboard:'In die Zwischenablage kopiert'
    },
    fr: {
      title:'Partage Social', compose:'Composer', history:'Historique',
      contentType:'Type de contenu', text:'Texte', link:'Lien', image:'Image',
      message:'Message', messagePlaceholder:'Écrivez le message que vous souhaitez partager...',
      url:'Lien', urlPlaceholder:'https://exemple.fr/page',
      pickImage:'Choisir un fichier', imageUrlPlaceholder:'Coller l\'URL de l\'image...',
      hashtags:'Hashtags', addHashtag:'Ajouter un hashtag...',
      platforms:'Plateformes', share:'Partager',
      noHistory:'Aucun partage pour le moment',
      delete:'Supprimer', reshare:'Repartager',
      shared:'Partagé !', selectPlatform:'Sélectionnez au moins une plateforme',
      enterMessage:'Entrez un message', incomingContent:'Contenu reçu d\'une autre application',
      copiedClipboard:'Copié dans le presse-papiers'
    },
    es: {
      title:'Compartir Social', compose:'Componer', history:'Historial',
      contentType:'Tipo de contenido', text:'Texto', link:'Enlace', image:'Imagen',
      message:'Mensaje', messagePlaceholder:'Escriba el mensaje que desea compartir...',
      url:'Enlace', urlPlaceholder:'https://ejemplo.com/pagina',
      pickImage:'Elegir archivo', imageUrlPlaceholder:'Pegar URL de imagen...',
      hashtags:'Hashtags', addHashtag:'Añadir hashtag...',
      platforms:'Plataformas', share:'Compartir',
      noHistory:'Sin compartidos aún',
      delete:'Eliminar', reshare:'Recompartir',
      shared:'¡Compartido!', selectPlatform:'Seleccione al menos una plataforma',
      enterMessage:'Ingrese un mensaje', incomingContent:'Contenido recibido de otra aplicación',
      copiedClipboard:'Copiado al portapapeles'
    },
    ru: {
      title:'Соцсети', compose:'Создать', history:'История',
      contentType:'Тип контента', text:'Текст', link:'Ссылка', image:'Изображение',
      message:'Сообщение', messagePlaceholder:'Напишите сообщение для публикации...',
      url:'Ссылка', urlPlaceholder:'https://пример.com/страница',
      pickImage:'Выбрать файл', imageUrlPlaceholder:'Вставьте URL изображения...',
      hashtags:'Хэштеги', addHashtag:'Добавить хэштег...',
      platforms:'Платформы', share:'Поделиться',
      noHistory:'Пока нет публикаций',
      delete:'Удалить', reshare:'Поделиться снова',
      shared:'Опубликовано!', selectPlatform:'Выберите хотя бы одну платформу',
      enterMessage:'Введите сообщение', incomingContent:'Контент получен из другого приложения',
      copiedClipboard:'Скопировано в буфер обмена'
    },
    zh: { title:'社交分享', compose:'编写', history:'历史', contentType:'内容类型', text:'文本', link:'链接', image:'图片', message:'消息', messagePlaceholder:'输入消息...', url:'链接', urlPlaceholder:'输入链接...', https:'https://', pickImage:'选择图片', imageUrlPlaceholder:'输入图片链接...', hashtags:'话题标签', addHashtag:'添加标签', platforms:'平台', share:'分享', noHistory:'没有历史', delete:'删除', reshare:'重新分享', shared:'已分享', selectPlatform:'选择平台', enterMessage:'输入消息', incomingContent:'收到的内容', copiedClipboard:'已复制到剪贴板' },
    ja: { title:'ソーシャル共有', compose:'作成', history:'履歴', contentType:'コンテンツタイプ', text:'テキスト', link:'リンク', image:'画像', message:'メッセージ', messagePlaceholder:'メッセージを入力...', url:'URL', urlPlaceholder:'URLを入力...', https:'https://', pickImage:'画像を選択', imageUrlPlaceholder:'画像URLを入力...', hashtags:'ハッシュタグ', addHashtag:'タグ追加', platforms:'プラットフォーム', share:'共有', noHistory:'履歴なし', delete:'削除', reshare:'再共有', shared:'共有済', selectPlatform:'プラットフォーム選択', enterMessage:'メッセージ入力', incomingContent:'受信コンテンツ', copiedClipboard:'クリップボードにコピー済' },
    it: { title:'Condivisione Social', compose:'Componi', history:'Cronologia', contentType:'Tipo contenuto', text:'Testo', link:'Link', image:'Immagine', message:'Messaggio', messagePlaceholder:'Inserisci messaggio...', url:'URL', urlPlaceholder:'Inserisci URL...', https:'https://', pickImage:'Scegli immagine', imageUrlPlaceholder:'Inserisci URL immagine...', hashtags:'Hashtag', addHashtag:'Aggiungi hashtag', platforms:'Piattaforme', share:'Condividi', noHistory:'Nessuna cronologia', delete:'Elimina', reshare:'Ricondividi', shared:'Condiviso', selectPlatform:'Seleziona piattaforma', enterMessage:'Inserisci messaggio', incomingContent:'Contenuto in arrivo', copiedClipboard:'Copiato negli appunti' }
  };

  function getLocale() {
    try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; }
  }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      // State
      const tab = ref('compose');
      const contentType = ref('text');
      const message = ref('');
      const linkUrl = ref('');
      const imageUrl = ref('');
      const imagePreview = ref('');
      const imageFile = ref(null);
      const hashtags = ref([]);
      const newTag = ref('');
      const selectedPlatforms = ref([]);
      const history = ref([]);
      const hasIncoming = ref(false);
      const toast = ref(null);
      let toastTimer = null;

      // Platforms
      const platforms = [
        { id: 'twitter',   name: 'Twitter / X', icon: '🐦', color: '#1da1f2' },
        { id: 'facebook',  name: 'Facebook',    icon: '📘', color: '#1877f2' },
        { id: 'whatsapp',  name: 'WhatsApp',    icon: '💬', color: '#25d366' },
        { id: 'telegram',  name: 'Telegram',    icon: '✈️', color: '#0088cc' },
        { id: 'linkedin',  name: 'LinkedIn',    icon: '💼', color: '#0a66c2' },
        { id: 'reddit',    name: 'Reddit',      icon: '🔶', color: '#ff4500' },
        { id: 'pinterest', name: 'Pinterest',   icon: '📌', color: '#e60023' },
        { id: 'email',     name: 'E-Mail',      icon: '📧', color: '#666' },
        { id: 'clipboard', name: 'Clipboard',   icon: '📋', color: '#555' }
      ];

      function getPlatform(id) {
        return platforms.find(p => p.id === id) || { icon: '?', color: '#555', name: id };
      }

      function togglePlatform(id) {
        const idx = selectedPlatforms.value.indexOf(id);
        if (idx >= 0) selectedPlatforms.value.splice(idx, 1);
        else selectedPlatforms.value.push(id);
      }

      const canShare = computed(() => {
        return message.value.trim().length > 0 && selectedPlatforms.value.length > 0;
      });

      // ── Hashtag ──
      function addHashtag() {
        const raw = newTag.value.replace(/[#,\s]/g, '').trim();
        if (raw && !hashtags.value.includes(raw)) {
          hashtags.value.push(raw);
        }
        newTag.value = '';
      }

      // ── Image picking ──
      function pickImage() {
        const inp = document.createElement('input');
        inp.type = 'file';
        inp.accept = 'image/*';
        inp.onchange = () => {
          const file = inp.files[0];
          if (!file) return;
          imageFile.value = file;
          const reader = new FileReader();
          reader.onload = e => { imagePreview.value = e.target.result; };
          reader.readAsDataURL(file);
        };
        inp.click();
      }

      function clearImage() {
        imagePreview.value = '';
        imageUrl.value = '';
        imageFile.value = null;
      }

      watch(imageUrl, val => {
        if (val && val.match(/^https?:\/\/.+/i)) {
          imagePreview.value = val;
          imageFile.value = null;
        }
      });

      // ── Open URL in built-in browser app ──
      function openInBrowser(url) {
        window.dispatchEvent(new CustomEvent('open-app-action', { detail: { app: 'browser' } }));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('browser-open-url', { detail: url }));
        }, 300);
      }

      // ── Build share text ──
      function buildShareText() {
        let text = message.value.trim();
        if (hashtags.value.length) {
          text += '\n\n' + hashtags.value.map(t => '#' + t).join(' ');
        }
        if (contentType.value === 'link' && linkUrl.value.trim()) {
          text += '\n\n' + linkUrl.value.trim();
        }
        return text;
      }

      function getShareUrl(platformId) {
        const text = encodeURIComponent(buildShareText());
        const url = encodeURIComponent(linkUrl.value.trim() || '');
        const imgUrl = encodeURIComponent(imagePreview.value || '');

        switch (platformId) {
          case 'twitter':
            return 'https://twitter.com/intent/tweet?text=' + text;
          case 'facebook':
            return 'https://www.facebook.com/sharer/sharer.php?quote=' + text + (url ? '&u=' + url : '');
          case 'whatsapp':
            return 'https://api.whatsapp.com/send?text=' + text;
          case 'telegram':
            return 'https://t.me/share/url?url=' + (url || text) + '&text=' + text;
          case 'linkedin':
            return 'https://www.linkedin.com/sharing/share-offsite/?url=' + (url || 'https://') + '&summary=' + text;
          case 'reddit':
            return 'https://www.reddit.com/submit?title=' + text + (url ? '&url=' + url : '');
          case 'pinterest':
            return 'https://pinterest.com/pin/create/button/?description=' + text + (imgUrl ? '&media=' + imgUrl : '') + (url ? '&url=' + url : '');
          case 'email':
            return 'mailto:?subject=' + encodeURIComponent(message.value.slice(0, 60)) + '&body=' + text;
          default:
            return null;
        }
      }

      // ── Share ──
      function shareContent() {
        if (!canShare.value) return;

        const shareData = {
          message: message.value.trim(),
          link: contentType.value === 'link' ? linkUrl.value.trim() : '',
          image: contentType.value === 'image' ? (imagePreview.value || '') : '',
          hashtags: [...hashtags.value],
          platforms: [...selectedPlatforms.value],
          date: new Date().toISOString()
        };

        // Open share URLs for each selected platform
        selectedPlatforms.value.forEach(pid => {
          if (pid === 'clipboard') {
            const text = buildShareText();
            navigator.clipboard.writeText(text).catch(() => {});
            showToast(L('copiedClipboard'), 'success');
            return;
          }
          if (pid === 'email') {
            // Open mail-app with compose data
            const subject = message.value.slice(0, 60);
            const body = buildShareText();
            window.__mailComposeData = { subject, text: body };
            window.dispatchEvent(new CustomEvent('open-app-action', { detail: { app: 'mail-app' } }));
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('mail-compose', { detail: { subject, text: body } }));
            }, 300);
            return;
          }
          const shareUrl = getShareUrl(pid);
          if (shareUrl) {
            openInBrowser(shareUrl);
          }
        });

        // Save to history
        history.value.unshift(shareData);
        if (history.value.length > 50) history.value.length = 50;
        saveHistory();

        showToast(L('shared'), 'success');

        // Reset form
        message.value = '';
        linkUrl.value = '';
        clearImage();
        hashtags.value = [];
        selectedPlatforms.value = [];
        hasIncoming.value = false;
      }

      // ── Reshare ──
      function reshare(item) {
        tab.value = 'compose';
        message.value = item.message || '';
        linkUrl.value = item.link || '';
        hashtags.value = item.hashtags ? [...item.hashtags] : [];
        if (item.link) contentType.value = 'link';
        else if (item.image) { contentType.value = 'image'; imagePreview.value = item.image; }
        else contentType.value = 'text';
      }

      function deleteHistory(index) {
        history.value.splice(index, 1);
        saveHistory();
      }

      // ── Persistence ──
      async function loadHistory() {
        try {
          const res = await fetch('/api/fs/read?path=' + encodeURIComponent('social-share/history.json'));
          if (res.ok) {
            const data = await res.json();
            history.value = JSON.parse(data.content || '[]');
          }
        } catch {}
      }

      async function saveHistory() {
        try {
          await fetch('/api/fs/mkdir', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dirPath: 'social-share' }) });
          await fetch('/api/fs/write', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filePath: 'social-share/history.json', content: JSON.stringify(history.value) }) });
        } catch {}
      }

      // ── Toast ──
      function showToast(text, type) {
        if (toastTimer) clearTimeout(toastTimer);
        toast.value = { text, type };
        toastTimer = setTimeout(() => { toast.value = null; }, 2500);
      }

      // ── Incoming content from other apps ──
      function onShareIncoming(e) {
        const data = e.detail || {};
        tab.value = 'compose';
        if (data.text) message.value = data.text;
        if (data.url) { linkUrl.value = data.url; contentType.value = 'link'; }
        if (data.image) { imagePreview.value = data.image; contentType.value = 'image'; }
        if (data.hashtags) hashtags.value = Array.isArray(data.hashtags) ? data.hashtags : [data.hashtags];
        hasIncoming.value = true;
      }

      // Check for pending share data set before app was opened
      function checkPendingShare() {
        if (window.__socialShareData) {
          const data = window.__socialShareData;
          delete window.__socialShareData;
          if (data.text) message.value = data.text;
          if (data.url) { linkUrl.value = data.url; contentType.value = 'link'; }
          if (data.image) { imagePreview.value = data.image; contentType.value = 'image'; }
          if (data.hashtags) hashtags.value = Array.isArray(data.hashtags) ? data.hashtags : [data.hashtags];
          hasIncoming.value = true;
        }
      }

      function formatDate(iso) {
        try {
          const d = new Date(iso);
          const pad = n => String(n).padStart(2, '0');
          return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
        } catch { return iso; }
      }

      function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

      onMounted(() => {
        loadHistory();
        checkPendingShare();
        window.addEventListener('social-share-content', onShareIncoming);
        window.addEventListener('locale-changed', onLocaleChanged);
      });

      onUnmounted(() => {
        window.removeEventListener('social-share-content', onShareIncoming);
        if (toastTimer) clearTimeout(toastTimer);
        window.removeEventListener('locale-changed', onLocaleChanged));

      return {
        L, tab, contentType, message, linkUrl, imageUrl, imagePreview,
        hashtags, newTag, selectedPlatforms, history, hasIncoming, toast,
        platforms, canShare,
        getPlatform, togglePlatform, addHashtag, pickImage, clearImage,
        shareContent, reshare, deleteHistory, formatDate, showToast
      };
    }
  };
})(Vue);
