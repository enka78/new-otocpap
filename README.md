# OtoCPAP - E-Ticaret Web Sitesi

Modern ve kullanıcı dostu CPAP, BiPAP ve solunum cihazları e-ticaret platformu.

## 🚀 Özellikler

### 🛒 E-Ticaret Sistemi

- **Akıllı Sepet Sistemi**: Cihazlardan sadece 1 adet, maske/aksesuarlardan istediği kadar
- **WhatsApp Sipariş**: Otomatik WhatsApp entegrasyonu ile sipariş verme
- **Kategori Bazlı Filtreleme**: Ürünleri kategoriye göre filtreleme
- **Fiyat Görünürlüğü**: Üye kullanıcılar için özel fiyat görüntüleme

### 👤 Kullanıcı Yönetimi

- **Supabase Auth**: Güvenli kullanıcı kimlik doğrulama
- **Popup Modal**: Modern giriş/kayıt arayüzü
- **Profil Yönetimi**: Kullanıcı bilgileri ve sipariş geçmişi

### 📱 Modern Arayüz

- **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm
- **Toast Bildirimleri**: Kullanıcı dostu bildirim sistemi
- **Dinamik Banner**: Yönetilebilir ana sayfa banner'ları
- **Çok Dilli Destek**: Türkçe/İngilizce dil desteği

### 📝 İçerik Yönetimi

- **Blog Sistemi**: Makale yayınlama ve yorum sistemi
- **Ürün Galerisi**: Çoklu resim desteği ve placeholder sistemi
- **Marka Logoları**: Dinamik marka logo yönetimi

## 🛠️ Teknoloji Stack

- **Framework**: Next.js 15.4.5 (App Router)
- **Dil**: TypeScript
- **Styling**: Tailwind CSS v4
- **Veritabanı**: Supabase (PostgreSQL)
- **Kimlik Doğrulama**: Supabase Auth
- **Dosya Depolama**: Supabase Storage
- **İkonlar**: Lucide React
- **Çok Dilli**: next-intl

## 📦 Kurulum

### Gereksinimler

- Node.js 18+
- npm veya yarn
- Supabase hesabı

### Adımlar

1. **Projeyi klonlayın**

```bash
git clone https://github.com/enka78/new-otocpap.git
cd new-otocpap/otocpap-website
```

2. **Bağımlılıkları yükleyin**

```bash
npm install
```

3. **Ortam değişkenlerini ayarlayın**

```bash
cp .env.example .env.local
```

`.env.local` dosyasını düzenleyin:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Geliştirme sunucusunu başlatın**

```bash
npm run dev
```

5. **Tarayıcıda açın**

```
http://localhost:3000
```

## 🗄️ Veritabanı Yapısı

### Ana Tablolar

- `products` - Ürün bilgileri
- `categories` - Ürün kategorileri
- `brands` - Marka bilgileri
- `blogs` - Blog yazıları
- `comments` - Blog yorumları
- `banners` - Ana sayfa banner'ları
- `orders` - Sipariş bilgileri

### Supabase Storage

- `products-images` - Ürün resimleri
- `blogs-images` - Blog resimleri
- `brands` - Marka logoları
- `banner-images` - Banner resimleri

## 🎯 Önemli Özellikler

### Sepet Sistemi

- **Cihaz Kısıtlaması**: Kategori ID'leri [1,3,5,7,8,9,10,11,13,14] cihaz olarak tanımlanır
- **Tek Cihaz Kuralı**: Sepette sadece 1 cihaz bulunabilir
- **Sınırsız Aksesuar**: Maske ve aksesuarlardan istediği kadar eklenebilir

### WhatsApp Entegrasyonu

- **Otomatik Mesaj**: Sipariş detayları otomatik WhatsApp mesajı olarak hazırlanır
- **Adres Bilgileri**: Teslimat bilgileri dahil edilir
- **Kategori Gruplandırma**: Ürünler kategoriye göre gruplandırılır

### Çok Dilli Sistem

- **next-intl**: Profesyonel çeviri sistemi
- **Dinamik Dil**: URL tabanlı dil değiştirme
- **Çeviri Dosyaları**: `messages/tr.json` ve `messages/en.json`

## 🚀 Deployment

### Vercel (Önerilen)

```bash
npm run build
vercel --prod
```

### Diğer Platformlar

```bash
npm run build
npm start
```

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎨 Tasarım Sistemi

### Renkler

- **Primary**: Blue-600 (#2563eb)
- **Success**: Green-600 (#16a34a)
- **Warning**: Orange-600 (#ea580c)
- **Error**: Red-600 (#dc2626)

### Tipografi

- **Font**: Inter (Google Fonts)
- **Başlıklar**: font-bold
- **Metin**: font-normal

## 🔧 Geliştirme

### Komutlar

```bash
npm run dev          # Geliştirme sunucusu
npm run build        # Production build
npm run start        # Production sunucu
npm run lint         # ESLint kontrolü
```

### Klasör Yapısı

```
src/
├── app/[locale]/    # Sayfa rotaları
├── components/      # React bileşenleri
├── contexts/        # React context'leri
├── lib/            # Yardımcı fonksiyonlar
└── i18n/           # Çeviri konfigürasyonu
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Website**: [otocpap.com](https://otocpap.com)
- **WhatsApp**: +90 553 280 82 73
- **Email**: ibrahim@otocpap.com

## 🙏 Teşekkürler

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Lucide](https://lucide.dev/) - İkon kütüphanesi

---

**OtoCPAP** - Uyku ve solunum cihazları konusunda 20 yıllık tecrübe 💤
