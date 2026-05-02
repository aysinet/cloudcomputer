(function(Vue) {
  const { ref, computed, onMounted, onUnmounted, nextTick, watch } = Vue;
  const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success: console.log, error: console.error, warning: console.warn };

  const LANGS = {
    tr: { search:'Ara…', newPage:'Yeni Sayfa', pinned:'Sabitlenmiş', pages:'Sayfalar', tags:'Etiketler', recent:'Son Düzenlenen', links:'Bağlantı', recentlyEdited:'Son Düzenlenen Sayfalar', untitled:'Başlıksız', edit:'Düzenle', save:'Kaydet', cancel:'İptal', delete:'Sil', pin:'Sabitle', unpin:'Kaldır', info:'Bilgi', settings:'Ayarlar', back:'Geri', expand:'Genişlet', collapse:'Daralt', created:'Oluşturulma', updated:'Güncellenme', parent:'Üst Sayfa', none:'Yok', addTag:'Etiket ekle…', backlinks:'Geri Bağlantılar', subPages:'Alt Sayfalar', pageTitle:'Sayfa başlığı', writeContent:'İçeriğinizi Markdown ile yazın…\n\n# Başlık\n## Alt Başlık\n**kalın** ve *italik*\n\n- Liste öğesi\n- [[Wiki Bağlantısı]]\n\n> Alıntı', preview:'Önizleme', insertLink:'Link Ekle', insertWikiLink:'Wiki Bağlantısı Ekle', insertImage:'Resim Ekle', wikiSettings:'Wiki Ayarları', wikiTitle:'Wiki Başlığı', wikiDesc:'Wiki Açıklaması', customCSS:'Özel CSS', cssPlaceholder:'Kendi CSS kurallarınızı yazın…', saveSettings:'Ayarları Kaydet', close:'Kapat', defaultDesc:'Kişisel wiki alanınız — bilgi oluşturun, bağlayın ve keşfedin.', confirmDelete:'Bu sayfayı silmek istediğinize emin misiniz?', saved:'Kaydedildi', deleted:'Sayfa silindi', selectPage:'Sayfa seçin…', linkUrl:'URL:', linkText:'Metin:', imageUrl:'Resim URL:', enterTitle:'Başlık girin' },
    en: { search:'Search…', newPage:'New Page', pinned:'Pinned', pages:'Pages', tags:'Tags', recent:'Recent', links:'Links', recentlyEdited:'Recently Edited', untitled:'Untitled', edit:'Edit', save:'Save', cancel:'Cancel', delete:'Delete', pin:'Pin', unpin:'Unpin', info:'Info', settings:'Settings', back:'Back', expand:'Expand', collapse:'Collapse', created:'Created', updated:'Updated', parent:'Parent Page', none:'None', addTag:'Add tag…', backlinks:'Backlinks', subPages:'Sub Pages', pageTitle:'Page title', writeContent:'Write your content with Markdown…\n\n# Heading\n## Sub Heading\n**bold** and *italic*\n\n- List item\n- [[Wiki Link]]\n\n> Blockquote', preview:'Preview', insertLink:'Insert Link', insertWikiLink:'Insert Wiki Link', insertImage:'Insert Image', wikiSettings:'Wiki Settings', wikiTitle:'Wiki Title', wikiDesc:'Wiki Description', customCSS:'Custom CSS', cssPlaceholder:'Write your own CSS rules…', saveSettings:'Save Settings', close:'Close', defaultDesc:'Your personal wiki space — create, link and explore knowledge.', confirmDelete:'Are you sure you want to delete this page?', saved:'Saved', deleted:'Page deleted', selectPage:'Select page…', linkUrl:'URL:', linkText:'Text:', imageUrl:'Image URL:', enterTitle:'Enter title' },
    de: { search:'Suche…', newPage:'Neue Seite', pinned:'Angeheftet', pages:'Seiten', tags:'Tags', recent:'Zuletzt', links:'Links', recentlyEdited:'Zuletzt bearbeitet', untitled:'Ohne Titel', edit:'Bearbeiten', save:'Speichern', cancel:'Abbrechen', delete:'Löschen', pin:'Anheften', unpin:'Lösen', info:'Info', settings:'Einstellungen', back:'Zurück', expand:'Erweitern', collapse:'Reduzieren', created:'Erstellt', updated:'Aktualisiert', parent:'Überseite', none:'Keine', addTag:'Tag hinzufügen…', backlinks:'Rückverweise', subPages:'Unterseiten', pageTitle:'Seitentitel', writeContent:'Schreiben Sie Ihren Inhalt mit Markdown…', preview:'Vorschau', insertLink:'Link einfügen', insertWikiLink:'Wiki-Link einfügen', insertImage:'Bild einfügen', wikiSettings:'Wiki-Einstellungen', wikiTitle:'Wiki-Titel', wikiDesc:'Wiki-Beschreibung', customCSS:'Eigenes CSS', cssPlaceholder:'Ihre CSS-Regeln…', saveSettings:'Einstellungen speichern', close:'Schließen', defaultDesc:'Erstellen, verknüpfen und entdecken.', confirmDelete:'Diese Seite wirklich löschen?', saved:'Gespeichert', deleted:'Seite gelöscht', selectPage:'Seite wählen…', linkUrl:'URL:', linkText:'Text:', imageUrl:'Bild-URL:', enterTitle:'Titel eingeben' },
    fr: { search:'Rechercher…', newPage:'Nouvelle page', pinned:'Épinglé', pages:'Pages', tags:'Tags', recent:'Récent', links:'Liens', recentlyEdited:'Récemment modifié', untitled:'Sans titre', edit:'Modifier', save:'Enregistrer', cancel:'Annuler', delete:'Supprimer', pin:'Épingler', unpin:'Détacher', info:'Info', settings:'Paramètres', back:'Retour', expand:'Développer', collapse:'Réduire', created:'Créé', updated:'Mis à jour', parent:'Page parent', none:'Aucun', addTag:'Ajouter un tag…', backlinks:'Liens retour', subPages:'Sous-pages', pageTitle:'Titre de la page', writeContent:'Écrivez en Markdown…', preview:'Aperçu', insertLink:'Insérer un lien', insertWikiLink:'Insérer lien wiki', insertImage:'Insérer image', wikiSettings:'Paramètres wiki', wikiTitle:'Titre wiki', wikiDesc:'Description wiki', customCSS:'CSS personnalisé', cssPlaceholder:'Vos règles CSS…', saveSettings:'Enregistrer', close:'Fermer', defaultDesc:'Votre espace wiki personnel.', confirmDelete:'Voulez-vous vraiment supprimer?', saved:'Enregistré', deleted:'Page supprimée', selectPage:'Sélectionner…', linkUrl:'URL:', linkText:'Texte:', imageUrl:'URL image:', enterTitle:'Entrez le titre' },
    es: { search:'Buscar…', newPage:'Nueva página', pinned:'Fijados', pages:'Páginas', tags:'Etiquetas', recent:'Reciente', links:'Enlaces', recentlyEdited:'Editado recientemente', untitled:'Sin título', edit:'Editar', save:'Guardar', cancel:'Cancelar', delete:'Eliminar', pin:'Fijar', unpin:'Desfijar', info:'Info', settings:'Ajustes', back:'Atrás', expand:'Expandir', collapse:'Contraer', created:'Creado', updated:'Actualizado', parent:'Página padre', none:'Ninguno', addTag:'Añadir etiqueta…', backlinks:'Backlinks', subPages:'Subpáginas', pageTitle:'Título', writeContent:'Escribe con Markdown…', preview:'Vista previa', insertLink:'Insertar enlace', insertWikiLink:'Insertar enlace wiki', insertImage:'Insertar imagen', wikiSettings:'Ajustes wiki', wikiTitle:'Título wiki', wikiDesc:'Descripción', customCSS:'CSS personalizado', cssPlaceholder:'Tus reglas CSS…', saveSettings:'Guardar ajustes', close:'Cerrar', defaultDesc:'Tu espacio wiki personal.', confirmDelete:'¿Eliminar esta página?', saved:'Guardado', deleted:'Página eliminada', selectPage:'Seleccionar…', linkUrl:'URL:', linkText:'Texto:', imageUrl:'URL imagen:', enterTitle:'Ingrese título' },
    ru: { search:'Поиск…', newPage:'Новая страница', pinned:'Закреплённые', pages:'Страницы', tags:'Теги', recent:'Недавние', links:'Ссылки', recentlyEdited:'Недавно изменённые', untitled:'Без названия', edit:'Редактировать', save:'Сохранить', cancel:'Отмена', delete:'Удалить', pin:'Закрепить', unpin:'Открепить', info:'Инфо', settings:'Настройки', back:'Назад', expand:'Развернуть', collapse:'Свернуть', created:'Создано', updated:'Обновлено', parent:'Родитель', none:'Нет', addTag:'Добавить тег…', backlinks:'Обратные ссылки', subPages:'Подстраницы', pageTitle:'Заголовок', writeContent:'Пишите на Markdown…', preview:'Просмотр', insertLink:'Вставить ссылку', insertWikiLink:'Вставить wiki-ссылку', insertImage:'Вставить изображение', wikiSettings:'Настройки вики', wikiTitle:'Название вики', wikiDesc:'Описание', customCSS:'Свой CSS', cssPlaceholder:'Ваши CSS правила…', saveSettings:'Сохранить настройки', close:'Закрыть', defaultDesc:'Ваше личное вики-пространство.', confirmDelete:'Удалить эту страницу?', saved:'Сохранено', deleted:'Страница удалена', selectPage:'Выбрать…', linkUrl:'URL:', linkText:'Текст:', imageUrl:'URL изображения:', enterTitle:'Введите заголовок' },
    zh: { search:'搜索…', newPage:'新页面', pinned:'已固定', pages:'页面', tags:'标签', recent:'最近', links:'链接', recentlyEdited:'最近编辑', untitled:'无标题', edit:'编辑', save:'保存', cancel:'取消', delete:'删除', pin:'固定', unpin:'取消固定', info:'信息', settings:'设置', back:'返回', expand:'展开', collapse:'折叠', created:'创建', updated:'更新', parent:'父页面', none:'无', addTag:'添加标签…', backlinks:'反向链接', subPages:'子页面', pageTitle:'页面标题', writeContent:'用Markdown书写…', preview:'预览', insertLink:'插入链接', insertWikiLink:'插入Wiki链接', insertImage:'插入图片', wikiSettings:'Wiki设置', wikiTitle:'Wiki标题', wikiDesc:'描述', customCSS:'自定义CSS', cssPlaceholder:'您的CSS规则…', saveSettings:'保存设置', close:'关闭', defaultDesc:'您的个人维基空间。', confirmDelete:'确定删除此页面？', saved:'已保存', deleted:'页面已删除', selectPage:'选择页面…', linkUrl:'URL:', linkText:'文本:', imageUrl:'图片URL:', enterTitle:'请输入标题' },
    ja: { search:'検索…', newPage:'新規ページ', pinned:'ピン留め', pages:'ページ', tags:'タグ', recent:'最近', links:'リンク', recentlyEdited:'最近の編集', untitled:'無題', edit:'編集', save:'保存', cancel:'キャンセル', delete:'削除', pin:'ピン留め', unpin:'ピン解除', info:'情報', settings:'設定', back:'戻る', expand:'展開', collapse:'折りたたむ', created:'作成日', updated:'更新日', parent:'親ページ', none:'なし', addTag:'タグ追加…', backlinks:'バックリンク', subPages:'サブページ', pageTitle:'ページタイトル', writeContent:'Markdownで記述…', preview:'プレビュー', insertLink:'リンク挿入', insertWikiLink:'Wikiリンク挿入', insertImage:'画像挿入', wikiSettings:'Wiki設定', wikiTitle:'Wikiタイトル', wikiDesc:'説明', customCSS:'カスタムCSS', cssPlaceholder:'CSSルール…', saveSettings:'設定保存', close:'閉じる', defaultDesc:'パーソナルウィキスペース。', confirmDelete:'このページを削除しますか？', saved:'保存完了', deleted:'ページ削除', selectPage:'ページ選択…', linkUrl:'URL:', linkText:'テキスト:', imageUrl:'画像URL:', enterTitle:'タイトル入力' },
    it: { search:'Cerca…', newPage:'Nuova pagina', pinned:'Fissato', pages:'Pagine', tags:'Tag', recent:'Recenti', links:'Link', recentlyEdited:'Modificati di recente', untitled:'Senza titolo', edit:'Modifica', save:'Salva', cancel:'Annulla', delete:'Elimina', pin:'Fissa', unpin:'Sgancia', info:'Info', settings:'Impostazioni', back:'Indietro', expand:'Espandi', collapse:'Riduci', created:'Creato', updated:'Aggiornato', parent:'Pagina padre', none:'Nessuno', addTag:'Aggiungi tag…', backlinks:'Backlink', subPages:'Sotto-pagine', pageTitle:'Titolo pagina', writeContent:'Scrivi in Markdown…', preview:'Anteprima', insertLink:'Inserisci link', insertWikiLink:'Inserisci link wiki', insertImage:'Inserisci immagine', wikiSettings:'Impostazioni wiki', wikiTitle:'Titolo wiki', wikiDesc:'Descrizione', customCSS:'CSS personalizzato', cssPlaceholder:'Le tue regole CSS…', saveSettings:'Salva impostazioni', close:'Chiudi', defaultDesc:'Il tuo spazio wiki personale.', confirmDelete:'Eliminare questa pagina?', saved:'Salvato', deleted:'Pagina eliminata', selectPage:'Seleziona…', linkUrl:'URL:', linkText:'Testo:', imageUrl:'URL immagine:', enterTitle:'Inserisci titolo' },
    ar: { search:'بحث…', newPage:'صفحة جديدة', pinned:'مثبت', pages:'الصفحات', tags:'الوسوم', recent:'الأخيرة', links:'الروابط', recentlyEdited:'تم تعديلها مؤخرًا', untitled:'بدون عنوان', edit:'تعديل', save:'حفظ', cancel:'إلغاء', delete:'حذف', pin:'تثبيت', unpin:'إلغاء التثبيت', info:'معلومات', settings:'الإعدادات', back:'رجوع', expand:'توسيع', collapse:'طي', created:'تاريخ الإنشاء', updated:'تاريخ التحديث', parent:'الصفحة الأم', none:'لا شيء', addTag:'إضافة وسم…', backlinks:'روابط عكسية', subPages:'صفحات فرعية', pageTitle:'عنوان الصفحة', writeContent:'اكتب بـ Markdown…', preview:'معاينة', insertLink:'إدراج رابط', insertWikiLink:'إدراج رابط ويكي', insertImage:'إدراج صورة', wikiSettings:'إعدادات الويكي', wikiTitle:'عنوان الويكي', wikiDesc:'الوصف', customCSS:'CSS مخصص', cssPlaceholder:'قواعد CSS…', saveSettings:'حفظ الإعدادات', close:'إغلاق', defaultDesc:'مساحة الويكي الشخصية.', confirmDelete:'هل تريد حذف هذه الصفحة؟', saved:'تم الحفظ', deleted:'تم حذف الصفحة', selectPage:'اختر صفحة…', linkUrl:'الرابط:', linkText:'النص:', imageUrl:'رابط الصورة:', enterTitle:'أدخل العنوان' },
    ko: { search:'검색…', newPage:'새 페이지', pinned:'고정됨', pages:'페이지', tags:'태그', recent:'최근', links:'링크', recentlyEdited:'최근 편집', untitled:'제목 없음', edit:'편집', save:'저장', cancel:'취소', delete:'삭제', pin:'고정', unpin:'고정 해제', info:'정보', settings:'설정', back:'뒤로', expand:'펼치기', collapse:'접기', created:'생성일', updated:'수정일', parent:'상위 페이지', none:'없음', addTag:'태그 추가…', backlinks:'백링크', subPages:'하위 페이지', pageTitle:'페이지 제목', writeContent:'Markdown으로 작성…', preview:'미리보기', insertLink:'링크 삽입', insertWikiLink:'위키 링크 삽입', insertImage:'이미지 삽입', wikiSettings:'위키 설정', wikiTitle:'위키 제목', wikiDesc:'설명', customCSS:'사용자 CSS', cssPlaceholder:'CSS 규칙…', saveSettings:'설정 저장', close:'닫기', defaultDesc:'개인 위키 공간입니다.', confirmDelete:'이 페이지를 삭제하시겠습니까?', saved:'저장됨', deleted:'페이지 삭제됨', selectPage:'페이지 선택…', linkUrl:'URL:', linkText:'텍스트:', imageUrl:'이미지 URL:', enterTitle:'제목 입력' },
    hi: { search:'खोजें…', newPage:'नया पृष्ठ', pinned:'पिन किया गया', pages:'पृष्ठ', tags:'टैग', recent:'हाल का', links:'लिंक', recentlyEdited:'हाल ही में संपादित', untitled:'शीर्षकहीन', edit:'संपादित करें', save:'सहेजें', cancel:'रद्द करें', delete:'हटाएं', pin:'पिन करें', unpin:'अनपिन करें', info:'जानकारी', settings:'सेटिंग्स', back:'वापस', expand:'विस्तृत करें', collapse:'संकुचित करें', created:'बनाया गया', updated:'अद्यतन', parent:'मूल पृष्ठ', none:'कोई नहीं', addTag:'टैग जोड़ें…', backlinks:'बैकलिंक', subPages:'उप पृष्ठ', pageTitle:'पृष्ठ शीर्षक', writeContent:'Markdown में लिखें…', preview:'पूर्वावलोकन', insertLink:'लिंक जोड़ें', insertWikiLink:'विकी लिंक जोड़ें', insertImage:'छवि जोड़ें', wikiSettings:'विकी सेटिंग्स', wikiTitle:'विकी शीर्षक', wikiDesc:'विवरण', customCSS:'कस्टम CSS', cssPlaceholder:'CSS नियम…', saveSettings:'सेटिंग्स सहेजें', close:'बंद करें', defaultDesc:'आपका व्यक्तिगत विकी स्थान।', confirmDelete:'इस पृष्ठ को हटाएं?', saved:'सहेजा गया', deleted:'पृष्ठ हटाया गया', selectPage:'पृष्ठ चुनें…', linkUrl:'URL:', linkText:'पाठ:', imageUrl:'छवि URL:', enterTitle:'शीर्षक दर्ज करें' },
    pt: { search:'Pesquisar…', newPage:'Nova página', pinned:'Fixado', pages:'Páginas', tags:'Tags', recent:'Recente', links:'Links', recentlyEdited:'Editado recentemente', untitled:'Sem título', edit:'Editar', save:'Salvar', cancel:'Cancelar', delete:'Excluir', pin:'Fixar', unpin:'Desafixar', info:'Info', settings:'Configurações', back:'Voltar', expand:'Expandir', collapse:'Recolher', created:'Criado', updated:'Atualizado', parent:'Página pai', none:'Nenhum', addTag:'Adicionar tag…', backlinks:'Backlinks', subPages:'Subpáginas', pageTitle:'Título da página', writeContent:'Escreva em Markdown…', preview:'Pré-visualizar', insertLink:'Inserir link', insertWikiLink:'Inserir link wiki', insertImage:'Inserir imagem', wikiSettings:'Configurações wiki', wikiTitle:'Título wiki', wikiDesc:'Descrição', customCSS:'CSS personalizado', cssPlaceholder:'Suas regras CSS…', saveSettings:'Salvar configurações', close:'Fechar', defaultDesc:'Seu espaço wiki pessoal.', confirmDelete:'Excluir esta página?', saved:'Salvo', deleted:'Página excluída', selectPage:'Selecionar…', linkUrl:'URL:', linkText:'Texto:', imageUrl:'URL da imagem:', enterTitle:'Digite o título' }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9\u00C0-\u024F\u0400-\u04FF\u4e00-\u9fff\uAC00-\uD7AF\u3040-\u309F\u30A0-\u30FF]+/g, '_').replace(/^_|_$/g, '').slice(0, 80);
  }

  // Simple Markdown renderer with wiki link support
  function renderMarkdown(md, pages) {
    var html = md;
    // Escape HTML (but keep existing tags safe for later)
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, function(_, lang, code) {
      return '<pre><code class="lang-' + lang + '">' + code + '</code></pre>';
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Wiki links: [[Page Title]] or [[Page Title|Display Text]]
    html = html.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, function(_, target, display) {
      var title = target.trim();
      var text = (display || title).trim();
      var found = pages.find(function(p) { return p.title === title || p.slug === slugify(title); });
      if (found) {
        return '<a href="#" class="wiki-link" data-page-id="' + found.id + '">' + text + '</a>';
      }
      return '<a href="#" class="wiki-link missing" data-page-title="' + title.replace(/"/g, '&quot;') + '">' + text + '</a>';
    });

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />');

    // External links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Headings
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr/>');

    // Blockquote
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

    // Bold, italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Unordered list
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Ordered list
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Tables: | col | col |
    html = html.replace(/^(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)+)/gm, function(_, header, sep, body) {
      var ths = header.split('|').filter(Boolean).map(function(c) { return '<th>' + c.trim() + '</th>'; }).join('');
      var rows = body.trim().split('\n').map(function(row) {
        var tds = row.split('|').filter(Boolean).map(function(c) { return '<td>' + c.trim() + '</td>'; }).join('');
        return '<tr>' + tds + '</tr>';
      }).join('');
      return '<table><thead><tr>' + ths + '</tr></thead><tbody>' + rows + '</tbody></table>';
    });

    // Paragraphs
    html = html.replace(/\n\n+/g, '\n</p><p>\n');
    html = '<p>' + html + '</p>';
    html = html.replace(/<p>\s*(<h[1-3]|<ul|<ol|<pre|<blockquote|<hr|<table)/g, '$1');
    html = html.replace(/(<\/h[1-3]>|<\/ul>|<\/ol>|<\/pre>|<\/blockquote>|<hr\/>|<\/table>)\s*<\/p>/g, '$1');
    html = html.replace(/<p>\s*<\/p>/g, '');

    return html;
  }

  return {
    setup() {
      const lang = ref(getLocale());
      const L = computed(function() { return LANGS[lang.value] || LANGS.en; });
      function t(key) { return L.value[key] || key; }
      function onLocaleChanged(e) { lang.value = e.detail || getLocale(); }

      const pages = ref([]);
      const wikiSettings = ref({ title: 'Feather Wiki', description: '', customCss: '' });
      const currentPageId = ref('');
      const editing = ref(false);
      const editTitle = ref('');
      const editContent = ref('');
      const showPreview = ref(false);
      const searchQuery = ref('');
      const filterTag = ref('');
      const sidebarCollapsed = ref(false);
      const showSettings = ref(false);
      const showPageInfo = ref(false);
      const newTag = ref('');
      const historyStack = ref([]);
      const editorArea = ref(null);
      var saveTimeout = null;
      var loading = false;

      // Computed
      var currentPage = computed(function() {
        return pages.value.find(function(p) { return p.id === currentPageId.value; }) || null;
      });

      var filteredPages = computed(function() {
        var q = searchQuery.value.toLowerCase().trim();
        var tag = filterTag.value;
        return pages.value.filter(function(p) {
          if (tag && (!p.tags || p.tags.indexOf(tag) === -1)) return false;
          if (q) {
            return (p.title || '').toLowerCase().indexOf(q) !== -1 ||
                   (p.content || '').toLowerCase().indexOf(q) !== -1;
          }
          return true;
        }).sort(function(a, b) { return (a.title || '').localeCompare(b.title || ''); });
      });

      var pinnedPages = computed(function() {
        return pages.value.filter(function(p) { return p.pinned; });
      });

      var recentPages = computed(function() {
        return pages.value.slice().sort(function(a, b) {
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        }).slice(0, 8);
      });

      var allTags = computed(function() {
        var set = {};
        pages.value.forEach(function(p) {
          if (p.tags) p.tags.forEach(function(tg) { set[tg] = true; });
        });
        return Object.keys(set).sort();
      });

      var totalLinks = computed(function() {
        var count = 0;
        pages.value.forEach(function(p) {
          var m = (p.content || '').match(/\[\[/g);
          if (m) count += m.length;
        });
        return count;
      });

      var renderedContent = computed(function() {
        if (!currentPage.value) return '';
        return renderMarkdown(currentPage.value.content || '', pages.value);
      });

      var previewContent = computed(function() {
        return renderMarkdown(editContent.value || '', pages.value);
      });

      var childPages = computed(function() {
        if (!currentPage.value) return [];
        return pages.value.filter(function(p) { return p.parent === currentPage.value.id; });
      });

      var backlinks = computed(function() {
        if (!currentPage.value) return [];
        var title = currentPage.value.title;
        var slug = currentPage.value.slug;
        return pages.value.filter(function(p) {
          if (p.id === currentPage.value.id) return false;
          var c = p.content || '';
          return c.indexOf('[[' + title + ']]') !== -1 ||
                 c.indexOf('[[' + title + '|') !== -1 ||
                 c.indexOf('[[' + slug + ']]') !== -1;
        });
      });

      // Methods
      function getPageTitle(id) {
        var p = pages.value.find(function(x) { return x.id === id; });
        return p ? p.title : '';
      }

      function fmtDate(d) {
        if (!d) return '';
        try { return new Date(d).toLocaleDateString(lang.value, { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }); }
        catch { return d; }
      }

      async function loadData() {
        if (loading) return;
        loading = true;
        try {
          var res = await fetch('/api/featherwiki/data');
          if (res.ok) {
            var data = await res.json();
            pages.value = data.pages || [];
            wikiSettings.value = data.settings || { title: 'Feather Wiki', description: '', customCss: '' };
          }
        } catch (e) { console.error('FeatherWiki load error:', e); }
        loading = false;
      }

      function debouncedSave() {
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveData, 500);
      }

      async function saveData() {
        try {
          await fetch('/api/featherwiki/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pages: pages.value, settings: wikiSettings.value })
          });
        } catch (e) { console.error('FeatherWiki save error:', e); }
      }

      function openPage(id) {
        if (editing.value) return;
        showSettings.value = false;
        showPageInfo.value = false;
        if (currentPageId.value !== id) {
          historyStack.value.push(currentPageId.value);
          if (historyStack.value.length > 50) historyStack.value.shift();
        }
        currentPageId.value = id;
      }

      function goBack() {
        if (historyStack.value.length > 0) {
          currentPageId.value = historyStack.value.pop();
        }
      }

      function goHome() {
        if (editing.value) return;
        showSettings.value = false;
        showPageInfo.value = false;
        if (currentPageId.value) historyStack.value.push(currentPageId.value);
        currentPageId.value = '';
      }

      function createPage() {
        var newPage = {
          id: genId(),
          slug: '',
          title: '',
          content: '',
          tags: [],
          parent: '',
          pinned: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        pages.value.push(newPage);
        currentPageId.value = newPage.id;
        showSettings.value = false;
        showPageInfo.value = false;
        startEdit();
      }

      function startEdit() {
        if (!currentPage.value) return;
        editTitle.value = currentPage.value.title;
        editContent.value = currentPage.value.content;
        editing.value = true;
        nextTick(function() { if (editorArea.value) editorArea.value.focus(); });
      }

      function saveEdit() {
        if (!currentPage.value) return;
        currentPage.value.title = editTitle.value.slice(0, 200);
        currentPage.value.slug = slugify(editTitle.value);
        currentPage.value.content = editContent.value.slice(0, 50000);
        currentPage.value.updatedAt = new Date().toISOString();
        editing.value = false;
        showPreview.value = false;
        debouncedSave();
        ElMessage.success(t('saved'));
      }

      function cancelEdit() {
        editing.value = false;
        showPreview.value = false;
        // If page has no title and no content, remove it
        if (currentPage.value && !currentPage.value.title && !currentPage.value.content) {
          pages.value = pages.value.filter(function(p) { return p.id !== currentPage.value.id; });
          currentPageId.value = '';
        }
      }

      function deletePage(id) {
        if (!confirm(t('confirmDelete'))) return;
        pages.value = pages.value.filter(function(p) { return p.id !== id; });
        // Clear parent refs
        pages.value.forEach(function(p) { if (p.parent === id) p.parent = ''; });
        if (currentPageId.value === id) currentPageId.value = '';
        debouncedSave();
        ElMessage.success(t('deleted'));
      }

      function togglePin(page) {
        page.pinned = !page.pinned;
        debouncedSave();
      }

      function addTag() {
        var tag = newTag.value.trim().slice(0, 30);
        if (!tag || !currentPage.value) return;
        if (!currentPage.value.tags) currentPage.value.tags = [];
        if (currentPage.value.tags.indexOf(tag) === -1) {
          currentPage.value.tags.push(tag);
          currentPage.value.updatedAt = new Date().toISOString();
          debouncedSave();
        }
        newTag.value = '';
      }

      function removeTag(index) {
        if (!currentPage.value || !currentPage.value.tags) return;
        currentPage.value.tags.splice(index, 1);
        currentPage.value.updatedAt = new Date().toISOString();
        debouncedSave();
      }

      function saveSettings() {
        debouncedSave();
        showSettings.value = false;
        ElMessage.success(t('saved'));
      }

      // Editor helpers
      function insertAtCursor(before, after) {
        var ta = editorArea.value;
        if (!ta) return;
        var start = ta.selectionStart;
        var end = ta.selectionEnd;
        var selected = editContent.value.slice(start, end);
        var replacement = before + selected + after;
        editContent.value = editContent.value.slice(0, start) + replacement + editContent.value.slice(end);
        nextTick(function() {
          ta.focus();
          ta.selectionStart = start + before.length;
          ta.selectionEnd = start + before.length + selected.length;
        });
      }

      function insertMd(before, after) {
        insertAtCursor(before.replace(/\\n/g, '\n'), after.replace(/\\n/g, '\n'));
      }

      function insertLink() {
        var url = prompt(t('linkUrl'), 'https://');
        if (!url) return;
        var text = prompt(t('linkText'), '');
        insertAtCursor('[' + (text || url) + '](', url + ')');
      }

      function insertWikiLink() {
        var title = prompt(t('selectPage'), '');
        if (!title) return;
        insertAtCursor('[[', title + ']]');
      }

      function insertImage() {
        var url = prompt(t('imageUrl'), 'https://');
        if (!url) return;
        insertAtCursor('![](', url + ')');
      }

      function handleContentClick(e) {
        var target = e.target;
        if (target.classList.contains('wiki-link')) {
          e.preventDefault();
          var pageId = target.getAttribute('data-page-id');
          var pageTitle = target.getAttribute('data-page-title');
          if (pageId) {
            openPage(pageId);
          } else if (pageTitle) {
            // Create new page with this title
            var newPage = {
              id: genId(),
              slug: slugify(pageTitle),
              title: pageTitle,
              content: '',
              tags: [],
              parent: currentPageId.value,
              pinned: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            pages.value.push(newPage);
            debouncedSave();
            openPage(newPage.id);
            startEdit();
          }
        }
      }

      // Keyboard shortcut
      function onKeyDown(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's' && editing.value) {
          e.preventDefault();
          saveEdit();
        }
      }

      onMounted(function() {
        loadData();
        document.addEventListener('keydown', onKeyDown);
        window.addEventListener('locale-changed', onLocaleChanged);
      });

      onUnmounted(function() {
        if (saveTimeout) clearTimeout(saveTimeout);
        document.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('locale-changed', onLocaleChanged);
      });

      return {
        lang, t, pages, wikiSettings, currentPageId, currentPage,
        editing, editTitle, editContent, showPreview, searchQuery,
        filterTag, sidebarCollapsed, showSettings, showPageInfo,
        newTag, historyStack, editorArea,
        filteredPages, pinnedPages, recentPages, allTags, totalLinks,
        renderedContent, previewContent, childPages, backlinks,
        getPageTitle, fmtDate, openPage, goBack, goHome,
        createPage, startEdit, saveEdit, cancelEdit,
        deletePage, togglePin, addTag, removeTag, saveSettings,
        insertMd, insertLink, insertWikiLink, insertImage,
        handleContentClick, debouncedSave
      };
    }
  };
})(Vue);
