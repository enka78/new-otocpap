# Sanal POS (Virtual Payment Gateway) Entegrasyonu - Kurulum Rehberi

Bu dokümantasyon, OtoCPAP web sitesine sanal POS ödeme sistemi entegrasyonunun nasıl yapılacağını açıklamaktadır.

## 📋 İçerik Tablosu

1. [Mevcut Durum](#mevcut-durum)
2. [Sistem Mimarisi](#sistem-mimarisi)
3. [Desteklenen Sanal POS Sağlayıcıları](#desteklenen-sanal-pos-sağlayıcıları)
4. [Kurulum Adımları](#kurulum-adımları)
5. [API Endpoints](#api-endpoints)
6. [Webhook Entegrasyonu](#webhook-entegrasyonu)
7. [Sorun Çözme](#sorun-çözme)

## 🔄 Mevcut Durum

### Ödeme Sistemi

- **Şu an kullanılan yöntem**: WhatsApp üzerinden sipariş
- **Yeni sistem**: Sanal POS ile online ödeme (hazırlanıyor)

### Mevcut Yapı

```
Checkout Modal → WhatsApp Gönder → Sipariş Kaydı
```

### Yeni Yapı

```
Checkout Modal → Ödeme Seçimi → Sanal POS → Webhook → Sipariş Tamamlama
```

## 🏗️ Sistem Mimarisi

### Dosya Yapısı

```
src/
├── types/
│   └── payment.ts                    # Ödeme tipleri ve arayüzleri
├── lib/
│   └── payment-config.ts             # POS konfigürasyonu ve fabrika
├── components/
│   └── PaymentScreen.tsx             # Ödeme ekranı bileşeni
└── app/api/payment/
    ├── process/route.ts              # Ödeme başlatma
    ├── status/route.ts               # Durumu sorgulama
    ├── webhook/route.ts              # POS callback'leri
    └── providers/
        └── paytr.provider.ts         # PayTR implementasyonu
```

### Veri Akışı

```
1. Kullanıcı Checkout'ta Ödeme Tıkla
   ↓
2. PaymentScreen Yüklenir
   ↓
3. Ödeme Yöntemi Seçimi (Kart, Taksit, Bank Transfer, WhatsApp)
   ↓
4. Kart Bilgileri Girişi (Gerekirse)
   ↓
5. Onay Ekranı
   ↓
6. /api/payment/process'e İstek Gönder
   ↓
7. Transaction Kaydı Oluştur (PROCESSING)
   ↓
8. Sanal POS'a İstek Gönder
   ↓
9. POS Webhook Callback (Sonuç)
   ↓
10. Transaction Güncelle (COMPLETED/FAILED)
    ↓
11. Sipariş Tamamla veya Hata Göster
```

## 🏦 Desteklenen Sanal POS Sağlayıcıları

Sistem aşağıdaki sanal POS sağlayıcılarını destekleyecek şekilde tasarlanmıştır:

### 1. **PayTR** ⭐ (Örnek İmplementasyon)

- **Hazırlanmış**: Evet (paytr.provider.ts)
- **API Dokümanı**: https://www.paytr.com/tr/integration
- **Özellikleri**:
  - Kredi kartı ödeme
  - Taksit seçenekleri (1-12 ay)
  - 3D Secure
  - Webhook desteği

### 2. **iyzipay**

- **Hazırlanmış**: Şablon
- **API Dokümanı**: https://docs.iyzipay.com
- **Özellikleri**:
  - Kredi kartı
  - Taksit
  - Wallet

### 3. **Param**

- **Hazırlanmış**: Şablon
- **API Dokümanı**: https://www.param.com.tr
- **Özellikleri**:
  - Kredi kartı
  - Taksit

### 4. **NestPay**

- **Hazırlanmış**: Şablon
- **API Dokümanı**: https://www.nestpay.net
- **Özellikleri**:
  - Kredi kartı
  - Taksit

## 🚀 Kurulum Adımları

### Aşama 1: Sanal POS Sağlayıcı Seçimi

Aşağıdakilerden birini seçin:

- PayTR
- iyzipay
- Param
- NestPay

### Aşama 2: API Bilgileri Alma

Seçtiğiniz sağlayıcıdan şu bilgileri alın:

- Merchant ID
- API Key / Secret
- Webhook URL
- Return URL

### Aşama 3: Environment Değişkenleri Ayarları

`.env.local` veya `.env.production` dosyasına ekleyin:

```bash
# PayTR Örneği
PAYTR_API_KEY=your_api_key
PAYTR_MERCHANT_ID=your_merchant_id
PAYTR_API_SECRET=your_api_secret
PAYTR_WEBHOOK_SECRET=your_webhook_secret
PAYTR_WEBHOOK_URL=https://yourdomain.com/api/payment/webhook
PAYTR_RETURN_URL=https://yourdomain.com/payment/success

# iyzipay Örneği
IYZIPAY_API_KEY=your_api_key
IYZIPAY_MERCHANT_ID=your_merchant_id
# ... diğer sağlayıcılar benzer şekilde
```

### Aşama 4: Konfigürasyonu Etkinleştirme

`src/lib/payment-config.ts` dosyasını açın ve seçtiğiniz sağlayıcıyı etkinleştirin:

```typescript
export const POS_CONFIGS: Record<string, PaymentConfig> = {
  paytr: {
    provider: "paytr" as any,
    enabled: true, // ← BURAYA BU SATIRINI EKLEYIN
    // ... diğer ayarlar
  },
};
```

### Aşama 5: Checkout Modal'ı Güncelle

`src/components/CheckoutModal.tsx` dosyasında PaymentScreen'i entegre edin:

```tsx
import PaymentScreen from './PaymentScreen';

// ... Modal içinde
{step === 'payment' ? (
  <PaymentScreen
    orderId={orderId}
    amount={getTotalPrice()}
    currency="TRY"
    onSuccess={handlePaymentSuccess}
    onError={handlePaymentError}
    onBack={() => setStep('summary')}
  />
) : (
  // ... diğer adımlar
)}
```

### Aşama 6: Database Tablosu Oluşturma

Supabase SQL Editor'da aşağıdaki komutu çalıştırın:

```sql
-- Payment Transactions Tablosu
CREATE TABLE IF NOT EXISTS payment_transactions (
  id TEXT PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  user_id TEXT NOT NULL,

  payment_method VARCHAR(50) NOT NULL,
  payment_provider VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'TRY',

  card_last_four VARCHAR(4),
  card_type VARCHAR(20),
  card_holder_name TEXT,

  status VARCHAR(50) DEFAULT 'pending',

  transaction_reference TEXT,
  payment_gateway_reference TEXT,
  error_message TEXT,
  error_code TEXT,

  installment_count INTEGER,
  installment_amount DECIMAL(10, 2),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,

  metadata JSONB,

  FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE INDEX idx_payment_order ON payment_transactions(order_id);
CREATE INDEX idx_payment_user ON payment_transactions(user_id);
CREATE INDEX idx_payment_status ON payment_transactions(status);
```

## 📡 API Endpoints

### 1. Ödeme Başlatma

```
POST /api/payment/process
Content-Type: application/json

{
  "order_id": 123,
  "amount": 1500.00,
  "currency": "TRY",
  "payment_method": "credit_card",
  "payment_provider": "paytr",
  "customer_email": "user@example.com",
  "customer_phone": "905551234567",
  "customer_name": "John Doe",
  "card_data": {
    "card_number": "4111111111111111",
    "card_holder_name": "John Doe",
    "expiry_month": "12",
    "expiry_year": "25",
    "cvv": "123"
  },
  "installment_count": 1,
  "return_url": "https://yourdomain.com/payment/return"
}

Yanıt:
{
  "success": true,
  "transaction_id": "txn_1234567890",
  "status": "processing",
  "payment_url": "https://payment-gateway-url.com/pay?token=xyz",
  "message": "Payment initialized successfully"
}
```

### 2. Ödeme Durumunu Sorgulama

```
GET /api/payment/status?transactionId=txn_1234567890

Yanıt:
{
  "id": "txn_1234567890",
  "status": "completed",
  "amount": 1500.00,
  "currency": "TRY",
  "payment_method": "credit_card",
  "completed_at": "2024-11-20T10:30:00Z"
}
```

### 3. İade İşlemi (Refund)

```
POST /api/payment/refund

{
  "transaction_id": "txn_1234567890",
  "amount": 1500.00
}

Yanıt:
{
  "success": true,
  "reference": "ref_123456",
  "message": "Refund processed successfully"
}
```

## 🔔 Webhook Entegrasyonu

### Webhook Alma Yapısı

Sanal POS sağlayıcıları, ödeme tamamlandığında webhook gönderir:

```
POST /api/payment/webhook
Headers:
  x-payment-provider: paytr
  x-webhook-signature: [imzası]

Body:
{
  "merchant_oid": "123",
  "transaction_id": "paytr_tx_123",
  "status": "success",
  "amount": 150000,
  "error_code": null,
  "reason": null
}
```

### Webhook Örneği (PayTR)

```
POST https://yourdomain.com/api/payment/webhook

merchant_oid=123&
transaction_id=paytr_123&
status=success&
amount=150000&
merchant_id=your_merchant_id&
hash=hmac_sha256_hash
```

### Webhook Doğrulama

Sistem otomatik olarak:

1. İmzayı doğrular
2. Verileri parse eder
3. Transaction'u günceller
4. Sipariş durumunu değiştirir

## 🔧 Yeni POS Sağlayıcı Ekleme

### Template

1. Yeni dosya oluşturun: `src/app/api/payment/providers/[provider].provider.ts`

```typescript
import { IPosProvider } from "@/lib/payment-config";
import { PaymentRequest, PaymentResponse } from "@/types/payment";

export class YourProviderProvider implements IPosProvider {
  name = "Your Provider";
  provider = "yourprovider";

  constructor(config: PaymentConfig) {
    // ...
  }

  async initializePayment(request: PaymentRequest): Promise<PaymentResponse> {
    // İmplementasyon
  }

  async getPaymentStatus(transactionId: string): Promise<any> {
    // İmplementasyon
  }

  async refundPayment(
    transactionId: string,
    amount: number
  ): Promise<PaymentResponse> {
    // İmplementasyon
  }

  verifyWebhookSignature(payload: unknown, signature: string): boolean {
    // İmplementasyon
  }

  parseWebhookData(payload: unknown): PaymentWebhook {
    // İmplementasyon
  }
}

export default YourProviderProvider;
```

2. Konfigürasyonu güncelleyin (`payment-config.ts`):

```typescript
yourprovider: {
  provider: 'yourprovider' as any,
  enabled: false,
  api_key: process.env.YOURPROVIDER_API_KEY || '',
  merchant_id: process.env.YOURPROVIDER_MERCHANT_ID || '',
  api_secret: process.env.YOURPROVIDER_API_SECRET || '',
  // ...
}
```

## ❌ Sorun Çözme

### 1. "Payment provider is not enabled" Hatası

**Çözüm**: `payment-config.ts` dosyasında `enabled: true` olduğundan emin olun.

### 2. "Environment variables not found" Hatası

**Çözüm**: `.env.local` dosyasında tüm gerekli değişkenlerin olduğundan emin olun.

### 3. Webhook'u Almıyor

**Çözüm**:

- Webhook URL'sinin doğru olduğundan emin olun
- URL açıksa (proxy arkasında değilse) test edin
- POS dashboard'da webhook'u enable ettiğinizden emin olun
- Imza doğrulamasını devre dışı bırakıp test edin (production'a geçmeden)

### 4. 3D Secure Sayfasına Yönlenmiyor

**Çözüm**:

- Kart tutarının minimum tutardan büyük olduğundan emin olun
- POS hesabında 3D Secure etkin olduğundan emin olun
- Return URL'si doğru ayarlandığından emin olun

## 📚 Kaynaklar

- [PayTR Dokümantasyonu](https://www.paytr.com/tr/integration)
- [iyzipay Dokümantasyonu](https://docs.iyzipay.com)
- [Param Dokümantasyonu](https://www.param.com.tr)
- [NestPay Dokümantasyonu](https://www.nestpay.net)

## ✅ Kontrol Listesi

- [ ] Sanal POS sağlayıcısı seçildi
- [ ] API bilgileri alındı
- [ ] Environment değişkenleri ayarlandı
- [ ] Konfigürasyon etkinleştirildi
- [ ] Database tablosu oluşturuldu
- [ ] Checkout Modal güncellendi
- [ ] Webhook URL'si ayarlandı
- [ ] Test ödemeleri gerçekleştirildi
- [ ] Production'a geçildi

---

**Son Güncelleme**: 20 Kasım 2024
**Durum**: Hazırlanıyor (Sanal POS seçilmeyi bekliyor)
