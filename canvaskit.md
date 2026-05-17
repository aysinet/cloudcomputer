# CanvasKit WASM — Cloud Computer Uygulama Geliştirme Rehberi

## CanvasKit Nedir?

CanvasKit, Google Skia grafik motorunun WebAssembly derlemesidir. HTML Canvas2D API'den çok daha güçlü 2D grafik özellikleri sunar: GPU hızlandırmalı render, paragraf şekillendirme, Lottie animasyonları, runtime shader efektleri, path operasyonları ve daha fazlası.

---

## CDN Kaynakları

| CDN | JS | WASM (locateFile) |
|-----|----|--------------------|
| **unpkg** | `https://unpkg.com/canvaskit-wasm@0.41.1/bin/canvaskit.js` | `https://unpkg.com/canvaskit-wasm@0.41.1/bin/` |
| **jsDelivr** | `https://cdn.jsdelivr.net/npm/canvaskit-wasm@0.41.1/bin/canvaskit.js` | `https://cdn.jsdelivr.net/npm/canvaskit-wasm@0.41.1/bin/` |

> **Not:** `locateFile` callback'i ile `.wasm` dosyasının yolu belirtilmelidir. WASM binary ~7-8 MB (gzip'li) olduğundan lazy loading tercih edilmelidir.

---

## Cloud Computer Plugin Yapısı ile Entegrasyon

### Dosya Yapısı

```
apps/store/{app-id}/
├── app.json          # Uygulama manifest
├── component.js      # Vue 3 bileşeni (IIFE — CanvasKit yükleme + çizim mantığı)
├── template.html     # Vue template (canvas elemanı burada)
├── style.css         # Uygulama stilleri
├── server.js         # Backend plugin (opsiyonel — veri kaydetme/yükleme)
└── packages.json     # Sunucu bağımlılıkları (opsiyonel)
```

### app.json

```json
{
  "id": "my-canvas-app",
  "name": "My Canvas App",
  "icon": "🎨",
  "color": "linear-gradient(135deg, #6366f1, #8b5cf6)",
  "type": "internal",
  "size": { "w": 900, "h": 640 },
  "description": "CanvasKit WASM ile gelişmiş 2D grafik uygulaması",
  "category": "creative",
  "lang": {
    "tr": { "name": "Canvas Uygulamam", "description": "CanvasKit WASM ile gelişmiş 2D grafik uygulaması" },
    "en": { "name": "My Canvas App", "description": "Advanced 2D graphics app with CanvasKit WASM" }
  }
}
```

---

## template.html Şablonu

```html
<div class="my-canvas-app-root">
  <div class="my-canvas-app-toolbar">
    <button @click="clear">🗑️ {{L('clear')}}</button>
    <button @click="save">💾 {{L('save')}}</button>
    <span v-if="loading" class="my-canvas-app-loading">⏳ {{L('loading')}}</span>
  </div>
  <div class="my-canvas-app-canvas-wrap" ref="canvasWrap">
    <canvas ref="mainCanvas" :width="canvasWidth" :height="canvasHeight"></canvas>
  </div>
</div>
```

---

## component.js — CanvasKit Yükleme Deseni

CanvasKit'i CDN'den dinamik script injection ile yükleyin. Bu yöntem projedeki mevcut desenle (pdf.js, monaco gibi) tutarlıdır.

```javascript
(function(Vue) {
  const { ref, onMounted, onUnmounted, nextTick, watch } = Vue;

  const CK_VERSION = '0.41.1';
  const CK_CDN = `https://unpkg.com/canvaskit-wasm@${CK_VERSION}/bin`;

  const LANGS = {
    tr: { loading: 'Yükleniyor...', clear: 'Temizle', save: 'Kaydet', loadError: 'CanvasKit yüklenemedi' },
    en: { loading: 'Loading...', clear: 'Clear', save: 'Save', loadError: 'Failed to load CanvasKit' }
  };

  function getLocale() {
    try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; }
  }

  // CanvasKit global olarak bir kez yüklenir, birden fazla uygulama penceresi açılsa bile
  let ckPromise = null;
  function loadCanvasKit() {
    if (ckPromise) return ckPromise;
    ckPromise = new Promise((resolve, reject) => {
      if (window.CanvasKitInit) {
        // Zaten yüklü
        window.CanvasKitInit({ locateFile: (f) => `${CK_CDN}/${f}` })
          .then(resolve).catch(reject);
        return;
      }
      const script = document.createElement('script');
      script.src = `${CK_CDN}/canvaskit.js`;
      script.onload = () => {
        window.CanvasKitInit({ locateFile: (f) => `${CK_CDN}/${f}` })
          .then(resolve).catch(reject);
      };
      script.onerror = () => reject(new Error('CanvasKit script load failed'));
      document.head.appendChild(script);
    });
    return ckPromise;
  }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      const loading = ref(true);
      const mainCanvas = ref(null);
      const canvasWrap = ref(null);
      const canvasWidth = ref(800);
      const canvasHeight = ref(560);

      let CanvasKit = null;
      let surface = null;

      // ---------- CanvasKit başlatma ----------
      async function initCanvasKit() {
        try {
          CanvasKit = await loadCanvasKit();
          await nextTick();
          if (!mainCanvas.value) return;
          surface = CanvasKit.MakeCanvasSurface(mainCanvas.value);
          if (!surface) {
            // WebGL desteklenmiyorsa yazılım render
            surface = CanvasKit.MakeSWCanvasSurface(mainCanvas.value);
          }
          loading.value = false;
          drawFrame(); // İlk çizim
        } catch (e) {
          console.error('CanvasKit init failed:', e);
          loading.value = false;
        }
      }

      // ---------- Çizim döngüsü ----------
      function drawFrame() {
        if (!surface || !CanvasKit) return;
        const canvas = surface.getCanvas();
        canvas.clear(CanvasKit.WHITE);

        const paint = new CanvasKit.Paint();
        paint.setColor(CanvasKit.Color4f(0.2, 0.4, 0.9, 1.0));
        paint.setStyle(CanvasKit.PaintStyle.Fill);
        paint.setAntiAlias(true);

        // Örnek: Yuvarlak dikdörtgen çiz
        const rr = CanvasKit.RRectXY(
          CanvasKit.LTRBRect(50, 50, canvasWidth.value - 50, canvasHeight.value - 50),
          20, 20
        );
        canvas.drawRRect(rr, paint);
        paint.delete(); // WASM bellek yönetimi — zorunlu

        surface.flush();
      }

      // ---------- Animasyonlu çizim döngüsü (isteğe bağlı) ----------
      let animId = null;
      function startAnimLoop() {
        if (!surface) return;
        function frame(canvas) {
          // canvas.clear(...);
          // ... çizim komutları ...
          surface.requestAnimationFrame(frame);
        }
        surface.requestAnimationFrame(frame);
      }

      function stopAnimLoop() {
        // surface.requestAnimationFrame kullanıyorsanız
        // surface'ı delete etmek döngüyü durdurur
      }

      // ---------- Eylemler ----------
      function clear() {
        if (!surface || !CanvasKit) return;
        const canvas = surface.getCanvas();
        canvas.clear(CanvasKit.WHITE);
        surface.flush();
      }

      async function save() {
        if (!surface || !CanvasKit) return;
        // Canvas'ı PNG olarak dışa aktar
        const image = surface.makeImageSnapshot();
        const pngBytes = image.encodeToBytes(CanvasKit.ImageFormat.PNG, 100);
        image.delete();
        // Dosya sistemi API'si ile kaydet
        const token = localStorage.getItem('auth_token') || '';
        const blob = new Blob([pngBytes], { type: 'image/png' });
        const formData = new FormData();
        formData.append('file', blob, 'canvas-export.png');
        // ... /api/fs/write-binary endpoint'ine gönder
      }

      // ---------- Lifecycle ----------
      onMounted(() => {
        initCanvasKit();
        window.addEventListener('locale-changed', () => { locale.value = getLocale(); });
      });

      onUnmounted(() => {
        // WASM kaynaklarını temizle
        if (surface) { surface.delete(); surface = null; }
        // CanvasKit global kalır — diğer pencereler kullanıyor olabilir
      });

      return {
        locale, L, loading,
        mainCanvas, canvasWrap,
        canvasWidth, canvasHeight,
        clear, save
      };
    }
  };
})(Vue);
```

---

## CanvasKit Temel API Referansı

### Surface Oluşturma

```javascript
// GPU hızlandırmalı (varsayılan — WebGL2)
const surface = CanvasKit.MakeCanvasSurface(canvasElement);

// Yazılım tabanlı (fallback)
const surface = CanvasKit.MakeSWCanvasSurface(canvasElement);
```

### Çizim Nesneleri

```javascript
// Paint — renk, stil, çizgi kalınlığı
const paint = new CanvasKit.Paint();
paint.setColor(CanvasKit.Color4f(r, g, b, a));     // 0-1 arası float
paint.setColor(CanvasKit.Color(255, 0, 0, 255));    // 0-255 arası int
paint.setStyle(CanvasKit.PaintStyle.Fill);           // Fill | Stroke
paint.setStrokeWidth(3);
paint.setAntiAlias(true);
// İşiniz bitince: paint.delete();

// Path — vektör çizim
const path = new CanvasKit.Path();
path.moveTo(10, 10);
path.lineTo(100, 50);
path.quadTo(150, 80, 200, 10);   // Quadratic bezier
path.cubicTo(x1, y1, x2, y2, x3, y3);  // Cubic bezier
path.close();
canvas.drawPath(path, paint);
path.delete();
```

### Temel Çizim Komutları

```javascript
const canvas = surface.getCanvas();
canvas.clear(CanvasKit.WHITE);
canvas.drawRect(CanvasKit.LTRBRect(left, top, right, bottom), paint);
canvas.drawRRect(CanvasKit.RRectXY(rect, rx, ry), paint);
canvas.drawCircle(cx, cy, radius, paint);
canvas.drawLine(x1, y1, x2, y2, paint);
canvas.drawPath(path, paint);

// Dönüşümler
canvas.save();
canvas.translate(dx, dy);
canvas.rotate(degrees, cx, cy);
canvas.scale(sx, sy);
canvas.restore();
```

### Metin / Font

```javascript
// Font yükleme (ayrı fetch gerekli)
const fontData = await fetch('https://cdn.skia.org/misc/Roboto-Regular.ttf')
  .then(r => r.arrayBuffer());
const fontMgr = CanvasKit.FontMgr.FromData([fontData]);

// Paragraf oluşturma
const paraStyle = new CanvasKit.ParagraphStyle({
  textStyle: {
    color: CanvasKit.BLACK,
    fontFamilies: ['Roboto'],
    fontSize: 18,
  },
  textAlign: CanvasKit.TextAlign.Left,
});
const builder = CanvasKit.ParagraphBuilder.Make(paraStyle, fontMgr);
builder.addText('Merhaba Dünya!');
const paragraph = builder.build();
paragraph.layout(400); // Satır genişliği (px)
canvas.drawParagraph(paragraph, 10, 10);
paragraph.delete();
builder.delete();
fontMgr.delete();
```

### Görüntü Yükleme

```javascript
const imgData = await fetch('/path/to/image.png').then(r => r.arrayBuffer());
const image = CanvasKit.MakeImageFromEncoded(new Uint8Array(imgData));
canvas.drawImage(image, x, y, paint);
image.delete();
```

### PNG/JPEG Dışa Aktarma

```javascript
const snapshot = surface.makeImageSnapshot();
const pngBytes = snapshot.encodeToBytes(CanvasKit.ImageFormat.PNG, 100);
const jpegBytes = snapshot.encodeToBytes(CanvasKit.ImageFormat.JPEG, 85);
snapshot.delete();
```

### Lottie Animasyonu (Skottie)

```javascript
const lottieJson = await fetch('/path/to/anim.json').then(r => r.text());
const animation = CanvasKit.MakeAnimation(lottieJson);
const duration = animation.duration();

function drawLottie(canvas) {
  canvas.clear(CanvasKit.WHITE);
  const t = ((Date.now() / 1000) % duration) / duration;
  animation.seek(t);
  animation.render(canvas, CanvasKit.LTRBRect(0, 0, 500, 500));
  surface.requestAnimationFrame(drawLottie);
}
surface.requestAnimationFrame(drawLottie);
```

### Gradient & Shader

```javascript
const shader = CanvasKit.Shader.MakeLinearGradient(
  [0, 0], [200, 200],
  [CanvasKit.RED, CanvasKit.BLUE],
  [0, 1],
  CanvasKit.TileMode.Clamp
);
paint.setShader(shader);
canvas.drawRect(CanvasKit.LTRBRect(0, 0, 200, 200), paint);
shader.delete();
```

---

## ⚠️ Kritik Kurallar — Bellek Yönetimi

CanvasKit WASM nesneleri JavaScript GC tarafından temizlenmez. `new` veya `Make*` ile oluşturulan her nesne **manuel olarak `delete()` ile silinmelidir**:

```javascript
// ✅ Doğru
const paint = new CanvasKit.Paint();
// ... kullan ...
paint.delete();

// ❌ Yanlış — bellek sızıntısı
function draw() {
  const paint = new CanvasKit.Paint(); // Her frame'de oluşturuluyor
  // ... kullan ...
  // delete çağrılmıyor — bellek sürekli artar
}
```

**Kural:** Çizim döngüsü içinde sık oluşturulan nesneleri döngü dışında bir kez oluşturup tekrar kullanın.

### `onUnmounted` Temizlik Listesi

```javascript
onUnmounted(() => {
  if (surface) { surface.delete(); surface = null; }
  if (paint)   { paint.delete(); }
  if (path)    { path.delete(); }
  if (fontMgr) { fontMgr.delete(); }
  // CanvasKit modülü global olarak kalır (diğer pencereler kullanabilir)
});
```

---

## Backend Plugin (server.js) — Opsiyonel

CanvasKit uygulaması veri kaydetme/yükleme gerektiriyorsa:

```javascript
module.exports = function(ctx) {
  const { authMiddleware, fs, path, DATA_DIR, ensureDir } = ctx;

  return {
    routes: [
      {
        method: 'post',
        path: '/api/my-canvas-app/save',
        handlers: [authMiddleware, async (req, res) => {
          const username = req.user.username;
          const dir = path.join(DATA_DIR, username);
          ensureDir(dir);
          const filePath = path.join(dir, 'canvas-data.json');
          fs.writeFileSync(filePath, JSON.stringify(req.body));
          res.json({ ok: true });
        }]
      },
      {
        method: 'get',
        path: '/api/my-canvas-app/load',
        handlers: [authMiddleware, async (req, res) => {
          const username = req.user.username;
          const filePath = path.join(DATA_DIR, username, 'canvas-data.json');
          if (!fs.existsSync(filePath)) return res.json({ data: null });
          const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          res.json({ data });
        }]
      }
    ]
  };
};
```

---

## Uygulama Fikirleri

| Uygulama | Açıklama | CanvasKit Özelliği |
|-----------|----------|--------------------|
| Paint / Çizim | Katmanlı resim editörü | Path, Paint, drawImage, blend modları |
| Vektör Editör | SVG benzeri vektör çizim | Path ops, dönüşümler, kaydetme |
| Lottie Player | Animasyon oynatıcı | Skottie (MakeAnimation) |
| Grafik Çizer | Veri görselleştirme | Path, metin, gradient |
| Fotoğraf Filtre | Görüntüye filtre uygulama | Shader, ColorFilter, ImageFilter |
| El Yazısı Defteri | Dijital mürekkep/not alma | Path + pressure, yuvarlak uçlu çizim |
| Harita Renderer | Özel tile-based harita | drawImage, clip, dönüşümler |
| Font Önizleme | Font karşılaştırma | FontMgr, Paragraph API |
| Oyun | 2D oyun motoru | requestAnimationFrame, sprite çizim |
