# 🏗️ Sanal POS Sistem Mimarisi Diyagramları

## 1. Genel Sistem Akışı

```
┌─────────────────────────────────────────────────────────────────┐
│                        KULLANICI ARAYÜZÜ                         │
├─────────────────────────────────────────────────────────────────┤
│                     Checkout Modal                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Teslimat    │→ │  Sipariş     │→ │  Ödeme       │           │
│  │  Bilgileri   │  │  Özeti       │  │  Ekranı      │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      ÖDEME EKRANI (PaymentScreen)               │
├─────────────────────────────────────────────────────────────────┤
│  1. Yöntem Seçimi → 2. Kart/Bilgi → 3. Taksit → 4. Onay       │
│     (Kredi Kartı)      (Form)          (Plan)   (Özet)         │
│     (Taksit)                                                    │
│     (Banka Transferi)                                           │
│     (WhatsApp)                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API KATMANI                                   │
├─────────────────────────────────────────────────────────────────┤
│  /api/payment/process  → Transaction oluştur → Sanal POS'a gönder
│  /api/payment/status   → Transaction durumunu sor              │
│  /api/payment/webhook  → POS callback'lerini işle              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                 SANAL POS SAĞLAYICI                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   PayTR     │  │  iyzipay    │  │   Param     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│  ┌─────────────┐                                               │
│  │  NestPay    │  (Diğer sağlayıcılar eklenebilir)             │
│  └─────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              ÖDEME GEÇİDİ (Payment Gateway)                      │
├─────────────────────────────────────────────────────────────────┤
│  Kredi Kartı Doğrulama → 3D Secure (Varsa) → Banka Hareketi   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ Sonuç
┌─────────────────────────────────────────────────────────────────┐
│              WEBHOOK CALLBACK                                    │
├─────────────────────────────────────────────────────────────────┤
│  /api/payment/webhook ← Status: SUCCESS/FAILED                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│            TRANSACTİON GÜNCELLE                                  │
├─────────────────────────────────────────────────────────────────┤
│  Status: PENDING → PROCESSING → COMPLETED/FAILED               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│            SİPARİŞ TAMAMLA VEYA HATA GÖSTER                      │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Başarılı: Sipariş Durumu = "PAID"                          │
│  ❌ Başarısız: Hata Mesajı Göster & Tekrar Deneyin             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Dosya Yapısı ve Bağlantıları

```
src/
│
├── types/
│   └── payment.ts ◄──────────── Tüm Ödeme Tipleri
│       ├── PaymentProvider (Enum)
│       ├── PaymentMethod (Enum)
│       ├── PaymentStatus (Enum)
│       ├── PaymentTransaction (Interface)
│       ├── PaymentRequest (Interface)
│       └── PaymentResponse (Interface)
│
├── lib/
│   └── payment-config.ts ◄────── POS Konfigürasyonu
│       ├── POS_CONFIGS (PayTR, iyzipay, Param, NestPay)
│       ├── getEnabledPosProvider()
│       ├── getPosConfig()
│       └── createPosProvider()
│
├── components/
│   └── PaymentScreen.tsx ◄────── UI Bileşeni
│       ├── Ödeme Yöntemi Seçimi
│       ├── Kart Bilgileri Formu
│       ├── Taksit Seçimi
│       ├── Onay Ekranı
│       └── Sonuç Ekranı
│
├── app/
│   └── api/
│       └── payment/
│           ├── process/
│           │   └── route.ts ◄─── Transaction Oluştur
│           │       └── POST: Ödeme başlatma
│           │
│           ├── status/
│           │   └── route.ts ◄─── Durum Sorgula
│           │       └── GET: İşlem durumunu sor
│           │
│           ├── webhook/
│           │   └── route.ts ◄─── Webhook Handler
│           │       ├── Imza doğrulama
│           │       ├── Veri parsing
│           │       └── Transaction güncelleme
│           │
│           └── providers/
│               ├── paytr.provider.ts ◄──── PayTR İmplementasyonu
│               ├── iyzipay.provider.ts ◄── iyzipay (Şablon)
│               ├── param.provider.ts ◄─── Param (Şablon)
│               └── nestpay.provider.ts ◄─ NestPay (Şablon)
│
└── messages/
    ├── en.json ◄────── İngilizce Tercümeler
    └── tr.json ◄────── Türkçe Tercümeler
        └── payment: { ... } ◄── Ödeme UI Metinleri
```

---

## 3. Ödeme İşlemi Akış Diyagramı

```
BAŞLA
  │
  ├─→ Kullanıcı "Sipariş Ver" Tıkla
  │     │
  │     └─→ Checkout Modal Aç
  │           │
  │           ├─→ Teslimat Bilgileri Adımı
  │           │     (Mevcut sistem)
  │           │
  │           ├─→ Sipariş Özeti Adımı
  │           │     (Mevcut sistem)
  │           │
  │           └─→ ÖDEME EKRANI (YENİ)
  │                 │
  │                 ├─→ PaymentScreen Yükle
  │                 │
  │                 ├─→ Ödeme Yöntemi Seç
  │                 │     ├─ Kredi Kartı ──┐
  │                 │     ├─ Taksit ────────┤
  │                 │     ├─ Bank Transfer ├─→ Kart Detayları Ekranı
  │                 │     └─ WhatsApp ─────┘
  │                 │
  │                 ├─→ (Kart Seçildiyse) Kart Bilgileri Gir
  │                 │     ├─ Kart Numarası
  │                 │     ├─ Ad Soyad
  │                 │     ├─ Tarih (AA/YY)
  │                 │     └─ CVV
  │                 │
  │                 ├─→ (Taksit Seçildiyse) Taksit Seçimi
  │                 │     └─ 1/2/3/6/9/12 ay seç
  │                 │
  │                 ├─→ Onay Ekranı
  │                 │     ├─ Yöntem: [Selected Method]
  │                 │     ├─ Tutar: ₺[Amount]
  │                 │     ├─ Devam Et ──────┐
  │                 │     └─ İptal ─────────┼──→ KAPAT
  │                 │                       │
  │                 └─→ "DEVAM ET" Tıkla ──┘
  │                       │
  │                       └─→ POST /api/payment/process
  │                             ├─ Body: { order_id, amount, ... }
  │                             │
  │                             ├─→ Kullanıcı Doğrula
  │                             │     └─ User ID kontrol
  │                             │
  │                             ├─→ Transaction Kaydı Oluştur
  │                             │     ├─ Status: PROCESSING
  │                             │     ├─ Amount, Method
  │                             │     └─ Metadata
  │                             │
  │                             └─→ Sanal POS'a İstek Gönder
  │                                   (Provider Factory)
  │                                   │
  │                                   ├─→ PayTR.initializePayment()
  │                                   ├─→ iyzipay.initializePayment()
  │                                   ├─→ Param.initializePayment()
  │                                   └─→ NestPay.initializePayment()
  │                                         │
  │                                         └─→ Response:
  │                                              ├─ transaction_id
  │                                              ├─ payment_url
  │                                              └─ status
  │
  ├─→ POS Ödeme Sayfasına Yönlendir (İVİ)
  │     │
  │     ├─→ Kart Bilgileri Doğrula
  │     │
  │     ├─→ 3D Secure Kontrolü (Varsa)
  │     │
  │     ├─→ Banka İçin İstek Gönder
  │     │
  │     └─→ Sonuç Döner
  │           ├─ ✅ SUCCESS
  │           └─ ❌ FAILED
  │
  ├─→ POS → Webhook Callback
  │     │
  │     └─→ POST /api/payment/webhook
  │           ├─ Headers: x-payment-provider, x-webhook-signature
  │           ├─ Body: { merchant_oid, status, amount, ... }
  │           │
  │           ├─→ İmza Doğrula
  │           │     └─ verifyWebhookSignature()
  │           │
  │           ├─→ Veri Parse Et
  │           │     └─ parseWebhookData()
  │           │
  │           └─→ Transaction Güncelle
  │                 ├─ Status: COMPLETED/FAILED
  │                 ├─ payment_gateway_reference
  │                 ├─ completed_at
  │                 └─ error_message (varsa)
  │
  ├─→ Sonuç Göster
  │     ├─ ✅ Başarılı:
  │     │     ├─ "Ödeme Başarılı" Mesajı
  │     │     ├─ Transaction ID
  │     │     ├─ Sepeti Temizle
  │     │     ├─ Modal Kapat
  │     │     └─ Sipariş Tamamlansın
  │     │
  │     └─ ❌ Başarısız:
  │           ├─ Hata Mesajı Göster
  │           ├─ "Tekrar Dene" Butonu
  │           └─ Seçeneklere Dön
  │
  └─→ BİTİŞ
```

---

## 4. Database Şeması

```sql
payment_transactions
├── id (TEXT, PRIMARY KEY)          -- txn_[timestamp]_[random]
├── order_id (INTEGER, FK)          → orders.id
├── user_id (TEXT, FK)              → auth.users.id
│
├── payment_method (VARCHAR)         -- credit_card, installment, etc
├── payment_provider (VARCHAR)       -- paytr, iyzipay, param, nestpay
├── amount (DECIMAL)                 -- ₺1500.00
├── currency (VARCHAR)               -- TRY, EUR, USD
│
├── card_last_four (VARCHAR)         -- Maskelenmiş: ****1234
├── card_type (VARCHAR)              -- VISA, MASTERCARD, AMEX
├── card_holder_name (TEXT)          -- John Doe
│
├── status (VARCHAR)                 -- pending, processing, completed, failed
├── transaction_reference (TEXT)     -- POS'tan gelen ref
├── payment_gateway_reference (TEXT) -- Ödeme geçidi ref
├── error_code (TEXT)                -- 0000, E0001, etc
├── error_message (TEXT)             -- Hata mesajı
│
├── installment_count (INTEGER)      -- 1, 2, 3, 6, 9, 12
├── installment_amount (DECIMAL)     -- ₺250.00 (monthly)
│
├── created_at (TIMESTAMP)           -- Oluşturulma tarihi
├── updated_at (TIMESTAMP)           -- Güncellenme tarihi
├── completed_at (TIMESTAMP)         -- Tamamlanma tarihi
│
└── metadata (JSONB)                 -- {user_agent, ip_address, ...}
```

---

## 5. API Endpoints Haritası

```
┌─ POST /api/payment/process
│   ├─ Request Body:
│   │   {
│   │     order_id: 123,
│   │     amount: 1500.00,
│   │     currency: "TRY",
│   │     payment_method: "credit_card",
│   │     card_data: { ... },
│   │     installment_count: 3
│   │   }
│   │
│   └─ Response:
│       {
│         success: true,
│         transaction_id: "txn_...",
│         status: "processing",
│         payment_url: "https://paytr.com/..."
│       }
│
├─ GET /api/payment/status?transactionId=txn_...
│   └─ Response:
│       {
│         id: "txn_...",
│         status: "completed",
│         amount: 1500.00,
│         currency: "TRY",
│         completed_at: "2024-11-20T10:30:00Z"
│       }
│
├─ POST /api/payment/webhook
│   ├─ Headers:
│   │   x-payment-provider: "paytr"
│   │   x-webhook-signature: "hash..."
│   │
│   ├─ Body (PayTR örneği):
│   │   {
│   │     merchant_oid: "123",
│   │     transaction_id: "paytr_...",
│   │     status: "success",
│   │     amount: 150000
│   │   }
│   │
│   └─ Response:
│       {
│         success: true,
│         message: "Webhook processed successfully"
│       }
│
└─ POST /api/payment/refund (İleride)
    ├─ Request:
    │   {
    │     transaction_id: "txn_...",
    │     amount: 1500.00
    │   }
    │
    └─ Response:
        {
          success: true,
          reference: "ref_..."
        }
```

---

## 6. State Machine (İşlem Durumu)

```
         ┌──────────────┐
         │   PENDING    │◄──── BAŞLANGAÇ
         └──────┬───────┘
                │ Transaction Oluştur
                ↓
         ┌──────────────┐
         │  PROCESSING  │◄──── İşlemde
         └──────┬───────┘
                │
         ┌──────┴────────┐
         │               │
         ↓               ↓
    ┌─────────┐    ┌──────────┐
    │COMPLETED│    │  FAILED  │
    └─────────┘    └──────────┘
         │               │
         │               ├─→ Tekrar Dene
         │               │
         │               └─→ İptal Et
         │
         └─→ Sipariş Tamamla
             └─→ PAID (orders tablosunda)
```

---

## 7. Entegrasyon Yolları

```
SENARYO 1: Kredi Kartı ile Ödeme
  User → PaymentScreen → Form → /api/payment/process
  → PayTR → 3D Secure (varsa) → Webhook
  → Transaction UPDATE → Sipariş Tamamla ✅

SENARYO 2: Taksit ile Ödeme
  User → PaymentScreen → Taksit Seç (6 ay) → Form
  → /api/payment/process → PayTR (installment_count=6)
  → Webhook → Transaction UPDATE → Sipariş Tamamla ✅

SENARYO 3: Başarısız Ödeme
  User → PaymentScreen → Form → /api/payment/process
  → PayTR → ❌ DECLINED
  → Webhook (status=failed) → Transaction UPDATE
  → Error Mesajı → Tekrar Deneyin ❌

SENARYO 4: WhatsApp Siparişi (Mevcut)
  User → PaymentScreen → WhatsApp Seç
  → WhatsApp Message Oluştur
  → Yeni Sekmede Aç → Message Gönder
```

---

Bu diyagramlar sistem mimarisini görsel olarak anlamaya yardımcı olabilir.
