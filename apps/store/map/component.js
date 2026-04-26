({
  setup() {
    const { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } = Vue;
    const ElMessageBox = (window.ElementPlus && window.ElementPlus.ElMessageBox) || { confirm: () => Promise.resolve() };

    const LANGS = {
      tr: {
        title:'Harita', markers:'İşaretler', views:'Görünümler', layers:'Katman',
        addMarker:'İşaret Ekle', editMarker:'İşaret Düzenle', deleteMarker:'İşareti Sil',
        saveView:'Görünümü Kaydet', deleteView:'Görünümü Sil', goToView:'Git',
        name:'Ad', description:'Açıklama', color:'Renk', icon:'İkon', lat:'Enlem', lon:'Boylam',
        save:'Kaydet', cancel:'İptal', delete:'Sil', edit:'Düzenle',
        noMarkers:'Henüz işaret yok', noViews:'Henüz kayıtlı görünüm yok',
        clickToPlace:'Haritaya tıklayarak konum seçin', deleteConfirm:'Silmek istediğinize emin misiniz?',
        viewName:'Görünüm Adı', currentView:'Mevcut Görünüm', zoom:'Yakınlaştırma',
        osm:'OpenStreetMap', satellite:'Uydu (Google)', topo:'Topoğrafik',
        sidebar:'Panel', fitAll:'Tümünü Göster', myLocation:'Konumum',
        nameRequired:'Ad gerekli', coordRequired:'Koordinat gerekli',
        search:'Ara...', total:'Toplam'
      },
      en: {
        title:'Map', markers:'Markers', views:'Views', layers:'Layer',
        addMarker:'Add Marker', editMarker:'Edit Marker', deleteMarker:'Delete Marker',
        saveView:'Save View', deleteView:'Delete View', goToView:'Go',
        name:'Name', description:'Description', color:'Color', icon:'Icon', lat:'Latitude', lon:'Longitude',
        save:'Save', cancel:'Cancel', delete:'Delete', edit:'Edit',
        noMarkers:'No markers yet', noViews:'No saved views yet',
        clickToPlace:'Click on the map to place a marker', deleteConfirm:'Are you sure you want to delete this?',
        viewName:'View Name', currentView:'Current View', zoom:'Zoom',
        osm:'OpenStreetMap', satellite:'Satellite (Google)', topo:'Topographic',
        sidebar:'Panel', fitAll:'Fit All', myLocation:'My Location',
        nameRequired:'Name is required', coordRequired:'Coordinates required',
        search:'Search...', total:'Total'
      },
      de: {
        title:'Karte', markers:'Markierungen', views:'Ansichten', layers:'Ebene',
        addMarker:'Markierung hinzufügen', editMarker:'Markierung bearbeiten', deleteMarker:'Markierung löschen',
        saveView:'Ansicht speichern', deleteView:'Ansicht löschen', goToView:'Los',
        name:'Name', description:'Beschreibung', color:'Farbe', icon:'Symbol', lat:'Breitengrad', lon:'Längengrad',
        save:'Speichern', cancel:'Abbrechen', delete:'Löschen', edit:'Bearbeiten',
        noMarkers:'Noch keine Markierungen', noViews:'Noch keine gespeicherten Ansichten',
        clickToPlace:'Klicken Sie auf die Karte, um eine Markierung zu setzen', deleteConfirm:'Möchten Sie dies wirklich löschen?',
        viewName:'Ansichtsname', currentView:'Aktuelle Ansicht', zoom:'Zoom',
        osm:'OpenStreetMap', satellite:'Satellit (Google)', topo:'Topographisch',
        sidebar:'Panel', fitAll:'Alle anzeigen', myLocation:'Mein Standort',
        nameRequired:'Name ist erforderlich', coordRequired:'Koordinaten erforderlich',
        search:'Suchen...', total:'Gesamt'
      },
      fr: {
        title:'Carte', markers:'Marqueurs', views:'Vues', layers:'Couche',
        addMarker:'Ajouter un marqueur', editMarker:'Modifier le marqueur', deleteMarker:'Supprimer le marqueur',
        saveView:'Sauvegarder la vue', deleteView:'Supprimer la vue', goToView:'Aller',
        name:'Nom', description:'Description', color:'Couleur', icon:'Icône', lat:'Latitude', lon:'Longitude',
        save:'Enregistrer', cancel:'Annuler', delete:'Supprimer', edit:'Modifier',
        noMarkers:'Pas encore de marqueurs', noViews:'Pas encore de vues sauvegardées',
        clickToPlace:'Cliquez sur la carte pour placer un marqueur', deleteConfirm:'Êtes-vous sûr de vouloir supprimer ceci ?',
        viewName:'Nom de la vue', currentView:'Vue actuelle', zoom:'Zoom',
        osm:'OpenStreetMap', satellite:'Satellite (Google)', topo:'Topographique',
        sidebar:'Panneau', fitAll:'Tout afficher', myLocation:'Ma position',
        nameRequired:'Le nom est requis', coordRequired:'Coordonnées requises',
        search:'Rechercher...', total:'Total'
      },
      es: {
        title:'Mapa', markers:'Marcadores', views:'Vistas', layers:'Capa',
        addMarker:'Agregar marcador', editMarker:'Editar marcador', deleteMarker:'Eliminar marcador',
        saveView:'Guardar vista', deleteView:'Eliminar vista', goToView:'Ir',
        name:'Nombre', description:'Descripción', color:'Color', icon:'Icono', lat:'Latitud', lon:'Longitud',
        save:'Guardar', cancel:'Cancelar', delete:'Eliminar', edit:'Editar',
        noMarkers:'Aún no hay marcadores', noViews:'Aún no hay vistas guardadas',
        clickToPlace:'Haga clic en el mapa para colocar un marcador', deleteConfirm:'¿Está seguro de que desea eliminar esto?',
        viewName:'Nombre de la vista', currentView:'Vista actual', zoom:'Zoom',
        osm:'OpenStreetMap', satellite:'Satélite (Google)', topo:'Topográfico',
        sidebar:'Panel', fitAll:'Mostrar todo', myLocation:'Mi ubicación',
        nameRequired:'El nombre es obligatorio', coordRequired:'Coordenadas requeridas',
        search:'Buscar...', total:'Total'
      },
      ru: {
        title:'Карта', markers:'Маркеры', views:'Виды', layers:'Слой',
        addMarker:'Добавить маркер', editMarker:'Редактировать маркер', deleteMarker:'Удалить маркер',
        saveView:'Сохранить вид', deleteView:'Удалить вид', goToView:'Перейти',
        name:'Имя', description:'Описание', color:'Цвет', icon:'Иконка', lat:'Широта', lon:'Долгота',
        save:'Сохранить', cancel:'Отмена', delete:'Удалить', edit:'Редактировать',
        noMarkers:'Пока нет маркеров', noViews:'Пока нет сохранённых видов',
        clickToPlace:'Нажмите на карту, чтобы разместить маркер', deleteConfirm:'Вы уверены, что хотите удалить это?',
        viewName:'Название вида', currentView:'Текущий вид', zoom:'Масштаб',
        osm:'OpenStreetMap', satellite:'Спутник (Google)', topo:'Топографическая',
        sidebar:'Панель', fitAll:'Показать все', myLocation:'Моё местоположение',
        nameRequired:'Имя обязательно', coordRequired:'Координаты обязательны',
        search:'Поиск...', total:'Всего'
      },
    zh: { title:'地图', markers:'标记', views:'视图', layers:'图层', addMarker:'添加标记', editMarker:'编辑标记', deleteMarker:'删除标记', saveView:'保存视图', deleteView:'删除视图', goToView:'前往视图', name:'名称', description:'描述', color:'颜色', icon:'图标', lat:'纬度', lon:'经度', save:'保存', cancel:'取消', delete:'删除', edit:'编辑', noMarkers:'没有标记', noViews:'没有视图', clickToPlace:'点击地图放置', deleteConfirm:'确认删除？', viewName:'视图名称', currentView:'当前视图', zoom:'缩放', osm:'地图', satellite:'卫星', topo:'地形', sidebar:'侧边栏', fitAll:'显示全部', myLocation:'我的位置', nameRequired:'请输入名称', coordRequired:'请输入坐标', search:'搜索', total:'总计' },
    ja: { title:'マップ', markers:'マーカー', views:'ビュー', layers:'レイヤー', addMarker:'マーカー追加', editMarker:'マーカー編集', deleteMarker:'マーカー削除', saveView:'ビュー保存', deleteView:'ビュー削除', goToView:'ビューに移動', name:'名前', description:'説明', color:'色', icon:'アイコン', lat:'緯度', lon:'経度', save:'保存', cancel:'キャンセル', delete:'削除', edit:'編集', noMarkers:'マーカーなし', noViews:'ビューなし', clickToPlace:'クリックして配置', deleteConfirm:'削除しますか？', viewName:'ビュー名', currentView:'現在のビュー', zoom:'ズーム', osm:'地図', satellite:'衛星', topo:'地形', sidebar:'サイドバー', fitAll:'すべて表示', myLocation:'現在地', nameRequired:'名前を入力してください', coordRequired:'座標を入力してください', search:'検索', total:'合計' },
    it: { title:'Mappa', markers:'Marcatori', views:'Viste', layers:'Livelli', addMarker:'Aggiungi marcatore', editMarker:'Modifica marcatore', deleteMarker:'Elimina marcatore', saveView:'Salva vista', deleteView:'Elimina vista', goToView:'Vai alla vista', name:'Nome', description:'Descrizione', color:'Colore', icon:'Icona', lat:'Latitudine', lon:'Longitudine', save:'Salva', cancel:'Annulla', delete:'Elimina', edit:'Modifica', noMarkers:'Nessun marcatore', noViews:'Nessuna vista', clickToPlace:'Clicca per posizionare', deleteConfirm:'Confermi eliminazione?', viewName:'Nome vista', currentView:'Vista attuale', zoom:'Zoom', osm:'Mappa', satellite:'Satellite', topo:'Topografico', sidebar:'Barra laterale', fitAll:'Mostra tutto', myLocation:'La mia posizione', nameRequired:'Nome richiesto', coordRequired:'Coordinate richieste', search:'Cerca', total:'Totale' }
  };

    function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }
    const locale = ref(getLocale());
    function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }
    function getToken() { try { return localStorage.getItem('auth_token') || ''; } catch { return ''; } }
    function authHeaders() { return { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }

    // State
    const markers = ref([]);
    const savedViews = ref([]);
    const sidebarTab = ref('markers');
    const drawerOpen = ref(false);
    const activeLayer = ref(localStorage.getItem('map_active_layer') || 'osm');
    const search = ref('');
    const placing = ref(false);

    // Marker form
    const showForm = ref(false);
    const editingId = ref(null);
    const form = reactive({ name: '', description: '', lat: 0, lon: 0, color: '#e74c3c', icon: '📍' });
    const formError = ref('');

    // View form
    const showViewForm = ref(false);
    const viewFormName = ref('');

    // Icons
    const markerIcons = ['📍', '🏠', '🏢', '🏭', '🏥', '🏫', '⛪', '🏪', '🏨', '⭐', '🔴', '🔵', '🟢', '🟡', '🟠', '🟣', '⚫', '⚪', '🚩', '📌', '🎯', '💎', '🌲', '🌊', '⛰️', '🏔️'];

    // OL references
    let map = null;
    let markerLayer = null;
    let markerSource = null;
    let tileLayerOSM = null;
    let tileLayerSat = null;
    let tileLayerTopo = null;

    const LAYER_CONFIGS = {
      osm: () => new ol.source.OSM(),
      satellite: () => new ol.source.XYZ({ url: 'http://mt{0-3}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}' }),
      topo: () => new ol.source.XYZ({ url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png', attributions: '© OpenTopoMap' })
    };

    // Data loading
    async function loadData() {
      try {
        const r = await fetch('/api/map/data', { headers: authHeaders() });
        if (r.ok) {
          const d = await r.json();
          markers.value = d.markers || [];
          savedViews.value = d.views || [];
          renderMarkers();
        }
      } catch (e) { console.error('Load map data error', e); }
    }

    // Marker rendering on map
    function renderMarkers() {
      if (!markerSource) return;
      markerSource.clear();
      markers.value.forEach(m => {
        const f = new ol.Feature({
          geometry: new ol.geom.Point(ol.proj.fromLonLat([m.lon, m.lat])),
          markerId: m.id, markerData: m
        });
        f.setStyle(createMarkerStyle(m));
        markerSource.addFeature(f);
      });
    }

    function createMarkerStyle(m) {
      return new ol.style.Style({
        image: new ol.style.Circle({
          radius: 8,
          fill: new ol.style.Fill({ color: m.color || '#e74c3c' }),
          stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
        }),
        text: new ol.style.Text({
          text: m.icon || '📍',
          font: '16px sans-serif',
          offsetY: -20,
          fill: new ol.style.Fill({ color: '#fff' }),
          stroke: new ol.style.Stroke({ color: 'rgba(0,0,0,.6)', width: 3 })
        })
      });
    }

    // Form actions
    function openNewMarker() {
      editingId.value = null;
      form.name = ''; form.description = ''; form.lat = 0; form.lon = 0;
      form.color = '#e74c3c'; form.icon = '📍';
      formError.value = '';
      showForm.value = true;
      placing.value = true;
    }

    function openEditMarker(m) {
      editingId.value = m.id;
      form.name = m.name; form.description = m.description || '';
      form.lat = m.lat; form.lon = m.lon;
      form.color = m.color || '#e74c3c'; form.icon = m.icon || '📍';
      formError.value = '';
      showForm.value = true;
      placing.value = false;
    }

    function cancelForm() {
      showForm.value = false; placing.value = false; editingId.value = null;
    }

    async function saveMarker() {
      if (!form.name.trim()) { formError.value = L('nameRequired'); return; }
      if (!form.lat && !form.lon) { formError.value = L('coordRequired'); return; }
      const body = {
        name: form.name.trim(), description: form.description.trim(),
        lat: form.lat, lon: form.lon, color: form.color, icon: form.icon
      };
      try {
        if (editingId.value) {
          await fetch('/api/map/markers/' + editingId.value, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) });
        } else {
          await fetch('/api/map/markers', { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
        }
        cancelForm();
        await loadData();
      } catch (e) { console.error('Save marker error', e); }
    }

    async function deleteMarker(id) {
      try { await ElMessageBox.confirm(L('deleteConfirm'), { confirmButtonText: 'OK', cancelButtonText: L('cancel') || 'Cancel', type: 'warning' }); } catch { return; }
      try {
        await fetch('/api/map/markers/' + id, { method: 'DELETE', headers: authHeaders() });
        await loadData();
      } catch (e) { console.error('Delete marker error', e); }
    }

    function flyToMarker(m) {
      if (!map) return;
      map.getView().animate({ center: ol.proj.fromLonLat([m.lon, m.lat]), zoom: 14, duration: 800 });
    }

    // Views
    function openSaveView() {
      viewFormName.value = '';
      showViewForm.value = true;
    }

    async function saveView() {
      if (!viewFormName.value.trim()) return;
      const c = ol.proj.toLonLat(map.getView().getCenter());
      const body = {
        name: viewFormName.value.trim(),
        center: { lat: c[1], lon: c[0] },
        zoom: map.getView().getZoom(),
        layer: activeLayer.value
      };
      try {
        await fetch('/api/map/views', { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
        showViewForm.value = false;
        await loadData();
      } catch (e) { console.error('Save view error', e); }
    }

    async function deleteView(id) {
      try { await ElMessageBox.confirm(L('deleteConfirm'), { confirmButtonText: 'OK', cancelButtonText: L('cancel') || 'Cancel', type: 'warning' }); } catch { return; }
      try {
        await fetch('/api/map/views/' + id, { method: 'DELETE', headers: authHeaders() });
        await loadData();
      } catch (e) { console.error('Delete view error', e); }
    }

    function goToView(v) {
      if (!map) return;
      if (v.layer && v.layer !== activeLayer.value) {
        activeLayer.value = v.layer;
        switchLayer(v.layer);
      }
      map.getView().animate({
        center: ol.proj.fromLonLat([v.center.lon, v.center.lat]),
        zoom: v.zoom || 6,
        duration: 800
      });
    }

    // Layer switching
    function switchLayer(id) {
      activeLayer.value = id;
      try { localStorage.setItem('map_active_layer', id); } catch {}
      if (!map) return;
      [tileLayerOSM, tileLayerSat, tileLayerTopo].forEach(l => { if (l) l.setVisible(false); });
      if (id === 'osm' && tileLayerOSM) tileLayerOSM.setVisible(true);
      else if (id === 'satellite' && tileLayerSat) tileLayerSat.setVisible(true);
      else if (id === 'topo' && tileLayerTopo) tileLayerTopo.setVisible(true);
    }

    function fitAll() {
      if (!markerSource || markerSource.getFeatures().length === 0) return;
      const extent = markerSource.getExtent();
      map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 800, maxZoom: 15 });
    }

    function goToMyLocation() {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(pos => {
        map.getView().animate({
          center: ol.proj.fromLonLat([pos.coords.longitude, pos.coords.latitude]),
          zoom: 14, duration: 800
        });
      });
    }

    function onDrawerChange() {
      setTimeout(() => { if (map) map.updateSize(); }, 350);
    }

    function openDrawer() {
      drawerOpen.value = true;
      onDrawerChange();
    }
    function closeDrawer() {
      drawerOpen.value = false;
      onDrawerChange();
    }
    function onAppMouseMove(e) {
      if (!drawerOpen.value && e.clientX - e.currentTarget.getBoundingClientRect().left <= 6) {
        openDrawer();
      }
    }

    // Filtered markers
    const filteredMarkers = computed(() => {
      if (!search.value) return markers.value;
      const s = search.value.toLowerCase();
      return markers.value.filter(m =>
        (m.name || '').toLowerCase().includes(s) ||
        (m.description || '').toLowerCase().includes(s)
      );
    });

    // Setup map
    let mapContainer = null;
    let tooltipOverlay = null;
    function onLocaleChanged(e) { locale.value = e.detail || getLocale(); }

    function initMap() {
      const container = document.getElementById('map-app-container');
      if (!container) return;
      mapContainer = container;

      markerSource = new ol.source.Vector();
      markerLayer = new ol.layer.Vector({ source: markerSource, zIndex: 10 });

      tileLayerOSM = new ol.layer.Tile({ source: LAYER_CONFIGS.osm(), visible: activeLayer.value === 'osm' });
      tileLayerSat = new ol.layer.Tile({ source: LAYER_CONFIGS.satellite(), visible: activeLayer.value === 'satellite' });
      tileLayerTopo = new ol.layer.Tile({ source: LAYER_CONFIGS.topo(), visible: activeLayer.value === 'topo' });

      const tooltipEl = document.getElementById('map-app-tooltip');

      map = new ol.Map({
        target: container,
        layers: [tileLayerOSM, tileLayerSat, tileLayerTopo, markerLayer],
        view: new ol.View({
          center: ol.proj.fromLonLat([35, 39]),
          zoom: 6
        }),
        controls: ol.control.defaults.defaults().extend([
          new ol.control.ScaleLine()
        ])
      });

      if (tooltipEl) {
        tooltipOverlay = new ol.Overlay({ element: tooltipEl, offset: [12, 0], positioning: 'bottom-left' });
        map.addOverlay(tooltipOverlay);
      }

      // Click to place marker or click existing marker
      map.on('click', (evt) => {
        if (placing.value) {
          const coord = ol.proj.toLonLat(evt.coordinate);
          form.lon = Math.round(coord[0] * 1000000) / 1000000;
          form.lat = Math.round(coord[1] * 1000000) / 1000000;
          placing.value = false;
          return;
        }

        let clicked = false;
        map.forEachFeatureAtPixel(evt.pixel, (feature) => {
          if (clicked) return;
          const md = feature.get('markerData');
          if (md) { openEditMarker(md); clicked = true; }
        });
      });

      // Hover tooltip
      map.on('pointermove', (evt) => {
        if (!tooltipEl) return;
        tooltipEl.style.display = 'none';
        map.forEachFeatureAtPixel(evt.pixel, (feature) => {
          const md = feature.get('markerData');
          if (md) {
            let text = md.icon + ' ' + md.name;
            if (md.description) text += '\n' + md.description;
            text += '\n' + md.lat.toFixed(5) + ', ' + md.lon.toFixed(5);
            tooltipEl.innerText = text;
            tooltipOverlay.setPosition(evt.coordinate);
            tooltipEl.style.display = 'block';
          }
        });
        // Cursor
        const hit = map.hasFeatureAtPixel(evt.pixel);
        container.style.cursor = placing.value ? 'crosshair' : (hit ? 'pointer' : '');
      });

      renderMarkers();
    }

    onMounted(async () => {
      await loadData();
      window.addEventListener('locale-changed', onLocaleChanged);
      await nextTick();
      setTimeout(initMap, 100);
      // Intro: briefly open drawer then close to hint its existence
      setTimeout(() => { drawerOpen.value = true; onDrawerChange(); }, 600);
      setTimeout(() => { drawerOpen.value = false; onDrawerChange(); }, 2200);
    });

    onUnmounted(() => {
      window.removeEventListener('locale-changed', onLocaleChanged)if (map) { map.setTarget(null); map = null; }
    });

    return {
      L, markers, savedViews, sidebarTab, drawerOpen, activeLayer, search, placing,
      showForm, editingId, form, formError, showViewForm, viewFormName, markerIcons,
      filteredMarkers, onDrawerChange, openDrawer, closeDrawer, onAppMouseMove,
      openNewMarker, openEditMarker, cancelForm, saveMarker, deleteMarker, flyToMarker,
      openSaveView, saveView, deleteView, goToView,
      switchLayer, fitAll, goToMyLocation
    };
  }
})
