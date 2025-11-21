# 🚀 Hızlı Başlangıç - Sanal POS Entegrasyonu

**Bu rehber, sanal POS sistemini 30 dakika içinde etkinleştirmeniz için yardımcı olacaktır.**

---

## ⏱️ Adım 1: Sanal POS Seçimi (5 dk)

Aşağıdakilerden birini seçin:

| POS          | Avantajları                              | Dezavantajları    |
| ------------ | ---------------------------------------- | ----------------- |
| **PayTR** ⭐ | Türkiye odaklı, iyi doküman, düşük ücret | -                 |
| **iyzipay**  | Global destek, birçok ödeme yöntemi      | Biraz daha pahalı |
| **Param**    | Stabil, geniş banka desteği              | Eski sistem       |
| **NestPay**  | Enterprise çözümleri                     | Kompleks kurulum  |

### Önerimiz: **PayTR**

- Türkiye pazarında en popüler
- En iyi dokümantasyon
- Düşük komisyon oranları
- Hızlı onboarding

---

## ⏱️ Adım 2: Hesap Açma (10 dk)

1. POS sağlayıcının web sitesine git
2. Ticari hesap aç
3. Kimlik doğrulaması yap
4. Aşağıdaki bilgileri kopyala:
   ```
   - Merchant ID
   - API Key
   - API Secret
   - Webhook Secret (varsa)
   ```

---

## ⏱️ Adım 3: Environment Değişkenleri (3 dk)

Proje kök klasöründe `.env.local` dosyasını aç:

```bash
# PayTR örneği
PAYTR_API_KEY=your_api_key_here
PAYTR_MERCHANT_ID=your_merchant_id_here
PAYTR_API_SECRET=your_api_secret_here
PAYTR_WEBHOOK_SECRET=your_webhook_secret_here
PAYTR_WEBHOOK_URL=https://yourdomain.com/api/payment/webhook
PAYTR_RETURN_URL=https://yourdomain.com/en/orders
```

---

## ⏱️ Adım 4: Konfigürasyon Etkinleştir (1 dk)

`src/lib/payment-config.ts` dosyasını aç ve PayTR satırını bul:

**ÖNCE:**

```typescript
paytr: {
  provider: 'paytr' as any,
  enabled: false,  // ← BURAYA BAK
  // ...
}
```

**SONRA:**

```typescript
paytr: {
  provider: 'paytr' as any,
  enabled: true,   // ← BU SATIRI DEĞIŞTIR
  // ...
}
```

---

## ⏱️ Adım 5: Database Tablosu (3 dk)

Supabase paneline git:

1. SQL Editor'ı aç
2. Aşağıdaki SQL'i yapıştır:

```sql
CREATE TABLE IF NOT EXISTS payment_transactions (
  id TEXT PRIMARY KEY,
  order_id INTEGER NOT NULL,
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

  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE INDEX idx_payment_order ON payment_transactions(order_id);
CREATE INDEX idx_payment_user ON payment_transactions(user_id);
CREATE INDEX idx_payment_status ON payment_transactions(status);
```

3. Çalıştır

---

## ⏱️ Adım 6: Tercümeleri Ekle (5 dk)

`messages/tr.json` dosyasını aç ve dosya sonundaki `}` işaretinden önce ekle:

```json
,
  "payment": {
    "title": "Ödeme",
    "amount": "Tutar",
    "selectMethod": "Ödeme Yöntemini Seçin",
    "method": {
      "creditCard": "Kredi Kartı",
      "creditCardDesc": "Debit/Kredi kartıyla ödeme yapın",
      "installment": "Taksit",
      "installmentDesc": "Taksit ile ödeme yapın (12 aya kadar)",
      "bankTransfer": "Banka Transferi",
      "bankTransferDesc": "Direkt banka transferi",
      "whatsapp": "WhatsApp ile Sipariş",
      "whatsappDesc": "Siparişinizi tamamlamak için bize WhatsApp'tan ulaşın"
    },
    "paymentMethod": "Ödeme Yöntemi",
    "totalAmount": "Toplam Tutar",
    "selectInstallment": "Taksit Planını Seçin",
    "monthlyAmount": "Aylık Tutar",
    "fee": "ek ücret",
    "card": {
      "cardNumber": "Kart Numarası",
      "holderName": "Kart Sahibinin Adı",
      "month": "Ay",
      "year": "Yıl",
      "cvv": "CVV"
    },
    "back": "Geri",
    "next": "Devam Et",
    "cancel": "İptal",
    "pay": "Şimdi Öde",
    "processing": "İşleniyor...",
    "sending": "Gönderiliyor...",
    "success": "Ödeme Başarılı",
    "successMessage": "Ödemeniz başarıyla işlenmiştir. Siparişiniz hazırlanmaktadır.",
    "failed": "Ödeme Başarısız",
    "failedMessage": "Ödemeniz işlenemiyor. Lütfen tekrar deneyin veya bizimle iletişime geçin.",
    "tryAgain": "Tekrar Dene",
    "transactionId": "İşlem Numarası",
    "orderWithWhatsApp": "WhatsApp ile Sipariş Ver",
    "errors": {
      "title": "Hata",
      "invalidCardNumber": "Lütfen 16 haneli geçerli bir kart numarası girin",
      "cardHolderRequired": "Lütfen kart sahibinin adını girin",
      "expiryRequired": "Lütfen kart son kullanma tarihini girin",
      "invalidCvv": "Lütfen geçerli bir CVV girin (3-4 haneli)",
      "paymentFailed": "Ödeme başarısız oldu. Lütfen tekrar deneyin.",
      "unknown": "Beklenmeyen bir hata oluştu"
    },
    "installment": {
      "option1": "1 Taksit - Hemen Ödeme",
      "option2": "2 Taksit",
      "option3": "3 Taksit",
      "option6": "6 Taksit",
      "option9": "9 Taksit",
      "option12": "12 Taksit"
    }
  }
```

Aynı şeyi `messages/en.json` için de yap (İngilizce tercümeler için `PAYMENT_TRANSLATIONS.md` dosyasını kontrol et)

---

## ⏱️ Adım 7: Checkout Modal'a Entegrasyon (3 dk)

`src/components/CheckoutModal.tsx` dosyasının üst kısmına ekle:

```typescript
import PaymentScreen from "./PaymentScreen";
```

Modal'ın içinde ödeme adımını ekle (summary adımından önce):

```tsx
{step === 'address' ? (
  // Mevcut address form
) : step === 'payment' ? (
  <PaymentScreen
    orderId={orderId}
    amount={getTotalPrice()}
    currency="TRY"
    onSuccess={handlePaymentSuccess}
    onError={handlePaymentError}
    onBack={() => setStep('summary')}
  />
) : (
  // Mevcut summary
)}
```

Başarılı callback'i ekle:

```typescript
const handlePaymentSuccess = (transactionId: string) => {
  setToast({
    message: "Ödemeniz başarıyla işlenmiştir.",
    type: "success",
  });
  clearCart();
  onClose();
};

const handlePaymentError = (error: string) => {
  setToast({
    message: error,
    type: "error",
  });
};
```

---

## ✅ Test Etme

### 1. Test Kart Numaraları (PayTR)

```
4111 1111 1111 1111 (Başarılı)
5555 5555 5555 4444 (Başarılı)
```

### 2. Test Adımları

1. Ürün ekle → Sepete git
2. Sipariş ver butonuna tıkla
3. Teslimat bilgileri gir
4. Ödeme yöntemini seç
5. Test kart numarasını gir: `4111 1111 1111 1111`
6. Bitiş tarihi: 12/25, CVV: 123
7. Ödeme Yap'ı tıkla

### 3. Webhook Testi (İsteğe bağlı)

```bash
curl -X POST http://localhost:3000/api/payment/webhook \
  -H "Content-Type: application/json" \
  -H "x-payment-provider: paytr" \
  -d '{
    "merchant_oid": "123",
    "transaction_id": "test_123",
    "status": "success",
    "amount": 150000
  }'
```

---

## 🚨 Sorun Giderme

### Problem: "Payment provider is not enabled"

**Çözüm**: `payment-config.ts`'de `enabled: true` olduğundan emin ol

### Problem: Environment variables boş

**Çözüm**: `.env.local` dosyasını kontrol et, değerleri kopyala

### Problem: Database hatası

**Çözüm**: `payment_transactions` tablosunun oluşturulduğundan emin ol

### Problem: "CORS Error"

**Çözüm**: API domain'ini POS sağlayıcıda whitelist'e ekle

---

## 📚 Detaylı Dokümantasyon

Detaylar için:

- `PAYMENT_SETUP.md` - Tam kurulum rehberi
- `PAYMENT_TRANSLATIONS.md` - Tercüme anahtarları
- `PAYMENT_IMPLEMENTATION_SUMMARY.md` - Özet ve best practices

---

## 🎉 Hepsi Bitti!

Artık ödeme sistemi etkin durumdadır. Sonraki adımlar:

1. ✅ Production ortamı ayarı
2. ✅ Gerçek kart'la test etme (Eğer izin verildiyse)
3. ✅ Error monitoring ekle (Sentry vb.)
4. ✅ Email bildirimleri ekle
5. ✅ Live olarak yayınla

---

**Herhangi bir soru?**
Dokümentasyonların tamamını projenin kök klasöründe bulabilirsiniz.
