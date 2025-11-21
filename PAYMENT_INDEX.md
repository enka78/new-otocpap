# 📖 Sanal POS Ödeme Sistemi - Dokümantasyon İndeksi

## 🎯 Hızlı Erişim

### 🚀 Başlamak İçin (İlk Kez Mi Kuruyorsunuz?)

👉 **[PAYMENT_QUICKSTART.md](./PAYMENT_QUICKSTART.md)**

- 30 dakikada sistemi hazırla
- Adım adım talimatlar
- Test kart numaraları

### 📋 Detaylı Kurulum Rehberi

👉 **[PAYMENT_SETUP.md](./PAYMENT_SETUP.md)**

- Tam sistem mimarisi açıklaması
- Desteklenen POS sağlayıcıları
- Database kurulumu
- API dokümantasyonu
- Webhook entegrasyonu
- Yeni POS ekleme template'i
- Sorun çözme rehberi

### 🏗️ Sistem Mimarisi Diyagramları

👉 **[PAYMENT_ARCHITECTURE.md](./PAYMENT_ARCHITECTURE.md)**

- Genel akış diyagramları
- Dosya yapısı ve bağlantıları
- Veri tablosu şeması
- State machine diyagramları
- Entegrasyon yolları
- ASCII art görselleştirmeler

### 🌍 Tercüme Anahtarları

👉 **[PAYMENT_TRANSLATIONS.md](./PAYMENT_TRANSLATIONS.md)**

- İngilizce (en.json) metinleri
- Türkçe (tr.json) metinleri
- i18n entegrasyon adımları
- Kopya-yapıştır hazır JSON

### ✅ İmplementasyon Özeti

👉 **[PAYMENT_IMPLEMENTATION_SUMMARY.md](./PAYMENT_IMPLEMENTATION_SUMMARY.md)**

- Oluşturulan dosyaların listesi
- Sistem özellikleri
- Sonraki adımlar
- Best practices
- Kontrol listesi

---

## 📁 Oluşturulan Dosyalar

### Type Tanımlamaları

```
src/types/payment.ts
├── PaymentProvider (Enum)
├── PaymentMethod (Enum)
├── PaymentStatus (Enum)
├── CardType (Enum)
├── PaymentTransaction (Interface)
├── PaymentRequest (Interface)
├── PaymentResponse (Interface)
├── PaymentWebhook (Interface)
├── PaymentConfig (Interface)
├── CardData (Interface)
└── InstallmentOption (Interface)
```

### Konfigürasyon & Logic

```
src/lib/payment-config.ts
├── POS_CONFIGS (Tüm sağlayıcılar)
├── getEnabledPosProvider()
├── getPosConfig()
├── createPosProvider()
└── getEnabledProviders()
```

### UI Bileşeni

```
src/components/PaymentScreen.tsx
├── Ödeme yöntemi seçimi
├── Kart bilgileri girişi
├── Taksit seçimi
├── Onay ekranı
└── Sonuç ekranı
```

### API Routes

```
src/app/api/payment/
├── process/route.ts        (POST - Ödeme başlatma)
├── status/route.ts         (GET - Durumu sorgulama)
├── webhook/route.ts        (POST - POS callback'leri)
└── providers/
    ├── paytr.provider.ts   (PayTR implementasyonu)
    ├── iyzipay.provider.ts (iyzipay şablonu)
    ├── param.provider.ts   (Param şablonu)
    └── nestpay.provider.ts (NestPay şablonu)
```

---

## 🎓 Öğrenim Yolları

### Alternatif 1: Hızlı Başla (⏱️ 30 dakika)

1. **PAYMENT_QUICKSTART.md** oku (5 dk)
2. Environment değişkenleri ayarla (3 dk)
3. Database tablosu oluştur (3 dk)
4. Konfigürasyon etkinleştir (1 dk)
5. Tercümeleri ekle (5 dk)
6. Modal'a entegre et (5 dk)
7. Test et (3 dk)

### Alternatif 2: Detaylı Öğren (⏱️ 2 saat)

1. **PAYMENT_ARCHITECTURE.md** oku (20 dk)
2. **PAYMENT_SETUP.md** oku (30 dk)
3. Dosyaları incele (30 dk)
4. **PAYMENT_TRANSLATIONS.md** oku (10 dk)
5. Kurulumu tamamla (20 dk)

### Alternatif 3: Geliştiriciler İçin (⏱️ 3 saat)

1. Tüm dokümantasyonu oku (1 saat)
2. Kaynak kodları incele (1 saat)
3. Yeni POS sağlayıcı oluştur (1 saat)
4. Test et ve debug'la

---

## 💾 Temel Dosya Listesi

| Dosya                                             | Amaç               | Zorunlu?            |
| ------------------------------------------------- | ------------------ | ------------------- |
| `src/types/payment.ts`                            | Tip tanımlamaları  | ✅ Evet             |
| `src/lib/payment-config.ts`                       | POS konfigürasyonu | ✅ Evet             |
| `src/components/PaymentScreen.tsx`                | Ödeme UI'ı         | ✅ Evet             |
| `src/app/api/payment/process/route.ts`            | Ödeme başlatma     | ✅ Evet             |
| `src/app/api/payment/webhook/route.ts`            | Webhook handler    | ✅ Evet             |
| `src/app/api/payment/status/route.ts`             | Durumu sorgulama   | ⚠️ İsteğe bağlı     |
| `src/app/api/payment/providers/paytr.provider.ts` | PayTR impl.        | ⚠️ Sanal POS'a göre |
| Tercüme anahtarları                               | UI metinleri       | ✅ Evet             |

---

## 🔧 Sistem Bağımlılıkları

### Harici Servisler

- **Sanal POS**: PayTR, iyzipay, Param veya NestPay
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **HTTP Client**: Fetch API (Built-in)

### Next.js Özellikleri

- API Routes
- Server Components
- Environment Variables
- i18n (next-intl)

### Paketler (Kurulu)

- `next`: ^15.4.5
- `@supabase/supabase-js`: ^2.53.0
- `next-intl`: ^4.3.4
- `lucide-react`: ^0.534.0 (İkonlar)

---

## 🚀 Deployment Checklist

### Development

- [ ] Sanal POS seçildi
- [ ] `.env.local` yapılandırıldı
- [ ] Database tablosu oluşturuldu
- [ ] Konfigürasyon etkinleştirildi
- [ ] Tercümeler eklendi
- [ ] Modal'a entegre edildi
- [ ] Test kart'larla test yapıldı

### Staging

- [ ] `.env.staging` yapılandırıldı
- [ ] Webhook URL'si ayarlandı
- [ ] POS dashboard'da webhook etkin
- [ ] E2E testler çalıştırıldı
- [ ] Performance test yapıldı

### Production

- [ ] `.env.production` yapılandırıldı
- [ ] SSL/HTTPS etkin
- [ ] Database backups etkin
- [ ] Error monitoring aktif (Sentry vb.)
- [ ] Rate limiting etkin
- [ ] CORS düzgün yapılandırıldı
- [ ] POS webhook'ları production'a geçti

---

## 📊 Dosya İstatistikleri

| Kategori             | Sayı   | Satırlar   |
| -------------------- | ------ | ---------- |
| TypeScript Dosyaları | 4      | ~1,200     |
| React Bileşenleri    | 1      | ~600       |
| API Routes           | 4      | ~400       |
| Dokümantasyon        | 5      | ~2,500     |
| **TOPLAM**           | **14** | **~4,700** |

---

## 🎯 Hedefler & Durumlar

### ✅ Tamamlanan

- [x] Type tanımlamaları
- [x] Konfigürasyon sistemi
- [x] PaymentScreen bileşeni
- [x] API routes
- [x] Webhook handler
- [x] PayTR provider implementasyonu
- [x] Dokümantasyon (5 dosya)

### ⏳ Beklemede (Sanal POS Seçilmeyi Bekliyor)

- [ ] Database tablosu oluşturma
- [ ] Environment değişkenleri ayarlama
- [ ] Tercümeleri ekleme
- [ ] Modal'a entegrasyon
- [ ] Test ödeme

### 🔮 Gelecek (İleride)

- [ ] iyzipay provider implementasyonu
- [ ] Param provider implementasyonu
- [ ] NestPay provider implementasyonu
- [ ] İade yönetim paneli
- [ ] Email bildirimleri
- [ ] SMS bildirimleri
- [ ] Analytics dashboard

---

## 📞 Destek & İletişim

### Hata Raporu

Bir sorunla karşılaşırsanız:

1. **PAYMENT_SETUP.md** → "Sorun Çözme" bölümünü kontrol et
2. **Error logs** → Browser console'da mesajlara bak
3. **Webhook logs** → Supabase'de transaction durumunu kontrol et
4. **POS dashboard** → API loglarına bak

### Sıkça Sorulan Sorular

- **S**: "Payment provider is not enabled" hatası alıyorum
- **C**: `payment-config.ts`'de `enabled: true` olduğundan emin olun

- **S**: Environment variables çalışmıyor
- **C**: `.env.local` dosyasını kontrol et, değerleri doğru gir

- **S**: Webhook alıyorum ama transaction güncellenmiyor
- **C**: Webhook URL'sini kontrol et, imza doğrulamasını test et

---

## 📚 Ek Kaynaklar

### Sanal POS Sağlayıcıları

- [PayTR Dokümantasyonu](https://www.paytr.com/tr/integration)
- [iyzipay Dokümantasyonu](https://docs.iyzipay.com)
- [Param Dokümantasyonu](https://www.param.com.tr)
- [NestPay Dokümantasyonu](https://www.nestpay.net)

### Teknik Referanslar

- [Next.js API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

---

## 🎉 Sonuç

Sanal POS ödeme sistemi için eksiksiz bir altyapı hazırlanmıştır.

**Şu an yapılması gereken:** Sanal POS sağlayıcısı seçmek ve kuruluma başlamak.

**Zaman:** 30 dakikada tamamen çalışan bir sistem elde edebilirsiniz.

**Başlamak için:** `PAYMENT_QUICKSTART.md` dosyasını okuyun.

---

**Son Güncelleme**: 20 Kasım 2024  
**Versiyon**: 1.0  
**Durum**: ✅ Hazır (Sanal POS Seçilmeyi Bekliyor)

---

## 📖 Sayfalar

- [Ana Sayfa](./README.md)
- [Hızlı Başlangıç](./PAYMENT_QUICKSTART.md)
- [Kurulum Rehberi](./PAYMENT_SETUP.md)
- [Sistem Mimarisi](./PAYMENT_ARCHITECTURE.md)
- [Tercüme Anahtarları](./PAYMENT_TRANSLATIONS.md)
- [İmplementasyon Özeti](./PAYMENT_IMPLEMENTATION_SUMMARY.md)
