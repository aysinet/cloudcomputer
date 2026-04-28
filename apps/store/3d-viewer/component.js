(function(Vue) {
  const { ref, onMounted, onUnmounted, nextTick } = Vue;

  const LANGS = {
    tr: {
      open: 'Dosya Aç', openServer: 'Sunucudan Aç', openClient: 'Bilgisayardan Aç',
      dropText: '3D model dosyasını sürükleyin', dropSub: 'GLB, GLTF, OBJ, FBX, STL desteklenir',
      loading: 'Yükleniyor...', play: 'Oynat', autoRotate: 'Otomatik Döndür',
      resetView: 'Görünümü Sıfırla', wireframe: 'Tel Kafes', bgToggle: 'Arkaplan',
      vertices: 'Köşe', faces: 'Yüz', animations: 'Animasyonlar',
      loadError: 'Model yüklenemedi', formatError: 'Desteklenmeyen dosya formatı'
    },
    en: {
      open: 'Open File', openServer: 'Open from Server', openClient: 'Open from Computer',
      dropText: 'Drag & drop a 3D model file', dropSub: 'GLB, GLTF, OBJ, FBX, STL supported',
      loading: 'Loading...', play: 'Play', autoRotate: 'Auto Rotate',
      resetView: 'Reset View', wireframe: 'Wireframe', bgToggle: 'Background',
      vertices: 'Vertices', faces: 'Faces', animations: 'Animations',
      loadError: 'Failed to load model', formatError: 'Unsupported file format'
    },
    de: {
      open: 'Datei öffnen', openServer: 'Vom Server öffnen', openClient: 'Vom Computer öffnen',
      dropText: '3D-Modelldatei hierher ziehen', dropSub: 'GLB, GLTF, OBJ, FBX, STL unterstützt',
      loading: 'Wird geladen...', play: 'Abspielen', autoRotate: 'Automatisch drehen',
      resetView: 'Ansicht zurücksetzen', wireframe: 'Drahtgitter', bgToggle: 'Hintergrund',
      vertices: 'Eckpunkte', faces: 'Flächen', animations: 'Animationen',
      loadError: 'Modell konnte nicht geladen werden', formatError: 'Nicht unterstütztes Dateiformat'
    },
    fr: {
      open: 'Ouvrir', openServer: 'Ouvrir depuis le serveur', openClient: 'Ouvrir depuis l\'ordinateur',
      dropText: 'Glissez-déposez un fichier 3D', dropSub: 'GLB, GLTF, OBJ, FBX, STL pris en charge',
      loading: 'Chargement...', play: 'Lancer', autoRotate: 'Rotation auto',
      resetView: 'Réinitialiser la vue', wireframe: 'Fil de fer', bgToggle: 'Arrière-plan',
      vertices: 'Sommets', faces: 'Faces', animations: 'Animations',
      loadError: 'Échec du chargement', formatError: 'Format de fichier non pris en charge'
    },
    es: {
      open: 'Abrir', openServer: 'Abrir desde servidor', openClient: 'Abrir desde ordenador',
      dropText: 'Arrastre un archivo de modelo 3D', dropSub: 'GLB, GLTF, OBJ, FBX, STL soportados',
      loading: 'Cargando...', play: 'Reproducir', autoRotate: 'Rotar automáticamente',
      resetView: 'Restablecer vista', wireframe: 'Malla', bgToggle: 'Fondo',
      vertices: 'Vértices', faces: 'Caras', animations: 'Animaciones',
      loadError: 'Error al cargar el modelo', formatError: 'Formato no soportado'
    },
    ru: {
      open: 'Открыть', openServer: 'Открыть с сервера', openClient: 'Открыть с компьютера',
      dropText: 'Перетащите 3D-модель', dropSub: 'Поддерживаются GLB, GLTF, OBJ, FBX, STL',
      loading: 'Загрузка...', play: 'Воспроизвести', autoRotate: 'Автовращение',
      resetView: 'Сбросить вид', wireframe: 'Каркас', bgToggle: 'Фон',
      vertices: 'Вершины', faces: 'Грани', animations: 'Анимации',
      loadError: 'Не удалось загрузить модель', formatError: 'Неподдерживаемый формат'
    },
    zh: {
      open: '打开文件', openServer: '从服务器打开', openClient: '从本地打开',
      dropText: '拖放3D模型文件', dropSub: '支持 GLB、GLTF、OBJ、FBX、STL',
      loading: '加载中...', play: '播放', autoRotate: '自动旋转',
      resetView: '重置视图', wireframe: '线框', bgToggle: '背景',
      vertices: '顶点', faces: '面', animations: '动画',
      loadError: '加载模型失败', formatError: '不支持的文件格式'
    },
    ja: {
      open: 'ファイルを開く', openServer: 'サーバーから開く', openClient: 'コンピューターから開く',
      dropText: '3Dモデルファイルをドラッグ＆ドロップ', dropSub: 'GLB、GLTF、OBJ、FBX、STL対応',
      loading: '読み込み中...', play: '再生', autoRotate: '自動回転',
      resetView: 'ビューリセット', wireframe: 'ワイヤーフレーム', bgToggle: '背景',
      vertices: '頂点', faces: '面', animations: 'アニメーション',
      loadError: 'モデルの読み込みに失敗', formatError: 'サポートされていないファイル形式'
    },
    it: {
      open: 'Apri file', openServer: 'Apri dal server', openClient: 'Apri dal computer',
      dropText: 'Trascina un file modello 3D', dropSub: 'GLB, GLTF, OBJ, FBX, STL supportati',
      loading: 'Caricamento...', play: 'Riproduci', autoRotate: 'Rotazione automatica',
      resetView: 'Reimposta vista', wireframe: 'Wireframe', bgToggle: 'Sfondo',
      vertices: 'Vertici', faces: 'Facce', animations: 'Animazioni',
      loadError: 'Impossibile caricare il modello', formatError: 'Formato file non supportato'
    },
    ar: {
      open: 'فتح ملف', openServer: 'فتح من الخادم', openClient: 'فتح من الحاسوب',
      dropText: 'اسحب وأفلت ملف نموذج ثلاثي الأبعاد', dropSub: 'يدعم GLB، GLTF، OBJ، FBX، STL',
      loading: 'جاري التحميل...', play: 'تشغيل', autoRotate: 'دوران تلقائي',
      resetView: 'إعادة تعيين العرض', wireframe: 'إطار سلكي', bgToggle: 'الخلفية',
      vertices: 'رؤوس', faces: 'أوجه', animations: 'رسوم متحركة',
      loadError: 'فشل تحميل النموذج', formatError: 'تنسيق ملف غير مدعوم'
    },
    ko: {
      open: '파일 열기', openServer: '서버에서 열기', openClient: '컴퓨터에서 열기',
      dropText: '3D 모델 파일을 끌어다 놓으세요', dropSub: 'GLB, GLTF, OBJ, FBX, STL 지원',
      loading: '로딩 중...', play: '재생', autoRotate: '자동 회전',
      resetView: '뷰 초기화', wireframe: '와이어프레임', bgToggle: '배경',
      vertices: '꼭짓점', faces: '면', animations: '애니메이션',
      loadError: '모델 로드 실패', formatError: '지원되지 않는 파일 형식'
    },
    hi: {
      open: 'फ़ाइल खोलें', openServer: 'सर्वर से खोलें', openClient: 'कंप्यूटर से खोलें',
      dropText: '3D मॉडल फ़ाइल खींचकर छोड़ें', dropSub: 'GLB, GLTF, OBJ, FBX, STL समर्थित',
      loading: 'लोड हो रहा है...', play: 'चलाएं', autoRotate: 'ऑटो घुमाएं',
      resetView: 'दृश्य रीसेट करें', wireframe: 'वायरफ़्रेम', bgToggle: 'पृष्ठभूमि',
      vertices: 'शीर्ष', faces: 'फ़ेस', animations: 'एनिमेशन',
      loadError: 'मॉडल लोड करने में विफल', formatError: 'असमर्थित फ़ाइल प्रारूप'
    },
    pt: {
      open: 'Abrir Arquivo', openServer: 'Abrir do servidor', openClient: 'Abrir do computador',
      dropText: 'Arraste e solte um arquivo de modelo 3D', dropSub: 'GLB, GLTF, OBJ, FBX, STL suportados',
      loading: 'Carregando...', play: 'Reproduzir', autoRotate: 'Rotação Automática',
      resetView: 'Redefinir Vista', wireframe: 'Wireframe', bgToggle: 'Fundo',
      vertices: 'Vértices', faces: 'Faces', animations: 'Animações',
      loadError: 'Falha ao carregar modelo', formatError: 'Formato de arquivo não suportado'
    }
  };

  /* ── CDN URLs ── */
  const THREE_CDN = 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.min.js';
  const ORBIT_CDN = 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/controls/OrbitControls.js';
  const GLTF_CDN  = 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/loaders/GLTFLoader.js';
  const DRACO_CDN = 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/loaders/DRACOLoader.js';
  const OBJ_CDN   = 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/loaders/OBJLoader.js';
  const STL_CDN   = 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/loaders/STLLoader.js';
  const FBX_CDN   = 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/loaders/FBXLoader.js';
  const FFLATE_CDN = 'https://cdn.jsdelivr.net/npm/fflate@0.8.2/esm/browser.js';

  function getLocale() {
    try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; }
  }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      const canvasWrap = ref(null);
      const canvas3d = ref(null);
      const fileInput = ref(null);

      const modelName = ref('');
      const modelLoaded = ref(false);
      const loading = ref(false);
      const loadProgress = ref(0);
      const loadError = ref('');
      const wireframe = ref(false);
      const autoRotate = ref(false);
      const dragover = ref(false);

      const vertexCount = ref(0);
      const faceCount = ref(0);
      const animationNames = ref([]);
      const currentAnim = ref('');
      const animPaused = ref(false);

      let THREE, scene, camera, renderer, controls, mixer, clock, currentModel;
      let animFrameId = null;
      let bgIndex = 0;
      const BG_COLORS = [0x1a1a2e, 0x2d2d2d, 0x404040, 0xf0f0f0, 0xffffff, 0x0a0a0a];

      /* ── Load Three.js modules ── */
      let threeModules = null;
      async function loadThree() {
        if (threeModules) return threeModules;
        const [threeModule, orbitModule, gltfModule, dracoModule, objModule, stlModule] = await Promise.all([
          import(THREE_CDN),
          import(ORBIT_CDN),
          import(GLTF_CDN),
          import(DRACO_CDN),
          import(OBJ_CDN),
          import(STL_CDN)
        ]);
        THREE = threeModule;
        threeModules = { THREE: threeModule, OrbitControls: orbitModule.OrbitControls, GLTFLoader: gltfModule.GLTFLoader, DRACOLoader: dracoModule.DRACOLoader, OBJLoader: objModule.OBJLoader, STLLoader: stlModule.STLLoader };
        return threeModules;
      }

      /* ── Scene Setup ── */
      function initScene() {
        const wrap = canvasWrap.value;
        const cvs = canvas3d.value;
        if (!wrap || !cvs) return;

        scene = new THREE.Scene();
        scene.background = new THREE.Color(BG_COLORS[0]);

        camera = new THREE.PerspectiveCamera(50, wrap.clientWidth / wrap.clientHeight, 0.01, 1000);
        camera.position.set(0, 1.5, 3);

        renderer = new THREE.WebGLRenderer({ canvas: cvs, antialias: true, alpha: false });
        renderer.setSize(wrap.clientWidth, wrap.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        controls = new threeModules.OrbitControls(camera, cvs);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.enablePan = true;
        controls.autoRotate = false;
        controls.autoRotateSpeed = 2.0;
        controls.minDistance = 0.1;
        controls.maxDistance = 100;

        // Lights
        const ambLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(5, 10, 7);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        scene.add(dirLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
        fillLight.position.set(-5, 3, -5);
        scene.add(fillLight);

        // Grid helper
        const grid = new THREE.GridHelper(10, 20, 0x444444, 0x333333);
        grid.material.opacity = 0.3;
        grid.material.transparent = true;
        scene.add(grid);

        clock = new THREE.Clock();
        animate();
      }

      function animate() {
        animFrameId = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        if (mixer && !animPaused.value) mixer.update(delta);
        controls.update();
        renderer.render(scene, camera);
      }

      /* ── Resize handler ── */
      let resizeObserver;
      function setupResize() {
        const wrap = canvasWrap.value;
        if (!wrap) return;
        resizeObserver = new ResizeObserver(() => {
          if (!renderer || !camera) return;
          const w = wrap.clientWidth;
          const h = wrap.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        });
        resizeObserver.observe(wrap);
      }

      /* ── Model Loading ── */
      function clearModel() {
        if (currentModel) {
          scene.remove(currentModel);
          currentModel.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
              else child.material.dispose();
            }
          });
          currentModel = null;
        }
        if (mixer) { mixer.stopAllAction(); mixer = null; }
        animationNames.value = [];
        currentAnim.value = '';
        vertexCount.value = 0;
        faceCount.value = 0;
        modelLoaded.value = false;
      }

      function fitCameraToModel(object) {
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const dist = maxDim * 1.8;

        camera.position.set(center.x + dist * 0.5, center.y + dist * 0.4, center.z + dist);
        camera.lookAt(center);
        controls.target.copy(center);
        controls.update();
      }

      function countGeometry(object) {
        let verts = 0, faces = 0;
        object.traverse(child => {
          if (child.isMesh && child.geometry) {
            const geo = child.geometry;
            if (geo.attributes.position) verts += geo.attributes.position.count;
            if (geo.index) faces += geo.index.count / 3;
            else if (geo.attributes.position) faces += geo.attributes.position.count / 3;
          }
        });
        vertexCount.value = verts.toLocaleString();
        faceCount.value = Math.floor(faces).toLocaleString();
      }

      function addModelToScene(object, animations) {
        clearModel();
        currentModel = object;
        scene.add(object);
        fitCameraToModel(object);
        countGeometry(object);

        if (animations && animations.length) {
          mixer = new THREE.AnimationMixer(object);
          animationNames.value = animations.map(a => a.name || 'Animation');
          currentAnim.value = animationNames.value[0];
          mixer.clipAction(animations[0]).play();
          animPaused.value = false;
        }

        modelLoaded.value = true;
        loading.value = false;
        loadError.value = '';
      }

      async function loadModel(file) {
        loading.value = true;
        loadProgress.value = 0;
        loadError.value = '';
        modelName.value = file.name;

        try {
          await loadThree();
          if (!scene) initScene();

          const ext = file.name.split('.').pop().toLowerCase();
          const url = URL.createObjectURL(file);

          const onProgress = (e) => {
            if (e.total) loadProgress.value = Math.round((e.loaded / e.total) * 100);
          };

          if (ext === 'glb' || ext === 'gltf') {
            const loader = new threeModules.GLTFLoader();
            const dracoLoader = new threeModules.DRACOLoader();
            dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/libs/draco/');
            loader.setDRACOLoader(dracoLoader);
            loader.load(url, (gltf) => {
              URL.revokeObjectURL(url);
              addModelToScene(gltf.scene, gltf.animations);
            }, onProgress, (err) => {
              URL.revokeObjectURL(url);
              loading.value = false;
              loadError.value = L('loadError');
            });
          } else if (ext === 'obj') {
            const loader = new threeModules.OBJLoader();
            loader.load(url, (obj) => {
              URL.revokeObjectURL(url);
              obj.traverse(child => {
                if (child.isMesh) {
                  child.material = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5, metalness: 0.3 });
                }
              });
              addModelToScene(obj, []);
            }, onProgress, () => {
              URL.revokeObjectURL(url);
              loading.value = false;
              loadError.value = L('loadError');
            });
          } else if (ext === 'stl') {
            const loader = new threeModules.STLLoader();
            loader.load(url, (geometry) => {
              URL.revokeObjectURL(url);
              const material = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5, metalness: 0.3 });
              const mesh = new THREE.Mesh(geometry, material);
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              const group = new THREE.Group();
              group.add(mesh);
              addModelToScene(group, []);
            }, onProgress, () => {
              URL.revokeObjectURL(url);
              loading.value = false;
              loadError.value = L('loadError');
            });
          } else if (ext === 'fbx') {
            try {
              const fbxModule = await import(FBX_CDN);
              const loader = new fbxModule.FBXLoader();
              loader.load(url, (fbx) => {
                URL.revokeObjectURL(url);
                addModelToScene(fbx, fbx.animations || []);
              }, onProgress, () => {
                URL.revokeObjectURL(url);
                loading.value = false;
                loadError.value = L('loadError');
              });
            } catch {
              URL.revokeObjectURL(url);
              loading.value = false;
              loadError.value = L('loadError');
            }
          } else {
            URL.revokeObjectURL(url);
            loading.value = false;
            loadError.value = L('formatError');
          }
        } catch (err) {
          loading.value = false;
          loadError.value = L('loadError');
        }
      }

      /* ── UI Actions ── */
      function getAuthHeaders() {
        const token = localStorage.getItem('auth_token') || '';
        return { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };
      }

      function openFile() { fileInput.value?.click(); }

      async function openFromServer() {
        if (!window.FileDialog) return;
        try {
          const result = await window.FileDialog.open({
            title: '📂 ' + L('openServer'),
            filters: [{ label: '3D Models', extensions: ['glb', 'gltf', 'obj', 'stl', 'fbx'] }, { label: 'All Files', extensions: ['*'] }]
          });
          if (!result) return;
          loading.value = true;
          loadProgress.value = 0;
          loadError.value = '';
          modelName.value = result.name;

          const r = await fetch('/api/fs/read-binary?path=' + encodeURIComponent(result.path), {
            headers: getAuthHeaders()
          });
          if (!r.ok) { loading.value = false; loadError.value = L('loadError'); return; }
          const data = await r.json();
          const binary = atob(data.content);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          const blob = new Blob([bytes]);
          const file = new File([blob], result.name);
          await loadModel(file);
        } catch {
          loading.value = false;
          loadError.value = L('loadError');
        }
      }

      function onFileSelected(e) {
        const file = e.target?.files?.[0];
        if (file) loadModel(file);
        e.target.value = '';
      }
      function onDrop(e) {
        dragover.value = false;
        const file = e.dataTransfer?.files?.[0];
        if (file) loadModel(file);
      }

      function toggleWireframe() {
        wireframe.value = !wireframe.value;
        if (currentModel) {
          currentModel.traverse(child => {
            if (child.isMesh && child.material) {
              if (Array.isArray(child.material)) child.material.forEach(m => { m.wireframe = wireframe.value; });
              else child.material.wireframe = wireframe.value;
            }
          });
        }
      }

      function toggleAutoRotate() {
        autoRotate.value = !autoRotate.value;
        if (controls) controls.autoRotate = autoRotate.value;
      }

      function resetCamera() {
        if (currentModel) fitCameraToModel(currentModel);
        else if (camera) {
          camera.position.set(0, 1.5, 3);
          controls.target.set(0, 0, 0);
          controls.update();
        }
      }

      function zoomIn() { if (camera) { camera.position.multiplyScalar(0.85); controls.update(); } }
      function zoomOut() { if (camera) { camera.position.multiplyScalar(1.18); controls.update(); } }

      function toggleBg() {
        bgIndex = (bgIndex + 1) % BG_COLORS.length;
        if (scene) scene.background = new THREE.Color(BG_COLORS[bgIndex]);
      }

      function playAnimation() {
        if (!mixer || !currentModel) return;
        mixer.stopAllAction();
        const idx = animationNames.value.indexOf(currentAnim.value);
        if (idx >= 0) {
          const clips = [];
          currentModel.traverse(() => {});
          // get clips from gltf
          if (mixer._root && mixer._root.animations) {
            mixer.clipAction(mixer._root.animations[idx]).play();
          }
        }
        animPaused.value = false;
      }

      function toggleAnimPause() {
        animPaused.value = !animPaused.value;
      }

      onMounted(async () => {
        await nextTick();
        try {
          await loadThree();
          initScene();
          setupResize();
        } catch {}
        window.addEventListener('storage', (e) => {
          if (e.key === 'sys_locale') locale.value = e.newValue || 'tr';
        });
      });

      onUnmounted(() => {
        if (animFrameId) cancelAnimationFrame(animFrameId);
        if (resizeObserver) resizeObserver.disconnect();
        if (renderer) { renderer.dispose(); renderer = null; }
        if (controls) { controls.dispose(); controls = null; }
        clearModel();
      });

      return {
        L, canvasWrap, canvas3d, fileInput,
        modelName, modelLoaded, loading, loadProgress, loadError,
        wireframe, autoRotate, dragover,
        vertexCount, faceCount, animationNames, currentAnim, animPaused,
        openFile, openFromServer, onFileSelected, onDrop,
        toggleWireframe, toggleAutoRotate, resetCamera,
        zoomIn, zoomOut, toggleBg, playAnimation, toggleAnimPause
      };
    }
  };
})(Vue);
