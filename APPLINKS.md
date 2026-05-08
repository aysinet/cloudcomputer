# AppLinks — Desktop Shortcuts (Masaüstü Kısayolları)

## Genel Bakış

AppLinks sistemi, Windows kısayolları gibi çalışan masaüstü simgeleri oluşturma altyapısıdır. Herhangi bir uygulamanın belirli bir içeriğine doğrudan erişim sağlayan kısayollar masaüstüne eklenebilir.

Örneğin:
- **Browser**: Bir web sayfasına kısayol (Google, GitHub, vb.)
- **Notepad**: Belirli bir dosyaya kısayol
- **Code Editor**: Belirli bir projeye kısayol
- **Music Player**: Belirli bir çalma listesine kısayol
- **PDF Viewer**: Belirli bir PDF dosyasına kısayol

## Veri Modeli

Her AppLink şu alanlara sahiptir:

```json
{
  "id": "m1abc23xy",           // Otomatik üretilen benzersiz ID
  "appId": "browser",          // Hedef uygulamanın ID'si
  "label": "GitHub",           // Simge altında gösterilen kısa etiket (max 100 karakter)
  "description": "GitHub - Where the world builds software",  // Uzun açıklama / tooltip (max 500 karakter)
  "url": "https://github.com", // URL (browser gibi uygulamalar için)
  "data": {},                  // Ek veri (uygulama-spesifik)
  "desktop": 1,                // Hangi masaüstünde (1-4)
  "color": "linear-gradient(135deg,#e74c3c,#c0392b)", // Arka plan rengi
  "createdAt": "2025-01-15T10:30:00.000Z"
}
```

## API Endpoints

### GET /api/applinks
Kullanıcının tüm kısayollarını listeler.

**Response**: `AppLink[]`

### POST /api/applinks
Yeni kısayol oluşturur.

**Body**:
```json
{
  "appId": "browser",          // (zorunlu) Hedef uygulama ID'si
  "label": "GitHub",           // (zorunlu) Kısa etiket
  "description": "...",        // (opsiyonel) Uzun açıklama
  "url": "https://...",        // (opsiyonel) URL
  "data": {},                  // (opsiyonel) Ek veri
  "desktop": 1,                // (opsiyonel, varsayılan: 1) Masaüstü numarası
  "color": "linear-gradient..."// (opsiyonel) Arka plan rengi (otomatik random seçilir)
}
```

**Response**: `{ ok: true, link: AppLink }`

### PUT /api/applinks/:id
Mevcut kısayolu günceller.

**Body**: Güncellenecek alanlar (label, description, url, data, desktop, color)

**Response**: `{ ok: true, link: AppLink }`

### DELETE /api/applinks/:id
Kısayolu siler.

**Response**: `{ ok: true }`

## Simge Görünümü

- İkon: Hedef uygulamanın orijinal emoji ikonu kullanılır
- Arka plan: Rastgele seçilen gradient renk (veya özel belirlenmiş renk)
- Etiket: `label` alanı gösterilir (max 2 satır)
- Tooltip: `description` alanı hover'da gösterilir
- Rozet: Sağ alt köşede 🔗 rozeti ile normal ikonlardan ayırt edilir

## Browser Entegrasyonu

Browser uygulamasının araç çubuğunda 📌 (Link to Desktop) düğmesi bulunur. Bu düğmeye tıklandığında:

1. Açık olan sayfanın URL'si alınır
2. Sayfa başlığı etiket olarak kullanılır
3. Bulunulan masaüstüne kısayol oluşturulur
4. Rastgele bir gradient arka plan rengi atanır

## Diğer Uygulamalara AppLink Desteği Ekleme

Herhangi bir uygulama, masaüstüne kısayol oluşturmak için `create-applink` event'ini kullanabilir.

### 1. Template'e Düğme Ekleyin

```html
<button @click="linkToDesktop" title="Masaüstüne Kısayol">📌</button>
```

### 2. Component.js'e Fonksiyon Ekleyin

```javascript
function linkToDesktop() {
  // Uygulamanın mevcut durumuna göre label ve data hazırlanır
  const label = 'Dosya Adı';        // Kısa etiket
  const desc = 'Dosya yolu: /belgeler/rapor.pdf';  // Uzun açıklama
  const url = '';                     // URL varsa
  const data = {                      // Uygulama-spesifik veri
    filePath: '/belgeler/rapor.pdf',
    page: 5
  };
  
  window.dispatchEvent(new CustomEvent('create-applink', {
    detail: {
      appId: 'pdf-viewer',   // Bu uygulamanın app.json'daki ID'si
      label: label,
      description: desc,
      url: url,
      data: data
      // desktop: 2  // opsiyonel, belirtilmezse aktif masaüstü kullanılır
    }
  }));
}
```

### 3. Kısayol Tıklama Olayını Dinleyin

Kısayol tıklandığında uygulama açılır ve `applink-open` event'i tetiklenir:

```javascript
// component.js içinde onMounted'da:
window.addEventListener('applink-open', onAppLinkOpen);

// onUnmounted'da:
window.removeEventListener('applink-open', onAppLinkOpen);

function onAppLinkOpen(e) {
  const { appId, url, data, label } = e.detail;
  if (appId !== 'my-app-id') return;  // Sadece bu uygulamaya ait olanları işle
  
  // data içinden gerekli bilgileri al ve uygulamayı o duruma getir
  if (data.filePath) {
    loadFile(data.filePath);
  }
}
```

> **Not**: Browser uygulaması için `applink-open` yerine `browser-open-url` event'i kullanılır (mevcut altyapı).

## Uygulama Bazlı Örnekler

### Browser
```javascript
// Otomatik entegre - 📌 düğmesi toolbar'da mevcut
{ appId: 'browser', label: 'GitHub', url: 'https://github.com' }
```

### Code Editor
```javascript
{
  appId: 'codeeditor',
  label: 'main.js',
  description: 'Proje: /projeler/website/main.js',
  data: { filePath: '/projeler/website/main.js' }
}
```

### Music Player
```javascript
{
  appId: 'music-player',
  label: '🎵 Chill Mix',
  description: 'Çalma Listesi: Chill Mix (24 şarkı)',
  data: { playlist: 'chill-mix' }
}
```

### PDF Viewer
```javascript
{
  appId: 'pdf-viewer',
  label: 'Rapor 2025',
  description: 'Yıllık rapor - Sayfa 12',
  data: { filePath: '/belgeler/rapor-2025.pdf', page: 12 }
}
```

### Map
```javascript
{
  appId: 'map',
  label: 'İstanbul',
  description: 'İstanbul, Türkiye - 41.0082°N, 28.9784°E',
  data: { lat: 41.0082, lng: 28.9784, zoom: 12 }
}
```

### Notepad
```javascript
{
  appId: 'notepad',
  label: 'Notlarım',
  description: 'Dosya: belgeler/notlar.txt',
  data: { filePath: 'belgeler/notlar.txt' }
}
```

## Sağ Tık Menüsü

Kısayol ikonuna sağ tıklandığında:
- **Aç** (▶): Hedef uygulamayı açar ve içeriğe yönlendirir
- **Kaldır** (🗑): Kısayolu masaüstünden siler

## Depolama

AppLink verileri kullanıcı ayarları dosyasında saklanır:
```
data/users/{username}/settings.json → appLinks[]
```

## Güvenlik

- `appId` alfanumerik karakterlerle sınırlandırılır (max 64 karakter)
- `label` max 100 karakter
- `description` max 500 karakter  
- `url` max 2048 karakter
- `desktop` 1-4 arası sınırlandırılır
- Tüm API çağrıları JWT kimlik doğrulama gerektirir
