# Community — Cross-Instance Topluluk Platformu

> **Durum:** TASLAK v3 — İnceleme ve onay bekliyor  
> **Tarih:** 3 Mayıs 2026  
> **Hub:** `wss://community.aysi.net` (ayrı proje, bu repo dışında)

---

## 1. Genel Bakış

Community, tüm dünyada çalışan farklı CloudComputer kurulumlarındaki kullanıcıları birbirine bağlayan bir topluluk platformudur. Uygulama store'dan opsiyonel olarak yüklenir. Kullanıcılar gerçek kimliklerini gizleyerek sadece seçtikleri **nickname** ve **avatar** ile görünürler.

**Hub sunucusu bu proje dışında ayrı bir proje olarak geliştirilir** ve `community.aysi.net` adresinde barındırılır. CloudComputer tarafında sadece client app (Vue 3 component) bulunur.

### 1.1 Temel Özellikler

| Özellik | Açıklama |
|---------|----------|
| **Anonim Profil** | Nickname + avatar sistemi. Gerçek username/sunucu bilgisi gizli |
| **Chat** | Genel sohbet odaları + özel mesajlaşma (DM) |
| **Forum** | Kategori/başlık/yanıt yapısı, Markdown desteği |
| **Karşılıklı Oyunlar** | Satranç, Tavla, XOX, Taş-Kağıt-Makas |
| **Dosya Paylaşımı** | Chat ve forum'da resim/belge/arşiv paylaşımı |
| **Online Durum** | Kullanıcıların çevrimiçi/meşgul/uzakta durumu |

### 1.2 Teknik Özet

```
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│  CloudComputer #1    │     │  CloudComputer #2    │     │  CloudComputer #N    │
│  ┌────────────────┐  │     │  ┌────────────────┐  │     │  ┌────────────────┐  │
│  │ Community App  │  │     │  │ Community App  │  │     │  │ Community App  │  │
│  │ (Vue 3 comp.)  │  │     │  │ (Vue 3 comp.)  │  │     │  │ (Vue 3 comp.)  │  │
│  │                │  │     │  │                │  │     │  │                │  │
│  │ ┌────────────┐ │  │     │  │ ┌────────────┐ │  │     │  │ ┌────────────┐ │  │
│  │ │ Local Cache│ │  │     │  │ │ Local Cache│ │  │     │  │ │ Local Cache│ │  │
│  │ │ IndexedDB  │ │  │     │  │ │ IndexedDB  │ │  │     │  │ │ IndexedDB  │ │  │
│  │ └────────────┘ │  │     │  │ └────────────┘ │  │     │  │ └────────────┘ │  │
│  └───────┬────────┘  │     │  └───────┬────────┘  │     │  └───────┬────────┘  │
└──────────┼───────────┘     └──────────┼───────────┘     └──────────┼───────────┘
           │                            │                            │
           │         WSS (TLS)          │         WSS (TLS)          │
           └────────────┬───────────────┘────────────┘               │
                        │                                            │
              ┌─────────▼────────────────────────────────────────────▼──┐
              │              community.aysi.net                         │
              │              (AYRI PROJE)                               │
              │                                                        │
              │  Görevleri:                                            │
              │  • WebSocket mesaj relay (ilet, saklamaz elden geleni) │
              │  • Profil DB (nickname/avatar)                         │
              │  • Mesaj DB (son N mesaj, eski silinir)                │
              │  • Dosya geçidi (upload → CDN/disk, TTL ile)           │
              │  • Oyun eşleşme (matchmaking, state tutmaz)           │
              └────────────────────────────────────────────────────────┘
```

---

## 2. Mimari: Minimum Sunucu Yükü

### 2.1 Temel Prensip: Thin Server, Fat Client

Hub sunucusuna **minimum yük** binmesi için iş yükü mümkün olduğunca **client tarafına** kaydırılır:

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SORUMLULUK DAĞILIMI                            │
├──────────────────────────┬──────────────────────────────────────────┤
│     CLIENT (Ağır)        │        HUB SERVER (Hafif)               │
├──────────────────────────┼──────────────────────────────────────────┤
│ ✅ Oyun mantığı/kuralları│ ✅ Mesaj relay (ilet ve unut)           │
│ ✅ Board render/animasyon│ ✅ Nickname benzersizlik kontrolü        │
│ ✅ Hamle doğrulama       │ ✅ Profil CRUD (kayıt/güncelle)         │
│ ✅ Markdown render       │ ✅ Dosya upload/download (pass-through)  │
│ ✅ Mesaj cache (IndexDB) │ ✅ Eşleşme (matchmaking) — stateless     │
│ ✅ Avatar resize (canvas)│ ✅ Rate limiting                         │
│ ✅ Forum cache + paging  │ ✅ Son N mesaj saklama (ring buffer)     │
│ ✅ Emoji parse/render    │ ❌ Oyun state TUTMAZ                    │
│ ✅ Presence UI           │ ❌ Avatar resize YAPMAZ                  │
│ ✅ Offline message queue │ ❌ Markdown render YAPMAZ                │
│ ✅ XSS sanitization      │ ❌ Full-text search YAPMAZ               │
│ ✅ Dosya ön-sıkıştırma   │ ❌ Mesaj geçmişi (sınırsız) TUTMAZ     │
└──────────────────────────┴──────────────────────────────────────────┘
```

### 2.2 Sunucu Yükünü Azaltan 10 Strateji

| # | Strateji | Nasıl |
|---|----------|-------|
| 1 | **Mesaj relay, saklama değil** | Hub mesajı alır → bağlı client'lara iletir → DB'ye sadece son 200 mesaj/oda yazar (ring buffer). Eski mesajlar client cache'inde |
| 2 | **Client-side oyun motoru** | Satranç/tavla kuralları tamamen client'ta. Hub sadece hamle mesajlarını iki oyuncu arasında iletir, doğrulama yapmaz |
| 3 | **Client-side avatar resize** | Kullanıcı resim yüklerken `<canvas>` ile 128×128'e küçültüp base64 olarak gönderir. Hub sharp/jimp kullanmaz |
| 4 | **IndexedDB local cache** | Chat geçmişi, forum başlıkları, profiller client'ta cache'lenir. Hub'dan sadece cache'den sonraki delta istenir |
| 5 | **Lazy presence** | Presence heartbeat 120 saniyede bir. Delta update: sadece değişen kullanıcılar gönderilir. Full list sadece bağlantıda |
| 6 | **Sayfalama (pagination)** | Forum: 20 thread/sayfa. Chat geçmişi: 50 mesaj/istek. Hub, tüm veriyi asla tek seferde göndermez |
| 7 | **Client-side Markdown** | Forum içeriği raw Markdown olarak saklanır. Render tamamen client'ta (marked.js veya benzeri, CDN'den) |
| 8 | **Dosya TTL + boyut limiti** | Dosyalar 30 gün sonra otomatik silinir. Max 5MB/dosya (ağ + disk tasarrufu) |
| 9 | **Batch presence** | Birden fazla presence değişikliği 5 saniye toplanır, tek mesajda gönderilir |
| 10 | **WebSocket mesaj sıkıştırma** | `permessage-deflate` WS extension aktif. Tekrarlayan JSON key'leri otomatik sıkışır |

### 2.3 Hub Sunucu Tahmini Kaynak Kullanımı

| Metrik | 100 eşzamanlı kullanıcı | 1000 eşzamanlı kullanıcı |
|--------|-------------------------|--------------------------|
| RAM | ~50 MB | ~200 MB |
| CPU | < %5 (relay + DB write) | < %15 |
| Disk (DB) | ~50 MB | ~500 MB |
| Disk (dosyalar) | ~2 GB (TTL ile limit) | ~10 GB |
| Bant genişliği | ~5 Mbps | ~50 Mbps |
| WS bağlantıları | 100 | 1000 |

Bu değerler, hub'ın 1 vCPU + 512MB RAM VPS'te rahatlıkla çalışabileceğini gösterir.

---

## 3. İki Proje Ayrımı

### 3.1 Bu Proje (CloudComputer) — Sadece Client App

```
cloudcomputer/
└── apps/store/community/
    ├── app.json              # Manifest
    ├── component.js          # Vue 3 component (tüm client logic)
    ├── template.html         # UI şablonu
    └── style.css             # Dark theme CSS
```

**Bu projede desktop.js ve config değişikliği YOKTUR.**  
Community app, hub URL'yi hardcoded olarak bilir: `wss://community.aysi.net`  
Client doğrudan hub'a bağlanır — CloudComputer server'ı proxy yapmaz, aracılık etmez.

### 3.2 Ayrı Proje (community-hub) — Sunucu

> Bu döküman hub sunucusu için referans spesifikasyondur.  
> Hub kodu **ayrı bir repository'de** geliştirilir.

```
community-hub/                 # AYRI REPO
├── server.js                  # WebSocket + HTTP sunucu
├── package.json               # ws, express, better-sqlite3, multer
├── Dockerfile                 # Production deployment
├── docker-compose.yml         # Tek komutla ayağa kaldır
├── schema.sql                 # SQLite tablo tanımları
├── .env.example               # Konfigürasyon şablonu
└── uploads/                   # Geçici dosya deposu (TTL ile)
```

**Hub adresi:** `wss://community.aysi.net` (client'ta sabit)

### 3.3 İki Proje Arasındaki Tek Bağlantı

```
Community App (client)  ──WSS──►  community.aysi.net (hub)
Community App (client)  ──HTTPS──► community.aysi.net/files/* (dosya upload/download)
```

- Hub, CloudComputer'ın iç API'larına **asla** erişmez
- CloudComputer server, hub'a **asla** bağlanmaz
- Tüm iletişim client tarayıcısı üzerinden olur
- Hub'ın CloudComputer'ın JWT'sini doğrulaması gerekmez (kendi auth sistemi)

---

## 4. Kimlik Doğrulama (Hub'ın Kendi Auth Sistemi)

Hub, CloudComputer'dan bağımsız kendi kimlik doğrulamasını yapar. CloudComputer JWT token'ı kullanılmaz.

### 4.1 Kayıt Akışı

```
1. Kullanıcı ilk kez Community app'i açar
2. Client, benzersiz bir clientId üretir:
   clientId = SHA256(navigator.userAgent + screen.width + screen.height + localStorage.installTimestamp)
3. Setup wizard gösterilir: nickname + avatar + bio
4. Client → Hub: { type: "register", clientId, nickname, avatarType, avatarData, bio }
5. Hub, nickname benzersizliğini kontrol eder
6. Hub, userId = UUID v4 üretir + authToken = crypto random hex (64 char)
7. Hub → Client: { type: "register.ok", userId, authToken, profile }
8. Client, userId + authToken'ı localStorage'a kaydeder
9. Sonraki bağlantılarda: { type: "auth", userId, authToken }
```

### 4.2 Neden CloudComputer JWT Kullanılmıyor?

| Neden | Açıklama |
|-------|----------|
| **Bağımsızlık** | Hub, CloudComputer'ın JWT secret'ını bilmemeli — ayrı proje |
| **Güvenlik** | JWT secret paylaşmak, her iki sistemin güvenliğini riske atar |
| **Sunucu yükü** | Hub'ın CloudComputer instance'ına HTTP ile token doğrulatması = ek gecikme + yük |
| **Basitlik** | Token-based auth (opaque token) daha basit ve yeteri kadar güvenli |

### 4.3 Auth Veri Yapısı

```sql
-- Hub tarafında
CREATE TABLE users (
    userId       TEXT PRIMARY KEY,            -- UUID v4
    clientId     TEXT UNIQUE NOT NULL,         -- SHA256 hash (cihaz parmak izi)
    authToken    TEXT NOT NULL,                -- 64 char hex token
    nickname     TEXT UNIQUE NOT NULL,         -- "GamerTR42"
    nicknameLC   TEXT UNIQUE NOT NULL,         -- "gamertr42" (benzersizlik)
    avatarType   TEXT DEFAULT 'emoji',         -- 'emoji' veya 'custom'
    avatarData   TEXT DEFAULT '🦊',           -- emoji karakter veya base64 thumb
    bio          TEXT DEFAULT '',              -- max 200 karakter
    status       TEXT DEFAULT 'offline',       -- online/away/busy/offline
    wins         INTEGER DEFAULT 0,
    losses       INTEGER DEFAULT 0,
    draws        INTEGER DEFAULT 0,
    forumPosts   INTEGER DEFAULT 0,
    createdAt    TEXT DEFAULT (datetime('now')),
    lastSeen     TEXT DEFAULT (datetime('now'))
);
```

### 4.4 Client Tarafında Saklanan Veriler

```javascript
// localStorage
{
  "community_userId": "a7f3b2c1-...",
  "community_authToken": "e4d5f6a7b8c9...",
  "community_profile": { nickname, avatarType, avatarData, bio }
}

// IndexedDB "community" database
{
  "chatCache": { roomId → [messages...] },     // son 500 mesaj/oda
  "dmCache": { oderId → [messages...] },      // son 200 mesaj/kişi
  "forumCache": { categoryId → [threads...] },// son görüntülenen başlıklar
  "profileCache": { oderId → profile },       // görüntülenen profiller
  "lastSync": { roomId → timestamp }           // son sync zamanı (delta için)
}
```

---

## 5. Anonim Profil Sistemi

### 5.1 Gizlilik Modeli

Kullanıcıların gerçek CloudComputer bilgileri **asla** hub'a veya diğer kullanıcılara gönderilmez.

```
CloudComputer tarafı (gizli):     Community tarafı (görünen):
──────────────────────────        ─────────────────────────────
username: "admin"            →    nickname: "GamerTR42"
sunucu IP: 1.2.3.4          →    avatar: 🦊 (veya özel resim)
instanceId: değişken         →    bio: "Merhaba dünya!"
                                  userId: UUID (anlamlı değil)
                                  status: online ●
```

- Hub, kullanıcının hangi CloudComputer instance'ından geldiğini **bilmez**
- `clientId` cihaz parmak izi olarak kullanılır ama diğer kullanıcılara gösterilmez
- Tek görünen bilgiler: nickname, avatar, bio, online durum, oyun istatistikleri

### 5.2 Setup Wizard

Uygulama ilk açıldığında (localStorage'da `community_authToken` yoksa):

```
┌─────────────────────────────────────────────┐
│          🌐 Community'ye Hoş Geldin!        │
│                                             │
│  Nickname:  ┌─────────────────────────┐     │
│             │ GamerTR42               │     │
│             └─────────────────────────┘     │
│  ✅ Müsait / ❌ Alınmış (anlık kontrol)    │
│  3-20 karakter, harf/rakam/_               │
│                                             │
│  Avatar:    🦊 🐱 🐻 🦁 🐼 🐨 🦄 🐲      │
│             🎮 🎯 🎨 🎵 🚀 ⚡ 🔥 💎      │
│             🌙 🌈 🍀 🎃 🎪 🏆 👾 🤖      │
│             🦅 🐬 🦋 🐝 🐺 🦜 🐙 🦊      │
│             [ 📷 Özel Resim Yükle ]        │
│                                             │
│  Bio:       ┌─────────────────────────┐     │
│             │ Kısa bir tanıtım...     │     │
│             └─────────────────────────┘     │
│             Max 200 karakter               │
│                                             │
│           [ ✅ Topluluğa Katıl ]           │
│                                             │
└─────────────────────────────────────────────┘
```

### 5.3 Nickname Kuralları

| Kural | Değer |
|-------|-------|
| Minimum uzunluk | 3 karakter |
| Maximum uzunluk | 20 karakter |
| İzin verilen karakterler | a-z, A-Z, 0-9, _ (alt çizgi) |
| Büyük/küçük harf duyarlılığı | Hayır (`GamerTR` = `gamertr`) |
| Benzersizlik | Hub tarafında garanti, anlık kontrol |
| Değiştirme | Settings'den değiştirilebilir |
| Yasaklı isimler | admin, moderator, system, bot, null, undefined |

### 5.4 Avatar Sistemi

**İki mod:**

1. **Preset Avatar (Emoji):** 32 adet, kategorize
   - Hub'da saklanma: direkt emoji karakter (`"🦊"`)
   - Sıfır sunucu yükü — sadece string

2. **Özel Resim Yükleme:**
   - **Client tarafında resize:** `<canvas>` ile 128×128 px, WebP formatına dönüştürülür
   - Max boyut (resize sonrası): 32KB base64
   - Hub'a gönderim: base64 string olarak avatarData alanında (ayrı upload endpoint'i yok)
   - **Hub sadece string saklar — image processing YAPMAZ**

```javascript
// Client-side avatar resize (component.js içinde)
function resizeAvatar(file) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 128;
      const ctx = canvas.getContext('2d');
      // Center-crop (kare)
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2, sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, 128, 128);
      resolve(canvas.toDataURL('image/webp', 0.8)); // ~10-25KB
    };
    img.src = URL.createObjectURL(file);
  });
}
```

---

## 6. Chat Sistemi

### 6.1 Genel Sohbet Odaları

| Oda ID | İsim | Açıklama |
|--------|------|----------|
| `lobby` | 🏠 Lobi | Genel sohbet, herkes otomatik katılır |
| `random` | 🎲 Rastgele | Serbest sohbet |
| `games` | 🎮 Oyunlar | Oyun partneri arama |
| `help` | ❓ Yardım | CloudComputer soruları |
| `turkce` | 🇹🇷 Türkçe | Türkçe sohbet |
| `english` | 🇬🇧 English | İngilizce sohbet |

### 6.2 Sunucu Yükü Minimizasyonu — Chat

```
MESAJ AKIŞI:
                                                    
  Gönderici ──WS──► Hub ──WS──► Tüm oda üyeleri     (RELAY)
                      │                              
                      └──► Ring Buffer (son 200/oda)  (SINIRLI SAKLAMA)
                                                    
CLIENT CACHE:
  • Client IndexedDB'de oda başına son 500 mesajı cache'ler
  • Bağlantı kopup yeniden bağlandığında:
    Client: { type: "chat.sync", room: "lobby", since: "2026-05-03T14:30:00Z" }
    Hub: sadece o tarihten sonraki mesajları gönderir (delta sync)
  • Eğer delta > 200 mesaj → Hub: "cache'i temizle, işte son 200" der

RING BUFFER (Hub tarafı):
  • Oda başına MAX 200 mesaj saklanır (FIFO — en eski silinir)
  • DM: kişi çifti başına MAX 100 mesaj saklanır
  • Bu, hub DB boyutunu sabit tutar
  • Eski mesajlar sadece client cache'lerinde mevcuttur
```

### 6.3 Özel Mesajlaşma (DM)

- Kullanıcı listesinden tıklayarak DM başlatılır
- Hub'da son 100 mesaj/çift saklanır (ring buffer)
- Client cache'de daha fazlası tutulur
- Okundu/okunmadı: client tarafında takip (hub'a bildirilmez → yük azaltma)

### 6.4 Hub Tarafı Veri Yapısı (Chat)

```sql
CREATE TABLE messages (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    type        TEXT NOT NULL,          -- 'room' veya 'dm'
    roomId      TEXT,                   -- oda mesajları için
    senderId    TEXT NOT NULL,          -- userId
    recipientId TEXT,                   -- DM için
    content     TEXT NOT NULL,          -- max 2000 karakter
    attachments TEXT DEFAULT '[]',      -- JSON array: [{fileId, name, size, mime, thumb?}]
    createdAt   TEXT DEFAULT (datetime('now'))
);

-- Partial index: sadece room mesajları için
CREATE INDEX idx_msg_room ON messages(roomId, id DESC) WHERE type = 'room';
-- DM mesajları için composite index
CREATE INDEX idx_msg_dm ON messages(
    MIN(senderId, recipientId), MAX(senderId, recipientId), id DESC
) WHERE type = 'dm';
```

**Ring buffer temizliği (her 10 dakikada):**
```sql
-- Oda başına son 200'den fazlasını sil
DELETE FROM messages WHERE type = 'room' AND id NOT IN (
    SELECT id FROM messages WHERE type = 'room' AND roomId = ? ORDER BY id DESC LIMIT 200
);
```

### 6.5 Chat UI

```
┌─────────────────────────────────────────────────────────────┐
│ ☰ Community                                    ⚙️ 👤       │
├────────────┬────────────────────────────────────────────────┤
│            │                                                │
│ 💬 CHAT    │  🏠 Lobi                          3 çevrimiçi │
│            │  ─────────────────────────────────────────────  │
│ 🏠 Lobi   │                                                │
│ 🎲 Rastgele│  🦊 GamerTR42           14:32                 │
│ 🎮 Oyunlar│  Selam! Satranç oynamak isteyen var mı?       │
│ ❓ Yardım │                                                │
│ 🇹🇷 Türkçe│       🐱 CoolCat         14:33                │
│ 🇬🇧 English│       Ben varım! Oda oluştur 👍              │
│            │                                                │
│ 📩 DM     │  🦁 LionKing             14:35                 │
│ • CoolCat │  [📎 ekran-goruntusu.png]                      │
│            │  Bunu nasıl yapıyorsunuz?                      │
│            │                                                │
│ 📋 FORUM  │                                                │
│ 🎮 OYUNLAR│ ─────────────────────────────────────────────── │
│ 👥 KİŞİLER│ ┌──────────────────────────────────┐ 📎 😀    │
│            │ │ Mesajınızı yazın...              │ Gönder   │
│            │ └──────────────────────────────────┘          │
├────────────┴────────────────────────────────────────────────┤
│ 🟢 GamerTR42 (siz)  │  🟢 CoolCat  │  🟡 LionKing (uzak) │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Forum Sistemi

### 7.1 Kategoriler

```
├── 💬 Genel Tartışma
├── ❓ Soru-Cevap
├── 💡 Öneriler & İstekler
├── 🐛 Hata Raporları
├── 🎮 Oyun Tartışmaları
├── 📸 Paylaşımlar (ekran görüntüsü, tema vb.)
└── 📢 Duyurular (sadece moderatör)
```

### 7.2 Sunucu Yükü Minimizasyonu — Forum

```
CLIENT CACHE STRATEJİSİ:
  • Kategori listesi → client cache (nadiren değişir)
  • Thread listesi → cache + ETag kontrolü (değişmediyse 304)
  • Thread detayı → cache, sadece yeni reply'lar sorulur (delta)
  • Markdown render → tamamen client'ta (marked.js CDN)

HUB TARAFINDA:
  • Sayfalama zorunlu: 20 thread/istek, 30 reply/istek
  • Thread arama YOK (client cache'de arama yapılır)
  • View count: batch güncelleme (her 5 dakikada DB'ye yazılır, anlık değil)
```

### 7.3 Forum Veri Yapısı (Hub)

```sql
CREATE TABLE forum_categories (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    icon        TEXT,
    sortOrder   INTEGER DEFAULT 0
);

CREATE TABLE forum_threads (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    categoryId  TEXT NOT NULL,
    authorId    TEXT NOT NULL,
    title       TEXT NOT NULL,               -- max 200 karakter
    content     TEXT NOT NULL,               -- max 10000 karakter (raw Markdown)
    attachments TEXT DEFAULT '[]',           -- JSON array
    replyCount  INTEGER DEFAULT 0,           -- denormalized (JOIN azaltma)
    views       INTEGER DEFAULT 0,
    isPinned    INTEGER DEFAULT 0,
    isLocked    INTEGER DEFAULT 0,
    createdAt   TEXT DEFAULT (datetime('now')),
    lastReplyAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (authorId) REFERENCES users(userId)
);

CREATE TABLE forum_replies (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    threadId    INTEGER NOT NULL,
    authorId    TEXT NOT NULL,
    content     TEXT NOT NULL,               -- max 5000 karakter (raw Markdown)
    attachments TEXT DEFAULT '[]',
    likes       TEXT DEFAULT '[]',           -- JSON array of userId'ler
    createdAt   TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (threadId) REFERENCES forum_threads(id)
);

CREATE INDEX idx_threads_cat ON forum_threads(categoryId, lastReplyAt DESC);
CREATE INDEX idx_replies_thread ON forum_replies(threadId, id);
```

### 7.4 Forum UI

```
┌─────────────────────────────────────────────────────────────┐
│ ☰ Community > Forum > 💬 Genel Tartışma       ⚙️ 👤       │
├────────────┬────────────────────────────────────────────────┤
│            │                                                │
│ 💬 CHAT    │  [ + Yeni Başlık ]                            │
│ 📋 FORUM  │                                                │
│            │  📌 CloudComputer v2.5 Yenilikler             │
│ 💬 Genel  │     🦁 LionKing • 12 yanıt • 245 görüntüleme │
│ ❓ Soru   │                                                │
│ 💡 Öneriler│  Theme nasıl değiştirilir?                    │
│ 🐛 Hatalar│     🐱 CoolCat • 3 yanıt • 87 görüntülenme   │
│ 🎮 Oyunlar│                                                │
│ 📸 Paylaşım│ En iyi terminal ayarlarım                    │
│ 📢 Duyuru │     🦊 GamerTR42 • 8 yanıt • 156 görüntülenme │
│            │     [📎 2 dosya eki]                           │
│ 🎮 OYUNLAR│                                                │
│ 👥 KİŞİLER│  Favori uygulamalarınız neler?                 │
│            │     🐼 PandaBoy • 21 yanıt • 312 görüntüleme  │
└────────────┴────────────────────────────────────────────────┘
```

---

## 8. Karşılıklı Oyunlar

### 8.1 Desteklenen Oyunlar

| Oyun | Tip | Süre | Karmaşıklık |
|------|-----|------|-------------|
| ❌ **XOX (Tic-Tac-Toe)** | Sıra bazlı, 2 kişi | 1-3 dk | Düşük |
| ✊ **Taş-Kağıt-Makas** | Eşzamanlı, 2 kişi | 1 dk | Düşük |
| ♟️ **Satranç** | Sıra bazlı, 2 kişi | 10-60 dk | Yüksek |
| 🎲 **Tavla** | Sıra bazlı, 2 kişi | 10-30 dk | Orta |

### 8.2 Sunucu Yükü Minimizasyonu — Oyunlar

**Hub oyun state'i TUTMAZ.** Sadece eşleşme ve mesaj relay yapar:

```
KLASIK YAKLAŞIM (ağır):                  BİZİM YAKLAŞIM (hafif):
─────────────────────                    ─────────────────────
Client → move → Hub                      Client → move → Hub
Hub: kuralları doğrula ❌                Hub: sadece ilet ✅
Hub: board'u güncelle ❌                 Hub: state tutmaz ✅
Hub: DB'ye yaz ❌                        Hub: DB'ye yazmaz ✅
Hub → board state → Client               Hub → move → Client
                                          Client: kuralları doğrula ✅
                                          Client: board'u güncelle ✅
```

**Akış detayı:**
```
1. Eşleşme (Hub):
   Player1 → { type: "game.create", gameType: "chess" }
   Hub → tüm bağlı client'lara: { type: "game.available", ... }
   Player2 → { type: "game.join", gameId: "xxx" }
   Hub → her iki oyuncuya: { type: "game.start", opponent: {...}, config: {...} }

2. Oyun Döngüsü (Hub = relay):
   Player1 → { type: "game.move", gameId: "xxx", move: "e2e4" }
   Hub → Player2'ye iletir: { type: "game.move", gameId: "xxx", move: "e2e4" }
   (Hub hamleyi anlamaz, sadece iletir)

3. Oyun Sonu (Client bildirimi):
   Player1 → { type: "game.end", gameId: "xxx", result: "win", reason: "checkmate" }
   Player2 → { type: "game.end", gameId: "xxx", result: "loss", reason: "checkmate" }
   Hub: Her iki taraf da aynı sonucu bildirirse → istatistik güncelle
   (Çelişki varsa → görmezden gel, istatistik güncellenmez)
```

**Neden client-side doğrulama yeterli?**
- Bu bir rekabetçi e-spor platformu değil, eğlence amaçlı
- Hile yapan kişi sadece kendi deneyimini bozar
- Her iki client da kuralları bağımsız doğrular — hile yapılırsa karşı tarafın client'ı reddeder
- Sunucu CPU'su sıfır oyun mantığı çalıştırır

### 8.3 Oyun Veri Yapısı (Hub — minimal)

```sql
-- Hub sadece aktif eşleşmeleri tutar, bitince siler
CREATE TABLE active_games (
    gameId      TEXT PRIMARY KEY,
    gameType    TEXT NOT NULL,
    player1     TEXT NOT NULL,
    player2     TEXT,                        -- null = bekleniyor
    status      TEXT DEFAULT 'waiting',      -- waiting/playing
    createdAt   TEXT DEFAULT (datetime('now'))
);

-- Biten oyunlar sadece istatistik günceller, detay saklanmaz
-- active_games'ten silinir → users tablosunda wins/losses/draws güncellenir
CREATE INDEX idx_games_waiting ON active_games(gameType, status) WHERE status = 'waiting';
```

### 8.4 Client-Side Oyun Motoru (component.js)

Satranç, tavla, XOX ve TKM mantığı tamamen `component.js` içinde:

```javascript
// Satranç — client-side kural motoru (component.js içinde ~200 satır)
const ChessEngine = {
  newBoard() { /* başlangıç pozisyonu */ },
  isValidMove(board, from, to, turn) { /* kural doğrulama */ },
  applyMove(board, from, to) { /* tahtayı güncelle */ },
  isCheck(board, color) { /* şah kontrolü */ },
  isCheckmate(board, color) { /* şah mat kontrolü */ },
  isStalemate(board, color) { /* pat kontrolü */ },
  getValidMoves(board, pos) { /* yasal hamleler */ }
};

// Tavla — client-side (~150 satır)
const BackgammonEngine = { /* ... */ };

// XOX — client-side (~30 satır)
const TicTacToeEngine = { /* ... */ };

// TKM — client-side (~15 satır) 
const RPSEngine = { /* ... */ };
```

### 8.5 Satranç UI Taslağı

```
┌────────────────────────────────────────────────────┐
│  ♟️ Satranç   🦊 GamerTR42 vs 🐱 CoolCat         │
│                                                    │
│    a  b  c  d  e  f  g  h                         │
│  8 ♜  ♞  ♝  ♛  ♚  ♝  ♞  ♜  8                   │
│  7 ♟  ♟  ♟  ♟  ♟  ♟  ♟  ♟  7                   │
│  6 .  .  .  .  .  .  .  .  6                     │
│  5 .  .  .  .  .  .  .  .  5                     │
│  4 .  .  .  .  ♙  .  .  .  4                     │
│  3 .  .  .  .  .  .  .  .  3                     │
│  2 ♙  ♙  ♙  ♙  .  ♙  ♙  ♙  2                   │
│  1 ♖  ♘  ♗  ♕  ♔  ♗  ♘  ♖  1                   │
│    a  b  c  d  e  f  g  h                         │
│                                                    │
│  Sıra: 🐱 CoolCat düşünüyor...                   │
│  Hamleler: 1. e4 ...                              │
│                                                    │
│  [ 🏳️ Teslim Ol ]  [ 🤝 Berabere Teklif ]       │
└────────────────────────────────────────────────────┘
```

---

## 9. Dosya Paylaşımı

### 9.1 Genel Bakış

Kullanıcılar chat ve forum mesajlarına dosya ekleyebilir.

### 9.2 Limitler ve Kurallar

| Parametre | Değer |
|-----------|-------|
| Max dosya boyutu | **5 MB** (sunucu yükü azaltma) |
| Mesaj başına max dosya | 3 |
| İzin verilen formatlar | jpg, png, gif, webp, pdf, txt, md, zip, 7z |
| **Yasaklı formatlar** | exe, sh, bat, cmd, ps1, msi, dll, com, scr, vbs |
| Dosya ömrü (TTL) | **30 gün** (otomatik silinir) |
| Kullanıcı başına günlük limit | **20 MB** toplam |
| Toplam disk limiti (hub) | **10 GB** (FIFO — en eski silinir) |

### 9.3 Sunucu Yükü Minimizasyonu — Dosya

```
CLIENT TARAFINDA (yük azaltma):
  • Resimler upload öncesi client'ta sıkıştırılır (canvas → WebP, quality: 0.8)
  • Max 1920px genişlik/yükseklik (büyükse client küçültür)
  • Thumbnail client'ta üretilir (200px genişlik) ve mesaja inline eklenir
  • Dosya boyutu 5MB'ı aşarsa client reddeder (hub'a istek gitmez)

HUB TARAFINDA (minimal):
  • Dosyayı alır → UUID ile kaydeder → meta bilgiyi DB'ye yazar
  • Image processing YAPMAZ (client zaten küçültmüş)
  • Thumbnail ÜRETMEZ (client zaten üretmiş)
  • CDN/reverse proxy ile statik dosya servisi (Express static)
  • Cron: 6 saatte bir süresi dolmuş dosyaları siler
```

### 9.4 Yükleme Akışı

```
Kullanıcı                          Hub Server (community.aysi.net)
   │                                         │
   ├──[📎 Dosya Seç]                         │
   │                                         │
   │  Client: resize + compress              │
   │  Client: thumbnail üret                 │
   │                                         │
   ├──HTTPS POST /files/upload──────────────►│
   │  (multipart, max 5MB)                   │
   │  Header: Authorization: Bearer {token}  │
   │                                         │
   │  ◄──{ fileId, url, filename, size }─────┤
   │                                         │
   ├──WS: { type: "chat.send",              │
   │    content: "Bakın bu...",              │
   │    attachments: [{                      │
   │      fileId, name, size, mime,          │
   │      thumb: "data:image/webp;base64,…"  │  ← Inline thumbnail (client üretir)
   │    }]                                   │
   │  }──────────────────────────────────────►│
   │                                         │
   │         Hub relay → diğer client'lar    │
   │  ◄─────────────────────────────────────┤
   │                                         │
   │  Diğer client'lar thumbnail'ı hemen     │
   │  gösterir (base64, hub'dan indirmez)    │
   │  Tam dosya tıklanınca indirilir         │
   │                                         │
```

### 9.5 Dosya Veri Yapısı (Hub)

```sql
CREATE TABLE files (
    fileId      TEXT PRIMARY KEY,            -- UUID v4
    uploaderId  TEXT NOT NULL,
    filename    TEXT NOT NULL,               -- orijinal dosya adı
    storedName  TEXT NOT NULL,               -- UUID.ext (disk'te)
    mimeType    TEXT NOT NULL,
    size        INTEGER NOT NULL,            -- byte
    uploadedAt  TEXT DEFAULT (datetime('now')),
    expiresAt   TEXT NOT NULL                -- uploadedAt + 30 gün
);

CREATE INDEX idx_files_expires ON files(expiresAt);
```

### 9.6 Dosya Güvenliği

1. **MIME doğrulama:** Magic bytes kontrolü (sadece extension'a güvenilmez)
2. **Çalıştırılabilir engelleme:** exe, sh, bat, cmd, ps1, dll, com, scr yasaklı
3. **Boyut kontrolü:** Multer `limits.fileSize: 5 * 1024 * 1024`
4. **Disk'te UUID isim:** Path traversal koruması
5. **Rate limiting:** userId başına 20MB/gün
6. **Otomatik temizlik:** Cron job (6 saatte bir, TTL 30 gün)

---

## 10. WebSocket Protokolü (Tam Referans)

### 10.1 Bağlantı

```
URL: wss://community.aysi.net/ws
```

### 10.2 Kimlik Doğrulama

```
# İlk kayıt
Client → Hub:
  { type: "register", clientId: "sha256...", nickname: "GamerTR42", 
    avatarType: "emoji", avatarData: "🦊", bio: "Merhaba!" }
Hub → Client:
  { type: "register.ok", userId: "uuid...", authToken: "hex64...", profile: {...} }
  { type: "register.error", code: "NICKNAME_TAKEN", message: "Bu nickname kullanılıyor" }

# Sonraki bağlantılar
Client → Hub:
  { type: "auth", userId: "uuid...", authToken: "hex64..." }
Hub → Client:
  { type: "auth.ok", profile: { nickname, avatarType, avatarData, bio, status, wins, losses, draws } }
  { type: "auth.error", code: "INVALID_TOKEN", message: "Geçersiz token" }
```

### 10.3 Profil

```
Client → Hub:
  { type: "profile.update", nickname: "YeniIsim", bio: "Güncel bio", 
    avatarType: "custom", avatarData: "data:image/webp;base64,..." }
  { type: "profile.get", userId: "uuid..." }
  { type: "profile.check_nickname", nickname: "Deneme" }

Hub → Client:
  { type: "profile.updated", profile: {...} }
  { type: "profile.data", profile: { nickname, avatarType, avatarData, bio, status, wins, losses, draws, forumPosts, createdAt } }
  { type: "profile.nickname_available", available: true }
  { type: "profile.error", code: "NICKNAME_TAKEN" }
```

### 10.4 Chat

```
Client → Hub:
  { type: "chat.send", room: "lobby", content: "Selam!", attachments: [{fileId, name, size, mime, thumb}] }
  { type: "chat.sync", room: "lobby", since: "2026-05-03T14:30:00Z" }
  { type: "chat.join", room: "lobby" }

Hub → Client:
  { type: "chat.message", room: "lobby", id: 123, 
    from: { userId, nickname, avatarType, avatarData }, 
    content: "Selam!", attachments: [...], ts: "2026-05-03T14:32:00Z" }
  { type: "chat.sync", room: "lobby", messages: [...], hasMore: false }
```

### 10.5 DM

```
Client → Hub:
  { type: "dm.send", to: "userId", content: "Merhaba", attachments: [] }
  { type: "dm.sync", with: "userId", since: "..." }
  { type: "dm.list" }

Hub → Client:
  { type: "dm.message", from: { userId, nickname, avatarType, avatarData }, content: "Merhaba", ts: "..." }
  { type: "dm.sync", with: "userId", messages: [...], hasMore: false }
  { type: "dm.list", conversations: [{ userId, nickname, avatarType, avatarData, lastMessage, lastTs, unread }] }
```

### 10.6 Forum

```
Client → Hub:
  { type: "forum.categories" }
  { type: "forum.list", categoryId: "genel", page: 1, limit: 20 }
  { type: "forum.thread", threadId: 42, afterReplyId: 0 }
  { type: "forum.create", categoryId: "genel", title: "...", content: "...", attachments: [] }
  { type: "forum.reply", threadId: 42, content: "...", attachments: [] }
  { type: "forum.like", replyId: 7 }

Hub → Client:
  { type: "forum.categories", categories: [...] }
  { type: "forum.threads", categoryId: "genel", threads: [...], total: 156 }
  { type: "forum.thread", thread: { id, title, content, author: {...}, replies: [...], hasMore } }
  { type: "forum.created", thread: {...} }
  { type: "forum.replied", threadId: 42, reply: {...} }
```

### 10.7 Oyunlar

```
Client → Hub:
  { type: "game.create", gameType: "chess" }
  { type: "game.join", gameId: "xxx" }
  { type: "game.move", gameId: "xxx", data: { from: "e2", to: "e4" } }
  { type: "game.resign", gameId: "xxx" }
  { type: "game.draw_offer", gameId: "xxx" }
  { type: "game.draw_accept", gameId: "xxx" }
  { type: "game.end", gameId: "xxx", result: "win"|"loss"|"draw", reason: "..." }
  { type: "game.list" }
  { type: "game.cancel", gameId: "xxx" }

Hub → Client:
  { type: "game.created", gameId: "xxx", gameType: "chess" }
  { type: "game.started", gameId: "xxx", opponent: { nickname, avatarType, avatarData }, config: { yourSide: "white" } }
  { type: "game.move", gameId: "xxx", data: { from: "e2", to: "e4" } }
  { type: "game.resigned", gameId: "xxx" }
  { type: "game.draw_offer", gameId: "xxx" }
  { type: "game.ended", gameId: "xxx", result: "win"|"loss"|"draw", reason: "..." }
  { type: "game.list", games: [{ gameId, gameType, creator: { nickname, avatarType, avatarData }, createdAt }] }
  { type: "game.opponent_disconnected", gameId: "xxx" }
```

### 10.8 Presence

```
# Bağlantıda bir kez
Client → Hub:
  { type: "presence.subscribe" }
  { type: "presence.status", status: "away" }

# Hub → Client (BATCH — 5 saniyede bir, sadece değişenler)
  { type: "presence.delta", joined: [{userId, nickname, avatarType, avatarData}], left: ["userId1"], statusChanged: [{userId, status: "away"}] }

# İlk bağlantıda full list (sadece 1 kez)
  { type: "presence.full", users: [{userId, nickname, avatarType, avatarData, status}] }
```

---

## 11. HTTP API (Hub Server — Minimal)

| Method | Endpoint | Açıklama | Auth | Sunucu Yükü |
|--------|----------|----------|------|-------------|
| GET | `/health` | Sağlık kontrolü | Hayır | Sıfır |
| POST | `/files/upload` | Dosya yükleme | Evet | Orta (I/O) |
| GET | `/files/:fileId/:filename` | Dosya indirme | Hayır* | Düşük (static) |

> *Dosya indirme auth gerektirmez — fileId tahmin edilemez UUID olduğu için güvenlidir (security through obscurity + URL bilgisi sadece oda/DM üyelerinde). Bu sayede CDN/reverse proxy önüne konabilir.

**NOT:** Profil, chat, forum, oyun işlemleri HTTP DEĞİL, tamamen WebSocket üzerinden yapılır. Bu, HTTP request overhead'ini ortadan kaldırır ve sunucu yükünü minimize eder.

---

## 12. Güvenlik

### 12.1 Kimlik Doğrulama

```
1. İlk kullanımda client benzersiz clientId üretir (cihaz parmak izi)
2. Hub'a register olur → userId + authToken alır
3. authToken localStorage'da saklanır
4. Her WS bağlantısında { type: "auth", userId, authToken } gönderilir
5. Hub, authToken'ı DB'de doğrular (O(1) lookup)
```

### 12.2 Güvenlik Önlemleri

| Önlem | Detay | Sunucu Yükü |
|-------|-------|-------------|
| **Rate limiting** | 20 mesaj/dakika, 3 thread/saat, 20MB dosya/gün | Çok düşük (in-memory counter) |
| **Mesaj limitleri** | Chat: 2000 char, Forum: 10000 char | Sıfır (string.length) |
| **XSS koruması** | Client tarafında sanitize (DOMPurify veya benzeri) | Sıfır (client'ta) |
| **SQL injection** | Prepared statements (better-sqlite3) | Sıfır (standart) |
| **DoS koruması** | WS mesaj boyutu: 64KB, bağlantı limiti: IP başına 5 | Düşük |
| **Spam koruması** | Aynı mesajı 5 saniye içinde tekrar gönderme engeli | Çok düşük |
| **Dosya güvenliği** | Magic bytes kontrolü + yasaklı extension listesi | Düşük (upload'da) |
| **Auth token** | 64 char crypto random hex — brute force imkansız | Sıfır |

### 12.3 Moderasyon (Faz 2)

- Client-side kullanıcı engelleme (block): Engellenen kişinin mesajları client'ta filtrelenir (hub'a yük binmez)
- Rapor etme: WS ile hub'a bildirim → DB'ye yaz (async)
- Kelime filtresi: Client tarafında (hub'a yük binmez)
- Hub-level ban: authToken blacklist (admin panel ile)

---

## 13. CloudComputer Tarafı Değişiklikler (Minimal)

Bu projede yapılacak değişiklikler **çok az ve basittir:**

### 13.1 Yeni Dosyalar

```
apps/store/community/
├── app.json              # Manifest (type: internal)
├── component.js          # Vue 3 component (tüm client logic)
├── template.html         # UI şablonu
└── style.css             # Dark theme CSS
```

### 13.2 Mevcut Dosya Değişiklikleri

**SIFIR.** desktop.js, desktop.config.json, docker-compose.yml'de değişiklik yok.

Client app doğrudan `wss://community.aysi.net` adresine bağlanır. CloudComputer server'ı hiçbir şekilde aracılık etmez veya proxy yapmaz.

### 13.3 desktop.js Değişikliği Neden Gerekmiyor?

| Önceki plan | Yeni plan |
|-------------|-----------|
| Hub URL'i config'e ekle | ❌ Gereksiz — URL sabit: `community.aysi.net` |
| Hub URL okuma API'si | ❌ Gereksiz — client zaten biliyor |
| WebSocket proxy | ❌ Gereksiz — client doğrudan bağlanıyor |
| Docker Compose servisi | ❌ Gereksiz — hub ayrı proje |

---

## 14. Hub Sunucu Spesifikasyonu (Ayrı Proje Referansı)

> Aşağıdaki bilgiler hub projesinin geliştiricisi içindir.

### 14.1 Teknoloji Stack

```json
{
  "name": "community-hub",
  "version": "1.0.0",
  "dependencies": {
    "ws": "^8.18.0",
    "express": "^4.21.0",
    "better-sqlite3": "^12.9.0",
    "multer": "^1.4.5-lts.1",
    "uuid": "^10.0.0"
  }
}
```

> **NOT:** `sharp` kaldırıldı — avatar ve thumbnail işleme client'ta yapılıyor.

### 14.2 Kaynak Gereksinimleri (Tahmini)

| Metrik | 100 eşzamanlı | 1000 eşzamanlı |
|--------|----------------|-----------------|
| RAM | ~30 MB | ~150 MB |
| CPU | < %3 | < %10 |
| Disk (DB) | ~20 MB | ~200 MB |
| Disk (dosyalar) | ≤ 10 GB (limit) | ≤ 10 GB (limit) |
| Bant genişliği | ~2 Mbps | ~20 Mbps |

**Minimum VPS:** 1 vCPU, 512MB RAM, 20GB SSD yeterlidir.

### 14.3 Hub'ın Yapmadığı Şeyler (Yük azaltma)

| İşlem | Nerede? |
|-------|---------|
| Oyun kuralı doğrulama | ❌ Hub'da değil → Client'ta |
| Avatar/resim resize | ❌ Hub'da değil → Client'ta |
| Markdown → HTML dönüşümü | ❌ Hub'da değil → Client'ta |
| Mesaj XSS sanitization | ❌ Hub'da değil → Client'ta |
| Full-text arama | ❌ Hub'da değil → Client cache'te |
| Sınırsız mesaj geçmişi | ❌ Hub'da değil → Client cache'te |
| Okundu bilgisi takibi | ❌ Hub'da değil → Client local |
| Thumbnail üretimi | ❌ Hub'da değil → Client'ta |
| CDN/static asset hosting | ❌ Hub'da değil → Nginx/Cloudflare |

### 14.4 Hub Dosya Yapısı (Referans)

```
community-hub/                  # AYRI REPOSITORY
├── server.js                   # ~500 satır
│   ├── WebSocket handler       #   - auth, chat relay, forum CRUD, game matchmaking
│   ├── HTTP routes             #   - /files/upload, /files/:id/:name, /health
│   ├── Rate limiter            #   - in-memory counter
│   └── Cleanup cron            #   - ring buffer trim, dosya TTL temizliği
├── schema.sql                  # Tablo tanımları
├── package.json
├── Dockerfile
├── docker-compose.yml          # Tek komutla başlat
├── .env.example
│   HUB_PORT=443
│   DB_PATH=./data/community.db
│   UPLOAD_DIR=./data/uploads
│   MAX_UPLOAD_SIZE=5242880
│   FILE_TTL_DAYS=30
│   MESSAGES_PER_ROOM=200
│   MESSAGES_PER_DM=100
└── data/
    ├── community.db            # SQLite
    └── uploads/                # Dosyalar (UUID isimleriyle)
```

---

## 15. Geliştirme Fazları

### Faz 1: Altyapı + Profil + Chat + Dosya (Öncelik: Yüksek)

| # | Görev | Proje | Tahmini |
|---|-------|-------|---------|
| 1.1 | Community App `app.json` manifest | CloudComputer | ~30 satır |
| 1.2 | Hub bağlantı yöneticisi (WS connect/reconnect/auth) | CloudComputer | ~150 satır |
| 1.3 | Setup wizard (nickname/avatar/bio) | CloudComputer | ~200 satır |
| 1.4 | IndexedDB cache altyapısı | CloudComputer | ~100 satır |
| 1.5 | Chat UI + mantığı (odalar, DM, mesaj gönder/al) | CloudComputer | ~300 satır |
| 1.6 | Dosya paylaşımı (client resize + upload + inline preview) | CloudComputer | ~150 satır |
| 1.7 | Presence (online kullanıcılar) | CloudComputer | ~80 satır |
| 1.8 | Template + CSS (dark theme) | CloudComputer | ~800 satır |
| | | | |
| 1.H1 | Hub server iskeleti (Express + WS + SQLite) | Hub (ayrı) | ~150 satır |
| 1.H2 | Auth sistemi (register + login + token) | Hub (ayrı) | ~80 satır |
| 1.H3 | Chat relay + ring buffer | Hub (ayrı) | ~100 satır |
| 1.H4 | Dosya upload/download/temizlik | Hub (ayrı) | ~80 satır |
| 1.H5 | Presence tracker (delta broadcast) | Hub (ayrı) | ~60 satır |

### Faz 2: Forum (Öncelik: Orta)

| # | Görev | Proje |
|---|-------|-------|
| 2.1 | Forum UI (kategori, thread listesi, thread detay) | CloudComputer |
| 2.2 | Forum yazma (yeni başlık, yanıt, Markdown editor) | CloudComputer |
| 2.3 | Forum cache + sayfalama | CloudComputer |
| 2.H1 | Forum CRUD (thread, reply, like) | Hub (ayrı) |
| 2.H2 | Forum real-time broadcast | Hub (ayrı) |

### Faz 3: Oyunlar (Öncelik: Orta, Faz 2 ile paralel)

| # | Görev | Proje |
|---|-------|-------|
| 3.1 | Oyun altyapısı (oda listesi, eşleşme UI) | CloudComputer |
| 3.2 | XOX motoru + UI | CloudComputer |
| 3.3 | Taş-Kağıt-Makas motoru + UI | CloudComputer |
| 3.4 | Satranç motoru + UI | CloudComputer |
| 3.5 | Tavla motoru + UI | CloudComputer |
| 3.H1 | Oyun matchmaking (create/join/cancel) | Hub (ayrı) |
| 3.H2 | Oyun mesaj relay (move iletme) | Hub (ayrı) |
| 3.H3 | İstatistik güncelleme (win/loss/draw) | Hub (ayrı) |

### Faz 4: Moderasyon ve Sosyal (Öncelik: Düşük)

| # | Görev |
|---|-------|
| 4.1 | Client-side kullanıcı engelleme (block) |
| 4.2 | İçerik raporlama |
| 4.3 | Kelime filtresi (client-side) |
| 4.4 | Arkadaş listesi |
| 4.5 | Profil rozetleri (oyun başarıları) |
| 4.H1 | Hub admin panel (ban, rapor inceleme) |

---

## 16. Örnek Senaryolar

### Senaryo 1: İlk Kullanım
1. Kullanıcı store'dan Community'yi yükler
2. Uygulamayı açar → client `wss://community.aysi.net` bağlantısı kurar
3. localStorage'da token yok → Setup wizard gösterilir
4. Nickname: "GamerTR42", Avatar: 🦊, Bio: "CloudPC seviyor"
5. Client → Hub: register → Hub: nickname müsait → userId + authToken döner
6. Client token'ı localStorage'a kaydeder
7. Lobby odasına otomatik katılır, online kullanıcıları görür

### Senaryo 2: Satranç
1. GamerTR42 → Oyunlar sekmesi → "Satranç Odası Oluştur"
2. Hub'a game.create gider → açık oyunlar listesinde görünür
3. CoolCat → Oyunlar → "GamerTR42'nin satranç odasına Katıl"
4. Hub → her iki client'a game.started gönderir
5. Client'lar satranç board'unu render eder (client-side ChessEngine)
6. Hamleler WS üzerinden relay edilir, her client bağımsız doğrular
7. Şah mat → her iki client game.end gönderir → Hub istatistik günceller

### Senaryo 3: Dosya Paylaşımı
1. LionKing → Chat'te 📎 butonu → dosya seçer (3.2MB PNG)
2. Client: canvas ile resize (max 1920px) + WebP dönüşüm → 800KB
3. Client: thumbnail üretir (200px, ~15KB base64)
4. HTTPS POST `community.aysi.net/files/upload` → fileId alır
5. WS: chat.send { content: "Bakın!", attachments: [{fileId, thumb: "base64..."}] }
6. Diğer client'lar mesajda inline thumbnail görür (base64, anında)
7. Tıklayınca tam dosya hub'dan indirilir

### Senaryo 4: Bağlantı Kopması
1. GamerTR42'nin internet bağlantısı kopar
2. Client offline algılar → "Bağlantı kesildi, yeniden bağlanılıyor..." gösterir
3. Yazılan mesajlar offline kuyruğa eklenir
4. Bağlantı gelince → auth → chat.sync(since: lastMessageTs) → delta mesajlar alınır
5. Offline kuyruk gönderilir
6. Kullanıcı hiçbir mesajı kaçırmaz (cache + delta sync)

---

## 17. Açık Sorular (Karar Gerekli)

| # | Soru | Önerilen Cevap |
|---|------|----------------|
| 1 | **Avatar preset sayısı:** Kaç emoji? | 32 adet (4 kategori × 8) + özel resim |
| 2 | **Oyun sırası:** Hangisi önce? | XOX + TKM (basit) → Satranç → Tavla |
| 3 | **Forum kategorileri:** Sabit mi? | İlk sürümde sabit 7 kategori |
| 4 | **Mesaj ring buffer boyutu:** Oda başına kaç mesaj? | 200 mesaj/oda, 100 mesaj/DM çifti |
| 5 | **Dosya boyut limiti:** 5MB yeterli mi? | 5MB önerisi (sunucu yükü azaltma) |
| 6 | **Markdown kütüphanesi:** Hangisi? | marked.js (CDN, 7KB gzip) |
| 7 | **Bildirim:** CloudComputer notification ile entegre mi? | Evet, yeni DM/oyun daveti gelince local notification |
| 8 | **Mobil uyumluluk:** mobile.html entegrasyonu? | Faz 1'de sadece desktop, Faz 2'de mobil |
| 9 | **Çoklu cihaz:** Aynı userda farklı CloudComputer'dan giriş? | clientId farklı olacağı için otomatik ayrı hesap |
| 10 | **Hesap kurtarma:** Token kaybedilirse? | Yeni hesap oluşturma (nickname başkası almadıysa geri alınabilir — Faz 4) |

---

## 18. Risk Analizi

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| Hub bağlantı kopması | Yüksek | Orta | Auto-reconnect + offline kuyruk + delta sync |
| Nickname çakışması | Orta | Düşük | Anlık availability check + öneri |
| Hub disk dolması | Orta | Yüksek | 10GB hard limit + 30 gün TTL + FIFO |
| Spam/flood | Orta | Orta | Rate limiting (20 msg/min) |
| Hub performans | Düşük | Yüksek | Thin server mimarisi — minimum iş yükü |
| Hile (oyunlarda) | Düşük | Düşük | Karşı taraf client'ı doğrular, eğlence amaçlı platform |
| localStorage silinmesi | Orta | Orta | Yeni hesap oluşturma, mesaj geçmişi kaybolur |
| XSS | Düşük | Yüksek | Client-side DOMPurify sanitization |

---

*Bu döküman Community platformunun hem client (CloudComputer) hem hub (ayrı proje) tarafı için referans spesifikasyondur. Onay sonrası implementasyona geçilecektir.*

*Hub sunucu kodu ayrı bir repository'de geliştirilecektir.*
