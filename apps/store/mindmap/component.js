(function(Vue) {
  const { ref, onMounted, onUnmounted, nextTick } = Vue;
  const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success: console.log, error: console.error, warning: console.warn };

  const LANGS = {
    tr: { mainTopic:'Ana Konu', subTopic:'Alt Konu', detail:'Detay', openFile:'📂 Mind Map Aç', saveFile:'💾 Mind Map Kaydet', invalidFile:'Geçersiz mind map dosyası', fileNotFound:'Dosya bulunamadı', openFailed:'Dosya açılamadı', modified:'değiştirilmiş', newBtn:'Yeni', openBtn:'Aç', saveBtn:'Kaydet (Ctrl+S)', saveAsBtn:'Farklı Kaydet', undo:'Geri Al', redo:'Yinele', addChild:'Alt Düğüm Ekle', addSibling:'Kardeş Düğüm Ekle', deleteNode:'Düğüm Sil', fit:'Sığdır', zoomIn:'Yakınlaştır', zoomOut:'Uzaklaştır', recentFiles:'Son Dosyalar', logical:'Mantıksal', mindMapLayout:'Zihin Haritası', organization:'Organizasyon', catalog:'Katalog', timeline:'Zaman Çizelgesi', fishbone:'Balık Kılçığı', themeDefault:'Varsayılan', classic:'Klasik', dark:'Koyu', green:'Yeşil', blue:'Mavi', pink:'Pembe', earth:'Toprak', purple:'Mor' },
    en: { mainTopic:'Main Topic', subTopic:'Sub Topic', detail:'Detail', openFile:'📂 Open Mind Map', saveFile:'💾 Save Mind Map', invalidFile:'Invalid mind map file', fileNotFound:'File not found', openFailed:'Failed to open file', modified:'modified', newBtn:'New', openBtn:'Open', saveBtn:'Save (Ctrl+S)', saveAsBtn:'Save As', undo:'Undo', redo:'Redo', addChild:'Add Child Node', addSibling:'Add Sibling Node', deleteNode:'Delete Node', fit:'Fit', zoomIn:'Zoom In', zoomOut:'Zoom Out', recentFiles:'Recent Files', logical:'Logical', mindMapLayout:'Mind Map', organization:'Organization', catalog:'Catalog', timeline:'Timeline', fishbone:'Fishbone', themeDefault:'Default', classic:'Classic', dark:'Dark', green:'Green', blue:'Blue', pink:'Pink', earth:'Earth', purple:'Purple' },
    de: { mainTopic:'Hauptthema', subTopic:'Unterthema', detail:'Detail', openFile:'📂 Mind Map öffnen', saveFile:'💾 Mind Map speichern', invalidFile:'Ungültige Mind-Map-Datei', fileNotFound:'Datei nicht gefunden', openFailed:'Datei konnte nicht geöffnet werden', modified:'geändert', newBtn:'Neu', openBtn:'Öffnen', saveBtn:'Speichern (Strg+S)', saveAsBtn:'Speichern unter', undo:'Rückgängig', redo:'Wiederholen', addChild:'Unterknoten hinzufügen', addSibling:'Geschwisterknoten hinzufügen', deleteNode:'Knoten löschen', fit:'Einpassen', zoomIn:'Vergrößern', zoomOut:'Verkleinern', recentFiles:'Zuletzt geöffnet', logical:'Logisch', mindMapLayout:'Mind Map', organization:'Organisation', catalog:'Katalog', timeline:'Zeitleiste', fishbone:'Fischgräte', themeDefault:'Standard', classic:'Klassisch', dark:'Dunkel', green:'Grün', blue:'Blau', pink:'Rosa', earth:'Erde', purple:'Lila' },
    fr: { mainTopic:'Sujet principal', subTopic:'Sous-sujet', detail:'Détail', openFile:'📂 Ouvrir Mind Map', saveFile:'💾 Enregistrer Mind Map', invalidFile:'Fichier mind map invalide', fileNotFound:'Fichier introuvable', openFailed:'Impossible d\'ouvrir le fichier', modified:'modifié', newBtn:'Nouveau', openBtn:'Ouvrir', saveBtn:'Enregistrer (Ctrl+S)', saveAsBtn:'Enregistrer sous', undo:'Annuler', redo:'Rétablir', addChild:'Ajouter nœud enfant', addSibling:'Ajouter nœud frère', deleteNode:'Supprimer nœud', fit:'Ajuster', zoomIn:'Zoom avant', zoomOut:'Zoom arrière', recentFiles:'Fichiers récents', logical:'Logique', mindMapLayout:'Carte mentale', organization:'Organisation', catalog:'Catalogue', timeline:'Chronologie', fishbone:'Arête de poisson', themeDefault:'Par défaut', classic:'Classique', dark:'Sombre', green:'Vert', blue:'Bleu', pink:'Rose', earth:'Terre', purple:'Violet' },
    es: { mainTopic:'Tema principal', subTopic:'Subtema', detail:'Detalle', openFile:'📂 Abrir Mind Map', saveFile:'💾 Guardar Mind Map', invalidFile:'Archivo de mind map inválido', fileNotFound:'Archivo no encontrado', openFailed:'No se pudo abrir el archivo', modified:'modificado', newBtn:'Nuevo', openBtn:'Abrir', saveBtn:'Guardar (Ctrl+S)', saveAsBtn:'Guardar como', undo:'Deshacer', redo:'Rehacer', addChild:'Añadir nodo hijo', addSibling:'Añadir nodo hermano', deleteNode:'Eliminar nodo', fit:'Ajustar', zoomIn:'Acercar', zoomOut:'Alejar', recentFiles:'Archivos recientes', logical:'Lógico', mindMapLayout:'Mapa mental', organization:'Organización', catalog:'Catálogo', timeline:'Línea de tiempo', fishbone:'Espina de pez', themeDefault:'Predeterminado', classic:'Clásico', dark:'Oscuro', green:'Verde', blue:'Azul', pink:'Rosa', earth:'Tierra', purple:'Morado' },
    ru: { mainTopic:'Главная тема', subTopic:'Подтема', detail:'Деталь', openFile:'📂 Открыть Mind Map', saveFile:'💾 Сохранить Mind Map', invalidFile:'Недопустимый файл mind map', fileNotFound:'Файл не найден', openFailed:'Не удалось открыть файл', modified:'изменено', newBtn:'Новый', openBtn:'Открыть', saveBtn:'Сохранить (Ctrl+S)', saveAsBtn:'Сохранить как', undo:'Отменить', redo:'Повторить', addChild:'Добавить дочерний узел', addSibling:'Добавить соседний узел', deleteNode:'Удалить узел', fit:'Вписать', zoomIn:'Увеличить', zoomOut:'Уменьшить', recentFiles:'Недавние файлы', logical:'Логический', mindMapLayout:'Ментальная карта', organization:'Организация', catalog:'Каталог', timeline:'Хронология', fishbone:'Рыбья кость', themeDefault:'По умолчанию', classic:'Классический', dark:'Тёмный', green:'Зелёный', blue:'Синий', pink:'Розовый', earth:'Земля', purple:'Фиолетовый' },
    zh: { mainTopic:'主题', subTopic:'子主题', detail:'细节', openFile:'📂 打开思维导图', saveFile:'💾 保存思维导图', invalidFile:'无效的思维导图文件', fileNotFound:'文件未找到', openFailed:'无法打开文件', modified:'已修改', newBtn:'新建', openBtn:'打开', saveBtn:'保存 (Ctrl+S)', saveAsBtn:'另存为', undo:'撤销', redo:'重做', addChild:'添加子节点', addSibling:'添加同级节点', deleteNode:'删除节点', fit:'适应', zoomIn:'放大', zoomOut:'缩小', recentFiles:'最近文件', logical:'逻辑', mindMapLayout:'思维导图', organization:'组织', catalog:'目录', timeline:'时间线', fishbone:'鱼骨图', themeDefault:'默认', classic:'经典', dark:'深色', green:'绿色', blue:'蓝色', pink:'粉色', earth:'大地', purple:'紫色' },
    ja: { mainTopic:'メインテーマ', subTopic:'サブテーマ', detail:'詳細', openFile:'📂 マインドマップを開く', saveFile:'💾 マインドマップを保存', invalidFile:'無効なマインドマップファイル', fileNotFound:'ファイルが見つかりません', openFailed:'ファイルを開けません', modified:'変更済み', newBtn:'新規', openBtn:'開く', saveBtn:'保存 (Ctrl+S)', saveAsBtn:'名前を付けて保存', undo:'元に戻す', redo:'やり直す', addChild:'子ノード追加', addSibling:'兄弟ノード追加', deleteNode:'ノード削除', fit:'フィット', zoomIn:'拡大', zoomOut:'縮小', recentFiles:'最近のファイル', logical:'論理', mindMapLayout:'マインドマップ', organization:'組織', catalog:'カタログ', timeline:'タイムライン', fishbone:'フィッシュボーン', themeDefault:'デフォルト', classic:'クラシック', dark:'ダーク', green:'グリーン', blue:'ブルー', pink:'ピンク', earth:'アース', purple:'パープル' },
    it: { mainTopic:'Argomento principale', subTopic:'Sotto-argomento', detail:'Dettaglio', openFile:'📂 Apri Mind Map', saveFile:'💾 Salva Mind Map', invalidFile:'File mind map non valido', fileNotFound:'File non trovato', openFailed:'Impossibile aprire il file', modified:'modificato', newBtn:'Nuovo', openBtn:'Apri', saveBtn:'Salva (Ctrl+S)', saveAsBtn:'Salva con nome', undo:'Annulla', redo:'Ripeti', addChild:'Aggiungi nodo figlio', addSibling:'Aggiungi nodo fratello', deleteNode:'Elimina nodo', fit:'Adatta', zoomIn:'Ingrandisci', zoomOut:'Rimpicciolisci', recentFiles:'File recenti', logical:'Logico', mindMapLayout:'Mappa mentale', organization:'Organizzazione', catalog:'Catalogo', timeline:'Linea temporale', fishbone:'Spina di pesce', themeDefault:'Predefinito', classic:'Classico', dark:'Scuro', green:'Verde', blue:'Blu', pink:'Rosa', earth:'Terra', purple:'Viola' },
    ar: { mainTopic:'الموضوع الرئيسي', subTopic:'موضوع فرعي', detail:'تفاصيل', openFile:'📂 فتح خريطة ذهنية', saveFile:'💾 حفظ خريطة ذهنية', invalidFile:'ملف خريطة ذهنية غير صالح', fileNotFound:'الملف غير موجود', openFailed:'فشل في فتح الملف', modified:'معدّل', newBtn:'جديد', openBtn:'فتح', saveBtn:'حفظ (Ctrl+S)', saveAsBtn:'حفظ باسم', undo:'تراجع', redo:'إعادة', addChild:'إضافة عقدة فرعية', addSibling:'إضافة عقدة شقيقة', deleteNode:'حذف عقدة', fit:'ملاءمة', zoomIn:'تكبير', zoomOut:'تصغير', recentFiles:'الملفات الأخيرة', logical:'منطقي', mindMapLayout:'خريطة ذهنية', organization:'تنظيم', catalog:'كتالوج', timeline:'خط زمني', fishbone:'عظم السمكة', themeDefault:'افتراضي', classic:'كلاسيكي', dark:'داكن', green:'أخضر', blue:'أزرق', pink:'وردي', earth:'أرضي', purple:'بنفسجي' },
    ko: { mainTopic:'메인 주제', subTopic:'하위 주제', detail:'세부사항', openFile:'📂 마인드맵 열기', saveFile:'💾 마인드맵 저장', invalidFile:'잘못된 마인드맵 파일', fileNotFound:'파일을 찾을 수 없음', openFailed:'파일을 열 수 없음', modified:'수정됨', newBtn:'새로 만들기', openBtn:'열기', saveBtn:'저장 (Ctrl+S)', saveAsBtn:'다른 이름으로 저장', undo:'실행 취소', redo:'다시 실행', addChild:'하위 노드 추가', addSibling:'형제 노드 추가', deleteNode:'노드 삭제', fit:'맞추기', zoomIn:'확대', zoomOut:'축소', recentFiles:'최근 파일', logical:'논리', mindMapLayout:'마인드맵', organization:'조직', catalog:'카탈로그', timeline:'타임라인', fishbone:'피쉬본', themeDefault:'기본', classic:'클래식', dark:'다크', green:'녹색', blue:'파란색', pink:'분홍색', earth:'어스', purple:'보라색' },
    hi: { mainTopic:'मुख्य विषय', subTopic:'उप विषय', detail:'विवरण', openFile:'📂 माइंड मैप खोलें', saveFile:'💾 माइंड मैप सहेजें', invalidFile:'अमान्य माइंड मैप फ़ाइल', fileNotFound:'फ़ाइल नहीं मिली', openFailed:'फ़ाइल नहीं खुली', modified:'संशोधित', newBtn:'नया', openBtn:'खोलें', saveBtn:'सहेजें (Ctrl+S)', saveAsBtn:'इस रूप में सहेजें', undo:'पूर्ववत', redo:'फिर से करें', addChild:'चाइल्ड नोड जोड़ें', addSibling:'सिबलिंग नोड जोड़ें', deleteNode:'नोड हटाएं', fit:'फ़िट', zoomIn:'ज़ूम इन', zoomOut:'ज़ूम आउट', recentFiles:'हाल की फ़ाइलें', logical:'तार्किक', mindMapLayout:'माइंड मैप', organization:'संगठन', catalog:'कैटलॉग', timeline:'समयरेखा', fishbone:'फ़िशबोन', themeDefault:'डिफ़ॉल्ट', classic:'क्लासिक', dark:'डार्क', green:'हरा', blue:'नीला', pink:'गुलाबी', earth:'मिट्टी', purple:'बैंगनी' },
    pt: { mainTopic:'Tema principal', subTopic:'Subtema', detail:'Detalhe', openFile:'📂 Abrir Mapa Mental', saveFile:'💾 Salvar Mapa Mental', invalidFile:'Arquivo de mapa mental inválido', fileNotFound:'Arquivo não encontrado', openFailed:'Falha ao abrir arquivo', modified:'modificado', newBtn:'Novo', openBtn:'Abrir', saveBtn:'Salvar (Ctrl+S)', saveAsBtn:'Salvar como', undo:'Desfazer', redo:'Refazer', addChild:'Adicionar nó filho', addSibling:'Adicionar nó irmão', deleteNode:'Excluir nó', fit:'Ajustar', zoomIn:'Ampliar', zoomOut:'Reduzir', recentFiles:'Arquivos recentes', logical:'Lógico', mindMapLayout:'Mapa mental', organization:'Organização', catalog:'Catálogo', timeline:'Linha do tempo', fishbone:'Espinha de peixe', themeDefault:'Padrão', classic:'Clássico', dark:'Escuro', green:'Verde', blue:'Azul', pink:'Rosa', earth:'Terra', purple:'Roxo' }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  return {
    setup() {
      const lang = ref(getLocale());
      const L = Vue.computed(function() { return LANGS[lang.value] || LANGS.en; });
      function t(key) { return L.value[key] || key; }
      function onLocaleChanged(e) { lang.value = e.detail || getLocale(); }

      const mmContainer = ref(null);
      var mindMap = null;
      const currentFilePath = ref('');
      const isDirty = ref(false);
      const currentLayout = ref('logicalStructure');
      const currentTheme = ref('default');
      const showRecent = ref(false);
      const recentFiles = ref([]);
      var RECENT_KEY = 'mindmap_recent_files';

      var defaultData = Vue.computed(function() { return {
        data: { text: t('mainTopic') },
        children: [
          { data: { text: t('subTopic') + ' 1' }, children: [
            { data: { text: t('detail') + ' 1.1' }, children: [] },
            { data: { text: t('detail') + ' 1.2' }, children: [] }
          ]},
          { data: { text: t('subTopic') + ' 2' }, children: [
            { data: { text: t('detail') + ' 2.1' }, children: [] }
          ]},
          { data: { text: t('subTopic') + ' 3' }, children: [] }
        ]
      }; });

      function loadRecent() {
        try { recentFiles.value = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch(e) { recentFiles.value = []; }
      }

      function addRecent(filePath) {
        var name = filePath.split('/').pop();
        var list = recentFiles.value.filter(function(r) { return r.path !== filePath; });
        list.unshift({ name: name, path: filePath, time: Date.now() });
        if (list.length > 10) list.length = 10;
        recentFiles.value = list;
        localStorage.setItem(RECENT_KEY, JSON.stringify(list));
      }

      function loadMindMapLib() {
        return new Promise(function(resolve, reject) {
          if (window.simpleMindMap) { resolve(window.simpleMindMap.default || window.simpleMindMap); return; }
          // Check if script tag already exists but hasn't loaded yet
          var existing = document.querySelector('script[src*="simpleMindMap.umd"]');
          if (existing) {
            existing.addEventListener('load', function() { resolve(window.simpleMindMap.default || window.simpleMindMap); });
            existing.addEventListener('error', function() {
              // Retry with fresh script
              loadScript().then(resolve).catch(reject);
            });
            // Also poll in case load event already fired
            var tries = 0;
            var poll = setInterval(function() {
              tries++;
              if (window.simpleMindMap) { clearInterval(poll); resolve(window.simpleMindMap.default || window.simpleMindMap); }
              if (tries > 50) { clearInterval(poll); loadScript().then(resolve).catch(reject); }
            }, 100);
            return;
          }
          loadScript().then(resolve).catch(reject);
        });
        function loadScript() {
          return new Promise(function(resolve, reject) {
            // Load CSS if not already loaded
            if (!document.querySelector('link[href*="simpleMindMap"]')) {
              var link = document.createElement('link');
              link.rel = 'stylesheet';
              link.href = 'https://unpkg.com/simple-mind-map@0.12.1/dist/simpleMindMap.esm.min.css';
              document.head.appendChild(link);
            }
            // Temporarily hide AMD define to prevent UMD conflict with RequireJS/Monaco
            var origDefine = window.define;
            window.define = undefined;
            var s = document.createElement('script');
            s.src = 'https://unpkg.com/simple-mind-map@0.12.1/dist/simpleMindMap.umd.min.js';
            s.onload = function() {
              window.define = origDefine;
              resolve(window.simpleMindMap.default || window.simpleMindMap);
            };
            s.onerror = function(e) { window.define = origDefine; reject(e); };
            document.head.appendChild(s);
          });
        }
      }

      onMounted(function() {
        loadRecent();
        nextTick(function() {
          if (!mmContainer.value) return;
          loadMindMapLib().then(function(MindMap) {
            // Ensure container has dimensions before init
            var el = mmContainer.value;
            if (!el) return;
            function initMindMap() {
              if (!el.clientWidth || !el.clientHeight) {
                setTimeout(initMindMap, 50);
                return;
              }
              mindMap = new MindMap({
                el: el,
                data: JSON.parse(JSON.stringify(defaultData.value)),
                layout: currentLayout.value,
                theme: currentTheme.value,
                mousewheelAction: 'zoom',
                fit: true
              });
              mindMap.on('data_change', function() { isDirty.value = true; });
            }
            initMindMap();
          }).catch(function(e) { console.error('MindMap lib load error:', e); });
        });
      });

      onUnmounted(function() {
        if (mindMap) { mindMap.destroy(); mindMap = null; }
        window.removeEventListener('keydown', handleKey);
        window.removeEventListener('locale-changed', onLocaleChanged);
        document.removeEventListener('click', closeRecent);
      });

      function newMap() {
        if (mindMap) {
          mindMap.setData(JSON.parse(JSON.stringify(defaultData.value)));
          currentFilePath.value = '';
          isDirty.value = false;
        }
      }

      async function openMap() {
        var result = await window.FileDialog.open({
          title: t('openFile'),
          filters: [{ label: 'Mind Map', extensions: ['.smm', '.json'] }, { label: 'All Files', extensions: ['*'] }]
        });
        if (!result) return;
        try {
          var data = JSON.parse(result.content);
          if (mindMap) {
            mindMap.setData(data);
            currentFilePath.value = result.path;
            isDirty.value = false;
            addRecent(result.path);
          }
        } catch (e) { ElMessage.error(t('invalidFile') + ': ' + e.message); }
      }

      async function saveMap() {
        if (!mindMap) return;
        var data = mindMap.getData();
        var content = JSON.stringify(data, null, 2);
        if (currentFilePath.value) {
          await window.FileDialog.writeFile(currentFilePath.value, content);
          isDirty.value = false;
          addRecent(currentFilePath.value);
        } else {
          await saveMapAs();
        }
      }

      async function saveMapAs() {
        if (!mindMap) return;
        var data = mindMap.getData();
        var content = JSON.stringify(data, null, 2);
        var result = await window.FileDialog.save({
          title: t('saveFile'),
          defaultName: 'mindmap.smm',
          filters: [{ label: 'Mind Map', extensions: ['.smm', '.json'] }]
        });
        if (!result) return;
        await window.FileDialog.writeFile(result, content);
        currentFilePath.value = result;
        isDirty.value = false;
        addRecent(result);
      }

      async function openRecent(rf) {
        showRecent.value = false;
        try {
          var file = await window.FileDialog.readFile(rf.path);
          if (!file) { ElMessage.error(t('fileNotFound') + ': ' + rf.path); return; }
          var data = JSON.parse(file.content);
          if (mindMap) {
            mindMap.setData(data);
            currentFilePath.value = rf.path;
            isDirty.value = false;
            addRecent(rf.path);
          }
        } catch (e) { ElMessage.error(t('openFailed') + ': ' + e.message); }
      }

      function doUndo() { if (mindMap) mindMap.execCommand('BACK'); }
      function doRedo() { if (mindMap) mindMap.execCommand('FORWARD'); }
      function addChild() { if (mindMap) mindMap.execCommand('INSERT_CHILD_NODE'); }
      function addSibling() { if (mindMap) mindMap.execCommand('INSERT_NODE'); }
      function removeNode() { if (mindMap) mindMap.execCommand('REMOVE_NODE'); }

      function fitCanvas() { if (mindMap) mindMap.view.fit(); }
      function zoomIn() { if (mindMap) mindMap.view.enlarge(); }
      function zoomOut() { if (mindMap) mindMap.view.narrow(); }

      function changeLayout(layout) {
        currentLayout.value = layout;
        if (mindMap) mindMap.setLayout(layout);
      }

      function changeTheme(theme) {
        currentTheme.value = theme;
        if (mindMap) mindMap.setTheme(theme);
      }

      function handleKey(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveMap(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'o') { e.preventDefault(); openMap(); }
      }
      function closeRecent() { if (showRecent.value) showRecent.value = false; }

      onMounted(function() {
        window.addEventListener('keydown', handleKey);
        window.addEventListener('locale-changed', onLocaleChanged);
        document.addEventListener('click', closeRecent);
      });

      return {
        mmContainer: mmContainer, currentFilePath: currentFilePath, isDirty: isDirty,
        currentLayout: currentLayout, currentTheme: currentTheme,
        showRecent: showRecent, recentFiles: recentFiles, t: t, L: L,
        newMap: newMap, openMap: openMap, saveMap: saveMap, saveMapAs: saveMapAs, openRecent: openRecent,
        doUndo: doUndo, doRedo: doRedo, addChild: addChild, addSibling: addSibling, removeNode: removeNode,
        fitCanvas: fitCanvas, zoomIn: zoomIn, zoomOut: zoomOut, changeLayout: changeLayout, changeTheme: changeTheme
      };
    }
  };
})(Vue);
