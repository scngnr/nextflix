# Nextflix — Profesyonel Netflix Benzeri Platform Yol Haritası

Bu doküman, projeyi gerçek Netflix deneyimine yaklaştırmak için adım adım
yapılacakları önceliklendirilmiş şekilde listeler. Her adım bağımsız olarak
geliştirilip test edilebilecek küçük parçalara bölünmüştür. Adımları **sırayla**
uygulayacağız; her biri bittiğinde işaretleyip bir sonrakine geçeceğiz.

---

## Mevcut Sorunlar (Tespit)

Ekran görüntülerinden ve koddan tespit edilen başlıca problemler:

1. **Yanlış görsel oranı:** Satırlarda 16:9 `backdrop` görselleri kullanılıyor.
   Gerçek Netflix satırlarda **2:3 dikey poster** kullanır. Backdrop'lar kırpık
   sahne gibi durduğu için amatör görünüyor.
2. **Hover kartı kopuk:** Hover kartı tile'ın altında (`top-full`) aniden
   açılıp kapanıyor. Netflix'te kart **yerinde büyür**, komşularını iter,
   yumuşak gecikme (delay) ve scale animasyonu vardır.
3. **Kaydırma amatör:** `drag-to-scroll` + serbest kaydırma, kenarlarda yarım
   kalan kartlar. Netflix **sayfa sayfa (paged)** kayar, ok'a basınca tam bir
   ekran genişliği ilerler ve kenarda "peek" (yarım görünen sonraki) bırakır.
4. **Hover'da z-index/taşma sorunları:** Büyüyen kart `overflow` ve satır
   kenarlarında kırpılıyor.
5. **Görsel boyutu düşük:** `w300` TMDB görselleri büyük ekranlarda bulanık.

---

## Yol Haritası

### Aşama 1 — Carousel'i Profesyonelleştir (TAMAMLANDI)

- [x] **1.1 — Poster oranına geç:** Satır tile'larında `w500` poster
      (`poster_path`, 2:3) kullan; backdrop yerine. Hero ve modalda backdrop
      kalsın.
- [x] **1.2 — Sayfalı kaydırma (paged scroll):** Ok'lara basınca konteyner
      genişliği kadar `scrollBy` ile yumuşak (`behavior: smooth`) ilerleme.
      Başta sol ok gizli, sonda sağ ok gizli.
- [x] **1.3 — Kenar "peek" ve responsive sütun sayısı:** Ekran boyutuna göre
      `vw` tabanlı kart genişliği ve kenarda yarım kart.
- [x] **1.4 — Hover expand (yerinde büyüme):** Tile hover'da `scale` ile
      350ms gecikmeli büyür, kenarlarda `origin` ayarlı, üst z-index ile
      kırpılmadan komşuların üzerine taşar.
- [x] **1.5 — Hover bilgi paneli:** Oynat / Listeye Ekle / Beğen / Detay
      butonları, eşleşme yüzdesi, başlık.

### Aşama 2 — Hero (Üst Banner) (TAMAMLANDI)

- [x] **2.1 — Otomatik fragman:** Hero'da ~2.5sn sonra sessiz trailer
      otomatik oynar (YouTube/MP4), üzerine gradient maske.
- [x] **2.2 — Ses aç/kapa ve yeniden oynat** kontrolü (sağ alt köşe).
- [x] **2.3 — Logo/başlık görseli:** Varsa TMDB logo görseli, yoksa başlık;
      yaş sınırı (sertifika) rozeti.

### Aşama 3 — İçerik Detay Modalı (TAMAMLANDI)

- [x] **3.1 — Netflix tarzı modal:** Üstte otomatik trailer, altında özet +
      "Benzer İçerikler" grid'i.
- [x] **3.2 — Bölüm listesi (diziler için):** Sezon seçici + bölüm kartları.
- [x] **3.3 — Cast, tür, yönetmen** meta bilgileri.

### Aşama 4 — Kişiselleştirme & Profiller (TAMAMLANDI)

- [x] **4.1 — Giriş sonrası profil seçimi:** `/switch-profile` yumuşak
      yönlendirme (oturum bazlı, döngüsüz).
- [x] **4.2 — Header'da aktif profil avatarı** (DB profili).
- [x] **4.3 — "Continue Watching" satırı:** localStorage tabanlı, ilerleme
      çubuğu ile.
- [x] **4.4 — "My List" entegrasyonu:** Kartlardaki + butonu gerçekten kaydeder
      (context + optimistic UI).

### Aşama 5 — İzleme Deneyimi (Watch Page) (TAMAMLANDI)

- [x] **5.1 — Özel oynatıcı kontrolleri:** MP4 için ileri/geri 10sn, ses,
      tam ekran, ilerleme çubuğu; YouTube için native oynatıcı.
- [x] **5.2 — Geri dön üst bar** (otomatik gizlenen kontrollerle).
- [x] **5.3 — İlerleme kaydetme** (localStorage → Continue Watching).

### Aşama 6 — Performans & Cila (TAMAMLANDI)

- [x] **6.1 — `next/image`** ile görsel optimizasyonu ve `sizes` ayarı
      (hero, carousel, Top 10, continue watching, benzer içerikler, bölümler,
      arama sonuçları).
- [x] **6.2 — Skeleton/loading durumları:** `(main)/loading.tsx`, `HeroSkeleton`,
      `RowSkeleton`, bölüm yükleme spinner'ı.
- [x] **6.3 — Erişilebilirlik:** global `:focus-visible` ring, `aria-label`'lar,
      ok/tile butonları klavye erişimli.
- [x] **6.4 — Mobil dokunmatik:** mobilde hover yerine tap, `snap-x` ile
      sayfalı momentum scroll.

> Düzeltme: Hero trailer'ı kapsayıcıya `overflow-hidden` eklenerek alt satıra
> taşması engellendi.

---

## Aşama 7 — İleri Düzey Özellikler (Öneriler)

### 7A — Keşif & İçerik
- [x] **7.1 — "En Çok İzlenen 10" satırı:** Büyük sıra numaralı ranked row.
- [x] **7.2 — Tür bazlı gezinme sayfaları:** `/browse/[id]?mediaType=` + tür chip'leri,
      Film/Dizi geçişi, IntersectionObserver ile sonsuz kaydırma. Header'a "Türler".
- [x] **7.3 — "Çünkü X izledin" kişiselleştirilmiş satırlar:** İzlemeye devam et
      (localStorage) en son içerikten TMDB recommendations ile satır.
- [x] **7.4 — Tile üzerinde mini fragman önizleme:** Hover'da (gecikmeli) kart içinde
      sessiz, döngülü YouTube fragmanı (cover kırpma).
- [x] **7.5 — "Yakında / Yeni Eklenenler"** satırları (upcoming + now_playing).

### 7B — Oynatıcı & İzleme
- [ ] **7.6 — Sonraki bölüm otomatik oynatma** (diziler), "Sonraki Bölüm" butonu.
      _Ertelendi: gerçek bölüm video kaynağı yok (yalnızca fragman)._
- [~] **7.7 — Altyazı & ses dili seçimi** (gerçek video track'i yok, ertelendi);
      **oynatma hızı (0.5x–2x)** eklendi.
- [x] **7.8 — Klavye kısayolları:** boşluk/K (oynat/duraklat), ←/→ (10sn),
      ↑/↓ (ses), F (tam ekran), M (sessiz).
- [x] **7.9 — Ses seviyesi kaydırıcısı** (hover'da açılan range).

### 7C — Kişiselleştirme & Sosyal
- [x] **7.10 — Beğen (thumbs) kalıcı kayıt:** `liked_shows` DB + optimistic UI;
      ana sayfada **"Beğendiklerin"** satırı (`LikedShowsRow`).
- [~] **7.11 — Çocuk içerik:** `/kids` hub (TMDB TV `10762`, film Aile+Animasyon),
      ana sayfada "Çocuklar İçin" satırı; `src/lib/kids-content.ts` ile ileride
      **YouTube Kids** birleşimine hazır (`youtube_kids` feed, şimdilik kapalı).
      _Profil bazlı yaş filtresi hâlâ Aşama 8/DB._
- [ ] **7.12 — Profil başına avatar galerisi seçimi.** _(Aşama 8/DB)_
- [ ] **7.13 — Bildirim merkezi** (yeni içerik, devam eden diziler). _(Aşama 8/DB)_

### 7D — Platform & Altyapı
- [x] **7.14 — i18n (TR/EN):** `canflix_locale` çerezi, üst menüde TR/EN
      değiştirici, arayüz sözlükleri; TMDB isteklerine `language` + `region`
      (`tr-TR`/`TR`, `en-US`/`US`). Admin paneli hâlâ sabit dilde.
- [x] **7.15 — Continue Watching'i DB'ye taşındı** (`watch_progress`, cihazlar
      arası). Oturum açık kullanıcılarda sunucudan, kapalıyken localStorage.
- [ ] **7.16 — PWA desteği** (yüklenebilir, çevrimdışı kabuk). _(ertelendi)_
- [x] **7.17 — Suspense ile satır bazlı streaming** (`CarouselRow` + `RowSkeleton`,
      ana sayfada her satır ayrı yüklenir).
- [x] **7.18 — SEO:** `show/[id]` ve `browse/[id]` için dinamik `generateMetadata`
      (başlık, açıklama, OG/Twitter görseli).
- [x] **7.19 — Aktör/kişi sayfası** (`/person/[id]`): foto, biyografi, doğum
      bilgisi + "Sahne Aldığı Yapımlar" ızgarası. Modaldeki oyuncu isimleri
      bu sayfaya bağlanır.

---

## Aşama 8 — Veritabanı Tabanlı Özellikler (Öneriler)

`.env.local`'deki Neon/Postgres veritabanı + Drizzle ile yapılabilecek kalıcı,
kişiye/cihaza bağlı özellikler:

### 8A — İzleme verisi
- [x] **8.1 — Beğeniler tablosu (`liked_shows`)** — uygulandı.
- [x] **8.2 — `watch_progress` tablosu:** İçerik bazında ilerleme oranı kaydı;
      cihazlar arası "İzlemeye Devam Et". mp4/hls'de gerçek oran, Drive'da
      "açıldı" kaydı. (`upsertWatchProgressAction`, `getContinueWatching`)
- [x] **8.3 — İzleme geçmişi:** `watch_progress` aynı zamanda son izlenenleri
      `updatedAt`'e göre tutar; ana sayfada "İzlemeye Devam Et" satırı.
- [ ] **8.4 — Bölüm bazlı ilerleme:** Diziler için sezon/bölüm konumu.
      _(ertelendi — bölüm seçimi oynatıcıya entegre edilince)_

### 8B — Kişiselleştirme & öneri
- [ ] **8.5 — Tür tercihleri / puanlama:** Beğeni+geçmişten tür ağırlıkları
      hesaplayıp "Sana Özel" satırı üretme. _(ertelendi)_
- [ ] **8.6 — "Hatırlat / Listeme ekle (Yakında)"** tablosu, çıkışta bildirim.
      _(ertelendi)_
- [x] **8.7 — Arama geçmişi** (`search_history`) + arama sayfasında "Son
      Aramalar" çipleri. (`addSearchAction`, `getRecentSearches`)

### 8C — Profil & hesap
- [ ] **8.8 — Profil ayarları:** dil, otomatik oynatma, olgunluk seviyesi.
      _(ertelendi — i18n 7.14 ile birlikte)_
- [ ] **8.9 — Çocuk profili bayrağı** (`is_kids`) + içerik filtresi. _(ertelendi)_
- [ ] **8.10 — Cihaz/oturum yönetimi:** aktif oturumlar tablosu.
      _(ertelendi — Clerk zaten oturum yönetimi sağlıyor)_

### 8D — Sosyal & etkileşim
- [x] **8.11 — Kullanıcı puanlaması** (`ratings` tablosu, 1–5 yıldız): İçerik
      modal/detay sayfasında "Puanın" yıldızları, kişiye özel kayıt.
      (`setRatingAction`, `removeRatingAction`, `getUserRating`)
      _Not: Yorum metni ve çoklu kullanıcı ortalaması admin/çok kullanıcı
      senaryosuna ertelendi._
- [ ] **8.12 — Paylaşılan listeler:** profiller arası ortak "İzleme Listesi".
      _(ertelendi — çoklu hesap/davet akışı gerektirir, tek kullanıcı için düşük
      değer.)_
- [ ] **8.13 — Bildirim tablosu:** okundu/okunmadı durumlu bildirim merkezi.
      _(ertelendi — bildirim üreten gerçek olay kaynağı yok; Admin Panel'deki
      "duyuru" özelliğiyle birlikte ele alınmalı — bkz. Aşama 11.)_

> Not: Yeni tablo eklerken `src/db/schema.ts` güncellenir, `npm run generate`
> ile SQL üretilir, `npm run migrate` ile Neon'a uygulanır (idempotent).

---

## Aşama 9 — Profesyonel / Production-Grade Geliştirmeler

Platformu gerçek bir ürün seviyesine taşıyacak mühendislik maddeleri:

### 9A — Performans & Önbellekleme
- [ ] **9.1 — TMDB yanıtlarını önbelleğe al:** `fetch` revalidate (ISR) veya
      Redis/Upstash ile sunucu tarafı cache; satır verilerini `revalidate: 3600`.
- [ ] **9.2 — Resim CDN & blur placeholder:** `next/image` için `placeholder="blur"`
      + `blurDataURL`, AVIF/WebP, uzak görseller için `remotePatterns`.
- [ ] **9.3 — Route segment & data cache stratejisi:** `dynamic`, `revalidate`,
      `cache` ayarlarının sayfa bazında bilinçli yönetimi.
- [ ] **9.4 — Bundle analizi & kod bölme:** `@next/bundle-analyzer`, ağır
      bileşenlerde `next/dynamic` (lazy) + `loading` fallback.
- [ ] **9.5 — Prefetch & öncelik:** Hero görselinde `priority`, kritik olmayan
      satırlarda lazy + `IntersectionObserver` tabanlı yükleme.

### 9B — Güvenlik
- [ ] **9.6 — Rate limiting:** Server action'lar ve arama için Upstash Ratelimit.
- [ ] **9.7 — Güvenlik başlıkları:** CSP, HSTS, X-Frame-Options, Referrer-Policy
      (`next.config` headers veya middleware).
- [ ] **9.8 — Girdi doğrulama & sanitizasyon:** Tüm action'larda Zod şemaları,
      kullanıcı içeriklerinde XSS koruması.
- [ ] **9.9 — Yetkilendirme katmanı:** Profil/hesap sahipliği kontrollerinin
      merkezîleştirilmesi (helper) ve IDOR önleme.
- [ ] **9.10 — Sırların yönetimi:** `.env` şeması (`env.mjs`) zorunlu alanlar,
      üretimde gizli anahtar denetimi.

### 9C — Gözlemlenebilirlik & Kalite
- [ ] **9.11 — Hata izleme:** Sentry entegrasyonu (client + server + edge),
      kaynak haritaları.
- [ ] **9.12 — Analitik & ürün metrikleri:** Sayfa görüntüleme, oynatma,
      tamamlanma oranı eventleri (PostHog/Umami).
- [ ] **9.13 — Yapısal loglama:** Sunucu tarafı log (pino) + istek kimlikleri.
- [ ] **9.14 — Web Vitals izleme:** `useReportWebVitals` ile LCP/CLS/INP raporu.
- [ ] **9.15 — Sağlık kontrolü:** `/api/health` (DB + TMDB erişilebilirlik).

### 9D — Test & CI/CD
- [ ] **9.16 — Birim & bileşen testleri:** Vitest + React Testing Library.
- [ ] **9.17 — E2E testleri:** Playwright (giriş, gezinme, oynatma, beğeni akışı).
- [ ] **9.18 — CI hattı:** GitHub Actions — lint + typecheck + test + build.
- [ ] **9.19 — Tip güvenliği:** `ignoreBuildErrors`/`ignoreDuringBuilds` kaldırılıp
      derlemede tip & lint zorunlu hale getirilmesi.
- [ ] **9.20 — Pre-commit hooks:** Husky + lint-staged (format + lint).

### 9E — Ölçeklenebilirlik & Mimari
- [ ] **9.21 — TMDB istemcisinde retry/timeout & devre kesici** (circuit breaker).
- [ ] **9.22 — Sunucu önbellek katmanı:** `React.cache`/`unstable_cache` ile
      tekrarlı TMDB çağrılarının istek içi paylaşımı.
- [ ] **9.23 — Tip üretimi:** TMDB yanıtları için tam tipler (zod-to-ts veya
      üretilmiş şemalar).
- [ ] **9.24 — Özellik bayrakları (feature flags):** Kademeli sürüm/A-B testi.
- [ ] **9.25 — i18n altyapısı:** `next-intl` ile yönlendirilmiş çoklu dil.

### 9F — UX & Erişilebilirlik Cilası
- [ ] **9.26 — Tam klavye navigasyonu:** Satırlarda ok tuşları, `roving tabindex`.
- [x] **9.27 — Reduced motion desteği:** `prefers-reduced-motion` ile animasyon
      azaltma (`globals.css`).
- [ ] **9.28 — Boş/hata durumları:** Tüm sayfalarda tutarlı empty & error UI
      (`error.tsx`, `not-found.tsx`).
- [ ] **9.29 — Toast & optimistic geri alma:** Beğeni/listeden çıkarma için
      "Geri al" aksiyonu.
- [ ] **9.30 — SEO & paylaşım:** Dinamik `generateMetadata`, OG görselleri,
      `sitemap.xml`, `robots.txt`, JSON-LD yapısal veri.

---

## Aşama 10 — Kendi Video Kaynakları (Drive → R2/Bunny)

Gerçek film oynatma için altyapı (kod tarafı **tamamlandı**):

- [x] **10.1 — `movie_sources` DB tablosu:** `(id, mediaType)` PK, `kind`
      (mp4/hls/drive/youtube), `url`, `title`. Migration uygulandı.
- [x] **10.2 — İzleme sayfası DB entegrasyonu:** Önce DB kaynağı, yoksa
      `custom-videos` map, yoksa TMDB fragmanı.
- [x] **10.3 — Oynatıcı:** mp4 (R2) + **HLS (hls.js, Bunny)** + Drive `preview`
      iframe modu. Özel kontroller/ilerleme yalnızca mp4/hls'te çalışır.
- [x] **10.4 — Import scripti:** `npm run import:sources` — `data/sources.json`
      okur, TMDB'de başlık→id eşler, `movie_sources`'a upsert eder.
- [x] **10.5 — Drive envanter:** `scripts/drive-inventory.gs` (Apps Script)
      klasörü tarar, `nextflix-sources.json` üretir.

### Kullanıcının yapacağı adımlar
1. **Envanter:** `scripts/drive-inventory.gs`'i Apps Script'te çalıştır →
   `nextflix-sources.json`'u indir, `data/sources.json` olarak kaydet.
2. **Taşıma (önerilen):** Dosyaları Cloudflare R2'ye `rclone` ile kopyala:
   `rclone copy drive:Filmler r2:nextflix-videos -P`. Bucket'ı public yap,
   CORS'a site domainini ekle. Her kaydın `url`'ini R2 adresiyle, `kind`'ı
   `mp4` ile güncelle. (Bunny Stream kullanırsan `kind: "hls"` + `.m3u8`.)
3. **İçe aktar:** `npm run import:sources` → eşleşmeyen başlıkları rapor eder,
   onlara elle `tmdbId` ekleyip tekrar çalıştır.

> Drive'da kalmak istersen `kind: "drive"` bırak — `preview` iframe ile oynar
> ama büyük/popüler dosyalarda Google kota hatası verir ve özel oynatıcı
> özellikleri (ilerleme, kısayollar) çalışmaz. Bu yüzden R2/Bunny önerilir.

---

## Aşama 11 — Yönetici (Admin) Paneli

Yalnızca yetkili kullanıcıların eriştiği, içerik ve kullanıcı yönetimi için
`/admin` altında bir panel. Erişim Clerk rolü (`publicMetadata.role === "admin"`)
veya `.env`'deki `ADMIN_USER_IDS` listesiyle korunur; `middleware`/layout'ta
kontrol edilir.

### 11A — Erişim & Altyapı
- [x] **11.1 — Admin girişi (DB):** `admin_users` tablosu, varsayılan
      `admin` / `123456`, imzalı `admin_session` çerezi. Clerk'ten bağımsız.
      İlk girişte `/admin/change-password` ile zorunlu şifre yenileme.
- [x] **11.2 — `/admin` layout:** Yan menü + `/admin/login` + çıkış butonu.
      Yetkisiz erişim → `/admin/login`.
- [ ] **11.3 — Denetim kaydı (`audit_log`):** Kim, ne zaman, hangi değişikliği
      yaptı (kaynak ekleme/silme vb.). _(ertelendi)_

### 11B — Video Kaynak Yönetimi (`movie_sources`)
- [x] **11.4 — Kaynak listesi:** `/admin/sources` — arama (başlık ilike),
      sayfalama, TMDB başlığı + poster; satırda tür/kind/URL + içeriğe link.
- [x] **11.5 — Kaynak ekle/düzenle:** TMDB araması ile içerik seç, `kind`
      (mp4/hls/drive/youtube) + `url` gir, `movie_sources`'a upsert
      (`adminUpsertSource`). Silme `adminDeleteSource`.
- [ ] **11.6 — Toplu içe aktarma UI:** `data/sources.json` yükle, eşleşmeyenleri
      ekranda elle eşle. _(ertelendi — şimdilik `npm run import:sources` script)_
- [ ] **11.7 — Bozuk link denetimi:** URL'lerin erişilebilirliğini kontrol eden
      job + "ölü kaynak" rozeti. _(ertelendi)_

### 11C — İçerik Küratörlüğü
- [ ] **11.8 — Öne çıkanlar/Hero yönetimi:** Ana sayfa hero ve özel satırların
      (örn. "Editörün Seçimi") elle düzenlenmesi (`featured` tablosu).
- [ ] **11.9 — Özel koleksiyon/sıra oluşturma:** İçerik id'lerinden manuel
      koleksiyon; ana sayfada satır olarak gösterim.
- [ ] **11.10 — İçerik gizleme/engelleme:** Belirli başlıkları katalogdan gizleme.

### 11D — Kullanıcı & Moderasyon
- [x] **11.11 — Kullanıcı listesi & admin atama:** `/admin/users` — kayıtlı
      hesaplar, &quot;Admin yap&quot; ile menüde Admin Panel linki (`accounts.can_access_admin_panel`).
- [ ] **11.12 — Yorum/puan moderasyonu:** (8.11 yorumlar açılırsa) raporlanan
      içerikleri inceleme/silme.
- [ ] **11.13 — Kullanıcı askıya alma:** Clerk üzerinden ban/suspend.

### 11E — Duyuru & Metrikler
- [ ] **11.14 — Duyuru/bildirim yayını:** Admin'in tüm kullanıcılara bildirim
      göndermesi → 8.13 bildirim tablosunu besler. _(ertelendi)_
- [x] **11.15 — Gösterge paneli (dashboard):** `/admin` — hesap, profil, kaynak,
      puanlama, izlemeye devam, beğeni sayıları kartları (`getAdminStats`).
- [ ] **11.16 — Dışa aktarma:** Kaynak/kullanıcı verisini CSV/JSON indirme.
      _(ertelendi)_

> **Admin girişi:** `/admin/login` — kullanıcı `admin`, şifre `123456`.
> İlk girişte yeni şifre belirlemeniz zorunludur. Site Clerk oturumundan bağımsızdır.

> Öneri sırası: önce **11.1–11.2** (erişim + layout), sonra **11.4–11.6**
> (kaynak yönetimi — en pratik fayda), ardından **11.15** (dashboard).

---

## Çalışma Düzeni

1. Her aşamayı **alt adımlar** halinde tek tek uygulayacağız.
2. Her adımdan sonra `npm run build` ile doğrulama yapacağız.
3. Önce **Aşama 1 (Carousel)** ile başlıyoruz — en görünür iyileşme burada.

> Not: cPanel dağıtımı için build her zaman **lokalde** alınacak, `.next`
> klasörü sunucuya yüklenecek (`node_modules` ve `.git` yüklenmez).
